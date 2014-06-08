var init = function() {
  var user = new ex.models.User({name: 'bldr-admin'});
  var dash= new ex.admin.Dashboard({model: user, el: document.getElementById('app')});
  dash.render();
}
if (typeof exConfig !== 'undefined') {
  if (exConfig.init === 'admin') init();
}
