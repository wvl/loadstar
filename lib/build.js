var fs = require('fs');
var path = require('path');
var loader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var bldr = require('./index');

var exported = {};

var buildEntry = function(inputFile, outputFile, options) {
  require(inputFile);
  var output = ';(function() {\n'+loader;
  var src;
  bldr.appList.forEach(function(info) {
    var filename = info[0];
    if (exported[filename]) return;

    src = path.join(options.prefix, filename);
    var segments = JSON.stringify(info[1]);
    output += "loadScript('"+src+"', "+segments+");\n";
    exported[filename] = true;
  });
  output += "\n})()\n";
  if (outputFile) {
    fs.writeFileSync(outputFile, output, 'utf8');
    console.log('bldr: ', path.relative(process.cwd(), outputFile));
  } else {
    console.log(output);
  }
};

module.exports = function(entries, options) {
  entries.forEach(function(entry) {
    buildEntry(entry[0], entry[1], options);
  });
};

