define(['laydate', 'pagination', 'mySelect', 'courseAndClass_sel'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', function($scope, $rootScope, $http, $state, $stateParams, SERVICE) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_type, search_name, search_courseId, search_classId = undefined;
        $scope.searchTime = "";
        var search_orderName = "arrangingCourses_begin_date";
        var search_orderTyp = "asc";
        init();

        function init() {
            getCourseList();
            getClassList();
            $scope.studNavJud = 1;
            //表头
            $scope.classListThead = [{
                'name': '上课时间',
                'width': '270',
                'issort': true,
                'sort': 'asc'
            }, {
                'name': '班级',
                'width': '15%'
            }, {
                'name': '课程',
                'width': '15%'
            }, {
                'name': '教室',
                'width': '15%'
            }, {
                'name': '上课主题',
                'width': '15%'
            }, {
                'name': '预警人数',
                'width': '11%',
                'align': 'right'
            }, {
                'name': '在课人数',
                'width': '10%',
                'align': 'right'
            }, {
                'name': '操作',
                'align': 'center',
                'width': '140'
            }, ];

            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getClassWarnList(0);
                }
            });
            $scope.operateBook = checkAuthMenuById("84"); //操作约课
            $scope.switchStudNav = switchStudNav; //切换tab页
            $scope.courseSelect = courseSelect; //选择课程
            $scope.classSelect = classSelect; //选择班级
            $scope.sortCllict = sortCllict; //上课时间排序
            $scope.onReset = onReset; //重置
            $scope.closePop = closePop; //关闭弹框
            $scope.deletePaike = deletePaike; //删除排课
            // $scope.renewSet = renewSet; //预警设置needdel__cz
            // $scope.delCourse = delCourse; //删除预警班级needdel__cz
            // $scope.deterRenew = deterRenew; //预警设置确认needdel__cz
            // SERVICE.COURSEANDCLASS.CLASS['预警班级'] = deterSelCourse;needdel__cz
            getClassWarnList(0);

        }

        function getCourseList() { //获取课程信息
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: { pageType: 0 },
                success: function(data) {
                    if (data.status == '200') {
                        var arr = [],
                            arr1 = [];
                        angular.forEach(data.context, function(v) {
                            if (v.courseType == 0) {
                                arr.push(v);
                            }
                        });
                        $scope.courseList = arr;
                    }

                }
            })
        }

        function getClassList(d) {
            var p = {
                pageType: "0",
                classStatus: "1",
                activityStatus: 0,
            };
            if (d) {
                p["courseId"] = d;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.classList = data.context;
                    }
                }
            });
        }

        function closePop() {
            layer.close(dialog);
        }

        function switchStudNav(n) {
            $scope.studNavJud = n;
            search_type = search_name = search_courseId = search_classId = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (n == 1) {
                $state.go("edu_aboutClass", {});
            } else {
                $state.go("edu_aboutClass/record", {});
            }
        }

        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            getClassList(search_courseId);
            pagerRender = false;
            getClassWarnList(0);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            pagerRender = false;
            getClassWarnList(0);
        }

        function sortCllict(data) {
            console.log(data.sort + '--');
            search_orderTyp = data.sort;
            pagerRender = false;
            getClassWarnList(0);
        }

        function onReset() {
            search_type = search_name = search_courseId = search_classId = undefined;
            $scope.searchTime = "";
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            getClassList(search_courseId);
            pagerRender = false;
            getClassWarnList(0);
        }
        //      $scope.$on("classChange",function(evt,isOldPage){
        //          if(isOldPage){
        //              getClassWarnList(start);
        //          }else{
        //              pagerRender = false;
        //              getClassWarnList(0);
        //          }
        //      });
        function getClassWarnList(start_) { //获取请假补课列表信息
            start = start_ == 0 ? "0" : start_;
            var data = {
                "start": start_.toString(),
                "count": eachPage,
                'searchType': search_type,
                "searchName": search_name,
                "orderName": search_orderName,
                "orderTyp": search_orderTyp,
                "courseId": search_courseId,
                "classId": search_classId,
            }
            if ($scope.searchTime) {
                data["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                data["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + "/api/oa/lesson/oaBookingArrangingCourseList",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.yuekeList = data.context.items;
                        leavePager(data.context.totalNum);
                    }

                }
            })
        }

        function leavePager(total) { //分页
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
            var $M_box3 = $('.M-box3');

            $M_box3.pagination({
                totalData: total || 0, // 数据总条数
                showData: eachPage, // 显示几条数据
                jump: true,
                coping: true,
                count: 2, // 当前页前后分页个数
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页',
                callback: function(api) {
                    if (api.getCurrentEach() != eachPage) { //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getClassWarnList(start); //回调
                }
            });

        }

        function deletePaike(x) {
            var isDelect = layer.confirm('排课删除后学员约课记录将被取消，删除后无法还原，确认删除？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var p = {
                    "arrangingCourses": [{
                        "arrangingCoursesId": x.arrangingCoursesId
                    }]
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/lesson/deleteArrangingCoursesInfo",
                    type: "post",
                    data: JSON.stringify(p),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.close(isDelect);
                            pagerRender = false;
                            getClassWarnList(0);
                        }

                    }
                })

            }, function() {
                layer.close(isDelect);
            })
        }

        // function renewSet() {needdel__cz
        //     $scope.selClassList = []; //非预警课程
        //     getClass();
        //     //          $scope.bookingTime = 5;
        //     //          $scope.bookingPercent = 40;
        //     $scope.bookingTime = window.currentUserInfo.shop.bookingTime;
        //     $scope.bookingPercent = window.currentUserInfo.shop.bookingPercent;
        //     dialog = layer.open({
        //         type: 1,
        //         title: '预警设置',
        //         skin: 'layerui', //样式类名
        //         closeBtn: 1, //不显示关闭按钮
        //         move: false,
        //         anim: 0,
        //         area: '760px',
        //         offset: '30px',
        //         shadeClose: false, //开启遮罩关闭
        //         content: $('#renew_set')
        //     })
        // }

        // function getClass() {needdel__cz
        //     $.hello({
        //         url: CONFIG.URL + "/api/oa/class/list",
        //         type: "get",
        //         data: { bookingStatus: 1, pageType: 0, classStatus: 1 },
        //         success: function(data) {
        //             if (data.status == '200') {
        //                 $scope.selClassList = data.context;
        //             }

        //         }
        //     })
        // }

        // function delCourse(d, ind) {needdel__cz
        //     var isCall = layer.confirm('确认删除  ' + d.className + '  ?', {
        //         title: "确认信息",
        //         skin: 'newlayerui layeruiCenter',
        //         closeBtn: 1,
        //         offset: '30px',
        //         move: false,
        //         area: '560px',
        //         btn: ['是', '否'] //按钮
        //     }, function() {
        //         $scope.selClassList.splice(ind, 1);
        //         $scope.$apply();
        //         layer.close(isCall);
        //     }, function() {
        //         layer.close(isCall);
        //     })
        // }

        // function deterSelCourse(d) {needdel__cz
        //     angular.forEach(d, function(val) {
        //         var judge = true;
        //         angular.forEach($scope.selClassList, function(val_) {
        //             if (val.classId == val_.classId) {
        //                 judge = false;
        //             }
        //         })
        //         if (judge) {
        //             $scope.selClassList.push(val);
        //         }
        //     })
        //     console.log($scope.selClassList);
        // }

        // function deterRenew() {needdel__cz
        //     if (!(/(^[1-9]{1}[0-9]*$)|(^[0-9]*\.[0-9]{2}$)/.test($scope.bookingTime))) {
        //         return layer.msg("上课前小时数为正数或最多保留两位小数");
        //     }
        //     //          if(getArr().length<=0)return layer.msg("请选择约课班级");
        //     window.currentUserInfo.shop.bookingTime = $scope.bookingTime;
        //     window.currentUserInfo.shop.bookingPercent = $scope.bookingPercent;
        //     var params = {
        //         "bookingTime": $scope.bookingTime,
        //         "bookingPercent": $scope.bookingPercent,
        //         "classInfos": getArr()
        //     };
        //     $.hello({
        //         url: CONFIG.URL + "/api/oa/class/updateBookingWarnTimeStatus",
        //         type: "post",
        //         data: JSON.stringify(params),
        //         success: function(data) {
        //             if (data.status == '200') {
        //                 closePop();
        //                 pagerRender = false;
        //                 getClassWarnList(0);
        //             }

        //         }
        //     })
        // }

        // function getArr() {needdel__cz
        //     var arr = [];
        //     angular.forEach($scope.selClassList, function(v) {
        //         arr.push({
        //             "classId": v.classId
        //         });
        //     });
        //     return arr;
        // }
    }]
})