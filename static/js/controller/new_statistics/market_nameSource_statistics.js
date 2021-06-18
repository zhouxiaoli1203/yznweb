define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var orderName="addNum",orderType="desc";
        var eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var $type, channelTypeId, channelId = undefined;
        var orderType = 'desc',orderName="addNum";
        $scope.compareType = false;
        $scope.compareType1 = true;
        $scope.chartType = "graph";
        init();

        function init() {
            getChannelList();//获取渠道类型
            $scope.screen_nameSource = [{
                name: "渠道饼形图",
                type: "graph"
            }, {
                name: "渠道趋势图",
                type: "line"
            }];
            $scope.screen_classType = [{
                name: "新增名单",
                id: "0",
                type:"addNum",
            }, {
                name: "签约人数",
                id: "5",
                type:"addContract",
            }];
            $scope.teacListThead = [{
                'name': "一级渠道",
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
                'name': '二级渠道',
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
            $scope.toStatistics = toStatistics; //返回教务统计首页
            $scope.studNavJud_ = 0;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.changeNameType = changeNameType;
            $scope.changeChannelType = changeChannelType;//按渠道类型
            $scope.changeChannelType2 = changeChannelType2;//按2级渠道类型
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
                $scope.screen_goReset['class_type1']('渠道饼形图');
            })
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type2']('新增名单');
            })
            changeData();
        }
         //以下是获取初始列表
        function getChannelList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/channelType/list',
                type: 'get',
                data: {type:1,pageType:0},
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_channelType=data.context;
                    }
                }
            });
        }
        function getChannelList2(id){
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/getChannelList',
                data:{channelTypeId:id,pageType:0},
                type: 'get',
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_channelType2=data.context;
                        if(data.context.length>0){
                             $scope.hasChannel2 = true;
                        }else{
                             $scope.hasChannel2 = false;
                        }
                    }
                }
            });
        }
        function switchStudNav_(n){
            $scope.studNavJud_ = n;
            changeChart_2();
        }
        function changeClassType(t) { //切换授课类型
            $type = t.id;
            $scope.typeName = t.name;
            if($scope.chartType == "graph"){
                changeDataChart(t.name, t.type, $scope.chartData);
            }else{
               changeChart_2();
            }
        }
        function changeNameType(n){
            $scope.chartType = n.type;
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type2']('新增名单');
            })
             $type = "0";
            $scope.typeName = "新增名单";
            switch (n.type){
                case 'graph':
                    channelTypeId = channelId = undefined;
                    break;
                default:
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['channel1']("地推活动");
                    })
                    channelTypeId="3";
                    getChannelList2(channelTypeId);
                    $scope.channelName = "地推活动";
                    $scope.studNavJud_ = 0;
                    break;
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
        function changeChannelType(n){
            channelId = undefined;
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['channel2']();
            })
            channelTypeId = n == null?undefined:n.id;
            if(channelTypeId != undefined || channelTypeId !=null){
                getChannelList2(channelTypeId);
            }else{
                $scope.hasChannel2 = false;
            }
            changeChart_2();
        }
        function changeChannelType2(n){
            channelId = n == null?undefined:n.id;
            changeChart_2();
        }
        function changeData() {
            if($scope.chartType == "graph"){
                changeChart();
            }else{
               changeChart_2();
            }
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart() {
            var params = {
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
                        $scope.chartData = data.context;
                        changeDataChart("新增名单", "addNum", data.context);
                    }
                }

            })
        }
        function changeChart_2() {
            var params = {
                rosterType:$type,
                channelTypeId:channelTypeId,
                channelId:channelId,
                timeType: $scope.studNavJud_,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }

            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getClerkRecordByDateNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:$scope.typeName,
                            dataAxis:[],
                            dataseries:[],
                            lineType:'line',
                            times:0
                        }
                        chartData.times = data.context.length;
                        for (var i = 0,len = chartData.times; i < len; i++) {
                            switch ($scope.studNavJud_) {
                                case 0:
                                    chartData.dataAxis.push(data.context[i].date);
                                    break;
                                case 1:
                                    chartData.dataAxis.push(theTimeMd(data.context[i].weekBeginDate) + "-" + theTimeMd(data.context[i].weekEndDate));
                                    break;
                                case 2:
                                    chartData.dataAxis.push(theTimeMC(data.context[i].date));
                                    break;
                                default:
                                    break;
                            }
                            chartData.dataseries.push(data.context[i].val);
                        }
                        if(chartData.contain[0]){
                            $timeout(function(){
                                echart(chartData);
                            });
                        }
                    }
                }

            })
        }

        function changeDataChart(t, d, list) {
            var da = list;
            var chartData = {
                contain: $('#mainechart'),
                colorArr: ["#1D6FE9", "#6F9F08", "#FFB71E", "#FE4E5E", "#45F3D0", "#F9C453", "#FF9090", "#69B7FF"],
                legenData: [],
                innerData: [],
                outerData: [],
                times:0,
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
            var count = (wid / 80) / chartData.times * 100;
            // 指定图表的配置项和数据
            var option={};
            if($scope.chartType == "graph"){
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
                        // selectedMode: false,
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
                            let p = total== 0? 0 : ((tarValue / total) * 100).toFixed(1);
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
                                width: 200,
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
                        name: '名单来源',
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
            }else{
               option = {
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
                        }
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
                    type: 'line',
                    barCategoryGap: '50',
                    data: chartData.dataseries,
                    barWidth: '30',
                    itemStyle: {
                        normal: {
                            color: '#f77c80',
                        }
                    },

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
        function changeTable() {
            var params = {
//              'dataType':$scope.isactive==1?"adviser":$scope.isactive == 2?"course":"",
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
            $state.go('new_marketStatistics', {});
        }
    }]
});