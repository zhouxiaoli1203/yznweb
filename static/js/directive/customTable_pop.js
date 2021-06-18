define([], function() {
    creatPopup({
        el: 'customPop',
        openPopupFn: 'preSetCustomFn',
        htmlUrl: './templates/popup/customTable_pop.html',
        controllerFn: function($scope, props,SERVICE,$timeout) {
            console.log(props);
            init();
            function init() {
                $scope.list = angular.copy(props.data);
                $scope.selAll = getAllChecked();
                $scope.checkSingle = checkSingle;//全选标签
                $scope.checkboxAll = checkboxAll;//全选标签
                $scope.confirm_sel = confirm_sel;//已选择的标签
            }
            function checkboxAll(m,list){
                console.log(list);
                if(m){
                    angular.forEach(list,function(v){
                        v.checked = true;
                    });
                }else{
                     angular.forEach(list,function(v){
                         if(!v.fixed){
                            v.checked = false;
                         }
                    });
                }
            }
            function checkSingle(x){
                if(!x.checked && $scope.selAll){
                    $scope.selAll = false;
                }
                if(x.checked && !$scope.selAll){
                    $scope.selAll = getAllChecked();
                }
            }
            function getAllChecked(){
                var j = false;
                var len=0;
                angular.forEach($scope.list,function(v){
                    if(v.checked){
                        len += 1;
                    }
                })
                if(len === $scope.list.length){
                   j = true;
                }
                return j;
            }
            function confirm_sel() {
                var arr = [];
                angular.forEach($scope.list,function(v){
                    if(v.checked && !v.fixed){
                        arr.push(v);
                    }
                });
                if(arr.length<=0){
                    return layer.msg("至少选择一项自定义列！");
                }
                var params={
                    customTagId:props.customTagId?props.customTagId:undefined,
                    customTagType:props.customTagType?props.customTagType:undefined,
                    customTag:JSON.stringify($scope.list)
                };
                if($rootScope.fromOrgn){
                    if(props.callBackName){//快速排课添加排课安排
                        var data={
                            customTag:angular.copy($scope.list),
                            customTagId:props.customTagId
                        };
                        SERVICE.CUSTOMPOP.TABLE[props.callBackName](data);
                    }
                    $scope.closePopup('customTable');
                }else{
                    $.hello({
                        url: CONFIG.URL + '/api/oa/customTag/addUpdate',
                        type: 'post',
                        data: JSON.stringify(params),
                        success: function(data) {
                            if(data.status == "200"){
                                if(props.callBackName){//快速排课添加排课安排
                                    var data={
                                        customTag:angular.copy($scope.list),
                                        customTagId:data.context.customTagId
                                    };
                                    SERVICE.CUSTOMPOP.TABLE[props.callBackName](data);
                                }
                                $scope.closePopup('customTable');
                            }
                        }
                    })
                }
            }
            

        }
    })
});