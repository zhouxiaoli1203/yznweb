define([ "laydate", "mySelect"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchSchool, searchGrade, searchName = undefined;
        $scope.selected1 = $scope.selected2 = undefined;
        $scope.searchTime = yznDateFormatYMd(new Date());
        $scope.weekDate = returnWeek(new Date($scope.searchTime).getDay());
        init();
        function init(){
            getSchools();
            $scope.nameListThead = [
                {'name': '接送','width': '15%'},
                {'name': '姓名','width': '20%'},
                {'name': '联系方式','width': '15%'},
                {'name': '学校','width': '15%'},
                {'name': '年级','width': '15%'},
                {'name': '状态','width': '10%'},
                {'name': '经办人','width': '10%'},
                {'name': '操作','width': '120px','align':'center'},
            ];
            $scope.kindSearchData = {studentName: '学员姓名、联系方式'};
            $scope.selectInfoNameId = 'studentName';
            $scope.screen_grade = getConstantList(CONSTANT.STUDENTGRADE);//潜客年级列表
            $scope.SearchData = Searchdata;
            $scope.Enterkeyup = Searchdata;//输入框筛选
            $scope.changeSchool = changeSchool;
            $scope.changeGrade = changeGrade;
            $scope.changeByTime = changeByTime;
            $scope.changeByStatus = changeByStatus;
            $scope.onReset = onReset;//重置
            $scope.closePop = closePop;
            $scope.cancelPickup = cancelPickup;//取消接送
            $scope.viewDetail = viewDetail;//查看详情
            $scope.openAdjust = openAdjust;//调整节假日
            $scope.adjust_time_confirm = adjust_time_confirm//确认调整
            laydate.render({
                elem: '#searchTime', //指定元素
                isRange: false,
                value:yznDateFormatYMd(new Date()),
                btns:[],
                done: function(value) {
                    $scope.searchTime = value;
                    $scope.weekDate = getDayFun(value);
                    pagerRender = false;
                    getPickupList(0);
                }
            });
            
            
            
            
            
            getPickupList(0);
        }
        function getSchools(){
            $.hello({
                url: CONFIG.URL + '/api/oa/pickUp/school/listByStudent',
                type: "get",
                data: {pageType:0},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.schoollist = data.context;
                    }

                }
            })
        }
        function closePop(){
            layer.close(dialog);
        }
        function onReset(){
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            searchSchool = searchGrade = undefined;
            $scope.selected1 = $scope.selected2 = null;
            $scope.searchTime = yznDateFormatYMd(new Date());
            $scope.weekDate = getDayFun($scope.searchTime);
            pagerRender = false;
            getPickupList(0);
        }
        function getDayFun(val){
            return returnWeek(new Date(val).getDay());
        }
        function Searchdata(n){
            searchName = n.value?n.value:undefined;
            pagerRender = false;
            getPickupList(0);
        }
        function changeSchool(val){
            searchSchool = val != null?val.schoolName:undefined;
            pagerRender = false;
            getPickupList(0);
        }
        function changeGrade(val){
            searchGrade = val != null?val.value:undefined;
            pagerRender = false;
            getPickupList(0);
        }
        function changeByTime(e,time){
            $scope.selected1 = e.target.checked?time:undefined;
            pagerRender = false;
            getPickupList(0);
        }
        function changeByStatus(e,type){
            $scope.selected2 = e.target.checked?type:undefined;
            pagerRender = false;
            getPickupList(0);
        }
        function getPickupList(start_){
            if(!$scope.searchTime){
                return layer.msg("请选择日期");
            }
            start = start_ == 0?"0":start_;
            
            var data = {
                start:start_.toString(),
                count:eachPage,
                searchType:"appSearchName",
                searchName:searchName,
                schoolName:searchSchool,
                grade:searchGrade,
                pickUpType:$scope.selected1,
                pickUpStatus:$scope.selected2,
                date:$scope.searchTime+" 00:00:00",
            }
            $.hello({
                url: CONFIG.URL + '/api/oa/pickUp/pickUpInfoList',
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.newDate = data.context.newDate;
                        $scope.pickuplist = data.context.items;
                        leavePager(data.context.totalNum);
                    }

                }
            })
        }
        function leavePager(total) { //分页
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
                    getPickupList(start); //回调
                }
            });

        }
        function cancelPickup(x){
            $scope.detail = angular.copy(x);
            $scope.cancelReason = x.pickUpDesc?x.pickUpDesc:"";
            openPopByDiv("取消接送",".cancel_pickup","560px");
            $scope.cancel_confirm = function(){
                var params={
                    pickUpDate:yznDateFormatYMd($scope.searchTime)+" 00:00:00",
                    pickUpDesc:$scope.cancelReason,
                    pickUpStatus:0,
                    potentialCustomerId:x.potentialCustomerId,
                    pickUpType:x.pickUpType
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/pickUp/addPickUpRecord',
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            closePop();
                            pagerRender = true;
                            getPickupList(start);
                        }
    
                    }
                })
            }
        }
        function viewDetail(x){
            var isDio_ = layer.open({
                title: "查看详情",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                resize: false,
                area: '560px',
                btn: ['需要接送','关闭'], //按钮
                content:"<div class='textAlignLf'><span style='display:inline-block;float:left;'>取消接送原因：</span><span style='display:inline-block;float:left;width:80%;'>"+x.pickUpDesc+"</span></div>",
                yes:function(index,data){
                    detailMsk("确认需要继续接送？",function(){
                        $.hello({
                            url: CONFIG.URL + '/api/oa/pickUp/deletePickUpRecord',
                            type: "post",
                            data: JSON.stringify({pickUpRecordId:x.pickUpRecordId}),
                            success: function(data) {
                                if (data.status == '200') {
                                    closePop();
                                   pagerRender = true;
                                   getPickupList(start);
                                }
            
                            }
                        })
                    });
                },
                cancel:function(){
                    layer.close(isDio_);
                }
            })
        }
        function openAdjust(){
            openPopByDiv("节假日调整",".adjust_time","560px");
            laydate.render({
                elem: "#adjustTime1",
                isRange: false,
                btns:[],
                done: function(value) {
                    $scope.adjustTime1 = value;
                    $scope.adjustDay1 = getDayFun(value);
                    $scope.$apply();
                }
            });
            laydate.render({
                elem: "#adjustTime2",
                isRange: false,
                btns:[],
                done: function(value) {
                    $scope.adjustTime2 = value;
                    $scope.adjustDay2 = getDayFun(value);
                    $scope.$apply();
                }
            });
         
        }
        function adjust_time_confirm(){
            var params={
                oldDate:yznDateFormatYMd($scope.adjustTime1)+" 00:00:00",
                newDate:yznDateFormatYMd($scope.adjustTime2)+" 00:00:00",
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/pickUp/addPickUpChange',
                type: "post",
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == '200') {
                        closePop();
                        pagerRender = false;
                        getPickupList(0);
                    }

                }
            })
        }
    }];
});