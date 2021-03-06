
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

var games = angular.module( 'resource.games', [
  'ngResource'
]);

/* ----------------------------------------------------------------------------- */

games.factory('Game', function($q, $resource) {
  return $resource('/api/games/:id/:action', {id: '@gid', action: ''},
    {
      create: {
        method: "POST"
      },
      update: {
        method: "PUT",
        params: {id: '@gid'}
      },
      get: {
        method: "GET",
        params: {id: ''}
      },
      share: {
        method: 'POST',
        params: {
          action: 'share'
        }
      }
    });
});

/* ----------------------------------------------------------------------------- */
})();