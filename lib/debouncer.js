'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var DEFAULT_OPTIONS = {
	default_wait: 1000 * 30 // 30 seconds
};

var EMIT = exports.EMIT = {
	data: 'data'
};

/**
 * Debouncer class
 * @param {object|number} options The only option is default wait for debounced events
 * @constructor
 */
function Debouncer(options) {
	var thisDebouncer = this;
	
	this.EMIT = EMIT;
	
	if (typeof options === 'number') {
		options = {
			wait: options
		};
	}
	
	options = Object.assign({}, DEFAULT_OPTIONS, options);
	
	var _events = {};
	
	thisDebouncer.submit = submit;
	thisDebouncer.trigger = trigger;
	thisDebouncer.clear = clear;
	thisDebouncer.flush = flush;
	
	return;
	
	/**
	 * Submit event to be debounced
	 * @param {string} name Event name. You should listen under this name to receive events
	 * @param {number|null} [wait] How many ms to debounce. If not provided, we use default
	 * @param {*} data Whatever data you put here will come out on the other end
	 */
	function submit(name, wait, data) {
		if (arguments.length < 3) {
			data = wait;
			wait = null;
		}
		
		wait = wait || options.default_wait;
		
		var event = _events[name];
		if (!event) {
			event =  _events[name] = {
				name: name,
				timeout: null,
				lastEmit: null
			};
		}
		
		event.data = data;
		
		if (event.timeout) {
			// We are already waiting. Nothing more to do
			return;
		}
		
		var targetWait = event.lastEmit
			? wait - (new Date() - event.lastEmit)
			: 0;
		if (targetWait <= 0) {
			// We can emit right now
			onTimeout(name);
		} else {
			// Set up the timeout
			event.timeout = setTimeout(onTimeout.bind(thisDebouncer, name), targetWait);
		}
	}
	
	/**
	 * Override timeout for event with "name". If there are events waiting, they will be timed out
	 * @param name
	 */
	function trigger(name) {
		return onTimeout(name);
	}
	
	function onTimeout(name) {
		var event = _events[name];
		if (!event) {
			return false;
		}
		
		clearTimeout(event.timeout);
		event.timeout = null;
		
		event.lastEmit = new Date();
		
		thisDebouncer.emit(name, event.data);
		thisDebouncer.emit(EMIT.data, name, event.data);
		return true;
	}
	
	function doClear(flush) {
		for (var key in _events) {
			var event = _events[key];
			clearTimeout(event.timeout);
			
			if (flush) {
				onTimeout(event.name);
			}
		}
		
		_events = {};
	}
	
	/**
	 * Clear all pending events, no emits
	 */
	function clear() {
		doClear(false);
	}
	
	/**
	 * Clear all pending events and emit their events
	 */
	function flush() {
		doClear(true);
	}
}
util.inherits(Debouncer, EventEmitter);

// *********************************************************************************************************************

Debouncer.EMIT = EMIT;
module.exports = Debouncer;