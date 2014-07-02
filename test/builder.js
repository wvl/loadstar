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

  it('should use the bldr shim if define is used', function() {
    var mode = bldr.define('./fixtures/exports');
    checkResult(this.test, builder.make(data, options));
  });

  it('should build the dev shim', function() {
    var mod = bldr.define('./fixtures/exports');
    options.dev = true;
    checkResult(this.test, builder.make(data, options));
  });

  it('should call a transform', function() {
    bldr.setTransform('mytransform', function(src, info) {
      return src.replace(/msg/g, 'mymsg');
    });
    var mod = bldr.require('./fixtures/extends', {transform: 'mytransform'});
    checkResult(this.test, builder.make(data, options));
  });

  it('should add files to dev shim only if {dev: true}', function() {
    var mod = bldr.require('./fixtures/extends', {dev: true});
    expect(builder.make(data, options)).to.not.match(/msg/);
    options.dev = true;
    expect(builder.make(data, options)).to.match(/extends\.js/);
  });

  it('should add files to production only if {dev: false}', function() {
    var mod = bldr.require('./fixtures/extends', {dev: false});
    expect(builder.make(data, options)).to.match(/msg/);
    options.dev = true;
    expect(builder.make(data, options)).to.not.match(/extends\.js/);
  });
});
