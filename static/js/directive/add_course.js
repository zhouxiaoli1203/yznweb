define(['laydate', 'courseAndClass_sel'], function(laydate) {
    creatPopup({
        el: 'coursePop',
        openPopupFn: 'openAddCourse',
        htmlUrl: './templates/popup/add_course.html',
        controllerFn: function ($scope, props, SERVICE, $timeout, $state, $sce, $rootScope) {

            console.log(props);
            $scope.constants = {
                isError: false,
                props: props,
                copyInfo: props.item,
                navigation_bar_bgm: props.tab ? props.tab : 1,
                addcourseParams: {},
                //              colors:["#FF595E","#F68657","#DF6B12","#FFC8A6","#F5B352","#8CD790","#C9E268","#4DE0C4","#00BEED","#0A7AED","#6B48ED","#9E84F4","#FA60E6","#FF8282"],
                colors: ["#FF595D", "#F68657", "#F14F1B", "#FFC8A7", "#F5B352", "#8CD78F", "#C9E168", "#4CE0C4", "#00BEEC", "#0A7AEC", "#6B48ED", "#9D84F4", "#FA5FE6", "#FF8182"],
                addcourseTypeBingreback: [ // / 通用课头部
                    {
                        'name': '课程名称',
                        'width': '75%',
                    }, {
                        'name': '操作',
                        'width': '25%',
                        'align': 'center'
                    }
                ],
                addcourseTitleback: [ //上课主题表头
                    {
                        'name': '上课主题',
                        'width': '75%',
                    }, {
                        'name': '操作',
                        'width': '25%',
                        'align': 'center'
                    }
                ],
                addcourseBingreback: [ // / 学杂绑定返回表格头部
                    {
                        'name': '学杂名称'
                    },
                    // {
                    //     'name': '单价',
                    //     'width': '25%',
                    //     'align': 'right'
                    // }, {
                    //     'name': '数量',
                    //     'width': '25%',
                    //     'align': 'center'
                    // },
                    {
                        'name': '操作',
                        'width': '100',
                        'align': 'center'
                    }
                ],
                addPackage_1: [{
                        'name': '套餐名称',
                        'width': '24%'
                    },
                    {
                        'name': '购买课时',
                        'width': '19%'
                    }, {
                        'name': '赠送课时',
                        'width': '19%'
                    }, {
                        'name': '课程价格',
                        'width': '19%'
                    }, {
                        'name': '单课价',
                        'width': '19%',
                        'align': 'center'
                    }, {
                        'name': '操作',
                        'width': '100px',
                        'align': 'center'
                    }

                ],
                addPackage_2: [{
                        'name': '套餐名称',
                        'width': '24%'
                    },
                    {
                        'name': '学期',
                        'width': '100px'
                    }, {
                        'name': '购买课时',
                        'width': '19%'
                    }, {
                        'name': '赠送课时',
                        'width': '19%'
                    }, {
                        'name': '课程价格',
                        'width': '19%'
                    }, {
                        'name': '单课价',
                        'width': '19%',
                        'align': 'center'
                    }, {
                        'name': '操作',
                        'width': '100px',
                        'align': 'center'
                    }
                ],
                addPackage_3: [{
                        'name': '套餐名称',
                        'width': '24%'
                    },
                    {
                        'name': '购买月数',
                        'width': '19%'
                    }, {
                        'name': '赠送天数',
                        'width': '19%'
                    }, {
                        'name': '课程价格',
                        'width': '19%'
                    }, {
                        'name': '单课价',
                        'width': '19%',
                        'align': 'center'
                    }, {
                        'name': '操作',
                        'width': '100px',
                        'align': 'center'
                    }
                ],
                packageThead: [{
                        'name': '套餐类型',
                        'width': '8%',
                        'align': 'center'
                    },
                    {
                        'name': '套餐名称',
                        'width': '20%'
                    }, {
                        'name': '购买',
                        'width': '12%'
                    }, {
                        'name': '赠送',
                        'width': '12%'
                    }, {
                        'name': '课程价格',
                        'width': '12%',
                    }, {
                        'name': '单课价',
                        'width': '12%',
                    }, {
                        'name': '操作',
                        'width': '100px',
                        'align': 'center'
                    }
                ],
                courseTitleName: {
                    name: '',
                    index: null,
                },
                listSchoolObj: {},
                courseTypeList: [], // 通用课信息
                courseTitleList: [], //上课主题
                MiscellaneousList: [], //学杂列表
                packageList_keshi: [], //套餐列表
                packageList_xueqi: [], //套餐列表
                packageList_anyue: [], //套餐列表
            };
            $scope.Fns = {
                // 获取课程分类下拉
                getCourseType: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/getCourseType",
                        type: "get",
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.CourseTypes = data.context;
                                //                              if ($scope.constants.addorUpdate == "addCourse") {
                                //                                  $scope.constants.addcourseParams.courseTypeId = $scope.constants.CourseTypes[0].courseTypeId;
                                //                              }

                            }
                        }
                    })
                },
                confirmNext: function(n) {
                    if ($scope.constants.addcourseParams.courseType == "1" && $scope.constants.courseTypeList.length <= 0) {
                        return layer.msg("请选择通用范围！");
                    }
                    console.log($scope.constants.addcourseParams);
                    $scope.constants.navigation_bar_bgm = n;
                },


                //通用范围调用课程筛选器
                addCourseOpenCoursePop: function() {
                    $rootScope.yznOpenPopUp($scope, 'course-sel', 'choseCourse', '760px', { name: 'course', type: 'checkbox', courseType: '0', teachingMethod: '2', 'callBackName': '新增课程-通用课' });
                },
                //选择通用课
                deter_courseType: function(data) {
                    if (data) {
                        angular.forEach(data, function(v) {
                            var id = v.courseId;
                            var isRepeat = false;
                            if ($scope.constants.courseTypeList.length > 0) {
                                angular.forEach($scope.constants.courseTypeList, function(k) {
                                    if (id == k.course.courseId) {
                                        isRepeat = true;
                                    }
                                });
                                if (!isRepeat) {
                                    $scope.constants.courseTypeList.push({ "course": v });
                                }
                            } else {
                                $scope.constants.courseTypeList.push({ "course": v });
                            }
                        });
                    }
                    console.log($scope.constants.courseTypeList);
                },
                // 绑定后删除通用课
                delectselectCourse: function(index, list) {
                    list.splice(index, 1);
                },


                //上课主题弹框
                addCourseTitlewin: function() {
                    $scope.constants.courseTitleName.name = '';
                    $scope.constants.courseTitleName.index = null;
                    openPopByDiv('新增上课主题', '.addOreditCourseTl_', '560px');
                },
                //确认上课主题
                deter_courseTheme: function() {
                    var d_ = { 'courseThemeName': $scope.constants.courseTitleName.name }
                    if ($scope.constants.courseTitleName.index || $scope.constants.courseTitleName.index == 0) {
                        $scope.constants.courseTitleList[$scope.constants.courseTitleName.index] = { courseTheme: d_ };
                    } else {
                        $scope.constants.courseTitleList.push({ courseTheme: d_ });
                    }
                    layer.close(dialog);
                },
                //编辑或者删除上课主题
                operateCourseTit: function(ind, type) {
                    switch (type) {
                        case 1: //编辑主题
                            $scope.constants.courseTitleName.index = ind;
                            $scope.constants.courseTitleName.name = $scope.constants.courseTitleList[ind].courseTheme.courseThemeName;
                            openPopByDiv('编辑上课主题', '.addOreditCourseTl_', '560px');
                            break;
                        case 2: //删除主题
                            $scope.constants.courseTitleList.splice(ind, 1);
                            break;
                        case 3: //关闭弹框
                            layer.close(dialog);
                            break;
                    }
                },


                //学杂打开弹框
                addGoodswin: function() {
                    $rootScope.yznOpenPopUp($scope, 'course-sel', 'choseGoods', '760px', { name: 'goods', type: 'checkbox', callBackName: '新增课程-学杂', item: {} });
                },
                // 绑定学杂弹框确认退出
                deter_goodsData: function(data) {

                    if (data) {
                        angular.forEach(data, function(v) {
                            var id = v.goodsId;
                            var isRepeat = false;
                            if ($scope.constants.MiscellaneousList.length > 0) {
                                angular.forEach($scope.constants.MiscellaneousList, function(k) {
                                    if (id == k.goodsId) {
                                        isRepeat = true;
                                    }
                                });
                                if (!isRepeat) {
                                    v.goodsNumber = 1;
                                    $scope.constants.MiscellaneousList.push(v);
                                }
                            } else {
                                v.goodsNumber = 1;
                                $scope.constants.MiscellaneousList.push(v);
                            }
                        });
                    }

                },

                // 绑定后删除学杂
                delectselectEd: function(index) {
                    $scope.constants.MiscellaneousList.splice(index, 1);
                    $scope.isallDel = false;
                    angular.forEach($scope.constants.MiscellaneousList, function(item) {
                        if (item.hasChecked || item.hasChecked == undefined) {
                            $scope.isallDel = true;
                        }
                    });
                },
                ageAuto: function() { //计算初始年龄大小
                    if (!$scope.constants.addcourseParams.endAge || !$scope.constants.addcourseParams.beginAge) return;
                    if (JSON.parse($scope.constants.addcourseParams.endAge) < JSON.parse($scope.constants.addcourseParams.beginAge)) {
                        $scope.constants.addcourseParams.endAge = $scope.constants.addcourseParams.beginAge;
                    }
                },
                //输入课程购买课和购买月数失焦状态时
                inputPackageTime: function(x) {
                    if (x.packageTime == 0) {
                        x.packagePrice = 0;
                    }
                },
                //输入购买课时和输入课程价格构建套餐名称
                creatPackageName: function(type, ipt, item) {
                    switch (ipt) {
                        case 1:
                            if (type == 0 || type == 1) {
                                item.packageName = (item.packageTime ? (item.packageTime + "课时") : "") + (item.packagePrice ? (item.packagePrice + "元") : "");
                            } else {
                                item.packageName = (item.packageTime ? (item.packageTime + "个月") : "") + (item.packagePrice ? (item.packagePrice + "元") : "");
                            }
                            break;
                        case 2:
                            if (type == 0 || type == 1) {
                                item.packageName = item.packageTime ? (item.packageTime + "课时") : "";
                            } else {
                                item.packageName = item.packageTime ? (item.packageTime + "个月") : "";
                            }
                            item.packageName = item.packageName + (item.packagePrice ? (item.packagePrice + "元") : "");
                            break;
                        default:
                            break;
                    }
                },
                //获取学期列表
                getPackageList: function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                        type: "get",
                        data: { pageType: "0" },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.packageList = data.context;
                                //学期被删无法匹配需重新选择学期
                                angular.forEach(data.context, function(item) {
                                    $scope.constants.listSchoolObj[item.schoolTermId] = item.schoolTermId;
                                })
                                $scope.Fns.init(); //页面初始化处理
                            }
                        }
                    });
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
                // 套餐删除
                removePackageItem: function(index, total) {
                    if (total) {
                        if (total[index].packageId) {
                            total[index].packageStatus = '0';
                        }
                        total.splice(index, 1)
                    }
                },
                addCourse_confirm: function() {
                    $scope.constants.isError = false;
                    var that = this;
                    var url;
                    var param = {};
                    param = {
                        courseType: $scope.constants.addcourseParams.courseType,
                        courseName: $scope.constants.addcourseParams.courseName,
                        courseTypeId: $scope.constants.addcourseParams.courseTypeId,
                        teachingMethod: $scope.constants.addcourseParams.teachingMethod,
                        beginAge: $scope.constants.addcourseParams.beginAge,
                        endAge: $scope.constants.addcourseParams.endAge,
                        courseGoodsRS: that.getGoods(),
                    }
                    if ($scope.constants.addcourseParams.courseType == 1) { ///////通用课
                        param["courseCurrencies"] = that.getCourseCurrencies();
                        param["packages"] = that.getPackages($scope.constants.packageList_keshi.concat($scope.constants.packageList_xueqi).concat($scope.constants.packageList_anyue));
                    } else { /////////标准课
                        param["color"] = $scope.constants.addcourseParams.color;
                        param["absentDeleteTimeStatus"] = $scope.constants.addcourseParams.absentDeleteTimeStatus ? "1" : "0";
                        param["leaveDeleteTimeStatus"] = $scope.constants.addcourseParams.leaveDeleteTimeStatus ? "1" : "0";
                        param["displayStatus"] = $scope.constants.addcourseParams.displayStatus ? "1" : "0";
                        param["reviewStatus"] = $scope.constants.addcourseParams.reviewStatus ? "1" : "0";
                        param["taskStatus"] = $scope.constants.addcourseParams.taskStatus ? "1" : "0";
                        param["taskLookStatus"] = $scope.constants.addcourseParams.taskLookStatus ? "1" : "0";
                        param["annexStatus"] = $scope.constants.addcourseParams.annexStatus ? "1" : "0";
                        param["courseThemeRS"] = that.getCourseThemeRS();
                        param["packages"] = that.getPackages($scope.constants.packageList_keshi.concat($scope.constants.packageList_xueqi).concat($scope.constants.packageList_anyue));
                    }
                    if ($scope.constants.isError) {
                        return;
                    }
                    if ($scope.constants.addorUpdate == "addCourse" || $scope.constants.addorUpdate == "copyCourse") {
                        url = "addCourse";
                    } else {
                        url = "updateCourse";
                        param["courseId"] = $scope.constants.addcourseParams.courseId;
                    }
                    console.log(param);
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/" + url,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == "200") {
                                if (SERVICE.ADDCOURSE.FROMPAGE[props.callBackName]) {
                                    SERVICE.ADDCOURSE.FROMPAGE[props.callBackName](data);
                                };
                                if ($scope.constants.addorUpdate == "updateCourse") {
                                    $scope.$emit("courseChange", "edit");
                                } else {
                                    $scope.$emit("courseChange");
                                }
                                $scope.closePopup('course_popup');
                            }
                        }
                    })
                },
                getCourseCurrencies: function() {
                    var arr = [];
                    angular.forEach($scope.constants.courseTypeList, function(v) {
                        arr.push({ currencyCourseId: v.course.courseId });
                    });
                    return arr.length > 0 ? arr : [];
                },
                getGoods: function() {
                    var arr = [];
                    angular.forEach($scope.constants.MiscellaneousList, function(v) {
                        arr.push({
                            goodsId: v.goodsId,
                            // goodsNumber: (v.goodsNumber * 1).toFixed(2)
                        });
                    });
                    return arr.length > 0 ? arr : [];
                },
                getCourseThemeRS: function() {
                    var arr = [];
                    angular.forEach($scope.constants.courseTitleList, function(v) {
                        arr.push({
                            courseThemeRId: v.courseTheme.courseThemeRId ? v.courseTheme.courseThemeRId : undefined,
                            courseThemeName: v.courseTheme.courseThemeName,
                        });
                    });
                    return arr.length > 0 ? arr : [];
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
                init: function() {
                    //初始化处理
                    if ($scope.constants.props.addOrEdit == "add") {
                        $scope.constants.addorUpdate = "addCourse";
                        $scope.constants.addcourseParams = {
                            courseName: "",
                            color: '#F68657',
                            teachingMethod: "2",
                            courseType: 0,
                            absentDeleteTimeStatus: false,
                            leaveDeleteTimeStatus: false,
                            displayStatus: true,
                            reviewStatus: true,
                            taskStatus: true,
                            taskLookStatus: false,
                            annexStatus: true,
                        };
                        $scope.constants.packageList_keshi = []; //套餐列表
                        $scope.constants.packageList_xueqi = []; //套餐列表
                        $scope.constants.packageList_anyue = []; //套餐列表
                    } else {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/course/getCourseDetail",
                            type: "get",
                            data: { courseId: $scope.constants.copyInfo ? $scope.constants.copyInfo.courseId : undefined },
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.constants.copyInfo = data.context;
                                    $scope.constants.addcourseParams = angular.copy($scope.constants.copyInfo);
                                    $scope.constants.addcourseParams["absentDeleteTimeStatus"] = $scope.constants.addcourseParams.absentDeleteTimeStatus == "1" ? true : false;
                                    $scope.constants.addcourseParams["leaveDeleteTimeStatus"] = $scope.constants.addcourseParams.leaveDeleteTimeStatus == "1" ? true : false;
                                    $scope.constants.addcourseParams["displayStatus"] = $scope.constants.addcourseParams.displayStatus == "1" ? true : false;
                                    $scope.constants.addcourseParams["reviewStatus"] = $scope.constants.addcourseParams.reviewStatus == "1" ? true : false;
                                    $scope.constants.addcourseParams["taskStatus"] = $scope.constants.addcourseParams.taskStatus == "1" ? true : false;
                                    $scope.constants.addcourseParams["taskLookStatus"] = $scope.constants.addcourseParams.taskLookStatus == "1" ? true : false;
                                    $scope.constants.addcourseParams["annexStatus"] = $scope.constants.addcourseParams.annexStatus == "1" ? true : false;
                                    $scope.constants.MiscellaneousList = $scope.constants.addcourseParams.courseGoodsRS; //学杂
                                    $scope.constants.courseTypeList = $scope.constants.addcourseParams.courseCurrencies ? $scope.constants.addcourseParams.courseCurrencies : []; //通用范围
                                    $scope.constants.courseTitleList = $scope.constants.addcourseParams.courseThemeRS; //上课主题
                                    $scope.constants.packageList_keshi = [];
                                    $scope.constants.packageList_xueqi = [];
                                    $scope.constants.packageList_anyue = [];
                                    angular.forEach($scope.constants.addcourseParams.packages, function(v) {
                                        if (v.feeType == 0) {
                                            $scope.constants.packageList_keshi.push(v);
                                        }
                                        if (v.feeType == 1) {
                                            //去除被删除学期
                                            if ($scope.constants.listSchoolObj[v.schoolTermId]) {
                                                v.schoolTermId = "" + v.schoolTermId;
                                            } else {
                                                v.schoolTermId = ""
                                            }
                                            $scope.constants.packageList_xueqi.push(v);
                                        }
                                        if (v.feeType == 2) {
                                            v.packageTime = parseInt(v.packageTime);
                                            $scope.constants.packageList_anyue.push(v);
                                        }

                                    });
                                    if ($scope.constants.props.addOrEdit == "copy") {
                                        $scope.constants.addorUpdate = "copyCourse";
                                        $scope.constants.addcourseParams.courseName = "";
                                    } else {
                                        $scope.constants.addorUpdate = "updateCourse";
                                    }
                                }
                            }
                        });
                    }
                }
            };



            $scope.Fns.getCourseType(); //获取课程分类列表
            $scope.Fns.getPackageList(); //获取学期列表
            SERVICE.COURSEANDCLASS.COURSE['新增课程-通用课'] = $scope.Fns.deter_courseType; //确定已选通用课
            SERVICE.COURSEANDCLASS.GOODS['新增课程-学杂'] = $scope.Fns.deter_goodsData; //确定已选学杂
        }
    })
})