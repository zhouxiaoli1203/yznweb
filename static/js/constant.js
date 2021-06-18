// 常量定义
var CONSTANT = {

    // ------ 潜客管理 ------ //

    // 客户性别
    STUDENTSEX: {
        1: '男',
        0: '女',
        2: '未知'
    },
    PAGE: {
        POTENTIAL: 0, //潜客页面
        STUDENT: 1 //学员页面
    },
    // 客户状态
    //潜客状态 0 待跟进 1 无效潜客 2 已签约 3 暂无意向 4跟进中 5 预约来访 6已来访 7 已试听 8 预约试听
    POTENTIALCUSTOMERSTATUS: {
        "-1": "未签约",
        0: '待跟进',
        1: '无效潜客',
        2: '已签约',
        3: '暂无意向',
        4: '跟进中',
        5: '预约来访',
        6: '已来访',
        7: '已试听',
        8: '预约试听',
    },
    //  学员类型 潜在学员、在读学员、历史学员
    STUDENTTYPE_: {
        0: '潜在学员',
        1: '在读学员',
        2: '历史学员',
    },
    //潜客来源
    POTENTIAL_SOURCE: {
        0: '电话来访',
        1: '校区到访',
        2: '熟人推荐',
        3: '地推活动',
        4: '网络宣传',
        5: '内部推荐'
    },
    //潜客试听0未预约、1已预约、2已排课、3已试听、4缺席
    POTENTIAL_TRYLISTEN: {
        0: '未预约',
        1: '已预约',
        2: '已排课',
        3: '已试听',
        4: '缺席'
    },

    // 家长关系
    POTENTIALCUSTOMERPARENTTYPE: {
        0: '爸爸',
        1: '妈妈',
        2: '爷爷',
        3: '奶奶',
        4: '外公',
        5: '外婆',
        6: '阿姨',
        8: '本人',
        7: '其他'
    },
    POTENTIALCUSTOMERPARENTVAL: {
        FATHER: 0,
        MOTHER: 1,
        GRADFTH: 2,
        GRADMTH: 3,
        GRADFTH2: 4,
        GRADMTH2: 5,
        AUNT: 6,
        ONESELF: 8,
        OTHER: 7
    },
    // 来源渠道
    POTENTIALCUSTOMERFROM: {
        0: '电话来访',
        1: '校区到访',
        2: '熟人推荐',
        5: '内部介绍',
        3: '地推活动',
        4: '网络渠道'
    },
    // 潜客工作记录类型
    POTENTIALCUSTOMERRECORDTYPE: {
        0: '电话沟通',
        1: '来店洽谈',
        2: '线上沟通'
    },

    // 潜客工作记录类型(用于显示)
    //   0 电话沟通  1 来电洽谈 2线上沟通 3签约合同 4 新增潜客 5 分配  7暂无意向 8 标为无效 10 预约来访
    //  11 转为潜客 12 导入潜客 15 已来访 16 已试听  17 参与活动 18 取消试听 19 预约试听 21转让 22放回公池
    //  23自动回收 24状态变更  25取消来访
    POTENTIALCUSTOMERRECORDTYPEFORSHOW: {
        0: '电话沟通',
        1: '来店洽谈',
        2: '线上沟通',
        3: '签约合同',
        4: '新增潜客',
        5: '顾问分配',
        7: '暂无意向',
        8: '标为无效',
        10: '预约来访',
        11: '转为潜客',
        12: '导入潜客',
        15: '已来访',
        16: '已试听',
        17: '参与活动',
        18: '取消试听',
        19: '预约试听',
        21: '转让',
        22: '放回公池',
        23: '自动回收',
        24: '状态变更',
        25: '取消来访',
        26: '领取',
        27: '转校区'
    },

    // 冻结时间类型
    POTENTIALCUSTOMERVALITDATETYPE: {
        0: '永久',
        7: '一周',
        14: '两周',
        1: '一个月',
        2: '两个月',
        3: '三个月',
        6: '半年',
        12: '一年',
    },
    WEEK: {
        1: '星期一',
        2: '星期二',
        3: '星期三',
        4: '星期四',
        5: '星期五',
        6: '星期六',
        7: '星期日',
    },

    QUARTERSTYPE: {
        TEACHER_ID: 1, //老师岗位ID
        DEAN_ID: 2, //教务岗位ID
        CONSULTANT_ID: 3, //顾问岗位ID
        CONSULTANT_MANAGER_ID: 4, //顾问主管岗位ID
        RECEPTIONIST_ID: 5, //前台岗位ID
        PRESENT_ID: 6, //校长岗位ID
        ADMINISTRATE_ID: 7, //行政岗位ID
        VICE_PRESENT_ID: 8, //副校长岗位ID
        TELEMARKETING_ID: 9, //电话销售ID
        MARKET_MANAGER_ID: 10, //市场主管ID
        MARKETER_ID: 11, //市场人员，采单员岗位ID
        FINANCIAL_ID: 12 //财务岗位ID
    },

    //分类搜索类型
    KIND_SEARCH_TYPE: {
        1: '在课',
        2: '结业',
        3: '排课不足',
        4: '即将结束',
        5: '已结课'
    },

    //班级管理  状态
    CLASS_STATUS: {
        1: '在课',
        2: '结业',
        3: '排课不足',
        4: '即将结束',
        5: '已结课'
    },
    //班级管理  状态2
    CLASS_STATUS2: {
        1: '在课',
        2: '结业',
        3: '待结业',
        4: '开班待定',
    },
    //0 插班 2 休课/退班 3开班,在课
    CLASS_STUD_STATUS: {
        0: '即将进班',
        2: '即将退班',
        3: '在读',
    },
    //请假补课  类型
    LEAVE_TYPE: {
        0: '请假',
        1: '补课',
        2: '缺席'
    },
    //请假补课  状态
    LEAVE_STATUS: {
        0: '待处理',
        4: '已处理',
        3: '放弃',
        2: '取消',
        6: '已排课',
        7: '已补课',
        5: '补课缺席'
    },
    //发送消息  状态
    MSG_STATUS: {
        2: '已发送',
        0: '草稿',
        1: '模板'
    },
    //工作状态
    WORK_STATUS: {
        1: '在职',
        2: '离职'
    },
    //员工工作类型
    WORK_TYPE: {
        1: '全职',
        0: '兼职'
    },
    //操作结果提示
    OPERATION_RESULT_PROMPT: {
        0: '修改成功',
        1: '删除成功',
        2: '添加成功',
        3: '请将信息添加完整',

    },
    //名单状态0 待处理 1 预约 2 已转潜客 3 延期 4 无效 5 未接听
    NAME_STATUS: {
        0: "待处理",
        //      1: "预约",
        2: "已转潜客",
        3: "延期",
        4: "无效",
        5: "未接听"
    },
    NAME_STATUS_ID: {
        PAENDING: 0,
        APPOINT: 1,
        POTENTIAL: 2,
        DELAY: 3,
        INVAILD: 4,
        NOANWSER: 5
    },
    //收费方式
    CHARG_MODE: {
        0: '课时收费',
        1: '按期收费'
    },
    //延期日期
    DELAY_TIME: [{
            id: "0",
            name: "当天"
        },
        {
            id: "1",
            name: "一天"
        },
        {
            id: "2",
            name: "两天"
        },
        {
            id: "3",
            name: "三天"
        },
        {
            id: "7",
            name: "一周"
        },
        {
            id: "15",
            name: "两周"
        },
        {
            id: "30",
            name: "一个月"
        },
    ],
    //意向程度
    INTENT_SHOW: {
        1: "意向一般",
        2: "意向中等",
        3: "意向强烈"
    },
    PTL_INTENT_SHOW: {
        1: "一般",
        2: "中等",
        3: "满意"
    },
    //名单操作类型 0 导入名单 1 名单重分 2 无效名单 3 未接听 4 延期处理 5 预约来访 6 预约来访（未到访） 7 转为潜客 8 激活
    NAMELIST_TYPE: {
        0: "导入名单",
        1: "名单重分",
        2: "无效名单",
        3: "未接听",
        4: "延期处理",
        //      5: "预约来访",
        6: "预约来访（未到访）",
        7: "转为潜客",
        8: "激活"
    },
    //预约状态
    NAME_APPOINT: {
        0: "未到访",
        1: "待定"
    },
    //潜客状态
    NAME_POTENTIAL: {
        0: "流失客户",
        1: "跟进中",
        2: "完成签约"
    },
    //延期状态
    NAME_DELAY: {
        0: "待跟进",
        1: "未到期"
    },
    //未接听状态
    NAME_NOANWSER: {
        0: "暂无意向",
        1: "其他",
        2: "空号码",
        3: "错误信息",
        4: "无人接听",
        5: "不适龄"
    },
    //订单类型
    // 订单类型1：新签 2：续费 3：转课 4：结课 5：退课 6：充值 7：退款 8：支出 9：返还
    ORDER_TYPE: {
        1: "报名",
        //      1:"新签",
        2: "报名",
        3: "转课",
        4: "结课",
        5: "退课",
        6: "充值",
        7: "退款",
        8: "支出",
        9: "返还",
        10: "其他",
        11: "退学杂",
        12: "转校"
    },

    //付费方式  已被替换成PAYTYPENEW
    PAYTYPE: { //筛选项
        0: '支付宝',
        1: '微信',
        2: '现金',
        //      3: '学员账户',
        4: '网银转账',
        5: 'POS机刷卡',
        6: '易收宝(支付宝)',
        7: '易收宝(微信)',
        //      6:"盈收",
        //      7:"亏损",
    },
    PAYTYPENEW: { //支付项
        0: '易收宝',
        1: '支付宝',
        2: '微信',
        3: '现金',
        4: '网银转账',
        5: 'POS机刷卡',
    },
    PRINTTYPENEW: { //支付项
        0: '支付宝',
        1: '微信',
        2: '现金',
        3: '网银转账',
        4: 'POS机刷卡',
        5: '易收宝(支付宝)',
        6: '易收宝(微信)',
        7: '学员账户'
    },
    // 1：已确认 2：自动收款 3：自动退款
    ORDERCONFIRMINFO: {
        0: "未确认",
        1: "已确认",
        2: "自动收款",
        3: "自动退款"
    },
    POTENTIALPOP: {
        TAB_1: 1,
        TAB_2: 2,
        TAB_3: 3,
        TAB_4: 4,
        TAB_5: 5,
        TAB_6: 6
    },
    CLASSPOP: {
        TAB_1: 1,
        TAB_2: 2,
        TAB_3: 3
    },
    CLASSCAOZUOTYPE: {
        //0 休课 1 立即进班 2 取消进班 3 退班 4 立即退班 5 取消退班 6插班
        0: '休课',
        1: '立即进班',
        2: '取消进班',
        3: '退班',
        4: '立即退班',
        5: '取消退班',
        6: '进班',
        7: '取消休课',
    },
    CLASSTYPE: {
        0: '试听班',
        1: '补课班',
        2: '正式班',
    },
    SCHEDULETYPE: {
        0: '正式课',
        1: '试听课',
        2: '补课课',
        3: '活动课'
    },
    CLASSFULLTYPE: {
        1: '满班',
        0: '未满班'
    },
    //学生类型  0正常 1试听 2补课 3临时
    STUDENTTYPE: {
        0: '正常',
        1: '试听',
        2: '补课',
        3: '临时',
    },
    //学生上课状态 1 正常 0 缺席 2 请假
    STUDENTSTATUS: {
        1: '到课',
        0: '缺席',
        2: '请假',
    },
    ACTIVITY_TYPE: {
        1: '预约',
    },
    //年级，2：托班, 3:小班, 4:中班, 5:大班, 6:一年级, 7:二年级, 8:三年级, 9:四年级, 10:五年级, 11:六年级,
    // 12:初一, 13:初二, 14:初三, 15:高一, 16:高二, 17:高三
    //学员年级列表
    STUDENTGRADE: {
        2: "托班",
        3: "小班",
        4: "中班",
        5: "大班",
        6: "一年级",
        7: "二年级",
        8: "三年级",
        9: "四年级",
        10: "五年级",
        11: "六年级",
        12: "初一",
        13: "初二",
        14: "初三",
        15: "高一",
        16: "高二",
        17: "高三",
    }

};

//开关配置项
var CONFIG_TEACHER_CHECK_STUDENT_PHONE = 0x0001; //老师查看拨打学员手机号
var CONFIG_NAME = 0x0800; //名单管理模块
var CONFIG_BOOKING = 0x0002; //约课功能模块
var CONFIG_STOCK_CONTROL = 0x0004; //库存功能开关，默认开
var CONFIG_FACE_DETECT = 0x0008; //刷脸
var CONFIG_ROLLCALL = 0x0010; //点名设置
var CONFIG_INTEGRAL_CONTROL = 0x0020; //积分功能开关，默认开
var CONFIG_HIDE_COURSE_TIME = 0x0080; //隐藏家长端报读课程的课时信息，默认关
var CONFIG_STUDENT_SAVE_VIDEO = 0x0100; //家长端保存视频功能，默认关
var CONFIG_PICK_UP_STATUS = 0x0200; //接送服务通知 默认关
var CONFIG_NO_LESSON_ROLLCALL = 0x0400; //接送服务通知 默认关
var CONFIG_XIUKE_STATUS = 0x1000;//休课开关

var CONSTANT_SNV = [{
        sref: "workbench",
        id: "work_icon",
        name: "工作台",
        authMenuId: 1
    },
    {
        sref: "myshow",
        id: "show_icon",
        name: "易知独秀",
        authMenuId: 2,
        items: [
            {
                name: "易知独秀",
                id: "icon_showactivity",
                sref: "showactivity",
                authMenuId: "2",
                childs: [
                    {
                        name: "开始制作",
                        link:["开始制作", "模板", "模板库"],
                        sref: "showactivity",
                        authMenuId: "2",
                        tab:2,
                    },
                    {
                        name: "活动数据",
                        sref: "showactivity",
                        authMenuId: "2",
                        tab:1,
                    },
                ]
            }
        ]
    },
    {
        id: "icon_shopping_mall",
        name: "营销中心",
        authMenuId: 88,
        items: [{
                sref: "showofficial",
                id: "icon_showofficial",
                name: "官网设置",
                authMenuId: 187,

            },
            {
                sref: "showcourse",
                id: "icon_showcourse",
                name: "展示课程",
                authMenuId: 188
            },
            {
                sref: "goods_management",
                id: "goods_management",
                name: "商品管理",
                authMenuId: 112,
                childs: [
                    {
                        name: "新建商品",
                        sref: "goods_management",
                        authMenuId: "114",
                        pop: "新建商品"
                    },
                ]
            }, {
                sref: "coupon",
                id: "coupon",
                name: "优惠券",
                authMenuId: 115,
                childs: [
                    {
                        name: "创建优惠券",
                        sref: "coupon",
                        authMenuId: "117",
                        pop: "创建优惠券"
                    },
                    {
                        name: "发送优惠券",
                        sref: "coupon",
                        authMenuId: "117",
                        pop: "发送优惠券"
                    },
                    {
                        name: "分享优惠券",
                        sref: "coupon",
                        authMenuId: "115",
                    },
                ]
            }, {
                sref: "survey",
                id: "survey",
                name: "问卷管理",
                authMenuId: 151,
                childs: [
                    {
                        name: "新建问卷",
                        sref: "survey",
                        authMenuId: "153",
                        pop: "新建问卷"
                    },
                ]
            }, {
                sref: "referral",
                id: "referral",
                name: "分销管理",
                authMenuId: 161,
                childs: [
                    {
                        name: "发放奖励",
                        link: ["发放奖励","推荐","推荐人"],
                        sref: "referral",
                        authMenuId: "161",
                    },
                    {
                        name: "发放记录",
                        link: ["发放记录","推荐","推荐人"],
                        sref: "referral",
                        authMenuId: "161",
                    },
                ]
            }
        ]
    },
    {
        id: "sale_icon",
        name: "销售管理",
        authMenuId: 4,
        items: [{
                sref: "nameList",
                id: "icon_qianke",
                name: "名单管理",
                shopType: "0",
                config: CONFIG_NAME,
                authMenuId: 6,
                childs: [
                    {
                        name: "地推设置",
                        sref: "nameList",
                        authMenuId: "8",
                    },
                    {
                        name: "名单分配",
                        sref: "nameList",
                        authMenuId: "11",
                    },
                    {
                        name: "导入名单",
                        sref: "nameList",
                        authMenuId: "10",
                        pop: "导入名单"
                    },
                    {
                        name: "导出名单",
                        sref: "nameList",
                        authMenuId: "147",
                    },
                ]
            }, {
                sref: "potial_customer",
                id: "icon_qianke",
                name: "潜客管理",
                authMenuId: 12,
                childs: [
                    {
                        name: "新增潜客",
                        link: ["新增潜客","客户","线索"],
                        sref: "potial_customer",
                        authMenuId: "14",
                        pop: "新增潜客"
                    },
                    {
                        name: "导入潜客",
                        sref: "potial_customer",
                        authMenuId: "16",
                        pop: "导入潜客"
                    },
                    {
                        name: "导出潜客",
                        sref: "potial_customer",
                        authMenuId: "17",
                    },
                    {
                        name: "转让潜客",
                        sref: "potial_customer",
                        authMenuId: "14",
                    },
                    {
                        name: "放回公池",
                        sref: "potial_customer",
                        authMenuId: "14",
                    },
                    {
                        name: "公池设置",
                        sref: "potial_customer/all",
                        authMenuId: "166",
                    },
                    {
                        name: "批量领取",
                        sref: "potial_customer/all",
                        authMenuId: "167",
                    },
                    {
                        name: "批量分配",
                        sref: "potial_customer/all",
                        authMenuId: "15",
                    },
                    {
                        name: "批量删除",
                        sref: "potial_customer/all",
                        authMenuId: "108",
                    },
                ]
            },
            {
                sref: "visiting",
                id: "icon_staff",
                name: "来访查询",
                authMenuId: 5
            },
            {
                sref: "listenRecord",
                id: "listenRecord",
                name: "试听管理",
                authMenuId: 39,
                childs: [
                    {
                        name: "试听记录",
                        sref: "listenRecord",
                        authMenuId: "39",
                    },
                    {
                        name: "安排试听",
                        sref: "listenRecord/list",
                        authMenuId: "41",
                    },
                ]
            },
            {
                sref: "send_order",
                id: "icon_sendOrder",
                name: "订单推送",
                authMenuId: 121,
                childs: [
                    {
                        name: "新增推单",
                        sref: "send_order",
                        authMenuId: "123",
                        pop: "新增推单"
                    },
                    {
                        name: "推单二维码",
                        sref: "send_order",
                        authMenuId: "121",
                    },
                ]
            },
            {
                sref: "renew_warning",
                id: "icon_renew",
                name: "续费预警",
                authMenuId: 18,
                childs: [
                    {
                        name: "提醒续费",
                        sref: "renew_warning",
                        authMenuId: "20",
                        to: "续费预警"
                    },
                    {
                        name: "续费预警设置",
                        sref: "renew_warning",
                        authMenuId: "21",
                        to: "续费预警"
                    },
                ]
            },
        ]
    },
    {
        id: "edu_icon",
        name: "教务管理",
        authMenuId: 27,
        items: [{
                sref: "edu_student",
                id: "icon_student",
                name: "学员中心",
                authMenuId: 28,
                childs: [
                    {
                        name: "在读学员",
                        sref: "edu_student",
                        authMenuId: "28",
                        tab:1,
                    },
                    {
                        name: "历史学员",
                        sref: "edu_student",
                        authMenuId: "28",
                        tab:2
                    },
                    {
                        name: "报课明细",
                        sref: "edu_student/signUp_detail",
                        authMenuId: "28",
                    },
                    {
                        name: "新生报名",
                        sref: "edu_student",
                        authMenuId: "30",
                        pop: "新生报名"
                    },
                    {
                        name: "导入学员",
                        sref: "edu_student",
                        authMenuId: "31",
                    },
                    {
                        name: "导出学员",
                        sref: "edu_student",
                        authMenuId: "66",
                    },
                ]
            },
            {
                sref: "edu_class",
                id: "icon_class",
                name: "班级管理",
                authMenuId: 32,
                childs: [
                    {
                        name: "新增班级",
                        sref: "edu_class",
                        authMenuId: "34",
                        pop: "新增班级"
                    },
                    {
                        name: "导入班级",
                        sref: "edu_class",
                        authMenuId: "34",
                        pop: "导入班级"
                    },
                    {
                        name: "导出班级",
                        sref: "edu_class",
                        authMenuId: "34",
                    },
                ]
            },
            {
                sref: "edu_schedule",
                id: "icon_schedule",
                name: "课表管理",
                authMenuId: 35,
                childs: [
                    {
                        name: "快速排课",
                        sref: "edu_schedule",
                        authMenuId: "38",
                        pop: "快速排课"
                    },
                    {
                        name: "排课变更",
                        sref: "edu_schedule",
                        authMenuId: "37",
                    },
                    {
                        name: "批量调课",
                        sref: "edu_schedule",
                        authMenuId: "37",
                    },
                    {
                        name: "批量顺延",
                        sref: "edu_schedule",
                        authMenuId: "37",
                    },
                    {
                        name: "批量删除",
                        sref: "edu_schedule",
                        authMenuId: "37",
                    },
                    {
                        name: "导出课表",
                        sref: "edu_schedule",
                        authMenuId: "35",
                    },
                    {
                        name: "导出上课名单",
                        sref: "edu_schedule",
                        authMenuId: "198",
                    },
                ]
            },
            {
                sref: "edu_aboutClass",
                id: "icon_aboutClass",
                name: "约课管理",
                config: CONFIG_BOOKING,
                authMenuId: 82,
                childs: [
                    {
                        name: "预约上课",
                        sref: "edu_aboutClass/record",
                        authMenuId: "84",
                        pop: "预约上课"
                    },
                    {
                        name: "导出约课记录",
                        sref: "edu_aboutClass/record",
                        authMenuId: "84",
                    },
                    {
                        name: "约课预警设置",
                        sref: "edu_aboutClass",
                        authMenuId: "173",
                    },
                ]
            },
            {
                sref: "edu_course",
                id: "icon_course",
                name: "课程设置",
                authMenuId: 47,
                childs: [
                    {
                        name: "新增课程",
                        sref: "edu_course",
                        authMenuId: "47",
                        tab:1,
                        pop: "新增课程"
                    },
                    {
                        name: "新增学杂",
                        sref: "edu_course",
                        authMenuId: "47",
                        tab:3,
                        pop: "新增学杂"
                    },
                    {
                        name: "新增课程包",
                        sref: "edu_course",
                        authMenuId: "47",
                        tab:4,
                        pop: "新增课程包"
                    },
                ]
            },
            {
                sref: "edu_dataManage",
                id: "icon_dataManage",
                name: "资料管理",
                authMenuId: 160,
                childs: [
                    {
                        name: "新建文件夹",
                        sref: "edu_dataManage",
                        authMenuId: "160",
                    },
                    {
                        name: "上传文件",
                        sref: "edu_dataManage",
                        authMenuId: "160",
                    },
                ]
            },
        ]
    },
    {
        id: "daily_icon",
        name: "日常课务",
        authMenuId: 81,
        items: [{
                sref: "edu_classAffair",
                id: "icon_classAffair",
                name: "课务管理",
            authMenuId: 77,
            childs: [
                {
                    name: "上课记录",
                    sref: "edu_classAffair",
                    authMenuId: "77",
                },
                {
                    name: "导出上课记录",
                    sref: "edu_classAffair",
                    authMenuId: "169",
                },
                {
                    name: "课堂展示",
                    sref: "edu_classAffair/show",
                    authMenuId: "77",
                },
                {
                    name: "课堂点评",
                    sref: "edu_classAffair/comment",
                    authMenuId: "77",
                },
                {
                    name: "课后作业",
                    sref: "edu_classAffair/houseWk",
                    authMenuId: "77",
                },
                {
                    name: "打卡作业",
                    sref: "edu_classAffair/clock",
                    authMenuId: "77",
                },
            ]
            },
            {
                sref: "edu_onlineCourse",
                id: "icon_onlineCourse",
                name: "线上课程",
                authMenuId: 158,
                childs: [
                    {
                        name: "创建线上课程",
                        sref: "edu_onlineCourse",
                        authMenuId: "158",
                    },
                ]
            },
            {
                sref: "edu_integralManag",
                id: "icon_integralManag",
                name: "积分管理",
                config: CONFIG_INTEGRAL_CONTROL,
                authMenuId: 118,
                childs: [
                    {
                        name: "积分变动",
                        sref: "edu_integralManag",
                        authMenuId: "120",
                        pop: "积分变动"
                    },
                    {
                        name: "规则设置",
                        sref: "edu_integralManag",
                        authMenuId: "174",
                    },
                ]
            },

            {
                sref: "edu_leave",
                id: "icon_leave",
                name: "请假补课",
                authMenuId: 42,
                childs: [
                    {
                        name: "补课管理",
                        sref: "edu_leave/makeup",
                        authMenuId: "45",
                    },
                    {
                        name: "学员请假",
                        sref: "edu_leave",
                        authMenuId: "44",
                        pop: "请假"
                    },
                    {
                        name: "请假设置",
                        sref: "edu_leave",
                        authMenuId: "175",
                    },
                    {
                        name: "补课排课",
                        sref: "edu_leave/makeup",
                        authMenuId: "46",
                        pop: "补课排课"
                    },
                ]
            },
            {
                sref: "edu_signIn",
                id: "icon_signIn",
                name: "学员签到",
                authMenuId: 101
            },
            {
                sref: "edu_pickUp",
                id: "icon_pickUp",
                name: "接送管理",
                authMenuId: 124,
                config: CONFIG_PICK_UP_STATUS
            },
        ]
    },
    {
        id: "edu_myicon",
        name: "我的授课",
        authMenuId: 154,
        items: [{
                sref: "edu_myClassAffair",
                id: "icon_myClassAffair",
                name: "我的课表",
                authMenuId: 155
            },
            {
                sref: "edu_myIntegralManag",
                id: "icon_myItegralManag",
                name: "打卡作业",
                authMenuId: 156
            },
            {
                sref: "edu_myOnlineCourse",
                id: "icon_onlineCourse",
                name: "线上课程",
                authMenuId: 159
            },
        ]
    },

    {
        id: "people_icon",
        name: "行政管理",
        authMenuId: 48,
        items: [{
                sref: "edu_notice",
                id: "icon_notice",
                name: "通知管理",
                authMenuId: 85,
                childs: [
                    {
                        name: "发送通知",
                        sref: "edu_notice",
                        authMenuId: "87",
                        tab:1,
                        pop: "发送通知"
                    },
                    {
                        name: "发送短信",
                        sref: "edu_notice",
                        authMenuId: "87",
                        tab:4,
                        pop: "发送短信"
                    },
                    {
                        name: "短信充值",
                        sref: "edu_notice",
                        authMenuId: "87",
                        tab: 2,
                    },
                    {
                        name: "短信设置",
                        sref: "edu_notice",
                        authMenuId: "181",
                        tab: 2,
                    },
                ]
            },
            {
                sref: "stock",
                id: "icon_stock",
                name: "库存管理",
                config: CONFIG_STOCK_CONTROL,
                authMenuId: 89,
                childs: [
                    {
                        name: "库存记录",
                        sref: "stock/record",
                        authMenuId: "89",
                    },
                    {
                        name: "兑换礼品",
                        sref: "stock",
                        authMenuId: "91",
                        pop: "兑换礼品"
                    },
                    {
                        name: "新增出库",
                        sref: "stock",
                        authMenuId: "91",
                        pop: "新增出库"
                    },
                    {
                        name: "新增入库",
                        sref: "stock",
                        authMenuId: "91",
                        pop: "新增入库"
                    },
                    {
                        name: "新增物品",
                        sref: "stock",
                        authMenuId: "91",
                        pop: "新增物品"
                    },
                    {
                        name: "导入物品",
                        sref: "stock",
                        authMenuId: "91",
                        pop: "导入物品"
                    },
                ]
            },
            {
                sref: "staff_new",
                id: "icon_staff",
                name: "员工管理",
                authMenuId: 50,
                childs: [
                    {
                        name: "岗位管理",
                        sref: "post",
                        authMenuId: "49",
                    },
                    {
                        name: "新增员工",
                        sref: "staff_new",
                        authMenuId: 52,
                        pop: "新增员工"
                    },
                    {
                        name: "新增岗位",
                        sref: "post",
                        authMenuId: "49",
                        pop: "新增岗位"
                    },
                    {
                        name: "导入员工",
                        sref: "staff_new",
                        authMenuId: "52",
                    },
                ]
            },
            {
                sref: "attend",
                id: "icon_attend",
                name: "员工考勤",
                authMenuId: 109,
                childs: [
                    {
                        name: "考勤设置",
                        sref: "attend",
                        authMenuId: "183",
                        tab:1,
                    },
                    {
                        name: "员工请假",
                        sref: "attend",
                        authMenuId: "111",
                        tab:2,
                    },
                ]
            },
        ]
    },
    {
        id: "financial_icon",
        name: "财务管理",
        authMenuId: 53,
        items: [{
                sref: "ordermanage",
                id: "icon_ordermanage",
                name: "订单管理",
                authMenuId: 54,
                childs: [
                    {
                        name: "结课记录",
                        sref: "ordermanage",
                        authMenuId: "54",
                        tab:2
                    },
                    {
                        name: "订单设置",
                        sref: "ordermanage",
                        authMenuId: "180",
                    },
                    {
                        name: "订单导出",
                        sref: "ordermanage",
                        authMenuId: "170",
                    },
                ]
            },
            {
                sref: "payments",
                id: "icon_payments",
                name: "收支明细",
                authMenuId: 57,
                childs: [
                    {
                        name: "导出收支",
                        sref: "payments",
                        authMenuId: "148",
                    },
                ]
            },
            {
                sref: "paytreasure",
                id: "icon_treasure",
                name: "易收宝",
                authMenuId: 92,
                childs: [
                    {
                        name: "快速收款",
                        sref: "paytreasure",
                        authMenuId: "192",
                    },
                    {
                        name: "收款码",
                        sref: "paytreasure",
                        authMenuId: "193",
                    },
                    {
                        name: "导出记录",
                        sref: "paytreasure",
                        authMenuId: "92",
                    },
                ]
            },
            {
                sref: "expense",
                id: "icon_expense",
                name: "费用收支",
                authMenuId: 93,
                childs: [
                    {
                        name: "新增记录",
                        sref: "expense",
                        authMenuId: "95",
                        pop: "新增记录"
                    },
                    {
                        name: "导出费用",
                        sref: "expense",
                        authMenuId: "149",
                    },
                    {
                        name: "费用分类",
                        sref: "expense",
                        authMenuId: "185",
                    },
                ]
            },
            {
                sref: "performance",
                id: "icon_performance",
                name: "工资管理",
                authMenuId: 96,
                childs: [
                    {
                        name: "导入工资单",
                        sref: "performance",
                        authMenuId: "98",
                    },
                    {
                        name: "工资模板设置",
                        sref: "performance",
                        authMenuId: "184",
                    },
                    {
                        name: "绩效设置",
                        sref: "performance/setting",
                        authMenuId: "96",
                    },
                    {
                        name: "新增绩效规则",
                        sref: "performance/rule",
                        authMenuId: "98",
                        pop: "新增绩效规则"
                    },
                ]
            }
        ]

    },
    {
        sref: "dataView",
        id: "data_icon",
        name: "数据概览",
        authMenuId: 67,
    },
    {
        id: "organ_icon",
        name: "校区管理",
        authMenuId: 68,
        items: [{
                sref: "organ_schoolInfo",
                id: "icon_school_info",
                name: "校区信息",
                authMenuId: 70
            },
            {
                sref: "organ_accountInfo",
                id: "icon_account_info",
                name: "总校账号",
                authMenuId: 73
            },
            {
                sref: "organ_staff",
                name: "员工管理",
                authMenuId: 196
            },
            {
                sref: "organ_course",
                name: "课程管理",
                authMenuId: 197
            }
        ]
    },
    {
        id: "organ_analysis_icon",
        name: "校区统计",
        authMenuId: 69,
        items: [{
                sref: "new_organ_saleColumn",
                id: "icon_organ_sale_summary",
                name: "销售统计",
                authMenuId: 75
            },
            {
                sref: "new_organ_eduSummary",
                id: "icon_organ_edu_summary",
                name: "教务汇总",
                authMenuId: 74
            },
            {
                sref: "new_organ_marketAnalysis",
                id: "icon_organ_market_analysis",
                name: "名单分析",
                authMenuId: 76
            },
            {
                sref: "new_organ_financeSummary",
                id: "icon_organ_finance_summary",
                name: "财务分析",
                authMenuId: 157
            },
        ]
    },
    {
        id: "statistics_icon",
        name: "统计分析",
        authMenuId: 60,
        items: [{
                sref: "new_saleStatistics",
                id: "icon_new_saleStatistics",
                name: "销售统计",
            authMenuId: 62,
            childs: [
                {
                    name: "销售工作概况",
                    sref: "new_saleStatistics/adviserWorks",
                    authMenuId: "130",
                },
                {
                    name: "工作记录",
                    sref: "new_saleStatistics/workRecord",
                    authMenuId: "130",
                },
                {
                    name: "试听统计",
                    sref: "new_saleStatistics/appointListen",
                    authMenuId: "130",
                },
                {
                    name: "签约人数",
                    sref: "new_saleStatistics/contract_personnum",
                    authMenuId: "131",
                },
                {
                    name: "签约科目",
                    sref: "new_saleStatistics/contract_coursetype",
                    authMenuId: "131",
                },
                {
                    name: "报课金额",
                    sref: "new_saleStatistics/contract_money",
                    authMenuId: "131",
                },
                {
                    name: "渠道分析",
                    sref: "new_saleStatistics/channel_statistics",
                    authMenuId: "132",
                },
            ]
            },
            {
                sref: "new_eduStatistics",
                id: "icon_new_eduStatistics",
                name: "教务汇总",
                authMenuId: 61,
                childs: [
                    {
                        name: "授课课时",
                        sref: "new_eduStatistics/teachHours",
                        authMenuId: "127",
                    },
                    {
                        name: "授课人次",
                        sref: "new_eduStatistics/teachHours_2",
                        authMenuId: "127",
                    },
                    {
                        name: "消课课时",
                        sref: "new_eduStatistics/teachHours_3",
                        authMenuId: "127",
                    },
                    {
                        name: "课堂展示统计",
                        sref: "new_eduStatistics/classAffair_show",
                        authMenuId: "128",
                    },
                    {
                        name: "课堂点评统计",
                        sref: "new_eduStatistics/classAffair_comment",
                        authMenuId: "128",
                    },
                    {
                        name: "作业收交",
                        sref: "new_eduStatistics/classAffair_homeWk",
                        authMenuId: "128",
                    },
                    {
                        name: "出勤率",
                        sref: "new_eduStatistics/eduAffair_attend",
                        authMenuId: "129",
                    },
                    {
                        name: "满班率",
                        sref: "new_eduStatistics/eduAffair_classFull",
                        authMenuId: "129",
                    },
                    {
                        name: "在读趋势",
                        sref: "new_eduStatistics/eduAffair_inclass",
                        authMenuId: "129",
                    },
                    {
                        name: "带班人数",
                        sref: "new_eduStatistics/eduAffair_takeclass",
                        authMenuId: "129",
                    },
                ]
            },
            {
                sref: "new_marketStatistics",
                id: "icon_new_marketStatistics",
                name: "名单分析",
                shopType: "0",
                authMenuId: 63,
                childs: [
                    {
                        name: "采单员工作概况",
                        sref: "new_marketStatistics/billCollector",
                        authMenuId: "133",
                    },
                    {
                        name: "电销工作概况",
                        sref: "new_marketStatistics/telepSale",
                        authMenuId: "134",
                    },
                    {
                        name: "名单来源分析",
                        sref: "new_marketStatistics/nameSource",
                        authMenuId: "135",
                    },
                ]

            },
            {
                sref: "financeStatistics",
                id: "icon_finance_analysis",
                name: "财务分析",
                shopType: "0",
                authMenuId: 136,
                childs: [
                    {
                        name: "财务流水",
                        sref: "financeStatistics/finance_infos",
                        authMenuId: "137",
                    },
                    {
                        name: "经营利润",
                        sref: "financeStatistics/business_infos",
                        authMenuId: "138",
                    },
                    {
                        name: "学杂统计",
                        sref: "financeStatistics/goods_statistics",
                        authMenuId: "139",
                    },
                    {
                        name: "消课金额",
                        sref: "financeStatistics/used_money_bytime",
                        authMenuId: "140",
                    },
                    {
                        name: "待消金额",
                        sref: "financeStatistics/useing_money_bytime",
                        authMenuId: "146",
                    },
                ]

            },
        ]
    },
    {
        id: "setting_icon",
        name: "校区设置",
        authMenuId: 168,
        items: [{
                sref: "setManageSys",
                name: "系统服务",
                authMenuId: 105,
            },
            {
                sref: "setManageBase",
                name: "基础设置",
                authMenuId: 3,
                childs: [
                    {
                        name: "拨打电话",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0001",
                        authMenuId: 3,
                    },
                    {
                        name: "名单功能",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0800",
                        authMenuId: 3,
                    },
                    {
                        name: "约课功能",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0002",
                        authMenuId: 3,
                    },
                    {
                        name: "记上课功能",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0400",
                        authMenuId: 3,
                    },
                    {
                        name: "点名设置",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0010",
                        authMenuId: 3,
                    },
                    {
                        name: "隐藏课时",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0080",
                        authMenuId: 3,
                    },
                    {
                        name: "保存视频",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0100",
                        authMenuId: 3,
                    },
                    {
                        name: "库存功能",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0004",
                        authMenuId: 3,
                    },
                    {
                        name: "积分功能",
                        sref: "setManageBase",
                        tab: 1,
                        config:"0x0020",
                        authMenuId: 3,
                    },

                ]
            },
            {
                sref: "setManageSale",
                name: "销售设置",
                shopType: "0",
                authMenuId: 171,
                childs: [
                    {
                        name: "新增渠道",
                        sref: "setManageSale",
                        tab:1,
                        authMenuId: "22",
                    },
                    {
                        name: "公池设置",
                        sref: "setManageSale",
                        tab:2,
                        authMenuId: "166",
                    },
                    {
                        name: "续费预警设置",
                        sref: "setManageSale",
                        tab:3,
                        authMenuId: "21",
                    },
                ]

            },
            {
                sref: "setManageEdu",
                name: "教务设置",
                shopType: "0",
                authMenuId: 172,
                childs: [
                    {
                        name: "约课设置",
                        sref: "setManageEdu",
                        tab:1,
                        authMenuId: "173",
                    },
                    {
                        name: "积分设置",
                        sref: "setManageEdu",
                        tab:2,
                        authMenuId: "174",
                    },
                    {
                        name: "教室设置",
                        sref: "classroom",
                        tab:3,
                        authMenuId: "176",
                    },
                    {
                        name: "请假设置",
                        sref: "setManageEdu",
                        tab:4,
                        authMenuId: "175",
                    },
                    {
                        name: "周边学校",
                        sref: "nearbySchool",
                        tab:5,
                        authMenuId: "177",
                    },
                    {
                        name: "分享设置",
                        sref: "share",
                        tab:6,
                        authMenuId: "178",
                    },
                ]

            },
            {
                sref: "setManageOther",
                name: "其他设置",
                shopType: "0",
                authMenuId: 179,
                childs: [
                    {
                        name: "打印设置",
                        sref: "setManageOther",
                        tab: 1,
                        tab2:1,
                        authMenuId: "180",
                    },
                    {
                        name: "报名须知",
                        sref: "setManageOther",
                        tab: 1,
                        tab2:2,
                        authMenuId: "180",
                    },
                    {
                        name: "收款码配置",
                        sref: "setManageOther",
                        tab: 1,
                        tab2:3,
                        authMenuId: "180",
                    },
                    {
                        name: "老师端通知",
                        sref: "setManageOther",
                        tab: 2,
                        tab2:1,
                        authMenuId: "181",
                    },
                    {
                        name: "学员通知",
                        sref: "setManageOther",
                        tab: 2,
                        tab2:2,
                        authMenuId: "181",
                    },
                    {
                        name: "短信设置",
                        sref: "setManageOther",
                        tab: 2,
                        tab2:3,
                        authMenuId: "181",
                    },
                    {
                        name: "学员考勤",
                        sref: "setManageOther",
                        tab:3,
                        authMenuId: "182",
                    },
                    {
                        name: "员工考勤设置",
                        sref: "setManageOther",
                        tab:4,
                        authMenuId: "183",
                    },
                    {
                        name: "工资模板",
                        sref: "setManageOther",
                        tab:5,
                        authMenuId: "184",
                    },
                    {
                        name: "费用分类",
                        sref: "setManageOther",
                        tab:6,
                        authMenuId: "185",
                    },
                ]

            },
        ]
    },
];

//所有功能入口的分词
var ALL_SEARCH_WORDS="官网,领取,报名,礼品,分配,奖励,保存,变更,通知,工作,费用,流水,请假,满班,安排,点评,历史,补课,老师,其他,库存,商品,科目,功能,创建,作业,服务,经营,课表,兑换,销售,上课,渠道,中心,分类,分析,文件,优惠券,新建,工资单,系统,文件夹,删除,考勤,班级,推送,独秀,发送,问卷,周边,上传,设置,打卡,新生,教务,教室,放回,分享,绩效,学校,预警,打印,模板,明细,导出,物品,点名,批量,授课,签到,概况,家长,趋势,发放,员工,管理,带班,基础,展示,查询,利润,快速,短信,视频,充值,岗位,我的,出勤率,打电话,课时,转让,统计,顺延,人次,财务,分销,记录,收支,学员,开始,活动,课后,资料,规则,入库,收款,来源,提醒,课课,出库,配置,课堂,在读,须知,汇总,变动,课程,名单,导入,新增,订单,二维,续费,试听,签约,制作,接送,易收宝,数据,工资,来访,积分,金额,人数,模板,列表,推荐,地推,潜客,公池,推单,二维码,报课,排课,预约,约课,学杂,课程包,线上,收款码,交易";