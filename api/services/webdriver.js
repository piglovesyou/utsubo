var assert = require('assert');
var webdriver = require('selenium-webdriver');
global.goog = require('closure').Closure({ CLOSURE_BASE_PATH: 'libs/closure-library/closure/goog/' });
goog.require('goog.string');
var Q = require('q');
var util = require('util');
var EventEmitter = require('events').EventEmitter;



module.exports.Executor = Executor;



/**
 * @constructor
 */
function Executor(entries) {
  EventEmitter.call(this);
  Object.defineProperty(this, 'entries', { value: entries });
  Object.seal(this);
}
util.inherits(Executor, EventEmitter);

Executor.prototype.execute = function() {
  var that = this;
  var context = new Context;
  // Not return promise for preventing confusing
  this.entries.reduce(function(p, e) {
    return p.then(function() {
      that.emit('before', e);
      return executionMap[e.mode][e.type](context, e.css, e.text);
    });
  }, Q())
  .then(function() {
    that.emit('pass');
    context.quit();
    that.emit('end');
    return context;
  })
  .catch (function(e) {
    that.emit('error', e);
    context.quit(); // Make sure to quit even if an error occures.
    that.emit('end', e);
    // throw new Error(e);
  })
};




// Example
var seed = {
	title: 'xxx',
	entries: [
		{title: 'open website', mode: 'action', type: 'open', text: 'http://yan-yan-yahuoku.com'},
		{title: 'remove extra tag', mode: 'action', type: 'click', css: '.button-tag .button-remove'},
		{title: 'input search text', mode: 'action', type: 'input', css: 'body:nth-child(2) div.body:nth-child(2) div.frame.app-frame-selected div.tag-input div.tag-input-leftcontent:nth-child(2) input.tag-input-textbox', text: 'AKB' + webdriver.Key.ENTER},
		{title: 'verify whether any item was loaded', mode: 'verify', type: 'contains', css: 'body:nth-child(2) div.body:nth-child(2) div.frame.app-frame-selected div.goog-splitpane:nth-child(2) div.goog-splitpane-first-container div.goog-list.pane-list.goog-splitpane-first-container div.goog-list-container:nth-child(2) div.pure-g.pane-list-item.goog-list-item div.pure-u-18-24:nth-child(2) div.pane-list-item-title', text: 'AKB'}
	]
};
var executor = new Executor(seed.entries);
executor.on('before', function (entry) { console.log('before ' + entry.title + ' ...') })
executor.on('pass', function () { console.log('test passed.') })
executor.on('error', function (e) { console.log(e, 'error occures!!!!!!!') })
executor.on('end', function () { console.log('end.') })
executor.execute();





/**
 * executionMap[mode][type](css, text)
 */
var executionMap = {
	action: {
		open: actionOpen,
		click: actionClick,
		input: actionInput
	},
	verify: {
		equal: verify.bind(null, 'equal'),
		contains: verify.bind(null, 'contains'),
		startsWith: verify.bind(null, 'startsWith'),
		endsWith: verify.bind(null, 'endsWith')
	}
};




function actionOpen(context, noUse, url) {
	return context.open(url);
}
function actionClick(context, css) {
	return context.wait(css).then(function() {
    return context.find(css).click().then(function() {
		  return context;
		});
	});
}
function actionInput(context, css, input) {
	return context.wait(css).then(function() {
		return context.find(css).sendKeys(input);
	});
}
function verify(type, context, css, text) {
	var method = mapVerifyMethod(type);
	return context.wait(css).then(function() {
		return context.find(css).getText().then(function(v) {
			assert(method(v, text));
		});
	});
}




/**
 * @constructor
 */
function Context() {
  Object.defineProperty(this, 'driver_', {
    value: new webdriver.Builder().
        withCapabilities(webdriver.Capabilities.chrome()).
        build()
  });
  Object.seal(this);
}
Context.prototype.open = function(url) {
  return this.driver_.get(url);
};
Context.prototype.wait = function(selector) {
  var that = this;
	return that.driver_.wait(function() {
		return that.driver_.isElementPresent(webdriver.By.css(selector));
	}, 1000);
};
Context.prototype.find = function(css) {
  return this.driver_.findElement(webdriver.By.css(css));
};
Context.prototype.quit = function() {
  return this.driver_.quit();
};




function mapVerifyMethod(type) {
	assert([
		'equal',
		'contains',
		'startsWith',
		'endsWith'
	].some(function(s) {return s == type}));
	return type == 'equal' ?
		function(text, v) { return text == v } : goog.string[type];
}
