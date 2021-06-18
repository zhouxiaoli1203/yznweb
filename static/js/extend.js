if (window.$) {
    var $scope;
    var loadingCount = 0; //记录正在请求并需要显示loading的ajax请求个数，当个数小于0时，关闭loading
    var isAutoLogin = false; //表示是否正在自动登录
    var requestDatas = []; //接口请求数据缓存列队
    function autoLogin(data, account, password) {
        requestDatas.push(data);
        if (isAutoLogin) return; //如果正在自动登录就不处理
        var loginData = {
            "phone": account,
            "pwd": password
        }
        var currentUserInfo = JSON.parse(localStorage.getItem("currentUserInfo"));

        if (currentUserInfo) {
            if (currentUserInfo.currentOrgId || currentUserInfo.fromOrgId) {
                if (currentUserInfo.currentOrgId) {
                    loginData.orgId = currentUserInfo.currentOrgId;
                } else {
                    loginData.orgId = currentUserInfo.fromOrgId;
                }

            } else if (currentUserInfo.currentShopId) {
                loginData.shopId = currentUserInfo.currentShopId;
            }
        }


        $.ajax({
            url: CONFIG.URL + '/api/oa/userLogin',
            type: "POST",
            data: JSON.stringify(loginData),
            headers: {
                "token": localStorage.getItem('oa_token'),
                "clientVersion": "web|" + CONFIG.VERSION
            },
            contentType: "application/json;charset=UTF-8",
            success: function(result) {
                isAutoLogin = false;
                if (result.status == "200") {
                    isAutoLogin = false;
                    localStoreForLogin(result);
                    var oldCurrentUserInfo = window.currentUserInfo;
                    var newCurrentUserInfo = JSON.parse(localStorage.getItem("currentUserInfo"));
                    //如果校区信息有变化的重新刷新页面，如果没有变化的就什么都处理
                    if (checkNeedRefresh(oldCurrentUserInfo, newCurrentUserInfo)) {
                        var oldHref = location.href;
                        location.href = getDefaultRouter();
                        if (oldHref.indexOf("#") != -1) {
                            location.reload();
                            localStorage.setItem("needRefreshUserInfo", "0");
                        }

                    } else {
                        for (var i = 0; i < requestDatas.length; i++) {
                            $.hello(requestDatas[i]);
                        }
                    }
                    requestDatas = [];

                } else {
                    layer.closeAll();
                    loadingCount = 0;
                    //如果登录失败退回到登录页面，需要先清除掉"password"的本地缓存，避免死循环登录
                    returnToLoginPage();
                    return;
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                isAutoLogin = false;
                //调用失败代码
                var errMsg = '网络不稳定，请稍后再试～';
                if (XMLHttpRequest.status == 400) {
                    errMsg = '数据填写有误，请检查后重新填写～';
                } else if (XMLHttpRequest.status == 404 || XMLHttpRequest.status == 500) {
                    errMsg = '发生了未知错误，请联系客服人员帮助您解决';
                }
                if (textStatus == 'timeout') {
                    var errMsg = '请求超时，请检查网络是否正常';
                }
                // layer.msg(errMsg, {
                // 	icon: 2
                // });
                layer.alert(errMsg, { title: '错误提示', shadeClose: true, zIndex: 19930113 });
                requestDatas = [];
            }

        });

        isAutoLogin = true;
    };
    $.extend({
        hello: function(data) {
            var hData = {
                    type: "post",
                    contentType: "application/json;charset=UTF-8",
                    headers: {
                        "token": localStorage.getItem('oa_token'),
                        "clientVersion": "web|" + CONFIG.VERSION
                    },
                    timeout: 10000,
                    complete: function() {
                        if (data.needLoading != false) {
                            loadingCount -= 1;
                            if (loadingCount <= 0) {
                                layer.closeAll('loading');
                                NProgress && NProgress.done();
                            }
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
                        if (textStatus == 'timeout') {
                            var errMsg = '请求超时，请检查网络是否正常';
                        }
                        // layer.msg(errMsg, {
                        // 	icon: 2
                        // });
                        layer.alert(errMsg, { title: '错误提示', shadeClose: true, zIndex: 19930113 });
                        if (data.error) data.error(XMLHttpRequest); //如果有自己处理的错误则执行返回
                    },
                    url: ""
                }
                //"needLoading"表示是否需要显示loading，如果为false表示不需要显示loading，默认为true;
            if (data.needLoading != false) {
                if (data.type.toLowerCase() == 'post') {
                    //post请求返回之前不允许点击
                    layer.load(0);
                    if (!data.timeout) {
                        data.timeout = 60 * 1000; //post请求超时时长设置为60秒
                    }
                } else {
                    // layer.load(0, {
                    // 	shade: false
                    // }); //去掉shade允许加载时点击其他内容

                    NProgress && NProgress.start();
                }

                loadingCount += 1;
            }

            this.extend(true, hData, data); //深拷贝
            hData.success = function(rspData) {

                //错误码为20001表示token过期，需要重新登录
                if (rspData.status == 20001) {
                    var account = localStorage.getItem('account');
                    var password = localStorage.getItem('password');
                    //如果本地记住了账号和密码，那么就发起自动登录
                    if (account != undefined && account.length > 0 &&
                        password != undefined && password.length > 0) {
                        autoLogin(data, account, password);
                    } else {
                        /*
                         * 备注：如果全局作用域window下面有需要token过期的回调则调用此方法
                         * 暂时用于show模板预存草稿的回调
                         *
                         */
                        if (window.callBackFun) window.callBackFun();
                        layer.closeAll();
                        localStorage.removeItem("password");
                        // localStorage.removeItem("currentUserInfo");
                        localStorage.removeItem("oa_token");
                        var href = "login.html";
                        var url = new URL(location.href)
                        href += url.search;
                        if (location.href.indexOf("#") != -1) {
                            if (href.indexOf("?") != -1) {
                                href += "&";
                            } else {
                                href += "?";
                            }
                            href += "preHref=" + encodeURIComponent(location.href);
                        }
                        location.href = href;
                    }
                    return;

                } else if (rspData.status == 20012) {
                    //由于浏览缓存的缘故，如果前端服务器更新以后，本地页面有可能还是使用的老的版本，所以加了接口检查前端版本,
                    //如果版本太低字段刷新页面保证页面是最新版本代码
                    //layer.closeAll();
                    //location.href = "index.html"
                    //return;
                }
                var result;
                //catch异常，并上报异常信息方便跟踪并解决异常
                try {
                    //传递给调用方success方法
                    result = data.success(rspData);
                } catch (e) {
                    var jsLog = {
                        shopId: localStorage.getItem('shopId'),
                        oAuserId: localStorage.getItem('accountId'),
                        data: data.data,
                        url: data.url,
                        stack: e.stack

                    };
                    //					console.log("exception：" , JSON.stringify(jsLog));
                    if (typeof data.data != "string") {
                        jsLog.data = JSON.stringify(data.data);
                    }

                    if (rspData) {
                        jsLog.rspData = JSON.stringify(rspData);
                    }

                    commitJsException(jsLog);
                    console.error(e);
                }
                //统一处理错误提示，如果result为true表示调用者已经处理了相关错误信息，不用再处理
                if (rspData.status != 200 && rspData.status != 401 && result != true) {
                    if (rspData.message && rspData.message.length > 0) {
                        // layer.msg(rspData.message, {
                        // icon: 2,
                        //     btn: ['知道了']
                        // });
                        layer.alert(rspData.message, { title: '错误提示', shadeClose: true, zIndex: 19930113 });
                    }
                }
                //异步请求的ajax统一$apply()
                if (hData.async != false) {
                    if (!$scope) {
                        $scope = angular.element(document.getElementById("id-yizhiniao")).scope()
                    }
                    if ($scope != undefined && !$scope.phase && !$scope.$root.phase) {
                        $scope.$apply();
                    }
                }
                //console.log("result=",result);
            }

            this.ajax(hData);
            if (localStorage.getItem('oa_token') == "" || localStorage.getItem('oa_token') == undefined || localStorage.getItem('oa_token') == null) {
                //alert('请重新登陆！');
                layer.closeAll();
                returnToLoginPage();
            }
        }

    });
}