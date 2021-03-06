var fs = require('fs');
var path = require('path');
if (!path.isAbsolute) path.isAbsolute = function(path) { return path[0] === '/'; };
var devLoader = fs.readFileSync(__dirname+'/loader.js', 'utf8');

var keysToInit = function(segments, g, skipLast) {
  var root = g;
  var notDefined = false;
  return segments.map(function(k, i) {
    if (skipLast && i === segments.length - 1) return false;

    if (notDefined || !root[k]) {
      notDefined = true;
      return segments.slice(0, i+1).join('.');
    } else {
      root = root[k];
      return false;
    }
  });
};

var loaderFn = function(relativeToRoot, info, data, options) {
  var src, stat, initKeys;
  var variableName = path.basename(relativeToRoot, path.extname(relativeToRoot));

  return function() {
    var fullPath = path.join(options.rootDir, relativeToRoot);
    try {
      var newStat = fs.statSync(fullPath).mtime;
      if (newStat === stat) return src;
      stat = newStat;
    } catch (e) {
      if (e.code === 'ENOENT') throw new Error('No file found for: '+fullPath);
      throw e;
    }

    src = fs.readFileSync(fullPath, 'utf8');

    if (info.external) return src;

    if (data.buildList[fullPath]) {
      src = src.replace(/^.*loadstar.*$\n/gm,'');
    }

    if (info.transform) {
      if (!data.transforms[info.transform]) throw new Error('Transform: '+info.transform+' requested but not defined');
      src = data.transforms[info.transform](src, info);
    }

    if (info.browser) return src;

    if (info.segments) {
      if (src.match(/module\.exports/)) {
        if (!initKeys) initKeys = keysToInit(info.segments, data.defined, true);
        src = src.replace(/module\.exports/, info.segments.join('.'));
      } else {
        if (!initKeys) initKeys = keysToInit(info.segments, data.defined);
        src = src.replace(/exports/g, info.segments.join('.'));
      }
      src = initKeys.map(function(k) {
        if (!k) return '';
        return (options.amd && !k.match(/\./) ? 'var ' : '') + k + ' = {};\n';
      }).join('') + src;
      var root = data.defined;
      info.segments.forEach(function(k) {
        if (!root[k]) root[k] = {};
        root = root[k];
      });
    } else {
      if (src.match(/module\.exports/)) {
        src = src.replace(/module\.exports/, 'var ' + variableName);
      } else if (src.match(/exports/)) {
        src.replace(/exports/g, variableName);
        src = 'var ' + variableName + ' = {};\n' + src;
      }
    }

    return src;
  };
}

/*
 *
 * Return a path that is relative to the rootDir. If the filename
 * Eg:
 *   resolvePath('/src/filename.txt', '/src') -> 'filename.txt'
 *   resolvePath('/node_modules/blah', '/src') -> 'node_modules/blah'
 */
var resolvePath = exports.resolvePath = function(filename, rootDir) {
  var relativeToRoot = path.relative(rootDir, filename);
  if (relativeToRoot.slice(0,2) === '..') {
    relativeToRoot = path.relative(rootDir, path.join(rootDir, filename));
  }
  return relativeToRoot;
};

var buildEntry = function(data, options) {
  var output = (options.pre || '');
  var filename, info, relativeToRoot, loader, src;

  if (options.dev) output += devLoader;

  for (filename in data.appList) {
    info = data.appList[filename];

    if (typeof info.dev !== 'undefined' && (info.dev !== options.dev)) continue;
    if (data.exported[filename] && !options.dev) continue;
    // Unfulfilled external dependency, continue
    if (info.external) {
      relativeToRoot = data.externalList[filename].file;
      // No file given for this dependency, skip it.
      if (!relativeToRoot) continue;
      if (!path.isAbsolute(relativeToRoot)) {
        // Resolve path relative to package dir
        relativeToRoot = path.join('node_modules', filename.split('/')[0], relativeToRoot);
      }
      relativeToRoot = resolvePath(relativeToRoot, options.rootDir);
    } else {
      relativeToRoot = resolvePath(filename, options.rootDir);
    }

    loader = loaderFn(relativeToRoot, info, data, options);
    src = loader();

    if (options.dev) {
      data.sources['/'+relativeToRoot] = loader;
      if (options.prefix) relativeToRoot = path.join(options.prefix, relativeToRoot);
      output += "loadScript('" + relativeToRoot + "');\n";
    } else {
      output += '\n// '+relativeToRoot+'\n'+ src;
    }
    data.exported[filename] = true;
  }
  output += options.post || '';

  return output;
};

var amd = function(options) {
  options.pre = '(function(root,factory) { ' +
    'if (typeof define === "function" && define.amd) { ' +
    '  define([], factory); ' +
    '} else { root.' + options.amd + ' = factory(); ' +
    '}})(this, function() {\n';

  options.post = '\n'+'return '+options.amd+';\n});\n'
}

exports.make = function(data, options) {
  options = options || {};
  if (!options.rootDir) options.rootDir = process.cwd();
  if (!options.dev) options.dev = false;
  if (!options.bare) {
    options.pre = ';(function() {\n'
    options.post = '\n})()\n';
  }
  if (options.amd) amd(options);
  return buildEntry(data, options);
};

