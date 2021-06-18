define(['MyUtils','laydate','szpUtil'], function(MyUtils,laydate) {
    creatPopup({
        el: 'staffPop',
        openPopupFn: 'viewStaff',
        htmlUrl: './templates/popup/staff_pop.html',
        controllerFn: function($scope, props, SERVICE,$timeout) {
            console.log(props);
            var staffId,sourceLink;;
            init();
            function init(){
               
                $scope.teacherType=getConstantList(CONSTANT.WORK_TYPE,[1,0]);
                if(props.item){
                    staffId=props.item.shopTeacherId;
                    getStaffDetail(staffId);
                }
                
                if(props.title == "关于员工" && props.location == "outside"){
                    ABOUTSTAFF();
                }
                $scope.isOperatePop = checkAuthMenuById("52");//操作员工
                getQuanterList();
                setStudentHeadImg();
                $scope.open_edit = open_edit;//打开编辑弹框
                $scope.delTeachers = delTeachers;
                $scope.sel_teachers = sel_teachers;
                $scope.staff_confirm = staff_confirm;//新增或者编辑员工
                 (function(){
                    laydate.render({
                        elem: '#dateIcon',
                        isRange:false,
                        done:function(value){
                            $scope.staffDetail.workBeginDate=value;
                      }
                    });
                })();
                
            }
            
            function getStaffDetail(id){
                $.hello({
                    url: CONFIG.URL + "/api/oa/shopTeacher/detail",
                    type: "get",
                    data: {shopTeacherId:id},
                    success: function(data) {
                        if(data.status == "200") {
                            $scope.staffInfo=angular.copy(data.context);
                            $scope.staffDetail=angular.copy(data.context);
                            sourceLink=$scope.staffDetail.teacherUrl;
                        }
                    }
                })
            }
            function getQuanterList() { //获取岗位类型list
                $.hello({
                    url: CONFIG.URL + "/api/oa/auth/list",
                    type: "get",
                    data:{pageType:"0"},
                    success: function(data) {
                        if(data.status == 200) {
                            $scope.teachersList = data.context;
                            $timeout(function() {
                            $scope.clearSatus["addStaffSel"]();
                            if ($scope.reloadData && $scope.staffDetail) {
                                    var arr=[];
                                    angular.forEach($scope.staffDetail.quarters,function(v){
                                        if(v.quartersTypeId != 6){
                                            arr.push(v);
                                        }
                                    });
                                    $scope.reloadData["addStaffSel"](arr, 'quartersId');
                                    $scope.$apply();
                                }
                            }, 500,true);
                        }
                    }
                })
            }
            function ABOUTSTAFF(){
                
                if(props.type == "add"){
                    $scope.staffHead="新增员工";
                    $scope.staffDetail={
                        teacherLongUrl:"",
                        teacherName:undefined,
                        teacherSex:"1",
                        teacherIdCard:undefined,
                        workId:undefined,
                        teacherPhone:undefined,
                        teacherType:"1",
                        workBeginDate:yznDateFormatYMd(new Date()),
                        quarters:[]
                    }
                    angular.forEach($scope.teachersList,function(v){
                        v.hasSelected = false;
                    });
                    
                }else{
                    $scope.staffHead="编辑员工";
                    getStaffDetail(staffId);
                    
                }
                
                
            }
            function setStudentHeadImg(){
                $scope.openCopper=openCopper;//打开图片裁剪器
                
                function openCopper(){
                    szpUtil.util_addImg(true, function(data, d_) {
                        $scope.staffDetail.teacherLongUrl = data;
                        sourceLink = d_;
                        $scope.$apply();
                    }, {type: 'image/gif, image/jpeg, image/png',dataSource:'workerInfo'});
                }
            }

            
            function delTeachers(data, ind) {
                data.hasSelected = false;
                $scope.staffDetail.quarters.splice(ind, 1);
            }
    
            function sel_teachers(data) {
                var judHas = true;
                var judHasIndex = null;
                angular.forEach($scope.staffDetail.quarters, function(val, index) {
                    if(val.quartersId == data.quartersId) {
                        judHas = false;
                        judHasIndex = index;
                    }
                });
                if(judHas) {
                    $scope.staffDetail.quarters.push(data);
                    data.hasSelected = true;
                } else {
                    $scope.staffDetail.quarters.splice(judHasIndex, 1);
                    data.hasSelected = false;
                }
            }
                

            function open_edit(){
                props={"item":props.item,"title":"关于员工","location":"inside","type":"edit"};
                $scope.staffHead="编辑员工";
                $scope.goPopup("add_staff","560px",props);
            }
            function staff_confirm(){
                if(!/^1\d{10}$/.test($scope.staffDetail.teacherPhone) && $scope.staffDetail.teacherPhone){
                    layer.msg("请正确填写手机号");
                    return;
                }
                var URL;
                var param={
                    teacherUrl:sourceLink,
                    teacherName:$scope.staffDetail.teacherName,
                    teacherSex:$scope.staffDetail.teacherSex,
                    teacherIdCard:$scope.staffDetail.teacherIdCard,
                    workId:$scope.staffDetail.workId,
                    teacherPhone:$scope.staffDetail.teacherPhone,
                    teacherType:$scope.staffDetail.teacherType,
                    quarters:getQuartersArr(),
                    workBeginDate:$scope.staffDetail.workBeginDate
                };
                if(props.type == "add"){
                    URL="/api/oa/shopTeacher/add";
                }else{
                    param["shopTeacherId"]=$scope.staffDetail.shopTeacherId;
                    URL="/api/oa/shopTeacher/update";
                }
                for (var i in param) {
                    if (param[i] == null) {
                        delete param[i];
                    }
                }
                $.hello({
                    url: CONFIG.URL + URL,
                    type: "post",
                    async: false,
                    data:JSON.stringify(param),
                    success: function(data) {
                        if(data.status == "200") {
                            $scope.$emit("changeStaff",true);
                            if(props.location == "inside"){
                                getStaffDetail($scope.staffDetail.shopTeacherId);
                            }
                            $scope.closePopup('add_staff');
                        }
                    }
                });
            }
            function getQuartersArr(){
                var arr=[];
                if($scope.staffDetail.quarters.length>0){
                    angular.forEach($scope.staffDetail.quarters,function(v){
                        var obj={
                            "quartersId":v.quartersId
                        };
                        arr.push(obj);
                    });
                }
                return arr;
            }
            
        }
    })
});