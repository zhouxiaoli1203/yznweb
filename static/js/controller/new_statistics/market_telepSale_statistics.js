define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var channelTypeId, channelId = undefined;
        var orderType = 'desc',orderName="getRosterNum";
        $scope.status = "7";
        $scope.name2 = "获单数";
        init();
        function init(){
            getChannelList();//获取渠道类型
            changeTotal();
            //1 有效名单 2 无效名单4 已转潜客 5 已签约 6 报课金额7 获单数 8 待处理 9 预约来访
            $scope.screen_namelist = [
                {name:"获单数",id:"7"},
                {name:"待处理",id:"8"},
                {name:"有效名单",id:"1"},
                {name:"无效名单",id:"2"},
//              {name:"预约来访",id:"9"},
                {name:"已转潜客",id:"4"},
                {name:"已签约",id:"5"},
                {name:"报课金额",id:"6"},
            ];
            $scope.teacListThead = [
                {'name': '电话销售','width': '100px'},
                {'name': '获单数','width': '14%','issort': true,'sort': 'desc','id':'getRosterNum'},
                {'name': '待处理','width': '14%','issort': true,'id':'processNum'},
                {'name': '有效名单','width': '14%','issort': true,'id':'effectiveRosterNum'},
                {'name': '无效名单','width': '14%','issort': true,'id':'invalidRosterNum'},
//              {'name': '预约来访','width': '14%','issort': true,'id':'appointVisitsNum'},
                {'name': '已转潜客','width': '14%','issort': true,'id':'toPotentialCustomerNum'},
                {'name': '已签约','width': '14%','issort': true,'id':'toContractNum'},
                {'name': '报课金额','width': '14%','issort': true,'id':'contractPriceTotal'},
            ];
            
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
//          $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.changeChannelType = changeChannelType;//按渠道类型
            $scope.changeChannelType2 = changeChannelType2;//按2级渠道类型
            $scope.changeNameStatus = changeNameStatus;//类型搜索
            $scope.sortCllict0 = sortCllict0;//升降序
            
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
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
                $scope.screen_goReset['class_type']('获单数');
            })
            changeData();
        }
         //以下是获取初始列表
        function getChannelList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/getChannelTypeLess',
                type: 'get',
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
//       function switchStudNav(n){
//          switch (n){
//              case 1:$state.go("financeStatistics/used_money_bytime");
//                  break;
//              case 2:$state.go("financeStatistics/used_money_bymonth");
//                  break;
//              default:
//                  break;
//          }
//      }
        function switchStudNav_(n){
            $scope.studNavJud_ = n;
            changeChart();
        }
        function sortCllict0(data){
            console.log(data);
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
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
            changeData();
        }
        function changeChannelType2(n){
            channelId = n == null?undefined:n.id;
            changeData();
        }
         function changeNameStatus(n){
            $scope.status = n.id;
            $scope.name2 = n.name;
            changeChart();
            $timeout(function(){
                $scope.reTheadData_['head']();
            },100,true)
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var params = {
                rosterType:$scope.status,
                channelTypeId:channelTypeId,
                channelId:channelId,
                timeType: $scope.studNavJud_,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getMarketRecordByDateNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:$scope.name2,
                            dataAxis:[],
                            dataseries:[],
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
        //统计图
        function echart(chartData) {
            //          max = niceInterval(max, false);
            // 基于准备好的dom，初始化echarts实例
            var worldMapContainer = document.getElementById('mainechart');
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
            var params = {
                rosterType:$scope.status,
                channelTypeId:channelTypeId,
                channelId:channelId,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getMarketRecordByTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                    }
                }

            })
        }
        function changeTotal(){
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getMarketRecordTotalNew",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.dataTotal = data.context;
                    }
                }

            })
        }
        function export_config() {
            if (!$scope.searchTime) {
                return layer.msg("请选择导出时间");
            };
            var params={
                token:localStorage.getItem('oa_token'),
                beginTime:$scope.searchTime.split(' 到 ')[0]+" 00:00:00",
                endTime:$scope.searchTime.split(' 到 ')[1]+" 23:59:59",
                channelTypeId:channelTypeId,
                channelId:channelId,
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantMarketRecord?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_marketStatistics',{});
        }
    }]
});