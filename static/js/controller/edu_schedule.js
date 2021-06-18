define(['laydate', 'SimpleCalendar', "pagination", 'moment', 'timeDaterangepicker', 'mySelect', 'rollCall', 'arrangePop', 'clsaffairPop', "timePop", "classPop", 'courseAndClass_sel', "photoPop", "timesel", 'classroomPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_paikeType, search_classId, search_courseId, search_status, search_theme, search_oneShopTeacherId, search_twoShopTeacherId = undefined;
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "asc";
        $scope.searchTime = yznDateFormatYMd(new Date()) + " 到 " + yznDateFormatYMd(new Date());
        $scope.sel_inclass = $scope.sel_unclass = false;
        $scope.compareType = false;
        $scope.compareType1 = false;
        $scope.appoint = false;
        $scope.activityStatus = undefined;
        init();

        function init() {
            $scope.select_params = []; //已选勾选数据
            getCourseList();
            getCourseTheme();
            getClassList();
            getTeacherList();
            $scope.paikeType = getConstantList(CONSTANT.SCHEDULETYPE, [0, 1, 2]);
            $scope.scheduleListThead = [
                { name: 'checkbox', width: '50', align: 'center' },
                {
                    'name': '上课时间',
                    'width': '270',
                    'issort': true,
                    'sort': 'asc'
                }, {
                    'name': '课程',
                    'width': '18%'
                }, {
                    'name': '班级',
                    'width': '18%'
                }, {
                    'name': '教室',
                    'width': '9%'
                },
                {
                    'name': '授课课时',
                    'width': '80',
                    'align': 'right'

                }, {
                    'name': '老师',
                    'width': '10%'
                }, {
                    'name': '上课主题',
                    'width': '15%'
                }, {
                    'name': '状态',
                    'width': '10%'
                }, {
                    'name': '实到/应到',
                    'width': '80',
                    'align': 'center'
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '180'
                },
            ];
            $scope.bookingSture = getFunctionStatus(0x0002); //约课开关
            $scope.changePaike = checkAuthMenuById("37"); //变更排课权限
            $scope.fastPaike = checkAuthMenuById("38"); //快速排课权限
            $scope.pkTypeSelect = pkTypeSelect; //选择排课类型
            $scope.courseSelect = courseSelect; //选择课程
            $scope.classSelect = classSelect; //选择班级
            $scope.changeCourseTh = changeCourseTh; //选择上课主题
            $scope.teacherSelect = teacherSelect; //选择主教老师
            $scope.teacherSelect_ = teacherSelect_; //选择助教老师
            $scope.inclass = inclass; //已上
            $scope.unclass = unclass; //未上
            $scope.chargeType = chargeType; //一对一
            $scope.chargeClassType = chargeClassType; //标准班，活动班
            $scope.chargeAppoint = chargeAppoint; //约课
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.onReset = onReset; //重置
            $scope.exportSchedule = exportSchedule; //导出课表
            $scope.paikeShunyan = paikeShunyan; //排课顺延
            $scope.gotolistRollCall = gotolistRollCall; //编辑点名
            $scope.reloadList = reloadList;
            $scope.listDelete = listDelete; //删除排课列表
            $scope.deleteSignup = deleteSignup; //取消点名
            $scope.closePopup = closePopup; //关闭弹框
            $scope.switchVisitNav = switchVisitNav; //跳转路由
            $scope.batchOperate = batchOperate; //批量操作
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
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
            $scope.sel_allFun = function(c) {
                checkboxAllFun(c, $scope.scheduleList, $scope.select_params, 'arrangingCoursesId', true);
            }
            $scope.goCommonPop = function(el, id, width, data) {
                    window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                }
                //获取工作台数据
            if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '快捷入口' && $stateParams.screenValue.tab == 2) {
                //          loadPopups($scope, ['arangePop'], function() {
                window.$rootScope.yznOpenPopUp($scope, "arange-pop", "arange_pop", "760px", {
                    "name": "lesson",
                    "isSingle": "1",
                    "title": "快速排课"
                });
                //          })
            };
            //获取工作台未点名数据
            if ($scope.$stateParams.screenValue.type == "待处理") {
                $scope.searchTime = GetDateStr(-60) + " 到 " + GetDateStr(-1);
                $scope.sel_unclass = true;
            };
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "快速排课") {
                    setTimeout(function () {
                        $scope.goCommonPop("arange-pop", "arange_pop", "760px", { "pop": "paike", "name": "lesson", "isSingle": "1", "title": "快速排课" });
                    })
                }

            }
            getListModelInfos(0);
        }
        $scope.$on("clsAffair_schedule", function(e, startPage) {
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
            if (startPage) {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });

        //跳转路由
        function switchVisitNav(type) {
            switch (type) {
                case 1:
                    $state.go('edu_schedule');
                    break;
                case 2:
                    $state.go('edu_schedule/chart');
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
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
            getListModelInfos(start);
        }

        function onReset() {
            search_paikeType = search_classId = search_courseId = search_theme = search_oneShopTeacherId = search_twoShopTeacherId = undefined;
            $scope.searchTime = yznDateFormatYMd(new Date()) + " 到 " + yznDateFormatYMd(new Date());
            $scope.sel_inclass = $scope.sel_unclass = false;
            $scope.compareType = false;
            $scope.compareType1 = false;
            $scope.appoint = false;
            $scope.activityStatus = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            getClassList(search_courseId);
            getCourseTheme(search_courseId);
            pagerRender = false;
            getListModelInfos(0);
            //          reloadList(); //重载课表列表
        }

        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            pagerRender = false;
            getListModelInfos(0);
        }

        function pkTypeSelect(p) {
            search_paikeType = p == null ? undefined : p.value;
            pagerRender = false;
            getListModelInfos(0);
        }

        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            getClassList(search_courseId);
            getCourseTheme(search_courseId);
            pagerRender = false;
            getListModelInfos(0);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            getTeacherList(search_classId);
            pagerRender = false;
            getListModelInfos(0);
        }

        function changeCourseTh(t) {
            search_theme = t;
            pagerRender = false;
            getListModelInfos(0);
        }

        function teacherSelect(t) {
            search_oneShopTeacherId = t == null ? undefined : t.shopTeacherId;
            pagerRender = false;
            getListModelInfos(0);
        }

        function teacherSelect_(t) {
            search_twoShopTeacherId = t == null ? undefined : t.shopTeacherId;
            pagerRender = false;
            getListModelInfos(0);
        }

        function inclass() {
            if ($scope.sel_inclass) {
                $scope.sel_unclass = false;
            }
            pagerRender = false;
            getListModelInfos(0);
        }

        function unclass() {
            if ($scope.sel_unclass) {
                $scope.sel_inclass = false;
            }
            pagerRender = false;
            getListModelInfos(0);
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
            pagerRender = false;
            getListModelInfos(0);
        }

        function chargeClassType(e, val) {
            if (e.target.checked) {
                $scope.compareType = false;
                $scope.compareType1 = false;
            }
            $scope.activityStatus = e.target.checked ? val : undefined;
            pagerRender = false;
            getListModelInfos(0);
        }

        function chargeAppoint() {
            pagerRender = false;
            getListModelInfos(0);
        }
        $scope.$on("scheduleChange", function(e, startPage) {
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
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
                "classId": search_classId,
                "courseId": search_courseId,
                "courseThemeId": search_theme ? search_theme.courseThemeId : undefined,
                "status": $scope.sel_inclass ? "1" : $scope.sel_unclass ? "0" : undefined,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "oneShopTeacherId": search_oneShopTeacherId,
                "twoShopTeacherId": search_twoShopTeacherId,
                "courseType": search_paikeType,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'bookingStatus': $scope.appoint ? "1" : undefined,
                'activityStatus': $scope.activityStatus,
                "needStudentTotal": 1,
            }
            if (search_theme && search_theme.courseThemeName == '无主题') { //是否为无主题
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
                        angular.forEach(data.context.items, function(v) {
                            v.teacherStr = arrToStr(v.teachers, "teacherName");
                            if (v.arrangingCoursesStatus == 1) {
                                v.disabled = true;
                            }
                        });
                        $scope.scheduleList = data.context.items;
                        //                      $scope.totalNum = data.context.totalNum;
                        repeatLists($scope.scheduleList, $scope.select_params, 'arrangingCoursesId');
                        schedulePager(data.context.totalNum);
                    }
                }
            });
        };

        function schedulePager(total) { //分页
            var len = 0;
            angular.forEach($scope.scheduleList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.scheduleList.length > 0 && $scope.scheduleList.length == len) {
                $scope.resetCheckboxDir(true);
            } else {
                $scope.resetCheckboxDir(false);
            }
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
            // $.hello({
            //     url: CONFIG.URL + "/api/oa/student/getRollCallStudents",
            //     type: "get",
            //     data: {
            //         arrangingCoursesId: d.arrangingCoursesId
            //     },
            //     success: function(data) {
            //         if (data.status == 200) {
            //             dataRoll.rollcallStudent_1 = []; //本班
            //             dataRoll.rollcallStudent_2 = []; //临时
            //             dataRoll.rollcallStudent_3 = []; //补课
            //             dataRoll.rollcallStudent_4 = []; //试听
            //             angular.forEach(data.context, function(val) {
            //                 switch (val.studentType) {
            //                     case '0':
            //                         dataRoll.rollcallStudent_1.push(val);
            //                         break;
            //                     case '1':
            //                         dataRoll.rollcallStudent_4.push(val);
            //                         break;
            //                     case '2':
            //                         dataRoll.rollcallStudent_3.push(val);
            //                         break;
            //                     case '3':
            //                         dataRoll.rollcallStudent_2.push(val);
            //                         break;
            //                 }
            //             })
            //         }
            //     }
            // });
            window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', dataRoll);
        }

        function listDelete(x, deleteStatus) {
            $scope.courseInfo = x;
            var btnArr_ = deleteStatus ? ['查看详情', '确认删除', '取消'] : ['确认删除', '取消'],
                title_ = deleteStatus ? '在课学员列表中含有试听学员、临时学员、补课学员、约课学员；是否删除本次排课，删除后无法还原，确认删除？' : '是否删除本次排课，删除后无法还原，确认删除？';
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
            var isConfirm = layer.confirm('课次删除后点名记录、课堂展示、课堂点评、课后作业以及家长提交的作业将被删除，删除后无法还原，确认删除？', {
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

        function exportSchedule(name) {
            if (!$scope.searchTime) {
                layer.msg("请选择上课时间");
                return;
            }
            var token = localStorage.getItem('oa_token');
            var beginTime = $scope.searchTime.split(" 到")[0].trim() + " 00:00:00";
            var endTime = $scope.searchTime.split(" 到")[1].trim() + " 23:59:59";
            //          var status;
            //          var endTimeDay = endTime.replace(/-/ig, "");
            //          var endMonthDay = yznMonthAdd(beginTime, 8).replace(/-/ig, "");
            //          if (endTimeDay > endMonthDay) {
            //              layer.msg("最多可导出8个月课表数据，请修改课表导出时间");
            //              return;
            //          }
            var params = {
                "beginTime": beginTime,
                "endTime": endTime,
                "token": token,
                "classId": search_classId,
                "courseId": search_courseId,
                "courseThemeId": search_theme,
                "status": $scope.sel_inclass ? "1" : $scope.sel_unclass ? "0" : undefined,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "oneShopTeacherId": search_oneShopTeacherId,
                "twoShopTeacherId": search_twoShopTeacherId,
                "courseType": search_paikeType,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'bookingStatus': $scope.appoint ? "1" : undefined
            }
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            if(name == "schedule"){
                window.open(CONFIG.URL + '/api/oa/statistics/consultantrrAngingCoursesList?' + $.param(params));
            }else{
                window.open(CONFIG.URL + '/api/oa/statistics/consultantLessonStudentList?' + $.param(params));
            }
        }

        function paikeShunyan() {
            window.$rootScope.yznOpenPopUp($scope, "arange-pop", 'pkShunyan', '1060px', {
                "inputType": "checkbox",
                "name": "lesson"
            });
        }
        $scope.closePop = function() {
            layer.close(dialog);
        }

        function batchOperate(n) {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择课次");
            }
            var list = $scope.select_params;
            var arr = [];
            angular.forEach(list, function(val) {
                var obj = {};
                if (val.hasChecked) {
                    obj.arrangingCoursesId = val.arrangingCoursesId;
                    arr.push(obj);
                }
            });
            console.log($scope.select_params);
            switch (n) {
                case 1:
                    $scope.hasConfPop = false; //没有冲突提示
                    $scope.changeDate = "";
                    laydate.render({
                        elem: '#changeDate', //指定元素
                        isRange: false,
                        done: function(value) {
                            $scope.changeDate = value;
                        }
                    });
                    openPopByDiv("批量调课", ".batchChange", "560px");
                    $scope.confirm_batchChange = function() {
                        $scope.closePop();
                        var params = {
                            "arrangingCourses": arr,
                            "updateArrangingCourses": {
                                updateDate: yznDateFormatYMd($scope.changeDate)
                            }
                        };
                        if ($scope.hasConfPop) {
                            params["inspectStatus"] = "0";
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/lesson/transfer",
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.msg("调课成功", {
                                        icon: 1
                                    });
                                    $timeout(function() {
                                        if ($scope.hasConfPop) {
                                            $scope.closePop();
                                        }
                                        $scope.$emit('scheduleChange', '调课');
                                        $scope.hasConfPop = false;
                                    }, 1000, true)
                                    return true;
                                } else if (data.status == '20015') {
                                    angular.forEach(data.context, function(v) {
                                        if (v.arrangingCourses) {
                                            var arr = [];
                                            angular.forEach(v.arrangingCourses.teachers, function(v_) {
                                                if (v_.inspectTeacher && v_.inspectTeacher == 1) {
                                                    arr.push(v_);
                                                }
                                            });
                                            v.arrangingCourses.teacherStr = arrToStr(arr, "teacherName");
                                        }
                                    });
                                    $scope.conflict = data.context;
                                    openPopByDiv("冲突提示", ".change_conflict_prompt", "1026px");
                                    $scope.hasConfPop = true;
                                    $scope.change_Conflict = function() {
                                        $scope.confirm_batchChange(arr);
                                    }
                                    return true;
                                } else {

                                }
                            }
                        });
                    }
                    break;
                case 2:
                    $scope.hasConfPop = false; //没有冲突提示
                    var isConfirm = layer.confirm('确定后，将取消所选中的排课并按班级<br>上课时间自动向后顺延，课次数量保持不变。是否继续操作？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        resize: false,
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        confirm_paike(arr);
                        layer.close(isConfirm);
                    }, function() {
                        layer.close(isConfirm);
                    })
                    break;
                case 3:
                    detailMsk("若删除课次中含有试听学员、补课学员、临时学员、约课学员时，系统将自动取消其上课安排；是否删除本次排课，删除后无法还原，确认删除？", function() {
                        var param = {
                            "arrangingCourses": arr
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/lesson/deleteArrangingCoursesInfo",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.msg('已成功删除排课', {
                                        icon: 1
                                    });
                                    $scope.$emit('scheduleChange', '删除');
                                };
                            }
                        })
                    }, function() {}, ['确认删除', '取消']);
                    break;
                default:
                    break;
            }
        }

        function confirm_paike(arr) {
            var params = {
                "arrangingCourses": arr
            };
            if ($scope.hasConfPop) {
                params["inspectStatus"] = "0";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/shunYan",
                type: "post",
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg("顺延成功", {
                            icon: 1
                        });
                        $timeout(function() {
                            if ($scope.hasConfPop) {
                                $scope.closePop();
                            }
                            $scope.$emit('scheduleChange', '顺延');
                            $scope.hasConfPop = false;
                        }, 1000, true)
                        return true;
                    } else if (data.status == '20015') {
                        $scope.teachConfList = data.context.inspectTeacher;
                        $scope.classRmConfList = data.context.inspectClassRoom;
                        openPopByDiv("冲突提示", ".sy_conflict_prompt", "760px");
                        $scope.hasConfPop = true;
                        $scope.ignoreConflict = function() {
                            confirm_paike(arr);
                        }
                        return true;
                    } else {

                    }
                }
            });
        }
    }];
});