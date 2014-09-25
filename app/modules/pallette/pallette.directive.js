
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

var module = angular.module( 'directive.pallette', [
  'service.pallette'
]);

/* ----------------------------------------------------------------------------- */

module.directive('pallette', function (Pallette) {
  return {
    restrict: 'A',
    replace: true,
    scope: {},
    templateUrl: '/modules/pallette/pallette.tpl.html',
    link: function postLink(scope, element, attrs) {
      scope.pallette = new Pallette(attrs.pallette);

      function closePallette () {
        scope.pallette.close();
        $('div:not(.pallette, .pallette *)').not('[ui-view="main"]').off('click.pallette');
        $(window).off('keydown.pallette');
      }

      scope.$watch('pallette.active', function () {
        if (scope.pallette.active === true) {
          element.children('input').focus();

          $('div:not(.pallette, .pallette *)').not('[ui-view="main"]').on('click.pallette', function (e) {
            $('div:not(.pallette, .pallette *)').not('[ui-view="main"]').off('click.pallette');

            closePallette();
          });

          $(window).on('keydown.pallette', function (e) {
            switch (e.which) {
              case 27: //esc
                closePallette();
                break;

              case 40: //down arrow
                scope.pallette.moveIndex(1);
                break;

              case 38: //up arrow
                scope.pallette.moveIndex(-1);
                break;

              case 13: //enter
                var keepOpen = scope.pallette.trigger();
                if (!keepOpen)
                  closePallette();
                break;
            }
          });
        }
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
