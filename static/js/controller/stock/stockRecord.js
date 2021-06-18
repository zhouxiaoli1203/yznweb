define(['laydate', 'pagination', 'mySelect'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type = search_name = goodsId = goodsSpecId = handler = $type = undefined;
        $scope.unCheck = $scope.unReturn = $scope.unDetele = false;
        var search_orderName = "outInTime",
            search_orderTyp = "desc";
        $scope.select_params = [];
        init();

        function init() {
            getGoods(); //获取物品列表
            getHandler(); //经办人
            $scope.studNavJud = 2;
            $scope.selectInfoNameId = 'stockRecordDesc'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                stockRecordDesc: '备注',
            };
            //表头
            $scope.recordListThead = [
                { name: 'checkbox', width: '50', align: 'center' },
                {
                'name': '物品名称',
                'width': '20%'
            }, {
                'name': '时间',
                'width': '15%',
                'issort': true
            }, {
                'name': '备注',
                'width': '15%'
            }, {
                'name': '类型',
                'width': '15%'
            }, {
                'name': '状态',
                'width': '15%'
            }, {
                'name': '经办人',
                'width': '10%'
            }, {
                'name': '操作',
                'width': '10%',
                'align': 'center'
            }, ];
            $scope.typeList = [
                { name: "手动出库", value: "1" },
                { name: "手动入库", value: "0" },
                { name: "清点", value: "3" },
                { name: "订单出库", value: "2" },
                { name: "订单入库", value: "5" },
                { name: "兑换礼品", value: "4" },
                { name: "转介绍奖励", value: "6" },
            ];
            $scope.operateStorage = checkAuthMenuById("91"); //操作库存
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.searchByGoods = searchByGoods;
            $scope.searchBySpec = searchBySpec;
            $scope.searchByTeach = searchByTeach;
            $scope.sortCllict = sortCllict;
            $scope.changeType = changeType;
            $scope.changeStatus = changeStatus;
            $scope.orderDetail = orderDetail;
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop; //关闭弹框
            $scope.deleteStorage = deleteStorage; //废除
            $scope.confirmRecive = confirmRecive; //确认领取
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            $scope.batchOperate = batchOperate;//批量操作
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    recordList(0);
                }
            });
            $scope.sel_allFun = function(c) {
                checkboxAllFun(c, $scope.recordPageList, $scope.select_params, 'stockRecordId', true);
            }
            recordList(0);
        }
        $scope.$on("reloadStock", function(e, startPage) {
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
            if (startPage) {
                recordList(start);
            } else {
                pagerRender = false;
                recordList(0);
            }
        });
        function closePop() {
            layer.close(dialog);
        }

        function switchStudNav(n) {
            $scope.studNavJud = n;
            search_type = search_name = goodsId = goodsSpecId = handler = $type = undefined;

            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $state.go("stock", {});
            } else {
                $state.go("stock/record", {});
            }
        }

        function searchdata(d) {
            pagerRender = false;
            search_type = d ? d.type : null;
            search_name = d ? d.value : null;
            recordList(0);
        }

        function searchByGoods(n) {
            goodsId = n ? n.goodsId : undefined;
            $scope.screen_goReset['screenClear']('');
            $scope.speclist = [];
            goodsSpecId = undefined;
            if (goodsId) {
                getSpec(goodsId, function(data) {
                    $scope.speclist = data;
                });
            }
            pagerRender = false;
            recordList(0);
        }

        function searchBySpec(n) {
            goodsSpecId = n ? n.goodsSpecId : undefined;
            pagerRender = false;
            recordList(0);
        }

        function searchByTeach(n) {
            handler = n ? n.shopTeacherId : undefined;
            pagerRender = false;
            recordList(0);
        }

        function sortCllict(data) {
            search_orderTyp = data.sort;
            pagerRender = false;
            recordList(0);
        }

        function changeType(n) {
            $type = n ? n.value : undefined;
            pagerRender = false;
            recordList(0);
        }

        function getSpec(id, fn) {
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/goodsSpec/list",
                type: "get",
                data: { goodsId: id, needUnclaimedNum: "1" },
                success: function(data) {
                    if (data.status == '200') {
                        fn(data.context)
                    }

                }
            })
        }

        function changeStatus(num) {
            if (num == 1) {
                if ($scope.unCheck) {
                    $scope.unReturn = $scope.unDetele = false;
                }
            } else if (num == 2) {
                if ($scope.unReturn) {
                    $scope.unCheck = $scope.unDetele = false;
                }
            } else if (num == 3) {
                if ($scope.unDetele) {
                    $scope.unReturn = $scope.unCheck = false;
                }
            }
            pagerRender = false;
            recordList(0);
        }

        function onReset() {
            search_type = search_name = goodsId = goodsSpecId = handler = $type = undefined;
            $scope.searchTime = "";
            //          search_orderTyp="desc";
            $scope.unCheck = $scope.unReturn = $scope.unDetele = false;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false;
            recordList(0);
        }

        function getGoods() {
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/list",
                type: "get",
                data: { pageType: "0", goodsStatus: "1", goodsType: "1" },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.goodslist = data.context;
                    }

                }
            })
        }

        function getHandler() {
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

        function recordList(start_) { //获取请假补课列表信息
            start = start_ == 0 ? "0" : start_;
            var param = {
                "start": start_.toString() || "0",
                "count": eachPage,
                'searchType': search_type,
                "searchName": search_name,
                "stockRecordType": $type,
                "unCheck": $scope.unCheck ? "0" : undefined,
                "unReturn": $scope.unReturn ? "0" : undefined,
                "recordStatus": $scope.unDetele ? "1" : undefined,
                "goodsId": goodsId,
                'goodsSpecId': goodsSpecId,
                "shopTeacherId": handler,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "infoStatus": "1"
            }
            if ($scope.searchTime) {
                param["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                param["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/stock/list",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        angular.forEach(data.context.items, function(v) {
                            v.goodsStr = "";
                            angular.forEach(v.stockRecordGoodsList, function(y) {
                                if (v.stockRecordType == 1 || v.stockRecordType == 2 || (v.stockRecordType == 3 && v.recordMode == 0) || v.stockRecordType == 4 || v.stockRecordType == 6) {
                                    v.goodsStr += y.goods.goodsName + (y.goodsSpec ? ('*' + y.goodsSpec.name) : '') + "-" + y.num + "；";
                                } else {
                                    v.goodsStr += y.goods.goodsName + (y.goodsSpec ? ('*' + y.goodsSpec.name) : '') + "+" + y.num + "；";
                                }
                            });
                            v.goodsStr = v.goodsStr.substr(0, v.goodsStr.length - 1);
                        });
                        $scope.recordPageList = data.context.items;
                        repeatLists($scope.recordPageList, $scope.select_params, 'stockRecordId');
                        leavePager(data.context.totalNum);
                    }

                }
            })
        }

        function leavePager(total) { //分页
            var len = 0;
            angular.forEach($scope.recordPageList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.recordPageList.length > 0 && $scope.recordPageList.length == len) {
                $scope.resetCheckboxDir(true);
            } else {
                $scope.resetCheckboxDir(false);
            }
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
            var $M_box3 = $('.M-box3');

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
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    recordList(start); //回调
                }
            });
        }
        function batchOperate(n) {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择物品");
            }

            switch (n) {
                case 1:
                    confirmRecive($scope.select_params, false, "领取",null,"批量");
                    break;
                case 2:
                    confirmRecive($scope.select_params, false, "归还",null,"批量");
                    break;
                default:
                    break;
            }
        }
        function orderDetail(x, fl) {
            if (!$scope.operateStorage) {
                return false;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/stock/info",
                type: "get",
                data: { stockRecordId: x.stockRecordId },
                success: function(data) {
                    if (data.status == '200') {
                        data.context.goodsStr = data.context.stockRecordGoodsList && data.context.stockRecordGoodsList.length ? (data.context.stockRecordGoodsList[0].goods.goodsName + (data.context.stockRecordGoodsList[0].goodsSpec ? ('*' + data.context.stockRecordGoodsList[0].goodsSpec.name) : '')) : '';
                        $scope.orderInfo = data.context;
                        if (fl) return;
                        var title = "记录详情";
                        if (data.context.recordStatus == "1") {
                            title += '<span class="color_nameState">（已废除）</span>';
                        }
                        openPopByDiv(title, ".orderDetail", "760px");
                    }

                }
            })
        }

        function deleteStorage(x, from) {
            detailMsk("记录废除后将无法还原，确认废除？", function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/stock/abolish",
                    type: "post",
                    data: JSON.stringify({ stockRecordId: x.stockRecordId }),
                    success: function(data) {
                        if (data.status == '200') {
                            pagerRender = false;
                            recordList(0);
                            if (from == "pop") {
                                closePop();
                            }
                        }

                    }
                })
            });
        }

        function confirmRecive(x, from, type, fl, isBatch) {
            $scope.isBatch = isBatch;
            $scope.confirmType = type;
            $scope.startTime = yznDateFormatYMdHms(new Date());
            if (isBatch) {
                $scope.confirmRecive_data = {};
            } else {
                $scope.confirmRecive_data = angular.copy(x);
            }
            $scope.screen_goReset['confirmReciveSel'](window.currentUserInfo.teacherName);
            $scope.confirmRecive_data.shopTeacherId = window.currentUserInfo.shopTeacherId;

            $scope.confirmRecive_click = function(n) {
                $scope.confirmRecive_data.shopTeacherId = n ? n.shopTeacherId : undefined;
            };
            laydate.render({
                elem: '#startTime', //指定元素
                isRange: false,
                type: "datetime",
                format: 'yyyy-MM-dd HH:mm:ss',
                done: function(value) {
                    $scope.startTime = value;
                }
            });
            openPopByDiv("确认" + type, ".confirm_pop", "560px");

            $scope.confirm_btn = function() {
                if (!$scope.confirmRecive_data.shopTeacherId) {
                    return layer.msg('请选择经办人')
                }

                var param = {
                    stockRecordId: x.stockRecordId,
                    shopTeacherId: $scope.confirmRecive_data.shopTeacherId,
                    outInTime: $scope.startTime
                };
                var url = "/api/oa/stock/updateCheckStatus";
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            //                          pagerRender = false;
                            recordList(start);
                            closePop();
                            if (fl) orderDetail($scope.orderInfo, true);
                            if (from == "pop") {
                                closePop();
                            }
                        }

                    }
                })
            }
            $scope.confirm_btns = function() {
                if (!$scope.confirmRecive_data.shopTeacherId) {
                    return layer.msg('请选择经办人')
                }
                var list = $scope.select_params;
                var arr = [];
                angular.forEach(list, function(val) {
                    if (val.hasChecked) {
                        arr.push(val.stockRecordId);
                    }
                });
                var param = {
                    stockRecordType:$scope.confirmType=="领取"?"2":"5",
                    shopTeacherId: $scope.confirmRecive_data.shopTeacherId,
                    outInTime: $scope.startTime,
                    idList:arr
                };
                var url = "/api/oa/stock/updateCheckStatusList";
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg(type + "成功", {
                                icon: 1
                            });
                            recordList(start);
                            closePop();
                        }
                        if (data.status != 200) {
                            if (data.message && data.message.length > 0) {
                                layer.alert(data.message, { title: '错误提示', shadeClose: true, zIndex: 19930113 }, function () {
                                    recordList(start);
                                    layer.closeAll();
                                });
                            }
                        }
                        return true;
                    }
                })
            }
        }
    }]
})