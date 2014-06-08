var Login = module.exports = function(options) {
  this.model = options.model;
  this.el = options.el;
};
Login.prototype.render = function() {
  this.el.innerHTML = this.model.say('Login please');
};
