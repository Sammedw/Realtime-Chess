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
var PORT = process.env.PORT || 4000;
const server = app.listen(PORT, function () {
    console.log("listening on port " + PORT);
})

//Socket setup
const listener = socket(server);


//GET request middlware - create session if user has no session
function establishSession (req, res, next) {
    //Check if request is GET
    if (req.method == "GET") {
        //Check if the user has a session cookie
        if (req.cookies["sessionID"] == null) {
            //If not, generate a new session cookie with random bytes
            var sessionID = crypto.randomBytes(20).toString('hex');
            console.log("New session started: " + sessionID)
            //Send the user the cookie with a maximum age
            res.cookie('sessionID', sessionID, {maxAge: 10 * 60 * 60 * 1000});
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
app.get("/game/:gameID/:side/:sessionID", function (req, res) {
    //Get gameID from url
    var urlGameID = req.params["gameID"];
    //Get side from url
    var urlSide = req.params["side"];
    //get sessionID from url
    var urlSessionID = req.params["sessionID"];
    //Check that the game currently exists
    if (gameManager.doesGameExist(urlGameID.toString())) {
        //If it exists, check that the user is a valid member of the game 
        //and that their session matches their pieces colour
        //Get players
        var players = gameManager.getGamePlayers(urlGameID);
        //Check if they are players in the game
        if (players[urlSide] == urlSessionID) {
            //Get cooldown and movespeed to send to client
            var cooldown = gameManager.getGameCooldownTime(urlGameID);
            var moveSpeed = gameManager.getGameMoveSpeed(urlGameID);
            //Send user to game page
            res.render("gamepage", {cooldown: cooldown, moveSpeed: moveSpeed});
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
            console.log("Game created", gameID);
            //Emit an event to users to let them know they can redirect to the game page
            gameManager.emitEventToPlayer(gameID, "white", listener, "gameCreated", {side: "white", gameID: gameID});
            gameManager.emitEventToPlayer(gameID, "black", listener, "gameCreated", {side: "black", gameID: gameID});

        } else {
            console.log("Not enough players in queue");
        }
    });

    //listen for clients trying to make moves
    socket.on("startMove", function(data) {
        //Get game by gameID
        if (gameManager.doesGameExist(data.gameID)) {
            var game = gameManager.getGames()[data.gameID].game;
            //Check if the move made is legal
            var result = game.evalMove(data.source, data.piece, data.target);
            if (result.legal == true) {
                //check if a special move was made (pawn promotion)
                if (result.special){
                    //append extra flags to return object
                    data.special = true;
                    data.specialPosition = result.specialPosition;
                }
                //If legal send the move to both players
                gameManager.emitEventToPlayers(data.gameID, listener, "startMoveResponse", data);
                //Put piece on cooldown
                game.addPieceCooldown(data.target, data.piece);
                //Check if a captured piece's cooldown was interrupted
                if (result.interrupt == true) {
                    //Emit message to client to reset cooldown animation
                    gameManager.emitEventToPlayers(data.gameID, listener, "cooldownInterruption", data.target);
                }
                //Remove piece from board as its in flight
                game.removePiece(data.source, data.piece);
                //Get cooldown and movespeed
                var cooldown = gameManager.getGameCooldownTime(data.gameID);
                var moveSpeed = gameManager.getGameMoveSpeed(data.gameID);
                //Set timer to save the move after move is completed (movetime)
                setTimeout(function(source, piece, target, gameID) {endMove(source, piece, target, gameID, data.specialPosition)}, 
                moveSpeed, data.source, data.piece, data.target, data.gameID);
                //set timer after cooldown has finished (cooldowntime + movetime)
                setTimeout(function(target, piece, gameID) {endCooldown(target, piece, gameID)}, moveSpeed+cooldown,
                    data.target, data.piece, data.gameID);

                //Check if the game is over
                if (result.gameOver) {
                    //emit message to players
                    console.log("game over");
                    gameManager.emitEventToPlayers(data.gameID, listener, "gameOver", result.gameOver);
                }
            }
        } else {
            console.log("Move requested on non-existent game");
        }
    });

    function endMove(source, piece, target, gameID, specialPosition) {
        //get the game
        var game = gameManager.getGames()[gameID].game;
        //check for pawn promotion
        if (specialPosition) {
            //load new position
            game.chess.load(specialPosition);
        } else {
            //otherwise make move normally
            game.addPiece(target, piece);
        }
    }

    function endCooldown(target, piece, gameID) {
        //get the game
        var game = gameManager.getGames()[gameID].game;
        //remove the cooldown
        game.removePieceCooldown(target, piece);
    }

});


//Page couldn't be found middleware
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});