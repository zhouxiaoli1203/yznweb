define(['laydate', 'echarts'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        init();

        function init() {
            //工作台跳转数据汇总
            if($stateParams.screenValue.name == "workbench" && $stateParams.screenValue.type == '数据汇总') {
                if($stateParams.screenValue.value == 3) {
                    $state.go('financeStatistics/used_money_bytime', {});
                }
                return;
            }
            getOverViewData(1);
            getOverViewData(2);
            getOverViewData(3);
            getOverViewData(4, 1);
            getOverViewData(5);
            $scope.mapClick = mapClick; //点击图表数据日期切换
            $scope.routerGo = routerGo; //查看详情路由跳转
        }

        function routerGo(type) {
            switch(type) {
                case 1:
                    $state.go('financeStatistics/finance_infos', {});
                    break;
                case 2:
                    $state.go('financeStatistics/business_infos', {});
                    break;
                case 3:
                    $state.go('financeStatistics/goods_statistics', {});
                    break;
                case 4:
                    $state.go('financeStatistics/used_money_bytime', {});
                    break;
                case 5:
                    $state.go('financeStatistics/useing_money_bytime', {});
                    break;
            }
        }

        //点击图表的数据日期切换
        function mapClick(type, date, evt) {
            $(evt.target).closest('p').find('em').removeClass('collect_head_ps');
            $(evt.target).addClass('collect_head_ps');
            getOverViewData(type, date);
        }
        function setUrl(type){
            switch (type){
            	case 1:return "getFinancialStatistics";//财务概况
            		break;
            	case 2:return "getBusinessStatistics";//经营概况
            		break;
            	case 3:return "listGoodsStatisticsChart";//学杂统计
            		break;
            	case 4:return "amountStatisticsChart";//消课金额
            		break;
            	case 5:return "getAdvancedPaymentByTableNew";//待消金额
            		break;
            	default:
            		break;
            }
        }
        //获取数据概览图表
        function getOverViewData(types, date) {
            $scope.dateTpye = date;
            var dayNum = date == 1?"7":date == 2?"30":undefined;
            var params = {};
            if(types != 4 && types != 5){
                $scope.searchTime = yznDateFormatYM(GetDateStr(-149)) + " 到 " + yznDateFormatYM(thisTime());
                var beginTime = $scope.searchTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.searchTime.split(" 到 ")[1].replace(/[-]/g, "");
                var nextMonth = getNextMonth_(new Date($scope.searchTime.split(" 到 ")[1]),2);
                if (beginTime > endTime) {
                    return;
                }
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+"-01 00:00:00";
                params["endTime"] = yznDateFormatYM(nextMonth)+"-01 00:00:00";
                if(types == 3){
                    params["goodsType"] = 1;
                }

            }
            if(types == 4){
                params["dayNum"] = dayNum;
                params["role"] = "1";
                params["feeType"]="1";
            }
            if(types == 5){
                params["feeType"] = "0";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/"+setUrl(types),
                type: "get",
                data: params,
                success: function(res) {
                    if(res.status == 200) {
                        var chartData = {
                            contain: '',
                            dataName: [],
                            dataSeries: [],
                            dataTitle: '',
                            echartType:'bar',
                            lineType:'shadow',
                            barColor: '#69C2ED',
                        }
                        switch (types){
                        	case 1:chartData.contain = $('#mainechart_1');
                        		break;
                        	case 2:chartData.contain = $('#mainechart_2');
                        		break;
                        	case 3:chartData.contain = $('#mainechart_3');
                        		break;
                        	case 4:chartData.contain = $('#mainechart_4');
                        		break;
                        	case 5:chartData.contain = $('#mainechart_5');
                        		break;
                        	default:
                        		break;
                        }
                        if(types == 5){
                            res.context = getNewTable("price","desc",res.context);
                        }
                        angular.forEach(res.context, function(val,index) {
                            switch(types) {
                                case 1:
                                    chartData.dataTitle = '合计';
                                    chartData.dataName.push(val.data1);
                                    chartData.dataSeries.push(val.total);
                                    break;
                                case 2:
                                    chartData.dataTitle = "合计";
                                    chartData.dataName.push(val.data1);
                                    chartData.dataSeries.push(val.total);
                                    break;
                                case 3:
                                    chartData.dataTitle = '利润';
                                    chartData.dataName.push(val.data1);
                                    chartData.dataSeries.push(val.total);
                                    break;
                                case 4:
                                    chartData.dataTitle = '消课金额';
                                    chartData.dataName.push(val.data1);
                                    chartData.dataSeries.push(val.total);
                                    break;
                                case 5:
                                if(index<7){
                                    chartData.dataTitle = '待消金额';
                                    chartData.dataName.push(val.name);
                                    chartData.dataSeries.push(val.price);
                                    break;
                                }
                            }
                        });
                        if(chartData.contain[0]){
                            $timeout(function(){
                                echart(chartData);
                            });
                        }
                    };
                }
            });
        }

        //获取图形的数据（contain：容器元素, dataName：x轴值, dataSeries：y轴值, dataTitle：浮框名字, barColor：柱状颜色）
        function echart(chartData) {
            // 基于准备好的dom，初始化echarts实例
            var worldMapContainer = chartData.contain[0];
            //用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
            var resizeWorldMapContainer = function() {
                worldMapContainer.style.width = $('.mainechart').width() + 'px';
            };
            //设置容器高宽
            resizeWorldMapContainer();
            // 基于准备好的dom，初始化echarts实例
            var myChart2 = echarts.init(worldMapContainer);
            // 指定图表的配置项和数据
            var option = {
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        type :  chartData.lineType      // 默认为直线，可选为：'line' | 'shadow'
                    },
                     position: function(point, params, dom, rect, size){
                        return setTooltipPosition(point, params, dom, rect, size);
                    },
                },
                xAxis : [
                    {
                        type : 'category',
                        data : chartData.dataName,
                        color: '#dcdcdc',
                        axisLabel: {
                            color: '#444'
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#dcdcdc'
                            }
                        },
                        axisTick: {
                            alignWithLabel: true,
                        }
                    }
                ],
                yAxis : [
                    {
                        type : 'value',
                        axisLabel: {
                            color: '#444',
                            formatter:function(num) {
                                return tranNumber(num);
                            },
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#dcdcdc'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: '#dcdcdc',
                                type: 'dotted'
                            }
                        }
                    }
                ],
                series : [
                    {
                        name: chartData.dataTitle,
                        type: chartData.echartType,
                        barWidth: $scope.dateTpye==2?'11px':'20px',
                        smooth: false,   //关键点，为true是不支持虚线的，实线就用true
                        itemStyle:{
                            normal:{
                                color: chartData.barColor,
                            },
                        },
                        data: chartData.dataSeries
                    }
                ]
            };
            //清空画布，防止缓存
            myChart2.clear();
            // 使用刚指定的配置项和数据显示图表。
            myChart2.setOption(option);
            //用于使chart自适应高度和宽度
            window.addEventListener("resize", function() {
                resizeWorldMapContainer();
                myChart2.resize();
            });

        }

    }]
});