define(['qrcode', 'mySelect', 'creatCoupon',"orderInfo",'students_sel','courseAndClass_sel'], function (laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function ($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false, pagerRendercheck = false,
            start = 0,
            eachPage = localStorage.getItem("couponPage") ? localStorage.getItem("couponPage") : 10,
            start1 = 0,
            s_eachPage = localStorage.getItem('couponPage1') ? localStorage.getItem('couponPage1') : 10;//页码初始化
        var $M_box3 = $('.M_box3_1'), $M_box2 = $('.M_box3_2');    //分页显示
        var couponName, userScope,filter,conditions,productId;   //搜索类型
        $scope.potentialQuanxian_opra = checkAuthMenuById("117");
        var send_dialog;
        init();
        function init() {
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
                'header': '优惠券名称',
            };
            $scope.selectInfoNameId = 'header';
            $scope.SearchData = SearchData; //搜索
            $scope.Enterkeyup = SearchData; //搜索
            $scope.SearchData_forcheck = Search_forcheck; //搜索
            $scope.Enterkeyup_forcheck = Search_forcheck; //搜索
            $scope.getcouponcheckList = getcouponcheckList;
            $scope.dispend_coupon = dispend_coupon;//发放优惠券
            $scope.sendCoupon_confirm = sendCoupon_confirm;//发放优惠券
            $scope.sendCoupon_confirm2 = sendCoupon_confirm2;//发放优惠券
            $scope.select_product = select_product;//指定商品
            $scope.nameListThead = [
                {'name': '优惠券名称', 'width': '160'},
                {'name': '类型', 'width': '120'},
                {'name': '优惠/折扣', 'width': '120'},
                {'name': '使用门槛', 'width': '120'},
                {'name': '剩余数量', 'width': '120'},
                {'name': '有效期', 'width': '170'},
                {'name': '适用学员', 'width': '120'},
                {'name': '适用商品', 'width': '120'},
                {'name': '领券条件', 'width': '120'},
                {'name': '同步领券中心', 'width': '120', 'align': 'center'},
                {'name': '上下架', 'width': '120', 'align': 'center'},
                {'name': '操作', 'align': 'center','width': '130'},
            ];
            $scope.mallTypeList = [ //筛选列表类型
                {'name': '免费领取', 'value': 0},
                {'name': '支付金额', 'value': 1},
                {'name': '积分兑换', 'value': 2},
            ];
            $scope.couponRangeforUser = [ //筛选用户范围
                {'name': '不限', 'value': 0},
                {'name': '新学员', 'value': 1},
                {'name': '老学员', 'value': 2},
            ];
            $scope.couponRange = [ //筛选商品范围
                {'name': '不限', 'value': 0},
                {'name': '指定商品', 'value': 1},
            ];
            $scope.screen_operate = screen_operate; //列表筛选操作
            $scope.sel_screen = sel_screen; //列表筛选条件
            $scope._screen = {
                shelfType: undefined,
            };
            //确定添加规格
            $scope.$on('couponChange', function (v, d) {
                pagerRender = false;
                getMallList(0);   //获取列表
            });
            $scope.imgover = function (evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                        break;
                }
            };
            $scope.imgout = function (evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                        break;
                }
            };
            $scope.closePopup = function () {
                layer.close(dialog);
            };
            $scope.clickShareCopy = function () {
                copyToClipboard($('.mall_share_url input')[0]);
                layer.msg('复制成功')
            };
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "创建优惠券") {
                    setTimeout(function () {
                        window.$rootScope.yznOpenPopUp($scope,'creat-coupon','creat_coupon', '760px', { type: 1 });
                    })
                }
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "发送优惠券") {
                    setTimeout(function () {
                        dispend_coupon();
                    })
                }
            }
            getMallList(0);
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        }
        //发放优惠券
        function dispend_coupon(){
            $scope.sendData = {
                type:"1",
                apt_class:[],
                apt_students:[],
                apt_coupons:[]
            };
            $scope.isRepeat = false;
            $scope.checkClass = checkClass;//班级选择器
            $scope.delClass = delClass;//删除已选班级
            $scope.checkStudent = checkStudent;//学员选择器
            $scope.delStudent = delStudent;//删除已选学员
            $scope.checkCoupons = checkCoupons;//优惠券选择器
            $scope.delCoupon = delCoupon;//删除已选优惠券
            $scope.sendCoupon_confirm = sendCoupon_confirm;//发放优惠券
            $scope.sendCoupon_confirm2 = sendCoupon_confirm2;//发放优惠券
            openPopByDiv("发放优惠券",".dispendCoupon","760px");
        }
        function sendCoupon_confirm(){
            if($scope.sendData.type == 1 && $scope.sendData.apt_class.length<=0){
                return layer.msg("请选择班级！");
            }
            if($scope.sendData.type == 2 && $scope.sendData.apt_students.length<=0){
                return layer.msg("请选择学员！");
            }
            if($scope.sendData.apt_coupons.length<=0){
                return layer.msg("请添加优惠券！");
            }
//          if($scope.sendData.apt_coupons.length>3){
//              return layer.msg("优惠券数量不能超过3张!");
//          }
            var param = {
                "sendObject":$scope.sendData.type,// 券发送对象 1：班级 2：学员
                "objects":$scope.sendData.type==1?datalist($scope.sendData.apt_class,"class"):datalist($scope.sendData.apt_students,"student"),
                "coupons":datalist($scope.sendData.apt_coupons,"coupon"),
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/coupon/checkCouponSend",
                type: "post",
                data: JSON.stringify(param),
                success: function(res) {
                    if(res.status == 200) {
                        if(res.context.length>0){
                            $scope.remindList = res.context;
                            send_dialog = layer.open({
                                type: 1,
                                title: "提示信息",
                                skin: 'layerui', //样式类名
                                closeBtn: 1, //不显示关闭按钮
                                move: false,
                                resize: false,
                                anim: 0,
                                area:'560px',
                                offset: '30px',
                                shadeClose: false, //开启遮罩关闭
                                content: $(".remindMsg")
                            })
                        }else{
                            sendCoupon_confirm2();
                            $scope.closePopup();
                        }
                    };
                }
            });
        }
        function sendCoupon_confirm2(type){
            if($scope.sendData.type == 1 && $scope.sendData.apt_class.length<=0){
                return layer.msg("请选择班级！");
            }
            if($scope.sendData.type == 2 && $scope.sendData.apt_students.length<=0){
                return layer.msg("请选择学员！");
            }
            if($scope.sendData.apt_coupons.length<=0){
                return layer.msg("请添加优惠券！");
            }
            var param = {
                "sendObject":$scope.sendData.type,// 券发送对象 1：班级 2：学员
                "objects":$scope.sendData.type==1?datalist($scope.sendData.apt_class,"class"):datalist($scope.sendData.apt_students,"student"),
                "coupons":datalist($scope.sendData.apt_coupons,"coupon"),
                "flag":type==1?"1":type==2?"2":undefined,
            }
            //"flag":1// 1：过滤发放 2：重复发放（检查无返回数据可不传）
            $.hello({
                url: CONFIG.URL + "/api/oa/coupon/sendCoupon",
                type: "post",
                data: JSON.stringify(param),
                success: function(res) {
                    if(res.status == 200) {
                        layer.msg("发放成功",{icon:1});
                        getMallList(start);
                        if(send_dialog){
                            layer.close(send_dialog);
                        }
                        $scope.closePopup();
                    };
                }
            });
        }
        function checkClass(){
            window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px',{name:"class", type: 'checkbox', callBackName: '优惠券-添加班级'});
        }
        function delClass(x,ind){
            $scope.sendData.apt_class.splice(ind,1);
        }
        $scope.$on("优惠券-添加班级",function(evt,data){
            angular.forEach(data, function(val) {
                var judge = true;
                angular.forEach($scope.sendData.apt_class, function(val_) {
                    if(val.classId == val_.classId) {
                        judge = false;
                    }
                })
                if(judge) {
                    $scope.sendData.apt_class.push(val);
                }
            })

        });
        function checkStudent(){
            window.$rootScope.yznOpenPopUp($scope,'student-sel','selectStuds', '760px',{ type: 'student',choseType: 'checkbox', callBackName: '优惠券-添加学员',});
        }
        function delStudent(x,ind){
            $scope.sendData.apt_students.splice(ind,1);
        }
        $scope.$on("优惠券-添加学员",function(evt,data){
            angular.forEach(data, function(val) {
                var judge = true;
                angular.forEach($scope.sendData.apt_students, function(val_) {
                    if(val.potentialCustomerId == val_.potentialCustomerId) {
                        judge = false;
                    }
                })
                if(judge) {
                    $scope.sendData.apt_students.push(val);
                }
            })

        });
        function checkCoupons(){
            window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseCoupons', '1060px',{name:"coupons", type: 'checkbox', callBackName: '优惠券-添加优惠券'});
        }
        function delCoupon(x,ind){
            $scope.sendData.apt_coupons.splice(ind,1);
        }
        $scope.$on("优惠券-添加优惠券",function(evt,data){
            angular.forEach(data, function(val) {
                var judge = true;
                angular.forEach($scope.sendData.apt_coupons, function(val_) {
                    if(val.couponId == val_.couponId) {
                        judge = false;
                    }
                })
                if(judge) {
                    val.showIns = false;
                    $scope.sendData.apt_coupons.push(val);
                }
            })
             console.log($scope.sendData.apt_coupons);
        });
        function datalist(list,type){
            var arr=[];
            if(list.length>0){
                angular.forEach(list,function(v){
                    if(type == 'class'){
                        arr.push(v.classId)
                    }
                    if(type == 'student'){
                        arr.push(v.potentialCustomerId)
                    }
                    if(type == 'coupon'){
                        arr.push(v.couponId)
                    }
                });
            }
            return arr;
        }
        //提交数据
        function confirmData() {
            var params, _url = '/api/oa/product/addProduct', productSpecificationsList = [], specificationsName = [];
            angular.forEach($scope.mallInfo.spec, function (_v) {    //规格名称集合
                var _c = [], _g = [];
                angular.forEach(_v.specificationsCourseList, function (v1) {
                    _c.push(detNeedField(v1, 'course')); //去除course字段
                });
                angular.forEach(_v.specificationsGoodsList, function (v1) {
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
                });
                specificationsName.push(_v.specificationsName);
            });
            params = {
                'productName': $scope.mallInfo.name,
                'productImageUrl': $scope.mallInfo.imgUrl,
                'productDesc': $scope.mallInfo.describe,
                'productSpecificationsList': productSpecificationsList,
                'specificationsName': specificationsName.join('，'),
            };
            if ($scope.mallInfo['type'] == 'edit') { //如果是编辑
                _url = '/api/oa/product/modifyProduct';
                params['productId'] = $scope.mallInfo.productId;
            }
            $.hello({
                url: CONFIG.URL + _url,
                type: "post",
                data: JSON.stringify(params),
                success: function (res) {
                    if (res.status == '200') {
                        pagerRender = false;
                        getMallList(0);   //获取列表
                        $scope.closePopup();
                    }
                }
            })
        }
        //列表筛选条件
        function sel_screen(type, evt) {
            switch (type) {
                case 1:
                    $scope.searchStatus = evt.target.checked ? 1 : undefined;
                    break;
                case 2:
                    $scope.searchStatus = evt.target.checked ? 0 : undefined;
                    break;
                case 3:
                    $scope.discountType = evt.target.checked ? 1 : undefined;
                    break;
                case 4:
                    $scope.discountType = evt.target.checked ? 2 : undefined;
                    break;
            }
            pagerRender = false;
            getMallList(0);   //获取列表
        }
        //列表筛选操作
        function screen_operate(d, type) {
            switch (type) {
                case 1: //优惠券类型筛选
                    conditions = d ? d.value : undefined;
                    pagerRender = false;
                    getMallList(0);   //获取列表
                    break;
                case 2: //适用用户范围筛选
                    userScope = d ? d.value : undefined;
                    pagerRender = false;
                    getMallList(0);   //获取列表
                    break;
                case 3: //适用商品范围筛选
                    $scope.productScope = d ? d.value : undefined;
                    if($scope.productScope == 1){
                        getproduct();
                    }else{
                        productId = undefined;
                    }
                    pagerRender = false;
                    getMallList(0);   //获取列表
                    break;
            }
        }
        //指定商品列表
        function getproduct() {
            $.hello({
                url: CONFIG.URL + '/api/oa/product/listProduct',
                type: 'get',
                data:{"pageType":"0"},
                success: function(data) {
                    if(data.status == "200"){
                        $scope.screen_product = data.context;
                    }
                }
            });
        }
        //选择指定商品
        function select_product(d) {
            pagerRender = false;
            productId = d?d.productId:null;
            getMallList(0);
        }
        //搜索
        function SearchData(data) {
            couponName = data.value;
            pagerRender = false;
            getMallList(0);   //获取列表
        }
        //查看优惠券列表搜索
        function Search_forcheck(data) {
            $scope.searchName = data.value;
            $scope.searchType = data.type == 1 ? "studentName" : "userPhone";
            pagerRendercheck = false;
            getcouponcheckList(0);   //获取列表
        }
        $scope.chargeTypeforcheck = function (type) {
            if (type) {
                if ($scope.usageState1) {
                    $scope.usageState1 = true;
                    $scope.usageState2 = false;
                }
            } else {
                if ($scope.usageState2) {
                    $scope.usageState2 = true;
                    $scope.usageState1 = false;
                }
            }
            pagerRendercheck = false;
            getcouponcheckList(0);
        };
        $scope.countermandCoupon = function(couponPackageId){
            var isEdit = layer.confirm('是否确认撤回该优惠券？', {
                title: "撤回",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function () {
                var params = {
                    couponPackageId:couponPackageId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/coupon/countermandCoupon",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function (res) {
                        if (res.status == '200') {
                            pagerRendercheck = false;
                            getcouponcheckList(0);
                        }
                    }
                });
                layer.close(isEdit);
            }, function () {
                layer.close(isEdit);
            });
        };
        //列表操作
        function operationList(d, type, ind) {
            switch (type) {
                case 'share':   //点击分享
                    $scope._url = d.qrUrl;
                    $('.onlineShare_code').html('');
                    openPopByDiv('分享' + "<span style='color: #f5565b'>（" + d.couponName + "）</span>", '.onlineshare', '400px');
                    jQuery('.onlineShare_code').qrcode({
                        render: "canvas",
                        width: 300,
                        height: 300,
                        text: $scope._url,
                    });
                    break;
                case 'mall_on': //上下架
                    if(!$scope.potentialQuanxian_opra)return;
                    var isEdit = layer.confirm('是否修改状态?', {
                        title: "修改信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function () {
                        var params = ind ? {
                                'couponId': d.couponId,
                                'status': d.status == 0 ? 1 : 0
                            } : {
                                'couponId': d.couponId,
                                'sync': d.sync == 0 ? 1 : 0
                            };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/coupon/modifyCoupon",
                            type: "post",
                            data: JSON.stringify(params),
                            success: function (res) {
                                if (res.status == 200) {
                                    getMallList(start);
                                    layer.msg('已修改');
                                }
                            }
                        });
                        layer.close(isEdit);
                    }, function () {
                        layer.close(isEdit);
                    });
                    break;
                case 'copy': //商品列表点击编辑
                    $scope.opencreatCoupon('creat_coupon', '760px', {type: 2,iscopy:true, data: angular.copy(d)});
                    break;
                case 'edit': //商品列表点击编辑
                    $scope.opencreatCoupon('creat_coupon', '760px', {type: 2, data: angular.copy(d)});
                    break;
                case 'mall_check':
                    openPopByDiv('查看详情', '.checkCouponUse', '860px');
                    $scope.selectInfoId_forcheck = '1'; //select初始值
                    $scope.searchData_forcheck = {
                        1: '姓名',
                        2: '联系电话',
                    };
                    $scope.oldOrNew = "";
                    $scope.usageState1 = "";
                    $scope.usageState2 = "";
                    $scope.expireFlag = "";
                    $scope.currentCouponId = d.couponId;
                    pagerRendercheck = false;
                    getcouponcheckList(0);
                    break;
            }
        }
        //筛选栏操作
        function operationScreen() {
            $scope.opencreatCoupon('creat_coupon', '760px', {type: 1});
        }
        $scope.onReset = function (flag) {   //点击重置
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (flag) {
                couponName = undefined;
                $scope.discountType = undefined;
                conditions = undefined;
                productId = undefined;
                userScope = undefined;
                $scope.productScope = undefined;
                filter = undefined;
                $scope.searchStatus = undefined;
                pagerRender = false;
                getMallList(0);
            } else {
                $scope.searchType = undefined;
                $scope.searchName = undefined;
                $scope.oldOrNew = undefined;
                $scope.usageState1 = undefined;
                $scope.usageState2 = undefined;
                $scope.expireFlag = undefined;
                pagerRendercheck = false;
                getcouponcheckList(0);
            }
        };
        //获取商品列表
        function getMallList(start_) {
            start = start_ == 0?"0":start_;
            var params = {
                'start': start_,
                'count': eachPage,
                'couponName': couponName,
                'discountType': $scope.discountType,
                'conditions':conditions,
                'productId':productId,
                'userScope': userScope,
                'productScope': $scope.productScope,
                'filter': filter,
                "status": $scope.searchStatus
            };
            for (var i in params) {
                if (params[i] === '' || params[i] == undefined) {
                    delete params[i];
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/coupon/listCoupon",
                type: "get",
                data: params,
                success: function (res) {
                    if (res.status == '200') {
                        $scope.mallList = res.context.items;
                        angular.forEach($scope.mallList,function(item){
                            if(item.productScope == 1){
                                item.productText = '适用商品：' + item.productNames.join(' ')
                            }
                        })
                        renderPager_mall(res.context.totalNum);
                    }
                }
            })
        }
        // 获取使用列表
        function getcouponcheckList(start) {
            var params = {
                'start': start,
                'count': s_eachPage,
                'couponId': $scope.currentCouponId,
                'searchType': $scope.searchType,
                'searchName': $scope.searchName,
                'oldOrNew': $scope.oldOrNew ? 0 : "",//0新1老
                'usageState': $scope.usageState1 ? 0 : $scope.usageState2 ? 1 : "",//0未使用 1已使用
                "expireFlag": $scope.expireFlag ? 1 : "" //1 已过期
            };
            for (var i in params) {
                if (params[i] === '' || params[i] == undefined) {
                    delete params[i];
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/coupon/listCouponPackage",
                type: "get",
                data: params,
                success: function (res) {
                    if (res.status == '200') {
                        $scope.couponcheckList = res.context.items;
                        renderPager_check(res.context.totalNum);
                    }
                }
            })
        }
        //分页
        function renderPager_mall(total) { //父页面分页
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
                        localStorage.setItem("couponPage", eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getMallList(start); //回掉
                }
            });
        }
        function renderPager_check(total) { //子页面分页
            if (pagerRendercheck)
                return;
            pagerRendercheck = true;
            $M_box2.pagination({
                totalData: total || 0, // 数据总条数
                showData: s_eachPage, // 显示几条数据
                jump: true,
                coping: true,
                count: 2, // 当前页前后分页个数
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页',
                callback: function (api) {
                    if (api.getCurrentEach() != s_eachPage) {  //本地存储记下每页多少条
                        s_eachPage = api.getCurrentEach();
                        localStorage.setItem("couponPage1", s_eachPage);
                    }
                    start1 = (api.getCurrent() - 1) * s_eachPage; // 分页从0开始
                    getcouponcheckList(start1); //回掉
                }
            });
        }
    }]
});