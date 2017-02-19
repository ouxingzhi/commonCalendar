(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Calendar = factory());
}(this, (function () { 'use strict';

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
	if(startNum < 0) startNum = 6 + startNum;
	console.log(startDay,firstDay);
	firstDate.setDate(-startNum);
	var endNum = 6 - (lastDay + startDay);
	var end = lastDate.getDate() + startNum + endNum;
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

var utils = {
	CDate: CDate_1,
	setZero: setZero_1,
	diffMonth: diffMonth_1,
	createMonth: createMonth,
	weekNumToChina: weekNumToChina_1,
	createElement: createElement
};

var U = utils;

function noop(){}

function CommonCalendar(ops){
	this.type = CommonCalendar.TYPE_SINGLE;

	this._select = new Date();

	this._startMonth = this._select;

	this._endMonth = this._select;

	this._rootBox = document.body;

	this._weekStartDay = 0;

	this._container;

	this._hookCreateCalenderAfter = noop;

	this._hookCreateCalenderDayAfter = noop;

	this._setOption(ops);
	this._init();
}

// 单选
CommonCalendar.TYPE_SINGLE = 1;
// 多选
CommonCalendar.TYPE_MULTI = 2;
// 范围
CommonCalendar.TYPE_RANGE = 3;

CommonCalendar.prototype = {
	constructor: CommonCalendar,
	_setOption:function(ops){
		ops = ops || {};

		if(ops.type){
			this.type = CommonCalendar.TYPE_SINGLE;
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
		if(ops.hookCalenderAfter){
			this._hookCalenderAfter = ops.hookCalenderAfter;
		}
		if(ops.hookCreateCalenderDayAfter){
			this._hookCreateCalenderDayAfter = ops.hookCreateCalenderDayAfter;
		}
	},
	_init:function(){
		this._initDom();
		this._initEvent();
	},
	_initDom:function(){
		var diff = U.diffMonth(this._startMonth,this._endMonth);
		this._container = U.createElement('<div class="calendar-box"></div>');
		for(var i=0; i<=diff; i++){
			this._container.appendChild(this._createMonthHtml(U.CDate(this._startMonth).addMonth(i).valueOf()));
		}
		if(typeof this._hookCalenderAfter === 'function') this._hookCalenderAfter(this._container);
		this._rootBox.appendChild(this._container);
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
	_createMonthHtml:function(month){
		var month = U.createMonth(month,this._weekStartDay);
		var table = document.createElement('table');
		var header = this._createWeekHeaderHtml();
		var td;
		table.appendChild(header);
		for(var i=0; i<month.length; i++){
			var tr = document.createElement('tr');
			// row.push('<tr>');
			for(var ii=0; ii<month[i].length; ii++){
				td = this.createDayCell(month[i][ii]);
				tr.appendChild(td);
				this._hookCreateCalenderDayAfter(td,month[i][ii]);
			}
			table.appendChild(tr);
			// row.push('</tr>');
			// line.push(row.join(''));
		}
		return table;
	},

	_initEvent:function(){

	},
	createDayCell:function(date){
		var td = document.createElement('td');//'<td>'+date.getDate()+'</td>','tr');
		td.innerHTML = date.getDate();
		return td;
	},
	createWeekHeaderCell:function(week){
		if(week > 6) week = 7 - week;
		var cWeek = U.weekNumToChina(week);
		var th = document.createElement('th');//'<td>'+date.getDate()+'</td>','tr');
		th.innerHTML = cWeek;
		return th;
	},
	select:function(date){

	}
};

var index = CommonCalendar;

return index;

})));
