define(["laydate", "echarts", "pagination", "mySelect", "szpUtil", "showJs", "qrcode", 'courseAndClass_sel', 'addInfos', 'potential_pop', 'signUp', 'operation', 'hopetime', 'orderInfo', 'coursePop'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var $searchName, $time; //活动列表搜索字段
        var isLoadTemplate = false;
        var shareHref = window.location.protocol + '//' + window.location.host;
        if (window.location.host == 'www.yizhiniao.com') {
            shareHref = window.location.protocol + '//' + 'm.yizhiniao.com';
        }
        init();

        function init() {
            $scope.studNavJud = 1; //一级导航标识
            $scope.studNavJud_ = ''; //二级导航标识
            $scope.studNavJud_3 = ''; //模板类型标识
            $scope.studNavJud_4 = ''; //模板风格标识
            $scope.studNavJud_5 = ''; //模板节假标识
            getActivityList(0);
            getTemplateList(0);
            $scope.switchStudNav = switchStudNav; //点击切换菜单导航
            $scope.$upDownStatus = null; //上下架筛选
            $scope.screenSel = screenSel; //筛选列表操作
            $scope.$activityStatus = null;
            $scope.$activityStatus = null;
            $scope.$distSwitch = null; //分销筛选
            $scope.nameListThead_1 = [
                { 'name': '类型', 'width': '80px' },
                { 'name': '活动名称', 'width': '40%' },
                { 'name': '分销', 'width': '60px' },
                { 'name': '开始时间', 'width': '120px' },
                { 'name': '结束时间', 'width': '120px' },
                { 'name': '状态', 'width': '15%' },
                { 'name': '有效用户', 'width': '80px' },
                { 'name': '同步微官网', 'width': '80px' },
                { 'name': '操作', 'width': '200px', 'align': 'center' },
            ];
            //模板类型和风格
            $scope.templateTypeList = [
                { 'name': '全部', 'value': '' },
                { 'name': '微传单', 'value': 1 },
                { 'name': '拼团', 'value': 3 },
                { 'name': '抢购', 'value': 2 },
                { 'name': '砍价', 'value': 4 },
                { 'name': '助力', 'value': 5 },
            ];
            $scope.templateTypeList_ = [
                { 'name': '微传单', 'value': 1 },
                { 'name': '拼团', 'value': 3 },
                { 'name': '抢购', 'value': 2 },
                { 'name': '砍价', 'value': 4 },
                { 'name': '助力', 'value': 5 },
            ];
            $scope.changeType = function(data) {
                if (data == null) {
                    $scope.studNavJud_ = '';
                } else {
                    $scope.studNavJud_ = data.value;
                }
                pagerRender = false;
                getActivityList(0);
            }
            getTemplateStyleList(); //获取模板风格列表
            $scope.selectInfoNameId = 1;
            $scope.kindSearchData = {
                1: '活动名称',
            };
            $scope.SearchData = SearchData;
            $scope.Enterkeyup = SearchData;
            $scope.onReset = function() { //重置
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                $scope.kindSearchOnreset(); //调取app重置方法
                $('#activityTime').val('');
                $searchName = undefined;
                $scope.studNavJud_ = undefined;
                $scope.$upDownStatus = null;
                $scope.$activityStatus = null;
                $scope.$distSwitch = null;
                pagerRender = false;
                getActivityList(0);
            }
            $scope.templateTab = 2; //活动模板tab
            $scope.operation = operation; //列表操作
            $scope.addTemplate = addTemplate; //创建模板
            $scope.clickShareCopy = clickShareCopy; //点击分享复制按钮
            $scope.seeDataBrowsing = seeDataBrowsing; //查看活动数据
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.closeLayer = function(type) {
                switch (type) {
                    case 'dataBrowsing':
                        window.showTimer = false;
                        layer.close(dialog);
                        break;
                }
            };
        }
        //获取筛选列表模板风格列表数据
        function getTemplateStyleList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/show/listTag",
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        res.context.unshift({ 'tagName': '全部', 'tagId': '' });
                        $scope.templateStyleList_2 = res.context;
                    };
                }
            });
        }
        //筛选列表操作
        function screenSel(e, type, val) {
            switch (type) {
                case '$distSwitch':
                    $scope[type] = e.target.checked ? 1 : null;
                    break;
                case '$activityStatus':
                    if (e.target.checked) { $scope[type] = val } else { $scope[type] = null };
                    $scope.$upDownStatus = null;
                    break;
                case '$upDownStatus':
                    if (e.target.checked) { $scope[type] = val } else { $scope[type] = null };
                    $scope.$activityStatus = null;
                    break;
            }
            pagerRender = false;
            getActivityList(0);
        }

        function clickShareCopy() {
            copyToClipboard($('#shareCopyText_')[0]);
            layer.msg('复制成功')
        }

        //点击创建、修改、复制、查看模板
        function addTemplate(d, type) {
            window.open(shareHref + '/show/#/?id=' + d.activityId + "&token=" + localStorage.getItem('oa_token') + "&systemType=2" + '&mode=' + (type == "add" || type == "copy" ? 1 : 2))
        }

        //点击编辑复制删除按钮
        function operation(type, d) {
            $scope.operationLine = angular.copy(d);
            console.log(d)
            if (type == 5 || type == 6 || type == 7) { //如果是点击上下架、同步家长端、同步微官网
                var t_ = '',
                    p_, d_, url = type == 5 ? '/api/oa/show/upDownActivity' : type == 6 ? "" : "/api/oa/show/modifyWebStatus";
                switch (type) {
                    case 5:
                        t_ = d.upDownStatus == 1 ? '活动下架后，保留活动数据，将不能再参加该活动，确定下架该活动吗？' : '确定要发布该活动吗';
                        p_ = { 'activityId': d.activityId, 'upDownStatus': d.upDownStatus == 1 ? -1 : 1 };
                        d_ = ['upDownStatus', d.upDownStatus == 1 ? -1 : 1]; //标识要修改的字段和值
                        break;
                    case 6:
                        if (d.upDownStatus == -1) {
                            layer.msg('该活动已下架');
                            return;
                        }
                        t_ = d.synchronization ? '该活动确定要取消同步到家长端吗？' : '该活动确定要同步到家长端吗？';
                        p_ = { 'activityId': d.activityId, 'synchronization': d.synchronization ? 0 : 1 };
                        d_ = ['synchronization', d.synchronization ? 0 : 1];
                        break;
                    case 7:
                        if (d.upDownStatus == -1) {
                            layer.msg('该活动已下架');
                            return;
                        }
                        t_ = d.syncWebStatus ? '该活动确定要取消同步到微官网吗？' : '该活动确定要同步到微官网吗？';
                        p_ = { 'activityId': d.activityId, 'syncWebStatus': d.syncWebStatus ? 0 : 1 };
                        d_ = ['syncWebStatus', d.syncWebStatus ? 0 : 1];
                        break;
                }

                detailMsk(t_, function() {
                    $.hello({
                        url: CONFIG.URL + url,
                        type: 'post',
                        data: JSON.stringify(p_),
                        success: function(data) {
                            if (data.status == "200") {
                                layer.msg('更改完成');
                                getActivityList(start);
                            }
                            if (type == 5 && d.upDownStatus != 1 && data.status == "206") {
                                var isCall = layer.confirm(data.message, {
                                    title: "确认信息",
                                    skin: 'newlayerui layeruiCenter',
                                    closeBtn: 1,
                                    offset: '30px',
                                    move: false,
                                    area: '560px',
                                    btn: ['确认', '取消'] //按钮
                                }, function() {
                                    p_["checkTime"] = -1;
                                    $.hello({
                                        url: CONFIG.URL + url,
                                        type: 'post',
                                        data: JSON.stringify(p_),
                                        success: function(data) {
                                            if (data.status == "200") {
                                                layer.msg('更改完成');
                                                getActivityList(start);
                                            }
                                        }
                                    });
                                }, function() {
                                    layer.close(isCall);
                                });
                                return true;
                            }
                        }
                    });
                })
                return;
            };

            $.hello({
                url: CONFIG.URL + "/api/oa/show/activityDetail",
                type: "get",
                data: { activityId: d.activityId },
                success: function(res) {
                    if (res.status == 200) {
                        res.context.templateImageUrl = res.context.activityTemplate ? res.context.activityTemplate.templateImageUrl : ''; //把url赋值给外面
                        switch (type) {
                            case 1:
                                addTemplate(res.context, 'edit');
                                break; //修改
                            case 2:
                                addTemplate(res.context, 'copy');
                                break; //复制
                            case 3: //删除
                                var isCall = layer.confirm('确认删除活动： ' + d.activityName + '？', {
                                    title: "确认信息",
                                    skin: 'newlayerui layeruiCenter',
                                    closeBtn: 1,
                                    offset: '30px',
                                    move: false,
                                    area: '560px',
                                    btn: ['是', '否'] //按钮
                                }, function() {
                                    $.hello({
                                        url: CONFIG.URL + '/api/oa/show/deleteActivity',
                                        type: 'post',
                                        data: JSON.stringify({
                                            'activityId': d.activityId
                                        }),
                                        success: function(data) {
                                            if (data.status == "200") {
                                                layer.msg('删除完成');
                                                pagerRender = false;
                                                getActivityList(0);
                                            }
                                        }
                                    });
                                    layer.close(isCall);
                                }, function() {
                                    layer.close(isCall);
                                });
                                break;
                            case 4:
                                addTemplate(res.context, 'see');
                                break; //查看
                        }
                    };
                }
            });
        }

        // //预约活动列表（预约、砍价、助力、拼团）
        function getActivityList(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                'start': start_,
                'count': eachPage,
                'activityName': $searchName ? $searchName : undefined,
                'beginTime': $time ? $time.split(' 到')[0] + ' 00:00:00' : undefined,
                'endTime': $time ? $time.split(' 到')[1] + ' 23:59:59' : undefined,
                'activityType': $scope.studNavJud_ ? $scope.studNavJud_ : undefined,
                'upDownStatus': $scope.$upDownStatus ? $scope.$upDownStatus : undefined,
                'distSwitch': $scope.$distSwitch ? $scope.$distSwitch : undefined,
                'activityStatus': $scope.$activityStatus ? $scope.$activityStatus : undefined
            }
            $.hello({
                // url: CONFIG.URL + "/api/oa/activity/list",
                url: CONFIG.URL + "/api/oa/show/listActivity",
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        $scope.activityList = res.context.items;
                        renderPager_activity(res.context.totalNum, $('.M-box3_1'));
                    };
                }
            });
        }

        function renderPager_activity(total, el) { //分页
            if (pagerRender)
                return;
            pagerRender = true;
            var $M_box3 = el;
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
                    getActivityList(start); //回调
                }
            });
        }

        function getTemplateList(start, spType) {
            var params;
            if (spType) { //如果是更换模板列表里面的模板
                params = {
                    'start': 0,
                    'count': 100,
                    'activityType': spType,
                }
            } else {
                params = {
                    'start': 0,
                    'count': 100,
                    'activityType': $scope.studNavJud_3 ? $scope.studNavJud_3 : undefined,
                    // 'searchType': $scope.studNavJud_4 ? $scope.studNavJud_4 : undefined,
                    // 'activityStyleId': $scope.studNavJud_4 ? $scope.studNavJud_4 : undefined,
                    'tagId': $scope.studNavJud_5 ? $scope.studNavJud_5 : undefined,
                }
            }
            $.hello({
                // url: CONFIG.URL + "/api/oa/activity/listTemplate",
                url: CONFIG.URL + "/api/oa/show/listTemp",
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        if (spType) {
                            $scope.templateList_ = res.context.items;
                        } else {
                            $scope.templateList = res.context.items;
                            setTimeout(function() {
                                $('.show_template li').hover(function() {
                                    $(this).find('dd').show()
                                }, function() {
                                    $(this).find('dd').hide()
                                });
                                angular.forEach($scope.templateList, function(val, ind) {
                                    $('#templateCode_' + ind).html('');
                                    jQuery('#templateCode_' + ind).qrcode({
                                        render: "canvas", //也可以替换为table
                                        width: 100,
                                        height: 100,
                                        text: shareHref + '/show_h5/#/index?client=tem&&id=' + val.activityId
                                    });
                                })
                            })
                        }
                    };
                }
            });
        }

        function SearchData(data) {
            $searchName = data.value;
            pagerRender = false;
            getActivityList(0);
        }
        //点击切换导航和菜单栏筛选
        function switchStudNav(d, type) {
            pagerRender = false;
            switch (type) {
                case 1: //一级菜单
                    $scope.studNavJud = d;
                    if (d == 3) {
                        $state.go('showactivity')
                        return;
                    }
                    if (d == 1) {
                        getActivityList(0); //调取预约活动列表
                    } else {
                        getTemplateList(0); //调取预约活动模板
                    };
                    break;
                case 2: //二级菜单
                    $scope.studNavJud_ = d;
                    $scope.$upDownStatus = null;
                    getActivityList(0);
                    break;
                case 3: //三级菜单
                    $scope.studNavJud_3 = d;
                    getTemplateList(0); //调取预约活动模板
                    break;
                case 4: //四级菜单-风格
                    $scope.studNavJud_4 = d;
                    getTemplateList(0); //调取预约活动模板
                    break;
                case 5: //四级菜单-节假
                    $scope.studNavJud_5 = d;
                    getTemplateList(0); //调取预约活动模板
                    break;
            }
        }

        function copyToClipboard(elem) { //点击复制按钮
            var targetId = "_hiddenCopyText_";
            var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
            var origSelectionStart, origSelectionEnd;
            if (isInput) {
                target = elem;
                origSelectionStart = elem.selectionStart;
                origSelectionEnd = elem.selectionEnd;
            } else {
                target = document.getElementById(targetId);
                if (!target) {
                    var target = document.createElement("textarea");
                    target.style.position = "absolute";
                    target.style.left = "-9999px";
                    target.style.top = "0";
                    target.id = targetId;
                    document.body.appendChild(target);
                }
                target.textContent = elem.textContent;
            }
            var currentFocus = document.activeElement;
            target.focus();
            target.setSelectionRange(0, target.value.length);

            var succeed;
            try {
                succeed = document.execCommand("copy");
            } catch (e) {
                succeed = false;
            }
            if (currentFocus && typeof currentFocus.focus === "function") {
                currentFocus.focus();
            }

            if (isInput) {
                elem.setSelectionRange(origSelectionStart, origSelectionEnd);
            } else {
                target.textContent = "";
            }
            return succeed;
        };


        /*-----------查看活动数据-----------*/
        function seeDataBrowsing(d, browsingShow) {
            $scope.timeTypes = [
                { name: '按日', type: 0 },
                { name: '按周', type: 1 }
            ]
            SEEACTIVITYDATA(d, browsingShow);
            openPopByDiv("数据概览(" + $scope.browsing_lineData.activityName + ")", "#show_dataBrowsing", "960px")
        }

        function SEEACTIVITYDATA(d, browsingShow) {
            getlistCourse();
            $scope.detailType = d.activityType;
            var searchType, searchName; //筛选变量
            // var pagerRender_act = false,
            //     start_act = 0,
            //     eachPage_act = localStorage.getItem('actBrowsing') ? localStorage.getItem('actBrowsing') : 10; //页码初始化
            // 拼团状态筛选下拉
            $scope.actions_group = [
                { name: "拼团成功", value: 1 },
                { name: "拼团中", value: 2 },
                { name: "拼团失败", value: -1 },
            ];
            // 助力状态筛选下拉
            $scope.actions_help = [
                { name: "助力成功", value: 1 },
                { name: "助力中", value: 2 },
                { name: "助力失败", value: 3 },
            ];
            // 状态
            $scope.screen_activitySuccess = null;

            $scope.ListProduct = []; //商品下拉数据
            // 商品筛选
            $scope.screen_contentId = null;

            $scope.prizeUseStatus = null;
            // 新老潜客
            $scope.potentialCustomerType = null;
            $scope.groupStatus = null;
            $scope.browsing_lineData = d; //点击数据按钮的整条活动信息
            console.log(d)
            $scope.browsingShow = browsingShow ? browsingShow : 1; //1:数据总览 2：有效用户 3：拼团列表 4: 报名情况 5：分销汇总

            $scope.browsingNav = browsingNav; //点击切换查看数据tab
            $scope.overViewMapTab = { type: 0, name: '有效用户', timeType: 0 }; //数据统计图tab标记
            // $scope.overViewMapTime = ''; //数据统计图时间选择
            $scope.overViewMapTime =
                $.format.date(d.beginTime, "yyyy-MM-dd") +
                " 至 " +
                $.format.date(
                    new Date(d.endTime) > new Date(new Date()) ?
                    new Date() :
                    d.endTime, "yyyy-MM-dd");
            $scope.getOverViewTrendData = getOverViewTrendData; //点击切换查看数据统计图tab
            $scope.browsing_showPeoInfo = browsing_showPeoInfo; //点击查看用户信息
            $scope.browsing_viewOrder = browsing_viewOrder; //打开订单详情
            $scope.changeStatus = changeStatus; //更改使用状态
            $scope.browsing_operate = browsing_operate; //各种骚操作
            $scope.operatePop = operatePop; //操作弹框
            getListProduct();
            if (browsingShow) {
                browsingNav(6)
            } else {
                getOverViewData(); //获取总浏览数据
                getOverViewTrendData(0, '有效用户');
            }

            $scope.searchData_browsing = {
                1: '姓名、联系方式',
            };
            $scope.selectInfoNameId_browsing = '1'; //select初始值
            $scope.SearchData_browsing = SearchData_browsing; //点击搜索
            $scope.changeState = changeState; //点击label搜索
            $scope.actData_onReset = function(type) { //重置
                searchType = undefined;
                searchName = undefined;
                if (type == 'pintuan') {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    };
                    $scope.potentialCustomerType = null;
                    $scope.screen_contentId = undefined;
                    $scope.screen_activitySuccess = undefined;
                    getlistGroup();
                } else if (type == 'valid') {
                    $scope.kindSearchOnreset(); //调取app重置方法
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    };
                    $scope.potentialCustomerType = null;
                    $scope.screen_contentId = undefined;
                    $scope.screen_activitySuccess = undefined;
                    getBrowsingPeoData();
                }

            };

            $scope.browsingFun = {
                operate: function(type, props) {
                    switch (type) {
                        case 1: //订单详情
                            window.$rootScope.yznOpenPopUp($scope, 'order-info', 'orderInfo', '960px', props);
                            break;
                        case 2: //关联订单
                            var param = {
                                'item': {},
                                'fromPaytreasure': props,
                                'title': '报名',
                                'location': "outside",
                            };
                            window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                            break;
                        case 3: //退款详情
                            $scope.groupFailDetail = {};
                            $.hello({
                                url: CONFIG.URL + "/api/onlinePayment/refunsInfo",
                                type: "get",
                                data: {
                                    orderId: props.orderId
                                },
                                success: function(res) {
                                    if (res.status == '200') {
                                        $scope.groupFailDetail = res.context;
                                    };
                                }
                            });
                            openPopByDiv("退款详情", ".groupFailDetail", "380px");
                            break;
                    }
                }
            };

            //加载图表时间选择器
            setTimeout(function() {
                laydate.render({
                    elem: '#overViewTime', //指定元素
                    isRange: false,
                    range: '至',
                    done: function(value) {
                        $scope.overViewMapTime = value;
                        getOverViewTrendData($scope.overViewMapTab.type, $scope.overViewMapTab.name);
                    }
                });
            });

            //各种骚操作
            function browsing_operate(d_, type) {
                switch (type) {
                    case 1: //导出有效用户
                        var params = {
                            activityId: d.activityId,
                            searchName: searchName,
                            potentialCustomerType: $scope.potentialCustomerType != null ? $scope.potentialCustomerType : undefined,
                            contentId: $scope.screen_contentId ? $scope.screen_contentId : undefined,
                            activitySuccess: $scope.screen_activitySuccess ? $scope.screen_activitySuccess : undefined
                        };
                        window.open(CONFIG.URL + '/api/oa/statistics/exportShowListJoin?' + 'token=' + localStorage.getItem('oa_token') + "&" + $.param(params));
                        break;
                    case 2: //导出拼团列表
                        var params = {
                            searchType: "appSearchName",
                            searchName: searchName,
                            activityId: d.activityId,
                            contentId: $scope.screen_contentId,
                            activitySuccess: $scope.screen_activitySuccess
                        };
                        window.open(CONFIG.URL + '/api/oa/statistics/consultantListGroup?' + 'token=' + localStorage.getItem('oa_token') + "&" + $.param(params));
                        break;
                    case 3: //导出分销汇总
                        var params = {
                            searchName: searchName,
                            activityId: d.activityId,
                            searchType: "appSearchName",
                            newVersion: true,
                        };
                        window.open(CONFIG.URL + '/api/oa/statistics/exportReferralRecord?' + 'token=' + localStorage.getItem('oa_token') + "&" + $.param(params));
                        break;
                }
            }

            function operatePop(x, t) {
                $scope.referralInfo = angular.copy(x);
                switch (t) {
                    case 3:
                        var param = {
                            activityId: d.activityId,
                            referrerId: x.potentialCustomerId,
                            type: "1"
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/referral/listEffectiveInviterActivity",
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
                            activityId: d.activityId,
                            referrerId: x.potentialCustomerId,
                            signed: 1,
                            type: "2"
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/referral/listEffectiveInviterActivity",
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
                    default:
                        break;
                }
            }
            //更改用户使用状态
            function changeStatus(d) {
                var isNo = layer.confirm('是否将“未使用”状态修改为“使用”状态，修改后无法还原？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/activity/updatePrizeUseStatus',
                        type: 'post',
                        data: JSON.stringify({
                            'prizeUseStatus': 1,
                            'activityJoinId': d.activityJoinId
                        }),
                        success: function(data) {
                            if (data.status == "200") {
                                pagerRender_act = false;
                                getBrowsingPeoData(0);
                                layer.msg('操作完成', { icon: 1 });
                            }
                        }
                    });
                    layer.close(isNo);
                }, function() {
                    layer.close(isNo);
                })
            }

            //打开订单详情
            function browsing_viewOrder(id, width, props, type) {
                var isDetail_;
                if (id == 2) { //退款操作
                    var param = {
                        'page': 0,
                        'item': width,
                        'tab': 1,
                        'from': 'st'
                    };
                    if (type == 'kanjia') {
                        param['item'] = d.potentialCustomer;
                    };
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', param);
                } else if (id == 3) { //手动生成订单操作
                    isDetail_ = layer.confirm('确定手动生成订单？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/activity/generateOrder",
                            type: "post",
                            data: JSON.stringify({ 'activityJoinId': width.activityJoinId }),
                            success: function(res) {
                                if (res.status == '200') {
                                    pagerRender_act = false;
                                    getBrowsingPeoData(0);
                                    if ($scope.dialog) layer.close($scope.dialog);
                                    window.$rootScope.yznOpenPopUp($scope, 'order-info', 'orderInfo', '960px', { data: res.context, page: '订单管理', 'sourceType': 0 });
                                };
                            }
                        });
                        layer.close(isDetail_);
                    }, function() {
                        layer.close(isDetail_);
                    });
                } else if (id == 4) { //退款详情
                    $scope.groupFailDetail = {};
                    $.hello({
                        url: CONFIG.URL + "/api/onlinePayment/refunsInfo",
                        type: "get",
                        data: {
                            orderId: width.orderId
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.groupFailDetail = res.context;
                            };
                        }
                    });
                    openPopByDiv("退款详情", ".groupFailDetail", "380px");
                } else {
                    window.$rootScope.yznOpenPopUp($scope, 'order-info', id, width, props);
                }
            }

            //点击查看用户信息
            function browsing_showPeoInfo(d, type) {
                var param = {
                    'page': 0,
                    'item': d,
                    'tab': 1
                };
                if (type == 'kanjia') {
                    param['item'] = d.potentialCustomer;
                };
                window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', param);
            }

            //点击搜索数据
            function SearchData_browsing(data, type) {
                searchType = data ? data.type : undefined;
                searchName = data ? data.value : undefined;
                if (type == 'pintuan') {
                    //拼团
                    getlistGroup();
                } else if (type == 'valid') {
                    getBrowsingPeoData();
                } else if (type == 'fenxiao') {
                    getlistReferralRecord();
                }
            };

            //点击label搜索
            function changeState(evt, type) {
                //新潜客老潜客-已使用未使用
                switch (type) {
                    case 1:
                        $scope.potentialCustomerType = evt.target.checked ? 1 : null;
                        break; //新潜客
                    case 2:
                        $scope.potentialCustomerType = evt.target.checked ? 2 : null;
                        break; //老潜客
                    case 3:
                        $scope.prizeUseStatus = evt.target.checked ? 0 : null;
                        break; //未使用
                    case 4:
                        $scope.prizeUseStatus = evt.target.checked ? 1 : null;
                        break; //已使用
                    case 5:
                        $scope.groupStatus = evt.target.checked ? 0 : null;
                        break; //拼团中
                    case 6:
                        $scope.groupStatus = evt.target.checked ? 1 : null;
                        break; //拼团成功
                    case 7:
                        $scope.groupStatus = evt.target.checked ? 2 : null;
                        break; //未成功
                }
                getBrowsingPeoData(0);
            }

            //点击切换tab
            function browsingNav(type) {
                $scope.browsingShow = type;
                searchType = undefined;
                searchName = undefined;
                $scope.potentialCustomerType = null;
                $scope.screen_contentId = undefined;
                $scope.screen_activitySuccess = undefined;

                switch (type) {
                    case 1: //数据汇总
                        getOverViewData();
                        getOverViewTrendData(0, '有效用户');
                        break;
                    case 2: //有效用户
                        getBrowsingPeoData();
                        break;
                    case 3: //拼团列表
                        getlistGroup();
                        break;
                    case 4: //报名情况
                        getlistCourse();
                        break;
                    case 5: //转介绍汇总
                        $scope.searchData_browsing_jies = {
                            studentName: '推荐人姓名、联系方式',
                        };
                        $scope.selectInfoNameId_browsing_jies = 'studentName'; //select初始值
                        getlistReferralRecord();
                        break;
                    case 6:
                        // shareHref = "https://test.yizhiniao.com";
                        $scope.discontentUrl_ = shareHref + '/show_h5/#/index?id=' + d.activityId;
                        setTimeout(() => {
                            $('#shareCode_').html('');
                            jQuery('#shareCode_').qrcode({
                                render: "canvas", //也可以替换为table
                                width: 120,
                                height: 120,
                                text: $scope.discontentUrl_
                            });
                        }, 100);
                        $scope.openLink = function(val) {
                            window.open(shareHref + '/show/#/?id=' + d.activityId + "&token=" + localStorage.getItem('oa_token') + "&systemType=2" + '&mode=' + val)
                        }
                        break;
                }
            }

            //获取拼团详情列表
            function getBrowsingPT(id) {
                $.hello({
                    url: CONFIG.URL + "/api/onlinePayment/paymentBill/info",
                    type: "get",
                    data: { 'paymentBillId': id },
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.browsingPTList = res.context;
                        };
                    }
                });
            };
            $scope.searchByHandle = searchByHandle;
            $scope.gototheUserList = function(data) {
                if (data.soldCopies == 0) return;
                if (data.activityPrizeId) {
                    $scope.deafautPrizeId = data.prizeName;
                    $scope.browsingShow = 2;
                    pagerRender_act = false;
                    getBrowsingPeoData(0, data.activityPrizeId);
                }
            };
            //重置操作
            function searchByHandle(val, key, type, key_) {
                $scope[key] = val ? val[key_ ? key_ : 'value'] : undefined;
                if (type == 2) { //有效用户
                    getBrowsingPeoData();
                }
                if (type == 3) { //拼团列表
                    getlistGroup();
                }
            }
            //获取报名情况
            function getlistCourse() {
                var params = {
                    'activityId': d.activityId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/show/listEnroll",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.courseDataList = res.context;
                        };
                    }
                });
            }
            //获取有效用户数据
            function getBrowsingPeoData() {
                var params = {
                    activityId: d.activityId,
                    searchName: searchName,
                    potentialCustomerType: $scope.potentialCustomerType != null ? $scope.potentialCustomerType : undefined,
                    contentId: $scope.screen_contentId ? $scope.screen_contentId : undefined,
                    activitySuccess: $scope.screen_activitySuccess ? $scope.screen_activitySuccess : undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/show/listJoin",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.overViewDataList = res.context;
                        };
                    }
                });
            };
            // 获取商品下拉框数据
            function getListProduct() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/show/listProduct",
                    type: "get",
                    data: { activityId: d.activityId },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.ListProduct = data.context;
                        };
                    }
                })
            }
            // 获取拼团列表
            function getlistGroup() {
                var params = {
                    searchType: "appSearchName",
                    searchName: searchName,
                    activityId: d.activityId,
                    contentId: $scope.screen_contentId,
                    activitySuccess: $scope.screen_activitySuccess
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/show/listGroup",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            var list = [];
                            data.context.list.map(function(item) {
                                item.showActivityJoinList.map(function(ceil, index) {
                                    ceil.rows = index == 0 ? item.showActivityJoinList.length : false;
                                    ceil.productName = item.productName;
                                    ceil.activitySuccess = item.activitySuccess;
                                    list.push(ceil)
                                })
                            })
                            $scope.listGroup = list;

                        };
                    }
                })
            }

            function getlistReferralRecord() {
                var params = {
                    searchName: searchName,
                    activityId: d.activityId,
                    searchType: "appSearchName",
                    newVersion: true,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/referral/listReferralRecord",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.referralList = data.context;
                        };
                    }
                })
            }

            //获取总览数据
            function getOverViewData() {
                $.hello({
                    // url: CONFIG.URL + "/api/oa/activity/getActivityPandect",
                    url: CONFIG.URL + "/api/oa/show/overview",
                    type: "get",
                    data: { 'activityId': d.activityId },
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.overViewData = res.context;
                        };
                    }
                });
            };

            //获取活动趋势图
            function getOverViewTrendData(type, mapName) {
                $scope.overViewMapTab.type = type;
                $scope.overViewMapTab.name = mapName;
                var params = {
                    'activityId': $scope.browsing_lineData.activityId,
                    'type': type,
                    'timeType': $scope.overViewMapTab.timeType
                };

                if ($scope.overViewMapTime) {
                    params['beginTime'] = $scope.overViewMapTime.split(' 至 ')[0] + ' 00:00:00';
                    params['endTime'] = $scope.overViewMapTime.split(' 至 ')[1] + ' 23:59:59';
                };

                $.hello({
                    // url: CONFIG.URL + "/api/oa/activity/getActivityTrend",
                    url: CONFIG.URL + "/api/oa/show/overviewByDate",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            var dataAxis = [];
                            var dataName = [];
                            var dataSeries = {
                                name: mapName,
                                type: 'line',
                                data: [],
                                itemStyle: {
                                    normal: {
                                        color: '#f77c80',
                                        label: {
                                            show: true,
                                        }
                                    },
                                },
                            };
                            angular.forEach(res.context, function(val) {
                                let date;
                                if ($scope.overViewMapTab.timeType == 1) {
                                    date = $.format.date(val.weekBeginDate, "MM-dd") + ' - ' + $.format.date(val.weekEndDate, "MM-dd")
                                }
                                dataAxis.push(date ? date : val.date);
                                dataName.push(val.num);
                                dataSeries.data.push(val.num);
                            });

                            echart(dataAxis, dataName, dataSeries);
                        };
                    }
                });
            }

            //趋势图
            function echart(dataAxis, dataName, dataSeries) {
                // 基于准备好的dom，初始化echarts实例
                var worldMapContainer = document.getElementById('mainechart');
                //用于使chart自适应高度和宽度,通过窗体高宽计算容器高宽
                var resizeWorldMapContainer = function() {
                    worldMapContainer.style.width = $('.mainechart').width() + 'px';
                };
                //设置容器高宽
                resizeWorldMapContainer();
                // 基于准备好的dom，初始化echarts实例
                var myChart2 = echarts.init(worldMapContainer);
                // 指定图表的配置项和数据
                var option = {
                    legend: {
                        data: dataName,
                        type: 'scroll',
                        orient: 'vertical',
                        x: 'right',
                        y: '30',
                        bottom: 40,
                        selectedMode: 'single',
                        width: worldMapContainer.style.width
                    },
                    tooltip: {
                        trigger: 'axis',
                        position: function(point, params, dom, rect, size) {
                            return setTooltipPosition(point, params, dom, rect, size);
                        },
                    },
                    calculabel: true,
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: dataAxis,
                        splitLine: {
                            show: true
                        },
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                type: 'solid',
                                color: '#aaa', //左边线的颜色
                                width: '1' //坐标线的宽度
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#444'
                            },
                        }
                    },
                    yAxis: [{
                        type: "value",
                        minInterval: 1,
                        axisTick: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                type: 'solid',
                                color: '#aaa', //左边线的颜色
                                width: '1' //坐标线的宽度
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#444'
                            },
                        }
                    }],
                    dataZoom: {
                        type: "slider",
                        show: dataSeries.length > 60 ? false : true,
                        startValue: 0,
                        endValue: 60,
                        handleSize: '0',
                        zoomLock: false,
                        height: 24
                    },
                    series: dataSeries
                };
                //清空画布，防止缓存
                myChart2.clear();
                // 使用刚指定的配置项和数据显示图表。
                myChart2.setOption(option);
                //用于使chart自适应高度和宽度
                window.addEventListener("resize", function() {
                    resizeWorldMapContainer();
                    myChart2.resize();
                });
            }
        }
    }]
});