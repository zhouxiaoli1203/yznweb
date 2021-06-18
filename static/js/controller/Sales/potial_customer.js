define(['MyUtils', "jqFrom", "laydate", "dateTeacher", "pagination", "mySelect", "remarkPop", "customPop", "addInfos", "potential_pop", "signUp", "operation", "oldCalendar", "hopetime", "qiniu", "courseAndClass_sel", 'orderInfo', 'potial_sel', 'importPop', 'classroomPop', 'listenPop','directives'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$timeout', '$compile', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout, $compile) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var orderTyp, orderName, searchType, searchStatus, searchStudent, searchCourse, searchActivity, talkingDate, adviserId, marketerId, searchSource, searchSource2, listenTry, searchIntent, searchGrade, searchMark, searchSchool, likeName; //筛选条件：筛选类型、状态、沟通记录、沟通记录几天的状态、顾问、来源渠道、试听、搜索框
        $scope.searchTime = ""; //潜客时间选择器
        var global_potentialId, oaUserId, oaUserName; //全局变量潜客ID
        var toUserId = "",
            toUserName = ""; //顾问分配的全局参数
        var pop_dialog; //潜客选择弹框
        var orderSort = "desc"; //潜客分配默认降序
        $scope.adviser_ = []; //已选择的潜客
        $scope.potential_channel = false;
        $scope.hasSecondType = false; //二级渠道隐藏
        $scope.isOverninety = false; //待处理条数+隐藏
        $scope.isActivity = false; //隐藏活动筛选，只有渠道为易帜独秀时才显示出来
        $scope.showInd = null;
        $scope.showRecdInd = null;
        $scope.select_params = []; //已选勾选数据
        var dataList = [];
        var searchAge = {};
        //      意向度、意向课程、顾问、最近沟通、回访时间、状态、录入时间。
        var heads = [
            { name: "姓名", checked: true, fixed: "1" },
            //          {name:"联系方式",checked:true,fixed:"2"},
            { name: "年龄", checked: false },
            { name: "意向度", checked: true },
            { name: "意向课程", checked: true },
            { name: "顾问", checked: true },
            { name: "最近跟进时间", checked: true },
            { name: "最近跟进记录", checked: true },
            { name: "下次跟进时间", checked: true },
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
            { name: "录入时间", checked: true },
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
            getPotentialCustomerListTotal(); //获取潜客头部数据

            $scope.isAllpotential = checkAuthMenuById("13"); //判断是否全部潜客
            $scope.addPotiental = checkAuthMenuById("14"); //操作潜客
            $scope.isGuwenFenpei = checkAuthMenuById("15"); //顾问分配
            $scope.isDaoru = checkAuthMenuById("16"); //导入潜客
            $scope.isDaochu = checkAuthMenuById("17"); //导出潜客
            $scope.deletePotial = checkAuthMenuById("108"); //删除潜客
            $scope.caclBirthToAge = caclBirthToAge; //计算年龄
            $scope.studNavJud_big = 1;
            $scope.studNavJud = 0;
            $scope.switchStudNav_big = switchStudNav_big;
            $scope.switchStudNav = switchStudNav;
            $scope.drop_common_tab_box = drop_common_tab_box; //显示基础页 筛选

            //筛选栏数据
            getAdviserName(); //获取顾问列表
            getMarkerName(); //采单员
            getChannelList();
            $scope.selectInfoNameId = 'studentName'; //select初始值
            $scope.kindSearchData = {
                studentName: '姓名、昵称、联系方式、备注',
            };
            //          姓名、联系方式、意向度、意向课程、顾问、最近沟通、回访时间、状态、出生日期、年龄、来源、标签、学校、年级、录入时间、操作。

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
                }, {
                    'name': '顾问',
                    'width': '100',
                    td: `<td>{{x.oaUserName}}</td>`
                },
                {
                    'name': '最近跟进时间',
                    'width': '120',
                    'id': 'lastRecordTime',
                    'issort': true,
                    td: `<td >{{x.dater}}</td>`
                },
                {
                    'name': '最近跟进记录',
                    'width': '300',
                    td: `<td class="cursor_pointer overheight" ng-click="openOpreatePop(x,'跟进记录')" ng-mouseenter="showContent(x,$index,$event)" ng-mouseleave="hideContent()">
                    <div ng-if="x.lastRecord && (x.lastRecord.potentialCustomerRecordType == 3||x.lastRecord.potentialCustomerRecordType == 10||x.lastRecord.potentialCustomerRecordType == 18||x.lastRecord.potentialCustomerRecordType == 19||x.lastRecord.potentialCustomerRecordType == 25)">
                        <div>【{{x.lastRecord.potentialCustomerRecordType | _potRecordType}}】</div>
                        <div class="lis" style="white-space: nowrap;" ng-if="x.lastRecord.potentialCustomerRecordType == 3">报名课程：<span>{{x.lastRecord.contractRenews[0].courseName}}</span></div>
                        <div class="lis" style="white-space: nowrap;" ng-if="x.lastRecord.potentialCustomerRecordType == 10||x.lastRecord.potentialCustomerRecordType == 25">预约来访时间：{{x.lastRecord.workTime | yznDate:'yyyy-MM-dd HH:mm'}}</div>
                        <div class="lis" style="white-space: nowrap;" ng-if="x.lastRecord.potentialCustomerRecordType == 18||x.lastRecord.potentialCustomerRecordType == 19">试听课程：<span>{{x.lastRecord.arrangingCourses.courseName}}</span>，上课时间：{{x.lastRecord.arrangingCourses.beginDate?(x.lastRecord.arrangingCourses.beginDate | beginEndDate: x.lastRecord.arrangingCourses.endDate: 'yyWeek_hh' : x.lastRecord.arrangingCourses.week):""}}</div>
                    </div>
                    <div ng-if="x.lastRecord && !(x.lastRecord.potentialCustomerRecordType == 3||x.lastRecord.potentialCustomerRecordType == 10||x.lastRecord.potentialCustomerRecordType == 18||x.lastRecord.potentialCustomerRecordType == 19||x.lastRecord.potentialCustomerRecordType == 25)">{{x.lastRecord.potentialCustomerRecordDesc}}</div>
	                <div class="showXuanfu" ng-show="$index == showInd_ && x.lastRecord">
	                    <div ng-if="(x.lastRecord.potentialCustomerRecordType == 3||x.lastRecord.potentialCustomerRecordType == 10||x.lastRecord.potentialCustomerRecordType == 18||x.lastRecord.potentialCustomerRecordType == 19||x.lastRecord.potentialCustomerRecordType == 25)">
	                        <div>【{{x.lastRecord.potentialCustomerRecordType | _potRecordType}}】</div>
	                        <div class="lis" ng-if="x.lastRecord.potentialCustomerRecordType == 3">报名课程：<span>{{x.lastRecord.contractRenews[0].courseName}}</span></div>
	                        <div class="lis" ng-if="x.lastRecord.potentialCustomerRecordType == 10||x.lastRecord.potentialCustomerRecordType == 25">预约来访时间：{{x.lastRecord.workTime | yznDate:'yyyy-MM-dd HH:mm'}}</div>
	                        <div class="lis" ng-if="x.lastRecord.potentialCustomerRecordType == 18||x.lastRecord.potentialCustomerRecordType == 19">
	                            <div>试听课程：{{x.lastRecord.arrangingCourses.courseName}}</div>
	                        	<div>上课时间：{{x.lastRecord.arrangingCourses.beginDate?(x.lastRecord.arrangingCourses.beginDate | beginEndDate: x.lastRecord.arrangingCourses.endDate: 'yyWeek_hh' : x.lastRecord.arrangingCourses.week):""}}</div>
	                        </div>
	                    </div>
	                    <div ng-if="!(x.lastRecord.potentialCustomerRecordType == 3||x.lastRecord.potentialCustomerRecordType == 10||x.lastRecord.potentialCustomerRecordType == 18||x.lastRecord.potentialCustomerRecordType == 19||x.lastRecord.potentialCustomerRecordType == 25)">{{x.lastRecord.potentialCustomerRecordDesc}}</div>
                    </div>
                </td>`
                },
                {
                    'name': '下次跟进时间',
                    'width': '150',
                    'id': 'return_time',
                    'issort': true,
                    td: `<td ng-class='{"1":"fontColor_ff595e"}[x.returnTimeType]'>{{x.returnTime_}}</td>`
                },
                {
                    'name': '跟进状态',
                    'align': 'center',
                    'width': '100',
                    td: `<td class="operate overflow-normal textAlignCenter">
                        <div class="drop_status cursor_pointer" ng-class='{"0":"red","1":"gray","2":"blue","3":"gray","4":"orange","5":"yellow","6":"green","7":"green","8":"yellow"}[x.potentialCustomerStatus]'>
                            <btn-drop  drop-type="click" drop-title="{{x.status}}" drop-list="{{x.dropStatus}}" drop-id="{{x}}"  drop-click="changeListStatus(m)" drop-father="true"></btn-drop>
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
                    'name': '录入时间',
                    'width': '150',
                    'id': 'potentialCustomer_date',
                    'issort': true,
                    td: `<td>{{x.potentialCustomerDate | yznDate:'yyyy-MM-dd HH:mm'}}</td>`
                },
                {
                    'name': '',
                    'align': 'center',
                    'width': '180',
                    fixed: '-1',
                    td: `<td></td>`
                }
            ];

            $scope.search_track = getConstantList(CONSTANT.POTENTIALCUSTOMERSTATUS, [0, 4, 5, 6, 8, 7, 2, 3, 1]); //获取潜客状态的列表
            $scope.search_studentType = getConstantList(CONSTANT.STUDENTTYPE_, [0, 1, 2]); //获取学员类型的列表
            //          $scope.screen_source = getConstantList(CONSTANT.POTENTIAL_SOURCE); //获取潜客来源的列表(0电话来访 1 校区到访 2 熟人推荐 3 地推活动 4 网络宣传 5内部推荐)
            $scope.intentList = getConstantList(CONSTANT.PTL_INTENT_SHOW);
            $scope.gradeList = getConstantList(CONSTANT.STUDENTGRADE); //潜客年级列表
            $scope.screen_time = [ //筛选-沟通期限
                {
                    name: '今天',
                    value: '1',
                    dateStatus: '0'
                },
                {
                    name: '2天内',
                    value: '2',
                    dateStatus: '0'
                },
                {
                    name: '3天内',
                    value: '3',
                    dateStatus: '0'
                },
                {
                    name: '超过3天',
                    value: '3',
                    dateStatus: '1'
                },
                {
                    name: '一周内',
                    value: '7',
                    dateStatus: '0'
                },

                {
                    name: '超过一周',
                    value: '7',
                    dateStatus: '1'
                },
                {
                    name: '超过半个月',
                    value: '15',
                    dateStatus: '1'
                },
                {
                    name: '超过一个月',
                    value: '30',
                    dateStatus: '1'
                }
            ];

            //  获取工作台数据
            if ($stateParams.screenValue.name == 'workbench') {
                if ($stateParams.screenValue.type == '快捷入口') {
                    //                  loadPopups($scope, ['addInfos'], function() {   //确认添加潜客弹框组件加载完毕
                    window.$rootScope.yznOpenPopUp($scope, 'add-infos', 'addPotential', '760px', $scope.datas);
                    //                  })
                }
                if ($stateParams.screenValue.type == '待处理') {
                    $scope.studNavJud = $stateParams.screenValue.value;
                }
            };

            /***********以下是调用函数的方法***************/
            $scope.mouseover = mouseover; //试听状态移入
            $scope.mouseleave = mouseleave; //试听状态移出
            $scope.showRecord = showRecord; //点击潜客沟通记录按钮
            $scope.hideRecord = hideRecord; //移除
            $scope.sortCllict = sortCllict; //排序
            $scope.searchByCourse = searchByCourse; //按意向课程搜索
            $scope.searchByActivity = searchByActivity; //按活动名称搜索
            $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
            $scope.SearchData = SearchData; //按钮搜索
            $scope.searchByFind = searchByFind;
            $scope.searchByStudent = searchByStudent;
            $scope.searchByDate = searchByDate;
            $scope.searchByAdviser = searchByAdviser;
            $scope.searchByMaker = searchByMaker;
            $scope.searchByChannelType = searchByChannelType;
            $scope.searchByChannel = searchByChannel;
            $scope.searchByListen = searchByListen;
            $scope.searchByIntent = searchByIntent;
            $scope.searchByGrade = searchByGrade;
            $scope.searchByMark = searchByMark;
            $scope.searchBySchool = searchBySchool;
            $scope.searchByAge = searchByAge;
            $scope.changeChannel = changeChannel; //无渠道
            $scope.onReset = onReset; //筛选项重置按钮
            $scope.export_config = export_config; //导出潜客确认
            $scope.editRemark = editRemark; //编辑学员备注

            $scope.closePop = closePop; //取消弹框按钮
            $scope.delAdviser_ = delAdviser_; //删除选择潜客列表
            SERVICE.COURSEANDCLASS.POTIAL['potial_sel'] = selectPtial_confirm; //已选择的潜客
            $scope.destri_confirm = destri_confirm; //潜客分配确认
            $scope.openPop = openPop; //打开各类弹出框
            $scope.openOpreatePop = openOpreatePop; //打开各种弹出框传值
            $scope.changeListStatus = changeListStatus; //切换潜客状态
            $scope.sel_allFun = checkboxAllFun; //全选本页数据
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            $scope.patchChange = patchChange; //批量转让
            $scope.patchReturn = patchReturn; //批量放回公池
            $scope.showContent = showContent;
            $scope.hideContent = hideContent;


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
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新增潜客") {
                    setTimeout(function () {
                        $scope.goCommonPop('add-infos','addPotential','760px',$scope.datas);
                    })
                }
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "导入潜客") {
                    setTimeout(function () {
                        $scope.goCommonPop('import-pop','import_popup','860px',{page:'潜客'});
                    })
                }
                if ($scope.$stateParams.screenValue.searchData) {
                    likeName = $rootScope.globalSearchVal;
                    setTimeout(function () {
                        $scope.kindSearchOnreset_["potialSearch"](likeName);
                    });
                }
            }
            getPotentialCustomerList(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }


        SERVICE.CUSTOMPOP.TABLE["潜客表头-自定义"] = function(data) {
            $scope.checkedHead = data.customTag;
        }
        $scope.$watch("checkedHead", function(n, o) {
            //          if(n === o || n == undefined) return;   //防止第一次重复监听
            $scope.nameListThead_ = getTableHead($scope.checkedHead, $scope.nameListThead);
            $timeout(function() {
                $scope.reTheadData_['potHead']();
                $scope.$broadcast("potialTdChange", $scope.checkedHead);
            }, 100, true)

        }, true);


        function showContent(x, ind, e) {
            if (x.lastRecord && !x.lastRecord.potentialCustomerRecordDesc && !(x.lastRecord.potentialCustomerRecordType == 3 || x.lastRecord.potentialCustomerRecordType == 10 || x.lastRecord.potentialCustomerRecordType == 18 || x.lastRecord.potentialCustomerRecordType == 19 || x.lastRecord.potentialCustomerRecordType == 25)) {
                return;
            }
            $scope.showInd_ = ind;
            var e_ = $(e.currentTarget);
            var top_ = e_.offset().top - 30;
            var left_ = e_.offset().left + 100;
            var $this = $(e.target);
            $this.closest("td").find(".showXuanfu").css({
                left: left_,
                top: top_
            });
        }

        function hideContent() {
            $scope.showInd_ = null;
        }
        // 其他骚操作
        $scope.otherFun = {
            sendMsg: function(type, _da, sp) { //发送短信
                console.log(type, _da);
                switch (type) {
                    case 1: //点击发送短信弹框
                        $scope.adviser_ = [];
                        $scope.sendMsgData = {
                            sendContent: '', //短信内容
                            messageInfo: null,
                        };
                        //获取分校短信功能基本信息
                        $.hello({
                            url: CONFIG.URL + '/api/oa/sms/getShopSmsInfo',
                            type: "get",
                            data: {},
                            success: function(res) {
                                if (res.status == 200) {
                                    console.log(res);
                                    $scope.sendMsgData.messageInfo = res.context;
                                };
                            }
                        });

                        openPopByDiv('发送短信', '.send_message', '760px');
                        //                      $scope.selectPotential=$scope.potialSel_popup;//点击分配潜客按钮
                        break;
                    case 2: //确定发送短信
                        console.log($scope.adviser_);
                        console.log($scope.messageTemplate);
                        var a1 = [];
                        angular.forEach($scope.adviser_, function(v) {
                            a1.push({ 'id': v.id, 'name': v.name });
                        });
                        if (a1.length == 0) return layer.msg('收件潜客不能为空');
                        params = {
                            'channel': 1,
                            'title': $scope.sendMsgData.sendContent,
                            'receiver': JSON.stringify({
                                'students': a1.length > 0 ? a1 : undefined,
                            })
                        };
                        //提交数据
                        $.hello({
                            url: CONFIG.URL + '/api/oa/notification/send',
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(res) {
                                if (res.status == 200) {
                                    layer.close(dialog);
                                };
                            }
                        });
                        break;
                }
            },
        }

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

        function switchStudNav(n) {
            $scope.studNavJud = n;
            switch (n) {
                case 0:
                    orderTyp = "desc";
                    orderName = "lastRecordTime";
                    break;
                case 1:
                    orderTyp = "desc";
                    orderName = "lastRecordTime";
                    break;
                case 2:
                    orderTyp = "asc";
                    orderName = "return_time";
                    break;
                case 3:
                    orderTyp = "desc";
                    orderName = "return_time";
                    break;
                default:
                    break;
            }
            $scope.sel_all = false;
            $scope.select_params = [];
            pagerRender = false; //分页重新加载
            getPotentialCustomerList(0);
            getPotentialCustomerListTotal();
        }
        $scope.$on("changeMark", function() {
            getMarkList();
        });

        function getPotentialCustomerListTotal() {
            $.hello({
                url: CONFIG.URL + '/api/oa/potentialCustomer/getPotentialCustomerListTotal',
                type: 'get',
                success: function(data) {
                    if (data.status == "200") {
                        $scope.potHead = {
                            newAllot: data.context.newAllot, //新分配
                            todayFollow: data.context.todayFollow, //今日未跟进
                            pastFollow: data.context.pastFollow //过去未跟进
                        }
                    }
                }
            })
        }
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
            getPotentialCustomerListTotal();
        });
        //重置筛选栏
        function onReset() {
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.searchTime = orderTyp = orderName = searchType = searchStatus = searchStudent = searchCourse = searchActivity = talkingDate = adviserId = marketerId = searchSource = searchSource2 = listenTry = searchIntent = searchGrade = searchMark = searchSchool = likeName = "";
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
                        $scope.screen_adviser = data.context;
                        $scope.screen_adviser.unshift({ "teacherName": "无顾问", "shopTeacherId": "-1" });
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

        function searchByDate(val) {
            if (val == null) {
                talkingDate = null;
            } else {
                talkingDate = val;
            }
            pagerRender = false;
            getPotentialCustomerList(0);
        }

        function searchByAdviser(val) {
            if (val == null) {
                adviserId = null;
            } else {
                adviserId = val.shopTeacherId;
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

        function searchByListen(val) {
            if (val == null) {
                listenTry = null;
            } else {
                listenTry = val.value;
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

        function changeChannel() {
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
            getPotentialCustomerListTotal();
        });
        // 列表载入
        function getPotentialCustomerList(start_) {
            start = start_ == 0 ? "0" : start_;
            if (!talkingDate) {
                talkingDate = {
                    value: '',
                    dateStatus: ''
                }
            }
            var params = {
                quartersId: 2, // 岗位类型id: 判断是否是主管
                searchType: likeName ? 'appSearchName' : undefined,
                searchName: likeName,
                status: searchStatus,
                studentFrom: searchStudent,
                courseId: searchCourse,
                activityId: searchActivity,
                date: talkingDate.value, // 沟通日期: ''-全部, 3, 7, 15, 31
                dateStatus: talkingDate.dateStatus, //沟通日期类型（今天、2天内、三天内、一周内为0）
                oaUserId: adviserId || '',
                marketerId: marketerId || '',
                channelTypeId: searchSource || '',
                channelId: searchSource2 || '',
                auditionRecordStatus: listenTry || '',
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
                noChannelStatus: $scope.potential_channel ? "1" : undefined,
                dataType: $scope.studNavJud ? $scope.studNavJud : undefined
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
                            // list[i].dater = timeAgo(list[i].speakTime ? list[i].speakTime : list[i].potentialCustomerDate);
                            list[i].dater = timeAgo(list[i].lastRecordTime);
                            list[i].status = list[i].potentialCustomerStatus ? CONSTANT.POTENTIALCUSTOMERSTATUS[list[i].potentialCustomerStatus] : "";
                            list[i].listen = list[i].auditionRecordStatus ? CONSTANT.POTENTIAL_TRYLISTEN[list[i].auditionRecordStatus] : "";
                            list[i].intents = list[i].intent ? CONSTANT.PTL_INTENT_SHOW[list[i].intent] : "";
                            list[i].dropData = getDropList(list[i].potentialCustomerStatus, list[i]);
                            list[i].dropStatus = getDropStatus(list[i].potentialCustomerStatus);
                            list[i].typePhone = relation(list[i].potentialCustomerParentType);
                            list[i].typeTwoPhone = relation(list[i].potentialCustomerParentTowType);
                            list[i].typeThreePhone = relation(list[i].potentialCustomerParentThreeType);
                            list[i].returnTime_ = changeTime(list[i].returnTime);
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

            var $M_box3 = $('.M-box3.potial');

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

        function showRecord(x, ind, e) {

            $scope.showRecdInd = ind;
            $.hello({
                url: CONFIG.URL + "/api/oa/sale/getPotentialCustomerRecord",
                type: "get",
                data: {
                    id: x.potentialCustomerId
                },
                needLoading: false,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.potentialCustomerRecord = data.context;
                        $scope.potentialCustomerRecord[0].potentialCustomerRecordTypeT = CONSTANT.POTENTIALCUSTOMERRECORDTYPEFORSHOW[$scope.potentialCustomerRecord[0].potentialCustomerRecordType];

                        var e_ = $(e.currentTarget);
                        if (e_) {
                            var top_ = e_.offset().top + 30;
                            var left_ = e_.offset().left;
                            var $this = $(e.target);
                            $this.closest("td").find(".openPop").css({
                                left: left_,
                                top: top_
                            });
                        }
                    };
                }
            })
        }

        function hideRecord(e) {
            $scope.showRecdInd = null;
        }


        function getDropList(status, x) { //每条数据的下拉内容
            var arr = [];
            if ($scope.addPotiental) {
                arr = [{
                    index: "0",
                    name: "编辑"
                }, {
                    index: "1",
                    name: "预约来访"
                }, {
                    index: "2",
                    name: "暂无意向"
                }, {
                    index: "3",
                    name: "标为无效"
                }];
                if (x.oaUserName) {
                    arr.push({
                        index: "4",
                        name: "转让潜客"
                    }, {
                        index: "5",
                        name: "放回公池"
                    });
                }
            }
            return arr;
        }

        function getDropStatus(status) {
            var arr = [];
            //          if(!(status == 1 || status == 3)){
            arr = getConstantList(CONSTANT.POTENTIALCUSTOMERSTATUS, [0, 4, 6, 7]);
            //          }
            return arr;
        }

        function changeTime(t) {
            var tday = yznDateFormatYMd(new Date());
            var tday_tm = yznDateFormatYMd(yznDateAdd(new Date(), 1))
            var vday = yznDateFormatYMd(t);
            var vTime = yznDateFormatHm(t);
            if (tday == vday) {
                return "今天" + vTime;
            } else if (tday_tm == vday) {
                return "明天" + vTime;
            } else {
                return yznDateFormatYMdHm(t);
            }
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
                url: CONFIG.URL + '/api/oa/potentialCustomer/updateFollowUpStatus',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        getPotentialCustomerList(start);
                    }
                }
            });
        }

        function openPop(x) {
            $scope.potType = x.type.name;
            global_potentialId = x.item.potentialCustomerId;
            oaUserId = x.item.oaUserId;
            oaUserName = x.item.oaUserName;
            openOpreatePop(x.item, x.type.name);
            //          switch (x.type.name) {
            //              case "编辑":
            //                  openOpreatePop(x.item,"编辑");
            //                  break;
            //              case "预约来访":
            //                  openOpreatePop(x.item,"预约来访");
            //                  break;
            //              case "暂无意向":
            //                  $scope.potentDesc="";
            //                  openPopByDiv(x.type.name,".changeStatusPop","660px");
            //                  break;
            //              case "标为无效":
            //                  $scope.potentDesc="";
            //                  openPopByDiv(x.type.name,".changeStatusPop","660px");
            //                  break;
            //              case "转让潜客":
            //                  $scope.isBatch = false;
            //                  getAdvers();
            //                  openPopByDiv(x.type.name,".changePotPop","660px");
            //                  break;
            //              case "放回公池":
            //                  $scope.isBatch = false;
            //                  $scope.potentDesc="";
            //                  openPopByDiv(x.type.name,".changeStatusPop","660px");
            //                  break;
            //              default:
            //                  break;
            //          }
        }

        function patchChange() {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择需要转让的潜客");
            }
            var param = {
                'title': '转让潜客',
                'page': $scope.page,
                'item': $scope.select_params,
                'location': "outside",
                'isBatch': true
            };
            window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'changePotPop', '660px', param);
        }

        function patchReturn() {
            if ($scope.select_params.length <= 0) {
                return layer.msg("请选择需要放回公池的潜客");
            }
            $scope.potentDesc = "";
            openPopByDiv("放入公池", ".changeStatusPop", "660px");
            $scope.changeStatus_confirm = function() {
                var params = {
                    //              7 (暂无意向) 8 (标为无效) 22 放回公池
                    "potentialCustomerRecordType": 22,
                    "desc": $scope.potentDesc,
                    "potentialCustomerList": getArrPotIds($scope.select_params)
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/potentialCustomer/batchReturn',
                    type: 'post',
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == 200) {
                            $scope.$emit('potentialChange', true);
                            layer.close(dialog);
                        }
                    }
                });
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
        }
        //打开弹出框
        function openOpreatePop(data, type) {
            $scope.potInfo = angular.copy(data);
            var param = {
                'page': $scope.page,
                'item': data,
                'location': "outside"
            };
            switch (type) {
                case "添加跟进":
                    param.tab = CONSTANT.POTENTIALPOP.TAB_2;
                    param.title = '添加跟进';
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'popup_addTalk_pop', '660px', param);
                    break;
                case "预约来访":
                    param.tab = CONSTANT.POTENTIALPOP.TAB_2;
                    param.title = '预约来访';
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'popup_yuyueCome', '660px', param);
                    break;
                case "暂无意向":
                    param.title = '暂无意向';
                    param.operateType = 7;
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'changeStatusPop', '660px', param);
                    break;
                case "标为无效":
                    param.title = '标为无效';
                    param.operateType = 8;
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'changeStatusPop', '660px', param);
                    break;
                case "放回公池":
                    param.title = '放回公池';
                    param.operateType = 22;
                    param.isBatch = false;
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'changeStatusPop', '660px', param);
                    break;
                case "转让潜客":
                    param.title = '转让潜客';
                    param.isBatch = false;
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'changePotPop', '660px', param);
                    break;
                case "编辑":
                    param.type = "edit";
                    window.$rootScope.yznOpenPopUp($scope, 'add-infos', 'addPotential', '760px', param);
                    break;
                case "跟进记录":
                    param.tab = CONSTANT.POTENTIALPOP.TAB_2;
                    param.title = '跟进记录';
                    window.$rootScope.yznOpenPopUp($scope, 'pot-pop', 'potential_pop', '960px', param);
                    break;
                case "预约试听":
                    param.choseType = "radio";
                    param.callBackName = "潜客-预约试听";
                    window.$rootScope.yznOpenPopUp($scope, 'listen-pop', 'choseListen', '1060px', param);
                    break;
                case "报名":
                    param.title = '报名';
                    window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
                    break;
                default:
                    break;
            }
        }
        //      $scope.$on("潜客-预约试听",function(evt,data){
        //          console.log(data);
        //          var param = {
        //              arrangingCoursesId:data?data.arrangingCoursesId:undefined,
        //              potentialCustomerId:$scope.potInfo.potentialCustomerId,
        //          };
        //          $.hello({
        //              url: CONFIG.URL + '/api/oa/potentialCustomer/addAudition',
        //              type: 'post',
        //              data: JSON.stringify(param),
        //              success: function(data) {
        //                  if(data.status == 200){
        //                      pagerRender = false;
        //                      getPotentialCustomerList(0);
        //                  }
        //              }
        //          });
        //      });
        function export_config() {
            var token = localStorage.getItem('oa_token');
            if (!talkingDate) {
                talkingDate = {
                    value: '',
                    dateStatus: ''
                }
            }
            var params = {
                token: token,
                quartersId: 2, // 岗位类型id: 判断是否是主管
                searchType: likeName ? 'appSearchName' : undefined,
                searchName: likeName,
                status: searchStatus,
                studentFrom: searchStudent,
                courseId: searchCourse,
                activityId: searchActivity,
                date: talkingDate.value, // 沟通日期: ''-全部, 3, 7, 15, 31
                dateStatus: talkingDate.dateStatus, //沟通日期类型（今天、2天内、三天内、一周内为0）
                oaUserId: adviserId || '',
                marketerId: marketerId || '',
                channelTypeId: searchSource || '',
                channelId: searchSource2 || '',
                auditionRecordStatus: listenTry || '',
                intent: searchIntent || '',
                grade: searchGrade || '',
                tagId: searchMark || '',
                schoolName: searchSchool || '',
                beginAge: searchAge.minAge || '',
                endAge: searchAge.maxAge || '',
                listType: 1,
                orderName: orderName,
                orderTyp: orderTyp,
                noChannelStatus: $scope.potential_channel ? "1" : undefined,
                dataType: $scope.studNavJud ? $scope.studNavJud : undefined
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

        function openPopByDiv2(title, div, width) {
            pop_dialog = layer.open({
                type: 1,
                title: title,
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                anim: 0,
                area: width ? width : '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(div)
            })
        }

        function selectPtial_confirm(d) {
            angular.forEach(d, function(val) {
                var judge = true;
                angular.forEach($scope.adviser_, function(val_) {
                    if (val.potentialCustomerId == val_.potentialCustomerId) {
                        judge = false;
                    }
                })
                if (judge) {
                    $scope.adviser_.push(val);
                }
            })
        }

        function delAdviser_(ind) {
            $scope.adviser_.splice(ind, 1);
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
                        getPotentialCustomerListTotal();
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

    }]
});