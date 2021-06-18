define(["MyUtils", "jqFrom", "laydate", "dateTeacher", "pagination", "mySelect", "addInfos", "potential_pop", "remarkPop", "signUp", "courseAndClass_sel", "operation", "hopetime", 'orderInfo', 'importPop', 'photoPop', 'classroomPop'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$location', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $location, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchName, searchType, year, term, courseId, orderTyp = "desc",
            orderName = "contractRenew_start_date";
        $scope.an_keshi = false;
        $scope.an_tian = false;
        $scope.contractRenewStatus = 0;
        init();

        function init() {
            getCourse(); //获取课程数据
            getTermList(); //获取学期
            $scope.page = CONSTANT.PAGE.STUDENT;
            $scope.datas = {
                page: $scope.page,
                type: 'edit',
                item: {}
            };
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、联系方式',
                studentNickName: '昵称',
                userPhone: '联系方式',
            };
            $scope.nameListThead = [{
                    'name': 'checkbox',
                    'width': '50'
                },
                {
                    'name': '姓名(昵称)',
                    'width': '22%',
                }, {
                    'name': '联系方式',
                    'width': '100',

                }, {
                    'name': '报名时间',
                    'width': '150',
                    'issort': true,
                    'sort': 'desc',
                    'id': 'contractRenew_start_date'
                }, {
                    'name': '课程',
                    'width': '20%',
                }, {
                    'name': '购买',
                    'width': '12%',
                    'align': 'right'
                }, {
                    'name': '赠送',
                    'width': '12%',
                    'align': 'right'
                }, {
                    'name': '剩余',
                    'width': '12%',
                    'align': 'right'
                }, {
                    'name': '合同有效期至',
                    'width': '120',
                    'align': 'center',
                    'issort': true,
                    'id': 'validity_end_time'
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '180',
                }
            ];
            //获取工作台数据
            if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '待处理') {
                $scope.searchTime = thisTime() + " 到 " + GetDateStr(14);
                $scope.contractRenewStatus = "0";
            }
            $scope.studNavJud_big = 2;
            $scope.select_params = [];
            $scope.switchStudNav_big = switchStudNav_big;
            $scope.addPotientalPop = checkAuthMenuById("30"); //操作学员
            $scope.youxiaoqi = checkAuthMenuById("150"); //有效期设置权限
            $scope.screen_years = getFrom2017(true,8);
            $scope.sortCllict = sortCllict; //表头筛选
            $scope.Enterkeyup = searchdata; //搜索回车事件
            $scope.SearchData = searchdata; //按钮搜索
            $scope.changeType = changeType; //按课时还是按天
            $scope.changeYear = changeYear; //按学年
            $scope.changeTerm = changeTerm; //按学期
            $scope.changeByStatus = changeByStatus; //按在课结课状态
            $scope.changeCourse = changeCourse; //按课程筛选
            $scope.onReset = onReset; //重置
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            $scope.patchConfirm = patchConfirm; //批量操作
            $scope.mouseover = mouseover;
            $scope.mouseleave = mouseleave;

            $scope.operat_transfer = operat_transfer;
            $scope.validityOperate = validityOperate; //变更有效期
            $scope.closeDialog = function() {
                layer.close(dialog);
            }
            laydate.render({
                elem: '#searchTime',
                range: "到",
                isRange: true,
                btns: ['confirm'],
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getStudentList('0');
                }
            });
            getStudentList("0");
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.sel_allFun = function(c) {
                checkboxAllFun(c, $scope.StudentList, $scope.select_params, 'contractRenewId');
            }
        }
        //小浮框显示与隐藏
        function mouseover(x, ind, e) {
            if (x.potentialCustomerParentTowPhone || x.potentialCustomerParentThreePhone) {
                $scope.showInd = ind;
                var e_ = $(e.currentTarget);
                var top_ = e_.offset().top + 20;
                var left_ = e_.offset().left;
                var $this = $(e.target);
                $this.closest("td").find(".openPop").css({
                    left: left_,
                    top: top_
                });
            }
        }

        function mouseleave($event) {
            $scope.showInd = null;
        }
        //获取课程
        function getCourse() {
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: { 'pageType': '0', 'courseStatus': '1' },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_course = data.context;
                    }
                }
            })

        }

        function getTermList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                type: "get",
                data: { pageType: 0 },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_term = data.context;
                    }

                }
            })
        }

        function switchStudNav_big(n) {
            $scope.studNavJud_big = n;
            switch (n) {
                case 1:
                    $state.go("edu_student");
                    break;
                case 2:
                    $state.go("edu_student/signUp_detail")
                    break;
                default:
                    break;
            }
        }

        function onReset() {
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.contractRenewStatus = undefined;
            $scope.an_keshi = $scope.an_tian = false;
            courseId = year = term = searchType = searchName = undefined;
            orderTyp = "desc";
            orderName = "contractRenew_start_date";
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            //          $scope.select_params = [];
            pagerRender = false; //分页重新加载
            getStudentList('0');
        }

        function sortCllict(data) {
            orderTyp = data.sort;
            orderName = data.id;
            pagerRender = false;
            getStudentList('0');
        }
        //回车搜索
        function searchdata(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getStudentList('0');
        }

        function changeYear(y) { //切换学期
            year = y == null ? undefined : y.year;
            pagerRender = false;
            getStudentList('0');
        }

        function changeTerm(t) { //切换学期
            term = t == null ? undefined : t.schoolTermId;
            pagerRender = false;
            getStudentList('0');
        }

        function changeType(type) {
            if (type) {
                if ($scope.an_keshi) {
                    $scope.an_keshi = true;
                    $scope.an_tian = false;
                }
            } else {
                if ($scope.an_tian) {
                    $scope.an_tian = true;
                    $scope.an_keshi = false;
                }
            }
            pagerRender = false;
            getStudentList(0);
        }

        function changeByStatus(e, type) {
            $scope.contractRenewStatus = e.target.checked ? type : undefined;
            pagerRender = false;
            getStudentList(0);
        }

        function changeCourse(d) {
            courseId = d != null ? d.courseId : undefined;
            pagerRender = false;
            getStudentList('0');
        }
        $scope.$on('edu_signUp_detail_reload', function(e, isStart) {
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
            if (isStart == true) {
                pagerRender = false;
                getStudentList(start);
            } else {
                getStudentList(start);
            }
        });

        function getStudentList(start_) {
            start = start_ == 0 ? "0" : start_;
            var param = {
                start: start_ || "0",
                count: eachPage,
                courseId: courseId,
                schoolYear: year,
                schoolTermId: term,
                courseTimeType: $scope.an_keshi ? "0" : $scope.an_tian ? "1" : undefined,
                contractRenewStatus: $scope.contractRenewStatus,
                searchType: searchName ? "appSearchName" : undefined,
                searchName: searchName,
                orderName: orderName,
                orderTyp: orderTyp,
            };
            if ($scope.searchTime) {
                param["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                param["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/student/listWarnValidityStudentCenter",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.StudentList = data.context.items;
                        renderPager(data.context.totalNum);
                        repeatLists($scope.StudentList, $scope.select_params, 'contractRenewId');
                        $scope.totalNum = data.context.totalNum;
                    }
                }
            })
        }

        function renderPager(total) { //分页
            var len = 0;
            angular.forEach($scope.StudentList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.StudentList.length > 0 && $scope.StudentList.length == len) {
                $scope.resetCheckboxDir(true);
            } else {
                $scope.resetCheckboxDir(false);
            }
            if (pagerRender)
                return;
            pagerRender = true;
            var $M_box3 = $('.M-box3');
            $M_box3.pagination({
                current: parseInt(start / eachPage) + 1,
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
                    getStudentList(start); //回掉
                }
            });
        }

        //学员操作
        function operat_transfer(id, width, type, x) {
            if (type == "结课") {
                var data = {
                    type: type,
                    page: "signUp_detail",
                    contractRenew: x.contractRenew,
                    courselist: {
                        course: {
                            courseId: x.courseId,
                            courseName: x.lastCourseName,
                        },
                        contractId: x.contractId,
                    },
                    studentInfo: {
                        name: x.name
                    }
                }
                $scope.yznOpenPopUp($scope, 'opera-tion', 'operat_finish', '960px', data);
            } else if (type == "变更有效期") {
                $scope.isBatch = false;
                $scope.clickValidityInfo = angular.copy(x);
                $scope.lineValidityInfo = {
                    validityTime: !$scope.clickValidityInfo.validityEndTime ? "" : yznDateFormatYMd($scope.clickValidityInfo.validityEndTime),
                    remake: '',
                    type: '1',
                    validityNum: 30,
                };
                laydate.render({
                    elem: '#signUp_validity_time', //指定元素
                    //                      range: "至",
                    isRange: false,
                    format: 'yyyy-MM-dd',
                    done: function(value, value2) {
                        $scope.lineValidityInfo.validityTime = value;
                    }
                });
                openPopByDiv('变更有效期', id, width);
            } else if (type == "变更记录") {
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/listContractRenewRecord",
                    type: "get",
                    data: { 'contractRenewId': x.contractRenewId },
                    success: function(data) {
                        if (data.status == '200') {
                            console.log(data);
                            $scope.signUp_updateValidityList_2 = data.context;
                        };
                    }
                });
                openPopByDiv('变更记录<span class="color_nameState" style="font-size: 14px">（' + x.lastCourseName + '）</span>', id, width);
            }
        }

        function validityOperate() {
            var params = {
                desc: $scope.lineValidityInfo.remake,
            };
            if ($scope.isBatch) {
                params["contractRenewRecords"] = getArrIds_($scope.select_params);
            } else {
                params["contractRenewRecords"] = [{ contractRenewId: $scope.clickValidityInfo.contractRenewId }];
            }
            if ($scope.lineValidityInfo.type == 1) {
                if (!$scope.lineValidityInfo.validityTime) {
                    return layer.msg("请选择有效期至");
                }
                params["validityEndTime"] = yznDateFormatYMd($scope.lineValidityInfo.validityTime) + ' 23:59:59';
            } else {
                params["validityNum"] = $scope.lineValidityInfo.validityNum;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/student/addContractRenewRecordList",
                type: "post",
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == '200' || data.status == '20030') {
                        layer.close(dialog);
                        if ($scope.isBatch) {
                            $scope.$emit("edu_signUp_detail_reload", true);
                        } else {
                            getStudentList(start);
                        }
                    }
                }
            });
        }

        function getArrIds_(list) {
            var arr = [];
            if (list && list.length > 0) {
                angular.forEach(list, function(v) {
                    arr.push({
                        contractRenewId: v.contractRenewId
                    });
                });
            }
            return arr;
        }

        function patchConfirm(n) {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择需要操作的学员");
            }
            var arr = [];
            angular.forEach($scope.select_params, function(v) {
                arr.push(v.contractRenewId);
            });
            switch (n) {
                case 2:
                    var msg = "<div class='textAlignCenter'>结课后，表示学员已学完该课程合同。<br>剩余课时和学费将自动转成机构营收。确认将已选中的课程合同结课吗？</div>";
                    detailMsk(msg, function() {
                        var param = {
                            contractRenewIds: arr
                        };
                        $.hello({
                            url: CONFIG.URL + '/api/oa/order/endContractRenewBatch',
                            type: "post",
                            data: JSON.stringify(param),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.$emit("edu_signUp_detail_reload", true);
                                } else if (data.status == '206') {
                                    $scope.qiankeList = data.context;
                                    openPopByDiv('批量结课失败', "#qianke_pop", "560px");
                                }
                            }
                        })
                    })
                    break;
                case 1:
                    $scope.isBatch = true;
                    $scope.lineValidityInfo = {
                        validityTime: "",
                        remake: '',
                        type: '1',
                        validityNum: 30,
                    };
                    laydate.render({
                        elem: '#signUp_validity_time', //指定元素
                        //                      range: "至",
                        isRange: false,
                        format: 'yyyy-MM-dd',
                        done: function(value, value2) {
                            $scope.lineValidityInfo.validityTime = value;
                        }
                    });
                    openPopByDiv('变更有效期', "#signUp_update_validity", "660px");
                    break;
                default:
                    break;
            }
        }
        $scope.closePop = function() {
            layer.close(dialog);
        }

    }]
})