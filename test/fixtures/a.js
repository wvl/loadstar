var loadstar = require('../..')('testloadstar', __filename);
var b = loadstar.require('./b');
exports.msg = 'a';
exports.b = b;
