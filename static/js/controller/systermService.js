define(["socketIo", "equipPop", "qrcode"], function (socketIo) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$interval', function ($scope, $rootScope, $http, $state, $stateParams, SERVICE, $interval) {
        var pay_pop;
        var second = 60, timerHandler, isDuringTime = false; //判断验证码定时器是否有效
        init();

        function init() {
            getAdminInfo();//获取系统管理员信息
            getSystemInfo();//获取系统信息
            $scope.serviceListThead = [{
                'name': '门店名',
                'width': '25%',
            },
                //     {
                //     'name': '学员上限',
                //     'width': '25%',
                // },
                {
                    'name': '系统使用截止时间',
                    'width': '25%',
                }, {
                    'name': '服务经理',
                    'width': '25%',
                }, {
                    'name': '操作',
                    'width': '200',
                    'align': 'center',
                }];

            $scope.equipListThead = [{
                'name': '编号',
                'width': '8%',
                'align': 'center',
            }, {
                'name': '设备序列号',
                'width': '20%',
            }, {
                'name': '购买时间',
                'width': '17%',
            }, {
                'name': '分期',
                'width': '15%',
            }, {
                'name': '合计金额',
                'width': '15%',
            }, {
                'name': '押金',
                'width': '10%',
            }, {
                'name': '已还期数',
                'width': '7%',
            }, {
                'name': '状态',
                'width': '8%',
            }, {
                'name': '操作',
                'align': 'center',
                'width': '120',
            }];

            $scope.wxOpenThead = [{
                'name': '门店名',
                'width': '20%',
            },
                {
                    'name': '有效期至',
                    'width': '15%',
                }, {
                    'name': '公众号ID',
                    'width': '15%',
                }, {
                    'name': '公众号名称',
                    'width': '15%'
                }, {
                    'name': '授权状态',
                    'width': '15%',
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '120',
                }];

            $scope.opreateService = checkAuthMenuById("107");//操作服务
            $scope.applyOpreate = "";
            $scope.openGobuy = openGobuy; //打开继续购买
            $scope.openMybill = openMybill; //打开我的账单
            $scope.payInfo = payInfo; //缴费详情
            $scope.openbillInfo = openbillInfo; //账单详情
            $scope.toPay = toPay; //付款
            $scope.closePayPop = closePayPop;
            $scope.confirmPay = confirmPay;
            $scope.getPreAuthUrl = getPreAuthUrl;//微信公众号授权
            $scope.openClearPop = openClearPop;//申请清空弹框
            $scope.openRecordPop = openRecordPop;//申请记录弹框
            $scope.getTestCode = getTestCode;//获取验证码
            $scope.confirm_clearApply = confirm_clearApply;//确认清空
            $scope.closePop = function () {
                layer.close(dialog);
            }

        }

        $scope.$on('systemInfoChange', function () {
            getSystemInfo();
        });

        function getSystemInfo() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/getSystemInfo',
                type: "get",
                success: function (res) {
                    if (res.status == 200) {
                        $scope.systemInfo = res.context;
                    }
                }
            });
        }

        function openGobuy() {
            window.$rootScope.yznOpenPopUp($scope, "equip-pop", "equip_popup", "960px", {
                page: "系统服务"
            });
        }

        function openClearPop() {
            var second = 60; //修改密码验证码起始60s
            var timerHandler, isDuringTime = false; //判断验证码定时器是否有效
            $scope.description = "发送验证码";
            $scope.authCode = "";
            openPopByDiv("申请清空数据", "#clearApplyPop", "560px");
        }

        function getTestCode(phone) { //获取验证码
            if (isDuringTime) {
                return;
            }
            var data = {
                "phone": phone
            }

            $.hello({
                url: CONFIG.URL + '/api/oa/data/getAuthCode',
                type: "get",
                data: data,
                success: function (data) {
                    if (data.status == '200') {
                        $scope.description = second + "s后重发";
                        timerHandler = $interval(function () {
                            if (second <= 0) {
                                $interval.cancel(timerHandler);
                                second = 60;
                                $scope.description = "发送验证码";
                                $scope.canClick = false;
                                isDuringTime = false;
                            } else {
                                second--;
                                $scope.description = second + "s后重发";
                                $scope.canClick = true;
                                isDuringTime = true;
                            }
                        }, 1000, 100)
                    } else {
                        layer.msg(data.message);
                    }
                }
            });
        };

        function getAdminInfo() {
            $.hello({
                url: CONFIG.URL + '/api/oa/data/getAdminInfo',
                type: "get",
                success: function (res) {
                    if (res.status == 200) {
                        $scope.adminInfo = res.context;
                    }
                }
            });
        }

        function confirm_clearApply() {
            $.hello({
                url: CONFIG.URL + '/api/oa/data/applyDataCleaning',
                type: "post",
                data: JSON.stringify({"authCode": $scope.authCode}),
                success: function (res) {
                    if (res.status == 200) {
                        layer.close(dialog);
                    }
                }
            });
        }

        function openRecordPop() {
            $.hello({
                url: CONFIG.URL + '/api/oa/data/getDataCleaning',
                type: "get",
                success: function (res) {
                    if (res.status == 200) {
                        $scope.recordList = res.context;
                    }
                }
            });
            openPopByDiv("申请记录", "#apply_record", "660px");
        }

        function getPreAuthUrl() {
            // $.hello({
            //     url: CONFIG.URL + '/api/wxopen/getPreAuthUrl?isMobile=false',
            //     type: "get",
            //     success: function(res) {
            //         if (res.status == 200) {
            //             window.open(res.context);
            //         }
            //     }
            // });

            window.open(CONFIG.URL + '/api/wxopen/getPreAuthUrl?isMobile=false&token=' + localStorage.getItem('oa_token') + "&auth_type=1");
        }

        function openMybill(t) {
            // $.hello({
            //     url: CONFIG.URL + '/api/wxopen/getPreAuthUrl?isMobile=false',
            //     type: "get",
            //     success: function(res) {
            //         if (res.status == 200) {
            //             window.open(res.context);
            //         }
            //     }
            // });
            // return;

            openPopByDiv('我的账单', '.mybill_pop', '760px', function (layero) {
                $.hello({
                    url: CONFIG.URL + '/api/oa/device/listMyDeviceBill',
                    type: "get",
                    success: function (res) {
                        if (res.status == 200) {
                            $scope.listMyDeviceBill = res.context;
                        }
                    }
                });
            }, false);
        }

        function payInfo(t) {
            openPopByDiv('缴费详情', '.payInfo_pop', '760px', function (layero) {
                $.hello({ //取消订单的回调方法
                    url: CONFIG.URL + '/api/oa/device/listDeviceBill',
                    type: "get",
                    data: {
                        'id': t.id
                    },
                    success: function (res) {
                        if (res.status == 200) {
                            $scope.listDeviceBill = res.context;
                        }
                    }
                });
            }, false);
        }

        function openbillInfo(d) {
            $scope.deviceBillDetail = angular.copy(d);
            var title = "账单详情<span class='main_color'>(" + yznDateFormatYMd(d.deadline) + ")<span>"
            openPopByDiv(title, '.billInfo_pop', '760px', function (layero) {
                $.hello({ //取消订单的回调方法
                    url: CONFIG.URL + '/api/oa/device/getBillDetail',
                    type: "get",
                    data: {
                        'deadline': d.deadline
                    },
                    success: function (res) {
                        if (res.status == 200) {
                            $scope.deviceBillList = res.context;
                        }
                    }
                });
            }, false);
        }


        function toPay(d) {
            $scope.deviceBillDetail = angular.copy(d);
            $scope.PayTypeList = getConstantList({
                1: '支付宝',
                2: '微信',
            }); //支付方式
            $scope.PayProjectList = {
                'paymentMode': '支付宝',
                'paymentMoney': '1'
            };
            $scope.clickPayTypeIcon = function (d, evt) { //点击支付方式
                if (d) {
                    $scope.PayProjectList['paymentMoney'] = d;
                }
            };
            pay_pop = layer.open({
                type: 1,
                title: "付款",
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                anim: 0,
                area: '600px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $('.pay_pop')
            })

        }

        function closePayPop() {
            layer.close(pay_pop);
        }

        function confirmPay() {
            var param = {
                "myDeviceBillId": $scope.deviceBillDetail.myDeviceBillId, // 数量
                "onlinePay": $scope.PayProjectList['paymentMoney'], // 线上支付 1：支付宝 2：微信
            }
            $.hello({ //取消订单的回调方法
                url: CONFIG.URL + '/api/oa/device/getPayInfo',
                type: "post",
                data: JSON.stringify(param),
                success: function (res) {
                    if (res.status == 200) {
                        $scope.onlindPayData = res.context;
                        $('.onlinePay_code').html('');
                        jQuery('.onlinePay_code').qrcode({ //渲染二维码
                            render: "canvas", //也可以替换为table
                            width: 240,
                            height: 240,
                            text: res.context.qrUrl,
                        });

                        //支付完成自动关闭弹窗
                        webSocketInit(res.context.orderId, function (event) {
                            var res = JSON.parse(event);
                            layer.close(dialog);
                            layer.close(pay_pop);
                            layer.msg('支付成功', {
                                icon: 1
                            });
                            $.hello({
                                url: CONFIG.URL + '/api/oa/device/listMyDeviceBill',
                                type: "get",
                                success: function (res) {
                                    if (res.status == 200) {
                                        $scope.listMyDeviceBill = res.context;
                                    }
                                }
                            });
                        }, socketIo, 'refreshBillQRCode');

                        //刷新订单支付状态
                        $scope.reOnlinePay = function () {
                            $.hello({
                                url: CONFIG.URL + '/api/oa/device/getBillPayStatus',
                                type: "get",
                                data: {
                                    'orderId': res.context.orderId
                                },
                                success: function (res) {
                                    //                                  支付状态 0：未支付 1：已支付
                                    if (res.status == 200) {
                                        if (res.context.status == 1) {
                                            layer.close(dialog);
                                            layer.close(pay_pop);
                                            layer.msg('支付成功', {
                                                icon: 1
                                            });
                                            $.hello({
                                                url: CONFIG.URL + '/api/oa/device/listMyDeviceBill',
                                                type: "get",
                                                success: function (res) {
                                                    if (res.status == 200) {
                                                        $scope.listMyDeviceBill = res.context;
                                                    }
                                                }
                                            });

                                        } else {
                                            layer.msg('订单待支付');
                                        }
                                    }
                                }
                            });
                        }
                        openPopByDiv('扫码支付', '#onlinePay', '400px', false);
                    }
                }
            });
        }
    }]
})