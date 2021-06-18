// 用户的特殊标志，一般用id或者生成的uuid，后台为Long，不可带有中文，并且这些值如果从session中获取，需要注意前后端分离带来的session，否则会报错,这些参数主要对应着后台的message类，用于信息的发送
function webSocketInit(id, fn) {
    try {
        $.hello({
            url: CONFIG.URL + "/api/oa/order/getSocketUrl",
            type: "get",
            data: {},
            success: function (res) {
                if (res.status == '200') {
                    if(res.context) {
                        try {
                            var socket =  io.connect(res.context + '?clientId='+ id, {transports:['websocket','xhr-polling','jsonp-polling']});
                            console.log('已连接', socket);
                            //监听名为pushpoint的事件，这与服务端推送的那个事件名称必须一致 
                            socket.on("refreshOrderQRCode", function(data){
                                console.log('已回调');
                                fn(data);
                                socket.disconnect();
                            });
                        }catch(err) {
                            console.log(err);
                        }
                    } else {
                        layer.msg('支付成功后点击下方刷新支付状态');
                    }
                }
            }
        });
    }
    catch (err) {
        console.log(err);
    }
};

