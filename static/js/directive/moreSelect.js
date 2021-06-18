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
     */
    var selectApp = angular.module("myApp", []);
    
    selectApp.directive('moreSelect',function() {
        return {
            restirct: 'E',
            scope: {
                myId: "@myId",
                name: "@listName",
                data: "@listData",
                field: '@listField',
                field1: '@listField1',
                field2: '@listField2',
                isDefault: '@listDefault',
                search: '@listSearch',
                sort: '@listSort',
                head_name: '@listHeadname',
                type: '@listType',
                onClick: "&listClick",
            },
            template:
                '<div class="screen">'+
                '<div class="screen_title" data-toggle="dropdown" ng-click="initDrop()"><span>{{headName}}</span><i class="icon_drop_up"></i></div>'+
                '<ul class="dropdown-menu screen_menu">'+
                '<li class="screen_point"></li>'+
                '<li class="screen_search" ng-show="hasSearch"><input type="text" ng-model="searchValue" ng-change="listSearch(listInfo, field, this)" placeholder="搜索"><em ng-if="searchValue" ng-click="cleanSearch($event)" class="icon_drop_x"></em></li>'+
                '<li ng-if="listInfo.part.length == 0" style="text-align: center;">暂无数据</li>'+
                '<li class="screen_menuitem">'+
                '<div class="screen_menuitem_con">'+
                '<p ng-click="selectList(null, $index)" ng-if="isDefault.length>0">{{isDefault}}</p>'+
                '<div ng-repeat="n in listInfo.part">'+
                '<div class="select_p" ng-repeat="x in n.data track by $index" ng-click="selectList(x, $index)" >{{getField(x, field)}}'+
                    '<span style="float:right;" ng-if="x.channelList.length>0" ng-mouseenter="showLevel1($event,x,$index)">></span>'+
                    
                    '<div class="select_level_div" ng-show="$index == current_index.index1">'+
                    '<ul><li ng-repeat="y in level.channelList track by $index" ng-click="selectList1(x,y, $index)">{{getField(y, field1)}}'+
                    
                        '<span style="float:right;" ng-if="x.channelList.length>0" ng-mouseenter="showLevel2($event,x,$index)">></span>'+
                        '<div class="select_level_div" ng-show="$index == current_index.index2">'+
                        '<ul><li ng-repeat="y1 in level1.channelList track by $index" ng-click="selectList2(x,y,y1, $index)">{{getField(y1, field2)}}<span style="float:right;" ng-click="showLevel($event,y)">></span></li></ul>'+
                        '</div>'+
                    '</li></ul>'+
                    '</div>'+
                '</div>'+
                '</div></div></li></ul></div>',
            controller: ["$scope", function($scope) {
                console.log($scope.data);
                $scope.myIdName = $scope.myId?$scope.myId:$scope.name; //自己唯一的标识
                $scope.headName = $scope.name; //筛选后头部数据
                $scope.judgeNoData = true;    //是否显示暂无数据
                $scope.selectedLevel1 = false;
                $scope.selectedLevel2 = false;
                $scope.current_index = {
                    index1:null,
                    index2:null
                };//多级的index
                $scope.searchValue = '';  //搜索值
                //处理列表数据，返回显示的字段
                $scope.getField = getAtt;
                $scope.initDrop = function(){
                    $scope.current_index={};
                    $scope.selectedLevel1 = false;
                    $scope.selectedLevel2 = false;
                }
                $scope.showLevel1 = function(e,x,ind){
                    $scope.selectedLevel1 = false;
                    $scope.selectedLevel2 = false;
                    $scope.current_index["index1"] = ind;
                    $scope.current_index["index2"] = null;
                    $scope.level = x;
                    setCurrent(e);
                }
                $scope.showLevel2 = function(e,x,ind){
                    $scope.selectedLevel2 = false;
                    $scope.current_index["index2"] = ind;
                    $scope.level1 = x;
                    setCurrent(e);
                }
                function setCurrent(e){
                    var _this = $(e.currentTarget);
                    var e_t = _this.offset().top||0;//鼠标top
                    var e_l = _this.offset().left||0;//鼠标left
                    var scrollTop = _this.closest('.layer_msk')?_this.closest('.layer_msk').scrollTop():0;
                    var s_t = e_t + scrollTop,//多选列top
                        s_l = e_l + _this.width() +"px";//多选列left
                    
                    
                    _this.siblings(".select_level_div").css({
                        top:s_t,
                        left:s_l,
                    }).show();
                    e.stopPropagation();
                }
                //获取标签传递的列表数据
                $scope.listInfo = {all: null, part: null};
                
                $scope.$watch('data', function() {
                    if($scope.data) {
                        if($scope.sort == 'false') {
                            $scope.listInfo.all = noPySegSort(JSON.parse($scope.data), $scope.field);
                        } else {
                            $scope.listInfo.all = pySegSort(JSON.parse($scope.data), $scope.field);
                        }
                        
                        $scope.listInfo.part = $scope.listInfo.all;
                    }
                }, true);
                //清除一些状态
                $scope.$on($scope.myIdName, function(n, n_, obj, sp) {
                    if($scope.data) {
                        switch(n_) {
                            case 'clearSatus': $scope.clearSatus(); break;   //清除勾选状态
                            case 'clearSearchVal': $scope.searchValue = ''; $scope.listInfo.part = $scope.listInfo.all;break;  //清除搜索值
                            case 'reloadData': $scope.reloadData(obj.data, obj.att); break;  //添加默认勾选值
                            case 'returnScope': obj.fn($scope); break;    //返回本作用域的scope
                            case 'clearHeadName':     //重置headName-标签名字
                                if(obj) {
                                    $scope.headName = obj;
                                } else {
                                    $scope.headName = $scope.name;
                                }
                                break;
                        };
                    };
                });
                //如果需要搜索功能search=true
                if($scope.search == 'true') {
                    $scope.hasSearch = true;
                    $scope.listSearch = listSearch;
                    
                    //清除搜索内容
                    $scope.cleanSearch = function(e) {
                        $scope.searchValue = '';
                        $scope.listInfo.part = $scope.listInfo.all;
                    }
                }
                
                //选中
                $scope.selectList = function(d,d1, d2,ind) {
                    if($scope.selectedLevel1 || $scope.selectedLevel2)return;
                    var data = {n: d, i: ind}; //点击回调组件外方法需要传的值
                    if(d && $scope.head_name != "noChange") {
                        $scope.headName = $scope.getField(d, $scope.field);
                    } else {
                        $scope.headName = $scope.name;
                    }
                    $scope.current_index = {};//多级的index
                    $scope.onClick(data);   //点击回调组件外的方法
                }
                $scope.selectList1 = function(d,d1, ind) {
                    if($scope.selectedLevel2)return;
                    var data = {n: d,n1:d1, i: ind}; //点击回调组件外方法需要传的值
                    if(d1) {
                        $scope.headName = $scope.getField(d, $scope.field)+" / "+$scope.getField(d1, $scope.field1);
                    } else {
                        $scope.headName = $scope.name;
                    }
                    $scope.selectedLevel1 = true;
                    $scope.current_index = {};//多级的index
                    $scope.onClick(data);   //点击回调组件外的方法
                }
                $scope.selectList2 = function(d,d1, d2,ind) {
                    var data = {n: d,n1:d1,n2:d2, i: ind}; //点击回调组件外方法需要传的值
                    if(d1) {
                        $scope.headName = $scope.getField(d, $scope.field)+" / "+$scope.getField(d1, $scope.field1)+" / "+$scope.getField(d2, $scope.field2);
                    } else {
                        $scope.headName = $scope.name;
                    }
                    $scope.selectedLevel2 = true;
                    $scope.current_index = {};//多级的index
                    $scope.onClick(data);   //点击回调组件外的方法
                }
            }],
            link: function(scope, attr) {
                
                //始终在最顶层显示弹出筛选栏
                var screen_show = document.getElementsByClassName('screen');
                for(var i = 0; i < screen_show.length; i++) {
                    screen_show[i].onclick = function(e) {
                        var _this = $(this), subTop = 38, subLeft = -8, scrollTop = _this.closest('.layer_msk')?_this.closest('.layer_msk').scrollTop():0, _v, _h;
                        if(_this.closest('.popup_')[0] && !isIE()) {    //判断是否是弹框里面的并且不是ie浏览器
                            subLeft = subLeft - _this.closest('.popup_').offset().left;
                            subTop = subTop - 50;
                        }
                        _v = $(window).height() - (_this.offset().top + subTop);    //获取点击的元素到浏览器底部的距离
//                      _h = $(this.children[1]).height() < 240?$(this.children[1]).height():240;     //弹框的最大高度
                        _h = 240;
                        this.children[1].style.left = _this.offset().left + subLeft + 'px';
                        //判断当下面的距离不足以容纳弹框高度时往上面弹
                        if(_v < _h && _this.closest('.popup_')[0]) {
                            this.children[1].style.top = _this.offset().top + subTop + scrollTop - _h - 120 + 'px';
                            $(this.children[1]).find('.screen_menuitem_con').css({'height': _h + 'px'});
                            $('.screen_point').hide();
                        } else if(_this.closest('.my_select_special')[0]) {
                            this.children[1].style.top = _this.offset().top + subTop + scrollTop - _h - 120 + 'px';
                            $(this.children[1]).find('.screen_menuitem_con').css({'height': _h + 'px'});
                            $('.screen_point').hide();
                        } else {
                            $('.screen_point').show();
                            $(this.children[1]).find('.screen_menuitem_con').css({'max-height': _v - 120 + 'px'});
                            this.children[1].style.top = _this.offset().top + subTop + scrollTop + 'px';
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
    var curr = {letter: '', data: []};
    if(at) {
        att = at;
    };
    if(!String.prototype.localeCompare)
        return null;
        
    curr.data = arr.sort(function(a, b) {
        return getAtt(a, att).localeCompare(getAtt(b, att),"zh");
    });
    
    segs.push(curr);
    return segs;
}

//本地搜索需要的信息
function listSearch(obj, at, e) {
    console.log(e)
//  var keycode = window.event ? e.keyCode : e.which; //获取按键编码  
    var att = '';
    var obj = obj;
    var arr = obj.all;
    
    if(at) {
        att = at;
    };
    obj.part = [];
    for(var i in arr) {
        var curr = {letter: arr[i].letter, data: []}
        for(var j in arr[i].data) {
            //转义正则特殊字符
            var searchEscapeVaule = e.searchValue.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            if(new RegExp(searchEscapeVaule, 'g').test(getAtt(arr[i].data[j], att))) {
                curr.data.push(arr[i].data[j]);
            }
        };
        if(curr.data.length) {
            obj.part.push(curr);
        }
    }
}

//获取对象的属性
function getAtt(obj, at) {
    var obj = obj;
    if(at) {
        var att = at.split('.');
        for (var i = 0; i < att.length; i++) {
            obj = obj[att[i]]
        };
    }
    if(!obj) {
        return '';
    } else {
        return obj;
    }
}

//不需要排序
function noPySegSort(arr, at) {
    var att = '';
    var segs = [];
    var curr = {letter: '', data:[]};
    if(at) {
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
