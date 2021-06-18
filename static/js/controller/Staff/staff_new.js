define(['MyUtils', 'jqFrom', 'laydate', 'pagination', 'mySelect', 'staffPop', 'szpUtil'], function(MyUtils, jqFrom, laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$timeout', function($scope, $rootScope, $http, $state, $stateParams,$timeout) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 5; //页码初始化
        var searchType, searchName, quartersId;
        $scope.staff_in = true, $scope.staff_out = false; //筛选项初始化
        if (!checkAuthMenuById("51") && !checkAuthMenuById("52")) {
            $state.go("post", {});
            return;
        }
        init();

        function init() {
            $scope.studNavJud = 1;
            getType(); //获取岗位类型，也就是身份
            $scope.selectInfoNameId = 'teacherName'; //select初始值
            $scope.kindSearchData = {
                teacherName: '姓名、联系方式、工号',
                teacherPhone: '联系方式',
                workId: '工号'
            };
            //表头
            $scope.nameListThead = [
                { 'name': '头像', 'width': '10%', 'align': 'center' },
                { 'name': '姓名', 'width': '10%' },
                { 'name': '工号', 'width': '10%' },
                { 'name': '联系方式', 'width': '14%' },
                { 'name': '入职时间', 'width': '14%' },
                { 'name': '岗位名称', 'width': '16%' },
                { 'name': '工作性质', 'width': '10%' },
                { 'name': '在职状态', 'width': '10%' },
                { 'name': '操作', 'width': '10%', 'align': 'center' },
            ];
            $scope.isOperate = checkAuthMenuById("52"); //操作员工
            $scope.switchStudNav = switchStudNav; //切换tab
            $scope.SearchData = SearchData; //按钮筛选
            $scope.Enterkeyup = Enterkeyup; //输入框筛选
            $scope.setQuarterNull = setQuarterNull; //身份筛选
            $scope.changeStatus_in = changeStatus_in; //切换在职
            $scope.changeStatus_out = changeStatus_out; //切换离职
            $scope.changeTeachStatus = changeTeachStatus; //切换员工咋在职状态
            $scope.upload_staff = upload_staff; //员工导入
            $scope.staffAdd_btn = staffAdd_btn; //新增员工
            $scope.onReset = onReset; //重置按钮
            $scope.delStaff = function(data) { //删除员工
                var isConfirm = layer.confirm('确认删除该员工？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['确定', '取消'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/shopTeacher/delete",
                        type: "post",
                        data: JSON.stringify({ shopTeacherId: data.shopTeacherId }),
                        success: function(data) {
                            if (data.status == 200) {
                                pagerRender = false;
                                getTableList(0);
                                layer.close(isConfirm);
                            }
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })
            }
            getTableList(0);
            if ($scope.$stateParams.screenValue.name == "globalsearch") {
                $timeout(function () {
                    if ($scope.$stateParams.screenValue.pop == "新增员工") {
                        staffAdd_btn();
                    }
                 })
            }
            $scope.goCommonPop = function(el, id, width, data) {
                window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
            }
        }

        function switchStudNav(n) {
            if (n == 1) {
                $state.go("staff_new", {});
            } else if (n == 2) {
                $state.go("post", {});
            }
        }
        $scope.$on("changeStaff", function(evt, startPage) {
            if (startPage) {
                getTableList(start);
            } else {
                pagerRender = false;
                getTableList(0);
            }
        });

        function getType() { //获取岗位类型list
            $.hello({
                url: CONFIG.URL + "/api/oa/auth/list",
                type: "get",
                data: { pageType: "0" },
                success: function(data) {
                    if (data.status == 200) {
                        $scope.screen_type = data.context;
                        console.log(data.context);
                    }
                }
            })
        }

        function onReset() {
            searchType = searchName = quartersId = undefined;
            $scope.staff_in = true, $scope.staff_out = false;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset(); //调取app重置方法
            pagerRender = false; //分页重新加载
            getTableList(0);
        }
        //按钮搜索
        function SearchData(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getTableList(0);
        }

        function Enterkeyup(data) {
            searchName = data.value;
            searchType = data.type;
            pagerRender = false;
            getTableList(0);
        }

        function setQuarterNull(type) {
            if (type == null) {
                quartersId = undefined;
            } else {
                quartersId = type.quartersId;
            }
            pagerRender = false;
            getTableList(0);
        }

        function changeStatus_in() {
            if ($scope.staff_in) {
                $scope.staff_out = false;
            }
            pagerRender = false;
            getTableList(0);
        }

        function changeStatus_out() {
            if ($scope.staff_out) {
                $scope.staff_in = false;
            }
            pagerRender = false;
            getTableList(0);
        }

        function changeTeachStatus(x) {
            console.log(x.shopTeacherStatus);
            if (x.shopTeacherStatus == "1") {
                var isConfirm = layer.confirm('请及时将本员工的名单、潜客、班级、未上课程及时交接；</br>操作离职后该账号不能登录本系统！', {
                    title: "确认离职",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['确认', '取消'] //按钮
                }, function() {
                    $.hello({
                        url: CONFIG.URL + "/api/oa/shopTeacher/update",
                        type: "POST",
                        data: JSON.stringify({
                            'shopTeacherId': x.shopTeacherId,
                            'shopTeacherStatus': '2'
                        }),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('员工已离职', {
                                    icon: 1
                                });
                                pagerRender = false;
                                getTableList(0);
                            };
                        }
                    })
                }, function() {
                    layer.close(isConfirm);
                })
            } else {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/update",
                    type: "POST",
                    data: JSON.stringify({
                        'shopTeacherId': x.shopTeacherId,
                        'shopTeacherStatus': '1'
                    }),
                    success: function(data) {
                        if (data.status == '200') {
                            layer.msg('员工已在职', {
                                icon: 1
                            });
                            pagerRender = false;
                            getTableList(0);
                        };
                    }
                })
            }
        }

        function getTableList(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                start: start_.toString(),
                count: eachPage,
                searchType: searchName ? 'appSearchName' : undefined,
                searchName: searchName,
                quartersId: quartersId,
                shopTeacherStatus: $scope.staff_out ? "2" : $scope.staff_in ? "1" : undefined
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/shopTeacher/list",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == "200") {
                        angular.forEach(data.context.items, function(v) {
                            v.quarterStr = arrToStr(v.quarters, "quartersName");
                        });
                        $scope.listData = data.context.items;
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
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getTableList(start); //回掉
                }
            });
        }
        //以下是员工导入代码
        function upload_staff() {
            $("#upfile").val("");
            $("#progress_content").hide();
            layerOpen('upload_pop');
        }
        //上传文件
        $("#upfile").on('change', function() {
            if ($("#upfile")[0].files[0].size > 1 * 1042 * 1024) {
                layer.msg("导入文件不能超过1M", {
                    icon: 5
                });
                $("#upfile").val("");
                return;
            }
            layer.load(0);
            $('#form_load').ajaxSubmit({
                url: CONFIG.URL + '/api/oa/upFile/OaWorkerUpload',
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('token', localStorage.getItem('oa_token'));
                },
                success: resutlMsg,
                error: errorMsg
            });

            function resutlMsg(data) {
                if (data.status == "200") {
                    layer.msg('导入成功', {
                        icon: 1
                    });
                } else {
                    layer.msg("导入失败", {
                        icon: 5
                    });
                }
                if (data.message) {
                    $("#progress_content").show().text("").text(data.message);
                }
                pagerRender = false;
                getTableList(0);
                $("#upfile").val("");
                layer.closeAll('loading');
            }

            function errorMsg(data) {
                layer.msg("导入失败", {
                    icon: 5
                });
                $("#progress_content").show().text("").text(data.message);
                $("#upfile").val("");
                layer.closeAll('loading');
            }

        });
        //下载模板
        $("#download_btn").on('click', function() {
            window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟员工导入模板1.0.xlsx";
        });

        function staffAdd_btn() {
            window.$rootScope.yznOpenPopUp($scope, "staff-pop", "add_staff", "560px", { item: "", title: "关于员工", location: "outside", type: "add" });
        }

    }];
});