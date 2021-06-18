define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var orderName="addNum",orderType="desc";
        var eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var $shopTeacherId = undefined;
        $scope.compareType = false;
        $scope.compareType1 = true;
        init();

        function init() {
            $scope.screen_classType = [{
                name: "新增潜客",
                id: "addNum"
            }, {
                name: "签约人数",
                id: "addContract"
            }];
            $scope.teacListThead = [{
                'name': "一级渠道",
                'width': '10%'
            }, {
                'name': '新增潜客',
                'width': '10%',
                'align':'right',
                'issort': true,
                'sort': 'desc',
                id: "addNum",
                hasRate:true
            }, {
                'name': '签约人数',
                'width': '10%',
                 'align':'right',
                'issort': true,
                id: "addContract",
                hasRate:true
            }, {
                'name': '报课金额',
                'width': '10%',
                 'align':'right',
                'issort': true,
                id: $scope.compareType?"receivable":$scope.compareType1?"received":"",
                hasRate:true
            }, {
                'name': '转化率',
                'width': '10%',
                'issort': true,
                id: "rate"
            }, {
                'name': '二级渠道',
                'width': '10%',
                level:2,
                id: "data6"
            }, {
                'name': '新增潜客',
                'width': '10%',
                 'align':'right',
                'issort': true,
                level:2,
                id: "addNum",
                hasRate:true
            }, {
                'name': '签约人数',
                'width': '10%',
                 'align':'right',
                'issort': true,
                level:2,
                id: "addContract",
                hasRate:true
            }, {
                'name': '报课金额',
                'width': '10%',
                 'align':'right',
                'issort': true,
                level:2,
                id: $scope.compareType?"receivable":$scope.compareType1?"received":"",
                hasRate:true
            }, {
                'name': '转化率',
                'width': '10%',
                level:2,
                'issort': true,
                id: "rate"
            }];
            $scope.toStatistics = toStatistics; //返回教务统计首页
            $scope.chargeType = chargeType; //一对一/一对多
            $scope.changeClassType = changeClassType; //类型
            $scope.sortCllict0 = sortCllict0; //点击表头排序
            $scope.export_config = export_config; //导出
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    changeData();
                }
            });
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type']('新增潜客');
            })
            changeData();
        }

        function changeClassType(t) { //切换授课类型
            $scope.typeName = t.name;
            changeDataChart(t.name, t.id, $scope.chartData);
        }

        function chargeType(status) {
            if (status) {
                if ($scope.compareType) {
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                }else{
                    $scope.compareType = true;
                }
            } else {
                if ($scope.compareType1) {
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                }else{
                    $scope.compareType1 = true;
                }
            }
            changeData();
        }
        function sortCllict0(data) {
            orderName = data.id;
            orderType = data.sort;
            if(data.level == 2){
                angular.forEach($scope.tableList.tableList,function(v){
                    v.workRecordByChannels = getNewTable(orderName, orderType, v.workRecordByChannels);
                });
            }else{
                $scope.tableList["tableList"] = getNewTable(orderName, orderType, $scope.tableList.tableList);
            }

        }
        function changeData() {
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart() {
            var params = {};
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }

            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAddContractByChannelNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.chartData = data.context;
                        changeDataChart("新增潜客", "addNumRate", data.context);
                    }
                }

            })
        }

        function changeDataChart(t, d, list) {
            var da = list;
            if (d == "addNumRate") {
                $scope.totalNum = da.addNum;
            } else {
                $scope.totalNum = da.addContract;
            }
            var chartData = {
                contain: $('#mainechart'),
                colorArr: ["#1D6FE9", "#6F9F08", "#FFB71E", "#FE4E5E", "#45F3D0", "#F9C453", "#FF9090", "#69B7FF"],
                legenData: [],
                innerData: [],
                outerData: [],
            }
            angular.forEach(da.oneList, function(val, ind) {
                chartData.legenData.push(val.channelTypeName);
                chartData.innerData.push({
                    value: val[d],
                    name: val.channelTypeName,
                    itemStyle: {
                        normal: {
                            color: chartData.colorArr[ind],
                        }
                    }
                });
            });
            angular.forEach(da.twoList, function(val_, ind) {
                if (ind >= chartData.colorArr.length) {
                    ind = ind % 8;
                }
                chartData.outerData.push({
                    value: val_[d],
                    name: val_.channelName,
                    itemStyle: {
                        normal: {
                            color: chartData.colorArr[ind]
                        }
                    }
                });
            });
            chartData.times = da.length;
            if (chartData.contain[0]) {
                $timeout(function() {
                    echart(chartData);
                });
            }
        }
        //趋势图
        function echart(chartData) {
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
            var myChart2 = echarts.init(worldMapContainer);
            // 指定图表的配置项和数据
            var option = {
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
                    right: '100',
                    top: '100',
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
                        let p = total== 0? 0 : ((tarValue / total) * 100).toFixed(2);
                        return [
                          "{a|" +
                            echarts.format.truncateText(
                              name,
                              200,
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
                            width:200,
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
                }, {
                    name: '访问来源',
                    type: 'pie',
                    radius: ['45%', '60%'],
                    label: {
                        normal: {
                            formatter: '{b|{b}：}  {per|{d}%} ',
                            rich: {
                                b: {
                                    fontSize: 16,
                                    lineHeight: 33
                                },
                                per: {
                                    fontSize: 16,
                                }
                            }
                        }
                    },
                        data: chartData.outerData,
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
                }]
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

        function changeTable() {
            var params = {
                'dataType':$scope.isactive==1?"adviser":$scope.isactive == 2?"course":"",
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAddContractByChannelNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = data.context;
                        $scope.tableList["tableList"] = getNewTable(orderName, orderType, data.context.tableList);
                    }
                }

            })
        }

        function export_config() {
            var params = {
                token: localStorage.getItem('oa_token'),
                consultantChannelType:$scope.compareType?"0":$scope.compareType1?"1":undefined,
            };
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            } else {
                return layer.msg("请选择起始时间");
            }
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantAddContractByChannel?' + $.param(params));
        }
        //返回
        function toStatistics() {
            $state.go('new_saleStatistics', {});
        }
    }]
});