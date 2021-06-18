var myApp = angular.module("myApp", ["ui.router", "ngSanitize", 'ngDraggable']);
myApp.directive('classitem', function() {
        return {
            template: '<div ng-include="getContentUrl()"></div>',
            replace: true,
            link: function($scope, $element, $attr) {
                var data = JSON.parse($attr.data);
                $scope.data = data;
                $scope.getContentUrl = function() {
                    if (data.beginDate) {
                        return 'templates/directive/class1.html';
                    } else if (data.type == 1) {
                        return 'templates/directive/class2.html';
                    } else {
                        return 'templates/directive/class3.html';
                    }
                };
            }
        }
    })
    .directive('mixSel', function() {
        return {
            scope: {
                data: "@selData", //套餐列表
                myId: "@myId", //用于区分指令，用于脱套餐时修改对应指令默认值(多个遍历)
                selectedFn: "&selectedFn",
                typeFor: '@typeFor', //来源及参数
                defaultpkg: '@defaultSeleted', //默认选中套餐 无packageId为自定义
                isdisabe: '@isDisabed' //是否禁用
            },
            template: '<div class="dropdown">' +
                '<button type="button" class="dropdown-toggle form-control mix-button" data-toggle="dropdown">' +
                '<span class="mixsel-name">{{name}}</span>' +
                '<span class="mixsel-arrow"></span>' +
                '</button>' +
                '<ul class="dropdown-menu dropList_overflow mixselul" role="menu">' +
                '<li ng-repeat="x in selData track by $index" ng-class="{c999:x.className}" ng-click="changeSelect(x)">{{x.packageName}}</li>' +
                '</ul></div>',
            replace: true,
            controller: ["$scope", "$attrs", function($scope, $attrs) {
                if ($scope.defaultpkg) {
                    $scope.defaultpkg = JSON.parse($scope.defaultpkg);
                    if ($scope.defaultpkg && $scope.defaultpkg.packageId) { //选中为套餐
                        angular.forEach(JSON.parse($scope.data), function(item) {
                            if (item.packageId == $scope.defaultpkg.packageId) {
                                $scope.name = item.packageName
                            }
                        })
                    } else if ($scope.defaultpkg && !$scope.defaultpkg.packageId) { //为自定义
                        $scope.name = $scope.defaultpkg.feeType == 1 ? "按期报名" : $scope.defaultpkg.feeType == 2 ? "按月报名" : "课时报名";
                        //                  $scope.name = '自定义';
                    }
                } else {
                    $scope.name = "请选择套餐"
                }
                $scope.changeSelect = function(x) {
                    if (x.className) return;
                    if ($scope.isdisabe == 'true') {
                        return layer.msg("已发布活动无法修改套餐")
                    }
                    $scope.name = x.packageName;
                    $scope.selectedFn($scope.typeFor ? {
                        n: {
                            data: x,
                            type: JSON.parse($scope.typeFor).type,
                            index: JSON.parse($scope.typeFor).index
                        }
                    } : {
                        n: {
                            data: x
                        }
                    })
                };
                //多个指令遍历需要监听修改
                $scope.$on($scope.myId, function(e, data, list, fl) {
                    //套餐名称及套餐列表修改
                    if (data) {
                        $scope.name = data;
                    }
                    if (list) {
                        $scope.selData = $scope.partPackageList(list, fl);
                    }
                })
                $scope.partPackageList = function(arr, fl) {
                    var ARR0 = [{ packageName: '课时收费', className: "c999" }, { packageName: '课时报名', custom: true, feeType: 0 }],
                        ARR1 = [{ packageName: '按期收费', className: "c999" }, { packageName: '按期报名', custom: true, feeType: 1 }],
                        ARR2 = [{ packageName: '按月收费', className: "c999" }, { packageName: '按月报名', custom: true, feeType: 2 }];
                    if (Array.isArray(arr) && arr.length !== 0) {
                        angular.forEach(arr, function(item) {
                            if (item.feeType == 0) {
                                ARR0.push(item);
                            }
                            if (item.feeType == 1) {
                                ARR1.push(item);
                            }
                            if (item.feeType == 2) {
                                ARR2.push(item);
                            }
                        })
                    }
                    if ($scope.typeFor) {
                        if (JSON.parse($scope.typeFor) && JSON.parse($scope.typeFor).activityType == 4) ARR2 = []; //拼团不能按月
                    }
                    var initArr = [ARR0, ARR1, ARR2];
                    initArr.sort(function(a, b) {
                        if ((a.length == b.length) || (a.length > 2 && b.length > 2)) {
                            return 0;
                        }
                        return b.length - a.length
                    })
                    if (!$scope.defaultpkg && !fl) {
                        $scope.selectedFn($scope.typeFor ? {
                            n: {
                                data: initArr[0][1],
                                type: JSON.parse($scope.typeFor).type,
                                index: JSON.parse($scope.typeFor).index
                            }
                        } : {
                            n: {
                                data: initArr[0][1]
                            }
                        })
                    }
                    return initArr[0].concat(initArr[1]).concat(initArr[2])
                }
                $scope.selData = $scope.partPackageList(JSON.parse($scope.data ? $scope.data : '[]'));
            }],
            link: function($scope, $element, $attr) {
                //是否禁用
                $scope.$watch('isdisabe', function() {
                        if ($scope.isdisabe == 'true') {
                            $('.mix-button').on("click", function(e) {
                                e.stopPropagation();
                            }).addClass("mixdisabled");
                        } else {
                            $('.mix-button').off("click").on("click", function(e) {}).removeClass("mixdisabled");;
                        }
                    })
                    //阻止双滚动
                $('.mixselul').on("mousewheel", function(e) {
                    e.stopPropagation();
                });

                $('.mixselul').parents('.layui-layer-content').css("cssText", "overflow:visible!important");
            }
        }
    })
    .directive('contentEditable', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                // view -> model
                element.bind('click', function() {
                    if (!attrs.contenteditable) {
                        attrs.$set('contenteditable', 'plaintext-only');
                        element[0].focus();
                    }
                });
                element.bind('keydown', function(e) {
                    if (e.keyCode == '13') {
                        return false
                    }
                });
                element.bind('blur', function() {
                    attrs.$set('contenteditable', false);
                });
                element.bind('input', function() {
                    scope.$apply(function() {
                        ctrl.$setViewValue(element.html());
                    });
                });

                // model -> view
                ctrl.$render = function() {
                    element.html(ctrl.$viewValue);
                };
            }
        };
    })
    .directive('myTd', function() {
        return {
            restrict: "AE",
            scope: {
                myId: "@myId",
                myTr: "@myTr",
                myHead: "@tdHead",
                myList: "@tdList",
            },
            replace: false,
            template: ``,
            controller: (["$scope", "$attrs", "$compile", function($scope, $attrs, $compile) {
                var head = $scope.myHead ? JSON.parse($scope.myHead) : [];
                createTds();

                function createTds() {
                    var $element = $attrs.$$element[0];
                    var html = $scope.myTr;
                    var list = JSON.parse($scope.myList);
                    for (var i = 0, len = list.length; i < len; i++) {
                        for (var j in head) {
                            if (head[j].checked) {
                                if ((list[i].name && list[i].name == head[j].name) || (!list[i].name && list[i].fixed === head[j].fixed)) {
                                    html += list[i].td;
                                }
                            }
                        }
                    }
                    html += '</tr>';
                    var m = $compile(html)($scope.$parent);
                    angular.element($element).append(m);
                }
                $scope.$on($scope.myId, function(e, data) {
                    head = data;
                    $attrs.$$element.empty();
                    createTds();
                });
            }])
        }
    })
    .directive('treeView', function() {
        return {
            restrict: 'E',
            templateUrl: 'treeView.html',
            scope: {
                treeData: '='
            },
            controller: ["$scope", function($scope) {
                $scope.isLeaf = function(item) {
                    return !item.dataBankList || !item.dataBankList.length;
                };
                $scope.toggleExpandStatus = function(item) {
                    item.isExpand = !item.isExpand;
                };
                $scope.selectTree = function(item) {
                    func($scope.treeData);

                    function func(list) {
                        angular.forEach(list, function(v) {
                            v.active = false;
                            if (v.dataBankList) {
                                func(v.dataBankList);
                            }
                        });
                    }
                    item.active = true;
                    $scope.$emit("selectedFiled", item);

                }
            }]
        };
    })
    .directive('kindsearch', function() {
        return {
            scope: {
                myId: '@selectId',
                data: "@listData", //select数据
                infoName: "@selectName", //select初始值
                isinput: "@selectInput", //是否显示搜索下拉
                onClick: "&listClicks", //点击搜索
                keyup: "&listKeyup", //回车/删除键  搜索
            },
            template: '<div class="{{kindSearchClass}}">' +
                '<div class="dropdown">' +
                '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">' +
                '<span class="floLeft">{{kindsearchdata}}</span>' +
                '<span class="caret"></span>' +
                '</button>' +
                '<ul class="dropdown-menu dropList_overflow" role="menu">' +
                '<li role="presentation" ng-repeat="x in searchData" ng-click="changeSelect(x)">' +
                '<a role="menuitem" id="{{adviser.id}}">{{x.name}}</a>' +
                '</li>' +
                '</ul>' +
                '</div>' +
                '<input type="text" class="kindSearchInp" placeholder="{{placeholder}}" ng-model="search" ng-keyup="Enterseacher($event)" />' +
                '<button class="btn icon_common_but_search" ng-click="buttonClick()">' +
                '</button></div>',
            replace: true,
            controller: ["$scope", "$attrs", function($scope, $attrs) {
                if ($scope.isinput == '' || $scope.isinput == true) {
                    $scope.kindSearchClass = 'kindSearch';
                } else if ($scope.isinput == 'false' || $scope.isinput == false) {
                    $scope.kindSearchClass = 'kindSearchNoInput';
                } else {
                    $scope.kindSearchClass = 'kindSearch';
                }
                var searchType = '';
                var d = {
                    value: searchType
                };
                if ($scope.myId && $scope.myId.indexOf('select_potential') != -1) { //有默认值带入
                    $scope.$on($scope.myId, function(evt, searchName) {
                        if (searchName) {
                            $scope.search = searchName;
                        }
                    });
                }

                //监测有无搜索类型数据注入
                $scope.$watch('data', function() {
                    if (!$scope.data) return;
                    if (!$scope.infoName) {
                        searchType = '';
                    } else {
                        searchType = $scope.infoName;
                        d = {
                            value: searchType
                        };
                    }
                    $scope.searchData = getConstantList(JSON.parse($scope.data)); //转化json数据
                    infoplaceholder(d);

                    //点击  切换搜索类型
                    $scope.changeSelect = function(d) {
                        searchType = d.value;
                        infoplaceholder(d);
                        $scope.search = '';
                    };

                    $scope.buttonClick = function() {
                        var x = {
                            'type': searchType,
                            'value': $scope.search
                        };
                        if ($scope.search == '' || $scope.search == null || $scope.search == undefined) {
                            return false;
                        } else {
                            $scope.onClick({
                                n: x
                            });
                        }
                    };
                    //回车/删除
                    $scope.Enterseacher = function(e) {
                        var x = {
                            'type': searchType,
                            'value': $scope.search
                        };
                        var keycode = window.event ? e.keyCode : e.which; //获取按键编码
                        if (keycode == 13) {
                            if ($scope.search == '' || $scope.search == null || $scope.search == undefined) {
                                return false;
                            } else {
                                $scope.keyup({
                                    n: x
                                })
                            }
                        } else if (keycode == 8 && $scope.search === '') {
                            x.type = '';
                            x.value = '';
                            $scope.keyup({
                                n: x
                            })
                        }
                    };
                })

                //点击  执行搜索
                $scope.buttonClick = function() {
                    var x = {
                        'type': searchType,
                        'value': $scope.search
                    };
                    if ($scope.search !== '') {
                        $scope.onClick({
                            n: x
                        });
                    }
                };
                //回车/删除
                $scope.Enterseacher = function(e) {
                    var x = {
                        'type': searchType,
                        'value': $scope.search
                    };
                    var keycode = window.event ? e.keyCode : e.which; //获取按键编码
                    if (keycode == 13 && $scope.search !== '') {
                        $scope.keyup({
                            n: x
                        })
                    } else if (keycode == 8 && $scope.search === '') {
                        $scope.keyup({
                            n: x
                        })
                    }
                };

                function infoplaceholder(x) {
                    $.each($scope.searchData, function(i) {
                        if ($scope.searchData[i].value == x.value) {
                            $scope.placeholder = "请输入" + $scope.searchData[i].name;
                            $scope.kindsearchdata = $scope.searchData[i].name;
                        }
                    });
                }

                //重置
                if (!$scope.$parent.kindSearchOnresetFn) {
                    $scope.$parent.kindSearchOnresetFn = [];
                }
                $scope.$parent.kindSearchOnresetFn.push(function() {
                    if (!$scope.data) {
                        $scope.search = '';
                        searchType = $scope.infoName;
                        return
                    }
                    $scope.search = '';
                    searchType = $scope.infoName;
                    infoplaceholder(d);
                });
                $scope.$parent.kindSearchOnreset = function() {
                    for (var i = 0; i <= $scope.$parent.kindSearchOnresetFn.length; i++) {
                        if ($scope.$parent.kindSearchOnresetFn[i]) {
                            $scope.$parent.kindSearchOnresetFn[i]();
                        }
                    }
                }
                if (!$scope.$parent.kindSearchOnreset_) {
                    $scope.$parent.kindSearchOnreset_ = {};
                }
                $scope.$parent.kindSearchOnreset_[$scope.myId] = function (value) {
                    if (value) {
                        $scope.search = value;
                        searchType = $scope.infoName;
                        return;
                    }
                    if (!$scope.data) {
                        $scope.search = '';
                        searchType = $scope.infoName;
                        return;
                    }
                    $scope.search = '';
                    searchType = $scope.infoName;
                    infoplaceholder(d);
                }
            }]
        }
    })
    .directive('myThead', function() {
        //		'name': '退费合约号', 表格name
        //		'align': 'right',    左对齐OR右对齐
        //		'width': '15%',		 表格宽度
        //		'issort':true,		是否升降排序 true/false
        //		'sort':'down',		默认排序  up/down
        //		'id':1				对应指标的id
        return {
            restrict: "AE",
            scope: {
                myId: "@myId",
                onClick: "&listClicks",
                onChange: "&listChange",
                cheClick: "&cheClicks",
            },
            replace: false,
            template: '<tr>' +
                //              '<th ng-if="Ischeckbox!=true" ng-repeat="x in thList track by $index" width="{{x.width}}" style="padding-right: {{x.paddingRight}}" ng-class="{cursor:x.issort,height42:x.hasRate}" class="thead{{x.align}}" ng-click="sortClick($event,x)">'+
                '<th ng-if="Ischeckbox!=true" ng-repeat="x in thList track by $index" width="{{x.width}}" style="padding-right: {{x.paddingRight}};text-align:{{x.align}} !important;" class="thead{{x.align}}" ng-class="{cursor:x.issort,height42:x.hasRate,leftBorder:x.leftBorder,rightBorder:x.rightBorder}"  ng-click="sortClick($event,x)">' +
                '<div class="common_tab_libtn head-drop drop" ng-show="{{x.hasDrop}}" >' +
                '<i  data-toggle="dropdown" ng-click="stopDrop($event)"><img ng-src="{{x.img}}"/></i>' +
                '<div class="dropdown-menu drop-list">' +
                '<span class="mark"></span>' +
                '<ul>' +
                '<li ng-repeat="y in x.list" ng-click="stopDrop($event)">' +
                '<label class="search_checkbox">' +
                '<input type="checkbox"  class="checkbox-inline labelLeft" ng-model="y.hasSelected" ng-change="changeList(x)">{{y.shopCostTypeName}}' +
                '</label>' +
                '</li>' +
                '</u/>' +
                '</div>' +
                '</div>' +
                //                  '<div  class="head-name">'+
                '{{x.name}}' +
                '<span class="{{updownSort(x.sort)}}" ng-if="x.issort==true"></span>' +
                //                  '</div>'+

                '<div class="thead{{x.align}}" ng-if="x.hasRate">(占比)</div>' +
                '</th>' +
                '<th ng-if="Ischeckbox==true" style="text-align:center;width:50px;" >' +
                '<input type="checkbox" id="checkboxDirect" ng-click="checClick(expression)"  ng-model="expression">' +
                '</th>' +
                '<th ng-if="Ischeckbox==true" ng-repeat="x in thList track by $index" width="{{x.width}}" ng-class="{cursor:x.issort}" class="thead{{x.align}}" ng-click="sortClick($event,x)">' +
                '{{x.name}}' +
                '<span class="{{updownSort(x.sort)}}" ng-if="x.issort==true"></span>' +
                '</th>' +
                '</tr>',
            controller: ["$scope", "$attrs", "$element", "SERVICE", function($scope, $attrs, $element, SERVICE) {
                $scope.$watch('$attrs', function() {
                    a();
                    $scope.sortClick = function($event, x) {
                        var $this = $($event.currentTarget);
                        var att = $this.children('span').attr('class');
                        if (att) {
                            $this.siblings().children('span').attr('class', 'icon_defauitSort');
                            if (att == 'icon_defauitSort') {
                                $this.children('span').attr('class', 'icon_upsort');
                                x.sort = 'asc';
                            } else if (att == 'icon_upsort') {
                                $this.children('span').attr('class', 'icon_downsort');
                                x.sort = 'desc';
                            } else if (att == 'icon_downsort') {
                                $this.children('span').attr('class', 'icon_defauitSort');
                                x.sort = '';
                            } else {
                                $this.children('span').attr('class', 'icon_defauitSort');
                                x.sort = '';
                            }
                            $scope.onClick({ data: x });
                        }
                    }
                    $scope.stopDrop = function(e) {
                        e.stopPropagation();
                        if (e.currentTarget.tagName == 'I') {
                            $(e.currentTarget).next().toggle();
                        }
                    }
                    $scope.changeList = function(x) {
                        console.log(x);
                        $scope.onChange({ data: x });
                    }
                }, true)

                function a() {
                    if ($attrs.myThead) {
                        $scope.thList = JSON.parse($attrs.myThead);
                        console.log($scope.thList);
                        if ($scope.thList != '') {
                            for (var i in $scope.thList) {
                                if ($scope.thList[i].name == 'checkbox') {
                                    $scope.thList.splice(i, 1);
                                    $scope.Ischeckbox = true; //如果true现实复选框
                                } else if ($scope.thList[i].name == '') {
                                    //                                      console.log($scope.thList[i].name)
                                }
                            }
                        }
                    };
                    //如果有checkbox则调用次方法
                    if ($scope.Ischeckbox == true) {
                        $scope.checClick = function(c) {
                                //                          var e = $event.target;
                                //                          var c = e.checked;
                                $scope.cheClick({
                                    data: c
                                })
                            }
                            //重置
                        $scope.$parent.resetCheckboxDir = function(d) {
                            var dom = $element.find('#checkboxDirect');
                            var fpanel = angular.element(dom);
                            if (d) {
                                fpanel.prop("checked", true);
                            } else {
                                fpanel.prop("checked", false);
                            }
                        }
                        SERVICE.THEAD.resetCheckboxDir = function(d) {
                            var dom = $element.find('#checkboxDirect');
                            var fpanel = angular.element(dom);
                            if (d) {
                                fpanel.prop("checked", true);
                            } else {
                                fpanel.prop("checked", false);
                            }
                        }
                    }
                }

                $scope.updownSort = function(n) {
                    var u = 'icon_defauitSort';
                    if (n == 'asc') {
                        u = 'icon_upsort';
                        return u;
                    } else if (n == 'desc') {
                        u = 'icon_downsort';
                        return u;
                    } else if (n == '' || n == false || n == undefined) {
                        u = 'icon_defauitSort';
                        return u;
                    }
                };
                if (!$scope.$parent.reTheadData_) {
                    $scope.$parent.reTheadData_ = {};
                }
                $scope.$parent.reTheadData = function() {
                    a();
                    $scope.$apply();
                }
                $scope.$parent.reTheadData_[$scope.myId] = function() {
                    a();
                    $scope.$apply();
                }
            }]
        }
    })
    .directive('limitNum', [function() { //只允许输入正整数和小数
        return {
            link: function(scope, element) {
                element.attr('onpaste', 'return false');
                element.on('input', function() {
                    if (element.val().length > 1) {
                        if (element.val().charAt(0) == 0) {
                            element.val(element.val().slice(1, element.val().length));
                        }
                    }
                    element.val(element.val().replace(/[^\d.]/g, ''));
                    //                      element.val(element.val().replace(/[^\-?\d.]/g,''));    //正、负、小数点
                })
            }
        }
    }])
    .directive('yznFilter', [function() {
        return {
            //scope:{
            //	model : '=ngModel'
            //},
            //require: "ngModel",
            link: function(scope, element, attrs, ngModel) {

                var attr = attrs.yznFilter;
                if (attr == undefined) return;
                //num:{"min":1,"max":99}
                if (attr.indexOf("num") == 0 || attr == "age" || attr == "percent" ||
                    attr == "numMoreThanZero" || attr == "phone" || attr == "num_" || attr == "staffCode" || attr == "wordNum" || attr == "notNum") {
                    var regex;
                    var min, max;
                    if (attr.indexOf("numMoreThanZero") == 0.00) {
                        min = 1;
                    } else if (attr == "age") {
                        min = 0;
                        max = 99;
                        element.attr("maxlength", 2);
                    } else if (attr == "percent") {
                        min = 0;
                        max = 100;
                        element.attr("maxlength", 3);
                    } else if (attr == "phone") {
                        //regex = /[^1-9]{1}[^0-9]*/g;//只能输正整数
                        //regex = /^1[0-9]{10}$/g;
                        element.attr("maxlength", 11);
                    } else if (attr == "num_") {
                        regex = /[^\d.]/g;
                    } else if (attr.indexOf("num") == 0) {
                        if (attr.indexOf(":") > 0) {
                            var jsonStr = attr.substr(attr.indexOf(":") + 1);
                            var numAttr = JSON.parse(jsonStr);
                            min = numAttr.min;
                            max = numAttr.max;
                        }
                    } else if (attr == "staffCode") {
                        regex = /[^\d|X|x]/g;
                    } else if (attr == "wordNum") {
                        regex = /\W/g;
                    } else if (attr == "notNum") {
                        regex = /[^\a-zA-Z\u4E00-\u9FA5]/g;
                    }

                    if (regex == undefined) {
                        regex = /\D/g;
                    }

                    //采用双向绑定方式来限制input输入是因为angular下使用element.val容易打破双向绑定机制
                    //compositionend时间是表示拼写输入结束
                    element.on('input compositionend', function(value) {
                        var newValue = this.value;

                        //判断是否正在输入，如果正在输入则不处理
                        if (value && value.originalEvent && value.originalEvent.isComposing) {
                            return;
                        }

                        if (newValue == "" || newValue == undefined) return;
                        newValue = this.value.replace(regex, ''); //去掉所有非数字字符
                        //限制浮点，不能以点开头，不能有多个点
                        if (attr == "num_") {
                            var num = 0;
                            for (var i = 0; i < newValue.length; ++i) {
                                var char = newValue.charAt(i);
                                if (char == '.') {
                                    //最多只允许输入两位小数点
                                    if (i + 3 < newValue.length) {
                                        newValue = newValue.substring(0, i + 3);
                                        break
                                    }


                                    num++;
                                    //不能以点开头
                                    if (i == 0) {
                                        newValue = '';
                                        break;
                                    }
                                    //不能输入多个点
                                    if (num > 1) {
                                        newValue = newValue.substring(0, i);
                                        break;
                                    }
                                }
                            }

                        }
                        if (this.value.search(regex) >= 0) {

                        }
                        if (attr == "phone") {
                            if (newValue.length == 1 && newValue != '1') {
                                newValue = 1;
                            }
                        }

                        //限定值范围
                        if (min != undefined) {
                            if (parseInt(newValue) < parseInt(min)) {
                                newValue = min;
                            }
                        }
                        if (max != undefined) {
                            if (parseInt(newValue) > parseInt(max)) {
                                newValue = max;
                            }
                        }

                        if (attrs.ngModel != undefined) {
                            if (attrs.ngModel.indexOf('[') !== -1 || attrs.ngModel.indexOf(']') !== -1) {
                                this.value = newValue;
                            } else {
                                //如果scope找不到，有可能是ng-repeat
                                var splitVars = attrs.ngModel.split(".");

                                var temp = scope;
                                for (var i = 0; i < splitVars.length - 1; ++i) {
                                    temp = temp[splitVars[i]];
                                    if (temp == undefined) {
                                        break;
                                    }
                                }
                                if (temp && temp.hasOwnProperty(splitVars[splitVars.length - 1])) {
                                    //利用angular自身的双向绑定功能
                                    temp[splitVars[splitVars.length - 1]] = newValue;
                                    scope.$apply();
                                }
                            }

                        } else {
                            this.value = newValue;
                        }
                    });
                    element.on('blur', function(value) {
                        var newValue = this.value;
                        if (attr == "phone") {
                            var reg = /^1\d{10}$/;
                            if (!/^1\d{10}$/.test(newValue) && newValue) {
                                layer.msg("请正确填写手机号");
                                return;
                            }
                        }
                    });

                }
            }
        }
    }])
    .directive('repeatFinish', function() {
        return {
            link: function(scope, element, attr) {
                if (scope.$last == true) {
                    scope.$emit('to_course', attr.repeatFinish);
                }
            }
        }
    })
    .directive('countUp', ['$filter', function($filter) { //数字滚动效果options={'separator': ','}  //分隔符默认为逗号
        return {
            restrict: 'A',
            scope: {
                startVal: '=?', //开始的值
                endVal: '=?', //结束的值
                duration: '=?', //动画延迟秒数，默认值是2；
                decimals: '=?', //精确到小数点后几位，默认为0
                reanimateOnClick: '=?',
                filter: '@',
                options: '=?'
            },
            link: function($scope, $el, $attrs) {

                var options = {};

                if ($scope.filter) {
                    var filterFunction = createFilterFunction();
                    options.formattingFn = filterFunction;
                }

                if ($scope.options) {
                    angular.extend(options, $scope.options);
                }

                var countUp = createCountUp($scope.startVal, $scope.endVal, $scope.decimals, $scope.duration);

                function createFilterFunction() {
                    var filterParams = $scope.filter.split(':');
                    var filterName = filterParams.shift();

                    return function(value) {
                        var filterCallParams = [value];
                        Array.prototype.push.apply(filterCallParams, filterParams);
                        value = $filter(filterName).apply(null, filterCallParams);
                        return value;
                    };
                }

                function createCountUp(sta, end, dec, dur) {
                    sta = sta || 0;
                    if (isNaN(sta)) sta = Number(sta.match(/[\d\-\.]+/g).join('')); // strip non-numerical characters
                    end = end || 0;
                    if (isNaN(end)) end = Number(end.match(/[\d\-\.]+/g).join('')); // strip non-numerical characters
                    dur = Number(dur) || 2;
                    dec = Number(dec) || 0;

                    // construct countUp
                    var countUp = new CountUp($el[0], sta, end, dec, dur, options);
                    if (end > 999) {
                        // make easing smoother for large numbers
                        countUp = new CountUp($el[0], sta, end - 100, dec, dur / 2, options);
                    }

                    return countUp;
                }

                function animate() {
                    countUp.reset();
                    if ($scope.endVal > 999) {
                        countUp.start(function() {
                            countUp.update($scope.endVal);
                        });
                    } else {
                        countUp.start();
                    }
                }

                // fire on scroll-spy event, or right away
                if ($attrs.scrollSpyEvent) {
                    // listen for scroll spy event
                    $scope.$on($attrs.scrollSpyEvent, function(event, data) {
                        if (data === $attrs.id) {
                            animate();
                        }
                    });
                } else {
                    animate();
                }

                // re-animate on click
                var reanimateOnClick = angular.isDefined($scope.reanimateOnClick) ? $scope.reanimateOnClick : true;
                if (reanimateOnClick) {
                    $el.on('click', function() {
                        animate();
                    });
                }

                $scope.$watch('endVal', function(newValue, oldValue) {
                    if (newValue === null || newValue === oldValue) {
                        return;
                    }

                    if (countUp !== null) {
                        countUp.update($scope.endVal);
                    } else {
                        countUp = createCountUp($scope.startVal, $scope.endVal, $scope.decimals, $scope.duration);
                        animate();
                    }
                });
            }
        };
    }])
    .directive('whenScrolled', function() {
        return function(scope, elm, attr) {

            // 内层DIV的滚动加载
            var raw = elm[0];
            elm.bind('scroll', function() {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.$apply(attr.whenScrolled);
                }
            });
        };
    })
    .directive('whenScrollwindow', function() {
        return function(scope, elm, attr) {

            // 内层DIV的滚动加载
            var raw = elm[0];
            var $this = elm.closest("#page-content");
            $this.bind('scroll', function() {
                if ($this[0].scrollTop + $this[0].offsetHeight >= $this[0].scrollHeight) {
                    scope.$apply(attr.whenScrollwindow);
                }
            });
        };
    });
    //动态自定义设置筛选的字段
function screen_kindSearch(obj, fn) {
    obj.$watch(obj.kindSearchOnreset_, function() {
        fn();
    })
}