;(function() {

// exportmore.js
testloadstar = {};
testloadstar.fixtures = {};
testloadstar.fixtures.exportmore = {
  msg: function() {
    return 'more';
  }
};

// exports.js
testloadstar.fixtures.exports = {};
testloadstar.fixtures.exports.msg = function() {
};

})()
