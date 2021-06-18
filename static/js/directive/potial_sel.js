define(['laydate'], function(laydate) {
    creatPopup({
        el: 'potialSel',
        openPopupFn: 'potialSel_popup',
        htmlUrl: './templates/popup/potial_sel.html',
        controllerFn: function($scope, props, SERVICE) {
            console.log(props);
            var pagerRender = false,start=0,eachPage=localStorage.getItem('potialSel')?localStorage.getItem('potialSel'):10;//页码初始化
            var $time, $status, $course, $adviser, $type, $sign, $sort, $type2, $activity,$searchIntent,$searchMark,$searchName,searchAge ={}; //筛选数据定义
            $scope.noneGuwen = false;
            $scope.hasSecondType = false;//二级渠道隐藏
             $scope.isActivity = false;//隐藏活动筛选，只有渠道为易帜独秀时才显示出来
             $scope.noChannelStatus = false;
            init();
            function init() {
                $scope.props = props;
                getPotialList(0);
                $scope.potial_sortCllict = potial_sortCllict;
                $scope.potial_checkboxClick = potial_checkboxClick;
                $scope.deterSel_potial = deterSel_potial;
                $scope.sel_potial = sel_potial; //选择潜客
                (function(){
                    laydate.render({
                        elem: '#searchByDatePop', //指定元素
                        range: "到",
                        isRange:true,
                        btns: ['confirm'],
                        done: function(value) {
                            $time = value;
                            pagerRender = false;
                            getPotialList(0);
                        }
                    });
                })();
                //搜索类型
                $scope.kindSearchData = {
                    'header': '姓名、昵称、联系方式',
                };
                $scope.selectInfoNameId = 'header';
                $scope.SearchData = SearchData; //搜索
                $scope.Enterkeyup = SearchData; //搜索
                //筛选栏信息
                $scope.screen_status = getConstantList(CONSTANT.POTENTIALCUSTOMERSTATUS,[ 0,4,5,6,7,3,1]);
//              $scope.screen_status = [
//                  {'name': '潜在用户', 'value': '0'},
//                  {'name': '流失客户', 'value': '1'},
////                  {'name': '课程签约', 'value': '2'},
//                  {'name': '冻结客户', 'value': '3'},
//              ];
                $scope.$sign = false;
                $('#searchByDatePop').val('');
                $scope.screen_course = [];
                $scope.screen_adviser = [];
                $scope.screen_chanType = [];
                $scope.params_potials = [];
                getAdviserName();   //获取顾问
                getCourseId();  //获取意向课程


                getChannelList();   //获取渠道类型
                getActivityList();//获取活动

                $scope.intentList = getConstantList(CONSTANT.PTL_INTENT_SHOW);//意向度
                getMarkList();//获取标签
                //点击筛选
                $scope.click_status = click_status;
                $scope.click_course = click_course;
                $scope.click_adviser = click_adviser;
                $scope.click_chanType = click_chanType;
                $scope.click_channel = click_channel;
                $scope.click_activity = click_activity;
                $scope.click_age = click_age;
                $scope.click_mark = click_mark;
                $scope.searchByIntent = searchByIntent;
                $scope.completeSign = completeSign;
                $scope.checkNoneGuwen = checkNoneGuwen;
                $scope.checkNoneChanel = checkNoneChanel;
                $scope.click_reset = click_reset;
                click_reset();
            }
            function click_reset(){
                for(var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]()
                };
                if($scope.ageSearchOnreset_) $scope.ageSearchOnreset_["screen_potiental"](); //调取app重置方法
                $('#searchByDatePop').val('');
                $time = undefined;
                $status = undefined;
                $course = undefined;
                $adviser = undefined;
                $type = undefined;
                $sign = undefined;
                $type2 = undefined;
                $activity = undefined;
                $scope.$sign = false;
                $searchIntent = undefined;
                $searchMark = undefined;
                $searchName = undefined;
                pagerRender = false;
                $scope.noneGuwen = false;
                $scope.noChannelStatus = false;
                searchAge ={};
                getPotialList(0);
            }
            function getActivityList() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/activity/list',
                    type: 'get',
                    data:{pageType:"0"},
                    success: function(data) {
                        // 处理课程列表
                        if( data.status == "200"){
                            $scope.activityList = data.context;
                        }
                    }
                });
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
            //搜索
            function SearchData(data) {
                $searchName = data.value;
                pagerRender = false;
                getPotialList(0);   //获取列表
            }
            //选择潜客
            function sel_potial(data) {
                var index_ = [false, null];
                if(data.hasChecked) {
                    data.hasChecked = false;
                    angular.forEach($scope.params_potials, function(val, ind) {
                        if(data.id == val.id) {
                            index_ = [true, ind];
                        }
                    });
                    if(index_[0]) {
                        $scope.params_potials.splice(index_[1], 1);
                    }
                } else {
                    data.hasChecked = true;
                    $scope.params_potials.push(data);
                }
            }
            function potial_checkboxClick(d) {
                var i_ = [false, null];
                if(d) {
                    angular.forEach($scope.potialList, function(val_1) {
                        if(!val_1.hasChecked) {
                            val_1.hasChecked = true;
                            $scope.params_potials.push(val_1);
                        }
                    });
                } else {
                    angular.forEach($scope.potialList, function(val_1) {
                        val_1.hasChecked = false;
                        i_ = [false, null];
                        angular.forEach($scope.params_potials, function(val_2, ind_2) {
                            if(val_1.id == val_2.id) {
                                i_ = [true, ind_2];
                            }
                        });
                        if(i_[0]) {
                            $scope.params_potials.splice(i_[1], 1);
                        }
                    });
                }
            }
            function potial_sortCllict(d) {
                $sort = d.sort;
                pagerRender = false;
                getPotialList(0);
            }
            function click_status(d) {
                $status = d?d.value:null;
                pagerRender = false;
                getPotialList(0);
            }
            function click_mark(d) {
                $searchMark = d?d.id:null;
                pagerRender = false;
                getPotialList(0);
            }
            function searchByIntent(d) {
                $searchIntent = d?d.value:null;
                pagerRender = false;
                getPotialList(0);
            }
            function click_course(d) {
                $course = d?d.courseId:null;
                pagerRender = false;
                getPotialList(0);
            }
            function click_adviser(d) {
                $adviser = d?d.shopTeacherId:null;
                if($adviser){
                    $scope.noneGuwen=false;
                }
                pagerRender = false;
                getPotialList(0);
            }
            function click_chanType(data) {
                $scope.hasSecondType = false;
                $scope.isActivity = false;
                $type2="";
                $scope.channelList = "";
                $activity="";
                if(!data){
                    $type = "";
                    $scope.hasSecondType = false;
                }else{
                    $type = data.id;
                    $type2="";
                    if(data.channelTypeName !== "易知独秀"){
                        if (data.channelList.length > 0) {
                            $scope.channelList = data.channelList;
                            $scope.hasSecondType = true;
                            screen_setDefaultField($scope, function() {
                                $scope.screen_goReset['来源渠道']('');
                            });
                        }else{
                            $scope.channelList="";
                            $scope.hasSecondType = false;
                        }
                    }else if(data.channelTypeName == "易知独秀"){
                        $scope.isActivity = true;
                        screen_setDefaultField($scope, function() {
                            $scope.screen_goReset['活动']('');
                        });
                    }
                }
                pagerRender = false;
                getPotialList(0);

            }

            function click_activity(val){
                if(val == null) {
                    $activity = '';
                } else {
                    $activity = val.activityId;
                }
                pagerRender = false;
                getPotialList(0);
            }
            function click_channel(data) {
               if(!data){
                    $type2 = "";
                }else{
                    $type2=data.id;
                }
                pagerRender = false;
                getPotialList(0);
            }
            function click_age(a) {
                searchAge = a;
                pagerRender = false;
                getPotialList(0);
            }
            function completeSign(evt) {
                $sign = evt.target.checked? 2: null;
                pagerRender = false;
                getPotialList(0);
            }
            function checkNoneGuwen(evt) {
                if($scope.noneGuwen){
                    $scope.screen_goReset['顾问']('');
                    $adviser=null;
                }
                pagerRender = false;
                getPotialList(0);
            }
            function checkNoneChanel(evt) {
                pagerRender = false;
                getPotialList(0);
            }
                //返回 潜客状态
            $scope.$returnPotentialStatus = function(val) {
                    return CONSTANT.POTENTIALCUSTOMERSTATUS[val];
                }
            //获取潜客列表
            function getPotialList(start, sp) {
                var params = $scope.props.form == 'survey'?{
                   'start': start,
                   'count': eachPage,
                   'type':'0',
                   'courseId': $course,
                   'tagId':$searchMark,
                   'intent':$searchIntent,
                   'oaUserId':$adviser,
                   'beginAge': searchAge.minAge || '',
                   'endAge': searchAge.maxAge || '',
                   'searchType':'appSearchName',
                   'searchName':$searchName
                }:{
                   'start': start,
                   'count': eachPage,
                   'status': $sign?$sign:$status,
                   'oaUserId': $adviser,
                   'courseId': $course,
                   'channelTypeId': $type,
                   'channelId': $type2,
                   'activityId':$activity,
                   'beginAge': searchAge.minAge || '',
                   'endAge': searchAge.maxAge || '',
                };
                if($sort) {
                    params['orderName'] = 'allot_time';
                    params['orderTyp'] = $sort;
                }
                if($time){
                    params["allotBeginTime"] = $time.split(" 到 ")[0]+" 00:00:00";
                    params["allotEndTime"] = $time.split(" 到 ")[1]+" 23:59:59";
                }
                if($scope.noneGuwen){
                    params["noOaUserStatus"] = "1";
                }
                if($scope.noChannelStatus){
                    params["noChannelStatus"] = "1";
                }
                // 去掉为空字段
                for(var one in params) {
                    if(params[one] === '' || params[one] === null) {
                        delete params[one];
                    }
                }
                console.log(params);
                $.hello({
                    url: CONFIG.URL + '/api/oa/sale/getPotentialCustomerList',
                    type: 'get',
                    data: params,
                    success: function(res) {
                        if(res.status == "200"){
                            $scope.potialList = res.context.items;
                            repeatLists($scope.potialList, $scope.params_potials, 'id');
                            SERVICE.THEAD.resetCheckboxDir(false);
                            potentialPager_popup(res.context.totalNum);
                        }
                    }
                });
            }
            function potentialPager_popup(total) {
                //分页
                if(pagerRender) {
                    return;
                } else {
                    pagerRender = true;
                }
                var $M_box3 = $('.potialSel');
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
                            localStorage.setItem('potialSel', eachPage);
                        }
                        start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                        getPotialList(start); //回掉
                    }
                });
            }
            function getAdviserName() { //获取顾问列表
                $.hello({
                    url: CONFIG.URL + '/api/oa/sale/getPotentialCustomerOaUserInHome',
                    type: 'get',
                    success: function(data) {
                        if(data.status == "200") {
                            $scope.screen_adviser = data.context;
                        }
                    }
                });
            }
            function getChannelList() { //渠道类型
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/channelType/list',
                    type: 'get',
                    data: {pageType: 0 ,channelNeed:1},
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.screen_chanType = data.context;
                        }
                    }
                });
            };
            function getCourseId() {    //获取意向课程
                $.hello({
                    url: CONFIG.URL + '/api/oa/course/getCoursesList',
                    type: 'get',
                    data: {
                        pageType: 0, // 不需要分页
                    },
                    success: function(data) {
                        // 处理课程列表
                        if( data.status == "200"){
                            $scope.screen_course = data.context;
                        }
                    }
                });
            }

            function deterSel_potial() {
                var data = $scope.params_potials;
                if(SERVICE.COURSEANDCLASS.POTIAL['potial_sel']) SERVICE.COURSEANDCLASS.POTIAL['potial_sel'](data);
                $scope.$emit(props.callBackName, data);
                $scope.closePopup('potial_sel');
            }
        }
    });
});