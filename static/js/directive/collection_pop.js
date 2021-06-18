define(['students_sel'], function() {
    creatPopup({
        el: 'collectionPop',
        openPopupFn: 'operateBasicPopup',
        htmlUrl: './templates/popup/collection_pop.html',
        controllerFn: function($scope, props) {
            $scope.constants = {
                ulShow: false,
                paymentMoney: '',
                authCode: '',
                studentName: ''
            };
            $scope.Fns = {
                chooseStudent: function() {
                    window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds_potential', '760px', { type: 'potential', choseType: 'radio', sourcePage: '快速收款', callBackName: '快速收款-选择学员', });
                },
                studentClick: function(d) {
                    $scope.constants.phone = d.potentialCustomerParentPhone;
                    $scope.constants.studentName = d.name;
                },
                timerInit: function() {
                    var timer, auto_focus_Timer;
                    $scope.constants.authCode = '';
                    // 付款码聚焦
                    auto_focus_Timer = setInterval(function() {
                        if (document.getElementById("codeInput")) {
                            document.getElementById("codeInput").focus();
                        }
                    }, 500)
                    $scope.clearStatus = function(type, fl) {
                        switch (type) {
                            case 'close':
                                if (auto_focus_Timer) {
                                    clearInterval(auto_focus_Timer);
                                    console.log('已清除')
                                }
                                $scope.closePopup('collection_pay');
                                if (props.fast && !fl) {
                                    $scope.constants.paymentMoney = '';
                                    $scope.constants.studentName = '';
                                    $scope.constants.phone = '';
                                    $scope.constants.remark = '';
                                }
                                break;
                            case 'clear_val':
                                $scope.constants.authCode = '';
                                break;
                        }
                    }
                    $scope.codeFn = function() { //小白盒扫码写入(两个输入间距20ms左右)
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            if ($scope.constants.authCode.length >= 18) {
                                console.log($scope.constants.authCode);
                                $scope.$emit(props.emit, {
                                    code: $scope.constants.authCode,
                                    name: 'apply',
                                    fn: $scope.clearStatus,
                                    params: props.fast ? {
                                        "studentName": $scope.constants.studentName,
                                        "remark": $scope.constants.remark,
                                        "phone": $scope.constants.phone,
                                        "paymentMoney": $scope.constants.paymentMoney
                                    } : null
                                });
                            }
                        }, 200)
                    };
                    $scope.reloadOnlinePay = function() { //刷新订单支付状态
                        $scope.$emit(props.emit, { name: 'f5', fn: $scope.clearStatus });
                    }
                },
                nextStep: function() {
                    if ($scope.constants.paymentMoney == 0) {
                        return layer.msg('收款金额需大于0')
                    }
                    if ($scope.constants.phone && !/^1[23456789]\d{9}$/.test($scope.constants.phone)) {
                        return layer.msg('请输入正确的手机号')
                    }
                    $scope.goPopup('collection_pay', '560px'); //弹出扫码窗口
                    this.timerInit();
                },
                getStudentList: debounce(function() {
                    if (!$scope.constants.studentName) {
                        $scope.constants.studentList = [];
                        $scope.$apply();
                        return;
                    }
                    $.hello({
                        url: CONFIG.URL + '/api/oa/sale/choicePotentialCustomer',
                        type: 'get',
                        data: {
                            searchType: 'studentName',
                            searchName: $scope.constants.studentName
                        },
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.constants.studentList = data.context.items;
                                console.log(data.context.items)
                            }
                        }
                    });
                }, 400)
            }
            if (!props.fast) {
                $scope.Fns.timerInit();
                $scope.constants.paymentMoney = props.paymentMoney;
            }
            $scope.$on('快速收款-选择学员', function(e, data) {
                if (data) {
                    $scope.Fns.studentClick(data)
                }
            })
            $('.layer_msk').click(function(e) {
                if (e.target.className.indexOf('collection_search') != -1) { return }
                if ($scope.constants.ulShow) {
                    $scope.constants.ulShow = false;
                    $scope.$apply();
                }
            });
        }
    });
});