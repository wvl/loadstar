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

var buildEntry = function(data, options) {
  var output = (options.pre || '');
  if (!options.dev) {
    output += "var exports, module;\n";
  }
  if (data.usedDefine) output += prodShim;
  if (options.dev) output += devLoader;

  var files = Object.keys(data.appList);

  for (var i=0; i<files.length; i++) {
    var filename = files[i];
    var info = data.appList[filename];

    if (typeof info.dev !== 'undefined' && (info.dev !== options.dev)) continue;
    if (data.exported[filename] && !options.dev) continue;

    var relativeToRoot = path.relative(options.rootDir, filename);
    if (relativeToRoot.slice(0,2) === '..') {
      relativeToRoot = path.relative(options.rootDir, path.join(options.rootDir, filename));
    }
    var src = fs.readFileSync(path.join(options.rootDir, relativeToRoot), 'utf8');

    if (options.dev) {
      if (i===0) {
        output += defineExports(info.segments, src.match(/exports/));
      }
      if (options.prefix) relativeToRoot = path.join(options.prefix, relativeToRoot);
      var next = JSON.stringify(data.appList[files[i+1]]);
      output += "loadScript('" + relativeToRoot + "', " + JSON.stringify(info.segments) + ", " + next + ");\n";
    } else {
      if (data.buildList[path.join(options.rootDir, relativeToRoot)]) {
        src = src.replace(/^.*bldr.*$\n/gm,'');
      }
      if (info.transform) {
        if (!data.transforms[info.transform]) throw new Error('Transform: '+info.transform+' requested but not defined');

        src = data.transforms[info.transform](src, info);
      }

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

