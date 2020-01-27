//RTChess by Sam Medwell

//Import required packages
const express = require("express");
const GameManager = require("./gamemanager");
const socket = require("socket.io");


//Create instance of express class
const app = express();
//Point the express app to the static web files
app.use(express.static("static"));
//Set pug as the template engine
app.set("view engine", "pug");

//Create instance of Game Manager
const gameManager = new GameManager();

//Start server
const server = app.listen(4000, function () {
    console.log("listening on port 4000");
})

//Socket setup
const listener = socket(server);


//GET request for game page
app.get("/game/:gameID", function (req, res) {
    //Get gameID from url
    var urlGameID = req.params["gameID"];
    //Check that the game currently exists
    if (gameManager.doesGameExist(urlGameID) {
        //If it exists, render the game page
        res.render("gamepage");
    }
});


//Listen for connections
listener.on("connection", function(socket) {
    console.log("Connection", socket.id);

    //listen for clients trying to find a game
    socket.on("findGame", function () {
        //Add player to queue
        gameManager.addPlayerToQueue(socket.id);
        //Attempt to create game
        var gameID = gameManager.createNewGame();
        if (gameID) {
            console.log("Success!", gameID);
            //Add users to a socket room
            console.log(gameManager.getGamePlayers(gameID));
        } else {
            console.log("No Game!");
        }
    });
});
