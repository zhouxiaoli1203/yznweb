define(["pagination", "mySelect", "dataTree"], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = '0',
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var judge, shopId;
        var province, city, searchName = undefined; //筛选条件：状态、搜索框
        // 树
        $scope.constants = {
            searchName: undefined,
            // searchType: undefined,
            orgTeacherId: undefined,
            kindSearchData: {
                searchName: '姓名、联系方式'
            },
            selectInfoNameId: 'searchName',
            dataAuth: [],
            shopTree: [],
            defaultnme: "默认",
            shopRange: '1',
            listShop: [],
            listShop_popup: [],
            choosed_shops: [],
            sel_all: false,

        };
        $scope.Fns = {
            searchByCity: function(data) {
                if (!data) {
                    city = undefined;
                } else {
                    city = data;
                }
                this.getlistShop(true);
            },
            initCity: function() {
                $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                    $scope.provincesList = data.provincesList;
                })
            },
            searchByProv: function(data, ind) {
                screen_setDefaultField($scope, function() {
                    $scope.screen_goReset['市']('');
                });
                city = undefined;
                if (!data) {
                    province = undefined;
                    $scope.cityList = [];
                } else {
                    province = data;
                    $scope.cityList = $scope.provincesList['0_' + ind];
                }
                this.getlistShop(true);
            },
            sel_end: function() {
                if (!$scope.constants.choosed_shops.length) {
                    return layer.msg('请选择校区')
                }
                var arr = [];
                $scope.constants.choosed_shops.map(function(item) {
                    arr.push({
                        shopId: item.shopId,
                        shopShortName: item.shopShortName
                    })
                })
                $scope.orgTeacherShopRList = arr;
                this.account_cancel();
            },
            sel_allFun: function(c) {
                checkboxAllFun(c, $scope.constants.listShop_popup, $scope.constants.choosed_shops, 'shopId');
            },
            checkSingleFun: function(data) {
                var index_ = [false, null];
                if (data.hasChecked) {
                    data.hasChecked = false;
                    angular.forEach($scope.constants.choosed_shops, function(val, ind) {
                        if (data.shopId == val.shopId) {
                            index_ = [true, ind];
                        };
                    });
                    if (index_[0]) {
                        $scope.constants.choosed_shops.splice(index_[1], 1);
                    }
                } else {
                    data.hasChecked = true;
                    $scope.constants.choosed_shops.push(data);
                }
                $scope.sel_all = $scope.constants.choosed_shops.length == $scope.constants.listShop_popup.length;
            },
            //按钮搜索
            SearchData_popup: function(data) {
                searchName = data.value;
                this.getlistShop(true);
            },
            screenClick: function(data) {
                shopId = data ? data.shopId : undefined;
                pagerRender = false;
                this.getTableList('0');
            },
            onReset: function(fl) {
                if (fl) {
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['省']('');
                        $scope.screen_goReset['市']('');
                    });
                    $scope.cityList = []
                    province = city = searchName = undefined;
                    $scope.kindSearchOnreset_["temporary_popup"]();
                    this.getlistShop(true)
                } else {
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    }
                    $scope.kindSearchOnreset(); //调取app重置方法
                    shopId = undefined;
                    $scope.constants.searchName = '';
                    pagerRender = false;
                    this.getTableList('0');
                }
            },
            getlistShop: function(fl) {
                var ids = arrToStr($scope.constants.choosed_shops, 'shopId');
                var params = fl ? {
                    "province": province,
                    "city": city,
                    "shopShortName": searchName,
                } : {}
                $.hello({
                    url: CONFIG.URL + "/api/org/shop/listShop",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            if (fl) {
                                data.context.map(function(item) {
                                    if (ids.indexOf(item.shopId) != -1) {
                                        item.hasChecked = true;
                                    }
                                })
                                $scope.sel_all = $scope.constants.choosed_shops.length && ($scope.constants.choosed_shops.length == data.context.length);
                                $scope.constants.listShop_popup = data.context;
                            } else {
                                $scope.constants.listShop = data.context;
                            }
                        }
                    }
                })
            },
            chooseShop: function() {
                $scope.sel_all = false;
                $scope.constants.choosed_shops = angular.copy($scope.orgTeacherShopRList);
                this.onReset(true);
                openPopByDiv('选择校区', '.account_shop_list', '760px');
            },
            delShop: function(index, arr) {
                (arr || $scope.orgTeacherShopRList).splice(index, 1);
            },
            //保存当前所选权限
            save: function() {
                if (!$scope.constants.orgTeacherId) { //如果不存在
                    layer.msg('请先选择员工');
                    return
                }
                var that = this;
                var orgTeacherAuthList = [];
                var orgTeacherShopRList = [];
                angular.forEach($scope.constants.dataAuth, function(data) {
                    if (data.leaf == 0) { //无子节点
                        if (data.checkStatus !== 0) {
                            orgTeacherAuthList.push({
                                'authMenuId': data.authMenuId
                            });
                        }
                    } else {
                        if (data.checkStatus !== 0) { //顶层
                            angular.forEach(data.menuList, function(son) {
                                if (son.leaf == 0) {
                                    if (son.checkStatus == 1) {
                                        orgTeacherAuthList.push({
                                            'authMenuId': son.authMenuId
                                        });
                                    }
                                } else {
                                    if (son.checkStatus !== 0) { //二层
                                        angular.forEach(son.menuList, function(child) {
                                            if (child.checkStatus == 1) {
                                                // 三层
                                                orgTeacherAuthList.push({
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
                if ($scope.constants.shopRange == 1) {
                    orgTeacherShopRList.push({
                        'shopId': 0
                    });
                } else {
                    angular.forEach($scope.constants.shopTree, function(data) {
                        if (data.leaf == 0) { //无子节点
                            if (data.checkStatus !== 0) {
                                orgTeacherShopRList.push({
                                    'shopId': data.shopId
                                });
                            }
                        } else {
                            if (data.checkStatus !== 0) { //顶层
                                angular.forEach(data.shopList, function(son) {
                                    if (son.leaf == 0) {
                                        if (son.checkStatus == 1) {
                                            orgTeacherShopRList.push({
                                                'shopId': son.shopId
                                            });
                                        }
                                    } else {
                                        if (son.checkStatus !== 0) { //二层
                                            angular.forEach(son.shopList, function(child) {
                                                if (child.checkStatus == 1) {
                                                    // 三层
                                                    orgTeacherShopRList.push({
                                                        'shopId': child.shopId
                                                    });
                                                }
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
                var data = {
                    orgTeacherId: $scope.constants.orgTeacherId,
                    orgTeacherAuthList: orgTeacherAuthList.length > 0 ? orgTeacherAuthList : undefined,
                    orgTeacherShopRList: orgTeacherShopRList.length > 0 ? orgTeacherShopRList : undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/org/orgTeacher/editOrgTeacherAuth",
                    type: "post",
                    data: JSON.stringify(data),
                    success: function(data) {
                        // 保存权限
                        layer.msg('保存权限成功');
                        that.getTableList(start);
                        if (window.currentUserInfo && $scope.constants.teacherId == window.currentUserInfo.teacherId) {
                            setTimeout(function() {
                                location.href = "index.html" + '#/dataView';
                            }, 1000)
                        }
                    }
                })
            },
            //          //恢复默认全权限
            //          recovery: function() {
            //              if (!$scope.constants.orgTeacherId) { //如果不存在
            //                  return layer.msg('请先选择员工');
            //              }
            //              var that = this;
            //              that.getreeList();
            //              that.getShopTreeList();
            //          },
            // 删除
            delectPost: function(x, $event) {
                $event.stopPropagation();
                var that = this;
                layer.confirm('是否删除该账号，删除后不可恢复？', {
                    title: "确认删除信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/org/orgTeacher/delete",
                        type: "post",
                        data: JSON.stringify({
                            orgTeacherId: x.orgTeacherId
                        }),
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
                $scope.orgTeacherShopRList = [];
                if (x.orgTeacherShopRList.length && x.orgTeacherShopRList[0].shopId == 0) { //全部校区
                    $scope.organAll = 1;
                } else {
                    $scope.organAll = 2;
                    $scope.orgTeacherShopRList = angular.copy(x.shopList ? x.shopList : []);
                }
                $scope.postPopTitle = "编辑";
                $scope.acntName = x.teacherName;
                $scope.acntIdentity = x.teacherDuty;
                $scope.acntPhone = x.teacherPhone;
                $scope.orgTeacherId = x.orgTeacherId;
                openPopByDiv(judge, '.account_shade', '560px');
            },
            // 新增
            addPost: function() {
                judge = '添加';
                $scope.postPopTitle = "新增账号";
                $scope.acntName = "";
                $scope.acntIdentity = "";
                $scope.acntPhone = "";
                $scope.orgTeacherShopRList = [];
                $scope.organAll = 1;
                openPopByDiv('新增账号', '.account_shade', '560px');
            },
            // 修改或新增请求
            save_account: function() {
                if (!/^1[23456789]\d{9}$/.test($scope.acntPhone)) {
                    return layer.msg("请输入正确的手机号");
                }
                var that = this,
                    arr = [];
                if ($scope.orgTeacherShopRList) {
                    $scope.orgTeacherShopRList.map(function(item) {
                        arr.push({ shopId: item.shopId })
                    })
                }
                switch (judge) {
                    case '添加':
                        var param = {
                            "teacherName": $scope.acntName,
                            "teacherDuty": $scope.acntIdentity, // 身份
                            "teacherPhone": $scope.acntPhone,
                            'orgTeacherShopRList': $scope.organAll == 1 ? [{ shopId: 0 }] : !$scope.orgTeacherShopRList.length ? undefined : arr
                        };
                        $.hello({
                            url: CONFIG.URL + "/api/org/orgTeacher/add",
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
                            "teacherName": $scope.acntName,
                            "teacherDuty": $scope.acntIdentity, // 身份
                            "teacherPhone": $scope.acntPhone,
                            "orgTeacherId": $scope.orgTeacherId,
                            'orgTeacherShopRList': $scope.organAll == 1 ? [{ shopId: 0 }] : !$scope.orgTeacherShopRList.length ? undefined : arr
                        }
                        $.hello({
                            url: CONFIG.URL + "/api/org/orgTeacher/edit",
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
                    url: CONFIG.URL + "/api/org/orgTeacher/getMenuTree",
                    type: "get",
                    success: function(data) {
                        // 初始状态全不选
                        if (data.context && data.context.length !== 0) {
                            $scope.constants.dataAuth = that.init_tree(data.context, 'auth', 0);
                        }
                    }
                })
            },
            // 获取全部权限列表
            getShopTreeList: function() {
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/org/orgTeacher/getShopTree",
                    type: "get",
                    success: function(data) {
                        // 初始状态全不选
                        if (data.context && data.context.length !== 0) {
                            $scope.constants.shopTree = that.init_tree(data.context, 'shop', 0);
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
                $scope.constants.defaultnme = x.teacherDuty;
                $scope.constants.dataAuth = [];
                $scope.constants.shopTree = [];
                $scope.constants.orgTeacherId = x.orgTeacherId;
                $scope.constants.teacherId = x.teacherId;
                //              $scope.quartersTypeId = x.quartersTypeId;
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/org/orgTeacher/getAuthByOrgTeacherId",
                    type: "get",
                    data: {
                        orgTeacherId: x.orgTeacherId
                    },
                    success: function(data) {
                        var auth = angular.copy(data.context.authMenuList);
                        var shop = angular.copy(data.context.shopList);
                        // 返回部分默认全部选中
                        if (data.context && data.context.length !== 0) {
                            if (data.context.allShop) {
                                $scope.constants.shopRange = "1";
                            } else {
                                $scope.constants.shopRange = "0";
                            }
                            $scope.constants.dataAuth = that.init_tree(auth, 'auth');
                            $scope.constants.shopTree = that.init_tree(shop, 'shop');
                        } else {
                            // coding
                            that.getreeList();
                            that.getShopTreeList();
                        }
                    }
                })
            },
            //          // 初始化树状菜单
            init_tree: function(data, treeTy, type) {
                if (data) {
                    switch (treeTy) {
                        case 'auth':
                            angular.forEach(data, function(item) {
                                if (type == 0) {
                                    item.checkStatus = type;
                                }
                                console.log(item);
                                item.isopen = false;
                                if (item.leaf !== 0) {
                                    angular.forEach(item.menuList, function(son) {
                                        if (type == 0) {
                                            son.checkStatus = type;
                                        }
                                        son.isopen = true;
                                        if (son.leaf !== 0) {
                                            angular.forEach(son.menuList, function(child) {
                                                if (type == 0) {
                                                    child.checkStatus = type
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                            break;
                        case 'shop':
                            if ($scope.constants.shopRange == 1) {
                                angular.forEach(data, function(item) {
                                    if (type == 0) {
                                        item.checkStatus = 0;
                                    }
                                    console.log(item);
                                    item.isopen = false;
                                    if (item.leaf !== 0) {
                                        angular.forEach(item.shopList, function(son) {
                                            if (type == 0) {
                                                son.checkStatus = 0;
                                            }
                                            son.isopen = false;
                                            if (son.leaf !== 0) {
                                                angular.forEach(son.shopList, function(child) {
                                                    if (type == 0) {
                                                        child.checkStatus = 0;
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            } else {
                                angular.forEach(data, function(item) {
                                    if (type == 0) {
                                        item.checkStatus = type;
                                    }
                                    console.log(item);
                                    item.isopen = false;
                                    if (item.leaf !== 0) {
                                        angular.forEach(item.shopList, function(son) {
                                            if (type == 0) {
                                                son.checkStatus = type;
                                            }
                                            son.isopen = true;
                                            if (son.leaf !== 0) {
                                                angular.forEach(son.shopList, function(child) {
                                                    if (type == 0) {
                                                        child.checkStatus = type
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            break;
                        default:
                            break;
                    }
                }
                return data;
            },
            //关闭弹框
            account_cancel: function() {
                layer.close(dialog)
            },
            // 初始化
            init: function() {
                this.getreeList();
                this.getShopTreeList();
                this.getTableList('0');
                this.getlistShop();
                this.initCity();
            },
            SearchData: function(data) {
                $scope.constants.searchName = data.value;
                pagerRender = false;
                this.getTableList('0');
            },
            bindKeyEnter: function(data) {
                $scope.constants.searchName = data.value;
                // $scope.constants.searchType = data.type;
                pagerRender = false;
                this.getTableList('0');
            },
            // 获取岗位列表
            getTableList: function(start_) {
                start = start_ == 0 ? "0" : start_;
                var param = {
                    "searchName": $scope.constants.searchName,
                    'searchType': 'appSearchName',
                    'count': eachPage,
                    'start': start_,
                    'shopId': shopId
                };
                $.hello({
                    url: CONFIG.URL + "/api/org/orgTeacher/list",
                    type: "get",
                    data: param,
                    success: function(data) {
                        // data.context.map(function(item) {
                        //     item.detailNames = '';
                        //     if (item.shopList && item.shopList.length) {
                        //         item.detailNames += '管辖校区：';
                        //         item.shopList.map(function(ceil, index) {
                        //             item.detailNames += ceil.shopShortName + (index == (item.shopList.length - 1) ? '' : '、');
                        //         })
                        //     }
                        // })

                        data.context.map(function(item) {
                            if (item.shopList && item.shopList.length) {
                                item.shopNameStr = '', item.shopNameStrAll = '';
                                item.shopList.map(function(ceil, index) {
                                    if (index <= 1) {
                                        item.shopNameStr += ceil.shopShortName + (index == 0 && item.shopList.length > 1 ? ';' : '');
                                    }
                                    item.shopNameStrAll += ceil.shopShortName + (index == item.shopList.length - 1 ? '' : '、');
                                })
                            }
                        })
                        $scope.trList = data.context;
                        $scope.$apply();
                    }
                })
            },
            changeShop: function() {
                    //                  if ($scope.constants.shopRange == 1) {
                    //                      this.getShopTreeList();
                    //                  } else {
                    this.getShopTreeList();
                    //                  }
                }
                // 分页
                //          renderPager: function (total) {
                //              var that = this;
                //              if (pagerRender) {
                //                  return
                //              }
                //              pagerRender = true;
                //              var $M_box3 = $('.M-box3');
                //              $M_box3.pagination({
                //                  totalData: total || 0, // 数据总条数
                //                  showData: eachPage, // 显示几条数据
                //                  jump: true,
                //                  coping: true,
                //                  count: 2, // 当前页前后分页个数
                //                  homePage: '首页',
                //                  endPage: '末页',
                //                  prevContent: '上页',
                //                  nextContent: '下页',
                //                  callback: function (api) {
                //                      if (api.getCurrentEach() !== eachPage) {  //本地存储记下每页多少条
                //                          eachPage = api.getCurrentEach();
                //                          localStorage.setItem(getEachPageName($state), eachPage);
                //                      }
                //                      start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                //                      that.getTableList(start); //回掉
                //                  }
                //              });
                //          }
        };
        $scope.Fns.init();
    }]
});