var AvalonGame = function(){
	this.players = [];
	this.board = new AvalonBoard();
	this.phase;
	this.begun = false;
    this.numOfPlayers;
	this.currentTurn;

    //King picking who is on quest
    this.playerNumberOfCurrentKing;
    this.playersOnQuest = [];

    //Player Voting on who is on the quest
    this.numOfAcceptQuestPlayers;
    this.playerVotesOnQuestMembers = [];
    this.numOfVotes = 0;

    //Quest Outcome voting
    this.numOfPlayersVoted;
    this.failedVotes;
    this.questSuccess;

	//Create a new Game. Initialize players and a board.
	this.initialize = function(){
//		this.phase = PHASE_PREGAME;
		this.board = new AvalonBoard();
		this.players = [];
	} 
	
	//Begin the actual game.
	//This means having players draw the correct amount of tiles
	//as well as choosing whose turn it is
	this.newgame = function(playerList){
        this.currentTurn = 0;

        var numOfPlayers = playerList.length
        this.numOfPlayers = numOfPlayers;

        //Setup board
		this.board.newBoard(numOfPlayers);


        var roleCards = []
        for(var l = 0; l < numOfPlayers; l++){
            if(l < this.board.numOfEnemies){
                roleCards[l] = new EnemyCard()
            }
            else{
                roleCards[l] = new AllyCard()
            }
        }
        // shuffles the role cards
        var k;
        for( var j = 0; j < numOfPlayers; j++){
            k = Math.floor( Math.random() * numOfPlayers );
            var tempCard = roleCards[k];
            roleCards[k] = roleCards[j];
            roleCards[j] = tempCard;
        }

        //Having this stored client side is very easily hackable. Cheating is super easy!
        for(var i = 0; i < numOfPlayers ; i++){
            this.players[i] = new AvalonPlayer(roleCards[i],playerList[i]);
        }

        this.assignKing()

		this.begun = true;
	}
	
	//Convert the game state into a json
	this.tojson = function(){
        var data = {
            'currentTurn': this.currentTurn,
            'numOfPlayers': this.numOfPlayers,
            'playerNumberOfCurrentKing': this.playerNumberOfCurrentKing,
            'board': this.board.tojson(),
            'players': this.playersToJson(this.players)
        }
		return data
	} 
	
	//Convert a json file into the current game state.
	this.fromjson = function( data ){ 
		this.initialize();
        this.currentTurn = (data['currentTurn']);
        this.numOfPlayers = (data['numOfPlayers']);
        this.playerNumberOfCurrentKing = (data["playerNumberOfCurrentKing"]);
        this.board.newBoard(this.numOfPlayers);
        this.jsonToPlayers(data['players'])
	}
	
	//Convert the game state into readable html
	this.tohtml = function(){ 
		var output = "<h1>Game State: </h1>";
		output += this.board.tohtml();
        output += "<h3>Players</h3>";
		for( var k = 0; k < this.players.length; k++ ){
			output += this.players[k].tohtml();
		}
		return output;
	}

    //These would server better as static functions.
    this.playersToJson = function(players){
        var playersData = []
        for(var i = 0; i < this.numOfPlayers; i++){
            playersData[i] = players[i].tojson()
        }
        return playersData
    }

	this.jsonToPlayers = function(playersJson){
        var roleCard
        for(var i = 0; i < this.numOfPlayers ; i++){
            if(playersJson[i]['roleCard']['isEnemy']){
                roleCard = new EnemyCard
            }
            else{
                roleCard = new AllyCard()
            }
            this.players[i] = new AvalonPlayer(roleCard,playersJson[i]['playerId']);
            this.players[i].actions = playersJson[i].actions
        }
    }
	/************************
	* Gameplay API Section  *
	************************/

    this.resetActions = function(){
        for(var i = 0; i < this.numOfPlayers; i++) {
            this.players[i].resetActions();
        }
    }

    this.assignKing = function(){
        //For starting case assign king to be first player
        var playerNumberOfCurrentKing = this.playerNumberOfCurrentKing

        if(this.playerNumberOfCurrentKing == undefined ){
            playerNumberOfCurrentKing = 0
            this.players[playerNumberOfCurrentKing].activateKing()
        }
        else{
            this.players[playerNumberOfCurrentKing].deactivateKing();
            playerNumberOfCurrentKing++;
            playerNumberOfCurrentKing = playerNumberOfCurrentKing % this.numOfPlayers;
            this.players[playerNumberOfCurrentKing].activateKing()

        }
        this.playerNumberOfCurrentKing = playerNumberOfCurrentKing

        //Everytime a king is assigned, you reset who is on the quest
        this.playersOnQuest = [];
    }

	// Returns a list of possible actions the given player may perform
	// player should be a number between 0 and 3
	this.GetPossibleActions = function(player){ 
		if( player == undefined ){ 
			var actions = this.players[this.interactivePlayer].actions;
			var history = this.players[this.interactivePlayer].history;
		}
		else{

			var actions = this.players[player].actions;
			var history = this.players[player].history;
		}

		return actions;
	}
	
	// Pick a player to go on your quest.
	this.pickPlayerForQuest = function(player){
        //See if we need more players on our quest
        if(this.playersOnQuest.length < this.board.neededVotesToPass[this.currentTurn]  ){
            //For now this is all mocked out. It will automatically pick player 2 and 3
            this.assignPlayerToQuest(this.players[1].playerId)
            this.assignPlayerToQuest(this.players[2].playerId)
        }
        if(this.playersOnQuest.length == this.board.neededVotesToPass[this.currentTurn]){
            //Say king has picked someone
            console.log("picking someone")
            this.players[this.playerNumberOfCurrentKing].activateSubmitPlayersOnQuest()
            console.log(this.players[this.playerNumberOfCurrentKing])
        }
	}
	this.assignPlayerToQuest = function(playerId){
        var index = this.findPlayerIndexInArray(playerId,this.players)

        var player = this.players[index]
        player.assignToQuest()
        this.playersOnQuest.push(player)
    }

    this.removePlayerFromQuest = function(playerId){
        if(this.playersOnQuest.length > 0){
          var index = this.findPlayerIndexInArray(playerId,this.playersOnQuest)
          this.playersOnQuest.splice(index,1)
        }
        this.players[this.playerNumberOfCurrentKing].deactivateSubmitPlayersOnQuest()
    }

    this.findPlayerIndexInArray = function(playerId,arrayOfPlayers){
        var index = 0;
        for(var playerKey in arrayOfPlayers){
            var player = arrayOfPlayers[playerKey]

            if(player.playerId == playerId){
                return index;
            }
            index++;
        }
    }

    this.activateQuestPlayerVoting = function(){
        this.numOfAcceptQuestPlayers = 0;
        this.numOfVotes = 0;
        for(var playerKey in this.players){
            this.players[playerKey].activateVoteForQuestPlayers()
        }
    }

    this.playerAcceptQuest = function(player){
        this.numOfAcceptQuestPlayers++
        this.playerVotesOnQuestMembers[player] = true
        this.numOfVotes++
        if(this.numOfVotes == this.numOfPlayers && this.numOfAcceptQuestPlayers >= Math.ceil(this.numOfPlayers/2)){
            return true;
        }
        else if(this.numOfVotes == this.numOfPlayers && this.numOfAcceptQuestPlayers < Math.ceil(this.numOfPlayers/2)){
            return false
        }
    }

    this.playerRejectQuest = function(player){
        this.playerVotesOnQuestMembers[player] = false
        this.numOfVotes++
        if(this.numOfVotes == this.numOfPlayers && this.numOfAcceptQuestPlayers >= Math.ceil(this.numOfPlayers/2)){
            return true;
        }
        else if(this.numOfVotes == this.numOfPlayers && this.numOfAcceptQuestPlayers < Math.ceil(this.numOfPlayers/2)){
            return false
        }
    }

    this.activateQuestVoting = function(){
        this.questSuccess = true;
        this.numOfPlayersVoted = 0;
        this.failedVotes = 0;
        for(playerKey in this.players){
            this.players[playerKey].resetActions()
        }
        for(playerQuestKey in this.playersOnQuest){
            this.playersOnQuest[playerQuestKey].activateQuestVoting();
        }
    }

    this.questOutcomeVote = function(vote){
        if(this.numOfPlayersVoted < this.playersOnQuest.length){
            this.numOfPlayersVoted++;
            if(vote == 'fail'){
                failedVotes++;
                if(this.currentTurn == 3 && this.board.twoNeededOnFourth && failedVotes == 2){
                    this.questSuccess = false;
                }
                if(!this.board.twoNeededOnFourth){
                    this.questSuccess = false;
                }
            }
        }
        if(this.numOfPlayersVoted >= this.playersOnQuest.length){
            this.continueToNextTurn()
        }

    }
    this.continueToNextTurn = function(){
        if(this.questSuccess){
            this.board.turnSuccess(this.currentTurn);
        }
        else{
            this.board.turnFailure(this.currentTurn);
        }

        var gameOverStatus = board.isGameOverStatus();
        if(gameOverStatus != undefined){
            if(gameOverStatus){
                console.log("good guys won. do something")
            }
            else{
                console.log("bad guys won. do somethin")
            }
        }
        this.resetActions();
        this.currentTurn++;
        this.assignKing();

    }
}
