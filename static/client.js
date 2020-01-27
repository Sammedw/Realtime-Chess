//Make Connection
const socket = io.connect("http://192.168.0.67:4000");

var findGameBtn = document.getElementById("findGameButton");


findGameBtn.addEventListener("click", function() {
    socket.emit("findGame");
});



//Listen for socket events
