
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

var socket = angular.module( 'service.socket', [
  'resource.users'
]);

/* ----------------------------------------------------------------------------- */

socket.factory('Socket', function($q, User) {

  console.log( User.current_user );

  var ret = {
    init: function () {
      var ws = new WebSocket("ws://localhost:3000");

      ws.onopen = function(){  
        console.log("Socket has been opened!");  
      };
      
      ws.onmessage = function(message) {
        console.log(message.data);
      };

      ws.onclose = function( err ) {
        console.log('socket closed :(', err);
      };

      ws.onerror = function( err ) {
        console.log( err );
      };
    }
  };

  return ret;
});

/* ----------------------------------------------------------------------------- */
})();