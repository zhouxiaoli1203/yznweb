define(['laydate', 'mySelect', 'staff_sel'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout' ,function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            pagerRender_pop = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        function init() {
            $scope.switchNav = switchNav; //切换一级导航栏
            $scope.firstNav = 1;
            $scope.secondNav = 1;
            $scope.weekList = [1, 2, 3, 4, 5, 6, 7]; //星期列表
            $scope.powerJud = {
                browse: checkAuthMenuById("110"), //浏览权限
                operate: checkAuthMenuById("111"), //操作权限
                operate_: checkAuthMenuById("183") //4.7权限修改整合
                    //              operate: false,
            };

            //公共数据
            $scope.commomData = {
                ksn: {
                    teacherName: '姓名、联系方式、工号',
                    teacherPhone: '联系方式',
                    workId: '工号',
                },
                ksnId: 'teacherName',
                screenData: {
                    stT: '',
                    stN: '',
                    time: yznDateAddWithFormat(new Date(), -1, 'yyyy-MM-dd'),
                },
            };

            //每日统计数据
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

            //月度汇总数据
            $scope.monthlyData = {
                thead: [
                    { 'name': '姓名', 'width': '11%' },
                    { 'name': '迟到次数', 'width': '11%', 'issort': true, 'value': 'tae_late_num' },
                    { 'name': '早退次数', 'width': '11%', 'issort': true, 'value': 'tae_leave_num' },
                    { 'name': '上班缺卡次数', 'width': '11%', 'issort': true, 'value': 'tae_begin_absent_num' },
                    { 'name': '下班缺卡次数', 'width': '11%', 'issort': true, 'value': 'tae_end_absent_num' },
                    { 'name': '旷工次数', 'width': '11%', 'issort': true, 'value': 'tae_absent_num' },
                    { 'name': '事假次数', 'width': '11%', 'issort': true, 'value': 'tae_private_leave_num' },
                    { 'name': '病假次数', 'width': '11%', 'issort': true, 'value': 'tae_ill_leave_num' },
                    { 'name': '调休次数', 'width': '11%', 'issort': true, 'value': 'tae_abjust_leave_num' },
                ],
                screenData: { //筛选数据
                    time: $.format.date(new Date(), 'yyyy-MM'),
                    fullTime: undefined,
                    orderName: '',
                    orderType: '',
                },
                signInData: { //列表点击签到信息
                    state: null,
                },
                leaveData: { //列表点击请假

                }
            };

            //考勤记录数据
            $scope.recordData = {
                screenData: {
                    time: '',
                }
            };

            //请假记录数据
            $scope.leaveData = {
                screenData: { //筛选数据
                    leaveType: [
                        { 'name': '事假', 'value': 0 },
                        { 'name': '病假', 'value': 1 },
                        { 'name': '调休', 'value': 2 },
                    ],
                    leaveName: undefined,
                },
            };
            $scope.closePopup = function() { layer.close(dialog) };

            //每日统计选择时间
            (function() {
                laydate.render({
                    elem: '#attend_1',
                    btns: ['confirm'],
                    max: yznDateAddWithFormat(new Date(), -1, 'yyyy-MM-dd'),
                    done: function(value) {
                        $scope.commomData.screenData.time = value;
                        pagerRender = false;
                        if ($scope.firstNav == 1) {
                            switch ($scope.secondNav) {
                                case 1:
                                    $scope.dailyFun.getList(0);
                                    break;
                                case 2:

                                    break;
                                case 3:

                                    break;
                            }
                        } else {

                        }
                    }
                });
                laydate.render({
                    elem: '#attend_2',
                    type: 'month',
                    btns: ['confirm'],
                    max: $.format.date(new Date(), 'yyyy-MM'),
                    done: function(value) {
                        $scope.monthlyData.screenData.time = value;
                        pagerRender = false;
                        $scope.monthlyFun.getList(0);
                    }
                });
                laydate.render({
                    elem: '#attend_3',
                    range: '到',
                    isRange: true,
                    max: $.format.date(new Date(), 'yyyy-MM-dd'),
                    btns: ['confirm'],
                    done: function(value) {
                        $scope.recordData.screenData.time = value;
                        pagerRender = false;
                        $scope.recordFun.getList(0);
                    }
                });
            })();
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.firstNav = $scope.$stateParams.screenValue.tab;
                    $timeout(function () {
                        switchNav(1, $scope.firstNav);
                    })
                }
            }
            $scope.dailyFun.getList(0);
            $scope.dailyFun.getUnfenzuList(0);
        };

        //选择考勤组员工监听回调
        $scope.$on('attend', function(d, _da) {
            $scope.dailyData.newAddSet.peoList = _da;
        })

        //模块公共方法
        $scope.commomFun = {
            operateScreen: function(type, _da) { //筛选项操作
                switch (type) {
                    case 1: //搜索项
                        $scope.commomData.screenData.stT = _da.type;
                        $scope.commomData.screenData.stN = _da.value;
                        break;
                    case 2: //重置
                        for (var i in $scope.screen_goReset) {
                            $scope.screen_goReset[i]();
                        }
                        $scope.commomData.screenData.time = yznDateAddWithFormat(new Date(), -1, 'yyyy-MM-dd');
                        $scope.monthlyData.screenData.time = $.format.date(new Date(), 'yyyy-MM');
                        $scope.recordData.screenData.time = undefined;
                        $scope.commomData.screenData.stT = '';
                        $scope.commomData.screenData.stN = '';
                        $scope.dailyData.screenData.fullTime = undefined;
                        $scope.monthlyData.screenData.fullTime = undefined;
                        $scope.leaveData.screenData.leaveName = undefined;
                        $scope.kindSearchOnreset(); //调取app重置方法
                        break;
                };

                pagerRender = false;
                //判断调什么接口
                switch ($scope.firstNav) {
                    case 1: //一级导航栏切换
                        switch ($scope.secondNav) {
                            case 1: //每月统计
                                $scope.dailyFun.getList(0);
                                break;
                            case 2: //月度汇总
                                $scope.monthlyFun.getList(0);
                                break;
                            case 3: //考勤记录
                                $scope.recordFun.getList(0);
                                break;
                        };
                        break;
                    case 2: //二级导航栏切换
                        $scope.leaveFun.getList(0);
                        break;
                }
            },
        }

        //每日统计方法
        $scope.dailyFun = {
            getList: function(start) {
                console.log('每日统计数据');
                $.hello({
                    url: CONFIG.URL + "/api/oa/attendance/teacherAttendanceEveryday/list",
                    type: "get",
                    data: {
                        'start': start,
                        'count': eachPage,
                        'teacherType': $scope.dailyData.screenData.fullTime,
                        'dateType': 0,
                        'searchDate': $scope.commomData.screenData.time,
                        'searchType': $scope.commomData.screenData.stN ? 'appSearchName' : undefined,
                        'searchName': $scope.commomData.screenData.stN ? $scope.commomData.screenData.stN : undefined,
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.listData = data.context.items;
                            renderPager(data.context.totalNum);
                            $scope.totalNum = data.context.totalNum;
                        }
                    }
                })
            },
            //员工考勤详情
            getListDetail: function(start) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/attendance/teacherAttendanceEveryday/list",
                    type: "get",
                    data: {
                        'start': start,
                        'count': eachPage,
                        'shopTeacherId': $scope.dailyData.peoInfo.teacherId,
                        'workType': $scope.dailyData.peoInfo.state,
                        'dateType': 1,
                        'searchDate': $scope.dailyData.peoInfo.detailTime,
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.dailyData.peoInfo.listData = data.context.items;
                            $scope.dailyData.peoInfo.allChecked = false;
                            repeatLists($scope.dailyData.peoInfo.listData, $scope.dailyData.peoInfo.checkedData, 'teacherAttendanceEverydayId');
                            renderPager_pop(data.context.totalNum, 'detatil');
                            $scope.totalNum_pop = data.context.totalNum;
                        }
                    }
                });
            },
            getUnfenzuList: function(start) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/attendance/attendanceRules/teacherList",
                    type: "get",
                    data: {
                        'start': start,
                        'count': eachPage,
                        'teacherAttendanceType': "0"
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            angular.forEach(data.context.items, function(v) {
                                v.quarterStr = arrToStr(v.shopTeacher.quarters, "quartersName");
                            });
                            $scope.unFenzuList = data.context.items;
                            renderPager_pop(data.context.totalNum, 'unFenzu');
                            $scope.totalNum_pop = data.context.totalNum;
                        }
                    }
                });
            },
            operateScreen: function(type, _da) { //筛选项操作
                switch (type) {
                    case 1: //全职
                        $scope.dailyData.screenData.fullTime = _da.target.checked ? 1 : undefined;
                        break;
                    case 2: //兼职
                        $scope.dailyData.screenData.fullTime = _da.target.checked ? 0 : undefined;
                        break;
                };
                pagerRender = false;
                $scope.dailyFun.getList(0);
            },
            operateBtn: function(type, sp) { //按钮操作
                switch (type) {
                    // case 1: //员工假期
                    //     $.hello({
                    //         url: CONFIG.URL + "/api/oa/attendance/shopTeacherHoliday/list",
                    //         type: "get",
                    //         success: function(res) {
                    //             if (res.status == 200) {
                    //                 $scope.peoVacationList = res.context;
                    //             }
                    //         }
                    //     });
                    //     if (!sp) openPopByDiv('员工假期', '.daily_vacation', '960px');
                    //     break;
                    // case 2: //考勤设置
                    //     $.hello({
                    //         url: CONFIG.URL + "/api/oa/attendance/attendanceRules/list",
                    //         type: "get",
                    //         success: function(res) {
                    //             if (res.status == 200) {
                    //                 $scope.dailySetList = res.context;
                    //                 manualOnresize();
                    //             }
                    //         }
                    //     });
                    //     if (!sp) openPopByDiv('考勤设置', '.daily_set', '960px');
                    //     break;
                    // case 3: //新增员工假期
                    //     $scope.dailyData.newAddVacation = {
                    //         id: '',
                    //         name: '',
                    //         time: '',
                    //         dec: '',
                    //     };
                    //     openPopByDiv('新增员工假期', '.daily_vacation_add', '560px', function() {
                    //         laydate.render({
                    //             elem: '#daily_detail_3',
                    //             range: '到',
                    //             isRange: true,
                    //             btns: ['confirm'],
                    //             done: function(value) {
                    //                 $scope.dailyData.newAddVacation.time = value;
                    //             }
                    //         });
                    //     });
                    //     break;
                    // case 4: //新增考勤组
                    //     $scope.dailyData.newAddSet = {
                    //         id: '',
                    //         name: '',
                    //         type: 0,
                    //         days: {},
                    //         time_1: '',
                    //         time_2: '',
                    //         peoList: [],
                    //     };
                    //     openPopByDiv('新增考勤组', '.daily_set_add', '760px', function() {
                    //         laydate.render({
                    //             elem: '#daily_detail_4',
                    //             type: 'time',
                    //             btns: ['confirm'],
                    //             done: function(value) {
                    //                 $scope.dailyData.newAddSet.time_1 = value;
                    //             }
                    //         });
                    //         laydate.render({
                    //             elem: '#daily_detail_5',
                    //             type: 'time',
                    //             btns: ['confirm'],
                    //             done: function(value) {
                    //                 $scope.dailyData.newAddSet.time_2 = value;
                    //             }
                    //         });
                    //     });
                    //     break;
                    case 5: //点击批量变更上班安排
                        if ($scope.dailyData.peoInfo.checkedData.length > 0) {
                            openPopByDiv('变更', '.daily_change_time', '560px', function() {
                                laydate.render({
                                    elem: '#daily_detail_6',
                                    type: 'time',
                                    btns: ['confirm'],
                                    done: function(value) {
                                        $scope.dailyData.changeTime.time_1 = value;
                                    }
                                });
                                laydate.render({
                                    elem: '#daily_detail_7',
                                    type: 'time',
                                    btns: ['confirm'],
                                    done: function(value) {
                                        $scope.dailyData.changeTime.time_2 = value;
                                    }
                                });
                            });
                        } else {
                            layer.msg('请先选择需要变更的考勤日期');
                        }
                        break;
                    case 6:
                        pagerRender_pop = false;
                        $scope.dailyFun.getUnfenzuList(0);
                        openPopByDiv('未分组', '.un_fenzu', '760px');
                        break;
                }
            },
            operateList: function(type, _da, _sp) { //列表操作
                switch (type) {
                    case 1: //点击查看员工详情
                        $scope.dailyData.peoInfo['allChecked'] = false;
                        $scope.dailyData.peoInfo['checkedData'] = [];
                        $scope.dailyData.peoInfo.teacherId = _da.shopTeacherId;
                        if ($scope.secondNav == 1) { //每日考勤
                            $scope.dailyData.peoInfo.state = undefined;
                            $scope.dailyData.peoInfo.detailTime = $.format.date($scope.commomData.screenData.time, 'yyyy-MM');
                        } else { //月度汇总
                            $scope.dailyData.peoInfo.state = $scope.monthlyData.signInData.state;
                            $scope.dailyData.peoInfo.detailTime = $scope.monthlyData.screenData.time;
                        };
                        pagerRender_pop = false;
                        $scope.dailyFun.getListDetail(0);
                        openPopByDiv(_da.teacherName, '.daily_detail', '960px', function() {
                            $scope.$broadcast('daily_detail_state', 'clearHeadName');
                            laydate.render({
                                elem: '#daily_detail_1',
                                type: 'month',
                                btns: ['confirm'],
                                max: $.format.date(new Date(), 'yyyy-MM'),
                                done: function(value) {
                                    $scope.dailyData.peoInfo.detailTime = $.format.date(value, 'yyyy-MM');
                                    pagerRender_pop = false;
                                    $scope.dailyFun.getListDetail(0);
                                }
                            });
                        });
                        break;
                    case 2: //点击选择员工某次的考勤
                        var index_ = [false, null];
                        if (_da.hasChecked) {
                            _da.hasChecked = false;
                            angular.forEach($scope.dailyData.peoInfo.checkedData, function(val, ind) {
                                if (_da.teacherAttendanceEverydayId == val.teacherAttendanceEverydayId) {
                                    index_ = [true, ind];
                                }
                            });
                            if (index_[0]) {
                                $scope.dailyData.peoInfo.checkedData.splice(index_[1], 1);
                            }
                        } else {
                            _da.hasChecked = true;
                            $scope.dailyData.peoInfo.checkedData.push(_da);
                        };
                        break;
                    case 3: //点击全选员工某页的考勤
                        var i_ = [false, null];
                        if (!$scope.dailyData.peoInfo.allChecked) {
                            $scope.dailyData.peoInfo.allChecked = true;
                            angular.forEach($scope.dailyData.peoInfo.listData, function(val_1) {
                                if (!val_1.hasChecked) {
                                    val_1.hasChecked = true;
                                    $scope.dailyData.peoInfo.checkedData.push(val_1);
                                }
                            });
                        } else {
                            $scope.dailyData.peoInfo.allChecked = false;
                            angular.forEach($scope.dailyData.peoInfo.listData, function(val_1) {
                                val_1.hasChecked = false;
                                i_ = [false, null];
                                angular.forEach($scope.dailyData.peoInfo.checkedData, function(val_2, ind_2) {
                                    if (val_1.id == val_2.id) {
                                        i_ = [true, ind_2];
                                    }
                                });
                                if (i_[0]) {
                                    $scope.dailyData.peoInfo.checkedData.splice(i_[1], 1);
                                }
                            });
                        }
                        break;
                    case 4: //员工详情状态筛选
                        $scope.dailyData.peoInfo.state = _da ? _da.value : undefined;
                        pagerRender_pop = false;
                        $scope.dailyFun.getListDetail(0);
                        break;
                    case 5: //点击打卡结果详情
                        $.hello({
                            url: CONFIG.URL + "/api/oa/attendance/teacherAttendanceEveryday/info",
                            type: "get",
                            data: {
                                'teacherAttendanceEverydayId': _da.teacherAttendanceEverydayId,
                            },
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.dailyData.lateInfo = res.context;
                                    if (!_sp) openPopByDiv(_da.teacherName, '.daily_late', '560px');
                                }
                            }
                        });
                        break;
                    case 6: //点击删除打卡记录
                        if (!$scope.powerJud.operate) return layer.msg('权限不足');
                        var isDelect = layer.confirm('确定删除该条信息？', {
                            title: "确认信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['确定', '取消'] //按钮
                        }, function() {
                            $.hello({
                                url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/delete",
                                type: "post",
                                data: JSON.stringify({
                                    'id': _da.id,
                                }),
                                success: function(res) {
                                    if (res.status == 200) {
                                        layer.msg('操作成功');
                                        $scope.dailyFun.operateList(5, $scope.dailyData.lateInfo, true);
                                        $scope.dailyFun.getList(start);
                                        layer.close(isDelect);
                                    };
                                }
                            })
                        }, function() {
                            layer.close(isDelect);
                        })
                        break;
                    case 7: //点击新增打卡记录弹框
                        if (!$scope.powerJud.operate) return layer.msg('权限不足');
                        openPopByDiv('新增打卡记录', '.daily_push_time', '560px', function() {
                            laydate.render({
                                elem: '#daily_detail_2',
                                type: 'time',
                                done: function(value) {
                                    $scope.dailyData.pushTime = $.format.date($scope.dailyData.lateInfo.date, 'yyyy-MM-dd') + ' ' + value;
                                }
                            });
                        });
                        break;
                    case 8: //确定新增打卡记录
                        $.hello({
                            url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/add",
                            type: "post",
                            data: JSON.stringify({
                                'shopTeacherIdList': [$scope.dailyData.lateInfo.shopTeacherId],
                                'signTime': $scope.dailyData.pushTime,
                            }),
                            success: function(res) {
                                if (res.status == 200) {
                                    layer.msg('操作成功');
                                    layer.close(dialog);
                                    $scope.dailyFun.operateList(5, $scope.dailyData.lateInfo, true);
                                    $scope.dailyFun.getList(start);
                                };
                            }
                        });
                        break;
                    case 9: //编辑员工假期
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
                                value: $.format.date(_da.holidayBeginTime, 'yyyy-MM-dd') + '到' + $.format.date(_da.holidayEndTime, 'yyyy-MM-dd'),
                                btns: ['confirm'],
                                done: function(value) {
                                    $scope.dailyData.newAddVacation.time = value;
                                }
                            });
                        });
                        break;
                    case 10: //删除员工假期
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
                                        $scope.dailyFun.operateBtn(1, true);
                                    };
                                }
                            });
                        }, function() {
                            layer.close(isDelect);
                        })
                        break;
                        // case 11: //确定修改员工假期
                        //     var url_ = '/api/oa/attendance/shopTeacherHoliday/add';
                        //     if ($scope.dailyData.newAddVacation.id) {
                        //         url_ = '/api/oa/attendance/shopTeacherHoliday/update';
                        //     };
                        //     $.hello({
                        //         url: CONFIG.URL + url_,
                        //         type: "post",
                        //         data: JSON.stringify({
                        //             'shopTeacherHolidayId': $scope.dailyData.newAddVacation.id ? $scope.dailyData.newAddVacation.id : undefined,
                        //             'holidayName': $scope.dailyData.newAddVacation.name,
                        //             'holidayBeginTime': $scope.dailyData.newAddVacation.time.split(' 到 ')[0],
                        //             'holidayEndTime': $scope.dailyData.newAddVacation.time.split(' 到 ')[1],
                        //             'holidayDesc': $scope.dailyData.newAddVacation.dec,
                        //         }),
                        //         success: function(res) {
                        //             if (res.status == 200) {
                        //                 layer.msg('操作成功');
                        //                 layer.close(dialog);
                        //                 $scope.dailyFun.operateBtn(1, true);
                        //             };
                        //         }
                        //     });
                        //     break;
                        // case 12: //编辑考勤组needdel__cz
                        //     $.hello({
                        //         url: CONFIG.URL + '/api/oa/attendance/attendanceRules/info',
                        //         type: "get",
                        //         data: {
                        //             'attendanceRulesId': _da.attendanceRulesId,
                        //         },
                        //         success: function(res) {
                        //             if (res.status == 200) {
                        //                 var res = res.context;
                        //                 $scope.dailyData.newAddSet = {
                        //                     id: res.attendanceRulesId,
                        //                     name: res.name,
                        //                     type: res.type,
                        //                     days: {},
                        //                     time_1: res.beginTime ? res.beginTime : '',
                        //                     time_2: res.endTime ? res.endTime : '',
                        //                     peoList: res.teacherAttendanceRS,
                        //                 };
                        //                 angular.forEach(res.weeks, function(v1) {
                        //                     switch (v1) {
                        //                         case '一':
                        //                             $scope.dailyData.newAddSet.days[1] = true;
                        //                             break;
                        //                         case '二':
                        //                             $scope.dailyData.newAddSet.days[2] = true;
                        //                             break;
                        //                         case '三':
                        //                             $scope.dailyData.newAddSet.days[3] = true;
                        //                             break;
                        //                         case '四':
                        //                             $scope.dailyData.newAddSet.days[4] = true;
                        //                             break;
                        //                         case '五':
                        //                             $scope.dailyData.newAddSet.days[5] = true;
                        //                             break;
                        //                         case '六':
                        //                             $scope.dailyData.newAddSet.days[6] = true;
                        //                             break;
                        //                         case '日':
                        //                             $scope.dailyData.newAddSet.days[7] = true;
                        //                             break;
                        //                     }
                        //                 });
                        //                 openPopByDiv('编辑考勤组', '.daily_set_add', '760px', function() {
                        //                     laydate.render({
                        //                         elem: '#daily_detail_4',
                        //                         type: 'time',
                        //                         btns: ['confirm'],
                        //                         done: function(value) {
                        //                             $scope.dailyData.newAddSet.time_1 = value;
                        //                         }
                        //                     });
                        //                     laydate.render({
                        //                         elem: '#daily_detail_5',
                        //                         type: 'time',
                        //                         btns: ['confirm'],
                        //                         done: function(value) {
                        //                             $scope.dailyData.newAddSet.time_2 = value;
                        //                         }
                        //                     });
                        //                 });
                        //             };
                        //         }
                        //     });
                        //     break;
                        // case 13: //确定修改考勤组
                        //     {
                        //         var submit_params = function() {
                        //             $.hello({
                        //                 url: CONFIG.URL + url_,
                        //                 type: "post",
                        //                 data: JSON.stringify({
                        //                     'attendanceRulesId': $scope.dailyData.newAddSet.id,
                        //                     'name': $scope.dailyData.newAddSet.name,
                        //                     'type': $scope.dailyData.newAddSet.type,
                        //                     'weeks': $scope.dailyData.newAddSet.type == 0 ? weeks.join(',') : undefined,
                        //                     'beginTime': $scope.dailyData.newAddSet.type == 0 ? $scope.dailyData.newAddSet.time_1 : undefined,
                        //                     'endTime': $scope.dailyData.newAddSet.type == 0 ? $scope.dailyData.newAddSet.time_2 : undefined,
                        //                     'shopTeacherList': shopTeacherList,
                        //                 }),
                        //                 success: function(res) {
                        //                     if (res.status == 200) {
                        //                         layer.msg('操作成功');
                        //                         layer.close(dialog);
                        //                         $scope.dailyFun.getUnfenzuList(0);
                        //                         $scope.dailyFun.operateBtn(2, true);
                        //                     };
                        //                 }
                        //             });
                        //         };
                        //         var url_ = '/api/oa/attendance/attendanceRules/add',
                        //             weeks = [],
                        //             shopTeacherList = [];
                        //         for (var i in $scope.dailyData.newAddSet.days) {
                        //             if ($scope.dailyData.newAddSet.days[i]) {
                        //                 if (i == 7) {
                        //                     weeks.push('日');
                        //                 } else {
                        //                     weeks.push(changeToChinese(i));
                        //                 };
                        //             };
                        //         };
                        //         //选择员工
                        //         angular.forEach($scope.dailyData.newAddSet.peoList, function(v1) {
                        //             shopTeacherList.push({ 'shopTeacherId': v1.shopTeacher.shopTeacherId });
                        //         });

                        //         if ($scope.dailyData.newAddSet.type == 0) {
                        //             if (!$scope.dailyData.newAddSet.time_1) return layer.msg('请选择上班时间');
                        //             if (!$scope.dailyData.newAddSet.time_2) return layer.msg('请选择下班时间');
                        //         };
                        //         if ($scope.dailyData.newAddSet.id) { //如果是修改
                        //             url_ = '/api/oa/attendance/attendanceRules/update';
                        //             var isDelect = layer.confirm('是否立即生效？确定后今日考勤结果将按新规则重新计算。', {
                        //                 title: "确认信息",
                        //                 skin: 'newlayerui layeruiCenter',
                        //                 closeBtn: 1,
                        //                 offset: '30px',
                        //                 move: false,
                        //                 area: '560px',
                        //                 btn: ['是', '否'] //按钮
                        //             }, function() {
                        //                 submit_params();
                        //             }, function() {
                        //                 layer.close(isDelect);
                        //             })
                        //         } else {
                        //             submit_params();
                        //         };

                        //     }
                        //     break;
                        // case 14: //选择考勤员工-打开筛选器
                        //     $scope.$broadcast('staffSel_popup', 'choseStaff', '760px', { 'callBackName': 'attend', 'attendanceRulesId': $scope.dailyData.newAddSet.id, items: $scope.dailyData.newAddSet.peoList });
                        //     break;
                        // case 15: //删除考勤组员工选择
                        //     $scope.dailyData.newAddSet.peoList.splice(_da, 1);
                        //     break;
                    case 16: //批量变更打卡时间确定
                        var arr_ = [];
                        angular.forEach($scope.dailyData.peoInfo.checkedData, function(val_1) {
                            arr_.push({ 'teacherAttendanceEverydayId': val_1.teacherAttendanceEverydayId });
                        });
                        $.hello({
                            url: CONFIG.URL + '/api/oa/attendance/teacherAttendanceEveryday/update',
                            type: "post",
                            data: JSON.stringify({
                                'type': $scope.dailyData.changeTime.type,
                                'beginTime': $scope.dailyData.changeTime.time_1,
                                'endTime': $scope.dailyData.changeTime.time_2,
                                'teacherAttendanceEverydayList': arr_,
                            }),
                            success: function(res) {
                                if (res.status == 200) {
                                    layer.close(dialog);
                                    pagerRender_pop = false;
                                    $scope.dailyFun.getListDetail(0);
                                    $scope.dailyFun.getList(start);
                                };
                            }
                        });
                        break;
                    case 17: //安排考勤组
                        $scope.attendanceRulesId = "";
                        $scope.teacherInfo = _da;
                        $.hello({
                            url: CONFIG.URL + "/api/oa/attendance/attendanceRules/list",
                            type: "get",
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.attendanceRulesList = res.context;
                                }
                            }
                        });
                        openPopByDiv('安排考勤组' + '<span class="color_nameState">(' + _da.shopTeacher.teacherName + ')</span>', '.fenpei', '560px');
                        break;
                    case 18: //确定安排考勤组
                        $.hello({
                            url: CONFIG.URL + "/api/oa/attendance/teacherAttendanceR/add",
                            type: "post",
                            data: JSON.stringify({
                                attendanceRulesId: $scope.attendanceRulesId,
                                shopTeacherId: $scope.teacherInfo.shopTeacher.shopTeacherId,
                            }),
                            success: function(res) {
                                if (res.status == 200) {
                                    pagerRender_pop = false;
                                    $scope.dailyFun.getUnfenzuList(0);
                                    $scope.dailyFun.getList(start);
                                    layer.close(dialog);
                                }
                            }
                        });
                        break;
                }
            },

        };

        //月度汇总方法
        $scope.monthlyFun = {
            getList: function(start) {
                console.log('月度汇总数据');
                $.hello({
                    url: CONFIG.URL + "/api/oa/attendance/teacherAttendanceEveryday/monthDateList",
                    type: "get",
                    data: {
                        'start': start,
                        'count': eachPage,
                        'teacherType': $scope.monthlyData.screenData.fullTime,
                        'searchDate': $scope.monthlyData.screenData.time,
                        'searchType': $scope.commomData.screenData.stN ? 'appSearchName' : undefined,
                        'searchName': $scope.commomData.screenData.stN ? $scope.commomData.screenData.stN : undefined,
                        'orderName': $scope.monthlyData.screenData.orderName ? $scope.monthlyData.screenData.orderName : undefined,
                        'orderTyp': $scope.monthlyData.screenData.orderType ? $scope.monthlyData.screenData.orderType : undefined,
                    },
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.listData = data.context.items;
                            renderPager(data.context.totalNum);
                            $scope.totalNum = data.context.totalNum;
                        }
                    }
                })
            },
            operateScreen: function(type, _da) { //筛选项操作
                switch (type) {
                    case 1: //全职
                        $scope.monthlyData.screenData.fullTime = _da.target.checked ? 1 : undefined;
                        break;
                    case 2: //兼职
                        $scope.monthlyData.screenData.fullTime = _da.target.checked ? 0 : undefined;
                        break;
                    case 3: //列表排序筛选
                        $scope.monthlyData.screenData.orderName = _da.value;
                        $scope.monthlyData.screenData.orderType = _da.sort;
                        pagerRender = false;
                        $scope.monthlyFun.getList(0);
                        break;
                };

                pagerRender = false;
                $scope.monthlyFun.getList(0);
            },
            operateList: function(type, _da, sp) {
                switch (type) {
                    case 1: //点击列表调出学员签到详情
                        $scope.monthlyData.signInData.state = sp;
                        $scope.dailyFun.operateList(1, _da);
                        break;
                    case 2: //点击列表调出学员请假详情
                        $.hello({
                            url: CONFIG.URL + '/api/oa/attendance/teacherLeave/list',
                            type: "get",
                            data: {
                                'searchDate': $scope.monthlyData.screenData.time,
                                'leaveType': sp,
                                'shopTeacherId': _da.shopTeacherId,
                            },
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.leave_reasonList = res.context;
                                };
                            }
                        });
                        openPopByDiv(_da.teacherName, '.monthly_leave', '860px');
                        break;
                }
            }

        };

        //考勤记录方法
        $scope.recordFun = {
            listParams: function() {
                var params = {
                    start: start.toString(),
                    count: eachPage,
                    searchType: $scope.commomData.screenData.stN ? 'appSearchName' : undefined,
                    searchName: $scope.commomData.screenData.stN ? $scope.commomData.screenData.stN : undefined,
                };
                if ($scope.recordData.screenData.time) {
                    params["beginTime"] = $scope.recordData.screenData.time.split(" 到 ")[0] + " 00:00:00";
                    params["endTime"] = $scope.recordData.screenData.time.split(" 到 ")[1] + " 23:59:59";
                }
                return params;
            },

            getList: function(start) {
                console.log('考勤记录数据');
                var params = $scope.recordFun.listParams();
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/list",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.listData = data.context.items;
                            renderPager(data.context.totalNum);
                            $scope.totalNum = data.context.totalNum;
                        }
                    }

                })
            },
            getTeacherList: function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data: {
                        "pageType": "0",
                        "shopTeacherStatus": "1"
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.teachersList = data.context;
                        }
                    }
                })
            },
            operateBtn: function(type) {
                switch (type) {
                    case 1: //新增记录
                        $scope.recordData.newAddRecord = {
                            teachers: [],
                            signTime: '',
                        };
                        $scope.recordFun.getTeacherList();
                        openPopByDiv("新增记录", ".newRecord_pop", "560px", function() {
                            $scope.$broadcast("_addTeacher", "clearSatus");
                            laydate.render({
                                elem: "#attend_record_1",
                                isRange: false,
                                type: "datetime",
                                max: yznDateFormatYMdHms(new Date()),
                                trigger: 'click',
                                done: function(value) {
                                    $scope.recordData.newAddRecord.signTime = value;
                                }
                            });
                        });
                        break;
                    case 2: {
                        //导出考勤记录
                        var token = localStorage.getItem('oa_token');
                        var params = $scope.recordFun.listParams();
                        params.token = token;
                        params.start = undefined;
                        params.count = undefined;
                        for (var i in params) {
                            if (params[i] == '' || params[i] == undefined) {
                                delete params[i];
                            }
                        }

                        window.open(CONFIG.URL + '/api/oa/statistics/exportListSignTeacher?' + $.param(params));
                        break;
                    }
                };
            },
            operateList: function(type, _da, sp) {
                switch (type) {
                    case 1: //删除记录
                        if (!$scope.powerJud.operate) return layer.msg('权限不足');
                        detailMsk("确认删除该条记录？", function() {
                            $.hello({
                                url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/delete",
                                type: "post",
                                data: JSON.stringify({
                                    id: _da.id
                                }),
                                success: function(data) {
                                    if (data.status == '200') {
                                        pagerRender = false;
                                        $scope.recordFun.getList(0);
                                    }
                                }
                            })
                        });
                        break;
                    case 2: //点击删除选中的老师
                        _da.hasSelected = false;
                        $scope.recordData.newAddRecord.teachers.splice(sp, 1);
                        break;
                    case 3: //点击选择打卡员工
                        var judHas = true;
                        var judHasIndex = null;
                        angular.forEach($scope.recordData.newAddRecord.teachers, function(val, index) {
                            if (val.teacherId == _da.teacherId) {
                                judHas = false;
                                judHasIndex = index;
                            }
                        });
                        if (judHas) {
                            $scope.recordData.newAddRecord.teachers.push(_da);
                            _da.hasSelected = true;
                        } else {
                            $scope.recordData.newAddRecord.teachers.splice(judHasIndex, 1);
                            _da.hasSelected = false;
                        }
                        break;
                }
            },
            submit_params: function(type) {
                switch (type) {
                    case 1: //点击提交新增打卡记录
                        var arr = [];
                        if ($scope.recordData.newAddRecord.teachers.length > 0) {
                            angular.forEach($scope.recordData.newAddRecord.teachers, function(v) {
                                arr.push(v.shopTeacherId);
                            });
                        } else {
                            return layer.msg("请选择员工");
                        }
                        var param = {
                            shopTeacherIdList: arr,
                            signTime: $scope.recordData.newAddRecord.signTime,
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/shopTeacher/signTeacher/add",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.close(dialog);
                                    pagerRender = false;
                                    $scope.recordFun.getList(0);
                                }

                            }
                        })
                        break;
                }
            }
        };

        //请假记录方法
        $scope.leaveFun = {
            getList: function(start) {
                console.log('请假记录数据');
                var params = {
                    start: start.toString(),
                    count: eachPage,
                    searchType: $scope.commomData.screenData.stN ? 'appSearchName' : undefined,
                    searchName: $scope.commomData.screenData.stN ? $scope.commomData.screenData.stN : undefined,
                    teacherLeaveType: $scope.leaveData.screenData.leaveName,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/teacherLeave/list",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.listData = data.context.items;
                            renderPager(data.context.totalNum);
                            $scope.totalNum = data.context.totalNum;
                        }
                    }

                })
            },
            operateScreen: function(type, _da) {
                switch (type) {
                    case 1: //请假类型筛选
                        $scope.leaveData.screenData.leaveName = _da ? _da.value : undefined;
                        break;
                };

                pagerRender = false;
                $scope.leaveFun.getList(0);
            },
            operateBtn: function(type) {
                switch (type) {
                    case 1: //请假
                        $scope.leaveData.msk = {
                            teachers: [],
                            teacherLeaveType: "0",
                            beginDate: "",
                            endDate: "",
                            teacherLeaveDesc: ""
                        };
                        $scope.recordFun.getTeacherList();
                        openPopByDiv("请假", ".newleave_pop", "560px", function() {
                            $scope.$broadcast("_addTeacher", "clearSatus");
                            lay('.newleave_pop .dateIcon').each(function(index) {
                                laydate.render({
                                    elem: this,
                                    isRange: false,
                                    type: "datetime",
                                    trigger: 'click',
                                    done: function(value) {
                                        if (index == 0) {
                                            $scope.leaveData.msk.beginDate = value;
                                        } else {
                                            $scope.leaveData.msk.endDate = value;
                                        }
                                    }
                                });
                            });
                        });
                        break;
                };
            },
            operateList: function(type, _da, sp) {
                switch (type) {
                    case 1: //删除操作
                        if (!$scope.powerJud.operate) return layer.msg('权限不足');
                        detailMsk("确认删除该条记录？", function() {
                            $.hello({
                                url: CONFIG.URL + "/api/oa/teacherLeave/delete",
                                type: "post",
                                data: JSON.stringify({
                                    teacherLeaveId: _da.teacherLeaveId
                                }),
                                success: function(data) {
                                    if (data.status == '200') {
                                        pagerRender = false;
                                        $scope.leaveFun.getList(0);
                                    }

                                }
                            })
                        });
                        break;
                    case 2: //点击删除选中的请假员工
                        _da.hasSelected = false;
                        $scope.leaveData.msk.teachers.splice(sp, 1);
                        break;
                    case 3: //点击选择请假员工
                        var judHas = true;
                        var judHasIndex = null;
                        angular.forEach($scope.leaveData.msk.teachers, function(val, index) {
                            if (val.teacherId == _da.teacherId) {
                                judHas = false;
                                judHasIndex = index;
                            }
                        });
                        if (judHas) {
                            $scope.leaveData.msk.teachers.push(_da);
                            _da.hasSelected = true;
                        } else {
                            $scope.leaveData.msk.teachers.splice(judHasIndex, 1);
                            _da.hasSelected = false;
                        }
                        break;
                }
            },
            operateSubmit: function(type) {
                switch (type) {
                    case 1: //请假提交
                        var arr = [];
                        if ($scope.leaveData.msk.teachers.length > 0) {
                            angular.forEach($scope.leaveData.msk.teachers, function(v) {
                                arr.push(v.shopTeacherId);
                            });
                        } else {
                            return layer.msg("请选择员工");
                        }
                        var param = {
                            shopTeacherIdList: arr,
                            teacherLeaveType: $scope.leaveData.msk.teacherLeaveType,
                            teacherLeaveDesc: $scope.leaveData.msk.teacherLeaveDesc,
                            beginDate: $scope.leaveData.msk.beginDate,
                            endDate: $scope.leaveData.msk.endDate
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/teacherLeave/add",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.close(dialog)
                                    pagerRender = false;
                                    $scope.leaveFun.getList(0);
                                }

                            }
                        })
                        break;
                }
            }
        };

        //分页
        function renderPager(total) {
            if (pagerRender)
                return;
            pagerRender = true;
            var $M_box3 = $('.M-box3-list');
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
                    //判断调什么接口
                    switch ($scope.firstNav) {
                        case 1: //一级导航栏切换
                            switch ($scope.secondNav) {
                                case 1: //每月统计
                                    $scope.dailyFun.getList(start);
                                    break;
                                case 2: //月度汇总
                                    $scope.monthlyFun.getList(start);
                                    break;
                                case 3: //考勤记录
                                    $scope.recordFun.getList(start);
                                    break;
                            };
                            break;
                        case 2: //二级导航栏切换
                            $scope.leaveFun.getList(start);
                            break;
                    }
                }
            });
        };

        //分页-弹框
        function renderPager_pop(total, type) {
            if (pagerRender_pop)
                return;
            pagerRender_pop = true;
            var $M_box3 = $('.M-box3-pop');
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
                    switch (type) {
                        case 'detail':
                            $scope.dailyFun.getListDetail(start);
                            break;
                        case 'unFenzu':
                            $scope.dailyFun.getUnfenzuList(start);
                            break;
                        default:
                            break;
                    }

                }
            });
        };

        //切换导航栏
        function switchNav(type, _ind) {
            switch (type) {
                case 1: //一级导航栏切换
                    $scope.firstNav = _ind;
                    break;
                case 2: //二级导航栏切换
                    $scope.secondNav = _ind;
                    break;
            };
            $scope.commomFun.operateScreen(2);
        };
        init(); //数据初始化
    }]
})