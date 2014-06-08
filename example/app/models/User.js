var User = module.exports = function(attrs) {
  this.attrs = attrs;
};
User.prototype.say = function(msg) {
  return msg+' from '+this.attrs.name;
};
