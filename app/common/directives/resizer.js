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

var module = angular.module('directive.resizer', []);

/* ----------------------------------------------------------------------------- */

module.directive('resizer', function($rootScope) {
  return {
    scope: {
      'direction': '=resizer'
    },
    link: function(scope, $el, attrs) {
      scope.$watch('direction', function () {
        var priorCursor = $('body').css('cursor');
        var opt = {min: 10};
        opt.cursor = (scope.direction === 'row') ? 'ew-resize': 'ns-resize';

        $el.css('cursor', opt.cursor).off('mousedown.resize');

        $el.on('dblclick.resize', function () {
          var $drag = $(this);

          var next = $drag.next();
          var prev = $drag.prev();

          next.css('flex', 0.5);
          prev.css('flex', 0.5);
        });

        $el.on('mousedown.resize', function(e) {
          priorCursor = $('body').css('cursor');
          $('body').css('cursor', opt.cursor);

          var $drag = $(this).addClass('draggable');

          var z_idx = $drag.css('z-index'),
              drg_h = $drag.outerHeight(),
              drg_w = $drag.outerWidth(),
              pos_y = $drag.offset().top + drg_h - e.pageY,
              pos_x = $drag.offset().left + drg_w - e.pageX;

          $drag.css('z-index', 1000).parents().on('mousemove.resizer', function(e) {

            var prev = $drag.prev();
            var next = $drag.next();

            // Assume 50/50 split between prev and next then adjust to
            // the next X for prev

            var total, prevPercentage, nextPercentage;

            if (scope.direction === 'row') {
              total = prev.outerWidth() + next.outerWidth();
              prevPercentage = (((e.pageX - prev.offset().left) + (pos_x - drg_w / 2)) / total);
            } else {
              total = prev.outerHeight() + next.outerHeight();
              prevPercentage = (((e.pageY - prev.offset().top) + (pos_y - drg_h / 2)) / total);
            }

            nextPercentage = 1 - prevPercentage;

            if(prevPercentage * 100 < opt.min || nextPercentage * 100 < opt.min)
            {
              return;
            }

            prev.css('flex', prevPercentage.toString());
            next.css('flex', nextPercentage.toString());
          });

          $(document).on('mouseup.resizer', function() {
            $(document).off('mouseup.resizer');
            $drag.parents().off('mousemove.resizer');

            $rootScope.$emit('view.resize');

            $('body').css('cursor', priorCursor);
              $('.draggable').removeClass('draggable').css('z-index', z_idx);
          });

          e.preventDefault(); // disable selection
        });
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
