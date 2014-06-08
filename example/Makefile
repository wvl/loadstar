
-include deps.build.d
-include deps.package.d

www/js/%_shim.js:
	../bin/bldr build app/_deps::www/js/deps_shim.js app::www/js/app_shim.js app/admin::www/js/admin_shim.js --deps=deps.build.d

www/js/%.js:
	../bin/bldr package app/_deps::www/js/deps.js app::www/js/app.js app/admin::www/js/admin.js --deps=deps.package.d

TOPACKAGE = www/js/deps.js www/js/app.js www/js/admin.js
TOBUILD = www/js/deps_shim.js www/js/app_shim.js www/js/admin_shim.js

build: $(TOBUILD)

package: $(TOPACKAGE)

all: build

clean:
	rm -rf $(TOBUILD) $(TOPACKAGE)
