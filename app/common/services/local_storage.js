(function() {
/* Start angularLocalStorage */
'use strict';

function assign_by_string(obj, prop, value) {
  if (typeof prop === "string") {
    prop = prop.split(".");
  }

  if (prop.length > 1) {
    var e = prop.shift();
    assign_by_string(obj[e] = Object.prototype.toString.call(obj[e]) === "[object Object]" ? obj[e] : {}, prop, value);
  } else {
    switch ( value ) {
      case 'false': 
        obj[prop[0]] = false;
        break;
      case 'true': 
        obj[prop[0]] = true;
        break;
      default: 
        obj[prop[0]] = value;
        break;
    }
  }
}

var angularLocalStorage = angular.module('service.local_storage', []);

angularLocalStorage.provider('local_storage', function(){
  // You should set a prefix to avoid overwriting any local storage variables from the rest of your app
  // e.g. localStorageServiceProvider.setPrefix('youAppName');
  // With provider you can use config as this:
  // myApp.config(function (localStorageServiceProvider) {
  //    localStorageServiceProvider.prefix = 'yourAppName';
  // });

  this.prefix = 'ls';

  // Setter for the prefix
  this.setPrefix = function(prefix){
    this.prefix = prefix;
  };

  this.watchedKeys = [];
  this.scopeObjects = [];

  var _this = this;

  this.$get = ['$rootScope', '$window', '$document', function($rootScope, $window, $document){

    var prefix = this.prefix;

    // If there is a prefix set in the config lets use that with an appended period for readability
    if (prefix.substr(-1) !== '.') {
      prefix = !!prefix ? prefix + '.' : '';
    }

    // Checks the browser to see if local storage is supported
    var browserSupportsLocalStorage = (function () {
      try {
        var supported = ('localStorage' in $window && $window.localStorage !== null);

        // When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
        // is available, but trying to call .setItem throws an exception.
        //
        // "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage
        // that exceeded the quota."
        var key = prefix + '__' + Math.round(Math.random() * 1e7);
        if (supported) {
          localStorage.setItem(key, '');
          localStorage.removeItem(key);
        }

        return true;
      } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
        return false;
      }
    }());

    // Directly adds a value to local storage
    // Example use: localStorageService.add('library','angular');
    var addToLocalStorage = function (key, value) {

      // Let's convert undefined values to null to get the value consistent
      if (typeof value === "undefined") {
        value = null;
      }

      try {
        if (angular.isObject(value) || angular.isArray(value)) {
          value = angular.toJson(value);
        }
        localStorage.setItem(prefix + key, value);
      } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
        return;
      }
      return true;
    };

    // Directly get a value from local storage
    // Example use: localStorageService.get('library'); // returns 'angular'
    var getFromLocalStorage = function (key) {

      if (!browserSupportsLocalStorage) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning','LOCAL_STORAGE_NOT_SUPPORTED');
        return;
      }

      var item = localStorage.getItem(prefix + key);
      // angular.toJson will convert null to 'null', so a proper conversion is needed
      // FIXME not a perfect solution, since a valid 'null' string can't be stored
      if (!item || item === 'null') {
        return null;
      }

      if (item.charAt(0) === "{" || item.charAt(0) === "[") {
        return angular.fromJson(item);
      }

      return item;
    };

    // Remove an item from local storage
    // Example use: localStorageService.remove('library'); // removes the key/value pair of library='angular'
    var removeFromLocalStorage = function (key) {
      if (!browserSupportsLocalStorage) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
        return;
      }

      try {
        localStorage.removeItem(prefix+key);
      } catch (e) {
        $rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
        return;
      }
      return true;
    };

    // Return array of keys for local storage
    // Example use: var keys = localStorageService.keys()
    var getKeysForLocalStorage = function () {

      if (!browserSupportsLocalStorage) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
        return false;
      }

      var prefixLength = prefix.length;
      var keys = [];
      for (var key in localStorage) {
        // Only return keys that are for this app
        if (key.substr(0,prefixLength) === prefix) {
          try {
            keys.push(key.substr(prefixLength));
          } catch (e) {
            $rootScope.$broadcast('LocalStorageModule.notification.error', e.Description);
            return [];
          }
        }
      }
      return keys;
    };

    // Remove all data for this app from local storage
    // Also optionally takes a regular expression string and removes the matching key-value pairs
    // Example use: localStorageService.clearAll();
    // Should be used mostly for development purposes
    var clearAllFromLocalStorage = function (regularExpression) {

      regularExpression = regularExpression || "";
      //accounting for the '.' in the prefix when creating a regex
      var tempPrefix = prefix.slice(0, -1) + ".";
      var testRegex = new RegExp(tempPrefix + regularExpression);

      if (!browserSupportsLocalStorage) {
        $rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
        return;
      }

      var prefixLength = prefix.length;

      for (var key in localStorage) {
        // Only remove items that are for this app and match the regular expression
        if (testRegex.test(key)) {
          try {
            removeFromLocalStorage(key.substr(prefixLength));
          } catch (e) {
            $rootScope.$broadcast('LocalStorageModule.notification.error',e.message);
            return;
          }
        }
      }
      return true;
    };

    var updateLocalStorageScope = function ( e ) {
      var index = _this.watchedKeys.indexOf( e.key );
      if ( index === -1 ) {
        return;
      }

      var scopeObject = _this.scopeObjects[ index ];
      var _scope = scopeObject.scope;
      var name = scopeObject.name;

      assign_by_string( _scope, name, e.newValue );

      if(!_scope.$$phase) {
        _scope.$apply();
      }
    };

    window.addEventListener("storage", updateLocalStorageScope, true);

    var bindScopeVariableToLocalStorage = function ( scope, name ) {
      if ( _this.watchedKeys.indexOf( prefix + name ) !== -1 ) {
        return;
      }

      _this.scopeObjects.push({scope: scope, name: name});
      _this.watchedKeys.push( prefix + name );

      var val = getFromLocalStorage( name );

      if ( val !== null ) {
        assign_by_string( scope, name, val );

        if(!scope.$$phase) {
          scope.$apply();
        }
      } else {
        addToLocalStorage( name, scope[name] );
      }

      scope.$watch(name, function (newVal, oldVal) {
        addToLocalStorage( name, newVal );
      });
    };

    return {
      isSupported: browserSupportsLocalStorage,
      set: addToLocalStorage,
      add: addToLocalStorage, //DEPRECATED
      get: getFromLocalStorage,
      keys: getKeysForLocalStorage,
      bind: bindScopeVariableToLocalStorage,
      remove: removeFromLocalStorage,
      clearAll: clearAllFromLocalStorage,
    };
  }];
});
}).call(this);