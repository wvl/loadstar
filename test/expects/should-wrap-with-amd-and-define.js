(function(root,factory) { if (typeof define === "function" && define.amd) {   define([], factory); } else { root.testglobal = factory(); }})(this, function() {

// exports.js
var testbldr = {};
testbldr.exports = {};
testbldr.exports.msg = function() {
};

return testglobal;
});
