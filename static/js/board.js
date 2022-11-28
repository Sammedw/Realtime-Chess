
//import socket connection
import { socket, sessionID } from "./connection.js";

function extractGameInfoFromURL() {
    //get URL of page
    var URL = window.location["href"];
    //locate 2nd and 3rd slash of URL where the side is stored
    var firstSlash = URL.indexOf("game") + 4;
    var secondSlash = URL.indexOf("/", firstSlash+1);
    var thirdSlash = URL.indexOf("/", secondSlash+1);
    //extract the side and game id using the indicies of the slashes 
    var gameID = URL.substring(firstSlash+1, secondSlash)
    var side = URL.substring(secondSlash+1, thirdSlash);
    return {side: side, gameID: gameID};
}

//Board configuration
var config = {
    draggable: true,
    moveSpeed: moveSpeed,
    snapBackSpeed: "fast",
    position: "start",
    orientation: extractGameInfoFromURL().side,
    onDrop: onDrop,
    onDragStart: onDragStart
}

//Create new chess board object
var board = Chessboard("board", config);

//Create list that keeps track of squares with interrupted cooldowns
var interruptedCooldowns = [];

//set when gameOver message recieved from serer
var winner = null;

//Displays cooldown animation on given square
function displayCooldown(square, cooldown) {
    //Locate the sqaure using regex like statememt
    var squareDiv = document.querySelectorAll('div[class*="square-' + square + '"]')[0];
    //Set animation time to the cooldown time
    squareDiv.style.transition = "background-position " + cooldown/1000 + "s linear";
    //Start moving the background
    squareDiv.style.backgroundPosition = "left bottom";
    //Set a timer to activate after cooldown is over to reset the animation
    setTimeout(function () {
        //Check that the animation was not interrupted before resetting
        if (!(interruptedCooldowns.includes(square))) {
            //After the animation is completed, set animation speed to 0 and return to original position
            squareDiv.style.transition = "background-position 0s linear";
            squareDiv.style.backgroundPosition = "left top";
        } else {
            //remove square from list so that next time the animation is cancelled
            interruptedCooldowns.splice(interruptedCooldowns.indexOf(square), 1);
        }
    }, cooldown);
}

//Cancels cooldown animation on a given square
function removeCooldown(square) {
    //Locate the sqaure
    var squareDiv = document.querySelectorAll('div[class*="square-' + square + '"]')[0];
    //set animation speed to 0 and return to original position
    squareDiv.style.transition = "background-position 0s linear";
    squareDiv.style.backgroundPosition = "left top";
}

//Events called by client side chess board

//Called when user attempts to drag a piece
function onDragStart(source, piece, pos, orientation) {
    //Check if player is moving their own pieces
    if (piece.charAt(0) != orientation.charAt(0)) {
        //returning false means user cannot drag other player's pieces
        return false;     
    }
}

//Called when user drops a piece on a square
function onDrop(source, target, piece, newPos, oldPos, orientation) {
    //emit message to server with the move details for evaluation
    socket.emit("startMove", {gameID: extractGameInfoFromURL().gameID, 
                            source: source, target: target, piece: piece, side: orientation});
    return "trash";
}



//Listen for moves approved by server
socket.on("startMoveResponse", function(data){
    //Check if a move is special such as a pawn promotion
    if (data.special == true) {
        //If so update the board using the new position sent by server
        board.position(data.specialPosition.split(" ")[0]);
    } else {
        //Otherwise make move normally
        board.move(data.source + "-" + data.target);
    }
    //Set timer to display cooldown animation after the piece has arrived at square
    setTimeout(function(sqaure) { onMoveEnd(sqaure)}, moveSpeed, data.target);
});

//Called when piece arrives at square
function onMoveEnd(square) {
    //display cooldown animation
    displayCooldown(square, cooldown);
    //Check if there is a winner
    if (winner != null) {
        if (config.orientation.charAt(0) == winner) {
            //you won
            window.alert("Well done, you won!");
        } else {
            //you lost
            window.alert("You Lost!");
        }
    }
}

//listen for game over message
socket.on("gameOver", function(recvWinner) {
    winner = recvWinner;
});


//Listen for cooldown interruptions
socket.on("cooldownInterruption", function(square) {
    //Cancel existing cooldown animation
    removeCooldown(square);
    //Add square to interrupted cooldowns list so the second animation is not cancelled early
    interruptedCooldowns.push(square);
    console.log(interruptedCooldowns);
});
