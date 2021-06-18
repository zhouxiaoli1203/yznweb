define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var orderName="addNum",orderType="desc";
        var eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var province, city = undefined;
        var $shopTeacherId = undefined;
        var $type = "addNum";
        $scope.typeClass = 1;
        $scope.typeName = "新增名单";
        $scope.compareType = false;
        $scope.compareType1 = true;
        init();

        function init() {
            initCity();
            $scope.screen_classType = [{
                name: "新增名单",
                id: "addNum"
            }, {
                name: "签约人数",
                id: "addContract"
            }];
            $scope.screen_time = [{
                name: '校区对比',
                value: '0'
            }, {
                name: '渠道对比',
                value: '1'
            }];
            $scope.teacListThead = [{
                'name': "校区名称",
                'width': '10%'
            }, {
                'name': '新增名单',
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
                'name': '渠道名称',
                'width': '10%',
                level:2,
                id: "data6"
            }, {
                'name': '新增名单',
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
            $scope.screen_shops = [];
            $scope.toStatistics = toStatistics; //返回教务统计首页
            $scope.chargeType = chargeType; //一对一/一对多
            $scope.changeClassType = changeClassType; //类型
            $scope.changeClassType1 = changeClassType1;//选择按校区还是渠道对比
            $scope.changeClassType2 = changeClassType2;//选择按校区
            $scope.searchByProv = searchByProv; //按省份筛选
            $scope.searchByCity = searchByCity; //按城市筛选
            $scope.sortCllict0 = sortCllict0; //点击表头排序
             $scope.onReset = onReset; //重置
            $scope.export_config = export_config; //导出
            $scope.gotoPartyShop = gotoShop;//进入校区
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
                $scope.screen_goReset['class_type']('新增名单');
                $scope.screen_goReset['class_type1']('渠道对比');
            })

            changeData();
        }
         function initCity() {
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
        }
        function onReset() {
            province = city = undefined;
            $shopTeacherId = undefined;
            $type = "addNum";
            $scope.typeClass = 1;
            $scope.typeName = "新增名单";
            $scope.compareType = false;
            $scope.compareType1 = true;
            //筛选头部初始化
            $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type']('新增名单');
                $scope.screen_goReset['class_type1']('渠道对比');
            })
            $scope.cityList = [];
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            changeData();
        }
       function changeClassType1(t){
           $scope.typeClass = t.value;
           if($scope.typeClass==0 && $scope.screen_shops){
                screen_setDefaultField($scope, function() {
                    $scope.screen_goReset['class_type2']($scope.screen_shops[0].channelTypeName);
                })
                $scope.channelTypeId = $scope.screen_shops[0].channelTypeId;
            }
           changeDataChart($scope.typeName, $type, $scope.chartData);
       }
       function changeClassType2(t){
           $scope.channelTypeId = t.channelTypeId;
           changeDataChart($scope.typeName, $type, $scope.chartData);
       }
        function changeClassType(t) { //切换授课类型
            $type = t.id;
            $scope.typeName = t.name;
            changeDataChart(t.name, t.id, $scope.chartData);
        }
        function searchByProv(data, i) {
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['市']('');
            });
            city = undefined;
            $scope.cityList = [];
            if (!data) {
                province = undefined;
            } else {
                province = data;
                $scope.cityList = $scope.provincesList['0_'+i];
            }
            changeData();
        }
        function searchByCity(data) {
            if (!data) {
                city = undefined;
            } else {
                city = data;
            }
            changeData();
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
            var params = {
                province: province,
                city: city,
            };
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }

            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAddRosterByChannelNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_shops = [];
                        $scope.chartData = data.context;
                        $scope.screen_shops = data.context.oneList;
                        if($scope.typeClass==0 && $scope.screen_shops){
                            screen_setDefaultField($scope, function() {
                                $scope.screen_goReset['class_type2']($scope.screen_shops[0].channelTypeName);
                            })
                            $scope.channelTypeId = $scope.screen_shops[0].channelTypeId;
                        }
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
                colorArr: ["#FE7968", "#69C3EE", "#FDD156", "#6BABF9", "#81CF84", "#04DCD0", "#FDD156", "#69B7FF","#9899FD"],
                legenData: [],
                innerData: [],
                outerData: [],
            }

            if($scope.typeClass == 0){
                var index = 0;
                angular.forEach(da.twoList, function(val, ind) {
                    if (index >= chartData.colorArr.length) {
                        index = index % 9;
                    }
                    if($scope.channelTypeId == val.channelTypeId){
                        chartData.legenData.push(val.channelName);
                        chartData.innerData.push({
                            value: val[d],
                            name: val.channelName,
                            itemStyle: {
                                normal: {
                                    color: chartData.colorArr[index],
                                }
                            }
                        });
                        index++;
                    }
                });
            }else{
                angular.forEach(da.channelList, function(val_, ind) {
                     if (ind >= chartData.colorArr.length) {
                        ind = ind % 9;
                    }
                    chartData.legenData.push(val_.channelTypeName);
                    chartData.innerData.push({
                        value:val_[d],
                        name:val_.channelTypeName,
                        itemStyle: {
                            normal: {
                                color:chartData.colorArr[ind]
                            }
                        }
                    });
                });
            }
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
                    selectedMode: false,
                    orient: 'vertical',
                    right: '100',
                    top: '100',
                    icon:'circle',
                    itemWidth: 8,
                    itemHeight: 8,
                    itemGap: 20,
                    width: worldMapContainer.style.width,
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
                    radius: [0, '45%'],
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
                            },
                        },
                    }
                },
//              {
//                  name: '访问来源',
//                  type: 'pie',
//                  radius: ['45%', '60%'],
//                  label: {
//                      normal: {
//                          formatter: '{b|{b}：}  {per|{d}%} ',
//                          rich: {
//                              b: {
//                                  fontSize: 16,
//                                  lineHeight: 33
//                              },
//                              per: {
//                                  fontSize: 16,
//                              }
//                          }
//                      }
//                  },
//                  data: chartData.outerData,
//              }
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

        function changeTable() {
            var params = {
                province: province,
                city: city,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAddRosterByChannelNew",
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
                province: province,
                city: city,
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
            window.open(CONFIG.URL + '/api/oa/statistics/consultantAddRosterByChannel?' + $.param(params));
        }
        //返回
        function toStatistics() {
            $state.go('new_organ_marketAnalysis', {});
        }
    }]
});