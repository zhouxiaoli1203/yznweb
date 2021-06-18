define(["laydate", "mySelect", "equipPop", 'rollCall', 'arrangePop', 'clsaffairPop', "timePop", 'courseAndClass_sel', "timesel", 'classroomPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var search_courseId, search_classId, search_name, search_type = undefined;
        $scope.searchTime = "";
        $scope.status = null;
        $scope.isShowImg = false;
        $scope.field = CONFIG_FACE_DETECT;
        init();

        function init() {
            getCourseList();
            getClassList();
            //刷脸设备开通状态 0 未申请 1 已申请 2已开通
            //          $scope.judgeSignInState = 0;  
            judgeSignInShow();
            $scope.applyArr = [
                { img: "static/img/edu_signIn_icon1.png", text: '精准识别' },
                { img: "static/img/edu_signIn_icon2.png", text: '拍照推送' },
                { img: "static/img/edu_signIn_icon3.png", text: '签到签退' },
                { img: "static/img/edu_signIn_icon4.png", text: '智能点名' },
                { img: "static/img/edu_signIn_icon5.png", text: '自动消课' },
                { img: "static/img/edu_signIn_icon6.png", text: '考勤通知' },
                { img: "static/img/edu_signIn_icon7.png", text: '语音播报' },
                { img: "static/img/edu_signIn_icon8.png", text: '老师考勤' },
            ];
            $scope.applySignInData = { //提交申请数据
                name: '',
                phone: '',
            }
            $scope.selectInfoNameId = 'studentName'; //select初始值
            //搜索类型
            $scope.kindSearchData = {
                studentName: '姓名、昵称、手机号',
                studentNickName: '昵称',
                userPhone: '手机号'
            };
            $scope.nameListThead1 = [{
                'name': '上课时间',
                'width': '30%'
            }, {
                'name': '课程',
                'width': '30%'
            }, {
                'name': '班级',
                'width': '25%'
            }, {
                'name': '签到人数',
                'width': '15%'
            }];
            $scope.nameListThead2 = [{
                'name': '姓名(昵称)',
                'width': '30%'
            }, {
                'name': '联系方式',
                'width': '15%'
            }, {
                'name': '打卡时间',
                'width': '20%'
            }, {
                'name': '状态',
                'width': '25%'
            }, {
                'name': '操作',
                'width': '120',
                'align': 'center'
            }];
            $scope.operateSign = checkAuthMenuById("103"); //操作约课
            $scope.btn_apply = btn_apply; //按钮点击
            // $scope.confirm_set = confirm_set; //点名设置确认needdel__cz
            $scope.onReset = onReset;
            $scope.changeCourse = changeCourse; //按课程筛选
            $scope.changeClass = changeClass; //按班级筛选
            $scope.Enterkeyup = searchdata;
            $scope.SearchData = searchdata;
            $scope.changeByStatus = changeByStatus;
            $scope.viewImg = viewImg; //查看照片
            $scope.changeSet = changeSet; //切换点名设置
            $scope.switchStudNav = switchStudNav;
            $scope.selectCourse = selectCourse;
            $scope.closePopup = function() {
                layer.close(dialog);
            }
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    pagerRender = false;
                    getSignInList(0);
                }
            });
            $scope.goCommonPop = function(el, id, width, data) {
                    window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                }
                //          getSignInList(0);
        }

        function selectCourse(n) {
            console.log(n);
        }

        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/studentAttendanceRules/signSetting",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.shop = data.context;
                        $scope.config = $scope.shop.shop.config;
                        angular.forEach($scope.shop.studentAttendanceRulesList, function(v) {
                            if (v.rulesType == "0") {
                                $scope.workList.push(v);
                            } else {
                                $scope.weekList.push(v);

                            }
                        });
                    }
                }
            })
        }
        //获取课程列表
        function getCourseList() {
            var p = {
                'pageType': 0,
                'courseStatus': 1,
                'courseType': 0
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        var list = [];
                        angular.forEach(data.context, function(v) {
                            if (v.courseType == 0) {
                                list.push(v);
                            }
                        });
                        $scope.screen_course = list;

                    }
                }
            });
        }
        //获取班级列表
        function getClassList(id) {
            var p = {
                pageType: "0",
            };
            if (id) {
                p["courseId"] = id;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/class/list",
                type: "get",
                data: p,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_class = data.context;
                    }
                }
            });
        }

        function changeSet() {
            if (($scope.field) & ($scope.config)) {
                $scope.config = $scope.config & (~($scope.field)); //禁用
            } else {
                $scope.config = $scope.config | ($scope.field); //启用
            }
        }
        $scope.$watch('config', function() {
            $scope.change_confirm = ($scope.field) & ($scope.config) ? true : false;
        });

        function switchStudNav(n) {
            $scope.studNavJud = n;
            onReset();
        }

        function onReset() {
            $scope.todaySignInlist = $scope.signInlist = [];
            start = 0;
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10;
            $scope.status = null;
            search_courseId = search_classId = search_name = search_type = undefined;
            $scope.searchTime = "";
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            getClassList(search_courseId);
            pagerRender = false;
            if ($scope.studNavJud == 1) {
                getTodaySignInList(0);
            } else {
                getSignInList(0);
            }
        }

        function changeCourse(c) {
            search_courseId = c == null ? undefined : c.courseId;
            pagerRender = false;
            if ($scope.studNavJud == 1) {
                $scope.screen_goReset['班级']('');
                getClassList(search_courseId);
            }
            getTodaySignInList(0);
        }

        function changeClass(c) {
            search_classId = c == null ? undefined : c.classId;
            pagerRender = false;
            getTodaySignInList(0);
        }

        function searchdata(n) {
            search_name = n.value;
            search_type = n.type;
            pagerRender = false;
            getSignInList(0);
        }

        function changeByStatus(e, t) {
            $scope.status = e.target.checked ? t : undefined;
            pagerRender = false;
            getSignInList(0);
        }
        //判断刷脸是否开通了
        function judgeSignInShow() {
            $.hello({
                url: CONFIG.URL + "/api/oa/face/getApplyStatus",
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        console.log(res);
                        $scope.judgeSignInState = res.context.faceDeviceStatus;
                        if ($scope.judgeSignInState == 2) {
                            $scope.studNavJud = 1;
                            pagerRender = false;
                            getTodaySignInList(0);
                        }
                    };
                }
            });
        }

        function btn_apply(type) {
            switch (type) { //提交申请
                case 1:
                    window.$rootScope.yznOpenPopUp($scope, "equip-pop", "equip_popup", "960px", { page: "签到记录" });
                    break;
                case 2: //功能介绍
                    break;
                    // case 3: //点名设置needdel__cz
                    //     setInit();
                    //     openPopByDiv('学员考勤设置', '#rollCall_set', '860px');
                    //     break;
                default:
                    break;
            }
        }

        // function setInit() {needdel__cz
        //     $scope.workList = [];
        //     $scope.weekList = [];

        //     getConfig(); //获取设置数据
        //     $scope.selTimeFrame = selTimeFrame;
        //     $scope.changeStatus = changeStatus;
        //     $scope.addTime = addTime; //新增时间段
        //     $scope.deleteItem = deleteItem; //删除时间段
        //     function selTimeFrame(d, evt, type) {
        //         laydate.render({
        //             elem: evt.target, //指定元素
        //             isRange: false,
        //             type: "time",
        //             format: 'HH:mm',
        //             //                  btns:['clear', 'confirm'],
        //             done: function(value, value2) {
        //                 switch (type) {
        //                     case 1:
        //                         d.signInBeginTime = value;
        //                         break;
        //                     case 2:
        //                         d.signInEndTime = value;
        //                         break;
        //                     case 3:
        //                         d.signBackBeginTime = value;
        //                         break;
        //                     case 4:
        //                         d.signBackEndTime = value;
        //                         break;
        //                     default:
        //                         break;
        //                 }
        //             },
        //             ready: function formatminutes() {
        //                 $($(".laydate-time-list li ol")[2]).find("li").remove(); //清空秒
        //             }
        //         });
        //     }

        //     function changeStatus(x) {
        //         x.signBackStatus = x.signBackStatus == "1" ? "0" : "1";
        //     }

        //     function addTime(t) {
        //         var obj = {
        //             rulesName: "",
        //             signInBeginTime: undefined,
        //             signInEndTime: undefined,
        //             signBackStatus: "0",
        //             signBackBeginTime: undefined,
        //             signBackEndTime: undefined,
        //         };
        //         if (t === 1) {
        //             obj["rulesType"] = "0";
        //             $scope.workList.push(obj);
        //         } else {
        //             obj["rulesType"] = "1";
        //             $scope.weekList.push(obj);
        //         }
        //     }

        //     function deleteItem(list, ind) {
        //         list.splice(ind, 1);
        //     }
        // }

        // function confirm_set() {needdel__cz
        //     var obj1 = checkTimes($scope.workList, "work");
        //     if (!obj1[0]) {
        //         return layer.msg(obj1[1]);
        //     }
        //     var obj2 = checkTimes($scope.weekList, "week");
        //     if (!obj2[0]) {
        //         return layer.msg(obj2[1]);
        //     }
        //     var list = $scope.workList.concat($scope.weekList);
        //     var params = {
        //         config: $scope.config,
        //         studentAttendanceRulesList: angular.copy(list)
        //     };

        //     $.hello({
        //         url: CONFIG.URL + "/api/oa/studentAttendanceRules/update",
        //         type: "post",
        //         data: JSON.stringify(params),
        //         success: function(res) {
        //             if (res.status == 200) {
        //                 layer.msg('设置成功！');
        //                 window.currentUserInfo.shop.config = $scope.config;
        //                 layer.close(dialog);
        //             };
        //         }
        //     });
        // }

        // function checkTimes(l1, type) {needdel__cz
        //     var msg = type == "work" ? "周一到周五考勤时间段有重叠！" : "周六周日考勤时间段有重叠！";

        //     var flag = false;
        //     for (var i = 0, len = l1.length; i < len; i++) {
        //         if (l1[i].signInEndTime <= l1[i].signInBeginTime || (l1[i].signBackStatus == "1" && l1[i].signBackEndTime <= l1[i].signBackBeginTime)) {
        //             msg = "同一考勤时段内的结束时间要大于开始时间!";
        //             flag = true;
        //             break;
        //         }
        //         if (l1[i].signBackStatus == "1" && l1[i].signBackBeginTime < l1[i].signInEndTime) {
        //             msg = "签退开始时间不能小于签到结束时间!";
        //             flag = true;
        //             break;
        //         }
        //         //              if(l1[i].signBackStatus=="1" && check(l1[i].signInBeginTime,l1[i].signInEndTime,l1[i].signBackBeginTime,l1[i].signBackEndTime)){
        //         //                  flag = true;
        //         //                  break;
        //         //              }
        //         var flag_ = false;
        //         for (var j = i + 1, len_j = l1.length; j < len_j; j++) {
        //             if (check(l1[i].signInBeginTime, l1[i].signInEndTime, l1[j].signInBeginTime, l1[j].signInEndTime)) {
        //                 flag_ = true;
        //                 break;
        //             }
        //             if (l1[j].signBackStatus == "1" && check(l1[i].signInBeginTime, l1[i].signInEndTime, l1[j].signBackBeginTime, l1[j].signBackEndTime)) {
        //                 flag_ = true;
        //                 break;
        //             }
        //             if (l1[i].signBackStatus == "1" && check(l1[i].signBackBeginTime, l1[i].signBackEndTime, l1[j].signInBeginTime, l1[j].signInEndTime)) {
        //                 flag_ = true;
        //                 break;
        //             }
        //             if (l1[i].signBackStatus == "1" && l1[j].signBackStatus == "1" && check(l1[i].signBackBeginTime, l1[i].signBackEndTime, l1[j].signBackBeginTime, l1[j].signBackEndTime)) {
        //                 flag_ = true;
        //                 break;
        //             }
        //         }
        //         if (flag_) {
        //             flag = true;
        //             break;
        //         } else {
        //             flag = false;
        //         }
        //     }

        //     if (flag) {
        //         return [false, msg];
        //     } else {
        //         return [true];
        //     }
        // }

        function check(a, b, x, y) {
            if (y <= a || b <= x) {
                return false;
            } else {
                return true;
            }
        }
        $scope.$on('changeSigninStatus', function() {
            judgeSignInShow();
        });
        $scope.$on("reloadSignIn", function() {
            pagerRender = false;
            getTodaySignInList(0);
        });

        function getTodaySignInList(start) { //获取请假补课列表信息
            var data = {
                "start": start.toString(),
                "count": eachPage,
                "courseId": search_courseId,
                "classId": search_classId,
                'beginTime': yznDateFormatYMd(new Date()) + " 00:00:00",
                "endTime": yznDateFormatYMd(new Date()) + " 23:59:59",
            }
            $.hello({
                url: CONFIG.URL + '/api/oa/face/listSignInArrangingCourse',
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.todaySignInlist = data.context.items;
                        leavePager(data.context.totalNum);
                    }

                }
            })
        }

        function getSignInList(start) { //获取请假补课列表信息
            var data = {
                "start": start.toString(),
                "count": eachPage,
                'searchType': search_name ? 'appSearchName' : undefined,
                "searchName": search_name,
                "courseId": search_courseId,
                "type": $scope.status
            }
            if ($scope.studNavJud == 1) {
                data["beginTime"] = yznDateFormatYMd(new Date()) + " 00:00:00";
                data["endTime"] = yznDateFormatYMd(new Date()) + " 23:59:59";
            } else {
                if ($scope.searchTime) {
                    data["beginTime"] = $scope.searchTime.split(" 到 ")[0] + " 00:00:00";
                    data["endTime"] = $scope.searchTime.split(" 到 ")[1] + " 23:59:59";
                }
            }
            console.log(data);
            $.hello({
                url: CONFIG.URL + '/api/oa/face/getSignList',
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        $scope.signInlist = data.context.items;
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
                    if ($scope.studNavJud == 1) {
                        getTodaySignInList(start);
                    } else {
                        getSignInList(start);
                    }
                }
            });

        }

        function viewImg(x) {
            if (x.pictureUrl) {
                $scope.picture = x.pictureUrl;
                $timeout(function() {
                    $scope.isShowImg = true;
                }, 100);
            }
        }
    }]
})