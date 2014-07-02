;(function() {
var bldr = function(ss) {
  var i, s, r = window;
  for (i=0; i<ss.length-1; i++) {
    if (!r[ss[i]]) r[ss[i]] = {};
    r = r[ss[i]];
  }
  r[ss[ss.length - 1]] = module.exports;
};
var loadScript = function(src, info, next) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false;

  script.onload = function() {
    if (info.segments) bldr(info.segments);
    if (next) {
      exports = {}; module = {exports: exports};
    } else {
      exports = module = undefined;
    }
  };
  document.head.appendChild(script);
};

__filename = '';
require = function() {
  return function() {
    return {
      define: function() {},
      require: function() {},
      browser: function() {}
    };
  };
};


exports = {}; module = {exports: exports};
loadScript('fixtures/exports.js', {"define":true,"segments":["testbldr","fixtures","exports"]}, undefined);

})()
