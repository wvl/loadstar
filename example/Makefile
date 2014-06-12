
-include app.d
-include admin.d
-include deps.package.d

www/js/app_shim.js:
	../bin/bldr build app::www/js/app_shim.js --deps=app.d

www/js/admin_shim.js:
	../bin/bldr build app:: app/admin::www/js/admin_shim.js --deps=admin.d

www/js/%.js:
	../bin/bldr package app/_deps::www/js/deps.js app::www/js/app.js app/admin::www/js/admin.js --deps=deps.package.d

TOPACKAGE = www/js/deps.js www/js/app.js www/js/admin.js
TOBUILD = www/js/app_shim.js www/js/admin_shim.js

build: $(TOBUILD)

package: $(TOPACKAGE)

all: build package

clean:
	rm -rf $(TOBUILD) $(TOPACKAGE) *.d
