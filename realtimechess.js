//Import chess.js module
const { Chess } = require("chess.js");

//Real time chess class
class RealTimeChess {

    constructor() {
        //Composition: create new chess object
        this.chess = new Chess();
        //Create blank list to keep track of cooldowns
        this.cooldownList = [];
    }

    startMove(source, piece, target) {
        //get piece type and colour that was moved
        var pieceColour = piece.charAt(0);
        var pieceType = piece.charAt(1);
        //check if piece is king 
        if (pieceType == "K") {
            //Check its a valid king move
            //Create a blank board to test that the king is only moving one sqaure
            var blankBoard = new Chess();
            blankBoard.clear();
            //Place white king on sqaure
            blankBoard.put({type: "k", color: "w"}, source);
            //Change turn to current player making move
            var valid = blankBoard.move({from: source, to: target});
            //If it is a valid move, check that target piece is not one of their own
            if (valid != null) {
                //Get the piece on target sqaure
                var targetPiece = this.chess.get(target);
                //Check if target sqaure has piece on it
                if (targetPiece != null) {
                    //Check that target is not a piece of same colour
                    if (targetPiece.color != pieceColour) {
                        //The piece on valid sqaure has opposite colour
                        return true;
                    } else {
                        //The piece on swaure has same colour
                        return false;
                    }
                } else {
                    //No piece on valid square
                    return true;
                }
            } else {
                //Not a valid sqaure for king
                return false;
            }
            
        } else {
            return true;
        }
    }

}

//Export the GameManager Class
module.exports = RealTimeChess;