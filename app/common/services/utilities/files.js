(function () {
'use strict';
/* ----SKWINTZ--------------------------------------------------------------- */

var path = require('path'),
    watch = require('watch'),
    fs = require('fs'),
    gui = require('nw.gui');

var handlers = [
  {
    extension: 'scene',
    templateUrl: '/file_handlers/renderer/renderer.tpl.html',
    controller: 'sol.file_handler.renderer'
  },
  {
    extension: 'game',
    templateUrl: '/file_handlers/game/game.tpl.html',
    controller: 'sol.file_handler.game'
  }
];

function getHandlerFor (file) {
  var splits = file.split('.');
  var ext = splits[splits.length - 1];

  for (var i = 0; i < handlers.length; i++) {
    if (handlers[i].extension === ext) return handlers[i];
  }
}

/* -------------------------------------------------------------------------- */

var service = angular.module( 'service.files', [
  'service.signals',
  'service.tabs',
  'service.pallette',
  'service.tabcontainer',
  '__packages__'
]);

function File (Signals, Tabs, $q, $rootScope, Pallette, TabContainer) {
  var self = this;
  var tc = TabContainer;

  this.closeMonitors = function () {
    if (self.fileMonitor) {
      self.fileMonitor.removeAllListeners();
    }
  };

  this.update = function () {
    if (!$rootScope.$$phase) {
      $rootScope.$apply();
    }
  };

  this.addHandler = function (handler) {
    handlers.push(handler);
  };

  this.updatePallette = function () {
    var ret = [];
    var pallette = new Pallette('files');

    function _updatePallette (files) {
      var _handleClick = function (file) {
        return function () {
          self.open(file.path);
        };
      };

      for (var i = 0; i < files.length; i++) {
        if (angular.isArray(files[i].files)){
          _updatePallette(files[i].files);
        } else {
          ret.push({
            title: files[i].name,
            description: files[i].path,
            click: _handleClick(files[i])
          });
        }
      }
    }

    _updatePallette(this.files);

    pallette.add('files.file_tree', ret);
  };

  /**
   * Takes a path with . and .. and renders to a final path inside root
   */
  this.getFinalPath = function(root, path) {
    var root_splits = root.split('/');
    var path_splits = path.split('/');

    path_splits = path_splits.filter(function (split) {
      if (split === '.') {
        if (split === '..')
          root_splits.pop();

        return false;
      }

      return true;
    });

    return root_splits.concat(path_splits).join('/');
  };

  /**
   * Gets all directories under "root"
   *
   * @method    getSubDirs
   * @public
   *
   * @param {String} root root element to search under

   * @return {Array} file objects array containing only directories
   */
  this.getSubDirs = function (root) {
    return fs.readdirSync(root).filter(function (file) {
      return fs.statSync(root + '/' + file).isDirectory();
    });
  };

  /**
   * Gets all files under "root"
   *
   * @method    getFilesFromDir
   * @public
   *
   * @param {String} root root element to search under

   * @return {Array} file objects array containing only files
   */
  this.getFilesFromDir = function (root) {
    return fs.readdirSync(root).filter(function (file) {
      return fs.statSync(root + '/' + file).isFile();
    });
  };

  /**
   * Reads a file
   *
   * @method    readFile
   * @public
   *
   * @param {String} path directory where file lives
   * @param {String} filename actual name of the file
   * @param {Boolean} createIfNotExists optional
   *
   * @return {Object} returns the file object if it exists
   */
  this.readFile = function (path, filename, createIfNotExists) {
    var fullPath = path + '/' + filename;

    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    } else if (createIfNotExists) {
      fs.writeFile(fullPath, '');
    }

    return null;
  };

  /**
   * returns file tree beneath dir
   *
   * @method    getFileTree
   * @public
   *
   * @param {String} dir root directory
   */
  this.getFileTree = function (dir) {
    var d = $q.defer();

    var splits = dir.split('/');
    var started = 0;

    var _files = [{
      name: splits[splits.length - 1],
      path: dir,
      directory: dir,
      isDirectory: true,
      files: []
    }];

    function _getFileTree(root, dir) {
      var deferred = $q.defer();
      var rootIndex = 0;

      started++;

      fs.readdir(dir, function (err, files) {
        var resolveDeferred = function () {
          deferred.resolve();
        };

        for (var i = 0; i < files.length; i++) {
          if (files[i].charAt(0) === '.') {
            continue;
          }

          rootIndex++;

          root.push({
            name: files[i],
            path: dir + '/' + files[i],
            directory: dir,
            isDirectory: fs.statSync(dir + '/' + files[i]).isDirectory()
          });

          if (files[i].isDirectory){
            root[rootIndex].files = _getFileTree(root[rootIndex], dir + '/' + files[i].name)
              .then(resolveDeferred);
          }
        }

        started--;

        if (started === 0) {
          deferred.resolve();
        }
      });

      return deferred.promise;
    }

    _getFileTree(_files[0].files, dir).then(function () {
      d.resolve(_files);
    });

    return d.promise;
  };

  /**
   * loads file tree beneath dir
   *
   * @method    getFileTree
   * @public
   *
   * @param {String} dir root directory
   */
  this.loadFileTree = function (dir) {
    var _this = this;

    this.getFileTree(dir).then(function (files) {
      _this.dir = dir;
      _this.files = files;
      _this.monitorTree();
      _this.updatePallette();
      _this.update();
    });
  };

  /* ---------------------------------------------------- */

  this.open = function (file) {
    if (file) return _open(file);

    var elem = $('<input type="file"/>');

    elem.change(function(evt) {
      var name = $(this).val();

      _open(name);
    });

    elem.trigger('click');

    function _open (file) {
      fs.readFile(file, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }

        var active = new Tabs('active');
        var split = file.split('/');
        var title = split[split.length - 1];

        var handler = getHandlerFor(file);

        if (!handler) return;

        Signals.openFile.dispatch(file, data);

        active.add({
          uid: file,
          title: title,
          templateUrl: handler.templateUrl,
          controller: handler.controller,
          data: data,
          file: file
        });
      });
    }
  };

  /* ---------------------------------------------------- */

  this.removeFile = function (files, name) {
    for (var i = 0; i < files.length; i++) {
      if (files[i].path === name) {
        files.splice(i, 1);
        this.update();
        return;
      }
      if (files[i].files) this.removeFile(files[i].files, name);
    }
  };

  /* ---------------------------------------------------- */

  this.insertIntoFiles = function (root, path, name) {
    var checked = false, match = false;
    var files = root.files;

    if (files.length === 0 && root.path === path) {
      files.push({
        name: name,
        path: path + '/' + name,
        isDirectory: fs.statSync(path + '/' + name).isDirectory()
      });
      this.update();
    }

    for (var i = 0, l = files.length; i < l; i++) {
      var splits = files[i].path.split('/');
      splits.splice(splits.length - 1);
      var filePath = splits.join('/');

      if (files[i].files) this.insertIntoFiles(files[i], path, name);
      else if (filePath === path && !checked) match = true;
      else checked = true;

      // this is our directory
      if (match) {
        var index = null;

        if (i === 0 && name < files[i].name) {
          index = 0;
        } else if (files[i+1] && name > files[i].name && name < files[i+1].name) {
          index = i+1;
        } else if (!files[i+1] && name > files[i].name) {
          index = i+1;
        }

        if (index !== null) {
          files.splice(index, 0, {
            name: name,
            path: path + '/' + name,
            isDirectory: fs.statSync(path + '/' + name).isDirectory()
          });

          this.update();
          return;
        }
      }
    }
  };

  /* ---------------------------------------------------- */

  this.monitorTree = function () {
    var self = this;

    this.closeMonitors();

    watch.createMonitor(this.dir, {ignoreDotFiles: true}, function (monitor) {
      self.fileMonitor = monitor;

      monitor.on('created', function (f, stat) {
        var splits = f.split('/');
        var name = splits.splice(splits.length - 1)[0];
        var path = splits.join('/');

        self.insertIntoFiles(self, path, name);
      });
      monitor.on('changed', function (f, curr, prev) {

      });
      monitor.on('removed', function (f, stat) {
        self.removeFile(self.files, f);
      });
    });
  };

  /* ---------------------------------------------------- */

  this.save = function (path, data) {
    if (!path && !data) {
      var active = new Tabs('active');
      var tab = active.tabs[ active.selectedIndex ];

      if (active.tabs.length === 0 || !tab.scope.file) {
        return ret.saveAs();
      } else {
        var _data = tab.scope.getSaveData();

        fs.writeFile(tab.scope.file, _data, function(err) {
          if (err) {
            throw err;
          }
        });
      }
    }
  };

  /* ---------------------------------------------------- */

  this.saveAs = function (data) {
    var elem = $('<input type="file" nwsaveas/>');

    elem.change(function(evt) {
      var name = $(this).val();

      _saveAs(name);
    });

    elem.trigger('click');

    function _saveAs (name) {
      var active = new Tabs('active');
      var split = name.split('/');

      if (active.tabs.length > 0) {
        data = active.tabs[ active.selectedIndex ].scope.getSaveData(name);
      }

      data = data || '';

      fs.writeFile(name, data, function(err) {
        if (active.tabs.length === 0) {
          var handler = getHandlerFor(name);
          if (!handler) return;

          active.add({
            uid: name,
            title: split[split.length - 1],
            templateUrl: handler.templateUrl,
            controller: handler.controller,
            data: data,
            file: name
          });
        } else {
          var tab = active.tabs[active.selectedIndex];
          tab.uid = name;
          tab.file = name;
        }
      });
    }
  };

  /* ---------------------------------------------------- */

  this.files = [];

  //TODO: remove for debug
  this.loadFileTree('../test_data');

  Signals.showFileDialog.add(this.open);
  Signals.save.add(this.save);
}

/* ---------------------------------------------------- */

service.service('File', File);

/* ----------------------------------------------------------------------------- */
})();
