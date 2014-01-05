var xpathResult = document.evaluate('//div[@class="ArticleText"]/h2[@class="SummaryHL"]/a',
                                     document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
console.log("There are "+xpathResult.snapshotLength+"headlines!!");
if (xpathResult.snapshotLength > 0) {
    var headlines = [];
    for (var i=0; i < xpathResult.snapshotLength; i++) {
        var a = xpathResult.snapshotItem(i);
        headlines.push({
            "href": a.getAttribute("href"),
            "text": a.textContent
        });
        //console.log("Heading: "+a.textContent+" href="+a.getAttribute("href"));
    }
    self.port.emit("headlines", headlines);
}
