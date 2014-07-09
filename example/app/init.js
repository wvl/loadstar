var init = function() {
  var user = new ex.models.User({name: 'loadstar'});
  var login = new ex.views.Login({model: user, el: document.getElementById('app')});
  login.render();
}
if (typeof exConfig !== 'undefined') {
  if (exConfig.init === 'app') init();
}
