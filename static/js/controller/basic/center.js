define(["amap"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$interval', '$sce', function($scope, $rootScope, $http, $state, $stateParams, $interval, $sce) {
        var map, mapCount = 0;
        var placeSearch;
        init();

        function init() {
            $scope.positionPicker = null;   //地图拖拽对象
            $scope.officialData = {};

            //轮训查看地图是否已经加装完成
            var count = 0;
            var timer = $interval(function(){
                if (AMap.UA) {
                    window.require(["amapUI"],function() {
                        initMap();
                    });
                    $interval.cancel(timer);
                }
                count++;
                if (count > 50) {
                    $interval.cancel(timer);
                }
            },100);



            $scope.onSearch = onSearch; ////地图搜索
            $scope.submit_official = submit_official;   //提交信息
            $scope.provinceList = {};   //省市列表
            $scope.cityList = [];   //市列表
            $scope.sel_province = sel_province; //选择省
            $scope.switchVisitNav = switchVisitNav;
            $scope.visitNavJud = 1;

            //省市列表
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provinceList = data.provincesList;
                getOfficialData();
            })
        }
        
        function switchVisitNav(n){
            switch (n){
                case 1:$state.go("center",{});
                    break;
                case 2:
                localStorage.setItem("$statetime", 2);
                $state.go("time",{pageType:2});
                    break;
                case 3:
                localStorage.setItem("$statetime", 3);
                $state.go("time",{pageType:3});
                    break;
                case 4:$state.go("classroom",{});
                    break;
                case 5:$state.go("functionMange",{});
                    break;
                case 6:$state.go("notice",{});
                    break;
                case 7:$state.go("nearbySchool",{});
                    break;
                case 8:$state.go("share",{});
                    break;
                default:
                    break;
            }
        }
        
        //选择省
        function sel_province(x) {
            angular.forEach($scope.provinceList['0'], function(v, ind){
                if(x == v){
                    $scope.cityList = $scope.provinceList['0_'+ind];
                }
            });
        }
        //获取微官网设置详情
        function getOfficialData() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/detail",
                type: "get",
                data: {},
                success: function(res) {
                    if(res.status == 200) {
                        var res = res.context;
                        $scope.officialData = { //官网设置数据
                            homeImg: res.shopBigImgUrl,
                            organName: res.shopName?res.shopName:'',
                            address: {
                                province: res.province?res.province:'',
                                city: res.city?res.city:'',
                                detaild: res.shopAddress?res.shopAddress:'',
                                lng: res.longitude?res.longitude:'',
                                lat: res.latitude?res.latitude:''
                            },
                            busTime: res.businessHours?res.businessHours:'',
                            phone: res.shopPhone?res.shopPhone.split(','):['',''],
                            organList: res.shopIntros?res.shopIntros:[],
                            teacherList: res.teacherIntros?res.teacherIntros:[],
                            courseList: [],
                            appointment: {
                                adress: false,
                                nickname: false,
                                sex: false,
                                parentName: false
                            }
                        };
                        if($scope.officialData.phone.length <= 1) {
                            $scope.officialData.phone.push('');
                        }
                        //为视频添加可信赖的地址
                        angular.forEach($scope.officialData.organList, function(val) {
                            if(val.videoUrl) {
                                val.videoUrl_ = $sce.trustAsResourceUrl(val.videoUrl + '?' + new Date().getTime());
                            }
                        });
                        //根据省获取市的列表
                        if($scope.officialData.address.province) {
                            angular.forEach($scope.provinceList['0'], function(v, ind){
                                if($scope.officialData.address.province == v){
                                    $scope.cityList = $scope.provinceList['0_'+ind];
                                }
                            });
                        }
                        //监听地图资源加载情况，如果有拖拽对象则重新定位地图位置
                        $scope.$watch('positionPicker', function() {
                            /*
                             * 备注：2019-04-11
                             * 捕获地图参数错误重新加载地图
                             */
                            try{
                                if($scope.positionPicker && $scope.officialData.address.lng && $scope.officialData.address.lat) {
                                    $scope.positionPicker.start([$scope.officialData.address.lng, $scope.officialData.address.lat]);
                                }
                            } catch(e) {
                                console.log(e);
                                reloadAmap(true);
                            }
                        })
                        //预约信息勾选状态
                        if(res.reservationInfo) {
                            angular.forEach(res.reservationInfo.split(','), function(val) {
                                $scope.officialData['appointment'][val] = true;
                            });
                        }
                    };
                }
            });
        }
        
        //提交信息
        function submit_official(special) {
            if(!$scope.officialData.phone[0] && !$scope.officialData.phone[1]) {
                layer.msg('请填写校区电话');
                return;
            }
            if ($scope.officialData.address.lng.length == 0 || $scope.officialData.address.lat.length == 0) {
                layer.msg('未能在地图上找到相应的地址，请重新填写地址或者直接在图上选位置');
                return;
            }

            var courseList = [];
            var reservationInfo = [];
            var organList = [];
            var phoneStr = [];
            angular.forEach($scope.officialData.organList, function(val) {
                if(val.videoUrl) {
                    organList.push({videoUrl: val.videoUrl});
                } else if(val.imageUrl) {
                    organList.push({imageUrl: val.imageUrl});
                } else if(val.content) {
                    organList.push({content: val.content});
                }
            });
            angular.forEach($scope.officialData.courseList, function(val) {
                if(val.experienceCourseId) {
                    courseList.push(val.experienceCourseId);
                }
            });
            for(var i in $scope.officialData.appointment) {  //处理预约信息
                if($scope.officialData.appointment[i]) {
                    reservationInfo.push(i);
                }
            };
            
            //处理电话出现逗号的问题
            angular.forEach($scope.officialData.phone, function(v1) {
                if(v1) {
                    phoneStr.push(v1);
                }
            })
            var params = {
                "shopName": $scope.officialData.organName,
                "shopPhone": phoneStr.join(','),
                "city": $scope.officialData.address.city,
                "province": $scope.officialData.address.province,
                "shopAddress": $scope.officialData.address.detaild,
                "longitude": $scope.officialData.address.lng, // 经度
                "latitude": $scope.officialData.address.lat, // 纬度0
                "businessHours": $scope.officialData.busTime,
//              "shopIntro": organList.length > 0? JSON.stringify(organList): '',
//              "teacherIntro": $scope.officialData.teacherList.length > 0? JSON.stringify($scope.officialData.teacherList): '',
//              "experienceCourseStr": courseList.join(',')?courseList.join(','):'',// 展示课程
//              "reservationInfo": reservationInfo.join(',')?reservationInfo.join(','):''// 预约信息
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/update",
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if(res.status == 200) {
                        layer.msg('成功保存！')
                    };
                }
            });
        }
        
        //搜索地图信息
        function onSearch(e) {
            if (placeSearch == undefined) {
                reloadAmap(true);
                layer.msg('地图加载中~，请稍后再试');
                return;
            }

            var searchValue = $scope.officialData.address.province + $scope.officialData.address.city + ($scope.officialData.address.detaild?$scope.officialData.address.detaild:'');
            
            try{
                placeSearch.search(searchValue, function(status, result) {
                    if(result.poiList) {
                        $scope.positionPicker.start(result.poiList.pois[0].location);
                    } else {
                        layer.msg('未能在地图上搜索到输入的地址，请确认地址是否正确或直接拖动定位图标到地图上的实际位置~')
                    }
                });
            } catch(e) {
                console.log(e);
                reloadAmap(true);
            }
        }
        
        //地图拖拽选址功能
        function initMap() {

            console.log(AMap);
            /*
             * 备注：2019-04-11
             * 由于地图加载失败地图缺少参数报错所以加一个捕获错误
             * 重新加载地图插件
             */
            try {
                AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
                    map = new AMap.Map('map', {
                        zoom: 21,
                        scrollWheel: true
                    })
                    $scope.positionPicker = new PositionPicker({
                        mode: 'dragMarker',
                        map: map
                    });
                    
                    AMap.service('AMap.PlaceSearch',function(){
                        placeSearch = new AMap.PlaceSearch({
                            pageSize: 1,
                            pageIndex: 1,
                            city: "010",//城市
                        });
                    })
                    $scope.positionPicker.on('success', function(positionResult) {
                        if($scope.officialData.address) {
                            $scope.officialData.address.lat = positionResult.position.getLat();
                            $scope.officialData.address.lng = positionResult.position.getLng();
                        }
                    });
                    
                    $scope.positionPicker.on('fail', function(positionResult) {
                        console.log('ssss')
                    });
                    $scope.$apply();
                });
            } catch(e) {
                console.log(e);
                reloadAmap(true);
            }
        }
        

        
        //加载地图失败调用的方法
        function reloadAmap(jud) {
            mapCount = jud?0:mapCount;
            mapCount++;
            console.log('失败调用+'+ mapCount);
            if(mapCount > 3) {
                layer.msg('地图资源加载失败，请刷新页面重试~')
            } else{
                window.require(["amap"],function() {
                    window.require(["amapUI"],function() {
                        initMap();
                    });
                });
            }
        }
    }]
})