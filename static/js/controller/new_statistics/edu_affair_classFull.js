define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetMonthStr(-7) + " 到 " + GetMonthStr(-2);
        $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
        var $course, $year, $term, $teach =  undefined;
        var orderType = 'desc',orderName="fullClassRate",defaultData;
        var $type = 0;
        init();
        function init(){
            getCourseList();//获取课程
            getTeachList();//获取老师
            getTermList();//获取学期
            changeTotal();
            $scope.tableName="班主任";
            $scope.$watch('tableName',function(){
                $scope.teacListThead = [
                    {'name': $scope.tableName,'width': '20%'},
                    {'name': '班级数量','width': '40%','issort': true,'id':'classMax'},
                    {'name': '满班率','width': '40%','issort': true,'sort':'desc','id':'fullClassRate'},
                ];
            });
            
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud = 2;
            $scope.isactive = 1;
            $scope.switchStudNav = switchStudNav;
            $scope.tab_course_history = tab_course_history;
            $scope.changeByTeach = changeByTeach;//选择老师
            $scope.changeCourse = changeCourse;//课程
            $scope.changeYear = changeYear;//学年
            $scope.changeTerm = changeTerm;//学期
            $scope.sortCllict0 = sortCllict0;//升降序
            
//          $scope.exportAllData = exportAllData;//导出数据
//          $scope.closePop = closePop;
            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics;//返回教务统计首页
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
            changeChart();
            changeTable();
        }
        //以下是获取初始列表
        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data:{pageType:0,courseStatus:"-1",teachingMethod: 2},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_course = data.context;
                    }

                }
            })
        }
        function getTeachList(){
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data:{pageType:0,quartersTypeId:14},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_teacher = data.context;
                    }

                }
            })
        }
                //获取班级列表
        function getClassList(id) {
            var p = {
                pageType: "0",
                classStatus: "1"
            };
            if (id) {
                p["courseId"] = id;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_class = data.context;
                    }
                }
            });
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
        function tab_course_history(n){
            $scope.isactive = n;
            $course = $year = $term = $teach  = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            switch (n){
                 case 1:$scope.tableName = '班主任';
                    break;
                case 2:$scope.tableName = '课程';
                    break;
                default:
                    break;
            }
            defaultData = $scope.searchTime;
             $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
             $timeout(function(){
                $scope.reTheadData_['head']();
            },100,true)
            changeChart();
            changeTable();
        }
        function sortCllict0(data){
            console.log(data);
             orderName = data.id;
             orderType = data.sort;
            $scope.tableList =  getNewTable(orderName,orderType,$scope.tableList);
             
        }
        function changeCourse(c){//切换课程
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['学年']();
                $scope.screen_goReset['学期']();
            })
            $year = $term = undefined;
            $course = c== null?undefined:c.courseId;
            defaultData = $scope.searchTime;
            $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
            changeChart();
        }
        function changeYear(y){//切换学年
            $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
            $year = y == null ? undefined : y.year;
            changeChart();
        }
        function changeTerm(t){//切换学期
            $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
            $term = t==null?undefined:t.schoolTermId;
            changeChart();
        }
        function changeByTeach(c){//切换老师
            defaultData = $scope.searchTime;
            $scope.detailDate = $scope.searchTime?$scope.searchTime.split(" 到 ")[1]:"";
            $teach = c== null?undefined:c.shopTeacherId;
            changeChart();
        }
        function changeData(){
            changeChart();
//          changeTable();
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
                'courseId': $course,
                'shopTeacherId':$teach,
                'dataType':$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
                'schoolYear': $year,
                'schoolTermId': $term,
            };
//          if($scope.searchTime){
//              params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+"-01 00:00:00";
//              params["endTime"] = $scope.searchTime.split(" 到 ")[1]+"-01 00:00:00";
//          }
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
                'dataType':$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"",
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
                        var obj={"classMax_total":0,"studentTotal_total":0,"studentAllTotal_total":0};
                        angular.forEach(data.context,function(v){
                            obj.classMax_total+=v.classMax;
                            obj.studentTotal_total+=v.studentTotal;
                            obj.studentAllTotal_total+=v.studentAllTotal;
                        });
                        $scope.totalData = obj;
                    }
                }

            })
        }
        function changeTotal(){
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAffairsTotalNew",
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
            var begin_EndTime=$scope.detailDate;
            var nextMonth = getNextMonth_(new Date(begin_EndTime),2);
            var params={
                token:localStorage.getItem('oa_token'),
                dataType:$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"",
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
            $state.go('new_eduStatistics',{});
        }
    }]
});