define(['laydate', 'socketIo', 'qrcode'], function(laydate, socketIo) {
    creatPopup({
        el: 'equipPop',
        openPopupFn: 'openEquipPop',
//      closePopupFn: 'closeRollCall',
        htmlUrl: './templates/popup/buyequip_pop.html',
        controllerFn: function($scope, props, SERVICE,$timeout,$state) {
            $scope.props = props;
            init();
            function init(){
                getDeviceLeaseRules();
                $scope.isFirstComein = true;
                $scope.navigation_bar_bgm = 1;
                $scope.fenqiType = 0;
                $scope.params_1={
                    change_num:1,
                }
                
                $scope.PayTypeList = getConstantList({
                    1: '支付宝',
                    2: '微信',
                }); //支付方式
                console.log($scope.PayTypeList);
                $scope.PayProjectList = {'paymentMode':'支付宝', 'paymentMoney': '1'};
                $scope.clickPayTypeIcon = function(d, evt) {  //点击支付方式
                    if(d) {
                        $scope.PayProjectList['paymentMoney'] = d;
                    } 
                };
                $scope.provinceList = {};   //省市列表
                $scope.cityList = [];   //市列表
                $scope.sel_province = sel_province; //选择省
                
                 //省市列表
                $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                    $scope.provinceList = data.provincesList;
                })
                $scope.confirmNext = confirmNext;//点击进行下一步
                $scope.selectFenqi = selectFenqi;//选择分期类型
                $scope.changeNum = changeNum;//计数器
                $scope.openExplain = openExplain;//租赁说明
            }
            
            function getDeviceLeaseRules(){
                $.hello({   //取消订单的回调方法
                        url: CONFIG.URL + '/api/oa/device/getDeviceLeaseRules',
                        type: "get",
                        success: function(res) {
                            if(res.status == 200) {
                                $scope.deviceLeaseRules = res.context;
                                if(res.context){
                                    $scope.deviceLeaseRules[0].active = true;
                                    $scope.selectedRule = $scope.deviceLeaseRules[0];
                                }
                            }
                        }
                    });
            }
            function selectFenqi(n,list){
                if(!n.display){
                    return layer.msg("分期租赁时长不能大于系统剩余使用时长。");
                }
                if(n.active)return;
                if(list){
                    angular.forEach(list,function(v){
                        v.active = false;
                        if(v.deviceLeaseRulesId == n.deviceLeaseRulesId){
                            v.active = true;
                        }
                    });
                }
            }
            $scope.$watch('deviceLeaseRules',function(){
                angular.forEach($scope.deviceLeaseRules,function(v){
                    if(v.active){
                        $scope.selectedRule = v;
                    }
                })
            },true);
            function confirmNext(step){
                switch (step){
                    case 1:$scope.navigation_bar_bgm=1;$scope.isFirstComein = false;
                        break;
                    case 2:
                        $scope.navigation_bar_bgm=2;
                        if($scope.isFirstComein){
                            initBuyer();
                        }
                        break;
                    case 3:confirm_buy();
                        break;
                    default:
                        break;
                }
            }
            function initBuyer(){
                getShopTeach();
                
            }
            function getShopTeach(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    data:{"from":"getAdmin"},
                    success: function (data) {
                        if (data.status == '200') {
                            $scope.params_2 = {
                                name:data.context.shopTeacher?data.context.shopTeacher.teacherName:"",
                                phone:data.context.shopTeacher?data.context.shopTeacher.teacherPhone:"",
                                address:{
                                    province:data.context.province,
                                    city:data.context.city,
                                    detaild:data.context.shopAddress,
                                }
                            };
                            if($scope.params_2.address.province) {
                                angular.forEach($scope.provinceList['0'], function(v, ind){
                                    if($scope.params_2.address.province == v){
                                        $scope.cityList = $scope.provinceList['0_'+ind];
                                    }
                                });
                            }
                        }
                    }
                })
            }
            function confirm_buy(){
                if(!/^1\d{10}$/.test($scope.params_2.phone)){
                    return layer.msg("请输入正确的手机号");
                }
                var param = {
                    "number":$scope.params_1.change_num*1,// 数量
                    "onlinePay":$scope.PayProjectList['paymentMoney'],// 线上支付 1：支付宝 2：微信
                    "consignee":$scope.params_2.name,// 联系人
                    "consigneePhone":$scope.params_2.phone,// 联系电话
                    "province":$scope.params_2.address.province,// 省
                    "city":$scope.params_2.address.city,// 市
                    "address":$scope.params_2.address.detaild,// 地址
                    "deviceLeaseRulesId":$scope.selectedRule.deviceLeaseRulesId// 分期规则id
                }
                $.hello({   //取消订单的回调方法
                        url: CONFIG.URL + '/api/oa/device/createDeviceOrder',
                        type: "post",
                        data:JSON.stringify(param),
                        success: function(res) {
                            if(res.status == 200) {
                                $scope.onlindePayData = res.context;
                                $('.onlinePay_code').html('');
                                jQuery('.onlinePay_code').qrcode({  //渲染二维码
                                    render: "canvas", //也可以替换为table
                                    width: 240,
                                    height: 240,
                                    text: res.context.qrUrl,
                                });
                                
                                //支付完成自动关闭弹窗
                                webSocketInit(res.context.deviceOrderId, function(event) {
                                    var res = JSON.parse(event);
                                    layer.close(dialog);
                                    layer.msg('支付成功',{icon:1});
                                    if(props.page == "签到记录"){
                                        $scope.$emit("changeSigninStatus");
                                    }else{
                                        $scope.$emit("systemInfoChange");
                                    }
                                    $scope.closePopup('equip_popup');
                                    
                                }, socketIo, 'refreshDeviceQRCode');
                                
                                //刷新订单支付状态
                                $scope.reloadOnlinePay = function() {
                                    $.hello({
                                        url: CONFIG.URL + '/api/oa/device/getDevicePayStatus',
                                        type: "get",
                                        data: {'deviceOrderId': res.context.deviceOrderId},
                                        success: function(res) {
        //                                  支付状态 0：未支付 1：已支付
                                            if(res.status == 200) {
                                                if(res.context.payStatus == 1) {
                                                    layer.close(dialog);
                                                    layer.msg('支付成功',{icon:1});
                                                    if(props.page == "签到记录"){
                                                        $scope.$emit("changeSigninStatus");
                                                    }else{
                                                        $scope.$emit("systemInfoChange");
                                                    }
                                                    $scope.closePopup('equip_popup');
                                                   
                                                } else{
                                                    layer.msg('订单待支付');
                                                }
                                            }
                                        }
                                    });
                                }
                                openPopByDiv('扫码支付', '#onlinePay_order', '400px', false);
                            }
                        }
                    });
            }

            function changeNum(t,val){
                if(t == 'add'){
                    ++$scope.params_1.change_num;
                }else{
                    if($scope.params_1.change_num <= 1){
                        $scope.params_1.change_num=1;
                    }else{
                        --$scope.params_1.change_num;
                    }
                }
            }
             //选择省
            function sel_province(x) {
                angular.forEach($scope.provinceList['0'], function(v, ind){
                    if(x == v){
                        $scope.cityList = $scope.provinceList['0_'+ind];
                        $scope.params_2.address.city = $scope.cityList[0];
                    }
                });
            }
            function openExplain(){
                $scope.goPopup("buy_word_popup","960px");
            }
        }
    })
})