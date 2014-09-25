
(function () {

/*
 // -----------------------------------------------------------------------------
 // -----------------------------------------------------------------------------
 // --
 // -- File Name: app.js
 // --
 // -- Author: Paul Nispel
 // --
 // -----------------------------------------------------------------------------
 // -- History:
 // **
 // -- PMN - 1/18/14 - Baseline
 // --
 // -----------------------------------------------------------------------------
 // -- Copyright 2014 Skwintz
 // -----------------------------------------------------------------------------
 */

var module = angular.module('renderer.changes', []);


/* ---------------------------------------------------- */

module.factory('Changes', function($rootScope) {
  function update () {
    if (!$rootScope.$$phase) $rootScope.$apply();
  }

  function Changes () {
    var _poppedStack = [];
    var _pushedStack = [];

    Mousetrap.bind('command+z', (function () {
      if (this.element.is(':visible')) {
        this.popChange();
      }
    }).bind(this));

    Mousetrap.bind('command+shift+z', (function () {
      if (this.element.is(':visible')) {
        this.pushChange(_poppedStack.pop(), true);
      }
    }).bind(this));

    this.popChange = function () {
      var obj = _pushedStack.pop();

      if (obj) {
        obj.undo.call(this);
        _poppedStack.push(obj);
      }

      console.log('popped', _pushedStack, _poppedStack);
    };

    this.pushChange = function (obj, clearPopped) {
      if (obj) {
        if (clearPopped) {
          obj.redo.call(this);
        } else {
          _poppedStack.length = 0;
        }

        _pushedStack.push(obj);
      }

      console.log('push', _pushedStack, _poppedStack);
    };
  }

  return Changes;
});

/* ----------------------------------------------------------------------------- */
})();
