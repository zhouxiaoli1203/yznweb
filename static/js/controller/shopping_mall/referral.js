define(['laydate', 'courseAndClass_sel', 'mySelect', "potential_pop","remarkPop", ], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        $scope.waitingFlag = undefined;
        var search_name = undefined;
        init();

        function init() {
            $scope.classNavJud = 1;
            $scope.kindSearchData = {
                studentName: '推荐人姓名、联系方式',
            };
            $scope.selectInfoNameId = "studentName";
            $scope.nameListThead = [
                { name: "推荐人姓名", width: "20%" },
                { name: "联系方式", width: "16%" },
                { name: "关联学员", width: "30%" },
                { name: "有效邀请/人", width: "16%", align: "right" },
                { name: "推荐报课/人", width: "16%", align: "right" },
                { name: "推荐奖励待发放/人次", width: "16%", align: "right" },
                { name: "操作", width: "16%", align: "center" },
            ];
            $scope.paramsHead = [
                { name: "优惠券名称", width: "20%" },
                { name: "优惠/折扣", width: "20%" },
                { name: "有效期", width: "25%" },
                { name: "发放数量", width: "20%" },
                { name: "操作", width: "15%", align: "center" },
            ];
            $scope.payTypeObj = [
                { val: 0, name: '支付宝' },
                { val: 1, name: '微信' },
                { val: 2, name: '现金' },
                { val: 3, name: '网银转账' },
                { val: 4, name: 'POS机刷卡' },
            ];
            $scope.changeType = changeType;
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.onReset = onReset;
            $scope.switchClassNav = switchClassNav;
            $scope.operatePop = operatePop; //操作弹框
            $scope.addParams = addParams; //添加现金奖励和赠送礼品
            $scope.extend_operateDelete = extend_operateDelete;
            $scope.selTimeFrame = selTimeFrame; //选择时间
            $scope.selectStock_out = selectStock_out; //选择库存物品
            $scope.confirm_extend = confirm_extend;
            $scope.checkboxAll = checkboxAllFun;
            $scope.sel_singleFun = checkSingleFun;
            $scope.delStudent = delStudent;
            $scope.editRemark = editRemark;
            $scope.closePop = function() {
                layer.close(dialog);
            }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            getlistReferralData(0);
        }

        function switchClassNav(n) {
            $scope.classNavJud = n;
            switch (n) {
                case 1:
                    $state.go("referral");
                    break;
                case 2:
                    $state.go("referral_record");
                    break;
                default:
                    break;
            }
        }

        function searchdata(d) {
            pagerRender = false;
            search_name = d ? d.value : null;
            getlistReferralData(0);
        }

        function changeType(evt, val) {
            $scope.waitingFlag = evt.target.checked ? val : undefined;
            pagerRender = false;
            getlistReferralData(0);
        }

        function onReset() {
            search_name = undefined;
            $scope.waitingFlag = undefined;
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false;
            getlistReferralData(0);
        }

        function getlistReferralData(start_) {
            var params = {
                start: start_ || "0",
                count: eachPage,
                searchType: search_name ? "appSearchName" : undefined,
                searchName: search_name,
                waitingFlag: $scope.waitingFlag,
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/referral/listReferralData",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.referralList = data.context.items;
                        leavePager(data.context.totalNum);
                    };
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
                    getlistReferralData(start); //回调
                }
            });

        }

        function operatePop(x, t) {
            if (t != 5) {
                $scope.referralInfo = angular.copy(x);
            }
            switch (t) {
                case 1:
                    getlistSendRecord(x);
                    var msg = '<var class="color_nameState">（' + x.studentName + '）</var>';
                    openPopByDiv("发放记录" + (x.studentName ? msg : ""), ".recordDetial_pop", "760px");
                    break;
                case 2:
                    var msg = '<var class="color_nameState">（' + x.studentName + '）</var>';
                    openPopByDiv("发放奖励" + (x.studentName ? msg : ""), ".extendPop", "760px");
                    extendInit(x);
                    break;
                case 3:
                    var param = {
                        referralDataId: x.referralDataId,
                        type: "1"
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/referral/listEffectiveInviter",
                        type: "get",
                        data: param,
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.youxiaoList = res.context;
                            };
                        }
                    });
                    var msg = '<var class="color_nameState">（' + x.studentName + '）</var>';
                    openPopByDiv("有效邀请" + (x.studentName ? msg : ""), ".validInvit", "760px");
                    break;
                case 4:
                    var param = {
                        referralDataId: x.referralDataId,
                        signed: 1,
                        type: "2"
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/referral/listEffectiveInviter",
                        type: "get",
                        data: param,
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.tuijianList = res.context;
                            };
                        }
                    })
                    var msg = '<var class="color_nameState">（' + x.studentName + '）</var>';
                    openPopByDiv("推荐报课" + (x.studentName ? msg : ""), ".referralSignup", "760px");
                    break;
                case 5:
                    detailMsk("确定撤销该发放记录吗？", function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/referral/undoSend",
                            type: "post",
                            data: JSON.stringify({ sendRecordId: x.sendRecordId }),
                            success: function(res) {
                                if (res.status == '200') {
                                    getlistSendRecord($scope.referralInfo);
                                    pagerRender = false;
                                    getlistReferralData(0);
                                };
                            }
                        })
                    });
                    break;
                default:
                    break;
            }
        }

        function getlistSendRecord(x) {
            var param = {
                referralDataId: x.referralDataId,
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/referral/listSendRecord",
                type: "get",
                data: param,
                success: function(res) {
                    if (res.status == '200') {
                        var list = res.context;
                        angular.forEach(list, function(v) {
                            if (v.shopCostRecord) {
                                v.shopCostRecord.payType = $scope.payTypeObj[v.shopCostRecord.payType].name;
                            }
                        });
                        $scope.extendRecord = res.context;
                    };
                }
            });
        }

        function extendInit(x) {
            $scope.sel_all = false;
            $scope.extend = {
                reference:x.potentialCustomerList&&x.potentialCustomerList.length>0?x.potentialCustomerList[0]:undefined,
                students: [],
                cancellation: 0,
                params1: [],
                params2: [],
                params3: [],
                params4: [],
                remark: ""
            };
            $scope.params_data = [];
            $scope.feeTypeList = [
                { name: "课时", id: "0" },
                { name: "按期", id: "1" },
                { name: "按月", id: "2" },
            ];
            $scope.thisYears = getSomeYears(); //获取今年年份
            $scope.clickPayTypeIcon = function(x, d) { //点击支付方式
                x['paymentMode'] = d;
            };
            getlistSigned(); //取未核销的推荐报课记录
            getSchoolTermList(); //获取学期列表
            getHandlerList(); //获取经办人列表
            getGoods(); //获取库存物品列表
        }
        $scope.$on("添加学员", function (evt, data) {
            console.log(data);
            $scope.extend.reference = data;
        });
        function delStudent(x, ind) {
            $scope.extend.reference = undefined;
        }
        function getlistSigned() {
            var param = {
                referralDataId: $scope.referralInfo.referralDataId,
                signed: 1,
                issuedReward: 0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/referral/listSigned",
                type: "get",
                data: param,
                success: function(res) {
                    if (res.status == '200') {
                        var list = res.context.items;
                        if (list && list.length > 0) {
                            $scope.sel_all = true;
                            angular.forEach(list, function(v) {
                                v.hasChecked = true;
                            });
                        }
                        $scope.extend.students = list;
                        $scope.params_data = angular.copy(list);
                    };
                }
            })
        }
        //获取学期列表
        function getSchoolTermList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                type: "get",
                data: {
                    'pageType': 0,
                },
                success: function(res) {
                    if (res.status == '200') {
                        $scope.schoolTermList = res.context;
                    };
                }
            })
        }

        function getHandlerList() {
            $.hello({ //经办人 /api/oa/order/getHandlerList
                url: CONFIG.URL + "/api/oa/order/getHandlerList",
                type: "get",
                success: function(data) {
                    if (data.status == 200) {
                        $scope.handlerList = data.context;
                    }
                }
            });
        }

        function getGoods() {
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/list",
                type: "get",
                data: { pageType: "0", goodsStatus: "1", goodsType: "1" },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.goodslist = data.context;
                    }

                }
            })
        }


        function extend_operateDelete(list, ind, key) {
            // detailMsk("确定要删除吗？", function() {
            list.splice(ind, 1);
            if (key) {
                list.map(function(item) {
                    if (item.goodsId) {
                        $scope.$broadcast(key + item.mixid, 'clearHeadName', item.goodsName);
                    }
                    if (item.goodsSpecId) {
                        $scope.$broadcast(key + item.mixid + '_', 'clearHeadName', item.goodsSpecName);
                    }
                })
            }
            // });
        }
        if (!$scope.extendEmit1) {
            $scope.extendEmit1 = $scope.$on("发放奖励-添加优惠券", function(evt, data) {
                angular.forEach(data, function(val) {
                    val.num = 1;
                    var judge = true;
                    angular.forEach($scope.extend["params1"], function(val_) {
                        if (val.couponId == val_.couponId) {
                            judge = false;
                        }
                    })
                    if (judge) {
                        $scope.extend["params1"].push(val);
                    }
                })
            });
        }
        if (!$scope.extendEmit2) {
            $scope.extendEmit2 = $scope.$on("发放奖励-课程", function(evt, data) {
                angular.forEach(data, function(val) {
                    val.num = 1;
                    val.feeType = "0";
                    $scope.extend["params2"].push(val);
                })
            });
        }

        function addParams(list, type) {
            switch (type) {
                case 3:
                    if (list.length >= 1) {
                        return;
                    }
                    var o = {
                        paymentMode: "0",
                        paymentMoney: "",
                        extend_time: yznDateFormatYMdHm(new Date()),
                        handleId: localStorage.getItem('shopTeacherId')
                    };
                    list.push(o);
                    break;
                case 4:
                    var b = {
                        goodsId: undefined,
                        mixid: GenNonDuplicateID(5),
                        num: "",
                        goodsSpecList: [],
                        goodsSpecId: undefined,
                        goodsSpecName: "",
                    };
                    list.push(b);
                    break;
                default:
                    break;
            }
        }

        function selTimeFrame(d, evt, type) {
            //加载时间范围选择控件
            laydate.render({
                elem: evt.target, //指定元素
                //                      range: "/",
                isRange: false,
                format: 'yyyy-MM-dd HH:mm',
                done: function(value, value2) {
                    d.extend_time = value;
                }
            });
        }

        function selectStock_out(n, item) {
            if (!n) {
                item.goodsId = undefined;
                item.goodsSpecId = undefined;
                item.oldNum = "";
            } else {
                item.goodsId = n.goodsId;
                item.goodsName = n.goodsName;
                getSpec(n.goodsId, function(data) {
                    item.goodsSpecList = data;
                    if (data && data.length > 0) {
                        $scope.$broadcast('_outStock' + item.mixid + '_', 'clearHeadName', data[0].name);
                        item.goodsSpecId = data[0].goodsSpecId;
                        item.goodsSpecName = data[0].name;
                        item.oldNum = data[0].stockNum;
                    } else {
                        $scope.$broadcast('_outStock' + item.mixid + '_', 'clearHeadName', '请选择物品规格'); //重置标签名
                        item.oldNum = n.stockNum;
                    }
                });
            }
        }
        // 选择规格
        $scope.specClickout = function(n, item) {
            item.goodsSpecId = n.goodsSpecId;
            item.goodsSpecName = n.name;
            if (n) {
                item.oldNum = n.stockNum;
                item.old_unclaimedNum = n.unclaimedNum;
            }
        }

        function getSpec(id, fn) {
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/goodsSpec/list",
                type: "get",
                data: { goodsId: id, needUnclaimedNum: "1" },
                success: function(data) {
                    if (data.status == '200') {
                        fn(data.context)
                    }

                }
            })
        }

        function confirm_extend() {
            var params = {};
            if ($scope.params_data.length <= 0) {
                return layer.msg("请选择被推荐学员");
            }
            if ($scope.extend.cancellation == 0) {
                if ($scope.extend.params1.length <= 0 && $scope.extend.params2.length <= 0 && $scope.extend.params3.length <= 0 && $scope.extend.params4.length <= 0) {
                    return layer.msg("至少选择一个奖励");
                }
                if (($scope.extend.params1.length > 0 || $scope.extend.params2.length > 0) && !$scope.extend.reference) {
                    return layer.msg("请选择奖励学员");
                }
                params["content"] = {};
                if ($scope.extend.params1.length > 0) {
                    params["content"]["coupon"] = {
                        couponList: getArr($scope.extend.params1, 1)
                    };
                }
                if ($scope.extend.params2.length > 0) {
                    params["content"]["studentOrder"] = {
                        orderCourseList: getArr($scope.extend.params2, 2)
                    };
                }
                if ($scope.extend.params3.length > 0) {
                    params["content"]["shopCostRecord"] = {
                        handleId: $scope.extend.params3[0].handleId,
                        payType: $scope.extend.params3[0].paymentMode,
                        shopCostRecordDate: $scope.extend.params3[0].extend_time,
                        shopCostRecordPrice: $scope.extend.params3[0].paymentMoney,
                    };
                }
                if ($scope.extend.params4.length > 0) {
                    params["content"]["stockRecord"] = {
                        stockRecordGoodsList: getArr($scope.extend.params4, 4)
                    };
                    var tip = { text: '', flag: false };
                    params["content"]["stockRecord"]['stockRecordGoodsList'].map(function(item, index) {
                        if (!item.goodsId && !tip.flag) {
                            tip.text = '第' + (index + 1) + '项未选物品！';
                            tip.flag = true;
                        }
                        if (!item.goodsSpecId && !tip.flag) {
                            tip.text = '第' + (index + 1) + '项未选规格！';
                            tip.flag = true;
                        }
                    })
                    if (tip.flag) return layer.msg(tip.text);
                }
                params["content"] = JSON.stringify(params["content"]);
            } else {
                params = {
                    remark: $scope.extend.remark
                };
            }
            params["potentialCustomerId"] = $scope.extend.reference ? $scope.extend.reference.potentialCustomerId : undefined;
            params["referralDataId"] = $scope.referralInfo.referralDataId;
            params["cancellation"] = $scope.extend.cancellation;
            params["potentialCustomerIds"] = getArrIds($scope.params_data, "potentialCustomerId");
            console.log(params);
            $.hello({
                url: CONFIG.URL + "/api/oa/referral/issuedReward",
                type: "post",
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == '200') {
                        $scope.closePop();
                        pagerRender = false;
                        getlistReferralData(0);
                    }

                }
            })
        }

        function getArr(list, type) {
            var arr = [];
            if (list && list.length > 0) {
                switch (type) {
                    case 1:
                        angular.forEach(list, function(v) {
                            arr.push({
                                couponId: v.couponId,
                                sendNumber: v.num
                            });
                        });
                        break;
                    case 2:
                        angular.forEach(list, function(v) {
                            var o = {};
                            if (v.feeType == 0) {
                                o = {
                                    courseId: v.courseId,
                                    feeType: v.feeType,
                                    giveTime: v.num,
                                };
                            } else if (v.feeType == 1) {
                                o = {
                                    courseId: v.courseId,
                                    feeType: v.feeType,
                                    giveTime: v.num,
                                    schoolYear: v.schoolYear,
                                    schoolTermId: v.schoolTermId,
                                };
                            } else if (v.feeType == 2) {
                                o = {
                                    courseId: v.courseId,
                                    feeType: v.feeType,
                                    buyTime: v.num,
                                };
                            }
                            arr.push(o);
                        });
                        break;
                    case 4:
                        angular.forEach(list, function(v) {
                            arr.push({
                                goodsId: v.goodsId,
                                num: v.num,
                                goodsSpecId: v.goodsSpecId
                            });
                        });
                        break;
                    default:
                        break;
                }
            }
            return arr;
        }
        //以下是编辑推荐人
        function editRemark(x) {
            if (!x.value) {
                return layer.msg("请输入推荐人姓名");
            }
            var params = {
                "referralDataId": x.id,// 推荐人ID
	            "studentName":x.value,// 推挤人姓名
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/referral/modifyName',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        getlistReferralData(start);
                        $(".edit_remark").removeClass("open");
                    }
                }
            });

        }

    }]
})