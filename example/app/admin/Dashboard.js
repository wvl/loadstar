var Dashboard = module.exports = function(options) {
  this.model = options.model;
  this.el = options.el;
};
Dashboard.prototype.render = function() {
  this.el.innerHTML = 'Dashboard: '+this.model.say('Hello admin');
};
