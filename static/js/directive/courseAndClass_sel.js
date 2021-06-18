//选择课程
define(['laydate'], function(laydate) {
    creatPopup({
        el: 'courseSel',
        openPopupFn: 'courseClassSel_popup',
        htmlUrl: './templates/popup/courseAndClass_sel.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state, $sce, $rootScope) {
            console.log(props);
            var pagerRender = false,
                start = 0,
                eachPage = localStorage.getItem('courseClassSel') ? localStorage.getItem('courseClassSel') : 10; //页码初始化
            var $searchName, $searchType, $courseType, $classType; //课程列表筛选项
            var $courseId, $class_status, $class_type, $class_weekId, $year, $term, $course_orderName = "course_name",
                $course_orderType = "asc",
                $class_orderName = "class_name",
                $class_orderType = "asc",
                $goods_orderName = "goods_name",
                $goods_orderType = "asc",
                $coursepackage_orderName = "course_package_name",
                $coursepackage_orderType = "asc",
                $class_teacher; //班级列表筛选项
            var $paikeCourseId, $paikeClassId, $paikeTeacherId, $paikeThemeId, $paikeClass_type, $paike_week; //排课课程列表筛选项
            var $discountType, $userScope, $productId; //添加优惠券筛选选项
            $scope.isFull = $scope.unFull = undefined;
            $scope.currentClass = false;
            $scope.compareCourse = false;
            $scope.compareCourse1 = false;
            $scope.compareType = false;
            $scope.compareType1 = false;
            init();

            function init() {
                props.oldClassId = props.oldClassId ? props.oldClassId.join(',') : '';
                $scope.propsData = props;
                $scope.choseType = props.type;
                $scope.warnTipShow = props.name == 'coupons' && props.callBackName == '优惠券-添加优惠券'; //是否显示warntip
                $scope.courseList = []; //课程列表
                $scope.classList = []; //班级列表
                $scope.paikeCourseList = []; //排课课程列表
                $scope.screen_ThemeList = []; //上课主题列表
                initScreenData(); //清空筛选
                $scope.isScreen = true; //班级是否固定不让筛选
                $scope.isTeachScreen = true; //班级是否固定不让筛选
                $scope.isCourseScreen = true; //课程是否固定不让筛选
                $scope.isClassScreen = true; //班级是否固定不让筛选
                $scope.isCourseTypeScreen = true; //排课类型是否固定不让筛选
                $scope.isThemeScreen = true; //上课主题是否显示
                $scope.screen_years = getFrom2017(true,8); //学年
                for (var i in $scope.screen_goReset) { //重置所有筛选
                    $scope.screen_goReset[i]();
                }
                $scope.classType = [
                    { name: '正式课', value: '0' },
                    { name: '试听课', value: '1' },
                    { name: '补课课', value: '2' },
                    { name: '活动课', value: '3' },
                ];
                $scope.screen_typeList = [
                    { name: '全部', value: null },
                    { name: '代金券', value: '1' },
                    { name: '折扣券', value: '2' },
                ];
                $scope.screen_userList = [
                    { name: '不限', value: '0' },
                    //                  {name:'新学员',value:'1'},
                    { name: '老学员', value: '2' },
                ];
                $scope.screen_goodsList = [
                    { name: '不限', value: '0' },
                    { name: '指定商品', value: '1' },
                ];
                $scope.screen_weekList = [
                    { name: "周一", id: "1" },
                    { name: "周二", id: "2" },
                    { name: "周三", id: "3" },
                    { name: "周四", id: "4" },
                    { name: "周五", id: "5" },
                    { name: "周六", id: "6" },
                    { name: "周日", id: "7" },
                ];
                if (props.name == 'course') {
                    $scope.isformActivity = (props.form && props.form == "activity") && checkAuthMenuById(47); //来自活动且有课程设置权限\n
                    if ($scope.isformActivity) {
                        $scope.toAddCourse = function() {
                            window.$rootScope.yznOpenPopUp($scope, 'course-pop', "course_popup", "1060px", { page: "courseList", addOrEdit: "add", callBackName: "课程筛选器--新增课程", item: {} });
                            //                          $scope.$parent.openAddCourse("course_addPop .course_shade_addcourse","1060px",{page:"courseList",addOrEdit:"add",callBackName:"课程筛选器--新增课程",item:{}});
                        }
                    }
                    getCourseList(0);
                } else if (props.name == 'class') {
                    setTimeout(function() {
                        if ($scope.screen_goReset['课程']) {
                            $scope.screen_goReset['课程']();
                        }
                        if (props.screen_classType) {
                            $class_type = props.screen_classType;
                        }
                        if (props.item) {
                            $courseId = props.item.courseId;
                            $scope.screen_goReset['课程'](props.item.courseName);
                            $scope.isScreen = false;
                        }
                        if (props.shopTeacherId) {
                            $scope.isTeachScreen = false;
                            $class_teacher = props.shopTeacherId;
                            $scope.screen_goReset['老师'](props.teacherName);
                        }
                        if ($scope.isScreen) {
                            getScreen_courseList();
                        }
                        getTermList();
                        getScreen_teacherList();
                        getClassList(0);
                    })
                } else if (props.name == 'paikeCourse') {
                    $year = $term = undefined;
                    getTermList();
                    if (!props.item || !props.item.course.courseId) { //此接口返回过慢导致数据覆盖
                        getScreen_classList();
                    }
                    getScreen_teacherList();

                    laydate.render({
                        elem: '#screen_searchTime', //指定元素
                        range: '到',
                        isRange: true,
                        done: function(value) {
                            $scope.screen_searchTime = value;
                            pagerRender = false;
                            $paikeCourseId = $scope.propsData.item ? $scope.propsData.item.course.courseId : undefined;
                            // $year = $scope.propsData.schoolYear ? $scope.propsData.schoolYear : undefined;
                            // $term = $scope.propsData.schoolTermId ? $scope.propsData.schoolTermId : undefined;
                            getPaikeCourseList(0);
                        }
                    });
                    setTimeout(function() {
                        switch (props.deleteType) {
                            case "1":
                                $scope.isCourseScreen = false;
                                $scope.classType = [
                                    { name: '正式课', value: '0' },
                                    { name: '补课课', value: '2' },
                                ];
                                $paikeClass_type = "0,2";
                                break;
                            case "2":
                                $scope.isCourseScreen = false;
                                $scope.classType = [
                                    { name: '正式课', value: '0' },
                                    { name: '试听课', value: '1' },
                                ];
                                $paikeClass_type = "0,1";
                                break;
                            case "1,2":
                                $scope.isCourseTypeScreen = false;
                                $paikeClass_type = "0";
                                break;
                            default:
                                break;
                        }

                        if (props.item) {
                            $paikeCourseId = props.item.course.courseId;
                            $scope.screen_goReset['选择课程'](props.item.course.courseName);
                            $year = props.schoolYear ? props.schoolYear : undefined;
                            $term = props.schoolTermId ? props.schoolTermId : undefined;
                            getScreen_classList($paikeCourseId);
                            if (props.item.arrangingCoursesTheme) {
                                $paikeThemeId = props.item.arrangingCoursesTheme.courseThemeId;
                                $scope.screen_goReset['选择上课主题'](props.item.arrangingCoursesTheme.courseThemeName);
                            } else {
                                $scope.isThemeScreen = false;
                            }
                            if (props.schoolYear && props.schoolTermName) {
                                $scope.screen_goReset['学年']($year);
                                $scope.screen_goReset['学期'](props.schoolTermName);
                            }
                            getScreen_themeList($paikeCourseId);
                            if (props.item.course.teachingMethod == 1) {
                                switch (props.deleteType) {
                                    case "1":
                                        $scope.isCourseTypeScreen = false;
                                        $scope.screen_goReset['选择排课类型']('补课课');
                                        $paikeClass_type = "2";
                                        break;
                                    case "2":
                                        $scope.isCourseTypeScreen = false;
                                        $scope.screen_goReset['选择排课类型']('试听课');
                                        $paikeClass_type = "1";
                                        break;
                                    default:
                                        break;
                                }
                            }
                            $paikeClassId = props.item.classId ? props.item.classId : undefined;
                            if ($paikeClassId) {
                                $scope.isClassScreen = false;
                                $scope.isCourseScreen = false;
                                $scope.screen_goReset['选择班级'](props.item.className);
                            }
                        }
                        if ($scope.isCourseScreen) {
                            getScreen_courseList();
                        }
                        getPaikeCourseList(0);
                    }, 100);
                } else if (props.name == 'goods') {
                    getGoodsList(0);
                } else if (props.name == 'coupons') {
                    $scope.sel_coupon_all = false;
                    getCouponsList(0);
                } else if (props.name == 'coursePackage') { //课程包
                    getCoursePackageList(0);
                } else if (props.name == 'courseTitle') {
                    $scope.sel_courseTl_all = false;
                    getCourseTitleLst();
                } else if (props.name == 'addcourseTitle') {
                    addCourseTheme();
                };
                $scope.searchData = { courseName: '课程名称' };
                $scope.searchData_ = { className: '班级名称' };
                $scope.searchData_package = { courseName: '课程包名称' };
                $scope.searchData_goods = { goodsName: '学杂名称' };
                $scope.searchData_coupons = { couponsName: '优惠券名称' };
                $scope.screen_courseList = []; //获取筛选栏的全部课程
                $scope.SearchData = SearchData;
                $scope.Enterkeyup = SearchData;
                $scope.sel_course = sel_course; //选择预约课程
                $scope.sel_class = sel_class; //选择预约班级
                $scope.sel_goods = sel_goods; //选择学杂
                $scope.sel_coupons = sel_coupons; //选择优惠券
                $scope.sel_courseTl = sel_courseTl; //选择上课主题
                $scope.addCourseTitle = addCourseTitle; //新增上课主题
                $scope.addCourseTheme = addCourseTheme; //新增上课主题
                $scope.deleteCourseTitle = deleteCourseTitle; //删除上课主题
                $scope.sel_screenType = sel_screenType; //优惠券筛选--类型
                $scope.sel_screenUser = sel_screenUser; //优惠券筛选--用户范围
                $scope.sel_screenGoods = sel_screenGoods; //优惠券筛选--商品范围
                $scope.sel_product = sel_product; //优惠券筛选--指定商品
                $scope.checkboxAll = checkboxAll; //全选择学杂
                $scope.checkboxAll_courseTl = checkboxAll_courseTl; //全选择上课主题
                $scope.sel_paikeCourse = sel_paikeCourse; //选择预约排课课程
                $scope.sel_coursePackage = sel_coursePackage; //选择课程包
                $scope.deterSel_course = deterSel_course; //确定选择课程
                $scope.deterSel_class = deterSel_class; //确定选择班级
                $scope.deterSel_paikeCourse = deterSel_paikeCourse; //确定选择排课课程
                $scope.deterSel_goods = deterSel_goods; //确定选择学杂
                $scope.deterSel_coupons = deterSel_coupons; //确定选择优惠券
                $scope.deterSel_courseTl = deterSel_courseTl; //确定选择上课主题
                $scope.deterSel_coursePackage = deterSel_coursePackage; //确定选择课程包
                $scope.screen_courseType = screen_courseType;
                $scope.screen_chargeType = screen_chargeType;
                $scope.screen_chargeCourse = screen_chargeCourse;
                $scope.sel_classType = sel_classType; //筛选栏-选择班级类型
                $scope.sel_screenCourse = sel_screenCourse; //筛选栏-选择班级课程
                $scope.sel_screenClass = sel_screenClass; //筛选栏-选择班级
                $scope.sel_screenTeacher = sel_screenTeacher; //筛选栏-选择班级
                $scope.sel_screenWeek = sel_screenWeek; //筛选栏-选择上课星期
                $scope.sel_screenTheme = sel_screenTheme; //筛选栏-上课主题
                $scope.changeFull_1 = changeFull_1; //班级选择--满班
                $scope.changeFull_2 = changeFull_2; //班级选择--未满班
                $scope.changeCurrent = changeCurrent; //班级选择--当前在课班级
                $scope.sel_week = sel_week; //筛选栏-选择排课课程星期
                $scope.sel_changeYear = sel_changeYear; //学年筛选
                $scope.sel_changeTerm = sel_changeTerm; //学期筛选
                $scope.mouseoverCoupon = mouseoverCoupon;
                $scope.mouseleaveCoupon = mouseleaveCoupon;
                $scope.params_course = [];
                $scope.params_class = [];
                $scope.params_paikeCourse = [];
                $scope.params_coursePackage = [];
                $scope.params_goods = [];
                $scope.params_coupons = [];
                $scope.params_courseTl = [];
                $scope.course_onReset = function() {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    //                  $scope.screen_goReset['课程类型']();
                    //                  $scope.screen_goReset['收费模式']();
                    initScreenData();
                    getCourseList(0);
                }
                $scope.class_onReset = function() {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    //                  $scope.screen_goReset['班级类型']();
                    $scope.screen_goReset['课程']();
                    $scope.screen_goReset['year_class']();
                    $scope.screen_goReset['term_class']();
                    $scope.screen_goReset['老师']();
                    $scope.screen_goReset['上课星期']();
                    console.log($scope.screen_goReset)
                    initScreenData();
                    if (props.screen_classType) {
                        $class_type = props.screen_classType;
                    }
                    if (props.item) {
                        $courseId = props.item.courseId;
                        $scope.screen_goReset['课程'](props.item.courseName);
                        $scope.isScreen = false;
                    }
                    if (props.shopTeacherId) {
                        $scope.isTeachScreen = false;
                        $class_teacher = props.shopTeacherId;
                        $scope.screen_goReset['老师'](props.teacherName);
                    }
                    if ($scope.isScreen) {
                        getScreen_courseList();
                    }
                    getClassList(0);
                }
                $scope.goods_onReset = function() {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    initScreenData();
                    getGoodsList(0);
                }
                $scope.coupons_onReset = function() {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    $scope.screen_goReset['类型']();
                    $scope.screen_goReset['适用学员']();
                    $scope.screen_goReset['适用商品']();
                    $scope.screen_goReset['选择商品']();
                    initScreenData();
                    getCouponsList(0);
                }
                $scope.paikeCourse_onReset = function() {
                        $scope.kindSearchOnreset(); //调取app重置方法
                        $scope.screen_goReset['选择排课类型']();
                        $scope.screen_goReset['选择课程']();
                        $scope.screen_goReset['选择班级']();
                        $scope.screen_goReset['选择老师']();
                        $scope.screen_goReset['星期']();
                        $scope.screen_goReset['选择上课主题']();
                        initScreenData();
                        //                  if(props.deleteType == 1){
                        //                      $paikeClass_type = "0,2";
                        //                  }else{
                        //                      $paikeClass_type = "0,1";
                        //                  }
                        //                  if(props.deleteType == "1,2"){
                        //                      $paikeClass_type = "0";
                        //                  }
                        switch (props.deleteType) {
                            case "1":
                                $paikeClass_type = "0,2";
                                break;
                            case "2":
                                $paikeClass_type = "0,1";
                                break;
                            case "1,2":
                                $paikeClass_type = "0";
                                break;
                            default:
                                break;
                        }
                        if (props.item) {
                            $scope.screen_goReset['选择课程'](props.item.course.courseName);
                            $paikeCourseId = props.item.course.courseId;
                            $year = props.schoolYear ? props.schoolYear : undefined;
                            $term = props.schoolTermId ? props.schoolTermId : undefined;
                            //                      $year = props.item && props.item.classInfo?props.item.classInfo.schoolYear:undefined;
                            //                      $term = props.item && props.item.classInfo?props.item.classInfo.schoolTermId:undefined;
                            getScreen_classList($paikeCourseId);
                            if (props.item.arrangingCoursesTheme) {
                                $paikeThemeId = props.item.arrangingCoursesTheme.courseThemeId;
                                $scope.screen_goReset['选择上课主题'](props.item.arrangingCoursesTheme.courseThemeName);
                            } else {
                                $scope.isThemeScreen = false;
                            }
                            if (props.schoolYear && props.schoolTermName) {
                                $scope.screen_goReset['学年']($year);
                                $scope.screen_goReset['学期'](props.schoolTermName);
                            }
                            if (props.item.course.teachingMethod == 1) {
                                //                          if(props.deleteType == 1){
                                //                              $paikeClass_type = "2";
                                //                              $scope.screen_goReset['选择排课类型']('补课课');
                                //                          }
                                //                          if(props.deleteType == 2){
                                //                              $paikeClass_type = "1";
                                //                              $scope.screen_goReset['选择排课类型']('试听课');
                                //                          }
                                switch (props.deleteType) {
                                    case "1":
                                        $scope.screen_goReset['选择排课类型']('补课课');
                                        $paikeClass_type = "2";
                                        break;
                                    case "2":
                                        $scope.screen_goReset['选择排课类型']('试听课');
                                        $paikeClass_type = "1";
                                        break;
                                    default:
                                        break;
                                }
                            }
                            $paikeClassId = props.item.classId ? props.item.classId : undefined;
                            if ($paikeClassId) {
                                $scope.isClassScreen = false;
                                $scope.isCourseScreen = false;
                                $scope.screen_goReset['选择班级'](props.item.className);
                            }
                        } else {
                            getScreen_classList();
                        }
                        getScreen_teacherList();
                        getPaikeCourseList(0);
                    }
                    //搜索类型
                $scope.courseType = [{ name: '舞蹈', value: '1' }, { name: '美术', value: '2' }, { name: '数学', value: '3' }, { name: '语文', value: '4' }, { name: '传统文化', value: '5' }, { name: '外语', value: '6' }, { name: '声乐', value: 7 }, { name: '乐器', value: '8' }, { name: '主持', value: '9' }, { name: '益智', value: '10' }, { name: '武术', value: '11' }, { name: '托班', value: '12' }, { name: '其他', value: '13' }];

                $scope.weekData = [
                    { name: '星期一', value: '1' },
                    { name: '星期二', value: '2' },
                    { name: '星期三', value: '3' },
                    { name: '星期四', value: '4' },
                    { name: '星期五', value: '5' },
                    { name: '星期六', value: '6' },
                    { name: '星期日', value: '7' },
                ];
                $scope.courseTheadClick = courseTheadClick; //课程名称排序
                $scope.classTheadClick = classTheadClick; //开班时间排序
                $scope.goodsTheadClick = goodsTheadClick; //学杂排序
                $scope.coursepackageTheadClick = coursepackageTheadClick; //课程包名称排序

                SERVICE.ADDCOURSE.FROMPAGE["课程筛选器--新增课程"] = reloadCourseList; //监听新增课程后的回调

            };

            function reloadCourseList() {
                $course_orderType = undefined;
                pagerRender = false;
                getCourseList("0");
            }
            //处理班级上课时间数据
            function dateArrToStr(arr) {
                var str = '';
                angular.forEach(arr, function(v) {
                    str += "每" + returnweek(v.week) + v.beginTime + "-" + v.endTime + "  ";
                });
                return str;
            }
            //指定商品列表
            function getproduct() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/product/listProduct',
                    type: 'get',
                    data: { "pageType": "0", 'productStatus': 1 },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.screen_product = data.context;
                        }
                    }
                });
            }
            //重置信息
            function initScreenData() {
                $scope.screen_searchTime = "";
                //              $scope.screen_searchTime = yznDateFormatYMd(new Date())+" 到 "+yznDateFormatYMd(new Date());
                $scope.kindSearchOnreset(); //调取app重置方法
                $searchName = undefined;
                $searchType = undefined;
                $courseType = undefined;
                $classType = undefined;
                $courseId = undefined;
                $year = undefined;
                $term = undefined;
                $class_status = undefined;
                $class_type = undefined;
                $class_weekId = undefined;
                $paikeCourseId = undefined;
                $paikeClassId = undefined;
                $paikeTeacherId = undefined;
                $paikeThemeId = undefined;
                $paikeClass_type = undefined;
                $course_orderType = "asc";
                $course_orderName = "course_name";
                $class_orderType = "asc";
                $class_orderName = "class_name";
                $goods_orderType = "asc";
                $goods_orderName = "goods_name";
                $coursepackage_orderType = "asc";
                $coursepackage_orderName = "course_package_name";
                $paike_week = undefined;
                $discountType = undefined;
                $userScope = undefined;
                $productId = undefined;
                $class_teacher = undefined;
                pagerRender = false;
                $scope.isFull = $scope.unFull = undefined;
                $scope.currentClass = false;
                $scope.compareCourse = false;
                $scope.compareCourse1 = false;
                $scope.compareType = false;
                $scope.compareType1 = false;
                $scope.productScope = undefined;
            }
            //获取课程列表
            function getCourseList(start) {
                var data = {
                    'start': start,
                    'count': eachPage,
                    'courseTypeId': $courseType,
                    'searchType': $searchType,
                    'searchName': $searchName,
                    'goodsStatus': '1',
                    'packageStatus': '1',
                    'courseType': $scope.compareCourse ? "0" : $scope.compareCourse1 ? "1" : undefined,
                    'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                    'orderTyp': $course_orderType,
                    'orderName': $course_orderName,
                }
                if (!$course_orderType) {
                    data["orderTyp"] = undefined;
                    data["orderName"] = undefined;
                }
                if (props.courseType) {
                    data['courseType'] = props.courseType;
                }
                if (props.teachingMethod) {
                    data['teachingMethod'] = props.teachingMethod;
                }
                if (props.shopId) {
                    data['shopId'] = props.shopId;
                }
                // 是否排除续费预警课程 1 是
                if (props.warnCourseStatus) {
                    data['warnCourseStatus'] = props.warnCourseStatus;
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCoursesList",
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.courseList = res.context.items;
                            renderPager(res.context.totalNum);
                            //                          $scope.params_course = [];
                            if ($scope.choseType == 'checkbox') repeatLists($scope.courseList, $scope.params_course, 'courseId');

                            //如果是报名弹框进来的需要显示本课程是否是续报
                            if (props.contractList) {
                                angular.forEach(props.contractList, function(v1) {
                                    angular.forEach($scope.courseList, function(v2) {
                                        if (v1.courseId == v2.courseId) v2.signType = 2;
                                    })
                                })
                            }
                            console.log('课程列表', $scope.courseList);
                        };
                    }
                })
            }
            //获取班级列表
            function getClassList(start) {
                console.log(props);
                var data = {
                    'start': start,
                    'count': eachPage,
                    'schoolYear': $year,
                    'schoolTermId': $term,
                    'excludedIds': props.oldClassId ? props.oldClassId : undefined,
                    'courseId': $courseId,
                    'classStatus': $class_status,
                    'classType': $class_type,
                    'searchType': $searchType,
                    'searchName': $searchName,
                    'shopTeacherId': $class_teacher ? $class_teacher : undefined,
                    'orderTyp': $class_orderType,
                    'orderName': $class_orderName,
                    'fullStatus': $scope.isFull ? "1" : $scope.unFull ? "0" : undefined,
                    'packageType': "1",
                    'bookingStatus': props.bookingStatus ? props.bookingStatus : undefined,
                    'teachingMethod': props.teachingMethod ? props.teachingMethod : undefined,
                    'excludeStudentId': props.excludeStudentId ? props.excludeStudentId : undefined,
                    'shopId':props.shopId?props.shopId:undefined,
                    'classModeStatus': 1,
                    'week': $class_weekId,
                    'studentId': $scope.currentClass ? props.studentId : undefined,
                    'activityStatus': props.activityStatus
                }

                if (!$class_orderType) {
                    data["orderTyp"] = undefined;
                    data["orderName"] = undefined;
                }
                console.log(data)
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/list",
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == '200') {
                            angular.forEach(res.context.items, function(val) {
                                var teacherArr = [];
                                if (val.teachers) {
                                    angular.forEach(val.teachers, function(val_) {
                                        if (val_) {
                                            teacherArr.push(val_.teacherName);
                                        }
                                    });
                                    val.teacherArr = teacherArr.join(';');
                                }
                                val.classTemplateDates_str = dateArrToStr(val.classTemplateDates);
                            });

                            $scope.classList = res.context.items;
                            renderPager(res.context.totalNum);
                            //                          $scope.params_class = [];
                            if ($scope.choseType == 'checkbox') repeatLists($scope.classList, $scope.params_class, 'classId');
                            console.log('班级列表', $scope.classList);
                        };
                    }
                })
            }
            //获取排课课程列表
            function getPaikeCourseList(start) {
                var data = {
                    'start': start,
                    'count': eachPage,
                    'courseId': $paikeCourseId,
                    'classId': $paikeClassId,
                    'courseType': $paikeClass_type,
                    'shopTeacherId': $paikeTeacherId,
                    'courseThemeId': $paikeThemeId,
                    'status': 0,
                    'week': $paike_week,
                    'needStudentTotal': 1,
                    //     约课时 传课程ID后不再传该字段             'teachingMethod':props.item?props.item.course.teachingMethod:undefined,
                    'excludedIds': $scope.propsData.excludedIds ? $scope.propsData.excludedIds : undefined,
                }
                if ($scope.screen_searchTime) {
                    data["beginTime"] = $scope.screen_searchTime.split(" 到 ")[0] + " 00:00:00";
                    data["endTime"] = $scope.screen_searchTime.split(" 到 ")[1] + " 23:59:59";
                }
                if ($term) {
                    data["schoolTermId"] = $term;
                }
                if ($year) {
                    data["schoolYear"] = $year;
                }
                console.log(data)
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/list",
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.paikeCourseList = res.context.items;
                            renderPager(res.context.totalNum);
                            //                          $scope.params_paikeCourse = [];
                            if ($scope.choseType == 'checkbox') repeatLists($scope.paikeCourseList, $scope.params_paikeCourse, 'arrangingCoursesId');
                            console.log('排课课程列表', $scope.paikeCourseList);
                        };
                    }
                })
            }
            //获取课程包列表
            function getCoursePackageList(start) {
                var params = {
                    'start': start,
                    'count': eachPage,
                    'coursePackageStatus': 1,
                    'searchType': 'coursePackageName',
                    'searchName': $searchName,
                    'orderTyp': $coursepackage_orderType,
                    'orderName': $coursepackage_orderName
                };
                if (!$coursepackage_orderType) {
                    params["orderTyp"] = undefined;
                    params["orderName"] = undefined;
                }
                if(props.shopId){
                    params["shopId"] = props.shopId;
                }
                for (var i in params) {
                    if (params[i] === '' || params[i] == undefined) {
                        delete params[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/listCoursePackage",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.coursePackageList = res.context.items;
                            renderPager(res.context.totalNum);
                            //                          $scope.params_coursePackage = [];
                            if ($scope.choseType == 'checkbox') repeatLists($scope.coursePackageList, $scope.params_coursePackage, 'coursePackageId');
                            console.log('课程包列表', $scope.coursePackageList);
                        }
                    }
                });
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
                            localStorage.setItem('courseClassSel', eachPage);
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        switch (props.name) {
                            case 'course':
                                getCourseList(start);
                                break;
                            case 'class':
                                getClassList(start);
                                break;
                            case 'paikeCourse':
                                getPaikeCourseList(start);
                                break;
                            case 'goods':
                                getGoodsList(start);
                                break;
                            case 'coupons':
                                getCouponsList(start);
                                break;
                            case 'coursePackage':
                                getCoursePackageList(start);
                                break;
                        }
                    }
                });
            }

            function getScreen_courseList() {
                var p = {
                    'pageType': 0,
                    'courseStatus': 1,
                    'teachingMethod': props.teachingMethod ? props.teachingMethod : undefined,
                    'shopId':props.shopId?props.shopId:undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCoursesList",
                    type: "get",
                    data: p,
                    success: function(data) {
                        if (data.status == "200") {
                            if (props.courseType == 0) {
                                var arr = [];
                                angular.forEach(data.context, function(v) {
                                    if (v.courseType != 1) {
                                        arr.push(v);
                                    }
                                });
                                $scope.screen_courseList = arr;
                            } else {
                                $scope.screen_courseList = data.context;
                            }
                        }
                    }
                });
            }
            function getConfig() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.transferStatus = data.context.transferStatus==1?true:false;
                        }
                    }
                })
            }
            function getTermList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: { pageType: 0, shopId:props.shopId?props.shopId:undefined},
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.screen_term = data.context;
                        }

                    }
                })
            }

            function getScreen_classList(id) {
                var p = {
                    pageType: "0",
                    classStatus: "1"
                };
                if (id) {
                    p["courseId"] = id;
                }
                if ($year) {
                    p["schoolYear"] = $year;
                }
                if ($term) {
                    p["schoolTermId"] = $term;
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
                if(props.shopId){
                    p["shopId"]=props.shopId;
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
            //获取上课主题列表
            function getCourseTitleLst() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                    type: "get",
                    success: function(data) {
                        if (data.status == "200") {

                            if (props.selectedData) {
                                angular.forEach(data.context, function(v) {
                                    var isRepeat = false;
                                    angular.forEach(props.selectedData, function(v_) {
                                        if (v.courseThemeId == v_.courseTheme.courseThemeId) {
                                            isRepeat = true;
                                        }
                                    });
                                    if (isRepeat) {
                                        v.hasChecked = true;
                                        $scope.params_courseTl.push(v);
                                    }
                                });
                            } else {
                                $scope.params_courseTl = [];
                            }
                            $scope.courseTlList = data.context;
                        }
                    }
                });
            }
            //筛选-排课课表星期
            function sel_week(data) {
                pagerRender = false;
                $paike_week = undefined;
                if (data) { $paike_week = data.value; }
                getPaikeCourseList(0);
            }

            function sel_changeYear(y, type) { //切换学期
                $year = y == null ? undefined : y.year;
                pagerRender = false;
                switch (type) {
                    case "class":
                        getClassList(0);
                        break;
                    case "paikeCourse":
                        getPaikeCourseList(0);
                        getScreen_classList($paikeCourseId);
                        break;
                    default:
                        break;
                }

            }

            function sel_changeTerm(t, type) { //切换学期
                $term = t == null ? undefined : t.schoolTermId;
                pagerRender = false;
                switch (type) {
                    case "class":
                        getClassList(0);
                        break;
                    case "paikeCourse":
                        getPaikeCourseList(0);
                        getScreen_classList($paikeCourseId);
                        break;
                    default:
                        break;
                }
            }
            //筛选-班级类型
            function sel_classType(data, type) {
                console.log(data)
                pagerRender = false;
                switch (type) {
                    case 'paikeCourse':
                        $paikeClass_type = undefined;
                        if (data) {
                            $paikeClass_type = data.value;
                        } else {
                            switch (props.deleteType) {
                                case "1":
                                    $paikeClass_type = "0,2";
                                    if (props.item.course.teachingMethod == 1) {
                                        $paikeClass_type = "2";
                                    }
                                    break;
                                case "2":
                                    $paikeClass_type = "0,1";
                                    if (props.item.course.teachingMethod == 1) {
                                        $paikeClass_type = "1";
                                    }
                                    break;
                                case "1,2":
                                    $paikeClass_type = "0";
                                    break;
                                default:
                                    break;
                            }
                            //                           if(props.deleteType == 1){
                            //                              $paikeClass_type="0,2";
                            //                              if(props.item.course.teachingMethod == 1){
                            //                                  $paikeClass_type = "2";
                            ////                                  $scope.screen_goReset['选择排课类型']('试听课');
                            //                              }
                            //                          }else{
                            //                              $paikeClass_type="0,1";
                            //                               if(props.item.course.teachingMethod == 1){
                            //                                  $paikeClass_type = "1";
                            ////                                  $scope.screen_goReset['选择排课类型']('试听课');
                            //                              }
                            //                          }
                            //                          if(props.deleteType == "1,2"){
                            //                              $paikeClass_type = "0";
                            //                          }
                        }
                        getPaikeCourseList(0);
                        break;
                    default:
                        $class_type = undefined;
                        if (data) {
                            $class_type = data.value
                        };
                        getClassList(0);
                };
            }
            //筛选-班级课程
            function sel_screenCourse(data, type) {
                console.log(data);
                pagerRender = false;
                switch (type) {
                    case 'paikeCourse':
                        $paikeCourseId = undefined;
                        if (data) { $paikeCourseId = data.courseId };
                        $scope.screen_goReset['选择班级']();
                        getScreen_classList($paikeCourseId);
                        getPaikeCourseList(0);
                        break;
                    case 'class_teacher': //班级列表筛选老师
                        $class_teacher = undefined;
                        if (data) { $class_teacher = data.shopTeacherId };
                        getClassList(0);
                        break;
                    default:
                        $courseId = undefined;
                        if (data) { $courseId = data.courseId };
                        getClassList(0);
                }
            }
            //筛选-班级
            function sel_screenClass(data, type) {
                pagerRender = false;
                switch (type) {
                    case 'paikeCourse':
                        $paikeClassId = undefined;
                        if (data) { $paikeClassId = data.classId };
                        $scope.screen_goReset['选择老师']();
                        getScreen_teacherList($paikeClassId);
                        getPaikeCourseList(0);
                        break;
                    default:
                        $classId = undefined;
                        if (data) { $classId = data.classId };
                }
            }
            //筛选-班级
            function sel_screenTeacher(data, type) {
                console.log(data);
                pagerRender = false;
                switch (type) {
                    case 'paikeCourse':
                        $paikeTeacherId = undefined;
                        if (data) { $paikeTeacherId = data.shopTeacherId };
                        getPaikeCourseList(0);
                        break;
                    default:
                        break;
                }
            }

            function sel_screenWeek(data) {
                if (data == null) {
                    $class_weekId = undefined;
                } else {
                    $class_weekId = data.id;
                }
                pagerRender = false;
                getClassList(0);

            }
            //筛选-上课主题
            function sel_screenTheme(data, type) {
                console.log(data);
                pagerRender = false;
                switch (type) {
                    case 'paikeCourse':
                        $paikeThemeId = undefined;
                        if (data) { $paikeThemeId = data.courseThemeId };
                        getPaikeCourseList(0);
                        break;
                    default:
                        break;
                }
            }
            //筛选-课程类型
            function screen_courseType(data) {
                if (data == null) {
                    $courseType = undefined;
                } else {
                    $courseType = data.value;
                }
                pagerRender = false;
                getCourseList(0);
            }

            function screen_chargeType(type) {
                if (type) {
                    if ($scope.compareType) {
                        $scope.compareType = true;
                        $scope.compareType1 = false;
                    }
                } else {
                    if ($scope.compareType1) {
                        $scope.compareType1 = true;
                        $scope.compareType = false;
                    }
                }
                pagerRender = false;
                getCourseList(0);
            }

            function screen_chargeCourse(type) {
                if (type) {
                    if ($scope.compareCourse) {
                        $scope.compareCourse = true;
                        $scope.compareCourse1 = false;
                    }
                } else {
                    if ($scope.compareCourse1) {
                        $scope.compareCourse1 = true;
                        $scope.compareCourse = false;
                    }
                }
                pagerRender = false;
                getCourseList(0);
            }
            //筛选搜索点击-回车
            function SearchData(data, type) {
                console.log(data);
                $searchType = data.type;
                $searchName = data.value;
                pagerRender = false;
                switch (type) {
                    case 'class':
                        getClassList(0);
                        break;
                    case 'paikeCourse':
                        getPaikeCourseList(0);
                        break;
                    case 'goods':
                        getGoodsList(0);
                        break;
                    case 'coupons':
                        getCouponsList(0);
                        break;
                    case 'coursePackage':
                        getCoursePackageList(0);
                        break;
                    default:
                        getCourseList(0);
                }
            }
            //筛选点击-开班时间
            function courseTheadClick(data) {
                console.log(data);
                $course_orderName = 'course_name';
                $course_orderType = data.sort;
                pagerRender = false;
                getCourseList(0);
            }
            //筛选点击-开班时间
            function classTheadClick(data) {
                console.log(data);
                $class_orderName = 'class_name';
                $class_orderType = data.sort;
                pagerRender = false;
                getClassList(0);
            }
            //筛选点击-学杂名称
            function goodsTheadClick(data) {
                console.log(data);
                $goods_orderName = 'goods_name';
                $goods_orderType = data.sort;
                pagerRender = false;
                getGoodsList(0);
            }
            //筛选点击-课程包名称
            function coursepackageTheadClick(data) {
                console.log(data);
                $coursepackage_orderName = 'course_package_name';
                $coursepackage_orderType = data.sort;
                pagerRender = false;
                getCoursePackageList(0);
            }
            //班级选择--满班未满班
            function changeFull_1() {
                if ($scope.isFull) {
                    $scope.unFull = false;
                }
                pagerRender = false;
                getClassList(0);
            }

            function changeFull_2() {
                if ($scope.unFull) {
                    $scope.isFull = false;
                }
                pagerRender = false;
                getClassList(0);
            }

            function changeCurrent() {
                pagerRender = false;
                getClassList(0);
            }


            function sel_screenType(n) {
                $discountType = n != null ? n.value : undefined;
                pagerRender = false;
                getCouponsList(0);
            }

            function sel_screenUser(n) {
                $userScope = n != null ? n.value : undefined;
                pagerRender = false;
                getCouponsList(0);
            }

            function sel_screenGoods(n) {
                $scope.productScope = n != null ? n.value : undefined;
                if ($scope.productScope == 1) {
                    getproduct();
                } else {
                    $productId = undefined;
                }
                pagerRender = false;
                getCouponsList(0);
            }
            //选择指定商品
            function sel_product(d) {
                pagerRender = false;
                $productId = d ? d.productId : null;
                getCouponsList(0);
            }

            //选择课程
            function sel_course(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_course = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_course, function(val, ind) {
                            if (data.courseId == val.courseId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_course.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_course.push(data);
                    }
                }
            }
            //选择班级
            function sel_class(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_class = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_class, function(val, ind) {
                            if (data.classId == val.classId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_class.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_class.push(data);
                    }
                }
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
            //选择课程包
            function sel_coursePackage(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_coursePackage = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_coursePackage, function(val, ind) {
                            if (data.classId == val.classId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_coursePackage.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_coursePackage.push(data);
                    }
                }
            }

            function checkboxAll(x, list, type) {
                angular.forEach(list, function(val) {
                    if (x) {
                        val.hasChecked = true;
                    } else {
                        val.hasChecked = false;
                    }
                });
                switch (type) {
                    case 'goods':
                        if (x) {
                            $scope.params_goods = list;
                        } else {
                            $scope.params_goods = [];
                        }
                        break;
                    case 'coupons':
                        if (x) {
                            $scope.params_coupons = list;
                        } else {
                            $scope.params_coupons = [];
                        }

                        break;
                    default:
                        break;
                }

            }
            //选择学杂
            function sel_goods(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_goods = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_goods, function(val, ind) {
                            if (data.goodsId == val.goodsId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_goods.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_goods.push(data);
                    }
                }
            }
            //选择学杂
            function sel_coupons(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_coupons = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_coupons, function(val, ind) {
                            if (data.couponId == val.couponId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_coupons.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_coupons.push(data);
                    }
                }
            }
            //选择上课主题
            function checkboxAll_courseTl(d, list) {
                angular.forEach(list, function(val) {
                    if (d) {
                        val.hasChecked = true;
                    } else {
                        val.hasChecked = false;
                    }
                });
                if (d) {
                    $scope.params_courseTl = list;
                } else {
                    $scope.params_courseTl = [];
                }
            }

            function sel_courseTl(data, evt) {
                var index_ = [false, null];
                if ($scope.choseType == 'radio') { //单选以及多选判断
                    $scope.params_courseTl = data;
                } else {
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.params_courseTl, function(val, ind) {
                            if (data.goodsId == val.goodsId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.params_courseTl.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.params_courseTl.push(data);
                    }
                }
            }

            function addCourseTitle(type, x) {
                $scope.courseTl_type = type;
                if (type == 'add') {
                    $scope.courseTlInfo = {
                        courseThemeName: ""
                    };
                } else {
                    $scope.courseTlInfo = angular.copy(x);
                }
                $scope.goPopup('addOreditCourseTl', '560px');
                $scope.courseTl_confirm = courseTl_confirm; //新增或者编辑上课主题确认按钮

                function courseTl_confirm() {
                    var url, param = {
                        courseThemeName: $scope.courseTlInfo.courseThemeName
                    };
                    if ($scope.courseTl_type == 'add') {
                        url = "/api/oa/course/courseTheme/add";
                    } else {
                        url = "/api/oa/course/courseTheme/update";
                        param["courseThemeId"] = $scope.courseTlInfo.courseThemeId;
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == "200") {
                                getCourseTitleLst();
                                if (props.fromPage == 'paike') {
                                    if (SERVICE.COURSEANDCLASS.COURSETITLE[props.callBackName]) {
                                        SERVICE.COURSEANDCLASS.COURSETITLE[props.callBackName](data);
                                    };
                                    $scope.$emit(props.callBackName, data);
                                }
                                $scope.closePopup('addOreditCourseTl');
                            }
                        }
                    });
                }
            }

            function addCourseTheme() {
                $scope.courseTlInfo = {
                    courseThemeName: ""
                };
                $scope.courseTl_confirm = courseTl_confirm; //新增或者编辑上课主题确认按钮

                function courseTl_confirm() {
                    var param = {
                        courseThemeName: $scope.courseTlInfo.courseThemeName,
                        courseId: props.courseThemeId ? props.courseThemeId : undefined,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/courseTheme/add",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == "200") {
                                if (props.fromPage == 'paike') {
                                    $scope.$emit('addNewTheme');
                                }
                                $scope.closePopup('addOreditCourseTl');
                            }
                        }
                    });
                }
            }

            function deleteCourseTitle(x) {
                var isDelect = layer.confirm("是否删除上课主题，删除后不可恢复", {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/courseTheme/delete",
                        type: "post",
                        data: JSON.stringify({ courseThemeId: x.courseThemeId }),
                        success: function(res) {
                            if (res.status == 200) {
                                layer.close(isDelect);
                                getCourseTitleLst();
                                layer.msg('操作成功', { icon: 1 });
                            }
                        }
                    });

                }, function() {
                    layer.close(isDelect);
                })
            }
            //点击确定按钮把数据返回给服务-课程
            function deterSel_course() {
                var data = $scope.params_course;
                if (!data || data.length == 0) {
                    layer.msg('请选择课程');
                } else {
                    if (SERVICE.COURSEANDCLASS.COURSE[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.COURSE[props.callBackName](data);
                    };
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('choseCourse');
                }
                manualOnresize(); //手动调用onresize
            }
            //点击确定按钮把数据返回给服务-班级
            function deterSel_class() {
                var data = $scope.params_class,
                    arr = [];
                if (!data || data.length == 0) {
                    layer.msg('请选择班级');
                } else {
                    if (props.obj) {
                        angular.forEach(data, function(v) {
                            var jud = true;
                            angular.forEach(props.obj.data[props.obj.att], function(v_) {
                                if (v.classId == v_.classId) {
                                    jud = false;
                                }
                            })
                            if (jud) {
                                arr.push(v);
                            }
                        })
                        props.obj.data[props.obj.att] = props.obj.data[props.obj.att].concat(arr);
                    }
                    if (SERVICE.COURSEANDCLASS.CLASS[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.CLASS[props.callBackName](data);
                    }
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('choseClass');
                }
            }
            //点击确定按钮把数据返回给服务-排课课程
            function deterSel_paikeCourse() {
                var data = $scope.params_paikeCourse;
                if (!data || data.length == 0) {
                    layer.msg('请选择课程');
                } else {
                    if (SERVICE.COURSEANDCLASS.PAIKECOURSE[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.PAIKECOURSE[props.callBackName](data)
                    };
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('chosePaikeCourse');
                }
            }
            //点击确定按钮把数据返回给服务-选择学杂
            function deterSel_goods() {
                var data = $scope.params_goods;
                if (!data || data.length == 0) {
                    layer.msg('请选择学杂');
                } else {
                    if (SERVICE.COURSEANDCLASS.GOODS[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.GOODS[props.callBackName](data);
                    };
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('choseGoods');
                }
                manualOnresize(); //手动调用onresize
            }
            //点击确定按钮把数据返回给服务-选择优惠券
            function deterSel_coupons() {
                var data = $scope.params_coupons;
                if (!data || data.length == 0) {
                    layer.msg('请选择学杂');
                } else {
                    if (SERVICE.COURSEANDCLASS.COUPONS[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.COUPONS[props.callBackName](data);
                    };
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('choseCoupons');
                }
                manualOnresize(); //手动调用onresize
            }
            //点击确定按钮把数据返回给服务-选择上课主题
            function deterSel_courseTl() {
                var data = $scope.params_courseTl;
                if (!data || data.length == 0) {
                    layer.msg('请选择上课主题');
                } else {
                    if (SERVICE.COURSEANDCLASS.COURSETITLE[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.COURSETITLE[props.callBackName](data);
                    };
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('courseTitle');
                }
            }
            //点击确定按钮把数据返回给服务-课程包
            function deterSel_coursePackage() {
                var data = $scope.params_coursePackage;
                if (!data || data.length == 0) {
                    layer.msg('请选择课程包');
                } else {
                    if (SERVICE.COURSEANDCLASS.COURSEPACKAFE[props.callBackName]) {
                        SERVICE.COURSEANDCLASS.COURSEPACKAFE[props.callBackName](data);
                    };
                    $scope.$emit(props.callBackName, data);
                    $scope.closePopup('choseCoursePackage');
                }
                manualOnresize(); //手动调用onresize
            }

            //获取学杂列表
            function getGoodsList(start) {
                var param = {
                    'start': start.toString() || "0",
                    'count': eachPage,
                    'goodsName': $searchName,
                    'goodsStatus': '1',
                    'sellStatus': '1',
                    'orderTyp': $goods_orderType,
                    'orderName': $goods_orderName,
                    'goodsSpecStatus': 1,
                    'shopId':props.shopId?props.shopId:undefined
                };
                if (!$goods_orderType) {
                    param["orderTyp"] = undefined;
                    param["orderName"] = undefined;
                }
                console.log(param);
                for (var i in param) {
                    if (param[i] == "" || param[i] == undefined) {
                        delete param[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/goods/list",
                    type: "get",
                    data: param,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.goodsList = res.context.items;
                            angular.forEach(res.context.items, function(v) {
                                var checked = false;
                                angular.forEach(props.item, function(m) {
                                    if (v.goodsId == m.goodsId) {
                                        checked = true;
                                    }
                                });
                                if (checked) {
                                    v.hasChecked = true;
                                    $scope.params_goods.push(v);
                                }
                            });

                            if ($scope.choseType == 'checkbox') repeatLists($scope.goodsList, $scope.params_goods, 'goodsId');

                            renderPager(res.context.totalNum);
                        };
                    }
                })
            }
            //获取优惠券列表
            function getCouponsList(start) {
                var param = {
                    'start': start.toString() || "0",
                    'count': eachPage,
                    'couponName': $searchName,
                    'discountType': $discountType,
                    'userScope': $userScope,
                    'productScope': $scope.productScope,
                    'productId': $productId,
                    'filter': 'valid',
                    //                  'status':,
                };
                console.log(param);
                for (var i in param) {
                    if (param[i] == "" || param[i] == undefined) {
                        delete param[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/coupon/listCoupon",
                    type: "get",
                    data: param,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.couponList = res.context.items;
                            angular.forEach(res.context.items, function(v) {
                                v.productNameStr = v.productNames ? arrToStr(v.productNames, null) : "";
                                var checked = false;
                                angular.forEach(props.item, function(m) {
                                    if (v.couponId == m.couponId) {
                                        checked = true;
                                    }
                                });
                                if (checked) {
                                    v.hasChecked = true;
                                    $scope.params_coupons.push(v);
                                }
                            });
                            if ($scope.choseType == 'checkbox') repeatLists($scope.couponList, $scope.params_coupons, 'couponId');

                            renderPager(res.context.totalNum);
                        };
                    }
                })
            }

            function mouseoverCoupon($event) {
                $($event.target).closest(".parent").find(".openPop").show();
            }

            function mouseleaveCoupon($event) {
                $($event.target).closest(".parent").find(".openPop").hide();
            }

        }
    });
})