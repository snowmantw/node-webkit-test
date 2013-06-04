
PPATH=`cwd`

all: build deps run

deps:
	@cd build && npm install
	@cd build && npm install && cd node_modules/ws && rm -rf ./build/Release && nw-gyp configure --target=0.5.1 && nw-gyp build

config:
	@cp config/package.json ./build/

clean:
	@mv ./build/Procfile /tmp/Procfile && rm -rf ./build/* && mv /tmp/Procfile ./build/

# Simple build
build: clean config
	@cp -r source/main build/main &&\
	cp -r library build/library &&\
	cp source/index.html build/

run:
	@cd build && foreman start

.PHONY: build clean run config

