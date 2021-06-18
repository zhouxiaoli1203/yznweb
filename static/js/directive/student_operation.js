define(['laydate', 'socketIo', 'collectionPop'], function(laydate, socketIo) {
    creatPopup({
        el: 'operaTion',
        openPopupFn: 'CalloperationPopup',
        htmlUrl: './templates/popup/student_operation.html',
        controllerFn: function($scope, props, SERVICE) {

            if (props.special == "shengban_changeCourse") {
                props = props.item;
                props['location'] = "outside";
                props['special'] = 'shengban_changeCourse';
            } else {
                props = props;
            }
            var LAYDATE; //控件选择 时间
            function init() {
                console.log(props);
                (function() {
                    lay('.laydates').each(function(v, k) {
                        laydate.render({
                            elem: this,
                            isRange: false,
                            min: '0',
                            type: "datetime",
                            trigger: 'click',
                            done: function(value) {
                                $scope.LAYDATE = value;
                            }
                        });
                    });
                    lay('.laydateyears').each(function(v, k) {
                        laydate.render({
                            elem: this,
                            range: true,
                            trigger: 'click',
                            done: function(value) {
                                $scope.LAYDATEYEAR = value;
                            }
                        });
                    });
                })();

                getHandlerList(); //获取经办人
                $scope.clickHandler = clickHandler; //选择经办人
                $scope.PayTypeList = getConstantList(CONSTANT.PAYTYPENEW); //支付方式\
                $scope.isOnlinePayType = window.currentUserInfo.shop.auditStatus == 2 ? true : false; //是否开通了线上支付（易收宝）
                $scope.closeDialog = function() {
                    layer.close(dialog);
                };
                $scope.watchReceivable = watchReceivable; //计算转课、退课的应收金额
                //全额付款
                $scope.totalPay = totalPay;
                $scope.resetAdviser = resetAdviser; //顾问占比重分配
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
                $scope.classList = props;
                $scope.oldClassId = [];
                if (props.courselist.classContractRList) {
                    angular.forEach(props.courselist.classContractRList, function(val) {
                        $scope.oldClassId.push(val.classId);
                    });
                }
                $scope.returnClass = {
                    hour: [],
                    period: [],
                    month: []
                }
                switch (props.type) {
                    case '插班':
                        INSERTCLASS();
                        break;
                    case '转课':
                        getSchoolTermList(); //获取学期列表(获取到学期列表后执行转课函数)
                        break;
                    case '退课':
                        RETURNCLASS();
                        getRepayInfo(); //获取剩余续费单列表
                        break;
                    case '结课':
                        ENDCLASS();
                        break;
                    case '退学杂':
                        RETURNGOODS();
                        break;
                    default:
                        break;
                }
            };

            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.toString = function(val) {
                    return String(val);
                }
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
                }
            }

            function getShoplist() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shop/list",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.shopList = data.context;
                            if (data.context && data.context.length > 0) {
                                $scope.transferClass_params.school = $scope.shop.shopId;
                                $scope.transferClass_params.thisSchool = angular.copy($scope.shop.shopId);

                            }
                        }
                    }
                })
            }

            function getConfig() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.shop = data.context;
                            $scope.transferStatus = data.context ? (data.context.transferStatus == 1 ? true : false) : undefined;
                            if ($scope.transferStatus) {
                                getShoplist();
                            }
                        }
                    }
                })
            }

            function resetAdviser(ind) {
                if ($scope.transferClass_params.adviser.length == 2) {
                    $scope.transferClass_params.adviser[1 - ind].percentage = 100 - transferClass_params.adviser[ind].percentage;
                }
            }
            //已经选了套餐后，更改购买或课程价格
            function resetSignparam2() {
                angular.forEach($scope.transferClass_params.courseList, function(x) {
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
            //计算转课和退课的应收金额
            function watchReceivable(type) {
                switch (type) {
                    case 1: //转课
                        $scope.m1 = 0;
                        var totalMoney = 0,
                            m1 = 0,
                            m2 = 0; //m1：转出课程的总金额，m2：转入课程的总金额

                        angular.forEach($scope.returnClassList, function(v1) {
                            if (v1.hasChecked) m1 += numAccuracy(v1.returnPrice);
                        });
                        if (!$scope.transferClass_params) return;
                        //报名课程
                        angular.forEach($scope.transferClass_params.courseList, function(val) {
                            var LS_num = 0;
                            if (val.discountType == '1') {
                                LS_num = numAccuracy(val.package.packagePrice - val.discountPrice);
                            } else {
                                LS_num = numAccuracy(val.package.packagePrice * (val.discountPrice_ / 100));
                            }
                            if (LS_num) {
                                m2 += LS_num;
                            }
                        });
                        //报名学杂
                        angular.forEach($scope.transferClass_params.goodsList, function(val) {
                            var LS_num = val.goodsPrice * val.goodsNumber;
                            if (LS_num) {
                                m2 += LS_num;
                            }
                        });
                        //活动报名课程或者学杂
                        if ($scope.activitySignupList) {
                            angular.forEach($scope.activitySignupList, function(val) {
                                var LS_num = 0;
                                if (val.activity_course && val.activity_course.length > 0) {
                                    angular.forEach(val.activity_course, function(_v) {
                                        var LS_num_1 = 0;
                                        if (_v.discountType == '1') {
                                            LS_num_1 = numAccuracy(_v.package.packagePrice - _v.discountPrice);
                                        } else {
                                            LS_num_1 = numAccuracy(_v.package.packagePrice * (_v.discountPrice_ / 100));
                                        }
                                        if (LS_num_1) {
                                            LS_num += LS_num_1;
                                        }
                                    })
                                }
                                if (val.activity_goods && val.activity_goods.length > 0) {
                                    angular.forEach(val.activity_goods, function(_v) {
                                        var LS_num_1 = _v.goodsPrice * _v.goodsNumber;
                                        if (LS_num_1) {
                                            LS_num += LS_num_1;
                                        }
                                    })
                                }
                                m2 += LS_num;
                            })
                        }

                        totalMoney = numAccuracy(m2 - m1); //计算总的需要转入课程的总金额-转出的总金额（机构还需要收的钱-剩下的课程的钱）
                        $scope.m1 = m1;
                        $scope.transferClass_params.receivable = Math.abs(totalMoney);
                        $scope.transferClass_params.contractMoney = totalMoney;
                        if (totalMoney < 0) { //如果需要退款
                            $scope.isRefund = true;
                            $scope.PayProjectList['other']['paymentMode'] = '支付宝';
                        } else { //如果还需收款
                            $scope.isRefund = false;
                            if ($scope.isOnlinePayType) {
                                $scope.PayProjectList['other']['paymentMode'] = '易收宝';
                            }
                            if ($scope.PayProjectList['student']['paymentMoney'] > $scope.classList.studentInfo.accountBalance) {
                                layer.msg('输入金额不能大于学员账户余额');
                                $scope.PayProjectList['student']['paymentMoney'] = $scope.classList.studentInfo.accountBalance;
                            }
                        }
                        $scope.transferClass_params.receivable = numAccuracy($scope.transferClass_params.receivable - $scope.PayProjectList['student']['paymentMoney']);
                        break;
                    case 2: //退课
                        var mon_ = 0;
                        angular.forEach($scope.returnClassList, function(v1) {
                            if (v1.hasChecked) mon_ += numAccuracy(v1.returnPrice);
                        });
                        $scope.ref_receivable.contractMoney = numAccuracy(mon_);
                        mon_ = mon_ - $scope.PayProjectList.student.paymentMoney;
                        $scope.ref_receivable.money = numAccuracy(mon_);
                        break;
                }
            }

            //监听计算输入框的变化
            $scope.watchInputOperate = function(type, _da) {
                switch (type) {
                    case 1: //监听计算可退金额
                        if (_da.returnBuyTime * 1 > _da.buySurplusTime * 1) {
                            layer.msg('退购买课时不能大于剩余购买课时');
                            _da.returnBuyTime = _da.buySurplusTime;
                        }
                        var n_ = numAccuracy((_da.contractRenewBuysurplusPrice / _da.buySurplusTime) * (Number(_da.returnBuyTime) ? _da.returnBuyTime : 0) - _da.arrearage); //可退金额

                        //当不是全转或者全退的到时候续费单不结，则可退金额不能小于0
                        if (_da.returnBuyTime * 1 == _da.buySurplusTime * 1) {
                            _da.canBackPrice = n_;
                        } else {
                            _da.canBackPrice = n_ < 0 ? 0 : n_;
                        }
                        //如果是按月的
                        if (_da.feeType == 2) {
                            _da.returnPrice = numAccuracy(_da.contractRenewBuysurplusPrice * 1 - _da.arrearage * 1);
                            _da.returnPrice = _da.returnPrice > 0 ? _da.returnPrice : 0;
                        } else {
                            _da.returnPrice = _da.canBackPrice < 0 ? 0 : _da.canBackPrice;
                        }
                        switch (props.type) {
                            case '转课':
                                watchReceivable(1);
                                break;
                            case '退课':
                                watchReceivable(2);
                                break;
                        }
                        break;
                    case 2: //监听输入退赠送课时
                        if (_da.returnGiveTime * 1 > _da.giveSurplusTime * 1) {
                            layer.msg('退赠送课时不能大于剩余赠送课时');
                            _da.returnGiveTime = _da.giveSurplusTime;
                        }
                        break;
                }
            };

            //获取剩余续费单列表
            function getRepayInfo() {
                var params = {
                    "contractId": props.courselist.contractId, // 合同id
                    //                  'schoolTermId': props.classlist.schoolTerm?props.classlist.schoolTerm.schoolTermId:undefined,
                    //                  'schoolYear': props.classlist.schoolTerm?props.classlist.schoolTerm.schoolYear:undefined,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/getContractRenewList",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == 200) {
                            console.log('获取剩余续费单列表', data)
                            $scope.returnClass.hour = data.context.hour.concat(data.context.period);
                            $scope.returnClass.month = data.context.month;

                            var list = data.context.hour.concat(data.context.period).concat(data.context.month);
                            $scope.returnClassList = list;
                            angular.forEach($scope.returnClassList, function(v1) {
                                v1.hasChecked = true;
                                switch (props.type) {
                                    case '转课':
                                        v1.returnBuyTime = v1.buySurplusTime;
                                        v1.returnGiveTime = v1.giveSurplusTime;
                                        $scope.watchInputOperate(1, v1);
                                        watchReceivable(1);
                                        break;
                                    case '退课':
                                        v1.returnBuyTime = v1.buySurplusTime;
                                        v1.returnGiveTime = v1.giveSurplusTime;
                                        $scope.watchInputOperate(1, v1);
                                        watchReceivable(2);
                                        break;
                                }
                            })

                        }
                    }
                })
            }

            //获取学期列表
            function getSchoolTermList(schoolTermId, obj) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: {
                        'pageType': 0,
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.schoolTermList = res.context;
                            TURNCLASS();
                            getRepayInfo(); //获取剩余续费单列表
                        };
                    }
                })
            }

            //转成yyyy-MM-dd HH:mm
            $scope.$yznDateFormatYMdHm = function(val) {
                    return yznDateFormatYMdHm(val);
                }
                //转成HH:mm
            $scope.$yznDateFormatHm = function(val) {
                    return datetimes(val)
                }
                //返回 星期X
            $scope.$returnWee = function(val) {
                    return returnWeek(val)
                }
                //全额付款
            function totalPay() {
                switch (props.type) {
                    case '转课':
                        $scope.PayProjectList['other'].paymentMoney = $scope.transferClass_params.receivable * 1 > 0 ? numAccuracy(Math.abs($scope.transferClass_params.receivable)) : 0;
                        break;
                    case '退课':
                        $scope.PayProjectList['other'].paymentMoney = $scope.ref_receivable.money * 1 > 0 ? numAccuracy(Math.abs($scope.ref_receivable.money)) : 0;
                        break;
                    case '退学杂':
                        $scope.PayProjectList['other'].paymentMoney = $scope.returnGoodsInfo.receivable * 1 > 0 ? numAccuracy(Math.abs($scope.returnGoodsInfo.receivable)) : 0;
                        break;
                }
            }

            function clickHandler(x) {
                $scope.shopTeacherId = x.shopTeacherId;
            }
            //插班
            function INSERTCLASS() {
                //              if($scope.classList.classlist.feeType == 2){
                //                  var num = 0;
                //                  angular.forEach($scope.classList.classlist.contractRenews, function(val) {
                //                      num += val.buySurplusDateNum*1+val.giveSurplusDateNum*1;
                //                  });
                //                  $scope.classList.classlist.surplusDateTime = num;
                //              }
                $scope.LAYDATE = '';
                $scope.insertclassname = '添加班级';
                $scope.insertclassid = '';
                $scope.xWhetherTime = '0'; //插班 默认立即插班
                $scope.operation_insertClass = operation_insertClass; //插班-班级选择
                //插班 确认弹框
                $scope.insertClassConfirm = insertClassConfirm;
                //插班-班级选择
                function operation_insertClass(id, width) {
                    $scope.goPopup(id, width);
                }
                //选择班级 方法调取
                SERVICE.COURSEANDCLASS.CLASS['插班-添加班级'] = insertChoiceClass;

                function insertChoiceClass(data) {
                    if (data) {
                        $scope.insertclassname = data.className;
                        $scope.insertclassid = data.classId;
                    } else {
                        $scope.insertclassname = '添加班级';
                    }
                }
                //重置
                $scope.insertReset = function(x) {
                    $scope.insertclassname = '添加班级';
                    $scope.insertclassid = '';
                    window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px', x);
                }

                //插班 确认
                function insertClassConfirm() {
                    if ($scope.insertclassid == '') {
                        layer.msg('请选择班级');
                        return;
                    }
                    if ($scope.xWhetherTime == '0') {
                        var param = { //立即插班
                            'contractId': props.courselist.contractId,
                            'studentId': props.courselist.studentId,
                            'classId': $scope.insertclassid,
                            'type': '6',
                        };
                    } else if ($scope.xWhetherTime == '1') {
                        var param = { //时间待定
                            'contractId': props.courselist.contractId,
                            'studentId': props.courselist.studentId,
                            'classId': $scope.insertclassid,
                            'type': '6',
                            'lockStatus': '1',
                        };
                    } else {
                        var param = { //未来时间
                            'contractId': props.courselist.contractId,
                            'studentId': props.courselist.studentId,
                            'classId': $scope.insertclassid,
                            'type': '6',
                            'date': $scope.LAYDATE
                        };
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/class/updateClassContractR",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功进班', {
                                    icon: 1
                                });
                                SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                $scope.closePopup('operat_transfer');
                            };
                        }
                    })
                }
            }
            //转课
            function TURNCLASS() {
                judgeActivitySign(); //判断是否有活动报名
                getOneTeacherList();
                getAllContractList(); //获取所有合同列表
                SERVICE.COURSEANDCLASS.COURSE['转课-添加课程'] = deter_transferClassCourse; //确定转课课程
                SERVICE.COURSEANDCLASS.CLASS['转课-添加班级'] = deter_transferClasses; //确定转课班级
                SERVICE.COURSEANDCLASS.CLASS['转课-报名选班'] = deter_transferClassClass; //确定转课选班
                SERVICE.COURSEANDCLASS.GOODS['选课报名-学杂'] = deter_signUpGoods; //确定报名学杂
                SERVICE.COURSEANDCLASS.COURSEPACKAFE['选课报名-课程包'] = deter_signUpCoursePackage; //确定报名课程包
                $scope.choseClass_ = choseClass_; //改版选班
                $scope.deter_choseClass = deter_choseClass; //确认报名选班
                $scope.courseItemInfo = {}; //点击选班的时候预存整条信息(选班小弹框数据)
                $scope.sel_hopetime = sel_hopetime; //选取意愿时间
                $scope.sel_teachers = sel_teachers; //选取意愿老师
                $scope.selYear = selYear; //选择学年
                $scope.selSchoolTerm = selSchoolTerm; //选择学期
                $scope.initDiscount = initDiscount; //切换折扣类型计算优惠金额
                $scope.inputPackageTime = inputPackageTime; //输入课程购买课时
                $scope.selTimeFrame = selTimeFrame; //选择按月时间控件
                $scope.thisYears = getSomeYears(); //获取今年年份
                $scope.selScreen_ = selScreen_; //下拉选择
                $scope.del_oneTeacher = del_oneTeacher; //删除一对一老师
                $scope.selTimeFrame_obj = {}; //课程时间控件对象（控制开始时间和结束时间限制的作用）
                $scope.sel_package = sel_package; //下拉选择套餐之后按月的默认结束时间
                $scope.del_signUpGoods = del_signUpGoods; //删除学杂
                $scope.activitySignupList = []; //活动报名数据
                $scope.activity_signup = function() { layer.msg('未参加活动') }; //活动报名按钮

                $scope.delTeachers = delTeachers; //删除意愿老师
                $scope.deter_transferClass = deter_transferClass; //确定转课
                $scope.new_student_confirm = new_student_confirm; //这是新学员
                $scope.hb_student_confirm = hb_student_confirm; //合并学员
                $scope.hebingStud = hebingStud; //转校--学员重复--合并学员
                $scope.resetShop = resetShop;//切换门店需要清空之前门店的参数
                $scope.caclBirthToAge = caclBirthToAge; //计算年龄
                $scope.transferClass_params = { //转课需要的数据
                    isRefund: false,
                    courseList: [], //转入课程
                    goodsList: [], //转入学杂
                    adviser: [], //顾问
                    agent: localStorage.getItem('shopTeacherId'), //经办人
                    desc: '', //备注
                    contractMoney: 0, //签约金额
                    receivable: 0, //应收金额
                    netReceipts: 0, //实收金额
                    arrears: 0, //欠费
                    payTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'), //退款-收款时间
                    operateTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'), //转校区--操作时间
                    school:undefined,
                    thisSchool: undefined
                };
                getConfig(); //获取门店信息
                $scope.$broadcast('_adviser_2', 'clearSatus');
                if (props.studentInfo && props.studentInfo.oaUserId && props.studentInfo.oaUserName && $scope.transferClass_params) {
                    $scope.transferClass_params.adviser = [{ 'shopTeacherId': props.studentInfo.oaUserId, 'teacherName': props.studentInfo.oaUserName, 'percentage': 100 }];
                    setTimeout(function() {
                        $scope.$broadcast('_adviser_2', 'reloadData', { data: $scope.transferClass_params.adviser, att: 'shopTeacherId' });
                    })
                };
                //选择学员
                $scope.sel_student = function(data, evt) {
                        data.hasChecked = true;
                        $scope.selectStudent = data;
                }

                    //时间控件-收款时间
                laydate.render({
                    elem: '#payTime', //指定元素
                    isRange: false,
                    type: 'datetime',
                    done: function(value) {
                        $scope.transferClass_params.payTime = value;
                    }
                });
                //时间控件-转校区操作时间
                laydate.render({
                    elem: '#operateTime', //指定元素
                    isRange: false,
                    type: 'datetime',
                    done: function(value) {
                        $scope.transferClass_params.payTime = value;
                    }
                });
                $scope.gravityClick = function() { //重选
                    $scope.choseClassEnd = true;
                    $scope.courseItemInfo.classInfo = '';
                }
                $scope.transferClass_delAdviser = function(data, ind) {
                    data.hasSelected = false;
                    $scope.transferClass_params.adviser.splice(ind, 1);
                    $scope.otherFun.operate(1);
                }
                $scope.transferClass_sel_adviser = function(data) {
                    var judHas = true;
                    var judHasIndex = null;
                    angular.forEach($scope.transferClass_params.adviser, function(val, index) {
                        if (val.shopTeacherId == data.shopTeacherId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    });
                    if (judHas) {
                        $scope.transferClass_params.adviser.push(data);
                        data.hasSelected = true;
                    } else {
                        $scope.transferClass_params.adviser.splice(judHasIndex, 1);
                        data.hasSelected = false;
                    }
                    $scope.otherFun.operate(1);
                }
                $scope.del_transferCourse = function(ind) {
                        var _id = $scope.transferClass_params.courseList[ind].time_id;
                        $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                        $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                        $scope.transferClass_params.courseList.splice(ind, 1);
                        //                  var isDelect = layer.confirm('是否删除该报名课程？', {
                        //                      title: "确认删除信息",
                        //                      skin: 'newlayerui layeruiCenter',
                        //                      closeBtn: 1,
                        //                      offset: '30px',
                        //                      move: false,
                        //                      area: '560px',
                        //                      btn: ['是', '否'] //按钮
                        //                  }, function() {
                        //                      var _id = $scope.transferClass_params.courseList[ind].time_id;
                        //                      $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                        //                      $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                        //                      $scope.transferClass_params.courseList.splice(ind, 1);
                        //                      $scope.$apply();
                        //                      layer.close(isDelect);
                        //                  }, function() {
                        //                      layer.close(isDelect);
                        //                  })
                    }
                    //监听应收金额数据变化-服务费（课程）
                $scope.$watch('transferClass_params.courseList', function(n, o) {
                    if (n === o || n == undefined) return; //防止第一次重复监听
                    if ($scope.transferClass_params.courseList) {
                        resetSignparam2();
                        watchReceivable(1);
                    }
                }, true);
                //监听应收金额数据变化-服务费(学杂)
                $scope.$watch('transferClass_params.goodsList', function(n, o) {
                    if (n === o || n == undefined) return; //防止第一次重复监听
                    if ($scope.transferClass_params.goodsList) {
                        watchReceivable(1);
                    }
                }, true);
                //监听应收金额数据变化-服务费(活动课程和学杂)
                $scope.$watch('activitySignupList', function(n, o) {
                    if (n === o || n == undefined) return; //防止第一次重复监听
                    if ($scope.activitySignupList) {
                        resetActivitySignupList();
                        watchReceivable(1);
                    }
                }, true);

                $scope.otherFun = {
                    operate: function(type, _da) {
                        switch (type) {
                            case 1: //均分顾问占比
                                var m1 = 0;
                                angular.forEach($scope.transferClass_params.adviser, function(v1, i1) {
                                    if (i1 == $scope.transferClass_params.adviser.length - 1) {
                                        v1.percentage = 100 - m1;
                                    } else {
                                        v1.percentage = parseInt(100 / $scope.transferClass_params.adviser.length);
                                        m1 += v1.percentage;
                                    }
                                });
                                break;
                            case 2: //点击选择转课的合同
                                _da.hasChecked = _da.hasChecked ? false : true;
                                _da.returnBuyTime = _da.buySurplusTime;
                                _da.returnGiveTime = _da.giveSurplusTime;
                                $scope.watchInputOperate(1, _da);
                                watchReceivable(1);
                                break;
                        }
                    }
                };
                function resetShop() {
                    $scope.transferClass_params["courseList"] = [];
                    $scope.transferClass_params["goodsList"] = [];
                    $scope.activitySignupList = [];
                    $scope.transferClass_params["adviser"] = [];
                    $scope.transferClass_params["contractMoney"] = 0;//签约金额
                    $scope.transferClass_params["receivable"] = 0;//应收金额
                    $scope.transferClass_params["netReceipts"] = 0;//实收金额
                    $scope.transferClass_params["arrears"] = 0;//欠费
                }
                //根据潜客获取所有合同 包括已结业3.3
                function getAllContractList() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/listOrderCourse",
                        type: "get",
                        data: {
                            'potentialCustomerId': props.studentInfo.potentialCustomerId,
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                console.log('根据潜客获取所有合同', res);
                                $scope.contractList = res.context;
                            };
                        }
                    })
                }

                //获取活动报名
                function judgeActivitySign() {
                    //判断是否拥有活动报名
                    $.hello({
                        url: CONFIG.URL + "/api/oa/activity/getActivityJoinCount",
                        type: "get",
                        data: {
                            potentialCustomerId: props.studentInfo.potentialCustomerId,
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                if (res.context) {
                                    $(".activitySignupBtn_").show();
                                    $('.activitySignupBtn').html('活动报名(' + res.context + ')');
                                    ACTIVITYSIGNUP();
                                }
                                //	                            else {
                                //	                                $('.activitySignupBtn').html('活动报名');
                                //	                            }
                            }
                        }
                    });
                }
                //合并学员
                function hebingStud() {
                    detailMsk("学员合并后，将更新原学员报课信息。信息合并后无法还原，确认合并学员？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/studentGraduation",
                            type: "POST",
                            data: JSON.stringify(param),
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.$emit("classListChange", "false");
                                }
                            }
                        })
                    }, null, ["是", "否"]);
                }

                //这是新学员
                function new_student_confirm() {
                    $scope.closePopup("zx_repeat_student");
                    checkStudent = false;
                    transferClass_confirm($scope.changeSch_param_, {});
                }
                //合并学员
                function hb_student_confirm() {
                    if (!$scope.selectStudent) {
                        return layer.msg("请选择学员");
                    }
                    detailMsk("学员合并后，将更新原学员报课信息。信息合并后无法还原，确认合并学员？", function () {
                        $scope.closePopup("zx_repeat_student");
                        checkStudent = false;
                        transferClass_confirm($scope.changeSch_param_,$scope.selectStudent);
                    });
                }

                //确定转课
                function deter_transferClass() {
                    //分摊弹框的数据，原始是课程跟活动报名的课程合起来了，选择课程时列表重复
                    $scope.transferClass_params_ = {
                        courseList: [],
                    };
                    var counselorIds = [],
                        courseList = [],
                        goodsList = [],
                        coursePriceTotal = 0,
                        judgeReturn = [true, ''],
                        params, arrearageMon = numAccuracy($scope.transferClass_params.receivable - $scope.PayProjectList['other']['paymentMoney']);
                    //欠费分摊  改为 缴费分摊 （多加字段 原逻辑不变）
                    var arrearageMon_, goodsT = 0,
                        temarrearageMon;
                    //把课程报名的数据和活动报名的数据合并起来
                    var act_infoList = angular.copy($scope.activitySignupList);
                    //只处理课程合并，学杂暂时没发现问题
                    //                  if(act_infoList.length>0){
                    angular.forEach(act_infoList, function(val) {
                        if (val.activity_course && val.activity_course.length > 0) {
                            $scope.transferClass_params_.courseList = $scope.transferClass_params_.courseList.concat(val.activity_course);
                        };
                        if (val.activity_goods && val.activity_goods.length > 0) {
                            $scope.transferClass_params.goodsList = $scope.transferClass_params.goodsList.concat(val.activity_goods);

                        }
                    });
                    $scope.transferClass_params_.courseList = $scope.transferClass_params.courseList.concat($scope.transferClass_params_.courseList);
                    //                  }else{
                    //                      $scope.transferClass_params_.courseList = angular.copy($scope.transferClass_params.courseList);
                    //                  }

                    //缴费分摊 减去学杂
                    if ($scope.transferClass_params.goodsList) {
                        angular.forEach($scope.transferClass_params.goodsList, function(v) {
                            goodsT += numAccuracy(v.goodsPrice * v.goodsNumber);
                        });
                    }
                    //                  arrearageMon_ = numAccuracy($scope.PayProjectList['other']['paymentMoney'] - goodsT)
                    arrearageMon_ = numAccuracy($scope.PayProjectList['other']['paymentMoney']) + numAccuracy($scope.PayProjectList.student.paymentMoney) + numAccuracy($scope.m1) - goodsT
                    temarrearageMon = arrearageMon_;
                    if ($scope.transferClass_params_.courseList.length == 0 && $scope.transferClass_params.goodsList.length == 0) {
                        layer.msg('请选择转入课程或者学杂');
                        return;
                    }
                    //获取顾问
                    angular.forEach($scope.transferClass_params.adviser, function(val) {
                        counselorIds.push({ 'shopTeacherId': val.shopTeacherId, 'percentage': val.percentage });
                    });

                    //处理转出课程
                    angular.forEach($scope.transferClass_params_.courseList, function(val) {
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
                        // val.package.packageTime = val.package.packageTime ? val.package.packageTime : 0; //购买课时
                        // val.package.packagePrice = val.package.packagePrice ? val.package.packagePrice : 0; //课程价格
                        // val.package.giveTime = val.package.giveTime ? val.package.giveTime : 0; //赠送课时
                        // if (val.package.packageTime == 0) val.package.packagePrice = 0; //如果购买课时为0.课程价格为0
                        if (!val.package.packageTime && !val.package.giveTime) {
                            judgeReturn = [false, '请填写购买课时（天数）或者赠送课时（天数）'];
                            return;
                        }
                        var objData = {
                            'activityId': val.activityId ? val.activityId : undefined,
                            'activityJoinId': val.activityJoinId ? val.activityJoinId : undefined,
                            'arrearage': val.arrearage ? val.arrearage : 0,
                            'arrearage_': val.arrearage_ ? val.arrearage_ : 0,
                            'courseId': val.course.courseId,
                            'schoolYear': val.schoolYear ? val.schoolYear : undefined,
                            'schoolTermId': val.schoolTerm ? val.schoolTerm.schoolTermId : undefined,
                            'schoolTermName': val.schoolTerm ? val.schoolTerm.schoolTermName : undefined,
                            'packageId': val.package_ ? val.package_.packageId : undefined,
                            'coursePrice': numAccuracy(val.package.packagePrice),
                            'amount': val.discountType == '1' ? numAccuracy(val.package.packagePrice - val.discountPrice) : numAccuracy(val.package.packagePrice * (val.discountPrice_ / 100)),
                            //                          'singleCoursePrice': numAccuracy(val.package.packagePrice / val.package.packageTime),
                            //                          'buyTime': numAccuracy(val.package.packageTime),
                            'giveTime': numAccuracy(val.package.giveTime),
                            'discountType': val.discountType,
                            'discounts': val.discountType == '1' ? val.discountPrice : val.discountPrice_,
                            'averageCoursePrice': 0,
                            // 有效期改成有效期至，存截止日期2019-09-25
                            //                      'beginTime': val.timeFrame? val.timeFrame.split('/')[0]+'00:00:00': undefined,
                            //                      'endTime': val.timeFrame? val.timeFrame.split('/')[1]+' 23:59:59': undefined,
                            'endTime': val.timeFrame ? yznDateFormatYMd(val.timeFrame) + ' 00:00:00' : undefined,
                            'feeType': val.package.feeType,
                            'courseType': val.signType ? val.signType : undefined,
                        };
                        if (val.package.feeType == 2) { //如果是按月份的报名
                            objData['beginTime'] = val.beginTime + ' 00:00:00';
                            objData['endTime'] = val.endTime + ' 00:00:00';
                        }
                        var dayNum = 0;
                        if (val.package.feeType == 2 && val.chargeType == '1') { //按月课程并且选择按月  购买天数、单课价
                            objData.buyTime = numAccuracy(val.monthNum == 0 ? 0 : getIntervalDays(val.beginTime, val.endTime) + 1);
                            objData.singleCoursePrice = numAccuracy(val.package.packagePrice / val.package.packageTime / 30);
                        } else {
                            objData.buyTime = numAccuracy(val.package.packageTime);
                            objData.singleCoursePrice = numAccuracy(val.package.packagePrice / val.package.packageTime);
                        }
                        if (val.package.packageTime == 0) { //如果购买课时为0
                            objData['averageCoursePrice'] = 0;
                        } else {
                            if (val.discountType == '1') {
                                // 均课价
                                if (val.package.feeType == 2 && val.chargeType == '1') { //按月课程并且选择按月
                                    objData['averageCoursePrice'] = numAccuracy((val.package.packagePrice - val.discountPrice) / dayNum);
                                } else {
                                    objData['averageCoursePrice'] = numAccuracy((val.package.packagePrice - val.discountPrice) / val.package.packageTime);
                                }
                                //                              objData['averageCoursePrice'] = numAccuracy((val.package.packagePrice - val.discountPrice) / val.package.packageTime);
                            } else {
                                //                              objData['averageCoursePrice'] = numAccuracy((val.package.packagePrice * (val.discountPrice_ / 100)) / val.package.packageTime);
                                // 均课价
                                if (val.package.feeType == 2 && val.chargeType == '1') { //按月课程并且选择按月
                                    objData['averageCoursePrice'] = numAccuracy((val.package.packagePrice * (val.discountPrice_ / 100)) / dayNum);
                                } else {
                                    objData['averageCoursePrice'] = numAccuracy((val.package.packagePrice * (val.discountPrice_ / 100)) / val.package.packageTime);
                                }
                            }
                        }

                        if (!objData['averageCoursePrice']) {
                            objData['averageCoursePrice'] = 0;
                        }

                        //                      if(val.choseClassType == '0') {
                        objData.classInfo = {
                            lockStatus: '0',
                            classId: null
                        }
                        if (val.classInfo) {
                            objData.classInfo.classId = val.classInfo.classId;
                        }
                        //                          if(val.insertClassTime == '1') {
                        //                              objData.classInfo.lockStatus = '1';
                        //                          } else if(val.insertClassTime == '2' && val.futureTime) {
                        //                              objData.classInfo.classDate = val.futureTime + ' 00:00:00';
                        //                          }
                        //                      } else {
                        //                          objData.contractDates = val.willTime;
                        //                          objData.teachers = [];
                        //                          angular.forEach(val.teachers, function(val) {
                        //                              objData.teachers.push({
                        //                                  'teacherId': val.teacherId,
                        //                                  'shopTeacherId': val.shopTeacherId
                        //                              });
                        //                          })
                        //                      }
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
                        //缴费分摊
                        if (arrearageMon_) {
                            if (arrearageMon_ * 1 > objData.amount * 1) {
                                objData.arrearage_ = objData.amount;
                                objData.arrearage = 0;
                                arrearageMon_ = numAccuracy(arrearageMon_ - objData.amount);
                            } else {
                                objData.arrearage_ = arrearageMon_;
                                objData.arrearage = numAccuracy(objData.amount - arrearageMon_);
                                arrearageMon_ = 0;
                            }
                        }
                        coursePriceTotal += numAccuracy(objData.amount);
                        courseList.push(objData);
                    });

                    //处理学杂列表
                    if ($scope.transferClass_params.goodsList.length > 0) {
                        angular.forEach($scope.transferClass_params.goodsList, function(v) {
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
                            goodsList.push(ojData);
                        });
                    }

                    //处理错误
                    if (!judgeReturn[0]) {
                        layer.msg(judgeReturn[1]);
                        return;
                    };
                    if ($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool) {
                        if ($scope.transferClass_params.contractMoney != 0) {
                            return layer.msg("转校订单转出金额需等于转入金额");
                        }
                        if (courseList && courseList.length !== 0) {
                            angular.forEach(courseList, function(item) {
                                delete item.arrearage_;
                            })
                        }
                        $scope.changeSch_param_ = {
                            counselorIds: counselorIds,
                            courseList: courseList,
                            goodsList: goodsList,
                        };
                        transferClass_confirm($scope.changeSch_param_);
                    } else {

                        /**
                         * 以下是欠费分摊走正常转课逻辑
                         */
                        $scope.returnClass_params = { //处理后需要提交数据
                            counselorIds: counselorIds,
                            courseList: courseList,
                            goodsList: goodsList,
                            arrearage: numAccuracy($scope.transferClass_params.receivable - $scope.PayProjectList['other']['paymentMoney']),
                            arrearage_: temarrearageMon, //缴费金额
                            arrearageTotal: 0,
                        };

                        // if(coursePriceTotal < $scope.returnClass_params.arrearage) {   //课程总价和欠费金额作比较，欠费金额如果等于或者小于课程总价说明学杂费用交齐了
                        //     layer.msg('支付金额应需大于学杂费用');
                        //     return;
                        // }
                        $scope.signArrearageShareChange = function(_da) {
                            if (_da) {
                                if (_da.arrearage_ * 1 > _da.amount * 1) {
                                    layer.msg('分摊金额不能大于签约金额');
                                    _da.arrearage_ = _da.amount;
                                }
                            }
                            $scope.returnClass_params.arrearageTotal = 0;
                            $scope.returnClass_params.arrearageTotal_ = 0; //缴费分摊总计
                            angular.forEach($scope.returnClass_params.courseList, function(v1) {
                                $scope.returnClass_params.arrearageTotal += numAccuracy(v1.arrearage ? v1.arrearage : 0);
                                $scope.returnClass_params.arrearageTotal_ += numAccuracy(v1.arrearage_ ? v1.arrearage_ : 0);
                                v1.arrearage = numAccuracy(v1.amount - v1.arrearage_); //缴费分摊总计
                            })
                            $scope.returnClass_params.arrearageTotal = numAccuracy($scope.returnClass_params.arrearageTotal);
                            $scope.returnClass_params.arrearageTotal_ = numAccuracy($scope.returnClass_params.arrearageTotal_); //缴费分摊总计
                        }
                        $scope.signArrearageShareChange();
                        $scope.signArrearageShare_confirm = function() {
                            if (numAccuracy($scope.returnClass_params.arrearageTotal_) != numAccuracy($scope.returnClass_params.arrearage_)) {
                                //                          layer.msg('分摊金额需等于欠费金额');
                                layer.msg('分摊金额需等于缴费金额');
                                return;
                            }
                            layer.close(dialog);
                            if ($scope.returnClass_params.courseList && $scope.returnClass_params.courseList.length !== 0) {
                                angular.forEach($scope.returnClass_params.courseList, function(item) {
                                    //                          delete item.rest_arrearage;
                                    delete item.arrearage_;
                                })
                            }
                            transferClass_confirm($scope.returnClass_params);
                        };
                        if (courseList.length > 1 && $scope.returnClass_params.arrearage > 0) {
                            openPopByDiv('欠费分摊金额', '#zk_arrearage_share', '760px');
                        } else {
                            if ($scope.returnClass_params.courseList && $scope.returnClass_params.courseList.length !== 0) {
                                angular.forEach($scope.returnClass_params.courseList, function(item) {
                                    //                          delete item.rest_arrearage;
                                    delete item.arrearage_;
                                })
                            }
                            transferClass_confirm($scope.returnClass_params);
                        }
                    }

                }
                var checkStudent = true;
                //确定转课
                function transferClass_confirm(_params,stud) {
                    $scope.PayProjectList['other']['paymentMoney'] = numAccuracy($scope.PayProjectList['other']['paymentMoney']);
                    var isOnLinePayPro = [false, 0],
                        _url = "/api/oa/order/exchangeCourses"; //线上支付数据
                    var PayProjectList = $scope.PayProjectList['other']['paymentMoney'] * 1 ? [$scope.PayProjectList['other']] : [];
                    var contractRenewList = []; //转课续费单合同
                    var judgeReturn = [true, ''];
                    if ($scope.PayProjectList['student'].paymentMoney * 1) { //如果有学员账户的钱
                        PayProjectList.push($scope.PayProjectList['student']);
                    }

                    angular.forEach($scope.returnClassList, function(v1) {
                        if (v1.hasChecked) {
                            contractRenewList.push({
                                'contractRenewId': v1.contractRenewId,
                                'amount': v1.returnPrice,
                                'returnBuyTime': v1.feeType != 2 ? numAccuracy(v1.returnBuyTime) : undefined,
                                'returnGiveTime': v1.feeType != 2 ? numAccuracy(v1.returnGiveTime) : undefined,
                            })
                        }
                    })
                    if (contractRenewList.length <= 0) {
                        return layer.msg("请选择转课合同");
                    }
                    var params = {
                        'orderType': 3,
                        'remark': $scope.transferClass_params.desc,
                        'externalRemark': $scope.transferClass_params.desc_out,
                        'studentOrderDivides': _params.counselorIds,
                        'handlerId': $scope.transferClass_params.agent,
                        // 'studentInfo': {
                        //     'potentialCustomerId': props.studentInfo.potentialCustomerId,
                        //     'id': props.studentInfo.id
                        // },
                        'orderPaymentList': PayProjectList,
                        'paymentTime': $scope.transferClass_params.payTime,
                        'contractRenewList': contractRenewList,
                        'orderCourseList': _params.courseList.length > 0 ? angular.copy(_params.courseList) : undefined,
                        'orderGoods': _params.goodsList.length > 0 ? _params.goodsList : undefined,
                        'orderCourse': {
                            'courseId': props.courselist.course.courseId,
                            'contractId': props.courselist.contractId,
                        }
                    };
                    /**
                     * 跨校区转课开关开启且已切换校区
                     */
                    if ($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool) {

                        if (checkStudent) {//跨校区转课第一次点击转课需要传老学员的潜客ID
                            params["testPotentialCustomer"] = "1";
                            params["studentInfo"] = {
                                'potentialCustomerId': props.studentInfo.potentialCustomerId,
                                'id': props.studentInfo.id
                            }
                        } else {//跨校区转课第二次点击选择这是新学员或者合并学员
                            params["studentInfo"] = stud ? {
                                'potentialCustomerId': stud.potentialCustomerId,
                                'id': stud.id
                            } : {}
                        }
                    } else {
                        params["studentInfo"] = {
                            'potentialCustomerId': props.studentInfo.potentialCustomerId,
                            'id': props.studentInfo.id
                        }
                    }
                    if ($scope.transferStatus) {
                        params["otherShopId"] = $scope.transferClass_params.school;
                    }
                    console.log(params);
                    if (props.special == "shengban_changeCourse") {
                        params['entrance'] = '升班';
                    }
                    if ($scope.isRefund) {
                        params['orderPaymentList'] = [];
                        angular.forEach(PayProjectList, function(val) {
                                params['orderPaymentList'].push({ 'paymentMode': val.paymentMode, 'paymentMoney': -val.paymentMoney });
                            })
                            // if(params['arrearage']) {
                            //     judgeReturn = [false, '退款金额未补齐'];
                            // }
                    }
                    if (!params['handlerId']) {
                        judgeReturn = [false, '请选择经办人'];
                    }
                    if (!judgeReturn[0]) {
                        layer.msg(judgeReturn[1]);
                        return;
                    };
                    if (!($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool)) {
                        if ($scope.PayProjectList['other'].paymentMode == '易收宝' && $scope.PayProjectList['other'].paymentMoney * 1) isOnLinePayPro = [true, $scope.PayProjectList['other'].paymentMoney * 1];
                     }

                    if (isOnLinePayPro[0]) { //小白盒支付
                        _url = '/api/onlinePayment/exCourses';
                        params['payType'] = 'oa';
                        $scope.f5Id = null;
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
                                        //支付完成自动关闭弹窗
                                        webSocketInit(data.context.orderId, function(event) {
                                            var res = JSON.parse(event);
                                            console.log(res)
                                            if (res.payStatus == 1) { //支付成功
                                                layer.msg('转课成功', { icon: 1 });
                                                fn('close');
                                                if ($scope.f5Id) {
                                                    if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                                        SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                                    }
                                                    if (props.special == "shengban_changeCourse") {
                                                        $scope.$emit("shengbanSignup");
                                                    }
                                                    $scope.closePopup('operat_turn');
                                                }
                                                $scope.f5Id = null;
                                            } else {
                                                layer.msg('收款失败，请客户核实后重新扫码', {
                                                    offset: '230px'
                                                });
                                                $scope.f5Id = null;
                                                fn('clear_val');
                                                $scope.$apply();
                                            }
                                        }, socketIo);

                                    } else if (data.status == '20018') {
                                        hasDelectPaike(props.courselist.classContractRList[0].classId, data.message);
                                        return true;
                                    } else {
                                        $scope.f5Id = null;
                                        fn('clear_val');
                                        $scope.$apply();
                                    }
                                }
                            })
                        };
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
                                            layer.msg('转课成功', { icon: 1 });
                                            fn('close');
                                            if ($scope.f5Id) {
                                                if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                                    SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                                }
                                                if (props.special == "shengban_changeCourse") {
                                                    $scope.$emit("shengbanSignup");
                                                }
                                                $scope.closePopup('operat_turn');
                                            }
                                            $scope.f5Id = null;
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
                        };
                        window.$rootScope.yznOpenPopUp($scope, 'collection-pop', 'collection_pay', '560px', { emit: 'for_exCourses', paymentMoney: isOnLinePayPro[1] });
                        if (!$scope.$$listeners['for_exCourses']) {
                            $scope.$on('for_exCourses', function(e, data) {
                                if (data.name == 'apply') {
                                    $scope.codeFn_(data.code, data.fn);
                                }
                                if (data.name == 'f5') {
                                    $scope.reloadOnlinePay(data.fn);
                                }
                            });
                        }
                    } else {
                        $.hello({
                            url: CONFIG.URL + _url,
                            type: 'post',
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == "200") {
                                    if (SERVICE.POTENTIALPOP.reloadStudentCourseList) {
                                        SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                    }
                                    if ($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool) {
                                        layer.msg('转校成功');
                                    } else {
                                        layer.msg('转课成功');
                                    }
                                    if (props.special == "shengban_changeCourse") {
                                        $scope.$emit("shengbanSignup");
                                    }
                                    $scope.closePopup('operat_turn');
                                } else if (data.status == '20018') {
                                    hasDelectPaike(props.courselist.classContractRList[0].classId, data.message);
                                    return true;
                                } else if (data.status == 20008) {
                                    $scope.selectStudent = undefined;
                                    $scope.repeat_student = data.context;
                                    $scope.goPopup('zx_repeat_student', '860px');
                                }
                            }
                        });
                    }
                }

                function delTeachers(data, ind) {
                    data.hasSelected = false;
                    $scope.courseItemInfo.teachers.splice(ind, 1);
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

                function sel_hopetime(data) {
                    $scope.courseItemInfo.willTime = data;
                }
                //选择班级
                function choseClass_(data, ind) {
                    //                  if(data.package.feeType == 1) {
                    //                      if(!data.schoolYear || !data.schoolTerm) {
                    //                          layer.msg('请选择学年和学期');
                    //                          return;
                    //                      }
                    //                      data.schoolTerm.schoolYear = data.schoolYear;
                    //                  }
                    $scope.courseItemInfo = {
                        item: data,
                        index: ind,
                        classInfo: data.classInfo ? angular.copy(data.classInfo) : '',
                    }
                    window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px', { name: 'class', type: 'radio', item: data.course, schoolTerm: data.schoolTerm, screen_classType: '0', callBackName: '转课-报名选班',shopId:$scope.transferClass_params.school });
                }

                function deter_choseClass() {
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
                    $scope.closePopup('transferClass_choseClass_');
                }
                //通过课程id获取老师
                function getTeacherList(courseId) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/sale/getTeacherInfo",
                        type: "get",
                        data: {
                            courseId: courseId
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.listen_teacherList = res.context;
                            };
                        }
                    })
                }
                //确认选择转课的班级-筛选器
                function deter_transferClassClass(data) {
                    if (data) {
                        $scope.courseItemInfo.item.classInfo = data;
                        $scope.courseItemInfo.item.isShowClass = true;
                    }
                }

                //获取一对一老师
                function getOneTeacherList() {
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
                                $scope.oneTeacherList = res.context;
                            };
                        }
                    })
                }
                //选择学年
                function selYear(x) {
                    //                  x.classInfo = '';
                    //                  x.isShowClass = false;
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
                    //套餐列表变化需修改指令内套餐列表
                    $scope.$broadcast(x.mixid, count == 0 ? "按期报名" : "请选择套餐", x.packageList, true)
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
                //输入课程购买课和购买月数失焦状态时
                function inputPackageTime(x, type, clear) {
                    switch (type) {
                        case 1:
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
                        case 2:
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
                        case 3:
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
                        case 4:
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
                        case 5:
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
                    d.monthNum = '';
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
                function selTimeFrame(d, evt, type, ind) {
                    var _s = $scope.selTimeFrame_obj['startLaydate_' + d.time_id],
                        _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
                    //加载时间范围选择控件
                    if (type == 3 && !d.timeFrameLaydate) {
                        laydate.render({
                            elem: evt.target, //指定元素
                            //                          range: "/",
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
                                    //                              d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                                    //                              if(d.package.packageTime == 0) d.package.packagePrice = 0;
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

                //确定选择转课的课程-筛选器
                function deter_transferClassCourse(data) {
                    if (data) {
                        angular.forEach(data, function(val, ind) {
                            var objData_ = {
                                course: val,
                                mixid: GenNonDuplicateID(5),
                                //                              packageList: [],    //分期的套餐
                                //                              packageList_: [],   //课时的套餐
                                packageList: [],
                                package: { feeType: 0 },
                                package_: null,
                                discountType: '1',
                                discountPrice: 0,
                                discountPrice_: '100',
                                averageClassPrice: '',
                                contractMoney: '',
                                timeFrame: '',
                                isShowClass: false,
                                oneTeacher: '', //一对一老师
                                chargeType: '1', //收费类型（天、月）
                                monthNum: 0, //当收费类型是月时，月数
                                timeFrame: '', //时间范围
                                beginTime: $.format.date(new Date(), 'yyyy-MM-dd'),
                                time_id: val.courseId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                                signType: ($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool)? 1 :(val.signType ? 2 : ($scope.contractList ? 3 : 1)), //报名类型，新报-续报-扩科
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
                                        objData_.packageList = res.context;
                                        objData_.packageList_old = angular.copy(res.context);
                                        //如果是分期的
                                        //                                      if(val.feeType == '1') {
                                        //                                          objData_['schoolYear'] = (new Date()).getFullYear() + '';
                                        //                                          objData_['schoolTerm'] = '';
                                        //                                      }
                                        if (props.special == 'shengban_changeCourse') { //续费套餐id自动带入
                                            if (props.newPackage.apackage) {
                                                angular.forEach(res.context, function(val_) {
                                                    if (props.newPackage.apackage.packageId == val_.packageId) {
                                                        objData_.package_ = val_;
                                                    }
                                                })
                                            }
                                            if (props.newPackage.schoolTerm) {
                                                objData_['schoolYear'] = angular.copy(props.newPackage.schoolTerm.schoolYear) + '';
                                                angular.forEach($scope.schoolTermList, function(_v) {
                                                    if (props.newPackage.schoolTerm.schoolTermId == _v.schoolTermId) {
                                                        objData_['schoolTerm'] = _v;
                                                        //                                          			selSchoolTerm(objData_);
                                                    }
                                                })
                                            }
                                        }
                                        if (objData_['package_']) {
                                            objData_['package'] = angular.copy(objData_['package_']);
                                        }
                                        $scope.transferClass_params.courseList.push(objData_);
                                    };
                                }
                            })
                            // if (val.courseGoodsRS && val.courseGoodsRS.length > 0) {
                            //     var list = val.courseGoodsRS;
                            //     var arrGoods = [];
                            //     angular.forEach(list, function(v) {
                            //         v.goods.goodsNumber = v.goodsNumber;
                            //         arrGoods.push(v.goods);
                            //     });
                            //     deter_signUpGoods(arrGoods);
                            // }
                            setTimeout(function() {
                                for (var i = 0; i < $('.transferClass_timeFrame').length; i++) {
                                    laydate.render({
                                        elem: $('.transferClass_timeFrame')[i], //指定元素
                                        isRange: false,
                                        range: "/",
                                        min: $.format.date(new Date(), 'yyyy-MM-dd'),
                                        format: 'yyyy-MM-dd',
                                        done: function(value) {
                                            $scope.transferClass_params.courseList[this.elem.attr('index')].timeFrame = value;
                                        }
                                    });
                                }
                            });
                        })
                    }
                }
                //确定选择转课的班级课程-筛选器
                function deter_transferClasses(data) {
                    var arr = [];
                    arr.push(data);
                    console.log(arr);
                    if (arr) {
                        angular.forEach(arr, function(val, ind) {
                            var objData_ = {
                                classInfo: val,
                                course: val.course,
                                mixid: GenNonDuplicateID(5),
                                //                              packageList: [],    //分期的套餐
                                //                              packageList_: [],   //课时的套餐
                                packageList: [],
                                package: { feeType: 0 },
                                package_: null,
                                discountType: '1',
                                discountPrice: 0,
                                discountPrice_: '100',
                                averageClassPrice: '',
                                contractMoney: '',
                                timeFrame: '',
                                isShowClass: true,
                                oneTeacher: '', //一对一老师
                                chargeType: '1', //收费类型（天、月）
                                monthNum: 0, //当收费类型是月时，月数
                                timeFrame: '', //时间范围
                                beginTime: $.format.date(new Date(), 'yyyy-MM-dd'),
                                time_id: val.course.courseId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                                signType: ($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool)? 1 :(val.course.signType ? 2 : ($scope.contractList ? 3 : 1)), //报名类型，新报-续报-扩科
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
                                        objData_.packageList = res.context;
                                        objData_.packageList_old = angular.copy(res.context);
                                        //如果是分期的
                                        //                                      if(val.schoolTerm){
                                        //                                          objData_['schoolYear'] = val.schoolYear+"";
                                        //                                          angular.forEach($scope.schoolTermList, function(v_) {
                                        //                                              if(v_.schoolTermId == val.schoolTerm.schoolTermId) {
                                        //                                                  objData_['schoolTerm'] = v_;
                                        //                                                  getSchoolTerm(objData_);
                                        //                                              }
                                        //                                          })
                                        //                                      }
                                        if (props.special == 'shengban_changeCourse') { //续费套餐id自动带入
                                            if (props.newPackage.apackage) {
                                                angular.forEach(res.context, function(val_) {
                                                    if (props.newPackage.apackage.packageId == val_.packageId) {
                                                        objData_.package_ = val_;
                                                    }
                                                })
                                            }
                                            if (props.newPackage.schoolTerm) {
                                                objData_['schoolYear'] = angular.copy(props.newPackage.schoolTerm.schoolYear) + '';
                                                angular.forEach($scope.schoolTermList, function(_v) {
                                                    if (props.newPackage.schoolTerm.schoolTermId == _v.schoolTermId) {
                                                        objData_['schoolTerm'] = _v;
                                                        //                                          			selSchoolTerm(objData_);
                                                    }
                                                })
                                            }
                                        }
                                        if (objData_['package_']) {
                                            objData_['package'] = angular.copy(objData_['package_']);
                                        }
                                        $scope.transferClass_params.courseList.push(objData_);
                                    };
                                }
                            })
                            // if (val.course.courseGoodsRS && val.course.courseGoodsRS.length > 0) {
                            //     var list = val.course.courseGoodsRS;
                            //     var arrGoods = [];
                            //     angular.forEach(list, function(v) {
                            //         v.goods.goodsNumber = v.goodsNumber;
                            //         arrGoods.push(v.goods);
                            //     });
                            //     deter_signUpGoods(arrGoods);
                            // }
                            setTimeout(function() {
                                for (var i = 0; i < $('.transferClass_timeFrame').length; i++) {
                                    laydate.render({
                                        elem: $('.transferClass_timeFrame')[i], //指定元素
                                        isRange: false,
                                        range: "/",
                                        min: $.format.date(new Date(), 'yyyy-MM-dd'),
                                        format: 'yyyy-MM-dd',
                                        done: function(value) {
                                            $scope.transferClass_params.courseList[this.elem.attr('index')].timeFrame = value;
                                        }
                                    });
                                }
                            });
                        })
                    }
                }

                //确定报名学杂
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
                    $scope.transferClass_params.goodsList = $scope.transferClass_params.goodsList.concat(arr_1);
                }

                //确定选择课程包
                function deter_signUpCoursePackage(data) {
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
                                if (val.course.courseId == v2.courseId) val.signType = 2;
                            })
                        }
                        var ls_package = {};
                        var objData_ = {
                            course: val.course,
                            //	                            packageList: [],    //分期的套餐
                            //                              packageList_: [],   //课时的套餐
                            mixid: GenNonDuplicateID(5),
                            packageList: [],
                            package: {},
                            package_: {},
                            _d: val,
                            discountType: val.discountType ? val.discountType + '' : '1',
                            discountPrice: val.discounts ? val.discounts : '',
                            discountPrice_: val.discounts ? val.discounts : '100',
                            averageClassPrice: '',
                            contractMoney: '',
                            isShowClass: false,
                            oneTeacher: '', //一对一老师
                            chargeType: '', //收费类型（天、月）
                            monthNum: 0, //当收费类型是月时，月数
                            timeFrame: '', //时间范围
                            beginTime: $.format.date(val.beginTime, 'yyyy-MM-dd'),
                            endTime: $.format.date(val.endTime, 'yyyy-MM-dd'),
                            time_id: val.courseId + '_' + new Date().getTime(),
                            signType: ($scope.transferStatus && $scope.transferClass_params.school != $scope.transferClass_params.thisSchool)? 1 :(val.signType ? 2 : ($scope.contractList ? 3 : 1)), //报名类型，新报-续报-扩科
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
                                    objData_.packageList = res.context;
                                    objData_.packageList_old = angular.copy(res.context);

                                    //如果是分期
                                    if (val.feeType == '1') {
                                        objData_['schoolYear'] = val.schoolYear + '';
                                        if ($scope.schoolTermList) {
                                            angular.forEach($scope.schoolTermList, function(_v) {
                                                if (val.schoolTermId == _v.schoolTermId) {
                                                    objData_.schoolTerm = _v;
                                                    //	                                                selSchoolTerm(objData_);
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
                                    $scope.transferClass_params.courseList.push(objData_);
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
                        deter_signUpGoods(arrGoods);
                    }
                }

                //活动报名窗口
                function ACTIVITYSIGNUP() {
                    $scope.choseActivityCourse = choseActivityCourse; //点击选择课程
                    $scope.deter_choseActivityCourse = deter_choseActivityCourse; //选择课程之后点击确定按钮
                    $scope.judgeAllChecked = false; //判断未使用活动全选状态
                    $scope.del_act_signup = del_act_signup; //删除活动报名数据
                    $scope.activitySignupList = []; //活动报名数据
                    $scope.joinActivityList = []; //活动列表
                    $scope.activity_signup = activity_signup_; //活动报名
                    $scope.textOver = function(evt) {
                        evt.stopPropagation();
                        $(evt.target).find('.activity_signup_icon_text').show();
                    }
                    $scope.textOut = function(evt) {
                        evt.stopPropagation();
                        $(evt.target).find('.activity_signup_icon_text').hide();
                    }

                    //点击活动报名
                    function activity_signup_() {
                        getActivityList();
                        $scope.goPopup('signUp_joinActivity_', '960px');
                    }

                    function getActivityList(special) {
                        $scope.joinActivityList = []; //活动列表
                        $.hello({
                            url: CONFIG.URL + "/api/oa/activity/getActivityJoinList",
                            type: "get",
                            data: {
                                potentialCustomerId: props.studentInfo.potentialCustomerId,
                                prizeUseStatus: 0,
                            },
                            success: function(res) {
                                if (res.status == 200) {
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
                                    val.hasChecked = false;
                                } else {
                                    val.hasChecked = true;
                                }
                            });
                            if ($scope.judgeAllChecked) {
                                $scope.judgeAllChecked = false;
                            } else {
                                $scope.judgeAllChecked = true;
                            };
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
                                                $scope.closePopup('signUp_joinActivity_');
                                            })
                                        } else {
                                            $scope.activitySignupList = $scope.activitySignupList.concat(activityList_all);
                                            $scope.closePopup('signUp_joinActivity_');
                                        }
                                    }
                                }
                            });
                        } else {
                            $scope.activitySignupList = $scope.activitySignupList.concat(activityList_all);
                            $scope.closePopup('signUp_joinActivity_');
                        }
                    }

                    //选完活动课程之后点击确定按钮-处理数据
                    function handleActivityCourse(val) {
                        var result = null;
                        var listCourse = [];
                        var listGoods = [];
                        angular.forEach(val.activityPrizeList, function(val_) {
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
                                    '_d': val_,
                                    'course': {
                                        'courseId': val_.prizeId,
                                        'courseName': val_.prizeName,
                                        'teachingMethod': val_.teachingMethod
                                    },
                                    'packageList': val_.packageList,
                                    'packageList_old': angular.copy(val_.packageList),
                                    'package': {},
                                    'package_': {},
                                    'amount': 0,
                                    'discountType': val_.discountType + '',
                                    'discountPrice': val_.discounts,
                                    'discountPrice_': '100',
                                    'averageClassPrice': '',
                                    'contractMoney': '',
                                    'timeFrame': '',
                                    'chargeType': '', //收费类型（天、月）
                                    'monthNum': 0, //当收费类型是月时，月数
                                    'isShowClass': false,
                                    'beginTime': val_.beginTime ? $.format.date(val_.beginTime, 'yyyy-MM-dd') : $.format.date(new Date(), 'yyyy-MM-dd'),
                                    'endTime': $.format.date(val_.endTime, 'yyyy-MM-dd'),
                                    'signType': val_.signType ? 2 : ($scope.contractList ? 3 : 1),
                                };
                                //如果是分期
                                if (val_.feeType == '1') {
                                    objData_['schoolYear'] = val_.schoolYear + '';
                                    if ($scope.schoolTermList) {
                                        angular.forEach($scope.schoolTermList, function(_v) {
                                            if (val_.schoolTermId == _v.schoolTermId) {
                                                objData_.schoolTerm = _v;
                                                //	                                            selSchoolTerm(objData_, val_.packageId);
                                            }
                                        })
                                    }
                                }
                                //	                            else {
                                //	                                angular.forEach(val_.packageList, function(val_2) {
                                //	                                    if(val_.packageId == val_2.packageId) {
                                //	                                        ls_package = val_2;
                                //	                                    }
                                //	                                });
                                //	                                objData_['package'] = ls_package;
                                //	                            }
                                angular.forEach(val_.packageList, function(val_2) {
                                    if (val_.packageId == val_2.packageId) {
                                        ls_package = val_2;
                                    }
                                });
                                objData_['package_'] = ls_package;

                                if (val_.feeType == "2") {
                                    objData_['monthNum'] = getDatemonth(objData_.beginTime, objData_.endTime);
                                }
                                objData_['package_']['packageTime'] = val_.buyTime;
                                objData_['package_']['packagePrice'] = val_.prizePrice;
                                objData_['package_']['giveTime'] = val_.giveTime;
                                if (val && val_.feeType == '2' && objData_.chargeType != '1') {
                                    objData_['package_']['packageUnitPrice'] = numAccuracy((objData_['package_']['packagePrice'] / objData_['package_']['packageTime']) * 30);
                                } else {
                                    objData_['package_']['packageUnitPrice'] = numAccuracy(objData_['package_']['packagePrice'] / objData_['package_']['packageTime']);
                                }
                                objData_['package'] = angular.copy(objData_['package_']);
                                if (val_.discountType == '1') {
                                    objData_["amount"] = numAccuracy(objData_['package']['packagePrice'] - objData_.discountPrice);
                                } else {
                                    objData_["amount"] = numAccuracy(objData_['package']['packagePrice'] * (objData_.discountPrice_ / 100));
                                }
                                listCourse.push(objData_);
                            } else {
                                listGoods.push({
                                    'activityId': val.activityId,
                                    'activityJoinId': val.activityJoinId,
                                    'activityName': val.activityName,
                                    'goodsName': val_.prizeName,
                                    'goodsPrice': val_.unitPrice,
                                    'goodsPrice_': val_.unitPrice,
                                    'goodsNumber': val_.prizeNumber,
                                });
                            }
                        });
                        result = { 'activity_course': listCourse, 'activity_goods': listGoods, 'activityName': val.activityName, 'activityJoinId': val.activityJoinId };
                        return result;
                    }

                    //点击删除课程和学杂
                    function del_act_signup(type, ind, ind_) {
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
                            layer.close(isConfirm);
                            $scope.$apply();
                        }, function() {
                            layer.close(isConfirm);
                        })
                    }
                }
                //删除学杂
                function del_signUpGoods(ind) {
                    $scope.transferClass_params.goodsList.splice(ind, 1);
                    //	                var isDelect = layer.confirm('是否删除该学杂？', {
                    //	                    title: "确认删除信息",
                    //	                    skin: 'newlayerui layeruiCenter',
                    //	                    closeBtn: 1,
                    //	                    offset: '30px',
                    //	                    move: false,
                    //	                    area: '560px',
                    //	                    btn: ['是', '否'] //按钮
                    //	                }, function() {
                    //	                    $scope.transferClass_params.goodsList.splice(ind, 1);
                    //	                    $scope.$apply();
                    //	                    layer.close(isDelect);
                    //	                }, function() {
                    //	                    layer.close(isDelect);
                    //	                })
                }
            }
            //退课
            function RETURNCLASS() {
                $scope.orderCourse = {}; //课程信息
                $scope.refundDesc = "";
                $scope.studentOrders = []; //学生订单信息
                $scope.shopTeacherId = localStorage.getItem('shopTeacherId');
                $scope.shopTeachName = localStorage.getItem('userName');
                $scope.ref_received = 0; //实退金额
                $scope.ref_receivable = { 'money': 0, 'contractMoney': 0 }; //应退金额
                $scope.refund_time = yznDateFormatYMdHms(new Date());
                $scope.refund_confirm = refund_confirm; //退费确认
                $scope.isOnlinePayType = false; //是否开通了线上支付（易收宝）
                $scope.PayProjectList = {
                    'student': { 'paymentMode': '学员账户', 'paymentMoney': '' },
                    'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '' },
                };
                (function() {
                    laydate.render({
                        elem: "#refund_time",
                        isRange: false,
                        type: "datetime",
                        trigger: 'click',
                        done: function(value) {
                            $scope.refund_time = value;
                        }
                    });
                })();

                $scope.returnClassOperate = function(type, d_) {
                    switch (type) {
                        case 1: //点击选择一条退费续费单
                            d_.hasChecked = d_.hasChecked ? false : true;
                            d_.returnBuyTime = d_.buySurplusTime;
                            d_.returnGiveTime = d_.giveSurplusTime;
                            $scope.watchInputOperate(1, d_);
                            watchReceivable(2);
                            break;
                        case 2:

                            break;
                    }
                }

                function refund_confirm() {
                    var courseList = [];
                    angular.forEach($scope.returnClassList, function(v1) {
                        if (v1.hasChecked) {
                            courseList.push({
                                'contractRenewId': v1.contractRenewId,
                                'amount': v1.returnPrice,
                                'returnBuyTime': v1.feeType != 2 ? numAccuracy(v1.returnBuyTime) : undefined,
                                'returnGiveTime': v1.feeType != 2 ? numAccuracy(v1.returnGiveTime) : undefined,
                            })
                        }
                    })
                    if (courseList.length == 0) {
                        layer.msg("请选择需要退费的合同");
                        return;
                    }
                    if (numAccuracy($scope.PayProjectList.other.paymentMoney) !== numAccuracy($scope.ref_receivable.money)) {
                        layer.msg("退款不可多退、不可少退");
                        return;
                    }
                    $scope.PayProjectList['other']['paymentMoney'] = numAccuracy($scope.PayProjectList['other']['paymentMoney']);
                    var PayProjectList = $scope.PayProjectList['other']['paymentMoney'] * 1 ? [$scope.PayProjectList['other']] : [];

                    if ($scope.PayProjectList['student'].paymentMoney * 1) { //如果有学员账户的钱
                        PayProjectList.push($scope.PayProjectList['student']);
                    }
                    var param = {
                        "remark": $scope.refundDesc, // 备注
                        "externalRemark": $scope.refundDesc_out, // 备注
                        "handlerId": $scope.shopTeacherId, // 经办
                        "paymentTime": $scope.refund_time, // 支付时间
                        "studentInfo": { // 学生信息
                            "id": props.courselist.studentId, // 学生id
                            "potentialCustomerId": props.courselist.potentialCustomerId // 潜客id
                        },
                        'contractRenewList': courseList,
                        "orderPaymentList": PayProjectList,
                        // "orderType": 5, // 订单类型 1：新签 2：续签 3：转课 4：结课 5：退费
                        "orderCourse": { // 订单内容
                            "courseId": props.courselist.course.courseId, // 课程id
                            "contractId": props.courselist.contractId, // 合同id
                        }
                    }
                    for (var i in param) {
                        if (param[i] === '' || param[i] == undefined || param[i] == NaN) {
                            delete param[i];
                        };
                    };
                    for (var i in param.orderCourse) {
                        if (param.orderCourse[i] === '' || param.orderCourse[i] == undefined || param.orderCourse[i] == NaN) {
                            delete param.orderCourse[i];
                        };
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/repay",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == 200) {
                                layer.msg('退课成功', {
                                    icon: 1
                                });
                                SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                $scope.closePopup('operat_refund');
                            } else if (data.status == '20018') {
                                hasDelectPaike(props.courselist.classContractRList[0].classId, data.message);
                                return true;
                            }
                        }
                    })
                }
            };

            //结课
            function ENDCLASS() {
                console.log(props);
                $scope.endclass_prop = {};
                $scope.endCoursesList = [];
                $scope.endCourses = {
                    hour: [],
                    period: [],
                    month: []
                };
                $scope.param_datas = [];
                $scope.EndCoursesInfo = {
                    buySurplusTime: 0.00,
                    buySurplusDateNum: 0.00,
                    giveSurplusTime: 0.00,
                    giveSurplusDateNum: 0.00,
                    arrearage: 0.00,
                    amount: 0.00,
                    contractRenewBuysurplusPrice: 0.00
                };
                $scope.endclass_prop = angular.copy(props);
                if (props.page == "signUp_detail") {
                    $scope.endclass_prop.contractRenew.hasChecked = true;
                    $scope.endCoursesList.push($scope.endclass_prop.contractRenew);
                    if ($scope.endclass_prop.contractRenew.feeType != 2) {
                        $scope.endCourses.hour = $scope.endCoursesList;
                    } else {
                        $scope.endCourses.month = $scope.endCoursesList;
                    }

                    $scope.EndCoursesInfo = {
                        buySurplusTime: $scope.endCoursesList[0].buySurplusTime * 1,
                        buySurplusDateNum: $scope.endCoursesList[0].buySurplusDateNum * 1,
                        giveSurplusTime: $scope.endCoursesList[0].giveSurplusTime * 1,
                        giveSurplusDateNum: $scope.endCoursesList[0].giveSurplusDateNum * 1,
                        arrearage: $scope.endCoursesList[0].arrearage * 1,
                        amount: $scope.endCoursesList[0].contractRenewBuysurplusPrice * 1 - $scope.endCoursesList[0].arrearage * 1,
                    };
                } else {
                    getEndCoursesList();
                    getOwnCourse($scope.endclass_prop.courselist.contractId);
                }
                //              getEndCoursesInfo();
                $scope.talkDesc = '';
                $scope.finishClassComfirm = finishClassComfirm;
                $scope.finishClassComfirm_2 = finishClassComfirm_2;
                //              $scope.watchEndclass = watchEndclass;
                $scope.sel_course = sel_course; //选择课程

                //选择课程
                function sel_course(data, evt) {
                    if ($scope.endclass_prop.page == 'signUp_detail') {
                        return;
                    }
                    var index_ = [false, null];
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach($scope.param_datas, function(val, ind) {
                            if (data.contractRenewId == val.contractRenewId) {
                                index_ = [true, ind];
                            }
                        });
                        if (index_[0]) {
                            $scope.param_datas.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        $scope.param_datas.push(data);
                    }
                }

                function getEndCoursesList() {
                    var param = {
                        'contractId': props.courselist.contractId,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/getContractRenewList",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == 200) {
                                $scope.endCourses.hour = data.context.hour.concat(data.context.period);
                                $scope.endCourses.month = data.context.month;
                                var list = data.context.hour.concat(data.context.period).concat(data.context.month);
                                angular.forEach(list, function(v) {
                                    v.hasChecked = true;
                                });
                                $scope.endCoursesList = list;
                                $scope.param_datas = angular.copy(list);
                            }
                        }
                    });
                }
                $scope.$watch("param_datas", function(n, o) {
                    if (n === o || n == undefined) return;
                    var buyNum = buyDate = giveTime = giveDate = arrearage = amount = price = 0.00;
                    if ($scope.param_datas) {
                        angular.forEach($scope.param_datas, function(v) {
                            if (v.hasChecked) {
                                if (v.feeType == 2) {
                                    buyDate += v.buySurplusDateNum * 1;
                                    giveDate += v.giveSurplusDateNum * 1;
                                } else {
                                    buyNum += v.buySurplusTime * 1;
                                    giveTime += v.giveSurplusTime * 1;
                                }
                                arrearage += v.arrearage * 1;
                                price += v.contractRenewBuysurplusPrice * 1;
                            }
                        });
                    } else {
                        buyNum = buyDate = giveTime = giveDate = arrearage = amount = price = 0.00;
                    }
                    $scope.EndCoursesInfo = {
                        buySurplusTime: buyNum,
                        buySurplusDateNum: buyDate,
                        giveSurplusTime: giveTime,
                        giveSurplusDateNum: giveDate,
                        arrearage: arrearage,
                        amount: price * 1 - arrearage,
                    };
                }, true);

                function getArr() {
                    var list = [];
                    angular.forEach($scope.param_datas, function(v) {
                        if (v.hasChecked) {
                            list.push(v.contractRenewId);
                        }
                    });
                    return list;
                }

                function finishClassComfirm() {
                    //异常处理，如果接口没返回或者接口失败了
                    if (!$scope.endCoursesList) {
                        return layer.msg("数据请求异常，请关闭当前页面后重试");
                    }

                    if ($scope.endCoursesList.length > 0 && getArr().length <= 0) {
                        return layer.msg("请选择结课合同");
                    }
                    var param = {
                        "remark": $scope.talkDesc, // 备注
                        "studentInfo": { // 学生信息
                            "id": props.courselist.studentId, // 学生id
                            "potentialCustomerId": props.courselist.potentialCustomerId // 潜客id
                        },
                        "orderCourse": { // 课程信息
                            "courseId": props.courselist.course.courseId, // 课程id
                            "contractId": props.courselist.contractId, // 合同id
                            //                          "schoolTermId":props.classlist.schoolTerm?props.classlist.schoolTerm.schoolTermId:undefined,// 学期id（按期课程必传）
                            //                          "schoolYear":props.classlist.schoolTerm?props.classlist.schoolTerm.schoolYear:undefined// 学年（按期课程必传）
                        },
                        "contractRenewIds": getArr(),
                        "unitPrice": props.page == 'signUp_detail' ? undefined : ($scope.ownCourse ? $scope.ownCourse.unitPrice : undefined)
                    }
                    for (var i in param) {
                        if (param[i] === '' || param[i] == undefined) {
                            delete param[i];
                        };
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/endCourses",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == 200) {
                                layer.msg('结课成功', {
                                    icon: 1
                                });

                                SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                $scope.closePopup('operat_finish');
                            } else if (data.status == '20018') {
                                hasDelectPaike(props.courselist.classContractRList[0].classId, data.message);
                                return true;
                            }
                        }
                    });
                }

                //报课明细入口的结课
                function finishClassComfirm_2() {
                    var param = {
                        "remark": $scope.talkDesc, // 备注
                        "contractRenewId": props.contractRenew.contractRenewId,
                        "unitPrice": $scope.ownCourse ? $scope.ownCourse.unitPrice : undefined
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/endContractRenew",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == 200) {
                                layer.msg('结课成功', {
                                    icon: 1
                                });
                                if (props.page == "signUp_detail") {
                                    $scope.$emit("edu_signUp_detail_reload", false);
                                }
                                $scope.closePopup('operat_finish');

                            } else if (data.status == '20018') {
                                //                              hasDelectPaike(props.courselist.classContractRList[0].classId, data.message);
                                //                              return true;
                            }
                        }
                    });
                }
            }

            function getOwnCourse(id) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/getOwnCourse",
                    type: "get",
                    data: { contractId: id },
                    success: function(data) {
                        $scope.ownCourse = data.context;
                    }
                })
            }

            //退学杂
            function RETURNGOODS() {
                $scope.classList.courselist.returnNum = 0;
                $scope.classList.courselist.returnPrice = 0;
                $scope.shopTeacherId = localStorage.getItem('shopTeacherId');
                $scope.shopTeachName = localStorage.getItem('userName');
                $scope.returnGoods_confirm = returnGoods_confirm; //确定退学杂
                $scope.isOnlinePayType = false; //是否开通了线上支付（易收宝）
                $scope.PayProjectList = {
                    'student': { 'paymentMode': '学员账户', 'paymentMoney': '0' },
                    'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '0' },
                };
                $scope.returnGoodsInfo = {
                    list: [$scope.classList.courselist],
                    contractMoney: 0,
                    receivable: 0, //应收金额
                    payTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'), //退款时间
                    remark: '', //备注
                };

                (function() {
                    laydate.render({
                        elem: "#refund_time_goods",
                        isRange: false,
                        type: "datetime",
                        value: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                        trigger: 'click',
                        done: function(value) {
                            $scope.returnGoodsInfo.payTime = value;
                        }
                    });
                })();

                $scope.returnGoodsOperate = function(type, _da) {
                    switch (type) {
                        case 1: //输入学员账户的钱
                            watchReturnGoodsMoney();
                            break;
                        case 2: //输入退学杂金额
                            watchReturnGoodsMoney();
                            break;
                        case 3: //输入退学杂数量
                            if (_da.returnNum * 1 > _da.num * 1) {
                                layer.msg('退学杂数量不可大于购买学杂数量');
                                _da.returnNum = _da.num;
                            }
                            _da.returnPrice = _da.returnNum * _da.goodsPrice;
                            watchReturnGoodsMoney();
                            break;
                    }
                }

                //计算应收金额
                function watchReturnGoodsMoney() {
                    var n_ = 0;
                    angular.forEach($scope.returnGoodsInfo.list, function(v1) {
                        n_ += (v1.returnPrice ? v1.returnPrice * 1 : 0);
                    });
                    $scope.returnGoodsInfo.contractMoney = numAccuracy(n_);
                    $scope.returnGoodsInfo.receivable = numAccuracy(n_ - $scope.PayProjectList.student.paymentMoney);
                }

                function returnGoods_confirm() {
                    $scope.PayProjectList['other']['paymentMoney'] = numAccuracy($scope.PayProjectList['other']['paymentMoney']);
                    var goodsList = [];
                    var PayProjectList = $scope.PayProjectList['other']['paymentMoney'] * 1 ? [$scope.PayProjectList['other']] : [];
                    if ($scope.PayProjectList['student'].paymentMoney * 1) { //如果有学员账户的钱
                        PayProjectList.push($scope.PayProjectList['student']);
                    }

                    angular.forEach($scope.returnGoodsInfo.list, function(v1) {
                        goodsList.push({
                            'goodsId': v1.goodsId,
                            'outNum': v1.returnNum ? v1.returnNum : 0,
                            'orderGoodsId': v1.orderGoodsId,
                            //                          'stockRecordGoodsId': v1.stockRecordGoodsId,
                            'amount': v1.returnPrice ? v1.returnPrice : 0,
                        })
                    });

                    var params = {
                        'remark': $scope.returnGoodsInfo.remark,
                        'handlerId': $scope.shopTeacherId,
                        'paymentTime': $scope.returnGoodsInfo.payTime,
                        'orderPaymentList': PayProjectList,
                        'orderGoodInfo': goodsList[0],
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/repayGoods",
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(data) {
                            if (data.status == 200) {
                                layer.msg('操作成功', {
                                    icon: 1
                                });
                                SERVICE.POTENTIALPOP.reloadStudentCourseList();
                                $scope.closePopup('operat_refund');
                            } else if (data.status == '20018') {
                                hasDelectPaike(props.courselist.classContractRList[0].classId, data.message);
                                return true;
                            }
                        }
                    });
                }

            }

            //获取经办人或者顾问列表
            function getHandlerList() {
                $.hello({ //经办人 /api/oa/order/getHandlerList
                    url: CONFIG.URL + "/api/oa/order/getHandlerList",
                    type: "get",
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.HandlerList = data.context;
                        }
                    }
                });
                $.hello({ //顾问接口
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data: {
                        pageType: "0",
                        shopTeacherStatus: "1",
                        quartersTypeId: "3"
                    },
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.adviserList = data.context;
                            angular.forEach($scope.adviserList, function(v1) { //把所有的顾问占比先设置成100%
                                v1.percentage = 100;
                            });

                        };
                    }
                });
            }

            init(); //数据初始化
        }
    });
})