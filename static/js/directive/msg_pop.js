define(['szpUtil'], function() {
    creatPopup({
        el: 'msgPop',
        openPopupFn: 'viewMsgpop',
        htmlUrl: './templates/popup/msg_pop.html',
        controllerFn: function($scope, props,SERVICE,$timeout) {
            console.log(props);
//          var props=angular.copy(props);
            $scope.props = props;
            init();
            function init(){
                switch (props.title) {
                    case "发送消息":
                        sendMsgInit(); //发送
                        break;
                    case "编辑":
                        eidtMsgInit(); //编辑
                        break;
                    case "确认信息":
                        deleteInit(); //删除
                        break;
                    default:
                        break;
                };
                $scope.deleteImg = deleteImg;//删除图片
                $scope.add_img = add_img;//选择上传图片
                $scope.delTeacher_ = delTeacher_;//删除老师
                $scope.selTeacher_ = selTeacher_;//选择老师
                $scope.confirm_btn = confirm_btn;//确认信息的确认按钮
                $scope.gotoSendMsg = gotoSendMsg;//发送消息
                $scope.gotoEditMsg = gotoEditMsg;//编辑消息
                $scope.gotoConfirmInfo = gotoConfirmInfo;//确认信息
            }
            function gotoSendMsg($div,width,item){
                props.isAdd=false;
                props.location="inside";
                $scope.goPopup('sendMsg_pop','760px',props);
                
            }
            function gotoEditMsg(type,width){
                props.isAdd=false;
                props.location="inside";
                $scope.goPopup(type,width,props);
                if(type == "sendMsg_pop"){
                    props.title="发送消息";
                    sendMsgInit();
                }else{
                    props.title="编辑";
                    eidtMsgInit();
                }
            }
            function gotoConfirmInfo(isDelete){
                if(isDelete){
                    props.isDelete = true;
                }else{
                    props.isDelete = false;
                }
                props.location = "inside";
                $scope.goPopup('confirmDel_pop','560px',props);
                deleteInit();
            }
            //发送 init
            function sendMsgInit(){
                var datas=angular.copy(props.item);
                $scope.navigation_bar_bgm = "1";
                $scope.selectedModel = "";
                $scope.send_model = {
                    title:"",
                    desc:"",
                    status:"",
                    imgs:[]
                };
                $scope.selectTeacher = [];
                $scope.selectClass = [];
//              $scope.selectStudent = [];
                if(!props.isAdd){
                     $scope.send_model = {
                        title:datas.notificationTitle,
                        desc:datas.notificationDesc,
                        status:datas.notificationStatus,
                        imgs:datas.notificationImgs?datas.notificationImgs:[]
                    };
                }

                getModelList();
                $scope.changeModel = changeModel;
                $scope.next_btn = next_btn;//下一步
                $scope.prve_btn = prve_btn;//上一步
                $scope.sendMsg_btn = sendMsg_btn;//发送消息确认按钮
                
                function changeModel(x){
                    $scope.send_model = {
                        title:"",
                        desc:"",
                        imgs:[]
                    };
                    var datax = JSON.parse(x);
                    if(datax){
                        $scope.send_model = {
                            title:datax.notificationTitle,
                            desc:datax.notificationDesc,
                        }
                        if(datax.notificationImgs) {
                            $scope.send_model.imgs = datax.notificationImgs;
                        }else{
                            $scope.send_model.imgs = [];
                        }
                    }else{
                        $scope.send_model = {
                            title:"",
                            desc:"",
                            imgs:[]
                        }
                    }
                }
                function next_btn(){
                    var datas=angular.copy(props.item);
                    if(!$scope.send_model.desc && $scope.send_model.imgs.length<=0){
                        return layer.msg("内容、图片不可同时为空");
                    }
                    $scope.navigation_bar_bgm = "2";

                    $scope.selectTeacher = [];
                    $scope.selectClass = [];
//                  $scope.selectStudent = [];
                    angular.forEach($scope.teachersList,function(v){
                        v.hasChecked = false;
                    });
                    angular.forEach($scope.classList,function(v){
                        v.hasChecked = false;
                    });
//                  angular.forEach($scope.studentList,function(v){
//                      v.hasChecked = false;
//                  });
                    
                    if(!props.isAdd){
                        if(datas.teachers.length>0){
                            $scope.selectTeacher = datas.teachers;
                        }else{
                            $scope.selectTeacher = [];
                        }
                        if(datas.classInfos.length>0){
                            $scope.selectClass = datas.classInfos;
                        }else{
                            $scope.selectClass = [];
                        }
//                      if(props.item.teachers.length>0){
//                          $scope.selectTeacher = props.item.teachers;
//                      }else{
//                          $scope.selectStudent = [];
//                      }
                    }
                    getTeachers();//校区下老师数据
                    getClasslist();//校区下班级
                    getStudentlist();//校区下学员
                    
                }
                function prve_btn(){
                    $scope.navigation_bar_bgm = "1";
                    
                }
                function sendMsg_btn(btnType){
                    if($scope.selectTeacher.length<=0 && $scope.selectClass.length<=0){
                        return layer.msg("收件员工、收件班级不可同时为空");
                    }
                    var data = {
                        "notificationTitle": $scope.send_model.title,
                        "notificationDesc": $scope.send_model.desc,
                        "notificationImg": getImglist($scope.send_model.imgs),
                    }
                    if($scope.selectTeacher.length>0){
                        data["notificationTeacherId"]=setListToStr($scope.selectTeacher,"teacher");
                    }
                    if($scope.selectClass.length>0){
                        data["notificationClassId"]=setListToStr($scope.selectClass,"class");
                    }
//                  if($scope.selectStudent.length>0){
//                      data["notificationStudentId"]=setListToStr($scope.selectStudent,"student");
//                  }
                    console.log(data);
                    if(btnType == "saveCaogao"){
                        data["notificationStatus"]="0";
//                      console.log("存草稿");
                    }else{
                        data["notificationStatus"]="2";
//                      console.log("确认发送消息");
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/notification/addNotification",
                        type: "post",
                        data: JSON.stringify(data),
                        success: function(data) {
                            if(data.status == '200') {
                                if(props.isAdd){
                                    $scope.$emit('msglistChange',false);
                                }else{
                                    $scope.$emit('msglistChange',true);
                                }
                                if(props.location == "inside"){
                                    $scope.closePopup('msgDetail');
                                }
                                $scope.closePopup('sendMsg_pop');
                            }
        
                        }
                    })
                }
                function getTeachers(){
                    var data={
                        quartersTypeId:"1",
                        shopTeacherStatus:"1",
                        pageType:"0"
                    };
                     $.hello({
                        url: CONFIG.URL + "/api/oa/shopTeacher/list",
                        type: "get",
                        data: data,
                        success: function(data) {
                            if(data.status == '200') {
                                $scope.teachersList = data.context;
                                $timeout(function() {
                                if ($scope.selectTeacher) {
                                        $scope.$broadcast('msg_addTeacher', 'reloadData', {'data': $scope.selectTeacher, 'att': 'teacherId'});
                                    }
                                }, 500,true);
                            }
        
                        }
                    })
                }
                function getClasslist(){
                    var data={
                        classStatus:"1",
                        pageType:"0"
                    };
                     $.hello({
                        url: CONFIG.URL + "/api/oa/class/list",
                        type: "get",
                        data: data,
                        success: function(data) {
                            if(data.status == '200') {
                                $scope.classList = data.context;
                                $timeout(function() {
                                if ($scope.selectClass) {
                                        $scope.$broadcast('msg_addClass', 'reloadData', {'data': $scope.selectClass, 'att': 'classId'});
                                    }
                                }, 500,true);
                            }
        
                        }
                    })
                }
                function getStudentlist(){
                    var data={
                        studentStatus:"0",
                        pageType:"0"
                    };
                     $.hello({
                        url: CONFIG.URL + "/api/oa/student/getStudentCenter",
                        type: "get",
                        data: data,
                        success: function(data) {
                            if(data.status == '200') {
                                $scope.studentList = data.context.items;
                                $timeout(function() {
                                if ($scope.selectStudent) {
                                        $scope.$broadcast('msg_addStudent', 'reloadData', {'data': $scope.selectStudent, 'att': 'studentId'});
                                    }
                                }, 500,true);
                            }
        
                        }
                    })
                }
            }

            function delTeacher_(data, ind,type) {
                data.hasSelected = false;
                switch (type){
                    case 'teacher':
                        $scope.selectTeacher.splice(ind, 1);
                        break;
                    case 'class':
                        $scope.selectClass.splice(ind, 1);
                        break;
                    case 'student':
                        $scope.selectStudent.splice(ind, 1);
                        break;
                    default:
                        break;
                }
            }
    
            function selTeacher_(data,list,type) {
                var judHas = true;
                var judHasIndex = null;
                angular.forEach(list, function(val, index) {
                    switch (type){
                    	case 'teacher':
                    	if(val.teacherId == data.teacherId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    		break;
                    	case 'class':
                        	if(val.classId == data.classId) {
                                judHas = false;
                                judHasIndex = index;
                            }
                    		break;
                    	case 'student':
                        	if(val.id == data.id) {
                                judHas = false;
                                judHasIndex = index;
                            }
                    		break;
                    	default:
                    		break;
                    }
                    
                });
                if(judHas) {
                    switch (type){
                        case 'teacher':
                            $scope.selectTeacher.push(data);
                            break;
                        case 'class':
                            $scope.selectClass.push(data);
                            break;
                        case 'student':
                            $scope.selectStudent.push(data);
                            break;
                        default:
                            break;
                    }
                    data.hasSelected = true;
                } else {
                     switch (type){
                        case 'teacher':
                            $scope.selectTeacher.splice(judHasIndex, 1);
                            break;
                        case 'class':
                            $scope.selectClass.splice(judHasIndex, 1);
                            break;
                        case 'student':
                            $scope.selectStudent.splice(judHasIndex, 1);
                            break;
                        default:
                            break;
                    }
                    data.hasSelected = false;
                }
            }
            function getModelList() { //获取模板列表
                var data = {
                    "status": 1,
                    "pageType": 0
                }
                for(var i in data) {
                    if(data[i] == '' || data[i] == undefined) {
                        delete data[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/notification/getNotificationList",
                    type: "get",
                    data: data,
                    success: function(data) {
    
                        if(data.status == '200') {
                            $scope.modelList = data.context.items;
                        }
    
                    }
                })
            }
            //编辑 init
            function eidtMsgInit(){
                var datas = angular.copy(props.item);
                if(props.isAdd){
                    $scope.modelDetail={
                        title:"",
                        desc:"",
                        notificationId:"",
                        imgs:[]
                    };
                   console.log("创建模板"); 
                }else{
                    $scope.modelDetail={
                        title:datas.notificationTitle?datas.notificationTitle:"",
                        desc:datas.notificationDesc?datas.notificationDesc:"",
                        notificationId:datas.notificationId?datas.notificationId:"",
                        imgs:datas.notificationImgs?datas.notificationImgs:[]
                    };
                    console.log("编辑模板"); 
                }
                $scope.model_confirm = model_confirm;//确认模板
                
                function model_confirm(){
                    if(!$scope.modelDetail.desc && !getImglist($scope.modelDetail.imgs)){
                        return layer.msg("内容、图片不可同时为空");
                    }
                    var url;
                    var params={
                            "notificationTitle": $scope.modelDetail.title,
                            "notificationDesc": $scope.modelDetail.desc,
                            "notificationImg": getImglist($scope.modelDetail.imgs),
                        }
                    
                    if(props.isAdd){
                        params["notificationStatus"]=1;
                        url="/api/oa/notification/addNotificationTemplate";
                    }else{
                        params["notificationId"]=$scope.modelDetail.notificationId;
                        url="/api/oa/notification/updateNotification";
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(data) {
                            if(data.status == '200') {
                                if(props.isAdd){
                                    $scope.$emit("msglistChange",true);
                                }else{
                                    $scope.$emit("msglistChange",false);
                                }
                                if(props.location == "inside"){
                                    $scope.closePopup('msgDetail');
                                }
                                $scope.closePopup('creatModel_pop');
                            }
        
                        }
                    })
                }
               
            }
            function add_img(list){
                setTimeout(function() {
                    szpUtil.util_addImg(false, function(data) {
                        console.log(data);
                        if(data){
                            list.push(data);
                        }
                        $scope.$apply();
                    })
                });
            }
            function deleteImg(ind,list){
                list.splice(ind,1);
            }
            function getImglist(list){
                var str="";
                angular.forEach(list,function(n){
                    var imgVal="";
                    var index = n.lastIndexOf("\/");
                    imgVal = n.substring(index + 1, n.length);
                    str+=imgVal+",";
                });
               str=str.substr(0,str.length-1);
                return str;
            }
            function setListToStr(list,type){
                var str="";
                angular.forEach(list,function(v){
                    switch (type){
                    	case 'teacher':str+=v.teacherId+",";
                    		break;
                    	case 'class':str+=v.classId+",";
                    		break;
                    	case 'student':str+=v.id+",";
                    		break;
                    	default:
                    		break;
                    }
                    
                });
                str=str.substr(0,str.length-1);
                return str;
            }
            //删除 init
            function deleteInit(){
                $scope.isDeteleInfo = props.isDelete?true:false;
            }
            //确认删除或发送弹框
            function confirm_btn(list){
                if($scope.isDeteleInfo){
                    var data = {
                        "notificationId": list.notificationId
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/notification/deleteNotification",
                        type: "post",
                        data: JSON.stringify(data),
                        success: function(data) {
                            if(data.status == '200') {
                                $scope.$emit("msglistChange",false);
                                if(props.location == "inside"){
                                    $scope.closePopup('msgDetail');
                                }
                                $scope.closePopup('confirmDel_pop');
                            }
        
                        }
                    })
                }else{
                    sendNews(list);
                }
            }
            //草稿发送按钮
            function sendNews(list) {
                var classList = "",
                    teacherList = "";
                var classInfo = list.classInfos;
                var teacher = list.teachers;
                if(classInfo) {
                    angular.forEach(classInfo, function(v, k) {
                        classList += v.classId + ",";
                    });
                    classList = classList.substring(0, classList.length - 1);
                }
                if(teacher) {
                    angular.forEach(teacher, function(v, k) {
                        teacherList += v.teacherId + ",";
                    });
                    teacherList = teacherList.substring(0, teacherList.length - 1);
                }
                var data = {
                    "notificationTitle": list.notificationTitle,
                    "notificationDesc": list.notificationDesc,
                    "notificationImg": list.notificationImg,
                    "notificationClassId": classList,
                    "notificationTeacherId": teacherList,
                    "notificationId": list.notificationId,
                    "notificationStatus": 2
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/notification/updateNotification",
                    type: "post",
                    data: JSON.stringify(data),
                    success: function(data) {
                        if(data.status == '200') {
                            $scope.$emit("msglistChange",false);
                            if(props.location == "inside"){
                                $scope.closePopup('msgDetail');
                            }
                            $scope.closePopup('confirmDel_pop');
                        }
    
                    }
                })
            }
        }
    })
});