define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = yznDateFormatYM(GetDateStr(-149)) + " 到 " + yznDateFormatYM(thisTime());
        var $type =  undefined,orderType = 'desc',orderName = undefined;
        var feeIncomeStr, feeExpenditureStr = "";
        init();
        function init(){
            $scope.head={
                income:[],
                putout:[]
            };
            $scope.income = [];$scope.putout = [];
            getFeeType();
            $scope.screen_classType = [
               {name:"消课金额",id:"data2"},
               {name:"手续费盈收",id:"data3"},
               {name:"手续费亏损",id:"data6"},
               {name:"费用收入",id:"data5"},
               {name:"费用支出",id:"data8"},
               {name:"工资支出",id:"data9"},
               {name:"结课盈收",id:"data4"},
               {name:"结课亏损",id:"data7"},
            ];
            $scope.$watch("head",function(){
                 $scope.teacListThead = [
                    {'name': '月份','width': '100px','issort': true,id:"data1",},
                    {'name': '消课金额','width': '10%', 'issort': true,id:"data2",},
                    {'name': '手续费盈收','width': '10%', 'issort': true,id:"data3"},
                    {'name': '结课盈收','width': '10%', 'issort': true,id:"data4"},
                    {'name': '费用收入','width': '10%', 'issort': true,id:"data5",'img':'static/img/loudou.png',"list":$scope.head.income,"hasDrop":true},
                    {'name': '手续费亏损','width': '10%', 'issort': true,id:"data6"},
                    {'name': '结课亏损','width': '10%', 'issort': true,id:"data7"},
                    {'name': '费用支出','width': '10%', 'issort': true,id:"data8",'img':'static/img/loudou.png',"list":$scope.head.putout,"hasDrop":true},
                    {'name': '工资支出','width': '10%', 'issort': true,id:"data9"},
                    {'name': '合计','width': '10%', 'issort': true,id:"total"},
                ];
            },true);
            $scope.changeClassType = changeClassType;//授课类型
            $scope.switchStudNav = switchStudNav;
            $scope.sortCllict0 = sortCllict0;//升降序
            $scope.selectList = selectList;//勾选类型
            
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                type: 'month',
                done: function(value) {
                    $scope.searchTime = value;
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    }
                    changeData();
                }
            });
            changeData();
        }
        function getFeeType(){
            $.hello({
                url: CONFIG.URL + "/api/oa/shopCost/type/list",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        angular.forEach(data.context,function(v){
                            v.hasSelected = true;
                            if(v.shopCostPayType == 1){
                                $scope.head["income"].push(v);
                            }else{
                                $scope.head["putout"].push(v);
                                
                            }
                            $timeout(function() {
                                $scope.reTheadData_['head']();
                            }, 100, true)
                        });
                    }

                }
            })
            
        }
        function switchStudNav(n){
            switch (n){
            	case 1:$state.go("new_eduStatistics/eduAffair_attend");
            		break;
            	case 2:$state.go("new_eduStatistics/eduAffair_classFull");
            		break;
            	case 3:$state.go("new_eduStatistics/eduAffair_inclass");
            		break;
            	case 4:$state.go("new_eduStatistics/eduAffair_takeclass");
            		break;
            	default:
            		break;
            }
        }

        function sortCllict0(data){
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
        }
        function selectList(data){
             if(data.name == "费用收入"){
                 feeIncomeStr = getDataStr(data.list);
             }
             if(data.name == "费用支出"){
                feeExpenditureStr = getDataStr(data.list);
             }
             changeTable();
        }
        
        function getDataStr(l){
            var str = "";
            angular.forEach(l,function(v){
                if(v.hasSelected){
                    str += v.shopCostTypeId + ",";
                }
            });
            return str = str.substr(0,str.length-1);
        }
         function changeClassType(t){//切换授课类型
            if(t == null){
                $type = undefined;
                $scope.typeName = undefined;
                changeChart();
            }else{
                $type = t.id;
                $scope.typeName = t.name;
                changeDataChart(t.name,t.id,$scope.chartData);
            }
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var params = {
               
            };
            if($scope.searchTime){
                var beginTime = $scope.searchTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.searchTime.split(" 到 ")[1].replace(/[-]/g, "");
                var nextMonth = getNextMonth_(new Date($scope.searchTime.split(" 到 ")[1]),2);
                if (beginTime > endTime) {
                    return;
                }
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+"-01 00:00:00";
                params["endTime"] = yznDateFormatYM(nextMonth)+"-01 00:00:00";
            }else{
                return layer.msg("请选择起始时间");
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getBusinessStatistics",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.chartData = data.context;
                        changeDataChart("合计","total",data.context);
                    }
                }

            })
        }
        function changeDataChart(t,d,list){
            var chartData = {
                contain : $('#mainechart'),
                dataYname:$scope.typeName?$scope.typeName:'合计',
                dataAxis:[],
                dataseries:[],
                times:0
            }
            chartData.times = list.length;
            for (var i = 0,len = chartData.times; i < len; i++) {
                chartData.dataAxis.push(list[i].data1);
                chartData.dataseries.push(list[i][d]);
            }
            if(chartData.contain[0]){
                $timeout(function(){
                    echart(chartData);
                });
            }
        }
        //统计图
        function echart(chartData) {
            //          max = niceInterval(max, false);
            // 基于准备好的dom，初始化echarts实例
            var worldMapContainer = chartData.contain[0];
            //用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
            var wid;
            var resizeWorldMapContainer = function(event) {
                wid = $('.main_echart').width();
                worldMapContainer.style.width = wid + 'px';
            };
            //设置容器高宽
            resizeWorldMapContainer();
            // 基于准备好的dom，初始化echarts实例
            var myChart1 = echarts.init(worldMapContainer);
            var count = (wid / 80) / chartData.times * 100;
            // 指定图表的配置项和数据
            var option = {
                legend: {
                    align: 'left',
                    right: '10',
                    width: worldMapContainer.style.width
                },
                tooltip: {
                    trigger: 'axis',
                     position: function(point, params, dom, rect, size){ 
                        return setTooltipPosition(point, params, dom, rect, size);
                    },
                },
                dataZoom: {
                    type: "slider",
                    show: count > 100 ? false : true,
                    start: 0,
                    end: count,
                    handleSize: '0',
                    zoomLock: false,
                    height:24
                },
                grid: {
                    left: '0',
                    right: '0',
                    top: '13%',
                    containLabel: true
                },
                xAxis: {
                    data: chartData.dataAxis,
                    type: 'category',
                    axisTick: {
                        alignWithLabel: true,
                    },
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#aaa', //左边线的颜色
                            width: '1' //坐标线的宽度
                        }
                    },
                    axisLabel: {
                        interval: 0,
                        formatter:function(params) {
                            return  params;
                        },
                        textStyle: {
                            color: '#444'
                        },

                    }

                },
                yAxis: [{
                    type: "value",
//                  min: 0,
                    //                  max: max,
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#aaa', //左边线的颜色
                            width: '1' //坐标线的宽度
                        }
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: '#444'
                        },
                        formatter:function(num) {
                            return tranNumber(num);
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            // 使用深浅的间隔色
                            type: 'dashed'
                        }
                    },
                }],
                series: [{
                    name:chartData.dataYname,
                    type: 'bar',
                    barCategoryGap: '50',
                    data: chartData.dataseries,
                    barWidth: '30',
                    itemStyle: {
                        normal: {
                            color: '#69C2ED',
                        }
                    },

                }]
            };
            //清空画布，防止缓存
            myChart1.clear();
            // 使用刚指定的配置项和数据显示图表。
            myChart1.setOption(option);
            //用于使chart自适应高度和宽度
            window.addEventListener("resize", function() {
                resizeWorldMapContainer();
                myChart1.resize();
            });

        }
        function changeTable(){
            var params={
                 feeIncomeStr:feeIncomeStr?feeIncomeStr:undefined,
                feeExpenditureStr:feeExpenditureStr?feeExpenditureStr:undefined
            };
            if($scope.searchTime){
                var beginTime = $scope.searchTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.searchTime.split(" 到 ")[1].replace(/[-]/g, "");
                var nextMonth = getNextMonth_(new Date($scope.searchTime.split(" 到 ")[1]),2);
                if (beginTime > endTime) {
                    return;
                }
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+"-01 00:00:00";
                params["endTime"] = yznDateFormatYM(nextMonth)+"-01 00:00:00";
            }else{
                return layer.msg("请选择起始时间");
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getBusinessStatistics",
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
            var params={
                token:localStorage.getItem('oa_token'),
            };
            if($scope.searchTime){
                var beginTime = $scope.searchTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.searchTime.split(" 到 ")[1].replace(/[-]/g, "");
                var nextMonth = getNextMonth_(new Date($scope.searchTime.split(" 到 ")[1]),2);
                if (beginTime > endTime) {
                    return;
                }
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+"-01 00:00:00";
                params["endTime"] = yznDateFormatYM(nextMonth)+"-01 00:00:00";
            }else{
                return layer.msg("请选择起始时间");
            }
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/exportBusinessStatistics?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('financeStatistics',{});
        }
    }]
});