/*
 * props参数说明：
 *  from：弹框来源渠道默认是课程包。
 *  type：是编辑操作还是新增操作。
 *  item：如果是编辑操作所携带的数据。
 *  title：来源渠道名称。
 *
 */

define(['laydate', 'szpUtil'], function (laydate) {
    creatPopup({
        el: 'creatCoupon',
        openPopupFn: 'opencreatCoupon',
        htmlUrl: './templates/popup/creatCoupon.html',
        controllerFn: function ($scope, props,SERVICE) {
            console.log(props);
            var pagerRender = false,
                eachPage = 5,
                $M_box3 = $('.M_box3_77'),
                proDialog;
            
            if(props.iscopy){
                $scope.couponType = {    //创建or编辑
                    popupName: '创建优惠券',
                    nomodify: false,
                    url: "/api/oa/coupon/addCoupon"
                };
            }else{
                $scope.couponType = {    //创建or编辑
                    popupName: props.type == 1 ? '创建优惠券' : '编辑优惠券',
                    nomodify: props.type == 1 ? false : true,
                    url: props.type == 1 ? "/api/oa/coupon/addCoupon" : "/api/oa/coupon/modifyCoupon"
                };
            }
            $scope.iswarnShow = false;
            
            if(props.type == 2){//查看是否被领取
                $.hello({
                    url: CONFIG.URL + "/api/oa/coupon/checkModify",
                    type: "get",
                    data: {couponId:props.data.couponId},
                    success: function (res) {
                        if (res.status == '200') {
                            $scope.iswarnShow = res.context > 0 ?true:false;
                        }
                    }
                })
            }
            
            $scope.SearchData = SearchData; //搜索
            $scope.Enterkeyup = SearchData; //搜索
            $scope.params_potials = [];
            //搜索类型
            $scope.kindSearchData = {
                'header': '商品名称'
            };
            $scope.selectInfoNameId = 'header';
            $scope.validityTime = "";
            $scope.number_rmb = "";
            $scope.number_score = "";

            if (props.type !== 1) {
                if (props.data.conditions == 1) {
                    $scope.number_rmb = props.data.number;
                }
                if (props.data.conditions == 2) {
                    $scope.number_score = props.data.number;
                }
                if (props.data.validity == 1) {
                    $scope.validityTime = $.format.date(props.data.validityBeginTime, 'yyyy-MM-dd') + " 到 " + $.format.date(props.data.validityEndTime, 'yyyy-MM-dd')
                }
                $scope.couponSubData = {
                    couponId:props.data.couponId?props.data.couponId:'',
                    couponName:props.data.couponName,
                    discountType:props.data.discountType,
                    discounts:props.data.discounts,
                    useLimits:props.data.useLimits,
                    useMoney:props.data.useMoney?props.data.useMoney:'',
                    totalNumber:props.data.totalNumber,
                    instructions:props.data.instructions,
                    userScope:props.data.userScope,
                    productScope:props.data.productScope,
                    validity:props.data.validity,
                    validityDays:props.data.validityDays?props.data.validityDays:'',
                    conditions:props.data.conditions
                };
                var arr = [];
                angular.forEach(props.data.productNames,function(item,index){
                    arr.push({
                        productName:item,
                        productId:props.data.products.split(',')[index]
                    })
                })
                $scope.products = arr;
            } else {
                $scope.products = [];
                $scope.couponSubData = {
                    discountType: 1,//优惠券类型
                    useLimits: 1,//使用门槛
                    userScope: 0,//用户范围
                    productScope: 0,//适用商品范围
                    validity: 1,//有效期
                    conditions: 0,//领券条件
                };
            }
            $scope.discountArr = [];
            for(var i = 99;i>0;i--){
                $scope.discountArr.push({name:(i/10).toFixed(1)+"折",val:i})
            }
            $scope.sel_potial = function (data) {
                var index_ = [false, null];
                if (data.hasChecked) {
                    data.hasChecked = false;
                    angular.forEach($scope.params_potials, function (val, ind) {
                        if (data.productId == val.productId) {
                            index_ = [true, ind];
                        }
                    });
                    if (index_[0]) {
                        $scope.params_potials.splice(index_[1], 1);
                    }
                } else {
                    data.hasChecked = true;
                    $scope.params_potials.push(data);
                }
            };
            // 切换清空
            $scope.initdiscounts = function (changetype, flag) {
                switch (changetype) {
                    case "validity"://有效日期
                        if (flag == 1) {
                            $scope.couponSubData.validityDays = "";
                        } else if (flag == 2) {
                            $scope.validityTime = "";
                            $scope.couponSubData.validityBeginTime = "";
                            $scope.couponSubData.validityEndTime = "";
                        } else if (flag == 3) {
                            $scope.couponSubData.validityDays = "";
                            $scope.validityTime = "";
                            $scope.couponSubData.validityBeginTime = "";
                            $scope.couponSubData.validityEndTime = "";
                        }
                        break;
                    case "discountType":
                        if (!flag) {//折扣值清空
                            $scope.couponSubData.discounts = "";
                        }
                        break;
                    case "useLimits":
                        if (!flag) {//满减
                            $scope.couponSubData.useMoney = "";
                        }
                        break;
                    case "conditions":
                        if (flag == 0) {
                            $scope.number_rmb = "";
                            $scope.number_score = "";
                        } else if (flag == 1) {
                            $scope.number_score = "";
                        } else if (flag == 2) {
                            $scope.number_rmb = "";
                        }
                        break;
                }
            };
            $scope.potial_checkboxClick = function (d) {
                var i_ = [false, null];
                if (d) {
                    angular.forEach($scope.mallList, function (val_1) {
                        if (!val_1.hasChecked) {
                            val_1.hasChecked = true;
                            $scope.params_potials.push(val_1);
                        }
                    });
                } else {
                    angular.forEach($scope.mallList, function (val_1) {
                        val_1.hasChecked = false;
                        i_ = [false, null];
                        angular.forEach($scope.params_potials, function (val_2, ind_2) {
                            if (val_1.productId == val_2.productId) {
                                i_ = [true, ind_2];
                            }
                        });
                        if (i_[0]) {
                            $scope.params_potials.splice(i_[1], 1);
                        }
                    });
                }
            };
            // 日期选择
            (function () {
                laydate.render({
                    elem: '#couponExpir', //指定元素
                    range: '到',
                    isRange: true,
                    done: function (value) {
                        if(value) {
                            $scope.validityTime = value;
                        }
                    }
                });
            })();
            // 删除指定商品
            $scope.delnoeedPro = function (index) {
//              if (props.type !== 1) {
//                  return layer.msg("该参数无法修改")
//              }
                $scope.products.splice(index, 1);
            };
            // 选择商品弹框
            $scope.choosePro = function () {
                if(window.currentUserInfo.shop.auditStatus !==2){
                    $scope.couponSubData.productScope = 0;
                    return layer.msg("请开通易收宝后使用")
                }
//              if (props.type !== 1) {
//                  return layer.msg("该参数无法修改")
//              }
                proDialog = layer.open({
                    type: 1,
                    title: "选择商品",
                    skin: 'layerui', //样式类名
                    closeBtn: 1, //不显示关闭按钮
                    move: false,
                    anim: 0,
                    area: "760px",
                    offset: '30px',
                    shadeClose: false, //开启遮罩关闭
                    content: $('.' + "choosePro")
                });
                $scope.couponSubData.productScope = 1;
                $scope.getProLsit(0);
            };
            // 关闭商品弹框
            $scope.closePro = function () {
                if (proDialog) {
                    layer.close(proDialog)
                }
            };
            function SearchData(data) {
                $scope.searchName = data.value;
                console.log(data)
                pagerRender = false;
                $scope.getProLsit(0);   //获取列表
            }

            // /点击确定按钮把数据返回
            $scope.deterSel_course = function () {
                var data = $scope.params_potials;
                if (!data || data.length == 0) {
                    layer.msg('请选择课程');
                } else {
                    $scope.products = data;
                    $scope.closePro();
                }
                manualOnresize();   //手动调用onresize
            };
            $scope.onReset = function () {
                $scope.searchName = "";
                $scope.search_productType1 = $scope.search_productType2 = undefined;
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                $scope.kindSearchOnreset(); //调取app重置方法
                pagerRender = false; //分页重新加载
                $scope.getProLsit(0);
            };
            // 获取商品列表
            $scope.getProLsit = function (start) {
                var params = {
                    'start': start,
                    'count': eachPage,
                    'searchType': 'productName',
                    "typeList":"0,2",
                    'searchName': $scope.searchName ? $scope.searchName : undefined,//搜索名称
                    'productType': $scope.search_productType1 ? 0 : $scope.search_productType2 ? 2 : "",//商品类型
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/product/listProduct",
                    type: "get",
                    data: params,
                    success: function (res) {
                        if (res.status == '200') {
                            $scope.mallList = res.context.items;
                            console.log($scope.mallList);
                            console.log($scope.params_potials);
                            repeatLists($scope.mallList, $scope.params_potials, 'productId');
                            SERVICE.THEAD.resetCheckboxDir(false);
                            renderPager_mall(res.context.totalNum);
                        }
                    }
                })
            };
            $scope.chargeType = function (type) {
                if (type) {
                    if ($scope.search_productType1) {
                        $scope.search_productType1 = true;
                        $scope.search_productType2 = false;
                    }
                } else {
                    if ($scope.search_productType2) {
                        $scope.search_productType2 = true;
                        $scope.search_productType1 = false;
                    }
                }
                pagerRender = false;
                $scope.getProLsit(0);
            };
            //分页
            function renderPager_mall(total) { //分页
                if (pagerRender)
                    return;
                pagerRender = true;
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
                    callback: function (api) {
                        if (api.getCurrentEach() != eachPage) {  //本地存储记下每页多少条
                            eachPage = api.getCurrentEach();
                            // localStorage.setItem(getEachPageName($state), eachPage);
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        $scope.getProLsit(start); //回掉
                    }
                });
            }

            $scope.confirmData = function () {//确认提交数据
                var params;
                if ($scope.couponSubData.productScope == 1 && (!$scope.products || $scope.products.length == 0)) return layer.msg("请选择商品");
//              if (props.type == 1) {
                    //领券条件
                if ($scope.couponSubData.conditions == 1) {
                    $scope.couponSubData.number = $scope.number_rmb;
                }
                if ($scope.couponSubData.conditions == 2) {
                    $scope.couponSubData.number = $scope.number_score;
                }
                if ($scope.couponSubData.conditions == 0) {
                    $scope.couponSubData.number = "";
                }
                // 有效期
                if ($scope.couponSubData.validity == 1) {
                    $scope.couponSubData.validityDays = "";
                    if($scope.validityTime){
                        $scope.couponSubData.validityBeginTime = $scope.validityTime.split(" 到 ")[0] + " 00:00:00";
                        $scope.couponSubData.validityEndTime = $scope.validityTime.split(" 到 ")[1] + " 23:59:59";
                    }
                }
                if ($scope.couponSubData.validity == 2) {
                    $scope.couponSubData.validityBeginTime = "";
                    $scope.couponSubData.validityEndTime = "";
                }
                if ($scope.couponSubData.validity == 3) {
                    $scope.couponSubData.validityBeginTime = "";
                    $scope.couponSubData.validityEndTime = "";
                    $scope.couponSubData.validityDays = "";
                }
                if ($scope.products && $scope.couponSubData.productScope == 1) {
                    var str = "";
                    for (var i = 0; i < $scope.products.length; i++) {
                        if (i > 0) {
                            str += ("," + $scope.products[i].productId);
                        } else {
                            str += $scope.products[i].productId;
                        }
                    }
                    $scope.couponSubData.products = str;
                }
                for (var i in $scope.couponSubData) {
                    if ($scope.couponSubData[i] === '' || $scope.couponSubData[i] == undefined) {
                        delete $scope.couponSubData[i];
                    }
                }
                if(!$scope.couponSubData.instructions){
                    $scope.couponSubData.instructions = '';
                }
                params = $scope.couponSubData;
                if(props.iscopy){
                    delete $scope.couponSubData.couponId;
                }
                $.hello({
                    url: CONFIG.URL + $scope.couponType.url,
                    type: "post",
                    data: JSON.stringify(params),
                    success: function (res) {
                        if (res.status == '200') {
                            $scope.$emit("couponChange")
                            $scope.closePopup('creat_coupon');
                        }
                    }
                });
            };

        }
    })
})