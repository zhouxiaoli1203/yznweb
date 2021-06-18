var myApp = angular.module("myApp", ["ui.router", "ngSanitize", 'ngDraggable']);
myApp.filter('yznDate', function() {
        //时间转换过滤器
        return function(date, format, type) {
            if (type == 'HHmm') {
                return $.format.date(date, format) + '   ' + $.format.date(date, 'HH:mm');
            } else {
                return $.format.date(date, format);
            }
        }
    })
    .filter('dataNull', function() {
        //时间转换过滤器
        return function(data) {
            if (!data && data !== 0) {
                return '-'
            } else {
                return data;
            }
        }
    })
    .filter('phoneHide', function() {
        //手机号码隐藏中间四位
        return function(data) {
            if (data) {
                return data.substring(0, 3) + "****" + data.substr(data.length - 4);
            }
        }
    })
    .filter('beginEndDate', function() {
        //时间转换过滤器
        return function(beg, end, type, week) {
            if (type) {
                if (type == 'week') {
                    return returnWeek(week) + '  ' + $.format.date(beg, 'HH:mm') + '-' + $.format.date(end, 'HH:mm')
                } else if (type == 'yyWeek') {
                    return $.format.date(beg, 'yyyy-MM-dd') + ' 【' + returnWeek(week) + '】';
                } else if (type == 'yyWeekhh') {
                    return $.format.date(beg, 'yyyy-MM-dd') + ' 【' + returnWeek(initWeek(beg)) + '】' + ' ' + $.format.date(beg, 'HH:mm');
                } else if (type == 'yyWeek_y') {
                    return $.format.date(beg, 'yyyy-MM-dd') + ' 【' + returnWeek(week) + '】';
                } else if (type == 'yyWeek_hh') {
                    return $.format.date(beg, 'yyyy-MM-dd') + ' 【' + returnWeek(week) + '】' + ' ' + $.format.date(beg, 'HH:mm') + '-' + $.format.date(end, 'HH:mm');
                } else if (type == 'hhAP') {
                    if ($.format.date(end, 'HH') * 1 > 12) {
                        return $.format.date(beg, 'HH:mm') + '-' + $.format.date(end, 'HH:mm') + '【下午】';
                    } else {
                        return $.format.date(beg, 'HH:mm') + '-' + $.format.date(end, 'HH:mm') + '【上午】';
                    }
                }
            } else {
                return $.format.date(beg, 'yyyy-MM-dd') + '  ' + $.format.date(beg, 'HH:mm') + '-' + $.format.date(end, 'HH:mm')
            }
        }
    })
    .filter('dataLen', function() {
        //中文长度加省略过滤器
        return function(data, len) {
            if (data) {
                if (data.length > len) {
                    return data.slice(0, len) + '...';
                } else {
                    return data;
                }
            }
        }
    })
    .filter('limitTo', function() { //签约的折扣显示
        return function(h, m) {
            var arr = [];
            for (var i = 0; i < m; i++) {
                if (m > 9) {
                    arr.push(i);
                };
            }
            return arr;
        }
    })
    .filter('m', function() {
        return function(n) {
            if (Number(n) && n != Infinity) {
                if (n == '-0.00') n = 0;
                n = n * 1;
                return Math.round(n * 100) / 100;
            } else {
                return 0;
            }
        }
    })
    //数字取绝对值
    .filter('abs', function() {
        return function(n) {
            if (n) {
                return Math.abs(n);
            } else {
                return 0;
            }
        }
    })
    //数字向下取整
    .filter('floor', function() {
        return function(n) {
            if (n) {
                return Math.floor(n);
            } else {
                return 0;
            }
        }
    })
    .filter('_qf', function() { //增加千分符
        return function(n, type) {
            if (Number(n) && n != Infinity) {
                var _n, str;
                if (n == '-0.00') n = 0;
                n = Math.round(n * 100) / 100;
                _n = n.toString().split('.');
                str = (_n[0]).replace(/(\d{1,3})(?=(\d{3})+$)/g, '$1,') + (_n[1] ? ('.' + _n[1]) : '');
                return str;
            } else {
                return 0;
            }
        }
    })
    .filter('_wf', function() { //上万后添加单位万
        return function(n) {
            if (n) {
                var str = n / 10000;
                if (str > 1) {
                    str = str.toFixed(1) + '万';
                } else {
                    str = n;
                }
                return str;
            } else {
                return '0';
            }
        }
    })
    .filter('_addDate', function() { //添加多少天日期
        return function(value, days, format) {
            var dateStr = $.format.date(value, "yyyy/MM/dd HH:mm:ss");
            var date = new Date(dateStr);
            date.setDate(date.getDate() + (days * 1));
            return yznDateFormat(date, format);
        }
    })
    .filter('_compareDate', function() { //比较日期大小
        return function(day1, day2) {
            var d1 = yznDateFormatYMd(day1);
            var d2 = yznDateFormatYMd(day2);
            return CompareDate(d1, d2); //true:d1>d2
        }
    })
    .filter('_compareNum', function() { //比较数字大小
        return function(n1, n2) {
            var d1 = numAccuracy(n1);
            var d2 = numAccuracy(n2);
            return d1 > d2; //true:d1>d2
        }
    })
    .filter('_html', function() { //添加html片段
        return function(html) {
            return html;
            console.log(html)
                //        return $sce.trustAsHtml(html);
        }
    })
    .filter('_week', function() { //添加html片段
        return function(num, type) {
            if (type == 'date') {
                var n_ = new Date(num).getDay() == 0 ? 7 : new Date(num).getDay();
                return returnWeek(n_);
            } else {
                return returnWeek(num);
            }
        }
    })
    .filter('_grade', function() { //年级
        return function(num) {
            for (var i in CONSTANT.STUDENTGRADE) {
                if (num == i) {
                    return CONSTANT.STUDENTGRADE[num];
                    break;
                }

            }
        }
    })
    .filter('_studentType', function() { //年级
        return function(num) {
            for (var i in CONSTANT.STUDENTTYPE_) {
                if (num == i) {
                    return CONSTANT.STUDENTTYPE_[num];
                    break;
                }

            }
        }
    })
    .filter('_potRecordType', function() { //年级
        return function(num) {
            for (var i in CONSTANT.POTENTIALCUSTOMERRECORDTYPEFORSHOW) {
                if (num == i) {
                    return CONSTANT.POTENTIALCUSTOMERRECORDTYPEFORSHOW[num];
                    break;
                }

            }
        }
    })
    .filter('_zhouweek', function() { //添加html片段
        return function(num) {
            return returnweek(num);
        }
    })
    .filter('_interception_time', function() { //截取时间不要秒
        return function(num) {
            var n_ = num.split(':');
            return n_[0] + ':' + n_[1];
        }
    })
    .filter('_relation', function() { //显示主要联系人关系
        return function(type) {
            return relation(type);
        }
    })
    .filter('_newStr', function() { //显示主要联系人关系
        return function (list, type, joint) {
            return arrToStr(list, type, joint);
        }
    })
    .filter('_total', function() { //统计里的各项总计
        return function(type, list) {
            var t = 0;
            angular.forEach(list, function(v) {
                t += v[type] * 1;
            });
            return t;
        }
    })
    .filter('_authId', function() { //权限
        return function(id) {
            return checkAuthMenuById(id);
        }
    })
    .filter('keshi', function() { //课时单位
        return function(data) {
            if (data === undefined || data === null) {
                return "课时";
            }
            return data + "课时";
        }
    })
    .filter('tian', function() { //天单位
        return function(data) {
            if (data === undefined || data === null) {
                return "天";
            }
            return data + "天";
        }
    })
    .filter('keshi_tian', function() { //课时/天单位
        return function(d1, d2, qianke) {
            if (qianke && d1 < 0) { //若需要结合欠课字段显示的需要把剩余课时置为0
                d1 = 0;
            }
            if (!d1 && !d2) {
                return "0.00课时";
            } else if (d1 && !d2) {
                return d1.toFixed(2) + "课时";
            } else if (!d1 && d2) {
                return d2 + "天";
            } else if (d1 && d2) {
                return d1.toFixed(2) + "课时/" + d2 + "天";
            } else {
                return "";
            }
        }
    })
    .filter('keshi_tian_sheng', function() { //课时/天单位
        return function(t_ke, t_day, b_ke, b_day, g_time, qianke) {
            if (qianke && t_ke < 0) { //若需要结合欠课字段显示的需要把剩余课时置为0
                t_ke = 0;
            }
            if (b_day > 0) {
                if ((b_ke * 1 + g_time * 1) == 0) {
                    return t_day + "天";
                }
                if ((b_ke * 1 + g_time * 1) > 0) {
                    t_ke = t_ke > 0 ? t_ke : 0;
                    return t_ke.toFixed(2) + "课时/" + t_day + "天";
                }
            } else if (b_day == 0) {
                if ((b_ke * 1 + g_time * 1) > 0) {
                    t_ke = t_ke > 0 ? t_ke : 0;
                    return t_ke.toFixed(2) + "课时";
                } else {
                    return "0.00课时";
                }
            } else {
                return "0.00课时";
            }
        }
    })
    .filter('_getRate', function() { //比率值
        return function(n1, n2) {
            var r = 0.00;
            if (n1 <= 0 || n2 <= 0) {
                return rate = 0.00;
            } else {
                return rate = (n1 / n2) * 100;
            }

        }
    })
    .filter('_getDay', function() { //b:开始时间 e:结束时间 m:按月月数  计算自然月转成天数
        return function(b, e, m) {
            if (m == 0) {
                return 0;
            } else {
                return numAccuracy(getIntervalDays(b, e) + 1);
            }
        }
    })
    .filter('_getBt', function() { //文件大小字节转换'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'
        return function(bytes) {
            if (bytes * 1 === 0) return '0 B';
            var k = 1024, // or 1024
                sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        }
    })
    .filter("stringKeyword", ["$sce", function($sce) {
        return function(text,color) {
            if (text) {
                if (color) {
                    text = text.replace(new RegExp(color, 'g'), "<em style='color: #f5565b;font-style: inherit;'>" + color + "</em>");
                    return $sce.trustAsHtml(text);
                }
            }
            return text;
        }
    }]);