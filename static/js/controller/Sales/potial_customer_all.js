define(['MyUtils', "jqFrom", "laydate", "dateTeacher", "pagination", "mySelect", "remarkPop", "customPop", "addInfos", "potential_pop", "signUp", "operation", "oldCalendar", "hopetime", "qiniu", "courseAndClass_sel", 'orderInfo', 'potial_sel', 'importPop', 'classroomPop'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$timeout', '$compile', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout, $compile) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var orderTyp = 'desc',
            orderName = 'allotTime',
            searchType, searchStudent, searchCourse, marketerId, searchActivity, searchSource, searchSource2, searchIntent, searchGrade, searchMark, searchSchool, likeName; //筛选条件：筛选类型、状态、沟通记录、沟通记录几天的状态、顾问、来源渠道、试听、搜索框
        var searchStatus = "-1";
        screen_setDefaultField($scope, function() {
            $scope.screen_goReset['跟进状态']('未签约');
        })
        $scope.searchTime = ""; //潜客时间选择器
        var global_potentialId, oaUserId, oaUserName; //全局变量潜客ID
        var toUserId = "",
            toUserName = ""; //顾问分配的全局参数
        $scope.adviser_ = []; //已选择的潜客
        $scope.hasSecondType = false; //二级渠道隐藏
        $scope.isOverninety = false; //待处理条数+隐藏
        $scope.isActivity = false; //隐藏活动筛选，只有渠道为易帜独秀时才显示出来
        $scope.potential_channel = false;
        $scope.showInd = null;
        $scope.showRecdInd = null;
        $scope.select_params = []; //已选勾选数据
        var dataList = [];
        var searchAge = {};
        //      学员姓名、联系方式、年龄、意向度、意向课程、顾问、跟进状态、学员类型、出生日期、来源、标签、学校、年级、备注、转入时间。
        var heads = [
            { name: "姓名", checked: true, fixed: "1" },
            { name: "年龄", checked: false },
            { name: "意向度", checked: true },
            { name: "意向课程", checked: true },
            { name: "跟进状态", checked: true },
            { name: "学员类型", checked: true },
            { name: "出生日期", checked: false },
            { name: "渠道类型", checked: false },
            { name: "来源", checked: false },
            { name: "采单员", checked: true },
            { name: "标签", checked: false },
            { name: "学校", checked: false },
            { name: "年级", checked: false },
            { name: "备注", checked: false },
            { name: "转入时间", checked: true },
            { name: "操作", checked: true, fixed: "-1" },
        ];
        /*--------以上是全局变量-----------*/
        init();

        function init() {
            if ($rootScope.fromOrgn) {
                $scope.checkedHead = heads;
            } else {
                getCustomTag();
            }
            $scope.page = CONSTANT.PAGE.POTENTIAL;
            $scope.datas = {
                page: $scope.page,
                type: 'add',
                item: {},
                location: 'outside'
            };
            getMarkList(); //标签列表
            getSchoolList(); //学校列表
            getCourseId(); //获取意向课程列表
            getMarkerName(); //采单员列表

            $scope.isAllpotential = checkAuthMenuById("13"); //判断是否全部潜客
            $scope.addPotiental = checkAuthMenuById("14"); //操作潜客
            $scope.isGuwenFenpei = checkAuthMenuById("15"); //顾问分配
            $scope.isDaoru = checkAuthMenuById("16"); //导入潜客
            $scope.isDaochu = checkAuthMenuById("17"); //导出潜客
            $scope.deletePotial = checkAuthMenuById("108"); //删除潜客
            $scope.caclBirthToAge = caclBirthToAge; //计算年龄
            $scope.studNavJud_big = 2;
            $scope.switchStudNav_big = switchStudNav_big;
            $scope.drop_common_tab_box = drop_common_tab_box; //显示基础页 筛选

            //筛选栏数据
            getAdviserName(); //获取顾问列表
            getChannelList();
            $scope.selectInfoNameId = 'studentName'; //select初始值
            $scope.kindSearchData = {
                studentName: '姓名、昵称、联系方式、备注',
            };
            //      学员姓名、联系方式、年龄、意向度、意向课程、顾问、跟进状态、学员类型、出生日期、来源、标签、学校、年级、备注、转入时间。
            $scope.nameListThead = [{
                    'name': '',
                    'width': '320',
                    fixed: '1',
                    td: '<td></td>'
                },
                {
                    'name': '年龄',
                    'width': '100',
                    td: `<td ng-bind-html="caclBirthToAge(x.age,x.birthday)"></td>`
                },
                {
                    'name': '意向度',
                    'width': '100',
                    'id': 'intent',
                    'issort': true,
                    td: `<td>{{x.intents}}</td>`
                }, {
                    'name': '意向课程',
                    'width': '100',
                    td: `<td title="{{x.courseStr}}">{{x.courseStr}}</td>`
                },
                {
                    'name': '跟进状态',
                    'align': 'center',
                    'width': '100',
                    td: `<td class="operate overflow-normal textAlignCenter">
                        <div class="drop_status cursor_pointer" ng-class='{"0":"red","1":"gray","2":"blue","3":"gray","4":"orange","5":"yellow","6":"green","7":"green","8":"yellow"}[x.potentialCustomerStatus]' style="color:#fff;line-height:20px;">
                        {{x.status}}
                        </div>
                    </td>`
                },
                {
                    'name': '学员类型',
                    'width': '100',
                    td: `<td>{{x.studentFrom | _studentType}}</td>`
                },
                {
                    'name': '出生日期',
                    'width': '100',
                    td: `<td>{{x.birthday}}</td>`
                },
                {
                    'name': '渠道类型',
                    'width': '100',
                    td: `<td title='{{x.channelTypeName}}'>
                        <span>{{x.channelTypeName}}</span>
                    </td>`
                },
                {
                    'name': '来源',
                    'width': '140',
                    td: `<td title='{{x.channelName}}'>
                        <span>{{x.channelName}}</span>
                    </td>`
                },
                {
                    'name': '采单员',
                    'width': '140',
                    td: `<td title='{{x.marketerName}}'>
                        <span>{{x.marketerName}}</span>
                    </td>`
                },
                {
                    'name': '标签',
                    'width': '100',
                    td: `<td>
                        <span class="separate_list"><span ng-repeat="y in x.tags">{{y.name}}</span></span>
                    </td>`
                },
                {
                    'name': '学校',
                    'width': '100',
                    td: `<td>{{x.schoolName}}</td>`
                },
                {
                    'name': '年级',
                    'width': '100',
                    td: `<td>{{x.grade| _grade}}</td>`
                },
                {
                    'name': '备注',
                    'width': '200',
                    td: `<td class="remarks overflow-normal">
                    <remark-view view-data="{{x.potentialCustomerDesc}}"></remark-view>
                    <remark-edit edit-id="{{x.potentialCustomerId}}" ng-show="addPotiental" edit-title="备注" edit-text="{{x.potentialCustomerDesc}}" edit-length="500" edit-otext="{{x.potentialCustomerDesc}}" edit-click="editRemark(n)"></remark-edit>
                </td>`
                },
                {
                    'name': '转入时间',
                    'width': '150',
                    'id': 'allotTime',
                    'issort': true,
                    'sort': 'desc',
                    td: `<td>{{x.allotTime?(x.allotTime|yznDate:'yyyy-MM-dd HH:mm'):(x.potentialCustomerDate | yznDate:'yyyy-MM-dd HH:mm')}}</td>`
                },
                {
                    'name': '',
                    'align': 'center',
                    'width': '180',
                    fixed: '-1',
                    td: `<td></td>`
                }
            ];

            $scope.search_track = getConstantList(CONSTANT.POTENTIALCUSTOMERSTATUS, [-1, 0, 4, 5, 6, 8, 7, 2, 3, 1]); //获取潜客状态的列表
            $scope.search_studentType = getConstantList(CONSTANT.STUDENTTYPE_, [0, 1, 2]); //获取学员类型的列表
            //          $scope.screen_source = getConstantList(CONSTANT.POTENTIAL_SOURCE); //获取潜客来源的列表(0电话来访 1 校区到访 2 熟人推荐 3 地推活动 4 网络宣传 5内部推荐)
            $scope.intentList = getConstantList(CONSTANT.PTL_INTENT_SHOW);
            $scope.gradeList = getConstantList(CONSTANT.STUDENTGRADE); //潜客年级列表

            //  获取工作台数据
            if ($stateParams.screenValue.name == 'workbench') {
                if ($stateParams.screenValue.type == '快捷入口') {
                    //                  loadPopups($scope, ['addInfos'], function() {   //确认添加潜客弹框组件加载完毕
                    window.$rootScope.yznOpenPopUp($scope, 'add-infos', 'addPotential', '760px', $scope.datas);
                    //                  })
                }
            };

            /***********以下是调用函数的方法***************/
            $scope.mouseover = mouseover; //试听状态移入
            $scope.mouseleave = mouseleave; //试听状态移出
            $scope.sortCllict = sortCllict; //排序
            $scope.searchByCourse = searchByCourse; //按意向课程搜索
            $scope.searchByActivity = searchByActivity; //按活动名称搜索
            $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
            $scope.SearchData = SearchData; //按钮搜索
            $scope.searchByFind = searchByFind;
            $scope.searchByStudent = searchByStudent;
            $scope.searchByChannelType = searchByChannelType;
            $scope.searchByChannel = searchByChannel;
            $scope.searchByIntent = searchByIntent;
            $scope.searchByMaker = searchByMaker;
            $scope.searchByGrade = searchByGrade;
            $scope.searchByMark = searchByMark;
            $scope.searchBySchool = searchBySchool;
            $scope.searchByAge = searchByAge;
            $scope.changeChannel = changeChannel;
            $scope.onReset = onReset; //筛选项重置按钮
            $scope.export_config = export_config; //导出潜客确认
            $scope.editRemark = editRemark; //编辑学员备注
            $scope.closePop = closePop; //取消弹框按钮
            $scope.openOpreatePop = openOpreatePop; //打开各种弹出框传值
            $scope.changeListStatus = changeListStatus; //切换潜客状态
            $scope.sel_allFun = checkboxAllFun; //全选本页数据
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            // $scope.setShopInstal = setShopInstal; //公池设置needdel__cz
            // $scope.shopInstal_confirm = shopInstal_confirm; //公池设置确认needdel__cz
            getPotentialCustomerList(0);
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getPotentialCustomerList(0);
                }
            });
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
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }


        SERVICE.CUSTOMPOP.TABLE["潜客公池-自定义"] = function(data) {
            $scope.checkedHead = data.customTag;
        }
        $scope.$watch("checkedHead", function(n, o) {
            //          if(n === o || n == undefined) return;   //防止第一次重复监听
            $scope.nameListThead_ = getTableHead($scope.checkedHead, $scope.nameListThead);
            $timeout(function() {
                $scope.reTheadData_['potHead_all']();
                $scope.$broadcast("potialTdChange_all", $scope.checkedHead);
            }, 100, true)

        }, true);

        function switchStudNav_big(n) {
            $scope.studNavJud_big = n;
            switch (n) {
                case 1:
                    $state.go("potial_customer");
                    break;
                case 2:
                    $state.go("potial_customer/all")
                    break;
                default:
                    break;
            }
        }
        $scope.$on("changeMark", function() {
            getMarkList();
        });
        //获取各页面的自定义表头  2 oa潜客 3 oa学员 4oa订单 5 oa班级
        function getCustomTag() {
            var param = {
                customTagType: 2,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/customTag/info',
                type: 'get',
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        if (data.context && data.context.customTag) {
                            $scope.getHeads = {
                                customTag: JSON.parse(data.context.customTag),
                                customTagId: data.context.customTagId
                            };
                        }
                        $scope.checkedHead = $scope.getHeads ? resetHead($scope.getHeads.customTag, heads) : heads;
                        console.log($scope.checkedHead);
                    }
                }
            })
        }

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

        function getChannelList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/channelType/list',
                type: 'get',
                data: {pageType: 0 ,channelNeed:1},
                success: function(data) {
                    if (data.status == "200") {
                        $scope.channelTypeList = data.context;
                        $scope.channelTypeList.unshift({ "channelTypeName": "无渠道", "id": "-1", "channelList": [] });
                    }
                }
            });
        }

        function getCourseId() {
            $.hello({
                url: CONFIG.URL + '/api/oa/course/getCoursesList',
                type: 'get',
                data: {
                    pageType: 0, // 不需要分页
                    courseStatus: "1"
                },
                success: function(data) {
                    // 处理课程列表
                    if (data.status == "200") {
                        $scope.courseList = data.context;
                    }
                }
            });
        }

        function getMarkerName() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: { "pageType": "0", "quartersTypeId": "11", "shopTeacherStatus": "1" },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_marketer = data.context;
                        $scope.screen_marketer.unshift({ "teacherName": "无采单员", "shopTeacherId": "-1" });
                    }

                }
            })
        }

        function getActivityList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/activity/list',
                type: 'get',
                data: { pageType: "0", totalStatus: "0" },
                success: function(data) {
                    // 处理课程列表
                    if (data.status == "200") {
                        $scope.activityList = data.context;
                    }
                }
            });
        }

        function closePop() {
            layer.close(dialog);
        }

        $scope.$on('signUpSuccess', function() {
            getPotentialCustomerList(start);
        });
        //重置筛选栏
        function onReset() {
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.searchTime = orderTyp = orderName = searchType = searchStudent = searchStatus = searchCourse = marketerId = searchActivity = searchSource = searchSource2 = searchIntent = searchGrade = searchMark = searchSchool = likeName = "";
            $scope.potential_channel = false;
            searchAge = {};
            $scope.kindSearchOnreset(); //调取app重置方法
            $scope.ageSearchOnreset_["potiental"](); //调取app重置方法
            pagerRender = false; //分页重新加载
            getPotentialCustomerList(0);
        }

        function getAdviserName() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data: { pageType: '0', quartersTypeId: '3', shopTeacherStatus: '1' },
                success: function(data) {
                    if (data.status == "200") {
                        $scope.list_adviser = angular.copy(data.context);
                    }
                }
            });
        }

        function changeChannel() {
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function sortCllict(data) {
            orderTyp = data.sort;
            orderName = data.id;
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByCourse(val) {
            if (val == null) {
                searchCourse = '';
            } else {
                searchCourse = val.courseId;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByActivity(val) {
            if (val == null) {
                searchActivity = '';
            } else {
                searchActivity = val.activityId;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }
        //回车键  删除键
        function Enterkeyup(data) {
            likeName = data.value;
            searchType = data.type;
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        //搜索button
        function SearchData(data) {
            likeName = data.value;
            searchType = data.type;
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByFind(val) { //状态查找
            if (val == null) {
                searchStatus = '';
            } else {
                searchStatus = val.value;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByStudent(val) { //学员类型查找
            if (val == null) {
                searchStudent = '';
            } else {
                searchStudent = val.value;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByChannelType(data) {
            $scope.hasSecondType = false;
            $scope.isActivity = false;
            searchSource2 = "";
            $scope.channelList = "";
            searchActivity = "";
            if (!data) {
                searchSource = "";
                $scope.hasSecondType = false;
            } else {
                searchSource = data.id;
                searchSource2 = "";
                if (data.channelTypeName !== "易知独秀") {
                    if (data.channelList.length > 0) {
                        $scope.channelList = data.channelList;
                        $scope.hasSecondType = true;
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['来源渠道']('');
                        });
                    } else {
                        $scope.channelList = "";
                        $scope.hasSecondType = false;
                    }
                } else if (data.channelTypeName == "易知独秀") {
                    $scope.isActivity = true;
                    getActivityList(); //获取活动列表
                    screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['活动']('');
                    });
                }
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByChannel(data) {
            if (!data) {
                searchSource2 = "";
            } else {
                searchSource2 = data.id;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByIntent(val) {
            if (val == null) {
                searchIntent = null;
            } else {
                searchIntent = val.value;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByMaker(val) {
            if (val == null) {
                marketerId = null;
            } else {
                marketerId = val.shopTeacherId;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByGrade(val) {
            if (val == null) {
                searchGrade = null;
            } else {
                searchGrade = val.value;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByMark(val) {
            if (val == null) {
                searchMark = null;
            } else {
                searchMark = val.id;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchBySchool(val) {
            if (val == null) {
                searchSchool = null;
            } else {
                searchSchool = val.schoolName;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByAge(a) {
            searchAge = a;
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        $scope.$on('potentialChange', function(evt, startPage) {
            if (startPage) {
                pagerRender = false;
                getPotentialCustomerList(0);
            } else {
                getPotentialCustomerList(start);
            }
            $scope.sel_all = false;
            $scope.select_params = [];
        });
        // 列表载入
        function getPotentialCustomerList(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                quartersId: 2, // 岗位类型id: 判断是否是主管
                searchType: likeName ? 'appSearchName' : undefined,
                searchName: likeName,
                status: searchStatus,
                studentFrom: searchStudent,
                courseId: searchCourse,
                marketerId: marketerId || '',
                activityId: searchActivity,
                channelTypeId: searchSource || '',
                channelId: searchSource2 || '',
                intent: searchIntent || '',
                grade: searchGrade || '',
                tagId: searchMark || '',
                schoolName: searchSchool || '',
                beginAge: searchAge.minAge || '',
                endAge: searchAge.maxAge || '',
                start: start_.toString() || '0',
                count: eachPage,
                listType: 1,
                orderName: orderName,
                orderTyp: orderTyp,
                pool: "1",
                noChannelStatus: $scope.potential_channel ? "1" : undefined,
            };
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            // 去掉为空字段
            for (var one in params) {
                if (params[one] === '') {
                    delete params[one];
                }
            }
            $.hello({
                url: CONFIG.URL + '/api/oa/sale/getPotentialCustomerList',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        var list = data.context.items;
                        for (var i = 0, len = list.length; i < len; i++) {
                            list[i].dater = timeAgo(list[i].speakTime ? list[i].speakTime : list[i].potentialCustomerDate);
                            list[i].status = list[i].potentialCustomerStatus ? CONSTANT.POTENTIALCUSTOMERSTATUS[list[i].potentialCustomerStatus] : "";
                            list[i].intents = list[i].intent ? CONSTANT.PTL_INTENT_SHOW[list[i].intent] : "";
                            list[i].dropStatus = getDropStatus(list[i].potentialCustomerStatus);
                            list[i].typePhone = relation(list[i].potentialCustomerParentType);
                            list[i].typeTwoPhone = relation(list[i].potentialCustomerParentTowType);
                            list[i].typeThreePhone = relation(list[i].potentialCustomerParentThreeType);
                            list[i].courseStr = arrToStr(list[i].courses, "courseName");
                        }
                        $scope.potentialList = list;
                        $scope.totalNum = data.context.totalNum;
                        repeatLists($scope.potentialList, $scope.select_params, 'potentialCustomerId');
                        potentialPager(data.context.totalNum);
                    }

                }
            });
        };

        function potentialPager(total) {
            var len = 0;
            angular.forEach($scope.potentialList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.potentialList.length > 0 && $scope.potentialList.length == len) {
                $scope.sel_all = true;
            } else {
                $scope.sel_all = false;
            }
            //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }

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
                    getPotentialCustomerList(start); //回掉
                }
            });
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

        function getDropStatus(status) {
            var arr = [];
            arr = getConstantList(CONSTANT.POTENTIALCUSTOMERSTATUS, [0, 4, 5, 6, 7]);
            return arr;
        }

        function changeListStatus(m) {
            if ($rootScope.fromOrgn) {
                return;
            }
            var params = {
                potentialCustomerId: m.item.potentialCustomerId,
                potentialCustomerStatus: m.type.value
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/potentialCustomer/update',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        getPotentialCustomerList(start);
                    }
                }
            });
        }
        //打开弹出框
        function openOpreatePop(type, x, isBatch) {
            $scope.isBatch = isBatch;
            var params = {};
            switch (type) {
                case "领取":
                    if (isBatch && x.length <= 0) {
                        return layer.msg("请选择需要领取的潜客");
                    }
                    if (isBatch) {
                        params["potentialCustomerList"] = getArrPotIds(x);
                    } else {
                        params["potentialCustomerList"] = [{ potentialCustomerId: x.potentialCustomerId }];
                    }
                    params["potentialCustomerRecordType"] = 26;
                    params["toId"] = localStorage.getItem('shopTeacherId');
                    detailMsk("是否确认领取" + (isBatch ? "选中" : "该") + "潜客？", function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/sale/toPotentialCustomer',
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.$emit("potentialChange", true);
                                }

                            }
                        })
                    })
                    break;
                case "分配":
                    if (isBatch && x.length <= 0) {
                        return layer.msg("请选择需要分配的潜客");
                    }
                    if (!isBatch) {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/sale/getPotentialCustomerOaUser',
                            type: 'get',
                            data: {
                                potentialCustomerId: x.potentialCustomerId
                            },
                            success: function(data) {
                                if (data.status == "200") {
                                    $scope.descedList = [];
                                    angular.forEach(data.context, function (x) {
                                        if (x.type==1) {
                                            $scope.descedList.push(x);
                                        }
                                    });
                                }
                            }
                        });
                    }
                    $scope.unselectedList = "";
                    openPopByDiv(isBatch ? "批量分配" : "分配", ".adverDes_pop", "660px");
                    $scope.adverDes_confirm = function() {
                        if (isBatch) {
                            params["potentialCustomerList"] = getArrPotIds(x);
                        } else {
                            params["potentialCustomerList"] = [{ potentialCustomerId: x.potentialCustomerId }];
                        }
                        params["toId"] = $scope.unselectedList;
                        params["potentialCustomerRecordType"] = 5;
                        $.hello({
                            url: CONFIG.URL + '/api/oa/sale/toPotentialCustomer',
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200') {
                                    layer.close(dialog);
                                    $scope.$emit("potentialChange", true);
                                }

                            }
                        })
                    }
                    break;
                case "删除":
                    if (isBatch && x.length <= 0) {
                        return layer.msg("请选择需要删除的潜客");
                    }
                    if (isBatch) {
                        params["potentialCustomers"] = getArrPotIds(x);
                    } else {
                        params["potentialCustomers"] = [{ potentialCustomerId: x.potentialCustomerId }];
                    }
                    detailMsk("是否确认删除" + (isBatch ? "选中" : "该") + "潜客？", function() {
                        $.hello({
                            url: CONFIG.URL + '/api/oa/potentialCustomer/deleteList',
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(data) {
                                if (data.status == '200' || data.status == '205') {
                                    $scope.$emit("potentialChange", true);
                                }

                            }
                        })
                    })
                    break;
                default:
                    break;
            }
        }

        function getArrPotIds(list) {
            var arr = [];
            if (list && list.length > 0) {
                angular.forEach(list, function(v) {
                    arr.push({
                        potentialCustomerId: v.potentialCustomerId
                    });
                });
            }
            return arr;
        }

        function export_config() {
            var token = localStorage.getItem('oa_token');
            var params = {
                token: token,
                quartersId: 2, // 岗位类型id: 判断是否是主管
                searchType: likeName ? 'appSearchName' : undefined,
                searchName: likeName,
                status: searchStatus,
                studentFrom: searchStudent,
                courseId: searchCourse,
                marketerId: marketerId || '',
                activityId: searchActivity,
                channelTypeId: searchSource || '',
                channelId: searchSource2 || '',
                intent: searchIntent || '',
                grade: searchGrade || '',
                tagId: searchMark || '',
                schoolName: searchSchool || '',
                beginAge: searchAge.minAge || '',
                endAge: searchAge.maxAge || '',
                listType: 1,
                orderName: orderName,
                orderTyp: orderTyp,
                pool: "1",
                noChannelStatus: $scope.potential_channel ? "1" : undefined,
            };

            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            for (var i in params) {
                if (params[i] == '' || params[i] == undefined) {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantPotentialCustomer?' + $.param(params));
        }

        function destri_confirm() {
            if ($scope.adviser_.length <= 0) {
                layer.msg("请添加潜客");
                return;
            }
            var params = {
                "toId": $scope.adviser !== "1" ? $scope.adviser : undefined,
                "potentialCustomerList": getPtials()
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/sale/toPotentialCustomer',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == 200) {
                        //                      pagerRender = false;
                        getPotentialCustomerList(start);
                        layer.close(dialog);
                    }
                }
            });
        }

        function getPtials() {
            var arr = [];
            angular.forEach($scope.adviser_, function(v, k) {
                var obj = {};
                obj.potentialCustomerId = v.potentialCustomerId;
                arr.push(obj);
            });
            return arr;
        }

        function drop_common_tab_box() {
            if ($scope.displayblock == true) {
                $scope.displayblock = false;
            } else {
                $scope.displayblock = true;
            }
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
                        getPotentialCustomerList(start);
                        $(".edit_remark").removeClass("open");
                    }
                }
            });
        }
        //以下公池设置 needdel__cz
        // function setShopInstal() {
        //     getShopInstal();
        //     openPopByDiv("公池设置", ".shopInstal_pop", "660px");
        // }

        // function getShopInstal() {
        //     $.hello({
        //         url: CONFIG.URL + '/api/oa/setting/shopInstal/info',
        //         type: 'get',
        //         success: function(data) {
        //             if (data.status == "200") {
        //                 $scope.shopInstal = data.context;
        //             }
        //         }
        //     });
        // }
        // $scope.changeStatus = function(e, val, model) {
        //     $scope.shopInstal[model] = e.target.checked ? val : "0";
        // }

        // function shopInstal_confirm() {needdel__cz
        //     var param = angular.copy($scope.shopInstal);
        //     $.hello({
        //         url: CONFIG.URL + '/api/oa/setting/shopInstal/update',
        //         type: 'post',
        //         data: JSON.stringify(param),
        //         success: function(data) {
        //             if (data.status == "200") {
        //                 closePop();
        //             }
        //         }
        //     });
        // }

    }]
});