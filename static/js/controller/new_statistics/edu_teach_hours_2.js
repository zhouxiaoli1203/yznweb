define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
        $scope.compareType = $scope.compareType1 = false;
        $scope.teacher0  = false;
        $scope.teacher1 = true;
        var $course, $year, $term, $teach = undefined;
        var orderType = 'desc';
        var orderName ="total";
        var $type = undefined,typename = "授课人次";
         $scope.activityStatus = undefined;
        init();
        function init(){
            getCourseList();//获取课程
            getTeachList();//获取老师
            getTermList();//获取学期
            changeTotal();
            $scope.screen_classType = [
               {name:"正式人次",id:6},
               {name:"补课人次",id:5},
               {name:"试听人次",id:4},
            ];
            $scope.teacListThead = [
                {'name': '老师','width': '16.6%',},
                {'name': '正式人次','width': '16.6%','issort': true,id:"zhengShiCourseTotal"},
                {'name': '补课人次','width': '16.6%','issort': true,id:"buKeCourseTotal"},
                {'name': '试听人次','width': '16.6%','issort': true,id:"shiTingCourseTotal"},
                {'name': '合计','width': '16.6%','issort': true,'sort':'desc',id:"total"},
            ];
            
            $scope.screen_years = getFrom2017(true,8);
            $scope.studNavJud_ = 0;
            $scope.studNavJud = 2;
            $scope.switchStudNav = switchStudNav;
            $scope.switchStudNav_ = switchStudNav_;
            $scope.onReset = onReset;//重置
            $scope.chargeType = chargeType;//一对一/一对多
            $scope.changeByTeach = changeByTeach;//选择老师
            $scope.changeTeach = changeTeach;//助教/主教
            $scope.changeClassType = changeClassType;//授课类型
            $scope.changeCourse = changeCourse;//课程
            $scope.changeYear = changeYear;//学年
            $scope.changeTerm = changeTerm;//学期
            $scope.sortCllict0 = sortCllict0;//升降序
            $scope.changeClass = changeClass;//标准课，活动课
            
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
            laydate.render({
                elem: '#derTime',
                range: "到",
                isRange: true,
                btns: ['confirm'],
                done: function(value) {
                    $scope.derTime = value;
                }
            });
//          screen_setDefaultField($scope, function() {
//              $scope.screen_goReset['class_type']('正式课(课次)');
//          })
            changeData();
        }
        //以下是获取初始列表
        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data:{pageType:0,courseType:0,courseStatus:"-1"},
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
                data:{pageType:0,quartersTypeId:1},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_teacher = data.context;
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
        //以下是筛选条件
        function onReset(){
            $scope.studNavJud_ = 0;
            $scope.searchTime = GetDateStr(-29) + " 到 " + thisTime();
            $scope.compareType = $scope.compareType1 = false;
            $scope.teacher0  = false;
            $scope.teacher1 = true;
            $course = $year = $term = $teach = undefined;
            $type = undefined;
            typename = "授课人次";
            $scope.activityStatus = undefined;
//          $scope.$broadcast("class_type","clearHeadName","正式课(课次)");
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.screen_goReset["class_type"]("正式课(课次)");
            changeData();
        }
        function switchStudNav(n){
            switch (n){
                case 1:$state.go("new_eduStatistics/teachHours");
                    break;
                case 2:$state.go("new_eduStatistics/teachHours_2");
                    break;
                case 3:$state.go("new_eduStatistics/teachHours_3");
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
        function changeClass(e,val){
            if(e.target.checked){
                $scope.compareType = false;
                $scope.compareType1 = false;
            }
            $scope.activityStatus = e.target.checked?val:undefined;
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
        function changeClassType(t){//切换授课类型
            $type = t?t.id:undefined;
            typename = t?t.name:"授课人次";
            changeChart();
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
                'teacherType': $scope.teacher0?"0":$scope.teacher1?"1":undefined,
                'courseDataType':$type,
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
                'schoolYear': $year,
                'schoolTermId': $term,
                'shopTeacherId':$teach,
                'timeType': $scope.studNavJud_,
                'activityStatus':$scope.classType,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getTeacherCourseStudentChartNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        var chartData = {
                            contain : $('#mainechart'),
                            dataYname:typename,
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
            var params = {
                'teachingMethod':$scope.compareType?"1":$scope.compareType1?"2":undefined,
                'courseId': $course,
                'teacherType': $scope.teacher0?"0":$scope.teacher1?"1":undefined,
                'schoolYear': $year,
                'schoolTermId': $term,
                'activityStatus':$scope.activityStatus,
            };
            if($scope.searchTime){
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getTeacherCourseStudentTableNew",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        angular.forEach(data.context,function(v){
                            v.total = v.zhengShiCourseTotal+v.buKeCourseTotal+v.shiTingCourseTotal;
                        });
                        $scope.tableList = getNewTable(orderName,orderType,data.context);
                    }
                }

            })
        }
        function changeTotal(){
            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getTeacherCourseStudentTotalNew",
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
                courseId: $course,
                schoolYear: $year,
                schoolTermId: $term,
                teacherType: $scope.teacher0?"0":$scope.teacher1?"1":undefined,
                teachingMethod:$scope.compareType?"1":$scope.compareType1?"2":undefined,
                shopTeacherId:$teach,
                activityStatus:$scope.activityStatus,
            };
            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantTeacherCourseStudentNew?' + $.param(params));
        }
        //返回
        function toStatistics(){
            $state.go('new_eduStatistics',{});
        }
    }]
});