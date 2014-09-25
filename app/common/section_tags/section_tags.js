
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

var module = angular.module( 'directive.section_tags', []);

/* ----------------------------------------------------------------------------- */

module.directive('sectionTags', function($parse) {
  return {
    restrict: 'A',
    scope: {
      tags: '=sectionTags'
    },
    replace: true,
    templateUrl: '/common/section_tags/section_tags.tpl.html',
    link: function(scope, element, attrs) {
      scope.handleKeypress = function ($event) {
        if ($event.keyCode === 13) {
          var firstChar = scope.currentTag.charAt(0);
          if (firstChar !== '.' && firstChar !== '#') {
            scope.currentTag = '.' + scope.currentTag;
          }

          scope.tags = scope.tags || [];
          scope.tags.push(scope.currentTag);
          scope.currentTag = '';
        }
      };

      scope.removeTag = function ($index) {
        scope.tags.splice($index, 1);
      };
    }
  };
});

/* ----------------------------------------------------------------------------- */
})();
