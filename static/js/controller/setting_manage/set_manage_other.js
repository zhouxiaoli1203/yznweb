define(['laydate', 'kindeditor', 'mySelect', 'staff_sel'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', '$sce', function($scope, $rootScope, $http, $state, $stateParams, $timeout, $sce) {
        init();
        var editor;

        function init() {
            $scope.switchVisitNav = switchVisitNav;
            $scope.tabIndex_1 = 1;
            $scope.tabIndex_2 = 1;
            $scope.tabIndex_4 = 1;
            $scope.BillSettingInfo = {};
            $scope.nameListThead_2 = [ //短信设置
                { 'name': '触发条件' },
                { 'name': '功能描述', 'width': '420px' },
                { 'name': '应用端通知', 'align': 'center' },
                { 'name': '短信通知', 'align': 'center' },
                { 'name': '预览', 'width': '190px', 'align': 'center' },
            ];
            $scope.tabSwitch = function(value) {
                $scope['tabIndex_' + $scope.visitNavJud] = value;
                if ($scope.visitNavJud == 1) {
                    if ($scope.tabIndex_1 == 1) {
                        $scope.getBillSettingInfo();
                    } else if ($scope.tabIndex_1 == 2) {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/setting/notice/info',
                            type: 'get',
                            success: function(data) {
                                if (data.status == "200") {
                                    $scope.postData = data.context;
                                    if (editor) {
                                        editor.remove();
                                    }
                                    $scope.kindEditor();
                                }
                            }
                        });

                    } else {
                        $scope.h5_pay_options = {};
                        $.hello({
                            url: CONFIG.URL + '/api/oa/setting/shopPayment/info',
                            type: 'get',
                            success: function(data) {
                                if (data.status == "200") {
                                    $scope.h5_pay_options = data.context;
                                }
                            }
                        });
                    }
                }

                if ($scope.visitNavJud == 2) {
                    if ($scope.tabIndex_2 == 3) {
                        $scope.getShopSmsInfo();
                    } else {
                        $scope.getConfig();
                    }
                }

                if ($scope.visitNavJud == 4) {
                    if ($scope.tabIndex_4 == 1) {
                        $scope.operateBtn(1);
                    } else {
                        $scope.operateBtn(2);
                    }
                }
            };
            /*
             *报名设置
             */
            $scope.operateOption = function(type) {
                $scope.h5_pay_options[type] = $scope.h5_pay_options[type] == 1 ? 0 : 1;
                if (type == 'phoneShow' && $scope.h5_pay_options[type] == 0) {
                    $scope.h5_pay_options.phoneNeed = 0;
                }
                if (type == 'phoneNeed' && $scope.h5_pay_options[type] == 1 && $scope.h5_pay_options.phoneShow == 0) {
                    $scope.h5_pay_options.phoneShow = 1;
                }
                if (type == 'descShow' && $scope.h5_pay_options[type] == 0) {
                    $scope.h5_pay_options.descNeed = 0;
                }
                if (type == 'descNeed' && $scope.h5_pay_options[type] == 1 && $scope.h5_pay_options.descShow == 0) {
                    $scope.h5_pay_options.descShow = 1;
                }

                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/shopPayment/update',
                    type: 'post',
                    data: JSON.stringify({
                        phoneNeed: $scope.h5_pay_options.phoneNeed,
                        phoneShow: $scope.h5_pay_options.phoneShow,
                        descNeed: $scope.h5_pay_options.descNeed,
                        descShow: $scope.h5_pay_options.descShow,
                    }),
                    success: function(data) {
                        if (data.status == "200") {
                            layer.msg('保存成功')
                        }
                    }
                });
            };
            //添加图片按钮显示隐藏
            $scope.imgover = function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.shop_img').find('.shop_img_msk').show();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').show();
                }
            };
            $scope.imgout = function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.shop_img').find('.shop_img_msk').hide();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').hide();
                }
            };
            $scope.add_organInfo = function(type, d) {
                switch (type) {
                    case 'logo': //添加首页图片
                        $timeout(function() {
                            szpUtil.util_addImg(true, function(data) {
                                $scope.BillSettingInfo.logo = data;
                                $scope.$apply();
                            }, { options: { aspectRatio: 1 }, type: 'image/gif, image/jpeg, image/png' });
                        });
                        break;
                    case 'miniWebsite': //添加首页图片
                        $timeout(function() {
                            szpUtil.util_addImg(true, function(data) {
                                $scope.BillSettingInfo.miniWebsite = data;
                                $scope.$apply();
                            }, { options: { aspectRatio: 1 }, type: 'image/gif, image/jpeg, image/png' });
                        });
                        break;
                }
            };
            // 订单打印设置
            $scope.updateBillSettingInfo = function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/updateBillSettingInfo',
                    type: 'post',
                    data: JSON.stringify($scope.BillSettingInfo),
                    success: function(data) {
                        if (data.status == "200") {
                            layer.msg('保存成功')
                        }

                    }
                });
            }
            $scope.getBillSettingInfo = function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/getBillSettingInfo',
                    type: 'get',
                    success: function(data) {
                        if (data.status == "200") {
                            try {
                                $scope.BillSettingInfo = data.context;
                                if ($scope.BillSettingInfo.doStatus == 0) {
                                    $scope.BillSettingInfo.billSettingDesc = ''
                                }
                                delete $scope.BillSettingInfo.id;
                                delete $scope.BillSettingInfo.shopId;
                            } catch (e) {}


                        }

                    }
                });
            };
            //富文本编辑器
            $scope.kindEditor = function() {
                KindEditor.ready(function(K) {
                    editor = K.create('#textcontain', {
                        height: '500px',
                        resizeType: 1,
                        allowPreviewEmoticons: false,
                        allowImageUpload: true,
                        items: [
                            'undo', 'redo', '|', 'preview', 'print', 'template', 'cut', 'copy', 'paste',
                            'plainpaste', 'wordpaste', '|', 'justifyleft', 'justifycenter', 'justifyright',
                            'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                            'superscript', 'quickformat', 'selectall', '|', 'fullscreen', '/',
                            'formatblock', 'fontname', 'fontsize', '|', 'forecolor', 'hilitecolor', 'bold',
                            'italic', 'underline', 'strikethrough', 'lineheight', 'removeformat', '|', 'image',
                            'table', 'hr', 'emoticons', 'baidumap', 'pagebreak',
                            'anchor', 'link', 'unlink'
                        ],
                    });
                    editor.html($scope.postData.notice ? $scope.postData.notice : "")
                });

            };
            $scope.needToknowSub = function() {
                if (!editor.html()) {
                    return layer.msg("内容不能为空！")
                }
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/notice/update',
                    type: 'post',
                    data: JSON.stringify({
                        shopId: window.currentUserInfo.shopId,
                        notice: editor.html()
                    }),
                    success: function(data) {
                        if (data.status == "200") {
                            layer.msg('保存成功')
                        }
                    }
                });
            };

            /*
             *通知设置
             */
            //获取短信通知设置列表数据
            $scope.getmessageSetList = function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/sms/configList',
                    type: "get",
                    data: {},
                    success: function(res) {
                        if (res.status == 200) {
                            var list1 = [],
                                list2 = [];
                            angular.forEach(res.context, function(v) {
                                if (v.target == 1) {
                                    list1.push(v);
                                } else {
                                    list2.push(v);
                                }
                            });
                            list2.unshift({
                                wxappStatus: $scope.currentShop.smsStudentBalanceShow == 1 ? true : false,
                                special: true,
                                name: '显示账户余额',
                                description: '开启后，课时消耗提醒通知中显示学员账户余额',
                                wxappPreivew: './static/img/stud_account_notice.png?v=688a0f8410',

                            })
                            $scope.messageSetList1 = list1;
                            $scope.messageSetList2 = list2;
                        };
                    }
                });
            };
            $scope.operationPower = checkAuthMenuById(87); //是否拥有操作权力
            //短信列表的操作
            $scope.operationList_msg = function(type, d, fl) {
                $scope.previewImg = "";
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
                        tit = d.wxappStatus ? '是否关闭应用端通知？' : '是否开启应用端通知';
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
                    case 6: //关闭预览
                        $scope.previewImg = d;
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
                }

                //如果是短信设置列表的开关操作
                if (type == 1 || type == 2) {
                    detailMsk(tit, function() {
                        if (fl) {
                            params = {
                                smsStudentBalanceShow: d.wxappStatus ? "0" : "1",
                            }
                        }
                        $.hello({
                            url: CONFIG.URL + (fl ? "/api/oa/sms/updateShopInWx" : '/api/oa/sms/updateConfig'),
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(res) {
                                if (res.status == 200) {
                                    if (fl) $scope.currentShop.smsStudentBalanceShow = params.smsStudentBalanceShow;
                                    $scope.getmessageSetList();
                                };
                            }
                        });
                    })
                }
            };
            $scope.getConfig = function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.currentShop = data.context;
                            $scope.smsMsg = $scope.currentShop.smsMsg;
                            $scope.getmessageSetList();
                        }
                    }
                })
            };
            //自定义通知后缀
            $scope.set_confirm = function() {
                if ($scope.smsMsg == $scope.currentShop.smsMsg) {
                    return;
                }

                var param = {
                    smsMsg: $scope.smsMsg
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/sms/updateShopInWx",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.currentShop.smsMsg = $scope.smsMsg;
                            layer.msg('设置成功');
                        }
                    }
                })
            }

            $scope.getShopSmsInfo = function() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/sms/getShopSmsInfo',
                    type: "get",
                    data: {},
                    success: function(res) {
                        if (res.status == 200) {
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
            $scope.confirm_updateInfo = function() {
                var params = {
                    'smsWarningNum': $scope.messageTotleInfo.smsWarningNum,
                    'smsWarningPhone': $scope.messageTotleInfo.smsWarningPhone,
                    'signName': $scope.messageTotleInfo.signName,
                    'birthdayTemplate': $scope.messageTotleInfo.birthdayTemplate,
                }
                $.hello({
                    url: CONFIG.URL + '/api/oa/sms/updateShopSmsInfo',
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            layer.msg('设置成功');
                        };
                    }
                });
            }
            $scope.tipShow = function(evt) {
                evt.stopPropagation();
                $(evt.target).find('.tippaopao').show();
            };
            $scope.tipHide = function(evt) {
                evt.stopPropagation();
                $(evt.target).find('.tippaopao').hide();
            };
            /*
             *学员考勤
             */
            $scope.setInit = function() {
                $scope.workList = [];
                $scope.weekList = [];
                //获取设置数据
                $.hello({
                    url: CONFIG.URL + "/api/oa/studentAttendanceRules/signSetting",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.shop = data.context;
                            $scope.config = $scope.shop.shop.config;
                            angular.forEach($scope.shop.studentAttendanceRulesList, function(v) {
                                if (v.rulesType == "0") {
                                    $scope.workList.push(v);
                                } else {
                                    $scope.weekList.push(v);

                                }
                            });
                        }
                    }
                })
                $scope.selTimeFrame = selTimeFrame;
                $scope.changeStatus = changeStatus;
                $scope.addTime = addTime; //新增时间段
                $scope.deleteItem = deleteItem; //删除时间段
                function selTimeFrame(d, evt, type) {
                    laydate.render({
                        elem: evt.target, //指定元素
                        isRange: false,
                        type: "time",
                        format: 'HH:mm',
                        done: function(value, value2) {
                            switch (type) {
                                case 1:
                                    d.signInBeginTime = value;
                                    break;
                                case 2:
                                    d.signInEndTime = value;
                                    break;
                                case 3:
                                    d.signBackBeginTime = value;
                                    break;
                                case 4:
                                    d.signBackEndTime = value;
                                    break;
                                default:
                                    break;
                            }
                        },
                        ready: function formatminutes() {
                            $($(".laydate-time-list li ol")[2]).find("li").remove(); //清空秒
                        }
                    });
                }

                function changeStatus(x) {
                    x.signBackStatus = x.signBackStatus == "1" ? "0" : "1";
                }

                function addTime(t) {
                    var obj = {
                        rulesName: "",
                        signInBeginTime: undefined,
                        signInEndTime: undefined,
                        signBackStatus: "0",
                        signBackBeginTime: undefined,
                        signBackEndTime: undefined,
                    };
                    if (t === 1) {
                        obj["rulesType"] = "0";
                        $scope.workList.push(obj);
                    } else {
                        obj["rulesType"] = "1";
                        $scope.weekList.push(obj);
                    }
                }

                function deleteItem(list, ind) {
                    list.splice(ind, 1);
                }
            };
            $scope.field = CONFIG_FACE_DETECT;
            $scope.changeSet = function() {
                if (($scope.field) & ($scope.config)) {
                    $scope.config = $scope.config & (~($scope.field)); //禁用
                } else {
                    $scope.config = $scope.config | ($scope.field); //启用
                }
            }
            $scope.$watch('config', function() {
                $scope.change_confirm = ($scope.field) & ($scope.config) ? true : false;
            });

            function check(a, b, x, y) {
                if (y <= a || b <= x) {
                    return false;
                } else {
                    return true;
                }
            }

            function checkTimes(l1, type) {
                var msg = type == "work" ? "周一到周五考勤时间段有重叠！" : "周六周日考勤时间段有重叠！";

                var flag = false;
                for (var i = 0, len = l1.length; i < len; i++) {
                    if (l1[i].signInEndTime <= l1[i].signInBeginTime || (l1[i].signBackStatus == "1" && l1[i].signBackEndTime <= l1[i].signBackBeginTime)) {
                        msg = "同一考勤时段内的结束时间要大于开始时间!";
                        flag = true;
                        break;
                    }
                    if (l1[i].signBackStatus == "1" && l1[i].signBackBeginTime < l1[i].signInEndTime) {
                        msg = "签退开始时间不能小于签到结束时间!";
                        flag = true;
                        break;
                    }
                    //              if(l1[i].signBackStatus=="1" && check(l1[i].signInBeginTime,l1[i].signInEndTime,l1[i].signBackBeginTime,l1[i].signBackEndTime)){
                    //                  flag = true;
                    //                  break;
                    //              }
                    var flag_ = false;
                    for (var j = i + 1, len_j = l1.length; j < len_j; j++) {
                        if (check(l1[i].signInBeginTime, l1[i].signInEndTime, l1[j].signInBeginTime, l1[j].signInEndTime)) {
                            flag_ = true;
                            break;
                        }
                        if (l1[j].signBackStatus == "1" && check(l1[i].signInBeginTime, l1[i].signInEndTime, l1[j].signBackBeginTime, l1[j].signBackEndTime)) {
                            flag_ = true;
                            break;
                        }
                        if (l1[i].signBackStatus == "1" && check(l1[i].signBackBeginTime, l1[i].signBackEndTime, l1[j].signInBeginTime, l1[j].signInEndTime)) {
                            flag_ = true;
                            break;
                        }
                        if (l1[i].signBackStatus == "1" && l1[j].signBackStatus == "1" && check(l1[i].signBackBeginTime, l1[i].signBackEndTime, l1[j].signBackBeginTime, l1[j].signBackEndTime)) {
                            flag_ = true;
                            break;
                        }
                    }
                    if (flag_) {
                        flag = true;
                        break;
                    } else {
                        flag = false;
                    }
                }

                if (flag) {
                    return [false, msg];
                } else {
                    return [true];
                }
            }
            $scope.confirm_set = function() {
                var obj1 = checkTimes($scope.workList, "work");
                if (!obj1[0]) {
                    return layer.msg(obj1[1]);
                }
                var obj2 = checkTimes($scope.weekList, "week");
                if (!obj2[0]) {
                    return layer.msg(obj2[1]);
                }
                var list = $scope.workList.concat($scope.weekList);
                var params = {
                    config: $scope.config,
                    studentAttendanceRulesList: angular.copy(list)
                };

                $.hello({
                    url: CONFIG.URL + "/api/oa/studentAttendanceRules/update",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            layer.msg('设置成功！');
                            window.currentUserInfo.shop.config = $scope.config;
                        };
                    }
                });
            };
            /*
             *假期考勤
             */
            $scope.dailyData = {
                screenData: { //筛选数据
                    fullTime: undefined,
                },
                peoInfo: {
                    teacherId: '',
                    detailTime: '',
                    state: undefined,
                    allChecked: false, //全选
                    checkedData: [],
                    stateList: [
                        { 'name': '迟到', 'value': 0 },
                        { 'name': '上班缺卡', 'value': 1 },
                        { 'name': '早退', 'value': 2 },
                        { 'name': '下班缺卡', 'value': 3 },
                        { 'name': '旷工', 'value': 4 },
                    ]
                },
                lateInfo: null,
                pushTime: '', //打卡时间
                showLeave: false,
                newAddVacation: {
                    id: '',
                    name: '',
                    time: '',
                    dec: '',
                },
                changeTime: {
                    type: 0, //上班或者休息
                    time_1: '',
                    time_2: '',
                }
            };
            //选择考勤组员工监听回调
            $scope.$on('attend', function(d, _da) {
                $scope.dailyData.newAddSet.peoList = _da;
            })
            $scope.weekList = [1, 2, 3, 4, 5, 6, 7]; //星期列表
            $scope.operateBtn = function(type, _da, sp) {
                switch (type) {
                    case 1: //员工假期
                        $.hello({
                            url: CONFIG.URL + "/api/oa/attendance/shopTeacherHoliday/list",
                            type: "get",
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.peoVacationList = res.context;
                                }
                            }
                        });
                        break;
                    case 2: //考勤设置
                        $.hello({
                            url: CONFIG.URL + "/api/oa/attendance/attendanceRules/list",
                            type: "get",
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.dailySetList = res.context;
                                    manualOnresize();
                                }
                            }
                        });
                        break;
                    case 3: //新增员工假期
                        $scope.dailyData.newAddVacation = {
                            id: '',
                            name: '',
                            time: '',
                            dec: '',
                        };
                        openPopByDiv('新增员工假期', '.daily_vacation_add', '560px', function() {
                            laydate.render({
                                elem: '#daily_detail_3',
                                range: '到',
                                isRange: true,
                                btns: ['confirm'],
                                done: function(value) {
                                    $scope.dailyData.newAddVacation.time = value;
                                }
                            });
                        });
                        break;
                    case 4: //确定修改员工假期
                        var url_ = '/api/oa/attendance/shopTeacherHoliday/add';
                        if ($scope.dailyData.newAddVacation.id) {
                            url_ = '/api/oa/attendance/shopTeacherHoliday/update';
                        };
                        $.hello({
                            url: CONFIG.URL + url_,
                            type: "post",
                            data: JSON.stringify({
                                'shopTeacherHolidayId': $scope.dailyData.newAddVacation.id ? $scope.dailyData.newAddVacation.id : undefined,
                                'holidayName': $scope.dailyData.newAddVacation.name,
                                'holidayBeginTime': $scope.dailyData.newAddVacation.time.split(' 到 ')[0],
                                'holidayEndTime': $scope.dailyData.newAddVacation.time.split(' 到 ')[1],
                                'holidayDesc': $scope.dailyData.newAddVacation.dec,
                            }),
                            success: function(res) {
                                if (res.status == 200) {
                                    layer.msg('操作成功');
                                    layer.close(dialog);
                                    $scope.operateBtn(1);
                                };
                            }
                        });
                        break;
                    case 5: //编辑员工假期
                        $scope.dailyData.newAddVacation = {
                            id: _da.shopTeacherHolidayId,
                            name: _da.holidayName,
                            time: $.format.date(_da.holidayBeginTime, 'yyyy-MM-dd') + ' 到 ' + $.format.date(_da.holidayEndTime, 'yyyy-MM-dd'),
                            dec: _da.holidayDesc,
                        };
                        openPopByDiv('编辑员工假期', '.daily_vacation_add', '560px', function() {
                            laydate.render({
                                elem: '#daily_detail_3',
                                range: '到',
                                isRange: true,
                                value: $.format.date(_da.holidayBeginTime, 'yyyy-MM-dd') + ' 到 ' + $.format.date(_da.holidayEndTime, 'yyyy-MM-dd'),
                                btns: ['confirm'],
                                done: function(value) {
                                    $scope.dailyData.newAddVacation.time = value;
                                }
                            });
                        });
                        break;
                    case 6: //删除员工假期
                        var isDelect = layer.confirm('确定删除该条记录？', {
                            title: "确认信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['确定', '取消'] //按钮
                        }, function() {
                            $.hello({
                                url: CONFIG.URL + '/api/oa/attendance/shopTeacherHoliday/delete',
                                type: "post",
                                data: JSON.stringify({
                                    'shopTeacherHolidayId': _da.shopTeacherHolidayId,
                                }),
                                success: function(res) {
                                    if (res.status == 200) {
                                        layer.msg('操作成功');
                                        layer.close(isDelect);
                                        $scope.operateBtn(1);
                                    };
                                }
                            });
                        }, function() {
                            layer.close(isDelect);
                        })
                        break;
                    case 7: //新增考勤组
                        $scope.dailyData.newAddSet = {
                            id: '',
                            name: '',
                            type: 0,
                            days: {},
                            time_1: '',
                            time_2: '',
                            peoList: [],
                        };
                        openPopByDiv('新增考勤组', '.daily_set_add', '760px', function() {
                            laydate.render({
                                elem: '#daily_detail_4',
                                type: 'time',
                                btns: ['confirm'],
                                done: function(value) {
                                    $scope.dailyData.newAddSet.time_1 = value;
                                }
                            });
                            laydate.render({
                                elem: '#daily_detail_5',
                                type: 'time',
                                btns: ['confirm'],
                                done: function(value) {
                                    $scope.dailyData.newAddSet.time_2 = value;
                                }
                            });
                        });
                        break;
                    case 8: //选择考勤员工-打开筛选器
                        $scope.$broadcast('staffSel_popup', 'choseStaff', '760px', { 'callBackName': 'attend', 'attendanceRulesId': $scope.dailyData.newAddSet.id, items: $scope.dailyData.newAddSet.peoList });
                        break;
                    case 9: //删除考勤组员工选择
                        $scope.dailyData.newAddSet.peoList.splice(_da, 1);
                        break;
                    case 10: //确定修改考勤组
                        {
                            var submit_params = function() {
                                $.hello({
                                    url: CONFIG.URL + url_,
                                    type: "post",
                                    data: JSON.stringify({
                                        'attendanceRulesId': $scope.dailyData.newAddSet.id,
                                        'name': $scope.dailyData.newAddSet.name,
                                        'type': $scope.dailyData.newAddSet.type,
                                        'weeks': $scope.dailyData.newAddSet.type == 0 ? weeks.join(',') : undefined,
                                        'beginTime': $scope.dailyData.newAddSet.type == 0 ? $scope.dailyData.newAddSet.time_1 : undefined,
                                        'endTime': $scope.dailyData.newAddSet.type == 0 ? $scope.dailyData.newAddSet.time_2 : undefined,
                                        'shopTeacherList': shopTeacherList,
                                    }),
                                    success: function(res) {
                                        if (res.status == 200) {
                                            layer.msg('操作成功');
                                            layer.close(dialog);
                                            // $scope.dailyFun.getUnfenzuList(0);
                                            $scope.operateBtn(2);
                                        };
                                    }
                                });
                            };
                            var url_ = '/api/oa/attendance/attendanceRules/add',
                                weeks = [],
                                shopTeacherList = [];
                            for (var i in $scope.dailyData.newAddSet.days) {
                                if ($scope.dailyData.newAddSet.days[i]) {
                                    if (i == 7) {
                                        weeks.push('日');
                                    } else {
                                        weeks.push(changeToChinese(i));
                                    };
                                };
                            };
                            //选择员工
                            angular.forEach($scope.dailyData.newAddSet.peoList, function(v1) {
                                shopTeacherList.push({ 'shopTeacherId': v1.shopTeacher.shopTeacherId });
                            });

                            if ($scope.dailyData.newAddSet.type == 0) {
                                if (!$scope.dailyData.newAddSet.time_1) return layer.msg('请选择上班时间');
                                if (!$scope.dailyData.newAddSet.time_2) return layer.msg('请选择下班时间');
                            };
                            if ($scope.dailyData.newAddSet.id) { //如果是修改
                                url_ = '/api/oa/attendance/attendanceRules/update';
                                var isDelect = layer.confirm('是否立即生效？确定后今日考勤结果将按新规则重新计算。', {
                                    title: "确认信息",
                                    skin: 'newlayerui layeruiCenter',
                                    closeBtn: 1,
                                    offset: '30px',
                                    move: false,
                                    area: '560px',
                                    btn: ['是', '否'] //按钮
                                }, function() {
                                    submit_params();
                                }, function() {
                                    layer.close(isDelect);
                                })
                            } else {
                                submit_params();
                            };

                        }
                        break;
                    case 11: //编辑考勤组
                        $.hello({
                            url: CONFIG.URL + '/api/oa/attendance/attendanceRules/info',
                            type: "get",
                            data: {
                                'attendanceRulesId': _da.attendanceRulesId,
                            },
                            success: function(res) {
                                if (res.status == 200) {
                                    var res = res.context;
                                    $scope.dailyData.newAddSet = {
                                        id: res.attendanceRulesId,
                                        name: res.name,
                                        type: res.type,
                                        days: {},
                                        time_1: res.beginTime ? res.beginTime : '',
                                        time_2: res.endTime ? res.endTime : '',
                                        peoList: res.teacherAttendanceRS,
                                    };
                                    angular.forEach(res.weeks, function(v1) {
                                        switch (v1) {
                                            case '一':
                                                $scope.dailyData.newAddSet.days[1] = true;
                                                break;
                                            case '二':
                                                $scope.dailyData.newAddSet.days[2] = true;
                                                break;
                                            case '三':
                                                $scope.dailyData.newAddSet.days[3] = true;
                                                break;
                                            case '四':
                                                $scope.dailyData.newAddSet.days[4] = true;
                                                break;
                                            case '五':
                                                $scope.dailyData.newAddSet.days[5] = true;
                                                break;
                                            case '六':
                                                $scope.dailyData.newAddSet.days[6] = true;
                                                break;
                                            case '日':
                                                $scope.dailyData.newAddSet.days[7] = true;
                                                break;
                                        }
                                    });
                                    openPopByDiv('编辑考勤组', '.daily_set_add', '760px', function() {
                                        laydate.render({
                                            elem: '#daily_detail_4',
                                            type: 'time',
                                            btns: ['confirm'],
                                            done: function(value) {
                                                $scope.dailyData.newAddSet.time_1 = value;
                                            }
                                        });
                                        laydate.render({
                                            elem: '#daily_detail_5',
                                            type: 'time',
                                            btns: ['confirm'],
                                            done: function(value) {
                                                $scope.dailyData.newAddSet.time_2 = value;
                                            }
                                        });
                                    });
                                };
                            }
                        });
                }
            }


            /*
             *工资模板
             */
            //工资模板设置

            $scope.openSetPayroll = function() {
                // 拖拽后执行的方法
                $scope.onDropComplete = function(index, obj, evt) {
                    if (evt.data.payrollHeadId) {
                        //重新排序
                        var idx = $scope.salaryTable.indexOf(obj);
                        $scope.salaryTable.splice(idx, 1);
                        $scope.salaryTable.splice(index, 0, obj);
                        orderConfirm();
                    }
                };
                var modelDialog;
                getSalaryTable();
                $scope.addModel = addModel; //新增工资表头
                $scope.deleteModel = deleteModel; //删除工资表头
                $scope.closeSalaryPop = closeSalaryPop; //新增工资表头
                $scope.addSalary_confirm = addSalary_confirm; //新增工资表头确认
                // openPopByDiv('工资模板设置', '.salaryModel', '760px');

                function getSalaryTable() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/payroll/payrollHead/list",
                        type: "get",
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.salaryTable = res.context;
                            }
                        }
                    });
                }

                function closeSalaryPop() {
                    layer.close(modelDialog);
                }

                function addModel(type, x) {
                    $scope.headType = type;
                    if (type == 'add') {
                        $scope.salaryHead = {
                            payrollHeadName: "",
                            payrollHeadId: undefined
                        }
                    } else {
                        $scope.salaryHead = angular.copy(x);
                    }
                    modelDialog = layer.open({
                        type: 1,
                        title: (type == 'add' ? "新增" : "修改") + "工资表头",
                        skin: 'layerui', //样式类名
                        closeBtn: 1, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '560px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $(".addSalary"),
                    });
                }

                function addSalary_confirm() {
                    var url;
                    var param = {
                        payrollHeadName: $scope.salaryHead.payrollHeadName
                    }
                    if ($scope.headType == 'add') {
                        url = "add";
                    } else {
                        url = "update";
                        param["payrollHeadId"] = $scope.salaryHead.payrollHeadId;
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/payroll/payrollHead/" + url,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(res) {
                            if (res.status == 200) {
                                closeSalaryPop();
                                getSalaryTable();
                            }
                        }
                    });
                }

                function deleteModel(x) {
                    var isDelect = layer.confirm('是否删除工资单表头，删除后不可恢复', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/payroll/payrollHead/delete",
                            type: "post",
                            data: JSON.stringify({
                                payrollHeadId: x.payrollHeadId
                            }),
                            success: function(res) {
                                if (res.status == 200) {
                                    layer.close(isDelect);
                                    getSalaryTable();
                                }
                            }
                        });

                    }, function() {
                        layer.close(isDelect);
                    })
                }

                function orderConfirm() {
                    var arr = [];
                    angular.forEach($scope.salaryTable, function(v, ind) {
                        arr.push({
                            payrollHeadId: v.payrollHeadId,
                            payrollHeadOrd: ind + 1
                        });
                    });
                    var param = {
                        payrollHeads: arr,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/payroll/updatePayrollHeadOrd",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(res) {
                            if (res.status == 200) {}
                        }
                    });
                }

            }

            // 初始化菜单&跳转
            var list = [
                { name: "报名设置", tab: 1, post: 180 },
                { name: "通知设置", tab: 2, post: 181 },
                { name: "学员考勤", tab: 3, post: 182 },
                { name: "员工考勤", tab: 4, post: 183 },
                { name: "工资模板", tab: 5, post: 184 },
                { name: "费用分类", tab: 6, post: 185 },
            ]
            $scope.tabMenu = list.filter(function(item) {
                return checkAuthMenuById(item.post);
            });
            if ($stateParams.tab) { //跳转带tab信息
                var tabItem = $scope.tabMenu.filter(function(item) {
                    return item.tab == $stateParams.tab
                });
                if (tabItem.length) {
                    switchVisitNav(tabItem[0].tab);
                    if ($stateParams.tab_) { //易收宝报名须知
                        $scope.tabSwitch($stateParams.tab_);
                    }
                } else {
                    switchVisitNav($scope.tabMenu[0].tab)
                }
                if ($stateParams.before) {
                    $scope.routerBefore = $stateParams.before;
                }
            } else { //不带信息 || 刷新
                var statetime = localStorage.getItem("$statetime");
                if (statetime) {
                    var tabItem = $scope.tabMenu.filter(function(item) {
                        return item.tab == statetime;
                    });
                    if (tabItem.length) {
                        switchVisitNav(tabItem[0].tab)
                    } else {
                        switchVisitNav($scope.tabMenu[0].tab);
                    }
                } else {
                    switchVisitNav($scope.tabMenu[0].tab);
                }
            }
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.visitNavJud = $scope.$stateParams.screenValue.tab;
                    $timeout(function () {
                        switchVisitNav($scope.visitNavJud);
                        if ($scope.$stateParams.screenValue.tab_) { //易收宝报名须知
                            $scope.tabSwitch($scope.$stateParams.screenValue.tab_);
                        }
                    })
                }
            }
        }
        $scope.closePopup = function() {
            layer.close(dialog)
        };
        /*
         *费用分类
         */
        $scope.searchName = undefined;
        init_();

        function init_() {
            $scope.kindSearchData = {
                shopCostTypeName: "分类名称、备注",
            };
            $scope.selectInfoNameId = "shopCostTypeName";
            $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
            $scope.SearchData = SearchData; //按钮搜索
            $scope.changeType = changeType; //费用收支类型
            $scope.onReset = onReset; //重置
            $scope.addClassify = addClassify; //预设时间--新增或编辑时间弹出框
            $scope.deletePreClassify = deletePreClassify; //预设时间--删除预设时间
        }

        function onReset() {
            $scope.kindSearchOnreset();
            $scope.searchName = undefined;
            $scope.sc_type0 = $scope.sc_type1 = false;
            getClassifyList();
        }
        //回车键  删除键
        function Enterkeyup(data) {
            $scope.searchName = data.value;
            getClassifyList();
        }

        //搜索button
        function SearchData(data) {
            $scope.searchName = data.value;
            getClassifyList();
        }

        function changeType(type) {
            if (type) {
                if ($scope.sc_type1) {
                    $scope.sc_type0 = false;
                }
            } else {
                if ($scope.sc_type0) {
                    $scope.sc_type1 = false;
                }
            }
            getClassifyList();
        }

        function getClassifyList() {
            var param = {
                searchType: 'appSearchName',
                searchName: $scope.searchName,
                shopCostPayType: $scope.sc_type0 ? "0" : $scope.sc_type1 ? "1" : undefined
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/shopCost/type/list",
                type: "get",
                data: param,
                success: function(res) {
                    if (res.status == 200) {
                        $scope.classifyList = res.context;
                    }
                }
            });
        }

        function addClassify(type, x) {
            $scope.operateType = type;
            if (type == "add") {
                $scope.expense = {
                    shopCostTypeName: "",
                    shopCostPayType: "0",
                    shopCostTypeDesc: "",
                };
            } else {
                $scope.expense = x;
                getExpenseInfo();
            }


            $scope.confirmClassify = confirmClassify; //新增或编辑预设时间
            // $scope.goPopup("add_preSetClassify", "760px");
            openPopByDiv(x ? '编辑分类' : '新增分类', '.add_preSetClassify', '760px');


            function getExpenseInfo() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopCost/type/info",
                    type: "get",
                    data: { shopCostTypeId: $scope.expense.shopCostTypeId },
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.expense = res.context;
                        }
                    }
                });
            }

            function confirmClassify() {
                var params = {
                    "shopCostTypeName": $scope.expense.shopCostTypeName,
                    "shopCostPayType": $scope.expense.shopCostPayType,
                    "shopCostTypeDesc": $scope.expense.shopCostTypeDesc
                };
                if ($scope.operateType == "add") {
                    url = "/api/oa/shopCost/type/add";
                } else {
                    url = "/api/oa/shopCost/type/update";
                    params["shopCostTypeId"] = $scope.expense.shopCostTypeId;
                }
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            getClassifyList();
                            $scope.closePopup('add_preSetClassify');
                        }
                    }
                });
            }
        }

        function deletePreClassify(x) {
            var isCfirm = layer.confirm('是否删除本条费用分类，删除后不可恢复？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                resize: false,
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var param = {
                    "shopCostTypeId": x.shopCostTypeId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopCost/type/delete",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('已成功删除分类', {
                                icon: 1
                            });
                            getClassifyList();
                        };
                    }
                })
            }, function() {
                layer.close(isCfirm);
            })

        }

        function switchVisitNav(n) {
            $scope.visitNavJud = n;
            localStorage.setItem("$statetime", $scope.visitNavJud);
            switch (Number(n)) {
                case 1:
                    $scope.tabSwitch($scope.tabIndex_1);
                    // $scope.getBillSettingInfo();
                    break;
                case 2:
                    $scope.tabSwitch($scope.tabIndex_2);
                    // $scope.getConfig();
                    break;
                case 3:
                    $scope.setInit();
                    break;
                case 4:
                    $scope.tabSwitch($scope.tabIndex_4);
                    // $scope.operateBtn(1, true)
                    break;
                case 5:
                    $scope.openSetPayroll();
                    break;
                case 6:
                    $scope.searchName = undefined;
                    $scope.sc_type0 = $scope.sc_type1 = false;
                    getClassifyList();
                    break;
            }
        }
    }]
})