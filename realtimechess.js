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
        //check if piece is king 
    }

}