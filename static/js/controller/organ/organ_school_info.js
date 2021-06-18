define(["qiniu", "pagination", "mySelect"], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var province, city, searchName = undefined; //筛选条件：状态、搜索框

        init();
        //以上是初始化全局变量定义
        function init() {
            console.log('测试1');
            $scope.editSchool = checkAuthMenuById("71");
            initCity(); //获取省份
            $scope.cityList = []; //城市为空
            $scope.searchByProv = searchByProv; //按省搜索
            $scope.searchByCity = searchByCity; //按市搜索
            $scope.SearchData = SearchData; //按钮搜索
            $scope.bindKeyEnter = bindKeyEnter; //搜索框绑定enter键
            $scope.changesType = changesType;

            $scope.selectInfoNameId = 'searchName'; //select初始值
            $scope.kindSearchData = {
                searchName: '校区名称、负责人、联系方式',
                // shopName: '校区名称、负责人、联系方式',
                // teacherName: '负责人',
                // teacherPhone: '联系方式'
            }; //搜索类型
            //表头
            $scope.nameListThead = [{
                'name': '校区名称',
                'width': '27.5%',
            }, {
                'name': '校区简称',
                'width': '15%',
            }, {
                'name': '校区地址',
                'width': '27.5%',
            }, {
                'name': '门店类型',
                'width': '15%',
            }, {
                'name': '负责人',
                'width': '15%',
            }, {
                'name': '联系方式',
                'width': '150',
            }, {
                'name': '操作',
                'width': '120',
                'align': 'center'
            }];

            //筛选栏数据
            $scope.screen_status = getConstantList(CONSTANT.MSG_STATUS, [2, 0, 1]); //筛选-状态
            $scope.gotoEdit = gotoEdit; //编辑弹框
            $scope.edit_confirm = edit_confirm; //编辑确认按钮
            $scope.closePop = closePop; //关闭
            $scope.gotoPartyShop = gotoShop;
            $scope.changeProvince = changeProvince; //切换省份
            //重置筛选栏
            $scope.onReset = onReset;
            getSchoolList(0); //获取校区列表
            console.log('测试2');
        }

        function changesType(e, v) {
            $scope.shopType = e.target.checked ? v : null;
            pagerRender = false; //分页重新加载
            getSchoolList(0);
        }

        function initCity() {
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provincesList = data.provincesList;
            })
        }
        /*学校信息主页面搜索 start*/
        function onReset() {
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.cityList = [];
            province = city = searchName = undefined;
            $scope.shopType = undefined;
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false; //分页重新加载
            getSchoolList(0);
        }

        function searchByProv(data, ind) {
            screen_setDefaultField($scope, function() {
                $scope.screen_goReset['市']('');
                // $scope.screen_goReset['所属校区']('');
            });
            city = undefined;
            if (!data) {
                province = undefined;
                $scope.cityList = [];
            } else {
                province = data;
                $scope.cityList = $scope.provincesList['0_' + ind];
            }
            pagerRender = false;
            getSchoolList(0);
        }

        function searchByCity(data) {
            // screen_setDefaultField($scope, function() {
            //     $scope.screen_goReset['所属校区']('');
            // });
            if (!data) {
                city = undefined;
            } else {
                city = data;
            }
            pagerRender = false;
            getSchoolList(0);
        }
        //按键搜索
        function bindKeyEnter(data) {
            searchName = data.value;
            pagerRender = false;
            getSchoolList(0);
        }
        //按钮搜索
        function SearchData(data) {
            searchName = data.value;
            pagerRender = false;
            getSchoolList(0);
        }
        $scope.$on("schoollistChange", function(evt, startPage) {
            if (startPage) {
                getSchoolList(start)
            } else {
                pagerRender = false;
                getSchoolList(0);
            }
        });

        function getSchoolList(start_) { //获取消息列表
            start = start_ == 0 ? "0" : start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                "province": province,
                "city": city,
                "searchName": searchName,
                'searchType': 'appSearchName',
                "pageType": 1,
                "shopType": $scope.shopType ? $scope.shopType : undefined
            }

            $.hello({
                url: CONFIG.URL + "/api/org/shop/list",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.schoolList = data.context.items;
                        schoolPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }

                }
            })
        }

        function schoolPager(total) { //分页
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
                    getSchoolList(start); //回掉
                }
            });

        }

        function gotoEdit(x) {
            $scope.schoolInfo = angular.copy(x);
            angular.forEach($scope.provincesList['0'], function(v, ind) {
                if (x.province == v) {
                    $scope.pro_cityList = $scope.provincesList['0_' + ind];
                }
            });
            openPopByDiv("编辑校区", ".edit_pop");
        }

        function changeProvince(name) {
            $scope.pro_cityList = [];
            $scope.schoolInfo.city = '';
            angular.forEach($scope.provincesList['0'], function(v, ind) {
                if (name == v) {
                    $scope.pro_cityList = $scope.provincesList['0_' + ind];
                }
            });
        }

        function edit_confirm() {
            var data = {
                "shopName": $scope.schoolInfo.shopName,
                "shopId": $scope.schoolInfo.shopId,
                "city": $scope.schoolInfo.city,
                'shopShortName': $scope.schoolInfo.shopShortName ? $scope.schoolInfo.shopShortName : undefined,
                "province": $scope.schoolInfo.province,
                "shopAddress": $scope.schoolInfo.shopAddress,
                "shopTeacher": { // 负责人对象
                    "shopTeacherId": $scope.schoolInfo.shopTeacher.shopTeacherId,
                    "teacherName": $scope.schoolInfo.shopTeacher.teacherName,
                    "teacherPhone": $scope.schoolInfo.shopTeacher.teacherPhone
                }
            }

            $.hello({
                url: CONFIG.URL + "/api/org/shop/edit",
                type: "post",
                data: JSON.stringify(data),
                success: function(data) {
                    if (data.status == '200') {
                        $scope.$emit("schoollistChange", true);
                        closePop();
                    }

                }
            })
        }

        function closePop() {
            layer.close(dialog);
        }
        /*校区主页面搜索 end*/
    }]
})