define(['laydate', 'pagination', "jqFrom", 'importPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name = undefined;
        $scope.waitConfirm = false;
        init();

        function init() {
            $scope.studNavJud = 1;
            $scope.selectInfoNameId = 'payrollRecordTitle'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                payrollRecordTitle: '标题名称',
            };
            //表头
            $scope.recordListThead = [{
                'name': '标题',
                'width': '20%'
            }, {
                'name': '发薪月份',
                'width': '20%'
            }, {
                'name': '员工数',
                'width': '20%'
            }, {
                'name': '结算日期',
                'width': '20%'
            }, {
                'name': '工资单确认状态',
                'width': '20%',
                'align': 'right'
            }, {
                'name': '操作',
                'align': 'center',
                'width': '150'
            }, ];
            $scope.operatePerformance = checkAuthMenuById("98"); //操作工资
            $scope.confirmPerformance = checkAuthMenuById("99"); //确认工资单
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.changeType = changeType;
            $scope.monthPayroll = monthPayroll; //月份工资单窗口
            $scope.editPayroll = editPayroll; //编辑工资单窗口
            // $scope.openSetPayroll = openSetPayroll; //工资模板设置窗口needdel__cz
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop; //关闭弹框
            $scope.onDropComplete = onDropComplete; //拖拽后执行的方法
            $scope.sendOrDeletePayroll = sendOrDeletePayroll; //发送或者删除工资单
            laydate.render({
                elem: '#searchTime', //指定元素
                type: 'month',
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    payrollRecordList(0);
                }
            });
            payrollRecordList(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        // 拖拽后执行的方法
        function onDropComplete(index, obj, evt) {
            if (evt.data.payrollHeadId) {
                //重新排序
                var idx = $scope.salaryTable.indexOf(obj);
                $scope.salaryTable.splice(idx, 1);
                $scope.salaryTable.splice(index, 0, obj);
            }
        };

        function closePop() {
            layer.close(dialog);
        }

        function switchStudNav(n) {
            if ($scope.studNavJud == n) return;
            $scope.studNavJud = n;
            switch (n) {
                case 1:
                    $state.go("payroll", {});
                    break;
                case 2:
                    $state.go("performance/setting", {});
                    break;
                case 3:
                    $state.go("performance/rule", {});
                    break;
                default:
                    break;
            }
        }

        function searchdata(d) {
            pagerRender = false;
            search_type = d ? d.type : null;
            search_name = d ? d.value : null;
            payrollRecordList(0);
        }

        function changeType() {
            pagerRender = false;
            payrollRecordList(0);
        }

        function onReset() {
            search_type = search_name = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            $scope.waitConfirm = false;
            pagerRender = false;
            payrollRecordList(0);
        }
        $scope.$on('reloadPayroll', function() {
            pagerRender = false;
            payrollRecordList(0);
        })

        function payrollRecordList(start_) { //获取请假补课列表信息
            start = start_ == 0 ? "0" : start_;
            var param = {
                "start": start_.toString(),
                "count": eachPage,
                'searchType': search_type,
                "searchName": search_name,
                "payrollStatus": $scope.waitConfirm ? "0" : undefined
            }
            if ($scope.searchTime) {
                param["beginTime"] = $scope.searchTime.split(" 到 ")[0] + "-01 00:00:00";
                param["endTime"] = $scope.searchTime.split(" 到 ")[1] + "-01 23:59:59";
            }
            console.log(param);
            $.hello({
                url: CONFIG.URL + "/api/oa/payroll/payrollRecordList",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.recordList = data.context.items;
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
            var $M_box3 = $('.M-box3.pageList');

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
                    payrollRecordList(start); //回调
                }
            });

        }
        //月份工资单
        var detail, s_pagerRender, s_start, s_eachPage, s_search_type, s_search_name, orderTyp, orderName;

        function monthPayroll(x) {
            $scope.payRecordDetailHead = [];
            detail = angular.copy(x);
            s_pagerRender = false,
                s_start = 0,
                s_eachPage = localStorage.getItem("s_state") ? localStorage.getItem("s_state") : 10;
            s_search_type = s_search_name = undefined;
            $scope.s_selectInfoNameId = 'teacherName'; //select初始值
            //搜索类型
            $scope.s_kindSearchData = {
                teacherName: '姓名',
            };
            $scope.s_SearchData = s_searchdata;
            $scope.s_Enterkeyup = s_searchdata;
            $scope.sortCllict0 = sortCllict0;
            $scope.addTrcolor = addTrcolor;

            payrollRecordDetailHead();
            payrollRecordDetailList(0);

            function addTrcolor(e) {
                var $this = $(e.target);
                $this.closest("tr").addClass("active").siblings("tr").removeClass("active");
            }

            function sortCllict0(data) {
                orderTyp = data.sort;
                orderName = data.id;
                s_pagerRender = false;
                payrollRecordDetailList(0);
            }

            function s_searchdata(d) {
                s_search_type = d ? d.type : null;
                s_search_name = d ? d.value : null;
                s_pagerRender = false;
                payrollRecordDetailList(0);
            }

            function payrollRecordDetailHead() {
                var param = {
                    "payrollRecordId": detail.payrollRecordId,
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/payrollRecordDetailHead",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.arrHead = [];
                            var arr = [];
                            angular.forEach(data.context, function(v) {
                                for (var x in v) {
                                    $scope.arrHead.push(x);
                                    $scope.payRecordDetailHead.push({
                                        'name': x,
                                        'width': "100px",
                                        'issort': true,
                                        'id': v[x]
                                    });
                                }
                            });
                            $scope.payRecordDetailHead.unshift({ name: "姓名" });
                            $scope.payRecordDetailHead.push({ name: "操作", align: "center", width: "180px" });
                            $timeout(function() {
                                $scope.reTheadData_["pop_head"]();
                            }, 100);
                            if ($scope.arrHead.length > 4) {
                                openPopByDiv(detail.payrollRecordTitle + '工资', '.payrollInfo', 'calc(100% - 300px)');
                            } else {
                                openPopByDiv(detail.payrollRecordTitle + '工资', '.payrollInfo', '760px');
                            }
                        }

                    }
                })
            }

        }

        function payrollRecordDetailList(start) {
            var param = {
                "start": start.toString(),
                "count": s_eachPage,
                'searchType': s_search_type,
                "searchName": s_search_name,
                "payrollRecordId": detail.payrollRecordId,
                'orderTyp': orderTyp,
                'orderName': orderName,
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/payroll/payrollRecordDetailList",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.payRecordDetaillist = data.context.payrollRecordDetailPage.items;
                        $scope.payrollRecord = data.context.payrollRecord;
                        s_leavePager(data.context.payrollRecordDetailPage.totalNum);
                    }

                }
            })
        }

        function s_leavePager(total) { //分页
            if (s_pagerRender) {
                return;
            } else {
                s_pagerRender = true;
            }
            var $M_box3 = $('.M-box3.payrollDetail');

            $M_box3.pagination({
                totalData: total || 0, // 数据总条数
                showData: s_eachPage, // 显示几条数据
                isShowData: false, // 显示几条数据
                jump: true,
                coping: true,
                count: 2, // 当前页前后分页个数
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页',
                callback: function(api) {
                    if (api.getCurrentEach() != s_eachPage) { //本地存储记下每页多少条
                        s_eachPage = api.getCurrentEach();
                        localStorage.setItem("s_state", s_eachPage);
                    }
                    s_start = (api.getCurrent() - 1) * s_eachPage; // 分页从0开始
                    payrollRecordDetailList(s_start); //回调
                }
            });
        }

        function sendOrDeletePayroll(type, x) {
            detail = angular.copy(x);
            var msg, url, param;
            switch (type) {
                case 'send':
                    msg = '是否发送工资单？';
                    url = "/api/oa/payroll/confirmPayrollRecord";
                    param = {
                        payrollRecordDetailId: x.payrollRecordDetailId
                    };
                    break;
                case 'deleteWorkers':
                    msg = '是否删除工资单详情员工，删除后不可恢复';
                    url = "/api/oa/payroll/deletePayrollRecordDetail";
                    param = {
                        payrollRecordDetailId: x.payrollRecordDetailId
                    };
                    break;
                case 'confirm':
                    msg = '请确认工资单是否准确，确认后系统将自动发送工资单';
                    url = "/api/oa/payroll/confirmPayrollRecord";
                    param = {
                        payrollRecordId: detail.payrollRecordId
                    };
                    break;
                case 'deletePayroll':
                    msg = '是否删除工资单，删除后不可恢复';
                    url = "/api/oa/payroll/deletePayrollRecord";
                    param = { payrollRecordId: x.payrollRecordId };
                    break;
                default:
                    break;
            }
            var isDelect = layer.confirm(msg, {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(res) {
                        if (res.status == 200) {
                            layer.close(isDelect);
                            pagerRender = false;
                            payrollRecordList(0);
                            s_pagerRender = false;
                            payrollRecordDetailList(0);
                            layer.msg('操作成功', { icon: 1 });
                        }
                    }
                });

            }, function() {
                layer.close(isDelect);
            })
        }
        //编辑工资单
        function editPayroll(x) {
            $scope.expenseDetail = angular.copy(x);
            $timeout(function() {
                laydate.render({
                    elem: '#payrollMonth',
                    type: 'month',
                    value: yznDateFormatYM($scope.expenseDetail.payrollMonth),
                    btns: ['confirm'],
                    done: function(value) {
                        $scope.expenseDetail.payrollMonth = value;
                    }
                });
                laydate.render({
                    elem: '#payrollDate',
                    value: yznDateFormatYMd($scope.expenseDetail.payrollDate),
                    done: function(value) {
                        $scope.expenseDetail.payrollDate = value;
                    }
                });
            }, 100);
            $scope.payrollEdit_confirm = payrollEdit_confirm; //编辑工资单
            openPopByDiv('工资单', '.payroll_pop', '660px');

            function payrollEdit_confirm() {
                var param = {
                    payrollRecordId: $scope.expenseDetail.payrollRecordId,
                    payrollRecordTitle: $scope.expenseDetail.payrollRecordTitle,
                    payrollMonth: $scope.expenseDetail.payrollMonth + "-01",
                    payrollDate: $scope.expenseDetail.payrollDate,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/payroll/updatePayrollRecord",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(res) {
                        if (res.status == 200) {
                            closePop();
                            payrollRecordList(start);
                        }
                    }
                });
            }
        }
        //工资模板设置
        // function openSetPayroll() {needdel__cz
        //     var modelDialog;
        //     getSalaryTable();
        //     $scope.addModel = addModel; //新增工资表头
        //     $scope.deleteModel = deleteModel; //删除工资表头
        //     $scope.closeSalaryPop = closeSalaryPop; //新增工资表头
        //     $scope.addSalary_confirm = addSalary_confirm; //新增工资表头确认
        //     $scope.orderConfirm = orderConfirm; //工资表头排序
        //     openPopByDiv('工资模板设置', '.salaryModel', '760px');

        //     function getSalaryTable() {
        //         $.hello({
        //             url: CONFIG.URL + "/api/oa/payroll/payrollHead/list",
        //             type: "get",
        //             success: function(res) {
        //                 if (res.status == 200) {
        //                     $scope.salaryTable = res.context;
        //                 }
        //             }
        //         });
        //     }

        //     function closeSalaryPop() {
        //         layer.close(modelDialog);
        //     }

        //     function addModel(type, x) {
        //         $scope.headType = type;
        //         if (type == 'add') {
        //             $scope.salaryHead = {
        //                 payrollHeadName: "",
        //                 payrollHeadId: undefined
        //             }
        //         } else {
        //             $scope.salaryHead = angular.copy(x);
        //         }
        //         modelDialog = layer.open({
        //             type: 1,
        //             title: (type == 'add' ? "新增" : "修改") + "工资表头",
        //             skin: 'layerui', //样式类名
        //             closeBtn: 1, //不显示关闭按钮
        //             move: false,
        //             resize: false,
        //             anim: 0,
        //             area: '560px',
        //             offset: '30px',
        //             shadeClose: false, //开启遮罩关闭
        //             content: $(".addSalary"),
        //         });
        //     }

        //     function addSalary_confirm() {
        //         var url;
        //         var param = {
        //             payrollHeadName: $scope.salaryHead.payrollHeadName
        //         }
        //         if ($scope.headType == 'add') {
        //             url = "add";
        //         } else {
        //             url = "update";
        //             param["payrollHeadId"] = $scope.salaryHead.payrollHeadId;
        //         }
        //         $.hello({
        //             url: CONFIG.URL + "/api/oa/payroll/payrollHead/" + url,
        //             type: "post",
        //             data: JSON.stringify(param),
        //             success: function(res) {
        //                 if (res.status == 200) {
        //                     closeSalaryPop();
        //                     getSalaryTable();
        //                 }
        //             }
        //         });
        //     }

        //     function deleteModel(x) {
        //         var isDelect = layer.confirm('是否删除工资单表头，删除后不可恢复', {
        //             title: "确认信息",
        //             skin: 'newlayerui layeruiCenter',
        //             closeBtn: 1,
        //             offset: '30px',
        //             move: false,
        //             area: '560px',
        //             btn: ['是', '否'] //按钮
        //         }, function() {
        //             $.hello({
        //                 url: CONFIG.URL + "/api/oa/payroll/payrollHead/delete",
        //                 type: "post",
        //                 data: JSON.stringify({
        //                     payrollHeadId: x.payrollHeadId
        //                 }),
        //                 success: function(res) {
        //                     if (res.status == 200) {
        //                         layer.close(isDelect);
        //                         getSalaryTable();
        //                     }
        //                 }
        //             });

        //         }, function() {
        //             layer.close(isDelect);
        //         })
        //     }

        //     function orderConfirm() {
        //         var arr = [];
        //         angular.forEach($scope.salaryTable, function(v, ind) {
        //             arr.push({
        //                 payrollHeadId: v.payrollHeadId,
        //                 payrollHeadOrd: ind + 1
        //             });
        //         });
        //         var param = {
        //             payrollHeads: arr,
        //         };
        //         $.hello({
        //             url: CONFIG.URL + "/api/oa/payroll/updatePayrollHeadOrd",
        //             type: "post",
        //             data: JSON.stringify(param),
        //             success: function(res) {
        //                 if (res.status == 200) {
        //                     closePop();
        //                 }
        //             }
        //         });
        //     }

        // }
    }]
})