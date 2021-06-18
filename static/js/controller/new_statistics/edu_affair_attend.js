define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-30) + " 到 " + GetDateStr(-1);
        var $course, $year, $term, $teach, $class = undefined;
        var orderType = 'desc';
        var orderName="attendanceRate";
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
                    {'name': '上课次数','width': '20%','issort': true,'id':'rollCallTimes'},
                    {'name': '到课人次','width': '20%','issort': true,'id':'studentTotal'},
                    {'name': '缺席人次','width': '20%','issort': true,'id':'absentTotal'},
                    {'name': '请假人次','width': '20%','issort': true,'id':'leaveTotal'},
                    {'name': '出勤率','width': '20%','issort': true,'sort':'desc','id':'attendanceRate'},
                ];
            });
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
            $scope.studNavJud = 1;
            $scope.isactive = 1;
            $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.tab_course_history = tab_course_history;
            $scope.chargeType = chargeType;//一对一/一对多
            $scope.changeByTeach = changeByTeach;//选择老师
            $scope.changeTeach = changeTeach;//助教/主教
            $scope.changeByClass = changeByClass;//班级
            $scope.changeactivityStatus = changeactivityStatus;//授课类型
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
                data:{pageType:0,courseType:0,courseStatus:"-1",teachingMethod: 2},
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
                classStatus: "1",
                teachingMethod: 2,
                activityStatus:0,
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
        function switchStudNav_(n){
            $scope.studNavJud_ = n;
            changeChart();
        }
        function tab_course_history(n){
            $scope.isactive = n;
            $course = $year = $term = $teach = $class = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            switch (n){
                 case 1:$scope.tableName = '班主任';
                    break;
                case 2:$scope.tableName = '课程';
                    break;
                case 3:$scope.tableName = '班级';
                      getClassList();      
                    break;
                default:
                    break;
            }
             $timeout(function(){
                $scope.reTheadData_['head']();
            },100,true)
             changeData();
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
        function changeTeach(status){
            if(status){
                if($scope.teacher1){
                    $scope.teacher1 = true;
                    $scope.teacher0 = false;
                }
            }else{
                if($scope.teacher0){
                    $scope.teacher0 = true;
                    $scope.teacher1 = false;
                }
            }
            changeData();
        }
        function changeactivityStatus(t){//切换授课类型
            $type = t.id;
            $scope.typeName = t.name;
            changeChart();
        }
        function changeCourse(c){//切换课程
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['学年']();
                $scope.screen_goReset['学期']();
            })
            $year = $term = undefined;
            $course = c== null?undefined:c.courseId;
            changeChart();
        }
        function changeYear(y){//切换学年
            $year = y == null ? undefined : y.year;
            changeChart();
        }
        function changeTerm(t){//切换学期
            $term = t==null?undefined:t.schoolTermId;
            changeChart();
        }
        function changeByTeach(c){//切换老师
            $teach = c== null?undefined:c.shopTeacherId;
            changeChart();
        }
        function changeData(){
            changeChart();
            changeTable();
        }
        //以下是列表和图表的处理
        function changeChart(){
            var params = {
                'courseId': $course,
                'shopTeacherId':$teach,
                'dataType':$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
                'schoolYear': $year,
                'schoolTermId': $term,
                'classId':$class,
                'timeType': $scope.studNavJud_
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAttendanceRateByDateNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:"出勤率",
                            dataAxis:[],
                            dataseries:[],
                            lineType:'line',
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
                            chartData.dataseries.push(data.context[i].attendanceRate);
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

        }
        
        function changeTable(){
            var params = {
                'dataType':$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAttendanceRateTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                        var obj={"rollCallTimes_total":0,"studentTotal_total":0,"absentTotal_total":0,"leaveTotal_total":0,};
                        angular.forEach(data.context,function(v){
                            obj.rollCallTimes_total+=v.rollCallTimes;
                            obj.studentTotal_total+=v.studentTotal;
                            obj.absentTotal_total+=v.absentTotal;
                            obj.leaveTotal_total+=v.leaveTotal;
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
            var params={
                token:localStorage.getItem('oa_token'),
                dataType:$scope.isactive==1?"teacher":$scope.isactive == 2?"course":"class",
                beginTime:$scope.searchTime.split(' 到 ')[0]+" 00:00:00",
                endTime:$scope.searchTime.split(' 到 ')[1]+" 23:59:59",
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantAttendanceRate?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_eduStatistics',{});
        }
    }]
});