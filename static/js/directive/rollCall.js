define(['laydate', 'students_sel', 'bukePop'], function(laydate) {
    creatPopup({
        el: 'rollCall',
        openPopupFn: 'listRollCall',
        htmlUrl: './templates/popup/rollCall.html',
        controllerFn: function($scope, props, SERVICE) {
            $scope.checkboxAll = false; //全选
            var $searchType, $searchName, $classId, $courseId, $year, $term;
            var lastClickTime = 0;
            $scope.xiuke = false;
            //          var clickLimit = false;  //限制短时间内重复点击事件
            init();

            function init() {
                getConfig();
                $scope.screen_years = getFrom2017(true,8); //学年
                judgeSignInShow();
                console.log('props----', props);
                getTermList();
                getClassroomList(); //获取教室列表
                getMainTeacher(); //获取主教、助教老师
                getTeacherList(); //获取老师列表
                getcoursethemeList(props.course.courseId); //获取上课主题列表
                //              getTemporaryList(); //获取临时学员列表
                //              getMakeupList(); //获取补课学员列表
                $scope.rollCallInfos = props; //获取点名列表数据
                getArrageTime();
                getRollCallList(); //刷新点名列表数据
                $scope.closeRollCall = getRollCallList; //取消点名

                $scope.getNeedTime = getNeedTime; //处理获取时间
                $scope.clickLock = clickLock; //点击点名锁定
                $scope.clickMainTeacher = clickMainTeacher; //选择主教老师
                $scope.selectTheme = selectTheme; //选择上课主题
                $scope.delTeacher_ = delTeacher_; //删除选中的助教老师
                $scope.selTeacher_ = selTeacher_; //选中的助教老师
                $scope.sel_changeYear = sel_changeYear;
                $scope.sel_changeTerm = sel_changeTerm;
                $scope.sureStudent = sureStudent; //点击确定

                $scope.clickCheckboxAll = clickCheckboxAll; //点击全选
                $scope.selectChecked = selectChecked; //选中的checked
                $scope.sureRollCall = sureRollCall; //确定点名
                $scope.ngMouseenter = ngMouseenter;
                $scope.ngMouseleave = ngMouseleave;
                $scope.changeClasstime = changeClasstime;
                $scope.getMinutes = getMinutes_;
                $scope.usePreSetTime = usePreSetTime;
                $scope.numOperate = numOperate; //消课课时的编辑加减
                SERVICE.TIMEPOP.CLASS['pre_time_sel'] = $scope.changeClasstime;
                $scope.caclBirthToAge = caclBirthToAge; //计算年龄
                $scope.goBatchXiaoke = goBatchXiaoke; //活动班批量消课


                //筛选和搜索数据
                $scope.selectInfoNameId = 'studentName'; //select初始值
                $scope.kindSearchData_temporary = {
                    studentName: '姓名、昵称、联系方式',
                };
                $scope.kindSearchData_makeup = {
                    studentName: '姓名、昵称',
                };
                $scope.Enterkeyup = Enterkeyup;
                $scope.SearchData = SearchData;

                $scope.temporary_time = null;

                //临时学员时间控件
                laydate.render({
                    elem: '#temporary_time', //指定元素
                    type: 'datetime',
                    range: '到',
                    isRange: true,
                    format: 'yyyy-M-dd',
                    done: function(value) {
                        $scope.temporary_time = value;
                        getMakeupList();
                    }
                });
                getClassList(); //获取筛选班级列表
                $scope.openStudentTb = function(obj) { //打开学生列表子弹窗
                    switch (obj) {
                        case 'roll_temporary_stu':
                            $scope.checkboxAll = false;
                            resetStudentList();
                            getTemporaryList(); //获取临时学员列表
                            $scope.kindSearchOnreset_["temporary"]();
                            $scope.goPopup(obj, '860px');
                            break;
                        case 'roll_makeup_stu':
                            $scope.checkboxAll = false;
                            resetStudentList();
                            getMakeupList(); //获取补课学员列表
                            $scope.screen_goReset['班级'](); //筛选重置
                            $scope.screen_goReset['学年'](); //筛选重置
                            $scope.screen_goReset['学期'](); //筛选重置
                            $scope.kindSearchOnreset_["makeup"]();
                            $scope.goPopup(obj, '860px');
                            break;
                        case 'roll_listen_stu':
                            // 需要排除的潜客
                            var excludePrId = arrToStr($scope.rollCallInfos.rollcallStudent_1.concat($scope.rollCallInfos.rollcallStudent_2).concat($scope.rollCallInfos.rollcallStudent_3).concat($scope.rollCallInfos.rollcallStudent_4).concat($scope.rollCallInfos.rollcallStudent_5), "potentialCustomerId")
                            window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_potential', '760px', { type: 'potential', choseType: 'checkbox', callBackName: 'rollCall_listen', excludePrId: excludePrId });
                            break;
                        case 'aboutClass': //添加约课学员
                            var obj = {
                                name: 'appoint',
                                type: 'student2',
                                item: $scope.rollCallInfos.classInfo,
                                courseId: $scope.rollCallInfos.courseId,
                                excludeClassId: $scope.rollCallInfos.classId,
                                choseType: 'checkbox',
                                callBackName: 'rollCall_aboutClass'
                            };
                            obj['schoolTerm'] = { 'schoolYear': $scope.rollCallInfos.classInfo.schoolYear, 'schoolTermId': $scope.rollCallInfos.classInfo.schoolTermId };

                            if ($scope.rollCallInfos.rollcallStudent_5.length > 0) {
                                obj['item']['oldData'] = $scope.rollCallInfos.rollcallStudent_5;
                            };

                            window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_2', '760px', obj);
                            break;
                    }
                };

                //临时学员筛选栏重置
                $scope.onReset_temporary = function() {
                        resetStudentList();
                        $scope.kindSearchOnreset(); //条件搜索重置
                        getTemporaryList(); //获取临时学员列表
                    }
                    //补课学员筛选栏重置
                $scope.onReset_makeup = function() {
                    resetStudentList();
                    $scope.screen_goReset['班级'](); //筛选重置
                    $scope.screen_goReset['学年'](); //筛选重置
                    $scope.screen_goReset['学期'](); //筛选重置
                    $scope.kindSearchOnreset(); //条件搜索重置
                    getMakeupList(); //获取补课学员列表
                }
                $scope.screen_class = []; //筛选-学生列表
                $scope.changeClass = changeClass;
                $scope.changeCourseType = changeCourseType; //临时学员标准课、通用课筛选
                $scope.timeClearHover = timeClearHover; //时间清除按钮出现hover事件
                $scope.timeClear = timeClear; //时间清除
                $scope.timeClearJud = false; //是否显示清除按钮
                $scope.goCommonPop = function(el, id, width, data) {
                    window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                }

            }
            function getConfig() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.config = data.context.config;
                            if ($scope.config & CONFIG_XIUKE_STATUS) {
                                $scope.xiuke = true;
                            }
                        }
                    }
                })
            }
            function numOperate(n, type, numS) {
                if (type == "mins") {
                    if (n.courseTime_ * 1 <= 0) {
                        return;
                    }
                    n.courseTime_ = (n.courseTime_ * 1 - 0.5).toFixed(2);
                    if (n.courseTime_ <= 0) {
                        n.courseTime_ = 0;
                    }
                } else {
                    n.courseTime_ = (n.courseTime_ * 1 + 0.5).toFixed(2);
                }
            }

            function judgeSignInShow() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/face/getApplyStatus",
                    type: "get",
                    data: {},
                    success: function(res) {
                        if (res.status == 200) {
                            console.log(res);
                            $scope.signInshow = res.context.faceDeviceStatus;
                        };
                    }
                });
            }

            function ngMouseenter($event, list) {
                if (list && list.length <= 0) {
                    return;
                }
                var e = $($event.currentTarget),
                    offtot = e.offset().top,
                    offleft = e.offset().left,
                    width = e.width(),
                    inittop = $('#rollCall').offset().top,
                    initleft = $('#rollCall').offset().left;

                e.next('.enrollmouse').css({
                    'top': offtot - inittop + 30,
                    'left': offleft - initleft - 70,
                    'display': 'block'
                });
            }

            function ngMouseleave($event) {
                var e = $($event.currentTarget);
                e.next('.enrollmouse').hide();
            }
            //添加试听学员回调
            $scope.$on('rollCall_listen', function(o, n) {
                angular.forEach(n, function(val) {
                    var jud_ = true;
                    angular.forEach($scope.rollCallInfos.rollcallStudent_4, function(v2) {
                            if (val.id == v2.id) {
                                jud_ = false;
                            }
                        })
                        //判断如果学员不存在则添加到列表里面，如果存在则不重复添加
                    if (jud_) {
                        var obj = {
                            id: val.id,
                            name: val.name,
                            studentStatus: '1',
                            potentialCustomerId: val.potentialCustomerId,
                            studentType: '1'
                        };
                        $scope.rollCallInfos.rollcallStudent_4.push(obj);
                    }
                })
            });
            //添加约课学员回调
            $scope.$on('rollCall_aboutClass', function(o, n) {
                angular.forEach(n, function(val) {
                    var jud_ = true;
                    angular.forEach($scope.rollCallInfos.rollcallStudent_5, function(v2) {
                            if (val.potentialCustomer.id == v2.id) {
                                jud_ = false;
                            }
                        })
                        //判断如果学员不存在则添加到列表里面，如果存在则不重复添加
                    if (jud_) {
                        var obj = {
                            id: val.potentialCustomer.id,
                            name: val.potentialCustomer.name,
                            nickname: val.potentialCustomer.nickname,
                            contractId: val.contract.contractId,
                            course: val.course,
                            buySurplusTime: val.contract.buySurplusTime,
                            giveSurplusTime: val.contract.giveSurplusTime,
                            totalSurplusTime: val.allSurplustime,
                            totalSurplusDayNum: val.allSurplusDateNum,
                            consumedTime: $scope.rollCallInfos.arrangingCoursesTime,
                            courseTime_: $scope.rollCallInfos.arrangingCoursesTime,
                            signStatus: '0',
                            studentStatus: '1',
                            studentType: '4',
                        };
                        $scope.rollCallInfos.rollcallStudent_5.push(obj);
                    }
                })
            })

            //监听点名学员列表变化计算人数
            $scope.$watch("rollCallInfos", function() {
                $scope.rollInclass = $scope.rollAbsent = $scope.rollLeave = 0;
                var list = [];
                for (var i = 1; i < 6; i++) {
                    switch (i) {
                        case 1:
                            list = $scope.rollCallInfos.rollcallStudent_1;
                            break;
                        case 2:
                            list = $scope.rollCallInfos.rollcallStudent_2;
                            break;
                        case 3:
                            list = $scope.rollCallInfos.rollcallStudent_3;
                            break;
                        case 4:
                            list = $scope.rollCallInfos.rollcallStudent_4;
                            break;
                        case 5:
                            list = $scope.rollCallInfos.rollcallStudent_5;
                            break;
                        default:
                            break;
                    }

                    angular.forEach(list, function(n) {
                        var n1 = n2 = n3 = 0;
                        if (n.studentStatus == 1 && n.lockStatus != 1) {
                            n1 = 1;
                        }
                        if (n.studentStatus == 0) {
                            n2 = 1;
                        }
                        if (n.studentStatus == 2) {
                            n3 = 1;
                        }
                        $scope.rollInclass += n1;
                        $scope.rollAbsent += n2;
                        $scope.rollLeave += n3;
                    });
                }
                if ($scope.rollCallInfos.classInfo.activityStatus == 1) {
                    if ($scope.rollCallInfos.rollcallStudent_1 && $scope.rollCallInfos.rollcallStudent_1.length > 0) {
                        angular.forEach($scope.rollCallInfos.rollcallStudent_1, function(n) {
                            if (n.lockStatus != '1' && (n.studentStatus == 1 || n.studentStatus == 0)) {
                                n.courseTime_old = angular.copy(n.courseTime_);
                            }
                        });
                    }
                    if ($scope.rollCallInfos.rollcallStudent_2 && $scope.rollCallInfos.rollcallStudent_2.length > 0) {
                        angular.forEach($scope.rollCallInfos.rollcallStudent_2, function(n) {
                            if (n.lockStatus != '1' && (n.studentStatus == 1 || n.studentStatus == 0)) {
                                n.courseTime_old = angular.copy(n.courseTime_);
                            }
                        });
                    }
                    if ($scope.rollCallInfos.rollcallStudent_5 && $scope.rollCallInfos.rollcallStudent_5.length > 0) {
                        angular.forEach($scope.rollCallInfos.rollcallStudent_5, function(n) {
                            if (n.lockStatus != '1' && (n.studentStatus == 1 || n.studentStatus == 0)) {
                                n.courseTime_old = angular.copy(n.courseTime_);
                            }
                        });
                    }
                }
            }, true);

            function getTermList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: { pageType: 0 },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.screen_term = data.context;
                        }

                    }
                })
            }

            function getClassroomList() {
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

            function changeClasstime(data) {
                $scope.rollCallInfos.operateTime = data;
            }
            //获取点名的上课时间
            function getArrageTime() {
                (function() {
                    laydate.render({
                        elem: '#arrangingCoursesDate', //指定元素
                        isRange: false,
                        max: 0,
                        format: 'yyyy-M-dd',
                        done: function(value) {
                            $scope.rollCallInfos.arrangingCoursesDate = value;
                        }
                    });
                })()
                $scope.rollCallInfos.arrangingCoursesDate = yznDateFormatYMd(props.arrangingCourses.beginDate);
                $scope.rollCallInfos.operateTime = {
                    beginTime: yznDateFormatYMdHm(props.arrangingCourses.beginDate).split(' ')[1],
                    endTime: yznDateFormatYMdHm(props.arrangingCourses.endDate).split(' ')[1]
                }
            }

            function usePreSetTime() {
                window.$rootScope.yznOpenPopUp($scope, 'time-pop', 'preSetTime', '560px');
            }
            //获取点名列表
            function getRollCallList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/getRollCallStudents",
                    type: "get",
                    data: { arrangingCoursesId: props.arrangingCourses.arrangingCoursesId },
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.rollCallInfos.rollcallStudent_1 = []; //本班学员
                            $scope.rollCallInfos.rollcallStudent_2 = []; //临时学员
                            $scope.rollCallInfos.rollcallStudent_3 = []; //补课学员
                            $scope.rollCallInfos.rollcallStudent_4 = []; //试听学员
                            $scope.rollCallInfos.rollcallStudent_5 = []; //约课学员
                            angular.forEach(data.context, function(val) {
                                    val['arrangingCourses'] = [];
                                    if (val['arrangingCoursesList']) {
                                        val['arrangingCourses'] = val['arrangingCoursesList'];
                                    }
                                    //                              if(val.totalSurplusTime<props.arrangingCoursesTime){
                                    //                                  val.lessThenAtime = true;
                                    //                              }
                                    switch (val.studentType) {
                                        case '0':
                                            if ($scope.rollCallInfos.classInfo.activityStatus == 1) {
                                                if ($scope.rollCallInfos.arrangingCoursesStatus != 1) {
                                                    val.courseTime_ = val.studentStatus == 2 ? 0 : (val.classContractR ? val.classContractR.courseTime : 0);
                                                    val.courseTime_old = val.classContractR ? val.classContractR.courseTime : 0;
                                                } else {
                                                    val.courseTime_ = val.consumedTime;
                                                    val.courseTime_old = val.consumedTime;
                                                }
                                            }
                                            $scope.rollCallInfos.rollcallStudent_1.push(val);
                                            break;
                                        case '1':
                                            $scope.rollCallInfos.rollcallStudent_4.push(val);
                                            break;
                                        case '2':
                                            $scope.rollCallInfos.rollcallStudent_3.push(val);
                                            break;
                                        case '3':
                                            if ($scope.rollCallInfos.classInfo.activityStatus == 1) {
                                                if ($scope.rollCallInfos.arrangingCoursesStatus != 1) {
                                                    val.courseTime_ = val.studentStatus == 2 ? 0 : $scope.rollCallInfos.arrangingCoursesTime;
                                                    val.courseTime_old = $scope.rollCallInfos.arrangingCoursesTime;
                                                    //                                              val.courseTime_ = val.studentStatus==2?0:(val.classContractR?val.classContractR.courseTime:0);
                                                    //                                              val.courseTime_old = val.classContractR?val.classContractR.courseTime:0;
                                                } else {
                                                    val.courseTime_ = val.consumedTime;
                                                    val.courseTime_old = val.consumedTime;
                                                }
                                            }
                                            $scope.rollCallInfos.rollcallStudent_2.push(val);
                                            break;
                                        case '4':
                                            if ($scope.rollCallInfos.classInfo.activityStatus == 1) {
                                                if ($scope.rollCallInfos.arrangingCoursesStatus != 1) {
                                                    val.courseTime_ = val.studentStatus == 2 ? 0 : $scope.rollCallInfos.arrangingCoursesTime;
                                                    val.courseTime_old = $scope.rollCallInfos.arrangingCoursesTime;
                                                } else {
                                                    val.courseTime_ = val.consumedTime;
                                                    val.courseTime_old = val.consumedTime;
                                                }
                                            }
                                            $scope.rollCallInfos.rollcallStudent_5.push(val);
                                            break;
                                    }
                                })
                                //                          clickLimit = true;
                            console.log('点名列表', $scope.rollCallInfos);
                        }
                    }
                });
            }
            //重置临时和补课学员的列表数据
            function resetStudentList() {
                $searchType = undefined;
                $searchName = undefined;
                $classId = undefined;
                $year = undefined;
                $term = undefined;
                $courseId = undefined;
                $scope.temporary_time = undefined;
                $scope.course_type = undefined;
                $('#temporary_time').val('');
            }
            //获取主教、助教老师temporaryTeacher
            function getMainTeacher() {
                $scope.mainTeacher = ''; //获取主教老师
                $scope.subTeacher = []; //获取助教老师
                var judge_main = true;
                var judge_sub = true;
                if (props.teachers && props.teachers.length > 0) {
                    angular.forEach(props.teachers, function(val) {
                        val.daike = '0';
                        if (val.teacherType == '1') {
                            if (judge_main) {
                                $scope.mainTeacher = val; //主教老师
                            }
                        } else {
                            if (judge_sub) {
                                $scope.subTeacher.push(val); //助教老师
                            }
                        }
                    })
                } else {
                    $scope.mainTeacher.teacherName = "";
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
                $scope.$broadcast('请选择助教', 'clearSatus'); //清空勾选
                setTimeout(function() {
                    $scope.$broadcast('请选择助教', 'reloadData', { 'data': $scope.subTeacher, 'att': 'shopTeacherId' }); //默认勾选
                })
            }
            //获取老师列表
            function getTeacherList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/getTeacherByArrangingCoursesId",
                    type: "get",
                    data: { arrangingCoursesId: props.arrangingCourses.arrangingCoursesId },
                    success: function(res) {
                        if (res.status == 200) {
                            angular.forEach(res.context.teachers, function(val) {
                                val.daike = '0';
                            });
                            //                          angular.forEach(res.context.temporaryTeacher, function(val) {
                            //                              val.daike = '1';
                            //                          });
                            //                          $scope.teacherList = res.context.teachers.concat(res.context.temporaryTeacher);
                            $scope.teacherList = res.context.teachers;
                            if ($scope.mainTeacher.shopTeacherId) getMainSubTeacherList($scope.mainTeacher);
                        }
                    }
                });
            }

            function getcoursethemeList(id) {
                var param = {
                    courseId: id ? id : undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.courseThemeList_ = data.context;
                        }
                    }
                })
            };
            //获取补课班级列表
            function getClassList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/list",
                    type: "get",
                    data: {
                        'courseId': props.course.courseId,
                        'pageType': 0,
                        // 'schoolYear': props.classInfo.schoolYear?props.classInfo.schoolYear:undefined,
                        // 'schoolTermId': props.classInfo.schoolTermId?props.classInfo.schoolTermId:undefined,
                        'schoolYear': $year,
                        'schoolTermId': $term,
                        'classType': "0",
                    },
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.screen_class = res.context;
                        }
                    }
                });
            }
            //获取临时学员列表
            function getTemporaryList() {
                //如果点名数据还没有取回，则不允许取临时学员列表
                if (!$scope.rollCallInfos.rollcallStudent_1) {
                    return;
                }

                var list = $scope.rollCallInfos.rollcallStudent_1.concat($scope.rollCallInfos.rollcallStudent_2).concat($scope.rollCallInfos.rollcallStudent_3).concat($scope.rollCallInfos.rollcallStudent_4).concat($scope.rollCallInfos.rollcallStudent_5);
                var data = {
                    arrangingCoursesId: props.arrangingCourses.arrangingCoursesId,
                    searchType: $searchName ? "appSearchName" : undefined,
                    searchName: $searchName,
                    courseId: props.course.courseId,
                    courseType: $scope.course_type,
                    pcIdList: arrToStr(list, "potentialCustomerId")
                }
                $scope.temporaryList = [];
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/getTemporaryStudents",
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.temporaryList = res.context;
                            //                          handleList($scope.temporaryList, $scope.rollCallInfos.rollcallStudent_2, 'temporary');
                        }
                    }
                });
            }
            //获取补课学员列表
            function getMakeupList() {
                var list = $scope.rollCallInfos.rollcallStudent_1.concat($scope.rollCallInfos.rollcallStudent_2).concat($scope.rollCallInfos.rollcallStudent_3).concat($scope.rollCallInfos.rollcallStudent_4).concat($scope.rollCallInfos.rollcallStudent_5);
                console.log(list);
                var data = {
                    arrangingCoursesId: props.arrangingCourses.arrangingCoursesId,
                    searchType: $searchName ? "appSearchName" : undefined,
                    searchName: $searchName,
                    courseId: $courseId,
                    classId: $classId,
                    schoolYear: $year,
                    schoolTermId: $term,
                    pcIdList: arrToStr(list, "potentialCustomerId")
                }

                if ($scope.temporary_time) {
                    data.beginDate = $scope.temporary_time.split("到")[0] + " 00:00:00";
                    data.endDate = $scope.temporary_time.split("到")[1] + " 23:59:59";
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/getBuKeStudentByArrangingCoursesId",
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.makeupList = res.context;
                            //                          handleList($scope.makeupList, $scope.rollCallInfos.rollcallStudent_3, 'makeup');
                        }
                    }
                });
            }
            //获取所需时间
            function getNeedTime(timeBeg, timeEnd, week) {
                var y = $.format.date(timeBeg, 'yyyy-MM-dd');
                var b = $.format.date(timeBeg, 'HH:mm');
                var e = $.format.date(timeEnd, 'HH:mm');
                var t = '';
                if (week) {
                    var w = returnweek(week);
                    t = y + ' ( ' + w + ' )  ' + b + '-' + e;
                } else {
                    t = y + '  ' + b + '-' + e;
                }
                return t;
            };

            //回车搜索
            function Enterkeyup(data, type) {
                $searchType = data.type;
                $searchName = data.value;
                if (type == 'makeup') {
                    getMakeupList();
                } else {
                    getTemporaryList();
                }
            }
            //按钮搜索
            function SearchData(data, type) {
                $searchType = data.type;
                $searchName = data.value;
                if (type == 'makeup') {
                    getMakeupList();
                } else {
                    getTemporaryList();
                }
            }

            function changeCourseType(e, val) {
                $scope.course_type = e.target.checked ? val : undefined;
                getTemporaryList();
            }
            //点击全选
            function clickCheckboxAll(model, list) {
                //              $scope.checkboxAll = evt.target.checked;
                angular.forEach(list, function(v) {
                    v.hasChecked = model ? true : false;
                });
            }
            //点击选择checked
            function selectChecked(is, data) {
                data.hasChecked = !data.hasChecked;
                //              if(is == true) {
                //                  data.hasChecked = false;
                //              } else {
                //                  data.hasChecked = true;
                //              }
            }
            //点击锁定和解锁或者删除
            function clickLock(state, data, ind) {
                if (!data.name) {
                    data.name = '';
                }
                if (state == 0) {
                    var xiuStudent = layer.confirm('是否确定休课？休课后该学员在当前班级中不可点名上课', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        data.lockStatus = '1';
                        data.studentStatus = null;
                        layer.close(xiuStudent);
                        $scope.$apply();
                    }, function() {
                        layer.close(xiuStudent);
                    })
                } else if (state == 1) {
                    detailMsk("是否确定复课？复课后该学员在当前班级中可正常点名上课", function() {
                        data.lockStatus = '0';
                        data.studentStatus = '1';
                    });

                } else if (state == null) {
                    var deletStudent = layer.confirm('是否删除  "' + data.name + '"  的点名记录', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $scope.$apply(function() {
                            if (data.studentType == '2') {
                                $scope.rollCallInfos.rollcallStudent_3.splice(ind, 1); //补课
                            } else if (data.studentType == '3') {
                                $scope.rollCallInfos.rollcallStudent_2.splice(ind, 1); //临时
                            } else if (data.studentType == '0') {
                                $scope.rollCallInfos.rollcallStudent_1.splice(ind, 1); //本班
                            } else if (data.studentType == '1') {
                                $scope.rollCallInfos.rollcallStudent_4.splice(ind, 1); //试听
                            }
                        })
                        layer.close(deletStudent);
                    }, function() {
                        layer.close(deletStudent);
                    })
                }
            }
            //上课主题
            function selectTheme(n) {
                $scope.courseThemeId = n ? n.courseThemeId : "";
            }
            //选择主教
            function clickMainTeacher(data) {
                if (data) {
                    $scope.mainTeacher = data;
                    getMainSubTeacherList(data);
                } else {
                    $scope.mainTeacher = [];
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
            //选择班级
            function changeClass(data) {
                if (data == null) {
                    $classId = undefined;
                } else {
                    $classId = data.classId;
                }
                getMakeupList();
            }
            //选择学年
            function sel_changeYear(y) {
                $year = y == null ? undefined : y.year;
                getMakeupList();
                getClassList();
            }
            //选择学期
            function sel_changeTerm(t) {
                $term = t == null ? undefined : t.schoolTermId;
                getMakeupList();
                getClassList();
            }
            //点击学员弹窗确定
            function sureStudent(obj) {

                var nowTime = (new Date()).getTime();
                //检查是否连续点击，如果是连续点击就直接不处理
                if (nowTime - lastClickTime < 200) {
                    lastClickTime = nowTime;
                    return;
                }
                lastClickTime = nowTime;

                var data = [];
                var result = [];
                var result_ = [];
                if (obj == 'temporary') {
                    //                  $scope.rollCallInfos.rollcallStudent_2 = [];
                    angular.forEach($scope.temporaryList, function(val) {
                            if (val.hasChecked == true) {
                                data.push(val);
                            }
                        })
                        //                  if($scope.checkboxAll == true) {
                        //                      data = $scope.temporaryList;
                        //                  }

                    if (isRepeat(data, "id")) {
                        return layer.msg("学员课程选择重复！学员在一节课中只能选择一门课程进行消课，请重新选择");
                    }
                    angular.forEach(data, function(val) {
                        var o = {
                            id: val.id,
                            potentialCustomerId: val.potentialCustomerId,
                            name: val.name,
                            nickname: val.nickname,
                            contractId: val.contractId,
                            course: val.course,
                            buySurplusTime: val.buySurplusTime,
                            giveSurplusTime: val.giveSurplusTime,
                            totalSurplusTime: val.totalSurplusTime,
                            totalSurplusDayNum: val.totalSurplusDayNum,
                            consumedTime: $scope.rollCallInfos.arrangingCoursesTime,
                            courseTime_: $scope.rollCallInfos.arrangingCoursesTime,
                            bukeStatus: val.bukeStatus,
                            signStatus: '0',
                            studentStatus: '1',
                            studentType: '3',
                            contract: val.contract
                        };
                        $scope.rollCallInfos.rollcallStudent_2.push(o);
                        console.log($scope.rollCallInfos.rollcallStudent_2);
                    })
                    $scope.closePopup('roll_temporary_stu');
                } else {
                    angular.forEach($scope.makeupList, function(val) {
                            if (val.hasChecked == true) {
                                data.push(val);
                            }
                        })
                        //                  if($scope.checkboxAll == true) {
                        //                      data = $scope.makeupList;
                        //                  }
                        //                  $scope.rollCallInfos.rollcallStudent_3 = [];
                    angular.forEach(data, function(val) {
                        var o = {
                            id: val.student.id,
                            potentialCustomerId: val.contract.potentialCustomerId,
                            name: val.student.name,
                            nickname: val.student.nickname,
                            contractId: val.contract.contractId,
                            course: val.course,
                            buySurplusTime: parseFloat(val.contract.buySurplusTime),
                            giveSurplusTime: parseFloat(val.contract.giveSurplusTime),
                            totalSurplusTime: parseFloat(val.contract.allSurplusTimes),
                            totalSurplusDayNum: parseFloat(val.contract.totalSurplusDayNum),
                            makeUpTime: val.arrangingCourses.arrangingCoursesTime,
                            bukeStatus: val.bukeStatus,
                            signStatus: '0',
                            studentStatus: '1',
                            studentType: '2',
                            arrangingCoursesId: val.arrangingCourses.arrangingCoursesId,
                            arrangingCourses: [{ arrangingCoursesId: val.arrangingCourses.arrangingCoursesId, beginDate: val.arrangingCourses.beginDate, endDate: val.arrangingCourses.endDate, className: val.classInfo.className, arrangingCoursesTime: val.arrangingCourses.arrangingCoursesTime, studentCourseTimeInfo: { feeType: val.studentCourseTimeInfo.feeType } }],
                        }
                        var judRepeat = true;
                        angular.forEach($scope.rollCallInfos.rollcallStudent_3, function(val_) {
                            if (o.id == val_.id) {
                                val_.arrangingCourses.push({ arrangingCoursesId: val.arrangingCourses.arrangingCoursesId, beginDate: val.arrangingCourses.beginDate, endDate: val.arrangingCourses.endDate, className: val.classInfo.className, arrangingCoursesTime: val.arrangingCourses.arrangingCoursesTime, studentCourseTimeInfo: { feeType: val.studentCourseTimeInfo.feeType } });
                                val_.makeUpTime = parseFloat(val_.makeUpTime) + parseFloat(val.arrangingCourses.arrangingCoursesTime);
                                judRepeat = false;
                            }
                        })
                        if (judRepeat) {
                            $scope.rollCallInfos.rollcallStudent_3.push(o);
                        }
                    })
                    console.log($scope.rollCallInfos.rollcallStudent_3)
                    $scope.closePopup('roll_makeup_stu');
                }
            }

            function isRepeat(arr, attrs) {
                var hash = {};
                for (var i in arr) {
                    if (hash[getAttFun(arr[i], attrs)]) //hash 哈希
                        return true;
                    hash[getAttFun(arr[i], attrs)] = true;
                }
                return false;
            }

            //确认点名
            var timeDialog;

            function sureRollCall() {
                if ($scope.rollCallInfos.page != 'mySchedule') {
                    if (!$scope.rollCallInfos.arrangingCoursesDate) {
                        return layer.msg("请选择上课日期");
                    }
                    if (!$scope.rollCallInfos.arrangingCoursesTime) {
                        return layer.msg("请输入授课课时");
                    }
                }
                if (!$scope.rollCallInfos.classRoom.classroomId) {
                    return layer.msg("请选择上课教室");
                }
                $scope.studentBuyTimes = getStudentBuyTimes();
                if ($scope.studentBuyTimes > 0) {
                    timeDialog = layer.confirm($scope.studentBuyTimes + '名学员购买课时或购买天数不足，是否操作点名？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['继续点名', '返回编辑'] //按钮
                    }, function() {
                        sureRollCallConfirm();
                    }, function() {
                        layer.close(timeDialog);
                    })
                } else {
                    sureRollCallConfirm();
                }
            }

            function sureRollCallConfirm() {
                if ($scope.rollCallInfos.operateTime.beginTime > $scope.rollCallInfos.operateTime.endTime) {
                    return layer.msg("上课开始时间必须小于结束时间!");
                }
                //              if(clickLimit) {
                //                  clickLimit = false;
                //              } else {
                //                  return;
                //              }

                var rollcallStudent = $scope.rollCallInfos.rollcallStudent_1.concat($scope.rollCallInfos.rollcallStudent_2).concat($scope.rollCallInfos.rollcallStudent_3).concat($scope.rollCallInfos.rollcallStudent_4).concat($scope.rollCallInfos.rollcallStudent_5);
                var studentList = [];
                var teachersList = [];
                angular.forEach(rollcallStudent, function(val) {
                    var o = {};
                    if (val) {
                        o = {
                            studentId: val.id,
                            studentStatus: val.studentStatus,
                            contractId: val.contractId,
                            auditionRecordId: val.auditionRecordId,
                            studentType: val.studentType,
                            lockStatus: val.lockStatus ? val.lockStatus : undefined,
                        }
                    } else {
                        //为什么val会没值，需要跟踪查找问题原因，
                        for (var i = 1; i < 6; i++) {
                            angular.forEach($scope.rollCallInfos["rollcallStudent_" + i], function(item) {
                                if (!item) {
                                    var jsLog = {
                                        stack: '####' + "rollcallStudent_" + i + "空对象",
                                        url: window.location.href
                                    };
                                    commitJsException(jsLog);
                                }
                            })
                        }
                    }
                    o["arrangingCoursesList"] = [{ arrangingCoursesId: (val && val.arrangingCoursesId) ? val.arrangingCoursesId : (props.arrangingCourses ? props.arrangingCourses.arrangingCoursesId : undefined) }];
                    //                  if($scope.rollCallInfos.courseType == 3){
                    //                      if($scope.rollCallInfos.arrangingCoursesStatus!=1){
                    //                          val.courseTime_ = val.classContractR?val.classContractR.courseTime:0;
                    //                      }else{
                    //                          val.courseTime_ = val.consumedTime;
                    //                      }
                    //                  }
                    //                  活动班点名    ： 临时学员  约课学员    本班学员修改消课课时
                    if ($scope.rollCallInfos.classInfo.activityStatus == 1) {
                        o.courseTime = val.courseTime_;
                    }
                    //如果是补课学员合并的
                    if (val.arrangingCourses) {
                        o.arrangingCoursesList = [];
                        angular.forEach(val.arrangingCourses, function(val_) {
                            o.arrangingCoursesList.push({ arrangingCoursesId: val_.arrangingCoursesId });
                        })
                    }
                    studentList.push(o);
                })
                angular.forEach($scope.subTeacher, function(val) {
                    var o = {
                        teacherType: '0',
                        teacherId: val.teacherId,
                        shopTeacherId: val.shopTeacherId,
                        daike: val.daike,
                    }
                    teachersList.push(o);
                })

                if ($scope.mainTeacher) {
                    teachersList.push({ teacherType: '1', shopTeacherId: $scope.mainTeacher.shopTeacherId, teacherId: $scope.mainTeacher.teacherId, daike: $scope.mainTeacher.daike, });
                } else {
                    layer.msg("请选择主教老师");
                    return;
                }
                var url_ = "/api/oa/course/";
                if (props.page == "mySchedule") {
                    url_ = "/api/oa/myCourse/";
                }
                var data = {
                    arrangingCoursesId: props.arrangingCourses.arrangingCoursesId,
                    remark: $scope.rollCallInfos.remark,
                    classroomId: $scope.rollCallInfos.classRoom.classroomId,
                    studentCourseTimeInfos: studentList,
                    teachers: teachersList,
                    courseThemeId: $scope.courseThemeId,
                    arrangingCoursesTime: props.arrangingCoursesTime,
                    arrangingCoursesBeginDate: $scope.rollCallInfos.arrangingCoursesDate + " " + $scope.rollCallInfos.operateTime.beginTime + ":00",
                    arrangingCoursesEndDate: $scope.rollCallInfos.arrangingCoursesDate + " " + $scope.rollCallInfos.operateTime.endTime + ":00",
                }

                $.hello({
                    url: CONFIG.URL + url_ + "rollCallInOaNew",
                    type: "post",
                    data: JSON.stringify(data),
                    success: function(res) {

                        if (res.status == 200) {
                            //                           clickLimit = true;
                            if ($scope.studentBuyTimes > 0) {
                                layer.close(timeDialog);
                            }
                            if ($scope.$parent && $scope.$parent.reloadList) {
                                $scope.$parent.reloadList();
                            }
                            if (props.fromPage == "classAffair") {
                                $scope.$emit("changeClassAffair");
                                $scope.$emit("reloadSignIn");
                                if (SERVICE.CLASSAFFAIR.ROLLCALL[props.callBackName]) {
                                    SERVICE.CLASSAFFAIR.ROLLCALL[props.callBackName](data);
                                };
                                $scope.$emit('roll_scheduleListChange');
                            }
                            $scope.$emit('scheduleChange', "true");
                            $scope.$emit('scheduleListChange');
                            layer.msg('点名成功');
                            $scope.closePopup();
                        }
                    }
                });
            }
            //           1 正常 0 缺席 2 请假
            function getStudentBuyTimes() {
                var arr = [];
                if (!$scope.rollCallInfos.rollcallStudent_1) {
                    $scope.rollCallInfos.rollcallStudent_1 = [];
                } else {
                    var list = $scope.rollCallInfos.rollcallStudent_1;
                    angular.forEach(list, function(v) {
                            if (v.lockStatus != 1) {
                                arr.push(v);
                            }
                        })
                        //                  $scope.rollCallInfos.rollcallStudent_1 = arr;
                }
                var list1_2 = arr.concat($scope.rollCallInfos.rollcallStudent_2);
                var num = 0;
                angular.forEach(list1_2, function(v) {
                    if (v) {
                        if (v.studentStatus == 1) {
                            //                          if(v.course.chargeStandardType==2){
                            if (v.totalSurplusTime < $scope.rollCallInfos.arrangingCoursesTime && v.totalSurplusDayNum <= 0) {
                                num += 1;
                            }
                            //                          }else{
                            //                              if(v.totalSurplusTime<$scope.rollCallInfos.arrangingCoursesTime){
                            //                                  num+=1;
                            //                              }
                            //                          }
                        }
                    }
                });
                angular.forEach($scope.rollCallInfos.rollcallStudent_3, function(v) {
                    if (v) {
                        if (v.studentStatus == 1) {
                            if (v.totalSurplusTime < v.makeUpTime && v.totalSurplusDayNum <= 0) {
                                num += 1;
                            }
                        }
                    }
                });
                return num;
            }
            //处理临时学员列表和补课学员列表的已选项-放前面(list_1: 需要处理的数据， list_2：对比的数据)
            function handleList(list_1, list_2, type) {
                angular.forEach(list_2, function(val) {
                    var jud = true;
                    angular.forEach(list_1, function(val_, ind) {
                        if (type == 'temporary') {
                            if (val.id == val_.id && props.courseId == val_.courseId) {
                                jud = false;
                                val_.hasChecked = true;
                                contrastList(ind);
                            }
                        } else {
                            if (val_.student.id == val.id) {
                                angular.forEach(val.arrangingCourses, function(data) {
                                    if (val_.arrangingCourses.arrangingCoursesId == data.arrangingCoursesId) {
                                        jud = false;
                                        val_.hasChecked = true;
                                        contrastList(ind);
                                    }
                                })
                            }
                        }
                    })
                    if (jud) {
                        if (type == 'temporary') {
                            val.hasChecked = true;
                            list_1.unshift(val)
                        } else {
                            list_1.unshift({
                                student: { id: val.id, name: val.name, nickname: val.nickname },
                                course: props.course,
                                classInfo: { className: val.arrangingCourses[0] ? val.arrangingCourses[0].className : undefined },
                                contract: {
                                    allSurplusTimes: val.totalSurplusTime,
                                    buySurplusTime: val.buySurplusTime,
                                    giveSurplusTime: val.giveSurplusTime,
                                    contractId: val.contractId,
                                    totalSurplusDayNum: val.totalSurplusDayNum,
                                },
                                arrangingCourses: val.arrangingCourses[0],
                                hasChecked: true,
                                bukeStatus: val.bukeStatus
                            })
                        }
                    }
                });
                //对比，用冒泡的方法挑出特殊的排在前面
                function contrastList(ind) {
                    for (var i = 0; i < ind; i++) {
                        if (!list_1[i].hasChecked) {
                            var ls = list_1[ind];
                            list_1[ind] = list_1[i];
                            list_1[i] = ls;
                            break;
                        }
                    }
                }
            }

            //时间处理
            function timeClearHover() {
                if ($('#temporary_time').val()) {
                    $scope.timeClearJud = true;
                }
            }

            function timeClear() {
                if ($scope.timeClearJud) {
                    $('#temporary_time').val('');
                    $scope.temporary_time = undefined;
                    $scope.timeClearJud = false;
                    getMakeupList();
                }
            }

            function goBatchXiaoke(list) {
                $scope.setXiaokeList = list;
                $scope.xiaokeTime = "";
                $scope.goPopup('roll_xiaoke_pop', '560px');
                $scope.xiaoke_confirm = function() {
                    angular.forEach($scope.setXiaokeList, function(v) {
                        if (v.lockStatus != '1') {
                            v.courseTime_ = $scope.xiaokeTime;
                        }
                    });
                    $scope.closePopup('roll_xiaoke_pop');
                }
            }
        }
    })
})