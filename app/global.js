var fs = require('fs'),
    path = require('path');

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

function hashCode (s) {
  if (!s) return null; //FIXME: fixme
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};

function flattenNestedArray (root, key) {
  var flattened = [];

  function _flattenNestedArray (root) {
    if (root[key])
      Array.prototype.push.apply(flattened, root[key]);

    for (var i = 0; i < root.length; i++) {
      if (root[i][key])
        _flattenNestedArray(root[i][key]);
    }
  }

  _flattenNestedArray(root[0]);

  return flattened;
}

function getDiff(prev, now) {
  var changes = {};

  for (var prop in now) {
    if (!prev || prev[prop] !== now[prop]) {
      if (angular.isObject(now[prop])) {
        var c = getChanges(prev[prop], now[prop]);

        if (!$.isEmptyObject(c))
          changes[prop] = c;
      } else {
        changes[prop] = now[prop];
      }
    }
  }

  return changes;
}

global.loadDependencies = function (arr) {
  arr.forEach(function (dep) {
    if (!global[dep] && window[dep])
      global[dep] = window[dep]
  });
};

global.loadScript = function (name, path) {
  try {
    var file = fs.readFileSync(path,'utf8');

    var ret = eval(file);

    global[name] = ret;
  } catch(e) {
    console.log(e);
  }
};
