define(['laydate', 'pagination',], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name = undefined;
        init();

        function init() {
            $scope.studNavJud = 3;
            $scope.selectInfoNameId = 'performanceRuleName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                performanceRuleName: '名称',
            };
            //表头
            $scope.perRuleListThead = [
                {
                    'name': '名称',
                    'width': '50%'
                },  {
                    'name': '绩效规则',
                    'width': '50%'
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '150'
                },
            ];
            $scope.operatePerformance = checkAuthMenuById("98"); //操作工资
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.openPerformanceRule = openPerformanceRule;//新增绩效规则窗口
            $scope.deletePerformanceRule = deletePerformanceRule;//删除绩效规则窗口
            $scope.addItem = addItem;//添加
            $scope.removeItem = removeItem;//删除
            $scope.closePop = closePop;//关闭弹框
            perRuleList(0);
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.pop == "新增绩效规则") {
                    $timeout(function () {
                        openPerformanceRule('add');
                    });
                }
            }
        }
        function addItem(list){
            if (list) {
                list.push({
                    classHour:"",
                    classFees:""
                });
            }
        }
        function removeItem(list,ind){
            if(list){
                list.splice(ind,1);
            }
        }
        function closePop(){
            layer.close(dialog);
        }
        function switchStudNav(n) {
            $scope.studNavJud = n;
            switch (n){
            	case 1:$state.go("performance", {});
            		break;
            	case 2:$state.go("performance/setting", {});
            		break;
            	case 3:$state.go("performance/rule", {});
            		break;
            	default:
            		break;
            }
        }
        function searchdata(d) {
            pagerRender = false;
            search_type = d?d.type:null;
            search_name = d?d.value:null;
            perRuleList(0);
        }
        function perRuleList(start) { //获取请假补课列表信息
            var data = {
                "start": start.toString(),
                "count": eachPage,
                "searchType": "performanceRuleName",
                "searchName": search_name,
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + "/api/oa/payroll/listPerformanceRule",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.per_ruleList = data.context.items;
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
                    perRuleList(start); //回调
                }
            });

        }
        function openPerformanceRule(type,x){
            $scope.perRuleType = type;
            $scope.changeCommissionWay = changeCommissionWay;//切换提成方式
            if(type == 'add'){
                $scope.expense = {
                    performanceRuleId:undefined,
                    performanceRuleName:"",
                    commissionWay:"1",
                    classFees:"",
                    gradientRule:"1",
                    performanceRuleGradientList:[{
                        classHour:"",
                        classFees:""
                    }]
                };
            }else{
                getRuleInfo(x);
            }
            $scope.performanceRule_confirm = performanceRule_confirm;
            openPopByDiv((type == 'add'?"新增":"编辑")+'绩效规则','.performanceRule','760px');

            function changeCommissionWay(t){
                if($scope.perRuleType == "edit"){
                    if($scope.oldType == t){
                        getRuleInfo(x);
                    }else{
                        $scope.expense.commissionWay=t;
                        $scope.expense.classFees="";
                        $scope.expense.gradientRule="1";
                        $scope.expense.performanceRuleGradientList = [{
                                classHour:"",
                                classFees:""
                            }];
                    }
                }else{
                    if(t == 5){
                        $scope.expense.commissionWay=t;
                        $scope.expense.gradientRule="1";
                        $scope.expense.performanceRuleGradientList = [{
                                classHour:"",
                                classFees:""
                            }];
                    }
                }
            }
            function getRuleInfo(n){
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/detailPerformanceRule",
                    type: "get",
                    data: {performanceRuleId:n.performanceRuleId},
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.expense = data.context;
                            $scope.oldType = angular.copy(data.context.commissionWay);
                            if($scope.expense.performanceRuleGradientList.length<=0){
                                $scope.expense.performanceRuleGradientList = [{
                                    classHour:"",
                                    classFees:""
                                }];
                            }
                        }

                    }
                })
            }
            function performanceRule_confirm(){
                var param=angular.copy($scope.expense);
                var url;
                if($scope.perRuleType == 'add'){
                    url="addPerformanceRule";
                }else{
                    url="modifyPerformanceRule";
                }
                if(param.performanceRuleGradientList && param.performanceRuleGradientList.length>0){
                    var list = param.performanceRuleGradientList;
                    for(var i = 0,len = list.length;i<len;i++){
                        if($scope.expense.commissionWay != 5){
                            if(list[i].classHour*1<=0 || list[i].classFees*1<=0){
                                return layer.msg("梯度规则中课时/金额不能≤0");
                                break;
                            }
                        }else{
                            if((list[i].classHour && list[i].classFees==="") || (list[i].classFees && list[i].classHour==="")){
                                return layer.msg("计算规则人次和金额全填或全不填");
                                break;
                            }
                            if(list[i].classFees===""&&list[i].classHour===""){
                                param.performanceRuleGradientList=[];
                            }
                        }

                        if(list[i+1] && list[i].classHour*1>=list[i+1].classHour*1){
                            return layer.msg("梯度规则请按由小到大填写");
                            break;
                        }
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/"+url,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            closePop();
                            pagerRender = false;
                            perRuleList(0);
                        }

                    }
                })
            }
        }
        function deletePerformanceRule(x){
            var isDelect = layer.confirm("是否删除该绩效规则，删除后不可恢复", {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/deletePerformanceRule",
                    type: "post",
                    data: JSON.stringify({performanceRuleId:x.performanceRuleId}),
                    success: function(res) {
                        if (res.status == 200) {
                            layer.close(isDelect);
                            pagerRender = false;
                            perRuleList(0);
                        }
                    }
                });

            }, function() {
                layer.close(isDelect);
            })
        }
    }]
})