
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
 // -- Copyright 2014 Skwintz
 // -----------------------------------------------------------------------------
 */

var module = angular.module( 'directive.state_display', []);

/* ----------------------------------------------------------------------------- */

module.directive('stateDisplay', function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: '/file_handlers/renderer/directives/state_display/state_display.tpl.html',
    link: function(scope, element, attrs) {

    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
