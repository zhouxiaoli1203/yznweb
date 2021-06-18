define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var $course, $year, $term, $adviser = undefined,
        $type="data2",orderType = 'desc', orderName = "data2";
        $scope.typeName = "签约人数";
        init();

        function init() {
            getCourseList(); //获取课程
            getTermList(); //获取学期
            changeTotal();
            getAdviserName();//顾问
            $scope.screen_classType = [{
                name: "签约人数",
                id: "data2"
            }, {
                name: "新报人数",
                id: "data3"
            }, {
                name: "续报人数",
                id: "data4"
            }, {
                name: "扩科人数",
                id: "data5"
            }];
             $scope.tableName="顾问";
            $scope.$watch('tableName',function(){
                $scope.teacListThead = [
                    {'name': $scope.tableName,'width': '20%'},
                    {
                'name': '签约人数',
                'width': '16%',
                'issort': true,
                'sort': 'desc',
                id: "data2"
            }, {
                'name': '新报人数',
                'width': '16%',
                'issort': true,
                id: "data3"
            }, {
                'name': '续报人数',
                'width': '16%',
                'issort': true,
                id: "data4"
            }, {
                'name': '扩科人数',
                'width': '16%',
                'issort': true,
                id: "data5"
            }, {
                'name': '新生比',
                'width': '16%',
                'issort': true,
                id: "rate"
            }];
            })
            $scope.studNavJud = 1;
            $scope.studNavJud_ = 0;
            $scope.isactive = 1;
            $scope.screen_years = getFrom2017(true,8);
            $scope.changeClassType = changeClassType; //授课类型
            $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.tab_course_history = tab_course_history;
            $scope.sortCllict0 = sortCllict0; //升降序
            $scope.changeAdviser = changeAdviser; //顾问
            $scope.changeCourse = changeCourse; //课程
            $scope.changeYear = changeYear; //学年
            $scope.changeTerm = changeTerm; //学期

            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics; //返回教务统计首页
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
                $scope.screen_goReset['class_type']('签约人数');
            })
            changeData();
        }
        //以下是获取初始列表
        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: {
                    pageType: 0,
                    courseStatus: "-1"
                },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_course = data.context;
                    }

                }
            })
        }

        function getTermList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                type: "get",
                data: {
                    pageType: 0
                },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_term = data.context;
                    }

                }
            })
        }

        function getAdviserName() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data: {
                    pageType: '0',
                    quartersTypeId: '3',
                },
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_adviser = data.context;
                        $scope.screen_adviser.unshift({
                            "teacherName": "无顾问",
                            "shopTeacherId": "-1"
                        });
                    }
                }
            });
        }

        function switchStudNav(n) {
            $scope.studNavJud = n;
            switch (n) {
                case 1:
                    $state.go("new_saleStatistics/contract_personnum");
                    break;
                case 2:
                    $state.go("new_saleStatistics/contract_coursetype");
                    break;
                case 3:
                    $state.go("new_saleStatistics/contract_money");
                    break;
                default:
                    break;
            }
        }
        function switchStudNav_(n){
            $scope.studNavJud_ = n;
            changeChart();
        }
        function sortCllict0(data) {
            console.log(data);
            orderName = data.id;
            orderType = data.sort;
            $scope.tableList = getNewTable(orderName, orderType, $scope.tableList);

        }

        function changeClassType(t) { //切换授课类型
            $type = t.id;
            $scope.typeName = t.name;
            changeDataChart(t.name, t.id, $scope.chartData);
        }

        function changeAdviser(t) {
            $adviser = t == null ? undefined : t.shopTeacherId;
            changeChart();
        }

        function changeCourse(c) { //切换课程
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['学年']();
                $scope.screen_goReset['学期']();
            })
            $year = $term = undefined;
            $course = c == null ? undefined : c.courseId;
            changeData();
        }

        function changeYear(y) { //切换学年
            $year = y == null ? undefined : y.year;
            changeData();
        }

        function changeTerm(t) { //切换学期
            $term = t == null ? undefined : t.schoolTermId;
            changeData();
        }

        function tab_course_history(n) {
            $scope.isactive = n;
            $course = $year = $term = $adviser = undefined;
            $type = 'data2';
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['class_type']('签约人数');
            })
            switch (n) {
                case 1:
                    $scope.tableName = '顾问';
                    break;
                case 2:
                    $scope.tableName = '课程';
                    break;
                default:
                    break;
            }
            $timeout(function() {
                $scope.reTheadData_['head']();
            }, 100, true)
            changeData();
        }

        function changeData() {
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart() {
              var params = {
                'type':1,
                'courseId': $course,
                'shopTeacherId':$adviser,
                'schoolYear': $year,
                'schoolTermId': $term,
                'timeType': $scope.studNavJud_,
                'dataType':$scope.isactive==1?"counselor":$scope.isactive == 2?"course":"",
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/signedChart",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.chartData = data.context;
                        changeDataChart($scope.typeName, $type, data.context);
                    }
                }

            })
        }

        function changeDataChart(t, d, list) {
            var chartData = {
                contain: $('#mainechart'),
                dataYname: $scope.typeName,
                dataAxis: [],
                dataseries: [],
                times: 0
            }
            chartData.times = list.length;
            for (var i = 0, len = chartData.times; i < len; i++) {
                chartData.dataAxis.push(list[i].data1);
                chartData.dataseries.push(list[i][d]);
            }
            console.log(chartData);
            if (chartData.contain[0]) {
                $timeout(function() {
                    echart(chartData);
                });
            }
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
                    height: 24
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
                        formatter: function(params) {
                            return params;
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
                    name: chartData.dataYname,
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

        function changeTotal() {
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/signedSummary",
                type: "get",
                data:{type:1},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.dataTotal = data.context;
                    }
                }

            })
        }

        function changeTable() {
            var params = {
                'type':1,
                'dataType':$scope.isactive==1?"counselor":$scope.isactive == 2?"course":"",
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            if($year){
                params["schoolYear"] = $year;
            }
            if($year){
                params["schoolTermId"] = $term;
            }
            if($course){
                params["courseId"] = $course;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/signedTable",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName, orderType, data.context);
                    }
                }

            })
        }

        function export_config() {
            var params = {
                token: localStorage.getItem('oa_token'),
                type:1,
                dataType:$scope.isactive==1?"counselor":$scope.isactive == 2?"course":"",
            };
             if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            } else {
                return layer.msg("请选择起始时间");
            }
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/exportSignedStatistics?' + $.param(params));
        }
        //返回
        function toStatistics() {
            $state.go('new_saleStatistics', {});
        }
    }]
});