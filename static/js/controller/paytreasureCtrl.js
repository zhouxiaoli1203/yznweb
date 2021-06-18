define(["laydate", "socketIo", "szpUtil", "mySelect", "kindeditor", 'collectionPop', 'qrcode', 'signUp', 'courseAndClass_sel', 'orderInfo'], function(laydate, socketIo) {
    return ['$scope', '$state', function($scope, $state) {
        var editor;
        $scope.Fns = {
            operate: function(type, x) {
                $scope.constants.common_obj = {};
                switch (type) {
                    case '1': //交易流水编辑
                        this.layerOpen('paytreasure_order_edit', '编辑<span class="main_color"> ( 交易号：' + x.paymentBillId + ' ) </span>', 760);
                        $scope.constants.common_obj = angular.copy(x);
                        break;
                    case '2': //交易流水退款
                        this.layerOpen('paytreasure_order_return', '退款', 760);
                        $scope.constants.common_obj = angular.copy(x);
                        break;
                    case '3': //关联方式
                        this.layerOpen('paytreasure_order_concat', '选择关联方式', '760');
                        $scope.constants.common_obj = angular.copy(x);
                        break;

                    case '4': //关联记录
                        this.layerOpen('paytreasure_order_record', '关联记录', '560');
                        $.hello({
                            url: CONFIG.URL + "/api/onlinePayment/paymentBill/info",
                            type: "get",
                            data: {
                                paymentBillId: x.refundsId
                            },
                            success: function(data) {
                                if (data.status == "200") {
                                    $scope.constants.common_obj = data.context;
                                }
                            }
                        });
                        break;
                    case '5': //重新申请商户 确认
                        var isConfirm = layer.confirm('若要变更主体类型，如个人商户变更为企业商户，可以重新申请商户，申请后原商户将作废。确定要重新申请吗？', {
                            title: "确认信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            resize: false,
                            move: false,
                            area: '560px',
                            btn: ['确定', '取消'] //按钮
                        }, function() {
                            $scope.Fns.closePop('paytreasure_order_change');
                            layer.close(isConfirm);
                            $scope.Fns.layerOpen('open_ysb_type', '', 960, 610);
                        }, function() {
                            layer.close(isConfirm);
                        })
                        break;
                }
            },
            // 编辑
            orderEdit: function() {
                if ($scope.constants.common_obj.phone && !/^1[23456789]\d{9}$/.test($scope.constants.common_obj.phone)) {
                    return layer.msg('请输入正确的手机号')
                }
                $.hello({
                    url: CONFIG.URL + "/api/onlinePayment/paymentBill/update",
                    type: "post",
                    data: JSON.stringify({
                        paymentBillId: $scope.constants.common_obj.paymentBillId,
                        phone: $scope.constants.common_obj.phone ? $scope.constants.common_obj.phone : undefined,
                        remark: $scope.constants.common_obj.remark,
                        studentName: $scope.constants.common_obj.studentName
                    }),
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.Fns.closePop();
                            $scope.constants.pager.pagi_init(false);
                        }
                    }
                });
            },
            // 退款
            returnMoney: function() {
                $.hello({
                    url: CONFIG.URL + "/api/onlinePayment/refuns",
                    type: "post",
                    data: JSON.stringify({
                        paymentBillId: $scope.constants.common_obj.paymentBillId
                    }),
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.Fns.closePop();
                            $scope.constants.pager.pagi_init(false);
                        }
                    }
                });
            },
            // 关联订单方式选择
            orderConcatOperate: function(type) {
                this.closePop('paytreasure_order_concat');
                switch (type) {
                    case 'bm': //报名
                        var param = {
                            'item': {},
                            'fromPaytreasure': $scope.constants.common_obj,
                            'title': '报名',
                            'location': "outside",
                        };
                        window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                        $scope.$on('paytreasure_success', function(e) {
                            console.log(e);
                            $scope.constants.pager.pagi_init(false);
                        });
                        break;
                    case 'bj': //补交
                        $scope.$broadcast('repay_select', 'clearHeadName');
                        $scope.subInfo = {
                            orderInfo: '',
                            orderDesc: "",
                            orderDesc_out: "",
                            // shopTeacherId: "",
                            shopTeacherId: $scope.constants.common_obj.handler ? $scope.constants.common_obj.handler.shopTeacherId : "",
                            shopTeachName: $scope.constants.common_obj.handler ? $scope.constants.common_obj.handler.teacherName : '',
                            list: [],
                            pager: new Initpager('.coursePage', this.getownList),
                            searchName: '',
                            confirm: function() {
                                if (!this.orderInfo) return layer.msg('请选择欠费订单');
                                if (this.orderInfo.arrearage !== $scope.constants.common_obj.paymentMoney) return layer.msg('欠费金额需等于交易流水金额');
                                $scope.payTotal = 0;
                                $scope.repay = true;
                                getHandlerList();
                                getOrderCourseList();
                                $scope.Fns.layerOpen("rePay", '补交学费', "860");
                            },
                            clickHandler: function(x) {
                                this.shopTeacherId = x.shopTeacherId;
                            },
                            // 提交补交
                            submit: function() {
                                if (!this.shopTeacherId) return layer.msg('请选择经办人')
                                var params = {
                                        "paymentBillId": $scope.constants.common_obj.paymentBillId,
                                        "orderId": this.orderInfo.orderId,
                                        "orderType": 4,
                                        "remark": this.orderDesc ? this.orderDesc : undefined,
                                        "externalRemark": this.orderDesc_out ? this.orderDesc_out : undefined,
                                        "handlerId": this.shopTeacherId
                                    },
                                    _this = this;
                                $.hello({
                                    url: CONFIG.URL + "/api/onlinePayment/associateRecord",
                                    type: "post",
                                    data: JSON.stringify(params),
                                    success: function(data) {
                                        if (data.status == "200") {
                                            $scope.Fns.closePop();
                                            $scope.constants.pager.pagi_init(false);
                                            window.$rootScope.yznOpenPopUp($scope, 'order-info', 'orderInfo', '960px', {
                                                data: {
                                                    orderId: params.orderId,
                                                    orderType: _this.orderInfo.orderType
                                                },
                                                page: '订单管理'
                                            });
                                        }
                                    }
                                });
                            }
                        };
                        $scope.subInfo.searchName = $scope.constants.common_obj.studentName;
                        $scope.subInfo.pager.pagi_init(true);
                        $scope.$broadcast('select_potential_bujiao', $scope.constants.common_obj.studentName);

                        this.layerOpen('paytreasure_order_bujiao', '选择欠费订单', '860');
                        break;
                    case 'cz': //充值
                        window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_potential', '760px', { type: 'potential', choseType: 'radio', sourcePage: '快速收款', callBackName: '充值-选择学员', initName: $scope.constants.common_obj.studentName });
                        break;
                }
            },
            // 获取欠费订单列表
            getownList: function(pager) {
                $.hello({
                    url: CONFIG.URL + '/api/oa/order/getStudentOrder',
                    type: 'get',
                    data: {
                        arrearageStatus: 1,
                        start: pager.start,
                        count: pager.count,
                        searchType: 'appSearchName',
                        searchName: $scope.subInfo.searchName ? $scope.subInfo.searchName : undefined,
                        orderName: 'orderTime',
                        orderTyp: 'desc'
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.subInfo.list = data.context.items;
                            pager.pagi_init(false, data.context.totalNum);
                        }
                    }
                });
            },
            openOffline: function() {
                $('#offlineCode_code').html('');
                jQuery('#offlineCode_code').qrcode({
                    render: "canvas",
                    width: 184,
                    height: 184,
                    text: CONFIG.URL + '/h5/common/topay/index_fast.html?shopId=' + localStorage.getItem('shopId') + "&v=" + new Date().getTime()
                });
                this.layerOpen('offlineCode_popup', '前台收款码', '460')
            },
            // 生成二维码
            saveThePoster: function() {
                function convertCanvasToImage(canvas) {
                    var img = new Image();
                    img.src = canvas.toDataURL("image/png", 1);
                    return img;
                }
                var mycanvas = document.createElement('canvas'),
                    imgPost = new Image,
                    imgQrcode = new Image,
                    bs = 4;
                imgQrcode = convertCanvasToImage($("#offlineCode_code canvas")[0]);
                imgPost.src = 'http://cdntest.yizhiniao.com/offlineCode_.png' + "?v=" + new Date().getTime();
                imgQrcode.crossOrigin = "Anonymous";
                imgPost.crossOrigin = "Anonymous";
                mycanvas.width = 300 * bs;
                mycanvas.height = 426 * bs;

                var ctx = mycanvas.getContext('2d');
                promiseAll = [
                    new Promise(function(resolve) {
                        imgPost.onload = function() {
                            resolve(imgPost)
                        }
                    }),
                    new Promise(function(resolve) {
                        imgQrcode.onload = function() {
                            resolve(imgQrcode)
                        }
                    })
                ];
                Promise.all(promiseAll).then(function(img) {
                    ctx.drawImage(imgPost, 0, 0, 300 * bs, 426 * bs);

                    ctx.fillStyle = '#fff';
                    ctx.fillRect(50 * bs, 155 * bs, 200 * bs, 200 * bs);

                    ctx.drawImage(imgQrcode, 58 * bs, 163 * bs, 184 * bs, 184 * bs);

                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center' //文字居中
                    ctx.font = 14 * bs + 'px Georgia';
                    ctx.fillText(window.$rootScope.compName, 150 * bs, 390 * bs);

                    var img = convertCanvasToImage(mycanvas);
                    $('body').append("<a id='czbj' href=" + img.src + " download='前台展示二维码'><span>openit</span></a>");
                    $('#czbj').hide();
                    $('#czbj span').trigger("click");
                    $('#czbj').remove();
                })
            },
            openReceDilog: function() {
                $scope.f5Id = null;
                $scope.reloadOnlinePay = function(fn) { //刷新订单支付状态
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
                                        $scope.constants.pager.pagi_init(true);
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
                $scope.codeFn_ = function(code, fn, params) { //吊起支付
                    params.authCode = code;
                    $.hello({
                        url: CONFIG.URL + '/api/onlinePayment/fastPayment',
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.f5Id = data.context.orderId;
                                //监听订单支付状态
                                webSocketInit(data.context.orderId, function(event) {
                                    var res = JSON.parse(event);
                                    console.log(res)
                                    if (res.payStatus == 1) { //支付成功
                                        layer.msg('收款成功', { icon: 1 });
                                        fn('close');
                                        if ($scope.f5Id) {
                                            $scope.constants.pager.pagi_init(true);
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
                                }, socketIo, 'refreshOrderQRCode');

                            } else {
                                $scope.f5Id = null;
                                fn('clear_val');
                                $scope.$apply();
                            }
                        }
                    });
                };
                window.$rootScope.yznOpenPopUp($scope, 'collection-pop', 'collection_popup', '760px', { fast: true, emit: 'for_paytreasure', });
                if (!$scope.$$listeners['for_paytreasure']) {
                    $scope.$on('for_paytreasure', function(e, data) {
                        if (data.name == 'apply') {
                            $scope.codeFn_(data.code, data.fn, data.params);
                        }
                        if (data.name == 'f5') {
                            $scope.reloadOnlinePay(data.fn);
                        }
                    });
                }
            },
            changeQianke: function(e, v, fl) {
                if (fl) {
                    $scope.constants.screenReset.associated = e.target.checked ? '0' : '';
                } else {
                    $scope.constants.screenReset.credited = e.target.checked ? v : undefined;
                }
                $scope.constants.pager.pagi_init(true);
            },
            changeStyle: function(val) {
                $scope.constants.screenReset.paymentMode = val != null ? val.id : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            changeType: function(val) {
                $scope.constants.screenReset.refundsFlag = val != null ? val.id : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            changeSource: function(val) {
                $scope.constants.screenReset.dataFrom = val != null ? val.id : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            changeHandle: function(val) {
                $scope.constants.screenReset.handlerId = val != null ? val.shopTeacherId : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            getHandlelist: function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/order/getHandlerList',
                    type: 'get',
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.constants.screen_handle = data.context;
                        }
                    }
                });
            },
            SearchData: function(n) {
                $scope.constants.screenReset.searchName = n.value;
                $scope.constants.pager.pagi_init(true);
            },
            SearchData_: function(n) {
                $scope.subInfo.searchName = n.value;
                $scope.subInfo.pager.pagi_init(true);
            },
            // 菜单切换
            switchOrderNav: function(n, fl) {
                if (fl) { //今天昨天切换
                    if ($scope.constants.screenReset.dayTab == n) {
                        $scope.constants.screenReset.dayTab = '';
                        $scope.constants.searchTime = '';
                    } else {
                        $scope.constants.screenReset.dayTab = n;
                        var tem_time = n == 1 ? $.format.date(new Date(), 'yyyy-MM-dd') : $.format.date(new Date().setDate(new Date().getDate() - 1), 'yyyy-MM-dd');
                        $scope.constants.searchTime = tem_time + ' 到 ' + tem_time;
                    }
                    $scope.constants.pager.pagi_init(true);
                } else {
                    $scope.constants.orderNavJud = n;
                    this.onReset(n == 2 && !fl);
                }
            },

            //导出
            exportPay: function() {
                var params = {
                    'paymentBillType': $scope.constants.orderNavJud,
                    'searchType': 'appSearchName',
                    'searchName': $scope.constants.screenReset.searchName,
                    'dataFrom': $scope.constants.screenReset.dataFrom,
                    'paymentMode': $scope.constants.screenReset.paymentMode,
                    'refundsFlag': $scope.constants.screenReset.refundsFlag,
                    'associated': $scope.constants.screenReset.associated,
                    'credited': $scope.constants.screenReset.credited,
                    'handlerId': $scope.constants.screenReset.handlerId,
                    'beginTime': $scope.constants.searchTime ? ($scope.constants.searchTime.split(' 到 ')[0] + ' 00:00:00') : undefined,
                    'endTime': $scope.constants.searchTime ? ($scope.constants.searchTime.split(' 到 ')[1] + ' 23:59:59') : undefined,
                    "token": localStorage.getItem('oa_token')
                };
                for (i in params) {
                    if (!params[i] && params[i] !== 0) {
                        delete params[i];
                    }
                }
                window.open(CONFIG.URL + '/api/oa/statistics/exportListPaymentBill?' + $.param(params));
            },

            //重置
            onReset: function(fl) {
                $scope.constants.screenReset = {};
                if (fl || $scope.constants.orderNavJud == 2) {
                    $scope.constants.searchTime = '';
                } else {
                    $scope.constants.screenReset.dayTab = 1;
                    var tem_time = $.format.date(new Date(), 'yyyy-MM-dd');
                    $scope.constants.searchTime = tem_time + ' 到 ' + tem_time;
                }
                $scope.constants.searchName = '';
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                if ($scope.kindSearchOnreset) $scope.kindSearchOnreset(); //调取app重置方法
                $scope.constants.pager.pagi_init(true);
            },
            //底表和总计
            getPaymentList: function(pager) {
                var params = {
                    'paymentBillType': $scope.constants.orderNavJud,
                    'searchType': 'appSearchName',
                    'searchName': $scope.constants.screenReset.searchName,
                    'dataFrom': $scope.constants.screenReset.dataFrom,
                    'paymentMode': $scope.constants.screenReset.paymentMode,
                    'refundsFlag': $scope.constants.screenReset.refundsFlag,
                    'associated': $scope.constants.screenReset.associated,
                    'credited': $scope.constants.screenReset.credited,
                    'handlerId': $scope.constants.screenReset.handlerId,
                    'beginTime': $scope.constants.searchTime ? ($scope.constants.searchTime.split(' 到 ')[0] + ' 00:00:00') : undefined,
                    'endTime': $scope.constants.searchTime ? ($scope.constants.searchTime.split(' 到 ')[1] + ' 23:59:59') : undefined,
                };
                for (i in params) {
                    if (!params[i] && params[i] !== 0) {
                        delete params[i];
                    }
                }
                //获取支付流水统计
                $.hello({
                    url: CONFIG.URL + "/api/onlinePayment/paymentBill/total",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.paymentTotal = res.context;
                        };
                    }
                })
                params['start'] = pager.start;
                params['count'] = pager.count;
                //获取支付流水列表
                $.hello({
                    url: CONFIG.URL + "/api/onlinePayment/paymentBill/list",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.paymentList = res.context.items;
                            pager.pagi_init(false, res.context.totalNum);
                        };
                    }
                });
            },
            // 关闭弹框
            closePop: function(id) {
                if (!id) {
                    for (var i in $scope.constants.dialogs) {
                        layer.close($scope.constants.dialogs[i])
                    }
                    $scope.constants.dialogs = {};
                    return;
                }
                layer.close($scope.constants.dialogs[id]);
                delete $scope.constants.dialogs[id];
            },
            // 打开弹框
            layerOpen: function(ele, title, width, height, databack) {
                if (ele == "auditing-popup_") {
                    $scope.constants.navigation_bar_bgm = $scope.changeSource ? 3 : 1;
                }
                $scope.constants.dialogs[ele] = layer.open({
                    type: 1,
                    title: title ? title : false,
                    skin: 'layerui', //样式类名
                    closeBtn: title ? 1 : 0, //显示关闭按钮
                    move: false,
                    anim: 0,
                    area: height ? [width + 'px', height + 'px'] : width + 'px',
                    offset: '30px',
                    shadeClose: false, //开启遮罩关闭
                    content: $("#" + ele),
                    success: function() {
                        if (ele == "auditing-popup_") {
                            var arr = ['licSdate', 'licEdate', 'idSdate', 'idEdate'];
                            // 时间控件
                            for (var i = 0; i < arr.length; i++) {
                                (function(index) {
                                    var initObj = {
                                        elem: '#' + arr[index],
                                        isRange: false,
                                        done: function(value) {
                                            $scope.constants.postData[arr[index]] = value;
                                            $scope.$apply();
                                        }
                                    };
                                    if (arr[index] == 'licSdate' || arr[index] == 'idSdate') {
                                        initObj.max = new Date().getTime();
                                    } else {
                                        initObj.min = new Date().getTime() + 24 * 60 * 60 * 1000;
                                        initObj.btns = ['clear', 'confirm'];
                                    }
                                    laydate.render(initObj);
                                })(i);
                            }
                        }
                    }
                });
            },
            init: function() {
                this.getHandlelist();
                laydate.render({
                    elem: '#searchTime', //指定元素
                    range: '到',
                    isRange: true,
                    done: function(value) {
                        $scope.constants.searchTime = value;
                        $scope.constants.pager.pagi_init(true);
                        var begin = $scope.constants.searchTime.split(' 到 ')[0];
                        var end = $scope.constants.searchTime.split(' 到 ')[1];
                        var today = $.format.date(new Date(), 'yyyy-MM-dd');
                        var yesday = $.format.date(new Date().setDate(new Date().getDate() - 1), 'yyyy-MM-dd');
                        if (begin == today && end == today) {
                            $scope.constants.screenReset.dayTab = '1';
                            return
                        }
                        if (begin == yesday && end == yesday) {
                            $scope.constants.screenReset.dayTab = '2';
                            return
                        }
                        $scope.constants.screenReset.dayTab = '';

                    }
                });
                if (checkAuthMenuById(189) || checkAuthMenuById(190)) {
                    this.switchOrderNav(1, true);
                } else {
                    this.switchOrderNav(2);
                }

            },
            /*
             *申请相关*
             */

            // 选择类型
            chooseType: function(type, fl) {
                $scope.Fns.closePop('open_ysb_type');
                if ($scope.constants.dialogs['auditing-popup_']) { //修改类型
                    $scope.constants.postData = Object.assign({}, angular.copy($scope.constants.postData_), $scope.constants.postData);
                } else { //新增
                    $scope.constants.postData = angular.copy($scope.constants.postData_);
                }

                if ($scope.constants.postData.pnrpayMerType == 9) { //申请前为个人
                    $scope.constants.postData.isCreditCode = 1;
                    $scope.constants.postData.licType = 1;
                } else {
                    if ($scope.constants.postData.isCreditCode == 1) {
                        $scope.constants.postData.creditCode_1 = $scope.constants.postData.creditCode;
                        $scope.constants.postData.creditCode_2 = '';
                    } else {
                        $scope.constants.postData.creditCode_1 = '';
                        $scope.constants.postData.creditCode_2 = $scope.constants.postData.creditCode;
                    }
                }
                $scope.constants.postData.pnrpayMerType = type;

                if ($scope.constants.dialogs['auditing-popup_']) return; //修改类型
                // 第三步清空城市
                $scope.cityList_ = [];
                if (!$scope.constants.postData.bankName) {
                    $scope.$broadcast('courseSearch', 'clearHeadName');
                }
                if (fl) { //获取变更的城市列表
                    $scope.Fns.getProvinceCityArea($scope.constants.postData.bankProvId, 'cityList_', function() {
                        $scope.constants.postData.bankCityId = $scope.constants.postData_.bankCityId;
                    });
                } else { //获取第一步城市 地区列表
                    $scope.Fns.getProvinceCityArea($scope.constants.postData.provId, 'cityList', function() {
                        $scope.constants.postData.areaId = $scope.constants.postData_.areaId;
                    });
                    $scope.Fns.getProvinceCityArea($scope.constants.postData.cityId, 'areaList', function() {
                        $scope.constants.postData.areaId = $scope.constants.postData_.areaId;
                    });
                }
                $.hello({
                    url: CONFIG.URL + '/api/onlinePayment/huifuMapList',
                    type: 'get',
                    data: { name: 0 },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.provincesList = data.context;
                        }
                    }
                });
                $scope.changeSource = fl ? true : false;
                $scope.Fns.layerOpen('auditing-popup_', '', 960, fl ? 560 : 610);
            },
            // 获取省市区银行
            getProvinceCityArea: function(name, key, fn) {
                if (!name) return;
                if (key !== 'cityList_') $scope.areaList = [];
                $.hello({
                    url: CONFIG.URL + '/api/onlinePayment/huifuMapList',
                    type: 'get',
                    data: { name: name },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope[key] = data.context;
                            if (fn) fn();
                        }
                    }
                });
            },
            getBank: function(bank) { //银行
                if (bank) {
                    $scope.constants.postData.bankName = bank.name;
                    $scope.$broadcast('courseSearch_', 'clearHeadName');
                    $scope.constants.postData.subBankName = '';
                }
            },
            bankList: function(key, name, searchName) {
                if (key == 'bankbranchList' && !name) return layer.msg('请选择开户银行')
                $.hello({
                    url: CONFIG.URL + '/api/onlinePayment/huifuBankList',
                    type: 'get',
                    data: { name: name || 0, start: 0, count: 50, searchType: 'appSearchName', searchName: searchName || '' },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope[key] = data.context.items;
                        }
                    }

                })
            },
            // 保存支行名称
            saveBankname: function(value) {
                if (value) {
                    $scope.constants.postData.subBankName = value.name;
                }
            },
            // 下一步&提交
            step: function() {
                if ($scope.constants.navigation_bar_bgm == 3) { //STEP3
                    if ($scope.constants.postData.idNo.length < 8) {
                        layer.msg("账号/卡号的最小8位");
                        return;
                    }
                    if (!$scope.constants.postData.bankName) {
                        layer.msg("请选择开户银行");
                        return;
                    }
                    if ((($scope.constants.postData.pnrpayMerType == 3 || $scope.constants.postData.pnrpayMerType == 7) && $scope.constants.postData.isPrivate == 0) && !$scope.constants.postData.subBankName) {
                        layer.msg("请选择开户支行");
                        return;
                    }
                    var param = angular.copy($scope.constants.postData);
                    if (param.pnrpayMerType == 3 || param.pnrpayMerType == 7) {
                        if (param.isPrivate == 1) { //企业对私
                            if (!param.archFlph18) {
                                layer.msg("请上传储蓄卡正面照片");
                                return;
                            }
                            if (!param.archFlph26) {
                                layer.msg("请上传结算授权委托书");
                                return;
                            }
                            if (param.archFlph04) {
                                delete param.archFlph04;
                            }
                            if (param.subBankName) { //企业对私删除支行
                                delete param.subBankName;
                            }
                        } else { //对公
                            if (!param.archFlph04) {
                                layer.msg("请上传开户许可证或基本存款证明");
                                return;
                            }
                            if (param.archFlph18) {
                                delete param.archFlph18;
                            }
                            if (param.archFlph26) {
                                delete param.archFlph26;
                            }
                        }
                    } else {
                        if (!param.archFlph18) {
                            layer.msg("请上传储蓄卡正面照片");
                            return;
                        }
                        var delteKeys = $scope.constants.delteKeys[param.pnrpayMerType];
                        for (var i in delteKeys) {
                            delete param[delteKeys[i]];
                        }
                    }

                    if ($scope.changeSource && !$scope.constants.postData.archFlph25) {
                        layer.msg("请上传结算账户变更申请表");
                        return;
                    }

                    if (param.orgCode && (param.pnrpayMerType == 9 || param.isCreditCode == 1)) { //删除组织机构代码
                        delete param.orgCode;
                    }
                    for (var i in $scope.constants.delteKeys.common) {
                        delete param[$scope.constants.delteKeys.common[i]];
                    }
                    if (param.isCreditCode == 1) {
                        param.creditCode = param.creditCode_1;
                    }
                    if (param.isCreditCode == 0) {
                        param.creditCode = param.creditCode_2;
                    }
                    delete param.creditCode_1;
                    delete param.creditCode_2;
                    for (var i in $scope.constants.dateChangeKeys) { //日期格式修改
                        if (param[$scope.constants.dateChangeKeys[i]]) {
                            param[$scope.constants.dateChangeKeys[i]] = param[$scope.constants.dateChangeKeys[i]].replace(/-/g, '');
                        }
                    }
                    if ($scope.changeSource) {
                        param = {
                            "archFlph04": param.archFlph04, // 开户许可证
                            "archFlph18": param.archFlph18, // 银行卡正面
                            "archFlph25": param.archFlph25, // 变更申请表
                            "archFlph26": param.archFlph26, // 结算委托书
                            "bankActId": param.bankActId, // 账号/卡号
                            "bankName": param.bankName, // 开户银行
                            "subBankName": param.subBankName, // 支行名称
                            "bankCityId": param.bankCityId, // 银行所在地（市）
                            "bankProvId": param.bankProvId, // 银行所在地（省）
                            "isPrivate": param.isPrivate, // 0:对公1：对私
                            "memberId": $scope.constants.postData_.memberId // 商户号
                        }
                    } else {
                        delete param.archFlph25;
                    }
                    $.hello({
                        url: CONFIG.URL + ($scope.changeSource ? '/api/onlinePayment/changeAccount' : '/api/onlinePayment/merchantsEnroll'),
                        type: 'post',
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.Fns.closePop('auditing-popup_');
                                $scope.Fns.getApply();
                                if ($scope.changeSource) {
                                    $scope.Fns.layerOpen('paytreasure_order_change', '账户信息', '560')
                                }
                            }
                        }
                    });
                } else if ($scope.constants.navigation_bar_bgm == 1) { //STEP1
                    if ($scope.constants.postData.pnrpayMerType !== 9) {
                        if ($scope.constants.postData.isCreditCode == '1') {
                            if ($scope.constants.postData.creditCode_1.length !== 18) {
                                layer.msg("信用代码长度应为18位");
                                return;
                            }
                        } else {
                            if ($scope.constants.postData.creditCode_2.length !== 15) {
                                layer.msg("注册号长度应为15位");
                                return;
                            }
                        }
                    }
                    switch (JSON.parse($scope.constants.postData.pnrpayMerType)) {
                        case 3: //企业
                            if (!$scope.constants.postData.archFlph01) {
                                return layer.msg("请上传营业执照照片");
                            }
                            if ($scope.constants.postData.isCreditCode == 0) {
                                if (!$scope.constants.postData.archFlph03) {
                                    return layer.msg("请上传组织机构代码证照片");
                                }
                                if (!$scope.constants.postData.archFlph02) {
                                    return layer.msg("请上传税务登记证照片");
                                }
                            }
                            break;
                        case 5: //个体工商户
                            if (!$scope.constants.postData.archFlph01) {
                                return layer.msg("请上传营业执照照片");
                            }
                            break;
                        case 7: //民办非企业
                            if (!$scope.constants.postData.archFlph01) {
                                return layer.msg("请上传民办非企业单位登记证书照片");
                            }
                            if ($scope.constants.postData.isCreditCode == 0) {
                                if (!$scope.constants.postData.archFlph03) {
                                    return layer.msg("请上传组织机构代码证照片");
                                }
                                if (!$scope.constants.postData.archFlph02) {
                                    return layer.msg("请上传税务登记证照片");
                                }
                            }
                            break;
                    }
                    if (!$scope.constants.postData.archFlph10) {
                        return layer.msg("请上传门面照片");
                    }
                    if (!$scope.constants.postData.archFlph11) {
                        return layer.msg("请上传内景照片");
                    }
                    $scope.constants.navigation_bar_bgm = $scope.constants.navigation_bar_bgm + 1;

                } else if ($scope.constants.navigation_bar_bgm == 2) { //STEP2
                    if ($scope.constants.postData.idNo.length !== 18) {
                        layer.msg("身份证号码格式不正确");
                        return;
                    }
                    if (!/^1\d{10}$/.test($scope.constants.postData.contactTelno)) {
                        layer.msg("手机号码格式不正确");
                        return;
                    }
                    if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+[\.][a-zA-Z0-9_-]+$/.test($scope.constants.postData.contactEmail)) {
                        layer.msg("邮箱格式不正确");
                        return;
                    }
                    if (!$scope.constants.postData.archFlph06) {
                        return layer.msg("请上传身份证国徽面照片");
                    }
                    if (!$scope.constants.postData.archFlph05) {
                        return layer.msg("请上传身份证人像面照片");
                    }
                    // 获取下一步的省市区信息
                    if (!$scope.cityList_ || !$scope.cityList_.length) {
                        $scope.Fns.getProvinceCityArea($scope.constants.postData.bankProvId, 'cityList_', function() {
                            $scope.constants.postData.bankCityId = $scope.constants.postData_.bankCityId;
                        });
                    }
                    $scope.Fns.bankList('bankList');
                    $scope.constants.navigation_bar_bgm = $scope.constants.navigation_bar_bgm + 1;
                }

            },
            returnStep: function() {
                $scope.constants.navigation_bar_bgm = $scope.constants.navigation_bar_bgm - 1
            },
            // 获取易收宝
            getApply: function(fl) {
                $scope.constants.postData = {};
                $.hello({
                    url: CONFIG.URL + '/api/onlinePayment/getApply',
                    type: 'get',
                    success: function(data) {
                        if (data.status == "200") {
                            for (var i in $scope.constants.dateChangeKeys) {
                                var val = data.context[$scope.constants.dateChangeKeys[i]];
                                if (val) {
                                    data.context[$scope.constants.dateChangeKeys[i]] = val.substring(0, 4) + '-' + val.substring(4, 6) + '-' + val.substring(6, 8);
                                }
                            }
                            $scope.constants.postData_ = data.context;
                            $scope.constants.pageJudge = $scope.constants.postData_.auditStatus == 1 ? true : false;

                            if ($scope.constants.pageJudge && !checkAuthMenuById(189) && !checkAuthMenuById(190) && !checkAuthMenuById(195)) {
                                $scope.constants.pageJudge = false;
                                $scope.constants.pageJudge_ = true;
                                return;
                            }
                            if ($scope.constants.pageJudge) {
                                if (fl) return;
                                $scope.Fns.init();
                                return;
                            }
                            // $scope.constants.postData_.auditStatus = -1
                            // $scope.constants.postData_.failureCause = '你妈个臭傻逼'
                            //新用户给2
                            $scope.constants.postData_.auditStatus = $scope.constants.postData_.auditStatus === undefined ? '2' : $scope.constants.postData_.auditStatus;
                            if ($scope.constants.postData_.pnrpayMerType === undefined) {
                                $scope.constants.postData_.isCreditCode = 1;
                                $scope.constants.postData_.licType = 1;
                                $scope.constants.postData_.idValidType = 1;
                                $scope.constants.postData_.isPrivate = 0;
                            }

                        }

                    }
                })
            },
            // 变更账户信息
            changeAccount: function() {
                $scope.changeSource = true;
                this.closePop('paytreasure_order_change');
                this.chooseType($scope.constants.postData_.pnrpayMerType, true);
            },
            imgover: function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').show();
                        break;
                }
            },
            imgout: function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').hide();
                        break;
                }
            },
            add_organInfo: function(type, size) {
                setTimeout(function() {
                    szpUtil.util_addImg(false, function(data) {
                        $scope.constants.postData[type] = data;
                        $scope.$apply();
                    }, { type: "image/jpeg, image/png",dataSource:'ysbApply', maxSize: 1 * 1024 * 1024 })
                });
            },
            delete_organInfo: function(key) {
                $scope.constants.postData[key] = null;
            },
            tipShow: function(evt) {
                evt.stopPropagation();
                $(evt.target).find('.tippaopao').show();
            },
            tipHide: function(evt) {
                evt.stopPropagation();
                $(evt.target).find('.tippaopao').hide();
            },
        };
        $scope.constants = {
            pager: new Initpager('.M_box3_1', $scope.Fns.getPaymentList, getEachPageName($state)),
            organList: [
                { name: "个人商户", id: 1 },
                { name: "个体工商户", id: 3 },
                { name: "企业商户", id: 2 }
            ],
            navigation_bar_bgm: 1,
            dialogs: {}, //弹框数组
            postData: {},
            searchTime: '', //支付时间搜索
            paymentHead: [
                { 'name': '入账时间', 'width': '100px' },
                { 'name': '交易号', 'width': '130px' },
                { 'name': '学员姓名', 'width': '60px' },
                { 'name': '支付时间', 'width': '100px' },
                { 'name': '支付方式', 'width': '80px' },
                { 'name': '交易金额', 'width': '100px' },
                { 'name': '费率', 'width': '60px' },
                { 'name': '手续费', 'width': '86px' },
                { 'name': '入账金额', 'width': '86px' },
                { 'name': '订单号', 'width': '100px' }
            ],
            paymentHead_: [
                { 'name': '交易号', 'width': '140px' },
                { 'name': '学员姓名', 'width': '120px' },
                { 'name': '联系方式', 'width': '100px' },
                { 'name': '支付时间', 'width': '140px' },
                { 'name': '支付方式', 'width': '100px' },
                { 'name': '交易金额', 'width': '140px' },
                { 'name': '备注', 'width': '200px' },
                { 'name': '订单号', 'width': '100px' },
                { 'name': '经办人', 'width': '100px' },
                { 'name': '操作', 'align': 'center', 'width': '150px' },
            ],
            screen_way: [
                { name: '支付宝', id: '易收宝(支付宝)' },
                { name: '微信', id: '易收宝(微信)' }
            ],
            screen_type: [
                { name: '收款', id: 0 },
                { name: '退款', id: 1 },
            ],
            screen_source: [
                { name: "前台收款码", id: 5 },
                { name: "员工收款码", id: 6 },
                { name: "快速收款", id: 7 },
                { name: "商城购课", id: 1 },
                { name: "线下订单", id: 2 },
                { name: "订单推送", id: 3 },
                { name: "易枝独秀", id: 4 },
                { name: "购买优惠券", id: 8 },
            ],
            screen_handle: [],
            orderNavJud: 1,
            screenReset: {
                dayTab: '',
                searchName: '',
                dataFrom: '', //来源
                paymentMode: '', //支付方式
                refundsFlag: '', //交易状态
                associated: '', //关联订单标记
                credited: '', //入账标记
                handlerId: '', //经办人
            },
            common_obj: "",
            delteKeys: {
                'common': ['memberId', 'tellerId', 'contactName', 'contactIdNo', 'contactIdValidType', 'contactIdSDate', 'contactIdEDate', 'accountIdNo', 'accountIdValidType', 'accountIdSdate', 'accountIdEdate', 'contractNum', 'signName', 'signDate', 'signSdate', 'signEdate', 'archFlph07', 'archFlph08', 'archFlph13', 'archFlph14', 'shopId', 'smId', 'wxType', 'auditStatus', 'authorisationStatus', 'failureCause', 'deleteStatus', 'reqSerialNum', 'createTime', 'editTime'],
                5: ['archFlph02', 'archFlph03', 'subBankName', 'archFlph04', 'archFlph26'], //个体工商户
                9: ['merchName', 'isCreditCode', 'creditCode', 'licType', 'licSdate', 'licEdate', 'archFlph01', 'archFlph02', 'archFlph03', 'subBankName', 'archFlph04', 'archFlph26'], //个人
            },
            dateChangeKeys: ['licSdate', 'licEdate', 'idSdate', 'idEdate']
        };

        function getOrderCourseList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/order/getOrderCourseList",
                type: "get",
                data: { orderId: $scope.subInfo.orderInfo.orderId },
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context;
                        angular.forEach(list, function(v) {
                            v.repay = angular.copy(v.arrearage).toFixed(2);
                            $scope.payTotal += v.arrearage;
                        });
                        $scope.payTotal = $scope.payTotal.toFixed(2);
                        $scope.repayOrderCourseList = list;

                    }
                }
            });
        }

        function getHandlerList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/order/getHandlerList",
                type: "get",
                async: false,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.handlerList = data.context;
                    }
                }
            });
        }
        $scope.$on('充值-选择学员', function(e, data) {
            $scope.$broadcast('repay_select', 'clearHeadName');
            if (data) {
                $scope.repay = false;
                console.log(data)
                data.relation = relation(data.potentialCustomerParentType)
                $scope.subInfo = {
                    orderDesc: "",
                    orderDesc_out: "",
                    shopTeacherId: $scope.constants.common_obj.handler ? $scope.constants.common_obj.handler.shopTeacherId : "",
                    shopTeachName: $scope.constants.common_obj.handler ? $scope.constants.common_obj.handler.teacherName : '',
                    orderInfo: data,
                    clickHandler: function(x) {
                        this.shopTeacherId = x.shopTeacherId;
                    },
                    // 充值
                    submit: function() {
                        if (!this.shopTeacherId) return layer.msg('请选择经办人')
                        var params = {
                                "paymentBillId": $scope.constants.common_obj.paymentBillId,
                                "orderType": 6,
                                "potentialCustomerId": this.orderInfo.potentialCustomerId,
                                "remark": this.orderDesc ? this.orderDesc : undefined,
                                "externalRemark": this.orderDesc_out ? this.orderDesc_out : undefined,
                                "handlerId": this.shopTeacherId
                            },
                            _this = this;
                        $.hello({
                            url: CONFIG.URL + "/api/onlinePayment/associateRecord",
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == "200") {
                                    $scope.Fns.closePop();
                                    $scope.constants.pager.pagi_init(false);
                                    window.$rootScope.yznOpenPopUp($scope, 'order-info', 'orderInfo', '960px', {
                                        data: {
                                            orderId: data.context.orderId,
                                            orderType: _this.orderInfo.orderType
                                        },
                                        page: '订单管理'
                                    });
                                }
                            }
                        });
                    }
                }
                getHandlerList();
                $scope.Fns.layerOpen("rePay", '账户充值', "860");
            }
        });
        // 支付完成刷列表
        // $scope.$on('for_paytreasure', function(e, data) {
        //     if (data) {
        //         $scope.constants.pager.pagi_init(true);
        //     }
        // })
        $scope.Fns.getApply();
        $scope.closePopup = function() {
            layer.close(dialog);
            if (editor) {
                editor.remove();
            }
        }

    }]

});