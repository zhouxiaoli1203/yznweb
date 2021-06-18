define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetMonthStr(-7) + " 到 " + GetMonthStr(-2);
        $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
        var province, city, shopId = undefined;
        var orderType = 'desc',orderName="fullClassRate",defaultData;
        var $type = 0;
        init();
        function init(){
            initCity();
            $scope.teacListThead = [
                {'name': '校区名称','width': '20%'},
                {'name': '班级数量','width': '40%','issort': true,'id':'classMax'},
                {'name': '满班率','width': '40%','issort': true,'sort':'desc','id':'fullClassRate'},
            ];
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
            $scope.studNavJud = 2;
            $scope.isactive = 1;
            $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.searchByProv = searchByProv; //按省份筛选
            $scope.searchByCity = searchByCity; //按城市筛选
            $scope.searchByShop = searchByShop; //按所属校区
            $scope.sortCllict0 = sortCllict0;//升降序
            
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
             $scope.onReset = onReset; //重置
             $scope.gotoPartyShop = gotoShop;//进入校区
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                type: 'month',
                done: function(value) {
                    $scope.searchTime = defaultData = value;
                    changeChart();
                }
            });
            changeData();
        }
        function initCity() {
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
        }
        function onReset() {
            $scope.studNavJud_ = 0;
            //筛选头部初始化
            $scope.searchTime = GetMonthStr(-7) + " 到 " + GetMonthStr(-2);
            $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
            province = city = shopId = undefined; 
            $scope.cityList = [];
            $scope.shooList = [];
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            changeData();
        }
        //获取班级列表
        function switchStudNav(n){
            switch (n){
                case 1:$state.go("new_organ_eduSummary/eduAffair_attend");
                    break;
                case 2:$state.go("new_organ_eduSummary/eduAffair_classFull");
                    break;
                case 3:$state.go("new_organ_eduSummary/eduAffair_inclass");
                    break;
                default:
                    break;
            }
        }
         function switchStudNav_(n){
            $scope.studNavJud_ = n;
            changeChart();
        }
        function changeByClass(t){
            $class = t==null?undefined:t.classId;
            changeChart();
        }
        function sortCllict0(data){
            console.log(data);
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
        }
        function searchByProv(data, i) {
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['市']('');
                $scope.screen_goReset['所属校区']('');
            });
            city = undefined;
            shopId = undefined;
            $scope.cityList = [];
            $scope.shooList = [];
            if (!data) {
                province = undefined;
            } else {
                province = data;
                $scope.cityList = $scope.provincesList['0_'+i];
            }
            getShooList();
            changeData();
        }
        function searchByCity(data) {
             screen_setDefaultField($scope, function() {
                $scope.screen_goReset['所属校区']('');
            });
            shopId = undefined;
            if (!data) {
                city = undefined;
            } else {
                city = data;
            }
            $scope.shooList = [];
            getShooList();
            changeData();
        }
        function searchByShop(data) {
            if (!data) {
                shopId = undefined;
            } else {
                shopId = data.shopId;
            }
            changeData();
        }
        function getShooList() {
            var data = {
                "province": province,
                "city": city,
            }
            $.hello({
                url: CONFIG.URL + "/api/org/shop/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.shooList = data.context;
                    }

                }
            })
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var begin_EndTime;
            if(defaultData){
                begin_EndTime = defaultData;
            }else{
                begin_EndTime = $scope.searchTime;
            }
            var params = {
                province: province,
                city: city,
                'shopId':shopId,
                'timeType': 2
            };
            if(begin_EndTime){
                var beginTime = begin_EndTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = begin_EndTime.split(" 到 ")[1].replace(/[-]/g, "");
                var nextMonth = getNextMonth_(new Date(begin_EndTime.split(" 到 ")[1]),2);
                if (beginTime > endTime) {
                    return;
                }
                params["beginTime"] = begin_EndTime.split(" 到 ")[0]+"-01 00:00:00";
                params["endTime"] = yznDateFormatYM(nextMonth)+"-01 00:00:00";
            }else{
                return layer.msg("请选择起始时间");
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getClassFullRateByDateNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:"满班率",
                            dataAxis:[],
                            dataseries:[],
                            times:0
                        }
                        chartData.times = data.context.length;
                        for (var i = 0,len = chartData.times; i < len; i++) {
                            chartData.dataAxis.push(yznDateFormatYM(data.context[i].date));
                            chartData.dataseries.push(data.context[i].fullClassRate);
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
            myChart1.on("click",function(params){
                if(params.seriesType == 'line'){
                        $scope.detailDate = params.name;
                        defaultData=params.name+" 到 "+params.name;
                        changeTable();
                }
            });

        }
        
        function changeTable(){
            var begin_EndTime=$scope.detailDate;
            var nextMonth = getNextMonth_(new Date(begin_EndTime),2);
            var params = {
                province: province,
                city: city,
                'shopId':shopId,
                'beginTime':begin_EndTime+"-01 00:00:00",
                'endTime':yznDateFormatYM(nextMonth)+"-01 00:00:00",
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getClassFullRateByTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                    }
                }

            })
        }
        function export_config() {
            if (!$scope.searchTime) {
                return layer.msg("请选择导出时间");
            };
            var begin_EndTime=$scope.detailDate;
            var nextMonth = getNextMonth_(new Date(begin_EndTime),2);
            var params={
                token:localStorage.getItem('oa_token'),
                province: province,
                city: city,
                shopId:shopId,
                'beginTime':begin_EndTime+"-01 00:00:00",
                'endTime':yznDateFormatYM(nextMonth)+"-01 00:00:00",
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantClassFullRate?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_organ_eduSummary',{});
        }
    }]
});