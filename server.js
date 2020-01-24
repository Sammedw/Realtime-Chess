//RTChess by Sam Medwell

//Import required packages
const express = require("express");
const GameManager = require("./gamemanager");
const socket = require("socket.io");


//Create instance of express class
const app = express();
//Point the express app to the static web files
app.use(express.static("static"));

//Create instance of Game Manager
const gameManager = new GameManager();

//Start server
const server = app.listen(4000, function () {
    console.log("listening on port 4000");
})


//Socket setup
const listener = socket(server);


//Listen for connections
listener.on("connection", (socket) => {
    console.log("Connection", socket.id);
    gameManager.addPlayerToQueue(socket.id);
    console.log(gameManager.getPlayerQueue());
});
