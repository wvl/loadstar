;(function() {

// exportmore.js
var testbldr = {};
testbldr.fixtures = {};
testbldr.fixtures.exportmore = {
  msg: function() {
    return 'more';
  }
};

// exports.js
testbldr.fixtures.exports = {};
testbldr.fixtures.exports.msg = function() {
};

})()
