var app = angular.module("loginApp", []);
app.controller('LoginController', ['$scope', '$interval', '$timeout', function($scope, $interval, $timeout) {
        init();
        var reset_dialog; //重置密码弹出框
        var second = 60; //验证码起始60秒--
        var timerHandler, isDuringTime = false; //判断验证码定时器是否有效,默认(无效中)
        $scope.isFromWeb = GetRequest().website;
        $scope.isFixedWeb = GetRequest().s;
        $scope.loginBg = 'static/img/login/login.jpg'; //默认登录banner
        $scope.orgs = orgsContent();
        document.title = $scope.orgs.title + "登录";
        //如果url有错误信息，则弹框提示用户
        var errMsg = getQueryString("errMsg");
        if (errMsg) {
            layer.alert(errMsg, { title: '错误提示', shadeClose: true });
        }
        $scope.year = new Date().getFullYear();
        // 获取登录banner
        (function() {
            new Promise((resolve, reject) => {
                $.ajax({
                    url: CONFIG.URL + '/api/oa/setting/extension/list',
                    type: "get",
                    data: { 'type': 0, extensionType: 3 },
                    headers: {
                        "clientVersion": "web|" + CONFIG.VERSION
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            resolve(data.context)
                        }
                    },
                    error: function(XMLHttpRequest) {
                        reject(XMLHttpRequest)
                    }
                });
            }).then(res => {
                if (res && res.length && res[0].webImgUrl) {
                    $scope.loginBg = res[0].webImgUrl;
                }
                $scope.$apply();
                console.log($scope.loginBg)
            }).catch(err => {
                //调用失败代码
                var errMsg = '网络不稳定，请稍后再试～';
                if (err.status == 400) {
                    errMsg = '数据填写有误，请检查后重新填写～';
                } else if (err.status == 404 || err.status == 500) {
                    errMsg = '发生了未知错误，请联系客服人员帮助您解决';
                }
                layer.msg(errMsg);
            })

        })()

        function init() {
            console.log($scope.orgs);
            checkAutoLogin();
            $scope.credentials = {
                userAccount: '',
                password: ""
            };
            if (localStorage.getItem("account") && localStorage.getItem("password")) {
                $scope.credentials.userAccount = localStorage.getItem("account");
                $scope.credentials.password = localStorage.getItem("password");
            }
            if (localStorage.getItem("remuser") == 'true') {
                $scope.remind_user = true;
            } else {
                $scope.remind_user = false;
            }
            //-----TODO
            $scope.setNewPwdData = {
                "phone": "",
                "pwd": "",
                "code": ""
            };
            $scope.isShowImg = false;
            $scope.isPwdError = false; //初始化隐藏密码报错提示
            $scope.isNewPwdError_edit = false; //初始化隐藏新密码报错提示
            $scope.gotoSetText = "忘记密码?";
            $scope.forgotPwd_title = "找回账号";
            $scope.canClick = false;
            $scope.description = "获取验证码";
            $scope.error_tips = ""; //报错提示

            $scope.submitLogin = submitLogin; //登录
            $scope.gotoSetNewPwd = gotoSetNewPwd; //进入重置密码页面
            $scope.goBackToLogin = goBackToLogin; //返回登陆页面
            $scope.bindPhoneEnter = bindPhoneEnter; //登录页绑定手机号的事件
            $scope.bindPwdEnter = bindPwdEnter; //登录页绑定密码的事件
            $scope.bindPhoneEnter_edit = bindPhoneEnter_edit; //重置密码绑定手机号的事件
            $scope.bindCodeEnter_edit = bindCodeEnter_edit; //重置密码绑定验证码的事件
            $scope.bindPwdEnter_edit = bindPwdEnter_edit; //重置密码绑定密码的事件
            $scope.getTestCode = getTestCode; //重置密码获取验证码
            $scope.setNewPwd = setNewPwd; //重新设置密码确定
            $scope.validateError = false; //登录页手机验证报错显示与隐藏（默认隐藏）
            //      $scope.validatePwdError=false;//登录页密码验证报错显示与隐藏（默认隐藏）
            $scope.validatePhone = validatePhone; //手机号码校验
            $scope.validatePwd = validatePwd; //手机号码校验
            //忘记密码页面
            $scope.validatePhoneError_edit = false; //重置页手机验证报错显示与隐藏（默认隐藏）
            $scope.validatePwdError_edit = false; //重置页密码验证报错显示与隐藏（默认隐藏）
            $scope.validatePhone_edit = validatePhone_edit; //手机号码校验
            $scope.validatePwd_edit = validatePwd_edit; //手机号码校验
            $scope.pop_cancel = pop_cancel; //关掉重置弹出框
            $scope.openErweima = openErweima; //打开二维码
            $scope.changeInput = changeInput; //切换密码输入框

            $scope.openNewWindow = function(url) {
                window.open(url);
            }

            // [InternetShortcut]URL=https://www.baidu.com

            $scope.loginSaveUrl = "易知鸟.url";

            $scope.loginCollection = function() {
                var isDelect = layer.confirm('同时按下Ctrl+D，把“易知鸟”添加到浏览器收藏夹。', {
                    title: "添加收藏夹",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '300px',
                    move: false,
                    area: '560px',
                    btn: ['我知道了'] //按钮
                }, function() {
                    layer.close(isDelect);
                }, function() {
                    layer.close(isDelect);
                })
            }

        }

        function changeInput(evt) {
            var $this = $(evt.target);
            $this.hide();
            $this.siblings("input").show().attr('readonly', false).focus();
        }

        function orgsContent() {
            return {
                title: $scope.isFixedWeb == 'kdaing' ? "课达教育" : "易知鸟",
                linkImg: $scope.isFixedWeb == 'kdaing' ? "static/img/must/kdaing.ico" : "static/img/must/favicon.ico",
                loginImg: $scope.isFixedWeb == 'kdaing' ? "static/img/login/kdaing.png" : "static/img/login/logo.png",
                loginLink: $scope.isFixedWeb == 'kdaing' ? "http://www.kdaing.com" : "https://www.chosien.com"
            }
        }

        function GetRequest() {
            var url = location.search; //获取url中"?"符后的字串
            var theRequest = new Object();
            var strs;
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        }

        function checkAutoLogin() {
            var account = localStorage.getItem('account');
            var password = localStorage.getItem('password');
            var token = localStorage.getItem('oa_token');
            //如果本地记住了账号和密码，并且token也存在，那么直接进入index页面实现自动登录
            if (account != undefined && account.length > 0 &&
                password != undefined && password.length > 0 &&
                token != undefined && token.length > 0) {

                var url = new URL(location.href);
                location.href = "index.html" + url.search;
            }
        }


        //登录页面重新输入
        function validatePhone(value) {
            if (value == "" || value == undefined) {
                $scope.validateError = false;
                return;
            }
            //      if (/^1\d{10}$/.test(value)) {
            //          $scope.validateError = false;
            //      } else {
            //          $scope.validateError = true;
            //      }
        }

        function validatePwd(value) {
            //密码规则：6-30位字母数字组合
            $scope.isPwdError = false;
            if (value == "" || value == undefined) {
                $scope.validateError = false;
                return;
            }
            //      if (/^[A-Za-z0-9]{6,30}$/.test(value) && value.length >= 6) {
            //          $scope.validateError = false;
            //      } else {
            //          $scope.validateError = true;
            //      }
        }

        function bindPhoneEnter(credentials, e) {
            $scope.isPwdError = false;
            $scope.validateError = false;
            var keyCode = e.keyCode || event.keyCode;
            if (keyCode == 13) {
                //          if (!/^1\d{10}$/.test(credentials.userAccount)){
                //          if (!credentials.userAccount){
                //              $scope.validateError = true;
                //              return;
                //          }
                submitLogin(credentials);
            }
        }

        function bindPwdEnter(credentials, e) {
            $scope.isPwdError = false;
            $scope.validateError = false;
            var keyCode = e.keyCode || event.keyCode;
            if (keyCode == 13) {
                //          if(!(/^[A-Za-z0-9]{6,30}$/.test(credentials.password) && credentials.password.length >= 6)){
                //          if(!credentials.password){
                //              $scope.validateError = true;
                //              return;
                //          }
                submitLogin(credentials);
            }
        }

        //忘记密码重新输入
        function bindPhoneEnter_edit() {
            $scope.isNewPwdError_edit = false;
            $scope.validatePhoneError_edit = false;
        }

        function bindCodeEnter_edit() {
            $scope.isNewPwdError_edit = false;
        }

        function bindPwdEnter_edit() {
            $scope.isNewPwdError_edit = false;
            $scope.validatePwdError_edit = false;
        }

        function validatePhone_edit(value) {
            if (value == "" || value == undefined) {
                $scope.validatePhoneError_edit = false;
                return;
            }
            if (/^1\d{10}$/.test(value)) {
                $scope.validatePhoneError_edit = false;
            } else {
                $scope.validatePhoneError_edit = true;
            }
        }

        function validatePwd_edit(value) {
            $scope.isNewPwdError_edit = false;
            //密码规则：6-30位字母数字组合
            if (value == "" || value == undefined) {
                $scope.validatePwdError_edit = false;
                return;
            }
            if (value.length >= 6) {
                //      if (/^[A-Za-z0-9]{6,30}$/.test(value) && value.length >= 6) {
                $scope.validatePwdError_edit = false;
            } else {
                $scope.validatePwdError_edit = true;
            }
        }

        function submitLogin(credentials) { //登陆
            if (credentials.password) {
                var md5ValuePwd = hex_md5(credentials.password);
            }
            var data = {
                "phone": credentials.userAccount,
                "pwd": md5ValuePwd
            };


            var currentUserInfo = JSON.parse(localStorage.getItem("currentUserInfo"));

            if (currentUserInfo && credentials.userAccount == currentUserInfo.teacherPhone) {
                if (currentUserInfo.currentOrgId || currentUserInfo.fromOrgId) {
                    if (currentUserInfo.currentOrgId) {
                        data.orgId = currentUserInfo.currentOrgId;
                    } else {
                        data.orgId = currentUserInfo.fromOrgId;
                    }

                } else if (currentUserInfo.currentShopId) {
                    data.shopId = currentUserInfo.currentShopId;
                }
            }


            //      if ($scope.validateError || $scope.isPwdError) {
            //          return;
            //      }

            $.ajax({
                url: CONFIG.URL + '/api/oa/userLogin',
                type: "POST",
                data: JSON.stringify(data),
                headers: {
                    "clientVersion": "web|" + CONFIG.VERSION
                },
                async: true,
                contentType: "application/json;charset=UTF-8",
                success: function(data) {
                    if (data.status == '200') {
                        //选中记住用户名与密码  有效期 7天
                        if ($scope.remind_user) {
                            localStorage.setItem("remuser", 'true');
                            localStorage.setItem("account", credentials.userAccount);
                            localStorage.setItem("password", hex_md5($scope.credentials.password));
                        } else {
                            localStorage.removeItem("remuser");
                            localStorage.removeItem("account");
                            localStorage.removeItem("password");
                        }

                        localStoreForLogin(data);
                        localStorage.setItem("needRefreshUserInfo", "0");

                        $scope.gotoSetText = "忘记密码?";
                        $scope.forgotPwd_title = "找回账号";

                        var preHref = getQueryString('preHref');
                        if (preHref != null) {
                            preHref = decodeURIComponent(preHref);
                            preHref = changeURLArg(preHref, 't', new Date().getTime() + '');
                            location.href = preHref;
                        } else {
                            window.currentUserInfo = data.context;
                            var url = new URL(location.href);
                            var href = "index.html" + url.search + getDefaultRouter();

                            location.href = href;
                        }

                    } else if (data.status == 20006) {
                        $scope.login_tipText = data.message;
                        $scope.isPwdError = true;
                        $scope.validateError = false;
                        $scope.gotoSetText = "激活账号";
                        $scope.forgotPwd_title = "激活账号";
                        $scope.error_tips = "您的账号未激活,请进行激活";
                        gotoSetNewPwd();
                    } else {
                        if (data.status == 20023) {
                            $scope.login_tipText = "登录失败请重新登录";
                            localStorage.removeItem("currentUserInfo");
                        } else {
                            $scope.login_tipText = data.message;
                        }

                        $scope.isPwdError = true;
                        $scope.validateError = false;
                        $scope.gotoSetText = "忘记密码?";
                        $scope.forgotPwd_title = "找回账号";
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
                    $scope.login_tipText = errMsg;
                    $scope.isPwdError = true;
                    $scope.validateError = false;
                    $scope.gotoSetText = "忘记密码?";
                    $scope.forgotPwd_title = "找回账号";
                    $scope.$apply();
                }

            })
        }

        function pop_cancel() {
            layer.close(reset_dialog);
        }

        function gotoSetNewPwd() {
            $interval.cancel(timerHandler);
            second = 60;
            $scope.description = "获取验证码";
            $scope.canClick = false;
            isDuringTime = false;
            reset_dialog = layer.open({
                type: 1,
                title: false,
                skin: 'layerui', //样式类名
                closeBtn: 0, //不显示关闭按钮
                move: false,
                resize: false,
                fixed: 'yes',
                anim: 0,
                area: '632px',
                offset: '40%',
                shadeClose: false, //开启遮罩关闭
                content: $('.editPwd_pop')
            });
            $scope.setNewPwdData = {
                "phone": "",
                "pwd": "",
                "code": ""
            };
            if ($scope.forgotPwd_title == "找回账号") {
                $scope.error_tips = "";
            } else {
                $scope.error_tips = "您的账号未激活,请进行激活";
            }
            $scope.isNewPwdError_edit = false;
            $scope.validatePhoneError_edit = false;
            $scope.validatePwdError_edit = false;

        }

        function goBackToLogin() {
            $scope.isPwdError = false;
            $scope.validateError = false;
        }

        function setNewPwd(params) {
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
            if ($scope.validatePhoneError_edit || $scope.isNewPwdError_edit || $scope.validatePwdError_edit) {
                layer.msg("请输入正确的信息");
                return;
            }

            $.ajax({
                url: CONFIG.URL + "/api/oa/updatePwd",
                type: "post",
                data: JSON.stringify(data),
                headers: {
                    "clientVersion": "web|" + CONFIG.VERSION
                },
                async: true,
                contentType: "application/json;charset=UTF-8",
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg("修改密码成功，请重新登陆！");
                        $scope.gotoSetText = "忘记密码?";
                        $scope.forgotPwd_title = "找回账号";
                        pop_cancel();
                        goBackToLogin();
                        $scope.$apply();
                    } else {
                        $scope.isNewPwdError_edit = true;
                        $scope.validatePwdError_edit = false;
                        $scope.setNew_tipText = data.message;
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
                    $scope.isNewPwdError_edit = true;
                    $scope.validatePwdError_edit = false;
                    $scope.setNew_tipText = errMsg;

                    $scope.$apply();
                }

            })

        }

        function getTestCode(phone) { //获取验证码
            if (phone == "" || phone == undefined || $scope.validatePhoneError_edit) {
                return;
            }
            if (isDuringTime) {
                return;
            }
            var data = {
                "phone": phone
            }

            $.ajax({
                url: CONFIG.URL + '/api/oa/sms/getAuthCode',
                type: "get",
                data: data,
                headers: {
                    "clientVersion": "web|" + CONFIG.VERSION
                },
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
                                return;
                            } else {
                                second--;
                                $scope.description = second + "s后重发";
                                $scope.canClick = true;
                                isDuringTime = true;
                            }
                        }, 1000, 100)
                        $scope.$apply();
                    } else {
                        layer.msg(data.message);
                    }

                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    //调用失败代码
                    var errMsg = '网络不稳定，请稍后再试～';
                    if (XMLHttpRequest.status == 400) {
                        errMsg = '数据填写有误，请检查后重新填写～';
                    } else if (XMLHttpRequest.status == 404 || XMLHttpRequest.status == 500) {
                        errMsg = '发生了未知错误，请联系客服人员帮助您解决';
                    }
                    layer.msg(errMsg);
                }
            });
        };

        function openErweima() {
            //      $timeout(function(){
            $scope.isShowImg = true;
            //      },100);
        }
    }])
    .directive('yznFilter', [function() {
        return {
            //scope:{
            //  model : '=ngModel'
            //},
            //require: "ngModel",
            link: function(scope, element, attrs, ngModel) {

                var attr = attrs.yznFilter;
                if (attr == undefined) return;
                //num:{"min":1,"max":99}
                if (attr.indexOf("num") == 0 || attr == "phone") {
                    var regex;
                    var min, max;
                    if (attr == "phone") {
                        //regex = /[^1-9]{1}[^0-9]*/g;//只能输正整数
                        //regex = /^1[0-9]{10}$/g;
                        element.attr("maxlength", 11);
                    } else if (attr.indexOf("num") == 0) {
                        if (attr.indexOf(":") > 0) {
                            var jsonStr = attr.substr(attr.indexOf(":") + 1);
                            var numAttr = JSON.parse(jsonStr);
                            min = numAttr.min;
                            max = numAttr.max;
                        }
                    }

                    if (regex == undefined) {
                        regex = /\D/g;
                    }

                    //采用双向绑定方式来限制input输入是因为angular下使用element.val容易打破双向绑定机制
                    //compositionend时间是表示拼写输入结束
                    element.on('input compositionend', function(value) {
                        var newValue = this.value;

                        //判断是否正在输入，如果正在输入则不处理
                        if (value && value.originalEvent && value.originalEvent.isComposing) {
                            return;
                        }

                        if (newValue == "" || newValue == undefined) return;
                        newValue = this.value.replace(regex, ''); //去掉所有非数字字符
                        //限制浮点，不能以点开头，不能有多个点
                        if (attr == "num_") {
                            var num = 0;
                            for (var i = 0; i < newValue.length; ++i) {
                                var char = newValue.charAt(i);
                                if (char == '.') {
                                    num++;
                                    //不能以点开头
                                    if (i == 0) {
                                        newValue = '';
                                        break;
                                    }
                                    //不能输入多个点
                                    if (num > 1) {
                                        newValue = newValue.substring(0, i);
                                        break;
                                    }
                                }
                            }

                        }
                        if (this.value.search(regex) >= 0) {

                        }
                        if (attr == "phone") {
                            if (newValue.length == 1 && newValue != '1') {
                                newValue = 1;
                            }
                        }

                        //限定值范围
                        if (min != undefined) {
                            if (parseInt(newValue) < parseInt(min)) {
                                newValue = min;
                            }
                        }
                        if (max != undefined) {
                            if (parseInt(newValue) > parseInt(max)) {
                                newValue = max;
                            }
                        }
                        if (attrs.ngModel != undefined) {
                            //如果scope找不到，有可能是ng-repeat
                            var splitVars = attrs.ngModel.split(".");

                            var temp = scope;
                            for (var i = 0; i < splitVars.length - 1; ++i) {
                                temp = temp[splitVars[i]];
                                if (temp == undefined) {
                                    break;
                                }
                            }
                            if (temp && temp.hasOwnProperty(splitVars[splitVars.length - 1])) {
                                //利用angular自身的双向绑定功能
                                temp[splitVars[splitVars.length - 1]] = newValue;
                                scope.$apply();
                            }
                        } else {
                            this.value = newValue;
                        }
                    });

                }
            }
        }
    }])