
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

var directive = angular.module( 'directive.renderer', [
  'service.renderer',
  'service.navigator',
  'service.signals',
  'service.events'
]);

/* ---------------------------------------------------- */

directive.directive('renderer',
  function ($rootScope, Renderer, Signals, $timeout, Events) {
  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      scope.renderer = new Renderer(scope.guid, scope.file_hash);
      scope.renderer.setElement(element);
      scope.renderer.resetInteractive(element);

      $rootScope.$on('view.resize', function () {
        $timeout(function () {
          var width = element.width();
          var height = element.height();

          scope.renderer.size(width, height);
        });
      });

      Signals.viewResize.add(function resize () {
        $timeout(function () {
          var width = element.width();
          var height = element.height();

          scope.renderer.size(width, height);
        });
      });

      scope.onMousedown = function (e) {
        Events.dispatch('renderer.mousedown', e, element);

        scope.renderer.events.mousedown(e, element);
      };

      scope.onKeydown = function (e) {
        scope.renderer.events.__keydown(e, element);
      };

      scope.onKeyup = function (e) {
        scope.renderer.events.__keyup(e, element);
      };

      scope.onMouseup = function (e) {
        scope.renderer.events.mouseup(e, element);
      };

      scope.onMousemove = function (e) {
        scope.renderer.events.mousemove(e, element);
      };

      scope.onDblclick = function (e) {
        scope.renderer.events.dblclick(e, element);
      };

      element.append(scope.renderer.__renderer.domElement);
    }
  };
});

/* ---------------------------------------------------- */

directive.directive('navigator', function( Navigator ) {
  return {
    restrict: 'EA',
    link: function(scope, element, attrs) {
      scope.navigator = new Navigator(scope, element);

      element.on('mousemove.navigator', function ( e ) {
        e.stopPropagation();
        scope.navigator.project( e.pageX - $(this).offset().left, e.pageY - $(this).offset().top );
      });

      element.on('click.navigator', function ( e ) {
        e.stopPropagation();
        e.preventDefault();
        scope.navigator.project( e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true );
      });

      element.append(scope.navigator.__renderer.domElement);
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
