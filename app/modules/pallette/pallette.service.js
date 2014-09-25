(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var _cache = {};

/* -------------------------------------------------------------------------- */

var module = angular.module( 'service.pallette', []);

function Module ($q, $rootScope, $injector) {
  function update () {
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }

  function Pallette (name) {
    if (!_cache[name]) _cache[name] = this;

    this.items = {};
    this.active = false;
    this.selectedIndex = 0;
    this.__flattenedItems = [];
    this.__registeredFunctions = [];
    this.__itemCache = [];

    this.add = function (title, arr) {
      this.items[title] = arr;
      this.__flattenedItems = this.getFlattendItems();
      update();
    };

    this.pushDown = function (arr) {
      if (!arr) return;

      this.selectedIndex = 0;
      this.__itemCache.push(this.items);
      this.items = {};
      this.items.pushed = arr;
      update();
    };

    this.popUp = function () {
      var length = this.__itemCache.length;
      if (!length) return;

      this.selectedIndex = 0;
      this.items = {};
      this.items = this.__itemCache.splice(length - 1, length)[0];
      update();
    };

    this.getActions = function (title) {
      return this.items[title];
    };

    this.clear = function (title) {
      this.items[title] = [];
      update();
    };

    this.toggle = function () {
      for (var i in _cache) {
        _cache[i].active = false;
        _cache[i].close();
      }

      this.active = !this.active;
      if (!this.active) this.close();

      update();
    };

    this.close = function () {
      this.selectedIndex = 0;
      this.active = false;

      if (this.__itemCache.length) {
        this.items = this.__itemCache[0];
        this.__itemCache.length = 0;
      }

      update();
    };

    this.moveIndex = function (change) {
      var newVal = this.selectedIndex + change;

      if (newVal < 0 || newVal > this.__flattenedItems.length - 1) return;

      this.selectedIndex = newVal;
      update();
    };

    this.addFn = function (ctx, fn /*, args*/) {
      this.__registeredFunctions.push({
        fn: fn,
        ctx: ctx,
        args: arguments.slice(2, Infinity)
      });
    };

    this.trigger = function ($event) {
      var items = this.getFlattendItems();
      var item = items[this.selectedIndex];
      var ret = false;
      var _this = this;

      if (item && item.click) {
        if (angular.isFunction(item.click)) {
          ret = item.click($event, item);
        } else if (angular.isString(item.click)) {
          var func = item.click;
          var prop = func.match(/\[(.*?)\]/)[1];
          var injection = func.replace(/\[(.*?)\]/, '');

          $injector.invoke([injection, function(mod){
            ret = mod[prop]($event, item);
          }]);
        }

        if (angular.isArray(ret)) {
          this.pushDown(ret);

          return true;
        } else if (angular.isObject(ret) && angular.isFunction(ret.then)) {
          ret.then(function (arr) {
            _this.pushDown(arr);
          });

          return true;
        }
      }

      return (ret || false);
    };

    this.getFlattendItems = function () {
      var items = [];

      for (var i in this.items) {
        if (this.items.hasOwnProperty(i)) {
          items = items.concat(this.items[i]);
        }
      }

      return items;
    };

    this.addCommand = function (cmd) {
      cmd.click = cmd.command;
    };

    this.sanitize = function (obj) {
      //TODO: implement
      return obj.commands;
    };

    this.addCommands = function (arr) {
      for (var i = 0; i < arr.length; i++) {
        this.addCommand(arr[i]);
      }

      // we manipulated the array in-place in addCommand so can just pass thru
      this.add('default', arr);
    };

    this.parse = function (json) {
      try {
        var obj = JSON.parse(json);
        var commands = this.sanitize(obj);
        this.addCommands(commands);
      } catch (e) {}
    };

    return _cache[name];
  }

  return Pallette;
}

module.factory( 'Pallette', Module);

/* -------------------------------------------------------------------------- */
})();
