define(['laydate', 'SimpleCalendar', 'pagination', 'mySelect', 'remarkPop', 'students_sel', 'potential_pop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function ($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        console.log($scope)
        console.log($scope.$stateParams)
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name, search_status = undefined;
        $scope.searchTime = "";

        init();

        function init() {
            $scope.viewQingjia = checkAuthMenuById("43"); //浏览请假
            $scope.isQingjia = checkAuthMenuById("44"); //学员请假
            $scope.viewMakeup = checkAuthMenuById("45"); //浏览缺席记录
            $scope.opMakeup = checkAuthMenuById("46"); //操作补课
            if (!$scope.viewQingjia && !$scope.isQingjia && ($scope.viewMakeup || $scope.opMakeup)) {
                $state.go("edu_leave/makeup", {});
            }
            $scope.studNavJud = 1;
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、手机号',
                studentNickName: '昵称',
                userPhone: '手机号'
            };
            //表头
            $scope.nameListThead = [{
                'name': '姓名(昵称)',
                'width': '40%'
                    //          }, {
                    //              'name': '昵称',
                    //              'width': '25%'
            }, {
                'name': '联系方式',
                'width': '110'
            }, {
                'name': '请假时间',
                'width': '250'
            }, {
                'name': '请假原因',
                'width': '60%'
            }, {
                'name': '申请时间',
                'width': '200'
            }, {
                'name': '状态',
                'width': '70'
            }, {
                'name': '操作',
                'width': '150',
                'align': 'center'
            }];


            $scope.screen_status = [{
                "name": "待确认",
                "id": "0"
            }, {
                "name": "已拒绝",
                "id": "2"
            }, {
                "name": "已确认",
                "id": "4"
                    //          }, {
                    //              "name": "放弃",
                    //              "id": "3"
            }];
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    leaveMakeUpList(0);
                }
            });
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.changeStatus = changeStatus; //按状态筛选
            $scope.SearchData = SearchData; //搜索按钮
            $scope.Enterkeyup = Enterkeyup; //keyup筛选
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop; //关闭弹框

            $scope.leavePop = leavePop; //打开请假弹框
            // $scope.leaveSet = leaveSet;//请假设置needdel__cz
            $scope.gotoProcsessApply = gotoProcsessApply; //处理申请
            $scope.gotoViewInfo = gotoViewInfo; //查看详情
            $scope.confirm_procesApply = confirm_procesApply; //确认处理
            $scope.closeProcesApply = closeProcesApply; //关闭请假申请处理弹框
            $scope.confirm_leave = confirm_leave; //请假
            $scope.gotoViewStudent = gotoViewStudent; //跳转学员详情

            //工作台快捷入口数据跳转
            if ($scope.$stateParams.screenValue.name == 'workbench') {
                if ($scope.$stateParams.screenValue.type == "快捷入口") {
                    leavePop();
                } else if ($scope.$stateParams.screenValue.type == "待处理") {
                    search_status = 0;
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['状态']('待处理');
                    });
                }
            }
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.pop == "请假") {
                    $timeout(function () {
                        leavePop();
                    })
                }
            }
            leaveMakeUpList(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        function gotoViewStudent(x) {
            if (checkAuthMenuById("29")) {
                window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', { 'page': 1, 'item': x, 'tab': 1 });
            } else {
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览学员权限。");
            }
        }

        function closePop() {
            layer.close(dialog);
        }
        //获取班级列表
        $scope.$on("请假学员", function(evt, data) {
            $scope.hasStudent = data;
        });

        function switchStudNav(n) {
            $scope.studNavJud = n;
            search_status = undefined;

            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $state.go("edu_leave", {});
            } else {
                $state.go("edu_leave/makeup", {});
            }
        }

        function SearchData(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function Enterkeyup(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false;
            leaveMakeUpList(0);
        }

        function changeStatus(s) {
            search_status = s == null ? undefined : s.id;
            pagerRender = false;
            leaveMakeUpList(0);
        }


        function onReset() {
            search_type = search_name = search_status = undefined;
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            pagerRender = false;
            leaveMakeUpList(0);
        }
        $scope.$on("leaveChange", function(evt, isOldPage) {
            if (isOldPage) {
                leaveMakeUpList(start);
            } else {
                pagerRender = false;
                leaveMakeUpList(0);
            }
        });

        function leaveMakeUpList(start_) { //获取请假补课列表信息
            start = start_ == 0 ? "0" : start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                'searchType': search_name ? 'appSearchName' : undefined,
                "searchName": search_name,
                "leaveStatus": search_status,
            }
            if ($scope.searchTime) {
                data["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                data["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.leaveList = data.context.items;
                        leavePager(data.context.totalNum);
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
                    leaveMakeUpList(start); //回调
                }
            });

        }
        //以下是请假设置
        // function leaveSet() {
        //     $scope.warnLeaveNum = window.currentUserInfo.shop.warnLeaveNum;
        //     $scope.leaveConfirmStatus = window.currentUserInfo.shop.leaveConfirmStatus == "1" ? true : false;
        //     openPopByDiv("请假设置", ".setleave_pop");
        //     $scope.confirm_Set = confirm_Set; //请假设置确认
        //     function confirm_Set() {
        //         var param = {
        //             warnLeaveNum: $scope.warnLeaveNum,
        //             leaveConfirmStatus: $scope.leaveConfirmStatus ? "1" : "0"
        //         };
        //         $.hello({
        //             url: CONFIG.URL + "/api/oa/leave/updateLeaveWarn",
        //             type: "post",
        //             data: JSON.stringify(param),
        //             success: function(data) {
        //                 if (data.status == '200') {
        //                     closePop();
        //                     window.currentUserInfo.shop.warnLeaveNum = $scope.warnLeaveNum;
        //                     window.currentUserInfo.shop.leaveConfirmStatus = $scope.leaveConfirmStatus;
        //                     $scope.$emit('leaveChange', false);
        //                     layer.msg('设置完成');
        //                 };
        //             }
        //         })
        //     }
        // }
        //以下是请假逻辑
        function leavePop() {
            openPopByDiv("请假", ".newleave_pop");
            $scope.hasStudent = "";
            $scope.beginDate = yznDateFormatYMd(new Date()) + " 00:00:00";
            $scope.endDate = $scope.leaveReason = $scope.teacher_desc = "";
            lay('.newleave_pop .dateIcon').each(function(index) {
                laydate.render({
                    elem: this,
                    isRange: false,
                    type: "datetime",
                    trigger: 'click',
                    done: function(value) {
                        if (index == 0) {
                            $scope.beginDate = value;
                        } else {
                            $scope.endDate = value;
                        }
                    }
                });
            });

        }

        function confirm_leave() {
            if (!$scope.hasStudent) {
                layer.msg("请选择请假学员");
                return;
            }
            if (CompareDate($scope.beginDate, $scope.endDate)) {
                return layer.msg("开始时间不能大于结束时间");
            }
            var params = {
                "studentId": $scope.hasStudent.id,
                "leaveDesc": $scope.leaveReason,
                "leaveStatus": "4", // 4 已处理 与老师处理原因一起
                "beginDate": $scope.beginDate,
                "endDate": $scope.endDate,
                "leaveTeacherDesc": $scope.teacher_desc
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/add",
                type: "post",
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == '200') {
                        closePop();
                        $scope.$emit('leaveChange', false);
                    };
                }
            })
        }
        //以下是处理申请
        function gotoProcsessApply(x) {
            openProcessPop("请假申请处理", ".procesApply_pop");
            $scope.confirm_apply = "1";
            $scope.leaveData = x;
            $scope.leaveTeacherDesc = x.leaveTeacherDesc;
        }
        //以下是查看详情
        function gotoViewInfo(x) {
            openPopByDiv("请假详情", ".viewInfo_pop");
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/info",
                type: "get",
                data: { "leaveId": x.leaveId },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.leaveInfo = data.context;
                    };
                }
            })
        }

        function confirm_procesApply() {
            console.log("请假申请处理");
            var param = {
                leaveId: $scope.leaveData.leaveId,
                leaveStatus: $scope.confirm_apply == 1 ? "4" : "2",
                leaveTeacherDesc: $scope.leaveTeacherDesc
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/leave/update",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        closeProcesApply();
                        closePop();
                        $scope.$emit('leaveChange', true);
                    };
                }
            })
        }
        var isProcessPop;

        function openProcessPop(title, div) {
            isProcessPop = layer.open({
                type: 1,
                title: title,
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(div)
            })
        }

        function closeProcesApply() {
            layer.close(isProcessPop);
        }
    }]
})