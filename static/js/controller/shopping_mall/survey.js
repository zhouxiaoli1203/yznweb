define(['qrcode', 'mySelect', 'creatCoupon', "orderInfo", 'students_sel', 'courseAndClass_sel', 'potial_sel', 'checkAnswer', 'remarkPop'], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', "$timeout", function($scope, $rootScope, $http, $state, $stateParams, $timeout) {
        var pagerRender = false,
            pagerRendercheck = false,
            start = 0,
            eachPage = localStorage.getItem("surveyPage") ? localStorage.getItem("surveyPage") : 10,
            start1 = 0,
            s_eachPage = localStorage.getItem('surveyPage1') ? localStorage.getItem('surveyPage1') : 10, //页码初始化
            $M_box3 = $('.M_box3_1'),
            $M_box2 = $('.M_box3_2'), //分页显示
            surveyName, //搜索类型
            orderType = 'desc',
            orderType1 = 'desc',
            shareHref_ = window.location.protocol + '//' + window.location.host;
        var confirm;
        if (window.location.host == 'www.yizhiniao.com') {
            shareHref_ = window.location.protocol + '//' + 'm.yizhiniao.com';
        }
        $scope.survey_opra = checkAuthMenuById("153");
        init();

        function init() {
            $scope.QuestionBank_choosed_obj = {}; //已选中的问题
            $scope.QuestionBank_choosed = []; //已选中的问题
            //创建问卷弹窗
            $scope.openCreateSuevey = function() {
                $scope.iseditSurvey = false;
                $scope.submitQuesdata = {
                    behindImageUrl: 'https://cdn.yizhiniao.com/surveytop.png'
                };
                $scope.QuestionBank_choosed_obj = {}; //已选中的问题
                $scope.QuestionBank_choosed = []; //已选中的问题
                $scope.QuestionList = [];
                openPopByDiv(null, '.survey-popup', '760px');
            };
            //引用模板弹框
            $scope.opensurveyTemplate = function() {
                $.hello({
                    url: CONFIG.URL + "/api/oa/questionnaire/listTemplate",
                    type: "get",
                    data: {},
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.surveyTemplateList = res.context.items;
                            angular.forEach($scope.surveyTemplateList, function(item) {
                                item.previewUrl = shareHref_ + '/h5/tq/index.html?key=' + item.questionnaireTemplateId;
                            })
                        }
                    }
                });
                openPopByDiv('问卷模板', '.surveyTemplate-popup', '760px');
            };
            //问卷详情里查看问卷表头
            $scope.surveyThead = [
                { 'name': '姓名(昵称)' },
                { 'name': '年龄' },
                { 'name': '联系方式' },
                { 'name': '提交时间', 'issort': true, 'sort': 'desc', 'width': '120px' },
                { 'name': '已读状态' },
                { 'name': '查看状态' },
                { 'name': '备注' },
                { 'name': '操作', 'align': 'center', 'width': '140px' }
            ];
            $scope.sortCllict = function(type, data) {
                switch (type) {
                    case 1:
                        orderType1 = data.sort;
                        pagerRender = false;
                        getSurveyList(0);
                        break;
                    case 2:
                        orderType = data.sort;
                        pagerRendercheck = false;
                        $scope.getlistRespondents(0);
                        break;
                }

            };
            //打开题库弹窗
            $scope.openQues = function() {
                $scope.newChoosed_obj = angular.copy($scope.QuestionBank_choosed_obj); //
                $scope.newChoosed = angular.copy($scope.QuestionBank_choosed);
                $scope.getlistQuestionBank();
                openPopByDiv('选择题目', '.ques-popup', '760px');
            };
            $scope.goCommonPop = function(el, id, width, data, fn) {
                    if (fn) {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data, fn);
                    } else {
                        window.$rootScope.yznOpenPopUp($scope, el, id, width, data);
                    }

                }
                //打开查看填空题弹框
            $scope.customerAnswer = function(index, name, questionnaireContentId, questionnaireAnserId, questionnaireId) {
                    $scope.leadOutquestionnaireContentId = questionnaireContentId;
                    $scope.leadOutquestionnaireAnserId = questionnaireAnserId;
                    $scope.leadOutquestionnaireId = questionnaireId;
                    $scope.currentQues = index + "：" + name;
                    $scope.getquestionnairelistText(questionnaireContentId, questionnaireAnserId)
                    openPopByDiv('详细信息' + '<span class="color_nameState">(' + $scope.questionnaireDetail.questionnaireName + ')</span>', '.customerAnswer-popup', '760px');
                }
                //获取所选选择题填写列表
            $scope.getquestionnairelistText = function(questionnaireContentId, questionnaireAnserId) {
                $.hello({
                    url: CONFIG.URL + "/api/oa/questionnaire/listText",
                    type: "get",
                    data: { questionnaireContentId: questionnaireContentId, questionnaireAnserId: questionnaireAnserId },
                    success: function(res) {
                        if (res.status == 200) {
                            $scope.currentQuesList = res.context.items;
                        }
                    }
                });
            };
            //确定选择学员
            $scope.$on('通知-学员', function(d, d_) {
                    $scope.inform_sel(d_, 's');
                })
                //确定选择班级
            $scope.$on('通知-班级', function(d, d_) {
                $scope.inform_sel(d_, 'c');
            });
            //确定选择潜客
            $scope.$on('通知-潜客', function(d, d_) {
                $scope.inform_sel(d_, 'p');
            });
            $scope.$on('删除-答卷', function(d) {
                $scope.getlistRespondents(start1);
            });
            //删除收件人
            $scope.inform_del = function(d, ind, type) {
                    var _data = $scope.sendSurveyData.selectTargets_class; //判断是发送通知的数据还是发送短信的数据
                    switch (type) {
                        case 'c': //班级
                            $scope.sendSurveyData.classList.splice(ind, 1);
                            break;
                        case 's': //学员
                            $scope.sendSurveyData.studentList.splice(ind, 1);
                            break;
                        case 'p': //潜客
                            $scope.sendSurveyData.potialList.splice(ind, 1);
                            break;
                    }
                }
                //生成二维码
            $scope.makeQrcode = function(surveyUrl) {
                    $('#surveyUrl').html('<span></span><img alt="预览问卷" />');
                    var miniCode = jQuery('#surveyUrl span').qrcode({ //渲染二维码
                        render: "canvas", //也可以替换为table
                        width: 500,
                        height: 500,
                        text: surveyUrl,
                    }).hide();
                    $('#surveyUrl img').attr('src', miniCode.find('canvas').get(0).toDataURL('image/jpg'));
                    openPopByDiv('预览问卷', '#surveyQrCode', '310px');
                }
                //添加自定义题目
            $scope.addQues = function(type) {
                    if (type) { //填空题
                        $scope.QuestionList.push({
                            questionName: "",
                            questionType: 1,
                            questionNotNull: 0,
                            questionDefaultValue: '',
                            userDefined: 1
                        })
                    } else { //选择题
                        $scope.QuestionList.push({
                            questionName: "",
                            questionType: 2,
                            questionNotNull: 0,
                            hasOther: false, //是否有其他选项
                            anserFillIn: false, //其他选项是否可填
                            userDefined: 1,
                            questionAnserList: [{ anser: '' }, { anser: '' }, { anser: '' }, { anser: '' }]
                        })
                    }
                }
                //删除问题
            $scope.oprateAnswer = function(index, add, inx) {
                    if (add) {
                        $scope.QuestionList[index].questionAnserList.push({
                            anser: ''
                        })
                    } else {
                        if ($scope.QuestionList[index].questionAnserList.length == 1) {
                            return layer.msg("请最少保留一个选项")
                        }
                        $scope.QuestionList[index].questionAnserList.splice(inx, 1)
                    }
                }
                //添加其他选项
            $scope.addother = function(index) {
                    if ($scope.QuestionList[index].hasOther) {
                        var i;
                        angular.forEach($scope.QuestionList[index].questionAnserList, function(item, inx) {
                            if (item.anser == "其他") {
                                $scope.QuestionList[index].hasOther = false;
                                i = inx;
                            }
                        })
                        $scope.QuestionList[index].questionAnserList.splice(i, 1)

                    } else {
                        $scope.QuestionList[index].hasOther = true;
                        $scope.QuestionList[index].questionAnserList.push({
                            anser: '其他'
                        })
                    }

                }
                //获取收件对象
            $scope.inform_sel = function(data, type) {
                    switch (type) {
                        case 'c': //班级
                            $scope.sendSurveyData.classList = duplicateRemoval(data, $scope.sendSurveyData.classList, 'classId');
                            break;
                        case 's': //学员
                            $scope.sendSurveyData.studentList = duplicateRemoval(data, $scope.sendSurveyData.studentList, 'id');
                            break;
                        case 'p': //潜客
                            $scope.sendSurveyData.potialList = duplicateRemoval(data, $scope.sendSurveyData.potialList, 'potentialCustomerId');
                            break;
                    }
                }
                //引用模板数据
            $scope.useTemsurvey = function(x) {
                var idDel = layer.confirm('引用问卷后系统将清空已选题目，是否引用该模板？', {
                    title: "确认信息",
                    skin: 'newlayerui layeruiCenter',
                    closeBtn: 1,
                    offset: '30px',
                    move: false,
                    area: '560px',
                    btn: ['是', '否'] //按钮
                }, function() {
                    //清空
                    $scope.QuestionBank_choosed_obj = {};
                    $scope.QuestionBank_choosed = [];
                    $scope.QuestionList = [];
                    angular.forEach(x.questionnaireContentTemplateList, function(n) {
                        $scope.QuestionBank_choosed_obj[n.questionId] = n.questionId;
                        n.questionAnserList = n.questionnaireAnserTemplateList;
                        n.userDefined = 0;
                        $scope.QuestionBank_choosed.push(n)
                    })
                    $scope.QuestionList = angular.copy($scope.QuestionBank_choosed);
                    $scope.$apply();
                    $scope.closePopup();
                    layer.close(idDel);
                }, function() {
                    layer.close(idDel);
                });
            };
            //发送问卷
            $scope.sendSurvey = function() {
                var params = angular.copy($scope.sendSurveyData);
                if (params.type == 'potentialCustomer' && params.scope == 'portion' && params.potialList.length == 0) {
                    return layer.msg("请选择潜客")
                }
                if (params.type == 'student' && params.scope == 'class' && params.classList.length == 0) {
                    return layer.msg("请选择班级")
                }
                if (params.type == 'student' && params.scope == 'portion' && params.studentList.length == 0) {
                    return layer.msg("请选择学员")
                }
                if (!params.notificationMode_wx && !params.notificationMode_sms) {
                    return layer.msg("请选择通知方式")
                }
                if (params.scope == "class") { //按班级发送
                    params.classIds = [];
                    angular.forEach(params.classList, function(item) {
                        params.classIds.push(item.classId);
                    })
                } else {
                    var arr = params.type == "student" ? params.studentList : params.potialList;
                    params.potentialCustomeridList = [];
                    angular.forEach(arr, function(item) {
                        params.potentialCustomeridList.push(item.potentialCustomerId);
                    })
                }
                if (params.notificationMode_sms) {
                    params.notificationMode = "sms";
                }
                if (params.notificationMode_wx) {
                    params.notificationMode = "wx";
                }
                if (params.notificationMode_sms && params.notificationMode_wx) {
                    params.notificationMode = "all";
                }
                delete params.studentList;
                delete params.potialList;
                delete params.classList;
                delete params.notificationMode_sms;
                delete params.notificationMode_wx;
                $.hello({
                    url: CONFIG.URL + "/api/oa/questionnaire/sendQuestionnaire",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == 200) {
                            getSurveyList(start);
                            layer.msg('问卷发送成功');
                            $scope.closePopup();
                        }
                    }
                });
            };
            //数据详情切换按钮
            $scope.popNav = [{
                name: '数据分析',
                tab: 1
            }, {
                name: '查看答卷',
                tab: 2
            }];
            $scope.popNavSelected = 1;
            //切换问卷详情tap
            $scope.changePopNav = function(val) {
                    $scope.popNavSelected = val;
                    switch (val) {
                        case 1: //数据分析
                            $scope.getquestionnaireDetail($scope.questionnaireId);
                            break;
                        case 2: //查看问卷
                            pagerRendercheck = false;
                            $scope.getlistRespondents(0);
                            break;
                    }
                }
                //查看答卷
            $scope.getlistRespondents = function(start_) {
                start1 = start_ == 0 ? "0" : start_;
                var params = {
                    start: start1,
                    count: s_eachPage,
                    orderTyp: orderType,
                    orderName: 'rps.create_time',
                    questionnaireId: $scope.questionnaireDetail.questionnaireId,
                    parentsReaded: $scope.parentsReaded,
                    viewStatus: $scope.viewStatus,
                    searchType: "appSearchName",
                    searchName: $scope.searchName
                };
                $.hello({
                    url: CONFIG.URL + '/api/oa/questionnaire/listRespondents',
                    type: "get",
                    data: params,
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.listRespondents = res.context.items;
                            $scope.object = res.context.object;
                            renderPager_check(res.context.totalNum);
                        }
                    }
                })
            };
            //选择题库问题
            $scope.choosedQues = function(n, e) {
                var event = e || window.event;
                if (event.target.nodeName == "SPAN") return;
                if ($scope.newChoosed_obj[n.questionId]) {
                    delete $scope.newChoosed_obj[n.questionId];
                    angular.forEach($scope.newChoosed, function(item, index) {
                        if (item.questionId == n.questionId) {
                            $scope.newChoosed.splice(index, 1);
                        }
                    })
                } else {
                    n.userDefined = 0;
                    $scope.newChoosed_obj[n.questionId] = n.questionId;
                    $scope.newChoosed.push(n)
                }
            };
            //确认所选题库题目
            $scope.getQuestionList = function() {
                if ($scope.newChoosed.length !== 0) {
                    var arr = [];
                    //保证题目顺序
                    angular.forEach($scope.QuestionList, function(item) {
                        if (!item.questionId) { //自定义
                            arr.push(item)
                        } else { //题库
                            angular.forEach($scope.newChoosed, function(cell) {
                                if (cell.questionId == item.questionId) {
                                    arr.push(item)
                                }
                            })
                        }
                    })
                    angular.forEach($scope.newChoosed, function(cell) {
                        var isexited = false;
                        angular.forEach($scope.QuestionList, function(item) {
                            if (cell.questionId == item.questionId && item.questionId) {
                                isexited = true
                            }
                        })
                        if (!isexited) {
                            arr.push(cell)
                        }
                    })
                    $scope.QuestionList = arr;
                    $scope.QuestionBank_choosed_obj = angular.copy($scope.newChoosed_obj);
                    $scope.QuestionBank_choosed = angular.copy($scope.newChoosed);
                    $scope.closePopup();
                } else {
                    layer.msg("请选择问题")
                }
            };

            //封面图裁切选择
            $scope.add_organInfo = function(type, d) {
                switch (type) {
                    case 'frontImageUrl': //添加首页图片
                        $timeout(function() {
                            szpUtil.util_addImg(true, function(data) {
                                $scope.submitQuesdata.frontImageUrl = data;
                                $scope.$apply();
                            }, { options: { aspectRatio: 1380 / 776 }, type: 'image/gif, image/jpeg, image/png' });
                        });
                        break;
                    case 'behindImageUrl': //添加首页图片
                        $timeout(function() {
                            szpUtil.util_addImg(true, function(data) {
                                $scope.submitQuesdata.behindImageUrl = data;
                                $scope.$apply();
                            }, { options: { aspectRatio: 1 }, type: 'image/gif, image/jpeg, image/png' });
                        });
                        break;
                }
            }
            $scope.imgover = function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.shop_img').find('.shop_img_msk').show();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').show();
                }
            };
            $scope.imgout = function(evt, type) {
                switch (type) {
                    case 'change':
                        $(evt.target).closest('.shop_img').find('.shop_img_msk').hide();
                        break;
                    case 'delete':
                        evt.stopPropagation();
                        $(evt.target).find('var').hide();
                }
            };

            $scope.moveUpDown = function(d, index, type, evt) {
                    var d_;
                    if ($(evt.target).attr('btnType') == 'y') {
                        if (type == 1) {
                            d_ = d[index];
                            d[index] = d[index - 1];
                            d[index - 1] = d_;
                        } else {
                            d_ = d[index];
                            d[index] = d[index + 1];
                            d[index + 1] = d_;
                        }
                    }
                }
                //删除所选题库题目
            $scope.del = function(index, n) {
                $scope.QuestionList.splice(index, 1);
                delete $scope.QuestionBank_choosed_obj[n.questionId];
                angular.forEach($scope.QuestionBank_choosed, function(item, index) {
                    if (item.questionId == n.questionId) {
                        $scope.QuestionBank_choosed.splice(index, 1);
                    }
                })
            };

            //创建、修改问卷
            $scope.createQues = function(flag) {
                var quesData = [];
                for (var i = 0; i < $scope.QuestionList.length; i++) {
                    var item = $scope.QuestionList[i];
                    var Item = {};
                    if (item.questionId) {
                        Item.questionId = item.questionId;
                    }
                    if (item.questionDefaultValue) {
                        Item.questionDefaultValue = item.questionDefaultValue;
                    }
                    if (item.userDefined == 1) {
                        Item.userDefined = item.userDefined;
                    }
                    if (!item.questionName) {
                        return layer.msg("第" + (i + 1) + "题题目不能为空")
                        break;
                    }
                    Item.questionName = item.questionName;
                    Item.questionType = item.questionType;
                    Item.questionNotNull = item.questionNotNull ? 1 : 0;

                    if (item.questionType != 1) {
                        Item.questionnaireAnserList = [];
                        for (var j = 0; j < item.questionAnserList.length; j++) {
                            var ceil = item.questionAnserList[j];
                            if (!ceil.anser) {
                                return layer.msg("第" + (i + 1) + "题答案" + (j + 1) + "不能为空")
                                break;
                            }
                            if (ceil.questionAnserId) {
                                if (ceil.anser == '其他') {
                                    Item.questionnaireAnserList.push({
                                        questionAnserId: ceil.questionAnserId,
                                        anser: ceil.anser,
                                        anserFillIn: item.anserFillIn ? 1 : 0
                                    })
                                } else {
                                    Item.questionnaireAnserList.push({
                                        questionAnserId: ceil.questionAnserId,
                                        anser: ceil.anser
                                    })
                                }
                            } else {
                                if (ceil.anser == '其他') {
                                    Item.questionnaireAnserList.push({
                                        anser: ceil.anser,
                                        anserFillIn: item.anserFillIn ? 1 : 0
                                    })
                                } else {
                                    Item.questionnaireAnserList.push({
                                        anser: ceil.anser
                                    })
                                }

                            }
                        }
                    }
                    quesData.push(Item);
                }
                $scope.submitQuesdata.questionnaireContentList = quesData;
                var params = angular.copy($scope.submitQuesdata);
                if (params.frontImageUrl) {
                    params.frontImageUrl = params.frontImageUrl.split('.com/')[1]
                }
                if (params.behindImageUrl) {
                    params.behindImageUrl = params.behindImageUrl.split('.com/')[1]
                }
                var URL = $scope.iseditSurvey ? '/api/oa/questionnaire/modifyQuestionnaire' : '/api/oa/questionnaire/addQuestionnaire';
                console.log(params)
                if (flag) {
                    $.hello({
                        url: CONFIG.URL + '/api/oa/questionnaire/previewQuestionnaire',
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == '200') {
                                $scope.makeQrcode(shareHref_ + '/h5/tq/index.html?key=' + res.context)
                            }
                        }
                    })
                } else {
                    $.hello({
                        url: CONFIG.URL + URL,
                        type: "post",
                        data: JSON.stringify(params),
                        success: function(res) {
                            if (res.status == '200') {
                                pagerRender = false;
                                getSurveyList(0); //获取列表
                                $scope.closePopup();
                            }
                        }
                    })
                }


            };
            $scope.operationList = operationList; //列表操作
            //搜索类型
            $scope.kindSearchData = {
                'header': '问卷名称',
            };
            $scope.kindSearchData_ = {
                'header': '姓名、昵称',
            };
            $scope.selectInfoNameId = 'header';
            $scope.SearchData = SearchData; //搜索
            $scope.Enterkeyup = SearchData; //搜索
            $scope.nameListThead = [
                { 'name': '问卷名称', 'width': '20%' },
                { 'name': '备注', 'width': '20%' },
                { 'name': '创建时间', 'width': '20%', 'issort': true, 'sort': 'desc' },
                { 'name': '发送份数', 'width': '10%' },
                { 'name': '状态', 'width': '10%', 'align': "center" },
                { 'name': '操作', 'width': '20%', 'align': 'center' },
            ];
            $scope.quesTypes = [
                { 'name': '全部' },
                { 'name': '基本信息', 'id': 1 },
                { 'name': '市场调研', 'id': 2 },
                { 'name': '家庭调研', 'id': 3 },
                { 'name': '教学反馈', 'id': 4 },
            ];
            //获取题库题目
            $scope.getlistQuestionBank = function(id) {
                var data = id ? { questionCategory: id } : {};
                $scope.QuestionBank_type = id;
                $.hello({
                    url: CONFIG.URL + '/api/oa/questionnaire/listQuestionBank',
                    type: "get",
                    data: data,
                    success: function(res) {
                        if (res.status == '200') {
                            console.log(res);
                            $scope.listQuestionBank = res.context;
                        }
                    }
                })
            };
            $scope.sel_screen = sel_screen; //列表筛选条件
            //关闭弹窗
            $scope.closePopup = function(flag) {
                if (flag) { //创建编辑需判断
                    compareSurvey();
                } else {
                    layer.close(dialog);
                }
            };
            if ($scope.$stateParams.screenValue.name=="globalsearch") {
                if ($scope.$stateParams.screenValue.pop && $scope.$stateParams.screenValue.pop == "新建问卷") {
                    setTimeout(function () {
                        $scope.openCreateSuevey();
                    })
                }
            }
            getSurveyList(0);
        }

        //新建编辑问卷 数据对比
        function compareSurvey() {
            if ($scope.iseditSurvey) { //编辑对比数据
                if (JSON.stringify($scope.submitQuesdata) != JSON.stringify($scope.submitQuesdataCopy) || $scope.QuestionList.toString() != $scope.QuestionListCopy.toString()) {
                    confirm = layer.confirm('您的问卷已修改，是否放弃本次修改？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        layer.close(confirm);
                        layer.close(dialog);
                    }, function() {
                        layer.close(confirm);
                    });
                } else {
                    layer.close(dialog);
                }
            } else {
                var count = 0;
                for (var i in $scope.submitQuesdata) {
                    if ($scope.submitQuesdata[i]) count++
                }
                if ($scope.QuestionList.length !== 0 || count > 1) {
                    confirm = layer.confirm('您的问卷已填写，是否放弃本次填写？', {
                        title: "确认信息",
                        skin: 'newlayerui layeruiCenter',
                        closeBtn: 1,
                        offset: '30px',
                        move: false,
                        area: '560px',
                        btn: ['是', '否'] //按钮
                    }, function() {
                        layer.close(confirm);
                        layer.close(dialog);
                    }, function() {
                        layer.close(confirm);
                    });
                } else {
                    layer.close(dialog);
                }
            }
        }

        //列表筛选条件
        function sel_screen(type, evt) {
            switch (type) {
                case 1:
                    $scope.searchStatus = evt.target.checked ? 1 : undefined;
                    break;
                case 2:
                    $scope.searchStatus = evt.target.checked ? 0 : undefined;
                    break;
                case 3:
                    $scope.parentsReaded = evt.target.checked ? 1 : undefined;
                    break;
                case 4:
                    $scope.parentsReaded = evt.target.checked ? 0 : undefined;
                    break;
                case 5:
                    $scope.viewStatus = evt.target.checked ? 1 : undefined;
                    break;
                case 6:
                    $scope.viewStatus = evt.target.checked ? 0 : undefined;
                    break;
            }
            if (type > 2) {
                pagerRendercheck = false;
                $scope.getlistRespondents(0);
            } else {
                pagerRender = false;
                getSurveyList(0);
            }

        }

        //搜索
        function SearchData(data, i) {
            switch (i) {
                case 1:
                    //问卷首页 搜索
                    surveyName = data.value;
                    pagerRender = false;
                    getSurveyList(0); //获取列表
                    break;
                case 2:
                    //查看问卷列表 搜索
                    $scope.searchName = data.value;
                    pagerRendercheck = false;
                    $scope.getlistRespondents(0); //获取列表
                    break;
                case 3:
                    //问卷模板搜索
                    $scope.searchName = data.value;
                    pagerRendercheck = false;
                    $scope.getlistRespondents(0); //获取列表
                    break;
            }

        }

        //切换查看状态
        $scope.modifyViewStatus = function(x) {
            var params = {
                respondentsId: x.respondentsId,
                viewStatus: x.viewStatus == 1 ? 0 : 1
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/questionnaire/modifyViewStatus",
                type: "post",
                data: JSON.stringify(params),
                success: function(res) {
                    if (res.status == '200') {
                        $scope.getlistRespondents(start1);
                    }
                }
            });
        }

        //答卷导出 && 某个问题回答导出
        $scope.openleadSuevey = function(id, id1, id3) {
            if (id) {
                var params = {
                    questionnaireAnserId: id1,
                    questionnaireContentId: id,
                    questionnaireId: id3
                };
                window.open(CONFIG.URL + '/api/oa/statistics/consultantQuestionnaireListText?' + $.param(params));
            } else {
                var params = {
                    questionnaireId: $scope.questionnaireDetail.questionnaireId,
                    viewStatus: $scope.viewStatus,
                    searchType: "appSearchName",
                    searchName: $scope.searchName
                };
                window.open(CONFIG.URL + '/api/oa/statistics/consultantQuestionnaireList?' + $.param(params));
            }

        }

        //删除答卷
        $scope.delSurvey = function(x) {
            var idDel = layer.confirm('答卷删除后无法还原，确认删除？', {
                title: "确认信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 1,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            }, function() {
                var params = {
                    respondentsId: x.respondentsId
                }
                $.hello({
                    url: CONFIG.URL + "/api/oa/questionnaire/deleteRespondents",
                    type: "post",
                    data: JSON.stringify(params),
                    success: function(res) {
                        if (res.status == '200') {
                            $scope.getlistRespondents(start1);
                        }
                    }
                });
                layer.close(idDel);
            }, function() {
                layer.close(idDel);
            });
        }

        //列表操作
        function operationList(d, type, ind) {
            switch (type) {
                case 'openQuesDetail': //问卷详情
                    $scope.popNavSelected = 1; //默认选中数据分析
                    $scope.questionnaireId = d.questionnaireId;
                    $scope.getquestionnaireDetail($scope.questionnaireId);
                    openPopByDiv('问卷详情' + '<span class="color_nameState">(' + d.questionnaireName + ')</span>', '.quesdetail-popup', '960px');
                    break;
                case 'send': //发送问卷
                    $scope.sendSurveyData = {
                        type: 'potentialCustomer',
                        scope: 'all',
                        classList: [],
                        studentList: [],
                        potialList: [],
                        questionnaireId: d.questionnaireId
                    };
                    openPopByDiv('发送问卷' + '<span class="color_nameState">(' + d.questionnaireName + ')</span>', '.sendsurvey-popup', '760px');
                    break;
                case 'survey_on': //问卷启用禁用
                    var params = {
                        'questionnaireId': d.questionnaireId,
                        'status': d.status == 0 ? 1 : 0
                    };
                    if (d.status == 0) {
                        $.hello({
                            url: CONFIG.URL + "/api/oa/questionnaire/enableOrdisable",
                            type: "post",
                            data: JSON.stringify(params),
                            success: function(res) {
                                if (res.status == 200) {
                                    getSurveyList(start);
                                    layer.msg('已启用');
                                    layer.close(isEdit);
                                }
                            }
                        });
                    } else {
                        var isEdit = layer.confirm('禁用后学员无法提交问卷，是否停止收集问卷?', {
                            title: "确认信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['是', '否'] //按钮
                        }, function() {
                            var params = {
                                'questionnaireId': d.questionnaireId,
                                'status': d.status == 0 ? 1 : 0
                            };
                            $.hello({
                                url: CONFIG.URL + "/api/oa/questionnaire/enableOrdisable",
                                type: "post",
                                data: JSON.stringify(params),
                                success: function(res) {
                                    if (res.status == 200) {
                                        getSurveyList(start);
                                        layer.msg('已禁用');
                                    }
                                }
                            });
                            layer.close(isEdit);
                        }, function() {
                            layer.close(isEdit);
                        });
                    }

                    break;
                case 'edit': //问卷编辑
                    if (d.recyclingQuantity != 0) {
                        layer.msg("该问卷已有学员作答，不可编辑问卷。")
                    } else {
                        $scope.iseditSurvey = true;
                        $.hello({
                            url: CONFIG.URL + "/api/oa/questionnaire/questionnaireDetail",
                            type: "get",
                            data: { questionnaireId: d.questionnaireId },
                            success: function(res) {
                                if (res.status == 200) {
                                    var data = res.context;
                                    $scope.submitQuesdata = {
                                        questionnaireId: data.questionnaireId,
                                        questionnaireName: data.questionnaireName,
                                        questionnaireDesc: data.questionnaireDesc ? data.questionnaireDesc : '',
                                        frontImageUrl: data.frontImageUrl ? data.frontImageUrl : '',
                                        behindImageUrl: data.behindImageUrl,
                                        submitMes: data.submitMes ? data.submitMes : '',
                                        remark: data.remark ? data.remark : '',
                                    };
                                    var questionnaireContentList = [];
                                    angular.forEach(data.questionnaireContentList, function(item) {
                                        var obj = {};
                                        obj.hasOther = false;
                                        obj.questionId = item.questionId;
                                        obj.userDefined = item.userDefined;
                                        $scope.QuestionBank_choosed_obj[item.questionId] = item.questionId;
                                        obj.questionName = item.questionName;
                                        if (item.questionDefaultValue) { //默认提示文案
                                            obj.questionDefaultValue = item.questionDefaultValue;
                                        }
                                        obj.questionType = item.questionType;
                                        obj.questionNotNull = item.questionNotNull ? true : false;
                                        if (item.questionnaireAnserList != 1) { //非填空题
                                            obj.questionAnserList = [];
                                            angular.forEach(item.questionnaireAnserList, function(ceil) {
                                                var obj_ans = {
                                                    questionAnserId: ceil.questionAnserId,
                                                    anser: ceil.anser
                                                };
                                                if (ceil.anser == "其他") {
                                                    obj.hasOther = true;
                                                }
                                                obj_ans.anserFillIn = ceil.anserFillIn == 1 ? true : false;
                                                obj.anserFillIn = ceil.anserFillIn == 1 ? true : false;
                                                obj.questionAnserList.push(obj_ans)
                                            })
                                        }
                                        questionnaireContentList.push(obj);
                                    })
                                    $scope.QuestionBank_choosed = angular.copy(questionnaireContentList);
                                    $scope.QuestionList = angular.copy(questionnaireContentList);
                                    $scope.submitQuesdataCopy = angular.copy($scope.submitQuesdata);
                                    $scope.QuestionListCopy = angular.copy($scope.QuestionList);
                                    openPopByDiv(null, '.survey-popup', '760px');
                                }
                            }
                        });
                    }
                    break;
                case 'delete': //删除问卷
                    if (d.recyclingQuantity != 0) {
                        layer.msg("该问卷已有用户作答，请删除作答问卷后再试。");
                    } else {
                        var isDelete = layer.confirm('问卷删除后无法还原，确认删除？', {
                            title: "确认信息",
                            skin: 'newlayerui layeruiCenter',
                            closeBtn: 1,
                            offset: '30px',
                            move: false,
                            area: '560px',
                            btn: ['确认', '取消'] //按钮
                        }, function() {
                            var params = {
                                questionnaireId: d.questionnaireId
                            };
                            $.hello({
                                url: CONFIG.URL + "/api/oa/questionnaire/delteQuestionnaire",
                                type: "post",
                                data: JSON.stringify(params),
                                success: function(res) {
                                    if (res.status == '200') {
                                        pagerRender = false;
                                        getSurveyList(start);
                                        layer.msg('已删除');
                                    }
                                }
                            });
                            layer.close(isDelete);
                        }, function() {
                            layer.close(isDelete);
                        });
                    }
                    break;
                case 'copy': //复制问卷
                    $scope.iseditSurvey = false;
                    $.hello({
                        url: CONFIG.URL + "/api/oa/questionnaire/questionnaireDetail",
                        type: "get",
                        data: { questionnaireId: d.questionnaireId },
                        success: function(res) {
                            if (res.status == 200) {
                                var data = res.context;
                                $scope.submitQuesdata = {
                                    questionnaireName: data.questionnaireName,
                                    questionnaireDesc: data.questionnaireDesc ? data.questionnaireDesc : '',
                                    frontImageUrl: data.frontImageUrl ? data.frontImageUrl : '',
                                    behindImageUrl: data.behindImageUrl,
                                    submitMes: data.submitMes ? data.submitMes : '',
                                    remark: data.remark ? data.remark : '',
                                };
                                var questionnaireContentList = [];
                                angular.forEach(data.questionnaireContentList, function(item) {
                                    var obj = {};
                                    obj.hasOther = false;
                                    obj.questionId = item.questionId;
                                    obj.userDefined = item.userDefined;
                                    $scope.QuestionBank_choosed_obj[item.questionId] = item.questionId;
                                    obj.questionName = item.questionName;
                                    if (item.questionDefaultValue) { //默认提示文案
                                        obj.questionDefaultValue = item.questionDefaultValue;
                                    }
                                    obj.questionType = item.questionType;
                                    obj.questionNotNull = item.questionNotNull ? true : false;
                                    if (item.questionnaireAnserList != 1) { //非填空题
                                        obj.questionAnserList = [];
                                        angular.forEach(item.questionnaireAnserList, function(ceil) {
                                            var obj_ans = {
                                                questionAnserId: ceil.questionAnserId,
                                                anser: ceil.anser
                                            };
                                            if (ceil.anser == "其他") {
                                                obj.hasOther = true;
                                            }
                                            obj_ans.anserFillIn = ceil.anserFillIn == 1 ? true : false;
                                            obj.anserFillIn = ceil.anserFillIn == 1 ? true : false;
                                            obj.questionAnserList.push(obj_ans)
                                        })
                                    }
                                    questionnaireContentList.push(obj);
                                })
                                $scope.QuestionBank_choosed = angular.copy(questionnaireContentList);
                                $scope.QuestionList = angular.copy(questionnaireContentList);
                                openPopByDiv(null, '.survey-popup', '760px');
                            }
                        }
                    });
                    break;
                case 'open': //点击预览效果图
                    dialog_img = layer.open({
                        type: 1,
                        title: false,
                        skin: 'layerui layer_message_see', //样式类名
                        closeBtn: false, //不显示关闭按钮
                        move: false,
                        resize: false,
                        anim: 0,
                        area: '400px',
                        offset: '30px',
                        shadeClose: false, //开启遮罩关闭
                        content: $('.message_see')
                    });
                    break;
                case 'close': //关闭预览效果图
                    layer.close(dialog_img);
                    break;
            }
        }

        //获取问卷数据详情
        $scope.getquestionnaireDetail = function(id) {
            $.hello({
                url: CONFIG.URL + "/api/oa/questionnaire/questionnaireDetail",
                type: "get",
                data: { questionnaireId: id },
                success: function(res) {
                    if (res.status == 200) {
                        $scope.questionnaireDetail = res.context;
                    }
                }
            });
        };

        //点击重置
        $scope.onReset = function(flag) {
            $scope.kindSearchOnreset(); //调取app重置方法
            for (var i in $scope.screen_goReset) {
                $scope.screen_goReset[i]();
            }
            if (flag) {
                surveyName = undefined;
                pagerRender = false;
                $scope.searchStatus = undefined;
                getSurveyList(0);
            } else {
                $scope.searchType = undefined;
                $scope.searchName = undefined;
                $scope.parentsReaded = undefined;
                $scope.viewStatus = undefined;
                pagerRendercheck = false;
                $scope.getlistRespondents(0);
            }
        };

        //获取问卷列表
        function getSurveyList(start_) {
            start = start_ == 0 ? "0" : start_;
            var params = {
                'start': start_,
                'count': eachPage,
                'orderTyp': orderType1,
                'orderName': 'qne.create_time',
                'questionnaireName': surveyName,
                "status": $scope.searchStatus
            };
            for (var i in params) {
                if (params[i] === '' || params[i] == undefined) {
                    delete params[i];
                }
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/questionnaire/listQuestionnaire",
                type: "get",
                data: params,
                success: function(res) {
                    if (res.status == '200') {
                        $scope.surveyList = res.context.items;
                        renderPager_mall(res.context.totalNum);
                    }
                }
            })
        }

        //分页
        function renderPager_mall(total) { //父页面分页
            if (pagerRender)
                return;
            pagerRender = true;
            $M_box3.pagination({
                current: parseInt(start / eachPage) + 1,
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
                    if (api.getCurrentEach() != eachPage) { //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem("surveyPage", eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getSurveyList(start); //回掉
                }
            });
        }

        function renderPager_check(total) { //子页面分页
            if (pagerRendercheck)
                return;
            pagerRendercheck = true;
            $M_box2.pagination({
                current: parseInt(start1 / s_eachPage) + 1,
                totalData: total || 0, // 数据总条数
                showData: s_eachPage, // 显示几条数据
                jump: true,
                coping: true,
                count: 2, // 当前页前后分页个数
                homePage: '首页',
                endPage: '末页',
                prevContent: '上页',
                nextContent: '下页',
                callback: function(api) {
                    if (api.getCurrentEach() != s_eachPage) { //本地存储记下每页多少条
                        s_eachPage = api.getCurrentEach();
                        localStorage.setItem("surveyPage1", s_eachPage);
                    }
                    start1 = (api.getCurrent() - 1) * s_eachPage; // 分页从0开始
                    $scope.getlistRespondents(start1); //回掉
                }
            });
        }
    }]
});