var fs = require('fs');
var path = require('path');
var b = require('../lib');
var builder = require('../lib/builder');
var expect = require('chai').expect;
var assert = require('chai').assert;

var checkResult = function(test, result) {
  var file = test.title.replace(/ /g, '-')+'.js';
  fs.writeFileSync(path.join(__dirname, 'generated', file), result, 'utf8');
  var expectedPath = path.join(__dirname, 'expects', file);
  assert(fs.existsSync(expectedPath), "No 'expects/"+file+"' file");
  var expected = fs.readFileSync(expectedPath, 'utf8');
  assert.equal(result, expected, 'Output is not as expected for: ', test.title);
};

describe('bldr builder', function() {
  var bldr, options, data;

  beforeEach(function() {
    delete b.store['testbldr'];
    testbldr = undefined;
    options = {rootDir: __dirname};
    bldr = b('testbldr', __filename);
    data = b.store['testbldr'];
  });

  afterEach(function() {
    Object.keys(require.cache).forEach(function(reqd) {
      if (path.relative(path.join(__dirname, 'fixtures'), reqd).slice(0,2) != '..') {
        delete require.cache[reqd];
      }
    });
  });

  it('should extend base', function() {
    var mod = bldr.require('./fixtures/extends');
    checkResult(this.test, builder.make(data, options));
  });

  it('should avoid closure if --bare is given', function() {
    var mod = bldr.require('./fixtures/extends');
    options.bare = true;
    checkResult(this.test, builder.make(data, options));
  });

  it('should wrap with amd if --amd', function() {
    var mod = bldr.require('./fixtures/extends');
    options.amd = 'testglobal';
    checkResult(this.test, builder.make(data, options));
  });
});
