define(['laydate', 'echarts'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        init();

        function init() {
            //工作台跳转数据汇总
            console.log()
//          if ($stateParams.screenValue.name == "workbench" && $stateParams.screenValue.type == '数据汇总') {
//              if ($stateParams.screenValue.value == 2) {
//                  $state.go('new_eduStatistics/teachHours_2', {});
//              } else if ($stateParams.screenValue.value == 3) {
//                  $state.go('financeStatistics/used_money_bytime', {});
//              }
//              return;
//          }
            getOverViewData(1, 1);
            getOverViewData(2, 1);
            getOverViewData(3, 1);
            $scope.mapClick = mapClick; //点击图表数据日期切换
            $scope.routerGo = routerGo; //查看详情路由跳转
        }

        function routerGo(type) {
            switch(type) {
                case 1:
                    $state.go('new_marketStatistics/billCollector', {});
                    break;
                case 2:
                    $state.go('new_marketStatistics/telepSale', {});
                    break;
                case 3:
                    $state.go('new_marketStatistics/nameSource', {});
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
            	case 1:return "getClerkRecordByDateNew";//采单员工作概况
            		break;
            	case 2:return "getMarketRecordByDateNew";//电销工作概况
            		break;
            	case 3:return "getAddRosterByChannelNew";//名单来源分析
            		break;
            	case 4:return "getAddContractByChannel";//渠道成单比
            		break;
            	case 5:return "getConversionRate";//渠道转化率
            		break;
            	case 6:return "getResubmit";//续报概况
            		break;
//          	case 7:return "getClassFullRateChart";//满班率
//          		break;
//          	case 8:return "getShopStudentTotalChart";//在读趋势
//          		break;
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
            	params["rosterType"]="0";
            		break;
            	case 2:
            	params["rosterType"]="7";
            		break;
            	case 3:
            	params["dataType"]="price";
            		break;
            	default:
            		break;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/"+setUrl(types),
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        var chartData;
                        if(types == 1 || types == 2 || types == 6){
                            chartData = {
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
                                case 6:chartData.contain = $('#mainechart_6');
                                    break;
                                default:
                                    break;
                            }
                            angular.forEach(res.context, function(val) {
                                chartData.dataName.push(val.date);
                                switch(types) {
                                    case 1:
                                        chartData.dataTitle = '新增名单';
                                        chartData.dataSeries.push(val.val);
                                        break;
                                    case 2:
                                        chartData.dataTitle = '获单数';
                                        chartData.dataSeries.push(val.val);
                                        break;
                                    case 6:
                                        chartData.dataTitle = '续报金额';
                                        chartData.lineType = 'line';
                                        chartData.echartType = 'line';
                                        chartData.barColor = '#FF6166';
                                        chartData.dataSeries.push(val.val.toFixed(2));
                                        break;
                                }
                            });
                        }
                        if(types == 3){
                            var da = res.context;
                            chartData = {
                                contain:'',
                                colorArr:["#1D6FE9","#6F9F08","#FFB71E","#FE4E5E","#45F3D0","#F9C453","#FF9090","#69B7FF"],
                                legenData:[],
                                innerData:[],
                                outerData:[],
                            }
                            angular.forEach(da.oneList,function(val,ind){
                                chartData.legenData.push(val.channelTypeName);
                                chartData.innerData.push({
                                    value:val["addNum"],
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
                                    value:val_["addNum"],
                                    name:val_.channelName,
                                    itemStyle: {
                                        normal: {
                                            color:chartData.colorArr[ind]
                                        }
                                    }
                                });
                            });
                            chartData.contain = $('#mainechart_3');

                        }
                        if(types == 5){
                            var da = res.context;
                            chartData = {
                                contain:$('#mainechart_5'),
                                legenData:['潜客人数', '成单人数'],
                                nameData:[],
                                signData:[],
                                recommendData:[],
                                rateData:[],
                                widthbar:20,
                            }
                            angular.forEach(da.oneList,function(val){
                                chartData.signData.push(val.num);
                                chartData.nameData.push(val.channelTypeName);
                            });
                            angular.forEach(da.twoList,function(val_){
                                chartData.recommendData.push(val_.num);
                                chartData.rateData.push(val_.ratio);
                            });
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
            if(type ==1 || type == 2 || type == 6){
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
            if(type == 3 || type == 4){
                option = {
                    tooltip: {
                        trigger: 'item',
                        formatter: "{a} <br/>{b}: {d}%",
                         position: function(point, params, dom, rect, size){
                            return setTooltipPosition(point, params, dom, rect, size);
                        },
                    },
                    legend: {
                        data: chartData.legenData,
                        orient: 'vertical',
                        right: '0',
                        top: '40',
                        itemWidth: 10,
                        itemHeight: 10,
                        itemGap: 10,
                        type: 'scroll',
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
                            let p = total== 0? 0 : ((tarValue / total) * 100).toFixed(1);
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
                            //   b: {
                            //     width: 50,
                            //     align: "left",
                            //   },
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
                        name: '名单来源',
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
                        name: '名单来源',
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
                        data: chartData.outerData,
                    }]
                }
            }
            if(type == 5){
                option = {
                tooltip: {
                    trigger: 'axis',
                     position: function(point, params, dom, rect, size){
                        return setTooltipPosition(point, params, dom, rect, size);
                    },
                },
                legend: {
                    data: chartData.legenData,
                    selectedMode:false,
                    x: 'right',
                    top:'10'
                },
//              grid: {
//                  left: '0',
//                  right: '0',
//                  top: '25%',
//                  containLabel: true
//              },
                xAxis: {
                    type: 'category',
                    data: chartData.nameData,
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#aaa', //左边线的颜色
                            width: '1' //坐标线的宽度
                        }
                    },
                    axisLabel: {
//                      formatter: function(params) {
//                          return formatter(params)
//                      },
                        textStyle: {
                            color: '#444'
                        },
                        interval:0,
                        rotate:40
                    }
                },
                yAxis: [{
                    type: 'value',
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#aaa', //左边线的颜色
                            width: '1' //坐标线的宽度
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#dcdcdc',
                            type: 'dotted'
                        }
                    }
                }],
                series: [{
                        name: chartData.legenData[0],
                        type: 'bar',
                        barWidth: chartData.widthbar,
                        itemStyle: {
                            normal: {
                                color: '#69C2ED',
                            }
                        },
                        barGap: '-100%',
                        data: chartData.signData
                    },
                    {
                        name: chartData.legenData[1],
                        type: 'bar',
                        z: 10,
                        barWidth: chartData.widthbar,
                        itemStyle: {
                            normal: {
                                color: '#FF7556',
                            }
                        },
                        data: chartData.recommendData
                    },
                    {
                        name: '转化率',
                        type: 'bar',
                        stack: '总金额',
                        barWidth: chartData.widthbar,
                        itemStyle: {
                            normal: {
                                color: 'rgba(128, 128, 128, 0)',
                                label: {
                                    formatter: '{c}%' //
                                },
                            }
                        },
                        data: chartData.rateData
                    }

                ]
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