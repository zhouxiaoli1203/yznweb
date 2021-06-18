(function(root, factory) {
	//amd
	if(typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if(typeof exports === 'object') { //umd
		module.exports = factory();
	} else {
		root.jeDate = factory(window.jQuery || $);
	}
})(this, function($) {
	var jet = {},
		doc = document,
		regymdzz = "YYYY|MM|DD|hh|mm|ss|zz",
		regymd = "YYYY|MM|DD|hh|mm|ss|zz".replace("|zz", ""),
		parseInt = function(n) {
			return window.parseInt(n, 10);
		},
		config = {
			skinCell: "jedateblue",
			language: {
				name: "cn",
				month: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
				//				weeks: ["日", "一", "二", "三", "四", "五", "六"],
				weeks: ["一", "二", "三", "四", "五", "六", "日"],
				times: ["小时", "分钟", "秒数"],
				clear: "清空",
				today: "今天",
				yes: "确定",
				close: "关闭"
			},
			trigger: "click",
			format: "YYYY-MM-DD hh:mm:ss", //日期格式
			minDate: "1900-01-01 00:00:00", //最小日期
			maxDate: "2099-12-31 23:59:59" //最大日期
		};
	$.fn.dateClass = function(options) {
		return this.each(function() {
			return new jeDate($(this), options || {});
		});
	};
	$.extend({
		dateClass: function(elem, options) {
			return $(elem).each(function() {
				return new jeDate($(this), options || {});
			});
		}
	});

	function jeDate(elem, opts) {
		this.opts = opts;
		this.valCell = elem;
		this.init();
		return this;
	}
	var jedfn = jeDate.prototype,
		jefix = "jefixed";
	jedfn.init = function() {
		var that = this,
			opts = that.opts,
			newDate = new Date(),
			jetrigger = opts.trigger != undefined ? opts.trigger : config.trigger,
			zIndex = opts.zIndex == undefined ? 2099 : opts.zIndex,
			isinitVal = (opts.isinitVal == undefined || opts.isinitVal == false) ? false : true;
			if(opts.initStartDate){
				opts.minDate = opts.initStartDate;
			}
		if(!opts.dayObj) {
			opts.dayObj = {};
		}
		jet.fixed = jet.isBool(opts.fixed);
		var fixedCell = (opts.fixedCell == undefined || opts.fixedCell == "") ? "" : "#" + this.opts.fixedCell;
		var arrayContain = function(array, obj) {
			for(var i = 0; i < array.length; i++) {
				if(array[i] == obj) return true;
			}
			return false;
		};
		var initVals = function(objCell) {
			var jeformat = opts.format || config.format,
				jeaddDate,
				inaddVal = opts.initAddVal || {},
				hmsset = opts.hmsSetVal || {};
			//判断时间为20170430这样类型的
			//var isnosepYMD = arrayContain(["YYYYMM","YYYYMMDD","YYYYMMDDhh","YYYYMMDDhhmm","YYYYMMDDhhmmss"],jeformat);
			if(jet.isObj(hmsset)) {
				jeaddDate = jet.parse([newDate.getFullYear(), jet.digit(newDate.getMonth() + 1), jet.digit(newDate.getDate())], [jet.digit(hmsset.hh), jet.digit(hmsset.mm), jet.digit(hmsset.ss)], jeformat);
			} else {
				jeaddDate = jet.returnDate(inaddVal, jeformat);
			}
			that.initDate = jeaddDate;
			var _text = that.opts.initText ? that.opts.initText : "请选择";
			(objCell.val() || objCell.text()) == "" ? jet.isValHtml(objCell) ? objCell.val(_text) : objCell.text(_text): jet.isValHtml(objCell) ? objCell.val() : objCell.text();
			//			(objCell.val() || objCell.text()) == "" ? jet.isValHtml(objCell) ? objCell.val(jeaddDate) : objCell.text(jeaddDate): jet.isValHtml(objCell) ? objCell.val() : objCell.text();
		};
		var formatDate = function(cls, boxcell) {
			var dateDiv = $("<div/>", {
					"id": boxcell.replace(/\#/g, ""),
					"class": "jedatebox " + (opts.skinCell || config.skinCell)
				}),
				reabsfix = $(fixedCell).length > 0 ? "relative" : (jet.fixed == true ? "absolute" : "fixed");
			dateDiv.attr("author", "chen guojun").css({
				"z-index": boxcell != "#jedatebox" ? "" : zIndex,
				"position": reabsfix,
				"display": "block"
			});
			if(boxcell != "#jedatebox") dateDiv.attr({
				"jeformat": opts.format || config.format,
				"jefixed": fixedCell
			});
			jet.minDate = opts.minDate || config.minDate;
			jet.maxDate = opts.maxDate || config.maxDate;
			$(cls).append(dateDiv);
			that.setHtml(opts, boxcell);
		};
		//为开启初始化的时间设置值
		if(isinitVal && jetrigger != false) {
			that.valCell.each(function() {
				initVals($(this));
			});
		}
		//判断固定元素是否存在
		if($(fixedCell).length > 0) {
			var randomCell = "#jedatebox" + searandom();
			formatDate(fixedCell, randomCell);
		} else {
			//insTrigger的值为true时内部默认点击事件
			var jd = ["body", "#jedatebox"];
			if(jetrigger != false) {
				that.valCell.on(jetrigger, function(ev) {
					ev.stopPropagation();
					if($(jd[1]).length > 0) return;
					formatDate(jd[0], jd[1]);
				});
			} else {
				formatDate(jd[0], jd[1]);
			}
		}
	}; //布局控件骨架
	jedfn.setHtml = function(opts, boxcls) {
		jet.boxelem = $($(boxcls).attr(jefix)).length > 0 ? boxcls : "#jedatebox";
		jet.format = $($(boxcls).attr(jefix)).length > 0 ? $(jet.boxelem).attr("jeformat") : (opts.format || config.format);
		jet.formatType = jet.checkFormat(jet.format);
		var that = this,
			boxCell = $(jet.boxelem),
			isYYMM = jet.testFormat(jet.format, "YYYY-MM"),
			isYY = jet.testFormat(jet.format, "YYYY");
		var doudStrHtml = '<div class="jedatetop"></div>' +
			'<div class="jedatetopym" style="display: none;"><ul class="ymdropul"></ul></div>' +
			'<ol class="jedaol"></ol><ul class="' + ((isYYMM || isYY) ? (isYY ? "jedayy" : "jedaym") : "jedaul") + '"></ul>' +
			'<div class="jedateprophms"></div>' +
			'<div class="jedatebot"></div>';
		boxCell.empty().append(doudStrHtml);
		that.generateHtml(opts, boxCell);
	};
	jet.isObj = function(obj) {
		for(var i in obj) {
			return true;
		}
		return false;
	};
	//判断是否闰年
	jet.isLeap = function(y) {
		return(y % 100 !== 0 && y % 4 === 0) || (y % 400 === 0);
	};
	jet.checkFormat = function(format) {
		var ymdhms = [];
		format.replace(new RegExp(regymdzz, "g"), function(str, index) {
			ymdhms.push(str);
		});
		return ymdhms.join("-");
	};
	jet.testFormat = function(format, conformat) {
		var mat = ["YYYY", "MM", "DD"],
			ymdhms = [],
			mats = [];
		format.replace(new RegExp(regymdzz, "g"), function(str, index) {
			ymdhms.push(str);
		});
		$.each(mat, function(m, d) {
			$.each(ymdhms, function(i, f) {
				if(d == f) mats.push(f);
			})
		});
		var reformat = format.substring(0, 2) == "hh" ? ymdhms.join("-") : mats.join("-");
		var remat = reformat == conformat ? true : false;
		return remat;
	};
	jedfn.generateHtml = function(opts, boxCell) {
		var that = this,
			objCell = that.valCell,
			weekHtml = "",
			tmsArr,
			date = new Date(), //始終今天
			date = jet.selectDate ? new Date(jet.selectDate) : (opts.initStartDate?new Date(opts.initStartDate):new Date()),
			lang = opts.language || config.language,
			isYYMM = jet.testFormat(jet.format, "YYYY-MM"),
			isYY = jet.testFormat(jet.format, "YYYY"),
			subhh = jet.format.substring(0, 2) == "hh",
			topCell = boxCell.find(".jedatetop"),
			topymCell = boxCell.find(".jedatetopym"),
			olCell = boxCell.find(".jedaol"),
			hmsCell = boxCell.find(".jedateprophms"),
			botCell = boxCell.find(".jedatebot");
		if(jet.selectDate && objCell.val() != '' && (new Date(objCell.val().substring(0, 10)) != "Invalid Date")) {
			//		if(0) {//始終在今天
			//		if((objCell.val() || objCell.text()) == ("" || opts.initText)) {
			//目标为空值则获取当前日期时间
			tmsArr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
			jet.currDate = new Date(tmsArr[0], parseInt(tmsArr[1]) - 1, tmsArr[2], tmsArr[3], tmsArr[4], tmsArr[5]);
			jet.ymdDate = tmsArr[0] + "-" + jet.digit(tmsArr[1]) + "-" + jet.digit(tmsArr[2]);
		} else {
			var initVal = (jet.isValHtml(objCell) ? objCell.val() : objCell.text(0)).substring(0, 10);
			var inVals = jet.sortDate(that.initDate, jet.format);
			if(subhh) {
				tmsArr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), inVals[0], inVals[1] || date.getMinutes(), inVals[2] || date.getSeconds()];
				jet.currDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
			} else {
				tmsArr = [inVals[0], inVals[1] == undefined ? date.getMonth() + 1 : inVals[1], inVals[2] == undefined ? date.getDate() : inVals[2], inVals[3] == undefined ? date.getHours() : inVals[3], inVals[4] == undefined ? date.getMinutes() : inVals[4], inVals[5] == undefined ? date.getSeconds() : inVals[5]];
				jet.currDate = new Date(tmsArr[0], parseInt(tmsArr[1]) - 1, tmsArr[2], tmsArr[3], tmsArr[4], tmsArr[5]);
				jet.ymdDate = tmsArr[0] + "-" + jet.digit(tmsArr[1]) + "-" + jet.digit(tmsArr[2]);
			}
		}
		//设置date的html片段
		var topStrHtml = '<div class="jedateym" style="width:100%;"><i class="prev triangle monthprev"></i><span class="jedatemm" ym="12"><em class="jedatemonth"></em><em class="pndrop"></em></span><i class="next triangle monthnext"></i></div>' +
			'<div class="jedateym" style="display:none"><i class="prev triangle yearprev"></i><span class="jedateyy" ym="24"><em class="jedateyear"></em><em class="pndrop"></em></span><i class="next triangle yearnext"></i></div>';

		var hmsStrHtml = '<div class="jedatepropcon"><div class="jedatehmstitle">' + (lang.name == "cn" ? "\u65F6\u95F4\u9009\u62E9" : "Time to choose") + '<div class="jedatehmsclose">&times;</div></div>' +
			'<div class="jedateproptext">' + lang.times[0] + '</div><div class="jedateproptext">' + lang.times[1] + '</div><div class="jedateproptext">' + lang.times[2] + '</div>' +
			'<div class="jedatehmscon jedateprophours"></div><div class="jedatehmscon jedatepropminutes"></div><div class="jedatehmscon jedatepropseconds"></div></div>';

		var botStrHtml = '<div class="botflex jedatehmsshde"><ul class="jedatehms"><li><input type="text" maxlength="2" numval="23" hms="0"></li><i>:</i><li><input type="text" maxlength="2" numval="59" hms="1"></li><i>:</i><li><input type="text" maxlength="2" numval="59" hms="2"></li></ul></div>' +
			//			'<div class="botflex jedatebtn"><span class="jedateok">' + lang.yes + '</span><span class="jedatetodaymonth">' + lang.today + '</span><span class="jedateclear">' + lang.clear + '</span></div>';
			'<div class="botflex jedatebtn"></div>';

		var ymBtnHtml = '<p><span class="jedateymchle">&lt;&lt;</span><span class="jedateymchri">&gt;&gt;</span><span class="jedateymchok">' + lang.close + '</span></p>';
		//设置html到对应的DOM中
		if(subhh) {
			boxCell.children(".jedatetop,.jedatetopym,.jedaol,.jedaul").remove();
		} else {
			topCell.append(topStrHtml);
		}
		if(isYYMM || isYY) {
			boxCell.children(".jedatetopym,.jedaol").remove();
			//设置格式为 YYYY-MM 类型的
			botCell.find(".jedatetodaymonth").hide();
			topCell.children().css({
				"width": "100%"
			}).first().remove();
			topCell.children().find(".pndrop").remove();
			boxCell.find(isYYMM ? ".jedaym" : ".jedayy").append(that.eachYM(opts, tmsArr[0], tmsArr[1], boxCell));
		} else {
			topymCell.append(ymBtnHtml);
			olCell.append(function() {
				//设置周显示
				$.each(lang.weeks, function(i, week) {
					weekHtml += '<li class="weeks" data-week="' + week + '">' + week + "</li>";
				});
				return weekHtml;
			});
		}
		botCell.append(botStrHtml);
		//是否显示清除按钮
		jet.isBool(opts.isClear) ? "" : botCell.find(".jedateclear").hide();
		//是否显示今天按钮
		(isYYMM || isYY || subhh) ? botCell.find(".jedatetodaymonth").hide(): (jet.isBool(opts.isToday) ? "" : botCell.find(".jedatetodaymonth").hide());

		//是否显示确认按钮
		jet.isBool(opts.isok) ? "" : botCell.find(".jedateok").hide();

		//开始循环创建日期--天
		if(/\DD/.test(jet.format)) {
			that.createDaysHtml(tmsArr[0], tmsArr[1], opts, boxCell);
		}
		//设置时分秒
		if(/\hh/.test(jet.format)) {
			hmsCell.append(hmsStrHtml).addClass(subhh ? "jedatepropfix" : "jedateproppos").css({
				"display": subhh ? "block" : "none"
			});
			var hmsarr = that.isContainhh(jet.format),
				hmsset = opts.hmsSetVal || {},
				hmsobj = ((objCell.val() || objCell.text()) == "" && jet.isObj(hmsset)) ? hmsset : {
					"hh": tmsArr[3],
					"mm": tmsArr[4],
					"ss": tmsArr[5]
				};
			$.each(["hh", "mm", "ss"], function(i, hms) {
				var undezz = (hmsarr[i] == undefined || hmsarr[i] == "zz"),
					inphms = botCell.find('input[hms=' + i + ']');
				inphms.val(undezz ? "00" : jet.digit(hmsobj[hms])).attr("readOnly", jet.isBool(opts.ishmsVal) ? false : true);
				if(hmsarr.length != 0 && undezz) inphms.attr("disabled", true);
			});
		} else {
			botCell.find(".jedatehmsshde").hide();
			botCell.find(".jedatebtn").css({
				width: "100%"
			});
		}
		//是否开启时间选择
		if(!jet.isBool(opts.isTime)) {
			botCell.find(".botflex").css({
				width: "100%"
			});
			botCell.find(".jedatehmsshde").hide();
		}
		//绑定各个事件
		that.eventsDate(opts, boxCell);
		if($($(jet.boxelem).attr(jefix)).length == 0) {
			//			var datepos = opts.position || [];
			//			datepos.length > 0 ? boxCell.css({
			//				"top": datepos[0],
			//				"left": datepos[1]
			//			}) : that.orien(boxCell, objCell);
			that.orien(boxCell, objCell, null, opts)
		}
		setTimeout(function() {
			opts.success && opts.success(objCell);
		}, 50);
	};
	//为日期绑定各类事件
	jedfn.eventsDate = function(opts, boxCell) {
		var that = this,
			elemCell = that.valCell,
			lang = opts.language || config.language,
			ishhmat = jet.checkFormat(jet.format).substring(0, 2) == "hh";
		if(!ishhmat) {
			that.chooseYearMonth(opts, boxCell);
		}
		if(jet.testFormat(jet.format, "YYYY") || jet.testFormat(jet.format, "YYYY-MM")) {
			that.preNextYearMonth(opts, boxCell);
			that.onlyYMevents(opts, boxCell);
		}
		//判断日期格式中是否包小时（hh）
		if(/\hh/.test(jet.format)) {
			var hsCls = boxCell.find(".jedateprophours"),
				msCls = boxCell.find(".jedatepropminutes"),
				ssCls = boxCell.find(".jedatepropseconds"),
				prophms = boxCell.find(".jedateprophms"),
				screlTopNum = 155;
			var sethmsStrHtml = function() {
				var hmsStr = that.eachStrhms(opts, boxCell),
					hmsarr = that.isContainhh(jet.format);
				prophms.css("display", "block");
				$.each([hsCls, msCls, ssCls], function(i, hmsCls) {
					if(hmsCls.html() == "") hmsCls.html(hmsStr[i]);
				});
				//计算当前时分秒的位置
				$.each(["hours", "minutes", "seconds"], function(i, hms) {
					var hmsCls = boxCell.find(".jedateprop" + hms),
						achmsCls = hmsCls.find(".action"),
						onhmsPCls = hmsCls.find("p");
					if(hmsarr.length != 0 && (hmsarr[i] != undefined && hmsarr[i] != "zz")) {
						hmsCls[0].scrollTop = achmsCls[0].offsetTop - screlTopNum;
					}
					onhmsPCls.on("click", function() {
						var _this = $(this);
						if(_this.hasClass("disabled")) return;
						_this.addClass('action').siblings().removeClass('action');
						boxCell.find(".jedatebot .jedatehms input").eq(i).val(jet.digit(_this.text()));
						if(!ishhmat) boxCell.find(".jedateprophms").hide();
					});
				})

			};
			//如果日期格式中前2个否包小时（hh），就直接显示，否则点击显示
			if(ishhmat) {
				sethmsStrHtml();
				prophms.find(".jedatehmsclose").css("display", "none");
			} else {
				boxCell.find(".jedatehms").on("click", function() {
					sethmsStrHtml();
					//关闭时分秒层
					!ishhmat && prophms.find(".jedatehmsclose").on("click", function() {
						prophms.css("display", "none");
					});
				})
			}
		}
		//检查时间输入值，并对应到相应位置
		boxCell.find(".jedatehms input").on("keyup", function() {
			var _this = $(this),
				thatval = _this.val(),
				hmsarr = that.isContainhh(jet.format),
				hmsVal = parseInt(_this.attr("numval")),
				thatitem = parseInt(_this.attr("hms"));
			_this.val(thatval.replace(/\D/g, ""));
			//判断输入值是否大于所设值
			if(thatval > hmsVal) {
				_this.val(hmsVal);
				var onval = lang.name == "cn" ? "\u8F93\u5165\u503C\u4E0D\u80FD\u5927\u4E8E " : "The input value is not greater than ";
				alert(onval + hmsVal);
			}
			if(thatval == "") _this.val("00");
			boxCell.find(".jedatehmscon").eq(thatitem).children().each(function() {
				$(this).removeClass("action");
			});
			boxCell.find(".jedatehmscon").eq(thatitem).children().eq(parseInt(_this.val().replace(/^0/g, ''))).addClass("action");
			$.each(["hours", "minutes", "seconds"], function(i, hms) {
				var hmsCls = boxCell.find(".jedateprop" + hms),
					achmsCls = hmsCls.find(".action");
				if(hmsarr.length != 0 && hmsarr[i] != undefined) {
					hmsCls[0].scrollTop = achmsCls[0].offsetTop - screlTopNum;
				}
			});
		});
		//清空按钮清空日期时间
		boxCell.find(".jedatebot .jedateclear").on("click", function(ev) {
			ev.stopPropagation();
			var clearVal = jet.isValHtml(elemCell) ? elemCell.val() : elemCell.text();
			jet.isValHtml(elemCell) ? elemCell.val("") : elemCell.text("");
			that.dateClose();
			if(clearVal != "") {
				if(jet.isBool(opts.clearRestore)) {
					jet.minDate = opts.startMin || jet.minDate;
					jet.maxDate = opts.startMax || jet.maxDate;
				}
				if($.isFunction(opts.clearfun) || opts.clearfun != null) opts.clearfun(elemCell, clearVal);
			}
		});
		//今天按钮设置日期时间
		boxCell.find(".jedatebot .jedatetodaymonth").on("click", function() {
			var newDate = new Date(),
				toTime = [newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds()],
				gettoDate = jet.parse([toTime[0], toTime[1], toTime[2]], [toTime[3], toTime[4], toTime[5]], jet.format),
				toDate = newDate.getFullYear() + "-" + jet.digit(newDate.getMonth() + 1) + "-" + jet.digit(newDate.getDate()) + " " + jet.digit(newDate.getHours()) + ":" + jet.digit(newDate.getMinutes()) + ":" + jet.digit(newDate.getSeconds());

			jet.isValHtml(elemCell) ? elemCell.val(gettoDate) : jet.text(gettoDate);
			if($(boxCell.attr(jefix)).length > 0) {
				var fixCell = "#" + boxCell.attr("id");
				that.setHtml(opts, fixCell);
			}
			that.dateClose();
			if($.isFunction(opts.choosefun) || opts.choosefun != null) opts.choosefun(elemCell, gettoDate, toDate);
		});
		//确认按钮设置日期时间
		boxCell.find(".jedatebot .jedateok").on("click", function(ev) {
			ev.stopPropagation();
			var date = new Date(),
				okhms = (function() {
					var hmsArr = [];
					boxCell.find(".jedatehms input").each(function() {
						var disattr = $(this).attr('disabled');
						if(typeof(disattr) == "undefined") hmsArr.push($(this).val());
					});
					return hmsArr;
				})(),
				datevalue = boxCell.children("ul").attr("dateval");
			var okymd = ishhmat ? [date.getFullYear(), date.getMonth() + 1, date.getDate()] : jet.reMacth(datevalue),
				okformat = $($(jet.boxelem).attr(jefix)).length > 0 ? boxCell.attr("jeformat") : jet.format,
				okVal = jet.parse([parseInt(okymd[0]), parseInt(okymd[1]), parseInt(okymd[2])], [okhms[0] || 00, okhms[1] || 00, okhms[2] || 00], okformat),
				okdate = (okymd[0] || date.getFullYear()) + "-" + jet.digit(okymd[1] || date.getMonth() + 1) + "-" + jet.digit(okymd[2] || date.getDate()) + " " + jet.digit(okhms[0] || 00) + ":" + jet.digit(okhms[1] || 00) + ":" + jet.digit(okhms[2] || 00);

			jet.isValHtml(elemCell) ? elemCell.val(okVal) : elemCell.text(okVal);
			that.dateClose();
			if($.isFunction(opts.okfun) || opts.okfun != null) opts.okfun(elemCell, okVal, okdate);
		});
		//点击空白处隐藏
		$(document).on("mouseup scroll", function(ev) {
			ev.stopPropagation();
			if(ev.type === 'scroll' && !jet.isBool(opts.isdocScroll)) return;
			if(jet.boxelem == "#jedatebox") {
				var box = $(jet.boxelem);
				if(box && box.css("display") !== "none") box.remove();
				if($("#jedatetipscon").length > 0) $("#jedatetipscon").remove();
			}
		});
		$(jet.boxelem).on("mouseup", function(ev) {
			ev.stopPropagation();
		});
	};
	jedfn.chooseDays = function(opts, boxCell) {
		var that = this,
			objCell = that.valCell,
			date = new Date(),
			lang = opts.language || config.language;
		boxCell.find(".jedaul li").on("click", function(ev) {
			var thisformat = $(boxCell.attr(jefix)).length > 0 ? boxCell.attr("jeformat") : jet.format;
			var _that = $(this),
				liTms = [];
			if(_that.hasClass("disabled")) return;
			ev.stopPropagation();
			//获取时分秒的集合
			boxCell.find(".jedatehms input").each(function() {
				liTms.push($(this).val());
			});
			//			var dateArr = jet.reMacth(_that.attr("data-ymd")),
			//				getDateVal = jet.parse([dateArr[0], dateArr[1], dateArr[2]], [liTms[0], liTms[1], liTms[2]], thisformat),
			//				wdate = (dateArr[0] || date.getFullYear()) + "-" + jet.digit(dateArr[1] || date.getMonth() + 1) + "-" + jet.digit(dateArr[2] || date.getDate()) + " " + jet.digit(liTms[0]) + ":" + jet.digit(liTms[1]) + ":" + jet.digit(liTms[2]);
			//			jet.isValHtml(objCell) ? objCell.val(getDateVal) : objCell.text(getDateVal);
			//			if($(boxCell.attr(jefix)).length > 0) {
			var fixCell = "#" + boxCell.attr("id");
			//				that.setHtml(opts, fixCell);
			//			} else {
			//				that.dateClose();
			//			}
			var dateArr = jet.reMacth(_that.attr("data-ymd")),
				getDateVal = jet.parse([dateArr[0], dateArr[1], dateArr[2]], [liTms[0], liTms[1], liTms[2]], thisformat);
			//			that.dateClose();
			opts.festival && $("#jedatetipscon").remove();
			//			if($.isFunction(opts.choosefun) || opts.choosefun != null) {
			//				opts.choosefun && opts.choosefun(opts.dayObj[getDateVal]);
			//			}
			boxCell.find(".jedaul li").removeClass("selected")
			_that.addClass("selected");
			if(!opts.dayObj[getDateVal]) {
				that.dateClose();
				objCell.attr("data-isEmpty", true);
				objCell.val(getDateVal + ' 00:00');
				if($.isFunction(opts.choosefun) && opts.choosefun != null) {
					opts.choosefun && opts.choosefun(getDateVal + ' 00:00');
				}
				jet.selectDate = getDateVal;
				opts.onChange(objCell.val());
				return;
			} else {
				objCell.attr("data-isEmpty", false);
			}
			jedfn.bindTimeList(opts.dayObj[getDateVal], objCell, opts);
		});
		if(opts.festival && lang.name == "cn") {
			//鼠标进入提示框出现
			boxCell.find(".jedaul li").on("mouseover", function() {
				var _this = $(this),
					atlunar = jet.reMacth(_this.attr("data-ymd")),
					tipDiv = $("<div/>", {
						"id": "jedatetipscon",
						"class": "jedatetipscon"
					}),
					lunar = jeLunar(parseInt(atlunar[0]), parseInt(atlunar[1]) - 1, parseInt(atlunar[2]));
				var tiphtml = '<p>' + lunar.solarYear + '\u5E74' + lunar.solarMonth + '\u6708' + lunar.solarDate + '\u65E5 ' + lunar.inWeekDays + '</p><p class="red">\u519C\u5386：' + lunar.shengxiao + '\u5E74 ' + lunar.lnongMonth + '\u6708' + lunar.lnongDate + '</p><p>' + lunar.ganzhiYear + '\u5E74 ' + lunar.ganzhiMonth + '\u6708 ' + lunar.ganzhiDate + '\u65E5</p>';
				var Fesjieri = (lunar.solarFestival || lunar.lunarFestival) != "" ? '<p class="red">' + ("\u8282\u65E5：" + lunar.solarFestival + lunar.lunarFestival) + '</p>' : "";
				var Fesjieqi = lunar.jieqi != "" ? '<p class="red">' + (lunar.jieqi != "" ? "\u8282\u6C14：" + lunar.jieqi : "") + '</p>' : "";
				var tiptext = (lunar.solarFestival || lunar.lunarFestival || lunar.jieqi) != "" ? (Fesjieri + Fesjieqi) : "";
				//生成提示框到文档中
				$("body").append(tipDiv);
				tipDiv.html(tiphtml + tiptext);
				//获取并设置农历提示框出现的位置
				var tipPos = jedfn.lunarOrien(tipDiv, _this);
				tipDiv.css({
					"z-index": (opts.zIndex == undefined ? 2099 + 5 : opts.zIndex + 5),
					top: tipPos.top,
					left: tipPos.left,
					position: "absolute",
					display: "block"
				});
			}).on("mouseout", function() { //鼠标移除提示框消失
				if($("#jedatetipscon").length > 0) $("#jedatetipscon").remove();
			});
		}
	};
	jedfn.bindTimeList = function(list, objCell,opts) {
		var that = this;
		$(".jedatebtn").empty();
		if(!list) {
			return;
		}
		$.each(list, function(i, t) {
			var d = $('<div class="item"></div>')
			var fr = $('<div class="fr"></div>');
			var fl = $('<div class="fl">' + t.beginDate.substring(11, 16) + "-" + t.endDate.substring(11, 16) + '</div>');
			var fr_l = $('<div class="fr_l"><p>学员：' + t.studentTotal + '/' + t.studentMax + '</p><p>主教：' + t.firstTeachers[0].teacherName + '</p></div>');
			var fr_r = $('<div class="fr_r"><p>进度：' + t.arrangingCoursesTime + '/' + t.allCourseTime + '</p></div>');
			if(t.secondTeachers && t.secondTeachers.length > 0) {
				for(var i = 0; i < t.secondTeachers.length; i++) {
					fr_r.append('<p>助教：' + t.secondTeachers[i].teacherName + '</p>')
				}
				if(t.secondTeachers.length > 1) {
					fl.addClass('_3t');
				}
			}
			objCell.attr("arrChange_Id", "");
			fr.append(fr_l).append(fr_r);
			d.append(fr).append(fl);
			$(".jedatebtn").append(d)
			d.click(function() {
				that.dateClose();
				jet.selectDate = t.endDate.substring(0, 10);
				//				objCell.val(t.endDate.substring(0, 10) + " " + t.beginDate.substring(11, 16) + '-' + t.endDate.substring(11, 16));
				objCell.attr("arrChange_Id", t.arrangingCoursesId);
				if(objCell.hasClass("start")) {
					objCell.val(t.endDate.substring(0, 10) + " " + t.beginDate.substring(11, 16));
				} else {
					objCell.val(t.endDate.substring(0, 10) + " " + t.endDate.substring(11, 16));
				}
                opts.onChange(objCell.val());
			});
		});
	};
	jedfn.chooseYearMonth = function(opts, boxCell) {
		var that = this,
			yPre = boxCell.find(".yearprev"),
			yNext = boxCell.find(".yearnext"),
			mPre = boxCell.find(".monthprev"),
			mNext = boxCell.find(".monthnext"),
			jetopym = boxCell.find(".jedatetopym"),
			jedateyy = boxCell.find(".jedateyy"),
			jedatemm = boxCell.find(".jedatemm"),
			jedateyear = boxCell.find(".jedateyy .jedateyear"),
			jedatemonth = boxCell.find(".jedatemm .jedatemonth"),
			lang = opts.language || config.language,
			mchri = boxCell.find(".jedateymchri"),
			mchle = boxCell.find(".jedateymchle");
		var minArr = jet.reMacth(jet.minDate),
			minNum = minArr[0] + minArr[1],
			maxArr = jet.reMacth(jet.maxDate),
			maxNum = maxArr[0] + maxArr[1];
		//循环生成年
		var eachYears = function(YY) {
				var eachStr = "",
					ycls;
				$.each(new Array(15), function(i, v) {
					if(i === 7) {
						var getyear = jedateyear.attr("year");
						ycls = (parseInt(YY) >= parseInt(minArr[0]) && parseInt(YY) <= parseInt(maxArr[0])) ? (getyear == YY ? 'class="action"' : "") : 'class="disabled"';
						eachStr += "<li " + ycls + ' yy="' + YY + '">' + (YY + (lang.name == "cn" ? "\u5e74" : "")) + "</li>";
					} else {
						ycls = (parseInt(YY - 7 + i) >= parseInt(minArr[0]) && parseInt(YY - 7 + i) <= parseInt(maxArr[0])) ? "" : 'class="disabled"';
						eachStr += '<li ' + ycls + ' yy="' + (YY - 7 + i) + '">' + (YY - 7 + i + (lang.name == "cn" ? "\u5e74" : "")) + "</li>";
					}
				});
				return eachStr;
			},
			//循环生成月
			eachYearMonth = function(YY, ymlen) {
				var ymStr = "";
				if(ymlen == 12) {
					$.each(lang.month, function(i, val) {
						var getmonth = jedatemonth.attr("month"),
							val = jet.digit(val);
						var mcls = (parseInt(jedateyear.attr("year") + val) >= parseInt(minNum) && parseInt(jedateyear.attr("year") + val) <= parseInt(maxNum)) ? (jet.digit(getmonth) == val ? "action" : "") : "disabled";
						ymStr += "<li class='" + mcls + "' mm='" + val + "'>" + (val + (lang.name == "cn" ? "\u6708" : "")) + "</li>";
					});
					$.each([mchri, mchle], function(c, cls) {
						cls.hide();
					});
				} else {
					ymStr = eachYears(YY);
					$.each([mchri, mchle], function(c, cls) {
						cls.show();
					});
				}
				jetopym.removeClass(ymlen == 12 ? "jedatesety" : "jedatesetm").addClass(ymlen == 12 ? "jedatesetm" : "jedatesety");
				boxCell.find(".jedatetopym .ymdropul").html(ymStr);
				jetopym.show();
			};
		//切换年
		$.each([yPre, yNext], function(i, cls) {
			cls.on("click", function(ev) {
				if(boxCell.find(".jedatetopym").css("display") == "block") return;
				ev.stopPropagation();
				var year = parseInt(jedateyear.attr("year")),
					month = parseInt(jedatemonth.attr("month")),
					pnYear = cls == yPre ? --year : ++year;
				that.createDaysHtml(pnYear, month, opts, boxCell);
			});
		});
		//切换月
		$.each([mPre, mNext], function(i, cls) {
			cls.on("click", function(ev) {
				if(cls.hasClass("disabled")) {
					return;
				}
				if(boxCell.find(".jedatetopym").css("display") == "block") return;
				ev.stopPropagation();
				var year = parseInt(jedateyear.attr("year")),
					month = parseInt(jedatemonth.attr("month")),
					PrevYM = jet.getPrevMonth(year, month),
					NextYM = jet.getNextMonth(year, month);
				cls == mPre ? that.createDaysHtml(PrevYM.y, PrevYM.m, opts, boxCell) : that.createDaysHtml(NextYM.y, NextYM.m, opts, boxCell);
			});
		});
		//下拉选择 年或月
		$.each([jedateyy, jedatemm], function(i, cls) {
			cls.on("click", function() {
				var clsthat = $(this),
					ymVal = clsthat.attr("ym"),
					yearAttr = parseInt(jedateyear.attr("year")),
					dropchoose = function() {
						boxCell.find(".ymdropul li").on("click", function(ev) {
							var _this = $(this),
								Years = jedateyy == cls ? parseInt(_this.attr("yy")) : parseInt(jedateyear.attr("year")),
								Months = jedateyy == cls ? parseInt(jedatemonth.attr("month")) : jet.digit(parseInt(_this.attr("mm")));
							if(_this.hasClass("disabled")) return;
							ev.stopPropagation();
							if(jedateyy == cls) {
								jedateyear.attr("year", Years).html(Years + (lang.name == "cn" ? "\u5e74" : ""));
							} else {
								jedatemonth.attr("month", Months).html(Months + (lang.name == "cn" ? "\u6708" : ""));
							}
							jetopym.hide();
							that.createDaysHtml(Years, Months, opts, boxCell);
						});
					};
				eachYearMonth(yearAttr, ymVal);
				dropchoose();
				//关闭下拉选择
				boxCell.find(".jedateymchok").on("click", function(ev) {
					ev.stopPropagation();
					jetopym.hide();
				});
				$.each([mchle, mchri], function(d, mcls) {
					mcls.on("click", function(ev) {
						ev.stopPropagation();
						d == 0 ? yearAttr -= 15 : yearAttr += 15;
						var mchStr = eachYears(yearAttr);
						boxCell.find(".jedatetopym .ymdropul").html(mchStr);
						dropchoose();
					});
				});
			})
		});
	};
	//年月情况下的事件绑定
	jedfn.preNextYearMonth = function(opts, boxCell) {
		var that = this,
			elemCell = that.valCell,
			newDate = new Date(),
			isYY = jet.testFormat(jet.format, "YYYY"),
			ymCls = boxCell.find(isYY ? ".jedayy li" : ".jedaym li");
		//选择年月
		ymCls.on("click", function(ev) {
			if($(this).hasClass("disabled")) return; //判断是否为禁选状态
			ev.stopPropagation();
			var atYM = isYY ? jet.reMacth($(this).attr("yy")) : jet.reMacth($(this).attr("ym")),
				getYMDate = isYY ? jet.parse([atYM[0], newDate.getMonth() + 1, 1], [0, 0, 0], jet.format) : jet.parse([atYM[0], atYM[1], 1], [0, 0, 0], jet.format);
			jet.isValHtml(elemCell) ? elemCell.val(getYMDate) : elemCell.text(getYMDate);
			that.dateClose();
			if($.isFunction(opts.choosefun) || opts.choosefun != null) opts.choosefun(elemCell, getYMDate);
		});
	};
	//仅年月情况下的点击
	jedfn.onlyYMevents = function(opts, boxCell) {
		var that = this,
			ymVal, newDate = new Date(),
			isYY = jet.testFormat(jet.format, "YYYY"),
			ymPre = boxCell.find(".jedateym .prev"),
			ymNext = boxCell.find(".jedateym .next"),
			onymVal = jet.reMacth(boxCell.children("ul").attr("dateval")),
			ony = parseInt(onymVal[0]),
			onm = parseInt(onymVal[1]);
		$.each([ymPre, ymNext], function(i, cls) {
			cls.on("click", function(ev) {
				ev.stopPropagation();
				if(isYY) {
					ymVal = cls == ymPre ? boxCell.find(".jedayy li").eq(0).attr("yy") : boxCell.find(".jedayy li").eq(jet.yearArr.length - 1).attr("yy");
					boxCell.find(".jedayy").html(that.eachYM(opts, ymVal, newDate.getMonth() + 1, boxCell));
				} else {
					ymVal = cls == ymPre ? ony -= 1 : ony += 1;
					boxCell.find(".jedaym").html(that.eachYM(opts, ymVal, onm, boxCell));
				}
				that.preNextYearMonth(opts, boxCell);
			});
		});
	}; //关闭层
	jedfn.dateClose = function() {
		if($($(jet.boxelem).attr(jefix)).length == 0) {
			$(jet.boxelem).remove();
		}
	};
	//方位辨别
	jedfn.orien = function(obj, self, pos, opts) {
		var tops, leris, ortop, orleri, rect = jet.fixed ? self[0].getBoundingClientRect() : obj[0].getBoundingClientRect();
		var datepos = opts.position;
		if(jet.fixed) {
			//根据目标元素计算弹层位置
			leris = rect.right + obj.outerWidth() / 1.5 >= jet.winarea(1) ? rect.right - obj.outerWidth() : rect.left + (pos ? 0 : jet.docScroll(1));
			//			tops = rect.bottom + obj.outerHeight() / 1 <= jet.winarea() ? rect.bottom - 1 : rect.top > obj.outerHeight() / 1.5 ? rect.top - obj.outerHeight() - 1 : jet.winarea() - obj.outerHeight();
			tops = rect.top - obj.outerHeight() - 1;
			ortop = Math.max(tops + (pos ? 0 : jet.docScroll()) + 1, 1) + (datepos ? datepos[1] : 0) + "px", orleri = leris + (datepos ? datepos[0] : 0) + "px";
		} else {
			//弹层位置位于页面上下左右居中
			ortop = "50%", orleri = "50%";
			obj.css({
				"margin-top": -(rect.height / 2),
				"margin-left": -(rect.width / 2)
			});
		}
		obj.css({
			"top": ortop,
			"left": orleri
		});
	};
	//循环生成日历
	jedfn.createDaysHtml = function(ys, ms, opts, boxCell) {
		if(opts.monthYearChange && typeof opts.monthYearChange == "function") {
			opts.monthYearChange(ys, (ms.toString().length > 1 ? ms : "0" + ms), function(obj, res) {
				opts.dayObj = obj;
				opts.isvalid = res;
				console.log(obj)
			});
		}
		var that = this,
			year = parseInt(ys),
			month = parseInt(ms),
			dateHtml = "",
			count = 0,
			lang = opts.language || config.language,
			ends = opts.isvalid || [],
			minArr = jet.reMacth(jet.minDate),
			minNum = minArr[0] + minArr[1] + minArr[2],
			maxArr = jet.reMacth(jet.maxDate),
			maxNum = maxArr[0] + maxArr[1] + maxArr[2],
			//			firstWeek = new Date(year, month - 1, 1).getDay() || 7,
			daysNum = jet.getDaysNum(year, month),
			prevM = jet.getPrevMonth(year, month),
			prevDaysNum = jet.getDaysNum(year, prevM.m),
			nextM = jet.getNextMonth(year, month),
			currOne = jet.currDate.getFullYear() + "-" + jet.digit(jet.currDate.getMonth() + 1) + "-" + jet.digit(1),
			thisOne = year + "-" + jet.digit(month) + "-" + jet.digit(1);
		var firstWeek = (new Date(year, month - 1, 1).getDay())?(new Date(year, month - 1, 1).getDay()-1):6;
		boxCell.find(".jedateyear").attr("year", year).text(year + (lang.name == "cn" ? "\u5e74" : ""));
		boxCell.find(".jedatemonth").attr("month", month).text(year + (lang.name == "cn" ? "\u5e74" : "") + (month > 9 ? month : '0' + month) + (lang.name == "cn" ? "\u6708" : ""));
		//设置时间标注
		var d = new Date();
		var y_ = d.getFullYear(),
			m_ = d.getMonth() + 1;
//		if(year <= y_ && month <= m_) {
//			boxCell.find(".monthprev").addClass("disabled");
//		} else {
//			boxCell.find(".monthprev").removeClass("disabled");
//		}
		var mark = function(my, mm, md) {
			var Marks = opts.marks,
				contains = function(arr, obj) {
					var len = arr.length;
					while(len--) {
						if(arr[len] === obj) return true;
					}
					return false;
				};
			return $.isArray(Marks) && Marks.length > 0 && contains(Marks, my + "-" + jet.digit(mm) + "-" + jet.digit(md)) ? '<i class="marks"></i>' : "";
		};
		//是否显示节日
		var isfestival = function(y, m, d) {
			var festivalStr;
			if(opts.festival == true && lang.name == "cn") {
				var lunar = jeLunar(y, m - 1, d),
					feslunar = (lunar.solarFestival || lunar.lunarFestival),
					lunartext = (feslunar && lunar.jieqi) != "" ? feslunar : (lunar.jieqi || lunar.showInLunar);
				festivalStr = '<p><span class="solar">' + d + '</span><span class="lunar">' + lunartext + '</span></p>';
			} else {
				festivalStr = '<p class="nolunar"><span>' + d + '</span></p>';
			}
			return festivalStr;
		};
		//判断是否在限制的日期之中
		var dateOfLimit = function(Y, M, D, isMonth) {
			var thatNum = (Y + "-" + jet.digit(M) + "-" + jet.digit(D)).replace(/\-/g, '');
			if(isMonth) {
				if(parseInt(thatNum) >= parseInt(minNum) && parseInt(thatNum) <= parseInt(maxNum)) return true;
			} else {
				if(parseInt(minNum) > parseInt(thatNum) || parseInt(maxNum) < parseInt(thatNum)) return true;
			}
		};
		//判断禁用启用是长度，并设置成正则
		if(ends.length > 0) {
			//			var dayreg = new RegExp(ends[0].replace(/,/g, "|"));
			var testArr = ends[0].split(",");
		}
		//上一月剩余天数
		for(var p = prevDaysNum - firstWeek + 1; p <= prevDaysNum; p++, count++) {
			var pmark = mark(prevM.y, prevM.m, p),
				pCls;
			if(ends.length > 0) {
				if(dateOfLimit(prevM.y, prevM.m, p, false)) {
					pCls = "disabled";
				} else {
					if(testArr.indexOf(p.toString()) > -1) {
						//						pCls = ends[1] == true ? "other" : "disabled";
						pCls = "disabled";
					} else {
						//						pCls = ends[1] == true ? "disabled" : "other";
						pCls = "disabled";
					}
				}
			} else {
				pCls = dateOfLimit(prevM.y, prevM.m, p, false) ? "disabled" : "other";
			}
			dateHtml += '<li data-ymd="' + prevM.y + '-' + prevM.m + '-' + p + '" class=' + pCls + '>' + (isfestival(prevM.y, prevM.m, p) + pmark) + '</li>';
		}
		//本月的天数
		var t_d = new Date();
		var tD = t_d.getFullYear() + "-" + jet.digit(t_d.getMonth() + 1) + "-" + jet.digit(t_d.getDate());
		for(var b = 1; b <= daysNum; b++, count++) {
			var bCls = "",
				bmark = mark(year, month, b),
				thisDate = (year + "-" + jet.digit(month) + "-" + jet.digit(b)); //本月当前日期
			//判断日期是否在限制范围中，并高亮选中的日期
			if(dateOfLimit(year, month, b, true)) {
				if(thisDate == tD) {
					bCls += " action";
				}
				if(ends.length > 0) {
					if(jet.selectDate == thisDate) {
						bCls += " selected";
						if(opts.dayObj[jet.selectDate]) { //選中的那天并且有數據
							bCls += " datas";
						}
					} else {
						if(testArr.indexOf(b.toString()) > -1) {
							bCls += ends[1] == true ? " datas" : "";
						} else {
							bCls += ends[1] == true ? "" : " datas";
						}
						if(jet.selectDate == thisDate) {
							bCls += " selected"
						}
					}
				} else {
					bCls = jet.ymdDate == thisDate ? "action" : (currOne != thisOne && thisOne == thisDate ? "action" : "");
				}
			} else {
				bCls = "disabled";
			}
			if(bCls == "action") boxCell.children("ul").attr("dateval", year + '-' + month + '-' + b);
			dateHtml += '<li data-ymd="' + year + '-' + month + '-' + b + '" class="' + (bCls != "" ? bCls : "") + '">' + (isfestival(year, month, b) + bmark) + '</li>';
		}
		//下一月开始天数
		for(var n = 1, nlen = 42 - count; n <= nlen; n++) {
			var nmark = mark(nextM.y, nextM.m, n),
				nCls;
			if(ends.length > 0) {
				if(dateOfLimit(nextM.y, nextM.m, n, false)) {
					nCls = "disabled";
				} else {
					if(testArr.indexOf(n.toString()) > -1) {
						//						nCls = ends[1] == true ? "other" : "disabled";
						nCls = "disabled";
					} else {
						//						nCls = ends[1] == true ? "disabled" : "other";
						nCls = "disabled";
					}
				}
			} else {
				nCls = dateOfLimit(nextM.y, nextM.m, n, false) ? "disabled" : "other";
			}
			dateHtml += '<li data-ymd="' + nextM.y + '-' + nextM.m + '-' + n + '" class=' + nCls + '>' + (isfestival(nextM.y, nextM.m, n) + nmark) + '</li>';
		}
		//把日期拼接起来并插入
		boxCell.find(".jedaul").empty().html(dateHtml);
		that.chooseDays(opts, boxCell);
		var objCell = that.valCell;
		if(jet.selectDate && objCell.val() != '' && (new Date(objCell.val().substring(0, 10)) != "Invalid Date")) {
			jedfn.bindTimeList(opts.dayObj[jet.selectDate], that.valCell,opts)
		}
	};
	jet.isValHtml = function(that) {
		return /textarea|input/.test(that[0].tagName.toLocaleLowerCase());
	};
	jet.isBool = function(obj) {
		return(obj == undefined || obj == true ? true : false);
	};
	jet.docScroll = function(type) {
		type = type ? "scrollLeft" : "scrollTop";
		return doc.body[type] | doc.documentElement[type];
	};
	jet.winarea = function(type) {
		return doc.documentElement[type ? "clientWidth" : "clientHeight"];
	};
	//转换日期格式
	jet.parse = function(ymd, hms, format) {
		ymd = ymd.concat(hms);
		var ymdObj = {},
			mat = regymdzz.split("|");
		$.each(ymd, function(i, val) {
			ymdObj[mat[i]] = parseInt(val);
		});
		return format.replace(new RegExp(regymdzz, "g"), function(str, index) {
			return str == "zz" ? "00" : jet.digit(ymdObj[str]);
		});
	};
	jet.sortDate = function(time, format) {
		var timeObj = {},
			newtime = [],
			mats = regymd.split("|"),
			subhh = jet.checkFormat(format).substring(0, 2) == "hh" ? true : false,
			numArr = jet.IsNum(time) ? (jet.reMacth(subhh ? time.replace(/(.{2})/g, "$1,") : time.substr(0, 4).replace(/^(\d{4})/g, "$1,") + time.substr(4).replace(/(.{2})/g, "$1,"))) : jet.reMacth(time),
			matArr = jet.IsNum(time) ? (jet.reMacth(subhh ? format.replace(/(.{2})/g, "$1,") : format.substr(0, 4).replace(/^(\w{4})/g, "$1,") + format.substr(4).replace(/(.{2})/g, "$1,"))) : jet.reMacth(format);
		$.each(numArr, function(i, val) {
			timeObj[matArr[i]] = val;
		});
		$.each(numArr, function(i, val) {
			var mathh = subhh ? mats[3 + i] : mats[i];
			newtime.push(timeObj[mathh]);
		});
		return(jet.IsNum(time)) ? (jet.reMacth(subhh ? time.replace(/(.{2})/g, "$1,") : time.substr(0, 4).replace(/^(\d{4})/g, "$1,") + time.substr(4).replace(/(.{2})/g, "$1,"))) : newtime;
	};
	jet.reMacth = function(str) {
		return str.match(/\w+|d+/g);
	};
	//获取月与年
	jet.getYM = function(y, m, n) {
		var nd = new Date(y, m - 1);
		nd.setMonth(m - 1 + n);
		return {
			y: nd.getFullYear(),
			m: nd.getMonth() + 1
		};
	};
	jet.returnDate = function(obj, format, dateval) {
		format = format || 'YYYY-MM-DD hh:mm:ss';
		var undate = (dateval == undefined || dateval == "" || dateval == []),
			darr = undate ? [] : jet.reMacth(dateval),
			sparr = [];
		if(!undate) {
			darr[1] -= 1;
			darr[1] = darr[1] == -1 ? 12 : darr[1];
		}
		var myDate = darr.length > 0 ? new Date(darr[0], darr[1], (darr[2] || 00), (darr[3] || 00), (darr[4] || 00), (darr[5] || 00)) : new Date(),
			myMM = myDate.getMonth(),
			myDD = myDate.getDate(),
			narr = [myDate.getFullYear(), myMM, myDD, myDate.getHours(), myDate.getMinutes(), myDate.getSeconds()];
		$.each(regymd.split("|"), function(i, val) {
			sparr.push(obj[val] || "");
		});
		var mday = jet.getDaysNum(narr[0], narr[1] + 1),
			isDay31 = mday == 31 && jet.digit(new Date().getDate()) == 31,
			parnaVal = narr[2] + parseInt(sparr[2] || 00),
			gday, reday;
		//判断今天是否为31号
		gday = isDay31 ? (parnaVal - 1) : parnaVal;
		//重新设置日期，必须要用new Date来设置，否则就会有问题
		var setdate = new Date(narr[0] + parseInt(sparr[0] || 00), narr[1] + parseInt(sparr[1] || 00), gday, narr[3] + parseInt(sparr[3] || 00), narr[4] + parseInt(sparr[4] || 00), narr[5] + parseInt(sparr[4] || 00));
		reday = isDay31 ? jet.digit(parseInt(setdate.getDate()) + 1) : jet.digit(setdate.getDate());
		//获取重新设置后的日期
		var reDate = jet.parse([setdate.getFullYear(), parseInt(setdate.getMonth()) + 1, reday], [jet.digit(setdate.getHours()), jet.digit(setdate.getMinutes()), jet.digit(setdate.getSeconds())], format);
		return reDate;
	};
	jet.getDaysNum = function(y, m) {
		var num = 31;
		switch(parseInt(m)) {
			case 2:
				num = jet.isLeap(y) ? 29 : 28;
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				num = 30;
				break;
		}
		return num;
	};
	//获取上个月
	jet.getPrevMonth = function(y, m, n) {
		return jet.getYM(y, m, 0 - (n || 1));
	};
	//获取下个月
	jet.getNextMonth = function(y, m, n) {
		return jet.getYM(y, m, n || 1);
	};
	//补齐数位
	jet.digit = function(num) {
		return num < 10 ? "0" + (num | 0) : num;
	};
	//判断是否为数字
	jet.IsNum = function(value) {
		return /^[+-]?\d*\.?\d*$/.test(value) ? true : false;
	};

	$.nowDate = function(str, format, date) {
		format = format || 'YYYY-MM-DD hh:mm:ss';
		date = date || [];
		if(typeof(str) === 'number') {
			str = {
				DD: str
			};
		}
		return jet.returnDate(str, format, date);
	};
	return jeDate;
})