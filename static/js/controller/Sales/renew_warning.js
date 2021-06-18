define(["pagination", "mySelect", "courseAndClass_sel", "signUp", "potential_pop", "hopetime", "operation", "addInfos", "students_sel", 'classroomPop'], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', 'SERVICE', '$timeout', function($scope, $rootScope, $http, $state, $stateParams, SERVICE, $timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        var screenStart = 0,
            screenEachPage = localStorage.getItem("screenState") ? localStorage.getItem("screenState") : 10; //页码初始化
        var $course, $adviser, $searchType, $searchName, $orderName = 'total_surplus_time',
            $timeSort = "desc"; //列表筛选字段
        var send_dialog;
        $scope.sc_an_keshi = true;
        $scope.sc_an_tian = false;
        $scope.unRemind = $scope.sc_unRemind = false;
        $scope.$surplusTime = null;
        $scope.screen_course = [];
        init();

        function init() {
            $scope.select_params = []; //已选勾选数据
            getConfig();
            //          listWarnStudentCenterTotal();
            $scope.page = CONSTANT.PAGE.STUDENT;
            getCourse(1);
            getAdviser(); //获取顾问
            $scope.isAllStudent = checkAuthMenuById("19");
            $scope.isRenew = checkAuthMenuById("20");
            $scope.isWarning = checkAuthMenuById("21");
            $scope.SearchData = searchData;
            $scope.Enterkeyup = searchData;
            $scope.closePop = closePop;
            // $scope.deterRenew = deterRenew; //确定预警设置needdel__cz
            // $scope.renewSet = renewSet; //预警设置needdel__cz
            $scope.selCourseList = []; //非预警课程
            SERVICE.COURSEANDCLASS.COURSE['非预警课程'] = deterSelCourse;
            $scope.courseRenew = courseRenew; //续费
            // $scope.delCourse = delCourse; //删除非预警课程needdel__cz
            $scope.caclBirthToAge = caclBirthToAge; //计算年龄
            $scope.selectInfoNameId = 'studentName';
            $scope.searchData = {
                'studentName': '姓名、昵称、联系方式',
                'studentNickName': '昵称',
                'userPhone': '联系方式',
            };
            $scope.renewListHead1 = [
                { name: 'checkbox', width: '50', align: 'center' },
                { name: '姓名(昵称)', width: '13%' },
                { name: '年龄', width: '10%' },
                { name: '联系方式', width: '12%' },
                { name: '课程', width: '14%' },
                { name: '剩余', width: '10%', align: 'center', 'issort': true, 'sort': 'desc', id: 'total_surplus_time' },
                { name: '欠课', width: '10%', align: 'center', 'issort': true, id: 'oweTime' },
                { name: '上次提醒时间', width: '12%' },
                { name: '操作', width: '120', align: 'center', }
            ];
            //筛选栏数据
            $scope.sortCllict = sortCllict; //点击剩余课时排序
            $scope.selectCourse = selectCourse; //课程筛选
            $scope.selectAdviser = selectAdviser; //顾问筛选
            $scope.changeTimes = changeTimes; //负课时筛选
            $scope.changeWarn = changeWarn; //未提醒
            $scope.remind_Pay = remind_Pay; //提醒续费
            $scope.sendRenew = sendRenew; //发送续费
            $scope.onReset = onReset; //重置
            $scope.batchOperate = batchOperate; //批量操作
            $scope.sel_singleFun = checkSingleFun; //选择某一条数据
            getRenewList(0);
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
            $scope.sel_allFun = function(c) {
                checkboxAllFun(c, $scope.renewList, $scope.select_params, 'contractId');
            }
            $scope.export_config = export_config;
        }

        function onReset(s) {
            $course = $adviser = undefined;
            $searchType = undefined;
            $searchName = undefined;
            $orderName = undefined;
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.$surplusTime = undefined;
            $scope.unRemind = false;
            pagerRender = false;
            getRenewList(0);
        }

        function getConfig() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShop",
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        console.log(data.context);
                        $scope.currentShop = data.context;
                    }
                }
            })
        }
        SERVICE.POTENTIALPOP.reloadStudentCourseList = function() {
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
            pagerRender = false;
            getRenewList(0);
        };

        function courseRenew(d) {
            var param = {
                'page': $scope.page,
                'item': d,
                'title': '报名',
                'location': "outside",
                'special': 'renew'
            };
            window.$rootScope.yznOpenPopUp($scope, 'sign-up', 'signUp-popup', '1160px', param);
        }
        // function deterRenew() {needdel__cz
        //     if(!$scope.currentShop.warnTime) {
        //         layer.msg('请输入预警课时');
        //         return;
        //     }
        //     if(!$scope.currentShop.warnDayNum) {
        //         layer.msg('请输入预警天数');
        //         return;
        //     }
        //     var params = {
        //         'warnTime': $scope.currentShop.warnTime,
        //         'warnDayNum': $scope.currentShop.warnDayNum,
        //         'courseList': []
        //     }
        //     angular.forEach($scope.selCourseList, function(val) {
        //         params['courseList'].push({'courseId': val.courseId});
        //     })
        //     window.currentUserInfo.shop.warnTime = $scope.currentShop.warnTime;
        //     window.currentUserInfo.shop.warnDayNum = $scope.currentShop.warnDayNum;
        //     $.hello({
        //         url: CONFIG.URL + "/api/oa/course/updateCourseWarnTimeStatus",
        //         type: "post",
        //         data: JSON.stringify(params),
        //         success: function(res) {
        //             if(res.status == 200) {
        //                 $scope.$emit("renewWarnChange",true);
        //                 layer.msg('设置完成');
        //                 getConfig();
        //                 closePop();
        //             };
        //         }
        //     });
        // }
        // function delCourse(d, ind) {needdel__cz
        //     var isCall = layer.confirm('确认删除  ' + d.courseName + '  ?', {
        //         title: "确认信息",
        //         skin: 'newlayerui layeruiCenter',
        //         closeBtn: 1,
        //         offset: '30px',
        //         move: false,
        //         area: '560px',
        //         btn: ['是', '否'] //按钮
        //     }, function() {
        //         $scope.selCourseList.splice(ind, 1);
        //         $scope.$apply();
        //         layer.close(isCall);
        //     }, function() {
        //         layer.close(isCall);
        //     })
        // }

        function deterSelCourse(d) {
            angular.forEach(d, function(val) {
                var judge = true;
                angular.forEach($scope.selCourseList, function(val_) {
                    if (val.courseId == val_.courseId) {
                        judge = false;
                    }
                })
                if (judge) {
                    $scope.selCourseList.push(val);
                }
            })
        }
        // function renewSet() {needdel__cz
        //     $scope.selCourseList = [];  //非预警课程
        //     getConfig();
        //     getCourse(2);
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
        function closePop() {
            layer.close(dialog);
        }
        //获取课程
        function getCourse(type) {
            var data = { 'pageType': '0' };
            if (type == 2) {
                data['warnTimeStatus'] = '0';
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getCoursesList",
                type: "get",
                data: data,
                success: function(data) {
                    if (data.status == '200') {
                        console.log(data);
                        if (type == 1) {
                            $scope.screen_course = data.context;
                        } else {
                            $scope.selCourseList = data.context;
                        }
                    }
                }
            })
        }
        //获取顾问
        function getAdviser() {
            $.hello({
                url: CONFIG.URL + '/api/oa/shopTeacher/list',
                type: 'get',
                data: { "pageType": "0", "quartersTypeId": "3", "shopTeacherStatus": "1" },
                success: function(data) {
                    if (data.status == "200") {
                        $scope.screen_adviser = data.context;
                        $scope.screen_adviser.unshift({ "teacherName": "无顾问", "shopTeacherId": "0" });
                    }
                }
            });
        }
        //按剩余课时排序
        function sortCllict(data) {
            $timeSort = data.sort;
            $orderName = data.id;
            pagerRender = false;
            getRenewList(0);
        }

        function changeTimes(evt, s) {
            if (evt.target.checked) {
                $scope.$surplusTime = s;
            } else {
                $scope.$surplusTime = null;
            }
            pagerRender = false;
            getRenewList(0);
        }

        function selectCourse(d) {
            pagerRender = false;
            $course = d ? d.courseId : null;
            getRenewList(0);
        }

        function selectAdviser(a) {
            pagerRender = false;
            $adviser = a ? a.shopTeacherId : null;
            getRenewList(0);
        }

        function searchData(d) {
            pagerRender = false;
            $searchType = d ? d.type : null;
            $searchName = d ? d.value : null;
            getRenewList(0);
        }

        function changeWarn(s) {
            pagerRender = false;
            getRenewList(0);

        }
        $scope.$on('renewWarnChange', function(type) {
            $scope.select_params = [];
            $scope.resetCheckboxDir(false);
            if (!type) {
                getRenewList(start);
            } else {
                pagerRender = false;
                getRenewList(0);
            }
        });

        function getRenewList(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                'start': start_,
                'count': eachPage,
                'courseId': $course,
                'oweType': $scope.$surplusTime,
                'searchType': $searchName ? 'appSearchName' : undefined,
                'searchName': $searchName,
                'orderName': $orderName,
                'orderTyp': $timeSort,
                'unRemind': $scope.unRemind ? 1 : undefined
            }
            if ($adviser == "0") {
                params["noOaUser"] = "1";
            } else {
                params["shopTeacherId"] = $adviser;
            }
            for (var i in params) {
                if (params[i] === null) {
                    delete params[i];
                }
            }
            console.log(params);
            $.hello({
                url: CONFIG.URL + "/api/oa/student/listWarnStudentCenter",
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == 200) {
                        $scope.renewList = res.context.items;
                        repeatLists($scope.renewList, $scope.select_params, 'contractId');
                        renewPager(res.context.totalNum);
                    };
                }
            });
        }
        //分页
        function renewPager(total) { //分页
            var len = 0;
            angular.forEach($scope.renewList, function(v) {
                if (v.hasChecked) {
                    len += 1;
                }
            });
            if ($scope.renewList.length > 0 && $scope.renewList.length == len) {
                $scope.resetCheckboxDir(true);
            } else {
                $scope.resetCheckboxDir(false);
            }
            if (pagerRender) {
                return;
            } else {
                pagerRender = true;
            }
            var $M_box3 = $('.renewPage');
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
                    getRenewList(start);
                }
            });

        }

        function remind_Pay(x, isSgl) {
            if (!isSgl) {
                $scope.isSingle = false;
                //去除重复学员
                var arr = [];
                var hash = {};
                for (var i in $scope.select_arr) {
                    if (hash[getAttFun($scope.select_arr[i], "potentialCustomerId")]) {
                        continue;
                    } else {
                        arr.push($scope.select_arr[i]);
                        hash[getAttFun($scope.select_arr[i], "potentialCustomerId")] = true;
                    }
                }
                //已上去除重复学员
                $scope.remindDetail = {
                    name:$scope.select_arr[0].name+" 等"+arr.length+"名学员",
                    lastCourseName: "xxx课程名",
                    // remark: "详情请咨询：" + ($scope.currentShop.shopPhoneList && $scope.currentShop.shopPhoneList.length > 0 ? $scope.currentShop.shopPhoneList[0] : "")
                };
            } else {
                $scope.isSingle = true;
                $scope.remindDetail = x;
                // $scope.remindDetail.remark = "详情请咨询：" + ($scope.currentShop.shopPhoneList && $scope.currentShop.shopPhoneList.length > 0 ? $scope.currentShop.shopPhoneList : "");
            }
            var phone = "";
            if ($scope.currentShop.shopPhoneList && $scope.currentShop.shopPhoneList.length > 0) {
                angular.forEach($scope.currentShop.shopPhoneList, function (x,ind) {
                    phone += x + " ";
                });

            }
            $scope.remindDetail.remark = "详情请咨询：" + phone;
            $scope.sendData = {
                apt_students: [],
                apt_coupons: []
            };
            if (!isSgl) {
                $scope.sendData.apt_students = arr;
            } else {
                $scope.sendData.apt_students.push($scope.remindDetail);
            }
            $scope.isRepeat = false;
            //          $scope.checkClass = checkClass;//班级选择器
            //          $scope.delClass = delClass;//删除已选班级
            //          $scope.checkStudent = checkStudent;//学员选择器
            //          $scope.delStudent = delStudent;//删除已选学员
            $scope.checkCoupons = checkCoupons; //优惠券选择器
            $scope.delCoupon = delCoupon; //删除已选优惠券
            $scope.sendCoupon_confirm = sendCoupon_confirm; //发放优惠券
            $scope.sendCoupon_confirm2 = sendCoupon_confirm2; //发放优惠券
            openPopByDiv("提醒续费", ".remindPop", "660px");
        }

        function sendRenew() {
            if ($scope.sendData.apt_coupons.length > 0) {
                sendCoupon_confirm();
            } else {
                sendRenewFun();
            }

        }

        function sendRenewFun(type) {
            var arr = [];
            if ($scope.isSingle) {
                arr = [{ contractId: $scope.remindDetail.contractId }];
            } else {
                arr = $scope.select_arrId;
            }
            var param = {
                contractList: arr,
                remindDesc: $scope.remindDetail.remark
            };
            if ($scope.sendData.apt_coupons.length > 0) {
                param["objects"] = datalist($scope.sendData.apt_students, "student");
                param["coupons"] = datalist($scope.sendData.apt_coupons, "coupon");
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/student/sendRemind",
                type: "post",
                data: JSON.stringify(param),
                success: function(res) {
                    if (res.status == 200) {
                        closePop();
                        layer.msg('提醒续费成功');
                        $scope.$emit("renewWarnChange", true);
                    };
                }
            });
        }

        function batchOperate() {
            $scope.select_arrId = [];
            $scope.select_arr = [];
            angular.forEach($scope.select_params, function(v) {
                if (v.hasChecked) {
                    $scope.select_arrId.push({ contractId: v.contractId });
                    $scope.select_arr.push(v);
                }
            });
            if ($scope.select_arrId.length <= 0) {
                return layer.msg("请选择续费学员");
            }
            remind_Pay($scope.select_arrId, false);
        }
        $scope.$on("优惠券-添加班级", function(evt, data) {
            angular.forEach(data, function(val) {
                var judge = true;
                angular.forEach($scope.sendData.apt_class, function(val_) {
                    if (val.classId == val_.classId) {
                        judge = false;
                    }
                })
                if (judge) {
                    $scope.sendData.apt_class.push(val);
                }
            })

        });

        $scope.$on("优惠券-添加优惠券", function(evt, data) {
            angular.forEach(data, function(val) {
                var judge = true;
                angular.forEach($scope.sendData.apt_coupons, function(val_) {
                    if (val.couponId == val_.couponId) {
                        judge = false;
                    }
                })
                if (judge) {
                    val.showIns = false;
                    $scope.sendData.apt_coupons.push(val);
                }
            })
            console.log($scope.sendData.apt_coupons);
        });

        function checkCoupons() {
            window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseCoupons', '1060px', { name: "coupons", type: 'checkbox', callBackName: '优惠券-添加优惠券' });
        }

        function delCoupon(x, ind) {
            $scope.sendData.apt_coupons.splice(ind, 1);
        }

        function sendCoupon_confirm() {
            var param = {
                "sendObject": 2, // 券发送对象 1：班级 2：学员
                "objects": datalist($scope.sendData.apt_students, "student"),
                "coupons": datalist($scope.sendData.apt_coupons, "coupon"),
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/coupon/checkCouponSend",
                type: "post",
                data: JSON.stringify(param),
                success: function(res) {
                    if (res.status == 200) {
                        if (res.context.length > 0) {
                            $scope.remindList = res.context;
                            send_dialog = layer.open({
                                type: 1,
                                title: "提示信息",
                                skin: 'layerui', //样式类名
                                closeBtn: 1, //不显示关闭按钮
                                move: false,
                                resize: false,
                                anim: 0,
                                area: '560px',
                                offset: '30px',
                                shadeClose: false, //开启遮罩关闭
                                content: $(".remindMsg")
                            })
                        } else {
                            sendRenewFun();
                        }
                    };
                }
            });
        }

        function sendCoupon_confirm2(type) {
            if ($scope.sendData.apt_coupons.length <= 0) {
                return layer.msg("请添加优惠券！");
            }
            var arr = [];
            if ($scope.isSingle) {
                arr = [{ contractId: $scope.remindDetail.contractId }];
            } else {
                arr = $scope.select_arrId;
            }
            var param = {
                    "contractList": arr,
                    "remindDesc": $scope.remindDetail.remark,
                    "sendObject": 2, // 券发送对象 1：班级 2：学员
                    "objects": datalist($scope.sendData.apt_students, "student"),
                    "coupons": datalist($scope.sendData.apt_coupons, "coupon"),
                    "flag": type == 1 ? "1" : type == 2 ? "2" : undefined,
                }
                //"flag":1// 1：过滤发放 2：重复发放（检查无返回数据可不传）
            $.hello({
                url: CONFIG.URL + "/api/oa/student/sendRemind",
                type: "post",
                data: JSON.stringify(param),
                success: function(res) {
                    if (res.status == 200) {
                        layer.close(send_dialog);
                        closePop();
                        layer.msg('提醒续费成功并发放优惠券成功');
                        $scope.$emit("renewWarnChange", true);
                    };
                }
            });
        }

        function datalist(list, type) {
            var arr = [];
            if (list.length > 0) {
                angular.forEach(list, function(v) {
                    if (type == 'class') {
                        arr.push(v.classId)
                    }
                    if (type == 'student') {
                        arr.push(v.potentialCustomerId)
                    }
                    if (type == 'coupon') {
                        arr.push(v.couponId)
                    }
                });
            }
            return arr;
        }

        function export_config() {
            var token = localStorage.getItem('oa_token');
            var params = {
                'courseId': $course,
                'oweType': $scope.$surplusTime,
                'searchType': $searchName ? 'appSearchName' : undefined,
                'searchName': $searchName,
                'orderName': $orderName,
                'orderTyp': $timeSort,
                'unRemind': $scope.unRemind ? 1 : undefined,
                'token': token
            }
            if ($adviser == "0") {
                params["noOaUser"] = "1";
            } else {
                params["shopTeacherId"] = $adviser;
            }
            for (var i in params) {
                if (params[i] === null || params[i] === "" || params[i] === undefined) {
                    delete params[i];
                }
            }
            window.open(CONFIG.URL + '/api/oa/statistics/exportListWarnStudentCenter?' + $.param(params));
        }
    }]
});