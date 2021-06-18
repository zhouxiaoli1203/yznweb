define(['fullPage'], function() {
    return ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
        $scope.Fns = {
            onReset: function() {
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                $scope.kindSearchOnreset(); //调取app重置方法
                $scope.constants.screen = {};
                $scope.constants.pager.pagi_init(true);
            },
            // 课程名称排序
            sortCllict: function(data) {
                $scope.constants.search_orderName = data.id;
                $scope.constants.search_orderTyp = data.sort;
                $scope.constants.pager.pagi_init(true);
            },
            SearchData: function(data) {
                $scope.constants.screen.searchName = data.value;
                $scope.constants.pager.pagi_init(true);
            },
            bindKeyEnter: function(data) {
                $scope.constants.screen.searchName = data.value;
                $scope.constants.pager.pagi_init(true);
            },
            screenClick: function(data) {
                $scope.constants.screen.shopId = data ? data.shopId : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            checkboxChange: function(e, key, v) {
                $scope.constants.screen[key] = e.target.checked ? v : undefined;
                $scope.constants.pager.pagi_init(true);
            },
            operate: function(type, data, index) {
                switch (type) {
                    case 'add': //新增课程
                        $rootScope.fullPage.open({
                            target: "course",
                            text: "新增课程",
                            type: 1,
                            close: function() {
                                $scope.constants.pager.pagi_init(false);
                            }
                        }, $scope);
                        break;
                    case 'edit': //修改课程
                        $scope.editCourseInfo = data;
                        $rootScope.fullPage.open({
                            target: "course",
                            text: "课程详情",
                            type: 2,
                            data: data,
                            close: function() {
                                $scope.constants.pager.pagi_init(false);
                            }
                        }, $scope);
                        break;
                    case 'edit_name': //修改课程名
                        $scope.editCourseInfo = data;
                        $scope.editCourseInfo.courseName_ = data.courseName;
                        openPopByDiv('批量修改课程名', '.organ_edit_course', '560px');
                        break;
                    case 'edit_package': //添加套餐
                        $scope.editCourseInfo = data;
                        $scope.constants.packageList_keshi = [];
                        $scope.constants.packageList_xueqi = [];
                        $scope.constants.packageList_anyue = [];
                        openPopByDiv('批量添加套餐', '.organ_edit_package', '1060px');
                        break;
                }
            },
            // 课程列表
            getcourseList: function(pager) {
                $.hello({
                    url: CONFIG.URL + "/api/org/course/list",
                    type: "get",
                    data: {
                        searchType: 'appSearchName',
                        searchName: $scope.constants.screen.searchName,
                        shopId: $scope.constants.screen.shopId ? $scope.constants.screen.shopId : undefined,
                        start: pager.start,
                        count: pager.count,
                        courseType: $scope.constants.screen.courseType,
                        teachingMethod: $scope.constants.screen.teachingMethod,
                        orderName: $scope.constants.search_orderName,
                        orderTyp: $scope.constants.search_orderTyp,
                    },
                    success: function(res) {
                        if (res.status == "200") {
                            res.context.items.map(function(item) {
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
                            $scope.constants.list = res.context.items;
                            pager.pagi_init(false, res.context.totalNum);
                        }
                    }
                });
            },
            // 关闭弹框
            close: function() {
                layer.close(dialog)
            },
            //输入课程购买课和购买月数失焦状态时
            inputPackageTime: function(x) {
                if (x.packageTime == 0) {
                    x.packagePrice = 0;
                }
            },
            // 套餐删除
            removePackageItem: function(index, total) {
                if (total) {
                    if (total[index].packageId) {
                        total[index].packageStatus = '0';
                    }
                    total.splice(index, 1)
                }
            },
            addPackagewin: function(type) {
                switch (type) {
                    case 0:
                        $scope.constants.packageList_keshi.push({ feeType: type });
                        break;
                    case 1:
                        $scope.constants.packageList_xueqi.push({ feeType: type });
                        break;
                    case 2:
                        $scope.constants.packageList_anyue.push({ feeType: type });
                        break;
                }
            },
            getPackages: function(list) {
                var arr = [];
                var b = {};
                for (var i = 0, len = list.length; i < len; i++) {
                    if (list[i].packagePrice === "" || list[i].packagePrice === undefined) {
                        $scope.constants.isError = true;
                        layer.msg("课程价格必填！");
                        break;
                    }
                    b = {
                        packageId: list[i].packageId ? list[i].packageId : undefined,
                        packageStatus: list[i].packageStatus,
                        packageName: list[i].packageName,
                        packagePrice: list[i].packagePrice,
                        packageTime: list[i].packageTime,
                        giveTime: list[i].giveTime,
                        packageUnitPrice: numAccuracy(list[i].packagePrice / list[i].packageTime).toFixed(2),
                        feeType: list[i].feeType
                    };
                    if (list[i].feeType == 1) {
                        b["schoolTermId"] = list[i].schoolTermId;
                    }
                    if (list[i].feeType == 2) {
                        b["packageTime"] = parseInt(list[i].packageTime);
                    }

                    arr.push(b);
                }
                return arr.length > 0 ? arr : [];
            },
            // 批量修改课程名
            editCourse: function() {
                $.hello({
                    url: CONFIG.URL + "/api/org/course/updateOrgCourseName",
                    type: "post",
                    data: JSON.stringify({
                        courseName: $scope.editCourseInfo.courseName_,
                        oldCourse: {
                            courseName: $scope.editCourseInfo.courseName,
                            courseType: $scope.editCourseInfo.courseType,
                            teachingMethod: $scope.editCourseInfo.teachingMethod
                        }
                    }),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.Fns.close();
                            $scope.constants.pager.pagi_init(true);
                        }
                    }
                })
            },
            //获取学期列表
            getPackageList: function() {
                $.hello({
                    url: CONFIG.URL + "/api/org/course/listShopSchoolTerm",
                    type: "get",
                    data: {},
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.constants.packageList = data.context;
                            //学期被删无法匹配需重新选择学期
                            // angular.forEach(data.context, function(item) {
                            //     $scope.constants.listSchoolObj[item.schoolTermId] = item.schoolTermId;
                            // })
                        }
                    }
                });
            },
            // 批量修改套餐
            editPackage: function() {
                var arr = [];
                $scope.editCourseInfo.shopList.map(function(item) {
                    arr.push({
                        shopId: item.shopId
                    })
                })
                var params = {
                    courseName: $scope.editCourseInfo.courseName,
                    courseType: $scope.editCourseInfo.courseType,
                    teachingMethod: $scope.editCourseInfo.teachingMethod,
                    packages: $scope.Fns.getPackages($scope.constants.packageList_keshi.concat($scope.constants.packageList_xueqi).concat($scope.constants.packageList_anyue)),
                    courseList: arr.length ? arr : undefined
                };
                $.hello({
                    url: CONFIG.URL + "/api/org/course/addPackageByOrg",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.Fns.close();
                            $scope.constants.pager.pagi_init(true);
                        }
                    }
                })
            },
            //售卖校区列表
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
            search_orderName: 'courseName',
            search_orderTyp: 'asc',
            list: [],
            screen: {},
            pager: new Initpager('.M_box3_1', $scope.Fns.getcourseList, getEachPageName($state)),
            thead: [{
                'name': '课程名称',
                'width': '120',
                'id': 'courseName',
                'issort': true,
            }, {
                'name': '类型',
                'width': '80',
            }, {
                'name': '上课方式',
                'width': '80',
            }, {
                'name': '售卖校区',
                'width': '200',
            }, {
                'name': '操作',
                'width': '120',
                'align': 'center'
            }]
        };
        $scope.constants.pager.pagi_init(true);
        $scope.Fns.getlistShop();
        $scope.Fns.getPackageList();
    }]
});