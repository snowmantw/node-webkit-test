

nw:
	cd $(APP) && npm install && zip -r ../$(APP).nw *

nwx: nw
	mkdir $(APP).pak && cat `which nw`  $(APP).nw > $(APP).pak/$(APP).run && chmod +x $(APP).pak/$(APP).run && cp nw.pak $(APP).pak/

.PHONY: nw nwx 
