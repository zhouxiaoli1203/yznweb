define(["pagination", "jqFrom", ], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        init();
        $scope.visitNavJud = 5;

        function init() {
            getSchoolList(0);
            $scope.schoolList = [];
            $scope.nameListThead = [
                { name: "学校名称", width: "100%" },
                { name: "操作", width: "150px", align: "center" }
            ];
            $scope.switchVisitNav = switchVisitNav;
            $scope.addOreditSchool = addOreditSchool; //新增或编辑学校
            $scope.deleteSchool = deleteSchool; //删除学校
            $scope.confirm_set = confirm_set;
            $scope.closePop = function() {
                    layer.close(dialog);
                }
                // 初始化菜单&跳转
            var list = [
                { name: "约课设置", tab: 1, post: 173 },
                { name: "积分设置", tab: 2, post: 174 },
                { name: "教室管理", tab: 3, post: 176 },
                { name: "请假设置", tab: 4, post: 175 },
                { name: "周边学校", tab: 5, post: 177 },
                { name: "分享设置", tab: 6, post: 178 },
            ]
            $scope.tabMenu = list.filter(function(item) {
                return checkAuthMenuById(item.post);
            });
        }

        function switchVisitNav(n) {
            switch (n) {
                case 1:
                    $state.go("setManageEdu", { tab: 1 });
                    break;
                case 2:
                    $state.go("setManageEdu", { tab: 2 });
                    break;
                case 3:
                    $state.go("classroom", {});
                    break;
                case 4:
                    $state.go("setManageEdu", { tab: 4 });
                    break;
                case 5:
                    $state.go("nearbySchool", {});
                    break;
                case 6:
                    $state.go("share", {});
                    break;
                default:
                    break;
            }
        }

        function addOreditSchool(x, type) {
            $scope.schoolType = type;
            if (type == 'add') {
                $scope.schoolInfo = {};
            } else {
                $scope.schoolInfo = angular.copy(x);
            }
            openPopByDiv((type == 'add' ? "新增" : "编辑") + "学校", "#school_set", "660px");
        }

        function deleteSchool(x) {
            detailMsk("确认删除该学校？", function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/pickUp/school/delete",
                    type: "POST",
                    data: JSON.stringify({ schoolId: x.schoolId }),
                    success: function(data) {
                        if (data.status == 200) {
                            pagerRender = false;
                            getSchoolList(0);
                        }
                    }
                })
            });
        }

        function confirm_set() {
            var param = {},
                url;
            if ($scope.schoolType == "add") {
                param = { schoolName: $scope.schoolInfo.schoolName };
                url = "/api/oa/pickUp/school/add";
            } else {
                param = {
                    schoolName: $scope.schoolInfo.schoolName,
                    schoolId: $scope.schoolInfo.schoolId
                };
                url = "/api/oa/pickUp/school/update";
            }
            $.hello({
                url: CONFIG.URL + url,
                type: "POST",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == 200) {
                        pagerRender = false;
                        getSchoolList(0);
                        layer.close(dialog);
                    }
                }
            })
        }

        function getSchoolList(start) {
            var param = {
                //              start: start || "0",
                //              count: eachPage,
                pageType: 0,
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/pickUp/school/list",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.schoolList = data.context;
                        //                      renderPager(data.context.totalNum);
                        //                      $scope.totalNum = data.context.totalNum;
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
                    getSchoolList(start); //回掉
                }
            });
        }

    }]

})