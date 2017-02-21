"use strict";

var U = require("./utils");

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

	this._hookCreateCalendarCellAfter = noop;

	this._hookCreateCalendarRowAfter = noop;

	this._hookCreateCalendarHeaderCellAfter = noop;

	this._hookCreateCalendarHeaderRowAfter = noop;

	this._time2DomMap = {};

	//只在范围选择时，起作用
	this._range_status = CommonCalendar.RANGE_STATUS_NOT_SELECT;

	this._events = {};

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
		if(ops.hookCreateCalendarCellAfter){
			this._hookCreateCalendarCellAfter = ops.hookCreateCalendarCellAfter;
		}
		if(ops.hookCreateCalendarRowAfter){
			this._hookCreateCalendarRowAfter = ops.hookCreateCalendarRowAfter;
		}
		if(ops.hookCreateCalendarHeaderCellAfter){
			this._hookCreateCalendarHeaderCellAfter = ops.hookCreateCalendarHeaderCellAfter;
		}
		if(ops.hookCreateCalendarHeaderRowAfter){
			this._hookCreateCalendarHeaderRowAfter = ops.hookCreateCalendarHeaderRowAfter;
		}
	},
	_init:function(){
		this._initDom();
		this._initEvent();
		this._initSelect();
	},
	_initDom:function(){
		if(!this._endMonth || this._endMonth < this._startMonth){
			this._endMonth = this._startMonth;
		}
		var diff = U.diffMonth(this._startMonth,this._endMonth);
		this._container = U.createElement('<div class="calendar-box"></div>');
		var table;
		for(var i=0; i<=diff; i++){
			table = this._createMonthHtml(U.CDate(this._startMonth).addMonth(i).valueOf());
			this._container.appendChild(table);
			if(typeof this._hookCalendarAfter === 'function') this._hookCalendarAfter(table);
		}
		if(typeof this._hookCalendarAfter === 'function') this._hookCalendarAfter(this._container);
		this._rootBox.appendChild(this._container);
	},
	_initSelect:function(){
		if(this._type === CommonCalendar.TYPE_MULTI || this._type === CommonCalendar.TYPE_RANGE){
			this._select = [];
		}else{
			this._select = null;
		}
	},
	_clear:function(){
		this._container.parentNode.removeChild(this._container);
		this._container = null;
	},
	_createWeekHeaderHtml:function(){
		var i;
		var weekStartDay = this._weekStartDay;
		var tr = document.createElement('tr');
		//htmls.push('<tr>');
		for(i=0;i<7;i++){
			var th = this.createWeekHeaderCell(weekStartDay);
			this._hookCreateCalendarHeaderCellAfter(th,weekStartDay);
			tr.appendChild(th);
			weekStartDay++
		}
		//htmls.push('</tr>');
		this._hookCreateCalendarHeaderRowAfter(tr);
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
				this._hookCreateCalendarCellAfter(td,month[i][ii],date);
			}
			if(typeof this._hookCreateCalendarRowAfter === 'function') this._hookCreateCalendarRowAfter(tr);
			table.appendChild(tr)
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
			self.emit('dayClick',e,date);
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
		var e = end.valueOf()
		for(var i in map){
			i = parseInt(i);
			if(s <= i && i <= e){
				list.push(new Date(i));
			}
		}
		return list;
	},
	selectOf:function(fn){
		if(this._type !== CommonCalendar.TYPE_MULTI || !fn) return;

		var map = this._time2DomMap;
		var select = [];
		var cur;
		for(var i in map){
			cur = U.clone(parseInt(i),true);
			if(fn(cur)){
				select.push(cur);
				this._selectDayDom(cur)
			}
		}
		U.mergeDate(this._select,select);
	},
	unSelectOf:function(fn){
		if(this._type !== CommonCalendar.TYPE_MULTI || !fn) return;

		var map = this._time2DomMap;
		var unselect = [];
		var cur;
		for(var i in map){
			cur = U.clone(parseInt(i),true);
			if(fn(cur)){
				unselect.push(cur);
				this._unSelectDayDom(cur)
			}
		}
		U.deleteDate(this._select,unselect);
	},
	select:function(date){
		date = date || new Date();
		if(this._type === CommonCalendar.TYPE_SINGLE){
			this._selectSingleDate(U.clone(date,true));
		}else if(this._type === CommonCalendar.TYPE_MULTI){
			if(!(date instanceof Array)) date = [date];
			for(var i=0;i<date.length;i++){
				this._selectMutliDate(U.clone(date[i],true))
			}
		}else if(this._type === CommonCalendar.TYPE_RANGE){
			this._range_status = CommonCalendar.RANGE_STATUS_NOT_SELECT;
			this._selectMutliDate(U.clone(date[0],true));
			this._selectMutliDate(U.clone(date[1],true));
		}
	},
	getSelect:function(){
		return this._select;
	},
	on:function(eventName,fn){
		var eves = this._events[eventName] = this._events[eventName] || [];
		(typeof fn === 'function') && eves.push(fn);
	},
	off:function(eventName,fn){
		var eves = this._events[eventName] = this._events[eventName] || [];
		if(fn){
			var index = eves.indexOf(fn);
			eves.splice(index,1);
		}else{
			this._events[eventName] = [];
		}
	},
	emit:function(eventName){
		var eves = this._events[eventName] = this._events[eventName] || [];
		var args = [].slice.call(arguments,1);
		for(var i=0;i<eves.length;i++){
			if(typeof eves[i] === 'function'){
				eves[i].apply(this,args);
			}
		}
	},
	update:function(ops){
		this._clear();
		this._setOption(ops);
		this._init();
	}
};

module.exports = CommonCalendar;