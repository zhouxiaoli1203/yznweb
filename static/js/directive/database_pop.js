define(['laydate', 'mySelect'], function(laydate) {
    creatPopup({
        el: 'databasePop',
        openPopupFn: 'viewDataBase',
        htmlUrl: './templates/popup/database_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state,$sce) {
            var pagerRender = false,
            start = 0,
            eachPage = localStorage.getItem('database') ? localStorage.getItem("database") : 10; //页码初始化
            var searchType,needId;
            $scope.searchName=undefined;
            init();
            function init(){
                $scope.page1 = 0;
                $scope.params_data = [];
                $scope.fileInfoParant = {
                    name:'全部文件',
                };
                $scope.selectInfoNameId = 'dataName'; // select初始值
                $scope.kindSearchData = {
                    dataName: '文件名称'
                };
                $scope.listModel = true;
                $scope.sel_singleFun = sel_singleFun;//选择某一条数据
                $scope.Enterkeyup = searchData; //回车搜索 删除
                $scope.SearchData = searchData; //按钮搜索
                $scope.toFileDetail = toFileDetail; 
                $scope.checkboxAll = checkboxAll;//表头全选
                $scope.sureSelect = sureSelect;//确定选择
                getFilesList(0);
                $scope.loadMore = function () {
                    getFilesList($scope.page1,needId);
                }
            }
            function checkboxAll(d,list,listed,id){
                var i_ = [false, null];
                if(d) {
                    angular.forEach(list, function(val_1) {
                        if(!val_1.hasChecked && val_1.type != "folder") {
                            val_1.hasChecked = true;
                            listed.push(val_1);
                        }
                    });
                } else {
                    angular.forEach(list, function(val_1) {
                        val_1.hasChecked = false;
                        i_ = [false, null];
                        angular.forEach(listed, function(val_2, ind_2) {
                            if(val_1[id] == val_2[id] && val_1.type != "folder") {
                                i_ = [true, ind_2];
                            }
                        });
                        if(i_[0]) {
                            listed.splice(i_[1], 1);
                        }
                    });
                }
            }
            function sel_singleFun(data,listed,id){
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
            function searchData(data){
                $scope.searchName = data.value;
                $scope.$emit("reloadFilesPop");
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
                }else{
                     $scope.$emit("reloadFilesPop");
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
            $scope.$on('reloadFilesPop',function(){
                $scope.listPath = [];
                $scope.fileInfoParant.name = "全部文件";
                $scope.page1 = 0;
                getFilesList(0);
            });
            function getFilesList(start_,id){
                needId = id;
                var param={
                    start:start_ || '0',
                    count:20,
                    name:$scope.searchName,
                    parentId:id,
                    excludedIds:props.excludedIds?props.excludedIds:undefined
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
                            repeatLists(list, $scope.params_data, 'dataBankId');
                             if (start_ == 0) {
                                $scope.dataList = list;
                            } else {
                                $scope.dataList = $scope.dataList.concat(list);
                            }
                            if (data.context.items) {
                                $scope.page1 = $scope.page1 * 1 + list.length * 1;
                            }
                            
                            var len = 0,newArr = [];//剔除文件夹的列表数据
                            angular.forEach($scope.dataList,function(v){
                                if(v.type != "folder"){
                                    newArr.push(v);   
                                }
                            });
                            angular.forEach(newArr,function(v){
                                if(v.hasChecked){
                                    len+=1;
                                }
                            });
                            if(newArr.length>0  && newArr.length==len){
                                $scope.sel_all = true;
                            }else{
                                $scope.sel_all = false;
                            }
                        }
    
                    }
                })
            }
            function sureSelect(){
                var data = $scope.params_data;
                if(!data || data.length == 0) {
                    layer.msg('请选择文件');
                    return;
                } else {
                    if(props.needMany == 1 && data.length>1){
                        return layer.msg("只允许选择一个文件");
                    }
                    if(props.callBackName){
                        $scope.$emit(props.callBackName, data);
                    }
                    $scope.closePopup('database_pop');
                };
            }
        }
    })
})