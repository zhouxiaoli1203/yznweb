define(['laydate', 'echarts'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        init();

        function init() {
            //工作台跳转数据汇总
            console.log()
            if($stateParams.screenValue.name == "workbench" && $stateParams.screenValue.type == '数据汇总') {
                if($stateParams.screenValue.value == 1) {
                    $state.go('new_saleStatistics/contract_money', {});
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
                    $state.go('new_saleStatistics/adviserWorks', {});
                    break;
                case 2:
                    $state.go('new_saleStatistics/contract_personnum', {});
                    break;
                case 3:
                    $state.go('new_saleStatistics/channel_statistics', {});
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
            	case 1:return "getSalesByDateNew";//工作概况
            		break;
            	case 2:return "signedChart";//签约概况
            		break;
            	case 3:return "getAddContractByChannelNew";//渠道分析
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
            switch (types){
            	case 1:
            	params["type"]="4";
            		break;
            	case 2:
            	params["type"]="1";
            		break;
            	default:
            		break;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/"+setUrl(types),
                type: "get",
                data: params,
                success: function(res) {
                    if(res.status == 200) {
                        if(types == 1 || types == 2){
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
                                default:
                                    break;
                            }
                            angular.forEach(res.context, function(val) {

                                switch(types) {
                                    case 1:
                                        chartData.dataTitle = '新增潜客';
                                        chartData.dataName.push(val.date);
                                        chartData.dataSeries.push(val.val);
                                        break;
                                    case 2:
                                        chartData.dataTitle = '签约人数';
                                        chartData.dataName.push(val.data1);
                                        chartData.dataSeries.push(val.data2);
                                        break;
                                }
                            });
                        }
                        if(types == 3){
                            var da = res.context;
                            var chartData = {
                                contain:$('#mainechart_3'),
                                colorArr:["#1D6FE9","#6F9F08","#FFB71E","#FE4E5E","#45F3D0","#F9C453","#FF9090","#69B7FF"],
                                legenData:[],
                                innerData:[],
                                outerData:[],
                            }
                            angular.forEach(da.oneList,function(val,ind){
                                chartData.legenData.push(val.channelTypeName);
                                chartData.innerData.push({
                                    value:val.addNumRate,
                                    name:val.channelTypeName,
                                    itemStyle: {
                                        normal: {
                                            color:chartData.colorArr[ind],
                                        }
                                    }
                                });
                            });
                            angular.forEach(da.twoList,function(val_,ind){
                                if(ind>=chartData.colorArr.length){
                                    ind = chartData.colorArr.length/8-1;
                                }
                                chartData.outerData.push({
                                    value:val_.addNumRate,
                                    name:val_.channelName,
                                    itemStyle: {
                                        normal: {
                                            color:chartData.colorArr[ind]
                                        }
                                    }
                                });
                            });
                            console.log(chartData)

                        }
                        if(chartData.contain[0]){
                             $timeout(function(){
                                echart(chartData,types);
                            });
                        }
                    };
                }
            });
        }

        //获取图形的数据（contain：容器元素, dataName：x轴值, dataSeries：y轴值, dataTitle：浮框名字, barColor：柱状颜色）
        function echart(chartData,type) {
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
            var option;
            if(type ==1 || type == 2){
                option = {
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
                }
            }
            if(type == 3){
                option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {d}%",
                         position: function(point, params, dom, rect, size){
                            return setTooltipPosition(point, params, dom, rect, size);
                        },
                    },
                    legend: {
                        type: 'scroll',
                        orient: 'vertical',
                        right: '0',
                        top: '40',
                        itemWidth: 10,
                        itemHeight: 10,
                        itemGap: 10,
                        data: chartData.legenData,
                        formatter: function (name) {
                            // 获取legend显示内容
                            let data = chartData.innerData;//这个是展示的数据
                            let total = 0;
                            let tarValue = 0;
                            let value = 0;
                            for (let i = 0, l = data.length; i < l; i++) {
                              total += data[i].value;
                              if (data[i].name == name) {
                                tarValue = data[i].value;
                                value = data[i].value;
                              }
                            }
                            let p = total== 0? 0 : ((tarValue / total) * 100).toFixed(2);
                            return [
                              "{a|" +
                                echarts.format.truncateText(
                                  name,
                                  100,
                                  "14px Microsoft Yahei",
                                  "…"//如果宽度超过80会出现...
                                ) +
                                "}",
                            //   "{b|" + p + "%}",
                            //   "{x|" + value + "}"  //a、b、x、跟下面的rich对应
                            ].join(" ");
                        },
                        tooltip: {
                            show:true
                        },
                        textStyle: {
                            rich: {
                              a: {
                                width:100,
                                align: "left"
                              },
                              b: {
                                width: 50,
                                align: "left",
                              },
                            //   x: {
                            //     width: 30,
                            //     align: "left",
                            //   }
                            }
                          }
                    },
                    grid: {
                        right: '10%',
                        bottom: '25%',
                        containLabel: true
                    },
                    series: [{
                        name: '访问来源',
                        type: 'pie',
                        selectedMode: 'single',
                        center: ['40%', '50%'],
                        radius: [0, '35%'],
                        label: {
                            normal: {
                                position: 'inner'
                            }
                        },
                        labelLine: {
                            normal: {
                                show: false
                            }
                        },
                        data: chartData.innerData,
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false,
                                },
                                labelLine: {
                                    show: false
                                }
                            },
                        }
                    },
                    {
                        name: '访问来源',
                        type: 'pie',
                        center: ['40%', '50%'],
                        radius: ['45%', '60%'],
                        itemStyle: {
                            normal: {
                                label: {
                                    show: false,
                                },
                                labelLine: {
                                    show: false
                                }
                            },
                        },
                        data:chartData.outerData,
                    }]
                }
            }
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
        function exportAllData() {
            layerOpen('exportAllData', '导出数据');
        }

        function export_cancel() {
            layer.close(dialog);
        }

        function export_config() {
            if ($scope.derTime) {
                var beginTime = $scope.derTime.split(' 到 ')[0]+" 00:00:00";
                var endTime = $scope.derTime.split(' 到 ')[1]+" 23:59:59";
                var token = localStorage.getItem('oa_token');
                window.open(CONFIG.URL + "/api/oa/statistics/consultantDeleteCourseTimeByTeacherAll?beginTime=" + beginTime + '&&endTime=' + endTime + '&&token=' + token);
            };
        }

    }]
});