const {Cu} = require("chrome");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "ReaderMode", "resource://gre/modules/ReaderMode.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Messaging", "resource://gre/modules/Messaging.jsm");
var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");

// For testing
// require('sdk/tabs').activeTab.url = 'http://lwn.net/Articles/579722/';
// require('sdk/tabs').activeTab.url = 'http://lwn.net/Articles/479071/bigpage';

/*
 * Sanity limit for URIs passed to UI code.
 *
 * 2000 is the typical industry limit, largely due to older IE versions.
 *
 * We use 25000, so we'll allow almost any value through.
 *
 * Still, this truncation doesn't affect history, so this is only a practical
 * concern in two ways: the truncated value is used when editing URIs, and as
 * the key for favicon fetches.
 */
const MAX_URI_LENGTH = 25000;

/*
 * Similar restriction for titles. This is only a display concern.
 */
const MAX_TITLE_LENGTH = 255;

/**
 * Ensure that a string is of a sane length.
 */
function truncate(text, max) {
  if (!text || !max) {
    return text;
  }

  if (text.length <= max) {
    return text;
  }

  return text.slice(0, max) + "…";
}

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
		    var prefs = require('sdk/simple-prefs').prefs;
		    var timers = require('sdk/timers');
		    var tabs = require('sdk/tabs');

		    if (prefs['tabs']) {
			headlines.forEach(function(h) {
			    tabs.open({url: h.url, inBackground: true});
			});
		    }

		    if (prefs['add']) {
			var windows = require("sdk/windows");
			const { viewFor } = require("sdk/view/core");
			var window = viewFor(windows.browserWindows.activeWindow);
			const { defer } = require('sdk/core/promise');


			// Show reading list
	                window.BrowserApp.selectedBrowser.loadURI('about:home?panel=20f4549a-64ad-4c32-93e4-1dcef792733b')

			function addArticle(url) {
			    Messaging.sendRequestForResult({
				type: "Reader:AddToList",
				title: truncate(url, MAX_TITLE_LENGTH),
				url: truncate(url, MAX_URI_LENGTH),
			    }).catch(Cu.reportError);
// 			    return ReaderMode.downloadAndParseDocument(url).
// 				then(article => {
// 				    if (article) {
// 					window.Reader.addArticleToReadingList(article)
// // 					Messaging.sendRequestForResult({
// // 					    type: "Reader:AddToList",
// // 					    title: truncate(url, MAX_TITLE_LENGTH),
// // 					    url: truncate(url, MAX_URI_LENGTH),
// // 					}).catch(Cu.reportError);
// 				    } else {
// 					// Articles that fail to be parsed are opened in tabs
// 					tabs.open({url: url, inBackground: true});
// 				    }
// 				});
			}

			// We want to add articles in the same order
			// as on the web. Therefore, we start
			// downloading the next article only after the
			// previous article has been added.
			var deferred = defer();
			var promise = deferred.promise;
			// Create chain of promises to maintain the order
			if (prefs['reverse'])
			    headlines = headlines.reverse()
			headlines.forEach(function(h) {
			    promise = promise.then(() => addArticle(h.url));
			});
			promise.then(() => window.NativeWindow.toast.show("All LWN.net articles added", "long"));

			// Start executing the chained promises
			deferred.resolve()
		    }
		}
	    });
	});
    },
});
