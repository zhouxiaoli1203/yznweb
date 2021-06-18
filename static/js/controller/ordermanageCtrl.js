define(["laydate", "pagination", "jqFrom", "mySelect", "remarkPop", "datePicker", "orderInfo", "potential_pop", "customPop", ], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$timeout', '$compile', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout, $compile) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchType, searchName, searchOrderType, adviserId, handlerId, confirmorId, source, arrearOrder, repealedOrder, confirmStatus, enconfirmStatus;
        $scope.searchTime = "";
        $scope.arrear_order = $scope.repealed_order = $scope.unConfirm_order = $scope.enConfirm_order = $scope.abolish = false;
        $scope.orderList = "";
        $scope.income = $scope.loss = false;
        $scope.tableElemt;
        $scope.select_params = []; //已选勾选数据
        $scope.sel_all = false;
        var search_orderName = "externalOrderId",
            search_orderTyp = "desc";
        //      类型、应收、实收、欠费、手续费、对内备注、来源、顾问、订单时间、经办人。
        var heads = [
            { name: "全选", checked: true, fixed: "1" },
            { name: "订单号", checked: true, fixed: "2" },
            { name: "学员姓名", checked: true, fixed: "3" },
            { name: "类型", checked: true },
            { name: "合计", checked: false },
            { name: "学员账户", checked: false },
            { name: "应收", checked: true },
            { name: "实收", checked: true },
            { name: "欠费", checked: true },
            { name: "手续费", checked: true },
            { name: "对内备注", checked: true },
            { name: "对外备注", checked: false },
            { name: "来源", checked: true },
            { name: "顾问", checked: true },
            { name: "订单时间", checked: true },
            { name: "经办人", checked: true },
            { name: "确认人", checked: true },
            { name: "操作", checked: true, fixed: "-1" },
        ];
        init();

        function init() {
            if ($rootScope.fromOrgn) {
                $scope.checkedHead = heads;
            } else {
                getCustomTag();
            }
            getAdviserName(); //顾问
            getHandlelist(); //经办人
            //          订单号、学员姓名、类型、合计、学员账户、应收、实收、欠费、手续费、对内备注、对外备注、来源、顾问、订单时间、经办人、操作。
            $scope.orderListThead = [{
                'name': '',
                'width': '50',
                fixed: '1',
                td: `<td></td>`
            }, {
                'name': '',
                'width': '130',
                'issort': true,
                'sort': 'desc',
                fixed: '2',
                td: `<td></td>`
            }, {
                'name': '',
                'width': '100',
                fixed: '3',
                td: `<td></td>`
            }, {
                'name': '类型',
                'width': '50',
                td: `<td>{{x.type}}</td>`
            }, {
                'name': '合计',
                'align': 'right',
                'width': '110',
                td: `<td class="textAlignRt">￥{{x.totalAmount|number:2}}</td>`
            }, {
                'name': '学员账户',
                'align': 'right',
                'width': '95',
                td: `<td class="textAlignRt">{{x.accountAmount>0?"-":x.accountAmount<0?"+":""}}￥{{x.accountAmount|abs|number:2}}</td>`
            }, {
                'name': '应收',
                'align': 'right',
                'width': '95',
                td: `<td class="textAlignRt">￥{{x.receivable}}</td>`
            }, {
                'name': '实收',
                'align': 'right',
                'width': '95',
                td: `<td class="textAlignRt">￥{{x.received}}</td>`
            }, {
                'name': '欠费',
                'align': 'right',
                'width': '95',
                td: `<td class="textAlignRt">
                            <span  ng-class='{"main_color":x.arrearage>0}'>￥{{x.arrearage}}</span>
                        </td>`
            }, {
                'name': '手续费',
                'align': 'right',
                'width': '95',
                td: `<td class="textAlignRt">
                            <span>￥{{x.serviceChange?(x.serviceChange|number:2):"0.00"}}</span>
                        </td>`
            }, {
                'name': '对内备注',
                'width': '240',
                td: `<td class="remarks overflow-normal">
                            <remark-view view-data="{{x.remark}}"></remark-view>
                        </td>`
            }, {
                'name': '对外备注',
                'width': '240',
                td: `<td class="remarks overflow-normal">
                            <remark-view view-data="{{x.externalRemark}}"></remark-view>
                        </td>`
            }, {
                'name': '来源',
                'width': '60',
                td: `<td>{{x.dataSource == "1"?"商城购课":x.dataSource == "2"?"线下报名":x.dataSource == "3"?"订单推送":x.dataSource == "4"?"易知独秀":""}}</td>`
            }, {
                'name': '顾问',
                'width': '100',
                td: `<td title="{{x.counselor}}">{{x.counselor}}</td>`
            }, {
                'name': '订单时间',
                'width': '120',
                'issort': true,
                'id': 'orderTime',
                td: `<td>{{x.orderTime | yznDate:'yyyy-MM-dd HH:mm'}}</td>`
            }, {
                'name': '经办人',
                'width': '90',
                td: `<td>{{x.teacherInfo.teacherName}}</td>`
            }, {
                'name': '确认人',
                'width': '90',
                td: `<td>{{x.confirmor}}</td>`
            }, {
                'name': '',
                'align': 'center',
                'width': '120',
                fixed: "-1",
                td: `<td></td>`
            }];
            $scope.fixedThead_left = [
                { 'name': 'checkbox', 'width': '50' },
                { 'name': '订单号', 'width': '120', 'issort': true, 'sort': 'desc', 'id': 'externalOrderId' },
                { 'name': '姓名', 'width': '100' }
            ];
            $scope.completeCourseThead = [{
                'name': '订单号',
                'width': '20%',
            }, {
                'name': '订单时间',
                'width': '20%',
            }, {
                'name': '学员',
                'width': '20%',
            }, {
                'name': '结算金额',
                'width': '20%',
                'align': 'center',
                'paddingRight': '30px'
            }, {
                'name': '经办人',
            }];
            $scope.kindSearchData = {
                studentName: '学员、经办人、订单号',
                teacherName: '经办人',
                orderId: '订单号'

            };
            $scope.selectInfoNameId = "studentName";
            var arrs = {
                1: "报名",
                //              2:"续签",
                3: "转课",
                5: "退课",
                6: "充值",
                7: "退款",
                11: "退学杂",
                12:"转校",
            };
            $scope.screen_source = [
                { name: "商城购课", id: "1" },
                { name: "线下报名", id: "2" },
                { name: "订单推送", id: "3" },
                { name: "易知独秀", id: "4" },
            ];

            $scope.isConfirmOrder = checkAuthMenuById("56"); //操作订单
            $scope.orderTypeList = getConstantList(arrs,[1,3,12,5,6,7,11]);
            $scope.onReset = onReset; //重置
            $scope.arrearageStatus = arrearageStatus; //订单欠费状态筛选
            $scope.unConfirm = unConfirm; //订单未确认筛选
            $scope.enConfirm = enConfirm; //订单已确认筛选
            $scope.incomeorloss = incomeorloss; //盈收还是亏损
            $scope.abolishOrder = abolishOrder; //废除
            //          $scope.toConfirm=toConfirm;//订单已确认筛选
            //          $scope.changeOrderStatus=changeOrderStatus;//订单状态筛选
            $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
            $scope.SearchData = SearchData; //按钮搜索
            $scope.searchByType = searchByType;
            $scope.searchByAdviser = searchByAdviser;
            $scope.searchByConfirm = searchByConfirm;
            $scope.searchByHandle = searchByHandle;
            $scope.searchBySource = searchBySource;
            $scope.orderNavJud = 1;
            $scope.switchOrderNav = switchOrderNav; //切换tab页
            // $scope.printSet = printSet(); //打印设置needdel__cz
            $scope.confirm_order = confirm_order; //打印设置确认
            $scope.closePop = closePop;
            $scope.gotoViewStudent = gotoViewStudent;
            $scope.patchConfirm = patchConfirm; //批量确认
            $scope.sel_allFun = sel_allFun; //全选本页数据
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            $scope.sortCllict = sortCllict; //切换排序
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getOrderList(0);
                    getStudentOrderTotal();
                }
            });
            $scope.export_config = export_config;

            if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '待处理') {
                arrearOrder = '1'; //筛选欠费订单
                $scope.arrear_order = true;

            }
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.orderNavJud = $scope.$stateParams.screenValue.tab;
                    setTimeout(function () {
                        switchOrderNav($scope.orderNavJud);
                    })
                }
            }
            getOrderList(0);
            getStudentOrderTotal();
            //添加图片按钮显示隐藏
            // $scope.imgover = function(evt, type) {needdel__cz
            //     switch (type) {
            //         case 'change':
            //             $(evt.target).closest('.shop_img').find('.shop_img_msk').show();
            //             break;
            //         case 'delete':
            //             evt.stopPropagation();
            //             $(evt.target).find('var').show();
            //     }
            // }
            // $scope.imgout = function(evt, type) {
            //     switch (type) {
            //         case 'change':
            //             $(evt.target).closest('.shop_img').find('.shop_img_msk').hide();
            //             break;
            //         case 'delete':
            //             evt.stopPropagation();
            //             $(evt.target).find('var').hide();
            //     }
            // }

            // $scope.add_organInfo = function(type, d) {needdel__cz
            //     switch (type) {
            //         case 'logo': //添加首页图片
            //             $timeout(function() {
            //                 szpUtil.util_addImg(true, function(data) {
            //                     $scope.BillSettingInfo.logo = data;
            //                     $scope.$apply();
            //                 }, { options: { aspectRatio: 1 }, type: 'image/gif, image/jpeg, image/png' });
            //             });
            //             break;
            //         case 'miniWebsite': //添加首页图片
            //             $timeout(function() {
            //                 szpUtil.util_addImg(true, function(data) {
            //                     $scope.BillSettingInfo.miniWebsite = data;
            //                     $scope.$apply();
            //                 }, { options: { aspectRatio: 1 }, type: 'image/gif, image/jpeg, image/png' });
            //             });
            //             break;
            //     }
            // }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            SERVICE.CUSTOMPOP.TABLE["订单表头-自定义"] = function(data) {
                $scope.checkedHead = data.customTag;
            }
            $scope.$watch("checkedHead", function(n, o) {
                //          if(n === o || n == undefined) return;   //防止第一次重复监听
                $scope.orderListThead_ = getTableHead($scope.checkedHead, $scope.orderListThead);
                $timeout(function() {
                    $scope.reTheadData_['orderHead']();
                    $scope.$broadcast("orderTdChange", $scope.checkedHead);
                }, 100, true)

            }, true);

        }


        //获取各页面的自定义表头  2 oa潜客 3 oa学员 4oa订单 5 oa班级
        function getCustomTag() {
            var param = {
                customTagType: 4,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/customTag/info',
                type: 'get',
                data: param,
                success: function(data, d) {
                    if (data.status == "200") {
                        if (data.context && data.context.customTag) {
                            $scope.getHeads = {
                                customTag: JSON.parse(data.context.customTag),
                                customTagId: data.context.customTagId
                            };
                        }
                        $scope.checkedHead = $scope.getHeads ? resetHead($scope.getHeads.customTag, heads) : heads;
                    }
                }
            })
        }

        function gotoViewStudent(x) {
            if (checkAuthMenuById("29")) {
                window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', { 'page': 1, 'item': x, 'tab': 1 });
            } else {
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览学员权限。");
            }
        }

        function getAdviserName() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data: { pageType: '0', quartersTypeId: '3', shopTeacherStatus: '1' },
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_adviser = data.context;
                        $scope.screen_adviser.unshift({ "teacherName": "无顾问", "shopTeacherId": "-1" });
                    }
                }
            });
        }

        function getHandlelist() {
            $.hello({
                url: CONFIG.URL + '/api/oa/order/getHandlerList',
                type: 'get',
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_handle = data.context;
                    }
                }
            });
        }

        function switchOrderNav(n) {
            $scope.orderNavJud = n;
            eachPage = 10;
            pagerRender = false;
            searchType = searchName = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            searchOrderType = adviserId = handlerId = confirmorId = source = arrearOrder = repealedOrder = confirmStatus = "";
            $scope.arrear_order = $scope.repealed_order = $scope.unConfirm_order = $scope.enConfirm_order = $scope.abolish = false;
            $scope.searchTime = "";
            if (n == 1) {
                $scope.income = $scope.loss = false;
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                getStudentOrderTotal();
            }
            getOrderList(0);

        }

        function getStudentOrderTotal() {
            var params = {
                "searchType": searchName ? 'appSearchName' : undefined,
                "searchName": searchName,
                "arrearageStatus": arrearOrder,
                "confirmStatus": confirmStatus,
                "orderStatus": repealedOrder,
                "counselorId": adviserId,
                "confirmorId": confirmorId,
                "handlerId": handlerId,
                "dataSource": source,
                "flag": $scope.income ? "income" : $scope.loss ? "loss" : undefined
            };
            if ($scope.orderNavJud == 2) {
                params["orderType"] = 4;
            } else {
                params["orderType"] = searchOrderType;
                params["orderStatus"] = $scope.abolish ? "1" : undefined;
            }

            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            // 去掉为空字段
            for (var i in params) {
                if (params[i] == "" || params[i] == undefined) {
                    delete params[i];
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/order/getStudentOrderTotal",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.orderTotal = data.context;
                    };
                }
            })
        }

        function arrearageStatus() {
            arrearOrder = $scope.arrear_order ? "1" : "";
            if ($scope.abolish) {
                $scope.abolish = false;
                confirmStatus = "";
            }
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function unConfirm() {
            $scope.abolish = false;
            $scope.enConfirm_order = false;
            confirmStatus = $scope.unConfirm_order ? "0" : "";
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function enConfirm() {
            $scope.abolish = false;
            $scope.unConfirm_order = false;
            confirmStatus = $scope.enConfirm_order ? "1" : "";
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function incomeorloss(type) {
            if (type) {
                if ($scope.income) {
                    $scope.income = true;
                    $scope.loss = false;
                }
            } else {
                if ($scope.loss) {
                    $scope.loss = true;
                    $scope.income = false;
                }
            }
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function abolishOrder() {
            confirmStatus = "";
            arrearOrder = "";
            $scope.unConfirm_order = false;
            $scope.enConfirm_order = false;
            $scope.arrear_order = false;
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        //      function changeOrderStatus(){
        //          screen_setDefaultField($scope, function() {
        //              $scope.screen_goReset['类型']();
        //          });
        //          repealedOrder=$scope.repealed_order?"1":"";
        //          pagerRender = false;
        //          getOrderList(0);
        //      }
        //排序切换
        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            search_orderName = data.id;
            pagerRender = false;
            getOrderList(0);
        }

        function sel_allFun(c) {
            checkboxAllFun(c, $scope.orderList, $scope.select_params, 'orderId');
        }
        //重置筛选栏
        function onReset() {
            searchType = searchName = "";
            if ($scope.orderNavJud == 1) {
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                searchOrderType = adviserId = handlerId = confirmorId = source = arrearOrder = repealedOrder = confirmStatus = "";
                $scope.arrear_order = $scope.repealed_order = $scope.unConfirm_order = $scope.enConfirm_order = $scope.abolish = false;
            }
            $scope.searchTime = "";
            $scope.income = $scope.loss = false;
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false; //分页重新加载
            getOrderList(0);
            getStudentOrderTotal();
        }
        //回车键  删除键
        function Enterkeyup(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        //搜索button
        function SearchData(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function searchByType(val) { //状态查找
            if (val == null) {
                searchOrderType = '';
            } else {
                searchOrderType = val.value;
            }
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function searchByAdviser(val) {
            if (val == null) {
                adviserId = null;
            } else {
                adviserId = val.shopTeacherId;
            }
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function searchByHandle(val) {
            if (val == null) {
                handlerId = null;
            } else {
                handlerId = val.shopTeacherId;
            }
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function searchByConfirm(val) {
            if (val == null) {
                confirmorId = null;
            } else {
                confirmorId = val.shopTeacherId;
            }
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function searchBySource(val) {
            source = val != null ? val.id : undefined;
            pagerRender = false;
            getOrderList(0);
            getStudentOrderTotal();
        }

        function patchConfirm() {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择需要批量操作的数据！");
            }
            detailMsk('是否确认订单？', function() {
                var params = {
                    orderIds: getArrIds($scope.select_params, 'orderId')
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/order/updateConfirmStatusBatch',
                    type: 'post',
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.select_params = [];
                            $scope.sel_all = false;
                            getOrderList(start);
                            getStudentOrderTotal();
                        }

                    }
                });
            });
        }

        $scope.$on("orderInfoChange", function(msg) {
            getOrderList(start);
            getStudentOrderTotal();
        });
        $scope.$on("reloadOrderList", function(msg) {
            getOrderList(start);
            getStudentOrderTotal();
        });

        function getOrderList(start) {
            var params = {
                "searchType": searchName ? 'appSearchName' : undefined,
                "searchName": searchName,
                "arrearageStatus": arrearOrder,
                "confirmStatus": confirmStatus,
                "counselorId": adviserId,
                "confirmorId": confirmorId,
                "handlerId": handlerId,
                "orderStatus": repealedOrder,
                "start": start.toString() || '0',
                "count": eachPage
            };
            if ($scope.orderNavJud == 2) {
                params["orderType"] = 4;
            } else {
                params["orderType"] = searchOrderType;
                params["dataSource"] = source;
                params["flag"] = $scope.income ? "income" : $scope.loss ? "loss" : undefined;
                params["orderStatus"] = $scope.abolish ? "1" : undefined;
            }
            if (search_orderTyp && search_orderName) {
                params["orderTyp"] = search_orderTyp;
                params["orderName"] = search_orderName;
            }

            // 去掉为空字段
            for (var i in params) {
                if (params[i] == "" || params[i] == undefined) {
                    delete params[i];
                }
            }
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            console.log(params);
            $.hello({
                url: CONFIG.URL + '/api/oa/order/getStudentOrder',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context.items;
                        for (var i = 0, len = list.length; i < len; i++) {
                            // 订单类型 1：新签 2：续签 3：转课 4：结课 5：退课
                            list[i].type = CONSTANT.ORDER_TYPE[list[i].orderType];
                        }

                        $scope.totalNum = data.context.totalNum;
                        $scope.orderList = list;
                        repeatLists($scope.orderList, $scope.select_params, 'orderId');
                        orderPager(data.context.totalNum);
                    }

                }
            });
        };

        function orderPager(total) {
            var len = 0;
            angular.forEach($scope.orderList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.orderList && $scope.orderList.length == len) {
                $scope.sel_all = true;
            } else {
                $scope.sel_all = false;
            }
            //分页
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
                    getOrderList(start); //回掉
                }
            });
        }



        // function printSet() {needdel__cz
        //     return {
        //         // 获取数据

        //            getBillSettingInfo:function(){
        //                 openPopByDiv("打印设置", '.setPrint',"660px");
        //                 $.hello({
        //                     url: CONFIG.URL + '/api/oa/setting/getBillSettingInfo',
        //                     type: 'get',
        //                     // data: params,
        //                     success: function(data) {
        //                         if(data.status == "200"){
        //                             try{
        //                                 $scope.BillSettingInfo = data.context;
        //                                 if($scope.BillSettingInfo.doStatus == 0){
        //                                     $scope.BillSettingInfo.billSettingDesc = ''
        //                                 }
        //                                 delete $scope.BillSettingInfo.id;
        //                                 delete $scope.BillSettingInfo.shopId;
        //                             } catch(e){}

        //                         }

        //                     }
        //                 });
        //             },
        //         // 提交修改
        //         updateBillSettingInfo: function() {
        //             $.hello({
        //                 url: CONFIG.URL + '/api/oa/setting/updateBillSettingInfo',
        //                 type: 'post',
        //                 data: JSON.stringify($scope.BillSettingInfo),
        //                 success: function(data) {
        //                     if (data.status == "200") {
        //                         closePop();
        //                     }

        //                 }
        //             });
        //         }
        //     };


        // }

        function confirm_order(x) {
            var isConfirm = layer.confirm('是否确认订单？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                resize: false,
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/updateConfirmStatus",
                    type: "get",
                    data: {
                        'orderId': x.orderId
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('已成功确认订单', {
                                icon: 1
                            });
                            getOrderList(start);
                        };
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }

        function closePop() {
            layer.close(dialog);
        }

        function export_config() {
            var token = localStorage.getItem('oa_token');
            var params = {
                "token": token,
                "searchType": searchName ? 'appSearchName' : undefined,
                "searchName": searchName,
                "arrearageStatus": arrearOrder,
                "confirmStatus": confirmStatus,
                "counselorId": adviserId,
                "confirmorId": confirmorId,
                "handlerId": handlerId,
                "orderStatus": repealedOrder,
                "beginTime": $scope.searchTime ? $scope.searchTime.split(" 到 ")[0] + " 00:00:00" : undefined,
                "endTime": $scope.searchTime ? $scope.searchTime.split(" 到 ")[1] + " 23:59:59" : undefined,
            };
            if ($scope.orderNavJud == 2) {
                params["orderType"] = 4;
            } else {
                params["orderType"] = searchOrderType;
                params["dataSource"] = source;
                params["flag"] = $scope.income ? "income" : $scope.loss ? "loss" : undefined;
                params["orderStatus"] = $scope.abolish ? "1" : undefined;
            }
            if (search_orderTyp && search_orderName) {
                params["orderTyp"] = search_orderTyp;
                params["orderName"] = search_orderName;
            }
            // 去掉为空字段
            for (var i in params) {
                if (params[i] == "" || params[i] == undefined) {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantStudentOrder?' + $.param(params));
        }
    }]
})