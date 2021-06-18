define(["MyUtils", "jqFrom", "laydate", "dateTeacher", "pagination", "mySelect", "addInfos", "potential_pop", "remarkPop", "signUp", "operation", "hopetime", 'orderInfo', 'importPop', 'photoPop', 'classroomPop', "customPop",'directives'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$location', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $location, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var onlyId, //数据id
            contractId, //合约id
            potentialCustomerId, //潜客id
            classType, //班级状态0 休课 1 正常
            classInfoStatus, //事件
            courseId, //课程id
            term,
            $year,
            classId, //班级id
            grade,
            searchMark,
            searchSchool,
            birthMonth,
            searchAge = {},
            surplusTime, //购买剩余课时
            relationship, //关系
            judge, //确定条件判断
            studentStatus = "0", //在课学员还是历史学员0在课 1历史
            searchType, //搜索类型
            searchName; //搜索名
        var orderTyp_1 = "",
            orderTyp_2 = "",
            orderName = "";
        $scope.onClass = false;
        $scope.dividClass = false;
        //          $scope.an_keshi = false;
        //          $scope.an_tian = false;
        $scope.bindingWxApp = false;
        $scope.qianke = false;
        $scope.xiuke = false;
        $scope.showInd = null;
        $scope.studNavJud_big = 1;
        $scope.searchTime = "";
        //          姓名、联系方式、购买课时、赠送课时、消课课时、剩余课时、购买天数、赠送天数、消课天数、剩余天数、
        //          在读课程数、学员账户、积分、
        //          服务号通知、家长端使用、出生日期、年龄、标签、学校、年级、备注、操作。
        var heads = [
            { name: "姓名", checked: true, fixed: "1" },
            //              {name:"联系方式",checked:true,fixed:"2"},
            { name: "年龄", checked: false },
            { name: "购买", checked: true },
            { name: "赠送", checked: true },
            { name: "消课", checked: true },
            { name: "剩余", checked: true },
            { name: "欠课", checked: true },
            { name: "在读课程数", checked: true },
            { name: "学员账户", checked: false },
            { name: "积分", checked: false },
            { name: "服务号通知", checked: true },
            { name: "家长端使用", checked: true },
            { name: "出生日期", checked: true },
            { name: "标签", checked: false },
            { name: "学校", checked: false },
            { name: "年级", checked: false },
            { name: "备注", checked: true },
            { name: "操作", checked: true, fixed: "-1" },
        ];
        //         heads_0:  培训班、heads_1: 托管、heads_2: 托管和培训班
        //培训班（购买课时、赠送课时、消课课时、剩余课时）、托管（购买天数、赠送天数、消课天数、剩余天数）、托管和培训班（购买课时、赠送课时、剩余课时、购买天数、赠送天数、消课天数、剩余天数）
        //          var heads_0 = [
        //              {name:"购买课时",checked:true},
        //              {name:"赠送课时",checked:true},
        //              {name:"消课课时",checked:true},
        //              {name:"剩余课时",checked:true},
        //          ];
        //          var heads_1 = [
        //              {name:"购买天数",checked:true},
        //              {name:"赠送天数",checked:true},
        //              {name:"消课天数",checked:true},
        //              {name:"剩余天数",checked:true},
        //          ];
        //          var heads_2 = heads_0.concat(heads_1);
        /*************以上是全局变量*****************/
        init();

        function init() {
            //          getConfig();
            if ($rootScope.fromOrgn) {
                $scope.checkedHead = heads;
            } else {
                getCustomTag();
            }
            $scope.screen_months = getMonthChinese();
            $scope.page = CONSTANT.PAGE.STUDENT;
            $scope.addPotientalPop = checkAuthMenuById("30");
            $scope.addPotientalPop_daoru = checkAuthMenuById("31");
            $scope.addPotientalPop_daochu = checkAuthMenuById("66");
            $scope.datas = {
                page: $scope.page,
                type: 'edit',
                item: {}
            };
            getCourse(); //获取课程数据
            getTermList(); //获取学期
            getMarkList(); //标签列表
            getSchoolList(); //学校列表
            listWarnValidityStudentCenterTotal();
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、联系方式、备注',
                studentNickName: '昵称',
                userPhone: '联系方式',
            };
            $scope.screen_course = []; //筛选-课程
            $scope.screen_class = []; //筛选-班级
            $scope.screen_classHour = [ //筛选-剩余课时
                {
                    field: '少于10课时',
                    value: '10'
                },
                {
                    field: '少于20课时',
                    value: '20'
                },
                {
                    field: '少于50课时',
                    value: '50'
                },
            ];
            //          姓名、联系方式、购买课时、赠送课时、消课课时、剩余课时、购买天数、赠送天数、消课天数、剩余天数、
            //          在读课程数、学员账户、积分、
            //          服务号通知、家长端使用、出生日期、年龄、标签、学校、年级、备注、操作。
            $scope.nameListThead = [{
                'name': '',
                'width': '210',
                fixed: "1",
                td: `<td></td>`
                    //                  }, {
                    //                      'name': '',
                    //                      'width': '110',
                    //                      fixed:"2",
                    //                      td:`<td></td>`
            }, {
                'name': '年龄',
                'width': '90',
                td: `<td ng-bind-html="caclBirthToAge(x.age,x.birthday)"></td>`
            }, {
                'name': '购买',
                'width': '140',
                'align': 'right',
                'issort': true,
                'id': 'buyAllTime',
                td: `<td class="textAlignRt">{{x.buyAllTime|keshi_tian_sheng:x.buyAllDateNum:x.buyAllTime:(x.buyAllDateNum + x.giveAllDateNum):x.giveTime}}</td>`
            }, {
                'name': '赠送',
                'width': '140',
                'align': 'right',
                td: `<td class="textAlignRt">{{x.giveTime|keshi_tian_sheng:x.giveAllDateNum:x.buyAllTime:(x.buyAllDateNum + x.giveAllDateNum):x.giveTime}}</td>`
            }, {
                'name': '消课',
                'width': '140',
                'align': 'right',
                td: `<td class="textAlignRt">{{(x.buyAllTime + x.giveTime - x.totalSurplusTime)|keshi_tian_sheng:(x.buyAllDateNum + x.giveAllDateNum - x.totalSurplusDayNum):x.buyAllTime:(x.buyAllDateNum + x.giveAllDateNum):x.giveTime}}</td>`
            }, {
                'name': '剩余',
                'width': '140',
                'align': 'right',
                'issort': true,
                'id': 'totalSurplusTime',
                td: `<td class="textAlignRt">{{x.totalSurplusTime|keshi_tian_sheng:x.totalSurplusDayNum:x.buyAllTime:(x.buyAllDateNum + x.giveAllDateNum):x.giveTime:true}}</td>`
            }, {
                'name': '欠课',
                'width': '100',
                'align': 'right',
                //                      'issort':true,
                //                      'id': 'oweTime',
                td: `<td class="textAlignRt" ng-class='{"main_color":x.oweTime}'>{{x.oweTime?((x.oweTime|number:2)+"课时"):"-"}}</td>`
            }, {
                'name': '在读课程数',
                'width': '100',
                'align': 'center',
                'issort': true,
                'id': 'course_total',
                td: `<td class="textAlignCenter">{{x.courseTotal}}</td>`
            }, {
                'name': '学员账户',
                'width': '100',
                'align': 'right',
                'issort': true,
                'id': 'accountBalance',
                td: `<td class="textAlignRt">{{x.accountBalance | number:2}}</td>`
            }, {
                'name': '积分',
                'width': '100',
                'align': 'right',
                'issort': true,
                'id': 'points',
                td: `<td class="textAlignRt">{{x.points}}分</td>`
            }, {
                'name': '服务号通知',
                'width': '120',
                'align': 'center',
                td: `<td class="textAlignCenter"><span ng-show="x.wxAppId"><img src="static/img/bindWeixin.png" alt="" /></span></td>`
            }, {
                'name': '家长端使用',
                'width': '120',
                'align': 'center',
                'issort': true,
                'id': 'last_login_time',
                td: `<td class="textAlignCenter">{{x.dater}}</td>`
            }, {
                'name': '出生日期',
                'width': '100',
                td: `<td>{{x.birthday}}</td>`
            }, {
                'name': '标签',
                'width': '100',
                td: `<td><span class="separate_list"><span ng-repeat="y in x.tags">{{y.name}}</span></span></td>`
            }, {
                'name': '学校',
                'width': '100',
                td: `<td>{{x.schoolName}}</td>`
            }, {
                'name': '年级',
                'width': '80',
                td: `<td>{{x.grade| _grade }}</td>`

            }, {
                'name': '备注',
                'width': '200',
                td: `<td class="remarks overflow-normal">
                            <remark-view view-data="{{x.potentialCustomerDesc}}"></remark-view>
                            <remark-edit edit-id="{{x.potentialCustomerId}}" ng-show="addPotientalPop" edit-title="备注" edit-text="{{x.potentialCustomerDesc}}" edit-length="500" edit-otext="{{x.potentialCustomerDesc}}" edit-click="editRemark(n)"></remark-edit>
                        </td>`
            }, {
                'name': '',
                'width': '130',
                fixed: "-1",
                td: `<td></td>`
            }];
            $scope.nameListThead2 = [{
                'name': '姓名(昵称)',
                'width': '25%',
                //          }, {
                //              'name': '昵称',
                //              'width': '15%',
            }, {
                'name': '年龄',
                'width': '100',
            }, {
                'name': '年级',
                'width': '100',
            }, {
                'name': '联系方式',
                'width': '120',
            }, {
                'name': '备注',
                'width': '30%',
            }, {
                'name': '结业时间',
                'width': '110',
                'issort': true,
                'sort': 'desc',
                'id': 'last_contract_time'
            }, {
                'name': '最近就读课程',
                'width': '35%',
            }, {
                'name': '操作',
                'align': 'center',
                'width': '140',
            }];
            //获取工作台数据
            if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '待处理') {
                if ($stateParams.screenValue.value == 'birthday') {
                    birthMonth = (new Date()).getMonth() + 1;
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['screen_birthMonth'](changeToChinese(birthMonth) + '月');
                    });
                } else {
                    classType = 2; //列表筛选待分班
                    $scope.dividClass = true; //待分班勾选项勾上
                }
            }


            $scope.studNavJud = $scope.$stateParams.screenTab ? $scope.$stateParams.screenTab : 1; //判断是在课学员还是历史学员
            $scope.switchStudNav_big = switchStudNav_big;
            $scope.switchStudNav = switchStudNav;
            $scope.screen_grades = getConstantList(CONSTANT.STUDENTGRADE); //潜客年级列表
            $scope.screen_years = getFrom2017(true, '8'); //学年
            //重置筛选栏
            $scope.Enterkeyup = Enterkeyup; //搜索回车事件
            $scope.SearchData = SearchData; //按钮搜索
            $scope.changeStatus = changeStatus; //按状态筛选
            $scope.changeYear = changeYear; //按学年
            $scope.changeTerm = changeTerm; //按学期
            $scope.changeCourse = changeCourse; //按课程筛选
            $scope.changeClass = changeClass; //按班级筛选
            $scope.changeMonth = changeMonth; //按学员生日
            $scope.changeQianke = changeQianke;
            $scope.searchByAge = searchByAge;
            $scope.changeGrade = changeGrade; //按年级
            $scope.changeBind = changeBind; //绑定小程序通知
            $scope.searchByMark = searchByMark; //按标签
            $scope.searchBySchool = searchBySchool; //按学校
            $scope.changeByfenban = changeByfenban; //切换未分班状态
            $scope.changeByOnclass = changeByOnclass; //切换在课状态
            $scope.sortCllict = sortCllict; //家长端使用排序
            $scope.onReset = onReset; //重置
            $scope.caclBirthToAge = caclBirthToAge; //计算年龄
            $scope.load_student = load_student; //打开导入学员弹出框
            $scope.export_config = export_config; //导出学员确认弹框
            $scope.mouseover = mouseover; //试听状态移入
            $scope.mouseleave = mouseleave; //试听状态移出
            $scope.newStudSignup = newStudSignup; //新生报名
            $scope.openSignUp = openSignUp; //学员报名
            $scope.deleteStud = deleteStud; //删除学员
            $scope.editStudent = editStudent; //编辑学员
            $scope.editRemark = editRemark; //编辑学员备注
            $scope.closePop = closePop; //关闭弹框
            $scope.bindParent = bindParent; //自助绑定家长端
            $scope.saveThePoster = saveThePoster; //下载
            getClassroomList(); //获取班级

            (function() {
                laydate.render({
                    elem: '#pCallTime',
                    range: "到",
                    isRange: true,
                    btns: ['confirm'],
                    done: function(value) {
                        $scope.derTime = value;
                    }
                });
            })();
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getStudentList(0);
                }
            });
            //工作台快捷入口跳转
            if ($scope.$stateParams.screenValue.name == 'workbench' && $scope.$stateParams.screenValue.type == "快捷入口") {
                newStudSignup();
            };
            console.log($stateParams);
            if ($scope.$stateParams.screenValue.name == 'class_pop' && $scope.$stateParams.screenValue.value) {
                window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '1060px', { 'page': $scope.page, 'fromPage': 'studentPop', 'item': $scope.$stateParams.screenValue.value, 'tab': 1 });
            };
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新生报名") {
                    setTimeout(function () {
                        newStudSignup();
                    })
                }
                if ($scope.$stateParams.screenValue.tab) {
                    $scope.studNavJud = $scope.$stateParams.screenValue.tab;
                    setTimeout(function () {
                        switchStudNav($scope.studNavJud);
                    })
                }
                if ($scope.$stateParams.screenValue.searchData) {
                    searchName = $rootScope.globalSearchVal;
                    setTimeout(function () {
                        $scope.kindSearchOnreset_["studentSearch"](searchName);
                    });
                }

            }
            getStudentList('0');
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            SERVICE.CUSTOMPOP.TABLE["学员表头-自定义"] = function(data) {
                $scope.checkedHead = data.customTag;
            }
            $scope.$watch("checkedHead", function(n, o) {
                $scope.nameListThead_ = getTableHead($scope.checkedHead, $scope.nameListThead);
                $timeout(function() {
                    $scope.reTheadData_['studentHead']();
                    $scope.$broadcast("studentTdChange", $scope.checkedHead);
                }, 100, true)

            }, true);

        }

        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        //                      0 培训班、1 托管、2 托管和培训班
                        $scope.shopCategory = data.context.shopCategory;
                        var arr;
                        switch ($scope.shopCategory) {
                            case 0:
                                angular.forEach(heads_1, function(v) {
                                    v.checked = false;
                                });
                                arr = heads_0.concat(heads_1);
                                angular.forEach(arr, function(v, ind) {
                                    heads.splice(ind + 2, 0, v);
                                });
                                break;
                            case 1:
                                angular.forEach(heads_0, function(v) {
                                    v.checked = false;
                                });
                                arr = heads_0.concat(heads_1);
                                angular.forEach(arr, function(v, ind) {
                                    heads.splice(ind + 2, 0, v);
                                });
                                break;
                            case 2:
                                angular.forEach(heads_2, function(v, ind) {
                                    heads.splice(ind + 2, 0, v);
                                });
                                break;
                            default:
                                break;
                        }
                    }
                    if ($rootScope.fromOrgn) {
                        $scope.checkedHead = heads;
                    } else {
                        getCustomTag();
                    }
                }
            })
        }
        //获取各页面的自定义表头  2 oa潜客 3 oa学员 4oa订单 5 oa班级
        function getCustomTag() {
            var param = {
                customTagType: 3,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/customTag/info',
                type: 'get',
                data: param,
                success: function(data, d) {
                    if (data.status == "200") {
                        if (data.context && data.context.customTag) {
                            $scope.getHeads = {
                                customTag: JSON.parse(data.context.customTag),
                                customTagId: data.context.customTagId
                            };
                        }
                        $scope.checkedHead = $scope.getHeads ? resetHead($scope.getHeads.customTag, heads) : heads;
                    }
                }
            })
        }

        function listWarnValidityStudentCenterTotal() {
            $.hello({
                url: CONFIG.URL + "/api/oa/student/listWarnValidityStudentCenterTotal",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.warnValidity = data.context.warnValidity;
                        console.log($scope.warnValidity);
                    }
                }
            })
        }

        function closePop() {
            layer.close(dialog);
        }
        $scope.$on('signUpSuccess', function(evt, isInit) {
            if (isInit) {
                pagerRender = false;
                getStudentList('0');
            } else {
                getStudentList(start);
            }
        });

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

        function switchStudNav(n) {
            $scope.StudentList = [];
            $scope.studNavJud = n;
            // $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.onClass = $scope.dividClass = false;
            $scope.qianke = false;
            $scope.xiuke = false;
            //              $scope.an_keshi = $scope.an_tian = false;
            classType = courseId = $year = term = classId = surplusTime = searchType = searchName = grade = searchMark = searchSchool = birthMonth = undefined;
            searchAge = {};
            $scope.ageSearchOnreset_["student"](); //调取app重置方法
            $scope.kindSearchOnreset(); //调取app重置方法
            if (n == 1) {
                //                      studentStatus="0";
                //                      $scope.onClass=false;
                //获取在课学员列表信息
                orderName = "last_login_time";
            } else if (n == 2) {
                //                      studentStatus="1";
                orderName = "last_contract_time";
            }
            getClassroomList();
            pagerRender = false;
            getStudentList('0');
        }

        function onReset() {
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.searchTime = "";
            $scope.onClass = $scope.dividClass = false;
            $scope.qianke = false;
            $scope.xiuke = false;
            $scope.bindingWxApp = false;
            //          $scope.an_keshi = $scope.an_tian = false;
            classType = courseId = $year = term = classId = surplusTime = searchType = searchName = grade = searchMark = searchSchool = birthMonth = undefined;
            searchAge = {};
            $scope.ageSearchOnreset_["student"](); //调取app重置方法
            $scope.tableName = "按课时";
            $timeout(function() {
                $scope.reTheadData_['studentHead']();
            }, 100, true)
            $scope.kindSearchOnreset(); //调取app重置方法
            //          if($scope.studNavJud == 1){
            //              studentStatus="0";
            //          }else{
            //              studentStatus="1";
            //          }
            getClassroomList();
            pagerRender = false; //分页重新加载
            getStudentList('0');
        }

        function changeYear(y) { //切换学期
            $year = y == null ? undefined : y.year;
            getClassroomList();
            pagerRender = false;
            getStudentList('0');
        }

        function changeTerm(t) { //切换学期
            term = t == null ? undefined : t.schoolTermId;
            getClassroomList();
            pagerRender = false;
            getStudentList('0');
        }

        function changeQianke(e, v) {
            $scope.qianke = e.target.checked ? v : undefined;
            pagerRender = false;
            getStudentList('0');
        }

        function changeByfenban() {
            if ($scope.dividClass) {
                classType = 2;
                $scope.onClass = false;
            } else {
                classType = undefined;
            }

            pagerRender = false;
            getStudentList('0');
        }

        function changeByOnclass() {
            if ($scope.onClass) {
                classType = 1;
                $scope.dividClass = false;
            } else {
                classType = undefined;
            }

            pagerRender = false;
            getStudentList('0');
        }

        //获取课程
        function getCourse() {
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: { 'pageType': '0' },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_course = data.context;
                    }
                }
            })

        }
        //获取班级;
        function getClassroomList() {
            var param = {
                pageType: "0",
                classStatus: "1",
                schoolYear: $year ? $year : undefined,
                schoolTermId: term ? term : undefined
            };
            if (courseId) {
                param["courseId"] = courseId;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_class = data.context;
                    }
                }
            })
        }
        $scope.$on("changeMark", function() {
            getMarkList();
        });

        function getMarkList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/tag/list",
                type: "get",
                success: function(res) {
                    if (res.status == 200) {
                        $scope.markList = res.context;
                    }
                }
            });
        }

        function getSchoolList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/pickUp/school/list",
                type: "get",
                data: { pageType: 0 },
                success: function(res) {
                    if (res.status == 200) {
                        $scope.schoolList = res.context;
                    }
                }
            });
        }

        function changeStatus(data) {
            if (data == null) {
                classType = undefined;
            } else {
                classType = data.value;
            }
            pagerRender = false;
            getStudentList('0');
        }

        function changeCourse(data) {
            if (data == null) {
                courseId = '';
            } else {
                courseId = data.courseId;
            }

            classId = ""; //重置班级筛选
            $scope.screen_goReset['班级']();

            getClassroomList();
            pagerRender = false;
            getStudentList('0');
        }

        function changeClass(data) {
            if (data == null) {
                classId = '';
            } else {
                classId = data.classId;
            }
            pagerRender = false;
            getStudentList('0');
        }

        function changeMonth(data) {
            if (data == null) {
                birthMonth = '';
            } else {
                birthMonth = data.value;
            }
            pagerRender = false;
            getStudentList('0');
        }

        function searchByAge(a) {
            searchAge = a;
            pagerRender = false;
            getStudentList(0);
        }

        function changeGrade(data) {
            if (data == null) {
                grade = '';
            } else {
                grade = data.value;
            }
            pagerRender = false;
            getStudentList('0');
        }

        function changeBind() {
            pagerRender = false;
            getStudentList('0');
        }

        function searchByMark(data) {
            if (data == null) {
                searchMark = '';
            } else {
                searchMark = data.id;
            }
            pagerRender = false;
            getStudentList('0');
        }

        function searchBySchool(val) {
            if (val == null) {
                searchSchool = null;
            } else {
                searchSchool = val.schoolName;
            }
            pagerRender = false;
            getStudentList('0');
        }
        //回车搜索
        function Enterkeyup(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getStudentList('0', true);
        }
        //按钮搜索
        function SearchData(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getStudentList('0', true);
        }

        function sortCllict(data) {
            if ($scope.studNavJud == 1) {
                orderTyp_1 = data.sort;
            } else {
                orderTyp_2 = data.sort;
            }
            orderName = data.id;
            pagerRender = false;
            getStudentList('0', true);
        }
        $scope.$on('studentChange', function(evt, startPage) {
            if (startPage) {
                pagerRender = false;
                getStudentList(0);
            } else {
                getStudentList(start);
            }
        });

        function getStudentList(start_, needPop) {
            start = start_ == 0 ? "0" : start_;
            var param = {
                'start': start_,
                'count': eachPage,
                //              'classType': classType,
                //              'classInfoStatus': classInfoStatus,
                'courseId': courseId,
                'schoolYear': $year,
                "schoolTermId": term,
                //              'classId': classId,
                //              'surplusTime': surplusTime,
                'searchName': searchName,
                'searchType': searchName ? 'appSearchName' : undefined,
                "studentStatus": $scope.studNavJud == 1 ? "0" : $scope.studNavJud == 2 ? "1" : undefined,
                'tagId': searchMark,
                'schoolName': searchSchool,
                //              'courseTimeType':$scope.an_keshi?"0":$scope.an_tian?"1": undefined,
                'grade': grade,
                'birthMonth': birthMonth,
                'beginAge': searchAge.minAge || '',
                'endAge': searchAge.maxAge || '',
                //              'orderName':orderName,

            };
            if ($scope.studNavJud == 1) {
                //              param["courseTimeType"] = $scope.an_keshi?"0":$scope.an_tian?"1": undefined;
                param["classId"] = classId;
                param["orderTyp"] = orderTyp_1;
                param["orderName"] = orderName;
                param["classType"] = classType;
                param["listType"] = 1;
                param["bindingWxApp"] = $scope.bindingWxApp ? "0" : undefined;
                param["oweType"] = $scope.qianke ? "1" : undefined;
                param["suspendClass"] = $scope.xiuke ? "1" : undefined;
            } else {
                param["orderTyp"] = orderTyp_2;
                param["orderName"] = orderName;
                if ($scope.searchTime) {
                    param["endCourseBeginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                    param["endCourseEndTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
                }
            }
            for (var i in param) {
                if (param[i] == '' && i != 'start') {
                    delete param[i];
                };
            };
            console.log(param)

            $.hello({
                url: CONFIG.URL + "/api/oa/student/getStudentCenter",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.StudentList = data.context.items;
                        var list = data.context.items;
                        for (var i = 0, len = list.length; i < len; i++) {
                            list[i].typePhone = relation(list[i].potentialCustomerParentType);
                            list[i].typeTwoPhone = relation(list[i].potentialCustomerParentTowType);
                            list[i].typeThreePhone = relation(list[i].potentialCustomerParentThreeType);
                            list[i].dater = list[i].lastLoginTime ? yznDateFormatYMd(list[i].lastLoginTime) : "-";
                        }
                        renderPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                        if (needPop && $scope.totalNum == 0) {
                            var msg;
                            if ($scope.studNavJud == 1) {
                                msg = "在读学员列表没有搜索到数据，是否搜索历史学员？";
                            } else {
                                msg = "历史学员列表没有搜索到数据，是否搜索在读学员？";
                            }
                            var isConfirm = layer.confirm(msg, {
                                title: "确认信息",
                                skin: 'newlayerui layeruiCenter',
                                closeBtn: 1,
                                offset: '30px',
                                move: false,
                                area: '560px',
                                btn: ['确定', '取消'] //按钮
                            }, function() {
                                if ($scope.studNavJud == 1) {
                                    //                                  studentStatus="1";
                                    $scope.studNavJud = 2;
                                } else {
                                    //                                  studentStatus="0";
                                    $scope.studNavJud = 1;
                                    }
                                pagerRender = false;
                                getStudentList("0");
                                layer.close(isConfirm);
                                $scope.$apply();
                            }, function() {
                                layer.close(isConfirm);
                            })
                        }
                    }
                }
            })
        }

        function renderPager(total) { //分页
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
                    getStudentList(start); //回掉
                }
            });
        }

        function load_student() {
            $("#upfile").val("");
            $("#progress_content").hide();
            layerOpen('upload_pop');
        }
        //上传文件
        $("#upfile").on('change', function() {
            layer.load(0);
            $('#form_load').ajaxSubmit({
                url: CONFIG.URL + '/api/oa/upFile/StudentUpload',
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('token', localStorage.getItem('oa_token'));
                },
                success: resutlMsg,
                error: errorMsg
            });

            function resutlMsg(data) {
                if (data.status == "200") {
                    layer.msg('导入成功', {
                        icon: 1
                    });
                } else {
                    layer.msg("导入失败", {
                        icon: 5
                    });
                }
                if (data.message) {
                    $("#progress_content").show().text("").text(data.message);
                }
                $("#upfile").val("");
                layer.closeAll('loading');
                getStudentList(start);
            }

            function errorMsg(data) {
                layer.msg("导入失败", {
                    icon: 5
                });
                $("#progress_content").show().text("").text(data.message);
                $("#upfile").val("");
                layer.closeAll('loading');
            }

        });

        function export_config() {
            //          if($scope.derTime) {
            //              var beginTime = $scope.derTime.split(' 到 ')[0]+" 00:00:00";
            //              var endTime = $scope.derTime.split(' 到 ')[1]+" 23:59:59";
            //              var token=localStorage.getItem('oa_token');
            //              window.open(CONFIG.URL + "/api/oa/statistics/consultantStudentList?beginTime=" + beginTime+ '&&endTime=' + endTime + '&&token=' + token);
            //          };
            var token = localStorage.getItem('oa_token');

            var data = {
                "token": token,
                'classType': classType,
                'courseId': courseId,
                'schoolYear': $year,
                "schoolTermId": term,
                'classId': classId,
                'surplusTime': surplusTime,
                'searchName': searchName,
                'searchType': searchName ? 'appSearchName' : undefined,
                "studentStatus": $scope.studNavJud == 1 ? "0" : $scope.studNavJud == 2 ? "1" : undefined,
                //              'courseTimeType':$scope.an_keshi?"0":$scope.an_tian?"1": undefined,
                'grade': grade,
                'tagId': searchMark,
                'schoolName': searchSchool,
                'birthMonth': birthMonth,
                'beginAge': searchAge.minAge || '',
                'endAge': searchAge.maxAge || '',
                //              'orderTyp':orderTyp,
                //              'orderName':orderName,
            }
            if ($scope.studNavJud == 1) {
                data["orderTyp"] = orderTyp_1;
                data["bindingWxApp"] = $scope.bindingWxApp ? "0" : undefined;
                data["oweType"] = $scope.qianke ? "1" : undefined;
                data["suspendClass"] = $scope.xiuke ? "1" : undefined;
            } else {
                data["orderTyp"] = orderTyp_2;
                data["orderName"] = orderName;
                if ($scope.searchTime) {
                    data["endCourseBeginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                    data["endCourseEndTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
                }
            }
            for (var i in data) {
                if (data[i] == '' || data[i] == undefined) {
                    delete data[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantStudentList?' + $.param(data));
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
        //报名
        function openSignUp(data) {
            var param = {
                'page': $scope.page,
                'item': data,
                'title': '报名',
                'location': "outside",
            };
            window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
        }
        //新生报名
        function newStudSignup() {
            var param = {
                'page': $scope.page,
                'item': {},
                'title': '新生报名',
                'location': "outside",
            };

            window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
        }
        //编辑学员
        function editStudent(data) {
            var param = {
                'page': $scope.page,
                'item': data,
                'type': "edit",
                'location': "outside",
            };
            window.$rootScope.yznOpenPopUp($scope, 'add-infos', 'addPotential', '760px', param);
        }

        function deleteStud(x) {
            var isConfirm = layer.confirm('是否删除该学员？', {
                title: "确认删除信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/student/deleteStudent",
                    type: "POST",
                    data: JSON.stringify({
                        'potentialCustomerId': x.potentialCustomerId
                    }),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('已成功删除学员', {
                                icon: 1
                            });
                            getStudentList(start);
                        };
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }

        function editRemark(x) {
            var params = {
                "potentialCustomerId": x.id,
                "potentialCustomerDesc": x.value,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/sale/updatePotentialCustomerDesc',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        getStudentList(start)
                        $(".edit_remark").removeClass("open");
                    }
                }
            });
        }
        var shareHref = window.location.protocol + '//' + window.location.host;
        if (window.location.host == 'www.yizhiniao.com') {
            shareHref = window.location.protocol + '//' + 'm.yizhiniao.com';
        }
        //自助绑定家长端
        function bindParent() {
            $('#PosterCode').attr('src', CONFIG.URL + '/api/oa/pushOrder/getWxQrCode?shopId=' + localStorage.getItem('shopId') + "&v=" + new Date().getTime());
            $('#PosterCode1').attr('src', CONFIG.URL + '/api/oa/pushOrder/getWxQrCode?shopId=' + localStorage.getItem('shopId') + "&v=" + new Date().getTime());
            $('#PosterCodeH5').html('');
            jQuery('#PosterCodeH5').qrcode({
                render: "canvas", //也可以替换为table
                width: 64,
                height: 64,
                text: shareHref + '/h5/common/poster/index.html?shopId=' + localStorage.getItem('shopId')
            });
            openPopByDiv("自助绑定家长端", ".checkStudent_pop", "760px");
        }

        function saveThePoster() {
            function convertCanvasToImage(canvas) {
                var img = new Image();
                img.src = canvas.toDataURL("image/png", 1);
                return img;
            }
            var mycanvas = document.createElement('canvas'),
                imgPost = new Image,
                imgQrcode = new Image,
                bs = 4;
            imgQrcode.src = CONFIG.URL + '/api/oa/pushOrder/getWxQrCode?shopId=' + localStorage.getItem('shopId') + "&v=" + new Date().getTime();
            imgPost.src = './static/img/qiantai.png' + "?v=" + new Date().getTime();
            imgQrcode.crossOrigin = "Anonymous";
            imgPost.crossOrigin = "Anonymous";
            mycanvas.width = 443 * bs;
            mycanvas.height = 620 * bs;

            var ctx = mycanvas.getContext('2d');
            promiseAll = [
                new Promise(function(resolve) {
                    imgPost.onload = function() {
                        resolve(imgPost)
                    }
                }),
                new Promise(function(resolve) {
                    imgQrcode.onload = function() {
                        resolve(imgQrcode)
                    }
                })
            ];
            Promise.all(promiseAll).then(function(img) {
                ctx.drawImage(imgPost, 0, 0, 443 * bs, 620 * bs);
                ctx.drawImage(imgQrcode, 124 * bs, 12.5 * bs, 195 * bs, 195 * bs);
                var img = convertCanvasToImage(mycanvas);
                $('body').append("<a id='czbj' href=" + img.src + " download='前台展示二维码'><span>openit</span></a>");
                $('#czbj').hide();
                $('#czbj span').trigger("click");
                $('#czbj').remove();
            })
        }
    }]
});