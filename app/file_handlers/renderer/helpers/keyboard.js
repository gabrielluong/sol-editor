
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

var module = angular.module( 'renderer.keyboard', [
  'service.signals'
]);

/* ---------------------------------------------------- */

module.factory('Keyboard', function($rootScope, Signals) {
  function update() {
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  }

  var map = [];
  map[8] = 'backspace';
  map[9] = 'tab';
  map[13] = 'enter';
  map[16] = 'shift';
  map[17] = 'ctrl';
  map[18] = 'alt';
  map[20] = 'caps_lock';
  map[27] = 'escape';
  map[33] = 'page_up';
  map[34] = 'page_down';
  map[35] = 'end';
  map[36] = 'home';
  map[37] = 'left_arrow';
  map[38] = 'up_arrow';
  map[39] = 'right_arrow';
  map[40] = 'down_arrow';
  map[45] = 'insert';
  map[46] = 'delete';
  map[48] = '0';
  map[49] = '1';
  map[50] = '2';
  map[51] = '3';
  map[52] = '4';
  map[53] = '5';
  map[54] = '6';
  map[55] = '7';
  map[56] = '8';
  map[57] = '9';
  map[65] = 'a';
  map[66] = 'b';
  map[67] = 'c';
  map[68] = 'd';
  map[69] = 'e';
  map[70] = 'f';
  map[71] = 'g';
  map[72] = 'h';
  map[73] = 'i';
  map[74] = 'j';
  map[75] = 'k';
  map[76] = 'l';
  map[77] = 'm';
  map[78] = 'n';
  map[79] = 'o';
  map[80] = 'p';
  map[81] = 'q';
  map[82] = 'r';
  map[83] = 's';
  map[84] = 't';
  map[85] = 'u';
  map[86] = 'v';
  map[87] = 'w';
  map[88] = 'x';
  map[89] = 'y';
  map[90] = 'z';
  map[91] = 'command';

  function Keyboard () {
    this.keys = {
      a: false,
      b: false,
      c: false,
      d: false,
      e: false,
      f: false,
      g: false,
      h: false,
      i: false,
      j: false,
      k: false,
      l: false,
      m: false,
      n: false,
      o: false,
      p: false,
      q: false,
      r: false,
      s: false,
      t: false,
      u: false,
      v: false,
      w: false,
      x: false,
      y: false,
      z: false,
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
      7: false,
      8: false,
      9: false,
      0: false,
      shift: false,
      control: false,
      command: false,
      option: false,
    };

    this.__key_callbacks = {
      a: [],
      b: [],
      c: [],
      d: [],
      e: [],
      f: [],
      g: [],
      h: [],
      i: [],
      j: [],
      k: [],
      l: [],
      m: [],
      n: [],
      o: [],
      p: [],
      q: [],
      r: [],
      s: [],
      t: [],
      u: [],
      v: [],
      w: [],
      x: [],
      y: [],
      z: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: [],
      0: [],
      shift: [],
      control: [],
      command: [],
      option: [],
    };

    //TODO: remove?
    // this.onKey = function (key, fn) {
    //   var splits = key.split('.');
    //   var key = splits.splice(0, 1);
    //   var title = splits.join('.');

    //   this.__key_callbacks[key].push({
    //     title: title,
    //     fn: fn
    //   });
    // };

    // this.offkey = function (key) {
    //   var splits = key.split('.');
    //   var key = splits.splice(0, 1);
    //   var title = splits.join('.');

    //   var callbacks = this.__key_callbacks[key];

    //   for (var i = 0; i < callbacks.length; i++) {
    //     if (callbacks[i].title === title) {
    //       callbacks.splice(i, 1);
    //     }
    //   }
    // };

    $(window).keydown((function (e) {
      if (this.element.is(':visible') &&
          $(e.target).prop('tagName') !== 'INPUT') {
        var key = map[e.keyCode];
        if (this.keys[key] !== undefined) {
          this.keys[key] = true;

          this.handleKeypress(key);
        }
      }
    }).bind(this));

    $(window).keyup((function (e) {
      if (this.element.is(':visible') &&
          $(e.target).prop('tagName') !== 'INPUT') {

        var key = map[e.keyCode];
        if (this.keys[key] !== undefined) {
          this.keys[key] = false;
        }
      }
    }).bind(this));

    this.handleKeypress = function (key) {
      switch(key) {
        case 'g':
          this.setState('translate'); update();
          break;

        case 'r':
          this.setState('rotate'); update();
          break;

        case 's':
          this.setState('scale'); update();
          break;

        case 'x': case 'y': case 'z':
          if (['translate', 'rotate', 'scale'].indexOf(this.state) !== -1) {
            this.setSubstate(key); update();
          }
          break;
      }
    };

  }

  return Keyboard;
});

/* ----------------------------------------------------------------------------- */
})();
