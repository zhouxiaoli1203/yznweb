define(["laydate", "pagination", "jqFrom", "mySelect", "moreSelect", "directives","remarkPop", "datePicker", "classPop", "courseAndClass_sel", "timesel", 'photoPop', 'clockPop', 'importPop', 'clsaffairPop', "customPop", "arrangePop"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', 'SERVICE', function($scope, $rootScope, $http, $state, $stateParams, $timeout, SERVICE) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var searchType, searchName, $course, $classFull, shopTeacherId, deanId, $status = '1',
            $year, $term;
        var orderName = "class_name",
            orderTyp = "asc",
            orderName_2 = "end_date",
            orderTyp_2 = "desc";
        var class_dialog, goupClass_dialog;
        $scope.searchTime = "";
        $scope.classList = '';
        $scope.wait_graduate = false; //待结业
        $scope.wait_inclass = false; //开班待定
        $scope.appoint = false; //约课
        $scope.isAddClass = false; //是否为新增班级
        $scope.compareType = false;
        $scope.compareType1 = false;
        $scope.activityStatus = undefined;
        //      班级、课程、适龄、学员人数、开班时间、上课时间、老师、上课教室、教学进度、预计结业日期、备注、操作。
        var heads = [
            { name: "班级", checked: true, fixed: "1" },
            { name: "课程", checked: true },
            { name: "适龄", checked: true },
            { name: "学员人数", checked: true },
            { name: "开班时间", checked: true },
            { name: "上课时间", checked: true },
            { name: "老师", checked: true },
            { name: "上课教室", checked: true },
            { name: "教学进度", checked: true },
            { name: "预计结业日期", checked: true },
            { name: "备注", checked: false },
            { name: "操作", checked: true, fixed: "-1" },
        ];
        init();

        function init() {
            $scope.datas = {
                type: 'add',
                title: '新增班级',
                item: {}
            };
            if ($rootScope.fromOrgn) {
                $scope.checkedHead = heads;
            } else {
                getCustomTag();
            }
            //           getChannelList();//获取来源
            getTermList(); //获取学期
            getCourseList(); //获取课程
            getClassroomList(); //获取教室
            getTeachersList(); //获取老师列表
            geteducateManagList(); //获取教务列表
            //      班级、课程、适龄、学员人数、开班时间、上课时间、老师、上课教室、教学进度、预计结班日期、备注、操作。
            $scope.inclassThead = [
                { 'name': '', 'width': '170', 'issort': true, 'sort': 'asc', 'id': 'class_name', fixed: "1", td: `<td></td>` },
                { 'name': '课程', 'width': '170', td: `<td title="{{x.course.courseName}}">{{x.course.courseName}}</td>` },
                { 'name': '适龄', 'width': '70', td: `<td><span ng-if="x.beginAge && x.endAge">{{x.beginAge}}-{{x.endAge}}岁</span></td>` },
                { 'name': '学员人数', 'width': '90', 'issort': true, 'align': 'center', 'id': 'student_total', td: `<td class="textAlignCenter">{{x.studentTotal}}/{{x.classMax}}</td>` },
                { 'name': '开班时间', 'width': '115', 'issort': true, 'id': 'begin_date', td: `<td>{{x.beginDate?(x.beginDate | yznDate:'yyyy-MM-dd'):"待定"}}</td>` },
                { 'name': '上课时间', 'width': '130', td: `<td title="{{x.classTemplateDates_str}}"><span ng-repeat="y in x.classTemplateDates">每{{y.week | _zhouweek}} {{y.beginTime}}-{{y.endTime}}&nbsp;&nbsp;</span></td>` },
                { 'name': '老师', 'width': '160', td: `<td title="{{x.teacherStr}}">{{x.teacherStr}}</td>` },
                { 'name': '上课教室', 'width': '120', td: `<td>{{x.classRoomName}}</td>` },
                { 'name': '教学进度', 'width': '100', 'align': 'center', td: `<td class="textAlignCenter">{{x.rollcalledLessonNum}}/{{x.arrangingCoursesTotal}}</td>` },
                { 'name': '预计结业日期', 'width': '130', td: `<td>{{x.endDate | yznDate:'yyyy-MM-dd'}}</td>` },
                { 'name': '备注', 'width': '200', td: `<td title="{{x.classDesc}}">{{x.classDesc}}</td>` },
                { 'name': '', 'align': 'center', 'width': '180', fixed: "-1", td: `<td></td>` }
            ];
            $scope.inclassThead_left = [
                { 'name': '班级', 'width': '170', 'issort': true, 'sort': 'asc', 'id': 'class_name' },
            ];
            $scope.compelteThead = [
                { 'name': '班级', 'width': '230' },
                { 'name': '课程', 'width': '25%' },
                { 'name': '适龄', 'width': '15%' },
                { 'name': '学员人数', 'width': '15%', 'issort': true, 'align': 'center', 'id': 'student_total' },
                { 'name': '老师', 'width': '15%' },
                { 'name': '授课课次', 'width': '15%', 'align': 'center' },
                { 'name': '结业时间', 'width': '15%', 'issort': true, 'sort': 'desc', 'id': 'end_date' },
                { 'name': '操作', 'width': '100'}
            ];
            $scope.selectInfoNameId = 'className'; // select初始值
            $scope.kindSearchData = {
                className: '班级名称'
            };
            $scope.bookingSture = getFunctionStatus(0x0002);
            $scope.isOperate = checkAuthMenuById("34");
            //          $scope.classFullType=getConstantList(CONSTANT.CLASSFULLTYPE);//班级满班情况
            $scope.getClassType = getClassType; //获取班级列表
            $scope.caclBirthToAge = caclBirthToAge; //学员的年龄、生日显示规则
            $scope.classNavJud = 1;
            $scope.switchClassNav = switchClassNav; //切换班级tab页
            $scope.onReset = onReset; //重置
            $scope.Enterkeyup = Enterkeyup; //回车搜索 删除
            $scope.SearchData = SearchData; //按钮搜索
            $scope.searchByCourse = searchByCourse; //课程筛选
            $scope.sortCllict = sortCllict; //在课班级切换排序
            $scope.sortCllict2 = sortCllict2; //结业班级切换排序
            $scope.searchByTech = searchByTech; //老师筛选
            $scope.searchByEducateMg = searchByEducateMg; //教务筛选
            $scope.fullClass = fullClass; //切换满班
            $scope.unfullClass = unfullClass; //切换未满班
            $scope.unPaike = unPaike; //切换未排课
            $scope.graduate = graduate; //切换待结业
            $scope.inclass = inclass; //切换开班待定
            $scope.chargeType = chargeType; //切换一对一
            $scope.chargeClassType = chargeClassType; //标准班，活动班
            $scope.chargeAppoint = chargeAppoint; //切换约课
            $scope.screen_years = getFrom2017(true,8); //学年
            $scope.changeYear = changeYear; //按学年
            $scope.changeTerm = changeTerm; //按学期
            $scope.cancelGrad = cancelGrad;//取消结业

            $scope.openPop = openPop; //打开各类弹出框
            $scope.openOpreatePop = openOpreatePop;
            //          $scope.gotoAddClass = gotoAddClass; //新增班级
            //          $scope.confirm_class = confirm_class; //新增班级确认
            $scope.gotoUpclass = GOTOUPCLASS; //批量升班
            //          $scope.closeClass_dialog = closeClass_dialog; //关闭新增班级
            //          $scope.changeGetPage = changeGetPage; //选择课程，学期显示与隐藏
            //          $scope.changeGetPack = changeGetPack;//新增班级切换学期
            //          $scope.sel_teachers = sel_teachers; //选取意愿老师
            //          $scope.delTeachers = delTeachers; //删除意愿老师
            $scope.gotoRollCall = gotoRollCall; //点名
            $scope.export_config = export_config; //导出班级





            $scope.closePop = closePop;
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getClassList(0);
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
            if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '待处理') {
                $scope.wait_graduate = true; //筛选带结业的班级
            }
            if ($stateParams.screenValue.name == 'course_pop' && $stateParams.screenValue.value) {
                setTimeout(function() {
                    window.$rootScope.yznOpenPopUp($scope, 'class-pop', 'class_pop', '1060px', { 'item': $stateParams.screenValue.value, 'tab': 1, 'page': 'class' });
                })
            }
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新增班级") {
                    setTimeout(function () {
                        $scope.goCommonPop("class-pop", "addClass_pop", "760px", { item: "", type: "add", title: "关于班级", location: "outside" });
                    })
                }
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "导入班级") {
                    setTimeout(function () {
                        $scope.goCommonPop('import-pop','import_popup','860px',{page:'班级'});
                    })
                }
                if ($scope.$stateParams.screenValue.searchData) {
                    searchName = $rootScope.globalSearchVal;
                    searchType = "className";
                    setTimeout(function () {
                        $scope.kindSearchOnreset_["classSearch"](searchName);
                    });
                }

            }
            getClassList(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            SERVICE.CUSTOMPOP.TABLE["班级表头-自定义"] = function(data) {
                $scope.checkedHead = data.customTag;
            }
            $scope.$watch("checkedHead", function(n, o) {
                //          if(n === o || n == undefined) return;   //防止第一次重复监听
                $scope.inclassThead_ = getTableHead($scope.checkedHead, $scope.inclassThead);
                $timeout(function() {
                    $scope.reTheadData_['classHead']();
                    $scope.$broadcast("classTdChange", $scope.checkedHead);
                }, 100, true)

            }, true);
        }
        $scope.$on('classListChange', function(e, startPage, sort) {
            if (startPage == "false") {
                pagerRender = false;
                if (sort == "nosort") {
                    orderName = "";
                }
                getClassList(0);
            } else {
                pagerRender = false;
                //默认应该都是保持本页的，而不是跳到首页去
                getClassList(0);
            }
        });

        //      function getChannelList() {
        //          $.hello({
        //              url: CONFIG.URL + '/api/oa/setting/getChannelTypeLess',
        //              type: 'get',
        //              success: function(data) {
        //                  if (data.status == "200") {
        //                      $scope.channelTypeList = data.context;
        //                  }
        //              }
        //          });
        //      }
        //获取各页面的自定义表头  2 oa潜客 3 oa学员 4oa订单 5 oa班级
        function getCustomTag() {
            var param = {
                customTagType: 5,
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

        function gotoRollCall(x) {
            x.temporaryTeacher = [];
            window.$rootScope.yznOpenPopUp($scope, 'roll-call', 'rollCall', '860px', x);
        }

        function switchClassNav(n) {
            $scope.classNavJud = n;
            eachPage = 10;
            pagerRender = false;
            $scope.searchTime = "";
            searchType = searchName = $course = $classFull = shopTeacherId = deanId = undefined;
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $status = '1';
                checkSetFalse();
            } else {
                $status = '2';
                orderName_2 = "end_date";
            }
            getClassList(0);
        }
        //重置筛选栏
        function onReset() {
            searchType = searchName = $course = $classFull = shopTeacherId = deanId = $year = $term = undefined;
            $scope.compareType = false;
            $scope.compareType1 = false;
            $scope.activityStatus = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if ($scope.classNavJud == 1) {
                checkSetFalse();
            }
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false; //分页重新加载
            getClassList(0);
        }

        //回车键  删除键
        function Enterkeyup(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getClassList(0);
        }

        //搜索button
        function SearchData(data) {
            console.log($scope.modelVal);
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getClassList(0);
        }

        function searchByCourse(x) { //状态查找
            if (x == null) {
                $course = '';
            } else {
                $course = x.courseId;
            }
            pagerRender = false;
            getClassList(0);
        }

        function sortCllict(data) {
            console.log(data.sort + '--');
            orderTyp = data.sort;
            orderName = data.id;
            pagerRender = false;
            getClassList(0);
        }

        function sortCllict2(data) {
            console.log(data.sort + '--');
            orderTyp_2 = data.sort;
            orderName_2 = data.id;
            pagerRender = false;
            getClassList(0);
        }

        function changeYear(y) { //切换学期
            $year = y == null ? undefined : y.year;
            pagerRender = false;
            getClassList(0);
        }

        function changeTerm(t) { //切换学期
            $term = t == null ? undefined : t.schoolTermId;
            pagerRender = false;
            getClassList(0);
        }

        function searchByTech(x) { //状态查找
            if (x == null) {
                shopTeacherId = '';
            } else {
                shopTeacherId = x.shopTeacherId;
            }
            pagerRender = false;
            getClassList(0);
        }

        function searchByEducateMg(x) { //教务查找
            if (x == null) {
                deanId = '';
            } else {
                deanId = x.shopTeacherId;
            }
            pagerRender = false;
            getClassList(0);
        }

        function fullClass() {
            checkSetFalse("满班");
            pagerRender = false;
            getClassList(0);
        }

        function unfullClass() {
            checkSetFalse("未满班");
            pagerRender = false;
            getClassList(0);
        }

        function unPaike() {
            checkSetFalse("未排课");
            pagerRender = false;
            getClassList(0);
        }

        function graduate() {
            checkSetFalse("待结业");
            pagerRender = false;
            getClassList(0);
        }

        function inclass() {
            checkSetFalse("开班待定");
            pagerRender = false;
            getClassList(0);
        }

        function chargeType(type) {
            if (type) {
                if ($scope.compareType) {
                    $scope.compareType = true;
                    $scope.compareType1 = false;
                    $scope.activityStatus = undefined;
                }
            } else {
                if ($scope.compareType1) {
                    $scope.compareType1 = true;
                    $scope.compareType = false;
                    $scope.activityStatus = undefined;
                }
            }
            pagerRender = false;
            getClassList(0);
        }

        function chargeClassType(e, val) {
            if (e.target.checked) {
                $scope.compareType = false;
                $scope.compareType1 = false;
            }
            $scope.activityStatus = e.target.checked ? val : undefined;
            pagerRender = false;
            getClassList(0);
        }

        function chargeAppoint() {
            pagerRender = false;
            getClassList(0);
        }

        function checkSetFalse(str) {
            if (!str) {
                $scope.full_Class = false;
                $scope.un_fullClass = false;
                $scope.un_Paike = false;
                $scope.wait_graduate = false;
                $scope.wait_inclass = false;
                $scope.appoint = false;
            } else {
                switch (str) {
                    case "满班":
                        $scope.un_fullClass = false;
                        //              	$scope.un_Paike = false;
                        //                  $scope.wait_graduate = false;
                        //                  $scope.wait_inclass = false;
                        break;
                    case "未满班":
                        $scope.full_Class = false;
                        //              	$scope.un_Paike = false;
                        //                  $scope.wait_graduate = false;
                        //                  $scope.wait_inclass = false;
                        break;
                    case "未排课":
                        //              	$scope.full_Class = false;
                        //                  $scope.un_fullClass = false;
                        //                  $scope.wait_graduate = false;
                        //                  $scope.wait_inclass = false;
                        break;
                    case "待结业":
                        //              	$scope.full_Class = false;
                        //                  $scope.un_fullClass = false;
                        //                  $scope.un_Paike = false;
                        //                  $scope.wait_inclass = false;
                        break;
                    case "开班待定":
                        //              	$scope.full_Class = false;
                        //                  $scope.un_fullClass = false;
                        //                  $scope.un_Paike = false;
                        //                  $scope.wait_graduate = false;
                        break;
                    default:
                        break;
                }
            }

        }
        //以下是列表函数调用
        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: { pageType: 0 },
                success: function(data) {
                    if (data.status == '200') {
                        var arr = [],
                            arr1 = [];
                        angular.forEach(data.context, function(v) {
                            if (v.courseType == 0) {
                                arr.push(v);
                            }
                        });
                        $scope.courseList = arr;
                        angular.forEach(data.context, function(v) {
                            if (!(v.teachingMethod == 1 || v.courseType == 1)) {
                                arr1.push(v);
                            }
                        });
                        $scope.new_courseList = arr1;
                        //                      $scope.courseList = data.context.items;
                        $scope.screen_course = data.context;
                    }

                }
            })
        }

        //      function delTeachers(data, ind) {
        //          data.hasSelected = false;
        //          $scope.classDetail.teachers.splice(ind, 1);
        //      }
        //
        //      function sel_teachers(data) {
        //          var judHas = true;
        //          var judHasIndex = null;
        //          angular.forEach($scope.classDetail.teachers, function(val, index) {
        //              if(val.teacherId == data.teacherId) {
        //                  judHas = false;
        //                  judHasIndex = index;
        //              }
        //          });
        //          if(judHas) {
        //              $scope.classDetail.teachers.push(data);
        //              data.hasSelected = true;
        //          } else {
        //              $scope.classDetail.teachers.splice(judHasIndex, 1);
        //              data.hasSelected = false;
        //          }
        //      }
        function getTeachersList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: { "pageType": "0", "quartersTypeId": "1", "shopTeacherStatus": "1" },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_teacher = data.context;
                    }

                }
            })
        }

        function geteducateManagList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: { "pageType": "0", "quartersTypeId": "14", "shopTeacherStatus": "1" },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.screen_educateManag = data.context;
                    }

                }
            })
        }

        function getClassroomList(courseId) {
            var data = {
                "pageType": 0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/classroom/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        console.log(data.context);
                        $scope.classroomList = data.context.items;
                    }

                }
            })
        }


        //获取班级列表
        function getClassList(start_) {
            start = start_ == 0 ? "0" : start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                'schoolYear': $year,
                "schoolTermId": $term,
                "courseId": $course,
                "classFull": $classFull,
                "shopTeacherId": shopTeacherId,
                "classStatus": $status,
                "searchName": searchName,
                'searchType': searchType,
                "deanId": deanId,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'activityStatus': $scope.activityStatus,
                listType: 1,
            }
            if ($status == 1) {
                data["orderTyp"] = orderTyp;
                data["orderName"] = orderName;
                data["fullStatus"] = $scope.un_fullClass ? "0" : $scope.full_Class ? "1" : undefined;
                data["arrangingCoursesTotal"] = $scope.un_Paike ? "0" : undefined;
                data["needComplete"] = $scope.wait_graduate ? "1" : undefined;
                data["needOpen"] = $scope.wait_inclass ? "1" : undefined;
                data["bookingStatus"] = $scope.appoint ? "1" : undefined;
                data["classModeStatus"] = "1";
            } else {
                data["orderTyp"] = orderTyp_2;
                data["orderName"] = orderName_2;
            }
            if ($scope.searchTime) {
                data["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                data["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            for (var i in data) {
                if (data[i] == '' || data[i] == undefined) {
                    delete data[i];
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        var list = data.context.items;
                        for (var i = 0, len = list.length; i < len; i++) {
                            list[i].status = list[i].classStatus ? CONSTANT.CLASS_STATUS2[list[i].classStatus] : "";
                            list[i].dropData = getDropList(list[i].classStatus, list[i].course.teachingMethod, list[i].activityStatus);
                            list[i].teacherStr = arrToStr(list[i].teachers, "teacherName");
                            list[i].classTemplateDates_str = dateArrToStr(list[i].classTemplateDates);
                        }
                        $scope.classList = angular.copy(list);
                        classPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }

                }
            })
        };

        function dateArrToStr(arr) {
            var str = '';
            angular.forEach(arr, function(v) {
                str += "每" + returnweek(v.week) + v.beginTime + "-" + v.endTime + "  ";
            });
            return str;
        }

        function getDropList(status, method, type) { //每条数据的下拉内容
            var arr = [{
                index: "2",
                name: "编辑"
            }, {
                index: "4",
                name: "结业"
            }, {
                index: "5",
                name: "删除"
            }];
            if (method == 2 && type != 1) {
                arr.splice(1, 0, {
                    index: "3",
                    name: "升班"
                });
            }
            return arr;
        }

        function openPop(x) {
            //          global_classId = x.item.classId;
            openOpreatePop(x.item, x.type.name);
        }

        function openOpreatePop(data, type) {
            global_classId = data.classId;
            var param = {
                'item': data,
                'location': "outside"
            };
            switch (type) {
                case "本班学员":
                    param.tab = CONSTANT.CLASSPOP.TAB_3;
                    window.$rootScope.yznOpenPopUp($scope, 'class-pop', 'class_pop', '1060px', param);
                    break;
                case "班级课表":
                    param.tab = CONSTANT.CLASSPOP.TAB_2;
                    window.$rootScope.yznOpenPopUp($scope, 'class-pop', 'class_pop', '1060px', param);
                    break;
                case "编辑":
                    param.type = "edit";
                    param.title = "关于班级";
                    window.$rootScope.yznOpenPopUp($scope, 'class-pop', "addClass_pop", "760px", param);
                    break;
                case "升班":
                    param.title = '升班';
                    param.page = 'class';
                    window.$rootScope.yznOpenPopUp($scope, 'class-pop', 'shengban_pop', '960px', param);
                    break;
                case "结业":
                    param.title = '结业';
                    toGraduate(param);
                    break;
                case "删除":
                    param.title = '删除';
                    window.$rootScope.yznOpenPopUp($scope, 'class-pop', 'confirm_pop', '560px', param);
                    break;
                default:
                    break;
            }
        }

        function toGraduate() {
            var param = {
                "classId": global_classId
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/class/studentGraduation",
                type: "POST",
                data: JSON.stringify(param),
                success: function(res) {
                    console.log(res);
                    if (res.status == 200) {
                        confirmPop("班级结业后，表示该班级上课已经结束，不能再修改班<br>级信息，学员不能再插入到该班级。确定要结业吗？", {
                            "classId": global_classId,
                            "studentGraduationStatus": 1,
                        });

                    } else if (res.status == '20018') {
                        detailMsk("班级结业后，表示该班级上课已经结束，不能再修改班<br>级信息，学员不能再插入到该班级。确定要结业吗？", function() {
                            confirmPop("班级中存在未点名的课次，确定要删除未点名的课次，并完成班级结业吗？", {
                                "classId": global_classId,
                                "studentGraduationStatus": 1,
                                "deleteArrangingCourses": 1
                            });
                        }, function() {}, ["确定", "取消"]);
                        return true;
                    } else if (res.status == '20022') {
                        detailMsk("班级中存在未结束的打卡作业，不能直接结业，请单独处理后再试", null, null, ["确定"]);
                        return true;
                    }
                }
            });
        }

        function confirmPop(title, param) {
            detailMsk(title, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/studentGraduation",
                    type: "POST",
                    data: JSON.stringify(param),
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.$emit("classListChange", "false");
                        }
                    }
                })
            }, null, ["确定", "取消"]);
        }
        //以下是批量升班
        function GOTOUPCLASS() {
            var goupClass_dialog = layer.open({
                type: 1,
                title: "批量升班",
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                anim: 0,
                area: '960px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $("#goupClass_pop")
            });
            $scope.years = getSomeYears();
            $scope.testStatusold = true;
            $scope.selectedClassList = [];
            $scope.course = "";
            $scope.group_gradClass = "0"; //原班级结业默认--否
            $scope.group_courseOverStatus = "0"; //原班级结业默认--否
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['new_course']();
            });
            selgetPage(); //获取学期列表
            $scope.confirm_goupClass = confirm_goupClass; //确认升班
            $scope.close_goupClass = close_goupClass; //关闭批量升班弹出框
            $scope.courseClassSel = courseClassSel; //批量升班打开选择班级弹框
            SERVICE.COURSEANDCLASS.CLASS['批量升班-班级'] = selectClass_confirm; //已选择的潜客
            $scope.selGetPage = selGetPage; //选择新课程--学期list
            $scope.selSetYear = selSetYear; //选择新学期--设置班级
            $scope.selSetClass = selSetClass; //选择新学期--设置班级
            $scope.del_selClass = del_selClass; //删除新创建的班级
            $scope.changeGetPagePop = changeGetPagePop; //升班切换课程



            function selectClass_confirm(data) {
                var list = angular.copy($scope.selectedClassList);

                angular.forEach(data, function(v) {
                    var j = false;
                    angular.forEach(list, function(v_) {
                        if (v_.classId == v.classId) {
                            j = true;
                        }
                    });
                    if (!j) {
                        $scope.selectedClassList.push(v);
                    }
                });
                console.log($scope.selectedClassList);
                //              $scope.selectedClassList=data;
            }

            function changeGetPagePop(x) {
                $scope.itemCourse = x;
                $scope.selectedClassList = [];
            }

            function confirm_goupClass() {
                if (!get_upgradeList().msg[0]) {
                    return layer.msg(get_upgradeList().msg[1]);
                }
                if (get_upgradeList().arr.length <= 0) {
                    return layer.msg("请选择班级");
                }
                var params = {
                    "overStatus": $scope.group_gradClass == "1" ? "1" : "0",
                    "upgradeList": get_upgradeList().arr,
                    "courseOverStatus": $scope.group_courseOverStatus == "1" ? "1" : "0",
                };
                if ($scope.testStatusold) {
                    params["testStatus"] = "1";
                } else {
                    params["testStatus"] = "0";
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/upgradeList",
                    type: "POST",
                    data: JSON.stringify(params),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.testStatusold = true;
                            close_goupClass();
                            closePop();

                            $timeout(function() {
                                $scope.$emit('classListChange', '批量升班');
                            }, 1000, true)
                            return true;
                        } else if (data.status == '20014') {
                            $scope.testStatusold = false;
                            openPopByDiv("确认信息", ".class_warn_reStud");
                            $scope.reStud = function() {
                                $scope.testStatusold = false;
                                confirm_goupClass();
                            }
                            return true;
                        } else if (data.status == '20017') {

                        }


                    }
                })
            }

            function get_upgradeList() {
                var b = {
                    arr: [],
                    msg: [true, '']
                };
                var list = $scope.selectedClassList;
                for (var i = 0, len = list.length; i < len; i++) {
                    var v = list[i];
                    var obj = {};
                    obj.oldClass = {
                        "classId": v.classId,
                        "schoolYear": v.schoolTerm ? v.schoolTerm.schoolYear : undefined,
                        "schoolTermId": v.schoolTerm ? v.schoolTerm.schoolTermId : undefined
                    }
                    obj.newClass = {
                        "className": v.newClass,
                        "courseId": v.sel_course ? JSON.parse(v.sel_course).courseId : undefined,
                    }
                    if ((v.year && v.schoolTerms) || (!v.year && !v.schoolTerms)) {
                        obj.newClass["schoolYear"] = v.year ? v.year : undefined;
                        obj.newClass["schoolTermId"] = v.schoolTerms ? JSON.parse(v.schoolTerms).schoolTermId : undefined;
                        b.arr.push(obj);
                    } else {
                        b.msg = [false, "学年学期不可单一存在"];
                        break;
                    }
                }
                return b;
            }

            function close_goupClass() {
                layer.close(goupClass_dialog);
            }

            function courseClassSel(id, width, param) {
                if (!$scope.itemCourse) {
                    layer.msg("请选择课程");
                    return;
                }
                window.$rootScope.yznOpenPopUp($scope, 'course-sel', id, width, param);
            }

            function selGetPage(x, idx) {
                var selx = JSON.parse(x);
                $scope.selectedClassList[idx].selx = selx;
                $scope.selectedClassList[idx].year = "";
                $scope.selectedClassList[idx].schoolTerms = "";
                $scope.selectedClassList[idx].newClass = selx.courseName + "班";
            }

            function selSetYear(x, idx) {
                $scope.selectedClassList[idx].newClass = "";
                $scope.selectedClassList[idx].schoolTerms = "";
                if (x) {
                    $scope.selectedClassList[idx].newClass = x + " " + ($scope.selectedClassList[idx].selx ? $scope.selectedClassList[idx].selx.courseName : "") + "班";
                }
            }

            function selSetClass(x, idx) {
                $scope.selectedClassList[idx].newClass = "";
                if (x) {
                    var selx = JSON.parse(x);
                    $scope.selectedClassList[idx].newClass = $scope.selectedClassList[idx].year + " " + selx.schoolTermName + " " + ($scope.selectedClassList[idx].selx ? $scope.selectedClassList[idx].selx.courseName : "") + "班";
                } else {
                    $scope.selectedClassList[idx].newClass = $scope.selectedClassList[idx].year + " " + ($scope.selectedClassList[idx].selx ? $scope.selectedClassList[idx].selx.courseName : "") + "班";
                }
            }

            function selgetPage() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: {
                        pageType: "0"
                    },
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.selGetPackage = data.context;
                        }

                    }
                })
            }

            function del_selClass(ind) {
                var isDelect = layer.confirm('是否删除该班级？', {
                    title: "确认删除信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $scope.selectedClassList.splice(ind, 1);
                    $scope.$apply();
                    layer.close(isDelect);
                }, function() {
                    layer.close(isDelect);
                })
            }
        }

        function cancelGrad(x) {
            var msg = "<div class='textAlignCenter'>确认取消结业？<br>取消后系统将允许修改班级信息、分班、排课、升班等操作<br>(若学员已结课，则系统不会将该类型学员重新分配至本班级)</div>";
            detailMsk(msg, function () {
                $.hello({
                    url: CONFIG.URL + "/api/oa/class/cancelGraduation",
                    type: "post",
                    data: JSON.stringify({ classId: x.classId }),
                    success: function(data) {
                        if (data.status == '200') {
                            pagerRender = false; //分页重新加载
                            getClassList(0);
                        }
                    }
                })
            });
        }

        function getClassType(x) {
            var str = "";
            return str = CONSTANT.CLASSTYPE[x];
        }

        function classPager(total) { //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }

            var $M_box3 = $('.M-box3.classPage');

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
                    getClassList(start); //回调
                }
            });

        }

        function export_config() {
            var beginTime, endTime;
            var token = localStorage.getItem('oa_token');
            if ($scope.searchTime) {
                beginTime = $scope.searchTime.split(" 到")[0].trim() + " 00:00:00";
                endTime = $scope.searchTime.split(" 到")[1].trim() + " 23:59:59";
            }

            var data = {
                "beginTime": beginTime,
                "endTime": endTime,
                "token": token,
                "courseId": $course,
                "shopTeacherId": shopTeacherId,
                "classStatus": $status,
                "searchName": searchName,
                'searchType': searchType,
                'teachingMethod': $scope.compareType ? "1" : $scope.compareType1 ? "2" : undefined,
                'activityStatus': $scope.activityStatus,
            }
            if ($status == 1) {
                data["orderTyp"] = orderTyp;
                data["orderName"] = orderName;
                data["fullStatus"] = $scope.un_fullClass ? "0" : $scope.full_Class ? "1" : undefined;
                data["arrangingCoursesTotal"] = $scope.un_Paike ? "0" : undefined;
                data["needComplete"] = $scope.wait_graduate ? "1" : undefined;
                data["needOpen"] = $scope.wait_inclass ? "1" : undefined;
                data["bookingStatus"] = $scope.appoint ? "1" : undefined;
            }
            for (var i in data) {
                if (data[i] == '' || data[i] == undefined) {
                    delete data[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantClassList?' + $.param(data));
            //          if($scope.derTime) {
            //              var beginTime = $scope.derTime.split(' 到 ')[0]+" 00:00:00";
            //              var endTime = $scope.derTime.split(' 到 ')[1]+" 23:59:59";
            //              var token=localStorage.getItem('oa_token');
            //              window.open(CONFIG.URL + "/api/oa/statistics/consultantStudentList?beginTime=" + beginTime+ '&&endTime=' + endTime + '&&token=' + token);
            //          };
        }

        function closePop() {
            layer.close(dialog);
        }
    }]
})