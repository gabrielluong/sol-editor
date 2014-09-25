(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var path = require('path');

/* -------------------------------------------------------------------------- */

var module = angular.module('sol.launch_bar.library', [
  'service.renderer',
  'sol.launch_bar.library_service'
]);

module.controller('sol.launch_bar.library',
    function ($scope, Renderer, Library, $timeout) {
  $scope.library = Library;

  // TODO: fix this ASAP!!! so ugry
  Library._$scope = $scope;

  $scope.renderer = {};

  $scope.$watch('guid', function () {
    $timeout(function () {
      $scope.renderer = Renderer.get($scope.guid);
    });
  });

  $scope.visible = true;

  $scope.open = function (object) {
    if (!object.build) {
      object.open = !object.open;
    } else {
      object.build();
    }
  };

  $scope.getObjects = function () {
    return $scope.library.items;
  };
});

/* ----------------------------------------------------------------------------- */
})();
