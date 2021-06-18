define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        $scope.compareType = $scope.compareType1 = false;
        $scope.teacher0  = $scope.teacher1 = false;
        var $adviser = undefined,orderType = 'desc',orderName="telephoneCommunicationTotal";
        var $type = 0;
        init();
        function init(){
            getAdviserName();//获取顾问列表
            changeTotal();
//          10 预约来访 15 实际来访 0 电话沟通  1 来店洽谈 2线上沟通
            $scope.screen_classType = [
               {name:"电话沟通人次",id:0},
               {name:"来店洽谈人次",id:1},
               {name:"线上沟通人次",id:2},
               {name:"预约来访人次",id:10},
               {name:"实际来访人次",id:15},
            ];
 
            $scope.teacListThead = [
                {'name': '顾问','width': '15%',},
                {'name': '电话沟通人次','width': '17%','issort': true,'sort':'desc',id:"telephoneCommunicationTotal"},
                {'name': '来店洽谈人次','width': '17%','issort': true,id:"talkByShopTotal"},
                {'name': '线上沟通人次','width': '17%','issort': true,id:"onlineCommunicationTotal"},
                {'name': '预约来访人次','width': '17%','issort': true,id:"appointVisitsTotal"},
                {'name': '实际来访人次','width': '17%','issort': true,id:"actualVisitsTotal"},
            ];
            $scope.typeName = "电话沟通人次";
            
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
            $scope.studNavJud = 2;
            $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.changeClassType = changeClassType;//类型
            $scope.changeAdviser = changeAdviser;//顾问
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
                $scope.screen_goReset['class_type']('电话沟通人次');
            })
            changeData();
        }
        function getAdviserName() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data:{pageType:'0',quartersTypeId:'3',},
                success: function(data) {
                    if(data.status == "200") {
                        $scope.screen_adviser = data.context;
                        $scope.screen_adviser.unshift({"teacherName":"无顾问","teacherId":"1",'shopTeacherId':'-1'});
                    }
                }
            });
        }
        function switchStudNav(n){
            switch (n){
                case 1:$state.go("new_saleStatistics/adviserWorks");
                    break;
                case 2:$state.go("new_saleStatistics/workRecord");
                    break;
                case 3:$state.go("new_saleStatistics/appointListen");
                    break;
            	default:
            		break;
            }
        }
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
        function changeAdviser(t){
            $adviser = t==null?undefined:t.shopTeacherId;
            changeChart();
        }
        function changeClassType(t){//切换授课类型
            $type = t.id;
            $scope.typeName = t.name;
            changeChart();
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var params = {
                'shopTeacherId': $adviser,
                'type':$type,
                'timeType': $scope.studNavJud_
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getWorkRecordByDateNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:$scope.typeName,
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
            var params = {};
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getWorkRecordTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
 
                        var obj={"telephoneCommunicationTotal_total":0,"talkByShopTotal_total":0,"onlineCommunicationTotal_total":0,"appointVisitsTotal_total":0,"actualVisitsTotal_total":0};
                        angular.forEach(data.context,function(v){
                            obj.telephoneCommunicationTotal_total+=v.telephoneCommunicationTotal;
                            obj.talkByShopTotal_total+=v.talkByShopTotal;
                            obj.onlineCommunicationTotal_total+=v.onlineCommunicationTotal;
                            obj.appointVisitsTotal_total+=v.appointVisitsTotal;
                            obj.actualVisitsTotal_total+=v.actualVisitsTotal;
                        });
                        $scope.totalData = obj;
                    }
                }

            })
        }
        function changeTotal(){
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getWorkRecordTotalNew",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.dataTotal = data.context;
                    }
                }

            })
        }
        //以下是导出数据
//      function exportAllData(){
//          layerOpen('exportAllData', '导出数据');
//      }
//      function closePop() {
//          layer.close(dialog);
//      }
        function export_config() {
            if (!$scope.searchTime) {
                return layer.msg("请选择导出时间");
            };
            var params={
                token:localStorage.getItem('oa_token'),
                beginTime:$scope.searchTime.split(' 到 ')[0]+" 00:00:00",
                endTime:$scope.searchTime.split(' 到 ')[1]+" 23:59:59",
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantWorkRecord?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_saleStatistics',{});
        }
    }]
});