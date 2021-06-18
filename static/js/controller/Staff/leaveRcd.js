define(['MyUtils', 'jqFrom', 'laydate', 'pagination', 'mySelect'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 5; //页码初始化
        var searchType, searchName, leaveType;
        init();

        function init() {
            $scope.studNavJud = 2;
            $scope.selectInfoNameId = 'teacherName'; //select初始值
            $scope.kindSearchData = {
                teacherName: '姓名',
                teacherPhone: '联系方式',
                workId: '工号'
            };
            //表头
            $scope.nameListThead = [{
                'name': '姓名',
                'width': '10%'
            }, {
                'name': '工号',
                'width': '10%'
            }, {
                'name': '联系方式',
                'width': '10%'
            }, {
                'name': '请假类型',
                'width': '15%'
            }, {
                'name': '请假时间',
                'width': '25%'
            }, {
                'name': '请假原因',
                'width': '20%'
            }, {
                'name': '操作',
                'width': '10%'
            }, ];
            $scope.screen_type = [
                {value:"0",name:"事假"},
                {value:"1",name:"病假"},
                {value:"2",name:"调休"},
            ];
            $scope.isOperate = checkAuthMenuById("52");//操作员工
            $scope.switchStudNav = switchStudNav; //切换tab
            $scope.SearchData = SearchData; //按钮筛选
            $scope.Enterkeyup = Enterkeyup; //输入框筛选
            $scope.changeType = changeType; //
            $scope.onReset = onReset; //重置按钮
            $scope.openLeave = openLeave;
            $scope.sel_teachers = sel_teachers; //选取意愿老师
            $scope.delTeachers = delTeachers; //删除意愿老师
            $scope.closePop = closePop;
            $scope.confirm_leave = confirm_leave;
            $scope.deleteLeave = deleteLeave;
            getTableList(0);
        }

        function switchStudNav(n) {
            if (n == 1) {
                $state.go("staff_new", {});
            } else if (n == 2) {
                $state.go("staff_new/leaveRcd", {});
            } else if (n == 3) {
                $state.go("staff_new/attendRcd", {});
            }
        }

        function onReset() {
            searchType = searchName = leaveType = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false; //分页重新加载
            getTableList(0);
        }
        //按钮搜索
        function SearchData(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getTableList(0);
        }

        function Enterkeyup(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getTableList(0);
        }

        function changeType(t) {
            leaveType = t == null ? undefined : t.value;
            pagerRender = false;
            getTableList(0);
        }

        function getTableList(start) {
            var params = {
                start: start.toString(),
                count: eachPage,
                searchType: searchType,
                searchName: searchName,
                teacherLeaveType: leaveType,
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/teacherLeave/list",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.listData = data.context.items;
                        renderPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }

            })
        }

        function renderPager(total) {
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
                    getTableList(start); //回掉
                }
            });
        }

        function openLeave() {
            openPopByDiv("请假", ".newleave_pop", "560px", function() {
                getTeachersListPop();
                $scope.leave = {
                    teachers: [],
                    teacherLeaveType:"0",
                    beginDate: "",
                    endDate: "",
                    teacherLeaveDesc: ""
                }
                $scope.$broadcast("_addTeacher", "clearSatus");
                lay('.newleave_pop .dateIcon').each(function(index) {
                    laydate.render({
                        elem: this,
                        isRange: false,
                        type: "datetime",
                        trigger: 'click',
                        done: function(value) {
                            if (index == 0) {
                                $scope.leave.beginDate = value;
                            } else {
                                $scope.leave.endDate = value;
                            }
                        }
                    });
                });
            }, function() {
                closePop();
            });
        }

        function closePop() {
            layer.close(dialog);
        }

        function getTeachersListPop() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: {
                    "pageType": "0",
                    "shopTeacherStatus": "1"
                },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.teachersList = data.context;
                        $timeout(function() {
                            if ($scope.classDetail) {
                                $scope.$broadcast('_addTeacher', 'reloadData', {
                                    'data': $scope.leave.teachers,
                                    'att': 'teacherId'
                                });
                            }
                        }, 500, true);
                    }

                }
            })
        }

        function delTeachers(data, ind) {
            data.hasSelected = false;
            $scope.leave.teachers.splice(ind, 1);
        }

        function sel_teachers(data) {
            var judHas = true;
            var judHasIndex = null;
            angular.forEach($scope.leave.teachers, function(val, index) {
                if (val.teacherId == data.teacherId) {
                    judHas = false;
                    judHasIndex = index;
                }
            });
            if (judHas) {
                $scope.leave.teachers.push(data);
                data.hasSelected = true;
            } else {
                $scope.leave.teachers.splice(judHasIndex, 1);
                data.hasSelected = false;
            }
        }

        function confirm_leave() {
            var arr = [];
            if ($scope.leave.teachers.length > 0) {
                angular.forEach($scope.leave.teachers, function(v) {
                    arr.push(v.shopTeacherId);
                });
            } else {
                return layer.msg("请选择请假员工");
            }
            var param = {
                shopTeacherIdList: arr,
                teacherLeaveType:$scope.leave.teacherLeaveType,
                teacherLeaveDesc: $scope.leave.teacherLeaveDesc,
                beginDate: $scope.leave.beginDate,
                endDate: $scope.leave.endDate
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/teacherLeave/add",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        closePop();
                        pagerRender = false;
                        getTableList(0);
                    }

                }
            })
        }

        function deleteLeave(d) {
            detailMsk("确认删除该条记录？", function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/teacherLeave/delete",
                    type: "post",
                    data: JSON.stringify({
                        teacherLeaveId: d.teacherLeaveId
                    }),
                    success: function(data) {
                        if (data.status == '200') {
                            pagerRender = false;
                            getTableList(0);
                        }

                    }
                })
            });
        }
    }]
})