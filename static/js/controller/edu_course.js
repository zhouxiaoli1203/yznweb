define(["laydate", "pagination", "mySelect","directives", "remarkPop", "datePicker", "classPop", 'courseAndClass_sel', 'coursePackage', 'photoPop', 'clockPop', 'coursePop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', "SERVICE", '$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout) {
        $scope.constants = {
            name: "",
            pagerRender: false,
            Semester: true,
            start: 0,
            fromCourse: false,
            //          isOpenPop:false,
            //          storageOpen:getFunctionStatus(0x0004),
            currentSem: [],
            oldSem: [],
            kindSearchData: {
                className: sessionStorage.getItem("coursePlace") ? sessionStorage.getItem("coursePlace") : "课程名称"
            },
            // 绑定学杂 搜索框
            kindSearchxueza: {
                className: "学杂名称"
            },
            selectInfoNameId: 'className',
            // 课程管理tapid
            tabType: sessionStorage.getItem("tabType") ? JSON.parse(sessionStorage.getItem("tabType")) : 1,
            // 课程tapid
            studentTabs: 5,
            // 课程表头
            courseSet: [{
                'name': '课程名称',
                'width': '15%',
                'issort': true,
                'sort': 'asc',
            }, {
                'name': '类型',
                'width': '14%',
            }, {
                'name': '上课方式',
                'width': '14%',
            }, {
                'name': '适龄',
                'width': '14%',
                'align': 'center'
            }, {
                'name': '状态',
                'width': '14%',
                'align': 'center'
            }, {
                'name': '操作',
                'width': '180',
                'align': 'center'
            }],
            addcoursePackage: [{
                'name': '课程包',
                'width': '25%',
                'issort': true,
                'sort': 'asc',
            }, {
                'name': '课程数量',
                'width': '15%',
                'align': 'right'
            }, {
                'name': '学杂数量',
                'width': '15%',
                'align': 'right'
            }, {
                'name': '课程包金额',
                'width': '25%',
                'align': 'right'
            }, {
                'name': '操作',
                'align': 'center'
            }],
            //学期信息
            packageInfo: {},
            //课程信息
            tableList: null,

            // 学杂表头
            Miscellaneous: [{
                'name': '学杂名称',
                'width': '20%',
                'issort': true,
                'sort': 'asc',
            }, {
                'name': '规格',
                'width': '35%',
                'align': 'left'
            }, {
                'name': '类型',
                'width': '20%',
                'align': 'center'
            }, {
                'name': '状态',
                'width': '15%',
                'align': 'center'
            }],
            courseTitleName: {
                name: '',
                index: null,
            },
            // 学杂信息
            miscellaneousList: [],
            // 学杂类型
            goodsType: false,
            goodsType1: false,
            // 课程类型
            courseType: false,
            courseType1: false,
            // 启用条件
            enableType: true,
            enableType1: false,
            // 收费类型
            chargeType: false,
            chargeType1: false,
            chargeType2: false,
            // 课程对比类型
            compareType: false,
            compareType1: false,
            // search参数
            searchName: "",
            currentMiscellaneous: {},
            // 修改学杂表头
            Miscellaneous_edit: [{
                'name': '学杂名称',
                'width': '35%',
            }, {
                'name': '单价',
                'width': '30%',
            }, {
                'name': '购买数量',
                'width': '25%',
            }, {
                'name': '操作',
                'width': '10%',
            }],
            // 课程包表头
            coursePkg: [{
                'name': '课程包',
                'width': '16%',
                'issort': true,
                'sort': 'asc',
            }, {
                'name': '课程数量',
                'width': '6%',
            }, {
                'name': '学杂数量',
                'width': '12%',
            }, {
                'name': '课程包金额',
                'width': '10%',
            }, {
                'name': '状态',
                'align': 'right'
            }],
            eachPage: localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10,
            searchType: "courseName",
            orderName: "course_name",
            orderTyp: "asc",
        };
        var re_dialog;
        $scope.Fns = {
            goCommonPop: function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            },
            // 弹窗(弹窗中用到laydate 需要在成功回调中做处理)
            Bombbox: function($locking, title, width) {
                dialog = layer.open({
                    type: 1,
                    title: title,
                    skin: 'layerui', //样式类名
                    closeBtn: 1, //不显示关闭按钮
                    move: false,
                    anim: 0,
                    area: width,
                    offset: '30px',
                    shadeClose: false, //开启遮罩关闭
                    content: $('.' + $locking)
                })
            },
            courseBombbox: function($locking, title, width) {
                layer.open({
                    type: 1,
                    title: title,
                    skin: 'layerui', //样式类名
                    closeBtn: 1, //不显示关闭按钮
                    move: false,
                    anim: 0,
                    area: width,
                    offset: '30px',
                    shadeClose: false, //开启遮罩关闭
                    content: $('.' + $locking)
                })
            },
            // 修改筛选条件
            changesType: function(val1, flag, val2, val3) {
                if (flag) {
                    if ($scope.constants[val1]) {
                        $scope.constants[val1] = true;
                        $scope.constants[val2] = false;
                    }
                } else {
                    if ($scope.constants[val2]) {
                        $scope.constants[val2] = true;
                        $scope.constants[val1] = false;
                    }
                }
                this.init();
            },
            // 转化为0,1,-1
            changetoServer: function(val1, val2, flag, val3) {
                // }
                if (!val3) {
                    if (flag) {
                        if (!val1 && !val2) {
                            return '-1';
                        }
                    } else if (!val1 && !val2) {
                        return '';
                    }
                    return val1 ? '1' : '0';
                } else {
                    if (flag) {
                        if (!val1 && !val2 && !val3) {
                            return '-1';
                        }
                    } else if (!val1 && !val2 && !val3) {
                        return '';
                    }
                    return val1 ? '1' : val2 ? '0' : '2';
                }
            },
            // 初始化筛选项
            initCondition: function() {
                $scope.constants.goodsType = false;
                $scope.constants.goodsType1 = false;
                $scope.constants.courseType = false;
                $scope.constants.courseType1 = false;
                $scope.constants.enableType = true;
                $scope.constants.enableType1 = false;
                $scope.constants.chargeType = false;
                $scope.constants.chargeType1 = false;
                $scope.constants.chargeType2 = false;
                $scope.constants.compareType = false;
                $scope.constants.compareType1 = false;
                $scope.constants.chargeStandardId = "";
                $scope.constants.likeName = "";
                $scope.kindSearchOnreset(); //调取app重置方法
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                this.init();
            },
            goViewClass: function(d) {
                this.closePop();
                setTimeout(function() {
                    $state.go('edu_class', { 'screenValue': { name: 'course_pop', type: '', value: d } });
                })
            },
            // 关闭当前diglog
            closePop: function(value) {
                layer.close(value || dialog);
            },
            // tabs切换
            switchcourseNav: function(n) {
                $scope.constants.start = "0";
                if (n < 5) {
                    $scope.constants.tabType = n;
                    switch (n) {
                        case 1:
                            $scope.constants.orderName = "course_name";
                            $scope.constants.kindSearchData.className = '课程名称';
                            break;
                        case 3:
                            $scope.constants.orderName = "goods_name";
                            $scope.constants.kindSearchData.className = '学杂名称';
                            break;
                        case 4:
                            $scope.constants.orderName = "course_package_name";
                            $scope.constants.kindSearchData.className = '课程包';
                            break;
                        default:
                            // 课程包内容
                    }
                    this.initCondition();
                    // 保存当前tab以及input placeholder
                    sessionStorage.setItem("tabType", n);
                    sessionStorage.setItem("coursePlace", $scope.constants.kindSearchData.className);
                }
                console.log($scope.constants.tabType)
            },
            sortCllict: function(data) {
                var that = this;
                console.log(data.sort + '--');
                $scope.constants.orderTyp = data.sort;
                $scope.constants.orderName = "course_name";
                that.init();
            },
            sortCllict3: function(data) {
                var that = this;
                console.log(data.sort + '--');
                $scope.constants.orderTyp = data.sort;
                $scope.constants.orderName = "goods_name";
                that.init();
            },
            sortCllict4: function(data) {
                var that = this;
                console.log(data.sort + '--');
                $scope.constants.orderTyp = data.sort;
                $scope.constants.orderName = "course_package_name";
                that.init();
            },
            // 搜索条件检索
            Enterkeyup: function(data) {
                $scope.constants.likeName = data ? data.value : '';
                this.init();
            },
            // ng-repeat结束触发渲染 laydate
            renderFinish: function(data) {
                var aa = $(data.wrapper + ' .searchTimeforcharge');
                for (var i = 0; i < aa.length; i++) {
                    (function(i) {
                        laydate.render({
                            elem: aa[i], //指定元素
                            range: '到',
                            format: "yyyy-MM-dd",
                            isRange: false,
                            done: function(value, date, endDate) {

                                var a = value.substring(0, 4);
                                var c = '';

                                var b = parseInt(value.substring(5, 7));
                                if (b >= 2 && b <= 5) {
                                    c = "春季";
                                }
                                if (b >= 6 && b <= 8) {
                                    c = "暑期";
                                }
                                if (b >= 9 && b <= 12) {
                                    c = "秋季";
                                }
                                if (b == 1) {
                                    c = "寒假";
                                }
                                if (data.parentdata.indexOf('.') == -1) {
                                    $scope.constants[data.parentdata][i].packageName = a + c;
                                    $scope.constants[data.parentdata][i].alltime = date.year + '-' + changeTime(date.month) + '-' + changeTime(date.date) + ' 00:00:00' + ' 到 ' + endDate.year + '-' + changeTime(endDate.month) + '-' + changeTime(endDate.date) + ' 00:00:00';
                                } else {
                                    var d = data.parentdata.split('.')[0];
                                    var e = data.parentdata.split('.')[1];
                                    $scope.constants[d][e][i].packageName = a + c;
                                    $scope.constants[d][e][i].alltime = date.year + '-' + changeTime(date.month) + '-' + changeTime(date.date) + ' 00:00:00' + ' 到 ' + endDate.year + '-' + changeTime(endDate.month) + '-' + changeTime(endDate.date) + ' 00:00:00';
                                }
                                // 位数为个位数加 '0'
                                function changeTime(date) {
                                    if (date < 10) {
                                        return '0' + date;
                                    }
                                    return date;
                                }

                                $scope.$apply();
                            }
                        });
                    })(i);

                }
            },

            // 新增&&编辑课程窗口
            addCoursewin: function(flag, x) {
                if (flag) {
                    window.$rootScope.yznOpenPopUp($scope, "course-pop", "course_popup", "1060px", { page: "course", addOrEdit: "edit", tab: 1, item: x });
                } else {
                    window.$rootScope.yznOpenPopUp($scope, "course-pop", "course_popup", "1060px", { page: "course", addOrEdit: "add", tab: 1, item: {} });
                }
            },

            // 更新课程状态
            updateCourse: function(x) {
                //              $scope.constants.start = "0";
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/updateCourse",
                    type: "post",
                    data: JSON.stringify({ 'courseId': x.courseId, 'courseStatus': x.courseStatus == 0 ? 1 : 0 }),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.constants.pagerRender = false;
                            $scope.constants.start = ($scope.constants.totalNum - $scope.constants.start) == 1 ? ($scope.constants.start - $scope.constants.eachPage) : $scope.constants.start;
                            that.getTableList($scope.constants.start);
                        }
                    }
                })
            },
            // 获取课程列表首页
            getTableList: function(start) {
                var param = {
                    'pageType': 1,
                    'start': start,
                    'count': $scope.constants.eachPage,
                    'searchType': $scope.constants.searchType,
                    'searchName': $scope.constants.likeName,
                    'warnTimeStatus': $scope.constants.warnTimeStatus,
                    'excludedIds': $scope.constants.excludedIds,
                    'studentId': $scope.constants.studentId,
                    'courseTypeId': $scope.constants.courseTypeId,
                    'chargeStandardId': $scope.constants.chargeStandardId,
                    // 启用状态
                    'courseStatus': $scope.Fns.changetoServer($scope.constants.enableType, $scope.constants.enableType1, true),
                    'courseType': $scope.constants.courseType ? "0" : $scope.constants.courseType1 ? "1" : undefined,
                    'teachingMethod': $scope.constants.compareType ? "1" : $scope.constants.compareType1 ? "2" : undefined,
                    'chargeStandardStatus': 1,
                    'orderTyp': $scope.constants.orderTyp,
                    'orderName': $scope.constants.orderName,
                };
                if (!$scope.constants.orderTyp) {
                    param["orderTyp"] = undefined;
                    param["orderName"] = undefined;
                }
                for (var i in param) {
                    if (param[i] === '' || param[i] == undefined) {
                        delete param[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCoursesList",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.constants.tableList = data.context.items;
                            $scope.Fns.renderPager(data.context.totalNum, $scope.Fns.getTableList);
                            $scope.constants.totalNum = data.context.totalNum;
                        }
                    }
                })
            },
            // 删除课程弹框
            delectedCourse_win: function(x) {
                this.Bombbox('delectedCourse', '确认信息', '560px');
                $scope.constants.delectedCourseId = x;
            },
            // 课程标准下拉选中
            changeCourse: function(data) {
                $scope.constants.chargeStandardId = data ? data.chargeStandardId : '';
                this.init();
            },
            // 获取某个课程信息并弹框
            getoneofCourse: function(studentid) {
                $scope.constants.currentStudentid = studentid;
                $scope.constants.studentTabs = 5;
                // $scope.isneedDisable = false;
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getCourseDetail",
                    type: "get",
                    data: { courseId: studentid },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.constants.singleInfo = data.context;
                            // 当前学杂转化
                            var arr = $scope.constants.singleInfo.courseGoodsRS;
                            var str = '';
                            for (var i = 0; i < arr.length; i++) {
                                if (i == arr.length - 1) {
                                    str = str + arr[i].goods.goodsName + '*' + arr[i].goodsNumber;
                                } else {
                                    str = str + arr[i].goods.goodsName + '*' + arr[i].goodsNumber + ',';
                                }

                            }
                            $scope.xuezaStr = str == "" ? "暂无" : str;
                        }
                    }
                });
                this.Bombbox('staudents_win', '课程详情', '960px');
            },
            // 编辑课程信息
            editPopential: function() {
                this.Bombbox('student-edit-win', '编辑信息', '960px');
            },
            // 使用课程跳转到课程列表
            skiptoCourse: function(x) {
                var that = this;
                screen_setDefaultField($scope, function() {
                    $scope.constants.tabType = 1;
                    $scope.screen_goReset['courseSearch'](x.chargeStandardName);
                    $scope.constants.chargeStandardId = x.chargeStandardId;
                    that.init();
                })
            },

            // 学期设置
            addPackage: function() {
                this.getPackageList();
                this.Bombbox('course_set_package', '学期说明', '760px');
            },
            //编辑学期
            // editPackage: function(type, x) {
            //     var that = this;
            //     $scope.packageType = type;
            //     if (type == "add") {
            //         $scope.constants.packageInfo = {};
            //         $scope.constants.packageInfo.schoolTermName = "";
            //         $scope.schoolTermEndTime = "";
            //         $scope.schoolTermBeginTime = "";
            //     } else {
            //         $scope.constants.packageInfo = angular.copy(x);
            //         $scope.schoolTermBeginTime = x.schoolTermBeginTime;
            //         $scope.schoolTermEndTime = x.schoolTermEndTime;
            //     }
            //     re_dialog = layer.open({
            //         type: 1,
            //         title: type == "add" ? "添加学期" : "编辑学期",
            //         skin: 'layerui', //样式类名
            //         closeBtn: 1, //不显示关闭按钮
            //         move: false,
            //         anim: 0,
            //         area: '560px',
            //         offset: '30px',
            //         shadeClose: false, //开启遮罩关闭
            //         content: $('.course_add_package')
            //     })

            //     laydate.render({
            //         elem: '#schoolTermBeginTime', //指定元素
            //         format: 'MM-dd',
            //         isRange: false,
            //         done: function(value) {
            //             $scope.schoolTermBeginTime = value;
            //         }
            //     });
            //     laydate.render({
            //         elem: '#schoolTermEndTime', //指定元素
            //         format: 'MM-dd',
            //         isRange: false,
            //         done: function(value) {
            //             $scope.schoolTermEndTime = value;
            //         }
            //     });


            // },
            confirm_addPack: function() {
                var that = this;
                var URL;
                for (var i = 0, len = $scope.constants.packageList.length; i < len; i++) {
                    if ($scope.constants.packageInfo.schoolTermName == $scope.constants.packageList[i].schoolTermName && $scope.packageType == "add") {
                        layer.msg("新增学期名称不能重复!");
                        return that.closePackPop();
                        break;
                    }
                }
                if (!$scope.schoolTermBeginTime) {
                    return layer.msg("请输入学期开始时间!")
                }
                if (!$scope.schoolTermEndTime) {
                    return layer.msg("请输入学期结束时间!")
                }
                var param = {
                    schoolTermName: $scope.constants.packageInfo.schoolTermName,
                    schoolTermBeginTime: $scope.schoolTermBeginTime ? $scope.schoolTermBeginTime : "",
                    schoolTermEndTime: $scope.schoolTermEndTime ? $scope.schoolTermEndTime : "",

                };
                if ($scope.constants.packageInfo.schoolTermId) {
                    param["schoolTermId"] = $scope.constants.packageInfo.schoolTermId;
                }
                if ($scope.packageType == "add") {
                    URL = "/api/oa/chargeStandard/addSchoolTerm";
                } else {
                    URL = "/api/oa/chargeStandard/modifySchoolTerm";
                }
                $.hello({
                    url: CONFIG.URL + URL,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            that.closePackPop();
                            that.getPackageList();
                        }
                    }
                })
            },
            //删除学期
            deleteCourse: function(x) {
                var that = this;
                var isConfirm = layer.confirm('确定删除该课程？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    resize: false,
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    var param = {
                        courseId: x.courseId
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/deleteCourse",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                that.getTableList($scope.constants.start);
                                // $scope.constants.pagerRender = false;
                                // $scope.Fns.getTableList("0");
                                layer.close(isConfirm);
                            };
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })
            },
            closePackPop: function() {
                layer.close(re_dialog);
                $scope.schoolTermEndTime = "";
                $scope.schoolTermBeginTime = "";
            },
            // 切换学期
            changeSemester: function(wrapper) {
                $scope.constants.Semester = wrapper;
            },
            // 资费套餐增加
            addItem: function(arr, wrapper) {
                if (arr) {
                    arr.push({});
                } else {
                    if (wrapper) {
                        $scope.constants.chargeInfo.packages = [{}];
                    } else {
                        $scope.constants.chargeInfo.oldPackages = [{}];
                    }
                }
            },
            // 后台时间格式转换
            changetime: function(arr, flag) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i].beginTime = yznDateFormatYMd(arr[i].beginTime);
                    arr[i].endTime = yznDateFormatYMd(arr[i].endTime);
                    arr[i].alltime = arr[i].beginTime + ' 到 ' + arr[i].endTime;
                    if (flag) {
                        $scope.constants.currentSem[i] = arr[i].beginTime + ' 到 ' + arr[i].endTime;
                    } else {
                        $scope.constants.oldSem[i] = arr[i].beginTime + ' 到 ' + arr[i].endTime;
                    }
                }
            },
            // 套餐删除
            removeItem: function(arr, index) {
                if (arr) {
                    arr.splice(index, 1);
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
                        }
                    }
                });
            },
            // 学期删除
            delectSemester: function(index, total) {
                if (total) {
                    if (total[index].packageId) {
                        total[index].packageStatus = '0';
                    } else {
                        total.splice(index, 1)
                    }
                }
            },

            // 获取学杂列表
            getMiscellaneousList: function(param, page) {
                var params = {
                    pageType: page || "",
                    start: param < 0 ? 0 : param,
                    count: $scope.constants.eachPage,
                    goodsStatus: $scope.Fns.changetoServer($scope.constants.enableType, $scope.constants.enableType1, false),
                    goodsType: $scope.constants.goodsType ? "1" : $scope.constants.goodsType1 ? "2" : undefined,
                    sellStatus: "1",
                    goodsName: $scope.constants.likeName,
                    orderTyp: $scope.constants.orderTyp,
                    orderName: $scope.constants.orderName,
                    goodsSpecStatus: 1
                };
                if (!$scope.constants.orderTyp) {
                    params["orderTyp"] = undefined;
                    params["orderName"] = undefined;
                }
                for (var i in params) {
                    if (params[i] === '' || params[i] == undefined) {
                        delete params[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/goods/list",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            data.context.items.map(function(item) {
                                item.specNames = item.goodsSpecList && item.goodsSpecList.length ? arrToStr(item.goodsSpecList, 'name') : '-'
                            })
                            $scope.constants.MiscellaneousList = data.context.items;
                            $scope.Fns.renderPager(data.context.totalNum, $scope.Fns.getMiscellaneousList);
                            $scope.constants.totalNum = data.context.totalNum;
                        }
                    }
                });
            },
            // 获取课程包列表
            getCoursePackageList: function(param, page) {
                var params = {
                    pageType: page || "",
                    start: param,
                    count: $scope.constants.eachPage,
                    coursePackageStatus: $scope.Fns.changetoServer($scope.constants.enableType, $scope.constants.enableType1, false),
                    searchName: $scope.constants.likeName,
                    searchType: 'coursePackageName',
                    orderTyp: $scope.constants.orderTyp,
                    orderName: $scope.constants.orderName,
                };
                if (!$scope.constants.orderTyp) {
                    params["orderTyp"] = undefined;
                    params["orderName"] = undefined;
                }
                for (var i in params) {
                    if (params[i] === '' || params[i] == undefined) {
                        delete params[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/listCoursePackage",
                    type: "get",
                    data: params,
                    success: function(data) {
                        if (data.status == '200') {
                            console.log(data)
                            $scope.constants.coursePackageList = data.context.items;
                            $scope.Fns.renderPager(data.context.totalNum, $scope.Fns.getCoursePackageList);
                            $scope.constants.totalNum = data.context.totalNum;
                        }
                    }
                });
            },
            // 新增学杂
            addMiscellaneous: function() {
                var _that = this;

                if ($scope.constants.currentMiscellaneous.goodsType == 1 && !$scope.constants.currentMiscellaneous.goodsSpecList.length) {
                    return layer.msg('请添加学杂规格')
                }

                var params = $scope.constants.currentMiscellaneous.goodsType == 1 ? {
                    goodsName: $scope.constants.currentMiscellaneous.goodsName,
                    goodsSpecList: $scope.constants.currentMiscellaneous.goodsSpecList,
                    goodsType: $scope.constants.currentMiscellaneous.goodsType,
                    sellStatus: 1
                } : {
                    goodsName: $scope.constants.currentMiscellaneous.goodsName,
                    goodsPrice: $scope.constants.currentMiscellaneous.goodsPrice,
                    goodsType: $scope.constants.currentMiscellaneous.goodsType,
                    sellStatus: 1
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/goods/add",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(dialog);
                            $scope.constants.pagerRender = false;
                            $scope.constants.start = "0";
                            $scope.constants.orderTyp = undefined;
                            $scope.constants.orderName = undefined;
                            _that.getMiscellaneousList(0);
                        }
                    }
                });
            },
            // 修改学杂
            editMiscellaneous: function() {
                var _that = this;
                var param = $scope.constants.currentMiscellaneous;
                param.goodsId = $scope.iseditoradd.goodsId;
                param.goodsStatus = $scope.iseditoradd.goodsStatus;
                $.hello({
                    url: CONFIG.URL + "/api/oa/goods/update",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(dialog);
                            _that.getMiscellaneousList($scope.constants.start);
                        }
                    }
                });
            },
            // 新增学杂&修改学杂弹框
            addMiscellaneouswin: function(x) {
                if (!x) {
                    $scope.constants.currentMiscellaneous = {
                        goodsSpecList: [{ name: '默认' }]
                    };
                    $scope.constants.currentMiscellaneous.goodsType = 1;
                    $scope.iseditoradd = null;
                    openPopByDiv('新增学杂', '.course_shade_miscellaneous', '760px');
                    // layerOpen('course_shade_miscellaneous', '新增学杂');
                } else {
                    $scope.iseditoradd = x;
                    openPopByDiv('编辑学杂', '.course_shade_miscellaneous', '760px');
                    // layerOpen('course_shade_miscellaneous', '编辑学杂');
                    $.hello({
                        url: CONFIG.URL + "/api/oa/goods/detail",
                        type: "get",
                        data: { goodsId: x.goodsId },
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.currentMiscellaneous = data.context;
                            }
                        }
                    });
                }

            },
            addGoodsSpec: function() {
                $scope.constants.currentMiscellaneous.goodsSpecList.push({
                    name: '默认'
                })
            },

            //查看课程包详情
            coursePackageInfo: function(x) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/coursePackageInfo",
                    type: "get",
                    data: {
                        'coursePackageId': x.coursePackageId,
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            console.log(res);
                            $scope.openCoursepackage('add_coursepackage', '1160px', { type: 1, title: '修改课程包', item: res.context });
                        };
                    }
                })
            },
            deleteCoursePackage: function(x) {
                var that = this;
                detailMsk("确定删除该课程包？", function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/deleteCoursePackage",
                        type: "post",
                        data: JSON.stringify({ coursePackageId: x.coursePackageId }),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.constants.start = "0";
                                $scope.constants.pagerRender = false;
                                that.getCoursePackageList('0');
                            }
                        }
                    });
                });
            },
            // 收费标准启用禁用收费标准
            updateStatusofxueza: function(x) {
                //              $scope.constants.start = "0";
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/oa/goods/update",
                    type: "post",
                    data: JSON.stringify({ goodsId: x.goodsId, goodsStatus: x.goodsStatus == 1 ? 0 : 1 }),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.constants.pagerRender = false;
                            $scope.constants.start = ($scope.constants.totalNum - $scope.constants.start) == 1 ? ($scope.constants.start - $scope.constants.eachPage) : $scope.constants.start;
                            that.getMiscellaneousList($scope.constants.start);
                        }
                    },
                    error: function(re) {
                        console.log(re);
                    }
                })
            },
            // 启用禁用课程包
            updateStatusCoursePackage: function(x) {
                $scope.constants.start = "0";
                var that = this;
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/updateCoursePackage",
                    type: "post",
                    data: JSON.stringify({ 'coursePackageId': x.coursePackageId, 'coursePackageStatus': x.coursePackageStatus == 1 ? 0 : 1 }),
                    success: function(data) {
                        if (data.status == '200') {
                            that.getCoursePackageList($scope.constants.start);
                        }
                    },
                    error: function(re) {
                        console.log(re);
                    }
                })
            },

            // 初始化获取数据
            init: function(type) {
                $scope.constants.pagerRender = false;
                if (type == "nosort") {
                    $scope.constants.orderTyp = undefined;
                    $scope.constants.orderName = undefined;
                }
                $scope.constants.start = "0";
                switch ($scope.constants.tabType) {
                    case 1:
                        this.getTableList("0");
                        break;
                    case 3:
                        this.getMiscellaneousList('0');
                        break;
                    case 4:
                        this.getCoursePackageList('0');
                        break;
                }
            },
            // 分页
            renderPager: function(total, fn) {
                if ($scope.constants.pagerRender)
                    return;
                $scope.constants.pagerRender = true;
                var $M_box3 = $('.M-box3');
                $M_box3.pagination({
                    totalData: total || 0, // 数据总条数
                    showData: $scope.constants.eachPage, // 显示几条数据
                    jump: true,
                    coping: true,
                    count: 2, // 当前页前后分页个数
                    homePage: '首页',
                    endPage: '末页',
                    prevContent: '上页',
                    nextContent: '下页',
                    current: Math.ceil($scope.constants.start / $scope.constants.eachPage) + 1,
                    callback: function(api) {
                        if (api.getCurrentEach() != $scope.constants.eachPage) { //本地存储记下每页多少条
                            $scope.constants.eachPage = api.getCurrentEach();
                            localStorage.setItem(getEachPageName($state), $scope.constants.eachPage);
                        }
                        $scope.constants.start = (api.getCurrent() - 1) * $scope.constants.eachPage; // 分页从0开始
                        if (fn) {
                            fn($scope.constants.start); //回掉
                        }
                    }
                });
            },
        };
        // 路由跳转清除tab历史
        $rootScope.$on('$stateChangeSuccess', function() {
            sessionStorage.removeItem("tabType");
        });
        switch ($scope.constants.tabType) {
            case 1:
                $scope.constants.orderName = "course_name";
                break;
            case 3:
                $scope.constants.orderName = "goods_name";
                break;
            case 4:
                $scope.constants.orderName = "course_package_name";
                break;
            default:
                break;
        }
        $scope.Fns.init();
        $scope.Fns.getPackageList();
        $scope.$on('to_course', function(event, data) {
            if (JSON.parse(data).wrapper) {
                $scope.Fns.renderFinish(JSON.parse(data))
            }
        });
        $scope.$on("courseChange", function(e, isEdit) {
            if (isEdit != "edit") {
                $scope.constants.orderTyp = undefined;
                $scope.constants.orderName = undefined;
                $scope.constants.pagerRender = false;
                $scope.constants.start = "0";
                $scope.Fns.getTableList("0");
            } else {
                $scope.Fns.getTableList($scope.constants.start);
            }
        });
        if ($scope.$stateParams.screenValue.name == "globalsearch") {
            if ($scope.$stateParams.screenValue.tab) {
                $scope.constants.tabType = $scope.$stateParams.screenValue.tab;
                setTimeout(function () {
                    $scope.Fns.switchcourseNav($scope.constants.tabType);
                })
            }
            if ($scope.$stateParams.screenValue.searchData) {
                $scope.constants.likeName = $rootScope.globalSearchVal;
                setTimeout(function () {
                    $scope.kindSearchOnreset_["courseSearch"]($scope.constants.likeName);
                    $scope.constants.pagerRender = false;
                    $scope.constants.start = "0";
                    $scope.Fns.getTableList("0");
                });
            }
            if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新增课程") {
                setTimeout(function () {
                    $scope.Fns.addCoursewin();
                })
            }
            if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新增学杂") {
                setTimeout(function () {
                    $scope.Fns.addMiscellaneouswin();
                })
            }
            if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新增课程包") {
                setTimeout(function () {
                    $scope.openCoursepackage('add_coursepackage', '1160px', { type: 0, title: '新增课程包', item: {} });
                })
            }

        }
    }]

});