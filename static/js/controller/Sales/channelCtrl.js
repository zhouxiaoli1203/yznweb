define(["pagination", "remarkPop"], function() {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
	    var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        init();

        function init() {
            $scope.isOperate=checkAuthMenuById("24");
            $scope.editRemark = editRemark; ////编辑备注确认按钮
            $scope.detailed = detailed; //点击查看详细请
            $scope.editOperation = editOperation; //编辑
            $scope.deleteOperation = deleteOperation; //删除
            $scope.Enterkeyup = Enterkeyup; //模糊搜索
            $scope.SearchData = SearchData; //按钮筛选
            $scope.channel_tab_por = channel_tab_por; //新增渠道
            $scope.channelSure = channelSure; //新增、编辑提交
            $scope.closePop = closePop; //取消
            $scope.editRemark = editRemark; //备注编辑
            
            $scope.selectInfoNameId = 'channelName'; //select初始值
            $scope.searchData = {
                channelName :'渠道名称、类型、备注',
                channelType:'渠道类型',
                channelDesc:'渠道备注'
            };
            //表头
            $scope.nameListThead = [{
                    'name': '渠道名称',
                    'width': '25%',
                },
                {
                    'name': '渠道类型',
                    'width': '25%',
                },
                {
                    'name': '备注',
                    'width': '25%',
                },
                {
                    'name': '操作',
                    'align':'center',
                    'id': 3
                }
            ];

            getChannelList('0'); //记载列表
            getChannelType(); //获取渠道基本类型
        }

        var likeName, //搜索内容
            SearchDataType, //搜索类型
            DisEdDe, //区分编辑与新增
            ChanneId;

        function detailed(data) {
            slideOut();
            $scope.$detailed = data;
            getStudentContractRenewList(data.refund.contractId)
        }

        function SearchData(data) {
            console.log(data)
            likeName = data.value;
            SearchDataType = data.type;
            pagerRender = false;
            getChannelList('0');
        }

        function Enterkeyup(data) {
            likeName = data.value;
            SearchDataType = data.type;
            pagerRender = false;
            getChannelList('0');
        }

        //排序回调方法
        $scope.sortCllict = function(data) {

        }

        //列表数据
        function getChannelList(start) {
            var param = {
                'start': start,
                'count': eachPage,
                'searchType': likeName?'appSearchName':undefined,
                'searchName': likeName
            };
            for(var i in param) {
                if(param[i] === '' || param[i] == undefined) {
                    delete param[i];
                };
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getChannelList",
                type: "get",
                data: param,
                success: function(data) {
                    if(data.status == '200') {
                        $scope.getChannelList = data.context.items;
                        renderPager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }

            })
        }

        function renderPager(total) {
            if(pagerRender)
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
                    if(api.getCurrentEach() != eachPage) {  //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getChannelList(start); //回掉
                }
            });
        }

        //删除
        function deleteOperation(x) {
            layer.confirm('是否删除该渠道？', {
                title: "确认删除信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 0,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var id = {
                    id: x.id
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/deleteChannel",
                    type: "post",
                    data: JSON.stringify(id),
                    success: function(data) {
                        if(data.status == '200') {
                            layer.msg('删除成功', {
                                icon: 1
                            });
                            pagerRender = false;
                            getChannelList('0');
                        }
                    }

                })
            }, function() {
                layer.closeAll();
            })
        }

        //新增渠道
        function channel_tab_por() {
            layerOpen('shade_editchannel', '新增渠道');
            DisEdDe = 'add';
            $scope.channelName='';
            $scope.channelTypeId='';
            $scope.channelDesc='';
        }
        //编辑
        function editOperation(x) {
            $scope.channelName = x.channelName;
            $scope.channelTypeId = x.channelTypeId;
            $scope.channelDesc = x.channelDesc;
            ChanneId = x.id;
            layerOpen('shade_editchannel', '编辑');
            DisEdDe = 'edit';
        }

        function channelSure() {
            switch(DisEdDe) {
                case 'add':
                    var param = {
                        'channelName': $scope.channelName,
                        'channelTypeId': $scope.channelTypeId,
                        'channelDesc': $scope.channelDesc,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/insertChannel",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if(data.status == '200') {
                                layer.msg('已成功新增渠道', {
                                    icon: 1
                                });
                                pagerRender = false;
                                getChannelList('0');
                                layer.close(dialog);
                            }
                        }

                    })
                    break;
                case 'edit':
                    var param = {
                        'id': ChanneId,
                        'channelName': $scope.channelName,
                        'channelTypeId': $scope.channelTypeId,
                        'channelDesc': $scope.channelDesc,
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/setting/updateChannel",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if(data.status == '200') {
                                layer.msg('编辑成功', {
                                    icon: 1
                                });
                                pagerRender = false;
                                getChannelList('0');
                                layer.close(dialog);
                            }
                        }

                    })
                    break;
                default:
                    break;
            }
        }

        function editRemark(data) {
            var da = JSON.parse(data.id);
            var param = {
                'id': da.id,
                'channelName': da.channelName,
                'channelTypeId': da.channelTypeId,
                'channelDesc': data.value,
            };

            $.hello({
                url: CONFIG.URL + "/api/oa/setting/updateChannel",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if(data.status == '200') {
                        layer.msg('备注修改成功', {
                            icon: 1
                        });
                        pagerRender = false;
                        getChannelList('0');
                        $(".edit_remark").removeClass("open");
                    }
                }

            })
        }

        function getChannelType() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getChannelTypeLess",
                type: "get",
                success: function(data) {
                    if(data.status == '200') {
                        $scope.getChannelTypeList = data.context;
                    }
                }

            })
        }

        function closePop() {
            layer.close(dialog);
        }


    }]
})