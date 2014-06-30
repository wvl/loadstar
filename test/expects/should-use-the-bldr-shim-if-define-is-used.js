;(function() {
var exports, module;
var bldr = function(ss) {
  var i, s, r = window;
  for (i=0; i<ss.length-1; i++) {
    if (!r[ss[i]]) r[ss[i]] = {};
    r = r[ss[i]];
  }
  r[ss[ss.length - 1]] = module.exports;
};

exports = {}; module = {exports: exports};

// fixtures/exports.js
exports.msg = function() {
};

bldr(["testbldr","fixtures","exports"]);

})()
