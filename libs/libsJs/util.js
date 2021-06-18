define(function() {
	var MyUtils = MyUtils || {},
		cutDialog;
	"use strict";
	(function(global) {

		/*
		 * 获取非营业时间
		 */
		global.getUnShopList = function(shopTimeList) {
			var res = [];
			var p = {
				'pageType': 0
			};
			$.hello({
				url: CONFIG.URL + "/api/oa/setting/getShopHours",
				type: "get",
				data: p,
				async: false,
				success: function(data) {
					if(data.status == "200") {
						res = global.parseUnShopData(data.context);
					}
				}
			});
			return res;
		};
		/*
		 * 用于排序 比较时间大小
		 */
		function compare(obj1, obj2) {
			var val1 = parseInt(obj1.beginTime.replace(":", ""));
			var val2 = parseInt(obj2.beginTime.replace(":", ""));
			if(val1 < val2) {
				return -1;
			} else if(val1 > val2) {
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
		global.parseUnShopData = function(shopTimeList) {
			var obj = {};
			$.each(shopTimeList, function(index, item) {
				if(!obj[item.week]) {
					obj[item.week] = new Array();
				}
				obj[item.week].push(item);
			});
			/*
			 * 补齐没返回数据的一整天
			 */
			for(var i = 1; i < 8; i++) {
				if(!obj[i]) {
					obj[i] = new Array();
					obj[i].push({
						"week": i,
						"beginTime": "22:00:00",
						"endTime": "07:00:00"
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
				for(var i = 0; i < sortList.length; i++) {
					var obj = {};
					if(sortList[i].beginTime == "07:00:00" && sortList[i].endTime == "22:00:00") {
						return [];
					}
					if(sortList[0].beginTime == "07:00:00") {
						//						if(sortList[0].endTime=="22:00:00"){
						//							
						//						}
						obj.beginTime = sortList[i].endTime;
						obj.week = sortList[i].week;
						obj.endTime = sortList[i + 1] ? sortList[i + 1].beginTime : "22:00:00";
					} else {
						if(i == 0) {
							obj.beginTime = "07:00:00";
							obj.endTime = sortList[0].beginTime
						} else {
							obj.beginTime = sortList[i - 1].endTime;
							obj.endTime = sortList[i] ? sortList[i].beginTime : "22:00:00";
						}
						obj.week = sortList[i].week;
					}
					res.push(obj);

					if(i == sortList.length - 1) {
						var addObj = {};
						if(sortList[0].beginTime != "07:00:00" && sortList[0].beginTime != "22:00:00") {
							if(sortList[i].endTime != "22:00:00") {
								addObj.beginTime = sortList[i].endTime;
								addObj.endTime = "22:00:00";
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

		/*
		 * 按key分组 可分组teacherId 和week
		 * 返回key list 的结构
		 */
		global.groupByKey = function(list, key) {
			var obj = {};
			$.each(list, function(index, item) {
				if(!obj[item[key]]) {
					obj[item[key]] = new Array();
				}
				obj[item[key]].push(item);
			});
			return obj;
		};

		/*
		 * 计算对象属性个数
		 */
		global.ObjKeyNum = function(obj) {
			var count = 0;
			for(var p in obj) {
				count++;
			}
			return count;
		};

		global.PaikeModel = function(week, beginTime, endTime, courseNum) {
			this.week = week,
				this.beginTime = beginTime,
				this.endTime = endTime,
				this.oneCourseTime = courseNum
		};
		/*
		 * 
		 * 
		 paike插件
		 
		 根据教师 主教 教室呈现表格
		 
		 三个渲染方法传入课排课时间
		 结构
		[{
			"beginTime": "07:00:00",
			"endTime": "22:00:00",
			"week": 1
		}, {
			"beginTime": "07:00:00",
			"endTime": "22:00:00",
			"week": 2
		}, {
			"beginTime": "07:00:00",
			"endTime": "22:00:00",
			"week": 3
		}, {
			"beginTime": "07:00:00",
			"endTime": "22:00:00",
			"week": 4
		}]
		 
		 封装到点击事件
		 点击返回成块区域的左上角第一个元素和中间最后一个元素
		 
		 */

		global.paikePlugIn = function(config) {
			var clickNum = 4;
			var clickNum_ = 0;	//以15分钟为基数，不满15分钟的余数占比(以下统称为小数点位)
			var clickNumDiff = 0;	//当排一节大课时的格数
			var PaikeModel = function(week, beginTime, endTime, courseNum) {
				this.week = week,
					this.beginTime = beginTime,
					this.endTime = endTime,
					this.oneCourseTime = courseNum
			};
			var
				unShopTimeObj,
				yipaikeModelArr = [],
				yipaikeTarget = [],
				yipaikeTarget_ = [],
				index_ = 0;
			this.container = config.container; //table的容器
			//		this.initCall = config.initCall; //初始化完成后回调，主要执行在table中非营业时间 排课模块的位置计算
			this.disableCall = config.disableCall; //禁用點擊回調 返回false 點擊無效
			//		this.clickCall = config.clickCall; //点击table的回调，主要去处理点击之后展示排课模块等，以为各排课业务不一样，就没封装
			this.compileFac = config.compileFac; //动态创建的节点，未经编译无法使用angular方法，传入angular编译服务
			this.single = config.single;
			this.scope = config.getScope;
			this.addPaikeCall = config.addPaikeCall;
			this.banClean = config.banClean;
			this.Teacher1 = null; //存主教
			this.Teacher2 = null; //存助教
			this.Teacher3 = null; //存助教
			this.classRoom = null; //存教室
			this.target = null; //所点击的左上角td
			this.posTarget = null; //所点击的中间最下方的td
			this.disable = false; //点击失效，用于处理点击不需要响应了，这里只用在了变更排课等只要排一次的情况 排了一节课之后设置不能点击
			this.setDisabled = function(state) { //点击失效，用于处理点击不需要响应了，这里只用在了变更排课等只要排一次的情况 排了一节课之后设置不能点击
				this.disable = state;
			};
			this.getYipaikeTarget = function() {
				return yipaikeTarget;
			};
			this.setNum = function(num) {
				clickNum = parseInt(num / 15);
				clickNum_ = num % 15 / 5;
				console.log(clickNum)
				console.log(clickNum_)
			};
			this.getNum = function() {
				return clickNum;
			};
			this.veriifyTarget = function(target) {
				if(!_this.Teacher2 && !_this.Teacher3) {
					return judgeOne(target);
				}
				if(_this.Teacher2 && _this.Teacher3) {
					return judgeThree(target);
				}
				return judgeTwo(target);
			};
			var mainBox = $('<div class="paikePlugIn"></div>');
			this.getPaikeData = function() {
				return yipaikeModelArr;
			};
			this.setYipaikeModelArr = function(arr) {
				yipaikeModelArr = arr;
			};
			this.setYipaikeTarget = function(tars, tars_) {
				var _this = this;
				$.each(tars, function(i, d) {
					var judge = judgeComBine(d, tars_[i]);
					if(judge[0] === true) {
						switch(judge[1]) {
							case 1: //上下都有
								var arr1 = getIndexOfYipaikeTd(d, "top");
								var arr2 = getIndexOfYipaikeTd(tars_[i], "down");
								yipaikeTarget_[arr1[0]] = yipaikeTarget_[arr2[0]];
								addYipaikeStatus(d);
								yipaikeModelArr[arr1[0]].endTime = yipaikeModelArr[arr2[0]].endTime;
								yipaikeModelArr[arr1[0]].beginTime = yipaikeModelArr[arr1[0]].beginTime;
								yipaikeModelArr[arr1[0]].oneCourseTime = parseInt($('#addPaike_count').val()) + parseInt(yipaikeModelArr[arr1[0]].oneCourseTime) + parseInt(yipaikeModelArr[arr2[0]].oneCourseTime);
								yipaikeTarget.splice(arr2[0], 1);
								_this.scope().yipaikeModelStyleArr[arr1[0]] = getTargetPos(yipaikeTarget[arr1[0]], arr1[1] / clickNum + arr2[1] / clickNum + 1);
								yipaikeTarget_.splice(arr2[0], 1);
								yipaikeModelArr.splice(arr2[0], 1);
								_this.scope().yipaikeModelStyleArr.splice(arr2[0], 1);
								break;
							case 2: //上有
								var arr = getIndexOfYipaikeTd(d, "top");
								yipaikeTarget_[arr[0]] = tars_[i];
								addYipaikeStatus(d);
								_this.scope().yipaikeModelStyleArr[arr[0]] = getTargetPos(yipaikeTarget[arr[0]], arr[1] / clickNum + 1);
								yipaikeModelArr[arr[0]].endTime = $('#addPaike_min').text();
								yipaikeModelArr[arr[0]].oneCourseTime = parseInt($('#addPaike_count').val()) + parseInt(yipaikeModelArr[arr[0]].oneCourseTime);
								break;
							case 3: //下有
								var arr = getIndexOfYipaikeTd(tars_[i], "down");
								yipaikeTarget[arr[0]] = d;
								addYipaikeStatus(d);
								_this.scope().yipaikeModelStyleArr[arr[0]] = getTargetPos(yipaikeTarget[arr[0]], arr[1] / clickNum + 1);
								yipaikeModelArr[arr[0]].beginTime = $('#addPaike_hour').text();
								yipaikeModelArr[arr[0]].oneCourseTime = parseInt($('#addPaike_count').val()) + parseInt(yipaikeModelArr[arr[0]].oneCourseTime);
								break;
							default:
								break;
						}
					} else {
						addYipaikeStatus(d);
						yipaikeModelArr.push(new global.PaikeModel($('#addPaike_week').attr("week"), $('#addPaike_hour').text(), $('#addPaike_min').text(), $('#addPaike_count').val()));
						yipaikeTarget.push(d);
						_this.scope().yipaikeModelStyleArr.push(getTargetPos(d));
						yipaikeTarget_.push(tars_[i]);
					}
				});
			};
			this.setYipaikeTarget_ = function(arr) {
				yipaikeTarget_ = arr;
			};
			this.initData = function() {
				//清空排课数据
				yipaikeModelArr = [];
				this.scope().yipaikeModelStyleArr = [];
				yipaikeTarget = [];
				yipaikeTarget_ = [];
				$('.dopaike').hide();
				mainBox.find(".paikeTable").find("td").removeClass("added");
				return this;
			};
			this.initFillBlock = function() {
				$('.paikeTeahcer').removeClass("curr");
				$('.paike_classroom').removeClass("curr");
				return this;
			}
			this.clear = function() {
				this.Teacher1 = null;
				this.Teacher2 = null;
				this.Teacher3 = null;
				this.classRoom = null;
				return this;
			};
			var _this = this;
			var init = function() {
				/*
				 * 初始化排課table，放入container中
				 */
				mainBox.empty().css({
					"position": "relative",
					"width": "100%",
					"height": "100%"
				});
				var left = $('<div class="left"></div>'),
					right = $('<div class="right"></div>'),
					ul1 = $('<ul></ul>'),
					ul2 = $('<ul></ul>');
				for(var i = 0; i < 16; i++) {
					ul1.append('<li>' + (7 + i) + ':00</li>');
				}
				left.append(ul1);
				ul2.append('<li>星期一</li>').append('<li>星期二</li>').append('<li>星期三</li>').append('<li>星期四</li>').append('<li>星期五</li>').append('<li>星期六</li>').append('<li>星期日</li>');
				var head = $('<div class="head"></div>'),
					paikebox = $('<div class="paikebox"></div>');
				var table = $('<table class="paikeTable"></table>');
				var tbody = $('<tbody ng-click="paike_($event)"></tbody>');
				for(var i = 0; i < 60; i++) {
					var time = parseInt(i / 4) + 7 + "," + (i % 4);
					var hour = parseInt(i / 4) + 7;
					var min = i % 4;
					var tr = $('<tr time="' + time + '"></tr>');
					for(var j = 0; j < 21; j++) {
						var week = Math.ceil((j + 1) / 3);
						var td;
						if(j % 3 == 1) {
							td = $('<td col="2" week="' + week + '" time="' + time + '" class="paikeTeahcer paike_helpTeacher week' + week + '" id="w' + week + 't' + time.replace(",", "_") + 'c2"></td>')
							td.attr("x", j).attr("y", i).addClass("x_" + j + "y_" + i).addClass("col2");
							td.append($('<div class="paikeTeahcer paike_helpTeacher1 week' + week + '" week="' + week + '" time="' + time + '"></div>')).append($('<div class="paikeTeahcer paike_helpTeacher2 week' + week + '" week="' + week + '" time="' + time + '" ></div>')).addClass("col2");
						} else if(j % 3 == 0) {
							td = $('<td col="1" week="' + week + '" time="' + time + '" class="paikeTeahcer paike_mainteacher week' + week + '" id="w' + week + 't' + time.replace(",", "_") + 'c1"></td>');
							td.attr("x", j).attr("y", i).addClass("x_" + j + "y_" + i).addClass("col1");
						} else {
							td = $('<td col="3" week="' + week + '" time="' + time + '" class="paike_classroom week' + week + '" id="w' + week + 't' + time.replace(",", "_") + 'c3"></td>')
							td.attr("x", j).attr("y", i).addClass("x_" + j + "y_" + i).addClass("col3");
						}
						tr.append(td);
					}
					tbody.append(tr);
				}
				paikebox.append(table);
				_this.scope().intervalTime = [];
//				_this.scope().intervalTime = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140];	//允许大课的时间
				for(var i = 6; i < 40; i++) {
					_this.scope().intervalTime.push(i * 5);
				}
				_this.scope().judIntTime = false;
				paikebox.append(_this.compileFac($('<div class="paike_selectedbox dopaike" style="display: none;" ng-style="shadowPos"></div>')));
				paikebox.append(_this.compileFac($('<div class="paike_tag dopaike" style="display: none;" ng-style="targetPos">' +
					'<div class="info">' +
					'<div><span class="week" id="addPaike_week">星期一</span>' +
					'<div class="up_down"><span class="time" ng-click="addSubJud? judIntTime=true:judIntTime=false"><span id="addPaike_hour"></span>-<span id="addPaike_min"></span></span>' +
					'<em class="bitUp" ng-click="bitUp()" ng-if="addSubJud"></em><em class="bitDown" ng-click="bitDown()" ng-if="addSubJud"></em>'+
					'<div class="int_time" ng-if="judIntTime"><ul><li ng-click="getIntervalTime(n)" ng-repeat="n in intervalTime">{{n}}分钟</li></ul></div></div></div>' +
					'<div style="padding-top: 0;">' +
					'<span class="week">课时</span>' +
					'<input id="addPaike_count" value="1" yzn-filter="num_" maxlength="5" type="text" style="width:42px" />' +
					'</div>' +
					'</div>' +
					'<div class="btnbox">' +
					'<div class="common_block cancel addPaike" ng-click="cancelBlock_()" ng-hide="modifyBlock">取消</div>' +
					'<div class="common_block cancel modify" ng-click="removeBlock()" ng-show="modifyBlock">移除</div>' +
					'<div class="common_block confirm addPaike" ng-click="sureBlock()">{{modifyBlock?"修改":"确定"}}</div>' +
					'</div>' +
					'</div>'
				)));
				paikebox.append(_this.compileFac($('<div class="yipaike common_click" ng-repeat="x in yipaikeModelStyleArr track by $index" ng-click="cancelBlock($index)" ng-style="x">' +
					'<span class="icon"></span>' +
					'<span>已排课</span>' +
					'</div>'
				)));
				head.append(ul2);
				right.append(head).append(paikebox);
				table.append(_this.compileFac(tbody));
				mainBox.append(left).append(right);
				$(_this.container).empty().append(mainBox);
				initStyle();
				initEvent();
			}
			var renderUnShop = function() {
				renderUnShopTime(global.getUnShopList());
			};

			init();
			renderUnShop();

			function renderUnShopTime(list) {
				var dyHeight = $('.paikeTable').height() / 60;	//td的动态高度
				
				unShopTimeObj = groupByKey(list, "week");
				$('.restArea').remove();
				var w = $('.paikeTable').width() / 21;
				$.each(list, function(index, item) {
					var week = item.week;
					var stime = (parseInt(item.beginTime.substring(0, 2)) + "," + (parseInt(item.beginTime.substring(3, 5)) / 15));
					var etime = (parseInt(item.endTime.substring(0, 2)) + "," + (parseInt(item.endTime.substring(3, 5)) / 15));
					var area = _this.compileFac($('<div ng-style="restAreaStyle(' + week + ')" stimeh="' + parseInt(item.beginTime.substring(0, 2)) + '" stimem="' + parseInt(item.beginTime.substring(3, 5)) / 15 + '" etimeh="' + parseInt(item.endTime.substring(0, 2)) + '" etimem="' + parseInt(item.endTime.substring(3, 5)) / 15 + '" week="' + week + '" class="restArea paike_angled paike_stripes"></div>'));
					area.css({
						"top": (parseInt(area.attr("stimeh")) - 7) * 4 * dyHeight + parseInt(area.attr("stimem")) * dyHeight + "px",
						//						"left": (parseInt(area.attr("week")) - 1) * 3 * w + "px",
						//						"width": 3 * w + "px",
						"height": ((parseInt(area.attr("etimeh")) - parseInt(area.attr("stimeh"))) * 4 + (parseInt(area.attr("etimem")) - parseInt(area.attr("stimem")))) * dyHeight + "px"
					});
					$('.paikebox').append(area);
				});
				$('.restArea').click(function() {
					$('.dopaike').hide();
				})
			};
//			获取带符号的时间差值
			this.getTimeDiff_ = function (timeA, timeB) {
				var timeA = String(timeA).split('.');
				var timeB = String(timeB).split('.');
				var diff = parseInt(timeA[0]) * 60 + parseInt(timeA[1]) - (parseInt(timeB[0]) * 60 + parseInt(timeB[1]));
				return diff;
			}
			
			this.renderTeacher = function(weeklist) {
				/*
				 * 渲染主教老師的方法
				 * 传入主教老师有空的时间范围
				 * 
				 */
				/*
				 * teacherList
				 * 該教師week分組
				 */
				_this.Teacher1 = weeklist;
				$('.paike_mainteacher').removeClass("curr").removeClass("partCurr");
				if(!weeklist) {
					return;
				}
				var mainTeacherKey = groupByKey(weeklist, "week");
				/*
				 * 前期没封装 而且三个教师一起传  所以传入的数据结构的teacherId的key array结构
				 */
				for(var p in mainTeacherKey) {
					var list = mainTeacherKey[p]; //该周教室可排时间
					var teacher_weeks = $('.paike_mainteacher.week' + p);
					$.each(teacher_weeks, function(index, teacher) {
						//该教室在该周内  在可排课时间范围内 并且在营业时间内  加curr
						var tp = $(teacher).attr("time").split(",");
						var time_ = parseFloat(tp[0] + '.' + parseInt(tp[1]) * 15);
						$.each(list, function(index, item) {
							var stime = parseFloat(item.beginTime.replace(":", "."));
							var etime = parseFloat(item.endTime.replace(":", "."));
							
							var lsTimeDiffs = _this.getTimeDiff_(item.beginTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
							var lsTimeDiffe = _this.getTimeDiff_(item.endTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
							if(!isInUnShopTime(item.week, time_)) {
								if(lsTimeDiffs >= 5 && lsTimeDiffs < 15) {
									$(teacher).addClass("partCurr");
									$(teacher).attr('partCurr', item.beginTime);
								} else if(lsTimeDiffe >= 5 && lsTimeDiffe < 15) {
									$(teacher).addClass("partCurr");
									$(teacher).attr('partCurr', item.endTime);
								}
							}
							
							if(time_ >= stime && time_ < etime && !isInUnShopTime(item.week, time_) && !$(teacher).hasClass('partCurr')) {
								$(teacher).addClass("curr");
								return false;
							}
						});
					})
				}
			};
			this.renderHelpTeacher = function(weeklist1, weeklist2) {
				/*
				 * 渲染助教 有一个另一个传空 以便在paikeModel内存储教师的数据
				 */
				/*
				 * type 1  一個助教  2 兩個助教
				 */
				_this.Teacher2 = weeklist1;
				_this.Teacher3 = weeklist2;
				$('.paike_helpTeacher').removeClass("double").removeClass("curr").removeClass("partCurr");
				$('.paike_helpTeacher1').removeClass("curr").removeClass("partCurr");
				$('.paike_helpTeacher2').removeClass("curr").removeClass("partCurr");
				if(!weeklist1 && !weeklist2) {
					$(".paikeTable>tbody>tr>td").addClass("no_h")
					return;
				}
				$(".paikeTable>tbody>tr>td").removeClass("no_h")
				if(!weeklist2 || !weeklist1) {
					weeklist1 = weeklist2 ? weeklist2 : weeklist1;
					var teacherKey = groupByKey(weeklist1, "week");
					for(var p in teacherKey) {
						var list = teacherKey[p]; //该周教室可排时间
						var teacher_weeks = $('.paike_helpTeacher.week' + p);
						$.each(teacher_weeks, function(index, teacher) {
							//该教室在该周内  在可排课时间范围内 并且在营业时间内  加curr
							var tp = $(teacher).attr("time").split(",");
							var time_ = parseFloat(tp[0] + '.' + parseInt(tp[1]) * 15);
							$.each(list, function(index, item) {
								var stime = parseFloat(item.beginTime.replace(":", "."));
								var etime = parseFloat(item.endTime.replace(":", "."));
								
								var lsTimeDiffs = _this.getTimeDiff_(item.beginTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
								var lsTimeDiffe = _this.getTimeDiff_(item.endTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
								if(!isInUnShopTime(item.week, time_)) {
									if(lsTimeDiffs >= 5 && lsTimeDiffs < 15 || lsTimeDiffe >= 5 && lsTimeDiffe < 15) {
										$(teacher).addClass("partCurr");
									}
								}
								if(time_ >= stime && time_ < etime && !isInUnShopTime(item.week, time_) && !$(teacher).hasClass('partCurr')) {
									$(teacher).addClass("curr");
									return false;
								}
							});
						})
					}
				} else {
					var teacherKey1 = groupByKey(weeklist1, "week");
					var teacherKey2 = groupByKey(weeklist2, "week");
					for(var p in teacherKey1) {
						var list = teacherKey1[p]; //该周教室可排时间
						var teacher_weeks = $('.paike_helpTeacher1.week' + p);
						$.each(teacher_weeks, function(index, teacher) {
							//该教室在该周内  在可排课时间范围内 并且在营业时间内  加cur
							var tp = $(teacher).attr("time").split(",");
							var time_ = parseFloat(tp[0] + '.' + parseInt(tp[1]) * 15);
							$.each(list, function(index, item) {
								var stime = parseFloat(item.beginTime.replace(":", "."));
								var etime = parseFloat(item.endTime.replace(":", "."));
								
								var lsTimeDiffs = _this.getTimeDiff_(item.beginTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
								var lsTimeDiffe = _this.getTimeDiff_(item.endTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
								if(!isInUnShopTime(item.week, time_)) {
									if(lsTimeDiffs >= 5 && lsTimeDiffs < 15 || lsTimeDiffe >= 5 && lsTimeDiffe < 15) {
										$(teacher).addClass("partCurr");
									}
								}
								if(time_ >= stime && time_ < etime && !isInUnShopTime(item.week, time_) && !$(teacher).hasClass('partCurr')) {
									$(teacher).addClass("curr");
									return false;
								}
							});
						})
					}
					for(var p in teacherKey2) {
						var list = teacherKey2[p]; //该周教室可排时间
						var teacher_weeks = $('.paike_helpTeacher2.week' + p);
						$.each(teacher_weeks, function(index, teacher) {
							//该教室在该周内  在可排课时间范围内 并且在营业时间内  加curr
							var tp = $(teacher).attr("time").split(",");
							var time_ = parseFloat(tp[0] + '.' + parseInt(tp[1]) * 15);
							$.each(list, function(index, item) {
								var stime = parseFloat(item.beginTime.replace(":", "."));
								var etime = parseFloat(item.endTime.replace(":", "."));
								
								var lsTimeDiffs = _this.getTimeDiff_(item.beginTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
								var lsTimeDiffe = _this.getTimeDiff_(item.endTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
								if(!isInUnShopTime(item.week, time_)) {
									if(lsTimeDiffs >= 5 && lsTimeDiffs < 15 || lsTimeDiffe >= 5 && lsTimeDiffe < 15) {
										$(teacher).addClass("partCurr");
									}
								}
								if(time_ >= stime && time_ < etime && !isInUnShopTime(item.week, time_) && !$(teacher).hasClass('partCurr')) {
									$(teacher).addClass("curr");
									return false;
								}
							});
						})
					}
				}
			};
			this.renderClassroom = function(classRoomModelList) {
				/*
				 * 渲染教室的可用时间
				 */
				$('.paike_classroom').removeClass("curr").removeClass("partCurr");
				_this.classRoom = classRoomModelList;
				if(classRoomModelList == null) {
					return;
				}
				for(var p in classRoomModelList) {
					var list = classRoomModelList[p]; //该周教室可排时间
					var room_weeks = $('.paike_classroom.week' + p);
					$.each(room_weeks, function(index, room) {
						//该教室在该周内  在可排课时间范围内 并且在营业时间内  加curr
						var tp = $(room).attr("time").split(",");
						var time_ = parseFloat(tp[0] + '.' + parseInt(tp[1]) * 15);
						//					if(!isInUnShopTime(week, time_)) {
						//						$(room).addClass("curr");
						//					}
						$.each(list, function(index, item) {
							var stime = parseFloat(item.beginTime.replace(":", "."));
							var etime = parseFloat(item.endTime.replace(":", "."));
							
							var lsTimeDiffs = _this.getTimeDiff_(item.beginTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
							var lsTimeDiffe = _this.getTimeDiff_(item.endTime.replace(":", "."), tp[0] + '.' + parseInt(tp[1]) * 15);
							if(!isInUnShopTime(item.week, time_)) {
								if(lsTimeDiffs >= 5 && lsTimeDiffs < 15) {
									$(room).addClass("partCurr");
									$(room).attr('partCurr', item.beginTime);
								} else if(lsTimeDiffe >= 5 && lsTimeDiffe < 15) {
									$(room).addClass("partCurr");
									$(room).attr('partCurr', item.endTime);
								}
							}
							
							if(time_ >= stime && time_ < etime && !isInUnShopTime(item.week, time_) && !$(room).hasClass('partCurr')) {
								$(room).addClass("curr");
								return false;
							}
						});
					})
				}
			};

			function groupByKey(list, key) {
				var obj = {};
				$.each(list, function(index, item) {
					if(!obj[item[key]]) {
						obj[item[key]] = new Array();
					}
					obj[item[key]].push(item);
				});
				return obj;
			}

			function isInUnShopTime(week, time) { //7.0 7.15 7.30
				/*
				 * 判断时间是否处于非营业时间范围内
				 */
				if(!unShopTimeObj) {
					return false;
				}
				var list = unShopTimeObj[week];
				var isIn = false;
				if(!list) {
					return false;
				}
				$.each(list, function(index, item) {
					var stime = parseFloat(item.beginTime.replace(":", "."));
					var etime = parseFloat(item.endTime.replace(":", "."));
					if(time >= stime && time < etime) {
						isIn = true;
						return false;
					}
				});
				return isIn;
			}

			function initStyle() {
				_this.scope().shadowPos = {};
				_this.scope().targetPos = {};
				_this.scope().yipaikeModelStyleArr = [];
				$(window).resize(function() {
					if(_this.target) {
						var p_ = getPosParam();
						_this.scope().shadowPos.left = p_._index * p_.w + 1 + "px";
						_this.scope().shadowPos.top = p_.__index * p_.h + "px";
						_this.scope().shadowPos.width = p_.w * 3 + "px";
						_this.scope().shadowPos.height = p_.h * clickNum + "px";
						_this.scope().targetPos.left = (p_._index + 1.5) * p_.w - 80 + "px";
						_this.scope().targetPos.top = (p_.__index + clickNum + 1) * p_.h + "px";
					}
					_this.scope().yipaikeModelStyleArr = [];
					$.each(yipaikeTarget, function(index, target) {
						try {
							_this.scope().yipaikeModelStyleArr.push(getTargetPos(target));
						} catch(e) {
							//TODO handle the exception
						}
					});
					try {
						_this.scope().$apply(); //非营业时间动态位置
					} catch(e) {
						//TODO handle the exception
					}
				});
				_this.scope().restAreaStyle = function(week) {
					var width = $('.paikePlugIn').find('.head').width() / 7;
					return {
						"left": width * (week - 1) + "px",
						"width": width + "px"
					}
				};
			}
			
			function initEvent() {
				/*
				 * 渲染完成table之后 给table添加点击事件
				 * 通过点击位置判断点击的td
				 * 因为边框原因，点击不精确
				 */
				//			$('.paikeTable>tbody>tr').click(function(e) {
				_this.scope().paike_ = function(e) {
					if(_this.disable === true) { //可以做一些不能点击的提示
						if(!_this.disableCall) {
							throw("when table click is disabled, set a call funtion to do sth, return false to turn back");
							return;
						}
						if(!_this.disableCall()) {
							return;
						}
					}
					$('.dopaike').hide();
					if(!_this.Teacher1 || !_this.classRoom) {
						return;
					}
					var left = $('.paikeTable').offset().left,
						top = $('.paikeTable').offset().top,
						top_ = e.clientY,
						left_ = e.clientX;
					var width_td = $('.paikeTable>tbody>tr').width() / 21,
						heiTr = $('.paikeTable').height() / 60;
					var index_d = parseInt((top_ - top) / heiTr);
					var index = parseInt((left_ - left) / width_td);
					var td = $($(e.currentTarget).children("tr")[index_d]).children("td")[index]; //点击的td 从这个节点开始判断周围的节点组合是否符合排课规则 需要按助教数量分情况判断，没有主教和教室都不能拍
					
					if(!_this.Teacher2 && !_this.Teacher3) { //没有助教、 一个主教
						if(judgeCurr(getLeftTopTd(td), 1) == false) {
							layer.msg("空余时间不足")
						}
						return;
					}
					if(_this.Teacher2 && _this.Teacher3) { //3个教师
						if(judgeCurr(getLeftTopTd(td), 3) == false) {
							layer.msg("空余时间不足")
						};
						return;
					}
					if(judgeCurr(getLeftTopTd(td), 2) == false) { //一个主教一个助教
						layer.msg("空余时间不足")
					};
					
				}
				_this.scope().cancelBlock_ = function(index) {
					$('.dopaike').hide();
				};
				_this.scope().cancelBlock = function(index) {
					_this.scope().addSubJud = false;	//加减五分钟屏蔽
					$('.dopaike').hide();
					index_ = index;
					_this.scope().modifyBlock = true; //展示模块数据
					var t = yipaikeTarget_[index];
					var _index = t.parent().children("td").index(t[0]),
						__index = $(".paikeTable").children("tbody").children("tr").index(t.parent()[0]),
						w = ($('.paikeTable').width() - 2) / 21,
						h = $('.paikeTable').height() / 60;
					$("#addPaike_hour").text(yipaikeModelArr[index].beginTime);
					$("#addPaike_min").text(yipaikeModelArr[index].endTime);
					$("#addPaike_count").val(yipaikeModelArr[index].oneCourseTime);
					$("#addPaike_week").text(global.parseWeekToCN(yipaikeModelArr[index].week));
					_this.scope().targetPos.left = (_index + 0.5) * w - 80 + "px";
					_this.scope().targetPos.top = (__index + 2) * h + "px";
					$('.dopaike.paike_tag').fadeIn(200);
				};
				_this.scope().removeBlock = function() {
					$(yipaikeTarget[index_]).attr('disp', '');	//清空偏移位置
					removeYipaikeStatus(index_); //删除模块后 对应区域变成可排课状态
					yipaikeTarget.splice(index_, 1); //删除对应记录位置的元素
					yipaikeTarget_.splice(index_, 1);
					_this.scope().yipaikeModelStyleArr.splice(index_, 1);
					yipaikeModelArr.splice(index_, 1); //删除数据
					$('.dopaike').hide();
				};
				_this.scope().sureBlock = function() {
					if($('#addPaike_count').val() == "") {
						layer.msg("请填写课时")
						return;
					}
					
					if(_this.scope().modifyBlock) {
						yipaikeModelArr[index_].oneCourseTime = $('#addPaike_count').val();
						$('#addPaike_count').val(1);
						$('.dopaike').hide();
					} else {
	//					设置偏移位置
						var remNum = Math.abs(_this.bitNum % 3);
						if(_this.bitNum > 0) {
							jumptarget($(_this.target), 0, Math.abs(parseInt(_this.bitNum / 3)));	//向下
							$(_this.target).attr("disp", remNum);
						} else {
							if(remNum == 0) {
								jumptarget($(_this.target), 1, Math.abs(parseInt(_this.bitNum / 3)));	//向上
							} else {
								jumptarget($(_this.target), 1, Math.abs(parseInt(_this.bitNum / 3)) + 1);	//向上
								$(_this.target).attr("disp", 3 - remNum);
							}
							
						}
						if(clickNum_ + Number($(_this.target).attr("disp")) > 3) {
							var pso_x = Number(_this.posTarget.attr('x'));
							var pso_y = Number(_this.posTarget.attr('y')) + 1;
							_this.posTarget = $('.x_' + pso_x + "y_" + pso_y);
							addYipaikeStatus(_this.target, parseInt(clickNumDiff / 3) + 1);
						} else {
							addYipaikeStatus(_this.target, parseInt(clickNumDiff / 3));
						}
						yipaikeModelArr.push(new global.PaikeModel($('#addPaike_week').attr("week"), $('#addPaike_hour').text(), $('#addPaike_min').text(), $('#addPaike_count').val()));
						yipaikeTarget.push(_this.target);
						_this.scope().yipaikeModelStyleArr.push(getTargetPos(_this.target));
						yipaikeTarget_.push(_this.posTarget);
						$('#addPaike_count').val(1);
						$('.dopaike').hide();
						
						if(_this.addPaikeCall && typeof _this.addPaikeCall == "function") {
							_this.addPaikeCall()
						}
					}
					if(clickNumDiff < 0) {
						var lsDiff = -parseInt(clickNumDiff / 3);
						var x_ = parseInt(_this.posTarget.attr('x'));
						var y_ = parseInt(_this.posTarget.attr('y'));
						for(var i = 0; i < lsDiff; i++) {
							$('.x_' + (x_ - 1) + "y_" + (y_ - i)).removeClass('added');
							$('.x_' + (x_ + 1) + "y_" + (y_ - i)).removeClass('added');
						}
					}
				};
				//获取td的时间
				function getTdTime(td) {
					return td.attr('time').split(',')[0] + ':' + td.attr('time').split(',')[1] * 15;
				};
				_this.clickCall = function() {
					//上下调整五分钟的点击回调数据
					clickNumDiff = 0;	//每次点击重置为0
					_this.bitNum = 0;	//点击上下加减五分钟的总值
					_this.scope().addSubJud = true;
					_this.scope().judIntTime = false;	//添加大课时间选择器隐藏
					_this.bitHasStep = null;	//点击的时候存在的重叠步数
					var noClickJud = true;
					var jumpUpTd = false;	//跳上一个td
					var ls_partCurrTime = 0;	//和被抹去的时间重叠了多少分钟
					var ls_targetTime = getTdTime(_this.target);
					var ls_endTd = getNeedTd(_this.target, getEndTd(_this.target, timeHandle(ls_targetTime.split(":"), 1, clickNum * 3 + clickNum_)) * 3);
					if(clickNum_) {
						if(!judTdHasCurr($(_this.target), clickNum, 'clickPartCurr')) {
							jumpUpTd = true;
							if(ls_endTd.attr('partCurr') && clickNum_ <= getTimeDiff(getTdTime(ls_endTd), ls_endTd.attr('partCurr'))/5) {
								jumpUpTd = false;
							}
							if(parseInt(ls_endTd.attr('disp')) >= clickNum_) {
								jumpUpTd = false;
							}
						}
					} else {
						if(getStepTd(_this.target, -1).attr('partCurr')) {
							jumpUpTd = true;
						}
					}
					if(jumpUpTd) {
						jumptarget($(_this.target), 1, 1);	//向上移一位
						ls_targetTime = getTdTime(_this.target);
						ls_endTd = getNeedTd(_this.target, getEndTd(_this.target, timeHandle(ls_targetTime.split(":"), 1, clickNum * 3 + clickNum_)) * 3);
					}
					
					var week = _this.target.attr("week"),
						time = _this.target.attr("time"),
						p_ = getPosParam();
					
					if(_this.single) {
						
						if(yipaikeModelArr.length > 0) {
//						清空偏移值
							if($(yipaikeTarget[0][0]).attr("disp")) {
								$(yipaikeTarget[0][0]).attr("disp", '');
							}
							
							removeYipaikeStatus(0);
							yipaikeModelArr;
							yipaikeTarget = [];
							yipaikeTarget_ = [];
							_this.scope().yipaikeModelStyleArr = [];
							index_ = 0;
							if(_this.banClean) {
								yipaikeTarget[0] = _this.target;
								yipaikeTarget_[0] = _this.posTarget;
								yipaikeModelArr[0].beginTime = global.parsePaikeTime(time);
								yipaikeModelArr[0].endTime = global.parsePaikeTime(_this.posTarget.attr("time"), true);
								yipaikeModelArr[0].week = week;
								addYipaikeStatus(_this.target);
								_this.scope().yipaikeModelStyleArr[0] = getTargetPos(_this.target);
								if(_this.addPaikeCall && typeof _this.addPaikeCall == "function") {
									_this.addPaikeCall()
								}
								return;
							}
							yipaikeModelArr = [];
						}
					}
					if($("#addPaike_count").val() <= 1 || _this.scope().modifyBlock) {
						$("#addPaike_count").val(1);
					}
					_this.scope().modifyBlock = false;
					$('.paike_selectedbox').width(p_.w * 3 - 1);
					_this.scope().shadowPos.left = p_._index * p_.w + 1 + "px";
					_this.scope().shadowPos.top = p_.__index * p_.h + "px";
					_this.scope().shadowPos.width = p_.w * 3 + "px";
					_this.scope().shadowPos.height = p_.h * clickNum + ($('.paikeTable').height() / 180 * clickNum_) + "px";
					_this.scope().targetPos.left = (p_._index + 1.5) * p_.w - 80 + "px";
					_this.scope().targetPos.top = (p_.__index + clickNum + 1) * p_.h + "px";
					
					$('#addPaike_week').text(global.parseWeekToCN(week));
					$('#addPaike_week').attr("week", week);
					$('#addPaike_hour').text(global.parsePaikeTime(time));
					
					if(clickNum_) {
						$('#addPaike_min').text(timeHandle(global.parsePaikeTime(_this.posTarget.attr("time"), true).split(':'), 1, clickNum_));
					} else {
						$('#addPaike_min').text(global.parsePaikeTime(_this.posTarget.attr("time"), true));
					}
					
					//如果上面有被抹去的时间
					if(_this.target.attr('partCurr')) {
						ls_partCurrTime = getTimeDiff(ls_targetTime, _this.target.attr('partCurr'));
						for(var i = 0; i < ls_partCurrTime/5; i++) {
							if(_this.scope().bitDown('clickCall') == false) {	//执行n次下移
								noClickJud = false;
							}
						}
					} else if(ls_endTd.attr('partCurr')) {
						ls_partCurrTime = getTimeDiff(ls_endTd.attr('partCurr'), $('#addPaike_min').text());
						for(var i = 0; i < ls_partCurrTime/5; i++) {
							if(_this.scope().bitUp('clickCall') == false) {	//执行n次下移
								noClickJud = false;
							}
						}
					} else {
						if(!judTdHasCurr(_this.target, 0, 'clickPartCurr')) {
							noClickJud = false;
						}
					}
					
					if(!noClickJud) {
						layer.msg('空余时间不足');
						return;
					}
					

//					查询调整后的时间防止重叠
					_this.overlapUp = judUpTime($('#addPaike_hour').text(), 0);
					_this.overlapDown = judUpTime($('#addPaike_min').text(), 1);
//					如果与上面重叠
					if(!_this.overlapUp[0] && (_this.overlapUp[1] / 5) != 0) {
						var lsStep = getEndTd(_this.target, timeHandle($("#addPaike_min").text().split(':'), 1, _this.overlapUp[1] / 5));
						if(!_this.overlapDown[0] || !judTdHasCurr(_this.target, lsStep, 'added')) {
							noClickJud = false;
							if(getStepTd(_this.target, lsStep).attr('disp')) {
								if(3 - clickNum_ + parseInt(getStepTd(_this.target, lsStep).attr('disp')) >= _this.overlapUp[1] / 5) {
									noClickJud = true;
								}
							}
							if(getStepTd(_this.target, lsStep).attr('partCurr')) {
								if(getTimeDiff(timeHandle($("#addPaike_min").text().split(':'), 1, _this.overlapUp[1] / 5), getStepTd(_this.target, lsStep).attr('partCurr')) >= 0) {
									noClickJud = true;
								}
							}
						}
						if(!noClickJud) {
							layer.msg('空余时间不足');
							return;
						}
//						黑色蒙版往下移动重叠部分
						_this.scope().shadowPos.top = Number(_this.scope().shadowPos.top.split('px')[0]) + (_this.overlapUp[1] / 5 * $('.paikeTable').height() / 180) + 'px';
						_this.bitNum = _this.overlapUp[1] / 5;
//						全部时间加上重叠部分
						$("#addPaike_min").text(timeHandle($("#addPaike_min").text().split(':'), 1, _this.overlapUp[1] / 5));
						$("#addPaike_hour").text(timeHandle($("#addPaike_hour").text().split(':'), 1, _this.overlapUp[1] / 5));
						
					}
//					如果与下面重叠
					if(!_this.overlapDown[0] && (_this.overlapDown[1] / 5) != 0) {
						var lsOverlapUp = judUpTime(timeHandle($("#addPaike_hour").text().split(':'), 0, _this.overlapDown[1] / 5), 0);
						if(!lsOverlapUp[0] && (lsOverlapUp[1] / 5) != 0) {
							layer.msg("空余时间不足");
							return;
						}
						if(!judTdHasCurr($(_this.target), -1)) {
							layer.msg("空余时间不足");
							return;
						}
//						黑色蒙版向上移动重叠部分
						_this.scope().shadowPos.top = Number(_this.scope().shadowPos.top.split('px')[0]) - (_this.overlapDown[1] / 5 * $('.paikeTable').height() / 180) + 'px';
						_this.bitNum = -_this.overlapDown[1] / 5;
//						全部时间减去重叠部分
						$("#addPaike_min").text(timeHandle($("#addPaike_min").text().split(':'), 0, _this.overlapDown[1] / 5));
						$("#addPaike_hour").text(timeHandle($("#addPaike_hour").text().split(':'), 0, _this.overlapDown[1] / 5));
					}
					
					$('.dopaike').fadeIn(200);
				};
				
//			点击上下调整五分钟的排课时间
				_this.scope().bitDown = function(special) {
					_this.bitJud = true;
					var lsStep = getEndTd(getNeedTd(_this.target, _this.bitNum+1), timeHandle($("#addPaike_min").text().split(':'), 1));
					
					if(!judUpTime($("#addPaike_min").text(), 1)[0] || !judTdHasCurr(getNeedTd(_this.target, _this.bitNum + 1), lsStep, 'upDown')) {
						_this.bitJud = false;
					}
					if(!_this.bitJud) {
						if(special != 'clickCall') {
							layer.msg("空余时间不足");
						}
						return false;
					}
					
					var bitMin = $("#addPaike_min").text().split(':');
					var bitHour = $('#addPaike_hour').text().split(':');
					if(Number(bitMin[0]) >= 22 || Number(bitHour[0]) >= 22) {	//不允许超过22点
						return;
					}
					$("#addPaike_min").text(timeHandle(bitMin, 1));
					$("#addPaike_hour").text(timeHandle(bitHour, 1));
					_this.scope().shadowPos.top = Number(_this.scope().shadowPos.top.split('px')[0]) + ($('.paikeTable').height() / 180) + 'px';
					_this.bitNum++;
				};
				
				_this.scope().bitUp = function(special) {
					_this.bitJud = true;
					
					if(!judUpTime($("#addPaike_hour").text(), 0)[0] || !judTdHasCurr(getNeedTd(_this.target, _this.bitNum - 1), 0, 'upDown')) {
						_this.bitJud = false;
					}
					
					if(!_this.bitJud) {
						if(special != 'clickCall') {
							layer.msg("空余时间不足");
						}
						return false;
					}
					
					var bitMin = $("#addPaike_min").text().split(':');
					var bitHour = $('#addPaike_hour').text().split(':');
					if(Number(bitMin[0]) <= 7 && Number(bitMin[1]) <= 0 || Number(bitHour[0]) <= 7 && Number(bitHour[1]) <= 0) {	//不允许低于7点
						return;
					}
					$("#addPaike_min").text(timeHandle(bitMin, 0));
					$("#addPaike_hour").text(timeHandle(bitHour, 0));
					_this.scope().shadowPos.top = Number(_this.scope().shadowPos.top.split('px')[0]) - ($('.paikeTable').height() / 180) + 'px';
					_this.bitNum--;
				};
				
//				点击排一节大课-选择时间长度
				_this.scope().getIntervalTime = function(n) {
					if(!_this.scope().addSubJud) {
						return;
					}
					_this.scope().judIntTime = false;
					var lsTime = $("#addPaike_min").text().split(":");
					var timeDiff = n - getTimeDiff($("#addPaike_hour").text(), $("#addPaike_min").text());
					var lsTime_ = null;	//修改后的时间
					var judIsAddTime = true;	//是否能够添加时间长度
					clickNumDiff = n / 5 - (clickNum * 3 + clickNum_);	//获取(大课 - 基础课)的时间差
					if(timeDiff > 0) {
						lsTime_ = timeHandle(lsTime, 1, Math.abs(timeDiff / 5));
					} else {
						lsTime_ = timeHandle(lsTime, 0, Math.abs(timeDiff / 5));
					}
					
//					判断下面的时间是否符合排课规则
					for(var i = clickNum; i < n / 15; i++) {
						if(!judTdHasCurr(getNeedTd(_this.target), i, 'added')) {
							judIsAddTime = false;
						}
					}
					
					var lsStep = getEndTd(getNeedTd(_this.target), lsTime_);
//					判断增加时长会不会与下面的时间重叠或者最后一个是否符合排课规则
					if(!judUpTime(lsTime_, 1)[0] && judUpTime(lsTime_, 1)[1] > 0 || !judTdHasCurr(getNeedTd(_this.target), lsStep, 'added')) {
						judIsAddTime = false;
						var lossTime = null;
						if(getStepTd(getNeedTd(_this.target), lsStep).attr('partCurr')) {
							lossTime = getTimeDiff(getStepTd(getNeedTd(_this.target), lsStep).attr('partCurr'), lsTime_);
							if(lossTime <= 0) {
								judIsAddTime = true;
							}
						}
						if(getStepTd(getNeedTd(_this.target), lsStep).attr('disp')) {
						   lossTime = getTimeDiff(getTdTime(getStepTd(getNeedTd(_this.target), lsStep)), lsTime_) / 5;
						   if(lossTime <= parseInt(getStepTd(getNeedTd(_this.target), lsStep).attr('disp'))) {
						       judIsAddTime = true;
						   }
						}
					}
					if(!judIsAddTime) {
						layer.msg('空余时间不足');
						clickNumDiff = getTimeDiff($("#addPaike_hour").text(), $("#addPaike_min").text()) / 5 - (clickNum * 3 + clickNum_);
						return;
					}
					_this.scope().shadowPos.height = Number(_this.scope().shadowPos.height.split("px")[0]) + ($('.paikeTable').height() / 180 * timeDiff / 5) + 'px';
					$("#addPaike_min").text(lsTime_);	//添加排课时长
				}
			}
			
//			加减的时候判断上下时间是否有重叠(0: 上面的时间传开始时间， 1：下面的时间传结束时间)
			function judUpTime(timeVal, type) {
				var timeVal = timeVal.split(':');
				var week = $(_this.target).attr('week');
				for(var i = 0; i < yipaikeModelArr.length; i++) {
					var modeTime = yipaikeModelArr[i].endTime.split(':');
					if(type == 1) {
						modeTime = yipaikeModelArr[i].beginTime.split(':');
					}
					if(week == yipaikeModelArr[i].week) {
						var subNum = 0;
						if(type == 1) {
							subNum = (parseInt(modeTime[0]) - parseInt(timeVal[0])) * 60 + parseInt(modeTime[1]) - parseInt(timeVal[1]);
						} else {
							subNum = (parseInt(timeVal[0]) - parseInt(modeTime[0])) * 60 + parseInt(timeVal[1]) - parseInt(modeTime[1]);
						}
						if(Math.abs(subNum) <= 15 && subNum <= 0) {
							return [false, Math.abs(subNum)];
						}
					}
				}
				return [true, 0];
			}
			
//			跳转_this.target为下step个或者上step个td(type: 0下一个， 1上一个)
			function jumptarget(td, type, num) {
				$(td).attr("disp", '');
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				var x_ = parseInt(_this.posTarget.attr("x"));
				var y_ = parseInt(_this.posTarget.attr("y"));
				var step = 1;
				if(num || num == 0) {
					step = num;
				}
				if(type == 1) {
					step = -step;
				}
				var nextTd = $('.x_' + x + "y_" + (y + step));
				var nextTd_ = $('.x_' + x_ + "y_" + (y_ + step));
				if(clickNumDiff) {
					nextTd_ = $('.x_' + x_ + "y_" + (y_ + step + parseInt(clickNumDiff / 3)));
				}
				
				_this.target = nextTd;
				_this.posTarget = nextTd_;
			}
			
//			获取排的这节课结束时间所在的td步数
			function getEndTd(td, timeVal) {
				var detTime = td.attr('time').split(',');	//获取截止时间来判断该往下查询的个数
				var detTime_ = timeVal.split(':');
				if(detTime_[1] % 15 > 0) {
					detTime_[1] = parseInt(detTime_[1] / 15);
				} else {
					detTime_[1] = parseInt(detTime_[1] / 15) - 1;
				}
				var lsStep = (detTime_[0] - detTime[0]) * 4 + (detTime_[1] - detTime[1]);
				
				return lsStep;
			}
			
			//获取所需的td
			function getStepTd(td, step) {
				var x = Number(td.attr('x'));
				var y = Number(td.attr('y'));
				
				return $('.x_' + x + "y_" + (y + step));
			}
			
//			获取到加减之后临时需要的td(左上那个)
			function getNeedTd(td, special) {
				var lsTd = null;
				var x = Number(td.attr('x'));
				var y = Number(td.attr('y'));
				var num = _this.bitNum;
				if(special || special == 0) {
					num = special;
				}
				var ret = parseInt(num / 3);
				if(num > 0) {
					lsTd = $('.x_' + x + "y_" + (y + ret));
				} else {
					if(num % 3 == 0) {
						lsTd = $('.x_' + x + "y_" + (y + ret));
					} else {
						lsTd = $('.x_' + x + "y_" + (y + ret - 1));
					}
				}
				return lsTd;
			}
			
//			判断td是否符合加减的排课(查询上下的元素)
			function judTdHasCurr(td, step, special) {
				var judd = true;
				var x = Number(td.attr('x'));
				var y = Number(td.attr('y'));
				y = y + step;
//				console.log($('.x_' + x + "y_" + y)[0]);
				
				if(special == 'added' || special == 'clickPartCurr') {
					//判断有没有主教
					if($('.x_' + x + "y_" + y).hasClass('added')) {
						judd = false;
					}
				}
				
				//判断有没有主教
				if(!$('.x_' + x + "y_" + y).hasClass('curr')) {
					judd = false;
				}
				//两个助教
				if(_this.Teacher2 && _this.Teacher3) {
					var divs = $('.x_' + (x + 1) + "y_" + y).children("div");
					if(!$(divs[0]).hasClass('curr') || !$(divs[1]).hasClass('curr')) {
						judd = false;
					}
				}
				//一个助教
				if(_this.Teacher2 && !_this.Teacher3 || !_this.Teacher2 && _this.Teacher3) {
					if(!$('.x_' + (x + 1) + "y_" + y).hasClass('curr')) {
						judd = false;
					}
				}
				//判断教室
				if(!$('.x_' + (x + 2) + "y_" + y).hasClass('curr')) {
					judd = false;
				}
				
//				判断被抹掉的时间是否存在
				if(special == 'upDown') {
					var lossTime = -1;
					if($('.x_' + x + "y_" + y).hasClass('partCurr') && $('.x_' + (x + 2) + "y_" + y).hasClass('partCurr') || $('.x_' + x + "y_" + y).hasClass('partCurr') && $('.x_' + (x + 2) + "y_" + y).hasClass('curr')) {
						if(step == 0) {
							lossTime = getTimeDiff($('.x_' + x + "y_" + y).attr('partCurr'), $("#addPaike_hour").text());
						} else {
							lossTime = getTimeDiff($("#addPaike_min").text(), $('.x_' + x + "y_" + y).attr('partCurr'));
						}
					} else if($('.x_' + x + "y_" + y).hasClass('curr') && $('.x_' + (x + 2) + "y_" + y).hasClass('partCurr')) {
						if(step == 0) {
							lossTime = getTimeDiff($('.x_' + (x + 2) + "y_" + y).attr('partCurr'), $("#addPaike_hour").text());
						} else {
							lossTime = getTimeDiff($("#addPaike_min").text(), $('.x_' + (x + 2) + "y_" + y).attr('partCurr'));
						}
					}
					console.log(lossTime)
					if(lossTime > 0) {
						judd = true;
					}
				}
				return judd;
			}
			
//			处理时间加减
			function timeHandle(val, type, num) {
				var arr = val;
				var step = 5;	//步长为5分钟
				if(num || num == 0) {
					step = step * num;
				}
				if(type == 1) {
					arr[1] = Number(arr[1]) + step;
					if(arr[1] < 10) {
						arr[1] = '0' + arr[1];
					}
					if(parseInt(arr[1] / 60) >= 0) {
						arr[0] = Number(arr[0]) + parseInt(arr[1] / 60);
						if(arr[0] < 10) {
							arr[0] = '0' + arr[0];
						}
						if(Number(arr[1]) % 60 >= 10) {
							arr[1] = Number(arr[1]) % 60;
						} else {
							arr[1] = '0' + (Number(arr[1]) % 60);
						}
					}
				} else {
					arr[1] = Number(arr[1]) - step;
					if(arr[1] < 0) {
						arr[1] = Math.abs(arr[1]);
						arr[0] = Number(arr[0]) - parseInt(arr[1] / 60) - 1;
						if(arr[0] < 10) {
							arr[0] = '0' + arr[0];
						}
						arr[1] = 60 - (arr[1] % 60);
						if(arr[1] < 10) {
							arr[1] = '0' + arr[1];
						}
					}
					if(arr[1] < 10) {
						arr[1] = '0' + arr[1];
					}
				}
				return arr.join(':');
			}
			
//			获取时间差值(间隔时间)
			function getTimeDiff(timeBeg, timeEnd) {
				var timeBeg = timeBeg.split(':');
				var timeEnd = timeEnd.split(':');
				var diff = null;
				var diff_ = Number(timeEnd[0]) - Number(timeBeg[0]);
				if(diff_ == 0) {
					diff = Number(timeEnd[1]) - Number(timeBeg[1]);
				} else {
					if(Number(timeEnd[1]) > Number(timeBeg[1])) {
						diff = diff_ * 60 + Number(timeEnd[1]) - Number(timeBeg[1]);
					} else {
						diff = (diff_ - 1) * 60 + (60 - Number(timeBeg[1]) + Number(timeEnd[1]));
					}
				}
				return diff;
			}
			
			function getPosParam() {
				var _index = _this.target.parent().children("td").index(_this.target[0]),
					__index = $(".paikeTable").children("tbody").children("tr").index(_this.target.parent()[0]),
					w = ($('.paikeTable').width() - 2) / 21,
					h = $('.paikeTable').height() / 60;
				return {
					"_index": _index,
					"__index": __index,
					"w": w,
					"h": h,
				}
			}

			function getTargetPos(target) {
				var _index = target.parent().children("td").index(target[0]),
					__index = $(".paikeTable").children("tbody").children("tr").index(target.parent()[0]),
					x = parseInt(target.attr("x")),
					y = parseInt(target.attr("y")),
					w = ($('.paikeTable').width() - 2) / 21,
					h = $('.paikeTable').height() / 60,
					index = clickNum;
//				for(var i = 0; i <= 60 - y; i++) {
//					if(!$('.x_' + x + "y_" + (y + i)).hasClass("added")) {
//						index = i;
//						break;
//					}
//				}
				
//				判断下个clikNUm有没有disp偏移值
				for(var i = 0; i < index; i++) {
					if($('.x_' + x + "y_" + (y + 1 + i)).attr("disp") > 0) {
						index = i + 1;
						break;
					}
				}
				
				var dispTop = 0;	//如果有偏移位置则偏移
				if(Number(target.attr('disp'))) {
					dispTop = Number(target.attr('disp')) * ($('.paikeTable').height() / 180);
				}
				
				var hei = (index * h) + ($('.paikeTable').height() / 180 * (clickNum_ + clickNumDiff)) + "px";
				var sty = {
					"left": _index * w + 2 + "px",
					"top": __index * h + dispTop + "px",
					"width": w * 3 + "px",
					"height": hei,
					"line-height": hei
				};
				return sty;
			}
			
			function addYipaikeStatus(target, special) {
				var x = parseInt(target.attr("x")),
					y = parseInt(target.attr("y"));
				var len = clickNum;
				if(special) {
					len = clickNum + special;
				}
				for(var i = 0; i < len; i++) {
					$('.x_' + x + "y_" + (y + i)).addClass("added");
					$('.x_' + (x + 2) + "y_" + (y + i)).addClass("added");
				}
			}

			function removeYipaikeStatus(index) { //取消标记
				var x = parseInt(yipaikeTarget[index].attr("x")),
					y = parseInt(yipaikeTarget[index].attr("y")),
					y_ = parseInt(yipaikeTarget_[index].attr("y"));
				for(var i = y; i <= y_; i++) {
					$('.x_' + x + "y_" + i).removeClass("added");
					$('.x_' + (x + 2) + "y_" + i).removeClass("added");
				}
			}

			function getIndexOfYipaikeTd(td, type) {
				switch(type) {
					case "top":
						var x = parseInt(td.attr("x")),
							y = parseInt(td.attr("y")),
							index = 0,
							resIndex;
						for(var i = y - 1; i >= 0; i--) {
							if(!$(".x_" + x + "y_" + i).hasClass("added")) {
								index = i + 1;
								break;
							}
						}
						
						for(var i = y - 1; i > index; i--) {
							if($('.x_' + x + "y_" + i).attr("disp") > 0) {
								index = i;
								break;
							}
						}
						
						return [getIndex(), y - index];
						break;
					case 'down':
						var x = parseInt(td.attr("x")) - 1,
							y = parseInt(td.attr("y")),
							index = 0,
							resIndex;
						for(var i = y + 1; i <= 60; i++) {
							if(!$(".x_" + x + "y_" + i).hasClass("added")) {
								index = i - 1;
								break;
							}
						}
						
//				判断下个clikNUm有没有disp偏移值
						for(var i = y + 1; i < index; i++) {
							if($('.x_' + x + "y_" + i).attr("disp") > 0) {
								index = i - 1;
								break;
							}
						}
						
						return [getIndex(), index - y];
						break;
					default:
						break;
				}

				function getIndex() {
					resIndex = 0;
					switch(type) {
						case "top":
							$.each(yipaikeTarget, function(i, dom) {
								if(dom.selector == (".x_" + x + "y_" + index)) {
									resIndex = i;
									return false;
								}
							});
							break;
						case "down":
							$.each(yipaikeTarget_, function(i, dom) {
								if(dom.selector == (".x_" + (x + 1) + "y_" + index)) {
									resIndex = i;
									return false;
								}
							});
						default:
							break;
					}
					return resIndex;
				}
			}

			function judgeComBine(td, td_) {
				var x = parseInt(td.attr("x")),
					x_ = parseInt(td_.attr("x")) - 1;
				var y = parseInt(td.attr("y")),
					y_ = parseInt(td_.attr("y"))
				
//				如果有偏移就不合并
				if($(".x_" + x + "y_" + (y + clickNum)).attr('disp') > 0) {
					return [false, 0];
				}
				if($(td).attr('disp') > 0) {
					return [false, 0];
				}
				
				if($(".x_" + x + "y_" + (y - 1)).hasClass("added") && $(".x_" + x_ + "y_" + (y_ + 1)).hasClass("added")) {
					return [true, 1];
				} else if($(".x_" + x + "y_" + (y - 1)).hasClass("added")) {
					return [true, 2];
				} else if($(".x_" + x_ + "y_" + (y_ + 1)).hasClass("added")) {
					return [true, 3];
				}
				return [false, 0];
			}

			function judgeThree(td) {
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				for(var i = 0; i < clickNum; i++) { //从下面个数开始判断是否有curr
					if(!isCurr($('.x_' + x + "y_" + (y + i)))) {
						return false;
					}
					if(!isCurr_($('.x_' + (x + 1) + "y_" + (y + i)))) {
						return false;
					}
					if(!isCurr($('.x_' + (x + 2) + "y_" + (y + i)))) {
						return false;
					}
				}
				return true;
			}

			function judgeOne(td) {
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				for(var i = 0; i < clickNum; i++) { //从下面个数开始判断是否有curr
					if(!isCurr($('.x_' + x + "y_" + (y + i)))) {
						return false;
					}
					if(!isCurr($('.x_' + (x + 2) + "y_" + (y + i)))) {
						return false;
					}
				}
				return true;
			}

			function judgeTwo(td) {
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				for(var i = 0; i < clickNum; i++) { //从下面个数开始判断是否有curr
					if(!isCurr($('.x_' + x + "y_" + (y + i)))) {
						return false;
					}
					if(!isCurr($('.x_' + (x + 1) + "y_" + (y + i)))) {
						return false;
					}
					if(!isCurr($('.x_' + (x + 2) + "y_" + (y + i)))) {
						return false;
					}
				}
				return true;
			}
			//根据点击的td返回最左上角的那个td
			function getLeftTopTd(td) {
				var col = parseInt($(td).attr("col"));
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				
				switch(col) {
					case 1: x = x; break;	//点击主教列
					case 2: x = x - 1; break;	//点击助教列
					case 3: x = x - 2; break;	//点击教室列
					default: break;
				}
				return $('.x_' + x + "y_" + y);
			}
			
			//根据最左上角那个td判断下面的td是否符合排课规则(type: 1:一个主教， 2:一个主教一个助教， 3:一个主教两个助教)
			function judgeCurr(td, type) {
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				var yc = y + clickNum - 1;
				for(var k = 0; k < clickNum; k++) {
					for(var i = 0; i < clickNum; i++) { //从下面个数开始判断是否有curr
						if(!judgeLineCurr($('.x_' + x + "y_" + (yc - k - i)), type)) {
							break;
						}
					}
					if(i == clickNum) {
						_this.target = $('.x_' + x + "y_" + (y - k));
						_this.posTarget = $('.x_' + (x + 1) + "y_" + (y - k + clickNum - 1));
						_this.clickCall(_this.target, _this.posTarget);
						return;
					}
				}
				if(k == clickNum) {
					return false;
				}
			}
			
			//判断一排td是否符合排课规则
			function judgeLineCurr(td, type) {
				var x = parseInt($(td).attr("x"));
				var y = parseInt($(td).attr("y"));
				if(!isCurr($('.x_' + x + "y_" + y)) && !$('.x_' + x + "y_" + y).attr('partCurr')) {
					return false;
				}
				if(type == 2 && !isCurr($('.x_' + (x + 1) + "y_" + y))) {
					return false;
				}
				if(type == 3 && !isCurr_($('.x_' + (x + 1) + "y_" + y))) {
					return false;
				}
				if(!isCurr($('.x_' + (x + 2) + "y_" + y)) && !$('.x_' + (x + 2) + "y_" + y).attr('partCurr')) {
					return false;
				}
				return true;
			}
			
			function isCurr(td, special) { //判断节点是否符合条件  1、符合教室或教师的工作时间 2、这里没有被自己排过课
				if(special) {
					return td.hasClass("curr");
				} else {
					return td.hasClass("curr") && !td.hasClass("added");
				}
			}

			function isCurr_(td) { //同上 判断两个助教的情况
				var divs = td.children("div");
				return($(divs[0]).hasClass("curr") && $(divs[1]).hasClass("curr"));
			}

		};

		global.getAge = function(strBirthday) { //生日计算年龄
			var returnAge;
			var strBirthdayArr = strBirthday.split("-");
			var birthYear = strBirthdayArr[0];
			var birthMonth = strBirthdayArr[1];
			var birthDay = strBirthdayArr[2],
				d = new Date();
			var nowYear = d.getFullYear();
			var nowMonth = d.getMonth() + 1;
			var nowDay = d.getDate();

			if(nowYear == birthYear) {
				returnAge = 0; //同年 则为0岁  
			} else {
				var ageDiff = nowYear - birthYear; //年之差  
				if(ageDiff > 0) {
					if(nowMonth == birthMonth) {
						var dayDiff = nowDay - birthDay; //日之差  
						if(dayDiff < 0) {
							returnAge = ageDiff - 1;
						} else {
							returnAge = ageDiff;
						}
					} else {
						var monthDiff = nowMonth - birthMonth; //月之差  
						if(monthDiff < 0) {
							returnAge = ageDiff - 1;
						} else {
							returnAge = ageDiff;
						}
					}
				} else {
					returnAge = -1; //返回-1 表示出生日期输入错误 晚于今天  
				}
			}
			return returnAge; //返回周岁年龄  
		};

		global.Base64 = function(str) {
			return btoa(encodeURIComponent(str));
		}
		global.formatDate = function(now) {
			now = new Date(now);
			var year = now.getFullYear();
			var month = ((now.getMonth() + 1) + "").length > 1 ? ((now.getMonth() + 1) + "") : ("0" + (now.getMonth() + 1) + "");
			var date = (now.getDate() + "").length > 1 ? (now.getDate() + "") : ("0" + now.getDate());
			var hour = (now.getHours() + "").length > 1 ? now.getHours() : ("0" + now.getHours());
			var minute = (now.getMinutes() + "").length > 1 ? now.getMinutes() : ("0" + now.getMinutes());
			var second = (now.getSeconds() + "").length > 1 ? now.getSeconds() : ("0" + now.getSeconds());
			return year + "-" + month + "-" + date;
		};

		global.ParseDateNum = function(year, month, date) {
			month = month.toString().length > 1 ? month.toString() : ("0" + month);
			date = date.toString().length > 1 ? date.toString() : ("0" + date);
			return parseInt(year + month + date);
		};
		global.parseWeekToCN = function(week) {
			switch(week.toString()) {
				case '1':
					return '星期一';
					break;
				case '2':
					return '星期二';
					break;
				case '3':
					return '星期三';
					break;
				case '4':
					return '星期四';
					break;
				case '5':
					return '星期五';
					break;
				case '6':
					return '星期六';
					break;
				case '7':
					return '星期日';
					break;
				default:
					break;
			}
		};
		global.parsePaikeTime = function(time, end) {
			if(end) {
				var arr = time.split(",");
				var h = ((parseInt(arr[1]) == 3) ? (parseInt(arr[0]) + 1) : arr[0]) + "";
				var m = parseInt(arr[1]) == 3 ? "0" : (parseInt(arr[1]) + 1) * 15 + "";
				return(h.length == 1 ? ("0" + h) : h) + ":" + (m.length == 1 ? ("0" + m) : m);
			}
			var arr = time.split(",");
			var h = arr[0].length == 1 ? "0" + arr[0] : arr[0];
			var m = parseInt(arr[1]) * 15 + "";
			return(h.length > 1 ? h : ("0" + h)) + ":" + (m.length == 1 ? ("0" + m) : m);
		};
		global.getMonthDayNum = function(y, m) {
			var d31 = [1, 3, 5, 7, 8, 10, 12];
			var d30 = [2, 4, 6, 9, 11];
			m = m * 1;
			if(d31.indexOf(m) > -1) {
				return 31;
			} else {
				if(m == 2) {
					if(y % 4 == 0) {
						return 29
					} else {
						return 28;
					}
				}
				return 30;
			}
		};
	})(MyUtils)
	return MyUtils;
})