define(['laydate', 'echarts'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        init();

        function init() {
            //工作台跳转数据汇总
            if($stateParams.screenValue.name == "workbench" && $stateParams.screenValue.type == '数据汇总') {
                if($stateParams.screenValue.value == 2) {
                    $state.go('new_eduStatistics/teachHours_3', {});
                }
                return;
            }
            getOverViewData(1, 1);
            getOverViewData(2, 1);
            getOverViewData(3, 1);

            $scope.mapClick = mapClick; //点击图表数据日期切换
            $scope.routerGo = routerGo; //查看详情路由跳转
        }

        function routerGo(type) {
            switch(type) {
                case 1:
                    $state.go('new_eduStatistics/teachHours', {});
                    break;
                case 2:
                    $state.go('new_eduStatistics/classAffair_show', {});
                    break;
                case 3:
                    $state.go('new_eduStatistics/eduAffair_attend', {});
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
            	case 1:return "getTeacherCourseTimeChartNew";//授课分析
            		break;
            	case 2:return "getDisplayTableNew";//课务分析
            		break;
            	case 3:return "getAttendanceRateByDateNew";//教务分析
            		break;
            	default:
            		break;
            }
        }
        //获取数据概览图表
        function getOverViewData(types, date) {
            $scope.dateTpye = date;
            var dayNum = date == 1?"7":date == 2?"30":undefined;
            var params = {
                'dayNum': dayNum,
            };
            if(types == 1){
                params["courseDataType"] = undefined;
                params["teacherType"] = "1";
            }
            if(types == 2){
                params["dataType"] = "course";
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
                        	default:
                        		break;
                        }
                        angular.forEach(res.context, function(val,index) {
                            switch(types) {
                                case 1:
                                    chartData.dataTitle = '授课课时';
                                    chartData.barColor = '#69C2ED';
                                    chartData.dataName.push(val.date);
                                    chartData.dataSeries.push(val.val);
                                    break;
                                case 2:
                                    if(index<7){
                                        chartData.dataTitle = "课堂展示率";
                                        chartData.barColor = '#69C2ED';
                                        chartData.dataName.push(val.name);
                                        chartData.dataSeries.push(val.displayRate.toFixed(2));
                                    }
                                    break;
                                case 3:
                                    chartData.dataTitle = '出勤率';
                                    chartData.barColor = '#FF6166';
                                    chartData.echartType = 'line';
                                    chartData.lineType = 'line';
                                    chartData.dataName.push(val.date);
                                    chartData.dataSeries.push(val.attendanceRate.toFixed(2));
                                    break;
                            }
                        });
                        console.log(chartData);
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