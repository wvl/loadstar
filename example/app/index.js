var bldr = require('../..')('ex', __filename, {appDir: __dirname});

require('./_deps');
require('./models');
bldr.define('views/Login');
bldr.browser('./init');
module.exports = bldr.ex;
