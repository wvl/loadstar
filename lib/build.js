var fs = require('fs');
var path = require('path');
var loader = fs.readFileSync(__dirname+'/loader.js', 'utf8');
var bldr = require('./index');

module.exports = function(requirePath, options) {
  require(requirePath);
  var output = ''+loader;
  var src;
  bldr.appList.forEach(function(info) {
    src = path.join(options.prefix, info[0]);
    var segments = JSON.stringify(info[1]);
    output += "loadScript('"+src+"', "+segments+");\n";
  });
  if (options.output) {
    fs.writeFileSync(options.output, output, 'utf8');
    console.log('bldr: ', options.output);
  } else {
    console.log(output);
  }
};

