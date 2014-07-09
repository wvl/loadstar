var loadstar = require('../..')('ex', __filename, {appDir: __dirname});

require('./_deps');
require('./models');
loadstar.define('views/Login');
loadstar.browser('./init');
module.exports = loadstar.ex;
