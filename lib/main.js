console.log("Hello I'm here XXXXXXXXXX");

var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
// var panel = require("sdk/panel");

var headlines = [];

// var p = panel.Panel({
//   contentURL: data.url("popup.html"),
// });

// p.port.on("yesPressed", function handleMyMessage(arg) {
//     console.log("Yes pressed "+arg);
//     for (var i=0; i<headlines.length; i++) {
//         tabs.open({
//             "url": "http://lwn.net" + headlines[i].href,
//             inBackground: true
//         })
//     }
// });


pageMod.PageMod({
  include: "*.lwn.net",
  contentScriptFile: data.url("lwn-content.js"),
  contentScriptWhen: "ready",
  onAttach: function(worker) {
      worker.port.on("headlines", function(h) {
          headlines = h;
	  console.log("addon received "+h.length+" headlines");
//           p.port.emit("headlines", h);
//           p.show();
	  var notifications = require("sdk/notifications");
	  notifications.notify({
	      title: "LWN.net reader",
	      text: "Touch to add "+h.length+" articles from "+worker.tab.title+" to the reading list.",
	      onClick: function (data) {
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
