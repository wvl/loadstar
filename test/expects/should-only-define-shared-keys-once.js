;(function() {

// exports.js
var testbldr = {};
testbldr.exports = {};
testbldr.exports.msg = function() {
};

// exportmore.js
testbldr.exportmore = {
  msg: function() {
    return 'more';
  }
};

})()
