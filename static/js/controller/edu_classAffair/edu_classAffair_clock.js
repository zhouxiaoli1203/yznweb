define(['laydate', 'szpUtil', 'SimpleCalendar', "pagination", 'moment', 'mySelect', "courseAndClass_sel", "photoPop","clockPop","databasePop"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', '$timeout', '$sce', function($scope, $rootScope, $http, $state, $stateParams, $timeout, $sce) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 10; //页码初始化

        var search_classId, search_courseId, searchType, searchName = undefined;
        $scope.searchTime = "";
        $scope.hasSelect = undefined;
        init();
        function init() {
            getCourseList();
            getClassList();
            $scope.scheduleListThead = [{
                'name': '作业标题',
                'width': '19%',
            }, {
                'name': '班级',
                'width': '15%'
            }, {
                'name': '开始时间',
                'width': '15%'
            }, {
                'name': '结束时间',
                'width': '15%'
            }, {
                'name': '状态',
                'width': '12%',
            }, {
                'name': '打卡进度（天）',
                'width': '12%',
            }, {
                'name': '今日打卡人数',
                'width': '12%'
            }, {
                'name': '操作',
                'align':'center',
                'width': '100'
            }];
            $scope.selectInfoNameId = 'title'; // select初始值
            $scope.kindSearchData = {
                title: '作业标题'
            };
            $scope.operateClass = checkAuthMenuById("79"); //操作课务
            $scope.courseSelect = courseSelect; //选择课程
            $scope.classSelect = classSelect; //选择班级
            $scope.changeFun = changeFun; //未上传展示
            $scope.Enterkeyup = searchData; //回车搜索 删除
            $scope.SearchData = searchData; //按钮搜索
            $scope.onReset = onReset; //重置
            $scope.reloadList = reloadList;
            $scope.openClockPop = openClockPop; //布置打卡作业弹框
            $scope.showErrorMsg = showErrorMsgFun;
            $scope.hideErrorMsg = hideErrorMsgFun;
            $scope.homeWk_delete = homeWk_delete;
             $scope.switchVisitNav = switchVisitNav; //跳转路由
            laydate.render({
                elem: '#searchTime', //指定元素
                range: '到',
                isRange: true,
                done: function(value) {
                    $scope.searchTime = value;
                    $scope.$emit("clsAffair_clock", false);
                }
            });
            getListModelInfos(0);
            $scope.goCommonPop = function(el,id,width,data){
                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
            }
        }

//跳转路由
        function switchVisitNav(type) {
            switch(type) {
                case 1: $state.go('edu_classAffair'); break;
                case 2: $state.go('edu_classAffair/show'); break;
                case 3: $state.go('edu_classAffair/comment'); break;
                case 4: $state.go('edu_classAffair/houseWk'); break;
                case 5: $state.go('edu_classAffair/clock'); break;
            }
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
                        $scope.courseList = data.context;
                    }
                }
            });
        }
        //获取班级列表
        function getClassList(id) {
            var p = {
                pageType: "0",
                classStatus: "1"
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
                        $scope.classList = data.context;
                    }
                }
            });
        }

        function reloadList() {
            getListModelInfos(start);
        }

        function onReset() {
            searchName = searchType = search_classId = search_courseId = undefined;
            $scope.searchTime = "";
            $scope.hasSelect = undefined;
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            $scope.kindSearchOnreset();
            getCourseList();
            getClassList(search_courseId);
            $scope.$emit("clsAffair_clock", false);
        }
        function searchData(data){
            searchName = data.value;
            searchType = data.type;
            $scope.$emit("clsAffair_clock", false);
        }
        function courseSelect(c) {
            search_courseId = c == null ? undefined : c.courseId;
            getClassList(search_courseId);
            $scope.$emit("clsAffair_clock", false);
        }

        function classSelect(c) {
            search_classId = c == null ? undefined : c.classId;
            $scope.$emit("clsAffair_clock", false);
        }

        function changeFun(e, s) {
            $scope.hasSelect = e.target.checked?s:undefined;
            $scope.$emit("clsAffair_clock", false);
        }

        $scope.$on("clsAffair_clock", function(e, startPage) {
            if (startPage == "true") {
                getListModelInfos(start);
            } else {
                pagerRender = false;
                getListModelInfos(0);
            }
        });
        //获取列表数据
        function getListModelInfos(start_) {
            start = start_ == 0?"0":start_;
            var params = {
                "start": start_.toString() || "0",
                "count": eachPage,
                "classId": search_classId,
                "courseId": search_courseId,
                "searchType":searchType,
                "searchName":searchName,
//              0 未开始 1 进行中 2 已结束 3 未结束
                "homeworkType":$scope.hasSelect,
            }
            if($scope.searchTime){
                params["beginTime"]=$scope.searchTime.split(" 到 ")[0]+" 00:00:00";
                params["endTime"]=$scope.searchTime.split(" 到 ")[1]+" 23:59:59";
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/homework/listHomeworkR",
                type: "get",
                data: params,
                success: function(data) {
                    if (data.status == 200) {
                        $scope.scheduleRecord = data.context.items;
                        schedulePager(data.context.totalNum);
                        $scope.totalNum = data.context.totalNum;
                    }
                }
            });
        };

        function schedulePager(total) { //分页
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
                    getListModelInfos(start);
                }
            });

        }
        function homeWk_delete(x){
            detailMsk("系统将同时删除已提交的学员作业，<br>删除后不可恢复，是否删除作业？",function(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/homework/deleteHomeworkR",
                    type: "post",
                    data: JSON.stringify({homeworkRId:x.homeworkRId}),
                    success: function(data) {
                        if (data.status == "200") {
                            layer.msg("删除成功")
                            getListModelInfos(0);
                        }
                    }
                });
            });
        }
        function openClockPop() {
            var e_bTime = undefined;
            $scope.clockDetail = {
                homework:{
                    title: "",
                    beginTime: yznDateFormatYMd(new Date()),
                    endTime: "",
                    num: "",
                    desc: "",
                    homeWkUrlList: [],
                    noticeStatus: 1,
                },
                classList: [],
            };
            (function() {
                lay('.laydate').each(function(v, k) {
                    laydate.render({
                        elem: this,
                        isRange: false,
                        min: 0,
                        btns: [],
                        trigger: 'click',
                        done: function(value) {
                            if (v == 1) {
                                $scope.clockDetail.homework.endTime = value;
                            } else {
                                $scope.clockDetail.homework.beginTime = value;
                            }
                            if (CompareDateInequal($scope.clockDetail.homework.endTime, $scope.clockDetail.homework.beginTime)) {
                                e_bTime = (yznDateParse($scope.clockDetail.homework.endTime).getTime() - yznDateParse($scope.clockDetail.homework.beginTime).getTime()) / (1000 * 60 * 60 * 24) + 1;
                            } else {
                                e_bTime = undefined;
                            }
                            $scope.clockDetail.homework.num = e_bTime;
                            $scope.clockDetail_oldnum = e_bTime;
                            $scope.$apply();
                        }
                    });
                });
            })();
            $scope.checkClass = checkClass; //选择班级
            $scope.delClass = delClass; //选择班级
            $scope.add_showInfo = add_showInfo; //选择多媒体
            $scope.delete_showInfo = delete_showInfo; //删除多媒体
            $scope.changeIcon = changeIcon; //切换定时提醒按钮
            $scope.confirm_setClock = confirm_setClock; //确认布置打卡作业
            $scope.closePop = function() {
                layer.close(dialog);
            }
            openPopByDiv("布置打卡作业", ".setClock_pop", "760px");

            $scope.$watch('clockDetail', function() {
                if ($scope.clockDetail.homework.num > e_bTime) {
                    $scope.clockDetail.homework.num = undefined;
                }
            }, true);

            function checkClass() {
                window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px', {

                    name: "class",
                    type: 'checkbox',
                    callBackName: '打卡作业-添加班级'
                });
            }

            function delClass(x, ind) {
                $scope.clockDetail.classList.splice(ind, 1);
            }
            $scope.$on("打卡作业-添加班级", function(evt, data) {
                angular.forEach(data, function(val) {
                    var judge = true;
                    angular.forEach($scope.clockDetail.classList, function(val_) {
                        if (val.classId == val_.classId) {
                            judge = false;
                        }
                    })
                    if (judge) {
                        $scope.clockDetail.classList.push(val);
                    }
                })

            });
            if(!$scope.onClockDatabase){
                $scope.onClockDatabase = $scope.$on('打卡作业-资料库',function(e,data){
                    angular.forEach(data,function(v){
                        switch (v.type){
                            case 'image':
                                v.imageUrl = v.url;
                                break;
                            case 'audio':
                            v.audioUrl = v.url;
                            v.audioUrl_ = $sce.trustAsResourceUrl(v.url);
                                break;
                            case 'video':
                            v.videoUrl = v.url;
                            v.videoUrl_ = v.url_;
                                break;
                            default:
                                break;
                        }
                    });
                    $scope.clockDetail.homework.homeWkUrlList = $scope.clockDetail.homework.homeWkUrlList.concat(data);
                });
            }
            function confirm_setClock(){
                if(!$scope.clockDetail.homework.desc && $scope.clockDetail.homework.homeWkUrlList.length<=0){
                    return layer.msg("作业内容和上传素材2选1必填");
                }
                if($scope.clockDetail.homework.homeWkUrlList.length>8){
                    return layer.msg("素材最多上传8个");
                }
                var j = [true,""];
                var list = $scope.clockDetail.homework.homeWkUrlList;
                for(var i = 0,len = list.length;i<len;i++){
                    if(!list[i].key){
                        j[0] = false;
                        break;
                    }
                }
                if(!j[0]){
                    return layer.msg("请处理未成功的多媒体！");
                }
                 if($scope.clockDetail.classList.length<=0){
                    return layer.msg("请选择班级！");
                }
                var param = {
                    homework:angular.copy($scope.clockDetail.homework),
                    classList:getClassList($scope.clockDetail.classList)
                };
                param.homework["url"]=getUrlList($scope.clockDetail.homework.homeWkUrlList);
                param.homework["homeWkUrlList"]=undefined;
                detailMsk("作业布置后无法编辑，是否发送？",function(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/addHomeworkR",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if(data.status == "200"){
                                layer.close(dialog);
                                $scope.$emit("clsAffair_clock", false);
                            }
                        }
                    })
                });
            }
            function getClassList(list){
                var arr = [];
                if(list.length>0){
                    angular.forEach(list,function(v){
                        arr.push(v.classId);
                    });
                }
                return arr;
            }
            function getUrlList(list) {
                var str = "";
                for (var i in list) {
                    if (list[i].key) {
                        str += list[i].key + ",";
                    } else {
                        if (list[i].imageUrl) {
                            str += getKeyFromUrl(list[i].imageUrl) + ",";
                        }
                        if (list[i].audioUrl) {
                            str += getKeyFromUrl(list[i].audioUrl) + ",";
                        }
                        if (list[i].videoUrl) {
                            str += getKeyFromUrl(list[i].videoUrl) + ",";
                        }
                    }

                }
                str = str.substring(0, str.length - 1);
                return str;
            }

            
            //添加图片/音频/视频
            function add_showInfo(type, list) {
                if (type == 'img' || type == 'voice' || type == 'video') {
                    if (list.length > 7) {
                        layer.msg('添加到达上限');
                        return;
                    }
                }
                var uploadObserver = {
                    'filesSelected': function (files) {
                        angular.forEach(files,function(item){
                            var fileName = item.file.name;
                            var fileUrl = item.fileUrl;
                            var type = item.file.type;
                            var data = {
                                percent: 0,
                                fileName:fileName
                            }
                            if (type.indexOf('image') == 0) {
                                data.imageUrl = fileUrl;

                            } else if (type.indexOf('audio') == 0) {
                                data.audioUrl = fileUrl;
                                data.audioUrl_ = $sce.trustAsResourceUrl(fileUrl);

                            } else if (type.indexOf('video') == 0) {
                                data.videoUrl = fileUrl;
                                data.videoUrl_ = $sce.trustAsResourceUrl(fileUrl);
                            }
                            list.push(data);

                        });
                        $scope.$apply();
                    },//文件选择结果，返回文件列表
                    'fail' : function (fileUrl, error) {
                        angular.forEach(list,function(item) {
                            if (item.audioUrl == fileUrl) {
                                item.uploadErr = error;
                            }
                        });
                         $scope.$apply();
                    }, //文件上传失败
                    'success' :  function (fileUrl, key) {
                        angular.forEach(list,function(item) {
                            if (item.imageUrl == fileUrl || item.audioUrl == fileUrl || item.videoUrl == fileUrl) {
                                item.key = key;
                            }
                        });
                        $scope.$apply();
                    },//文件上传成功
                    'progress' : function (fileUrl, percent) {
                        var found = false;
                        angular.forEach(list,function(item) {
                            if (item.imageUrl == fileUrl || item.audioUrl == fileUrl || item.videoUrl == fileUrl) {
                                item.percent = percent;
                                found = true;
                            }
                        });
                        //如果没找到就取消上传
                        if (!found) {
                            return true;
                        }
                         $scope.$apply();
                    } //文件上传进度
                };
                switch (type) {
                    case 'img': //添加图片
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
//                              if (data.length > 0) {
//                                  angular.forEach(data, function(v) {
//                                      list.push({
//                                          imageUrl: v
//                                      });
//                                  });
//                              }
//                              $scope.$apply();
                            }, {
                                multiple: true,
                                type: 'image/gif, image/jpeg, image/png'
                            },uploadObserver);
                        }, 100);
                        break;
                    case 'voice': //添加音频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
//                              console.log(data);
//                              list.push({
//                                  audioUrl: data,
//                                  audioUrl_: $sce.trustAsResourceUrl(data)
//                              });
//                              $scope.$apply();
                            }, {
                                type: 'audio/mp3,audio/m4a,audio/x-m4a'
                            },uploadObserver);
                        });
                        break;
                    case 'video': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
//                              console.log(data);
//                              list.push({
//                                  videoUrl: data,
//                                  videoUrl_: $sce.trustAsResourceUrl(data)
//                              });
//                              $scope.$apply();
                            }, {
                                type: 'video/mp4'
                            },uploadObserver);
                        }, 100);
                        break;
                    case 'more': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // console.log(data);
                                // list.push({
                                //     videoUrl: data,
                                //     videoUrl_: $sce.trustAsResourceUrl(data)
                                // });
                                // $scope.$apply();
                            }, {
                                multiple:true,
                                type: 'image/gif, image/jpeg, image/png, image/png,audio/mp3,audio/m4a,audio/x-m4a,video/mp4',
                                dataSource:'pwHomework'
                            }, uploadObserver);
                        }, 100);
                        break;
                }
            }

            function delete_showInfo(ind, list) {
                list.splice(ind, 1);
            }

            function changeIcon() {
                $scope.clockDetail.homework.noticeStatus = (!$scope.clockDetail.homework.noticeStatus) ? 1 : 0;
                console.log($scope.clockDetail.homework.noticeStatus);
            }
        }

    }];
});