(function(root,factory) { if (typeof define === "function" && define.amd) {   define([], factory); } else { root.testglobal = factory(); }})(this, function() {

// exports.js
var testloadstar = {};
testloadstar.exports = {};
testloadstar.exports.msg = function() {
};

return testglobal;
});
