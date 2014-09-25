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

var module = angular.module( 'factory.script_events', []);

/* ----------------------------------------------------------------------------- */

module.factory( 'script_events', function () {
  return {
    values: [
      'onload',
      'ondestroy',
      'onupdate'
    ]
  };
});

/* ----------------------------------------------------------------------------- */
})();
