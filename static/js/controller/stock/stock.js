define(['laydate', "jqFrom", 'pagination', 'mySelect', 'importPop', 'students_sel'], function(laydate, jqFrom) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout',function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type = search_name = undefined;
        var search_orderName = undefined,
            search_orderTyp = undefined;
        $scope.useType = true;
        $scope.useType1 = false;
        $scope.isDetail = false;
        $scope.isShow = false;
        init();

        function init() {
            getConfig();
            getHandler(); //经办人
            $scope.studNavJud = 1;
            $scope.selectInfoNameId = 'goodsName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                goodsName: '物品名称',
            };
            //表头
            $scope.stockListThead = [{
                'name': '物品名称',
                'width': '25%'
            }, {
                'name': '规格',
                'width': '35%',
            }, {
                'name': '库存数量',
                'width': '20%',
                'id': 'num',
                'issort': true,
            }, {
                'name': '待领取数量',
                'width': '20%',
            }, {
                'name': '状态',
                'width': '20%'
            }, {
                'name': '操作',
                'align': 'center',
                'width': '150'
            }, ];
            $scope.operateStorage = checkAuthMenuById("91"); //操作库存
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.SearchData = searchdata;
            $scope.Enterkeyup = searchdata;
            $scope.changeType = changeType;
            $scope.addGoods = addGoods; //新增物品
            $scope.confirm_addGoods = confirm_addGoods; //新增或编辑确认物品
            $scope.addInStorage = addInStorage; //入库
            $scope.addOutStorage = addOutStorage; //出库
            $scope.git_exchange = git_exchange; //兑换礼品
            $scope.addItem = addItem; //添加出库或入库列表
            $scope.removeItem = removeItem; //删除出库或入库列表
            $scope.confirm_storage = confirm_storage; //确认出库或入库
            $scope.setSelectNum = setSelectNum;
            $scope.checkGoods = checkGoods; //清点物品
            $scope.confirm_checkGoods = confirm_checkGoods; //清点确认物品
            $scope.gotoGoodsDetail = gotoGoodsDetail; //物品详情
            $scope.changeBtn = changeBtn; //切换按钮
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop; //关闭弹框
            $scope.sortCllict = sortCllict;
            $scope.delStudent = delStudent;
            stockList(0);
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                $timeout(function () {
                    if ($scope.$stateParams.screenValue.pop == "兑换礼品") {
                        git_exchange();
                    }
                    if ($scope.$stateParams.screenValue.pop == "新增出库") {
                        addOutStorage();
                    }
                    if ($scope.$stateParams.screenValue.pop == "新增入库") {
                        addInStorage();
                    }
                    if ($scope.$stateParams.screenValue.pop == "新增物品") {
                        addGoods('add');
                    }
                    if ($scope.$stateParams.screenValue.pop == "导入物品") {
                        $scope.goCommonPop('import-pop', 'import_popup', '860px', { page: '物品' });
                    }
                 })
            }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.addGoodsSpec = function() {
                $scope.goods.goodsSpecList.push({
                    name: '默认'
                })
            };
        }

        function delStudent(x, ind) {
            (x || $scope.gitData.apt_students).splice(ind, 1);
        }

        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.config = data.context.config;
                        if ($scope.config & CONFIG_INTEGRAL_CONTROL) {
                            $scope.isShow = true;
                        }
                    }
                }
            })
        }

        function closePop() {
            layer.close(dialog);
        }

        function switchStudNav(n) {
            $scope.studNavJud = n;
            search_type = search_name = undefined;

            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $state.go("stock", {});
            } else {
                $state.go("stock/record", {});
            }
        }

        function sortCllict(data) {
            search_orderName = data.id;
            search_orderTyp = data.sort;
            pagerRender = false;
            stockList(0);
        }

        function searchdata(d) {
            pagerRender = false;
            search_type = d ? d.type : null;
            search_name = d ? d.value : null;
            stockList(0);
        }

        function changeType(type) {
            start = "0";
            if (type) {
                if ($scope.useType) {
                    $scope.useType = true;
                    $scope.useType1 = false;
                }
            } else {
                if ($scope.useType1) {
                    $scope.useType1 = true;
                    $scope.useType = false;
                }
            }
            pagerRender = false;
            stockList(0);
        }

        function changeBtn(x) {
            if (!$scope.operateStorage) return;
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/update",
                type: "post",
                data: JSON.stringify({ goodsId: x.goodsId, goodsStatus: x.goodsStatus == 1 ? 0 : 1 }),
                success: function(data) {
                    if (data.status == '200') {
                        pagerRender = false;
                        stockList(0);
                    }
                }
            })
        }

        function onReset() {
            search_type = search_name = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            $scope.useType = true;
            $scope.useType1 = false;
            pagerRender = false;
            stockList(0);
        }
        $scope.$on('reloadGoods', function() {
            pagerRender = false;
            stockList(0);
        });

        function stockList(start_) { //获取请假补课列表信息
            start = start_ == 0 ? "0" : start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                'goodsType': 1,
                "goodsName": search_name,
                "goodsStatus": $scope.useType ? "1" : $scope.useType1 ? "0" : undefined,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "goodsSpecStatus": 1
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        data.context.items.map(function(item) {
                            item.goodsSpecListNames = arrToStr(item.goodsSpecList, 'name', ';')
                        })
                        $scope.stocklist = data.context.items;
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
                    stockList(start); //回调
                }
            });

        }

        function addGoods(type, x) {
            var title;
            $scope.addGoodsType = type;
            if (type == 'add') {
                title = "新增";
                $scope.goods = {
                    goodsName: undefined,
                    barCoding: undefined,
                    //                  unit :undefined,
                    sellStatus: 1,
                    goodsPrice: undefined,
                    goodsSpecList: [{ name: '默认' }]

                };
            } else {
                title = "编辑";
                $scope.goods = angular.copy(x);
            }
            openPopByDiv(title + "物品", ".add_goods", "760px");
        }

        function confirm_addGoods() {
            var url;
            var param = {
                goodsName: $scope.goods.goodsName,
                barCoding: $scope.goods.barCoding,
                sellStatus: $scope.goods.sellStatus,
                goodsType: 1
            };
            if (!$scope.goods.goodsSpecList.length) {
                return layer.msg('请添加规格')
            }
            param.goodsSpecList = $scope.goods.goodsSpecList;
            if ($scope.addGoodsType == 'add') {
                url = "/api/oa/goods/add";
            } else {
                url = "/api/oa/goods/update";
                param["goodsId"] = $scope.goods.goodsId;
            }
            $.hello({
                url: CONFIG.URL + url,
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        if ($scope.addGoodsType == 'add') {
                            pagerRender = false;
                            stockList(0);
                        } else {
                            stockList(start);
                        }
                        closePop();
                        if ($scope.isDetail) {
                            layer.close(detailPop);
                        }
                    }

                }
            })
        }

        function getHandler() {
            $.hello({ //经办人 /api/oa/order/getHandlerList
                url: CONFIG.URL + "/api/oa/order/getHandlerList",
                type: "get",
                success: function(data) {
                    if (data.status == 200) {
                        $scope.handlerList = data.context;
                    }
                }
            });
        }
        $scope.confirmRecive_click = function(n) {
            $scope.shopTeacherId = n ? n.shopTeacherId : undefined;
        };

        function addInStorage() {
            $scope.screen_goReset['confirmReciveSel'](window.currentUserInfo.teacherName);
            $scope.shopTeacherId = window.currentUserInfo.shopTeacherId;
            $scope.storageType = 'in';
            $scope.inStorage = [{ goodsId: undefined, goodsSpecList: [], mixid: GenNonDuplicateID(5),goodsSpecId:undefined,goodsSpecName:"" }];
            $scope.startTime = yznDateFormatYMdHms(new Date());
            laydate.render({
                elem: '#startTime', //指定元素
                isRange: false,
                type: "datetime",
                format: 'yyyy-MM-dd HH:mm:ss',
                done: function(value) {
                    $scope.startTime = value;
                }
            });
            $scope.desc = "";
            getGoods(function() {
                setTimeout(function() {
                    $scope.$broadcast('_inStock_' + $scope.inStorage[0].mixid, 'clearHeadName', '请选择入库物品'); //重置标签名
                    $scope.$broadcast('_inStock_' + $scope.inStorage[0].mixid + '_', 'clearHeadName', '请选择物品规格'); //重置标签名
                    $scope.$apply();
                });
            });

            $scope.selectStock_in = selectStock_in;
            openPopByDiv("新增入库", ".add_Storage", "760px");
            // 选择规格
            $scope.specClickin = function(n, item) {
                item.goodsSpecId = n.goodsSpecId;
                item.goodsSpecName = n.name;
            }

            // 选择入库商品
            function selectStock_in(n, item) {
                if(n.goodsSpecList && n.goodsSpecList.length>0){
                    $scope.$broadcast('_inStock_' + item.mixid + '_', 'clearHeadName',n.goodsSpecList[0].name);
                    item.goodsSpecId = n.goodsSpecList[0].goodsSpecId;
                    item.goodsSpecName = n.goodsSpecList[0].name;
                }else{
                    $scope.$broadcast('_inStock_' + item.mixid + '_', 'clearHeadName', '请选择物品规格'); //重置标签名
                }
                item.goodsSpecList = n.goodsSpecList;
                item.goodsId = n.goodsId;
                item.goodsName = n.goodsName;
            }
        }

        function addOutStorage() {
            $scope.screen_goReset['confirmReciveSel'](window.currentUserInfo.teacherName);
            $scope.shopTeacherId = window.currentUserInfo.shopTeacherId;
            $scope.storageType = 'out';
            $scope.outStorage = [{ goodsId: undefined, goodsSpecList: [], mixid: GenNonDuplicateID(5),goodsSpecId:undefined,goodsSpecName:"", oldNum:undefined,old_unclaimedNum:undefined}];
            $scope.startTime = yznDateFormatYMdHms(new Date());
            laydate.render({
                elem: '#startTime', //指定元素
                isRange: false,
                type: "datetime",
                format: 'yyyy-MM-dd HH:mm:ss',
                done: function(value) {
                    $scope.startTime = value;
                }
            });
            $scope.desc = "";
            getGoods(function() {
                setTimeout(function() {
                    $scope.$broadcast('_outStock_' + $scope.outStorage[0].mixid, 'clearHeadName', '请选择出库物品'); //重置标签名
                    $scope.$broadcast('_outStock_' + $scope.outStorage[0].mixid + '_', 'clearHeadName', '请选择物品规格'); //重置标签名
                    $scope.$apply();
                });
            });

            $scope.selectStock_out = selectStock_out;
            openPopByDiv("新增出库", ".add_Storage", "760px");
            // 选择规格
            $scope.specClickout = function(n, item) {
                item.goodsSpecId = n.goodsSpecId;
                item.goodsSpecName = n.name;
                if (n) {
                    item.oldNum = n.stockNum;
                    item.old_unclaimedNum = n.unclaimedNum;
                }
            };
            // 选择出库商品
            function selectStock_out(n, item) {
                if (n) {
                    item.goodsId = n.goodsId;
                    item.goodsName = n.goodsName;
                    getSpec(n.goodsId, function(data) {
                        item.goodsSpecList = data;
                        if(data && data.length>0){
                            $scope.$broadcast('_outStock_' + item.mixid + '_', 'clearHeadName',data[0].name);
                            item.goodsSpecId = data[0].goodsSpecId;
                            item.goodsSpecName = data[0].name;
                            item.oldNum = data[0].stockNum;
                            item.old_unclaimedNum = data[0].unclaimedNum;
                        }else{
                            $scope.$broadcast('_outStock_' + item.mixid + '_', 'clearHeadName', '请选择物品规格'); //重置标签名
                            item.oldNum = n.stockNum;
                            item.old_unclaimedNum = n.unclaimedNum;
                        }
                    });
                }
            }
        }

        function git_exchange() {
            $scope.gitData = {
                apt_students: [],
                pointsValue: "",
                stockRecordGoodsList: [{ goodsId: undefined, num: undefined,goodsSpecList: [], mixid: GenNonDuplicateID(5), goodsSpecId:undefined,goodsSpecName:"" }],
                outInTime: yznDateFormatYMdHms(new Date())
            }
            $scope.selectStock_out = selectStock_out;
            $scope.gitSpecClick = gitSpecClick;
            $scope.checkStudent = checkStudent; //选择规格

            $scope.confirm_gitExchange = confirm_gitExchange;
            laydate.render({
                elem: '#outInTime', //指定元素
                isRange: false,
                type: "datetime",
                format: 'yyyy-MM-dd HH:mm:ss',
                done: function(value) {
                    $scope.gitData.outInTime = value;
                }
            });
            getGoods(function() {
                setTimeout(function() {
                    $scope.$broadcast('git_outStock_' + $scope.gitData.stockRecordGoodsList[0].mixid, 'clearHeadName', '请选择出库物品'); //重置标签名
                    $scope.$broadcast('git_outStock_' + $scope.gitData.stockRecordGoodsList[0].mixid + '_', 'clearHeadName', '请选择物品规格');
                })
            });
            openPopByDiv("兑换礼品", "#gitExchange", "660px");

            function selectStock_out(n, item) {
                if (!n) {
                    item.goodsId = undefined;
                    item.oldNum = "";
                    item.goodsSpecId=undefined;
                } else {
                    item.goodsId = n.goodsId;
                    item.goodsName = n.goodsName;
                    getSpec(n.goodsId, function(data) {
                        item.goodsSpecList = data;
                        if(data && data.length>0){
                            $scope.$broadcast('git_outStock_' + item.mixid + '_', 'clearHeadName',data[0].name);
                            item.goodsSpecId = data[0].goodsSpecId;
                            item.goodsSpecName = data[0].name;
                            item.oldNum = data[0].stockNum;
                        }else{
                            $scope.$broadcast('git_outStock_' + item.mixid + '_', 'clearHeadName', '请选择物品规格'); //重置标签名
                            item.oldNum = n.stockNum;
                        }
                    });
                }
            }

            function gitSpecClick(n, item) {
                item.goodsSpecId = n.goodsSpecId;
                item.goodsSpecName = n.name;
                if (n) {
                    item.oldNum = n.stockNum;
                }
            }

            function checkStudent() {
                window.$rootScope.yznOpenPopUp($scope, 'student-sel', 'selectStuds', '760px', { type: 'student', choseType: 'checkbox', sourcePage: '积分', callBackName: '兑换礼品-添加学员', });
            }
            $scope.$on("兑换礼品-添加学员", function(evt, data) {
                angular.forEach(data, function(val) {
                    var judge = true;
                    angular.forEach($scope.gitData.apt_students, function(val_) {
                        if (val.potentialCustomerId == val_.potentialCustomerId) {
                            judge = false;
                        }
                    })
                    if (judge) {
                        $scope.gitData.apt_students.push(val);
                    }
                })

            });

            function confirm_gitExchange() {
                var param = {
                        "potentialCustomers": getPotals(),
                        "pointsValue": $scope.gitData.pointsValue,
                        "stockRecordGoodsList": getRecordGoods(),
                        "outInTime": $scope.gitData.outInTime + ":00"
                    },
                    tip = { text: '', flag: false };
                if (getPotals().length <= 0 || getRecordGoods().length <= 0) {
                    return layer.msg("学员/选择物品不可为空");
                }
                param.stockRecordGoodsList.map(function(item) {
                    if (!item.goodsSpecId && !tip.flag) {
                        tip.text = '请选择规格！';
                        tip.flag = true;
                    }
                })
                if (tip.flag) return layer.msg(tip.text);

                $.hello({
                    url: CONFIG.URL + "/api/oa/stock/exchange",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(dialog);
                            pagerRender = false;
                            stockList(0);
                        }
                    }
                })
            }
        }

        function getPotals() {
            var arr = [];
            if ($scope.gitData.apt_students.length > 0) {
                angular.forEach($scope.gitData.apt_students, function(v) {
                    arr.push({ potentialCustomerId: v.potentialCustomerId });
                });
            }
            return arr;
        }

        function getRecordGoods() {
            var arr = [];
            if ($scope.gitData.stockRecordGoodsList.length > 0) {
                //              var list = $scope.gitData.stockRecordGoodsList;
                //              for(var i = 0,len=list.length;i<len;i++){
                //                  if(!list[i].goodsId){
                //                      return layer.msg("请选择入库物品");
                //                      break;
                //                  }
                //                  if(list[i].goodsId){
                //                      arr.push({goodsId:list[i].goodsId,num:list[i].num});
                //                  }
                //              }
                angular.forEach($scope.gitData.stockRecordGoodsList, function(v) {
                    if (v.goodsId) {
                        arr.push({ goodsId: v.goodsId, num: v.num, goodsSpecId: v.goodsSpecId });
                    }
                });
            }
            return arr;
        }

        function getGoods(fn) {
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/list",
                type: "get",
                data: { pageType: "0", goodsStatus: "1", goodsType: "1", goodsSpecStatus: 1 },
                success: function(data) {
                    if (data.status == '200') {
                        $scope.goodslist = data.context;
                        if (fn) fn();
                    }

                }
            })
        }

        function getSpec(id, fn) {
            $.hello({
                url: CONFIG.URL + "/api/oa/goods/goodsSpec/list",
                type: "get",
                data: { goodsId: id, needUnclaimedNum: "1" },
                success: function(data) {
                    if (data.status == '200') {
                        fn(data.context)
                    }

                }
            })
        }

        function confirm_storage() {
            var arr = $scope.storageType == 'in' ? $scope.inStorage : $scope.outStorage,
                tip = { text: '', flag: false };
            arr.map(function(item, index) {
                if (!item.goodsId && !tip.flag) {
                    tip.text = '第' + (index + 1) + '项未选物品！';
                    tip.flag = true;
                }
                if (!item.goodsSpecId && !tip.flag) {
                    tip.text = '第' + (index + 1) + '项未选规格！';
                    tip.flag = true;
                }
            })
            if (tip.flag) return layer.msg(tip.text);
            if (!$scope.shopTeacherId) {
                return layer.msg("请选择经办人");
            }
            var param = {
                updateStatus: $scope.storageType == 'in' ? "0" : "1",
                stockRecordType: $scope.storageType == 'in' ? "0" : "1",
                outInTime: $scope.startTime,
                stockRecordDesc: $scope.desc,
                shopTeacherId: $scope.shopTeacherId,
                stockRecordGoodsList: getGoodsArr()
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/stock/update",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        pagerRender = false;
                        stockList(0);
                        closePop();
                    }
                }
            })
        }

        function setSelectNum(x, ind) {
            if (!x) {
                $scope.outStorage[ind].goodsId = undefined;
                $scope.outStorage[ind].oldNum = "";
            } else {
                var data = JSON.parse(x);
                $scope.outStorage[ind].goodsId = data.goodsId;
                $scope.outStorage[ind].oldNum = data.stockNum;
            }
        }

        function getGoodsArr() {
            var arr = [];
            var list = $scope.storageType == 'in' ? $scope.inStorage : $scope.outStorage;
            angular.forEach(list, function(v) {
                var obj = {
                    goodsId: v.goodsId,
                    num: v.num,
                    goodsSpecId: v.goodsSpecId
                };
                if ($scope.storageType == 'in') {
                    obj["price"] = v.price;
                }
                arr.push(obj);
            });
            return arr;
        }

        function addItem(list) {
            if (list) {
                list.push({ goodsId: undefined, goodsSpecList: [], mixid: GenNonDuplicateID(5),goodsSpecId:undefined ,goodsSpecName:"", oldNum:undefined,old_unclaimedNum:undefined});
            }
        }

        function removeItem(list, ind, key) {
            if (list) {
                list.splice(ind, 1);
                list.map(function(item) {
                    if (item.goodsId) {
                        $scope.$broadcast(key + item.mixid, 'clearHeadName', item.goodsName);
                    }
                    if (item.goodsSpecId) {
                        $scope.$broadcast(key + item.mixid + '_', 'clearHeadName', item.goodsSpecName);
                    }
                })
            }
        }

        function checkGoods(x) {
            $scope.goods = angular.copy(x);
            $scope.$broadcast('clearSelect', 'clearHeadName', '请选择物品规格'); //重置标签名
            getSpec(x.goodsId, function(data) {
                $scope.goods.goodsSpecList = data;
                if(data && data.length>0){
                    $scope.$broadcast('clearSelect', 'clearHeadName', data[0].name); //重置标签名
                    $scope.goods.goodsSpecId = data[0].goodsSpecId;
                    $scope.goods.goodsSpecName =data[0].name;
                    $scope.goods.stockNum =  data[0].stockNum;
                    $scope.goods.unclaimedNum =  data[0].unclaimedNum;
                }
            });
            $scope.speClickforclear = function(n) {
                $scope.goods.goodsSpecId = n.goodsSpecId;
                $scope.goods.stockNum = n.stockNum;
                $scope.goods.unclaimedNum = n.unclaimedNum;
            }
            $scope.goods.recordMode = 1;
            openPopByDiv("清点物品", ".check_goods", "560px");
        }

        function confirm_checkGoods() {
            if (!$scope.goods.goodsSpecId) {
                return layer.msg("请选择物品规格");
            }
            var param = {
                updateStatus: "3",
                stockRecordType: "3",
                //recordMode:$scope.goods.recordMode,
                stockRecordGoodsList: [{
                    goodsId: $scope.goods.goodsId,
                    num: $scope.goods.newnum * 1,
                    goodsSpecId: $scope.goods.goodsSpecId
                }]
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/stock/update",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        stockList(start);
                        closePop();
                        if ($scope.isDetail) {
                            layer.close(detailPop);
                        }
                    }
                }
            })
        }
        var detailPop;

        function gotoGoodsDetail(x) {
            $scope.goodsDetail = angular.copy(x);
            getSpec(x.goodsId, function(data) {
                $scope.goodsDetail.goodsSpecList = data;
            });
            $scope.isDetail = true;
            detailPop = layer.open({
                type: 1,
                title: "物品详情",
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                resize: false,
                anim: 0,
                area: '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $(".goodsDetail"),
            });
        }
    }]
})