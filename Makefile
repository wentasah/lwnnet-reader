REV=$(shell git log --oneline|wc -l)

run:
#	cfx run -a fennec-on-device -b adb --mobile-app firefox --force-mobile 
	cfx run -a fennec-on-device -b adb --mobile-app firefox_beta --force-mobile 

xpi:
	sed -i -e '/"version":/ s/rev\([0-9]\+\)/rev$(REV)/' package.json
	cfx xpi --force-mobile
	adb push lwnnet-reader.xpi /mnt/sdcard/
