var resetExports = function() {
  window.exports = {};
  window.module = {exports: window.exports};
};
resetExports();

var loadScript = function(src, segments) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false;

  script.onload = function() {
    var root = window;
    if (segments) {
      segments.slice(0, segments.length - 1).forEach(function(seg) {
        if (!root[seg]) root[seg] = {};
        root = root[seg];
      });
      root[segments[segments.length - 1]] = window.module.exports;
    }
    resetExports();
  };
  document.head.appendChild(script);
};
