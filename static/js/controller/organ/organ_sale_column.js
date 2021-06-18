define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    // controller
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchName, province, city, shopId = undefined;
        var searchType = "shopName"; //筛选条件：课程、老师是主教还是助教、班级
        var orderName = 'received',
            orderType = 'desc';
        var timeType = '0';
        $scope.begin_endTime = GetDateStr(-15) + " 到 " + GetDateStr(-1); //起始时间
        $scope.qianKeType = 'potial'; //柱状图默认为消课课时
        $scope.conditionType = '0'; //默认按时间显示
        init();

        function init() {
            initCity(); //获取省份
            getShooList();
            $scope.cityList = []; //城市数据
            $scope.shooList = []; //所属校区
            $scope.studNavJud_ = 0;
            $scope.qianKe = {
                potial: "新增潜客",
                time: "按时间",
            };
            //筛选栏数据
            $scope.selectInfoNameId = 'studentName';
            $scope.kindSearchData = {
                studentName: '校区',
            }
            $scope.screen_swiChart = [{
                name: '新增潜客',
                value: 'potial'
            }, {
                name: '签约单数',
                value: 'complete'
            }, {
                name: '签约金额',
                value: 'contactPrice'
            }
//          , {
//              name: '实收金额',
//              value: 'relPrice'
//          }
            ];
            $scope.screen_time = [{
                name: '按时间',
                value: '0'
            }, {
                name: '按校区',
                value: '1'
            }];
            $scope.teacListThead = [{
                'name': '校区',
                'width': '20%',
            }, {
                'name': '新增潜客（人）| 占比',
                'width': '20%',
                'issort': true,
                'id': 'addPotentialCustomer',
                'align': 'center'
            }, {
                'name': '签约单数（单）| 占比',
                'width': '20%',
                'issort': true,
                'id': 'addContract',
                'align': 'center'
            }, {
                'name': '签约金额（元）| 占比',
                'width': '20%',
                'issort': true,
                'id': 'contractPrice',
                'align': 'center'
            }, {
//              'name': '实收金额（元）| 占比',
//              'width': '20%',
//              'issort': true,
//              'sort': 'desc',
//              'id': 'received',
//              'align': 'center'
//          }, {
                'name': '操作',
                'width': '20%',
                'align': 'center'
            }];
            $scope.switchStudNav_ = switchStudNav_; //切换日、周、月按钮
            $scope.searchByProv = searchByProv; //按省份筛选
            $scope.searchByCity = searchByCity; //按城市筛选
            $scope.searchByShop = searchByShop; //按所属校区
//          $scope.exportAllData = exportAllData; //教务汇总  总数据导出弹框
            $scope.export_config = export_config; //导出总数据 确定
//          $scope.export_cancel = export_cancel; //取消
            $scope.sortCllict0 = sortCllict0; //教师授课课时列表排序
            $scope.SearchData = SearchData; //筛选搜索框
            $scope.Enterkeyup = Enterkeyup; //筛选搜索框
            $scope.onReset = onReset; //重置
            $scope.clickswiChart = clickswiChart; //切换消课课时还是消课金额
            $scope.clickTime = clickTime; //切换按时间还是按校区
            $scope.gotoPartyShop = gotoShop; //进入校区
            //日历引入
            (function() {
                laydate.render({
                    elem: '#searchTime',
                    value: GetDateStr(-15) + " 到 " + GetDateStr(-1),
                    range: "到",
                    isRange: true,
                    done: function(value) {
                        $scope.begin_endTime = value;
                        if(value){
                            getShopDayDataList_allData();
                            getShopDayDataList_data(0);
                            getShopDayDataList_chart();
                        }else{
                            layer.msg("请选择录入时间");
                        }
                    }
                });
            })();
            
            //数据概览跳转过来
            if($stateParams.dataType == '新增潜客') {
                $scope.qianKeType = 'potial';
                screen_setDefaultField($scope, function() {
                    $scope.screen_goReset['search_1']('新增潜客');
                });
            } else if($stateParams.dataType == '签约金额') {
                $scope.qianKeType = 'contactPrice';
                screen_setDefaultField($scope, function() {
                    $scope.screen_goReset['search_1']('签约金额');
                });
            }
            getShopDayDataList_allData();
            getShopDayDataList_data(0);
            getShopDayDataList_chart();
        }
        $scope.$on('threePartyChange', function() {
            pagerRender = false;
            getShopDayDataList_allData();
            getShopDayDataList_data(0);
            getShopDayDataList_chart();
        });

        function onReset() {
            //图标初始化
            $scope.qianKeType = 'potial';
            timeType = '0';
            $scope.studNavJud_ = 0;
            $scope.qianKe = {
                potial: "新增潜客",
                time: "按时间",
            };
            $scope.conditionType = '0';
            //筛选头部初始化
            $scope.begin_endTime = GetDateStr(-16) + " 到 " + GetDateStr(-1); //起始时间
            searchName = province = city = shopId = undefined; //筛选条件：课程、老师是主教还是助教、班级
            $scope.cityList = [];
            $scope.shooList = [];
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.$emit('threePartyChange');
        }

        function initCity() {
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
        }
        //以下筛选
        function SearchData(data) {
            searchName = data.value;
            pagerRender = false;
            $scope.$emit('threePartyChange');
        }

        function Enterkeyup(data) {
            searchName = data.value;
            pagerRender = false;
            $scope.$emit('threePartyChange');
        }

        function sortCllict0(data) {
            orderName = data.id;
            orderType = data.sort;
            getShopDayDataList_data(start);
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
            $scope.$emit('threePartyChange');
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
            $scope.$emit('threePartyChange');
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
            $scope.$emit('threePartyChange');
        }
        //以下图表
        function clickswiChart(data) {
            $scope.qianKeType = data.value;
            getShopDayDataList_chart();
        }

        function clickTime(data) {
            $scope.conditionType = data.value;
            getShopDayDataList_chart();
        }

        function switchStudNav_(n) {
            $scope.studNavJud_ = n;
            getShopDayDataList_chart();
        }
        //汇总数据
        function getShopDayDataList_allData() {
            if($scope.begin_endTime){
                var beginTime = $scope.begin_endTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.begin_endTime.split(" 到 ")[1].replace(/[-]/g, "");
                if (beginTime > endTime) {
                    return;
                }
            }else{
                return layer.msg("请选择录入时间");
            }
            var param = {
                searchType: searchType,
                searchName: searchName,
                province: province,
                city: city,
                shopId: shopId
            }
            if ($scope.begin_endTime) {
                param['beginTime'] = $scope.begin_endTime.split(" 到 ")[0]+" 00:00:00";
                param['endTime'] = $scope.begin_endTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/org/statistics/getShopDayDataList",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.allData = data.context[0];
                    }
                }
            })
        }
        //列表数据
        function getShopDayDataList_data(start_) {
            start = start_ == 0?"0":start_;
            if($scope.begin_endTime){
                var beginTime = $scope.begin_endTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.begin_endTime.split(" 到 ")[1].replace(/[-]/g, "");
                if (beginTime > endTime) {
                    return;
                }
            }else{
                return layer.msg("请选择录入时间");
            }
            var param = {
                start: start_ || '0',
                count: eachPage,
                searchType: searchType,
                searchName: searchName,
                orderName: orderName,
                orderTyp: orderType,
                conditionType: '1',
                province: province,
                city: city,
                shopId: shopId,
                pageType: '1'
            }
            if ($scope.begin_endTime) {
                param['beginTime'] = $scope.begin_endTime.split(" 到 ")[0]+" 00:00:00";
                param['endTime'] = $scope.begin_endTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/org/statistics/getShopDayDataList",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.eduDataList = data.context.items;
                        renderPager(data.context.totalNum);
                    }
                }
            })
        }

        function renderPager(total) { //分页
            if (pagerRender)
                return;
            pagerRender = true;
            var $M_box3 = $('.M-box3');
            $M_box3.pagination({
                totalData: total || 0, // 数据总条数
                showData: eachPage, // 显示几条数据
                jump: true,
                coping: true,
                count: 2, // 当前页前后分页个数
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页',
                callback: function(api) {
                    if (api.getCurrentEach() != eachPage) { //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getShopDayDataList_data(start); //回掉
                }
            });
        }

        function getOrderName(data) {
            switch (data) {
                case 'potial':
                    return 'addPotentialCustomer';
                    break;
                case 'complete':
                    return 'addContract';
                    break;
                case 'contactPrice':
                    return 'contractPrice';
                    break;
//              case 'relPrice':
//                  return 'received';
//                  break;
                default:
                    break;
            }
        }
        //图标数据
        function getShopDayDataList_chart() {
            if($scope.begin_endTime){
                var beginTime = $scope.begin_endTime.split(" 到 ")[0].replace(/[-]/g, "");
                var endTime = $scope.begin_endTime.split(" 到 ")[1].replace(/[-]/g, "");
                if (beginTime > endTime) {
                    return;
                }
            }else{
                return layer.msg("请选择录入时间");
            }
            var param = {
                searchType: searchType,
                searchName: searchName,
                conditionType: $scope.conditionType,
                province: province,
                city: city,
                shopId: shopId,
            }
            if ($scope.conditionType != '1') {
                param['timeType'] = "" + $scope.studNavJud_;
            }
            if ($scope.conditionType == 1) {
                param['orderName'] = getOrderName($scope.qianKeType);
                param['orderTyp'] = 'desc';
            }
            if ($scope.begin_endTime) {
                param['beginTime'] = $scope.begin_endTime.split(" 到 ")[0]+" 00:00:00";
                param['endTime'] = $scope.begin_endTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/org/statistics/getShopDayDataList",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        var dataAxis = [];
                        var dataseries = [];
                        var times;
                        times = data.context.length;
                        for (var i = 0; i < times; i++) {
                            if ($scope.conditionType == '0') {
                                switch ($scope.studNavJud_) {
                                    case 0:
                                        dataAxis.push(theTimeMd(data.context[i].date));
                                        break;
                                    case 1:
                                        dataAxis.push(theTimeMd(data.context[i].weekBeginDate) + "-" + theTimeMd(data.context[i].weekEndDate));
                                        break;
                                    case 2:
                                        dataAxis.push(theTimeMC(data.context[i].date));
                                        break;
                                    default:
                                        break;
                                }
                            } else {
                                dataAxis.push(data.context[i].shopName);
                            }
                            switch ($scope.qianKeType) {
                                case 'potial':
                                    dataseries.push(data.context[i].addPotentialCustomer);
                                    break;
                                case 'complete':
                                    dataseries.push(data.context[i].addContract);
                                    break;
                                case 'contactPrice':
                                    dataseries.push(data.context[i].contractPrice);
                                    break;
//                              case 'relPrice':
//                                  dataseries.push(data.context[i].received);
//                                  break;
                                default:
                                    break;
                            }
                        }
                        echart(dataAxis, dataseries, times);
                    }
                }
            })
        }

        //统计图
        function echart(dataAxis, dataseries, times) {
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
            var count = (wid / 80) / times * 100;
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
                    data: dataAxis,
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
                        formatter: function(params) {
                            return $scope.conditionType == '1' ? formatter(params) : params;
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
                    type: 'bar',
                    barCategoryGap: '50',
                    data: dataseries,
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

        function exportAllData() {
            layerOpen('exportAllData', '导出数据');
        }

        function export_cancel() {
            layer.close(dialog);
        }

        function export_config() {
            if(!$scope.begin_endTime){
                return layer.msg("请选择录入时间");
            }
            var beginTime = $scope.begin_endTime.split(' 到 ')[0]+" 00:00:00";
            var endTime = $scope.begin_endTime.split(' 到 ')[1]+" 23:59:59";
            var token = localStorage.getItem('oa_token');
            var params = {
                province: province,
                city: city,
                shopId: shopId,
                beginTime: beginTime,
                endTime: endTime,
                searchType: searchType,
                searchName: searchName,
                orderName: orderName,
                orderTyp: orderType,
                token: token,
                exlType: "0"
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/org/statistics/consultantOrgChart?' + $.param(params));
        }
    }];
});