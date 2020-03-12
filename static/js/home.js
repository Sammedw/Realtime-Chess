//Make Connection
//192.168.0.67
//const socket = io.connect("http://192.168.219.96:4000");
import { socket } from "./connection.js";
console.log(socket);


var findGameBtn = document.getElementById("findGameButton");


//Listener for find game button
findGameBtn.addEventListener("click", function() {
    socket.emit("findGame");
});


//Listen for socket events
socket.on("gameCreated", (gameID) => {
    //redirect user to the new game page
    window.location = "/game/" + gameID + "/" + socket.id;
 
});

