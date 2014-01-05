var tabs = require('tabs');
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var panel = require("sdk/panel");

var headlines = [];

var p = panel.Panel({
  contentURL: data.url("popup.html"),
});

p.port.on("yesPressed", function handleMyMessage(arg) {
    console.log("Yes pressed "+arg);
    for (var i=0; i<headlines.length; i++) {
        tabs.open({
            "url": "http://lwn.net" + headlines[i].href,
            inBackground: true
        })
    }
});


pageMod.PageMod({
  include: "*.lwn.net",
  contentScriptFile: data.url("lwn-content.js"),
  contentScriptWhen: "ready",
  onAttach: function(worker) {
      worker.port.on("headlines", function(h) {
          headlines = h;
          p.port.emit("headlines", h);
          p.show();
      });
  },
});
