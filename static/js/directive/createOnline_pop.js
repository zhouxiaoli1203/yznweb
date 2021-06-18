define(['laydate', 'mySelect','szpUtil','students_sel','homewkPop',"photoPop","databasePop"], function(laydate) {
    creatPopup({
        el: 'onlinePop',
        openPopupFn: 'viewOnline',
        htmlUrl: './templates/popup/createOnline_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state,$sce) {
            var s_pagerRender = false,s_start = 0,s_eachPage = 10;
            var s_searchName = s_searchType = undefined;
        	$scope.props = angular.copy(props);
        	console.log(props);
        	$scope.fromPage = $scope.props.fromPage;
        	$scope.localTeachId = window.currentUserInfo.teacherId;
        	init();
        	function init(){
        		$scope.sel_allFun = checkboxAllFun;//全选本页数据
                $scope.sel_singleFun = checkSingleFun;//选择某一条数据
                $scope.caclBirthToAge = caclBirthToAge;//计算年龄
        		switch ($scope.props.toModel){
        			case "创建线上课程":
        			    createInit();
        				break;
        			case "课程详情":
        			    courseInfoInit();
        				break;
        			default:
        				break;
        		}
        		$scope.goCommonPop = function(el,id,width,data){
	                window.$rootScope.yznOpenPopUp($scope,el,id,width,data);
	            }
        	}
        	//以下   创建和编辑线上课程
        	function createInit(){
        		getTeachers();
        		if($scope.props.type == "add"){
        			$scope.courseData = {
		        		name:"",
		        		beginDate:"",
		        		apt_teachers:[],
		        		apt_students:[]
		        	};
        		}else{
        			if($scope.props.item){
	        			$scope.courseData = {
			        		name:$scope.props.item.name,
			        		beginDate:yznDateFormatYMd($scope.props.item.beginDate),
			        		apt_teachers:$scope.props.item.teacherList,
			        		apt_students:[]
			        	};
        			}
        		}

	        	laydate.render({
	                elem: '#beginDate', //指定元素
	                isRange: false,
	                done: function(value) {
	                    $scope.courseData.beginDate = value;
	                }
	            });
	            
	            $scope.sel_teachers = sel_teachers;
	        	$scope.checkStudent = checkStudent;
	        	$scope.delTeachers = delTeachers;
	        	$scope.delStudent = delStudent;
	        	$scope.confirm_create = confirm_create;//确认线上课程
        	}
        	function getTeachers() { //获取岗位类型list
	            $.hello({
	                url: CONFIG.URL + "/api/oa/shopTeacher/list",
	                type: "get",
	                data:{pageType:"0",shopTeacherStatus:"1",quartersTypeId:"1"},
	                success: function(data) {
	                    if(data.status == 200) {
	                        $scope.teachersList = data.context;
	                        $timeout(function() {
		                        if ($scope.courseData) {
		                            $scope.$broadcast('class_addTeacher', 'reloadData', {
		                                'data': $scope.courseData.apt_teachers,
		                                'att': 'teacherId'
		                            });
		                        }
		                    }, 500, true);
		                }
	                }
	            })
	        }
            function delTeachers(data, ind) {
                data.hasSelected = false;
                $scope.courseData.apt_teachers.splice(ind, 1);
            }

            function sel_teachers(data) {
                var judHas = true;
                var judHasIndex = null;
                angular.forEach($scope.courseData.apt_teachers, function(val, index) {
                    if (val.teacherId == data.teacherId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                });
                if (judHas) {
                    $scope.courseData.apt_teachers.push(data);
                    data.hasSelected = true;
                } else {
                    $scope.courseData.apt_teachers.splice(judHasIndex, 1);
                    data.hasSelected = false;
                }
            }
            function checkStudent(){
                window.$rootScope.yznOpenPopUp($scope,'student-sel','selectStuds_online', '760px',{ type: 'student_online',choseType: 'checkbox', sourcePage:'线上',callBackName: '线上课程-添加学员',oldData:$scope.courseData.apt_students});
            }
            function delStudent(x,ind){
                $scope.courseData.apt_students.splice(ind,1);
            }
            $scope.$on("线上课程-添加学员",function(evt,data){
                angular.forEach(data, function(val) {
                    var judge = true;
                    angular.forEach($scope.courseData.apt_students, function(val_) {
                        if(val.potentialCustomerId == val_.potentialCustomerId) {
                            judge = false;
                        }
                    })
                    if(judge) {
                        $scope.courseData.apt_students.push(val);
                    }
                })
               
            });
            function confirm_create(){
                if($scope.courseData.apt_teachers && $scope.courseData.apt_teachers.length<=0){
                    return layer.msg("课程负责老师至少一位");
                }
            	var param = {
            		name:$scope.courseData.name,
            		beginDate:$scope.courseData.beginDate,
            		teacherList:getArrId($scope.courseData.apt_teachers,"teacher"),
            	};
            	if($scope.props.type == 'add'){
            		param["studentList"] = getArrId($scope.courseData.apt_students,"student");
            	}else{
            		param["courseId"] = $scope.props.item?$scope.props.item.courseId:undefined;
            	}
            	console.log(param);
            	$.hello({
	                url: CONFIG.URL + "/api/oa/onlineCourse/"+($scope.props.type == "add"?"addCourse":"updateCourse"),
	                type: "post",
	                data:JSON.stringify(param),
	                success: function(data) {
	                    if(data.status == 200) {
	                        if($scope.props.type == 'add'){
    	                    	$scope.$emit("reloadCourseOnline",data.context);
	                        }else{
                                $scope.courseInfo.name = $scope.courseData.name;
                                $scope.courseInfo.beginDate = $scope.courseData.beginDate;
                                $scope.courseInfo.teacherList = $scope.courseData.apt_teachers;
    	                    	$scope.$emit("reloadCourseOnline");
	                        }
    	                    $scope.closePopup('creatCoursePop');
		                }
	                }
	            })
            }
            function getArrId(list,name){
            	var arr = [];
            	if(name == "teacher"){
	            	angular.forEach(list,function(v){
	            		arr.push({
	            			shopTeacherId:v.shopTeacherId
	            		});
	            	});
            	}else{
	            	angular.forEach(list,function(v){
	            		arr.push({
	            			potentialCustomerId:v.potentialCustomerId
	            		});
	            	});
            	}
            	return arr;
            }
            //以下  课程详情
            function courseInfoInit(){
            	$scope.courseInfo = $scope.props.item?$scope.props.item:undefined;
            	$scope.popNav=[
            	    {
                        name: '教学内容',
                        tab: 1
                    },
            	    {
                        name: '在课学员',
                        tab: 2
                    },
            	    {
                        name: '作业点评',
                        tab: 3
                    },
            	    {
                        name: '留言管理',
                        tab: 5
                    },
            	    {
                        name: '数据统计',
                        tab: 4
                    },
            	];
            	$scope.changePopNav = changePopNav;
            	$scope.openEditCourse = openEditCourse;
            	$scope.deleteCourse = deleteCourse;
            	changePopNav($scope.props.tab);
            }
            function getCourseInfo(){
                $.hello({
                        url: CONFIG.URL + '/api/oa/onlineCourse/getCourseInfo',
                        type: "post",
                        data: JSON.stringify({courseId:$scope.props.item?$scope.props.item.courseId:undefined}),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.courseInfo = data.context;
                            }
        
                        }
                    })
            }
            function openEditCourse(){
            	$scope.props = {toModel:'创建线上课程',type:'edit',item:$scope.courseInfo};
            	createInit();
            	$scope.goPopup("creatCoursePop","660px")
            }
            function deleteCourse(){
            	detailMsk("是否删除该课程？将同时删除课程内所有数据，删除后不可恢复，请谨慎操作。",function(){
	        		$.hello({
		                url: CONFIG.URL + '/api/oa/onlineCourse/deleteCourse',
		                type: "post",
		                data: JSON.stringify({courseId:$scope.courseInfo.courseId}),
		                success: function(data) {
		                    if (data.status == '200') {
		                    	$scope.$emit("reloadCourseOnline")
		                    	$scope.closePopup('courseDetail_pop');
		                    }
		
		                }
		            })
	        	});
            }
            function changePopNav(val) {
                $scope.popNavSelected = val;
                switch (val) {
                    case 1:
                        TAB1();
                        break;
                    case 2:
                        TAB2();
                        break;
                    case 3:
                        TAB3();
                        break;
                    case 4:
                        TAB4();
                        break;
                    case 5:
                        TAB5();
                        break;
                    default:
                        break;
                }
            } 
            //教学内容
            function TAB1(){
                
                getlistLesson();
            	$scope.toAddKeci = toAddKeci;//添加课次
            	$scope.confirm_addKeci = confirm_addKeci;//确认添加/编辑课次
            	$scope.confirm_addKeci_edit = confirm_addKeci_edit;//确认添加/编辑课次
            	$scope.deleteKeci = deleteKeci;//删除课次
            	$scope.openPhotos = openPhotos; //照片查看器
            	$scope.add_showInfo = add_showInfo;
            	$scope.delete_showInfo = delete_showInfo;//删除课件
            	$scope.delete_showInfo_hwk = delete_showInfo_hwk;//删除多媒体
            	$scope.toAddHomewk = toAddHomewk;//添加作业
            	$scope.toDeleteHomewk = toDeleteHomewk;//删除作业
            	$scope.confirm_setHomewk = confirm_setHomewk;//确认添加作业
            	$scope.onDropComplete = onDropComplete;//移动排序
            	$scope.closeKeciPopup = closeKeciPopup;//关闭添加/编辑课次弹框

            }
            function toAddKeci(type,x){
                $scope.addOrEditkeci = type;
                if(type == "add"){
                    $scope.keciData = {
                        name:"",
                        startTime:"",
                        startTime_Hm:"08:00",
                        fileList:[],
                        task:{}
                    };
                }else{
                    $scope.keciInfo = angular.copy(x);
                    console.log($scope.keciInfo);
                    if($scope.keciInfo.fileList && $scope.keciInfo.fileList.length>0){
                        angular.forEach($scope.keciInfo.fileList,function(v){
                            v.fileName = v.name;
                            v.key = v.fileKey;
                            switch (v.fileType){
                                case "image":
                                v.imageUrl = v.fileUrl;
                                    break;
                                case "audio":
                                v.audioUrl = v.fileUrl;
                                v.audioUrl_ = $sce.trustAsResourceUrl(v.fileUrl);
                                    break;
                                case "video":
                                v.videoUrl = v.fileUrl;
                                v.videoUrl_ = $sce.trustAsResourceUrl(v.fileUrl);
                                    break;
                                case "word":
                                v.wordUrl = v.fileUrl;
                                v.wordUrl_ = $sce.trustAsResourceUrl(v.fileUrl);
                                    break;
                                case "pdf":
                                v.pdfUrl = v.fileUrl;
                                v.pdfUrl_ = $sce.trustAsResourceUrl(v.fileUrl);
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                    $scope.keciData = {
                        lessonId:$scope.keciInfo.lessonId,
                        name:$scope.keciInfo.name,
                        startTime:yznDateFormatYMd($scope.keciInfo.startTime),
                        startTime_Hm:yznDateFormatHm($scope.keciInfo.startTime),
                        fileList:$scope.keciInfo.fileList,
                        task:$scope.keciInfo.task
                    };
                }
                laydate.render({
                    elem: '#startTime', //指定元素
                    format: 'yyyy-MM-dd',
                    isRange: false,
                    done: function(value) {
                        $scope.keciData.startTime = value;
                    }
                });
                laydate.render({
                    elem: '#startTime_Hm', //指定元素
                    type: 'time',
                    format: 'HH:mm',
                    isRange: false,
                    btns:["confirm"],
                    done: function(value) {
                        $scope.keciData.startTime_Hm = value;
                    }
                });
                $scope.goPopup("addKeci_pop","760px");
                if(!$scope.onAddKeciDatabase){
                        $scope.onAddKeciDatabase = $scope.$on('课次-资料库',function(e,data){
                            angular.forEach(data,function(v){
                                v.fileName = v.name;
                                v.key = v.key;
                                v.fileType = v.type;
                                switch (v.fileType){
                                    case "image":
                                    v.imageUrl = v.url;
                                        break;
                                    case "audio":
                                    v.audioUrl = v.url;
                                    v.audioUrl_ = $sce.trustAsResourceUrl(v.url);
                                        break;
                                    case "video":
                                    v.videoUrl = v.url;
                                    v.videoUrl_ = $sce.trustAsResourceUrl(v.url);
                                        break;
                                    case "word":
                                    v.wordUrl = v.url;
                                    v.wordUrl_ = $sce.trustAsResourceUrl(v.url);
                                        break;
                                    case "pdf":
                                    v.pdfUrl = v.url;
                                    v.pdfUrl_ = $sce.trustAsResourceUrl(v.url);
                                        break;
                                    default:
                                        break;
                                }
                            });
                            $scope.keciData.fileList = $scope.keciData.fileList.concat(data);
                        });
                    }
                
            }
            function onDropComplete(index, obj, evt){
                if(evt.data.fileName) {
                        //重新排序
                    var idx = $scope.keciData.fileList.indexOf(obj);
                    $scope.keciData.fileList.splice(idx, 1);
                    $scope.keciData.fileList.splice(index, 0, obj);
                }
            }
            function getlistLesson(){
                $.hello({
                    url: CONFIG.URL + '/api/oa/onlineCourse/listLesson',
                    type: "get",
                    data:{courseId:$scope.courseInfo.courseId},
                    success: function(data) {
                        if (data.status == '200') {
                            var list = data.context.items;
                            angular.forEach(list,function(v){
                                if(v.fileList){
                                    angular.forEach(v.fileList,function(v_){
                                        switch (v_.fileType){
                                            case "image":
                                            v_.imageUrl = v_.fileUrl;
                                                break;
                                            case "audio":
                                            v_.audioUrl = v_.fileUrl;
                                            v_.audioUrl_ = $sce.trustAsResourceUrl(v_.fileUrl);
                                                break;
                                            case "video":
                                            v_.videoUrl = v_.fileUrl;
                                            v_.videoUrl_ = $sce.trustAsResourceUrl(v_.fileUrl);
                                                break;
                                            case "word":
                                                v_.wordUrl = v_.fileUrl;
                                                v_.wordUrl_ = $sce.trustAsResourceUrl(v_.fileUrl);
                                            case "pdf":
                                                v_.pdfUrl = v_.fileUrl;
                                                v_.pdfUrl_ = $sce.trustAsResourceUrl(v_.fileUrl);
                                                break;
                                            default:
                                                break;
                                        }
                                    });
                                }
                                if(v.task){
                                    v.task.taskUrlListOld = angular.copy(v.task.taskUrlList);
                                    v.task.taskUrlList = setUrlist(v.task.taskUrlList);
                                }
                            });
                            $scope.keciList = list;
                        }
    
                    }
                })
            }
            function confirm_addKeci_edit(){
                if($scope.addOrEditkeci=='add'){
                    confirm_addKeci('add',true);
                }else{
                    confirm_addKeci('edit');
                }
            }
            
            function confirm_addKeci(type,isResub){
                var URL;
                if(!$scope.keciData.name || !$scope.keciData.startTime || !$scope.keciData.startTime_Hm){
                    return layer.msg("必填项不能为空");
                }

//              if(!(CompareDate(yznDateFormatYMdHm($scope.keciData.startTime+" "+$scope.keciData.startTime_Hm),yznDateFormatYMdHm($scope.courseInfo.beginDate+" 00:00:00")) && CompareDate(yznDateFormatYMdHm($scope.keciData.startTime+" "+$scope.keciData.startTime_Hm),yznDateFormatYMdHm(new Date())))){
//                  return layer.msg("课次开始时间必须大于等于 课程开课时间 和 当前时间。");
//              }

                if($scope.keciData.fileList && $scope.keciData.fileList.length<=0){
                    return layer.msg("课次内容至少添加一个文件");
                }
                var j = [true,""];
                var list = $scope.keciData.fileList;
                for(var i = 0,len = list.length;i<len;i++){
                    if(!list[i].key){
                        j[0] = false;
                        break;
                    }
                }
                if(!j[0]){
                    return layer.msg("请处理未成功的文件！");
                }
                var param = {
                    "courseId":$scope.courseInfo.courseId, //课程ID
                    "name":$scope.keciData.name, //课次名称
                    "startTime":yznDateFormatYMd($scope.keciData.startTime)+" "+yznDateFormatHm($scope.keciData.startTime_Hm)+":00",  //课次开始时间
                    "fileList":getFilelist($scope.keciData.fileList),
                };
                if($scope.keciData.task && $scope.keciData.task.taskName){
                    var time = $scope.keciData.startTime+$scope.keciData.startTime_Hm;
                    if(yznDateFormatYMdHm(time)>yznDateFormatYMdHm($scope.keciData.task.deadline)){
                        return layer.msg("提交截止时间要大于该课次的开始时间");
                    }
                    param["task"] = {
                        "taskName":$scope.keciData.task.taskName,//作业标题
                        "taskContent":$scope.keciData.task.taskContent,//作业文字内容
                        "taskUrl":getUrlList($scope.keciData.task.taskUrlList),
                        "deadline":yznDateFormatYMd($scope.keciData.task.deadline)+" "+yznDateFormatHm($scope.keciData.task.deadline)+":00" //作业截止时间
                    };
                    if($scope.keciData.task.taskId){
                        param["task"]["taskId"] = $scope.keciData.task.taskId;
                    }
                }
                if(type=="edit" && $scope.keciData.lessonId){
                    param["lessonId"] = $scope.keciData.lessonId;
                    URL = "/api/oa/onlineCourse/updateLesson";
                }else{
                    URL = "/api/oa/onlineCourse/addLesson";
                }
                $.hello({
                    url: CONFIG.URL + URL,
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if (data.status == '200') {
                            getlistLesson();
                            $scope.$emit("reloadCourseOnline");
                            if(isResub){
                                $scope.keciData = {
                                    name:"",
                                    startTime:"",
                                    startTime_Hm:"08:00",
                                    fileList:[],
                                    task:{}
                                };
                               layer.msg("保存成功",{icon:1});
                            }else{
                               $scope.closePopup('addKeci_pop');
                            }
                        }
    
                    }
                })
            }
            function deleteKeci(x){
                detailMsk("是否删除该课次？将同时删除课次内所有数据， 删除后不可恢复，请谨慎操作。",function(){
                    $.hello({
                        url: CONFIG.URL + '/api/oa/onlineCourse/deleteLesson',
                        type: "post",
                        data: JSON.stringify({lessonId:x.lessonId}),
                        success: function(data) {
                            if (data.status == '200') {
                                getlistLesson();
                                $scope.$emit("reloadCourseOnline");
                            }
        
                        }
                    })
                });
            }
            function closeKeciPopup(){
                detailMsk("是否确认放弃本次编辑？",function(){
                    $scope.closePopup("addKeci_pop");
                });
            }
            function getFilelist(list){
                var arr = [];
                angular.forEach(list,function(v){
                    arr.push({
                        "fileKey":v.key,
                        "name":v.fileName,
                        "fileType":v.fileType,
                        "fileId":v.fileId?v.fileId:undefined,
                    });
                });
                
                return arr;
            }
            function toAddHomewk(type,x){
            	if(!$scope.keciData.startTime){
            		return layer.msg("请先填写课次开始时间");
            	}
                if(type == "add"){
                        $scope.homewkData = {
                            taskName:"",
                            taskContent:"",
                            deadline:yznDateAddWithFormat(new Date($scope.keciData.startTime), 7, 'yyyy-MM-dd')+" "+$scope.keciData.startTime_Hm,
                            taskUrlList:[],
                        };
                    }else{
                        $scope.homewkInfo = angular.copy(x);
                        $scope.homewkData = {
                            taskId:$scope.homewkInfo.taskId,
                            taskName:$scope.homewkInfo.taskName,
                            taskContent:$scope.homewkInfo.taskContent,
                            deadline:yznDateFormatYMdHm($scope.homewkInfo.deadline),
                            taskUrlList:$scope.homewkInfo.taskUrlList
                        };
                    }
                    if(!$scope.onAddwkDatabase){
                        $scope.onAddwkDatabase = $scope.$on('作业内容-资料库',function(e,data){
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
                            $scope.homewkData.taskUrlList = $scope.homewkData.taskUrlList.concat(data);
                        });
                    }
                    laydate.render({
                        elem: '#deadline', //指定元素
                        type: "datetime",
                        format: 'yyyy-MM-dd HH:mm',
                        isRange: false,
                        done: function(value) {
                            $scope.homewkData.deadline = value;
                        }
                    });
                    $scope.goPopup("addHomewk_pop","760px");
            }
            function confirm_setHomewk(){
                if (!$scope.homewkData.taskContent && $scope.homewkData.taskUrlList.length <= 0) {
                    return layer.msg("文本和多媒体至少有一个");
                }
                $scope.keciData.task = angular.copy($scope.homewkData);
                $scope.closePopup('addHomewk_pop');
            }
//          function getoldList(list){
//              var arr = [];
//              angular.forEach(list,function(v){
//                  switch (v.fileType){
//                      case "image":
//                      arr.push(v.imageUrl);
//                          break;
//                      case "audio":
//                       arr.push(v.audioUrl);
//                          break;
//                      case "video":
//                       arr.push(v.videoUrl);
//                          break;
//                      default:
//                          break;
//                  }
//              });
//              console.log(arr);
//              return arr;
//          }
            function toDeleteHomewk(){
                detailMsk("是否删除该作业？将同时删除已提交的学员作业，删除后不可恢复，请谨慎操作。",function(){
                    $scope.keciData.task = {};
                });
                
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
            function add_showInfo(type,list,data_source) {
//              if (type == 'img' || type == 'voice' || type == 'video') {
//                  if(from=="show"){
//                      if(list.length > 19){
//                          layer.msg('添加到达上限');
//                          return;
//                      }
//                  }else if(from=="comment"){
//                      if(list.length > 2){
//                          layer.msg('添加到达上限');
//                          return;
//                      }
//                  }else{
//                      if(list.length > 7){
//                          layer.msg('添加到达上限');
//                          return;
//                      }
//                  }
//              }

                var uploadObserver = {
                    'filesSelected': function (files) {
                        angular.forEach(files,function(item){
                            var fileName = item.file.name;
                            var fileUrl = item.fileUrl;
                            var type = item.file.type;
                            var fileType = item.fileType;//文件类型用来页面判断
                            var data = {
                                percent: 0,
                                fileName:fileName.substr(0,fileName.lastIndexOf('.')),
                                fileType:fileType
                            }
                            if (type.indexOf('image') == 0) {
                                data.imageUrl = fileUrl;

                            } else if (type.indexOf('audio') == 0) {
                                data.audioUrl = fileUrl;
                                data.audioUrl_ = $sce.trustAsResourceUrl(fileUrl);

                            } else if (type.indexOf('video') == 0) {
                                data.videoUrl = fileUrl;
                                data.videoUrl_ = $sce.trustAsResourceUrl(fileUrl);
                            } else if (type.indexOf('pdf') >= 0) {
                                data.pdfUrl = fileUrl;
                                data.pdfUrl_ = $sce.trustAsResourceUrl(fileUrl);
                            } else if (type.indexOf('word') >= 0) {
                                data.wordUrl = fileUrl;
                                data.wordUrl_ = $sce.trustAsResourceUrl(fileUrl);
                            }
                            list.push(data);

                        });
                        console.log(list);
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
                            if (item.imageUrl == fileUrl || item.audioUrl == fileUrl || item.videoUrl == fileUrl|| item.wordUrl == fileUrl|| item.pdfUrl == fileUrl) {
                                item.key = key;
                            }
                        });
                        $scope.$apply();
                    },//文件上传成功
                    'progress' : function (fileUrl, percent) {
                        var found = false;
                        angular.forEach(list,function(item) {
                            if (item.imageUrl == fileUrl || item.audioUrl == fileUrl || item.videoUrl == fileUrl|| item.wordUrl == fileUrl|| item.pdfUrl == fileUrl) {
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
                                type: 'image/gif, image/jpeg, image/png, image/png,audio/mp3,audio/m4a,audio/x-m4a,video/mp4,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf',
                                dataSource:data_source
                            }, uploadObserver);
                        }, 100);
                        break;
                }
            }
            function delete_showInfo(ind, list) {
                detailMsk("是否删除该课件？",function(){
                    list.splice(ind, 1);
                });
                
            }
            function delete_showInfo_hwk(ind, list){
                list.splice(ind, 1);
            }
            //在课学员
            function TAB2(){
            	s_pagerRender = false;
	            s_start = 0;
	            s_eachPage = localStorage.getItem('onclass') ? localStorage.getItem("onclass") : 10;
            	s_searchName = s_searchType = undefined;
            	$scope.student_selectInfoNameId = 'courseName'; //select初始值
	            //搜索类型
	            $scope.student_kindSearchData = {
	                courseName: '学员姓名、昵称、联系方式',
	            };
	            $scope.params_student = [];//已选勾选数据
                $scope.sel_all = false;
                
            	$scope.student_SearchData = student_searchData;
            	$scope.student_Enterkeyup = student_searchData;
                $scope.addStudent = addStudent;//添加学员
                $scope.patchConfirm = patchConfirm;//批量删除
            	getOnclassList(0);
            	
            	
            	
            	
            	function addStudent(){
            		window.$rootScope.yznOpenPopUp($scope,'student-sel','selectStuds_online', '760px',{ type: 'student_online',choseType: 'checkbox', sourcePage:'线上',callBackName: '线上在课学员-添加学员',excludeOcCourseId:$scope.courseInfo.courseId});
            	}
            	if (!$scope.addStudentListener) {
                    $scope.addStudentListener = $scope.$on("线上在课学员-添加学员",function(evt,data){
                        var params = {
                            ocCourseId:$scope.courseInfo.courseId,
                            potentialCustomerIdList:getArrIds(data,'potentialCustomerId')
                        };
                        $.hello({
                            url: CONFIG.URL + '/api/oa/onlineCourse/addOnlineStudent',
                            type: 'post',
                            data: JSON.stringify(params),
                            success: function(data) {
                                if(data.status == "200"){
                                    $scope.params_student = [];
                                    $scope.sel_all = false;
                                    s_pagerRender = false
                                    getOnclassList(0);
                                    $scope.$emit("reloadCourseOnline");
                                }

                            }
                        });

                    });
                }

            	function patchConfirm(){
		            if($scope.params_student.length<=0){
		                return layer.msg("至少选择1名学员");
		            }
		            detailMsk('是否移除选中学员？将同时移除学员的学习记录和已提交的作业，删除后不可恢复，请谨慎操作。',function(){
		                var params = {
		                	courseId:$scope.courseInfo.courseId,
		                    idList:getArrIds($scope.params_student,'potentialCustomerId')
		                };
		                $.hello({
		                    url: CONFIG.URL + '/api/oa/onlineCourse/deleteOnlineStudent',
		                    type: 'post',
		                    data: JSON.stringify(params),
		                    success: function(data) {
		                        if(data.status == "200"){
		                            $scope.params_student = [];
		                            $scope.sel_all = false;
		                            s_pagerRender = false
	                                getOnclassList(0);
	                                $scope.$emit("reloadCourseOnline");
		                        }
		                       
		                    }
		                });
		            });
		        }
	            function student_searchData(data) {
		            s_searchName = data.value;
		            s_searchType = data.type;
		            s_pagerRender = false;
		            getOnclassList(0);
		        }
            }
            //获取在课学员列表
            function getOnclassList(start){
                var data = {
                    "start": start.toString(),
                    "count": s_eachPage,
                    'searchType': s_searchName?'appSearchName':undefined,
                    "searchName": s_searchName,
                    "courseId":$scope.courseInfo.courseId,
                }
                $.hello({
                    url: CONFIG.URL + '/api/oa/onlineCourse/listOcCourseStudentR',
                    type: "get",
                    data: data,
                    success: function(data) {
                        if (data.status == '200') {
                            var list = data.context.items;
                            $scope.totalNum = data.context.totalNum;
                            $scope.studentList = list;
                            repeatLists($scope.studentList, $scope.params_student, 'potentialCustomerId');
                            s_leavePager(data.context.totalNum,"onclass");
                        }
    
                    }
                })
            }
            function s_leavePager(total,type) { //分页
                var $M_box3="";
                    if(type == "onclass"){
                        var len = 0;
                        angular.forEach($scope.studentList,function(v){
                            if(v.hasChecked){
                                len+=1;
                            }
                        });
                        if($scope.studentList.length>0  && $scope.studentList.length==len){
                            $scope.sel_all = true;
                        }else{
                            $scope.sel_all = false;
                        }
                        $M_box3 = $('.M-box3.studentPage');
                    }else{
                        $M_box3 = $('.M-box3.studyRcPage');
                    }
                    if (s_pagerRender) {
                        return;
                    } else {
                        s_pagerRender = true;
                    }
        
                    $M_box3.pagination({
                        totalData: total || 0, // 数据总条数
                        showData: s_eachPage, // 显示几条数据
                        jump: true,
                        coping: true,
                        count: 2, // 当前页前后分页个数
                        homePage: '首页',
                        endPage: '末页',
                        prevContent: '上页',
                        nextContent: '下页',
                        callback: function(api) {
                            if (api.getCurrentEach() != s_eachPage) { //本地存储记下每页多少条
                                s_eachPage = api.getCurrentEach();
                                if(type == "onclass"){
                                    localStorage.setItem("onclass", s_eachPage);
                                }else{
                                    localStorage.setItem("studyRc", s_eachPage);
                                }
                            }
                            s_start = (api.getCurrent() - 1) * s_eachPage; // 分页从0开始
                            if(type == "onclass"){
                                getOnclassList(s_start); //回调
                            }else{
                                getStudyRc(s_start);
                            }
                        }
                    });
        
                }
            //作业点评
            function TAB3(){
            	getKeciList();
            }
            $scope.$on("reloadGetKeciList",function(){
                getKeciList();
            });
            function getKeciList(){
	            $.hello({
	                url: CONFIG.URL + '/api/oa/onlineCourse/listLesson',
	                type: "get",
	                data:{courseId:$scope.courseInfo.courseId},
	                success: function(data) {
	                    if (data.status == '200') {
	                    	var list = data.context.items;
	                    	if($scope.popNavSelected == 3){
	                    		$scope.homewk_list = list;
	                    	}else{
	                    		$scope.keci_list = list;
	                    	}
                            $scope.totalNum = data.context.totalNum;
	                    }
	
	                }
	            })
	        }
            //数据统计
            function TAB4(){
            	getKeciList();
            	$scope.openStudyRecord = openStudyRecord;
            	
            }
            function openStudyRecord(x){
                s_pagerRender = false;
                s_start = 0;
                s_eachPage = localStorage.getItem('studyRc') ? localStorage.getItem("studyRc") : 10;
                s_searchName = s_searchType = undefined;
                $scope.taskCommit = undefined;
                $scope.selectInfoNameId_ = 'name'; //select初始值
                //搜索类型
                $scope.s_kindSearchData_ = {
                    name: '学员姓名、昵称',
                };
                $scope.ocInfo = angular.copy(x);
                
                $scope.theadClick = theadClick;
                $scope.changeStatus = changeStatus;
                $scope.s_SearchData = s_searchData;
                $scope.s_Enterkeyup = s_searchData;
                $scope.screen_onreset = screen_onreset;
                $scope.studyRcInfo = studyRcInfo;
                getStudyRc(0);
                $scope.goPopup("studyRc_pop","760px");
            }
            var search_orderTyp = "asc";
            function theadClick(data){
                search_orderTyp = data.sort;
                s_pagerRender = false;
                getStudyRc(0);
            }
            function s_searchData(n){
                s_searchName = n.value;
                s_pagerRender = false;
                getStudyRc(0);
            }
            function changeStatus(e,v){
                $scope.taskCommit = e.target.checked?v:undefined;
                s_pagerRender = false;
                getStudyRc(0);
            }
            function screen_onreset(){
                 $scope.kindSearchOnreset();
                 s_searchName = undefined;
                 $scope.taskCommit = undefined;
                s_pagerRender = false;
                 getStudyRc(0);
            }
            function getStudyRc(start){
                var param = {
                    "start": start.toString(),
                    "count": s_eachPage,
                    'searchType': s_searchName?'appSearchName':undefined,
                    "searchName": s_searchName,
                    "orderName": "file_num",
                    "orderTyp": search_orderTyp,
                    "lessonId":$scope.ocInfo.lessonId,
                    "taskCommit":$scope.taskCommit,
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/onlineCourse/listOcLessonStudentR',
                    type: "get",
                    data:param,
                    success: function(data) {
                        if (data.status == '200') {
                            var list = data.context.items;
                            $scope.totalNum = data.context.totalNum;
                            $scope.studyRc_list = list;
                            s_leavePager(data.context.totalNum,"studyRc");
                        }
    
                    }
                })
            }
            function studyRcInfo(x){
                $scope.ocInfo_student = angular.copy(x);
                $scope.goPopup("studyRcView_pop","660px");
                getStudyRc();
                function getStudyRc(){
                    var param = {
                        lessonId:$scope.ocInfo.lessonId,
                        potentialCustomerId:x.potentialCustomer.potentialCustomerId
                    };
                    $.hello({
                        url: CONFIG.URL + '/api/oa/onlineCourse/listOcFileStudentInfo',
                        type: "get",
                        data:param,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = data.context;
                                $scope.studyRcView_list = list;
                            }
        
                        }
                    })
                }
            }
            //留言管理
                var s_keci = undefined;
            function TAB5(){
                getKeciList();
                $scope.page_leave = 0;
                s_searchName = undefined;
                $scope.leave_kindSearchData = 'courseName'; //select初始值
                //搜索类型
                $scope.leave_kindSearchData = {
                    courseName: '学员姓名、昵称',
                };
                $scope.leave_SearchData = leave_searchData;
                $scope.leave_Enterkeyup = leave_searchData;
                $scope.changeByKeci = changeByKeci;
                $scope.leaveOperate = leaveOperate;//点赞或者回复或者删除
                $scope.showContentFun = showContentFun;//打开回复
                $scope.screen_onreset = screen_onreset;
                getLeaveMessage(0);
                $scope.loadMore = function(){
                    getLeaveMessage($scope.page_leave);
                }
            }
            function screen_onreset(){
                $scope.page_leave = 0;
                s_keci = undefined;
                s_searchName = undefined;
                $scope.kindSearchOnreset();
                for (var i in $scope.screen_goReset) {
                    $scope.screen_goReset[i]();
                }
                getLeaveMessage(0);
            }
            function leave_searchData(data) {
                s_searchName = data.value;
                $scope.page_leave = 0;
                getLeaveMessage(0);
            }
            function changeByKeci(n){
                s_keci = n != null?n.lessonId:undefined;
                $scope.page_leave = 0;
                getLeaveMessage(0);
            }
            function getLeaveMessage(start_){
                var param = {
                        ocLessonId:s_keci,
                        start:start_.toString() || "0",
                        count:50,
                        ocCourseId:$scope.courseInfo.courseId,
                        searchType:"appSearchName",
                        searchName:s_searchName,
                    };
                    $.hello({
                        url: CONFIG.URL + '/api/oa/onlineCourse/listLeaveMessage',
                        type: "get",
                        data:param,
                        success: function(data) {
                            if (data.status == '200') {
                                var list = data.context.items;
                                angular.forEach(list,function(v){
                                    v.showContent = false;
                                    v.openLeaveList = false;
                                });
                                if(start_ == 0){
                                    $scope.leaveMsgList = list;
                                }else{
                                    $scope.leaveMsgList = $scope.leaveMsgList.concat(list);
                                }
                                if(list){
                                    $scope.page_leave = $scope.page_leave*1 + list.length*1;
                                }
                            }
        
                        }
                    })
            }
            function showContentFun(x){
                x.showContent = !x.showContent;
                x.descAnswer = "";
            }
            function leaveOperate(x,n,type){
                switch (n){
                	case 1:
                	var param={
                	    leaveMessageId:x.leaveMessageId,
                        content:x.descAnswer
                	};
                	$.hello({
                        url: CONFIG.URL + '/api/oa/onlineCourse/addLeaveMessageAnswer',
                        type: "post",
                        data:JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                x.showContent = false;
                                $scope.page_leave = 0;
                                getLeaveMessage(0);
                                $scope.$emit("reloadCourseOnline");
                            }
        
                        }
                    })
                		break;
                	case 2:
                	var param ={};
                	if(x.likeId){//存在点赞的情况下，应取消点赞
                	    param={likeId:x.likeId};
                	}else{
                    	param= {
                            relationId:x.leaveMessageId,
                            relationType:"1",
                        };
                	}
                    $.hello({
                        url: CONFIG.URL + '/api/oa/onlineCourse/'+ (x.likeId?'deleteLike':'addLike'),
                        type: "post",
                        data:JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.page_leave = 0;
                                getLeaveMessage(0);
                            }
        
                        }
                    })
                		break;
                	case 3:
                	 detailMsk("删除后不可恢复，是否删除留言？",function(){
                    	$.hello({
                            url: CONFIG.URL + '/api/oa/onlineCourse/deleteLeaveMessage',
                            type: "post",
                            data:JSON.stringify({leaveMessageId:x.leaveMessageId}),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.page_leave = 0;
                                    getLeaveMessage(0);
                                    $scope.$emit("reloadCourseOnline");
                                }
            
                            }
                        })
                	 });
                		break;
                	case 4:
                	 detailMsk("删除后不可恢复，是否删除留言回复？",function(){
                    	$.hello({
                            url: CONFIG.URL + '/api/oa/onlineCourse/deleteLeaveMessageAnswer',
                            type: "post",
                            data:JSON.stringify({leaveMessageAnswerId:x.leaveMessageAnswerId}),
                            success: function(data) {
                                if (data.status == '200') {
                                    $scope.page_leave = 0;
                                    getLeaveMessage(0);
                                }
            
                            }
                        })
                	 });
                		break;
                	default:
                		break;
                }
            }
        }
    })
})