define(["laydate", 'mySelect', 'orderInfo'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', function($scope, $rootScope, $http, $state, $stateParams, SERVICE) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        //       $scope.income = $scope.loss = false;
        var handlerId, confirmorId;
        $scope.select_params = []; //已选勾选数据
        $scope.sel_all = false;
        $scope.unConfirm = 1;
        var search_orderName = "paymentTime",
            search_orderTyp = "desc";
        init();

        function init() {
            getHandlelist();
            laydate.render({
                elem: '#paymentsTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getPaymentDetail('0');
                    getPaymentDetailTotal();
                }
            });
            (function() {
                laydate.render({
                    elem: '#pCallTime',
                    range: "到",
                    isRange: true,
                    btns: ['confirm'],
                    done: function(value) {
                        $scope.derTime = value;
                    }
                });
            })();
            $scope.Enterkeyup = Enterkeyup; //模糊搜索
            $scope.SearchData = SearchData; //按钮筛选
            $scope.confirmChange = confirmChange;
            //          $scope.incomeorloss=incomeorloss;//盈收还是亏损
            $scope.selectInfoNameId = 'studentName'; //select初始值
            $scope.searchData = {
                studentName: '学员、经办人、订单号',
                teacherName: '经办人',
            };
            var arrs = {
                1: "报名",
                //              2:"续签",
                3: "转课",
                5: "退课",
                6: "充值",
                7: "退款",
                11: "退学杂",
                12:"转校"
            };
            $scope.isConfirmPay = checkAuthMenuById("59"); //操作收支
            $scope.isDaochuPay = checkAuthMenuById("148"); //导出收支
            $scope.typeList = getConstantList(arrs);
            $scope.payTypeList = getConstantList(CONSTANT.PAYTYPE);
            $scope.confirm_order = confirm_order; //确认订单信息
            $scope.searchByConfirm = searchByConfirm;
            $scope.searchByHandle = searchByHandle;
            // $scope.openIncome_Out = openIncome_Out;//打开收支确认弹出框
            // $scope.setIncome_Out = setIncome_Out;//收支设置
            //          $scope.openUpload = openUpload;//收支导出
            $scope.export_config = export_config; //收支导出确认
            $scope.closePop = closePop; //关闭弹框
            $scope.patchConfirm = patchConfirm; //批量确认
            //          $scope.sel_allFun = checkboxAllFun;//全选本页数据
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            //表头

            $scope.nameListThead = [{
                    'name': 'checkbox',
                    'width': '50'
                }, {
                    'name': '订单号',
                    'width': '20%',
                    'issort': true,

                    'id': 'externalOrderId'
                },
                {
                    'name': '类型',
                    'width': '80',
                },
                {
                    'name': '支付时间',
                    'width': '130',
                    'issort': true,
                    'sort': 'desc',
                    'id': 'paymentTime'
                },
                {
                    'name': '学员',
                    'width': '24%',
                },
                {
                    'name': '收支金额',
                    'width': '100',
                    'align': 'right'
                },
                {
                    'name': '付款方式',
                    'width': '120',
                },
                //              {
                //                  'name': '备注',
                //                  'width': '27%',
                //              },
                {
                    'name': '经办人',
                    'width': '18%',
                },
                {
                    'name': '确认人',
                    'width': '18%',
                },
                {
                    'name': '状态',
                    'width': '80',
                },
                {
                    'name': '操作',
                    'align': 'center',
                    'width': '120',
                }
            ];

            getPaymentDetail('0'); //记载列表
            getPaymentDetailTotal();
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        var likeName, //搜索内容
            SearchDataType, //搜索类型
            SearchDataText, //搜索内容
            orderType, //类型
            paymentType;

        //转成yyyy-MM-dd HH:mm
        $scope.$yznDateFormatYMdHm = function(val) {
            return yznDateFormatYMdHm(val);
        }
        $scope.sel_allFun = function(c) {
            checkboxAllFun(c, $scope.getPaymentDetailList, $scope.select_params, 'orderId');
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

        function SearchData(data) {
            likeName = data.value;
            SearchDataType = data.type;
            pagerRender = false;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }

        function Enterkeyup(data) {
            likeName = data.value;
            SearchDataType = data.type;

            pagerRender = false;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }
        //类型选择
        $scope.searchBytypeList = function(data) {
                console.log(data);
                if (data == null) {
                    orderType = '';
                } else {
                    orderType = data.value;
                }
                pagerRender = false;
                getPaymentDetail('0');
                getPaymentDetailTotal();
            }
            //付款方式选择
        $scope.searchBypayTypeList = function(data) {
            console.log(data);
            if (data == null) {
                paymentType = '';
            } else {
                paymentType = CONSTANT.PAYTYPE[data.value];
            }
            //          $scope.income = $scope.loss = false;
            pagerRender = false;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }

        function confirmChange(e) {
            $scope.unConfirm = e.target.checked ? "0" : "1";
            pagerRender = false; //列表页码重置
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }
        //      function incomeorloss(type){
        //          if(type){
        //              if($scope.income){
        //                  $scope.income = true;
        //                  $scope.loss = false;
        //                  paymentType = "盈收";
        //              }else{
        //                  paymentType="";
        //              }
        //          }else{
        //              if($scope.loss){
        //                  $scope.loss = true;
        //                  $scope.income = false;
        //                  paymentType = "亏损";
        //              }else{
        //                  paymentType="";
        //              }
        //          }
        //          $scope.screen_goReset['付款方式']();
        //          pagerRender = false;
        //          getPaymentDetail('0');
        //          getPaymentDetailTotal();
        //      }
        //排序回调方法
        $scope.sortCllict = function(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            search_orderName = data.id;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }

        function searchByHandle(val) {
            if (val == null) {
                handlerId = null;
            } else {
                handlerId = val.shopTeacherId;
            }
            pagerRender = false;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }

        function searchByConfirm(val) {
            if (val == null) {
                confirmorId = null;
            } else {
                confirmorId = val.shopTeacherId;
            }
            pagerRender = false;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }
        $scope.onReset = function() {
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            };
            $scope.kindSearchOnreset(); //调取app重置方法
            SearchDataType = likeName = paymentType = orderType = handlerId = confirmorId = '';
            $scope.searchTime = "";
            pagerRender = false; //列表页码重置
            $scope.unConfirm = "1";
            //           $scope.income = $scope.loss = false;
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }
        $scope.$on("orderInfoChange", function(msg) {
            pagerRender = false; //列表页码重置
            getPaymentDetail('0');
            getPaymentDetailTotal();
        });
        SERVICE.PAYMENT.getPayment = function() {
            pagerRender = false; //列表页码重置
            getPaymentDetail('0');
            getPaymentDetailTotal();
        }

        function patchConfirm() {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择需要批量操作的数据！");
            }
            detailMsk('是否确认收款信息？', function() {
                var params = {
                    orderIds: getArrIds($scope.select_params, 'orderId')
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/order/checkPaymentBatch',
                    type: 'post',
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.select_params = [];
                            $scope.resetCheckboxDir(false);
                            getPaymentDetail(start);
                            getPaymentDetailTotal();
                        }

                    }
                });
            });
        }
        //列表数据
        function getPaymentDetailTotal() {
            var beginTime = '',
                endTime = '';
            if ($scope.searchTime) {
                beginTime = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                endTime = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            var param = {
                'searchType': likeName ? 'appSearchName' : undefined,
                'searchName': likeName,
                'paymentMode': paymentType,
                'orderType': orderType,
                'beginTime': beginTime,
                'endTime': endTime,
                "confirmorId": confirmorId,
                "handlerId": handlerId,
                "checkStatus": $scope.unConfirm == 0 ? "0" : undefined,
            };
            for (var i in param) {
                if (param[i] === '' || param[i] == undefined) {
                    delete param[i];
                };
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/order/getPaymentDetailTotal",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        console.log(data.context);
                        $scope.payTotal = data.context;
                    }
                }

            })
        }
        //列表数据
        function getPaymentDetail(start_) {
            start = start_ == 0 ? "0" : start_;
            var beginTime = '',
                endTime = '';
            if ($scope.searchTime) {
                beginTime = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                endTime = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            var param = {
                'start': start_,
                'count': eachPage,
                'searchType': likeName ? 'appSearchName' : undefined,
                'searchName': likeName,
                'paymentMode': paymentType,
                'orderType': orderType,
                'beginTime': beginTime,
                'endTime': endTime,
                "confirmorId": confirmorId,
                "handlerId": handlerId,
                "checkStatus": $scope.unConfirm == 0 ? "0" : undefined,
            };

            if (search_orderTyp && search_orderName) {
                param["orderTyp"] = search_orderTyp;
                param["orderName"] = search_orderName;
            }
            for (var i in param) {
                if (param[i] === '' || param[i] == undefined) {
                    delete param[i];
                };
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/order/getPaymentDetail",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        console.log(data)
                        $scope.getPaymentDetailList = data.context.items;

                        $scope.totalNum = data.context.totalNum;
                        for (var i = 0; i < $scope.getPaymentDetailList.length; i++) {
                            $scope.getPaymentDetailList[i].orderTypeName = CONSTANT.ORDER_TYPE[$scope.getPaymentDetailList[i].orderType]
                        }
                        repeatLists($scope.getPaymentDetailList, $scope.select_params, 'orderId');
                        renderPager(data.context.totalNum);
                    }
                }

            })
        }

        function renderPager(total) {
            var len = 0;
            angular.forEach($scope.getPaymentDetailList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.getPaymentDetailList.length > 0 && $scope.getPaymentDetailList.length == len) {
                $scope.resetCheckboxDir(true);
            } else {
                $scope.resetCheckboxDir(false);
            }
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
                    getPaymentDetail(start); //回掉
                }
            });
        }

        function confirm_order(x) {
            var isConfirm = layer.confirm('是否确认收款信息？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/order/checkPayment",
                    type: "get",
                    data: {
                        'paymentId': x.paymentId
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('已成功确认收款信息', {
                                icon: 1
                            });
                            getPaymentDetail(start);
                        };
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }
        // function openIncome_Out(){
        //     $.hello({
        //         url: CONFIG.URL + '/api/oa/setting/getShop',
        //         type: 'get',
        //         success: function(data) {
        //             if(data.status == "200"){
        //                 $scope.change_confirm = data.context.paymentConfirm==1?true:false;
        //             }

        //         }
        //     });
        //     openPopByDiv("收支设置", '.setIncome_Out')
        // }
        // function setIncome_Out(){
        //      var param={
        //         "paymentConfirm":$scope.change_confirm?"1":"0"
        //     };
        //      $.hello({
        //         url: CONFIG.URL + '/api/oa/setting/updatePaymentConfirm',
        //         type: 'post',
        //         data:JSON.stringify(param),
        //         success: function(data) {
        //             if(data.status == "200"){
        //                  closePop();
        //             }

        //         }
        //     });
        // }
        //      function openUpload(){
        //          layerOpen('exportAllData', '收支导出');
        //      }
        function export_config() {
            //          if($scope.derTime) {
            //              var beginTime = $scope.derTime.split(' 到 ')[0]+" 00:00:00";
            //              var endTime = $scope.derTime.split(' 到 ')[1]+" 23:59:59";
            //              var token=localStorage.getItem('oa_token');
            //              window.open(CONFIG.URL + "/api/oa/statistics/consultantPaymentDetail?beginTime=" + beginTime+ '&&endTime=' + endTime + '&&token=' + token);
            //          }
            var beginTime = '',
                endTime = '';
            var token = localStorage.getItem('oa_token');
            if ($scope.searchTime) {
                beginTime = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                endTime = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            var data = {
                "beginTime": beginTime,
                "endTime": endTime,
                "token": token,
                'searchType': SearchDataType,
                'searchName': likeName,
                'paymentMode': paymentType,
                'orderType': orderType,
                "confirmorId": confirmorId,
                "handlerId": handlerId,
                "checkStatus": $scope.unConfirm == 0 ? "0" : undefined,
            };
            for (var i in data) {
                if (data[i] == '' || data[i] == undefined) {
                    delete data[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantPaymentDetail?' + $.param(data));
        }
        //以下是弹框页面的处理
        function openPopByDiv(title, div, width) {
            dialog = layer.open({
                type: 1,
                title: title,
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: width ? width : '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(div)
            })
        }

        function closePop() {
            layer.close(dialog);
        }

    }]
})