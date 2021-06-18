define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        $scope.compareType = $scope.compareType1 = false;
        $scope.teacher0  = $scope.teacher1 = false;
        var $adviser = undefined,orderType = 'desc',orderName="auditionStudentTotal";
        var province, city, shopId = undefined;
        var $type = 5;
        $scope.typeName = "到课人数（应到）";
        init();
        function init(){
            initCity();
//          0 试听预约人数 1试听预约人次 2 试听到课人数 3 试听到课人次 4 试听成单人数
            $scope.screen_classType = [
               {name:"到课人数（应到）",id:5},
               {name:"到课人数（实到）",id:2},
               {name:"成单人数",id:4},
               {name:"到课人次（应到）",id:6},
               {name:"到课人次（实到）",id:3},
            ];
            $scope.screen_time = [{
                name: '按时间',
                value: '0'
            }, {
                name: '按校区',
                value: '1'
            }];
            $scope.teacListThead = [
                {'name': '校区名称','width': '12%',rightBorder:true},
                {'name': '应到','width': '10%','issort': true,'sort':'desc',id:"auditionStudentTotal"},
                {'name': '实到','width': '10%','issort': true,id:"auditionToClassTotal",rightBorder:true},
                {'name': '成单人数','width': '10%','issort': true,id:"auditionContractTotal"},
                {'name': '成单率','width': '9%','issort': true,id:"auditionContractRate",rightBorder:true},
                {'name': '应到','width': '10%','issort': true,id:"auditionStudentTimes"},
                {'name': '实到','width': '10%','issort': true,id:"auditionToClassTimes",rightBorder:true},
                {'name': '到课率','width': '9%','issort': true,id:"auditionToClassRate"},
            ];
            
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
            $scope.studNavJud = 2;
            $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.changeClassType = changeClassType;//类型
            $scope.clickTime = clickTime; //切换按时间还是按校区
            $scope.searchByProv = searchByProv; //按省份筛选
            $scope.searchByCity = searchByCity; //按城市筛选
            $scope.searchByShop = searchByShop; //按所属校区
            $scope.sortCllict0 = sortCllict0;//升降序
            $scope.onReset = onReset; //重置
            
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
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
                $scope.screen_goReset['class_type']('到课人数(应到)');
//              $scope.screen_goReset['by_type']('按时间');
            })
            changeData();
        }
         function initCity() {
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
        }
          function onReset() {
            $scope.studNavJud_ = 0;
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type']('到课人数(应到)');
//              $scope.screen_goReset['by_type']('按时间');
            })
            $type = 5;
            $scope.typeName = "到课人数（应到）";
            //筛选头部初始化
            $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime(); //起始时间
            province = city = shopId = undefined; 
            $scope.cityList = [];
            $scope.shooList = [];
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            changeData();
        }
        function switchStudNav(n){
            switch (n){
                case 1:$state.go("new_organ_saleColumn/adviserWorks");
                    break;
                case 2:$state.go("new_organ_saleColumn/appointListen");
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
        function changeClassType(t){//切换授课类型
            $type = t.id;
            $scope.typeName = t.name;
            changeChart();
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
        function searchByShop(data) {
            if (!data) {
                shopId = undefined;
            } else {
                shopId = data.shopId;
            }
            changeData();
        }
        function clickTime(data) {
            $scope.conditionType = data.value;
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
                'auditionType':$type,
                'timeType': $scope.studNavJud_,
                province: province,
                city: city,
                'shopId':shopId
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAuditionByDateNew",
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
                            shadowColor:"rgba(32,137,188,0.17)",
                            shadowBlur: 10
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
                province: province,
                city: city,
                shopId:shopId
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAuditionByTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
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
                province: province,
                city: city,
                shopId:shopId
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantAudition?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_organ_saleColumn',{});
        }
    }]
});