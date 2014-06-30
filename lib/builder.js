var fs = require('fs');
var path = require('path');
var devLoader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var prodShim = fs.readFileSync(__dirname+'/shim.js', 'utf8');


defineExports = function(segments, hasExports) {
  if (segments || (segments === false && hasExports)) {
    return '\nexports = {}; module = {exports: exports};\n';
  } else if (segments === null) {
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

  for (var i=0; i<data.appList.length; i++) {
    var info = data.appList[i];
    var filename = info[0];
    var next = data.appList[i+1];
    next = JSON.stringify(next && !!next[1]);

    if (data.exported[filename]) continue;

    var relativeToRoot = path.relative(options.rootDir, filename);
    if (relativeToRoot.slice(0,2) === '..') {
      relativeToRoot = path.relative(options.rootDir, path.join(options.rootDir, filename));
    }
    var src = fs.readFileSync(path.join(options.rootDir, relativeToRoot), 'utf8');

    if (options.dev) {
      if (i===0) {
        output += defineExports(info[1], src.match(/exports/));
      }
      if (options.prefix) relativeToRoot = path.join(options.prefix, relativeToRoot);
      output += "loadScript('" + relativeToRoot + "', " + JSON.stringify(info[1]) + ", " + next + ");\n";
    } else {
      if (data.buildList[path.join(options.rootDir, relativeToRoot)]) {
        src = src.replace(/^.*bldr.*$\n/gm,'');
      }

      output += defineExports(info[1], src.match(/exports/));

      output += '\n// '+relativeToRoot+'\n'+ src;

      if (info[1]) {
        output += '\nbldr(' + JSON.stringify(info[1]) + ');\n';
      }
    }
    data.exported[filename] = true;
  }
  output += options.post || '';

  return output;
};

var amd = function(options) {
  options.pre = ';(function(root,factory) { ' +
    'if (typeof define === "function" && define.amd) { ' +
    '  define([], factory); ' +
    '} else { root.' + options.amd + ' = factory(); ' +
    '}})(this, function() {\n';

  options.post = '\n'+'return '+options.amd+';\n}));'
}

exports.make = function(data, options) {
  if (!options.bare) {
    options.pre = ';(function() {\n'
    options.post = '\n})()\n';
  }
  if (options.amd) amd(options);
  return buildEntry(data, options);
};

