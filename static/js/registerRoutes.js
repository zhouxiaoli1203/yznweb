define(["angularAMD"], function(angularAMD) {
    'use strict';
    // routes 缓存20210228
    var registerRoutes = ['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        // default，去掉默认路由避免没有工作台权限账号自动登出
        // $urlRouterProvider.when("", "/workbench");
        // $urlRouterProvider.when("/", "/workbench");
        $urlRouterProvider.otherwise('');
        $stateProvider
            .state("globalSearch", angularAMD.route({
                url: '/globalSearch',
                controllerUrl: 'static/js/controller/globalSearch.js',
                templateUrl: 'templates/globalSearch.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("workbench", angularAMD.route({
                url: '/workbench',
                controllerUrl: 'static/js/controller/workbench.js',
                templateUrl: 'templates/workbench/workbench.html',
            }))
            .state("center", angularAMD.route({
                url: '/center',
                controllerUrl: 'static/js/controller/basic/center.js',
                templateUrl: 'templates/Basic/center.html',
            }))
            .state("notice", angularAMD.route({
                url: '/notice',
                controllerUrl: 'static/js/controller/basic/notice.js',
                templateUrl: 'templates/Basic/notice.html',
            }))
            .state("dataView", angularAMD.route({
                url: '/dataView',
                controllerUrl: 'static/js/controller/organ/new_dataView.js',
                templateUrl: 'templates/organ/new_dataView.html',
            }))
            .state("showofficial", angularAMD.route({
                url: '/showofficial',
                controllerUrl: 'static/js/controller/show_official.js',
                templateUrl: 'templates/show/show_official.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("showactivity", angularAMD.route({
                url: '/showactivity',
                controllerUrl: 'static/js/controller/show_activity.js',
                templateUrl: 'templates/show/show_activity.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("myshow", angularAMD.route({
                url: '/myshow',
                controllerUrl: 'static/js/controller/show_activity_new.js',
                templateUrl: 'templates/show/show_activity_new.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("showcourse", angularAMD.route({
                url: '/showcourse',
                controllerUrl: 'static/js/controller/show_course.js',
                templateUrl: 'templates/show/show_course.html',
            }))
            .state("goods_management", angularAMD.route({
                url: '/goods_management',
                controllerUrl: 'static/js/controller/shopping_mall/goods_management.js',
                templateUrl: 'templates/shopping_mall/goods_management.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("coupon", angularAMD.route({
                url: '/coupon',
                controllerUrl: 'static/js/controller/shopping_mall/coupon.js',
                templateUrl: 'templates/shopping_mall/coupon.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("survey", angularAMD.route({
                url: '/survey',
                controllerUrl: 'static/js/controller/shopping_mall/survey.js',
                templateUrl: 'templates/shopping_mall/survey.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("referral", angularAMD.route({
                url: '/referral',
                controllerUrl: 'static/js/controller/shopping_mall/referral.js',
                templateUrl: 'templates/shopping_mall/referral.html',
            }))
            .state("referral_record", angularAMD.route({
                url: '/referral_record',
                controllerUrl: 'static/js/controller/shopping_mall/referral_record.js',
                templateUrl: 'templates/shopping_mall/referral_record.html',
            }))
            .state("time", angularAMD.route({
                url: '/time',
                controllerUrl: 'static/js/controller/basic/timeCtrl.js',
                templateUrl: 'templates/Basic/time.html',
                params: {
                    'pageType': null
                }
            }))
            .state("classroom", angularAMD.route({
                url: '/classroom',
                controllerUrl: 'static/js/controller/basic/classroomCtrl.js',
                templateUrl: 'templates/Basic/classroom.html',
            }))
            .state("functionMange", angularAMD.route({
                url: '/functionMange',
                controllerUrl: 'static/js/controller/basic/functionMange.js',
                templateUrl: 'templates/Basic/functionMange.html',
            }))
            .state("share", angularAMD.route({
                url: '/share',
                controllerUrl: 'static/js/controller/basic/shareCtrl.js',
                templateUrl: 'templates/Basic/share.html',
            }))
            .state("nearbySchool", angularAMD.route({
                url: '/nearbySchool',
                controllerUrl: 'static/js/controller/basic/nearbySchool.js',
                templateUrl: 'templates/Basic/nearbySchool.html',
            }))
            .state("visiting", angularAMD.route({
                url: '/visiting',
                controllerUrl: 'static/js/controller/Sales/visitingCtrl.js',
                templateUrl: 'templates/Sales/visiting.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'type': null
                },
            }))
            .state("nameList", angularAMD.route({
                url: '/nameList',
                controllerUrl: 'static/js/controller/Sales/nameList.js',
                templateUrl: 'templates/Sales/nameList.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("potial_customer", angularAMD.route({
                url: '/potial_customer',
                controllerUrl: 'static/js/controller/Sales/potial_customer.js',
                templateUrl: 'templates/Sales/potial_customer.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("potial_customer/all", angularAMD.route({
                url: '/potial_customer/all',
                controllerUrl: 'static/js/controller/Sales/potial_customer_all.js',
                templateUrl: 'templates/Sales/potial_customer_all.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("listenRecord", angularAMD.route({
                url: '/listenRecord',
                controllerUrl: 'static/js/controller/Sales/listenRecord.js',
                templateUrl: 'templates/Sales/listenRecord.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("listenRecord/list", angularAMD.route({
                url: '/listenRecord/list',
                controllerUrl: 'static/js/controller/Sales/listenlist.js',
                templateUrl: 'templates/Sales/listenlist.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("send_order", angularAMD.route({
                url: '/send_order',
                controllerUrl: 'static/js/controller/Sales/send_order.js',
                templateUrl: 'templates/Sales/send_order.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("renew_warning", angularAMD.route({
                url: '/renew_warning',
                controllerUrl: 'static/js/controller/Sales/renew_warning.js',
                templateUrl: 'templates/Sales/renew_warning.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            // .state("channel", angularAMD.route({
            //     url: '/channel',
            //     controllerUrl: 'static/js/controller/Sales/channelCtrl.js',
            //     templateUrl: 'templates/Sales/channel.html',
            // }))
            .state("edu_student", angularAMD.route({
                url: '/edu_student',
                controllerUrl: 'static/js/controller/edu_student.js',
                templateUrl: 'templates/Educational/edu_student.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenTab': null,
                    'screenValueId': null,
                    'screenValueName': null,
                    'screenValueVal': null
                },
            }))
            .state("edu_student/signUp_detail", angularAMD.route({
                url: '/edu_student/signUp_detail',
                controllerUrl: 'static/js/controller/edu_signUp_detail.js',
                templateUrl: 'templates/Educational/edu_signUp_detail.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenTab': null,
                    'screenValueId': null,
                    'screenValueName': null,
                    'screenValueVal': null
                },
            }))
            .state("edu_class", angularAMD.route({
                url: '/edu_class',
                controllerUrl: 'static/js/controller/edu_class.js',
                templateUrl: 'templates/Educational/edu_class.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null
                },
            }))
            .state("edu_schedule", angularAMD.route({
                url: '/edu_schedule/list',
                controllerUrl: 'static/js/controller/edu_schedule.js',
                templateUrl: 'templates/Educational/edu_schedule.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_schedule/chart", angularAMD.route({
                url: '/edu_schedule/chart',
                controllerUrl: 'static/js/controller/edu_schedule_chart.js',
                templateUrl: 'templates/Educational/edu_schedule_chart.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_myClassAffair", angularAMD.route({
                url: '/edu_myClassAffair',
                controllerUrl: 'static/js/controller/edu_mySchedule/edu_myClassAffair.js',
                templateUrl: 'templates/Educational/edu_mySchedule/edu_myClassAffair.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_myIntegralManag", angularAMD.route({
                url: '/edu_myIntegralManag',
                controllerUrl: 'static/js/controller/edu_mySchedule/edu_myIntegralManag.js',
                templateUrl: 'templates/Educational/edu_mySchedule/edu_myIntegralManag.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_myOnlineCourse", angularAMD.route({
                url: '/edu_myOnlineCourse',
                controllerUrl: 'static/js/controller/edu_mySchedule/edu_onlineCourse.js',
                templateUrl: 'templates/Educational/edu_mySchedule/edu_onlineCourse.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_aboutClass", angularAMD.route({
                url: '/edu_aboutClass/warn',
                controllerUrl: 'static/js/controller/edu_aboutClass/edu_aboutClass_warn.js',
                templateUrl: 'templates/Educational/edu_aboutClass/edu_aboutClass_warn.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                },
            }))
            .state("edu_aboutClass/record", angularAMD.route({
                url: '/edu_aboutClass/record',
                controllerUrl: 'static/js/controller/edu_aboutClass/edu_aboutClass_record.js',
                templateUrl: 'templates/Educational/edu_aboutClass/edu_aboutClass_record.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                },
            }))
            .state("edu_classAffair", angularAMD.route({
                url: '/edu_classAffair/record',
                controllerUrl: 'static/js/controller/edu_classAffair/edu_classAffair_record.js',
                templateUrl: 'templates/Educational/edu_classAffair/edu_classAffair_record.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_onlineCourse", angularAMD.route({
                url: '/edu_onlineCourse',
                controllerUrl: 'static/js/controller/edu_onlineCourse.js',
                templateUrl: 'templates/Educational/edu_onlineCourse.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_classAffair/show", angularAMD.route({
                url: '/edu_classAffair/show',
                controllerUrl: 'static/js/controller/edu_classAffair/edu_classAffair_show.js',
                templateUrl: 'templates/Educational/edu_classAffair/edu_classAffair_show.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_classAffair/comment", angularAMD.route({
                url: '/edu_classAffair/comment',
                controllerUrl: 'static/js/controller/edu_classAffair/edu_classAffair_comment.js',
                templateUrl: 'templates/Educational/edu_classAffair/edu_classAffair_comment.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_classAffair/houseWk", angularAMD.route({
                url: '/edu_classAffair/houseWk',
                controllerUrl: 'static/js/controller/edu_classAffair/edu_classAffair_houseWk.js',
                templateUrl: 'templates/Educational/edu_classAffair/edu_classAffair_houseWk.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_classAffair/clock", angularAMD.route({
                url: '/edu_classAffair/clock',
                controllerUrl: 'static/js/controller/edu_classAffair/edu_classAffair_clock.js',
                templateUrl: 'templates/Educational/edu_classAffair/edu_classAffair_clock.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))
            .state("edu_integralManag", angularAMD.route({
                url: '/edu_integralManag',
                controllerUrl: 'static/js/controller/edu_integralManag.js',
                templateUrl: 'templates/Educational/edu_integralManag.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': '',
                    'screenValueName': ''
                },
            }))

        .state("edu_notice", angularAMD.route({
                url: '/edu_notice',
                controllerUrl: 'static/js/controller/edu_notice.js',
                templateUrl: 'templates/Educational/edu_notice.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                    'screenValueName': '',
                    'type': null
                },
            }))
            .state("edu_leave", angularAMD.route({
                url: '/edu_leave/leave',
                controllerUrl: 'static/js/controller/leave/edu_leave.js',
                templateUrl: 'templates/Educational/leave/edu_leave.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                    'screenValueName': '',
                    'type': null
                },
            }))
            .state("edu_leave/makeup", angularAMD.route({
                url: '/edu_leave/makeup',
                controllerUrl: 'static/js/controller/leave/edu_makeup.js',
                templateUrl: 'templates/Educational/leave/edu_makeup.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                    'screenValueName': '',
                    'type': null
                },
            }))
            .state("edu_signIn", angularAMD.route({
                url: '/edu_signIn',
                controllerUrl: 'static/js/controller/edu_signIn.js',
                templateUrl: 'templates/Educational/edu_signIn.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                    'screenValueName': '',
                    'type': null
                },
            }))
            .state("edu_pickUp", angularAMD.route({
                url: '/edu_pickUp',
                controllerUrl: 'static/js/controller/edu_pickUp.js',
                templateUrl: 'templates/Educational/edu_pickUp.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                    'screenValueId': null,
                    'screenValueName': '',
                    'type': null
                },
            }))
            .state("stock", angularAMD.route({
                url: '/stock/list',
                controllerUrl: 'static/js/controller/stock/stock.js',
                templateUrl: 'templates/stock/stock.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("stock/record", angularAMD.route({
                url: '/stock/record',
                controllerUrl: 'static/js/controller/stock/stockRecord.js',
                templateUrl: 'templates/stock/stockRecord.html',
            }))
            .state("post", angularAMD.route({
                url: '/post',
                controllerUrl: 'static/js/controller/post1Ctrl.js',
                templateUrl: 'templates/Staff/post1.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("staff_new", angularAMD.route({
                url: '/staff_new',
                controllerUrl: 'static/js/controller/Staff/staff_new.js',
                templateUrl: 'templates/Staff/staff_new.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("staff_new/leaveRcd", angularAMD.route({
                url: '/staff_new/leaveRcd',
                controllerUrl: 'static/js/controller/Staff/leaveRcd.js',
                templateUrl: 'templates/Staff/leaveRcd.html',
            }))
            .state("staff_new/attendRcd", angularAMD.route({
                url: '/staff_new/attendRcd',
                controllerUrl: 'static/js/controller/Staff/attendRcd.js',
                templateUrl: 'templates/Staff/attendRcd.html',
            }))
            .state("attend", angularAMD.route({
                url: '/attend',
                controllerUrl: 'static/js/controller/Staff/attend.js',
                templateUrl: 'templates/Staff/attend.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("ordermanage", angularAMD.route({
                url: '/ordermanage',
                controllerUrl: 'static/js/controller/ordermanageCtrl.js',
                templateUrl: 'templates/Financial/ordermanage.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("payments", angularAMD.route({
                url: '/payments',
                controllerUrl: 'static/js/controller/paymentsCtrl.js',
                templateUrl: 'templates/Financial/payments.html',
            }))
            .state("paytreasure", angularAMD.route({
                url: '/paytreasure',
                controllerUrl: 'static/js/controller/paytreasureCtrl.js',
                templateUrl: 'templates/Financial/paytreasure.html',
            }))
            .state("expense", angularAMD.route({
                url: '/expense',
                controllerUrl: 'static/js/controller/expenseCtrl.js',
                templateUrl: 'templates/Financial/expense.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("performance", angularAMD.route({
                url: '/performance/list',
                controllerUrl: 'static/js/controller/salary/payroll.js',
                templateUrl: 'templates/salary/payroll.html',
            }))
            .state("performance/setting", angularAMD.route({
                url: '/performance/setting',
                controllerUrl: 'static/js/controller/salary/performance_setting.js',
                templateUrl: 'templates/salary/performance_setting.html',
            }))
            .state("performance/rule", angularAMD.route({
                url: '/performance/rule',
                controllerUrl: 'static/js/controller/salary/performance_rule.js',
                templateUrl: 'templates/salary/performance_rule.html',
                params: {
                    'screenValue': {},
                },
            }))

        .state("edu_course", angularAMD.route({
                url: '/edu_course',
                controllerUrl: 'static/js/controller/edu_course.js',
                templateUrl: 'templates/Educational/edu_course.html',
                params: {
                    'screenValue': {},
                },
            }))
            .state("edu_dataManage", angularAMD.route({
                url: '/edu_dataManage',
                controllerUrl: 'static/js/controller/edu_dataManage.js',
                templateUrl: 'templates/Educational/edu_dataManage.html',
            }))
            .state("organ_schoolInfo", angularAMD.route({
                url: '/organ_schoolInfo',
                controllerUrl: 'static/js/controller/organ/organ_school_info.js',
                templateUrl: 'templates/organ/organ_school_info.html',
            }))
            .state("organ_accountInfo", angularAMD.route({
                url: '/organ_accountInfo',
                controllerUrl: 'static/js/controller/organ/organ_account_info.js',
                templateUrl: 'templates/organ/organ_account_info.html',
            }))
            .state("organ_staff", angularAMD.route({
                url: '/organ_staff',
                controllerUrl: 'static/js/controller/organ/organ_staff.js',
                templateUrl: 'templates/organ/organ_staff.html',
            }))
            .state("organ_course", angularAMD.route({
                url: '/organ_course',
                controllerUrl: 'static/js/controller/organ/organ_course.js',
                templateUrl: 'templates/organ/organ_course.html',
            }))
            .state("organ_eduSummary", angularAMD.route({
                url: '/organ_eduSummary',
                controllerUrl: 'static/js/controller/organ/organ_edu_summary.js',
                templateUrl: 'templates/organ/organ_edu_summary.html',
                params: {
                    'dataType': null
                }
            }))
            .state("organ_saleColumn", angularAMD.route({
                url: '/organ_saleColumn',
                controllerUrl: 'static/js/controller/organ/organ_sale_column.js',
                templateUrl: 'templates/organ/organ_sale_column.html',
                params: {
                    'dataType': null
                }
            }))
            .state("organ_marketAnalysis", angularAMD.route({
                url: '/organ_marketAnalysis',
                controllerUrl: 'static/js/controller/organ/organ_market_analysis.js',
                templateUrl: 'templates/organ/organ_market_analysis.html',
            }))
            //新的总部统计
            //******销售**********
            .state("new_organ_saleColumn", angularAMD.route({
                url: '/new_organ_saleColumn',
                controllerUrl: 'static/js/controller/organ/new_organ_saleColumn.js',
                templateUrl: 'templates/organ/new_organ_saleColumn.html',
                params: {
                    'dataType': null
                }
            }))
            .state("new_organ_saleColumn/adviserWorks", angularAMD.route({
                url: '/new_organ_saleColumn/adviserWorks',
                controllerUrl: 'static/js/controller/organ/sale_adviserWorks.js',
                templateUrl: 'templates/organ/sale_adviserWorks.html',
                params: {
                    'dataType': null
                }
            }))
            .state("new_organ_saleColumn/appointListen", angularAMD.route({
                url: '/new_organ_saleColumn/appointListen',
                controllerUrl: 'static/js/controller/organ/sale_appoint_listen.js',
                templateUrl: 'templates/organ/sale_appoint_listen.html',
                params: {
                    'dataType': null
                }
            }))
            .state("new_organ_saleColumn/contract_personnum", angularAMD.route({
                url: '/new_organ_saleColumn/contract_personnum',
                controllerUrl: 'static/js/controller/organ/sale_contract_personnum_infos.js',
                templateUrl: 'templates/organ/sale_contract_personnum_infos.html',
            }))
            .state("new_organ_saleColumn/contract_coursetype", angularAMD.route({
                url: '/new_organ_saleColumn/contract_coursetype',
                controllerUrl: 'static/js/controller/organ/sale_contract_coursetype_infos.js',
                templateUrl: 'templates/organ/sale_contract_coursetype_infos.html',
            }))
            .state("new_organ_saleColumn/contract_money", angularAMD.route({
                url: '/new_organ_saleColumn/contract_money',
                controllerUrl: 'static/js/controller/organ/sale_contract_money_infos.js',
                templateUrl: 'templates/organ/sale_contract_money_infos.html',
            }))
            .state("new_organ_saleColumn/channel_statistics", angularAMD.route({
                url: '/new_organ_saleColumn/channel_statistics',
                controllerUrl: 'static/js/controller/organ/sale_channel_statistics.js',
                templateUrl: 'templates/organ/sale_channel_statistics.html',
            }))

        //*****教务******
        .state("new_organ_eduSummary", angularAMD.route({
                url: '/new_organ_eduSummary',
                controllerUrl: 'static/js/controller/organ/new_organ_eduSummary.js',
                templateUrl: 'templates/organ/new_organ_eduSummary.html',
                params: {
                    'dataType': null
                }
            }))
            .state("new_organ_eduSummary/teachHours", angularAMD.route({
                url: '/new_organ_eduSummary/teachHours',
                controllerUrl: 'static/js/controller/organ/edu_teach_hours.js',
                templateUrl: 'templates/organ/edu_teach_hours.html',
            }))
            .state("new_organ_eduSummary/teachHours_2", angularAMD.route({
                url: '/new_organ_eduSummary/teachHours_2',
                controllerUrl: 'static/js/controller/organ/edu_teach_hours_2.js',
                templateUrl: 'templates/organ/edu_teach_hours_2.html',
            }))
            .state("new_organ_eduSummary/teachHours_3", angularAMD.route({
                url: '/new_organ_eduSummary/teachHours_3',
                controllerUrl: 'static/js/controller/organ/edu_teach_hours_3.js',
                templateUrl: 'templates/organ/edu_teach_hours_3.html',
            }))
            .state("new_organ_eduSummary/eduAffair_attend", angularAMD.route({
                url: '/new_organ_eduSummary/eduAffair_attend',
                controllerUrl: 'static/js/controller/organ/edu_affair_attend.js',
                templateUrl: 'templates/organ/edu_affair_attend.html',
            }))
            .state("new_organ_eduSummary/eduAffair_classFull", angularAMD.route({
                url: '/new_organ_eduSummary/eduAffair_classFull',
                controllerUrl: 'static/js/controller/organ/edu_affair_classFull.js',
                templateUrl: 'templates/organ/edu_affair_classFull.html',
            }))
            .state("new_organ_eduSummary/eduAffair_inclass", angularAMD.route({
                url: '/new_organ_eduSummary/eduAffair_inclass',
                controllerUrl: 'static/js/controller/organ/edu_affair_inclass.js',
                templateUrl: 'templates/organ/edu_affair_inclass.html',
            }))
            //******名单*******
            .state("new_organ_marketAnalysis", angularAMD.route({
                url: '/new_organ_marketAnalysis',
                controllerUrl: 'static/js/controller/organ/new_organ_marketAnalysis.js',
                templateUrl: 'templates/organ/new_organ_marketAnalysis.html',
            }))
            .state("new_organ_marketAnalysis/billCollector", angularAMD.route({
                url: '/new_organ_marketAnalysis/billCollector',
                controllerUrl: 'static/js/controller/organ/market_billCollector_statistics.js',
                templateUrl: 'templates/organ/market_billCollector_statistics.html',
            }))
            .state("new_organ_marketAnalysis/nameSource", angularAMD.route({
                url: '/new_organ_marketAnalysis/nameSource',
                controllerUrl: 'static/js/controller/organ/market_nameSource_statistics.js',
                templateUrl: 'templates/organ/market_nameSource_statistics.html',
            }))
            //*******财务********
            .state("new_organ_financeSummary", angularAMD.route({
                url: '/new_organ_financeSummary',
                controllerUrl: 'static/js/controller/organ/new_organ_financeSummary.js',
                templateUrl: 'templates/organ/new_organ_financeSummary.html',
                params: {
                    'dataType': null
                }
            }))
            .state("new_organ_financeSummary/finance_infos", angularAMD.route({
                url: '/new_organ_financeSummary/finance_infos',
                controllerUrl: 'static/js/controller/organ/finance_infos.js',
                templateUrl: 'templates/organ/finance_infos.html',
            }))
            .state("new_organ_financeSummary/business_infos", angularAMD.route({
                url: '/new_organ_financeSummary/business_infos',
                controllerUrl: 'static/js/controller/organ/finance_business_infos.js',
                templateUrl: 'templates/organ/finance_business_infos.html',
            }))
            .state("new_organ_financeSummary/goods_statistics", angularAMD.route({
                url: '/new_organ_financeSummary/goods_statistics',
                controllerUrl: 'static/js/controller/organ/finance_goods_statistics.js',
                templateUrl: 'templates/organ/finance_goods_statistics.html',
            }))
            .state("new_organ_financeSummary/fee_statistics", angularAMD.route({
                url: '/new_organ_financeSummary/fee_statistics',
                controllerUrl: 'static/js/controller/organ/finance_fee_statistics.js',
                templateUrl: 'templates/organ/finance_fee_statistics.html',
            }))
            .state("new_organ_financeSummary/used_money_bytime", angularAMD.route({
                url: '/new_organ_financeSummary/used_money_bytime',
                controllerUrl: 'static/js/controller/organ/finance_usedMoney_bytime.js',
                templateUrl: 'templates/organ/finance_usedMoney_bytime.html',
            }))
            .state("new_organ_financeSummary/used_money_bymonth", angularAMD.route({
                url: '/new_organ_financeSummary/used_money_bymonth',
                controllerUrl: 'static/js/controller/organ/finance_usedMoney_bymonth.js',
                templateUrl: 'templates/organ/finance_usedMoney_bymonth.html',
            }))
            .state("new_organ_financeSummary/useing_money_bytime", angularAMD.route({
                url: '/new_organ_financeSummary/useing_money_bytime',
                controllerUrl: 'static/js/controller/organ/finance_useingMoney_bytime.js',
                templateUrl: 'templates/organ/finance_useingMoney_bytime.html',
            }))
            .state("new_organ_financeSummary/useing_money_bymonth", angularAMD.route({
                url: '/new_organ_financeSummary/useing_money_bymonth',
                controllerUrl: 'static/js/controller/organ/finance_useingMoney_bymonth.js',
                templateUrl: 'templates/organ/finance_useingMoney_bymonth.html',
            }))
            //新的统计页面
            //******教务******
            .state("new_eduStatistics", angularAMD.route({
                url: '/new_eduStatistics',
                controllerUrl: 'static/js/controller/new_statistics/edu_statistics.js',
                templateUrl: 'templates/new_statistics/edu_statistics.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("new_eduStatistics/teachHours", angularAMD.route({
                url: '/new_eduStatistics/teachHours',
                controllerUrl: 'static/js/controller/new_statistics/edu_teach_hours.js',
                templateUrl: 'templates/new_statistics/edu_teach_hours.html',
            }))
            .state("new_eduStatistics/teachHours_2", angularAMD.route({
                url: '/new_eduStatistics/teachHours_2',
                controllerUrl: 'static/js/controller/new_statistics/edu_teach_hours_2.js',
                templateUrl: 'templates/new_statistics/edu_teach_hours_2.html',
            }))
            .state("new_eduStatistics/teachHours_3", angularAMD.route({
                url: '/new_eduStatistics/teachHours_3',
                controllerUrl: 'static/js/controller/new_statistics/edu_teach_hours_3.js',
                templateUrl: 'templates/new_statistics/edu_teach_hours_3.html',
            }))
            .state("new_eduStatistics/classAffair_show", angularAMD.route({
                url: '/new_eduStatistics/classAffair_show',
                controllerUrl: 'static/js/controller/new_statistics/edu_classAffair_show.js',
                templateUrl: 'templates/new_statistics/edu_classAffair_show.html',
            }))
            .state("new_eduStatistics/classAffair_comment", angularAMD.route({
                url: '/new_eduStatistics/classAffair_comment',
                controllerUrl: 'static/js/controller/new_statistics/edu_classAffair_comment.js',
                templateUrl: 'templates/new_statistics/edu_classAffair_comment.html',
            }))
            .state("new_eduStatistics/classAffair_homeWk", angularAMD.route({
                url: '/new_eduStatistics/classAffair_homeWk',
                controllerUrl: 'static/js/controller/new_statistics/edu_classAffair_homeWk.js',
                templateUrl: 'templates/new_statistics/edu_classAffair_homeWk.html',
            }))
            .state("new_eduStatistics/eduAffair_attend", angularAMD.route({
                url: '/new_eduStatistics/eduAffair_attend',
                controllerUrl: 'static/js/controller/new_statistics/edu_affair_attend.js',
                templateUrl: 'templates/new_statistics/edu_affair_attend.html',
            }))
            .state("new_eduStatistics/eduAffair_classFull", angularAMD.route({
                url: '/new_eduStatistics/eduAffair_classFull',
                controllerUrl: 'static/js/controller/new_statistics/edu_affair_classFull.js',
                templateUrl: 'templates/new_statistics/edu_affair_classFull.html',
            }))
            .state("new_eduStatistics/eduAffair_inclass", angularAMD.route({
                url: '/new_eduStatistics/eduAffair_inclass',
                controllerUrl: 'static/js/controller/new_statistics/edu_affair_inclass.js',
                templateUrl: 'templates/new_statistics/edu_affair_inclass.html',
            }))
            .state("new_eduStatistics/eduAffair_takeclass", angularAMD.route({
                url: '/new_eduStatistics/eduAffair_takeclass',
                controllerUrl: 'static/js/controller/new_statistics/edu_affair_takeclass.js',
                templateUrl: 'templates/new_statistics/edu_affair_takeclass.html',
            }))
            //******销售*****
            .state("new_saleStatistics", angularAMD.route({
                url: '/new_saleStatistics',
                controllerUrl: 'static/js/controller/new_statistics/sale_statistics.js',
                templateUrl: 'templates/new_statistics/sale_statistics.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("new_saleStatistics/adviserWorks", angularAMD.route({
                url: '/new_saleStatistics/adviserWorks',
                controllerUrl: 'static/js/controller/new_statistics/sale_adviserWorks.js',
                templateUrl: 'templates/new_statistics/sale_adviserWorks.html',
            }))
            .state("new_saleStatistics/workRecord", angularAMD.route({
                url: '/new_saleStatistics/workRecord',
                controllerUrl: 'static/js/controller/new_statistics/sale_work_record.js',
                templateUrl: 'templates/new_statistics/sale_work_record.html',
            }))
            .state("new_saleStatistics/appointListen", angularAMD.route({
                url: '/new_saleStatistics/appointListen',
                controllerUrl: 'static/js/controller/new_statistics/sale_appoint_listen.js',
                templateUrl: 'templates/new_statistics/sale_appoint_listen.html',
            }))
            .state("new_saleStatistics/contract_personnum", angularAMD.route({
                url: '/new_saleStatistics/contract_personnum',
                controllerUrl: 'static/js/controller/new_statistics/sale_contract_personnum_infos.js',
                templateUrl: 'templates/new_statistics/sale_contract_personnum_infos.html',
            }))
            .state("new_saleStatistics/contract_coursetype", angularAMD.route({
                url: '/new_saleStatistics/contract_coursetype',
                controllerUrl: 'static/js/controller/new_statistics/sale_contract_coursetype_infos.js',
                templateUrl: 'templates/new_statistics/sale_contract_coursetype_infos.html',
            }))
            .state("new_saleStatistics/contract_money", angularAMD.route({
                url: '/new_saleStatistics/contract_money',
                controllerUrl: 'static/js/controller/new_statistics/sale_contract_money_infos.js',
                templateUrl: 'templates/new_statistics/sale_contract_money_infos.html',
            }))
            .state("new_saleStatistics/channel_statistics", angularAMD.route({
                url: '/new_saleStatistics/channel_statistics',
                controllerUrl: 'static/js/controller/new_statistics/sale_channel_statistics.js',
                templateUrl: 'templates/new_statistics/sale_channel_statistics.html',
            }))
            //******市场*******
            .state("new_marketStatistics", angularAMD.route({
                url: '/new_marketStatistics',
                controllerUrl: 'static/js/controller/new_statistics/market_statistics.js',
                templateUrl: 'templates/new_statistics/market_statistics.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("new_marketStatistics/billCollector", angularAMD.route({
                url: '/new_marketStatistics/billCollector',
                controllerUrl: 'static/js/controller/new_statistics/market_billCollector_statistics.js',
                templateUrl: 'templates/new_statistics/market_billCollector_statistics.html',
            }))
            .state("new_marketStatistics/nameSource", angularAMD.route({
                url: '/new_marketStatistics/nameSource',
                controllerUrl: 'static/js/controller/new_statistics/market_nameSource_statistics.js',
                templateUrl: 'templates/new_statistics/market_nameSource_statistics.html',
            }))
            .state("new_marketStatistics/telepSale", angularAMD.route({
                url: '/new_marketStatistics/telepSale',
                controllerUrl: 'static/js/controller/new_statistics/market_telepSale_statistics.js',
                templateUrl: 'templates/new_statistics/market_telepSale_statistics.html',
            }))
            //******财务*****
            .state("financeStatistics", angularAMD.route({
                url: '/financeStatistics',
                controllerUrl: 'static/js/controller/new_statistics/finance_statistics.js',
                templateUrl: 'templates/new_statistics/finance_statistics.html',
                params: {
                    'screenValue': { name: '', type: '', value: '' },
                },
            }))
            .state("financeStatistics/finance_infos", angularAMD.route({
                url: '/financeStatistics/finance_infos',
                controllerUrl: 'static/js/controller/new_statistics/finance_infos.js',
                templateUrl: 'templates/new_statistics/finance_infos.html',
            }))
            .state("financeStatistics/business_infos", angularAMD.route({
                url: '/financeStatistics/business_infos',
                controllerUrl: 'static/js/controller/new_statistics/finance_business_infos.js',
                templateUrl: 'templates/new_statistics/finance_business_infos.html',
            }))
            .state("financeStatistics/goods_statistics", angularAMD.route({
                url: '/financeStatistics/goods_statistics',
                controllerUrl: 'static/js/controller/new_statistics/finance_goods_statistics.js',
                templateUrl: 'templates/new_statistics/finance_goods_statistics.html',
            }))
            .state("financeStatistics/fee_statistics", angularAMD.route({
                url: '/financeStatistics/fee_statistics',
                controllerUrl: 'static/js/controller/new_statistics/finance_fee_statistics.js',
                templateUrl: 'templates/new_statistics/finance_fee_statistics.html',
            }))
            .state("financeStatistics/used_money_bytime", angularAMD.route({
                url: '/financeStatistics/used_money_bytime',
                controllerUrl: 'static/js/controller/new_statistics/finance_usedMoney_bytime.js',
                templateUrl: 'templates/new_statistics/finance_usedMoney_bytime.html',
            }))
            .state("financeStatistics/used_money_bymonth", angularAMD.route({
                url: '/financeStatistics/used_money_bymonth',
                controllerUrl: 'static/js/controller/new_statistics/finance_usedMoney_bymonth.js',
                templateUrl: 'templates/new_statistics/finance_usedMoney_bymonth.html',
            }))
            .state("financeStatistics/useing_money_bytime", angularAMD.route({
                url: '/financeStatistics/useing_money_bytime',
                controllerUrl: 'static/js/controller/new_statistics/finance_useingMoney_bytime.js',
                templateUrl: 'templates/new_statistics/finance_useingMoney_bytime.html',
            }))
            .state("financeStatistics/useing_money_bymonth", angularAMD.route({
                url: '/financeStatistics/useing_money_bymonth',
                controllerUrl: 'static/js/controller/new_statistics/finance_useingMoney_bymonth.js',
                templateUrl: 'templates/new_statistics/finance_useingMoney_bymonth.html',
            }))
            //校区设置
            .state("setManageSys", angularAMD.route({
                url: '/setManageSys',
                controllerUrl: 'static/js/controller/setting_manage/set_manage_sys.js',
                templateUrl: 'templates/setting_manage/set_manage_sys.html',
            }))
            .state("setManageBase", angularAMD.route({
                url: '/setManageBase',
                controllerUrl: 'static/js/controller/setting_manage/set_manage_base.js',
                templateUrl: 'templates/setting_manage/set_manage_base.html',
            }))
            .state("setManageSale", angularAMD.route({
                url: '/setManageSale',
                controllerUrl: 'static/js/controller/setting_manage/set_manage_sale.js',
                templateUrl: 'templates/setting_manage/set_manage_sale.html',
                params: {
                    'screenValue': { },
                    'tab': "",
                    'before': ""
                },
            }))
            .state("setManageEdu", angularAMD.route({
                url: '/setManageEdu',
                controllerUrl: 'static/js/controller/setting_manage/set_manage_edu.js',
                templateUrl: 'templates/setting_manage/set_manage_edu.html',
                params: {
                    'screenValue': { },
                    'tab': "",
                    'before': ""
                },
            }))
            .state("setManageOther", angularAMD.route({
                url: '/setManageOther',
                controllerUrl: 'static/js/controller/setting_manage/set_manage_other.js',
                templateUrl: 'templates/setting_manage/set_manage_other.html',
                params: {
                    'screenValue': { },
                    'tab': "",
                    'tab_': "",
                    'before': ""
                },
            }))
    }];
    return registerRoutes;
})