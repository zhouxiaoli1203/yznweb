define([], function() {
    creatPopup({
        el: 'timePop',
        openPopupFn: 'preSetTimeFn',
        htmlUrl: './templates/popup/time_pop.html',
        controllerFn: function($scope, props,SERVICE,$timeout) {
            console.log(props);
            init();
            function init() {
                getPresetTimeList();
                $scope.selectedTime = ""; //预设时间页面默认未选中
                $scope.addPretime = addPretime; //预设时间--新增或编辑时间弹出框
                $scope.deletePreTime = deletePreTime; //预设时间--删除预设时间
                $scope.selSingle_lf = selSingle_lf; //预设时间--单选预设时间
                $scope.confirm_selTime = confirm_selTime; //预设时间--确认选择一预设时间
            }

            function selSingle_lf(x) {
                $scope.selectedTime = x;
                angular.forEach($scope.presetTimeList, function(v) {
                    v.hasChecked = false;
                });
                x.hasChecked = true;
            }
    
            function addPretime(type, timeData) {
                $scope.operateType = type;
                $scope.confirmPresetTime = confirmPresetTime; //新增或编辑预设时间
                $scope.addClasstime = addClasstime; //时间值

                $scope.add_changeTime = {
                    "beginTime": "07:00",
                    "endTime": "08:00"
                };
                $scope.$watch("add_changeTime", function() {
                    if($scope.add_changeTime){
                        $scope.add_changeMins = getMinutes_($scope.add_changeTime);
                    }
                });

                if (type == "add") {
                    $scope.$broadcast("add_preSetTime_Id");
                } else {
                    $scope.add_presetTime = {
                        "beginTime": timeData.beginTime,
                        "endTime": timeData.endTime
                    };
                }
                $scope.goPopup("add_preSetTime", "560px");

                function addClasstime(x) {
                    $scope.add_changeTime = x;
                }

                function confirmPresetTime() {
                    if ($scope.add_changeMins <= 0) {
                        layer.msg("上课时长必须大于0");
                        return;
                    }
                    var time = $scope.add_changeTime;
                    var params = {
                        "beginTime": time.beginTime,
                        "endTime": time.endTime,
                        "duration": $scope.add_changeMins
                    };
                    if ($scope.operateType == "add") {
                        url = "/api/oa/lesson/presetTime/add";
                    } else {
                        if (!$scope.selectedTime) {
                            return;
                        }
                        url = "/api/oa/lesson/presetTime/update";
                        params["presetTimeId"] = $scope.selectedTime.presetTimeId;
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == 200) {
                                getPresetTimeList();
                                $scope.closePopup('add_preSetTime');
                            }
                        }
                    });
                }
            }

            function deletePreTime() {
                if (!$scope.selectedTime) {
                    return false;
                }
                var isConfirm = layer.confirm('是否删预设时间', {
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
                        "presetTimeId": $scope.selectedTime.presetTimeId
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/lesson/presetTime/delete",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功删除预设时间', {
                                    icon: 1
                                });
                                getPresetTimeList();
                            };
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })

            }

            function confirm_selTime() {
                if (!$scope.selectedTime) {
                    layer.msg("请选择预设时间");
                    return;
                }
                var data = {
                    "beginTime": $scope.selectedTime.beginTime,
                    "endTime": $scope.selectedTime.endTime
                };
                if(props){//快速排课添加排课安排
                    if(SERVICE.TIMEPOP.CLASS['pre_time_sel']) {
                        SERVICE.TIMEPOP.CLASS['pre_time_sel'](data,props.index);
                    } else {
                        $scope.$emit('time_pop', {'data': data, 'index': props.index});
                    }
                }else{
                    if(SERVICE.TIMEPOP.CLASS['pre_time_sel']) {
                        SERVICE.TIMEPOP.CLASS['pre_time_sel'](data);
                    } else {
                        $scope.$emit('time_pop', {'data': data});
                    }
                }
                $scope.closePopup('preSetTime');
            }
            function getPresetTimeList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/presetTime/list",
                    type: "get",
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.presetTimeList = res.context;
                        }
                    }
                });
            }

        }
    })
});