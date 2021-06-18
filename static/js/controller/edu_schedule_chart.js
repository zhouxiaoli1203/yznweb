define(['laydate', "CourseUtils", 'SimpleCalendar', "pagination", 'moment', 'timeDaterangepicker', 'mySelect', 'rollCall', 'arrangePop', "timePop", "classPop", "courseAndClass_sel", "timesel", 'classroomPop', 'clsaffairPop'], function(laydate, CourseUtils) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$compile', function($scope, $rootScope, $http, $state, $stateParams, $compile) {
        var $courseId, $className, $classInfo, $classId, $class_courseId, $bookingStatus; //筛选列表字段
        init();

        function init() {
            $scope.bookingSture = getFunctionStatus(0x0002); //约课开关
            $scope.switchVisitNav = switchVisitNav; //点击跳转路由
            $scope.changePaike = checkAuthMenuById("37"); //变更排课权限
            $scope.fastPaike = checkAuthMenuById("38"); //快速排课权限
            $scope.exportSchedule = exportSchedule; //导出课表
            $scope.tabNav_2 = 1; //视图排课tab内容
            $scope.chanNav_2 = chanNav_2; //试图排课内容切换
            $scope.show_tips = show_tips; //排课色块事件
            $scope.viewPaikeInfo = null; //点击色块的排课信息
            $scope.returnweek = returnweek; //返回周几
            $scope.closePop = closePop; //关闭弹框
            $scope.gotolistRollCall = gotolistRollCall; //点击跳转点名
            $scope.TimeFrameEvent = TimeFrameEvent; //日期选择事件
            $scope.paikeDelete = paikeDelete; //删除操作
            $scope.tdPaike = tdPaike; //点击td排课
            $scope.tdInfo = { //点击td排课td的信息
                _d: {}, //按时间排课
                _t: {}, //按老师排课
                _r: {} //按教室排课
            };
            $scope._params = {
                t: [], //筛选列表-老师
                r: [], //筛选列表-教室
                $courseType: undefined, //筛选课程类型
                $bookingStatus: undefined //是否约课
            };
            $scope.screenSel = screenSel; //筛选列表选择
            $scope.delect_screen = delect_screen; //筛选列表删除
            $scope._data = {
                _time: Thisweekdate($.format.date(new Date(), "yyyy-MM-dd")), //时间范围
            };
            $scope.onReset = function() { //重置筛选
                for (i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                if ($scope.tabNav_2 == 2) {
                    $scope.$broadcast('edu_room', 'clearSatus');
                } else if ($scope.tabNav_2 == 3) {
                    $scope.$broadcast('edu_teacher', 'clearSatus');
                } else {
                    $scope.$broadcast('edu_teacher', 'clearSatus');
                    $scope.$broadcast('edu_room', 'clearSatus');
                }
                $courseId = undefined;
                $classId = undefined;
                $scope._params.t = [];
                $scope._params.r = [];
                $scope._params.$courseType = undefined;
                $scope._params.$bookingStatus = undefined;
                getScreenData(2);
                getViewData();
            };

            $scope.$on('scheduleSure', function() { //变更排课回调
                $scope.closePop();
                getViewData();
            });
            $scope.$on('scheduleListChange', function() { //点名回调
                $scope.closePop();
                getViewData();
            });
            $scope.$on('scheduleChange', function() { //排课顺延回调
                getViewData();
            });
            $scope.$on("clsAffair_schedule", function() {
                getViewData();
            });
            //时间筛选控件
            laydate.render({
                elem: '#sch_time_frame', //指定元素
                eventElem: '.sch_time_frame_text span',
                trigger: 'click',
                value: $.format.date(new Date(), "yyyy-MM-dd"),
                btns: ['now', 'confirm'],
                done: function(value) {
                    $scope._data._time = Thisweekdate(value);
                    getViewData();
                }
            });
            getScreenData(1);
            getScreenData(2);
            getScreenData(3);
            getScreenData(4);
            getViewData();
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        //视图内容切换
        function chanNav_2(type) {
            $scope.tabNav_2 = type;
            $scope.onReset();
        }

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

        //日期时间选择事件
        function TimeFrameEvent(type) {
            var _t = '';
            switch (type) {
                case 1: //上周
                    _t = yznDateAddWithFormat($('#sch_time_frame').val(), -7, "yyyy-MM-dd");
                    $('#sch_time_frame').val(_t);
                    $scope._data._time = Thisweekdate(_t);
                    break;
                case 2: //下周
                    _t = yznDateAddWithFormat($('#sch_time_frame').val(), 7, "yyyy-MM-dd");
                    $('#sch_time_frame').val(_t);
                    $scope._data._time = Thisweekdate(_t);
                    break;
                case 3: //返回本周
                    _t = $.format.date(new Date(), "yyyy-MM-dd");
                    $('#sch_time_frame').val(_t);
                    $scope._data._time = Thisweekdate(_t);
                    break;
            };
            getViewData();
        }

        //删除操作
        function paikeDelete(type) {
            var isConfirm, param, _url;
            isConfirm = layer.confirm((type == 1 ? '是否删除此次排课？删除后不能恢复' : '是否删除该点名记录，删除后将返还已扣课时'), {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                resize: false,
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                if (type == 1) {
                    param = {
                        "arrangingCourses": [{
                            "arrangingCoursesId": $scope.viewPaikeInfo.arrangingCoursesId
                        }]
                    };
                    _url = "/api/oa/lesson/deleteArrangingCoursesInfo";
                } else {
                    param = {
                        "arrangingCoursesId": $scope.viewPaikeInfo.arrangingCoursesId
                    };
                    _url = "/api/oa/course/cancelRollCallInOaNew";
                }
                $.hello({
                    url: CONFIG.URL + _url,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == "200") {
                            if (type == 1) {
                                layer.msg('已成功删除排课', {
                                    icon: 1
                                });
                            } else {
                                layer.msg('已成功取消点名', {
                                    icon: 1
                                });
                            }
                            $scope.closePop();
                            getViewData();
                        }
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }

        //点击跳转点名
        function gotolistRollCall(d) {
            var dataRoll = angular.copy(d);
            dataRoll['arrangingCourses'] = {};
            dataRoll['classRoom'] = {};
            dataRoll['arrangingCourses']['arrangingCoursesId'] = d.arrangingCoursesId;
            dataRoll['arrangingCourses']['beginDate'] = d.arrangingCoursesBeginDate;
            dataRoll['arrangingCourses']['endDate'] = d.arrangingCoursesEndDate;
            dataRoll['classRoom']['classroomId'] = d.classroomId;
            dataRoll['classRoom']['classRoomName'] = d.classRoomName;
            //          $.hello({
            //              url: CONFIG.URL + "/api/oa/student/getRollCallStudents",
            //              type: "get",
            //              data: {arrangingCoursesId: d.arrangingCoursesId},
            //              success: function(data) {
            //                  if(data.status == 200) {
            //                      dataRoll.rollcallStudent_1 = []; //本班
            //                      dataRoll.rollcallStudent_2 = []; //临时
            //                      dataRoll.rollcallStudent_3 = []; //补课
            //                      dataRoll.rollcallStudent_4 = []; //试听
            //                      angular.forEach(data.context, function(val) {
            //                          switch(val.studentType) {
            //                              case '0': dataRoll.rollcallStudent_1.push(val); break;
            //                              case '1': dataRoll.rollcallStudent_4.push(val); break;
            //                              case '2': dataRoll.rollcallStudent_3.push(val); break;
            //                              case '3': dataRoll.rollcallStudent_2.push(val); break;
            //                          }
            //                      })
            //                  }
            //              }
            //          });
            window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', dataRoll);
        }

        //点击色块事件
        function show_tips(evt, type) {
            var _this = $(evt.target).closest('._hover');
            evt.stopPropagation();
            switch (type) {
                case 1:
                    $scope.viewPaikeInfo = JSON.parse(_this.attr('data'));
                    $scope.viewPaikeInfo.t_1 = [];
                    $scope.viewPaikeInfo.t_2 = [];
                    angular.forEach($scope.viewPaikeInfo.teachers, function(val) {
                        if (val.teacherType == '1') {
                            $scope.viewPaikeInfo.t_1.push(val.teacherName);
                        } else {
                            $scope.viewPaikeInfo.t_2.push(val.teacherName);
                        }
                    });
                    window.$rootScope.yznOpenPopUp($scope, "clsaffair-pop", "affair_pop", "960px", { tab: 1, item: $scope.viewPaikeInfo, page: "schedule" });
                    // openPopByDiv('排课信息', '._paike_info', '560px');
                    break;
                case 2:
                    _this.css({ 'z-index': '9' });
                    _this.find('.sch_tips').show();
                    break;
                case 3:
                    _this.css({ 'z-index': '5' });
                    _this.find('.sch_tips').hide();
                    break;
            }
        }

        //点击td排课
        function tdPaike(evt) {
            if (!$scope.fastPaike) { //判断是否拥有权限
                return;
            };
            var isConfirm, _d = { 'date': $(evt.target).attr('date'), 'week': $(evt.target).attr('week') };
            _d['shopTeacherId'] = $scope._params.t[0] ? $scope._params.t[0].shopTeacherId : null;
            _d['teacherName'] = $scope._params.t[0] ? $scope._params.t[0].teacherName : null;
            _d['classRoomId'] = $scope._params.r[0] ? $scope._params.r[0].classRoomId : null;
            _d['classRoomName'] = $scope._params.r[0] ? $scope._params.r[0].classRoomName : null;
            _d['class_courseId'] = $class_courseId;
            _d['classId'] = $classId;
            _d['className'] = $className;
            _d['teachingMethod'] = $classInfo ? $classInfo.course.teachingMethod : '';
            switch ($scope.tabNav_2) {
                case 1:
                    var _t = $(evt.target).attr('time').split(',');
                    console.log(_t)
                    _d.time = timeHandle_((_t[0] + ':' + _t[1] * 15), 1, 0);
                    console.log(_d)
                    break;
                case 2:
                    _d.shopTeacherId = $(evt.target).attr('shopTeacherId');
                    _d.teacherName = $(evt.target).attr('teacherName');
                    break;
                case 3:
                    _d.classRoomId = $(evt.target).attr('classRoomId');
                    _d.classRoomName = $(evt.target).attr('classRoomName');
                    break;
            };

            isConfirm = layer.confirm('是否进行排课？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                resize: false,
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                window.$rootScope.yznOpenPopUp($scope, "arange-pop", "arange_pop", "760px", { "pop": "paike", "name": "lesson", "isSingle": "1", "title": "快速排课", "tdData_": _d });
                layer.close(isConfirm);
            }, function() {
                layer.close(isConfirm);
            })
        }

        //筛选列表选择
        function screenSel(d, type) {
            var judHas = true,
                judHasIndex = 0;
            switch (type) {
                case 1:
                    $courseId = d == null ? undefined : d.courseId;
                    $classId = undefined;
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['edu_class']('');
                    });
                    getScreenData(2);
                    break;
                case 2:
                    $classId = d == null ? undefined : d.classId;
                    $className = d == null ? undefined : d.className;
                    $classInfo = (d == null) ? undefined : d;
                    $class_courseId = d == null ? undefined : d.course.courseId;
                    break;
                case 3:
                    angular.forEach($scope._params.t, function(val, index) {
                        if (val.shopTeacherId == d.shopTeacherId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    });
                    if (judHas) {
                        $scope._params.t.push(d);
                        d.hasSelected = true;
                    } else {
                        $scope._params.t.splice(judHasIndex, 1);
                        d.hasSelected = false;
                    }
                    break;
                case 4:
                    angular.forEach($scope._params.r, function(val, index) {
                        if (val.classRoomId == d.classRoomId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    });
                    if (judHas) {
                        $scope._params.r.push(d);
                        d.hasSelected = true;
                    } else {
                        $scope._params.r.splice(judHasIndex, 1);
                        d.hasSelected = false;
                    }
                    break;
                case 5:
                    $scope._params.$courseType = d.target.checked ? 1 : undefined;
                    break;
                case 6:
                    $scope._params.$courseType = d.target.checked ? 2 : undefined;
                    break;
                case 7:
                    $scope._params.$bookingStatus = d.target.checked ? 1 : undefined;
                    break;
            }
            getViewData();
        }

        //筛选列表-点击小叉叉删除多选的
        function delect_screen(d, index, type) {
            if (type == 'teacher') {
                $scope._params.t.splice(index, 1);
                d.hasSelected = false;
                getViewData();
            } else if (type == 'room') {
                $scope._params.r.splice(index, 1);
                d.hasSelected = false;
                getViewData();
            }
        }

        //获取筛选列表数据
        function getScreenData(type) {
            if (type == 1) {
                //获取课程列表
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCoursesList",
                    type: "get",
                    data: { 'pageType': 0, 'courseStatus': 1 },
                    success: function(data) {
                        if (data.status == "200") {
                            var arr = [];
                            angular.forEach(data.context, function(v) {
                                if (v.courseType == 0) {
                                    arr.push(v);
                                }
                            });
                            $scope._courseList = arr;
                        }
                    }
                });
            } else if (type == 2) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/list",
                    type: "get",
                    data: { 'pageType': "0", 'classStatus': "1", 'courseId': $courseId },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope._classList = data.context;
                        }
                    }
                });
            } else if (type == 3) {
                $.hello({
                    url: CONFIG.URL + '/api/oa/shopTeacher/list',
                    type: "get",
                    data: { 'pageType': 0, 'shopTeacherStatus': 1, 'quartersTypeId': 1 },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope._teacherList = data.context;
                        }
                    }
                });
            } else if (type == 4) {
                $.hello({
                    url: CONFIG.URL + '/api/oa/classroom/list',
                    type: "get",
                    data: { 'pageType': 0 },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope._roomList = data.context.items;
                        }
                    }
                });
            }
        }

        //获取视图数据
        function getViewData() {
            var _t = [],
                _r = [];
            angular.forEach($scope._params.t, function(val) {
                _t.push({ 'shopTeacherId': val.shopTeacherId });
            });
            angular.forEach($scope._params.r, function(val) {
                _r.push({ 'classRoomId': val.classRoomId })
            });
            var params = {
                    'beginTime': $scope._data._time.split(' 到 ')[0],
                    'endTime': yznDateAddWithFormat($scope._data._time.split(' 到 ')[1], +1, "yyyy-MM-dd"),
                    'viewType': $scope.tabNav_2 - 1,
                    'courseId': $courseId,
                    'classId': $classId,
                    'shopTeacherList': _t.length <= 0 ? undefined : _t,
                    'classRooms': _r.length <= 0 ? undefined : _r,
                    'courseType': $scope._params.$courseType,
                    'bookingStatus': $scope._params.$bookingStatus ? $scope._params.$bookingStatus : undefined
                },
                dateList = [];
            //获取时间列表
            for (var i = 0; i < 7; i++) {
                dateList.push(yznDateAddWithFormat($scope._data._time.split(' 到 ')[0], +i, "yyyy-MM-dd"));
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/viewList",
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if (res.status == '200') {
                        var contain, data_;
                        switch ($scope.tabNav_2) {
                            case 1:
                                data_ = res.context[0].arrangingCoursesList;
                                contain = $('.sch_time');
                                break;
                            case 2:
                                data_ = res.context;
                                contain = $('.sch_teacher');
                                break;
                            case 3:
                                data_ = res.context;
                                contain = $('.sch_room');
                                break;
                        };
                        CourseUtils.init({
                            type: $scope.tabNav_2,
                            contain: contain,
                            data: {
                                timeFrame: dateList,
                                dataList: data_,
                                week: initWeek($('#sch_time_frame').val()),
                            },
                            compileFac: function(dom) {
                                return $compile(dom)($scope);
                            },
                            getScope: function() {
                                return $scope;
                            },
                        })
                    }

                }
            })
        }

        function exportSchedule() {
            var token = localStorage.getItem('oa_token');
            var beginTime = $scope._data._time.split(' 到 ')[0] + " 00:00:00";
            var endTime = $scope._data._time.split(' 到 ')[1] + " 23:59:59"
            var status;
            var endTimeDay = endTime.replace(/-/ig, "");
            var endMonthDay = yznMonthAdd(beginTime, 8).replace(/-/ig, "");
            if (endTimeDay > endMonthDay) {
                layer.msg("最多可导出8个月课表数据，请修改课表导出时间");
                return;
            }
            var params = {
                "beginTime": beginTime,
                "endTime": endTime,
                "token": token,
                //              "classId":$classId,
                //              "courseId":$courseId,
                //              "status":undefined,
                //              "orderName":undefined,
                //              "orderTyp":undefined,
                //              "oneShopTeacherId":undefined,
                //              "twoShopTeacherId":undefined,
            }
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantrrAngingCoursesList?' + $.param(params));
        }

        function closePop() {
            layer.close(dialog);
        }
    }]
})