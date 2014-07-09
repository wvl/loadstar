;(function() {

// exports.js
testloadstar = {};
testloadstar.exports = {};
testloadstar.exports.msg = function() {
};

// exportmore.js
testloadstar.exportmore = {
  msg: function() {
    return 'more';
  }
};

})()
