//Make Connection
const socket = io.connect("http://192.168.0.67:4000");

var findGameBtn = document.getElementById("findGameButton");


findGameBtn.addEventListener("click", function() {
    socket.emit("findGame");
    console.log("HI");
});



//Listen for socket events
socket.on("gameCreated", (gameID) => {
    console.log("mssage recieved")
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "game/"+gameID, true);
    xhr.send();
    console.log(xhr.responseText);
   
});

