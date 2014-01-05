console.log("in popup");

addon.port.on("headlines", function (headlines) {
    var list = document.getElementById("articles");
    list.innerHTML='';
    for (var i = 0; i < headlines.length; i++) {
        var li = document.createElement("li");
        var text = document.createTextNode(headlines[i].text);
        li.appendChild(text);
        list.appendChild(li);
    }
});