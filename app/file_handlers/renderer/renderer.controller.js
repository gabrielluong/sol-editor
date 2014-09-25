
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

var module = angular.module( 'sol.file_handler.renderer', [
  'directive.renderer',
  'service.tabs',
  'service.files',
  'directive.context_menu',
  'directive.box_select',
  'directive.state_display',
  'service.renderer',
  'service.navigator',
  'service.launch_bar',
  'service.accessories',
  'service.signals'
]);

/* ----------------------------------------------------------------------------- */

module.controller( 'sol.file_handler.renderer', function RendererController(
    Signals, $rootScope, $scope, $stateParams, Tabs, $tab, $data,
    $file, Renderer, Navigator, LaunchBar, Accessories, $timeout) {

  $scope.file = $file;
  $scope.file_hash = hashCode($file);
  $scope.data = $data;
  $scope.tab = $tab;

  $scope.tabs = new Tabs('main');

  $scope.renderer = new Renderer($scope.guid);
  $scope.nav = new Navigator($scope.guid);

  Signals.sceneChanged.add(function () {
    $scope.tab.setHasChanges(true);
  });

  $scope.$watch('renderer', function () {
    if ($scope.renderer.scene) {
      if ($scope.data) {
        $scope.renderer.loadScene($scope.data);
      }
    }
  });

  $scope.onSelected = function () {
    $scope.renderer.setActive();
    $scope.renderer.play();
  };

  $scope.onDeselected = function () {
    $scope.renderer.pause();
  };

  $scope.getSaveData = function (file) {
    $scope.tab.setHasChanges(false);

    if (!$scope.file && !$scope.data) {
      $scope.file = file;
      $scope.data = '{\n' +
        '"metadata": {\n' +
          '"version": 4.3,\n' +
          '"type": "Object",\n' +
          '"generator": "ObjectExporter"\n' +
        '},\n' +
        '"object": {\n' +
          '"uuid": "8E60D7BD-3F84-4E0B-BDC0-C67CA19C6E39",\n' +
          '"type": "Scene",\n' +
          '"matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]\n' +
        '}\n' +
      '}\n';

      var splits = file.split('/');

      $scope.tab.title = splits[splits.length - 1];

      if (!$scope.tab.scope.$$phase) {
        $scope.tab.scope.$apply();
      }
    } else {
      $scope.data = $scope.renderer.exportJSON();
    }

    return $scope.data;
  };

  $scope.boxSelectDrop = function (el, start, end) {
    $scope.renderer.selectObjectsIn2DCoordinates(el, start, end);
  };

  $scope.boxSelectActive = false;

  $scope.menu = [
    {
      label: 'Play',
      click: function () {
        $scope.renderer.play();
        $scope.nav.play();
      }
    }
  ];
});


/* ----------------------------------------------------------------------------- */
})();
