var fs = require('fs');
var path = require('path');
if (!path.isAbsolute) path.isAbsolute = function(path) { return path[0] === '/'; };
var minimatch = require('minimatch');
var builder = require('./builder');

var store = {};

var lookupPackageData = function(attrs) {
  var loadstar;
  try {
    var parentRootDir = path.join(__dirname, '../../..');
    loadstar = require(path.join(parentRootDir, 'package')).loadstar;
  } catch (e) {
  }
  if (!loadstar) return;

  if (loadstar.appDir) attrs.appDir = path.resolve(parentRootDir, loadstar.appDir);
  if (loadstar.global) attrs.appGlobal = loadstar.global;
  for (var external in (loadstar.external || {})) {
    attrs.externalList[external] = {required: false, file: loadstar.external[external]};
  }
};

var fetchData = function(key) {
  var attrs = store[key];
  if (!attrs) {
    attrs = store[key] = {
      key: key,
      appDir: null,     // Root of the application source tree
      appGlobal: key,   // Global variable as string for defining the app.
      appList: {},      // List of files that make up the app
      buildList: {},    // List of files used to build up the app
      externalList: {}, // List of external packages required
      exported: {},     // List of files that have already been exported
      sources: {},      // Cache of transformed sources
      global: {},       // Root of defined source
      defined: {},      // Indicating whether we need to define a path or not.
      transforms: {}    // Available source transform functions
    };
    lookupPackageData(attrs);
    attrs.global[key] = {};
  }
  return attrs;
};


var loadstar = function(key, filename, options) {
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
    var segments = [data.appGlobal].concat(relativeToAppDir.split('/'));

    var root = data.global[key];
    segments.slice(1, segments.length - 1).forEach(function(seg) {
      root[seg] = root[seg] || {};
      root = root[seg];
    });
    var last = segments[segments.length - 1];
    root[path.basename(last, path.extname(last))] = mod;

    return segments
  };

  var requireAndAdd = function(requirePath, opts) {
    var mod;

    if (requirePath[0] === '.') {
      var fullPath = path.join(baseDir, requirePath);
      mod = require(fullPath);
      opts.segments = opts.define && extendApp(mod, fullPath);
      addToApp(fullPath, opts);
      return mod;
    } else {
      mod = require(requirePath);
      if (!data.externalList[requirePath]) data.externalList[requirePath] = {};
      data.externalList[requirePath].required = true;
      opts.external = true;
      if (!data.appList[requirePath]) data.appList[requirePath] = opts;
      return mod;
    }
  };

  var addToApp = function(f, opts) {
    ext = opts.ext || '.js';
    var filePath = f.slice(f.length - ext.length) === ext ? f : f+ext;
    if (!data.appList[filePath]) data.appList[filePath] = opts;
  };

  // Split for dir; list dir; filter on glob; return list of matched files.
  var glob = function(requirePath) {
    var dir = path.dirname(requirePath);
    var filter = minimatch.filter(path.basename(requirePath), {matchBase: true});
    return fs.readdirSync(path.join(baseDir, dir)).filter(filter).map(function(p) {
      // Avoid path.join, because we need to keep relative path ('./dir');
      return dir + path.sep + p;
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
      if (typeof opts.define === 'undefined') opts.define = false;
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
      opts.browser = true;
      requirePath = path.isAbsolute(requirePath) ? requirePath : path.join(baseDir, requirePath);
      addToApp(requirePath, opts);
    },

    setTransform: function(key, fn) {
      data.transforms[key] = fn;
    },

    installExpress: function(server, options) {
      options = options || {};
      if (!options.rootDir) options.rootDir = baseDir;
      options.dev = true;
      options.prefix = '/dev';

      var result = builder.make(data, options);

      server.use('/dev/', function(req, res) {
        res.type('application/javascript');
        var loader = data.sources[req.path];
        res.send(loader ? loader() : 404);
      });
      if (options.app) {
        server.get(options.app, function(req, res) {
          res.type('application/javascript');
          res.send(result);
        });
      }
    },

    make: function(options) {
      return builder.make(data, options);
    }
  };

  api[key] = data.global[key];

  return api;
};

loadstar.fetchData = fetchData;
loadstar._store = store;
module.exports = loadstar;

