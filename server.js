//RTChess by Sam Medwell

//Import required packages
const express = require("express");
const GameManager = require("./gamemanager");
const socket = require("socket.io");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");


//Create instance of express class
const app = express();
//Point the express app to the static web files
app.use(express.static("static"));
//Set pug as the template engine
app.set("view engine", "pug");
//Use cookie parser
app.use(cookieParser());

//Create instance of Game Manager
const gameManager = new GameManager();

//Start server
const server = app.listen(4000, function () {
    console.log("listening on port 4000");
})

//Socket setup
const listener = socket(server);


//GET request middlware - create session if user has no session
function establishSession (req, res, next) {
    if (req.method == "GET") {
        if (req.cookies["sessionID"] == null) {
            var sessionID = crypto.randomBytes(20).toString('hex');
            console.log("New session: " + sessionID)
            res.cookie('sessionID', sessionID, {maxAge: 10 * 60 * 60 * 1000});
        } else {
            console.log("Existing connection");
        }
    }
    next();
}

app.use(establishSession)   

//GET request for home page
app.get("/", function (req, res) {
    res.render("home");
});

//GET request for game page
app.get("/game/:gameID/:sessionID", function (req, res) {
    //Get gameID from url
    var urlGameID = req.params["gameID"];
    //get socketID from url
    var urlSessionID = req.params["sessionID"];
    console.log(urlGameID);
    console.log(urlSessionID);
    //Check that the game currently exists
    if (gameManager.doesGameExist(urlGameID.toString())) {
        //If it exists, check that the user is a valid member of the game
        //Get player IDs
        var playerIDs = Object.values(gameManager.getGamePlayers(urlGameID));
        //Check if they are players in the game
        if (Object.values(playerIDs).includes(urlSessionID)) {
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

    //Listens for sessionID being sent from client
    socket.on("sendSession", function(data) {
        console.log("User has Session ID " + data.sessionID);
        //Map sessionID to socketID in connected users
        connectedUsers[data.sessionID] = socket.id;
    });

    //listen for clients trying to find a game
    socket.on("findGame", function (data) {
        //Add player to queue
        gameManager.addPlayerToQueue(data.sessionID);
        //Attempt to create game
        var gameID = gameManager.createNewGame();
        //if gameID is false then no game was created
        if (gameID) {
            console.log("Success!", gameID);
            //Get players from game object
            var players = (gameManager.getGamePlayers(gameID));
            //Emit an event to users to let them know they can redirect to the game page
            gameManager.emitEventToPlayers(gameID, listener, "gameCreated", gameID);

        } else {
            console.log("No Game!");
        }
    });

});


//Page couldn't be found middleware
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})