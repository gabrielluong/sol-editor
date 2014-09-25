(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var attributes = [
  'templateUrl',
  'template',
  'controller',
  'title',
  'icon',
  'size',
  'forceVisible',
  'visible'
];

function pick (obj) {
  var ret = {}, diff = {};

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (attributes.indexOf(i) === -1) {
        diff['$' + i] = obj[i];
      } else {
        ret[i] = obj[i];
      }
    }
  }

  return {
    diff: diff,
    obj: ret
  };
}

var _cache = {};

/* -------------------------------------------------------------------------- */

var module = angular.module( 'service.launch_bar', [
  'service.signals',
  '__packages__'
]);

function Module ($rootScope, $controller, Signals) {
  function update () {
    if(!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }

  function LaunchBar (name, direction) {

    var ret = {
      __sortIndex: 0,
      name: name,
      direction: direction,
      modules: [],
      signals: {
        onAdd: new signals.Signal(),
        onRemove: new signals.Signal(),

        onSelected: new signals.Signal(),
        onDeselected: new signals.Signal()
      },

      add: function (attrs) {
        if (!attrs) return this;

        var picked = pick(attrs);

        picked.obj.active = false;

        if (!picked.obj.forceVisible) {
          picked.obj.visible = false;
        }

        this.modules.push(picked.obj);

        var module = this.modules[this.modules.length - 1];

        module.scope = $rootScope.$new();
        module.controller = $controller( module.controller, $.extend({ $scope: module.scope }, picked.diff) );
        module.extensions = [];

        this.signals.onAdd.dispatch(module, this.modules.length - 1);

        update();

        return this;
      },

      remove: function (index) {
        var spliced = this.modules.splice(index, 1);

        this.signals.onRemove.dispatch(spliced);

        return this;
      },

      toggle: function (index) {
        this.modules[index].active = !this.modules[index].active;

        Signals.viewResize.dispatch();

        if (this.modules[index].active) {
          sortModules(index);
        }

        return this;
      }
    };

    function sortModules (mostRecentActivated) {
      for (var i = mostRecentActivated; i >= 0; i--) {
        if (i === mostRecentActivated) ret.modules[i].__sortIndex = 0;
        else ret.modules[i].__sortIndex = i - 1;
      }
    }

    if (!_cache[name]) _cache[name] = ret;

    return _cache[name];
  }

  // TODO... holy shit wut
  LaunchBar.keep = function (arr, guid) {
    for (var i in _cache) {
      for (var j = 0; j < _cache[i].modules.length; j++) {
        _cache[i].modules[j].scope.guid = guid;

        if (!_cache[i].modules[j].forceVisible) {
          _cache[i].modules[j].visible = false;
        }

        for (var l = 0; l < _cache[i].modules[j].extensions.length; l++) {
          _cache[i].modules[j].extensions[l].scope.guid = guid;
        }

        for (var k = 0; k < arr.length; k++) {
          if (arr[i] === _cache[i].modules[j].name) {
            _cache[i].modules[j].visible = true;
          }
        }
      }
    }
  };

  LaunchBar.addExtension = function (title, ext) {
    for (var i in _cache) {
      var bar = _cache[i];

      for (var j = 0; j < bar.modules.length; j++) {
        if (bar.modules[j].title === title) {
          ext.scope = $rootScope.$new();
          ext.controller = $controller(ext.controller, $.extend({ $scope: ext.scope }));
          bar.modules[j].extensions.push(ext);
          update();

          return;
        }
      }
    }
  }

  return LaunchBar;
}

module.factory( 'LaunchBar', Module);

/* -------------------------------------------------------------------------- */
})();
