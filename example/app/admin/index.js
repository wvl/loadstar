var loadstar = require('../../..')('ex', __filename, {appDir: '..'});
require('..');
loadstar.define('./Dashboard');
loadstar.browser('./init');
