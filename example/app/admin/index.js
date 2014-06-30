var bldr = require('../../..')('ex', __filename, {appDir: '..'});
require('..');
bldr.define('./Dashboard');
bldr.browser('./init');
