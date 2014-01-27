
REV=$(shell git log --oneline|wc -l)

run:
#	cfx run -a fennec-on-device -b adb --mobile-app firefox --force-mobile 
	cfx run -a fennec-on-device -b adb --mobile-app firefox_beta --force-mobile 

xpi: version.json
	cp package.json package.json.bak
	sed -i -e '/"version":/ s/devel/rev$(REV)/' package.json
	cfx xpi --force-mobile #--manifest-overload=version.json
	mv package.json.bak package.json
	adb push lwnnet-reader.xpi /mnt/sdcard/

.PHONY: version.json
.INTERMEDIATE: version.json
version.json:
	echo '{"version":"rev$(REV)"}' > $@
