all:
	npm install
	mkdir dist
	node_modules/.bin/grunt

clear:
	npm uninstall *
	rm -rf node_modules
	rm -rf dist