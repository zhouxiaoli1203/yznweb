define([ "laydate", "socketIo", "mySelect", "szpUtil", "qrcode"], function(laydate, socketIo) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', '$sce', function($scope, $rootScope, $http, $state, $stateParams, $timeout, $sce) {
        var map, mapCount = 0;
        var placeSearch;
        init();
        function init() {
//          $scope.positionPicker = null;   //地图拖拽对象
//          initMap();
            $scope.shopInfo = window.currentUserInfo.shop;  //门店信息
            $scope.judgeOfficialState = null;  //微官网申请状态（0：未申请，1：申请中，2：已开通）
            judgeOfficialShow();
            $scope.screen_showCourseList = []   //特色课程列表
            $scope.add_organInfo = add_organInfo;   //添加校区信息
            $scope.delete_organInfo = delete_organInfo;   //删除校区信息
            $scope.gotoSetShowCourse = gotoSetShowCourse;   //跳转到展示课程设置
            $scope.add_showCourse = add_showCourse; //添加展示课程
            $scope.delete_showCourse = delete_showCourse;   //删除展示课程
//          $scope.onSearch = onSearch; ////地图搜索
            $scope.submit_official = submit_official;   //提交信息
            $scope.confirm_apply = confirm_apply;   //提交申请信息
            $scope.btn_apply = btn_apply;   //点击申请按钮
            $scope.provinceList = {};   //省市列表
            $scope.cityList = [];   //市列表
            $scope.sel_province = sel_province; //选择省
            $scope.officialData = {};
            $scope.switchConfigStatus = switchConfigStatus;//切换试听开关
            $scope.moveUpDown = moveUpDown; //上下移动
            $scope.applyOffData = { //提交申请数据
                name: '',
                phone: '',
            }
            $scope.closePopup = function() {
                layer.close(dialog);
            }
            //添加图片按钮显示隐藏
            $scope.imgover = function(evt, type) {
                switch(type) {
                    case 'change':
                        $(evt.target).closest('.shop_img').find('.shop_img_msk').show();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').show();
                }
            }
            $scope.imgout = function(evt, type) {
                switch(type) {
                    case 'change':
                        $(evt.target).closest('.shop_img').find('.shop_img_msk').hide();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').hide();
                }
            }
            
            //省市列表
            $.getJSON("static/data/zcity.json?v=20200716", function(data) {
                $scope.provinceList = data.provincesList;
            })
        }
        
        //提交申请
        function confirm_apply() {
            var params = {
                visitorName:  $scope.applyOffData.name,
                visitorPhone:  $scope.applyOffData.phone
            };
            
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/applyMicrosite",
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if(res.status == 200) {
                        console.log(res);
                        $scope.judgeOfficialState = 1;
                        layer.msg('提交成功！');
                        layer.close(dialog);
                    };
                }
            });
        }
        
        //点击申请
        function btn_apply(type) {
            switch(type) {
                case 1: //提交申请
//                  openPopByDiv('提交申请', '#submit_apply', '560px');
                    $.hello({
                        url: CONFIG.URL + '/api/miniWebPay/miniPreOrder',
                        type: "get",
                        data: {},
                        success: function(data) {
                            if(data.status == 200) {
                                console.log(data)
                                $('.onlinePay_code').html('');
                                $scope.onlindePayData = {};
                                $scope.onlindePayData['orderId'] = data.context.miniBillId;
                                $scope.onlindePayData['money'] = data.context.paymentMoney;
                                jQuery('.onlinePay_code').qrcode({  //渲染二维码
                                    render: "canvas", //也可以替换为table
                                    width: 240,
                                    height: 240,
                                    text: data.context.qrCodeUrl,
                                });
                                
                                //支付完成自动关闭弹窗
                                webSocketInit(data.context.miniBillId, function(event) {
                                    var res = JSON.parse(event);
                                    layer.close(dialog);
                                    judgeOfficialShow();
                                }, socketIo, 'refreshMiniWebQRCode');
                        
                                //刷新订单支付状态
                                $scope.reloadOnlinePay = function() {
                                    $.hello({
                                        url: CONFIG.URL + '/api/miniWebPay/getMiniPayStatus',
                                        type: "get",
                                        data: {'orderId': data.context.miniBillId},
                                        success: function(res) {
                                            if(res.status == 200) {
                                                if(res.context.payStatus == 1) {
                                                    layer.close(dialog);
                                                    judgeOfficialShow();
                                                } else if(res.context.payStatus == 0) {
                                                    layer.msg('订单待支付');
                                                } else if(res.context.payStatus == 2) {
                                                    layer.msg('订单已过期');
                                                }
                                            }
                                        }
                                    });
                                };
                                //弹出扫码窗口
                                openPopByDiv('扫码支付', '#onlinePay_miniweb', '400px', false);
                            };
                        },
                    });
                    break;
                case 2: //查看介绍
                    window.open('https://mp.weixin.qq.com/s?__biz=MzIxNzgwNjAwNA==&mid=2247485358&idx=1&sn=625d17ceb2dc4b0e2c25c4fcf6968517&chksm=97f56275a082eb6322e94a852efd91c7ed4d6eddaef1e9d720302bf8c5da6647d58da4f59dcf&token=1426316970&lang=zh_CN#rd');
                    break;
                case 3: //查看微官网二维码
                    //弹出二维码
                    // $('#miniWebsiteUrl span').html('');
                    $('#miniWebsiteUrl').html('<span></span><img alt="校区二维码" />');
                    var miniCode = jQuery('#miniWebsiteUrl span').qrcode({  //渲染二维码
                        render: "canvas", //也可以替换为table
                        width: 500,
                        height: 500,
                        text: $scope.officialData.miniWebsiteUrl,
                    }).hide();
                    $('#miniWebsiteUrl img').attr('src', miniCode.find('canvas').get(0).toDataURL('image/jpg'));
                    
                    openPopByDiv('微官网二维码', '#miniAppsQrCode', '560px');
                    break;
            }
        }
        
        //判断官网是否开通了
        function judgeOfficialShow() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/getMicrositeStatus",
                type: "get",
                data: {},
                success: function(res) {
                    if(res.status == 200) {
                        console.log(res);
                        $scope.judgeOfficialState = res.context;
                        if($scope.judgeOfficialState == 2) {
                            getOfficialData();
                        }
                    };
                }
            });
        }
        
        //模块上下移动
        function moveUpDown(d, index, type, evt) {
            var d_;
            if($(evt.target).attr('btnType') == 'y') {
                if(type == 1) {
                    d_ = d[index];
                    d[index] = d[index - 1];
                    d[index - 1] = d_;
                } else {
                    d_ = d[index];
                    d[index] = d[index + 1];
                    d[index + 1] = d_;
                }
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
                        console.log(res);
                        $scope.officialData = { //官网设置数据
                            homeImg: res.shopBigImgUrl,
                            miniAppsQrCode: res.miniAppsQrCode?res.miniAppsQrCode:'',
                            miniWebsiteUrl: res.miniWebsiteUrl,
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
                            },
                            configStatus:(res.config & 0x0040) > 0?true:false
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
//                      //监听地图资源加载情况，如果有拖拽对象则重新定位地图位置
//                      $scope.$watch('positionPicker', function() {
//                          if($scope.positionPicker && $scope.officialData.address.lng && $scope.officialData.address.lat) {
//                              $scope.positionPicker.start([$scope.officialData.address.lng, $scope.officialData.address.lat]);
//                          }
//                      })
                        //预约信息勾选状态
                        if(res.reservationInfo) {
                            angular.forEach(res.reservationInfo.split(','), function(val) {
                                $scope.officialData['appointment'][val] = true;
                            });
                        }
                        getShowCourseList(res.experienceCourseStr?res.experienceCourseStr: '');
                    };
                }
            });
        }
        
        //提交信息
        function submit_official(special) {
            console.log($scope.officialData);
            if(!$scope.officialData.homeImg) {
                layer.msg('请上传首页图片');
                return;
            }
            if($scope.officialData.organList.length <= 0) {
                layer.msg('请填写校区介绍');
                return;
            }
            if($scope.officialData.teacherList.length <= 0) {
                layer.msg('请填写师资介绍');
                return;
            }

            var courseList = [];
            var reservationInfo = [];
            var organList = [];
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
            var imageKey = getKeyFromUrl($scope.officialData.homeImg)
            var params = {
//              "shopName": $scope.officialData.organName,
                "shopBigImg": imageKey?imageKey:'',
                // "shopBigImgUrl": $scope.officialData.homeImg,
//              "shopPhone": $scope.officialData.phone.join(','),
//              "city": $scope.officialData.address.city,
//              "province": $scope.officialData.address.province,
//              "shopAddress": $scope.officialData.address.detaild,
//              "longitude": $scope.officialData.address.lng, // 经度
//              "latitude": $scope.officialData.address.lat, // 纬度0
//              "businessHours": $scope.officialData.busTime,
                "shopIntro": organList.length > 0? JSON.stringify(organList): '',
                "teacherIntro": $scope.officialData.teacherList.length > 0? JSON.stringify($scope.officialData.teacherList): '',
                "experienceCourseStr": courseList.join(',')?courseList.join(','):'',// 展示课程
                "reservationInfo": reservationInfo.join(',')?reservationInfo.join(','):'',// 预约信息
                "configName":"CONFIG_MINI_WEB_BOOKING",
                "configStatus":$scope.officialData.configStatus?1:0
            }
//          console.log(params);
            
            $.hello({
                url: CONFIG.URL + "/api/oa/shop/update",
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if(res.status == 200) {
                        console.log(res);
                        if(special == 'go') {
                            $state.go('showcourse');
                            return;
                        };
                        layer.msg('保存成功', {
                            icon: 1
                        });
//                      $('#miniWebsiteUrl').html('');
//                      jQuery('#miniWebsiteUrl').qrcode({  //渲染二维码
//                          render: "canvas", //也可以替换为table
//                          width: 131,
//                          height: 131,
//                          text: $scope.officialData.miniWebsiteUrl,
//                      });
//                      //弹出二维码
//                      openPopByDiv('微官网二维码', '#miniAppsQrCode', '560px');
                    };
                }
            });
        }
        
        //添加校区信息
        function add_organInfo(type, d) {
//          if(type == 'organText' || type == 'organImg') {
//              if($scope.officialData.organList.length > 11) {
//                  layer.msg('添加到达上限');
//                  return;
//              }
//          }
//          if(type == 'teacher') {
//              if($scope.officialData.teacherList.length > 9) {
//                  layer.msg('添加到达上限');
//                  return;
//              }
//          }
            switch (type) {
                case 'homeImg':     //添加首页图片
                    $timeout(function() {
                        szpUtil.util_addImg(true, function(data) {
                            $scope.officialData.homeImg = data;
                            $scope.$apply();
                        }, {options: {aspectRatio: 16/9}, type: 'image/gif, image/jpeg, image/png', dataSource:'shopInfo'});
                    });
                    break;
                case 'organImg':    //添加校区图片
                    $timeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            if(d) {
                                d.imageUrl = data;
                            } else {
                                $scope.officialData.organList.push({imageUrl: data});
                            }
                            $scope.$apply();
                        }, {type: 'image/gif, image/jpeg, image/png', dataSource:'shopInfo'});
                    });
                    break;
                case 'organText':   //添加校区文字
                    $scope.officialData.organList.push({content: ''});
                    break;
                case 'organVideo':  //添加校区视频
                    $timeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                            console.log(data);
                            if(d) {
                                d.videoUrl = data;
                                d.videoUrl_ = $sce.trustAsResourceUrl(data + '?' + new Date().getTime());
                            } else {
                                $scope.officialData.organList.push({videoUrl: data, videoUrl_: $sce.trustAsResourceUrl(data + '?' + new Date().getTime())});
                            }
                            $scope.$apply();
                        }, {type: 'video/*'});
                    });
                    break;
                case 'teacher':     //添加老师
                    $scope.officialData.teacherList.push({imageUrl: '', name: '', content: ''});
                    break;
                case 'teacherImg':  //添加老师图片
                    $timeout(function() {
                        szpUtil.util_addImg(true, function(data) {
                            d.imageUrl = data;
                            $scope.$apply();
                        }, {type: 'image/gif, image/jpeg, image/png', dataSource:'shopInfo'});
                    });
                    break;
            }
        }
        
        //删除结构信息
        function delete_organInfo(type, ind) {
            console.log(ind)
            var isdelete = layer.confirm('确认删除?', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                switch (type) {
                    case 'organImg':    //删除校区图片
                        $scope.officialData.organList.splice(ind, 1);
                        break;
                    case 'organText':   //删除校区文字描述
                        $scope.officialData.organList.splice(ind, 1);
                        break;
                    case 'organVideo':  //删除校区视频
                        $scope.officialData.organList.splice(ind, 1);
                        break;
                    case 'teacher':     //删除老师
                        $scope.officialData.teacherList.splice(ind, 1);
                        break;
                }
                $scope.$apply();
                layer.close(isdelete);
            }, function() {
                layer.close(isdelete);
            });
        }
        
        //跳转到展示课程设置
        function gotoSetShowCourse() {
            var isgo = layer.confirm('是否先保存后再前往设置特色课程?', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                submit_official('go');
                layer.close(isgo);
            }, function() {
                $state.go('showcourse');
                layer.close(isgo);
            });
        }
        //添加展示课程
        function add_showCourse(data) {
            var judHas = true;
            var judHasIndex = null;
            angular.forEach($scope.officialData.courseList, function(val, index) {
                if(!val.experienceCourseId) {
                    delete $scope.officialData.courseList[index];   //如果是默认数据则删除数据
                } else {
                    if(val.experienceCourseId == data.experienceCourseId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                }
            });
            $scope.officialData.courseList = detEmptyField_($scope.officialData.courseList);    //去除空的字段
            
            if(judHas) {
                $scope.officialData.courseList.push(data);
                data.hasSelected = true;
            } else {
                $scope.officialData.courseList.splice(judHasIndex, 1);
                data.hasSelected = false;
            }
        }
        
        //删除展示课程选择
        function delete_showCourse(data, ind) {
            data.hasSelected = false;
            $scope.officialData.courseList.splice(ind, 1);
        }
        
        //获取展示特色课程
        function getShowCourseList(str) {
            $.hello({
                url: CONFIG.URL + "/api/oa/course/listExperienceCourse",
                type: "get",
                data: {},
                success: function(res) {
                    if(res.status == 200) {
//                      console.log(res)
                        if(str) {
                            var arr = str.split(',');
                            angular.forEach(res.context, function(val) {
                                angular.forEach(arr, function(val_) {
                                    if(val.experienceCourseId == val_) {
                                        val.hasSelected = true;
                                        $scope.officialData.courseList.push(val);
                                    }
                                })
                            })
                        }
                        $scope.screen_showCourseList = res.context;
                    };
                }
            });
        }
        //切换试听开关
        function switchConfigStatus(){
            $scope.officialData.configStatus = !$scope.officialData.configStatus;
        }
        $scope.tipShow = function(evt) {
            evt.stopPropagation();
            $(evt.target).find('.tippaopao1').show();
        };
        $scope.tipHide = function(evt) {
            evt.stopPropagation();
            $(evt.target).find('.tippaopao1').hide();
        }
//      //搜索地图信息
//      function onSearch(e) {
//          if (placeSearch == undefined) {
//              layer.msg('地图加载失败,请刷新页面后再试');
//              return;
//          }
//
//          var searchValue = $scope.officialData.address.province + $scope.officialData.address.city + ($scope.officialData.address.detaild?$scope.officialData.address.detaild:'');
//          placeSearch.search(searchValue, function(status, result) {
//              if(result.poiList) {
//                  $scope.positionPicker.start(result.poiList.pois[0].location);
//              } else {
//                  layer.msg('未能在地图上搜索到输入的地址，请确认地址是否正确或直接拖动定位图标到地图上的实际位置~')
//              }
//          });
//      }
//      
//      //地图拖拽选址功能
//      function initMap() {
//          if(!AMap.UA) {
//              reloadAmap();
//              return;
//          };
//          console.log(AMap)
//          AMapUI.loadUI(['misc/PositionPicker'], function(PositionPicker) {
//              map = new AMap.Map('map', {
//                  zoom: 21,
//                  scrollWheel: true
//              })
//              $scope.positionPicker = new PositionPicker({
//                  mode: 'dragMarker',
//                  map: map
//              });
//              
//              AMap.service('AMap.PlaceSearch',function(){
//                  placeSearch = new AMap.PlaceSearch({
//                      pageSize: 1,
//                      pageIndex: 1,
//                      city: "010",//城市
//                  });
//              })
//              $scope.positionPicker.on('success', function(positionResult) {
//                  if($scope.officialData.address) {
//                      $scope.officialData.address.lat = positionResult.position.getLat();
//                      $scope.officialData.address.lng = positionResult.position.getLng();
//                  }
//              });
//              
//              $scope.positionPicker.on('fail', function(positionResult) {
//                  console.log(positionResult);
//              });
//              $scope.$apply();
//          });
//      }
//      
//      //加载地图失败调用的方法
//      function reloadAmap() {
//          console.log('sssss'+ mapCount)
//          mapCount++;
//          if(mapCount > 3) {
//              layer.msg('地图资源加载失败，请刷新页面重试~')
//          } else{
//              $.getScript("https://webapi.amap.com/maps?v=1.3&key=816afd8e181bc83c46f9a4c91b4a0c1e").done(function (script, textstatus) {  
//                  if (textstatus == "success" && AMap.UA) {
//                      console.log('aaaaa')
//                      $.getScript('https://webapi.amap.com/ui/1.0/main.js?v=1.0.11').done(function() {
//                          initMap();
//                      });
//                  } else {
//                      reloadAmap();
//                  }  
//              });
//          }
//      }
    }]
})