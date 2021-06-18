define(["szpUtil", 'colorPick'], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', '$sce', function($scope, $rootScope, $http, $state, $stateParams, $timeout, $sce) {
        init();

        function init() {
            $scope.switchVisitNav = switchVisitNav;
            $scope.visitNavJud = 6;
            getTemplateList();
            $scope.openDialog = openDialog;
            $scope.closeDialog = function() {
                layer.close(dialog);
            };
            $scope.add_organInfo = add_organInfo;
            $scope.shopName = window.currentUserInfo.shop.shopName;
            $scope.temReviews = [
                { name: '课堂展示预览', src: "static/img/showimg/ktzs.png" },
                { name: '课堂点评预览', src: "static/img/showimg/ktdp.png" },
                { name: '作业点评预览', src: "static/img/showimg/zydp.png" },
                { name: '打卡分析预览', src: "static/img/showimg/dkzy.png" }
            ];
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
        $scope.submitTem = function() {
            var url = $scope.shareTemplateId ? "/api/oa/shareTemplate/update" : "/api/oa/shareTemplate/add";
            var params = $scope.shareTemplateId ? {
                url: $scope.key,
                shareTemplateId: $scope.shareTemplateId,
                color: $scope.color
            } : {
                url: $scope.key,
                color: $scope.color
            }
            $.hello({
                url: CONFIG.URL + url,
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if (res.status == 200) {
                        getTemplateList();
                        $scope.closeDialog("share_template_pop");
                    }
                }
            })
        }

        $scope.preview = function(i) {
            $scope.bg = $scope.temReviews[i].src
            console.log($scope.longUrl)
            openPopByDiv($scope.temReviews[i].name, '.template_pop_review', '660px');
        }

        $scope.imgover = function(evt, type) {
            switch (type) {
                case 'change':
                    $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                    break;
            }
        };
        $scope.imgout = function(evt, type) {
            switch (type) {
                case 'change':
                    $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                    break;
            }
        }
        $scope.getRgb = function(url) {
            $.hello({
                url: url + "?imageAve",
                type: "get",
                data: {},
                success: function(res) {
                    if (res.RGB) {
                        $scope.color = "#" + res.RGB.substr(2, 6)
                    }
                }
            });
        }
        $scope.del = function(x) {
            var isDelect = layer.confirm('是否删除模板？', {
                title: "确认删除信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/shareTemplate/delete",
                    type: "post",
                    data: JSON.stringify({
                        shareTemplateId: x.shareTemplateId
                    }),
                    success: function(res) {
                        if (res.status == 200) {
                            getTemplateList();
                        };
                    }
                });
                layer.close(isDelect);
            }, function() {
                layer.close(isDelect);
            })

        }

        function getTemplateList() {
            $.hello({
                url: CONFIG.URL + "/api/oa/shareTemplate/list",
                type: "get",
                data: {},
                success: function(res) {
                    if (res.status == 200) {
                        $scope.temList = res.context;
                        setTimeout(function() {
                            $('.shareTemItem').hover(function() {
                                $(this).find('.shareMsk').show()
                            }, function() {
                                $(this).find('.shareMsk').hide()
                            });
                        })
                    };
                }
            });
        }

        function openDialog(x) {
            if (x) { //编辑
                $scope.key = x.url;
                $scope.longUrl = x.longUrl;
                $scope.color = x.color;
                $scope.shareTemplateId = x.shareTemplateId;
                openPopByDiv('编辑模板', '.share_template_pop', '660px');
            } else { //新增
                $scope.key = "";
                $scope.longUrl = "";
                $scope.color = "#FFC0CB";
                $scope.shareTemplateId = null;
                openPopByDiv('新增模板', '.share_template_pop', '660px');

            }
            if ($scope.pickerExited) return;
            Colorpicker.create({
                bindClass: 'picker',
                change: function(elem, hex) {
                    elem.style.backgroundColor = hex;
                    $scope.color = hex;
                }
            });
            $scope.pickerExited = true;
        }

        function add_organInfo(type, d) {
            setTimeout(function() {
                szpUtil.util_addImg(true, function(data) {
                    $scope.longUrl = data;
                    $scope.getRgb(data)
                    $scope.$apply();
                }, { options: { aspectRatio: 750 / 348 }, type: 'image/jpeg, image/png',dataSource:'shareTemplate' }, {
                    'success': function(fileUrl, key) {
                        $scope.key = key;
                    }
                })
            });
        }

    }]
})