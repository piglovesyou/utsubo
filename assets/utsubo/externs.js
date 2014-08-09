
var console = {};

var module = {};
module.exports;

var CollectGarbage = function(){};

var define = function(a, b){};
define.amd;

var io = {};
/** @return {Socket} */
io.connect = function() {};


/** @constructor */
var Socket = function(){};
Socket.prototype.on;
Socket.prototype.get;
Socket.prototype.post;



var ObjectInterface = {};



/**
 * @constructor
 */
ObjectInterface.Entry = function () {};
ObjectInterface.Entry.prototype.id;
ObjectInterface.Entry.prototype.title;
ObjectInterface.Entry.prototype.css;
ObjectInterface.Entry.prototype.mode;
ObjectInterface.Entry.prototype.type;
ObjectInterface.Entry.prototype.text;

/**
 * @constructor
 */
ObjectInterface.Scenario = function () {};
ObjectInterface.Scenario.prototype.id;
ObjectInterface.Scenario.prototype.title;
/** @type {Array.<ObjectInterface.Entry>} */
ObjectInterface.Scenario.prototype.entries;



ObjectInterface.Json = {};

/**
 * @constructor
 */
ObjectInterface.Json.Progress = function() {};
ObjectInterface.Json.Progress.prototype.end;
ObjectInterface.Json.Progress.prototype.passed;
/** @type {ObjectInterface.Entry} */
ObjectInterface.Json.Progress.prototype.entry;


