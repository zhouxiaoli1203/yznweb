require.config({
    // urlArgs: 'fv=' + CONFIG.RELEASE_STAMP,  //每次上线如果都变更版本号，会导致大量的文件需要重新加载
    //加载项目所需的js文件，因为不可能一次性加载那么多，利用require延迟或异步加载
    paths: {
        "jq": "../libs/libsJs/jquery.min",
        "angular": "../components/angular/angular.min",
        "ngDraggable": "../components/angular/ngDraggable",
        "angular-ui-router": "../components/angular-ui-router/angular-ui-router.min",
        "angularAMD": "../components/angularAMD/angularAMD",
        "angular-sanitize": "../components/angular-sanitize/angular-sanitize.min",
        "registerRoutes": "js/registerRoutes",
        'css': '../libs/libsJs/css.min',
        "ngload": "../components/angularAMD/ngload.min",
        'extend': "js/extend",
        'app_': "../libs/libsJs/app",
        "jqFrom": "../libs/libsJs/jquery.form",
        "CourseUtils": "js/libs/libsJs/courseUtil",
        //      "cropper": "../libs/libsJs/cropper.min",
        "cropper": "../libs/libsJs/cropper",
        "zcity": "../libs/libsJs/zcity",
        "MyUtils": "../libs/libsJs/util",
        "szpUtil": "js/libs/libsJs/szpUtil",
        //      "ImgCropper": "../libs/libsJs/HeadCropper",
        "layer": "../libs/layer/layer",
        "layui": "../libs/layui/layui",
        "laydate": "../libs/laydate/laydateMain",
        "qiniu": "../libs/qiniu/qiniu.min",
        //      "qiniu_up": "../libs/qiniu/plupload.full.min",
        "SimpleCalendar": "../libs/libsJs/simple-calendar",
        "oldCalendar": "../libs/libsJs/oldCalendar",
        "datePicker": "../libs/datepicker/js/foundation-datepicker",
        "pagination": "../libs/libsJs/jquery.pagination",
        "dateTeacher": "../libs/libsJs/date.teacher",
        "bootstrap": "../libs/bootstrap/js/bootstrap.min",
        "cookie": "../libs/libsJs/cookie",
        "main": "js/main",
        "amap": "https://webapi.amap.com/maps?v=1.3&key=816afd8e181bc83c46f9a4c91b4a0c1e",
        "amapUI": "../libs/amapUI/amapMain",
        // "amapUI": "https://webapi.amap.com/ui/1.0/main.js?v=1.0.11",
        'echarts': '../libs/libsJs/echarts.min',
        "moment": "../libs/datepicker/js/moment.min",
        "timeDaterangepicker": "../libs/datepicker/js/daterangepicker",
        "mySelect": "js/directive/mySelect",
        "moreSelect": "js/directive/moreSelect",
        "inputSelect": "js/directive/selectInput",
        "remarkPop": "js/directive/remarkPop",
        // "nprogress": "../libs/nprogress/nprogress",
        "jqueryDateformat": "../libs/jqueryDateFormat/jquery-dateFormat",
        "rollCall": "js/directive/rollCall",
        "potential_pop": "js/directive/potential_pop",
        "signUp": "js/directive/signUp",
        "addInfos": "js/directive/add_potential",
        "operation": "js/directive/student_operation",
        "hopetime": "js/directive/hopetime",
        "timesel": "js/directive/time_sel",
        "dataTree": "js/directive/data_tree",
        "orderInfo": "js/directive/order_info",
        "classPop": "js/directive/class_pop",
        "clockPop": "js/directive/clock_pop",
        "msgPop": "js/directive/msg_pop",
        "arrangePop": "js/directive/fast_arrange",
        "staffPop": "js/directive/staff_pop",
        "timePop": "js/directive/time_pop",
        "markPop": "js/directive/mark_pop",
        "customPop": "js/directive/customTable_pop",
        "classroomPop": "js/directive/classroom_pop",
        "photoPop": "js/directive/photos_pop",
        "expensePop": "js/directive/expense_pop",
        "importPop": "js/directive/import_pop",
        "coursePop": "js/directive/add_course",
        "bukePop": "js/directive/bukeDetailPop",
        "equipPop": "js/directive/buyequip_pop",
        "basicPop": "js/directive/basic_pop",
        "databasePop": "js/directive/database_pop",
        "onlinePop": "js/directive/createOnline_pop",
        "homewkPop": "js/directive/homewk_pop",
        "listenPop": "js/directive/listen_pop",
        "clsaffairPop": "js/directive/classAffair_pop",
        "courseAndClass_sel": "js/directive/courseAndClass_sel",
        "potial_sel": "js/directive/potial_sel",
        "students_sel": "js/directive/students_Sel",
        "lodop": "../libs/lodop/LodopFuncs",
        "showJs": "../templates/show_template/show",
        "qrcode": '../libs/libsJs/jquery.qrcode.min',
        "directives": "js/directive/directives",
        "filters": "js/filter/filters",
        "coursePackage": "js/directive/coursePackage",
        "creatCoupon": "js/directive/creatCoupon",
        "socketIo": 'js/libs/libsJs/socket.io',
        "staff_sel": "js/directive/staff_sel", //员工选择筛选器
        "countup": "js/libs/libsJs/countUp",
        "exif": "js/libs/libsJs/exif", //读取图片元数据
        "kindeditor": '../libs/kindeditor/kindeditor-all',
        "checkAnswer": "js/directive/checkAnswer",
        "Circles": "../libs/libsJs/circles.min",
        "colorPick": "../libs/libsJs/colorPick",
        "collectionPop": "js/directive/collection_pop",
        "fullPage": "js/directive/fullPage",
        "fullPage_course": "js/controller/fullPages/course",
    },
    //shim配置加载js所需的文件
    shim: {
        // angular
        "angular": {
            exports: "angular"
        },
        "config": {
            exports: "config"
        },
        "cookie": ["jq"],
        "extend": ["jq", "angular"],
        "main": ["jq"],
        "app_": ["jq"],
        "ngDraggable": ["angular"],
        "mySelect": ["angular"],
        "moreSelect": ["angular"],
        "remarkPop": ["angular"],
        "bootstrap": ["jq"],
        "layer": ['css!../libs/layer/skin/default/layer.css', "jq"],
        //      "laydate": ['css!../libs/laydate/theme/default/laydate.css'],
        "layui": ['css!../libs/layui/css/layui.css'],
        "MyUtils": ["jq"],
        "CourseUtils": ["jq"],
        "datePicker": ['css!../libs/datepicker/css/foundation-datepicker.css', "jq"],
        "pagination": ['css!../libs/libsCss/pagination.css', "jq"],
        "dateTeacher": ["jq"],
        "timeDaterangepicker": ['css!../libs/datepicker/css/daterangepicker.css', "jq"],
        //      "qiniu": ["qiniu_up"],
        "SimpleCalendar": ['css!../libs/libsCss/simple-calendar.css'],
        "oldCalendar": ['css!../libs/libsCss/oldCalendar.css'],

        //      "ImgCropper": ["css!../libs/libsCss/cropperLayout.css", "css!../libs/libsCss/cropper.min.css"],
        //      "cropper": ["css!../libs/libsCss/cropperLayout.css", "css!../libs/libsCss/cropper.min.css"],
        "cropper": ["css!../libs/libsCss/cropper.css"],
        // angular-ui
        "angular-ui-router": ["angular"],
        "angular-sanitize": ["angular"],
        // angularAMD
        "angularAMD": ["angular"],
        "ngload": ["angularAMD"],
        //      "jqResize": ["jq"],
        // "nprogress": ['css!../libs/nprogress/nprogress.css'],
        "jqueryDateformat": ["jq"],
        "hopetime": ["jq", "angular"],
        "timesel": ["jq", "angular"],
        "dataTree": ["jq", "angular"],
        "photoPop": ["jq", "angular"],
        "szpUtil": ["cropper", 'exif'],
        "zcity": ['css!../libs/libsCss/zcity.css', 'jq'],
        // "amapUI": ['amap'],
        "Circles": ['css!../libs/libsCss/normalize.css'],
    }
});
//这时开始document.body可能为undefined
// window.NProgress.start();
// bootstrap
//给加载的文件名做定义名
define(["angular", "angularAMD", "registerRoutes", "bootstrap", "ngDraggable", "extend", "cookie", "layer", "angular-ui-router", "angular-sanitize", "pagination", "jqueryDateformat", "countup"], function(angular, angularAMD, RegisterRoutes) {
    //配置nprogress
    // NProgress.configure({
    //     showSpinner: false
    // });
    // window.NProgress = NProgress;

    require.onError = function(err) {
        //  console.log(err.requireType);
        // if(err.requireType === 'timeout') {
        // 	console.log('modules: ' + err.requireModules);
        // }
        //      console.log('require.onError modules: ' + err.requireModules);
        var failedId = err.requireModules && err.requireModules[0];

        if (failedId && failedId != null) {
            requirejs.undef(failedId);

            if (err.requireModules) {
                layer.msg("加载资源失败，请检查网络是否正常后再试。", {
                    icon: 5
                });
            }
        } else {
            var stack = err.stack;
            if (stack && stack.length > 1000) {
                err.stack = stack.substr(0, 1000);
            }
            var jsLog = {
                shopId: localStorage.getItem('shopId'),
                oAuserId: localStorage.getItem('accountId'),
                stack: 'require.onError' + JSON.stringify(err),
                url: window.location.href
            };

            commitJsException(jsLog);
        }

        NProgress && NProgress.done();

        //throw err;
    };

    //监听浏览器切换事件，判断登录状态是否异常了，如果异常就重新加载页面
    document.addEventListener('visibilitychange', function() { //浏览器切换事件
        // console.log("###visibilitychange=" + document.visibilityState);
        if (document.visibilityState === 'visible') {
            var currentUserInfoStr = localStorage.getItem("currentUserInfo");
            var currentUserInfo = JSON.parse(currentUserInfoStr);
            if (!currentUserInfoStr || checkNeedRefresh(currentUserInfo, window.currentUserInfo)) {
                //location.reload();
                var url = new URL(location.href);
                var href = "index.html" + url.search;
                //如果是总部模式的，直接进总部工作台
                // if (currentUserInfo.currentOrgId) {
                //     href = href + "#/" + 'dataView';
                // }
                location.href = href;
            } else {
                //TODO 解决专属公众号用户授权完以后回到这个页面没刷新的问题
                if (location.href.indexOf('#/setManageSys') != -1 && localStorage.getItem("$statetime") == 1) {
                    if (localStorage.getItem("wxappAuthedSuccess") == 1) {
                        localStorage.removeItem("wxappAuthedSuccess")
                        location.reload();
                    }
                }
            }

        }
    });


    // 配置本项目的module myApp是angular定义初始化里的配置可直接用
    //通过ngSanitize模块的$sanitize服务解析html
    //通过ngDraggable实现DOM的拖拽功能
    var myApp = angular.module("myApp", ["ui.router", "ngSanitize", 'ngDraggable']);

    //angular自定义服务  初始目的是解决兄弟级弹框之间的数据调用
    myApp.service('SERVICE', [function() {
        this.OPENPOPUP = {}; //打开弹窗对象
        this.ORDER = { //订单模块回调

        };
        this.PAYMENT = { //订单模块回调

        };
        this.POTENTIALPOP = { //潜客信息大弹框

        };
        this.CLASSPOP = { //班级信息大弹框
            CLOCK: {},
        };
        this.CLASSAFFAIR = { //课务信息大弹框
            ROLLCALL: {}
        };
        this.POTENTIAL = {};
        this.CLASS = {

        };
        this.STUDENT = {};
        this.HOPETIME = {};
        this.COURSEANDCLASS = { //课程和班级筛选器服务
            COURSE: {},
            CLASS: {},
            PAIKECOURSE: {},
            POTIAL: {},
            GOODS: {},
            COURSETITLE: {},
            COURSEPACKAFE: {},
            COUPONS: {},
        };
        this.TIMEPOP = { //时间弹框
            CLASS: {}
        };
        this.MARKPOP = { //标签弹框
            COURSE: {}
        };
        this.STUDENTSEL = { //学员筛选器
            LEAVE: {}
        };
        this.MYSELECT = { //下拉筛选器服务
            reloadData: {},
            goReset: {},
        };
        this.THEAD = {}; //table的头部控件
        this.ADDCOURSE = { //新增或编辑课程公用弹框
            FROMPAGE: {},
        };
        this.STUDENT = {
            SIGNUP_DETAIL: {}
        };
        this.CUSTOMPOP = {
            TABLE: {}
        };
    }]);

    //把currentUserInfo赋值放到外面来，避免因为controller加载顺利的问题导致异常
    var currentUserInfoStr = localStorage.getItem("currentUserInfo");
    if (currentUserInfoStr != undefined && currentUserInfoStr != null) {
        try {
            window.currentUserInfo = JSON.parse(currentUserInfoStr);
        } catch (err) {
            localStorage.removeItem("currentUserInfo");
        }

    }

    // 配置块config 配置模块的路由和跳转地址，controller
    myApp.config(RegisterRoutes)

    .controller("headerCtrl", ['$scope', '$interval', '$rootScope', '$state', '$location', '$compile', '$timeout', function($scope, $interval, $rootScope, $state, $location, $compile, $timeout) {
            require(['laydate', 'MyUtils', "app_", "main", "directives", "filters", 'szpUtil', "addInfos", "mySelect", 'potential_pop', 'classPop', 'coursePop'], function(laydate, MyUtils, App, InitCtrl, a, b, c, d) {
                //易知鸟通知广告位
                (function() {
                    new Promise(resolve => {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/setting/extension/list',
                            type: "get",
                            data: { 'type': 0, extensionType: 1 },
                            success: function(res) {
                                if (res.status == "200") {
                                    resolve(res.context)
                                }
                            }
                        })
                    }).then(res => {
                        if (new Date().getTime() < new Date(res.beginTime) || new Date().getTime() > new Date(res.endTime)) {
                            return localStorage.removeItem('yzn_ad_flag');
                        };
                        setTimeout(function() {
                            if (res[0].rules == 1) { //期间内1次/天
                                if (!localStorage.getItem('yzn_ad_flag') || (localStorage.getItem('yzn_ad_flag') !== $.format.date(new Date(), 'yyyy-MM-dd'))) {
                                    $('#yzn_ad_flag .yzn_ad_banner').attr('src', res[0].webImgUrl);
                                    $('#yzn_ad_flag').show();
                                    localStorage.setItem('yzn_ad_flag', $.format.date(new Date(), 'yyyy-MM-dd')); //弹出即写进缓存
                                }
                            } else { //期间内只提醒一次
                                if (!localStorage.getItem('yzn_ad_flag')) {
                                    $('#yzn_ad_flag .yzn_ad_banner').attr('src', res[0].webImgUrl);
                                    $('#yzn_ad_flag').show();
                                }
                            }
                        }, 500)
                    })

                })()
                $rootScope.closeAd = function() {
                    localStorage.setItem('yzn_ad_flag', $.format.date(new Date(), 'yyyy-MM-dd'));
                    $('#yzn_ad_flag').hide();
                };

                $rootScope.stopPropagation = function(e) {
                    e.stopPropagation();
                };
                //index.html左侧栏和顶部条是隐藏的，这样式为了避免angular尚未加载完成的情况页面显示异常
                //在代码里主动把这两部分内容显示出来
                // $("#navigation").show();
                // $("#top-navbar").show();
                $rootScope.popup_name = []; //对象弹窗(用于关闭弹窗)
                $rootScope.popup_count = []; //对象弹窗个数

                $("#page-wrapper").show();
                window.NProgress.done();
                window.NProgress.configure({
                    showSpinner: false
                });
                $scope.institutionInfo = JSON.parse(localStorage.getItem("loginShopInfos"));
                $scope.institutionInfoCopy = angular.copy($scope.institutionInfo);
                //获取当前用户信息包括权限等
                if (!window.currentUserInfo) {
                    returnToLoginPage();
                    return;
                } else {
                    if (localStorage.getItem("needRefreshUserInfo") != "0") {
                        for (var i = 0; i < $scope.institutionInfo.length; i++) {
                            var orgId = window.currentUserInfo.currentOrgId;
                            if (window.currentUserInfo.fromOrgId) {
                                orgId = window.currentUserInfo.fromOrgId;
                            }
                            if ((orgId && $scope.institutionInfo[i].orgId == orgId) ||
                                (window.currentUserInfo.shopId && $scope.institutionInfo[i].shopId == window.currentUserInfo.shopId)
                            ) {
                                console.log("###institutionSel");
                                institutionSel($scope.institutionInfo[i]);
                                break;
                            }
                        }
                    }
                    localStorage.removeItem("needRefreshUserInfo");
                }
                var _main = function() {
                    init();
                    try {
                        $scope.$apply();
                    } catch (e) {
                        //TODO handle the exception
                    }
                    App.init();
                    InitCtrl.init();
                }

                _main();
                var sourceLink; //上传图片的地址
                var sourceKey; //上传图片的key值
                var second = 60; //修改密码验证码起始60s
                var timerHandler, isDuringTime = false; //判断验证码定时器是否有效
                var login_phone = localStorage.getItem("userPhone"); //获取登陆者的名称

                function init() {
                    $scope.searchContentShow = false;
                    $scope.searchVal = undefined;
                    $scope.searchParams = {
                        kuaijie: [],
                        levels: [],
                        studentCenterList: [],
                        potentialCustomerList: [],
                        classInfoList: [],
                        courseList: []
                    };
                    $scope.searchContent = [];
                    $scope.keyup = false;
                    $scope.version = CONFIG.VERSION;
                    if (localStorage.getItem('yzn_VERSION') != CONFIG.VERSION) {
                        getNersionInfo($scope.version, function(v) {
                            $rootScope.openNersionDetail(v);
                        });
                        localStorage.setItem('yzn_VERSION', CONFIG.VERSION);
                    }
                    $scope.$on("config_changed", function(e, data) {
                        var menuModelAll = CONSTANT_SNV;
                        for (var i = 0; i < menuModelAll.length; ++i) {
                            if (!menuModelAll[i].items) {
                                continue;
                            }
                            for (var j = 0; j < menuModelAll[i].items.length; ++j) {
                                if (menuModelAll[i].items[j]) {
                                    if (menuModelAll[i].items[j].config == data) {
                                        refreshLeftMenu();
                                    }
                                }
                            }
                        }
                    });
                    refreshLeftMenu();

                    //TODO
                    //                  $scope.selectedNavItem='sale_icon';
                    //                  $scope.selectUiSelf='nameList'

                    $rootScope.closeCutWrap = function() {
                        layer.close(cutDialog);
                    };
                    if (window.currentUserInfo.currentOrgId) {
                        angular.forEach(window.currentUserInfo.orgTeacherList, function(d, index) {
                            if (window.currentUserInfo.currentOrgId == d.orgId) {
                                $rootScope.currentOrg = angular.copy(d.org);
                                $rootScope.currentOrg.teacherType = d.teacherType;
                                $scope.username = d.teacherName;
                            }
                        });
                        console.log($rootScope.currentOrg);
                        //TODO 机构缺logo
                        if ($rootScope.currentOrg.orgImg == undefined || $rootScope.currentOrg.orgImg == "") {
                            $rootScope.headShopImgUrl = "static/img/login/touxiangweidenglu.png";
                        } else {
                            $rootScope.headShopImgUrl = $rootScope.currentOrg.orgImgUrl;
                        }
                        $scope.isOrgn = true;
                        //                      $rootScope.headShopImgUrl = "static/img/must/favicon.ico";
                        $rootScope.compName = $rootScope.currentOrg.orgName;

                    } else {
                        $rootScope.fromOrgn = window.currentUserInfo.fromOrgId ? true : false;
                        if (window.currentUserInfo.shop.shopImg == undefined || window.currentUserInfo.shop.shopImg == "") {
                            //                          if(window.currentUserInfo.shop.org.orgImg){
                            //                              $rootScope.headShopImgUrl=window.currentUserInfo.shop.org.orgImgUrl;
                            //                          }else{
                            $rootScope.headShopImgUrl = "static/img/login/touxiangweidenglu.png";
                            //                          }
                        } else {
                            $rootScope.headShopImgUrl = window.currentUserInfo.shop.shopImgUrl;
                        }
                        $rootScope.compName = window.currentUserInfo.shop.shopName;
                        $scope.username = window.currentUserInfo.teacherName;
                        //TODO 七陌客服介入代码，暂时不用先注释掉
                        // window.qimoClientId = {userId: '123wabc', nickName:$rootScope.compName};
                        // $.getScript('https://ykf-webchat.7moor.com/javascripts/7moorInit.js?accessId=16a1efe0-a3cf-11e9-aa00-354293c234fd&autoShow=true&language=ZHCN',function(){
                        // });

                    }
                    if (window.currentUserInfo.teacherLongUrl != undefined) {
                        $scope.imgUrl = window.currentUserInfo.teacherLongUrl;
                    } else {
                        $scope.imgUrl = "static/img/login/touxiangweidenglu.png";
                    }

                    $scope.viewBasic = checkAuthMenuById("3"); //基本设置
                    $scope.viewMsg = checkAuthMenuById("26"); //消息管理
                    $scope.gotoBasicHelp = gotoBasicHelp; //跳转到帮助中心
                    $scope.gotoBasicSet = gotoBasicSet; //跳转到基本设置页面
                    $scope.gotoMsgPage = gotoMsgPage; //跳转到消息管理页面
                    // getUserInfo(); //及时刷新一下当前账号在选中的校区下姓名以及头像信息
                    $scope.gotoLoginPage = gotoLoginPage; //退回到登陆页面
                    $scope.openEditPwdPop = openEditPwdPop; //打开修改密码弹出框
                    $scope.openEditUser = openEditUser; //打开编辑用户头像按钮
                    $scope.canClick = false; //判断验证码按钮能否点击
                    $scope.isNewPwdError = false;
                    $scope.description = "获取验证码";
                    $scope.pop_cancel = pop_cancel; //关闭弹框
                    $scope.getTestCode = getTestCode; //获取验证码
                    $scope.editClass_confirm = editClass_confirm; //确认修改密码
                    $scope.editUser_confirm = editUser_confirm; //确认更换头像

                    $scope.validatePhoneError_edit = false; //手机号校验报错文字显示与否
                    $scope.validatePwdError_edit = false; //密码校验报错文字显示与否
                    $scope.validatePhone_edit = validatePhone_edit; //手机号码校验
                    $scope.validatePwd_edit = validatePwd_edit; //手机号码校验
                    $scope.bindPhoneEnter_edit = bindPhoneEnter_edit; //绑定手机号的事件
                    $scope.bindPwdEnter_edit = bindPwdEnter_edit; //绑定密码的事件
                    $scope.bindCodeEnter_edit = bindCodeEnter_edit; //绑定验证码的事件
                    $scope.gotoWork = gotoWork; //跳转到工作台
                    $scope.institutionShow = institutionShow; //点击开启或者关闭校区下拉
                    $scope.searchContentFun = searchContentFun; //点击全局搜索框
                    $scope.institutionSel = institutionSel; //选择校区
                    $scope.gotoOrg = backOrg; //返回总部面板
                    $scope.allClk = allClk; //全局点击关闭校区下拉
                    $scope.changeOrgn_img = changeOrgn_img; //切换校区头像
                    $scope.shopSearch_not_hide = shopSearch_not_hide; //点击搜索 下拉不消失
                    $scope.listSearch = listSearch; //点击搜索 下拉不消失
                    $scope.cleanSearch = cleanSearch; //删除x
                    $scope.checkSearch = globalSearch; //全局搜索
                    $scope.keyupSearch = keyupSearch; //enter键全局搜索
                    $scope.onblur = onblur;
                    $scope.clearSearch_g = clearSearch_g;
                    $scope.kuaijieToPage = kuaijieToPage; //快捷功能点击跳转
                    $scope.toPage = toPage; //搜索的数据点击跳转详情
                    $scope.focusFun = focusFun; //全局搜索获取焦点

                    //Safari浏览器如果从阅读列表里打开连接href方式打开地址是不能新开tab页打开的，所以统一使用这个方式打开
                    $rootScope.openNewWindow = function(url) {
                        window.open(url);
                    }
                    $rootScope.openNersion = function(v) { //打开版本号弹框
                        getNersionInfo();
                        openPopByDiv('版本更新信息', '.openNersion', '960px');
                    };
                    $rootScope.openNersionDetail = function(v) { //打开版本号详情
                        $rootScope.nersionDetail = v;
                        openPopByDiv(v.versionCode + '版本', '.openNersionDetail', '1100px', function() {
                            setTimeout(function() {
                                $('.openNersionDetail_text').html($scope.nersionDetail.versionDesc);
                                $('.openNersionDetail img').off().on('click', function() {
                                    console.log(this);
                                    $('.nersion_msk img').attr('src', $(this).attr('src'));
                                    $('.nersion_msk').show();
                                })
                                $('.nersion_msk').off().on('click', function() {
                                    $('.nersion_msk').hide();
                                })
                            })
                        });
                    };
                    $scope.workbrenchQuanxian = checkAuthMenuById("1");
                    //                  $rootScope.showMenu = showMenu; //全局
                    //点击校区多重选择
                    $scope.institutionJud = false; //判断是开启还是关闭选项状态
                    $scope.institutionJudLen = true;
                    if ($scope.institutionInfo && $scope.institutionInfo.length <= 1) {
                        $scope.institutionJudLen = false;
                    };
                    /*上传头像*/
                    $('#index_changeImg').click(function() {
                        szpUtil.util_addImg(true, function(data, d_) {
                            $scope.img_pop = data;
                            $('.index_user_img').attr("imgName", d_);
                            sourceLink = data;
                            sourceKey = d_;
                            $scope.$apply();
                        }, { type: 'image/gif, image/jpeg, image/png', dataSource: 'teacherInfo' });
                    });
                    $rootScope.showMenu = function() {
                        showHideMenu('tag');
                        $rootScope.selectedNavItem = '';
                        var page = $('#page-container');
                        if (page.hasClass('sidebar-visible-lg-full')) {
                            $rootScope.ismenuOoen = true;
                        } else {
                            $rootScope.ismenuOoen = false;
                        }
                    }

                    //全局广播通知信息横幅
                    if (window.currentUserInfo.shop && window.currentUserInfo.shop.leftDays != undefined && window.currentUserInfo.shop.deadline) {
                        if (window.currentUserInfo.shop.leftDays <= 30) {
                            $scope.broadcastNotificationsJud = true;
                            $scope.broadcastNotificationsTime = $.format.date(window.currentUserInfo.shop.deadline, 'yyyy-MM-dd');
                            setTimeout(function() {
                                $('#page-content').css({ 'padding-top': '70px' });
                                broadcastNotificationsRoll();
                            })
                        } else {
                            $scope.broadcastNotificationsJud = false;
                        }
                    }
                }

                //获取版本号信息
                function getNersionInfo(v, fn) {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/setting/versionLogList',
                        type: "get",
                        data: { 'pageType': 0 },
                        success: function(res) {
                            if (res.status == "200") {
                                console.log(res);
                                $rootScope.nersionInfo = res.context;
                                angular.forEach(res.context, function(v_) {
                                    if (v_.versionCode == v) {
                                        if (fn) fn(v_);
                                    }
                                })
                            }
                        }
                    })
                }

                //刷新左侧菜单栏项目
                function refreshLeftMenu() {
                    //左侧菜单数据初始化
                    var menuModelAll = CONSTANT_SNV;
                    var list = [];
                    for (var i = 0; i < menuModelAll.length; ++i) {
                        var level1 = menuModelAll[i];

                        var items = level1.items;
                        //如果没有子菜单，直接检查权限
                        if (!items) {
                            if (checkAuthMenuById(level1.authMenuId)) {
                                list.push(level1);
                            }
                            continue;
                        }
                        var level1new = undefined;
                        for (var j = 0; j < items.length; ++j) {
                            var level2 = items[j];
                            var level2matched = checkAuthMenuById(level2.authMenuId);
                            if (window.currentUserInfo.shop && level2matched) {
                                if (level2.config) {
                                    if (((level2.config) & (window.currentUserInfo.shop.config)) == 0) {
                                        console.log(window.currentUserInfo.shop.config);
                                        level2matched = false;
                                    }
                                }
                                //我的授课，线上课程入口单独判断
                                if (level2.authMenuId == 159) {
                                    if (window.currentUserInfo.shop.onlineCourseStatus != 1) {
                                        level2matched = false;
                                    }
                                }
                            }

                            if (level2matched) {
                                var itemsj = level2.childs;
                                if (itemsj) {
                                    var level2new = undefined;
                                    for (var m = 0; m < itemsj.length; ++m) {
                                        itemsj[m].actionId = level2.sref;
                                        var level3matched = checkAuthMenuById(itemsj[m].authMenuId);
                                        if (window.currentUserInfo.shop && level3matched) {
                                            if (itemsj[m].config) {
                                                if (((itemsj[m].config) & (window.currentUserInfo.shop.config)) == 0) {
                                                    level3matched = false;
                                                }
                                            }
                                        }
                                        if (level3matched) {
                                            if (level2new === undefined) {
                                                level2new = {};
                                                level2new.sref = level2.sref;
                                                level2new.actionId = level2.sref;
                                                level2new.id = level2.id;
                                                level2new.name = level2.name;
                                                level2new.authMenuId = level2.authMenuId;
                                                level2new.childs = [];
                                                if (level2.config) level2new.config = level2.config;
                                                if (level2.shopType) level2new.shopType = level2.shopType;
                                            }
                                            level2new.childs.push(itemsj[m]);

                                        }
                                    }
                                    if (level2new) {
                                        level2 = level2new;
                                    } else {
                                        delete level2.childs;
                                    }
                                }
                                if (level1new === undefined) {
                                    level1new = {};
                                    level1new.id = level1.id;
                                    level1new.name = level1.name;
                                    level1new.items = [];
                                    list.push(level1new);
                                }
                                level1new.items.push(level2);
                            }

                        }
                    }
                    console.log(list);
                    $scope.menuModel = list;
                }

                function broadcastNotificationsRoll() {
                    $('.broadcast_notifications p').css({ 'margin-left': $('#main-container').width() + 'px' });
                    $('.broadcast_notifications p').animate({ 'margin-left': '-500px' }, 40000, 'linear', function() {
                        if (parseInt($('.broadcast_notifications p').css('marginLeft')) <= -500) {
                            broadcastNotificationsRoll();
                        }
                    });
                }

                function gotoBasicHelp() {
                    location.href = "https://www.yizhiniao.com/helpcenter/index.html";
                }

                function gotoBasicSet() {
                    $state.go("center");
                    $rootScope.selectedNavItem = 'center';
                }

                function gotoMsgPage() {
                    $state.go("msg_new", {});
                    $rootScope.selectedNavItem = 'msg_new';
                }

                function validatePhone_edit(value) {
                    if (value == "" || value == undefined) {
                        $scope.validatePhoneError_edit = false;
                        return;
                    }
                    if (/^1\d{10}$/.test(value) && value) {
                        $scope.validatePhoneError_edit = false;
                    } else {
                        $scope.validatePhoneError_edit = true;
                    }
                }

                function validatePwd_edit(value) {
                    //密码规则：6-30位字母数字组合
                    if (value == "" || value == undefined) {
                        $scope.validatePwdError_edit = false;
                        return;
                    }
                    if (/^[A-Za-z0-9]{6,30}$/.test(value) && value.length >= 6) {
                        $scope.validatePwdError_edit = false;
                    } else {
                        $scope.validatePwdError_edit = true;
                        return;
                    }
                    $scope.isNewPwdError_edit = false;
                }

                function bindPhoneEnter_edit() {
                    $scope.isNewPwdError = false;
                    $scope.validatePhoneError_edit = false;
                }

                function bindPwdEnter_edit() {
                    $scope.isNewPwdError = false;
                    $scope.validatePwdError_edit = false;
                }

                function bindCodeEnter_edit() {
                    $scope.isNewPwdError = false;
                }
                $scope.setNewPwdData = {
                    "phone": "",
                    "pwd": "",
                    "code": ""
                };

                // function getUserInfo() {
                //     //及时刷新一下当前账号在选中的校区下姓名以及头像信息
                //     $.hello({
                //         url: CONFIG.URL + '/api/oa/getAdminInfo',
                //         type: "get",
                //         success: function(data) {
                //             if(data.status == '200') {
                //                 $scope.username = data.context.userName;
                //                 if(data.context.oaUserBigUrl != undefined) {
                //                     $scope.imgUrl = data.context.oaUserBigUrl;
                //                 } else {
                //                     $scope.imgUrl = "static/img/login/touxiangweidenglu.png";
                //                 }
                //
                //             }
                //         }
                //     });
                //
                // }
                function changeOrgn_img() {
                    if ((window.currentUserInfo.currentOrgId && $rootScope.currentOrg.teacherType == 1) || (window.currentUserInfo.currentShopId && window.currentUserInfo.adminStatus == 1)) {
                        var url, data;
                        setTimeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                if (data) {
                                    $scope.headShopImgUrl = data;
                                    var sourKey = data.substring(data.lastIndexOf("\/") + 1, data.length);
                                    var URL, param;
                                    if (window.currentUserInfo.currentOrgId) {
                                        URL = "/api/org/orgTeacher/uploadOrgLogo";
                                        param = { orgImg: sourKey };
                                    } else {
                                        URL = "/api/oa/setting/updateShopLogo";
                                        param = { shopImg: sourKey };
                                    }
                                    $.hello({
                                        url: CONFIG.URL + URL,
                                        type: "post",
                                        data: JSON.stringify(param),
                                        success: function(data) {
                                            if (data.status == "200") {}
                                        }
                                    })
                                }
                                $scope.$apply();
                            }, { type: 'image/gif, image/jpeg, image/png' })
                        });
                    }
                }

                function gotoLoginPage() {
                    //			clearCookie();
                    //退出登录需要清除掉记住的密码，避免重复自动登录
                    returnToLoginPage();
                }

                function clearCookie() {
                    var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
                    if (keys) {
                        for (var i = keys.length; i--;)
                            document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
                    }
                }

                function openEditPwdPop() {
                    $scope.isNewPwdError = false;
                    $scope.validatePhoneError_edit = false;
                    $scope.validatePwdError_edit = false;
                    $scope.setNewPwdData = {
                        "phone": "",
                        "pwd": "",
                        "code": ""
                    };
                    $interval.cancel(timerHandler);
                    second = 60;
                    $scope.description = "获取验证码";
                    $scope.canClick = false;
                    isDuringTime = false;
                    dialog = layer.open({
                        type: 1,
                        title: '修改密码',
                        skin: 'layerui', //样式类名
                        closeBtn: 1, //不显示关闭按钮
                        anim: 0,
                        area: '720px',
                        offset: "30px",
                        shadeClose: false, //开启遮罩关闭
                        content: $('.editPwd_pop')
                    })
                }

                function pop_cancel() {
                    layer.close(dialog);
                }

                function getTestCode(phone) { //获取验证码
                    if (phone == "" || phone == undefined || $scope.validatePhoneError_edit) {
                        layer.msg('请输入合格的手机号码');
                        return;
                    }
                    if (isDuringTime) {
                        return;
                    }
                    var data = {
                        "phone": phone
                    }

                    $.hello({
                        url: CONFIG.URL + '/api/oa/sms/getAuthCode',
                        type: "get",
                        data: data,
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.description = second + "s后重发";
                                timerHandler = $interval(function() {
                                    if (second <= 0) {
                                        $interval.cancel(timerHandler);
                                        second = 60;
                                        $scope.description = "获取验证码";
                                        $scope.canClick = false;
                                        isDuringTime = false;
                                    } else {
                                        second--;
                                        $scope.description = second + "s后重发";
                                        $scope.canClick = true;
                                        isDuringTime = true;
                                    }
                                }, 1000, 100)
                            } else {
                                layer.msg(data.message);
                            }
                        }
                    });
                };

                function editClass_confirm(params) {
                    if (login_phone != params.phone) {
                        layer.msg("手机号不正确");
                        return;
                    }
                    if (params.pwd) {
                        var md5Pwd = hex_md5(params.pwd);
                    }

                    var data = {
                        "phone": params.phone,
                        "pwd": md5Pwd,
                        "code": params.code
                    };
                    for (var i in data) {
                        if (data[i] == '' || data[i] == undefined) {
                            return;
                        }
                    }
                    var errorTips = $("#change_Pwd").find("span.usererr");
                    if (errorTips.length > 0) {
                        return;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/updatePwd",
                        type: "post",
                        data: JSON.stringify(data),
                        async: true,
                        contentType: "application/json;charset=UTF-8",
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg("修改密码成功，请重新登陆!");
                                pop_cancel();
                            } else {
                                $scope.setNew_tipText = data.message;
                                if (data.status != 400) {
                                    $scope.isNewPwdError = true;
                                }
                                $scope.validatePwdError_edit = false;
                            }
                            $scope.$apply();
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown) {
                            //调用失败代码
                            var errMsg = '网络不稳定，请稍后再试～';
                            if (XMLHttpRequest.status == 400) {
                                errMsg = '数据填写有误，请检查后重新填写～';
                            } else if (XMLHttpRequest.status == 404 || XMLHttpRequest.status == 500) {
                                errMsg = '发生了未知错误，请联系客服人员帮助您解决';
                            }
                            $scope.setNew_tipText = data.message;
                            $scope.isNewPwdError = true;
                            $scope.validatePwdError_edit = false;
                            $scope.$apply();
                        }

                    })
                }

                function openEditUser($divPop, text) {
                    var $area;
                    if ($divPop == '.editUser_pop') {
                        $area = "720px";
                        $scope.img_pop = $scope.imgUrl;

                    } else {
                        $area = "560px";
                    }

                    dialog = layer.open({
                        type: 1,
                        title: text,
                        closeBtn: 1, //不显示关闭按钮
                        skin: 'layerui', //样式类名
                        anim: 0,
                        area: $area,
                        offset: "30px",
                        shadeClose: false, //开启遮罩关闭
                        content: $($divPop)
                    })
                }

                function editUser_confirm(username) {
                    var data = {
                        "oaUserUrl": sourceKey
                    };

                    $.hello({
                        url: CONFIG.URL + "/api/oa/userAdmin/updateOaUserImg",
                        type: "post",
                        data: JSON.stringify(data),
                        success: function(data) {
                            if (data.status == "200") {
                                $(".header_img>img").attr("src", sourceLink);
                                pop_cancel();
                            }
                        }
                    })
                }
                /*上传头像结束*/ //TODO
                function gotoWork(d, $event) {
                    var open = $($event.currentTarget).hasClass('open');
                    if (open) {
                        $rootScope.selectedNavItem = '';
                    } else {
                        $rootScope.selectedNavBg = d;
                        $rootScope.selectedNavItem = d;
                    }
                    if (d == 'work_icon') {
                        $state.go('workbench');
                        $rootScope.selectedNavItem = 'work_icon';
                    } else if (d == 'data_icon') {
                        $state.go('dataView');
                        $rootScope.selectedNavItem = 'data_icon';
                    } else if (d == "show_icon") {
                        $state.go('myshow');
                        $rootScope.selectedNavItem = 'show_icon';
                    }
                };
                //计算屏幕宽度，小于1200px收回左侧导航
                window.onresize = function() {
                    $scope.$apply(function() {
                        var width = $(window).width();
                        if (width < 1200) {
                            $rootScope.selectedNavItem = '';
                            $rootScope.ismenuOoen = false;
                            showHideMenu('close');
                        } else {
                            $rootScope.ismenuOoen = true;
                            showHideMenu('open');
                        }
                    })
                };

                //监听localStore的变化
                // window.onstorage = function(e) {
                //     if(e.storageArea.compName != $rootScope.compName) {
                //         location.href = "index.html"
                //     };
                // };

                function institutionShow(evt) {
                    evt.stopPropagation();
                    if ($scope.institutionInfo.length > 1) {
                        if ($scope.institutionJud) {
                            $scope.institutionJud = false;
                        } else {
                            $scope.institutionJud = true;
                        }
                    };
                };

                function searchContentFun(evt) {
                    evt.stopPropagation();
                    if ($scope.searchContent.length > 0) {
                        if ($scope.searchContentShow) {
                            $scope.searchContentShow = false;
                        } else {
                            $scope.searchContentShow = true;
                        }
                    };
                };

                function shopSearch_not_hide(evt) {
                    evt.stopPropagation();
                }

                function kuaijieToPage(d_) {
                    var param = {
                        name: "globalsearch",
                        pop: d_.pop ? d_.pop : undefined,
                        tab: d_.tab ? d_.tab : undefined,
                        tab_: d_.tab2 ? d_.tab2 : undefined
                    };
                    $state.go(d_.sref, { screenValue: param });
                }

                function toPage(type, d_) {
                    switch (type) {
                        case 1:
                            d_.sref = "edu_student";
                            break;
                        case 2:
                            d_.sref = "potial_customer";
                            break;
                        case 3:
                            d_.sref = "edu_class";
                            break;
                        case 4:
                            d_.sref = "edu_course";
                            break;
                    }

                    let p_ = d_.pop;
                    let el = p_.el;
                    let id = p_.id;
                    let width = p_.width;
                    let data = p_.param;
                    // $state.go(d_.sref);
                    $timeout(function() {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                    }, 500);
                }
                //本地搜索需要的信息
                function listSearch(obj, at, e) {
                    var obj = obj;
                    var part = [];
                    if (!at) {
                        $scope.institutionInfo = angular.copy($scope.institutionInfoCopy);
                        return;
                    }
                    var searchEscapeVaule = e.target.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    for (var i = 0; i < obj.length; i++) {
                        if (new RegExp(searchEscapeVaule, 'g').test(obj[i].shopName)) {
                            part.push(obj[i]);
                        }
                    }
                    $scope.institutionInfo = part;
                }

                function onblur() {
                    if ($scope.searchVal) return;
                    $scope.onfocus = false;
                    $scope.keyup = false;
                }

                function focusFun(evt) {
                    evt.stopPropagation();
                    $scope.onfocus = true;
                    if ($scope.searchContent.length > 0) {
                        $scope.searchContentShow = true;
                    }
                }

                function clearSearch_g() {
                    $scope.searchVal = "";
                    $scope.searchContent = [];
                    onblur();
                }

                function keyupSearch(e) {
                    if (e.target.value) {
                        $scope.keyup = true;
                    } else {
                        $scope.keyup = false;
                    }
                    var keyCode = e.keyCode;
                    if (keyCode == 13) {
                        if (!$scope.searchVal) {
                            $scope.searchParams = {
                                levels: [],
                                studentCenterList: [],
                                potentialCustomerList: [],
                                classInfoList: [],
                                courseList: []
                            }
                        }
                        e.target.blur();
                        $scope.searchContentShow = false;
                        $state.go('globalSearch', { screenValue: { params: $scope.searchParams, val: $scope.searchVal } }, { reload: true });
                    }
                }

                function searchItem(searchEscapeVaule, obj, part) {
                    for (var i = 0; i < obj.length; i++) {
                        let items = obj[i].items;
                        if (items) {
                            for (var j = 0; j < items.length; j++) {
                                if (items[j].sref == "edu_myOnlineCourse") { //如果是我的授课里的线上课程则不搜索
                                    continue;
                                }
                                if (items[j].name.indexOf(searchEscapeVaule) != -1 && !items[j].pushed) {
                                    //避免找到重复功能
                                    items[j].pushed = true;
                                    items[j].color = searchEscapeVaule;
                                    part.push(items[j]);
                                }
                                let childs = items[j].childs;
                                if (childs) {
                                    for (var m = 0; m < childs.length; m++) {
                                        var f = {};
                                        if (childs[m].link && childs[m].link instanceof Array && childs[m].link.length > 0) {
                                            let links = childs[m].link;
                                            angular.forEach(links, function(v) {
                                                if (v.indexOf(searchEscapeVaule) != -1 && !childs[m].pushed) {
                                                    f = {
                                                        actionId: items[j].sref,
                                                        authMenuId: items[j].authMenuId,
                                                        childs: items[j].childs,
                                                        name: items[j].name,
                                                        sref: items[j].sref
                                                    };
                                                    childs[m].father = f;
                                                    //避免找到重复功能
                                                    childs[m].pushed = true;
                                                    childs[m].color = searchEscapeVaule;
                                                    part.push(childs[m]);
                                                }
                                            });
                                        } else {
                                            if (childs[m].name.indexOf(searchEscapeVaule) != -1 && !childs[m].pushed) {
                                                f = {
                                                    actionId: items[j].sref,
                                                    authMenuId: items[j].authMenuId,
                                                    childs: items[j].childs,
                                                    name: items[j].name,
                                                    sref: items[j].sref
                                                };
                                                childs[m].father = f;
                                                //避免找到重复功能
                                                childs[m].pushed = true;
                                                childs[m].color = searchEscapeVaule;
                                                part.push(childs[m]);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                var all_search_words = ALL_SEARCH_WORDS.split(',');

                function globalSearch(obj_, at, e) {
                    $rootScope.globalSearchVal = $scope.searchVal;
                    var obj = angular.copy(obj_);
                    var part = [];
                    if (!at) {
                        $scope.searchParams.kuaijie = [];
                        $scope.searchParams.levels = [];
                        $scope.searchContent = [];
                        return;
                    }

                    var searchEscapeVaule = $scope.searchVal.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

                    searchItem(searchEscapeVaule, obj, part);

                    //如果没有完整匹配到，则分词搜索
                    if (part.length == 0 && searchEscapeVaule.length > 2) {

                        var matchedWords = [];
                        for (var i = 0; i < all_search_words.length; i++) {
                            if (searchEscapeVaule.indexOf(all_search_words[i]) != -1) {
                                searchItem(all_search_words[i], obj, part);
                                matchedWords.push(all_search_words[i]);
                            }
                            //目前限定只分三个词
                            if (matchedWords.size >= 3) {
                                break
                            }
                        }

                    }

                    var part_ = angular.copy(part);
                    var levels = [];
                    for (let i = 0; i < part_.length; i++) {
                        var jud = true;
                        for (let j = 0; j < levels.length; j++) {
                            if (part_[i].actionId == levels[j].actionId) {
                                jud = false;
                            }
                        }
                        if (jud) {
                            var father = part_[i].father;
                            if (father) {
                                part_[i] = angular.copy(father);
                            }
                            let childs = part_[i].childs;
                            if (childs) {
                                if (!part_[i].pushed) {
                                    for (let m = 0; m < childs.length; ++m) {
                                        delete childs[m].father;
                                        if (!childs[m].pushed) {
                                            childs.splice(m--, 1);
                                        }
                                    }
                                } else {
                                    for (let m = 0; m < childs.length; ++m) {
                                        delete childs[m].father;
                                    }
                                }
                            }
                            levels.push(part_[i]);
                        }
                    }

                    $scope.searchParams.kuaijie = part;
                    $scope.searchParams.levels = levels;
                    $.hello({
                        url: CONFIG.URL + "/api/oa/workbench/search",
                        type: "get",
                        data: { searchName: $scope.searchVal },
                        success: function(res) {
                            if (res.status == '200') {
                                var data_ = res.context;
                                $scope.searchParams.studentCenterList = data_.studentCenterList;
                                $scope.searchParams.potentialCustomerList = data_.potentialCustomerList;
                                $scope.searchParams.classInfoList = data_.classInfoList;
                                $scope.searchParams.courseList = data_.courseList;
                                $scope.searchContent = [...$scope.searchParams.kuaijie, ...$scope.searchParams.studentCenterList, ...$scope.searchParams.potentialCustomerList, ...$scope.searchParams.classInfoList, ...$scope.searchParams.courseList];
                                if ($scope.searchContent.length > 0) {
                                    $scope.searchContentShow = true;
                                } else {
                                    $scope.searchContentShow = false;
                                }
                            };
                        }
                    })

                }

                function getSearch() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/workbench/search",
                        type: "get",
                        data: { searchName: $scope.searchVal },
                        success: function(res) {
                            if (res.status == '200') {

                            };
                        }
                    })
                }

                function cleanSearch(e) {
                    e.target.previousSibling.value = '';
                    $scope.shopName_search = "";
                    $scope.institutionInfo = angular.copy($scope.institutionInfoCopy);
                }

                function institutionSel(info) {
                    $scope.institutionJud = false;
                    var data = {};
                    if (info.shopId) {
                        data.shopId = info.shopId;
                    } else {
                        data.orgId = info.orgId;
                    }
                    switchShopAndOrg(data.shopId, data.orgId);
                };

                function allClk() {
                    $scope.shopName_search = "";
                    $scope.institutionInfo = angular.copy($scope.institutionInfoCopy);
                    $scope.institutionJud = false;
                    //以下是全局搜索下拉
                    // $scope.searchVal = "";
                    // $scope.searchContent = [];
                    $scope.searchContentShow = false;
                }
                //因为requireJs是异步加载的，所以需要在controller最后收到$apply()来刷新页面
                $scope.$apply();

                $rootScope.popupMap = {};

                //创建动态创建弹框统一入口
                //参数说明：
                // scope：弹框父级$scope一般是controller的$scope,
                // el:弹框标签
                //width:弹框宽度
                //props:弹框传递参数
                window.$rootScope = $rootScope;
                $rootScope.popId = 0;
                $rootScope.yznOpenPopUp = function(scope, el, obj, width, props, fn) {
                    var elementStr = '<node id="_id" flag="1"></node>'
                    $rootScope.popId += 1;
                    var popId = 'popid_' + $rootScope.popId;
                    elementStr = elementStr.replace(/node/g, el);
                    elementStr = elementStr.replace("_id", popId);

                    var template = angular.element(elementStr);
                    var mobileDialogElement = $compile(template)(scope)
                    angular.element(document.body).append(mobileDialogElement);

                    //1160是目前支持的最大宽度，对于一些宽屏的屏幕，可以让宽度更宽一些
                    if (parseInt(width.replace("px", "")) > 1060) {
                        if (document.body.clientWidth > 1280) {
                            var adjustWidth = document.body.clientWidth - 120;
                            if (adjustWidth > 1600) {
                                adjustWidth = 1600;
                            }
                            width = adjustWidth + 'px';
                        }
                    }

                    $rootScope.popupMap[popId] = { 'element': mobileDialogElement, 'width': width, 'props': props, 'obj': obj };
                    if (fn) $rootScope.popupMap[popId].fn = fn; //关闭弹窗回调函数
                }

                $rootScope.$on('popupFinished', function(event, data) {

                    var odj = $rootScope.popupMap[data.scope.openid];
                    if (odj) {
                        //TODO 这里是为了异步加载不然加载不了，后面看看有没有更好的方案
                        $timeout(function() {
                            data.scope._goPopup(data.scope.openid + ' #' + odj.obj, odj.width, odj.props);
                        }, 1, true);
                    }

                })


            })
        }])
        //运行块 run 在路由跳转时、跳转成功、跳转失败的监听处理，一般全局性的变量也放在这里
        .run(['$rootScope', '$state', '$stateParams', '$timeout', '$compile', function($rootScope, $state, $stateParams, $timeout, $compile) {
            // 全屏弹框
            $rootScope.fullPage = {
                open: function(options, scope) {
                    this.container = this.container || {};
                    if (this.container[options.target]) {
                        return layer.msg('指令名称重复请修改', {
                            zIndex: 19930113
                        });
                    }
                    this.container[options.target] = {
                        elem: $compile(angular.element('<full-page page-props=' + options.target + '></full-page>'))(scope),
                        options: options
                    }
                    angular.element("#page-content .uiview-content").append(this.container[options.target].elem);
                },
                close: function(val, fn) {
                    if (this.container[val]) this.container[val].elem.remove();
                    delete this.container[val];
                    var that = this;
                    if (this.container && Object.keys(that.container).length == 0) { //多全面弹框
                        this.container = null;
                    }
                    if (fn) fn();
                },
                allClose: function() {
                    for (var i in this.container) {
                        this.close(i);
                    }
                    this.container = null;
                }
            }
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            $rootScope.previousState_params_selfDefined = null; //自定义返回状态参数
            $(window).width() < 1200 ? $rootScope.ismenuOoen = false : $rootScope.ismenuOoen = true;
            // 跳转函数全局 4.7
            $rootScope.routerSkip = function(sref, params) {
                $state.go(sref, params)
            }

            $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
                NProgress && NProgress.start();
                //console.log("$stateChangeStart");
                //检查路由是否在左侧菜单里，如果左侧菜单有，但是没权限访问的直接返回登录页面
                var hasAuthed = true;
                for (var i = 0; i < CONSTANT_SNV.length; i++) {
                    if (CONSTANT_SNV[i].items) {
                        for (var y = 0; y < CONSTANT_SNV[i].items.length; y++) {
                            if (typeof(CONSTANT_SNV[i].items[y].sref) == 'string') {
                                var firstRoute = toState.name.split("/")[0];
                                if (CONSTANT_SNV[i].items[y].sref == firstRoute) {
                                    if (!checkAuthMenuById(CONSTANT_SNV[i].items[y].authMenuId)) {
                                        hasAuthed = false;
                                        break;
                                    }
                                }
                            }
                        }
                    } else {
                        if (CONSTANT_SNV[i].sref == toState.name) {
                            if (!checkAuthMenuById(CONSTANT_SNV[i].authMenuId)) {
                                hasAuthed = false;
                                break;
                            }
                        }
                    }
                }
                if (!hasAuthed && window.currentUserInfo) {
                    // localStorage.removeItem("password");
                    // localStorage.removeItem("currentUserInfo");
                    var url = new URL(location.href);
                    location.href = "index.html" + url.search;
                }
            });
            $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams) {
                //              console.log("$stateChangeError");
                NProgress && NProgress.done();
            });

            $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
                //全面屏切换路由需清空指令
                if ($rootScope.fullPage.container) {
                    $rootScope.fullPage.allClose();
                }
                if (fromState.name && fromState.name.indexOf('setManage') != -1) localStorage.removeItem("$statetime");
                // to be used for back button //won't work when page is reloaded.
                $rootScope.previousState_name = fromState.name;
                $rootScope.previousState_params = fromParams;
                //切换菜单栏与state时，处理展开与高亮
                $timeout(function() {
                    var page = $('#page-container');
                    var isfull = page.hasClass('sidebar-visible-lg-full');
                    var width = $(window).width();
                    $rootScope.selectUiSelf = toState.name; //self高亮
                    if (toState.name == "nearbySchool" || toState.name == "classroom" || toState.name == "share") { //教务设置特殊处理
                        $rootScope.selectUiSelf = 'setManageEdu';
                    }
                    if (toState.name == "post") { //岗位管理特殊处理
                        $rootScope.selectUiSelf = 'staff_new';
                    }
                    var matched = false;
                    for (var i = 0; i < CONSTANT_SNV.length; i++) {
                        if (CONSTANT_SNV[i].items) {
                            for (var y = 0; y < CONSTANT_SNV[i].items.length; y++) {
                                if (typeof(CONSTANT_SNV[i].items[y].sref) == 'string') {
                                    var firstRoute = toState.name.split("/")[0];
                                    if (CONSTANT_SNV[i].items[y].sref == firstRoute) {
                                        if (width < 1200 || isfull == false) {
                                            $rootScope.selectedNavItem = ''; //菜单栏是否展开
                                        } else {
                                            $rootScope.selectedNavItem = CONSTANT_SNV[i].id;
                                        }
                                        $rootScope.selectedNavBg = CONSTANT_SNV[i].id; //菜单栏
                                        $rootScope.selectUiSelf = firstRoute;
                                        matched = true;
                                        break;
                                    }
                                }
                            }
                        } else {
                            if (CONSTANT_SNV[i].sref == toState.name) {
                                $rootScope.selectedNavItem = CONSTANT_SNV[i].id;
                                $rootScope.selectedNavBg = CONSTANT_SNV[i].id; //菜单栏
                                matched = true;
                            }
                        }
                        if (matched) {
                            break;
                        }
                    }
                    if (width < 1200) {
                        showHideMenu('close');
                        $rootScope.ismenuOoen = false;
                        $rootScope.selectedNavItem = '';
                    }
                });
                NProgress && NProgress.done();

                //页面切换的时候把弹框数据清空避免垃圾数据残留，先注释掉观察一下是否有异常情况
                // dialog = undefined;
                // dialogArr = [];
            });
            //back button function called from back button's ng-click="back()"
            $rootScope.back = function() { //实现返回的函数
                if ($rootScope.previousState_params_selfDefined) {
                    $state.go($rootScope.previousState_name, $rootScope.previousState_params_selfDefined);
                    $rootScope.previousState_params_selfDefined = null;
                } else {
                    $state.go($rootScope.previousState_name, $rootScope.previousState_params);
                }

            };
        }])
        .factory('$exceptionHandler', function() {
            return function(exception, cause) {
                // alert(exception.message);
                console.log(exception);
                console.error(exception.stack);
                var jsLog = {
                    shopId: localStorage.getItem('shopId'),
                    oAuserId: localStorage.getItem('accountId'),
                    stack: '$exceptionHandler cause=' + cause + '\nmessage:' + exception.message +
                        '\nname:' + exception.name +
                        '\nfileName:' + exception.fileName +
                        '\nlineNumber:' + exception.lineNumber +
                        '\ncolumnNumber:' + exception.columnNumber +
                        '\nstack:' + exception.stack,
                    url: window.location.href


                };
                // //TODO 加载template可能会出错，具体原因待查
                // if (!(jsLog.stack.indexOf("Error: [$compile:tpload]") > 0 && jsLog.stack.indexOf("&p1=-1&p2=") > 0)) {
                //     commitJsException(jsLog);
                // }

                commitJsException(jsLog);

                layer.msg("加载失败，请刷新后重试", {
                    icon: 2
                });
            }
        })
        .config([
            '$compileProvider',
            function($compileProvider) {
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob|chrome-extension):/);
                // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
            }
        ])


    //鼠标移入添加滚动条
    $('body').off().on('mouseover', '.popup_form_content', function() {
            var _this = $(this);
            if (_this.find('.popup_scroll').attr('isScroll') == 'true') {
                if (_this.attr('hasScroll') != 'true') {
                    creatDarg(_this[0]);
                    _this.attr('hasScroll', 'true');
                } else {
                    creatDarg(_this[0], 'ture');
                }
            }
        })
        // bootstrap
    return angularAMD.bootstrap(myApp);
});