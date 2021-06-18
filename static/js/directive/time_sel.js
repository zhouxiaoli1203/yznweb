(function() {
    angular.module("myApp", [])
        .directive('timesel', function() {
            return {
                restrict: "E",
                scope: {
                    timedata: "@listData",
                    onClick: "&listClick",
                    myId: "@listId",
                },
                replace: true,
                templateUrl: "./templates/popup/time_sel.html",
                controller: ["$scope", function($scope) {
                    $scope.$watch('timedata', function() {
                        $scope.timeHm = {};
                        var timelist={};
                        $scope.hourtimelist = ['06','07', '08', '09', 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
                        $scope.stat_mintimelist = $scope.end_mintimelist = ['00','05',10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                        $scope.myIdName = $scope.myId;
                        if($scope.timedata){
                            var data = JSON.parse($scope.timedata);
                            $scope. chosebeginhourtime = data.beginTime.substr(0,2);
                            $scope. chosebeginmintime = data.beginTime.substr(3,4);
                            $scope. choseendhourtime = data.endTime.substr(0,2);
                            $scope. choseendmintime = data.endTime.substr(3,4);
                        }else{
                            $scope. chosebeginhourtime = '06';
                            $scope. choseendhourtime = '07';
                            $scope. chosebeginmintime = $scope. choseendmintime = '00';
                        }
//                      getChangeTime();
                       
                        $scope.checkH_m = function(h,type,hm,list){
                            if(type=="hour"){
                                if (!h || isNaN(parseInt(h)) || parseInt(h)<6) {
                                    h = "06";
                                } else {
                                    if (parseInt(h) < 10) {
                                        h = '0' + parseInt(h);
                                    }
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
                                    if (parseInt(h) < 10) {
                                        h = '0' + parseInt(h);
                                    }
                                }
                                if(hm == 'begin'){
                                    $scope.chosebeginmintime = h;
                                }else{
                                    $scope.choseendmintime = h;
                                }
                            }

                            getChangeTime();
                        }
                         //选择起始 小时
                        $scope.clickbeginhourtime = function(x) {
                            $scope. chosebeginhourtime = x;
                            if(x == 24){
                                $scope. chosebeginmintime = "00";
                                
                            }
                            getChangeTime();
                        }
                        //选择起始 分钟
                        $scope.clickbeginmintime = function(x) {
                            $scope. chosebeginmintime = x;
                            if($scope. chosebeginhourtime == 24){
                                $scope. chosebeginmintime="00";
                            }
                            getChangeTime();
                        }

                        //选择结束 小时
                        $scope.clickendhourtime = function(x) {
                            $scope. choseendhourtime = x;
                            if(x == 24){
                                $scope. choseendmintime = "00";
                            }
                            getChangeTime();
                        }
                        
                        //选择结束  分钟
                        $scope.clickendmintime = function(x) {
                            $scope. choseendmintime = x;
                            if($scope. choseendhourtime == 24){
                                $scope. choseendmintime="00";
                            }
                            getChangeTime();
                        }
                        function getChangeTime(){

                            timelist = {
                                beginTime: $scope. chosebeginhourtime + ':' + $scope. chosebeginmintime,
                                endTime: $scope. choseendhourtime + ':' + $scope. choseendmintime,
                            };
                            $scope.onClick({
                                data: timelist
                            })
                        }
                        $scope.$on($scope.myIdName, function() {
                            $scope. chosebeginhourtime = '06';
                            $scope. choseendhourtime = '07';
                            $scope. chosebeginmintime = $scope. choseendmintime = '00';
                        });

                        
                    });

                }],
                link: function() {
                    $(".time-panel .select-time-list").on("mousewheel",function(e){
                        var event = e || window.event;
                        event.stopPropagation();
                    });
                }
            }
        })
})();