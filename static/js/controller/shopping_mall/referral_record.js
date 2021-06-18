define(['laydate','mySelect',"potential_pop",], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
	    var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        var search_name, referrerId = undefined;
        $scope.searchTime = "";
        init();
        function init(){
            $scope.page = 0;
            getPotential(0);//获取推荐人列表
            $scope.classNavJud = 2;
            $scope.kindSearchData = {
                studentName:'姓名、昵称、联系方式',
            };
            $scope.selectInfoNameId = "studentName";
            $scope.nameListThead = [
                {name:"被推荐学员",width:"15%"},
                {name:"联系方式",width:"15%"},
                {name:"邀请时间",width:"15%"},
                {name:"首次报课时间",width:"15%"},
                {name:"报课金额",width:"12%"},
                {name:"推荐人",width:"13%"},
                {name:"推荐人联系方式",width:"15%"},
            ];
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.changeType = changeType;
            $scope.onReset = onReset;
            $scope.switchClassNav = switchClassNav;
            getlistReferralData(0);
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getlistReferralData(0);
                }
            });
            $scope.listReload = function(){
                getPotential($scope.page);//获取推荐人列表
            }
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        }
        function getPotential(start_) {
            var params = {
                start:start_ || "0",
                count:50,
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/referral/listReferralData",
                type: "get",
                data:params,
                success: function(data) {
                    if (data.status == '200') {
                        var list = data.context.items;
                        if(start_ == 0){
                            $scope.studentList = list;
                        }else{
                            $scope.studentList = $scope.studentList.concat(list);
                        }
                        if(list){
                            $scope.page = $scope.page*1 + list.length*1;
                        }
//                      $scope.studentList = data.context.items;
                    }
                }
            })
        }
        function switchClassNav(n){
            $scope.classNavJud = n;
            switch (n){
            	case 1:$state.go("referral");
            		break;
            	case 2:$state.go("referral_record");
            		break;
            	default:
            		break;
            }
        }
        function searchdata(d) {
            pagerRender = false;
            search_name = d?d.value:null;
            getlistReferralData(0);
        }
        function changeType(val){
            referrerId = val != null?val.potentialCustomerId:undefined;
            pagerRender = false;
            getlistReferralData(0);
        }
        function onReset() {
            search_name = undefined;
            referrerId = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false;
            getlistReferralData(0);
        }
        function getlistReferralData(start_){
            var params = {
                start:start_ || "0",
                count:eachPage,
                searchType:search_name?"appSearchName":undefined,
                searchName:search_name,
                referrerId:referrerId,
                signed:1
            };
            if($scope.searchTime){
                params["beginTime"]=$scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"]=$scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/referral/listSigned",
                type: "get",
                data:params,
                success: function(data) {
                    if(data.status == '200') {
                        $scope.referral_recordList = data.context.items;
                        leavePager(data.context.totalNum);
                    };
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
                    getlistReferralData(start); //回调
                }
            });

        }
    }]
})