(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var fs = require('fs'),
    path = require('path');

/* -------------------------------------------------------------------------- */

var module = angular.module( 'sol.packages', [
  'service.pallette',
  'service.files',
  'service.keybindings',
  'service.settings',
  'oc.lazyLoad'
]);

module.service('Packages',
    function ($rootScope, Pallette, File,
              Keybindings, Settings, $ocLazyLoad) {
  /**
   * Loads the packages
   */
  this.init = function () {
    this.ensureFoldersExist();

    var pallette = new Pallette('actions');
    var package_dirs = this.mapDirs($rootScope.SOL_DIR + '/packages');
    var local_dirs = this.mapDirs($rootScope.FILE_DIR + '/packages');
    var dirs = local_dirs.concat(package_dirs);

    // move user to end and default to beginning
    dirs = package_dirs.filter(function (dir) {
      return dir !== 'user' && dir !== 'default';
    });

    dirs.push($rootScope.SOL_DIR + '/packages/user');
    dirs.unshift($rootScope.SOL_DIR + '/packages/default');

    dirs.forEach((function (dir) {
      var config = this.getConfig(dir);

      this.loadFiles(dir, config);
      this.loadModules(dir, config);
      this.initCommands(dir, config);
      this.compileSettings(dir, config);


    }).bind(this));
  };

  /**
   * Gets the package.json and finds configuration options
   */
  this.getConfig = function (dir) {
    var json = {};
    var file = File.readFile(dir, 'config.json');

    if (file)
      json = JSON.parse(file);

    return json;
  };

  /**
   * Loads modules specified in config.json
   */
  this.loadModules = function (dir, config) {
    config.modules = config.modules || {};

    for (var i in config.modules) {
      config.modules[i] = config.modules[i].map(function (file) {
        return File.getFinalPath(dir, file);
      });

      $ocLazyLoad.load({
        name: i,
        cache: false,
        files: config.modules[i]
      });
    }
  };

  /**
   * Loads auxillary files in config.json
   */
  this.loadFiles = function (dir, config) {
    if (config.files) {
      config.files = config.files.map(function (file) {
        return File.getFinalPath(dir, file);
      });

      $ocLazyLoad.load(config.files, {cache: false});
    }
  };

  /**
   * Makes sure that the folders needed for packages exist in ~/.sol
   */
  this.ensureFoldersExist = function () {
    // TODO: fix this to be more robust (a user might delete default on accidnet)
    if(!fs.existsSync($rootScope.SOL_DIR)) {
      fs.mkdirSync($rootScope.SOL_DIR, parseInt('0766',8), function(err){
        if(err){
          // TODO: better error handling is needed herer
          console.log(err);
        }
      });

      copyRecursiveSync(
          $rootScope.FILE_DIR + '/defaults/packages',
          $rootScope.SOL_DIR + '/packages');
    }
  };

  /**
   * Loads the .json config files from each module and passes them to handlers
   */
  this.initCommands = function () {
    var pallette = new Pallette('actions');

    var package_dirs = this.mapDirs($rootScope.SOL_DIR + '/packages');

    package_dirs = package_dirs.filter(function (dir) {
      return dir !== 'user' && dir !== 'default';
    });

    var local_dirs = this.mapDirs($rootScope.FILE_DIR + '/packages');
    var dirs = local_dirs.concat(package_dirs);

    // move user to end and default to beginning
    dirs.push('user');
    dirs.unshift('default');

    dirs.forEach(function (dir, i) {
      var last = (i === dirs.length);

      [
        {name: 'pallette_commands', module: pallette},
        {name: 'keybindings', module: Keybindings},
        {name: 'settings', module: Settings}
      ].forEach(function (obj) {
        var file = File.readFile(
            dir, obj.name + '.json');

        if (file)
          obj.module.parse(file, last);
      });
    });
  };

  /**
   * loads .html files in module into templateCache
   */
  this.compileSettings = function () {
    var dirs = File.getSubDirs($rootScope.SOL_DIR + '/packages');

    dirs.forEach(function (dir) {
      var fullDir = $rootScope.SOL_DIR + '/packages/' + dir;
    });
  };

  this.mapDirs = function (root) {
    return File.getSubDirs(root).map(function (dir) {
      return root + '/' + dir;
    });
  };
});

/* -------------------------------------------------------------------------- */

var packagesModule = global.module = angular.module('__packages__', []);

global.angular = angular;
global.nwDispatcher = nwDispatcher;

// we need to create packages specially to be able to add providers at runtime
// NOTE: can do same thing with "filter" and $filterProvider
packagesModule.config(function ($controllerProvider, $provide, $compileProvider, $injector) {
  packagesModule._controller = packagesModule.controller;
  packagesModule._service = packagesModule.service;
  packagesModule._factory = packagesModule.factory;
  packagesModule._value = packagesModule.value;
  packagesModule._directive = packagesModule.directive;
  packagesModule._run = packagesModule.run;

  packagesModule.controller = function (name, constructor) {
    $controllerProvider.register(name, constructor);
    return this;
  };

  packagesModule.service = function (name, service) {
    $provide.service(name, service);
    return this;
  };

  packagesModule.factory = function (name, factory) {
    $provide.factory(name, factory);
    return this;
  };

  packagesModule.value = function (name, value) {
    $provide.value(name, value);
    return this;
  };

  packagesModule.directive = function (name, factory) {
    $compileProvider.directive(name, factory);
    return this;
  };

  packagesModule.run = function (fn) {
    angular.element(document).ready(function () {
      var injector = angular.element(document.body).injector();
      injector.invoke(fn);
    });

    return this;
  };
});

/* -------------------------------------------------------------------------- */
})();
