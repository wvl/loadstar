var fs = require('fs');
var path = require('path');
var devLoader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var prodShim = fs.readFileSync(__dirname+'/shim.js', 'utf8');
var bldr = require('./index');

var exported = {};

var buildEntry = function(inputFile, outputFile, options) {
  require(inputFile);
  var output = (options.pre || '') + (options.dev ? devLoader : prodShim);
  //console.log('build: ', bldr.appList);
  bldr.appList.forEach(function(info) {
    var filename = info[0];
    if (exported[filename]) return;

    var relativeToRoot = path.relative(options.rootDir, filename);
    if (relativeToRoot.slice(0,2) === '..') {
      relativeToRoot = path.relative(options.rootDir, path.join(options.rootDir, filename));
    }

    if (options.dev) {
      if (options.prefix) relativeToRoot = path.join(options.prefix, relativeToRoot);
      output += "loadScript('"+relativeToRoot+"', "+JSON.stringify(info[1])+");\n";
    } else {
      var src = fs.readFileSync(path.join(options.rootDir, relativeToRoot), 'utf8');
      output += '\n// '+relativeToRoot+'\n'+ src + '\nbldr(' + JSON.stringify(info[1]) + ');\n';
    }
    exported[filename] = true;
  });
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
  });
};

exports.package = function(entries, options) {
  entries.forEach(function(entry) {
    buildEntry(entry[0], entry[1], options);
  });
};

