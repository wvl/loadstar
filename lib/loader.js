var loadScript = function(src, segments, next) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false;

  script.onload = function() {
    bldr(segments, next);
  };
  document.head.appendChild(script);
};
