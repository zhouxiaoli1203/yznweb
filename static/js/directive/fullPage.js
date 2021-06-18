define([''], function() {
    angular.module("myApp", []).directive('fullPage', ['$compile', function($compile) {
        return {
            restirct: 'E',
            templateUrl: './templates/popup/fullPage.html',
            scope: {
                key: '@pageProps'
            },
            controller: ['$scope', '$rootScope', function($scope, $rootScope) {
                console.log($scope.key)
                $scope.props = $rootScope.fullPage.container[$scope.key].options;
                console.log($scope.props)
                $scope.props.templateUrl = 'templates/fullPages/' + $scope.props.target + '.html';
                require(['fullPage_' + $scope.props.target], function(page) {
                    console.log(page)
                    page.init($scope);
                });
                $scope.sharink = $rootScope.ismenuOoen;
                $rootScope.$watch("ismenuOoen", function(newV, oldV) {
                    if (newV !== oldV) {
                        $scope.sharink = newV;
                    }
                });
                $scope.return = function() {
                    $rootScope.fullPage.close($scope.props.target, function() {
                        if ($scope.props.close) $scope.props.close();
                        $scope.$destroy();
                    })
                }
            }]
        }
    }])
})