define(['laydate', 'SimpleCalendar', "pagination", 'moment', 'timeDaterangepicker', 'mySelect', 'rollCall', 'clsaffairPop', "courseAndClass_sel", "photoPop"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_classId, search_courseId, search_status, search_theme, search_shopTeacherId = undefined;
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "desc";
        $scope.searchTime = "";
        $scope.sel_un_upload = $scope.sel_un_comment = $scope.sel_un_homeWk = false;
        $scope.compareType = $scope.compareType1 = false;
        $scope.activityStatus = undefined;
        $scope.checkedHead=[
            {name:"上课时间",checked:true,fixed:"1"},
            {name:"课程",checked:true},
            {name:"班级",checked:true},
            {name:"教室",checked:true},
            {name:"授课课时",checked:true},
            {name:"课次",checked:true},
            {name:"授课老师",checked:true},
            {name:"上课主题",checked:true},
            {name:"点名时间",checked:true},
            {name:"点名老师",checked:true},
            {name:"到课人数",checked:true,fixed:"-1"},
        ];
        init();

        function init() {
            getCourseList();
            getClassList();
            getCourseTheme();
            getTeacherList();
            $scope.scheduleListThead_left = [
                {'name': '上课时间','width': '270','issort': true,'sort': 'asc'},
            ];
            $scope.scheduleListThead = [{
                    'name': '',
                    'width': '270',
                    fixed:"1",
                    td:`<td></td>`
                }, {
                    'name': '课程',
                    'width': '160',
                    td:`<td title="{{x.course.courseName}}">{{x.course.courseName}}</td>`
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
                    td:` <td class="textAlignCenter">{{x.arrangingCoursesTime|number:2}}</td>`
                }, {
                    'name': '课次',
                    'width': '80',
                    'align': 'center',
                    td:`<td class="textAlignCenter">{{x.courseType == 0?x.arrangingCourseOrd:"—"}}</td>`
                }, {
                    'name': '授课老师',
                    'width': '140',
                    td:`<td title="{{x.teacherStr}}">{{x.teacherStr}}</td>`
                }, {
                    'name': '上课主题',
                    'width': '120',
                    td:`<td title="{{x.arrangingCoursesTheme.courseThemeName}}">{{x.arrangingCoursesTheme.courseThemeName}}</td>`
                }, {
                    'name': '点名时间',
                    'width': '120',
                    'issort': true,
                    'id':"updateTime",
                    td:`<td title="{{x.updateTime|yznDate:'yyyy-MM-dd HH:mm'}}">{{x.updateTime|yznDate:'yyyy-MM-dd HH:mm'}}</td>`
                }, {
                    'name': '点名老师',
                    'width': '120',
                    td:`<td title="{{x.namingTeacher.teacherName}}">{{x.namingTeacher.teacherName}}</td>`
                }, {
                    'name': '',
                    'align': 'center',
                    'width': '120',
                    fixed:"-1",
                    td:`<td></td>`
                },
            ];
            $scope.operateClass = checkAuthMenuById("79"); //操作课务
            $scope.courseSelect = courseSelect; //选择课程
            $scope.classSelect = classSelect; //选择班级
            $scope.teacherSelect = teacherSelect; //选择主教老师
            $scope.changeCourseTh = changeCourseTh; //选择上课主题
            $scope.un_uploadShow = un_uploadShow; //未上传展示
            $scope.un_comment = un_comment; //未点评学员
            $scope.un_homeWk = un_homeWk; //未布置作业
            $scope.chargeType = chargeType; //一对一
            $scope.chargeactivityStatus = chargeactivityStatus; //标准班，活动班
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.onReset = onReset; //重置
            $scope.reloadList = reloadList;
            $scope.switchVisitNav = switchVisitNav; //跳转路由
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    $scope.$emit("clsAffair_record", false);
                }
            });
            getListModelInfos(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.export_config = export_config;
//          SERVICE.CUSTOMPOP.TABLE["我的课表-自定义"] = function(data){
//              $scope.checkedHead = data.customTag;
//             
//          }
            $scope.$watch("checkedHead",function(n,o){
                $scope.scheduleListThead_ = getTableHead($scope.checkedHead,$scope.scheduleListThead);
                 $timeout(function(){
                    $scope.reTheadData_['my_scheduleHead']();
                    $scope.$broadcast("my_scheduleTdChange",$scope.checkedHead);
                },100,true)
                
            },true);
        }

        //获取工作台数据
        if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '快捷入口') {

        };

        //跳转路由
        function switchVisitNav(type) {
            switch (type) {
                case 1:
                    $state.go('edu_classAffair');
                    break;
                case 2:
                    $state.go('edu_classAffair/show');
                    break;
                case 3:
                    $state.go('edu_classAffair/comment');
                    break;
                case 4:
                    $state.go('edu_classAffair/houseWk');
                    break;
                case 5:
                    $state.go('edu_classAffair/clock');
                    break;
            }
        }

        function getCourseTheme(id) {
            var param = {
                courseId: id ? id : undefined
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        data.context.unshift({
                            courseThemeName: '无主题'
                        })
                        $scope.courseTheme = data.context;
                    }
                }
            });
        }
        //获取课程列表
        function getCourseList() {
            var p = {
                'pageType': 0,
                'courseStatus': 1,
                'courseType': 0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.courseList = data.context;
                    }
                }
            });
        }
        //获取班级列表
        function getClassList(id) {
            var p = {
                pageType: "0",
                classStatus: "1"
            };
            if (id) {
                p["courseId"] = id;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.classList = data.context;
                    }
                }
            });
        }
        //获取老师列表
        function getTeacherList(id) {
            var p = {};
            var url;
            if (id) {
                p["classId"] = id;
                url = "/api/oa/class/getClassTeacherList";
            } else {
                p["pageType"] = "0";
                p["quartersTypeId"] = "1";
                p["shopTeacherStatus"] = "1";
                url = "/api/oa/shopTeacher/list";

            }
            $.hello({
                url: CONFIG.URL + url,
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context;
                        if (id) {
                            angular.forEach(list, function(v) {
                                v.teacherName = v.shopTeacher.teacherName;
                            });
                        }
                        $scope.teacherList = list;
                    }
                }
            });
        }

        function reloadList() {
            getListModelInfos(start);
        }

        function onReset() {
            search_classId = search_courseId = search_theme = search_shopTeacherId = undefined;
            $scope.searchTime = "";
            $scope.sel_un_upload = $scope.sel_un_comment = $scope.sel_un_homeWk = false;
            $scope.compareType = $scope.compareType1 = false;
            $scope.activityStatus = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
                $scope.$broadcast(i, "clearSearchVal");
            }
            getCourseList();
            getClassList(search_courseId);
            getTeacherList(search_classId);
            getCourseTheme(search_courseId);
            $scope.$emit("clsAffair_record", false);
        }

        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderName = data.id;
            search_orderTyp = data.sort;
            $scope.$emit("clsAffair_record", false);
        }

        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            getClassList(search_courseId);
            getCourseTheme(search_courseId);
            $scope.$emit("clsAffair_record", false);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            getTeacherList(search_classId);
            $scope.$emit("clsAffair_record", false);
        }

        function teacherSelect(t) {
            search_shopTeacherId = t == null ? undefined : t.shopTeacherId;
            $scope.$emit("clsAffair_record", false);
        }

        function changeCourseTh(t) {
            search_theme = t == null ? undefined : t.courseThemeId;
            pagerRender = false;
            getListModelInfos(0, t && !t.courseThemeId);
        }

        function un_uploadShow() {
            if ($scope.sel_un_upload) {
                $scope.sel_un_comment = $scope.sel_un_homeWk = false;
            }
            $scope.$emit("clsAffair_record", false);
        }

        function un_comment() {
            if ($scope.sel_un_comment) {
                $scope.sel_un_upload = $scope.sel_un_homeWk = false;
            }
            $scope.$emit("clsAffair_record", false);
        }

        function un_homeWk() {
            if ($scope.sel_un_homeWk) {
                $scope.sel_un_comment = $scope.sel_un_upload = false;
            }
            $scope.$emit("clsAffair_record", false);
        }

        function chargeType(type) {
            if (type) {
                if ($scope.compareType) {
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                    $scope.activityStatus = undefined;
                }
            } else {
                if ($scope.compareType1) {
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                    $scope.activityStatus = undefined;
                }
            }
            $scope.$emit("clsAffair_record", false);
        }

        function chargeactivityStatus(e, val) {
            if (e.target.checked) {
                $scope.compareType = false;
                $scope.compareType1 = false;
            }
            $scope.activityStatus = e.target.checked ? val : undefined;
            $scope.$emit("clsAffair_record", false);
        }
        $scope.$on("clsAffair_record", function(e, startPage) {
            if (startPage == "true") {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //获取列表数据
        function getListModelInfos(start_, fl) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                "start": start_.toString() || "0",
                "count": eachPage,
                "classId": search_classId,
                "courseId": search_courseId,
                "courseThemeId": search_theme,
                "status": "1",
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "shopTeacherId": search_shopTeacherId,
                "classAffairs": $scope.sel_un_upload ? "0" : $scope.sel_un_comment ? "1" : $scope.sel_un_homeWk ? "2" : undefined,
                "courseListStatus": 0,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'activityStatus': $scope.activityStatus,
                'needNaming':1
            }
            if (fl) { //是否为无主题
                params["noCourseTheme"] = 1;
            }
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/list",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == 200) {
                        console.log(data);
                        angular.forEach(data.context.items, function(v) {
                            v.teacherStr = arrToStr(v.teachers, "teacherName");
                        });
                        $scope.scheduleRecord = data.context.items;
                        schedulePager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
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

        function export_config() {
            if (!$scope.searchTime) {
                return layer.msg('请选择上课时间');
            }
            var token = localStorage.getItem('oa_token');
            var data = {
                "classId": search_classId,
                "courseId": search_courseId,
                "courseThemeId": search_theme,
                "status": "1",
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "shopTeacherId": search_shopTeacherId,
                "classAffairs": $scope.sel_un_upload ? "0" : $scope.sel_un_comment ? "1" : $scope.sel_un_homeWk ? "2" : undefined,
                "courseListStatus": 0,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'activityStatus': $scope.activityStatus,
                "beginTime": $scope.searchTime.split(" 到 ")[0] + " 00:00:00",
                "endTime": $scope.searchTime.split(" 到 ")[1] + " 23:59:59",
                "token": token,
                'needNaming':1
            }
            for (var i in data) {
                if (data[i] == '' || data[i] == undefined) {
                    delete data[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantLessonList?' + $.param(data));
        }
    }];
});