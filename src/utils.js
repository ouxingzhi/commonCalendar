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

var formatReg = /[a-z]/img;
var format = function(date,str){
	return str.replace(formatReg,function(a){
		if(FORMATFN[a]){
			return FORMATFN[a](a);
		}
		return a;
	});
}

exports.format = format;

function fillZore(i,l){
	l = l || 2;
	i = String(i);
	var len = l - i.length;
	return len > 0 ? (Array(len+1).join('0') + i) : i;
}
var WEEK_VAL = ['日','一','二','三','四','五','六'];

var FORMATFN = {
	//带0的天
	d:function(date){
		return fillZore(date.getDate());
	},
	//不带0的天
	j:function(date){
		return date.getDate();
	},
	//周1-7
	N:function(date){
		var week = date.getDay();
		return week === 0 ? 7 : week;
	},
	//周0-6
	w:function(date){
		return date.getDay();
	},
	//周一到周日
	W:function(date){
		var w = date.getDay();
		return WEEK_VAL[w];
	},
	//带0的月
	m:function(date){
		return fillZore(date.getMonth()+1);
	},
	//不带0的月
	n:function(date){
		return date.getMonth()+1;
	},
	//4位年
	Y:function(date){
		return date.getFullYear();
	},
	//2位年
	y:function(date){
		return String(date.getFullYear()).replace(/^\d{2}/,'');
	},
	//不带零的12小时制
	g:function(date){
		var hours = date.getHours();
		return hours > 12 ? (hours - 12) : hours;
	},
	//不带零的24小时制
	G:function(date){
		return date.getHours();
	},
	//带零的12小时制
	h:function(date){
		var hours = date.getHours();
		return fillZore(hours > 12 ? (hours - 12) : hours);
	},
	//带零的24小时制
	H:function(date){
		return fillZore(date.getHours());
	},
	//有前导零的分钟数
	i:function(date){
		return fillZore(date.getMinutes())
	},
	//秒数，有前导零
	s:function(date){
		return fillZore(date.getSeconds())
	},
	//毫秒
	u:function(date){
		return fillZore(date.getMilliseconds(),3);
	}
}

exports.parse = function(str){
	return new Date(Date.parse(str.replace(/-/g,'/')));
}
