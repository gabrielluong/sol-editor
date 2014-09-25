(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var module = angular.module( 'service.state', []);

function Module ($injector) {
  var _this = this;
  this.__states = {};

  this.set = function (name, fn) {
    var prop = func.match(/\[(.*?)\]/)[1];
    var injection = func.replace(/\[(.*?)\]/, '');

    this.__states[name] = function (){
      var ret = null;

      $injector.invoke([injection, function(mod){
        ret = mod[prop](e);
      }]);

      return ret;
    };
  };

  this.check = function (state) {
    return this.__states[name]();
  };
}

module.service('State', Module);

/* -------------------------------------------------------------------------- */
})();
