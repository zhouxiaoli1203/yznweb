define([], function() {
    creatPopup({
        el: 'classroomPop',
        openPopupFn: 'viewClassroom',
        htmlUrl: './templates/popup/classroom_pop.html',
        controllerFn: function($scope, props,SERVICE,$timeout) {
            console.log(props);
            init();
            function init() {
                getList();
                $scope.openClassroom = openClassroom;
                $scope.changeBtn = changeBtn;
                $scope.closeOperate = closeOperate;
            }
    
            function openClassroom(type, x) {
                $scope.operateType = type;
                if(type == 'add'){
                    $scope.classroom={
                        classRoomId:undefined,
                        classRoomSeat:undefined,
                        classRoomName:undefined
                    }
                }else{
                    $scope.classroom = angular.copy(x);
                }
                $scope.addClassRoom = addClassRoom; //新增或编辑预设时间
                $scope.goPopup("class_shade", "560px");
                

                function addClassRoom() {
                    var params = {
                        "classRoomName": $scope.classroom.classRoomName,
                        "classRoomSeat": $scope.classroom.classRoomSeat,
                    };
                    if ($scope.operateType == "add") {
                        url = "/api/oa/setting/addClassRoom";
                    } else {
                        url = "/api/oa/setting/updateClassRoom";
                        params["classRoomId"] = $scope.classroom.classRoomId;
                    }
                    $.hello({
                        url: CONFIG.URL + url,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == 200) {
                                getList();
                                $scope.closePopup('class_shade');
                            }
                        }
                    });
                }
            }

            function getList() {
                var param = {
                    pageType: 0,
                    deleted:2
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/getClassRoom",
                    type: "get",
                    data: param,
                    success: function(data) {
                        if(data.status == "200") {
                            $scope.list = data.context.items;
                        }
                    }
                })
            }
            function changeBtn(x){
               $.hello({
                    url: CONFIG.URL + "/api/oa/classroom/updateStatus",
                    type: "post",
                    data:JSON.stringify({classRoomId:x.classRoomId,deleted:Number(!Boolean(x.deleted))}),
                    success: function (data) {
                        if (data.status == '200') {
                            getList();
                        }
                    }
                })
               
            }
            function closeOperate(){
                if(props.fromPage == 'classPop'){
                    $scope.$emit('classroomChange');
                }else if(props.fromPage == 'paike'){
                    $scope.$emit('addNewClassroom');
                }
                $scope.closePopup('addClsroom');
            }

        }
    })
});