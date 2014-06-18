var path = require('path');
var builder = require('./builder');


var appList, // List of files that make up the app
    buildList, // List of files used to build up the app
    appDir; // Root of the application source tree

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
    var segments = options.global ? [options.global].concat(segments) : segments;

    var root = global;
    segments.slice(0, segments.length - 1).forEach(function(seg) {
      root[seg] = root[seg] || {};
      root = root[seg];
    });
    root[segments[segments.length -1]] = mod;

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
    appList.push([f.slice(f.length - ext.length) === ext ? f : f+ext, segments]);
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
      return requireAndAdd(requirePath, opts);
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
};

reset();

bldr.builder = builder;
bldr.reset = reset;
module.exports = bldr;

