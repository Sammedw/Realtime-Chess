//Create new board object
var board = Chessboard("board", "start");

//get button on the page
var cooldownBtn = document.getElementById("cooldown");

//Listener for button click
cooldownBtn.addEventListener("click", function () {
    //Finds the div with the class name that contains the specific sqaure with a regex like statement
    //style.cssText - to change multiple styles at once

    var cooldown = 5;
    //Locate the sqaure - b8 in this prototype
    var b8 = document.querySelectorAll('div[class*="square-b8"]')[0];
    //Set animation time
    b8.style.transition = "background-position " + cooldown + "s linear";
    //Start moving the background
    b8.style.backgroundPosition = "left bottom"; 
    setTimeout(function () {
        //After the animation is completed, set animation speed to 0 and return to original position
        b8.style.transition = "background-position 0s linear";
        b8.style.backgroundPosition = "left top";
    }, cooldown * 1000);
    
    
});