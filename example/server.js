var fs = require('fs');
var path = require('path');
var express = require('express');
var ejs = require('ejs');
var server = module.exports = express();
server.use(express.static(__dirname + '/www'));
var ex = require('./app');
var loadstar = require('..')('ex', __filename);

var user = new ex.models.User({name: 'loadstar'});
var dev = process.env.NODE_ENV !== 'production';
console.log(user.say('Hi Node!'), dev);

if (dev) {
  loadstar.installExpress(server, {rootDir: __dirname});
}

server.get('/', function(req, res) {
  var layout = fs.readFileSync(path.join(__dirname, 'www', 'layout.html'), 'utf8');
  var sources = dev ? ['app_shim'] : ['deps','app'];
  var exConfig = JSON.stringify({init: 'app'});
  var fn = ejs.compile(layout);
  res.send(fn({exConfig: exConfig, sources: sources}));
});

server.get('/admin', function(req, res) {
  var layout = fs.readFileSync(path.join(__dirname, 'www', 'layout.html'), 'utf8');
  var sources = dev ? ['admin_shim'] : ['deps','app','admin'];
  var exConfig = JSON.stringify({init: 'admin'});
  var fn = ejs.compile(layout);
  res.send(fn({exConfig: exConfig, sources: sources}));
});

if (require.main === module) {
  server.listen(3000, function() {
    console.log('Server running on http://localhost:3000');
  })
}
