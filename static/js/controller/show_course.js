define([ "laydate", "pagination", "mySelect", "szpUtil"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
	    var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        var $searchName, $searchType, $time;   //活动列表搜索字段
        init();
        function init() {
            $scope.$type = undefined;
            getShowCourseList(0);
            $scope.changeCourseStatus = changeCourseStatus; //改变课程状态
            $scope.sel_courseStatus = sel_courseStatus; //点击筛选启用或者不启用
            $scope.sel_courseType = sel_courseType; //点击课程类型(一对一)
            $scope.addShowCourse = addShowCourse;   //新增展示课程
            $scope.submit_showcourse = submit_showcourse;   //提交修改展示课程
            $scope.lineDetailInfo = null;   //列表点击每一条的详细信息
            $scope.SearchData = SearchData; //搜索体验课程名
            $scope.Enterkeyup = SearchData;
            $scope.screen_operate = screen_operate; //my-select组件筛选操作
            $scope.closeLayer = function() {
                layer.close(dialog);
            }
            $scope.nameListThead = [
                {'name': '展示课程','width': '25%'},
                {'name': '创建时间','width': '25%'},
                {'name': '关联课程','width': '25%'},
                {'name': '启用状态','width': '10%', 'align':'center'},
            ];
            $scope.selectInfoNameId = 1;
            $scope.kindSearchData = {
                1: '展示课程',
            };
            $scope.add_showcourseInfo = add_showcourseInfo; //添加课程信息
            $scope.delete_showcourseInfo = delete_showcourseInfo;   //删除课程信息
            $scope.onReset = function() {   //重置
                $scope.kindSearchOnreset(); //调取app重置方法
                $('#showcourseTime').val('');
                $searchName = undefined;
                $searchType = undefined;
                $time = undefined;
                $scope.$type = undefined;
                pagerRender = false;
                getShowCourseList(0);
            }
            $scope.moveUpDown = moveUpDown; //上下移动
            setTimeout(function() {
                laydate.render({    //班级选择将来时间
                    elem: '#showcourseTime', //指定元素
                    range: "到",
                    isRange: false,
                    done: function(value) {
                        $time = value;
                        pagerRender = false;
                        getShowCourseList(0);
                    }
                });
            });
            $scope.imgover = function(evt, type) {
                switch(type) {
                    case 'change': 
                        $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                        break;
                    case 'delete': 
                        evt.stopPropagation();
                        $(evt.target).find('var').show();
                        break;
                }
            };
            $scope.imgout = function(evt, type) {
                switch(type) {
                    case 'change': 
                        $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                        break;
                    case 'delete': 
                        evt.stopPropagation();
                        $(evt.target).find('var').hide();
                        break;
                }
            }
        }
        
        //my-select组件筛选操作
        function screen_operate(_da, type) {
            switch (type) {
                case 'course':
                    $scope.showcourseInfo.relationCourse = _da?_da.courseId:'';
                    break;
            }
        }
        
        //模块上下移动
        function moveUpDown(d, index, type, evt) {
            var d_;
            if($(evt.target).attr('btnType') == 'y') {
                if(type == 1) {
                    d_ = d[index];
                    d[index] = d[index - 1];
                    d[index - 1] = d_;
                } else {
                    d_ = d[index];
                    d[index] = d[index + 1];
                    d[index + 1] = d_;
                }
            }
        }
        function sel_courseType(evt, type) {
            if(evt.target.checked) {
                $scope.showcourseInfo.courseType = type;
            } else {
                $scope.showcourseInfo.courseType = undefined;
            }
        }
        function submit_showcourse() {
            if(!$scope.showcourseInfo.titlesrc) {
                layer.msg('请选择课程封面');
                return;
            }
            if(!$scope.showcourseInfo.relationCourse) {
                layer.msg('请选择关联课程');
                return;
            }
            if($scope.showcourseInfo.courseList.length < 1) {
                layer.msg('请填写课程详情');
                return;
            }
            var url_ = '/api/oa/course/addExperienceCourse';
            var params = {
                'courseType': $scope.showcourseInfo.courseType,
                'courseSummary': $scope.showcourseInfo.abstract,
                'experienceCourseName': $scope.showcourseInfo.courseName,
                'fosterAbilities': $scope.showcourseInfo.power,
                'courseId': $scope.showcourseInfo.relationCourse,
                'experienceCourseImageUrl': $scope.showcourseInfo.titlesrc,
                'courseDetail': [],
                'ageLower': $scope.showcourseInfo.ageLower,
                'ageUpper': $scope.showcourseInfo.ageUpper,
            };
            angular.forEach($scope.showcourseInfo.courseList, function(val) {
                if(val.type == 'img') {
                    params['courseDetail'].push({imageUrl: val.value});
                } else {
                    params['courseDetail'].push({content: val.value});
                }
            });
            if(params['courseDetail'].length <= 0) {
                params['courseDetail'] = '';
            } else {
                params['courseDetail'] = JSON.stringify(params['courseDetail']);
            }
            if($scope.lineDetailInfo) {
                url_ = '/api/oa/course/updateExperienceCourse';
                params['experienceCourseId'] = $scope.lineDetailInfo.experienceCourseId;
            }
            $.hello({
                url: CONFIG.URL + url_,
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if(res.status == 200) {
                        pagerRender = false;
                        getShowCourseList(0);
                        $scope.closeLayer();
                        layer.msg('提交成功');
                    };
                }
            });
        }
        function delete_showcourseInfo(ind, type) {
            var isdelete = layer.confirm('确认删除?', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                switch(type) {
                    case 'course': 
                        $scope.showcourseInfo.courseList.splice(ind, 1);
                        break;
                }
                $scope.$apply();
                layer.close(isdelete);
            }, function() {
                layer.close(isdelete);
            })
        }
        function add_showcourseInfo(type, ind) {
            switch(type) {
                case 'titleimg': 
                    szpUtil.util_addImg(true, function(data) {
                        $scope.showcourseInfo.titlesrc = data;
                        $scope.$apply();
                    }, {options: {aspectRatio: 16/9}, type: 'image/gif, image/jpeg, image/png',dataSource:'expCourse'});
                    break;
                case 'coursetext':
                    $scope.showcourseInfo.courseList.push({type: 'text', value: ''});
                    break;
                case 'courseimg':
                    szpUtil.util_addImg(false, function(data) {
                        $scope.showcourseInfo.courseList.push({type: 'img', value: data});
                        $scope.$apply();
                    }, {type: 'image/gif, image/jpeg, image/png',dataSource:'expCourse'});
                    break;
                case 'changeCourseimg':
                    szpUtil.util_addImg(false, function(data) {
                        $scope.showcourseInfo.courseList[ind] = {type: 'img', value: data};
                        $scope.$apply();
                    }, {type: 'image/gif, image/jpeg, image/png',dataSource:'expCourse'});
                    break;
            }
        }
        function addShowCourse(type, d) {
            $scope.showcourseInfo = {
                titlesrc: '',
                courseName: '',
                relationCourse: null,
                courseType: null,
                power: '',
                abstract: '',
                courseList: [],
                ageLower: '',
                ageUpper: ''
            };
            if(type == 'add') {
                $scope.lineDetailInfo = null;
                $scope.$broadcast('relationCourse', 'clearHeadName');   //清除上次选择的关联课程名字
                openPopByDiv('新增展示课程', '#add_showcourse', '780px');
                getScreen_courseList();
            } else {
                $scope.lineDetailInfo = d;
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/getExperienceCourseDetail",
                    type: "get",
                    data: {experienceCourseId: d.experienceCourseId},
                    success: function(res) {
                        if(res.status == 200) {
                            console.log(res);
                            var res = res.context;
                            $scope.showcourseInfo['titlesrc'] = res.experienceCourseImageUrl;
                            $scope.showcourseInfo['courseName'] = res.experienceCourseName;
                            $scope.showcourseInfo['relationCourse'] = res.courseId + '';
                            $scope.showcourseInfo['courseType'] = res.courseType;
                            $scope.showcourseInfo['power'] = res.fosterAbilities?res.fosterAbilities:'';
                            $scope.showcourseInfo['abstract'] = res.courseSummary?res.courseSummary:'';
                            $scope.showcourseInfo['ageLower'] = res.ageLower?res.ageLower:'';
                            $scope.showcourseInfo['ageUpper'] = res.ageUpper?res.ageUpper:'';
                            if(res.courseDetails) {
                                angular.forEach(res.courseDetails,function(val) {
                                    if(val.imageUrl || val.imageUrl == '') {
                                        $scope.showcourseInfo['courseList'].push({type: 'img', value: val.imageUrl});
                                    }
                                    if(val.content || val.content == '') {
                                        $scope.showcourseInfo['courseList'].push({type: 'text', value: val.content});
                                    }
                                })
                            }
                            console.log($scope.showcourseInfo);
                            getScreen_courseList();
                            openPopByDiv('编辑展示课程', '#add_showcourse', '780px');
                        };
                    }
                });
            };
        }
        function sel_courseStatus(evt, type) {
            if(evt.target.checked) {
                $scope.$type = type;
            } else {
                $scope.$type = null;
            }
            pagerRender = false;
            getShowCourseList(0);
        }
        function SearchData(data) {
            $searchName = data.value;
            $searchType = data.type;
            pagerRender = false;
            getShowCourseList(0);
        }
        function changeCourseStatus(d) {
            var params = {
                'experienceCourseId': d.experienceCourseId
            }
            if(d.courseStatus == 0) {
                params['courseStatus'] = 1;
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/updateExperienceCourse",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if(res.status == 200) {
                            pagerRender = false;
                            getShowCourseList(0);
                            layer.msg('已启用');
                        };
                    }
                });
            } else {
                var isdelete = layer.confirm('确认禁用?', {
                    title: "禁用信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    params['courseStatus'] = 0;
                    $.hello({
                        url: CONFIG.URL + "/api/oa/course/updateExperienceCourse",
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if(res.status == 200) {
                                pagerRender = false;
                                getShowCourseList(0);
                                layer.msg('已禁用');
                            };
                        }
                    });
                    layer.close(isdelete);
                }, function() {
                    layer.close(isdelete);
                })
            };
        }
        function getScreen_courseList() {
             $.hello({
                url: CONFIG.URL + "/api/oa/course/getSimpleCourse",
                type: "get",
                data: {},
                success: function(res) {
                    if(res.status == '200') {
                        $scope.screen_courseList = res.context;
                        if($scope.showcourseInfo['relationCourse']) {   //如果有关联课程的默认选上
                            //获取关联课程名字
                            angular.forEach($scope.screen_courseList, function(val_1) {
                                if(val_1.courseId == $scope.showcourseInfo['relationCourse']) {
                                    $scope.$broadcast('relationCourse', 'clearHeadName', val_1.courseName);   //关联课程名字
                                }
                            });
                        }
                    };
                }
            })
        }
        function getShowCourseList(start) {
            var params = {
                'start': start,
                'count': eachPage,
                'experienceCourseName': $searchName,
                'beginTime': $time?$time.split(' 到 ')[0]+ ' 00:00:00':undefined,
                'endTime': $time?$time.split(' 到 ')[1]+ ' 23:59:59':undefined,
                'courseStatus': $scope.$type,
            }
            console.log(params);
            $.hello({
                url: CONFIG.URL + "/api/oa/course/getExperienceCourseList",
                type: "get",
                data: params,
                success: function(res) {
                    if(res.status == 200) {
                        console.log(res);
                        $scope.showCourseList = res.context.items;
                        renderPager_showCourse(res.context.totalNum);
                    };
                }
            });
        }
        function renderPager_showCourse(total) { //分页
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
                    getShowCourseList(start); //回掉
                }
            });
        }
    }]
})