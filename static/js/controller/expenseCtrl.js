define(["laydate", "pagination", "jqFrom", "mySelect", "expensePop", 'photoPop','importPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchName, shopCostTypeId, payType = undefined;
        $scope.type0 = $scope.type1 = false;
        $scope.searchTime = "";
        $scope.expenseDetail = {};


        // $scope.preSetClassifyFn2 = preSetClassifyFn2;
        // function preSetClassifyFn2(ddd) {
        //     // $scope.complileDirectie('<expense-pop></expense-pop>');
        //     // $timeout(function() {
        //     //     $scope.preSetClassifyFn('preSetClassify', '760px', {});
        //     // }, 1,true);
        //
        //     $scope.yznOpenPopUp($scope, 'expense-pop',  'preSetClassify', '760px', {});
        //
        //     $timeout(function() {
        //         $scope.yznOpenPopUp($scope, 'expense-pop', 'preSetClassify', '760px', {});
        //     }, 1000,true);
        //
        //
        // }
        init();


        function init() {
            getClassifyList();
            getHandlerList();
            $scope.orderListThead = [{
                'name': '费用名称',
                'width': '186',
            }, {
                'name': '费用分类',
                'width': '136',
            }, {
                'name': '收支方式',
                'width': '9%',
            }, {
                'name': '金额',
                'width': '90',
                'align': 'right',
            }, {
                'name': '时间',
                'width': '150',
                'align': 'center',
            }, {
                'name': '经办人',
                'width': '90',
            }, {
                'name': '费用凭证',
                'width': '90',
            }, {
                'name': '备注',
                'width': '215',
            }, {
                'name': '操作',
                'align': 'center',
                'width': '130',
            }];
            $scope.payTypeObj = [
                { val: 0, name: '支付宝' },
                { val: 1, name: '微信' },
                { val: 2, name: '现金' },
                { val: 3, name: '网银转账' },
                { val: 4, name: 'POS机刷卡' },
            ];
            $scope.kindSearchData = {
                shopCostRecordDesc: "费用名称、备注",
            };
            $scope.operateExpense = checkAuthMenuById("95"); //操作费用收支
            $scope.isDaochu = checkAuthMenuById("149"); //导出费用
            $scope.PayTypeList = getConstantList(CONSTANT.PAYTYPENEW);
            $scope.selectInfoNameId = "shopCostRecordDesc";
            $scope.openExpenseRecd = openExpenseRecd; //打开费用记录弹出框
            $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
            $scope.SearchData = SearchData; //按钮搜索
            $scope.searchByExpense = searchByExpense;
            $scope.searchByType = searchByType;
            $scope.searchChangeType = searchChangeType; //费用收支类型
            $scope.onReset = onReset;
            $scope.closePop = closePop;
            $scope.expense_record_confirm = expense_record_confirm;
            $scope.deleteRecord = deleteRecord; //删除记录
            $scope.exportExpense = exportExpense; //导出费用数据
            $scope.export_config = export_config; //导出费用确认
            $scope.clickTeacher = clickTeacher; //选择经办人
            $scope.openPhotos = openPhotos; //照片查看器
            $scope.add_expense = function() {
                $scope.expense = {
                    shopCostTypeName: "",
                    shopCostPayType: "0",
                    shopCostTypeDesc: "",
                };
                openPopByDiv('新增分类', '.add_preSetClassify', '760px');
                $scope.confirmClassify = function() {
                    var params = {
                        "shopCostTypeName": $scope.expense.shopCostTypeName,
                        "shopCostPayType": $scope.expense.shopCostPayType,
                        "shopCostTypeDesc": $scope.expense.shopCostTypeDesc
                    };
                    url = "/api/oa/shopCost/type/add";
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == 200) {
                                getClassifyList();
                                $scope.closePop();
                            }
                        }
                    });
                }
            }
            $scope.delete_showInfo = function(ind, list) {
                list.splice(ind, 1);
            }
            $scope.add_organInfo = function(list) {
                if (!list) {
                    list = [];
                }
                if (list.length > 7) {
                    layer.msg('添加到达上限');
                    return;
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
                setTimeout(function() {
                    if (list.length >= 8) {
                        layer.msg('凭证最多上传8张！');
                        return;
                    }
                    szpUtil.util_addImg(false, function() {}, { multiple: true, type: 'image/gif, image/jpeg, image/png', dataSource: 'shopCostRecord', remain: 8 - list.length }, uploadObserver);
                }, 100);
            };
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    expenseList(0);
                    getExpenseListTotal();
                }
            });
            (function() {
                laydate.render({
                    elem: '#pCallTime',
                    range: "到",
                    isRange: true,
                    btns: ['confirm'],
                    done: function(value) {
                        $scope.derTime = value;
                    }
                });
            })();
            laydate.render({
                elem: '#recordTime', //指定元素
                type: 'datetime',
                format: 'yyyy-MM-dd HH:mm',
                done: function(value) {
                    $scope.expenseDetail.shopCostRecordDate = value;
                }
            });
            expenseList(0);
            getExpenseListTotal();
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                $timeout(function () {
                    if ($scope.$stateParams.screenValue.pop == "新增记录") {
                        openExpenseRecd('add');
                    }
                 })
            }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        function getHandlerList() {
            $.hello({ //经办人 /api/oa/order/getHandlerList
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: { pageType: "0", shopTeacherStatus: "1" },
                success: function(data) {
                    if (data.status == 200) {
                        $scope.HandlerList = data.context;
                    }
                }
            });
        }

        function openPhotos(value, list) {
            if (list.length <= 0) {
                return;
            }
            value = value.split(',')[0];
            var param = {
                val: value,
                list: list,
                liwidth: 880,
                liheight: 470
            }

            window.$rootScope.yznOpenPopUp($scope, 'photo-pop', 'photosPop', '960px', param);
        }

        function getClassifyList(s) {
            $.hello({
                url: CONFIG.URL + "/api/oa/shopCost/type/list",
                type: "get",
                data: { system: s },
                success: function(res) {
                    if (res.status == 200) {
                        $scope.classifyList = res.context;
                    }
                }
            });
        }

        function onReset() {
            $scope.type0 = $scope.type1 = false;
            searchName = shopCostTypeId = payType = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset();
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        }

        function searchChangeType(type) {
            if (type) {
                if ($scope.type1) {
                    $scope.type1 = true;
                    $scope.type0 = false;
                }
            } else {
                if ($scope.type0) {
                    $scope.type0 = true;
                    $scope.type1 = false;
                }
            }
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        }

        function searchByExpense(e) {
            shopCostTypeId = e != null ? e.shopCostTypeId : undefined;
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        }

        function searchByType(n) {
            payType = n != null ? n.val : undefined;
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        }
        //回车键  删除键
        function Enterkeyup(data) {
            searchName = data.value;
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        }

        //搜索button
        function SearchData(data) {
            searchName = data.value;
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        }
        $scope.$on('reloadexpenselist', function () {
            pagerRender = false;
            expenseList(0);
            getExpenseListTotal();
        });
        function expenseList(start_) {
            start = start_ == 0 ? "0" : start_;
            var param = {
                start: start_ || "0",
                count: eachPage,
                searchType: "appSearchName",
                searchName: searchName,
                shopCostTypeId: shopCostTypeId,
                payType: payType,
                shopCostPayType: $scope.type0 ? "0" : $scope.type1 ? "1" : undefined
            };
            if ($scope.searchTime) {
                param["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                param["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shopCost/record/list",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        var list = data.context.items;
                        $scope.expenseList = angular.copy(list);
                        expensePager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }

                }
            })
        }

        function expensePager(total) { //分页
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
                    expenseList(start); //回调
                }
            });

        }

        function getExpenseListTotal() {
            var param = {
                searchType: "appSearchName",
                searchName: searchName,
                shopCostTypeId: shopCostTypeId,
                payType: payType,
                shopCostPayType: $scope.type0 ? "0" : $scope.type1 ? "1" : undefined
            };
            if ($scope.searchTime) {
                param["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                param["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shopCost/record/totalByList",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.expenseTotal = {};
                        if (data.context.length > 0) {
                            angular.forEach(data.context, function(v) {
                                if (v.shopCostPayType == 1) {
                                    $scope.expenseTotal["inCome"] = v.shopCostRecordPrice;
                                } else {
                                    $scope.expenseTotal["payOut"] = v.shopCostRecordPrice;
                                }
                            });
                        }
                    }

                }
            })
        }

        function closePop() {
            layer.close(dialog);
        }

        function clickTeacher(n) {
            $scope.expenseDetail.handleId = n ? n.shopTeacherId : undefined;
        }

        function openExpenseRecd(type, x) {
            getClassifyList("0");
            $scope.recordType = type;
            if (type == 'add') {
                $scope.expenseDetail = {
                    recordName: "",
                    shopCostRecordId: undefined,
                    shopCostRecordDate: $.format.date(new Date(), "yyyy-MM-dd HH:mm"),
                    shopCostTypeId: "",
                    shopCostRecordPrice: "",
                    handleId: localStorage.getItem('shopTeacherId'), //经办人
                    handleName: localStorage.getItem('userName'),
                    shopCostRecordDesc: "",
                    payType: '0',
                    shopCostRecordImg: []
                };
            } else {
                var data = angular.copy(x);
                if (data.shopCostRecordImg) {
                    var tem = [],
                        arr = data.shopCostRecordImg.split(',');
                    angular.forEach(arr, function(item, index) {
                        tem.push({ imageUrl: data.shopCostRecordImgList[index], key: item })
                    })
                    data.shopCostRecordImg = tem;
                } else {
                    data.shopCostRecordImg = [];
                }
                data.shopCostTypeId += '';
                data.shopCostRecordDate = $.format.date(data.shopCostRecordDate, "yyyy-MM-dd HH:mm");
                $scope.expenseDetail = data;
            }
            $scope.clickPayTypeIcon = function(d) { //点击支付方式
                $scope.expenseDetail['payType'] = d;
            };
            openPopByDiv(type == 'add' ? "新增记录" : "编辑记录", ".expense_record", "760px");
        }

        function expense_record_confirm() {
            var url;
            var param = angular.copy($scope.expenseDetail);
            if (param.shopCostRecordImg) {
                var str = '';
                angular.forEach(param.shopCostRecordImg, function(item, index) {
                    str += item.key + (index == param.shopCostRecordImg.length - 1 ? '' : ',');
                })
                param.shopCostRecordImg = str;
            }
            param["shopCostRecordDate"] = param.shopCostRecordDate + ':00';
            param["handleName"] = undefined;
            if ($scope.recordType == "add") {
                url = "/api/oa/shopCost/record/add";
            } else {
                url = "/api/oa/shopCost/record/update";
            }

            $.hello({
                url: CONFIG.URL + url,
                type: "post",
                data: JSON.stringify(param),
                success: function(res) {
                    if (res.status == 200) {
                        closePop();
                        if ($scope.recordType == "add") {
                            pagerRender = false;
                            expenseList(0);
                        } else {
                            expenseList(start);
                        }
                        getExpenseListTotal();
                    }
                }
            });
        }

        function deleteRecord(x) {
            var isDelect = layer.confirm('是否删除本条记录，删除后不可恢复？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopCost/record/delete",
                    type: "post",
                    data: JSON.stringify({ shopCostRecordId: x.shopCostRecordId }),
                    success: function(res) {
                        if (res.status == 200) {
                            layer.close(isDelect);
                            pagerRender = false;
                            expenseList(0);
                            getExpenseListTotal();
                        }
                    }
                });

            }, function() {
                layer.close(isDelect);
            })
        }

        function exportExpense() {
            layerOpen('exportAllData', '导出费用');
        }

        function export_config() {
            var beginTime = '',
                endTime = '';
            var token = localStorage.getItem('oa_token');
            if ($scope.searchTime) {
                beginTime = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                endTime = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            var params = {
                beginTime: beginTime,
                endTime: endTime,
                token: token,
                searchType: "appSearchName",
                searchName: searchName,
                shopCostTypeId: shopCostTypeId,
                payType: payType,
                shopCostPayType: $scope.type0 ? "0" : $scope.type1 ? "1" : undefined
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }

            window.open(CONFIG.URL + "/api/oa/statistics/consultantShopCost?" + $.param(params));
        }
    }]
})