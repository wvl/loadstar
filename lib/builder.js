var fs = require('fs');
var path = require('path');
var devLoader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var prodShim = fs.readFileSync(__dirname+'/shim.js', 'utf8');
var resetExports = '\nexports = {}; module = {exports: exports};\n';
var nullExports = '\nexports = null; module = null\n';
var bldr = require('./index');

var appList = [];

var buildEntry = function(options) {
  var output = (options.pre || '');
  if (bldr.info.usedDefine) output += prodShim;
  //if (bldr.info.usedRequire) output += resetExports;

  if (options.dev) output += devLoader;
  output += "var exports, module\n";

  for (var i=0; i<bldr.appList.length; i++) {
    var info = bldr.appList[i];
    var filename = info[0];
    var next = bldr.appList[i+1];
    next = JSON.stringify(next && !!next[1]);

    if (bldr.exported[filename]) continue;

    var relativeToRoot = path.relative(options.rootDir, filename);
    if (relativeToRoot.slice(0,2) === '..') {
      relativeToRoot = path.relative(options.rootDir, path.join(options.rootDir, filename));
    }
    appList.push(relativeToRoot);

    if (options.dev) {
      if (options.prefix) relativeToRoot = path.join(options.prefix, relativeToRoot);
      output += "loadScript('" + relativeToRoot + "', " + JSON.stringify(info[1]) + ", " + next + ");\n";
    } else {
      var src = fs.readFileSync(path.join(options.rootDir, relativeToRoot), 'utf8');
      if (bldr.buildList[path.join(options.rootDir, relativeToRoot)]) {
        src = src.replace(/.*bldr.*/g,'');
      }

      if (info[1] || (info[1] === false && src.match(/exports/))) {
        output += '\nexports = {}; module = {exports: exports};\n';
      } else if (info[1] === null) {
        output += '\nexports = null; module = null\n';
      }

      output += '\n// '+relativeToRoot+'\n'+ src;

      if (info[1]) {
        output += '\nbldr(' + JSON.stringify(info[1]) + ', ' + next + ');\n';
      }
    }
    bldr.exported[filename] = true;
  }
  output += '\nexports = null; module = null\n';
  output += options.post || '';

  return output;
};

var amd = function(options) {
  options.pre = ';(function(root,factory) { ' +
    'if (typeof define === "function" && define.amd) { ' +
    '  define([], factory); ' +
    '} else { root.' + options.amd + ' = factory(); ' +
    '}})(this, function() {\n';

  options.post = '\n}));'
}

exports.make = function(options) {
  if (!options.bare) {
    options.pre = ';(function() {\n'
    options.post = '\n})()\n';
  }
  if (options.amd) amd(options);
  return buildEntry(options);
};

