"use strict";

Array.prototype.indexOf = Array.prototype.indexOf || function(obj){
	for(var i=0;i<this.length;i++){
		if(obj === this[i]) return i;
	}
	return -1;
}



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
		this.date.setDate(this.date.getDate()+day)
		return this;
	},
	subDay:function(day){
		this.date.setDate(this.date.getDate()-day);
		return this;
	},
	addMonth:function(month){
		this.date.setMonth(this.date.getMonth()+month)
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
}

exports.CDate = CDate;

var setZero = function(date){
	date.setHours(0,0,0,1);
	return date;
}

exports.setZero = setZero;

var clone = function(date, isZero){
	date = new Date(date.valueOf());
	if(isZero){
		setZero(date);
	}
	return date;
}

exports.clone = clone;

var getMonthFirstDay = function(month){
	month = clone(month,true);
	month.setDate(1);
	setZero(month);
	return month;
}

var getMonthLastDay = function(month){
	month = clone(month,true);
	month.setMonth(month.getMonth()+1);
	month.setDate(0);
	return month;
};

var setNextMonthFirstDay = function(month){
	month.setMonth(month.getMonth()+1);
	setZero(month);
}

var setPreMonthLastDay = function(month){
	month.setDate(0);
	setZero(month);
};

var getNextMonthFirstDay = function(month){
	month = clone(month);
	setNextMonthFirstDay(month);
	return month;
}

var getPreMonthLastDay = function(month){
	month = clone(month);
	setPreMonthLastDay(month);
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
}

exports.diffMonth = diffMonth;

exports.createMonth = function(month, startDay){
	month = clone(month);
	setZero(month);
	startDay = startDay || 0;
	var firstDate = getMonthFirstDay(month);
	var lastDate = getMonthLastDay(month);

	console.log(firstDate,lastDate)
	var lastDay = lastDate.getDay();
	var firstDay = firstDate.getDay();

	var startNum = startDay - firstDay;
	if(startNum > 0) startNum = startNum - 7;
	console.log(startDay,firstDay)


	firstDate.setDate(startNum);
	var absStartNum = Math.abs(startNum)
	var endNum = function(total){
		var t = total % 7;
		return t === 0 ? 0 : (7 - t);
	}(absStartNum+lastDate.getDate());
	var end = lastDate.getDate() + absStartNum + endNum;
	var cur;
	var weeks = [];
	var week = [];
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

exports.weekNumToChina = weekNumToChina;

exports.createElement = function(html,rootTagName){
	rootTagName = rootTagName || 'div';
	var c = document.createElement(rootTagName);
	c.innerHTML = html;
	var el = c.childNodes[0];
	c.removeChild(el);
	c = null;
	return el;
}


exports.addClass = function(el,cls){
	var reg = new RegExp('(?:^|\\s+)' + cls + '(?:$|\\s+)','im');
	!reg.test(el.className) && (el.className += ' ' + cls);
}

exports.delClass = function(el,cls){
	var reg = new RegExp('(?:^|\\s+)' + cls + '(?:$|\\s+)','img');
	el.className = el.className.replace(reg,' ');
}

exports.indexOfDate = function(arr,date){
	for(var i=0;i<arr.length;i++){
		if(arr[i] && arr[i].valueOf() === date.valueOf()) return i;
	}
	return -1;
}

exports.mergeDate = function(a,b){
	b = b || []
	for(var i=0;i<b.length;i++){
		if(exports.indexOfDate(a,b[i]) === -1){
			a.push(b[i])
		}
	}
}

exports.deleteDate = function(a,b){
	b = b || [];
	var index;
	for(var i=0;i<b.length;i++){
		index = exports.indexOfDate(a,b[i])
		if(index > -1){
			a.splice(index,1);
		}
	}
}
