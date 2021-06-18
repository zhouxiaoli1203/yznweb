define(['laydate', 'SimpleCalendar', "pagination", 'moment', 'timeDaterangepicker', 'mySelect', 'rollCall', 'arrangePop', 'clsaffairPop', "timePop", "classPop", 'courseAndClass_sel', "photoPop", "timesel", 'classroomPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_courseId, search_oneShopTeacherId, search_person = undefined;
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "asc";
        $scope.searchTime = Thisweekdate($.format.date(new Date(), "yyyy-MM-dd"));
        $scope.classStatus = undefined;
        init();

        function init() {
            getCourseList();
            getTeacherList();
            getPersonList(); //创建人列表
            $scope.scheduleListThead = [{
                'name': '上课时间',
                'width': '270',
                'issort': true,
                'sort': 'asc'
            }, {
                'name': '课程',
                'width': '30%'
            }, {
                'name': '老师',
                'width': '20%'
            }, {
                'name': '教室',
                'width': '12%'
            }, {
                'name': '实到/应到',
                'width': '12%',
                'align': 'right'
            }, {
                'name': '状态',
                'width': '12%',
                'align': 'center'
            }, {
                'name': '创建人',
                'width': '14%',

            }, {
                'name': '操作',
                'align': 'center',
                'width': '200'
            }, ];
            $scope.bookingSture = getFunctionStatus(0x0002); //约课开关
            $scope.courseSelect = courseSelect; //选择课程
            $scope.teacherSelect = teacherSelect; //选择主教老师
            $scope.personSelect = personSelect; //创建人
            $scope.changeStatus = changeStatus; //已上、未上
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.onReset = onReset; //重置
            $scope.gotolistRollCall = gotolistRollCall; //编辑点名
            $scope.listDelete = listDelete; //删除排课列表
            $scope.deleteSignup = deleteSignup; //取消点名
            $scope.closePopup = closePopup; //关闭弹框
            $scope.switchVisitNav = switchVisitNav; //跳转路由
            $scope.studNavJud = 2;
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getListModelInfos(0);
                }
            });
            getListModelInfos(0);
            $scope.goCommonPop = function(el, id, width, data) {
                    window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                }
                //工作台快捷入口跳转
            if ($scope.$stateParams.screenValue.name == 'workbench' && $scope.$stateParams.screenValue.type == "快捷入口") {
                //          loadPopups($scope, ['arangePop'], function() {  //获取弹框加载完成的监听
                window.$rootScope.yznOpenPopUp($scope, "listen-pop", "set_listenCourse", "660px", { page: "listenlist" });
                //          })
            };
        }
        $scope.$on("clsAffair_schedule", function(e, startPage) {
            if (startPage) {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //跳转路由
        function switchVisitNav(n) {
            $scope.studNavJud = n;
            switch (n) {
                case 1:
                    $state.go("listenRecord");
                    break;
                case 2:
                    $state.go("listenRecord/list")
                    break;
                default:
                    break;
            }
        }

        function closePopup() {
            layer.close(dialog);
        }
        //获取课程列表
        function getCourseList() {
            var p = {
                'pageType': 0,
                'courseStatus': 1
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        var arr = [];
                        angular.forEach(data.context, function(v) {
                            if (v.courseType == 0) {
                                arr.push(v);
                            }
                        });
                        $scope.courseList = arr;
                    }
                }
            });
        }
        //获取老师列表
        function getTeacherList() {
            var p = {};
            p["pageType"] = "0";
            p["quartersTypeId"] = "1";
            p["shopTeacherStatus"] = "1";
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context;
                        $scope.teacherList = list;
                    }
                }
            });
        }

        function getPersonList() {
            var p = {};
            p["pageType"] = "0";
            p["shopTeacherStatus"] = "1";
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context;
                        $scope.personList = list;
                    }
                }
            });
        }

        function onReset() {
            search_courseId = search_oneShopTeacherId = search_person = undefined;
            $scope.classStatus = undefined;
            $scope.searchTime = Thisweekdate($.format.date(new Date(), "yyyy-MM-dd"));
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            pagerRender = false;
            getListModelInfos(0);
        }

        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            pagerRender = false;
            getListModelInfos(0);
        }


        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            pagerRender = false;
            getListModelInfos(0);
        }

        function teacherSelect(t) {
            search_oneShopTeacherId = t == null ? undefined : t.shopTeacherId;
            pagerRender = false;
            getListModelInfos(0);
        }

        function personSelect(t) {
            search_person = t == null ? undefined : t.shopTeacherId;
            pagerRender = false;
            getListModelInfos(0);
        }

        function changeStatus(e, val) {
            $scope.classStatus = e.target.checked ? val : undefined;
            pagerRender = false;
            getListModelInfos(0);
        }
        $scope.$on("scheduleChange", function(e, startPage) {
            if (startPage == "true") {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //获取列表数据
        function getListModelInfos(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                "start": start_.toString() || "0",
                "count": eachPage,
                "courseId": search_courseId,
                "status": $scope.classStatus,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "oneShopTeacherId": search_oneShopTeacherId,
                "courseType": 1,
                "needOperator": 1,
                "needStudentTotal": 1,
                "operatorId": search_person,
                "auditionStatus": 1
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
                        angular.forEach(data.context.items, function(v) {
                            v.teacherStr = arrToStr(v.teachers, "teacherName");
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
            dataRoll['arrangingCourses'] = {};
            dataRoll['classRoom'] = {};
            dataRoll['arrangingCourses']['arrangingCoursesId'] = d.arrangingCoursesId;
            dataRoll['arrangingCourses']['beginDate'] = d.arrangingCoursesBeginDate;
            dataRoll['arrangingCourses']['endDate'] = d.arrangingCoursesEndDate;
            dataRoll['classRoom']['classroomId'] = d.classroomId;
            dataRoll['classRoom']['classRoomName'] = d.classRoomName;
            window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', dataRoll);
        }

        function listDelete(x, deleteStatus) {
            $scope.courseInfo = x;
            var btnArr_ = deleteStatus ? ['查看详情', '确认删除', '取消'] : ['确认删除', '取消'],
                title_ = deleteStatus ? '在课学员列表中含有试听学员、试听学员；是否删除本次排课，删除后无法还原，确认删除？' : '删除试听课会同时将课上的学员试听状态修改为已取消，是否确认删除？';
            detailMsk(title_, function() {
                if (deleteStatus) {
                    window.$rootScope.yznOpenPopUp($scope, "clsaffair-pop", "affair_pop", "960px", { tab: 1, item: x, page: "schedule" });
                } else {
                    confirm_fn1();
                }
            }, function() {
                if (deleteStatus) confirm_fn1(1);
            }, btnArr_);

            function confirm_fn1(deleteStatus_1) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/delete",
                    type: "post",
                    data: JSON.stringify({ "arrangingCoursesId": $scope.courseInfo.arrangingCoursesId, 'deleteStatus': deleteStatus_1 ? deleteStatus_1 : undefined }),
                    success: function(data) {
                        if (data.status == "200") {
                            layer.msg('已成功删除排课', {
                                icon: 1
                            });
                            //                          pagerRender = false;
                            getListModelInfos(start);
                        } else if (data.status == "20022") {
                            listDelete(x, 1);
                            return true;
                        }
                    }
                })
            }
        }

        function deleteSignup(x) {
            var isConfirm = layer.confirm('删除试听课会同时将课上的学员试听状态修改为已取消，是否确认删除？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                resize: false,
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/delete",
                    type: "post",
                    data: JSON.stringify({ "arrangingCoursesId": x.arrangingCoursesId, 'deleteStatus': 1 }),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('已成功删除', {
                                icon: 1
                            });
                            //                          pagerRender = false;
                            getListModelInfos(start);
                        };
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }
    }];
});