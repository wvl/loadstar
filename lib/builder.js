var fs = require('fs');
var path = require('path');
var devLoader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var prodShim = fs.readFileSync(__dirname+'/shim.js', 'utf8');


defineExports = function(segments, hasExports) {
  if (segments || (segments === false && hasExports)) {
    return '\nexports = {}; module = {exports: exports};\n';
  } else if (segments === undefined) {
    return '\nexports = undefined; module = undefined;\n';
  } else {
    return '';
  }
}

var loaderFn = function(relativeToRoot, info, data, options) {
  var src, stat;

  return function() {
    var fullPath = path.join(options.rootDir, relativeToRoot);
    var newStat = fs.statSync(fullPath).mtime;
    if (newStat === stat) return src;

    src = fs.readFileSync(fullPath, 'utf8');
    if (data.buildList[fullPath]) {
      src = src.replace(/^.*bldr.*$\n/gm,'');
    }
    if (info.transform) {
      if (!data.transforms[info.transform]) throw new Error('Transform: '+info.transform+' requested but not defined');
      src = data.transforms[info.transform](src, info);
    }
    stat = newStat;
    return src;
  };
}
var buildEntry = function(data, options) {
  var output = (options.pre || '');
  var files, filename, info, relativeToRoot, nextInfo, next, loader, src;

  if (!options.dev) {
    output += "var exports, module;\n";
  }
  if (data.usedDefine) output += prodShim;
  if (options.dev) output += devLoader;

  files = Object.keys(data.appList);

  for (var i=0; i<files.length; i++) {
    filename = files[i];
    info = data.appList[filename];

    if (typeof info.dev !== 'undefined' && (info.dev !== options.dev)) continue;
    if (data.exported[filename] && !options.dev) continue;

    var relativeToRoot = path.relative(options.rootDir, filename);
    if (relativeToRoot.slice(0,2) === '..') {
      relativeToRoot = path.relative(options.rootDir, path.join(options.rootDir, filename));
    }

    loader = loaderFn(relativeToRoot, info, data, options);
    src = loader();

    if (options.dev) {
      if (i===0) {
        output += defineExports(info.segments, src.match(/exports/));
      }
      if (options.prefix) {
        data.sources['/'+relativeToRoot] = loader;
        relativeToRoot = path.join(options.prefix, relativeToRoot);
      }
      nextInfo = data.appList[files[i+1]];
      next = JSON.stringify(nextInfo && !!nextInfo.segments);
      output += "loadScript('" + relativeToRoot + "', " + JSON.stringify(info) + ", " + next + ");\n";
    } else {
      output += defineExports(info.segments, src.match(/exports/));

      output += '\n// '+relativeToRoot+'\n'+ src;

      if (info.segments) {
        output += '\nbldr(' + JSON.stringify(info.segments) + ');\n';
      }
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
  if (!options.dev) options.dev = false;
  if (!options.bare) {
    options.pre = ';(function() {\n'
    options.post = '\n})()\n';
  }
  if (options.amd) amd(options);
  return buildEntry(data, options);
};

