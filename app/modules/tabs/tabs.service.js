(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var attributes = [
  'templateUrl',
  'template',
  'controller',
  'title',
  'uid'
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

var SIGNALS = {
  onAdd: new signals.Signal(),
  onRemove: new signals.Signal(),

  onSelected: new signals.Signal(),
  onDeselected: new signals.Signal()
};

/* -------------------------------------------------------------------------- */

var module = angular.module( 'service.tabs', [
  'service.signals'
]);

function Module ($rootScope, $controller, Signals) {

  function decorateTab (tab, picked) {
    tab.guid = guid();

    tab.scope = $rootScope.$new();
    tab.hasChanges = false;
    tab.scope.guid = tab.guid;
    tab.controller_name = tab.controller;
    tab.controller = $controller( tab.controller, $.extend({ $scope: tab.scope, $tab: tab }, picked.diff) );

    tab.setHasChanges = function (truthy) {
      this.hasChanges = truthy;
      update();
    };

    return tab;
  }

  function update () {
    Signals.viewResize.dispatch();

    if(!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }

  return function (name) {
    if (!name) return SIGNALS;
    if (name === 'active' && _cache.active) return _cache.active;

    var ret = {
      name: name,
      tabs: [],
      selectedIndex: 0,
      signals: {
        onAdd: new signals.Signal(),
        onRemove: new signals.Signal(),

        onSelected: new signals.Signal(),
        onDeselected: new signals.Signal()
      },

      add: function (attrs) {
        if (!attrs) return this;

        var picked = pick(attrs);

        if (this.tabExists(picked.obj.uid)) return this.select(picked.obj.uid);

        this.tabs.push(picked.obj);

        if (this.tabs[this.selectedIndex]) {
          this.signals.onDeselected.dispatch(this.tabs[this.selectedIndex], this.selectedIndex);
          SIGNALS.onDeselected.dispatch(this.tabs[this.selectedIndex], this.selectedIndex);
        }

        this.selectedIndex = this.tabs.length - 1;

        var tab = this.tabs[this.selectedIndex];
        decorateTab(tab, picked);

        this.signals.onAdd.dispatch(tab, this.selectedIndex);
        this.signals.onSelected.dispatch(this.tabs[this.selectedIndex], this.selectedIndex);

        SIGNALS.onAdd.dispatch(tab, this.selectedIndex);
        SIGNALS.onSelected.dispatch(this.tabs[this.selectedIndex], this.selectedIndex);

        update();

        return this;
      },

      tabExists: function (index) {
        if ( angular.isNumber(index) && this.tabs[index] ) return true;

        for (var i = 0; i < this.tabs.length; i++) {
          if (this.tabs[i].uid === index) return true;
        }

        return false;
      },

      remove: function (index) {
        if (this.selectedIndex === index) {
          this.signals.onDeselected.dispatch(this.tabs[index], index);
          SIGNALS.onDeselected.dispatch(this.tabs[index], index);

          this.selectedIndex += (this.selectedIndex - 1 >= 0 || this.tabs.length - 1 <= 0) ? -1 : 0;

          if (this.selectedIndex >= 0) {
            this.signals.onSelected.dispatch(this.tabs[this.selectedIndex], this.selectedIndex);
            SIGNALS.onSelected.dispatch(this.tabs[this.selectedIndex], this.selectedIndex);
          }
        } else {
          this.selectedIndex += (this.selectedIndex - 1 >= 0 || this.tabs.length - 1 <= 0) ? -1 : 0;
        }

        var spliced = this.tabs.splice(index, 1);

        this.signals.onRemove.dispatch(spliced, this.selectedIndex - 1);
        SIGNALS.onRemove.dispatch(spliced, this.selectedIndex - 1);

        update();

        return this;
      },

      select: function (index) {
        if (!this.isActive()) {
          this.setToActive();
        }

        var self = this;
        function selectIndex (index) {
          if (index < 0 || index > self.tabs.length - 1) return;
          self.signals.onDeselected.dispatch(self.tabs[self.selectedIndex], self.selectedIndex);
          SIGNALS.onDeselected.dispatch(self.tabs[self.selectedIndex], self.selectedIndex);
          self.selectedIndex = index;
          self.signals.onSelected.dispatch(self.tabs[self.selectedIndex], self.selectedIndex);
          SIGNALS.onSelected.dispatch(self.tabs[self.selectedIndex], self.selectedIndex);
        }

        if (angular.isNumber(index)) {
          selectIndex(index);
        } else {
          for (var i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].uid === index) {
              selectIndex(i);
              break;
            }
          }
        }

        update();

        return this;
      },

      setToActive: function () {
        _cache.active = this;

        return this;
      },

      isActive: function () {
        return this.name === _cache.active.name;
      },

      swap: function (index, other) {
        if (index === other.index && this.name === other.name) return;

        console.log(other, _cache);

        var t = _cache[other.name];

        var buffer = this.tabs[index];
        this.tabs.splice(index, 1);

        other.index += (other.side === 1) ? 1: 0;

        t.tabs.splice(other.index, 0, buffer);
        t.select(other.index);

        update();

        return this;
      }
    };

    ret.signals.onSelected.add(function (tab) {
      if (tab.scope.onSelected) {
        tab.scope.onSelected();
      }
    });

    ret.signals.onDeselected.add(function (tab) {
      if (tab && tab.scope && tab.scope.onDeselected) {
        tab.scope.onDeselected();
      }
    });

    ret.signals.onRemove.add(function (tab) {
      if (tab && tab.scope && tab.scope.onRemove) {
        tab.scope.onRemove();
      }
    });

    if (!_cache[name]) _cache[name] = ret;
    if (!_cache.active) _cache.active = ret;

    return _cache[name];
  };
}

module.factory('Tabs', Module);

/* -------------------------------------------------------------------------- */
})();
