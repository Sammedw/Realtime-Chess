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
                        //The piece on sqaure has same colour
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
            //Piece is not king
            //Get current chess position
            var currentChessPos = this.chess.fen();
            //Change the turn to player making move
            if (pieceColour == "w") {
                //use regular expressions to locate part of string containing the turn
                currentChessPos = currentChessPos.replace(/ [wb] /, " w ");
            } else {
                currentChessPos = currentChessPos.replace(/ [wb] /, " b ");
            }
            var currentBoard = new Chess(currentChessPos);
            var valid;
            //Loop through pieces on board to locate oppoments king
            ["a", "b", "c", "d", "e", "f", "g", "h"].forEach(function(column) {
                var row = 1;
                for (row; row <=8; row++) {
                    //get piece on current sqaure
                    var square = column + row.toString();
                    var currentPiece = currentBoard.get(square);  
                    //Check if the currentPiece is king and the opposite colour
                    if (currentPiece != null) {
                        if (currentPiece.type == "k" && currentPiece.color != pieceColour) {
                            //Remove opponents king to evaulate the move
                            currentBoard.remove(square);
                            //Check if move is valid
                            valid = currentBoard.move({from: source, to: target});
                            
                        }
                    }
                    
                }
            });

            //Return true if the move was valid
            if (valid != null) {
                return true;
            } else {
                return false;
            }
        }
    }

}

//Export the GameManager Class
module.exports = RealTimeChess;