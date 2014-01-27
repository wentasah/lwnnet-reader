const {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");

function sendMessageToJava(aMessage) {
    return Services.androidBridge.handleGeckoMessage(JSON.stringify(aMessage));
}

var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var prefs = require('sdk/simple-prefs').prefs;
var timers = require('sdk/timers');
var tabs = require('sdk/tabs');

// For testing
// tabs.activeTab.url = 'http://lwn.net/Articles/579722/';

pageMod.PageMod({
    include: "*.lwn.net",
    contentScriptFile: data.url("lwn-content.js"),
    contentScriptWhen: "ready",
    onAttach: function(worker) {
	worker.port.on("headlines", function(headlines) {
	    //console.log("addon received "+headlines.length+" headlines");
	    headlines = headlines.map(function(h) {h.url = "http://lwn.net" + h.href; return h; });
	    var notifications = require("sdk/notifications");
	    notifications.notify({
		title: "LWN.net reader",
		text: "Tap to add "+headlines.length+" articles from "+worker.tab.title+" to the reading list.",
		onClick: function (data) {
		    if (prefs['add'])
			sendMessageToJava({ type: "Reader:GoToReadingList" });

		    var i=0;
		    headlines.forEach(function(h) {
			if (prefs['tabs'])
			    tabs.open({url: h.url, inBackground: true});
			if (prefs['add']) {
			    timers.setTimeout(function(h) {
				let json = JSON.stringify({ url: h.url });
				Services.obs.notifyObservers(null, "Reader:Add", json);
			    }, prefs['delay']*(i++)*1000, h);
			}
		    });
		}
	    });
	});
    },
});
