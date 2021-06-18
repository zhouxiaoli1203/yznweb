define(['courseAndClass_sel', 'mySelect'], function() {
    return ['$scope', '$state', 'SERVICE', '$stateParams','$timeout', function($scope, $state, SERVICE, $stateParams,$timeout) {
        init();

        function init() {
            getConfig();
            //约课预警
            $scope.switchVisitNav = switchVisitNav; //切换
            $scope.delCourse = delCourse; //删除预警班级
            $scope.aeDataBlur = aeDataBlur; //修改
            SERVICE.COURSEANDCLASS.CLASS['预警班级'] = deterSelCourse;
            // 积分设置
            $scope.tabSwitch = tabSwitch;
            $scope.getRuleList = getRuleList;
            $scope.changeBtn = changeBtn; //切换系统规则状态
            $scope.operateIntegral = checkAuthMenuById("120");
            $scope.toSubmitHk = toSubmitHk; //提交作业
            $scope.setRule = setRule; //新增或编辑机构规则
            $scope.deleteRule = deleteRule; //删除机构规则
            $scope.closePopup = function() {
                layer.close(dialog);
            }

            //请假设置
            $scope.confirm_Set = function(fl) {
                if (fl) {
                    $scope.leaveConfirmStatus = !$scope.leaveConfirmStatus;
                }
                if ($scope.warnLeaveNum === '' || $scope.warnLeaveNum === undefined) {
                    return $scope.warnLeaveNum = window.currentUserInfo.shop.warnLeaveNum;
                }
                var param = {
                    warnLeaveNum: $scope.warnLeaveNum,
                    leaveConfirmStatus: $scope.leaveConfirmStatus ? "1" : "0"
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/leave/updateLeaveWarn",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            window.currentUserInfo.shop.warnLeaveNum = $scope.warnLeaveNum;
                            window.currentUserInfo.shop.leaveConfirmStatus = $scope.leaveConfirmStatus;
                            layer.msg('设置成功');
                        };
                    }
                })
            };
            // if ($stateParams.tab) {
            //     if ($stateParams.tab < 5 && $stateParams.tab != 3) {
            //         switchVisitNav($stateParams.tab)
            //     }
            // } else {
            //     switchVisitNav(localStorage.getItem("$statetime") ? localStorage.getItem("$statetime") : 1)
            // }
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
            if ($stateParams.tab) { //跳转带tab信息
                var tabItem = $scope.tabMenu.filter(function(item) {
                    return item.tab == $stateParams.tab
                });
                if (tabItem.length) {
                    switchVisitNav(tabItem[0].tab)
                } else {
                    switchVisitNav($scope.tabMenu[0].tab)
                }
                if ($stateParams.before) {
                    $scope.routerBefore = $stateParams.before;
                }
            } else { //不带信息 || 刷新
                var statetime = localStorage.getItem("$statetime");
                if (statetime) {
                    var tabItem = $scope.tabMenu.filter(function(item) {
                        return item.tab == statetime;
                    });
                    if (tabItem.length) {
                        switchVisitNav(tabItem[0].tab)
                    } else {
                        switchVisitNav($scope.tabMenu[0].tab);
                    }
                } else {
                    switchVisitNav($scope.tabMenu[0].tab);
                }
            }
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.visitNavJud = $scope.$stateParams.screenValue.tab;
                    $timeout(function () {
                        switchVisitNav($scope.visitNavJud);
                    })
                }
            }

        }
        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.bookingTime = data.context.bookingTime;
                        $scope.bookingSubmitTime = data.context.bookingSubmitTime;
                        $scope.bookingPercent = data.context.bookingPercent;
                    }
                }
            })
        }
        function switchVisitNav(n) {
            $scope.visitNavJud = n;
            if ($stateParams.tab < 5 && $stateParams.tab != 3) localStorage.setItem("$statetime", $scope.visitNavJud);
            switch (Number(n)) {
                case 1:
                    $scope.selClassList = []; //非预警课程
                    getClass();
                    getConfig();
                    break;
                case 2:
                    $scope.tabSwitch(false);
                    break;
                case 3:
                    $state.go("classroom", {});
                    break;
                case 4:
                    $scope.warnLeaveNum = window.currentUserInfo.shop.warnLeaveNum;
                    $scope.leaveConfirmStatus = window.currentUserInfo.shop.leaveConfirmStatus == "1" ? true : false;
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
        /*
         *约课预警
         */

        //获取预警班级
        function getClass() {
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: { bookingStatus: 1, pageType: 0, classStatus: 1 },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.selClassList = data.context;
                    }
                }
            })
        }

        function deterSelCourse(d) {
            angular.forEach(d, function(val) {
                var judge = true;
                angular.forEach($scope.selClassList, function(val_) {
                    if (val.classId == val_.classId) {
                        judge = false;
                    }
                })
                if (judge) {
                    $scope.selClassList.push(val);
                }
            })
            var arr = [];
            angular.forEach($scope.selClassList, function(v) {
                arr.push({
                    "classId": v.classId
                });
            });
            aeselClassList(arr, 1)
        }

        function delCourse(d) {
            var isCall = layer.confirm('确认删除  ' + d.className + '  ?', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                aeselClassList([d], 0)
                layer.close(isCall);
            }, function() {
                layer.close(isCall);
            })
        }
        // 删除新增预警班级
        function aeselClassList(arr, status) {
            $.hello({
                url: CONFIG.URL + "/api/oa/class/updateBookingWarnTimeStatusList",
                type: "post",
                data: JSON.stringify({ classInfos: arr, bookingStatus: status }),
                success: function(data) {
                    if (data.status == '200') {
                        getClass();
                    }
                }
            })
        }
        // 约课预警失焦
        function aeDataBlur() {
            // $scope.bookingTime===0的情况去掉
            if ($scope.bookingTime === '' || $scope.bookingTime === undefined) {
                return $scope.bookingTime = window.currentUserInfo.shop.bookingTime
            }
            if ($scope.bookingSubmitTime === '' || $scope.bookingSubmitTime === undefined) {
                return $scope.bookingSubmitTime = window.currentUserInfo.shop.bookingSubmitTime
            }
            if ($scope.bookingPercent === '' || $scope.bookingPercent === undefined) {
                return $scope.bookingPercent = window.currentUserInfo.shop.bookingPercent
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/updateBookingWarnTimeStatus",
                type: "post",
                data: JSON.stringify({
                    "bookingTime": $scope.bookingTime,
                    "bookingSubmitTime": $scope.bookingSubmitTime,
                    "bookingPercent": $scope.bookingPercent
                }),
                success: function(data) {
                    if (data.status == '200') {
                        window.currentUserInfo.shop.bookingTime = $scope.bookingTime;
                        window.currentUserInfo.shop.bookingSubmitTime = $scope.bookingSubmitTime;
                        window.currentUserInfo.shop.bookingPercent = $scope.bookingPercent;
                        layer.msg('设置成功');
                    }
                }
            })
        }

        /*
         *积分设置
         */
        function tabSwitch(fl) {
            $scope.inteActive = fl;
            if (!$scope.inteActive) {
                getRuleList(1)
            } else {
                getRuleList(2)
            }
        }

        function getRuleList(n) {
            $.hello({
                url: CONFIG.URL + '/api/oa/points/listPointsRule',
                type: "get",
                data: { "ruleType": n },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.ruleList = data.context;
                    }

                }
            })
        }

        function changeBtn(x) {
            if (!$scope.operateIntegral) return;
            if (x.stauts == 0 && !x.pointsRuleDetailList) {
                layer.msg("没有设定具体的规则，不能启用。");
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/points/modifyPointsRuleStatus",
                type: "post",
                data: JSON.stringify({
                    "pointsRuleId": x.pointsRuleId,
                    "status": x.status == 0 ? "1" : "0" // 启用状态 0：禁用 1：启用
                }),
                success: function(data) {
                    if (data.status == '200') {
                        getRuleList(1);
                    }
                }
            })
        }

        function toSubmitHk(x) {
            $scope.rules = angular.copy(x);
            if (!$scope.rules.pointsRuleDetailList) {
                $scope.rules["pointsRuleDetailList"] = [{
                    pointsValue: 0
                }];
                if ($scope.rules.pointsItemId == 8 || $scope.rules.pointsItemId == 9) {
                    $scope.rules["pointsRuleDetailList"] = [{
                        limitValue: undefined,
                        pointsValue: 0
                    }];
                }
            }
            $scope.confirm_submitHk = confirm_submitHk; //确认提交作业
            $scope.addItem = addItem; //添加规则
            $scope.deleteItem = deleteItem; //删除规则
            openPopByDiv($scope.rules.pointsItem, '#submitHk', '560px');

            function confirm_submitHk() {
                var list = $scope.rules.pointsRuleDetailList;
                if (($scope.rules.pointsItemId == 10 || $scope.rules.pointsItemId == 11) && list.length > 1) {
                    if (isRepeat(list)) {
                        return layer.msg("两个等级不能设定同样的数值。");
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/points/modifySystemPointsRule",
                    type: "post",
                    data: JSON.stringify({
                        "pointsRuleId": $scope.rules.pointsRuleId,
                        "pointsRuleDetailList": $scope.rules.pointsRuleDetailList
                    }),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(dialog);
                            getRuleList(1);
                        }
                    }
                })
            }

            function isRepeat(arr) {
                var hash = {};
                for (var i in arr) {
                    if (hash[arr[i].pointsValue]) {
                        return true;
                    }
                    // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
                    hash[arr[i].pointsValue] = true;
                }
                return false;
            }

            function addItem(l) {
                if (l) {
                    l.push({ pointsValue: 0 });
                } else {

                }
            }

            function deleteItem(l, ind) {
                if (l) {
                    l.splice(ind, 1);
                }
            }
        }

        function setRule(type, x) {
            $scope.organType = type;
            $scope.confirm_organRule = confirm_organRule;
            if (type == "add") {
                $scope.ruleData = {
                    id: undefined,
                    type: "",
                    desc: "",
                };
            } else {
                $scope.ruleData = angular.copy(x);
            }
            openPopByDiv((type == "add" ? "新增" : "编辑") + '积分项', '#change_organRule', '560px');

            function confirm_organRule() {
                var url;
                var param = {
                    pointsItem: $scope.ruleData.pointsItem,
                    remark: $scope.ruleData.remark
                };
                if ($scope.organType == 'edit') {
                    param["pointsRuleId"] = $scope.ruleData.pointsRuleId;
                    url = "/api/oa/points/modifyPointsRule";
                } else {
                    url = "/api/oa/points/addPointsRule";
                }
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(dialog);
                            getRuleList(2);
                        }

                    }
                })
            }
        }

        function deleteRule(x) {
            detailMsk("确认删除该条积分项？", function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/points/deletePointsRule',
                    type: "post",
                    data: JSON.stringify({ pointsRuleId: x.pointsRuleId }),
                    success: function(data) {
                        if (data.status == '200') {
                            getRuleList(2);
                        }

                    }
                })
            })
        }
    }]
})