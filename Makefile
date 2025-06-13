NPM=npm
RM=rm -rf

all: build dist
	$(NPM) start

dev: build dist
	$(NPM) run dev

dev-client: build dist
	$(NPM) run 'dev:client'

dev-server: build dist
	$(NPM) run 'dev:server'

build: node_modules
	$(NPM) run 'build:server'

dist: node_modules
	$(NPM) run 'build:client'

node_modules: package.json package-lock.json
	$(NPM) install

clean:
	$(RM) build data dist node_modules tsconfig.tsbuildinfo

re: clean all

.PHONY: all dev dev-client dev-server clean re
