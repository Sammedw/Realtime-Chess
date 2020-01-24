
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

    addPlayerToQueue(player) {
        this.queue.push(player);
    }


}

//Export the GameManager Class
module.exports = GameManager;