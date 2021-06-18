(function() {
    angular.module("myApp", [])
        //circle进度条
        //	<circle my-id="myCircle" my-data="80" my-color="00adc7"></circle>
        .directive('circle', function() {
            return {
                scope: {
                    color: "@myColor",
                    outColor: "@myOut",
                    fontColor: "@myFont",
                    data: "@myData",
                    myId: "@myId",

                },
                restrict: "AE",
                replace: true,
                template: `<div class="circle_out">
	            <div class="circle_in">
	                <div class="circle_in_h"></div>
	                <div class="circle_in_d">{{data}}</div>
	            </div>
	        </div>`,
                controller: ['$scope', '$element', function($scope, $element) {
                    $scope.$watch("data", function() {
                        var inc = $($element[0]).find(".circle_in");
                        var h = $($element[0]).find(".circle_in_h");
                        var d = $($element[0]).find(".circle_in_d");
                        h.css({ height: 0 });
                        inc.css({ background: "#" + $scope.outColor });
                        d.css({
                            color: $scope.data > 40 ? "#fff" : $scope.fontColor
                        });
                        h.css({
                            background: $scope.color,
                        }).animate({
                            height: $scope.data,
                        }, 1500);

                    }, true);
                    $scope.$on($scope.myId, function() {
                        var h = $($element[0]).find(".circle_in_h");
                        h.css({
                            background: "#" + $scope.color,
                            height: 0
                        }).animate({
                            height: $scope.data,
                        }, 1500);
                    });
                }]
            }
        })
        //circle进度条
        //	<ring my-id="myRing" my-data="45" my-color="00adc7" my-width="200" my-height="200"></ring>
        .directive('ring', function() {
            return {
                scope: {
                    width: "@myWidth",
                    height: "@myHeight",
                    color: "@myColor",
                    data: "@myData",
                    myId: "@myId",
                },
                restrict: "AE",
                replace: true,
                template: `<div class="ring">
                <div class="left"></div>
                <div class="right"></div>
                <div class="mask"><span>{{data}}%</span></div>
            </div>`,
                controller: ['$scope', '$element', function($scope, $element) {
                    var num = 0;
                    $scope.$watch("data", function() {
                        var h = $($element[0]);
                        var p_r = $scope.width / 2 + "px";
                        var m = $scope.width * 2 / 3 + "px";
                        num = $scope.data * 3.6;

                        h.css({
                            width: $scope.width,
                            height: $scope.height,
                            background: "#" + $scope.color,
                        });

                        h.find(".mask").css({
                            width: m,
                            height: m,
                            top: ($scope.width / 2 - $scope.width / 3) + "px",
                            left: ($scope.width / 2 - $scope.width / 3) + "px",
                            lineHeight: m
                        });
                        h.find(".right").css({
                            transform: "rotate(0deg)",
                            clip: "rect(0, auto, auto," + p_r + ")"
                        });

                        h.find(".left").css({
                            transform: "rotate(0deg)",
                            clip: "rect(0," + p_r + ", auto, 0)"
                        });
                        if (num <= 180) {
                            h.find('.right').css({ transform: "rotate(" + num + "deg)", transition: "all ease-in-out 2s" });
                        } else {
                            h.find('.right').css({ transform: "rotate(0deg)", background: "#" + $scope.color });
                            h.find('.left').css({ transform: "rotate(" + (num - 180) + "deg)", transition: "all ease-in-out 2s" });
                        }
                    }, true);
                }]
            }
        })

    //table里的小浮层弹框
    .directive('infoPop', function() {
            return {
                scope: {
                    data: "@viewData" //select数据
                },
                template: '<div class="view_remarks" ng-mouseenter="showViewRemarks($event)" ng-mouseleave="hideViewRemarks($event)">' +
                    '<span class="remarks_text">{{m.listen}}</span>' +
                    '<div class="remark_view list" ng-show="isShowPop">' +
                    '<span class="marks  normal"></span>' +
                    '<ul class="course_ul">' +
                    '<li><span class="info_tabel">试听时间 :</span><span class="info_span">{{m.dateTime|yznDate:"yyyy-MM-dd"}}  {{m.beginTime}}-{{m.endTime}}</span></li>' +
                    '<li><span class="info_tabel">课程名称 :</span><span class="info_span">{{m.makeUpArrangingCourseInfo.course.courseName}}</span></li>' +
                    '<li><span class="info_tabel">班&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级 :</span><span class="info_span">{{m.makeUpArrangingCourseInfo.classInfo.className}}</span></li>' +
                    '<li ng-repeat="i in m.makeUpArrangingCourseInfo.firstTeachers"><span class="info_tabel">主教老师 :</span><span class="info_span">{{i.teacherName}}</span></li>' +
                    '<li ng-if="m.makeUpArrangingCourseInfo.secondTeachers.length>0"><span class="info_tabel">助教老师 :</span><span class="info_span separate_list" ng-repeat="i in m.makeUpArrangingCourseInfo.secondTeachers"><span>{{i.teacherName}}</span></span></li>' +
                    //                                      '<li><span class="info_tabel">试听方式 :</span><span class="info_span" ng-if="m.temporaryStudentType==0">排课试听</span><span class="info_span" ng-if="m.temporaryStudentType==3">插班试听</span></li>'+
                    //                                      '<li><span class="info_tabel">试听教室 :</span><span class="info_span">{{m.makeUpArrangingCourseInfo.classRoom.classRoomName}}</span></li>'+
                    '</ul>' +
                    '</div>' +
                    '</div>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('data', function() {
                        $scope.m = JSON.parse($scope.data);
                        $scope.status = $scope.m.auditionRecordStatus;
                        $scope.isShowPop = false;
                        $scope.showViewRemarks = function(e) {
                            if ($scope.status == 0 || $scope.status == 1 || $scope.status == 3) {
                                return;
                            }
                            var $this = $(e.target).closest(".view_remarks"),
                                $parents = $this.closest("tr"),
                                dropHeight = $this.find(".course_ul li").length * 17 + 26;
                            $width = $this.width(),
                                $height = $this.height(),
                                win_height = $(window).height(),
                                offset = $this.offset(),
                                offsetTop = offset.top || 0,
                                offsetLeft = offset.left || 0;
                            if ($parents.find(".remark_view").hasClass("open")) {
                                return;
                            }

                            $scope.isShowPop = true;
                            if (parseInt(offsetTop + dropHeight) > parseInt(win_height)) {
                                $parents.find(".remark_view").css({
                                    top: offsetTop - dropHeight - 15,
                                    left: offsetLeft - 110
                                }).show().addClass("open");

                                $(".remark_view .marks").removeClass("normal").addClass("overBrowser");

                            } else {
                                $parents.find(".remark_view").css({
                                    top: offsetTop + $height,
                                    left: offsetLeft - 110
                                }).show().addClass("open");

                                $(".remark_view .marks").removeClass("overBrowser").addClass("normal");

                            }

                            if (e.stopPropagation) { //如果提供了事件对象，则这是一个非IE浏览器
                                e.stopPropagation();
                            } else {
                                //兼容IE的方式来取消事件冒泡
                                window.event.cancelBubble = true;
                            }
                        };
                        $scope.hideViewRemarks = function(e) {
                            $scope.isShowPop = false;
                            $(e.target).closest("tbody").find(".remark_view").removeClass("open");
                        }
                    })
                }]
            }
        })
        .directive('leaveInfo', function() {
            return {
                scope: {
                    data: "@viewData" //select数据
                },
                template: '<div class="view_remarks leave">' +
                    '<span class="remarks_text">{{status == 0?"待处理":"已处理"}}' +
                    '<span class="clickText" ng-mouseenter="showViewRemarks($event)" ng-mouseleave="hideViewRemarks($event)" ng-if="status == 1">{{status_after == 1?"(已上)":status_after == 0?"(未上)":""}}</span>' +
                    '<span class="clickText" ng-mouseenter="showViewRemarks($event)" ng-mouseleave="hideViewRemarks($event)" ng-if="status == 2">(备注)</span>' +
                    '</span>' +
                    '<div class="remark_view list" ng-show="isShowPop">' +
                    '<span class="marks  normal"></span>' +
                    '<ul class="course_ul" ng-if="status == 1">' +
                    '<li><span class="info_tabel textAlignRt">处理方式 : </span><span class="info_span">插班补课</span></li>' +
                    '<li><span class="info_tabel textAlignRt">课程 : </span><span class="info_span">{{m.makeUpCourse.courseName}}</span></li>' +
                    '<li><span class="info_tabel textAlignRt">班级 : </span><span class="info_span">{{m.makeUpClassInfo.className}}</span></li>' +
                    '<li><span class="info_tabel textAlignRt">上课时间 : </span><span class="info_span">{{m.makeUparrAngingCourses.arrangingCoursesBeginDate | beginEndDate: m.makeUparrAngingCourses.arrangingCoursesEndDate}}</span></li>' +
                    '<li ng-if="status_after == 1"><span class="info_tabel textAlignRt">老师 : </span><span class="info_span" ng-repeat="s in m.makeUpShopTeacherList">{{s.teacherName}};</span></li>' +
                    '</ul>' +
                    '<ul class="course_ul" ng-if="status == 2">' +
                    '<li><span class="info_tabel textAlignRt">处理方式 : </span><span class="info_span">已处理</span></li>' +
                    //                                      '<li><span class="info_tabel textAlignRt">处理人 : </span><span class="info_span">{{m.absentShopTeacherName}}</span></li>'+
                    //                                      '<li><span class="info_tabel textAlignRt">处理时间 : </span><span class="info_span">{{m.absentTeacherDate | yznDate:"yyyy-MM-dd HH:mm"}}</span></li>'+
                    '<li><span class="info_tabel textAlignRt">备注 : </span><span class="info_span">{{m.absentTeacherDesc}}</span></li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('data', function() {
                        $scope.m = JSON.parse($scope.data);
                        $scope.status = $scope.m.bukeStatus;
                        $scope.status_after = $scope.m.makeUparrAngingCourses ? $scope.m.makeUparrAngingCourses.arrangingCoursesStatus : undefined;
                        $scope.isShowPop = false;
                        $scope.showViewRemarks = function(e) {
                            //		                    if($scope.status == 0 || $scope.status == 1 || $scope.status == 3){
                            //		                        return;
                            //		                    }
                            var $this = $(e.target).closest(".view_remarks .clickText"),
                                $parents = $this.closest("tr"),
                                dropHeight = $this.find(".course_ul li").length * 17 + 26;
                            $width = $this.width(),
                                $height = $this.height(),
                                win_height = $(window).height(),
                                offset = $this.offset(),
                                offsetTop = offset.top || 0,
                                offsetLeft = offset.left || 0;
                            if ($parents.find(".remark_view").hasClass("open")) {
                                return;
                            }

                            $scope.isShowPop = true;
                            if (parseInt(offsetTop + dropHeight) > parseInt(win_height)) {
                                $parents.find(".remark_view").css({
                                    top: offsetTop - dropHeight - 15,
                                    left: offsetLeft - 110
                                }).show().addClass("open");

                                $(".remark_view .marks").removeClass("normal").addClass("overBrowser");

                            } else {
                                $parents.find(".remark_view").css({
                                    top: offsetTop + $height,
                                    left: offsetLeft - 110
                                }).show().addClass("open");

                                $(".remark_view .marks").removeClass("overBrowser").addClass("normal");

                            }

                            if (e.stopPropagation) { //如果提供了事件对象，则这是一个非IE浏览器
                                e.stopPropagation();
                            } else {
                                //兼容IE的方式来取消事件冒泡
                                window.event.cancelBubble = true;
                            }
                        };
                        $scope.hideViewRemarks = function(e) {
                            $scope.isShowPop = false;
                            $(e.target).closest("tbody").find(".remark_view").removeClass("open");
                        }
                    })
                }]
            }
        })
        .directive('remarkView', function() {
            return {
                scope: {
                    data: "@viewData"
                },
                template: '<div class="view_remarks" ng-mouseenter="showViewRemarks($event)" ng-mouseleave="hideViewRemarks($event)">' +
                    '<span class="remarks_text">{{data_text}}</span>' +
                    '<div class="remark_view" ng-show="isShowPop"><span class="marks  normal"></span>{{data_text}}</div>' +
                    '</div>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('data', function() {
                        $scope.data_text = $scope.data;
                        $scope.isShowPop = false;

                        $scope.showViewRemarks = function(e) {
                            var $this = $(e.target).closest(".view_remarks"),
                                $parents = $this.closest("tr"),
                                $width = $this.width(),
                                $height = $this.height(),
                                offset = $this.offset(),
                                offsetTop = offset.top || 0,
                                offsetLeft = offset.left || 0;
                            if ($parents.find(".remark_view").hasClass("open")) {
                                return;
                            }
                            //只有显示不下才出提示框
                            if ($scope.data_text && isEllipsis($this.find(".remarks_text").get(0))) {
                                $scope.isShowPop = true;
                            }
                            $parents.find(".remark_view").css({
                                top: offsetTop + $height,
                                left: offsetLeft
                            }).show().addClass("open");

                            if (e.stopPropagation) { //如果提供了事件对象，则这是一个非IE浏览器
                                e.stopPropagation();
                            } else {
                                //兼容IE的方式来取消事件冒泡
                                window.event.cancelBubble = true;
                            }
                        };
                        $scope.hideViewRemarks = function(e) {
                            $scope.isShowPop = false;
                            $(e.target).closest("tbody").find(".remark_view").removeClass("open");
                        }
                    })
                }]
            }
        })
        //按钮上的小弹框
        .directive('btnFloatlay', function() {
            return {
                scope: {
                    data: "@viewData", //select数据
                    num: "@viewNum",
                    onClick: "&viewClick"
                },
                template: '<span class="" ng-mouseenter="showViewRemarks1($event)" ng-mouseleave="hideViewRemarks1($event)" ng-click="openView()">{{data}}<span class="number">({{num}})</span>' +
                    '<div class="remark_view1" ng-show="isShowPop"><span class="marks"></span>{{data}}{{num}}次</div>' +
                    '</span>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('data', function() {
                        $scope.isShowPop = false;
                        $scope.openView = function() {
                            $scope.onClick();
                        }
                        $scope.showViewRemarks1 = function(e) {
                            var $this = $(e.target),
                                $width = $this.width(),
                                $height = $this.height(),
                                offset = $this.offset(),
                                offsetTop = offset.top || 0,
                                offsetLeft = offset.left || 0;
                            if ($this.find(".remark_view1").hasClass("opened")) {
                                return;
                            }
                            $scope.isShowPop = true;
                            $this.find(".remark_view1").css({
                                top: offsetTop + $height + 10,
                                left: offsetLeft
                            }).show().addClass("opened");

                            if (e.stopPropagation) { //如果提供了事件对象，则这是一个非IE浏览器
                                e.stopPropagation();
                            } else {
                                //兼容IE的方式来取消事件冒泡
                                window.event.cancelBubble = true;
                            }
                        };
                        $scope.hideViewRemarks1 = function(e) {
                            $scope.isShowPop = false;
                            $(e.target).closest("tbody").find(".remark_view1").removeClass("opened");
                        }
                    })
                }]
            }
        })
        //操作的下拉按钮
        .directive('btnDrop', function() {
            return {
                scope: {
                    data: "@dropId", //select数据
                    dropTitle: "@dropTitle",
                    list: "@dropList",
                    dataType: "@dropType",
                    hasFather: "@dropFather", //下拉状态特殊背景显示
                    onClick: "&dropClick",
                },
                template: '<span class="dropMark">' +
                    '<span class="spanText" ng-if="showType" ng-click="showViewRemarks2($event)" ng-mouseleave="hideViewRemarks2($event)">{{dropTitle}}' +
                    '<div class="remark_view drop" id="box" ng-show="isShowPop">' +
                    '<span class="marks"></span>' +
                    '<div>' +
                    '<ul class="drop"><li class="drop_li" ng-repeat="n in dataList" ng-click="openPop(n)">{{n.name}}</li></ul>' +
                    '</div>' +
                    '</div>' +
                    '</span>' +
                    '<span class="spanText" ng-if="!showType"  ng-mouseenter="showViewRemarks2($event)" ng-mouseleave="hideViewRemarks2($event)">{{dropTitle}}' +
                    '<div class="remark_view drop" id="box" ng-show="isShowPop">' +
                    '<span class="marks"></span>' +
                    '<div>' +
                    '<ul class="drop"><li class="drop_li" ng-repeat="n in dataList" ng-click="openPop(n)">{{n.name}}</li></ul>' +
                    '</div>' +
                    '</div>' +
                    '</span>' +
                    '</span>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('data', function() {
                        $scope.dataList = JSON.parse($scope.list);
                        $scope.showType = $scope.dataType == "click" ? true : false;
                        $scope.isShowPop = false;

                        $scope.showViewRemarks2 = function(e) {
                            var dropHeight = $scope.dataList.length * 30 + 26;
                            var $this = $(e.target),
                                $parents = $this.closest("tr"),
                                $width = $this.width(),
                                $height = $this.height(),
                                win_height = $(window).height(),
                                offset = $this.offset(),
                                offsetTop = offset.top || 0,
                                offsetLeft = offset.left || 0,
                                dropLeft = offsetLeft - 40;
                            if ($this.find(".remark_view").hasClass("open")) {
                                return;
                            }
                            if ($scope.dataList.length > 0) {
                                $scope.isShowPop = true;
                            } else {
                                $scope.isShowPop = false;
                            }
                            if ($scope.hasFather) {
                                dropLeft = offsetLeft - ($width / 4);
                            }
                            if (parseInt(offsetTop + dropHeight) > parseInt(win_height)) {
                                $this.find(".remark_view").css({
                                    top: offsetTop - dropHeight + 10,
                                    left: dropLeft
                                }).show().addClass("open");
                                $(".remark_view .marks").removeClass("normal").addClass("overBrowser");
                            } else {
                                $this.find(".remark_view").css({
                                    top: offsetTop + $height - 20,
                                    left: dropLeft
                                }).show().addClass("open");
                                $(".remark_view .marks").removeClass("overBrowser").addClass("normal");
                            }
                            if (e.stopPropagation) { //如果提供了事件对象，则这是一个非IE浏览器
                                e.stopPropagation();
                            } else {
                                //兼容IE的方式来取消事件冒泡
                                window.event.cancelBubble = true;
                            }


                        };
                        $scope.hideViewRemarks2 = function(e) {
                            $scope.isShowPop = false;
                            $(e.target).closest("tbody").find(".remark_view").removeClass("open");
                        }
                        $scope.openPop = function(x) {
                            $scope.onClick({
                                m: {
                                    type: x,
                                    item: JSON.parse($scope.data)
                                }
                            });
                        }
                    })
                }]
            }
        })
        //td里单个编辑小弹框
        .directive('remarkEdit', function() {
            return {
                scope: {
                    data: "@editId", //select数据
                    title: "@editTitle",
                    atext: "@editText",
                    length: "@editLength",
                    height: "@editHeight",
                    pheight:"@pHeight",
                    otext: "@editOtext",
                    onClick: "&editClick"
                },
                template: '<div class="edit_remark">' +
                    '<span class="icon_name_edit" data-toggle="dropdown" ng-click="checkPop($event)"></span>' +
                    '<div class="dropdown-menu remark_edit" ng-show="isOpen" style="height:{{pheight?pheight:155}}px !important">' +
                    '<span class="marks"></span>' +
                    '<div class="remark_content">' +
                    '<span class="remark_label">{{title}}</span>' +
                    '<textarea ng-model="atext" maxlength="{{length}}" style="height:{{height}}px !important"></textarea>' +
                    '</div>' +
                    '<div class="remark_btns">' +
                    '<div class="btn cancel" ng-click="popCancel()">取消</div>' +
                    '<div class="btn sure" ng-click="popConfirm()">确认</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('atext', function () {
                        $(".remark_edit").click(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        });
                        var x = {
                            id: $scope.data,
                            value: $scope.atext
                        };
                        $scope.checkPop = function(e) {
                            $scope.isOpen = true;
                            $scope.atext = $scope.otext;
                            var $this = $(e.target),
                                $parents = $this.closest(".edit_remark"),
                                $width = $this.width(),
                                $height = $this.height(),
                                win_height = $(window).height(),
                                offset = $this.offset(),
                                offsetTop = offset.top || 0,
                                offsetLeft = offset.left || 0;
                            var h = parseInt($scope.pheight) || 155;
                            console.log($this.next(".remark_edit"));
                            if (parseInt(offsetTop + h) > parseInt(win_height)) {
                                $(".remark_edit").css({
                                    left: offsetLeft - 145,
                                    top: offsetTop - h-15,
                                });
                                $(".remark_edit .marks").removeClass("normal").addClass("overBrowser");
                            } else {
                                $parents.find(".remark_edit").css({
                                    top: offsetTop + $height + 3,
                                    left: offsetLeft - 140
                                });
                                $(".remark_edit .marks").removeClass("overBrowser").addClass("normal");
                            }
                        }
                        $scope.popConfirm = function() {
                            $scope.onClick({
                                n: x
                            });
                        }
                        $scope.popCancel = function() {
                            $scope.isOpen = false;
                            $(".edit_remark").removeClass("open");
                        }
                    })
                }]
            }
        })
        //td里单个编辑小弹框
        .directive('numEdit', function() {
            return {
                scope: {
                    data: "@editId", //select数据
                    title: "@editTitle",
                    atext: "@editText",
                    onClick: "&editClick"
                },
                template: '<div class="edit_remark" style="position:inherit;top:0;right:0;" ng-click="checkPop($event)">' +
                    '<span class="icon_name_edit" data-toggle="dropdown" ></span>' +
                    '<div class="dropdown-menu remark_edit"style="width:175px;min-height:106px;">' +
                    '<span class="marks" style="left:85%;"></span>' +
                    '<div class="remark_content num_mins_add" style="text-align:right;">' +
                    '<span class="remark_label">{{title}}</span>' +
                    '<span class="icon_num_mins" ng-click="numOperate()" ></span>' +
                    '<input class="form-control num_input" type="text" yzn-filter="num_" ng-model="atext" autocomplete="off"  required>' +
                    '<span class="icon_num_add" ng-click="numOperate(true)" ></span>' +
                    '</div>' +
                    '<div class="remark_btns">' +
                    '<div class="btn sure" ng-click="popConfirm()">确认</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.$watch('atext', function() {
                        $(".remark_edit").click(function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        });

                        var x = {
                            id: $scope.data,
                            value: $scope.atext
                        };
                        $scope.checkPop = function($event) {
                            //							$scope.atext=$scope.otext;
                            var e = $($event.currentTarget),
                                offtot = e.offset().top,
                                offleft = e.offset().left,
                                width = e.width(),
                                initleft = $('#class_pop').offset().left;
                            e.children('.remark_edit').css({
                                'top': offtot - 30,
                                'left': offleft - initleft - 140,
                            });
                            $(".remark_edit .marks").addClass("normal");
                        }
                        $scope.numOperate = function(type) {
                            if (type) {
                                $scope.atext = ($scope.atext * 1 + 0.5).toFixed(2);
                            } else {
                                if ($scope.atext * 1 <= 0) {
                                    return;
                                }
                                $scope.atext = ($scope.atext * 1 - 0.5).toFixed(2);
                                if ($scope.atext <= 0) {
                                    $scope.atext = 0;
                                }
                            }
                        }
                        $scope.popConfirm = function() {
                            $scope.onClick({
                                n: x
                            });
                            $(".edit_remark").removeClass("open");
                        }
                    })
                }]
            }
        })
        //td里单个编辑小弹框
        .directive('searchAge', function() {
            return {
                scope: {
                    myId: "@ageId", //select数据
                    onClick: "&ageClick"
                },
                template: '<div class="age_search">' +
                    '<div class="screen_title" data-toggle="dropdown" ng-click="checkPop($event)"><span ng-class="{headNameColor: judgeHeadNameColor}" >{{headName}}</span><i class="icon_drop_up"></i></div>' +
                    '<div class="dropdown-menu age_drop" ng-show="isOpen">' +
                    '<span class="age_marks"></span>' +
                    '<div class="age_content">' +
                    '<span class="minage" style="margin-right:30px;">最小年龄</span>' +
                    '<span class="maxage clearfix">最大年龄</span>' +
                    '</div>' +
                    '<div class="age_content">' +
                    '<input class="form-control minage" type="text" yzn-filter="age" ng-model="student.minAge" autocomplete="off"  required>' +
                    '<span class="empty"> ~ </span>' +
                    '<input class="form-control maxage clearfix" type="text" yzn-filter="age" ng-model="student.maxAge" autocomplete="off" required>' +
                    '</div>' +
                    '<div class="age_btns">' +
                    '<button class="btn sure" type="submit" ng-click="popConfirm()">确认</button>' +
                    '<button class="btn cancel" type="button" ng-click="popCancel()">取消</button>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
                restrict: "AE",
                replace: true,
                controller: ['$scope', function($scope) {
                    $scope.judgeHeadNameColor = false;
                    $scope.headName = '年龄';
                    $scope.student = {
                        minAge: "",
                        maxAge: ""
                    };
                    $(".age_drop").click(function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });
                    $scope.checkPop = function(e) {
                        $scope.isOpen = true;
                        $scope.student = {
                            minAge: "",
                            maxAge: ""
                        };
                        //							var $this=$(e.target),
                        //							    $parents=$this.closest(".age_search"),
                        //							    $width=$this.width(),
                        //						        $height=$this.height(),
                        //						        win_height = $(window).height(),
                        //							    offset = $this.offset(),
                        //						        offsetTop = offset.top || 0,
                        //						        offsetLeft = offset.left || 0;
                        //						    if(parseInt(offsetTop + 170) > parseInt(win_height)){
                        //								$(".age_drop").css({
                        //						    		left:0,
                        //									top:-170,
                        //								});
                        //								$(".age_drop .marks").removeClass("normal").addClass("overBrowser");
                        //							}else{
                        //							    if($this.closest('.popup_')[0] && !isIE()) {    //判断是否是弹框里面的并且不是ie浏览器
                        //                                  offsetLeft = offsetLeft - $this.closest('.popup_').offset().left;
                        //                                  offsetTop = offsetTop - 30;
                        //                              }
                        //								$parents.find(".age_drop").css({
                        //						    		top:offsetTop+$height,
                        //                                  left:offsetLeft
                        //								});
                        //								$(".age_drop .marks").removeClass("overBrowser").addClass("normal");
                        //							}
                    }
                    $scope.popConfirm = function() {
                        if (($scope.student.minAge == "" || $scope.student.minAge == undefined) && ($scope.student.maxAge == "" || $scope.student.maxAge == undefined)) return layer.msg("请输入年龄");
                        //						    if($scope.student.maxAge=="" || $scope.student.maxAge == undefined) return layer.msg("请输入最大年龄");
                        if ($scope.student.minAge && $scope.student.maxAge && $scope.student.minAge * 1 > $scope.student.maxAge * 1) return layer.msg("请输入正确的年龄");
                        $scope.judgeHeadNameColor = true;
                        if ($scope.student.minAge && !$scope.student.maxAge) {
                            $scope.student.maxAge = "99";
                        }
                        if (!$scope.student.minAge && $scope.student.maxAge) {
                            $scope.student.minAge = "0";
                        }
                        $scope.headName = $scope.student.minAge + " ~ " + $scope.student.maxAge;
                        $scope.onClick({
                            n: $scope.student
                        });
                        $scope.popCancel();
                    }
                    $scope.popCancel = function() {
                        $scope.isOpen = false;
                        $(".age_search").removeClass("open");
                    }

                    function clearAgeInput() {
                        $scope.student = {
                            minAge: "",
                            maxAge: ""
                        };
                    }
                    if (!$scope.$parent.ageSearchOnreset_) {
                        $scope.$parent.ageSearchOnreset_ = {};
                    }
                    $scope.$parent.ageSearchOnreset_[$scope.myId] = function() {
                        $scope.judgeHeadNameColor = false;
                        $scope.headName = '年龄';
                        clearAgeInput();
                    }

                    function isIE() { //ie?
                        if (!!window.ActiveXObject || "ActiveXObject" in window) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                }],
                link: function() {

                    //始终在最顶层显示弹出筛选栏
                    var screen_show = document.getElementsByClassName('age_search');
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
                                $('.screen_point').show();
                                $(this.children[1]).find('.screen_menuitem_con').css({ 'max-height': _v - 120 + 'px' });
                                this.children[1].style.top = _this.offset().top + subTop + scrollTop + 'px';
                            }
                        };
                        //                  $(screen_show[i]).find('.screen_menu')[0].onmousewheel = function(e) { //阻止事件默认
                        //                      e.stopPropagation();
                        //                  };
                        //                  $(screen_show[i]).find('.screen_search')[0].onclick = function(e) { //阻止事件默认
                        //                      e.stopPropagation();
                        //                  };
                    }
                }
            }
        })

})()