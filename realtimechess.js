//Import chess.js module
const { Chess } = require("chess.js");

//Real time chess class
class RealTimeChess {

    constructor() {
        //Composition: create new chess object
        this.chess = new Chess();
        //Create blank dictionary to keep track of cooldowns
        this.cooldownList = {};
    }

    addPieceCooldown(square, piece) {
        //add sqaure to cooldown with corresponding piece
        this.cooldownList[square] = piece;
        console.log(this.cooldownList);
    }

    removePieceCooldown(square, piece) {
        //check the cooldown exists
        var cooldownPiece = this.queryPieceCooldown(square);
        if (this.queryPieceCooldown(square) == piece) {
            //remove the piece
            delete this.cooldownList[square]
        }
        console.log(this.cooldownList);
    }

    queryPieceCooldown(square) {
        if (Object.keys(this.cooldownList).includes(square)) {
            return this.cooldownList[square];
        } else {
            return false;
        }
    }


    evalMove(source, piece, target) {
        try {
            //get piece type and colour that was moved
            var pieceColour = piece.charAt(0);
            var pieceType = piece.charAt(1);

            //Perform checks before evaluating move

            //Firtly check if the piece is on cooldown
            if (this.queryPieceCooldown(source) != false) {
                return false;
            }

            //Check that if a pawn is about to move forward that another piece is not about to take the square
            if (pieceType.toLowerCase() == "p" && source.charAt(0) == target.charAt(0) &&
                this.queryPieceCooldown(target) != false) {
                //A pawn is about to move forward and capture a piece illegally, return false
                return false;
            }

            //Check that the target square isn't being travelled to by a friendly piece
            var targetPiece = this.queryPieceCooldown(target); 
            if (targetPiece != false) {
                if (pieceColour == targetPiece.charAt(0)) {
                    //The piece on cooldown on target is friendly and is potentially travelling to sqaure, return false
                    return false;
                }
            }
            
            
            //check if piece is king 
            if (pieceType == "K") {
                //Check its a valid king move
                //Create a blank board to test that the king is only moving one square
                var blankBoard = new Chess();
                blankBoard.clear();
                //Place white king on sqaure
                blankBoard.put({type: "k", color: "w"}, source);
                //Attempt move
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
                            //Check that if the piece captured was on cooldown
                            if (this.queryPieceCooldown(target, piece) != false) {
                                //return second value as true to indicate a cooldown has been interrupted
                                return {legal: true, interrupt: true};
                            } else {
                                return {legal: true, interrupt: false};
                            }

                        } else {
                            //The piece on sqaure has same colour
                            return {legal: false};
                        }
                    } else {
                        //No piece on valid square
                        return {legal: true, interrupt: false};
                    }
                } else {
                    //Not a valid sqaure for king
                    return {legal: false};
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
                var valid; //Stores the evaluation of current iteration
                var validMoveFound; //A flag that can be used at end of loop to determine if legal move was found
                var kingSquare = null;

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

                //Check that you are not moving through your own king
                if (pieceType.toLowerCase() != "p") {
                    var kingTestBoard = new Chess();    
                    kingTestBoard.clear();
                    kingTestBoard.put({type: "k", color:pieceColour}, kingSquare);
                    kingTestBoard.put({type: pieceType.toLowerCase(), color: pieceColour}, source);
                    if (pieceColour == "w") {
                        //use regular expressions to locate part of string containing the turn
                        kingTestBoard.load(kingTestBoard.fen().replace(/ [wb] /, " w "));
                    } else {
                        kingTestBoard.load(kingTestBoard.fen().replace(/ [wb] /, " b "));
                    }
                    valid = kingTestBoard.move({from: source, to: target, promotion:"q"});
                    if (valid) {
                    } else {
                        console.log("illegal");
                        console.log(kingTestBoard.ascii());
                        return {legal: false};
                    }
                } else if (target == kingSquare){
                    return {legal: false};
                }

                //Check king exists
                if (kingSquare != null) {
                    //Remove king to evaulate the move
                    currentBoard.remove(kingSquare);
                }

                //If king not found, it must be in flight
            
                
                //Loop over blank pieces to find safe square - must use seperate loop as king must be removed
                //before placing another king to test for safe squares
                columns.forEach(function(column) {
                    var row = 1;
                    for (row; row <=8; row++) {
                        //get piece on current sqaure
                        var currentSquare = column + row.toString();
                        var currentPiece = currentBoard.get(currentSquare);
                        //check if there is piece on square 
                        if (!(currentPiece != null)) {
                            //Place king on square
                            currentBoard.put({type: "k", color: pieceColour}, currentSquare);
                            //Check if king is in check
                            if (!(currentBoard.in_check())) {
                                //Check if move is valid
                                valid = currentBoard.move({from: source, to: target, promotion: "q"});
                                //If valid break
                                if (valid != null) {
                                    validMoveFound = true;
                                    break;
                                }
                            }

                            //Remove king to try again next iteration
                            currentBoard.remove(currentSquare);
                        }
                    }
                }); 
                //Check if the move was legal
                //If there was no sqaure the king could be where the move was legal it is safe to assume its illegal
                if (validMoveFound == true) {
                    var returnObject = {legal: true};
                    //check if a special move was made
                    var row = target.charAt(1);
                    if (pieceType.toLowerCase() == "p") {
                        if ((pieceColour == "w" && row == "8") || (pieceColour == "b" && row == "1")) {
                            returnObject.special = "p";
                            //Create new board with same position
                            var specialPosition = new Chess(this.getPosition());
                            specialPosition.put({type: "q", color: pieceColour}, target);
                            specialPosition.remove(source);
                            returnObject.specialPosition = specialPosition.fen();
                        }
                    }
                    //Check that if the piece captured was on cooldown
                    if (this.queryPieceCooldown(target, piece) != false) {
                        returnObject.interrupt = true
                    } else {
                        returnObject.interrupt = false
                    }

                    return returnObject;

                } else {
                    return {legal: false};
                }      
            }
        } catch(error) {
            console.log("An error occured whilst evaluating the move: ");
            console.log(error);
            return {legal: false};
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
    }

    getPosition() {
        return this.chess.fen();
    }
}

//Export the GameManager Class
module.exports = RealTimeChess;