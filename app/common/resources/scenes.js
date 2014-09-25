
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

var scenes = angular.module( 'resource.scenes', [
  'ngResource'
]);

/* ----------------------------------------------------------------------------- */

scenes.factory('Scene', function($q, $resource) {
  var resource = $resource('/api/games/:game_id/scenes/:id/:action', {id: '@sid'},
    {
      create: {
        method: 'POST'
      },
      update: {
        method: 'PUT',
        params: {id: '@sid'}
      },
      file: {
        method: 'POST',
        params: {
          action: 'file'
        }
      }
    });

  resource.prototype.saveFile = function ( attr ) {
    $http.post('/api/games/' + attr.game_id + '/scenes/' + attr.id + '/file', {file: attr.file});
  };

  return resource;
});

/* ----------------------------------------------------------------------------- */
})();