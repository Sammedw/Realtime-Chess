//Create new board object
var board = Chessboard('board');

//get button on the page
var cooldownBtn = document.getElementById("cooldown");

//Listener for button click
cooldownBtn.addEventListener("click", function () {
    //Finds the div with the class name that contains the specific sqaure with a regex like statement
    //style.cssText
    //locate sqaure
    var b8 = document.querySelectorAll('div[class*="square-b8"]')[0];
    b8.style.backgroundPosition = "left bottom";

    b8.style.backgroundPosition = "left top";
    
});