    /*调用新增潜客弹框
     *
     * page:0 潜客管理，1学员管理
     * type add是新增，edit是编辑
     * item 调弹框所需要传的参数对象
     * location 弹框是从列表外部调用的还是内部弹出框调用的
     * */
    //  props={
    //      page: 0,
    //      item: Object,
    //      type: 'add',
    //      location:'outside'
    //  }
    define(['MyUtils', 'laydate', 'szpUtil', 'markPop', 'inputSelect', 'students_sel', 'basicPop'], function(MyUtils, laydate) {
        creatPopup({
            el: 'addInfos',
            openPopupFn: 'add_potential',
            htmlUrl: './templates/popup/add_Potential.html',
            controllerFn: function ($scope, props, SERVICE, $timeout) {
                console.log(props);
                $scope.teacherList = ""; //内部推荐人列表
                var item = props.item; //编辑潜客或学员接收的数据
                var sourceLink;
                $scope.newStudSign = false; //新生报名弹框
                $scope.isPotential = true; //弹出框默潜客弹框页面true
                $scope.isAddPot = false; //弹出框默新增潜客弹框false
                $scope.hasMonth = false; //年龄初始月份为隐藏
                $scope.courseSelected = {}; //意向课程默认值
                $scope.channelTypeList = []; //一级渠道类型
                $scope.potlnameList = []; //潜客弹出框姓名重复
                //          $scope.potlphoneList=[];//潜客弹出框手机号重复
                //          $scope.isReAdd=false;//默认不是重复新增潜客
                //          $scope.isReName=false;//姓名默认不重复
                //          $scope.isRePhone=false;//手机号默认不重复
                //          $scope.isNameList=false;//重复列表是不是姓名重复的列表
                if (props.page == 0) {
                    $scope.isPotential = true;
                    if (props.type == 'add') {
                        $scope.isAddPot = true;
                        $scope.popTitle = "新增潜客";
                    } else {
                        $scope.isAddPot = false;
                        $scope.popTitle = "编辑潜客";
                    }
                    if (props.fromPage == 'student') {
                        $scope.newStudSign = true;
                        $scope.popTitle = "新生报名";
                    }
                } else {
                    $scope.isPotential = false;
                    $scope.popTitle = "编辑学员";
                }
                init();
                $scope.pickUpShow = checkAuthMenuById(124) && (((window.currentUserInfo.shop.config) & 0x0200) > 0); //有权限且开关开启
                function init() {
                    $scope.isAllpotential = checkAuthMenuById(13); //全部潜客权限
                    getChannelList(); //获取渠道类型
                    getRecmdList(); //获取渠道2级来源
                    getMarketerList(); //获取采单员列表
                    getAdviserList(); //获取顾问列表
                    getCourseId(); //获取意向课程
                    getSchools(); //获取附近学校
                    setStudentHeadImg(); //图片上传
                    potentialInit();
                    $scope.caclBirthToAge = caclBirthToAge; //计算年龄
                    $scope.relationList = getConstantList(CONSTANT.POTENTIALCUSTOMERPARENTTYPE, [0, 1, 2, 3, 4, 5, 6, 8, 7]); //获取家庭关系列表
                    $scope.gradeList = getConstantList(CONSTANT.STUDENTGRADE); //潜客年级列表
                    $scope.addParent = addParent; //增加家长列表
                    $scope.deleteRelation = deleteRelation; //删除家长列表
                    $scope.intentShow = intentShow; //点击意向度
                    $scope.course_ = []; //选择意向课程
                    $scope.changeChalType = changeChalType; //切换渠道类型
                    $scope.delCourse_ = delCourse_; //删除选中的意向课程
                    $scope.selCourse_ = selCourse_; //删除选中的意向课程
                    $scope.clickHandler = clickHandler; //选择意向课程
                    $scope.nameBlur = nameBlur; //姓名失焦验证
                    $scope.phoneBlur = phoneBlur; //手机号失焦验证
                    $scope.gotoViewNameStud = gotoViewNameStud; //查看重复学员的详情
                    $scope.selectedAllweek = selectedAllweek; //全部勾选接送星期
                    //              $scope.gotoViewPhoneStud = gotoViewPhoneStud;//查看重复学员的详情
                    SERVICE.MARKPOP.COURSE['添加标签'] = deterMark; //已选的标签
                    $scope.delStudent = delStudent; //删除已选择的学员
                    $scope.pickupWeek = [
                        { type: 0, name: "午托", weekList: [1, 2, 3, 4, 5, ] },
                        { type: 1, name: "晚托", weekList: [1, 2, 3, 4, 5, ] },
                    ];

                    //              $scope.delMarks = delMarks;//删除已选的标签


                    (function() {
                        laydate.render({
                            elem: '#studentBirth', //指定元素
                            isRange: false,
                            max: 0,
                            btns: ["clear", "confirm"],
                            done: function(value) {
                                $scope.hasMonth = false;
                                $scope.studentData.birthday = value;
                                $scope.studentData.age = caclAge(value);
                                if (value) {
                                    if (parseInt($scope.studentData.age) <= 6) {
                                        $scope.hasMonth = true;
                                        $scope.studentData.studentMonth = "岁" + caclAgeToMonth(value) + "月";
                                    } else {
                                        $scope.hasMonth = false;
                                    }
                                } else {
                                    $scope.studentData.age = "";
                                    $scope.studentData.studentMonth = "";
                                    $scope.hasMonth = false;
                                }

                                //                          if(!value){
                                //                              $scope.studentData.studentMonth="";
                                //                              $scope.hasMonth=false;
                                //                          }
                                $scope.$apply();
                            }
                        });
                    })();
                    $scope.goCommonPop = function(el, id, width, data) {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                    }
                }
                $scope.$on('潜客-学校管理', function() { getSchools(); });

                function potentialInit() {
                    if (props.type == 'add') {
                        ADDPOTIALINIT(); //新增潜客
                    } else {
                        getPotentialCustomer(); //获取潜客或者学员详情
                    }
                }

                //潜客姓名失焦验证
                function nameBlur() {
                    var str1 = $scope.studentData.name;
                    checkByBlur(str1, $scope.Relation_phone);

                }
                //潜客手机号失焦验证
                function phoneBlur() {
                    var str2 = $scope.Relation_phone;
                    checkByBlur($scope.studentData.name, str2);
                }

                function checkByBlur(str1, str2) {
                    if (!str1 && !str2) {
                        return;
                    }
                    var params = {
                        "name": str1 ? str1 : null,
                        "potentialCustomerParentPhone": str2 ? str2 : null
                    };
                    if (item.potentialCustomerId) {
                        params["potentialCustomerId"] = item.potentialCustomerId;
                    }

                    $.hello({
                        url: CONFIG.URL + "/api/oa/sale/getPotentialCustomerRemovalStatus",
                        type: 'get',
                        data: params,
                        success: function(data) {
                            if (data.status == "200") {
                                if (data.context.length > 0) {
                                    angular.forEach(data.context, function(v) {
                                        v.relationType = relation(v.potentialCustomerParentType);
                                    });
                                } else {

                                }
                                $scope.potlnameList = data.context;
                            }
                        }
                    });
                }

                function gotoViewNameStud() {
                    $scope.goPopup("repeat_studs", "760px");
                }

                //          function gotoViewPhoneStud(){
                //              $scope.isNameList=false;
                //              $scope.goPopup("repeat_studs","760px");
                //          }
                //新增潜客执行代码
                function ADDPOTIALINIT() {
                    $scope.course_ = [];
                    $scope.hasChannelType = false;
                    $scope.isInRecmd = false;
                    apdatainit(); //新增潜客初始化数据
                    $scope.confirm_btn = confirm_btn;
                    $scope.gotoSignUp = gotoSignUp; //直接报名

                    function apdatainit() {

                        $scope.Relation_phone = null;
                        $scope.Relation_name = null;
                        $scope.Relation_relation = CONSTANT.POTENTIALCUSTOMERPARENTVAL.MOTHER.toString();

                        $scope.addParentList = [{
                                "relation": CONSTANT.POTENTIALCUSTOMERPARENTVAL.OTHER.toString(),
                                "name": "",
                                "phone": ""
                            },
                            {
                                "relation": CONSTANT.POTENTIALCUSTOMERPARENTVAL.OTHER.toString(),
                                "name": "",
                                "phone": ""
                            },
                        ];
                        //                  var obj = {
                        //                      "relation": CONSTANT.POTENTIALCUSTOMERPARENTVAL.OTHER.toString(),
                        //                      "name": "",
                        //                      "phone": ""
                        //                  };
                        //                  $scope.addParentList.push(obj);
                        $scope.studentData = {
                            id: null,
                            name: null,
                            nickname: null,
                            studentGend: "2",
                            ageType: "1",
                            age: null,
                            birthday: null,
                            studentStaff: null,
                            studentIntent: "1",
                            tip_text: CONSTANT.INTENT_SHOW[1],
                            schoolName: null,
                            address: null,
                            studentDesc: null,
                            tags: [],
                            grade: null,
                            reference: undefined,
                        };
                        $scope.channel = $scope.channel2 = $scope.recmd = $scope.marker = null;
                        console.log($scope.isAllpotential);
                        $scope.adviser = !$scope.isAllpotential ? localStorage.getItem('shopTeacherId') : undefined;
                        //                  $scope.courseSelected.courseId=null;
                        //                  $scope.courseSelected.courseName="请添加意向课程";
                        $scope.$broadcast('_likeCourse', 'clearSatus');
                        angular.forEach($scope.courseList, function(v) {
                            v.hasChecked = false;
                        });
                    }

                    function confirm_btn() {
                        setPotentialData("add");
                    }

                    function gotoSignUp() {
                        setPotentialData("signUp");
                    }

                }

                function selectedAllweek(x) {
                    x["week"] = [false];
                    angular.forEach(x.weekList, function(v, i) {
                        x.week[v] = true;
                    });
                }

                function setPotentialData(type) {
                    if (type == 'signUp') {
                        if (!$scope.studentData.name) {
                            return layer.msg("姓名不可以为空");
                        }
                    }
                    //              if(!$scope.studentData.birthday && !$scope.studentData.age){
                    //                  layer.msg("年龄和生日不可以同时为空");
                    //                  return;
                    //              }
                    if (!$scope.Relation_phone) {
                        layer.msg("请填写主要联系人手机号");
                        return;
                    }
                    if (!/^1\d{10}$/.test($scope.Relation_phone)) {
                        layer.msg("请正确填写手机号");
                        return;
                    }
                    var params = {
                        "name": $scope.studentData.name,
                        "nickname": $scope.studentData.nickname,
                        "sex": $scope.studentData.studentGend,
                        //                  "birthday":$scope.studentData.birthday,
                        "id": $scope.studentData.id,
                        //                  "age":$scope.studentData.age,
                        "intent": $scope.studentData.studentIntent,
                        "channelTypeId": $scope.channel,
                        "potentialCustomerFrom": $scope.channel,
                        "potentialCustomerFromUserId": $scope.recmd,
                        "marketerId": $scope.marker,
                        "schoolName": $scope.studentData.schoolName,
                        "address": $scope.studentData.address,
                        "potentialCustomerDesc": $scope.studentData.studentDesc,
                        "potentialCustomerParentPhone": $scope.Relation_phone,
                        "potentialCustomerParentType": $scope.Relation_relation,
                        "potentialCustomerParentName": $scope.Relation_name,
                        "courseId": $scope.courseSelected.courseId,
                        "courses": getCourseArr(),
                        "tags": getTagId(),
                        "grade": $scope.studentData.grade,
                    };

                    if ($scope.studentData.ageType == 1) {
                        params["birthday"] = $scope.studentData.birthday;
                    }
                    if ($scope.studentData.ageType == 2) {
                        params["age"] = $scope.studentData.age;
                    }
                    angular.forEach($scope.addParentList, function(v, k) {
                        var selectVal = v.relation;
                        var name = v.name;
                        var phone = v.phone;
                        if (k == 0 && phone && /^1\d{10}$/.test(phone)) {
                            params["potentialCustomerParentTowType"] = selectVal;
                            params["potentialCustomerParentTowName"] = name;
                            params["potentialCustomerParentTowPhone"] = phone;
                        }
                        if (k == 1 && phone && /^1\d{10}$/.test(phone)) {
                            params["potentialCustomerParentThreeType"] = selectVal;
                            params["potentialCustomerParentThreeName"] = name;
                            params["potentialCustomerParentThreePhone"] = phone;
                        }
                    });
                    if (params.potentialCustomerParentTowPhone && (params.potentialCustomerParentTowType === "" || params.potentialCustomerParentTowType === undefined)) {
                        return layer.msg("第二联系人关系不能为空");
                    }
                    if (params.potentialCustomerParentThreePhone && (params.potentialCustomerParentThreeType === "" || params.potentialCustomerParentThreeType === undefined)) {
                        return layer.msg("第三联系人关系不能为空");
                    }
                    if (!($scope.channel2 == "" || $scope.channel2 == undefined)) {
                        params["channelId"] = $scope.channel2;
                    }

                    for (var i in params) {
                        if (params[i] === undefined) {
                            delete params[i];
                        }
                    }
                    params["potentialCustomerDesc"] = $scope.studentData.studentDesc;
                    params["studentIdCard"] = $scope.studentData.studentStaff;
                    if (type == "add" || type == "signUp") {
                        url = "/api/oa/sale/addPotentialCustomer";
                        params["oaUserId"] = $scope.adviser;
                    } else {
                        params["potentialCustomerId"] = $scope.studentData.potentialCustomerId;
                        url = "/api/oa/sale/updatePotentialCustomerNew";
                    }
                    if (props.page == 1) {
                        if (getWeeklist().length > 0) {
                            if (!$scope.studentData.schoolName || !$scope.studentData.grade) {
                                return layer.msg("安排接送的学员学校和年级必填！");
                            }
                        }
                        params["img"] = sourceLink;
                        params["pickUpList"] = getWeeklist();
                    } else {
                        params["referralType"] = $scope.studentData.reference ? $scope.studentData.reference.type : undefined;
                        params["targetId"] = $scope.studentData.reference ? $scope.studentData.reference.id : undefined;
                        if ($scope.studentData.reference_old && $scope.studentData.reference_old.id && !$scope.studentData.reference) {
                            params["targetId"] = "-1";
                            params["referralType"] = $scope.studentData.reference_old.type;
                        }
                    }
                    console.log(params);
                    $.hello({
                        url: CONFIG.URL + url,
                        type: 'post',
                        data: JSON.stringify(params),
                        success: function(data) {
                            if (data.status == "200") {
                                if (props.page == 0) {
                                    if (type == "signUp") {
                                        var param = {
                                            'page': props.page,
                                            'item': data.context,
                                            'title': "报名",
                                            'location': "outside",
                                            'special': "outside",
                                        };
                                        if ($scope.newStudSign) {
                                            param['newStudSign'] = true;
                                        }
                                        window.$rootScope.yznOpenPopUp($scope.$parent, 'sign-up', 'signUp-popup', '1160px', param);
                                    }
                                    if (type == 'edit') {
                                        $scope.$emit('potentialChange', false);
                                        $scope.$emit('renewWarnChange', false);
                                    } else {
                                        $scope.$emit('potentialChange', true);
                                        if ($scope.newStudSign) {
                                            $scope.$emit('studentChange', true);
                                        }
                                    }

                                } else {
                                    $scope.$emit('studentChange', false);
                                }
                                if (props.location == "inside") {
                                    if (SERVICE.POTENTIALPOP.reloadPopNav) {
                                        SERVICE.POTENTIALPOP.reloadPopNav(1);
                                    }
                                }
                                $scope.closePopup('addPotential');
                            }
                        }
                    });
                }

                function getCourseArr() {
                    var arr = [];
                    angular.forEach($scope.course_, function(v, k) {
                        arr.push({
                            courseId: v.courseId
                        });
                    });
                    return arr;
                }

                function getWeeklist() {
                    var arr = [];
                    angular.forEach($scope.pickupWeek, function(v) {
                        var weekArr = []; //判断week对象是否为空对象
                        for (var i in v.week) { //循环多选的星期
                            if (v.week[i]) {
                                weekArr.push(i);
                            }
                        }
                        if (weekArr.length > 0) {
                            angular.forEach(weekArr, function(v_) {
                                arr.push({
                                    'pickUpWeek': v_,
                                    'pickUpType': v.type
                                })
                            })
                        }
                    });
                    return arr;
                }

                function getTagId() {
                    var arr = [];
                    angular.forEach($scope.studentData.tags, function(v) {
                        arr.push({ id: v.id });
                    });
                    return arr;
                }
                //编辑潜客执行代码
                function EDITPOTIALINIT(item) {
                    $scope.channelList2 = [];
                    epdatainit(); //编辑潜客初始化填充数据
                    $scope.confirm_btn = confirm_btn;

                    function epdatainit() {
                        getStudentData(item, 0);
                        angular.forEach($scope.channelTypeList, function(v, k) {
                            if (v.id == item.channelTypeId) {
                                $scope.channelList2 = v.channelList;
                            }
                        });
                        $scope.channel = item.channelTypeId; //一级

                        // if (item.channelTypeId == 5) { //内部推荐人
                        //     $scope.hasChannelType = false;
                        //     $scope.recmd = item.potentialCustomerFromUserId;
                        //     $scope.isInRecmd = item.potentialCustomerFromUserId ? true : false;
                        // } else { //渠道类型
                            $scope.hasChannelType = $scope.channelList2 && $scope.channelList2.length != 0 ? true : false;
                            $scope.channel2 = item.channelId ? item.channelId : ""; //二级
                            $scope.isInRecmd = false;
                        // }

                        //                  if(item.courseName){
                        //                      $scope.courseSelected.courseName=item.courseName;
                        //                  }else{
                        //                      $scope.courseSelected.courseName="请添加意向课程";
                        //                  }
                        //                  $scope.courseSelected.courseId=item.courseId;
                        $scope.course_ = item.courses ? angular.copy(item.courses) : [];
                        $scope.marker = item.marketerId ? item.marketerId : "";
                        $scope.adviser = !$scope.isAllpotential ? localStorage.getItem('shopTeacherId') : (item.oaUserId ? item.oaUserId : "");
                    }

                    function confirm_btn() {
                        setPotentialData("edit");
                    }
                }

                function getStudentData(item, page) {
                    $scope.studentData = {
                        id: item.id,
                        potentialCustomerId: item.potentialCustomerId,
                        name: item.name,
                        nickname: item.nickname,
                        studentGend: item.sex,
                        ageType: item.birthday ? "1" : "2",
                        age: item.age,
                        birthday: yznDateFormatYMd(item.birthday),
                        studentStaff: item.studentIdCard,
                        schoolName: item.schoolName,
                        address: item.address,
                        studentDesc: item.potentialCustomerDesc,
                        tags: item.tags ? item.tags : undefined,
                        grade: item.grade ? item.grade.toString() : undefined,
                        reference: item.referrerId ? {
                            type:1,
                            name: item.referrerName,
                            id: item.referrerId,
                            phone: item.referrerPhone
                        } : undefined,
                        reference_old: {
                            type:1,
                            name: item.referrerName,
                            id: item.referrerId,
                            phone: item.referrerPhone
                        }
                    };
                    if (page == 0) {
                        $scope.studentData.studentIntent = item.intent ? item.intent : "1";
                        $scope.studentData.tip_text = CONSTANT.INTENT_SHOW[item.intent ? item.intent : "1"];
                    } else {
                        $scope.headerimgsrc = item.imgUrl;
                        sourceLink = item.img;
                    }
                    if (parseInt(item.age) <= 6 && item.birthday) {
                        $scope.hasMonth = true;
                        $scope.studentData.studentMonth = "岁" + caclAgeToMonth(item.birthday) + "月" + " ";
                    } else {
                        $scope.hasMonth = false;
                        $scope.studentData.studentMonth = "";
                    }
                    $scope.Relation_phone = item.potentialCustomerParentPhone;
                    $scope.Relation_name = item.potentialCustomerParentName;
                    $scope.Relation_relation = item.potentialCustomerParentType ? item.potentialCustomerParentType : "1";
                    $scope.addParentList = [];
                    if (item.potentialCustomerParentTowType) {
                        var obj = {
                            "relation": item.potentialCustomerParentTowType ? item.potentialCustomerParentTowType : "",
                            "name": item.potentialCustomerParentTowName,
                            "phone": item.potentialCustomerParentTowPhone
                        };
                        $scope.addParentList.push(obj);
                    }
                    if (item.potentialCustomerParentThreePhone) {
                        var obj = {
                            "relation": item.potentialCustomerParentThreeType ? item.potentialCustomerParentThreeType : "",
                            "name": item.potentialCustomerParentThreeName,
                            "phone": item.potentialCustomerParentThreePhone
                        };
                        $scope.addParentList.push(obj);
                    }
                    if (item.pickUpList) {
                        angular.forEach($scope.pickupWeek, function(v, i) {
                            v["week"] = [false];
                            angular.forEach(item.pickUpList, function(v_, i_) {
                                if (v.type == v_.pickUpType) {
                                    v.week[v_.pickUpWeek] = true;
                                }
                            });
                        });
                    }

                }
                //编辑学员执行代码
                function EDITSTUDENT(item) {
                    datainit(); //编辑学员初始化填充数据
                    $scope.confirm_btn = confirm_btn;

                    function datainit() {
                        getStudentData(item, 1);
                    }

                    function confirm_btn() {
                        setPotentialData("edit");
                    }
                }



                function getChannelList() { //获取渠道 类型
                    $.hello({
                        url: CONFIG.URL + '/api/oa/setting/channelType/list',
                        type: 'get',
                        async: false,
                        data: {pageType: 0 ,saleType:1,status:1,channelNeed:1},
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.channelTypeList = data.context;

                            }
                        }
                    });
                }

                function getMarketerList() { //获取采单员列表
                    $.hello({
                        url: CONFIG.URL + '/api/oa/shopTeacher/list',
                        type: 'get',
                        data: {
                            pageType: 0,
                            shopTeacherStatus: 1,
                            quartersTypeId: 11
                        },
                        success: function(data) {
                            $scope.marketerList = data.context;
                        }
                    });
                }

                function getAdviserList() { //获取采单员列表
                    $.hello({
                        url: CONFIG.URL + '/api/oa/shopTeacher/list',
                        type: 'get',
                        data: {
                            pageType: 0,
                            shopTeacherStatus: 1,
                            quartersTypeId: 3
                        },
                        success: function(data) {
                            $scope.adviserList = data.context;
                        }
                    });
                }

                function getSchools() { //获取学校列表
                    $.hello({
                        url: CONFIG.URL + '/api/oa/pickUp/school/list',
                        type: 'get',
                        data: {
                            pageType: 0,
                        },
                        success: function(data) {
                            $scope.schoolList = data.context;
                        }
                    });
                }

                function changeChalType(x) { //切换一级渠道
                    $scope.channel2 = undefined;
                    $scope.recmd = undefined;
                    $scope.channelList2 = [];
                    if (!x) {
                        $scope.channel = "";
                        $scope.hasChannelType = false;
                        $scope.isInRecmd = false;
                    } else {
                        var data;
                        angular.forEach($scope.channelTypeList, function(v, k) {
                            if (v.id == x) {
                                data = v;
                            }
                        });
                        // if (x == 5) { //内部推荐人
                        //     $scope.hasChannelType = false;
                        //     if ($scope.teacherList.length > 0) {
                        //         $scope.isInRecmd = true;
                        //     } else {
                        //         $scope.isInRecmd = false;
                        //     }
                        // } else {
                             //来源渠道
                            $scope.isInRecmd = false;
                            if (data.channelList.length > 0) {
                                $scope.hasChannelType = true;
                                $scope.channelList2 = data.channelList;
                            } else {
                                $scope.channelList2 = [];
                                $scope.hasChannelType = false;
                            }
                        // }
                    }

                }

                function setStudentHeadImg() {
                    $scope.headerimgsrc = '';
                    $scope.openCopper = openCopper; //打开图片裁剪器

                    function openCopper() {
                        szpUtil.util_addImg(true, function(data, d_) {
                            $scope.headerimgsrc = data;
                            sourceLink = d_
                            $scope.$apply();
                        }, { type: 'image/gif, image/jpeg, image/png',dataSource:'stdInfo' });
                    }
                }

                function getPotentialCustomer() { //获取潜客或者学员详情
                    $.hello({
                        url: CONFIG.URL + '/api/oa/sale/getPotentialCustomer',
                        type: 'get',
                        data: {
                            id: item.potentialCustomerId
                        },
                        success: function(data) {
                            if (data.status == 200) {
                                if ($scope.isPotential) {
                                    EDITPOTIALINIT(data.context);
                                } else {
                                    EDITSTUDENT(data.context);
                                }
                            }
                        }
                    });
                }

                function getRecmdList() { //获取内部推荐人列表
                    $.hello({
                        url: CONFIG.URL + '/api/oa/userAdmin/getSimpleOaWorkerList',
                        type: 'get',
                        data: {
                            status: 1 // 状态:1-在职,2-离职
                        },
                        success: function(data) {
                            if (data.status == "200") {
                                $scope.teacherList = data.context;
                            }
                        }
                    });
                }

                function addParent() { //增加关系列表
                    //              var len = $scope.addParentList.length;
                    //              for (var i = 0; i < len; i++) {
                    //                  var selectVal = $scope.addParentList[i].relation;
                    //                  var name = $scope.addParentList[i].name;
                    //                  var phone = $scope.addParentList[i].phone;
                    //                  if (!phone) {
                    //                      return;
                    //                  }
                    //              }
                    if ($scope.addParentList.length >= 2) {
                        layer.msg("最多添加两条");
                        return;
                    }
                    var obj = {
                        "relation": "",
                        "name": "",
                        "phone": ""
                    };
                    $scope.addParentList.push(obj);
                }

                function deleteRelation(e, index) { //删除关系列表
                    //              var $this = $(e.target);
                    //              if ($scope.addParentList.length >= 2) {
                    $scope.addParentList.splice(index, 1);
                    //              }
                }

                function intentShow(idex) {
                    $scope.studentData.tip_text = CONSTANT.INTENT_SHOW[idex];
                }

                function getCourseId() { //获取课程列表
                    $.hello({
                        url: CONFIG.URL + '/api/oa/course/getCoursesList',
                        type: 'get',
                        data: {
                            pageType: 0, // 不需要分页
                        },
                        success: function(data) {
                            // 处理课程列表
                            if (data.status == "200") {
                                $scope.courseList = data.context;
                                $timeout(function() {
                                    if ($scope.studentData) {
                                        $scope.$broadcast('_likeCourse', 'reloadData', {
                                            'data': $scope.course_,
                                            'att': 'courseId'
                                        });
                                    }
                                }, 500, true);
                            }
                        }
                    });
                }
                //          function getNameByList(id,arr){
                //              var name="";
                //              for(var i in arr){
                //                  if(id == arr[i].id){
                //                      return name = arr[i].name;
                //                  }
                //              }
                //          }
                function clickHandler(x) {
                    $scope.studentData = x;
                }

                function delCourse_(data, ind) { //多个意向课程删除
                    data.hasSelected = false;
                    $scope.course_.splice(ind, 1);
                }

                function selCourse_(data) { //多个意向课程添加
                    console.log(data);
                    var judHas = true;
                    var judHasIndex = null;
                    angular.forEach($scope.course_, function(val, index) {
                        if (val.courseId == data.courseId) {
                            judHas = false;
                            judHasIndex = index;
                        }
                    });
                    if (judHas) {
                        $scope.course_.push(data);
                        data.hasSelected = true;
                    } else {
                        $scope.course_.splice(judHasIndex, 1);
                        data.hasSelected = false;
                    }
                }

                function deterMark(d) {
                    $scope.studentData.tags = d;
                    //          angular.forEach(d, function(val) {
                    //              var judge = true;
                    //              angular.forEach($scope.studentData.tags, function(val_) {
                    //                  if(val.id == val_.id) {
                    //                      judge = false;
                    //                  }
                    //              })
                    //              if(judge) {
                    //                  $scope.studentData.tags.push(val);
                    //              }
                    //          })
                }
                $scope.$on("添加推荐人", function (evt, data) {
                    console.log(data);
                    $scope.studentData.reference = getRefferral(data);
                });
                function getRefferral(data) {
                    var obj = {};
                    switch (data.referralType) {
                        case 1:
                            obj = {
                                name:data.studentName,
                                id:data.referralDataId,
                                phone:data.phoneNum
                            };
                            break;
                        case 2:
                            obj = {
                                name:data.name,
                                id:data.potentialCustomerId,
                                phone:data.potentialCustomerParentPhone
                            };
                            break;
                        case 3:
                            obj = {
                                name:data.teacherName,
                                id:data.shopTeacherId,
                                phone:data.teacherPhone
                            };
                            break;
                        default:
                            break;
                    }
                    obj["type"] = data.referralType;
                    return obj;
                }
                function delStudent(x, ind) {
                    $scope.studentData.reference = undefined;
                }
            }
        });
    });