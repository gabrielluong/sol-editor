(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var sol = angular.module( 'sol', [
  'templates',
  'sol.scaffold',
  'service.files',
  'sol.packages',
  'ui.router',
  'mgcrea.ngStrap.tooltip',
  'service.settings',
  'service.mousetrap',
  '__packages__'
]);

sol.config( function myAppConfig (
  $stateProvider, $urlRouterProvider, $locationProvider, $tooltipProvider) {

  $urlRouterProvider.otherwise( '/' );

  angular.extend($tooltipProvider.defaults, {
    delay: { show: 0, hide: 0 },
    container: 'body'
  });
});

sol.run( function run ($rootScope, File, Settings, Packages) {
  $rootScope.SOL_DIR = getUserHome() + '/.sol';
  $rootScope.FILE_DIR = process.cwd();

  $rootScope.tooltip = {
    quick_play: {
      title: 'Quick Play'
    },
    upload_screenshot: {
      title: 'Upload Screenshot'
    },
    delete_game: {
      title: 'Delete Game'
    },
    scenes: {
      title: 'Scenes'
    },
    popout: {
      title: 'Popout'
    },
    selected: {
      title: 'Selected'
    },
    library: {
      title: 'Library'
    },
    options: {
      title: 'Options'
    },
    hierarchy: {
      title: 'Hierarchy'
    }
  };

  Packages.init();
});

sol.controller( 'sol.main', function AppCtrl ( $rootScope, $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle + ' | SOL' ;
    }
  });
});

/* -------------------------------------------------------------------------- */
})();
