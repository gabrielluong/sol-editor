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

var module = angular.module('directive.round_number', []);

/* ----------------------------------------------------------------------------- */

module.directive('roundNumber', function ($filter) {
  return {
    terminal: true,
    restrict: 'A',
    require: '?ngModel',
    scope: {
      places: '=roundNumber'
    },
    link: function (scope, element, attrs, ngModel) {
      if (!ngModel) return;

      var round = function (number) {
        if (number) {
          return $filter('number')(number, 0);
        }
      };

      // Listen for change events to enable binding
      element.bind('blur', function () {
        element.val(round(ngModel.$modelValue));
      });

      // push a formatter so the model knows how to render
      ngModel.$formatters.push(function (value) {
        if (value) {
          return round(value);
        }
      });

      // push a parser to remove any special rendering and make sure the inputted number is rounded
      ngModel.$parsers.push(function (value) {
        if (value) {
          return round(parseFloat(value));
        }
      });
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
