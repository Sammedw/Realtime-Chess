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

    addPieceCooldown(square) {
        //add sqaure to cooldown with corresponding piece
        this.cooldownList.push(square);
    }

    removePieceCooldown(square) {
        //check the cooldown exists
        if (this.queryPieceCooldown(square) == true) {
            //get index of piece in list
            var index = this.cooldownList.indexOf(square);
            //remove the piece
            this.cooldownList.splice(index, 1);
        }
    }

    queryPieceCooldown(square) {
        console.log(square);
        console.log(this.cooldownList);
        if (this.cooldownList.includes(square)) {
            console.log("On cooldown NOPE");
            return true;
        } else {
            return false;
        }
    }


    evalMove(source, piece, target) {
        //Firtly check if the piece is on cooldown
        if (this.queryPieceCooldown(source, piece) == true) {
            return false;
        }
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
            var kingSquare;

            //Loop through pieces on board to locate king
            const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];
            columns.forEach(function(column) {
                var row = 1;
                for (row; row <=8; row++) {
                    //get piece on current sqaure
                    var currentSquare = column + row.toString();
                    var currentPiece = currentBoard.get(currentSquare); 
                    //check if there is piece on square 
                    if (currentPiece != null) {
                        //Check if the currentPiece is king and the same colour
                        if (currentPiece.type == "k" && currentPiece.color == pieceColour) {
                           kingSquare = currentSquare;
                           break;
                        }
                    }  
                }
            });  

            //Remove king to evaulate the move
            var king = currentBoard.remove(kingSquare);
            
            //Loop over blank pieces to find safe square - must use seperate loop as king must be removed
            //before placing another king to test for safe squares
            columns.forEach(function(column) {
                var row = 1;
                for (row; row <=8; row++) {
                    //get piece on current sqaure
                    var currentSquare = column + row.toString();
                    var currentPiece = currentBoard.get(currentSquare);
                    //check if there is piece on square 
                    if (currentPiece == null) {
                        //Place king on square
                        currentBoard.put(king, currentSquare);
                        //Check if king is in check
                        if (!(currentBoard.in_check())) {
                            //If not break
                            break;
                        } else {
                            //If so, remove king and try next square
                            currentBoard.remove(currentSquare);
                        }
                    }
                }
            }); 
            
            //Check if move is valid
            valid = currentBoard.move({from: source, to: target});

            //Return true if the move was valid
            if (valid != null) {
                return true;
            } else {
                return false;
            }
        }
    }

    removePiece(source, piece) {
        //remove piece from source sqaure
        //check that the correct piece is being removed
        var pieceOnSource = this.chess.get(source);
        if (piece.toLowerCase() == (pieceOnSource.color+pieceOnSource.type).toLowerCase()){
            this.chess.remove(source);
        }   
        
    }

    addPiece(target, piece) {
        //add piece to target sqaure
        this.chess.put({type: piece.charAt(1), color: piece.charAt(0)}, target);
        console.log(this.chess.ascii());
    }
}

//Export the GameManager Class
module.exports = RealTimeChess;