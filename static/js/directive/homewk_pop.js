define(['laydate','layui', 'mySelect','szpUtil','databasePop'], function(laydate) {
    creatPopup({
        el: 'homewkPop',
        openPopupFn: 'viewHomewkCommit',
        htmlUrl: './templates/popup/homewk_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state,$sce) {
        	$scope.props = angular.copy(props);
        	$scope.localTeachId = window.currentUserInfo.teacherId;
        	console.log(props);
            $scope.fromPop = props.page;
            var s_searchName = undefined;
            $scope.unsubmit = undefined;
            if(props.page == "myClass"){
                $scope.operateClass = true;//操作课务
            }else{
                $scope.operateClass = checkAuthMenuById("79");
            }
        	init();
        	function init() {
        	    $scope.page1 = 0;
                $scope.commentStatus = undefined;
                $scope.s_kindSearchData = {
                    commentName: '学员姓名、昵称'
                };
                $scope.commentTitle = "作业点评";
                $scope.openPhotos = openPhotos; //照片查看器
                $scope.add_showInfo = add_showInfo; //添加多媒体
                $scope.delete_showInfo = delete_showInfo; //删除多媒体
                
                $scope.goComment = goComment; //点评
                $scope.sendComment = sendComment; //追评
                $scope.showContentFun = showContentFun;//打开或关闭评论
                $scope.deleteComtInfo = deleteComtInfo; //删除点评
                $scope.deleteZhui = deleteZhui; //删除追评
                $scope.s_SearchData = searchData;
                $scope.s_Enterkeyup = searchData;
                $scope.changeSubmit = changeSubmit;
                $scope.changeComment = changeComment;
                $scope.onceSubWk = onceSubWk; //一键催交
                $scope.screen_onreset = screen_onreset;//重置
                getHomeWkList(0);
                loadData('homewk_id', function() {
                    getHomeWkList($scope.page1);
                });
                  $scope.goCommonPop = function(el,id,width,data){
                    window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
                }
            }
        	function setUrlist(list) {
                var urlList = [];
                angular.forEach(list, function(v) {
                    var obj = {};
                    var ptype = v.match(RegExp(/picture/));
                    var atype = v.match(RegExp(/voice/));
                    var vtype = v.match(RegExp(/video/));
                    if (ptype) {
                        urlList.push({
                            imageUrl: v,
                            key: getKeyFromUrl(v)
                        });
                    }
                    if (atype) {
                        urlList.push({
                            audioUrl: v,
                            audioUrl_: $sce.trustAsResourceUrl(v),
                            key: getKeyFromUrl(v)
                        });
                    }
                    if (vtype) {
                        urlList.push({
                            videoUrl: v,
                            videoUrl_: $sce.trustAsResourceUrl(v),
                            key: getKeyFromUrl(v)
                        });
                    }
                });
                return urlList;
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
            function add_showInfo(type, list,from,data_source) {
                if (type == 'img' || type == 'voice' || type == 'video') {
                    if(from=="show"){
                        if(list.length > 19){
                            layer.msg('添加到达上限');
                            return;
                        }
                    }else if(from=="comment"){
                        if(list.length > 2){
                            layer.msg('添加到达上限');
                            return;
                        }
                    }else{
                        if(list.length > 7){
                            layer.msg('添加到达上限');
                            return;
                        }
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
                                // if(data.length>0){
                                //     angular.forEach(data,function(v){
                                //         list.push({
                                //             imageUrl: v
                                //         });
                                //     });
                                // }
                                // $scope.$apply();
                            }, {multiple:true,type: 'image/gif, image/jpeg, image/png'}, uploadObserver);
                        }, 100);
                        break;
                    case 'voice': //添加音频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // console.log(data);
                                // list.push({
                                //     audioUrl: data,
                                //     audioUrl_: $sce.trustAsResourceUrl(data)
                                // });
                                // $scope.$apply();
                            }, {
                                type: 'audio/mp3,audio/m4a,audio/x-m4a'
                            }, uploadObserver);
                        });
                        break;
                    case 'video': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                                // console.log(data);
                                // list.push({
                                //     videoUrl: data,
                                //     videoUrl_: $sce.trustAsResourceUrl(data)
                                // });
                                // $scope.$apply();
                            }, {
                                type: 'video/mp4'
                            }, uploadObserver);
                        }, 100);
                        break;
                    case 'more': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                            }, {
                                multiple:true,
                                type: 'image/gif, image/jpeg, image/png, image/png,audio/mp3,audio/m4a,audio/x-m4a,video/mp4',
                                dataSource:data_source
                            }, uploadObserver);
                        }, 100);
                        break;
                }
            }
            function delete_showInfo(ind, list) {
                list.splice(ind, 1);
            }
        	function openPhotos(value, list) {
                if (!list) {
                    return;
                }
                var param = {
                    val: value,
                    list: list,
                    liwidth: 880,
                    liheight: 470
                }

                window.$rootScope.yznOpenPopUp($scope,'photo-pop','photosPop', '960px', param);
            }
        	function showContentFun(m){
                m.showContent = !m.showContent;
                $scope.addcommentData = {
                    reviewsRecordUrl:[],
                    reviewContent:''
                };
            }
        	if(!$scope.commentDatabase){
                $scope.commentDatabase = $scope.$on('作业评论-资料库',function(e,data){
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
                    $scope.addcommentData.reviewsRecordUrl= $scope.addcommentData.reviewsRecordUrl.concat(data);
                });
            }
        	function sendComment(x,m,fromPop){
                if (!$scope.addcommentData.reviewContent && $scope.addcommentData.reviewsRecordUrl.length <= 0) {
                    return layer.msg("评论内容和多媒体内容2选1必填");
                }
                if($scope.addcommentData.reviewsRecordUrl && $scope.addcommentData.reviewsRecordUrl.length>3){
                    return layer.msg("多媒体内容最多3个");
                }
                var j = [true,""];
                var list = $scope.addcommentData.reviewsRecordUrl;
                for(var i = 0,len = list.length;i<len;i++){
                    if(!list[i].key){
                        j[0] = false;
                        break;
                    }
                }
                if(!j[0]){
                    return layer.msg("请处理未成功的多媒体！");
                }
                var param;
                param = {
                	"taskReviewId":m.taskReviewId,
					"reviewContent":$scope.addcommentData.reviewContent,
					"reviewUrl":getUrlList($scope.addcommentData.reviewsRecordUrl)
                }
                
                $.hello({
                    url: CONFIG.URL + "/api/oa/onlineCourse/addOcTaskReviewRecord",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            $scope.$emit('changeHomeWk');
                            m.showContent = false;
                        }
                    }
                })
            }

        	//课堂点评和作业收交页面的 对学员的点评和编辑点名
            function goComment(x,m,fromPop,type) {
                $scope.commentData = {};
                $scope.studentComtData = angular.copy(x);
                if(type=='add'){
                    $scope.commentData = {
                        reviewLevel:3,
                        reviewDesc:"",
                        excellent:false,
                        reviewUrlList: [],
                        reviewUrlListOld: []
                    };
                }else{
                    $scope.commentData = angular.copy(m);
                    $scope.commentData.reviewLevel = m.reviewLevel;
                    $scope.commentData.reviewDesc = m.reviewContent;
                    $scope.commentData.reviewUrlList = m.reviewUrlList;
                    $scope.commentData.reviewUrlListOld = m.reviewUrlListOld;
                    $scope.commentData.excellent = x.excellent==1?true:false;
                }
                 (function() {
                        layui.use(['rate'], function() {
                            var ins = layui.rate;
                            ins.render({
                                elem: '#comment_start', //绑定元素
                                value:$scope.commentData.reviewLevel,
                                choose: function(val) {
                                    $scope.commentData.reviewLevel = val;
                                }
                            });
                        });
                    })();
                $scope.goPopup('comment_pop', '660px');
                if(!$scope.addcommentDatabase){
                    $scope.addcommentDatabase = $scope.$on('作业点评-资料库',function(e,data){
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
                        $scope.commentData.reviewUrlList= $scope.commentData.reviewUrlList.concat(data);
                    });
                }
                $scope.$on("addRemark_toComment",function(e,data){
                    $scope.commentData.reviewDesc = data.str;
                });
                $scope.confirm_comment = function() {
                    if ($scope.commentData.reviewLevel < 1) {
                        return layer.msg("请选择评分");
                    }
                    if (!$scope.commentData.reviewDesc && $scope.commentData.reviewUrlList.length <= 0) {
                        return layer.msg("点评内容和多媒体内容2选1必填");
                    }
                    var j = [true,""];
                    var list = $scope.commentData.reviewUrlList;
                    for(var i = 0,len = list.length;i<len;i++){
                        if(!list[i].key){
                            j[0] = false;
                            break;
                        }
                    }
                    if(!j[0]){
                        return layer.msg("请处理未成功的多媒体！");
                    }
                    var URL;
                    var param = {
							"reviewLevel":$scope.commentData.reviewLevel,
							"reviewContent":$scope.commentData.reviewDesc,
							"reviewUrl":getUrlList($scope.commentData.reviewUrlList),
							"excellent":$scope.commentData.excellent?"1":"0"
                        }
                        if(type == "add"){
                            param["taskCommitId"] = x.taskCommitId;
                            URL = "/api/oa/onlineCourse/addOcTaskReview";
                        }else{
                            param["taskReviewId"] = m.taskReviewId;
                            URL = "/api/oa/onlineCourse/modifyOcTaskReview";
                        }
                    console.log(param);
                    $.hello({
                        url: CONFIG.URL + URL,
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.$emit("reloadGetKeciList");
                                $scope.$emit('changeHomeWk');
                                $scope.closePopup('comment_pop');
                            }
                        }
                    })
                }

            }
    	    function changeComment(e,v){
                $scope.commentStatus = e.target.checked?v:undefined;
                $scope.page1 = 0;
                getHomeWkList($scope.page1);
            }
             function searchData(n){
                s_searchName = n.value;
                $scope.page1 = 0;
                getHomeWkList($scope.page1);
            }
            function changeSubmit(t){
                $scope.unsubmit = t;
                $scope.page1 = 0;
                getHomeWkList($scope.page1);
            }
            function screen_onreset(){
            	 $scope.kindSearchOnreset();
            	s_searchName = undefined;
            	$scope.commentStatus = undefined;
            	$scope.unsubmit = undefined;
            	$scope.page1 = 0;
                getHomeWkList($scope.page1);
            }
            $scope.$on("changeHomeWk",function(){
                $scope.page1 = 0;
                getHomeWkList($scope.page1);
            });
//              $scope.$watch("unsubmit",function(n,o){
//                  if(n === o || n == undefined) return; 
//                  getHomeWkList();
//              });
            function getHomeWkList(start) {
                var param = {
                    start:start.toString() || "0",
                    count:100,
                    lessonId:$scope.props.item ? $scope.props.item.lessonId : undefined,
                    reviewStatus: $scope.commentStatus,
                    committed:$scope.unsubmit?"0":undefined,
                    searchType:s_searchName?"appSearchName":undefined,
                    searchName:s_searchName,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/onlineCourse/listOcTaskCommit",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if (data.status == '200') {
                            var list = angular.copy(data.context.items);
                            var brr=[];
                            angular.forEach(list,function(m){
                                if(!m.taskCommitId){
                                    brr.push(m);
                                }
                                if(m.taskCommitId){
                                        //以下是作业内容多媒体
                                        if(m.taskUrlList && m.taskUrlList.length>0){
                                            m.taskUrlOld = angular.copy(m.taskUrlList);
                                            m.taskUrlList = setUrlist(m.taskUrlList);
                                        }
                                        //以下是作业内容里的点评内容
                                        if(m.ocTaskReview){
                                        	 setTimeout(function() {
	                                            layui.use(['rate'], function() {
	                                                var ins = layui.rate;
	                                                ins.render({
	                                                    elem: "#homeWk_comment"+m.ocTaskReview.taskReviewId, //绑定元素
	                                                    value: m.ocTaskReview.reviewLevel,
	                                                    readonly: true
	                                                });
	                                            });
	                                        })
                                        	m.ocTaskReview.reviewUrlListOld = angular.copy(m.ocTaskReview.reviewUrlList);
                                            m.ocTaskReview.reviewUrlList = setUrlist(m.ocTaskReview.reviewUrlList);
                                        }
                                        if(m.ocTaskReviewRecordList && m.ocTaskReviewRecordList.length>0){
                                        	angular.forEach(m.ocTaskReviewRecordList,function(v_,i){
                                                v_.reviewUrlListOld = angular.copy(v_.reviewUrlList);
                                                v_.reviewUrlList = setUrlist(v_.reviewUrlList);
                                            })
                                        }
                                }
                            });
                            if (start == 0) {
                                $scope.homeWk_studentList = list;
                            } else {
                                $scope.homeWk_studentList = $scope.homeWk_studentList.concat(list);
                            }
                            if (data.context.items) {
                                $scope.page1 = $scope.page1 * 1 + list.length * 1;
                            }
//                          $scope.homeWk_studentList = data.context.items;
                            $scope.unSubmitStudent = brr;
                        }
                    }
                })
            }
            function deleteComtInfo(d){
                var param = {
                    taskReviewId:d.taskReviewId
                }
                detailMsk("删除后不可恢复，是否删除点评内容？",function(){
                    $.hello({
                    url: CONFIG.URL + "/api/oa/onlineCourse/deleteOcTaskReview",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            getHomeWkList(0);
                        }
                    })
                });
            }
            function deleteZhui(d){
                var param = {
                    taskReviewRecordId:d.taskReviewRecordId
                }
                detailMsk("删除后不可恢复，是否删除评论内容？",function(){
                    $.hello({
                    url: CONFIG.URL + "/api/oa/onlineCourse/deleteOcTaskReviewRecord",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            getHomeWkList(0);
                        }
                    })
                });
            }
            function onceSubWk() {
                var isSub = layer.confirm('是否提醒未交作业的学员提交作业？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    $.hello({
                         url: CONFIG.URL + "/api/oa/onlineCourse/taskRemind",
                        type: "get",
                        data: {lessonId:$scope.props.item ? $scope.props.item.lessonId : undefined},
                        success: function(data) {
                            if(data.status == "200"){
                                layer.msg("作业已催交");
                                layer.close(isSub);
                            }
                        }
                    })
                }, function() {
                    layer.close(isSub);
                })
            }
        }
    })
})