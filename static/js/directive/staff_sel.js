//选择员工
define([], function() {
    creatPopup({
        el: 'staffSel',
        openPopupFn: 'staffSel_popup',
        htmlUrl: './templates/popup/staff_sel.html',
        controllerFn: function($scope, props, SERVICE) {
            var pagerRender = false,
                start = 0,
                eachPage = localStorage.getItem('staffSel') ? localStorage.getItem('staffSel') : 10; //页码初始化

            init();

            function init() {
                $scope.searchData = {
                    ksn: {
                        teacherName: '姓名',
                        teacherPhone: '联系电话',
                        workId: '工号',
                    },
                    ksId: 'teacherName',
                };

                $scope.screenData = {
                    workType: undefined,
                    fenzu: undefined,
                    stT: '',
                    stN: '',
                    allChecked: false, //全选
                };
                $scope.screen_charge = screen_charge; //点击筛选
                $scope.operateList = operateList; //列表操作
                $scope.paramsData = props.items ? angular.copy(props.items) : []; //选中的数据
                screen_charge(5);
                getStaffList(0);
            };

            //筛选操作
            function screen_charge(type, evt) {
                console.log(evt);
                switch (type) {
                    case 1:
                        $scope.screenData.workType = evt.target.checked ? 1 : undefined;
                        break;
                    case 2:
                        $scope.screenData.workType = evt.target.checked ? 0 : undefined;
                        break;
                    case 3:
                        $scope.screenData.fenzu = evt.target.checked ? 0 : undefined;
                        break;
                    case 4: //输入框搜索
                        $scope.screenData.stT = evt.type;
                        $scope.screenData.stN = evt.value;
                        break;
                    case 5: //重置
                        $scope.screenData.stT = '';
                        $scope.screenData.stT = '';
                        $scope.screenData.workType = undefined;
                        $scope.screenData.fenzu = undefined;
                        $scope.kindSearchOnreset(); //调取app重置方法
                        break;
                };
                pagerRender = false;
                getStaffList(0);
            };

            //列表操作
            function operateList(type, _da) {
                switch (type) {
                    case 1: //点击全选
                        var i_ = [false, null];
                        if (!$scope.screenData.allChecked) {
                            $scope.screenData.allChecked = true;
                            angular.forEach($scope.staffList, function(val_1) {
                                if (!val_1.hasChecked) {
                                    val_1.hasChecked = true;
                                    $scope.paramsData.push(val_1);
                                }
                            });
                        } else {
                            $scope.screenData.allChecked = false;
                            angular.forEach($scope.staffList, function(val_1) {
                                val_1.hasChecked = false;
                                i_ = [false, null];
                                angular.forEach($scope.paramsData, function(val_2, ind_2) {
                                    if (val_1['shopTeacher']['shopTeacherId'] == val_2['shopTeacher']['shopTeacherId']) {
                                        i_ = [true, ind_2];
                                    }
                                });
                                if (i_[0]) {
                                    $scope.paramsData.splice(i_[1], 1);
                                }
                            });
                        }
                        break;
                    case 2: //点击选择员工
                        var index_ = [false, null];
                        if (_da.hasChecked) {
                            _da.hasChecked = false;
                            angular.forEach($scope.paramsData, function(val, ind) {
                                if (_da['shopTeacher']['shopTeacherId'] == val['shopTeacher']['shopTeacherId']) {
                                    index_ = [true, ind];
                                }
                            });
                            if (index_[0]) {
                                $scope.paramsData.splice(index_[1], 1);
                            }
                        } else {
                            _da.hasChecked = true;
                            $scope.paramsData.push(_da);
                        };
                        break;
                    case 3: //确定选择员工
                        var arr = [];
                        angular.forEach($scope.paramsData, function(val_1) {
                            arr.push({ 'shopTeacherId': val_1.shopTeacher.shopTeacherId });
                        });
                        $.hello({
                            url: CONFIG.URL + "/api/oa/attendance/attendanceRules/listByTeachers",
                            type: "post",
                            data: JSON.stringify({
                                'unAttendanceRulesId': props.attendanceRulesId ? props.attendanceRulesId : undefined,
                                'shopTeacherList': arr,
                            }),
                            success: function(res) {
                                if (res.status == 200) {
                                    var a_ = [];
                                    angular.forEach(res.context, function(val_1) {
                                        a_.push(val_1.shopTeacher.teacherName);
                                    });
                                    if (a_.length > 0) {
                                        detailMsk(a_.join('，') + '已在其他考勤组，是否改为到此考勤组中考勤？', function() {
                                            $scope.$emit(props.callBackName, $scope.paramsData);
                                            $scope.closePopup();
                                        });
                                    } else {
                                        $scope.$emit(props.callBackName, $scope.paramsData);
                                        $scope.closePopup();
                                    }
                                };
                            }
                        })
                        break;
                };
            }

            function getStaffList(start) {
                console.log('ss');
                $.hello({
                    url: CONFIG.URL + "/api/oa/attendance/attendanceRules/teacherList",
                    type: "get",
                    data: {
                        'start': start,
                        'count': eachPage,
                        'teacherType': $scope.screenData.workType,
                        'teacherAttendanceType': $scope.screenData.fenzu,
                        'searchType': $scope.screenData.stT ? $scope.screenData.stT : undefined,
                        'searchName': $scope.screenData.stN ? $scope.screenData.stN : undefined,
                    },
                    success: function(res) {
                        if (res.status == 200) {
                            console.log(res);
                            $scope.staffList = res.context.items;
                            $scope.screenData.allChecked = false;
                            repeatLists($scope.staffList, $scope.paramsData, 'shopTeacher.shopTeacherId');
                            renderPager(res.context.totalNum);
                            $scope.totalNum = res.context.totalNum;
                        }
                    }
                });
            }

            //分页
            function renderPager(total) {
                if (pagerRender)
                    return;
                pagerRender = true;
                var $M_box3 = $('.staffSel');
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
                            localStorage.setItem('staffSel', eachPage);
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        getStaffList(start);
                    }
                });
            }

        }
    });
});