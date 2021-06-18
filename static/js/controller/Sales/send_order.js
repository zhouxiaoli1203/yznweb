define(['MyUtils', "jqFrom", "laydate", "pagination", "mySelect", "signUp", "potential_pop", "courseAndClass_sel", 'importPop', "qrcode", 'students_sel', "orderInfo", "customPop"], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchType = "nameOrPhone",
            searchName, $status, adviserId;
        var pagerRender_ = false,
            start_ = 0,
            eachPage_ = localStorage.getItem('batchPage') ? localStorage.getItem("batchPage") : 10; //页码初始化
        var searchType_ = "nameOrPhone",
            searchName_, $status_;
        $scope.remind_selected = undefined;
        var adviserId_;

        var dialog_;
        var shareHref = window.location.protocol + '//' + window.location.host;
        $scope.showInd = null;
        $scope.unbindSevice_msg = false; //新增推单为绑定服务号的回调判断
        if (window.location.host == 'www.yizhiniao.com') {
            shareHref = window.location.protocol + '//' + 'm.yizhiniao.com';
        }
        var heads = [
            { name: "学员姓名", checked: true, fixed: "1" },
            { name: "联系方式", checked: true },
            { name: "订单内容", checked: true },
            { name: "订单价格", checked: true },
            { name: "推单待收", checked: true },
            { name: "对内备注", checked: true },
            { name: "对外备注", checked: true },
            { name: "顾问", checked: true },
            { name: "付款截止日期", checked: true },
            { name: "上次提醒时间", checked: true },
            { name: "状态", checked: true },
            { name: "操作", checked: true, fixed: "-1" },
        ];
        init();

        function init() {
            if ($rootScope.fromOrgn) {
                $scope.checkedHead = heads;
            } else {
                getCustomTag();
            }
            getConfig();
            getAdviserName(); //获取顾问列表
            $scope.params_order = [];
            $scope.selectInfoNameId = 'studentName'; //select初始值
            $scope.kindSearchData = {
                studentName: '学员姓名、联系方式',
            };
            $scope.nameListThead = [
                { 'name': '', 'width': '130', fixed: "1", td: `<td></td>` },
                { 'name': '联系方式', 'width': '95', td: `<td title="{{x.phoneNumber}}">{{x.phoneNumber}}</td>` },
                { 'name': '订单内容', 'width': '200', td: `<td class="overheight" ng-mouseenter="showContent(x,$index,$event)" ng-mouseleave="hideContent()">
                            <div style="max-height:29px;">
                                <div class="lis">
                                    <!--收费标准类型 0 课时 1 学期 2按月-->
                                    <div ng-repeat="y in x.orderCourseList track by $index" ng-if="y.feeType == 0">
                                        [{{y.courseName}}] 签约金额:￥{{y.amount|number:2}}元 购买课时:{{y.buyTime|number:2}} {{y.giveTime?"赠送课时:":""}} {{y.giveTime?(y.giveTime|number:2):""}}
                                    </div>
                                    <div ng-repeat="y in x.orderCourseList track by $index" ng-if="y.feeType == 1">
                                        [{{y.schoolYear}} {{y.schoolTermName}} {{y.courseName}}] 签约金额:￥{{y.amount|number:2}}元 购买课时:{{y.buyTime|number:2}} {{y.giveTime?"赠送课时:":""}} {{y.giveTime?(y.giveTime|number:2):""}}
                                    </div>
                                    <div ng-repeat="y in x.orderCourseList track by $index" ng-if="y.feeType == 2">
                                        [{{y.courseName}}] 签约金额:￥{{y.amount|number:2}}元 上课时间:{{y.beginTime|yznDate:'yyyy-MM-dd'}}至{{y.endTime|yznDate:'yyyy-MM-dd'}} {{y.giveTime?"赠送天数:":""}} {{y.giveTime?(y.giveTime|number:2):""}}
                                    </div>
                                </div>
                                <div class="lis" ng-if="x.orderGoods.length>0">
                                    <div ng-repeat="y in x.orderGoods track by $index">
                                        [{{y.goodsName}}{{y.goodsSpec?'*'+ y.goodsSpec.name:''}}]{{y.goodsPrice?(y.goodsPrice|number:2):"0.00"}}元*{{y.goodsNumber?(y.goodsNumber):"0"}}={{y.goodsTotalPrice?(y.goodsTotalPrice|number:2):"0.00"}}元
                                    </div>
                                </div>
                            </div>
                            <div class="showXuanfu" ng-show="$index == showInd">
                                <div class="lis">
                                    <!--收费标准类型 0 课时 1 学期 2按月-->
                                    <div ng-repeat="y in x.orderCourseList track by $index" ng-if="y.feeType == 0">
                                        [{{y.courseName}}] 签约金额:￥{{y.amount|number:2}}元 购买课时:{{y.buyTime|number:2}} {{y.giveTime?"赠送课时:":""}} {{y.giveTime?(y.giveTime|number:2):""}}
                                    </div>
                                    <div ng-repeat="y in x.orderCourseList track by $index" ng-if="y.feeType == 1">
                                        [{{y.schoolYear}} {{y.schoolTermName}} {{y.courseName}}] 签约金额:￥{{y.amount|number:2}}元 购买课时:{{y.buyTime|number:2}} {{y.giveTime?"赠送课时:":""}} {{y.giveTime?(y.giveTime|number:2):""}}
                                    </div>
                                    <div ng-repeat="y in x.orderCourseList track by $index" ng-if="y.feeType == 2">
                                        [{{y.courseName}}] 签约金额:￥{{y.amount|number:2}}元 上课时间:{{y.beginTime|yznDate:'yyyy-MM-dd'}}至{{y.endTime|yznDate:'yyyy-MM-dd'}} {{y.giveTime?"赠送天数:":""}} {{y.giveTime?(y.giveTime|number:2):""}}
                                    </div>
                                </div>
                                <div class="lis" ng-if="x.orderGoods.length>0">
                                    <div ng-repeat="y in x.orderGoods track by $index" style="display: block;">
                                        [{{y.goodsName}}{{y.goodsSpec?'*'+ y.goodsSpec.name:''}}]{{y.goodsPrice?(y.goodsPrice|number:2):"0.00"}}元*{{y.goodsNumber?(y.goodsNumber):"0"}}={{y.goodsTotalPrice?(y.goodsTotalPrice|number:2):"0.00"}}元
                                    </div>
                                </div>
                            </div>
                        </td>` },
                { 'name': '订单价格', 'width': '100', td: `<td>￥{{x.receivable|number:2}}</td>` },
                { 'name': '推单待收', 'width': '100', td: `<td>￥{{x.received|number:2}}</td>` },
                { 'name': '对内备注', 'width': '110', td: `<td title="{{x.remark}}">{{x.remark}}</td>` },
                { 'name': '对外备注', 'width': '110', td: `<td title="{{x.externalRemark}}">{{x.externalRemark}}</td>` },
                { 'name': '顾问', 'width': '100', td: `<td>{{x.counselor}}</td>` },
                { 'name': '付款截止日期', 'width': '110', td: `<td>{{x.deadline|yznDate:'yyyy-MM-dd'}}</td>` },
                { 'name': '上次提醒时间', 'width': '140', td: `<td>{{x.lastRemindTime?(x.lastRemindTime|yznDate:'yyyy-MM-dd'):"提醒失败"}}<span ng-if="x.lastRemindTime">({{x.remindStatus==0?"未查看":x.remindStatus==1?"已查看":x.remindStatus == '-1'?"提醒失败":""}})</span></td>` },
                { 'name': '状态', 'width': '100', td: `<td>{{x.status==0?"待支付":x.status==1?"已支付":x.status==2?"已过期":""}}</td>` },
                { 'name': '', 'width': '150', fixed: '-1', td: `<td></td>` },
            ];
            $scope.operatePushOrder = checkAuthMenuById("123"); //操作订单
            $scope.Enterkeyup = Searchdata;
            $scope.SearchData = Searchdata;
            $scope.changeStatus = changeStatus; //切换状态
            $scope.changeRemind = changeRemind; //切换状态
            $scope.searchByAdviser = searchByAdviser; //顾问筛选
            $scope.openDelayPop = openDelayPop; //打开延期弹框
            $scope.openSendCode = openSendCode; //推单二维码
            $scope.clickShareCopy = clickShareCopy; //复制二维码链接
            $scope.deletePop = deletePop; //删除
            $scope.batchOperate = batchOperate; //批量操作
            $scope.closePop = closePop;
            $scope.showContent = showContent;
            $scope.hideContent = hideContent;
            $scope.gotoViewStudent = gotoViewStudent; //查看潜客、学员详情
            $scope.openPop = openPop; //查看提醒失败
            $scope.remindPop = remindPop; //重新提醒
            $scope.openCheckPoster = openCheckPoster; //海报引导
            $scope.saveThePoster = saveThePoster; //电脑保存至本地
            $scope.closePop_ = function() {
                layer.close(dialog_);
            }
            $scope.onReset = onReset; //重置
            $scope.newAddOrder = newAddOrder; //新增推单
            $scope.delay_confirm = delay_confirm; //延期推单确认按钮
            laydate.render({
                elem: '#delay', //指定元素
                isRange: false,
                min: 0,
                btns: ["clear", "confirm"],
                done: function(value) {
                    $scope.delayDate = value;
                }
            })
            getSendorder(0);
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新增推单") {
                    setTimeout(function () {
                        newAddOrder();
                    })
                }
            }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            SERVICE.CUSTOMPOP.TABLE["订单推送表头-自定义"] = function(data) {
                $scope.checkedHead = data.customTag;
            }
            $scope.$watch("checkedHead", function(n, o) {
                //          if(n === o || n == undefined) return;   //防止第一次重复监听
                $scope.nameListThead_ = getTableHead($scope.checkedHead, $scope.nameListThead);
                $timeout(function() {
                    $scope.reTheadData_['sendOrderHead']();
                    $scope.$broadcast("sendOrderTdChange", $scope.checkedHead);
                }, 100, true)

            }, true);
        }

        function getCustomTag() {
            var param = {
                customTagType: 7,
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
            if (checkAuthMenuById("65") || checkAuthMenuById("13") || checkAuthMenuById("29")) {
                window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', { 'page': 0, 'item': x, 'tab': 1 });
            } else {
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览潜客或浏览学员权限。");
            }
        }

        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.shopId = data.context.shopId;
                    }
                }
            })
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

        function showContent(x, ind, e, isPop) {
            if (!x.orderCourseList && !x.orderGoods) {
                return;
            }
            $scope.showInd = ind;
            var e_ = $(e.currentTarget);
            var top_ = e_.offset().top - 30;
            var left_ = e_.offset().left + 100;
            var $this = $(e.target);
            var initleft = $('.batch_pop').offset().left;
            if (isPop) {
                left_ = left_ - initleft;
            }
            $this.closest("td").find(".showXuanfu").css({
                left: left_,
                top: top_
            });
            //          console.log($(e.target));
        }

        function hideContent() {
            $scope.showInd = null;
        }
        //新增推单成功回调
        $scope.$on('newPushOrderSuccess', function(event, data) {
            pagerRender = false;
            getSendorder(0);
            if (data == "unbindSevice") {
                $timeout(function() {
                    $scope.unbindSevice_msg = true;
                    $scope.shareInfo = shareHref + '/h5/common/pushOrder/index.html?shopId=' + $scope.shopId;
                    $('#shareCode_').html('');
                    jQuery('#shareCode_').qrcode({
                        render: "canvas", //也可以替换为table
                        width: 80,
                        height: 80,
                        text: $scope.shareInfo
                    });
                    openPopByDiv("订单已保存", ".remindFail_pop", "560px");
                    console.log(11);
                });
            }
        });
        //新增推单
        function newAddOrder() {
            //确定选择学员
            $scope.$on('推单-学员', function(d, d_) {
                    $scope.$broadcast('推单-学员-sign', d_);
                })
                //确定选择班级
            $scope.$on('推单-班级', function(d, d_) {
                $scope.$broadcast('推单-班级-sign', d_);
            });



            var param = {
                'page': 1,
                'item': {},
                'title': '推单',
                'location': "pushOrder",
            };

            if (window.currentUserInfo.shop.auditStatus == 2) {
                window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
            } else {
                var isEdit = layer.confirm('您的机构尚未开通易收宝线上收款功能，无法将订单推送给学员进行线上支付。如需开通此功能（免费），请前往“财务管理>易收宝”提交申请材料。', {
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
            }
        }

        function onReset() {
            $scope.allChecked = false;
            searchName = $status = adviserId = undefined;
            $scope.selected = null;
            $scope.remind_selected = undefined;
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            pagerRender = false;
            getSendorder(0);
        }

        function searchByAdviser(val) {
            if (val == null) {
                adviserId = undefined;
            } else {
                adviserId = val.shopTeacherId;
            }
            pagerRender = false;
            getSendorder(0);
        }

        function closePop() {
            layer.close(dialog);
        }

        function openSendCode() {
            $scope.shareInfo = shareHref + '/h5/common/pushOrder/index.html?shopId=' + $scope.shopId;
            $('#shareCode').html('');
            jQuery('#shareCode').qrcode({
                render: "canvas", //也可以替换为table
                width: 120,
                height: 120,
                text: $scope.shareInfo
            });
            openPopByDiv("推单二维码", ".send_code", "760px");
        }

        function clickShareCopy() {
            copyToClipboard($('#shareCopyText')[0]);
            layer.msg('复制成功')
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

        function openDelayPop(type, x) {
            $scope.pushOrder = angular.copy(x);

            $scope.delayType = type;
            if ($scope.delayType == "batch") {
                if ($scope.params_order == "" || $scope.params_order == []) {
                    return layer.msg("请选择需要延期的订单！");
                }
            }
            openPopByDiv("订单延期", ".delay_pop", "560px");
        }

        function delay_confirm() {
            var param = {},
                url = "";
            if ($scope.delayType == 'single') {
                url = "/api/oa/pushOrder/delayPayment";
                param = {
                    pushOrderId: $scope.pushOrder.pushOrderId,
                    deadline: $scope.delayDate + " 23:59:59"
                };
            } else {
                url = "/api/oa/pushOrder/delayPaymentBatch";
                param = {
                    pushOrderIds: getPushOrderId(),
                    deadline: $scope.delayDate + " 23:59:59"
                };
            }
            $.hello({
                url: CONFIG.URL + url,
                type: 'post',
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == "200") {
                        if ($scope.delayType == 'batch') {
                            $scope.$emit("changeBatch");
                        }
                        closePop();
                        pagerRender = false;
                        getSendorder(0);
                    }
                }
            })
        }

        function openPop(x, t) {
            if (t == "查看原因") {
                $scope.studentInfo = "【" + x.studentName + "】";
            } else {
                $scope.studentInfo = angular.copy(x);
            }
            $scope.shareInfo = shareHref + '/h5/common/pushOrder/index.html?shopId=' + $scope.shopId;
            $('#shareCode_').html('');
            jQuery('#shareCode_').qrcode({
                render: "canvas", //也可以替换为table
                width: 80,
                height: 80,
                text: $scope.shareInfo
            });
            openPopByDiv(t, ".remindFail_pop", "560px");
        }

        function saveThePoster() {
            function convertCanvasToImage(canvas) {
                var img = new Image();
                img.src = canvas.toDataURL("image/png", 1);
                return img;
            }
            var mycanvas = document.createElement('canvas'),
                imgPost = new Image,
                imgQrcode = new Image,
                bs = 2;
            imgQrcode.src = CONFIG.URL + '/api/oa/pushOrder/getWxQrCode?shopId=' + localStorage.getItem('shopId') + "&v=" + new Date().getTime();
            imgPost.src = 'https://cdn.yizhiniao.com/poster.png' + "?v=" + new Date().getTime();
            imgQrcode.crossOrigin = "Anonymous";
            imgPost.crossOrigin = "Anonymous";
            mycanvas.width = 300 * bs;
            mycanvas.height = 966 * bs;

            var ctx = mycanvas.getContext('2d');
            var promiseAll = [
                new Promise(function(resolve) {
                    imgPost.onload = function() {
                        resolve(imgPost)
                    }
                }),
                new Promise(function(resolve) {
                    imgQrcode.onload = function() {
                        resolve(imgQrcode)
                    }
                })
            ];
            Promise.all(promiseAll).then(function(img) {
                ctx.drawImage(imgPost, 0, 0, 300 * bs, 966 * bs);
                ctx.drawImage(imgQrcode, 220 * bs, 224 * bs, 45 * bs, 45 * bs);
                var img = convertCanvasToImage(mycanvas);
                $('body').append("<a id='czbj' href=" + img.src + " download='引导海报'><span>openit</span></a>");
                $('#czbj').hide();
                $('#czbj span').trigger("click");
                $('#czbj').remove();
            })
        }
        var dialog_haibao;

        function openCheckPoster() {
            $('#PosterCode').attr('src', CONFIG.URL + '/api/oa/pushOrder/getWxQrCode?shopId=' + localStorage.getItem('shopId') + "&v=" + new Date().getTime());
            $('#PosterCodeH5').html('');
            jQuery('#PosterCodeH5').qrcode({
                render: "canvas", //也可以替换为table
                width: 120,
                height: 120,
                text: shareHref + '/h5/common/poster/index.html?shopId=' + localStorage.getItem('shopId')
            });
            dialog_haibao = layer.open({
                type: 1,
                title: "查看引导海报",
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: '660px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $("#checkPosters_pop"),
            })
        }

        function remindPop(type, x) {
            var param = {};
            if (type == "batch") {
                if ($scope.params_order == "" || $scope.params_order == []) {
                    return layer.msg("请选择需要重新提醒的订单！");
                }
                param = {
                    pushOrderIds: getPushOrderId(),
                }
            } else {
                param = {
                    pushOrderIds: x.pushOrderId
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/pushOrder/retrySendPushOrderBatch",
                type: 'post',
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == "200") {
                        if (type == "batch") {
                            $scope.$emit("changeBatch");
                        }
                        pagerRender = false;
                        getSendorder(0);
                    } else {
                        openPop(data.message, "提醒失败");
                        if (type == "batch") {
                            $scope.$emit("changeBatch");
                        }
                        pagerRender = false;
                        getSendorder(0);
                        return true;
                    }

                }
            })
        }

        function getPushOrderId() {
            var str = "";
            angular.forEach($scope.params_order, function(v) {
                str += v.pushOrderId + ",";
            });
            return str = str.substr(0, str.length - 1);
        }

        function deletePop(type, x) {
            $scope.delayType = type;
            $scope.pushOrder = angular.copy(x);
            if ($scope.delayType == "batch") {
                if ($scope.params_order == "" || $scope.params_order == []) {
                    return layer.msg("请选择需要删除的订单！");
                }
            }
            detailMsk("推送订单删除后无法恢复，是否确认删除？", function() {
                var param = {},
                    url = "";
                if ($scope.delayType == 'single') {
                    url = "/api/oa/pushOrder/delPushOrder";
                    param = {
                        pushOrderId: $scope.pushOrder.pushOrderId,
                    };
                } else {
                    url = "/api/oa/pushOrder/delPushOrderBatch";
                    param = {
                        pushOrderIds: getPushOrderId(),
                    };
                }
                $.hello({
                    url: CONFIG.URL + url,
                    type: 'post',
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == "200") {
                            if ($scope.delayType == 'batch') {
                                $scope.$emit("changeBatch");
                            }
                            pagerRender = false;
                            getSendorder(0);
                        }
                    }
                })
            });
        }

        function batchOperate() {
            dialog_ = layer.open({
                type: 1,
                title: "批量操作",
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: '1160px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(".batch_pop"),
                success: function(layero) {
                    batchInit();
                }
            })

            function batchInit() {
                var adviserId_ = undefined;
                $scope.popNav = [
                    { name: '待支付', tab: 1 },
                    { name: '已过期', tab: 2 },
                ];
                $scope.popNavSelected = 1;
                $scope.kindSearchOnreset_['screenSearch']();
                $scope.params_order = [];
                $scope.allChecked = false;
                $scope.selectInfoNameId_ = 'studentName_'; //select初始值
                $scope.kindSearchData_ = {
                    studentName_: '学员姓名',
                };
                $scope.Enterkeyup_ = Searchdata_;
                $scope.SearchData_ = Searchdata_;
                $scope.searchByAdviser_ = searchByAdviser_;
                $scope.changeRemind_ = changeRemind_;
                $scope.checkboxClick = checkboxClick;
                $scope.changePopNav = changePopNav;
                $scope.sel_order = sel_order;
                $scope.onReset_ = onReset_;
                onReset_();
            }

            function changePopNav(val) {
                $scope.popNavSelected = val;
                onReset_();
            }
            //搜索button
            function Searchdata_(data) {
                searchName_ = data.value;
                pagerRender_ = false;
                getSendorder_(0);
            }

            function searchByAdviser_(val) {
                if (val == null) {
                    adviserId_ = null;
                } else {
                    adviserId_ = val.shopTeacherId;
                }
                pagerRender_ = false;
                getSendorder_(0);
            }

            function changeRemind_(e, type) {
                $scope.remind_selected_ = e.target.checked ? type : undefined;
                pagerRender_ = false;
                getSendorder_(0);
            }

            function onReset_() {
                $scope.params_order = [];
                $scope.allChecked = false;
                searchName_ = adviserId_ = undefined;
                $scope.remind_selected_ = undefined;
                $scope.kindSearchOnreset_['screenSearch'](); //调取app重置方法
                $scope.$broadcast("adviser_id_", "clearHeadName");
                pagerRender_ = false;
                getSendorder_(0);
            }
            //选择订单
            function sel_order(data, evt) {
                var index_ = [false, null];
                if (data.hasChecked) {
                    data.hasChecked = false;
                    angular.forEach($scope.params_order, function(val, ind) {
                        if (data.pushOrderId == val.pushOrderId) {
                            index_ = [true, ind];
                        }
                    });
                    if (index_[0]) {
                        $scope.params_order.splice(index_[1], 1);
                    }
                } else {
                    data.hasChecked = true;
                    $scope.params_order.push(data);
                }
            }
            //if表头有复选框，则调用此方法
            function checkboxClick(e, list) {
                var e = e || event;
                var i_ = [false, null];
                if ($(e.target).prop("checked")) {
                    angular.forEach(list, function(val_1) {
                        if (!val_1.hasChecked) {
                            val_1.hasChecked = true;
                            $scope.params_order.push(val_1);
                        }
                    });
                } else {
                    angular.forEach(list, function(val_1) {
                        val_1.hasChecked = false;
                        i_ = [false, null];
                        angular.forEach($scope.params_order, function(val_2, ind_2) {
                            if (val_1.pushOrderId == val_2.pushOrderId) {
                                i_ = [true, ind_2];
                            }
                        });
                        if (i_[0]) {
                            $scope.params_order.splice(i_[1], 1);
                        }
                    });
                }
            }
        }
        $scope.$on("changeBatch", function() {
            $scope.params_order = [];
            pagerRender_ = false;
            getSendorder_(0);
        });

        function getSendorder_(start_) {
            var params = {
                start: start_.toString() || '0',
                count: eachPage_,
                searchType: searchType_,
                searchName: searchName_,
                shopTeacherId: adviserId_,
                status: $scope.popNavSelected == 1 ? "0" : "2",
                remindStatus: $scope.remind_selected_

            };
            $.hello({
                url: CONFIG.URL + '/api/oa/pushOrder/listPushOrder',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context.items;
                        $scope.orderList_ = list;
                        orderPager_(data.context.totalNum);
                        $scope.totalNum_ = data.context.totalNum;
                        repeatLists($scope.orderList_, $scope.params_order, 'pushOrderId');
                    }
                }
            })
        }

        function orderPager_(total) {
            //分页
            if (pagerRender_) {
                return;
            } else {
                pagerRender_ = true;
            }

            var $M_box3 = $('.batch.M-box3');

            $M_box3.pagination({
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
                        localStorage.setItem("batchPage", eachPage_);
                    }
                    start_ = (api.getCurrent() - 1) * eachPage_; // 分页从0开始
                    getSendorder_(start_); //回掉
                }
            });
        }

        //主列表的筛选
        //搜索button
        function Searchdata(data) {
            searchName = data.value;
            pagerRender = false;
            getSendorder(0);
        }

        function changeStatus(e, type) {
            if (e.target.checked) {
                $scope.selected = type;
                $status = type;
            } else {
                $status = undefined;
            }
            pagerRender = false;
            getSendorder(0);
        }

        function changeRemind(e, type) {
            $scope.remind_selected = e.target.checked ? type : undefined;
            pagerRender = false;
            getSendorder(0);
        }

        function getSendorder(start) {
            var params = {
                start: start.toString() || '0',
                count: eachPage,
                searchType: searchType,
                searchName: searchName,
                status: $status,
                shopTeacherId: adviserId,
                remindStatus: $scope.remind_selected
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/pushOrder/listPushOrder',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context.items;
                        $scope.orderList = list;
                        orderPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }
            })
        }

        function orderPager(total) {
            //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }

            var $M_box3 = $('.page.M-box3');

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
                    getSendorder(start); //回掉
                }
            });
        }
    }]
})