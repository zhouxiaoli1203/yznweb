define(["laydate","datePicker", "SimpleCalendar", "pagination"], function(laydate) {
    return ['$scope', '$rootScope', '$http', '$state', '$stateParams', function($scope, $rootScope, $http, $state, $stateParams) {
        var pagerRender = false,start=0,eachPage=localStorage.getItem(getEachPageName($state))?localStorage.getItem(getEachPageName($state)):10;//页码初始化
        var clanderindex = 0,
            holidayDateObj = {};
        var myCalendar = new SimpleCalendar('#container'); //载入日历控件
        init();
        function init() {
            $scope.visitNavJud = localStorage.getItem("$statetime")?localStorage.getItem("$statetime"):2;
            staffContr0(".staff_date_disabled");
            $scope.holidayStart = "";
            $scope.holidayEnd = "";
            $scope.newHoliday = newHoliday;
            $scope.updateShopTime = updateShopTime;
            $scope.closeDialog = closeDialog;
            $scope.delHoliday = delHoliday;
            $scope.editHoliday = editHoliday;
            $scope.parseDate = parseDate;
            $scope.slideBack = slideBack;
            $scope.currHolidayId = null;
            $scope.holidayBeginTime = "";
            $scope.holidayList = [];
            $scope.isActive = false;
            $scope.switchVisitNav = switchVisitNav;
//          $scope.time_tab = function(t) {
//              $scope.tabType = t;
//              if(t == 'holiday') {
//                  $('#business_hours').hide();
//                  $('.date-content').show();
//                  getHolidayList('0');
//              }
//          };
            if($scope.visitNavJud == 2){
            }else{
                $('#business_hours').hide();
                $('.date-content').show();
                getHolidayList('0');
            }
            //日历引入
            (function() {
                lay('.laydateyear').each(function(v, k) {
                    laydate.render({
                        elem: this,
                        range: "到",
                        isRange: true,
                        btns: ['confirm'],
                        trigger: 'click',
                        done: function(value) {
                            $scope.LAYDATEYEAR = value;
                        }
                    });
                });
            })();

            $('.business_hours').click(function() { //营业时间
                $('#business_hours').show();
                $('.date-content').hide();
            })

            $('.sc-item').mouseover(function() {
                $(this).children('.time_dateadd').show();
            }).mouseout(function() {
                $(this).children('.time_dateadd').hide();
            });
            //点击添加按钮
            $('.business_hours_add div').on('click', function() {
                $('.business_shade-sel1').val('6');
                $('.business_shade-sel2').val('00');
                $('.business_shade-sel3').val('6');
                $('.business_shade-sel4').val('00');
                $scope.shopBeginHour = '00';
                $scope.shopEndHour = '00';
                addindex = $(this).parent().index();
                $scope.currShopTimeId = null;
                showShopTimeDialog();
            })
            //向表中添加时间图   添加确定
            $('.addconfirm').click(function() {
                addcolumn(addindex);
            })
            //节假日
            $('.time_reset').click(function() { //取消添加/编辑
                $('.time_date_shade').hide(400);
            })
            $('.time_addholiday').click(function(event) { //右侧添加按钮
                $('.time_date_shade').show(400);
                event.stopPropagation();
            })
            $('.time_img_edit').click(function() { //右侧详情编辑
                $('.time_date_shade').show(400);
            });
            $('.dateInput').fdatepicker({
                format: 'yyyy-mm-dd',
                pickTime: false
            });
            $('.datepicker_icon').click(function() {
                $(this).prev()[0].focus();
                //				console.log($(this).prev()[0]);
            });
            $(".sc-item").click(function() { //天数格添加点击事件。
                var year = $(".sc-select-year").val(), //获取当前选择年份。
                    month = $(".sc-select-month").val(), //获取当前选择月份。
                    day = $(this).children(".day").html(), //获取当前选择天数。
                    date = year + "-" + month + "-" + day;
                showHolidayDetail(date);
            });

            $('.time_dateadd').click(function(event) {
                if($(this).hasClass("disabled")) {
                    return;
                }
                var year = $(".sc-select-year").val(), //获取当前选择年份。
                    month = $(".sc-select-month").val(), //获取当前选择月份。
                    day = $(this).parent().children('.day').html(), //获取当前选择天数。
                    date = year + "-" + (month.length > 1 ? month : "0" + month) + "-" + (day.length > 1 ? day : "0" + day);
//              $scope.holidayBeginTime = date;

                //				$('#holidayBeginTime').val(date);
                //				$("#holidayEndTime").attr("disabled", false);
                $scope.currHolidayId = null;
                $scope.addeditName = '添加节假日';
                showNewHoliadayDialog();
//              $scope.holidayEndTime = date;
                
                $scope.LAYDATEYEAR=date+ ' 到 ' +date;
                event.stopPropagation();
                $scope.$apply()
            });
            requestData(); //初始获取数据
            //模式切换
            $scope.beginShow = '1';
            $scope.changeType = function(type) {
                if(type == "2") { //月表模式
                    $scope.isActive = true;
                    $scope.beginShow = '2';
                    slideBack1();
                    calendar();
                } else { //列表模式 
                    $scope.isActive = false;
                    pagerRender = false;
                    getHolidayList('0');
                    $scope.beginShow = '1';
                    slideBack();
                }
            }
        }

        var addindex;
        function switchVisitNav(n){
            switch (n){
                case 1:$state.go("center",{});
                    break;
                case 2:
                localStorage.setItem("$statetime", 2);
                $state.go("time",{pageType:2});
                    break;
                case 3:
                localStorage.setItem("$statetime", 3);
                $state.go("time",{pageType:3});
                    break;
                case 4:$state.go("classroom",{});
                    break;
                case 5:$state.go("functionMange",{});
                    break;
                case 6:$state.go("notice",{});
                    break;
                case 7:$state.go("nearbySchool",{});
                    break;
                case 8:$state.go("share",{});
                    break;
                default:
                    break;
            }
        }
        function showNewHoliadayDialog() {
            $scope.holidayEndTime = '';
            $scope.holidayTitle = '';
            $scope.holidayDesc = '';
            dialog = layer.open({
                type: 1,
                title: $scope.addeditName,
                skin: 'layerui', //样式类名
                closeBtn: 1, //显示关闭按钮
                move: false,
                anim: 0,
                area: ['560px', '380px'],
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $('#holidayEditWrap'),
            })
        }

        function showShopTimeDialog() {
            //			dialog = layer.open({
            //				type: 1,
            //				title: '',
            //				area: '560px',
            //				offset: '30px',
            //				closeBtn: 0,
            //				anim: 0,
            //				shadeClose: false,
            //				content: $('#shopTimeWrap')
            //			})
            dialog = layer.open({
                type: 1,
                title: '营业时间',
                skin: 'layerui', //样式类名
                closeBtn: 1, //不显示关闭按钮
                move: false,
                anim: 0,
                area: '560px',
                offset: '30px',
                shadeClose: false, //开启遮罩关闭
                content: $('#shopTimeWrap'),
            })
        }

        function closeDialog() {
            layer.close(dialog);
            $scope.holidayEndTime = '';
            $scope.holidayTitle = '';
            $scope.holidayDesc = '';
        }

        function column(obj) { //编辑    dom点击
            var uphour = $(obj).attr('uphour'),
                upmin = $(obj).attr('upmin'),
                downhour = $(obj).attr('downhour'),
                downmin = $(obj).attr('downmin'),
                hourDom = $('.time_hour'),
                minDom = $('.time_min'),
                shopHoursId = $(obj).attr('shopHoursId');
            $(hourDom[0]).val(uphour);
            $(hourDom[1]).val(downhour);
            $(minDom[0]).val(upmin.length == 1 ? "0" + upmin : upmin);
            $(minDom[1]).val(downmin.length == 1 ? "0" + downmin : downmin);
            addindex = $(obj).parent().parent().index(); //获取 
            $("#hourSelect").val(uphour);
            $("#minSelect").val(upmin.length == 1 ? "0" + upmin : upmin);
            $("#hourSelect_").val(downhour);
            $("#minSelect_").val(downmin.length == 1 ? "0" + downmin : downmin);
            $scope.shopBeginHour = $("#minSelect").val();
            $scope.shopEndHour = $("#minSelect_").val();
            $scope.currShopTimeId = shopHoursId;
            showShopTimeDialog();
            if(uphour == '24') {
                $scope.showHideTime1 = true;
            } else {
                $scope.showHideTime1 = false;

            };
            if(downhour == '24') {
                $scope.showHideTime2 = true;
            } else {
                $scope.showHideTime2 = false;
            }
        }

        function updateShopTime() {
            if(parseInt($("#hourSelect").val() + $scope.shopBeginHour) >= parseInt($("#hourSelect_").val() + $scope.shopEndHour)) {
                layer.msg("请选择正确的时间");
                return;
            }
            var param = {
                beginTime: parseInt($("#hourSelect").val()) + ":" + $scope.shopBeginHour + ":00",
                endTime: parseInt($("#hourSelect_").val()) + ":" + $scope.shopEndHour + ":00",
                week: addindex + 1
            };
            if($scope.currShopTimeId != null) {
                param.shopHoursId = $scope.currShopTimeId;
            }
            closeDialog();
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/updateShopHours",
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    layer.closeAll();
                    if(data.status == "200") {
                        requestData();
                    }
                }
            })
        }

        function renderShopHour(d) {
            $('.business_column>li>div').empty();
            for(var i = 0; i < d.length; i++) {
                var begin = d[i].beginTime,
                    beginTimelist = begin.split(":"),
                    end = d[i].endTime,
                    endTimelist = end.split(":"),
                    uphour = beginTimelist[0] * 1,
                    upmin = beginTimelist[1] * 1,
                    downhour = endTimelist[0] * 1,
                    downmin = endTimelist[1] * 1,
                    mili = 390 / (15 * 60),
                    startposition = ((uphour - 6) * 60 + upmin * 1) * mili,
                    endposition = ((downhour - 6) * 60 + downmin * 1) * mili,
                    height = endposition - startposition,
                    index = d[i].week - 1,
                    beTime = beginTimelist[0] + ":" + beginTimelist[1],
                    enTime = endTimelist[0] + ":" + endTimelist[1],
                    shopHoursId = d[i].shopHoursId;
                if(height > 50) {
                    var block = $("<div  shopHoursId='" + shopHoursId + "' class='column' uphour=" +
                        uphour + " upmin=" +
                        upmin + " downhour=" +
                        downhour + " downmin=" +
                        downmin + " style='top:" +
                        startposition + "px;height:" +
                        height + "px;'><span class='topspan'>" +
                        beTime + "</span><div></div><span class='bottomspan'>" +
                        enTime + "</span><img class='colum-cl-img' src='static/img/x.png'/></div>");
                    block.click(function() {
                        column(this);
                    });

                    $('.business_column>li>div').eq(index).append(block);
                } else {
                    var block = $("<div  shopHoursId='" + shopHoursId + "' class='column' uphour=" +
                        uphour + " upmin=" +
                        upmin + " downhour=" +
                        downhour + " downmin=" +
                        downmin + " style='top:" +
                        startposition + "px;height:" +
                        height +
                        "px;'><img class='colum-cl-img' src='static/img/x.png'/></div>");
                    block.click(function() {
                        column(this);
                    });
                    $('.business_column>li>div').eq(index).append(block);
                }
            }
            $('.colum-cl-img').click(function() {
                var $id = $(this).parent().attr('shophoursid');
                detailMsk("是否删除此段营业时间？",function(){
                    $.hello({
                            url: CONFIG.URL + "/api/oa/setting/deleteShopHours",
                            type: "post",
                            data: JSON.stringify({
                                'shopHoursId': $id
                            }),
                            success: function(data) {
                                if(data.status == "200") {
                                    requestData();
                                    layer.msg('删除成功', {
                                        icon: 1
                                    });
    
                                }
                            }
                        })
                    });
                event.stopPropagation();
            })
        }

        function requestData() {
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getShopHours",
                type: "get",
                success: function(data) {
                    if(data.status == "200") {
                        renderShopHour(data.context);
                    }
                }
            })
        }

        function parseDate(time) {
            return time.substring(0, 10);
        }

        $scope.changeshopBeginTime = function() {
            var uphour = $('.business_shade-sel1').val();
            console.log(uphour)
            if(uphour == '24') {
                $scope.showHideTime1 = true;
                $scope.shopBeginHour = '00';
            } else {
                $scope.showHideTime1 = false;
            }
        }

        $scope.changeshopEndTime = function() {
            var downhour = $('.business_shade-sel3').val();
            console.log(downhour)
            if(downhour == '24') {
                $scope.showHideTime2 = true;
                $scope.shopEndHour = '00';
            } else {
                $scope.showHideTime2 = false;
            }
        }

        function addcolumn(index) { //column添加
            var uphour = $('.business_shade-sel1').val(),
                upmin = $('.business_shade-sel2').val(),
                downhour = $('.business_shade-sel3').val(),
                downmin = $('.business_shade-sel4').val(),
                beginTime = uphour + ":" + upmin + ":00",
                endTime = downhour + ":" + downmin + ":00",
                sumbeginTime = uphour * 60 + upmin * 1,
                sumendTime = downhour * 60 + downmin * 1;

            if(sumbeginTime < sumendTime) {
                var param = {
                    beginTime: beginTime,
                    endTime: endTime,
                    week: index + 1
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/updateShopHours",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if(data.message == 200) {
                            requestData(); //获取数据
                            layer.closeAll();
                        }
                    }
                })
            } else {
                layer.msg('请正确选择时间')
            }
        }
        /*
         * 节假日
         * 
         */
        //获取节假日列表 /api/oa/setting/getHolidayList
        function getHolidayList(start) {
            var param = {
                'start': start,
                'count': eachPage
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getHolidayList",
                type: "get",
                data: param,
                success: function(data) {
                    if(data.status == '200') {
                        var da = data.context.items;
                        for(var i = 0; i < da.length; i++) {
                            da[i].YNshow=getDateOperate(da[i].holidayBeginTime);
                        }
                        $scope.$getHolidayList = da;
                        $scope.totalNum = data.context.totalNum;
                        renderPager(data.context.totalNum);
                    }
                }
            })
        }
        function getDateOperate(time){
            if(time){
                var today = parseInt(thisTime().replace(/\-/g, ""));
                var begindate = parseInt(time.replace(/\-/g, ""));
                if(begindate < today) {
                    return false;
                } else {
                    return true;
                }
            }else{
                return false;
            }
        }
        function renderPager(total) { //分页
            if(pagerRender)
                return;
            pagerRender = true;
            var $M_box3 = $('.M-box3');
            $M_box3.pagination({
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
                    if(api.getCurrentEach() != eachPage) {  //本地存储记下每页多少条
                        eachPage = api.getCurrentEach();
                        localStorage.setItem(getEachPageName($state), eachPage);
                    }
                    start = (api.getCurrent() - 1) * eachPage; // 分页从0开始
                    getHolidayList(start); //回掉
                }
            });
        }
        //列表模式  添加节假日
        $scope.btnAdd_jia = function() {
            $scope.addeditName = '添加节假日';
            $scope.LAYDATEYEAR = '';
            $scope.currHolidayId = null;
            showNewHoliadayDialog();
        }

        //呼出列表 详情
        $scope.getDetail = function(data) {
            slideOut1();
            var today = parseInt(thisTime().replace(/\-/g, ""));
            var begindate = parseInt(data.holidayBeginTime.replace(/\-/g, ""));
            if(begindate < today) {
                $scope.YNshow = false;
            } else {
                $scope.YNshow = true;
            }
            $scope.$getDetail = data;
        }
        //收回列表 详情
        $scope.slideBack1 = function() {
            slideBack1();
        }

        //列表模式  编辑
        //showNewHoliadayDialog()
        $scope.editHolidayType2 = function(x) {
            var data = angular.copy(x);
            $scope.LAYDATEYEAR = '';
            $scope.addeditName = '编辑节假日';
            showNewHoliadayDialog();
            $scope.holidayTitle = data.holidayTitle;
            $scope.holidayDesc = data.holidayDesc;
            $scope.LAYDATEYEAR=yznDateFormatYMd(data.holidayBeginTime)+' 到 '+yznDateFormatYMd(data.holidayEndTime);
            $scope.currHolidayId = data.holidayId;
        }

        $scope.deleteHolidayType2 = function(x) {
            layer.confirm('是否删除假期 "' + x.holidayTitle + '"？', {
                title: "确认删除信息",
                skin: 'newlayerui layeruiCenter',
                closeBtn: 0,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['是', '否'] //按钮
            },function() {
                var param = {
                    holidayId: x.holidayId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/deletesHoliday",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if(data.status == "200") {
                            layer.closeAll();
                            layer.msg('删除成功', {
                                icon: 1
                            });
                            pagerRender = false;
                            getHolidayList('0');
                            slideBack1()
                        }
                    }
                })
            } ,function() {
                layer.closeAll();
            })
        }

        function calendar() {
            $scope.holidayTitle = "";
            $scope.holidayDesc = "";
            var param = {
                day: "2017-04-05T12:43:51.00:0+0800"
            };
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/getHoliday",
                type: "get",
                data: null,
                success: function(data) {
                    if(data.status == 200) {
                        renderHoliday(data.context);
                        myCalendar.updateEvent = function() {
                            $('.sc-item').unbind("click");
                            renderHoliday(data.context);
                        };
                    }
                }
            })
        }

        function renderHoliday(holidayList) {
            console.log(holidayList);
            var dates = $('.sc-item'),
                year = $(".sc-select-year").val(), //获取当前选择年份。
                month = $(".sc-select-month").val(); //获取当前选择月份。
            holidayDateObj = {};
            dates.removeClass("sc-today");
            dates.removeClass('sc-festival');

            dates.children(".lunar-day").text("").removeClass("holiday1");
            dates.children(".lunar-day.holiday2").remove();
            dates.children(".time_dateadd").removeClass("curr_day_add").removeClass("disabled").removeClass("common_opacity");
            var countTag = 1;
            var today = new Date(),
                d1 = today.getFullYear() + "",
                d2 = today.getMonth() + 1 + "",
                d3 = today.getDate() + '';
            var todayNum = parseInt(d1 + "" + (d2.length > 1 ? d2 : ("0" + d2)) + (d3.length > 1 ? d3 : "0" + d3));
            $.each(dates, function(index, days) {
                var day = parseInt($(this).children(".day").html()),
                    tagNum;
                var dateNum = parseInt(year + (month.length > 1 ? month : ("0" + month)) + ((day + "").length > 1 ? day : ("0" + day)));
                //				console.log(dateNum)
                //				console.log(todayNum)
                if(dateNum <= todayNum) {
                    $(days).children(".time_dateadd").addClass("disabled").addClass("common_opacity");
                }
                if(countTag == 1) {
                    if(day > 1) {
                        return true;
                    }
                    if(day == 1) {
                        countTag = day + 1;
                    }
                }
                if(countTag != (day + 1)) {
                    return false;
                } else {
                    countTag++;
                }
                var dateNum = parseInt(numToString(year) + (numToString(month).length > 1 ? numToString(month) : "0" + numToString(month)) + (numToString(day).length > 1 ? numToString(day) : "0" + numToString(day)));
                for(var i = 0, length = holidayList.length; i < length; i++) {
                    var beginTimeNum = utcDateToNum(holidayList[i].holidayBeginTime);
                    var endTimeNum = utcDateToNum(holidayList[i].holidayEndTime);
                    if(dateNum >= beginTimeNum && dateNum <= endTimeNum) {
                        $(days).children(".time_dateadd").addClass("curr_day_add");
                        if(!holidayDateObj[dateNum]) {
                            holidayDateObj[dateNum] = [];
                            holidayDateObj[dateNum].push(holidayList[i]);
                        } else {
                            holidayDateObj[dateNum].push(holidayList[i]);
                        }
                        $(days).addClass("sc-today");
                        if(dateNum == beginTimeNum) {
                            $(days).children(".lunar-day").append("<span class='ying-span'>" + holidayList[i].holidayTitle + "</span>").addClass("holiday1");
                        }
                    }
                }
                $(days).click(function() {
                    showHolidayDetail(holidayDateObj[dateNum]);
                })
            })
            //			$(".holiday1").after('<div class="lunar-day holiday2">通知</div>');
        }

        function numToString(num) {
            return num + "";
        }

        function showHolidayDetail(holidays) {
            if(typeof holidays === 'object' && !isNaN(holidays.length)) {
                slideOut();
                $scope.holidayList = holidays;
                try {
                    $scope.$apply();
                } catch(e) {
                    //TODO handle the exception
                }
            }
        }

        $scope.getEditIcon = function(holiday) {
            var sDate = parseInt(holiday.holidayBeginTime.substring(0, 10).replace(/\-/g, ""));
            var eDate = parseInt(holiday.holidayEndTime.substring(0, 10).replace(/\-/g, ""));
            var today = parseInt(thisTime().replace(/\-/g, ""));
            if(sDate <= today || eDate <= today) {
                return "static/img/tanchu_bianjihui.png";
            } else {
                return "static/img/tanchu_bianji.png";
            }
        }

        $scope.getDelIcon = function(holiday) {
            var sDate = parseInt(holiday.holidayBeginTime.substring(0, 10).replace(/\-/g, ""));
            var eDate = parseInt(holiday.holidayEndTime.substring(0, 10).replace(/\-/g, ""));
            var today = parseInt(thisTime().replace(/\-/g, ""));
            if(sDate <= today || eDate <= today) {
                return "static/img/tanchu_shanchuhui.png";
            } else {
                return "static/img/tanchu_shanchu.png";
            }
        }

        var editDataIndex;

        function editHoliday(holiday, $event, $index) {
            if($($event.currentTarget).children("img").attr("src") == "static/img/tanchu_bianjihui.png") {
                return;
            }
            $scope.addeditName = '编辑节假日';
            showNewHoliadayDialog();
            editDataIndex = $index;
            $("#holidayEndTime").removeAttr("disabled");
            $scope.holidayTitle = holiday.holidayTitle;
            $scope.holidayDesc = holiday.holidayDesc;
            $scope.currHolidayId = holiday.holidayId;
//          $scope.holidayBeginTime = parseDate(holiday.holidayBeginTime);
//          $scope.holidayEndTime = parseDate(holiday.holidayEndTime);
            
            $scope.LAYDATEYEAR=parseDate(holiday.holidayBeginTime)+' 到 '+parseDate(holiday.holidayEndTime);
        }

        function delHoliday(holiday, ind, $event) {
            if($($event.currentTarget).children("img").attr("src") == "static/img/tanchu_shanchuhui.png") {
                return;
            }
            layer.confirm('是否删除假期 "' + holiday.holidayTitle + '"？', {
                title: "确认删除信息",
                skin: 'layerui layeruiCenter',
                closeBtn: 0,
                offset: '30px',
                move: false,
                area: '560px',
                btn: ['否', '是'] //按钮
            }, function() {
                layer.closeAll();
            }, function() {
                var param = {
                    holidayId: holiday.holidayId
                };
                $.hello({
                    url: CONFIG.URL + "/api/oa/setting/deletesHoliday",
                    type: "post",
                    data: JSON.stringify(param),
                    success: function(data) {
                        if(data.status == "200") {
                            layer.closeAll();
                            layer.msg('删除成功', {
                                icon: 1
                            });
                            calendar();
                            if($scope.holidayList.length > 1) {
                                $scope.holidayList.splice(ind, 1);
                            } else {
                                slideBack();
                            }
                        }
                    }
                })
            })

        }

        function utcDateToNum(str) {
            return parseInt(str.substring(0, 10).replace(/-/g, ''));
        }

        function newHoliday() {
            var doms = $('.formRequired'),
                dom,
                er = false;

            $.each(doms, function(index, item) {
                if($(item).val().isEmpty()) {
                    er = true;
                    dom = item;
                    return false;
                }
            });
            if(er) {
                dom.focus();
                return;
            }
//          if(utcDateToNum($scope.holidayEndTime) - utcDateToNum($scope.holidayBeginTime) < 0) {
//              layer.msg("请选择正确的日期范围！");
//              return;
//          }
            var api = $scope.currHolidayId == null ? "addHoliday" : "updatesHoliday";
            var param = {
                holidayDesc: $scope.holidayDesc,
                holidayEndTime: $scope.LAYDATEYEAR.split(" 到 ")[1] + " 23:59:59",
                holidayBeginTime: $scope.LAYDATEYEAR.split(" 到 ")[0] + " 00:00:00",
                holidayTitle: $scope.holidayTitle
            };
            if($scope.currHolidayId != null) {
                param.holidayId = $scope.currHolidayId;
            }
            $.hello({
                url: CONFIG.URL + "/api/oa/setting/" + api,
                type: "post",
                data: JSON.stringify(param),
                success: function(data) {
                    if(data.status == "200") {
                        closeDialog();
                        calendar();
                        if($scope.currHolidayId != null) {
                            if(!$scope.isActive) {
                                pagerRender = false;
                                getHolidayList('0');
//                              $scope.$getDetail.holidayTitle = param.holidayTitle;
//                              $scope.$getDetail.holidayDesc = param.holidayDesc;
//                              $scope.$getDetail.holidayEndTime = parseDate(param.holidayEndTime);
//                              $scope.$getDetail.holidayBeginTime = $scope.holidayBeginTime;
                            } else {
                                $scope.holidayList[editDataIndex].holidayTitle = param.holidayTitle;
                                $scope.holidayList[editDataIndex].holidayDesc = param.holidayDesc;
                                $scope.holidayList[editDataIndex].holidayBeginTime = param.holidayBeginTime;
                                $scope.holidayList[editDataIndex].holidayEndTime = param.holidayEndTime;
                            }
                            layer.msg('修改成功！', {
                                icon: 1
                            });
                        } else {
                            pagerRender = false;
                            getHolidayList('0');
                            layer.msg('添加成功', {
                                icon: 1
                            });
                        }
                    }
                }
            })
        }
    }]
})