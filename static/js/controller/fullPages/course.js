define([], function() {
    return {
        init: function($scope) {
            var province, city, searchName = undefined; //筛选条件：状态、搜索框
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
            console.log($scope.props);
            $scope.Fns = {
                // 课程类型选择
                courseTypeChoosed: function() {
                    if ($scope.constants.subParams.courseType == 1) {
                        $scope.constants.subParams.teachingMethod = 2;
                    }
                },
                // 删除课程
                delCourse: function() {
                    var isdelete = layer.confirm('确认删除?', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        zIndex: 19930113,
                        btn: ['是', '否'] //按钮
                    }, function() {
                        $.hello({
                            url: CONFIG.URL + "/api/org/course/deleteCourse",
                            type: "post",
                            data: JSON.stringify({ courseId: $scope.shopChoosed.courseId }),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.close(isdelete);
                                    $scope.constants.packageList_keshi = [];
                                    $scope.constants.packageList_xueqi = [];
                                    $scope.constants.packageList_anyue = [];
                                    // $scope.Fns.getDetailShop();
                                    $scope.Fns.getDetailShop({
                                        teachingMethod: $scope.shopChoosed.teachingMethod,
                                        courseName: $scope.shopChoosed.courseName,
                                        courseType: $scope.shopChoosed.courseType
                                    });
                                }
                            }
                        });
                    }, function() {
                        layer.close(isdelete);
                    })
                },
                inputPackageTime: function(x) {
                    if (x.packageTime == 0) {
                        x.packagePrice = 0;
                    }
                },
                checkboxChange: function(e, key, v) {
                    $scope.constants.screen[key] = e.target.checked ? v : undefined;
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
                //获取学期列表
                getPackageList: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/org/course/listShopSchoolTerm",
                        type: "get",
                        data: {},
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.packageList = data.context;
                            }
                        }
                    });
                },
                delShop: function(index, arr) {
                    (arr || $scope.orgTeacherShopRList).splice(index, 1);
                    if (!arr) {
                        $scope.courseCurrencies = [];
                    }
                },
                //关闭弹框
                account_cancel: function() {
                    layer.close(dialog)
                },
                //选择校区&选择通用课
                sel_end: function(fl) {
                    if (fl) {
                        if (!$scope.constants.choosed_courses.length) {
                            return layer.msg('请选择课程', {
                                zIndex: 19930113
                            });
                        }
                        var arr = [];
                        $scope.constants.choosed_courses.map(function(item) {
                            arr.push({
                                courseName: item.course ? item.course.courseName : item.courseName,
                                courseType: item.course ? item.course.courseType : item.courseType,
                                teachingMethod: item.course ? item.course.teachingMethod : item.teachingMethod,
                                courseId: item.course ? item.course.courseId : item.courseId
                            })
                        })
                        $scope.courseCurrencies = arr;
                    } else {
                        if (!$scope.constants.choosed_shops.length) {
                            return layer.msg('请选择校区', {
                                zIndex: 19930113
                            });
                        }
                        var arr = [],
                            flag = false,
                            curStr = arrToStr($scope.orgTeacherShopRList, 'shopId');
                        $scope.constants.choosed_shops.map(function(item) {
                            if (curStr.indexOf(item.shopId) == -1) { //新选择和原来不一致
                                flag = true;
                            }
                            arr.push({
                                shopId: item.shopId,
                                shopShortName: item.shopShortName
                            })
                        })
                        if (flag || (arr.length !== $scope.orgTeacherShopRList.length)) { //清空通用课
                            $scope.courseCurrencies = [];
                        }
                        $scope.orgTeacherShopRList = arr;
                    }
                    this.account_cancel();
                },
                onReset: function(fl) {
                    if (fl) { //通用课选择
                        $scope.$$childHead.kindSearchOnreset_["course_popup"]();
                        $scope.constants.screen = {};
                        $scope.constants.pager.pagi_init(true);
                    } else { //校区选择
                        screen_setDefaultField($scope, function() {
                            $scope.$$childHead.screen_goReset['省']('');
                            $scope.$$childHead.screen_goReset['市']('');
                        });
                        $scope.cityList = [];
                        province = city = searchName = undefined;
                        $scope.$$childHead.kindSearchOnreset_["temporary_popup"]();
                        this.getlistShop(true, $scope.ids)
                    }
                },
                // 全选
                sel_allFun: function(c, fl) {
                    if (fl) {
                        checkboxAllFun(c, $scope.constants.listCourse_popup, $scope.constants.choosed_courses, 'courseName');
                    } else {
                        checkboxAllFun(c, $scope.constants.listShop_popup, $scope.constants.choosed_shops, 'shopId');
                    }
                },
                // 单选
                checkSingleFun: function(data, fl) {
                    var index_ = [false, null],
                        source = fl ? $scope.constants.choosed_courses : $scope.constants.choosed_shops,
                        key = fl ? 'courseName' : 'shopId';
                    if (data.hasChecked) {
                        data.hasChecked = false;
                        angular.forEach(source, function(val, ind) {
                            if (data[key] == val[key]) {
                                index_ = [true, ind];
                            };

                        });
                        if (index_[0]) {
                            source.splice(index_[1], 1);
                        }
                    } else {
                        data.hasChecked = true;
                        source.push(data);
                    }
                    if (fl) {
                        $scope.constants.sel_all = source.length == $scope.constants.listCourse_popup.length;
                    } else {
                        $scope.constants.sel_all = source.length == $scope.constants.listShop_popup.length;
                    }
                },
                //按钮搜索
                SearchData_popup: function(data) {
                    searchName = data.value;
                    this.getlistShop(true, $scope.ids);
                },
                searchByCity: function(data) {
                    if (!data) {
                        city = undefined;
                    } else {
                        city = data;
                    }
                    this.getlistShop(true, $scope.ids);
                },
                searchByProv: function(data, ind) {
                    screen_setDefaultField($scope, function() {
                        $scope.$$childHead.screen_goReset['市']('');
                    });
                    city = undefined;
                    if (!data) {
                        province = undefined;
                        $scope.cityList = [];
                    } else {
                        province = data;
                        $scope.cityList = $scope.provincesList['0_' + ind];
                    }
                    this.getlistShop(true, $scope.ids);
                },
                // 通用课列表
                getgeneralList: function(pager) {
                    var initLen = $scope.constants.choosed_courses.length;
                    $.hello({
                        url: CONFIG.URL + "/api/org/course/list",
                        type: "get",
                        data: {
                            searchType: 'appSearchName',
                            searchName: $scope.constants.screen.searchName,
                            shopIds: arrToStr($scope.orgTeacherShopRList, 'shopId'),
                            start: pager.start,
                            count: pager.count,
                            courseType: 0,
                            teachingMethod: 2,
                            // excludeCourseNameList: $scope.excludeCourseNameList ? $scope.excludeCourseNameList : undefined
                        },
                        success: function(res) {
                            if (res.status == "200") {
                                var arr = [],
                                    data = initLen ? $scope.constants.choosed_courses : $scope.courseCurrencies;
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
                                    var fl = false;
                                    data.map(function(ceil) {
                                        if ((ceil.courseName || ceil.course.courseName) == item.courseName) {
                                            fl = true;
                                        }
                                    })
                                    if (fl) {
                                        if (!initLen) $scope.constants.choosed_courses.push(item);
                                        arr.push(item);
                                        item.hasChecked = true;
                                    }
                                })
                                $scope.constants.listCourse_popup = res.context.items;
                                $scope.constants.sel_all = arr.length && ($scope.constants.listCourse_popup.length <= arr.length);
                                pager.pagi_init(false, res.context.totalNum);
                            }
                        }
                    });
                },
                // 单个校区通用课列表
                getgeneralList_single: function(pager) {
                    var initLen = $scope.constants.choosed_courses.length;
                    $.hello({
                        url: CONFIG.URL + "/api/org/course/getShopCourseList",
                        type: "get",
                        data: {
                            searchType: 'appSearchName',
                            searchName: $scope.constants.screen.searchName,
                            shopId: arrToStr($scope.orgTeacherShopRList, 'shopId'),
                            start: pager.start,
                            count: pager.count,
                            courseType: 0,
                            teachingMethod: 2,
                            // excludeCourseNameList: $scope.excludeCourseNameList ? $scope.excludeCourseNameList : undefined
                        },
                        success: function(res) {
                            if (res.status == "200") {
                                var arr = [],
                                    data = initLen ? $scope.constants.choosed_courses : $scope.courseCurrencies;
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
                                    var fl = false;
                                    data.map(function(ceil) {
                                        if ((ceil.courseName || ceil.course.courseName) == item.courseName) {
                                            fl = true;
                                        }
                                    })
                                    if (fl) {
                                        if (!initLen) $scope.constants.choosed_courses.push(item);
                                        arr.push(item);
                                        item.hasChecked = true;
                                    }
                                })
                                $scope.constants.listCourse_popup = res.context.items;
                                $scope.constants.sel_all = arr.length && ($scope.constants.listCourse_popup.length <= arr.length);
                                pager.pagi_init(false, res.context.totalNum);
                            }
                        }
                    });
                },
                // 校区列表
                getlistShop: function(fl, ids) {
                    var c_ids = '',
                        initLen = $scope.constants.choosed_shops.length;
                    $scope.orgTeacherShopRList.map(function(item) {
                        c_ids += item.shopId + ',';
                    });
                    $scope.constants.choosed_shops.map(function(item) {
                        c_ids += item.shopId + ',';
                    });
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
                                    data.context.map(function(item) {
                                        if (ids.indexOf(item.shopId) == -1) {
                                            arr.push(item);
                                            if (c_ids.indexOf(item.shopId) != -1) {
                                                if (!initLen) $scope.constants.choosed_shops.push(item);
                                                item.hasChecked = true;
                                            }
                                        }
                                    })
                                    $scope.constants.sel_all = arr.length && (arr.length <= $scope.constants.choosed_shops.length);
                                    $scope.constants.listShop_popup = arr;
                                } else {
                                    $scope.constants.listShop = data.context;
                                }
                            }
                        }
                    })
                },
                // 选择校区
                chooseShop: function() {
                    $scope.constants.sel_all = false;
                    $scope.constants.choosed_shops = [];
                    $scope.ids = '';
                    $scope.detailShopList.map(function(item) {
                        $scope.ids += item.shopId + ',';
                    });
                    $scope.constants.list.map(function(item) {
                        $scope.ids += item.shopId + ',';
                    });
                    this.onReset();
                    openPopByDiv('选择校区', '.organ_course_list', '760px');
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
                // 添加套餐
                addPackagewin: function(type, fl) {
                    switch (type) {
                        case 0:
                            (fl ? $scope.constants.packageList_keshi_ : $scope.constants.packageList_keshi).push({ feeType: type });
                            break;
                        case 1:
                            (fl ? $scope.constants.packageList_xueqi_ : $scope.constants.packageList_xueqi).push({ feeType: type });
                            break;
                        case 2:
                            (fl ? $scope.constants.packageList_anyue_ : $scope.constants.packageList_anyue).push({ feeType: type });
                            break;
                    }
                },
                // 生成套餐数据
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
                operate: function(type, data, fl) {
                    switch (type) {
                        case 'general': //通用课
                            if (!fl && !$scope.orgTeacherShopRList.length) {
                                return layer.msg('请选择售卖校区', {
                                    zIndex: 19930113
                                });
                            }
                            $scope.constants.sel_all = false;
                            openPopByDiv('选择课程', '.organ_general_list', '760px');
                            if ($scope.before_add_edit || fl) { //编辑时选择通用课
                                $scope.constants.choosed_courses = angular.copy(fl ? $scope.courseCurrencies_ : $scope.courseCurrencies);
                                $scope.constants.pager = new Initpager('.M_box3_2', $scope.Fns.getgeneralList_single, 'organ_general_list_count');
                                if (fl) {
                                    $scope.orgTeacherShopRList = [{ shopId: $scope.shopChoosed.shopId }];
                                }
                            } else { //新增时选择通用课
                                $scope.constants.choosed_courses = angular.copy($scope.courseCurrencies);
                                $scope.constants.pager = new Initpager('.M_box3_2', $scope.Fns.getgeneralList, 'organ_general_list_count');
                            }
                            this.onReset(true)
                            break;
                        case 'setting': //套餐设置
                            $scope.fromEdit = fl; //添加售卖校区
                            openPopByDiv('新增套餐设置', '.organ_course_operate', '1060px');
                            $scope.before_add_edit = false;
                            $scope.courseCurrencies = [];
                            $scope.orgTeacherShopRList = [];
                            $scope.constants.packageList_keshi = [];
                            $scope.constants.packageList_xueqi = [];
                            $scope.constants.packageList_anyue = [];
                            break;
                        case 'setting_edit': //新增课程-单个编辑
                            openPopByDiv('编辑套餐设置', '.organ_course_operate', '1060px');
                            $scope.before_add_edit = true;
                            $scope.courseCurrencies = data.courseCurrencies ? angular.copy(data.courseCurrencies) : [];
                            $scope.orgTeacherShopRList = [{ shopId: data.shopId, shopShortName: data.shopShortName }];
                            $scope.constants.packageList_keshi = angular.copy(data.packages.packageList_keshi);
                            $scope.constants.packageList_xueqi = angular.copy(data.packages.packageList_xueqi);
                            $scope.constants.packageList_anyue = angular.copy(data.packages.packageList_anyue);
                            break;
                        case 'setting_confirm': //套餐确认
                            if (!$scope.orgTeacherShopRList.length) {
                                return layer.msg('请选择售卖校区', {
                                    zIndex: 19930113
                                });
                            }
                            if ($scope.constants.subParams.courseType == 1 && !$scope.courseCurrencies.length) {
                                return layer.msg('请选择通用课程', {
                                    zIndex: 19930113
                                });
                            }
                            $scope.constants.packageList_xueqi.map(function(item) { //学期名称赋值
                                $scope.constants.packageList.map(function(ceil) {
                                    if (item.schoolTermId == ceil.schoolTermId) {
                                        item.schoolTermName = ceil.schoolTermName
                                    }
                                })
                            })
                            if (this.isrepeat($scope.constants.packageList_keshi)) return;
                            if (this.isrepeat($scope.constants.packageList_xueqi, true)) return;
                            if (this.isrepeat($scope.constants.packageList_anyue)) return;

                            if ($scope.fromEdit) { //添加售卖校区，此步需直接发请求
                                $scope.constants.list = [];
                                $scope.orgTeacherShopRList.map(function(item) {
                                    $scope.constants.list.push({
                                        shopId: item.shopId,
                                        courseCurrencies: $scope.courseCurrencies,
                                        packages: {
                                            packageList_keshi: angular.copy($scope.constants.packageList_keshi),
                                            packageList_xueqi: angular.copy($scope.constants.packageList_xueqi),
                                            packageList_anyue: angular.copy($scope.constants.packageList_anyue)
                                        }
                                    })
                                })
                                this.sub(false, true);
                            } else {
                                if ($scope.before_add_edit) { //单个修改
                                    $scope.constants.list.map(function(item) {
                                        if (item.shopId == $scope.orgTeacherShopRList[0].shopId) {
                                            item.courseCurrencies = angular.copy($scope.courseCurrencies);
                                            item.courseCurrenciesName = arrToStr($scope.courseCurrencies, 'courseName');
                                            item.packages = {
                                                packageList_keshi: angular.copy($scope.constants.packageList_keshi),
                                                packageList_xueqi: angular.copy($scope.constants.packageList_xueqi),
                                                packageList_anyue: angular.copy($scope.constants.packageList_anyue)
                                            }
                                        }
                                    })
                                } else { //岗位设置多个增加
                                    $scope.orgTeacherShopRList.map(function(item) {
                                        $scope.constants.list.push({
                                            shopId: item.shopId,
                                            shopShortName: item.shopShortName,
                                            courseCurrencies: $scope.courseCurrencies,
                                            courseCurrenciesName: arrToStr($scope.courseCurrencies, 'courseName'),
                                            packages: {
                                                packageList_keshi: angular.copy($scope.constants.packageList_keshi),
                                                packageList_xueqi: angular.copy($scope.constants.packageList_xueqi),
                                                packageList_anyue: angular.copy($scope.constants.packageList_anyue)
                                            }
                                        })
                                    })
                                }
                                this.account_cancel();
                            }
                            break;
                    }
                },
                // 提交
                sub: function(fl, fl_) {
                    //fl_ 新增售卖校区特别处理
                    if (fl) { //编辑
                        var url = '/api/org/course/updateCourse';
                        var params = {
                            courseId: $scope.shopChoosed.courseId,
                            courseName: $scope.constants.subParams.courseName,
                            courseType: $scope.constants.subParams.courseType,
                            teachingMethod: $scope.constants.subParams.teachingMethod,
                            courseCurrencies: $scope.constants.subParams.courseType == 1 ? [] : undefined,
                            packages: $scope.Fns.getPackages($scope.constants.packageList_keshi_.concat($scope.constants.packageList_xueqi_).concat($scope.constants.packageList_anyue_))
                        };
                        if ($scope.constants.subParams.courseType == 1) {
                            if (!$scope.courseCurrencies_.length) {
                                return layer.msg('请选择通用课程', {
                                    zIndex: 19930113
                                });
                            }
                            $scope.courseCurrencies_.map(function(item) {
                                params.courseCurrencies.push({
                                    currencyCourseId: item.currencyCourseId ? item.currencyCourseId : item.courseId
                                })
                            })
                        }

                    } else { //新增
                        var url = '/api/org/course/addOrgCourse';
                        var params = {
                            courseName: fl_ ? $scope.constants.subParams.courseName_ : $scope.constants.subParams.courseName,
                            courseType: $scope.constants.subParams.courseType,
                            teachingMethod: $scope.constants.subParams.teachingMethod,
                            courseList: []
                        };
                        if (!$scope.constants.list.length) {
                            return layer.msg('请选择售卖校区', {
                                zIndex: 19930113
                            });
                        }
                        $scope.constants.list.map(function(item) {
                            var arr = [];
                            item.courseCurrencies.map(function(ceil) {
                                arr.push({
                                    course: {
                                        courseName: ceil.courseName,
                                        courseType: ceil.courseType,
                                        teachingMethod: ceil.teachingMethod,
                                    }
                                })
                            })
                            params.courseList.push({
                                courseCurrencies: arr.length ? arr : undefined,
                                shopId: item.shopId,
                                packages: $scope.Fns.getPackages(item.packages.packageList_keshi.concat(item.packages.packageList_xueqi).concat(item.packages.packageList_anyue))
                            })
                        })
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: angular.toJson(params),
                        success: function(res) {
                            if (res.status == "200") {
                                if (fl_) {
                                    $scope.constants.list = [];
                                    $scope.Fns.account_cancel();
                                    $scope.Fns.getDetailShop();
                                } else {
                                    if (fl) {
                                        if (params.courseName !== $scope.constants.subParams.courseName_) {
                                            if ($scope.detailShopList.length > 1) { //多个校区
                                                var isdelete = layer.confirm('课程已变更，是否查看该课程?', {
                                                    title: "提示信息",
                                                    skin: 'newlayerui layeruiCenter',
                                                    closeBtn: 1,
                                                    offset: '30px',
                                                    move: false,
                                                    area: '560px',
                                                    zIndex: 19930113,
                                                    btn: ['是', '否'] //按钮
                                                }, function() {
                                                    //刷新改的课程
                                                    $scope.detailShopList = [];
                                                    $scope.Fns.getDetailShop({
                                                        teachingMethod: params.teachingMethod,
                                                        courseName: params.courseName,
                                                        courseType: params.courseType
                                                    });
                                                    layer.close(isdelete);
                                                }, function() {
                                                    //刷旧的课程
                                                    $scope.detailShopList = [];
                                                    $scope.Fns.getDetailShop();
                                                    layer.close(isdelete);
                                                })
                                            } else { //单校区
                                                layer.msg('保存成功', {
                                                    zIndex: 19930113
                                                });
                                                //刷新改的课程
                                                $scope.detailShopList = [];
                                                $scope.Fns.getDetailShop({
                                                    teachingMethod: params.teachingMethod,
                                                    courseName: params.courseName,
                                                    courseType: params.courseType
                                                });
                                            }

                                        } else {
                                            layer.msg('保存成功', {
                                                zIndex: 19930113
                                            });
                                        }
                                    } else {
                                        $scope.return();
                                    }

                                }
                            }
                        }
                    });
                },
                getDetailShop: function(val) {
                    $.hello({
                        url: CONFIG.URL + "/api/org/course/listCourseShop",
                        type: "get",
                        data: {
                            teachingMethod: val ? val.teachingMethod : $scope.props.data.teachingMethod,
                            courseName: val ? val.courseName : $scope.props.data.courseName,
                            courseType: val ? val.courseType : $scope.props.data.courseType
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.detailShopList = data.context;
                                if (data.context.length) {
                                    $scope.Fns.shopClick(data.context[0])
                                } else {
                                    var isDelect = layer.confirm('该课程已被删除', {
                                        zIndex: 19930113,
                                        title: "确认信息",
                                        skin: 'newlayerui layeruiCenter',
                                        closeBtn: 0,
                                        offset: '50px',
                                        move: false,
                                        btn: ['我知道了'] //按钮
                                    }, function() {
                                        layer.close(isDelect);
                                        $scope.return();
                                    })
                                    $scope.constants.subParams = {};
                                }
                            }
                        }
                    })
                },
                isrepeat: function(arr, fl) {
                    var obj = {},
                        str = "";
                    arr.map(function(item) {
                        if (obj[item.packageName + (fl ? '_' + item.schoolTermId : '')]) {
                            str += '套餐名“' + item.packageName + '”重复！';
                        } else {
                            obj[item.packageName + (fl ? '_' + item.schoolTermId : '')] = true;
                        }
                    })
                    if (str) {
                        layer.msg(str);
                    }
                    return str;
                },
                shopClick: function(data) {
                    $scope.shopChoosed = data;
                    $.hello({
                        url: CONFIG.URL + "/api/org/course/getOrgCourseDetail",
                        type: "get",
                        data: {
                            courseId: data.courseId
                        },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.packageList_keshi_ = [];
                                $scope.constants.packageList_xueqi_ = [];
                                $scope.constants.packageList_anyue_ = [];
                                if (data.context.packages && data.context.packages.length) {
                                    data.context.packages.map(function(item) {
                                        if (item.feeType == 0) {
                                            $scope.constants.packageList_keshi_.push(item)
                                        }
                                        if (item.feeType == 1) {
                                            item.schoolTermId += '';
                                            $scope.constants.packageList_xueqi_.push(item)
                                        }
                                        if (item.feeType == 2) {
                                            $scope.constants.packageList_anyue_.push(item)
                                        }
                                    })
                                }
                                $scope.constants.subParams = data.context;
                                $scope.constants.subParams.courseName_ = data.context.courseName; //是否修改课程
                                $scope.courseCurrencies_ = data.context.courseCurrencies
                            }
                        }
                    })
                }
            }
            $scope.constants = {
                list: [],
                screen: {}
            };
            if ($scope.props.type == 1) { //新增
                $scope.detailShopList = [];
                $scope.constants.subParams = {
                    courseType: 0,
                    teachingMethod: 2,
                    courseList: []
                }
            } else if ($scope.props.type == 2) { //编辑
                $scope.detailShopList = [];
                $scope.Fns.getDetailShop();
            }
            $scope.$apply();
            $scope.Fns.getPackageList();
        }
    }
});