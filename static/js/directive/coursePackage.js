/*
 * props参数说明：
 *  from：弹框来源渠道默认是课程包。
 *  type：是编辑操作还是新增操作。
 *  item：如果是编辑操作所携带的数据。
 *  title：来源渠道名称。
 *
 */

define(['laydate', 'szpUtil'], function(laydate) {
    creatPopup({
        el: 'coursePackage',
        openPopupFn: 'openCoursepackage',
        htmlUrl: './templates/popup/coursePackage.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state) {
            //          $scope.bind_obj = {};
            //          init();
            getSchoolTermList(); //获取学期列表之后再初始化数据init
            function init() {
                console.log(props);
                $scope.power_operate = props.power_operate === false ? false : true; //操作权限
                $scope.popupTypeData = { //弹框所属的类型（课程包、商城）
                    type: 1,
                    name: '',
                    countName: '课程包金额',
                    popupName: props.type == 0 ? '新增课程包' : '编辑课程包',
                };
                switch (props.from) { //区分弹框来源渠道
                    case 'mall': //来自商城
                        $scope.popupTypeData = {
                            type: 'mall',
                            productId: props.type == 1 ? props.item.productId : '',
                            name: props.type == 1 ? props.item.name : '',
                            imgurl: props.type == 1 ? props.item.imgurl : '',
                            describe: props.type == 1 ? props.item.describe : '',
                            mallType: props.type == 1 ? props.item.mallType : 0,
                            countName: '商品金额',
                            popupName: props.type == 1 ? '编辑商品' : '新增商品',
                        };
                        getShowCourseList(); //获取展示课程列表
                        break;
                };
                $scope.packageData = { course: [], goods: [] }; //课程包数据
                SERVICE.COURSEANDCLASS.COURSE['选课报名-课程'] = deter_signUpCourse; //确定报名课程
                SERVICE.COURSEANDCLASS.GOODS['选课报名-学杂'] = deter_signUpGoods; //确定报名学杂
                $scope.switch_goodsSpecId = switch_goodsSpecId; //切换学杂规格
                $scope.coursePackageMoney = 0 //课程包金额
                $scope.del_signUpCourse = del_signUpCourse;
                $scope.del_signUpGoods = del_signUpGoods;
                $scope.confirmData = confirmData; //确认提交数据
                $scope.thisYears = getSomeYears(); //获取今年年份
                $scope.selYear = selYear;
                $scope.selSchoolTerm = selSchoolTerm;
                $scope.inputPackageTime = inputPackageTime;
                $scope.choseClass_ = choseClass_; //改版选班
                $scope.initDiscount = initDiscount; //切换折扣类型计算优惠金额
                $scope.selTimeFrame = selTimeFrame; //时间控件
                $scope.sel_package = sel_package; //下拉选择套餐之后按月的默认结束时间
                $scope.selTimeFrame_obj = {}; //课程时间控件对象（控制开始时间和结束时间限制的作用）
                $scope.courseItemInfo = {}; //点击选班的时候预存整条信息
                $scope.operationInfo = operationInfo; //各类操作
                if (props.type == 1 && $scope.popupTypeData.type == 1) { //如果是编辑课程包
                    seeCoursePackageInfo();
                };
                $scope.toString = function(val) {
                        return String(val);
                    }
                    //图片更换和添加
                $scope.imgover = function(evt, type) {
                    switch (type) {
                        case 'change':
                            $(evt.target).closest('.imghover').find('.msk_changeimg').show();
                            break;
                    }
                };
                $scope.imgout = function(evt, type) {
                    switch (type) {
                        case 'change':
                            $(evt.target).closest('.imghover').find('.msk_changeimg').hide();
                            break;
                    }
                }
            }
            $scope.goCommonPop = function(el, id, width, data) {
                    window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                }
                //监听课程包金额的变化
            $scope.$watch('packageData', function(n, o) {
                if (n === o || n == undefined) return; //防止第一次重复监听
                resetSignparam2();
                $scope.coursePackageMoney = 0;
                if ($scope.packageData) {
                    angular.forEach($scope.packageData.course, function(val) {
                        if (val.package) {
                            if (val.discountType == '1') {
                                $scope.coursePackageMoney += (val.package.packagePrice - val.discountPrice) ? (val.package.packagePrice - val.discountPrice) : 0;
                            } else {
                                $scope.coursePackageMoney += (val.package.packagePrice * (val.discountPrice_ / 100)) ? (val.package.packagePrice * (val.discountPrice_ / 100)) : 0;
                            }
                        }
                    });
                    angular.forEach($scope.packageData.goods, function(val) {
                        $scope.coursePackageMoney += (val.goodsPrice * val.goodsNumber) ? (val.goodsPrice * val.goodsNumber) : 0;
                    })
                }
            }, true);

            function resetSignparam2() {
                if ($scope.packageData) {
                    angular.forEach($scope.packageData.course, function(x, index) {
                        if ((x.package_ && x.package.packageTime * 1 != x.package_.packageTime * 1) || (x.package_ && x.package.packagePrice * 1 != x.package_.packagePrice * 1)) {
                            if (x.iscustom) { //选择自定义套餐
                                $scope.$broadcast(x.time_id, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                            } else { //修改了课时、课程价格、按月课程换成天选择
                                $scope.$broadcast(x.time_id, x.package_.feeType == 1 ? "按期报名" : x.package_.feeType == 2 ? "按月报名" : "课时报名")
                                x.package_ = null;
                                x.iscustom = true;
                            }
                        }
                    });
                }
            }
            //操作
            function operationInfo(type, d, ind) {
                switch (type) {
                    case 'img':
                        szpUtil.util_addImg(true, function(data) {
                            $scope.popupTypeData.imgurl = data;
                            $scope.$apply();
                        }, {options: {aspectRatio: 16/9}, type: 'image/gif, image/jpeg, image/png', dataSource:'product'});
                        break;
                    case 'mallType':
                        $scope.packageData = { course: [], goods: [] }; //课程包数据
                        break;
                    case 'course': //点击课程类型添加课程
                        if ($scope.packageData.course.length > 0) {
                            return layer.msg('只能添加一个课程，删除后可继续添加。');
                        }
                        window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseCourse', '760px', { name: 'course', type: 'radio', callBackName: '选课报名-课程' });
                        break;
                    case 'goods': //点击学杂类型添加学杂
                        if ($scope.packageData.goods.length > 0) {
                            return layer.msg('只能添加一个学杂，删除后可继续添加。');
                        }
                        window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseGoods', '760px', { name: 'goods', type: 'radio', callBackName: '选课报名-学杂', item: $scope.packageData.goods });
                        break;
                    case 'delete': //点击删除班级
                        d.classList.splice(ind, 1);
                        break;
                    case 'originalPrice': //修改原价
                        console.log(d);
                        d.package.originalPrice = d.package.originalPrice ? d.package.originalPrice : 0;
                        d.package.packagePrice = d.package.packagePrice ? d.package.packagePrice : 0;
                        if (d.package.packagePrice * 1 > d.package.originalPrice * 1) {
                            layer.msg('原价应大于等于课程价格');
                            d.package.originalPrice = d.package.packagePrice;
                        };
                        break;
                }
            }

            //获取展示课程列表数据
            function getShowCourseList() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/course/listExperienceCourse",
                    type: "get",
                    data: {},
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.screen_showCourseList = res.context;
                            if (props.type == 1) seeCoursePackageInfo();
                        };
                    }
                });
            }

            //如果编辑课程包-查询课程包详情
            function seeCoursePackageInfo() {
                var _c = [],
                    _g = [];
                $scope.popupTypeData.name = $scope.popupTypeData.type == 1 ? props.item.coursePackageName : $scope.popupTypeData.name;
                //处理课程
                var Len = props.item.coursePackageCourseList.length,
                    lenIndex = 0;
                angular.forEach(props.item.coursePackageCourseList, function(val) {
                    var objData_ = {
                        course: val.course,
                        packageList: [],
                        package: {},
                        package_: {},
                        amount: val.amount ? val.amount.toFixed(2) : 0,
                        _d: val,
                        discountType: val.discountType ? val.discountType + '' : '1',
                        discountPrice: val.discountType == '1' ? (val.discounts ? val.discounts : '') : '',
                        discountPrice_: val.discountType == '2' ? (val.discounts ? val.discounts : '100') : '100',
                        averageClassPrice: '',
                        contractMoney: '',
                        isShowClass: false,
                        oneTeacher: '', //一对一老师
                        chargeType: '', //收费类型（天、月）
                        monthNum: 0, //当收费类型是月时，月数
                        timeFrame: '', //时间范围
                        beginTime: val.beginTime ? $.format.date(val.beginTime, 'yyyy-MM-dd') : $.format.date(new Date(), 'yyyy-MM-dd'),
                        endTime: $.format.date(val.endTime, 'yyyy-MM-dd'),
                        time_id: val.courseId + '_' + new Date().getTime(), //用于mix指令，确保唯一性；
                        experienceCourse: '', //规格关联的展示课程
                        experienceCourseList: [], //规格关联的展示课程
                        classList: val.classList,
                    };

                    if ($scope.popupTypeData.type == 'mall') {
                        angular.forEach($scope.screen_showCourseList, function(v) {
                            if (val.experienceCourseId == v.experienceCourseId) { //获取已经选择的展示课程
                                objData_.experienceCourse = v;
                            }
                            if (val.courseId == v.course.courseId) { //获取展示课程列表
                                objData_.experienceCourseList.push(v);
                            }
                        })
                    }
                    //通过收费标准id获取所有套餐
                    $.hello({
                        url: CONFIG.URL + "/api/oa/chargeStandard/listPackage",
                        type: "get",
                        data: {
                            'chargeStandardId': val.course.chargeStandardId,
                        },
                        success: function(res) {
                            if (res.status == '200') {
                                objData_.packageList = res.context;
                                objData_.packageList_old = angular.copy(res.context);

                                //如果是分期
                                if (val.feeType == '1') {
                                    objData_['schoolYear'] = val.schoolYear + '';
                                    if ($scope.schoolTermList) {
                                        angular.forEach($scope.schoolTermList, function(_v) {
                                            if (val.schoolTermId == _v.schoolTermId) {
                                                objData_.schoolTerm = _v;
                                                //                                              selSchoolTerm(objData_);
                                            }
                                        })
                                    }
                                }

                                if (val.packageId) { //如果为套餐则赋值
                                    angular.forEach(res.context, function(val_2) {
                                        if (val.packageId == val_2.packageId) {
                                            objData_['package_'] = val_2;
                                        }
                                    });
                                }


                                if (val.feeType == "2" && $scope.popupTypeData.type != 'mall') {
                                    objData_['monthNum'] = getDatemonth(val.beginTime, val.endTime);
                                }
                                if (val.feeType == '2' && $scope.popupTypeData.type == 'mall') { //自动计算按月的均课价
                                    objData_['monthNum'] = val.buyTime;
                                }
                                objData_['package_']['feeType'] = val.feeType;
                                objData_['package_']['packageTime'] = val.buyTime;
                                objData_['package_']['packagePrice'] = $scope.popupTypeData.type == 'mall' ? val.amount : val.coursePrice;
                                objData_['package_']['originalPrice'] = val.coursePrice;
                                objData_['package_']['giveTime'] = val.giveTime;

                                if ($scope.popupTypeData.type != 'mall') { //课程包
                                    if (val && val.feeType == '2' && val.chargeType != '1') {
                                        objData_['package_']['packageUnitPrice'] = numAccuracy((objData_['package_']['packagePrice'] / objData_['package_']['packageTime']) * 30);
                                    } else {
                                        objData_['package_']['packageUnitPrice'] = numAccuracy(objData_['package_']['packagePrice'] / objData_['package_']['packageTime']);
                                    }

                                } else { //商城
                                    if (val && val.feeType == '2') {
                                        objData_['package_']['packageUnitPrice'] = numAccuracy(objData_['package_']['packagePrice'] / objData_['monthNum']);
                                    } else {
                                        objData_['package_']['packageUnitPrice'] = numAccuracy(objData_['package_']['packagePrice'] / objData_['package_']['packageTime']);
                                    }
                                }
                                objData_['package'] = angular.copy(objData_['package_']);
                                //                              if(val.discountType=='1'){
                                //                                  objData_["amount"] = numAccuracy(objData_['package']['packagePrice']-objData_.discountPrice);
                                //                              }else{
                                //                                  objData_["amount"] = numAccuracy(objData_['package']['packagePrice']*(objData_.discountPrice_/100));
                                //                              }
                                lenIndex++;
                                if (Len == lenIndex) {
                                    $scope.packageData.course = _c;
                                }
                            };
                        }
                    })
                    _c.push(objData_);
                });
                //处理学杂
                angular.forEach(props.item.coursePackageGoodsList, function(val) {
                        var obj = {
                            'goodsName': val.goods.goodsName,
                            'goodsPrice_': val.goods.goodsPrice,
                            'goodsId': val.goodsId,
                            'goodsPrice': val.goodsPrice,
                            'goodsNumber': val.goodsNumber,
                            'goodsType': val.goodsType
                        };
                        if (val.goodsType == 1) {
                            var goodPrice_ = '',
                                fl = true;
                            val.goodsSpecList.map(function(item) {
                                if (item.goodsSpecId == val.goodsSpecId) {
                                    fl = false;
                                    goodPrice_ = item.price;
                                }
                            })
                            obj['goodsPrice_'] = goodPrice_;
                            obj['goodsSpecId'] = fl ? null : (val.goodsSpecId + '');
                            obj['goodsSpecList'] = angular.copy(val.goodsSpecList);
                        }
                        _g.push(obj)
                    })
                    //              $scope.packageData.course = _c;
                $scope.packageData.goods = _g;
            }

            //确认提交数据
            function confirmData() {
                var params, courseList = [],
                    goodsList = [],
                    judgeReturn = [true, ''],
                    _url = "/api/oa/course/addCoursePackage";

                //处理课程
                angular.forEach($scope.packageData.course, function(val) {
                    //根据收费标准进行第一次判断
                    switch (val.package.feeType + '') {
                        case '1':
                            if (!val.schoolYear) {
                                judgeReturn = [false, '请选择学年'];
                                return;
                            };
                            if (!val.schoolTerm) {
                                judgeReturn = [false, '请选择学期'];
                                return;
                            };
                            break;
                        case '2':
                            if ($scope.popupTypeData.type != 'mall') {
                                if (val.chargeType == 1) {
                                    if (!val.monthNum) {
                                        val.endTime = val.beginTime;
                                    }
                                    if (val.monthNum === '') {
                                        judgeReturn = [false, '请输入购买月数'];
                                        return;
                                    }
                                    if (val.monthNum == 0 && !val.package.giveTime) {
                                        judgeReturn = [false, '签约天数需大于0'];
                                        return;
                                    }
                                } else {
                                    if (!val.beginTime) {
                                        judgeReturn = [false, '请选择课程开始时间'];
                                        return;
                                    };
                                    if (!val.endTime) {
                                        judgeReturn = [false, '请选择课程结束时间'];
                                        return;
                                    };
                                    if (CompareDate(val.beginTime, val.endTime)) {
                                        judgeReturn = [false, '课程开始时间不能大于结束时间'];
                                        return;
                                    }
                                }
                            } else {
                                if (val.monthNum === '') {
                                    judgeReturn = [false, '请输入购买月数'];
                                    return;
                                }
                                if (val.monthNum == 0 && !val.package.giveTime) {
                                    judgeReturn = [false, '签约天数需大于0'];
                                    return;
                                }
                            }
                            break;
                    }
                    val.package.packageTime = val.package.packageTime ? val.package.packageTime : 0; //购买课时
                    val.package.packagePrice = val.package.packagePrice ? val.package.packagePrice : 0; //课程价格
                    val.package.giveTime = val.package.giveTime ? val.package.giveTime : 0; //赠送课时
                    if (val.package.packageTime == 0) val.package.packagePrice = 0; //如果购买课时为0.课程价格为0
                    if (!val.package.packageTime && !val.package.giveTime) {
                        judgeReturn = [false, '请填写购买课时（天数）或者赠送课时（天数）'];
                        return;
                    }
                    if (!judgeReturn[0]) { //如果不符合条件则返回操作
                        layer.msg(judgeReturn[1]);
                        return;
                    }
                    var objData = {
                        'courseId': val.course.courseId,
                        'experienceCourseId': $scope.popupTypeData.type == 'mall' ? (val.experienceCourse ? val.experienceCourse.experienceCourseId : undefined) : undefined,
                        'packageId': val.package_ ? val.package_.packageId : undefined,
                        'coursePrice': val.package.packagePrice,
                        'buyTime': val.package.packageTime,
                        'giveTime': val.package.giveTime ? val.package.giveTime : 0,
                        'discountType': val.discountType,
                        'discounts': val.discountType == '1' ? val.discountPrice : val.discountPrice_,
                        'schoolYear': val.schoolYear ? val.schoolYear : undefined,
                        'schoolTermId': val.schoolTerm ? val.schoolTerm.schoolTermId : undefined,
                        'beginTime': val.timeFrame ? val.timeFrame.split('/ ')[0] + ' 00:00:00' : undefined,
                        'endTime': val.timeFrame ? val.timeFrame.split('/ ')[1] + ' 23:59:59' : undefined,
                        'feeType': val.package.feeType //课程类型
                    };
                    if (val.package.feeType == 2) { //如果是按月份的报名
                        if ($scope.popupTypeData.type == 'mall') { //如果是商品
                            objData['buyTime'] = val.monthNum;
                            objData['beginTime'] = val.beginTime ? (val.beginTime + ' 00:00:00') : undefined;
                        } else {
                            if (val.chargeType == '1') {
                                objData['buyTime'] = numAccuracy(val.monthNum == 0 ? 0 : getIntervalDays(val.beginTime, val.endTime) + 1);
                            } else {
                                objData['buyTime'] = numAccuracy(val.package.packageTime);
                            }
                            objData['beginTime'] = val.beginTime + ' 00:00:00';
                            objData['endTime'] = val.endTime + ' 00:00:00';
                        }
                    }
                    if ($scope.popupTypeData.type != 'mall') {
                        if (val.discountType == '1') {
                            objData.amount = numAccuracy(val.package.packagePrice - val.discountPrice);
                        } else {
                            objData.amount = numAccuracy(val.package.packagePrice * (val.discountPrice_ / 100));
                        }
                    }
                    //如果是商品
                    if ($scope.popupTypeData.type == 'mall') {
                        val.package.originalPrice = val.package.originalPrice ? val.package.originalPrice : 0;
                        val.package.packagePrice = val.package.packagePrice ? val.package.packagePrice : 0;
                        objData["amount"] = val.package.packagePrice ? val.package.packagePrice : 0;
                        objData['discountType'] = undefined;
                        objData['discountPrice'] = undefined;
                        objData['discountPrice_'] = undefined;
                        objData['coursePrice'] = val.package.originalPrice;
                        if (val.package.originalPrice * 1 < val.package.packagePrice * 1) {
                            judgeReturn = [false, '原价不能小于课程价格~'];
                            return;
                        };
                        objData['chargeType'] = val.package.feeType;
                        objData['specificationsCourseClassRList'] = [];
                        angular.forEach(val.classList, function(c) {
                            objData['specificationsCourseClassRList'].push({ 'classId': c.classId });
                        })
                    }
                    courseList.push(objData);
                });

                //处理学杂
                angular.forEach($scope.packageData.goods, function(val) {
                    var objData = {
                        'goodsId': val.goodsId,
                        'goodsPrice': val.goodsPrice,
                        'goodsNumber': val.goodsNumber,
                        'goodsSpecId': val.goodsSpecId
                    }

                    //如果是商品
                    if ($scope.popupTypeData.type == 'mall') {
                        objData['goodsName'] = val.goodsName;
                        objData['goodsPriceOld'] = val.goodsPrice_;
                        objData['goodsTotalPrice'] = val.goodsPrice * val.goodsNumber ? (val.goodsPrice * val.goodsNumber).toFixed(2) : 0;
                    }
                    goodsList.push(objData);
                });
                //判断是否有选择学杂
                if ($scope.packageData.course.length == 0 && $scope.packageData.goods.length == 0) {
                    judgeReturn = [false, '请选择报名课程或选择学杂'];
                }
                if (!judgeReturn[0]) { //如果不符合条件则返回操作
                    layer.msg(judgeReturn[1]);
                    return;
                }
                params = {
                    'coursePackageName': $scope.popupTypeData.name,
                    'coursePackagePrice': $scope.coursePackageMoney,
                    'coursePackageCourseList': courseList,
                    'coursePackageGoodsList': goodsList,
                }
                if (props.type == 1) {
                    _url = '/api/oa/course/updateCoursePackage';
                    params['coursePackageId'] = props.item.coursePackageId + '';
                }
                switch ($scope.popupTypeData.type) { //判断弹框所属类型
                    case 1: //课程包
                        $.hello({
                            url: CONFIG.URL + _url,
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(res) {
                                if (res.status == '200') {
                                    $scope.$parent.Fns.init("nosort");
                                    $scope.closePopup('add_coursepackage');
                                };
                            }
                        });
                        break;
                    case 'mall':
                        if (!$scope.popupTypeData.imgurl) return layer.msg('请选择商品封面');
                        if ($scope.popupTypeData.mallType == 2 && courseList.length <= 0) return layer.msg('套餐至少选择一个课程');
                        params = {
                            'productId': $scope.popupTypeData.productId ? $scope.popupTypeData.productId : undefined,
                            'productName': $scope.popupTypeData.name,
                            'productImageUrl': $scope.popupTypeData.imgurl,
                            'productDesc': $scope.popupTypeData.describe,
                            'productType': $scope.popupTypeData.mallType,
                            'specificationsCourseList': courseList.length > 0 ? courseList : undefined,
                            'specificationsGoodsList': goodsList.length > 0 ? goodsList : undefined,
                        }
                        _url = props.type == 0 ? '/api/oa/product/addProduct' : '/api/oa/product/modifyProduct'; //新增商品或者编辑
                        $.hello({
                            url: CONFIG.URL + _url,
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(res) {
                                if (res.status == '200') {
                                    $scope.$emit('coursePackage');
                                    $scope.closePopup('add_coursepackage');
                                };
                            }
                        });
                        break;
                }
            }

            function del_signUpCourse(ind) {
                // var isDelect = layer.confirm('是否删除该报名课程？', {
                //     title: "确认删除信息",
                //     skin: 'newlayerui layeruiCenter',
                //     closeBtn: 1,
                //     offset: '30px',
                //     move: false,
                //     area: '560px',
                //     btn: ['是', '否'] //按钮
                // }, function() {
                //     var _id = $scope.packageData.course[ind].time_id;
                //     $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                //     $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                //     $scope.packageData.course.splice(ind, 1);
                //     $scope.$apply();
                //     layer.close(isDelect);
                // }, function() {
                //     layer.close(isDelect);
                // })
                var _id = $scope.packageData.course[ind].time_id;
                $scope.selTimeFrame_obj['startLaydate_' + _id] = null;
                $scope.selTimeFrame_obj['endLaydate_' + _id] = null;
                $scope.packageData.course.splice(ind, 1);
            }

            function del_signUpGoods(ind) {
                // var isDelect = layer.confirm('是否删除该学杂？', {
                //     title: "确认删除信息",
                //     skin: 'newlayerui layeruiCenter',
                //     closeBtn: 1,
                //     offset: '30px',
                //     move: false,
                //     area: '560px',
                //     btn: ['是', '否'] //按钮
                // }, function() {
                //     $scope.packageData.goods.splice(ind, 1);
                //     $scope.$apply();
                //     layer.close(isDelect);
                // }, function() {
                //     layer.close(isDelect);
                // })
                $scope.packageData.goods.splice(ind, 1);
            }
            //选择班级
            function choseClass_(x, ind) {
                //              if(x.package.feeType == 1) {
                //                  if(!x.schoolYear || !x.schoolTerm) {
                //                      layer.msg('请选择学年或者学期');
                //                      return;
                //                  }
                //                  x.schoolTerm.schoolYear = x.schoolYear;
                //              }
                window.$rootScope.yznOpenPopUp($scope, 'course-sel', 'choseClass', '1060px', { name: 'class', type: 'checkbox', item: x.course, schoolTerm: x.schoolTerm, screen_classType: '0', callBackName: '课程包-选课报名-班级', obj: { 'data': x, att: 'classList' } });
            }
            //获取学期列表
            function getSchoolTermList(schoolTermId, obj, sp) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/chargeStandard/listSchoolTerm",
                    type: "get",
                    data: {
                        'pageType': 0,
                    },
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.schoolTermList = res.context;
                            init();
                        };
                    }
                })
            }
            //选择学年
            function selYear(x) {
                //              if($scope.popupTypeData.type == 'mall'){
                //                  x.classList = [];
                //              }
            }
            //选择学期  status:第一次编辑查看状态
            function selSchoolTerm(x, sp, status) {
                var arr_ = [],
                    count = 0;
                x.classInfo = '';
                x.isShowClass = false;
                x.teachers = [];
                if (x.schoolTerm) {
                    angular.forEach(x.packageList_old, function(val) {
                        if (val.schoolTermId == x.schoolTerm.schoolTermId || val.feeType !== 1) {
                            arr_.push(val);
                            if (val.feeType == 1) count++;
                        }
                    })
                    x.packageList = angular.copy(arr_);
                } else {
                    x.packageList = angular.copy(x.packageList_old);
                    count++;
                }
                //清空当前存在数据
                x.package_ = null;
                x.package = { feeType: 1 };
                x.amount = '';
                x.discountType = '1';
                x.discountPrice = '';
                x.chargeType = '1';
                x.monthNum = '';
                if (x.timeFrame) { //课程有效截至时间
                    x.timeFrame = '';
                    $('#' + x.time_id).val('');
                }
                //套餐列表变化需修改指令内套餐列表
                $scope.$broadcast(x.time_id, count == 0 ? "按期报名" : "请选择套餐", x.packageList, true)
            }

            function initDiscount(x) {
                if (x.discountType == '1') {
                    x.discountPrice = numAccuracy(x.package.packagePrice - x.amount);
                } else {
                    x.discountPrice_ = numAccuracy((x.amount / x.package.packagePrice) * 100);
                }
            }
            //输入课程购买课和购买月数失焦状态时
            function inputPackageTime(x, type, clear) {
                switch (type) {
                    case 1:
                        if (x.package) {
                            if (x.package.packageTime == 0) {
                                x.package.packagePrice = 0;
                                x.amount = 0;
                                x.discountType = '1';
                                x.discountPrice = 0;
                            } else {
                                x.package.packagePrice = x.package.packageTime ? numAccuracy(x.package.packageUnitPrice * x.package.packageTime) : 0;
                            }
                            if (x.discountType == '1') {
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        }
                        break;
                    case 2:
                        if ($scope.popupTypeData.type != 'mall') {
                            if (clear) {
                                x.endTime = ""
                                $scope.sel_package({
                                    data: { feeType: 2, custom: true }
                                }, x, true);
                                return;
                            }
                            if (x.beginTime) {
                                x.endTime = $.format.date(getNextMonth_(new Date(x.beginTime), x.monthNum, false), 'yyyy-MM-dd');
                            } else {
                                x.endTime = "";
                            }
                            if (x.chargeType == '1') {
                                x.package.packageTime = x.monthNum;
                            } else {
                                x.package.packageTime = getIntervalDays(x.beginTime, x.endTime) + 1;
                            }
                            //                          if(x.package.packageTime == 0) x.package.packagePrice = 0;
                            if (x.package.packageTime == 0) {
                                x.package.packagePrice = 0;
                                x.amount = 0;
                                x.discountType = '1';
                                x.discountPrice = 0;
                            } else {
                                if (x.chargeType == '1') {
                                    x.package.packagePrice = numAccuracy(x.package.packageUnitPrice * x.package.packageTime);
                                } else {
                                    x.package.packagePrice = numAccuracy((x.package.packageUnitPrice / 30) * x.package.packageTime);
                                }
                            }

                            if (x.discountType == '1') {
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        } else {
                            x.package.packageTime = x.monthNum;
                            if (x.package.packageTime == 0) {
                                x.package.packagePrice = 0;
                                x.amount = 0;
                                x.discountType = '1';
                                x.discountPrice = 0;
                            } else {
                                if (x.package.packageId) {
                                    x.package.packagePrice = numAccuracy(x.package.packageUnitPrice * x.package.packageTime);
                                } else {
                                    x.package.packagePrice = x.package.packageTime ? ((numAccuracy(x.package.packagePrice / x.package.packageTime) * x.package.packageTime)) : 0;
                                }
                            }
                            x.amount = x.package.packagePrice;
                        }
                        break;
                    case 3:
                        if (x.package) {
                            x.package.packageUnitPrice = numAccuracy(x.package.packagePrice / x.package.packageTime);
                            if (x && x.package.feeType == '2' && x.chargeType != '1' && $scope.popupTypeData.type != 'mall') {
                                x.package.packageUnitPrice = numAccuracy((x.package.packagePrice / x.package.packageTime) * 30);
                            }
                            if (x.discountType == '1') {
                                if (x.package.packagePrice * 1 < x.discountPrice * 1) {
                                    x.discountPrice = x.package.packagePrice;
                                }
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        }
                        break;
                    case 4:
                        if (x.package) {
                            if (x.discountType == '1') {
                                if (x.package.packagePrice * 1 < x.discountPrice * 1) {
                                    x.discountPrice = x.package.packagePrice;
                                }
                                x.amount = numAccuracy(x.package.packagePrice - x.discountPrice);
                            } else {
                                x.amount = numAccuracy(x.package.packagePrice * (x.discountPrice_ / 100));
                            }
                        }
                        break;
                    case 5:
                        if (x.package) {
                            if (x.package.packagePrice * 1 < x.amount * 1) {
                                x.amount = x.package.packagePrice;
                            }
                            if (x.discountType == '1') {
                                x.discountPrice = numAccuracy(x.package.packagePrice - x.amount);
                            } else {
                                x.discountPrice_ = numAccuracy((x.amount / x.package.packagePrice) * 100);
                            }
                        }
                        break;
                }
            }

            //选择套餐
            function sel_package(n, d, fl) {
                if (n.data.custom) { //自定义套餐
                    d.package = { feeType: n.data.feeType };
                    d.iscustom = n.data.custom;
                    d.package_ = null;
                    if (fl) {
                        d.package_ = { feeType: n.data.feeType };
                    }
                } else {
                    d.package = {};
                    d.package_ = {};
                    //初始套餐赋值
                    angular.forEach(d.packageList_old, function(v) {
                        if (v.packageId == n.data.packageId) {
                            for (j in v) {
                                d.package[j] = v[j];
                                d.package_[j] = v[j];
                            }
                        }
                    })
                    d.iscustom = false;
                }

                d.amount = 0;
                d.discountType = '1';
                d.discountPrice = 0;
                if (!fl) {
                    d.chargeType = '1';
                }
                d.monthNum = "";
                if (!d.iscustom) {
                    //获取未修改之前的套餐
                    angular.forEach(d.packageList_old, function(v) {
                        if (v.packageId == d.package.packageId) {
                            for (j in v) {
                                d.package[j] = v[j];
                                d.package_[j] = v[j];
                            }
                        }
                    })
                    if (d && d.package.feeType == '2' && d.package.packageTime) {
                        d.monthNum = d.package.packageTime * 1;
                        d.chargeType = '1';
                        d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum, false), 'yyyy-MM-dd');
                        if (d.chargeType == '1') {
                            d.package.packageTime = d.monthNum;
                        } else {
                            d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                        }
                        if (d.package.packageTime == 0) {
                            d.package.packagePrice = 0;
                            d.amount = 0;
                            d.discountType = '1';
                            d.discountPrice = 0;
                        }
                    }
                    //选择按期套餐选中学期
                    if (d && d.package.feeType == '1') {
                        var fl = true; //套餐内学期已被删除标志位
                        angular.forEach($scope.schoolTermList, function(v_) {
                            if (v_.schoolTermId == d.package.schoolTermId) {
                                d.schoolTerm = v_;
                                fl = false;
                            }
                        })
                        if (fl) d.schoolTerm = '';
                    }
                    if (d.discountType == '1') {
                        d.amount = numAccuracy(d.package.packagePrice - d.discountPrice);
                    } else {
                        d.amount = numAccuracy(d.package.packagePrice * (d.discountPrice_ / 100));
                    }
                    d.package['originalPrice'] = d.package.packagePrice;
                }
                manualOnresize(); //刷新弹框高度
            }

            //点击课程开始结束时间 || 时间范围控件
            function selTimeFrame(d, evt, type) {
                var _s = $scope.selTimeFrame_obj['startLaydate_' + d.time_id],
                    _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
                //加载时间范围选择控件
                if (type == 3 && !d.timeFrameLaydate) {
                    laydate.render({
                        elem: evt.target, //指定元素
                        range: "/",
                        isRange: false,
                        format: 'yyyy-MM-dd',
                        done: function(value, value2) {
                            d.timeFrame = value;
                        }
                    });
                };
                //动态加载开始时间和结束时间选择控件（当存在则不加载）
                if (type == 1 && !_s || type == 2 && !_e) {
                    var l_ = laydate.render({
                        elem: evt.target, //指定元素
                        isRange: false,
                        min: (d.beginTime && type == 2) ? $.format.date(d.beginTime, 'yyyy-MM-dd') : '1970-1-1',
                        format: 'yyyy-MM-dd',
                        done: function(value, value2) {
                            if (type == 1) {
                                d.beginTime = value;
                                var _e = $scope.selTimeFrame_obj['endLaydate_' + d.time_id];
                                if (_e) {
                                    //控制结束时间不能小于开始时间
                                    _e.config.min = value2;
                                    _e.config.min.month--;
                                }
                                if (d.chargeType == 1) { //如果是按月的收费(通过填写的月数获取结束时间)
                                    d.endTime = $.format.date(getNextMonth_(new Date(d.beginTime), d.monthNum, false), 'yyyy-MM-dd');
                                }
                            } else {
                                d.endTime = value;
                            }
                            //根据时间计算购买天数
                            if (d.beginTime && d.endTime) {
                                //                              d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                                //                              if(d.package.packageTime == 0) d.package.packagePrice = 0;
                                if (d.chargeType != 1) {
                                    d.monthNum = getDatemonth(d.beginTime, d.endTime);
                                }
                                if (d.chargeType == '1') {
                                    d.package.packageTime = d.monthNum;
                                } else {
                                    d.package.packageTime = getIntervalDays(d.beginTime, d.endTime) + 1;
                                }
                                if (d.package.packageTime == 0) {
                                    d.package.packagePrice = 0;
                                    d.amount = 0;
                                    d.discountType = '1';
                                    d.discountPrice = 0;
                                } else {
                                    if (d.chargeType != '1') {
                                        d.package.packagePrice = numAccuracy(d.package.packageUnitPrice / 30 * d.package.packageTime);
                                    }
                                }
                                if (d.discountType == '1') {
                                    d.amount = numAccuracy(d.package.packagePrice - d.discountPrice);
                                } else {
                                    d.amount = numAccuracy(d.package.packagePrice * (d.discountPrice_ / 100));
                                }

                            }
                            $scope.$apply();
                        }
                    });
                    //预存时间控件
                    if (type == 1) {
                        $scope.selTimeFrame_obj['startLaydate_' + d.time_id] = l_;
                    } else {
                        $scope.selTimeFrame_obj['endLaydate_' + d.time_id] = l_;
                    }
                }
            }

            //点击课程筛选器确认
            function deter_signUpCourse(param) {
                if ($scope.popupTypeData.type == 'mall' && $scope.popupTypeData.mallType != 2) {
                    param = [param];
                }
                if (param) {
                    angular.forEach(param, function(val, ind) {
                        var objData_ = {
                            course: val,
                            packageList: [],
                            package: { feeType: 0 },
                            package_: null,
                            discountType: '1',
                            discountPrice: '',
                            discountPrice_: '100',
                            averageClassPrice: '',
                            contractMoney: '',
                            isShowClass: false,
                            oneTeacher: '', //一对一老师
                            chargeType: '1', //收费类型（天、月）
                            monthNum: 0, //当收费类型是月时，月数
                            timeFrame: '', //时间范围
                            beginTime: $.format.date(new Date(), 'yyyy-MM-dd'),
                            // beginTime: '',
                            time_id: val.courseId + '_' + new Date().getTime(), //触发时间控件元素的记号，确保唯一性；
                            experienceCourse: '', //规格关联的展示课程
                            experienceCourseList: [], //规格关联的展示课程
                            classList: [], //商城添加班级列表
                        };

                        if ($scope.popupTypeData.type == 'mall') {
                            angular.forEach($scope.screen_showCourseList, function(v) {
                                if (val.courseId == v.course.courseId) {
                                    objData_.experienceCourseList.push(v);
                                }
                            })
                        }
                        //获取套餐
                        objData_.packageList = val.packages;
                        objData_.packageList_old = angular.copy(val.packages);

                        //如果是分期的
                        //                      if(objData_.package.feeType == '1') {
                        //                          objData_['schoolYear'] = (new Date()).getFullYear() + '';
                        //                          objData_['schoolTerm'] = '';
                        //                      }
                        //                      objData_['package'] = angular.copy(objData_['package_']);
                        if ($scope.popupTypeData.type == 'mall' && $scope.popupTypeData.mallType != 2) {
                            $scope.packageData.course = [];
                        }
                        $scope.packageData.course.push(objData_);
                        console.log(objData_);

                        //通过收费标准id获取所有套餐
                        //                      $.hello({
                        //                          url: CONFIG.URL + "/api/oa/chargeStandard/listPackage",
                        //                          type: "get",
                        //                          data: {
                        //                              'chargeStandardId': val.chargeStandardId,
                        //                          },
                        //                          success: function(res) {
                        //                              if(res.status == '200') {
                        //                                  objData_.packageList_ = res.context;
                        //                                  objData_.packageList_old = angular.copy(res.context);
                        //
                        //                                  //如果是分期的
                        //                                  if(val.chargeStandardType == '1') {
                        //                                      objData_['schoolYear'] = (new Date()).getFullYear() + '';
                        //                                      objData_['schoolTerm'] = '';
                        //                                  }
                        //                                  objData_['package'] = angular.copy(objData_['package_']);
                        //                                  if($scope.popupTypeData.type == 'mall' && $scope.popupTypeData.mallType != 2) {
                        //                                      $scope.packageData.course = [];
                        //                                  }
                        //                                  $scope.packageData.course.push(objData_);
                        //                                  console.log(objData_);
                        //                              };
                        //                          }
                        //                      })

                        if (val.courseGoodsRS && val.courseGoodsRS.length > 0) {
                            var list = val.courseGoodsRS;
                            var arrGoods = [];
                            angular.forEach(list, function(v) {
                                v.goods.goodsNumber = v.goodsNumber;
                                arrGoods.push(v.goods);
                            });

                            if ($scope.popupTypeData.type == 'mall' && $scope.popupTypeData.mallType != 2) {

                            } else {
                                deter_signUpGoods(arrGoods);
                            }
                        }
                    })
                }
            }

            //学杂筛选列表点击确定
            function deter_signUpGoods(arr) {
                console.log(arr)
                var arr_1 = [];
                if ($scope.popupTypeData.type == 'mall' && $scope.popupTypeData.mallType != 2) {
                    arr = [arr];
                }
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].goodsType == 1) { //学杂默认选中第一项
                        if (arr[i].goodsSpecList && arr[i].goodsSpecList.length) {
                            arr[i]['goodsPrice_'] = arr[i].goodsSpecList[0].price;
                            arr[i]['goodsPrice'] = arr[i].goodsSpecList[0].price;
                            arr[i]['goodsSpecId'] = arr[i].goodsSpecList[0].goodsSpecId + '';
                        }
                    } else {
                        arr[i]['goodsPrice_'] = arr[i].goodsPrice;
                    }
                    arr[i]['goodsNumber'] = 1;
                    arr_1.push(arr[i]);
                }
                if ($scope.popupTypeData.type == 'mall' && $scope.popupTypeData.mallType != 2) {
                    $scope.packageData.goods = [];
                }
                $scope.packageData.goods = $scope.packageData.goods.concat(arr_1);
            }
            //学杂规格切换
            function switch_goodsSpecId(data) {
                console.log(data)
                if (data.goodsSpecId) {
                    data.goodsSpecList.map(function(item) {
                        if (item.goodsSpecId == data.goodsSpecId) {
                            data.goodsPrice_ = item.price;
                            data.goodsPrice = item.price;
                        }
                    })
                } else {
                    data.goodsPrice_ = 0;
                    data.goodsPrice = ""
                }

            }

        }
    })
})