define(['courseAndClass_sel', 'coursePackage', 'szpUtil', 'qrcode', 'mySelect'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function ($scope, $rootScope, $http, $state, $stateParams) {
        console.log($scope)
        console.log($scope.$stateParams)
	    var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        var $M_box3 = $('.M_box3_1');    //分页显示
        var search_name, search_type, search_productType;   //搜索类型
        init();
        function init() {
            $scope.powerJud = {
                see: checkAuthMenuById("113"),   //查看权限
                operate: checkAuthMenuById("114"),   //操作权限
            };
            $scope.operationList = operationList;   //列表操作
            $scope.operationScreen = operationScreen;   //其他操作
            $scope.confirmData = confirmData;   //提交数据
            $scope.mallInfo = { //商品详情信息
                type: 'add',
                name: '',
                imgUrl: '',
                describe: '',
                spec: [],
            };
            //搜索类型
            $scope.kindSearchData = {
                'header': '商品名称',
            };
            $scope.selectInfoNameId = 'header';
            $scope.SearchData = SearchData; //搜索
            $scope.Enterkeyup = SearchData; //搜索
            $scope.nameListThead = [
                {'name': '商品名称', 'width': '30%'},
                {'name': '商品类型', 'width': '20%'},
                {'name': '商品金额', 'width': '30%'},
                {'name': '上下架', 'width': '100px', 'align': 'center'},
                {'name': '操作', 'align': 'center'},
            ];
            $scope.mallTypeList = [ //筛选列表类型
                {'name': '课程', 'value': 0},
                {'name': '学杂', 'value': 1},
                {'name': '套餐', 'value': 2},
            ]
            $scope.screen_operate = screen_operate; //列表筛选操作
            $scope.sel_screen = sel_screen; //列表筛选条件
            $scope._screen = {
                shelfType: undefined,
            }
            $scope.onReset = function() {   //点击重置
                $scope.kindSearchOnreset(); //调取app重置方法
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                search_name = undefined;
                search_type = undefined;
                search_productType = undefined;
                pagerRender = false;
                $scope._screen.shelfType = undefined;
                getMallList(0);
            }
            //确定添加规格
            $scope.$on('coursePackage', function(v, d) {
                layer.msg('添加商品成功');
                pagerRender = false
                getMallList(0);   //获取列表
            })

            $scope.imgover = function(evt, type) {
                switch(type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                        break;
                }
            };
            $scope.imgout = function(evt, type) {
                switch(type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                        break;
                }
            }
            $scope.closePopup = function() {
                layer.close(dialog);
            }
            $scope.clickShareCopy = function() {
                copyToClipboard($('.mall_share_url input')[0]);
                layer.msg('复制成功')
            }
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新建商品") {
                    setTimeout(function () {
                        operationScreen(1);
                    })
                }
            }
            getMallList(0);
        }

        //提交数据
        function confirmData() {
            var params, _url = '/api/oa/product/addProduct', productSpecificationsList = [], specificationsName=[];
            angular.forEach($scope.mallInfo.spec, function(_v) {    //规格名称集合
                var _c = [], _g = [];
                angular.forEach(_v.specificationsCourseList, function(v1) {
                    _c.push(detNeedField(v1, 'course')); //去除course字段
                });
                angular.forEach(_v.specificationsGoodsList, function(v1) {
                    _g.push(detNeedField(v1, 'goods')); //去除goods字段
                });
                productSpecificationsList.push({
                    'specificationsName': _v.specificationsName,
                    'courseNum': _v.courseNum,
                    'goodsNum': _v.goodsNum,
                    'amount': _v.amount,
                    'status': _v.status,
                    'specificationsCourseList': _c,
                    'specificationsGoodsList': _g,
                })
                specificationsName.push(_v.specificationsName);
            })
            params = {
                'productName': $scope.mallInfo.name,
                'productImageUrl': $scope.mallInfo.imgUrl,
                'productDesc': $scope.mallInfo.describe,
                'productSpecificationsList': productSpecificationsList,
                'specificationsName': specificationsName.join('，'),
            }
            if($scope.mallInfo['type'] == 'edit') { //如果是编辑
                _url = '/api/oa/product/modifyProduct';
                params['productId'] = $scope.mallInfo.productId;
            }
//          console.log(params);
            $.hello({
                url: CONFIG.URL + _url,
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if(res.status == '200') {
                        pagerRender = false
                        getMallList(0);   //获取列表
                        $scope.closePopup();
                    };
                }
            })
        }

        //列表筛选条件
        function sel_screen(type, evt) {
            switch(type) {
                case 1:
                    $scope._screen.shelfType = evt.target.checked?1:undefined;
                    break;
                case 2:
                    $scope._screen.shelfType = evt.target.checked?0:undefined;
            };
            pagerRender = false;
            getMallList(0);   //获取列表
        }

        //列表筛选操作
        function screen_operate(d, type) {
            switch(type) {
                case 1: //商品类型筛选
                    search_productType = d?d.value:undefined;
                    pagerRender = false;
                    getMallList(0);   //获取列表
                    break;
            }
        }

        //搜索
        function SearchData(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false
            getMallList(0);   //获取列表
        }

        //列表操作
        function operationList(d, type, ind) {
            console.log(d)
            switch(type) {
                case 'share':   //点击分享
                    var shareHref = window.location.protocol + '//' + window.location.host;
                    if(window.location.host == 'www.yizhiniao.com') {
                        shareHref = window.location.protocol + '//' + 'm.yizhiniao.com';
                    }
                    $scope.mallShareData = d;
                    $scope.mallShareData._url = shareHref + '/h5/common/mall/index.html?productId=' + d.productId + '&shopId=' + d.shopId;
                    $('#mall_share_code').html('');
                    jQuery('#mall_share_code').qrcode({
                        render: "canvas", //也可以替换为table
                        width: 130,
                        height: 130,
                        text: $scope.mallShareData._url,
                    });
                    openPopByDiv('分享', '.mall_share', '860px');
                    break;
                case 'mall_on': //商品列表点击上下架
                    var isEdit = layer.confirm('是否修改状态?', {
                        title: "修改信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/product/updateStatus",
                            type: "post",
                            data: JSON.stringify({'productId': d.productId, 'productStatus': d.productStatus==0?1:0}),
                            success: function(res) {
                                if(res.status == 200) {
                                    pagerRender = false;
                                    getMallList(0);
                                    layer.msg('已修改');
                                };
                            }
                        });
                        layer.close(isEdit);
                    }, function() {
                        layer.close(isEdit);
                    })
                    break;
                case 'mall_edit': //商品列表点击编辑
                    $.hello({
                        url: CONFIG.URL + "/api/oa/product/productDetail",
                        type: "get",
                        data: {'productId': d.productId},
                        success: function(res) {
                            if(res.status == '200') {
                                console.log(res);
                                var d = res.context, _d;
                                angular.forEach(d.specificationsCourseList, function(v) {
                                    v.classList = v.specificationsCourseClassRList;
                                });
                                _d = {
                                    'productId': d.productId,
                                    'name': d.productName,
                                    'imgurl': d.productImageUrl,
                                    'describe': d.productDesc,
                                    'mallType': d.productType,
                                    'coursePackageCourseList': d.specificationsCourseList,
                                    'coursePackageGoodsList': d.specificationsGoodsList,
                                };
                                $scope.openCoursepackage('add_coursepackage', '1160px', {from: 'mall', type: 1, title:'编辑商品', item: _d, power_operate:$scope.powerJud.operate});
                            };
                        }
                    })
                    break;
                case 'on': //规格列表点击上下架
                    if(d.status == 1) {
                        var isEdit = layer.confirm('确定要下架该规格吗?', {
                            title: "修改信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['是', '否'] //按钮
                        }, function() {
                            d.status = 0;
                            $scope.$apply();
                            layer.close(isEdit);
                        }, function() {
                            layer.close(isEdit);
                        })
                    } else {
                        d.status = 1;
                    }
                    break;
            }
        }

        //筛选栏操作
        function operationScreen(type) {
            switch(type) {
                case 1: //点击新增商品
                    if(window.currentUserInfo.shop.auditStatus==2) {
                        $scope.openCoursepackage('add_coursepackage', '1160px', {from: 'mall', type: 0, title:'新增商品', item:{}});
                    } else {
                        var isEdit = layer.confirm('请开通易收宝后使用', {
                            title: "提示信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['知道了'] //按钮
                        }, function() {
                            layer.close(isEdit);
                        }, function() {
                            layer.close(isEdit);
                        })
                    }
                    break;
            }
        }

        //获取商品列表
        function getMallList(start) {
            var params = {
                'start': start,
                'count': eachPage,
                'productStatus': $scope._screen.shelfType,
                'searchType': 'productName',
                'searchName': search_name?search_name:undefined,
                'productType': search_productType,
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/product/listProduct",
                type: "get",
                data: params,
                success: function(res) {
                    if(res.status == '200') {
                        console.log(res)
                        $scope.mallList = res.context.items;
                        renderPager_mall(res.context.totalNum);
                    };
                }
            })
        }

        //分页
        function renderPager_mall(total) { //分页
            if(pagerRender)
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
                callback: function(api) {
                    if(api.getCurrentEach() != eachPage) {  //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    console.log(start)
                    getMallList(start); //回掉
                }
            });
        }

        function copyToClipboard(elem) {    //点击复制按钮
            var targetId = "_hiddenCopyText_";
            var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
            var origSelectionStart, origSelectionEnd;
            if (isInput) {
                target = elem;
                origSelectionStart = elem.selectionStart;
                origSelectionEnd = elem.selectionEnd;
            } else {
                target = document.getElementById(targetId);
                if (!target) {
                    var target = document.createElement("textarea");
                    target.style.position = "absolute";
                    target.style.left = "-9999px";
                    target.style.top = "0";
                    target.id = targetId;
                    document.body.appendChild(target);
                }
                target.textContent = elem.textContent;
            }
            var currentFocus = document.activeElement;
            target.focus();
            target.setSelectionRange(0, target.value.length);

            var succeed;
            try {
                succeed = document.execCommand("copy");
            } catch(e) {
                succeed = false;
            }
            if (currentFocus && typeof currentFocus.focus === "function") {
                currentFocus.focus();
            }

            if (isInput) {
                elem.setSelectionRange(origSelectionStart, origSelectionEnd);
            } else {
                target.textContent = "";
            }
            return succeed;
        };

    }]
})