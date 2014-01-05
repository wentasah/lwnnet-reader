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
		    sendMessageToJava({ type: "Reader:GoToReadingList" });
		    var tabs = require('sdk/tabs');
		    for (var i=0; i<headlines.length; i++) {
			let url = "http://lwn.net" + headlines[i].href;
			let json = JSON.stringify({ url: url });
			Services.obs.notifyObservers(null, "Reader:Add", json);

			// Open articles also in tabs, because some
			// articles (usually short ones) cannot be
			// converted for the reader and added to the
			// list. I don't know how to detect this case
			// here.
			tabs.open({
			    url: url,
			    inBackground: true
			})
		    }
		}
	    });
	});
    },
});
