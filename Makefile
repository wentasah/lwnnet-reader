
REV=$(shell git log --oneline|wc -l)

run:
#	cfx run -a fennec-on-device -b adb --mobile-app firefox --force-mobile 
	cfx run -a fennec-on-device -b adb --mobile-app firefox_beta --force-mobile 

xpi: version.json
	cfx xpi --force-mobile --manifest-overload=version.json
	adb push lwnnet-reader.xpi /mnt/sdcard/

.PHONY: version.json
.INTERMEDIATE: version.json
version.json:
	echo '{"version":"rev$(REV)"}' > $@
