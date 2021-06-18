define(['laydate', 'pagination', 'mySelect','students_sel','courseAndClass_sel','potential_pop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','SERVICE', function($scope, $rootScope, $http, $state, $stateParams,SERVICE) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name, search_courseId, search_classId = undefined;
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "desc";
        $scope.searchTime = "";

        init();

        function init() {
            getCourseList();//获取课程和班级的数据
            getClassList();
            $scope.studNavJud = 2;
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、手机号',
                studentNickName: '昵称',
                userPhone:'手机号'
            };
            //表头
            $scope.classListThead = [
                {
                    'name': '姓名（昵称）',
                    'width': '25%'
                },  {
                    'name': '年龄',
                    'width': '10%'
                },  {
                    'name': '联系方式',
                    'width': '15%'
                },  {
                    'name': '上课时间',
                    'width': '240',
                    'issort': true,
                    'sort': 'desc'
                }, {
                    'name': '班级',
                    'width': '15%'
                }, {
                    'name': '教室',
                    'width': '15%'
                }, {
                    'name': '上课主题',
                    'width': '15%',
                }, {
                    'name': '点名情况',
                    'width': '11%',
                    'align': 'right'
                }, {
                    'name': '操作',
                    'align': 'center',
                    'width': '140'
                },
            ];

            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    bookingArrangingList(0);
                }
            });
            $scope.operateBook = checkAuthMenuById("84"); //操作约课
            $scope.caclBirthToAge = caclBirthToAge;//计算年龄
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.courseSelect = courseSelect; //选择课程
            $scope.classSelect = classSelect; //选择班级
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop;//关闭弹框
            $scope.closeConflict = closeConflict;//关闭弹框
            $scope.cancelYueke = cancelYueke;//取消预约
            $scope.appointClass = appointClass;//预约上课
            SERVICE.COURSEANDCLASS.CLASS['预约班级'] = deterSelCourse;
            SERVICE.COURSEANDCLASS.PAIKECOURSE['预约课次'] = deterSelPaike;
            $scope.delCourse = delCourse;//删除已选的课次
            $scope.delStudents = delStudents;//删除已选的学员
            $scope.checkClass = checkClass;//选择课次和学员之前判断班级是否为空
            $scope.deterRenew = deterRenew;//预约上课确认按钮
            $scope.export_config = export_config;//导出记录
            $scope.gotoViewStudent = gotoViewStudent;//跳转学员详情
            bookingArrangingList(0);
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "预约上课") {
                    setTimeout(function () {
                        appointClass();
                    })
                }

            }
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        };

        //获取工作台数据
        if ($stateParams.screenValue.name == 'workbench' && $stateParams.screenValue.type == '快捷入口') {
            $scope.appointClass();
        };
         function gotoViewStudent(x){
            if(checkAuthMenuById("29")){
                window.$rootScope.yznOpenPopUp($scope,'pot-pop', 'potential_pop','1060px',{'page':1,'item':x,'tab':1});
            }else{
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览学员权限。");
            }
        }
        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data:{pageType:0},
                success: function(data) {
                    if (data.status == '200') {
                        var arr=[];
                        angular.forEach(data.context,function(v){
                            if(v.courseType == 0){
                                arr.push(v);
                            }
                        });
                        $scope.courseList = arr;
                    }

                }
            })
        }
         function getClassList(d){
             var p = {
                pageType: "0",
                classStatus: "1"
            };
            if(d){
                p["courseId"]=d;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.classList = data.context;
                    }
                }
            });
         }
        function closePop(){
            layer.close(dialog);
        }
        function switchStudNav(n) {
            $scope.studNavJud = n;
            search_type = search_name = search_courseId=search_classId = undefined;
            $scope.searchTime = "";

            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $state.go("edu_aboutClass", {
                    });
            }else{
                 $state.go("edu_aboutClass/record", {
                    });
            }
        }
        function searchdata(d) {
            pagerRender = false;
            search_type = d?d.type:null;
            search_name = d?d.value:null;
            bookingArrangingList(0);

        }
        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            getClassList(search_courseId);
            pagerRender = false;
            bookingArrangingList(0);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            pagerRender = false;
            bookingArrangingList(0);
        }
        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            pagerRender = false;
            bookingArrangingList(0);
        }

        function onReset() {
            search_type = search_name = search_courseId=search_classId = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            getClassList(search_courseId);
            pagerRender = false;
            bookingArrangingList(0);
        }
        $scope.$on("leaveChange",function(evt,isOldPage){
            if(isOldPage){
                bookingArrangingList(start);
            }else{
                pagerRender = false;
                bookingArrangingList(0);
            }
        });
        function bookingArrangingList(start_) { //获取请假补课列表信息
            start = start_ == 0?"0":start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                'searchType': search_name?'appSearchName':undefined,
                "searchName": search_name,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "courseId": search_courseId,
                "classId": search_classId,
            }
            if ($scope.searchTime) {
                data["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                data["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/oaBookingStudentList",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.bookingStudentList = data.context.items;
                        leavePager(data.context.totalNum);
                    }

                }
            })
        }

        function leavePager(total) { //分页
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
                    bookingArrangingList(start); //回调
                }
            });

        }
        function cancelYueke(x){
            console.log(x);
            $scope.cancel_yueke_result = '';
            $scope.confirm_cancel_yueke = function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/temporaryStudent/delete",
                    type: "post",
                    data: JSON.stringify({temporaryStudentId:x.temporaryStudent.temporaryStudentId, cancelReason: $scope.cancel_yueke_result}),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(dialog);
                            bookingArrangingList(start);
                        }

                    }
                })
            };
            $scope.close_popup = function() {
                layer.close(dialog);
            }
            openPopByDiv('取消预约', '.cancel_yueke', '650px');
        }
        function appointClass(){
            $scope.courseItemInfo = undefined;
            $scope.selPaikeList = [];
            $scope.apt_students = [];
            openPopByDiv("预约上课",".appointClass","760px");
        }
        function deterSelCourse(d){
            console.log(d);
            $scope.courseItemInfo = d;
        }
        function deterSelPaike(d){
            angular.forEach(d, function(val) {
                var judge = true;
                angular.forEach($scope.selPaikeList, function(val_) {
                    if(val.arrangingCoursesId == val_.arrangingCoursesId) {
                        judge = false;
                    }
                })
                if(judge) {
                    $scope.selPaikeList.push(val);
                }
            })
        }
        $scope.$on("预约学员",function(evt,data){
            angular.forEach(data, function(val) {
                var judge = true;
                angular.forEach($scope.apt_students, function(val_) {
                    if(val.potentialCustomer.id == val_.potentialCustomer.id) {
                        judge = false;
                    }
                })
                if(judge) {
                    $scope.apt_students.push(val);
                }
            })

        });
        function delCourse(x,ind){
            $scope.selPaikeList.splice(ind,1);
        }
        function delStudents(x,ind){
            $scope.apt_students.splice(ind,1);
        }
        function checkClass(type){
            if(!$scope.courseItemInfo){
                return layer.msg("请选择预约班级");
            }
            if(type=="lesson"){
                window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'chosePaikeCourse', '960px', {name: 'paikeCourse', type: 'checkbox',item:$scope.courseItemInfo,deleteType:'1,2',schoolYear:$scope.courseItemInfo.schoolYear,schoolTermId:$scope.courseItemInfo.schoolTermId,schoolTermName:$scope.courseItemInfo.schoolTerm?$scope.courseItemInfo.schoolTerm.schoolTermName:"", callBackName: '预约课次'});
                return;
            }
            if(type=="student"){
                window.$rootScope.yznOpenPopUp($scope,'student-sel','selectStuds_2', '760px', {name:'appoint', type: 'student2',item:$scope.courseItemInfo,courseId:$scope.courseItemInfo.activityStatus==1?undefined:$scope.courseItemInfo.course.courseId,excludeClassId:$scope.courseItemInfo.classId,choseType:'checkbox',callBackName:'预约学员'});
                return;
            }
        }
        var courseConflict;
        function deterRenew(needCheck){
            if(!$scope.courseItemInfo){
                return layer.msg("请选择预约班级");
            }
            if($scope.selPaikeList.length<=0){
                return layer.msg("请选择预约课次");
            }
            if($scope.apt_students.length<=0){
                return layer.msg("请选择预约学员");
            }
            var param={
                classId:$scope.courseItemInfo.classId,
                courseId:$scope.courseItemInfo.course.courseId,
                arrangingCourses:getlist($scope.selPaikeList,'课次'),
                contracts:getlist($scope.apt_students,'学员'),
            };
            if(needCheck){
                param["bookingProvingStatus"]="0";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/temporaryStudent/addBookingStudentList",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        closePop();
                        if(needCheck){
                           layer.close(courseConflict);
                        }
                        bookingArrangingList(start);
                    }else if(data.status == '20009'){
                        $scope.studConfList = data.context;
                        courseConflict=layer.open({
                            type: 1,
                            title: "课程冲突",
                            skin: 'layerui', //样式类名
                            closeBtn: 1, //不显示关闭按钮
                            move: false,
                            resize: false,
                            anim: 0,
                            area: '760px',
                            offset: '30px',
                            shadeClose: false, //开启遮罩关闭
                            content: $('.courseConflict')
                        });
                        return true;
                    }

                }
            })
        }
        function closeConflict(){
            layer.close(courseConflict);
        }
        function getlist(list,type){
            var arr=[];
            if(type=='课次'){
                angular.forEach(list,function(v){
                    arr.push({arrangingCoursesId:v.arrangingCoursesId});
                });
            }else{
                angular.forEach(list,function(v){
                    arr.push({
                        potentialCustomerId:v.potentialCustomer.id,
                        contractId:v.contract.contractId,
                        studentId:v.contract.studentId,
                    });
                });
            }
            return arr;
        }
        function export_config() {
            var beginTime,endTime;
            var token = localStorage.getItem('oa_token');
            if($scope.searchTime){
                beginTime = $scope.searchTime.split(" 到")[0].trim() + " 00:00:00";
                endTime = $scope.searchTime.split(" 到")[1].trim() + " 23:59:59";
            }
            var data = {
                "beginTime": beginTime,
                "endTime": endTime,
                "token": token,
                'searchType': search_type,
                "searchName": search_name,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "courseId": search_courseId,
                "classId": search_classId,
            }
            for (var i in data) {
                if (data[i] == '' || data[i] == undefined) {
                    delete data[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/exportOaBookingStudentList?' + $.param(data));
        }
    }]
})