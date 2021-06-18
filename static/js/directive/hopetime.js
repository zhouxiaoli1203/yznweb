(function() {
    angular.module("myApp", [])
        .directive('hopetime', function() {
            return {
                restrict: "AE",
                scope: {
                    timedata: "@listData",
                    onClick: "&listClick",
                    name: "@listName",
                },
                replace: true,
                templateUrl: "./templates/popup/hope-time.html",
                controller: ["$scope", "$attrs", "$element", function($scope, $attrs, $element) {
                    $scope.$watch('timedata', function() {
                        if($scope.timedata){
                            var data = JSON.parse($scope.timedata);
                            var timegroup = data; //选择时间list
                        }else{
                            var timegroup=[];
                        }
                        var dom = $element.find('#float-panel');
                        var first = $element.find('.inithopeTimeBtn');
                        var third = $element.find('.lasthopeTimeBtn');
                        var fpanel = angular.element(dom);
                        var week;
                        $scope.hourtimelist = [6,7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
                        $scope.stat_mintimelist = $scope.end_mintimelist = ['00','05',10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                        $scope.addtimebox = function($event, index) {
                            $scope.chosebeginhourtime = '6';
                            $scope.choseendhourtime = '7';
                            $scope.chosebeginmintime = $scope.choseendmintime = '00';
                            week = index;
                            var $this = $($event.currentTarget),
                                thisoffset = $this.offset(),
                                top = thisoffset.top,
                                left = thisoffset.left,
                                initbtnleft = angular.element(first).offset().left,
                                lasthopeTimeBtn = angular.element(third).offset().left,
                                panelwidth = fpanel.width(),
                                panelleft = fpanel.offset().left;

                            fpanel.css({
                                top: top-30,
                                left: 92 * (index - 1) + 63,
                            }).show();

                            if(left <= lasthopeTimeBtn) {
                                fpanel.find('.float-panel-arrow').css({
                                    marginLeft: 25
                                });
                            } else {
                                fpanel.css({
                                    left: 253,
                                }).find('.float-panel-arrow').css({
                                    marginLeft: left - lasthopeTimeBtn + 25
                                });
                            }

                        }
                        //关闭 时间选择器
                        $scope.floatpanelclose = function() {
                            fpanel.css({
                                display: 'none'
                            })
                        }
                        //选择起始 小时
                        $scope.clickbeginhourtime = function(x) {
                            $scope.chosebeginhourtime = x;
                            if(x == 24){
                                $scope.chosebeginmintime = "00";
                            }
                        }
                        $scope.checkH_m = function(h,type,hm,list){
                            if(type=="hour"){
                                if (!h || isNaN(parseInt(h)) || parseInt(h)<6) {
                                    h = 6;
                                } else {
//                                  if (parseInt(h) < 10) {
//                                      h = '0' + parseInt(h);
//                                  }
                                }

                                if(hm == 'begin'){
                                    $scope.chosebeginhourtime = h;
                                }else{
                                    $scope.choseendhourtime = h;
                                }
                            }else{
                                if (!h || isNaN(parseInt(h))) {
                                    h = "00";
                                } else {
//                                  if (parseInt(h) < 10) {
//                                      h = '0' + parseInt(h);
//                                  }
                                }
                                if(hm == 'begin'){
                                    $scope.chosebeginmintime = h;
                                }else{
                                    $scope.choseendmintime = h;
                                }
                            }
                        }
//                      $scope.$watch("chosebeginhourtime",function(){
//                          if($scope.chosebeginhourtime == 24){
//                              $scope.stat_mintimelist = ['00'];
//                          }else{
//                               $scope.stat_mintimelist = ['00','05',10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
//                          }
//                      });
                        //选择起始 分钟
                        $scope.clickbeginmintime = function(x) {
                            $scope.chosebeginmintime = x;
                             if($scope.chosebeginhourtime == 24){
                                $scope.chosebeginmintime="00";
                            }
                        }

                        //选择结束 小时
                        $scope.clickendhourtime = function(x) {
                            $scope.choseendhourtime = x;
                            if(x == 24){
                                $scope.choseendmintime = "00";
                            }
                        }
//                      $scope.$watch("choseendhourtime",function(){
//                          if($scope.choseendhourtime == 24){
//                              $scope.end_mintimelist = ['00'];
//                          }else{
//                               $scope.end_mintimelist = ['00','05',10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
//                          }
//                      });
                        //选择结束  分钟
                        $scope.clickendmintime = function(x) {
                            $scope.choseendmintime = x;
                             if($scope.choseendhourtime == 24){
                                $scope.choseendmintime="00";
                            }
                        }

                        $scope.dademodeltime = function(type, index) {
                            if(type == 'add') {
                                var begintime = parseInt($scope.chosebeginhourtime + '' + $scope.chosebeginmintime),
                                    endtime = parseInt($scope.choseendhourtime + '' + $scope.choseendmintime);
                                if(begintime >= endtime) {
                                    layer.msg('结束时间要大于起始时间');
                                    return;
                                } else {
                                    var time = $scope.chosebeginhourtime + ':' + $scope.chosebeginmintime + '-' + $scope.choseendhourtime + ':' + $scope.choseendmintime;
                                    switch(week) {
                                        case '1':
                                            $scope.modeltime1 = time
                                            break;
                                        case '2':
                                            $scope.modeltime2 = time
                                            break;
                                        case '3':
                                            $scope.modeltime3 = time
                                            break;
                                        case '4':
                                            $scope.modeltime4 = time
                                            break;
                                        case '5':
                                            $scope.modeltime5 = time
                                            break;
                                        case '6':
                                            $scope.modeltime6 = time
                                            break;
                                        case '7':
                                            $scope.modeltime7 = time
                                            break;
                                        default:
                                            break;
                                    };
                                    fpanel.css({
                                        'display': 'none'
                                    })

                                    var timelist = {
                                        beginTime: $scope.chosebeginhourtime + ':' + $scope.chosebeginmintime,
                                        endTime: $scope.choseendhourtime + ':' + $scope.choseendmintime,
                                        week: week,
                                    };
                                    timegroup.push(timelist);
                                }
                            } else {
                                switch(index) {
                                    case '1':
                                        $scope.modeltime1 = ''
                                        break;
                                    case '2':
                                        $scope.modeltime2 = ''
                                        break;
                                    case '3':
                                        $scope.modeltime3 = ''
                                        break;
                                    case '4':
                                        $scope.modeltime4 = ''
                                        break;
                                    case '5':
                                        $scope.modeltime5 = ''
                                        break;
                                    case '6':
                                        $scope.modeltime6 = ''
                                        break;
                                    case '7':
                                        $scope.modeltime7 = ''
                                        break;
                                    default:
                                        break;
                                };
                                if(timegroup) {
                                    for(var i in timegroup) {
                                        if(timegroup[i].week == index) {
                                            timegroup.splice(i, 1)
                                        }
                                    }
                                }

                            }
                            $scope.onClick({
                                data: timegroup
                            })
                        };
                        if($scope.timedata) {
                            $scope.modeltime1 = $scope.modeltime2 = $scope.modeltime3 = $scope.modeltime4 = $scope.modeltime5 = $scope.modeltime6 = $scope.modeltime7 = '';
                            for(var val in data) {
                                data[val].beginTime = datetimes(data[val].beginTime);
                                data[val].endTime = datetimes(data[val].endTime);
                                datetimes(data[val].beginTime)
                                switch(data[val].week) {
                                    case '1':
                                        $scope.modeltime1 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    case '2':
                                        $scope.modeltime2 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    case '3':
                                        $scope.modeltime3 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    case '4':
                                        $scope.modeltime4 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    case '5':
                                        $scope.modeltime5 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    case '6':
                                        $scope.modeltime6 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    case '7':
                                        $scope.modeltime7 = data[val].beginTime + '-' + data[val].endTime
                                        break;
                                    default:
                                        break;
                                };
                                fpanel.css({
                                    'display': 'none'
                                })
                            }
                        }
                    })
                }]
            }
        })
})();