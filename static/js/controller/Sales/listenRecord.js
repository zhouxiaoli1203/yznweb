define(['laydate', 'pagination', 'mySelect', 'students_sel','potential_pop','arrangePop', 'timesel','courseAndClass_sel','classroomPop','listenPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name, search_courseId, search_shopTeachId, adviserId = undefined;
        var orderType = "desc";
        $scope.searchTime = "";
        $scope.auditionRecordStatus = undefined;
        init();

        function init() {
            getAdviserName();
            getCourseList();
            getTeachList();
            $scope.studNavJud = "1";
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、联系方式',
            };
            //表头
            $scope.nameListThead = [{
                'name': '学员姓名',
                'width': '200'
            }, {
                'name': '联系方式',
                'width': '120'
            }, {
                'name': '顾问',
                'width': '100'
            }, {
                'name': '试听课程',
                'width': '120'
            }, {
                'name': '试听班级',
                'width': '120'
            }, {
                'name': '试听时间',
                'width': '225',
                'id': 'arrangingCoursesBeginDate',
                'issort':true,
//              'sort':'desc',
            }, {
                'name': '老师',
                'width': '100'
            }, {
                'name': '教室',
                'width': '90'
            }, {
                'name': '试听状态',
                'width': '80'
            }, {
                'name': '操作',
                'width': '200',
                'align': 'center'
            }, ];
            $scope.isAllpotential = checkAuthMenuById("13");//判断是否全部潜客
            $scope.viewAppoint = checkAuthMenuById("40");//浏览预约
            $scope.isOperate = checkAuthMenuById("41");//操作预约
            $scope.mouseover=mouseover;//试听状态移入
            $scope.mouseleave=mouseleave;//试听状态移出
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.sortCllict = sortCllict;
            $scope.changeCourse = changeCourse; //按班级筛选
            $scope.changeTeach = changeTeach; //按老师筛选
            $scope.SearchData = searchData; //搜索按钮
            $scope.Enterkeyup = searchData; //keyup筛选
            $scope.searchByAdviser = searchByAdviser;
            $scope.changesType = changesType;//状态筛选
            $scope.onReset = onReset; //重置

            $scope.cancelOperate = cancelOperate;//取消预约
            $scope.gotoChaban = gotoChaban;//插班试听
            $scope.gotoViewStudent = gotoViewStudent;//查看潜客、学员详情
            $scope.operate = operate;
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getListenList(0);
                }
            });
            //工作台快捷入口跳转
            if($scope.$stateParams.screenValue.name == 'workbench' && $scope.$stateParams.screenValue.type == "待处理") {
                $scope.searchTime = yznDateFormatYMd(new Date())+" 到 "+yznDateFormatYMd(new Date());
                orderType = "asc";
                $scope.auditionRecordStatus = 0;
            };
            getListenList(0);
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        }
                //小浮框显示与隐藏
        function mouseover(x, ind, e){
            if(x.potentialCustomer.potentialCustomerParentTowPhone || x.potentialCustomer.potentialCustomerParentThreePhone){
                $scope.showInd = ind;
                var e_ = $(e.currentTarget);
                var top_ = e_.offset().top+20;
                var left_ = e_.offset().left;
                var $this = $(e.target);
                $this.closest("td").find(".openPop").css({
                    left: left_,
                    top: top_
                });
            }
        }
        function mouseleave($event){
             $scope.showInd = null;
        }
        function gotoViewStudent(x){
            if(checkAuthMenuById("65") || checkAuthMenuById("13") || checkAuthMenuById("29")){
                window.$rootScope.yznOpenPopUp($scope,'pot-pop', 'potential_pop','1060px',{'page':0,'item':x.potentialCustomer,'tab':1});
            }else{
                layer.msg("您暂无访问权限。请联系管理员为您添加浏览潜客或浏览学员权限。");
            }
        }
        function getAdviserName() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data:{pageType:'0',quartersTypeId:'3',shopTeacherStatus:'1'},
                success: function(data) {
                    if(data.status == "200") {
                        $scope.screen_adviser = data.context;
                    }
                }
            });
        }
        //获取课程列表
        function getCourseList(){
             var p = {
                'pageType': 0,
                'courseStatus': 1,
                'courseType':0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: p,
                success: function (data) {
                    if (data.status == "200") {
                        $scope.courseList = data.context;
                    }
                }
            });
        }
        function getTeachList(){
             var p = {
                'pageType': 0,
                'shopTeacherStatus': 1,
                'quartersTypeId':1
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: p,
                success: function (data) {
                    if (data.status == "200") {
                        $scope.teacherList = data.context;
                    }
                }
            });
        }
        function switchStudNav(n) {
            $scope.studNavJud = n;
            switch (n){
                case 1:$state.go("listenRecord");
                    break;
                case 2:$state.go("listenRecord/list")
                    break;
                default:
                    break;
            }
        }
        
        function sortCllict(data){
            orderType = data.sort;
            pagerRender = false;
            getListenList(0);
        }
        function searchData(data) {
            search_name = data.value;
            search_type = data.type;
            pagerRender = false;
            getListenList(0);
        }


        function changeCourse(c) {
            search_courseId = c == null ? undefined : c.courseId;
            pagerRender = false;
            getListenList(0);
        }
        function searchByAdviser(c) {
            adviserId = c == null ? undefined : c.shopTeacherId;
            pagerRender = false;
            getListenList(0);
        }
        function changeTeach(c) {
            search_shopTeachId = c == null ? undefined : c.shopTeacherId;
            pagerRender = false;
            getListenList(0);
        }
        
        function changesType(e,val){
            $scope.auditionRecordStatus = e.target.checked?val:undefined;
            pagerRender = false;
            getListenList(0);
        }
        function onReset() {
            $scope.searchTime = "";
            $scope.auditionRecordStatus = undefined;
            search_courseId = search_shopTeachId =  search_name = search_type = adviserId =undefined;
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            pagerRender = false;
            getListenList(0);
        }
        $scope.$on("listenListChange",function(evt,isOldPage){
             if(isOldPage){
                getListenList(start);
            }else{
                pagerRender = false;
                getListenList(0);
            }
        });
        function gotoChaban(x){
            $scope.chabanData = x;
        }
        $scope.$on("插班试听",function(evt,x){
            var param = {
                "potentialCustomers":[
                    {
                        "id":$scope.chabanData.potentialCustomer.id,
                        "potentialCustomerId":$scope.chabanData.potentialCustomer.potentialCustomerId,
                        "auditionRecordId":$scope.chabanData.auditionRecordId,
                    }
                ],
                "arrangingCourses":{
                    "arrangingCoursesId":x.arrangingCoursesId,
                }
            };
            console.log(param);
            $.hello({
                url: CONFIG.URL + "/api/oa/audition/addAuditionStudent",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        
                        layer.msg('已插班试听', {
                            icon: 1
                        });
                        $scope.$emit('listenListChange', false);
                    };
                }
            })
        });
        function getListenList(start_) { //获取请假补课列表信息
            start = start_ == 0?"0":start_;
            var params = {
                start:start_.toString(),
                count:eachPage,
                courseId: search_courseId,
                shopTeacherId:search_shopTeachId,
                consultantId:adviserId,
                auditionRecordStatus:$scope.auditionRecordStatus,
                orderName:"arrangingCoursesBeginDate",
                orderTyp:orderType,
                searchType:search_name?'appSearchName':undefined,
                searchName:search_name
            }
            if ($scope.searchTime) {
                params["beginTime"] = $scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"] = $scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            
            $.hello({
                url: CONFIG.URL + "/api/oa/audition/record/list",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == '200') {
                         angular.forEach(data.context.items,function(v){
                            v.teacherStr=arrToStr(v.teacherList,"teacherName");
                            v.potentialCustomer.typePhone=relation(v.potentialCustomer.potentialCustomerParentType);
                            v.potentialCustomer.typeTwoPhone=relation(v.potentialCustomer.potentialCustomerParentTowType);
                            v.potentialCustomer.typeThreePhone=relation(v.potentialCustomer.potentialCustomerParentThreeType);
                        });
                        $scope.listenList = data.context.items;
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
                    getListenList(start); //回调
                }
            });

        }
        
        function operate(x,type){
            $scope.studentInfo = angular.copy(x);
            switch (type){
            	case 1:
            	case 2:
            	case 3:
            	var msg="",autype="";
            	    if(type == 1){
            	        msg="是否确认"+x.potentialCustomer.name+"已完成试听？"; 
            	        autype = 1;
            	    }else if(type == 2){
            	        msg="是否确认"+x.potentialCustomer.name+"未到课？"; 
            	        autype = 2;
            	    }else if(type == 3){
            	        msg="是否确认取消预约试听？";
            	        autype = 3;
            	    }else{
            	        
            	    }
            	    detailMsk(msg,function(){
                        $.hello({
                            url: CONFIG.URL + '/api/oa/audition/record/update',
                            type: "post",
                            data: JSON.stringify({
                                auditionRecordId:x.auditionRecordId,
                                auditionRecordStatus:autype
                            }),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.$emit("listenListChange",false);
                                }
            
                            }
                        })
                    })
            		break;
            	case 4:
            	var param = {
                    'item':x.potentialCustomer,
                    'location':"outside",
                    'callBackName':"试听-重新预约",
                    'choseType':"radio",
                    'auditionRecordId':x.auditionRecordId
            	}
            	window.$rootScope.yznOpenPopUp($scope, 'listen-pop', 'choseListen', '1060px', param);
            		break;
            	default:
            		break;
            }
        }
        function cancelOperate(x) {
            var isConfirm = layer.confirm("是否取消本次预约试听？", {
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
                    "auditionRecordId": x.auditionRecordId,
                    "potentialCustomerId":x.potentialCustomer.potentialCustomerId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/audition/cancelAudition",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            
                            layer.msg('已成功取消试听', {
                                icon: 1
                            });
                            $scope.$emit('listenListChange', false);
                        };
                    }
                })
            }, function() {
                layer.close(isConfirm);
            })
        }
    }]
})