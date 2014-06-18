var path = require('path');
var b = require('../lib');
var expect = require('chai').expect;

describe('bldr', function() {
  var bldr;

  beforeEach(function() {
    b.reset();
    bldr = b(__filename, {global: 'testbldr'});
  });

  it('should add to the buildList', function() {
    expect(b.buildList).to.eql([__filename]);
  });

  it('should require and add to the applist', function() {
    var mod = bldr.require('./fixtures/exports');
    expect(mod.msg).to.exist;
    expect(b.appList.length).to.equal(1);
    expect(b.appList[0][0]).to.equal(path.join(__dirname, 'fixtures/exports.js'));
    expect(b.appList[0][1]).to.not.exist;
  });

  it('should add to the global with define', function() {
    var mod = bldr.define('./fixtures/exports');
    expect(mod.msg).to.exist;
    expect(testbldr.fixtures.exports.msg).to.exist;
    expect(b.appList.length).to.equal(1);
    expect(b.appList[0][0]).to.equal(path.join(__dirname, 'fixtures/exports.js'));
    expect(b.appList[0][1]).to.eql(['testbldr','fixtures','exports']);
  });

  it('should add to the appList with browser', function() {
    bldr.browser('./fixtures/browser');
    expect(b.appList.length).to.equal(1);
    expect(b.appList[0][0]).to.equal(path.join(__dirname, 'fixtures/browser.js'));
    expect(b.appList[0][1]).to.not.exist;
  });
});
