(function() {

    var myapp = angular.module("myApp", []);
    myapp.directive('inputSelect', function() {
        return {
            restirct: 'E',
            replace: true,
            scope: {
                myIdName: "@myId",
                required: "@listRequired",
                data: "@listData",
                field: '@listField',
                needChange: "@listNeedchange",
                placeholder: '@listPlaceholder',
                maxlength: '@listMax',
                defaultField: '@listDefault',
                sort: '@listSort',
                searchValue: "=ngModel",
                onClick: "&listClick",
                textchanged: "&textchanged",
                inputblur: "&inputblur"
            },
            template: '<div class="input-search-dropdown">' +
                '<input type="text" class="input-search-input"  ng-model="searchValue" ng-focus="showUl = true" ng-blur="hideSelect(searchValue,$event)" ng-change="needListSearch(listInfo, field, this)" autocomplete="off" maxlength="{{maxlength}}" placeholder="{{placeholder}}" ng-required="{{required}}"/>' +
                '<ul ng-show="showUl && listInfo.part && listInfo.part[0] && listInfo.part[0].data.length > 0" class="input-search-ul" ng-class="{focus:showUl}">' +
                // '<li ng-if="listInfo.part.length == 0" class="textAlignCenter">暂无数据</li>'+
                '<li ng-repeat="n in listInfo.part"><p class="select_p" ng-repeat="x in n.data track by $index" ng-mousedown="onmousedown(x, $index,$event)" ng-click="selectList(x, $index,$event)">{{getField(x, field)}}</p></li>' +
                '</ul></div>',
            controller: ["$scope", function($scope) {
                $scope.showUl = false;
                $scope.headName = $scope.name; //选择后input数据
                $scope.getField = getAtt;
                $scope.needListSearch = needListSearchFun; //搜索下拉里的数据
                $scope.listInfo = { all: null, part: null };
                $scope.$watch('data', function() {
                    if ($scope.data) {
                        $scope.listInfo.all = pySegSort(JSON.parse($scope.data), $scope.field);
                        $scope.listInfo.part = $scope.listInfo.all;
                        if (!$scope.$parent.clearSatus) {
                            $scope.$parent.clearSatus = {};
                        }
                        //清空勾选数据
                        $scope.clearSatus = function() {
                            $scope.showUl = false;
                            $scope.listInfo.part = $scope.listInfo.all;
                        };
                        $scope.$parent.clearSatus[$scope.myIdName] = $scope.clearSatus;
                    }
                }, true);
                //选中
                $scope.selectList = function(d, ind, e) {
                    var data = { n: d, i: ind, type: "click" }; //点击回调组件外方法需要传的值
                    if (d) {
                        $scope.searchValue = $scope.getField(d, $scope.field);
                        $scope.showUl = false;
                    } else {
                        //                          $scope.headName = $scope.name;
                    }
                    $scope.onClick(data); //点击回调组件外的方法
                }
                $scope.onmousedown = function(x, $index, $event) {
                    console.warn('onmousedown');
                    $event.preventDefault();
                }
                $scope.hideSelect = function(d, e) {
                    $scope.inputblur({ scope: $scope });

                    $scope.showUl = false;
                    // $timeout(function(){
                    //     $scope.showUl = false;
                    // },5);
                }

                function needListSearchFun(listInfo, field, this_) {
                    $scope.showUl = true;
                    $scope.textchanged({ text: $scope.searchValue, scope: $scope });
                    if ($scope.needChange != false) {
                        if ($scope.searchValue) {
                            listSearch(listInfo, field, this_);
                        } else {
                            if ($scope.data) {
                                $scope.listInfo.part = pySegSort(JSON.parse($scope.data), $scope.field);
                            } else {
                                $scope.listInfo.part = $scope.listInfo.all;
                            }
                        }
                    }
                }
                //清除一些状态
                $scope.$on($scope.myIdName, function(n_, obj) {
                    if ($scope.data) {
                        switch (n_) {
                            case 'clearSearchVal':
                                $scope.clearSatus();
                                break; //清除搜索值
                            case 'returnScope':
                                obj.fn($scope);
                                break; //返回本作用域的scope
                        };
                    };
                });
            }],
            link: function(scope, attr) {
                //始终在最顶层显示弹出筛选栏
                var screen_show = document.getElementsByClassName('input-search-input');
                for (var i = 0; i < screen_show.length; i++) {
                    screen_show[i].onfocus = function(e) {
                        var _this = $(this),
                            subTop = 28,
                            subLeft = 2,
                            scrollTop = _this.closest('.layer_msk') ? _this.closest('.layer_msk').scrollTop() : 0,
                            _v, _h;
                        $(this).next("ul")[0].style.width = _this.outerWidth() + 'px';
                        if (_this.closest('.popup_')[0] && !isIE()) { //判断是否是弹框里面的并且不是ie浏览器
                            subLeft = subLeft - _this.closest('.popup_').offset().left;
                            subTop = subTop - 50;
                        }
                        _v = $(window).height() - (_this.offset().top + subTop); //获取点击的元素到浏览器底部的距离
                        //                      _h = $(this.children[1]).height() < 240?$(this.children[1]).height():240;     //弹框的最大高度
                        _h = 240;

                        $(this).next("ul")[0].style.left = _this.offset().left + subLeft + 'px';
                        //判断当下面的距离不足以容纳弹框高度时往上面弹
                        if (_v < _h && _this.closest('.popup_')[0]) {
                            $(this).next("ul")[0].style.top = _this.offset().top + subTop + scrollTop - _h - 30 + 'px';
                        } else {
                            $(this).next("ul")[0].style.top = _this.offset().top + subTop + scrollTop + 'px';
                        }
                    };
                    //                      $(screen_show[i]).next("ul")[0].onmousewheel = function(e) { //阻止事件默认
                    //                          e.stopPropagation();
                    //                      };
                    //                      $(screen_show[i]).next("ul")[0].onclick = function(e) { //阻止事件默认
                    //                          e.stopPropagation();
                    //                      };
                }
            }
        }
    });

})();

function isIE() { //ie?
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
    } else {
        return false;
    }
}