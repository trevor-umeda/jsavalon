module.exports = function(isEnemy,playerId){
    return{
        isEnemy : isEnemy ,
        playerId : playerId,
        hand : undefined ,
        king : false,
        isOnQuest : false,
	    // manage the actions the player can do from the outside
        actions : {
            'waiting': true,
            'questAssign':false,
            'submitPlayersOnQuest':false,
            'memberVote':false,
            'questSuccessOrFail':false
        },

        resetActions : function(){
            for(action in this.actions){
                this.actions[action] = false;
            }
            this.actions["waiting"] = true;
        },

        activationFlags : {
            draw: 'true',
            discard: 'true'
        },

        activateKing : function(){
            this.king = true;
            this.actions['waiting'] = false;
            this.actions['questAssign'] = true;
            this.actions['memberVote'] = false;
            this.actions['submitPlayersOnQuest'] = false;
        },

        deactivateKing : function(){
            this.king = false;
            this.actions['waiting'] = true;
            this.actions['questAssign'] = false
            this.actions['memberVote'] = false;
            this.actions['submitPlayersOnQuest'] = false
        },

        assignToQuest : function(){
            this.isOnQuest = true;
        },

        deassignToQuest : function(){
            this.isOnQuest = false;
        },

        activateSubmitPlayersOnQuest : function(){
            this.actions['waiting'] = false;
            this.actions['submitPlayersOnQuest'] = true;
        },

        deactivateSubmitPlayersOnQuest : function(){
            this.actions['waiting'] = false;
            this.actions['submitPlayersOnQuest'] = false;
        },

        activateVoteForQuestPlayers : function(){
            this.actions['waiting'] = false;
            this.actions['submitPlayersOnQuest'] = false;
            this.actions['memberVote'] = true;
        },

        activateQuestVoting : function(){
            this.actions['questSuccessOrFail'] = true;
        },

        // call this function on the player's turn
        activate : function(){
            this.actions['draw'] = true;
            this.actions['discard'] = false;
            this.actions['endturn'] = false;
            //this.actions['pon'] = false;
            //this.actions['chi'] = false;
            //this.actions['openkan'] = false;
        },
        //It is not the players turn anymore.
        deactivate : function(){
            this.actions['endturn'] = false;
            this.actions['draw'] = false;
            this.actions['discard'] = false;
        },

        //Convert the player state into a json
        tojson : function(){
            var data = {
                'roleCard' : this.roleCard.tojson(),
                'playerId' : this.playerId,
                'actions' : this.actions
            };
            return data;
        },

        //Convert the json into the player state
        fromjson : function(data){
            this.hand = new MahjongHand();
            this.hand.fromjson(data['hand']);
            this.actions = data['actions'];
        },

        //Convert the player state into readable html
        tohtml : function(){
            var alliance;
            if(roleCard.isEnemy()){
                alliance = "Evil"
            }
            else{
                alliance = "Good"
            }
            result = "<h5>Player "+ playerId + " is " + alliance
            if(this.king){
                result += " and is King"
            }
            result += "</h5>"
            return result;
        }
    }
}

