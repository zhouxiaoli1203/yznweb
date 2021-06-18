define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.compareType = $scope.compareType1 = false;
        var orderType = 'desc',orderName="price";
        init();
        function init(){
            $scope.teacListThead = [
                {'name': '校区名称','width': '30%'},
                {'name': '剩余购买课时','width': '30%','issort': true,'id':'num'},
                {'name': '剩余赠送课时','width': '30%','issort': true,'id':'giveNum'},
                {'name': '待消金额','width': '30%','issort': true,'sort': 'desc','id':'price'},
            ];
            
            $scope.studNavJud = 1;
            $scope.switchStudNav = switchStudNav;
            $scope.onReset = onReset;//重置
            $scope.chargeType = chargeType;//一对一/一对多
            $scope.sortCllict0 = sortCllict0;//升降序
            
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
            $scope.gotoPartyShop = gotoShop;//进入校区
            changeTable();
        }
        //以下是筛选条件
        function onReset(){
            $scope.compareType = $scope.compareType1 = false;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            changeTable();
        }
         function switchStudNav(n){
            switch (n){
                case 1:$state.go("new_organ_financeSummary/useing_money_bytime");
                    break;
                case 2:$state.go("new_organ_financeSummary/useing_money_bymonth");
                    break;
                default:
                    break;
            }
        }
        function sortCllict0(data){
            console.log(data);
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
        }
        function chargeType(status){
            if(status){
                if($scope.compareType){
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                }
            }else{
                if($scope.compareType1){
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                }
            }
            changeTable();
        }
        
        function changeTable(){
            var params = {
                'feeType':"0",
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
            };
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAdvancedPaymentByTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                    }
                }

            })
        }
        function export_config() {
            var params = {
                'token':localStorage.getItem('oa_token'),
                'feeType':"0",
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
            };
            
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantAdvancedPayment?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_organ_financeSummary',{});
        }
    }]
});