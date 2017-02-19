"use strict";

var U = require("./utils");

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
			table.appendChild(tr)
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

module.exports = CommonCalendar;