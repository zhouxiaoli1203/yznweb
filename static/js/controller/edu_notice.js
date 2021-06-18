define(['laydate', 'socketIo', 'szpUtil', 'mySelect', 'courseAndClass_sel', 'students_sel', 'qrcode', 'potial_sel'], function(laydate, socketIo) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$sce','$timeout', function($scope, $rootScope, $http, $state, $stateParams, $sce,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var pagerRender_ = false,
            start_ = 0,
            eachPage_ = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_name, search_type, search_time;
        var $M_box3 = $('.M_box3_1'); //分页显示
        var $M_box3_ = $('.M_box3_2'); //分页显示
        var dialog_ = null,
            dialog_img;
        init();

        function init() {
            getAllTemplate();
            $scope.shopInfo = window.currentUserInfo.shop;
            $scope.studNavJud = 1;
            $scope.firstNav = 1;
            $scope.switchStudNav = switchStudNav; //切换tab
            $scope.operationList = operationList; //列表操作
            $scope.operationList_msg = operationList_msg; //后面增加的短信功能的列表操作
            $scope.operationBtn = operationBtn; //按钮操作
            $scope.submit_template = submit_template; //提交模板信息
            $scope.templateTab = 1; //消息弹框模板tab
            $scope.add_informContent = add_informContent; //添加通知模板内容
            $scope.delete_informContent = delete_informContent; //删除通知模板内容
            $scope.moveUpDown = moveUpDown; //模板上下移动
            $scope.sel_template = sel_template; //选择通知模板
            $scope.inform_sel = inform_sel; //选择收件人
            $scope.inform_del = inform_del; //删除收件人
            $scope.openClose = openClose; //打开关闭确认收到
            $scope.shopInfos = window.currentUserInfo.shop; //校区信息
            $scope.operationPower = checkAuthMenuById(87); //是否拥有操作权力
            $scope.confirm_pay = confirm_pay; //确认支付短信充值
            // $scope.confirm_updateInfo = confirm_updateInfo; //短信设置-设置签名确定按钮-更新门店短信功能信息needdel__cz
            $scope.confirm_messageSend = confirm_messageSend; //发送短信确定按钮
            $scope.close_popup = function(type) {
                var _d = type == 1 ? dialog_ : dialog;
                layer.close(_d);
            }
            $scope.screen_msgType = function(d) {
                if (d) {
                    $scope.screen_sel.type = d.id;
                    pagerRender = false;
                    getMessageList(0);
                }
            };
            $scope.screen_sel = { //筛选栏筛选得到的数据
                'type': null,
                'timef': '',
            };
            //搜索类型
            $scope.kindSearchData = {
                'header': '通知抬头',
            };
            $scope.selectInfoNameId = 'header';
            $scope.SearchData = SearchData; //搜索
            $scope.Enterkeyup = SearchData; //搜索
            $scope.nameListThead = [ //发送通知
                { 'name': '通知抬头', 'width': '30%' },
                { 'name': '通知时间' },
                { 'name': '发件人' },
                { 'name': '收件人数', 'align': 'right' },
                { 'name': '已确认/已查看(人数)', 'align': 'right' },
                { 'name': '操作', 'width': '20%', 'align': 'center' },
            ];
            $scope.nameListThead_ = [ //通知模板
                { 'name': '通知抬头' },
                { 'name': '操作', 'align': 'center' },
            ];
            $scope.nameListThead_1 = [ //短信通知
                { 'name': '收件人', 'width': '100px' },
                { 'name': '手机号码', 'width': '120px' },
                { 'name': '操作人', 'width': '60px' },
                { 'name': '发送时间', 'width': '120px' },
                { 'name': '通知类型', 'width': '100px' },
                { 'name': '通知内容' },
                // {'name': '发送状态','width': '120px','align': 'right'},
                { 'name': '消耗短信(条)', 'width': '80px', 'align': 'right' },
            ];
            $scope.nameListThead_2 = [ //短信设置
                { 'name': '触发条件' },
                { 'name': '功能描述', 'width': '420px' },
                { 'name': '应用端通知', 'align': 'center' },
                { 'name': '短信通知', 'align': 'center' },
                { 'name': '预览', 'width': '190px', 'align': 'center' },
            ];
            $scope.informTemplate = { //发送通知模板数据
                title: '',
                content: [{ 'type': 'text', 'value': '' }],
            };
            $scope.closeLayer = function(specil) { //取消或者下一步操作
                if (specil && $scope.templateTab == '1_2') {
                    $scope.templateTab = 1;
                } else {
                    layer.close(dialog);
                }
            }
            $scope.getSmsStatus = function(x) {
                if (x.smsStatus == '0') {
                    return '发送中';
                } else if (x.smsStatus == '1') {
                    return '发送成功';
                } else {
                    var failStr = '失败'
                    if (x.failReason) {
                        failStr = failStr + '(' + x.failReason + ')';
                    }
                    return failStr;
                }
            }

            $scope.onReset = function(type) { //列表重置
                if (type == 1) {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    $('#informTime').val('');
                    search_name = undefined;
                    search_type = undefined;
                    search_time = undefined;
                    pagerRender = false;
                    getInformList(0);
                } else if (type == 2) {
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    }
                    $scope.screen_sel['type'] = undefined;
                    $scope.screen_sel['timef'] = '';
                    pagerRender = false;
                    getMessageList(0);
                }
            }

            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            setTimeout(function() {
                laydate.render({ //选择通知筛选时间
                    elem: '#informTime', //指定元素
                    range: "到",
                    isRange: false,
                    done: function(value) {
                        search_time = value;
                        pagerRender = false;
                        getInformList(0);
                    }
                });
            })
            getInformList(0); //获取列表

            //确定选择学员
            $scope.$on('通知-学员', function(d, d_) {
                    inform_sel(d_, 's');
                })
                //确定选择班级
            $scope.$on('通知-班级', function(d, d_) {
                inform_sel(d_, 'c');
            });
            //确定选择潜客
            $scope.$on('通知-潜客', function(d, d_) {
                inform_sel(d_, 'p');
            });
            if ($stateParams.screenValue.name == 'nameList' && $stateParams.screenValue.type == '短信充值') {
                $scope.firstNav = 2;
                operationBtn(2);
            }
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.firstNav = $scope.$stateParams.screenValue.tab;
                    switchStudNav($scope.firstNav);
                }

            }
        }

        //发送短信确定按钮
        function confirm_messageSend() {
            console.log($scope.messageTemplate);
            var a1 = [],
                a2 = [],
                a3 = [],
                a4 = [];
            angular.forEach($scope.messageTemplate.teachers, function(v) {
                a1.push({ 'status': v.status, 'teacherId': v.teacherId, 'teacherName': v.teacherName, 'teacherRestStatus': v.teacherRestStatus });
            })
            angular.forEach($scope.messageTemplate.classList, function(v) {
                a2.push({ 'classId': v.classId, 'className': v.className, 'id': v.id });
            })
            angular.forEach($scope.messageTemplate.students, function(v) {
                a3.push({ 'id': v.id, 'name': v.name });
            })
            angular.forEach($scope.messageTemplate.potials, function(v) {
                    a4.push({ 'id': v.id, 'name': v.name });
                })
                // a1 = $scope.messageTemplate.teacherType?a1:[];
                // a2 = $scope.messageTemplate.classType?a2:[];
            a3 = $scope.messageTemplate.peoType == 2 ? [] : a3;
            if (!$scope.messageTemplate.peo) {
                layer.msg('收件人不能为空');
                return;
            }
            var datas = {
                'receiverType': ($scope.messageTemplate.peo - 1) + '',
                'teachers': $scope.messageTemplate.peo == 2 ? ($scope.messageTemplate.peoType == 1 ? [] : (a1.length > 0 ? a1 : undefined)) : undefined,
                'classes': $scope.messageTemplate.peo == 1 ? ($scope.messageTemplate.peoType == 2 ? (a2.length > 0 ? a2 : undefined) : undefined) : undefined,
                //                  'students': $scope.messageTemplate.peo==1?($scope.messageTemplate.peoType==1?[]:(a3.length > 0?a3:undefined)):undefined,    //学员
                //                  'students': $scope.messageTemplate.peo==3?($scope.messageTemplate.peoType==1?[]:(a4.length > 0?a4:undefined)):undefined,    //潜客
                'exclusiveTeachers': $scope.messageTemplate.peo == 2 ? ($scope.messageTemplate.peoType == 1 ? (a1.length > 0 ? a1 : undefined) : undefined) : undefined,
                //                  'exclusiveStudents': $scope.messageTemplate.peo==1?($scope.messageTemplate.peoType==1?(a3.length > 0?a3:undefined):undefined):undefined,    //学员
                //                  'exclusiveStudents': $scope.messageTemplate.peo==3?($scope.messageTemplate.peoType==1?(a4.length > 0?a4:undefined):undefined):undefined,    //潜客
            };
            if ($scope.messageTemplate.peo == 1) {
                datas["students"] = $scope.messageTemplate.peoType == 1 ? [] : (a3.length > 0 ? a3 : undefined);
                datas["exclusiveStudents"] = $scope.messageTemplate.peoType == 1 ? (a3.length > 0 ? a3 : undefined) : undefined;
            }
            if ($scope.messageTemplate.peo == 3) {
                datas["students"] = $scope.messageTemplate.peoType == 1 ? [] : (a4.length > 0 ? a4 : undefined);
                datas["exclusiveStudents"] = $scope.messageTemplate.peoType == 1 ? (a4.length > 0 ? a4 : undefined) : undefined;
            }
            var params = {
                'channel': 1,
                'title': $scope.messageTemplate.content,
                'receiver': JSON.stringify(datas)
            };

            //提交数据
            $.hello({
                url: CONFIG.URL + '/api/oa/notification/send',
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if (res.status == 200) {
                        pagerRender = false;
                        getMessageList(0);
                        layer.close(dialog);
                    };
                }
            });
        }

        //短信设置和设置签名确定-更新门店短信功能信息
        // function confirm_updateInfo(type) {needdel__cz
        //     var params;
        //     if (type == 1) { //短信设置
        //         params = {
        //             'smsWarningNum': $scope.messageTotleInfo.smsWarningNum,
        //             'smsWarningPhone': $scope.messageTotleInfo.smsWarningPhone,
        //             'signName': $scope.messageTotleInfo.signName,
        //             'birthdayTemplate': $scope.messageTotleInfo.birthdayTemplate,
        //         }
        //     }

        //     $.hello({
        //         url: CONFIG.URL + '/api/oa/sms/updateShopSmsInfo',
        //         type: "post",
        //         data: JSON.stringify(params),
        //         success: function(res) {
        //             if (res.status == 200) {
        //                 layer.close(dialog);
        //                 layer.msg('设置成功');
        //             };
        //         }
        //     });
        // }

        //确认支付短信充值
        function confirm_pay() {
            layer.load();
            var params = {
                'chcd': $scope.messageRecharge._t,
                'smsPackageId': $scope.messageRecharge._p.smsPackageId,
            }
            $.hello({
                url: CONFIG.URL + '/api/onlinePayment/smsPreOrder',
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        $scope.onlindePayData = res.context;
                        $('.onlinePay_code').html('');
                        jQuery('.onlinePay_code').qrcode({ //渲染二维码
                            render: "canvas", //也可以替换为table
                            width: 240,
                            height: 240,
                            text: res.context.qrcode,
                        });

                        //支付完成自动关闭弹窗
                        webSocketInit(res.context.smsBillId, function(event) {
                            var res = JSON.parse(event);
                            layer.close(dialog);
                            layer.close(dialog_);
                            getMessageList(0);
                            layer.msg('支付成功');
                        }, socketIo, 'refreshSmsQRCode');

                        //刷新订单支付状态
                        $scope.reloadOnlinePay = function() {
                            $.hello({
                                url: CONFIG.URL + '/api/onlinePayment/getSmsPayStatus',
                                type: "get",
                                data: { 'smsBillId': res.context.smsBillId },
                                success: function(res) {
                                    if (res.status == 200) {
                                        if (res.context.payStatus == 1) {
                                            layer.close(dialog);
                                            layer.close(dialog_);
                                            getMessageList(0);
                                            layer.msg('支付成功');
                                        } else if (res.context.payStatus == 0) {
                                            layer.msg('订单待支付');
                                        } else if (res.context.payStatus == 2) {
                                            layer.msg('订单已过期');
                                        }
                                    }
                                }
                            });
                        }
                        openPopByDiv('扫码支付', '#onlinePay_sign', '400px', false);
                    };
                }
            });
        }

        //获取短信充值套餐
        function getMessagePayList() {
            $.hello({
                url: CONFIG.URL + '/api/onlinePayment/getSmsPackage',
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.messageRecharge = { //短信充值数据
                            _con: res.context,
                            _p: res.context[0], //充值套餐-默认选择第一条支付套餐
                            _t: 'ALP', //充值类型
                        };
                    };
                }
            });
        }

        //获取短信通知设置列表数据
        function getmessageSetList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/sms/configList',
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.messageSetList = res.context;
                    };
                }
            });
        }

        //获取短信通知列表数据
        function getMessageList(start) {
            //获取短信发送列表
            var params = {
                'start': start,
                'count': eachPage,
                'type': $scope.screen_sel.type ? $scope.screen_sel.type : undefined,
                'beginTime': $scope.screen_sel.timef ? $scope.screen_sel.timef.split(' 到 ')[0] + ' 00:00:00' : undefined,
                'endTime': $scope.screen_sel.timef ? $scope.screen_sel.timef.split(' 到 ')[1] + ' 23:59:59' : undefined,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/sms/getSentSmsList',
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.messageList = res.context.items;
                        informPager(res.context.totalNum);
                    };
                }
            });
            //获取分校短信功能基本信息
            $.hello({
                url: CONFIG.URL + '/api/oa/sms/getShopSmsInfo',
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.messageTotleInfo = res.context;
                        if ($scope.messageTotleInfo) {
                            $scope.messageTotleInfo.birthdayTemplate = $scope.messageTotleInfo.birthdayTemplate ? $scope.messageTotleInfo.birthdayTemplate : '同学，祝你生日快乐！愿这特殊的日子里，你的每时每刻都充满欢乐。';
                        } else {
                            $scope.messageTotleInfo = {};
                            $scope.messageTotleInfo.birthdayTemplate = '';
                        }
                    };
                }
            });
        }

        //短信列表的操作
        function operationList_msg(type, d) {
            console.log(d)
            var tit = '',
                params;
            if (type == 1 || type == 2) {
                if (!$scope.operationPower) {
                    layer.msg('未拥有操作权限');
                    return;
                }
            }
            switch (type) {
                case 1: //开关微信小程序通知
                    tit = d.wxappStatus ? '是否关闭小程序通知？' : '是否开启小程序通知';
                    params = {
                        'id': d.id,
                        'wxappStatus': d.wxappStatus ? 0 : 1,
                    };
                    break;
                case 2: //开关短信通知
                    tit = d.smsStatus ? '是否关闭短信通知？' : '是否开启短信通知';
                    params = {
                        'id': d.id,
                        'smsStatus': d.smsStatus ? 0 : 1,
                    }
                    break;
                case 3: //预览短信
                    $scope.previewImg = d.smsPreview;
                    dialog_img = layer.open({
                        type: 1,
                        title: false,
                        skin: 'layerui layer_message_see', //样式类名
                        closeBtn: false, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '400px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.message_see')
                    });
                    break;
                case 4: //预览小程序
                    $scope.previewImg = d.wxappPreivew;
                    dialog_img = layer.open({
                        type: 1,
                        title: false,
                        skin: 'layerui layer_message_see', //样式类名
                        closeBtn: false, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '400px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.message_see')
                    });
                    break;
                case 5: //关闭预览
                    layer.close(dialog_img);
                    break;
            }

            //如果是短信设置列表的开关操作
            if (type == 1 || type == 2) {
                detailMsk(tit, function() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/sms/updateConfig',
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == 200) {
                                getmessageSetList();
                            };
                        }
                    });
                })
            }
        }

        //查看收件情况
        function SEEINFORM(d) {
            console.log(d)
            $scope.see_tab = 1;
            $scope.switchSeeNav = switchSeeNav;
            $scope.seeLineData = d;
            //搜索类型
            $scope.kindSearchData_see = {
                'name': '老师姓名',
            };
            $scope.selectInfoNameId_see = 'name';
            $scope.screenData = {
                'classId': undefined,
                'see': false,
                'confirm': false,
                'searchName': ''
            }
            $scope.changeBycome = changeBycome; //点击筛选栏的选中状态
            $scope.SearchData_see = SearchData_see; //搜索
            $scope.Enterkeyup_see = SearchData_see; //搜索
            $scope.screen_selClass = screen_selClass; //筛选班级
            $scope.onReset_see = function() {
                $scope.kindSearchOnreset(); //调取app重置方法
                $scope.screenData = {
                    'classId': undefined,
                    'see': false,
                    'confirm': false,
                    'searchName': ''
                };
                pagerRender_ = false;
                getSeeList(0);
            }
            getScreenClassList();
            getSeeList(0);

            //筛选班级
            function screen_selClass(data) {
                $scope.screenData.classId = data ? data.classId : undefined;
                pagerRender_ = false;
                getSeeList(0);
            }

            function SearchData_see(data) {
                $scope.screenData.searchName = data.value;
                pagerRender_ = false;
                getSeeList(0);
            }

            //选中筛选栏的筛选字段
            function changeBycome(evt, type) {
                switch (type) {
                    case 1:
                        $scope.screenData.see = evt.target.checked ? true : false;
                        break;
                    case 2:
                        $scope.screenData.confirm = evt.target.checked ? true : false;
                        break;
                };
                pagerRender_ = false;
                getSeeList(0);
            }

            //切换tab
            function switchSeeNav(type) {
                if (type == 1) {
                    $scope.kindSearchData_see = {
                        'name': '老师名字',
                    };
                } else {
                    $scope.kindSearchData_see = {
                        'name': '学员名字',
                    };
                }
                $scope.see_tab = type;
                pagerRender_ = false;
                getSeeList(0);
            }

            //获取列表信息
            function getSeeList(start) {
                var params = {
                    'receiverType': $scope.see_tab == 1 ? 1 : 0,
                    'notificationId': d.id,
                    'checked': $scope.screenData.see ? 0 : undefined,
                    'confirmed': $scope.screenData.confirm ? 0 : undefined,
                    'searchName': $scope.screenData.searchName ? $scope.screenData.searchName : undefined,
                    'classId': $scope.screenData.classId ? $scope.screenData.classId : undefined,
                    'start': start,
                    'count': eachPage_
                }
                console.log(params);
                $.hello({
                    url: CONFIG.URL + '/api/oa/notification/getReceivers',
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == 200) {
                            console.log(res);
                            $scope.informSeeList = res.context.items;
                            informPager_(res.context.totalNum);
                        };
                    }
                });
            }

            //分页
            function informPager_(total) { //分页
                if (pagerRender_) {
                    return;
                } else {
                    pagerRender_ = true;
                }
                $M_box3_.pagination({
                    totalData: total || 0, // 数据总条数
                    showData: eachPage_, // 显示几条数据
                    jump: true,
                    coping: true,
                    count: 2, // 当前页前后分页个数
                    homePage: '首页',
                    endPage: '末页',
                    prevContent: '上页',
                    nextContent: '下页',
                    callback: function(api) {
                        if (api.getCurrentEach() != eachPage_) { //本地存储记下每页多少条
                            eachPage_ = api.getCurrentEach();
                            localStorage.setItem(getEachPageName($state), eachPage_);
                        }
                        start_ = (api.getCurrent() - 1) * eachPage_; // 分页从0开始
                        getSeeList(start_)
                    }
                });

            }

            //获取班级筛选列表
            function getScreenClassList() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/class/list',
                    type: "get",
                    data: { 'pageType': 0, 'classStatus': 1 },
                    success: function(res) {
                        if (res.status == 200) {
                            console.log(res);
                            $scope.screenClassList = res.context;
                            informPager_(res.context.totalNum);
                        };
                    }
                });
            }
        }

        //打开关闭确认收到按钮
        function openClose(type) {
            if (type == 'msg') {
                if (!$scope.informTemplate.isSendMsg) { //判断是否有短信余额
                    //获取分校短信功能基本信息
                    $.hello({
                        url: CONFIG.URL + '/api/oa/sms/getShopSmsInfo',
                        type: "get",
                        data: {},
                        success: function(res) {
                            if (res.status == 200) {
                                console.log(res);
                                if (res.context) {
                                    if (res.context.smsNum) {
                                        $scope.informTemplate.isSendMsg = true;
                                    } else {
                                        layer.msg('短信余额不足，请先充值');
                                    }
                                } else {
                                    layer.msg('未开通短信功能，请先充值短信');
                                }
                            };
                        }
                    });
                } else {
                    $scope.informTemplate.isSendMsg = false;
                }
            } else if (type == 'see') {
                $scope.previewImg = 'http://cdn.yizhiniao.com/oa_38_1544163710482_picture';
                dialog_img = layer.open({
                    type: 1,
                    title: false,
                    skin: 'layerui layer_message_see', //样式类名
                    closeBtn: false, //不显示关闭按钮
                    move: false,
                    resize: false,
                    anim: 0,
                    area: '400px',
                    offset: '30px',
                    shadeClose: false, //开启遮罩关闭
                    content: $('.message_see')
                });
            } else {
                $scope.informTemplate.isConfirm = $scope.informTemplate.isConfirm ? false : true;
            }
        }

        //删除收件人
        function inform_del(d, ind, type) {
            var _data = $scope.templateTab == 'messageSend' ? $scope.messageTemplate : $scope.informTemplate; //判断是发送通知的数据还是发送短信的数据
            switch (type) {
                case 't':
                    _data.teachers[ind].hasSelected = false;
                    _data.teachers.splice(ind, 1);
                    break;
                case 'c':
                    _data.classList.splice(ind, 1);
                    break;
                case 's':
                    _data.students.splice(ind, 1);
                    break;
                case 'p':
                    _data.potials.splice(ind, 1);
                    break;
            }
        }

        //获取收件对象
        function inform_sel(data, type) {
            var _data = $scope.templateTab == 'messageSend' ? $scope.messageTemplate : $scope.informTemplate; //判断是发送通知的数据还是发送短信的数据
            switch (type) {
                case 't': //老师
                    handleSel(data, _data.teachers, 'shopTeacherId');
                    break;
                case 'c': //班级
                    _data.classList = duplicateRemoval(data, _data.classList, 'classId');
                    break;
                case 's': //学员
                    _data.students = duplicateRemoval(data, _data.students, 'id');
                    break;
                case 'p': //潜客
                    _data.potials = duplicateRemoval(data, _data.potials, 'potentialCustomerId');
                    break;
            }
        }

        //处理选择数据
        function handleSel(data, list, att) {
            var judHas = true;
            var judHasIndex = null;
            angular.forEach(list, function(val, index) {
                if (val[att] == data[att]) {
                    judHas = false;
                    judHasIndex = index;
                }
            });

            if (judHas) {
                list.push(data);
                data.hasSelected = true;
            } else {
                list.splice(judHasIndex, 1);
                data.hasSelected = false;
            }
        }

        //选择通知模板
        function sel_template() {
            $scope.informTemplate.content = [];
            if ($scope.informTemplate.template) {
                $scope.informTemplate.title = $scope.informTemplate.template.title;
                handleData($scope.informTemplate.template);
            } else {
                $scope.informTemplate.template = '';
                $scope.informTemplate.title = '';
                $scope.informTemplate.content.push({ 'type': 'text', 'value': '' })
            }
        }

        //提交信息(处理数据)
        function submit_template() {
            console.log('提交_' + $scope.templateTab, $scope.informTemplate);
            var params, _d = [],
                _url;
            //处理通知内容数据
            angular.forEach($scope.informTemplate.content, function(v) {
                switch (v.type) {
                    case 'text':
                        _d.push({ 'content': v.value });
                        break;
                    case 'img':
                        _d.push({ 'imageUrl': v.value });
                        break;
                    case 'video':
                        _d.push({ 'videoUrl': v.value });
                        break;
                }
            });
            switch ($scope.templateTab) {
                case 1: //发送通知下一步
                    $scope.templateTab = '1_2';
                    getSelectList();
                    return;
                    break;
                case '1_2': //确认发送通知
                    var a1 = [],
                        a2 = [],
                        a3 = [];
                    _url = '/api/oa/notification/send';
                    angular.forEach($scope.informTemplate.teachers, function(v) {
                        a1.push({ 'status': v.status, 'teacherId': v.teacherId, 'teacherName': v.teacherName, 'teacherRestStatus': v.teacherRestStatus });
                    })
                    angular.forEach($scope.informTemplate.classList, function(v) {
                        a2.push({ 'classId': v.classId, 'className': v.className, 'id': v.id });
                    })
                    angular.forEach($scope.informTemplate.students, function(v) {
                            a3.push({ 'id': v.id, 'name': v.name });
                        })
                        // a1 = $scope.informTemplate.teacherType?a1:[];
                        // a2 = $scope.informTemplate.classType?a2:[];
                    a3 = $scope.informTemplate.peoType == 2 ? [] : a3;
                    if (!$scope.informTemplate.peo) {
                        layer.msg('收件人不能为空');
                        return;
                    }
                    params = {
                        'needConfirm': $scope.informTemplate.isConfirm ? 1 : 0,
                        'channel': $scope.informTemplate.isSendMsg ? 2 : 0,
                        'title': $scope.informTemplate.title,
                        'templateId': $scope.informTemplate.template ? $scope.informTemplate.template.id : undefined,
                        'content': JSON.stringify(_d),
                        'receiver': JSON.stringify({
                            'teachers': $scope.informTemplate.peo == 2 ? ($scope.informTemplate.peoType == 1 ? [] : (a1.length > 0 ? a1 : undefined)) : undefined,
                            'classes': $scope.informTemplate.peo == 1 ? ($scope.informTemplate.peoType == 2 ? (a2.length > 0 ? a2 : undefined) : undefined) : undefined,
                            'students': $scope.informTemplate.peo == 1 ? ($scope.informTemplate.peoType == 1 ? [] : (a3.length > 0 ? a3 : undefined)) : undefined,
                            'exclusiveTeachers': $scope.informTemplate.peo == 2 ? ($scope.informTemplate.peoType == 1 ? (a1.length > 0 ? a1 : undefined) : undefined) : undefined,
                            'exclusiveStudents': $scope.informTemplate.peo == 1 ? ($scope.informTemplate.peoType == 1 ? (a3.length > 0 ? a3 : undefined) : undefined) : undefined,
                        })
                    }
                    break;
                case 2: //确认编辑通知
                    _url = '/api/oa/notification/update';
                    params = {
                        'id': $scope.informTemplate.id,
                        'needConfirm': $scope.informTemplate.isConfirm ? 1 : 0,
                        'channel': $scope.informTemplate.isSendMsg ? 2 : 0,
                        'title': $scope.informTemplate.title,
                        'content': JSON.stringify(_d),
                        'receiver': $scope.informTemplate.ls_lineData.receiver
                    }
                    break;
                case 3: //确认保存新建模板
                    _url = "/api/oa/notification/template/add";
                    params = {
                        'title': $scope.informTemplate.title,
                        'content': JSON.stringify(_d) //字符串转换
                    }
                    break;
                case 4: //确认保存编辑模板
                    _url = "/api/oa/notification/template/update";
                    params = {
                        'id': $scope.informTemplate.id,
                        'title': $scope.informTemplate.title,
                        'content': JSON.stringify(_d) //字符串转换
                    }
                    break;
            }
            console.log(params);
            //提交数据
            $.hello({
                url: CONFIG.URL + _url,
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        if ($scope.templateTab == 3 || $scope.templateTab == 4) {
                            getAllTemplate(); //刷新全部模板
                        }
                        pagerRender = false;
                        getInformList(0); //获取列表
                        layer.close(dialog);
                    };
                }
            });
        }

        //切换tab
        function switchStudNav(type) {
            switch (type) {
                case 1: //切换二级tab（通知记录）
                    $scope.studNavJud = 1;
                    pagerRender = false;
                    getInformList(0); //获取列表
                    if ($scope.$stateParams.screenValue.pop == "发送通知") {
                        $timeout(function () {
                            operationList(1, 1);
                        })
                    }
                    break;
                case 2: //切换二级tab（通知模板）
                    $scope.studNavJud = 2;
                    pagerRender = false;
                    getInformList(0); //获取列表

                    break;
                case 3: //切换一级tab（消息通知）
                    $scope.firstNav = 1;
                    $scope.studNavJud = 1;
                    pagerRender = false;
                    getInformList(0); //获取列表
                    break;
                case 4: //切换一级tab（短信通知）
                    $scope.firstNav = 2;
                    pagerRender = false;
                    getMessageList(0);
                    getmessageSetList();
                    setTimeout(function() {
                        laydate.render({ //选择通知筛选时间
                            elem: '#messageTime', //指定元素
                            range: "到",
                            isRange: false,
                            done: function(value) {
                                $scope.screen_sel.timef = value;
                                pagerRender = false;
                                getMessageList(0);
                            }
                        });
                        if ($scope.$stateParams.screenValue.pop == "发送短信") {
                            operationList(1, 8);
                        }
                    },500)

                    break;
                case 5: //切换一级tab（通知设置）
                    $scope.firstNav = 3;
                    getmessageSetList();
                    break;
            }
        }
        //搜索查询列表
        function SearchData(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false
            getInformList(0); //获取列表
        }

        //获取老师、班级、学员筛选列表
        function getSelectList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: "get",
                data: { 'pageType': 0, 'shopTeacherStatus': 1 },
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.inform_teachers = res.context;
                    };
                }
            });
            $.hello({
                url: CONFIG.URL + '/api/oa/class/list',
                type: "get",
                data: { 'pageType': 0, 'classStatus': '1' },
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.inform_classList = res.context;
                    };
                }
            });
            $.hello({
                url: CONFIG.URL + '/api/oa/potentialCustomer/simplelistPotentialCustomer',
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.inform_students = res.context;
                    };
                }
            });
        }

        //获取全部通知模板
        function getAllTemplate() {
            $.hello({
                url: CONFIG.URL + '/api/oa/notification/template/list',
                type: "get",
                data: { 'pageType': 0 },
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.templateList = res.context;
                    };
                }
            });
        }

        //获取列表信息
        function getInformList(start) {
            var _url = '/api/oa/notification/template/list',
                params = {
                    'searchName': search_name,
                    'start': start,
                    'count': eachPage,
                };
            if ($scope.studNavJud == 1) {
                _url = '/api/oa/notification/list';
                params['beginTime'] = search_time ? search_time.split(' 到 ')[0] + " 00:00:00" : undefined;
                params['endTime'] = search_time ? search_time.split(' 到 ')[1] + " 23:59:59" : undefined;
            }
            $.hello({
                url: CONFIG.URL + _url,
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.informList = res.context.items;
                        informPager(res.context.totalNum);
                    };
                }
            });
        }

        //分页
        function informPager(total) { //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
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
                    if ($scope.firstNav == 1) {
                        getInformList(start);
                    } else if ($scope.firstNav == 2) {
                        getMessageList(start);
                    }
                }
            });

        }

        //模块上下移动
        function moveUpDown(d, index, type, evt) {
            var d_;
            if ($(evt.target).attr('btnType') == 'y') {
                if (type == 1) {
                    d_ = d[index];
                    d[index] = d[index - 1];
                    d[index - 1] = d_;
                } else {
                    d_ = d[index];
                    d[index] = d[index + 1];
                    d[index + 1] = d_;
                }
            }
        }

        //删除通知模板内容
        function delete_informContent(ind, type) {
            var isdelete = layer.confirm('确认删除?', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                switch (type) {
                    case 'content':
                        $scope.informTemplate.content.splice(ind, 1);
                        break;
                }
                $scope.$apply();
                layer.close(isdelete);
            }, function() {
                layer.close(isdelete);
            })
        }

        //添加通知模板内容(文字，图片，视频)
        function add_informContent(type, d,data_source) {
            switch (type) {
                case 'text':
                    $scope.informTemplate.content.push({ type: 'text', value: '' });
                    break;
                case 'img':
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if (d) {
                                d.value = data;
                            } else {
                                $scope.informTemplate.content.push({ type: 'img', value: data });
                            }
                            $scope.$apply();
                        }, { type: 'image/gif, image/jpeg, image/png' , dataSource:data_source});
                    });
                    break;
                case 'video':
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            console.log(data);
                            if (d) {
                                d.value = data;
                                d.value_ = $sce.trustAsResourceUrl(data);
                            } else {
                                $scope.informTemplate.content.push({ 'type': 'video','value': data, 'value_': $sce.trustAsResourceUrl(data) });
                            }
                            $scope.$apply();
                        }, { type: 'video/*' });
                    })
            }
        }

        //按钮操作
        function operationBtn(type, _da, sp) {
            console.log($scope.messageTotleInfo);
            switch (type) {
                // case 1: //短信设置needdel__cz
                //     if(!$scope.messageTotleInfo.smsWarningNum) {
                //         layer.alert('未开通短信功能，请先充值短信', {title:'错误提示', shadeClose: true});
                //         return;
                //     };
                //     //获取分校短信功能基本信息
                //     $.hello({
                //         url: CONFIG.URL + '/api/oa/sms/getShopSmsInfo',
                //         type: "get",
                //         data: {},
                //         success: function(res) {
                //             if(res.status == 200) {
                //                 console.log(res);
                //                 $scope.messageTotleInfo = res.context;
                //                 if($scope.messageTotleInfo) {
                //                     $scope.messageTotleInfo.birthdayTemplate = $scope.messageTotleInfo.birthdayTemplate?$scope.messageTotleInfo.birthdayTemplate:'同学，祝你生日快乐！愿这特殊的日子里，你的每时每刻都充满欢乐。';
                //                 } else {
                //                     $scope.messageTotleInfo = {};
                //                     $scope.messageTotleInfo.birthdayTemplate = '';
                //                 }
                //                 openPopByDiv('短信设置', '.message_early', '760px');
                //             };
                //         }
                //     });
                //     break;
                case 2: //短信充值
                    openPopByDiv('短信充值', '.message_recharge', '760px');
                    dialog_ = dialog;
                    getMessagePayList();
                    break;
                case 3: //短信签名
                    openPopByDiv('短信签名', '.message_qm', '660px');
                    break;
                case 4: //选择收件人（老师或者学员）-发送通知and发送短信
                    if (sp == 'notice') {
                        $scope.informTemplate.peo = _da;
                        $scope.informTemplate.peoType = 1;
                        $scope.$broadcast('inform_teacher', 'clearHeadName', '排除老师', true);
                    } else if (sp == 'message') {
                        $scope.messageTemplate.peo = _da;
                        $scope.messageTemplate.peoType = 1;
                        $scope.$broadcast('inform_teacher_', 'clearHeadName', '排除老师', true);
                    }
                    break;
                case 5: //选择收件范围（老师或者学员）-发送通知and发送短信
                    if (sp == 'notice') {
                        $scope.informTemplate.peoType = _da;
                        if (_da == 1) {
                            $scope.$broadcast('inform_teacher', 'clearHeadName', '排除老师', true);
                        } else if (_da == 3) {
                            $scope.$broadcast('inform_teacher', 'clearHeadName', '选择老师', true);
                        }
                    } else if (sp == 'message') {
                        $scope.messageTemplate.peoType = _da;
                        if (_da == 1) {
                            $scope.$broadcast('inform_teacher_', 'clearHeadName', '排除老师', true);
                        } else if (_da == 3) {
                            $scope.$broadcast('inform_teacher_', 'clearHeadName', '选择老师', true);
                        }
                    }
                    break;
            }
        }

        //列表操作
        function operationList(d, type) {
            darg($('#show_contain')[0]);
            console.log(d, type)
            $scope.informTemplate = {
                title: '',
                date_: $.format.date(new Date(), 'yyyy-MM-dd'),
                content: [{ 'type': 'text', 'value': '' }]
            }
            switch (type) {
                case 1: //新建通知
                    $scope.templateTab = 1;
                    $scope.informTemplate.template = '';
                    $scope.informTemplate.teachers = [];
                    $scope.informTemplate.classList = [];
                    $scope.informTemplate.students = [];
                    $scope.informTemplate.isConfirm = true;
                    $scope.informTemplate.isSendMsg = false;
                    openPopByDiv('发送通知', '.template_pop', '1160px', function(layero) {
                        setTimeout(function() {
                            $(layero).removeClass('layer-anim');
                            $(layero).css({ 'transform': 'scale(1)' });
                        }, 500)
                    }); //打开新建通知
                    break;
                case 2: //编辑通知
                    $scope.templateTab = 2;
                    $scope.informTemplate.id = d.id;
                    $scope.informTemplate.title = d.title;
                    $scope.informTemplate.date_ = $.format.date(d.gmtModified, 'yyyy-MM-dd');
                    $scope.informTemplate.teachers = JSON.parse(d.receiver).teachers ? JSON.parse(d.receiver).teachers : null;
                    $scope.informTemplate.classList = JSON.parse(d.receiver).classes ? JSON.parse(d.receiver).classes : null;
                    $scope.informTemplate.students = JSON.parse(d.receiver).students ? JSON.parse(d.receiver).students : null;
                    $scope.informTemplate.isConfirm = d.needConfirm ? true : false;
                    $scope.informTemplate.isSendMsg = d.channel ? true : false;
                    $scope.informTemplate.ls_lineData = d;
                    handleData(d);
                    angular.forEach($scope.templateList, function(v) { //模板
                        if (v.id == d.templateId) {
                            $scope.informTemplate.template = v;
                        }
                    })
                    openPopByDiv('通知详情', '.template_pop', '1160px', function(layero) {
                        setTimeout(function() {
                            $(layero).removeClass('layer-anim');
                            $(layero).css({ 'transform': 'scale(1)' });
                        }, 500)
                    }); //打开编辑通知
                    break;
                case 3: //删除通知
                    var isdelete = layer.confirm('确认删除?', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/notification/delete",
                            type: "post",
                            data: JSON.stringify({ id: d.id }),
                            success: function(res) {
                                if (res.status == 200) {
                                    pagerRender = false
                                    getInformList(0); //获取列表
                                    console.log(res);
                                };
                            }
                        });
                        layer.close(isdelete);
                    }, function() {
                        layer.close(isdelete);
                    })
                    break;
                case 4: //新建模板
                    $scope.templateTab = 3;
                    openPopByDiv('新建模板', '.template_pop', '1160px', function(layero) {
                        setTimeout(function() {
                            $(layero).removeClass('layer-anim');
                            $(layero).css({ 'transform': 'scale(1)' });
                        }, 500)
                    }); //打开新建模板
                    break;
                case 5: //编辑模板
                    $scope.templateTab = 4;
                    $scope.informTemplate.id = d.id;
                    $scope.informTemplate.title = d.title;
                    $scope.informTemplate.date_ = $.format.date(d.gmtModified, 'yyyy-MM-dd');
                    handleData(d);
                    angular.forEach($scope.templateList, function(v) { //模板
                        if (v.id == d.id) {
                            $scope.informTemplate.template = v;
                        }
                    })
                    openPopByDiv('模板详情', '.template_pop', '1160px', function(layero) {
                        setTimeout(function() {
                            $(layero).removeClass('layer-anim');
                            $(layero).css({ 'transform': 'scale(1)' });
                        }, 500)
                    }); //打开编辑模板
                    break;
                case 6: //删除模板
                    var isdelete = layer.confirm('确认删除?', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/notification/template/delete",
                            type: "post",
                            data: JSON.stringify({ id: d.id }),
                            success: function(res) {
                                if (res.status == 200) {
                                    pagerRender = false
                                    getInformList(0); //获取列表
                                    console.log(res);
                                };
                            }
                        });
                        layer.close(isdelete);
                    }, function() {
                        layer.close(isdelete);
                    })
                    break;
                case 7:
                    SEEINFORM(d);
                    openPopByDiv('收件情况', '.receivingCase', '860px');
                    break;
                case 8:
                    if (!$scope.messageTotleInfo.smsWarningNum) {
                        layer.alert('未开通短信功能，请先充值短信', { title: '错误提示', shadeClose: true });
                        return;
                    };
                    $scope.templateTab = 'messageSend'; //短信发送
                    $scope.messageTemplate = { //发送短信模板数据
                        'content': '',
                        'teacherType': '',
                        'classType': '',
                        'studentType': '',
                        'teachers': [],
                        'classList': [],
                        'students': [],
                        'potials': [],
                    };
                    getSelectList();
                    openPopByDiv('发送短信', '.message_send', '760px');
                    break;
            }
        }

        //处理数据（辅助工具）
        function handleData(d) {
            if (d.content) {
                $scope.informTemplate.content = [];
                angular.forEach(JSON.parse(d.content), function(v) {
                    if (v.content) {
                        $scope.informTemplate.content.push({ 'type': 'text', value: v.content });
                    }
                    if (v.imageUrl) {
                        $scope.informTemplate.content.push({ 'type': 'img', value: v.imageUrl });
                    }
                    if (v.videoUrl) {
                        $scope.informTemplate.content.push({ 'type': 'video', value: v.videoUrl, value_: $sce.trustAsResourceUrl(v.videoUrl) });
                    }
                });
            }
        }

        // 手机滚动效果
        function darg(box) {
            box.onmousewheel = function(e) {
                e.stopPropagation();
                var wheelStep = -e.wheelDelta / 120 * 30;
                box.scrollTop = box.scrollTop + wheelStep;
            }
        };

        //各种点击编辑定位功能
        function positionEle() {
            $('.change_template').on('click', function(event) {
                var _this = $(event.target).closest('.popup_line'); //获取点击元素的属性
                var _this_ = $('#show_contain').find('.' + _this.attr('posEle')); //根据属性寻找所需定位的元素
                if (_this_[0]) { //如果找到该元素则定位到该元素
                    $('#show_contain').scrollTop($('#show_contain').scrollTop() + _this_.offset().top - 100);
                }
            })
        }
        positionEle();

        // $scope.tipShow = function(evt) {needdel__cz
        //     evt.stopPropagation();
        //     $(evt.target).find('.tippaopao').show();
        // };
        // $scope.tipHide = function(evt) {
        //     evt.stopPropagation();
        //     $(evt.target).find('.tippaopao').hide();
        // }
    }]
})