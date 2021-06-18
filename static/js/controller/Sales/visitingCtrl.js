define([ "laydate", "pagination", "mySelect"], function(laydate) {
	return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
	    var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        var shopTeacherId;
        var timeType = undefined, searchName = shopTeacherId = undefined;
		var orderType = "desc";
		$scope.hasCome = undefined;
		$scope.select_params = [];
		init();
		function init(){
			getAdviserName();//获取顾问
			$scope.selectInfoNameId = 'studentName'; //select初始值
            $scope.kindSearchData ={ 
                  studentName:'学员姓名、昵称、联系方式',
            };
            $scope.screen_visitTime = [
                {name:"过去来访",value:"0"},
                {name:"今日来访",value:"1"},
                {name:"即将来访",value:"2"},
            ];
            $scope.nameListThead = [
                {name:'checkbox',width:'50'},
                {name: '学员姓名', width: '17%'},
                {name: '联系方式', width: '17%'},
                {name: '顾问', width: '14%'},
                {name: '预约来访时间', width: '20%','issort': true,'sort': 'desc'},
                {name: '备注', width: '32%'},
                {name: '状态', width: '80'},
                {name: '操作', width: '160',align: 'center',}
            ];
            $scope.mouseover=mouseover;//试听状态移入
            $scope.mouseleave=mouseleave;//试听状态移出
            $scope.SearchData = searchData;
            $scope.Enterkeyup = searchData;
            $scope.selectTimeType = selectTimeType;
            $scope.searchByAdviser = searchByAdviser;
            $scope.changeBycome = changeBycome;
            $scope.sortCllict = sortCllict;
            $scope.sel_singleFun = checkSingleFun;//选择某一条数据
            $scope.operatePop = operatePop;//操作相关按钮
            $scope.confirm_yuyueCome = confirm_yuyueCome;//重新预约来访
            $scope.patchChange = patchChange;//批量操作取消预约
            $scope.onReset = onReset;//重置
            $scope.sel_allFun = function(c){
	            checkboxAllFun(c,$scope.visitingList,$scope.select_params,'potentialCustomerRecord.potentialCustomerRecordId');
	        }
            $scope.closePop = function(){
            	layer.close(dialog);
            }
            //  获取工作台数据
            if($stateParams.screenValue.name == 'workbench') {
               if($stateParams.screenValue.type == '待处理') {
                    $scope.hasCome = 0;
                    timeType = "1";
                     screen_setDefaultField($scope, function() {
                        $scope.screen_goReset['预约来访时间']('今日来访');
                    })
                }
            };
            getVisitingList(0);
		}
		        //小浮框显示与隐藏
        function mouseover(x, ind, e){
            if(x.potentialCustomer.potentialCustomerParentTowPhone || x.potentialCustomer.potentialCustomerParentThreePhone){
//              $($event.target).closest("td").find(".openPop").show();
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
//           $($event.target).closest("td").find(".openPop").hide();
             $scope.showInd = null;
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
		 function onReset() {
            for(var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            timeType = searchName = shopTeacherId = undefined;
			orderType = "desc";
			$scope.hasCome = undefined;
			$scope.$emit("reloadVisit");
        }
		function searchData(data){
			searchName = data.value;
            pagerRender = false;
            getVisitingList(0);
		}
		function selectTimeType(data){
			timeType = data != null?data.value :undefined;
			if(timeType == 0){
				orderType = "desc";
			}else{
			    orderType = "asc";
			}
			pagerRender = false;
			getVisitingList(0);
		}
		function searchByAdviser(val){
			shopTeacherId = val != null?val.shopTeacherId :undefined;
			pagerRender = false;
			getVisitingList(0);
		}
		function changeBycome(e,val){
			$scope.hasCome = e.target.checked?val:undefined;
			pagerRender = false;
			getVisitingList(0);
		}
		function sortCllict(data){
			orderType = data.sort;
			pagerRender = false;
			getVisitingList(0);
		}
		$scope.$on("reloadVisit",function(){
			$scope.select_params = [];
            $scope.resetCheckboxDir(false);
            getVisitingList(start);
		});
		function getVisitingList(start_){
			var params = {
				start:start_.toString()||"0",
				count:eachPage,
				searchType:searchName?"appSearchName":undefined,
				searchName:searchName,
				timeType:timeType,
				orderTyp:orderType,
				shopTeacherId:shopTeacherId,
				workStatus:$scope.hasCome
			};
			$.hello({
                url: CONFIG.URL + '/api/oa/potentialCustomer/visitingList',
                type: 'get',
                data: params,
                success: function(data) {
                    if(data.status == "200"){
                    	var list = data.context.items;
                    	$scope.visitingList = list;
                    	repeatLists($scope.visitingList, $scope.select_params, 'potentialCustomerRecord.potentialCustomerRecordId');
                    	visitPager(data.context.totalNum);
                    }
                }
            })
		}
		function visitPager(total) {
            var len = 0;
            angular.forEach($scope.visitingList,function(v){
                if(v.hasChecked){
                    len+=1;
                }
            });
            if($scope.visitingList.length>0 && $scope.visitingList.length==len){
                $scope.resetCheckboxDir(true);
            }else{
                $scope.resetCheckboxDir(false);
            }
            //分页
            if(pagerRender) {
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
                    if(api.getCurrentEach() != eachPage) {  //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getVisitingList(start); //回掉
                }
            });
        }
		function operatePop(x,n,type){
			$scope.studentInfo = angular.copy(x);
			switch (n){
				case 1:
				case 2:
				case 3:
				var msg="";
				if(n==1){
					msg="是否确认签到?";
				}else if(n==2){
					msg="是否确认取消预约来访?";
				}else if(n==3){
					msg="是否确认取消签到?";
				}else{
					
				}
				detailMsk(msg,function(){
	                var params = {
	                    potentialCustomerRecordId:x.potentialCustomerRecord.potentialCustomerRecordId,
                        potentialCustomerRecordType:type
	                };
	                $.hello({
	                    url: CONFIG.URL + '/api/oa/potentialCustomer/operateVisiting',
	                    type: 'post',
	                    data: JSON.stringify(params),
	                    success: function(data) {
	                        if(data.status == "200"){
	                            $scope.$emit("reloadVisit");
	                        }
	                       
	                    }
	                });
	            });
					break;
				case 4:
				$scope.appointTime = yznDateFormatYMdHms(new Date());
                $scope.appointalkTime = "";
                $scope.appointDesc = "";
                (function() {
                    lay('#pop_yuyueCome .dateIcon').each(function(v, k) {
                        laydate.render({
                            elem: this,
                            isRange: false,
                            type: "datetime",
                            trigger: 'click',
                            done: function(value) {
                                if (v == 0) {
                                    $scope.appointTime = value;
                                } else {
                                    $scope.appointalkTime = value;
                                }
                            }
                        });
                    });
                })();
                openPopByDiv("预约来访",".pop_yuyueCome","660px")
					break;
//				case 2:
//				detailMsk('是否确认取消预约来访？',function(){
//	                var params = {
//	                    potentialCustomerRecordId:x.potentialCustomerRecord.potentialCustomerId,
//                      potentialCustomerRecordType:25
//	                };
//	                $.hello({
//	                    url: CONFIG.URL + '/api/oa/potentialCustomer/operateVisiting',
//	                    type: 'post',
//	                    data: JSON.stringify(params),
//	                    success: function(data) {
//	                        if(data.status == "200"){
//	                            $scope.$emit("reloadVisit");
//	                        }
//	                       
//	                    }
//	                });
//	            });
//					break;
//				case 3:
//				detailMsk('是否确认取消签到？',function(){
//	                var params = {
//	                    potentialCustomerRecordId:x.potentialCustomerRecord.potentialCustomerId,
//                      potentialCustomerRecordType:13
//	                };
//	                $.hello({
//	                    url: CONFIG.URL + '/api/oa/potentialCustomer/operateVisiting',
//	                    type: 'post',
//	                    data: JSON.stringify(params),
//	                    success: function(data) {
//	                        if(data.status == "200"){
//	                            $scope.$emit("reloadVisit");
//	                        }
//	                       
//	                    }
//	                });
//	            });
					break;
				default:
					break;
			}
		}
		//预约来访确认
		function confirm_yuyueCome(type) {
            var param = {
                'workTime': $scope.appointTime,
                'potentialCustomerRecordType': 10,
                'potentialCustomerRecordDesc': $scope.appointDesc,
                'returnTime': $scope.appointalkTime,
                'potentialCustomerRecordId': $scope.studentInfo.potentialCustomerRecord.potentialCustomerRecordId
            };
            for (var i in param) {
                if (param[i] === '' || param[i] == undefined) {
                    delete param[i];
                };
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/potentialCustomer/operateVisiting",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        $scope.$emit("reloadVisit");
                        layer.msg('预约来访成功', {
                            icon: 1
                        });
                        $scope.closePop();
                    };
                }
            })
        }
		function patchChange(){
			 if($scope.select_params.length<=0){
                return layer.msg("请选择需要取消预约的学员");
            }
			 detailMsk('是否确认取消预约来访？',function(){
                var params = {
                    potentialCustomerRecordList: getArrPotIds($scope.select_params),
                    potentialCustomerRecordType:25
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/potentialCustomer/operateVisitingList',
                    type: 'post',
                    data: JSON.stringify(params),
                    success: function(data) {
                        if(data.status == "200"){
                            $scope.$emit("reloadVisit");
                        }
                       
                    }
                });
            });
		}
		function getArrPotIds(list){
            var arr = [];
            if(list && list.length>0){
                angular.forEach(list,function(v){
                    arr.push({
                        potentialCustomerRecordId:v.potentialCustomerRecord.potentialCustomerRecordId
                    });
                });
            }
            return arr;
        }
	}]
})