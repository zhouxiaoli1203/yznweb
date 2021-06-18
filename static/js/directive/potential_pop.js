define(['laydate', 'socketIo', 'timesel', 'timePop', 'arrangePop', 'qrcode', 'checkAnswer', "operation", "signUp", "courseAndClass_sel", "hopetime", 'photoPop', 'classroomPop', "customPop", 'bukePop', 'listenPop', 'collectionPop'], function(laydate, socketIo) {
    creatPopup({
        el: 'potPop',
        openPopupFn: 'viewInfos',
        closePopupFn: 'closeRollCall',
        htmlUrl: './templates/popup/popential_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state, $sce) {
            var props = angular.copy(props);
            $scope.props = props;
            var global_potentialId = props.item ? props.item.potentialCustomerId : undefined;
            console.log(props);
            var LAYDATE, LAYDATEYEAR; //时间
            $scope.frozen_missPot = false;
            $scope.interal = false;
            $scope.xiuke = false;
            $scope.isFirst = true;//用来判断是否是第一次进入该弹框
            $scope.pickUpShow = checkAuthMenuById(124) && (((window.currentUserInfo.shop.config) & 0x0200) > 0); //有权限且开关开启
            function init() {
                getConfig();
                if (props.page == 1) {
                    $scope.isShowHeaderImg = true;
                } else {
                    $scope.isShowHeaderImg = false;
                }
                switch (props.title) {
                    case "添加跟进":
                        addInit(); //添加跟进初始化
                        break;
                    case "预约来访":
                        appointInit(); //预约来访初始化
                        break;
                    case "预约试听":
                        appointLisn(); //预约试听初始化
                        break;
                    case "暂无意向":
                    case "标为无效":
                    case "放回公池":
                        $scope.potentDesc = "";
                        break;
                    case "转让潜客":
                        getAdvers();
                        break;
                    default:
                        mainInit();
                        break;
                };
                if (props.page == 0) {
                    $scope.popNav = [{
                            name: '基本信息',
                            tab: 1
                        }, {
                            name: '跟进记录',
                            tab: 2
                        }
                        //                      ,{
                        //                          name: '试听记录',
                        //                          tab: 3
                        //                      }
                    ];
                    if (!(props.item.potentialCustomerStatus == 1 || props.item.potentialCustomerStatus == 3)) {
                        $scope.popNav.push({
                            name: '报读课程',
                            tab: 4
                        }, {
                            name: '订单信息',
                            tab: 6
                        });
                    }

                } else {
                    $scope.popNav = [{
                        name: '基本信息',
                        tab: 1
                    }, {
                        name: '报读课程',
                        tab: 4
                    }, {
                        name: '上课记录',
                        tab: 5
                    }, {
                        name: '学员相册',
                        tab: 8
                    }, {
                        name: '订单信息',
                        tab: 6
                    }];
                }
                //65我的潜客 13全部潜客   29浏览学员
                if (checkAuthMenuById("65") || checkAuthMenuById("13") || checkAuthMenuById("29")) {
                    $scope.popNav.push({
                        name: '可用活动',
                        tab: 7
                    }, {
                        name: '优惠券',
                        tab: 9
                    }, {
                        name: '调查问卷',
                        tab: 10
                    });
                }

                if (props.page == 0) {
                    $scope.addPotientalPop = checkAuthMenuById("14");
                } else {
                    $scope.addPotientalPop = checkAuthMenuById("30");
                }

                $scope.potentialQuanxian = checkAuthMenuById("14");
                $scope.studentQuanxian = checkAuthMenuById("30");
                $scope.deletePotial = checkAuthMenuById("108"); //删除潜客
                $scope.youxiaoqi = checkAuthMenuById("150"); //有效期设置权限
                if (props.item && props.item.potentialCustomerId) {
                    getPotentialInfo(props.item.potentialCustomerId); //通过潜客id获取潜客或者学员详情
                }
                //新增沟通，预约来访
                $scope.confirm_addTalk = confirm_addTalk;
                $scope.confirm_yuyueCome = confirm_yuyueCome;
                $scope.add_showInfo = add_showInfo; //添加多媒体
                $scope.delete_showInfo = delete_showInfo; //删除多媒体

                $scope.ngMouseenter = ngMouseenter;
                $scope.ngMouseleave = ngMouseleave;
                $scope.mouseoverOd = mouseoverOd; //手机号悬浮框
                $scope.mouseleaveOd = mouseleaveOd; //手机号悬浮框
                $scope.reloadStudData = reloadStudData; //当弹框是从班级本班学员进来时关闭学员主弹框进行数据刷新

                $scope.popNavSelected = props.tab;
                $scope.changePopNav = changePopNav; //主弹框tab切换
                changePopNav(props.tab);

                $scope.deletePopential = deletePopential; //确认删除潜客或者学员信息
                $scope.changePot_confirm = changePot_confirm; //顾问分配确认
                $scope.changeStatus_confirm = changeStatus_confirm; //操作潜客更多里状态
                $scope.openPhotos = openPhotos;
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

                $scope.closeDialog = function() {
                    layer.close(dialog);
                }
                $scope.goCommonPop = function(el, id, width, data, fn) {
                    if (fn) {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data, fn);
                    } else {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                    }

                }
            }
            init();
            SERVICE.POTENTIALPOP.reloadPopNav = function(x) {
                changePopNav(x);
                getPotentialInfo(props.item.potentialCustomerId); //通过潜客id获取潜客详情
            }

            function reloadStudData() {
                if (props.fromPage == 'classPop') {
                    $scope.$emit("studentCourseList");
                }
            }

            function getConfig() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.config = data.context.config;
                            if (props.page == 1) {
                                if ($scope.config & CONFIG_INTEGRAL_CONTROL) {
                                    $scope.interal = true;
                                }
                                if ($scope.config & CONFIG_XIUKE_STATUS) {
                                    $scope.xiuke = true;
                                }
                            }
                        }
                    }
                })
            }

            function getAdvers() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/shopTeacher/list',
                    type: 'get',
                    data: { pageType: '0', quartersTypeId: '3', shopTeacherStatus: '1' },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.descedList = data.context;
                        }
                    }
                });
            };

            function mouseoverOd($event) {
                if ($scope.potentialInfo.potentialCustomerParentTowPhone || $scope.potentialInfo.potentialCustomerParentThreePhone) {
                    //                      var e_ = $(e.currentTarget);
                    //                      var top_ = e_.offset().top;
                    //                      var left_ = e_.offset().left;
                    //                      var $this = $(e.target);
                    //                      var initleft = $('#student_recharge').offset().left,
                    //                          scrollTop = e_.closest('.layer_msk')?e_.closest('.layer_msk').scrollTop():0;
                    //                      $this.find(".openPop").css({
                    //                          left: left_- initleft-15,
                    //                          top: top_+scrollTop-15,
                    //                          display:"block"
                    //                      });
                    $($event.target).closest(".parent").find(".openPop").show();
                }
            }

            function mouseleaveOd($event) {
                //                  $(e.target).find(".openPop").css({
                //                          display:"none"
                //                      });
                $($event.target).closest(".parent").find(".openPop").hide();
            }
            //将六中tab  分别写进6个方法里 ，可以精细区分
            function changePopNav(val, type, course) {
                $scope.popNavSelected = val;
                switch (val) {
                    case 1:
                        BASEINFOFUNCTION();
                        break;
                    case 2:
                        FOLLOWUPFUNCTION();
                        break;
                    case 4:
                        ENROLLCOURSESFUNCTION()
                        break;
                    case 5:
                        CLASSRECORDFUNCTION(type, course);
                        break;
                    case 6:
                        ORDERINFOFUNCTION();
                        break;
                    case 7:
                        JOINACTIVITY();
                        break;
                    case 8:
                        STUDENTPHOTOS();
                        break;
                    case 9:
                        YOUHUIQUAN();
                        break;
                    case 10:
                        SURVEY();
                        break;
                    default:
                        break;
                }
                $scope.isFirst = false;
            }
            //转成yyyy-MM-dd
            $scope.yznDateFormatYMd = function(val) {
                    return yznDateFormatYMd(val);
                }
                //转成yyyy-MM-dd HH:mm
            $scope.$yznDateFormatYMdHm = function(val) {
                    return yznDateFormatYMdHm(val);
                }
                //转成HH:mm
            $scope.$yznDateFormatHm = function(val) {
                    return yznDateFormatHm(val);
                }
                //返回 星期X
            $scope.$returnWee = function(val) {
                return returnWeek(val);
            }

            function getHandlerList() {
                $.hello({ //经办人 /api/oa/order/getHandlerList
                    url: CONFIG.URL + "/api/oa/order/getHandlerList",
                    type: "get",
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.handlerList = data.context;
                        }
                    }
                });
            }

            /*基本信息*/
            function BASEINFOFUNCTION() {
                getHandlerList();
                if(!$scope.isFirst){
                    getPotentialInfo(props.item.potentialCustomerId);
                }
                // getPotentialInfo(props.item.potentialCustomerId);多次调用？
                $scope.editPopential = editPopential; //编辑潜客或者学员入口
                $scope.caclBirthToAge = caclBirthToAge; //计算年龄
                $scope.handleNeed = handleNeed; //获取需要的展示数据
                $scope.conf_studPay = conf_studPay; //点击充值弹出框
                $scope.open_studPay = open_studPay; //点击充值弹出框
                $scope.openAccountRecord = openAccountRecord; //点击查看学员账户记录弹框
                $scope.openInteralRecord = openInteralRecord; //点击查看积分记录弹框
                $scope.PayTypeList = getConstantList(CONSTANT.PAYTYPENEW); //支付方式\
                $scope.changeIntegral = changeIntegral; //积分变动
                $scope.isOnlinePayType = window.currentUserInfo.shop.auditStatus == 2 ? true : false; //是否开通了线上支付（易收宝）
                $scope.PayProjectList = {
                    'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '0' },
                };
                $scope.clickPayTypeIcon = function(d) { //点击支付方式
                    if (d) {
                        $scope.PayProjectList['other']['paymentMode'] = d;
                    } else {
                        layer.msg('请开通易收宝后使用');
                    }
                };
                $scope.isRepay = false;
                laydate.render({
                    elem: "#studRepay_time",
                    isRange: false,
                    type: "datetime",
                    trigger: 'click',
                    done: function(value) {
                        $scope.studRepay_time = value;
                    }
                });

                function getRuleList() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/points/listPointsRule',
                        type: "get",
                        data: { ruleType: 2 },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.ruleList = data.context;
                            }

                        }
                    })
                }

                function editPopential() {
                    var param = {
                        'page': props.page,
                        'type': 'edit',
                        'item': props.item,
                        'location': 'inside'
                    };
                    window.$rootScope.yznOpenPopUp($scope, 'add-infos', 'addPotential', '760px', param);
                }

                //获取需要的数据
                function handleNeed(val, type) {
                    if (type == 'relation') { //关系表
                        return relation(val);
                    }
                }

                function conf_studPay() {
                    if ($scope.PayProjectList.other.paymentMoney == 0) {
                        layer.msg('充值金额需大于0元');
                        return;
                    }
                    $scope.goPopup('account_confirm', '560px');
                    $scope.confirm_studPay = confirm_studPay; //确认充值

                    function confirm_studPay() {
                        $scope.f5Id = null;
                        var url;
                        var params = {
                            "studentInfo": {
                                "id": props.item.id, // 学生id
                                "potentialCustomerId": props.item.potentialCustomerId // 潜客id
                            },
                            "remark": $scope.payDesc, // 备注
                            "externalRemark": $scope.payDesc_out, // 备注
                            "handlerId": $scope.agent, // 经办人shopTeacherId
                            "paymentTime": $scope.PayProjectList['other']['paymentMode'] == '易收宝' ? undefined : $scope.studRepay_time, // 支付时间
                            "orderPaymentList": [$scope.PayProjectList['other']]
                        }
                        $scope.codeFn_ = function(code, fn) {
                            if (code) {
                                params.authCode = code;
                            }
                            $.hello({
                                url: CONFIG.URL + url,
                                type: "post",
                                data: JSON.stringify(params),
                                success: function(data) {
                                    if (data.status == '200') {
                                        //判断充值是否是易收宝
                                        if ($scope.isRepay && $scope.PayProjectList['other']['paymentMode'] == '易收宝') {
                                            $scope.f5Id = data.context.orderId;
                                            //支付完成自动关闭弹窗
                                            webSocketInit(data.context.orderId, function(event) {
                                                var res = JSON.parse(event);
                                                if (res.payStatus == 1) { //支付成功
                                                    layer.msg('收款成功', { icon: 1 });
                                                    fn('close');
                                                    if ($scope.f5Id) {
                                                        getPotentialInfo(props.item.potentialCustomerId);
                                                        $scope.closePopup('account_confirm');
                                                        $scope.closePopup('student_recharge');
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
                                            }, socketIo, 'refreshRechargeOrderQRCode');
                                        } else {
                                            getPotentialInfo(props.item.potentialCustomerId);
                                            $scope.closePopup('account_confirm');
                                            $scope.closePopup('student_recharge');
                                        }
                                    } else {
                                        $scope.f5Id = null;
                                        if (fn) {
                                            fn('clear_val');
                                        }
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
                                            layer.msg('收款成功', { icon: 1 });
                                            fn('close');
                                            if ($scope.f5Id) {
                                                getPotentialInfo(props.item.potentialCustomerId);
                                                $scope.closePopup('account_confirm');
                                                $scope.closePopup('student_recharge');
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
                        if ($scope.isRepay) {
                            url = "/api/oa/order/studentRecharge";
                            if ($scope.PayProjectList['other']['paymentMode'] == '易收宝') {
                                url = "/api/onlinePayment/onlineRecharge";
                                window.$rootScope.yznOpenPopUp($scope, 'collection-pop', 'collection_pay', '560px', { emit: 'for_potentailpop', paymentMoney: $scope.PayProjectList['other']['paymentMoney'] });
                                if (!$scope.$$listeners['for_potentailpop']) {
                                    $scope.$on('for_potentailpop', function(e, data) {
                                        if (data.name == 'apply') {
                                            $scope.codeFn_(data.code, data.fn);
                                        }
                                        if (data.name == 'f5') {
                                            $scope.reloadOnlinePay(data.fn);
                                        }
                                    });
                                }
                                return;
                            };
                            console.log("充值");
                        } else {
                            url = "/api/oa/order/studentWithdrawMoney";
                            console.log("退款");
                        }
                        $scope.codeFn_();
                    }
                }

                function open_studPay(type) {
                    if (type == "in") {
                        $scope.isRepay = true;
                    } else {
                        $scope.isRepay = false;
                    }
                    stud_accountInit();
                    $scope.goPopup('student_recharge', '860px');
                }

                function stud_accountInit() {
                    $scope.PayProjectList = {
                        'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '0' },
                    };
                    if (!$scope.isRepay) {
                        $scope.PayProjectList = {
                            'other': { 'paymentMode': '支付宝', 'paymentMoney': '0' },
                        };
                    };
                    $scope.agent = localStorage.getItem('shopTeacherId');
                    $scope.studRepay_time = yznDateFormatYMdHms(new Date());
                    $scope.operateSum = 0;
                    $scope.payDesc = "";
                    $scope.payDesc_out = "";
                }

                function openAccountRecord() {
                    $scope.goPopup("accountRecord", "760px");
                    ACCOUNTRECORD();
                }

                function openInteralRecord() {
                    $scope.goPopup("interalRecord", "760px");
                    INTEGRALRECORD();
                }

                function changeIntegral() {
                    getRuleList();
                    $scope.ingData = {
                        name: props.item ? props.item.name : "",
                        pointsItem: undefined,
                        remark: "",
                        type: "1",
                        pointsValue: "",
                    };
                    $scope.confirm_change = confirm_change; //积分变动
                    $scope.add_integral = function() { //新增积分
                        $scope.ruleData = {
                            type: "",
                            desc: "",
                        };
                        openPopByDiv('新增积分项', '#change_organRule', '560px');
                        $scope.confirm_organRule = function() {
                            var url;
                            var param = {
                                pointsItem: $scope.ruleData.pointsItem,
                                remark: $scope.ruleData.remark
                            };
                            url = "/api/oa/points/addPointsRule";
                            $.hello({
                                url: CONFIG.URL + url,
                                type: "post",
                                data: JSON.stringify(param),
                                success: function(data) {
                                    if (data.status == '200') {
                                        layer.close(dialog);
                                        getRuleList();
                                    }

                                }
                            })
                        }
                    }
                    $scope.goPopup("change_integralPop", '660px');

                    function confirm_change() {
                        var param = {
                            "pointsItem": $scope.ingData.pointsItem, // 积分项
                            "remark": $scope.ingData.remark, // 备注
                            "pointsValue": $scope.ingData.type == 1 ? $scope.ingData.pointsValue : -$scope.ingData.pointsValue, // 分值，有正负
                            "potentialCustomerIds": props.item.potentialCustomerId // 潜客id，多个英文逗号隔开
                        }
                        $.hello({
                            url: CONFIG.URL + '/api/oa/points/modifyPointsRecord',
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    getPotentialInfo(props.item.potentialCustomerId);
                                    $scope.closePopup('change_integralPop');
                                }

                            }
                        })
                    }
                }

            }

            /*跟进记录*/
            function FOLLOWUPFUNCTION() {
                $scope.potential_addRecord = potential_addRecord; //新增沟通弹框
                $scope.potential_yuyueCome = potential_yuyueCome; //预约来访
                $scope.potential_listen = potential_listen; //预约试听
                $scope.potential_remark = potential_remark; //暂无意向，标为无效，放回公池
                $scope.potential_change = potential_change; //转让潜客
                $scope.potential_fenpei = potential_fenpei; //分配顾问
                $scope.potential_lingqu = potential_lingqu; //领取顾问
                getPotentialCustomerRecord(); //获取跟进记录

                function potential_addRecord(id, width, til) {
                    addInit();
                    $scope.goPopup(id, width, til);
                }

                function potential_yuyueCome(id, width, til) {
                    appointInit();
                    $scope.goPopup(id, width, til);
                }

                function potential_listen() {
                    window.$rootScope.yznOpenPopUp($scope, 'listen-pop', 'choseListen', '1060px', { choseType: "radio", callBackName: "潜客弹框-预约试听", item: props.item });
                }

                function potential_remark(id, width, operateType) {
                    $scope.potentDesc = "";
                    props.operateType = operateType;
                    $scope.goPopup(id, width);
                }

                function potential_change(id, width) {
                    getAdvers();
                    $scope.goPopup(id, width);
                }
                //                  if(!$scope.to_listen){
                //                      $scope.to_listen = $scope.$on('潜客弹框-预约试听', function (event, data) {
                //                          var param = {
                //                              arrangingCoursesId:data?data.arrangingCoursesId:undefined,
                //                              potentialCustomerId:props.item.potentialCustomerId,
                //                          };
                //                          $.hello({
                //                              url: CONFIG.URL + '/api/oa/potentialCustomer/addAudition',
                //                              type: 'post',
                //                              data: JSON.stringify(param),
                //                              success: function(data) {
                //                                  if(data.status == 200){
                //                                      getPotentialCustomerRecord();
                //                                      $scope.$emit("potentialChange", false);
                //                                  }
                //                              }
                //                          });
                //                      });
                //                  }
                function potential_fenpei(id, width) {
                    getAdvers();
                    getUnfenpei();
                    $scope.unselectedList = "";
                    $scope.goPopup(id, width);
                    $scope.adverDes_confirm = function() {
                        var params = {
                            toId: $scope.unselectedList,
                            potentialCustomerRecordType: 5,
                            potentialCustomerList: [{ potentialCustomerId: props.item.potentialCustomerId }]
                        };
                        $.hello({
                            url: CONFIG.URL + '/api/oa/sale/toPotentialCustomer',
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    getPotentialCustomerRecord();
                                    $scope.$emit("potentialChange", true);
                                    $scope.closePopup('adverDes_pop');
                                }

                            }
                        })
                    }
                }

                function potential_lingqu() {
                    var params = {
                        toId: localStorage.getItem('shopTeacherId'),
                        potentialCustomerRecordType: 26,
                        potentialCustomerList: [{ potentialCustomerId: props.item.potentialCustomerId }]
                    };
                    detailMsk("是否确认领取该潜客？", function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/sale/toPotentialCustomer',
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    getPotentialCustomerRecord();
                                    $scope.$emit("potentialChange", true);
                                }

                            }
                        })
                    })
                }

            }

            function getUnfenpei() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/sale/getPotentialCustomerOaUser',
                    type: 'get',
                    data: {
                        potentialCustomerId: props.item.potentialCustomerId
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.undescedList = [];
                            angular.forEach(data.context, function (x) {
                                if (x.type==1) {
                                    $scope.undescedList.push(x);
                                }
                            });
                        }
                    }
                });
            }
            $scope.$on("reloadRecord", function() {
                getPotentialCustomerRecord();
            });

            //              /*试听记录*/
            //              function AUDITIONFUNCTION() {
            ////                  getListenList(); //试听列表
            //                  $scope.cancel_Yuyue = cancel_Yuyue; //取消预约
            ////                  $scope.potential_yuyueListen = potential_yuyueListen; //试听记录，打开预约试听
            //                  $scope.gethopetimeData = gethopetimeData; //预约试听  获取意愿时间
            //                  $scope.addListen_submit = addListen_submit; //添加预约试听确定
            //                  $scope.hoverDec = hoverDec; //hover备注
            //                  $scope.hasCourse = hasCourse; //插班选择课次之前先选择课程
            //                  $scope.rehasCourse = rehasCourse; //插班选择课次2之前先选择课程
            //                  $scope.sel_teacher = sel_teacher; //选择预约老师
            //                  SERVICE.COURSEANDCLASS.COURSE['添加试听课程'] = deter_listenCourse0; //确定选择的课程
            //                  SERVICE.COURSEANDCLASS.COURSE['添加预约课程'] = deter_listenCourse; //确定选择的课程
            //                  SERVICE.COURSEANDCLASS.PAIKECOURSE['添加试听课次'] = deter_listenPaikeCourse; //确定选择的排课试听课程
            //                  $scope.changeClassType = changeClassType; //切换试听方式
            //                  $scope.listen_params = {
            //                      choseClassType: '0',
            //                      course_0: null,
            //                      course_1: null,
            //                      course_2: null,
            //                      teachers: [],
            //                      willTime: [],
            //                      desc: '',
            //                      showCourseInfo_0: false,
            //                      showCourseInfo_1: false,
            //                      showCourseInfo_2: false,
            //                      yuyue_retalkTime:"",
            //                      auditionTotalMax:""
            //                  }
            //                  laydate.render({
            //                      elem: "#yuyue_retalkTime",
            //                      isRange: false,
            //                      type: "datetime",
            //                      trigger: 'click',
            //                      done: function(value) {
            //                          $scope.listen_params.yuyue_retalkTime = value;
            //                      }
            //                  });
            //
            //                  function hoverDec(evt, data) {
            //                      if (data) {
            //                          if (data.length > 15) {
            //                              $(evt.target).closest("td").find(".openPop").show();
            //                          }
            //                      } else {
            //                          $(evt.target).closest("td").find(".openPop").hide();
            //                      }
            //                  }
            //                  //获取试听记录列表
            ////                  function getListenList() {
            ////                      $.hello({
            ////                          url: CONFIG.URL + "/api/oa/sale/getAuditionRecordList",
            ////                          type: "get",
            ////                          data: {
            ////                              id: props.item.potentialCustomerId
            ////                          },
            ////                          success: function(data) {
            ////                              if (data.status == '200') {
            ////                                  var list = data.context;
            ////                                  for (var i = 0, len = list.length; i < len; i++) {
            ////                                      list[i].teacherStr = arrToStr(list[i].teachers,"teacherName");
            ////                                  }
            ////                                  $scope.listenList = data.context;
            ////                              };
            ////                          }
            ////                      })
            ////                  }
            //
            //                  //确定预约试听
            //                  function addListen_submit() {
            //                      if ($scope.listen_params.choseClassType == 0) {
            //                          if (!$scope.listen_params.course_1) {
            //                              layer.msg('请选择试听课');
            //                              return;
            //                          }
            //                          data = {
            //                              potentialCustomerId: props.item.potentialCustomerId,
            //                              auditionRecordDesc: $scope.listen_params.desc,
            //                              returnTime: $scope.listen_params.yuyue_retalkTime,
            //                              classInfo: {
            //                                  courseId: $scope.listen_params.course_1.course.courseId,
            //                              },
            //                              makeUpStudentInfos: [{
            //                                  id: props.item.id
            //                              }],
            //                              arrangingCourses: {
            //                                  arrangingCoursesId: $scope.listen_params.course_1.arrangingCoursesId,
            //                              }
            //                          }
            //                          $.hello({
            //                              url: CONFIG.URL + "/api/oa/course/addTemporaryStudent",
            //                              type: "post",
            //                              data: JSON.stringify(data),
            //                              success: function(res) {
            //                                  if (res.status == '200') {
            //                                      if (!props.location) {
            //                                          getPotentialCustomerRecord();
            //                                      }
            //                                      $scope.$emit('potentialChange', false);
            //                                      $scope.closePopup('potential_yuyueListen');
            //                                  };
            //                              }
            //                          })
            //                      } else if ($scope.listen_params.choseClassType == 1) {
            //                          if (!$scope.listen_params.course_2) {
            //                              layer.msg('请选择预约课程');
            //                              return;
            //                          }
            //                          var teahcers = [];
            //                          angular.forEach($scope.listen_params.teachers, function(val) {
            //                              teahcers.push({
            //                                  teacherId: val.teacherId
            //                              });
            //                          })
            //                          data = {
            //                              potentialCustomerId: props.item.potentialCustomerId,
            //                              auditionRecordDesc: $scope.listen_params.desc,
            //                              returnTime: $scope.listen_params.yuyue_retalkTime,
            //                              studentId: props.item.id,
            //                              chaneClass: '0',
            //                              courseId: $scope.listen_params.course_2.courseId,
            //                              courseAuditionDates: $scope.listen_params.willTime ? $scope.listen_params.willTime : undefined,
            //                              teachers: teahcers.length > 0 ? teahcers : undefined
            //                          }
            //                          $.hello({
            //                              url: CONFIG.URL + "/api/oa/sale/addAuditionRecord",
            //                              type: "post",
            //                              data: JSON.stringify(data),
            //                              success: function(res) {
            //                                  if (res.status == '200') {
            //                                      if (!props.location) {
            //                                          getPotentialCustomerRecord();
            //                                      }
            //                                      $scope.$emit('potentialChange', false);
            //                                      $scope.closePopup('potential_yuyueListen');
            //                                  };
            //                              }
            //                          })
            //                      } else if ($scope.listen_params.choseClassType == 2) {
            //                          if(!$scope.paike_courseId){
            //                              return layer.msg("请选择课程");
            //                          }
            //                          if($scope.changeTimeMins <=0){
            //                              return layer.msg("结束时间不能小于开始时间");
            //                          }
            //                          if($scope.mainTeachers.length<=0){
            //                              return layer.msg("请选择主教老师");
            //                          }
            //                          var params={
            //                              courseId:$scope.paike_courseId,
            //                              classroomId:$scope.classroomId,
            //                              arrangingCoursesTime:$scope.arrangingCoursesTime,
            //                              remark:$scope.listen_params.desc,
            //                              returnTime: $scope.listen_params.yuyue_retalkTime,
            //                              courseType:"1",
            //                              inspectStatus:"1",
            //                              auditionTotalMax:$scope.listen_params.auditionTotalMax,
            //                              arrangingCoursesBeginDate:$scope.paike_classTime[0] + " " + $scope.operateTime.beginTime + ":00",
            //                              arrangingCoursesEndDate:$scope.paike_classTime[0] + " " + $scope.operateTime.endTime + ":00",
            //                              teachers:getSelTeachers(),
            //                              potentialCustomers:[{
            //                                  id:props.item.id,
            //                                  potentialCustomerId:props.item.potentialCustomerId,
            //                              }]
            //                          };
            //                          if ($scope.hasConfPop) {
            //                              params["inspectStatus"] = "0";
            //                          }
            //                          $.hello({
            //                              url: CONFIG.URL + "/api/oa/lesson/add",
            //                              type: "post",
            //                              data: JSON.stringify(params),
            //                              success: function(data) {
            //                                  if (data.status == '200') {
            //                                      $timeout(function () {
            //                                          if (!props.location) {
            //                                              getPotentialCustomerRecord();
            //                                          }
            //                                          $scope.$emit("potentialChange",false);
            //                                          if ($scope.hasConfPop) {
            //                                              $scope.closePopup("potial_conflict_prompt");
            //                                          }
            //                                          $scope.closePopup('potential_yuyueListen');
            //                                          $scope.hasConfPop = false;
            //                                      }, 100, true)
            //                                      return true;
            //                                  }else if (data.status == '20015') {
            //
            //                                      $scope.teachConfList = data.context.inspectTeacher;
            //                                      $scope.classRmConfList = data.context.inspectClassRoom;
            //                                      $scope.goPopup("potial_conflict_prompt", "760px");
            //                                       $scope.hasConfPop = true;
            //                                       $scope.ignoreConflict = function () {
            //                                          addListen_submit();
            //                                      }
            //                                      return true;
            //                                  }
            //                              }
            //                          })
            //                      } else {
            //
            //                      }
            //                  }
            //                  function getSelTeachers(){
            //                      var arr=[];
            //                      angular.forEach($scope.subTeacher, function(v) {
            //                          var obj={
            //                              "shopTeacherId":v.shopTeacherId,
            //                              "teacherType":0
            //                          };
            //                          arr.push(obj);
            //                      });
            //                      arr=arr.concat($scope.mainTeachers);
            //                      return arr;
            //                  }
            //                  function changeClassType() {
            //                      if ($scope.listen_params.choseClassType == 2) {
            //                          goPaikeListen();
            //                      }
            //                  }
            //                  //排课预约   开始
            //                  function goPaikeListen() {
            //                      $scope.hasConfPop = false;//没有冲突提示
            //                      getCourseList(); //获取课程
            //                      getClassroomList(); //获取教室
            //                      paike_getTeacherList();
            //                      $scope.operateTime = {
            //                          "beginTime": "07:00",
            //                          "endTime": "08:00"
            //                      };
            //                      screen_setDefaultField($scope, function() {
            //                          $scope.screen_goReset['chooseCourse']("请选择课程");
            //                      });
            //                      $scope.paike_classTime =[yznDateFormatYMd(new Date())];
            //                      $scope.changeClasstime = changeClasstime; //切换时间
            //                      $scope.getMinutes = getMinutes; //获取分钟数
            //                      $scope.usePreSetTime = usePreSetTime; //使用预设时间
            //                      $scope.changeGetPage = changeGetPage; //选择课程
            //                      $scope.clickMainTeacher = clickMainTeacher; //选择主教老师
            //                      $scope.selTeacher_ = selTeacher_; //选中的助教老师
            //                      $scope.delTeacher_ = delTeacher_; //删除选中的助教老师
            //                      $scope.mainTeacher = '';
            //                      $scope.mainTeacherModel = '';
            //                      $scope.subTeacher = [];
            //                      $scope.mainTeachers = [];
            //                      $scope.paike_courseId="";
            //                      $scope.classroomId="";
            //                      $scope.layerRenger = layerRenger;
            //                      SERVICE.TIMEPOP.CLASS['pre_time_sel'] = $scope.changeClasstime;
            //
            //                      function layerRenger(data){
            //                          var aa = $(data.wrapper + ' .searchTimeforcharge');
            //                          for (var i = 0; i < aa.length; i++) {
            //                              (function (i) {
            //                                  laydate.render({
            //                                      elem: aa[i], //指定元素
            //                                      format: "yyyy-MM-dd",
            //                                      isRange: false,
            //                                      done: function (value, date, endDate) {
            //                                          $scope.paike_classTime[0] = value;
            //
            //                                      }
            //                                  })
            //                              })(i)
            //                          }
            //                      }
            //                      if(!$scope.to_courseLiser){
            //                      	$scope.to_courseLiser = $scope.$on('to_course', function (event, data) {
            //	                            if (JSON.parse(data).wrapper) {
            //	                                layerRenger(JSON.parse(data));
            //	                            }
            //	                        });
            //                      }
            //
            //                      $scope.$watch("operateTime",function(){
            //                          if($scope.operateTime){
            //                              $scope.changeTimeMins = getMinutes($scope.operateTime);
            //                          }
            //                      });
            //                      function getCourseList() {
            //                          var p = {
            //                              'pageType': 0,
            //                              'courseStatus': 1
            //                          };
            //                          $.hello({
            //                              url: CONFIG.URL + "/api/oa/course/getCoursesList",
            //                              type: "get",
            //                              data: p,
            //                              success: function(data) {
            //                                  if (data.status == "200") {
            //                                       $scope.courseList = [];
            //                                      angular.forEach(data.context,function(v){
            //                                          if(v.courseType == 0){
            //                                              $scope.courseList.push(v);
            //                                          }
            //                                      });
            //                                  }
            //                              }
            //                          });
            //                      }
            //
            //                      function changeClasstime(data) {
            //                          $scope.operateTime = data;
            //                      }
            //
            //                      function getMinutes(time) {
            //                          var bt = time.beginTime;
            //                          var et = time.endTime;
            //                          bMins = parseInt(bt.substr(0, 2)) * 60 + parseInt(bt.substr(3, 4)),
            //                              eMins = parseInt(et.substr(0, 2)) * 60 + parseInt(et.substr(3, 4));
            //                          if (eMins <= bMins) {
            //                              return 0;
            //                          }
            //                          return eMins - bMins;
            //                      }
            //
            //                      function usePreSetTime() {
            //                          window.$rootScope.yznOpenPopUp($scope,'time-pop','preSetTime', '560px');
            //                      }
            //
            //                      function getClassroomList(courseId) {
            //                          var data = {
            //                              "pageType": 0
            //                          };
            //                          $.hello({
            //                              url: CONFIG.URL + "/api/oa/classroom/list",
            //                              type: "get",
            //                              data: data,
            //                              success: function(data) {
            //                                  if (data.status == '200') {
            //                                      $scope.classroomList = data.context.items;
            //                                  }
            //
            //                              }
            //                          })
            //                      }
            //                      function changeGetPage(id){
            //                          $scope.paike_courseId = id;
            //                      }
            //                      //选择主教
            //                      function clickMainTeacher(data) {
            //                          if (!data) {
            //                              $scope.mainTeachers = [];
            //                          } else {
            //                              $scope.mainTeacher = data;
            //                              $scope.mainTeachers = [{
            //                                  "shopTeacherId": $scope.mainTeacher.shopTeacherId,
            //                                  "teacherType": 1
            //                              }];
            //                              getMainSubTeacherList(data);
            //                          }
            //                      }
            //                      //删除助教
            //                      function delTeacher_(data, ind) {
            //                          data.hasSelected = false;
            //                          $scope.subTeacher.splice(ind, 1);
            //                      }
            //                      //选择助教
            //                      function selTeacher_(data) {
            //                          var judHas = true;
            //                          var judHasIndex = null;
            //                          angular.forEach($scope.subTeacher, function(val, index) {
            //                              if (val.teacherId == data.teacherId) {
            //                                  judHas = false;
            //                                  judHasIndex = index;
            //                              }
            //                          });
            //                          if (judHas) {
            //                              if ($scope.subTeacher.length > 8) {
            //                                  layer.msg("最多添加9位助教老师");
            //                                  return;
            //                              }
            //                              $scope.subTeacher.push(data);
            //                              data.hasSelected = true;
            //                          } else {
            //                              $scope.subTeacher.splice(judHasIndex, 1);
            //                              data.hasSelected = false;
            //                          }
            //                      }
            //                      //获取主教、主教老师列表数据（添加默认助教选中）
            //                      function getMainSubTeacherList(data) {
            //                          var arr = [];
            //                          $scope.subTeacherList = [];
            //                          angular.forEach($scope.subTeacher, function(val, ind) {  //去掉助教数组里的主教
            //                              if(data.shopTeacherId == val.shopTeacherId) {
            //                                  delete $scope.subTeacher[ind];
            //                              }
            //                          });
            //                          $scope.subTeacher = detEmptyField_($scope.subTeacher);    //去除空的字段
            //                          angular.forEach($scope.teacherList, function(val) {    //去掉助教列表里的主教
            //                              if(data.shopTeacherId != val.shopTeacherId) {
            //                                  arr.push(val);
            //                              };
            //                          });
            //                          $scope.subTeacherList = angular.copy(arr);
            //                          $scope.$broadcast('添加助教老师', 'reloadData', {'data': $scope.subTeacher, 'att': 'shopTeacherId'});  //默认勾选
            //                      }
            //
            //                      function paike_getTeacherList() {
            //                          $.hello({
            //                              url: CONFIG.URL + "/api/oa/shopTeacher/list",
            //                              type: "get",
            //                              data: {
            //                                  quartersTypeId: "1",
            //                                  pageType: "0",
            //                                  shopTeacherStatus: "1"
            //                              },
            //                              success: function(res) {
            //                                  if (res.status == 200) {
            //                                      console.log('老师列表', res.context);
            //                                      $scope.teacherList = res.context;
            //                                  }
            //                              }
            //                          });
            //                      }
            //                  }
            //
            //
            //              function hasCourse(){
            //                  if(!$scope.listen_params.course_0){
            //                      return layer.msg("请选择试听课程");
            //                  }
            //                  var param={};
            //                  param.course = $scope.listen_params.course_0;
            //                  window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'chosePaikeCourse','960px', {name: 'paikeCourse', type: 'radio', callBackName: '添加试听课次',deleteType:'2',item:param});
            //              }
            //              function rehasCourse(){
            //                  if(!$scope.listen_params.course_0){
            //                      return layer.msg("请选择试听课程");
            //                  }
            //                  $scope.listen_params.showCourseInfo_1=false;
            //                  $scope.listen_params.course_1='';
            //                  var param={};
            //                  param.course = $scope.listen_params.course_0;
            //                  window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'chosePaikeCourse','960px', {name: 'paikeCourse', type: 'radio', callBackName: '添加试听课次',deleteType:'2',item:param});
            //              }
            //              //确定选择试听课程
            //              function deter_listenCourse0(data) {
            //                  $scope.listen_params.showCourseInfo_0 = true;
            //                  $scope.listen_params.course_0 = data;
            //              }
            //              //确定选择试听课程
            //              function deter_listenCourse(data) {
            //                  $scope.listen_params.showCourseInfo_2 = true;
            //                  $scope.listen_params.course_2 = data;
            //                  getTeacherList(data.courseId);
            //              }
            //
            //              function deter_listenPaikeCourse(data) {
            //                  $scope.listen_params.showCourseInfo_1 = true;
            //                  $scope.listen_params.course_1 = data;
            //              }
            //              //选择预约时间
            //              function gethopetimeData(data) {
            //                  $scope.listen_params.willTime = data;
            //              }
            //              //选择预约老师
            //              function sel_teacher(data, ind) {
            //                  if (ind || ind == 0) {
            //                      $scope.listen_params.teachers.splice(ind, 1);
            //                      data.hasSelected = false;
            //                      return;
            //                  };
            //                  var judHas = true;
            //                  var judHasIndex = null;
            //                  angular.forEach($scope.listen_params.teachers, function(val, index) {
            //                      if (val.teacherId == data.teacherId) {
            //                          judHas = false;
            //                          judHasIndex = index;
            //                      }
            //                  });
            //                  if (judHas) {
            //                      $scope.listen_params.teachers.push(data);
            //                      data.hasSelected = true;
            //                  } else {
            //                      $scope.listen_params.teachers.splice(judHasIndex, 1);
            //                      data.hasSelected = false;
            //                  }
            //              }
            //
            //              //试听记录-确认取消预约试听
            //              function cancel_Yuyue(val) {
            //                  var isConfirm = layer.confirm('是否取消预约试听？', {
            //                      title: "确认取消信息",
            //                      skin: 'newlayerui layeruiCenter',
            //                      closeBtn: 1,
            //                      offset: '30px',
            //                      move: false,
            //                      area: '560px',
            //                      btn: ['是', '否'] //按钮
            //                  }, function() {
            //                      $.hello({
            //                          url: CONFIG.URL + "/api/oa/audition/cancelAudition",
            //                          type: "post",
            //                          data: JSON.stringify({
            //                              'auditionRecordId': val.auditionRecordId,
            //                              'potentialCustomerId': props.item.potentialCustomerId
            //                          }),
            //                          success: function(data) {
            //                              if (data.status == '200') {
            //                                  layer.msg('已成功取消预约', {
            //                                      icon: 1
            //                                  });
            //                                  getListenList();
            //                              };
            //                          }
            //                      })
            //                  }, function() {
            //                      layer.close(isConfirm);
            //                  })
            //
            //              }
            //          }

            function getTeacherList(courseId, contractTeachers) {
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
                            $timeout(function() {
                                $scope.$broadcast('zaiduTeacher', 'reloadData', { 'data': $scope.hopetime_parmas3, 'att': 'teacherId' })
                            }, 500, true);
                        };
                    }
                })
            }
            /*报读课程*/
            function ENROLLCOURSESFUNCTION() {
                $scope.isSingleOne = false; //写死数据一对一
                $scope.isactive = '1';
                $scope.tab_course_history = tab_course_history;
                $scope.addhopetimefn = addhopetimefn;
                $scope.CallsignUpPopup_ = CallsignUpPopup_; //从潜客 报读课程 中 呼出报名
                $scope.operat_transfer = operat_transfer; //插班入口
                $scope.clickSwitch = clickSwitch; //点击开关
                $scope.pop_date_time = pop_date_time;
                $scope.closePop_date_time = closePop_date_time;
                $scope.delhopetimefn = delhopetimefn; //删除意愿

                $scope.updateClassContractR = updateClassContractR; //班级操作
                $scope.updateClassContracttuiban = updateClassContracttuiban; //退班
                $scope.inclassOperate = inclassOperate; //在读课程tab的操作
                getStudentCourseList();
                SERVICE.POTENTIALPOP.reloadStudentCourseList = function() {
                    tab_course_history($scope.isactive);
                    //                  getStudentCourseList();
                    if (props.page == 0) {
                        $scope.$emit("potentialChange", false);
                    } else {
                        $scope.$emit("studentChange", false);
                        $scope.$emit("edu_signUp_detail_reload", false);
                    }
                };
                //              SERVICE.POTENTIALPOP.potenCourse = function(x) {
                //                  tab_course_history($scope.isactive);
                //                  // getStudentCourseList();
                //                  if (props.page == 0) {
                //                      $scope.$emit("potentialChange", false);
                //                  } else {
                //                      $scope.$emit("studentChange", false);
                //                  }
                //              }

                if (!$scope.changeStudentCourseLiser) {
                    $scope.changeStudentCourseLiser = $scope.$on('changeStudentCourse', function() {
                        getStudentCourseList();
                        if (props.page == 0) {
                            $scope.$emit("potentialChange", false);
                        } else {
                            $scope.$emit("studentChange", false);
                            $scope.$emit("edu_signUp_detail_reload", false);
                        }
                    });
                }

                function inclassOperate(n, course_) {
                    switch (n) {
                        case 1:
                            $scope.deleteCourse_ = angular.copy(course_);
                            $scope.goPopup("deleteContract_pop", "760px");
                            break;
                        case 2:
                            var title_ = "<div class='textAlignLf'>欠课时：因学员所报课程无可消耗课时/天数产生，并且欠课课时未产生消课金额。若学员重新报读欠课课程时，系统将自动补齐所欠消课课时以及产生的消课金额。</div>";
                            if (props.page == 1) {
                                var btnArr_ = ["查看欠课", "我知道了"];
                            } else {
                                var btnArr_ = ["我知道了"];
                            }
                            detailMsk(title_, function() {
                                if (props.page == 1) {
                                    changePopNav(5, "viewArrears", course_);
                                }
                            }, function() {

                            }, btnArr_);
                            break;
                        case 3:
                            $.hello({
                                url: CONFIG.URL + "/api/oa/contract/contractRenewUse",
                                type: "get",
                                data: { contractRenewId: course_.contractRenewId },
                                success: function(data) {
                                    if (data.status == '200') {
                                        $scope.contractRenew = data.context;
                                    };
                                }
                            })
                            $scope.goPopup("xiaokeRecord", "860px");
                            break;
                        default:
                            break;
                    }
                }
                //报名弹框
                function CallsignUpPopup_(id, width) {
                    window.$rootScope.yznOpenPopUp($scope, 'sign-up', id, width, props)
                }
                //学员操作
                function operat_transfer(id, width, type, da) {
                    if (type == '续签') {
                        //                      da.course.schoolTerm = x.schoolTerm;
                        var param = {
                            'page': CONSTANT.PAGE.STUDENT,
                            'item': da.course,
                            'title': '报名',
                            'location': "outside",
                            'special': 'xuqian'
                        };
                        param['item']['contractId'] = da.contractId; //续费单id用于按月的课程续签获取结束时间用
                        //                      if (x.apackage) {
                        //                          param['item'].apackage = x.apackage;
                        //                      }
                        param.item.potentialCustomerId = props.item.potentialCustomerId;
                        window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                        return;
                    }
                    var data = {
                        type: type,
                        courselist: da,
                        studentInfo: $scope.potentialInfo,
                        //                      schoolTerm: x?x.schoolTerm:null,
                    }
                    if (type == '转课' || type == '退课') {
                        //                      if(x.feeType == 2) { //按月
                        //                          var n_ = 0;
                        //                          angular.forEach(x.contractRenews, function(v1) {
                        //                              n_ += v1.buySurplusDateNum*1;
                        //                          })
                        //                          if(n_ > 0) {
                        //                              window.$rootScope.yznOpenPopUp($scope, 'opera-tion',id, width, data);
                        //                          } else {
                        //                              layer.msg('课时已耗尽，无法' + type);
                        //                          }
                        //                      } else {    //按课时
                        //                          if(x.surplusTime*1 > 0) {
                        //                              window.$rootScope.yznOpenPopUp($scope, 'opera-tion', id, width, data);
                        //                          } else {
                        //                              layer.msg('课时已耗尽，无法' + type);
                        //                          }
                        //                      }

                        var n_ = 0;
                        angular.forEach(da.userContractRenews, function(v) {
                            if (v.feeType != 2) {
                                n_ += v.totalSurplusTime * 1;
                            } else {
                                n_ += v.totalSurplusDayNum * 1;
                            }
                        });
                        if (n_ > 0) {
                            window.$rootScope.yznOpenPopUp($scope, 'opera-tion', id, width, data);
                        } else {
                            layer.msg('课时已耗尽，无法' + type);
                        }
                    } else {
                        window.$rootScope.yznOpenPopUp($scope, 'opera-tion', id, width, data);
                    }
                }

                //休课开关
                function clickSwitch($event, class_, contractId, studentId) {
                    var cla = $($event.currentTarget);
                    var msg = "";
                    if (cla.hasClass('open_switch')) {
                        var param = {
                            'contractId': contractId,
                            'studentId': studentId,
                            'classId': class_.classId,
                            'type': '0',
                            'lockStatus': '0'
                        };
                        msg = "是否确定复课？复课后该学员在当前班级中可正常点名上课";
                    } else {
                        var param = {
                            'contractId': contractId,
                            'studentId': studentId,
                            'classId': class_.classId,
                            'type': '0',
                            'lockStatus': '1'
                        };
                        msg = "是否确定休课？休课后该学员在当前班级中不可点名上课";
                    }
                    detailMsk(msg, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/updateClassContractR",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    if (cla.hasClass('open_switch')) {
                                        cla.removeClass('open_switch');
                                    } else {
                                        cla.addClass('open_switch');

                                    }
                                    getStudentCourseList();
                                };
                            }
                        })
                    });
                }

                //在读课程，历史报读 切换
                function tab_course_history(val) {
                    $scope.isactive = val;
                    console.log(val)
                    switch (val) {
                        case '1':
                            getStudentCourseList();
                            break;
                        case '2':
                            getStudentOldCourseList();
                            break;
                        case '3':
                            getStudentGoodsList();
                            break;
                    }
                }

                function getStudentGoodsList() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/listStudentGoodsOrder",
                        type: "get",
                        data: { 'potentialCustomerId': props.item.potentialCustomerId },
                        success: function(data) {
                            if (data.status == '200') {
                                console.log(data);
                                $scope.studentGoodsList = data.context;
                            };
                        }
                    })
                }

                //意愿老师，意愿时间编辑
                function addhopetimefn(id, width, timetada, courseId, contractId, contractTeachers, schoolTermId, schoolYear) {
                    $scope.goPopup(id, width);
                    $scope.gethopetimeList = gethopetimeList; //获取意愿时间
                    $scope.edithopetime = timetada;
                    $scope.hopetime_parmas3 = contractTeachers;
                    var hopetimeadvisers = [];
                    getTeacherList(courseId, contractTeachers);

                    //获取意愿时间list
                    function gethopetimeList(data) {
                        $scope.edithopetime = data;
                    }

                    //删除
                    $scope.del_teacherList = function(data, ind) {
                            console.log($scope.hopetime_parmas3);
                            data.hasSelected = false;
                            $scope.hopetime_parmas3.splice(ind, 1);
                        }
                        //意愿老师
                    $scope.sel_hopetimeTeacher = function(data) {
                        console.log(data)
                        var judHas = true;
                        var judHasIndex = null;
                        angular.forEach($scope.hopetime_parmas3, function(val, index) {
                            if (val.teacherId == data.teacherId) {
                                judHas = false;
                                judHasIndex = index;
                            }
                        });
                        if (judHas) {
                            data.hasSelected = true;
                            $scope.hopetime_parmas3.push(data);
                        } else {
                            data.hasSelected = false;
                            $scope.hopetime_parmas3.splice(judHasIndex, 1);
                        }
                    }

                    $scope.hopetimeeditComfirm = function() {
                        hopetimeadvisers = [];
                        angular.forEach($scope.hopetime_parmas3, function(val) { //获取顾问
                            var aa = {
                                teacherId: val.teacherId
                            }
                            hopetimeadvisers.push(aa);
                        });

                        if (hopetimeadvisers == '' || hopetimeadvisers == undefined) {
                            layer.msg('请选择意愿老师！');
                            return;
                        }
                        if ($scope.edithopetime == '' || $scope.edithopetime == undefined) {
                            layer.msg('请选择意愿时间！');
                            return;
                        }
                        var param = {
                            'contractId': contractId,
                            'contractDates': $scope.edithopetime,
                            'teachers': hopetimeadvisers,
                            'schoolYear': schoolYear ? schoolYear : undefined,
                            'schoolTermId': schoolTermId ? schoolTermId : undefined
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/sale/doContractDesire",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.msg('编辑成功', {
                                        icon: 1
                                    });
                                    getStudentCourseList();
                                    $scope.closePopup('potential_baoduedit');
                                };
                            }
                        })
                    }
                }
                //删除意愿
                function delhopetimefn(contractId, schoolTermId, schoolYear) {
                    var isConfirm = layer.confirm('是否删除意愿', {
                        title: "确认删除信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        var param = {
                            'contractId': contractId,
                            'contractDates': [],
                            'schoolYear': schoolYear,
                            'schoolTermId': schoolTermId,
                            'teachers': []
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/sale/doContractDesire",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.msg('删除成功', {
                                        icon: 1
                                    });
                                    getStudentCourseList();
                                };
                            }
                        })
                    }, function() {
                        layer.close(isConfirm);
                    })
                }
                //退班
                function updateClassContracttuiban(id, width, classId, contractId, studentId) {
                    $scope.goPopup(id, width);
                    $scope.LAYDATE = '';
                    $scope.potential_tuibantime = function() {
                        var param = {
                            'contractId': contractId,
                            'studentId': studentId,
                            'classId': classId,
                            'date': $scope.LAYDATE
                        };
                        if ($scope.LAYDATE) {
                            param["type"] = "3";
                        } else {
                            param["type"] = "4";
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/class/updateClassContractR",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    getStudentCourseList();
                                    layer.msg('已成功退班', {
                                        icon: 1
                                    });
                                    $scope.closePopup('potential_tuibantime');
                                };
                            }
                        })

                    }
                }

                //班级操作
                function updateClassContractR(type, classId, contractId, studentId) {
                    var param = {
                        'contractId': contractId,
                        'studentId': studentId,
                        'classId': classId,
                        'type': type,
                        'date': ''
                    };
                    for (var i in param) {
                        if (param[i] === '' || param[i] == undefined) {
                            delete param[i];
                        };
                    };
                    var isConfirm = layer.confirm('是否' + CONSTANT.CLASSCAOZUOTYPE[type] + '？', {
                        title: "确认取消信息",
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
                                    getStudentCourseList();
                                    layer.msg('已' + CONSTANT.CLASSCAOZUOTYPE[type], {
                                        icon: 1
                                    });
                                };
                            }
                        })
                    }, function() {
                        layer.close(isConfirm);
                    })
                }

                //修改时间 共用弹框 定位
                function pop_date_time($event, _data, _x) {
                    console.log(_x, _data);
                    getValidityList(_x);
                    openPopByDiv('修改有效期<span class="color_nameState" style="font-size: 14px">（' + _data.course.courseName + '）</span>', '#update_validity', '960px');
                    // $scope.LAYDATEYEAR = "";
                    // var e = $($event.currentTarget),
                    //     offtot = e.offset().top,
                    //     offleft = e.offset().left,
                    //     width = e.width();
                    // $('#pop_date_time').css({
                    //     'top': offtot + 30,
                    //     'left': offleft - 180,
                    //     'display': 'block',
                    // })
                    //
                    // $('.maskWarp').show();
                    // if(x.contract.startTime && x.contract.endTime){
                    //     $scope.LAYDATEYEAR = yznDateFormatYMd(x.contract.startTime)+" 到 "+yznDateFormatYMd(x.contract.endTime);
                    // }
                    // $scope.pop_date_timeComfirm = function() {
                    //     var param = {
                    //         contractId: contractId,
                    //     }
                    //     if($scope.LAYDATEYEAR){
                    //        param["startTime"]= $scope.LAYDATEYEAR.split(" 到 ")[0] + " 00:00:00";
                    //        param["endTime"]= $scope.LAYDATEYEAR.split(" 到 ")[1] + " 23:59:59";
                    //     }
                    //     $.hello({
                    //         url: CONFIG.URL + "/api/oa/sale/updateContract",
                    //         type: "post",
                    //         data: JSON.stringify(param),
                    //         success: function(data) {
                    //             if (data.status == '200') {
                    //                 getStudentCourseList();
                    //                 $('.maskWarp').hide();
                    //             };
                    //         }
                    //     })
                    // }
                    $scope.validityOperate = function(type, _da) {
                        console.log(_da);
                        switch (type) {
                            case 1: //点击变更有效期
                                $scope.clickValidityInfo = _da;
                                $scope.lineValidityInfo = {
                                    validityTime: !$scope.clickValidityInfo.validityEndTime ? "" : yznDateFormatYMd($scope.clickValidityInfo.validityEndTime),
                                    remake: '',
                                    type: '1',
                                    validityNum: 30,
                                };
                                (function() {
                                    laydate.render({
                                        elem: '#validity_time', //指定元素
                                        //                                      range: "至",
                                        isRange: false,
                                        format: 'yyyy-MM-dd',
                                        done: function(value, value2) {
                                            $scope.lineValidityInfo.validityTime = value;
                                        }
                                    });
                                })();
                                openPopByDiv('变更有效期', '#update_validity_1', '660px');
                                break;
                            case 2: //点击变更记录
                                $.hello({
                                    url: CONFIG.URL + "/api/oa/student/listContractRenewRecord",
                                    type: "get",
                                    data: { 'contractRenewId': _da.contractRenewId },
                                    success: function(data) {
                                        if (data.status == '200') {
                                            console.log(data);
                                            $scope.updateValidityList_2 = data.context;
                                        };
                                    }
                                });
                                openPopByDiv('变更记录<span class="color_nameState" style="font-size: 14px">（' + _data.course.courseName + '）</span>', '#update_validity_2', '860px');
                                break;
                            case 3: //点击修改有效期确认
                                var params = {
                                    'contractRenewRecords': [{ contractRenewId: $scope.clickValidityInfo.contractRenewId }],
                                    'desc': $scope.lineValidityInfo.remake,
                                };
                                if ($scope.lineValidityInfo.type == 1) {
                                    params["validityEndTime"] = yznDateFormatYMd($scope.lineValidityInfo.validityTime) + ' 23:59:59';
                                } else {
                                    params["validityNum"] = $scope.lineValidityInfo.validityNum;
                                }
                                $.hello({
                                    url: CONFIG.URL + "/api/oa/student/addContractRenewRecordList",
                                    type: "post",
                                    data: JSON.stringify(params),
                                    success: function(data) {
                                        if (data.status == '200') {
                                            layer.msg('操作成功');
                                            layer.close(dialog);
                                            getValidityList(_x);
                                            getStudentCourseList();
                                            $scope.$emit("edu_signUp_detail_reload", false);
                                        };
                                    }
                                });
                                break;
                        }
                    }
                }

                function closePop_date_time() {
                    $('#pop_date_time').hide();
                    $('.maskWarp').hide();
                }

                function getValidityList(x_) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/listContractRenew",
                        type: "get",
                        data: {
                            'contractRenewId': x_.contractRenewId,
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                console.log(data);
                                $scope.validityList = data.context;
                            };
                        }
                    })
                }

            }
            //获取报读课程列表
            function getStudentCourseList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/contract/userCourse",
                    type: "get",
                    data: {
                        potentialCustomerId: props.item.potentialCustomerId
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            angular.forEach(data.context, function(v) {
                                if (v.classContractRList) {
                                    angular.forEach(v.classContractRList, function(v_) {
                                        if (v_.lockDate) {
                                            v_.lockDateMinus = getIntervalDays(yznDateFormatYMd(v_.lockDate), yznDateFormatYMd(new Date()));
                                        }
                                    });
                                }
                            });
                            $scope.StudentCourseList = data.context;
                        };
                    }
                })
            }
            ///api/oa/course/getStudentOldCourseList
            function getStudentOldCourseList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/contract/historyCourse",
                    type: "get",
                    data: {
                        potentialCustomerId: props.item.potentialCustomerId
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            console.log(data)
                            $scope.historyStudentCourseList = data.context;
                        };
                    }
                })
            }

            /*上课记录*/
            function CLASSRECORDFUNCTION(qianfei, cs_) {
                var byCourseId = classId = studStatus = theme = undefined;
                $scope.searchByTime = "";
                $scope.qianke = false;
                $scope.classList = "";
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                if (qianfei == "viewArrears") {
                    $scope.qianke = true;
                    byCourseId = cs_.course.courseId;
                    $scope.screen_goReset['选择课程'](cs_.course.courseName);
                }

                $scope.kindSearchOnreset(); //调取app重置方法

                init();

                function init() {
                    (function() {
                        laydate.render({
                            elem: '#searchByTime',
                            range: "到",
                            isRange: true,
                            btns: ['confirm'],
                            done: function(value) {
                                $scope.searchByTime = value;
                                $scope.studRecordPage = 0;
                                getStudentCourseRecord($scope.studRecordPage);
                                getClassRecordTotal();
                            }
                        });
                    })();
                    $scope.exportRecord = exportRecord; //导出记录
                    //1 正常 0 缺席 2 请假
                    $scope.studSatusList = [{
                        name: '到课',
                        value: '1',
                    }, {
                        name: '缺席',
                        value: '0',
                    }, {
                        name: '请假',
                        value: '2',
                    }];
                    $scope.studRecordPage = 0;
                    getCoursesList();
                    getClassList();
                    getScreen_themeList();
                    getClassRecordTotal(); //上课记录总计
                    getStudentCourseRecord(0);
                    $scope.changeCourse = changeCourse; //报读课程筛选
                    $scope.changeClass = changeClass; //班级筛选
                    $scope.changeStatus = changeStatus; //点名状态筛选
                    $scope.changeTheme = changeTheme; //上课主题
                    $scope.changeQianke = changeQianke;
                    $scope.onReset = onReset;
                    loadData('studCourseRcdList', function() {
                        getStudentCourseRecord($scope.studRecordPage);
                    });
                }

                function getClassRecordTotal() {
                    var params = {
                        "studentId": props.item.id,
                        "courseId": byCourseId,
                        "classId": classId,
                        "studentStatus": studStatus,
                        "arrangingCoursesThemeId": theme,
                        "oweStatus": $scope.qianke ? "1" : undefined
                    };
                    if ($scope.searchByTime) {
                        params["beginTime"] = $scope.searchByTime.split(" 到 ")[0] + " 00:00:00";
                        params["endTime"] = $scope.searchByTime.split(" 到 ")[1] + " 23:59:59";
                    }
                    for (var i in params) {
                        if (params[i] == "" || params[i] == undefined) {
                            delete params[i];
                        }
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/lesson/listRollCallTotal",
                        type: "get",
                        data: params,
                        success: function(data) {
                            if (data.status == '200') {
                                console.log(data)
                                $scope.popRollCallTotal = {};
                                angular.forEach(data.context, function(v) {
                                    switch (v.studentStatus) {
                                        case '0':
                                            $scope.popRollCallTotal['received'] = v.count;
                                            break;
                                        case '1':
                                            $scope.popRollCallTotal['receivable'] = v.count;
                                            break;
                                        case '2':
                                            $scope.popRollCallTotal['arrearage'] = v.count;
                                            break;
                                    }
                                })
                            };
                        }
                    })
                }

                function exportRecord() { //导出上课记录
                    var params = {
                        "studentId": props.item.id,
                        "courseId": byCourseId,
                        "classId": classId,
                        "studentStatus": studStatus,
                        "arrangingCoursesThemeId": theme,
                        "oweStatus": $scope.qianke ? "1" : undefined
                            //                      "token": localStorage.getItem('oa_token')
                    };
                    if ($scope.searchByTime) {
                        params["beginTime"] = $scope.searchByTime.split(" 到 ")[0] + " 00:00:00";
                        params["endTime"] = $scope.searchByTime.split(" 到 ")[1] + " 23:59:59";
                    }
                    for (var i in params) {
                        if (params[i] == "" || params[i] == undefined) {
                            delete params[i];
                        }
                    }
                    var str = 'token=' + localStorage.getItem('oa_token');
                    for (var i in params) {
                        str += '&&' + i + '=' + params[i]
                    }
                    window.open(CONFIG.URL + "/api/oa/statistics/exportRollCallRecord?" + str);
                }

                function onReset() {
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    }
                    byCourseId = classId = studStatus = theme = undefined;
                    $scope.qianke = false;
                    $scope.searchByTime = "";
                    $scope.kindSearchOnreset(); //调取app重置方法
                    $scope.studRecordPage = 0;
                    getStudentCourseRecord($scope.studRecordPage);
                    getClassList();
                    getScreen_themeList();
                    getClassRecordTotal();
                }

                function getCoursesList() {
                    var params = {
                        "studentId": props.item.id,
                        "courseStatus": "-1"
                    };
                    $.hello({
                        url: CONFIG.URL + '/api/oa/course/getCoursesList',
                        type: 'get',
                        data: params,
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.record_courseList = res.context.items;
                            }
                        }
                    });
                }

                function getClassList() {
                    //                  if (byCourseId) {
                    //                      var param = {
                    //                          "courseId": byCourseId,
                    //                      };
                    //                  } else {
                    var param = {
                        "studentId": props.item.id,
                    };

                    //                  }
                    param["pageType"] = "0";
                    param["courseId"] = byCourseId ? byCourseId : undefined;
                    $.hello({
                        url: CONFIG.URL + '/api/oa/class/list',
                        type: 'get',
                        data: param,
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.classList = res.context;
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

                function changeCourse(x) {
                    if (x == null) {
                        byCourseId = null;
                    } else {
                        byCourseId = x.courseId;
                    }
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['选择班级']('');
                        $scope.screen_goReset['上课主题']('');
                    })
                    classId = theme = undefined;
                    getClassList();
                    getScreen_themeList(byCourseId);
                    $scope.studRecordPage = 0;
                    getStudentCourseRecord($scope.studRecordPage);
                    getClassRecordTotal();
                }

                function changeClass(x) {
                    if (x == null) {
                        classId = null;
                    } else {
                        classId = x.classId;
                    }
                    $scope.studRecordPage = 0;
                    getStudentCourseRecord($scope.studRecordPage);
                    getClassRecordTotal();
                }

                function changeStatus(x) {
                    if (x == null) {
                        studStatus = null;
                    } else {
                        studStatus = x.value;
                    }
                    $scope.studRecordPage = 0;
                    getStudentCourseRecord($scope.studRecordPage);
                    getClassRecordTotal();
                }

                function changeTheme(n) {
                    theme = n != null ? n.courseThemeId : undefined;
                    $scope.studRecordPage = 0;
                    getStudentCourseRecord($scope.studRecordPage);
                    getClassRecordTotal();
                }

                function changeQianke() {
                    $scope.studRecordPage = 0;
                    getStudentCourseRecord($scope.studRecordPage);
                    getClassRecordTotal();
                }

                function getStudentCourseRecord(start) {
                    var params = {
                        "start": start.toString() || "0",
                        "count": 10,
                        "studentId": props.item.id,
                        "courseId": byCourseId,
                        "classId": classId,
                        "studentStatus": studStatus,
                        "arrangingCoursesThemeId": theme,
                        "oweStatus": $scope.qianke ? "1" : undefined
                    };
                    if ($scope.searchByTime) {
                        params["beginTime"] = $scope.searchByTime.split(" 到 ")[0] + " 00:00:00";
                        params["endTime"] = $scope.searchByTime.split(" 到 ")[1] + " 23:59:59";
                    }
                    for (var i in params) {
                        if (params[i] == "" || params[i] == undefined) {
                            delete params[i];
                        }
                    }
                    console.log(start + ' start');
                    $.hello({
                        url: CONFIG.URL + '/api/oa/lesson/listRollCall',
                        type: 'get',
                        data: params,
                        success: function(res) {
                            if (res.status == 200) {
                                var list = res.context.items;
                                angular.forEach(list, function(v, k) {
                                    var week = returnWeek(list[k].arrangingCourses.arrangingCoursesWeek);
                                    list[k].date = yznDateFormatYMd(list[k].arrangingCourses.arrangingCoursesBeginDate) + "(" + week + ")" + yznDateFormatHm(v.arrangingCourses.arrangingCoursesBeginDate) + "-" + yznDateFormatHm(list[k].arrangingCourses.arrangingCoursesEndDate);
                                    list[k].teacherStr = arrToStr(list[k].teachers, "teacherName");
                                    //                                  list[k].studentStatus = CONSTANT.STUDENTSTATUS[list[k].studentStatus];
                                });
                                if (start == 0) {
                                    $scope.studRecordList = list;
                                } else {
                                    $scope.studRecordList = $scope.studRecordList.concat(list);
                                }

                                if (res.context.items) {
                                    $scope.studRecordPage = $scope.studRecordPage * 1 + list.length * 1;
                                }
                            }
                        }
                    });
                }
            }

            /*订单信息*/
            function ORDERINFOFUNCTION() {

                $scope.orderTableHead = [
                    { 'name': '订单号', 'width': '15%', 'issort': true, 'sort': 'desc', 'id': 'externalOrderId' },
                    { 'name': '类型', 'width': '60px' },
                    { 'name': '订单时间', 'width': '120px', 'issort': true, 'id': 'orderTime' },
                    { 'name': '交易内容', 'width': '62%' },
                    { 'name': '应收', 'width': '100px', 'align': 'right' },
                    { 'name': '实收', 'width': '100px', 'align': 'right' },
                    { 'name': '欠费', 'width': '100px', 'align': 'right' },
                    { 'name': '状态', 'width': '80px', 'align': 'center' }

                ];
                var search_orderName = "externalOrderId",
                    search_orderTyp = "desc";
                //切换排序
                $scope.orderSortCllict = function(data) {
                    console.log(data.sort + '--');
                    search_orderTyp = data.sort;
                    search_orderName = data.id;
                    getOrderList();
                };


                $scope.isActive = '1';
                $scope.tab_order_type = tab_order_type;
                getStudentOrderTotal(); //订单统计总数
                getOrderList();
                SERVICE.ORDER.getOrderlist = function() {
                    getStudentOrderTotal();
                    getOrderList();
                }

                function tab_order_type(n) {
                    $scope.popOrderList = [];
                    $scope.isActive = n;
                    if (n == 1) {
                        getStudentOrderTotal();
                    }
                    getOrderList();
                }

                function getStudentOrderTotal() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/getStudentOrderTotal",
                        type: "get",
                        data: {
                            potentialCustomerId: props.item.potentialCustomerId
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.popOrderTotal = data.context;
                            };
                        }
                    })
                }
                if (!$scope.reloadOrderListLiser) {
                    $scope.reloadOrderListLiser = $scope.$on("reloadOrderList", function() {
                        getOrderList();
                    });
                }

                function getOrderList() {
                    var param = {
                        pageType: "0",
                        potentialCustomerId: props.item.potentialCustomerId,
                    };
                    if ($scope.isActive == 2) {
                        param["orderType"] = 4;
                    }
                    if ($scope.isActive == 1) {
                        if (search_orderTyp && search_orderName) {
                            param["orderTyp"] = search_orderTyp;
                            param["orderName"] = search_orderName;
                        }
                    }

                    $scope.currentTab = angular.copy($scope.isActive);
                    $.hello({
                        url: CONFIG.URL + '/api/oa/order/getStudentOrder',
                        type: 'get',
                        data: param,
                        success: function(data) {
                            if (data.status == "200") {
                                if ($scope.currentTab != $scope.isActive) {
                                    return;
                                }
                                var list = data.context;
                                for (var i = 0, len = list.length; i < len; i++) {
                                    list[i].type = CONSTANT.ORDER_TYPE[list[i].orderType];
                                }

                                $scope.popOrderList = list;
                            }
                        }
                    });
                };
            };

            //参与活动tab模块
            function JOINACTIVITY() {
                console.log('参与活动！');
                $scope.goto_act_signUp = goto_act_signUp; //点击进入活动报名
                getJoinActivityList(); //获取参与活动列表
                function getJoinActivityList() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/activity/getValidActivityList",
                        type: "get",
                        data: {
                            potentialCustomerId: props.item.potentialCustomerId
                        },
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.joinActivityList = res.context;
                                console.log(res);
                            }
                        }
                    });
                }

                //点击进入活动报名
                function goto_act_signUp(d) {
                    var param = {
                        'page': CONSTANT.PAGE.STUDENT,
                        'item': d,
                        'title': '报名',
                        'location': "outside",
                        'special': 'activity_signup'
                    };
                    if (d.paySwitch == 1) {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/activity/checkActivityInventory",
                            type: "get",
                            data: {
                                activityIds: d.activityId + '',
                            },
                            success: function(res) {
                                if (res.status == 200) {
                                    console.log(res);
                                    if (res.context.length > 0) {
                                        detailMsk(res.context.join('，') + '，该活动名额已满，确定继续报名？', function() {
                                            param.item.potentialCustomerId = props.item.potentialCustomerId;
                                            window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                                        })
                                    } else {
                                        param.item.potentialCustomerId = props.item.potentialCustomerId;
                                        window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                                    }
                                }
                            }
                        });
                    } else {
                        param.item.potentialCustomerId = props.item.potentialCustomerId;
                        window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                    }
                }
            };
            //学员相册
            function STUDENTPHOTOS() {
                init8();

                function init8() {
                    $scope.isActive = 1;
                    $scope.page1 = $scope.page2 = 0;
                    $scope.tab_student_comment = tab_student_comment;

                    $scope.toggle = toggle;

                    tab_student_comment(1);
                    loadData('stud_pic_id', function() {
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


                function toggle(idx) {
                    $scope.activityList[idx].visible = !$scope.activityList[idx].visible;
                }

                function getShow(start) {
                    var param = {
                        start: start.toString() || "0",
                        count: 10,
                        potentialCustomerId: props.item.potentialCustomerId,
                        //                      classId: global_classId
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/listStudentReview",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = angular.copy(data.context.items);
                                angular.forEach(list, function(v) {
                                    v.reviewUrlList = setUrlist(v.reviewUrlList);
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
                        potentialCustomerId: props.item.potentialCustomerId,
                        //                      classId: global_classId
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/student/listStudentTask",
                        type: "get",
                        data: param,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = angular.copy(data.context.items);
                                angular.forEach(list, function(v) {
                                    if (v.taskReviews) {
                                        angular.forEach(v.taskReviews, function(v_) {
                                            var o_v_ = angular.copy(v_);
                                            v_.taskTeacherUrlList = setUrlist(v_.taskTeacherUrlList);
                                            v_.oldtaskTeacherUrlList = o_v_.taskTeacherUrlList;
                                        });
                                        v.taskReviews.picNum = getNums(v.taskReviews, 'picture');
                                        v.taskReviews.audioNum = getNums(v.taskReviews, 'voice');
                                        v.taskReviews.videoNum = getNums(v.taskReviews, 'video');
                                    }
                                });
                                angular.forEach(list, function(v) {
                                    v.taskUrlList = setUrlist(v.taskUrlList);
                                    v.visible = false;
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

                function getNums(d, t) {
                    var obj = {
                        pic: 0,
                        aud: 0,
                        vid: 0
                    };
                    angular.forEach(d, function(o) {
                        if (o.taskTeacherUrlList.length > 0) {
                            angular.forEach(o.taskTeacherUrlList, function(j) {
                                var ptype = j.value ? j.value.match(RegExp(/picture/)) : "";
                                var atype = j.value ? j.value.match(RegExp(/voice/)) : "";
                                var vtype = j.value ? j.value.match(RegExp(/video/)) : "";
                                if (ptype) {
                                    obj.pic += 1;
                                }
                                if (atype) {
                                    obj.aud += 1;
                                }
                                if (vtype) {
                                    obj.vid += 1;
                                }
                            });
                        }
                    });
                    if (t == 'picture') {
                        return obj.pic;
                    }
                    if (t == 'voice') {
                        return obj.aud;
                    }
                    if (t == 'video') {
                        return obj.vid;
                    }
                }

            }

            function openPhotos(value, list, com) {
                var imglist;
                if (com) {
                    imglist = list;
                } else {
                    imglist = getPics(list);
                }
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

            function getPics(list) {
                var arr = [];
                if ($scope.isActive == 1) {
                    angular.forEach(list, function(v, ind) {
                        angular.forEach(v.reviewUrlList, function(v_) {
                            arr.push(v_);
                        });
                    });
                } else {
                    angular.forEach(list, function(v, ind) {
                        angular.forEach(v.taskUrlList, function(v_) {
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

            function getPics(list) {
                var arr = [];
                if ($scope.isActive == 1) {
                    angular.forEach(list, function(v, ind) {
                        angular.forEach(v.reviewUrlList, function(v_) {
                            arr.push(v_);
                        });
                    });
                } else {
                    angular.forEach(list, function(v, ind) {
                        angular.forEach(v.taskUrlList, function(v_) {
                            arr.push(v_);
                        });
                    });
                }
                return arr;
            }
            //调查问卷
            function SURVEY() {
                var searchName, orderType = 'desc';
                $scope.kindSearchData_ = {
                    name: '优惠券名称'
                };
                $scope.surveyThead = [
                    { 'name': '问卷名称' },
                    { 'name': '提交时间', 'issort': true, 'sort': 'desc' },
                    { 'name': '查看状态' },
                    { 'name': '备注' },
                    { 'name': '操作', 'align': 'center' }
                ];
                //删除答卷
                $scope.delSurvey = function(x) {
                        var idDel = layer.confirm('答卷删除后无法还原，确认删除？', {
                            title: "确认信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['是', '否'] //按钮
                        }, function() {
                            var params = {
                                respondentsId: x.respondentsId
                            }
                            $.hello({
                                url: CONFIG.URL + "/api/oa/questionnaire/deleteRespondents",
                                type: "post",
                                data: JSON.stringify(params),
                                success: function(res) {
                                    if (res.status == '200') {
                                        $scope.getlistRespondents();
                                    }
                                }
                            });
                            layer.close(idDel);
                        }, function() {
                            layer.close(idDel);
                        });
                    }
                    //切换查看状态
                $scope.modifyViewStatus = function(x) {
                    var params = {
                        respondentsId: x.respondentsId,
                        viewStatus: x.viewStatus == 1 ? 0 : 1
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/questionnaire/modifyViewStatus",
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.getlistRespondents();
                            }
                        }
                    });
                }
                $scope.sortCllict = function(data) {
                    orderType = data.sort;
                    $scope.getlistRespondents();
                };
                $scope.surveyReset = function() {
                    searchName = undefined;
                    $scope.viewStatus = undefined;
                    $scope.kindSearchOnreset(); //调取app重置方法
                    $scope.getlistRespondents();
                }
                $scope.SearchData = SearchData;
                $scope.Enterkeyup = SearchData;
                $scope.sel_screen = function(type, evt) {
                    switch (type) {
                        case 1:
                            $scope.viewStatus = evt.target.checked ? 0 : undefined;
                            break;
                        case 2:
                            $scope.viewStatus = evt.target.checked ? 1 : undefined;
                            break;
                    }
                    $scope.getlistRespondents();
                }

                function SearchData(n) {
                    searchName = n.value;
                    $scope.getlistRespondents();
                }
                $scope.getlistRespondents = function() {
                    var params = {
                        potentialCustomerId: $scope.potentialInfo.potentialCustomerId,
                        viewStatus: $scope.viewStatus,
                        searchName: searchName,
                        orderTyp: orderType,
                        orderName: 'rps.create_time',
                        pageType: 'mm'
                    };
                    $.hello({
                        url: CONFIG.URL + '/api/oa/questionnaire/listRespondents',
                        type: "get",
                        data: params,
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.listRespondents = res.context;
                            }
                        }
                    })
                }
                $scope.getlistRespondents();
            }

            //优惠券
            function YOUHUIQUAN() {
                var pagerRender = false,
                    s_eachPage = localStorage.getItem('couponPage') ? localStorage.getItem('couponPage') : 10;
                var s_start = 0,
                    s_searchName = undefined;
                $scope.useType0 = true;
                $scope.useType1 = false;
                $scope.usedType = false;
                init9();

                function init9() {
                    $scope.s_kindSearchData = {
                        couponsName: '优惠券名称'
                    };
                    $scope.useType = useType;
                    $scope.usedTypeFun = usedTypeFun;
                    $scope.s_SearchData = searchData;
                    $scope.s_Enterkeyup = searchData;
                    $scope.coupon_onReset = coupon_onReset;
                    $scope.countermandCoupon = countermandCoupon;
                    getCouponList(0);
                }

                function useType(type) {
                    if (type) {
                        if ($scope.useType1) {
                            $scope.useType1 = true;
                            $scope.useType0 = false;
                        }
                    } else {
                        if ($scope.useType0) {
                            $scope.useType0 = true;
                            $scope.useType1 = false;
                        }
                    }
                    pagerRender = false;
                    getCouponList(0);
                }

                function usedTypeFun() {
                    pagerRender = false;
                    getCouponList(0);
                }

                function searchData(n) {
                    s_searchName = n.value;
                    pagerRender = false;
                    getCouponList(0);
                }
                //重置筛选栏
                function coupon_onReset() {
                    s_searchName = undefined;
                    $scope.useType0 = true;
                    $scope.useType1 = false;
                    $scope.usedType = false;
                    $scope.kindSearchOnreset_["couponId"](); //调取app重置方法
                    pagerRender = false; //分页重新加载
                    getCouponList(0);
                }

                function getCouponList(s_start) {
                    var data = {
                        "start": s_start.toString() || "0",
                        "count": s_eachPage,
                        "couponName": s_searchName,
                        "potentialCustomerId": props.item.potentialCustomerId,
                        "usageState": $scope.useType0 ? "0" : $scope.useType1 ? "1" : undefined,
                        "expireFlag": $scope.usedType ? "1" : undefined,
                    }
                    for (var i in data) {
                        if (data[i] == '' || data[i] == undefined) {
                            delete data[i];
                        }
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/coupon/listCouponPackage",
                        type: "get",
                        data: data,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = data.context.items;
                                angular.forEach(list, function(v) {
                                    v.showIns = false;
                                    v.productNameStr = v.productNames ? arrToStr(v.productNames, null) : "";
                                });
                                $scope.couponList = angular.copy(list);
                                couponPager(data.context.totalNum);
                                $scope.s_totalNum = data.context.totalNum;
                            }

                        }
                    })
                }

                function couponPager(total) { //分页
                    if (pagerRender) {
                        return;
                    } else {
                        pagerRender = true;
                    }

                    var $M_box3 = $('#couponPage');

                    $M_box3.pagination({
                        totalData: total || 0, // 数据总条数
                        showData: s_eachPage, // 显示几条数据
                        jump: true,
                        coping: true,
                        count: 2, // 当前页前后分页个数
                        homePage: '首页',
                        endPage: '末页',
                        prevContent: '上页',
                        nextContent: '下页',
                        callback: function(api) {
                            if (api.getCurrentEach() != s_eachPage) { //本地存储记下每页多少条
                                s_eachPage = api.getCurrentEach();
                                localStorage.setItem('couponPage', s_eachPage);
                            }
                            s_start = (api.getCurrent() - 1) * s_eachPage; // 分页从0开始
                            getCouponList(s_start); //回调
                        }
                    });

                }

                function countermandCoupon(id) {
                    detailMsk("是否确认撤回该优惠券？", function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/coupon/countermandCoupon',
                            type: "post",
                            data: JSON.stringify({ couponPackageId: id }),
                            success: function(data) {
                                if (data.status == '200') {
                                    pagerRender = false;
                                    getCouponList(0); //回调
                                }

                            }
                        })
                    })
                }
            }
            //学员账户记录
            function ACCOUNTRECORD() {
                var a_pagerRender = false,
                    a_eachPage = localStorage.getItem('potiental_accountPage') ? localStorage.getItem('potiental_accountPage') : 10;
                var a_start = 0;
                $scope.a_searchByTime = "";
                init11();

                function init11() {
                    laydate.render({
                        elem: '#a_searchByTime',
                        range: "到",
                        isRange: true,
                        btns: ['confirm'],
                        done: function(value) {
                            $scope.a_searchByTime = value;
                            a_pagerRender = false;
                            getAccountList(0);
                        }
                    });
                    getPotentialInfo(props.item.potentialCustomerId);
                    getAccountList(0);
                }

                function getAccountList(a_start) {
                    var data = {
                        "start": a_start.toString() || '0',
                        "count": a_eachPage,
                        'potentialCustomerId': props.item.potentialCustomerId
                    }
                    if ($scope.a_searchByTime) {
                        data["beginTime"] = $scope.a_searchByTime.split(" 到 ")[0] + " 00:00:00";
                        data["endTime"] = $scope.a_searchByTime.split(" 到 ")[1] + " 23:59:59";
                    }
                    console.log(data);
                    $.hello({
                        url: CONFIG.URL + '/api/oa/order/listAccountRecords',
                        type: "get",
                        data: data,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = data.context.items;
                                $scope.accountRecordList = angular.copy(list);
                                accountPager(data.context.totalNum);
                                $scope.a_totalNum = data.context.totalNum;
                            }

                        }
                    })
                }

                function accountPager(total) { //分页
                    if (a_pagerRender) {
                        return;
                    } else {
                        a_pagerRender = true;
                    }

                    var $M_box3 = $('#accountPage');

                    $M_box3.pagination({
                        totalData: total || 0, // 数据总条数
                        showData: a_eachPage, // 显示几条数据
                        jump: true,
                        coping: true,
                        count: 2, // 当前页前后分页个数
                        homePage: '首页',
                        endPage: '末页',
                        prevContent: '上页',
                        nextContent: '下页',
                        callback: function(api) {
                            if (api.getCurrentEach() != a_eachPage) { //本地存储记下每页多少条
                                a_eachPage = api.getCurrentEach();
                                localStorage.setItem('potiental_accountPage', a_eachPage);
                            }
                            a_start = (api.getCurrent() - 1) * a_eachPage; // 分页从0开始
                            getAccountList(a_start); //回调
                        }
                    });

                }
            }
            //积分记录
            function INTEGRALRECORD() {
                var s_pagerRender = false,
                    i_eachPage = localStorage.getItem('integralPage') ? localStorage.getItem('integralPage') : 10;
                var s_start = 0,
                    search_integralType = undefined;
                $scope.i_searchByTime = "";
                init10();

                function init10() {
                    getPointsItemList();
                    $scope.integral_onReset = integral_onReset;
                    $scope.deleteBtn = deleteBtn; //删除

                    $scope.changeItem = changeItem; //积分项
                    laydate.render({
                        elem: '#i_searchByTime',
                        range: "到",
                        isRange: true,
                        btns: ['confirm'],
                        done: function(value) {
                            $scope.i_searchByTime = value;
                            s_pagerRender = false;
                            getIntegralList(0);
                        }
                    });
                    getPotentialInfo(props.item.potentialCustomerId);
                    getIntegralList(0);
                }

                function getPointsItemList() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/points/pointsItemList',
                        type: "get",
                        data: { potentialCustomerId: props.item.potentialCustomerId },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.pointsItemList = data.context;
                            }

                        }
                    })
                }

                function changeItem(n) {
                    search_integralType = n ? n.pointsItem : undefined;
                    s_pagerRender = false;
                    getIntegralList(0);
                }
                //重置筛选栏
                function integral_onReset() {
                    $scope.i_searchByTime = "";
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['积分项']('');
                    })
                    search_integralType = undefined;
                    s_pagerRender = false; //分页重新加载
                    getIntegralList(0);
                }

                function getIntegralList(s_start) {
                    var data = {
                        "start": s_start.toString() || '0',
                        "count": i_eachPage,
                        "pointsItem": search_integralType,
                        'potentialCustomerId': props.item.potentialCustomerId
                    }
                    if ($scope.i_searchByTime) {
                        data["beginTime"] = $scope.i_searchByTime.split(" 到 ")[0] + " 00:00:00";
                        data["endTime"] = $scope.i_searchByTime.split(" 到 ")[1] + " 23:59:59";
                    }
                    console.log(data);
                    $.hello({
                        url: CONFIG.URL + '/api/oa/points/listPointsRecord',
                        type: "get",
                        data: data,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = data.context.items;
                                $scope.integralList = angular.copy(list);
                                integralPager(data.context.totalNum);
                                $scope.i_totalNum = data.context.totalNum;
                            }

                        }
                    })
                }

                function integralPager(total) { //分页
                    if (s_pagerRender) {
                        return;
                    } else {
                        s_pagerRender = true;
                    }

                    var $M_box3 = $('#integralPage');

                    $M_box3.pagination({
                        totalData: total || 0, // 数据总条数
                        showData: i_eachPage, // 显示几条数据
                        jump: true,
                        coping: true,
                        count: 2, // 当前页前后分页个数
                        homePage: '首页',
                        endPage: '末页',
                        prevContent: '上页',
                        nextContent: '下页',
                        callback: function(api) {
                            if (api.getCurrentEach() != i_eachPage) { //本地存储记下每页多少条
                                i_eachPage = api.getCurrentEach();
                                localStorage.setItem('integralPage', i_eachPage);
                            }
                            s_start = (api.getCurrent() - 1) * i_eachPage; // 分页从0开始
                            getIntegralList(s_start); //回调
                        }
                    });

                }

                function deleteBtn(x) {
                    detailMsk("是否删除该条积分记录，删除后不可恢复？", function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/points/deletePointsRecord',
                            type: "post",
                            data: JSON.stringify({ pointsRecordId: x.pointsRecordId }),
                            success: function(data) {
                                if (data.status == '200') {
                                    s_pagerRender = false;
                                    getIntegralList(0);
                                    getPotentialInfo(props.item.potentialCustomerId);
                                }

                            }
                        })
                    })
                }


            }
            //获取潜客详情
            function getPotentialInfo(id) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/sale/getPotentialCustomer",
                    type: "get",
                    data: {
                        id: id
                    },
                    success: function(res) {
                        if (res.status == 200) {
                            props.item = res.context;
                            if (res.context.grade) {
                                res.context.grade = CONSTANT.STUDENTGRADE[res.context.grade];
                            }
                            $scope.potentialInfo = res.context;
                            if (res.context.potentialCustomerDesc) {
                                $scope.potentialInfo.potentialCustomerDesc = res.context.potentialCustomerDesc.replace(/\n/ig, "</br>");
                            }

                            //                          if (props.page == 0 && ($scope.potentialInfo.potentialCustomerStatus == 1 || $scope.potentialInfo.potentialCustomerStatus == 3)) {
                            //                              $scope.frozen_missPot = true;
                            //                          } else {
                            //                              $scope.frozen_missPot = false;
                            //                          }
                        }
                    }
                });
            }

            function getPotentialCustomerRecord() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/sale/getPotentialCustomerRecord",
                    type: "get",
                    data: {
                        id: props.item.potentialCustomerId
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            var list = data.context;
                            for (var i = 0; i < list.length; i++) {
                                list[i].potentialCustomerRecordTypeT = CONSTANT.POTENTIALCUSTOMERRECORDTYPEFORSHOW[list[i].potentialCustomerRecordType]
                                list[i].urlListOld = angular.copy(list[i].urlList);
                                list[i].urlList = setUrlist(list[i].urlList);
                            }
                            $scope.potentialCustomerRecord = list;
                        };
                    }
                })
            }


            //报读课程  鼠标滑过  详情展示   common
            function ngMouseenter($event, d) {
                var e = $($event.currentTarget),
                    offtot = e.offset().top,
                    offleft = e.offset().left,
                    width = e.width(),
                    initleft = $('#potential_pop').offset().left;
                if (d == '1') {
                    e.children('.enrollmouse').css({
                        'top': offtot - 10,
                        'left': offleft - initleft - 50,
                        'display': 'block'
                    });
                } else if (d == '2') {
                    e.children('.enrollmouse').css({
                        'top': offtot - 12,
                        'left': offleft - initleft - 50,
                        'display': 'block'
                    });
                } else if (d == '3') {
                    e.children('.enrollmouse').css({
                        'top': offtot - 10,
                        'left': offleft - initleft - 75,
                        'display': 'block'
                    });
                } else {
                    e.next('.enrollmouse').css({
                        'top': offtot - 20,
                        'left': offleft - initleft - 70,
                        'display': 'block'
                    });
                }
            }

            function ngMouseleave($event) {
                var e = $($event.currentTarget);
                e.next('.enrollmouse').hide();
                e.children('.enrollmouse').hide();
            }

            //主弹框初始化
            function mainInit() {
                if (props.page == 0) {
                    $scope.popHead = "潜客详情";
                } else {
                    $scope.popHead = "学员详情";
                }
            }
            //新增沟通
            function addInit() {
                $scope.talk = {
                    talkTime: yznDateFormatYMdHms(new Date()),
                    talkDesc: "",
                    retalkTime: "",
                    $xWhetherType: 0,
                    imgUrls: []
                };
                (function() {
                    laydate.render({
                        elem: "#talkTime",
                        max: yznDateFormatYMdHms(new Date()),
                        isRange: false,
                        type: "datetime",
                        trigger: 'click',
                        done: function(value) {
                            $scope.talk.talkTime = value;
                        }
                    });
                    laydate.render({
                        elem: "#retalkTime",
                        isRange: false,
                        type: "datetime",
                        trigger: 'click',
                        done: function(value) {
                            $scope.talk.retalkTime = value;
                        }
                    });
                })();
            }
            //添加跟进记录确认
            function confirm_addTalk(type) {
                if (!$scope.talk.talkDesc && $scope.talk.imgUrls.length <= 0) {
                    return layer.msg("跟进内容或图片至少填写一个!");
                }
                var j = [true, ""];
                var list = $scope.talk.imgUrls;
                for (var i = 0, len = list.length; i < len; i++) {
                    if (!list[i].key) {
                        j[0] = false;
                        break;
                    }
                }
                if (!j[0]) {
                    return layer.msg("请处理未成功的多媒体！");
                }
                var param = {
                    potentialCustomerId: props.item.potentialCustomerId,
                    potentialCustomerRecordType: $scope.talk.$xWhetherType,
                    potentialCustomerRecordDesc: $scope.talk.talkDesc,
                    workTime: $scope.talk.talkTime,
                    url: getUrlStr($scope.talk.imgUrls),
                    returnTime: $scope.talk.retalkTime,
                };
                for (var i in param) {
                    if (param[i] === '' || param[i] == undefined) {
                        delete param[i];
                    };
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/potentialCustomer/addRecord",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            if (!props.location) {
                                getPotentialCustomerRecord();
                            }
                            $scope.$emit('potentialChange', false);
                            layer.msg('新增成功', {
                                icon: 1
                            });
                            $scope.closePopup('popup_addTalk_pop');
                        };
                    }
                })
            }

            function getUrlStr(list) {
                var str = "";
                angular.forEach(list, function(v) {
                    str += v.key + ",";
                });

                return str = str.substr(0, str.length - 1);
            }
            //预约来访
            function appointInit() {
                $scope.appointTime = yznDateFormatYMdHms(new Date());
                $scope.appointalkTime = "";
                $scope.appointDesc = "";
                (function() {
                    lay('#popup_yuyueCome .dateIcon').each(function(v, k) {
                        laydate.render({
                            elem: this,
                            isRange: false,
                            type: "datetime",
                            trigger: 'click',
                            done: function(value) {
                                if (v == 0) {
                                    $scope.appointTime = value;
                                } else {
                                    $scope.appointalkTime = value;
                                }
                            }
                        });
                    });
                })();
            }
            //预约来访确认
            function confirm_yuyueCome(type) {
                var param = {
                    'workTime': $scope.appointTime,
                    'potentialCustomerRecordType': 10,
                    'potentialCustomerRecordDesc': $scope.appointDesc,
                    'returnTime': $scope.appointalkTime,
                    'potentialCustomerId': props.item.potentialCustomerId
                };
                for (var i in param) {
                    if (param[i] === '' || param[i] == undefined) {
                        delete param[i];
                    };
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/potentialCustomer/addRecord",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            if (!props.location) {
                                getPotentialCustomerRecord();
                            }
                            $scope.$emit('potentialChange', false);
                            $scope.$emit('reloadVisit', false);
                            layer.msg('预约来访成功', {
                                icon: 1
                            });
                            $scope.closePopup('popup_yuyueCome');
                        };
                    }
                })
            }
            //预约试听
            function appointLisn() {
                $scope.$choseClassType = 0;
                $scope.lisnDesc = "";

            }
            //删除潜客或学员
            function deletePopential() {
                var msg, url;
                if (props.page == 0) {
                    msg = "确认删除该潜客?";
                    url = "/api/oa/student/deletePotentialCustomer";
                } else {
                    msg = "确认删除该学员?";
                    url = "/api/oa/student/deleteStudent";
                }
                var isConfirm = layer.confirm(msg, {
                    title: "确认删除信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "POST",
                        data: JSON.stringify({
                            'potentialCustomerId': props.item.potentialCustomerId
                        }),
                        success: function(data) {
                            if (data.status == '200') {
                                if (props.page == 0) {
                                    layer.msg('已成功删除潜客', {
                                        icon: 1
                                    });
                                    $scope.$emit('potentialChange', true);
                                } else {
                                    layer.msg('已成功删除学员', {
                                        icon: 1
                                    });
                                    $scope.$emit('studentChange', false);
                                }
                                $scope.closePopup('potential_pop');
                            };
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })
            }
            //转让潜客给顾问
            function changePot_confirm() {
                var params = {
                    toId: $scope.unselected
                };
                if (props.isBatch) {
                    params["potentialCustomerList"] = getArrPotIds(props.item);
                } else {
                    params["potentialCustomerList"] = [{ potentialCustomerId: props.item.potentialCustomerId }];
                }
                params["potentialCustomerRecordType"] = 21;
                $.hello({
                    url: CONFIG.URL + '/api/oa/sale/toPotentialCustomer',
                    type: 'post',
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == "200") {
                            if (!props.location) {
                                getPotentialCustomerRecord();
                            }
                            $scope.$emit('potentialChange', false);
                            $scope.closePopup('changePotPop');
                        }
                    }
                });
            }

            function getArrPotIds(list) {
                var arr = [];
                if (list && list.length > 0) {
                    angular.forEach(list, function(v) {
                        arr.push({
                            potentialCustomerId: v.potentialCustomerId
                        });
                    });
                }
                return arr;
            }
            //暂无意向、标为无效、放回公池
            function changeStatus_confirm() {
                var params = {
                    //              7 (暂无意向) 8 (标为无效) 22 放回公池
                    "potentialCustomerRecordType": props.operateType ? props.operateType : undefined,
                    "potentialCustomerRecordDesc": $scope.potentDesc,
                    "potentialCustomerId": global_potentialId
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/potentialCustomer/updatePotentialCustomerStatus',
                    type: 'post',
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == 200) {
                            if (!props.location) {
                                getPotentialCustomerRecord();
                            }
                            $scope.$emit('potentialChange', true);
                            $scope.closePopup('changeStatusPop');
                        }
                    }
                });
            }

            function add_showInfo(type, list, from) {
                if (type == 'img' || type == 'voice' || type == 'video') {
                    if (list.length > 7) {
                        layer.msg('添加到达上限');
                        return;
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
                            szpUtil.util_addImg(false, function(data) {}, { multiple: true, type: 'image/gif, image/jpeg, image/png', dataSource: 'poTalkRecord' }, uploadObserver);
                        }, 100);
                        break;
                    case 'voice': //添加音频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {}, {
                                type: 'audio/mp3,audio/m4a,audio/x-m4a'
                            }, uploadObserver);
                        });
                        break;
                    case 'video': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {}, {
                                type: 'video/mp4'
                            }, uploadObserver);
                        }, 100);
                        break;
                    case 'more': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {}, {
                                multiple: true,
                                type: 'image/gif, image/jpeg, image/png, image/png,audio/mp3,audio/m4a,audio/x-m4a,video/mp4'
                            }, uploadObserver);
                        }, 100);
                        break;
                }
            }

            function delete_showInfo(ind, list) {
                list.splice(ind, 1);
            }
        }
    })
});