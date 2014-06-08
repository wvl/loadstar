var bldr = require('../..')(__filename, {global: 'ex', appDir: __dirname, rootDir: '..'});

bldr.browser('/vendor/jquery-2.1.1');

require('./models');
bldr.define('views/Login');
bldr.browser('browser.init');
