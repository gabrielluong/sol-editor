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

var module = angular.module( 'sol.scaffold', [
  'ui.router',
  'resource.scenes',
  'mgcrea.ngStrap.tooltip',
  'sol.header',
  'sol.file_handler.renderer',
  'service.tabs',
  'service.launch_bar',
  'directive.launch_bar',
  'sol.launch_bar.selected',
  'sol.launch_bar.file_tree',
  'sol.launch_bar.library',
  'directive.tabcontainer',
  'directive.pallette',
  'service.pallette'
]);

/* ----------------------------------------------------------------------------- */

module.config(function config( $stateProvider ) {
  $stateProvider.state( 'scaffold', {
    abstract: true,
    url: '/',
    views: {
      "main": {
        controller: 'sol.scaffold',
        templateUrl: '/modules/scaffold/scaffold.tpl.html'
      }
    },
    data:{ pageTitle: 'Edit' }
  });

  $stateProvider.state( 'scaffold.subs', {
    url: '',
    views: {
      "header@scaffold": {
        controller: 'sol.header',
        templateUrl: '/modules/header/header.tpl.html'
      }
    }
  });
});

/* ----------------------------------------------------------------------------- */

module.controller( 'sol.scaffold', function EditViewController($scope, $rootScope, Tabs, LaunchBar, Pallette) {
  $scope.tabs = new Tabs('main');

  $scope.actions_pallette = new Pallette('actions');
  $scope.files_pallette = new Pallette('files');

  $scope.vertical_launchbar = new LaunchBar('veritcal', 'vertical');
  $scope.horizontal_launchbar = new LaunchBar('horizontal', 'horizontal');

  $scope.vertical_launchbar.add({
    title: 'Files',
    icon: 'fa-file',
    templateUrl: '/modules/launch_bar/file_tree/file_tree.tpl.html',
    controller: 'sol.launch_bar.file_tree',
    size: 200,
    forceVisible: true
  }).add({
    title: 'Selected',
    icon: 'fa-bullseye',
    templateUrl: '/modules/launch_bar/selected/selected.tpl.html',
    controller: 'sol.launch_bar.selected'
  }).add({
    title: 'Library',
    icon: 'fa-book',
    templateUrl: '/modules/launch_bar/library/library.tpl.html',
    controller: 'sol.launch_bar.library',
    size: 200
  });

  $scope.tabs.signals.onSelected.add(function (tab, index) {
    $scope.selectedController = tab.controller_name;
  });
});


/* ----------------------------------------------------------------------------- */
})();
