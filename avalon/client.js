

module.exports = function(){
    return{
        gameFunctionHandlers:{},
        initialize:function(){
            this.gameFunctionHandlers = {};
            this.addGameFunction( "pickPlayer", function(game, origin, eventdata ){
                var pn = game.getPlayerNumber( origin );

                console.log("Drawing tile")
                game.pickPlayerForQuest( pn );

                actions = game.GetPossibleActions(pn);

                return actions;
            } );

            this.addGameFunction( "submitQuest", function(game, origin, eventdata ){
                var pn = game.getPlayerNumber( origin );
                game.activateQuestPlayerVoting();
                actions = game.GetPossibleActions(pn);

                return actions;
            } );

            this.addGameFunction( "acceptPlayers", function(game, origin, eventdata ){
                var pn = game.getPlayerNumber( origin );
                console.log(pn +" has accepted ")
                var result = game.playerAcceptQuest(pn)
                if(result == true){
                    console.log("vote passed, continuing with quest")
                    game.activateQuestVoting();
                }
                else if(result == false){
                    console.log("vote failed, redoing players")
                    game.resetActions();
                    game.assignKing()
                }
                //game.EndTurn( pn );
                actions = game.GetPossibleActions(pn);
                console.log(actions)
                return actions;
            } );

            this.addGameFunction( "rejectPlayers", function(game, origin, eventdata ){
                var pn = game.getPlayerNumber( origin );
                console.log(pn +" has rejected ")
                var result = game.playerRejectQuest(pn)
                if(result == true){
                    console.log("vote passed, continuing with quest")
                    game.activateQuestVoting();
                }
                else if(result == false){
                    console.log("vote failed, redoing players")
                    game.resetActions();
                    game.assignKing()
                }
                //game.EndTurn( pn );
                actions = game.GetPossibleActions(pn);
                console.log(actions)
                return actions;
            } );


            this.addGameFunction( "questVote", function(game, origin, eventData ){
                var pn = game.getPlayerNumber( origin );
                console.log(eventData['vote'])

                game.questOutcomeVote(eventData['vote'])

                actions = game.GetPossibleActions(pn);
                console.log(actions)
                return actions;
            } );

            this.addGameFunction( "initial sync", function(game, origin, eventdata ){

                //Everyone syncs. It gets rid of the weird one person off error.
                console.log("getting synced")
                console.log(eventdata)
                game.fromjson( eventdata );
                $("#debug").html( "Game ready and synced!" );
                $("#debug").append( "<p>PlayerNumber: " + playerNumber + "</p>");
                readyFlag = true;

                $("#display").html( game.tohtml() );
                actions = game.GetPossibleActions(pn);
                return actions;
            } );
        },
        addGameFunction:function(eventname,func){

            if( this.gameFunctionHandlers[ eventname ] === undefined ) {
                this.gameFunctionHandlers[ eventname ] = [];
            }
            this.gameFunctionHandlers[ eventname ].push( func );
        },
        handleGameEvent:function(data){
            var handlers = this.gameFunctionHandlers[data['name']]
            for( var x in handlers ){
               return handlers[x](data['game'],data['sessionId'], data['event']);
            }
        }

    }
}




