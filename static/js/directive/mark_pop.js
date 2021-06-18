define([], function() {
    creatPopup({
        el: 'markPop',
        openPopupFn: 'preSetMarkFn',
        htmlUrl: './templates/popup/mark_pop.html',
        controllerFn: function($scope, props,SERVICE,$timeout) {
            console.log(props);
            init();
            function init() {
                $scope.selAll = false;//标签全选清除
                $scope.markList = [];
                $scope.selectedMarks = props.data;
                getMarkList();
                $scope.choseType= props.choseType;
                $scope.addMark = addMark; //预设时间--新增或编辑时间弹出框
                $scope.deletePreMark = deletePreMark; //预设时间--删除预设时间
                $scope.selSingle_lf = selSingle_lf; //预设时间--单选预设时间
                $scope.checkboxAll = checkboxAll;//全选标签
                $scope.confirm_selMark = confirm_selMark;//已选择的标签
            }
            function checkboxAll(m,list){
                if(m){
                    angular.forEach(list,function(v){
                        v.hasChecked = true;
                    });
                }else{
                     angular.forEach(list,function(v){
                        v.hasChecked = false;
                    });
                }
            }
            function selSingle_lf(data,list,e) {
              if(e.target.nodeName == "SPAN") return;
//               var index_ = [false, null];
                if($scope.choseType == 'radio') {   //单选以及多选判断
                    $scope.markList = data;
                } else {
                    if(data.hasChecked) {
                        data.hasChecked = false;
//                      angular.forEach($scope.markList, function(val, ind) {
//                          if(data.id == val.id) {
//                              index_ = [true, ind];
//                          }
//                      });
//                      if(index_[0]) {
//                          $scope.markList.splice(index_[1], 1);
//                      }
                    } else {
                        data.hasChecked = true;
//                      $scope.markList.push(data);
                    }
                }
            }
    
            function addMark(type, x) {
                $scope.operateType = type;
                $scope.mark = type == "add"?"":x;
                $scope.confirmMark = confirmMark; //新增或编辑预设时间
                $scope.goPopup("add_preSetMark", "560px");
                

                function confirmMark() {
                    var params = {
                        "name": $scope.mark.name,
                    };
                    if ($scope.operateType == "add") {
                        url = "/api/oa/tag/add";
                    } else {
                        url = "/api/oa/tag/update";
                        params["id"] = $scope.mark.id;
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == 200) {
                                getMarkList();
                                $scope.$emit("changeMark");
                                $scope.closePopup('add_preSetMark');
                            }
                        }
                    });
                }
            }

            function deletePreMark(x) {
                var isCfirm = layer.confirm('潜客/学员标签删除后将无法复原，确认删除？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    resize: false,
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    var param = {
                        "id": x.id
                    };
                    $.hello({
                        url: CONFIG.URL + "/api/oa/tag/delete",
                        type: "post",
                        data: JSON.stringify(param),
                        success: function(data) {
                            if (data.status == '200') {
                                layer.msg('已成功删除标签', {
                                    icon: 1
                                });
                                getMarkList();
                            };
                        }
                    })
                }, function() {
                    layer.close(isCfirm);
                })

            }

            function confirm_selMark() {
                if($scope.choseType == "checkbox"){
                   var arr=[];
                   angular.forEach($scope.markList,function(v){
                       if(v.hasChecked){
                           arr.push(v);
                       }
                   });
                   // if(arr.length<=0){
                   //     return layer.msg("请选择标签");
                   // }
                }
                if(props.callBackName){//快速排课添加排课安排
                    SERVICE.MARKPOP.COURSE[props.callBackName](arr);
                }
                $scope.closePopup('preSetMark');
            }
            function getMarkList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/tag/list",
                    type: "get",
                    success: function(res) {
                        if (res.status == 200) {
                            console.log($scope.selectedMarks);
                            $scope.markList = res.context;
                            angular.forEach($scope.markList,function(v){
                                var isSelect = false;
                                angular.forEach($scope.selectedMarks,function(v_){
                                    if(v.id == v_.id){
                                        isSelect = true;
                                    }
                                });
                                if(isSelect){
                                    v.hasChecked = true;
                                }
                            });
                        }
                    }
                });
            }
            

        }
    })
});