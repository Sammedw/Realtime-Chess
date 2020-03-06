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

//GET request for home page
app.get("/", function (req, res) {
    res.render("home");
});

//GET request for game page
app.get("/game/:gameID/:socketID", function (req, res) {
    //Get gameID from url
    var urlGameID = req.params["gameID"];
    //get socketID from url
    var urlSocketID = req.params["socketID"];
    console.log(urlGameID);
    console.log(urlSocketID);
    //Check that the game currently exists
    if (gameManager.doesGameExist(urlGameID.toString())) {
        //If it exists, check that the user is a valid member of the game
        //Get player IDs
        var playerIDs = Object.values(gameManager.getGamePlayers(urlGameID));
        //Check if they are players in the game
        if (Object.values(playerIDs).includes(urlSocketID)) {
            //Send user to game page
            res.render("gamepage");
        } else {
            //They are not part of the game, redirect user to home
            res.redirect("/");
        }
    } else {
        //Game doesn't exist redirect user back
        res.redirect("/");
    }
});


connectedUsers = {};

//Listen for connections
listener.on("connection", function(socket) {
    console.log("Connection", socket.id);
    //Add new user to connected users
    connectedUsers[socket.id] = socket;

    //listen for clients trying to find a game
    socket.on("findGame", function () {
        //Add player to queue
        gameManager.addPlayerToQueue(socket.id);
        //Attempt to create game
        var gameID = gameManager.createNewGame();
        if (gameID) {
            console.log("Success!", gameID);
            //Get players from game object
            var players = (gameManager.getGamePlayers(gameID));
            //Join the players to the socket room
            connectedUsers[players["white"]].join(gameID);
            connectedUsers[players["black"]].join(gameID);
            //Emit an event to users to let them know they can redirect to the game page
            listener.to(gameID).emit("gameCreated", gameID);
        } else {
            console.log("No Game!");
        }
    });

});


//Page couldn't be found middleware
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})