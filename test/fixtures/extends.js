var bldr = require('../..')('testbldr', __filename);
var testglobal = bldr.require('./testglobal');

testglobal.msg = function() {
};
