define(['laydate',  "pagination",  'mySelect', 'rollCall',  'clsaffairPop', 'customPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', 'SERVICE',function($scope, $rootScope, $http, $state, $stateParams,$timeout,SERVICE) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_classId, search_paikeType = undefined;
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "asc";
        $scope.searchTime = Thisweekdate($.format.date(new Date(), "yyyy-MM-dd"));
        $scope.arrangingCoursesStatus = null;
        $scope.status = null;
        var heads=[
            {name:"上课时间",checked:true,fixed:"1"},
            {name:"课程",checked:true},
            {name:"班级",checked:true},
            {name:"教室",checked:true},
            {name:"授课课时",checked:true},
            {name:"课次",checked:true},
            {name:"老师",checked:true},
            {name:"上课主题",checked:true},
            {name:"备注",checked:false},
            {name:"状态",checked:false},
            {name:"操作",checked:true,fixed:"-1"},
        ];
        init();
        function init() {
            getConfig();
            $scope.paikeType = getConstantList(CONSTANT.SCHEDULETYPE, [0, 1, 2]);
            if($rootScope.fromOrgn){
                $scope.checkedHead= heads;
            }else{
                getCustomTag();
            }
            getClassList();
            $scope.scheduleListThead_left = [
                {'name': '上课时间','width': '270','issort': true,'sort': 'asc'},
            ];
            $scope.scheduleListThead = [{
                    'name': '',
                    'width': '270',
                    'issort': true,
                    'sort': 'asc',
                    fixed:"1",
                    td:`<td></td>`
                }, {
                    'name': '课程',
                    'width': '160',
                    td:`<td title="{{x.classInfo.activityStatus==1?'—':x.course.courseName}}">{{x.classInfo.activityStatus==1?'—':x.course.courseName}}</td>`
                }, {
                    'name': '班级',
                    'width': '160',
                    td:`<td title="{{x.classInfo.className}}">{{x.classInfo.className}}</td>`
                }, {
                    'name': '教室',
                    'width': '120',
                    td:`<td title="{{x.classRoomName}}">{{x.classRoomName}}</td>`
                },{
                    'name': '授课课时',
                    'width': '80',
                    'align': 'right',
                    td:`<td class="textAlignRt">{{x.arrangingCoursesTime}}</td>`
                }, {
                    'name': '课次',
                    'width': '80',
                    'align': 'center',
                    td:`<td class="textAlignCenter">{{(x.courseType == 0||x.courseType == 3)?x.arrangingCourseOrd:"—"}}</td>`
                }, {
                    'name': '老师',
                    'width': '140',
                    td:`<td title="{{x.teacherStr}}">{{x.teacherStr}}</td>`
                }, {
                    'name': '上课主题',
                    'width': '120',
                    td:`<td title="{{x.arrangingCoursesTheme.courseThemeName}}">{{x.arrangingCoursesTheme.courseThemeName}}</td>`
                }, {
                    'name': '备注',
                    'width': '200',
                    td:`<td title="{{x.remark}}">{{x.remark}}</td>`
                }, {
                    'name': '状态',
                    'width': '80',
                    td:`<td>
                            <span ng-class='{"main_color":x.arrangingCoursesStatus!="1"}'>{{x.arrangingCoursesStatus=="1"?"已上":"未上"}}</span>
                        </td>`
                }, {
                    'name': '',
                    'align': 'center',
                    'width': '160',
                    fixed:"-1",
                    td:`<td></td>`
                },
            ];
            $scope.classSelect = classSelect; //选择班级
            $scope.scheduleStatus = scheduleStatus;
            $scope.chargeType = chargeType;
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.pkTypeSelect = pkTypeSelect; //选择排课类型
            $scope.onReset = onReset; //重置
            $scope.gotolistRollCall = gotolistRollCall; //编辑点名
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                pre_next_month:true,
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getListModelInfos(0);
                }
            });
            getListModelInfos(0);
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
            SERVICE.CUSTOMPOP.TABLE["我的课表-自定义"] = function(data){
                $scope.checkedHead = data.customTag;

            }
            $scope.$watch("checkedHead",function(n,o){
                $scope.scheduleListThead_ = getTableHead($scope.checkedHead,$scope.scheduleListThead);
                 $timeout(function(){
                    $scope.reTheadData_['my_scheduleHead']();
                    $scope.$broadcast("my_scheduleTdChange",$scope.checkedHead);
                },100,true)

            },true);

        }
        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.config = data.context.config;
                        $scope.xiukeConfig = $scope.config & "0x0002";
                        console.log($scope.xiuke);
                    }
                }
            })
        }
        //获取各页面的自定义表头  2 oa潜客 3 oa学员 4oa订单 5 oa班级6我的课表
         function getCustomTag(){
                var param={
                    customTagType:6,
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/customTag/info',
                    type: 'get',
                    data: param,
                    success: function(data,d) {
                        if(data.status == "200"){
                            if(data.context && data.context.customTag){
                               $scope.getHeads =  {
                                     customTag:JSON.parse(data.context.customTag),
                                     customTagId:data.context.customTagId
                                 };
                            }
                            $scope.checkedHead= $scope.getHeads?resetHead($scope.getHeads.customTag,heads):heads;
                        }
                    }
                })
        }
        $scope.$on("clsAffair_schedule", function(e, startPage) {
            if (startPage) {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //获取工作台数据
//      if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '快捷入口' && $stateParams.screenValue.tab == 2) {
//          loadPopups($scope, ['arangePop'], function() {
//              window.$rootScope.yznOpenPopUp($scope,"arange-pop","arange_pop", "760px", {
//                  "name": "lesson",
//                  "isSingle": "1",
//                  "title": "快速排课"
//              });
//          })
//      };
//      //获取工作台未点名数据
//      if ($scope.$stateParams.screenValue.type == "待处理") {
//          $timeout(function(){
//              $scope.searchTime = GetDateStr(-60) + " 到 " + GetDateStr(-1);
//              $scope.sel_unclass = true;
//              pagerRender = false;
//              getListModelInfos(0);
//          });
//      };

        //获取班级列表
        function getClassList() {
            $.hello({
                url: CONFIG.URL + "/api/teacher/my/getMyClass",
                type: "get",
                success: function(data) {
                    if (data.status == "200") {
                        $scope.classList = data.context;
                    }
                }
            });
        }


        function onReset() {
            search_classId = search_paikeType = undefined;
            $scope.searchTime = Thisweekdate($.format.date(new Date(), "yyyy-MM-dd"));
            $scope.arrangingCoursesStatus = null;
            $scope.status = null;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            pagerRender = false;
            getListModelInfos(0);
        }
        function pkTypeSelect(p) {
            search_paikeType = p == null ? undefined : p.value;
            pagerRender = false;
            getListModelInfos(0);
        }
        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            pagerRender = false;
            getListModelInfos(0);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            pagerRender = false;
            getListModelInfos(0);
        }
        function scheduleStatus(e,t){
            if(e.target.checked){
                $scope.arrangingCoursesStatus = t;
            }else{
                $scope.arrangingCoursesStatus = null;
            }
            pagerRender = false;
            getListModelInfos(0);
        }

        function chargeType(e,t){
            if(e.target.checked){
                $scope.status = t;
            }else{
                $scope.status = null;
            }
            pagerRender = false;
            getListModelInfos(0);
        }
        $scope.$on("scheduleListChange", function(e, startPage) {
            if (startPage == "true") {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //获取列表数据
        function getListModelInfos(start_) {
            start = start_ == 0?"0":start_;
            var params = {
                "start": start_.toString() || "0",
                "count": eachPage,
                "classId": search_classId,
                "courseType":search_paikeType,
//              1 未课堂评论 2 未作业评论 3 未作业布置 4 课堂展示
                "status": $scope.status?$scope.status : undefined,
                "arrangingCoursesStatus":$scope.arrangingCoursesStatus?$scope.arrangingCoursesStatus:undefined,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
            }
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/myCourse/arrangingCoursesListInOa",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == 200) {
                        angular.forEach(data.context.items, function(v) {
                            v.teacherStr = arrToStr(v.teachers,"teacherName");
                        });
                        $scope.scheduleList = data.context.items;
                        $scope.totalNum = data.context.totalNum;
                        schedulePager(data.context.totalNum);
                    }
                }
            });
        };

        function schedulePager(total) { //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
            var $M_box3 = $('.M-box3');
            $M_box3.pagination({
                totalData: total || 0, // 数据总条数
                showData: eachPage, // 显示几条数据
                jump: true,
                coping: true,
                count: 2, // 当前页前后分页个数
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页',
                callback: function(api) {
                    if (api.getCurrentEach() != eachPage) { //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getListModelInfos(start);
                }
            });

        }


        function gotolistRollCall(d) {
            $scope.sideslipInfos = d;
            var dataRoll = angular.copy(d);
            dataRoll['page'] = "mySchedule";
            dataRoll['arrangingCourses'] = {};
            dataRoll['classRoom'] = {};
            dataRoll['arrangingCourses']['arrangingCoursesId'] = d.arrangingCoursesId;
            dataRoll['arrangingCourses']['beginDate'] = d.arrangingCoursesBeginDate;
            dataRoll['arrangingCourses']['endDate'] = d.arrangingCoursesEndDate;
            dataRoll['classRoom']['classroomId'] = d.classroomId;
            dataRoll['classRoom']['classRoomName'] = d.classRoomName;
            window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', dataRoll);
        }


    }];
});