define(["MyUtils", "laydate", 'timesel', 'timePop', 'courseAndClass_sel'], function(MyUtils, laydate) {
    creatPopup({
        el: 'listenPop',
        openPopupFn: 'listenPopup',
        htmlUrl: './templates/popup/listen_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout) {
            var pagerRender = false,
                start = 0,
                eachPage = localStorage.getItem("listenPop") ? localStorage.getItem("listenPop") : 10;
            var $paikeCourseId = $paikeClassId = $paikeTeacherId = $paikeThemeId = $paike_week = undefined;
            $scope.screen_searchTime = "";
            console.log(props);
            $scope.props = angular.copy(props);
            $scope.choseType = props ? props.choseType : undefined;
            init();

            function init() {
                getScreen_courseList();
                getScreen_classList();
                getScreen_teacherList();
                getScreen_themeList();
                $scope.paikeCourseList = []; //排课课程列表
                $scope.params_paikeCourse = [];
                $scope.popNav = [
                    { name: '试听课', tab: 1 },
                    { name: '正式课', tab: 2 },
                ];
                $scope.weekData = [
                    { name: '星期一', value: '1' },
                    { name: '星期二', value: '2' },
                    { name: '星期三', value: '3' },
                    { name: '星期四', value: '4' },
                    { name: '星期五', value: '5' },
                    { name: '星期六', value: '6' },
                    { name: '星期日', value: '7' },
                ];
                $scope.popNavSelected = 1;
                $scope.changePopNav = changePopNav;
                $scope.onReset = onReset;
                $scope.sel_screenCourse = sel_screenCourse; //筛选栏-选择班级课程
                $scope.sel_screenClass = sel_screenClass; //筛选栏-选择班级
                $scope.sel_screenTeacher = sel_screenTeacher; //筛选栏-选择班级
                $scope.sel_week = sel_week; //筛选栏-选择上课星期
                $scope.sel_screenTheme = sel_screenTheme; //筛选栏-上课主题
                $scope.sel_paikeCourse = sel_paikeCourse;
                $scope.deterSel_paikeCourse = deterSel_paikeCourse;
                $scope.listenCourse = listenCourse; //安排试听课
                $scope.add_listenCourse_submit = add_listenCourse_submit; //单次试听排课
                $scope.set_listenCourse_submit = set_listenCourse_submit; //直接选择课次预约确定
                $scope.view_listenCourse_submit = view_listenCourse_submit;
                $scope.changeRoom = changeRoom; //选择教室

                $scope.openTnemePop = openTnemePop; //新增上课主题
                $scope.getcoursethemeList = getcoursethemeList; //获取课程下主题
                $scope.screenSel_ = function(d) { //选择主题
                    $scope.paike_theme = d ? d : null;
                }
                laydate.render({
                    elem: '#screen_searchTime', //指定元素
                    range: '到',
                    min: "0",
                    done: function(value) {
                        if (value) {
                            if (CompareDate(yznDateFormatYMd(value.split(" 到 ")[1]), yznDateFormatYMd(new Date()))) {
                                $scope.screen_searchTime = value;
                                pagerRender = false;
                                getListenTab(0);
                            }
                        } else {
                            $scope.screen_searchTime = value;
                            pagerRender = false;
                            getListenTab(0);
                        }
                    }
                });
                getListenTab(0);
                if (props.page == "listenlist") {
                    listenCourseInit();
                }
            }

            function openTnemePop() {
                if (!$scope.paike_courseId) {
                    return layer.msg("请选择课程");
                }
                window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'addOreditCourseTl', '660px', { name: 'addcourseTitle', callBackName: 'addNewTheme', fromPage: 'paike', 'courseThemeId': $scope.paike_courseId });
            }

            // 获取上课主题
            function getcoursethemeList(id) {
                if (id) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                        type: "get",
                        data: { 'courseId': id },
                        success: function(data) {
                            if (data.status == '200') {
                                console.log(data)
                                $scope.courseThemeList_ = data.context;
                                // if (props.item) {
                                //     if (props.item.arrangingCoursesTheme) { //给变更排课的上课主题填充数据
                                //         $scope.constants.courseTheme = props.item.arrangingCoursesTheme;
                                //         screen_setDefaultField($scope, function() {
                                //             $scope.screen_goReset['_theme2']($scope.constants.courseTheme.courseThemeName);
                                //         });
                                //     }
                                // }
                            }
                        }
                    })
                };
            }
            $scope.$on('addNewTheme', function() {
                $scope.getcoursethemeList($scope.paike_courseId);
            })

            function getScreen_courseList() {
                var p = {
                    'pageType': 0,
                    'courseStatus': 1,
                    'courseType': 0
                };
                if ($scope.popNavSelected == 2) {
                    p["teachingMethod"] = 2;
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCoursesList",
                    type: "get",
                    data: p,
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.screen_courseList = data.context;
                        }
                    }
                });
            }

            function getScreen_classList(id) {
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
                            $scope.screen_classList = data.context;
                        }
                    }
                });
            }

            function getScreen_teacherList(id) {
                var p = {};
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
                            $scope.screen_teacherList = list;
                        }
                    }
                });
            }

            function getScreen_themeList(courseId) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                    type: "get",
                    data: { courseId: courseId },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.screen_themeList = data.context;
                        }
                    }
                });
            }

            function changePopNav(n) {
                $scope.popNavSelected = n;
                onReset();
            }

            function onReset() {
                $paikeCourseId = $paikeClassId = $paikeTeacherId = $paikeThemeId = $paike_week = undefined;
                $scope.screen_searchTime = "";
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                getScreen_courseList();
                getScreen_classList();
                getScreen_teacherList();
                getScreen_themeList();
                pagerRender = false;
                getListenTab(0);
            }
            //筛选-班级课程
            function sel_screenCourse(data, type) {
                $paikeCourseId = data ? data.courseId : undefined;
                if ($scope.popNavSelected == 2) {
                    $scope.screen_goReset['选择班级']();
                    $scope.screen_goReset['选择老师']();
                    $paikeClassId = $paikeTeacherId = undefined;
                    getScreen_classList($paikeCourseId);
                    getScreen_teacherList($paikeClassId);
                    getScreen_themeList($paikeCourseId);
                }
                pagerRender = false;
                getListenTab(0);
            }
            //筛选-班级
            function sel_screenClass(data, type) {
                $paikeClassId = data ? data.classId : undefined;
                $scope.screen_goReset['选择老师']();
                $paikeTeacherId = undefined;
                getScreen_teacherList($paikeClassId);
                pagerRender = false;
                getListenTab(0);
            }
            //筛选-班级
            function sel_screenTeacher(data, type) {
                $paikeTeacherId = data ? data.shopTeacherId : undefined;
                pagerRender = false;
                getListenTab(0);
            }

            function sel_week(data) {
                pagerRender = false;
                $paike_week = undefined;
                if (data) { $paike_week = data.value; }
                getListenTab(0);
            }
            //筛选-上课主题
            function sel_screenTheme(data, type) {
                $paikeThemeId = data ? data.courseThemeId : undefined;
                pagerRender = false;
                getListenTab(0);
            }

            function getListenTab(start_) {
                var data = {
                    'start': start_,
                    'count': eachPage,
                    'courseId': $paikeCourseId,
                    'classId': $paikeClassId,
                    'courseType': $scope.popNavSelected == 1 ? "1" : "0",
                    'shopTeacherId': $paikeTeacherId,
                    'courseThemeId': $paikeThemeId,
                    'status': 0,
                    'week': $paike_week,
                    'needStudentTotal': 1,
                    'afterToday': 1
                }
                if ($scope.screen_searchTime) {
                    data["beginTime"] = $scope.screen_searchTime.split(" 到 ")[0] + " 00:00:00";
                    data["endTime"] = $scope.screen_searchTime.split(" 到 ")[1] + " 23:59:59";
                }
                if ($scope.popNavSelected == 2) {
                    data["teachingMethod"] = "2";
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/list",
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == '200') {
                            var list = res.context.items;
                            angular.forEach(list, function(v) {
                                v.teacherStr = arrToStr(v.teachers, "teacherName");
                            });
                            $scope.paikeCourseList = list;
                            renderPager(res.context.totalNum);
                        };
                    }
                })
            }

            function renderPager(total) { //分页
                if (pagerRender)
                    return;
                pagerRender = true;
                var $M_box3 = $('.coursePage');
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
                            localStorage.setItem('listenPop', eachPage);
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        getListenTab(start);
                    }
                });
            }
            //选择排课课程
            function sel_paikeCourse(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_paikeCourse = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_paikeCourse, function(val, ind) {
                            if (data.classId == val.classId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_paikeCourse.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_paikeCourse.push(data);
                    }
                }
            }

            //以下  安排试听课
            function listenCourse() {
                listenCourseInit();
                $scope.goPopup("set_listenCourse", "660px");
            }

            function listenCourseInit() {
                $scope.hasConfPop = false; //没有冲突提示
                getCourseList(); //获取课程
                getClassroomList(); //获取教室
                paike_getTeacherList();
                $scope.operateTime = {
                    "beginTime": "07:00",
                    "endTime": "08:00"
                };
                screen_setDefaultField($scope, function() {
                    $scope.screen_goReset['chooseCourse']("请选择课程");
                    $scope.screen_goReset['selectMainTeacher']("请选择主教");
                });
                $scope.arrangeTime = yznDateFormatYMd(new Date());
                $scope.changeClasstime = changeClasstime; //切换时间
                $scope.getMinutes = getMinutes_; //获取分钟数
                $scope.usePreSetTime = usePreSetTime; //使用预设时间
                $scope.changeGetPage = changeGetPage; //选择课程
                $scope.clickMainTeacher = clickMainTeacher; //选择主教老师
                $scope.selTeacher_ = selTeacher_; //选中的助教老师 
                $scope.delTeacher_ = delTeacher_; //删除选中的助教老师 
                $scope.mainTeacher = '';
                $scope.mainTeacherModel = '';
                $scope.subTeacher = [];
                $scope.mainTeachers = [];
                $scope.paike_courseId = "";
                $scope.paike_courseName = "";
                $scope.paike_classroom = "";
                $scope.paike_theme = "";
                $scope.paike_remark = "";
                //              $scope.layerRenger = layerRenger;
                SERVICE.TIMEPOP.CLASS['pre_time_sel'] = $scope.changeClasstime;


                laydate.render({
                    elem: "#searchTimeforcharge", //指定元素
                    format: "yyyy-MM-dd",
                    isRange: false,
                    done: function(value, date, endDate) {
                        $scope.arrangeTime = value;
                    }
                })

                $scope.$watch("operateTime", function() {
                    if ($scope.operateTime) {
                        $scope.changeTimeMins = getMinutes_($scope.operateTime);
                    }
                });

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
                                $scope.courseList = [];
                                angular.forEach(data.context, function(v) {
                                    if (v.courseType == 0) {
                                        $scope.courseList.push(v);
                                    }
                                });
                            }
                        }
                    });
                }

                function changeClasstime(data) {
                    $scope.operateTime = data;
                }

                //              function getMinutes(time) {
                //                  var bt = time.beginTime;
                //                  var et = time.endTime;
                //                  bMins = parseInt(bt.substr(0, 2)) * 60 + parseInt(bt.substr(3, 4)),
                //                      eMins = parseInt(et.substr(0, 2)) * 60 + parseInt(et.substr(3, 4));
                //                  if (eMins <= bMins) {
                //                      return 0;
                //                  }
                //                  return eMins - bMins;
                //              }

                function usePreSetTime() {
                    window.$rootScope.yznOpenPopUp($scope, 'time-pop', 'preSetTime', '560px');
                }

                function getClassroomList(courseId) {
                    var data = {
                        "pageType": 0
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/classroom/list",
                        type: "get",
                        data: data,
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.classroomList = data.context.items;
                            }

                        }
                    })
                }

                function changeGetPage(data) {
                    console.log(data);
                    $scope.paike_courseId = data.courseId;
                    $scope.paike_courseName = data.courseName;
                    screen_setDefaultField($scope, function() {
                        if ($scope.screen_goReset['_theme2']) {
                            $scope.screen_goReset['_theme2']('');
                        }
                    });
                    $scope.paike_theme = '';
                    $scope.getcoursethemeList($scope.paike_courseId);
                }
                //选择主教
                function clickMainTeacher(data) {
                    if (!data) {
                        $scope.mainTeachers = [];
                    } else {
                        $scope.mainTeacher = data;
                        console.log($scope.mainTeacher);
                        $scope.mainTeachers = [{
                            "shopTeacherId": $scope.mainTeacher.shopTeacherId,
                            "teacherType": 1
                        }];
                        getMainSubTeacherList(data);
                    }
                }
                //删除助教
                function delTeacher_(data, ind) {
                    data.hasSelected = false;
                    $scope.subTeacher.splice(ind, 1);
                }
                //选择助教
                function selTeacher_(data) {
                    var judHas = true;
                    var judHasIndex = null;
                    angular.forEach($scope.subTeacher, function(val, index) {
                        if (val.teacherId == data.teacherId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    });
                    if (judHas) {
                        if ($scope.subTeacher.length > 8) {
                            layer.msg("最多添加9位助教老师");
                            return;
                        }
                        $scope.subTeacher.push(data);
                        data.hasSelected = true;
                    } else {
                        $scope.subTeacher.splice(judHasIndex, 1);
                        data.hasSelected = false;
                    }
                }
                //获取主教、主教老师列表数据（添加默认助教选中）
                function getMainSubTeacherList(data) {
                    var arr = [];
                    $scope.subTeacherList = [];
                    angular.forEach($scope.subTeacher, function(val, ind) { //去掉助教数组里的主教
                        if (data.shopTeacherId == val.shopTeacherId) {
                            delete $scope.subTeacher[ind];
                        }
                    });
                    $scope.subTeacher = detEmptyField_($scope.subTeacher); //去除空的字段
                    angular.forEach($scope.teacherList, function(val) { //去掉助教列表里的主教
                        if (data.shopTeacherId != val.shopTeacherId) {
                            arr.push(val);
                        };
                    });
                    $scope.subTeacherList = angular.copy(arr);
                    $scope.$broadcast('添加助教老师', 'reloadData', { 'data': $scope.subTeacher, 'att': 'shopTeacherId' }); //默认勾选
                }

                function paike_getTeacherList() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/shopTeacher/list",
                        type: "get",
                        data: {
                            quartersTypeId: "1",
                            pageType: "0",
                            shopTeacherStatus: "1"
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                console.log('老师列表', res.context);
                                $scope.teacherList = res.context;
                            }
                        }
                    });
                }
            }

            function changeRoom(r) {
                if (r) {
                    r = JSON.parse(r);
                    $scope.paike_classRoomId = r.classRoomId;
                    $scope.paike_classRoomName = r.classRoomName;
                } else {
                    $scope.paike_classRoomId = undefined;
                    $scope.paike_classRoomName = undefined;
                }
            }

            function view_listenCourse_submit() {
                laydate.render({
                    elem: "#yuyue_returnTime",
                    isRange: false,
                    type: "datetime",
                    trigger: 'click',
                    done: function(value) {
                        $scope.paike.returnTime = value;
                    }
                });
                if (!$scope.paike_courseId) {
                    return layer.msg("请选择课程");
                }
                if ($scope.changeTimeMins <= 0) {
                    return layer.msg("结束时间不能小于等于开始时间");
                }
                //              if($scope.mainTeachers.length<=0){
                //                  return layer.msg("请选择主教老师");
                //              }
                $scope.isAdd_listen = true;
                $scope.paike = {
                    courseName: $scope.paike_courseName,
                    courseId: $scope.paike_courseId,
                    arrangeTime: yznDateFormatYMd($scope.arrangeTime) + "【" + yznDateFormatWeekCh($scope.arrangeTime) + "】" + $scope.operateTime.beginTime + "-" + $scope.operateTime.endTime,
                    arrangeTime_b: yznDateFormatYMd($scope.arrangeTime) + " " + $scope.operateTime.beginTime,
                    arrangeTime_e: yznDateFormatYMd($scope.arrangeTime) + " " + $scope.operateTime.endTime,
                    teachers: new Array().concat($scope.mainTeacher).concat($scope.subTeacher),
                    classroomId: $scope.paike_classRoomId,
                    classRoomName: $scope.paike_classRoomName,
                    teachersArr: getSelTeachers(),
                    returnTime: ""
                };
                $scope.goPopup("yuyue_confirm_pop", "660px");
            }
            //选择课次确定
            function deterSel_paikeCourse() {
                var data = $scope.params_paikeCourse;
                if (!data || data.length == 0) {
                    layer.msg('请选择一个试听课');
                } else {
                    console.log(data);
                    //                  $scope.$emit(props.callBackName, data);
                    //                  $scope.closePopup('choseListen');
                    laydate.render({
                        elem: "#yuyue_returnTime",
                        isRange: false,
                        type: "datetime",
                        trigger: 'click',
                        done: function(value) {
                            $scope.paike.returnTime = value;
                        }
                    });

                    $scope.paike = {
                        arrangingCoursesId: data.arrangingCoursesId,
                        courseName: data.course.courseName,
                        courseId: data.course.courseId,
                        arrangeTime: yznDateFormatYMd(data.arrangingCoursesBeginDate) + "【" + yznDateFormatWeekCh(data.arrangingCoursesBeginDate) + "】" + yznDateFormatHm(data.arrangingCoursesBeginDate) + "-" + yznDateFormatHm(data.arrangingCoursesEndDate),
                        arrangeTime_b: yznDateFormatYMd(data.arrangingCoursesBeginDate) + " " + yznDateFormatHm(data.arrangingCoursesBeginDate),
                        arrangeTime_e: yznDateFormatYMd(data.arrangingCoursesBeginDate) + " " + yznDateFormatHm(data.arrangingCoursesEndDate),
                        teachers: data.teachers,
                        classroomId: data.classroomId,
                        classRoomName: data.classRoomName,
                        teachersArr: getTeachers(data.teachers),
                        returnTime: ""
                    };
                    $scope.isAdd_listen = false;
                    $scope.goPopup("yuyue_confirm_pop", "660px");
                }
            }

            function getTeachers(list) {
                var arr = [];
                angular.forEach(list, function(v) {
                    var obj = {
                        "shopTeacherId": v.shopTeacherId,
                        "teacherType": 0
                    };
                    arr.push(obj);
                });
                return arr;
            }
            //直接选择课次进行试听
            function set_listenCourse_submit() {
                var params = {
                    arrangingCoursesId: $scope.paike.arrangingCoursesId,
                    potentialCustomerId: props.item.potentialCustomerId,
                    returnTime: $scope.paike.returnTime,
                    auditionRecordId: props.auditionRecordId ? props.auditionRecordId : undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/potentialCustomer/addAudition",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            if (!props.location) {
                                $scope.$emit("reloadRecord");
                            }
                            $scope.$emit("potentialChange", false); //潜客选择试听课程
                            $scope.$emit("listenListChange", false); //试听课课表直接排课
                            $scope.closePopup('yuyue_confirm_pop');
                            $scope.closePopup('choseListen');
                        }
                    }
                })
            }

            //以下是单次试听排课弹框确定
            function add_listenCourse_submit() {
                var params;
                if (props.page !== "listenlist") { //非试听课表页面单次排课弹框
                    params = {
                        courseId: $scope.paike.courseId,
                        classroomId: $scope.paike.classroomId,
                        courseType: "1",
                        inspectStatus: "1",
                        arrangingCoursesBeginDate: $scope.paike.arrangeTime_b + ":00",
                        arrangingCoursesEndDate: $scope.paike.arrangeTime_e + ":00",
                        teachers: $scope.paike.teachersArr,
                        returnTime: $scope.paike.returnTime,
                        potentialCustomers: props.item ? [{
                            id: props.item.id,
                            auditionRecordId: props.auditionRecordId ? props.auditionRecordId : undefined,
                            potentialCustomerId: props.item.potentialCustomerId,
                        }] : undefined
                    };
                } else { //试听课表页面直接排课
                    if (!$scope.paike_courseId) {
                        return layer.msg("请选择课程");
                    }
                    if ($scope.changeTimeMins <= 0) {
                        return layer.msg("结束时间不能小于等于开始时间");
                    }
                    params = {
                        courseId: $scope.paike_courseId,
                        classroomId: $scope.paike_classRoomId,
                        //【优化需求】试听课添加主题和备注  
                        arrangingCoursesTheme: $scope.paike_theme ? {
                            courseThemeId: $scope.paike_theme.courseThemeId
                        } : undefined,
                        remark: $scope.paike_remark ? $scope.paike_remark : undefined,
                        courseType: "1",
                        inspectStatus: "1",
                        arrangingCoursesBeginDate: yznDateFormatYMd($scope.arrangeTime) + " " + $scope.operateTime.beginTime + ":00",
                        arrangingCoursesEndDate: yznDateFormatYMd($scope.arrangeTime) + " " + $scope.operateTime.endTime + ":00",
                        teachers: getSelTeachers(),
                    };
                }
                if ($scope.hasConfPop) {
                    params["inspectStatus"] = "0";
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/add",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            pagerRender = false;
                            getListenTab(0);
                            $timeout(function() {
                                if (props.page == "listenlist") { //试听课课表页面排课
                                    $scope.$emit("scheduleChange", false);
                                } else {
                                    if (!props.location) {
                                        $scope.$emit("reloadRecord");
                                    }
                                    $scope.$emit("potentialChange", false); //潜客选择试听课程
                                    $scope.$emit("listenListChange", false); //试听课课表直接排课
                                }
                                if ($scope.hasConfPop) {
                                    $scope.closePopup("potial_conflict");
                                }
                                $scope.hasConfPop = false;
                                $scope.closePopup('yuyue_confirm_pop'); //试听确认信息弹框
                                $scope.closePopup('set_listenCourse'); //安排试听课弹框
                                $scope.closePopup('choseListen'); //试听课公用弹框选择
                            }, 100, true)
                            return true;
                        } else if (data.status == '20015') {
                            $scope.teachConfList = data.context.inspectTeacher;
                            $scope.classRmConfList = data.context.inspectClassRoom;
                            $scope.goPopup("potial_conflict", "760px"); //排课冲突弹框
                            $scope.hasConfPop = true;
                            $scope.ignoreConflict = function() {
                                add_listenCourse_submit();
                            }
                            return true;
                        }
                    }
                })
            }

            function getSelTeachers() {
                var arr = [];
                angular.forEach($scope.subTeacher, function(v) {
                    var obj = {
                        "shopTeacherId": v.shopTeacherId,
                        "teacherType": 0
                    };
                    arr.push(obj);
                });
                arr = arr.concat($scope.mainTeachers);
                return arr;
            }
        }
    })
})