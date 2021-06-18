define(['laydate', 'socketIo', 'qrcode', 'collectionPop'], function(laydate, socketIo) {
    creatPopup({
        el: 'orderInfo',
        openPopupFn: 'orderDetail',
        htmlUrl: './templates/popup/order_info.html',
        controllerFn: function($scope, props, SERVICE) {
            console.log(props);
            var props = angular.copy(props);
            var item = angular.copy(props.data);

            $scope.xufeiLength = 1;
            //          $scope.orderFrozen_miss=false;
            init();

            function init() {
                $scope.orderDetail_order_keshi = [];
                $scope.orderDetail_order_anqi = [];
                $scope.orderDetail_order_tian = [];
                $scope.potentialInfo = {}; //潜客信息
                $scope.isConfirmOrderPop = checkAuthMenuById("56"); //操作订单
                getStudentOrderDetail();
                $scope.orderType = item.orderType;
                $scope.page = angular.copy(props.page);
                $scope.toRepay = toRepay;
                $scope.printReceipt = printReceipt;
                $scope.mouseoverOd = mouseoverOd;
                $scope.mouseleaveOd = mouseleaveOd;
                $scope.mouseoverOd_ac = mouseoverOd_ac;
                $scope.mouseleaveOd_ac = mouseleaveOd_ac;
                $scope.deleteOrder = deleteOrder; //废除订单
                $scope.PayTypeList = getConstantList(CONSTANT.PAYTYPENEW);
                $scope.PayTypeList_ = getConstantList(CONSTANT.PRINTTYPENEW);
                $scope.isOnlinePayType = window.currentUserInfo.shop.auditStatus == 2 ? true : false; //是否开通了线上支付（易收宝）
                $scope.totalPay = totalPay; //全额付款
                $scope.viewRelationList = viewRelationList; //全额付款
                $scope.PayProjectList = {
                    'student': { 'paymentMode': '学员账户', 'paymentMoney': '0' },
                    'other': { 'paymentMode': $scope.isOnlinePayType ? '易收宝' : '支付宝', 'paymentMoney': '0' },
                };
                $scope.pay = {
                    receivable: 0.00,
                    received: 0.00,
                    arrearage: 0.00,
                };
                $scope.inputReceivable = 0.00;
                $scope.clickPayTypeIcon = function(d, evt) { //点击支付方式
                    if (d) {
                        $scope.PayProjectList['other']['paymentMode'] = d;
                    } else {
                        layer.tips('请开通易收宝后使用', $(evt.target), {
                            tips: 1,
                            fixed: true,
                        });
                    }
                };
                $scope.order_repay = order_repay; //确认补交信息
                $scope.clickHandler = clickHandler; //选择经办人
                $scope.repay_time = yznDateFormatYMdHms(new Date());
                $scope.getOrderConfmStatus = getOrderConfmStatus;
                $scope.confirOrder = confirOrder;
                $scope.recieveConfirm = recieveConfirm;
                $scope.showOrderConfirmBtn = showOrderConfirmBtn;
                $scope.limitMax = function(val) {
                    if (val.arrearage) {
                        if (val.repay * 1 > val.arrearage * 1) {
                            layer.msg('补交金额不能大于当前欠费金额 ');
                            val.repay = val.arrearage;
                        }
                        var total_ = 0;
                        angular.forEach($scope.repayOrderCourseList, function(item) {
                            total_ += item.repay;
                        });
                        // if (total_ == 0) {
                        //     layer.msg('补交金额不能为0');
                        // }
                    }
                }
                $scope.dateType = {
                    "5": "退课日期",
                    "1": "交费日期",
                    "2": "交费日期",
                    "3": "转课日期",
                    "6": "交费日期",
                    "7": "退款日期",
                    "11": "退款日期",
                    "12": "转校日期"
                };
                (function() {
                    laydate.render({
                        elem: ".repay_time",
                        max: yznDateFormatYMdHms(new Date()),
                        isRange: false,
                        type: "datetime",
                        trigger: 'click',
                        done: function(value) {
                            $scope.repay_time = value;
                        }
                    });
                })();
                $scope.$watch('PayProjectList', function() {
                    if ($scope.PayProjectList['student'].paymentMoney * 1 > $scope.potentialInfo.accountBalance) {
                        $scope.PayProjectList['student'].paymentMoney = 0;
                        layer.msg('输入金额不能大于学员账户余额');
                        return;
                    }
                    $scope.pay.receivable = ($scope.inputReceivable * 1 - $scope.PayProjectList["student"].paymentMoney * 1).toFixed(2);
                    $scope.pay.received = ($scope.inputReceivable * 1 - $scope.PayProjectList["student"].paymentMoney * 1).toFixed(2);
                    $scope.PayProjectList['other'].paymentMoney = ($scope.inputReceivable * 1 - $scope.PayProjectList["student"].paymentMoney * 1).toFixed(2);
                }, true)
                $scope.goCommonPop = function(x) {
                    window.$rootScope.yznOpenPopUp($scope, 'order-info', "orderInfo", "960px", { data: x, page: '关联订单' });
                }
            }

            function getAdviserList() {
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
                            $scope.adviserList = res.context;
                            $scope.$broadcast('orderAdviser', 'clearSatus');
                            if ($scope.otherFun.adviser) {
                                angular.forEach(res.context, function(v1) {
                                    angular.forEach($scope.otherFun.adviser, function(v2) {
                                        if (v1.shopTeacherId == v2.shopTeacherId) {
                                            v1.percentage = v2.percentage;
                                        }
                                    })
                                });
                                $scope.adviserList = [];
                                setTimeout(function() {
                                    $scope.adviserList = res.context;
                                    $scope.$broadcast('orderAdviser', 'reloadData', { 'data': $scope.otherFun.adviser, 'att': 'shopTeacherId' });
                                    $scope.$apply();
                                })
                            }
                        };
                    }
                });
            };

            function viewRelationList(id) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/getAssociatedOrder",
                    type: "get",
                    data: { 'orderId': id },
                    success: function(res) {
                        if (res.status == '200') {
                            var list = res.context;
                            for (var i = 0, len = list.length; i < len; i++) {
                                list[i].type = CONSTANT.ORDER_TYPE[list[i].orderType];
                            }
                            $scope.relationOrderList = list;
                            $scope.orderHref = GetRequest().protocol + "//" + GetRequest().host;
                            console.log($scope.orderHref);
                            $scope.goPopup("relation_orders", "760px");
                        }
                    }
                });
            }

            function GetRequest() {
                var protocol_ = location.protocol;
                var host_ = location.host;
                var requestObj = {
                    protocol: protocol_,
                    host: host_
                };

                return requestObj; //获取url中的域名;
            }
            //其他骚操作
            $scope.otherFun = {
                    operate: function(type, _da, sp) {
                        switch (type) {
                            case 1: //编辑顾问订单占比
                                $scope.otherFun.adviser = angular.copy($scope.orderDetail.studentOrderDivides);
                                openPopByDiv('修改占比', '.adviser_proportion', '660px');
                                getAdviserList();
                                break;
                            case 2: //选择顾问
                                var judHas = true,
                                    judHasIndex = null;
                                var judHasIndex = null;
                                angular.forEach($scope.otherFun.adviser, function(val, index) {
                                    if (val.shopTeacherId == _da.shopTeacherId) {
                                        judHas = false;
                                        judHasIndex = index;
                                    }
                                });
                                if (judHas) {
                                    $scope.otherFun.adviser.push(_da);
                                    _da.hasSelected = true;
                                } else {
                                    $scope.otherFun.adviser.splice(judHasIndex, 1);
                                    _da.hasSelected = false;
                                }
                                $scope.otherFun.operate(5);
                                break;
                            case 3: //删除顾问
                                $scope.otherFun.adviser.splice(sp, 1);
                                _da.hasSelected = false;
                                $scope.otherFun.operate(5);
                                break;
                            case 4: //关闭弹框
                                layer.close(dialog);
                                break;
                            case 5: //均分占比操作
                                var m1 = 0;
                                angular.forEach($scope.otherFun.adviser, function(v1, i1) {
                                    if (i1 == $scope.otherFun.adviser.length - 1) {
                                        v1.percentage = 100 - m1;
                                    } else {
                                        v1.percentage = parseInt(100 / $scope.otherFun.adviser.length);
                                        m1 += v1.percentage;
                                    }
                                });
                                break;
                        }
                    },
                    operateSubmit: function(type, _da) {
                        switch (type) {
                            case 1: //提交确定顾问占比
                                var a_ = [];
                                angular.forEach($scope.otherFun.adviser, function(v1) {
                                    a_.push({ 'shopTeacherId': v1.shopTeacherId, 'percentage': v1.percentage });
                                });
                                $.hello({
                                    url: CONFIG.URL + "/api/oa/order/updateDivide",
                                    type: "post",
                                    data: JSON.stringify({ 'orderId': $scope.orderDetail.orderId, 'studentOrderDivides': a_ }),
                                    success: function(res) {
                                        if (res.status == 200) {
                                            console.log(res);
                                            $scope.orderDetail.studentOrderDivides = $scope.otherFun.adviser;
                                            layer.msg('操作成功');
                                            layer.close(dialog);
                                        };
                                    }
                                });
                                break;
                        }
                    }
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
                        }
                    }
                });
            }

            /*
             根据权限以及订单状态，判断是否显示确定订单按钮
             */
            function showOrderConfirmBtn() {
                if (!$scope.orderDetail || $scope.orderDetail.confirmStatus != 0) {
                    return false;
                }

                if (checkAuthMenuById("56")) {
                    return true;
                }

                return false;
            }
            /*
             按月按期数据分类
             */
            function typeData(arr, fl) {
                var data = { arr1: [], arr2: [] };
                if (!arr || arr.length == 0) { return data; }
                var arr3 = [];
                angular.forEach(arr, function(item) {
                    if (fl) { //转出 退课 续费单叠加
                        if (item.feeType == 2) { //按月续费单累加
                            if (data.arr2.length !== 0) {
                                data.arr2[0].surplusTime += item.surplusTime ? item.surplusTime : 0;
                                data.arr2[0].surplusGiveTime += item.surplusGiveTime ? item.surplusGiveTime : 0;
                                data.arr2[0].surplusFee += item.surplusFee ? item.surplusFee : 0;
                                if (!data.arr2[0].serviceChange) data.arr2[0].serviceChange = 0;
                                data.arr2[0].serviceChange += item.serviceChange ? item.serviceChange : 0;
                                data.arr2[0].amount += item.amount ? item.amount : 0;
                            } else {
                                data.arr2.push(angular.copy(item));
                            }
                        } else if (item.feeType == 1) { //按期续费单累加
                            if (arr3.length == 0) {
                                arr3.push(angular.copy(item));
                            } else {
                                var diff = false;
                                angular.forEach(arr3, function(ceil) {
                                    if ((item.schoolYear == ceil.schoolYear) && (item.schoolTermName == ceil.schoolTermName)) {
                                        ceil.surplusTime += item.surplusTime ? item.surplusTime : 0;
                                        ceil.surplusGiveTime += item.surplusGiveTime ? item.surplusGiveTime : 0;
                                        ceil.surplusFee += item.surplusFee ? item.surplusFee : 0;
                                        if (!ceil.serviceChange) ceil.serviceChange = 0;
                                        ceil.serviceChange += item.serviceChange ? item.serviceChange : 0;
                                        ceil.amount += item.amount ? item.amount : 0;
                                    } else {
                                        diff = true;
                                    }
                                })
                                if (diff) arr3.push(angular.copy(item));
                            }
                        } else { //课时续费单累加
                            if (data.arr1.length !== 0) {
                                data.arr1[0].outHour += item.outHour ? item.outHour : 0;
                                data.arr1[0].returnGiveTime += item.returnGiveTime ? item.returnGiveTime : 0;
                                data.arr1[0].returnMoney += item.returnMoney ? item.returnMoney : 0;
                                if (!data.arr1[0].serviceChange) data.arr1[0].serviceChange = 0;
                                data.arr1[0].serviceChange += item.serviceChange ? item.serviceChange : 0;
                                data.arr1[0].amount += item.amount ? item.amount : 0;
                            } else {
                                data.arr1.push(angular.copy(item));
                            }
                        }
                    } else {
                        if (item.feeType == 2) {
                            data.arr2.push(item);
                        } else {
                            data.arr1.push(item)
                        }
                    }
                });
                if (fl) data.arr1 = data.arr1.concat(arr3);
                return data;
            }

            function getStudentOrderDetail() {
                $scope.arr_time = [];
                $scope.arr_mouth = [];
                $scope.arr_time_out = [];
                $scope.arr_mouth_out = [];
                var params = {
                    "orderId": props.page == "关联订单" ? item.originalOrderId : (item.orderId || item.studentOrder.orderId)
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/getStudentOrderDetail",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.potentialInfo = data.context.studentInfo;
                            $scope.orderDetail = data.context;
                            if (data.context.orderType == 3 || data.context.orderType == 4 || data.context.orderType == 5 || data.context.orderType == 12) {
                                var list = [];
                                $scope.orderDetail_order_keshi = data.context.map.hour.concat(data.context.map.period);
                                $scope.orderDetail_order_tian = data.context.map.month;
                                list = data.context.map.hour.concat(data.context.map.period).concat(data.context.map.month);
                                if (data.context.orderType == 3 || data.context.orderType == 12) {
                                    $scope.orderDetail.outOrderCourseList = list;
                                } else {
                                    $scope.orderDetail.orderCourseList = list;
                                }
                            }

                            $scope.orderType = $scope.orderDetail.orderType ? $scope.orderDetail.orderType : $scope.orderType; //订单类型
                            console.log(data.context.studentInfo);
                            //                       if(props.sourceType == 0 && data.context.studentInfo){
                            //                          if(data.context.studentInfo.potentialCustomerStatus == 1 || data.context.studentInfo.potentialCustomerStatus == 3){
                            //                              $scope.orderFrozen_miss=true;
                            //                          }
                            //                       }else{
                            //                            $scope.orderFrozen_miss=false;
                            //                       }
                            $scope.isTip = currentType(); //小票or收据
                            $scope.tipData = $scope.isTip.getTipData;
                            if ($scope.tipData.orderType < 6 || $scope.tipData.orderType == 12) {
                                if ($scope.tipData.orderCourseList) {
                                    var dataObj = typeData($scope.tipData.orderCourseList, $scope.tipData.orderType == 5); //转入课程
                                    $scope.arr_time = dataObj.arr1;
                                    $scope.arr_mouth = dataObj.arr2;
                                }
                                if ($scope.tipData.outOrderCourseList) {
                                    var dataObj_ = typeData($scope.tipData.outOrderCourseList, true); //转出课程
                                    $scope.arr_time_out = dataObj_.arr1;
                                    $scope.arr_mouth_out = dataObj_.arr2;
                                }

                            }
                            $scope.orderDetail.type = CONSTANT.ORDER_TYPE[data.context.orderType];
                            $scope.relation = data.context.studentInfo;
                            $scope.relation.type = relation(data.context.studentInfo.potentialCustomerParentType);
                            $scope.relation.typeTwo = relation(data.context.studentInfo.potentialCustomerParentTowType);
                            $scope.relation.typeThree = relation(data.context.studentInfo.potentialCustomerParentThreeType);
                            if (data.context.orderPaymentList) {
                                var n = 0;
                                angular.forEach(data.context.orderPaymentList, function(v) {
                                    if (v.paymentMode == "学员账户") {
                                        n += v.paymentMoney * 1;
                                    }
                                });
                                $scope.orderDetail.studentAccount = n;
                            }
                        }
                    }
                })
            }

            /*
             收据打印
             */
            function printReceipt() {
                $scope.goPopup("printrecript", "890px", "收据打印");
                // 获取基础信息
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/getBillSettingInfo',
                    type: 'get',
                    // data: params,
                    success: function(data) {
                        if (data.status == "200") {
                            try {
                                $scope.billInfo = data.context;

                            } catch (e) {}

                        }

                    }
                });
            }

            /*
             收据类型
             */
            function currentType() {
                return {
                    flag: localStorage.getItem("printhobby") || 0,
                    // radio不能确定当前是否为选中,保存id值
                    el: "tip",
                    click: function($event) {
                        switch ($event.target.id) {
                            case "tip":
                                this.flag = 0;
                                break;
                            case "receipt":
                                this.flag = 1;
                                break;
                            default:
                                this.flag = 2;
                        }

                    },
                    payments: init_2(),
                    // 转化金额格式
                    changeStyle: function(val) {
                        return Math.abs(val);
                    },
                    // 转课应收/应退
                    sumChange: function(out, enter) {
                        var outall = 0,
                            enterall = 0;
                        angular.forEach(out, function(item) {
                            if (item.serviceChange) {
                                outall += (item.coursePrice - item.arrearage - item.serviceChange)
                            } else {
                                outall += (item.coursePrice - item.arrearage)
                            }
                        });
                        angular.forEach(enter, function(item) {
                            enterall += item.coursePrice
                        });
                        return enterall - outall
                    },
                    // 转课实收/实退
                    infect: function(cords) {
                        var all = 0,
                            arr = init_2();
                        angular.forEach(cords, function(item) {
                            if (arr.indexOf(item.paymentMode) > -1) {
                                all += item.paymentMoney
                            }
                        });
                        return all;
                    },
                    //iframe打印
                    iframeprint: function(printHTML) {
                        //判断iframe是否存在，不存在则创建iframe
                        var iframe = document.getElementById("print-iframe");
                        if (!iframe) {
                            iframe = document.createElement('IFRAME');
                            var doc = null;
                            iframe.setAttribute("id", "print-iframe");
                            iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
                            document.body.appendChild(iframe);
                            doc = iframe.contentWindow.document;
                            doc.write(
                                '<style type="text/css">\n' +
                                '@page{margin:0;}\n' +
                                'body{height:auto !important;margin:0;padding: 0;background:white !important;color:#000 !important;}\n' +
                                '@media print {.non-printing {display: none;}}\n' +
                                '</style>' +
                                '<LINK rel="stylesheet" href="libs/bootstrap/bootstrap.min.css">' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/font-css.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/css/global.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/common.css"/>' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/zj.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/new-szp.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/zxl.css"/>' +
                                '<LINK rel="stylesheet" type="text/css" href="static/css/css.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/cz.css"/>'
                            );
                            doc.write(printHTML);
                            doc.close();
                            iframe.contentWindow.focus();
                        } else {
                            iframe.contentWindow.document.body.innerHTML = "";
                            iframe.contentWindow.document.write(
                                '<style type="text/css">\n' +
                                '@page{margin:0;}\n' +
                                'body{height:auto !important;margin:0;padding: 0;background:white !important;color:#000 !important;}\n' +
                                '@media print {.non-printing {display: none;}}\n' +
                                '</style>' +
                                '<LINK rel="stylesheet" href="libs/bootstrap/bootstrap.min.css">' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/font-css.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/css/global.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/common.css"/>' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/zj.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/new-szp.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/zxl.css"/>' +
                                '<LINK rel="stylesheet" type="text/css" href="static/css/css.css" />' +
                                '<LINK rel="stylesheet" type="text/css" href="static/style/cz.css"/>'
                            );
                            iframe.contentWindow.document.write(printHTML);
                            iframe.contentWindow.document.close();
                        }
                        // history.pushState(null, null, document.URL);
                        //监听打印结束事件，移除iframe避免一直暂用资源
                        iframe.contentWindow.onafterprint = function() {
                            console.log("#####contentWindow onafterprint");
                            document.body.removeChild(iframe);
                        }

                        var iframeLoad = function() {
                            window.setTimeout(function() {
                                if (iframe.contentWindow) {
                                    iframe.contentWindow.focus();
                                    iframe.contentWindow.print();
                                }
                            }, 100);
                            iframe.removeEventListener("load", iframeLoad, true);
                        };
                        iframe.addEventListener('load', iframeLoad, true);
                    },
                    print: function() {
                        var printHtml = $('#printArea').prop("outerHTML");
                        if ($scope.isTip.flag == 0) {
                            printHtml = printHtml.replace('receipt_wrap', 'receipt_wrap border_0');
                        } else {
                            printHtml = printHtml.replace('a4_wrap', 'a4_wrap border_0');
                        }
                        localStorage.setItem("printhobby", $scope.isTip.flag); //打印偏好
                        this.iframeprint(printHtml);
                    },
                    getTipData: $scope.orderDetail,
                    numFor: function(num) {
                        return num.substring(0, 3) + "****" + num.substring(7, num.length)
                    }
                }
            }

            function init_2() {
                var data = [];
                angular.forEach($scope.PayTypeList_, function(item) {
                    data.push(item.name);
                })
                return data;
            }

            function toRepay() {
                $scope.orderDesc = angular.copy($scope.orderDetail.remark);
                $scope.orderDesc_out = angular.copy($scope.orderDetail.externalRemark);
                $scope.payTotal = 0;
                $scope.PayProjectList.student.paymentMoney = ''; //再次打开清空之前的所填账户金额
                $scope.shopTeacherId = localStorage.getItem('shopTeacherId');
                $scope.shopTeachName = localStorage.getItem('userName');
                getHandlerList();
                getOrderCourseList();
                getPotentialInfo($scope.potentialInfo.potentialCustomerId);
                $scope.goPopup("rePay", "890px", "补交学费");
                $scope.$watch("repayOrderCourseList", function() {
                    $scope.pay = {
                        receivable: 0.00,
                        received: 0.00,
                        arrearage: 0.00
                    };
                    $scope.inputReceivable = 0.00;
                    angular.forEach($scope.repayOrderCourseList, function(v) {
                        //                      $scope.pay.receivable += v.arrearage*1;
                        $scope.inputReceivable += v.repay * 1;
                    });
                    $scope.pay.receivable = ($scope.inputReceivable * 1 - $scope.PayProjectList["student"].paymentMoney * 1).toFixed(2);
                    $scope.pay.received = ($scope.inputReceivable * 1 - $scope.PayProjectList["student"].paymentMoney * 1).toFixed(2);
                    $scope.pay.arrearage = ($scope.payTotal * 1 - $scope.inputReceivable * 1).toFixed(2);
                    $scope.PayProjectList['other'].paymentMoney = ($scope.inputReceivable * 1 - $scope.PayProjectList["student"].paymentMoney * 1).toFixed(2);
                }, true);
            }

            function getOrderCourseList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/getOrderCourseList",
                    type: "get",
                    data: { orderId: $scope.orderDetail.orderId },
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

            function mouseoverOd($event) {
                if ($scope.relation.potentialCustomerParentTowPhone || $scope.relation.potentialCustomerParentThreePhone) {
                    $($event.target).closest(".parent").find(".openPop").show();
                }
            }

            function mouseleaveOd($event) {
                $($event.target).closest(".parent").find(".openPop").hide();
            }

            function mouseoverOd_ac($event, id, list) {
                $($event.target).find(".openPop").hide();
                var e = $($event.currentTarget),
                    offtot = e.offset().top,
                    offleft = e.offset().left,
                    width = e.width(),
                    initleft = $('#orderInfo').offset().left,
                    scrollTop = e.closest('.layer_msk') ? e.closest('.layer_msk').scrollTop() : 0;
                if (id) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/activity/getActivityDetailById",
                        type: "get",
                        data: { activityId: id },
                        success: function(data) {
                            if (data.status == '200') {
                                var name = data.context.activityName;
                                angular.forEach(list, function(v) {
                                    if (id == v.activityId) {
                                        v.activityName = name;
                                    }
                                });
                                console.log(list);
                            };
                        }
                    });

                    e.find('.openPop').css({
                        'top': offtot + scrollTop - 15,
                        'left': offleft - initleft - 15,
                    }).show();
                }
            }

            function mouseleaveOd_ac($event) {
                $(".openPop").hide();
                //              $($event.target).find(".openPop").hide();
            }

            function deleteOrder() {
                var msg = '<div>订单废除后将无法恢复，是否废除？</div>';
                var delFn = function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/abolishOrder",
                        type: "POST",
                        data: JSON.stringify({
                            'orderId': props.data.orderId || props.data.studentOrder.orderId
                        }),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功废除订单', {
                                    icon: 1
                                });
                                getStudentOrderDetail();
                                $scope.$emit("reloadOrderList", "刷新订单列表");
                            };
                        }
                    })
                }
                var isConfirm = layer.confirm(msg, {
                    title: "确认废除信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    layer.close(isConfirm);
                    if ($scope.orderDetail.orderPaymentList) {
                        var isAgain = $scope.orderDetail.orderPaymentList.some(function(item) {
                            return item.paymentMode.indexOf('易收宝') !== -1;
                        })
                    }
                    if (isAgain) {
                        var onceConfirm = layer.confirm('该订单包含易收宝交易流水。废除后，易收宝交易金额不直接原路退回。您可以重新关联交易流水或单独对交易流水进行退款。', {
                            title: "确认废除信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['确定', '取消'] //按钮
                        }, function() {
                            delFn();
                        }, function() {
                            layer.close(onceConfirm);
                        })
                    } else {
                        delFn();
                    }
                }, function() {
                    layer.close(isConfirm);
                })
            }

            function confirOrder() {
                var isConfirm = layer.confirm('是否确认订单？', {
                    title: "确认订单信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/updateConfirmStatus",
                        type: "get",
                        data: {
                            'orderId': item.orderId
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功确认订单', {
                                    icon: 1
                                });
                                getStudentOrderDetail();
                                $scope.$emit("orderInfoChange", "确认订单");
                            };
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })
            }

            function recieveConfirm() {
                detailMsk("学杂是否已领取，确认后不可还原！", function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/order/updateCheckStatus",
                        type: "post",
                        data: JSON.stringify({ orderId: item.orderId }),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功确认领取', {
                                    icon: 1
                                });
                                getStudentOrderDetail();
                                $scope.$emit("orderInfoChange", "确认订单");
                                $scope.$emit("reloadOrderList", "刷新订单列表");
                            }

                        }
                    })
                });
            }

            function totalPay(index) {
                $scope.PayProjectList['other'].paymentMoney = (Math.abs($scope.pay.received).toFixed(2) - $scope.PayProjectList['student'].paymentMoney).toFixed(2);
            }

            function clickHandler(x) {
                $scope.shopTeacherId = x.shopTeacherId;
            }

            function getPayCourseList() {
                var arr = [];
                angular.forEach($scope.repayOrderCourseList, function(v) {
                    if (v.arrearage > 0) {
                        arr.push({
                            "courseName": v.courseName, // 课程名称
                            "contractRenewId": v.contractRenewId, // 续费单id
                            "amount": v.repay, // 补交金额
                        });
                    }
                });
                return arr;
            }

            function order_repay() {
                var total_ = 0;
                angular.forEach($scope.repayOrderCourseList, function(item) {
                    total_ += item.repay;
                });
                if (total_ == 0) {
                    layer.msg('补交金额不能为0');
                    return;
                }
                var isOnLinePayPro = [false, 0],
                    _url = '/api/oa/order/payStudentOrder'; //线上支付数据
                var PayProjectList = $scope.PayProjectList['other']['paymentMoney'] * 1 ? [$scope.PayProjectList['other']] : [];
                if ($scope.PayProjectList['student'].paymentMoney * 1) { //如果有学员账户的钱
                    PayProjectList.push($scope.PayProjectList['student']);
                }
                var params = {
                    "orderId": $scope.orderDetail.orderId,
                    "remark": $scope.orderDesc,
                    "externalRemark": $scope.orderDesc_out,
                    "handlerId": $scope.shopTeacherId,
                    "orderPaymentList": PayProjectList,
                    "orderCourseList": getPayCourseList(),
                    "paymentTime": $scope.repay_time
                };
                if ($scope.pay.received * 1 > $scope.payTotal * 1) {
                    layer.msg("补交金额不能大于欠费金额");
                    return;
                }
                if ($scope.PayProjectList.student.paymentMoney * 1 > $scope.inputReceivable * 1) {
                    layer.msg("使用余额不能大于补交金额");
                    return;
                }
                for (var i in params) {
                    if (params[i] == "" || params[i] == undefined) {
                        delete params[i];
                    }
                }
                if ($scope.PayProjectList['other'].paymentMode == '易收宝' && $scope.PayProjectList['other'].paymentMoney * 1) isOnLinePayPro = [true, $scope.PayProjectList['other'].paymentMoney * 1];

                if (isOnLinePayPro[0]) { //小白盒支付
                    _url = '/api/onlinePayment/payOrder';
                    params['payType'] = 'oa';
                    params['orderType'] = 4;
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
                                            layer.msg('补交成功', { icon: 1 });
                                            fn('close');
                                            if ($scope.f5Id) {
                                                getStudentOrderDetail();
                                                if (props.page == "收支明细") {
                                                    SERVICE.PAYMENT.getPayment();
                                                } else {
                                                    if (SERVICE.ORDER.getOrderlist) {
                                                        SERVICE.ORDER.getOrderlist();
                                                    }
                                                }
                                                $scope.$emit("orderInfoChange");
                                                $scope.closePopup('rePay');
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
                                        layer.msg('补交成功', { icon: 1 });
                                        fn('close');
                                        if ($scope.f5Id) {
                                            getStudentOrderDetail();
                                            if (props.page == "收支明细") {
                                                SERVICE.PAYMENT.getPayment();
                                            } else {
                                                if (SERVICE.ORDER.getOrderlist) {
                                                    SERVICE.ORDER.getOrderlist();
                                                }
                                            }
                                            $scope.$emit("orderInfoChange");
                                            $scope.closePopup('rePay');
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
                    window.$rootScope.yznOpenPopUp($scope, 'collection-pop', 'collection_pay', '560px', { emit: 'for_repay', paymentMoney: isOnLinePayPro[1] });
                    if (!$scope.$$listeners['for_repay']) {
                        $scope.$on('for_repay', function(e, data) {
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
                                console.log(data);
                                layer.msg('补交成功', { icon: 1 });
                                getStudentOrderDetail();
                                $scope.$emit("orderInfoChange");
                                if (props.page == "收支明细") {
                                    SERVICE.PAYMENT.getPayment();
                                } else {
                                    if (SERVICE.ORDER.getOrderlist) {
                                        SERVICE.ORDER.getOrderlist();
                                    }
                                }
                                $scope.closePopup('rePay');
                            }
                        }
                    });
                }
            }

            function getOrderConfmStatus(x) {
                var str = CONSTANT.ORDERCONFIRMINFO[x];
                return str;
            }
        }
    });
});