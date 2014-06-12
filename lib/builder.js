var fs = require('fs');
var path = require('path');
var devLoader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var prodShim = fs.readFileSync(__dirname+'/shim.js', 'utf8');
var bldr = require('./index');

var exported = {};

var deps = {};
var appList = [];

var buildEntry = function(inputFile, outputFile, options) {
  require(inputFile);
  if (!options.one && !outputFile) return;

  var output = (options.pre || '') + prodShim;
  if (options.dev) output += devLoader;
  var first = true;

  for (var i=0; i<bldr.appList.length; i++) {
    var info = bldr.appList[i];
    var filename = info[0];
    var segments = JSON.stringify(info[1]);
    var next = bldr.appList[i+1];
    next = JSON.stringify(next && !!next[1]);

    if (exported[filename]) continue;

    if (first && !!info[1]) {
      output += "bldr(null, true);\n";
    }
    first = false;

    var relativeToRoot = path.relative(options.rootDir, filename);
    if (relativeToRoot.slice(0,2) === '..') {
      relativeToRoot = path.relative(options.rootDir, path.join(options.rootDir, filename));
    }
    appList.push(relativeToRoot);

    if (options.dev) {
      if (options.prefix) relativeToRoot = path.join(options.prefix, relativeToRoot);
      output += "loadScript('" + relativeToRoot + "', " + segments + ", " + next + ");\n";
    } else {
      var src = fs.readFileSync(path.join(options.rootDir, relativeToRoot), 'utf8');
      output += '\n// '+relativeToRoot+'\n'+ src + '\nbldr(' + segments + ', ' + next + ');\n';
    }
    exported[filename] = true;
  }
  output += options.post || '';

  if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf8');
    console.log('bldr: ', path.relative(process.cwd(), outputFile));
  } else {
    console.log(output);
  }
};

exports.build = function(entries, options) {
  options.pre = ';(function() {\n'
  options.post = '\n})()\n';
  options.dev = true;
  entries.forEach(function(entry) {
    buildEntry(entry[0], entry[1], options);
    if (entry[1]) deps[path.relative(options.rootDir,entry[1])] = [].concat(bldr.buildList);
  });
};

exports.package = function(entries, options) {
  options.one = entries.length === 1;
  entries.forEach(function(entry) {
    buildEntry(entry[0], entry[1], options);
    deps[path.relative(options.rootDir,entry[1])] = [].concat(bldr.buildList).concat(appList);
  });
};

exports.deps = function(filename) {
  var output = '';
  for (key in deps) {
    output += key + ': ' + deps[key].join(' ') + '\n';
  }
  fs.writeFileSync(filename, output, 'utf8');
};

