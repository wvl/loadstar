var bldr = require('../..')('testbldr', __filename);
var b = bldr.require('./b');
exports.msg = 'a';
exports.b = b;
