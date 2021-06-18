if(window.$) {
	var $scope;
	var loadingCount = 0; //记录正在请求并需要显示loading的ajax请求个数，当个数小于0时，关闭loading
	var isAutoLogin = false; //表示是否正在自动登录
	var requestDatas = []; //接口请求数据缓存列队
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
					if(data.needLoading != false) {
						loadingCount -= 1;
						if(loadingCount <= 0) {
							layer.closeAll('loading');
						}
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					//调用失败代码
					var errMsg = '网络不稳定，请稍后再试～';
					if(XMLHttpRequest.status == 400) {
						errMsg = '数据填写有误，请检查后重新填写～';
					} else if(XMLHttpRequest.status == 404 || XMLHttpRequest.status == 500) {
						errMsg = '发生了未知错误，请联系客服人员帮助您解决';
					}
                    if (textStatus == 'timeout') {
                        var errMsg = '请求超时，请检查网络是否正常';
                    }
					layer.msg(errMsg, {
						icon: 2
					});
				},
				url: ""
			};
			//"needLoading"表示是否需要显示loading，如果为false表示不需要显示loading，默认为true;
			if(data.needLoading != false) {
				if(data.type.toLowerCase() == 'post') {
					//post请求返回之前不允许点击
					layer.load(0);
				} else {
					// layer.load(0, {
					// 	shade: false
					// }); //去掉shade允许加载时点击其他内容
				}

				loadingCount += 1;
			}

			this.extend(true, hData, data); //深拷贝
			hData.success = function(rspData) {

				//错误码为20001表示token过期，需要重新登录
				if(rspData.status == 20001) {
					var account = localStorage.getItem('account');
					var password = localStorage.getItem('password');
					//如果本地记住了账号和密码，那么就发起自动登录
					if(account != undefined && account.length > 0 &&
						password != undefined && password.length > 0) {
						autoLogin(data, account, password);
					} else {
						layer.closeAll();
						location.href = "login.html" + "?preHref=" + encodeURIComponent(location.href);
					}
					return;

				} else if(rspData.status == 20012) {
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
				} catch(e) {
					var jsLog = {
						shopId: localStorage.getItem('shopId'),
						oAuserId: localStorage.getItem('accountId'),
						data: data.data,
						url: data.url,
						stack: e.stack

					};
					//					console.log("exception：" , JSON.stringify(jsLog));
					if(typeof data.data != "string") {
						jsLog.data = JSON.stringify(data.data);
					}

					if (rspData) {
                        jsLog.rspData = JSON.stringify(rspData);
					}

					commitJsException(jsLog);
				}
				//统一处理错误提示，如果result为true表示调用者已经处理了相关错误信息，不用再处理
				if(rspData.status != 200 && rspData.status != 401 && result != true) {
					if(rspData.message && rspData.message.length > 0) {
						layer.msg(rspData.message, {
							icon: 2
						});
					}
				}
				//异步请求的ajax统一$apply()
				if(hData.async != false) {
					if(!$scope) {
						$scope = angular.element(document.getElementById("id-yizhiniao")).scope()
					}
					if($scope != undefined && !$scope.phase && !$scope.$root.phase) {
                        $scope.$apply();
					}
				}
				//console.log("result=",result);
			}

			this.ajax(hData);
			if(localStorage.getItem('oa_token') == "" || localStorage.getItem('oa_token') == undefined || localStorage.getItem('oa_token') == null) {
				//alert('请重新登陆！');
				layer.closeAll();
                returnToLoginPage();
			}
		}

	});
}