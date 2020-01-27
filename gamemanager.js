
class GameManager {

    constructor() {
        //Create blank object for games
        this.games = {};
        //Blank queue of users
        this.queue = [];
    }

    //Return list of games
    getGames() {
        return this.games;
    }

    //Return list of waiting players
    getPlayerQueue() {
        return this.queue;
    }

    //Adds given player to queue
    addPlayerToQueue(player) {
        //Check if player is not already in the queue
        if (!(this.queue.includes(player))) {
            //Add player to queue
            this.queue.push(player);
        }
    }

    //Attempts to create new game using players in queue, returns the game ID or False if there are not enough players in queue
    createNewGame() {
        if (this.queue.length >= 2) {
            //gameID is the number of current games +1 - Can be replaced later with better ID generation
            var gameID = Object.keys(this.games).length + 1;
            //Get players from queue
            var white = this.queue.shift();
            var black = this.queue.shift();
            //Create new game object
            var newGame = { "white": white, "black": black };
            //Add new game to the games list
            this.games[gameID] = newGame;
            return gameID
        } else {
            return false;
        }
       
    }

    //Returns true if a given gameID exists
    doesGameExist(gameID) {
        if (Object.keys(this.games).includes(gameID)) {
            return True;
        } else {
            return False;
        }
    }

    //Get the player IDs given a game ID, else return false
    getGamePlayers(gameID) {
        //Check if the game exists
        let extractPlayers = ({ white, black }) => ({ white, black });
        return extractPlayers(this.games[gameID]);
    }

}

//Export the GameManager Class
module.exports = GameManager;