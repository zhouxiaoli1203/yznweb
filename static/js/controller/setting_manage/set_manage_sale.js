define(["pagination", "remarkPop", 'courseAndClass_sel'], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE','$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        init();

        function init() {
            /*
             *渠道设置
             */
            $scope.isOperate = checkAuthMenuById("24");
            $scope.editRemark = editRemark; ////编辑备注确认按钮
            $scope.detailed = detailed; //点击查看详细请
            $scope.editOperation = editOperation; //编辑
            $scope.deleteOperation = deleteOperation; //删除
            $scope.Enterkeyup = Enterkeyup; //模糊搜索
            $scope.SearchData = SearchData; //按钮筛选
            $scope.channel_tab_por = channel_tab_por; //新增渠道
            $scope.channelSure = channelSure; //新增、编辑提交
            $scope.channelSure_1 = channelSure_1; //一级新增、编辑提交
            $scope.closePop = closePop; //取消
            $scope.editRemark = editRemark; //备注编辑
            $scope.switchVisitNav = switchVisitNav; //切换
            $scope.switchangeNav = switchangeNav; //切换渠道设置


            $scope.studNavJud = 1;
            $scope.nameListThead_1 = [{
                    'name': '一级渠道名称',
                    'width': '25%',
                },
                {
                    'name': '包含二级渠道数量',
                    'width': '25%',
                },
                {
                    'name': '备注',
                    'width': '25%',
                },
                {
                    'name': '操作',
                    'align': 'center',
                    'id': 3
                }
            ];
            $scope.nameListThead_2 = [{
                    'name': '二级渠道名称',
                    'width': '25%',
                },
                {
                    'name': '所属一级渠道',
                    'width': '25%',
                },
                {
                    'name': '备注',
                    'width': '25%',
                },
                {
                    'name': '操作',
                    'align': 'center',
                    'id': 3
                }
            ];

            /*
             *公池设置
             */
            $scope.shopInstal_confirm = shopInstal_confirm; //公池设置确认
            $scope.getShopInstal = getShopInstal; //公池设置
            $scope.changeStatus = function(model) {
                $scope.shopInstal[model] = $scope.shopInstal[model] == 1 ? 0 : 1;
                $scope.shopInstal_confirm();
            }
            $scope.changeStatus_ = function(x) {
                x.status = x.status == 1 ? 0 : 1;
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/channelType/updateStatus",
                    type: "post",
                    data: JSON.stringify({ id: x.id, status: x.status, channelTypeName: x.channelTypeName }),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('设置成功', {
                                icon: 1
                            });
                            getChannelList(start);
                        }
                    }

                })
            }

            /*
             *续费预警
             */
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            SERVICE.COURSEANDCLASS.COURSE['预警课程'] = function(d) {
                angular.forEach(d, function(val) {
                    var judge = true;
                    angular.forEach($scope.aewarnCourseInfo.courseList, function(val_) {
                        if (val.courseId == val_.courseId) {
                            judge = false;
                        }
                    })
                    if (judge) {
                        $scope.aewarnCourseInfo.courseList.push(val);
                    }
                })
            };
            //删除预警课程
            $scope.renewDel = function(index) {
                $scope.aewarnCourseInfo.courseList.splice(index, 1);
            };
            // 删除预警课程列表
            $scope.renewListDel = function(x) {
                var confirm = layer.confirm('是否删除本预警规则？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 0,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/warnCourse/delete",
                        type: "post",
                        data: JSON.stringify({
                            warnCourseId: x.warnCourseId
                        }),
                        success: function(res) {
                            if (res.status == 200) {
                                $scope.getwarnCourseList();
                                layer.close(confirm);
                            };
                        }
                    });
                }, function() {
                    layer.close(confirm);
                })

            }
            $scope.getConfig = getConfig;
            // 预警预设
            $scope.deterRenew = function() {
                if ($scope.currentShop.warnTime === "") {
                    // layer.msg('请输入预警课时');
                    $scope.currentShop.warnTime = window.currentUserInfo.shop.warnTime;
                    return;
                }
                if ($scope.currentShop.warnDayNum === "") {
                    // layer.msg('请输入预警天数');
                    $scope.currentShop.warnDayNum = window.currentUserInfo.shop.warnDayNum;
                    return;
                }
                var params = {
                    'warnTime': $scope.currentShop.warnTime,
                    'warnDayNum': $scope.currentShop.warnDayNum
                }
                window.currentUserInfo.shop.warnTime = $scope.currentShop.warnTime;
                window.currentUserInfo.shop.warnDayNum = $scope.currentShop.warnDayNum;
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/updateCourseWarnTimeStatus",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            layer.msg('设置成功');
                            $scope.getConfig();
                        };
                    }
                });
            };
            // 新增&编辑预警
            $scope.renewAddEdit = function() {
                if ($scope.aewarnCourseInfo.warnTime === "") {
                    layer.msg('请输入预警课时');
                    return;
                }
                if ($scope.aewarnCourseInfo.warnDayNum === "") {
                    layer.msg('请输入预警天数');
                    return;
                }
                var params = {
                    'warnTime': $scope.aewarnCourseInfo.warnTime,
                    'warnDayNum': $scope.aewarnCourseInfo.warnDayNum
                }
                if (!$scope.aewarnCourseInfo.courseList.length) {
                    layer.msg('请选择预警课程');
                    return;
                }
                params['courseList'] = [];
                angular.forEach($scope.aewarnCourseInfo.courseList, function(val) {
                    params['courseList'].push({ 'courseId': val.courseId });
                })
                if ($scope.aewarnCourseInfo.warnCourseId) {
                    params['warnCourseId'] = $scope.aewarnCourseInfo.warnCourseId;
                }
                $.hello({
                    url: CONFIG.URL + ($scope.aewarnCourseInfo.warnCourseId ? "/api/oa/setting/warnCourse/update" : "/api/oa/setting/warnCourse/add"),
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.getwarnCourseList();
                            layer.close(dialog);
                        };
                    }
                });
            };
            // 预警设置弹窗
            $scope.aewarnCourse = function(x) {
                if (x) {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/warnCourse/info",
                        type: "get",
                        data: {
                            warnCourseId: x.warnCourseId
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.aewarnCourseInfo = data.context;

                            }
                        }
                    })
                } else {
                    $scope.aewarnCourseInfo = {
                        warnTime: 0,
                        warnDayNum: 0,
                        courseList: []
                    };
                }
                openPopByDiv(x ? '编辑预警' : '添加预警', '#renew_set', '760px')
            };
            // 预警课程列表
            $scope.getwarnCourseList = function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/warnCourse/list",
                    type: "get",
                    success: function(data) {
                        if (data.status == '200') {
                            angular.forEach(data.context, function(item) {
                                item.c_str = '';
                                angular.forEach(item.courseList, function(ceil, index, arr) {
                                    item.c_str += ceil.courseName + (index == arr.length - 1 ? '' : ';');
                                })
                            });
                            console.log(data.context);
                            $scope.warnCourseList = data.context;
                        }
                    }
                })
            };
            // 初始化菜单&跳转
            var list = [
                { name: "渠道设置", tab: 1, post: 22 },
                { name: "公池设置", tab: 2, post: 166 },
                { name: "续费预警", tab: 3, post: 21 }
            ]
            $scope.tabMenu = list.filter(function(item) {
                return checkAuthMenuById(item.post);
            });
            if ($stateParams.tab) { //跳转带tab信息
                var tabItem = $scope.tabMenu.filter(function(item) {
                    return item.tab == $stateParams.tab
                });
                if (tabItem.length) {
                    switchVisitNav(tabItem[0].tab)
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
                    })
                }
            }


        }

        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.currentShop = data.context;
                    }
                }
            })
        }

        function getShopInstal() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/shopInstal/info',
                type: 'get',
                success: function(data) {
                    if (data.status == "200") {
                        $scope.shopInstal = data.context;
                    }
                }
            });
        }

        function shopInstal_confirm() {
            if ($scope.shopInstal.recycleDayNum == '') {
                $scope.shopInstal.recycleDayNum = 1;
            }
            if ($scope.shopInstal.customersDayNum == '') {
                $scope.shopInstal.customersDayNum = 1;
            }
            var param = angular.copy($scope.shopInstal);
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/shopInstal/update',
                type: 'post',
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == "200") {
                        layer.msg('设置成功')
                    }
                }
            });
        }

        function switchVisitNav(n) {
            $scope.visitNavJud = n;
            localStorage.setItem("$statetime", n);
            switch (n) {
                case 1: //渠道设置
                    switchangeNav(1);
                    // getChannelList('0'); //记载列表
                    // getChannelType(); //获取渠道基本类型
                    break;
                case 2: //公池设置
                    $scope.getShopInstal();
                    break;
                case 3: //续费预警
                    $scope.getConfig();
                    $scope.getwarnCourseList();
                    break;
            }
        }

        function switchangeNav(n) {
            likeName = undefined;
            $scope.studNavJud = n;
            $scope.selectInfoNameId = 'channelName'; //select初始值
            if (n == 1) {
                $scope.searchData = {
                    channelName: '一级渠道名称',
                };
            } else {
                $scope.searchData = {
                    channelName: '二级渠道名称、所属一级渠道、备注',
                };
            }
            getChannelType();
            pagerRender = false;
            getChannelList('0');
        }

        var likeName, //搜索内容
            SearchDataType, //搜索类型
            DisEdDe, //区分编辑与新增
            ChanneId;

        function detailed(data) {
            slideOut();
            $scope.$detailed = data;
            getStudentContractRenewList(data.refund.contractId)
        }

        function SearchData(data) {
            console.log(data)
            likeName = data.value;
            SearchDataType = data.type;
            pagerRender = false;
            getChannelList('0');
        }

        function Enterkeyup(data) {
            likeName = data.value;
            SearchDataType = data.type;
            pagerRender = false;
            getChannelList('0');
        }

        //排序回调方法
        $scope.sortCllict = function(data) {

        }

        //列表数据
        function getChannelList(start) {
            var url = "";
            var param = {
                'start': start,
                'count': eachPage,
                'searchType': likeName ? 'appSearchName' : undefined,
                'searchName': likeName
            };
            for (var i in param) {
                if (param[i] === '' || param[i] == undefined) {
                    delete param[i];
                };
            };
            if ($scope.studNavJud == 1) {
                param["channelNumNeed"] = 1;
                param["type"] = 1;
                url = "/api/oa/setting/channelType/list";
            } else {
                url = "/api/oa/setting/getChannelList";
            }
            $.hello({
                url: CONFIG.URL + url,
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.getChannelList = data.context.items;
                        renderPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }

            })
        }

        function renderPager(total) {
            if (pagerRender)
                return;
            pagerRender = true;
            var $M_box3 = $('.M-box3');
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
                    getChannelList(start); //回掉
                }
            });
        }

        //删除
        function deleteOperation(x) {
            layer.confirm('是否删除该渠道？', {
                title: "确认删除信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 0,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var params = {
                    id: x.id
                };
                if ($scope.studNavJud == 1) {
                    url = "/api/oa/setting/channelType/delete";
                } else {
                    url = "/api/oa/setting/deleteChannel";
                }
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('删除成功', {
                                icon: 1
                            });
                            pagerRender = false;
                            getChannelList('0');
                        }
                    }

                })
            }, function() {
                layer.closeAll();
            })
        }

        //新增渠道
        function channel_tab_por() {
            DisEdDe = 'add';
            if ($scope.studNavJud == 1) {
                $scope.channelTypeName = "";
                $scope.channelDesc = '';
                layerOpen("shade_channel", "新增一级渠道");
            } else {
                layerOpen('shade_editchannel', '新增二级渠道');
                $scope.channelName = '';
                $scope.channelTypeId = undefined;
                $scope.channelDesc = '';
            }

        }
        //编辑
        function editOperation(x) {
            if ($scope.studNavJud == 1) {
                $scope.channelTypeName = x.channelTypeName;
                $scope.channelDesc = x.desc;
                ChanneId = x.id;
                layerOpen("shade_channel", "编辑一级渠道");
            } else {
                $scope.channelName = x.channelName;
                $scope.channelTypeId = x.channelTypeId;
                $scope.channelDesc = x.channelDesc;
                ChanneId = x.id;
                layerOpen('shade_editchannel', '编辑二级渠道');
            }
            DisEdDe = 'edit';
        }

        function channelSure_1() {
            var url = "";
            var param = {};
            switch (DisEdDe) {
                case 'add':
                    param = {
                        'channelTypeName': $scope.channelTypeName,
                    };
                    url = "/api/oa/setting/channelType/add";
                    break;
                case 'edit':
                    param = {
                        'id': ChanneId,
                        'channelTypeName': $scope.channelTypeName,
                    };
                    url = "/api/oa/setting/channelType/update";
                    break;
                default:
                    break;
            }
            param["desc"] = $scope.channelDesc;
            $.hello({
                url: CONFIG.URL + url,
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg((DisEdDe == 'add' ? '新增' : '编辑') + '成功', {
                            icon: 1
                        });
                        pagerRender = false;
                        getChannelList('0');
                        layer.close(dialog);
                    }
                }

            })
        }

        function channelSure() {
            switch (DisEdDe) {
                case 'add':
                    var param = {
                        'channelName': $scope.channelName,
                        'channelTypeId': $scope.channelTypeId,
                        'channelDesc': $scope.channelDesc,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/insertChannel",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功新增渠道', {
                                    icon: 1
                                });
                                pagerRender = false;
                                getChannelList('0');
                                layer.close(dialog);
                            }
                        }

                    })
                    break;
                case 'edit':
                    var param = {
                        'id': ChanneId,
                        'channelName': $scope.channelName,
                        'channelTypeId': $scope.channelTypeId,
                        'channelDesc': $scope.channelDesc,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/updateChannel",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('编辑成功', {
                                    icon: 1
                                });
                                pagerRender = false;
                                getChannelList('0');
                                layer.close(dialog);
                            }
                        }

                    })
                    break;
                default:
                    break;
            }
        }

        function editRemark(data) {
            var da = JSON.parse(data.id);
            var param = {
                'id': da.id,
                'channelName': da.channelName,
                'channelTypeId': da.channelTypeId,
                'channelDesc': data.value,
            };

            $.hello({
                url: CONFIG.URL + "/api/oa/setting/updateChannel",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        layer.msg('备注修改成功', {
                            icon: 1
                        });
                        pagerRender = false;
                        getChannelList('0');
                        $(".edit_remark").removeClass("open");
                    }
                }

            })
        }

        function getChannelType() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/channelType/list",
                type: "get",
                data: { pageType: 0 ,type:1,status:1},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.getChannelTypeList = data.context;
                    }
                }

            })
        }

        function closePop() {
            layer.close(dialog);
        }


    }]
})