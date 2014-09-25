
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

var drop = null;

var tabbar = angular.module( 'directive.tabbar', [
  'service.tabs',
  'service.signals',
  'templates',
  'directive.sol_draggable',
  'directive.resizer'
]);

/* ----------------------------------------------------------------------------- */

tabbar.directive('tabbar', function (Tabs, Signals) {
  return {
    restrict: 'EA',
    scope: {
      tabs: '=data'
    },
    templateUrl: '/modules/tabs/tabbar.tpl.html',
    replace: true,
    link: function postLink(scope, element, attrs) {
      var i = 0;

      scope.ondragover = function ($event, $element) {
        var parentOffset = $element.offset();

        var relX = $event.pageX - parentOffset.left;

        var tabs = $element.children('.tab');

        var currIndex = 0, currDist = Infinity, closestElm = null;

        if (tabs.length === 0) {
          drop = {
            name: attrs.name,
            index: 0,
            side: 1
          };

          $element.addClass('insert-tab-indicator-left');

          return;
        }

        tabs.each(function (i) {
          var left = ($(this).offset().left - $(this).parent().offset().left) + ($(this).width() / 2);
          var dist = left - relX;
          if (Math.abs(dist) < Math.abs(currDist)) {
            currIndex = i;
            currDist = dist;
            closestElm = $(this);
          }
        });

        $('.tab, .tabbar').removeClass('insert-tab-indicator-left insert-tab-indicator-right');

        drop = {
          name: attrs.name,
          index: currIndex
        };

        if (currDist >= 0) {
          closestElm.addClass('insert-tab-indicator-left');
          drop.side = -1;
        } else {
          closestElm.addClass('insert-tab-indicator-right');
          drop.side = 1;
        }
      };

      scope.ondragstart = function ($event, $element, $index, tabs) {
        tabs.select($index);
      };

      scope.ondragend = function ($event, $element, $index, tabs) {
        $('.tab, .tabbar').removeClass('insert-tab-indicator-left insert-tab-indicator-right');
        tabs.swap($index, drop);

        drop = null;
      };
    }
  };
});

var tabcontainer = angular.module( 'directive.tabcontainer', [
  'service.tabs',
  'service.signals',
  'service.tabcontainer'
]);

/* ----------------------------------------------------------------------------- */

tabcontainer.directive('tabcontainer', function ( $rootScope,
    Tabs, $http, $templateCache, $compile, TabContainer) {
  var bindings = [
    'command+shift+right',
    'command+shift+left',
    'command+shift+up',
    'command+shift+down',
  ];

  return {
    restrict: 'E',
    templateUrl: '/modules/tabs/tabcontainer.tpl.html',
    link: function postLink(scope, element, attrs) {
      scope.tabContainer = TabContainer;

      Mousetrap.bind(bindings, (function (e, combo) {
        switch(combo) {
          case 'command+shift+right':
            scope.tabContainer.remove();
            break;
          case 'command+shift+left':
            scope.tabContainer.splitRight();
            break;
          case 'command+shift+up':
            scope.tabContainer.remove();
            break;
          case 'command+shift+down':
            scope.tabContainer.splitDown();
            break;
        }

        if (!scope.$$phase) {scope.$apply();}

        // must come after scope.$apply()
        $rootScope.$emit('view.resize');
      }).bind(this));

      scope.select = function ($event, child) {
        $event.stopPropagation();

        if (child.children.length > 0) {
          scope.select($event, child.children[0]);
          return;
        }

        scope.tabContainer.select(child);
      };

      scope.randomBackground = function () {
        var color = (Math.random().toString(16) + '000000').slice(2, 8);

        return {'background-color': '#' + color};
      };

      scope.renderTab = function ($index, tab) {
        $http.get( tab.templateUrl, { cache: $templateCache } )
        .then( function( response ) {
          var el = element.children('.tabcontainer[index="' + $index + '"]');

          el.html( response.data );
          el.children().data('$ngControllerController', tab.controller);

          $compile( el.contents() )( tab.scope );
        });
      };
    }
  };
});

/* ----------------------------------------------------------------------------- */

tabcontainer.directive('tabContainerItem', function (Tabs, $http, $templateCache, $compile) {
  return {
    restrict: 'A',
    link: function postLink(scope, element, attrs) {
      $http.get( scope.tab.templateUrl, { cache: $templateCache } )
      .then( function( response ) {
        element.html( response.data );
        element.children().data('$ngControllerController', scope.tab.controller);

        $compile( element.contents() )( scope.tab.scope );
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
