var loadScript = function(src, segments, next) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false;

  script.onload = function() {
    if (segments) bldr(segments);
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

