var loadstar = require('../..')('testloadstar', __filename);
var testglobal = loadstar.require('./testglobal');

testglobal.msg = function() {
};
