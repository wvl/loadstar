var express = require('express');
var server = module.exports = express();
server.use(express.static(__dirname + '/www'));
var app = require('./app');

var user = new ex.models.User({name: 'bldr'});
console.log(user.say('Hi Node!'));

// Add this route in dev mode, to serve content from your dev directory
server.use('/dev', express.static(__dirname));

if (require.main === module) {
  server.listen(3000, function() {
    console.log('Server running on http://localhost:3000');
  })
}
