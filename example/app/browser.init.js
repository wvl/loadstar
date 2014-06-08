
var user = new ex.models.User({name: 'bldr'});
var login = new ex.views.Login({model: user, el: document.body});
login.render();
