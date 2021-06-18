define(['laydate', "mySelect", "timePop", ], function(laydate) {
    creatPopup({
        el: 'arangePop',
        openfn: 'arangeCourse',
        htmlUrl: './templates/popup/arange_Course.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state) {
            $scope.props = props;
            console.log(props);
            $scope.constants = {
                //              isShowPackage:false,
                title: $scope.props.title ? $scope.props.title : "快速排课",
                operateTime: { "beginTime": "07:00", "endTime": "08:00" },
                // 循环or单次
                courseId: props.item ? props.item.courseId : "",
                classId: props.item ? props.item.classId : "",
                classRoomId: props.item ? props.item.classRoomId : "",
                isingle: $scope.props.isSingle,
                teachingMethod: "2",
                data: [{ data: yznDateFormatYMd(new Date()) }],
                isPackageCourse: false,
                teacherId: "",
                singteacherId: "",
                alread: "请选择主教",
                courseNames: "请选择课程",
                // 发送数据
                postData: {
                    // 是否检查
                    inspectStatus: "",
                    // 教师
                    teachers: [],
                    getDoArrangingCourses: {
                        // 排课模板
                        classTemplate: {
                            beginDate: "",
                            endDate: "",
                            // 模板
                            classTemplateDate: [],
                        }
                    },
                },
                getDoArrangingCourses: {
                    //排课方式: 2结束时间 3 课次
                    type: "3",
                    //排课方式数量
                    num: "",
                },
                packageList: [],
                potentialCustomers: [],
                singleData: {
                    courseType: "0",
                    teachers: [],
                    arrangingCoursesTime: '1',

                },
                // 助教
                subTeacher: [],
                subTeacher: [],
                weekList: [1, 2, 3, 4, 5, 6, 7], //星期列表
                // 循环数据
                loopInfo: {
                    startTime: [{ startTime: yznDateFormatYMd(new Date()) }],
                    endTime: [{ endTime: "" }],
                    loops: [{
                        operateTime: { "beginTime": "07:30", "endTime": "09:00" },
                        week: {},
                        oneCourseTime: "1"
                    }]
                },
                selectMakeupStud: [],
                classroomList_: [],
                courseThemeList_: [],
                teacherList_: [],
                teacherList_2: [],
                conflictJud: { //冲突按钮判断
                    room: false,
                    teacher: false,
                },
                conflictInfo: { //冲突信息
                    type: '',
                    room: '',
                    teacher: ''
                },
                lineClassInfo: null, //选择班级之后记录整条班级信息用于默认数据
                years: getSomeYears(),
                courseTheme: null, //排课主题
                checkAll: false,
                showCourseType: undefined, //试听排课或试听课变更排课显示人数限制
                maxPaikeday: "", //结束方式最大排课日期
                maxkeci: 0, //结束方式最大课次
                classRoomObj: { classRoom: { classRoomId: '', classRoomName: '' }, conflictStatus: '', inClassStatus: '' }, //用来记住已选择的教室，监听时优先判断是否有已选进行填充值
                shopTeacherObj: { shopTeacher: { shopTeacherId: '', teacherName: '' }, conflictStatus: '', inClassStatus: '', arrangingCourses: {} } //用来记住已选择的主教老师，监听时优先判断是否有已选进行填充值
            };
            $scope.Fns = {
                //时间比较
                time_range: function(choosebeginTime, chooseendTime, beginTime, endTime) {
                    if (choosebeginTime >= endTime || chooseendTime <= beginTime) {
                        return false;
                    } else {
                        return true;
                    }
                },
                // 预设时间页面
                usePreSetTime: function(index) {
                    window.$rootScope.yznOpenPopUp($scope, 'time-pop', 'preSetTime', '560px', { index: index });
                },
                //排课变更数据带入
                update: function(item) {
                    console.log("变更排课数据", item)
                    var that = this;
                    $scope.constants.subTeacher = [];
                    $scope.constants.singleData.studentTotal = item.studentTotal;
                    $scope.constants.singleData.courseType = item.courseType;
                    $scope.constants.singleData.remark = item.remark;
                    $scope.constants.singleData.classroomId = item.classroomId;
                    $scope.constants.classroomId = item.classroomId;
                    $scope.constants.singleData.arrangingCoursesTime = item.arrangingCoursesTime;
                    $scope.constants.showCourseType = item.courseType;
                    $scope.constants.operateTime.beginTime = yznDateFormatYMdHm(item.arrangingCoursesBeginDate).split(' ')[1];
                    $scope.constants.operateTime.endTime = yznDateFormatYMdHm(item.arrangingCoursesEndDate).split(' ')[1];
                    $scope.constants.data = [{ data: yznDateFormatYMdHm(item.arrangingCoursesBeginDate).split(' ')[0] }];
                    angular.forEach(item.teachers, function(child) {
                        if (child.teacherType == 1) {
                            $scope.constants.singteacherId = child.shopTeacherId;
                            $scope.constants.teacherId = child.shopTeacherId;
                            item.shopTeacherId = child.shopTeacherId;
                        } else {
                            $scope.constants.subTeacher.push({ 'shopTeacher': child });
                        }
                    });
                    $scope.Fns.checkConflict('', 'needData');
                    $scope.Fns.getcoursethemeList(item.courseId);
                },
                // 排课顺延
                paikeShunyanFn: function() {
                    var that = this;
                    var pagerRender = false,
                        start = 0,
                        eachPage = localStorage.getItem('paikeShunyanSel') ? localStorage.getItem('paikeShunyanSel') : 10; //页码初始化
                    var screen_classId = screen_courseId = screen_oneShopTeacherId = screen_twoShopTeacherId = undefined;
                    $scope.searchTime_pkShunyan = yznDateFormatYMd(new Date()) + " 到 " + yznDateFormatYMd(new Date()); //时间筛选默认为空
                    init();

                    function init() {
                        $scope.constants.checkAll = false;
                        that.getclassList();
                        that.getClassTeacherList();
                        that.getcourseList();
                        for (var i in $scope.screen_goReset) {
                            $scope.screen_goReset[i]();
                        }
                        $scope.propsData = props;
                        $scope.choseType = props.inputType;
                        $scope.getLessonList = getLessonList; // 获取排课列表
                        $scope.sel_screenCourse = sel_screenCourse; //选择课程
                        $scope.sel_screenClass = sel_screenClass; //选择班级
                        $scope.sel_screenTeach = sel_screenTeach; //选择主教老师
                        $scope.sel_screenTeach_ = sel_screenTeach_; //选择助教老师
                        $scope.screen_onReset = screen_onReset; //重置
                        $scope.checkboxAll = checkboxAll; //全选选复选框
                        $scope.checkSingle = checkSingle; //单选复选框
                        //                      $scope.sel_paike = sel_paike;//已选排课列表数据--确认按钮
                        //                      $scope.confirm_paike = confirm_paike;//确认将本节课顺延
                        $scope.paikeLesson_params = []; //排课顺眼选择的数据
                        laydate.render({
                            elem: '#searchTime_pkShunyan', //指定元素
                            range: '到',
                            isRange: true,
                            done: function(value) {
                                $scope.searchTime_pkShunyan = value;
                                pagerRender = false;
                                getLessonList(0);
                            }
                        });
                        getLessonList(0);
                    }


                    function checkboxAll(d) {
                        var i_ = [false, null];
                        if (d) {
                            angular.forEach($scope.paikeLesson, function(val_1) {
                                if (!val_1.hasChecked) {
                                    val_1.hasChecked = true;
                                    $scope.paikeLesson_params.push(val_1);
                                }
                            });
                        } else {
                            angular.forEach($scope.paikeLesson, function(val_1) {
                                val_1.hasChecked = false;
                                i_ = [false, null];
                                angular.forEach($scope.paikeLesson_params, function(val_2, ind_2) {
                                    if (val_1.arrangingCoursesId == val_2.arrangingCoursesId) {
                                        i_ = [true, ind_2];
                                    }
                                });
                                if (i_[0]) {
                                    $scope.paikeLesson_params.splice(i_[1], 1);
                                }
                            });
                        }
                    }

                    function checkSingle(data) {
                        var index_ = [false, null];
                        if (data.hasChecked) {
                            data.hasChecked = false;
                            angular.forEach($scope.paikeLesson_params, function(val, ind) {
                                if (data.arrangingCoursesId == val.arrangingCoursesId) {
                                    index_ = [true, ind];
                                }
                            });
                            if (index_[0]) {
                                $scope.paikeLesson_params.splice(index_[1], 1);
                            }
                        } else {
                            data.hasChecked = true;
                            $scope.paikeLesson_params.push(data);
                        }
                    }

                    function screen_onReset() {
                        screen_classId = screen_courseId = screen_oneShopTeacherId = screen_twoShopTeacherId = undefined;
                        $scope.searchTime_pkShunyan = yznDateFormatYMd(new Date()) + " 到 " + yznDateFormatYMd(new Date());
                        for (var i in $scope.screen_goReset) {
                            $scope.screen_goReset[i]();
                        }
                        pagerRender = false;
                        getLessonList(0);
                    }

                    function sel_screenCourse(c) {
                        screen_courseId = c == null ? undefined : c.courseId;
                        that.getclassList(screen_courseId);
                        pagerRender = false;
                        getLessonList(0);
                    }

                    function sel_screenClass(c) {
                        screen_classId = c == null ? undefined : c.classId;
                        that.getClassTeacherList(screen_classId);
                        pagerRender = false;
                        getLessonList(0);
                    }

                    function sel_screenTeach(t) {
                        screen_oneShopTeacherId = t == null ? undefined : t.shopTeacherId;
                        pagerRender = false;
                        getLessonList(0);
                    }

                    function sel_screenTeach_(t) {
                        screen_twoShopTeacherId = t == null ? undefined : t.shopTeacherId;
                        pagerRender = false;
                        getLessonList(0);
                    }

                    function getLessonList(start) {
                        var params = {
                            "start": start.toString() || "0",
                            "count": eachPage,
                            "status": "0",
                            "classId": screen_classId,
                            "courseId": screen_courseId,
                            "oneShopTeacherId": screen_oneShopTeacherId,
                            "twoShopTeacherId": screen_twoShopTeacherId,
                            "courseType": "0",
                            "classModeStatus": "1"
                        }
                        if ($scope.searchTime_pkShunyan) {
                            params["beginTime"] = $scope.searchTime_pkShunyan.split(" 到")[0] + " 00:00:00";
                            params["endTime"] = $scope.searchTime_pkShunyan.split(" 到")[1] + " 23:59:59";
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/lesson/list",
                            type: "get",
                            data: params,
                            success: function(data) {
                                if (data.status == '200') {
                                    var list = data.context.items;
                                    var today = yznDateFormatYMd(new Date());
                                    if (list.length > 0) {
                                        angular.forEach(list, function(val) {
                                            val.classTemplateDates_str = dateArrToStr(val.classTemplateDates);
                                            //                                          var today_bt = yznDateFormatYMd(val.arrangingCoursesBeginDate);
                                            //                                          var today_et = yznDateFormatYMd(val.arrangingCoursesEndDate);
                                            //                                          if (today_bt == today_et && today_bt == today) {
                                            //                                              val.hasChecked = true;
                                            //                                          }
                                        });
                                    }
                                    $scope.paikeLesson = list;
                                    repeatLists($scope.paikeLesson, $scope.paikeLesson_params, 'arrangingCoursesId');
                                    $scope.constants.checkAll = false;
                                    renderPager(data.context.totalNum);
                                }
                            }
                        })
                    }

                    function dateArrToStr(arr) {
                        var str = '';
                        angular.forEach(arr, function(v) {
                            str += "每" + returnweek(v.week) + v.beginTime + "-" + v.endTime + "  ";
                        });
                        return str;
                    }

                    function renderPager(total) { //分页
                        if (pagerRender)
                            return;
                        pagerRender = true;
                        var $M_box3 = $('.paikePage');
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
                                    localStorage.setItem('paikeShunyanSel', eachPage);
                                }
                                start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                                switch (props.name) {
                                    case 'lesson':
                                        getLessonList(start);
                                        break;
                                }
                            }
                        });
                    }

                    //                  function sel_paike() {
                    //                      var list = $scope.paikeLesson_params;
                    //                      var arr = [];
                    //                      angular.forEach(list, function (val) {
                    //                          var obj = {};
                    //                          if (val.hasChecked) {
                    //                              obj.arrangingCoursesId = val.arrangingCoursesId;
                    //                              arr.push(obj);
                    //                          }
                    //                      });
                    //                      if (arr.length <= 0) {
                    //                          layer.msg("请选择课表");
                    //                          return;
                    //                      }
                    //                      $scope.hasConfPop = false;//没有冲突提示
                    //                      var isConfirm = layer.confirm('系统将自动删除所选中的排课；并按当前排课规律重新进行排课。是否继续操作？', {
                    //                          title: "确认信息",
                    //                          skin: 'newlayerui layeruiCenter',
                    //                          closeBtn: 1,
                    //                          offset: '30px',
                    //                          resize: false,
                    //                          move: false,
                    //                          area: '560px',
                    //                          btn: ['是', '否'] //按钮
                    //                      }, function () {
                    //                          confirm_paike(arr);
                    //                          layer.close(isConfirm);
                    //                      }, function () {
                    //                          layer.close(isConfirm);
                    //                      })
                    //                  }

                    //                  function confirm_paike(arr) {
                    //                      var params = {
                    //                          "arrangingCourses": arr
                    //                      };
                    //                      if ($scope.hasConfPop) {
                    //                          params["inspectStatus"] = "0";
                    //                      }
                    //                      $.hello({
                    //                          url: CONFIG.URL + "/api/oa/lesson/shunYan",
                    //                          type: "post",
                    //                          data: JSON.stringify(params),
                    //                          success: function (data) {
                    //                              if (data.status == '200') {
                    //                                  $timeout(function () {
                    //                                      if ($scope.hasConfPop) {
                    //                                          $scope.closePopup("sy_conflict_prompt");
                    //                                      }
                    //                                      $scope.$emit('scheduleChange', '顺延');
                    //                                      $scope.closePopup("pkShunyan");
                    //                                      $scope.hasConfPop = false;
                    //                                  }, 1000, true)
                    //                                  return true;
                    //                              } else if (data.status == '20015') {
                    //                                  $scope.teachConfList = data.context.inspectTeacher;
                    //                                  $scope.classRmConfList = data.context.inspectClassRoom;
                    //                                  $scope.ispakeorsunyan = true;
                    //                                  $scope.goPopup("sy_conflict_prompt", "760px");
                    //                                  $scope.hasConfPop = true;
                    //                                  $scope.ignoreConflict = function () {
                    //                                      confirm_paike(arr);
                    //                                  }
                    //                                  return true;
                    //                              } else {
                    //
                    //                              }
                    //                          }
                    //                      });
                    //                  }
                },
                // 计算分钟
                getMinutes: getMinutes_,
                // 时间选择
                changeClasstime: function(data, index, item) {
                    var that = this,
                        currentItem = item;
                    $scope.constants.isingle == 1 ? $scope.constants.loopInfo.loops[index].operateTime = data : $scope.constants.operateTime = data;

                    if ($scope.constants.isingle == 1) {
                        if ($scope.constants.loopInfo.loops[index].operateTime.beginTime > $scope.constants.loopInfo.loops[index].operateTime.endTime) {
                            // return layer.msg("结束时间不能小于开始时间!!",{time:1000});
                        }
                    } else {
                        if ($scope.constants.operateTime.beginTime > $scope.constants.operateTime.endTime) {
                            // return layer.msg("结束时间不能小于开始时间!!",{time:1000});
                        }
                    }

                    if (item) {
                        angular.forEach($scope.constants.loopInfo.loops, function(child, index_) {
                            if ($scope.constants.loopInfo.loops.length == 1 || index_ == index || currentItem.week !== child.week) {
                                return;
                            }
                            if (that.time_range(currentItem.operateTime.beginTime, currentItem.operateTime.endTime, child.operateTime.beginTime, child.operateTime.endTime)) {
                                // return layer.msg("所选时间段中存在冲突,请检查!!");
                            } else {

                            }
                        });
                    }
                },
                // 删除
                operationItem: function(arr, type, index, isloop) {
                    if (arr) {
                        switch (type) {
                            case 'add':
                                arr.push({
                                    operateTime: { "beginTime": "07:00", "endTime": "07:30" },
                                    week: {},
                                    oneCourseTime: "1"
                                });
                                break;
                            case 'paikeRemove':
                                arr.splice(index, 1);
                                break;
                            case 'remove':
                                arr.hasSelected = false;
                                if (isloop) {
                                    $scope.constants.subTeacher.splice(index, 1);
                                } else {
                                    $scope.constants.subTeacher.splice(index, 1);
                                }
                                break;
                        }
                    }
                },
                //点击选择周几上课
                clickSelWeek: function() {
                    var jud = false;
                    angular.forEach($scope.constants.loopInfo.loops, function(val) {
                        for (obj in val.week) {
                            if (val.week[obj]) {
                                jud = true;
                                return;
                            }
                        }
                    });
                    // if(jud && $scope.constants.classroomList_.length == 0) {
                    //     $scope.Fns.checkConflict('', 'firstData');  //第一次默认选中本班教室老师信息
                    // }
                },
                // 获取课程
                getcourseList: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/getCoursesList",
                        type: "get",
                        data: { courseStatus: 1, pageType: 0 },
                        success: function(data) {
                            if (data.status == '200') {
                                var arr = [];
                                angular.forEach(data.context, function(v) {
                                    if (v.courseType == 0) {
                                        arr.push(v);
                                    }
                                });
                                $scope.constants.courseList = arr;
                            }
                        }
                    })
                },
                //获取学期列表
                getPackageList: function(id) {
                    $scope.constants.courseId = id;
                },
                // 获取班级
                getclassList: function(id) {
                    var p = {
                        pageType: "0",
                        classStatus: "1",
                        //                      teachingMethod: $scope.constants.teachingMethod
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/list",
                        type: "get",
                        data: p,
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.constants.classList = data.context;
                                if (id) {
                                    $scope.constants.classList.forEach(function(item) {
                                        if (item.classId == id) {
                                            $scope.$broadcast('_class', 'clearHeadName', item.className, true);
                                            $scope.Fns.screenSel_(item, 1);
                                        }
                                    })
                                }
                            }
                        }
                    });
                },
                get_packageList: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                        type: "get",
                        data: {
                            pageType: "0"
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.packageList = data.context;
                            }

                        }
                    })
                },
                //点击切换排课模式（单次、循环）/点击切换一对一、一对多排课
                changeLoop: function(type) {
                    if (type == 1) {
                        $scope.constants.subTeacher = [];
                        $scope.Fns.checkConflict('', 'needData', true);
                    } else if (type == 2) {
                        $scope.Fns.getclassList();
                        $scope.constants.classId = '';
                        $scope.constants.courseId = '';
                        $scope.constants.lineClassInfo = '';
                        $scope.constants.classroomList_ = [];
                        $scope.constants.courseThemeList_ = [];
                        $scope.constants.teacherList_ = [];
                        $scope.constants.teacherList_2 = [];
                        $scope.constants.subTeacher = [];
                        $scope.constants.classRoomId = '';
                        $scope.constants.singleData.classroomId = '';
                        $scope.constants.teacherId = '';
                        $scope.constants.singteacherId = '';
                        $scope.constants.conflictJud.room = false;
                        $scope.constants.conflictJud.teacher = false;
                        $scope.constants.conflictInfo.room = '';
                        $scope.constants.conflictInfo.teacher = '';
                        //清空上次打开的默认数据
                        for (var i in $scope.screen_goReset) {
                            $scope.screen_goReset[i]();
                        }
                    }
                },
                //选择班级-教室-老师（筛选）
                screenSel_: function(d, type) {
                    console.log(d);
                    console.log(type);
                    switch (type) {
                        case 1: //选择班级
                            $scope.constants.classId = d.classId;
                            $scope.constants.courseId = d.courseId;
                            $scope.constants.lineClassInfo = angular.copy(d);
                            //                          $scope.Fns.checkConflict('', 'firstData');  //第一次默认选中本班教室老师信息
                            $scope.Fns.getcoursethemeList(d.courseId); //获取上课主题
                            $scope.constants.courseTheme = null; //清空上课主题
                            $scope.constants.teachingMethod = d.course.teachingMethod;
                            screen_setDefaultField($scope, function() {
                                if ($scope.screen_goReset['_theme']) {
                                    $scope.screen_goReset['_theme']('');
                                }
                                if ($scope.screen_goReset['_theme1']) {
                                    $scope.screen_goReset['_theme1']('');
                                }
                            });


                            $.hello({
                                url: CONFIG.URL + "/api/oa/class/getClassModel",
                                type: "get",
                                data: { 'classId': d.classId },
                                success: function(res) {
                                    if (res.status == 200) {
                                        $scope.constants.loopInfo.loops = [];
                                        if (res.context.length > 0) {
                                            angular.forEach(res.context, function(val_1) {
                                                var w1_ = val_1['week'].split(','),
                                                    w2_ = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };
                                                angular.forEach(w1_, function(val_2) {
                                                    w2_[val_2] = true;
                                                });
                                                $scope.constants.loopInfo.loops.push({
                                                    'oneCourseTime': 1,
                                                    'operateTime': { 'beginTime': val_1.beginTime, 'endTime': val_1.endTime },
                                                    'week': w2_,
                                                });
                                            });
                                        } else {
                                            $scope.constants.loopInfo.loops = [{
                                                operateTime: { "beginTime": "07:30", "endTime": "09:00" },
                                                week: { 1: true },
                                                oneCourseTime: "1"
                                            }];
                                        };
                                        $scope.Fns.checkConflict('', 'firstData'); //第一次默认选中本班教室老师信息
                                    }
                                }
                            });
                            break;
                        case 2: //选取教室
                            if (d == '' || !d) d = { classRoom: { classRoomId: '', classRoomName: '' } }; //清空教室选择
                            $scope.constants.conflictInfo.room = d ? angular.copy(d) : '';
                            $scope.constants.conflictJud.room = false;
                            if (d.conflictStatus == '1') {
                                $scope.constants.conflictJud.room = true;
                            };
                            if (d) {
                                $scope.constants.classRoomObj = { classRoom: { classRoomId: d.classRoom.classRoomId, classRoomName: d.classRoom.classRoomName }, conflictStatus: d.conflictStatus, inClassStatus: d.inClassStatus };
                            }
                            $scope.constants.classRoomId = d.classRoom.classRoomId;
                            $scope.constants.singleData.classroomId = d.classRoom.classRoomId;
                            if ($scope.constants.isingle == '1') {
                                screen_setDefaultField($scope, function() {
                                    $scope.screen_goReset['_room'](d.classRoom.classRoomName);
                                });
                            } else {
                                screen_setDefaultField($scope, function() {
                                    $scope.screen_goReset['_room2'](d.classRoom.classRoomName);
                                });
                            }
                            break;
                        case 3: //选取主教老师
                            if (d == '' || !d) d = { shopTeacher: { shopTeacherId: '', teacherName: '' } }; //清空老师选择
                            console.log(d);
                            $scope.constants.conflictInfo.teacher = d ? angular.copy(d) : '';
                            $scope.constants.conflictJud.teacher = false;
                            $scope.constants.teacherList_2 = [];
                            var arr = [];
                            if (d.conflictStatus == '1') {
                                $scope.constants.conflictJud.teacher = true;
                            };
                            if (d) {
                                $scope.constants.shopTeacherObj = { shopTeacher: { shopTeacherId: d.shopTeacher.shopTeacherId, teacherName: d.shopTeacher.teacherName }, conflictStatus: d.conflictStatus, inClassStatus: d.inClassStatus, arrangingCourses: d.arrangingCourses };
                            }
                            $scope.constants.teacherId = d.shopTeacher.shopTeacherId;
                            $scope.constants.singteacherId = d.shopTeacher.shopTeacherId;
                            angular.forEach($scope.constants.subTeacher, function(val, ind) { //去掉助教数组里的主教
                                if (d.shopTeacher.shopTeacherId == val.shopTeacher.shopTeacherId) {
                                    delete $scope.constants.subTeacher[ind];
                                }
                            });
                            $scope.constants.subTeacher = detEmptyField_($scope.constants.subTeacher); //去除空的字段
                            angular.forEach($scope.constants.teacherList_, function(val) { //去掉助教列表里的主教
                                if (d.shopTeacher.shopTeacherId != val.shopTeacher.shopTeacherId) {
                                    arr.push(val);
                                };
                            });
                            if ($scope.constants.isingle == '1') {
                                screen_setDefaultField($scope, function() {
                                    $scope.screen_goReset['_teacher1'](d.shopTeacher.teacherName);
                                });
                            } else {
                                screen_setDefaultField($scope, function() {
                                    $scope.screen_goReset['_teacher2'](d.shopTeacher.teacherName);
                                });
                            }
                            $scope.constants.teacherList_2 = angular.copy(arr);
                            $scope.$broadcast('subTeacher', 'reloadData', { 'data': $scope.constants.subTeacher, 'att': 'shopTeacher.shopTeacherId' }); //默认勾选
                            $scope.$broadcast('subTeacher2', 'reloadData', { 'data': $scope.constants.subTeacher, 'att': 'shopTeacher.shopTeacherId' });
                            break;
                        case 4: //选取助教老师
                            if ($scope.constants.subTeacher.length > 8) return layer.msg('最多选择9个助教老师');
                            var judHas = true;
                            var judHasIndex = null;
                            angular.forEach($scope.constants.subTeacher, function(val, index) {
                                if (val.shopTeacher.shopTeacherId == d.shopTeacher.shopTeacherId) {
                                    judHas = false;
                                    judHasIndex = index;
                                }
                            });
                            if (judHas) {
                                $scope.constants.subTeacher.push(d);
                                d.hasSelected = true;
                            } else {
                                $scope.constants.subTeacher.splice(judHasIndex, 1);
                                d.hasSelected = false;
                            }
                            break;
                        case 5: //选取上课主题
                            $scope.constants.courseTheme = d ? d : null;
                            break;
                    }
                },
                //冲突点击事件显示排课信息
                conflictBtn: function(type) {
                    console.log($scope.constants.conflictInfo);
                    switch (type) {
                        case 1:
                            window.$rootScope.yznOpenPopUp($scope, "class-pop", "addClass_pop", "760px", { item: "", type: "add", title: "关于班级", location: "outside", fromPage: props.fromPage, hide_operate: true });
                            break;
                        case 2:
                            $scope.constants.conflictInfo.type = 1;
                            $scope.goPopup('conflictInfo', '760px');
                            break;
                        case 3:
                            $scope.constants.conflictInfo.type = 2;
                            $scope.goPopup('conflictInfo', '760px');
                            break;
                    }
                },
                //检测冲突(有默认数据填充都得调用检测冲突方法，得到教室列表和老师列表)
                checkConflict: function(evt, type, cancelCheckcls) {
                    //                  cancelCheckcls:切换循环排课还是单次的时候，取消优先检查班级
                    if (props.name == 'leave') { //如果是试听或者补课排课不需要检测冲突
                        return;
                    };
                    var params, judgeReturn = [true, ''];
                    if (cancelCheckcls && !$scope.constants.classId) {
                        return;
                    }
                    if (!$scope.constants.classId) {
                        layer.msg('请先选择班级');
                        return;
                    };
                    if ($(evt.target).closest('.dropdown-menu')[0]) { //限制自己元素点击触发
                        return;
                    };
                    $scope.constants.classroomList_ = [];
                    $scope.constants.teacherList_ = [];
                    if ($scope.constants.isingle == '1') {
                        var _d = [];
                        angular.forEach($scope.constants.loopInfo.loops, function(v) { //处理时间
                            var weekArr = []; //判断week对象是否为空对象
                            for (var i in v.week) { //循环多选的星期
                                if (v.week[i]) {
                                    weekArr.push(i);
                                }
                            }
                            if (weekArr.length > 0) {
                                angular.forEach(weekArr, function(v_) {
                                    _d.push({
                                        'endTime': v.operateTime.endTime,
                                        'beginTime': v.operateTime.beginTime,
                                        'week': v_,
                                        'oneCourseTime': v.oneCourseTime
                                    })
                                })
                            } else {
                                judgeReturn = [false, '请选择星期'];
                                return;
                            }
                        })
                        if (!$scope.constants.loopInfo.startTime[0].startTime) {
                            judgeReturn = [false, '请选择开始日期'];
                        }
                        params = {
                            'classId': $scope.constants.classId,
                            'courseBeginDate': $scope.constants.loopInfo.startTime[0].startTime ? ($scope.constants.loopInfo.startTime[0].startTime + ' 00:00:00') : undefined,
                            //                          'courseEndDate': $scope.constants.loopInfo.endTime[0].endTime,
                            'classTemplateDates': _d,
                        };
                        if ($scope.constants.getDoArrangingCourses.type == 3) {
                            params["courseEndDate"] = $scope.constants.maxPaikeday && $scope.constants.getDoArrangingCourses.num ? yznDateFormatYMd($scope.constants.maxPaikeday) + " 00:00:00" : undefined;
                        } else if ($scope.constants.getDoArrangingCourses.type == 2) {
                            params["courseEndDate"] = $scope.constants.loopInfo.endTime[0].endTime ? ($scope.constants.loopInfo.endTime[0].endTime + " 00:00:00") : undefined;
                        }
                    } else {
                        if (!$scope.constants.data[0].data) {
                            judgeReturn = [false, '请选择上课日期'];
                        }
                        params = {
                            'classId': $scope.constants.classId,
                            'courseBeginDate': $scope.constants.data[0].data,
                            'courseEndDate': yznDateAddWithFormat($scope.constants.data[0].data, +1, "yyyy-MM-dd"),
                            'classTemplateDates': [{ 'week': initWeek($scope.constants.data[0].data), 'beginTime': $scope.constants.operateTime.beginTime, 'endTime': $scope.constants.operateTime.endTime }],
                        };
                    };
                    if (props.title == '排课变更' && props.item.arrangingCoursesId) params['arrangingCoursesId'] = props.item.arrangingCoursesId;
                    if (!judgeReturn[0]) { //打印错误信息
                        layer.msg(judgeReturn[1]);
                        return;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/lesson/classRoomTeacherList",
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == "200") {
                                console.log(res);
                                var _r1 = [],
                                    _r2 = [],
                                    _t1 = [],
                                    _t2 = [],
                                    sp, sp_;
                                angular.forEach(res.context.classroomArrangingCoursesList, function(val) {
                                    if ($scope.Fns.autoSelData(val, 'r', type) && evt == '') {
                                        sp = angular.copy(val);
                                    }

                                    if (val.inClassStatus == '1') {
                                        val.classRoom.classRoomName = val.classRoom.classRoomName + '（本班）';
                                        _r1.push(angular.copy(val));
                                    } else {
                                        _r2.push(angular.copy(val));
                                    };
                                });
                                angular.forEach(res.context.teacherArrangingCoursesList, function(val) {
                                    if ($scope.Fns.autoSelData(val, 't', type) && evt == '') {
                                        sp_ = angular.copy(val);
                                    }

                                    if (val.inClassStatus == '1') {
                                        val.shopTeacher.teacherName = val.shopTeacher.teacherName + '（本班）';
                                        _t1.push(angular.copy(val));
                                    } else {
                                        _t2.push(angular.copy(val));
                                    };

                                });
                                $scope.constants.classroomList_ = angular.copy(_r1.concat(_r2));
                                $scope.constants.teacherList_ = angular.copy(_t1.concat(_t2));
                                $scope.constants.teacherList_2 = $scope.constants.teacherList_2.length > 0 ? $scope.constants.teacherList_2 : angular.copy(_t1.concat(_t2));
                                //自动选择教室和老师
                                if (type == 'firstData') { //选择班级之后此班级的教室和老师
                                    if ($scope.constants.classroomList_.length > 0) {
                                        if ($scope.constants.classRoomObj.classRoom.classRoomId) {
                                            angular.forEach($scope.constants.classroomList_, function(v) {
                                                if (v.classRoom.classRoomId == $scope.constants.classRoomObj.classRoom.classRoomId) {
                                                    $scope.Fns.screenSel_(v, 2);
                                                }
                                            });
                                            //                                          $scope.Fns.screenSel_($scope.constants.classRoomObj, 2);
                                        } else {
                                            if ($scope.constants.classroomList_[0].inClassStatus == '1') {
                                                $scope.Fns.screenSel_($scope.constants.classroomList_[0], 2);
                                            } else {
                                                $scope.Fns.screenSel_('', 2)
                                            }
                                        }
                                    }
                                    if ($scope.constants.teacherList_.length > 0) {
                                        if ($scope.constants.shopTeacherObj.shopTeacher.shopTeacherId) {
                                            angular.forEach($scope.constants.teacherList_, function(v) {
                                                if (v.shopTeacher.shopTeacherId == $scope.constants.shopTeacherObj.shopTeacher.shopTeacherId) {
                                                    $scope.Fns.screenSel_(v, 3);
                                                }
                                            });
                                            $scope.Fns.screenSel_($scope.constants.shopTeacherObj, 3);
                                        } else {
                                            if ($scope.constants.teacherList_[0].inClassStatus == '1') {
                                                $scope.Fns.screenSel_($scope.constants.teacherList_[0], 3);
                                            } else {
                                                $scope.Fns.screenSel_('', 3)
                                            }
                                        }
                                    }
                                } else {
                                    if (sp) $scope.Fns.screenSel_(sp, 2);
                                    if (sp_) $scope.Fns.screenSel_(sp_, 3);
                                }
                            }
                        }
                    });
                },
                //打开上课主题弹框
                openTnemePop: function() {
                    if (props.name == "leave") {
                        if (!$scope.constants.courseId) {
                            layer.msg('请先选择课程');
                            return;
                        };
                    } else {
                        if (!$scope.constants.classId) {
                            layer.msg('请先选择班级');
                            return;
                        };
                    }
                    window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'addOreditCourseTl', '660px', { name: 'addcourseTitle', callBackName: 'addNewTheme', fromPage: 'paike', 'courseThemeId': $scope.constants.courseId });
                },
                openClassroom: function() {
                    window.$rootScope.yznOpenPopUp($scope, "classroom-pop", 'addClsroom', '560px', { callBackName: 'addNewClassroom', fromPage: 'paike' });
                },
                //默认数据填充(调用完检测冲突方法后自动调用本方法，把需要填充的默认数据写入该方法中)注：本方法调用完后会自动选择默认的默认的那一条数据
                autoSelData: function(val, type, sp) {
                    var judge = false;
                    switch (type) {
                        case 'r': //默认的教室
                            //点开弹窗如果有赋值教室，就选中赋值的数据
                            if (sp == 'needData') {
                                if ($scope.constants.classRoomId == val.classRoom.classRoomId || val.classRoom.classRoomId == $scope.constants.singleData.classroomId) {
                                    judge = true;
                                }
                            }
                            break;
                        case 't': //默认的老师
                            //点开弹窗如果有赋值老师，就选中赋值的数据
                            if (sp == 'needData') {
                                if ($scope.constants.teacherId == val.shopTeacher.shopTeacherId || val.shopTeacher.shopTeacherId == $scope.constants.singteacherId) {
                                    judge = true;
                                }
                            }
                            break;
                    };
                    return judge;
                },
                // 获取上课教室
                getclassroomList: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/classroom/list",
                        type: "get",
                        data: { pageType: 0 },
                        success: function(data) {
                            if (data.status == '200') {
                                //                              $scope.constants.classroomList = data.context.items;
                                var a_ = [];
                                angular.forEach(data.context.items, function(val) {
                                    a_.push({ 'classRoom': val });
                                });
                                if (props.name == 'listen' || props.name == 'leave') {
                                    $scope.constants.classroomList_ = angular.copy(a_);
                                }
                            }
                        }
                    })
                },
                // 获取上课主题
                getcoursethemeList: function(id) {
                    if (id) {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                            type: "get",
                            data: { 'courseId': id },
                            success: function(data) {
                                if (data.status == '200') {
                                    console.log(data)
                                    $scope.constants.courseThemeList_ = data.context;
                                    if (props.item) {
                                        if (props.item.arrangingCoursesTheme) { //给变更排课的上课主题填充数据
                                            $scope.constants.courseTheme = props.item.arrangingCoursesTheme;
                                            screen_setDefaultField($scope, function() {
                                                $scope.screen_goReset['_theme2']($scope.constants.courseTheme.courseThemeName);
                                            });
                                        }
                                    }
                                }
                            }
                        })
                    };
                },

                // 获取主老师
                getClassTeacherList: function(id) {
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
                                $scope.constants.teacherList = angular.copy(list);
                                if (props.name == 'listen' || props.name == 'leave') {
                                    var a_ = [];
                                    angular.forEach(list, function(val) {
                                        a_.push({ 'shopTeacher': val });
                                    });
                                    $scope.constants.teacherList_ = angular.copy(a_);
                                    $scope.constants.teacherList_2 = angular.copy(a_);
                                }
                            }
                        }
                    });
                },
                getClassInfo: function(id) {
                    $scope.constants.classRoomId = "";
                    $scope.constants.singleData.classroomId = "";
                    if (id) {
                        var param = {
                            classId: id
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/course/getClassInfoInfo",
                            type: "get",
                            data: param,
                            success: function(data) {
                                if (data.status == "200") {
                                    if ($scope.constants.isingle == "0") {
                                        $scope.constants.singleData.classroomId = data.context.classRoomId;
                                    } else {
                                        $scope.constants.classRoomId = data.context.classRoomId;
                                    }
                                }
                            }
                        });
                    }
                },
                // post(单次排课)
                postLesson: function(inStatus, stype) {
                    var that = this;
                    var reslut = this.collectData($scope.constants.isingle);
                    if (reslut == false) {
                        return
                    }
                    var url = $scope.constants.isingle == 1 ? "addArrangingCourses" : "add";
                    var data = $scope.constants.isingle == 1 ? $scope.constants.postData : $scope.constants.singleData;

                    if (props.name == 'leave') {
                        if (!$scope.constants.courseId) {
                            return layer.msg("请选择课程");
                        }
                        if ($scope.forTerm) {
                            if (!$scope.constants.schoolYear) {
                                return layer.msg('请选择学年');
                            }
                            if (!$scope.constants.schoolTermId) {
                                return layer.msg('请选择学期');
                            }
                        }
                    }
                    //非试听课的单次排课或者循环排课，教室和主教需必填
                    if (($scope.constants.isingle == "0" && !$scope.constants.singleData.classroomId && $scope.constants.showCourseType != 1) || ($scope.constants.isingle == "1" && !$scope.constants.classRoomId)) {
                        return layer.msg("请先选择教室!");
                    }
                    if (($scope.constants.isingle == "0" && !$scope.constants.singteacherId && $scope.constants.showCourseType != 1) || ($scope.constants.isingle == "1" && !$scope.constants.teacherId)) {
                        return layer.msg("请先选择主教!");
                    }
                    if (props.isSingle == "0") { //普通排课
                        if (props.title == "记上课") {
                            //                          data["rollStatus"] = "1";
                        } else { //变更排课、补课排课
                            delete $scope.constants.singleData.classId;
                            delete $scope.constants.singleData.inspectStatus;
                            if (props.name == 'class' || props.name == 'lesson' || props.name == 'classAffair' || props.name == 'listen') {
                                delete $scope.constants.singleData.courseId;
                                delete $scope.constants.singleData.courseType;
                                data = {
                                    updateArrangingCourses: $scope.constants.singleData,
                                    inspectStatus: 1
                                };
                                url = "updateBatch";
                            }
                            if (props.isChangePaike) {
                                data["arrangingCourses"] = [{ arrangingCoursesId: props.item.arrangingCoursesId }];
                                //【优化需求】排课变更 添加主题
                                data['updateArrangingCourses']["arrangingCoursesTheme"] = $scope.constants.courseTheme ? {
                                    courseThemeId: $scope.constants.courseTheme.courseThemeId
                                } : undefined;
                            }
                            // 添加补课或者试听学员
                            if (props.name == 'leave') {
                                if ($scope.constants.potentialCustomers.length > 0) {
                                    data["potentialCustomers"] = $scope.constants.potentialCustomers;
                                }

                                data["inspectStatus"] = 1;
                                url = "add";
                                if (props.title == '补课排课') {
                                    data.courseType = "2";
                                    if ($scope.forTerm) {
                                        data.schoolYear = $scope.constants.schoolYear;
                                        data.schoolTermId = $scope.constants.schoolTermId;
                                    }
                                }
                            }
                        }
                    }

                    data["inspectStatus"] = inStatus ? inStatus : "1";
                    var flag = false;
                    if ($scope.constants.isingle == 1) {
                        angular.forEach(data.getDoArrangingCourses.classTemplate.classTemplateDate, function(item) {
                            if ($scope.Fns.getMinutes(item) <= 0) {
                                flag = true;
                            }
                        })
                    } else {
                        if ($scope.Fns.getMinutes($scope.constants.operateTime) <= 0) {
                            flag = true;
                        }
                    }
                    if (flag) {
                        layer.msg("结束时间不能小于等于开始时间");
                        return;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/lesson/" + url,
                        type: "post",
                        data: JSON.stringify(data),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.$emit('scheduleSure');
                                $timeout(function() {
                                    switch (props.name) {
                                        case "class":
                                            if (props.title == "排课变更") {
                                                $scope.$emit('scheduleListChange');
                                            } else {
                                                $scope.$emit('scheduleListChange', '班级课表快速排课');
                                            }
                                            $scope.$emit('classListChange', '班级列表刷新');
                                            break;
                                        case "lesson":
                                            if (props.isSingle == "0") {
                                                $scope.$emit('scheduleChange', "true");
                                            } else {
                                                $scope.$emit('scheduleChange', "false");
                                            }
                                            break;
                                        case "leave":
                                            $scope.$emit('leaveChange', true);
                                            break;
                                        case "listen":
                                            $scope.$emit('scheduleChange', false);
                                            break;
                                        case "classAffair":
                                            if (props.fromPage == "schedule") {
                                                $scope.$emit('changeClassAffair');
                                                $scope.$emit('scheduleChange', true);
                                            }
                                            break;
                                        case "student":
                                            $scope.$emit("changeStudentCourse");
                                            break;
                                        default:
                                            break;
                                    }
                                    console.log($scope);
                                    if (stype) {
                                        $scope.closePopup('sy_conflict_prompt');
                                    }
                                    $scope.closePopup('arange_pop');
                                }, 100, true)
                            } else if (data.status == '20015') {
                                $scope.teachConfList = data.context.inspectTeacher;
                                $scope.classRmConfList = data.context.inspectClassRoom;
                                //                              $scope.ispakeorsunyan = false;
                                $scope.goPopup("sy_conflict_prompt", "760px");
                                return true;
                            }
                        }
                    })
                },
                // 收集发送数据
                collectData: function(type) {
                    var judgeReturn = [true, ''];
                    if (type) {
                        switch (type) {
                            case '1':
                                // 循环排课
                                $scope.constants.postData.classInfo = {
                                    classId: $scope.constants.classId,
                                    courseId: $scope.constants.courseId,
                                    classRoomId: $scope.constants.classRoomId
                                };
                                // 主教
                                $scope.constants.postData.teachers = [];
                                $scope.constants.postData.teachers.push({
                                    shopTeacherId: $scope.constants.teacherId,
                                    teacherType: "1"

                                });
                                // 助教
                                angular.forEach($scope.constants.subTeacher, function(item) {
                                    $scope.constants.postData.teachers.push({
                                        shopTeacherId: item.shopTeacher.shopTeacherId,
                                        teacherType: "0"
                                    })

                                });

                                $scope.constants.postData.getDoArrangingCourses.classTemplate.classTemplateDate = [];

                                angular.forEach($scope.constants.loopInfo.loops, function(v) { //处理时间
                                    var weekArr = []; //判断week对象是否为空对象
                                    for (var i in v.week) { //循环多选的星期
                                        if (v.week[i]) {
                                            weekArr.push(i);
                                        }
                                    }
                                    console.log(weekArr);
                                    if (weekArr.length > 0) {
                                        angular.forEach(weekArr, function(v_) {
                                            $scope.constants.postData.getDoArrangingCourses.classTemplate.classTemplateDate.push({
                                                'endTime': v.operateTime.endTime,
                                                'beginTime': v.operateTime.beginTime,
                                                'week': v_,
                                                'oneCourseTime': v.oneCourseTime
                                            })
                                        })
                                    } else {
                                        judgeReturn = [false, '请选择星期'];
                                        return;
                                    }
                                })
                                $scope.constants.postData.getDoArrangingCourses.classTemplate.beginDate = $scope.constants.loopInfo.startTime[0].startTime;
                                $scope.constants.postData.getDoArrangingCourses.classTemplate.endDate = $scope.constants.loopInfo.endTime[0].endTime;
                                if (!judgeReturn[0]) {
                                    layer.msg(judgeReturn[1]);
                                    return false;
                                }
                                if ($scope.constants.courseTheme) {
                                    $scope.constants.postData.arrangingCoursesTheme = { courseThemeId: $scope.constants.courseTheme.courseThemeId };
                                } else {
                                    $scope.constants.postData.arrangingCoursesTheme = {};
                                }

                                if ($scope.constants.getDoArrangingCourses.type == 3 && $scope.constants.getDoArrangingCourses.num) {
                                    $scope.constants.postData.getDoArrangingCourses.type = $scope.constants.getDoArrangingCourses.type;
                                    $scope.constants.postData.getDoArrangingCourses.num = $scope.constants.getDoArrangingCourses.num;
                                }

                                break;
                            case '0':
                                // 单次排课
                                $scope.constants.singleData.arrangingCoursesBeginDate = $scope.constants.data[0].data + " " + $scope.constants.operateTime.beginTime + ":00";
                                $scope.constants.singleData.arrangingCoursesEndDate = $scope.constants.data[0].data + " " + $scope.constants.operateTime.endTime + ":00";
                                $scope.constants.singleData.classId = $scope.constants.classId;
                                $scope.constants.singleData.courseId = $scope.constants.courseId;
                                // 主教
                                $scope.constants.singleData.teachers = [];
                                if ($scope.constants.singteacherId) {
                                    $scope.constants.singleData.teachers.push({
                                        shopTeacherId: $scope.constants.singteacherId,
                                        teacherType: "1"
                                    });
                                }
                                // 助教
                                angular.forEach($scope.constants.subTeacher, function(item) {
                                    if (item.shopTeacher.shopTeacherId) {
                                        $scope.constants.singleData.teachers.push({
                                            shopTeacherId: item.shopTeacher.shopTeacherId,
                                            teacherType: "0"
                                        })
                                    }
                                });
                                // 添加补课或者试听学员
                                if (props.title == '补课排课') {
                                    $scope.constants.potentialCustomers = [];
                                    angular.forEach($scope.constants.selectMakeupStud, function(item) {
                                        $scope.constants.potentialCustomers.push({
                                            arrangingCoursesId: item.arrangingCoursesId,
                                            id: item.potentialCustomer.id,
                                            potentialCustomerId: item.potentialCustomer.potentialCustomerId,
                                            studentCourseTimeInfoId: item.studentCourseTimeInfoId
                                        })
                                    });
                                }
                                if (props.name !== 'listen') {
                                    if ($scope.constants.courseTheme) {
                                        $scope.constants.singleData.arrangingCoursesTheme = { courseThemeId: $scope.constants.courseTheme.courseThemeId };
                                    } else {
                                        $scope.constants.singleData.arrangingCoursesTheme = {};
                                    }
                                }
                                if (props.title == "记上课") {
                                    $scope.constants.singleData.rollStatus = "1";
                                }

                                break;
                        }
                    }
                },
                //获取最大排课数
                getDoArrangingCourses_: function(type) {
                    //清空之前的值,zmz
                    if ($scope.constants.getDoArrangingCourses.num) {
                        $scope.constants.getDoArrangingCourses.num = "";
                    }
                    $scope.constants.maxPaikeday = "";
                    if ($scope.constants.loopInfo.endTime[0].endTime) {
                        $scope.constants.loopInfo.endTime[0].endTime = '';
                    }
                    $scope.constants.maxkeci = 0;

                    this.collectData($scope.constants.isingle);

                    // 保证授课课时全部提填写
                    var flag = false;
                    angular.forEach($scope.constants.loopInfo.loops, function(item) {
                        if (!item.oneCourseTime) {
                            flag = true;
                        }
                    });
                    if (flag) {
                        return layer.msg("请输入授课课时!");
                    }

                },

                // 日期控件
                layerRenger: function(data) {
                    var aa = $(data.wrapper + ' .searchTimeforcharge');
                    for (var i = 0; i < aa.length; i++) {
                        (function(i) {
                            laydate.render({
                                elem: aa[i], //指定元素
                                format: "yyyy-MM-dd",
                                isRange: false,
                                done: function(value, date, endDate) {
                                    if ($scope.constants.isingle == 1) {
                                        i == 0 ? $scope.constants.loopInfo.startTime[0].startTime = value : $scope.constants.loopInfo.endTime[0].endTime = value;
                                        //                                      $scope.Fns.getDoArrangingCourses(); //循环排课是获取最大排课数量
                                    } else {
                                        $scope.constants.data[0].data = value;
                                    }
                                    $scope.$apply();
                                }
                            })
                        })(i)
                    }
                },
                //获取补课学员弹框
                openStudentTb: function(obj) {
                    if (obj == 'makeup_stu') {
                        if (!$scope.constants.courseId) {
                            layer.msg("请选择补课课程");
                            return;
                        }
                        window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'makeup_stu', '860px', { name: 'leave', type: 'makeup_student', choseType: 'checkbox', callBackName: '补课学员', courseId: $scope.constants.courseId });
                    }
                },
                //删除已选择的补课学员
                deleteSelectStud: function(x, index) {
                    $scope.constants.selectMakeupStud.splice(index, 1);
                },
                watchFun: function() {
                        var judgeReturn = [true, ''];
                        $scope.constants.postData.getDoArrangingCourses.classTemplate.classTemplateDate = [];

                        $scope.constants.maxkeci = 0;
                        $scope.constants.maxPaikeday = "";
                        $scope.constants.conflictJud.room = false;
                        $scope.constants.conflictJud.teacher = false;

                        angular.forEach($scope.constants.loopInfo.loops, function(v) { //处理时间
                            var weekArr = []; //判断week对象是否为空对象
                            for (var i in v.week) { //循环多选的星期
                                if (v.week[i]) {
                                    weekArr.push(i);
                                }
                            }
                            if (weekArr.length > 0) {
                                angular.forEach(weekArr, function(v_) {
                                    $scope.constants.postData.getDoArrangingCourses.classTemplate.classTemplateDate.push({
                                        'endTime': v.operateTime.endTime,
                                        'beginTime': v.operateTime.beginTime,
                                        'week': v_,
                                        'oneCourseTime': v.oneCourseTime
                                    })
                                })
                            } else {
                                judgeReturn = [false, '请选择星期'];
                                return;
                            }
                        })
                        if (!judgeReturn[0]) {
                            return;
                        }
                        if (!$scope.constants.loopInfo.startTime[0].startTime) {
                            judgeReturn = [false, '请选择开始日期'];
                            return;
                        }
                        if ($scope.constants.getDoArrangingCourses.type == 3 && !$scope.constants.getDoArrangingCourses.num) {
                            judgeReturn = [false, '请输入课次数量'];

                        }
                        if ($scope.constants.getDoArrangingCourses.type == 2 && !$scope.constants.loopInfo.endTime[0].endTime) {
                            judgeReturn = [false, '请选择结束时间'];
                        }
                        if (!judgeReturn[0]) {
                            $scope.Fns.checkConflict('', 'firstData');
                            return;
                        }

                        $scope.constants.postData.getDoArrangingCourses.classTemplate.beginDate = $scope.constants.loopInfo.startTime[0].startTime;
                        $scope.constants.postData.getDoArrangingCourses.classTemplate.endDate = $scope.constants.loopInfo.endTime[0].endTime;
                        var param = angular.copy($scope.constants.postData.getDoArrangingCourses);
                        if ($scope.constants.getDoArrangingCourses.type == 2) {
                            param.num = undefined;
                            param.type = undefined;
                        } else if ($scope.constants.getDoArrangingCourses.type == 3) {
                            param.num = $scope.constants.getDoArrangingCourses.num;
                            param.type = $scope.constants.getDoArrangingCourses.type;
                        }

                        //当条件满足时，触发请求接口计算预排课日期或课次
                        $.hello({
                            url: CONFIG.URL + "/api/oa/lesson/getDoArrangingCourses",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(res) {
                                if (res.status == 200) {
                                    if (res.context.arrangingCourses && res.context.arrangingCourses.length > 0) {
                                        $scope.constants.maxPaikeday = res.context.arrangingCourses[res.context.arrangingCourses.length - 1].arrangingCoursesBeginDate;
                                    }
                                    $scope.constants.maxkeci = res.context.allTimes;
                                    $scope.Fns.checkConflict('', 'firstData');
                                }
                            }
                        });
                    }
                    //              getClassModel: function(id, fn) {   //获取班级排课模板
                    //                  $.hello({
                    //                      url: CONFIG.URL + '/api/oa/class/getClassModel',
                    //                      type: "get",
                    //                      data: {'classId': id},
                    //                      success: function(res) {
                    //                          if (res.status == 200) {
                    //                              console.log(res);
                    //                              $scope.constants.loopInfo.loops = [];
                    //                              if(res.context.length > 0) {
                    //                                  angular.forEach(res.context, function(v) {
                    //                                      var weekArr = {};
                    //                                      angular.forEach(v.weekList, function(v_) {
                    //                                          weekArr[v_] = true;
                    //                                      })
                    //                                      $scope.constants.loopInfo.loops.push({
                    //                                          operateTime: {"beginTime": v.beginTime, "endTime": v.endTime},
                    //                                          week: weekArr,
                    //                                          oneCourseTime: v.courseHours,
                    //                                      })
                    //                                  })
                    //                              } else {
                    //                                  $scope.constants.loopInfo.loops = [{
                    //                                      operateTime: {"beginTime": "07:30", "endTime": "09:00"},
                    //                                      week: {1:true},
                    //                                      oneCourseTime: "1"
                    //                                  }]
                    //                              }
                    //                              if(fn)fn(); //用于回调检测冲突
                    //                          }
                    //                      }
                    //                  });
                    //              }

            };
            (function() {
                //清空上次打开的默认数据
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                //试图排课点击进来
                if (props.tdData_) {
                    //单次
                    $scope.constants.data[0].data = props.tdData_.date;
                    //循环
                    $scope.constants.loopInfo.startTime[0].startTime = props.tdData_.date;
                    $scope.constants.loopInfo.loops[0].week['1'] = false;
                    $scope.constants.loopInfo.loops[0].week[props.tdData_.week] = true;
                    if (props.tdData_.time) {
                        $scope.constants.operateTime.beginTime = props.tdData_.time;
                        $scope.constants.operateTime.endTime = compareTime_(timeHandle_(props.tdData_.time, 1, 6), '23:55') == 1 ? '23:55' : timeHandle_(props.tdData_.time, 1, 6);
                        $scope.constants.loopInfo.loops[0].operateTime.beginTime = props.tdData_.time;
                        $scope.constants.loopInfo.loops[0].operateTime.endTime = compareTime_(timeHandle_(props.tdData_.time, 1, 6), '23:55') == 1 ? '23:55' : timeHandle_(props.tdData_.time, 1, 6);
                    }
                    if (props.tdData_.shopTeacherId) {
                        $scope.constants.teacherId = props.tdData_.shopTeacherId;
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['_teacher1'](props.tdData_.teacherName);
                        });
                    }
                    if (props.tdData_.classRoomId) {
                        $scope.constants.classRoomId = props.tdData_.classRoomId;
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['_room'](props.tdData_.classRoomName);
                        });
                    }
                    if (props.tdData_.classId) {
                        $scope.constants.classId = props.tdData_.classId;
                        $scope.constants.courseId = props.tdData_.class_courseId
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['_class'](props.tdData_.className);
                        });
                    }
                    $scope.constants.teachingMethod = props.tdData_.teachingMethod ? props.tdData_.teachingMethod : 2;
                }
                $scope.$broadcast('_class', 'clearSearchVal');

                SERVICE.TIMEPOP.CLASS['pre_time_sel'] = $scope.Fns.changeClasstime;
                switch (props.name) {
                    case "lesson":
                        $scope.Fns.paikeShunyanFn();
                        break;
                    case "class":
                        $scope.constants.classId = props.item.classId;
                        $scope.constants.teacherId = props.item.teachers[0] ? props.item.teachers[0].shopTeacherId : '';
                        $scope.constants.classRoomId = props.item.classRoomId ? props.item.classRoomId : '';
                        $scope.constants.teachingMethod = props.item.course ? props.item.course.teachingMethod : 2;
                        if (props.title == '快速排课') {
                            screen_setDefaultField($scope, function() {
                                $scope.screen_goReset['_class'](props.item.className);
                            });
                        };
                        //默认的班级排课规则
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/getClassModel",
                            type: "get",
                            data: { 'classId': props.item.classId },
                            success: function(res) {
                                if (res.status == 200) {
                                    if (res.context.length > 0) {
                                        $scope.constants.loopInfo.loops = [];
                                        angular.forEach(res.context, function(val_1) {
                                            var w1_ = val_1['week'].split(','),
                                                w2_ = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };
                                            angular.forEach(w1_, function(val_2) {
                                                w2_[val_2] = true;
                                            });
                                            $scope.constants.loopInfo.loops.push({
                                                'oneCourseTime': 1,
                                                'operateTime': { 'beginTime': val_1.beginTime, 'endTime': val_1.endTime },
                                                'week': w2_,
                                            });
                                        });
                                        $scope.Fns.checkConflict('', 'needData'); //调用该方法然后在填充默认数据方法里填充需要的数据会自动选上需要填充的教室和老师
                                    };
                                }
                            }
                        });
                        break;
                    case "listen":
                        $scope.Fns.getClassTeacherList();
                        //                      $scope.Fns.getcourseList(); $scope.isCourse = true; 
                        //                      screen_setDefaultField($scope, function() {
                        //                          $scope.screen_goReset['_listen']("请选择课程");
                        //                      });
                        break;
                    case "leave":
                        $scope.Fns.getcourseList();
                        $scope.isCourse = true;
                        $scope.Fns.getClassTeacherList();
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['_leave']("请选择课程");
                        });
                        break;
                    case "student":
                        $scope.constants.classId = props.item.classId;
                        $scope.constants.courseId = props.course.course.courseId;
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['_class'](props.item.className);
                        });
                        $scope.constants.teachingMethod = props.course.course.teachingMethod;
                        //默认的班级排课规则
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/getClassModel",
                            type: "get",
                            data: { 'classId': props.item.classId },
                            success: function(res) {
                                if (res.status == 200) {
                                    if (res.context.length > 0) {
                                        $scope.constants.loopInfo.loops = [];
                                        angular.forEach(res.context, function(val_1) {
                                            var w1_ = val_1['week'].split(','),
                                                w2_ = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false };
                                            angular.forEach(w1_, function(val_2) {
                                                w2_[val_2] = true;
                                            });
                                            $scope.constants.loopInfo.loops.push({
                                                'oneCourseTime': 1,
                                                'operateTime': { 'beginTime': val_1.beginTime, 'endTime': val_1.endTime },
                                                'week': w2_,
                                            });
                                        });
                                        $scope.Fns.checkConflict('', 'needData'); //调用该方法然后在填充默认数据方法里填充需要的数据会自动选上需要填充的教室和老师
                                    };
                                }
                            }
                        });
                        break;
                    case "classAffair":
                        break;
                };
                if (props.title == '排课变更') {
                    $scope.constants.teachingMethod = props.item.course ? props.item.course.teachingMethod : 2;
                    $scope.Fns.update(props.item);
                };
                $scope.Fns.getclassList(); //获取班级列表
                $scope.Fns.get_packageList(); //获取班级列表
                $scope.Fns.getclassroomList(); //获取教室列表
                $scope.Fns.getcoursethemeList($scope.constants.courseId); //获取上课主题列表
                //新增班级之后的回调
                $scope.$on('newAddClass_', function(val, id) {
                    $scope.Fns.getclassList(id);
                });
                $scope.$on('addNewTheme', function() { $scope.Fns.getcoursethemeList($scope.constants.courseId); });
                $scope.$on('addNewClassroom', function() { $scope.Fns.getclassroomList(); });
            })();

            $scope.$on('to_course', function(event, data) {
                if (JSON.parse(data).wrapper) {
                    $scope.Fns.layerRenger(JSON.parse(data))
                }
            });

            angular.forEach(['补课学员', '试听学员'], function(value) {
                $scope.$on(value, function(event, data) {
                    $scope.constants.selectMakeupStud = data;
                });
            });

            //循环排课上课时间，开始日期，结束日期或课次数量变化时重新计算结束方式后面预排课日期或课次最大数量
            //变化时重新检测教室和主教老师冲突
            $scope.$watch("constants.loopInfo.loops", function(n, o) {
                if (n === o || n == undefined || !n) return;
                $scope.Fns.watchFun();
            }, true);
            $scope.$watch("constants.loopInfo.startTime[0].startTime", function(n, o) {
                if (n === o) return;
                $scope.Fns.watchFun();
            }, true);
            $scope.$watch("constants.getDoArrangingCourses.num", function(n, o) {
                console.log(n);
                $scope.constants.maxPaikeday = "";
                if (n === o) return;
                if ($scope.constants.getDoArrangingCourses.type == 3) {
                    $scope.Fns.watchFun();
                }
            }, true);
            $scope.$watch("constants.loopInfo.endTime[0].endTime", function(n, o) {
                $scope.constants.maxkeci = 0;
                if (n === o) return;
                if ($scope.constants.getDoArrangingCourses.type == 2) {
                    $scope.Fns.watchFun();
                }
            }, true);
            //单次排课上课日期和上课时间变化，检测教室和主教老师冲突
            $scope.$watch("constants.data[0].data", function(n, o) {
                if (n === o || n == undefined || !o) return; //防止第一次重复监听
                $scope.Fns.checkConflict('', 'firstData');
            }, true);
            $scope.$watch("constants.operateTime", function(n, o) {
                if (n === o || n == undefined || !o) return; //防止第一次重复监听
                $scope.Fns.checkConflict('', 'firstData');
            }, true);
        }
    })
});