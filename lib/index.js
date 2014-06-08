var path = require('path');

var appList = [];

// Default rootDir when hosted in project's node_modules directory
var rootDir = path.join(__dirname, '..', '..');

// Root of the application source tree
var appDir;

var bldr = function(filename, options) {
  // Dir we are requiring things from.
  var baseDir = path.dirname(filename);

  options = options || {};
  if (options.rootDir) rootDir = path.resolve(baseDir, options.rootDir);
  if (options.appDir) appDir = path.resolve(baseDir, options.appDir);

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

  // Pushes the fullpath to the appList, based on the rootDir
  var addToApp = function(requirePath, opts, segments) {
    opts.ext = opts.ext || '.js';
    appList.push([path.relative(rootDir, requirePath)+opts.ext, segments]);
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
      addToApp(fullPath, opts, opts.define && extendApp(mod, fullPath));
    },

    browser: function(requirePath, opts) {
      opts = opts || {};
      var fromDir = requirePath[0] === '/' ? rootDir : baseDir;
      addToApp(path.join(fromDir, requirePath), opts, null);
    }
  };

  return api;
};

bldr.appList = appList;
module.exports = bldr;

