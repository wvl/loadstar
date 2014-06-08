var bldr = require('../../..')(__filename, {appDir: '..', global: 'ex'});
require('..');
bldr.define('./Dashboard');
bldr.browser('./init');
