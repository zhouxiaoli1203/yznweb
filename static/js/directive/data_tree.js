(function() {
    angular.module("myApp", [])
        .directive('datasTree', function() {
            return {
                restrict: "AE",
                scope: {
                    userData: "=",
                    userType: "@userType",
                    userAll:"@userAll",
                    onClick: "&userClick",
                    myId: "@usertId",
                },
                replace: true,
                templateUrl: "./templates/popup/data_tree.html",
                controller: ["$scope", function($scope) {
                                        console.log($scope.userAll);
                    //                      $scope.userType = $scope.userType;
                    $scope.$watch('userData', function() {
                        $scope.datas = $scope.userData;
                        switch ($scope.userType) {
                            case 'auth':
                                $scope.Fns = {
                                    shouqi: function($event, index, data) {
                                        $event.stopPropagation();
                                        data[index].isopen = !data[index].isopen;
                                    },
                                    // 全选
                                    allChecked: function($event, x, z) {
                                        $event.stopPropagation();
                                        // 一级全选
                                        if (!z) {
                                            if (x.checkStatus == 1) {
                                                x.checkStatus = 0
                                            } else if (x.checkStatus == 0) {
                                                x.checkStatus = 1
                                            } else {
                                                x.checkStatus = 1
                                            }
                                            x.isopen = false;
                                            angular.forEach(x.menuList, function(data) {
                                                data.checkStatus = x.checkStatus;
                                                data.isopen = false;
                                                angular.forEach(data.menuList, function(value) {
                                                    value.checkStatus = x.checkStatus;
                                                })
                                            });

                                        } else {
                                            // 二级全选
                                            if (x.checkStatus == 1) {
                                                x.checkStatus = 0
                                            } else if (x.checkStatus == 0) {
                                                x.checkStatus = 1
                                            } else {
                                                x.checkStatus = 1
                                            }
                                            x.isopen = false;
                                            angular.forEach(x.menuList, function(data, index) {
                                                data.isopen = false;
                                                data.checkStatus = x.checkStatus;
                                            });
                                            // 二级菜单
                                            var flag = false,
                                                allCount = 0,//非选中的数量，包括-和未选中
                                                notAcount_2=0;//二级存在-号的存在
                                            angular.forEach(z.menuList, function(data, index) {
                                                if (data.checkStatus !== 1) { //未选中
                                                    allCount++;
                                                    if(data.checkStatus == 2){
                                                        notAcount_2++;
                                                    }
                                                } else {
                                                    flag = true; //选中
                                                }
                                            })
                                            if (flag && allCount == 0) { //全部选中
                                                z.checkStatus = 1;
                                                return
                                            }
                                            if (allCount == z.menuList.length) {
                                                if(notAcount_2 !==0){
                                                    z.checkStatus = 2; 
                                                }else{
                                                    z.checkStatus = 0; //全不选
                                                }
                                            } else {
                                                z.checkStatus = 2; //部分选择
                                            }
                                        }
                                    },
                                    // 单选
                                    Checked: function($event, y, x, z) {
                                        $event.stopPropagation();
                                        // y.checkStatus = !y.checkStatus;
                                        if (y.checkStatus == 1) {
                                            y.checkStatus = 0;
                                        } else {
                                            y.checkStatus = 1;
                                        }

                                        var flag = false,
                                            count = 0;
                                        // 遍历3层数据
                                        angular.forEach(x.menuList, function(data) {
                                            if (data.checkStatus == 0) { //未选中
                                                count++
                                            } else {
                                                flag = true;
                                            }
                                        });
                                        if (flag && count == 0) { //2层全部选中
                                            x.checkStatus = 1;

                                        } else if (count == x.menuList.length) {
                                            x.checkStatus = 0; //2层未全选
                                        } else {
                                            x.checkStatus = 2; //2层部分选择
                                        }

                                        var flag1 = false,
                                            count1 = 0,
                                            count2 = 0;
                                        angular.forEach(z.menuList, function(data, index) {
                                            if (data.checkStatus == 2) { //部分选中
                                                count1++
                                            } else if (data.checkStatus == 0) { //未选中
                                                count2++
                                            } else {
                                                flag1 = true; //选中
                                            }
                                        });

                                        if (flag1 && count1 == 0 && count2 == 0) { //全部选中
                                            z.checkStatus = 1;

                                        } else if (count2 == z.menuList.length) {
                                            z.checkStatus = 0; //全不选
                                        } else {
                                            z.checkStatus = 2; //部分选择
                                        }

                                    },

                                }
                                break;
                            case 'shop':
                                $scope.Fns = {
                                    shouqi: function($event, index, data) {
                                        if($scope.userAll == 1){
                                            return;
                                        }
                                        $event.stopPropagation();
                                        data[index].isopen = !data[index].isopen;
                                    },
                                    // 全选
                                    allChecked: function($event, x, z) {
                                        if($scope.userAll == 1){
                                            return;
                                        }
                                        $event.stopPropagation();
                                        // 一级全选
                                        if (!z) {
//                                          if(x.shopName == '全部校区'){
//                                              angular.forEach($scope.datas,function(v){
//                                                  if(v.checkStatus == 1){
//                                                      v.checkStatus = 0;
//                                                  }else{
//                                                      v.checkStatus = 1;
//                                                  }
//                                                  v.isopen = false;
//                                                  angular.forEach(v.shopList, function(data) {
//                                                      data.checkStatus = v.checkStatus;
//                                                      data.isopen = false;
//                                                      angular.forEach(data.shopList, function(value) {
//                                                          value.checkStatus = v.checkStatus;
//                                                      })
//                                                  });
//                                              });
//                                          }else{
                                                if (x.checkStatus == 1) {
                                                    x.checkStatus = 0;
                                                } else if (x.checkStatus == 0) {
                                                    x.checkStatus = 1;
                                                } else {
                                                    x.checkStatus = 1;
                                                }
                                                x.isopen = false;
                                                angular.forEach(x.shopList, function(data) {
                                                    data.checkStatus = x.checkStatus;
                                                    data.isopen = false;
                                                    angular.forEach(data.shopList, function(value) {
                                                        value.checkStatus = x.checkStatus;
                                                    })
                                                });
//                                          }

                                        } else {
                                            // 二级全选
                                            if (x.checkStatus == 1) {
                                                x.checkStatus = 0
                                            } else if (x.checkStatus == 0) {
                                                x.checkStatus = 1
                                            } else {
                                                x.checkStatus = 1
                                            }
                                            x.isopen = false;
                                            angular.forEach(x.shopList, function(data, index) {
                                                data.isopen = false;
                                                data.checkStatus = x.checkStatus;
                                            });
                                            // 二级菜单
                                            var flag = false,
                                                allCount = 0,//非选中的数量，包括-和未选中
                                                notAcount_2=0;//二级存在-号的存在
                                            angular.forEach(z.shopList, function(data, index) {
                                                if (data.checkStatus !== 1) { //未选中
                                                    allCount++;
                                                    if(data.checkStatus == 2){
                                                        notAcount_2++;
                                                    }
                                                } else {
                                                    flag = true; //选中
                                                }
                                            })
                                            if (flag && allCount == 0) { //全部选中
                                                z.checkStatus = 1;
                                                return
                                            }
                                            if (allCount == z.shopList.length) {
                                                if(notAcount_2 !==0){
                                                    z.checkStatus = 2; 
                                                }else{
                                                    z.checkStatus = 0; //全不选
                                                }
                                            } else {
                                                z.checkStatus = 2; //部分选择
                                            }
                                        }
                                    },
                                    // 单选
                                    Checked: function($event, y, x, z) {
                                        if($scope.userAll == 1){
                                            return;
                                        }
                                        $event.stopPropagation();
                                        // y.checkStatus = !y.checkStatus;
                                        if (y.checkStatus == 1) {
                                            y.checkStatus = 0;
                                        } else {
                                            y.checkStatus = 1;
                                        }

                                        var flag = false,
                                            count = 0;
                                        // 遍历3层数据
                                        angular.forEach(x.shopList, function(data) {
                                            if (data.checkStatus == 0) { //未选中
                                                count++
                                            } else {
                                                flag = true;
                                            }
                                        });
                                        if (flag && count == 0) { //2层全部选中
                                            x.checkStatus = 1;

                                        } else if (count == x.shopList.length) {
                                            x.checkStatus = 0; //2层未全选
                                        } else {
                                            x.checkStatus = 2; //2层部分选择
                                        }

                                        var flag1 = false,
                                            count1 = 0,
                                            count2 = 0;
                                        angular.forEach(z.shopList, function(data, index) {
                                            if (data.checkStatus == 2) { //部分选中
                                                count1++
                                            } else if (data.checkStatus == 0) { //未选中
                                                count2++
                                            } else {
                                                flag1 = true; //选中
                                            }
                                        });

                                        if (flag1 && count1 == 0 && count2 == 0) { //全部选中
                                            z.checkStatus = 1;

                                        } else if (count2 == z.shopList.length) {
                                            z.checkStatus = 0; //全不选
                                        } else {
                                            z.checkStatus = 2; //部分选择
                                        }

                                    },

                                }
                                break;
                            default:
                                break;
                        }

                    });
                }],
                link: function() {}
            }
        })
})();