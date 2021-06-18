define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = yznDateFormatYM(GetDateStr(-149)) + " 到 " + yznDateFormatYM(thisTime());
        var $type, $goodsId = undefined;
        var orderType = 'desc';
        var orderName="total";
        init();
        function init(){
            getlistGoodsName();
            $scope.screen_classType = [
               {name:"售卖数量",id:"data2"},
               {name:"售卖金额",id:"data3"},
               {name:"退学杂数量",id:"data4"},
               {name:"退学杂金额",id:"data5"},
            ];
             $scope.teacListThead = [
                {'name': '费用名称','width': '150px',},
                {'name': '售卖数量','width': '20%', 'issort': true,id:"data2",},
                {'name': '售卖金额','width': '20%', 'issort': true,id:"data3"},
                {'name': '退学杂数量','width': '20%', 'issort': true,id:"data4"},
                {'name': '退学杂金额','width': '20%', 'issort': true,id:"data5",},
                {'name': '利润','width': '20%', 'issort': true,'sort':'desc',id:"total"},
            ];
            $scope.studNavJud = 2;
            $scope.changeByGoods = changeByGoods;//物品选择
            $scope.changeClassType = changeClassType;//授课类型
            $scope.switchStudNav = switchStudNav;
            $scope.sortCllict0 = sortCllict0;//升降序
            
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                type: 'month',
                done: function(value) {
                    $scope.searchTime = value;
                    $goodsId = undefined;
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    }
                    changeData();
                }
            });
            changeData();
        }
        function getlistGoodsName(){
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/list",
                type: "get",
                data: {pageType:0,goodsType:2},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_goods = data.context;
                    }
                }

            })
        }
        function switchStudNav(n){
            switch (n){
            	case 1:$state.go("financeStatistics/goods_statistics");
            		break;
            	case 2:$state.go("financeStatistics/fee_statistics");
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
        function changeByGoods(g){
            $goodsId = g != null?g.goodsId:undefined;
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['统计类别']();
                $scope.typeName = undefined;
            })
            changeChart();
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
                goodsId:$goodsId,
                goodsType:2,
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
                url: CONFIG.URL + "/api/oa/statistics/listGoodsStatisticsChart",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.chartData = data.context;
                        changeDataChart("利润","total",data.context);
                    }
                }

            })
        }
        function changeDataChart(t,d,list){
            var chartData = {
                contain : $('#mainechart'),
                dataYname:$scope.typeName?$scope.typeName:"利润",
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
                    }

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
                goodsId:$goodsId,
                goodsType:2,
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
                url: CONFIG.URL + "/api/oa/statistics/listGoodsStatistics",
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
                goodsType:2,
                goodsId:$goodsId
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
            window.open(CONFIG.URL + '/api/oa/statistics/exportGoodsStatistics?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('financeStatistics',{});
        }
    }]
});