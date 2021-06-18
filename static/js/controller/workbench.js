define(['laydate', 'echarts', 'Circles', 'mySelect', 'countup', 'remarkPop'], function(laydate, echarts, Circles) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var timeFanwei = yznDateAddWithFormat(new Date(), -30, 'yyyy-MM-dd'); //获取今天前30天
        var allMyNav = [ //快捷入口总数据
            { name: '新增潜客', index: '1', sref: 'potial_customer', power: 14 },
            { name: '续费预警', index: '2', sref: 'renew_warning', power: 19 },
            { name: '今日来访', index: '3', sref: 'visiting', power: 5, type: 1 },
            { name: '新生报名', index: '4', sref: 'edu_student', power: 30 },
            { name: '学员请假', index: '5', sref: 'edu_leave', power: 44, type: 1 },
            { name: '快速排课', index: '6', sref: 'edu_schedule', power: 38, tab: 2 },
            { name: '课表管理', index: '7', sref: 'edu_schedule', power: 35 },
            { name: '上课记录', index: '8', sref: 'edu_classAffair', power: 78 },
            { name: '通知管理', index: '9', sref: 'edu_notice', power: 87 },
            { name: '订单管理', index: '10', sref: 'ordermanage', power: 55 },
            { name: '收支明细', index: '11', sref: 'payments', power: 58 },
            //          {name: '潜客登记', index: '12', sref: 'visiting', power: 5, type: 2},
            { name: '试听排课', index: '13', sref: 'listenRecord/list', power: 41 },
            { name: '补课排课', index: '14', sref: 'edu_leave/makeup', power: 46, type: 2 },
            { name: '签到记录', index: '15', sref: 'edu_signIn', power: 101 },
            { name: '预约上课', index: '16', sref: 'edu_aboutClass/record', power: 84, type: 2 },
            { name: '考勤管理', index: '17', sref: 'attend', power: 110 },
            //          {name: '签到码', index: '10', sref: '/api/oa/workbench/getSignWxAcode?shopId=' + window.currentUserInfo.shop.shopId, power: 5},
            //          {name: '更多', index: 'more'},
        ];
        var myNav_show = []; //需要展示的快捷入口
        var myNav_hide = []; //隐藏的快捷入口
        var trendmapDataType = [ //统计图表能够看到的类型
            { name: '新增潜客', type: 0, power: 130 },
            { name: '报课金额', type: 1, power: 131 },
            { name: '消课课时', type: 2, power: 127 },
            { name: '消课金额', type: 3, power: 140 },
            { name: '订单收入', type: 4, power: 137 },
            { name: '收支流水', type: 5, power: 137 },
        ];
        $scope.bainners = [];
        judFaceTime();

        //      var colors = [
        //          ['#D3B6C6', '#4B253A'], ['#FCE6A4', '#EFB917'], ['#BEE3F7', '#45AEEA'], ['#F8F9B6', '#D2D558'], ['#F4BCBF', '#D43A43']
        //      ], circles = [];

        init();

        function init() {
            if (localStorage.getItem('yzn_VERSION_workbench') != CONFIG.VERSION) {
                localStorage.setItem('yzn_VERSION_workbench', CONFIG.VERSION);
                getNersionInfo(CONFIG.VERSION, function(data) {
                    $rootScope.versionDate = $.format.date(data.versionDate, "yyyy年MM月dd日");
                    //                  openPopByDiv('通知', '.openNotice', '960px')
                });
            }
            getBainners(); //获取bainner
            handleNavData(); //处理快捷入口数据
            handleTrendmapData(); //处理统计图入口数据
            $scope.shortcutEntrance = angular.copy(myNav_show);
            $scope.staReload = 1; //获取数据统计的时间段（1：今天 2：本周 3：本月）
            $scope.showEyesJud = 'true'; //小眼睛的展示
            if (localStorage.getItem('showEyes') == 'false') {
                $scope.showEyesJud = 'false';
            };
            $scope.showEyes = showEyes; //点击小眼睛
            $scope.getStatisticsInfos = getStatisticsInfos;
            $scope.clkReload = clkReload; //点击刷新
            $scope.getTrendmapData = getTrendmapData; //点击获取图表数据
            $scope.todo = todo; //点击待处理
            $scope.toSetNav = toSetNav; //设置自定义快捷入口
            $scope.subOrAddMyNav = subOrAddMyNav; //移除或者添加快捷入口
            $scope.setnav_confirm = setnav_confirm; //确定保存设置的快捷共能
            $scope.setnav_close = function() { //关闭自定义设置快捷共能弹窗
                layer.close(dialog);
            };
            $scope.onDropComplete = onDropComplete; //拖拽后执行的方法
            $scope.datacollection_click = datacollection_click; //数据汇总跳转
            $scope.navJump = navJump; //快捷入口跳转
            $scope.singCodeBtn = function() { //点击学员签到二维码
                window.open(CONFIG.URL + '/api/oa/workbench/getSignWxAcode?shopId=' + window.currentUserInfo.shop.shopId);
            };
            //时间控件-销售统计漏斗图
            laydate.render({
                elem: '#sale_funnelplot_time', //指定元素
                isRange: false,
                range: '至',
                value: $.format.date(timeFanwei, 'yyyy-MM-dd') + ' 至 ' + $.format.date(new Date(), 'yyyy-MM-dd'),
                done: function(value) {
                    getFunnelplotData(value);
                }
            });

            getNeedtodoData(); //获取待处理数据
            //判断是否拥有查看数据汇总的权限
            if (checkAuthMenuById(141)) {
                getStatisticsInfos($scope.staReload); //获取数据汇总
                //根据权限判断是否展示数据汇总的跳转
                if (checkAuthMenuById(143)) {
                    $('.workbench_datacollection_lis_1 em').css({ 'cursor': 'pointer' });
                };
                if (checkAuthMenuById(144)) {
                    $('.workbench_datacollection_lis_2 em').css({ 'cursor': 'pointer' });
                };
                if (checkAuthMenuById(145)) {
                    $('.workbench_datacollection_lis_3 em').css({ 'cursor': 'pointer' });
                };
                if (checkAuthMenuById(142)) {
                    $('.workbench_datacollection_lis_4 em').css({ 'cursor': 'pointer' });
                };
            } else {
                $('.workbench_tp3_lf_con .nodata_show').show();
            };

            //判断是否拥有数据漏斗图查看权限
            $scope.Lists = [
                { name: "销售漏斗图", status: "0", isshow: checkAuthMenuById(130) },
                { name: "教务板块", status: "1", isshow: checkAuthMenuById(129) },
            ];
            $scope.isfunnel = checkAuthMenuById(130) ? true : false;
            $scope.currentlist = checkAuthMenuById(130) ? $scope.Lists[0] : $scope.Lists[1];
            getFunnelplotData();
            if (!checkAuthMenuById(129) && !checkAuthMenuById(130)) {
                $('.workbench_tp2_rg .nodata_show').show();
            }

            $scope.clickBannner = function(index) {
                _czc.push(["_trackPageview", "/banner_" + (index + 1)]);
            }
        };


        //      for (var i = 1; i <= 4; i++) {
        //          var child = $('#circles-' + i),
        //              percentage = child.attr("value");
        //          circles.push(Circles.create({
        //              id:         child[0].id,
        //              value:      percentage,
        //              radius:     60,
        //              width:      10,
        //              colors:     colors[i - 1]
        //          }));
        //      }

        function getBainners() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/extension/list',
                type: "get",
                data: { 'type': 0, extensionType: '0' },
                success: function(res) {
                    if (res.status == "200") {
                        console.log(res);
                        $scope.bainners = res.context;
                    }
                }
            })
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
        //判断人脸识别系统是否到期
        function judFaceTime() {
            $scope.faceTimeData = {
                show: false,
                content: '',
                jump: function() {
                    $state.go('setManageSys');
                },
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/device/getBillNotifications",
                type: "get",
                data: {},
                success: function(data) {
                    if (data.status == 200) {
                        $scope.faceTimeData.show = true;
                        $scope.faceTimeData.content = data.context;
                    } else if (data.status == 206) {

                    }
                }
            });
        };

        //快捷入口跳转
        function navJump(d) {
            switch (d.sref) {
                case 'courseManage':
                    $state.go(d.sref, { 'screenValue': { name: 'workbench', type: '快捷入口' }, onPreview: false });
                    break;
                default:
                    $state.go(d.sref, { 'screenValue': { name: 'workbench', type: '快捷入口', tab: d.tab ? d.tab : 1 }, type: d.type ? d.type : '' });
                    break;
            }
        };

        //处理统计图入口权限数据
        function handleTrendmapData() {
            $scope.trendmapDataTit = angular.copy(trendmapDataType);
            //根据权限循环遍历一次统计图入口
            angular.forEach($scope.trendmapDataTit, function(val, ind) {
                if (!checkAuthMenuById(val.power)) {
                    delete $scope.trendmapDataTit[ind];
                }
            });
            $scope.trendmapDataTit = detEmptyField_($scope.trendmapDataTit); //去除空的字段

            if ($scope.trendmapDataTit.length > 0) {
                $scope.trendmapTime = 30; //获取统计图时间段（7: 7天 30： 30天）
                $scope.trendmapType = $scope.trendmapDataTit[0]; //预存统计图类型数据
                getTrendmapData($scope.trendmapType); //获取统计图数据
            } else {
                $('.workbench_tp2_lf .nodata_show').show();
            }
        }

        // 拖拽后执行的方法
        function onDropComplete(index, obj, evt, type) {
            switch (type) {
                case 1: //工作台快捷入口拖拽排序
                    if (evt.data.name) {
                        //重新排序
                        var idx = $scope.myNavShow.indexOf(obj);
                        $scope.myNavShow.splice(idx, 1);
                        $scope.myNavShow.splice(index, 0, obj);
                    }
                    break;
                case 2: //待办事项管理拖拽排序
                    console.log(evt.data);
                    if (evt.data.needTodoId) {
                        //重新排序
                        var idx = $scope.needtodoSetList.indexOf(obj);
                        $scope.needtodoSetList.splice(idx, 1);
                        $scope.needtodoSetList.splice(index, 0, obj);
                    }
                    break;
            }

        };

        //确定保存快捷功能设置
        function setnav_confirm() {
            var arr = [];
            angular.forEach($scope.myNavShow, function(val) {
                arr.push(val.index);
            });
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/update",
                type: "post",
                data: JSON.stringify({
                    'shopTeacherId': window.currentUserInfo.shopTeacherId,
                    'shortcutEntrance': arr.join(',')
                }),
                success: function(data) {
                    if (data.status == 200) {
                        myNav_show = angular.copy($scope.myNavShow);
                        myNav_hide = angular.copy($scope.myNavHide);
                        $scope.shortcutEntrance = angular.copy(myNav_show);
                        window.currentUserInfo.shortcutEntrance = arr.join(',');
                        localStorage.setItem("currentUserInfo", JSON.stringify(window.currentUserInfo));
                        setTimeout(function() {
                            $('.workbench_entrance .workbench_nav').width(100 / $('.workbench_entrance .workbench_nav').length + '%');
                        });
                        layer.msg('已保存');
                        $scope.setnav_close();
                    };
                }
            });
        }

        //移除快捷入口or添加快捷入口
        function subOrAddMyNav(d, ind, type) {
            if (type == 'sub') {
                $scope.myNavShow.splice(ind, 1);
                $scope.myNavHide.push(d);
            } else {
                if ($scope.myNavShow.length < 11) {
                    $scope.myNavHide.splice(ind, 1);
                    $scope.myNavShow.push(d);
                } else {
                    layer.msg('最多添加11个快捷功能');
                }
            }
        }

        //处理快捷入口数据(根据权限取一次以前设置的值判断循序并展示)
        function handleNavData() {
            //根据权限循环遍历一次快捷入口
            angular.forEach(allMyNav, function(val, ind) {
                if (!checkAuthMenuById(val.power)) {
                    delete allMyNav[ind];
                }
            });
            allMyNav = detEmptyField_(allMyNav); //去除空的字段

            //通过判断是否有用户之前设置过的快捷入口
            if (window.currentUserInfo && window.currentUserInfo.shortcutEntrance) {
                var arr = window.currentUserInfo.shortcutEntrance.split(',');
                myNav_hide = angular.copy(allMyNav);
                angular.forEach(arr, function(val) {
                    angular.forEach(allMyNav, function(val_, ind) {
                        if (val == val_.index) {
                            myNav_show.push(val_);
                            delete myNav_hide[ind];
                        }
                    })
                });
                myNav_hide = detEmptyField_(myNav_hide); //去除空的字段
            } else {
                //如果大于11个则显示前11个，不大于则全部显示
                if (allMyNav.length > 11) {
                    myNav_show = allMyNav.slice(0, 11);
                    myNav_hide = allMyNav.slice(11, allMyNav.length);
                } else {
                    myNav_show = allMyNav;
                    myNav_hide = [];
                }
            }
        };

        //点击自定义快捷入口
        function toSetNav() {
            $scope.myNavShow = angular.copy(myNav_show);
            $scope.myNavHide = angular.copy(myNav_hide);
            openPopByDiv('自定义快捷入口', '.setnav', '720px');
        }

        //获取图表数据
        function getTrendmapData(d) {
            var dataAxis = [];
            var dataName = [];
            var dataSeries = {
                name: '新增潜客',
                type: 'line',
                data: [],
                itemStyle: {
                    normal: {
                        color: '#f77c80',
                        label: {
                            show: true,
                        }
                    },
                },
            };
            var type_ = null;
            if (d) {
                $scope.trendmapType = d;
                type_ = d.type;
            } else {
                type_ = $scope.trendmapType.type;
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/workbench/getWorkbenchChartNew",
                type: "get",
                data: {
                    'type': type_,
                    'dayNum': $scope.trendmapTime
                },
                success: function(data) {
                    if (data.status == 200) {
                        switch (type_) {
                            case 0:
                                dataSeries.name = '新增潜客';
                                break;
                            case 1:
                                dataSeries.name = '签约金额';
                                break;
                            case 2:
                                dataSeries.name = '消课课时';
                                break;
                            case 3:
                                dataSeries.name = '消课金额';
                                break;
                            case 4:
                                dataSeries.name = '订单收入';
                                break;
                            case 5:
                                dataSeries.name = '收支流水';
                                break;
                        };
                        angular.forEach(data.context, function(val) {
                            dataAxis.push(val.date);
                            if (type_ == 0) {
                                dataName.push(val.val);
                                dataSeries.data.push(val.val);
                            } else if (type_ == 1 || type_ == 3 || type_ == 4 || type_ == 5) {
                                dataName.push(val.val);
                                dataSeries.data.push(val.val.toFixed(2));
                            } else if (type_ == 2) {
                                dataName.push(val.val);
                                dataSeries.data.push(val.val.toFixed(2));
                            }
                        });
                        setTimeout(function() {
                            echart(dataAxis, dataName, dataSeries);
                        })
                    };
                }
            });
        }

        //趋势图
        function echart(dataAxis, dataName, dataSeries) {
            // 基于准备好的dom，初始化echarts实例
            var myChart2 = echarts.init($('#mainechart_')[0]);
            // 指定图表的配置项和数据
            var option = {
                legend: {
                    data: dataName,
                    type: 'scroll',
                    orient: 'vertical',
                    x: 'right',
                    y: '30',
                    bottom: 40,
                    selectedMode: 'single',
                },
                tooltip: {
                    trigger: 'axis',
                    position: function(point, params, dom, rect, size) {
                        return setTooltipPosition(point, params, dom, rect, size);
                    },
                },
                calculabel: true,
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: dataAxis,
                    splitLine: {
                        show: true
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#aaa', //左边线的颜色
                            width: '1' //坐标线的宽度
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#444'
                        },
                    }
                },
                yAxis: [{
                    type: "value",
                    minInterval: 1,
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        lineStyle: {
                            type: 'solid',
                            color: '#aaa', //左边线的颜色
                            width: '1' //坐标线的宽度
                        }
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#444'
                        },
                    }
                }],
                series: dataSeries
            };
            //清空画布，防止缓存
            myChart2.clear();
            // 使用刚指定的配置项和数据显示图表。
            myChart2.setOption(option);
            //用于使chart自适应高度和宽度
            window.addEventListener("resize", function() {
                myChart2.resize();
            });
            setTimeout(function() {
                myChart2.resize();
            }, 1000);
        }

        //获取销售漏斗图数据
        function getFunnelplotData(time) {
            var data = {},
                url = 'getPInfoInWorkbench';
            //默认是本月的数据
            if (!time) {
                time = $.format.date(timeFanwei, 'yyyy-MM-dd') + ' 至' + $.format.date(new Date(), 'yyyy-MM-dd');
                $('#sale_funnelplot_time').val($.format.date(timeFanwei, 'yyyy-MM-dd') + ' 至 ' + $.format.date(new Date(), 'yyyy-MM-dd'));
            };
            if ($scope.isfunnel) {
                data = {
                    'beginTime': time.split(' 至')[0] + ' 00:00:00',
                    'endTime': time.split(' 至')[1] + ' 23:59:59',
                }
            } else {
                url = 'getEducational';
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/workbench/" + url,
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == 200) {
                        $scope.funnelplotData = data.context;
                    };
                }
            });
        }
        //点击待处理
        function todo(d) {
            $state.go(d.sref, { 'screenValue': { name: 'workbench', type: '待处理', value: d.type } });
        }
        //获取待办事项数据
        function getNeedtodoData() {
            $('.workbench_tp1_rg .nodata_show').show();
            //获取接口数据
            $.hello({
                url: CONFIG.URL + "/api/oa/workbench/getDaiBanInWorkbench",
                type: "get",
                data: {},
                success: function(data) {
                    if (data.status == 200) {
                        $scope.needtodoData = [];
                        angular.forEach(data.context, function(v1) {
                            if (v1.name == 'XuFeiYuJingTotal') {
                                $scope.needtodoData.push({ index: '1', label: 1, value: v1.title + "：" + v1.num + '名', sref: 'renew_warning', power: 20 });
                            };
                            if (v1.name == 'DaiFenBanTotal') {
                                $scope.needtodoData.push({ index: '3', label: 1, value: v1.title + "：" + v1.num + '名', sref: 'edu_student', power: 34 });
                            };
                            if (v1.name == 'DaiJieYeTotal') {
                                $scope.needtodoData.push({ index: '4', label: 2, value: v1.title + "：" + v1.num + '个', sref: 'edu_class', power: 34 });
                            };
                            if (v1.name == 'DaiBuKeTotal') {
                                $scope.needtodoData.push({ index: '6', label: 1, value: v1.title + "：" + v1.num + '名', sref: 'edu_leave/makeup', power: 46 });
                            };
                            if (v1.name == 'DingDangTotal') {
                                $scope.needtodoData.push({ index: '7', label: 5, value: v1.title + "：" + v1.num + '名', sref: 'ordermanage', power: 56 });
                            };
                            if (v1.name == 'QingJiaTotal') {
                                $scope.needtodoData.push({ index: '8', label: 1, value: v1.title + "：" + v1.num + '名', sref: 'edu_leave', power: 44 });
                            }
                            if (v1.name == 'YueKeYuJing') {
                                $scope.needtodoData.push({ index: '9', label: 3, value: v1.title + "：" + v1.num + '次', sref: 'edu_aboutClass', power: 84 });
                            }
                            if (v1.name == 'benYueShengRi') {
                                $scope.needtodoData.push({ index: '10', label: 1, value: v1.title + "：" + v1.num + '名', sref: 'edu_student', power: 29, type: 'birthday' });
                            }
                            if (v1.name == 'WeiDianMing') {
                                $scope.needtodoData.push({ index: '11', label: 3, value: v1.title + "：" + v1.num + '次', sref: 'edu_schedule', power: 37 });
                            }
                            if (v1.name == 'JinRiLaiFang') {
                                $scope.needtodoData.push({ index: '12', label: 4, value: v1.title + "：" + v1.num + '人', sref: 'visiting', power: 5 });
                            }
                            if (v1.name == 'JinRiShiTing') {
                                $scope.needtodoData.push({ index: '13', label: 4, value: v1.title + "：" + v1.num + '人', sref: 'listenRecord', power: 39 });
                            }
                            if (v1.name == 'JinRiDaiGenJing') {
                                $scope.needtodoData.push({ index: '14', label: 4, value: v1.title + "：" + v1.num + '人', sref: 'potial_customer', power: 12, type: 2 });
                            }
                            if (v1.name == 'GuoQuWeiGenJing') {
                                $scope.needtodoData.push({ index: '15', label: 4, value: v1.title + "：" + v1.num + '人', sref: 'potial_customer', power: 12, type: 3 });
                            }
                            if (v1.name == 'YouXiaoQiYuJing') {
                                $scope.needtodoData.push({ index: '16', label: 1, value: v1.title + "：" + v1.num + '名', sref: 'edu_student/signUp_detail', power: 30 });
                            }
                        });

                        //根据权限循环遍历一次待处理事项
                        // angular.forEach($scope.needtodoData, function(val, ind) {
                        //     if(!checkAuthMenuById(val.power)) {
                        //         delete $scope.needtodoData[ind];
                        //     }
                        // });
                        // $scope.needtodoData = detEmptyField_($scope.needtodoData);    //去除空的字段
                        if ($scope.needtodoData.length > 0) {
                            $('.workbench_tp1_rg .nodata_show').hide();
                        }
                    };
                }
            });
        };

        //获取统计数据
        function getStatisticsInfos(n) {
            $scope.staReload = n;
            if ($scope.showEyesJud == 'true') { //如果数据汇总为显示状态
                $.hello({
                    url: CONFIG.URL + "/api/oa/statistics/getGongZuoTaiZongJi",
                    type: "get",
                    data: { 'dateType': n },
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.statisticsInfos = data.context;
                        };
                    }
                });
            };
        }
        //数据汇总跳转(按权限区分)
        function datacollection_click(type) {
            if (type == 1 && checkAuthMenuById(143)) {
                $state.go('new_saleStatistics', { 'screenValue': { name: 'workbench', type: '数据汇总', value: 1 } });
            } else if (type == 2 && checkAuthMenuById(144)) {
                $state.go('new_eduStatistics', { 'screenValue': { name: 'workbench', type: '数据汇总', value: 2 } });
            } else if (type == 3 && checkAuthMenuById(145)) {
                $state.go('financeStatistics', { 'screenValue': { name: 'workbench', type: '数据汇总', value: 3 } });
            } else if (type == 4 && checkAuthMenuById(142)) {
                $state.go('new_saleStatistics/adviserWorks', { 'screenValue': { name: 'workbench', type: '数据汇总', value: 4 } });
            }
        }

        //小眼睛
        function showEyes() {
            if ($scope.showEyesJud == 'true') {
                $scope.showEyesJud = 'false';
                localStorage.setItem('showEyes', 'false');
            } else {
                $scope.showEyesJud = 'true';
                localStorage.setItem('showEyes', 'true');
                getStatisticsInfos($scope.staReload); //获取数据汇总
            }
        }
        //点击刷新功能
        function clkReload(d, evt) {
            evt.stopPropagation();
            switch (d) {
                case '潜客管理':
                    $scope.getMsgData.data1();
                    break;
                case '试听预约':
                    $scope.getMsgData.data2();
                    break;
                case '学员管理':
                    $scope.getMsgData.data3();
                    break;
                case '报名管理':
                    $scope.getMsgData.data4();
                    break;
                case '请假补课':
                    $scope.getMsgData.data5();
                    break;
                case '待办事项':
                    getNeedtodoData();
                    break;
                case 'statistics':
                    getStatisticsInfos($scope.staReload);
                    break; //刷新获取统计数据
            };
            //旋转
            $(evt.toElement).addClass('rotate');
            setTimeout(function() {
                $(evt.toElement).removeClass('rotate');
            }, 1000)
        };

        $scope.switchType = function(item) {
            $scope.currentlist = item;
            if (item.status == "0") {
                $scope.isfunnel = true;
                getFunnelplotData();

            } else {
                $scope.isfunnel = false;
                getFunnelplotData();
            }

        }
        $scope.tipShow = function(evt) {
            evt.stopPropagation();
            $(evt.target).find('.tippaopao').show();
        };
        $scope.tipHide = function(evt) {
            evt.stopPropagation();
            $(evt.target).find('.tippaopao').hide();
        }

        //其他骚操作
        $scope.otherObj = {
            data: {
                judgeScroll: true,
            },
            operate: function(type, _da) {
                console.log(type, _da);
                switch (type) {
                    case 1: //大图滚动
                        bannerImgMove(_da);
                        break;
                    case 2: //点击设置待办事项
                        $.hello({
                            url: CONFIG.URL + "/api/oa/workbench/needTodoList",
                            type: "get",
                            success: function(res) {
                                if (res.status == 200) {
                                    $scope.needtodoSetList = res.context;
                                    openPopByDiv('待办事项管理', '.needtodo_set_pop', '760px');
                                };
                            }
                        });
                        break;
                    case 3: //点击关闭或者打开待办事项的某条数据
                        _da.status = _da.status == 1 ? 0 : 1;
                        break;
                    case 4: //点击提交代办事项列表
                        var params = [];
                        angular.forEach($scope.needtodoSetList, function(v1) {
                            params.push({
                                'needTodoId': v1.needTodoId,
                                'name': v1.name,
                                'status': v1.status,
                            })
                        });
                        $.hello({
                            url: CONFIG.URL + "/api/oa/workbench/needTodo/update",
                            type: "post",
                            data: JSON.stringify({ 'needTodo': JSON.stringify(params) }),
                            success: function(res) {
                                if (res.status == 200) {
                                    getNeedtodoData();
                                    layer.msg('保存成功');
                                    layer.close(dialog);
                                };
                            }
                        });
                        break;
                }
            }
        }

        //滚动图效果
        function bannerImgMove(num, sp) {
            if (sp == 'start') $('.workbench_tp3_rg_box').html($('.workbench_tp3_rg_box').html() + $('.workbench_tp3_rg_box').html()); //滚动内容复制一份保证最后一张图能滚动到第一张图
            var l_ = $('.workbench_tp3_rg_con').scrollLeft() ? $('.workbench_tp3_rg_con').scrollLeft() : 0, //获取内容的滚动距离
                l_2 = $('.workbench_tp3_rg_box li').length / 2; //计算总共要滚动几张图片
            w_ = $('.workbench_tp3_rg_con').width(), //每一张图片的宽度
                i_ = $('.workbench_tp3_rg_con').attr('scrollIndex') ? $('.workbench_tp3_rg_con').attr('scrollIndex') : 0, //给每次滚动设置序号
                i_2 = 0, //滚动到第几张图
                timer = null; //递归回调计时器

            if (num || num == 0) { //如果点击事件
                clearTimeout(timer);
                if (num != i_ * 1) { //如果点击的图片和现在展示的图片一致则不需要滚动
                    i_2 = num;
                } else {
                    return;
                }
            } else {
                i_2 = i_ * 1 + 1;
                if (i_2 >= l_2 + 1) {
                    i_2 = 1;
                    $('.workbench_tp3_rg_con').scrollLeft(0);
                };
            };

            $('.workbench_tp3_point span').removeClass('sp_show');
            $('.workbench_tp3_point span').eq(i_2 >= l_2 ? 0 : i_2).addClass('sp_show');
            $('.workbench_tp3_rg_con').attr('scrollIndex', i_2);

            $('.workbench_tp3_rg_con').animate({ 'scrollLeft': w_ * i_2 + 'px' }, 800, function() {
                //递归回调
                if ($scope.otherObj.data.judgeScroll) { //限制点击过快
                    $scope.otherObj.data.judgeScroll = false;
                    timer = setTimeout(function() {
                        $scope.otherObj.data.judgeScroll = true;
                        bannerImgMove()
                    }, 5000);
                };
            });
        };
        setTimeout(function() {
            $('.workbench_entrance .workbench_nav').width(100 / $('.workbench_entrance .workbench_nav').length + '%');
            //          bannerImgMove(null, 'start');
        })
    }]
})