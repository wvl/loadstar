(function(root,factory) { if (typeof define === "function" && define.amd) {   define([], factory); } else { root.testglobal = factory(); }})(this, function() {

// testglobal.js
var testglobal = {};

// extends.js

testglobal.msg = function() {
};

return testglobal;
});
