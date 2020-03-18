
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
    position: "start",
    orientation: extractGameInfoFromURL().side,
    onDrop: onDrop
}

//Define cooldown time
const cooldown = 5;

//Create new chess board object
var board = Chessboard("board", config);

//get button on the page
var cooldownBtn = document.getElementById("cooldown");


function displayCooldown(square, cooldown) {
    //Finds the div with the class name that contains the specific sqaure with a regex like statement
    //style.cssText - to change multiple styles at once

    //Locate the sqaure
    var squareDiv = document.querySelectorAll('div[class*="square-' + square + '"]')[0];
    //Set animation time to the cooldown time
    squareDiv.style.transition = "background-position " + cooldown + "s linear";
    //Start moving the background
    squareDiv.style.backgroundPosition = "left bottom";
    setTimeout(function () {
        //After the animation is completed, set animation speed to 0 and return to original position
        squareDiv.style.transition = "background-position 0s linear";
        squareDiv.style.backgroundPosition = "left top";
    }, cooldown * 1000);
}

//Events
function onDrop(source, target, piece, newPos, oldPos, orientation) {
    //emit message to server
    socket.emit("startMove", {gameID: extractGameInfoFromURL().gameID, source: source, target: target, piece: piece, side: orientation});
}

//Listener for button click
cooldownBtn.addEventListener("click", function () {
    displayCooldown("e4", cooldown);
    console.log(socket.id);
});