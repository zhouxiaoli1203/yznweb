define(['laydate', 'SimpleCalendar', 'pagination', 'mySelect', 'remarkPop', 'students_sel', 'arrangePop', 'timesel', 'courseAndClass_sel','classroomPop','potential_pop','bukePop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name, search_courseId, search_classId, search_status = undefined;
        $scope.searchTime = "";
        $scope.absent = $scope.leave = false;
        $scope.kouKeshi = undefined;
        init();

        function init() {
            $scope.viewQingjia = checkAuthMenuById("43");//浏览请假
            $scope.isQingjia = checkAuthMenuById("44");//学员请假
            $scope.viewMakeup = checkAuthMenuById("45");//浏览缺席记录
            $scope.opMakeup = checkAuthMenuById("46");//操作补课
            if(($scope.viewQingjia || $scope.isQingjia) && !$scope.viewMakeup && !$scope.opMakeup){
                $state.go("edu_leave", {
                    });
            }
            $scope.studNavJud = 2;
            getCourseList();
            getClassList();
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、手机号',
                studentNickName: '昵称',
                userPhone: '手机号'
            };
            $scope.nameListThead2 = [{
                'name': '',
                'width': '120'
            }, {
                'name': '',
                'width': '100'
            }, {
                'name': '上课时间',
                'width': '232'
            }, {
                'name': '课程',
                'width': '185'
            }, {
                'name': '班级',
                'width': '185'
            }, {
                'name': '应扣课时',
                'width': '90',
                'align': 'center'
            }, {
                'name': '点名状态',
                'width': '100'
            }, {
                'name': '补课状态',
                'width': '140'
            }, {
                'name': '',
                'width': '240',
            }, ];
            $scope.screen_status2 = [{
                "name": "待处理",
                "id": "0"
            }, {
                "name": "已安排",
                "id": "1"
            }, {
                "name": "线下处理",
                "id": "2"
            }, {
                "name": "已结课",
                "id": "3"
            }, {
                "name": "已补课",
                "id": "9"
            }];
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    leaveMakeUpList(0);
                }
            });
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.changeCourse = changeCourse; //按课程筛选
            $scope.changeClass = changeClass; //按班级筛选
            $scope.changeStatus = changeStatus; //按状态筛选
            $scope.changeKou = changeKou; //按状态筛选
            $scope.changeByAbsent = changeByAbsent; //按去洗筛选
            $scope.changeByLeave = changeByLeave; //按请假筛选
            $scope.SearchData = SearchData; //搜索按钮
            $scope.Enterkeyup = Enterkeyup; //keyup筛选
            $scope.onReset = onReset; //重置

            $scope.gotoHandle = gotoHandle; //处理
            $scope.confirm_procesApply = confirm_procesApply; //确认处理
            $scope.gotoCancelbuke = gotoCancelbuke; //取消补课
            $scope.closeProcesApply = closeProcesApply; //关闭请假申请处理弹框
            $scope.gotoChaban_makeup = gotoChaban_makeup; //打开插班补课
            $scope.gotoViewStudent = gotoViewStudent;//跳转学员详情
            //工作台快捷入口数据跳转
            if($scope.$stateParams.screenValue.name == 'workbench') {
                if($scope.$stateParams.screenValue.type == "快捷入口") {
//                  loadPopups($scope, ['arangePop'], function() {  //获取弹框加载完成的监听
                        window.$rootScope.yznOpenPopUp($scope,"arange-pop","arange_pop","760px",{"name":"leave","isSingle":"0","title":"补课排课","isChangePaike":false})
//                  });
                } else if($scope.$stateParams.screenValue.type == "待处理") {
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['状态']('待处理');
                    });
                    search_status = 0;
                }
            };
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.pop == "补课排课") {
                    $timeout(function () {
                        $scope.goCommonPop("arange-pop", "arange_pop", "760px", { "name": "leave", "isSingle": "0", "title": "补课排课", "isChangePaike": false });
                    })
                }
                if ($scope.$stateParams.screenValue.searchData) {
                    if ($scope.$stateParams.screenValue.from == "edu_student") {
                        search_name = $scope.$stateParams.screenValue.searchData.name;
                        $timeout(function () {
                            $scope.kindSearchOnreset_["makeupsearch"](search_name);
                        });
                    }
                    if ($scope.$stateParams.screenValue.from == "edu_class") {
                        search_classId = $scope.$stateParams.screenValue.searchData.classId;
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['班级']($scope.$stateParams.screenValue.searchData.className);
                        });
                    }
                }
            }
            leaveMakeUpList(0);
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        }

        function gotoViewStudent(x){
            if(checkAuthMenuById("29")){
                window.$rootScope.yznOpenPopUp($scope,'pot-pop', 'potential_pop','1060px',{'page':1,'item':x,'tab':1});
            }else{
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览学员权限。");
            }
        }
        //获取课程列表
        function getCourseList(){
             var p = {
                'pageType': 0,
                'courseStatus': 1,
                'courseType':0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: p,
                success: function (data) {
                    if (data.status == "200") {
                        $scope.screen_course = data.context;

                    }
                }
            });
        }
        //获取班级列表
        function getClassList(id) {
            var p={
                pageType:"0",
                activityStatus:0,
            };
            if(id){
                p["courseId"] =  id;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_class = data.context;
                    }
                }
            });
        }

        function switchStudNav(n) {
            $scope.leaveList = [];
            $scope.studNavJud = n;
            search_status = undefined;
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $state.go("edu_leave", {});
            } else {
                $state.go("edu_leave/makeup", {});
            }
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function SearchData(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function Enterkeyup(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function changeCourse(c) {
            $scope.screen_goReset['班级']('');
            search_courseId = c == null ? undefined : c.courseId;
            pagerRender = false;
            getClassList(search_courseId);
            leaveMakeUpList(0);
        }
        function changeClass(c) {
            search_classId = c == null ? undefined : c.classId;
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function changeStatus(s) {
            search_status = s == null ? undefined : s.id;
            pagerRender = false;
            leaveMakeUpList(0);
        }
        function changeKou(e,v){
            $scope.kouKeshi = e.target.checked?v:undefined;
            pagerRender = false;
            leaveMakeUpList(0);
        }
        function changeByAbsent() {
            $scope.absent?$scope.leave = false:"";
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function changeByLeave() {
            $scope.leave ?$scope.absent= false:"";
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function onReset() {
            search_type = search_name = search_courseId = search_classId = search_status = undefined;
            $scope.absent = $scope.leave = false;
            $scope.kouKeshi = undefined;
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            getClassList(search_courseId);
            pagerRender = false;
            leaveMakeUpList(0);
        }
        $scope.$on("leaveChange", function(evt, isOldPage) {
            if (isOldPage) {
                leaveMakeUpList(start);
            } else {
                pagerRender = false;
                leaveMakeUpList(0);
            }
        });

        function leaveMakeUpList(start_) { //获取请假补课列表信息
            start = start_ == 0?"0":start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                'searchType': search_name?'appSearchName':undefined,
                "searchName": search_name,
                "bukeStatus": search_status,
                "courseId": search_courseId,
                "classId": search_classId,
                "studentStatus": $scope.absent? "0" : $scope.leave ? "2" : "0,2",
                "courseTimeStatus":$scope.kouKeshi
            }
            if ($scope.searchTime) {
                data["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                data["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + '/api/oa/leave/makeUp/list',
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.leaveList = data.context.items;
                        leavePager(data.context.totalNum);
                    }

                }
            })
        }

        function leavePager(total) { //分页
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
                    leaveMakeUpList(start); //回调
                }
            });

        }

        //以下是处理
        function gotoHandle(x) {
            if((x.buyTime*1+x.giveTime*1)>0){
                $scope.kouornot = 0;
            }else{
                $scope.kouornot = 1;
            }
            $scope.makeup_Process = angular.copy(x);
            getTeachersList();
            getMakeupTeacher(x);
            openProcessPop("补课处理", ".procesApply_pop","660px");
            //          $scope.isProcesApply = false;

            $scope.clickTeacher = clickTeacher;
            $scope.leaveTeacherDesc = "已线下完成补课";
//          laydate.render({
//              elem: '#absentDate', //指定元素
//              isRange: false,
//              type: "datetime",
//              trigger: 'click',
//              done: function(value) {
//                  $scope.absentDate = value;
//              }
//          });
            function clickTeacher(n){
                $scope.makeup_Process["absentShopTeacherId"] = n != null ?n.shopTeacherId:undefined;
            }
        }
        function getMakeupTeacher(x){
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/makeUp/teacherInfo",
                type: "get",
                data:{"arrangingCoursesId":x.arrangingCoursesId},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.makeup_Process.absentShopTeacherName = data.context.teacherName;
                        $scope.makeup_Process.absentShopTeacherId = data.context.shopTeacherId;
                    }

                }
            })
        }
        function getTeachersList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data:{"pageType":"0","shopTeacherStatus":"1","quartersTypeId":"1"},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.teacherList = data.context;
                    }

                }
            })
        }
        function confirm_procesApply() {
            var param = {
                studentCourseTimeInfoId: $scope.makeup_Process.studentCourseTimeInfoId,
//              absentShopTeacherId:$scope.makeup_Process.absentShopTeacherId,
//              absentTeacherDate:$scope.absentDate?yznDateFormatYMdHms($scope.absentDate):undefined,
                absentTeacherDesc: $scope.leaveTeacherDesc,
                absentTimeStatus:$scope.kouornot
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/makeUp/update",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        closeProcesApply();
                        $scope.$emit('leaveChange', true);
                    };
                }
            })
        }
        var isProcessPop;

        function openProcessPop(title, div) {
            isProcessPop = layer.open({
                type: 1,
                title: title,
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(div)
            })
        }

        function closeProcesApply() {
            layer.close(isProcessPop);
        }

        function gotoCancelbuke(x, type) {
            var isConfirm = layer.confirm(type == "makeup" ? '学员已安排补课记录，是否取消该补课记录？' : '是否取消处理本条缺课记录？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                resize: false,
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var param = {
                    "studentCourseTimeInfoId": x.studentCourseTimeInfoId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/leave/makeUp/cancel",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('已成功取消补课', {
                                icon: 1
                            });
                            $scope.$emit('leaveChange', false);
                        };
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }
        //插班补课
        function gotoChaban_makeup(x) {
            $scope.chabanData_makeup = x;
        }
        $scope.$on("插班补课", function(evt, x) {
            var param = {
                "studentCourseTimeInfoId": $scope.chabanData_makeup.studentCourseTimeInfoId,
                "makeUparrAngingCourses": {
                    "arrangingCoursesId": x.arrangingCoursesId,
                }
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/makeUp/addMakeUpStudent",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg('已插班补课', {
                            icon: 1
                        });
                        $scope.$emit('leaveChange', true);
                    };
                }
            })
        });
    }]
})