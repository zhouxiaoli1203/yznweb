define(['laydate', 'layui', 'szpUtil', 'mySelect', "rollCall", "timesel", "students_sel", 'potential_pop', 'bukePop', 'databasePop'], function(laydate) {
    creatPopup({
        el: 'clsaffairPop',
        openPopupFn: 'viewClassAffair',
        //      closePopupFn: 'closeRollCall',
        htmlUrl: './templates/popup/classAffair_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state, $sce) {
            $scope.localTeachId = window.currentUserInfo.teacherId;
            console.log(props);
            if (props) {
                $scope.props = angular.copy(props);
            } else {
                $scope.props = "";
            }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }

            function init() {
                getPoints();
                getConfig();
                judgeSignInShow();
                if ($scope.props.item) {
                    getClassAffairInfo();
                }
                if (props.listenPage) { //试听课表进入课务详情
                    $scope.changePaike = checkAuthMenuById("41"); //操作试听
                } else {
                    if (props.page == "mySchedule") { //我的课表入口
                        $scope.changePaike = false;
                    } else {
                        $scope.changePaike = checkAuthMenuById("37"); //变更排课权限
                    }
                }

                if (props.page == "mySchedule") {
                    $scope.operateClass = true; //操作课务
                } else {
                    $scope.operateClass = checkAuthMenuById("79");
                }
                $scope.getNeedTime = getNeedTime; //处理获取时间
                $scope.changePopNav = changePopNav; //切换tab
                $scope.popNavSelected = $scope.props.tab;
                $scope.add_showInfo = add_showInfo; //课堂展示添加图片、音频、视频
                $scope.delete_showInfo = delete_showInfo; //删除已选择的图片、音频、视频
                $scope.open_Info = open_Info; //查看已添加的图片/音频/视频
                $scope.goto_rollCall = goto_rollCall; //点名 或编辑点名
                $scope.openPhotos = openPhotos; //照片查看器
                $scope.ngMouseenter = ngMouseenter;
                $scope.ngMouseleave = ngMouseleave;
                $scope.showErrorMsg = showErrorMsgFun;
                $scope.hideErrorMsg = hideErrorMsgFun;
                $scope.gotoViewStudent = gotoViewStudent; //跳转学员
                $scope.goPoints = goPoints; //积分列表
                $scope.selSingle_lf = selSingle_lf;
                $scope.checkboxAll = checkboxAll;
                $scope.goFastComment = goFastComment;
                $scope.caclBirthToAge = caclBirthToAge; //计算年龄
                if ($scope.props.tab) {
                    changePopNav($scope.props.tab);
                }

            }

            function getConfig() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.config = data.context.config;
                            $scope.jifen = CONFIG_INTEGRAL_CONTROL & ($scope.config);
                        }
                    }
                })
            }

            function checkboxAll(m, list) {
                if (m) {
                    angular.forEach(list, function(v) {
                        v.hasChecked = true;
                    });
                } else {
                    angular.forEach(list, function(v) {
                        v.hasChecked = false;
                    });
                }
            }

            function selSingle_lf(data, list, e) {
                if (e.target.nodeName == "SPAN") return;
                data.hasChecked = !data.hasChecked;
            }

            function gotoViewStudent(x) {
                if (checkAuthMenuById("29")) {
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', { 'page': 1, 'item': x, 'tab': 1 });
                } else {
                    layer.msg("您暂无访问权限。请联系管理员为您添加浏览学员权限。");
                }
            }

            function ngMouseenter($event, list) {
                var e = $($event.currentTarget),
                    offtot = e.offset().top,
                    offleft = e.offset().left,
                    width = e.width(),
                    initleft = $('#affair_pop').offset().left;

                e.next('.enrollmouse').css({
                    'top': offtot - 20,
                    'left': offleft - initleft - 60,
                    'display': 'block'
                });
            }

            function ngMouseleave($event) {
                var e = $($event.currentTarget);
                e.next('.enrollmouse').hide();
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
            $scope.$on("changeClassAffair", function() { //点名回调
                props.item.arrangingCoursesStatus = 1;
                $scope.props.item.arrangingCoursesStatus = 1;
                props.item.status = 1;
                $scope.props.item.status = 1;
                $scope.inClassStuObj.getData();
                getClassAffairInfo();
                ROLLCALLRECORD();
            });

            //在课学员-约课学员列表选择确定返回的学员参数
            $scope.$on('classAffair_aboutClass', function(o, _da) {
                    $scope.inClassStuObj.operate(11, 'aboutClass', _da);
                })
                //在课学员-约课学员列表选择确定返回的学员参数
            $scope.$on('classAffair_listen', function(o, _da) {
                    $scope.inClassStuObj.operate(11, 'listen', _da);
                })
                //在课学员点名tab数据
            $scope.inClassStuObj = {
                getData: function(sp) {
                    //                  if(sp == 'first') {
                    $scope.rollCallInfos = {
                        rollcallStudent_1: [], //本班学员
                        rollcallStudent_2: [], //临时学员
                        rollcallStudent_3: [], //补课学员
                        rollcallStudent_4: [], //试听学员
                        rollcallStudent_5: [], //约课学员
                        ks: {
                            studentName: '姓名、昵称、手机号',
                        },
                        bk: {
                            studentName: '姓名、昵称',
                        },
                        kn: 'studentName', //select初始值
                        st: null, //搜索类型
                        sn: null, //搜索值
                        course_type: undefined, //临时学员标准、通用课筛选
                        class: '', //补课学员列表班级筛选
                        time: '', //补课学员列表时间筛选
                        year: undefined,
                        term: undefined,
                        screenClass: [],
                        screen_years: getFrom2017(true,8),
                        screen_term: []
                    };
                    //                  }
                    //获取在课学员列表
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/getRollCallStudents",
                        type: "get",
                        data: { arrangingCoursesId: props.item.arrangingCoursesId },
                        success: function(data) {
                            if (data.status == 200) {
                                var arr_ = [
                                    [],
                                    [],
                                    [],
                                    [],
                                    []
                                ];
                                angular.forEach(data.context, function(val) {
                                    val['arrangingCourses'] = [];
                                    if (val['arrangingCoursesList']) {
                                        val['arrangingCourses'] = val['arrangingCoursesList'];
                                    }
                                    switch (val.studentType) {
                                        case '0':
                                            arr_[0].push(val);
                                            break;
                                        case '1':
                                            arr_[1].push(val);
                                            break;
                                        case '2':
                                            arr_[2].push(val);
                                            break;
                                        case '3':
                                            arr_[3].push(val);
                                            break;
                                        case '4':
                                            arr_[4].push(val);
                                            break;
                                    }
                                })
                                $scope.rollCallInfos['rollcallStudent_1'] = arr_[0];
                                $scope.rollCallInfos['rollcallStudent_4'] = arr_[1];
                                $scope.rollCallInfos['rollcallStudent_3'] = arr_[2];
                                $scope.rollCallInfos['rollcallStudent_2'] = arr_[3];
                                $scope.rollCallInfos['rollcallStudent_5'] = arr_[4];
                                console.log('在课学员列表', $scope.rollCallInfos);
                            }
                        }
                    });
                },
                operateScreen: function(type, _da) {
                    console.log(type, _da);
                    switch (type) {
                        case 1: //临时学员搜索
                            $scope.rollCallInfos['st'] = _da.type;
                            $scope.rollCallInfos['sn'] = _da.value;
                            $scope.inClassStuObj.getTemporaryStu();
                            break;
                        case 2: //补课学员搜索
                            $scope.rollCallInfos['st'] = _da.type;
                            $scope.rollCallInfos['sn'] = _da.value;
                            $scope.inClassStuObj.getMakeUpStu();
                            break;
                        case 3: //补课学员班级筛选
                            $scope.rollCallInfos.class = _da ? _da : undefined;
                            $scope.inClassStuObj.getMakeUpStu();
                            break;
                        case 4: //补课学员列表重置
                            $scope.screen_goReset['makeup_stu_inclass'](); //筛选重置
                            $scope.screen_goReset['学年']();
                            $scope.screen_goReset['学期']();
                            $scope.kindSearchOnreset(); //条件搜索重置
                            $scope.rollCallInfos['st'] = '';
                            $scope.rollCallInfos['sn'] = '';
                            $scope.rollCallInfos.class = '';
                            $scope.rollCallInfos.year = undefined;
                            $scope.rollCallInfos.term = undefined;
                            $scope.rollCallInfos.time = '';
                            $scope.inClassStuObj.getMakeUpStu();
                            break;
                        case 5: //临时学员列表重置
                            $scope.kindSearchOnreset_["temporary"]();
                            $scope.rollCallInfos['st'] = '';
                            $scope.rollCallInfos['sn'] = '';
                            $scope.rollCallInfos.course_type = undefined;
                            $scope.inClassStuObj.getTemporaryStu();
                            break;
                        case 6: //补课学员学年
                            $scope.rollCallInfos.year = _da ? _da.year : undefined;
                            $scope.inClassStuObj.getMakeUpStu();
                            break;
                        case 7: //补课学员学期
                            $scope.rollCallInfos.term = _da ? _da.schoolTermId : undefined;
                            $scope.inClassStuObj.getMakeUpStu();
                            break;
                    }
                },
                changeCourseType: function(e, val) { //临时学员标准课--通用课筛选
                    $scope.rollCallInfos.course_type = e.target.checked ? val : undefined;
                    $scope.inClassStuObj.getTemporaryStu();
                },
                operate: function(type, _da, sp) {
                    console.log(type, _da);
                    switch (type) {
                        case 1: //添加临时学员
                            $scope.checkboxAll = false;
                            $scope.goPopup('temporary_stu_inclass', '860px');
                            $scope.rollCallInfos['st'] = undefined;
                            $scope.rollCallInfos['sn'] = undefined;
                            $scope.rollCallInfos.course_type = undefined;
                            $scope.kindSearchOnreset_["temporary"]();
                            $scope.inClassStuObj.getTemporaryStu();
                            break;
                        case 2: //添加补课学员
                            $scope.checkboxAll = false;
                            $scope.goPopup('makeup_stu_inclass', '860px');
                            $scope.rollCallInfos['st'] = undefined;
                            $scope.rollCallInfos['sn'] = undefined;
                            $scope.rollCallInfos['year'] = undefined;
                            $scope.rollCallInfos['term'] = undefined;
                            $scope.rollCallInfos['class'] = undefined;
                            $scope.screen_goReset['makeup_stu_inclass']();
                            $scope.screen_goReset['学年']();
                            $scope.screen_goReset['学期']();
                            $scope.kindSearchOnreset_["makeup"]();
                            $scope.inClassStuObj.getMakeUpStu();
                            $scope.inClassStuObj.getScreenClass();
                            $scope.inClassStuObj.getScreenTerm();
                            laydate.render({
                                elem: '#makeup_stu_inclass_time', //指定元素
                                type: 'datetime',
                                range: '到',
                                isRange: true,
                                format: 'yyyy-M-dd',
                                done: function(value) {
                                    $scope.rollCallInfos.time = value;
                                    $scope.inClassStuObj.getMakeUpStu();
                                }
                            });
                            break;
                        case 3: //添加约课学员
                            //                          props.item.classInfo['schoolTerm'] = {'schoolYear': props.item.classInfo.schoolYear,'schoolTermId': props.item.classInfo.schoolTermId};
                            window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_2', '760px', {
                                name: 'appoint',
                                type: 'student2',
                                item: props.item.classInfo,
                                courseId: props.item.courseId,
                                excludeClassId: props.item.classId,
                                choseType: 'checkbox',
                                callBackName: 'classAffair_aboutClass',
                                schoolTerm: {
                                    'schoolYear': props.item.classInfo.schoolYear,
                                    'schoolTermId': props.item.classInfo.schoolTermId
                                }
                            });
                            break;
                        case 4: //本班学员休课
                            detailMsk(sp == 1 ? '休课后该学员在当前班级中不可操作点名功能' : '确认取消休课', function() {
                                $.hello({
                                    url: CONFIG.URL + "/api/oa/class/updateClassContractR",
                                    type: "post",
                                    data: JSON.stringify({
                                        "contractId": _da.contractId,
                                        "studentId": _da.id,
                                        "classId": props.item.classId,
                                        "type": 0,
                                        "lockStatus": sp,
                                    }),
                                    success: function(res) {
                                        if (res.status == 200) {
                                            layer.msg('修改成功');
                                            $scope.inClassStuObj.getData();
                                        }
                                    }
                                });
                            })
                            break;
                        case 6: //删除临时、补课、预约学员
                            var tit_ = _da == 'temporary' ? '是否删除该临时学员' : (_da == 'makeup' ? '是否取消该补课记录' : '是否取消该预约');
                            detailMsk(tit_, function() {
                                $.hello({
                                    url: CONFIG.URL + "/api/oa/lesson/deleteTemporyStudent",
                                    type: "post",
                                    data: JSON.stringify({
                                        "temporaryStudentType": _da == 'temporary' ? 3 : (_da == 'makeup' ? 2 : 4),
                                        "arrangingCoursesId": props.item.arrangingCoursesId,
                                        "addTemporaryStudentList": [{
                                            "studentId": sp.id,
                                            "contractId": sp.contractId,
                                            "potentialCustomerId": sp.potentialCustomerId,
                                        }],
                                    }),
                                    success: function(res) {
                                        if (res.status == 200) {
                                            layer.msg('修改成功');
                                            $scope.inClassStuObj.getData();
                                        }
                                    }
                                });
                            })
                            break;
                        case 9: //全选学员
                            var d1_ = null;
                            switch (sp) {
                                case 'temporary': //临时学员
                                    d1_ = $scope.rollCallInfos['temporaryList'];
                                    break;
                                case 'makeup': //补课学员
                                    d1_ = $scope.rollCallInfos['makeupList'];
                                    break;
                                case 'aboutClass': //约课学员
                                    d1_ = $scope.rollCallInfos['aboutClassList'];
                                    break;
                            }
                            angular.forEach(d1_, function(v1) {
                                v1.hasChecked = _da.target.checked;
                            })
                            break;
                        case 10: //选择单个学员
                            _da.hasChecked = _da.hasChecked ? false : true;
                            break;
                        case 11: //确定选择学员
                            var params = [];
                            switch (_da) {
                                case 'temporary': //临时学员
                                    d1_ = $scope.rollCallInfos['temporaryList'];
                                    break;
                                case 'makeup': //补课学员
                                    d1_ = $scope.rollCallInfos['makeupList'];
                                    break;
                                case 'aboutClass': //约课学员
                                    d1_ = sp;
                                    break;
                                case 'listen': //约课学员
                                    d1_ = sp;
                                    break;
                            }
                            angular.forEach(d1_, function(v1) {
                                if (v1.hasChecked) {
                                    var obj;
                                    switch (_da) {
                                        case 'temporary': //临时学员
                                            obj = {
                                                "studentId": v1.id,
                                                "contractId": v1.contractId,
                                                "potentialCustomerId": v1.potentialCustomerId,
                                            };
                                            break;
                                        case 'makeup': //补课学员-如果是补课，则需要额外传补课id
                                            var jud = true; //判断是否选择了同一个学员补不同的课
                                            obj = {
                                                "studentId": v1.student.id,
                                                "contractId": v1.contract.contractId,
                                                "potentialCustomerId": v1.contract.potentialCustomerId,
                                            };
                                            angular.forEach(params, function(v2) {
                                                    if (v1.student.id == v2.studentId) { //如果本次循环补课学员存在
                                                        jud = false; //修改判断
                                                        obj = null; //obj置为null-params不push一次，而是把这一次push到存在的学员补课studentCourseTimeInfos里面去
                                                        v2['studentCourseTimeInfos'].push({ 'arrangingCoursesId': v1.arrangingCourses.arrangingCoursesId })
                                                    }
                                                })
                                                //如果jud为true则本条数据学员未重复，那么push到obj里面去，添加到params
                                            if (jud) obj['studentCourseTimeInfos'] = [{ 'arrangingCoursesId': v1.arrangingCourses.arrangingCoursesId }];
                                            break;
                                        case 'aboutClass': //约课学员
                                            obj = {
                                                "studentId": v1.potentialCustomer.id,
                                                "contractId": v1.contract.contractId,
                                                "potentialCustomerId": v1.potentialCustomer.potentialCustomerId,
                                            };
                                            break;
                                        case 'listen': //试听学员
                                            obj = {
                                                "studentId": v1.potentialCustomer.id,
                                                "potentialCustomerId": v1.potentialCustomer.potentialCustomerId,
                                                "auditionRecordId": v1.auditionRecordId
                                            };
                                            break;
                                    }
                                    if (obj) params.push(obj);
                                }
                            })
                            if (_da == "temporary" && isRepeat(params, "studentId")) {
                                return layer.msg("学员课程选择重复！学员在一节课中只能选择一门课程进行消课，请重新选择");
                            }
                            var datas = {
                                "temporaryStudentType": _da == 'temporary' ? 3 : (_da == 'makeup' ? 2 : (_da == 'listen' ? 1 : 4)),
                                "arrangingCoursesId": props.item.arrangingCoursesId,
                                "addTemporaryStudentList": params,
                            };
                            if (params.length <= 0) {
                                return layer.msg("请选择学员！");
                            }
                            console.log(params);
                            $.hello({
                                url: CONFIG.URL + "/api/oa/lesson/addTemporyStudent",
                                type: "post",
                                data: JSON.stringify(datas),
                                success: function(res) {
                                    if (res.status == 200) {
                                        layer.msg('添加成功');
                                        $scope.inClassStuObj.getData();
                                        if (_da != 'aboutClass' && _da != 'listen') $scope.closePopup();
                                    }
                                }
                            });
                            break;
                        case 12: //点击添加试听学员
                            window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'listen_stu', '860px', {
                                name: 'listen',
                                type: 'listen_student',
                                courseId: props.item.courseId,
                                choseType: 'checkbox',
                                callBackName: 'classAffair_listen'
                            });
                            break;
                    }
                },
                getTemporaryStu: function() {
                    var list = $scope.rollCallInfos.rollcallStudent_1.concat($scope.rollCallInfos.rollcallStudent_2).concat($scope.rollCallInfos.rollcallStudent_3).concat($scope.rollCallInfos.rollcallStudent_4).concat($scope.rollCallInfos.rollcallStudent_5);
                    var data = {
                        arrangingCoursesId: props.item.arrangingCoursesId,
                        searchType: $scope.rollCallInfos['sn'] ? 'appSearchName' : undefined,
                        searchName: $scope.rollCallInfos['sn'] ? $scope.rollCallInfos['sn'] : undefined,
                        courseType: $scope.rollCallInfos.course_type,
                        courseId: props.item.courseId,
                        pcIdList: arrToStr(list, "potentialCustomerId")
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/getTemporaryStudents",
                        type: "get",
                        data: data,
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.rollCallInfos['temporaryList'] = res.context;
                                //                              handleList($scope.rollCallInfos['temporaryList'], $scope.rollCallInfos.rollcallStudent_2, 'temporary');
                            }
                        }
                    });
                },
                getMakeUpStu: function() {
                    var list = $scope.rollCallInfos.rollcallStudent_1.concat($scope.rollCallInfos.rollcallStudent_2).concat($scope.rollCallInfos.rollcallStudent_3).concat($scope.rollCallInfos.rollcallStudent_4).concat($scope.rollCallInfos.rollcallStudent_5);
                    var data = {
                        arrangingCoursesId: props.item.arrangingCoursesId,
                        searchType: $scope.rollCallInfos['sn'] ? 'appSearchName' : undefined,
                        searchName: $scope.rollCallInfos['sn'] ? $scope.rollCallInfos['sn'] : undefined,
                        courseId: props.item.courseId,
                        classId: $scope.rollCallInfos.class ? $scope.rollCallInfos.class.classId : undefined,
                        schoolYear: $scope.rollCallInfos.year ? $scope.rollCallInfos.year : undefined,
                        schoolTermId: $scope.rollCallInfos.term ? $scope.rollCallInfos.term : undefined,
                        pcIdList: arrToStr(list, "potentialCustomerId")
                    }

                    if ($scope.rollCallInfos.time) {
                        data.beginDate = $scope.rollCallInfos.time.split("到")[0] + " 00:00:00";
                        data.endDate = $scope.rollCallInfos.time.split("到")[1] + " 23:59:59";
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/getBuKeStudentByArrangingCoursesId",
                        type: "get",
                        data: data,
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.rollCallInfos['makeupList'] = res.context;
                                //                              handleList($scope.rollCallInfos['makeupList'], $scope.rollCallInfos.rollcallStudent_3, 'makeup');
                            }
                        }
                    });
                },
                getScreenClass: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/list",
                        type: "get",
                        data: {
                            'courseId': props.item.courseId,
                            'pageType': 0,
                            'schoolYear': props.item.classInfo.schoolYear ? props.item.classInfo.schoolYear : undefined,
                            'schoolTermId': props.item.classInfo.schoolTermId ? props.item.classInfo.schoolTermId : undefined,
                            'classType': 0,
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.rollCallInfos.screenClass = res.context;
                            }
                        }
                    });
                },
                getScreenTerm: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                        type: "get",
                        data: { pageType: 0 },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.rollCallInfos.screen_term = data.context;
                            }

                        }
                    })
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
                            console.log(props);
                            list_1.unshift({
                                student: { id: val.id, name: val.name, nickname: val.nickname },
                                course: props.item ? props.item.course : undefined,
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

            function getClassAffairInfo() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/CourseAffairsMgt/info",
                    type: "get",
                    data: {
                        arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.classAffairInfo = data.context;
                            $scope.classAffairInfo["callBackName"] = "课务点名";
                            $scope.popNav = [{
                                name: '课次详情',
                                tab: 1
                            }];
                            if (data.context.status == 1) {

                                if (data.context.displayStatus != 1) {
                                    if (data.context.course.displayStatus == 1) {
                                        $scope.popNav.push({
                                            name: '课堂展示',
                                            tab: 3
                                        });
                                    }
                                } else {
                                    $scope.popNav.push({
                                        name: '课堂展示',
                                        tab: 3
                                    });
                                }

                                if (data.context.reviewStatus != 1) {
                                    if (data.context.course.reviewStatus == 1) {
                                        $scope.popNav.push({
                                            name: '课堂点评',
                                            tab: 4
                                        });
                                    }
                                } else {
                                    $scope.popNav.push({
                                        name: '课堂点评',
                                        tab: 4
                                    });
                                }
                                if (data.context.teacherTaskTypeNew != 1) {
                                    if (data.context.course.taskStatus == 1) {
                                        $scope.popNav.push({
                                            name: '课后作业',
                                            tab: 5
                                        }, {
                                            name: '作业收交',
                                            tab: 6
                                        });
                                    }
                                } else {
                                    $scope.popNav.push({
                                        name: '课后作业',
                                        tab: 5
                                    }, {
                                        name: '作业收交',
                                        tab: 6
                                    });
                                }
                                if (data.context.annexStatus != 1) {
                                    if (data.context.course.annexStatus == 1) {
                                        $scope.popNav.push({
                                            name: '课堂附件',
                                            tab: 7
                                        });
                                    }
                                } else {
                                    $scope.popNav.push({
                                        name: '课堂附件',
                                        tab: 7
                                    });
                                }
                            }
                        };
                    }
                })
            }

            function setInit() {
                if (props.tab) {
                    $scope.setNavSelected = props.tab;
                }
                getShowCourse();
                $scope.del_selClass = del_selClass; //删除已选展示课程
                $scope.confirm_show = confirm_show; //确认已选展示课程
                SERVICE.COURSEANDCLASS.COURSE['展示课程'] = function(data) {
                        angular.forEach(data, function(val) {
                            var judge = true;
                            angular.forEach($scope.showData, function(val_) {
                                if (val.courseId == val_.courseId) {
                                    judge = false;
                                }
                            })
                            if (judge) {
                                $scope.showData.push(val);
                            }
                        })
                    }
                    //              $scope.$on('展示课程', function(evt, data) {
                    //                  angular.forEach(data, function(val) {
                    //                      var judge = true;
                    //                      angular.forEach($scope.showData, function(val_) {
                    //                          if (val.courseId == val_.courseId) {
                    //                              judge = false;
                    //                          }
                    //                      })
                    //                      if (judge) {
                    //                          $scope.showData.push(val);
                    //                      }
                    //                  })
                    //              });

                function del_selClass(index, list) {
                    list.splice(index, 1);
                    //                  var isDelect = layer.confirm('是否删除该课程？', {
                    //                      title: "确认删除信息",
                    //                      skin: 'newlayerui layeruiCenter',
                    //                      closeBtn: 1,
                    //                      offset: '30px',
                    //                      move: false,
                    //                      area: '560px',
                    //                      btn: ['是', '否'] //按钮
                    //                  }, function() {
                    //                      list.splice(index, 1);
                    //                      $scope.$apply();
                    //                      layer.close(isDelect);
                    //                  }, function() {
                    //                      layer.close(isDelect);
                    //                  })
                }

                function confirm_show() {

                    var param = {
                        courseList: getCourseId($scope.showData)
                    };
                    switch (props.tab) {
                        case 1:
                            param["course"] = {
                                displayStatus: 1
                            };
                            break;
                        case 2:
                            param["course"] = {
                                reviewStatus: 1
                            };
                            break;
                        case 3:
                            param["course"] = {
                                taskStatus: 1
                            };
                            break;
                        default:
                            break;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/updateCourseList",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.$emit('clsAffair_' + $scope.props.page, 'true');
                                $scope.closePopup('classAffair_set');
                            }
                        }
                    })
                }

                function getCourseId(list) {
                    var arr = [];
                    angular.forEach(list, function(v) {
                        arr.push({
                            courseId: v.courseId
                        });
                    });
                    return arr;
                }

                function getShowCourse() {
                    var param = {
                        "pageType": "0",
                        "goodsStatus": "1",
                    }
                    switch (props.tab) {
                        case 1:
                            param["displayStatus"] = 1;
                            break;
                        case 2:
                            param["reviewStatus"] = 1;
                            break;
                        case 3:
                            param["taskStatus"] = 1;
                            break;
                        default:
                            break;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/getCoursesList",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.showData = data.context;
                            }
                        }
                    })
                }
            }

            function changePopNav(val) {
                $scope.popNavSelected = val;
                switch (val) {
                    case 1:
                        BASEINFOFUNCTION();
                        break;
                    case 2:
                        ROLLCALLRECORD();
                        break;
                    case 3:
                        CLASSSHOW();
                        break;
                    case 4:
                        CLASSCOMMENT();
                        break;
                    case 5:
                        CLASSHOUSEWK();
                        break;
                    case 6:
                        HOUSEWKSHOUJIAO();
                        break;
                    case 7:
                        CLASSANNEX();
                        break;
                    case 8: //在课学员tab
                        $scope.inClassStuObj.getData('first');
                        break;
                    default:
                        break;
                }
            }

            //          function changeSetNav(val) {
            //              $scope.setNavSelected = val;
            //              switch (val) {
            //                  case 1:
            //                      SHOWSET();
            //                      break;
            //                  case 2:
            //                      COMMENTSET();
            //                      break;
            //                  case 3:
            //                      HOMEWKSET();
            //                      break;
            //                  default:
            //                      break;
            //              }
            //          }

            function goto_rollCall(d) {
                console.log(d.arrangingCoursesId);
                var dataRoll = angular.copy(d);
                dataRoll["fromPage"] = "classAffair";
                dataRoll["page"] = props.page;
                dataRoll['arrangingCourses'] = {};
                dataRoll['classRoom'] = {};
                dataRoll['arrangingCourses']['arrangingCoursesId'] = d.arrangingCoursesId;
                dataRoll['arrangingCourses']['beginDate'] = d.arrangingCoursesBeginDate;
                dataRoll['arrangingCourses']['endDate'] = d.arrangingCoursesEndDate;
                dataRoll['classRoom']['classroomId'] = d.classroomId;
                dataRoll['classRoom']['classRoomName'] = d.classRoomName;
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/getRollCallStudents",
                    type: "get",
                    data: {
                        arrangingCoursesId: d.arrangingCoursesId
                    },
                    success: function(data) {
                        if (data.status == 200) {
                            dataRoll.rollcallStudent_1 = []; //本班
                            dataRoll.rollcallStudent_2 = []; //临时
                            dataRoll.rollcallStudent_3 = []; //补课
                            dataRoll.rollcallStudent_4 = []; //试听
                            angular.forEach(data.context, function(val) {
                                switch (val.studentType) {
                                    case '0':
                                        dataRoll.rollcallStudent_1.push(val);
                                        break;
                                    case '1':
                                        dataRoll.rollcallStudent_4.push(val);
                                        break;
                                    case '2':
                                        dataRoll.rollcallStudent_3.push(val);
                                        break;
                                    case '3':
                                        dataRoll.rollcallStudent_2.push(val);
                                        break;
                                }
                            })
                        }
                    }
                });
                window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', dataRoll);
            }
            //基本信息
            function BASEINFOFUNCTION() {
                //              init1();
                //
                //              function init1() {
                //
                $scope.clsAffair_delete = clsAffair_delete; //未点名删除
                $scope.deleteRollcall = deleteRollcall; //已点名删除
                $scope.goChangePaike = goChangePaike;
                if ($scope.props.item.status == 1) {
                    ROLLCALLRECORD();
                } else {
                    $scope.inClassStuObj.getData();
                }
                //              }
                console.log("基本信息。。。");

                function goChangePaike() {
                    if ($scope.props.page == "schedule") {
                        window.$rootScope.yznOpenPopUp($scope, "arange-pop", "arange_pop", "760px", {
                            "pop": "paike",
                            "name": "classAffair",
                            "fromPage": "schedule",
                            "isSingle": "0",
                            "title": "排课变更",
                            "isChangePaike": true,
                            item: $scope.classAffairInfo
                        });
                    }
                }

                function clsAffair_delete() {
                    var isConfirm = layer.confirm('若删除课次中含有试听学员、临时学员、补课学员、约课学员时，系统将自动取消其上课安排；是否删除本次排课，删除后无法还原，确认删除？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        resize: false,
                        move: false,
                        area: '560px',
                        btn: ['确认删除', '取消'] //按钮
                    }, function() {
                        var p = {
                            "arrangingCourses": [{
                                "arrangingCoursesId": $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                            }]
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/lesson/deleteArrangingCoursesInfo",
                            type: "post",
                            data: JSON.stringify(p),
                            success: function(data) {
                                if (data.status == "200") {
                                    layer.msg('已成功删除排课', {
                                        icon: 1
                                    });
                                    $scope.$emit('clsAffair_' + $scope.props.page, 'true');
                                    $scope.closePopup('affair_pop');
                                }
                            }
                        })
                    }, function() {
                        layer.close(isConfirm);
                    })
                }

            }

            function deleteRollcall(x) {
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
                        data: JSON.stringify({ "arrangingCoursesId": $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined, 'deleteStatus': 1 }),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功删除', {
                                    icon: 1
                                });
                                if ($scope.props.page == "schedule") {
                                    $scope.$emit('scheduleChange', 'true');
                                } else {
                                    $scope.$emit('clsAffair_' + $scope.props.page, 'true');
                                }
                                $scope.closePopup('affair_pop');
                            };
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })
            }
            //点名记录
            function ROLLCALLRECORD() {
                var class_pagerRender = false,
                    class_start = 0,
                    class_eachPage = localStorage.getItem('classAffair') ? localStorage.getItem('classAffair') : 20; //页码初始化
                $scope.sel_inclass = $scope.sel_leave = $scope.sel_absent = false;
                $scope.studentStatus = undefined;
                init2();

                function init2() {
                    getRollCalllist(0);
                    //                  $scope.inclass = inclass; //到课
                    //                  $scope.inleave = inleave; //请假
                    //                  $scope.inabsent = inabsent; //缺席
                    $scope.changeStatus = changeStatus;

                }
                console.log("点名记录。。。");


                function changeStatus(e, t) {
                    $scope.studentStatus = e.target.checked ? t : undefined;
                    $scope.roll_scheduleList = getList($scope.studentStatus);
                }
                //              function inclass() {
                //                  if ($scope.sel_inclass) {
                //                      $scope.sel_leave = $scope.sel_absent = false;
                //                      $scope.roll_scheduleList = getList("到课");
                //                  }else{
                //                      $scope.roll_scheduleList = getList();
                //                  }
                //              }
                //
                //              function inleave() {
                //                  if ($scope.sel_leave) {
                //                      $scope.sel_inclass = $scope.sel_absent = false;
                //                      $scope.roll_scheduleList = getList("请假");
                //                  }else{
                //                      $scope.roll_scheduleList = getList();
                //                  }
                //              }
                //
                //              function inabsent() {
                //                  if ($scope.sel_absent) {
                //                      $scope.sel_inclass = $scope.sel_leave = false;
                //                      $scope.roll_scheduleList = getList("缺席");
                //                  }else{
                //                      $scope.roll_scheduleList = getList();
                //                  }
                //              }
                if (!$scope.getRollCallStudentsLiser) {
                    $scope.getRollCallStudentsLiser = $scope.$on('roll_scheduleListChange', function(event, data) {
                        class_pagerRender = false;
                        getRollCalllist(0);
                    });
                }
                SERVICE.CLASSAFFAIR.ROLLCALL['课务点名'] = function() {
                    class_pagerRender = false;
                    getRollCalllist(0);
                }

                function getList(type) {
                    var list = angular.copy($scope.roll_scheduleList_old);
                    var arr = [];
                    switch (type) {
                        case "1":
                            angular.forEach(list, function(v) {
                                if (v.studentStatus == 1) {
                                    arr.push(v);
                                }
                            });
                            break;
                        case "0":
                            angular.forEach(list, function(v) {
                                if (v.studentStatus == 0) {
                                    arr.push(v);
                                }
                            });
                            break;
                        case "2":
                            angular.forEach(list, function(v) {
                                if (v.studentStatus == 2) {
                                    arr.push(v);
                                }
                            });
                            break;
                        case undefined:
                            arr = list;
                            break;
                        default:
                            break;
                    }
                    console.log(arr);
                    return arr;
                }

                function getRollCalllist(start) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/getRollCallStudents",
                        type: "get",
                        data: {
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                        },
                        success: function(data) {
                            if (data.status == 200) {
                                $scope.roll_scheduleList = data.context;
                                $scope.roll_scheduleList_old = angular.copy(data.context);
                            }
                        }
                    });
                }

                function affairPager(total) {
                    if (class_pagerRender) {
                        return;
                    } else {
                        class_pagerRender = true;
                    }

                    var $M_box3 = $('.classAffair');
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
                                localStorage.setItem('classAffair', class_eachPage);
                            }
                            class_start = (api.getCurrent() - 1) * class_eachPage; // 分页从0开始
                            getRollCalllist(class_start); //回调
                        }
                    });
                }
            }
            //课堂展示
            function CLASSSHOW() {
                init3();

                function init3() {
                    $scope.showIsEmpty = false;
                    getShow(); //获取课堂展示详情
                    $scope.popclassShow = popclassShow;
                    $scope.confirm_classShow = confirm_classShow; //添加或编辑展示确认按钮
                    $scope.changeStatus = changeStatus; //没有展示按钮
                    $scope.deleteShow = deleteShow; //删除展示
                }
                console.log("课堂展示。。。");

                function getShow() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/getCourseDisplayDetail",
                        type: "get",
                        data: {
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.showIsNull = false;
                                $scope.show_picListOld = angular.copy(data.context.courseDisplayUrlList);
                                data.context.courseDisplayUrlList = setUrlist(data.context.courseDisplayUrlList);
                                $scope.clasShowInfo = data.context;
                            } else if (data.status == '205') {
                                $scope.clasShowInfo = data.context;
                                $scope.showIsNull = true;
                                return true;
                            }
                        }
                    })
                }

                function popclassShow(type) {
                    $scope.showDetail = {
                        courseDisplayDesc: "",
                        courseDisplayUrlList: []
                    };
                    if (type == 'add') {
                        $scope.showTitle = '添加展示';
                        $scope.showDetail = {
                            courseDisplayDesc: "",
                            courseDisplayUrlList: []
                        };
                    } else {
                        $scope.showTitle = '编辑展示';
                        $scope.showDetail = angular.copy($scope.clasShowInfo);
                    }
                    $scope.goPopup('show_pop', '660px');
                }
                if (!$scope.onShowDatabase) {
                    $scope.onShowDatabase = $scope.$on('展示-资料库', function(e, data) {
                        angular.forEach(data, function(v) {
                            switch (v.type) {
                                case 'image':
                                    v.imageUrl = v.url;
                                    break;
                                case 'audio':
                                    v.audioUrl = v.url;
                                    v.audioUrl_ = $sce.trustAsResourceUrl(v.url);
                                    break;
                                case 'video':
                                    v.videoUrl = v.url;
                                    v.videoUrl_ = v.url_;
                                    break;
                                default:
                                    break;
                            }
                        });
                        $scope.showDetail.courseDisplayUrlList = $scope.showDetail.courseDisplayUrlList.concat(data);
                    });
                }

                function confirm_classShow() {
                    if (!$scope.showDetail.courseDisplayDesc && $scope.showDetail.courseDisplayUrlList.length <= 0) {
                        return layer.msg("展示内容和多媒体内容2选1必填");
                    }
                    var j = [true, ""];
                    var list = $scope.showDetail.courseDisplayUrlList;
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
                        courseDisplayDesc: $scope.showDetail.courseDisplayDesc,
                        courseDisplayUrl: getUrlList($scope.showDetail.courseDisplayUrlList)
                    }
                    if ($scope.showTitle == '添加展示') {
                        param["arrangingCoursesId"] = $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined;
                        URL = "/api/oa/CourseAffairsMgt/addCourseDisplay";
                        console.log("确认添加");
                    } else {
                        console.log("确认编辑");
                        param["courseDisplayId"] = $scope.showDetail.courseDisplayId;
                        URL = "/api/oa/CourseAffairsMgt/modifyCourseDisplay";
                    }
                    console.log(param);
                    $.hello({
                        url: CONFIG.URL + URL,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                getShow();
                                $scope.closePopup('show_pop');
                            }
                        }
                    })
                }

                function changeStatus() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/CourseAffairsMgt/updateDisplayStatus',
                        type: "post",
                        data: JSON.stringify({
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                            displayStatus: '0'
                        }),
                        success: function(data) {
                            if (data.status == '200') {
                                getShow();
                            }
                        }
                    })
                }

                function deleteShow() {
                    detailMsk('删除后不可恢复，是否删除课堂展示？', function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/CourseAffairsMgt/deleteCourseDisplay',
                            type: "post",
                            data: JSON.stringify({
                                arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                            }),
                            success: function(data) {
                                if (data.status == '200') {
                                    getShow();
                                }
                            }
                        })
                    });
                }

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
            //课堂点评
            function CLASSCOMMENT() {
                $scope.fromPop = "class";
                var s_searchName = undefined;
                init4();

                function init4() {
                    $scope.commentStatus = undefined;
                    $scope.s_kindSearchData = {
                        commentName: '学员姓名、昵称'
                    };
                    $scope.commentTitle = "学员点评";
                    $scope.goComment = goComment; //点评
                    $scope.sendComment = sendComment; //追评
                    $scope.showContentFun = showContentFun; //打开或关闭评论
                    $scope.deleteComtInfo = deleteComtInfo; //删除点评
                    $scope.deleteZhui = deleteZhui; //删除追评
                    $scope.s_SearchData = searchData;
                    $scope.s_Enterkeyup = searchData;
                    $scope.changeComment = changeComment;
                    $scope.goBatchComment = goBatchComment; //批量点评
                    getComment();
                }
                if (!$scope.onCommentDatabase) {
                    $scope.onCommentDatabase = $scope.$on('点评-资料库', function(e, data) {
                        angular.forEach(data, function(v) {
                            switch (v.type) {
                                case 'image':
                                    v.imageUrl = v.url;
                                    break;
                                case 'audio':
                                    v.audioUrl = v.url;
                                    v.audioUrl_ = $sce.trustAsResourceUrl(v.url);
                                    break;
                                case 'video':
                                    v.videoUrl = v.url;
                                    v.videoUrl_ = v.url_;
                                    break;
                                default:
                                    break;
                            }
                        });
                        $scope.commentData.reviewUrlList = $scope.commentData.reviewUrlList.concat(data);
                    });
                }

                function changeComment(e, v) {
                    $scope.commentStatus = e.target.checked ? v : undefined;
                    getComment();
                }

                function searchData(n) {
                    s_searchName = n.value;
                    getComment();
                }
                if (!$scope.getCommentLiser) {
                    $scope.getCommentLiser = $scope.$on('reloadStudentlist', function() {
                        getComment();
                    });
                }

                function getComment() {
                    var param = {
                        searchType: s_searchName ? "appSearchName" : undefined,
                        searchName: s_searchName,
                        arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                        reviewStatus: $scope.commentStatus
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/getStudentListNew",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                var brr = [];
                                angular.forEach(data.context, function(v) {
                                    if (v.reviews && v.reviews.length > 0) {
                                        angular.forEach(v.reviews, function(v_, i) {
                                            v_.reviewUrlListOld = angular.copy(v_.reviewUrlList);
                                            v_.reviewUrlList = setUrlist(v_.reviewUrlList);
                                            setTimeout(function() {
                                                layui.use(['rate'], function() {
                                                    var ins = layui.rate;
                                                    ins.render({
                                                        elem: ".roolcallPage #class_comment" + v_.reviewId, //绑定元素
                                                        value: v_.reviewLevel,
                                                        readonly: true
                                                    });
                                                });
                                            })
                                            if (v_.reviewsRecords) {
                                                angular.forEach(v_.reviewsRecords, function(v__) {
                                                    v__.reviewsRecordUrlListOld = angular.copy(v__.reviewsRecordUrlList);
                                                    v__.reviewsRecordUrlList = setUrlist(v__.reviewsRecordUrlList);
                                                });
                                            }
                                        })
                                    } else {
                                        brr.push(v);
                                    }
                                });
                                $scope.cmt_studentList = data.context;
                                $scope.noneReviews = brr;
                            };
                        }
                    })
                }

                function deleteComtInfo(d) {
                    var param = {
                        reviewId: d.reviewId
                    }
                    if (props.page == "mySchedule") {
                        param["myClasses"] = 1;
                    }
                    detailMsk("删除后不可恢复，是否删除点评内容？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/CourseAffairsMgt/review/delete",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                getComment();
                            }
                        })
                    });
                }

                function deleteZhui(d) {
                    var param = {
                        reviewsRecordId: d.reviewsRecordId
                    }
                    if (props.page == "mySchedule") {
                        param["myClasses"] = 1;
                    }
                    detailMsk("是否删除本条评语？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/CourseAffairsMgt/reviewsRecord/delete",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                getComment();
                            }
                        })
                    });
                }

                function goBatchComment() {
                    angular.forEach($scope.noneReviews, function(v, i) {
                        v.reviewLevel = 3;
                        v.reviewDesc = "";
                        v.pointsValue = undefined;
                        layui.use(['rate'], function() {
                            var ins = layui.rate;
                            ins.render({
                                elem: "#batch_comment_start" + i, //绑定元素
                                value: v.reviewLevel,
                                choose: function(val) {
                                    v.reviewLevel = val;
                                }
                            });
                        });
                    });
                    $scope.goPopup("batch_comment_pop", "860px");
                    if (!$scope.addRemark_toCommenter) {
                        $scope.addRemark_toCommenter = $scope.$on("addRemark_toComment", function(e, data) {
                            if (data.list) {
                                data.list[data.index].reviewDesc = data.str;
                            }
                        });
                    }

                    $scope.confirm_batch_comment = function() {
                        var arr = [];
                        angular.forEach($scope.noneReviews, function(v) {
                            var obj = {
                                reviewLevel: v.reviewLevel,
                                reviewDesc: v.reviewDesc,
                                arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                                studentId: v.potentialCustomer.id,
                                potentialCustomerId: v.potentialCustomer.potentialCustomerId
                            };
                            if ($scope.jifen && $scope.ketangJifen) {
                                obj["pointsValue"] = v.pointsValue;
                            }
                            arr.push(obj);
                        });

                        $.hello({
                            url: CONFIG.URL + "/api/teacher/home/addReviewList",
                            type: "post",
                            data: JSON.stringify(arr),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.$emit("reloadStudentlist");
                                    $scope.closePopup('batch_comment_pop');
                                };
                            }
                        })
                    }
                }
                console.log("课堂点评。。。");
            }

            //课后作业
            function CLASSHOUSEWK() {
                init5();

                function init5() {
                    getHomeWk();
                    $scope.editHomeWk = editHomeWk;
                    $scope.deleteHomeWk = deleteHomeWk; //删除作业
                    $scope.changeHomeWk = changeHomeWk; //没有作业按钮
                    $scope.confirm_homeWk = confirm_homeWk; //布置作业
                    (function() {
                        laydate.render({
                            elem: '#submitDate',
                            type: 'datetime',
                            min: 0,
                            isRange: false,
                            done: function(value) {
                                $scope.homeWkDetail.submitDate = value;
                            }
                        });
                    })();
                }
                console.log("课后作业。。。");

                function getHomeWk() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/taskInfo",
                        type: "get",
                        data: {
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.homeWk_picListOld = angular.copy(data.context.teacherTaskUrlList);
                                data.context.teacherTaskUrlList = setUrlist(data.context.teacherTaskUrlList);
                                $scope.homeWk = data.context;
                                if (data.context.teacherTaskDate) {
                                    $scope.homeWk.leaveTime = timeAgo(data.context.teacherTaskDate, true);
                                }
                            };
                        }
                    })
                }

                function confirm_homeWk() {
                    var URL, param = {};
                    if (!$scope.homeWkDetail.content && $scope.homeWkDetail.showList.length <= 0) {
                        return layer.msg("作业内容和多媒体内容2选1必填");
                    }
                    var j = [true, ""];
                    var list = $scope.homeWkDetail.showList;
                    for (var i = 0, len = list.length; i < len; i++) {
                        if (!list[i].key) {
                            j[0] = false;
                            break;
                        }
                    }
                    if (!j[0]) {
                        return layer.msg("请处理未成功的多媒体！");
                    }
                    param["updateArrangingCourses"] = {
                        teacherTaskUrl: getUrlList($scope.homeWkDetail.showList),
                        teacherTaskDate: $scope.homeWkDetail.submitDate,
                        teacherTaskDesc: $scope.homeWkDetail.content,
                    };
                    param["arrangingCourses"] = [{
                        arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                    }];
                    URL = "/api/oa/CourseAffairsMgt/addTaskList";
                    console.log(param);
                    $.hello({
                        url: CONFIG.URL + URL,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                getHomeWk();
                                $scope.closePopup('show_pop');
                            }
                        }
                    })
                }

                function editHomeWk(type, isedit) {
                    $scope.homeWkType = type;
                    if (type == 'add') {
                        if (isedit) {
                            $scope.homeWkTitle = '编辑作业';
                            $scope.homeWkDetail = {
                                // subStatus: '0',
                                submitDate: $.format.date($scope.homeWk.teacherTaskDate, 'yyyy-MM-dd HH:mm:ss'),
                                content: $scope.homeWk.teacherTaskDesc,
                                showList: angular.copy($scope.homeWk.teacherTaskUrlList),
                            }
                        } else {
                            $scope.homeWkTitle = '布置作业';
                            $scope.homeWkDetail = {
                                // subStatus: '1',
                                submitDate: yznDateAdd(new Date(), 7),
                                showList: [],
                            }
                        }

                    } else {
                        // $scope.homeWkTitle = '变更截止时间';
                        // $scope.homeWkDetail = {
                        //     subStatus: '1',
                        //     showList: []
                        // }
                    }

                    $scope.goPopup('homeWk_pop', '660px');
                }
                if (!$scope.onHomewkDatabase) {
                    $scope.onHomewkDatabase = $scope.$on('布置作业-资料库', function(e, data) {
                        angular.forEach(data, function(v) {
                            switch (v.type) {
                                case 'image':
                                    v.imageUrl = v.url;
                                    break;
                                case 'audio':
                                    v.audioUrl = v.url;
                                    v.audioUrl_ = $sce.trustAsResourceUrl(v.url);
                                    break;
                                case 'video':
                                    v.videoUrl = v.url;
                                    v.videoUrl_ = v.url_;
                                    break;
                                default:
                                    break;
                            }
                        });
                        $scope.homeWkDetail.showList = $scope.homeWkDetail.showList.concat(data);
                    });
                }

                function changeHomeWk() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/CourseAffairsMgt/updateTaskTypeList',
                        type: "post",
                        data: JSON.stringify({
                            updateArrangingCourses: {
                                teacherTaskTypeNew: '0'
                            },
                            arrangingCourses: [{
                                arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                            }]
                        }),
                        success: function(data) {
                            if (data.status == '200') {
                                getHomeWk();
                            }
                        }
                    })
                }

                function deleteHomeWk() {
                    detailMsk('系统将同时删除已提交的学员作业，<br>删除后不可恢复，是否删除作业？', function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/CourseAffairsMgt/deleteTask',
                            type: "post",
                            data: JSON.stringify({
                                arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                            }),
                            success: function(data) {
                                if (data.status == '200') {
                                    getHomeWk();
                                }
                            }
                        })
                    });
                }
            }
            //作业收交
            function HOUSEWKSHOUJIAO() {
                $scope.fromPop = "homeWk";
                var s_searchName = undefined;
                $scope.unsubmit = undefined;

                init6();

                function init6() {
                    $scope.commentStatus = undefined;
                    $scope.s_kindSearchData = {
                        commentName: '学员姓名、昵称'
                    };
                    $scope.commentTitle = "作业点评";
                    $scope.goComment = goComment; //点评
                    $scope.sendComment = sendComment; //追评
                    $scope.showContentFun = showContentFun; //打开或关闭评论
                    $scope.deleteComtInfo = deleteComtInfo; //删除点评
                    $scope.deleteZhui = deleteZhui; //删除追评
                    $scope.s_SearchData = searchData;
                    $scope.s_Enterkeyup = searchData;
                    $scope.changeSubmit = changeSubmit;
                    $scope.changeComment = changeComment;
                    $scope.onceSubWk = onceSubWk; //一键催交
                    getHomeWkList();
                }

                function changeComment(e, v) {
                    $scope.commentStatus = e.target.checked ? v : undefined;
                    getHomeWkList();
                }

                function searchData(n) {
                    s_searchName = n.value;
                    getHomeWkList();
                }

                function changeSubmit(t) {
                    $scope.unsubmit = t;
                    getHomeWkList();
                }
                if (!$scope.getHomeWkListLiser) {
                    $scope.getHomeWkListLiser = $scope.$on("changeHomeWk", function() {
                        getHomeWkList();
                    });
                }

                //              $scope.$watch("unsubmit",function(n,o){
                //                  if(n === o || n == undefined) return;
                //                  getHomeWkList();
                //              });
                function getHomeWkList() {
                    var param = {
                        arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                        reviewStatus: $scope.commentStatus,
                        commitStatus: $scope.unsubmit ? "0" : undefined,
                        searchType: s_searchName ? "appSearchName" : undefined,
                        searchName: s_searchName,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/getStudentTaskNew",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.errorCode = "";
                                var brr = [];
                                angular.forEach(data.context, function(m) {
                                    if (m.commitStatus == 0) {
                                        brr.push(m);
                                    }
                                    if (m.task) {
                                        setTimeout(function() {
                                                layui.use(['rate'], function() {
                                                    var ins = layui.rate;
                                                    ins.render({
                                                        elem: ".homeWkDetailPage #homeWk_comment" + m.task.taskId, //绑定元素
                                                        value: m.task.taskStar,
                                                        readonly: true
                                                    });
                                                });
                                            })
                                            //以下是作业内容多媒体
                                        if (m.task.taskUrlList && m.task.taskUrlList.length > 0) {
                                            m.task.taskUrlListOld = angular.copy(m.task.taskUrlList);
                                            m.task.taskUrlList = setUrlist(m.task.taskUrlList);
                                        }
                                        //以下是作业内容里的点评内容
                                        if (m.task.taskReviews && m.task.taskReviews.length > 0) {
                                            angular.forEach(m.task.taskReviews, function(v_, i) {
                                                v_.taskTeacherUrlListOld = angular.copy(v_.taskTeacherUrlList);
                                                v_.taskTeacherUrlList = setUrlist(v_.taskTeacherUrlList);

                                                if (v_.reviewsRecords && v_.reviewsRecords.length > 0) {
                                                    angular.forEach(v_.reviewsRecords, function(v__) {
                                                        v__.reviewsRecordUrlListOld = angular.copy(v__.reviewsRecordUrlList);
                                                        v__.reviewsRecordUrlList = setUrlist(v__.reviewsRecordUrlList);
                                                    });
                                                }
                                            })
                                        }
                                    }
                                });
                                $scope.homeWk_studentList = data.context;
                                $scope.unSubmitStudent = brr;
                            } else if (data.status == '206') {
                                $scope.errorCode = 206;
                                return true;
                            } else if (data.status == '207') {
                                $scope.errorCode = 207;
                                return true;
                            }
                        }
                    })
                }

                function deleteComtInfo(d) {
                    var param = {
                        taskReviewId: d.taskReviewId
                    }
                    if (props.page == "mySchedule") {
                        param["myClasses"] = 1;
                    }
                    detailMsk("删除后不可恢复，是否删除点评内容？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/CourseAffairsMgt/taskReview/delete",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                getHomeWkList();
                            }
                        })
                    });
                }

                function deleteZhui(d) {
                    var param = {
                        reviewsRecordId: d.reviewsRecordId
                    }
                    if (props.page == "mySchedule") {
                        param["myClasses"] = 1;
                    }
                    detailMsk("删除后不可恢复，是否删除追评内容？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/CourseAffairsMgt/reviewsRecord/delete",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                getHomeWkList();
                            }
                        })
                    });
                }

                function onceSubWk() {
                    var isSub = layer.confirm('是否提醒未交作业的学员提交作业？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        var arr = [];
                        angular.forEach($scope.unSubmitStudent, function(v) {
                            arr.push({ id: v.potentialCustomer.id });
                        });
                        var param = {
                            students: arr,
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/teacher/home/setUnDoTaskStudentListInfo",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == "200") {
                                    layer.msg("作业已催交");
                                    layer.close(isSub);
                                }
                            }
                        })
                    }, function() {
                        layer.close(isSub);
                    })
                }

            }



            //打开积分弹框
            function goPoints(t) {
                $scope.pointType = t;
                getStudentPoints();

                $scope.goPopup("points_table", "660px");

                $scope.editPoint = function() {
                    var arr = [];
                    if ($scope.pointsList) {
                        angular.forEach($scope.pointsList, function(v) {
                            if (v.pointsRecord && v.pointsRecord.pointsValue) {
                                arr.push({
                                    potentialCustomerId: v.potentialCustomerId,
                                    pointsValue: v.pointsRecord.pointsValue
                                });
                            }
                        });
                    }
                    var param = {
                        arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                        pointsRecordList: arr
                    }
                    var URL;
                    if (t == "comment") {
                        URL = "updateCourse";
                    } else {
                        URL = "updateTask";
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/points/" + URL,
                        type: 'post',
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == 200) {
                                //                              if(t == "comment"){
                                //                                  $scope.$emit("reloadStudentlist");
                                //                              }else if(t == "homeWk"){
                                //                                  $scope.$emit("changeHomeWk");
                                //                              }
                                $scope.closePopup('points_table');
                            }
                        }
                    })
                }
            }

            function getStudentPoints() {
                var URL;
                if ($scope.pointType == "comment") {
                    URL = "courseStudentList";
                } else {
                    URL = "taskStudentList";
                }
                var param = {
                    arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                };
                $.hello({
                    url: CONFIG.URL + "/api/teacher/home/points/" + URL,
                    type: 'get',
                    data: param,
                    success: function(data) {
                        if (data.status == 200) {
                            angular.forEach(data.context, function(v) {
                                if (v.pointsRecord) {
                                    v.pointsRecord.pointsValue = "" + v.pointsRecord.pointsValue;
                                }
                            });
                            $scope.pointsList = data.context;
                        }
                    }
                })
            }

            function getPoints() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/points/listPointsRule",
                    type: 'get',
                    data: { ruleType: 1 },
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.points_comment = [];
                            $scope.points_homeWk = [];
                            var list = data.context;
                            for (var i in list) {
                                if (list[i].pointsItemId == 10) { //课堂积分
                                    $scope.points_comment = list[i].pointsRuleDetailList ? list[i].pointsRuleDetailList : [];
                                    $scope.ketangJifen = list[i].status;
                                    break;
                                }
                            }
                            for (var i in list) {
                                if (list[i].pointsItemId == 11) { //作业积分
                                    $scope.points_homeWk = list[i].pointsRuleDetailList ? list[i].pointsRuleDetailList : [];
                                    $scope.zuoyeJifen = list[i].status;
                                    break;
                                }
                            }
                            $scope.points_comment.unshift({ pointsValue: "0" });
                            $scope.points_homeWk.unshift({ pointsValue: "0" });
                        }
                    }
                })
            }

            //          上传附件
            function CLASSANNEX() {
                init7();

                function init7() {
                    $scope.unView = undefined;
                    $scope.arrangingCoursesAnnexId = undefined;
                    getAnnex(); //获取附件
                    getClassStuds(); //获取在课学员
                    $scope.add_annexFile = add_annexFile; //上传附件
                    $scope.deleteAnnex = deleteAnnex; //删除附件
                    //                  $scope.viewAnnex = viewAnnex;//删除附件
                    $scope.getClassStuds = getClassStuds; //在课学员
                }

                function getAnnex() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/annex/get",
                        type: 'get',
                        data: {
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined
                        },
                        success: function(data) {
                            if (data.status == "200") {
                                console.log(data.context);
                                if (data.context) {
                                    $scope.arrangingCoursesAnnexId = data.context.arrangingCoursesAnnexId;
                                    $scope.uploadData = {
                                        hasFile: true,
                                        annexAddressUrl: data.context.annexAddressUrl,
                                        annexAddress: data.context.annexAddress,
                                        web_annexAddress: data.context.annexName,
                                        type: data.context.annexType
                                    };
                                } else {
                                    $scope.arrangingCoursesAnnexId = undefined;
                                    $scope.uploadData = {
                                        hasFile: false,
                                        annexAddressUrl: "",
                                        annexAddress: "",
                                        web_annexAddress: "",
                                        type: ""
                                    };
                                }
                            }
                        }
                    })
                }
                if (!$scope.fileDatabase) {
                    $scope.fileDatabase = $scope.$on('课堂附件-资料库', function(e, data) {
                        console.log(data);
                        $timeout(function() {
                            $scope.uploadData = {
                                hasFile: true,
                                annexAddressUrl: data[0].url,
                                annexAddress: data[0].key,
                                web_annexAddress: data[0].name,
                                type: data[0].type
                            };
                            $.hello({
                                url: CONFIG.URL + "/api/oa/CourseAffairsMgt/annex/add",
                                type: 'post',
                                data: JSON.stringify({
                                    arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                                    annexAddress: $scope.uploadData.annexAddress,
                                    annexName: $scope.uploadData.web_annexAddress,
                                    annexType: $scope.uploadData.type
                                }),
                                success: function(data) {
                                    if (data.status == "200") {
                                        $scope.arrangingCoursesAnnexId = data.context.arrangingCoursesAnnexId;
                                    }
                                }
                            })
                        })
                    });
                }
                //上传文件
                function add_annexFile() {
                    var uploadObserver = {
                        'filesSelected': function(files) {
                            angular.forEach(files, function(item) {
                                var fileName = item.file.name;
                                var fileUrl = item.fileUrl;
                                var type = item.file.type;
                                var fileType = item.fileType; //文件类型用来页面判断
                                var data = {
                                    percent: 0,
                                    fileName: fileName.substr(0, fileName.lastIndexOf('.')),
                                    fileType: fileType
                                }
                                $scope.uploadData = {
                                    hasFile: true,
                                    annexAddressUrl: fileUrl,
                                    annexAddressUrl_: $sce.trustAsResourceUrl(fileUrl),
                                    //                                  annexAddress: data.substring(data.indexOf("annex"), data.length),
                                    web_annexAddress: fileName,
                                    type: fileType
                                };

                            });
                            $scope.$apply();
                        }, //文件选择结果，返回文件列表
                        'fail': function(fileUrl, error) {
                            $scope.uploadData.uploadErr = error;
                            $scope.$apply();
                        }, //文件上传失败
                        'success': function(fileUrl, key) {
                            $scope.uploadData.annexAddress = key;
                            $scope.$apply();
                        }, //文件上传成功
                        'progress': function(fileUrl, percent) {
                                var found = false;
                                if ($scope.uploadData.annexAddressUrl == fileUrl) {
                                    $scope.uploadData.percent = percent;
                                    found = true;
                                }
                                //如果没找到就取消上传
                                if (!found) {
                                    return true;
                                }
                                $scope.$apply();
                            } //文件上传进度
                    };
                    $timeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            console.log(data);
                            $.hello({
                                url: CONFIG.URL + "/api/oa/CourseAffairsMgt/annex/add",
                                type: 'post',
                                data: JSON.stringify({
                                    arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                                    annexAddress: $scope.uploadData.annexAddress,
                                    annexName: $scope.uploadData.web_annexAddress,
                                    annexType: $scope.uploadData.type
                                }),
                                success: function(data) {
                                    if (data.status == "200") {
                                        $scope.arrangingCoursesAnnexId = data.context.arrangingCoursesAnnexId;
                                    }
                                }
                            })
                            $scope.$apply();
                        }, {
                            type: 'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf'
                        }, uploadObserver);
                    }, 100);
                }

                function deleteAnnex() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/annex/delete",
                        type: 'post',
                        data: JSON.stringify({
                            arrangingCoursesAnnexId: $scope.arrangingCoursesAnnexId
                        }),
                        success: function(data) {
                            if (data.status == "200") {
                                //                              $('#inputImage').val("");
                                $scope.uploadData = {
                                    hasFile: false,
                                    annexAddressUrl: "",
                                    annexAddress: "",
                                    web_annexAddress: "",
                                    type: ""
                                };
                            }
                        }
                    })

                }

                function getClassStuds() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/CourseAffairsMgt/getStudentAnnex",
                        type: 'get',
                        data: {
                            arrangingCoursesId: $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined,
                            lookStatus: $scope.unView ? "0" : undefined
                        },
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.inclass_studentList = data.context;
                            }
                        }
                    })
                }
            }

            function showContentFun(m) {
                m.showContent = !m.showContent;
                $scope.addcommentData = {
                    reviewsRecordUrl: [],
                    reviewsContent: ''
                };
            }

            function sendComment(x, m, fromPop) {
                if (!$scope.addcommentData.reviewsContent && $scope.addcommentData.reviewsRecordUrl.length <= 0) {
                    return layer.msg("评论内容和多媒体内容2选1必填");
                }
                if ($scope.addcommentData.reviewsRecordUrl && $scope.addcommentData.reviewsRecordUrl.length > 3) {
                    return layer.msg("多媒体内容最多3个");
                }
                var j = [true, ""];
                var list = $scope.addcommentData.reviewsRecordUrl;
                for (var i = 0, len = list.length; i < len; i++) {
                    if (!list[i].key) {
                        j[0] = false;
                        break;
                    }
                }
                if (!j[0]) {
                    return layer.msg("请处理未成功的多媒体！");
                }
                var param;
                param = {
                    reviewsId: $scope.fromPop == "class" ? m.reviewId : m.taskReviewId,
                    reviewsType: $scope.fromPop == "class" ? 1 : 2, // 评论类别 1：课堂点评 2：作业点评
                    potentialCustomerId: x.potentialCustomer.potentialCustomerId,
                    reviewsContent: $scope.addcommentData.reviewsContent,
                    reviewsRecordUrl: getUrlList($scope.addcommentData.reviewsRecordUrl)
                }

                $.hello({
                    url: CONFIG.URL + "/api/teacher/home/addReviewsRecord",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            if ($scope.fromPop == "class") {
                                $scope.$emit('reloadStudentlist');
                            } else {
                                $scope.$emit('changeHomeWk');
                            }
                            m.showContent = false;
                        }
                    }
                })
            }
            //课堂点评和作业收交页面的 对学员的点评和编辑点名
            function goComment(x, m, fromPop, type) {
                $scope.commentData = {};
                $scope.studentComtData = angular.copy(x);
                $scope.stud_comtInfo = $scope.studentComtData.potentialCustomer;
                console.log($scope.stud_comtInfo);
                if (type == 'add') {
                    $scope.commentData = {
                        reviewLevel: 3,
                        reviewDesc: "",
                        reviewUrlList: [],
                        reviewUrlListOld: []
                    };
                } else {
                    $scope.commentData = angular.copy(m);
                    if ($scope.fromPop == "homeWk") {
                        $scope.commentData.reviewLevel = m.taskReviewLevel;
                        $scope.commentData.reviewDesc = m.taskTeacherDesc;
                        $scope.commentData.reviewUrlList = m.taskTeacherUrlList;
                        $scope.commentData.reviewUrlListOld = m.taskTeacherUrlListOld;
                    }
                }
                (function() {
                    layui.use(['rate'], function() {
                        var ins = layui.rate;
                        ins.render({
                            elem: '#comment_start', //绑定元素
                            value: $scope.commentData.reviewLevel,
                            choose: function(val) {
                                $scope.commentData.reviewLevel = val;
                            }
                        });
                    });
                })();
                $scope.goPopup('comment_pop', '660px');
                if (!$scope.addRemark_toCommentLiser) {
                    $scope.addRemark_toCommentLiser = $scope.$on("addRemark_toComment", function(e, data) {
                        $scope.commentData.reviewDesc = data.str;
                    });
                }
                $scope.confirm_comment = function() {
                    if ($scope.commentData.reviewLevel < 1) {
                        return layer.msg("请选择评分");
                    }
                    if (!$scope.commentData.reviewDesc && $scope.commentData.reviewUrlList.length <= 0) {
                        return layer.msg("点评内容和多媒体内容2选1必填");
                    }
                    var j = [true, ""];
                    var list = $scope.commentData.reviewUrlList;
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
                    var param;
                    if ($scope.fromPop == "class") {
                        param = {
                            reviewLevel: $scope.commentData.reviewLevel,
                            reviewDesc: $scope.commentData.reviewDesc,
                            reviewUrl: getUrlList($scope.commentData.reviewUrlList)
                        }
                        if (type == "add") {
                            param["arrangingCoursesId"] = $scope.props.item ? $scope.props.item.arrangingCoursesId : undefined;
                            param["studentId"] = $scope.stud_comtInfo.id;
                            URL = "/api/oa/myCourse/addReview";
                        } else {
                            param["reviewId"] = $scope.commentData.reviewId;
                            param["myClasses"] = 1;
                            URL = "/api/oa/CourseAffairsMgt/modifyReview";
                        }
                    } else {
                        param = {
                            taskReviewLevel: $scope.commentData.reviewLevel,
                            taskTeacherDesc: $scope.commentData.reviewDesc,
                            taskTeacherUrl: getUrlList($scope.commentData.reviewUrlList),

                        }
                        if (type == "add") {
                            param["taskId"] = $scope.studentComtData.taskId;
                            URL = "/api/oa/myCourse/addTaskReview";
                        } else {
                            param["taskReviewId"] = $scope.commentData.taskReviewId;
                            param["myClasses"] = 1;
                            URL = "/api/oa/CourseAffairsMgt/modifyTaskReview";
                        }
                    }
                    console.log(param);
                    $.hello({
                        url: CONFIG.URL + URL,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                if ($scope.fromPop == "class") {
                                    $scope.$emit('reloadStudentlist');
                                } else {
                                    $scope.$emit('changeHomeWk');
                                }
                                $scope.closePopup('comment_pop');
                            }
                        }
                    })
                }

            }

            function goFastComment(ind, list) {
                $scope.selAll = false;
                getFastComment();

                function getFastComment() {
                    if ($scope.fromPop == "class") {
                        var param = {
                            remarkType: 0
                        };
                    } else {
                        var param = {
                            remarkType: 1
                        };
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/myCourse/getRemark",
                        type: "get",
                        data: param,
                        success: function(data) {
                            angular.forEach(data.context, function(v) {
                                v.hasChecked = false;
                            });
                            $scope.getRemarkList = data.context;
                        }
                    })
                }
                $scope.goPopup("fastComment", "660px");

                $scope.confirm_fastComment = function() {
                    var a = "";
                    angular.forEach($scope.getRemarkList, function(v) {
                        if (v.hasChecked) {
                            a += v.remarkDesc + ";";
                        }
                    });
                    if (a.length > 0) {
                        $scope.$emit("addRemark_toComment", { str: a, index: ind, list: list });
                        $scope.closePopup('fastComment');
                    } else {
                        layer.msg("请选择评语！");
                    }
                }
                $scope.addComment = function(type, x) {
                    $scope.fast_commentType = type;
                    if (type == "新增") {
                        $scope.remarkData = {
                            remarkDesc: ""
                        };
                    } else {
                        $scope.remarkData = angular.copy(x);
                    }
                    $scope.goPopup("add_Comment", "660px");
                }
                $scope.confirm_add_Comment = function() {
                    var param = {},
                        URL = "";
                    param["remarkDesc"] = $scope.remarkData.remarkDesc;
                    if ($scope.fast_commentType == "新增") {
                        URL = "addRemark";
                        param["remarkType"] = $scope.fromPop == "class" ? "0" : "1";
                    } else {
                        URL = "updateRemark";
                        param["remarkId"] = $scope.remarkData.remarkId;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/myCourse/" + URL,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            getFastComment();
                            $scope.closePopup('add_Comment');
                        }
                    })
                }
                $scope.deleteComment = function(d) {
                    detailMsk("是否删除本条评语？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/myCourse/deleteRemark",
                            type: "post",
                            data: JSON.stringify({ remarkId: d.remarkId }),
                            success: function(data) {
                                getFastComment();
                            }
                        })
                    });
                }
            }
            //添加图片/音频/视频
            function add_showInfo(type, list, from,data_source) {
                if (type == 'img' || type == 'voice' || type == 'video') {
                    if (from == "show") {
                        if (list.length > 19) {
                            layer.msg('添加到达上限');
                            return;
                        }
                    } else if (from == "comment") {
                        if (list.length > 2) {
                            layer.msg('添加到达上限');
                            return;
                        }
                    } else {
                        if (list.length > 7) {
                            layer.msg('添加到达上限');
                            return;
                        }
                    }
                }
                var uploadObserver = {
                    'filesSelected': function(files) {
                        angular.forEach(files, function(item) {
                            console.log(item);
                            var fileName = item.file.name;
                            var fileUrl = item.fileUrl;
                            var type = item.file.type;
                            var fileType = item.fileType; //文件类型用来页面判断
                            var data = {
                                percent: 0,
                                fileName: fileName.substr(0, fileName.lastIndexOf('.')),
                                fileType: fileType
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
                switch (type) {
                    case 'img': //添加图片
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // if(data.length>0){
                                //     angular.forEach(data,function(v){
                                //         list.push({
                                //             imageUrl: v
                                //         });
                                //     });
                                // }
                                // $scope.$apply();
                            }, { multiple: true, type: 'image/gif, image/jpeg, image/png' , dataSource:'homework'}, uploadObserver);
                        }, 100);
                        break;
                    case 'voice': //添加音频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // console.log(data);
                                // list.push({
                                //     audioUrl: data,
                                //     audioUrl_: $sce.trustAsResourceUrl(data)
                                // });
                                // $scope.$apply();
                            }, {
                                type: 'audio/mp3,audio/m4a,audio/x-m4a'
                            }, uploadObserver);
                        });
                        break;
                    case 'video': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // console.log(data);
                                // list.push({
                                //     videoUrl: data,
                                //     videoUrl_: $sce.trustAsResourceUrl(data)
                                // });
                                // $scope.$apply();
                            }, {
                                type: 'video/mp4'
                            }, uploadObserver);
                        }, 100);
                        break;
                    case 'more': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // console.log(data);
                                // list.push({
                                //     videoUrl: data,
                                //     videoUrl_: $sce.trustAsResourceUrl(data)
                                // });
                                // $scope.$apply();
                            }, {
                                multiple: true,
                                type: 'image/gif, image/jpeg, image/png, image/png,audio/mp3,audio/m4a,audio/x-m4a,video/mp4',
                                dataSource:data_source
                            }, uploadObserver);
                        }, 100);
                        break;
                }
            }

            function setUrlist(list) {
                var urlList = [];
                angular.forEach(list, function(v) {
                    var obj = {};
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

            function openPhotos(value, list) {
                if (list.length <= 0) {
                    return;
                }
                var param = {
                    val: value,
                    list: list,
                    liwidth: 880,
                    liheight: 470
                }

                window.$rootScope.yznOpenPopUp($scope, 'photo-pop', 'photosPop', '960px', param);
            }


            function delete_showInfo(ind, list) {
                list.splice(ind, 1);
            }

            function open_Info(type, l) {
                $scope.links = l;
            }

            //初始化
            if (props && props.pop == '课务设置') {
                console.log("1111");
                setInit();
            } else {
                console.log("222");
                init();
            }

        }
    })
})