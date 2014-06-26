var path = require('path');
var b = require('../lib');
var expect = require('chai').expect;

describe('bldr', function() {
  var bldr;

  beforeEach(function() {
    b.reset();
    testbldr = undefined;
    bldr = b(__filename, {global: 'testbldr'});
  });

  afterEach(function() {
    Object.keys(require.cache).forEach(function(reqd) {
      if (path.relative(path.join(__dirname, 'fixtures'), reqd).slice(0,2) != '..') {
        delete require.cache[reqd];
      }
    });
  });

  it('should add to the buildList', function() {
    expect(Object.keys(b.buildList).length).to.equal(1);
    expect(b.buildList[__filename]).to.equal(true);
  });

  it('should require and add to the applist', function() {
    var mod = bldr.require('./fixtures/exports');
    expect(mod.msg).to.exist;
    expect(b.appList.length).to.equal(1);
    expect(b.appList[0][0]).to.equal(path.join(__dirname, 'fixtures/exports.js'));
    expect(b.appList[0][1]).to.be.false;
    expect(b.info.usedDefine).to.be.false;
  });

  it('should add to the global with define', function() {
    var mod = bldr.define('./fixtures/exports');
    expect(mod.msg).to.exist;
    expect(testbldr.fixtures.exports.msg).to.exist;
    expect(b.appList.length).to.equal(1);
    expect(b.appList[0][0]).to.equal(path.join(__dirname, 'fixtures/exports.js'));
    expect(b.appList[0][1]).to.eql(['testbldr','fixtures','exports']);
    expect(b.info.usedDefine).to.equal(true);
  });

  it('should add to the global with define and a given extension', function() {
    var mod = bldr.define('./fixtures/exports.js');
    expect(mod.msg).to.exist;
    expect(testbldr.fixtures.exports.msg).to.exist;
  });

  it('should add to the appList with browser', function() {
    bldr.browser('./fixtures/browser');
    expect(b.appList.length).to.equal(1);
    expect(b.appList[0][0]).to.equal(path.join(__dirname, 'fixtures/browser.js'));
    expect(b.appList[0][1]).to.not.exist;
  });

  it('should require globbed files', function() {
    var mods = bldr.require('./fixtures/export*.js');
    expect(mods.length).to.equal(2);
    expect(mods[0].msg).to.exist;
    expect(mods[1].msg).to.exist;
  });

  it('should define globbed files', function() {
    bldr.define('./fixtures/export*.js');
    expect(testbldr.fixtures.exports.msg).to.exist;
    expect(testbldr.fixtures.exportmore.msg).to.exist;
    expect(b.appList.length).to.equal(2);
  });

  it('should add only one copy to appList', function() {
    var mod = bldr.define('./fixtures/exports.js');
    var mod = bldr.define('./fixtures/exports.js');
    expect(b.appList.length).to.equal(1);
  });

  it('should order the list by specifying exact files before glob', function() {
    bldr.define('./fixtures/exports.js');
    bldr.define('./fixtures/export*.js');
    expect(b.appList.length).to.equal(2);
    expect(b.appList[0][0]).to.match(/exports/);
    expect(b.appList[1][0]).to.match(/exportmore/);
  });

  it('should order the list by specifying exact files before glob 2', function() {
    bldr.define('./fixtures/exportmore.js');
    bldr.define('./fixtures/export*.js');
    expect(b.appList.length).to.equal(2);
    expect(b.appList[0][0]).to.match(/exportmore/);
    expect(b.appList[1][0]).to.match(/exports/);
  });

  it('should work with recursive requires', function() {
    var a = bldr.require('./fixtures/a.js');
    expect(a.msg).to.equal('a');
    expect(a.b).to.eql({msg: 'b'});
    expect(b.appList.length).to.equal(2);
    expect(b.appList[0][0]).to.match(/b/);
    expect(b.appList[1][0]).to.match(/a/);
  });

  it('should work with recursive requires inverse', function() {
    var bf = bldr.require('./fixtures/b.js');
    expect(bf.msg).to.equal('b');
    //expect(b.a).to.eql({msg: 'a'});
    expect(b.appList.length).to.equal(2);
    expect(b.appList[0][0]).to.match(/b/);
    expect(b.appList[1][0]).to.match(/a/);
  });
});
