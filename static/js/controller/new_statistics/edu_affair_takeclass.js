define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        var $course, $year, $term = undefined;
        var orderType = 'desc';
        var orderName="studentAllTotal";
        init();
        function init(){
            getCourseList();//获取课程
            getTermList();//获取学期
             $scope.teacListThead = [
                {'name': '教务','width': '25%',},
                {'name': '班级数量','width': '25%','issort': true,id:"classMax"},
                {'name': '班级人数','width': '25%','issort': true,'sort':'desc',id:"studentAllTotal"},
                {'name': '学员人数','width': '25%','issort': true,id:"studentTotal"},
            ];
            $scope.studNavJud = 4;
            $scope.screen_years = getFrom2017(true,8);
            $scope.chargeType = chargeType;//一对一/一对多
            $scope.changeCourse = changeCourse;//课程
            $scope.changeYear = changeYear;//学年
            $scope.changeTerm = changeTerm;//学期
            $scope.switchStudNav = switchStudNav;
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
            changeData();
        }
                //以下是获取初始列表
        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data:{pageType:0,courseStatus:"-1"},
                success: function(data) {
                    if (data.status == '200') {
                        var list=[];
                        angular.forEach(data.context,function(v){
                            if(v.courseType != 1){
                                list.push(v);
                            }
                        });
                        $scope.screen_course = list;
                    }

                }
            })
        }
        function getTermList(){
            $.hello({
                url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                type: "get",
                data:{pageType:0},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_term = data.context;
                    }

                }
            })
        }
        function switchStudNav(n){
            switch (n){
            	case 1:$state.go("new_eduStatistics/eduAffair_attend");
            		break;
            	case 2:$state.go("new_eduStatistics/eduAffair_classFull");
            		break;
            	case 3:$state.go("new_eduStatistics/eduAffair_inclass");
            		break;
            	case 4:$state.go("new_eduStatistics/eduAffair_takeclass");
            		break;
            	default:
            		break;
            }
        }
        function sortCllict0(data){
            console.log(data);
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
        }
        function chargeType(status){
            if(status){
                if($scope.compareType){
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                }
            }else{
                if($scope.compareType1){
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                }
            }
            changeData();
        }
        function changeCourse(c){//切换课程
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['学年']();
                $scope.screen_goReset['学期']();
            })
            $year = $term = undefined;
            $course = c== null?undefined:c.courseId;
            changeData();
        }
        function changeYear(y){//切换学年
            $year = y == null ? undefined : y.year;
            changeData();
        }
        function changeTerm(t){//切换学期
            $term = t==null?undefined:t.schoolTermId;
            changeData();
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var params = {
                'courseId': $course,
                'schoolYear': $year,
                'schoolTermId': $term,
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
            };
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getTakeClassTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:"班级人数",
                            dataAxis:[],
                            dataseries:[],
                            times:0
                        }
                        chartData.times = data.context.length;
                        for (var i = 0,len = chartData.times; i < len; i++) {
                            chartData.dataAxis.push(data.context[i].name);
                            chartData.dataseries.push(data.context[i].studentAllTotal);
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
            var params = {
                 'courseId': $course,
                'schoolYear': $year,
                'schoolTermId': $term,
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
            };
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getTakeClassTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                        var obj={"zhengshikeci":0,"zhengshikeshi":0.00,"bukekeci":0,"bukekeshi":0.00,"shitingrenci":0};
                        angular.forEach(data.context,function(v){
                            obj.zhengshikeci+=v.zhengShiCourseTotal;
                            obj.zhengshikeshi+=v.zhengShiCourseTimes;
                            obj.bukekeci+=v.buKeCourseTotal;
                            obj.bukekeshi+=v.buKeCourseTimes;
                            obj.shitingrenci+=v.shiTingCourseTotal;
                        });
                        $scope.totalData = obj;
                    }
                }

            })
        }
        function export_config() {
            var params={
                courseId: $course,
                schoolYear: $year,
                schoolTermId: $term,
                token:localStorage.getItem('oa_token'),
                teachingMethod:$scope.compareType?"1":$scope.compareType1?"2":undefined,
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantTakeClass?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_eduStatistics',{});
        }
    }]
});