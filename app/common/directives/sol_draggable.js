
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

var module = angular.module( 'directive.sol_draggable', []);

/* ----------------------------------------------------------------------------- */

module.directive('solDraggable', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.attr('draggable', 'true');        

      var onDragStart = $parse(attrs.drag);
      var onDragEnd = $parse(attrs.dragEnd);

      element[0].addEventListener('dragstart', function (e) {
        onDragStart(scope, {$event: e, $element: element});
      }, false);

      element[0].addEventListener('dragend', function (e) {
        onDragEnd(scope, {$event: e, $element: element});
      }, false);
    }
  };
});

/* ----------------------------------------------------------------------------- */

module.directive('solDroppable', function ($parse) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {  
      element.attr('draggable', 'true');  

      var onDragEnter = $parse(attrs.dragEnter);
      var onDragOver = $parse(attrs.dragOver);
      var onDragLeave = $parse(attrs.dragLeave);

      element[0].addEventListener('dragenter', function (e) {
        onDragEnter(scope, {$event: e, $element: element});
      }, false);

      element[0].addEventListener('dragover', function (e) {
        onDragOver(scope, {$event: e, $element: element});
      }, false);

      element[0].addEventListener('dragleave', function (e) {
        onDragLeave(scope, {$event: e, $element: element});
      }, false);
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();