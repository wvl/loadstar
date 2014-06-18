bldr - a module builder for node.js and the browser
===================================================

1. You want to share code between node.js and the browser
2. You do not want a build step between saving a file and running the code (in the browser, or on node).
3. You want to be able to package your code for the browser in production.
4. You want explicit control over what gets packaged.

**bldr** is a node.js package that builds a package for the browser, but still uses code that works
well from node.js. It does not try to infer your intentions from your require statements, but it adds
an api on top of require so that your intentions are made explicit.

With bldr, the code you write runs directly from node. In the browser, the code you write runs directly
in the browser, by referencing the loader script that bldr creates from your source tree. And in production,
you bldr will package your code for into one or more files.

It has the following api:

1. **bldr.require**: Require this file for both node and the browser.
2. **bldr.define**: Define this file into your app's namespace for both node and the browser.
3. **bldr.browser**: Add this file to the list for the browser.

### Example

```
app/index.js
app/browser.init.js
app/models/index.js
app/models/User.js
app/views/Login.js
```

```javascript
// app/index.js:

// Require bldr. bldr is a function that takes the filename you are calling
// from as the first argument, and an optional options argument. If you use
// `bldr.define`, you must tell it the appDir (root of your app source tree), 
// and an optional global variable to hang your app source off of.
var bldr = require('bldr')(__filename, {global: 'myapp', appDir: '.'});

// browser adds the file to the package solely for the browser.
bldr.browser('/node_modules/underscore/underscore.js');

// One requirement of bldr is that we don't use `require` from within any of the
// app source files. So we must also require underscore and attach it to a global
// variable, for use within our app.
global._ = require('underscore');

// `bldr.define` will require the file, and extend our global variable. After
// this call, `myapp.models.User` will be defined.
bldr.define('./models/User');

// Require works as normal, and is not modified in any way. Here, we require a
// submodule of our app.
require('./views');

// Use `bldr.browser` to add our browser init script that will bootstrap our
// app into the browser.
bldr.browser('./browser.init');
```


```javascript
// lib/models/User.js
// Regular commonjs exports style. Any external dependencies must be required
// from a file that's not added to the app (typically index.js).
module.exports = function() {};
```

```javascript
// lib/views/index.js
var bldr = require('bldr')(__filename, {global: 'myapp', appDir: '..'});

// Add some dependencies required for the view layer
global.React = require('react');
bldr.browser('/vendor/js/react.js');

// Require our view components here
bldr.define('./Login');
```

```javascript
// lib/views/Login.js
module.exports = function() {};
```

```javascript
// lib/browser.init.js
var view = new myapp.views.Login();
document.getElementById('#app').innerHTML(view.render());
```

```javascript
// test/models/User.js

// We can use our files directly from node
var User = require('../../lib/models/User');

describe('User', function() {
  it('should be defined', function() {
    expect(User).to.exist;
  });
});
```

```javascript
// test/views/Login.js

// Or, we can use the source from node by requiring
// the module index, and using the exposed global:
require('../../lib/views');
describe('Login View', function() {
  it('should be defined', function() {
    expect(React).to.exist;
    expect(myapp.views.Login).to.exist;
  });
});
```

```sh
# We can build the dev loader shim for the browser
$ bldr build app::www/app.js
# Or package our app for procuction
$ bldr package app::www/app.js
```

```sh
# We can also package the app into multiple files
$ bldr package app::www/app.js app/admin::www/admin.js
```

### FAQ:

**require shim?**

No require shim in the compiled file. lightest weight, simplest result.

**This requires a specific loader?**

The shim file implements a loader for dev purposes. In production you control your own loading.

**How do I split my app into multiple files**

The command line tool takes a list of 'require path'::'file to write'. It will go through the list in order, and first require the path, and then write out the state of the app (either into a shim loader with `build`, or a concatenated file with `package`). The next file to be required will only add any files that were not in the first package. In that way you can split the app however you want.

Say for example you wanted to have most of the dependencies in one file, and the app in another. You could have a `lib/deps.js` file that would contain `bldr.browser('path/to/underscore.js'); bldr.browser('path/to/backbone.js');`. `lib/index.js` would then contain `require('./deps.js'); bldr.define('models');`. Then the following command would put everything required by deps.js into the first file, and everything else into the second.

```sh
bldr build lib/deps::www/js/deps.js lib::www/js/app.js
```

**Is there a watch mode?**

I believe that this functionality is out of the scope of this package, and should be built into your build tools. You can see an example of `bldr` integrated with `make` in the examples directly. There is support for generating a depenency file that `make` will understand with the option `--deps`. More build tool integration hopefully coming.

