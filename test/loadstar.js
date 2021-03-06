var path = require('path');
var b = require('../lib');
var expect = require('chai').expect;

describe('loadstar', function() {
  var loadstar, data;

  beforeEach(function() {
    delete b._store['testloadstar'];
    testloadstar = undefined;
    loadstar = b('testloadstar', __filename, {global: 'testloadstar'});
    data = b._store['testloadstar'];
  });

  afterEach(function() {
    Object.keys(require.cache).forEach(function(reqd) {
      if (path.relative(path.join(__dirname, 'fixtures'), reqd).slice(0,2) != '..') {
        delete require.cache[reqd];
      }
    });
  });

  it('should add to the buildList', function() {
    expect(Object.keys(data.buildList).length).to.equal(1);
    expect(data.buildList[__filename]).to.equal(true);
  });

  it('should require and add to the applist', function() {
    var mod = loadstar.require('./fixtures/exports');
    expect(mod.msg).to.exist;
    expect(Object.keys(data.appList).length).to.equal(1);
    expect(data.appList[path.join(__dirname, 'fixtures/exports.js')].segments).to.be.false;
  });

  it('should add to the global with define', function() {
    var mod = loadstar.define('./fixtures/exports');
    expect(mod.msg).to.exist;
    expect(loadstar.testloadstar.fixtures.exports.msg).to.exist;
    expect(Object.keys(data.appList).length).to.equal(1);
    var info = data.appList[path.join(__dirname, 'fixtures/exports.js')];
    expect(info.segments).to.eql(['testloadstar','fixtures','exports']);
  });

  it('should add to the global with define and a given extension', function() {
    var mod = loadstar.define('./fixtures/exports.js');
    expect(mod.msg).to.exist;
    expect(loadstar.testloadstar.fixtures.exports.msg).to.exist;
  });

  it('should add to the appList with browser', function() {
    loadstar.browser('./fixtures/browser');
    expect(Object.keys(data.appList).length).to.equal(1);
    var info = data.appList[path.join(__dirname, 'fixtures/browser.js')];
    expect(info.segments).to.be.undefined;
  });

  it('should require globbed files', function() {
    var mods = loadstar.require('./fixtures/export*.js');
    expect(mods.length).to.equal(2);
    expect(mods[0].msg).to.exist;
    expect(mods[1].msg).to.exist;
  });

  it('should define globbed files', function() {
    loadstar.define('./fixtures/export*.js');
    expect(loadstar.testloadstar.fixtures.exports.msg).to.exist;
    expect(loadstar.testloadstar.fixtures.exportmore.msg).to.exist;
    expect(Object.keys(data.appList).length).to.equal(2);
  });

  it('should add only one copy to appList', function() {
    var mod = loadstar.define('./fixtures/exports.js');
    var mod = loadstar.define('./fixtures/exports.js');
    expect(Object.keys(data.appList).length).to.equal(1);
  });

  it('should order the list by specifying exact files before glob', function() {
    loadstar.define('./fixtures/exports.js');
    loadstar.define('./fixtures/export*.js');
    var keys = Object.keys(data.appList);
    expect(keys.length).to.equal(2);
    expect(keys[0]).to.match(/exports/);
    expect(keys[1]).to.match(/exportmore/);
  });

  it('should order the list by specifying exact files before glob 2', function() {
    loadstar.define('./fixtures/exportmore.js');
    loadstar.define('./fixtures/export*.js');
    var keys = Object.keys(data.appList);
    expect(keys.length).to.equal(2);
    expect(keys[0]).to.match(/exportmore/);
    expect(keys[1]).to.match(/exports/);
  });

  it('should work with recursive requires', function() {
    var a = loadstar.require('./fixtures/a.js');
    expect(a.msg).to.equal('a');
    expect(a.b).to.eql({msg: 'b'});
    var keys = Object.keys(data.appList);
    expect(keys.length).to.equal(2);
    expect(keys[0]).to.match(/b/);
    expect(keys[1]).to.match(/a/);
  });

  it('should work with recursive requires inverse', function() {
    var bf = loadstar.require('./fixtures/b.js');
    expect(bf.msg).to.equal('b');
    //expect(data.a).to.eql({msg: 'a'});
    var keys = Object.keys(data.appList);
    expect(keys.length).to.equal(2);
    expect(keys[0]).to.match(/b/);
    expect(keys[1]).to.match(/a/);
  });
});
