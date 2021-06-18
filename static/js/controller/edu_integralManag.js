define(["laydate", "mySelect", "jqFrom", "equipPop", "students_sel", 'potential_pop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_name, search_type, search_integralType = undefined;
        $scope.searchTime = "";
        init();

        function init() {
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、联系电话',
                userPhone: '联系电话',
            };
            $scope.integralThead = [{
                'name': '学员',
                'width': '20%'
            }, {
                'name': '联系电话',
                'width': '20%'
            }, {
                'name': '积分项',
                'width': '22%'
            }, {
                'name': '备注',
                'width': '28%'
            }, {
                'name': '积分值',
                'width': '15%'
            }, {
                'name': '时间',
                'width': '150'
            }, {
                'name': '经办人',
                'width': '15%'
            }, {
                'name': '操作',
                'width': '120',
                'align': 'center'
            }, ];
            getPointsItemList();
            $scope.operateIntegral = checkAuthMenuById("120");
            $scope.btn_apply = btn_apply; //按钮点击
            $scope.onReset = onReset;
            $scope.Enterkeyup = searchdata;
            $scope.SearchData = searchdata;
            $scope.changeType = changeType;
            // $scope.changePopNav = changePopNav;needdel__cz
            // $scope.toSubmitHk = toSubmitHk; //提交作业needdel__cz
            // $scope.setRule = setRule; //新增或编辑机构规则needdel__cz
            // $scope.deleteRule = deleteRule; //删除机构规则needdel__cz
            // $scope.changeBtn = changeBtn; //切换系统规则状态新增或编辑机构规则needdel__cz
            $scope.deleteBtn = deleteBtn; //首页列表删除数据
            $scope.gotoViewStudent = gotoViewStudent; //跳转学员详情
            $scope.closePopup = function() {
                layer.close(dialog);
            }
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getIntegralList(0);
                }
            });
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "积分变动") {
                    setTimeout(function () {
                        $scope.btn_apply(1);
                    })
                }
            }
            getIntegralList(0);
        }

        function gotoViewStudent(x) {
            if (checkAuthMenuById("29")) {
                window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', { 'page': 1, 'item': x, 'tab': 1 });
            } else {
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览学员权限。");
            }
        }

        function onReset() {
            search_name = search_type = search_integralType = undefined;
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            pagerRender = false;
            getIntegralList(0);
        }

        function searchdata(n) {
            search_name = n.value;
            search_type = n.type;
            pagerRender = false;
            getIntegralList(0);
        }

        function changeType(s) {
            search_integralType = s == null ? undefined : s.pointsItem;
            pagerRender = false;
            getIntegralList(0);
        }

        function btn_apply(type) {
            switch (type) { //积分变动
                case 1:
                    changeIntegral();
                    openPopByDiv('积分变动', '#change_integral', '660px');
                    break;
                    // case 2://规则设置needdel__cz
                    // ruleInit();
                    // openPopByDiv('规则设置', '#set_rule', '960px');
                    //     break;
                default:
                    break;
            }
        }

        function getPointsItemList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/points/pointsItemList',
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.pointsItemList = data.context;
                    }

                }
            })
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

        function changeIntegral() {
            getRuleList(2);
            $scope.ingData = {
                apt_students: [],
                pointsItem: undefined,
                remark: "",
                type: "1",
                pointsValue: "",
            };
            $scope.checkStudent = checkStudent;
            $scope.delStudent = delStudent;
            $scope.confirm_change = confirm_change; //积分变动
            $scope.add_integral = function() {
                $scope.ruleData = {
                    type: "",
                    desc: "",
                };
                openPopByDiv('新增积分项', '#change_organRule', '560px');
                $scope.confirm_organRule = function() {
                    var url;
                    var param = {
                        pointsItem: $scope.ruleData.pointsItem,
                        remark: $scope.ruleData.remark
                    };
                    url = "/api/oa/points/addPointsRule";
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

            function checkStudent() {
                window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds', '760px', { type: 'student', choseType: 'checkbox', sourcePage: '积分', callBackName: '积分变动-添加学员', });
            }

            function delStudent(x, ind) {
                $scope.ingData.apt_students.splice(ind, 1);
            }
            $scope.$on("积分变动-添加学员", function(evt, data) {
                angular.forEach(data, function(val) {
                    var judge = true;
                    angular.forEach($scope.ingData.apt_students, function(val_) {
                        if (val.potentialCustomerId == val_.potentialCustomerId) {
                            judge = false;
                        }
                    })
                    if (judge) {
                        $scope.ingData.apt_students.push(val);
                    }
                })

            });

            function confirm_change() {
                var param = {
                    "pointsItem": $scope.ingData.pointsItem, // 积分项
                    "remark": $scope.ingData.remark, // 备注
                    "pointsValue": $scope.ingData.type == 1 ? $scope.ingData.pointsValue : -$scope.ingData.pointsValue, // 分值，有正负
                    "potentialCustomerIds": getStudents() // 潜客id，多个英文逗号隔开
                }
                $.hello({
                    url: CONFIG.URL + '/api/oa/points/modifyPointsRecord',
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            getPointsItemList();
                            layer.close(dialog);
                            pagerRender = false;
                            getIntegralList(0);
                        }

                    }
                })
            }

            function getStudents() {
                var str = "";
                if ($scope.ingData.apt_students.length > 0) {
                    angular.forEach($scope.ingData.apt_students, function(v) {
                        str += v.potentialCustomerId + ",";
                    });
                }
                return str.substr(0, str.length - 1);
            }
        }
        // function ruleInit(){
        //       $scope.popNav = [{
        //         name: '系统规则',
        //         tab: 1
        //     }, {
        //         name: '机构规则',
        //         tab: 2
        //     }];
        //     changePopNav(1);
        // }
        // function changePopNav(val) {
        //     $scope.popNavSelected = val;
        //     getRuleList(val);
        // }

        // function changeBtn(x) {新增或编辑机构规则needdel__cz
        //     if (!$scope.operateIntegral) return;
        //     if (x.stauts == 0 && !x.pointsRuleDetailList) {
        //         layer.msg("没有设定具体的规则，不能启用。");
        //     }
        //     $.hello({
        //         url: CONFIG.URL + "/api/oa/points/modifyPointsRuleStatus",
        //         type: "post",
        //         data: JSON.stringify({
        //             "pointsRuleId": x.pointsRuleId,
        //             "status": x.status == 0 ? "1" : "0" // 启用状态 0：禁用 1：启用
        //         }),
        //         success: function(data) {
        //             if (data.status == '200') {
        //                 getRuleList(1);
        //             }
        //         }
        //     })
        // }

        // function toSubmitHk(x) {needdel__cz
        //     $scope.rules = angular.copy(x);
        //     if (!$scope.rules.pointsRuleDetailList) {
        //         $scope.rules["pointsRuleDetailList"] = [{
        //             pointsValue: 0
        //         }];
        //         if ($scope.rules.pointsItemId == 8 || $scope.rules.pointsItemId == 9) {
        //             $scope.rules["pointsRuleDetailList"] = [{
        //                 limitValue: undefined,
        //                 pointsValue: 0
        //             }];
        //         }
        //     }
        //     $scope.confirm_submitHk = confirm_submitHk; //确认提交作业
        //     $scope.addItem = addItem; //添加规则
        //     $scope.deleteItem = deleteItem; //删除规则
        //     openPopByDiv($scope.rules.pointsItem, '#submitHk', '560px');

        //     function confirm_submitHk() {
        //         var list = $scope.rules.pointsRuleDetailList;
        //         if (($scope.rules.pointsItemId == 10 || $scope.rules.pointsItemId == 11) && list.length > 1) {
        //             if (isRepeat(list)) {
        //                 return layer.msg("两个等级不能设定同样的数值。");
        //             }
        //         }
        //         $.hello({
        //             url: CONFIG.URL + "/api/oa/points/modifySystemPointsRule",
        //             type: "post",
        //             data: JSON.stringify({
        //                 "pointsRuleId": $scope.rules.pointsRuleId,
        //                 "pointsRuleDetailList": $scope.rules.pointsRuleDetailList
        //             }),
        //             success: function(data) {
        //                 if (data.status == '200') {
        //                     layer.close(dialog);
        //                     getRuleList(1);
        //                 }
        //             }
        //         })
        //     }

        //     function isRepeat(arr) {
        //         var hash = {};
        //         for (var i in arr) {
        //             if (hash[arr[i].pointsValue]) {
        //                 return true;
        //             }
        //             hash[arr[i].pointsValue] = true;
        //         }
        //         return false;
        //     }

        //     function addItem(l) {
        //         if (l) {
        //             l.push({ pointsValue: 0 });
        //         } else {

        //         }
        //     }

        //     function deleteItem(l, ind) {
        //         if (l) {
        //             l.splice(ind, 1);
        //         }
        //     }
        // }

        // function setRule(type, x) {needdel__cz
        //     $scope.organType = type;
        //     $scope.confirm_organRule = confirm_organRule;
        //     if (type == "add") {
        //         $scope.ruleData = {
        //             id: undefined,
        //             type: "",
        //             desc: "",
        //         };
        //     } else {
        //         $scope.ruleData = angular.copy(x);
        //     }
        //     openPopByDiv((type == "add" ? "新增" : "编辑") + '机构规则', '#change_organRule', '560px');

        //     function confirm_organRule() {
        //         var url;
        //         var param = {
        //             pointsItem: $scope.ruleData.pointsItem,
        //             remark: $scope.ruleData.remark
        //         };
        //         if ($scope.organType == 'edit') {
        //             param["pointsRuleId"] = $scope.ruleData.pointsRuleId;
        //             url = "/api/oa/points/modifyPointsRule";
        //         } else {
        //             url = "/api/oa/points/addPointsRule";
        //         }
        //         $.hello({
        //             url: CONFIG.URL + url,
        //             type: "post",
        //             data: JSON.stringify(param),
        //             success: function(data) {
        //                 if (data.status == '200') {
        //                     layer.close(dialog);
        //                     getRuleList(2);
        //                 }

        //             }
        //         })
        //     }
        // }
        //      function getRuleInfo(x){
        //          $scope.ruleData = angular.copy(x);
        //      }

        // function deleteRule(x) {needdel__cz
        //     detailMsk("确认删除该条积分项？", function() {
        //         $.hello({
        //             url: CONFIG.URL + '/api/oa/points/deletePointsRule',
        //             type: "post",
        //             data: JSON.stringify({ pointsRuleId: x.pointsRuleId }),
        //             success: function(data) {
        //                 if (data.status == '200') {
        //                     //                          layer.close(dialog);
        //                     getRuleList(2);
        //                 }

        //             }
        //         })
        //     })
        // }

        function getIntegralList(start) {
            var data = {
                "start": start.toString(),
                "count": eachPage,
                'searchType': search_name ? 'appSearchName' : undefined,
                "searchName": search_name,
                "pointsItem": search_integralType,
            }
            if ($scope.searchTime) {
                data["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                data["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + '/api/oa/points/listPointsRecord',
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.integrallist = data.context.items;
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
                    getIntegralList(start); //回调
                }
            });

        }

        function deleteBtn(x) {
            detailMsk("是否删除该条积分记录，删除后不可恢复？", function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/points/deletePointsRecord',
                    type: "post",
                    data: JSON.stringify({ pointsRecordId: x.pointsRecordId }),
                    success: function(data) {
                        if (data.status == '200') {
                            pagerRender = false;
                            getIntegralList(0);
                        }

                    }
                })
            })
        }

    }]
})