//rem布局
(window.onload = function() {
    window.onresize = function() {
        initFont();
    }

    function initFont() {
        var htmlWidth = 320;
        if (htmlWidth >= 750) {
            document.documentElement.style.fontSize = 100 + 'px';
        } else {
            document.documentElement.style.fontSize = 100 / 750 * htmlWidth + 'px';
        }
    }
    initFont();
})();

var dogTimer = null; //狗狗切换切换图片计时器
var shareHref_ = window.location.protocol + '//' + window.location.host;
if (window.location.host == 'www.yizhiniao.com') {
    shareHref_ = window.location.protocol + '//' + 'm.yizhiniao.com';
}

var h5_tempalteData = {
    'robBuy/buyActivity': {
        type: 'add',
        basicInfo: {
            activityName: '秋季班开班啦！盛大开启限时抢购活动',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/buyActivity_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/buyActivity_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/buyActivity.png',
            title: '秋季班开班啦！盛大开启限时抢购活动',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/art': {
        type: 'add',
        basicInfo: {
            activityName: '秋季班开班啦！盛大开启限时抢购活动',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/art.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/art.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/art.png',
            title: '秋季班开班啦！盛大开启限时抢购活动',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/childDay': {
        type: 'add',
        basicInfo: {
            activityName: '六一儿童节！盛大开启限时抢购活动',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/childDay.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/childDay.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/childDay.png',
            title: '六一儿童节！盛大开启限时抢购活动',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/dragonDay_20': {
        type: 'add',
        basicInfo: {
            activityName: '浓情端午节！盛大开启限时抢购活动',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/dragonDay_20.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/dragonDay_20.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/dragonDay_20.png',
            title: '浓情端午节！盛大开启限时抢购活动',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/thanksgiving_20': {
        type: 'add',
        basicInfo: {
            activityName: '感恩常在',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/thanksgiving_20.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/thanksgiving_20.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/thanksgiving_20.png',
            title: '感恩常在',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/christmas_20': {
        type: 'add',
        basicInfo: {
            activityName: 'Merry Christmas',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/christmas_20.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/christmas_20.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/christmas_20.png',
            title: 'Merry Christmas',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/elevenx2_19': {
        type: 'add',
        basicInfo: {
            activityName: '秋季班开班啦！盛大开启限时抢购活动',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/elevenx2_19_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/elevenx2_19_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/elevenx2_19.png',
            title: '秋季班开班啦！盛大开启限时抢购活动',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/newYear_20': {
        type: 'add',
        basicInfo: {
            activityName: '你好，2020',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/newYear_20_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/newYear_20_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/robBuy/newYear_20/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/newYear_20.png',
            title: '你好，2020',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/newSpring_20': {
        type: 'add',
        basicInfo: {
            activityName: '恭贺新春',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/newSpring_20_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/newSpring_20_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/robBuy/newSpring_20/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/newSpring_20.png',
            title: '恭贺新春',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/twelvex2_19': {
        type: 'add',
        basicInfo: {
            activityName: '双12大促',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/twelvex2_19_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/twelvex2_19_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/twelvex2_19.png',
            title: '双12大促',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'robBuy/autumn_19': {
        type: 'add',
        basicInfo: {
            activityName: '秋季班开班啦！盛大开启限时抢购活动',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: yznDateAdd(new Date(), 7),
            coverImg: 'https://cdn.yizhiniao.com/robBuy/autumn_19_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/robBuy/autumn_19_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityPrizeListShow: 0, //展示的模板序号
        activityPrizeList: [ //活动说明

        ],
        prizeInfo: {
            activityRule: "1. 该活动为限时抢购活动，活动名额有限，先到先得。\n2. 活动开始后，点击“我要报名”，付款成功，即可算抢购成功。\n3. 抢购成功后，可以在“易知鸟”小程序中查看报读课程。\n4. 每位学员最多选购2门课程。\n5. 本活动新老学员不限。\n6. 本活动最终解释权归xxx所有。"
        },
        prizeBigIntro: [ //课程描述
            { type: 'text', value: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' },
        ],
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            groupLimit: 0, //开启限制限购数量
            limitItems: 1,
            courseLimit: 0, //开启新老学员报名限制
            limitNum: 0

        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/robBuy/autumn_19.png',
            title: '秋季班开班啦！盛大开启限时抢购活动',
            desc: '课程1:芭蕾舞课程\n★★★上课时间★★★\n9月1日开始上课，每周日上课。共10次课。\n可选上课时间段',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/miniLeaflet': {
        type: 'add',
        basicInfo: {
            activityName: '麦兜成长教育诚邀您的参与',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/miniLeaflet_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/miniLeaflet_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动简介',
                content: [
                    { type: 'text', value: '为迎接六一儿童节，让孩子们更好地感受节日气氛，xx成长教育在六一儿童节当日举行大型儿童趣味活动。六一儿童节让孩子们一起来挑战，来闯关，现场还有更多神秘礼物等你来拿哦。' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            },
            {
                title: '活动流程',
                content: [
                    { type: 'text', value: '13:00-13:30 活动签到，领取专属号码牌。\n13:30-14:30 儿童才艺表演欣赏，包括儿童舞蹈、歌曲表演。\n14:30-15:00 趣味挑战赛，安排孩子和家长进行活动分组。\n15:00-17:00 趣味挑战活动，包括踩气球、跳绳、猜爸爸妈妈、亲子心连心、齐心协力吃果果、套圈、乒乓球。\n17:00-17:30 领取活动奖品。' },
                ]
            },
            {
                title: '活动须知',
                content: [
                    { type: 'text', value: '1. 6-15岁的小朋友均可参加，欢迎本机构学员家长邀请新的小朋友一起来玩。\n2. 在本页面点击“立即报名”按钮，填写孩子姓名，留正确联系方式，即可完成报名。\n3. 活动名额有限，先到先得。\n4. 老师收到报名信息后会尽快联系家长。\n5. 请家长陪同参加活动，活动期间孩子安全由家长自行负责。\n6. 本次活动承诺不收取任何费用。\n7. 本活动最终解释权归xxx所有。\n' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/miniLeaflet.png',
            title: '六一儿童节趣味活动邀请函',
            desc: '让孩子们一起来挑战，来闯关吧，现场还有更多神秘礼物等你来拿哦。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/summer_19': {
        type: 'add',
        basicInfo: {
            activityName: '暑期班开班啦，限时优惠200，老带新可叠加优惠',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/summer_19_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/summer_19_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n\n 暑期课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：7月15日-8月15日周一至周五9:00-18:00。' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。\n' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/summer_19.png',
            title: '暑期班开班啦，尽享特惠早鸟价',
            desc: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/thanksgiving_20': {
        type: 'add',
        basicInfo: {
            activityName: '学会感恩，与爱同行',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/thanksgiving_20.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/thanksgiving_20.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n\n 暑期课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：7月15日-8月15日周一至周五9:00-18:00。' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。\n' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/thanksgiving_20.png',
            title: '学会感恩，与爱同行',
            desc: '感恩节大促，惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/cow_21': {
        type: 'add',
        basicInfo: {
            activityName: '新年快乐，牛年大吉',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/cow_21.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/cow_21.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n\n 暑期课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：7月15日-8月15日周一至周五9:00-18:00。' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。\n' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/cow_21.png',
            title: '新年快乐，牛年大吉',
            desc: '牛年大促，惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/laba_20': {
        type: 'add',
        basicInfo: {
            activityName: '过了腊八就是年',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/laba_20.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/laba_20.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n\n 暑期课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：7月15日-8月15日周一至周五9:00-18:00。' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。\n' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/laba_20.png',
            title: '过了腊八就是年',
            desc: '腊八节大促，惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/newYear_20': {
        type: 'add',
        basicInfo: {
            activityName: '元旦快乐',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/newYear_20.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/newYear_20.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n\n 暑期课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：7月15日-8月15日周一至周五9:00-18:00。' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。\n' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/newYear_20.png',
            title: '元旦快乐',
            desc: '元旦大促，惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/flight': {
        type: 'add',
        basicInfo: {
            activityName: '麦兜儿童成长中心为抗疫人员子女免费送福利',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/flight_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/flight_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        flight: true, //抗疫情特殊处理
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '福利介绍',
                content: [
                    { type: 'text', value: '凡本市支援湖北抗疫一线的医护人员子女，可免费领取机构任意一门课程40课时，价值*****元。\n凡本市抗疫一线的医护人员子女，可免费领取机构任意一门课程20课时，价值****元。\n凡本市一线公安、消防、环卫、社区等抗疫人员子女，可免费领取机构任意一门课程10课时，价值****元。\n所有课程有效截止时间：2020年12月31日。\n数量有限，限量200名，领完即止。' },
                ]
            },
            {
                title: '领取方式',
                content: [
                    { type: 'text', value: '1.领取时间：2月1日-3月31日\n2.联系电话：05716823688\n3.校区地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松地学习，采用师生优化配对，根据学员年龄、性格等特征推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
                    { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/flight.png',
            title: '致敬最美逆行者：麦兜儿童成长中心为抗疫人员子女免费送福利',
            desc: '新型冠状病毒面前，你们用生命守护我们，我们用真心守护孩子的成长。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/interestSummer': {
        type: 'add',
        basicInfo: {
            activityName: '暑期班开班啦，限时优惠200，老带新可叠加优惠',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/interestSummer_bg.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/interestSummer_bg.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。\n通过此链接报名成功后，6月1日-6月10日到机构报名，所有暑期课程立减200元。\n\n暑期课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：7月15日-8月15日周一至周五9:00-18:00' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：6月1日-6月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            address: false,
            nickname: false,
            sex: false,
            parentname: false,
            schoolname: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/interestSummer.png',
            title: '暑期班开班啦，尽享特惠早鸟价',
            desc: '麦兜儿童成长中心暑期班开班，喜迎暑假，惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'leaflet/schoolStart': {
        type: 'add',
        basicInfo: {
            activityName: '麦兜儿童成长中心春耕计划开始啦！限时优惠200',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            coverImg: 'https://cdn.yizhiniao.com/leaflet/schoolStart.png', //封面图
            coverImginit: 'https://cdn.yizhiniao.com/leaflet/schoolStart.png',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '', //机构电话
        },
        activityDesShow: 0, //展示的模板序号
        referralSwitch: 0, //转介绍开关
        activityRule: "1.新学员表示在机构从未报课的学员，之前已经报课的老学员不计入有效邀请。\n2.好友需通过你的邀请链接或者邀请卡参与活动才会计入有效邀请。\n3.转发至朋友圈集满88个赞后，直接截图给机构，领取奖励。\n4.活动结束后，邀请10个新学员成功参与活动，会有专属老师与您联系确认个人成绩，并和你协商领取福利。\n5.转介绍成功福利会在邀请的新学员首次报名成功后，完成发放。",
        prizeBigIntro: [
            { type: 'text', value: '1.转发邀请卡至朋友圈，集满88个赞，即可获得价值88元精美书包一个。\n2.邀请10位新学员成功参与活动，即可获得价值168元蛋壳拉杆箱一个。\n3.转介绍成功福利：每一个邀请的新学员完成首次报课，推荐人即可获得200元优惠券一张。' },
        ],
        activityDes: [ //活动说明
            {
                title: '活动介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心春耕计划开始啦！惠价来袭。赶快来报名吧。\n通过此链接报名成功后，4月1日-4月10日到机构报名，所有课程立减200元。\n\n课程包括中国舞、主持班、声乐班、美术班、拼音班。\n上课时间：4月1日-6月30日每周六周日9:00-18:00' },
                ]
            },
            {
                title: '报名方式',
                content: [
                    { type: 'text', value: '报名成功后，请于活动期间内联系本机构优惠抢购。\n1.活动时间：4月1日-4月10日\n2.联系电话：05716823688\n3.联系地址：浙江省杭州市上城区江城路889号' },
                ]
            },
            {
                title: '机构介绍',
                content: [
                    { type: 'text', value: '麦兜儿童成长中心创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
                ]
            }
        ],
        appoinInfo: { //报名信息
            address: false,
            nickname: false,
            sex: false,
            parentname: false,
            schoolname: false,
        },
        advancedSetting: { //高级设置
            peoMax: false, //开启报名学员上限
            peoMaxNum: 0, //报名学员上限人数
            peoLimit: false, //开启新老学员报名限制
            peoLimitType: 1, //仅允许未签约的学员参与活动报名
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/leaflet/schoolStart.png',
            title: '麦兜儿童成长中心春耕计划开始啦！限时优惠200',
            desc: '麦兜儿童成长中心春耕计划开始啦！惠价来袭。赶快来报名吧。',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'makeappointment/spring': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '',
            startTime: '',
            endTime: '',
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            }
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        teacherInfo: [
            { imgsrc: 'templates/show_template/makeappointment/spring/img/teacher_header.png', introduce: '张老师毕业于杭州师范大学音乐学员钢琴专业，基本功扎实，具备良好的演奏技能，演出和教学经历丰富。有8年的教学经验，国家四级演奏员，对学生有爱心、有耐心和亲和力。' },
            { imgsrc: 'templates/show_template/makeappointment/spring/img/teacher_header.png', introduce: '张老师毕业于杭州师范大学音乐学员钢琴专业，基本功扎实，具备良好的演奏技能，演出和教学经历丰富。有8年的教学经验，国家四级演奏员，对学生有爱心、有耐心和亲和力。' },
        ],
        showCourseList: [
            { experienceCourseName: '钢琴', experienceCourseImageUrl: 'templates/show_template/makeappointment/spring/img/course_lis1.png' },
            { experienceCourseName: '尤克里里', experienceCourseImageUrl: 'templates/show_template/makeappointment/spring/img/course_lis2.png' },
            { experienceCourseName: '萨克斯', experienceCourseImageUrl: 'templates/show_template/makeappointment/spring/img/course_lis3.png' },
            { experienceCourseName: '爵士鼓', experienceCourseImageUrl: 'templates/show_template/makeappointment/spring/img/course_lis4.png' },
        ],
        appoinInfo: {
            address: false,
            nickname: false,
            sex: false,
            parentname: false,
            schoolname: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'http://test.cdn.chosien.com/oa_37_1516693565080_picture',
            title: 'XXX大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/redEnvelopesMonster': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/redEnvelopesMonster/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/redEnvelopesMonster.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/dog': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dog/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/dog.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/summer': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/summer/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/summer.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/summerBargain': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/summerBargain/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/summerBargain.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/parenting': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/parenting/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/parenting.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/dandelion': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dandelion/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/dandelion.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/woodpecker': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/woodpecker/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/woodpecker.png',
            title: 'XX教育培训大促',
            desc: '小树生病了,请帮帮她捉捉小虫子!!',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/shell': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/shell/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/shell.png',
            title: 'XX教育培训大促',
            desc: '海边拾贝',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/autumnRecruit': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/autumnRecruit/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/autumnRecruit.png',
            title: 'XX教育培训大促',
            desc: '秋招大优惠',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/chicks': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/chicks/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/chicks.png',
            title: 'XX教育培训大促',
            desc: '母鸡咯咯咯',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/ricecutting': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/ricecutting/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/ricecutting.png',
            title: 'XX教育培训大促',
            desc: '割稻子咯~',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/midAutumn': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/midAutumn/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/midAutumn.png',
            title: 'XX教育培训大促',
            desc: '花好月圆,欢聚中秋~',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/nationalDay': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/nationalDay/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/nationalDay.png',
            title: 'XX教育培训大促',
            desc: '喜迎国庆节',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/dance': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dance/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/dance.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/double12': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/double12/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/double12.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/christmas': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/christmas/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/christmas.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/elevenx2': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/elevenx2/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/elevenx2.png',
            title: 'XX教育培训大促',
            desc: '双11火爆来袭',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/halloween': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '万圣节狂欢，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/halloween/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/halloween.png',
            title: '万圣节狂欢，最低仅需600元',
            desc: '狂欢万圣节',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/thanksgiving': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/thanksgiving/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/thanksgiving.png',
            title: 'XX教育培训大促',
            desc: '感恩有礼，优惠不断！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/greatbegin': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/greatbegin/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/greatbegin.png',
            title: 'XX教育培训大促',
            desc: '新年有礼，优惠不断！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/springcut_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/springcut_19/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/springcut_19.png',
            title: 'XX教育培训大促',
            desc: '新年有礼，优惠不断！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/dance_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dance_19/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/dance_19.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/hipHop': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/hipHop/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/hipHop.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/music': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/music/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/music.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/dragonfestival': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dragonfestival/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/dragonfestival.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/twelvex2_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '嗨购双12',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/twelvex2_19/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/twelvex2_19.png',
            title: 'XX教育培训双十二大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/thanksgiving_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '感恩有你',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/thanksgiving_20.png',
            title: '感恩有你',
            desc: '感恩节优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/goddess_21': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '女神节快乐',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/goddess_21.png',
            title: '女神节快乐',
            desc: '女神节优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/laba_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '一碗腊八粥，幸福绕心头',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/laba_20.png',
            title: '一碗腊八粥，幸福绕心头',
            desc: '腊八节优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/newYear_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '元旦快乐',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/newYear_20.png',
            title: '元旦快乐',
            desc: '元旦优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/christmas_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '欢乐圣诞',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/christmas_19/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/christmas_19.png',
            title: 'XX教育培训圣诞节大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/schoolBegin': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dragonfestival/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/schoolBegin.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/midAutumn_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/dragonfestival/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/midAutumn_19.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/summer_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/summer_19/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/summer_19.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/NewYear': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/NewYear/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/NewYear.png',
            title: 'XX教育培训大促',
            desc: '新年有礼，优惠不断！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/laborDay51': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/laborDay51/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/laborDay51.png',
            title: 'XX教育培训大促',
            desc: '五一有礼，优惠不断！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'bargain/nationalDay_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，最低仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程，最低仅需600元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            prizeEndTime: '',
            originalPrice: 1200,
            floorPrice: 600,
            totalNumber: 50,
            selfNumber: 1,
            friendNumber: 1,
            activityRule: '1. 点击上方“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙砍价哦。\n2. 点击好友分享页面进入后，点击“帮TA砍价”即可帮忙好友砍价。帮忙后点击“我要参加”即可自己参加游戏。\n3. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n4. 本活动新老学员不限。\n5. 每位学员只能参加一次，如多个账号报名，不累计。\n6. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/bargain/laborDay51/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/bargain/nationalDay_19.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧！',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/turntable': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/turntable/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/turntable.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/twelvex2': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/twelvex2/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/twelvex2.png',
            title: 'XX教育培训大促',
            desc: '双12血拼到底!!赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/christmas_help': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/christmas_help/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/christmas_help.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断!!赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/newYear': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/newYear/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/newYear.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断!!赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/painting_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/painting_19/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/painting_19.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断!!赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/greatbegin': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于2000年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/greatbegin/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/greatbegin.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断!!赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/fishing': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/fishing/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'XX成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/fishing.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/gashapon': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/gashapon/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/gashapon.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/bear': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/bear/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/bear.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'help/radish': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，学费仅需600元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程10节（40份）★★★\n原价1200元的暑期芭蕾舞课程仅需600元，助力成功即可领取。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共10次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            num: 40,
            originalPrice: 1200, //原价
            floorPrice: 600,
            totalNumber: 100,
            selfNumber: 5,
            activityRule: '1. 直接点击“我要参加”，即可自己报名参加游戏哦。参与活动后，记得邀请好友帮忙助力哦。\n2. 点击好友分享页面进入后，点击“帮TA助力”即可帮忙好友助力。帮忙后点击“我要参加”即可自己参加游戏。\n3. 助力成功后方可领奖。数量有限，先到先得哦。\n4. 奖品领取有效期截止至xx月xx日，有效期内，需联系本校区或者到店领取奖品。数量有限，先到先得。\n5. 本活动新老学员不限。\n6. 每位学员只能参加一次，如多个账号报名，不累计。\n7. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/help/radish/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/help/radish.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/flicker': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/flicker/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/flicker.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/nationalDay': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/flicker/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/nationalDay.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/spell11': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/spell11/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/spell11.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/spell12': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/spell12/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/spell12.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/christmas': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/spell12/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/christmas.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/christmas2': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/spell12/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/christmas2.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/pigyear': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/spell12/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/pigyear.png',
            title: 'XX教育培训大促',
            desc: '猪年大吉，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/goodStart': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/goodStart.png',
            title: 'XX教育培训大促',
            desc: '开门红，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/springRecruit': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/springRecruit/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/springRecruit.png',
            title: 'XX教育培训大促',
            desc: '春招，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/childrenDay': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/childrenDay.png',
            title: 'XX教育培训大促',
            desc: '六一儿童节，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/elevenx2_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/elevenx2_19.png',
            title: 'XX教育培训大促',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/newYear_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '喜迎元旦',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/newYear_20/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/newYear_20.png',
            title: '喜迎元旦',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/mouseYear_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '鼠年大吉',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/mouseYear_20/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/mouseYear_20.png',
            title: '鼠年大吉',
            desc: 'XX招生优惠不断，赶快来报名吧',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/summer': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/summer.png',
            title: 'XX教育培训大促',
            desc: '暑假班，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/hiphop': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/hiphop.png',
            title: 'XX教育培训大促',
            desc: '暑假班，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/tennis': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期网球班课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期网球班课程3节（30份）★★★\n原价360元的暑期网球班课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/tennis.png',
            title: 'XX教育培训大促',
            desc: '网球班，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/dragonDay_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '端午节大促！拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期网球班课程3节（30份）★★★\n原价360元的暑期网球班课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/dragonDay_20/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/dragonDay_20.png',
            title: 'XX教育培训大促',
            desc: '端午节大促，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/thanksgiving_20': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '一路走来，感恩有你',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期网球班课程3节（30份）★★★\n原价360元的暑期网球班课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/thanksgiving_20.png',
            title: '一路走来，感恩有你',
            desc: '感恩节大促，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/cow_21': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '福牛闹春，牛气冲天',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期网球班课程3节（30份）★★★\n原价360元的暑期网球班课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/makeappointment/spring/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/cow_21.png',
            title: '福牛闹春，牛气冲天',
            desc: '新春大促，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/welcome': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/welcome.png',
            title: 'XX教育培训大促',
            desc: '暑假班，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
    'group/midAutumn_19': {
        type: 'add',
        basicInfo: { //基础信息
            activityName: '抢暑期芭蕾舞课程，拼团价仅需9.9元',
            startTime: $.format.date(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            endTime: $.format.date(getNextMonth_(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            musicType: '0', //是音乐库的还是自定义的
            musicUrl: '', //自定义的音乐
            bacMusic: { //音乐库的音乐
                musicUrl: '',
                musicId: '',
                musicName: '',
            },
            telephone: '',
        },
        prizeInfo: {
            course: [],
            goods: [],
            describeList: [
                { type: 'text', value: '★★★暑期芭蕾舞课程3节（30份）★★★\n原价360元的暑期芭蕾舞课程，3人成团，拼团价9.9元。新老学员可都参与活动。\n★★★上课时间★★★\n7月1日开始上课，每周日上课。共3次课。\n可选上课时间段：\n上午9:00-10:30\n下午14:00-15:30' }
            ],
            originalPrice: 0, //原价
            floorPrice: 9.9, //底价
            prepaymentFlag: false, //开启预付款
            prepayment: 0, //预付款
            viewFlag: true, //开启拼团列表
            totalNumber: 3, //一个团多少人
            selfNumber: 10, //多少个团
            groupLimit: false, //是否开启参团限制
            limitItems: 1, //参团限制选择
            activityRule: '1. 点击发起拼团或参与好友的拼团，即可报名参加活动。记得邀请好友一起来拼团哦。\n2. 提交报名信息并在线支付。若是预付款，线上先预付一定的费用，剩余费用线下补缴。\n3. 在活动效期内找到满足人数的好友参加拼团，即可算拼团成功。\n4. 若活动有效期内没有凑齐人数，即算作拼团失败，款项将自动原路退回。\n5. 拼团成功，课程自动完成购买，可以在“易知鸟”小程序中查看报读课程。\n6. 本活动新老学员不限。\n7. 每位学员只能参加一次，如多个账号报名，不累计。\n8. 本活动最终解释权归xxx所有。',
        },
        organInfo: [ //校区信息
            { type: 'text', value: 'XXX创办于1992年，专注于少年儿童的兴趣教育，致力于让孩子更快乐、更轻松的学习，采用师生优化配对，根据学员年龄、性格特点、等实际情况推荐合适的老师，制定适合学员的教学方案及辅导考级。' },
            { type: 'img', value: 'templates/show_template/group/goodStart/img/organ_lis.png' },
        ],
        appoinInfo: {
            sex: false,
            age: false,
            birthday: false,
            schoolname: false,
            gradle: false,
        },
        organ: {
            name: 'xx成长教育',
            phone: ['0571-85789582'],
            address: '杭州市上城区香榭商务大厦8楼8G',
            code: ''
        },
        shareInfo: {
            titlesrc: 'https://cdn.yizhiniao.com/group/midAutumn_19.png',
            title: 'XX教育培训大促',
            desc: '暑假班，优惠不断',
            url: shareHref_ + '/h5/show_template/'
        }
    },
}
window.h5_tempalteData = h5_tempalteData;

/*
 * 备注：2019-04-10
 * 深拷贝一份模板数据做草稿，当某个模板数据草稿改变则重新替换某个模板数据
 */
window.h5_tempalteData_VERSION = '1.0'; //手动添加的版本号，为了手动清除缓存草稿
if (localStorage.getItem('h5_tempalteData_VERSION') != window.h5_tempalteData_VERSION) {
    localStorage.setItem('h5_tempalteData_old', '');
    localStorage.setItem('h5_tempalteData_VERSION', window.h5_tempalteData_VERSION);
}

window.h5_tempalteData_new = JSON.parse(JSON.stringify(h5_tempalteData)); //标识新生成的模板数据
window.h5_tempalteData_old = localStorage.getItem('h5_tempalteData_old') ? JSON.parse(localStorage.getItem('h5_tempalteData_old')) : {}; //表示被预存的草稿的模板数据
if (window.h5_tempalteData_old) { //如果哪个模板数据被预存了草稿则把模板数据替换成草稿数据
    for (var obj in window.h5_tempalteData_old) {
        if (window.h5_tempalteData_old[obj]) window.h5_tempalteData_new[obj] = window.h5_tempalteData_old[obj];
    }
}
//限制输入只能是数字的方法，在input输入时调用
function inputLimit(this_) {
    this_.value = this_.value.replace(/[^\d]/g, "");
}

/*
 * 备注：2019-04-10
 * 预存草稿,利用数据深拷贝清除确认的模板信息
 * 当点击关闭弹框，检查需要存的模板数据是否和原来的数据一致，不一致则预存草稿
 * 
 */
function showDraft(data, obj, restore) {
    if (obj) {
        switch (restore) {
            case 0: //点击确认模板需要清除预存的草稿
                window.h5_tempalteData_new[obj] = JSON.parse(JSON.stringify(window.h5_tempalteData[obj])); //数据深拷贝
                delete window.h5_tempalteData_old[obj]; //删除草稿信息
                localStorage.setItem('h5_tempalteData_old', JSON.stringify(window.h5_tempalteData_old));
                break;
            case 1: //token过期无确认弹框自动保存草稿
                if (data['isEdit']) { //判断模板是否被编辑过
                    if (data.type == 'add' || data.type == 'copy') { //如果是新增或者拷贝的数据可存草稿
                        data['isEdit'] = undefined; //重置编辑状态
                        window.h5_tempalteData_new[obj] = data;
                        window.h5_tempalteData_new[obj]['shareInfo']['url'] = shareHref_ + '/h5/show_template/'; //重置分享链接
                        window.h5_tempalteData_old[obj] = window.h5_tempalteData_new[obj];
                        localStorage.setItem('h5_tempalteData_old', JSON.stringify(window.h5_tempalteData_old));
                    }
                }
                break;
            default: //弹框确认保存草稿或者取消删除草稿
                // if(data['isEdit'] && data['type'] != 'edit') {   //判断模板是否被编辑过
                //     detailMsk('放弃编辑，编辑内容将会丢失，是否需要保存草稿？<bar><p style="color: #F6B352; line-height: 40px;">注：保存后，下次选择该模板，创建活动时，可继续编辑</p>', function() {  //确认弹框
                //         if(data.type == 'add' || data.type == 'copy') {   //如果是新增或者拷贝的数据可存草稿
                //             data['isEdit'] = undefined;    //重置编辑状态
                //             window.h5_tempalteData_new[obj] = data;
                //             window.h5_tempalteData_new[obj]['shareInfo']['url'] = shareHref_ + '/h5/show_template/';    //重置分享链接
                //             window.h5_tempalteData_old[obj] = window.h5_tempalteData_new[obj];
                //             localStorage.setItem('h5_tempalteData_old', JSON.stringify(window.h5_tempalteData_old));
                //         }
                //     }, function() { //取消保存
                //         window.h5_tempalteData_new[obj] = JSON.parse(JSON.stringify(window.h5_tempalteData[obj]));  //数据深拷贝
                //         delete window.h5_tempalteData_old[obj]; //删除草稿信息
                //         localStorage.setItem('h5_tempalteData_old', JSON.stringify(window.h5_tempalteData_old));
                //     }, ['保存草稿', '放弃编辑']);
                // }
                break;
        }
    }
};