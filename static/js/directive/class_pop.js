define(['laydate', 'mySelect', "rollCall", "timePop", "arrangePop", "signUp", "operation", "potential_pop", "addInfos", 'szpUtil', 'classroomPop', 'students_sel', 'databasePop'], function(laydate) {
    creatPopup({
        el: 'classPop',
        openPopupFn: 'viewClass',
        //      closePopupFn: 'closeRollCall',
        htmlUrl: './templates/popup/class_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state, $sce) {
            var global_classId, global_status, global_courseId;
            $scope.isactive = 1;
            console.log(props);
            if (props) {
                $scope.props = props;
                global_classId = props.item ? props.item.classId : undefined;
                global_status = props.item ? props.item.classStatus : undefined;
                global_courseId = props.item ? props.item.course.courseId : undefined;
            } else {
                $scope.props = "";
                global_classId = undefined;
                global_status = undefined;
                global_courseId = undefined;
            }
            init();
            console.log(props);

            function init() {
                getCourseTheme(global_courseId); //获取上课主题列表
                switch (props.title) {
                    case "升班":
                        shengbanInit(); //升班
                        break;
                        //                  case "结业":
                        //                      graduateInit(); //结业
                        break;
                    case "删除":
                        deleteInit(); //删除
                        break;
                    case "关于班级":
                        ABOUTCLASSINIT(); //新增班级
                        break;
                    default:
                        break;
                };
                $scope.popNav = [{
                    name: '班级信息',
                    tab: 1
                }, {
                    name: '班级课表',
                    tab: 2
                }, {
                    name: '本班学员',
                    tab: 3
                }, {
                    name: '打卡作业',
                    tab: 5
                }, {
                    name: '班级相册',
                    tab: 4
                }];
                $scope.bookingSture = getFunctionStatus(0x0002); //约课开关
                $scope.isViewClass = checkAuthMenuById("33");
                $scope.isOperatePop = checkAuthMenuById("34");
                $scope.pop_changePaike = checkAuthMenuById("37"); //变更排课权限
                $scope.pop_fastPaike = checkAuthMenuById("38"); //快速排课权限
                $scope.caclBirthToAge = caclBirthToAge; //获取年龄
                $scope.popNavSelected = props.tab;
                $scope.changePopNav = changePopNav; //主弹框tab切换
                $scope.changeNewCourse = changeNewCourse; //升班--选择新课程
                $scope.changeNewYear = changeNewYear; //升班--选择新学年
                $scope.changeNewPack = changeNewPack; //升班--选择新学期
                $scope.confirm_delete = confirm_delete; //删除班级
                $scope.getClassStatus = getClassStatus; //班级状态
                $scope.classStudStatus = classStudStatus; //本班学员状态
                $scope.confirm_btn = confirm_btn; //单个升班确认弹框
                $scope.confirm_shengban = confirm_shengban; //确认单个班级升班
                $scope.confirm_class = confirm_class; //确认新增或者编辑班级
                $scope.confirm_class_paike = confirm_class_paike; //确认新增去排课
                $scope.checkboxAll = checkboxAll; //复选全选
                $scope.checkSingle = checkSingle; //复选单选
                $scope.years = getSomeYears(); //获取学年

                $scope.ngMouseenter = ngMouseenter;
                $scope.ngMouseleave = ngMouseleave;
                $scope.graduate = graduate;
                $scope.cancelGrad = cancelGrad;
                //转成yyyy-MM-dd HH:mm
                $scope.$yznDateFormatYMdHm = $yznDateFormatYMdHm;
                if (props.tab) {
                    changePopNav(props.tab);
                }
                if (props.item.classId) {
                    getClassDetail(props.item.classId);
                }

                (function() {
                    lay('.laydate').each(function(v, k) {
                        laydate.render({
                            elem: this,
                            isRange: false,
                            type: "datetime",
                            trigger: 'click',
                            done: function(value) {
                                $scope.LAYDATE = value;
                            }
                        });
                    });
                    lay('.laydateyear').each(function(v, k) {
                        laydate.render({
                            elem: this,
                            range: "到",
                            isRange: true,
                            btns: ['confirm'],
                            trigger: 'click',
                            done: function(value) {
                                $scope.LAYDATEYEAR = value;
                            }
                        });
                    });
                })();
            };
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.$on('classChange', function() {
                getClassDetail(props.item.classId);
            });

            $scope.$on("classroomChange", function() {
                getClassroomList();
            });
            //将三中tab  分别写进3个方法里 ，可以精细区分
            function changePopNav(val) {
                if (props.item.classId) {
                    getClassDetail(props.item.classId);
                }
                $scope.popNavSelected = val;
                switch (val) {
                    case 1:
                        BASEINFOFUNCTION();
                        break;
                    case 2:
                        CLASSSCHEDULE();
                        break;
                    case 3:
                        CLASSSTUDENTS();
                        break;
                    case 4:
                        CLASSPHOTOS();
                        break;
                    case 5:
                        CLASSCLOCK();
                        break;
                    default:
                        break;
                }
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
                            console.log(data.context);
                            $scope.classroomList = data.context.items;
                        }

                    }
                })
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
                            $scope.courseThemeRs = data.context;
                        }
                    }
                });
            }

            function checkboxAll(d, list, type) {
                if (list) {
                    for (var m = 0, lenm = list.length; m < lenm; m++) {
                        var val = list[m];
                        if (d) {
                            if (type !== 'shengban') {
                                if (type == "studRt") {
                                    var isRepeat = false;
                                    var arr = removeSelf(val, list, "studRt");
                                    for (var i = 0, len = arr.length; i < len; i++) {
                                        if (!arr[i].disabled) {
                                            if (val.potentialCustomer.id == arr[i].potentialCustomer.id) {
                                                isRepeat = true;
                                                $scope.selAll_rt = false;
                                                return layer.msg("所选学员中有报读2门可插班的课程；无法进行全选操作");
                                                break;
                                            }
                                        }
                                    }
                                    if (!isRepeat) {
                                        val.hasChecked = true;
                                    }
                                } else {
                                    val.hasChecked = true;
                                }
                            } else {
                                if (val.disabled) {
                                    var isRepeat = false;
                                    var arr = removeSelf(val, list, "shengban");
                                    for (var i = 0, len = arr.length; i < len; i++) {
                                        if (arr[i].disabled) {
                                            if (val.potentialCustomer.id == arr[i].potentialCustomer.id) {
                                                isRepeat = true;
                                                $scope.checkAll = false;
                                                return layer.msg("所选学员中有报读2门可升班的课程；无法进行全选操作");
                                                break;
                                            }
                                        }
                                    }
                                    if (!isRepeat) {
                                        val.hasChecked = true;
                                    }

                                } else {
                                    val.hasChecked = false;
                                }
                            }
                        } else {
                            val.hasChecked = false;
                        }
                    }
                }
            }

            function checkSingle(x, type, l, model) {
                var list = removeSelf(x, l, model);
                if (x.hasChecked) {
                    x.hasChecked = false;
                    if (type == "rmrepeat") {
                        angular.forEach(list, function(v) {
                            if (x.potentialCustomer.id == v.potentialCustomer.id) {
                                switch (model) {
                                    case "shengban":
                                        v.disabled = true;
                                        break;
                                    case "studRt":
                                        v.disabled = false;
                                        break;
                                    default:
                                        break;
                                }
                            }
                        });
                    }
                } else {
                    x.hasChecked = true;
                    if (type == "rmrepeat") {
                        angular.forEach(list, function(v) {
                            if (x.potentialCustomer.id == v.potentialCustomer.id) {
                                switch (model) {
                                    case "shengban":
                                        v.disabled = false;
                                        break;
                                    case "studRt":
                                        v.disabled = true;
                                        break;
                                    default:
                                        break;
                                }
                            }
                        });
                    }
                }
            }

            function removeSelf(x, arr, model) {
                var list = [];
                switch (model) {
                    case "shengban":
                        angular.forEach(arr, function(v) {
                            if (x.newContract && v.newContract && x.newContract.contractId != v.newContract.contractId) {
                                list.push(v);
                            }
                        });
                        break;
                    case "studRt":
                        angular.forEach(arr, function(v) {
                            if (x.contract.contractId != v.contract.contractId) {
                                list.push(v);
                            }
                        });
                        break;
                    default:
                        break;
                }
                console.log(list);
                return list;
            }
            //班级信息
            function BASEINFOFUNCTION() {
                $scope.class_edit = class_edit; //编辑班级
                $scope.class_delete = class_delete; //班级删除
                $scope.class_shengban = class_shengban; //升班

                //              getClassDetail(global_classId);

                function class_edit(id, width, param) {
                    props["location"] = "inside";
                    props["title"] = "关于班级";
                    props["type"] = "edit";
                    $scope.goPopup(id, width, param);
                    ABOUTCLASSINIT();
                }

                function class_delete(id, width, param) {
                    props = param;
                    $scope.goPopup(id, width, param);
                    if (param.title == "删除") {
                        deleteInit();
                    }
                }

                function class_shengban(id, width, param) {
                    props = param;
                    shengbanInit();
                    $scope.goPopup(id, width, param);
                }

            }

            function graduate(type) {
                var param = {
                    "classId": global_classId,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/studentGraduation",
                    type: "POST",
                    data: JSON.stringify(param),
                    success: function(res) {
                        console.log(res);
                        if (res.status == 200) {
                            confirmPop("班级结业后，表示该班级上课已经结束，不能再修改班<br>级信息，学员不能再插入到该班级。确定要结业吗？", {
                                "classId": global_classId,
                                "studentGraduationStatus": 1,
                            });

                        } else if (res.status == '20018') {
                            detailMsk("班级结业后，表示该班级上课已经结束，不能再修改班<br>级信息，学员不能再插入到该班级。确定要结业吗？", function() {
                                confirmPop("班级中存在未点名的课次，确定要删除未点名的课次，并完成班级结业吗？", {
                                    "classId": global_classId,
                                    "studentGraduationStatus": 1,
                                    "deleteArrangingCourses": 1
                                });
                            }, function() {}, ["确定", "取消"]);
                            return true;
                        } else if (res.status == '20022') {
                            detailMsk("班级中存在未结束的打卡作业，不能直接结业，请单独处理后再试", null, null, ["确定"]);
                            return true;
                        }
                    }
                });
            }
            function cancelGrad() {
                var msg = "<div class='textAlignCenter'>确认取消结业？<br>取消后系统将允许修改班级信息、分班、排课、升班等操作<br>(若学员已结课，则系统不会将该类型学员重新分配至本班级)</div>";
                detailMsk(msg, function () {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/cancelGraduation",
                        type: "post",
                        data: JSON.stringify({ classId: global_classId }),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.$emit("classListChange", "false");
                                getClassDetail(global_classId);
                            }
                        }
                    })
                });
            }

            function confirmPop(title, param) {
                detailMsk(title, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/studentGraduation",
                        type: "POST",
                        data: JSON.stringify(param),
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.$emit("classListChange", "false");
                                getClassDetail(global_classId);
                            }
                        }
                    })
                }, null, ["确定", "取消"]);
            }
            //本班课表
            function CLASSSCHEDULE() {
                var class_pagerRender = false,
                    class_start = 0,
                    class_eachPage = localStorage.getItem('classPaike') ? localStorage.getItem('classPaike') : 20; //页码初始化
                //              $scope.isactive = $scope.classInfo.classStatus==2?2:1;
                getScheduleList(0);
                $scope.tab_class_schedule = tab_class_schedule; //切换本班课表的tab页
                $scope.changePaike = changePaike; //变更排课
                $scope.deleteScdl = deleteScdl; //删除该课表
                $scope.batchOperate = batchOperate; //批量操作
                $scope.classRollCall = classRollCall; //班级点名
                $scope.goCourseManage = goCourseManage; //跳转到排课页面
                $scope.deleteSignup = deleteSignup; //删除点名

                function classRollCall(d) {
                    var data = angular.copy(d);
                    console.log(data);
                    data['arrangingCourses'] = {};
                    data['classRoom'] = {};
                    data['arrangingCourses']['arrangingCoursesId'] = d.arrangingCoursesId;
                    data['arrangingCourses']['beginDate'] = d.arrangingCoursesBeginDate;
                    data['arrangingCourses']['endDate'] = d.arrangingCoursesEndDate;
                    data['classRoom']['classroomId'] = d.classroomId;
                    data['classRoom']['classRoomName'] = d.classRoomName;
                    window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', data);
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
                                    $scope.$emit('scheduleListChange', '删除点名');
                                };
                            }
                        })
                    }, function() {
                        layer.close(isConfirm);
                    })
                }

                function tab_class_schedule(n) {
                    $scope.scheduleList = [];
                    class_eachPage = 20;
                    class_pagerRender = false;
                    $scope.isactive = n;
                    getScheduleList(0);
                }

                function goCourseManage() {
                    var data = {
                        "courseId": $scope.classInfo.course.courseId,
                        "classRoomId": $scope.classInfo.classId
                    };
                    if ($scope.classInfo.schoolTerm) {
                        data.packageYear = $scope.classInfo.schoolTerm.packageYear;
                        data.className = $scope.classInfo.className;
                        data.classMax = $scope.classInfo.classMax;
                    }

                    $scope.closePopup("class_pop");
                    $state.go("courseManage", {
                        "onPreview": false,
                        "classPaike": data
                    })
                };

                function changePaike() {
                    $scope.goPopup("changePaike", "760px");
                }

                function deleteScdl(x, deleteStatus) {
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
                            data: JSON.stringify({ "arrangingCoursesId": x.arrangingCoursesId, 'deleteStatus': deleteStatus_1 ? deleteStatus_1 : undefined }),
                            success: function(data) {
                                if (data.status == "200") {
                                    layer.msg('已成功删除排课', {
                                        icon: 1
                                    });
                                    class_pagerRender = false;
                                    getScheduleList(0);
                                } else if (data.status == "20022") {
                                    deleteScdl(x, 1);
                                    return true;
                                }
                            }
                        })
                    }
                }

                $scope.$on('scheduleListChange', function(event, data) {
                    if (!data) {
                        getScheduleList(class_start);
                    } else {
                        class_pagerRender = false;
                        getScheduleList(0);
                    }
                });
                $scope.$on('op_scheduleListChange', function(event, data) {
                    op_getScheduleList();
                });

                function getScheduleList(start) {
                    var param = {
                        start: start.toString(),
                        count: class_eachPage,
                        classId: global_classId,
                        status: $scope.isactive == 1 ? "0" : "1",
                        orderTyp: "asc",
                        orderName: "arrangingCourses_begin_date"
                    };
                    if ($scope.isactive == 2) {
                        param["orderTyp"] = "desc";
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/lesson/list",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                if (param.status != ($scope.isactive == 1 ? "0" : "1")) {
                                    return;
                                }
                                angular.forEach(data.context.items, function(v) {
                                    v.teacherStr = arrToStr(v.teachers, "teacherName");
                                });
                                $scope.scheduleList = data.context.items;
                                paikePager(data.context.totalNum);
                            };
                        }
                    })
                }

                function op_getScheduleList() {
                    var param = {
                        classId: global_classId,
                        status: "0",
                        orderTyp: "asc",
                        orderName: "arrangingCourses_begin_date",
                        pageType: "0"
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/lesson/list",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                angular.forEach(data.context.items, function(v) {
                                    v.teacherStr = arrToStr(v.teachers, "teacherName");
                                });
                                $scope.op_scheduleList = data.context.items;
                            };
                        }
                    })
                }

                function paikePager(total) {
                    if (class_pagerRender) {
                        return;
                    } else {
                        class_pagerRender = true;
                    }

                    var $M_box3 = $('.classPaike');
                    $M_box3.pagination({
                        totalData: total || 0, // 数据总条数
                        showData: class_eachPage, // 显示几条数据
                        jump: true,
                        coping: true,
                        count: 2, // 当前页前后分页个数
                        homePage: '首页',
                        endPage: '末页',
                        prevContent: '上页',
                        nextContent: '下页',
                        callback: function(api) {
                            if (api.getCurrentEach() != class_eachPage) { //本地存储记下每页多少条
                                class_eachPage = api.getCurrentEach();
                                localStorage.setItem('classPaike', class_eachPage);
                            }
                            class_start = (api.getCurrent() - 1) * class_eachPage; // 分页从0开始
                            getScheduleList(class_start); //回调
                        }
                    });
                }

                function batchOperate() {
                    op_getScheduleList();
                    var operate_Dialog, poptype;
                    $scope.hasConfPop = false; //没有冲突提示
                    $scope.infosOpen = infosOpen; //排课顺延
                    $scope.changeDesc = changeDesc; //变更备注
                    $scope.changeClsroom = changeClsroom; //变更教室
                    $scope.changeCourseTheme = changeCourseTheme; //变更上课主题
                    $scope.changeTime = changeTime; //变更时间
                    $scope.changeKeshi = changeKeshi; //变更课时
                    $scope.changeTeachs = changeTeachs; //变更老师
                    $scope.confirm_operateInfos = confirm_operateInfos; //确认信息
                    $scope.confirm_changeDesc = confirm_changeDesc; //确认变更备注
                    $scope.confirm_changeClassrm = confirm_changeClassrm; //确认变更教室
                    $scope.selectTheme = selectTheme; //选择变更主题
                    $scope.confirm_changeCourseTh = confirm_changeCourseTh; //确认变更主题
                    $scope.confirm_changeTime = confirm_changeTime; //确认变更时间

                    $scope.confirm_changeTeachs = confirm_changeTeachs; //确认变更老师
                    $scope.closeOperatePopup = closeOperatePopup; //关闭操作弹框

                    $scope.goPopup("batch_operate", "960px");

                    function infosOpen(isDelete) {
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课表");
                            return false;
                        }
                        $scope.isDeleteInfo = isDelete;
                        operateDialog("确认信息", ".operateInfos");
                    }

                    function confirm_operateInfos() {
                        if (!$scope.isDeleteInfo) {
                            console.log("排课顺延。。。。。");
                        } else {
                            var list = getLessonArr();
                            var param = {
                                "arrangingCourses": list
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
                                        closeOperatePopup();
                                        $scope.piliang_checkAll = false;
                                        $scope.$emit("scheduleListChange", "删除排课");
                                        $scope.$emit("op_scheduleListChange", "删除排课");
                                    };
                                }
                            })
                            console.log("删除排课。。。。。");
                        }
                    }
                    //以下是变更备注
                    function changeDesc() {
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课次");
                            return false;
                        }
                        $scope.change_desc = "";
                        operateDialog("变更备注", ".changeDesc");
                    }

                    function confirm_changeDesc() {
                        var list = getLessonArr();
                        var params = {
                            "updateArrangingCourses": {
                                "remark": $scope.change_desc
                            },
                            "arrangingCourses": list
                        };
                        ajaxResetLesson(params);
                        console.log("变更备注。。。");
                    }
                    //以下是变更教室
                    function changeClsroom() {
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课次");
                            return false;
                        }
                        $scope.classroom = "";
                        getClassroomList();
                        operateDialog("变更教室", ".changeClassrm");
                    }

                    function confirm_changeClassrm(unNeedConflict) {
                        poptype = "room";
                        $scope.hasConfPop = false;
                        var list = getLessonArr();
                        var params = {
                            "updateArrangingCourses": {
                                "classroomId": $scope.classroom
                            },
                            "arrangingCourses": list
                        };
                        if (unNeedConflict) {
                            $scope.hasConfPop = true;
                            params["inspectStatus"] = "0";
                        }
                        ajaxResetLesson(params);
                        console.log("变更教室。。。");
                    }
                    //以下是变更主题
                    function changeCourseTheme() {
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课次");
                            return false;
                        }
                        $scope.course_theme = "";
                        $scope.screen_goReset["_theme"]();
                        getCourseTheme(global_courseId);
                        operateDialog("变更主题", ".changeCourseTh");
                    }

                    function selectTheme(n) {
                        $scope.course_theme = n.courseThemeId;
                    }

                    function confirm_changeCourseTh() {
                        var list = getLessonArr();
                        var params = {
                            updateArrangingCourses: {
                                arrangingCoursesTheme: {
                                    courseThemeId: $scope.course_theme //主题id
                                }
                            },
                            "arrangingCourses": list
                        };
                        ajaxResetLesson(params);
                        console.log("变更主题。。。");
                    }
                    //以下是变更时间
                    function changeTime() {
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课次");
                            return false;
                        }
                        $scope.$broadcast("preSetTime_Id"); //时间组件初始化
                        $scope.arrangingCoursesTime = "1"; //授课课时默认1
                        $scope.operateTime = {
                            "beginTime": "07:00",
                            "endTime": "08:00"
                        }; //变更时间初始化
                        $scope.changeClasstime = changeClasstime; //变更时间--任意一时间
                        $scope.usePreSetTime = usePreSetTime; //变更时间--使用预设时间按钮
                        SERVICE.TIMEPOP.CLASS['pre_time_sel'] = changeClasstime;

                        operateDialog("变更时间", ".changeTime");
                        $scope.$watch("operateTime", function() {
                            if ($scope.operateTime) {
                                $scope.changeTimeMins = getMinutes_($scope.operateTime);
                            }
                        }, true);

                        function changeClasstime(data) {
                            $scope.operateTime = data;
                        }

                        function usePreSetTime() { //预设时间页面
                            window.$rootScope.yznOpenPopUp($scope, 'time-pop', 'preSetTime', '560px');
                        }

                    }
                    function changeKeshi(){
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课次");
                            return false;
                        }
                        $scope.arrangingCoursesTime = "1"; //授课课时默认1
                        operateDialog("变更课时", ".changeKeshi");

                    }
                    function confirm_changeTime(unNeedConflict,keshi) {
                        poptype = "time";
                        $scope.hasConfPop = false;
                        var list = getLessonArr();
                        var params={};
                        if(keshi){
                            params = {
                                "updateArrangingCourses": {
                                    "arrangingCoursesTime": $scope.arrangingCoursesTime,
                                },
                                "arrangingCourses": list
                            }
                        }else{
                            var time = $scope.operateTime;
                            var time_cha = getMinutes_(time);
                            if (time_cha <= 0) {
                                layer.msg("起始时间不能大于等于结束时间");
                                return;
                            }
                            params = {
                                "updateArrangingCourses": {
                                    "updateBeginTime": time.beginTime + ":00",
                                    "updateEndTime": time.endTime + ":00",
                                },
                                "arrangingCourses": list
                            }
                        }
                        if (unNeedConflict) {
                            $scope.hasConfPop = true;
                            params["inspectStatus"] = "0";
                        }
                        ajaxResetLesson(params);
                    }
                    //以下是变更老师
                    function changeTeachs() {
                        var list = getLessonArr();
                        if (list.length <= 0) {
                            layer.msg("请选择课次");
                            return false;
                        }
                        getTeacherList();
                        $scope.clickMainTeacher = clickMainTeacher; //选择主教老师
                        $scope.selTeacher_ = selTeacher_; //选中的助教老师
                        $scope.delTeacher_ = delTeacher_; //删除选中的助教老师
                        $scope.layerMsg = layerMsg; //主教未选，助教选择时提醒
                        $scope.mainTeacher = '';
                        $scope.mainTeacherModel = '';
                        $scope.subTeacher = [];
                        $scope.mainTeachers = [];
                        $scope.subTeacherList = [];
                        $scope.$broadcast("selectMainTeacher", "clearHeadName");
                        operateDialog("变更老师", ".changeTeachs");

                        function layerMsg() {
                            layer.msg("请选择主教老师！");
                        }
                        //选择主教
                        function clickMainTeacher(data) {
                            if (data) {
                                $scope.mainTeacher = data;
                                $scope.mainTeachers = [{
                                    "shopTeacherId": $scope.mainTeacher.shopTeacherId,
                                    "teacherType": 1
                                }];
                                getMainSubTeacherList(data);
                            } else {
                                $scope.mainTeachers = [];
                            }
                        }
                        //删除助教
                        function delTeacher_(data, ind) {
                            data.hasSelected = false;
                            $scope.subTeacher.splice(ind, 1);
                        }
                        //选择助教
                        function selTeacher_(data) {
                            //                          if(!$scope.mainTeacher.shopTeacherId){
                            //                              return layer.msg("请选择主教老师");
                            //                          }
                            var judHas = true;
                            var judHasIndex = null;
                            angular.forEach($scope.subTeacher, function(val, index) {
                                if (val.teacherId == data.teacherId) {
                                    judHas = false;
                                    judHasIndex = index;
                                }
                            });
                            if (judHas) {
                                if ($scope.subTeacher.length == 9) {
                                    layer.msg("最多添加九位助教老师");
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

                        function getTeacherList() {
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
                    //获取老师列表
                    function confirm_changeTeachs(unNeedConflict) {
                        $scope.hasConfPop = false;
                        poptype = "teacher";
                        if ($scope.mainTeachers.length <= 0) {
                            layer.msg("请选择主教老师");
                            return;
                        }
                        var list = getLessonArr();

                        var params = {
                            "updateArrangingCourses": {
                                "teachers": getSelTeachers()
                            },
                            "arrangingCourses": list
                        };
                        if (unNeedConflict) {
                            $scope.hasConfPop = true;
                            params["inspectStatus"] = "0";
                        }
                        ajaxResetLesson(params);
                        console.log("变更老师。。。");
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

                    function ajaxResetLesson(data) {

                        console.log(poptype);
                        $.hello({
                            url: CONFIG.URL + "/api/oa/lesson/updateBatch",
                            type: "post",
                            data: JSON.stringify(data),
                            success: function(data) {
                                if (data.status == '200') {
                                    closeOperatePopup();
                                    $timeout(function() {
                                        $scope.piliang_checkAll = false;
                                        $scope.$emit("scheduleListChange", "删除排课");
                                        $scope.$emit("op_scheduleListChange", "删除排课");
                                        $scope.$emit("classListChange", "变更");
                                        if ($scope.hasConfPop) {
                                            $scope.closePopup("conflict_prompt");
                                        }
                                        $scope.hasConfPop = false;
                                    }, 100, true);
                                    return true;
                                } else if (data.status == '20015') {
                                    $scope.teachConfList = data.context.inspectTeacher;
                                    $scope.classRmConfList = data.context.inspectClassRoom;
                                    $scope.goPopup("conflict_prompt", "760px");
                                    $scope.hasConfPop = true;
                                    $scope.ignoreConflict = function() {
                                        switch (poptype) {
                                            case "room":
                                                confirm_changeClassrm(true);
                                                break;
                                            case "time":
                                                confirm_changeTime(true);
                                                break;
                                            case "teacher":
                                                confirm_changeTeachs(true);
                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                    return true;
                                } else {

                                }

                            }
                        })
                    }

                    function getLessonArr() {
                        var arr = [];
                        angular.forEach($scope.op_scheduleList, function(v) {
                            var obj = {};
                            if (v.hasChecked) {
                                obj.arrangingCoursesId = v.arrangingCoursesId;
                                arr.push(obj);
                            }
                        });
                        return arr;
                    }

                    function closeOperatePopup() {
                        layer.close(operate_Dialog);
                    }

                    function operateDialog(title, div, width) {
                        operate_Dialog = layer.open({
                            type: 1,
                            title: title,
                            skin: 'layerui', //样式类名
                            closeBtn: 1, //不显示关闭按钮
                            move: false,
                            resize: false,
                            anim: 0,
                            area: width ? width : '560px',
                            offset: '30px',
                            shadeClose: false, //开启遮罩关闭
                            content: $(div)
                        })
                    }
                }

            }
            $scope.$on('studentCourseList', function() {
                $scope.params_student = [];
                $scope.sel_all = false;
                getStudentCourseList();
            });
            //本班学员
            function CLASSSTUDENTS() {
                $scope.params_student = [];
                getStudentCourseList();
                $scope.classGotoTuiban = classGotoTuiban; //退班
                $scope.class_tuibantime = class_tuibantime; //确认退班
                $scope.updateClassContractR = updateClassContractR; //立即退班--取消退班
                $scope.gochangeStudentType = gochangeStudentType; //学员变更
                $scope.goViewStudent = goViewStudent; //由本班学员跳转到学员页面
                $scope.sel_allFun = checkboxAllFun; //全选本页数据
                $scope.sel_singleFun = checkSingleFun; //选择某一条数据
                $scope.patchConfirm = patchConfirm; //本班学员--批量操作

                function goViewStudent(d) {
                    $scope.closePopup();
                    setTimeout(function() {
                        $state.go('edu_student', { 'screenValue': { name: 'class_pop', type: '', value: d } });
                    })
                }

                function gochangeStudentType() {
                    if ($scope.classInfo.activityStatus != 1) {
                        window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_new', '860px', { type: 'student_new', choseType: 'checkbox', sourcePage: 'classPop', courseId: $scope.classInfo.course.courseId, excludeClassId: global_classId, callBackName: '本班学员-添加学员' });
                    } else {
                        window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_new', '860px', { type: 'student_new', choseType: 'checkbox', sourcePage: 'classPop', excludeClassId: global_classId, callBackName: '本班学员-添加学员' });
                        //                      window.$rootScope.yznOpenPopUp($scope,'student-sel','selectStuds_activity', '860px',{ type: 'student_activity',choseType: 'checkbox', sourcePage:'classPop',excludeClassId:global_classId,callBackName: '活动班-添加学员'});
                    }
                }

                function patchConfirm(n, batch, info) {
                    $scope.isBatch = batch == "isBatch" ? true : false;
                    if (batch == "isBatch") {
                        if ($scope.params_student.length <= 0) {
                            return layer.msg("请选择需要操作学员！");
                        }
                    } else {
                        $scope.studentInfo = angular.copy(info);
                    }
                    switch (n) {
                        case 1:
                            //                      $scope.toChangeClass = "";
                            window.$rootScope.yznOpenPopUp($scope, "course-sel", "choseClass", "1060px", { type: "radio", name: "class", item: { courseId: $scope.classInfo.course.courseId, courseName: $scope.classInfo.course.courseName, }, callBackName: "本班学员-调班" });
                            break;
                        case 2:
                            classGotoTuiban('class_tuibantime', '560px', $scope.params_student, "isBatch");
                            break;
                        case 3:
                            $scope.xiaokeTime = "";
                            $scope.goPopup('xiaoke_pop', '560px');
                            $scope.xiaoke_confirm = function() {
                                var arr = [];
                                angular.forEach($scope.params_student, function(v) {
                                    arr.push(v.classContractR.id);
                                });

                                var params = {
                                    classId: global_classId,
                                    courseTime: $scope.xiaokeTime,
                                    idList: arr
                                };
                                $.hello({
                                    url: CONFIG.URL + '/api/oa/class/updateListStudentCourseTime',
                                    type: 'post',
                                    data: JSON.stringify(params),
                                    success: function(data) {
                                        if (data.status == "200") {
                                            layer.msg('已成功批量消课', {
                                                icon: 1
                                            });
                                            $scope.$emit("studentCourseList");
                                            $scope.$emit('classListChange', '学员变更');
                                            $scope.closePopup('xiaoke_pop');
                                        }

                                    }
                                });
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (!$scope.onselectStuds) {
                    $scope.onselectStuds = $scope.$on("本班学员-添加学员", function(event, data) {
                        var params = {
                            updateClassContractRS: getArr_(data)
                        };
                        $.hello({
                            url: CONFIG.URL + '/api/oa/class/updateClassContractRList',
                            type: 'post',
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == "200") {
                                    layer.msg('已成功添加学员', {
                                        icon: 1
                                    });
                                    $scope.$emit('studentCourseList');
                                    $scope.$emit('classListChange', '学员变更');
                                }

                            }
                        });
                    });
                }

                function getArr_(list) {
                    var arr = [];
                    angular.forEach(list, function(v, k) {
                        var obj = {};
                        if (v.hasChecked) {
                            obj.contractId = v.contract.contractId;
                            obj.studentId = v.potentialCustomer.id;
                            obj.type = '6';
                            obj.classId = global_classId;
                            arr.push(obj);
                        }
                    });
                    return arr;
                }

                function getArr_change(list, data) {
                    var arr = [];
                    angular.forEach(list, function(v, k) {
                        var obj = {};
                        if (v.hasChecked) {
                            obj.contractId = v.contract.contractId;
                            obj.studentId = v.potentialCustomer.id;
                            obj.type = '6';
                            obj.classId = data.classId;
                            obj.fromClassId = global_classId;
                            arr.push(obj);
                        }
                    });
                    return arr;
                }
                if (!$scope.onchangeStuds) {
                    $scope.onchangeStuds = $scope.$on("本班学员-调班", function(event, data) {
                        console.log(data);
                        //                      $scope.toChangeClass = data;
                        var params = {
                            updateClassContractRS: $scope.isBatch ? getArr_change($scope.params_student, data) : [{
                                contractId: $scope.studentInfo.contract.contractId,
                                studentId: $scope.studentInfo.potentialCustomer.id,
                                type: '6',
                                classId: data.classId,
                                fromClassId: global_classId,
                            }]
                        };
                        $.hello({
                            url: CONFIG.URL + '/api/oa/class/updateClassContractRList',
                            type: 'post',
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == "200") {
                                    layer.msg('已成功调班', {
                                        icon: 1
                                    });
                                    $scope.$emit('studentCourseList');
                                    $scope.$emit('classListChange', '学员变更');
                                }

                            }
                        });
                    });
                }

                //              function gochangeStudent() { //打开学员变更弹出框
                //                  var toChangeClass, searchType, searchName,searchGrade;
                //                  var searchAge={};
                //                  $scope.selAll_lf = $scope.selAll_rt = false;
                //                  $scope.classStatus = true;
                //                  getPopClassList(); //获取班级筛选列表
                //                  getStudentCourseList();
                //                  $scope.stud_popNavSelected = 1;
                //                  $scope.stud_popNav = [{
                //                      name: '添加学员',
                //                      tab: 1
                //                  }, {
                //                      name: '调班',
                //                      tab: 2
                //                  }];
                //
                //                  $scope.stud_changePopNav = stud_changePopNav; //学员变更框tab切换
                //                  stud_changePopNav($scope.stud_popNav[0]);
                //                  $scope.click_class = click_class; //选择班级
                //                  $scope.checkedAll = checkedAll; //添加学员左侧全选
                //                  $scope.go_changeStudArr = go_changeStudArr; //左侧本班学员退班到右侧
                //                  $scope.screen_grade_list = getConstantList(CONSTANT.STUDENTGRADE);//潜客年级列表
                //                  $scope.goPopup("studsChange_pop", "1060px");
                //
                //                  function click_class(x) {
                //                      if (!x) {
                //                          toChangeClass = undefined;
                //                      } else {
                //                          toChangeClass = x.classId;
                //                          $scope.classStatus = false;
                //                      }
                //                      getRightStudList();
                //                  }
                //
                //                  function getPopClassList() {
                //                      var param = {
                //                          "courseId": $scope.classInfo.course.courseId,
                //                          "pageType": "0",
                //                          "classStatus": "1"
                //                      };
                //                      if ($scope.classInfo.schoolTerm) {
                //                          param["schoolYear"] = $scope.classInfo.schoolTerm.schoolYear;
                //                          param["schoolTermId"] = $scope.classInfo.schoolTerm.schoolTermId;
                //                      }
                //                      $.hello({
                //                          url: CONFIG.URL + "/api/oa/class/list",
                //                          type: "get",
                //                          data: param,
                //                          success: function(data) {
                //                              if (data.status == '200') {
                //                                  $scope.popClassList = angular.copy(data.context);
                //                              }
                //
                //                          }
                //                      })
                //                  }
                //
                //                  function stud_changePopNav(n) {
                //                      toChangeClass = searchType = searchName = searchGrade = undefined;
                //                      searchAge={};
                //                      $scope.classStatus = true;
                //                      $scope.stud_popNavSelected = n.tab;
                //                      $scope.ageSearchOnreset_["screen_age"](); //调取app重置方法
                //                      $scope.$broadcast("screen_grade","clearHeadName");
                //                      switch (n.tab) {
                //                          case 1:
                //                              ADDSTUDENT();
                //                              getRightStudList(); //添加学员
                //                              break;
                //                          case 2:
                //                              CHANGECLASS(); //调班
                //                              break;
                //                          default:
                //                              break;
                //                      }
                //
                //                  }
                //
                //                  function ADDSTUDENT() { //添加学员
                //                      //                      screen_setDefaultField($scope, function() {
                //                      //                          $scope.screen_goReset['edu_sel_class']();
                //                      //                      })
                //                      $scope.courseType = false;
                //                      $scope.courseType1 = false;
                //                      $scope.classStatus = true;
                //                       $scope.ageSearchOnreset_["screen_age"](); //调取app重置方法
                //                      $scope.stud_popNavSelected = 1;
                //                      $scope.popselectInfoNameId = 'studentName'; // select初始值
                //                      $scope.popkindSearchData = {
                //                          studentName: '学员姓名、昵称'
                //                      };
                //                      $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
                //                      $scope.SearchData = SearchData; //按钮搜索
                //                      $scope.click_reset = click_reset; //添加学员重置按钮
                //                      $scope.chgcourseType = chgcourseType; //切换标准课和通用课
                //                      $scope.chgclassStatus = chgclassStatus; //切换班级分班状态
                //                      $scope.screenByAge = screenByAge; //选择年龄
                //                      $scope.screenByGrade = screenByGrade; //选择年级
                //
                //                      //回车键  删除键
                //                      function Enterkeyup(data) {
                //                          searchName = data.value;
                //                          searchType = data.type;
                //                          pagerRender = false;
                //                          getRightStudList();
                //                      }
                //
                //                      //搜索button
                //                      function SearchData(data) {
                //                          searchName = data.value;
                //                          searchType = data.type;
                //                          pagerRender = false;
                //                          getRightStudList();
                //                      }
                //                      function screenByAge(a){
                //                          searchAge = a;
                //                          getRightStudList();
                //                      }
                //                      function screenByGrade(val) {
                //                          if(val == null) {
                //                              searchGrade = null;
                //                          } else {
                //                              searchGrade = val.value;
                //                          }
                //                          getRightStudList();
                //                      }
                //                      function click_reset() {
                //                          searchAge={};
                //                          toChangeClass = searchType = searchName = searchGrade = undefined;
                //                          //                          screen_setDefaultField($scope, function() {
                //                          //                              $scope.screen_goReset['edu_sel_class']();
                //                          //                          })
                //                          $scope.courseType = false;
                //                          $scope.courseType1 = false;
                //                          $scope.classStatus = true;
                //                          $scope.kindSearchOnreset(); //调取app重置方法
                //                          $scope.ageSearchOnreset_["screen_age"](); //调取app重置方法
                //                          $scope.$broadcast("screen_grade","clearHeadName");
                //                          getRightStudList();
                //                      }
                //
                //                      function chgcourseType(type) {
                //                          if (type) {
                //                              if ($scope.courseType) {
                //                                  $scope.courseType = true;
                //                                  $scope.courseType1 = false;
                //                              }
                //                          } else {
                //                              if ($scope.courseType1) {
                //                                  $scope.courseType1 = true;
                //                                  $scope.courseType = false;
                //                              }
                //                          }
                //                          getRightStudList();
                //                      }
                //
                //                      function chgclassStatus() {
                //                          if ($scope.classStatus) {
                //                              //                              screen_setDefaultField($scope, function() {
                //                              //                                  $scope.screen_goReset['edu_sel_class']();
                //                              //                              })
                //                              toChangeClass = undefined;
                //                          }
                //                          getRightStudList();
                //                      }
                //
                //                  }
                //
                //                  function CHANGECLASS() { //调班
                //                      $scope.studentList_Right = "";
                //                      screen_setDefaultField($scope, function() {
                //                          $scope.screen_goReset['edu_sel_class_rt']();
                //                      })
                //
                //                  }
                //
                //                  function getRightStudList() { //本班学员列表
                //                      var param = {
                //                          "classId": toChangeClass,
                //                          "courseId": $scope.classInfo.course.courseId,
                //                          "searchType": searchName?'appSearchName':undefined,
                //                          "searchName": searchName,
                //                          "beginAge":searchAge.minAge || undefined,
                //                          "endAge":searchAge.maxAge || undefined,
                //                          "grade":searchGrade || undefined,
                //                      };
                //                      if ($scope.stud_popNavSelected == 1) {
                //                          param["courseType"] = $scope.courseType ? "0" : $scope.courseType1 ? "1" : undefined;
                //                          param["classType"] = $scope.classStatus == true ? "0" : undefined;
                //                      }
                //                      if ($scope.classInfo.schoolTerm) {
                //                          param["schoolYear"] = $scope.classInfo.schoolTerm.schoolYear;
                //                          param["schoolTermId"] = $scope.classInfo.schoolTerm.schoolTermId;
                //                      }
                //                      $.hello({
                //                          url: CONFIG.URL + "/api/oa/class/getStudentByClassId",
                //                          type: "get",
                //                          data: param,
                //                          success: function(data) {
                //                              if (data.status == '200') {
                //                                  $scope.studentList_Right = angular.copy(data.context);
                //                                  angular.forEach($scope.studentList_Right, function(v, k) {
                //                                      var id = v.potentialCustomer.potentialCustomerId;
                //                                      v.disabled = false;
                //                                      angular.forEach($scope.studentList_Left, function(m, k) {
                //                                          if (m.potentialCustomer.potentialCustomerId == id) {
                //                                              v.disabled = true;
                //                                          }
                //                                      });
                //                                  });
                //                              };
                //                          }
                //                      })
                //                  }
                //                  //以下是学员变更弹出框里的公用方法
                //                  function checkedAll(x, list,type) {
                //                      if (!list) {
                //                          return;
                //                      }
                //                      checkboxAll(x, list,type);
                //                  }
                //
                //                  function go_changeStudArr(list, type, aim) {
                //                      var arr = changeArr(list, type, aim);
                //                      if ($scope.stud_popNavSelected == 2 && !toChangeClass) {
                //                          layer.msg("请选择调班班级");
                //                          return;
                //                      }
                //                      if (arr.length <= 0) {
                //                          layer.msg("请选择学员");
                //                          return;
                //                      }
                //
                //                      var params = {
                //                          "updateClassContractRS": arr
                //                      };
                //                      $.hello({
                //                          url: CONFIG.URL + "/api/oa/class/updateClassContractRList",
                //                          type: "post",
                //                          data: JSON.stringify(params),
                //                          success: function(data) {
                //                              if (data.status == '200') {
                //                                  if (type == "4") {
                //                                      layer.msg('已成功批量退班', {
                //                                          icon: 1
                //                                      });
                //                                  } else {
                //                                      layer.msg('已成功批量插班', {
                //                                          icon: 1
                //                                      });
                //                                  }
                //                                  $scope.selAll_lf = $scope.selAll_rt = false;
                ////                                  $timeout(function() {
                //                                      getRightStudList();
                ////                                  }, 1000, true);
                //                                  $scope.$emit('studentCourseList');
                //                                  $scope.$emit('classListChange', '学员变更');
                //                              };
                //                          }
                //                      })
                //                  }
                //
                //                  function changeArr(list, types, aim) {
                //                      var arr = [];
                //                      angular.forEach(list, function(v, k) {
                //                          var obj = {};
                //                          if (v.hasChecked && !v.disabled) {
                //                              obj.contractId = v.contract.contractId;
                //                              obj.studentId = v.contract.studentId;
                //                              obj.type = types;
                //                              if ($scope.stud_popNavSelected == 1) {
                //                                  obj.classId = global_classId;
                //                              } else {
                //                                  if (aim == "toRight") {
                //                                      obj.classId = toChangeClass;
                //                                      obj.fromClassId = global_classId;
                //                                  } else {
                //                                      obj.classId = global_classId;
                //                                      obj.fromClassId = v.classContractR.classId;
                //                                  }
                //                              }
                //                              arr.push(obj);
                //                          }
                //                      });
                //                      return arr;
                //                  }
                //              }

                function classGotoTuiban(id, width, param, batch) {
                    //                  props = param;
                    $scope.LAYDATE = "";
                    $scope.goPopup(id, width, param);
                    $scope.class_tuibantime = function() {
                        var params = {
                            updateClassContractRS: batch == "isBatch" ? getTuibanArr(param) : [{
                                'contractId': param.classContractR.contractId,
                                'studentId': param.classContractR.studentId,
                                'classId': param.classContractR.classId,
                                'date': $scope.LAYDATE,
                                'type': $scope.LAYDATE ? "3" : "4"
                            }]
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/updateClassContractRList",
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.$emit("studentCourseList");
                                    layer.msg('已成功退班', {
                                        icon: 1
                                    });
                                    $scope.closePopup('class_tuibantime');
                                };
                            }
                        })

                    }
                }

                function getTuibanArr(list) {
                    console.log(list);
                    var arr = [];
                    angular.forEach(list, function(v, k) {
                        if (v.hasChecked) {
                            arr.push({
                                'contractId': v.classContractR.contractId,
                                'studentId': v.classContractR.studentId,
                                'classId': v.classContractR.classId,
                                'date': $scope.LAYDATE,
                                'type': $scope.LAYDATE ? "3" : "4"
                            });
                        }
                    });
                    return arr;
                }
                //班级操作 -- 立即退班
                function updateClassContractR(type, s, lock) {
                    var param = {
                        'contractId': s.classContractR.contractId,
                        'studentId': s.classContractR.studentId,
                        'classId': s.classContractR.classId,
                        'type': type,
                        'date': ''
                    };
                    var msgType = CONSTANT.CLASSCAOZUOTYPE[type];
                    var msg = '是否' + msgType + '？';
                    if (type == '0') {
                        param['lockStatus'] = lock ? '1' : '0';
                        msg = lock ? "是否确定休课？休课后该学员在当前班级中不可点名上课" : "是否确定复课？复课后该学员在当前班级中可正常点名上课";
                        msgType = lock ? '休课' : '取消休课';
                    }
                    //                  if(type == '7'){
                    //                      param['lockStatus']='0';
                    //                      msg="取消休课后该学员在当前班级中可操作点名功能";
                    //                  }
                    for (var i in param) {
                        if (param[i] === '' || param[i] == undefined) {
                            delete param[i];
                        };
                    };
                    var isConfirm = layer.confirm(msg, {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/updateClassContractR",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    $timeout(function() {
                                        $scope.$emit("studentCourseList");
                                    }, 1000, true);
                                    layer.msg('已' + msgType, {
                                        icon: 1
                                    });
                                };
                            }
                        })
                    }, function() {
                        layer.close(isConfirm);
                    })
                }

            }
            //班级相册
            function CLASSPHOTOS() {
                init4();

                function init4() {
                    $scope.isActive = 1;
                    $scope.page1 = $scope.page2 = 0;
                    $scope.tab_student_comment = tab_student_comment;
                    $scope.openPhotos = openPhotos;
                    $scope.popclassShow = popclassShow;
                    $scope.confirm_classShow = confirm_classShow; //添加或编辑展示确认按钮
                    $scope.add_showInfo = add_showInfo;
                    $scope.showErrorMsg = showErrorMsgFun;
                    $scope.hideErrorMsg = hideErrorMsgFun;
                    $scope.delete_showInfo = delete_showInfo;
                    $scope.popclassDetele = popclassDetele; //删除
                    tab_student_comment(1);
                    loadData('pic_id', function() {
                        if ($scope.isActive == 1) {
                            getShow($scope.page1);
                        } else {
                            getActivity($scope.page2);
                        }
                    });
                }

                function tab_student_comment(t) {
                    $scope.isActive = t;
                    if (t == 1) {
                        $scope.page1 = 0;
                        getShow($scope.page1);
                    } else {
                        $scope.page2 = 0;
                        getActivity($scope.page2);
                    }
                }

                function openPhotos(value, list) {
                    var imglist = getPics(list);
                    if (imglist.length <= 0) {
                        return;
                    }
                    var param = {
                        val: value,
                        list: imglist,
                        liwidth: 880,
                        liheight: 470
                    }
                    window.$rootScope.yznOpenPopUp($scope, 'photo-pop', 'photosPop', '960px', param);
                }

                function getShow(start) {
                    var param = {
                        start: start.toString() || "0",
                        count: 10,
                        classId: global_classId
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/courseDisplay/list",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = angular.copy(data.context.items);
                                angular.forEach(list, function(v) {
                                    v.courseDisplayUrlList = setUrlist(v.courseDisplayUrlList);
                                });
                                if (start == 0) {
                                    $scope.picList = list;
                                    $scope.picListOld = data.context.items;
                                } else {
                                    $scope.picList = $scope.picList.concat(list);
                                    $scope.picListOld = $scope.picListOld.concat(data.context.items);
                                }
                                if (data.context.items) {
                                    $scope.page1 = $scope.page1 * 1 + list.length * 1;
                                }
                            }
                        }
                    })
                }

                function getActivity(start) {
                    var param = {
                        start: start.toString() || "0",
                        count: 10,
                        classId: global_classId
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/classAlbum/list",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                console.log(data);

                                var list = angular.copy(data.context.items);
                                angular.forEach(list, function(v) {
                                    v.classAlbumUrlList = setUrlist(v.classAlbumUrlList);
                                });
                                if (start == 0) {
                                    $scope.activityList = list;
                                    $scope.activityListOld = data.context.items;
                                } else {
                                    $scope.activityList = $scope.activityList.concat(list);
                                    $scope.activityListOld = $scope.activityListOld.concat(data.context.items);
                                }
                                if (data.context.items) {
                                    $scope.page2 = $scope.page2 * 1 + list.length * 1;
                                }
                            }
                        }
                    })
                }

                function popclassShow(type, x) {
                    if (type == 'add') {
                        $scope.showTitle = '添加照片/视频';
                        $scope.showDetail = {
                            courseDisplayDesc: "",
                            classAlbumUrlList: []
                        };
                    } else {
                        $scope.showTitle = '编辑照片/视频';
                        $scope.showDetail = angular.copy(x);
                    }
                    $scope.goPopup('addPic_pop', '660px');
                }

                function popclassDetele(x) {
                    detailMsk("是否删除该条记录？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/classAlbum/delete",
                            type: "post",
                            data: JSON.stringify({ classAlbumId: x.classAlbumId }),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.page2 = 0;
                                    getActivity($scope.page2);
                                }
                            }
                        })
                    });
                }

                function confirm_classShow() {
                    if ($scope.showDetail.classAlbumUrlList.length <= 0) {
                        return layer.msg("上传照片/视频至少一个");
                    }
                    var j = [true, ""];
                    var list = $scope.showDetail.classAlbumUrlList;
                    for (var i = 0, len = list.length; i < len; i++) {
                        if (!list[i].key) {
                            j[0] = false;
                            break;
                        }
                    }
                    if (!j[0]) {
                        return layer.msg("请处理未成功的多媒体！");
                    }
                    var URL;
                    var param = {
                        classAlbumDesc: $scope.showDetail.classAlbumDesc,
                        classAlbumUrl: getUrlList($scope.showDetail.classAlbumUrlList)
                    }
                    if ($scope.showTitle == '添加照片/视频') {
                        param["classId"] = global_classId;
                        URL = "/api/oa/class/classAlbum/add";
                        console.log("添加照片/视频");
                    } else {
                        console.log("编辑照片/视频");
                        param["classAlbumId"] = $scope.showDetail.classAlbumId;
                        URL = "/api/oa/class/classAlbum/update";
                    }
                    console.log(param);
                    $.hello({
                        url: CONFIG.URL + URL,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.page2 = 0;
                                getActivity($scope.page2);
                                $scope.closePopup('addPic_pop');
                            }
                        }
                    })
                }
            }
            //打卡作业
            function CLASSCLOCK() {
                init5();

                function init5() {
                    getListModelInfos();
                    $scope.goViewClock = goViewClock;
                    $scope.deleteHomewk = deleteHomewk; //删除作业
                    SERVICE.CLASSPOP.CLOCK["班级-打卡作业"] = function() {
                        getListModelInfos();
                    }
                }

                function deleteHomewk(x) {
                    detailMsk("是否确认删除该作业？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/homework/deleteHomeworkR",
                            type: "post",
                            data: JSON.stringify({ homeworkRId: x.homeworkRId }),
                            success: function(data) {
                                if (data.status == 200) {
                                    getListModelInfos();
                                }
                            }
                        });
                    });
                }

                function goViewClock(x) {
                    window.$rootScope.yznOpenPopUp($scope, "clock-pop", "clockDetail_pop", "960px", { tab: 1, item: x, page: "classPop", callBackName: '班级-打卡作业' });
                }

                function getListModelInfos() {
                    var params = {
                        "classId": global_classId,
                        "pageType": "0",
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/listHomeworkR",
                        type: "get",
                        data: params,
                        success: function(data) {
                            if (data.status == 200) {
                                $scope.classClockList = data.context;
                            }
                        }
                    });
                };
            }
            //添加图片/音频/视频
            function add_showInfo(list, data_source) {
                if (list.length > 40) {
                    layer.msg('添加到达上限');
                    return;
                }
                var uploadObserver = {
                    'filesSelected': function(files) {
                        angular.forEach(files, function(item) {
                            var fileName = item.file.name;
                            var fileUrl = item.fileUrl;
                            var type = item.file.type;
                            var data = {
                                percent: 0,
                                fileName: fileName
                            }
                            if (type.indexOf('image') == 0) {
                                data.imageUrl = fileUrl;

                            } else if (type.indexOf('audio') == 0) {
                                data.audioUrl = fileUrl;
                                data.audioUrl_ = $sce.trustAsResourceUrl(fileUrl);

                            } else if (type.indexOf('video') == 0) {
                                data.videoUrl = fileUrl;
                                data.videoUrl_ = $sce.trustAsResourceUrl(fileUrl);
                            }
                            list.push(data);

                        });
                        $scope.$apply();
                    }, //文件选择结果，返回文件列表
                    'fail': function(fileUrl, error) {
                        angular.forEach(list, function(item) {
                            if (item.audioUrl == fileUrl) {
                                item.uploadErr = error;
                            }
                        });
                        $scope.$apply();
                    }, //文件上传失败
                    'success': function(fileUrl, key) {
                        angular.forEach(list, function(item) {
                            if (item.imageUrl == fileUrl || item.audioUrl == fileUrl || item.videoUrl == fileUrl) {
                                item.key = key;
                            }
                        });
                        $scope.$apply();
                    }, //文件上传成功
                    'progress': function(fileUrl, percent) {
                            var found = false;
                            angular.forEach(list, function(item) {
                                if (item.imageUrl == fileUrl || item.audioUrl == fileUrl || item.videoUrl == fileUrl) {
                                    item.percent = percent;
                                    found = true;
                                }
                            });
                            //如果没找到就取消上传
                            if (!found) {
                                return true;
                            }
                            $scope.$apply();
                        } //文件上传进度
                };
                $timeout(function() {
                    szpUtil.util_addImg(false, function(data) {
                        //                      if(data.length>0){
                        //                          angular.forEach(data,function(v){
                        //                              var ptype = v.match(RegExp(/picture/));
                        //                              var vtype = v.match(RegExp(/video/));
                        //                              if (ptype) {
                        //                                  list.push({
                        //                                      imageUrl: v
                        //                                  });
                        //                              }
                        //                              if (vtype) {
                        //                                  list.push({
                        //                                      videoUrl: v,
                        //                                      videoUrl_: $sce.trustAsResourceUrl(v)
                        //                                  });
                        //                              }
                        //                          });
                        //                      }
                        //                      $scope.$apply();
                    }, { multiple: true, type: 'image/gif, image/jpeg, image/png,video/mp4', dataSource: data_source }, uploadObserver);
                }, 100);
                console.log(list);
            }

            function getPics(list) {
                var arr = [];
                if ($scope.isActive == 1) {
                    angular.forEach(list, function(v, ind) {
                        angular.forEach(v.courseDisplayUrlList, function(v_) {
                            arr.push(v_);
                        });
                    });
                } else {
                    angular.forEach(list, function(v, ind) {
                        angular.forEach(v.classAlbumUrlList, function(v_) {
                            arr.push(v_);
                        });
                    });
                }
                return arr;
            }

            function setUrlist(list) {
                var urlList = [];
                angular.forEach(list, function(v) {
                    var ptype = v.match(RegExp(/picture/));
                    var atype = v.match(RegExp(/voice/));
                    var vtype = v.match(RegExp(/video/));
                    if (ptype) {
                        urlList.push({
                            imageUrl: v,
                            key: getKeyFromUrl(v)
                        });
                    }
                    if (atype) {
                        urlList.push({
                            audioUrl: v,
                            audioUrl_: $sce.trustAsResourceUrl(v),
                            key: getKeyFromUrl(v)
                        });
                    }
                    if (vtype) {
                        urlList.push({
                            videoUrl: v,
                            videoUrl_: $sce.trustAsResourceUrl(v),
                            key: getKeyFromUrl(v)
                        });
                    }
                });
                return urlList;
            }

            function getUrlList(list) {
                var str = "";
                for (var i in list) {
                    if (list[i].key) {
                        str += list[i].key + ",";
                    } else {
                        if (list[i].imageUrl) {
                            str += getKeyFromUrl(list[i].imageUrl) + ",";
                        }
                        if (list[i].audioUrl) {
                            str += getKeyFromUrl(list[i].audioUrl) + ",";
                        }
                        if (list[i].videoUrl) {
                            str += getKeyFromUrl(list[i].videoUrl) + ",";
                        }
                    }

                }
                str = str.substring(0, str.length - 1);
                return str;
            }

            function delete_showInfo(ind, list) {
                list.splice(ind, 1);
            }

            function getStudentCourseList() { //本班学员列表
                var param = {
                    "classId": global_classId
                };
                if (global_status == 2) {
                    param["classStatus"] = "6";
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/getStudentByClassId",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.studentList = angular.copy(data.context);
                            angular.forEach($scope.studentList, function(v) {
                                if (v.classContractR && (v.classContractR.courseTime == undefined || v.classContractR.courseTime == null)) {
                                    v.classContractR.courseTime = 1.00;
                                }
                            });
                            $scope.studLength = $scope.studentList ? $scope.studentList.length : 0;
                            $scope.studentList_Left = angular.copy(data.context);
                            angular.forEach($scope.studentList_Right, function(v, k) {
                                var id = v.potentialCustomer.potentialCustomerId;
                                v.disabled = false;
                                angular.forEach($scope.studentList_Left, function(m, k) {
                                    if (m.potentialCustomer.potentialCustomerId == id) {
                                        v.disabled = true;
                                    }
                                });
                            });
                        };
                    }
                })
            }
            $scope.editNum = function(n, s) {
                s.classContractR.courseTime = n.value;
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/updateStudentCourseTime",
                    type: "post",
                    data: JSON.stringify({ id: s.classContractR.id, courseTime: s.classContractR.courseTime }),
                    success: function(data) {
                        getStudentCourseList();
                    }
                })
            }

            function shengban_getStudentCourseList() { //本班学员列表
                var param = {
                    "classId": global_classId
                };
                param["newCourseId"] = $scope.newitemCourse ? $scope.newitemCourse.courseId : undefined;
                param["newSchoolYear"] = $scope.new_year ? $scope.new_year : undefined;
                param["newSchoolTermId"] = $scope.new_package ? JSON.parse($scope.new_package).schoolTermId : undefined;
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/getStudentByClassId",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            console.log(data.context);
                            $scope.studentList_sb = angular.copy(data.context);
                            angular.forEach($scope.studentList_sb, function(v) {
                                if (v.newContract) {
                                    v.disabled = true;
                                } else {
                                    v.disabled = false;
                                }
                                if ($scope.new_className) {
                                    //                                  if ($scope.newitemCourse.chargeStandardId) {
                                    //                                      v.potentialCustomer["chargeStandardId"] = $scope.newitemCourse.chargeStandardId;
                                    //                                  }
                                    v.potentialCustomer["courseId"] = $scope.newitemCourse.courseId;
                                    v.potentialCustomer["courseName"] = $scope.newitemCourse.courseName;
                                }
                            });
                        };
                    }
                })
            }

            function classStudStatus(x) {
                var str = "";
                return str = CONSTANT.CLASS_STUD_STATUS[x];
            }

            //升班打开窗口
            function shengbanInit() {
                $scope.isnewPageyear = false;
                $scope.old_gradClass = "0";
                $scope.courseOverStatus = "0";
                $scope.new_course = "";
                $scope.new_package = "";
                $scope.new_year = "";
                $scope.new_className = "";
                $scope.newitemCourse = "";
                screen_setDefaultField($scope, function() {
                    $scope.screen_goReset['newCourse']();
                })
                newgetPageYear();
                shengban_getStudentCourseList();
                $scope.courseRenew = courseRenew;
                $scope.courseChange = courseChange;
                $scope.testStatus = true;
                $scope.checkAll = false;

            }
            $scope.$on('shengbanSignup', function() {
                setTimeout(function() {
                    shengban_getStudentCourseList();
                }, 100);
            });

            function confirm_btn() {
                if (getStudentArr().length <= 0) {
                    return layer.msg("请选择学员");
                }
                var list = $scope.studentList_sb;
                var hasTime = false;
                for (var i = 0, len = list.length; i < len; i++) {
                    var x = list[i];
                    if (x.hasChecked) {
                        if ((x.contract.buySurplusDateNum * 1 + x.contract.giveSurplusDateNum * 1 > 0) || (x.contract.buySurplusTime * 1 + x.contract.giveSurplusTime * 1 > 0)) {
                            hasTime = true;
                            break;
                        }
                    }
                }
                if (hasTime && $scope.courseOverStatus == 1) {
                    var isConfirm = layer.confirm('所选学员中有剩余课时，完成升班后原课程将被结课，确认升班？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        confirm_shengban();
                        layer.close(isConfirm);
                    }, function() {
                        layer.close(isConfirm);
                    })
                } else {
                    confirm_shengban();
                }

            }

            function confirm_shengban(hasWarn) {
                var old = {
                    classId: $scope.classInfo.classId,
                    schoolTermId: $scope.classInfo.schoolTermId ? $scope.classInfo.schoolTermId : undefined,
                    schoolYear: $scope.classInfo.schoolYear ? $scope.classInfo.schoolYear : undefined
                }
                var news = {
                    className: $scope.new_className,
                    schoolTermId: $scope.new_package ? JSON.parse($scope.new_package).schoolTermId : undefined,
                    schoolYear: $scope.new_year ? $scope.new_year : undefined,
                    courseId: $scope.newitemCourse.courseId,
                    classContractRS: getStudentArr()
                }
                var params = {
                    "overStatus": $scope.old_gradClass == "1" ? "1" : "0",
                    "courseOverStatus": $scope.courseOverStatus == "1" ? "1" : "0",
                    "oldClass": old,
                    "newClass": news
                };
                if ($scope.testStatus) {
                    params["testStatus"] = "1";
                } else {
                    params["testStatus"] = "0";
                }
                console.log(params);
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/upgrade",
                    type: "POST",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.testStatus = true;
                            if (props.location !== "outside") {
                                getClassDetail(props.item.classId);
                            }
                            $timeout(function() {
                                if (props.page == "class") {
                                    $scope.$emit("classListChange", "单个升班");
                                }
                                if (hasWarn) {
                                    $scope.closePopup("warn_reStud");
                                }
                                $scope.closePopup("shengban_pop");
                            }, 100, true);
                            $scope.$apply();

                        } else if (data.status == '20014') {
                            $scope.testStatus = false;
                            $scope.goPopup("warn_reStud", "560px");
                            $scope.confirm_reStud = function() {
                                confirm_shengban(true);
                            }
                            return true;
                        } else if (data.status == '20017') {

                        }

                    }
                })
            }

            function getStudentArr() {
                var arr = [];
                angular.forEach($scope.studentList_sb, function(v) {
                    var obj = {};
                    if (v.hasChecked) {
                        obj.contractId = v.newContract.contractId;
                        obj.studentId = v.classContractR.studentId;
                        obj.potentialCustomerId = v.potentialCustomer.potentialCustomerId;
                        arr.push(obj);
                    }
                });
                return arr;
            }

            function courseRenew(d) {
                if (!$scope.new_course) {
                    return layer.msg("请选择新课程");
                }
                d.course = $scope.newitemCourse;
                d.schoolTerm = {};
                d.schoolTerm["schoolYear"] = $scope.new_year ? $scope.new_year : undefined;
                d.schoolTerm["schoolTermId"] = $scope.new_package ? JSON.parse($scope.new_package).schoolTermId : undefined;
                d.schoolTerm["schoolTermName"] = $scope.new_package ? JSON.parse($scope.new_package).schoolTermName : undefined;
                var param = {
                    'page': CONSTANT.PAGE.STUDENT,
                    'item': d,
                    'title': '报名',
                    'location': "outside",
                    'special': 'shengban_signup'
                };
                window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
            }

            //点击转课
            function courseChange(d) {
                if (!$scope.new_course) {
                    return layer.msg("请选择新课程");
                }
                d.schoolTerm = {};
                d.schoolTerm["schoolYear"] = $scope.new_year ? $scope.new_year : undefined;
                d.schoolTerm["schoolTermId"] = $scope.new_package ? JSON.parse($scope.new_package).schoolTermId : undefined;
                d.schoolTerm["schoolTermName"] = $scope.new_package ? JSON.parse($scope.new_package).schoolTermName : undefined;
                var data = {};
                data["courselist"] = {};
                data["classlist"] = {};
                data["studentInfo"] = {};
                data["newCourse"] = {};
                data["newPackage"] = {};
                data["type"] = "转课";
                data["courselist"].contract = d.contract;
                data["courselist"].contractId = d.contract.contractId;
                data["courselist"].course = d.contract;
                data["courselist"].course.courseName = d.course.courseName;
                data["classlist"].schoolTerm = $scope.classInfo.schoolTerm ? $scope.classInfo.schoolTerm : undefined;
                data["classlist"].buyAllTime = d.contract.buyAllTime;
                data["classlist"].giveTime = d.contract.giveTime;
                data["studentInfo"] = d.potentialCustomer;
                data["newCourse"].course = $scope.new_course ? $scope.new_course : undefined;
                data["newPackage"].schoolTerm = $scope.new_package ? d.schoolTerm : undefined;
                data['schoolTerm'] = $scope.classInfo.schoolTerm ? $scope.classInfo.schoolTerm : {};
                var param = {
                    'page': CONSTANT.PAGE.STUDENT,
                    'item': data,
                    'title': '转课',
                    'location': "outside",
                    'special': 'shengban_changeCourse'
                };
                window.$rootScope.yznOpenPopUp($scope, 'opera-tion', "operat_turn", "1160px", param);
            }

            function getCourseByType() { //获取课程信息
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCoursesList",
                    type: "get",
                    data: {
                        pageType: 0
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            var arr = [];
                            if ($scope.classInfo && $scope.classInfo.course.teachingMethod == 2) {
                                angular.forEach(data.context, function(v) {
                                    if (!(v.teachingMethod == 1 || v.courseType == 1)) {
                                        arr.push(v);
                                    }
                                });
                            }
                            $scope.newcourseList = arr;
                        }

                    }
                })
            }

            function changeNewCourse(x) {
                console.log(x);
                $scope.new_course = x;
                $scope.new_year = "";
                $scope.new_package = "";
                $scope.new_className = "";
                $scope.newitemCourse = "";

                if (x != undefined || x != null) {
                    var course = x;
                    $scope.newitemCourse = course;
                    $scope.new_className = course.courseName + "班";
                }
                shengban_getStudentCourseList();
            }

            function newgetPageYear() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: {
                        pageType: "0"
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.newpageYearList = angular.copy(data.context);
                        }

                    }
                })
            }

            function changeNewYear(x) {
                $scope.new_className = "";
                $scope.new_package = "";
                $scope.new_className = x + " " + ($scope.newitemCourse ? $scope.newitemCourse.courseName : "") + "班";
                shengban_getStudentCourseList();
            }

            function changeNewPack(x) {
                $scope.new_className = "";
                if (x) {
                    var packages = JSON.parse(x);
                    $scope.new_className = $scope.new_year + " " + packages.schoolTermName + " " + ($scope.newitemCourse ? $scope.newitemCourse.courseName : "") + "班";
                } else {
                    $scope.new_className = $scope.new_year + " " + ($scope.newitemCourse ? $scope.newitemCourse.courseName : "") + "班";
                }
                shengban_getStudentCourseList();
            }

            //结业打开窗口
            //          function graduateInit() {
            //              $scope.isTitle = "结业";
            //              $scope.classGra = props.item;
            //              $scope.className = props.item.className;
            //              graduate();
            //          }

            //删除打开窗口
            function deleteInit() {
                $scope.className = props.item.className;
            }

            function confirm_delete() {
                var param = {
                    "classId": global_classId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/deleteClass",
                    type: "POST",
                    data: JSON.stringify(param),
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.$emit("classListChange", "false");
                            if (props.location !== "outside") {
                                $scope.closePopup('class_pop');
                            }
                            $scope.closePopup('confirm_pop');
                        }
                    }
                });
                //              if ($scope.isTitle == "删除") {
                //                  url = "/api/oa/class/deleteClass";
                //                  ajaxConfirm(param, url);
                //              } else {
                //                  param["studentGraduationStatus"] = "1";
                //                  if($scope.hasConfPop){
                //                      param["deleteArrangingCourses"] = "1";
                //                  }
                //                  param["potentialCustomers"] = getStudents();
                //                  url = "/api/oa/class/studentGraduation";
                //                  var list = $scope.studentList;
                //                  var hasTime = false;
                //                  for (var i = 0, len = list.length; i < len; i++) {
                //                      var x = list[i];
                //                      if (x.hasChecked) {
                //                          if ((x.contract.buySurplusDateNum * 1 + x.contract.giveSurplusDateNum * 1 > 0) || (x.contract.buySurplusTime * 1 + x.contract.giveSurplusTime * 1 > 0)) {
                //                              hasTime = true;
                //                              break;
                //                          }
                //                      }
                //                  }
                //                  if (hasTime) {
                //                      var isConfirm = layer.confirm('所选学员中有剩余课时，完成结业后原班级将被结业且无法还原，确定结业？', {
                //                          title: "确认信息",
                //                          skin: 'newlayerui layeruiCenter',
                //                          closeBtn: 1,
                //                          offset: '30px',
                //                          move: false,
                //                          area: '560px',
                //                          btn: ['是', '否'] //按钮
                //                      }, function() {
                //                          ajaxConfirm(param, url);
                //                          layer.close(isConfirm);
                //                      }, function() {
                //                          layer.close(isConfirm);
                //                      })
                //                  } else {
                //                      ajaxConfirm(param, url);
                //                  }
                //              }
            }

            //          function ajaxConfirm(param, url) {
            //              $.hello({
            //                  url: CONFIG.URL + url,
            //                  type: "POST",
            //                  data: JSON.stringify(param),
            //                  success: function(res) {
            //                      if (res.status == 200) {
            //                          $scope.$emit("classListChange", "false");
            //                          if ($scope.isTitle == "删除") {
            //                              if (props.location !== "outside") {
            //                                  $scope.closePopup('class_pop');
            //                              }
            //                          } else {
            //                              getClassDetail(props.item.classId);
            //                          }
            //                          $scope.closePopup('confirm_pop');
            //                      }
            //                  }
            //              });
            //          }

            function getStudents() {
                var arr = [];
                angular.forEach($scope.studentList, function(v) {
                    if ($scope.classGra.course.teachingMethod == 1) {
                        var obj = {
                            contractId: v.contract.contractId,
                            id: v.potentialCustomer.id,
                            potentialCustomerId: v.potentialCustomer.potentialCustomerId
                        };
                        arr.push(obj);
                    } else {
                        if (v.hasChecked) {
                            var obj = {
                                contractId: v.contract.contractId,
                                id: v.potentialCustomer.id,
                                potentialCustomerId: v.potentialCustomer.potentialCustomerId
                            };
                            arr.push(obj);
                        }
                    }

                });
                return arr;
            }

            function getClassDetail(id) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/classInfo",
                    type: "get",
                    data: {
                        classId: id
                    },
                    success: function(res) {
                        if (res.status == 200) {
                            console.log(res)
                            $scope.classInfo = angular.copy(res.context);
                            props.item = $scope.classInfo;
                            //                          var loopsList = [];
                            //                          angular.forEach(res.context.classModels, function(v) {
                            //                              angular.forEach(v.weekList, function(v_) {
                            //                                  loopsList.push('每' + returnweek(v_) + v.beginTime + '-' + v.endTime);
                            //                              })
                            //                          })
                            //                          $scope.classInfo.loopsList = loopsList.join('，');
                            $scope.isactive = $scope.classInfo.classStatus == 2 ? 2 : 1;
                            getCourseByType();
                        }
                    }
                });
            }

            function getClassStatus(x) {
                var str = "";
                return str = CONSTANT.CLASS_STATUS2[x];
            }

            //新增班级
            function ABOUTCLASSINIT() {
                console.log("新增班级");
                $scope.statusCode = "";
                //              $scope.isPageyear = false;
                $scope.pageYearList = []; //课程下的学期列表
                $scope.$broadcast('class_addTeacher', 'clearSatus');
                if (props.type == "add") {
                    $scope.isAddClass = true;
                    $scope.classDetail = {
                        courseId: undefined,
                        courseName: "请选择课程",
                        teacherName: "请选择班主任",
                        className: undefined,
                        classMax: undefined,
                        activityStatus: 0,
                        beginAge: undefined,
                        endAge: undefined,
                        beginDate: undefined,
                        course: "",
                        schoolYear: "",
                        schoolTerm: "",
                        eduManag: "",
                        bookingStatus: "0",
                        isYear: true,
                        //                      loopInfo: {
                        //                          loops: []
                        //                      },
                    };
                    $scope.s_classDetail = {
                        teachers: [],
                        classRoomId: undefined,
                        classDesc: "",
                    };
                    $scope.$broadcast("class_addTeacher", "clearSatus");
                    angular.forEach($scope.teachersList, function(v) {
                        v.hasChecked = false;
                    });
                } else {
                    $scope.isAddClass = false;
                    getClassInfo(global_classId);
                }
                laydate.render({
                    elem: '#startTime', //指定元素
                    isRange: false,
                    done: function(value) {
                        $scope.classDetail.beginDate = value;
                    }
                });
                geteducateManagList() //获取教务
                getClassroomList(); //获取教室
                getTeachersListPop(); //获取老师列表
                getCourseList_classPop(); //获取课程列表
                newgetPageYear(); //获取学期列表
                //              $scope.courseListPop = getTeaching(angular.copy($scope.$parent.courseList));
                $scope.changeGetPage = changeGetPage; //选择课程，学期显示与隐藏
                $scope.changeGetYear = changeGetYear; //新增班级切换学年
                $scope.changeGetPack = changeGetPack; //新增班级切换学期
                $scope.sel_teachers = sel_teachers; //选取意愿老师
                $scope.delTeachers = delTeachers; //删除意愿老师
                $scope.operationItem = operationItem; //处理排课安排时间
                $scope.getMinutes = getMinutes_; //计算分钟
                $scope.change_edu = change_edu; //选择教务
                $scope.openClassroomPop = openClassroomPop; //打开新增教室弹框
                $scope.weekList = [1, 2, 3, 4, 5, 6, 7]; //星期列表
                $scope.sel_loopsTme = sel_loopsTme; //选择时间

                //选择时间
                $scope.$on('time_pop', function(d, d_) {
                    var index = d_.index,
                        data = d_.data;
                    $scope.classDetail.loopInfo.loops[index].operateTime = data;
                })

                function openClassroomPop() {
                    window.$rootScope.yznOpenPopUp($scope, 'classroom-pop', "addClsroom", "560px", { fromPage: 'classPop' });
                }
                //选择时间
                function sel_loopsTme(data, index, item) {
                    item.operateTime = data;
                }

                function change_edu(n) {
                    $scope.classDetail.deanId = n != null ? n.shopTeacherId : undefined;
                }
                //删除排课安排时间
                function operationItem(arr, type, index, isloop) {
                    if (arr) {
                        switch (type) {
                            case 'add':
                                arr.push({
                                    operateTime: { "beginTime": "07:00", "endTime": "07:30" },
                                    week: { 1: true },
                                    oneCourseTime: "1"
                                });
                                break;
                            case 'paikeRemove':
                                arr.splice(index, 1);
                                break;
                            case 'remove':
                                arr.hasSelected = false;
                                if (isloop) {
                                    $scope.classDetail.subTeacher.splice(index, 1);
                                } else {
                                    $scope.classDetail.subTeacher.splice(index, 1);
                                }
                                break;
                        }
                    }
                }

                //              function getTeaching(list) {
                //                  var arr = [];
                //                  angular.forEach(list, function(v) {
                //                      if (v.teachingMethod == 2 && v.courseType == 0) {
                //                          arr.push(v);
                //                      }
                //                  });
                //                  return arr;
                //              }
                function getCourseList_classPop() { //获取课程信息
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/getCoursesList",
                        type: "get",
                        data: { pageType: 0 },
                        success: function(data) {
                            if (data.status == '200') {
                                var arr = [];
                                angular.forEach(data.context, function(v) {
                                    if (v.teachingMethod == 2 && v.courseType == 0) {
                                        arr.push(v);
                                    }
                                });
                                $scope.courseListPop = arr;
                            }

                        }
                    })
                }

                function changeGetPage(x) {
                    console.log(x);
                    var course = x;
                    $scope.itemCourse = course;
                    $scope.classDetail = course;
                    $scope.classDetail.className = course.courseName + "班";
                    $scope.classDetail.schoolYear = "";
                    $scope.classDetail.schoolTerm = "";
                    //                  $scope.classDetail.loopInfo = { //排课计划
                    //                      loops: [{
                    //                          operateTime: {"beginTime": "07:30", "endTime": "09:00"},
                    //                          week: {1:true},
                    //                          oneCourseTime: "1"
                    //                      }]
                    //                  }

                    $scope.classDetail.beginAge = course.beginAge;
                    $scope.classDetail.endAge = course.endAge;
                    //类型 0 课时 1 学期
                    $scope.classDetail.bookingStatus = "0";
                    $scope.classDetail.isYear = true;
                }

                function changeGetYear(x) {
                    $scope.classDetail.className = "";
                    $scope.classDetail.schoolTerm = "";
                    $scope.classDetail.className = x + " " + ($scope.itemCourse ? $scope.itemCourse.courseName : "") + "班";
                }

                function changeGetPack(x) {
                    $scope.classDetail.className = "";
                    var packages = JSON.parse(x);
                    $scope.classDetail.className = $scope.classDetail.schoolYear + " " + packages.schoolTermName + " " + ($scope.itemCourse ? $scope.itemCourse.courseName : "") + "班";
                }

                function getClassInfo(id) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/classInfo",
                        type: "get",
                        data: {
                            classId: id
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                console.log(res);
                                $scope.classDetail = angular.copy(res.context);
                                $scope.classDetail.isYear = res.context.schoolTermId ? true : false;
                                $scope.classDetail.beginDate = yznDateFormatYMd(res.context.beginDate);
                                $scope.classDetail.beginDate_old = yznDateFormatYMd(res.context.beginDate);
                                //                              $scope.classDetail.loopInfo = {loops: []};
                                if (res.context.dean) {
                                    $scope.classDetail.deanId = res.context.dean.shopTeacherId;
                                    $scope.classDetail.deanId_old = angular.copy(res.context.dean.shopTeacherId);
                                    $scope.classDetail.teacherName = res.context.dean.teacherName;
                                } else {
                                    $scope.classDetail.deanId = undefined;
                                    $scope.classDetail.deanId_old = undefined;
                                    $scope.classDetail.teacherName = "请选择班主任";
                                }
                                //                              angular.forEach(res.context.classModels, function(v) {
                                //                                  var weekArr = {};
                                //                                  angular.forEach(v.weekList, function(v_) {
                                //                                      weekArr[v_] = true;
                                //                                  })
                                //                                  $scope.classDetail.loopInfo.loops.push({
                                //                                      operateTime: {"beginTime": v.beginTime, "endTime": v.endTime},
                                //                                      week: weekArr,
                                //                                      oneCourseTime: v.courseHours,
                                //                                      classModelId: v.classModelId
                                //                                  })
                                //                              })

                                $scope.s_classDetail = {
                                    teachers: angular.copy(res.context.teachers),
                                    classRoomId: angular.copy(res.context).classRoomId,
                                    classDesc: angular.copy(res.context).classDesc,
                                };
                            }
                        }
                    });
                }

                function delTeachers(data, ind) {
                    data.hasSelected = false;
                    $scope.s_classDetail.teachers.splice(ind, 1);
                }

                function sel_teachers(data) {
                    var judHas = true;
                    var judHasIndex = null;
                    angular.forEach($scope.s_classDetail.teachers, function(val, index) {
                        if (val.teacherId == data.teacherId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    });
                    if (judHas) {
                        $scope.s_classDetail.teachers.push(data);
                        data.hasSelected = true;
                    } else {
                        $scope.s_classDetail.teachers.splice(judHasIndex, 1);
                        data.hasSelected = false;
                    }
                }


                function getTeachersListPop() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/shopTeacher/list",
                        type: "get",
                        data: {
                            "pageType": "0",
                            "quartersTypeId": "1",
                            "shopTeacherStatus": "1"
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.teachersList = data.context;
                                $timeout(function() {
                                    if ($scope.classDetail) {
                                        $scope.$broadcast('class_addTeacher', 'reloadData', {
                                            'data': $scope.s_classDetail.teachers,
                                            'att': 'teacherId'
                                        });
                                    }
                                }, 500, true);
                            }

                        }
                    })
                }

            }

            function geteducateManagList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data: { "pageType": "0", "quartersTypeId": "14", "shopTeacherStatus": "1" },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.screen_educateManag = data.context;
                        }

                    }
                })
            }

            function confirm_class_paike() {
                $scope.isAddClass = true;
                var judge = [false, ''];
                if (!$scope.classDetail.className) {
                    judge = [true, '班级名称'];
                } else if ($scope.classDetail.isYear && !$scope.classDetail.schoolYear) {
                    judge = [true, '学年'];
                } else if ($scope.classDetail.isYear && !$scope.classDetail.schoolTerm) {
                    judge = [true, '学期'];
                } else if (!$scope.classDetail.classMax) {
                    judge = [true, '最大人数'];
                } else {

                }
                if (judge[0]) {
                    return layer.msg(judge[1] + "不能为空");
                }
                confirm_class("toPaike");
            }

            function confirm_class(type) {
                console.log($scope.classDetail);
                //              if ($scope.classDetail.beginAge * 1 > $scope.classDetail.endAge * 1) {
                //                  layer.msg("起始年龄不能大于最大年龄");
                //                  return;
                //              }
                var url, classModelsList = [],
                    judgeReturn = [true, ''];
                var params = {
                    "className": $scope.classDetail.className,
                    "classMax": $scope.classDetail.classMax,
                    "activityStatus": $scope.classDetail.activityStatus,
                    "beginDate": $scope.classDetail.beginDate,
                    "teachers": getTeachersArr(),
                    "deanId": $scope.classDetail.deanId,
                    'classModels': [],
                    //                  "bookingStatus":$scope.classDetail.bookingStatus
                };
                //教务修改从有值到无值传deleteDeanId
                if ($scope.classDetail.deanId_old && !$scope.classDetail.deanId) {
                    params["deleteDeanId"] = "1";
                }
                if ($scope.classDetail.beginDate_old && !$scope.classDetail.beginDate) {
                    params["deleteBeginDate"] = "1";
                }
                //              //处理排课时间安排
                //              angular.forEach($scope.classDetail.loopInfo.loops, function(v) {
                //                  var weekArr = [];    //判断week对象是否为空对象
                //                  for (var i in v.week) { //循环多选的星期
                //                  	if(v.week[i]) {
                //                  	    weekArr.push(i);
                //                  	}
                //                  }
                //                  if(weekArr.length > 0) {
                //                      classModelsList.push({
                //                          beginTime: v.operateTime.beginTime,
                //                          endTime: v.operateTime.endTime,
                //                          week: weekArr.join(','),
                //                          courseHours: v.oneCourseTime*1,
                //                          classModelId: v.classModelId?v.classModelId:undefined,
                //                      })
                //                  } else {
                //                      judgeReturn = [false, '请选择星期'];
                //                      return;
                //                  }
                //              })
                //              params['classModels'] = classModelsList;

                if ($scope.bookingSture != 0) {
                    params["bookingStatus"] = $scope.classDetail.bookingStatus;
                }

                if ($scope.isAddClass) {
                    if (!$scope.classDetail.courseId && $scope.classDetail.activityStatus == 0) {
                        judgeReturn = [false, "请选择课程"];
                    }
                    params["courseId"] = $scope.classDetail.courseId;
                    //如果没有勾选学期班，这两字段不传
                    if ($scope.classDetail.isYear) {
                        if ($scope.classDetail.schoolTerm) {
                            params["schoolTermId"] = $scope.classDetail.schoolTerm ? JSON.parse($scope.classDetail.schoolTerm).schoolTermId : undefined;
                        }
                        if ($scope.classDetail.schoolYear) {
                            params["schoolYear"] = $scope.classDetail.schoolYear;
                        }
                    }

                    url = "/api/oa/class/addClass";
                } else {
                    params["classId"] = $scope.classDetail.classId;
                    params["courseId"] = $scope.classDetail.course.courseId;


                    //是否修改老师 0 检测 1 是 2 否 （2.6）
                    if ($scope.statusCode == "20034" || $scope.statusCode == "20036") {
                        params["updateTeacherStatus"] = "1";
                    } else if ($scope.statusCode == "20035") {
                        params["updateTeacherStatus"] = "2";
                    } else {
                        params["updateTeacherStatus"] = "0";
                    }
                    url = "/api/oa/class/updateClass";
                }
                for (var i in params) {
                    if (params[i] == '' || params[i] == undefined) {
                        delete params[i];
                    }
                }
                params["classDesc"] = $scope.s_classDetail.classDesc;
                params["beginAge"] = $scope.classDetail.beginAge;
                params["endAge"] = $scope.classDetail.endAge;
                params["classRoomId"] = $scope.s_classDetail.classRoomId;

                if (!judgeReturn[0]) { //打印错误信息
                    layer.msg(judgeReturn[1]);
                    return;
                }
                $.hello({
                    url: CONFIG.URL + url,
                    type: "POST",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            if (!$scope.isAddClass) {
                                if (props.location == "inside") {
                                    getClassDetail(props.item.classId);
                                    $scope.$emit('to_course_class');
                                    //                                 $scope.$broadcast('classChange','编辑班级');
                                }
                            }
                            if ($scope.isAddClass) {
                                if (type == "toPaike") { //新增班级并排课
                                    var obj = res.context;
                                    obj["teachers"] = res.context.teachers ? res.context.teachers : [];
                                    var param = {
                                        "pop": "paike",
                                        "name": "class",
                                        "isSingle": "1",
                                        "title": "快速排课",
                                        "item": obj
                                    };
                                    if (!$scope.props.hide_operate) {
                                        window.$rootScope.yznOpenPopUp($scope.$parent, "arange-pop", "arange_pop", "760px", param);
                                    }
                                    //                                      getClassDetail(res.context.classId,'toPaike');
                                    $scope.$emit("classListChange", "false", "nosort");
                                }
                                $scope.$emit("classListChange", "false", "nosort");
                                $scope.$emit("newAddClass_", res.context.classId);

                            } else {
                                $scope.$emit("classListChange", "true");
                            }
                            if ($scope.statusCode == "20034" || $scope.statusCode == "20035" || $scope.statusCode == "20036") {
                                $scope.closePopup('change_teacher');
                                $scope.statusCode = "";
                            }
                            $scope.closePopup('addClass_pop');

                        } else if (res.status == "20034" || res.status == "20035" || res.status == "20036") {
                            $scope.statusCode = res.status;
                            $scope.goPopup("change_teacher", "560px");
                            $scope.confirm_chgTeach = function() {
                                confirm_class();
                            }
                            return true;
                        }
                    }
                });
            }

            function getTeachersArr() {
                var arr = [];
                angular.forEach($scope.s_classDetail.teachers, function(v, k) {
                    var obj = {};
                    obj.shopTeacherId = v.shopTeacherId;
                    obj.teacherId = v.teacherId;
                    arr.push(obj);
                });
                return arr;
            }
            //本班学员 即将插班   即将退班  鼠标滑过  详情展示   common
            function ngMouseenter($event, d) {
                var e = $($event.currentTarget),
                    offtot = e.offset().top,
                    offleft = e.offset().left,
                    width = e.width(),
                    initleft = $('#class_pop').offset().left;
                if (d == '2') {
                    e.children('.enrollmouse').css({
                        'top': offtot - 12,
                        'left': offleft - initleft - 50,
                        'display': 'block'
                    });
                }
            }

            function ngMouseleave($event) {
                var e = $($event.currentTarget);
                e.next('.enrollmouse').hide();
                e.children('.enrollmouse').hide();
            }

            function $yznDateFormatYMdHm(val) {
                return yznDateFormatYMdHm(val);
            }

        }
    })
});