var init = function() {
  var user = new ex.models.User({name: 'bldr'});
  var login = new ex.views.Login({model: user, el: document.getElementById('app')});
  login.render();
}
if (typeof exConfig !== 'undefined') {
  console.log('init app');
  if (exConfig.init === 'app') init();
}
