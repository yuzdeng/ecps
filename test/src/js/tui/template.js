/**
 * A lightweight and enhanced micro-template implementation, and minimum utilities
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define('tui/template', [], function(require, exports){

	exports.ns = function(namespace, v, parent){
		var i, p = parent || window, n = namespace.split(".").reverse();
		while ((i = n.pop()) && n.length > 0) {
			if (typeof p[i] === 'undefined') {
				p[i] = {};
			} else if (typeof p[i] !== "object") {
				return false;
			}
			p = p[i];
		}
		if (typeof v !== 'undefined')
			p[i] = v;
		return p[i];
	};

	exports.format = function(tpl, op){
		return tpl.replace(/<%\=(\w+)%>/g, function(e1,e2){
			return op[e2] != null ? op[e2] : "";
		});
	};

	exports.escapeHTML = function(str){
		str = str || '';
		var xmlchar = {
			//"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"'": "&#39;",
			'"': "&quot;",
			"{": "&#123;",
			"}": "&#125;",
			"@": "&#64;"
		};
		return str.replace(/[<>'"\{\}@]/g, function($1){
			return xmlchar[$1];
		});
	};

	exports.substr = function(str, limit, cb){
		if(!str || typeof str !== "string")
			return '';
		var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ').substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
		return cb ? cb.call(sub, sub) : (str.length > sub.length ? sub + '...' : sub);
	};

	exports.strsize = function(str){
		return str.replace(/([^\x00-\xff]|[A-Z])/g, '$1 ').length;
	};

	var document = this.document;

	exports.tplSettings = {
		_cache: {},
		evaluate: /<%([\s\S]+?)%>/g,
		interpolate: /<%=([\s\S]+?)%>/g
	};

	exports.tplHelpers = {
		mix: $.extend,
		escapeHTML: exports.escapeHTML,
		substr: exports.substr,
		include: convertTpl,
		_has: function(obj){
			return function(name){
				return exports.ns(name, undefined, obj);
			};
		}
	};

	function convertTpl(str, data, namespace){
		var func, c  = exports.tplSettings, suffix = namespace ? '#' + namespace : '';
		if (!/[\t\r\n% ]/.test(str)) {
			func = c._cache[str + suffix];
			if (!func) {
				var tplbox = document.getElementById(str);
				if (tplbox) {
					func = c._cache[str + suffix] = convertTpl(tplbox.innerHTML, false, namespace);
				}
			}
		} else {
			func = new Function(namespace || 'obj', 'api', 'var __p=[];'
				+ (namespace ? '' : 'with(obj){')
					+ 'var mix=api.mix,escapeHTML=api.escapeHTML,substr=api.substr,include=api.include,has=api._has(' + (namespace || 'obj') + ');'
					+ '__p.push(\'' +
					str.replace(/\\/g, '\\\\')
						.replace(/'/g, "\\'")
						.replace(c.interpolate, function(match, code) {
							return "'," + code.replace(/\\'/g, "'") + ",'";
						})
						.replace(c.evaluate || null, function(match, code) {
							return "');" + code.replace(/\\'/g, "'")
												.replace(/[\r\n\t]/g, ' ') + "__p.push('";
						})
						.replace(/\r/g, '\\r')
						.replace(/\n/g, '\\n')
						.replace(/\t/g, '\\t')
					+ "');"
				+ (namespace ? "" : "}")
				+ "return __p.join('');");
		}
		return !func ? '' : (data ? func(data, exports.tplHelpers) : func);
	}

	exports.convertTpl = convertTpl;
	exports.reloadTpl = function(str){
		delete exports.tplSettings._cache[str];
	};

});
