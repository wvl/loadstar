var fs = require('fs');
var path = require('path');
var minimatch = require('minimatch');

var store = {};

var lookupPackageData = function(attrs) {
  try {
    var parentRootDir = path.join(__dirname, '../../..');
    var bldr = require(path.join(parentRootDir, 'package')).bldr;
    if (bldr && bldr.appDir) attrs.appDir = path.resolve(parentRootDir, bldr.appDir);
    if (bldr && bldr.global) attrs.appGlobal = bldr.global;
  } catch (e) {
  }
};

var fetchData = function(key) {
  var attrs = store[key];
  if (!attrs) {
    attrs = store[key] = {
      key: key,
      appDir: null,   // Root of the application source tree
      appGlobal: key, // Global variable as string for defining the app.
      appList: {},    // List of files that make up the app
      buildList: {},  // List of files used to build up the app
      exported: {},
      usedDefine: false,
    };
    lookupPackageData(attrs);
  }
  return attrs;
};


var bldr = function(key, filename, options) {
  var data = fetchData(key);

  // Dir we are requiring things from.
  var baseDir = path.dirname(filename);

  options = options || {};
  if (options.appDir) data.appDir = path.resolve(baseDir, options.appDir);
  if (!data.appDir) data.appDir = baseDir;


  data.buildList[filename] = true;

  // Takes module and a fullpath (without extension), and adds it to the app root.
  // extendApp(mod, '/src/app/models/User')
  // eg: app.models.User = mod;
  var extendApp = function(mod, fullPath) {
    var relativeToAppDir = path.relative(data.appDir, fullPath);
    var segments = relativeToAppDir.split('/');
    if (options.global || data.appGlobal) segments = [options.global || data.appGlobal].concat(segments);

    var root = global;
    segments.slice(0, segments.length - 1).forEach(function(seg) {
      root[seg] = root[seg] || {};
      root = root[seg];
    });
    var last = segments[segments.length - 1];
    root[path.basename(last, path.extname(last))] = mod;

    return segments
  };

  var requireAndAdd = function(requirePath, opts) {
    var fullPath = path.join(baseDir, requirePath);
    var mod = require(fullPath);
    opts.segments = opts.define && extendApp(mod, fullPath);
    addToApp(fullPath, opts);
    return mod;
  };

  var addToApp = function(f, opts) {
    ext = opts.ext || '.js';
    var filePath = f.slice(f.length - ext.length) === ext ? f : f+ext;
    if (!data.appList[filePath]) data.appList[filePath] = opts;
  };

  // Split for dir, list dir, filter on glob, return list of matched files.
  var glob = function(requirePath) {
    var dir = path.dirname(requirePath);
    var filter = minimatch.filter(path.basename(requirePath), {matchBase: true});
    return fs.readdirSync(path.join(baseDir, dir)).filter(filter).map(function(p) {
      return path.join(dir, p);
    });
  };

  // Public api.
  var api = {
    // Requires the file on both node and the browser,
    // and extends the global module tree with the result.
    define: function(requirePath, opts) {
      opts = opts || {};
      opts.define = true;
      data.usedDefine = true;
      return this.require(requirePath, opts);
    },

    require: function(requirePath, opts) {
      opts = opts || {};
      if (typeof opts.define === 'undefined') opts.define = false;
      var paths = [requirePath];
      if (requirePath.indexOf('*') === -1) {
        return requireAndAdd(requirePath, opts);
      } else {
        var files = glob(requirePath);
        return files.map(function(p) {
          return requireAndAdd(p, opts);
        });
      };
    },

    browser: function(requirePath, opts) {
      opts = opts || {};
      requirePath = requirePath[0] === '/' ? requirePath : path.join(baseDir, requirePath);
      addToApp(requirePath, opts);
    },
  };

  return api;
};

bldr.store = store;
module.exports = bldr;

