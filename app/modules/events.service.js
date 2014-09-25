(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module( 'service.events', []);

function Module ($injector) {
  var _this = this;
  this.__signals = {};

  this.bind = function (name, func) {
    this.__signals[name] = this.__signals[name] || new signals.Signal();

    if (angular.isString(func)) {
      var prop = func.match(/\[(.*?)\]/)[1];
      var injection = func.replace(/\[(.*?)\]/, '');

      this.__signals[name].add(function () {
        var args = arguments;
        $injector.invoke([injection, function(mod){
          mod[prop].apply(mod, args);
        }]);
      });
    } else {
      this.__signals[name].add(func);
    }
  };

  this.dispatch = function (name) {
    this.__signals[name] = this.__signals[name] || new signals.Signal();

    var args = Array.prototype.slice.call(arguments, 1, Infinity);
    this.__signals[name].dispatch.apply(this, args);
  };

  this.sanitize = function (obj) {
    //TODO: implement
    return obj;
  };

  this.addEvents = function (obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this.bind(i, obj[i]);
      }
    }
  };

  this.parse = function (json) {
    try {
      var obj = JSON.parse(json);
      var commands = this.sanitize(obj);
      this.addEvents(commands);
    } catch (e) {}
  };
}

module.service('Events', Module);

/* -------------------------------------------------------------------------- */
})();
