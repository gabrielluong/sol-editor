
(function () {

/*
 // -----------------------------------------------------------------------------
 // -----------------------------------------------------------------------------
 // --
 // -- File Name: users.js
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

var games = angular.module( 'resource.users', [
  'ngResource',
  'ngCookies',
  'ui.router'
]);

/* ----------------------------------------------------------------------------- */

games.factory('User', function($cookies, $q, $state, $http) {
  user = $cookies.user;

  var service = {

    login: function( credentials ) {
      return $http.post('/users/signin', credentials);
    },

    logout: function() {
      return $http.get('/users/signout').success(function ( res ) {
        service.currentUser = null;
        $state.transitionTo('auth.subs');
      });
    },

    verify: function( moveTo, unverifiedAllowed ) {
      if (service.isAuthenticated()) {
        if ( $state.current.name !== moveTo ) {
          $state.transitionTo( moveTo );
        }
        return $q.when(service.currentUser);
      } else {
        return $http.get('/users/me').success(function ( res ) {
          service.currentUser = ( res ) ? res : null;

          if ( service.currentUser ) {
            if ( $state.current.name !== moveTo ) {
              $state.transitionTo( moveTo );
            }
          } else if ( !unverifiedAllowed ) {
            $state.transitionTo('auth.subs');
          }

          return service.currentUser;
        }).error(function ( res ) {
          if ( !unverifiedAllowed ) {
            $state.transitionTo('auth.subs');
          }
        });
      }
    },

    register: function( credentials ) {
      return $http.post('/users', credentials).success(function( res ) {
        service.currentUser = res.data;
      });
    },

    send_password_reset: function( email ) {
      return $http.post('/password_reset', {email: email });
    },

    currentUser: ( $cookies.user ? JSON.parse( $cookies.user ) : null ),

    isAuthenticated: function () {
      return !!service.currentUser;
    }

  };

  $cookies.user = null;

  return service;
});

/* ----------------------------------------------------------------------------- */
})();