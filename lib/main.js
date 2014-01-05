const {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");

function sendMessageToJava(aMessage) {
  return Services.androidBridge.handleGeckoMessage(JSON.stringify(aMessage));
}

var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;

var headlines = [];

pageMod.PageMod({
  include: "*.lwn.net",
  contentScriptFile: data.url("lwn-content.js"),
  contentScriptWhen: "ready",
  onAttach: function(worker) {
      worker.port.on("headlines", function(h) {
          headlines = h;
	  console.log("addon received "+h.length+" headlines");
	  var notifications = require("sdk/notifications");
	  notifications.notify({
	      title: "LWN.net reader",
	      text: "Touch to add "+h.length+" articles from "+worker.tab.title+" to the reading list.",
	      onClick: function (data) {
		  console.log("clicked");
		  sendMessageToJava({ type: "Reader:GoToReadingList" });

		  var tabs = require('sdk/tabs');
		  for (var i=0; i<headlines.length; i++) {
		      tabs.open({
			  "url": "http://lwn.net" + headlines[i].href,
			  inBackground: true
		      })
		  }
	      }
	  });
      });
  },
});
