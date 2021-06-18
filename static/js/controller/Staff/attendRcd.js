define(['MyUtils', 'jqFrom', 'laydate', 'pagination', 'mySelect'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 5; //页码初始化
        var searchType, searchName;
        init();

        function init() {
            $scope.studNavJud = 3;
            $scope.selectInfoNameId = 'teacherName'; //select初始值
            $scope.kindSearchData = {
                teacherName: '姓名',
                teacherPhone: '联系方式',
                workId: '工号'
            };
            //表头
            $scope.nameListThead = [{
                'name': '姓名',
                'width': '20%'
            }, {
                'name': '工号',
                'width': '15%'
            }, {
                'name': '联系方式',
                'width': '15%'
            }, {
                'name': '打卡时间',
                'width': '20%'
            }, {
                'name': '来源',
                'width': '15%'
            }, {
                'name': '操作',
                'width': '15%'
            }, ];
            $scope.isOperate = checkAuthMenuById("52");//操作员工
            $scope.switchStudNav = switchStudNav; //切换tab
            $scope.SearchData = SearchData; //按钮筛选
            $scope.Enterkeyup = Enterkeyup; //输入框筛选
            $scope.onReset = onReset; //重置按钮
            $scope.openRecord = openRecord;
            $scope.sel_teachers = sel_teachers; //选取意愿老师
            $scope.delTeachers = delTeachers; //删除意愿老师
            $scope.closePop = closePop;
            $scope.confirm_leave = confirm_leave;
            $scope.deleteLeave = deleteLeave;
             laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getTableList(0);
                }
            });
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
            $scope.searchTime = "";
            searchType = searchName = undefined;
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


        function getTableList(start) {
            var params = {
                start: start.toString(),
                count: eachPage,
                searchType: searchType,
                searchName: searchName,
            };
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/list",
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

        function openRecord() {
            openPopByDiv("新增记录", ".newRecord_pop", "560px", function() {
                getTeachersListPop();
                $scope.teachers = [];
                $scope.signTime = "";
                $scope.$broadcast("_addTeacher", "clearSatus");
                laydate.render({
                    elem: "#startTime",
                    isRange: false,
                    type: "datetime",
                    max:yznDateFormatYMdHms(new Date()),
                    trigger: 'click',
                    done: function(value) {
                        $scope.signTime = value;
                    }
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
                                    'data': $scope.teachers,
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
            $scope.teachers.splice(ind, 1);
        }

        function sel_teachers(data) {
            var judHas = true;
            var judHasIndex = null;
            angular.forEach($scope.teachers, function(val, index) {
                if (val.teacherId == data.teacherId) {
                    judHas = false;
                    judHasIndex = index;
                }
            });
            if (judHas) {
                $scope.teachers.push(data);
                data.hasSelected = true;
            } else {
                $scope.teachers.splice(judHasIndex, 1);
                data.hasSelected = false;
            }
        }

        function confirm_leave() {
            var arr = [];
            if ($scope.teachers.length > 0) {
                angular.forEach($scope.teachers, function(v) {
                    arr.push(v.shopTeacherId);
                });
            } else {
                return layer.msg("请选择请假员工");
            }
            var param = {
                shopTeacherIdList: arr,
                signTime: $scope.signTime,
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/add",
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
                    url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/delete",
                    type: "post",
                    data: JSON.stringify({
                        id: d.id
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