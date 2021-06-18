define(["pagination", "jqFrom", 'importPop', ], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,
            newstart = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化
        init();
        $scope.visitNavJud = 3;
        var classId,
            classRoomonlyId, //班级id
            classNum, //班级座位数
            className, //班级名称
            classcount,
            selectPanduan = true, //班级选择 false  不加载
            panDuan = true,
            mili = 495 / (15 * 60),
            classId = '';
        var initdatetime = function(date) {
            var date = yznDateParse(date);
            var date_time_min = date.getHours() * 60 + date.getMinutes() - 420; //转化为分钟;
            return date_time_min;
        }
        var initWeek = function(date) {
            //		console.log(date);
            var dt = yznDateParse(date);
            var weekDay = [7, 1, 2, 3, 4, 5, 6];
            return weekDay[dt.getDay()]; //返回某个时间是周几
        };
        $scope.parseLeft = function(beginDate) {
            return (initWeek(beginDate) - 1) * 70 + 5;
        };
        $scope.parseHeight = function(beginDate, endDate) {
            return (initdatetime(endDate) - initdatetime(beginDate)) * mili;
        };
        $scope.parseTop = function(beginDate) {
            return initdatetime(beginDate) * mili;
        };

        function init() {
            getList(0);
            $scope.list = [];
            $scope.getDetail = getDetail;
            $scope.class_tab_btn = class_tab_btn; //添加新教室
            $scope.classreset = classreset; //取消弹框
            $scope.addClassRoom = addClassRoom; //添加/编辑确定
            $scope.class_edit = class_edit; //编辑弹框
            $scope.class_delete = class_delete; //侧滑 删除
            $scope.switchVisitNav = switchVisitNav;
            $scope.changeBtn = changeBtn;
            // 初始化菜单&跳转
            var list = [
                { name: "约课设置", tab: 1, post: 173 },
                { name: "积分设置", tab: 2, post: 174 },
                { name: "教室管理", tab: 3, post: 176 },
                { name: "请假设置", tab: 4, post: 175 },
                { name: "周边学校", tab: 5, post: 177 },
                { name: "分享设置", tab: 6, post: 178 },
            ]
            $scope.tabMenu = list.filter(function(item) {
                return checkAuthMenuById(item.post);
            });
        }

        function changeBtn(x) {
            $.hello({
                url: CONFIG.URL + "/api/oa/classroom/updateStatus",
                type: "post",
                data: JSON.stringify({ classRoomId: x.classRoomId, deleted: Number(!Boolean(x.deleted)) }),
                success: function(data) {
                    if (data.status == '200') {
                        getList(newstart);
                    }
                }
            })

        }
        var judge;

        function switchVisitNav(n) {
            switch (n) {
                case 1:
                    $state.go("setManageEdu", { tab: 1 });
                    break;
                case 2:
                    $state.go("setManageEdu", { tab: 2 });
                    break;
                case 3:
                    $state.go("classroom", {});
                    break;
                case 4:
                    $state.go("setManageEdu", { tab: 4 });
                    break;
                case 5:
                    $state.go("nearbySchool", {});
                    break;
                case 6:
                    $state.go("share", {});
                    break;
                default:
                    break;
            }
        }

        function class_tab_btn() { //点击‘新教室按钮’ 弹框出现
            judge = '新增教室';
            $scope.className = '';
            $scope.classNum = '';
            layerOpen('class_shade', '新增教室');
            $scope.shadename = '新增教室';
        }

        function class_edit(x) {
            judge = '编辑教室';
            classRoomonlyId = x.classRoomId;
            $scope.classNum = x.classRoomSeat;
            $scope.className = x.classRoomName;
            $scope.shadename = '编辑教室';
            layerOpen('class_shade', '编辑教室');
        }


        function classreset() { //关闭弹框
            layer.close(dialog);
        }

        function addClassRoom() { //添加/编辑教师
            switch (judge) {
                case '新增教室':
                    //					console.log($scope.classNum);
                    var param = {
                        'classRoomSeat': $scope.classNum,
                        'classRoomName': $scope.className
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/addClassRoom",
                        type: "POST",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == 200) {
                                pagerRender = false;
                                getList(0);
                                $scope.className = '';
                                $scope.classNum = '';
                                layer.close(dialog);
                            }
                        }
                    })
                    break;
                case '编辑教室':
                    var param = {
                        'classRoomId': classRoomonlyId,
                        'classRoomSeat': $scope.classNum,
                        'classRoomName': $scope.className
                    };
                    if ($scope.classNum < 1) {
                        layer.msg('班级人数不正确！');
                        return;
                    };
                    for (var i in param) {
                        if (param[i] == '' || param[i] == undefined) {
                            return;
                        }
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/updateClassRoom",
                        type: "POST",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == 200) {
                                getList(newstart);
                                layer.close(dialog);
                                slideBack();
                            }
                        }
                    })
                    break;
            }
        }
        $scope.$on('reloadClassroom', function() {
            pagerRender = false;
            getList(0);
        });

        function getList(start) {
            var param = {
                start: start || "0",
                count: eachPage,
                pageType: 1,
                deleted: 2
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getClassRoom",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        $scope.list = data.context.items;
                        renderPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }
            })
        }

        function renderPager(total) {
            if (pagerRender)
                return;
            pagerRender = true;
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
                    newstart = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getList(newstart); //回掉
                }
            });
        }

        function getDetail(classRoomId, classRoomName, classRoomSeat, count) {
            panDuan = true;
            slideOut();
            classRoomonlyId = classRoomId;
            className = classRoomName;
            classNum = classRoomSeat;
            classcount = count;
            $scope.Sclassname = classRoomName; //侧滑  教室名称
            $scope.SclassSeat = classRoomSeat; // 侧滑 座位数
            $scope.SclassYong = count; // 侧滑 使用班级数

            var param = {
                'classRoomId': classRoomonlyId,
                'beginTime': Thismonday() + " 00:00:00",
                'endTime': Thissunday() + " 23:59:59",
                'classId': classId
            }
            for (var i in param) {
                if (param[i] === '' || param[i] == undefined) {
                    delete param[i];
                }
            }
            //			console.log(param)
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getClassInfoByClassRoom",
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == "200") {
                        renderDetail(data.context);
                    }
                }
            })
        }
        $scope.addBack = function($event) {
            var x = $($event.target).position(),
                height = $($event.target).height();
            var obj1 = {
                "top": x.top,
                "left": x.left,
                "height": height,
                "type": 1
            };
            var obj2 = {
                "top": x.top,
                "left": x.left,
                "height": height,
                "type": 2
            };
            $scope.classList.push(obj1);
            $scope.classList.push(obj2);
        };
        $scope.removeBack = function() {
            $scope.classList.pop();
            $scope.classList.pop();
        };
        $scope.query = function(x) {
            classId = x;
            getDetail(classRoomonlyId, className, classNum, classcount)
            panDuan = false;
        };

        function renderDetail(context) { //侧滑 班级渲染
            $scope.classList = context.classInfos;
            if (panDuan == true) {
                $scope.selectList = context.classInfoList;
            };
        };
        //删除
        function class_delete(x) {
            layer.confirm('是否删除"' + x.classRoomName + '"教室', {
                title: "确认删除信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 0,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var param = {
                    'classRoomId': x.classRoomId
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/deleteClassRoom",
                    type: "POST",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == 200) {
                            layer.msg('删除成功', {
                                icon: 1
                            })
                            getList(newstart);
                            slideBack();
                        }
                    }
                })
            }, function() {
                layer.closeAll();
            })
        }
    }]

})