define(['laydate',"potential_pop"], function(laydate) {
    creatPopup({
        el: 'studentSel',
        openPopupFn: 'selectStudent',
        htmlUrl: './templates/popup/students_Sel.html',
        controllerFn: function($scope, props, SERVICE) {
            console.log(props);
            $scope.props = props;
            var pagerRender = false,
                start = 0,
                eachPage = localStorage.getItem('studentPageSel') ? localStorage.getItem('studentPageSel') : 10; //页码初始化
            var screen_classId = screen_courseId = screenName = screenType = searchGrade = $year = $term = undefined;
            var searchAge = {};
            $scope.sel_all = false;
            $scope.isactive = 1;
            init();

            function init() {
                getCourseList();
                getTermList();
                getClassList(props.courseId);
                //搜索类型
                $scope.screen_InfoNameId = 'studentName'; //select初始值
                $scope.screen_searchData = {
                    studentName: '姓名',
                    studentNickName: '昵称',
                    userPhone: '手机号'
                };
                $scope.params_student = [];
                $scope.screen_years = getFrom2017(true,8); //学年
                $scope.screen_grade_list = getConstantList(CONSTANT.STUDENTGRADE); //潜客年级列表
                $scope.caclBirthToAge = caclBirthToAge; //计算年龄
                $scope.screen_SearchBtn = screen_SearchBtn; //搜索按钮
                $scope.screen_Enterkeyup = screen_Enterkeyup; //keyup筛选
                $scope.screen_courseSelect = screen_courseSelect; //选择课程
                $scope.screen_classSelect = screen_classSelect; //选择班级
                $scope.courseType0 = courseType0; //标准课
                $scope.courseType1 = courseType1; //通用课
                $scope.checkboxAll = checkboxAll; //表头全选
                $scope.checkSingle = checkSingle; //选择tr
                $scope.screen_onReset_ = screen_onReset_; //弹框重置按钮
                $scope.sureStudent = sureStudent; //选择学员后确认按钮
                $scope.screenByAge = screenByAge; //选择年龄
                $scope.screenByGrade = screenByGrade; //选择年级
                $scope.screen_changeYear = screen_changeYear; //选择学年
                $scope.screen_changeTerm = screen_changeTerm; //选择学期
                screen_onReset_();

                switch (props.type) {
                    case "student":
                        STUDENTINIT();
                        break;
                    case "student_new":
                        STUDENTINIT_NEW();
                        break;
                    case "student_online":
                        STUDENTINIT_ONLINE();
                        break;
                    case "student_activity":
                        STUDENTINIT_ACTIVITY();
                        break;
                    case "student2":
                        STUDENTINIT2();
                        break;
                    case "makeup_student":
                        MAKEUPSTUDENTINT();
                        break;
                    case "listen_student":
                        LISTENSTUDENTINIT();
                        break;
                    case "potential":
                        POTENTIALTINIT();
                        break;
                    case "refferral":
                        REFFERRALINIT();
                        break;
                    default:
                        break;
                }
                $scope.goCommonPop = function(el, id, width, data) {
                    window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                }
            }

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

            function STUDENTINIT() {
                console.log("student");
                $scope.kindSearchOnreset_["select_studs"]();
                $scope.isCourseScreen = true;
                $scope.choseType = props.choseType;
                eachPage = localStorage.getItem('studentPageSel') ? localStorage.getItem('studentPageSel') : 10; //页码初始化
                student_init();

                function student_init() {
                    screen_courseId = props.item;
                    if (props.courseId) {
                        $scope.isCourseScreen = false;
                        screen_courseId = props.courseId;
                    }
                    getStudents(0);
                }
            }

            function STUDENTINIT_NEW() {
                console.log("student_new");
                $scope.screen_searchData = {
                    studentName: '姓名、昵称、联系方式',
                };
                $scope.kindSearchOnreset_["select_studs_new"]();
                $scope.choseType = props.choseType;
                eachPage = localStorage.getItem('studentNewPageSel') ? localStorage.getItem('studentNewPageSel') : 10; //页码初始化
                student_init();

                function student_init() {
                    searchAge = {};
                    $scope.classStatus = false;
                    $scope.ageSearchOnreset_["screen_age"](); //调取app重置方法
                    $scope.$broadcast("screen_grade", "clearHeadName");
                    $scope.chgclassStatus = function() {
                        pagerRender = false;
                        getStudentsNew(0);
                    }
                    getStudentsNew(0);
                }
            }

            function STUDENTINIT_ONLINE() {
                $scope.choseType = props.choseType;
                $scope.isCourseScreen = true;
                $scope.kindSearchOnreset_["select_studs_online"]();
                eachPage = localStorage.getItem('student_onlinePageSel') ? localStorage.getItem('student_onlinePageSel') : 10; //页码初始化
                student_init();

                function student_init() {
                    screen_courseId = props.item;
                    if (props.courseId) {
                        $scope.isCourseScreen = false;
                        screen_courseId = props.courseId;
                    }
                    getStudents_online(0);
                }
            }

            function STUDENTINIT_ACTIVITY() {
                $scope.screen_searchData = {
                    studentName: '姓名、昵称、联系方式',
                };
                $scope.choseType = props.choseType;
                $scope.isCourseScreen = true;
                $scope.kindSearchOnreset_["select_studs_activity"]();
                eachPage = localStorage.getItem('student_activityPageSel') ? localStorage.getItem('student_activityPageSel') : 10; //页码初始化
                student_init();

                function student_init() {
                    screen_courseId = props.item;
                    if (props.courseId) {
                        $scope.isCourseScreen = false;
                        screen_courseId = props.courseId;
                    }
                    getStudents_activity(0);
                }
            }

            function STUDENTINIT2() {
                console.log("student2");
                $scope.kindSearchOnreset_["select_studs2"]();
                $scope.screen_searchData = {
                    studentName: '姓名、昵称、联系方式',
                };
                $scope.choseType = props.choseType;
                //              eachPage = localStorage.getItem('studentPageSel2') ? localStorage.getItem('studentPageSel2') : 10; //页码初始化
                student_init();

                function student_init() {
                    $scope.courseType_0 = $scope.courseType_0 = false;
                    getStudents2(0);
                }
            }

            function MAKEUPSTUDENTINT() {
                console.log("makeupStudent");
                eachPage = localStorage.getItem('makeupStudentPageSel') ? localStorage.getItem('makeupStudentPageSel') : 10; //页码初始化
                $scope.makeup_screenTime = "";
                $scope.screen_searchData = {
                    studentName: '姓名、昵称',
                };
                makeup_init();

                function makeup_init() {
                    $scope.kindSearchOnreset_["select_studs_make"]();
                    (function() {
                        laydate.render({
                            elem: '#makeup_screenTime', //指定元素
                            range: '到',
                            isRange: true,
                            done: function(value) {
                                $scope.makeup_screenTime = value;
                                pagerRender = false;
                                getMakeupStudents(0);

                            }
                        });
                    })();
                    getMakeupStudents(0);
                }
            }

            function LISTENSTUDENTINIT() {
                console.log("listentStudent");
                eachPage = localStorage.getItem('listentStudentPageSel') ? localStorage.getItem('listentStudentPageSel') : 10; //页码初始化
                listent_init();

                function listent_init() {
                    $scope.kindSearchOnreset_["select_studs_listen"]();
                    getListentStudents(0);
                }
            }

            function POTENTIALTINIT() {
                if ($scope.props.sourcePage == '快速收款') {
                    $scope.screen_searchData = {
                        studentName: '学员姓名、昵称、联系方式',
                    };
                    if ($scope.props.initName) {
                        screenName = $scope.props.initName;
                    }
                    setTimeout(function() {
                        $scope.$broadcast('select_potential', $scope.props.initName);
                    }, 0)
                }
                $scope.choseType = props.choseType;
                $scope.kindSearchOnreset_["select_potential"]();
                eachPage = localStorage.getItem('potentialPageSel') ? localStorage.getItem('potentialPageSel') : 10; //页码初始化
                getPotential(0);
            }
            function REFFERRALINIT() {
                $scope.choseType = props.choseType;
                $scope.tab_studs = tab_studs;
                tab_studs(1);

                function tab_studs(n) {
                    $scope.isactive = n;
                    switch (n) {
                        case 1:
                            $scope.screen_searchData = {
                                studentName: '推荐人姓名、联系方式',
                            };
                            break;
                        case 2:
                            $scope.screen_searchData = {
                                studentName: '学员姓名、联系方式',
                            };
                            break;
                        case 3:
                            $scope.screen_searchData = {
                                studentName: '老师姓名、联系方式',
                            };
                            break;
                        default:
                            break;
                    }
                    $scope.screen_InfoNameId = 'studentName';
                    $scope.kindSearchOnreset_["select_refferral"]();
                    eachPage = localStorage.getItem('refferralPageSel') ? localStorage.getItem('refferralPageSel') : 10; //页码初始化
                    screenName = undefined;
                    pagerRender = false;
                    getRefferralist(0);
                }
            }

            function sureStudent(type, list) {
                switch (type) {
                    case 'student': //选择请假学员
                        var data = $scope.params_student;
                        if (!data || data.length == 0) {
                            layer.msg('请选择学员');
                            return;
                        } else {
                            if (props.callBackName) {
                                $scope.$emit(props.callBackName, data);
                            }
                            $scope.closePopup('selectStuds');
                        };
                        break;
                    case 'student_new': //选择请假学员
                        var data = $scope.params_student;
                        if (!data || data.length == 0) {
                            layer.msg('请选择学员');
                            return;
                        } else {
                            if (props.callBackName) {
                                $scope.$emit(props.callBackName, data);
                            }
                            $scope.closePopup('selectStuds_new');
                        };
                        break;
                    case 'potential': //选择学员
                        var data = $scope.params_student;
                        if (!data || data.length == 0) {
                            layer.msg('请选择学员');
                            return;
                        } else {
                            if (props.callBackName) {
                                $scope.$emit(props.callBackName, data);
                            }
                            $scope.closePopup('selectStuds_potential');
                        };
                        break;
                    case 'refferral': //选择学员
                        var data = $scope.params_student;
                        if (!data || data.length == 0) {
                            layer.msg('请选择'+($scope.isactive==1?'推荐人':$scope.isactive==2?'学员':'老师'));
                            return;
                        } else {
                            if (props.callBackName) {
                                data["referralType"] = $scope.isactive;
                                $scope.$emit(props.callBackName, data);
                            }
                            $scope.closePopup('selectStuds_refferral');
                        };
                        break;
                    case 'student2': //选择请假学员
                        var data = $scope.params_student;
                        if (!data || data.length == 0) {
                            layer.msg('请选择学员');
                            return;
                        } else {
                            var hash = {};
                            for (var i in data) {
                                if (hash[data[i].potentialCustomerId]) {
                                    return layer.msg("所选学员重复，请重新选择！");
                                    break;
                                }
                                hash[data[i].potentialCustomerId] = true;
                            }
                            if (props.callBackName) {
                                $scope.$emit(props.callBackName, data);
                            }
                            $scope.closePopup('selectStuds2');
                        };
                        break;
                    default: //选择补课学员或者试听学员
                        var stud_arr = $scope.params_student;
                        if (stud_arr.length <= 0) {
                            layer.msg('请选择学员');
                            return;
                        } else {
                            if (props.callBackName) {
                                $scope.$emit(props.callBackName, stud_arr);
                            }
                            $scope.closePopup('listen_stu');
                        }
                        break;
                }
            }

            function checkboxAll(d, list) {
                var i_ = [false, null];
                if (d) {
                    angular.forEach(list, function(val_1) {
                        if (!val_1.hasChecked) {
                            val_1.hasChecked = true;
                            $scope.params_student.push(val_1);
                        }
                    });
                } else {
                    angular.forEach(list, function(val_1) {
                        val_1.hasChecked = false;
                        i_ = [false, null];
                        angular.forEach($scope.params_student, function(val_2, ind_2) {
                            switch (props.type) {
                                case 'listen_student':
                                    if (val_1.auditionRecordId == val_2.auditionRecordId) {
                                        i_ = [true, ind_2];
                                    };
                                    break;
                                case 'makeup_student':
                                    if (val_1.studentCourseTimeInfoId == val_2.studentCourseTimeInfoId) {
                                        i_ = [true, ind_2];
                                    };
                                    break;
                                default:
                                    if (val_1.potentialCustomerId == val_2.potentialCustomerId) {
                                        i_ = [true, ind_2];
                                    };
                                    break;
                            };
                        });
                        if (i_[0]) {
                            $scope.params_student.splice(i_[1], 1);
                        }
                    });
                }
            }

            function checkSingle(data, list) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_student = data;
                } else {
                    var index_ = [false, null];
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_student, function(val, ind) {
                            switch (props.type) {
                                case 'listen_student':
                                    if (data.auditionRecordId == val.auditionRecordId) {
                                        index_ = [true, ind];
                                    };
                                    break;
                                case 'makeup_student':
                                    if (data.studentCourseTimeInfoId == val.studentCourseTimeInfoId) {
                                        index_ = [true, ind];
                                    };
                                    break;
                                default:
                                    if (data.potentialCustomerId == val.potentialCustomerId) {
                                        index_ = [true, ind];
                                    };
                                    break;
                            };
                        });
                        if (index_[0]) {
                            $scope.params_student.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_student.push(data);
                    }
                }
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
                            $scope.screen_courseList = data.context;
                        }
                    }
                });
            }
            //获取班级列表
            function getClassList(id) {
                var p = {
                    pageType: "0",
                };
                if (id) {
                    p["courseId"] = id;
                }
                p['schoolYear'] = props.schoolYear ? props.schoolYear : undefined;
                p['schoolTermId'] = props.schoolTermId ? props.schoolTermId : undefined;
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

            function screen_SearchBtn(data, type) {
                screenName = data.value;
                screenType = data.type;
                pagerRender = false;
                reloadList(type);
            }

            function screen_Enterkeyup(data, type) {
                screenName = data.value;
                screenType = data.type;
                pagerRender = false;
                reloadList(type);
            }

            function courseType0(type) {
                if ($scope.courseType_0) {
                    $scope.courseType_1 = false;
                }
                pagerRender = false;
                reloadList(type);
            }

            function courseType1(type) {
                if ($scope.courseType_1) {
                    $scope.courseType_0 = false;
                }
                pagerRender = false;
                reloadList(type);
            }

            function screen_courseSelect(c, type) {
                screen_courseId = c == null ? undefined : c.courseId;
                screen_classId = undefined;
                $scope.screen_goReset['选择班级']();
                getClassList(screen_courseId);
                pagerRender = false;
                reloadList(type);
            }

            function screenByAge(a, type) {
                searchAge = a;
                pagerRender = false;
                reloadList(type);
            }

            function screenByGrade(val, type) {
                if (val == null) {
                    searchGrade = null;
                } else {
                    searchGrade = val.value;
                }
                pagerRender = false;
                reloadList(type);
            }

            function screen_changeYear(y, type) {
                $year = y == null ? undefined : y.year;
                pagerRender = false;
                reloadList(type);
            }

            function screen_changeTerm(t, type) {
                $term = t == null ? undefined : t.schoolTermId;
                pagerRender = false;
                reloadList(type);
            }

            function screen_classSelect(c, type) {
                screen_classId = c == null ? undefined : c.classId;
                pagerRender = false;
                reloadList(type)
            }

            function screen_onReset_(type) {
                screen_classId = screen_courseId = screenName = screenType = searchGrade = $year = $term = undefined;
                searchAge = {};
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                $scope.kindSearchOnreset(); //调取app重置方法
                if (type == 'makeup') {
                    $scope.makeup_screenTime = "";
                }
                if (type == 'student' || type == 'makeup' || type == 'student_online' || type == 'student_new') {
                    getClassList(props.courseId);
                }
                if (type == 'student2' || type == 'student_new') {
                    $scope.courseType_0 = $scope.courseType_1 = false;
                }
                if (type == 'student_new') {
                    $scope.classStatus = undefined;
                    $scope.ageSearchOnreset_["screen_age"](); //调取app重置方法
                    $scope.$broadcast("screen_grade", "clearHeadName");
                }
                pagerRender = false;
                reloadList(type);
            }

            function reloadList(type) {
                switch (type) {
                    case 'student':
                        getStudents(0);
                        break;
                    case 'student_new':
                        getStudentsNew(0);
                        break;
                    case 'student_online':
                        getStudents_online(0);
                        break;
                    case 'student_activity':
                        getStudents_activity(0);
                        break;
                    case 'student2':
                        getStudents2(0);
                        break;
                    case 'makeup':
                        getMakeupStudents(0);
                        break;
                    case 'listen':
                        getListentStudents(0);
                        break;
                    case 'potential':
                        getPotential(0);
                        break;
                    case 'refferral':
                        getRefferralist(0);
                        break;
                    default:
                        break;
                }
            }

            function getStudents(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "studentStatus": "0",
                    "classId": screen_classId,
                    "courseId": props.courseId ? props.courseId : screen_courseId,
                    "searchType": screenType,
                    "searchName": screenName,
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/getStudentCenter",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.studentList = data.context.items;
                            repeatLists($scope.studentList, $scope.params_student, 'potentialCustomerId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function getStudentsNew(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "pageType": 1,
                    "courseId": props.courseId ? props.courseId : screen_courseId,
                    "classId": screen_classId,
                    "searchType": screenName ? 'appSearchName' : undefined,
                    "searchName": screenName,
                    "beginAge": searchAge.minAge || undefined,
                    "endAge": searchAge.maxAge || undefined,
                    "grade": searchGrade || undefined,
                    "courseType": $scope.courseType_0 ? "0" : $scope.courseType_1 ? "1" : undefined,
                    "classType": $scope.classStatus == true ? "0" : undefined,
                    'excludeClassId': props.excludeClassId ? props.excludeClassId : undefined
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/getStudentByClassId",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.studentList = data.context.items;
                            repeatLists_new($scope.studentList, $scope.params_student, 'potentialCustomerId', 'contract.contractId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function repeatLists_new(list1, list2, atts1, atts2) {
                console.log(list1, list2, atts1);
                var d_1, d_2;
                for (var i = 0; i < list1.length; i++) {
                    d_1 = list1[i];
                    for (var j = 0; j < list2.length; j++) {
                        d_2 = list2[j];
                        if (getAtt(d_1, atts1) == getAtt(d_2, atts1) && getAtt(d_1, atts2) == getAtt(d_2, atts2)) {
                            d_1['hasChecked'] = true;
                        }
                    }
                };

                //获取对象的属性
                function getAtt(obj, at) {
                    var obj = obj;
                    if (at) {
                        var att = at.split('.');
                        for (var i = 0; i < att.length; i++) {
                            obj = obj[att[i]]
                        };
                    }
                    if (!obj) {
                        return '';
                    } else {
                        return obj;
                    }
                };
            }

            function getStudents_online(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "courseId": props.courseId ? props.courseId : screen_courseId,
                    "classId": screen_classId,
                    "searchType": "appSearchName",
                    "searchName": screenName,
                    "excludeOcCourseId": props.excludeOcCourseId ? props.excludeOcCourseId : undefined
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/onlineCourse/listPotentialCustomer",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            //                          / * 备注：
                            //                           * 如果有老数据需要默认勾选的数据则循环勾选
                            //                           */
                            //                          if(props && props.oldData) {
                            //                              angular.forEach(data.context.items, function(v1,i) {
                            //                                  angular.forEach(props.oldData, function(v2) {
                            //                                      if(v2.potentialCustomerId == v1.potentialCustomerId) {
                            //                                          v1.hasChecked = true;
                            //                                          $scope.params_student.push(v1);
                            //                                      }
                            //
                            //                                  })
                            //                              })
                            //                          }
                            $scope.studentList = data.context.items;
                            repeatLists($scope.studentList, $scope.params_student, 'potentialCustomerId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function getPotential(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "searchType": "appSearchName",
                    "searchName": screenName,
                    'excludePrId': props.excludePrId ? props.excludePrId : undefined //从点名中进入需筛选本班已有学员
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/potentialCustomer/listPotentialCustomer",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.studentList = data.context.items;
                            //                          repeatLists($scope.studentList, $scope.params_student, 'potentialCustomerId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }
            function getRefferralist(start) {
                var url = "";
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "searchType": "appSearchName",
                    "searchName": screenName,
                }
                switch ($scope.isactive) {
                    case 1:
                        url = "/api/oa/referral/listReferralData";
                        break;
                    case 2:
                        url = "/api/oa/potentialCustomer/listPotentialCustomer";
                        break;
                    case 3:
                        params["shopTeacherStatus"] = "1";
                        url = "/api/oa/shopTeacher/list";
                        break;
                    default:
                        break;
                }

                $.hello({
                    url: CONFIG.URL + url,
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.studentList = data.context.items;
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function getStudents_activity(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "courseId": props.courseId ? props.courseId : screen_courseId,
                    "classId": screen_classId,
                    "searchType": "appSearchName",
                    "searchName": screenName,
                    "excludedId": props.excludedId ? props.excludedId : undefined
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/potentialCustomer/listContractRenew",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.studentList = data.context.items;
                            repeatLists_act($scope.studentList, $scope.params_student, 'potentialCustomerId', 'contractId', 'schoolYear', 'schoolTermId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function repeatLists_act(list1, list2, atts1, atts2, atts3, atts4) {
                console.log(list1, list2, atts1);
                var d_1, d_2;
                for (var i = 0; i < list1.length; i++) {
                    d_1 = list1[i];
                    for (var j = 0; j < list2.length; j++) {
                        d_2 = list2[j];
                        if (getAtt(d_1, atts1) == getAtt(d_2, atts1) && getAtt(d_1, atts2) == getAtt(d_2, atts2) && getAtt(d_1, atts3) == getAtt(d_2, atts3) && getAtt(d_1, atts4) == getAtt(d_2, atts4)) {
                            d_1['hasChecked'] = true;
                        }
                    }
                };

                //获取对象的属性
                function getAtt(obj, at) {
                    var obj = obj;
                    if (at) {
                        var att = at.split('.');
                        for (var i = 0; i < att.length; i++) {
                            obj = obj[att[i]]
                        };
                    }
                    if (!obj) {
                        return '';
                    } else {
                        return obj;
                    }
                };
            }

            function getStudents2(start) {
                var params = {
                    //                  "classId": props.item?props.item.classId:undefined,
                    "courseId": props.courseId ? props.courseId : undefined,
                    "searchType": "appSearchName",
                    "searchName": screenName,
                    "courseType": $scope.courseType_0 ? "0" : $scope.courseType_1 ? "1" : undefined,
                    "excludeClassId": props.excludeClassId ? props.excludeClassId : undefined,
                };
                if (props.schoolTerm) {
                    params["schoolYear"] = props.schoolTerm.schoolYear;
                    params["schoolTermId"] = props.schoolTerm.schoolTermId;
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/getStudentByClassId",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {

                            $scope.params_student = [];
                            /*
                             * 备注：
                             * 如果有老数据需要默认勾选的数据则循环勾选
                             */
                            if (props.item.oldData) {
                                angular.forEach(data.context, function(v1, i) {
                                    angular.forEach(props.item.oldData, function(v2) {
                                        if (v2.id == v1.potentialCustomer.id && v2.contractId == v1.contract.contractId) {
                                            v1.hasChecked = true;
                                            $scope.params_student.push(v1);
                                        }
                                        if (v2.id == v1.potentialCustomer.id && v2.contractId != v1.contract.contractId) {
                                            data.context.splice(i, 1);
                                        }
                                    })
                                })
                            }
                            $scope.studentList2 = data.context;
                            //                          renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function getMakeupStudents(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "classId": screen_classId,
                    "studentStatus": "0,2",
                    "courseId": props.courseId ? props.courseId : undefined,
                    "schoolYear": $year,
                    "schoolTermId": $term,
                    "searchType": screenName ? "appSearchName" : undefined,
                    'bukeStatus': '0',
                    "searchName": screenName,
                }
                if ($scope.makeup_screenTime) {
                    params["beginTime"] = $scope.makeup_screenTime.split(" 到 ")[0] + " 00:00:00";
                    params["endTime"] = $scope.makeup_screenTime.split(" 到 ")[1] + " 23:59:59";
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/leave/makeUp/list",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.makeupStudentList = data.context.items;
                            repeatLists($scope.makeupStudentList, $scope.params_student, 'studentCourseTimeInfoId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function getListentStudents(start) {
                var params = {
                    "start": start.toString() || "0",
                    "count": eachPage,
                    "courseId": props.courseId ? props.courseId : undefined,
                    "auditionRecordStatus": "0",
                    "searchType": screenType,
                    "searchName": screenName,
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/audition/list",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.params_student = [];
                            /*
                             * 备注：
                             * 如果有老数据需要默认勾选的数据则循环勾选
                             */
                            if (props.item && props.item.oldData) {
                                angular.forEach(data.context.items, function(v1, i) {
                                    v1.teacherStr = arrToStr(v1.teachers, "teacherName");
                                    v1.auditionDates = setAuditionDates(v1.courseAuditionDates);
                                    angular.forEach(props.item.oldData, function(v2) {
                                        if (v2.id == v1.potentialCustomer.id) {
                                            v1.hasChecked = true;
                                            $scope.params_student.push(v1);
                                        }

                                    })
                                })
                            } else {
                                angular.forEach(data.context.items, function(v1, i) {
                                    v1.teacherStr = arrToStr(v1.teachers, "teacherName");
                                    v1.auditionDates = setAuditionDates(v1.courseAuditionDates);
                                })
                            }
                            $scope.listenStudentList = data.context.items;
                            $scope.sel_all = false;
                            repeatLists($scope.listenStudentList, $scope.params_student, 'auditionRecordId');
                            renderPager(data.context.totalNum);
                        }
                    }
                })
            }

            function renderPager(total) { //分页
                if (props.type == 'student_online' || props.type == 'student_activity' || props.type == 'student_new') {
                    var len = 0;
                    angular.forEach($scope.studentList, function(v) {
                        if (v.hasChecked) {
                            len += 1;
                        }
                    });
                    if ($scope.studentList.length > 0 && $scope.studentList.length == len) {
                        $scope.sel_all = true;
                    } else {
                        $scope.sel_all = false;
                    }
                }
                if (pagerRender)
                    return;
                pagerRender = true;
                var $M_box3;
                switch (props.type) {
                    case 'student':
                        $M_box3 = $('.studentPage');
                        break;
                    case 'student_new':
                        $M_box3 = $('.student_newPage');
                        break;
                    case 'student_online':
                        $M_box3 = $('.student_onlinePage');
                        break;
                    case 'student_activity':
                        $M_box3 = $('.student_activityPage');
                        break;
                    case 'student2':
                        $M_box3 = $('.studentPage2');
                        break;
                    case 'makeup_student':
                        $M_box3 = $('.makeupStudentPage');
                        break;
                    case 'listen_student':
                        $M_box3 = $('.listenStudentPage');
                        break;
                    case 'potential':
                        $M_box3 = $('.potentialPage');
                        break;
                    case 'refferral':
                        $M_box3 = $('.referralPage');
                        break;
                    default:
                        break;
                }
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
                            switch (props.type) {
                                case 'student':
                                    localStorage.setItem('studentPageSel', eachPage);
                                    break;
                                case 'student_new':
                                    localStorage.setItem('studentNewPageSel', eachPage);
                                    break;
                                case 'student_online':
                                    localStorage.setItem('student_onlinePageSel', eachPage);
                                    break;
                                case 'student_activity':
                                    localStorage.setItem('student_activityPageSel', eachPage);
                                    break;
                                    //                              case 'student2':localStorage.setItem('studentPageSel2', eachPage);
                                    //                                  break;
                                case 'makeup_student':
                                    localStorage.setItem('makeupStudentPageSel', eachPage);
                                    break;
                                case 'listen_student':
                                    localStorage.setItem('listentStudentPageSel', eachPage);
                                    break;
                                case 'potential':
                                    localStorage.setItem('potentialPageSel', eachPage);
                                    break;
                                case 'refferral':
                                    localStorage.setItem('refferralPageSel', eachPage);
                                    break;
                                default:
                                    break;
                            }
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        switch (props.type) {
                            case 'student':
                                getStudents(start);
                                break;
                            case 'student_new':
                                getStudentsNew(start);
                                break;
                            case 'student_online':
                                getStudents_online(start);
                                break;
                            case 'student_activity':
                                getStudents_activity(start);
                                break;
                                //                          case 'student2':getStudents2(start);
                                //                              break;
                            case 'makeup_student':
                                getMakeupStudents(start);
                                break;
                            case 'listen_student':
                                getListentStudents(start);
                                break;
                            case 'potential':
                                getPotential(start);
                                break;
                            case 'refferral':
                                getRefferralist(start);
                                break;
                            default:
                                break;
                        }
                    }
                });
            }
        }
    });
});