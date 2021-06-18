define([], function() {
    creatPopup({
        el: 'expensePop',
        openPopupFn: 'preSetClassifyFn',
        htmlUrl: './templates/popup/expense_pop.html',
        controllerFn: function($scope, props, SERVICE) {
            $scope.searchName = undefined;
            init();

            function init() {
                $scope.kindSearchData = {
                    shopCostTypeName: "费用名称",
                };
                $scope.selectInfoNameId = "shopCostTypeName";
                $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
                $scope.SearchData = SearchData; //按钮搜索
                $scope.changeType = changeType; //费用收支类型
                $scope.onReset = onReset;//重置
                $scope.addClassify = addClassify; //预设时间--新增或编辑时间弹出框
                $scope.deletePreClassify = deletePreClassify; //预设时间--删除预设时间
                onReset();
            }
            function onReset() {
                $scope.kindSearchOnreset();
                $scope.searchName = undefined;
                $scope.sc_type0 = $scope.sc_type1 = false;
                getClassifyList();
            }
            //回车键  删除键
            function Enterkeyup(data) {
                $scope.searchName = data.value;
                getClassifyList();
            }

            //搜索button
            function SearchData(data) {
                $scope.searchName = data.value;
                getClassifyList();
            }

            function changeType(type) {
                if (type) {
                    if ($scope.sc_type1) {
                        $scope.sc_type1 = true;
                        $scope.sc_type0 = false;
                    }
                } else {
                    if ($scope.sc_type0) {
                        $scope.sc_type0 = true;
                        $scope.sc_type1 = false;
                    }
                }
                getClassifyList();
            }

            function getClassifyList() {
                var param = {
                    searchType: 'shopCostTypeName',
                    searchName: $scope.searchName,
                    shopCostPayType: $scope.sc_type0 ? "0" : $scope.sc_type1 ? "1" : undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopCost/type/list",
                    type: "get",
                    data: param,
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.classifyList = res.context;
                        }
                    }
                });
            }

            function addClassify(type, x) {
                $scope.operateType = type;
                if(type == "add"){
                    $scope.expense={
                        shopCostTypeName:"",
                        shopCostPayType:"0",
                        shopCostTypeDesc:"",
                    };
                }else{
                    $scope.expense = x;
                    getExpenseInfo();
                }
                
                
                $scope.confirmClassify = confirmClassify; //新增或编辑预设时间
                $scope.goPopup("add_preSetClassify", "760px");
                
                
                function getExpenseInfo(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/shopCost/type/info",
                        type: "get",
                        data: {shopCostTypeId:$scope.expense.shopCostTypeId},
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.expense = res.context;
                            }
                        }
                    });
                }
                function confirmClassify() {
                    var params = {
                        "shopCostTypeName": $scope.expense.shopCostTypeName,
                        "shopCostPayType":$scope.expense.shopCostPayType,
                        "shopCostTypeDesc":$scope.expense.shopCostTypeDesc
                    };
                    if ($scope.operateType == "add") {
                        url = "/api/oa/shopCost/type/add";
                    } else {
                        url = "/api/oa/shopCost/type/update";
                        params["shopCostTypeId"] = $scope.expense.shopCostTypeId;
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == 200) {
                                getClassifyList();
                                $scope.closePopup('add_preSetClassify');
                            }
                        }
                    });
                }
            }

            function deletePreClassify(x) {
                var isCfirm = layer.confirm('是否删除本条费用分类，删除后不可恢复？', {
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
                        "shopCostTypeId": x.shopCostTypeId
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/shopCost/type/delete",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功删除分类', {
                                    icon: 1
                                });
                                getClassifyList();
                            };
                        }
                    })
                }, function() {
                    layer.close(isCfirm);
                })

            }

        }
    })
});