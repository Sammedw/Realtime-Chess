//Make Connection
const socket = io.connect("http://192.168.0.67:4000");

//Query DOM
var message = document.getElementById("message"),
    handle = document.getElementById("handle"),
    btn = document.getElementById("send"),
    output = document.getElementById('output'),
    feedback = document.getElementById("feedback");

//Emit events

btn.addEventListener("click", function () {
    //chat is the name of the messahe
    //{} is an object with attributes
    socket.emit("chat", {
        message: message.value,
        handle: handle.value
    });
    message.value = "";
});

message.addEventListener("keypress", function () {
    if (handle.value != "") {
        socket.emit("typing", handle.value);
    }
});

//listen for events

socket.on("chat", function (data) {
    feedback.innerHTML = "";
    output.innerHTML += "<P><strong>" + data.handle + ": </strong>" + data.message + "</p>";
});

socket.on("typing", function (data) {
    feedback.innerHTML = "<p><em>" + data + " is typing a message...</em></p>";
});