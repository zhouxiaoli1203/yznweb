define(function() {
    var CourseUtils = CourseUtils || {},
        cutDialog;
    "use strict";
    (function(global) {
        //获取数据初始化
        global.init = function(config) {
            this.config = config;
            this.compileFac = config.compileFac; //动态创建的节点，未经编译无法使用angular方法，传入angular编译服务
            this.scope = config.getScope;
            this._data = config.data;
            switch (config.type) {
                case 1:
                    global.renderDom_1(config.contain, config.data.timeFrame, config.data.dataList);
                    // global.renderDom_unShop();
                    break;
                case 2:
                    global.renderDom_2(config.contain, config.data.timeFrame, config.data.dataList);
                    break;
                case 3:
                    global.renderDom_3(config.contain, config.data.timeFrame, config.data.dataList);
                    break;
            }
            global.renderDom_vac();
        }
        $(window).resize(function() { //浏览器变化重新渲染
            if (global.config) {
                global.init(global.config);
            }
        });
        //渲染dom结构(按时间)
        global.renderDom_1 = function(contain, timeFrame, dataList) {
            var table = $('<table></table>'),
                thead = $('<tr></tr>'),
                tbody = $('<tbody></tbody>'),
                tL = [],
                tLH = $('<ul class="sch_timels"></ul>'),
                modelArrangingCourses = {},
                _this = this;

            for (var i = 0; i < 7; i++) {
                var th = $('<th class="_hover" ng-mouseover="show_tips($event, 2)" ng-mouseout="show_tips($event, 3)">' + returnWeek(i + 1) + '<br/>' + timeFrame[i] + '</th>');
                if ((i + 1) == _this._data.week) {
                    th.css({ 'color': '#FA575D' });
                };
                th.addClass('th_week_' + i);
                thead.append(th);
            }

            for (var j = 0; j < 72; j++) {
                var time = parseInt(j / 4) + 6 + "," + (j % 4);
                tr = '',
                    td = '';
                if (j % 4 == 0) {
                    tr = $('<tr class="ut_whole" time=' + time + '></tr>');
                    tL.push(convertTime(time));
                } else {
                    tr = $('<tr class="ut_nowhole" time=' + time + '></tr>');
                }
                for (var m = 0; m < 7; m++) {
                    td = '<td ng-click="tdPaike($event)" class="x_' + m + 'y_' + j + '" date="' + timeFrame[m] + '" week="' + (m + 1) + '" time="' + time + '" n="0"></td>';
                    tr.append(td);
                }
                tbody.append(tr);
            }

            for (var t = 0; t < tL.length; t++) {
                tLH.append($('<li>' + tL[t] + '</li>'));
            }
            contain.html('');
            tLH.append('<li>24:00</li>'); //加入24点
            table.append($('<thead></thead>').append(thead)).append(tbody);
            contain.append(tLH).append(_this.compileFac(table));

            for (var k = 0; k < dataList.length; k++) {
                renderCouse(dataList[k]);
            }

            //处理并渲染排课信息
            function renderCouse(d) {
                var td = getTd(d.arrangingCoursesWeek, $.format.date(d.arrangingCoursesBeginDate, 'H:mm')),
                    _div = $("<div class='_hover' data='" + JSON.stringify(d) + "' ng-click='show_tips($event, 1)' ng-mouseover='show_tips($event, 2)' ng-mouseout='show_tips($event, 3)'><p><span>" + d.classInfo.className + "</span></p></div>"),
                    _divTop = $.format.date(d.arrangingCoursesBeginDate, 'H:mm').split(':')[1] % 15,
                    _divH = getTimeDiff($.format.date(d.arrangingCoursesBeginDate, 'H:mm'), $.format.date(d.arrangingCoursesEndDate, 'H:mm')),
                    _divW = 0,
                    _divLf = 0,
                    j_ = {}, //存类名的容器
                    maxj_ = { name: '', value: 0 }, //找出最大重叠数的类名
                    _num = 0;

                d.className = 'name_' + d.arrangingCoursesWeek + '_' + d.arrangingCoursesId; //为每一个排课设置一个单独的类名
                d.className_ = 'name_' + d.arrangingCoursesWeek + '_' + d.arrangingCoursesId + '_f'; //为每一个排课设置一个可改变的类名
                //如果没有则创建一个周数组
                if (!modelArrangingCourses[d.arrangingCoursesWeek]) {
                    modelArrangingCourses[d.arrangingCoursesWeek] = [];
                };

                //循环判断是否有重叠的课
                for (var i = 0; i < modelArrangingCourses[d.arrangingCoursesWeek].length; i++) {
                    var n = modelArrangingCourses[d.arrangingCoursesWeek][i];
                    if (judgeTimeOverlap($.format.date(d.arrangingCoursesBeginDate, 'H:mm'), $.format.date(d.arrangingCoursesEndDate, 'H:mm'), $.format.date(n.arrangingCoursesBeginDate, 'H:mm'), $.format.date(n.arrangingCoursesEndDate, 'H:mm'))) {
                        if (!j_[n.className_]) {
                            j_[n.className_] = 1;
                        } else {
                            j_[n.className_]++;
                        }
                    }
                }

                //查找出最大重叠数的类名
                for (var j in j_) {
                    if ($('.' + j).length > maxj_.value) {
                        maxj_.name = j;
                        maxj_.value = $('.' + j).length;
                        d.className_ = j;
                    }
                }
                _num = maxj_.name ? ($('.' + maxj_.name).length + 1) : 1;
                _divW = td.width() / _num;

                //为所有重叠设置宽度规则
                for (var j in j_) {
                    for (var k = 0; k < $('.' + j).length; k++) {
                        $('.' + j).eq(k)[0].style.width = _divW + 'px';
                        $('.' + j).eq(k)[0].style.left = _divW * k + 'px';
                    }
                }

                _divLf = _divW * (_num - 1);
                _div.css({
                    'top': _divTop + 'px',
                    'left': _divLf + 'px',
                    'width': _divW + 'px',
                    'height': _divH + 'px',
                    'background-color': d.arrangingCoursesStatus == '0' ? (d.course.color ? d.course.color : '#F68657') : '#eee', //已经点名的颜色快灰置
                    'color': d.arrangingCoursesStatus == '0' ? '#fff' : '#444',
                });
                _div.addClass(d.className);
                _div.addClass(d.className_);
                modelArrangingCourses[d.arrangingCoursesWeek].push(d);

                td.append(_this.compileFac(_div.append(global.renderDom_tips(d))));
            }

            //判断两个时间段是否有重叠
            function judgeTimeOverlap(t1, t1_, t2, t2_) {
                var judge = false;
                if (getTimeDiff(t1, t2) > 0) {
                    if (getTimeDiff(t1_, t2) < 0) {
                        judge = true;
                    }
                } else {
                    if (getTimeDiff(t1, t2_) > 0) {
                        judge = true;
                    }
                }
                return judge;
            }

            //转换时间（把坐标时间转换成正常时间）
            function convertTime(t) {
                var ts = t.split(','),
                    h = ts[0],
                    m = ts[1] * 15,
                    re;

                if (h < 10) {
                    h = '0' + h;
                }
                if (m < 10) {
                    m = '0' + m;
                }
                re = h + ':' + m;
                return re;
            }
        };

        //渲染dom结构（按老师）
        global.renderDom_2 = function(contain, timeFrame, dataList) {
            var table = $('<table></table>'),
                thead = $('<tr></tr>'),
                tbody = $('<tbody></tbody>'),
                th_ = $('<th></th>'),
                _this = this;

            th_.width(87);
            thead.append(th_);
            for (var i = 0; i < 7; i++) {
                var th;
                th = $('<th class="_hover" ng-mouseover="show_tips($event, 2)" ng-mouseout="show_tips($event, 3)">' + returnWeek(i + 1) + '<br/>' + timeFrame[i] + '</th>');
                if ((i + 1) == _this._data.week) {
                    th.css({ 'color': '#FA575D' });
                };
                th.addClass('th_week_' + i);
                thead.append(th);
            }

            for (var m = 0; m < dataList.length; m++) {
                var tr = $('<tr><td>' + dataList[m].shopTeacher.teacherName + '</td></tr>'),
                    d = dataList[m],
                    td, d_, _div;
                for (var n = 0; n < 7; n++) {
                    td = $('<td style="vertical-align: top!important;" ng-click="tdPaike($event)" date="' + timeFrame[n] + '" week="' + (n + 1) + '" shopTeacherId="' + dataList[m].shopTeacher.shopTeacherId + '" teacherName="' + dataList[m].shopTeacher.teacherName + '"></td>');
                    for (var k = 0; k < d.arrangingCoursesList.length; k++) {
                        d_ = d.arrangingCoursesList[k];
                        _div = $("<div class='_hover' data='" + JSON.stringify(d_) + "' ng-click='show_tips($event, 1)' ng-mouseover='show_tips($event, 2)' ng-mouseout='show_tips($event, 3)'><p>" + $.format.date(d_.arrangingCoursesBeginDate, 'HH:mm') + "  " + d_.classInfo.className + "</p></div>");
                        _div.css({
                            'display': 'block',
                            'background-color': d_.arrangingCoursesStatus == '0' ? (d_.course.color ? d_.course.color : '#F5B352') : '#eee', //已经点名的颜色快灰置
                            'color': d_.arrangingCoursesStatus == '0' ? '#fff' : '#444',
                            //          			    'background-color': d_.course.color?d_.course.color:'#F5B352',
                        });
                        if (d_.arrangingCoursesWeek == (n + 1)) {
                            td.append(_div.append(global.renderDom_tips(d_)));
                        }
                    }
                    tr.append(td);
                }
                tbody.append(tr);
            }

            contain.html('');
            table.append($('<thead></thead>').append(thead)).append(tbody);
            contain.append(_this.compileFac(table));
        }

        //渲染dom结构(按教室)
        global.renderDom_3 = function(contain, timeFrame, dataList) {
            var table = $('<table></table>'),
                thead = $('<tr></tr>'),
                tbody = $('<tbody></tbody>'),
                th_ = $('<th></th>'),
                _this = this;

            th_.width(87);
            thead.append(th_);
            for (var i = 0; i < 7; i++) {
                var th;
                th = $('<th class="_hover" ng-mouseover="show_tips($event, 2)" ng-mouseout="show_tips($event, 3)">' + returnWeek(i + 1) + '<br/>' + timeFrame[i] + '</th>');
                if ((i + 1) == _this._data.week) {
                    th.css({ 'color': '#FA575D' });
                };
                th.addClass('th_week_' + i);
                thead.append(th);
            }

            for (var m = 0; m < dataList.length; m++) {
                var tr = $('<tr><td style="overflow: hidden;">' + dataList[m].classRoom.classRoomName + '</td></tr>'),
                    d = dataList[m],
                    td, d_, _div;
                for (var n = 0; n < 7; n++) {
                    td = $('<td style="vertical-align: top!important;" ng-click="tdPaike($event)" date="' + timeFrame[n] + '" week="' + (n + 1) + '" classRoomId="' + dataList[m].classRoom.classRoomId + '" classRoomName="' + dataList[m].classRoom.classRoomName + '"></td>');
                    for (var k = 0; k < d.arrangingCoursesList.length; k++) {
                        d_ = d.arrangingCoursesList[k];
                        _div = $("<div class='_hover' data='" + JSON.stringify(d_) + "' ng-click='show_tips($event, 1)' ng-mouseover='show_tips($event, 2)' ng-mouseout='show_tips($event, 3)'><p>" + $.format.date(d_.arrangingCoursesBeginDate, 'HH:mm') + "  " + d_.classInfo.className + "</p></div>");
                        _div.css({
                            'display': 'block',
                            'background-color': d_.arrangingCoursesStatus == '0' ? (d_.course.color ? d_.course.color : '#F5B352') : '#eee', //已经点名的颜色快灰置
                            'color': d_.arrangingCoursesStatus == '0' ? '#fff' : '#444',
                            //                          'background-color': d_.course.color?d_.course.color:'#F5B352',
                        });
                        if (d_.arrangingCoursesWeek == (n + 1)) {
                            td.append(_div.append(global.renderDom_tips(d_)));
                        }
                    }
                    tr.append(td);
                }
                tbody.append(tr);
            }

            contain.html('');
            table.append($('<thead></thead>').append(thead)).append(tbody);
            contain.append(_this.compileFac(table));
        };

        //渲染排课的浮框tips
        global.renderDom_tips = function(d) {
            var _tips = '',
                _t = [];
            if (d.teachers) { //渲染课程信息
                for (var t = 0; t < d.teachers.length; t++) {
                    _t.push(d.teachers[t].teacherName);
                }
            }
            _tips = $('<ul class="sch_tips"><li class="sch_tips_point"></li></ul>');
            _tips.append('<li><label>上课时间：</label><span>' + $.format.date(d.arrangingCoursesBeginDate, 'HH:mm') + '-' + $.format.date(d.arrangingCoursesEndDate, 'HH:mm') + '</span></li>');
            _tips.append('<li><label>上课教室：</label><span>' + (d.classRoomName ? d.classRoomName : "") + '</span></li>');
            _tips.append('<li><label>课程名称：</label><span>' + d.course.courseName + '</span></li>');
            _tips.append('<li><label>班级：</label><span>' + d.classInfo.className + '</span></li>');
            _tips.append('<li><label>老师：</label><span>' + _t.join(',') + '</span></li>');
            _tips.append('<li><label>上课主题：</label><span>' + (d.arrangingCoursesTheme ? d.arrangingCoursesTheme.courseThemeName : "") + '</span></li>');
            _tips.append('<li><label>课次：</label><span>' + d.arrangingCourseOrd + '</span></li>');
            return _tips;
        }

        //渲染节假日
        global.renderDom_vac = function() {
            var _this = this,
                p = { 'beginTime': _this._data.timeFrame[0], 'endTime': yznDateAddWithFormat(_this._data.timeFrame[6], +1, "yyyy-MM-dd") };
            //获取节假日
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getHolidayList",
                type: "get",
                data: p,
                async: false,
                success: function(data) {
                    if (data.status == "200") {
                        render(data.context.items);
                    }
                }
            });

            //渲染节假日信息
            function render(dataList) {
                var _th, _sp, _ul, _li, _d = {};
                for (var i = 0; i < dataList.length; i++) {
                    for (var j = 0; j < _this._data.timeFrame.length; j++) {
                        if (!_d[j]) _d[j] = [];
                        if (_judge($.format.date(dataList[i].holidayBeginTime, 'yyyy-MM-dd'), $.format.date(dataList[i].holidayEndTime, 'yyyy-MM-dd'), _this._data.timeFrame[j])) {
                            _d[j].push(dataList[i]);
                        }
                    }
                };
                for (var t in _d) {
                    if (_d[t].length > 0) {
                        _th = $('.th_week_' + t);
                        _sp = $('<span class="th_tips_h"></span>');
                        _ul = $('<ul class="sch_tips th_tips_c"><li class="sch_tips_point"></li></ul>');
                        for (var n = 0; n < _d[t].length; n++) {
                            _li = $('<li><p><label>节假日：</label><span>' + _d[t][n].holidayTitle + '</span></p><p><label>描述：</label><span>' + _d[t][n].holidayDesc + '</span></p></li>');
                            _ul.append(_li);
                        }
                        _th.append(_sp).append(_ul);
                    }
                }
            }
            //判断日期是否是在日期段之内
            function _judge(d1, d2, w) {
                var j_1 = new Date(d1).getTime(),
                    j_2 = new Date(d2).getTime(),
                    j_3 = new Date(w).getTime();
                if (j_3 >= j_1 && j_3 <= j_2) {
                    return true;
                } else {
                    return false;
                }
            }

        }

        //渲染非营业时间
        global.renderDom_unShop = function() {
            //获取营业时间
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShopHours",
                type: "get",
                data: { 'pageType': 0 },
                async: false,
                success: function(data) {
                    if (data.status == "200") {
                        render(parseUnShopData(data.context));
                    }
                }
            });

            //渲染色块
            function render(dataList) {
                var _h, _td;
                for (var i = 0; i < dataList.length; i++) {
                    _h = $('<h6 class="sch_unshop">非营业时间</h6>');
                    _td = getTd(dataList[i].week, dataList[i].beginTime);
                    _h.css({
                        'height': getTimeDiff(dataList[i].beginTime, dataList[i].endTime) + 'px',
                        'line-height': getTimeDiff(dataList[i].beginTime, dataList[i].endTime) + 'px',
                    });
                    _td.append(_h);
                }
            }

            //给非营业时间色块添加事件
            $('.sch_unshop').on('click', function(e) {
                e.stopPropagation();
                layer.msg('非营业时间不能排课');
            });

            /*
             * 用于排序 比较时间大小
             */
            function compare(obj1, obj2) {
                var val1 = parseInt(obj1.beginTime.replace(":", ""));
                var val2 = parseInt(obj2.beginTime.replace(":", ""));
                if (val1 < val2) {
                    return -1;
                } else if (val1 > val2) {
                    return 1;
                } else {
                    return 0;
                }
            }

            /*
             * 将工作时间转成非工作时间
             * 如果为[]
             * 返回一整周
             * 因此需要补充后端没返回的星期
             */
            function parseUnShopData(shopTimeList) {
                var obj = {};
                $.each(shopTimeList, function(index, item) {
                    if (!obj[item.week]) {
                        obj[item.week] = new Array();
                    }
                    obj[item.week].push(item);
                });
                /*
                 * 补齐没返回数据的一整天
                 */
                for (var i = 1; i < 8; i++) {
                    if (!obj[i]) {
                        obj[i] = new Array();
                        obj[i].push({
                            "week": i,
                            "beginTime": "23:55:00",
                            "endTime": "06:00:00"
                        })
                    }
                }
                var unShopList = [];
                $.each(obj, function(week, list) {
                    unShopList = unShopList.concat(unShopListFac(list))
                });
                return unShopList;

                function unShopListFac(list) {
                    var res = [];
                    var sortList = list.sort(compare);
                    for (var i = 0; i < sortList.length; i++) {
                        var obj = {};
                        sortList[i].beginTime = (sortList[i].beginTime == '6:00:00') ? '06:00:00' : sortList[i].beginTime;
                        if (sortList[i].beginTime == "06:00:00" && sortList[i].endTime == "23:55:00") {
                            return [];
                        }
                        if (sortList[0].beginTime == "06:00:00") {
                            obj.beginTime = sortList[i].endTime;
                            obj.week = sortList[i].week;
                            obj.endTime = sortList[i + 1] ? sortList[i + 1].beginTime : "23:55:00";
                        } else {

                            if (i == 0) {
                                obj.beginTime = "06:00:00";
                                obj.endTime = sortList[0].beginTime
                            } else {
                                obj.beginTime = sortList[i - 1].endTime;
                                obj.endTime = sortList[i] ? sortList[i].beginTime : "23:55:00";
                            }
                            obj.week = sortList[i].week;
                        }
                        res.push(obj);

                        if (i == sortList.length - 1) {
                            var addObj = {};
                            if (sortList[0].beginTime != "06:00:00" && sortList[0].beginTime != "23:55:00") {
                                if (sortList[i].endTime != "23:55:00") {
                                    addObj.beginTime = sortList[i].endTime;
                                    addObj.endTime = "23:55:00";
                                    addObj.week = sortList[i].week;
                                    res.push(addObj);
                                } else {
                                    return res;
                                }

                            }
                        }
                    }
                    return res;
                }
            };
        }

        /*
         * 通过开始时间获取需要被渲染色块的td元素
         */
        function getTd(w, t) {
            var ts = t.split(':'),
                x = w - 1,
                y = (ts[0] - 6) * 4 + parseInt(ts[1] / 15);

            return $('.x_' + x + 'y_' + y);
        }

        /*
         * 通过开始时间和结束时间获取时间间隔
         */
        function getTimeDiff(beginTime, endTime) {
            var bTs = beginTime.split(':'),
                eTs = endTime.split(':'),
                diff = null,
                diff_ = Number(eTs[0]) - Number(bTs[0]);

            if (diff_ == 0) {
                diff = Number(eTs[1]) - Number(bTs[1]);
            } else {
                if (Number(eTs[1]) > Number(bTs[1])) {
                    diff = diff_ * 60 + Number(eTs[1]) - Number(bTs[1]);
                } else {
                    diff = (diff_ - 1) * 60 + (60 - Number(bTs[1]) + Number(eTs[1]));
                }
            }
            return diff;
        }



    })(CourseUtils);
    return CourseUtils;
})