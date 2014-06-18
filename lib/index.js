var fs = require('fs');
var path = require('path');
var minimatch = require('minimatch');
var builder = require('./builder');


var appList, // List of files that make up the app
    buildList, // List of files used to build up the app
    appDir, // Root of the application source tree
    appGlobal; // Global variable as string for defining the app.

var bldr = function(filename, options) {
  // Dir we are requiring things from.
  var baseDir = path.dirname(filename);

  options = options || {};
  if (options.appDir) appDir = path.resolve(baseDir, options.appDir);
  if (!appDir) appDir = baseDir;


  buildList.push(filename);

  // Takes module and a fullpath (without extension), and adds it to the app root.
  // extendApp(mod, '/src/app/models/User')
  // eg: app.models.User = mod;
  var extendApp = function(mod, fullPath) {
    var relativeToAppDir = path.relative(appDir, fullPath);
    var segments = relativeToAppDir.split('/');
    if (options.global || appGlobal) segments = [options.global || appGlobal].concat(segments);

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
    var segments = opts.define && extendApp(mod, fullPath);
    addToApp(fullPath, segments, opts.ext);
    return mod;
  };

  var addToApp = function(f, segments, ext) {
    ext = ext || '.js';
    var filePath = f.slice(f.length - ext.length) === ext ? f : f+ext;
    var exists = false;
    for (var i=0; i<appList.length; i++) {
      if (appList[i][0] === filePath) exists = true;
    }
    if (!exists) appList.push([filePath, segments]);
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
      return this.require(requirePath, opts);
    },

    require: function(requirePath, opts) {
      opts = opts || {};
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
      addToApp(requirePath, null, opts.ext);
    }
  };

  return api;
};

var reset = function() {
  appList = bldr.appList = [];
  buildList = bldr.buildList = [];
  appDir = null;
  appGlobal = null;
  try {
    var parentRootDir = path.join(__dirname, '../../..');
    var package = require(path.join(parentRootDir, 'package'));
    if (package && package.bldr) {
      appDir = path.resolve(parentRootDir, package.bldr.appDir);
      appGlobal = package.bldr.global;
    }
  } catch (e) {
  }
};

reset();

bldr.builder = builder;
bldr.reset = reset;
module.exports = bldr;

