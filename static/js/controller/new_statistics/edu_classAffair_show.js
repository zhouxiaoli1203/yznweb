define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var orderType = 'desc',orderName="displayRate";
        $scope.compareType = $scope.compareType1 = false;
        $scope.activityStatus = undefined;
        init();
        function init(){
            changeTotal();
            $scope.tableName="老师";
            $scope.$watch('tableName',function(){
                $scope.teacListThead = [
                    {'name': $scope.tableName,'width': '20%'},
                    {'name': '点名次数','width': '30%','issort': true,'id':'rollCallTimes'},
                    {'name': '课堂展示次数','width': '30%','issort': true,'id':'displayTotal'},
                    {'name': '课堂展示率','width': '30%','issort': true,'sort': 'desc','id':'displayRate'},
                ];
            });
            
            $scope.studNavJud = 1;
            $scope.isactive = 1;
            $scope.switchStudNav = switchStudNav;
            $scope.tab_course_history = tab_course_history;
            $scope.sortCllict0 = sortCllict0;//升降序
            $scope.changeClass = changeClass;//标准课，活动课
            $scope.chargeType = chargeType;//一对一/一对多
            $scope.changeClass = changeClass;//标准课，活动课
            
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
            changeData();
        }
         function switchStudNav(n){
            switch (n){
                case 1:$state.go("new_eduStatistics/classAffair_show");
                    break;
                case 2:$state.go("new_eduStatistics/classAffair_comment");
                    break;
                case 3:$state.go("new_eduStatistics/classAffair_homeWk");
                    break;
                default:
                    break;
            }
        }
        function tab_course_history(n){
            $scope.isactive = n;
            $scope.compareType = $scope.compareType1 = false;
            $scope.activityStatus = undefined;
            switch (n){
                 case 1:
                 $scope.tableName = '老师';
                    break;
                case 2:$scope.tableName = '课程';
                    break;
                case 3:
                $scope.tableName = '班级';
                    break;
                default:
                    break;
            }
             $timeout(function(){
                $scope.reTheadData_['head']();
            },100,true)
             changeData();
        }
        function chargeType(status){
            if(status){
                if($scope.compareType){
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                    $scope.activityStatus = undefined;
                }
            }else{
                if($scope.compareType1){
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                    $scope.activityStatus = undefined;
                }
            }
            changeData();
        }
        function changeClass(e,val){
            if(e.target.checked){
                $scope.compareType = false;
                $scope.compareType1 = false;
            }
            $scope.activityStatus = e.target.checked?val:undefined;
            changeData();
        }
        function sortCllict0(data){
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var params = {
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
                'dataType':$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
                'activityStatus':$scope.activityStatus,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getDisplayTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:"课堂展示率",
                            dataAxis:[],
                            dataseries:[],
                            times:0
                        }
                        chartData.times = data.context.length;
                        for (var i = 0,len = chartData.times; i < len; i++) {
                            chartData.dataAxis.push(data.context[i].name);
                            chartData.dataseries.push(data.context[i].displayRate);
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
//                      interval: 0,
//                      formatter:function(params) {
//                          return  params;
//                      },
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
            var params = {
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
                'dataType':$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
                'activityStatus':$scope.activityStatus,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getDisplayTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                        var obj={"rollCallTimes_total":0,"displayTotal_total":0};
                        angular.forEach(data.context,function(v){
                            obj.rollCallTimes_total+=v.rollCallTimes;
                            obj.displayTotal_total+=v.displayTotal;
                        });
                        $scope.totalData = obj;
                    }
                }

            })
        }
        function changeTotal(){
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getCourseWorkTotalNew",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.dataTotal = data.context;
                    }
                }

            })
        }
        //以下是导出数据
        function export_config() {
            if (!$scope.searchTime) {
                return layer.msg("请选择导出时间");
            };
            var params={
                token:localStorage.getItem('oa_token'),
                beginTime:$scope.searchTime.split(' 到 ')[0]+" 00:00:00",
                endTime:$scope.searchTime.split(' 到 ')[1]+" 23:59:59",
                teachingMethod:$scope.compareType?"1":$scope.compareType1?"2":undefined,
                dataType:$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
                activityStatus:$scope.activityStatus,
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantDisplayNew?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_eduStatistics',{});
        }
    }]
});