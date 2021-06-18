define(["laydate", "pagination", "jqFrom", "mySelect", "remarkPop", "datePicker","importPop", "qrcode"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
	    var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        var dialog_ = null;
        //全局变量
        $scope.isApppoint = false; //到访状态下拉隐藏
        $scope.isPotential = false; //潜客状态下拉隐藏
        $scope.isInvalid = false; //无效原因下拉隐藏
        $scope.listDropdata = []; //更多下拉列表
        var fileVal = ""; //导入名单文件
        var global_rosterId; //打开弹框名单ID
        //名单状态,校区,销售id,采单员Id,搜索类型,搜索名,特殊状态下二级搜索,排序
        var rosterStatus, subscribeShopId, teacherId, marketerId, searchType, searchName, specialStatus, orderName,orderType,channelTypeId,channelId;
        //时间筛选预约或延期起始，操作时间起始
        var workBeginTime,workEndTime,rosterChangeBeginDate,rosterChangeEndDate;
        $scope.searchTime="";
        var re_dialog;//重复导入弹框
        var sale_orderName = 1,sales_orderName = 1,
            sale_orderType = "desc",sales_orderType = "desc", //销售列表排序初始待处理
            orderName="rosterChangeDate",
            orderType="desc";
        var dest_teacher, dest_channelTypeId, dest_channelId, dest_rosterStatus; //销售已选的ID，来源渠道类型，渠道来源，名单状态
        var enterType="outside";
        $scope.listDropdata = []; //更多下拉列表
        $scope.salesList = []; //销售列表复选已选
        $scope.saleSingle = {}; //销售列表单选已选
        $scope.isAllStatus=false;
        $scope.potential_channel = false;
        $scope.telemarketingLists = [];
            init();
        function init() {
            rosterStatus="0";
            getRosterList(0);
            getMarketerList(); //获取采单员
            getChannelList();
            getTelemarketerList(); //获取销售
            $scope.isAllname = checkAuthMenuById("7");//判断是否全部名单
            $scope.isCaozuo = checkAuthMenuById("8");//判断是否操作名单
            $scope.isZhuanqianke=checkAuthMenuById("9");//名单转潜客
            $scope.isDaoru = checkAuthMenuById("10");//判断是否导入名单
            $scope.isDaochu = checkAuthMenuById("147");//导出名单
            $scope.isFenpei = checkAuthMenuById("11");//判断是否名单分配
            $scope.relationList = getConstantList(CONSTANT.POTENTIALCUSTOMERPARENTTYPE,[0,1,2,3,4,5,6,8,7]);//获取家庭关系列表
            //名单状态 0 待处理 1 已预约 2 已转潜客 3 延期 4 无效 5 未接听
            $scope.pendingList = getConstantList(CONSTANT.NAME_STATUS, [0,2,3,5,4]);
            $scope.apppointStatus = getConstantList(CONSTANT.NAME_APPOINT);
            $scope.potentialStatus = getConstantList(CONSTANT.NAME_POTENTIAL,[1,2,0]);
            //0 暂无意向 1 其他 2 空号码 3 错误信息 4 无人接听5不适龄
            $scope.invalidStatus = getConstantList(CONSTANT.NAME_NOANWSER,[0,5,4,2,3,1]);
            $scope.groundPush = groundPush; //点击地推
            $scope.closePopup = function() {layer.close(dialog_);layer.close(dialog)};

            $scope.changeThead = '操作时间';
            $scope.changeThead_status = 'desc';
            $scope.$watch('changeThead',function(){
                $scope.nameListThead = [{
                        'name': '姓名',
                        'width': '120',
                    }, {
                        'name': '家长',
                        'width': '20%',
                    }, {
                        'name': '联系方式',
                        'width': '100',
                    }, {
                        'name': '备注',
                        'width': '40%',
                    }, {
                        'name': '电话销售',
                        'width': '20%',
                    }, {
                        'name': '采单员',
                        'width': '20%',
                    }, {
                        'name': $scope.changeThead,
                        'width': '144',
                        'issort': true,
                        'sort': $scope.changeThead_status,
                    },{
                        'name': '状态',
                        'width': '120',
                    }, {
                        'name': '操作',
                        'width': '250',
                        'align': 'center'
                    }
                ];

            });
            $scope.kindSearchData = [{
                key: "studentName",
                id: "1",
                name: "姓名、家长、联系方式、备注"
            }, {
                key: "userName",
                id: "2",
                name: "家长"
            }, {
                key: "userPhone",
                id: "3",
                name: "联系方式"
            }, {
                key: "desc",
                id: "4",
                name: "备注"
            }];

            $scope.selectInfoNameId = 'studentName'; //select初始值
            $scope.kindSearchData = {
                studentName: "姓名、家长姓名、联系方式、备注",
                userPhone: "联系方式",
                desc: "备注信息"
            };

            //表头   desc降序    asc升序
            $scope.salesThead = [{
                    'name': 'checkbox',
                    'width':'10%'
                }, {
                    'name': '姓名',
                }, {
                    'name': '待处理',
                    'issort': true,
                    'sort': 'asc',
                    'id': 1
                }, {
                    'name': '延期',
                    'issort': true,
                    'id': 2
                }, {
                    'name': '未接听',
                    'issort': true,
                    //                  'sort': 'desc',
                    'id': 3,
                },

            ];
            $scope.saleThead = [{}, {
                    'name': '姓名',
                }, {
                    'name': '待处理',
                    'issort': true,
                    'sort': 'desc',
                    'id': 1
                }, {
                    'name': '延期',
                    'issort': true,
                    //                  'sort': 'desc',
                    'id': 2
                }, {
                    'name': '未接听',
                    'issort': true,
                    //                  'sort': 'desc',
                    'id': 3
                },

            ];
            $scope.caclBirthToAge = caclBirthToAge; //计算年龄
            $scope.searchByPending = searchByPending; //按待处理搜索
            $scope.searchByStatus = searchByStatus; //按预约状态搜索
            $scope.searchBySales = searchBySales; //按销售搜索
            $scope.searchByMarketer = searchByMarketer; //按采单员搜索
            $scope.searchByChannelType = searchByChannelType; //按渠道来源搜索
            $scope.searchByChannel = searchByChannel; //按渠道搜索
            $scope.searchByStore = searchByStore; //通过校区筛选
            $scope.load_name = load_name; //导入名单弹框
            $scope.deleteReupload = deleteReupload;//去重导入
            $scope.reupload = reupload;//去重导入
            $scope.closePop = closePop; //关闭导入名单按钮
            $scope.submit_file = submit_file; //上传文件按钮
            $scope.downloadFile = downloadFile; //下载名单文件
            $scope.distributeList = distributeList; //名单分配
            $scope.add_sale_sourceBtn = add_sale_sourceBtn; //添加销售来源弹框
            $scope.selectSale = selectSale; //单选选择销售
            $scope.selectSales = selectSales; //复选选择销售
            $scope.confrimSale = confrimSale; //销售列表弹出框确认按钮
            $scope.deleteSales = deleteSales; //分配名单删除已选的销售数据
            $scope.closeSale = closeSale; //关闭销售列表弹出框关闭/取消按钮
            $scope.openDelay = openDelay; //延期处理弹框
//          $scope.setDelayTime = setDelayTime; //延期处理切换时间
            $scope.edit_confirm = edit_confirm; //编辑名单确认按钮
            $scope.export_config=export_config;//导出名单确认
            $scope.resourceChange = resourceChange; //名单导入 切换渠道类型
            $scope.upResourceChange = upResourceChange; //名单导入 切换渠道
            $scope.resourceChange2 = resourceChange2; //分配名单页面 切换渠道类型
            $scope.channelChange2 = channelChange2; //分配名单页面 切换渠道
            $scope.changeStatus = changeStatus; //分配名单页面 切换名单状态
            $scope.openAppoint = openAppoint; //重新预约
            $scope.apppoint_confirm = apppoint_confirm; //预约来访确认按钮
            $scope.activeName_confirm = activeName_confirm; //激活名单确认按钮
            $scope.delay_confirm = delay_confirm; //延期处理确认按钮
            $scope.potential_confirm = potential_confirm; //延期处理确认按钮
            $scope.noAnswer = noAnswer; //未接听
            $scope.changeShop = changeShop; //通过校区ID获取顾问
            $scope.openOpreat = openOpreat; //操作记录打开弹框
            $scope.destribute_confirm = destribute_confirm; //分配名单确认按钮

            $scope.SearchData = SearchData; //分类搜素 按钮确定
            $scope.Enterkeyup = Enterkeyup; //分类搜索 enter
            $scope.changeChannel = changeChannel; //无渠道筛选

            $scope.openPop = openPop; //操作下拉列表点击调出弹框
            $scope.editRemark = editRemark; //编辑备注确认按钮
            $scope.nameActive = nameActive; //激活名单
            $scope.invalidName = invalidName; //无效名单
            $scope.invalidName_confirm = invalidName_confirm; //无效名单确认按钮

            $scope.intentShow = intentShow; //转为潜客 --点击意向度提示
            $scope.addParent = addParent; //增加家长信息按钮
            $scope.deleteRelation = deleteRelation; //删除转为潜客里的家长关系
            $scope.sale_sortCllict = sale_sortCllict; //销售排序
            $scope.sales_sortCllict = sales_sortCllict; //销售排序
            $scope.sortCllict = sortCllict; //名单列表
            $scope.checkboxClick = checkboxClick; //表头复选框
            $scope.watchSaleNum=watchSaleNum;//分配销售监测销售来源和分配的销售数量
            $scope.gotoNameDetail = gotoNameDetail;//点击名单名称，查看详情
            $scope.openEdit = openEdit;//编辑名单
            $scope.openPotential = openPotential;//转为潜客
            $scope.openAppoint = openAppoint;//预约来访
            $scope.closeEditPop = closeEditPop;//关闭名单详情弹出框
            $scope.closeReDialog = closeReDialog;//关闭重复导入弹框


            //重置筛选栏
            $scope.onReset = function() {
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                };
                $scope.isApppoint = false;
                $scope.isPotential = false;
                $scope.isInvalid = false;
                $scope.hasSecondType = false;
                $scope.potential_channel=false;
                $scope.kindSearchOnreset(); //调取app重置方法
                rosterStatus = subscribeShopId = teacherId = marketerId = searchType = searchName = specialStatus=channelTypeId=channelId = "";
                $scope.searchTime=workBeginTime=workEndTime=rosterChangeBeginDate=rosterChangeEndDate="";
                orderType = "desc";
                pagerRender = false; //列表页码重置
                getRosterList(0);
            }
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "导入名单") {
                    setTimeout(function () {
                        $scope.goCommonPop('import-pop', 'import_popup', '860px', { page: '名单' });
                    })
                }
            }
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
            //时间筛选控件
            laydate.render({
                elem: '#apppointTime', //指定元素
                type: 'datetime',
                min: 0,
                isRange:false,
                trigger: 'click',
                done: function(value) {
                    $scope.apppointTime=value;
                }
            });
            // 今天之前的日期不能选择并且精确到时分
//          staffContrl_appoint("#apppointTime");
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange:true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender=false;
                    getRosterList(0);
                }
            });
            laydate.render({
                elem: '#currenTime', //指定元素
                type: 'datetime',
                min: 0,
                isRange:false,
                trigger: 'click',
                done: function(value) {
                    $scope.currenTime = value;
                }
            });
            (function(){
                lay('.studentBirth').each(function(v, k) {
                    laydate.render({
                        elem: this, //指定元素
                        isRange: false,
                        max:0,
                        btns:["clear","confirm"],
                        done: function(value) {
                            $scope.detail.birthday = value;
                            $scope.hasMonth=false;
                             $scope.detail.age=caclAge(value);
                            if(value) {
                                if(parseInt($scope.detail.age) <= 6) {
                                    $scope.hasMonth=true;
                                    $scope.detail.studentMonth="岁"+" "+caclAgeToMonth(value) + " 月";
                                } else {
                                    $scope.hasMonth=false;
                                }
                            } else {
                                $scope.detail.age="";
                                $scope.detail.studentMonth="";
                                $scope.hasMonth=false;
                            }
                             $scope.$apply();
                        }
                    });
                });
            })();
            //状态初始值
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['状态']('待处理');
            })
            $(".selectSale").prop("checked", false);
            $(".selectSales").prop("checked", false);
            $(".selectSale_pop thead input").prop("checked", false);

        }

        //点击地推
        function groundPush(type, _d) {
            console.log(_d);
            switch(type) {
                case 1: //点击地推按钮-//获取采单员和短信余额
                    $.hello({
                        url: CONFIG.URL + '/api/oa/roster/getGroundPromotion',
                        type: "get",
                        success: function(res) {
                            if(res.status == 200) {
                                $scope.groundPushInfo = res.context;
                                openPopByDiv('地推设置', '#ground_push', '760px');
                                dialog_ = dialog;
                            };
                        }
                    });
                    break;
                case 2: //点击短信充值
                    layer.close(dialog_);
                    $state.go('edu_notice', {'screenValue' : {name: 'nameList', type: '短信充值'}});
                    break;
                case 3: //查看二维码
                    openPopByDiv('地推二维码<span style="color: #ff595e">（'+ _d.teacherName +'）</span>', '.ground_push_code', '360px');
                    $('#ground_push_code').html('');
                    jQuery('#ground_push_code').qrcode({  //渲染二维码
                        render: "canvas", //也可以替换为table
                        width: 290,
                        height: 290,
                        text: _d.qrCodeUrl,
                    });
                    break;
                case 4: //点击下载二维码
                    var _url = $('#ground_push_code').find('canvas').get(0).toDataURL('image/jpg');
                    var _link = document.createElement("a");
                    $(_link).attr("href", _url);
                    $(_link).attr("download",'地推二维码.png');
                    $(_link)[0].click();
                    break;
                case 5: //点击确认地推设置
                    $.hello({
                        url: CONFIG.URL + '/api/oa/roster/setGroundPromotion',
                        type: "post",
                        data: JSON.stringify({'verificationCodeStatus': $scope.groundPushInfo.verificationCodeStatus}),
                        success: function(res) {
                            if(res.status == 200) {
                                layer.msg('设置成功');
                                layer.close(dialog_);
                            };
                        }
                    });
                    break;
                case 6: //点击勾选短信验证码
                    $scope.groundPushInfo.verificationCodeStatus = _d.target.checked?1:0;
                    break;
            }
        };

        function getTelemarketerList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data:{"pageType":"0","quartersTypeId":"9","shopTeacherStatus":"1"},
                success: function(data) {
                    if (data.status == "200") {
                        $scope.telemarketerList = data.context;
                        $scope.telemarketerList.unshift({"teacherName":"无销售","teacherId":"0"});
                    }
                }
            });
        }

        function getMarketerList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data:{
                    pageType:0,
                    shopTeacherStatus:1,
                    quartersTypeId:11
                },
                success: function(data) {
                    $scope.marketerList = data.context;
                }
            });
        }
        function sortCllict(data){
            orderType = data.sort;
            pagerRender=false;
            getRosterList(0);
            console.log(data.sort + '--');
        }
        $scope.$on("nameChange",function(){
            pagerRender=false;
            getRosterList(0);
        });
        //以下是名单页面列表
        function getRosterList(start_) {
            start = start_ == 0?"0":start_;
            if(rosterStatus == "1" || rosterStatus == "3"){
                orderName="workTime";
            }else if(rosterStatus == ""){
                if(orderType){
                    orderName="rosterChangeDate";
                }else{
                    orderName="";
                }
            }else{
                orderName="rosterChangeDate";
            }
            var params = {
                "start": start_.toString() || '0',
                "count": eachPage,
                "rosterStatus": rosterStatus,
//              "teacherId": teacherId,
                "marketerId": marketerId,
                "searchType": searchName?'appSearchName':undefined,
                "searchName": searchName,
                "specialStatus": specialStatus,
                "orderType": orderType,
                "orderName":orderName ,
                "channelTypeId":channelTypeId,
                "channelId":channelId,
                noChannelStatus:$scope.potential_channel?"1":undefined
            };
            if(rosterStatus == "1"){
                params["subscribeShopId"]=subscribeShopId;
            }
            if(teacherId == "0"){
                params["noOaUser"]="1";
            }else{
                params["teacherId"]=teacherId;
            }
            if($scope.searchTime){
                if(rosterStatus == "1" || rosterStatus == "3"){
                    params["workBeginTime"]=$scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                    params["workEndTime"]=$scope.searchTime.split(" 到 ")[1]+" 23:59:59";
                }else{
                    params["rosterChangeBeginDate"]=$scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                    params["rosterChangeEndDate"]=$scope.searchTime.split(" 到 ")[1]+" 23:59:59";
                }
            }
            console.log(params);

            // 去掉为空字段
            for (var one in params) {
                if (params[one] === '' ||params[one] === undefined) {
                    delete params[one];
                }
            }

            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getRosterList',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.rosterList = data.context.items;
                        var list = data.context.items;
                        angular.forEach(list, function(v, k) {
                            list[k].nameStatus = CONSTANT.NAME_STATUS[v.rosterStatus];
                            list[k].dropData = getDropList(v.rosterStatus);
                            list[k].specialStatusText = getSpsltext(v.rosterStatus,v.specialStatus,v.workType);
                        });
                        rosterPager(data.context.totalNum);
                        $scope.rosterList = list;
                        $scope.totalNum = data.context.totalNum;
                    }

                }
            });
        }

        function getSpsltext(status, spslStatus,type) {
            if (status == CONSTANT.NAME_STATUS_ID.APPOINT) {//预约
                return CONSTANT.NAME_APPOINT[spslStatus];
            }
            if (status ==  CONSTANT.NAME_STATUS_ID.POTENTIAL) {//以转潜客
                 return CONSTANT.NAME_POTENTIAL[spslStatus];
            }
            if (status == CONSTANT.NAME_STATUS_ID.DELAY) {//延期
                return CONSTANT.NAME_DELAY[type];
            }
            if (status == CONSTANT.NAME_STATUS_ID.INVAILD) {//未接听
                return CONSTANT.NAME_NOANWSER[spslStatus];
            }

        }

        function getDropList(status) { //每条数据的下拉内容
            var arr = [];
            if($scope.isCaozuo){
                if(!(status == "2" || status == "4")){
                    arr.push({
                        index: "0",
                        name: "无效"
                    });
                }
                arr.push({
                    index: "1",
                    name: "编辑"
                });
            }
            if(status !== "1" && $scope.isZhuanqianke){
                arr.push({
                    index: "2",
                    name: "转为潜客"
                });
            }
            if($scope.isCaozuo){
                if (status == "5") {
                    arr.push({
                        index: "3",
                        name: "预约来访"
                    });
                }
                arr.push({
                    index: "4",
                    name: "操作记录"
                });
            }
            return arr;
        }

        function rosterPager(total) {
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
                    if(api.getCurrentEach() != eachPage) {  //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getRosterList(start); //回掉
                }
            });
            $scope.$apply();
        }

        function searchByPending(data) {
            specialStatus="";
            $scope.changeThead_status="desc";
            orderType="desc";
            if (data) {
                var id = data.value;
                rosterStatus = id;

            } else {
                if(data == null){
                    $scope.isInvalid = false;
                    $scope.isApppoint = false;
                    $scope.isPotential = false;
                    subscribeShopId="";
                    rosterStatus="";
                    $scope.changeThead = '操作时间';
                    $scope.isAllStatus=true;
                }
            }

            switch (id) {
                case "1":
                    $scope.changeThead = '预约时间';
                    $scope.changeThead_status="asc";
                    $scope.isAllStatus=false;
                    $scope.isApppoint = true;
                    $scope.isPotential = false;
                    $scope.isInvalid = false;
                    orderType="asc";
                    getShopList();
                    break;
                case "2":
                    $scope.changeThead = '操作时间';
                    $scope.isPotential = true;
                    $scope.isApppoint = false;
                    $scope.isInvalid = false;
                    break;
                case "3":
                    $scope.changeThead = '延期时间';
                    $scope.changeThead_status="asc";
                    $scope.isAllStatus=false;
                    orderType="asc";
                    $scope.isInvalid = false;
                    $scope.isApppoint = false;
                    $scope.isPotential = false;
                    break;
                case "4":
                    $scope.changeThead = '操作时间';
                    $scope.isInvalid = true;
                    $scope.isApppoint = false;
                    $scope.isPotential = false;
                    break;
                default:
                    $scope.changeThead = '操作时间';
                    $scope.isInvalid = false;
                    $scope.isApppoint = false;
                    $scope.isPotential = false;
                    break;
            }

            $timeout(function(){
                $scope.reTheadData();
            },100,true)
            pagerRender = false;
            getRosterList(0);


        }

        function getShopList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getShopListByShopId',
                type: 'get',
                success: function(data) {
                    $scope.shopList = data.context;
                }
            });
        }

        //搜索
        function SearchData(data) {
            if (data) {
                searchType = data.type;
                searchName = data.value;
            } else {
                searchName = "";
            }
            pagerRender = false;
            getRosterList(0);
        }
        //回车
        function Enterkeyup(data) {
            if (data) {
                searchType = data.type;
                searchName = data.value;
            } else {
                searchName = "";
            }
            pagerRender = false;
            getRosterList(0);
        }
        function changeChannel(){
            pagerRender = false;
            getRosterList(0);
        }

        function searchByStore(data) {
            if (data) {
                subscribeShopId = data.shop.shopId;
            } else {
                subscribeShopId = "";
            }
            pagerRender = false;
            getRosterList(0);
        }

        function searchByStatus(data) {
            if (data) {
                specialStatus = data.value;
            } else {
                specialStatus = "";
            }
            pagerRender = false;
            getRosterList(0);

        }

        function searchBySales(data) {
            if (data) {
                teacherId = data.teacherId;
            } else {
                teacherId = "";
            }
            pagerRender = false;
            getRosterList(0);
        }

        function searchByMarketer(data) {
            if (data) {
                marketerId = data.shopTeacherId;
            } else {
                marketerId = "";
            }
            pagerRender = false;
            getRosterList(0);
        }
        function searchByChannelType(data) {
            if(!data){
                channelTypeId = "";
                $scope.hasSecondType = false;
            }else{
                channelTypeId=data.id;
                channelId="";
                if (data.channelList.length > 0) {
                    $scope.channelList = data.channelList;
                    $scope.hasSecondType = true;
                }else{
                    $scope.channelList="";
                    $scope.hasSecondType = false;
                }
            }
            pagerRender = false;
            getRosterList(0);
        }
        function searchByChannel(data) {
            if(!data){
                channelId = "";
            }else{
                channelId=data.id;
            }
            pagerRender = false;
            getRosterList(0);
        }

        //以下是弹框页面的处理
        function openPopByDiv(title, div, width) {
            dialog = layer.open({
                type: 1,
                title: title,
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize:false,
                anim: 0,
                area: width ? width : '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(div)
            })
        }

        function openPop(x) {
            enterType="outside";
            global_rosterId = x.item.rosterId;
            switch (x.type.name) {
                case "无效":
                    invalidName(x.item);
                    break;
                case "编辑":
                    openEdit(x.item);
                    break;
                case "转为潜客":
                    openPotential(x.item);
                    break;
                case "预约来访":
                    openAppoint(x.item);
                    break;
                case "操作记录":
                    openOpreat(x.item);
                    break;
                default:
                    break;
            }
        }


        function closePop() {
            layer.close(dialog);
        }

        //以下是名单导入
        function load_name() {
            $("#upfile").val("");
            $scope.uploadSuccess = false;
            $("#progress_content").hide();
            $scope.isMenuPage = true;
            openPopByDiv('导入名单', '.upload_pop');
        }

        //上传文件
        $("#upfile").on('change', function(e) {
            $scope.isMenuPage = false;
            $scope.hasSecondSelect = false;
            $scope.channelType="";
            $scope.channel_Id="";
            fileVal = $(e.target).val();
            fileVal = fileVal.replace(/\\/g, "/");
            $scope.file_name = fileVal.substring(fileVal.lastIndexOf("/") + 1, fileVal.length);
            getChannelList();
            $scope.$apply();
        });
        $("#upfile_1").on('click', function(e) {
            $("#upfile").trigger("click");
            $scope.$apply();
        });

        function getChannelList() {
            $.hello({
                url: CONFIG.URL + '/api/oa/setting/channelType/list',
                type: 'get',
                data: {type:1,pageType:0,channelNeed:1},
                success: function(data) {
                    if (data.status == "200") {
//                      $scope.channelTypeList=[];
                        $scope.channelTypeList = data.context;
//                      angular.forEach(data.context,function(v){
//                          if(!(v.id == 2 || v.id == 5 || v.id == 6 || v.id == 7)){
//                              $scope.channelTypeList.push(v);
//                          }
//                      });
                    }
                }
            });
        }

        function resourceChange(x) {
            $scope.resourceName="";
            $scope.resourceName2="";
            if(x == ""){
                $scope.channelType = "";
                $scope.hasSecondSelect = false;
            }else{
                var data = JSON.parse(x);
                $scope.channel_Id = "";
                $scope.resourceName = data.channelTypeName;
                if (data.channelList.length > 0) {
                    $scope.hasSecondSelect = true;
                    $scope.channelList = data.channelList;
                }else{
                    $scope.hasSecondSelect = false;
                }
            }

        }
        function upResourceChange(x) {
            if(x == ""){
                $scope.channel_Id = "";
                $scope.resourceName2 = "";
            }else{
                var data = JSON.parse(x);
                $scope.resourceName2 = data.channelName;
            }
        }
        //下载名单模板
        function downloadFile() {
            window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟名单导入模版2.5.xlsx";
        }

        function submit_file(type) {
            if ($scope.channelType == "" || $scope.channelType == undefined) {
                layer.msg("请选择来源渠道");
                return;
            }
            var data = {
                "channelTypeId": JSON.parse($scope.channelType).id,
                "uploadType":type
            };
            if (!( $scope.channel_Id == "" ||  $scope.channel_Id == undefined)) {
                data["channelId"] =  JSON.parse($scope.channel_Id).id;
            }
            layer.load(0);
            $('#form_load').ajaxSubmit({
                url: CONFIG.URL + '/api/oa/upFile/RosterUpload',
                dataType: 'json',
                data: data,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('token', localStorage.getItem('oa_token'));
                },
                success: resutlMsg,
                error: errorMsg
            });

            function resutlMsg(data) {
                $scope.isMenuPage = true;
                $("#progress_content").show();
                if (data.status == "200") {
                    layer.msg('导入成功', {
                        icon: 1
                    });
                    console.log(data);
                    $scope.uploadData = data.context;
                    $scope.uploadSuccess = true;
                    $scope.successData = data.message;
                    $("#upfile").val("");
                   closeReDialog();

                }else if(data.status == "10111"){
                    $scope.reRecordNum=data.context.totalNum;
                    re_dialog = layer.open({
                        type: 1,
                        title: '确认信息',
                        skin: 'layerui', //样式类名
                        closeBtn: 1, //不显示关闭按钮
                        move: false,
                        anim: 0,
                        area: '560px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.reUpload')
                    })

                } else {
                    layer.msg("导入失败", {
                        icon: 5
                    });
                    $scope.uploadSuccess = false;
                    $scope.failedText = data.message;
                    $("#upfile").val("");
                    closeReDialog();
                }
//              pagerRender = false;
                orderType="desc";
                getRosterList(start);

                layer.closeAll('loading');
                $scope.$apply();
            }

            function errorMsg(data) {
                $scope.isMenuPage = true;
                $("#progress_content").show();
                layer.msg("导入失败", {
                    icon: 5
                });
                $("#upfile").val("");
                $scope.uploadSuccess = false;
                $scope.failedText = data.message;
                layer.closeAll('loading');
                $scope.$apply();
            }
        }
        function closeReDialog(){
             $("#upfile").val("");
            layer.close(re_dialog);
        }
        function deleteReupload(){
            submit_file("2");
        }

        function reupload(){
            submit_file("1");
        }
        //以下是名单分配
        function distributeList() {
            sales_orderName="1";
            sales_orderType = "asc";
            getChannelList();
            openPopByDiv('名单分配', '.destribute_pop');
            $scope.selectIsEmpty = true;
            $scope.hasType = false;
            $scope.salesList = []; //清除分配销售列表
            $scope.saleSingle={};
            $scope.type = $scope.channel2=$scope.destri_status = "";
            dest_teacher=dest_channelTypeId=dest_channelId=dest_rosterStatus = ""; //清除来源销售ID
            getTelemarketingList();
            getTelemarketingLists();
            $(".selectSale_pop table").find("input").prop("checked",false);

        }
        function watchSaleNum(e,index){
            var oldTotal=$scope.salesList[index].oldVal;
            var salesTotal=0;
            var val=$scope.salesList[index].number?$scope.salesList[index].number*1:0;
            if(val>0){
                $scope.salesList[index].allTotal=oldTotal*1+val;
            }else{
                $scope.salesList[index].allTotal=oldTotal;
            }
            angular.forEach($scope.salesList,function(v,k){
                if(v.number){
                    salesTotal+=v.number*1;
                }
            });
            $scope.saleSingle.allTotal=$scope.saleSingle.oldVal*1-salesTotal;
            if($scope.saleSingle.allTotal<=0){
                $scope.saleSingle.allTotal=0;
            }
        }
        function add_sale_sourceBtn(onesale) {
            if (onesale) {
                $scope.selectOneSale = true;
            } else {
                $scope.selectOneSale = false;

            }
            if($scope.telemarketingLists.length>10){
                $(".selectSale_pop tbody").css({
                    "width":"calc(100% + 17px)"
                });
            }else{
               $(".selectSale_pop tbody").css({
                    "width":"100%"
                });
            }
            sales = layer.open({
                type: 1,
                title: "名单公池",
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                anim: 0,
                area: '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $('.selectSale_pop'),
            })
        }

        function sale_sortCllict(data) {
            sale_orderName = data.id;
            sale_orderType = data.sort;
            getTelemarketingList();
            console.log(data.sort + '--' + data.id);
        }
        function sales_sortCllict(data) {
            sales_orderName = data.id;
            sales_orderType = data.sort;
            getTelemarketingLists();
            console.log(data.sort + '--' + data.id);
        }
        function getTelemarketingList() {
            var params = {
                "orderName": sale_orderName,
                "orderType": sale_orderType
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getTelemarketingList',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.telemarketingList = data.context;
                    }
                }
            });
        }
        function getTelemarketingLists() {
            var params = {
                "orderName": sales_orderName,
                "orderType": sales_orderType,
                "dataType":1
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getTelemarketingList',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.telemarketingLists = data.context;
                    }
                }
            });
        }

        function selectSale(e) {
            if (e.target.nodeName !== "INPUT") {
                $(e.target).closest("tr").find("input").prop("checked", true);
                $(e.target).closest("tr").siblings("tr").find("input").prop("checked", false);
            }
        }

        //以下是复选框
        function selectSales(e) { //复选
            var e = e || event;
            if (e.target.nodeName !== "INPUT") {
                if ($(e.target).closest("tr").find("input").prop("checked")) {
                    $(e.target).closest("tr").find("input").prop("checked", false);
                } else {
                    $(e.target).closest("tr").find("input").prop("checked", true);
                }
            }
            e.stopPropagation();
        }
        //if表头有复选框，则调用此方法
        function checkboxClick(e) {
            var e = e || event;
            if ($(e.target).prop("checked")) {
                $(e.target).closest("table").find("tbody input").prop("checked", true);
            } else {
                $(e.target).closest("table").find("tbody input").prop("checked", false);
            }
        }

        //确认已选择的销售
        function confrimSale() {
            if ($scope.selectOneSale) {//来源销售
                $scope.saleSingle={};
                var doms = $(".selectSale_pop tbody .selectSale");
                var itemData = {};
                $.each(doms, function(index, item) {
                    if (item.checked) {
                        var data = JSON.parse($(item).attr("data-sale"));
                        data.oldVal=data.allTotal;
                        itemData = data;
                    }
                });
                if (JSON.stringify(itemData) == "{}") {
                    layer.msg("请选择销售");
                    return;
                }
                dest_teacher = itemData;
                $scope.saleSingle = itemData;
                //重置分配销售数据
                if($scope.salesList.length>0){
                    angular.forEach($scope.salesList,function(v,k){
                        v.number="";
                        v.allTotal=v.oldVal;
                    });
                }
                $scope.selectIsEmpty = false;
                $scope.hasType = false;
                $scope.channelList2=[];
                $scope.type = $scope.destri_status = $scope.channel2 = "";
                dest_channelTypeId = dest_channelId = dest_rosterStatus="";

            } else {//分配销售
                var doms = $(".selectSale_pop tbody .selectSales");
                var arr = [];
                $.each(doms, function(index, item) {
                    if (item.checked) {
                        var data = JSON.parse($(item).attr("data-sales"));
                        data.oldVal=data.allTotal;
                        arr.push(data);
                    }
                });
                $scope.salesList = arr;
                //重置来源销售
                if($scope.saleSingle){
                    $scope.saleSingle.allTotal = $scope.saleSingle.oldVal;
                    getTelemarketingInfoTotalById();
                }
            }
            layer.close(sales);
        }

        function getTelemarketingInfoTotalById() {
            if(dest_teacher == "" || dest_teacher==undefined){
                layer.msg("请选择来源销售");
                return;
            }
            var params = {
//              "teacherId": dest_teacher,
                "channelTypeId": dest_channelTypeId,
                "channelId": dest_channelId,
                "rosterStatus": dest_rosterStatus,
            };
            if(dest_teacher.teacherName == "无销售"){
                params["noOaUser"]="1";
            }else{
                params["teacherId"]=dest_teacher.teacherId;
            }
            for (var i in params) {
                if (params[i] == "" || params[i] == undefined) {
                    delete params[i];
                }
            }
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getTelemarketingInfoTotalById',
                type: 'get',
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        console.log(data.message);
                        $scope.saleSingle.allTotal = data.context;
                        $scope.saleSingle.oldVal=data.context;
                    }
                }
            });
        }

        function resourceChange2(x) {
            if (dest_teacher == "" || dest_teacher == undefined) {
                layer.msg("请先选择来源销售");
                return;
            }
            $scope.channelList2=[];
            $scope.channel2="";
            dest_channelTypeId="";
            dest_channelId="";
            if (x == "") {
                dest_channelTypeId = "";
                $scope.hasType = false;
            } else {
                var data = JSON.parse(x);
                dest_channelTypeId = data.id;
                if (data.channelList && data.channelList.length > 0) {
                    $scope.hasType = true;
                    $scope.channelList2 = data.channelList;
                }else{
                    $scope.hasType = false;
                    $scope.channelList2 = [];
                }
            }
            getTelemarketingInfoTotalById();
        }

        function channelChange2(x) {
            dest_channelId = x;
            getTelemarketingInfoTotalById();
        }

        function changeStatus(x) {
            if (dest_teacher == "" || dest_teacher == undefined) {
                layer.msg("请先选择来源销售");
                return;
            }
            dest_rosterStatus = x;
            getTelemarketingInfoTotalById();
        }

        function deleteSales(index) {
            $scope.salesList.splice(index, 1);
        }

        function destribute_confirm() {
            if (dest_teacher == "" || dest_teacher == undefined) {
                layer.msg("请先选择来源销售");
                return;
            }
            var destributeSales = [];
            var selectTotal = 0;
            var list = $scope.salesList;
            angular.forEach(list, function(v, k) {
                var obj = {};
                var num = v.number * 1;
//              if (v.teacherId) {
                    obj.teacherId = v.teacherId;
                    obj.total = num;
                    selectTotal += num;
                    destributeSales.push(obj);
//              }else{
//
//              }

            });
            if (destributeSales.length <= 0) {
                layer.msg("请选择分配销售");
                return;
            }
            if (selectTotal <= 0) {
                layer.msg("请输入分配名单数量");
                return;
            }
            if (selectTotal > $scope.saleSingle.oldVal) {
                layer.msg("分配数量不能大于来源名单数量");
                return;
            }
            var params = {
//              "teacherId": dest_teacher,
                "channelTypeId": dest_channelTypeId,
                "channelId": dest_channelId,
                "rosterStatus": dest_rosterStatus,
                "allotRosterInfos": destributeSales
            };
             if(dest_teacher.teacherName == "无销售"){
                params["noOaUser"]="1";
            }else{
                params["teacherId"]=dest_teacher.teacherId;
            }
            for (var i in params) {
                if (params[i] == "" || params[i] == undefined) {
                    delete params[i];
                }
            }
            console.log(params);
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/allotRoster',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        layer.close(dialog);
//                      pagerRender=false;
                        getRosterList(start);
                    }
                }
            });
        }

        function closeSale() {
            layer.close(sales);
        }
        //以下是延期处理
        function openDelay(x) {
            $scope.listData = x;
            $scope.currenTime = "";
            $scope.delayDesc=x.rosterDesc;
//          $scope.delayTime = "";
//          $scope.isToday = false;
            openPopByDiv('延期处理', ".delay_pop");
//          $scope.timeList = CONSTANT.DELAY_TIME;
        }

//      function getTimeArr() {
//          var arr = [];
//          for (var i = 0; i < 15; i++) {
//              var start = i + 8;
//              arr[i] = (start >= 10 ? start : "0" + start) + ":" + "00";
//          }
//          return arr;
//      }

//      function setDelayTime(id) {
//          if (id == "0") {
//              var list = getTimeArr();
//              var hour = new Date().getHours();
//              if (hour < list[0].split(":")[0]) {
//                  $scope.timeHmList = list;
//                  $scope.isToday = true;
//              } else if (hour >= list[list.length - 1].split(":")[0]) {
//                  $scope.timeHmList = [];
//              } else {
//                  var arr1 = [];
//                  angular.forEach(list, function(v, k) {
//                      var time = v.split(":")[0];
//                      if (hour < time) {
//                          arr1.push(v);
//                      }
//                  });
//                  $scope.timeHmList = arr1;
//                  $scope.delayTime = $scope.timeHmList[0];
//                  $scope.isToday = true;
//              }
//          } else {
//              $scope.isToday = false;
//          }
//      }

        function delay_confirm(x) {
            var params = {
                "rosterId": x.rosterId,
                "rosterDesc":$scope.delayDesc,
                "workTime":$scope.currenTime,
                "rosterRecordType": 4
            };
//          if ($scope.currenTime == "0") {
//              if (!$scope.delayTime) {
//                  layer.msg("请选择时间");
//                  return;
//              }
//              params["time"] = yznDateFormatYMdHms($scope.delayTime);
//          }
//          if ($scope.currenTime >= 1 && $scope.currenTime <= 15) {
//              params["dayNumber"] = $scope.currenTime;
//          }
//          if ($scope.currenTime == 30) {
//              params["moonNumber"] = 1;
//          }
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/addRosterRecord',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        layer.close(dialog);
//                      pagerRender=false;
                        getRosterList(start);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }

        //以下是编辑名单
        function openEdit(x) {
            $scope.detailData = angular.copy(x);
            $scope.detail = $scope.detailData;
            if(parseInt(x.age) <= 6 && x.birthday) {
                $scope.hasMonth=true;
                $scope.detail.studentMonth = "岁"+caclAgeToMonth(x.birthday) + "月" + " ";
            } else {
                $scope.hasMonth=false;
                $scope.detail.studentMonth = "";
            }
            openPopByDiv('编辑', '.editName_pop');
        }

        function edit_confirm() {
//          if(!$scope.detailData.birthday && !$scope.detailData.age){
//              layer.msg("年龄和生日不可以同时为空");
//              return;
//          }
            if(!/^1\d{10}$/.test($scope.detailData.userPhone)){
                return layer.msg("请正确填写手机号");
            }
            var params = {
                "rosterId": $scope.detailData.rosterId,
                "studentName": $scope.detailData.studentName,
                "rosterDesc": $scope.detailData.rosterDesc,
                "userName": $scope.detailData.userName,
                "userPhone": $scope.detailData.userPhone,
                "sex": $scope.detailData.sex,
                "age": $scope.detail.age?$scope.detail.age:"",
                "birthday": $scope.detail.birthday?$scope.detail.birthday:"",
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/updateRoster',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        layer.close(dialog);
//                      pagerRender=false;
                        getRosterList(start);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }
        //以下是转为潜客
        function openPotential(data) {
            $scope.potentialData = data;
            potentialInit();
            console.log(data);
            $scope.studentNickName = '';
            openPopByDiv('转为潜客', '.potential_pop', '760px');
        }

        function changeShop(id) {
            if (!(id == "" || id == undefined)) {
                $.hello({
                    url: CONFIG.URL + '/api/oa/roster/getAdviserList',
                    type: 'get',
                    data: {
                        "shopId": id
                    },
                    success: function(data) {
                        $scope.adviserList = data.context;
                    }
                });
            } else {
                $scope.adviser="";
                $scope.adviserList = [];
            }
        }

        function potentialInit() {
            $scope.Relation_phone = $scope.potentialData.userPhone;
            $scope.Relation_name = $scope.potentialData.userName;
            $scope.Relation_relation = CONSTANT.POTENTIALCUSTOMERPARENTVAL.MOTHER.toString();
            $scope.addParentList = [];
//          var obj = {
//              "relation": "0",
//              "name": $scope.potentialData.userName,
//              "phone": $scope.potentialData.userPhone
//          };
//          $scope.addParentList.push(obj);
            $scope.studentIntent = "1"; //意向度最低
            $scope.tip_text = CONSTANT.INTENT_SHOW[1];
            $scope.studentGend =$scope.potentialData.sex; //性别未知
            $scope.detail = $scope.potentialData;
            $scope.ageType = $scope.potentialData.birthday?"1":"2";
            if(parseInt($scope.potentialData.age) <= 6 && $scope.potentialData.birthday) {
                $scope.hasMonth=true;
                $scope.detail.studentMonth = "岁"+caclAgeToMonth($scope.potentialData.birthday) + "月" + " ";
            } else {
                $scope.hasMonth=false;
                $scope.detail.studentMonth = "";
            }
            getShopListByShopId();
            changeShop($scope.potentialData.shopId);
        }

        function addParent() {
//          var len = $scope.addParentList.length;
//          for (var i = 0; i < len; i++) {
//              var selectVal = $scope.addParentList[i].relation;
//              var name = $scope.addParentList[i].name;
//              var phone =  $scope.addParentList[i].phone;
//              if (phone == "") {
//                  return;
//              }
//          }
            if ($scope.addParentList.length >= 2) {
                layer.msg("最多添加两条");
                return;
            }
            var obj = {
                "relation": "",
                "name": "",
                "phone": ""
            };
            $scope.addParentList.push(obj);
        }

        function deleteRelation(e, index) {
//          var $this = $(e.target);
//          if ($scope.addParentList.length >= 1) {
                $scope.addParentList.splice(index, 1);
//          }
        }

        function intentShow(idex) {
            $scope.tip_text=CONSTANT.INTENT_SHOW[idex];
        }

        function potential_confirm() {
//          if(!$scope.potentialData.age && !$scope.potentialData.birthday){
//              layer.msg("年龄和生日不可以同时为空");
//              return;
//          }
            if(!/^1\d{10}$/.test($scope.Relation_phone)){
                layer.msg("请正确填写手机号");
                return;
            }
            var params = {
                "rosterId": global_rosterId,
                "name": $scope.potentialData.studentName,
                "nickname": $scope.studentNickName,
                "sex": $scope.studentGend,
                "shopId": $scope.potentialData.subscribeShopId,
                "oaUserId": $scope.adviser,
                "intent": $scope.studentIntent,
                "potentialCustomerDesc": $scope.potentialData.rosterDesc,
                "channelTypeId":$scope.potentialData.channelTypeId,
                "channelId":$scope.potentialData.channelId,
                "age": $scope.potentialData.age?$scope.potentialData.age:undefined,
                "birthday": $scope.potentialData.birthday?$scope.potentialData.birthday:undefined,
                "potentialCustomerParentPhone":$scope.Relation_phone,
                "potentialCustomerParentType":$scope.Relation_relation,
                "potentialCustomerParentName":$scope.Relation_name,
            };
            angular.forEach($scope.addParentList,function(v,k){
                var selectVal = v.relation;
                var name = v.name;
                var phone =  v.phone;
                if (k == 0 && phone && /^1\d{10}$/.test(phone)) {
                    params["potentialCustomerParentTowType"] = selectVal;
                    params["potentialCustomerParentTowName"] = name;
                    params["potentialCustomerParentTowPhone"] = phone;
                }
                if (k == 1 && phone && /^1\d{10}$/.test(phone)) {
                    params["potentialCustomerParentThreeType"] = selectVal;
                    params["potentialCustomerParentThreeName"] = name;
                    params["potentialCustomerParentThreePhone"] = phone;
                }
            });
//          var len = $scope.addParentList.length;
//          for (var i = 0; i < len; i++) {
//              var selectVal = $scope.addParentList[i].relation;
//              var name = $scope.addParentList[i].name;
//              var phone =  $scope.addParentList[i].phone;
//              if (phone == "") {
//                  layer.msg("请填写家长手机号");
//                  return;
//              }
//              if (i == 0) {
//                  params["potentialCustomerParentType"] = selectVal;
//                  params["potentialCustomerParentName"] = name;
//                  params["potentialCustomerParentPhone"] = phone;
//                  if(!/^1\d{10}$/.test(phone)){
//                      return layer.msg("请正确填写手机号");
//                      break;
//                  }
//              }
//              if (i == 1) {
//                  params["potentialCustomerParentTowType"] = selectVal;
//                  params["potentialCustomerParentTowName"] = name;
//                  params["potentialCustomerParentTowPhone"] = phone;
//                  if(!/^1\d{10}$/.test(phone)){
//                      return layer.msg("请正确填写手机号");
//                      break;
//                  }
//              }
//              if (i == 2) {
//                  params["potentialCustomerParentThreeType"] = selectVal;
//                  params["potentialCustomerParentThreeName"] = name;
//                  params["potentialCustomerParentThreePhone"] = phone;
//                  if(!/^1\d{10}$/.test(phone)){
//                      return layer.msg("请正确填写手机号");
//                      break;
//                  }
//              }
//          }
            for (var i in params) {
                if (params[i] == "" || params[i] == undefined) {
                    delete params[i];
                }
            }
            console.log(params);
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/addPotentialCustomerInRoster',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
//                      pagerRender=false;
                        getRosterList(start);
                        layer.close(dialog);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }

        //以下是预约来访
        function openAppoint(data) {
            global_rosterId = data.rosterId;
            getShopListByShopId();
            $scope.shopId="";
            $scope.apppointTime="";
            $scope.apppointDesc=data.rosterDesc;
            $scope.$broadcast('school_','clearSearchVal');
            $scope.$broadcast('school_','clearHeadName');
            openPopByDiv('预约来访', '.apppoint_pop');
        }
        $scope.sel_school = sel_school;//选择校区
        function sel_school(n){
            $scope.shopId = n.shop.shopId;
        }
        function apppoint_confirm() {
            var val=$scope.apppointTime;
            if (val == "" || val == undefined) {
                layer.msg("请选择预约时间");
                return;
            }
            var params = {
                "rosterId": global_rosterId,
                "shopId": $scope.shopId,
                "rosterDesc":$scope.apppointDesc,
                "rosterRecordType": 5,
                "workTime": val
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/addRosterRecord',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
//                      pagerRender=false;
                        getRosterList(start);
                        layer.close(dialog);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }

        function getShopListByShopId() {
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getShopListByShopId',
                type: 'get',
                success: function(data) {
                    if (data.status == "200") {
                        $scope.shopListByShopId = data.context;
                    }
                }
            });
        }
        //以下是操作记录
        function openOpreat(x) {
            global_rosterId=x.rosterId;
            openPopByDiv('操作记录', '#record_pop', "760px");
            getOperateRecord();

        }
        function getOperateRecord(){
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/getRosterRecordList',
                type: 'get',
                data: {
                    "rosterId": global_rosterId
                },
                success: function(data) {
                    var list = data.context;
                    if (data.context.length > 0) {
                        angular.forEach(list, function(v, k) {
                            list[k].opreate = CONSTANT.NAMELIST_TYPE[v.rosterRecordType];
                            list[k].opreateDesc = getOperatedesc(v.rosterRecordType, v);
                        });
                    }
                    $scope.recordList = list;
                }
            });
        }
        function getOperatedesc(type, v) {
            var arr = [];
            switch (type) {
                case "0":
                    arr = ["采单员", v.marketerName,"名单分配至 :",v.toTeacherName];
                    break;
                case "1":
                    arr = ["名单分配至", v.toTeacherName];
                    break;
                case "2":
                    arr = ["无效原因", CONSTANT.NAME_NOANWSER[v.specialStatus]];
                    break;
                case "3":
                    arr = [];
                    break;
                case "4":
                    arr = ["延期至", v.workTime ? yznDateFormatYMdHm(v.workTime) : ""];
                    break;
                case "5":
                    arr = ["预约来访", (v.workTime ? yznDateFormatYMdHm(v.workTime) : ""),"预约校区 :", v.shopName];
                    break;
                case "6":
                    arr = ["处理校区", v.shopName+"   "+v.rosterRecordDesc];
                    break;
                case "7":
                    arr = ["分配顾问", (v.potentialCustomerTeacherName ? v.potentialCustomerTeacherName : "") ,"处理校区 :",v.shopName];
                    break;
                case "8":
                    arr = ["激活原因",v.rosterRecordDesc];
                    break;
            }
            return arr;

        }

        //以下是未接听
        function noAnswer(data) {
            global_rosterId = data.rosterId;
            var params = {
                "rosterId": global_rosterId,
                "rosterRecordType": 3
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/addRosterRecord',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
//                      pagerRender=false;
                        getRosterList(start);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }
        //以下是激活名单
        function nameActive(data) {
            global_rosterId = data.rosterId;
            $scope.activeName="";
            openPopByDiv('激活名单', '.activeName_pop');
        }

        function activeName_confirm() {
            var params = {
                "rosterId": global_rosterId,
                "rosterRecordType": 8,
                "rosterRecordDesc": $scope.activeName,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/addRosterRecord',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
//                      pagerRender=false;
                        getRosterList(start);
                        layer.close(dialog);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }
        //以下是无效名单
        function invalidName(data) {
            global_rosterId = data.rosterId;
            openPopByDiv('无效名单', '.invalidName_pop');
            $scope.invalid = "0";
        }

        function invalidName_confirm() {
            var params = {
                "rosterId": global_rosterId,
                "rosterRecordType": 2,
                "specialStatus": $scope.invalid,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/addRosterRecord',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
//                      pagerRender=false;
                        getRosterList(start);
                        layer.close(dialog);
                        if(enterType == "inside"){
                            getNameDetail();
                        }
                    }
                }
            });
        }
        //以下是编辑备注
        function editRemark(x) {
            var params = {
                "rosterId": x.id,
                "rosterDesc": x.value,
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/roster/updateRoster',
                type: 'post',
                data: JSON.stringify(params),
                success: function(data) {
                    if (data.status == "200") {
                        getRosterList(start);
                        $(".edit_remark").removeClass("open");
                    }
                }
            });

        }

        function gotoNameDetail(x){
            console.log(x);
            enterType="inside";
            global_rosterId=x.rosterId;
            getNameDetail();
            edit_dialog= layer.open({
                type: 1,
                title: false,
                skin: 'layui-layer-demo', // 样式类名
                closeBtn: 0, // 不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: '960px',
                offset: '30px',
                shadeClose: false, // 开启遮罩关闭
                content: $('.nameDetail')
            });
        }
        function getNameDetail(){
            $.hello({
                    url: CONFIG.URL + "/api/oa/roster/getRosterInfo",
                    type: "get",
                    data: {
                        rosterId: global_rosterId
                    },
                    success: function(res) {
                        if(res.status == 200) {
                            $scope.nameDetail = res.context;
                        }
                    }
                });
                getOperateRecord();
        }
        function closeEditPop(){
            layer.close(edit_dialog);
        }
        function export_config() {
            if(rosterStatus == "1" || rosterStatus == "3"){
                orderName="workTime";
            }else if(rosterStatus == ""){
                if(orderType){
                    orderName="rosterChangeDate";
                }else{
                    orderName="";
                }
            }else{
                orderName="rosterChangeDate";
            }
            var params = {
                "token":localStorage.getItem('oa_token'),
                "rosterStatus": rosterStatus,
//              "teacherId": teacherId,
                "marketerId": marketerId,
                "searchType": searchName?'appSearchName':undefined,
                "searchName": searchName,
                "specialStatus": specialStatus,
                "orderType": orderType,
                "orderName":orderName ,
                "channelTypeId":channelTypeId,
                "channelId":channelId
            };
            if(rosterStatus == "1"){
                params["subscribeShopId"]=subscribeShopId;
            }
            if(teacherId == "0"){
                params["noOaUser"]="1";
            }else{
                params["teacherId"]=teacherId;
            }
            if($scope.searchTime){
                if(rosterStatus == "1" || rosterStatus == "3"){
                    params["workBeginTime"]=$scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                    params["workEndTime"]=$scope.searchTime.split(" 到 ")[1]+" 23:59:59";
                }else{
                    params["rosterChangeBeginDate"]=$scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                    params["rosterChangeEndDate"]=$scope.searchTime.split(" 到 ")[1]+" 23:59:59";
                }
            }
            for (var i in params) {
                if (params[i] == '' || params[i] == undefined) {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/consultantRoster?' + $.param(params));
        }
    }]
})