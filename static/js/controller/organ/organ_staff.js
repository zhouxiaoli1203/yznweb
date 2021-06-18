define(['mySelect'], function() {
    return ['$scope', '$state', function($scope, $state) {
        var province, city, searchName = undefined; //筛选条件：状态、搜索框
        $scope.Fns = {
            //岗位设置完成
            jobSeted: function() {
                if (!$scope.currentJob.shop) {
                    return layer.msg('请选择所属校区')
                }
                var names = '';
                $scope.quarter_.map(function(item, index) {
                    names += item.quartersName + (index == $scope.quarter_.length - 1 ? '' : ';');

                })
                if ($scope.editIndex || $scope.editIndex == 0) {
                    var arr = [];
                    $scope.quarter_.map(function(ceil) {
                        arr.push({
                            quartersId: ceil.quartersId
                        })
                    })
                    if ($scope.currentJob.shopTeacherId) {
                        this.updateByShopTeacher({
                            shopTeacherId: $scope.currentJob.shopTeacherId,
                            teacherType: $scope.currentJob.teacherType,
                            shopTeacherStatus: $scope.currentJob.shopTeacherStatus,
                            quarters: arr
                        }, function() {
                            $scope.constants.subParams.shopTeacherList[$scope.editIndex] = {
                                shopTeacherId: $scope.currentJob.shopTeacherId,
                                shop: $scope.currentJob.shop,
                                teacherType: $scope.currentJob.teacherType,
                                shopTeacherStatus: $scope.currentJob.shopTeacherStatus,
                                quarters: angular.copy($scope.quarter_),
                                quartersNames: names
                            }
                        })
                    } else {
                        $scope.constants.subParams.shopTeacherList[$scope.editIndex] = {
                            shop: $scope.currentJob.shop,
                            teacherType: $scope.currentJob.teacherType,
                            shopTeacherStatus: 1,
                            quarters: angular.copy($scope.quarter_),
                            quartersNames: names
                        }
                    }
                } else {
                    if ($scope.isedit) {
                        this.requByOrg({
                            shop: $scope.currentJob.shop,
                            teacherType: $scope.currentJob.teacherType,
                            shopTeacherStatus: 1,
                            quarters: angular.copy($scope.quarter_),
                            quartersNames: names
                        })
                    } else {
                        $scope.constants.subParams.shopTeacherList.push({
                            shop: $scope.currentJob.shop,
                            teacherType: $scope.currentJob.teacherType,
                            shopTeacherStatus: 1,
                            quarters: angular.copy($scope.quarter_),
                            quartersNames: names
                        })
                    }

                }
                this.closeDialog();
            },
            searchByCity: function(data) {
                if (!data) {
                    city = undefined;
                } else {
                    city = data;
                }
                this.getlistShop(true, $scope.currentJob.alreadyChoose);
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
                this.getlistShop(true, $scope.currentJob.alreadyChoose);
            },
            updateByOrg: function() {
                if (!/^1[23456789]\d{9}$/.test($scope.constants.editParams.teacherPhone)) {
                    return layer.msg("请输入正确的手机号");
                }
                var tem = [];
                $scope.constants.subParams.shopTeacherList.map(function(item) {
                    tem.push({
                        shopTeacherId: item.shopTeacherId,
                        shopId: item.shop.shopId
                    })
                })
                var url = '/api/org/shopTeacher/updateByOrg',
                    params = {
                        'teacherName': $scope.constants.editParams.teacherName,
                        'teacherSex': $scope.constants.editParams.teacherSex,
                        'teacherPhone': $scope.constants.editParams.teacherPhone,
                        'shopTeacherList': tem
                    };
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == "200") {
                            $scope.Fns.getinfoByOrg($scope.constants.editParams.teacherName, $scope.constants.editParams.teacherPhone);
                            $scope.Fns.closeDialog();
                        }
                    }
                });
            },
            //新增员工
            requByOrg: function(param) {
                if (!/^1[23456789]\d{9}$/.test($scope.constants.subParams.teacherPhone)) {
                    return layer.msg("请输入正确的手机号");
                }
                if (!param && $scope.constants.subParams.shopTeacherList.length == 0) {
                    return layer.msg("请设置校区岗位");
                }
                var tem = [],
                    data = param ? [param] : angular.copy($scope.constants.subParams.shopTeacherList);
                data.map(function(item) {
                    var arr = [];
                    item.quarters.map(function(ceil) {
                        arr.push({
                            quartersId: ceil.quartersId
                        })
                    })
                    tem.push({
                        shopId: item.shop.shopId,
                        teacherType: item.teacherType,
                        shopTeacherStatus: item.shopTeacherStatus,
                        quarters: arr
                    })
                })
                var url = '/api/org/shopTeacher/addByOrg',
                    params = {
                        'teacherName': $scope.constants.subParams.teacherName,
                        'teacherSex': $scope.constants.subParams.teacherSex,
                        'teacherPhone': $scope.constants.subParams.teacherPhone,
                        'shopTeacherList': tem
                    };
                $.hello({
                    url: CONFIG.URL + url,
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == "200") {
                            if (param) {
                                $scope.Fns.getinfoByOrg($scope.constants.subParams.teacherName, $scope.constants.subParams.teacherPhone);
                                return;
                            }
                            $scope.Fns.closeDialog();
                            $scope.constants.pager.pagi_init(true);
                        }
                    }
                });
            },
            // 获取岗位列表
            getQuarters: function(id, ids) {
                $.hello({
                    url: CONFIG.URL + '/api/org/shopTeacher/quarters/list',
                    type: "get",
                    data: {
                        shopId: id
                    },
                    success: function(res) {
                        if (res.status == "200") {
                            var arr = [];
                            if (ids) {
                                res.context.map(function(item) {
                                    if (ids.indexOf(item.quartersId) != -1) {
                                        item.hasSelected = true;
                                        arr.push(item)
                                    }
                                })
                            }
                            $scope.quartersList = res.context;
                            setTimeout(function() {
                                $scope.$broadcast('_organquarter', 'reloadData', { 'data': arr, 'att': 'quartersId' });
                            });
                        }
                    }
                });
            },
            // 实时修改员工岗位信息
            updateByShopTeacher: function(params, fn) {
                $.hello({
                    url: CONFIG.URL + '/api/org/shopTeacher/updateByShopTeacher',
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == "200") { fn() }
                    }
                });
            },
            // 实时删除员工岗位信息
            deleteByShopTeacher: function(id, index) {
                if (!id) {
                    return $scope.constants.subParams.shopTeacherList.splice(index, 1)
                }
                $.hello({
                    url: CONFIG.URL + '/api/org/shopTeacher/deleteByShopTeacher',
                    type: "post",
                    data: JSON.stringify({
                        shopTeacherId: id
                    }),
                    success: function(res) {
                        if (res.status == "200") {
                            $scope.constants.subParams.shopTeacherList.splice(index, 1);
                            if ($scope.constants.subParams.shopTeacherList.length == 0) { //全部删除
                                var isDelect = layer.confirm('该员工已被删除', {
                                    title: "确认信息",
                                    skin: 'newlayerui layeruiCenter',
                                    closeBtn: 0,
                                    offset: '50px',
                                    move: false,
                                    btn: ['我知道了'] //按钮
                                }, function() {
                                    layer.close(isDelect);
                                    $scope.Fns.closeDialog();
                                })
                            }
                        }
                    }
                });
            },
            // 获取员工详细信息
            getinfoByOrg: function(name, phone) {
                $.hello({
                    url: CONFIG.URL + '/api/org/shopTeacher/infoByOrg',
                    type: "get",
                    data: {
                        teacherName: name,
                        teacherPhone: phone
                    },
                    success: function(res) {
                        if (res.status == "200") {
                            $scope.constants.subParams = {
                                teacherName: res.context.teacherName,
                                teacherPhone: res.context.teacherPhone,
                                teacherSex: res.context.teacherSex
                            };
                            res.context.shopTeacherList.map(function(item) {
                                item.quartersNames = '';
                                item.quarters.map(function(ceil, index) {
                                    item.quartersNames += ceil.quartersName + (index == item.quarters.length - 1 ? '' : ';');

                                })
                            });
                            $scope.constants.subParams.shopTeacherList = res.context.shopTeacherList;
                        }
                    }
                });
            },
            delQuarter: function(data, ind) { //多个岗位删除
                data.hasSelected = false;
                $scope.quarter_.splice(ind, 1);
            },
            selQuarter: function(data) { //多个岗位添加
                var judHas = true;
                var judHasIndex = null;
                angular.forEach($scope.quarter_, function(val, index) {
                    if (val.quartersTypeId == data.quartersTypeId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                });
                if (judHas) {
                    $scope.quarter_.push(data);
                    data.hasSelected = true;
                } else {
                    $scope.quarter_.splice(judHasIndex, 1);
                    data.hasSelected = false;
                }
            },
            //关闭弹框
            closeDialog: function() {
                layer.close(dialog)
            },
            operate: function(type, data, index) {
                switch (type) {
                    case 'edit':
                        $scope.constants.editParams = {
                            teacherName: data.teacherName,
                            teacherPhone: data.teacherPhone,
                            teacherSex: data.teacherSex
                        };
                        openPopByDiv('编辑员工', '.organ_staff_main_edit', '760px');
                        break;
                    case 'add':
                        if (data) { //编辑
                            $scope.isedit = true;
                            this.getinfoByOrg(data.teacherName, data.teacherPhone);
                        } else { //新增
                            $scope.isedit = false;
                            $scope.constants.subParams = {
                                teacherSex: 1,
                                shopTeacherList: []
                            };
                        }
                        openPopByDiv(data ? '员工详情' : '新增员工', '.organ_staff_main', '760px', function() {}, function() {
                            $scope.constants.pager.pagi_init(false);
                        });
                        break;
                    case 'job_setting': //岗位设置
                        $scope.currentJob = data ? angular.copy(data) : { teacherType: 1 };
                        $scope.editIndex = index;
                        $scope.quartersList = [];
                        if ($scope.currentJob.shop && $scope.currentJob.shop.shopId) { //编辑岗位
                            var quarterIds = '';
                            if ($scope.currentJob.quarters) {
                                angular.forEach($scope.currentJob.quarters, function(val, index) {
                                    quarterIds += val.quartersId + ';'
                                });
                            }
                            this.getQuarters($scope.currentJob.shop.shopId, quarterIds)
                        }
                        $scope.quarter_ = data ? angular.copy(data.quarters) : [];
                        openPopByDiv('岗位设置', '.organ_staff_setting', '760px');
                        break;
                    case 'shop_choose': //校区弹框
                        $scope.currentJob.alreadyChoose = "";
                        if ($scope.currentJob.shop && $scope.currentJob.shop.shopId) { //编辑岗位
                            $scope.currentJob.alreadyChoose += $scope.currentJob.shop.shopId;
                        }
                        if ($scope.constants.subParams.shopTeacherList) {
                            $scope.constants.subParams.shopTeacherList.map(function(item) {
                                $scope.currentJob.alreadyChoose += (item.shopId || item.shop.shopId) + ',';
                            })
                        }
                        this.onReset(true);
                        openPopByDiv('选择校区', '.organ_staff_list', '760px');
                        break;
                    case 'shop_choose_confirm': //选择校区
                        if (!$scope.choosedShop) {
                            return layer.msg('请选择校区')
                        }
                        $scope.currentJob.shop = angular.copy($scope.choosedShop);
                        $scope.quarter_ = [];
                        this.getQuarters($scope.currentJob.shop.shopId)
                        $scope.choosedShop = null;
                        this.closeDialog();
                        break;
                    case 'shop_choose_click':
                        $scope.choosedShop = data;
                        break;
                    case 'status_switch':
                        data.shopTeacherStatus = data.shopTeacherStatus == 1 ? 2 : 1;
                        this.updateByShopTeacher({
                            shopTeacherId: data.shopTeacherId,
                            shopTeacherStatus: data.shopTeacherStatus
                        }, function() {
                            $scope.Fns.getinfoByOrg($scope.constants.subParams.teacherName, $scope.constants.subParams.teacherPhone);
                        })
                        break;
                }
            },
            screenClick: function(data) {
                $scope.constants.shopId = data ? data.shopId : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            // 员工列表
            getList: function(pager) {
                $.hello({
                    url: CONFIG.URL + "/api/org/shopTeacher/list",
                    type: "get",
                    data: {
                        searchType: 'appSearchName',
                        searchName: $scope.constants.searchName,
                        shopId: $scope.constants.shopId ? $scope.constants.shopId : undefined,
                        start: pager.start,
                        count: pager.count
                    },
                    success: function(res) {
                        if (res.status == "200") {
                            res.context.items.map(function(item) {
                                if (item.shopList && item.shopList.length) {
                                    item.shopNameStr = '', item.shopNameStrAll = '';
                                    item.shopList.map(function(ceil, index) {
                                        if (index <= 1) {
                                            item.shopNameStr += (ceil.shopShortName || ceil.shopName) + (index == 0 && item.shopList.length > 1 ? ';' : '');
                                        }
                                        item.shopNameStrAll += (ceil.shopShortName || ceil.shopName) + (index == item.shopList.length - 1 ? '' : '、');
                                    })
                                }
                            })
                            $scope.constants.list = res.context.items;
                            pager.pagi_init(false, res.context.totalNum);
                        }
                    }
                });
            },
            SearchData: function(data) {
                $scope.constants.searchName = data.value;
                $scope.constants.pager.pagi_init(true);
            },
            bindKeyEnter: function(data) {
                $scope.constants.searchName = data.value;
                $scope.constants.pager.pagi_init(true);
            },

            SearchData_popup: function(data) {
                searchName = data.value;
                this.getlistShop(true, $scope.currentJob.alreadyChoose);
            },
            bindKeyEnter_popup: function(data) {
                searchName = data.value;
                this.getlistShop(true, $scope.currentJob.alreadyChoose);
            },
            onReset: function(fl) {
                if (fl) {
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['省']('');
                        $scope.screen_goReset['市']('');
                    });
                    province = city = searchName = undefined;
                    $scope.cityList = [];
                    $scope.kindSearchOnreset_["temporary_popup"]();
                    this.getlistShop(true, $scope.currentJob.alreadyChoose)
                } else {
                    for (var i in $scope.screen_goReset) {
                        $scope.screen_goReset[i]();
                    }
                    $scope.kindSearchOnreset(); //调取app重置方法
                    $scope.constants.shopId = undefined;
                    $scope.constants.searchName = '';
                    $scope.constants.pager.pagi_init(true);
                }
            },
            getlistShop: function(fl, ids) {
                var params = fl ? {
                    "province": province,
                    "city": city,
                    "shopShortName": searchName,
                    'shopType': 1
                } : { 'shopType': 1 }
                $.hello({
                    url: CONFIG.URL + "/api/org/shop/listShop",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            if (fl) {
                                var arr = [];
                                if (ids) {
                                    data.context.map(function(item) {
                                        if (ids.indexOf(item.shopId) == -1) {
                                            arr.push(item);
                                        }
                                    })
                                }
                                $scope.constants.listShop_popup = ids ? arr : data.context;
                            } else {
                                $scope.constants.listShop = data.context;
                            }
                        }
                    }
                })
            }
        }
        $scope.constants = {
            list: [],
            searchName: '',
            shopId: '',
            pager: new Initpager('.M_box3_1', $scope.Fns.getList, getEachPageName($state)),
        };
        $scope.constants.pager.pagi_init(true);
        $scope.Fns.initCity();
        $scope.Fns.getlistShop();
    }]
});