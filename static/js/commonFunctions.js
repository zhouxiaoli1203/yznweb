/**
 * 全局公共方法
 * Created by mingzhizeng on 2017/6/13.
 */

"use strict";
var dialog, dialogArr = [];
window.dialog = dialog;
window.dialogArr = dialogArr;
//截获exception并上报服务器
window.onerror = function (errorMessage, scriptURI, lineNumber, columnNumber, errorObj) {
    // {"errorMessage":"Script error.","scriptURI":"","lineNumber":0,"columnNumber":0,"errorObj":null}
    // 这样的异常不清楚是什么情况产生的，暂时也查不到什么原因，暂时不上报这类异常
    var stack = {
        errorMessage: errorMessage,
        scriptURI: scriptURI,
        lineNumber: lineNumber,
        columnNumber: columnNumber,
        errorObj: errorObj
    };

    var jsLog = {
        shopId: localStorage.getItem('shopId'),
        oAuserId: localStorage.getItem('accountId'),
        stack: JSON.stringify(stack),
        url: window.location.href
    };

    commitJsException(jsLog);

}

/**
 * 统一解析“yyyy-MM-dd'T'HH:mm:ss.SS:SZ”格式的时间
 * @param 时间字符串
 * @returns Date
 */
//左侧导航 收回 拉出动作
function showHideMenu(mode) {
    var page = $('#page-container');
    if (mode == 'tag' || mode == undefined) {
        if (page.hasClass('sidebar-visible-lg-full')) {
            $('.sidebar-big').css('position', 'static');
            $('.sidebar-title').css({
                'width': '100%',
                //              'padding': '0 8px'
            });
            $('.sidebar-title').addClass("rehide");
            $('.sidebar-nav-li').addClass("rehide");
            $('#sidebar-footer').addClass("rehide");
            page.removeClass('sidebar-visible-lg-full').addClass('sidebar-visible-lg-mini');
        } else {
            $('.sidebar-big').css('position', 'fixed');
            $('.sidebar-title').css({
                'width': '200px',
                //              'padding': '0 23px'
            });
            $('.sidebar-title').removeClass("rehide");
            $('.sidebar-nav-li').removeClass("rehide");
            $('#sidebar-footer').removeClass("rehide");
            page.removeClass('sidebar-visible-lg-mini').addClass('sidebar-visible-lg-full');
        }
    } else if (mode == 'open') {
        $('.sidebar-big').css('position', 'fixed');
        $('.sidebar-title').css({
            'width': '200px',
            //          'padding': '0 23px'
        });
        $('.sidebar-title').removeClass("rehide");
        $('.sidebar-nav-li').removeClass("rehide");
        $('#sidebar-footer').removeClass("rehide");
        page.removeClass('sidebar-visible-lg-mini').addClass('sidebar-visible-lg-full');
    } else {
        $('.sidebar-big').css('position', 'static');
        $('.sidebar-title').css({
            'width': '100%',
            //          'padding': '0 8px'
        });
        $('.sidebar-title').addClass("rehide");
        $('.sidebar-nav-li').addClass("rehide");
        $('#sidebar-footer').addClass("rehide");
        page.removeClass('sidebar-visible-lg-full').addClass('sidebar-visible-lg-mini');
    }
};

// 分页
function Initpager(el, fn, localName) {
    this.init = function () {
        this.start = 0;
        this.count = localName ? (localStorage.getItem(localName) ? localStorage.getItem(localName) : 10) : 10;
        this.render = false;
        return this;
    }
    this.pagi_init = function (fl, total) { //(fl == true || fl == false && total)初始化分页  (fl == false && !total) 刷新数据且不初始化
        var this_ = this;
        if (fl) return fn(this_.init());
        if (!fl && (!total && total !== 0)) return fn(this_);
        if (this_.render) return;
        this_.render = true;
        $(el).pagination({
            totalData: total || 0, // 数据总条数
            showData: this_.count, // 显示几条数据
            jump: true,
            coping: true,
            count: 2, // 当前页前后分页个数
            homePage: '首页',
            endPage: '末页',
            prevContent: '上页',
            nextContent: '下页',
            callback: function (api) {
                if (api.getCurrentEach() != this_.count) { //本地存储记下每页多少条
                    this_.count = api.getCurrentEach();
                    if (localName) {
                        localStorage.setItem(localName, this_.count);
                    }
                }
                this_.start = (api.getCurrent() - 1) * (this_.count);
                fn(this_);
            }
        });
        return this;
    }
}

//获取所需时间
function getNeedTime(timeBeg, timeEnd, week) {
    var y = $.format.date(timeBeg, 'yyyy-MM-dd');
    var b = $.format.date(timeBeg, 'HH:mm');
    var e = $.format.date(timeEnd, 'HH:mm');
    var t = '';
    if (week) {
        var w = returnweek(week);
        t = y + ' ( ' + w + ' )  ' + b + '-' + e;
    } else {
        t = y + '  ' + b + '-' + e;
    }
    return t;
};

function parseDate(dateStr) {
    var date = yznDateParse(dateStr);
    return date;
}

function digit(num) {
    return num < 10 ? "0" + (num | 0) : num;
}

function checkAuthMenuById(authMenuId) {

    if (!window.currentUserInfo || !window.currentUserInfo.authMenus) {
        return false;
    }
    for (var i = 0; i < window.currentUserInfo.authMenus.length; ++i) {
        if (window.currentUserInfo.authMenus[i].authMenuId == authMenuId) {
            return true;
        }
    }

    return false;
}

//生成唯一id
function GenNonDuplicateID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36)
}

//判断是否显示顾问过滤条件，如果只是普通顾问只能看到自己的潜客不能选择查看其它顾问的潜客
function CheckShowConsultantSelect() {
    var quarters = JSON.parse(localStorage.getItem("quarters"));
    var isPrsent = false;
    var isConsultent = false;
    var isConsultentManager = false;
    for (var m in quarters) {
        if (quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.PRESENT_ID) {
            isPrsent = true;
        }
        if (quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.CONSULTANT_ID) {
            isConsultent = true;
        }
        if (quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.CONSULTANT_MANAGER_ID) {
            isConsultentManager = true;
        }
    }

    if (isConsultent && !isConsultentManager && !isPrsent) {
        return false;
    }
    return true;
}

//是否是校长
function isPresent() {
    var quarters = JSON.parse(localStorage.getItem("quarters"));
    for (var m in quarters) {
        if (quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.PRESENT_ID ||
            quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.VICE_PRESENT_ID) {
            return true;
        }
    }
    return false;
}

//是否是校长 副校长  财务
function isPresentOrFinancial() {
    var quarters = JSON.parse(localStorage.getItem("quarters"));
    for (var m in quarters) {
        if (quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.PRESENT_ID ||
            quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.VICE_PRESENT_ID ||
            quarters[m].quartersTypeId == CONSTANT.QUARTERSTYPE.FINANCIAL_ID) {
            return true;
        }
    }
    return false;
}

function getCurrentShopType() {
    var shopId = localStorage.getItem("shopId");
    var myShops = JSON.parse(localStorage.getItem("loginShopInfos"));
    for (var m in myShops) {
        if (myShops[m].shopId == shopId) {
            return myShops[m].shopType;
        }
    }

    return '';
}

function commitJsException(eLog) {
    if (eLog.shopId === 'undefined') {
        delete eLog.shopId;
    }
    //TODO QQBrowser有bug暂时不上报这个异常

    if (eLog.stack
        && (eLog.stack.indexOf("Cannot read property 'getBoundingClientRect' of undefined") !== -1 ||
            eLog.stack.indexOf("Uncaught TypeError: Cannot read property 'tagName' of undefined") !== -1)
        && navigator.userAgent.indexOf("QQBrowser") != -1) {
        return;
    }
    eLog.userAgent = navigator.userAgent;
    var jsExceptionData = {
        url: CONFIG.URL + "/api/oa/commitJsException",
        type: "post",
        contentType: "application/json;charset=UTF-8",
        headers: {
            "token": localStorage.getItem('oa_token')
        },
        data: JSON.stringify(eLog),
    };
    $.ajax(jsExceptionData);
}

//获取学年列表今年前一年 今年  今年往后+2年
function getYears(name) {
    var arr = [];
    var s = yznDateFormat(new Date(), "yyyy") * 1 - 1;
    var l = 4;

    for (var i = 0; i < 4; i++) {
        if (name) {
            arr.push({year: s + i});
        } else {
            arr.push(s + i);
        }
    }
    return arr;
}

//今年以前1年，今年，后8年
function getSomeYears() {
    var arr = [];
    var s = yznDateFormat(new Date(), "yyyy") * 1 - 1;
    for (var i = 0; i < 10; i++) {
        arr.push(s + i);
    }
    return arr;
}

//从2017年到今年
function getFrom2017(name, num) {
    var arr = [];
    var s = 2017;
    var e = yznDateFormat(new Date(), "yyyy") * 1;
    var l = e - s + (num ? num * 1 : 0);

    for (var i = 0; i < l + 1; i++) {
        if (name) {
            arr.push({year: s + i});
        } else {
            arr.push(s + i);
        }
    }
    return arr;
}

//由于课程列表无法进行传值或过滤区分，统计页面的课程下拉筛选需要从地表组合
function getCourseFromTable(list, name, id) {
    var arr = [];
    angular.forEach(list, function (v) {
        arr.push({
            courseName: v[name],
            courseId: v[id]
        });
    });
    return arr;
}

//获取当月的第一天和最后一天
function getMonthFE(addMonth) {
    addMonth = addMonth || 0;

    var now = new Date(); //当前日期
    var nowDay = now.getDate(); //当前日
    var nowMonth = now.getMonth(); //当前月
    var nowYear = now.getFullYear(); //当前年
    var first = new Date(nowYear, nowMonth + addMonth, 1);
    var end = new Date(nowYear, nowMonth + addMonth, getMonthDays(nowMonth + addMonth));

    var f = yznDateFormatYMd(first);
    var l = yznDateFormatYMd(end);
    return {
        "firstDate": f,
        "endDate": l
    }
}

//获得某月的天数
function getMonthDays(myMonth) {
    var now = new Date(); //当前日期
    var nowYear = now.getFullYear(); //当前年
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
}

//处理时间 返回00:00
var initdatetime = function (date) {
    var datetime = yznDateFormat(date, "HH:mm");
    return datetime;
}

//处理时间 返回00:00
var datetimes = function (date) {
    var date_arr = date.split(':'), //截取时间段
        datetime = date_arr[0] + ':' + date_arr[1];
    return datetime;
}

//处理时间 返回0000-00-00
var initdate = function (date) {
    var dt = yznDateFormat(date, "yyyy-MM-dd"); //格式化日期
    return dt;
}

//获取本周周一 与周日日期
var Thismonday = function (e) {
    var now = new Date();
    var nowTime = now.getTime();
    var day = now.getDay();
    var oneDayTime = 24 * 60 * 60 * 1000;
    //显示周一
    var MondayTime = nowTime - (day - 1) * oneDayTime;
    //显示周日
    var SundayTime = nowTime + (7 - day) * oneDayTime;
    //初始化日期时间
    var monday = new Date(MondayTime).Format("yyyy-MM-dd");
    var sunday = new Date(SundayTime).Format("yyyy-MM-dd");

    return monday;
}

var Thissunday = function (e) {
    var now = new Date();
    var nowTime = now.getTime();
    var day = now.getDay();
    var oneDayTime = 24 * 60 * 60 * 1000;
    //显示周一
    var MondayTime = nowTime - (day - 1) * oneDayTime;
    //显示周日
    var SundayTime = nowTime + (7 - day) * oneDayTime;
    //初始化日期时间
    var monday = new Date(MondayTime).Format("yyyy-MM-dd");
    var sunday = new Date(SundayTime).Format("yyyy-MM-dd");

    return sunday;
}

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var Thisweekdate = function (e) {
    var now = new Date(e);
    var nowTime = now.getTime();
    var day = now.getDay();
    if (day == 0) {
        day = 7;
    }
    var oneDayTime = 24 * 60 * 60 * 1000;
    //显示周一
    var MondayTime = nowTime - (day - 1) * oneDayTime;
    //显示周日
    var SundayTime = nowTime + (7 - day) * oneDayTime;
    //初始化日期时间
    var monday = new Date(MondayTime).Format("yyyy-MM-dd");
    var sunday = new Date(SundayTime).Format("yyyy-MM-dd");
    console.log(monday + '到 ' + sunday);
    return monday + ' 到 ' + sunday;
}

//今天向后加一天  日期
var nextTodayDate = function (d, days) {
    var now = new Date(d);
    var nowTime = now.getTime();
    var oneDayTime = 24 * 60 * 60 * 1000 * (days ? (days - 1) : 1);
    if (days == 0) oneDayTime = 0; //月份为""
    var Time = nowTime + oneDayTime;
    var nextday = new Date(Time).Format("yyyy-MM-dd");
    return nextday
}

//获取n个月后的指定日期
function getNextMonth_(date, length, fl) {
    var yy = date.getFullYear();
    var mm = date.getMonth();
    var dd = date.getDate();
    var nm = 0; //目标月份
    nm = mm + (length * 1);
    var nd = 0 //目标天数
    if (fl && dd != 1) {
        date = nextTodayDate(date, length * 30)
    } else {
        if (monthDay_(yy, nm + 1) < dd) {
            nd = monthDay_(yy, nm + 1);
        } else {
            nd = dd - 1;
        }
        date.setDate(1)
        date.setMonth(nm)
        date.setDate(nd)
    }
    return date
}


//指定年月该月份的天数
function monthDay_(year, month) {
    month = parseInt(month, 10);
    var d = new Date(year, month, 0); //这个是都可以兼容的
    return d.getDate();
}

//获取两个日期之间的间隔天数
function getIntervalDays(date1, date2) {
    var date1Str = date1.split("-"); //将日期字符串分隔为数组,数组元素分别为年.月.日
    //根据年 . 月 . 日的值创建Date对象
    var date1Obj = new Date(date1Str[0], (date1Str[1] - 1), date1Str[2]);
    var date2Str = date2.split("-");
    var date2Obj = new Date(date2Str[0], (date2Str[1] - 1), date2Str[2]);
    var t1 = date1Obj.getTime();
    var t2 = date2Obj.getTime();
    var dateTime = 1000 * 60 * 60 * 24; //每一天的毫秒数
    var minusDays = Math.floor(((t2 - t1) / dateTime)); //计算出两个日期的天数差
    var days = Math.abs(minusDays); //取绝对值
    return days;
}

// 是否为本月最后一天
function isLastDay(dt) {
    var test = new Date(dt),
        month = test.getMonth();
    test.setDate(test.getDate() + 1);
    return test.getMonth() !== month;
}

//计算日期之间的月数
function getDatemonth(date1, date2) {
    if (!date1 || !date2) return;
    var m, temend = date2;
    if (new Date(date1).getDate() == 1) {
        // 拆分年月日
        date1 = date1.split('-');
        // 得到月数
        date1 = parseInt(date1[0]) * 12 + parseInt(date1[1]);
        // 拆分年月日
        date2 = date2.split('-');
        // 得到月数
        date2 = parseInt(date2[0]) * 12 + parseInt(date2[1]);
        m = Math.abs(date1 - date2);
        if (isLastDay(temend)) {
            m++;
        }
    } else {
        m = Math.floor((getIntervalDays(date1, date2) + 1) / 30);
    }
    m = m == 0 ? 1 : m;
    return m;
}

//选择时间公用控件计算起始时间差
function getMinutes_(time) {
    var bt = time.beginTime;
    var et = time.endTime;
    var bMins = parseInt(bt.substr(0, 2)) * 60 + parseInt(bt.substr(3, 4)),
        eMins = parseInt(et.substr(0, 2)) * 60 + parseInt(et.substr(3, 4));
    if (eMins <= bMins) {
        return 0;
    }
    return eMins - bMins;
}

//处理时间加减（type：1加，0减；num以五分钟为一个单位步长，val时间值）
var timeHandle_ = function (val, type, num) {
    var arr = val.split(":");
    var step = 5; //步长为5分钟
    if (num || num == 0) {
        step = step * num;
    }
    if (type == 1) {
        arr[1] = Number(arr[1]) + step;
        if (arr[1] < 10) {
            arr[1] = '0' + arr[1];
        }
        if (parseInt(arr[1] / 60) >= 0) {
            arr[0] = Number(arr[0]) + parseInt(arr[1] / 60);
            if (arr[0] < 10) {
                arr[0] = '0' + arr[0];
            }
            if (Number(arr[1]) % 60 >= 10) {
                arr[1] = Number(arr[1]) % 60;
            } else {
                arr[1] = '0' + (Number(arr[1]) % 60);
            }
        }
    } else {
        arr[1] = Number(arr[1]) - step;
        if (arr[1] < 0) {
            arr[1] = Math.abs(arr[1]);
            arr[0] = Number(arr[0]) - parseInt(arr[1] / 60) - 1;
            if (arr[0] < 10) {
                arr[0] = '0' + arr[0];
            }
            arr[1] = 60 - (arr[1] % 60);
            if (arr[1] < 10) {
                arr[1] = '0' + arr[1];
            }
        }
        if (arr[1] < 10) {
            arr[1] = '0' + arr[1];
        }
    }
    return arr.join(':');
}

//处理日期  返回周几
var initWeek = function (date) {

    var dt = yznDateParse(date);
    var weekDay = [7, 1, 2, 3, 4, 5, 6];
    return weekDay[dt.getDay()]; //返回某个时间是周几
}

//处理返回周几
var returnweek = function (week) {
    var we = parseInt(week);
    switch (we) {
        case 1:
            return "周一";
            break;
        case 2:
            return "周二";
            break;
        case 3:
            return "周三";
            break;
        case 4:
            return "周四";
            break;
        case 5:
            return "周五";
            break;
        case 6:
            return "周六";
            break;
        case 7:
            return "周日";
            break;
    }

}

//关系
function relation(re) {
    switch (re) {
        case "0":
            return "爸爸";
            break;
        case "1":
            return "妈妈";
            break;
        case "2":
            return "爷爷";
            break;
        case "3":
            return "奶奶";
            break;
        case "4":
            return "外公";
            break;
        case "5":
            return "外婆";
            break;
        case "6":
            return "阿姨";
            break;
        case "8":
            return "本人";
            break;
        default:
            return "其他";
            break;
    }
}

function relationTodata(re) {
    switch (re) {
        case "爸爸":
            return "0";
            break;
        case "妈妈":
            return "1";
            break;
        case "爷爷":
            return "2";
            break;
        case "奶奶":
            return "3";
            break;
        case "外公":
            return "4";
            break;
        case "外婆":
            return "5";
            break;
        case "阿姨":
            return "6";
            break;
        case "本人":
            return "8";
            break;
        default:
            return "7";
            break;
    }
}

function returnWeek(week) {
    if (week === undefined || week === null || week === "") {
        return;
    }
    var we = parseInt(week);
    switch (we) {
        case 1:
            return "星期一";
            break;
        case 2:
            return "星期二";
            break;
        case 3:
            return "星期三";
            break;
        case 4:
            return "星期四";
            break;
        case 5:
            return "星期五";
            break;
        case 6:
            return "星期六";
            break;
        case 0:
        case 7:
            return "星期日";
            break;
    }
}

function getMonthChinese() {
    var arr = [];
    for (var i = 1; i < 13; i++) {
        arr.push({value: i, name: changeToChinese(i) + "月"});
    }
    return arr;
}

function changeToChinese(c) {
    var arr = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
    return arr[c];
}

//确保数字两位数，不足两位前面补0
function getTwoDigits(s) {
    return s < 10 ? '0' + s : s;
}

//年月日 2017-06-06
function thisTime() {
    var myDate = new Date();
    //获取当前年
    var year = myDate.getFullYear();
    //获取当前月
    var month = myDate.getMonth() + 1;
    //获取当前日
    var date = myDate.getDate();
    var now = year + '-' + getTwoDigits(month) + "-" + getTwoDigits(date);
    return now;
}

function theTimeMd(thedate) {
    //获取当前月
    var month = yznDateFormat(thedate, 'MM') * 1;
    //获取当前日
    var date = yznDateFormat(thedate, 'dd') * 1;
    var now = month + "." + date;
    return now;
}

function theTimeMC(thedate) {
    //获取当前月
    var month = yznDateFormat(thedate, 'MM') * 1;
    var now = month + "月";
    return now;
}

//获取昨天   今天   明天日期
function GetDateStr(AddDayCount) {
    var dd = new Date();
    dd.setDate(dd.getDate() + AddDayCount); //获取AddDayCount天后的日期
    return yznDateFormatYMd(dd);
}

//获取昨天   今天   明天日期
function GetMonthStr(AddMonthCount) {
    var dd = new Date();
    dd.setMonth(dd.getMonth() + 1 + AddMonthCount);
    return yznDateFormatYM(dd);
}

//时间戳   合同编号20170621100110
var ZContractnumber;
var ZJnoow = '';
var timestamp = function () {
    var myDate = new Date();
    //	ZContractnumber=myDate;
    //获取当前年
    var year = myDate.getFullYear();
    //获取当前月
    var month = myDate.getMonth() + 1;
    //获取当前日
    var date = myDate.getDate();
    var h = myDate.getHours(); //获取当前小时数(0-23)
    var m = myDate.getMinutes(); //获取当前分钟数(0-59)
    var s = myDate.getSeconds();
    ZContractnumber = ZJnoow;
    ZJnoow = '' + year + getTwoDigits(month) + getTwoDigits(date) + getTwoDigits(h) + getTwoDigits(m) + getTwoDigits(s);
    if (ZContractnumber == ZJnoow) {
        ZJnoow++;
    }
    return ZJnoow;
}

//处理时间 返回xxxxaabb
var yearmonthday = function (date) {
    var date_arr = date.split('-'), //截取时间段
        datetime = (date_arr[0]) + (date_arr[1]) + (date_arr[2]);
    return datetime;
}

/*
 * 月初完整 日期
 */
var monthDate = function () {
    var myDate = new Date();
    //获取当前年
    var year = myDate.getFullYear();
    //获取当前月
    var month = myDate.getMonth() + 1;
    var now = year + '-' + getTwoDigits(month) + "-" + '01';
    return now;
}

/*
 * 月 日期
 */
var monthDateBig = function () {
    var myDate = new Date();
    //获取当前年
    var year = myDate.getFullYear();
    //获取当前月
    var month = myDate.getMonth() + 1;
    var now = year + '-' + getTwoDigits(month);
    return now;
}
String.prototype.isEmpty = function () {
    if (this.length == 0 || this.replace(/(^\s*)|(\s*$)/g, "") == "") {
        return true;
    } else {
        return false;
    }
};

function slideOut() {
    $('.sideslip').css({
        'transform': 'translate(0, 0)',
        'box-shadow': '0 0 15px #8C8C8C'
    });
}

function slideOut1() {
    $('.sideslip1').css({
        'transform': 'translate(0, 0)',
        'box-shadow': '0 0 15px #8C8C8C'
    });
}

//侧滑页  收回
function slideBack() {
    $('.sideslip').css({
        'transform': 'translate(610px, 0)',
        'box-shadow': 'none'
    });
    $("body").find('.table-hover>tbody>tr').removeClass("actived");
}

function slideBack1() {
    $('.sideslip1').css({
        'transform': 'translate(610px, 0)',
        'box-shadow': 'none'
    });
    $("body").find('.table-hover>tbody>tr').removeClass("actived");
}

//弹框  560px宽度
function layerOpen($locking, title) {
    dialog = layer.open({
        type: 1,
        title: title,
        skin: 'layerui', //样式类名
        closeBtn: 1, //不显示关闭按钮
        move: false,
        anim: 0,
        area: '560px',
        offset: '30px',
        shadeClose: false, //开启遮罩关闭
        content: $('.' + $locking),
    })
    if ($('.screen_menu')) {
        $('.screen_menu').width(200);
    }
}

//弹框  720px宽度
function Bombbox($locking, title) {
    dialog = layer.open({
        type: 1,
        title: title,
        skin: 'layerui', //样式类名
        closeBtn: 1, //不显示关闭按钮
        move: false,
        anim: 0,
        area: '720px',
        offset: '30px',
        shadeClose: false, //开启遮罩关闭
        content: $('.' + $locking)
    })
}

//以下是弹框页面的处理(fn：弹框加载完成后调用的方法，fn2弹框关闭后调用的方法)
function openPopByDiv(title, div, width, fn, fn2) {
    var obj = {};
    var myDialog;
    myDialog = layer.open({
        type: 1,
        title: title ? title : false,
        skin: 'layerui', //样式类名
        closeBtn: title ? 1 : 0, //不显示关闭按钮
        move: false,
        resize: false,
        anim: 0,
        area: width ? width : '560px',
        offset: '30px',
        shadeClose: false, //开启遮罩关闭
        content: $(div),
        success: function (layero) {
            if (fn) fn(layero);
        },
        cancel: function (index, layero) {
            // dialogArr.pop();    //当关闭了一个弹框则去掉一个弹框对象
            // if(dialogArr.length > 0) dialog = dialogArr[dialogArr.length - 1]['dialog'];
            // if(fn2)fn2(layero);
        },
        end: function () {
            console.log("###end=" + myDialog);
            if (dialog == myDialog) { //如果关闭的是当前的弹框
                dialogArr.pop(); //当关闭了一个弹框则去掉一个弹框对象
                if (dialogArr.length > 0) {
                    dialog = dialogArr[dialogArr.length - 1]['dialog'];
                } else {
                    dialog = undefined;
                }
                if (fn2) fn2();
            }
        }

    });
    dialog = myDialog;
    obj['dialog'] = dialog; //兼容之前的写法
    dialogArr.push(obj);
    if ($(div).find('.popup_scr')[0]) {
        $(div).find('.popup_scr')[0].style.top = '0px';
    }
}

//今天之前的日期不能选择（不包括今天）
function staffContrl(selector) {
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    $(selector).fdatepicker({
        format: 'yyyy-mm-dd',
        pickTime: false,
        onRender: function (date) {
            return date.valueOf() < now.valueOf() ? 'disabled' : "";
        }
    });
}

//今天之前的都不能选择 包括今天
function staffContr0(selector) {
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate() + 1, 0, 0, 0, 0);
    $(selector).fdatepicker({
        format: 'yyyy-mm-dd',
        pickTime: false,
        onRender: function (date) {
            return date.valueOf() < now.valueOf() ? 'disabled' : "";
        }
    });
}

//今天之后的日期不能选择(当天也不能选)
function staffContrlAfter(selector) {
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    $(selector).fdatepicker({
        format: 'yyyy-mm-dd',
        pickTime: false,
        onRender: function (date) {
            return now.valueOf() < date.valueOf() ? "disabled" : "";

        }
    });

}

//今天之后的日期不能选择(当天可以选)
function staffContrlAfterIsnotToday(selector) {
    var nowTemp = new Date();
    var now = new Date();
    $(selector).fdatepicker({
        format: 'yyyy-mm-dd',
        pickTime: false,
        onRender: function (date) {
            return now.valueOf() < date.valueOf() ? "disabled" : "";
        }
    });
}

function localStoreForLogin(data) {
    localStorage.setItem("userName", data.context.teacherName);
    localStorage.setItem("shopId", data.context.shopId);
    localStorage.setItem("oa_token", data.context.token);
    localStorage.setItem("accountId", data.context.teacherId);
    if (data.context.shop) {
        localStorage.setItem("compName", data.context.shop.shopName);
    }

    localStorage.setItem("quarters", JSON.stringify(data.context.quarters));
    localStorage.setItem("shopTeacherId", data.context.shopTeacherId);
    //预存校区信息
    var loginShopInfos = [];
    //校区端列表
    if (data.context.orgTeacherList) {
        angular.forEach(data.context.orgTeacherList, function (d, index) {
            var shopOrg = {};
            shopOrg.orgName = d.org.orgName;
            shopOrg.shopName = shopOrg.orgName;
            shopOrg.orgId = d.orgId;
            loginShopInfos.push(shopOrg);
        });
    }

    angular.forEach(data.context.oaLoginShopInfos, function (d, index) {
        loginShopInfos.push(d.shopOrg);
    });
    localStorage.setItem("loginShopInfos", JSON.stringify(loginShopInfos));
    localStorage.setItem("userPhone", data.context.teacherPhone);

    localStorage.setItem("currentUserInfo", JSON.stringify(data.context));
}

//通过生日返回年龄和月份
function getAgeMonthFromBirthday(birth) {
    var result = {age: 0, month: 0};
    if (typeof birth == 'undefined' || !birth) {
        return result;
    }
    var birthDate = yznDateParse(birth);
    var nowDate = new Date();
    //生日比当前时间大的直接返回
    if (nowDate.getTime() <= birthDate.getTime()) {
        return result;
    }
    var age = nowDate.getFullYear() - birthDate.getFullYear();
    var month = nowDate.getMonth() - birthDate.getMonth();

    if (nowDate.getDate() < birthDate.getDate()) {
        month -= 1;
    }

    if (month < 0) {
        age -= 1;
        month += 12;
    }
    result.age = age;
    result.month = month;

    return result;
}

// 计算年纪
function caclAge(birth) {
    return getAgeMonthFromBirthday(birth).age;
};

//6岁一下生日return成月
function caclAgeToMonth(birth) {
    return getAgeMonthFromBirthday(birth).month;
};

//6岁一下生日return年 月
function caclBirthToAge(strAge, birth, isOnlyAge) {
    var ageShow = "";
    if (!birth) {
        if (strAge) {
            return ageShow = strAge + "岁";
        } else {
            return ageShow = "-";
        }
    } else {
        var ymBirth = getAgeMonthFromBirthday(birth);
        //以上年龄小于等于6岁计算月
        if (ymBirth.age <= 6 && ymBirth.age >= 0) {
            if (isOnlyAge) {
                return ageShow = ymBirth.age + "岁";
            } else {
                return ageShow = ymBirth.age + "岁" + (ymBirth.month > 0 ? (ymBirth.month + "个月") : "");
            }
        } else {
            return ageShow = ymBirth.age + "岁";
        }
    }
}

//最近沟通时间 leaveTime(剩余时间)
function timeAgo(dateTime, leaveTime) {
    var time1 = yznDateParse(dateTime);
    var dateTimeStamp = time1.getTime();
    var minute = 1000 * 60; //把分，时，天，周，半个月，一个月用毫秒表示
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime(); //获取当前时间毫秒
    var diffValue = now - dateTimeStamp; //时间差
    var result = "";
    if (leaveTime) {
        diffValue = dateTimeStamp - now;
        if (diffValue < 0) {
            return {
                days: 0,
                hours: 0
            }
        }
    } else {
        if (diffValue < 0) {
            return "刚刚";
        }
    }
    var minC = diffValue / minute; //计算时间差的分，时，天，周，月
    var hourC = diffValue / hour;
    var dayC = diffValue / day;
    var weekC = diffValue / week;
    var monthC = diffValue / month;
    // if (dayC >= 1 && dayC <= 10) {
    //     result = " " + parseInt(dayC) + "天前"
    // } else if (hourC >= 1 && hourC <= 23) {
    //     if (time1.getDate() !== new Date(now).getDate()) {
    //         result = " " + "1天前"
    //     } else {
    //         result = " " + parseInt(hourC) + "小时前";
    //     }
    // } else if (minC >= 1 && minC <= 59) {
    //     result = " " + parseInt(minC) + "分钟前"
    // } else if (diffValue >= 0 && diffValue <= minute) {
    //     result = "刚刚";
    // } else {
    //     result = yznDateFormatYMdHm(dateTime);
    // }
    var days = getIntervalDays($.format.date(time1, 'yyyy-MM-dd'), $.format.date(new Date(), 'yyyy-MM-dd'));
    if (diffValue > 0) {
        if (days > 0) {
            result = days > 10 ? yznDateFormatYMdHm(dateTime) : (" " + days + "天前");
        } else {
            if (hourC >= 1 && hourC <= 23) {
                result = " " + parseInt(hourC) + "小时前";
            } else if (minC >= 1 && minC <= 59) {
                result = " " + parseInt(minC) + "分钟前"
            } else if (diffValue >= 0 && diffValue <= minute) {
                result = "刚刚";
            }
        }
    } else {
        result = yznDateFormatYMdHm(dateTime);
    }
    if (leaveTime) {
        return {
            days: parseInt(hourC / 24),
            hours: Math.floor(hourC % 24)
        };
    } else {
        return result;
    }
}

//teachers数组转换成str
function arrToStr(list, type, joint) {
    var str = "",
        join = joint || ',';
    if (list && list.length > 0) {
        angular.forEach(list, function (v) {
            if (type) {
                str += v[type] + join;
            } else {
                str += v + join;
            }
        });
        str = str.substr(0, str.length - 1);
    }
    return str;
}

//比较两个日期的大小
function CompareDate(d1, d2) {
    return ((new Date(d1.replace(/-/g, "\/"))) > (new Date(d2.replace(/-/g, "\/"))));
}

function CompareDateInequal(d1, d2) {
    return ((new Date(d1.replace(/-/g, "\/"))) >= (new Date(d2.replace(/-/g, "\/"))));
}

//var current_time = "2007-2-2 7:30";
//var stop_time = "2007-1-31 8:30";
//alert(CompareDate(current_time,stop_time));
//设置意愿时间 week  beginTime  endTime
function setAuditionDates(list) {
    var str = "";
    if (list.length > 0) {
        angular.forEach(list, function (v) {
            str += returnweek(v.week) + " " + v.beginTime + "-" + v.endTime + ",";
        });
    }
    str = str.substr(0, str.length - 1);
    return str;
}

function formatter(params, num) {
    var newParamsName = "";
    var paramsNameNumber = params.length;
    var provideNumber = num ? num : 4; //X轴标签设置容纳4个字符的宽度
    var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
    if (paramsNameNumber > provideNumber) {
        for (var p = 0; p < rowNumber; p++) {
            var tempStr = "";
            var start = p * provideNumber;
            var end = start + provideNumber;
            if (p == rowNumber - 1) {
                tempStr = params.substring(start, paramsNameNumber);
            } else {
                tempStr = params.substring(start, end) + "\n";
            }
            newParamsName += tempStr;
        }

    } else {
        newParamsName = params;
    }
    return newParamsName
}

//改变Y轴坐标的值标识
function tranNumber(num) {
    var numStr = num.toString();
    // 十万以内直接返回
    if (numStr.length < 5) {
        return numStr;
    }
    //大于8位数是亿
    else if (numStr.length > 8) {
        var decimal = numStr.substring(numStr.length - 8, numStr.length - 8);
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿';
    }
    //大于6位数是十万 (以10W分割 10W以下全部显示)
    else if (numStr.length > 5) {
        var decimal = numStr.substring(numStr.length - 4, numStr.length - 4)
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
    } else if (numStr.length == 5) {
        var decimal = numStr.substring(numStr.length - 3, numStr.length - 4)
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万';
    }
}

//最大位数加一  取整
function maxNum(data) {
    var len = data.toString().length - 2,
        da = data.toString().substring(0, 1) + 1,
        newmaxNum = Math.pow(10, len) * da;
    return newmaxNum;
}

//echarts计算柱状图间隔共用方法
function niceInterval(val, round) {
    var exponent = Math.floor(Math.log(val) / Math.LN10);
    var exp10 = Math.pow(10, exponent);
    var f = val / exp10; // 1 <= f < 10
    var nf;
    if (round) {
        if (f < 1.5) {
            nf = 1;
        } else if (f < 2.5) {
            nf = 2;
        } else if (f < 4) {
            nf = 3;
        } else if (f < 7) {
            nf = 5;
        } else {
            nf = 10;
        }
    } else {
        if (f < 1) {
            nf = 1;
        } else if (f < 2) {
            nf = 2;
        } else if (f < 3) {
            nf = 3;
        } else if (f < 5) {
            nf = 5;
        } else if (f < 6) {
            nf = 6;
        } else if (f < 8) {
            nf = 8;
        } else {
            nf = 10;
        }
    }
    val = nf * exp10;

    // Fix 3 * 0.1 === 0.30000000000000004 issue (see IEEE 754).
    // 20 is the uppper bound of toFixed.
    return exponent >= -20 ? +val.toFixed(exponent < 0 ? -exponent : 0) : val;
};
//计算统计图表tooltip的显示位置
// point: 鼠标位置
// contentSize: 提示dom 窗口大小
// viewSize: echarts 容器大小
function setTooltipPosition(point, params, dom, rect, size) {
    var tipWidth = point[0] + size.contentSize[0];
    if (tipWidth > size.viewSize[0]) {
        return [point[0] - 100, point[1] - size.contentSize[1]];
    } else if (point[0] < size.contentSize[0]) {
        return [point[0] - 10, point[1] + 20];
    } else {
        return point;
    }
}
//从CONSTANT文件生成数据列表
function getConstantList(list, sortNum) {
    var arr = []; //潜客来源列表
    if (sortNum !== undefined) {
        for (var i = 0; i < sortNum.length; i++) {
            var obj = {};
            obj.value = sortNum[i].toString();
            obj.name = list[sortNum[i]];
            arr.push(obj);
        }
    } else {
        for (var i in list) {
            var obj = {};
            obj.value = i;
            obj.name = list[i];
            arr.push(obj);
        }
    }
    return arr;
}

//判断是否有空字段
function judEmptyField(obj) {
    for (var i in obj) {
        if (!obj[i]) {
            return false;
        }
    }
    return true;
}

//去除空的字段（对象）
function detEmptyField(obj) {
    var newObj = {};
    for (var i in obj) {
        if (obj[i] || obj[i] === 0) {
            newObj[i] = obj[i];
        }
    }
    return newObj;
}

//去除空的字段（数组）
function detEmptyField_(arr) {
    var newArr = [];
    for (var i in arr) {
        if (arr[i] || arr[i] == 0) {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

//去除对象中不需要的字段
function detNeedField(obj, att) {
    var newObj = {};
    for (var i in obj) {
        if (i != att) {
            newObj[i] = obj[i];
        }
    }
    return newObj;
}

//判断约课是否开启
function getFunctionStatus(status) {
    $.hello({
        url: CONFIG.URL + "/api/oa/setting/getShop",
        type: "get",
        success: function (data) {
            if (data.status == '200') {
                window.currentUserInfo.shop.config = data.context.config;
            }
        }
    })
    return window.currentUserInfo.shop.config & status;
}

//判断dom节点是否有多余的文本未显示出来
function isEllipsis(dom) {
    var checkDom = dom.cloneNode(),
        parent, flag;
    checkDom.style.width = dom.offsetWidth + 'px';
    checkDom.style.height = dom.offsetHeight + 'px';
    checkDom.style.overflow = 'auto';
    checkDom.style.position = 'absolute';
    checkDom.style.zIndex = -1;
    checkDom.style.opacity = 0;
    checkDom.style.whiteSpace = "nowrap";
    checkDom.innerHTML = dom.innerHTML;

    parent = dom.parentNode;
    parent.appendChild(checkDom);
    flag = checkDom.scrollWidth > checkDom.offsetWidth;
    parent.removeChild(checkDom);
    return flag;
}

//把字符串时间转化为Date对象
function yznDateParse(value) {
    var dateStr = $.format.date(value, "yyyy/MM/dd HH:mm:ss");
    var date = new Date(dateStr);
    return date;
}

//时间格式转换封装函数
function yznDateFormat(value, format) {
    return $.format.date(value, format);
}

//转成yyyy-MM-dd HH:mm:ss
function yznDateFormatYMdHms(value) {
    return $.format.date(value, "yyyy-MM-dd HH:mm:ss");
}

//转成yyyy-MM-dd HH:mm
function yznDateFormatYMdHm(value) {
    return $.format.date(value, "yyyy-MM-dd HH:mm");
}

//转成yyyy年MM月dd日 HH:mm:ss
function yznDateFormatYMdHmsChinese(value) {
    return $.format.date(value, "yyyy年MM月dd日 HH:mm:ss");
}

//转成yyyy年MM月dd日 HH:mm
function yznDateFormatYMdHmChinese(value) {
    return $.format.date(value, "yyyy年MM月dd日 HH:mm");
}

//转成yyyy-MM-dd
function yznDateFormatYMd(value) {
    return $.format.date(value, "yyyy-MM-dd");
}

//转成yyyy-MM-dd
function yznDateFormatYM(value) {
    return $.format.date(value, "yyyy-MM");
}

//转成yyyy年MM月dd日
function yznDateFormatYMdChinese(value) {
    return $.format.date(value, "yyyy年MM月dd日");
}

//转成HH:mm
function yznDateFormatHm(value) {
    return $.format.date(value, "HH:mm");
}

//转成M.dd
function yznDateFormatMd(value) {
    return $.format.date(value, "M.dd");
}

//转成星期几
function yznDateFormatWeekCh(value) {
    return returnWeek(new Date($.format.date(value, "yyyy/MM/dd HH:mm:ss")).getDay());
}

//日期加减几天,加使用正数
function yznDateAddWithFormat(value, days, format) {
    var dateStr = $.format.date(value, "yyyy/MM/dd HH:mm:ss");
    var date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return yznDateFormat(date, format)
}

function yznDateAdd(value, days) {
    var dateStr = $.format.date(value, "yyyy/MM/dd HH:mm:ss");
    var date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return yznDateFormatYMdHms(date);
}

function yznMonthAdd(value, months) {
    var dateStr = $.format.date(value, "yyyy/MM/dd");
    var date = new Date(dateStr);
    date.setMonth(date.getMonth() + months);
    return yznDateFormatYMd(date);
}

//修改url参数值  changeURLArg(window.location.href,'name',123)
function changeURLArg(url, arg, arg_val) {
    var oldValue = getQueryStringForHref(url, arg);
    var oldText = arg + '=' + oldValue;
    var replaceText = arg + '=' + arg_val;
    var tmp = url.replace(oldText, replaceText);
    return tmp;
}

//采用正则表达式获取地址栏参数
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var ddd = window.location.search.substr(1);
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return null;
}

function getQueryStringForHref(href, name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var index = href.search("\\?");
    if (index != -1 && index + 1 < href.length) {
        var r = href.substr(index + 1).match(reg);
        if (r != null) {
            var temp = r[2];
            if (temp.search('#') != -1) {
                return decodeURIComponent(temp.substr(0, temp.search('#')));
            }
            return decodeURIComponent(r[2]);
        }
    }

    return null;
}

//获取每个路由html的名字。前缀加上eachPages
function getEachPageName(state) {
    if (!state) {
        state = '';
    }
    return 'eachPages_' + state.current.name;
}

//检查登录信息(岗位，权限等)是否有变化是否需要刷新页面
function checkNeedRefresh(oldCurrentUserInfo, newCurrentUserInfo) {
    //第一次使用这个对象不存在
    if (!oldCurrentUserInfo) {
        return false;
    }
    if (oldCurrentUserInfo.shop) {
        oldCurrentUserInfo.shop.smsNum = 0;
    }
    if (newCurrentUserInfo.shop) {
        newCurrentUserInfo.shop.smsNum = 0;
    }
    // if (oldCurrentUserInfo.token != newCurrentUserInfo.token) {
    //     return true;
    // }

    if (oldCurrentUserInfo.currentShopId != newCurrentUserInfo.currentShopId) {
        return true;
    }
    if (oldCurrentUserInfo.currentOrgId != newCurrentUserInfo.currentOrgId) {
        return true;
    }
    if (oldCurrentUserInfo.fromOrgId != newCurrentUserInfo.fromOrgId) {
        return true;
    }
    if (JSON.stringify(oldCurrentUserInfo.authMenus) != JSON.stringify(newCurrentUserInfo.authMenus)) {
        return true;
    }


    // if (!(JSON.stringify(oldCurrentUserInfo) === JSON.stringify(newCurrentUserInfo))) {
    //     return true;
    // }
    return false;
}

//根据权限获取默认路由
function getDefaultRouter() {
    var router = "";
    for (var i = 0; i < CONSTANT_SNV.length; ++i) {
        var level1 = CONSTANT_SNV[i];
        if (level1.sref) {
            if (checkAuthMenuById(level1.authMenuId)) {
                router = "#/" + level1.sref;
                break;
            }
        }
        var items = level1.items;
        var matched = false;
        if (!items) continue;
        for (var j = 0; j < items.length; ++j) {
            if (checkAuthMenuById(items[j].authMenuId)) {
                router = "#/" + items[j].sref;
                matched = true;
                break;
            }
        }
        if (matched) break;
    }

    return router;
}

//切换校区校区已经进入分校统一入口
//orgId有值表示切换到校区端，shopId有值的情况，type等于'toshop'表示校区进入分校情况，否则表示直接分校切换
function switchShopAndOrg(shopId, orgId, type, destination) {
    var data = {};
    if (type == 'toshop') {
        data.fromOrgId = orgId;
        data.shopId = shopId;
    } else {
        data.orgId = orgId;
        data.shopId = shopId;
    }

    $.hello({
        url: CONFIG.URL + "/api/oa/updateShop",
        type: "POST",
        data: JSON.stringify(data),
        success: function (data) {
            if (data.status == 200) {
                localStoreForLogin(data);

                var oldCurrentUserInfo = window.currentUserInfo;
                var newCurrentUserInfo = JSON.parse(localStorage.getItem("currentUserInfo"));
                //如果切户的同一个校区同时，如果校区信息有变化的重新刷新页面，如果没有变化的就什么都处理
                if (oldCurrentUserInfo && oldCurrentUserInfo.shopId == shopId && location.href.indexOf("#") != -1) {
                    if (checkNeedRefresh(oldCurrentUserInfo, newCurrentUserInfo)) {
                        location.reload();
                        localStorage.setItem("needRefreshUserInfo", "0");
                    }
                } else {
                    var href = "";
                    if (newCurrentUserInfo.currentShopId) {
                        if (type == 'toshop' && destination) {
                            window.currentUserInfo = newCurrentUserInfo;
                            href = "#/" + destination;
                        } else {
                            window.currentUserInfo = newCurrentUserInfo;
                            href = getDefaultRouter();
                        }
                    } else {
                        if (type == 'backOrg' && destination) {
                            window.currentUserInfo = newCurrentUserInfo;
                            href = destination;
                        } else {
                            window.currentUserInfo = newCurrentUserInfo;
                            href = getDefaultRouter();
                        }
                    }

                    localStorage.setItem("needRefreshUserInfo", "0");
                    location.href = href;
                    //浏览器只当页面地址或者参数变化了才会全部刷新，路由变化，浏览器是不重新刷新页面的，因为系统路由只是中间那部分，所以需要主动刷新一下页面
                    location.reload();

                }
            } else if (data.status == 20023) {
                return returnToLoginPage();
            }
        }
    });
}

//回退到登录页面
function returnToLoginPage() {

    localStorage.removeItem("password");
    localStorage.removeItem("currentUserInfo");
    localStorage.removeItem("oa_token");
    var href = "login.html";
    var url = new URL(location.href)
    href += url.search;
    location.href = href;
}


//校区进入校区，destination指定跳转页面
function gotoShop(id, destination) {
    localStorage.setItem('fromOrgUrl', location.href);
    switchShopAndOrg(id, window.currentUserInfo.currentOrgId, 'toshop', destination);

}

//返回校区
function backOrg() {
    var destination = localStorage.getItem('fromOrgUrl');
    switchShopAndOrg(null, window.currentUserInfo.fromOrgId, 'backOrg', destination);
    localStorage.removeItem('fromOrgUrl');
}

//当有删除或者确定操作时需要弹框点击确认时
function detailMsk(tit, fn1, fn2, arr, fn3, title) { //tit:提示文案；fn1点击确定回调方法；fn2点击取消回调方法；arr：自定义按钮
    var isDio = layer.confirm(tit, {
        title: title ? title : "确认信息",
        skin: 'newlayerui layeruiCenter',
        closeBtn: 1,
        offset: '30px',
        move: false,
        resize: false,
        area: '560px',
        btn: arr ? arr : ['是', '否'] //按钮
    }, function () {
        if (fn1) fn1();
        $scope.$apply();
        layer.close(isDio);
    }, function () {
        if (fn2) fn2();
        $scope.$apply();
        layer.close(isDio);
    }, function () {
        if (fn3) fn3();
        $scope.$apply();
        layer.close(isDio);
    })
}

//当操作转课、退费、结课时存在有排课的时候
function hasDelectPaike(classId, tips, fn, arr) {
    console.log(classId);
    var isDelect = layer.confirm(tips, {
        title: "确认信息",
        skin: 'newlayerui layeruiCenter',
        closeBtn: 1,
        offset: '30px',
        move: false,
        resize: false,
        area: '560px',
        btn: arr ? arr : ['删除', '取消'] //按钮
    }, function () {
        $.hello({
            url: CONFIG.URL + "/api/oa/lesson/deleteList",
            type: "post",
            data: JSON.stringify({
                'classId': classId,
            }),
            success: function (res) {
                if (res.status == '200') {
                    if (fn) {
                        fn();
                    }
                    ;
                    layer.close(isDelect);
                }
                ;
            }
        })
    }, function () {
        layer.close(isDelect);
    })
}

//双循环去重
function duplicateRemoval(list1, list2, att) {
    var arr = [],
        judge;
    for (var i = 0; i < list1.length; i++) {
        judge = true;
        for (var j = 0; j < list2.length; j++) {
            if (list1[i][att] == list2[j][att]) {
                judge = false;
            }
        }
        if (judge) {
            arr.push(list1[i]);
        }
    }
    return list2.concat(arr);
}

//获取加载文件的回调，加载当前文件后执行的方法
function loadPopups(scope, arr, fn) {
    var _a = arr,
        _l = false,
        _s = arr.join(',');
    scope.$on('loadPopups', function (a, b) { //监听弹框加载后回调
        if (!_l) { //如果未加载完所需弹框
            for (var i = 0; i < _a.length; i++) { //循环确认所需弹框的加载是否完成，完成一个则寻找下一个
                if (_a[i] == b) {
                    delete _a[i];
                }
            }
            _a = detEmptyField_(_a); //去除完成加载后删除的空对象
            if (_a.length == 0) { //如果arr里面所需全部加载完成
                _l = true; //加载完成
                console.log('所需弹框组件' + _s + '加载完毕！');
                setTimeout(function () { //丢到队列最后面执行，确保弹框加载完成
                    fn(); //执行回调
                })
            }
        }
    });
}

//手动调用window.onresize方法,处理fixed定位弹框下半部分被隐藏的问题
function manualOnresize() {
    //  setTimeout(function() {
    //      $(window).trigger("resize");
    //  }, 50);
};

/*
 * 用于排序 比较时间大小
 */
function compareTime_(obj1, obj2) {
    var val1 = parseInt(obj1.replace(":", ""));
    var val2 = parseInt(obj2.replace(":", ""));
    if (val1 < val2) {
        return -1;
    } else if (val1 > val2) {
        return 1;
    } else {
        return 0;
    }
}

//对比查询重复的list
function repeatLists(list1, list2, atts) {
    console.log(list1, list2, atts);
    var d_1, d_2;
    for (var i = 0; i < list1.length; i++) {
        d_1 = list1[i];
        for (var j = 0; j < list2.length; j++) {
            d_2 = list2[j];
            if (getAtt(d_1, atts) == getAtt(d_2, atts)) {
                d_1['hasChecked'] = true;
            }
        }
    }
    ;

    //获取对象的属性
    function getAtt(obj, at) {
        var obj = obj;
        if (at) {
            var att = at.split('.');
            for (var i = 0; i < att.length; i++) {
                obj = obj[att[i]]
            }
            ;
        }
        if (!obj) {
            return '';
        } else {
            return obj;
        }
    };
}

//重新获取表头 checked:需要展示的表头 ，unchecked:所有的表头
function getTableHead(checked, unchecked) {
    var unchecked = angular.copy(unchecked);
    var checked = angular.copy(checked);
    var arr = [];
    angular.forEach(checked, function (v) {
        angular.forEach(unchecked, function (v_) {
            if (v.checked) {
                if ((v_.name && v.name == v_.name) || (!v_.name && v_.fixed === v.fixed)) {
                    delete v_.td;
                    arr.push(v_);
                }
            }
        });
    });
    return arr;
}

function resetHead(list, heads) {
    var list_ = angular.copy(list);
    var heads_ = angular.copy(heads);
    var arr = [];

    for (var i in heads_) { //用来遍历的数组先去除数据返回中存在，默认表不存在的数据
        var aa = "";
        var stra = heads_[i];
        var judge = false;
        for (var j = 0; j < list_.length; j++) {
            var strb = list_[j];
            if (stra.name == strb.name && i !== j) {
                judge = true;
                aa = strb;
                break;
            }
        }
        if (judge) {
            heads_[i] = aa;
        }
    }

    for (var i in list_) { //用来遍历的数组先去除数据返回中存在，默认表不存在的数据
        var stra = list_[i];
        var count_minus = 0;
        for (var j = 0; j < heads_.length; j++) {
            var strb = heads_[j];
            if (stra.name == strb.name) {
                count_minus++;
            }
        }
        if (count_minus === 0) {
            list_.splice(i, 1);
        }
    }
    //已上是删减处理后的返回数据
    for (var i in heads_) { //遍历默认的表头数据，若新增表头，返回的表头不存在时则向表头中添加数据
        var stra_ = heads_[i];
        var count_add = 0;
        for (var j = 0; j < list_.length; j++) {
            var strb_ = list_[j];
            if (stra_.name == strb_.name) {
                count_add++;
            }
        }
        if (count_add === 0) {
            arr.splice(i, 0, stra_);
        } else {
            arr.push(stra_);
        }
    }
    console.log(arr);
    return arr; //返回处理好的表头数据
}

//table数据重新排序
function getNewTable(name, type, list) {
    var arr = [];
    var max, min;
    if (!list) {
        return arr;
    }
    if (type == "asc") { //从大到小
        for (var i = 0; i < list.length; i++) {
            //决定每一轮比较多少次
            for (var j = 0; j < list.length; j++) {

                if (list[i][name] < list[j][name]) {
                    //如果arr[j]大就把此时的值赋值给最大值变量max

                    max = list[j];
                    list[j] = list[i];
                    list[i] = max;
                }
            }
        }
    } else if (type == "desc") { //从小到大
        for (var i = 0; i < list.length; i++) {
            //决定每一轮比较多少次
            for (var j = 0; j < list.length; j++) {

                if (list[i][name] > list[j][name]) {
                    //如果arr[j]大就把此时的值赋值给最大值变量max

                    min = list[j];
                    list[j] = list[i];
                    list[i] = min;
                }
            }
        }
    }
    arr = list;
    return arr;
}

// 处理数字加减后的精度问题||返回数字类型
function numAccuracy(n) {
    if (Number(n) && n != Infinity) {
        if (n == '-0.00') n = 0;
        n = n * 1;
        return Math.round(n * 100) / 100;
    } else {
        return 0;
    }
};

//通过资源文件url获取url里的key值
function getKeyFromUrl(urlStr) {
    if (URL) {
        var url = new URL(urlStr);
        var key = url.pathname;
        if (key.indexOf('/') == 0) {
            key = key.substring(1, key.length);
        }
        return key;
    } else {
        var pathnameStart = 0;
        var pathnameEnd = urlStr.length;
        if (urlStr.indexOf('//') >= 0) {
            pathnameStart = urlStr.indexOf('/', urlStr.indexOf('//') + 2) + 1;
        } else {
            pathnameStart = urlStr.indexOf('/') + 1;
        }
        if (urlStr.indexOf('#') >= 0) {
            pathnameEnd = urlStr.indexOf('#');
        } else if (urlStr.indexOf('?') >= 0) {
            pathnameEnd = urlStr.indexOf('?');
        }
        return urlStr.substring(pathnameStart, pathnameEnd);
    }

}

var floatMsg = {};

function showErrorMsgFun(e, ind, msg) {
    var d = '<div class="openPop" id="msg_' + ind + '">' + msg + '</div>';
    var f = angular.element(d);
    angular.element(document.body).append(f);
    floatMsg['msg_' + ind] = {element: f};
    var $this = $(e.currentTarget),
        thisoffset = $this.offset(),
        top = thisoffset.top,
        left = thisoffset.left,
        panelwidth = f.width(),
        panelleft = f.offset().left;
    var zIndex = $this.closest(".layui-layer")[0].style.zIndex;
    f.css({
        top: top + 30,
        left: left + 60,
        zIndex: zIndex + 100
    }).show();
}

function hideErrorMsgFun(ind) {
    floatMsg['msg_' + ind].element.remove();
}

//以下表格全选和单选记住数据的操作
function checkboxAllFun(d, list, listed, id, exclud) {
    var i_ = [false, null];
    if (d) {
        angular.forEach(list, function (val_1) {
            if (exclud) {
                if (!val_1.hasChecked && !val_1.disabled) {
                    val_1.hasChecked = true;
                    listed.push(val_1);
                }
            } else {
                if (!val_1.hasChecked) {
                    val_1.hasChecked = true;
                    listed.push(val_1);
                }
            }
        });
    } else {
        angular.forEach(list, function (val_1) {
            if (exclud) {
                if (!val_1.disabled) {
                    val_1.hasChecked = false;
                }
            } else {
                val_1.hasChecked = false;
            }
            i_ = [false, null];
            angular.forEach(listed, function (val_2, ind_2) {
                if (getAttFun(val_1, id) == getAttFun(val_2, id)) {
                    i_ = [true, ind_2];
                }
            });
            if (i_[0]) {
                listed.splice(i_[1], 1);
            }
        });
    }
}

function checkSingleFun(data, listed, id, exclud) {
    var index_ = [false, null];
    if (exclud && data.disabled) {
        return;
    }
    if (data.hasChecked) {
        data.hasChecked = false;
        angular.forEach(listed, function (val, ind) {
            if (getAttFun(data, id) == getAttFun(val, id)) {
                index_ = [true, ind];
            }
        });
        if (index_[0]) {
            listed.splice(index_[1], 1);
        }
    } else {
        data.hasChecked = true;
        listed.push(data);
    }
}

function getArrIds(list, id) {
    var arr = [];
    if (list && list.length > 0) {
        angular.forEach(list, function (v) {
            arr.push(v[id]);
        });
    }
    return arr;
}

//获取对象的属性
function getAttFun(obj, at) {
    var obj = obj;
    if (at) {
        var att = at.split('.');
        for (var i = 0; i < att.length; i++) {
            obj = obj[att[i]]
        }
        ;
    }

    if (!obj) {
        return '';
    } else {
        return obj;
    }
};

function judgeTwoVal(val1, val2) {
    if (val1 && val2) { //两者都有值
        return true;
    } else if ((val1 && !val2) || (!val1 && val2)) { //两者只有一者有值
        return false;
    } else if (!val1 && !val2) { //两者都无值
        return true;
    } else {
        return true;
    }
}

// 防抖
function debounce(fn, delay) {
    var timeout = null;
    return function () {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(function () {
            fn.apply(this, arguments);
        }, delay);
    }
}

// 节流
function throttle(fn, delay) {
    var hasRun = false;
    return function () {
        if (hasRun) {
            return;
        }
        hasRun = true;
        setTimeout(function () {
            hasRun = false;
            fn.apply(this, arguments);
        }, delay);
    }
}

var lastPopupClosedTime = 0;
var lastPopName;

//公共弹窗-滚动-加载数据
(function (window) {
    function creatPopup(config) {
        angular.module("myApp", [])
            .directive(config.el, ['$compile', function ($compile) {
                return {
                    restirct: 'E',
                    templateUrl: config.htmlUrl,
                    scope: {
                        openfn: '@openfn',
                        openid: '@id',
                        flag: '@flag'
                    },
                    controller: ['$scope', '$attrs', 'SERVICE', '$rootScope', '$timeout', '$state', '$sce', function ($scope, $attrs, SERVICE, $rootScope, $timeout, $state, $sce) {
                        if (!$scope.flag) {
                            $scope.$parent[config.openPopupFn] = goPopup; //打开对象弹窗
                            $scope.$parent[$scope.openfn] = goPopup; //打开对象弹窗
                            $scope.$on(config.openPopupFn, function (e, obj, width, props) {
                                goPopup(obj, width, props)
                            }); //点击出现弹框-传递给子作用域上
                            $scope.$on($scope.openfn, function (e, obj, width, props) {
                                goPopup(obj, width, props)
                            }); //点击出现弹框-传递给子作用域上
                        }

                        $scope.closePopup = closePopup;
                        $scope.goPopup = function (obj, width) {
                            if ($scope.openid) {
                                obj = $scope.openid + ' #' + obj;
                            }
                            openLayer(obj, width);
                        };
                        $scope.$emit('loadPopups', config.el); //向上广播，标识弹框组件加载完成

                        if ($scope.flag) {
                            $scope._goPopup = goPopup;
                            $scope.$emit('popupFinished', {'scope': $scope});
                        }

                        function goPopup(obj, width, props) {
                            //剔除js里面多余的监听事件$on,$emit
                            for (var i in $scope.$$listeners) {
                                if (i != '$destroy' && i != config.openPopupFn && i != $scope.openfn) {
                                    delete $scope.$$listeners[i];
                                }
                            }
                            detEmptyField_($scope.$$listeners); //去除空字段

                            // if(!$rootScope.popup_count[config.el]) {
                            //     $rootScope.popup_count[config.el] = 1;
                            // } else {
                            //     if($rootScope.popup_count[config.el] + 1 > 2) {
                            //         layer.msg('请先关闭之前弹窗');
                            //         return;
                            //     }
                            //     $rootScope.popup_count[config.el]++;
                            // }

                            openLayer(obj, width, true);


                            /*
                             * 备注
                             * 比对去重，清空$scope里后面自己定义的数据
                             * objName里面存放的是初始化scope时里面的属性名，包括objName本身
                             * 第二次打开弹框把不是初始化的值清空
                             *
                             */
                            if ($scope.objName) {
                                for (var ob in $scope) {
                                    var ju_ = true;
                                    angular.forEach($scope.objName, function (val) {
                                        if (ob == val) {
                                            ju_ = false;
                                        }
                                    })
                                    if (ju_) $scope[ob] = undefined;
                                }
                            } else {
                                $scope.objName = [];
                                for (var obj in $scope) {
                                    $scope.objName.push(obj);
                                }
                            }

                            config.controllerFn($scope, props, SERVICE, $timeout, $state, $sce, $rootScope);
                        }

                        function closePopup(param) {
                            //TODO length==0的情况会出现，具体原因待查
                            if ($rootScope.popup_name.length > 0) {

                                var popName = $rootScope.popupMap[$scope.openid] ? $rootScope.popupMap[$scope.openid].obj : '';
                                var nowTime = (new Date()).getTime();
                                //小于100毫秒的情况上报看看什么情况
                                if (nowTime - lastPopupClosedTime < 100 && 'rollCall'==popName) {
                                    var jsLog = {
                                        shopId: localStorage.getItem('shopId'),
                                        oAuserId: localStorage.getItem('accountId'),
                                        stack: '#####' + popName,
                                        data: 'this pop=' + param + ',last pop=' + lastPopName,
                                        url: window.location.href
                                    };
                                    commitJsException(jsLog);
                                }
                                lastPopupClosedTime = nowTime;
                                lastPopName = param;


                                var popid = $rootScope.popup_name[$rootScope.popup_name.length - 1]['dialog'];
                                layer.close(popid);
                                $rootScope.popup_name.pop();

                                if ($scope.flag && popid == $scope.mainPopId) {
                                    if ($rootScope.popupMap[$scope.openid]) {
                                        $scope.$destroy();
                                        $rootScope.popupMap[$scope.openid].element.remove();
                                        if ($rootScope.popupMap[$scope.openid].fn) $rootScope.popupMap[$scope.openid].fn(); //关闭弹窗回调函数
                                    }
                                }
                            }
                        }

                        //公共弹窗
                        function openLayer(obj, width, isMain) {
                            var popup = {};
                            var observer = null;
                            popup['dialog'] = layer.open({
                                type: 1,
                                title: false,
                                skin: 'layui-layer-demo', // 样式类名
                                closeBtn: 0, // 不显示关闭按钮
                                move: false,
                                resize: false,
                                anim: 0,
                                area: width,
                                offset: '30px',
                                shadeClose: false, // 开启遮罩关闭
                                content: $('#' + obj),
                                success: function (layero) {
                                    /*
                                     * 处理layer不会自动监听内部元素高度的变化，导致内部高度变化后被layer超出隐藏掉的问题
                                     * 自动监听layer内部弹框高度的变化，回调manualOnresize方法刷新弹框高度
                                     */
                                    //                                  try {
                                    //                                      // Firefox和Chrome早期版本中带有前缀
                                    //                                      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
                                    //                                      // 创建观察者对象
                                    //                                      observer = new MutationObserver(function(mutations) {
                                    //                                          manualOnresize();
                                    //                                      });
                                    //                                      // 配置观察选项:
                                    //                                      var config = {attributeFilter:['height'], subtree: true, characterData: true};
                                    //                                      // 传入目标节点和观察选项
                                    //                                      observer.observe($('#' + obj)[0], config);
                                    //                                  } catch (e) {
                                    //                                      console.log(e);
                                    //                                  };

                                    $rootScope.popup_name.push(popup);

                                },
                                cancel: function (index, layero) {
                                    observer.disconnect(); //关闭监听事件
                                },
                                end: function (index, layero) {
                                    // if (el) {
                                    //     $rootScope.popup_count[config.el]--;
                                    // }
                                }
                            });

                            if (popup['dialog'] > 0) {
                                if (isMain) {
                                    $scope.mainPopId = popup['dialog'];
                                }
                            }


                            if ($('#' + obj).find('.popup_scr')[0]) {
                                $('#' + obj).find('.popup_scr')[0].style.top = '0px';
                            }
                        }
                    }]
                }
            }])
    }

    // 面向对象的滚动条效果
    function Darg(container, jud) {
        var _this = this;
        this.container = container;
        if (!jud) {
            this.scr = document.createElement('span');
            this.container.appendChild(this.scr);
            this.scr.className = 'popup_scr';
            this.scr.id = '_popup_scr';
        } else {
            this.scr = this.container.lastChild;
        }
        this.con = this.container.children[0];
        this.scrTop = 0;
        this.oldY = 0;
        this.newY = 0;
        this.nowY = 0;
        this.startScrTop = 0; //scr滚动条的滚动的top距离（要减去scrollTop）
        this.oldScrollTop = 0;
        this.conH = this.con.offsetHeight - this.container.clientHeight;
        this.scr.style.height = this.container.clientHeight / this.con.offsetHeight * this.container.clientHeight + 'px';
        this.multiple = this.conH / this.container.clientHeight * 10; //设置滚轮倍数
        if (this.multiple > 30) {
            this.multiple = 30;
        }
        this.max = this.container.clientHeight - this.scr.offsetHeight;
        if (this.conH <= 0) {
            this.scr.style.display = 'none';
        } else {
            this.scr.style.display = 'block';
        }

        this.container.onmousewheel = function (e) {
            _this.darWheel(e);
        }
        this.scr.onmousedown = function (e) {
            _this.oldY = e.clientY;
            _this.startScrTop = _this.scr.offsetTop - _this.container.scrollTop;
            document.onmousemove = function (e) {
                _this.darMove(e);
            };
        }
        document.onmouseup = _this.darUp;
    };

    //鼠标拖拽事件
    Darg.prototype.darMove = function (e) {
        e.preventDefault();
        this.newY = e.clientY;
        this.nowY = this.startScrTop + this.newY - this.oldY;
        if (this.nowY <= 0) {
            this.nowY = 0
        }
        ;
        if (this.nowY >= this.max) {
            this.nowY = this.max
        }
        ;
        this.container.scrollTop = this.conH * this.nowY / this.max;
        this.scr.style.top = this.nowY + this.container.scrollTop + 'px';
    };

    //鼠标放开事件
    Darg.prototype.darUp = function () {
        document.onmousemove = null;
    };

    //滚轮事件
    Darg.prototype.darWheel = function (e) {
        this.startScrTop = this.scr.offsetTop - this.container.scrollTop;
        this.wheelStep = -e.wheelDelta / 10;
        this.nowY = this.startScrTop + this.wheelStep;
        this.oldScrollTop = this.container.scrollTop;
        if (this.nowY <= 0) {
            this.nowY = 0
        }
        ;
        if (this.nowY >= this.max) {
            this.nowY = this.max
        }
        ;
        this.container.scrollTop = this.conH * this.nowY / this.max;
        this.scr.style.top = this.nowY + this.container.scrollTop + 'px';
        //定位筛选栏的位置
        var screens = this.container.getElementsByClassName('screen');
        for (var i = 0; i < screens.length; i++) {
            var _v = parseInt($(screens).attr('topVal'));
            if (!_v) {
                $(screens).attr('topVal', parseInt(screens[i].children[1].style.top) + this.oldScrollTop);
                _v = parseInt(screens[i].children[1].style.top) + this.oldScrollTop;
            }
            screens[i].children[1].style.top = _v - this.container.scrollTop + 'px';
        }
    }

    //滚动加载数据函数封装
    function LoadData(container, fn) {
        var _this = this;
        this.container = document.getElementById(container);
        this.child = this.container.children[0];
        this.fn = fn;
        this.maxH = null;
        this.maxH_ = null;
        this.judge = true;
        this.container.onscroll = function (e) {
            _this.darScroll(e);
        }
    }

    LoadData.prototype.darScroll = function (e) {
        this.maxH = this.child.offsetHeight - this.container.clientHeight;
        if (this.maxH != this.maxH_) { //控制当前一次数据加载之后才允许滚动判断
            this.maxH_ = this.maxH;
            this.judge = true;
        }
        if (this.container.scrollTop >= (this.maxH - 10) && this.judge) {
            //          this.container.scrollTop = this.maxH-10;
            this.fn();
            this.judge = false;
        }
    }

    function creatDarg(container, jud) {
        return new Darg(container, jud);
    };

    function loadData(container, fn) {
        return new LoadData(container, fn);
    };
    window.creatDarg = creatDarg;
    window.loadData = loadData;
    window.creatPopup = creatPopup;
})(window)