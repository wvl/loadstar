var bldr = require('../..')(__filename, {global: 'ex', appDir: __dirname, rootDir: '..'});

require('./_deps');
require('./models');
bldr.define('views/Login');
bldr.browser('./init');
