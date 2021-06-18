define(['laydate', 'pagination','mySelect'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams',function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name, courseId = undefined;
        $scope.teacherStatus1 = false ,$scope.teacherStatus2 = false;
        $scope.classStatus = true;
        $scope.perRstatus = false;
        $scope.performanceLists = [];
        $scope.shopTeachId = undefined;
        init();

        function init() {
            $scope.studNavJud = 2;
            $scope.selectInfoNameId = 'teacherName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                teacherName: '姓名、电话',
                teacherPhone: '电话',
            };
            //表头
            $scope.performanceRuleRListThead_left = [
                {
                    'name': '姓名',
                    'width': '100'
                },  {
                    'name': '联系方式',
                    'width': '100'
                }
            ];
            $scope.performanceRuleRListThead_right = [
                {
                    'name': '课程',
                    'width': '20%'
                },  {
                    'name': '绩效名称',
                    'width': '15%'
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '130'
                }, {
                    'name': '班级',
                    'width': '20%'
                },  {
                    'name': '绩效名称',
                    'width': '15%'
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '150'
                },
            ];
            $scope.operatePerformance = checkAuthMenuById("98"); //操作工资
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.searchByCourse = searchByCourse;
            $scope.teacherStatus = teacherStatus;
            $scope.s_classStatus = s_classStatus;
            $scope.s_perRstatus = s_perRstatus;
            $scope.openPerformance = openPerformance;//打开生成绩效窗口
            $scope.openSetPerformance = openSetPerformance;//打开设置绩效窗口
            $scope.getRightDataById = getRightDataById;//根据老师ID获取绩效列表
            $scope.getRightData = getRightData;//根据老师ID获取绩效列表
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop;//关闭弹框

            performanceRuleRList(0);
        }
        function closePop(){
            layer.close(dialog);
        }
        function switchStudNav(n) {
            $scope.studNavJud = n;
            switch (n){
            	case 1:$state.go("performance", {});
            		break;
            	case 2:$state.go("performance/setting", {});
            		break;
            	case 3:$state.go("performance/rule", {});
            		break;
            	default:
            		break;
            }
        }
        function searchdata(d) {
            pagerRender = false;
            search_type = d?d.type:null;
            search_name = d?d.value:null;
            performanceRuleRList(0);
        }
        function searchByCourse(c){
            courseId = c !=null?c.courseId:undefined;
            pagerRender = false;
            performanceRuleRList(0);
        }
        function teacherStatus(type) {
            if(type){
                if($scope.teacherStatus1){
                    $scope.teacherStatus1 = true;
                    $scope.teacherStatus2 = false;
                }
            }else{
                if($scope.teacherStatus2){
                    $scope.teacherStatus2 = true;
                    $scope.teacherStatus1 = false;
                }
            }
            pagerRender = false;
            performanceRuleRList(0);
        }
        function s_classStatus(){
            getRightData();
        }
        function s_perRstatus(){
            getRightData();
        }
        function onReset() {
            search_type = search_name = courseId=undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
             $scope.kindSearchOnreset(); //调取app重置方法
            $scope.teacherStatus1 = false ,$scope.teacherStatus2 = false;
            $scope.classStatus = true;
            $scope.perRstatus = false;
             pagerRender = false;
            performanceRuleRList(0);
        }
        function performanceRuleRList(start) {
            var data = {
                "start": start.toString(),
                "count": "10",
                "searchType":search_name?'appSearchName':undefined,
                "searchName":search_name,
                "quartersTypeId":1,
                "shopTeacherStatus":$scope.teacherStatus1?"1":$scope.teacherStatus2?"2":undefined,

            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.performanceSettingList = data.context.items;
                        leavePager(data.context.totalNum);
                        if(data.context.items[0]){
                            getRightDataById(data.context.items[0]);
                        }else{
                            $scope.performanceLists = [];
                        }
                    }

                }
            })
        }

        function leavePager(total) { //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
            var $M_box3 = $('.M-box3');

            $M_box3.pagination({
                totalData: total || 0, // 数据总条数
                showData: eachPage, // 显示几条数据
                isShowData:false,
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
                    performanceRuleRList(start); //回调
                }
            });

        }
        function getRightDataById(x){
            $scope.shopTeachId = x.shopTeacherId;
            angular.forEach($scope.performanceSettingList, function(data) {
                data.isActive = false;
            });
            x.isActive = true;
            getRightData();
        }
        function getRightData(){
            var param={
                shopTeacherId:$scope.shopTeachId,
                classStatus:$scope.classStatus?"1":undefined,
                performanceRuleRStatus:$scope.perRstatus?"0":undefined,
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/payroll/performanceRuleListByShopTeacher",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.performanceLists = data.context;
                    }

                }
            })
        }
        //生成绩效
        function openPerformance(){
            $scope.createPerformance = {
                time:getMonthFE(-1).firstDate + " 到 " + getMonthFE(-1).endDate
            };
            laydate.render({
                elem: '#recordTime', //指定元素
                range: '到',
                isRange: true,
                value:getMonthFE(-1).firstDate + " 到 " + getMonthFE(-1).endDate,
                done: function(value) {
                    $scope.createPerformance.time = value;
                }
            });
            $scope.createPerformance_confirm = createPerformance_confirm;//导出绩效
             openPopByDiv('生成绩效','.createPerformance','560px');
             function createPerformance_confirm(){
                if($scope.createPerformance.time) {
                    var beginTime = $scope.createPerformance.time.split(' 到 ')[0]+" 00:00:00";
                    var endTime = $scope.createPerformance.time.split(' 到 ')[1]+" 23:59:59";
                    var token=localStorage.getItem('oa_token');
                    window.open(CONFIG.URL + "/api/oa/statistics/consultantPerformance?beginTime=" + beginTime+ '&&endTime=' + endTime + '&&token=' + token);
                };
             }
        }
        //设置绩效
        function openSetPerformance(x,t_){
            if(angular.copy(x).performanceRule){
                $scope.perRuleDetail = angular.copy(x).performanceRule;
                $scope.screen_goReset["myPerforRule"]($scope.perRuleDetail.performanceRuleName);
            }else{
                $scope.screen_goReset["myPerforRule"]();
                $scope.perRuleDetail={
                    performanceRuleId:undefined,
                };
            }
            getPerRule();
            $scope.clickPerRule = clickPerRule;
            $scope.setPerformance_confirm = setPerformance_confirm;
             openPopByDiv('设置绩效','.setPerformance','560px');

            function getPerRule(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/listPerformanceRule",
                    type: "get",
                    data:{pageType:0},
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.perRules = data.context;
                        }

                    }
                })
            }
            function clickPerRule(n){
                $scope.perRuleDetail.performanceRuleId = n != null?n.performanceRuleId:undefined;
            }
             function setPerformance_confirm(){
                 if($scope.perRuleDetail.performanceRuleId == undefined || $scope.perRuleDetail.performanceRuleId == ""){
                     return layer.msg("请选择绩效规则");
                 }
                 var param = {
                     shopTeacherId:$scope.shopTeachId,
                     performanceRuleId:$scope.perRuleDetail.performanceRuleId
                 };
                 if(t_ == 'course'){
                     param['courseId'] = x.course.courseId;
                 }else{
                      param['classId'] = x.classInfo.classId;
                 }
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/updatePerformanceRuleR",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            closePop();
                            getRightData();
                        }

                    }
                })
             }
        }
    }]
})