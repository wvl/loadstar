;(function(root,factory) { if (typeof define === "function" && define.amd) {   define([], factory); } else { root.testglobal = factory(); }})(this, function() {
var exports, module

exports = {}; module = {exports: exports};

// fixtures/testglobal.js
var base = module.exports = {};

// fixtures/extends.js

testglobal.msg = function() {
};

exports = null; module = null

return testglobal;
}));