define(['laydate', 'mySelect','szpUtil','databasePop'], function(laydate) {
    creatPopup({
        el: 'clockPop',
        openPopupFn: 'viewClock',
        htmlUrl: './templates/popup/clock_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state,$sce) {
            $scope.localTeachId = window.currentUserInfo.teacherId;
            $scope.props = angular.copy(props);
            console.log($scope.localTeachId);
            init();
            function init(){
                getConfig();
                getPoints();
                $scope.popNav = [{
                    name: '作业详情',
                    tab: 1
                }, {
                    name: '打卡记录',
                    tab: 2
//              }, {
//                  name: '数据汇总',
//                  tab: 3
                }];
                if(props.page == "mySchedule"){
                    $scope.operateClass = true;//操作课务
                }else{
                    $scope.operateClass = checkAuthMenuById("79");
                }
                
                 $scope.changePopNav = changePopNav; //主弹框tab切换
                 $scope.goViewStudent = goViewStudent;//查看学员的总打卡记录
                 $scope.deleteTeach1 = deleteTeach;//删除老师的评论
                 $scope.deleteTeach2 = deleteTeach;//删除老师的评论
                 $scope.showContentFun = showContentFun;//切换作业评论按钮
                 $scope.delete_showInfo = delete_showInfo; //删除已选择的图片、音频、视频
                 $scope.sendComment = sendComment;//确定发送按钮
                 $scope.add_showInfo = add_showInfo;
                 $scope.openPhotos = openPhotos;//查看相册
                 
                 if(props.item){
                     getInfoHomeworkR();
                 }
                 $scope.goCommonPop = function(el,id,width,data){
                    window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
                }
            }
            function changePopNav(val) {
                $scope.popNavSelected = val;
                switch (val) {
                    case 1:
                        HOMEWKCONTENT();
                        break;
                    case 2:
                        CLOCKRECORD();
                        break;
//                  case 3:
//                      DATATOTAL();
//                      break;
                    default:
                        break;
                }
            }
            function getConfig(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getShop",
                    type: "get",
                    success: function (data) {
                        if (data.status == '200') {
                            $scope.config = data.context.config;
                            $scope.jifen =  CONFIG_INTEGRAL_CONTROL &($scope.config);
                        }
                    }
                })
            }
            function getInfoHomeworkR(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/homework/infoHomeworkR",
                    type: "get",
                    data: {homeworkRId:props.item.homeworkRId},
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.show_picListOld = angular.copy(data.context.homework.urlList);
                            data.context.homework.urlList = setUrlist(data.context.homework.urlList);
                            $scope.homeworkInfo = data.context;
                            if (props.tab) {
                                changePopNav(props.tab);
                            }
                        }
                    }
                });
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
            //作业内容
            function HOMEWKCONTENT(){
                DATATOTAL();
                $scope.homeWk_delete = homeWk_delete;//删除作业
                
                function homeWk_delete(){
                    detailMsk("系统将同时删除已提交的学员作业，<br>删除后不可恢复，是否删除作业？",function(){
                        $.hello({
                            url: CONFIG.URL + "/api/oa/homework/deleteHomeworkR",
                            type: "post",
                            data: JSON.stringify({homeworkRId:$scope.homeworkInfo.homeworkRId}),
                            success: function(data) {
                                if (data.status == "200") {
                                    if(props.page == 'clock'){
                                        $scope.$emit("clsAffair_clock", false);
                                    }
                                    if(props.page == 'classPop'){
                                         if(SERVICE.CLASSPOP.CLOCK[props.callBackName]) {
                                            SERVICE.CLASSPOP.CLOCK[props.callBackName]();
                                        };
                                    }
                                    $scope.closePopup('clockDetail_pop');
                                }
                            }
                        });
                    });
                }

            }
            //打卡记录
            function CLOCKRECORD(){
                $scope.select_start = $scope.select_end = true;
                if($scope.homeworkInfo.homework.homeworkType == '0'){
                    $scope.clock_time_frame = yznDateFormatYMd($scope.homeworkInfo.homework.beginTime);
                }else if($scope.homeworkInfo.homework.homeworkType == '1'){
                    $scope.clock_time_frame = yznDateFormatYMd(new Date());
                }else if($scope.homeworkInfo.homework.homeworkType == '2'){
                    $scope.clock_time_frame = yznDateFormatYMd($scope.homeworkInfo.homework.endTime);
                }
//              $scope.clock_time_frame = yznDateFormatYMd(new Date());
                getClockRecord();
                getClockRecordList();
                $scope.beginTime=$scope.homeworkInfo.homework.beginTime;
                $scope.endTime=$scope.homeworkInfo.homework.endTime;
                $timeout(function(){
                    laydate.render({
                        elem: '#clock_time', //指定元素
                        isRange: false,
                        min:$scope.beginTime,
                        max:$scope.endTime,
                        btns: [],
                        format: 'yyyy-MM-dd',
                        done: function(value) {
                            $scope.clock_time_frame = value;
                            getClockRecord();
                            getClockRecordList();
                            $scope.$apply();
                        }
                    }); 
                });
//              var screenName = screenType = undefined;
//              $scope.screen_InfoNameId = 'studentName'; //select初始值
//              $scope.screen_searchData = {
//                  studentName:'姓名',
//                  studentNickName:'昵称',
//                  userPhone:'手机号'
//              };
                

                $scope.goViewUnclock = goViewUnclock;
//              $scope.screen_SearchBtn = screen_searchBtn; //搜索按钮
//              $scope.screen_Enterkeyup = screen_searchBtn; //keyup筛选
                $scope.TimeFrameEvent = TimeFrameEvent;
                function goViewUnclock(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/unClockList",
                        type: "get",
                        data: {homeworkRId:$scope.homeworkInfo.homeworkRId,date:$scope.clock_time_frame},
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.unclockStudents = data.context;
                                $scope.goPopup("unClockStuds","760px");
                            }
                        }
                    });
                }
                function getClockRecordList(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/homeWorkStudentRecordTotal",
                        type: "get",
                        data: {homeworkRId:$scope.homeworkInfo.homeworkRId,date:$scope.clock_time_frame},
                        success: function(data) {
                            if (data.status == "200") {
//                              clockNum : 打卡数量
//                              unClockNum：未打卡数量
                                $scope.clockNum = data.context.clockNum;
                                $scope.unClockNum = data.context.unClockNum;
                            }
                        }
                    });
                }
//              function screen_searchBtn(data) {
//                  screenName = data.value;
//                  screenType = data.type;
//                  pagerRender = false;
//                  reloadList(type);
//              }
                function TimeFrameEvent(n){
                    switch (n){
                    	case 1:$scope.clock_time_frame = yznDateAddWithFormat($scope.clock_time_frame,-1,"yyyy-MM-dd");
                    		break;
                    	case 2:$scope.clock_time_frame = yznDateAddWithFormat($scope.clock_time_frame,1,"yyyy-MM-dd");
                    		break;
                    	case 3:$scope.clock_time_frame = yznDateFormatYMd(new Date());
                    		break;
                    	default:
                    		break;
                    }
                    getClockRecord();
                    getClockRecordList();
                }
                
                $scope.$watch('clock_time_frame',function(){
                    if(dateToTime($scope.clock_time_frame)>dateToTime($scope.beginTime)){
                        $scope.select_start = true;
                    }else{
                        $scope.select_start = false;
                    }
                    if(dateToTime($scope.endTime)>dateToTime($scope.clock_time_frame)){
                        $scope.select_end = true;
                    }else{
                        $scope.select_end = false;
                    }
                    
                });

                function dateToTime(time){
                    var time1 = yznDateParse(time);
                    var dateTime = time1.getTime();
                    return dateTime;
                }
            }
            function getClockRecord(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/homework/listStudentHomeWork",
                    type: "get",
                    data: {homeworkRId:$scope.homeworkInfo.homeworkRId,date:$scope.clock_time_frame},
                    success: function(data) {
                        if (data.status == "200") {
                            angular.forEach(data.context, function(v) {
                                if(v.task){
                                    v.task.review_picListOld = angular.copy(v.task.taskUrlList);
                                    v.task.taskUrlList = setUrlist(v.task.taskUrlList);
                                    if(v.task.taskReviews && v.task.taskReviews.length>0){
                                        angular.forEach(v.task.taskReviews,function(v_){
                                            v_.review_picListOld_ = angular.copy(v_.taskTeacherUrlList);
                                            v_.taskTeacherUrlList = setUrlist(v_.taskTeacherUrlList);
                                        });
                                    }
                                }
                                
                            });
                            $scope.clockRecordList = data.context;
                        }
                    }
                });
            }
            function getPoints(){
                     $.hello({
                        url: CONFIG.URL + "/api/oa/points/listPointsRule",
                        type: 'get',
                        data: {ruleType:1},
                        success: function(data) {
                            if(data.status == 200){
                                var list = data.context;
                                for(var i in list){
                                    if(list[i].pointsItemId == 13){//打卡积分
                                        $scope.points = list[i].pointsRuleDetailList?list[i].pointsRuleDetailList[0].pointsValue:"0";
                                        $scope.dakaJifen = list[i].status;
                                        break;
                                    }
                                }
                            }
                        }
                    })
                }
            //数据汇总
            function DATATOTAL(){
                $scope.openPoints = openPoints;//积分弹框
                $scope.editPoint = editPoint;//确认添加或编辑积分
                gethomeworkStudentDataTotal();
                gethomeworkStudentTotal();
                function gethomeworkStudentTotal(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/homeworkStudentTotal",
                        type: "get",
                        data: {homeworkRId:$scope.homeworkInfo.homeworkRId},
                        success: function(data) {
                            if(data.status == "200"){
                                $scope.homeworkStudentTotal = data.context;
                            }
                        }
                    })
                }
                function gethomeworkStudentDataTotal(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/homeworkStudentDataTotal",
                        type: "get",
                        data: {homeworkRId:$scope.homeworkInfo.homeworkRId},
                        success: function(data) {
                            if(data.status == "200"){
                                $scope.studentNum  = data.context.studentNum;
                                $scope.homeworkNum  = data.context.homeworkNum;
                            }
                        }
                    })
                }
                function openPoints(){
                    $scope.homeworkStudentTotal_pop = angular.copy($scope.homeworkStudentTotal);
                    angular.forEach($scope.homeworkStudentTotal_pop,function(v){
                        if(!v.pointsValue){
                            v.pointsValue = $scope.points;
                        }
                    });
                    $scope.goPopup("pointsList_pop","760px");
                }
                
                function editPoint(){
                    var arr=[];
                    angular.forEach($scope.homeworkStudentTotal_pop,function(v){
                        arr.push({
                            potentialCustomerId:v.potentialCustomerId,
                            pointsValue:v.pointsValue
                        });
                    });
                    var param={
                        pointsRecordList:arr,
                        homeworkRId:props.item.homeworkRId
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/teacher/home/points/updateHomework",
                        type: 'post',
                        data: JSON.stringify(param),
                        success: function(data) {
                            if(data.status == 200){
                                getInfoHomeworkR();
                                gethomeworkStudentTotal();
                                $scope.closePopup('pointsList_pop');
                            }
                        }
                    })
                }
            }
            
            function goViewStudent(s){
                $scope.studentDetail = angular.copy(s);
                viewStudentClock(s);
                
                $scope.goPopup("clockDetail","960px");
            }
            function viewStudentClock(d){
                $.hello({
                        url: CONFIG.URL + "/api/oa/homework/listStudentHomeWork",
                        type: "get",
                        data: {homeworkRId:$scope.homeworkInfo.homeworkRId,potentialCustomerId:d.potentialCustomerId},
                        success: function(data) {
                            if(data.status == "200"){
                                 angular.forEach(data.context, function(v) {
                                     if(v.task){
                                        v.task.review_picListOld = angular.copy(v.task.taskUrlList);
                                        v.task.taskUrlList = setUrlist(v.task.taskUrlList);
                                        if(v.task.taskReviews && v.task.taskReviews.length>0){
                                            angular.forEach(v.task.taskReviews,function(v_){
                                                v_.review_picListOld_ = angular.copy(v_.taskTeacherUrlList);
                                                v_.taskTeacherUrlList = setUrlist(v_.taskTeacherUrlList);
                                            });
                                        }
                                     }
                                });
                                $scope.clockStudentList = data.context;
                            }
                        }
                    })
            }
            function deleteTeach(d,stype){
                detailMsk("删除后不可恢复，是否删除作业评论内容？",function(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/homework/deleteTaskReview",
                        type: "post",
                        data: JSON.stringify({taskReviewId:d.taskReviewId}),
                        success: function(data) {
                            if(data.status == "200"){
                                if(stype == 'record'){
                                    getClockRecord();
                                    console.log("刷新打卡记录列表");
                                }else{
                                    viewStudentClock($scope.studentDetail);
                                    console.log("刷新学员打卡列表");
                                }
                            }
                        }
                    })
                });
            }
            function showContentFun(m){
                m.showContent = !m.showContent;
                $scope.addcommentData = {
                    reviewsRecordUrl:[],
                    reviewsContent:''
                };
            }
            if(!$scope.addcommentDatabase){
                $scope.addcommentDatabase = $scope.$on('打卡评论-资料库',function(e,data){
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
                    $scope.addcommentData.reviewsRecordUrl = $scope.addcommentData.reviewsRecordUrl.concat(data);
                });
            }
            function delete_showInfo(ind, list) {
                list.splice(ind, 1);
            }
            function sendComment(x,t){
                if (!$scope.addcommentData.reviewsContent && $scope.addcommentData.reviewsRecordUrl.length <= 0) {
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
                    taskId:x.taskId,
                    taskTeacherDesc: $scope.addcommentData.reviewsContent,
                    taskTeacherUrl: getUrlList($scope.addcommentData.reviewsRecordUrl)
                }
                
                $.hello({
                    url: CONFIG.URL + "/api/oa/myCourse/addTaskReview",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            if(t){
                                viewStudentClock($scope.studentDetail);
                            }else{
                                getClockRecord();
                            }
                            x.showContent = false;
                        }
                    }
                })
            }
            function openPhotos(value, list) {
                if (list.length <= 0) {
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
                            }, {multiple:true,type: 'image/gif, image/jpeg, image/png'}, uploadObserver);
                        }, 100);
                        break;
                    case 'voice': //添加音频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
                            }, {
                                type: 'audio/mp3,audio/m4a,audio/x-m4a'
                            }, uploadObserver);
                        });
                        break;
                    case 'video': //添加视频
                        $timeout(function() {
                            szpUtil.util_addImg(false, function(data) {
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
                        
        }
    })
})