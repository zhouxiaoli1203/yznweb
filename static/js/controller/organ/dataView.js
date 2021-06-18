define(['laydate', 'echarts'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        init();
        
        function init() {
            getOverViewData(1, 0);
            getOverViewData(2, 0);
            getOverViewData(3, 0);
            getOverViewData(4, 0);
            
            getOverViewUpData(0);
            getOverViewUpData_();
            $scope.mapClick = mapClick; //点击图表数据日期切换
            $scope.upClick = upClick; //点击图表数据日期切换
            $scope.routerGo = routerGo; //查看详情路由跳转
        }
        
        function routerGo(type) {
            switch(type) {
                case 1: 
                    $state.go('organ_saleColumn', {dataType: '新增潜客'});
                    break;
                case 2: 
                    $state.go('organ_saleColumn', {dataType: '签约金额'});
                    break;
                case 3: 
                    $state.go('organ_eduSummary', {dataType: '消课课时'});
                    break;
                case 4: 
                    $state.go('organ_eduSummary', {dataType: '消课金额'});
                    break;
            }
        }
        
        //点击上半部分数据日期切换
        function upClick(type, evt) {
            $(evt.target).closest('p').find('em').removeClass('collect_head_ps');
            $(evt.target).addClass('collect_head_ps');
            getOverViewUpData(type);
        }
        
        //获取数据概览上面部分
        function getOverViewUpData(dateType) {
            $.hello({
                url: CONFIG.URL + "/api/org/statistics/getHuiZongChart",
                type: "get",
                data: {
                    'timeType': dateType,
                },
                success: function(data) {
                    if(data.status == 200) {
//                      console.log(data);
                        $scope.overViewUpData = data.context[0];
                    };
                }
            });
        }
        
        //校区和学员数据
        function getOverViewUpData_() {
            $.hello({
                url: CONFIG.URL + "/api/org/statistics/getShopListInfo",
                type: "get",
                data: {},
                success: function(data) {
                    if(data.status == 200) {
                        $scope.overViewUpData_ = data.context;
                    };
                }
            });
        }
        
        //点击图表的数据日期切换
        function mapClick(type, date, evt) {
            $(evt.target).closest('p').find('em').removeClass('collect_head_ps');
            $(evt.target).addClass('collect_head_ps');
            getOverViewData(type, date);
        }
        //获取数据概览图表
        function getOverViewData(type, date) {
            var params = {
                'timeType': date,
            };
            $.hello({
                url: CONFIG.URL + "/api/org/statistics/getWorkbenchChart",
                type: "get",
                data: params,
                success: function(res) {
                    if(res.status == 200) {
//                      console.log(res);
                        var chartData = {
                            contain: '',
                            dataName: [],
                            dataSeries: [],
                            dataTitle: '',
                            barColor: '#69C2ED',
                        }
                        angular.forEach(res.context, function(val) {
                            switch(type) {
                                case 1: 
                                    chartData.dataTitle = '新增潜客';
                                    chartData.contain = $('#mainechart_1');
                                    chartData.barColor = '#69C2ED';
                                    chartData.dataName.push(val.date);
                                    chartData.dataSeries.push(val.addPotentialCustomer);
                                    break;
                                case 2: 
                                    chartData.dataTitle = '签约金额';
                                    chartData.contain = $('#mainechart_2');
                                    chartData.barColor = '#69C2ED';
                                    chartData.dataName.push(val.date);
                                    chartData.dataSeries.push(val.contractPrice);
                                    break;
                                case 3: 
                                    chartData.dataTitle = '消课课时';
                                    chartData.contain = $('#mainechart_3');
                                    chartData.barColor = '#F7C55A';
                                    chartData.dataName.push(val.date);
                                    chartData.dataSeries.push(val.shoppingCourseTime);
                                    break;
                                case 4: 
                                    chartData.dataTitle = '消课金额';
                                    chartData.contain = $('#mainechart_4');
                                    chartData.barColor = '#F7C55A';
                                    chartData.dataName.push(val.date);
                                    chartData.dataSeries.push(val.shoppingCoursePrice);
                                    break;
                            }
                        });
//                      console.log(chartData);
                        echart(chartData);
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
                        type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
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
                            color: '#444'
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
                        type: 'bar',
                        barWidth: '20px',
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