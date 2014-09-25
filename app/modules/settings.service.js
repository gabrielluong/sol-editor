(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module( 'service.settings', []);

function Module () {
  this.__settings = {};
  this.__watchers = {};

  var _this = this;

  this.set = function (setting) {
    var diff = getDiff(this.__settings, setting);
    angular.extend(this.__settings, setting);

    this.notifyDiff(diff);
  };

  this.watch = function (settingName, fn, ctx) {
    ctx = ctx || this;
    this.__watchers[settingName] = this.__watchers[settingName] || [];
    this.__watchers[settingName].push({
      fn: fn,
      ctx: ctx
    });
  };

  this.notifyDiff = function (diff) {
    var watcherNames = [], _this = this;

    function _buildWatcherNames (name, obj) {
      for (var i in obj) {
        if (angular.isObject(obj[i])) {
          if (name.length)
            name += '.';

          _buildWatcherNames(name + i, obj[i]);
        } else {
          watcherNames.push(i);
        }
      }
    }

    _buildWatcherNames('', diff);

    watcherNames.forEach(function (name) {
      var watchers = _this.__watchers[name];

      watchers.forEach(function (watcher) {
        watcher.fn.call(watcher.ctx, name);
      });
    });
  };

  this.addSettings = function (obj) {
    var diff = getDiff(this.__settings, obj);
    angular.extend(this.__settings, obj);

    this.notifyDiff(diff);
  };

  this.parse = function (json) {
    try {
      var settings = JSON.parse(json);
      this.addSettings(settings);
    } catch (e) {}
  };
}

module.service('Settings', Module);

/* -------------------------------------------------------------------------- */
})();
