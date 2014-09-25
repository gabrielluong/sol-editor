(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module( 'service.keybindings', []);

function Module ($injector, $rootScope) {
  var _this = this;

  this.bind = function (name, func) {
    var prop = func.match(/\[(.*?)\]/)[1];
    var injection = func.replace(/\[(.*?)\]/, '');

    Mousetrap.bind(name, function (e) {
      $injector.invoke([injection, function(mod){
        mod[prop](e);
      }]);
    });
  };

  this.sanitize = function (obj) {
    //TODO: implement
    return obj;
  };

  this.addCommands = function (obj) {
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        this.bind(i, obj[i]);
      }
    }
  };

  this.parse = function (json) {
    try {
      var obj = JSON.parse(json);
      var commands = this.sanitize(obj);
      this.addCommands(commands);
    } catch (e) {}
  };
}

module.service('Keybindings', Module);

/* -------------------------------------------------------------------------- */
})();
