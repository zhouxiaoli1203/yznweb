define(["laydate", "echarts", "pagination", "mySelect", "szpUtil", "showJs", "qrcode", 'courseAndClass_sel', 'addInfos', 'potential_pop', 'signUp', 'operation', 'hopetime', 'orderInfo', 'coursePop'], function(laydate, echarts) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var $searchName, $searchType, $time; //活动列表搜索字段
        var isLoadTemplate = false;
        var shareHref = window.location.protocol + '//' + window.location.host;
        if (window.location.host == 'www.yizhiniao.com') {
            shareHref = window.location.protocol + '//' + 'm.yizhiniao.com';
        }
        init();
        /*
         * 用于token过期预存草稿的回调
         */
        window.callBackFun = function() {
            if ($scope.templateTab == 2 && $scope.templateData && $scope.clickLineData) showDraft($scope.templateData, $scope.clickLineData.templateImageUrl, 1); //备注：当模板弹框正在编辑的页面关闭预存草稿
        };

        function init() {
            $scope.studNavJud = 1; //一级导航标识
            $scope.studNavJud_ = 5; //二级导航标识
            $scope.studNavJud_3 = ''; //模板类型标识
            $scope.studNavJud_4 = ''; //模板风格标识
            $scope.studNavJud_5 = ''; //模板节假标识
            getActivityList(0);
            getTemplateList(0);
            $scope.switchStudNav = switchStudNav; //点击切换菜单导航
            $scope.$upDownStatus = null; //上下架筛选
            $scope.screenSel = screenSel; //筛选列表操作
            $scope.nameListThead_1 = [
                { 'name': '活动名称', 'width': '25%' },
                { 'name': '开始时间', 'width': '25%' },
                { 'name': '结束时间', 'width': '25%' },
                { 'name': '有效用户', 'width': '10%' },
                { 'name': '状态', 'width': '15%' },
                { 'name': '允许转介绍', 'width': '80px', 'align': 'center' },
                { 'name': '同步微官网', 'width': '80px' },
                { 'name': '操作', 'width': '220px', 'align': 'center' },
            ];
            $scope.nameListThead = [
                { 'name': '活动名称', 'width': '25%' },
                { 'name': '开始时间', 'width': '25%' },
                { 'name': '结束时间', 'width': '25%' },
                { 'name': '有效用户', 'width': '10%' },
                { 'name': '状态', 'width': '15%' },
                { 'name': '同步微官网', 'width': '80px' },
                { 'name': '操作', 'width': '220px', 'align': 'center' },
            ];
            //砍价活动列表
            $scope.nameListThead_2 = [
                { 'name': '活动名称', 'width': '170px', 'padding': '0' },
                { 'name': '开始时间', 'width': '122px' },
                { 'name': '结束时间', 'width': '122px' },
                { 'name': '有效用户', 'width': '33%', 'align': 'center' },
                { 'name': '使用人数', 'width': '33%', 'align': 'center' },
                { 'name': '状态', 'width': '33%' },
                // {'name': '同步家长端','width': '80px'},
                { 'name': '同步微官网', 'width': '80px' },
                { 'name': '操作', 'width': '220px', 'align': 'center' },
            ];
            //助力活动列表
            $scope.nameListThead_3 = [
                { 'name': '活动名称', 'width': '170px', 'padding': '0' },
                { 'name': '开始时间', 'width': '122px' },
                { 'name': '结束时间', 'width': '122px' },
                { 'name': '有效用户', 'width': '25%', 'align': 'center' },
                { 'name': '成功人数', 'width': '25%', 'align': 'center' },
                { 'name': '使用人数', 'width': '25%', 'align': 'center' },
                { 'name': '状态', 'width': '25%' },
                // {'name': '同步家长端','width': '80px'},
                { 'name': '同步微官网', 'width': '80px' },
                { 'name': '操作', 'width': '220px', 'align': 'center' },
            ];
            //拼团活动列表
            $scope.nameListThead_4 = [
                { 'name': '活动名称', 'width': '170px', 'padding': '0' },
                { 'name': '开始时间', 'width': '122px' },
                { 'name': '结束时间', 'width': '122px' },
                { 'name': '有效用户', 'width': '25%', 'align': 'center' },
                { 'name': '成团人数', 'width': '25%', 'align': 'center' },
                { 'name': '状态', 'width': '25%' },
                { 'name': '同步微官网', 'width': '80px' },
                { 'name': '操作', 'width': '220px', 'align': 'center' },
            ];
            //模板类型和风格
            $scope.templateTypeList = [
                { 'name': '全部', 'value': '' },
                { 'name': '微传单', 'value': 5 },
                // {'name': '预约', 'value': 1},
                { 'name': '砍价', 'value': 2 },
                { 'name': '助力', 'value': 3 },
                { 'name': '拼团', 'value': 4 },
                { 'name': '抢购', 'value': 6 },
            ];
            getTemplateStyleList(); //获取模板风格列表
            $scope.selectInfoNameId = 1;
            $scope.kindSearchData = {
                1: '活动名称',
            };
            $scope.screen_type = [
                { 'name': '预约', 'value': '1' },
            ];
            $scope.SearchData = SearchData;
            $scope.Enterkeyup = SearchData;
            $scope.onReset = function() { //重置
                $scope.kindSearchOnreset(); //调取app重置方法
                $('#activityTime').val('');
                $searchName = undefined;
                $searchType = undefined;
                $time = undefined;
                $scope.$upDownStatus = null;
                pagerRender = false;
                getActivityList(0);
            }
            $scope.templateTab = 2; //活动模板tab
            $scope.operation = operation; //列表操作
            $scope.addTemplate = addTemplate; //创建模板
            $scope.delete_organInfo = delete_organInfo; //删除校区信息
            $scope.add_organInfo = add_organInfo; //添加校区信息
            $scope.delete_showCourse = delete_showCourse; //删除需要展示的课程
            $scope.add_showCourse = add_showCourse; //添加需要展示的课程
            $scope.gotoSetShowCourse = gotoSetShowCourse; //立刻设置展示课程（跳转）
            $scope.submit_template = submit_template; //提交模板
            $scope.clickShareCopy = clickShareCopy; //点击分享复制按钮
            $scope.clickShareEdit = clickShareEdit; //点击分享编辑按钮
            $scope.changeTemplate = changeTemplate; //店家更换模板
            $scope.seeDataBrowsing = seeDataBrowsing; //查看活动数据
            $scope.newCreatAct = newCreatAct; //点击新建活动
            $scope.moveUpDown = moveUpDown; //上下移动
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            if ($scope.$stateParams.screenValue && $scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.studNavJud = $scope.$stateParams.screenValue.tab;
                    switchStudNav($scope.studNavJud,1);
                }
            }
            $scope.openTips = function() {
                if ($scope.clickLineData.upDownStatus && $scope.clickLineData.upDownStatus != 2) {
                    layer.msg("已发布的活动，不能编辑转介绍开关。");
                }
            }
            $scope.gotoAritle = function() {
                window.open("https://mp.weixin.qq.com/s/hlXzpmiKrrLzNcHkt4J_eg");
            }
            $scope.signOptions = function(key) {
                var arr = ['sex', 'age', 'birthday', 'schoolname', 'gradle'];
                var count = 0;
                angular.forEach(arr, function(item) {
                    if ($scope.templateData.appoinInfo[item]) {
                        count++
                    }
                });
                if (count > 3) {
                    layer.msg("最多可设置5项");
                    $scope.templateData.appoinInfo[key] = false;
                }

            };
            $scope.paySwitch_ = function() {
                if (window.currentUserInfo.shop.auditStatus !== 2) {
                    layer.msg("请开通易收宝后再开启线上支付");
                    $scope.templateData.prizeInfo.paySwitch = false;
                    return;
                }
                if ($scope.templateData.prizeInfo.course.length == 0 || !$scope.templateData.prizeInfo.course.length) {
                    layer.msg("需选择活动课程才能开启线上支付");
                    $scope.templateData.prizeInfo.paySwitch = false;
                }

            };
            $scope.closeLayer = function(type) {
                switch (type) {
                    case 'template':
                        if ($scope.templateTab == 2 && $scope.templateData && $scope.templateData['isEdit']) {
                            // showDraft($scope.templateData, $scope.clickLineData.templateImageUrl);  //备注：当模板弹框正在编辑的页面关闭预存草稿
                            detailMsk('是否确认放弃本次编辑？', function() {
                                window.showTimer = false;
                                isLoadTemplate = false;
                                $scope.templateData['isEdit'] = undefined;
                                // pagerRender = false;
                                getActivityList(start);
                                layer.close(dialog);
                            })
                        } else {
                            window.showTimer = false;
                            isLoadTemplate = false;
                            // pagerRender = false;
                            getActivityList(start);
                            layer.close(dialog);
                        }

                        if ($('#bacMusic')) {
                            $('#bacMusic').attr('src', '');
                        }
                        break;
                    default:
                        window.showTimer = false;
                        layer.close(dialog);
                        break;
                }
            };

            $scope.clickLineData = {};
            $scope.templateData = { activityPrizeListShow: null }; //活动设置数据

            //用于mixsel指令的名称及套餐列表修改
            //          $scope.bind_obj = {};

            //package_ 此字段表示选择的套餐信息，包含套餐id，以及在用于修改了套餐内容的脱套餐动作
            //package 代表真实的课程套餐信息
            //feeType 0课时套餐 1按期套餐 2按月套餐
            //chargeType 按月课程下的 结束时间 按天来选择为'' 按月数为 1

            $scope.$watch('templateData', function(n, o) {
                if (n === o || n == undefined) return; //防止第一次重复监听
                if ($scope.templateData.activityPrizeList && $scope.templateData.activityPrizeList.length > 0) {
                    angular.forEach($scope.templateData.activityPrizeList, function(x, index) {
                        //脱套餐
                        if ((x.package_ && x.package.packageTime * 1 != x.package_.packageTime * 1) || (x.package_ && x.package.packagePrice * 1 != x.package_.packagePrice * 1)) {
                            if (x.iscustom) { //选择自定义套餐
                                $scope.$broadcast('norepeat_mix', x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                            } else { //修改了课时、课程价格、按月课程换成天选择
                                $scope.$broadcast('norepeat_mix', x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                                x.package_ = null;
                                x.iscustom = true;
                            }
                        }
                    });
                }
                if (isLoadTemplate) {
                    var data_ = angular.copy($scope.templateData);
                    if ($scope.templateData.activityType == 6) {
                        if (data_.prizeInfo.activityRule) data_.prizeInfo.activityRule = data_.prizeInfo.activityRule.replace(/\n/g, "<br/>");

                    } else if ($scope.templateData.prizeInfo && $scope.templateData.prizeInfo.course.length > 0) {
                        var money = 0;
                        angular.forEach($scope.templateData.prizeInfo.course, function(x) {
                            if ((x.package_ && x.package.packageTime * 1 != x.package_.packageTime * 1) || (x.package_ && x.package.packagePrice * 1 != x.package_.packagePrice * 1)) {
                                //                              x.package_ = {};
                                if (x.iscustom) { //选择自定义套餐
                                    $scope.$broadcast(x.mixid, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                                } else { //修改了课时、课程价格、按月课程换成天选择
                                    $scope.$broadcast(x.mixid, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                                    x.package_ = null;
                                    x.iscustom = true;

                                }
                            }
                            if (x.package) {
                                money += x.package.packagePrice * 1;
                            }
                        });
                        //                       改动 无学杂
                        if ($scope.templateData.prizeInfo.course.length > 0) {
                            angular.forEach($scope.templateData.prizeInfo.goods, function(val) {
                                money += val.goodsPrice * val.num;
                            });
                        }
                        $scope.templateData.prizeInfo.originalPrice = money ? money.toFixed(2) : '0.00';
                        if (data_.prizeInfo) {
                            if (!data_.prizeInfo.activityRule) data_.prizeInfo.activityRule = '';
                            if (data_.prizeInfo.introduce) data_.prizeInfo.introduce = data_.prizeInfo.introduce.replace(/\n/g, "<br/>");
                        }
                    }
                    $scope.templateData.isEdit = true;
                    getShowData(data_);

                }
            }, true);
            //抢购切换课程更换min-sel指令内套餐列表
            $scope.$watch('templateData.activityPrizeListShow', function(n, o) {
                if (n === o || n == undefined || $scope.templateData.activityPrizeListShow == null) return; //防止第一次重复监听
                if ($scope.templateData.activityPrizeList.length > 0) {

                    var list = $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].packageList; //需更套餐列表
                    if ($scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_) {
                        if ($scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_.packageId) {
                            $scope.$broadcast('norepeat_mix', $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_.packageName, list, true)
                        } else if ($scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].iscustom) {
                            $scope.$broadcast('norepeat_mix', $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_.feeType == 1 ? "按期报名" : $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_.feeType == 2 ? "按月报名" : "课时报名", list, true)
                        }
                        //                      rangerTimeforbuy($scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_);
                    } else {
                        $scope.$broadcast('norepeat_mix', $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_ === undefined ? "请选择套餐" : ($scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package.feeType == 1 ? "按期报名" : $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package.feeType == 2 ? "按月报名" : "课时报名"), list, $scope.fromInit)
                        $scope.fromInit = true;
                    }
                    rangerTimeforbuy($scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package_);
                }

            })
            $scope.defaultInto = function(type, data) { //活动标题默认为分享标题
                switch (type) {
                    case 'name':
                        $scope.templateData.shareInfo.title = angular.copy($scope.templateData.basicInfo.activityName);
                        break;
                    case 'textarea':
                        if (data) {
                            var str = "";
                            angular.forEach(data, function(item) {
                                if (item.type == 'text' && str == '') {
                                    if (item.value.length > 50) {
                                        str = item.value.substring(0, 50)
                                    } else {
                                        str = item.value;
                                    }
                                }
                            })
                            $scope.templateData.shareInfo.desc = str;
                        }
                        break;
                }

            }
            $scope.imgover = function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').show();
                        break;
                }
            };
            $scope.imgout = function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').hide();
                        break;
                }
            }
            $scope.courseLimitFn = function() {
                if ($scope.templateData.advancedSetting.limitNum > $scope.templateData.activityPrizeList.length) {
                    $scope.templateData.advancedSetting.limitNum = $scope.templateData.activityPrizeList.length;
                }
            }

            //砍价活动数据定义
            $scope.delete_kanjia = delete_kanjia; //删除砍价活动数据
            $scope.add_kanjiaInfo = add_kanjiaInfo; //添加砍价活动数据
            $scope.auditionMusic = auditionMusic; //点击试听音乐
            $scope.operationLine = { //砍价活动状态
                activityStatus: 0
            };
            $scope.thisYears = getSomeYears(); //获取今年年份
            getSchoolTermList(); //获取学期列表
            $scope.selSchoolTerm = selSchoolTerm; //选择学期
            $scope.inputPackageTime = inputPackageTime; //输入课程购买课时
            $scope.selTimeFrame_ = selTimeFrame_; //活动课程奖品时间控件
            $scope.selTimeFrame_obj = {}; //活动课程奖品时间控件对象（控制开始时间和结束时间限制的作用）
            $scope.sel_package = sel_package; //活动课程奖品选择套餐
        }
        //切换抢购课程后渲染时间控件
        function rangerTimeforbuy(d) {
            if ($scope.templateData.activityPrizeList && $scope.templateData.activityPrizeList.length !== 0 && $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].package.feeType == 2) {
                setTimeout(function() {
                    console.log('渲染了');
                    var startTime, endTime;
                    startTime = laydate.render({ //活动开始时间
                        elem: '#course_begin_time', //指定元素
                        type: 'date',
                        isRange: false,
                        done: function(value, value2) {
                            $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].beginTime = value;
                            var x = $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow];
                            if (x.beginTime && x.endTime) {
                                if (x.package) {
                                    d.monthNum = getDatemonth(d.beginTime, d.endTime);
                                    if (d.chargeType == '1') {
                                        d.package.packageTime = d.monthNum;
                                    } else {
                                        d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                                    }
                                    if (x.package.packageTime == 0) {
                                        x.package.packagePrice = 0;
                                    } else {
                                        if (d.chargeType != '1') {
                                            d.package.packagePrice = numAccuracy(d.package.packageUnitPrice / 30 * d.package.packageTime);
                                        }
                                    }
                                }
                            }
                            $scope.$apply();
                        }
                    });
                    endTime = laydate.render({ //活动结束时间
                        elem: '#course_end_time', //指定元素
                        type: 'date',
                        isRange: false,
                        done: function(value, value2) {
                            $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow].endTime = value;
                            var x = $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow];
                            if (x.beginTime && x.endTime) {
                                if (x.package) {
                                    d.monthNum = getDatemonth(d.beginTime, d.endTime);
                                    if (d.chargeType == '1') {
                                        d.package.packageTime = d.monthNum;
                                    } else {
                                        d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                                    }
                                    if (x.package.packageTime == 0) {
                                        x.package.packagePrice = 0;
                                    } else {
                                        if (d.chargeType != '1') {
                                            d.package.packagePrice = numAccuracy(d.package.packageUnitPrice / 30 * d.package.packageTime);
                                        }
                                    }
                                }
                            }
                            $scope.$apply();
                        }
                    });
                })
            }
        }
        //获取筛选列表模板风格列表数据
        function getTemplateStyleList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/activity/listActivityStyle",
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        var a_ = [{ 'activityStyleName': '全部', 'activityStyleId': '' }],
                            b_ = [{ 'activityStyleName': '全部', 'activityStyleId': '' }];
                        for (var i = 0; i < res.context.length; i++) {
                            switch (res.context[i].type) {
                                case 1:
                                    a_.push(res.context[i]);
                                    break;
                                case 2:
                                    b_.push(res.context[i]);
                                    break;
                            }
                        }
                        $scope.templateStyleList = a_;
                        $scope.templateStyleList_2 = b_;
                    };
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
                $scope.defaultInto('textarea', d); //更换位置后分享取第一个
            }
        }
        //筛选列表操作
        function screenSel(d, type) {
            switch (type) {
                case 1:
                    if (d.target.checked) { $scope.$upDownStatus = 1 } else { $scope.$upDownStatus = null };
                    break;
                case 2:
                    if (d.target.checked) { $scope.$upDownStatus = 0 } else { $scope.$upDownStatus = null };
                    break;
            }
            pagerRender = false;
            getActivityList(0);
        }
        //点击新建活动
        function newCreatAct() {
            $scope.studNavJud = 2;
            pagerRender = false;
            getTemplateList(0);
        }

        function clickShareEdit() {
            $scope.templateTab = 2;
            $scope.operationLine.activityStatus = 1;
            $scope.templateData.shareInfo.url = $scope.templateData.shareInfo.url.split('?')[0];
            $scope.templateData.type = 'edit';
        }

        function clickShareCopy() {
            copyToClipboard($('#shareCopyText')[0]);
            layer.msg('复制成功')
        }

        //模板信息填完之后点确认
        function submit_template() {
            var judge = true;
            if (!$scope.templateData.shareInfo.titlesrc) {
                layer.msg('请添加分享图片');
                return;
            };
            var reservationInfo = [];
            var shopIntro = [];
            var params = {};
            var prizeBigIntro = [];
            if ($scope.templateData.appoinInfo) {
                for (var i in $scope.templateData.appoinInfo) { //处理预约信息
                    if ($scope.templateData.appoinInfo[i]) {
                        reservationInfo.push(i);
                    }
                };
            }
            if ($scope.templateData.activityType != 5) { //特殊处理-不是微传单的话
                angular.forEach($scope.templateData.organInfo, function(val) {
                    if (val.type == 'img') {
                        shopIntro.push({ 'imageUrl': val.value });
                    } else {
                        shopIntro.push({ 'content': val.value });
                    }
                });
                angular.forEach($scope.templateData.organ.phone, function(val, ind) {
                    if (!val) {
                        $scope.templateData.organ.phone.splice(ind, 1);
                    }
                });
                if ($scope.templateData.activityType == 6) {
                    angular.forEach($scope.templateData.prizeBigIntro, function(val) {
                        if (val.type == 'img') {
                            prizeBigIntro.push({ 'imageUrl': val.value });
                        } else {
                            prizeBigIntro.push({ 'content': val.value });
                        }
                    });
                }
            }

            //分别获取不同活动的点击确定结果数据
            switch ($scope.templateData.activityType) {
                case 1:
                    params = submit_template_yuyue(reservationInfo, shopIntro);
                    break;
                case 2:
                    params = submit_template_kanjiaZhuli(reservationInfo, shopIntro);
                    break;
                case 3:
                    if ($scope.templateData.prizeInfo.selfNumber > 8) {
                        layer.msg('最多只可设置8个助力包！');
                        return;
                    }
                    params = submit_template_kanjiaZhuli(reservationInfo, shopIntro);
                    break;
                case 4:
                    params = submit_template_kanjiaZhuli(reservationInfo, shopIntro);
                    break;
                case 5:
                    params = submit_template_leaflet(reservationInfo);
                    break; //微传单点击确定
                case 6:
                    params = submit_template_buy(reservationInfo, shopIntro, prizeBigIntro);
                    break; //抢购点击确定
            };
            if (!params) { return }; //如果没有数据则终止提交
            if ($scope.templateData.activityType == 6 && params.activityPrizeList.length == 0) {
                return layer.msg("至少选择一个活动课程")
            }
            console.log(params)
                //如果是新增或者复制就是新增活动，如果是edit就是修改之前的活动
            if ($scope.templateData.type == 'add' || $scope.templateData.type == 'copy') {
                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/add",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            showDraft(null, $scope.clickLineData.templateImageUrl, 0); //清空当前模板草稿
                            $scope.clickLineData = res.context;
                            if ($scope.templateData.activityType == 6) {
                                angular.forEach($scope.clickLineData.activityPrizeList, function(item, index) {
                                    $scope.templateData.activityPrizeList[index].activityPrizeId = item.activityPrizeId;
                                })
                            }
                            $scope.clickLineData['upDownStatus'] = 2;
                            $scope.operationLine.upDownStatus = 2;
                            $scope.templateData.shareInfo.url += '?activityId=' + res.context.activityId + '&shopId=' + (2017 * res.context.shopId);
                            $('#shareCode').html('');
                            jQuery('#shareCode').qrcode({
                                render: "canvas", //也可以替换为table
                                width: 120,
                                height: 120,
                                text: $scope.templateData.shareInfo.url
                            });
                            layer.msg('创建完成');
                            $('.popup_form_content').scrollTop(0);
                            $('.popup_scr').css({ 'top': '0px' }); //设置滚动条位置
                            $scope.templateTab = 3;
                            // pagerRender = false;
                            getActivityList(start);
                        };
                    }
                });
            } else if ($scope.templateData.type == 'edit') {
                params['activityId'] = $scope.clickLineData.activityId; //获取之前点击这个活动的活动id
                params['upDownStatus'] = $scope.operationLine.upDownStatus;
                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/update",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.templateData.shareInfo.url += '?activityId=' + res.context.activityId + '&shopId=' + (2017 * res.context.shopId);
                            $('#shareCode').html('');
                            jQuery('#shareCode').qrcode({
                                render: "canvas", //也可以替换为table
                                width: 120,
                                height: 120,
                                text: $scope.templateData.shareInfo.url
                            });
                            layer.msg('修改完成');
                            $('.popup_form_content').scrollTop(0);
                            $('.popup_scr').css({ 'top': '0px' }); //设置滚动条位置
                            $scope.templateTab = 3;
                            // pagerRender = false;
                            getActivityList(start);
                        } else {
                            // pagerRender = false;
                            getActivityList(start);
                        }
                    }
                });
            }
        };

        //微传单点击确定提交数据
        function submit_template_leaflet(reservationInfo) {
            var judReturn = [true, ''];
            console.log(reservationInfo);
            if (!$scope.templateData.basicInfo.coverImg) {
                layer.msg('未上传封面图片');
                return;
            }
            var modList = [];
            angular.forEach($scope.templateData.activityDes, function(v1) {
                var jud_ = false; //判断模板内容描述是否有空

                if (!v1.title) {
                    judReturn = [false, '请填写模板标题'];
                    return;
                }
                var o_ = {
                    title: v1.title,
                    activityAuxiliaries: [],
                };
                angular.forEach(v1.content, function(v2) {
                    if (v2.type == 'text') {
                        o_.activityAuxiliaries.push({ 'content': v2.value });
                        if (v2.value) jud_ = true;
                    } else {
                        o_.activityAuxiliaries.push({ 'imageUrl': v2.value });
                        jud_ = true;
                    }
                });
                modList.push(o_);

                if (v1.content.length == 0 || !jud_) {
                    judReturn = [false, '模板中的内容描述至少填写一个'];
                    return;
                }
            });
            if (!judReturn[0]) {
                layer.msg(judReturn[1]);
                return;
            }
            if ($scope.templateData.referralSwitch) {
                //转介绍相关参数
                var modList_referral = [];
                angular.forEach($scope.templateData.prizeBigIntro, function(v) {
                    if (!v.value) {
                        judReturn = [false, '请填写转介绍奖励'];
                        return;
                    }
                    if (v.type == 'text') {
                        modList_referral.push({ 'content': v.value });
                    } else {
                        modList_referral.push({ 'imageUrl': v.value });
                    }
                });
                if ($scope.templateData.prizeBigIntro.length == 0) {
                    judReturn = [false, '模板中的转介绍奖励至少填写一个'];
                }
                if (!judReturn[0]) {
                    layer.msg(judReturn[1]);
                    return;
                }
            }
            var params = {
                'reservationInfo': reservationInfo.join(',') ? reservationInfo.join(',') : '',
                'templateId': $scope.clickLineData.templateId,
                'activityName': $scope.templateData.basicInfo.activityName,
                'shareTitle': $scope.templateData.shareInfo.title,
                'beginTime': $scope.templateData.basicInfo.startTime,
                'endTime': $scope.templateData.basicInfo.endTime ? $scope.templateData.basicInfo.endTime : '',
                'activityType': 5,
                'shareImageUrl': $scope.templateData.shareInfo.titlesrc,
                'telephone': $scope.templateData.basicInfo.telephone,
                'shareDesc': $scope.templateData.shareInfo.desc,
                'entryRequirements': $scope.templateData.advancedSetting.peoLimit ? $scope.templateData.advancedSetting.peoLimitType : undefined, //开启报名学员限制
                'entryNum': $scope.templateData.advancedSetting.peoMax ? $scope.templateData.advancedSetting.peoMaxNum : undefined, //设置报名学员上限
                'backImageUrl': $scope.templateData.basicInfo.coverImg, //封面图片
                'teacherIntro': JSON.stringify(modList),
                'activityMusic': null,
                'referralSwitch': $scope.templateData.referralSwitch ? "1" : "0"
            };
            if ($scope.templateData.referralSwitch) {
                params['prizeBigIntro'] = JSON.stringify(modList_referral);
                params['activityRule'] = $scope.templateData.activityRule;
            }
            //判断是音乐库的音乐还是自定义的音乐
            if ($scope.templateData.basicInfo.musicType == '0') {
                params['activityMusic'] = $scope.templateData.basicInfo.bacMusic.musicId ? $scope.templateData.basicInfo.bacMusic.musicId : ($scope.templateData.type == 'edit' ? '' : undefined);
            } else {
                params['activityMusic'] = $scope.templateData.basicInfo.musicUrl ? $scope.templateData.basicInfo.musicUrl : ($scope.templateData.type == 'edit' ? '' : undefined);
            };
            return params;
        }
        //抢购点击确定提交数据
        function submit_template_buy(reservationInfo, shopIntro, prizeBigIntro) {
            var courseList = [];
            var judege_ = [true, ''];
            if (!$scope.templateData.basicInfo.coverImg) {
                layer.msg('未上传封面图片');
                return;
            }
            //处理课程
            angular.forEach($scope.templateData.activityPrizeList, function(val, index) {
                //根据收费标准进行第一次判断
                switch (val.package.feeType) {
                    case '1':
                        if (!val.schoolTerm || !val.schoolYear || val.schoolYear == "undefined") {
                            judege_ = [false, '【课程' + (index + 1) + '】请选择学年或者学期'];
                            return;
                        }
                        break;
                    case '2':
                        if (!val.beginTime || !val.endTime) {
                            judege_ = [false, '【课程' + (index + 1) + '】请选择课程的开始时间或者结束时间'];
                            return;
                        };
                        if (val.chargeType != 1 && CompareDate(val.beginTime, val.endTime)) {
                            judege_ = [false, '【课程' + (index + 1) + '】课程开始时间不能大于结束时间'];
                            return;
                        }
                        if (val.chargeType == 1 && val.monthNum == 0) {
                            judege_ = [false, '【课程' + (index + 1) + '】请输入购买月份'];
                            return;
                        }
                        break;
                }

                if (!val.package) {
                    val.package = { packageTime: 0, packagePrice: 0, giveTime: 0 }
                };
                val.package.packageTime = val.package.packageTime ? val.package.packageTime : 0; //购买课时
                val.package.packagePrice = val.package.packagePrice ? val.package.packagePrice : 0; //课程价格
                val.package.giveTime = val.package.giveTime ? val.package.giveTime : 0; //赠送课时
                if (val.package.packageTime == 0) val.package.packagePrice = 0; //如果购买课时为0.课程价格为0
                if (!val.package.packageTime && !val.package.giveTime) {
                    judege_ = [false, '【课程' + (index + 1) + '】请填写购买课时或者赠送课时'];
                    return;
                }
                if (val.package.activityPrice == undefined) {
                    judege_ = [false, '【课程' + (index + 1) + '】的活动价格不能为空'];
                    return;
                }
                if (val.package.activityPlaces == undefined) {
                    judege_ = [false, '【课程' + (index + 1) + '】的活动名额不能为空'];
                    return;
                }
                var lsobj = {
                    'prizeType': 'course',
                    'prizeId': val.courseId * 1,
                    'chargeStandardId': val.chargeStandardId,
                    'feeType': val.package.feeType,
                    'prizeName': val.courseName,
                    'packageId': val.package_ ? val.package_.packageId : undefined,
                    'unitPrice': 0,
                    'buyTime': 0,
                    'giveTime': val.package.giveTime * 1,
                    'prizePrice': val.package.packagePrice,
                    'schoolYear': val.schoolYear,
                    'schoolTermId': val.schoolTerm ? val.schoolTerm.schoolTermId : undefined,
                    'schoolTermName': val.schoolTerm ? val.schoolTerm.schoolTermName : undefined,
                    'activityPlaces': val.package.activityPlaces ? val.package.activityPlaces : undefined,
                    'activityPrice': val.package.activityPrice ? val.package.activityPrice : 0
                };
                if (val.package.feeType == 2) { //如果是按月份的报名
                    lsobj['beginTime'] = val.beginTime + ' 00:00:00';
                    lsobj['endTime'] = val.endTime + ' 00:00:00';
                }
                if (val.package.feeType == 2 && val.chargeType == '1') { //按月课程并且选择按月  购买天数、单课价
                    lsobj.buyTime = numAccuracy(val.monthNum == 0 ? 0 : getIntervalDays(val.beginTime, val.endTime) + 1);
                    //单课价
                    lsobj.unitPrice = numAccuracy(val.package.packagePrice / lsobj.buyTime);
                } else {
                    lsobj.buyTime = numAccuracy(val.package.packageTime);
                    //单课价
                    lsobj.unitPrice = numAccuracy(val.package.packagePrice / lsobj.buyTime);
                }
                if ($scope.templateData.type == 'edit') {
                    lsobj.activityPrizeId = val.activityPrizeId;
                }
                courseList.push(lsobj);
            });
            if (shopIntro.length == 0) {
                layer.msg('校区信息不能为空！');
                return;
            }
            var params = {
                'reservationInfo': reservationInfo.join(',') ? reservationInfo.join(',') : '',
                'templateId': $scope.clickLineData.templateId,
                'activityName': $scope.templateData.basicInfo.activityName,
                'beginTime': $scope.templateData.basicInfo.startTime,
                'endTime': $scope.templateData.basicInfo.endTime ? $scope.templateData.basicInfo.endTime : '',
                'activityMusic': null,
                'activityType': 6,
                'telephone': $scope.templateData.basicInfo.telephone,
                'backImageUrl': $scope.templateData.basicInfo.coverImg, //封面图片
                'activityRule': $scope.templateData.prizeInfo.activityRule,
                'shopIntro': shopIntro.length > 0 ? JSON.stringify(shopIntro) : '',
                'shopName': $scope.templateData.organ.name,
                'shopPhone': $scope.templateData.organ.phone.join(',') ? $scope.templateData.organ.phone.join(',') : '',
                'shopAddress': $scope.templateData.organ.address,
                'shopQrCode': $scope.templateData.organ.code,
                'shareImageUrl': $scope.templateData.shareInfo.titlesrc,
                'shareTitle': $scope.templateData.shareInfo.title,
                'shareDesc': $scope.templateData.shareInfo.desc,
                'groupLimit': $scope.templateData.advancedSetting.groupLimit ? 1 : 0,
                'limitItems': $scope.templateData.advancedSetting.limitItems,
                'courseLimit': $scope.templateData.advancedSetting.courseLimit ? 1 : 0,
                'limitNum': $scope.templateData.advancedSetting.limitNum,
                'prizeBigIntro': prizeBigIntro.length > 0 ? JSON.stringify(prizeBigIntro) : '',
                'activityPrizeList': courseList ? courseList : undefined
            };
            params['activityMusic'] = $scope.templateData.basicInfo.bacMusic.musicId ? $scope.templateData.basicInfo.bacMusic.musicId : ($scope.templateData.type == 'edit' ? '' : undefined);
            if (!judege_[0]) {
                layer.msg(judege_[1]);
                return false;
            } else {
                return params;
            }
        }

        //砍价-助力模板点击确认
        function submit_template_kanjiaZhuli(reservationInfo, shopIntro) {
            var courseList = [],
                goodsList = [],
                params, judege_ = [true, ''],
                prizeList = []
                //处理奖品描述列表信息
            angular.forEach($scope.templateData.prizeInfo.describeList, function(v1) {
                if (v1.type == 'text') {
                    prizeList.push({ 'content': v1.value });
                } else {
                    prizeList.push({ 'imageUrl': v1.value });
                }
            })

            //处理课程
            angular.forEach($scope.templateData.prizeInfo.course, function(val) {
                //根据收费标准进行第一次判断
                switch (val.package.feeType) {
                    case '1':
                        if (!val.schoolTerm || !val.schoolYear || val.schoolYear == "undefined") {
                            judege_ = [false, '请选择学年或者学期'];
                            return;
                        }
                        break;
                    case '2':
                        if (!val.beginTime || !val.endTime) {
                            judege_ = [false, '请选择课程的开始时间或者结束时间'];
                            return;
                        };
                        if (val.chargeType != 1 && CompareDate(val.beginTime, val.endTime)) {
                            judege_ = [false, '课程开始时间不能大于结束时间'];
                            return;
                        }
                        if (val.chargeType == 1 && val.monthNum == 0) {
                            judege_ = [false, '请输入购买月份'];
                            return;
                        }
                        break;
                }

                if (!val.package) {
                    val.package = { packageTime: 0, packagePrice: 0, giveTime: 0 }
                };
                val.package.packageTime = val.package.packageTime ? val.package.packageTime : 0; //购买课时
                val.package.packagePrice = val.package.packagePrice ? val.package.packagePrice : 0; //课程价格
                val.package.giveTime = val.package.giveTime ? val.package.giveTime : 0; //赠送课时
                if (val.package.packageTime == 0) val.package.packagePrice = 0; //如果购买课时为0.课程价格为0
                if (!val.package.packageTime && !val.package.giveTime) {
                    judege_ = [false, '请填写购买课时或者赠送课时'];
                    return;
                }
                var lsobj = {
                    'prizeType': 'course',
                    'prizeId': val.courseId * 1,
                    'chargeStandardId': val.chargeStandardId,
                    'feeType': val.package.feeType,
                    'prizeName': val.courseName,
                    'packageId': val.package_ ? val.package_.packageId : undefined,
                    'unitPrice': val.package.packageTime * 1 ? (val.package.packagePrice / val.package.packageTime).toFixed(2) : 0,
                    'buyTime': val.package.packageTime * 1,
                    'giveTime': val.package.giveTime * 1,
                    'prizePrice': val.package.packagePrice,
                    'schoolYear': val.schoolYear,
                    'schoolTermId': val.schoolTerm ? val.schoolTerm.schoolTermId : undefined,
                    'schoolTermName': val.schoolTerm ? val.schoolTerm.schoolTermName : undefined,
                };
                if (val.package.feeType == 2) { //如果是按月份的报名
                    lsobj['beginTime'] = val.beginTime + ' 00:00:00';
                    lsobj['endTime'] = val.endTime + ' 00:00:00';
                }
                if (val.package.feeType == 2 && val.chargeType == '1') { //按月课程并且选择按月  购买天数、单课价
                    lsobj.buyTime = numAccuracy(val.monthNum == 0 ? 0 : getIntervalDays(val.beginTime, val.endTime) + 1);
                    //单课价
                    lsobj.unitPrice = numAccuracy(val.package.packagePrice / lsobj.buyTime);
                } else {
                    lsobj.buyTime = numAccuracy(val.package.packageTime);
                    //单课价
                    lsobj.unitPrice = numAccuracy(val.package.packagePrice / lsobj.buyTime);
                }
                courseList.push(lsobj);
            });
            //处理学杂 (活动不需要学杂)
            angular.forEach($scope.templateData.prizeInfo.goods, function(val) {
                if (!val.goodsPrice) {
                    val.goodsPrice = 0;
                };
                if (!val.num) {
                    val.num = 0;
                };
                var lsobj = {
                    'prizeType': 'goods',
                    'prizeId': val.goodsId,
                    'prizeName': val.goodsName,
                    'unitPrice': val.goodsPrice,
                    'prizeNumber': val.num,
                    'prizePrice': val.goodsPrice * val.num,
                };
                goodsList.push(lsobj);
            });
            if (shopIntro.length == 0) {
                layer.msg('校区信息不能为空！');
                return;
            }
            params = {
                'templateId': $scope.clickLineData.templateId,
                'activityType': $scope.templateData.activityType,
                'activityName': $scope.templateData.basicInfo.activityName,
                'beginTime': $scope.templateData.basicInfo.startTime,
                'endTime': $scope.templateData.basicInfo.endTime ? $scope.templateData.basicInfo.endTime : '',
                'activityPrizeList': (courseList.concat(goodsList)).length > 0 ? courseList.concat(goodsList) : undefined,
                'prizeBigIntro': prizeList.length > 0 ? JSON.stringify(prizeList) : undefined,
                'places': $scope.templateData.prizeInfo.num,
                'originalPrice': $scope.templateData.prizeInfo.originalPrice,
                'floorPrice': $scope.templateData.prizeInfo.floorPrice,
                'totalNumber': $scope.templateData.prizeInfo.totalNumber,
                'selfNumber': $scope.templateData.prizeInfo.selfNumber,
                'activityRule': $scope.templateData.prizeInfo.activityRule,
                'shopIntro': shopIntro.length > 0 ? JSON.stringify(shopIntro) : '',
                'reservationInfo': reservationInfo.join(',') ? reservationInfo.join(',') : '',
                'shopName': $scope.templateData.organ.name,
                'shopPhone': $scope.templateData.organ.phone.join(',') ? $scope.templateData.organ.phone.join(',') : '',
                'shopAddress': $scope.templateData.organ.address,
                'shopQrCode': $scope.templateData.organ.code,
                'shareImageUrl': $scope.templateData.shareInfo.titlesrc,
                'shareTitle': $scope.templateData.shareInfo.title,
                'shareDesc': $scope.templateData.shareInfo.desc,
                'activityMusic': null,
                'telephone': $scope.templateData.basicInfo.telephone,
                'paySwitch': courseList.length ? ($scope.templateData.prizeInfo.paySwitch ? 1 : 0) : 0,
            };

            //判断是砍价还是助力或者是拼团
            if ($scope.templateData.activityType == 2) { //砍价
                params['friendNumber'] = $scope.templateData.prizeInfo.friendNumber;
            } else if ($scope.templateData.activityType == 3) { //助力

            } else if ($scope.templateData.activityType == 4) { //拼团
                if ($scope.templateData.prizeInfo.prepayment * 1 > $scope.templateData.prizeInfo.floorPrice * 1 && $scope.templateData.prizeInfo.prepaymentFlag) {
                    layer.msg('预付款不能大于拼团价格！');
                    return;
                }
                params['beginTime'] = $scope.templateData.basicInfo.startTime + ' 00:00:00';
                params['endTime'] = $scope.templateData.basicInfo.endTime + ' 23:59:59';
                params['viewFlag'] = $scope.templateData.prizeInfo.viewFlag ? 1 : 0; //是否开启拼团列表
                params['prepaymentFlag'] = $scope.templateData.prizeInfo.prepaymentFlag ? 1 : 0; //是否开启预付款
                params['prepayment'] = $scope.templateData.prizeInfo.prepayment ? $scope.templateData.prizeInfo.prepayment : 0; //预付款金额
                params['groupLimit'] = $scope.templateData.prizeInfo.groupLimit ? 1 : 0; //是否参团限制
                params['limitItems'] = $scope.templateData.prizeInfo.limitItems; //参团限制选择
                params['paySwitch'] = undefined; //拼团没有开启线上支付的高级设置
                delete params['prizeNumber'];
                delete params['originalPrice'];
                // delete params['reservationInfo'];
            }
            //判断是音乐库的音乐还是自定义的音乐
            if ($scope.templateData.basicInfo.musicType == '0') {
                params['activityMusic'] = $scope.templateData.basicInfo.bacMusic.musicId ? $scope.templateData.basicInfo.bacMusic.musicId : ($scope.templateData.type == 'edit' ? '' : undefined);
            } else {
                params['activityMusic'] = $scope.templateData.basicInfo.musicUrl ? $scope.templateData.basicInfo.musicUrl : ($scope.templateData.type == 'edit' ? '' : undefined);
            };
            if (!judege_[0]) {
                layer.msg(judege_[1]);
                return false;
            } else {
                return params;
            }
        }

        //跳转到展示课程设置
        function gotoSetShowCourse() {
            $scope.closeLayer();
            $state.go('showcourse');
        }
        //添加展示课程
        function add_showCourse(data) {
            var judHas = true;
            var judHasIndex = null;
            angular.forEach($scope.templateData.showCourseList, function(val, index) {
                if (!val.experienceCourseId) {
                    delete $scope.templateData.showCourseList[index]; //如果是默认数据则删除数据
                } else {
                    if (val.experienceCourseId == data.experienceCourseId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                }
            });
            $scope.templateData.showCourseList = detEmptyField_($scope.templateData.showCourseList); //去除空的字段

            if (judHas) {
                $scope.templateData.showCourseList.push(data);
                data.hasSelected = true;
            } else {
                $scope.templateData.showCourseList.splice(judHasIndex, 1);
                data.hasSelected = false;
            }
        }

        //删除展示课程选择
        function delete_showCourse(data, ind) {
            data.hasSelected = false;
            $scope.templateData.showCourseList.splice(ind, 1);
        }

        //添加校区和老师（根据type判断）
        function add_organInfo(type, d) {
            //          if(type == 'organtext' || type == 'organimg') {
            //              if($scope.templateData.organInfo.length > 20) {
            //                  layer.msg('添加到达上限');
            //                  return;
            //              }
            //          }
            if (type == 'teacher') {
                if ($scope.templateData.teacherInfo.length > 10) {
                    layer.msg('添加到达上限');
                    return;
                }
            }
            switch (type) {
                case 'organtext':
                    $scope.templateData.organInfo.push({ type: 'text', value: '' });
                    break;
                case 'organimg':
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if (d) {
                                d.value = data;
                            } else {
                                $scope.templateData.organInfo.push({ type: 'img', value: data });
                            }
                            $scope.$apply();
                        })
                    });
                    break;
                case 'teacher':
                    $scope.templateData.teacherInfo.push({ imgsrc: '', introduce: '' });
                    break;
                case 'teacherimg':
                    setTimeout(function() {
                        szpUtil.util_addImg(true, function(data) {
                            d.imgsrc = data;
                            $scope.$apply();
                        })
                    });
                    break;
                case 'titleimg':
                    setTimeout(function() {
                        szpUtil.util_addImg(true, function(data) {
                            $scope.templateData.shareInfo.titlesrc = data;
                            $scope.$apply();
                        })
                    });
                    break;
                case 'organPhone':
                    $scope.templateData.organ.phone.push('');
                    break;
                case 'organcode':
                    setTimeout(function() {
                        szpUtil.util_addImg(true, function(data) {
                            $scope.templateData.organ.code = data;
                            $scope.$apply();
                        })
                    });
                    break;
                case 'coverImg': //添加微传单封面
                    setTimeout(function() {
                        szpUtil.util_addImg(true, function(data) {
                            $scope.templateData.basicInfo.coverImg = data;
                            $scope.templateData.shareInfo.titlesrc = data; ////封面图默认为分享图片
                            $scope.$apply();
                        }, { options: { aspectRatio: $scope.isflight ? 800 / 1280 : 1 }, type: 'image/gif, image/jpeg, image/png' })
                    });
                    break;
                case 'leaflettext': //添加微传单模块文字
                    $scope.templateData.activityDes[$scope.templateData.activityDesShow].content.push({ type: 'text', value: '' })
                    console.log($scope.templateData.activityDes);

                    // $scope.templateData.activityDesShow
                    break;
                case 'leafletimg': //添加微传单模块图片
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if (d) {
                                d.value = data;
                            } else {
                                $scope.templateData.activityDes[$scope.templateData.activityDesShow].content.push({ type: 'img', value: data });
                            }
                            $scope.$apply();
                        })
                    });
                    break;
                case 'leaflettext_referral': //添加微传单转介绍文字
                    $scope.templateData.prizeBigIntro.push({
                        type: 'text',
                        value: ''
                    })
                    break;
                case 'leafletimg_referral': //添加微传单模块转介绍奖励图片
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if (d) {
                                d.value = data;
                            } else {
                                $scope.templateData.prizeBigIntro.push({ type: 'img', value: data });
                            }
                            $scope.$apply();
                        })
                    });
                    break;
                case 'leafletMod':
                    $scope.templateData.activityDes.push({
                        title: '',
                        content: []
                    })
                    break;
                case 'prizeListImg': //添加奖品描述list图片
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if (d) {
                                d.value = data;
                            } else {
                                $scope.templateData.prizeInfo['describeList'].push({ type: 'img', value: data });
                            }
                            $scope.$apply();
                        })
                    });
                    break;
                case 'prizeListText': //添加奖品描述list文字
                    $scope.templateData.prizeInfo['describeList'].push({ type: 'text', value: '' });
                    break;
                case 'buytext': //添加抢购模块课程描述文字
                    $scope.templateData.prizeBigIntro.push({ type: 'text', value: '' })
                    break;
                case 'buyimg': //添加抢购模块课程描述图片
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if (d) {
                                d.value = data;
                            } else {
                                $scope.templateData.prizeBigIntro.push({ type: 'img', value: data });
                            }

                            $scope.$apply();
                        })
                    });
                    break;
            }
        }

        //删除结构信息
        function delete_organInfo(ind, type) {
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
                    case 'organ':
                        $scope.templateData.organInfo.splice(ind, 1);
                        break;
                    case 'teacher':
                        $scope.templateData.teacherInfo.splice(ind, 1);
                        break;
                    case 'organcode':
                        $scope.templateData.organ.code = ''
                        break;
                    case 'leafletMod': //删除微传单的模块信息整块
                        if ($scope.templateData.activityDes.length == 1) return layer.msg('至少要有一个模板');
                        $scope.templateData.activityDes.splice(ind, 1);
                        $scope.templateData.activityDesShow = 0;
                        break;
                    case 'buyMod': //删除抢购课程
                        $scope.templateData.activityPrizeList.splice(ind, 1);
                        $scope.templateData.activityPrizeListShow = 0;
                        break;
                    case 'leafletCon': //删除微传单的模块信息的内容
                        $scope.templateData.activityDes[$scope.templateData.activityDesShow].content.splice(ind, 1);
                        break;
                    case 'leafletCon_referral': //删除微传单的转介绍
                        $scope.templateData.prizeBigIntro.splice(ind, 1);
                        break;
                    case 'prizeListCon': //删除奖品描述的某一个
                        $scope.templateData.prizeInfo['describeList'].splice(ind, 1);
                        break;
                    case 'buyCon': //删除抢购中的课程描述
                        $scope.templateData.prizeBigIntro.splice(ind, 1);
                        $scope.defaultInto('textarea', $scope.templateData.prizeBigIntro)
                        break;
                }
                $scope.$apply();
                layer.close(isdelete);
            }, function() {
                layer.close(isdelete);
            })
        }
        //点击创建、修改、复制、查看模板
        function addTemplate(d, type) {
            isLoadTemplate = false;
            $scope.templateTab = type == 'change' ? 1 : 2; //活动模板tab
            $scope.initCoverImg = window.h5_tempalteData_new[d.templateImageUrl].basicInfo.coverImginit;
            $scope.isflight = d.templateImageUrl.indexOf('leaflet/flight') !== -1 ? true : false; //2020 武汉肺炎特殊标识
            if (d.activityType == 4) {
                window.h5_tempalteData_new[d.templateImageUrl].basicInfo.startTime = $.format.date(new Date(window.h5_tempalteData_new[d.templateImageUrl].basicInfo.startTime), 'yyyy-MM-dd');
                window.h5_tempalteData_new[d.templateImageUrl].basicInfo.endTime = $.format.date(new Date(window.h5_tempalteData_new[d.templateImageUrl].basicInfo.endTime), 'yyyy-MM-dd');
            }
            switch (type) {
                case 'add':
                    if ((d.activityType == 4 || d.activityType == 6) && window.currentUserInfo.shop.auditStatus != 2) { //如果是拼团活动判断是否开通了易收宝
                        var isEdit = layer.confirm('请开通易收宝后使用', {
                            title: "提示信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['知道了'] //按钮
                        }, function() {
                            layer.close(isEdit);
                        }, function() {
                            layer.close(isEdit);
                        })
                        return;
                    }
                    $scope.operationLine.activityStatus = 0;
                    $scope.templateData = {}; //模板数据清空
                    $scope.templateData = angular.copy(window.h5_tempalteData_new[d.templateImageUrl]); //预约活动设置数据
                    getShowCourseList(); //获取展示课程下拉数据
                    openPopByDiv(null, '.template_pop', '960px'); //打开模板
                    $scope.templateData.type = type; //切换模板数据类型
                    $scope.clickLineData = angular.copy(d); //切换点击目标数据（包括活动id和模板id）
                    $scope.templateData.shareInfo.url += d.templateImageUrl + '/index.html'; //合成二维码的分享链接替换模板id
                    if (window.currentUserInfo.shop && d.activityType != 5 && d.activityType != 6) {
                        $scope.templateData['organ'].name = window.currentUserInfo.shop.shopName ? angular.copy(window.currentUserInfo.shop.shopName) : '';
                        $scope.templateData['organ'].phone = window.currentUserInfo.shop.shopPhoneList ? angular.copy(window.currentUserInfo.shop.shopPhoneList) : [''];
                        $scope.templateData['organ'].address = window.currentUserInfo.shop.shopAddress ? angular.copy(window.currentUserInfo.shop.shopAddress) : '';
                    }
                    break;
                case 'copy':
                    $scope.operationLine.activityStatus = 0;
                    $scope.templateData = {};
                    handleTemplateData(d);
                    openPopByDiv(null, '.template_pop', '960px');
                    $scope.templateData.basicInfo.startTime = d.activityType == 4 ? ($.format.date(new Date(), "yyyy-MM-dd")) : ($.format.date(new Date(), "yyyy-MM-dd HH:mm:ss"));
                    $scope.templateData.basicInfo.endTime = '';
                    if ($scope.templateData.prizeInfo && d.activityType == 4) $scope.templateData.prizeInfo.friendNumber = 0; //重置已经拼成的团奖品份数
                    $scope.templateData.type = type;
                    $scope.clickLineData = angular.copy(d);
                    if (d.activityType == 5) $scope.clickLineData.upDownStatus = 2; //微传单复制需重置上下架状态
                    $scope.templateData.shareInfo.url += d.templateImageUrl + '/index.html'; //合成二维码的分享链接替换模板id
                    break;
                case 'see':
                    $scope.templateData = {};
                    handleTemplateData(d);
                    openPopByDiv(null, '.template_pop', '960px');
                    $scope.templateTab = 3;
                    $scope.templateData.shareInfo.url += d.templateImageUrl + '/index.html'; //合成二维码的分享链接替换模板id
                    $scope.templateData.shareInfo.url += '?activityId=' + d.activityId + '&shopId=' + (2017 * d.shopId);
                    $('#shareCode').html('');
                    jQuery('#shareCode').qrcode({
                        render: "canvas", //也可以替换为table
                        width: 120,
                        height: 120,
                        text: $scope.templateData.shareInfo.url
                    });
                    $scope.templateData.type = type;
                    $scope.clickLineData = angular.copy(d);
                    break;
                case 'edit':
                    $scope.templateData = {};
                    handleTemplateData(d);
                    openPopByDiv(null, '.template_pop', '960px');
                    $scope.templateData.type = type;
                    $scope.clickLineData = angular.copy(d);
                    $scope.templateData.shareInfo.url += d.templateImageUrl + '/index.html'; //合成二维码的分享链接替换模板id
                    break;
                case 'change':
                    var ls_url = $scope.templateData.shareInfo.url.split('/');
                    $scope.templateData.shareInfo.url = $scope.templateData.shareInfo.url.replace(ls_url[ls_url.length - 3] + '/' + ls_url[ls_url.length - 2], d.templateImageUrl);
                    $scope.clickLineData.templateId = d.templateId;
                    break;
            };
            $scope.templateData.musicList = d.musicLibraryList; //默认音乐列表
            //渲染时间控件
            setTimeout(function() {
                darg($('#show_contain')[0]);
                var startTime, endTime;
                if (d.activityType == 4) {
                    startTime = laydate.render({ //活动开始时间
                        elem: '#act_startTime_4', //指定元素
                        type: 'date',
                        isRange: false,
                        done: function(value, value2) {
                            $scope.templateData.basicInfo.startTime = value;
                            //控制活动结束时间不能小于开始时间
                            endTime.config.min = value2;
                            endTime.config.min.month--;
                            $scope.$apply();
                        }
                    });
                    endTime = laydate.render({ //活动结束时间
                        elem: '#act_endTime_4', //指定元素
                        type: 'date',
                        isRange: false,
                        done: function(value, value2) {
                            $scope.templateData.basicInfo.endTime = value;
                            //控制活动开始时间不能大于结束时间
                            startTime.config.max = value2;
                            startTime.config.max.month--;
                            $scope.$apply();
                        }
                    });
                    return;
                }
                startTime = laydate.render({ //活动开始时间
                    elem: '#act_startTime', //指定元素
                    type: 'datetime',
                    isRange: false,
                    done: function(value, value2) {
                        $scope.templateData.basicInfo.startTime = value;
                        //控制活动结束时间不能小于开始时间
                        endTime.config.min = value2;
                        endTime.config.min.month--;
                        $scope.$apply();
                    }
                });
                endTime = laydate.render({ //活动结束时间
                    elem: '#act_endTime', //指定元素
                    type: 'datetime',
                    isRange: false,
                    done: function(value, value2) {
                        $scope.templateData.basicInfo.endTime = value;
                        //控制活动开始时间不能大于结束时间
                        startTime.config.max = value2;
                        startTime.config.max.month--;
                        $scope.$apply();
                    }
                });
            });

            //用ajax获取模板html节点
            $.ajax({
                url: "templates/show_template/" + d.templateImageUrl + '/index.html',
                type: 'get',
                success: function(data) {
                    $('#show_contain').html(data); //获取到的节点插入
                    isLoadTemplate = true; //放开模板数据的监听回调
                    getShowData($scope.templateData); //刷新一次h5数据
                }
            })
            $scope.templateData.activityType = d.activityType; //赋值活动类型
            if (d.activityType == 1) { //清空勾选状态
                $scope.$broadcast('experienceCourse', 'clearSatus');
            }
        }

        //获取模板数据做处理(预约、砍价、拼团活动的数据区分处理)
        function handleTemplateData(d) {
            var organInfoList = [];
            var reservationInfo = d.reservationInfo ? d.reservationInfo.split(',') : [];
            var musicInfo = {};
            if (d.shopIntros) {
                angular.forEach(d.shopIntros, function(val) {
                    if (val.imageUrl) {
                        organInfoList.push({ type: 'img', value: val.imageUrl });
                    } else if (val.content || val.content == '') {
                        organInfoList.push({ type: 'text', value: val.content });
                    }
                })
            };
            //判断是自定义音乐还是音乐库的音乐
            if (d.musicLibrary) {
                musicInfo = d.musicLibrary
            } else {
                musicInfo = {
                    musicUrl: '',
                    musicName: '',
                    musicId: ''
                }
            };
            if (d.activityType == 1) {
                var teacherList = [];
                $scope.templateData = { //预约活动设置数据
                    basicInfo: {
                        activityName: d.activityName,
                        startTime: $.format.date(d.beginTime, "yyyy-MM-dd HH:mm:ss"),
                        endTime: d.endTime ? $.format.date(d.endTime, "yyyy-MM-dd HH:mm:ss") : '',
                        musicType: '0',
                        musicUrl: d.musicLibrary ? '' : d.activityMusic,
                        bacMusic: musicInfo,
                        telephone: d.telephone, //机构电话
                    },
                    organInfo: organInfoList,
                    teacherInfo: [],
                    showCourseList: [],
                    appoinInfo: {
                        sex: false,
                        age: false,
                        birthday: false,
                        schoolname: false,
                        gradle: false,
                    },
                    organ: {
                        name: d.shopName,
                        phone: d.shopPhone ? d.shopPhone.split(',') : [''],
                        address: d.shopAddress,
                        code: d.shopQrCode
                    },
                    shareInfo: {
                        titlesrc: d.shareImageUrl,
                        title: d.shareTitle,
                        desc: d.shareDesc,
                        url: shareHref + '/h5/show_template/'
                    }
                }
                if (d.teacherIntros) {
                    angular.forEach(d.teacherIntros, function(val) {
                        $scope.templateData['teacherInfo'].push({ 'imgsrc': val.imageUrl, 'introduce': val.content });
                    })
                };
                angular.forEach(reservationInfo, function(val) {
                    $scope.templateData['appoinInfo'][val] = true;
                });
                getShowCourseList(d.experienceCourseStr);
            } else if (d.activityType == 2 || d.activityType == 3 || d.activityType == 4) {
                var prizeCourseList = [],
                    prizeGoodsList = [],
                    prizeList = [];
                //处理奖品列表
                angular.forEach(d.prizeBigIntros, function(v1) {
                    if (v1.content) {
                        prizeList.push({ type: 'text', value: v1.content });
                    } else {
                        prizeList.push({ type: 'img', value: v1.imageUrl });
                    }
                })
                angular.forEach(d.activityPrizeList, function(val) {
                    if (val.prizeType == 'course') {
                        var lsObj = {
                            'mixid': GenNonDuplicateID(5),
                            'courseId': val.prizeId,
                            'prizeType': 'course',
                            'courseName': val.prizeName,
                            'packageList': val.packageList,
                            'packageList_old': angular.copy(val.packageList),
                            'package': {},
                            'package_': {},
                            'chargeStandardId': val.chargeStandardId,
                            'chargeType': '',
                            'monthNum': 0,
                            'course': {
                                'chargeStandardId': val.chargeStandardId,
                                'courseId': val.prizeId,
                                'courseName': val.prizeName,
                            }
                        };
                        if (val.feeType == 2) {
                            lsObj['beginTime'] = $.format.date(val.beginTime, 'yyyy-MM-dd');
                            lsObj['endTime'] = $.format.date(val.endTime, 'yyyy-MM-dd');
                        }
                        angular.forEach(val.packageList, function(val_) {
                            if (val.packageId == val_.packageId) {
                                lsObj['package_'] = val_;
                            }
                        });
                        if (val.schoolTermId) {
                            lsObj['schoolYear'] = val.schoolYear + '';
                            angular.forEach($scope.schoolTermList, function(v_) {
                                if (val.schoolTermId == v_.schoolTermId) {
                                    lsObj['schoolTerm'] = v_;
                                }
                            })
                        };
                        lsObj['iscustom'] = val.packageId ? false : true
                        lsObj['package_']['feeType'] = val.feeType;
                        lsObj['package_']['packagePrice'] = val.prizePrice;
                        lsObj['package_']['packageTime'] = val.buyTime;
                        lsObj['package_']['giveTime'] = val.giveTime;
                        if (val && val.feeType == '2') {
                            lsObj['monthNum'] = getDatemonth(lsObj.beginTime, lsObj.endTime);
                        }
                        if (val && val.feeType == '2') {
                            lsObj['package_']['packageUnitPrice'] = numAccuracy((lsObj['package_']['packagePrice'] / lsObj['package_']['packageTime']) * 30);
                        } else {
                            lsObj['package_']['packageUnitPrice'] = numAccuracy(lsObj['package_']['packagePrice'] / lsObj['package_']['packageTime']);
                        }
                        lsObj['package'] = angular.copy(lsObj['package_']);
                        console.log(lsObj);
                        prizeCourseList.push(lsObj);
                    } else if (val.prizeType = 'goods') {
                        var lsObj = {
                            'goodsId': val.prizeId,
                            'prizeType': 'goods',
                            'goodsName': val.prizeName,
                            'goodsPrice': val.unitPrice,
                            'num': val.prizeNumber,
                        };
                        prizeGoodsList.push(lsObj);
                    }
                });
                $scope.templateData = { //活动设置数据
                    musicList: d.musicLibraryList,
                    basicInfo: {
                        activityName: d.activityName,
                        startTime: $.format.date(d.beginTime, "yyyy-MM-dd HH:mm:ss"),
                        endTime: d.endTime ? $.format.date(d.endTime, "yyyy-MM-dd HH:mm:ss") : '',
                        musicType: '0',
                        musicUrl: d.musicLibrary ? '' : d.activityMusic,
                        bacMusic: musicInfo,
                        telephone: d.telephone, //机构电话
                    },
                    prizeInfo: {
                        course: prizeCourseList,
                        goods: prizeGoodsList,
                        describeList: prizeList,
                        num: d.places ? d.places : '',
                        originalPrice: d.originalPrice,
                        floorPrice: d.floorPrice,
                        totalNumber: d.totalNumber,
                        selfNumber: d.selfNumber,
                        friendNumber: d.friendNumber ? d.friendNumber : '',
                        activityRule: d.activityRule,
                        paySwitch: d.paySwitch ? true : false,
                    },
                    organInfo: organInfoList,
                    appoinInfo: {
                        sex: false,
                        age: false,
                        birthday: false,
                        schoolname: false,
                        gradle: false,
                    },
                    organ: {
                        name: d.shopName,
                        phone: d.shopPhone ? d.shopPhone.split(',') : [''],
                        address: d.shopAddress,
                        code: d.shopQrCode
                    },
                    shareInfo: {
                        titlesrc: d.shareImageUrl,
                        title: d.shareTitle,
                        desc: d.shareDesc,
                        url: shareHref + '/h5/show_template/'
                    }
                };
                angular.forEach(reservationInfo, function(val) {
                    $scope.templateData['appoinInfo'][val] = true;
                });
                //如果是拼团活动
                if (d.activityType == 4) {
                    // delete $scope.templateData['appoinInfo'];
                    $scope.templateData['basicInfo']['startTime'] = $.format.date(d.beginTime, "yyyy-MM-dd");
                    $scope.templateData['basicInfo']['endTime'] = $.format.date(d.endTime, "yyyy-MM-dd");
                    $scope.templateData['prizeInfo']['prepaymentFlag'] = d.prepaymentFlag ? true : false;
                    $scope.templateData['prizeInfo']['prepayment'] = d.prepayment;
                    $scope.templateData['prizeInfo']['viewFlag'] = d.viewFlag ? true : false;
                    $scope.templateData['prizeInfo']['groupLimit'] = d.groupLimit ? true : false;
                    $scope.templateData['prizeInfo']['limitItems'] = d.groupLimit ? (d.limitItems + '') : '0';
                }
            } else if (d.activityType == 5) {
                $scope.templateData = {
                    basicInfo: {
                        activityName: d.activityName,
                        startTime: $.format.date(d.beginTime, "yyyy-MM-dd HH:mm:ss"),
                        endTime: d.endTime ? $.format.date(d.endTime, "yyyy-MM-dd HH:mm:ss") : '',
                        musicType: '0',
                        musicUrl: d.musicLibrary ? '' : d.activityMusic,
                        bacMusic: musicInfo,
                        coverImg: d.backImageUrl, //封面图
                        coverImginit: $scope.initCoverImg,
                        telephone: d.telephone, //机构电话
                    },
                    activityDesShow: 0, //展示的模板序号
                    activityDes: [], //活动说明
                    appoinInfo: { //报名信息
                        sex: false,
                        age: false,
                        birthday: false,
                        schoolname: false,
                        gradle: false,
                    },
                    advancedSetting: { //高级设置
                        peoMax: d.entryNum ? true : false, //开启报名学员上限
                        peoMaxNum: d.entryNum ? d.entryNum : 0, //报名学员上限人数
                        peoLimit: d.entryRequirements ? true : false, //开启新老学员报名限制
                        peoLimitType: d.entryRequirements, //仅允许未签约的学员参与活动报名
                    },
                    referralSwitch: d.referralSwitch == 1 ? true : false,
                    prizeBigIntro: d.prizeBigIntros && d.prizeBigIntros.length > 0 ? getArr(d.prizeBigIntros) : [
                        { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
                    ],
                    activityRule: d.activityRule ? d.activityRule : "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
                    shareInfo: {
                        titlesrc: d.shareImageUrl,
                        title: d.shareTitle,
                        desc: d.shareDesc,
                        url: shareHref + '/h5/show_template/'
                    }
                };
                angular.forEach(d.teacherIntros, function(v1) {
                    var modeList = {
                        title: v1.title,
                        content: [],
                    }
                    angular.forEach(v1.activityAuxiliaries, function(v2) {
                        if (v2.content) {
                            modeList.content.push({ type: 'text', value: v2.content });
                        } else {
                            modeList.content.push({ type: 'img', value: v2.imageUrl });
                        }
                    })
                    $scope.templateData['activityDes'].push(modeList);
                })
                angular.forEach(reservationInfo, function(val) {
                    $scope.templateData['appoinInfo'][val] = true;
                });
            } else if (d.activityType == 6) {
                var prizeBigIntro = [],
                    prizeCourseList = [];
                angular.forEach(d.prizeBigIntros, function(v1) {
                    if (v1.content) {
                        prizeBigIntro.push({ type: 'text', value: v1.content });
                    } else {
                        prizeBigIntro.push({ type: 'img', value: v1.imageUrl });
                    }
                })
                angular.forEach(d.activityPrizeList, function(val, index) {
                    if (val.prizeType == 'course') {
                        var lsObj = {
                            'courseId': val.prizeId,
                            'prizeType': 'course',
                            'courseName': val.prizeName,
                            'packageList': val.packageList,
                            'packageList_old': angular.copy(val.packageList),
                            'activityPrizeId': val.activityPrizeId,
                            'package': {},
                            'package_': {},
                            'chargeStandardId': val.chargeStandardId,
                            'chargeType': '',
                            'monthNum': 0,
                            'course': {
                                'chargeStandardId': val.chargeStandardId,
                                'courseId': val.prizeId,
                                'courseName': val.prizeName,
                            }
                        };
                        if (val.feeType == 2) {
                            lsObj['beginTime'] = $.format.date(val.beginTime, 'yyyy-MM-dd');
                            lsObj['endTime'] = $.format.date(val.endTime, 'yyyy-MM-dd');
                        }
                        angular.forEach(val.packageList, function(val_) {
                            if (val.packageId == val_.packageId) {
                                lsObj['package_'] = val_;

                            }
                        });
                        if (val.schoolTermId) {
                            lsObj['schoolYear'] = val.schoolYear + '';
                            angular.forEach($scope.schoolTermList, function(v_) {
                                if (val.schoolTermId == v_.schoolTermId) {
                                    lsObj['schoolTerm'] = v_;
                                }
                            })
                        };
                        lsObj['iscustom'] = val.packageId ? false : true
                        lsObj['package_']['feeType'] = val.feeType;
                        lsObj['package_']['packagePrice'] = val.prizePrice;
                        lsObj['package_']['packageTime'] = val.buyTime;
                        lsObj['package_']['giveTime'] = val.giveTime;
                        lsObj['package_']['activityPrice'] = val.activityPrice;
                        lsObj['package_']['activityPlaces'] = val.activityPlaces;
                        lsObj['package_']['soldCopies'] = val.soldCopies;
                        if (val && val.feeType == '2') {
                            lsObj['package_']['packageUnitPrice'] = numAccuracy((lsObj['package_']['packagePrice'] / lsObj['package_']['packageTime']) * 30);
                        } else {
                            lsObj['package_']['packageUnitPrice'] = numAccuracy(lsObj['package_']['packagePrice'] / lsObj['package_']['packageTime']);
                        }
                        lsObj['package'] = angular.copy(lsObj['package_']);
                        console.log(lsObj);
                        prizeCourseList.push(lsObj);
                    }
                });
                $scope.templateData = {
                    basicInfo: {
                        activityName: d.activityName,
                        startTime: $.format.date(d.beginTime, "yyyy-MM-dd HH:mm:ss"),
                        endTime: d.endTime ? $.format.date(d.endTime, "yyyy-MM-dd HH:mm:ss") : '',
                        coverImg: d.backImageUrl, //封面图
                        coverImginit: $scope.initCoverImg,
                        musicType: '0', //是音乐库的还是自定义的
                        bacMusic: musicInfo,
                        telephone: d.telephone, //机构电话
                    },
                    activityPrizeListShow: 0, //展示的模板序号
                    activityPrizeList: prizeCourseList,
                    prizeInfo: {
                        activityRule: d.activityRule
                    },
                    prizeBigIntro: prizeBigIntro,
                    organInfo: organInfoList,
                    appoinInfo: { //报名信息
                        sex: false,
                        age: false,
                        birthday: false,
                        schoolname: false,
                        gradle: false,
                    },
                    advancedSetting: { //高级设置
                        groupLimit: d.groupLimit ? true : false, //开启限制限购数量
                        courseLimit: d.courseLimit ? true : false, //开启新老学员报名限制
                        limitItems: d.limitItems ? d.limitItems : 0,
                        limitNum: d.limitNum ? d.limitNum : 0
                    },
                    organ: {
                        name: d.shopName,
                        phone: d.shopPhone ? d.shopPhone.split(',') : [''],
                        address: d.shopAddress,
                        code: d.shopQrCode
                    },
                    shareInfo: {
                        titlesrc: d.shareImageUrl,
                        title: d.shareTitle,
                        desc: d.shareDesc,
                        url: shareHref + '/h5/show_template/'
                    }
                }

            }
        };

        function getArr(list) {
            var arr = [];
            angular.forEach(list, function(v) {
                var modeList = {};
                if (v.content) {
                    modeList = { type: 'text', value: v.content };
                } else {
                    modeList = { type: 'img', value: v.imageUrl };
                }
                arr.push(modeList);
            });
            return arr;
        }
        // 手机滚动效果
        function darg(box) {
            box.onmousewheel = function(e) {
                e.stopPropagation();
                var wheelStep = -e.wheelDelta / 120 * 30;
                box.scrollTop = box.scrollTop + wheelStep;
            }
        };

        //点击编辑复制删除按钮
        function operation(type, d) {
            var tips = '',
                n_, isCall_;
            $scope.operationLine = angular.copy(d);
            console.log(d)
            if (type == 5 || type == 6 || type == 7) { //如果是点击上下架、同步家长端、同步微官网
                var t_ = '',
                    p_, d_;
                switch (type) {
                    case 5:
                        t_ = d.upDownStatus == 1 ? '活动下架后，保留活动数据，将不能再参加该活动，确定下架该活动吗？' : '确定要发布该活动吗';
                        p_ = { 'activityId': d.activityId, 'upDownStatus': d.upDownStatus == 1 ? 0 : 1 };
                        d_ = ['upDownStatus', d.upDownStatus == 1 ? 0 : 1]; //标识要修改的字段和值
                        break;
                    case 6:
                        if (d.upDownStatus == 0) {
                            layer.msg('该活动已下架');
                            return;
                        }
                        t_ = d.synchronization ? '该活动确定要取消同步到家长端吗？' : '该活动确定要同步到家长端吗？';
                        p_ = { 'activityId': d.activityId, 'synchronization': d.synchronization ? 0 : 1 };
                        d_ = ['synchronization', d.synchronization ? 0 : 1];
                        break;
                    case 7:
                        if (d.upDownStatus == 0) {
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
                        url: CONFIG.URL + '/api/oa/activity/syncStatus',
                        type: 'post',
                        data: JSON.stringify(p_),
                        success: function(data) {
                            if (data.status == "200") {
                                layer.msg('更改完成');
                                $scope.clickLineData[d_[0]] = d_[1]; //把要修改的字段和值赋值给本条点击的数据
                                //                              pagerRender = false;
                                getActivityList(start);
                            }
                        }
                    });
                })
                return;
            };

            $.hello({
                url: CONFIG.URL + "/api/oa/activity/detail",
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
                                        url: CONFIG.URL + '/api/oa/activity/delete',
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

        function getShowCourseList(str) {
            $.hello({
                url: CONFIG.URL + "/api/oa/course/listExperienceCourse",
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        if (str) {
                            var arr = str.split(',');
                            angular.forEach(res.context, function(val) {
                                angular.forEach(arr, function(val_) {
                                    if (val.experienceCourseId == val_) {
                                        val.hasSelected = true;
                                        $scope.templateData.showCourseList.push(val);
                                    }
                                })
                            })
                        }
                        $scope.screen_showCourseList = res.context;
                    };
                }
            });
        }

        //预约活动列表（预约、砍价、助力、拼团）
        function getActivityList(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                'start': start_,
                'count': eachPage,
                'activityName': $searchName,
                'beginTime': $time ? $time.split(' 到')[0] + ' 00:00:00' : undefined,
                'endTime': $time ? $time.split(' 到')[1] + ' 23:59:59' : undefined,
                'activityType': $scope.studNavJud_,
                'upDownStatus': $scope.$upDownStatus
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/activity/list",
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
                    'searchType': $scope.studNavJud_4 ? $scope.studNavJud_4 : undefined,
                    'activityStyleId': $scope.studNavJud_4 ? $scope.studNavJud_4 : undefined,
                    'activityHolidayId': $scope.studNavJud_5 ? $scope.studNavJud_5 : undefined,
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/activity/listTemplate",
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
                                        text: shareHref + '/h5/show_template/' + val.templateImageUrl + '/index.html'
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
            $searchType = data.type;
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
                        $state.go('myshow')
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
        //点击更换模板
        function changeTemplate(type) {
            $scope.templateTab = type;
            if (type == 1) {
                pagerRender = false;
                getTemplateList(0, $scope.templateData.activityType);
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

        /*
         * 红包砍价数据
         *
         */
        //获取学期列表
        function getSchoolTermList(schoolTermId, obj) {
            $.hello({
                url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                type: "get",
                data: {
                    'pageType': 0,
                },
                success: function(res) {
                    if (res.status == '200') {
                        $scope.schoolTermList = res.context;
                        console.log("学期" + $scope.schoolTermList);
                        console.log($scope.schoolTermList);
                        if (schoolTermId) {
                            angular.forEach(res.context, function(val) {
                                if (schoolTermId == val.schoolTermId) {
                                    obj.schoolTerm = val;
                                }
                            })
                        }
                    };
                }
            })
        }

        //选择学期
        function selSchoolTerm(x, notbuy) {
            var arr_ = [],
                count = 0;
            if (x.schoolTerm) {
                angular.forEach(x.packageList_old, function(val) {
                    if (val.schoolTermId == x.schoolTerm.schoolTermId || val.feeType !== 1) {
                        arr_.push(val);
                        if (val.feeType == 1) count++;
                    }
                })
                x.packageList = angular.copy(arr_);
            } else {
                x.packageList = angular.copy(x.packageList_old);
                count++;
            }
            //清空当前存在数据
            x.package_ = null;
            x.package = { feeType: 1 };
            //套餐列表变化需修改指令内套餐列表
            if (notbuy) {
                $scope.$broadcast(x.mixid, count == 0 ? "按期报名" : "请选择套餐", x.packageList, true)
            } else {
                $scope.$broadcast("norepeat_mix", count == 0 ? "按期报名" : "请选择套餐", x.packageList, true)
            }

        }

        //输入课程购买课时
        function inputPackageTime(x, type) {
            switch (type) {
                case 1:
                    if (x.package) {
                        if (x.package.packageTime == 0) {
                            x.package.packagePrice = 0;
                        } else {
                            x.package.packagePrice = x.package.packageTime ? numAccuracy(x.package.packageUnitPrice * x.package.packageTime) : 0;
                        }
                    }
                    break;
                case 2:
                    if (x.beginTime) {
                        if (x.monthNum == '0' || !x.monthNum) {
                            x.endTime = x.beginTime;
                        } else {
                            x.endTime = $.format.date(getNextMonth_(new Date(x.beginTime), x.monthNum), 'yyyy-MM-dd');
                        }
                        if (x.package) {
                            if (x.chargeType == '1') {
                                x.package.packageTime = x.monthNum;
                            } else {
                                x.package.packageTime = x.monthNum == 0 ? 0 : getIntervalDays(x.beginTime, x.endTime) + 1;
                            }
                            if (x.package.packageTime == 0) {
                                x.package.packagePrice = 0;
                            } else {
                                if (x.chargeType == '1') {
                                    x.package.packagePrice = numAccuracy(x.package.packageUnitPrice * x.package.packageTime);
                                } else {
                                    x.package.packagePrice = numAccuracy((x.package.packageUnitPrice / 30) * x.package.packageTime);
                                }
                            }
                        }
                    };
                    break;
                case 3:
                    if (x.package) {
                        x.package.packageUnitPrice = numAccuracy(x.package.packagePrice / x.package.packageTime);
                        if (x && x.package.feeType == '2' && x.chargeType != '1') {
                            x.package.packageUnitPrice = numAccuracy((x.package.packagePrice / x.package.packageTime) * 30);
                        }

                    }
                    break;
            };
        }

        //选择套餐
        function sel_package(n) {
            console.log(n);
            var d = n.type == 'kj' ? $scope.templateData.prizeInfo.course[n.index] : $scope.templateData.activityPrizeList[$scope.templateData.activityPrizeListShow];
            if (n.data.custom) { //自定义套餐
                d.package = { feeType: n.data.feeType };
                d.iscustom = true;
                d.package_ = null;
            } else {
                d.package = {};
                d.package_ = {};
                //初始套餐赋值
                angular.forEach(d.packageList_old, function(v) {
                    if (v.packageId == n.data.packageId) {
                        for (j in v) {
                            d.package[j] = v[j];
                            d.package_[j] = v[j];
                        }
                    }
                })
                d.iscustom = false;
            }

            d.chargeType = '1';
            d.monthNum = 0;
            switch (n.type) {
                case 'kj': //砍价套餐选择
                    if (!d.iscustom) {
                        if (d && d.package.feeType == '2' && d.package.packageTime) {
                            d.beginTime = $.format.date(new Date(), 'yyyy-MM-dd');
                            d.monthNum = d.package.packageTime * 1;
                            d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum), 'yyyy-MM-dd');
                            if (d.package.packageTime == 0) {
                                d.package.packagePrice = 0;
                            }
                        }
                        //选择按期套餐赋值学期信息
                        if (d && d.package.feeType == '1') {
                            var fl = true; //套餐内学期已被删除标志位
                            angular.forEach($scope.schoolTermList, function(v_) {
                                if (v_.schoolTermId == d.package.schoolTermId) {
                                    d.schoolTerm = v_;
                                    fl = false;
                                }
                            })
                            if (fl) d.schoolTerm = '';
                        }
                    }
                    break;
                case 'buy': //抢购套餐选择
                    if (!d.iscustom) {
                        if (d && d.package.feeType == '2' && d.package.packageTime) {
                            d.beginTime = $.format.date(new Date(), 'yyyy-MM-dd');
                            d.monthNum = d.package.packageTime * 1;
                            d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum), 'yyyy-MM-dd');
                            if (d.package.packageTime == 0) {
                                d.package.packagePrice = 0;
                            }
                        }
                        //选择按期套餐赋值学期信息
                        if (d && d.package.feeType == '1') {
                            var fl = true; //套餐内学期已被删除标志位
                            angular.forEach($scope.schoolTermList, function(v_) {
                                if (v_.schoolTermId == d.package.schoolTermId) {
                                    d.schoolTerm = v_;
                                    fl = false;
                                }
                            })
                            if (fl) d.schoolTerm = '';
                        }
                        //                      rangerTimeforbuy(d);
                    }
                    rangerTimeforbuy(d);
                    break;
            }
        }

        //点击课程开始结束时间 || 时间范围控件
        function selTimeFrame_(d, evt, type, ind) {
            evt.stopPropagation();
            var _s = $scope.selTimeFrame_obj['startLaydate_' + d.time_id],
                _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
            d.package = d.package ? d.package : {};
            //动态加载开始时间和结束时间选择控件（当存在则不加载）
            if (type == 1 && !_s || type == 2 && !_e) {
                var l_ = laydate.render({
                    elem: evt.target, //指定元素
                    isRange: false,
                    min: d.beginTime ? $.format.date(d.beginTime, 'yyyy-MM-dd') : '1970-1-1',
                    format: 'yyyy-MM-dd',
                    done: function(value, value2) {
                        if (type == 1) {
                            d.beginTime = value;
                            var _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
                            if (_e) {
                                //控制结束时间不能小于开始时间
                                _e.config.min = value2;
                                _e.config.min.month--;
                            }
                            if (d.chargeType == 1) { //如果是按月的收费(通过填写的月数获取结束时间)
                                d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum), 'yyyy-MM-dd');
                            }
                        } else {
                            d.endTime = value;
                        }
                        //根据时间计算购买天数
                        if (d.beginTime && d.endTime) {
                            d.monthNum = getDatemonth(d.beginTime, d.endTime);
                            if (d.chargeType == '1') {
                                d.package.packageTime = d.monthNum;
                            } else {
                                d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                            }
                            if (d.package.packageTime == 0) {
                                d.package.packagePrice = 0;
                            } else {
                                if (d.chargeType != '1') {
                                    d.package.packagePrice = numAccuracy(d.package.packageUnitPrice / 30 * d.package.packageTime);
                                }
                            }
                            $scope.$apply();
                        }
                    }
                });
                //预存时间控件
                if (type == 1) {
                    $scope.selTimeFrame_obj['startLaydate_' + d.time_id] = l_;
                } else {
                    $scope.selTimeFrame_obj['endLaydate_' + d.time_id] = l_;
                }
            }
        }

        //砍价活动选择课程
        $scope.$on('砍价活动-课程', function(d, data) {
            //          var judgeReturn = [true, ''];//错误禁止
            data.package = { feeType: 0 };
            var data = [data];
            data[0].courseGoodsRS = []; //无学杂
            angular.forEach(data, function(val, ind) {
                //              handleGoods(val.courseGoodsRS, 'course'); //合并课程自带的学杂
                val.mixid = GenNonDuplicateID(5);
                val.time_id = val.courseId + '_' + new Date().getTime(); //触发时间控件元素的记号，确保唯一性；
                val.course = { 'chargeStandardId': val.chargeStandardId, 'courseId': val.courseId, 'courseName': val.courseName };
                val.chargeType = '1'; //收费类型（天、月）

                val.schoolYear = (new Date()).getFullYear() + '';
                //              if(val.chargeStandardType == '1') {
                //                  val.schoolYear = (new Date()).getFullYear() + '';
                //              } else {
                //                  $.hello({
                //                      url: CONFIG.URL + "/api/oa/sale/getPackageListByChargeStandardId",
                //                      type: "get",
                //                      data: {'chargeStandardId': val.chargeStandardId},
                //                      success: function(res) {
                //                          if(res.status == '200') {
                //                              val.packageList = res.context;
                //                              val.packageList_old = angular.copy(res.context);
                //                          };
                //                      }
                //                  });
                //              }
                val.packageList = val.packages;
                val.packageList_old = angular.copy(val.packageList);
                //                  $.hello({
                //                      url: CONFIG.URL + "/api/oa/sale/getPackageListByChargeStandardId",
                //                      type: "get",
                //                      data: {'chargeStandardId': val.chargeStandardId},
                //                      success: function(res) {
                //                          if(res.status == '200') {
                //                              val.packageList = res.context;
                //                              val.packageList_old = angular.copy(res.context);
                //                              console.log('复制了')
                //                          };
                //                      }
                //                  });
                //              if(val.chargeStandardType == '2') {
                //                  val.beginTime = $.format.date(new Date(), 'yyyy-MM-dd');
                //                  if($scope.templateData.activityType == 4) {
                //                      judgeReturn = [false, '该活动暂时不支持按月课程'];
                //                      return;
                //                  }
                //              }
            });
            //          if(!judgeReturn[0]) {
            //              layer.msg(judgeReturn[1]);
            //              return;
            //          };
            console.log($scope.templateData.prizeInfo.course)
            $scope.templateData.prizeInfo.course.unshift(data[0]);
        });

        //砍价活动选择学杂
        $scope.$on('砍价活动-学杂', function(d, data) {
            handleGoods(data);
        });
        //抢购活动选择课程
        $scope.$on('抢购活动', function(d, data) {
            $scope.fromInit = false;
            console.log("抢购选择课程：" + data)
            data.chargeType = '1';
            data.package = { feeType: 0 };
            data.schoolYear = (new Date()).getFullYear() + '';
            data.packageList = data.packages;
            data.packageList_old = angular.copy(data.packageList);
            $scope.templateData.activityPrizeList.push(data);
            $scope.templateData.activityPrizeListShow = $scope.templateData.activityPrizeList.length - 1
                //课程下套餐
                //          $.hello({
                //              url: CONFIG.URL + "/api/oa/sale/getPackageListByChargeStandardId",
                //              type: "get",
                //              data: {'chargeStandardId': data.chargeStandardId},
                //              success: function(res) {
                //                  if(res.status == '200') {
                //                      data.packageList = res.context;
                //                      data.packageList_old = angular.copy(res.context);
                //                      $scope.templateData.activityPrizeList.push(data);
                //                      $scope.templateData.activityPrizeListShow = $scope.templateData.activityPrizeList.length-1
                //                  };
                //              }
                //          });

        });
        //合并学杂信息
        function handleGoods(objArr, sp) {
            if (objArr.length > 0) {
                angular.forEach(objArr, function(val) {
                    var val_n = {};
                    var judge = true;
                    if (sp == 'course') {
                        val_n = val.goods;
                    } else {
                        val_n = val;
                        val.goodsNumber = 1;
                    }
                    val_n.num = val.goodsNumber;
                    angular.forEach($scope.templateData.prizeInfo.goods, function(val_) {
                        if (val_n.goodsId == val_.goodsId) {
                            val_.num++;
                            judge = false;
                        };
                    });
                    if (judge) {
                        $scope.templateData.prizeInfo.goods.push(val_n);
                    }
                })
            }
        }

        //删除砍价活动数据
        function delete_kanjia(ind, type) {
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
                    case 'course':
                        var _id = $scope.templateData.prizeInfo.course[ind].time_id;
                        $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                        $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                        $scope.templateData.prizeInfo.course.splice(ind, 1);
                        if (!$scope.templateData.prizeInfo.course.length) {
                            $scope.templateData.prizeInfo.goods = [];
                            $scope.templateData.prizeInfo.paySwitch = false;
                        }
                        break;
                    case 'goods':
                        $scope.templateData.prizeInfo.goods.splice(ind, 1);
                        break;
                    case 'prizeImg':
                        $scope.templateData.prizeInfo.imgsrc = '';
                        break;
                }
                $scope.$apply();
                layer.close(isdelete);
            }, function() {
                layer.close(isdelete);
            });
        };

        //添加砍价活动数据
        function add_kanjiaInfo(type) {
            switch (type) {
                case 'prizeImg':
                    setTimeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            $scope.templateData.prizeInfo.imgsrc = data;
                            $scope.$apply();
                        })
                    });
                    break;
            }
        }

        //点击试听音乐
        function auditionMusic(evt) {
            if ($('#audition_music').attr('btnType') == 'on') {
                $('#bacMusic')[0].play();
                $('#audition_music').attr('btnType', 'stop');
                $('#audition_music')[0].className = 'add_info pause_music';
                $('#bacMusicBtn').addClass('music_rotate');
                $('#bacMusicBtn').attr('btnType', 'on');
            } else if ($('#audition_music').attr('btnType') == 'stop') {
                $('#bacMusic')[0].pause();
                $('#audition_music').attr('btnType', 'on');
                $('#audition_music')[0].className = 'add_info play_music';
                $('#bacMusicBtn').removeClass('music_rotate');
                $('#bacMusicBtn').attr('btnType', 'off');
            }
        }

        //各种点击编辑定位功能
        function positionEle() {
            $('.activity_set').on('click', function(event) {
                var _this = $(event.target).closest('.popup_line'); //获取点击元素的属性
                var _this_ = $('#show_contain').find('.' + _this.attr('posEle')); //根据属性寻找所需定位的元素
                if (_this_[0]) { //如果找到该元素则定位到该元素
                    $('#show_contain').scrollTop($('#show_contain').scrollTop() + _this_.offset().top - 100);
                }
            })
        }
        positionEle();

        /*-----------查看活动数据-----------*/
        function seeDataBrowsing(d) {
            //          dialog = layer.open({
            //              type: 1,
            //              title: false,
            //              skin: 'layui-layer-demo', // 样式类名
            //              closeBtn: 0, // 不显示关闭按钮
            //              move: false,
            //              resize: false,
            //              anim: 0,
            //              area: '960px',
            //              offset: '30px',
            //              shadeClose: false, // 开启遮罩关闭
            //              content: $('#show_dataBrowsing')
            //          });
            SEEACTIVITYDATA(d);
            openPopByDiv("数据概览(" + $scope.browsing_lineData.activityName + ")", "#show_dataBrowsing", "960px")
        }

        function SEEACTIVITYDATA(d) {
            var searchType, searchName; //筛选变量
            var pagerRender_act = false,
                start_act = 0,
                eachPage_act = localStorage.getItem('actBrowsing') ? localStorage.getItem('actBrowsing') : 10; //页码初始化
            $scope.prizeUseStatus = null;
            $scope.potentialCustomerType = null;
            $scope.groupStatus = null;
            $scope.browsing_lineData = d; //点击数据按钮的整条活动信息
            console.log(d)
            $scope.browsingShow = 1; //1:数据总览 2：有效用户3：转介绍汇总
            $scope.browsingNav = browsingNav; //点击切换查看数据tab
            $scope.overViewMapTab = { type: 0, name: '浏览量' }; //数据统计图tab标记
            $scope.overViewMapTime = ''; //数据统计图时间选择
            $scope.getOverViewTrendData = getOverViewTrendData; //点击切换查看数据统计图tab
            $scope.browsing_showPeoInfo = browsing_showPeoInfo; //点击查看用户信息
            $scope.browsing_viewOrder = browsing_viewOrder; //打开订单详情
            $scope.changeStatus = changeStatus; //更改使用状态
            $scope.browsing_operate = browsing_operate; //各种骚操作
            $scope.operatePop = operatePop; //操作弹框
            getOverViewData(); //获取总浏览数据
            getOverViewTrendData(0, '浏览量');

            $scope.searchData_browsing = {
                1: '姓名',
                3: '联系电话',
            };
            $scope.selectInfoNameId_browsing = '1'; //select初始值
            $scope.SearchData_browsing = SearchData_browsing; //点击搜索
            $scope.changeState = changeState; //点击label搜索
            $scope.actData_onReset = function() { //重置有效用户筛选
                searchType = undefined;
                searchName = undefined;
                $scope.prizeUseStatus = null;
                $scope.potentialCustomerType = null;
                $scope.groupStatus = null;
                pagerRender_act = false;
                getBrowsingPeoData(0);
                $scope.$broadcast("courseChoose", "clearHeadName");
                $scope.kindSearchOnreset(); //调取app重置方法
            };

            $scope.browsingFun = {
                operate: function(type, _da) {
                    switch (type) {
                        case 1: //点击查看拼团详情
                            getBrowsingPT(_da.groupId);
                            $scope.dialog = layer.open({
                                type: 1,
                                title: '查看详情',
                                skin: 'layerui', //样式类名
                                closeBtn: 1, //不显示关闭按钮
                                move: false,
                                resize: false,
                                anim: 0,
                                area: '760px',
                                offset: '30px',
                                shadeClose: false, //开启遮罩关闭
                                content: $('#show_dataBrowsing_detail'),
                            });
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
                    case 1: //导出微传单学员列表
                        window.open(CONFIG.URL + "/api/oa/statistics/exportMiniOrderUserList?" + 'token=' + localStorage.getItem('oa_token') + '&activityId=' + $scope.browsing_lineData.activityId);
                        break;
                    case 2: //导出转介绍
                        window.open(CONFIG.URL + "/api/oa/referral/exportReferralRecord?" + 'activityId=' + $scope.browsing_lineData.activityId);
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
                if (type == 'zhuanJieshao') {
                    pagerRender_act = false;
                    getlistReferralRecord(0);
                } else {
                    pagerRender_act = false;
                    getBrowsingPeoData(0);
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
                pagerRender_act = false;
                getBrowsingPeoData(0);
            }

            //点击切换tab
            function browsingNav(type) {
                $scope.browsingShow = type;
                searchType = undefined;
                searchName = undefined;
                $scope.potentialCustomerType = null;
                $scope.prizeUseStatus = null;
                $scope.deafautPrizeId = null;

                switch (type) {
                    case 1: //数据汇总
                        getOverViewData();
                        getOverViewTrendData(0, '浏览量');
                        break;
                    case 2: //有效用户
                        pagerRender_act = false;
                        if ($scope.browsing_lineData.activityType == 6) {
                            getlistCourse()
                        }
                        getBrowsingPeoData(0);
                        break;
                    case 3: //拼团列表
                        pagerRender_act = false;
                        getBrowsingPeoData(0);
                        break;
                    case 4: //售课情况
                        pagerRender_act = false;
                        getlistCourse();
                    case 5: //转介绍汇总
                        $scope.searchData_browsing_jies = {
                            studentName: '推荐人姓名、联系方式',
                        };
                        $scope.selectInfoNameId_browsing_jies = 'studentName'; //select初始值
                        pagerRender_act = false;
                        getlistReferralRecord(0);
                        break;
                }
            }

            //获取拼团详情列表
            function getBrowsingPT(id) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/groupDetail",
                    type: "get",
                    data: { 'groupId': id },
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
                }
                //课程选择
            function searchByHandle(val) {
                var activityPrizeId = null;
                if (val == null) {
                    activityPrizeId = null;
                } else {
                    activityPrizeId = val.activityPrizeId;
                }
                pagerRender_act = false;
                getBrowsingPeoData(0, activityPrizeId);
            }
            //获取售课情况
            function getlistCourse() {
                var params = {
                    'activityId': d.activityId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/listCourse",
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
            function getBrowsingPeoData(start, id) {
                var params = {
                    'activityId': d.activityId,
                    'activityType': $scope.studNavJud_,
                    'searchType': searchType,
                    'searchName': searchName,
                    'prizeUseStatus': $scope.prizeUseStatus != null ? $scope.prizeUseStatus : undefined,
                    'potentialCustomerType': $scope.potentialCustomerType != null ? $scope.potentialCustomerType : undefined,
                    'start': start,
                    'count': eachPage_act,
                };
                if (id) {
                    params['activityPrizeId'] = id;
                }
                if ($scope.studNavJud_ == 3) { //助力
                    params['activitySuccess'] = $scope.groupStatus != null ? $scope.groupStatus : undefined;
                } else if ($scope.studNavJud_ == 4) { //拼团
                    if ($scope.browsingShow == 3) { //查看拼团列表tab
                        params = {
                            'activityId': d.activityId,
                            'activityType': $scope.studNavJud_,
                            'searchType': searchType,
                            'searchName': searchName,
                            'groupStatus': $scope.groupStatus != null ? $scope.groupStatus : undefined,
                            'headFlag': 1,
                            'start': start,
                            'count': eachPage_act,
                        };
                    };
                    params['groupStatus'] = $scope.groupStatus != null ? $scope.groupStatus : undefined;
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/getUserList",
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.overViewDataList = res.context.items;
                            if ($scope.overViewDataList.length > 0) {
                                browsingPeoPager(res.context.totalNum);
                            }
                        };
                    }
                });
            };

            function getlistReferralRecord(start_) {
                var params = {
                    start: start_ || "0",
                    count: eachPage_act,
                    searchType: searchName ? "appSearchName" : undefined,
                    searchName: searchName,
                    activityId: d.activityId,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/referral/listReferralRecord",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.referralList = data.context.items;
                            browsingPeoPager(data.context.totalNum, "zhuanJieshao");
                        };
                    }
                })
            }
            //有效用户分页
            function browsingPeoPager(total, type) { //分页
                if (pagerRender_act)
                    return;
                pagerRender_act = true;
                var $M_box3 = $('.browsing_box3');
                $M_box3.pagination({
                    totalData: total || 0, // 数据总条数
                    showData: eachPage_act, // 显示几条数据
                    jump: true,
                    coping: true,
                    count: 2, // 当前页前后分页个数
                    homePage: '首页',
                    endPage: '末页',
                    prevContent: '上页',
                    nextContent: '下页',
                    callback: function(api) {
                        if (api.getCurrentEach() != eachPage_act) { //本地存储记下每页多少条
                            eachPage_act = api.getCurrentEach();
                            localStorage.setItem('actBrowsing', eachPage_act);
                        }
                        start_act = (api.getCurrent() - 1) * eachPage_act; // 分页从0开始
                        if (type == "zhuanJieshao") {
                            getlistReferralRecord(start_act)
                        } else {
                            getBrowsingPeoData(start_act);
                        }
                    }
                });
            };

            //获取总览数据
            function getOverViewData() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/getActivityPandect",
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
                    'activityStatus': type,
                };

                if ($scope.overViewMapTime) {
                    params['beginTime'] = $scope.overViewMapTime.split(' 至 ')[0] + ' 00:00:00';
                    params['endTime'] = $scope.overViewMapTime.split(' 至 ')[1] + ' 23:59:59';
                };

                $.hello({
                    url: CONFIG.URL + "/api/oa/activity/getActivityTrend",
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
                                dataAxis.push(val.date);
                                dataName.push(val.total);
                                dataSeries.data.push(val.total);
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