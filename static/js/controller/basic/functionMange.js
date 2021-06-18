define(['laydate', 'pagination', 'mySelect'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化

//      $scope.config = window.currentUserInfo.shop.config;

        $scope.list = [
            {"name":"拨打电话", "desc":"开启后，允许上课老师拨打学员电话", "field":CONFIG_TEACHER_CHECK_STUDENT_PHONE},
            {"name":"名单管理", "desc":"开启后，单独对早期线索进行电话跟进，高效开发潜在客户", "field":CONFIG_NAME},
            {"name":"约课功能", "desc":"开启后，允许创建约课班级；同时家长端支持预约上课", "field":CONFIG_BOOKING},
            {"name":"库存功能", "desc":"开启后，允许机构对库存进行操作及管理", "field":CONFIG_STOCK_CONTROL},
            {"name":"积分功能", "desc":"开启后，允许机构设置积分规则，为学员添加积分和兑换礼品", "field":CONFIG_INTEGRAL_CONTROL},
            {"name":"点名设置", "desc":"","rollcallLimitDay":0, "field":CONFIG_ROLLCALL},
            {"name":"隐藏课时", "desc":"开启后，家长端学员的课程课时信息将被隐藏", "field":CONFIG_HIDE_COURSE_TIME },
            {"name":"保存视频", "desc":"开启后，允许家长保存机构上传的视频文件", "field":CONFIG_STUDENT_SAVE_VIDEO },
            {"name":"记上课功能", "desc":"开启后，允许授课老师在排课以外手动记上课", "field":CONFIG_NO_LESSON_ROLLCALL },
            ];
        $scope.rollcallLimitDay = 0;
        init();
        function init() {
            getConfig();
            $scope.visitNavJud = 5;
            $scope.switchVisitNav = switchVisitNav; //切换tab页
            $scope.changeBtn = changeBtn;//切换按钮
            $scope.checkEnable = checkEnable;//检查开关状态
            $scope.setDays = setDays;//失焦设置值
        }
        
        function getConfig(){
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function (data) {
                    if (data.status == '200') {
                        $scope.config = data.context.config;
                        angular.forEach($scope.list,function(v){
                            if(v.name == "点名设置"){
                                v.rollcallLimitDay = angular.copy(data.context.rollcallLimitDay);
                            }
                        });
                    }
                }
            })
        }
       function switchVisitNav(n){
            switch (n){
                case 1:$state.go("center",{});
                    break;
                 case 2:localStorage.setItem("$statetime", 2);$state.go("time",{pageType:2});
                    break;
                case 3:localStorage.setItem("$statetime", 3);$state.go("time",{pageType:3});
                    break;
                case 4:$state.go("classroom",{});
                    break;
                case 5:$state.go("functionMange",{});
                    break;
                case 6:$state.go("notice",{});
                    break;
                case 7:$state.go("nearbySchool",{});
                    break;
                case 8:$state.go("share",{});
                    break;
                default:
                    break;
            }
        }
        function checkEnable(x) {
           return (x.field)&($scope.config);
        }

        function changeBtn(x){
           if ((x.field)&($scope.config)) {
               $scope.config = $scope.config &(~(x.field));//禁用
           } else {
               $scope.config = $scope.config | (x.field);//启用
           }
            getTeacherOaList(x);
        }
        function getTeacherOaList(x) { //获取请假补课列表信息
            var param={
                config:$scope.config
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/update",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg(x.name + "功能" + (($scope.config &x.field)?"已开启":"已禁用"), {
                            icon: 1
                        });

                        window.currentUserInfo.shop.config = $scope.config;

                        localStorage.setItem("currentUserInfo", JSON.stringify(window.currentUserInfo));
                        $scope.$emit("config_changed", x.field);
                    }

                }
            })
        }

        function teacherPager(total) { //分页
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
                    getTeacherOaList(start); //回调
                }
            });

        }
        function setDays(num){
           if(num =="" || num == undefined){
               angular.forEach($scope.list,function(v){
                    if(v.name == "点名设置"){
                        v.rollcallLimitDay = 0;
                        num = 0;
                    }
                });
           }
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/update",
                type: "post",
                data: JSON.stringify({rollcallLimitDay:num*1}),
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg("设置成功", {
                            icon: 1
                        });

                        window.currentUserInfo.shop.rollcallLimitDay = $scope.rollcallLimitDay;
                    }

                }
            })
        }

    }]
})