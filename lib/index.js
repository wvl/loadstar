var path = require('path');

var appList = [];
var buildList = [];

// Root of the application source tree
var appDir;

var bldr = function(filename, options) {
  // Dir we are requiring things from.
  var baseDir = path.dirname(filename);

  options = options || {};
  if (options.appDir) appDir = path.resolve(baseDir, options.appDir);

  buildList.push(filename);

  // Takes module and a fullpath (without extension), and adds it to the app root.
  // extendApp(mod, '/src/app/models/User')
  // eg: app.models.User = mod;
  var extendApp = function(mod, fullPath) {
    if (!appDir) throw new Error('appDir must be defined');
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
      this.require(requirePath, opts);
    },

    require: function(requirePath, opts) {
      opts = opts || {};
      var fullPath = path.join(baseDir, requirePath);
      var mod = require(fullPath);
      var segments = opts.define && extendApp(mod, fullPath);
      addToApp(fullPath, segments, opts.ext);
    },

    browser: function(requirePath, opts) {
      opts = opts || {};
      requirePath = requirePath[0] === '/' ? requirePath : path.join(baseDir, requirePath);
      addToApp(requirePath, null, opts.ext);
    }
  };

  return api;
};

bldr.appList = appList;
bldr.buildList = buildList;
module.exports = bldr;

