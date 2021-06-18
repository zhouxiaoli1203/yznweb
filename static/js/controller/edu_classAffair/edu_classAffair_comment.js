define(['laydate', 'SimpleCalendar', "pagination", 'moment', 'timeDaterangepicker', 'mySelect', 'rollCall', 'clsaffairPop', "courseAndClass_sel", "photoPop"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_classId, search_courseId, search_status, search_theme, search_shopTeacherId = undefined;
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "desc";
        $scope.searchTime = "";
        $scope.sel_un_upload = $scope.sel_un_comment = $scope.sel_un_homeWk = false;
        $scope.compareType = $scope.compareType1 = false;
        $scope.activityStatus = undefined;
        init();

        function init() {
            getCourseList();
            getCourseTheme();
            getClassList();
            getTeacherList();
            $scope.scheduleListThead = [
                { 'name': '上课时间', 'width': '270', 'issort': true, 'sort': 'asc' },
                { 'name': '班级', 'width': '15%' },
                { 'name': '课次', 'width': '10%', 'align': 'center' },
                { 'name': '老师', 'width': '10%' },
                { 'name': '点评人数', 'width': '15%', 'align': 'right', "paddingRight": '100px' },
            ];
            $scope.operateClass = checkAuthMenuById("79"); //操作课务
            $scope.courseSelect = courseSelect; //选择课程
            $scope.classSelect = classSelect; //选择班级
            $scope.teacherSelect = teacherSelect; //选择主教老师
            $scope.changeCourseTh = changeCourseTh; //选择上课主题
            $scope.chargeType = chargeType;
            $scope.chargeactivityStatus = chargeactivityStatus; //标准班，活动班
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.onReset = onReset; //重置
            $scope.reloadList = reloadList;
            $scope.switchVisitNav = switchVisitNav; //跳转路由
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    $scope.$emit("clsAffair_comment", false);
                }
            });
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.searchData) {
                    search_classId = $scope.$stateParams.screenValue.searchData.classId;
                    screen_setDefaultField($scope, function () {
                        $scope.screen_goReset['班级选择']($scope.$stateParams.screenValue.searchData.className);
                    });
                }
            }
            getListModelInfos(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        //获取工作台数据
        if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '快捷入口') {
            setTimeout(function() {
                window.$rootScope.yznOpenPopUp($scope, "arange-pop", "arange_pop", "760px", { "name": "lesson", "isSingle": "1", "title": "快速排课" });
            }, 500);
        };

        //跳转路由
        function switchVisitNav(type) {
            switch (type) {
                case 1:
                    $state.go('edu_classAffair');
                    break;
                case 2:
                    $state.go('edu_classAffair/show');
                    break;
                case 3:
                    $state.go('edu_classAffair/comment');
                    break;
                case 4:
                    $state.go('edu_classAffair/houseWk');
                    break;
                case 5:
                    $state.go('edu_classAffair/clock');
                    break;
            }
        }

        function getCourseTheme(id) {
            var param = {
                courseId: id ? id : undefined
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/courseTheme/list",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        data.context.unshift({
                            courseThemeName: '无主题'
                        })
                        $scope.courseTheme = data.context;
                    }
                }
            });
        }
        //获取课程列表
        function getCourseList() {
            var p = {
                'pageType': 0,
                'courseStatus': 1,
                'courseType': 0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.courseList = data.context;
                    }
                }
            });
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
                        $scope.classList = data.context;
                    }
                }
            });
        }
        //获取老师列表
        function getTeacherList(id) {
            var p = {};
            var url;
            if (id) {
                p["classId"] = id;
                url = "/api/oa/class/getClassTeacherList";
            } else {
                p["pageType"] = "0";
                p["quartersTypeId"] = "1";
                p["shopTeacherStatus"] = "1";
                url = "/api/oa/shopTeacher/list";

            }
            $.hello({
                url: CONFIG.URL + url,
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context;
                        if (id) {
                            angular.forEach(list, function(v) {
                                v.teacherName = v.shopTeacher.teacherName;
                            });
                        }
                        $scope.teacherList = list;
                    }
                }
            });
        }

        function reloadList() {
            getListModelInfos(start);
        }

        function onReset() {
            search_classId = search_courseId = search_theme = search_shopTeacherId = undefined;
            $scope.compareType = $scope.compareType1 = false;
            $scope.activityStatus = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
                $scope.$broadcast(i, "clearSearchVal");
            }
            getCourseList();
            getClassList(search_courseId);
            getTeacherList(search_classId);
            getCourseTheme(search_courseId);
            $scope.$emit("clsAffair_comment", false);
        }

        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            $scope.$emit("clsAffair_comment", false);
        }

        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            getClassList(search_courseId);
            getCourseTheme(search_courseId);
            $scope.$emit("clsAffair_comment", false);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            getTeacherList(search_classId);
            $scope.$emit("clsAffair_comment", false);
        }

        function teacherSelect(t) {
            search_shopTeacherId = t == null ? undefined : t.shopTeacherId;
            $scope.$emit("clsAffair_comment", false);
        }

        function changeCourseTh(t) {
            search_theme = t == null ? undefined : t.courseThemeId;
            pagerRender = false;
            getListModelInfos(0, t && !t.courseThemeId);
        }

        function chargeType(type) {
            if (type) {
                if ($scope.compareType) {
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                    $scope.activityStatus = undefined;
                }
            } else {
                if ($scope.compareType1) {
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                    $scope.activityStatus = undefined;
                }
            }
            $scope.$emit("clsAffair_comment", false);
        }

        function chargeactivityStatus(e, val) {
            if (e.target.checked) {
                $scope.compareType = false;
                $scope.compareType1 = false;
            }
            $scope.activityStatus = e.target.checked ? val : undefined;
            $scope.$emit("clsAffair_comment", false);
        }
        $scope.$on("clsAffair_comment", function(e, startPage) {
            if (startPage == "true") {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //获取列表数据
        function getListModelInfos(start_, fl) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                "start": start_.toString() || "0",
                "count": eachPage,
                "classId": search_classId,
                "courseId": search_courseId,
                "courseThemeId": search_theme,
                "status": "1",
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "shopTeacherId": search_shopTeacherId,
                "courseListStatus": 2,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'activityStatus': $scope.activityStatus,
            }
            if (fl) { //是否为无主题
                params["noCourseTheme"] = 1;
            }
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/list",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == 200) {
                        console.log(data);
                        angular.forEach(data.context.items, function(v) {
                            v.teacherStr = arrToStr(v.teachers, "teacherName");
                        });
                        $scope.scheduleComment = data.context.items;
                        schedulePager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }
            });
        };

        function schedulePager(total) { //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
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
                    getListModelInfos(start);
                }
            });

        }
    }];
});