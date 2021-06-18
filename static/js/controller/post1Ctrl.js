define(["pagination", "mySelect"], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = '0',
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var judge;
        // 树
        $scope.constants = {
            parent_li_1: false,
            quartersId: null, //当前选择岗位id
            data: [],
            defaultnme: "默认",
            typeId: "",
            totalNum: ""

        };
        $scope.Fns = {
            switchStudNav: function(n) {
                if (n == 1) {
                    $state.go("staff_new", {});
                } else if (n == 2) {
                    $state.go("post", {});
                }
            },
            shouqi: function($event, index, data) {
                $event.stopPropagation();
                data[index].isopen = !data[index].isopen;
            },
            // 全选
            allChecked: function($event, x, z) {
                $event.stopPropagation();
                // 一级全选
                if (!z) {
                    if (x.checkStatus == 1) {
                        x.checkStatus = 0
                    } else if (x.checkStatus == 0) {
                        x.checkStatus = 1
                    } else {
                        x.checkStatus = 1
                    }
                    x.isopen = false;
                    angular.forEach(x.menuList, function(data) {
                        data.checkStatus = x.checkStatus;
                        data.isopen = false;
                        angular.forEach(data.menuList, function(value) {
                            value.checkStatus = x.checkStatus;
                        })
                    });

                } else {
                    // 二级全选
                    if (x.checkStatus == 1) {
                        x.checkStatus = 0
                    } else if (x.checkStatus == 0) {
                        x.checkStatus = 1
                    } else {
                        x.checkStatus = 1
                    }
                    x.isopen = false;
                    angular.forEach(x.menuList, function(data, index) {
                        data.isopen = false;
                        data.checkStatus = x.checkStatus;
                    });
                    // 二级菜单
                    var flag = false,
                        allCount = 0, //非选中的数量，包括-和未选中
                        notAcount_2 = 0; //二级存在-号的存在
                    angular.forEach(z.menuList, function(data, index) {
                        if (data.checkStatus !== 1) { //未选中
                            allCount++;
                            if (data.checkStatus == 2) {
                                notAcount_2++;
                            }
                        } else {
                            flag = true; //选中
                        }
                    })
                    if (flag && allCount == 0) { //全部选中
                        z.checkStatus = 1;
                        return
                    }
                    if (allCount == z.menuList.length) {
                        if (notAcount_2 !== 0) {
                            z.checkStatus = 2;
                        } else {
                            z.checkStatus = 0; //全不选
                        }
                    } else {
                        z.checkStatus = 2; //部分选择
                    }
                }
            },
            // 单选
            Checked: function($event, y, x, z) {
                $event.stopPropagation();
                // y.checkStatus = !y.checkStatus;
                if (y.checkStatus == 1) {
                    y.checkStatus = 0;
                } else {
                    y.checkStatus = 1;
                }

                var flag = false,
                    count = 0;
                // 遍历3层数据
                angular.forEach(x.menuList, function(data) {
                    if (data.checkStatus == 0) { //未选中
                        count++
                    } else {
                        flag = true;
                    }
                });
                if (flag && count == 0) { //2层全部选中
                    x.checkStatus = 1;

                } else if (count == x.menuList.length) {
                    x.checkStatus = 0; //2层未全选
                } else {
                    x.checkStatus = 2; //2层部分选择
                }

                var flag1 = false,
                    count1 = 0,
                    count2 = 0;
                angular.forEach(z.menuList, function(data, index) {
                    if (data.checkStatus == 2) { //部分选中
                        count1++
                    } else if (data.checkStatus == 0) { //未选中
                        count2++
                    } else {
                        flag1 = true; //选中
                    }
                });

                if (flag1 && count1 == 0 && count2 == 0) { //全部选中
                    z.checkStatus = 1;

                } else if (count2 == z.menuList.length) {
                    z.checkStatus = 0; //全不选
                } else {
                    z.checkStatus = 2; //部分选择
                }

            },
            //保存当前所选权限
            save: function() {
                if (!$scope.constants.quartersId) { //如果不存在
                    layer.msg('请先选择岗位');
                    return
                }
                var that = this;
                var quartersAuthList = [];
                angular.forEach($scope.constants.data, function(data) {
                    if (data.leaf == 0) { //无子节点
                        if (data.checkStatus !== 0) {
                            quartersAuthList.push({
                                'authMenuId': data.authMenuId
                            });
                        }
                    } else {
                        if (data.checkStatus !== 0) { //顶层
                            quartersAuthList.push({
                                'authMenuId': data.authMenuId
                            });
                            angular.forEach(data.menuList, function(son) {
                                if (son.leaf == 0) {
                                    if (son.checkStatus == 1) {
                                        quartersAuthList.push({
                                            'authMenuId': son.authMenuId
                                        });
                                    }
                                } else {
                                    if (son.checkStatus !== 0) { //二层
                                        quartersAuthList.push({
                                            'authMenuId': son.authMenuId
                                        });
                                        angular.forEach(son.menuList, function(child) {
                                            if (child.checkStatus == 1) {
                                                // 三层
                                                quartersAuthList.push({
                                                    'authMenuId': child.authMenuId
                                                });
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                });
                $.hello({
                    url: CONFIG.URL + "/api/oa/auth/editAuth",
                    type: "post",
                    data: JSON.stringify({
                        quartersId: $scope.constants.quartersId,
                        quartersAuthList: quartersAuthList
                    }),
                    success: function(data) {
                        // 保存权限
                        layer.msg('保存权限成功');
                        that.getTableList(start);
                    }
                })
            },
            //恢复默认全权限
            recovery: function() {
                if (!$scope.constants.quartersId) { //如果不存在
                    return layer.msg('请先选择岗位');
                }
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/oa/auth/defaultQuartersAuthMenuList",
                    type: "get",
                    data: {
                        quartersTypeId: $scope.quartersTypeId
                    },
                    success: function(data) {
                        if (data.context && data.context.length !== 0) {
                            $scope.constants.data = that.init_tree(data.context);
                        } else {
                            that.getreeList();
                        }
                    }
                });
            },
            // 删除
            delectPost: function(x, $event) {
                $event.stopPropagation();
                var that = this;
                layer.confirm('是否删除该岗位？', {
                    title: "确认删除信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/auth/delete",
                        type: "get",
                        data: {
                            'quartersId': x.quartersId
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                that.getTableList('0');
                                layer.msg('删除成功!')
                            }
                        }
                    })
                }, function() {
                    layer.closeAll();
                });
            },
            // 编辑
            editPost: function(x, $event) {
                $event.stopPropagation();
                judge = '编辑';
                $scope.postPopTitle = "编辑";
                layerOpen('post_shade', judge);
                // $(".charge_shade_fenlei").prop("disabled", true);
                $scope.postName = x.quartersName;
                $scope.quartersTypeId = x.quartersTypeId;
                $scope.quartersId = x.quartersId;
            },
            // 新增
            addPost: function() {
                judge = '添加';
                $scope.postPopTitle = "新增岗位";
                // $(".charge_shade_fenlei").prop("disabled", false);
                $scope.postName = "";
                $scope.quartersTypeId = "";
                // $(".postRequest").attr("checked", false);
                $scope.isSelectTeach = false;
                layerOpen('post_shade', '新增岗位');
            },
            // 修改或新增请求
            save_post: function() {
                var that = this;
                switch (judge) {
                    case '添加':
                        var param = {
                            'quartersName': $scope.postName,
                            'quartersTypeId': $scope.quartersTypeId
                        };
                        for (var i in param) {
                            if (param[i] == '' || param[i] == undefined || param[i] == null) {
                                layer.msg('请将信息填写完整');
                                return;
                            }
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/oa/auth/add",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == 200) {
                                    pagerRender = false;
                                    that.getTableList('0');
                                    layer.close(dialog);

                                }

                            }
                        });

                        break;
                    case '编辑':
                        var param = {
                            'quartersName': $scope.postName,
                            'quartersTypeId': $scope.quartersTypeId,
                            'quartersId': $scope.quartersId
                        }
                        for (var i in param) {
                            if (param[i] == '' || param[i] == undefined || param[i] == null) {
                                layer.msg('请将信息填写完整');
                                return;
                            }
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/oa/auth/update",
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == 200) {
                                    pagerRender = false;
                                    that.getTableList('0');
                                    layer.close(dialog);
                                }
                            }
                        });
                        break;
                }
            },
            // 获取全部权限列表
            getreeList: function() {
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/oa/auth/authMenuList",
                    type: "get",
                    data: {
                        type: 1
                    },
                    success: function(data) {
                        // 初始状态全不选
                        if (data.context && data.context.length !== 0) {
                            $scope.constants.data = that.init_tree(data.context, 0);
                        }
                    }
                })
            },
            // 获取某个岗位权限
            getreeSingle: function(x) {
                var that = this;
                angular.forEach($scope.trList, function(data) {
                    data.isActive = false;
                });
                x.isActive = true;
                $scope.constants.defaultnme = x.quartersName;
                $scope.constants.data = [];
                $scope.constants.quartersId = x.quartersId;
                $scope.quartersTypeId = x.quartersTypeId;
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/oa/auth/quartersAuthMenuList",
                    type: "get",
                    data: {
                        type: 1,
                        quartersId: x.quartersId
                    },
                    success: function(data) {
                        // 返回部分默认全部选中
                        if (data.context && data.context.length !== 0) {
                            $scope.constants.data = that.init_tree(data.context);
                        } else {
                            // coding
                            that.getreeList();
                        }

                    }
                })
            },
            // 初始化树状菜单
            init_tree: function(data, type) {
                if (data) {
                    angular.forEach(data, function(item) {
                        if (type == 0) {
                            item.checkStatus = type;
                        }
                        // item.checkStatus = type;
                        item.isopen = false;
                        if (item.leaf !== 0) {
                            angular.forEach(item.menuList, function(son) {
                                if (type == 0) {
                                    son.checkStatus = type;
                                }
                                son.isopen = true;
                                if (son.leaf !== 0) {
                                    angular.forEach(son.menuList, function(child) {
                                        // child.checkStatus = type == 3 ? false : true;
                                        if (type == 0) {
                                            child.checkStatus = type
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
                return data;
            },
            //关闭弹框
            post_cancel: function() {
                layer.close(dialog)
            },
            // 初始化
            init: function() {
                $scope.isOperate = checkAuthMenuById("52");
                $scope.studNavJud = 2;
                if ($scope.$stateParams.screenValue.name == "globalsearch") {
                    $timeout(function () {
                        if ($scope.$stateParams.screenValue.pop == "新增岗位") {
                            $scope.Fns.addPost();
                        }
                     })
                }
                this.getreeList();
                this.getTableList('0');
                this.getType();
            },
            // 获取岗位列表
            getTableList: function(start_) {
                start = start_ == 0 ? "0" : start_;
                var param = {
                    'useTotalType': 1,
                    'quartersTypeId': $scope.constants.typeId,
                    'quartersTypeStatus': 1,
                    'count': eachPage,
                    'start': start_
                };
                for (var i in param) {
                    if (param[i] === '' || param[i] == undefined) {
                        delete param[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/auth/list",
                    type: "get",
                    data: param,
                    success: function(data) {
                        $scope.trList = data.context.items;
                        $scope.Fns.renderPager(data.context.totalNum);
                        $scope.constants.totalNum = data.context.totalNum;
                        $scope.$apply();
                    }
                })
            },
            // 下拉筛选
            TypeId: function(TypeId) {
                if (TypeId == null) {
                    $scope.constants.typeId = null;
                } else {
                    $scope.constants.typeId = TypeId.quartersTypeId;
                }
                pagerRender = false;
                this.getTableList('0');
            },
            // 获取岗位类型
            getType: function() { //获取岗位类型
                $.hello({
                    url: CONFIG.URL + "/api/oa/userAdmin/getQuartersType",
                    type: "get",
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.screen_type = $scope.typeList = data.context;
                        }
                    }
                })
            },
            // 分页
            renderPager: function(total) {
                var that = this;
                if (pagerRender) {
                    return
                }
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
                        if (api.getCurrentEach() !== eachPage) { //本地存储记下每页多少条
                            eachPage = api.getCurrentEach();
                            localStorage.setItem(getEachPageName($state), eachPage);
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        that.getTableList(start); //回掉
                    }
                });
            }
        };

        $scope.Fns.init();
    }]
});