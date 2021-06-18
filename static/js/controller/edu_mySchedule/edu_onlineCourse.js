define([ "laydate", "mySelect","jqFrom","onlinePop"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_name, search_type, shopTeacherId = undefined;
        $scope.enableType = '1';
        console.log(window.currentUserInfo);
        $scope.localTeachId = window.currentUserInfo.shopTeacherId;
        init();
        function init(){
            getTeachers();
        	$scope.selectInfoNameId = 'courseName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                courseName: '课程名称',
            };
            $scope.nameThead = [{
                'name': '课程名称',
                'width': '25%'
            }, {
                'name': '开课时间',
                'width': '12%'
            }, {
                'name': '课程负责老师',
                'width': '15%'
            }, {
                'name': '安排课次',
                'width': '12%',
                'align':'right'
            }, {
                'name': '学员人数',
                'width': '12%',
                'align':'right'
            }, {
                'name': '未点评作业',
                'width': '12%',
                'align':'right'
            }, {
                'name': '留言数量',
                'width': '100',
                'align':'right'
            }, {
                'name': '状态',
                'width': '12%',
                'align': 'center'
            }, {
                'name': '操作',
                'width': '150',
                'align': 'center'
            }, ];
            
            $scope.SearchData = searchData;
            $scope.Enterkeyup = searchData;
            $scope.changesType = changesType;
            $scope.changeTeach = changeTeach;
            $scope.changeBtn = changeBtn;
            $scope.onReset = onReset;
            
            getCourseList(0);
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        }
        function getTeachers() { //获取岗位类型list
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/list",
                    type: "get",
                    data:{pageType:"0",shopTeacherStatus:"1",quartersTypeId:"1"},
                    success: function(data) {
                        if(data.status == 200) {
                            $scope.teachersList = data.context;
                        }
                    }
                })
            }
        function changeBtn(x){
        	var msg="";
            if(x.status == 0){
                msg = "是否启用该课程？启用后，在课学员可以学习该课程。";
            }else{
                msg = "是否禁用该课程？禁用后，学员将无法继续学习。";
            }
            detailMsk(msg,function(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/onlineCourse/updateCourse",
                    type: "post",
                    data: JSON.stringify({courseId: x.courseId, status: x.status == 1 ? 0 : 1}),
                    success: function (data) {
                        if (data.status == '200') {
                            pagerRender = false;
                            getCourseList(0);
                        }
                    }
                })
            });
        }
        
        function searchData(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false;
            getCourseList(0);
        }
        function changesType(e,v){
        	$scope.enableType = e.target.checked?v:null;
        	pagerRender = false;
        	getCourseList(0);
        }
        function changeTeach(n){
            shopTeacherId = n != null?n.shopTeacherId:undefined;
            pagerRender = false;
            getCourseList(0);
        }
        function onReset(){
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            search_name = shopTeacherId = undefined;
            $scope.enableType = '1';
            pagerRender = false;
            getCourseList(0);
        }
        $scope.$on("reloadCourseOnline",function(){
        	pagerRender = false;
        	getCourseList(0);
        });
        function getCourseList(start){
        	var data = {
                "start": start.toString(),
                "count": eachPage,
                'searchType': search_name?'name':undefined,
                "searchName": search_name,
//              'orderName':'begin_date',
//              'orderTyp':'desc',
                "status": $scope.enableType,
                "shopTeacherId":$scope.localTeachId
            }
            $.hello({
                url: CONFIG.URL + '/api/oa/onlineCourse/listCourse',
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                    	var list = data.context.items;
                    	angular.forEach(list,function(v){
                    		if(v.teacherList){
                    			v.teacherStr = arrToStr(v.teacherList,"teacherName");
                    		}
                    	});
                        $scope.courselist = list;
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
            var $M_box3 = $('.M-box3.onlinec');

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
                    getCourseList(start); //回调
                }
            });

        }

    }]
})