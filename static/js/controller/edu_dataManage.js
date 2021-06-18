define(["laydate", "pagination", "jqFrom", "mySelect"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams','$sce','$timeout', 'SERVICE',"$compile", function($scope, $rootScope, $http, $state, $stateParams,$sce,$timeout, SERVICE,$compile) {
        var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem(getEachPageName($state)) ? localStorage.getItem(getEachPageName($state)) : 30; //页码初始化
        var searchType;
        $scope.searchName=undefined;
        var needId = undefined;
        $scope.page1 = 0;
        init();
        function init(){
            $scope.params_data = [];
            $scope.fileInfoParant = {
                name:'全部文件',
            };
            $scope.selectInfoNameId = 'dataName'; // select初始值
            $scope.kindSearchData = {
                dataName: '文件名称'
            };
            $scope.dataHead_ = [
                {name:'checkbox',width:'50'},
                {name:'文件名称',width:'50%'},
                {name:'大小',width:'50%'},
                {name:'操作',align:'center',width:'180'},
            ];
            $scope.listModel = true;
            
            $scope.viewOperate = viewOperate;//打开相关操作弹框
            $scope.add_showInfo = add_showInfo;
            $scope.delete_showInfo = delete_showInfo;
            $scope.confirm_create = confirm_create;//确认新建文件夹
            $scope.toFileDetail = toFileDetail;//查看文件夹详情
            $scope.Enterkeyup = searchData; //回车搜索 删除
            $scope.SearchData = searchData; //按钮搜索
            $scope.confirm_upload = confirm_upload;//上传文件
            $scope.closePop = function(){
                layer.close(dialog);
            }
            $scope.sel_allFun = function(c){
                checkboxAllFun(c,$scope.dataList,$scope.params_data,'dataBankId');
            }
            $scope.sel_singleFun = function(e,data,listed,id){
                e.stopPropagation();
                var index_ = [false, null];
                if(data.hasChecked) {
                    data.hasChecked = false;
                    angular.forEach(listed, function(val, ind) {
                        if(data[id] == val[id]) {
                            index_ = [true, ind];
                        }
                    });
                    if(index_[0]) {
                        listed.splice(index_[1], 1);
                    }
                } else {
                    data.hasChecked = true;
                    listed.push(data);
                }
            }
            getFilesList(0);
            getCapacity();
            $scope.loadMore = function () {
                getFilesList($scope.page1,needId);
            }
        }
        function searchData(data){
            $scope.searchName = data.value;
            $scope.$emit("reloadFiles");
        }
        function viewOperate(num,x,type){
            switch (num){
            	case 1:
            	$scope.fileAdd = "add";
            	$scope.fileInfo = {
            	    name:""
            	};
            	openPopByDiv("新建文件夹",".fileNamePop","560px");
            		break;
            	case 2:
            	$scope.fileAdd = "edit";
            	$scope.fileInfo = angular.copy(x);
            	openPopByDiv("重命名",".fileNamePop","560px");
            		break;
            	case 3:
            	$scope.fileList=[];
            	openPopByDiv("上传文件",".fileUploadPop","760px");
            		break;
            	case 4:
            	if(!x || x.length<=0){
            	    return layer.msg("请选择需要移动的文件");
            	}
            	getFiles();
            	openPopByDiv("移动至文件夹",".fileChangePop","760px");
            	if(!$scope.selectedFile){
        	        $scope.selectedFile = $scope.$on("selectedFiled",function(e,data){
        	            $scope.targetFolder = data;
        	        });
            	}
            	var data = angular.copy(x);
            	var type = type;
            	$scope.confirm_remove = function(){
            	    if(!$scope.targetFolder){
            	        return;
            	    }
                    var param={
                        dataBankId:$scope.targetFolder.dataBankId,
                        dataBankIds:type=="batch"?getArr(data):[data.dataBankId]
                    };
                    $.hello({
                        url: CONFIG.URL + '/api/oa/dataBank/moveBatch',
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.closePop();
                                $scope.params_data = [];
                                $scope.page1 = 0;
                                if($scope.fileInfoParant && $scope.fileInfoParant.dataBankId){
                                    getFilesList(0,$scope.fileInfoParant.dataBankId);
                                }else{
                                    getFilesList(0);
                                }
                                getCapacity();
                            }
        
                        }
                    })
                }
            		break;
            	case 5:
            	if(!x || x.length<=0){
            	   return layer.msg("请选择需要删除的数据"); 
            	}
            	detailMsk("是否删除已选中的文件，删除后文件无法还原，确认删除？",function(){
            	    var param={
            	        dataBankIds:type=="batch"?getArr(x):[x.dataBankId]
            	    };
                    $.hello({
                        url: CONFIG.URL + '/api/oa/dataBank/deleteBatch',
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                $scope.params_data = [];
                                $scope.page1 = 0;
                                if($scope.fileInfoParant && $scope.fileInfoParant.dataBankId){
                                    getFilesList(0,$scope.fileInfoParant.dataBankId);
                                }else{
                                    getFilesList(0);
                                }
                                getCapacity();
                            }
        
                        }
                    })
                });
                    break;
                case 6 : {
                    if(!x || x.length<=0){
                        return layer.msg("请选择数据"); 
                    }
                    if ("batch" == type) {
                        angular.forEach(x,function(v){
                            console.log("#########");
                            downloadFile(v);
                        });
                    } else {
                        downloadFile(x);
                    }                   
                }
            	default:
            		break;
            }
        }
        $scope.$on('reloadFiles',function(){
            $scope.listPath = [];
            $scope.fileInfoParant.name = "全部文件";
            $scope.page1 = 0;
            getFilesList(0);
            getCapacity();
        });
        function downloadFile(item) {
            if (!item.key) {
                return;
            }
            var fileName = item.name;
            if (item.type == 'image') {
                fileName += '.jpg';
            } else if (item.type == 'audio') {
                fileName += '.mp3';
            } else if (item.type == 'video') {
                fileName += '.mp4';
            } else if (item.type == 'pdf') {
                fileName += '.pdf';
            } else if (item.type == 'word') {
                fileName += '.docx';
            }

            var href = item.url;
            if (href.indexOf('?') == -1) {
                href += '?';
            } else {
                href += '&';
            }
            href = href + 'attname=' + fileName;
        
            const iframe = document.createElement("iframe");
            iframe.style.display = "none"; // 防止影响页面
            iframe.style.height = 0; // 防止影响页面
            iframe.src = href; 
            document.body.appendChild(iframe); // 这一行必须，iframe挂在到dom树上才会发请求
            // 1分钟之后删除（onload方法对于下载链接不起作用，就先抠脚一下吧）
            setTimeout(function(){
              iframe.remove();
            }, 60 * 1000);
        }

        function getArr(list){
            var arr = [];
            angular.forEach(list,function(v){
                arr.push(v.dataBankId);
            });
            return arr;
        }
        function confirm_create(){
            var url,param={
                name:$scope.fileInfo.name
            };
            if($scope.fileAdd == "add"){
                url = "createFolder";
                if($scope.fileInfoParant && $scope.fileInfoParant.dataBankId){
                    param["parentId"] = $scope.fileInfoParant.dataBankId;
                }
            }else{
                url = "rename";
                param["dataBankId"] = $scope.fileInfo.dataBankId;
            }
            $.hello({
                url: CONFIG.URL + '/api/oa/dataBank/'+url,
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        $scope.closePop();
                        if($scope.fileAdd == "add" && $scope.fileInfoParant && $scope.fileInfoParant.dataBankId){
                            $scope.page1 = 0;
                            getFilesList(0,$scope.fileInfoParant.dataBankId);
                        }else{
                            $scope.page1 = 0;
                            if($scope.fileInfoParant && $scope.fileInfoParant.dataBankId){
                                getFilesList(0,$scope.fileInfoParant.dataBankId);
                            }else{
                                getFilesList(0);
                            }
                        }
                        getCapacity();
                    }

                }
            })
        }
        function toFileDetail(x,to){
            $scope.searchName = "";
            $scope.kindSearchOnreset();
            if(x){
                $scope.fileInfoParant = angular.copy(x);
                console.log(x);
                $scope.page1 = 0;
                if(to == 'parent'){
                    getFilesList(0,x.parentId);
                    getlistPath(x.parentId);
                }else{
                    getFilesList(0,x.dataBankId);
                    getlistPath(x.dataBankId);
                }
                getCapacity();
            }else{
                 $scope.$emit("reloadFiles");
            }
        }
        function getlistPath(id){
            $.hello({
                url: CONFIG.URL + '/api/oa/dataBank/listPath',
                type: "get",
                data: {dataBankId:id},
                success: function(data) {
                    if (data.status == '200') {
                        $scope.listPath = data.context;
                    }

                }
            })
        }
        function getCapacity(){
            $.hello({
                url: CONFIG.URL + '/api/oa/dataBank/getCapacity',
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        $scope.capacity_ = {
                            currentCapacity:data.context.currentCapacity*1,
                            totalCapacity:data.context.totalCapacity*1
                        }
                        $scope.capacity = {
                            currentCapacity:bytesToSize(data.context.currentCapacity),
                            totalCapacity:bytesToSize(data.context.totalCapacity)
                        };
                        
                    }

                }
            })
        }
        function bytesToSize(bytes) {
            if (bytes*1 === 0) return '0 B';
            var k = 1024, // or 1024
                sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
         
           return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        }
        
        function getFilesList(start_,id){
            needId = id;
            var param={
                start:start_ || '0',
                count:100,
                name:$scope.searchName,
                parentId:id
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/dataBank/listDataBank',
                type: "get",
                data: param,
                success: function(data) {
                    if (data.status == '200') {
                        var list = data.context.items;
                        angular.forEach(list,function(v){
                            if(v.type=="video"){
                                v.url_ = $sce.trustAsResourceUrl(v.url);
                            }
                        })
//                      $scope.dataList = data.context.items;
                        repeatLists(list, $scope.params_data, 'dataBankId');
//                      renderPager(data.context.totalNum);
                        if(start_ == 0){
                            $scope.dataList = list;
                        }else{
                            $scope.dataList = $scope.dataList.concat(list);
                        }
                       if (data.context.items) {
                            $scope.page1 = $scope.page1 * 1 + list.length * 1;
                        }
                       
                       var len = 0;
                        angular.forEach($scope.dataList,function(v){
                            if(v.hasChecked){
                                len+=1;
                            }
                        });
                        if($scope.dataList.length>0 && $scope.dataList.length==len){
                            $scope.resetCheckboxDir(true);
                        }else{
                            $scope.resetCheckboxDir(false);
                        }
                    }

                }
            })
        }

        function renderPager(total) {
            var len = 0;
            angular.forEach($scope.dataList,function(v){
                if(v.hasChecked){
                    len+=1;
                }
            });
            if($scope.dataList.length>0 && $scope.dataList.length==len){
                $scope.resetCheckboxDir(true);
            }else{
                $scope.resetCheckboxDir(false);
            }
            if (pagerRender) {
                return
            }
            pagerRender = true;
            var $M_box3 = $('.M-box3.dataPage');
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
                    if (api.getCurrentEach() !== eachPage) { //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getFilesList(start,needId); //回掉
                }
            });
        }
        function getFiles(){
            $.hello({
                url: CONFIG.URL + '/api/oa/dataBank/listFolder',
                type: "get",
                success: function(data) {
                    if (data.status == '200') {
                        var level = 1;
                        var datas = [{
                            name:"全部文件",
                            dataBankId:"0",
                            dataBankList:data.context,
                        }];
                        var func = function(list){
                            angular.forEach(list,function(v){
                                v.level = level;
                                if(v.dataBankList){
                                    level+=1;
                                    func(v.dataBankList);
                                }
                            });
                        }
                        func(datas);
                        $scope.jsonData = datas;
                    }

                }
            })
        }

        //添加图片/音频/视频
        function add_showInfo(type,list) {
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
                        }, {multiple:true,type: 'image/gif, image/jpeg, image/png'}, uploadObserver);
                    }, 100);
                    break;
                case 'voice': //添加音频
                    $timeout(function() {
                        szpUtil.util_addImg(false, function(data) {
                        }, {
                            type: 'audio/mp3,audio/m4a，audio/x-m4a'
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
                            type: 'image/gif, image/jpeg, image/png, image/png,audio/mp3,audio/m4a,audio/x-m4a,video/mp4,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf',
                            dataSource:'dataBank'
                        }, uploadObserver);
                    }, 100);
                    break;
            }
        }
        function delete_showInfo(ind, list) {
            detailMsk("是否删除该文件？",function(){
                list.splice(ind, 1);
            });
        }
        function confirm_upload(){ 
            var arr=[];
            if(!$scope.fileList || $scope.fileList.length<=0){
                return layer.msg("上传文件不能为空");
            }
            var j = [true,""];
            var list = $scope.fileList;
            for(var i = 0,len = list.length;i<len;i++){
                if(!list[i].key){
                    j[0] = false;
                    break;
                }
            }
            if(!j[0]){
                return layer.msg("请处理未成功的文件！");
            }
            angular.forEach($scope.fileList,function(v){
                arr.push({
                    name:v.fileName,
                    key:v.key
                });
            });

            var param={
                parentId:($scope.fileInfoParant && $scope.fileInfoParant.dataBankId)?$scope.fileInfoParant.dataBankId:undefined,
                dataBankList:arr
            };
            $.hello({
                url: CONFIG.URL + '/api/oa/dataBank/uploadFile',
                type: "post",
                data:JSON.stringify(param),
                success: function(data) {
                    if (data.status == '200') {
                        if($scope.fileInfoParant && $scope.fileInfoParant.dataBankId){
                            $scope.page1 = 0;
                            getFilesList(0,$scope.fileInfoParant.dataBankId);
                            getCapacity();
                        }else{
                            $scope.$emit("reloadFiles");
                        }
                        $scope.closePop();
                    }

                }
            })
        }
    }]
})