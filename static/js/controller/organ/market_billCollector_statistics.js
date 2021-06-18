define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var  province, city, shopId = undefined;
        var channelTypeId =  undefined,orderType = 'desc',orderName="addRosterNum";
        $scope.status = "0";
        $scope.name2 = "新增名单";
        init();
        function init(){
            initCity();
            getChannelList();//获取渠道类型
            //0新增名单 1 有效名单 2 无效名单 3 带到访 4 已转潜客 5 已签约 6 报课金额 
            $scope.screen_namelist = [
                {name:"新增名单",id:"0"},
                {name:"有效名单",id:"1"},
                {name:"无效名单",id:"2"},
//              {name:"带到访",id:"3"},
                {name:"已转潜客",id:"4"},
                {name:"已签约",id:"5"},
                {name:"报课金额",id:"6"},
            ];

            $scope.teacListThead = [
                {'name': '校区名称','width': '12.5%'},
                {'name': '新增名单','width': '12.5%','issort': true,'sort': 'desc','id':'addRosterNum'},
                {'name': '有效名单','width': '12.5%','issort': true,'id':'effectiveRosterNum'},
                {'name': '无效名单','width': '12.5%','issort': true,'id':'invalidRosterNum'},
//              {'name': '带到访','width': '12.5%','issort': true,'id':'toVisitNum'},
                {'name': '已转潜客','width': '12.5%','issort': true,'id':'toPotentialCustomerNum'},
                {'name': '已签约','width': '12.5%','issort': true,'id':'toContractNum'},
                {'name': '报课金额','width': '12.5%','issort': true,'id':'contractPriceTotal'},
            ];
            
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
//          $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.changeChannelType = changeChannelType;//按渠道类型
//          $scope.changeChannelType2 = changeChannelType2;//按2级渠道类型
            $scope.changeNameStatus = changeNameStatus;//类型搜索
            $scope.sortCllict0 = sortCllict0;//升降序
            $scope.searchByProv = searchByProv; //按省份筛选
            $scope.searchByCity = searchByCity; //按城市筛选
            $scope.searchByShop = searchByShop; //按所属校区
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
                $scope.screen_goReset['class_type']('新增名单');
            })
            changeData();
        }
        function initCity() {
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
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
//      function getChannelList2(id){
//          $.hello({
//              url: CONFIG.URL + '/api/oa/setting/getChannelList',
//              data:{channelTypeId:id,pageType:0},
//              type: 'get',
//              success: function(data) {
//                  if (data.status == "200") {
//                      $scope.screen_channelType2=data.context;
//                      if(data.context.length>0){
//                           $scope.hasChannel2 = true;
//                      }else{
//                           $scope.hasChannel2 = false;
//                      }
//                  }
//              }
//          });
//      }
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
        function onReset() {
            $scope.studNavJud_ = 0;
            channelTypeId = undefined;
            $scope.status = "0";
            //筛选头部初始化
            $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
            province = city = shopId = undefined; 
            $scope.cityList = [];
            $scope.shooList = [];
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type']('新增名单');
            })
            changeData();
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
        function changeChannelType(n){
//          channelId = undefined;
//          screen_setDefaultField($scope, function() {
//              $scope.screen_goReset['channel2']();
//          })
            channelTypeId = n == null?undefined:n.id;
//          if(channelTypeId != undefined || channelTypeId !=null){
//              getChannelList2(channelTypeId);
//          }else{
//              $scope.hasChannel2 = false;
//          }
            changeData();
        }
//      function changeChannelType2(n){
//          channelId = n == null?undefined:n.id;
//          changeData();
//      }
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
                province: province,
                city: city,
                shopId:shopId,
                rosterType:$scope.status,
                channelTypeId:channelTypeId,
//              channelId:channelId,
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
                shopId:shopId,
                rosterType:$scope.status,
                channelTypeId:channelTypeId,
//              channelId:channelId,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getClerkRecordByTableNew",
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
            var params={
                token:localStorage.getItem('oa_token'),
                beginTime:$scope.searchTime.split(' 到 ')[0]+" 00:00:00",
                endTime:$scope.searchTime.split(' 到 ')[1]+" 23:59:59",
                province: province,
                city: city,
                shopId:shopId,
                channelTypeId:channelTypeId,
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantClerkRecord?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_organ_marketAnalysis',{});
        }
    }]
});