
(function () {
var gui = require('nw.gui');

/*
 // -----------------------------------------------------------------------------
 // -----------------------------------------------------------------------------
 // --
 // -- File Name: app.js
 // --
 // -- Author: Paul Nispel
 // --
 // -----------------------------------------------------------------------------
 // -- Copyright 2014 Skwintz
 // -----------------------------------------------------------------------------
 */

var module = angular.module( 'directive.context_menu', []);

/* ----------------------------------------------------------------------------- */

module.directive('contextMenu', function() {
  return {
    restrict: 'A',
    scope: {
      menu: '=contextMenu'
    },
    link: function(scope, elem, attrs, ngModel) {
      var menu = new gui.Menu();

      for (var i = 0; i < scope.menu.length; i++) {
        var item = new gui.MenuItem(scope.menu[i]);
        menu.append(item);
      }

      elem.mousedown(function (e) {
        e.stopPropagation();

        if (e.which === 3) {
          menu.popup(e.clientX, e.clientY);
        }
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
