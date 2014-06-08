window.bldr = function(ss) {
  if (ss) {
    var i, s, r = window;
    for (i=0; i<ss.length-1; i++) {
      if (!r[ss[i]]) r[ss[i]] = {};
      r = r[ss[i]];
    }
    r[ss[ss.length - 1]] = window.module.exports;
  }
  window.exports = {};
  window.module = {exports: window.exports};
};
bldr();
