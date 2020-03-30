
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

//Create new board object
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

//get button on the page
var cooldownBtn = document.getElementById("cooldown");
var stopBtn = document.getElementById("stop");


function displayCooldown(square, cooldown) {
    //Finds the div with the class name that contains the specific sqaure with a regex like statement
    //style.cssText - to change multiple styles at once
    //Locate the sqaure
    var squareDiv = document.querySelectorAll('div[class*="square-' + square + '"]')[0];
    //Set animation time to the cooldown time
    squareDiv.style.transition = "background-position " + cooldown/1000 + "s linear";
    //Start moving the background
    squareDiv.style.backgroundPosition = "left bottom";
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

function removeCooldown(square) {
    //Locate the sqaure
    var squareDiv = document.querySelectorAll('div[class*="square-' + square + '"]')[0];
    squareDiv.style.transition = "background-position 0s linear";
    squareDiv.style.backgroundPosition = "left top";
}

//Events
function onDragStart(source, piece, pos, orientation) {
    //Check if player is moving their own pieces
    if (piece.charAt(0) != orientation.charAt(0)) {
        return false;     
    }
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {
    //emit message to server
    socket.emit("startMove", {gameID: extractGameInfoFromURL().gameID, source: source, target: target, piece: piece, side: orientation});
    return "snapback";
}


//Listen for moves approved by server
socket.on("startMoveResponse", function(data){
    if (data.special == true) {
        board.position(data.specialPosition.split(" ")[0]);
    } else {
        board.move(data.source + "-" + data.target);
    }
    
    setTimeout(function(sqaure) { onMoveEnd(sqaure)}, moveSpeed, data.target);
});

function onMoveEnd(square) {
    //display cooldown animation
    displayCooldown(square, cooldown);
}

//Listen for cooldown interruptions
socket.on("cooldownInterruption", function(square) {
    removeCooldown(square);
    interruptedCooldowns.push(square);
});


//Listener for button click
cooldownBtn.addEventListener("click", function () {
    displayCooldown("e4", cooldown);
});

//Listener for button click
stopBtn.addEventListener("click", function () {
    removeCooldown("e4");
});