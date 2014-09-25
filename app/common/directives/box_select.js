
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

var module = angular.module( 'directive.box_select', []);

/* ----------------------------------------------------------------------------- */

module.directive('boxSelect', function($parse) {
  return {
    restrict: 'A',
    replace: false,
    link: function(scope, element, attrs) {
      var overlay = $('<div class="boxselect-overlay"></div>');
      overlay.css({
        border: '1px solid #004F6B',
        background: '#17ade2',
        position: 'absolute',
        opacity: 0.3
      });

      var start = {};
      var end = {};
      var ondrop = $parse(attrs.boxSelectDrop);

      element.mousedown(function (e) {
        if (scope.boxSelectActive === false) return;

        start = {
          x: e.pageX,
          y: e.pageY
        };

        $('body').append(overlay);
        overlay.css({
          top: start.y,
          left: start.x,
          height: 1,
          width: 1
        });

        $(window).on('mousemove.boxSelect', function (e) {
          end = {
            x: e.pageX,
            y: e.pageY
          };

          var top = start.y,
              left = start.x,
              height = end.y - start.y,
              width = end.x - start.x;

          if (end.x - start.x < 0) {
            left = end.x;
            width = start.x - end.x;
          }

          if (end.y - start.y < 0) {
            top = end.y;
            height = start.y - end.y;
          }

          overlay.css({
            top: top,
            left: left,
            height: height,
            width: width
          });
        });
      });

      $(window).on('mouseup.boxSelect', function (e) {
        ondrop(scope, {start: start, end: end, $element: element});
        overlay.remove();
        $(window).off('mousemove.boxSelect');
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
