(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Calendar = factory());
}(this, (function () { 'use strict';

Array.prototype.indexOf = Array.prototype.indexOf || function(obj){
	for(var i=0;i<this.length;i++){
		if(obj === this[i]) return i;
	}
	return -1;
};



function CDate(date){
	if(!(this instanceof CDate)){
		return new CDate(date);
	}
	this.date = clone(date);
	setZero(this.date);
}

CDate.prototype = {
	constructor:CDate,
	addDay:function(day){
		this.date.setDate(this.date.getDate()+day);
		return this;
	},
	subDay:function(day){
		this.date.setDate(this.date.getDate()-day);
		return this;
	},
	addMonth:function(month){
		this.date.setMonth(this.date.getMonth()+month);
		return this;
	},
	subMonth:function(month){
		this.date.setMonth(this.date.getMonth()-month);
		return this;
	},
	valueOf:function(){
		return clone(this.date);
	},
	clone:function(){
		return new CDate(this.date);
	}
};

var CDate_1 = CDate;

var setZero = function(date){
	date.setHours(0,0,0,1);
	return date;
};

var setZero_1 = setZero;

var clone = function(date, isZero){
	date = new Date(date.valueOf());
	if(isZero){
		setZero(date);
	}
	return date;
};

var clone_1 = clone;

var getMonthFirstDay = function(month){
	month = clone(month,true);
	month.setDate(1);
	setZero(month);
	return month;
};

var getMonthLastDay = function(month){
	month = clone(month,true);
	month.setMonth(month.getMonth()+1);
	month.setDate(0);
	return month;
};

var diffMonth = function(a, b){
	a = clone(a,true);
	b = clone(b,true);
	var i = 0;
	if(a.valueOf() < b.valueOf()){
		for(;a.valueOf() < b.valueOf();){
			i++;
			a.setMonth(a.getMonth()+i);
		}
	}
	return i;
};

var diffMonth_1 = diffMonth;

var createMonth = function(month, startDay){
	month = clone(month);
	setZero(month);
	startDay = startDay || 0;
	var firstDate = getMonthFirstDay(month);
	var lastDate = getMonthLastDay(month);

	console.log(firstDate,lastDate);
	var lastDay = lastDate.getDay();
	var firstDay = firstDate.getDay();

	var startNum = startDay - firstDay;
	if(startNum > 0) startNum = startNum - 7;
	console.log(startDay,firstDay);


	firstDate.setDate(startNum);
	var endNum = 7 - Math.abs(startNum);
	var end = lastDate.getDate() + Math.abs(startNum) + Math.abs(endNum);
	var cur;
	var weeks = [];
	var week = [];
	console.log(startNum,endNum);
	for(var i=1;i<=end;i++){
		cur = CDate(firstDate).addDay(i);
		//console.log(cur.date.toLocaleDateString(),cur.date.getDay());
		week.push(cur.valueOf());
		if(i%7 == 0){
			weeks.push(week);
			week = [];
		}
	}
	if(week.length){
		weeks.push(week);
	}
	weeks.month = month;
	return weeks;
};

var WEEKMAP = [
	'日',
	'一',
	'二',
	'三',
	'四',
	'五',
	'六'
];
var weekNumToChina = function(week){
	return WEEKMAP[week];
};

var weekNumToChina_1 = weekNumToChina;

var createElement = function(html,rootTagName){
	rootTagName = rootTagName || 'div';
	var c = document.createElement(rootTagName);
	c.innerHTML = html;
	var el = c.childNodes[0];
	c.removeChild(el);
	c = null;
	return el;
};


var addClass = function(el,cls){
	var reg = new RegExp('(?:^|\\s+)' + cls + '(?:$|\\s+)','im');
	!reg.test(el.className) && (el.className += ' ' + cls);
};

var delClass = function(el,cls){
	var reg = new RegExp('(?:^|\\s+)' + cls + '(?:$|\\s+)','img');
	el.className = el.className.replace(reg,' ');
};

var indexOfDate = function(arr,date){
	for(var i=0;i<arr.length;i++){
		if(arr[i] && arr[i].valueOf() === date.valueOf()) return i;
	}
	return -1;
};

var utils = {
	CDate: CDate_1,
	setZero: setZero_1,
	clone: clone_1,
	diffMonth: diffMonth_1,
	createMonth: createMonth,
	weekNumToChina: weekNumToChina_1,
	createElement: createElement,
	addClass: addClass,
	delClass: delClass,
	indexOfDate: indexOfDate
};

var U = utils;

var now = new Date();
U.setZero(now);

function noop(){}

function CommonCalendar(ops){
	this._type = CommonCalendar.TYPE_SINGLE;

	this._select = new Date();

	this._startMonth = this._select;

	this._endMonth = this._select;

	this._rootBox = document.body;

	this._weekStartDay = 0;

	this._container;

	this._hookCreateCalendarAfter = noop;

	this._hookCreateCalendarDayAfter = noop;

	this._time2DomMap = {};

	//只在范围选择时，起作用
	this._range_status = CommonCalendar.RANGE_STATUS_NOT_SELECT;

	this._setOption(ops);
	this._init();
}

// 单选
CommonCalendar.TYPE_SINGLE = 1;
// 多选
CommonCalendar.TYPE_MULTI = 2;
// 范围
CommonCalendar.TYPE_RANGE = 3;

//为范围选择时的状态定义
// 还未选择 
CommonCalendar.RANGE_STATUS_NOT_SELECT = 0;
// 选择第一个
CommonCalendar.RANGE_STATUS_SELECT_FIRST = 1;
// 选择第二个
CommonCalendar.RANGE_STATUS_SELECT_SECOND = 2;

var SELECT_CLS = 'cc-selected';

CommonCalendar.prototype = {
	constructor: CommonCalendar,
	_setOption:function(ops){
		ops = ops || {};

		if(ops.type){
			this._type = ops.type;
		}
		if(ops.startMonth){
			this._startMonth = ops.startMonth;
		}
		if(ops.endMonth){
			this._endMonth = ops.endMonth;
		}
		if(ops.rootBox){
			this._rootBox = ops.rootBox;
		}
		if(ops.weekStartDay){
			this._weekStartDay = ops.weekStartDay;
			if(this._weekStartDay > 6){
				this._weekStartDay = this._weekStartDay%7;
			}
		}
		if(ops.hookCalendarAfter){
			this._hookCalendarAfter = ops.hookCalendarAfter;
		}
		if(ops.hookCreateCalendarDayAfter){
			this._hookCreateCalendarDayAfter = ops.hookCreateCalendarDayAfter;
		}
	},
	_init:function(){
		this._initDom();
		this._initEvent();
		this._initSelect();
	},
	_initDom:function(){
		var diff = U.diffMonth(this._startMonth,this._endMonth);
		this._container = U.createElement('<div class="calendar-box"></div>');
		for(var i=0; i<=diff; i++){
			this._container.appendChild(this._createMonthHtml(U.CDate(this._startMonth).addMonth(i).valueOf()));
		}
		if(typeof this._hookCalendarAfter === 'function') this._hookCalendarAfter(this._container);
		this._rootBox.appendChild(this._container);
	},
	_initSelect:function(){
		if(this._type === CommonCalendar.TYPE_MULTI || this._type === CommonCalendar.TYPE_RANGE){
			this._select = [];
		}
	},
	_createWeekHeaderHtml:function(){
		var i;
		var weekStartDay = this._weekStartDay;
		var tr = document.createElement('tr');
		//htmls.push('<tr>');
		for(i=0;i<7;i++){
			tr.appendChild(this.createWeekHeaderCell(weekStartDay++));
		}
		//htmls.push('</tr>');
		return tr;
	},
	_createMonthHtml:function(date){
		var month = U.createMonth(date,this._weekStartDay);
		var table = document.createElement('table');
		var header = this._createWeekHeaderHtml();
		var td;
		table.appendChild(header);
		for(var i=0; i<month.length; i++){
			var tr = document.createElement('tr');
			// row.push('<tr>');
			for(var ii=0; ii<month[i].length; ii++){
				td = this.createDayCell(month[i][ii],date);
				tr.appendChild(td);
				this._initCalendarDayCell(td,month[i][ii],date);
				this._hookCreateCalendarDayAfter(td,month[i][ii],date);
			}
			table.appendChild(tr);
			// row.push('</tr>');
			// line.push(row.join(''));
		}
		return table;
	},

	_initEvent:function(){

	},
	_initCalendarDayCell:function(td,date,month){
		date = U.clone(date,true);
		month = U.clone(month,true);
		var invalid = month.getMonth() !== date.getMonth();
		var diff = date - month;
		if(invalid){
			U.addClass(td,'cc-invalid');
			td.className = [td.className,'cc-invalid'].join(' ');
		}else{
			this._time2DomMap[date.valueOf()] = td;
		}
		if(now.valueOf() === date.valueOf()){
			U.addClass(td,'cc-today');
		}
		var self = this;
		td.addEventListener("click",function(e){
			if(invalid){
				return;
			}
			self._selectDate(date);
		},false);
		
	},
	createDayCell:function(date){
		var td = document.createElement('td');//'<td>'+date.getDate()+'</td>','tr');
		td.innerHTML = date.getDate();
		return td;
	},
	createWeekHeaderCell:function(week){
		if(week > 6) week = week % 7;
		var cWeek = U.weekNumToChina(week);
		var th = document.createElement('th');//'<td>'+date.getDate()+'</td>','tr');
		th.innerHTML = cWeek;
		return th;
	},
	// 可以传入单个时间对象或是数组多个时间对象，
	// single 模式 只接受一个date对象
	// mutli 模式 可接受多个date对象的数组
	// range 模式 可以接受两个date对象的数组，第0个为开始时间，第1个为结束时间
	_selectDate:function(date){
		date = U.clone(date,true);
		if(this._type === CommonCalendar.TYPE_SINGLE){
			this._selectSingleDate(date);
		}else if(this._type === CommonCalendar.TYPE_MULTI){
			this._selectMutliDate(date);
		}else if(this._type === CommonCalendar.TYPE_RANGE){
			this._selectRangeDate(date);
		}
	},
	_selectDayDom:function(date){
		var selectDom = this._time2DomMap[date.valueOf()];
		if(selectDom){
			U.addClass(selectDom, SELECT_CLS);
		}
	},
	_unSelectDayDom:function(date){
		var selectDom = this._time2DomMap[date.valueOf()];
		if(selectDom){
			U.delClass(selectDom, SELECT_CLS);
		}
	},
	_selectSingleDate:function(date){
		if(this._select && this._select instanceof Date){
			this._unSelectDayDom(this._select);
		}
		if(date && date instanceof Date){
			this._selectDayDom(date);
		}
	},

	_selectMutliDate:function(date){
		var index = U.indexOfDate(this._select,date);
		if(index > -1){
			this._select.splice(index,1);
			this._unSelectDayDom(date);
		}else{
			this._select.push(date);
			this._selectDayDom(date);
		}
	},
	_selectRangeDate:function(date){
		if(this._range_status === CommonCalendar.RANGE_STATUS_NOT_SELECT){
			this._select = [date];
			this._selectDayDom(date);
			this._range_status = CommonCalendar.RANGE_STATUS_SELECT_FIRST;
		}else if(this._range_status === CommonCalendar.RANGE_STATUS_SELECT_FIRST){
			var start = this._select[0];
			var end = date;
			if(date.valueOf() < start.valueOf()){
				var tmp = start;
				start = end;
				end = tmp;
			}
			this._select = this._findDateMonthRange(start,end);
			var select = this._select;
			for(var i=0; i<select.length; i++){
				this._selectDayDom(select[i]);
			}
			this._range_status = CommonCalendar.RANGE_STATUS_SELECT_SECOND;
		}else if(this._range_status === CommonCalendar.RANGE_STATUS_SELECT_SECOND){
			var select = this._select || [];
			for(var i=0; i<select.length; i++){
				this._unSelectDayDom(select[i]);
			}
			this._select = [date];
			this._selectDayDom(date);
			this._range_status = CommonCalendar.RANGE_STATUS_SELECT_FIRST;
		}
	},
	_findDateMonthRange:function(start,end){
		var list = [];
		var map = this._time2DomMap;
		var cur;
		var s = start.valueOf();
		var e = end.valueOf();
		for(var i in map){
			i = parseInt(i);
			if(s <= i && i <= e){
				list.push(new Date(i));
			}
		}
		return list;
	},
	selectDateByWeek:function(week){
		var map = this._time2DomMap;
		var select = [];
		var cur;
		for(var i in map){
			cur = U.clone(parseInt(i),true);
			if(cur.getDay() === week){
				select.push(cur);
				this._selectDayDom(cur);
			}
		}
		this._select.splice(0);
		this._select = select;
	},
	select:function(date){
		if(this._type === CommonCalendar.TYPE_SINGLE){
			this._selectSingleDate(date);
		}else if(this._type === CommonCalendar.TYPE_MULTI){
			for(var i=0;i<date.length;i++){
				this._selectMutliDate(U.clone(date[i],true));
			}
		}else if(this._type === CommonCalendar.TYPE_RANGE){
			this._selectMutliDate(U.clone(date[0],true));
			this._selectMutliDate(U.clone(date[1],true));
		}
	}
};

var index = CommonCalendar;

return index;

})));
