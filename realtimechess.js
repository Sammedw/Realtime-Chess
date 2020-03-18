//Import chess.js module
const { Chess } = require("chess.js");

//Real time chess class
class RealTimeChess {

    constructor() {
        //Composition: create new chess object
        const chess = new Chess();
        //Create blank list to keep track of cooldowns
        this.cooldownList = [];
    }

    startMove(source, piece, target) {
        //get piece type that was moved
        var pieceType = piece.charAt(1);
        //check if piece is king 
        if (pieceType == "K") {
            console.log("King");
            return true;
        }
    }

}

//Export the GameManager Class
module.exports = RealTimeChess;