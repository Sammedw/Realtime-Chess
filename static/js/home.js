
import { socket, sessionID } from "./connection.js";

var findGameBtn = document.getElementById("findGameButton");


//Listener for find game button
findGameBtn.addEventListener("click", function() {
    socket.emit("findGame", {sessionID: sessionID});
});


//Listen for socket events
socket.on("gameCreated", (data) => {
    //redirect user to the new game page
    window.location = "/game/" + data.gameID + "/" + data.side + "/" + sessionID ;
});

