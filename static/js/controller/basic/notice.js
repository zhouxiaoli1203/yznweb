define(['laydate', 'socketIo', 'szpUtil', 'mySelect', 'courseAndClass_sel', 'students_sel', 'qrcode'], function(laydate, socketIo) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$sce', function($scope, $rootScope, $http, $state, $stateParams, $sce) {
        var dialog_img;
        init();
        function init(){
            getConfig();
            $scope.messageSetList1 = [],$scope.messageSetList2 = [];
            $scope.visitNavJud = 6;
            $scope.nameListThead_2 = [  //短信设置
                {'name': '触发条件'},
                {'name': '功能描述', 'width': '420px'},
                {'name': '应用端通知', 'align': 'center'},
                {'name': '短信通知', 'align': 'center'},
                {'name': '预览', 'width': '190px', 'align': 'center'},
            ];
            $scope.operationPower = checkAuthMenuById(87);  //是否拥有操作权力
            getmessageSetList();
            $scope.operationList_msg = operationList_msg;//操作按钮
            $scope.switchVisitNav = switchVisitNav;
            $scope.moreSet = moreSet;//更多设置
            $scope.set_confirm = set_confirm;//更多设置确认
            $scope.closePop = closePop;
        }
        function closePop(){
                layer.close(dialog);
            }
        function switchVisitNav(n){
            switch (n){
                case 1:$state.go("center",{});
                    break;
                case 2:
                localStorage.setItem("$statetime", 2);
                $state.go("time",{pageType:2});
                    break;
                case 3:
                localStorage.setItem("$statetime", 3);
                $state.go("time",{pageType:3});
                    break;
                case 4:$state.go("classroom",{});
                    break;
                case 5:$state.go("functionMange",{});
                    break;
                case 6:$state.go("notice",{});
                    break;
                case 7:$state.go("nearbySchool",{});
                    break;
                case 8:$state.go("share",{});
                    break;
                default:
                    break;
            }
        }
        //短信列表的操作
        function operationList_msg(type, d) {
            $scope.previewImg = "";
            console.log(d)
            var tit = '', params;
            if(type == 1 || type == 2) {
                if(!$scope.operationPower) {
                    layer.msg('未拥有操作权限');
                    return;
                }
            }
            switch(type) {
                case 1: //开关微信小程序通知
                    tit = d.wxappStatus?'是否关闭应用端通知？':'是否开启应用端通知';
                    params = {
                        'id': d.id,
                        'wxappStatus': d.wxappStatus?0:1,
                    };
                    break;
                case 2: //开关短信通知
                    tit = d.smsStatus?'是否关闭短信通知？':'是否开启短信通知';
                    params = {
                        'id': d.id,
                        'smsStatus': d.smsStatus?0:1,
                    }
                    break;
                case 3: //预览短信
                    $scope.previewImg = d.smsPreview;
                    dialog_img = layer.open({
                        type: 1,
                        title: false,
                        skin: 'layerui layer_message_see', //样式类名
                        closeBtn: false, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '400px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.message_see')
                    });
                    break;
                case 4: //预览小程序
                    $scope.previewImg = d.wxappPreivew;
                    dialog_img = layer.open({
                        type: 1,
                        title: false,
                        skin: 'layerui layer_message_see', //样式类名
                        closeBtn: false, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '400px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.message_see')
                    });
                    break;
                case 5: //关闭预览
                    layer.close(dialog_img);
                    break;
                case 6: //关闭预览
                    $scope.previewImg = d;
                    dialog_img = layer.open({
                        type: 1,
                        title: false,
                        skin: 'layerui layer_message_see', //样式类名
                        closeBtn: false, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '400px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.message_see')
                    });
                    break;
            }
            
            //如果是短信设置列表的开关操作
            if(type == 1 || type == 2) {
                detailMsk(tit, function() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/sms/updateConfig',
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if(res.status == 200) {
                                getmessageSetList();
                            };
                        }
                    });
                })
            }
        }
        //获取短信通知设置列表数据
        function getmessageSetList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/sms/configList',
                type: "get",
                data: {},
                success: function(res) {
                    if(res.status == 200) {
                        var list1 = [],list2 = [];
                        angular.forEach(res.context,function(v){
                            if(v.target == 1){
                                list1.push(v);
                            }else{
                                list2.push(v);
                            }
                        });
                        $scope.messageSetList1 = list1;
                        $scope.messageSetList2 = list2;
                    };
                }
            });
        }
        function moreSet(){
            $scope.setData = {
                smsStudentBalanceShow:$scope.currentShop.smsStudentBalanceShow==1?true:false,
                smsMsg:$scope.currentShop.smsMsg
            };
            openPopByDiv("更多设置","#moreSetPop","560px");
        }
        function set_confirm(){
            var param = {
                smsStudentBalanceShow:$scope.setData.smsStudentBalanceShow?"1":"0",
                smsMsg:$scope.setData.smsMsg
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/sms/updateShopInWx",
                type: "post",
                data:JSON.stringify(param),
                success: function (data) {
                    if (data.status == '200') {
                        $scope.currentShop.smsStudentBalanceShow = $scope.setData.smsStudentBalanceShow?"1":"0";
                        $scope.currentShop.smsMsg = $scope.setData.smsMsg;
                        closePop();
                        layer.msg('设置成功');
                    }
                }
            })
        }
        function getConfig(){
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function (data) {
                    if (data.status == '200') {
                        $scope.currentShop = data.context;
                    }
                }
            })
        }
    }];
});