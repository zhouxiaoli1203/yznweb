define(["MyUtils",],function(MyUtils) {
    creatPopup({
        el: 'basicPop',
        openPopupFn: 'operateBasicPopup',
        htmlUrl: './templates/popup/basic_pop.html',
        controllerFn: function($scope, props) {
            init();
            function init(){
                $scope.addOreditSchool = addOreditSchool;//新增或编辑学校
                $scope.deleteSchool = deleteSchool;//删除学校
                $scope.confirm_set = confirm_set;
                $scope.reloadSchool = reloadSchool;//关闭学校管理弹框刷新当前父级页面数据
                $scope.closePop = function(){
                    layer.close(dialog);
                }
                getInfoList(props.name);
            }
            function getInfoList(n){
                switch (n){
                	case "学校":getSchools();
                		break;
                	default:
                		break;
                }
            }
            function getSchools(){
                var param = {
                    pageType: 0,
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/pickUp/school/list",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if(data.status == "200") {
                            $scope.SchoolList = data.context;
                        }
                    }
                })
            }
            function addOreditSchool(type,x){
                $scope.schoolType = type;
                if(type == 'add'){
                    $scope.schoolInfo={};
                }else{
                    $scope.schoolInfo = angular.copy(x);
                }
                openPopByDiv((type == 'add'?"新增":"编辑")+"学校","#add_SetSchool","660px");
            }
            function deleteSchool(x){
                detailMsk("确认删除该学校？",function(){
                    $.hello({
                        url: CONFIG.URL + "/api/oa/pickUp/school/delete",
                        type: "POST",
                        data: JSON.stringify({schoolId:x.schoolId}),
                        success: function(data) {
                            if(data.status == 200) {
                                getSchools();
                            }
                        }
                    })
                });
            }
            function confirm_set(){
                var param={},url;
                if($scope.schoolType == "add"){
                    param={schoolName:$scope.schoolInfo.schoolName};
                    url="/api/oa/pickUp/school/add";
                }else{
                    param={
                        schoolName:$scope.schoolInfo.schoolName,
                        schoolId:$scope.schoolInfo.schoolId
                    };
                    url="/api/oa/pickUp/school/update";
                }
                $.hello({
                    url: CONFIG.URL + url,
                    type: "POST",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if(data.status == 200) {
                            getSchools();
                            layer.close(dialog);
                        }
                    }
                })
            }
            function reloadSchool(){
                if(props.callBackName){
                    $scope.$emit(props.callBackName);
                    $scope.closePopup('schoolManage');
                }
            }
        }
    });
});