define(['laydate'], function (laydate) {
    creatPopup({
        el: 'checkAnswer',
        openPopupFn: 'opencheckAnswer',
        htmlUrl: './templates/popup/checkAnswer.html',
        controllerFn: function ($scope, props,SERVICE) {
            console.log(props);
            $scope.survey_opra = checkAuthMenuById("153");
            $scope.props = props;
            $scope.surveyInfo = {
                name:'',
                currentIndex:'',
                totalNum:'',
                currentId:props.id,
                currentRemark:''
            };
            $scope.openRemark = function(){
                $scope.remark = $scope.surveyDetail.remark;
                layerOpen('survey-remark', $scope.remark?'修改备注':'添加备注');
            };
            
            $scope.closeRemark = function(){
               layer.close(dialog)
            };
            $scope.del = function(id){
                var idDel = layer.confirm('答卷删除后无法还原，确认删除？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function () {
                    var params = {
                        respondentsId:$scope.surveyInfo.currentId
                    }
                    $.hello({
                        url: CONFIG.URL + "/api/oa/questionnaire/deleteRespondents",
                        type: "post",
                        data: JSON.stringify(params),
                        success: function (res) {
                            if (res.status == '200') {
                                $scope.$emit("删除-答卷");
                                layer.close(idDel);
                                if($scope.surveyInfo.totalNum == 1){//删除唯一一个
                                    $scope.closePopup();
                                }else if($scope.surveyInfo.currentIndex == $scope.surveyInfo.totalNum - 1){//删除最后一个
                                    $scope.switchFn('forward')
                                }else{
                                    $scope.switchFn('next')
                                }
                            }
                        }
                    });
                }, function () {
                    layer.close(idDel);
                });
            };
            $scope.addRemark = function(){
                $.hello({
                    url: CONFIG.URL + "/api/oa/questionnaire/modifyRemark",
                    type: "post",
                    data: JSON.stringify({
                        respondentsId:$scope.surveyDetail.respondentsId,
                        remark:$scope.remark
                    }),
                    success: function (res) {
                        if (res.status == '200') {
                            $scope.surveyDetail.remark = $scope.remark;
                            layer.close(dialog)
                        }
                    }
                })
            };
            $scope.switchFn = function(flag){
                switch (flag){
                    case 'forward'://前一份
                        if($scope.surveyInfo.currentIndex !== 0){
                            $scope.surveyInfo.currentId = $scope.surveyInfo.ids[$scope.surveyInfo.currentIndex - 1];
                            getsurveyDara()
                        }
                        
                        break;
                    case 'next'://后一份
                        if($scope.surveyInfo.currentIndex !== $scope.surveyInfo.ids.length - 1){
                            $scope.surveyInfo.currentId = $scope.surveyInfo.ids[$scope.surveyInfo.currentIndex + 1];
                            getsurveyDara()
                        }
                        break;
                }
            }
            getsurveyDara(props.id);
            function getsurveyDara(id){
                $.hello({
                    url: CONFIG.URL + "/api/oa/questionnaire/viewRespondents",
                    type: "get",
                    data: {respondentsId:$scope.surveyInfo.currentId},
                    success: function (res) {
                        if (res.status == '200') {
                            console.log(res.context)
                            $scope.surveyDetail = res.context;
                            $.hello({
                                url: CONFIG.URL + "/api/oa/questionnaire/listRespondentsId",
                                type: "get",
                                data: {questionnaireId:$scope.surveyDetail.questionnaireId},
                                success: function (res) {
                                    if (res.status == '200') {
                                        $scope.surveyInfo.ids = res.context;
                                        $scope.surveyInfo.totalNum = res.context.length;
                                        $scope.surveyInfo.currentIndex = res.context.indexOf($scope.surveyInfo.currentId);
                                    }
                                }
                            })
                        }
                    }
                })
            }
            

        }
    })
})