define(['laydate'], function(laydate) {
    creatPopup({
        el: 'importPop',
        openPopupFn: 'importFile',
        //      closePopupFn: 'closeRollCall',
        htmlUrl: './templates/popup/import_pop.html',
        controllerFn: function($scope, props, SERVICE, $timeout, $state) {
            $scope.props = props;
            var fileVal = ""; //导入名单文件
            init();

            function init() {
                $scope.uploadData = {
                    file_name: "",
                    hasFile: false,
                    uploadText: "选择文件"
                };
                $scope.errorMsg = {};
                $("#upfile").val("");
                switch (props.page) {
                    case "名单":
                        nameInit();
                        break;
                    case "潜客":
                        potientalInit();
                        break;
                    case "学员":
                        studentInit();
                        break;
                    case "班级":
                        classInit();
                        break;
                    case "工资单":
                        payrollInit();
                        break;
                    case "物品":
                        goodsInit();
                        break;
                    case "教室":
                        classroomInit();
                        break;
                    default:
                        break;
                }
                getChannel(); //获取渠道
                $scope.navigation_bar_bgm = 1;
                $scope.confirmNext = confirmNext; //点击进行下一步
                $scope.uploadFile = uploadFile; //重复导入
                $scope.resourceChange = resourceChange; //切换渠道
                $scope.upResourceChange = upResourceChange; //切换二级渠道
                $scope.download_btn = download_btn; //下载导入模板

            }

            function nameInit() {
                gobackStep1();
            }

            function potientalInit() {

            }

            function studentInit() {

            }

            function classInit() {

            }

            function payrollInit() {
                $scope.payroll = {
                    payrollRecordTitle: "",
                    payrollMonth: yznDateFormatYM(new Date()),
                    payrollDate: yznDateFormatYMd(new Date()),
                };
                laydate.render({
                    elem: '#s_payrollMonth',
                    type: 'month',
                    value: yznDateFormatYM(new Date()),
                    btns: ['confirm'],
                    done: function(value) {
                        $scope.payroll.payrollMonth = value;
                    }
                });
                laydate.render({
                    elem: '#s_payrollDate',
                    value: yznDateFormatYMd(new Date()),
                    done: function(value) {
                        $scope.payroll.payrollDate = value;
                    }
                });
            }

            function goodsInit() {

            }

            function classroomInit() {

            }

            function confirmNext(step) {
                switch (step) {
                    case 1:
                        gobackStep1();
                        break;
                    case 2:
                        uploadFile();
                        break;
                    case 3:
                        $scope.navigation_bar_bgm = 3;
                        break;
                    default:
                        break;
                }
            }

            function getChannel() {
                $.hello({
                    url: CONFIG.URL + '/api/oa/setting/channelType/list',
                    type: 'get',
                    data: {type:1,pageType:0,channelNeed:1},
                    success: function(data) {
                        if (data.status == "200") {
                            $scope.channelTypelist = data.context;
                        }
                    }
                });
            }

            function resourceChange(x) {
                $scope.resourceName = "";
                $scope.resourceName2 = "";
                if (x == "") {
                    $scope.channelType = "";
                    $scope.hasSecondSelect = false;
                } else {
                    var data = JSON.parse(x);
                    $scope.channel_Id = "";
                    $scope.resourceName = data.channelTypeName;
                    if (data.channelList.length > 0) {
                        $scope.hasSecondSelect = true;
                        $scope.channelList = data.channelList;
                    } else {
                        $scope.hasSecondSelect = false;
                    }
                }
            }

            function upResourceChange(x) {
                if (x == "") {
                    $scope.channel_Id = "";
                    $scope.resourceName2 = "";
                } else {
                    var data = JSON.parse(x);
                    $scope.resourceName2 = data.channelName;
                }
            }
            //上传文件
            $("#upfile").on('change', function(e) {
                if (!e.target.files[0]) return;
                var fileSize = e.target.files[0].size / 1024;
                if (fileSize > 1024) {
                    layer.msg("导入文件不能大于1M,请检查并修改导入文件后重新导入", {
                        icon: 5
                    });
                    return;
                }
                if ($(e.target).val()) {
                    $scope.uploadData.uploadText = "重新选择";
                    $scope.uploadData.hasFile = true;
                    fileVal = $(e.target).val().replace(/\\/g, "/");
                    $scope.uploadData.file_name = fileVal.substring(fileVal.lastIndexOf("/") + 1, fileVal.length);
                }
                $scope.$apply();
            });

            function uploadFile(isDeleteRpt) {
                if (!$scope.uploadData.file_name) {
                    return layer.msg("请选择文件");
                }
                if (props.page == "工资单" && !($scope.payroll.payrollRecordTitle || $scope.payroll.payrollMonth || $scope.payroll.payrollDate)) {
                    return layer.msg("标题/发薪月份/结算日期均为必填项");
                }
                var URL, param;
                switch (props.page) {
                    case "名单":
                        var param = {
                            "channelTypeId": $scope.channelType ? JSON.parse($scope.channelType).id : undefined,
                            "uploadType": "0"
                        };
                        if (isDeleteRpt) {
                            param['testStatus'] = "1";
                        } else {
                            param['testStatus'] = "0";
                        }
                        if (!($scope.channel_Id == "" || $scope.channel_Id == undefined)) {
                            param["channelId"] = JSON.parse($scope.channel_Id).id;
                        }
                        URL = '/api/oa/upFile/RosterUpload';
                        break;
                    case "潜客":
                        URL = "/api/oa/upFile/PotentialCustomerUpload";
                        param = undefined;
                        break;
                    case "学员":
                        URL = "/api/oa/upFile/StudentUpload";
                        param = undefined;
                        break;
                    case "班级":
                        URL = "/api/oa/upFile/ClassUpload";
                        param = undefined;
                        break;
                    case "工资单":
                        URL = "/api/oa/upFile/payrollRecordUpload";
                        param = {
                            payrollRecordTitle: $scope.payroll.payrollRecordTitle,
                            payrollMonth: $scope.payroll.payrollMonth + "-01",
                            payrollDate: $scope.payroll.payrollDate,
                        };
                        break;
                    case "物品":
                        URL = "/api/oa/upFile/goodsUpload";
                        param = undefined;
                        break;
                    case "教室":
                        URL = "/api/oa/upFile/ClassRoomUpload";
                        param = undefined;
                        break;
                    case "推单":
                        URL = "/api/oa/upFile/ClassRoomUpload";
                        param = undefined;
                        break;
                    case "收支":
                        URL = "/api/oa/upFile/ShopCostUpload";
                        param = undefined;
                        break;
                    default:
                        break;
                }
                layer.load(0);
                $('#form_load').ajaxSubmit({
                    url: CONFIG.URL + URL,
                    dataType: 'json',
                    data: param,
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('token', localStorage.getItem('oa_token'));
                    },
                    success: resutl_msg,
                    error: error_msg
                });

                function resutl_msg(msg) {
                    $scope.errorCode = msg.status;
                    $scope.errorMsg.isFormat = false;
                    if (msg.status == "200") {
                        $scope.navigation_bar_bgm = 3;
                        $scope.successData = msg.context;

                        switch (props.page) {
                            case "名单":
                                $scope.$emit("nameChange");
                                break;
                            case "潜客":
                                $scope.$emit("potentialChange", true);
                                break;
                            case "学员":
                                $scope.$emit("studentChange", true);
                                break;
                            case "班级":
                                $scope.$emit("classListChange", true);
                                break;
                            case "工资单":
                                $scope.$emit("reloadPayroll");
                                $scope.successDataMsg = msg.message;
                                break;
                            case "物品":
                                $scope.$emit("reloadGoods");
                                $scope.successDataMsg = msg.message;
                                break;
                            case "教室":
                                $scope.$emit("reloadClassroom");
                                $scope.successDataMsg = msg.message;
                                break;
                            case "推单":
                                $scope.$emit("reloadOrderlist");
                                $scope.successDataMsg = msg.message;
                                break;
                            case "收支":
                                $scope.$emit("reloadexpenselist");
                                $scope.successDataMsg = msg.message;
                                break;
                            default:
                                break;
                        }
                    } else {
                        $scope.navigation_bar_bgm = 2;
                        $scope.errorMsg.msg = msg.message;
                        if (props.page != "工资单") {
                            if (msg.status == "20024") {
                                $scope.errorMsg.isFormat = true;
                            } else if (msg.status == "20025") {
                                $scope.errorMsg.isFormat = false;
                            }
                        } else {
                            $scope.errorMsg.isFormat = true;
                        }
                    }
                    //去重导入的情况
                    if (msg.status != 20026) {
                        $("#upfile").val("");
                        $scope.uploadData.file_name = "";
                    }

                    layer.closeAll('loading');
                    $scope.$apply();
                }

                function error_msg(msg) {
                    gobackStep1();
                    layer.msg("导入失败", {
                        icon: 5
                    });
                    layer.closeAll('loading');
                    $scope.$apply();
                }
            }

            function gobackStep1() {
                $scope.navigation_bar_bgm = 1;
                $("#upfile").val("");
                $scope.uploadData.file_name = "";
                if (props.page == '名单') {
                    $scope.channelType = "";
                    $scope.hasSecondSelect = false;
                    $scope.uploadData.hasFile = false;
                    $scope.channel_Id = "";
                    $scope.channelList = [];
                }
            }

            function download_btn() {
                switch (props.page) {
                    case "名单":
                        window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟名单导入模版2.5.1.xlsx";
                        break;
                    case "潜客":
                        window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟潜客导入模版2.5.9.xlsx";
                        break;
                    case "学员":
                        window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟学员导入模版3.3.5.xlsx";
                        break;
                    case "班级":
                        window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟班级导入模版3.2.7.xlsx";
                        break;
                    case "工资单":
                        var token = localStorage.getItem('oa_token');
                        window.open(CONFIG.URL + "/api/oa/statistics/consultantPayrollHead?&&token=" + token);
                        break;
                    case "物品":
                        window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟库存物品导入模板3.6.xlsx";
                        break;
                    case "教室":
                        window.location.href = IMGCONFIG.PREFIX_URL + "易知鸟教室导入模板1.5.xlsx";
                        break;
                    case "推单":
                        window.location.href = IMGCONFIG.PREFIX_URL + "订单推送导入模版1.0.0.xlsx";
                        break;
                    case "收支":
                        window.location.href = IMGCONFIG.PREFIX_URL + "费用收支导入模板.xlsx";
                        break;
                    default:
                        break;
                }

            }
        }
    });
});