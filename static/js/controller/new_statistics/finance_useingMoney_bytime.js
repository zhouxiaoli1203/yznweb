define(["datePicker", "echarts", "laydate", "pagination", "angular", "mySelect", "timeDaterangepicker"], function(datePicker, echarts, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        $scope.compareType = $scope.compareType1 = false;
        var $course, $year, $term, undefined;
        var orderType = 'desc';
        var orderName = "price";
        $scope.screen_course = [];
        init();

        function init() {
            getTermList(); //获取学期
            $scope.teacListThead = [
                { 'name': '课程', 'width': '30%' },
                { 'name': '剩余购买课时', 'width': '30%', 'issort': true, 'id': 'num' },
                { 'name': '剩余赠送课时', 'width': '30%', 'issort': true, 'id': 'giveNum' },
                { 'name': '待消金额', 'width': '30%', 'issort': true, 'sort': 'desc', 'id': 'price' },
            ];

            $scope.screen_years = getFrom2017(true, 8);
            $scope.studNavJud = 1;
            $scope.switchStudNav = switchStudNav;
            $scope.onReset = onReset; //重置
            $scope.chargeType = chargeType; //一对一/一对多
            $scope.changeCourse = changeCourse; //课程
            $scope.changeYear = changeYear; //学年
            $scope.changeTerm = changeTerm; //学期
            $scope.sortCllict0 = sortCllict0; //升降序

            $scope.export_config = export_config;
            $scope.toStatistics = toStatistics; //返回教务统计首页
            changeTable();
        }

        function getTermList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                type: "get",
                data: { pageType: 0 },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_term = data.context;
                    }

                }
            })
        }
        //以下是筛选条件
        function onReset() {
            $scope.compareType = $scope.compareType1 = false;
            $course = $year = $term = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            changeTable();
        }

        function switchStudNav(n) {
            switch (n) {
                case 1:
                    $state.go("financeStatistics/useing_money_bytime");
                    break;
                case 2:
                    $state.go("financeStatistics/useing_money_bymonth");
                    break;
                default:
                    break;
            }
        }

        function sortCllict0(data) {
            console.log(data);
            orderName = data.id;
            orderType = data.sort;
            $scope.tableList = getNewTable(orderName, orderType, $scope.tableList);

        }

        function chargeType(status) {
            if (status) {
                if ($scope.compareType) {
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                }
            } else {
                if ($scope.compareType1) {
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                }
            }
            changeTable();
        }

        function changeCourse(c) { //切换课程
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['学年']();
                $scope.screen_goReset['学期']();
            })
            $year = $term = undefined;
            $course = c == null ? undefined : c.courseId;
            changeTable();
        }

        function changeYear(y) { //切换学年
            $year = y == null ? undefined : y.year;
            changeTable();
        }

        function changeTerm(t) { //切换学期
            $term = t == null ? undefined : t.schoolTermId;
            changeTable();
        }

        function changeTable() {
            var params = {
                'courseId': $course,
                'feeType': "0",
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'schoolYear': $year,
                'schoolTermId': $term,
            };

            $.hello({
                url: CONFIG.URL + "/api/oa/statistics/getAdvancedPaymentByTableNew",
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
                'token': localStorage.getItem('oa_token'),
                'courseId': $course,
                'feeType': "0",
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'schoolYear': $year,
                'schoolTermId': $term,
            };

            for (var i in params) {
                if (params[i] == undefined || params[i] == "") {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantAdvancedPayment?' + $.param(params));
        }
        //返回
        function toStatistics() {
            $state.go('financeStatistics', {});
        }
    }]
});