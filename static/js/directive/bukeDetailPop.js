define(["MyUtils",],function(MyUtils) {
    creatPopup({
        el: 'bukePop',
        openPopupFn: 'bukeDetailPopup',
        htmlUrl: './templates/popup/bukeDetailPop.html',
        controllerFn: function($scope, props) {
            $scope.makeupDetail = angular.copy(props);
//          $scope.props = angular.copy(props);
            init();
            function init(){
//              getMakeupInfo();
            }
            function getMakeupInfo(){
                var param = {
                    studentCourseTimeInfoId:$scope.props?$scope.props.studentCourseTimeInfoId:undefined
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/leave/makeUp/info',
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.makeupDetail = data.context;
                        }
    
                    }
                })
            }
        }
    })
})