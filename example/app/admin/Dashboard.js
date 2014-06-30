var bldr = require('../../..')('ex', __filename);
bldr.define('../models/User');

var Dashboard = module.exports = function(options) {
  this.model = options.model || new ex.models.User();
  this.el = options.el;
};
Dashboard.prototype.render = function() {
  this.el.innerHTML = 'Dashboard: '+this.model.say('Hello admin');
};
