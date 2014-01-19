var AvalonBoard = function(){
	this.numOfPlayers;
    this.numOfEnemies;
    this.neededVotesToPass;
    this.twoNeededOnFourth;
    this.quests = [];
    this.questsSucceeded;
    this.questsFailed;
    this.rules = {5:{"numOfEnemies":2,neededVotesToPass:[2,3,2,3,3]},
        6:{"numOfEnemies":2,neededVotesToPass:[2,3,4,3,4]},
        7:{"numOfEnemies":3,neededVotesToPass:[2,3,3,4,4], twoNeededOnFourth:true},
        8:{"numOfEnemies":3,neededVotesToPass:[3,4,4,5,5], twoNeededOnFourth:true},
        9:{"numOfEnemies":3,neededVotesToPass:[3,4,4,5,5], twoNeededOnFourth:true},
        10:{"numOfEnemies":4,neededVotesToPass:[3,4,4,5,5], twoNeededOnFourth:true}
    }

    //Create a new board. Create a complete set of tiles and put them
	// in the fresh tiles array
	this.newBoard = function(numOfPlayers){
		var rules = this.rules[numOfPlayers]
		this.numOfPlayers = numOfPlayers
        this.numOfEnemies = rules.numOfEnemies
        this.neededVotesToPass = rules.neededVotesToPass;
        this.twoNeededOnFourth = rules.twoNeededOnFourth
        this.questsSucceeded = 0;
        this.questsFailed = 0;
	}

    this.turnSuccess = function(currentTurn){
        this.quests[currentTurn] = true;
        this.questsSucceeded++;
    }
    this.turnFailure = function(currentTurn){
        this.quests[currentTurn] = false;
        this.questsFailed++;
    }

    this.isGameOverStatus = function(){
        if(questsSucceeded >= 3){
            return true;
        }
        else if(questsFailed >= 3){
            return false;
        }

        return undefined;
    }

	//Convert the state of the board into a json
	this.tojson = function(){ 
		var data = { 
			'numOfEnemeis' : this.numOfPlayers,
            'numOfPlayers' : this.numOfEnemies,
            'neededVotesToPass' : this.neededVotesToPass,
            'twoNeededOnFourth' : this.twoNeededOnFourth,
            'quests' : this.quests
        }
		return data;
	}	
	//Read a json and be able to recreate a boards state
	this.fromjson = function(data){ 

	}
	//Convert board state into readable html.
	this.tohtml = function(){ 
		var shtml = "<h1>Board</h1>";
		for( var x in this.quests ){
			shtml += "<h5>Quest: " + x + "is a "
            if(this.quests[x]){
                shtml += "success"
            }
            else{
                shtml += "failure"
            }
		}

		return shtml;
	}
}

