;(function(root,factory) { if (typeof define === "function" && define.amd) {   define([], factory); } else { root.testglobal = factory(); }})(this, function() {
var exports, module;

exports = {}; module = {exports: exports};

// fixtures/testglobal.js
var testglobal = module.exports = {};

// fixtures/extends.js

testglobal.msg = function() {
};

return testglobal;
}));