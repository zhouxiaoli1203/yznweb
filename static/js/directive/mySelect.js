(function() {
    /*
     * 参数说明：
     * myId: 筛选列表自己独有的标识名字（可选）
     * name: 筛选列表的头（必须）
     * data: 筛选列表数据（必须）
     * field: 筛选列表数据里面需要展示的字段（可为空，为空默认无字段）
     * search: 是否需要搜索列表功能（可为空，为空默认不搜索,true:有搜索）
     * sort: 是否要排序（可为空，为空默认需要排序，false:不排序）
     * isAll: 是否需要全部选项（可为空，为空默认需要，no:不需要）
     * head_name: 选中之后头部名称是否改变（可为空，为空默认改变，noChange: 不改变）
     * defaultField: 默认字段（可为空，为空默认为name）
     * type: 选择器的类型（可为空，为空默认为筛选类，2：课选择多个）
     * onClick: 列表点击回调事件（必须）
     * screen_no: 清楚显示的默认样式
     * conflict: 显示冲突文案样式(用于快速排课弹框筛选样式)
     * isDefault:默认项选择，可为空为空默认选择，no不需要
     * loadMore:下拉滚动加载
     */
    var selectApp = angular.module("myApp", []);

    selectApp.directive('mySelect', function() {
        return {
            restirct: 'E',
            scope: {
                myId: "@myId",
                name: "@listName",
                data: "@listData",
                field: '@listField',
                defaultField: '@listDefault',
                search: '@listSearch',
                sort: '@listSort',
                isAll: '@listAll',
                isDefault: '@listMoren',
                head_name: '@listHeadname',
                type: '@listType',
                conflict: '@listConflict',
                onClick: "&listClick",
                loadMore: "=listLoad",
                apiSearch: '=olSearch',
                apiSearchKey: '@olKey',
                apiSearchName: '@olName',
            },
            template: '<div class="screen" ng-click="changeScreen()">' +
                '<div class="screen_title" data-toggle="dropdown"><span ng-class="{headNameColor: judgeHeadNameColor}" >{{headName}}</span><i class="icon_drop_up"></i></div>' +
                '<ul class="dropdown-menu screen_menu" ng-class="{select_type_2: selectType_2}">' +
                '<li class="screen_point"></li>' +
                '<li class="screen_search" ng-show="hasSearch"><input type="text" ng-model="searchValue" ng-change="apiSearch?apiSearch(apiSearchKey,apiSearchName,searchValue):listSearch(listInfo, field, this)" placeholder="搜索"><em ng-if="searchValue" ng-click="cleanSearch($event)" class="icon_drop_x"></em></li>' +
                '<li ng-if="listInfo.part.length == 0 || listInfo.part[0].data.length == 0" style="text-align: center;">暂无数据</li>' +
                '<li class="screen_menuitem">' +
                '<div class="screen_menuitem_con" when-scrolled="loadMore()">' +
                '<p ng-click="selectList(null, $index)" ng-if="judgeAll && (listInfo.part.length !== 0 && listInfo.part[0].data.length !== 0)">全部</p>' +
                '<p ng-click="selectList(null, $index)" ng-if="isDefault.length>0 && (listInfo.part.length !== 0 && listInfo.part[0].data.length !== 0)">{{isDefault}}</p>' +
                '<div ng-repeat="n in listInfo.part">' +
                '<p ng-class="{icon_selected: (x.hasSelected && type==2)}" ng-repeat="x in n.data track by $index" ng-click="selectList(x, $index)" title="{{getField(x, field)}}">{{getField(x, field)}}<span class="isconflict" ng-if="x.conflictStatus==1 && conflict_">冲突</span></p>' +
                '</div></div></li></ul></div>',
            controller: ['$scope', function($scope) {
                $scope.myIdName = $scope.myId ? $scope.myId : $scope.name; //自己唯一的标识
                $scope.headName = $scope.name; //筛选后头部数据
                $scope.judgeHeadNameColor = false;
                $scope.judgeAll = true; //是否显示全部按钮
                $scope.judgeDefault = false; //是否显示默认项
                $scope.judgeNoData = true; //是否显示暂无数据
                $scope.selectType_2 = false; //是否是多选（阻止事件冒泡）
                $scope.searchValue = ''; //搜索值
                if ($scope.conflict == 'true') {
                    $scope.conflict_ = true;
                }
                if ($scope.isAll == 'no') {
                    $scope.judgeAll = false;
                }
                if ($scope.type == '2') { //是否是多选（阻止事件冒泡）
                    $scope.selectType_2 = true;
                }
                //处理列表数据，返回显示的字段
                $scope.getField = getAtt;
                //获取标签传递的列表数据
                $scope.listInfo = { all: null, part: null };
                $scope.$watch('data', function() {
                    if ($scope.data) {
                        if ($scope.sort == 'false') {
                            $scope.listInfo.all = noPySegSort(JSON.parse($scope.data), $scope.field);
                        } else {
                            $scope.listInfo.all = pySegSort(JSON.parse($scope.data), $scope.field);
                        }
                        if ($scope.type == '2') {
                            angular.forEach($scope.listInfo.all, function(val) {
                                angular.forEach(val.data, function(val_) {
                                    val_.hasSelected = false;
                                })
                            });
                            //                          console.log($scope.listInfo.all);
                            //重置数据加勾-选择器类型为2时
                            if (!$scope.$parent.reloadData) {
                                $scope.$parent.reloadData = {};
                            }
                            if (!$scope.$parent.clearSatus) {
                                $scope.$parent.clearSatus = {};
                            }

                            //传值勾选，选择框内的值
                            $scope.reloadData = function(data, att) {
                                // console.log(data)
                                var da = []; //传过来的data在列表中有值放入此容器
                                var da_ = []; //data在列表中没有的值放入此容器
                                if (data) {
                                    if (data.length > 0 && $scope.listInfo.all) {
                                        //把列表中的勾中状态清空
                                        angular.forEach($scope.listInfo.all[0].data, function(val) {
                                            val.hasSelected = false;
                                        });

                                        setTimeout(function() {
                                            angular.forEach(data, function(val) {
                                                var judge = true;
                                                angular.forEach($scope.listInfo.all[0].data, function(val_) {
                                                    if (getAtt(val, att) == getAtt(val_, att)) { //判断data中的数据是否在列表中如果有放入da
                                                        val_.hasSelected = true;
                                                        judge = false;
                                                        da.push(val_);
                                                    }
                                                });
                                                if (judge) { //判断data中的数据是否在列表中如果没有放入da_
                                                    val.hasSelected = true;
                                                    da_.push(val);
                                                }
                                            })
                                            da = da.concat(da_); //最后把有的和没有的合成一个数组（此数组中的数据浅拷贝于列表中的数据）
                                            if (da.length > 0) { //根据浅拷贝的原理把data里面的值置换一遍（指针指向列表中的数据，方便外部取消打钩）
                                                for (var i in data) {
                                                    data[i] = da[i];
                                                }
                                            }
                                            $scope.listInfo.part = $scope.listInfo.all;
                                            $scope.$apply();
                                        })
                                    }
                                }
                            };

                            //清空勾选数据
                            $scope.clearSatus = function() {
                                if ($scope.type == '2') {
                                    angular.forEach($scope.listInfo.all[0].data, function(val) {
                                        val.hasSelected = false;
                                    });
                                }
                                $scope.searchValue = '';
                                $scope.listInfo.part = $scope.listInfo.all;
                            };
                            $scope.$parent.reloadData[$scope.myIdName] = $scope.reloadData;
                            $scope.$parent.clearSatus[$scope.myIdName] = $scope.clearSatus;
                        };
                        $scope.listInfo.part = $scope.listInfo.all;
                    }
                }, true);
                //清除一些状态
                $scope.$on($scope.myIdName, function(n, n_, obj, sp) {
                    if ($scope.data) {
                        switch (n_) {
                            case 'clearSatus':
                                $scope.clearSatus();
                                break; //清除勾选状态
                            case 'clearSearchVal':
                                $scope.searchValue = '';
                                $scope.listInfo.part = $scope.listInfo.all;
                                break; //清除搜索值
                            case 'reloadData':
                                $scope.reloadData(obj.data, obj.att);
                                break; //添加默认勾选值
                            case 'returnScope':
                                obj.fn($scope);
                                break; //返回本作用域的scope
                            case 'clearHeadName': //重置headName-标签名字
                                $scope.judgeHeadNameColor = false;
                                if (obj) {
                                    $scope.judgeHeadNameColor = sp ? false : true;
                                    $scope.headName = obj;
                                } else {
                                    $scope.headName = $scope.name;
                                }
                                break;
                        };
                    };
                });
                //如果需要搜索功能search=true
                if ($scope.search == 'true') {
                    $scope.hasSearch = true;
                    $scope.listSearch = listSearch;

                    //清除搜索内容
                    $scope.cleanSearch = function(e) {
                        $scope.searchValue = '';
                        $scope.listInfo.part = $scope.listInfo.all;
                        if ($scope.apiSearch) {
                            $scope.apiSearch($scope.apiSearchKey, $scope.apiSearchName, $scope.searchValue)
                        }
                    }
                }

                //默认选中的字段（如果有）
                $scope.$watch('defaultField', function() {
                    if ($scope.defaultField) {
                        $scope.judgeHeadNameColor = true;
                        $scope.headName = $scope.defaultField;
                    }
                });
                //选中
                $scope.selectList = function(d, ind) {
                    var data = { n: d, i: ind }; //点击回调组件外方法需要传的值
                    if (d && $scope.head_name != "noChange") {
                        $scope.judgeHeadNameColor = true;
                        $scope.headName = $scope.getField(d, $scope.field);
                    } else {
                        $scope.judgeHeadNameColor = false;
                        $scope.headName = $scope.name;
                    }
                    $scope.onClick(data); //点击回调组件外的方法
                }
                //重置or设置搜索名称
                if (!$scope.$parent.screen_goReset) {
                    $scope.$parent.screen_goReset = {};

                };
                $scope.$parent.screen_goReset[$scope.myIdName] = function(value) {
                    if (value) {
                        $scope.judgeHeadNameColor = true;
                        $scope.headName = value;
                    } else {
                        $scope.judgeHeadNameColor = false;
                        $scope.headName = $scope.name;
                    }
                    if ($scope.search) {
                        $scope.searchValue = '';
                        $scope.listInfo.part = $scope.listInfo.all;
                    }
                };
                $scope.changeScreen = function() {
                    if ($scope.search) {
                        $scope.searchValue = '';
                        $scope.listInfo.part = $scope.listInfo.all;
                    }
                    if ($scope.apiSearch) {
                        $scope.apiSearch($scope.apiSearchKey, $scope.apiSearchName, $scope.searchValue)
                    }
                }
            }],
            link: function() {
                //始终在最顶层显示弹出筛选栏
                var screen_show = document.getElementsByClassName('screen');
                for (var i = 0; i < screen_show.length; i++) {
                    screen_show[i].onclick = function(e) {
                        var _this = $(this),
                            subTop = 38,
                            subLeft = -8,
                            scrollTop = _this.closest('.layer_msk') ? _this.closest('.layer_msk').scrollTop() : 0,
                            _v, _h;
                        if (_this.closest('.popup_')[0] && !isIE()) { //判断是否是弹框里面的并且不是ie浏览器
                            subLeft = subLeft - _this.closest('.popup_').offset().left;
                            subTop = subTop - 50;
                        }
                        _v = $(window).height() - (_this.offset().top + subTop); //获取点击的元素到浏览器底部的距离
                        //                      _h = $(this.children[1]).height() < 240?$(this.children[1]).height():240;     //弹框的最大高度
                        _h = 240;
                        this.children[1].style.left = _this.offset().left + subLeft + 'px';
                        //判断当下面的距离不足以容纳弹框高度时往上面弹
                        if (_v < _h && _this.closest('.popup_')[0]) {
                            this.children[1].style.top = _this.offset().top + subTop + scrollTop - _h - 120 + 'px';
                            $(this.children[1]).find('.screen_menuitem_con').css({ 'height': _h + 'px' });
                            $('.screen_point').hide();
                        } else if (_this.closest('.my_select_special')[0]) {
                            this.children[1].style.top = _this.offset().top + subTop + scrollTop - _h - 120 + 'px';
                            $(this.children[1]).find('.screen_menuitem_con').css({ 'height': _h + 'px' });
                            $('.screen_point').hide();
                        } else {
                            if (_v < _h) {
                                this.children[1].style.top = _this.offset().top + subTop - _h + 'px';
                                $(this.children[1]).find('.screen_menuitem_con').css({ 'height': _h + 'px' });
                                $('.screen_point').hide();
                            } else {
                                $('.screen_point').show();
                                $(this.children[1]).find('.screen_menuitem_con').css({ 'max-height': _v - 120 + 'px' });
                                this.children[1].style.top = _this.offset().top + subTop + scrollTop + 'px';
                            }
                        }
                    };
                    $(screen_show[i]).find('.screen_menu')[0].onmousewheel = function(e) { //阻止事件默认
                        e.stopPropagation();
                    };
                    $(screen_show[i]).find('.screen_search')[0].onclick = function(e) { //阻止事件默认
                        e.stopPropagation();
                    };
                }
            }
        }
    })
})()

//获取列表按拼音排序
function pySegSort(arr, at) {
    var att = '';
    var segs = [];
    var curr = { letter: '', data: [] };
    if (at) {
        att = at;
    };
    if (!String.prototype.localeCompare)
        return null;

    curr.data = arr.sort(function(a, b) {
        return getAtt(a, att).localeCompare(getAtt(b, att), "zh");
    });

    segs.push(curr);
    return segs;
}

//本地搜索需要的信息
function listSearch(obj, at, e) {
    console.log(e)
        //	var keycode = window.event ? e.keyCode : e.which; //获取按键编码
    var att = '';
    var obj = obj;
    var arr = obj.all;

    if (at) {
        att = at;
    };
    obj.part = [];
    for (var i in arr) {
        var curr = { letter: arr[i].letter, data: [] }
        for (var j in arr[i].data) {
            //转义正则特殊字符
            var searchEscapeVaule = e.searchValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if (new RegExp(searchEscapeVaule, 'g').test(getAtt(arr[i].data[j], att))) {
                curr.data.push(arr[i].data[j]);
            }
        };
        if (curr.data.length) {
            obj.part.push(curr);
        }
    }
}

//获取对象的属性
function getAtt(obj, at) {
    var obj = obj;
    if (at) {
        var att = at.split('.');
        for (var i = 0; i < att.length; i++) {
            obj = obj[att[i]]
        };
    }
    if (!obj) {
        return '';
    } else {
        return obj;
    }
}

//不需要排序
function noPySegSort(arr, at) {
    var att = '';
    var segs = [];
    var curr = { letter: '', data: [] };
    if (at) {
        att = at;
    };
    for (var j = 0; j < arr.length; j++) {
        curr.data.push(arr[j]);
    };
    segs.push(curr);
    return segs;
}

//动态自定义设置筛选的字段
function screen_setDefaultField(obj, fn) {
    obj.$watch(obj.screen_goReset, function() {
        fn();
    })
}

function isIE() { //ie?
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
    } else {
        return false;
    }
}