define(["MyUtils", "laydate", 'socketIo', "orderInfo", "szpUtil", "qrcode", 'mySelect', 'inputSelect', 'basicPop', 'collectionPop'], function(MyUtils, laydate, socketIo) {
    creatPopup({
        el: 'signUp',
        openPopupFn: 'CallsignUpPopup',
        htmlUrl: './templates/popup/signup.html',
        controllerFn: function($scope, props, SERVICE, $timeout) {
            /*
             * x.package 代表课程下真正的数据
             * x.package_ 代表选择套餐后的套餐数据  主要用于 1.监听课程数据 脱套餐 2.是否纯用套餐对应是否传packageId（统计页面有用）
             */
            $scope.today = new Date();
            var signTotalMoney = 0;
            $scope.signTotalMoney = signTotalMoney;

            getSchoolTermList(); //获取学期列表
            function init() {
                console.log(props);
                $scope.props = props;
                $scope.potentialInfo = {}; //学员信息
                $scope.shopInfo = window.currentUserInfo.shop; //门店信息
                $scope.ConfirmNext = ConfirmNext; //报名 下一步
                $scope.prevPopup = prevPopup; //上一步
                $scope.CallsingUp_choseCourse = $scope.goPopup; //选课报名
                $scope.CallsingUp_choseClass = $scope.goPopup; //选班报名
                $scope.activity_signup = function() { layer.msg('未参加活动') }; //活动报名按钮
                $scope.choseClass = choseClass; //选班
                $scope.choseClass_ = choseClass_; //改版选班
                $scope.deter_choseClass = deter_choseClass; //确定选班
                $scope.choseClassEnd = true; //选择班级显示班级信息
                $scope.courseItemInfo = {}; //点击选班的时候预存整条信息(选班小弹框数据)
                $scope.caclBirthToAge = caclBirthToAge; //计算年龄

                $scope.addparentInfo = addparentInfo; //添加家长信息
                $scope.navigation_bar_bgm = '1'; //当前操作第几步
                $scope.parentType = getConstantList(CONSTANT.POTENTIALCUSTOMERPARENTTYPE, [0, 1, 2, 3, 4, 5, 6, 8, 7]); //家长关系类型
                $scope.gradeList = getConstantList(CONSTANT.STUDENTGRADE); //潜客年级列表
                SERVICE.COURSEANDCLASS.COURSE['选课报名-课程'] = deter_signUpCourse; //确定报名课程
                SERVICE.COURSEANDCLASS.CLASS['选班报名-班级'] = deter_signUpClasses; //确定报名班级
                SERVICE.COURSEANDCLASS.CLASS['选课报名-班级'] = deter_signUpClass; //确定报名班级
                SERVICE.COURSEANDCLASS.GOODS['选课报名-学杂'] = deter_signUpGoods; //确定报名学杂
                SERVICE.COURSEANDCLASS.COURSEPACKAFE['选课报名-课程包'] = deter_signUpCoursePackage; //确定报名课程包
                $scope.del_signUpCourse = del_signUpCourse; //删除报名课程
                $scope.del_signUpGoods = del_signUpGoods; //删除选择学杂
                $scope.sel_adviser = sel_adviser; //选择顾问
                $scope.delAdviser = delAdviser; //删除顾问
                $scope.sel_teachers = sel_teachers; //选择老师
                $scope.delTeachers = delTeachers; //删除老师
                $scope.sel_hopetime = sel_hopetime; //选择班级意愿时间
                $scope.totalPay = totalPay; //全额付款
                $scope.del_signParent = del_signParent; //删除家长信息列
                $scope.student_params = null; //第一步报名学生需要提交更新的数据
                $scope.preSetMark = preSetMark; //选择标签
                $scope.changeListData = changeListData; //模糊查询获取学员列表
                $scope.closeDialog = function() {
                    layer.close(dialog);
                };
                $scope.watchPayMoney = watchPayMoney; //输入改变应收金额
                $scope.selectedAllweek = selectedAllweek; //全部勾选接送星期
                //学杂规格切换
                $scope.switch_goodsSpecId = function(data) {
                    console.log(data)
                    if (data.goodsSpecId) {
                        data.goodsSpecList.map(function(item) {
                            if (item.goodsSpecId == data.goodsSpecId) {
                                data.goodsPrice_ = item.price;
                                data.goodsPrice = item.price;
                                data.goodsSpecName = item.name;
                            }
                        })
                    } else {
                        data.goodsPrice_ = 0;
                        data.goodsPrice = "";
                        data.goodsSpecName = '';
                    }

                }
                $scope.sign_parmas = { //第一步的数据
                    name: undefined,
                    nickName: undefined,
                    sex: "2",
                    hasMonth: false,
                    ageType: "1",
                    age: undefined,
                    studentMonth: undefined,
                    birthday: undefined,
                    oaUserId: undefined,
                    cardId: '',
                    contacts: { type: '1', phone: '' }, //主要联系人
                    contacts_: [
                        { type: '', phone: '' },
                        { type: '', phone: '' },
                    ], //其他联系人
                    school: undefined,
                    address: undefined,
                    desc: undefined,
                    grade: undefined,
                    tags: [],
                    channel: null, //推荐人
                    channel2: null,
                    recmd: null,
                    hasChannelType: false,
                    isInRecmd: false,
                    channelList2: [],
                    pickUpShow: checkAuthMenuById(124) && (((window.currentUserInfo.shop.config) & 0x0200) > 0), //有权限且开关开启
                    pickupWeek: [
                        { type: 0, name: "午托", weekList: [1, 2, 3, 4, 5, ] },
                        { type: 1, name: "晚托", weekList: [1, 2, 3, 4, 5, ] },
                    ],
                    reference: undefined,
                };
                getSchools();
                getChannelList(); //获取来源渠道并获取潜客详情
                $scope.PayTypeList = getConstantList(CONSTANT.PAYTYPENEW); //支付方式
                $scope.isOnlinePayType = window.currentUserInfo.shop.auditStatus == 2 ? true : false; //是否开通了线上支付（易收宝）
                //续签 支付方式list
                $scope.PayProjectList = {
                    'student': { 'paymentMode': '学员账户', 'paymentMoney': '' },
                    'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '' },
                };
                $scope.clickPayTypeIcon = function(d, evt) { //点击支付方式
                    if (d) {
                        $scope.PayProjectList['other']['paymentMode'] = d;
                    } else {
                        layer.tips('请开通易收宝后使用', $(evt.target), {
                            tips: 4,
                            fixed: true,
                        });
                    }
                };
                $scope.thisYears = getSomeYears(); //获取今年年份
                $scope.sign_parmas2 = []; //第二步的课程数据
                $scope.sign_parmas2_goods = []; //第二步的学杂数据
                $scope.sign_parmas2_all = {}; //第二步的总数据数据
                $scope.activitySignupList = []; //活动报名数据
                $scope.sign_parmas3 = { //第三步数据
                    contractMoney: 0,
                    receivableMoney: 0,
                    netreceiptsMoney: 0,
                    payTime: props.location == 'pushOrder' ? ($.format.date(new Date(), 'yyyy-MM-dd')) : ($.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss')),
                    adviser: [], //顾问
                    agent: localStorage.getItem('shopTeacherId'), //经办人
                    desc: ''
                };
                $scope.selTimeFrame_obj = {}; //课程时间控件对象（控制开始时间和结束时间限制的作用）
                getTeacherList(); //获取一对一教师列表
                $scope.selYear = selYear; //选择学年
                $scope.selSchoolTerm = selSchoolTerm; //选择学期
                $scope.initDiscount = initDiscount; //切换折扣类型计算优惠金额
                $scope.inputPackageTime = inputPackageTime; //输入课程购买课时
                $scope.selScreen_ = selScreen_; //下拉选择
                $scope.del_oneTeacher = del_oneTeacher; //删除一对一老师
                $scope.selTimeFrame = selTimeFrame; //时间控件
                $scope.sel_package = sel_package; //下拉选择套餐之后按月的默认结束时间
                $scope.resetAdviser = resetAdviser; //顾问占比重分配
                $scope.delStudent = delStudent;
                $scope.deleteList = deleteList;
                SERVICE.MARKPOP.COURSE['添加标签'] = deterMark; //已选的标签
                $scope.toString = function(val) {
                    return String(val);
                }
                if (props.location == 'pushOrder') {
                    PUSHORDER();
                }
                $scope.selectInfoNameId = 'studentName';
                $scope.searchData = { //搜索类型
                    studentName: '姓名',
                    studentNickName: '昵称',
                    userPhone: '联系方式',
                    refundNo: '合约号'
                };
                $scope.selectInfoNameIdClass = "studentName";
                $scope.searchClassData = {
                    studentName: '班级',
                    studentNickName: '老师',
                };
                $scope.courseType = [
                    { name: '未处理', value: '0' },
                    { name: '已处理', value: '1' },
                ];
                $scope.classType = [
                    { name: '试听班', value: '0' },
                    { name: '补课班', value: '0' },
                    { name: '正式班', value: '0' },
                ];
                $scope.signUpnameListThead = [
                        { 'name': '123', 'width': '10%' },
                        { 'name': '班级类型', 'width': '10%' },
                        { 'name': '班级名称', 'width': '10%' },
                        { 'name': '课程', 'width': '12%' },
                        { 'name': '适龄', 'width': '12%' },
                        { 'name': '人数', 'width': '11%', },
                        { 'name': '开班时间', 'width': '15%', 'issort': true },
                        { 'name': '老师', 'width': '10%' },
                        { 'name': '教学进度', 'width': '10%', 'issort': true }
                    ]
                    //时间控件
                laydate.render({
                    elem: '#signBirthDay', //指定元素
                    isRange: false,
                    max: $.format.date(new Date(), 'yyyy-MM-dd'),
                    change: function(value, date) {
                        $scope.sign_parmas.hasMonth = false;
                        $scope.sign_parmas.age = caclAge(value);
                        if (value) {
                            if (parseInt($scope.sign_parmas.age) <= 6) {
                                $scope.sign_parmas.hasMonth = true;
                                $scope.sign_parmas.studentMonth = "岁" + caclAgeToMonth(value) + "月";
                            } else {
                                $scope.sign_parmas.hasMonth = false;
                            }
                        } else {
                            $scope.sign_parmas.age = "";
                            $scope.sign_parmas.studentMonth = "";
                            $scope.sign_parmas.hasMonth = false;
                        }
                        $scope.$apply();
                    },
                    done: function(value) {
                        $scope.sign_parmas.birthday = value;
                        if (!value) {
                            $scope.sign_parmas.studentMonth = "";
                            $scope.sign_parmas.hasMonth = false;
                        }
                        $scope.$apply();
                    }
                });
                $scope.gravityClick = function() { //重选
                    $scope.choseClassEnd = true;
                    $scope.courseItemInfo.classInfo = '';
                };
                $scope.goCommonPop = function(el, id, width, data) {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                    }
                    //              //监听计算总签约金额
                $scope.$watch('sign_parmas2', function(n, o) {
                    if (n === o || n == undefined) return; //防止第一次重复监听
                    resetSignparam2();
                    getSignTotalMoney();
                    $scope.couponObj.operate(2);
                }, true);
                $scope.$watch('sign_parmas2_goods', function(n, o) {
                    if (n === o || n == undefined) return; //防止第一次重复监听
                    getSignTotalMoney();
                }, true);
                $scope.$watch('activitySignupList', function(n, o) {
                    if (n === o || n == undefined) return; //防止第一次重复监听
                    resetActivitySignupList();
                    getSignTotalMoney();
                }, true);
            };
            var sourceLink; //图片地址

            //优惠券信息数据
            $scope.couponObj = {
                data: {
                    sel_data: {},
                    limitClick: true,
                    discount: '',
                },
                getData: function(id) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/coupon/getAvailableCoupons",
                        type: "get",
                        data: {
                            'potentialCustomerId': id,
                            'onlineOffline': 'offline',
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                console.log(res);
                                $scope.couponList = res.context;
                            };
                        }
                    })
                },
                operate: function(type, _da) {
                    var c = [],
                        g = 0; //课程列表包含活动报名课程、学杂总金额
                    if ($scope.activitySignupList.length > 0) {
                        angular.forEach($scope.activitySignupList, function(v) {
                            angular.forEach(v.activity_course, function(v_) {
                                c.push(v_);
                            });
                            angular.forEach(v.activity_goods, function(x) {
                                var n = x.goodsPrice * x.goodsNumber;
                                g = n ? (g + n) : g;
                            })
                        });
                    }
                    if ($scope.sign_parmas2_goods.length > 0) {
                        angular.forEach($scope.sign_parmas2_goods, function(x) {
                            var n = x.goodsPrice * x.goodsNumber;
                            g = n ? (g + n) : g;
                        })
                    }
                    c = $scope.sign_parmas2.concat(c);
                    switch (type) {
                        case 1: //选择优惠券
                            if ($scope.potentialInfo.contractStatus == 0 && _da.coupon.userScope == 2 || $scope.potentialInfo.contractStatus == 1 && _da.coupon.userScope == 1) return;
                            if ($scope.couponObj.data.sel_data.couponPackageId == _da.couponPackageId) { //取消选择
                                $scope.couponObj.data.sel_data = {};
                                var n = 0;
                                angular.forEach(c, function(v_1) {
                                    v_1.discountType_c = 0; //优惠券类型-代金券传到报名第三步用
                                    v_1.discount_c = 0;
                                    v_1.discountPrice_c = 0;
                                    if (v_1.discountType == 1) {
                                        v_1.amount = numAccuracy(v_1.package.packagePrice - v_1.discountPrice);
                                    } else {
                                        v_1.amount = numAccuracy(v_1.package.packagePrice * (v_1.discountPrice_ / 100));
                                    }
                                    n += v_1.amount * 1;
                                });
                                $scope.signTotalMoney = n * 1 + g * 1;
                            } else {
                                $scope.couponObj.data.sel_data = _da;
                                $scope.couponObj.operate(2);
                            };
                            break;
                        case 2: //均摊优惠金额

                            var n_ = 0,
                                m_1, m_2 = 0,
                                _da = $scope.couponObj.data.sel_data; //（课程本身优惠后总价、优惠总金额、累积均摊后的优惠金额）

                            if (!_da.couponPackageId) return;

                            if (c.length > 0) {
                                angular.forEach(c, function(val_1) { //计算课程总金额
                                    val_1.discountType_c = 0; //优惠券类型-代金券传到报名第三步用
                                    val_1.discount_c = 0;
                                    val_1.discountPrice_c = 0;

                                    val_1.amount = val_1.amount ? val_1.amount : 0;
                                    n_ += val_1.amount * 1;
                                });

                                //判断卷是否满足满减条件
                                if (_da.coupon.useLimits == 1 && _da.coupon.useMoney > n_) {
                                    $scope.couponObj.data.sel_data = {};
                                    return layer.msg('不满足优惠条件');
                                } else { //满足条件则均摊优惠金额到课程上
                                    //                                  discountPrice_c   使用优惠券优惠的值
                                    $scope.couponObj.data.sel_data.total_ = n_; //课程总金额
                                    switch (_da.coupon.discountType) {
                                        case 1: //代金券
                                            m_1 = _da.coupon.discounts;

                                            if (m_1 > n_) m_1 = n_; //如果优惠金额大于课程总金额-则优惠金额为课程总金额（只能扣到0防止扣付)
                                            $scope.couponObj.data.sel_data.discount_ = m_1; //优惠总额
                                            angular.forEach(c, function(v_1, i_1) { //计算金额占比
                                                v_1.discountType_c = 1; //优惠券类型-代金券传到报名第三步用
                                                v_1.discount_c = null;
                                                if (i_1 == (c.length - 1)) {
                                                    v_1.discountPrice_c = numAccuracy(m_1 - m_2);
                                                } else {
                                                    v_1.discountPrice_c = numAccuracy(v_1.amount / n_ * m_1);
                                                    m_2 += v_1.discountPrice_c * 1;
                                                }
                                            });
                                            $scope.signTotalMoney_ = n_;
                                            $scope.signTotalMoney = n_ * 1 - m_1 * 1 + g * 1;
                                            break;
                                        case 2: //折扣劵
                                            var n = _da.coupon.discounts * 1 / 100;
                                            angular.forEach(c, function(v_1, i_1) { //计算金额占比
                                                var a = angular.copy(v_1.amount);
                                                //                                              v_1.amount = numAccuracy(a*n);
                                                v_1.discount_c = n;
                                                v_1.discountType_c = 2; //优惠券类型-折扣券传到报名第三步用
                                                v_1.discountPrice_c = numAccuracy(a - a * n);
                                            });
                                            $scope.signTotalMoney_ = n_;
                                            $scope.signTotalMoney = numAccuracy(n_ * n) + g * 1;
                                            break;
                                    }
                                }
                            };
                            break;
                    }
                }
            };
            //其他骚操作
            $scope.otherFun = {
                operate: function(type, _da, sp) {
                    //                  console.log(_da, $scope.sign_parmas);
                    switch (type) {
                        case 1: //均分顾问占比
                            var m1 = 0;
                            angular.forEach($scope.sign_parmas3.adviser, function(v1, i1) {
                                if (i1 == $scope.sign_parmas3.adviser.length - 1) {
                                    v1.percentage = 100 - m1;
                                } else {
                                    v1.percentage = parseInt(100 / $scope.sign_parmas3.adviser.length);
                                    m1 += v1.percentage;
                                }
                            });
                            break;
                        case 2: //切换一级渠道
                            $scope.sign_parmas.channel2 = sp ? $scope.sign_parmas.channel2 : null;
                            $scope.sign_parmas.recmd = sp ? $scope.sign_parmas.recmd : null;
                            $scope.sign_parmas.channelList2 = [];
                            if (!_da) {
                                $scope.sign_parmas.channel = "";
                                $scope.sign_parmas.hasChannelType = false;
                                $scope.sign_parmas.isInRecmd = false;
                            } else {
                                var data;
                                angular.forEach($scope.channelTypeList, function(v, k) {
                                    if (v.id == _da) {
                                        data = v;
                                    }
                                });
                                if (_da == 5) { //内部推荐人
                                    $scope.sign_parmas.hasChannelType = false;
                                    getRecmdList();
                                } else { //来源渠道
                                    $scope.sign_parmas.isInRecmd = false;
                                    if (data.channelList.length > 0) {
                                        $scope.sign_parmas.hasChannelType = true;
                                        $scope.sign_parmas.channelList2 = data.channelList;
                                    } else {
                                        $scope.sign_parmas.channelList2 = [];
                                        $scope.sign_parmas.hasChannelType = false;
                                    }
                                }
                            }
                            break;
                        case 3: //姓名手机号失焦查询
                            //                          console.log($scope.sign_parmas.name);
                            //                          console.log($scope.sign_parmas.contacts.phone);
                            //如果有填学员姓名和正确的手机号码
                            // if($scope.sign_parmas.name && /^1[0-9]{10}$/.test($scope.sign_parmas.contacts.phone)) {
                            $.hello({
                                url: CONFIG.URL + '/api/oa/sale/getPotentialCustomerRemovalStatus',
                                type: 'get',
                                data: {
                                    'potentialCustomerId': props.item.potentialCustomerId ? props.item.potentialCustomerId : undefined,
                                    'name': $scope.sign_parmas.name ? $scope.sign_parmas.name : '',
                                    'potentialCustomerParentPhone': $scope.sign_parmas.contacts.phone ? $scope.sign_parmas.contacts.phone : '',
                                },
                                success: function(data) {
                                    if (data.context.length > 0) {
                                        angular.forEach(data.context, function(v) {
                                            v.relationType = relation(v.potentialCustomerParentType);
                                        });
                                    } else {

                                    }
                                    $scope.repeatStudentList = data.context;

                                }
                            });
                            // }
                            break;
                        case 4: //选择重复的学员
                            props.item = _da;
                            layer.close(dialog);
                            getSchoolTermList();
                            $scope.repeatStudentList = [];
                            break;
                        case 5: //查看重复的学员
                            openPopByDiv('重复信息', '#sign_selectStudent', '860px');
                            break;
                    };
                }
            };

            $scope.otherFun_operate = function(n, t) {
                if (n) {
                    $scope.otherFun.operate(4, n);
                }
            }


            $scope.onInputBlur = function(scope) {
                $scope.otherFun.operate(3);
            }
            $scope.$on("添加推荐人", function(evt, data) {
                $scope.sign_parmas.reference = getRefferral(data);
            });
            function getRefferral(data) {
                var obj = {};
                switch (data.referralType) {
                    case 1:
                        obj = {
                            name:data.studentName,
                            id:data.referralDataId,
                            phone:data.phoneNum
                        };
                        break;
                    case 2:
                        obj = {
                            name:data.name,
                            id:data.potentialCustomerId,
                            phone:data.potentialCustomerParentPhone
                        };
                        break;
                    case 3:
                        obj = {
                            name:data.teacherName,
                            id:data.shopTeacherId,
                            phone:data.teacherPhone
                        };
                        break;
                    default:
                        break;
                }
                obj["type"] = data.referralType;
                return obj;
            }
            function deterMark(d) {
                $scope.sign_parmas.tags = d;
            }

            function deleteList(list, ind) {
                list.splice(ind, 1);
            }

            function delStudent(x, ind) {
                $scope.sign_parmas.reference = undefined;
            }
            $scope.$on('报名-学校管理', function() { getSchools(); });

            function getSchools() { //获取学校列表
                $.hello({
                    url: CONFIG.URL + '/api/oa/pickUp/school/list',
                    type: 'get',
                    data: {
                        pageType: 0,
                    },
                    success: function(data) {
                        $scope.schoolList = data.context;
                    }
                });
            }
            //获取学员列表
            function changeDroplist(s_n, val) {
                var params = {
                    "searchType": s_n ? s_n : undefined,
                    "searchName": val ? val : undefined
                };

                $.hello({
                    url: CONFIG.URL + "/api/oa/sale/choicePotentialCustomer",
                    type: 'get',
                    data: params,
                    needLoading: false,
                    success: function(data) {
                        if (data.status == "200") {
                            if (data.context.items) {
                                angular.forEach(data.context.items, function(v) {
                                    v._name = v.name;

                                    if (v._name.length < 6) {
                                        for (var i = v._name.length; i < 6; i++) {
                                            v._name += '　';
                                        }
                                    } else {
                                        v._name += '　';
                                    }
                                    v._name += v.potentialCustomerParentPhone;
                                    v._name += '　　';
                                    v._name += (v.contractStatus == '1' && v.studentStatus == '0') ? '在读' : '潜客';

                                });
                            }

                            $scope.dropList = data.context.items || [];
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
                            $scope.shopId = data.context.shopId;
                        }
                    }
                })
            }
            //获取渠道 类型
            function getChannelList() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/channelType/list',
                    type: 'get',
                    async: false,
                    data: {pageType: 0 ,saleType:1,status:1,channelNeed:1},
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.channelTypeList = data.context;
                            if (props.item.potentialCustomerId) {
                                getPotentialInfo(props.item.potentialCustomerId); //获取潜客详情
                                return;
                            }
                            // 易收宝订单关联带入付款时学生姓名
                            if (props.fromPaytreasure) $scope.sign_parmas.name = props.fromPaytreasure.studentName;
                        }
                    }
                });
            }

            function changeListData(text) {
                changeDroplist("studentName", text);
            }
            //接送管理全选按钮
            function selectedAllweek(x) {
                x["week"] = [false];
                angular.forEach(x.weekList, function(v, i) {
                    x.week[v] = true;
                });
            }
            //获取内部推荐人列表
            function getRecmdList() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/userAdmin/getSimpleOaWorkerList',
                    type: 'get',
                    data: {
                        status: 1 // 状态:1-在职,2-离职
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.channel_teacherList = data.context;
                            console.log(data)
                            if ($scope.channel_teacherList.length > 0) {
                                $scope.sign_parmas.isInRecmd = true;
                            } else {
                                $scope.sign_parmas.isInRecmd = false;
                            }
                        }
                    }
                });
            }

            //获取标签id
            function getTagId() {
                var arr = [];
                angular.forEach($scope.sign_parmas.tags, function(v) {
                    arr.push({ id: v.id });
                });
                return arr;
            };
            //已经选了套餐后，更改购买或课程价格
            function resetSignparam2() {
                angular.forEach($scope.sign_parmas2, function(x) {
                    if ((x.package_ && x.package.packageTime * 1 != x.package_.packageTime * 1) || (x.package_ && x.package.packagePrice * 1 != x.package_.packagePrice * 1)) {
                        if (x.iscustom) { //选择自定义套餐
                            $scope.$broadcast(x.mixid, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                        } else { //修改了课时、课程价格、按月课程换成天选择
                            $scope.$broadcast(x.mixid, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                            x.package_ = null;
                            x.iscustom = true;
                        }
                    }
                });
            }
            //已经选了套餐后，更改购买或课程价格
            function resetActivitySignupList() {
                angular.forEach($scope.activitySignupList, function(v) {
                    angular.forEach(v.activity_course, function(x) {
                        if ((x.package_ && x.package.packageTime * 1 != x.package_.packageTime * 1) || (x.package_ && x.package.packagePrice * 1 != x.package_.packagePrice * 1)) {
                            if (x.iscustom) { //选择自定义套餐
                                $scope.$broadcast(x.mixid, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                            } else { //修改了课时、课程价格、按月课程换成天选择
                                $scope.$broadcast(x.mixid, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                                x.package_ = null;
                                x.iscustom = true;
                            }
                        }
                    });
                });
            }
            //获取报名签约金额总额
            function getSignTotalMoney() {
                var _m = 0,
                    _g = 0; //总的签约金额、学杂金额
                //计算课程的签约金额
                angular.forEach($scope.sign_parmas2, function(x) {
                    var _n = 0; //某个课程的签约金额
                    //                  if(x.discountType == 1) {
                    //                      _n = x.package.packagePrice - x.discountPrice;
                    //                  } else {
                    //                      _n = x.package.packagePrice * (x.discountPrice_ / 100);
                    //                  }
                    _n = x.amount * 1;
                    _m = _n ? (_m + _n) : _m;
                });

                //计算学杂的签约金额
                angular.forEach($scope.sign_parmas2_goods, function(x) {
                    var _n = x.goodsPrice * x.goodsNumber;
                    _g = _n ? (_g + _n) : _g;
                })

                //计算活动课程的签约金额和活动学杂的签约金额
                angular.forEach($scope.activitySignupList, function(val) {
                    angular.forEach(val.activity_course, function(x) {
                        var _n = 0; //某个课程的签约金额
                        //                      if(x.discountType == 1) {
                        //                          _n = x.package.packagePrice - x.discountPrice;
                        //                      } else {
                        //                          _n = x.package.packagePrice * (x.discountPrice_ / 100);
                        //                      }
                        _n = x.amount * 1;
                        _m = _n ? (_m + _n) : _m;
                    });

                    angular.forEach(val.activity_goods, function(x) {
                        var _n = x.goodsPrice * x.goodsNumber;
                        _g = _n ? (_g + _n) : _g;
                    })
                })
                signTotalMoney = _m; //总签约金额
                if ($scope.couponObj.data.sel_data && $scope.couponObj.data.sel_data.coupon) {
                    if ($scope.couponObj.data.sel_data.coupon.discountType == 1) {
                        signTotalMoney = _m - $scope.couponObj.data.sel_data.coupon.discounts;
                    } else if ($scope.couponObj.data.sel_data.coupon.discountType == 2) {
                        signTotalMoney = _m * $scope.couponObj.data.sel_data.coupon.discounts * 1 / 100;

                    }
                }
                $scope.signTotalMoney_ = _m;
                $scope.signTotalMoney = signTotalMoney * 1 + _g * 1;
            }

            function resetAdviser(ind) {
                if ($scope.sign_parmas3.adviser.length == 2) {
                    $scope.sign_parmas3.adviser[1 - ind].percentage = 100 - $scope.sign_parmas3.adviser[ind].percentage;
                }
            }

            function totalPay(index) { //全额支付
                $scope.PayProjectList['other'].paymentMoney = numAccuracy(Math.abs($scope.sign_parmas3.receivableMoney));
            }

            function sel_hopetime(data) {
                $scope.courseItemInfo.willTime = data;
            }

            function delAdviser(data, ind) {
                data.hasSelected = false;
                $scope.sign_parmas3.adviser.splice(ind, 1);
                $scope.otherFun.operate(1);
            }

            function delTeachers(data, ind) {
                data.hasSelected = false;
                $scope.courseItemInfo.teachers.splice(ind, 1);
            }

            function sel_adviser(data) { //选择顾问
                var judHas = true;
                var judHasIndex = null;
                angular.forEach($scope.sign_parmas3.adviser, function(val, index) {
                    if (val.shopTeacherId == data.shopTeacherId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                });
                if (judHas) {
                    $scope.sign_parmas3.adviser.push(data);
                    data.hasSelected = true;
                } else {
                    $scope.sign_parmas3.adviser.splice(judHasIndex, 1);
                    data.hasSelected = false;
                }
                $scope.otherFun.operate(1);
            }

            function sel_teachers(data) {
                var judHas = true;
                var judHasIndex = null;
                angular.forEach($scope.courseItemInfo.teachers, function(val, index) {
                    if (val.teacherId == data.teacherId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                });
                if (judHas) {
                    $scope.courseItemInfo.teachers.push(data);
                    data.hasSelected = true;
                } else {
                    $scope.courseItemInfo.teachers.splice(judHasIndex, 1);
                    data.hasSelected = false;
                }
            }
            //获取顾问和经办人列表
            function getAdviserList() {
                $scope.$broadcast('signupAdviser'); //清空展示课程下拉选中数据

                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data: {
                        'pageType': '0',
                        'shopTeacherStatus': 1,
                        'quartersTypeId': 3
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            if (res.context.length > 0) {
                                $scope.adviserList = res.context;
                                angular.forEach($scope.adviserList, function(v1) { //把所有的顾问占比先设置成100%
                                    v1.percentage = 100;
                                });

                                $scope.$broadcast('signupAdviser', 'clearSatus');
                                if ($scope.sign_parmas3.adviser.length > 0) {
                                    setTimeout(function() {
                                        $scope.$broadcast('signupAdviser', 'reloadData', { 'data': $scope.sign_parmas3.adviser, 'att': 'shopTeacherId' });
                                        $scope.$apply();
                                    });
                                };
                            } else {
                                $scope.sign_parmas3.adviser = [];
                            }
                        };
                    }
                });
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data: {
                        'pageType': '0',
                        'shopTeacherStatus': 1,
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            console.log(res);
                            $scope.agentList = res.context;
                        };
                    }
                })
            }
            //通过课程id获取老师
            function getTeacherList(courseId) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data: {
                        'pageType': 0,
                        'quartersTypeId': 1,
                        "shopTeacherStatus": "1"
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.listen_teacherList = res.context;
                            $scope.oneTeacherList = res.context;
                            if ($scope.courseItemInfo) {
                                if ($scope.courseItemInfo.teachers) $scope.$broadcast('添加意愿老师', 'reloadData', { 'data': $scope.courseItemInfo.teachers, 'att': 'teacherId' });
                            }
                        };
                    }
                })
            }
            //选择班级
            function choseClass(id, wid, data, ind) {
                if (data.package.feeType == 1) {
                    if (!data.schoolYear || !data.schoolTerm) {
                        layer.msg('请选择学年或者学期');
                        return;
                    }
                    data.schoolTerm.schoolYear = data.schoolYear;
                }
                if (data.classInfo) {
                    $scope.choseClassEnd = false;
                } else {
                    $scope.choseClassEnd = true;
                }
                data.course.id = $scope.potentialInfo.id; //传入学生id
                $scope.courseItemInfo = {
                    item: data,
                    index: ind,
                    teachers: data.teachers ? angular.copy(data.teachers) : [],
                    choseClassType: data.choseClassType ? data.choseClassType : '0',
                    insertClassTime: data.insertClassTime ? data.insertClassTime : '0',
                    futureTime: data.futureTime ? data.futureTime : '',
                    classInfo: data.classInfo ? angular.copy(data.classInfo) : '',
                    willTime: data.willTime ? data.willTime : ''
                }
                $scope.goPopup(id, wid);
                setTimeout(function() {
                    laydate.render({ //班级选择将来时间
                        elem: '#choseClass_futureTime', //指定元素
                        type: 'datetime',
                        isRange: false,
                        min: $.format.date(new Date(), 'yyyy-MM-dd'),
                        done: function(value) {
                            $scope.courseItemInfo.futureTime = value;
                        }
                    });
                });
                getTeacherList(data.course.courseId);
            }
            //选择班级
            function choseClass_(data, ind) {
                //              if(data.package.feeType== 1) {
                //                  if(!data.schoolYear || !data.schoolTerm) {
                //                      layer.msg('请选择学年和学期');
                //                      return;
                //                  }
                //                  data.schoolTerm.schoolYear = data.schoolYear;
                //              }
                $scope.courseItemInfo = {
                    item: data,
                    index: ind,
                    classInfo: data.classInfo ? angular.copy(data.classInfo) : '',
                }
                console.log(props.item)
                var param = {
                        name: 'class',
                        type: 'radio',
                        item: data.course,
                        schoolTerm: data.schoolTerm,
                        screen_classType: '0',
                        callBackName: '选课报名-班级'
                    }
                    //允许选择已经在班的班级 zmz
                    // if(props.location != 'pushOrder'){
                    //     param["excludeStudentId"] = $scope.student_params.id;
                    // }
                window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px', param);
            }

            //获取学期列表
            function getSchoolTermList(schoolTermId, obj, sp) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: {
                        'pageType': 0,
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.schoolTermList = res.context;
                            init();
                        };
                    }
                })

                if (props.item.potentialCustomerId) {
                    //根据潜客获取所有合同 包括已结业3.3
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/listOrderCourse",
                        type: "get",
                        data: {
                            'potentialCustomerId': props.item.potentialCustomerId,
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                console.log(res);
                                if (res.context.length) $scope.contractList = res.context;

                            };
                        }
                    })
                }
            }
            //选择学年
            function selYear(x) {
                //              x.classInfo = '';
                //              x.isShowClass = false;
            }
            //选择学期
            function selSchoolTerm(x) {
                var arr_ = [],
                    count = 0;
                x.teachers = [];
                if (x.schoolTerm) {
                    angular.forEach(x.packageList_old, function(val) {
                        if (val.schoolTermId == x.schoolTerm.schoolTermId || val.feeType !== 1) {
                            arr_.push(val);
                            if (val.feeType == 1) count++;
                        }
                    })
                    x.packageList = angular.copy(arr_);
                } else {
                    x.packageList = angular.copy(x.packageList_old);
                    count++;
                }
                //清空当前存在数据
                x.package_ = null;
                x.package = { feeType: 1 };
                x.amount = '';
                x.discountType = '1';
                x.discountPrice = '';
                x.chargeType = '1';
                x.monthNum = '';
                if (x.timeFrame) { //课程有效截至时间
                    x.timeFrame = '';
                    $('#' + x.time_id).val('');
                }
                //修改指令内套餐列表
                $scope.$broadcast(x.mixid, count == 0 ? "按期报名" : "请选择套餐", x.packageList, true);
            }
            //选班报名获取学期
            function getSchoolTerm(x) {
                var arr_ = [];
                if (x.schoolTerm) {
                    angular.forEach(x.packageList_, function(val) {
                        if (val.schoolTermId == x.schoolTerm.schoolTermId) {
                            arr_.push(val);
                        }
                    })
                    x.packageList = angular.copy(arr_);
                }

            }

            function initDiscount(x) {
                if (x.discountType == '1') {
                    x.discountPrice = numAccuracy(x.package.packagePrice - x.amount);
                } else {
                    x.discountPrice_ = numAccuracy((x.amount / x.package.packagePrice) * 100);
                }
            }

            //输入课程购买课和购买月数 课程价格、优惠和签约金额失焦状态时
            function inputPackageTime(x, type, clear) {
                switch (type) {
                    case 1: // 购买课时输入
                        if (x.package) {
                            if (x.package.packageTime == 0) {
                                x.package.packagePrice = 0;
                                x.amount = 0;
                                x.discountType = '1';
                                x.discountPrice = 0;
                            } else {
                                x.package.packagePrice = x.package.packageTime ? numAccuracy(x.package.packageUnitPrice * x.package.packageTime) : 0;
                            }
                            if (x.discountType == '1') {
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        }
                        break;
                    case 2: //切换按月按天 && 月份输入
                        if (clear) {
                            x.endTime = ""
                            $scope.sel_package({
                                data: { feeType: 2, custom: true }
                            }, x, true);
                            return;
                        }
                        if (x.beginTime) {
                            if (x.monthNum == '0' || !x.monthNum) {
                                x.endTime = x.beginTime;
                            } else {
                                x.endTime = $.format.date(getNextMonth_(new Date(x.beginTime), x.monthNum, false), 'yyyy-MM-dd');
                            }
                            if (x.chargeType == '1') {
                                x.package.packageTime = x.monthNum;
                            } else {
                                x.package.packageTime = getIntervalDays(x.beginTime, x.endTime) + 1;
                            }
                            if (x.package.packageTime == 0) {
                                x.package.packagePrice = 0;
                                x.amount = 0;
                                x.discountType = '1';
                                x.discountPrice = 0;
                            } else {
                                if (x.chargeType == '1') {
                                    x.package.packagePrice = numAccuracy(x.package.packageUnitPrice * x.package.packageTime);
                                } else {
                                    x.package.packagePrice = numAccuracy((x.package.packageUnitPrice / 30) * x.package.packageTime);
                                }
                            }
                        };
                        if (x.discountType == '1') {
                            x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                        } else {
                            x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                        }
                        break;
                    case 3: //课程价格输入
                        if (x.package) {
                            x.package.packageUnitPrice = numAccuracy(x.package.packagePrice / x.package.packageTime);
                            if (x && x.package.feeType == '2' && x.chargeType != '1') {
                                x.package.packageUnitPrice = numAccuracy((x.package.packagePrice / x.package.packageTime) * 30);
                            }
                            if (x.discountType == '1') {
                                if (x.package.packagePrice * 1 < x.discountPrice * 1) {
                                    x.discountPrice = x.package.packagePrice;
                                }
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        }
                        break;
                    case 4: //优惠折扣选择 优惠金额
                        if (x.package) {
                            if (x.discountType == '1') {
                                if (x.package.packagePrice * 1 < x.discountPrice * 1) {
                                    x.discountPrice = x.package.packagePrice;
                                }
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        }
                        break;
                    case 5: // 金额输入
                        if (x.package) {
                            if (x.package.packagePrice * 1 < x.amount * 1) {
                                x.amount = x.package.packagePrice;
                            }
                            if (x.discountType == '1') {
                                x.discountPrice = numAccuracy(x.package.packagePrice - x.amount);
                            } else {
                                x.discountPrice_ = numAccuracy((x.amount / x.package.packagePrice) * 100);
                            }
                        }
                        break;
                }
            }
            //选择套餐
            function sel_package(n, d, fl) {
                if (n.data.custom) { //自定义套餐
                    d.package = { feeType: n.data.feeType };
                    d.iscustom = n.data.custom;
                    d.package_ = null;
                    if (fl) {
                        d.package_ = { feeType: n.data.feeType };
                    }
                } else {
                    d.package = {};
                    d.package_ = {};
                    //初始套餐赋值
                    angular.forEach(d.packageList_old, function(v) {
                        if (v.packageId == n.data.packageId) {
                            for (j in v) {
                                d.package[j] = v[j];
                                d.package_[j] = v[j];
                            }
                        }
                    })
                    d.iscustom = false;
                }

                d.amount = 0;
                d.discountType = '1';
                d.discountPrice = 0;
                if (!fl) {
                    d.chargeType = '1';
                }
                d.monthNum = "";
                if (!d.iscustom) {
                    if (d && d.package.feeType == '2' && d.package.packageTime) {
                        d.monthNum = d.package.packageTime * 1;
                        d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum, false), 'yyyy-MM-dd');
                        if (d.chargeType == '1') {
                            d.package.packageTime = d.monthNum;
                        } else {
                            d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                        }
                        if (d.package.packageTime == 0) {
                            d.package.packagePrice = 0;
                            d.amount = 0;
                            d.discountType = '1';
                            d.discountPrice = 0;
                        }
                    }
                    //选择按期套餐选中学期
                    if (d && d.package.feeType == '1') {
                        var fl = true; //套餐内学期已被删除标志位
                        angular.forEach($scope.schoolTermList, function(v_) {
                            if (v_.schoolTermId == d.package.schoolTermId) {
                                d.schoolTerm = v_;
                                fl = false;
                            }
                        })
                        if (fl) d.schoolTerm = '';
                    }
                    if (d.discountType == '1') {
                        d.amount = numAccuracy(d.package.packagePrice - d.discountPrice);
                    } else {
                        d.amount = numAccuracy(d.package.packagePrice * (d.discountPrice_ / 100));
                    }
                }
            }

            //下拉选择
            function selScreen_(d, x) {
                x.oneTeacher = d ? d : '';
            }
            //删除一对一老师
            function del_oneTeacher(x) {
                x.oneTeacher = '';
                x.classInfo = '';
                x.isShowClass = false;
            }

            //点击课程开始结束时间 || 时间范围控件
            function selTimeFrame(d, evt, type) {
                var _s = $scope.selTimeFrame_obj['startLaydate_' + d.time_id],
                    _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
                //加载时间范围选择控件
                if (type == 3 && !d.timeFrameLaydate) {
                    laydate.render({
                        elem: evt.target, //指定元素
                        //                      range: "/",
                        isRange: false,
                        format: 'yyyy-MM-dd',
                        done: function(value, value2) {
                            d.timeFrame = value;
                        }
                    });
                };
                //动态加载开始时间和结束时间选择控件（当存在则不加载）
                if (type == 1 && !_s || type == 2 && !_e) {
                    var l_ = laydate.render({
                        elem: evt.target, //指定元素
                        isRange: false,
                        min: (d.beginTime && type == 2) ? $.format.date(d.beginTime, 'yyyy-MM-dd') : '1970-1-1',
                        format: 'yyyy-MM-dd',
                        done: function(value, value2) {
                            if (type == 1) {
                                d.beginTime = value;
                                var _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
                                if (_e) {
                                    //控制结束时间不能小于开始时间
                                    _e.config.min = value2;
                                    _e.config.min.month--;
                                }
                                if (d.chargeType == 1) { //如果是按月的收费(通过填写的月数获取结束时间)
                                    d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum, false), 'yyyy-MM-dd');
                                }
                            } else {
                                d.endTime = value;
                            }
                            //根据时间计算购买天数
                            if (d.beginTime && d.endTime) {
                                if (d.chargeType != 1) {
                                    d.monthNum = getDatemonth(d.beginTime, d.endTime);
                                }
                                if (d.chargeType == '1') {
                                    d.package.packageTime = d.monthNum;
                                } else {
                                    d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                                }
                                if (d.package.packageTime == 0) {
                                    d.package.packagePrice = 0;
                                    d.amount = 0;
                                    d.discountType = '1';
                                    d.discountPrice = 0;
                                } else {
                                    if (d.chargeType != '1') {
                                        d.package.packagePrice = numAccuracy(d.package.packageUnitPrice / 30 * d.package.packageTime);
                                    }
                                }
                                if (d.discountType == '1') {
                                    d.amount = numAccuracy(d.package.packagePrice - d.discountPrice);
                                } else {
                                    d.amount = numAccuracy(d.package.packagePrice * (d.discountPrice_ / 100));
                                }

                            }
                            $scope.$apply();
                        }
                    });
                    //预存时间控件
                    if (type == 1) {
                        $scope.selTimeFrame_obj['startLaydate_' + d.time_id] = l_;
                    } else {
                        $scope.selTimeFrame_obj['endLaydate_' + d.time_id] = l_;
                    }
                }
            }

            //点击课程筛选器确认
            function deter_signUpCourse(param, _signType) {
                console.log(param);
                if (param) {
                    angular.forEach(param, function(val, ind) {
                        var objData_ = {
                            course: val,
                            mixid: GenNonDuplicateID(5),
                            //                          packageList: [],    //分期的套餐
                            //                          packageList_: [],   //课时的套餐
                            packageList: [],
                            package: { feeType: 0 },
                            package_: null,
                            discountType: '1',
                            discountPrice: '',
                            discountPrice_: '100',
                            discount_c: 0,
                            discountType_c: 0,
                            averageClassPrice: '',
                            contractMoney: '',
                            isShowClass: false,
                            oneTeacher: '', //一对一老师
                            chargeType: '1', //收费类型选择按天、按月（天、月）
                            monthNum: 0, //当收费类型是月时，月数
                            timeFrame: '', //时间范围
                            beginTime: $.format.date(new Date(), 'yyyy-MM-dd'),
                            time_id: val.courseId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                            signType: _signType ? _signType : (val.signType ? 2 : ($scope.contractList ? 3 : 1)), //报名类型，新报-续报-扩科
                        };

                        //通过收费标准id获取所有套餐
                        $.hello({
                            url: CONFIG.URL + "/api/oa/chargeStandard/listPackage",
                            type: "get",
                            data: {
                                'chargeStandardId': val.chargeStandardId,
                            },
                            success: function(res) {
                                if (res.status == '200') {
                                    console.log(res)
                                    objData_.packageList = res.context;
                                    objData_.packageList_old = angular.copy(res.context);

                                    //如果是分期的
                                    //                                  if(val.feeType == '1') {
                                    //                                      objData_['schoolYear'] = (new Date()).getFullYear() + '';
                                    //                                      objData_['schoolTerm'] = '';
                                    //                                      if(props.special == 'xuqian' || props.special == 'shengban_signup') { //续费套餐id自动带入
                                    //                                          if(props.item.schoolTerm) {
                                    //                                          	objData_['schoolYear'] = props.item.schoolTerm.schoolYear + '';
                                    //                                          	angular.forEach($scope.schoolTermList, function(v_) {
                                    //                                          		if(v_.schoolTermId == props.item.schoolTerm.schoolTermId) {
                                    //                                          			objData_.schoolTerm = v_;
                                    //                                          			selSchoolTerm(objData_);
                                    //                                          		}
                                    //                                          	})
                                    //                                          }
                                    //                                      }
                                    //                                  }
                                    if (props.special == 'xuqian' || props.special == 'shengban_signup') { //续费套餐id自动带入
                                        if (props.item.schoolTerm) {
                                            objData_['schoolYear'] = props.item.schoolTerm.schoolYear ? props.item.schoolTerm.schoolYear + '' : undefined;
                                            angular.forEach($scope.schoolTermList, function(v_) {
                                                if (v_.schoolTermId == props.item.schoolTerm.schoolTermId) {
                                                    objData_.schoolTerm = v_;
                                                }
                                            })
                                        }
                                    }
                                    //获取按月续签课程的最大结束时间
                                    if (props.special == 'xuqian' || props.special == 'renew') {
                                        if (props.item.contractId) {
                                            $.hello({
                                                url: CONFIG.URL + "/api/oa/contract/getMaxContractRenew",
                                                type: "get",
                                                data: {
                                                    'contractId': props.item.contractId,
                                                },
                                                success: function(res) {
                                                    if (res.status == '200') {
                                                        objData_['beginTime'] = $.format.date(res.context.giveEndTime, 'yyyy-MM-dd');
                                                    };
                                                }
                                            })
                                        }
                                    }

                                    $scope.sign_parmas2.push(objData_);
                                };
                            }
                        })

                        if (val.courseGoodsRS && val.courseGoodsRS.length > 0) {
                            var list = val.courseGoodsRS;
                            var arrGoods = [];
                            angular.forEach(list, function(v) {
                                v.goods.goodsNumber = v.goodsNumber;
                                arrGoods.push(v.goods);
                            });
                            deter_signUpGoods(arrGoods);
                        }
                    })
                }
            }
            //选班报名
            function deter_signUpClasses(param, _signType) {
                var arr = [];
                arr.push(param);
                console.log(arr);
                if (arr) {
                    angular.forEach(arr, function(val, ind) {
                        var objData_ = {
                            classInfo: val,
                            course: val.course,
                            mixid: GenNonDuplicateID(5),
                            //                          packageList: [],    //分期的套餐
                            //                          packageList_: [],   //课时的套餐
                            packageList: [],
                            package: { feeType: 0 },
                            package_: null,
                            discountType: '1',
                            discountPrice: '',
                            discountPrice_: '100',
                            discount_c: 0,
                            discountType_c: 0,
                            averageClassPrice: '',
                            contractMoney: '',
                            isShowClass: true,
                            oneTeacher: '', //一对一老师
                            chargeType: '1', //收费类型选择按天、按月（天、月）
                            monthNum: 0, //当收费类型是月时，月数
                            timeFrame: '', //时间范围
                            beginTime: $.format.date(new Date(), 'yyyy-MM-dd'),
                            time_id: val.course.courseId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                            signType: _signType ? _signType : (val.course.signType ? 2 : ($scope.contractList ? 3 : 1)), //报名类型，新报-续报-扩科
                        };
                        //通过收费标准id获取所有套餐
                        $.hello({
                            url: CONFIG.URL + "/api/oa/chargeStandard/listPackage",
                            type: "get",
                            data: {
                                'chargeStandardId': val.course.chargeStandardId,
                            },
                            success: function(res) {
                                if (res.status == '200') {
                                    console.log(res)
                                    objData_.packageList = res.context;
                                    objData_.packageList_old = angular.copy(res.context);

                                    //                                  //如果是分期的
                                    //                                  if(val.package.feeType == '1') {
                                    //                                      if(val.schoolTerm){
                                    //                                          objData_['schoolYear'] = val.schoolYear+"";
                                    //                                          angular.forEach($scope.schoolTermList, function(v_) {
                                    //                                              if(v_.schoolTermId == val.schoolTerm.schoolTermId) {
                                    //                                                  objData_['schoolTerm'] = v_;
                                    //                                                  getSchoolTerm(objData_);
                                    //                                              }
                                    //                                          })
                                    //                                      }
                                    //                                      if(props.special == 'xuqian' || props.special == 'shengban_signup') { //续费套餐id自动带入
                                    //                                          if(props.item.schoolTerm) {
                                    //                                              objData_['schoolYear'] = props.item.schoolTerm.schoolYear + '';
                                    //                                              angular.forEach($scope.schoolTermList, function(v_) {
                                    //                                                  if(v_.schoolTermId == props.item.schoolTerm.schoolTermId) {
                                    //                                                      objData_.schoolTerm = v_;
                                    //                                                      selSchoolTerm(objData_);
                                    //                                                  }
                                    //                                              })
                                    //                                          }
                                    //                                      }
                                    //                                  }
                                    if (props.special == 'xuqian' || props.special == 'shengban_signup') { //续费套餐id自动带入
                                        if (props.item.schoolTerm) {
                                            objData_['schoolYear'] = props.item.schoolTerm.schoolYear + '';
                                            angular.forEach($scope.schoolTermList, function(v_) {
                                                if (v_.schoolTermId == props.item.schoolTerm.schoolTermId) {
                                                    objData_.schoolTerm = v_;
                                                }
                                            })
                                        }
                                    }
                                    //获取按月续签课程的最大结束时间
                                    if (props.special == 'xuqian' || props.special == 'renew') {
                                        if (props.item.contractId) {
                                            $.hello({
                                                url: CONFIG.URL + "/api/oa/contract/getMaxContractRenew",
                                                type: "get",
                                                data: {
                                                    'contractId': props.item.contractId,
                                                },
                                                success: function(res) {
                                                    if (res.status == '200') {
                                                        objData_['beginTime'] = $.format.date(res.context.giveEndTime, 'yyyy-MM-dd');
                                                    };
                                                }
                                            })
                                        }
                                    }

                                    $scope.sign_parmas2.push(objData_);
                                    console.log($scope.sign_parmas2);
                                };
                            }
                        })

                        if (val.course.courseGoodsRS && val.course.courseGoodsRS.length > 0) {
                            var list = val.course.courseGoodsRS;
                            var arrGoods = [];
                            angular.forEach(list, function(v) {
                                v.goods.goodsNumber = v.goodsNumber;
                                arrGoods.push(v.goods);
                            });
                            deter_signUpGoods(arrGoods);
                        }
                    });
                }
            }

            function deter_signUpGoods(arr) {
                var arr_1 = [];
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].goodsType == 1) { //学杂默认选中第一项
                        if (arr[i].goodsSpec) { //已存在学杂规格例如课程包传入学杂
                            arr[i]['goodsPrice_'] = arr[i].goodsSpec.price;
                            arr[i]['goodsSpecId'] = arr[i].goodsSpec.goodsSpecId + '';
                            arr[i]['goodsSpecName'] = arr[i].goodsSpec.name;
                        } else {
                            if (arr[i].goodsSpecList && arr[i].goodsSpecList.length) {
                                arr[i]['goodsPrice_'] = arr[i].goodsSpecList[0].price;
                                arr[i]['goodsPrice'] = arr[i].goodsSpecList[0].price;
                                arr[i]['goodsSpecId'] = arr[i].goodsSpecList[0].goodsSpecId + '';
                                arr[i]['goodsSpecName'] = arr[i].goodsSpecList[0].name;
                                arr[i]['goodsNumber'] = 1;
                            }
                        }
                    } else {
                        arr[i]['goodsPrice_'] = arr[i]['goodsPrice_'] ? arr[i]['goodsPrice_'] : arr[i].goodsPrice;
                        arr[i]['goodsNumber'] = arr[i]['goodsNumber'] ? arr[i]['goodsNumber'] : 1;
                    }
                    arr_1.push(arr[i]);
                }
                $scope.sign_parmas2_goods = $scope.sign_parmas2_goods.concat(arr_1);
            }

            function deter_signUpClass(data) {
                if (data) {
                    $scope.courseItemInfo.item.classInfo = data;
                    $scope.courseItemInfo.item.isShowClass = true;
                }
            }
            //确定选择课程包
            function deter_signUpCoursePackage(data) {
                console.log(data);
                if (data) {
                    angular.forEach(data, function(v) {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/course/coursePackageInfo",
                            type: "get",
                            data: {
                                'coursePackageId': v.coursePackageId,
                            },
                            success: function(res) {
                                if (res.status == '200') {
                                    console.log(res);
                                    handleCoursePackage(res.context);
                                };
                            }
                        })
                    })
                }
            }
            //确认选择课程包处理数据
            function handleCoursePackage(d) {
                //处理课程
                angular.forEach(d.coursePackageCourseList, function(val) {
                    if ($scope.contractList) { //如果本学员有合同比较选择的课程是否是续费
                        angular.forEach($scope.contractList, function(v2) {
                            console.log(v2.courseId);
                            if (val.course.courseId == v2.courseId) val.signType = 2;
                        })
                    }
                    var ls_package = {};
                    var objData_ = {
                        course: val.course,
                        //                          packageList: [],    //分期的套餐
                        //                          packageList_: [],   //课时的套餐
                        mixid: GenNonDuplicateID(5),
                        packageList: [],
                        package: {},
                        package_: {},
                        amount: 0,
                        _d: val,
                        discountType: val.discountType ? val.discountType + '' : '1',
                        discountPrice: val.discounts ? val.discounts : '',
                        discountPrice_: val.discounts ? val.discounts : '100',
                        discount_c: 0,
                        discountType_c: 0,
                        averageClassPrice: '',
                        contractMoney: '',
                        isShowClass: false,
                        oneTeacher: '', //一对一老师
                        chargeType: '', //收费类型选择按天、按月（天、月）
                        monthNum: 0, //当收费类型是月时，月数
                        timeFrame: '', //时间范围
                        beginTime: $.format.date(val.beginTime, 'yyyy-MM-dd'),
                        endTime: $.format.date(val.endTime, 'yyyy-MM-dd'),
                        time_id: val.course.courseId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                        signType: val.signType ? 2 : ($scope.contractList ? 3 : 1),
                    };
                    //通过收费标准id获取所有套餐
                    $.hello({
                        url: CONFIG.URL + "/api/oa/chargeStandard/listPackage",
                        type: "get",
                        data: {
                            'chargeStandardId': val.course.chargeStandardId,
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                console.log(res)
                                objData_.packageList = res.context;
                                objData_.packageList_old = angular.copy(res.context);
                                //如果是分期
                                if (val.feeType == '1') {
                                    objData_['schoolYear'] = val.schoolYear + '';
                                    if ($scope.schoolTermList) {
                                        angular.forEach($scope.schoolTermList, function(_v) {
                                            if (val.schoolTermId == _v.schoolTermId) {
                                                objData_.schoolTerm = _v;
                                            }
                                        })
                                    }
                                }
                                if (val.packageId) { //如果套餐赋值
                                    angular.forEach(res.context, function(val_2) {
                                        if (val.packageId == val_2.packageId) {
                                            objData_['package_'] = val_2;
                                        }
                                    });
                                }
                                if (val.feeType == "2") {
                                    objData_['monthNum'] = getDatemonth(val.beginTime, val.endTime);
                                }

                                objData_['package_']['feeType'] = val.feeType;
                                objData_['package_']['packageTime'] = val.buyTime;
                                objData_['package_']['packagePrice'] = val.coursePrice;
                                objData_['package_']['giveTime'] = val.giveTime;
                                if (val && val.feeType == '2' && val.chargeType != '1') {
                                    objData_['package_']['packageUnitPrice'] = numAccuracy((objData_['package_']['packagePrice'] / objData_['package_']['packageTime']) * 30);
                                } else {
                                    objData_['package_']['packageUnitPrice'] = numAccuracy(objData_['package_']['packagePrice'] / objData_['package_']['packageTime']);
                                }
                                objData_['package'] = angular.copy(objData_['package_']);
                                if (val.discountType == '1') {
                                    objData_["amount"] = numAccuracy(objData_['package']['packagePrice'] - objData_.discountPrice);
                                } else {
                                    objData_["amount"] = numAccuracy(objData_['package']['packagePrice'] * (objData_.discountPrice_ / 100));
                                }
                                $scope.sign_parmas2.push(objData_);
                            };
                        }
                    })
                });
                //处理学杂
                if (d.coursePackageGoodsList && d.coursePackageGoodsList.length > 0) {
                    var list = d.coursePackageGoodsList;
                    var arrGoods = [];
                    angular.forEach(list, function(v) {
                        v.goods['goodsSpecList'] = v.goodsSpecList || [];
                        v.goods['goodsSpec'] = v.goodsSpec || '';
                        v.goods['goodsPrice_'] = v.goods.goodsPrice;
                        v.goods['goodsPrice'] = v.goodsPrice;
                        v.goods['goodsNumber'] = v.goodsNumber || '';
                        arrGoods.push(v.goods);
                    });
                    deter_signUpGoods(arrGoods, true);
                }
            }

            function deter_choseClass(data) {
                console.log($scope.courseItemInfo);
                $scope.courseItemInfo.item.choseClassType = $scope.courseItemInfo.choseClassType;
                if ($scope.courseItemInfo.choseClassType == '0') {
                    if (!$scope.courseItemInfo.classInfo) {
                        layer.msg('请选择班级');
                        return;
                    }
                    if ($scope.courseItemInfo.insertClassTime == '2') {
                        if (!$scope.courseItemInfo.futureTime) {
                            layer.msg('请填写未来时间');
                            return;
                        }
                        $scope.courseItemInfo.item.futureTime = $scope.courseItemInfo.futureTime;
                    }
                    $scope.courseItemInfo.item.classInfo = $scope.courseItemInfo.classInfo;
                    $scope.courseItemInfo.item.insertClassTime = $scope.courseItemInfo.insertClassTime;
                } else {
                    $scope.courseItemInfo.item.willTime = $scope.courseItemInfo.willTime;
                    $scope.courseItemInfo.item.teachers = $scope.courseItemInfo.teachers;
                }

                $scope.courseItemInfo.item.isShowClass = true;
                $scope.closePopup('signUp_choseClass');
                console.log($scope.sign_parmas2);
            }

            function del_signUpCourse(ind) {
                var _id = $scope.sign_parmas2[ind].time_id;
                $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                $scope.sign_parmas2.splice(ind, 1);
                //                  $scope.$apply();
                //              var isDelect = layer.confirm('是否删除该报名课程？', {
                //                  title: "确认删除信息",
                //                  skin: 'newlayerui layeruiCenter',
                //                  closeBtn: 1,
                //                  offset: '30px',
                //                  move: false,
                //                  area: '560px',
                //                  btn: ['是', '否'] //按钮
                //              }, function() {
                //                  var _id = $scope.sign_parmas2[ind].time_id;
                //                  $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                //                  $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                //                  $scope.sign_parmas2.splice(ind, 1);
                //                  $scope.$apply();
                //                  layer.close(isDelect);
                //              }, function() {
                //                  layer.close(isDelect);
                //              })
            }

            function del_signUpGoods(ind) {
                $scope.sign_parmas2_goods.splice(ind, 1);
                //              $scope.$apply();
                //              var isDelect = layer.confirm('是否删除该学杂？', {
                //                  title: "确认删除信息",
                //                  skin: 'newlayerui layeruiCenter',
                //                  closeBtn: 1,
                //                  offset: '30px',
                //                  move: false,
                //                  area: '560px',
                //                  btn: ['是', '否'] //按钮
                //              }, function() {
                //                  $scope.sign_parmas2_goods.splice(ind, 1);
                //                  $scope.$apply();
                //                  layer.close(isDelect);
                //              }, function() {
                //                  layer.close(isDelect);
                //              })
            }

            function addparentInfo() {
                if ($scope.sign_parmas.contacts_.length >= 2) {
                    layer.msg('最多添加三个联系人');
                } else {
                    $scope.sign_parmas.contacts_.push({ phone: '', type: '0' });
                }
            }

            function del_signParent(ind) {
                $scope.sign_parmas.contacts_.splice(ind, 1);
            }
            //获取潜客详情
            function getPotentialInfo(id) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/sale/getPotentialCustomer",
                    type: "get",
                    data: { id: id },
                    success: function(res) {
                        if (res.status == 200) {
                            console.log(res);
                            $scope.potentialInfo = res.context;

                            $scope.sign_parmas = {
                                name: res.context.name,
                                nickName: res.context.nickname,
                                sex: res.context.sex,
                                ageType: res.context.birthday ? "1" : "2",
                                age: res.context.age,
                                birthday: res.context.birthday,
                                cardId: res.context.studentIdCard,
                                oaUserId: res.context.oaUserId,
                                contacts: { //主要联系人
                                    phone: res.context.potentialCustomerParentPhone,
                                    type: res.context.potentialCustomerParentType ? res.context.potentialCustomerParentType : '1',
                                },
                                contacts_: [ //其他联系人
                                    { type: '', phone: '' },
                                    { type: '', phone: '' },
                                ],
                                school: res.context.schoolName,
                                address: res.context.address,
                                desc: res.context.potentialCustomerDesc,
                                tags: res.context.tags ? res.context.tags : undefined,
                                grade: res.context.grade ? res.context.grade.toString() : undefined,
                                channel: res.context.channelTypeId ? res.context.channelTypeId : undefined,
                                channel2: res.context.channelId ? res.context.channelId : undefined,
                                recmd: res.context.potentialCustomerFromUserId ? res.context.potentialCustomerFromUserId : undefined,
                                pickupWeek: [
                                    { type: 0, name: "午托", weekList: [1, 2, 3, 4, 5, ] },
                                    { type: 1, name: "晚托", weekList: [1, 2, 3, 4, 5, ] },
                                ],
                                pickUpShow: checkAuthMenuById(124) && (((window.currentUserInfo.shop.config) & 0x0200) > 0), //有权限且开关开启
                                reference:  res.context.referrerId ? {
                                    type:1,
                                    name:  res.context.referrerName,
                                    id:  res.context.referrerId,
                                    phone:  res.context.referrerPhone
                                } : undefined,
                                reference_old: {
                                    type:1,
                                    name:  res.context.referrerName,
                                    id:  res.context.referrerId,
                                    phone:  res.context.referrerPhone
                                }
                            };
                            if (res.context.channelTypeId) $scope.otherFun.operate(2, res.context.channelTypeId, 'yes'); //如果有来源渠道，则选中这条来源渠道
                            if (res.context.potentialCustomerParentTowName || res.context.potentialCustomerParentTowPhone || res.context.potentialCustomerParentTowType) {
                                $scope.sign_parmas.contacts_[0] = {
                                    phone: res.context.potentialCustomerParentTowPhone,
                                    type: res.context.potentialCustomerParentTowType ? res.context.potentialCustomerParentTowType : '0',
                                };
                            }
                            if (res.context.potentialCustomerParentThreeName || res.context.potentialCustomerParentThreePhone || res.context.potentialCustomerParentThreeType) {
                                $scope.sign_parmas.contacts_[1] = {
                                    phone: res.context.potentialCustomerParentThreePhone,
                                    type: res.context.potentialCustomerParentThreeType ? res.context.potentialCustomerParentThreeType : '0',
                                };
                            }
                            if (res.context.pickUpList) {
                                angular.forEach($scope.sign_parmas.pickupWeek, function(v, i) {
                                    v["week"] = [false];
                                    angular.forEach(res.context.pickUpList, function(v_, i_) {
                                        if (v.type == v_.pickUpType) {
                                            v.week[v_.pickUpWeek] = true;
                                        }
                                    });
                                });
                            }
                            //直接跳转到第二步的特殊处理
                            switch (props.special) {
                                case 'renew':
                                    confirm_peoInfo();
                                    if (props.item.courseId) {
                                        props.item.courseName = props.item.lastCourseName;
                                        deter_signUpCourse([props.item], 2);
                                    }
                                    break;
                                case 'xuqian':
                                    confirm_peoInfo();
                                    deter_signUpCourse([props.item], 2);
                                    break;
                                case 'activity_signup':
                                    confirm_peoInfo();
                                    break;
                                case 'shengban_signup':
                                    confirm_peoInfo();
                                    var LS_signType = 3;
                                    if ($scope.contractList) { //如果本学员有合同比较选择的课程是否是续费
                                        angular.forEach($scope.contractList, function(v2) {
                                            console.log(v2.courseId);
                                            if (props.item.course.courseId == v2.courseId) LS_signType = 2;
                                        })
                                    }
                                    deter_signUpCourse([props.item.course], LS_signType);
                                    break;
                                case 'outside':
                                    confirm_peoInfo();
                                    break;
                            }
                        }
                    }
                });
            }

            function getWeeklist() {
                var arr = [];
                angular.forEach($scope.sign_parmas.pickupWeek, function(v) {
                    var weekArr = []; //判断week对象是否为空对象
                    for (var i in v.week) { //循环多选的星期
                        if (v.week[i]) {
                            weekArr.push(i);
                        }
                    }
                    if (weekArr.length > 0) {
                        angular.forEach(weekArr, function(v_) {
                            arr.push({
                                'pickUpWeek': v_,
                                'pickUpType': v.type
                            })
                        })
                    }
                });
                return arr;
            }

            function confirm_peoInfo() { //第一步确认
                $('.activitySignupBtn').hide();
                //              if(!$scope.sign_parmas.channel) {
                //                  layer.msg('请填写学员来源渠道');
                //                  return;
                //              }
                var params = {
                    'potentialCustomerId': $scope.potentialInfo.potentialCustomerId,
                    'id': $scope.potentialInfo.id,
                    'address': $scope.sign_parmas.address ? $scope.sign_parmas.address : undefined,
                    'potentialCustomerDesc': $scope.sign_parmas.desc,
                    'potentialCustomerId': $scope.potentialInfo.potentialCustomerId,
                    'potentialCustomerParentPhone': $scope.sign_parmas.contacts.phone,
                    'potentialCustomerParentType': $scope.sign_parmas.contacts.type,
                    'schoolName': $scope.sign_parmas.school,
                    'img': props.page == 1 ? sourceLink : undefined,
                    'studentIdCard': $scope.sign_parmas.cardId,
                    'name': $scope.sign_parmas.name,
                    'nickname': $scope.sign_parmas.nickName,
                    'sex': $scope.sign_parmas.sex,
                    "tags": getTagId(),
                    "grade": $scope.sign_parmas.grade,
                    "channelTypeId": $scope.sign_parmas.channel,
                    "channelId": $scope.sign_parmas.channel2 ? $scope.sign_parmas.channel2 : undefined,
                    "potentialCustomerFrom": $scope.sign_parmas.channel,
                    "potentialCustomerFromUserId": $scope.sign_parmas.recmd ? $scope.sign_parmas.recmd : undefined,
                    "pickUpList": getWeeklist(),
                };
                if (!props.item.potentialCustomerId && props.location != 'pushOrder') {
                    params["referralType"] = $scope.sign_parmas.reference ? $scope.sign_parmas.reference.type : undefined;
                    params["targetId"] = $scope.sign_parmas.reference ? $scope.sign_parmas.reference.id : undefined;
                    if ($scope.sign_parmas.reference_old && $scope.sign_parmas.reference_old.id && !$scope.sign_parmas.reference) {
                        params["targetId"] = "-1";
                        params["referralType"] = $scope.sign_parmas.reference_old.type;
                    }
                }
                if ($scope.sign_parmas.ageType == 1) {
                    params["birthday"] = $scope.sign_parmas.birthday;
                }
                if ($scope.sign_parmas.ageType == 2) {
                    params["age"] = $scope.sign_parmas.age;
                }
                if (getWeeklist().length > 0) {
                    if (!$scope.sign_parmas.school || !$scope.sign_parmas.grade) {
                        return layer.msg("安排接送的学员学校和年级必填！");
                    }
                }
                if (!$scope.sign_parmas.contacts.phone) {
                    layer.msg('主要联系人手机号码不能为空');
                    return;
                }
                if (!/^1[0-9]{10}$/.test($scope.sign_parmas.contacts.phone)) {
                    layer.msg('主要联系人手机号码不正确');
                    return;
                }
                if ($scope.repeatStudentList && $scope.repeatStudentList.length > 0) {
                    var j = false;
                    angular.forEach($scope.repeatStudentList, function(v) {
                        if ($scope.sign_parmas.name == v.name && $scope.sign_parmas.contacts.phone == v.potentialCustomerParentPhone) {
                            j = true;
                        }
                    });
                    if (j) {
                        var isdelete = layer.confirm('本校区已有相同姓名和手机号的学员，请检查，如果是该学员请选择', {
                            title: "提醒",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['确定'] //按钮
                        }, function() {
                            openPopByDiv('重复信息', '#sign_selectStudent', '860px');
                            layer.close(isdelete);
                        });
                        return
                        // return layer.msg("本校区已有相同姓名和手机号的学员，请检查，如果是该学员请选择");
                    }
                }
                if ($scope.sign_parmas.contacts_[0]) {
                    if ($scope.sign_parmas.contacts_[0].phone) {
                        if (!/^1[0-9]{10}$/.test($scope.sign_parmas.contacts_[0].phone)) {
                            layer.msg('备用联系人手机号码不正确');
                            return;
                        }
                        if (!$scope.sign_parmas.contacts_[0].type) {
                            layer.msg('请选择备用联系人关系');
                            return;
                        }
                        params['potentialCustomerParentTowPhone'] = $scope.sign_parmas.contacts_[0].phone;
                        params['potentialCustomerParentTowType'] = $scope.sign_parmas.contacts_[0].type;
                    }
                }
                if ($scope.sign_parmas.contacts_[1]) {
                    if ($scope.sign_parmas.contacts_[1].phone) {
                        if (!/^1[0-9]{10}$/.test($scope.sign_parmas.contacts_[1].phone)) {
                            layer.msg('备用联系人手机号码不正确');
                            return;
                        }
                        if (!$scope.sign_parmas.contacts_[1].type) {
                            layer.msg('请选择备用联系人关系');
                            return;
                        }
                        params['potentialCustomerParentThreePhone'] = $scope.sign_parmas.contacts_[1].phone;
                        params['potentialCustomerParentThreeType'] = $scope.sign_parmas.contacts_[1].type;
                    }
                }
                params = detEmptyField(params); //去除空的字段
                console.log(params);
                $scope.student_params = params;

                if (props.item.potentialCustomerId) { //判断是新生报名还是老生报名
                    //判断是否拥有活动报名
                    $.hello({
                        url: CONFIG.URL + "/api/oa/activity/getActivityJoinCount",
                        type: "get",
                        data: {
                            potentialCustomerId: props.item.potentialCustomerId,
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                if (res.context) {
                                    $('.activitySignupBtn').show();
                                    $('.activitySignupBtn').html('活动报名(' + res.context + ')');
                                    ACTIVITYSIGNUP();
                                }
                                //                              else {
                                //                                  $('.activitySignupBtn').html('活动报名');
                                //                              }
                            }
                        }
                    });
                    $scope.couponObj.getData(params['potentialCustomerId']);
                }
                $scope.navigation_bar_bgm = '2';
            }


            function resetSign_params3() {
                $scope.sign_parmas3 = Object.assign({}, $scope.sign_parmas3, {
                    contractMoney: 0,
                    receivableMoney: 0,
                    netreceiptsMoney: 0,
                    payTime: props.location == 'pushOrder' ? ($.format.date(new Date(), 'yyyy-MM-dd')) : ($.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss')),
                    // adviser: [], //顾问
                    agent: localStorage.getItem('shopTeacherId'), //经办人
                    // desc: ''
                }); //点击第二步的下一步
                if ($scope.potentialInfo.oaUserId && $scope.potentialInfo.oaUserName && $scope.sign_parmas3.adviser.length == 0) {
                    $scope.sign_parmas3.adviser.push({ 'shopTeacherId': $scope.potentialInfo.oaUserId, 'teacherName': $scope.potentialInfo.oaUserName, 'percentage': 100 });
                }
                console.log($scope.potentialInfo.accountBalance);
                $scope.PayProjectList = {
                    'student': { 'paymentMode': '学员账户', 'paymentMoney': '' },
                    'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '' },
                };
            }

            function confirm_peoInfo2() {
                resetSign_params3(); //第三步数据初始化
                console.log('第二步信息', $scope.sign_parmas2);
                //把课程报名的数据和活动报名的数据合并起来
                var act_infoList = angular.copy($scope.activitySignupList);
                $scope.sign_parmas2_all.courselis = angular.copy($scope.sign_parmas2);
                $scope.sign_parmas2_all.goodslis = angular.copy($scope.sign_parmas2_goods);
                angular.forEach(act_infoList, function(val) {
                    if (val.activity_course && val.activity_course.length > 0) {
                        $scope.sign_parmas2_all.courselis = $scope.sign_parmas2_all.courselis.concat(val.activity_course);
                    };
                    if (val.activity_goods && val.activity_goods.length > 0) {
                        $scope.sign_parmas2_all.goodslis = $scope.sign_parmas2_all.goodslis.concat(val.activity_goods);
                    }
                });

                var judgeReturn = [true, ''];
                $scope.sign_parmas3.receivableMoney = 0; //应收金额

                //判断是否有选择课程(判断选择的课程是否符合标准)
                angular.forEach($scope.sign_parmas2_all.courselis, function(val) {
                    //根据收费标准进行第一次判断
                    switch (val.package.feeType + '') {
                        case '1':
                            if (!val.schoolYear) {
                                judgeReturn = [false, '请选择学年'];
                                return;
                            };
                            if (!val.schoolTerm) {
                                judgeReturn = [false, '请选择学期'];
                                return;
                            };
                            break;
                        case '2':
                            if (val.chargeType == 1) {
                                if (!val.monthNum) {
                                    val.endTime = val.beginTime;
                                }
                                if (val.monthNum === '') {
                                    judgeReturn = [false, '请输入购买月数'];
                                    return;
                                }
                                if (val.monthNum == 0 && !val.package.giveTime) {
                                    judgeReturn = [false, '签约天数需大于0'];
                                    return;
                                }
                            } else {
                                if (!val.beginTime) {
                                    judgeReturn = [false, '请选择课程开始时间'];
                                    return;
                                };
                                if (!val.endTime) {
                                    judgeReturn = [false, '请选择课程结束时间'];
                                    return;
                                };
                                if (CompareDate(val.beginTime, val.endTime)) {
                                    judgeReturn = [false, '课程开始时间不能大于结束时间'];
                                    return;
                                }
                            }
                            break;
                    }

                    val.package.packageTime = val.package.packageTime ? val.package.packageTime : 0; //购买课时
                    val.package.packagePrice = val.package.packagePrice ? val.package.packagePrice : 0; //课程价格
                    val.package.giveTime = val.package.giveTime ? val.package.giveTime : 0; //赠送课时
                    if (val.package.packageTime == 0) val.package.packagePrice = 0; //如果购买课时为0.课程价格为0
                    if (!val.package.packageTime && !val.package.giveTime) {
                        judgeReturn = [false, '请填写购买课时（天数）或者赠送课时（天数）'];
                        return;
                    }

                    //算钱
                    var money = 0,
                        money_c = 0; //应收、课程和优惠券优惠之后的签约金额
                    if (val.discountType == '1') {
                        money = val.package.packagePrice - val.discountPrice;
                    } else {
                        money = val.package.packagePrice * (val.discountPrice_ / 100);
                    }
                    money_c = money * 1 - numAccuracy(val.discountPrice_c) * 1;
                    $scope.sign_parmas3.receivableMoney = numAccuracy($scope.sign_parmas3.receivableMoney * 1 + (money_c * 1));
                    $scope.sign_parmas3.contractMoney = numAccuracy($scope.sign_parmas3.contractMoney * 1 + (money_c * 1));
                });
                console.log($scope.sign_parmas2_all.courselis);
                //判断是否有选择学杂
                if ($scope.sign_parmas2_all.courselis.length == 0 && $scope.sign_parmas2_all.goodslis.length == 0) {
                    judgeReturn = [false, '请选择报名课程或选择学杂'];
                }

                if ($scope.sign_parmas2_all.goodslis.length > 0) {
                    var goodsMoney = 0;
                    angular.forEach($scope.sign_parmas2_all.goodslis, function(v) {
                        goodsMoney += v.goodsPrice * v.goodsNumber;
                    });
                    $scope.sign_parmas3.receivableMoney = numAccuracy($scope.sign_parmas3.receivableMoney + goodsMoney);
                    $scope.sign_parmas3.contractMoney = numAccuracy($scope.sign_parmas3.contractMoney + goodsMoney);
                }

                if (!judgeReturn[0]) { //如果不符合条件则返回操作
                    layer.msg(judgeReturn[1]);
                    return;
                }
                getAdviserList(); //获取顾问和经办人
                $scope.navigation_bar_bgm = '3';

                if (props.location == 'pushOrder') {
                    $scope.sign_parmas3.payTime = yznDateFormatYMd(yznDateAdd(new Date(), 7));
                    //时间控件-收款时间
                    laydate.render({
                        elem: '#sign_payTime', //指定元素
                        isRange: false,
                        type: 'date',
                        value: yznDateFormatYMd(yznDateAdd(new Date(), 7)),
                        done: function(value) {
                            $scope.sign_parmas3.payTime = value;
                        }
                    });
                } else {
                    //时间控件-收款时间
                    laydate.render({
                        elem: '#sign_payTime', //指定元素
                        isRange: false,
                        type: 'datetime',
                        max: $.format.date(new Date(), 'yyyy-MM-dd') + ' 23:59:59',
                        done: function(value) {
                            $scope.sign_parmas3.payTime = value;
                        }
                    });
                }

                if ($scope.props.fromPaytreasure) { //来自易收宝订单关联  无需处理学员账户
                    $scope.PayProjectList.student.paymentMoney = 0;
                    $scope.PayProjectList.other.paymentMoney = $scope.props.fromPaytreasure.paymentMoney;
                } else {
                    if (($scope.sign_parmas3.contractMoney - ($scope.potentialInfo.accountBalance || 0)) <= 0) {
                        $scope.PayProjectList.student.paymentMoney = $scope.sign_parmas3.contractMoney;
                        $scope.PayProjectList.other.paymentMoney = 0;
                    } else {
                        $scope.PayProjectList.student.paymentMoney = ($scope.potentialInfo.accountBalance || 0);
                        $scope.PayProjectList.other.paymentMoney = numAccuracy($scope.sign_parmas3.contractMoney - ($scope.potentialInfo.accountBalance || 0));
                    }
                }
                $scope.sign_parmas3.receivableMoney_LS = angular.copy($scope.sign_parmas3.receivableMoney);
                watchPayMoney();
            };

            //监听应收金额
            function watchPayMoney() {
                console.log($scope.sign_parmas3.receivableMoney, $scope.sign_parmas3.receivableMoney_LS);
                $scope.sign_parmas3.receivableMoney = numAccuracy($scope.sign_parmas3.receivableMoney_LS - $scope.PayProjectList.student.paymentMoney);
            }

            //第三步点击确定即将生成订单
            function confirm_peoInfo3() {
                console.log('第二步信息', $scope.sign_parmas2);
                console.log('第三步信息', $scope.sign_parmas3);
                var advisers = [],
                    courseList = [],
                    goodsList = [],
                    coursePriceTotal = 0,
                    params,
                    goodsT = 0,
                    arrearageMon = numAccuracy($scope.sign_parmas3.receivableMoney - $scope.PayProjectList.other.paymentMoney),
                    //欠费分摊  改为 缴费分摊 （多加字段 原逻辑不变）
                    arrearageMon_;
                //获取顾问
                angular.forEach($scope.sign_parmas3.adviser, function(val) {
                    advisers.push({ 'shopTeacherId': val.shopTeacherId, 'percentage': val.percentage });
                });
                //学杂
                if ($scope.sign_parmas2_all.goodslis.length > 0) {
                    angular.forEach($scope.sign_parmas2_all.goodslis, function(v) {
                        var ojData = {
                            'activityId': v.activityId ? v.activityId : undefined,
                            'activityJoinId': v.activityJoinId ? v.activityJoinId : undefined,
                            'goodsSpecId': v.goodsSpecId ? v.goodsSpecId : undefined,
                            "goodsId": v.goodsId,
                            "goodsName": v.goodsName, // 学杂名称
                            "goodsPrice": numAccuracy(v.goodsPrice * 1), // 学杂单价
                            "goodsNumber": v.goodsNumber * 1, // 学杂数量
                            "goodsTotalPrice": numAccuracy(v.goodsPrice * v.goodsNumber) // 学杂总价
                        }
                        goodsT += numAccuracy(v.goodsPrice * v.goodsNumber);
                        goodsList.push(ojData);
                    });
                }
                arrearageMon_ = numAccuracy($scope.PayProjectList.other.paymentMoney - goodsT) + numAccuracy($scope.PayProjectList.student.paymentMoney)
                    //获取班级信息
                angular.forEach($scope.sign_parmas2_all.courselis, function(val) {
                    console.log(val);
                    var objData = {
                        'activityId': val.activityId ? val.activityId : undefined,
                        'activityJoinId': val.activityJoinId ? val.activityJoinId : undefined,
                        'schoolTermId': val.schoolTerm ? val.schoolTerm.schoolTermId : undefined,
                        'schoolTermName': val.schoolTerm ? val.schoolTerm.schoolTermName : undefined,
                        'schoolYear': val.schoolYear ? val.schoolYear : undefined,
                        'courseId': val.course.courseId * 1,
                        'packageId': val.package_ ? val.package_.packageId : undefined,
                        'coursePrice': numAccuracy(val.package.packagePrice * 1),
                        //                      'chargeType': props.location == 'pushOrder'?val.package.feeType:undefined,
                        'feeType': val.package.feeType,
                        // 单课价
                        //                      'singleCoursePrice': numAccuracy(val.package.packagePrice / val.package.packageTime),
                        //                      'buyTime': numAccuracy(val.package.packageTime),
                        'giveTime': numAccuracy(val.package.giveTime),
                        'discountType': val.discountType * 1,
                        'discounts': val.discountType == '1' ? val.discountPrice * 1 : val.discountPrice_ * 1,
                        'discountAmount': val.discountType == '1' ? val.discountPrice * 1 : numAccuracy(val.package.packagePrice * 1 - val.package.packagePrice * 1 * val.discountPrice_ * 1 / 100), //课程优惠的金额，按折扣的也要转成金额
                        'couponDiscountAmount': undefined, //使用优惠券的优惠金额，折扣券已转换成金额
                        //                      有效期改成有效期至，存截止日期2019-09-25
                        //                      'beginTime': val.timeFrame? val.timeFrame.split('/')[0]+'00:00:00': undefined,
                        //                      'endTime': val.timeFrame? val.timeFrame.split('/')[1]+' 23:59:59': undefined,
                        'endTime': val.timeFrame ? yznDateFormatYMd(val.timeFrame) + ' 00:00:00' : undefined,
                        'arrearage': 0,
                        'arrearage_': 0,
                        //                      'amount':val.amount?val.mount:0,
                        'courseType': props.location == 'pushOrder' ? undefined : (val.signType ? val.signType : undefined),
                    }
                    if (val.package.feeType == 2) { //如果是按月份的报名
                        objData['beginTime'] = val.beginTime + ' 00:00:00';
                        objData['endTime'] = val.endTime + ' 00:00:00';
                    }
                    var old_amount = 0; //课程-优惠=老签约金额
                    if (val.discountType == '1') {
                        old_amount = numAccuracy(val.package.packagePrice - val.discountPrice);
                    } else {
                        old_amount = numAccuracy(val.package.packagePrice * (val.discountPrice_ / 100));
                    }
                    objData.amount = numAccuracy(old_amount - numAccuracy(val.discountPrice_c)); //课程-优惠-优惠券优惠=新签约金额

                    if (val.package.feeType == 2 && val.chargeType == '1') { //按月课程并且选择按月  购买天数、单课价
                        objData.buyTime = numAccuracy(val.monthNum == 0 ? 0 : getIntervalDays(val.beginTime, val.endTime) + 1);
                        //单课价
                        objData.singleCoursePrice = numAccuracy(val.package.packagePrice / val.package.packageTime / 30);
                    } else {
                        objData.buyTime = numAccuracy(val.package.packageTime);
                        //单课价
                        objData.singleCoursePrice = numAccuracy(val.package.packagePrice / val.package.packageTime);
                    }
                    //均课价
                    objData.averageCoursePrice = numAccuracy(objData.amount / objData.buyTime);

                    if ($scope.couponObj.data.sel_data && $scope.couponObj.data.sel_data.coupon) {
                        if ($scope.couponObj.data.sel_data.coupon.discountType == 1) {
                            objData.couponDiscountAmount = numAccuracy(val.discountPrice_c) * 1;
                        } else if ($scope.couponObj.data.sel_data.coupon.discountType == 2) {
                            objData.couponDiscountAmount = numAccuracy(old_amount * 1 - old_amount * val.discount_c * 1);
                        }
                    }
                    //插班或者意愿（插班）
                    //                  if(val.choseClassType == '0') {
                    objData.classInfo = {
                        lockStatus: '0',
                        classId: null
                    }
                    if (val.classInfo) {
                        objData.classInfo.classId = val.classInfo.classId;
                    }
                    //                      if(val.insertClassTime == '1') {
                    //                          objData.classInfo.lockStatus = '1';
                    //                      } else if(val.insertClassTime == '2' && val.futureTime) {
                    //                          objData.classInfo.classDate =  val.futureTime;
                    //                      }
                    //                  } else {
                    //                      objData.contractDates = val.willTime?val.willTime:undefined;
                    //                      if(val.teachers) {
                    //                          objData.teachers = [];
                    //                          angular.forEach(val.teachers, function(val) {
                    //                              objData.teachers.push({'teacherId': val.teacherId, 'shopTeacherId': val.shopTeacherId});
                    //                          })
                    //                      }
                    //                  }
                    if (val.course.teachingMethod == 1 && val.oneTeacher) {
                        objData.teachers = objData.teachers ? objData.teachers : [];
                        objData.teachers.push({ 'teacherId': val.oneTeacher.teacherId, 'shopTeacherId': val.oneTeacher.shopTeacherId });
                    }
                    //分摊欠费金额
                    if (arrearageMon) {
                        if (arrearageMon * 1 > objData.amount * 1) {
                            objData.arrearage = objData.amount;
                            arrearageMon = numAccuracy(arrearageMon - objData.amount);
                        } else {
                            objData.arrearage = arrearageMon;
                            arrearageMon = 0;
                        }
                    }
                    //缴费金额分摊
                    if (arrearageMon_) {
                        if (arrearageMon_ * 1 > objData.amount * 1) {
                            objData.arrearage_ = objData.amount;
                            objData.arrearage = 0;
                            arrearageMon_ = numAccuracy(arrearageMon_ - objData.amount);
                        } else {
                            objData.arrearage_ = arrearageMon_;
                            objData.arrearage = numAccuracy(objData.amount - objData.arrearage_);
                            arrearageMon_ = 0;
                        }
                    }
                    coursePriceTotal += numAccuracy(objData.amount);
                    courseList.push(objData);
                })
                params = {
                    advisers: advisers,
                    courseList: courseList,
                    goodsList: goodsList,
                    arrearage: numAccuracy($scope.sign_parmas3.receivableMoney - $scope.PayProjectList.other.paymentMoney), //欠费金额
                    arrearage_: numAccuracy($scope.PayProjectList.other.paymentMoney - goodsT) + numAccuracy($scope.PayProjectList.student.paymentMoney), //缴费金额
                    arrearageTotal: 0
                };
                console.log('报名数据', params);
                if (coursePriceTotal < params.arrearage) {
                    layer.msg('支付金额应需大于学杂费用');
                    return;
                }

                $scope.signArrearageShare = params;
                $scope.signArrearageShareChange = function(_da) {
                    if (_da) {
                        if (_da.arrearage_ * 1 > _da.amount * 1) {
                            layer.msg('分摊金额不能大于签约金额');
                            _da.arrearage_ = _da.amount;
                        }
                    }
                    $scope.signArrearageShare.arrearageTotal = 0;
                    $scope.signArrearageShare.arrearageTotal_ = 0; //缴费分摊总计
                    angular.forEach(params.courseList, function(v1) {
                        $scope.signArrearageShare.arrearageTotal += numAccuracy(v1.arrearage ? v1.arrearage : 0);
                        $scope.signArrearageShare.arrearageTotal_ += numAccuracy(v1.arrearage_ ? v1.arrearage_ : 0); //缴费分摊总计
                        v1.arrearage = numAccuracy(v1.amount - v1.arrearage_); //缴费分摊总计
                    });
                    $scope.signArrearageShare.arrearageTotal = numAccuracy($scope.signArrearageShare.arrearageTotal);
                    $scope.signArrearageShare.arrearageTotal_ = numAccuracy($scope.signArrearageShare.arrearageTotal_); //缴费分摊总计
                }
                $scope.signArrearageShareChange();
                $scope.signArrearageShare_confirm = function() {
                    if (numAccuracy($scope.signArrearageShare.arrearageTotal_) != numAccuracy($scope.signArrearageShare.arrearage_)) {
                        //                      layer.msg('分摊金额需等于欠费金额');
                        layer.msg('分摊金额需等于缴费金额');
                        return;
                    }
                    layer.close(dialog);
                    if ($scope.signArrearageShare.courseList && $scope.signArrearageShare.courseList.length !== 0) {
                        angular.forEach($scope.signArrearageShare.courseList, function(item) {
                            //                          delete item.rest_arrearage;
                            delete item.arrearage_;
                        })
                    }
                    if (props.location == 'pushOrder') { //如果是推单
                        $scope.unbindSevice = false;
                        getConfig();
                        //                      confirm_pushOrder($scope.signArrearageShare);
                        var arrId_ = [],
                            arrList = $scope.pushOrderData.peoType == 1 ? $scope.pushOrderData.students : $scope.pushOrderData.classList;
                        angular.forEach(arrList, function(v1) {
                            arrId_.push($scope.pushOrderData.peoType == 1 ? (v1.potentialCustomerId) : (v1.classId));
                        });
                        var param = {
                            'sendObject': $scope.pushOrderData.peoType,
                            'objects': arrId_
                        }
                        $.hello({
                                url: CONFIG.URL + "/api/oa/pushOrder/checkWxSubscribe",
                                type: 'get',
                                data: param,
                                success: function(data) {
                                    if (data.status == "200") { //已绑定服务号
                                        confirm_pushOrder($scope.signArrearageShare);
                                    } else { //未绑定服务号
                                        $scope.unbindSevice = true;
                                        var isEdit = layer.confirm(data.message + '未绑定服务号，目前无法收到订单支付提醒。后续引导学员绑定服务号后系统会自动重新发送订单支付提醒。您还可以直接分享链接给学员进行支付。是否继续？', {
                                            title: "提示信息",
                                            skin: 'newlayerui layeruiCenter',
                                            closeBtn: 1,
                                            offset: '30px',
                                            move: false,
                                            area: '560px',
                                            btn: ['确定', '取消'] //按钮
                                        }, function() {
                                            layer.close(isEdit);
                                            confirm_pushOrder($scope.signArrearageShare);
                                        }, function() {
                                            layer.close(isEdit);
                                        })
                                        return true;
                                    }
                                }
                            })
                            //                      confirm_pushOrder($scope.signArrearageShare);
                    } else {
                        confirm_sign($scope.signArrearageShare);
                    }
                }
                if (courseList.length > 1 && $scope.signArrearageShare.arrearage > 0) {
                    openPopByDiv('缴费金额分摊', '#sign_arrearage_share', '760px');
                } else {
                    if ($scope.signArrearageShare.courseList && $scope.signArrearageShare.courseList.length !== 0) {
                        angular.forEach($scope.signArrearageShare.courseList, function(item) {
                            //                          delete item.rest_arrearage;
                            delete item.arrearage_;
                        })
                    }
                    if (props.location == 'pushOrder') { //如果是推单
                        $scope.unbindSevice = false;
                        getConfig();
                        //                      confirm_pushOrder($scope.signArrearageShare);
                        var arrId_ = [],
                            arrList = $scope.pushOrderData.peoType == 1 ? $scope.pushOrderData.students : $scope.pushOrderData.classList;
                        angular.forEach(arrList, function(v1) {
                            arrId_.push($scope.pushOrderData.peoType == 1 ? (v1.potentialCustomerId) : (v1.classId));
                        });
                        var param = {
                            'sendObject': $scope.pushOrderData.peoType,
                            'objects': arrId_
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/pushOrder/checkWxSubscribe",
                            type: 'get',
                            data: param,
                            success: function(data) {
                                if (data.status == "200") { //已绑定服务号
                                    confirm_pushOrder($scope.signArrearageShare);
                                } else { //未绑定服务号
                                    $scope.unbindSevice = true;
                                    var isEdit = layer.confirm(data.message + '未绑定服务号，目前无法收到订单支付提醒。后续引导学员绑定服务号后系统会自动重新发送订单支付提醒。您还可以直接分享链接给学员进行支付。是否继续？', {
                                        title: "提示信息",
                                        skin: 'newlayerui layeruiCenter',
                                        closeBtn: 1,
                                        offset: '30px',
                                        move: false,
                                        area: '560px',
                                        btn: ['确定', '取消'] //按钮
                                    }, function() {
                                        layer.close(isEdit);
                                        confirm_pushOrder($scope.signArrearageShare);
                                    }, function() {
                                        layer.close(isEdit);
                                    })
                                    return true;
                                }
                            }
                        })
                    } else {
                        confirm_sign($scope.signArrearageShare);
                    }
                }
            }

            //点击确定推单
            function confirm_pushOrder(dataObj) {
                var arrId = [],
                    arrList = $scope.pushOrderData.peoType == 1 ? $scope.pushOrderData.students : $scope.pushOrderData.classList,
                    params;
                angular.forEach(arrList, function(v1) {
                    arrId.push($scope.pushOrderData.peoType == 1 ? (v1.potentialCustomerId) : (v1.classId));
                });
                params = {
                    'sendObject': $scope.pushOrderData.peoType,
                    'objects': arrId,
                    'orderCourseList': dataObj.courseList.length > 0 ? angular.copy(dataObj.courseList) : undefined,
                    'orderGoods': dataObj.goodsList.length > 0 ? dataObj.goodsList : undefined,
                    'remark': $scope.sign_parmas3.desc,
                    'externalRemark': $scope.sign_parmas3.desc_out,
                    'handlerId': $scope.sign_parmas3.agent * 1,
                    'received': numAccuracy($scope.PayProjectList.other.paymentMoney),
                    'deadline': $scope.sign_parmas3.payTime + ' 23:59:59',
                    'studentOrderDivides': dataObj.advisers,
                };
                console.log(params);
                $.hello({
                    url: CONFIG.URL + '/api/oa/pushOrder/addPushOrder',
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            if ($scope.unbindSevice) { //回到推单页面时，未绑定服务号的可按照以下弹框提示操作
                                $scope.$emit('newPushOrderSuccess', 'unbindSevice');
                            } else {
                                $scope.$emit('newPushOrderSuccess');
                            }
                            $scope.closePopup('signUp-popup');
                        }
                    }
                });
            }
            //点击签约
            function confirm_sign(dataObj) {
                //              layer.load();
                var isOnLinePayPro = [false, 0],
                    _url = "/api/oa/order/addStudentOrder";
                var PayProjectList = $scope.PayProjectList['other']['paymentMoney'] * 1 ? [$scope.PayProjectList['other']] : [];
                if ($scope.PayProjectList['student'].paymentMoney * 1) { //如果有学员账户的钱
                    PayProjectList.push($scope.PayProjectList['student']);
                }
                //如果有线上支付
                if ($scope.PayProjectList['other'].paymentMode == '易收宝' && $scope.PayProjectList['other'].paymentMoney * 1) isOnLinePayPro = [true, $scope.PayProjectList['other'].paymentMoney * 1];
                if ($scope.PayProjectList.other.paymentMoney === '') {
                    layer.msg('实收金额不能为空');
                    return;
                }
                if (numAccuracy(Number($scope.PayProjectList.other.paymentMoney) + Number($scope.PayProjectList.student.paymentMoney)) > $scope.sign_parmas3.contractMoney) {
                    layer.msg('实收金额不能大于应收金额');
                    return;
                }
                var params = {
                    'orderType': 1,
                    'receivable': numAccuracy($scope.sign_parmas3.receivableMoney),
                    'received': numAccuracy($scope.PayProjectList.other.paymentMoney),
                    'arrearage': numAccuracy($scope.sign_parmas3.receivableMoney - $scope.PayProjectList.other.paymentMoney),
                    'remark': $scope.sign_parmas3.desc,
                    'externalRemark': $scope.sign_parmas3.desc_out,
                    'studentOrderDivides': dataObj.advisers,
                    'handlerId': $scope.sign_parmas3.agent * 1,
                    'orderCourseList': dataObj.courseList.length > 0 ? angular.copy(dataObj.courseList) : undefined,
                    'orderGoods': dataObj.goodsList.length > 0 ? dataObj.goodsList : undefined,
                    'orderPaymentList': PayProjectList,
                    'paymentTime': $scope.sign_parmas3.payTime,
                    'studentInfo': $scope.student_params,
                    'couponPackageId': $scope.couponObj.data.sel_data.couponPackageId ? $scope.couponObj.data.sel_data.couponPackageId : undefined,
                    'totalPrice': $scope.couponObj.data.sel_data.total_ ? $scope.couponObj.data.sel_data.total_ : undefined,
                };

                console.log('报名数据', params);
                if (!params.handlerId) {
                    layer.msg('请选择经办人');
                    return;
                }
                if (isOnLinePayPro[0]) {
                    params.paymentTime = undefined;
                } else {
                    if (!params.paymentTime) {
                        layer.msg('请选择缴费时间');
                        return;
                    }
                }

                // 易收宝关联订单
                if ($scope.props.fromPaytreasure) {
                    console.log(params);
                    $.hello({
                        url: CONFIG.URL + '/api/onlinePayment/associateRecord',
                        type: "post",
                        data: JSON.stringify({
                            paymentBillId: $scope.props.fromPaytreasure.paymentBillId,
                            orderType: 1,
                            studentOrder: params,
                            handlerId: params.handlerId
                        }),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('报名成功', { icon: 1 });
                                $scope.$emit('paytreasure_success');
                                window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: data.context, page: '订单管理' });
                                $scope.closePopup('signUp-popup');
                            };
                        }
                    });
                    return;
                }
                //线下支付(非易收宝)
                if (!isOnLinePayPro[0]) {
                    $.hello({
                        url: CONFIG.URL + _url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('报名成功', { icon: 1 });
                                if (props.special !== 'shengban_signup') {
                                    if (props.newStudSign) {
                                        $scope.$emit('signUpSuccess', true);
                                    } else {
                                        $scope.$emit('signUpSuccess');
                                    }
                                    if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                        SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                    }
                                    $scope.$emit("reloadRecord");
                                    window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: data.context, page: '订单管理' });
                                } else {
                                    $scope.$emit('shengbanSignup');
                                }
                                $scope.closePopup('signUp-popup');
                            };
                        }
                    });
                } else {
                    // 小白盒收款
                    _url = '/api/onlinePayment/addOrder';
                    params['payType'] = 'oa';
                    $scope.f5Id = null;
                    //刷新订单支付状态
                    $scope.reloadOnlinePay = function(fn) {
                        if (!$scope.f5Id) return layer.msg('请先扫码');
                        $.hello({
                            url: CONFIG.URL + '/api/onlinePayment/getOrderPayStatus',
                            type: "get",
                            data: { 'orderId': $scope.f5Id },
                            success: function(res) {
                                if (res.status == 200) {
                                    if (res.context.payStatus == 1) {
                                        layer.msg('报名成功', { icon: 1 });
                                        fn('close');
                                        if ($scope.f5Id) {
                                            if (props.special !== 'shengban_signup') {
                                                if (props.newStudSign) {
                                                    $scope.$emit('signUpSuccess', true);
                                                } else {
                                                    $scope.$emit('signUpSuccess');
                                                }
                                                if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                                    SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                                }
                                                $scope.$emit("reloadRecord");
                                                window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: res.context, page: '订单管理' });
                                            } else {
                                                $scope.$emit('shengbanSignup');
                                            }
                                        }
                                        $scope.f5Id = null;
                                        $scope.closePopup('signUp-popup');
                                    } else if (res.context.payStatus == 0) {
                                        layer.msg('订单待支付');
                                    } else if (res.context.payStatus == 2) {
                                        layer.msg('订单已过期');
                                        $scope.f5Id = null;
                                        fn('clear_val');
                                    }
                                }
                            }
                        });
                    }
                    $scope.codeFn_ = function(code, fn) {
                        if (code) {
                            params.authCode = code;
                        }
                        $.hello({
                            url: CONFIG.URL + _url,
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.f5Id = data.context.orderId;
                                    //监听订单支付状态
                                    webSocketInit(data.context.orderId, function(event) {
                                        var res = JSON.parse(event);
                                        console.log(res);
                                        if (res.payStatus == 1) { //支付成功
                                            layer.msg('报名成功', { icon: 1 });
                                            fn('close');
                                            if ($scope.f5Id) {
                                                if (props.special !== 'shengban_signup') {
                                                    if (props.newStudSign) {
                                                        $scope.$emit('signUpSuccess', true);
                                                    } else {
                                                        $scope.$emit('signUpSuccess');
                                                    }
                                                    if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                                        SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                                    }
                                                    $scope.$emit("reloadRecord");
                                                    window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: data.context, page: '订单管理' });
                                                } else {
                                                    $scope.$emit('shengbanSignup');
                                                }
                                            }
                                            $scope.f5Id = null;
                                            $scope.closePopup('signUp-popup');
                                        } else {
                                            layer.msg('收款失败，请客户核实后重新扫码', {
                                                offset: '230px'
                                            });
                                            $scope.f5Id = null;
                                            fn('clear_val');
                                            $scope.$apply();
                                        }

                                    }, socketIo);

                                } else {
                                    $scope.f5Id = null;
                                    fn('clear_val');
                                    $scope.$apply();
                                }
                            }
                        });
                    };
                    window.$rootScope.yznOpenPopUp($scope, 'collection-pop', 'collection_pay', '560px', { emit: 'for_sign', paymentMoney: $scope.PayProjectList['other']['paymentMoney'] });
                    if (!$scope.$$listeners['for_sign']) {
                        $scope.$on('for_sign', function(e, data) {
                            if (data.name == 'apply') {
                                $scope.codeFn_(data.code, data.fn);
                            }
                            if (data.name == 'f5') {
                                $scope.reloadOnlinePay(data.fn);
                            }
                        });
                    }
                }
                return;
                $.hello({
                    url: CONFIG.URL + _url,
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {

                        if (data.status == '200') {
                            if (!isOnLinePayPro[0]) { //如果没有易收宝的时候直接支付成功
                                layer.msg('报名成功', { icon: 1 });
                                if (props.special !== 'shengban_signup') {
                                    if (props.newStudSign) {
                                        $scope.$emit('signUpSuccess', true);
                                    } else {
                                        $scope.$emit('signUpSuccess');
                                    }
                                    if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                        SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                    }
                                    $scope.$emit("reloadRecord");
                                    window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: data.context, page: '订单管理' });
                                } else {
                                    $scope.$emit('shengbanSignup');
                                }
                                $scope.closePopup('signUp-popup');

                            } else { //如果易收宝支付项的时候用扫码支付
                                $scope.onlindePayData = data.context;
                                $scope.onlindePayData['money'] = isOnLinePayPro[1];
                                console.log(data.context.qrCodeUrl);
                                $('.onlinePay_code').html('');
                                jQuery('.onlinePay_code').qrcode({ //渲染二维码
                                    render: "canvas", //也可以替换为table
                                    width: 240,
                                    height: 240,
                                    text: data.context.qrCodeUrl,
                                });
                                console.log('aaa')
                                    //支付完成自动关闭弹窗
                                webSocketInit(data.context.orderId, function(event) {
                                        var res = JSON.parse(event);
                                        console.log(res);
                                        // layer.close(dialog);
                                        $scope.closePopup('collection_pay');
                                        layer.msg('报名成功', { icon: 1 });
                                        if (props.special !== 'shengban_signup') {
                                            if (props.newStudSign) {
                                                $scope.$emit('signUpSuccess', true);
                                            } else {
                                                $scope.$emit('signUpSuccess');
                                            }
                                            if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                                SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                            }
                                            $scope.$emit("reloadRecord");
                                            window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: res, page: '订单管理' });
                                        } else {
                                            $scope.$emit('shengbanSignup');
                                        }
                                        $scope.closePopup('signUp-popup');
                                    }, socketIo)
                                    //刷新订单支付状态
                                $scope.reloadOnlinePay = function() {
                                        $.hello({
                                            url: CONFIG.URL + '/api/onlinePayment/getOrderPayStatus',
                                            type: "get",
                                            data: { 'orderId': data.context.orderId },
                                            success: function(res) {
                                                if (res.status == 200) {
                                                    if (res.context.payStatus == 1) {
                                                        // layer.close(dialog);
                                                        $scope.closePopup('collection_pay');
                                                        layer.msg('报名成功', { icon: 1 });
                                                        if (props.special !== 'shengban_signup') {
                                                            if (props.newStudSign) {
                                                                $scope.$emit('signUpSuccess', true);
                                                            } else {
                                                                $scope.$emit('signUpSuccess');
                                                            }
                                                            if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                                                SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                                            }
                                                            $scope.$emit("reloadRecord");
                                                            window.$rootScope.yznOpenPopUp($scope.$parent, 'order-info', 'orderInfo', '960px', { data: res.context, page: '订单管理' });
                                                        } else {
                                                            $scope.$emit('shengbanSignup');
                                                        }
                                                        $scope.closePopup('signUp-popup');
                                                    } else if (res.context.payStatus == 0) {
                                                        layer.msg('订单待支付');
                                                    } else if (res.context.payStatus == 2) {
                                                        layer.msg('订单已过期');
                                                    }
                                                }
                                            }
                                        });
                                    }
                                    //弹出扫码窗口
                                $scope.goPopup('collection_pay', '400px');
                                // 手工关闭
                                $scope.closewithFn = function(id) {
                                    $scope.closePopup(id);
                                    // $.hello({ //取消订单的回调方法
                                    //     url: CONFIG.URL + '/api/onlinePayment/closePopupCallBack',
                                    //     type: "post",
                                    //     data: JSON.stringify({ 'orderId': data.context.orderId }),
                                    //     success: function(res) {
                                    //         if (res.status == 200) {
                                    //             //                                              layer.msg('取消成功');
                                    //         }
                                    //     }
                                    // });
                                };
                            }
                        };
                    }
                });
            }
            //分布确定 下一步
            function ConfirmNext(order) {
                switch (order) {
                    case '1':
                        confirm_peoInfo();
                        break;
                    case '2':
                        confirm_peoInfo2();
                        break;
                    case '3':
                        confirm_peoInfo3();
                        break;
                    default:
                        break;
                };
            }
            //上一步
            function prevPopup(order) {
                $scope.navigation_bar_bgm = order;
                switch (order) {
                    case '1':
                        break;
                    case '2':
                        break;
                    default:
                        break;
                }
            }

            //活动报名窗口
            function ACTIVITYSIGNUP() {
                $scope.choseActivityCourse = choseActivityCourse; //点击选择课程
                $scope.deter_choseActivityCourse = deter_choseActivityCourse; //选择课程之后点击确定按钮
                $scope.judgeAllChecked = false; //判断未使用活动全选状态
                $scope.del_act_signup = del_act_signup; //删除活动报名数据
                $scope.activitySignupList = $scope.activitySignupList ? $scope.activitySignupList : []; //活动报名数据
                $scope.joinActivityList = []; //活动列表
                $scope.activity_signup = activity_signup_; //活动报名
                $scope.textOver = function(evt) {
                    evt.stopPropagation();
                    $(evt.target).find('.activity_signup_icon_text').show();
                }
                $scope.textOut = function(evt) {
                    evt.stopPropagation();
                    $('.activity_signup_icon_text').hide();
                    //                  $(evt.target).find('.activity_signup_icon_text').hide();
                }

                //点击活动报名
                function activity_signup_() {

                    getActivityList();
                    $scope.goPopup('signUp_joinActivity', '960px');
                    $scope.judgeAllChecked = false;
                }

                //如果是个人信息跳转过来的活动报名
                if (props.special == 'activity_signup') {
                    $scope.activitySignupList.push(handleActivityCourse(props.item));
                };

                function getActivityList(special) {
                    $scope.joinActivityList = []; //活动列表
                    $.hello({
                        url: CONFIG.URL + "/api/oa/activity/getActivityJoinList",
                        type: "get",
                        data: {
                            potentialCustomerId: props.item.potentialCustomerId,
                            prizeUseStatus: 0,
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                console.log(res);
                                angular.forEach(res.context, function(val) {
                                    val.hasChecked = false;
                                    var judge = true;
                                    angular.forEach($scope.activitySignupList, function(val_) {
                                        if (val.activityJoinId == val_.activityJoinId) {
                                            judge = false;
                                        }
                                    });

                                    if (judge) {
                                        $scope.joinActivityList.push(val);
                                    }
                                });
                            }
                        }
                    });
                }
                //点击选择活动课程
                function choseActivityCourse(d, type) {
                    if (type == 'all') {
                        angular.forEach($scope.joinActivityList, function(val) {
                            if ($scope.judgeAllChecked) {
                                val.hasChecked = true;
                            } else {
                                val.hasChecked = false;
                            }
                        });
                    } else {
                        if (d.hasChecked) {
                            d.hasChecked = false;
                        } else {
                            d.hasChecked = true;
                        }
                    }
                }

                //选完活动课程之后点击确定按钮
                function deter_choseActivityCourse() {
                    var activityList_all = [],
                        detailList = [];
                    angular.forEach($scope.joinActivityList, function(val) {
                        if (val.hasChecked) {
                            if (val.activityPrizeList && val.activityPrizeList.length > 0) {
                                activityList_all.push(handleActivityCourse(val));
                                if (val.paySwitch == 1) {
                                    detailList.push(val.activityId);
                                }
                            }
                        }
                    });

                    if (detailList.length > 0) {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/activity/checkActivityInventory",
                            type: "get",
                            data: {
                                activityIds: detailList.join(','),
                            },
                            success: function(res) {
                                if (res.status == 200) {
                                    console.log(res);
                                    if (res.context.length > 0) {
                                        detailMsk(res.context.join('，') + '，该活动名额已满，确定继续报名？', function() {
                                            $scope.activitySignupList = $scope.activitySignupList.concat(activityList_all);
                                            $scope.closePopup('signUp_joinActivity');
                                        })
                                    } else {
                                        $scope.activitySignupList = $scope.activitySignupList.concat(activityList_all);
                                        $scope.closePopup('signUp_joinActivity');
                                    }
                                }
                            }
                        });
                    } else {
                        $scope.activitySignupList = $scope.activitySignupList.concat(activityList_all);
                        $scope.closePopup('signUp_joinActivity');
                    }
                }

                //选完活动课程之后点击确定按钮-处理数据
                function handleActivityCourse(val) {
                    var result = null;
                    var listCourse = [];
                    var listGoods = [];
                    angular.forEach(val.activityPrizeList, function(val_) {
                        console.log(val_);
                        if (val_.prizeType == 'course') {
                            if ($scope.contractList) { //如果本学员有合同比较选择的课程是否是续费
                                angular.forEach($scope.contractList, function(v2) {
                                    if (val_.prizeId == v2.courseId) val_.signType = 2;
                                })
                            }
                            var ls_package = {};
                            var objData_ = {
                                'activityId': val.activityId,
                                'activityJoinId': val.activityJoinId,
                                'activityName': val.activityName,
                                'mixid': GenNonDuplicateID(5),
                                '_d': val_,
                                'course': {
                                    'courseId': val_.prizeId,
                                    'courseName': val_.prizeName,
                                    'chargeStandardId': val_.chargeStandardNew.chargeStandardId,
                                    'teachingMethod': val_.teachingMethod
                                },
                                //                              'packageList_': val_.packageList,
                                'packageList': val_.packageList,
                                'packageList_old': angular.copy(val_.packageList),
                                'package': {},
                                'package_': {},
                                'amount': 0,
                                'discountType': val_.discountType + '',
                                'discountPrice': val_.discounts,
                                'discountPrice_': '100',
                                'discount_c': 0,
                                'discountType_c': 0,
                                'averageClassPrice': '',
                                'contractMoney': '',
                                'timeFrame': '',
                                'chargeType': '', //收费类型（天、月）
                                'monthNum': 0, //当收费类型是月时，月数
                                'isShowClass': false,
                                'beginTime': val_.beginTime ? $.format.date(val_.beginTime, 'yyyy-MM-dd') : $.format.date(new Date(), 'yyyy-MM-dd'),
                                'endTime': $.format.date(val_.endTime, 'yyyy-MM-dd'),
                                'time_id': val_.prizeId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                                'signType': val_.signType ? 2 : ($scope.contractList ? 3 : 1),
                            };
                            //如果是分期
                            if (val_.feeType == '1') {
                                objData_['schoolYear'] = val_.schoolYear + '';
                                if ($scope.schoolTermList) {
                                    angular.forEach($scope.schoolTermList, function(_v) {
                                        if (val_.schoolTermId == _v.schoolTermId) {
                                            objData_.schoolTerm = _v;
                                        }
                                    })
                                }
                            }
                            //                          else {
                            //                              angular.forEach(val_.packageList, function(val_2) {
                            //                                  if(val_.packageId == val_2.packageId) {
                            //                                      ls_package = val_2;
                            //                                  }
                            //                              });
                            //                              objData_['package'] = ls_package;
                            //                          }
                            angular.forEach(val_.packageList, function(val_2) {
                                if (val_.packageId == val_2.packageId) {
                                    ls_package = val_2;
                                }
                            });
                            objData_['package_'] = ls_package;

                            if (val_.feeType == "2") {
                                objData_['monthNum'] = getDatemonth(objData_.beginTime, objData_.endTime);
                            }
                            objData_['package_']['feeType'] = val_.feeType;
                            objData_['package_']['packageTime'] = val_.buyTime;
                            objData_['package_']['packagePrice'] = val_.prizePrice;
                            objData_['package_']['giveTime'] = val_.giveTime;
                            if (val_.feeType == '2' && objData_.chargeType != '1') {
                                objData_['package_']['packageUnitPrice'] = numAccuracy((objData_['package_']['packagePrice'] / objData_['package_']['packageTime']) * 30);
                            } else {
                                objData_['package_']['packageUnitPrice'] = numAccuracy(objData_['package_']['packagePrice'] / objData_['package_']['packageTime']);
                            }
                            objData_['package'] = angular.copy(objData_['package_']);
                            if (val_.discountType == '1') {
                                objData_["amount"] = numAccuracy(objData_['package_']['packagePrice'] - objData_.discountPrice);
                            } else {
                                objData_["amount"] = numAccuracy(objData_['package_']['packagePrice'] * (objData_.discountPrice_ / 100));
                            }
                            listCourse.push(objData_);
                        } else {
                            listGoods.push({
                                'activityId': val.activityId,
                                'activityJoinId': val.activityJoinId,
                                'activityName': val.activityName,
                                'goodsId': val_.prizeId,
                                'goodsName': val_.prizeName,
                                'goodsPrice': val_.unitPrice,
                                'goodsPrice_': val_.unitPrice,
                                'goodsNumber': val_.prizeNumber,
                            });
                        }
                    });
                    result = { 'activity_course': listCourse, 'activity_goods': listGoods, 'activityName': val.activityName, 'activityJoinId': val.activityJoinId };
                    console.log(result)
                    return result;
                }

                //点击删除课程和学杂
                function del_act_signup(type, ind, ind_) {
                    console.log(ind, ind_)
                    var isConfirm = layer.confirm('确认删除?', {
                        title: "确认删除信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        if (type == 'course') {
                            $scope.activitySignupList[ind_].activity_course.splice(ind, 1);
                            if ($scope.activitySignupList[ind_].activity_course.length <= 0 && $scope.activitySignupList[ind_].activity_goods.length <= 0) {
                                $scope.activitySignupList.splice(ind_, 1);
                            };
                        } else if (type == 'goods') {
                            $scope.activitySignupList[ind_].activity_goods.splice(ind, 1);
                            if ($scope.activitySignupList[ind_].activity_course.length <= 0 && $scope.activitySignupList[ind_].activity_goods.length <= 0) {
                                $scope.activitySignupList.splice(ind_, 1);
                            };
                        } else if (type == 'all') {
                            $scope.activitySignupList.splice(ind, 1);
                        }
                        console.log($scope.activitySignupList);
                        layer.close(isConfirm);
                        $scope.$apply();
                    }, function() {
                        layer.close(isConfirm);
                    })
                }
            }


            //潜客信息选择标签方法复写
            function preSetMark() {
                $scope.goPopup("preSetMark_sign", "760px");
                SEL_tags();
            }

            function SEL_tags() {
                $scope.SEL_tags = {
                    selAll: false, //标签全选清除
                    markList: [],
                    selectedMarks: [],
                    choseType: 'checkbox',
                    addMark: addMark, //预设时间--新增或编辑时间弹出框
                    deletePreMark: deletePreMark, //预设时间--删除预设时间
                    selSingle_lf: selSingle_lf, //预设时间--单选预设时间
                    checkboxAll: checkboxAll, //全选标签
                    confirm_selMark: confirm_selMark, //已选择的标签
                    operateType: '',
                    mark: '',
                    //                  confirmMark: null, //新增或编辑预设时间
                };
                getMarkList();

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
                };

                function selSingle_lf(data, list, e) {
                    if (e.target.nodeName == "SPAN") return;
                    if ($scope.SEL_tags.choseType == 'radio') { //单选以及多选判断
                        $scope.SEL_tags.markList = data;
                    } else {
                        if (data.hasChecked) {
                            data.hasChecked = false;
                        } else {
                            data.hasChecked = true;
                        }
                    }
                }

                function addMark(type, x) {
                    $scope.SEL_tags.operateType = type;
                    $scope.SEL_tags.mark = type == "add" ? "" : x;
                    $scope.SEL_tags.confirmMark = confirmMark; //新增或编辑预设时间
                    $scope.goPopup("add_preSetMark_sign", "560px");

                    function confirmMark() {
                        var params = {
                            "name": $scope.SEL_tags.mark.name,
                        };
                        if ($scope.SEL_tags.operateType == "add") {
                            url = "/api/oa/tag/add";
                        } else {
                            url = "/api/oa/tag/update";
                            params["id"] = $scope.SEL_tags.mark.id;
                        }
                        $.hello({
                            url: CONFIG.URL + url,
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(res) {
                                if (res.status == 200) {
                                    getMarkList();
                                    $scope.closePopup('add_preSetMark_sign');
                                }
                            }
                        });
                    }
                }

                function deletePreMark(x) {
                    var isCfirm = layer.confirm('潜客/学员标签删除后将无法复原，确认删除？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        resize: false,
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        var param = {
                            "id": x.id
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/tag/delete",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.msg('已成功删除标签', {
                                        icon: 1
                                    });
                                    getMarkList();
                                };
                            }
                        })
                    }, function() {
                        layer.close(isCfirm);
                    })

                }

                function confirm_selMark() {
                    if ($scope.SEL_tags.choseType == "checkbox") {
                        var arr = [];
                        angular.forEach($scope.SEL_tags.markList, function(v) {
                            if (v.hasChecked) {
                                arr.push(v);
                            }
                        });
                    }
                    $scope.sign_parmas.tags = arr;
                    $scope.closePopup('preSetMark_sign');
                }

                function getMarkList() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/tag/list",
                        type: "get",
                        success: function(res) {
                            if (res.status == 200) {
                                console.log(res)
                                console.log($scope.sign_parmas.tags);
                                $scope.SEL_tags.markList = res.context;
                                angular.forEach($scope.SEL_tags.markList, function(v) {
                                    var isSelect = false;
                                    angular.forEach($scope.sign_parmas.tags, function(v_) {
                                        if (v.id == v_.id) {
                                            isSelect = true;
                                        }
                                    });
                                    if (isSelect) {
                                        v.hasChecked = true;
                                    }
                                });
                            }
                        }
                    });
                }
            };

            //订单推送
            function PUSHORDER() {
                //确定选择学员
                $scope.$on('推单-学员-sign', function(d, d_) {
                    $scope.pushOrderData.students = duplicateRemoval(d_, $scope.pushOrderData.students, 'id');
                })
                $scope.$on('推单-班级-sign', function(d, d_) {
                    $scope.pushOrderData.classList = duplicateRemoval(d_, $scope.pushOrderData.classList, 'classId');
                })
                $scope.pushOrderData = {
                    peoType: 1,
                    classList: [],
                    students: []
                };
                $scope.pushOrderFun = {
                    operate: function(type, _da, sp) {
                        switch (type) {
                            case 1: //推单选择
                                $scope.pushOrderData.peoType = _da;
                                break;
                            case 2: //删除选中的班级
                                $scope.pushOrderData.classList.splice(sp, 1);
                                break;
                            case 3: //删除选中的学员
                                console.log(sp)
                                $scope.pushOrderData.students.splice(sp, 1);
                                break;
                            case 4: //选择班级或者学员弹框打开
                                console.log($scope)
                                if (_da == 1) {
                                    window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px', { name: 'class', type: 'checkbox', screen_classType: '0', callBackName: '推单-班级' })

                                } else {
                                    window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds', '760px', { name: 'all', type: 'student', choseType: 'checkbox', callBackName: '推单-学员' })
                                }
                                break;
                            case 5:
                                console.log($scope.pushOrderData);
                                if ($scope.pushOrderData.peoType == 1) {
                                    if (!$scope.pushOrderData.students.length) {
                                        layer.msg('请添加学员');
                                        return;
                                    }
                                } else {
                                    if (!$scope.pushOrderData.classList.length) {
                                        layer.msg('请添加班级');
                                        return;
                                    }
                                }
                                $scope.navigation_bar_bgm = '2';
                                break;
                        }
                    }
                }
            }

        }
    });
})