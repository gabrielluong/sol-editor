
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

var module = angular.module( 'directive.launch_bar', [
  'mgcrea.ngStrap.tooltip',
  'service.launch_bar'
]);

/* ----------------------------------------------------------------------------- */

module.directive('launchbar', function (Tabs) {
  return {
    restrict: 'E',
    scope: {
      modules: '='
    },
    templateUrl: '/modules/launch_bar/launch_bar.tpl.html',
    replace: true,
    link: function postLink(scope, element, attrs) {

    }
  };
});

module.directive('launchBarViewContainer', function (LaunchBar) {
  return {
    restrict: 'A',
    scope: {
      bar: '=launchBarViewContainer'
    },
    templateUrl: '/modules/launch_bar/launch_bar_view_container.tpl.html',
    replace: true,
    link: function postLink(scope, element, attrs) {

    }
  };
});

module.directive('launchbarModuleButton', function ($tooltip) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      var placement = (scope.modules.direction === 'horizontal') ? 'top' : 'right';

      $tooltip(element, {
        title: scope.module.title,
        placement: placement,
        delay: { show: 0, hide: 0 },
        container: 'body'
      });

      scope.toggle = function () {
        // var block = element.parents('block');
        // var blockSize = (scope.modules.direction === 'horizontal') ? block.height() : block.width();

        // if (this.module.active) {
        //   $('layout').layout().sizePane(block.attr('placement'), this.module.size + blockSize);
        // } else {
        //   $('layout').layout().sizePane(block.attr('placement'), blockSize - this.module.size);
        // }
      };
    }
  };
});

module.directive('launchbarModule', function ($http, $templateCache, $compile) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      $http.get( scope.module.templateUrl, { cache: $templateCache } )
      .then( function( response ) {
        element.html( response.data );
        element.children().data('$ngControllerController', scope.module.controller);

        $compile( element.contents() )( scope.module.scope );
      });
    }
  };
});

module.directive('launchbarModuleExtension', function ($http, $templateCache, $compile) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      $http.get( scope.extension.templateUrl, { cache: $templateCache } )
      .then( function( response ) {
        element.html( response.data );
        element.children().data('$ngControllerController', scope.extension.controller);

        $compile( element.contents() )( scope.extension.scope );
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
