/**************************
* Declarations                          *
***************************/
var game = new AvalonGame();
//Having playerVec and player array in Avalon Game object is redundant and dangerous
var playerVec = [];
var playerNumber;
var actions = [];
var startFlag = false;
var readyFlag = false;
var playerCanDiscard = false;
/**************************
* Mahjong Events Down          *
***************************/

//Events in the game, are self explanatory
//Most actions will find the originator of that action
//They will perform that action
//Then everyones available actoins will be updated

/////////////////////
AddGameFunction( "pickPlayer", function( origin, eventdata ){
	var pn = GetPlayerNumber( origin );

    console.log("Drawing tile")
	game.pickPlayerForQuest( pn );

	actions = game.GetPossibleActions(playerNumber);
	ManageUI(actions);
	
	$("#display").html( game.tohtml() );
} );

AddGameFunction( "submitQuest", function( origin, eventdata ){
	var pn = GetPlayerNumber( origin );
//	game.DiscardTile( pn, eventdata );
    game.activateQuestPlayerVoting();
	actions = game.GetPossibleActions(playerNumber);

	ManageUI(actions);
	$("#display").html( game.tohtml() );
} );

AddGameFunction( "acceptPlayers", function( origin, eventdata ){
	var pn = GetPlayerNumber( origin );
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
	actions = game.GetPossibleActions(playerNumber);
    console.log(actions)
	ManageUI(actions);
} );

AddGameFunction( "rejectPlayers", function( origin, eventdata ){
    var pn = GetPlayerNumber( origin );
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
    actions = game.GetPossibleActions(playerNumber);
    console.log(actions)
    ManageUI(actions);
} );


AddGameFunction( "questVote", function( origin, eventData ){
    var pn = GetPlayerNumber( origin );
    console.log(eventData['vote'])

    game.questOutcomeVote(eventData['vote'])

    actions = game.GetPossibleActions(playerNumber);
    console.log(actions)
    ManageUI(actions);
    $("#display").html( game.tohtml() );

} );

AddGameFunction( "pon", function( origin, eventdata ){ 
	var pn = GetPlayerNumber( origin );
	game.Pon( pn );
	actions = game.GetPossibleActions(playerNumber);
	ManageUI(actions);

	$("#display").html( game.tohtml() );

} );
AddGameFunction( "chi", function( origin, eventdata ){ 
	var pn = GetPlayerNumber( origin );
	game.Chi( pn );
	actions = game.GetPossibleActions(playerNumber);
	ManageUI(actions);

	$("#display").html( game.tohtml() );

} );

AddGameFunction("commitchi",function( origin,eventdata){
	var pn = GetPlayerNumber( origin );
	game.commitChi( pn,eventdata );
	actions = game.GetPossibleActions(playerNumber);
	ManageUI(actions);
	if(pn == playerNumber)
	{graphics.player.resetChiPick();}
	$("#display").html( game.tohtml() );
});
AddGameFunction( "kan", function( origin, eventdata ){ 
	var pn = GetPlayerNumber( origin );
	game.Kan( pn );
	actions = game.GetPossibleActions(playerNumber);
	ManageUI(actions);

	$("#display").html( game.tohtml() );

} );

AddGameFunction( "ron", function( origin, eventdata ){ 
	var pn = GetPlayerNumber( origin );
	game.Ron( pn );
	actions = game.GetPossibleActions(playerNumber);
	ManageUI(actions);
	alert("GAME IS OVER. Player "+ pn + " has won the game");
	$("#display").html( game.tohtml() );

} );
AddGameFunction( "initial sync", function( origin, eventdata ){ 
	
	//Everyone syncs. It gets rid of the weird one person off error.
    console.log("getting synced")
    console.log(eventdata)
    game.fromjson( eventdata );
	$("#debug").html( "Game ready and synced!" );
	$("#debug").append( "<p>PlayerNumber: " + playerNumber + "</p>");
	readyFlag = true;

	$("#display").html( game.tohtml() );
	actions = game.GetPossibleActions( playerNumber );
	ManageUI( actions );
	$("#debug").append( JSON.stringify( actions ) );
} );

/**************************
* Game Server Events Down *
***************************/

AddGameFunction( "join room down", function(data){
	if( data['sessionId'] == sessionId ){
		$("#chat").append( "<p>you have joined " + data['roomId'] + "</p>" );
		$("#startgame").hide();
		$("#quitgame").show();
		//game.playerJoined();
	}
	else{
        $("#chat").append( "<p>" + data['sessionId'] + " has joined " + data['roomId'] + "</p>" );
    }
    if(data['host'] == sessionId){
        var numOfPlayers = $("#numOfPlayers").html().split("/")[0]
        if(!numOfPlayers){
            numOfPlayers = 0
        }
        numOfPlayers++;
        if(numOfPlayers >= 5 ){
            $("#startgame").show()
        }
        playerVec.push(data['sessionId'])
        $("#numOfPlayers").html(numOfPlayers+"/10 in room");
    }
} );

AddGameFunction( "left room down", function(data){
	if( data['sessionId'] == sessionId ){
		$("#chat").append( "<p>you have left " + data['roomId'] + "</p>" );
		$("#joingame").show();
		$("#quitgame").hide();
	}
	else
		$("#chat").append( "<p>" + data['sessionId'] + " has left " + data['roomId'] + "</p>" );
	
} );

AddGameFunction( "room stat down", function(data){ 
	playerVec = data['people'];
	$("#roomstatus").html( "<h5>" + data['population'] + " people in room#" + data['roomId'] + "</h5>" );
	for( var k in playerVec )
		$("#roomstatus").append( "<p>" + playerVec[k] + "</p>" );

//	if( startFlag == false && playerVec.length == 4 )
//		StartGame();
} );

AddGameFunction( "start game down", function(data){ 
	startFlag = true;

    //Host should fire off sync. Meaning he shuffles deck and deals stuff out.

	for( var k in playerVec ){
        if( playerVec[k] == sessionId ){
            playerNumber = k;
        }
    }
    if(playerNumber == 0){
        game.newgame(playerVec);
        var gamestate = game.tojson();
        FireEvent( "initial sync", gamestate );
    }
} );

AddGameFunction( "end game down", function(data){ 
	// TODO: write this function
} );

/**************************
* JQuery Game UI                  *
***************************/
//THIS SECTION IS CURRENTLY UNUSED.
//WAS ORIGINALLY FOR HTML GAME UI
//NOW HAVE MOVED ON
$(document).ready( function(){ 
	ManageUI();
	$("#startgame").click( function(){
		StartGame();
	} );
	
	$("#quitgame").click( function(){ 
		LeaveRoom();
	} );
	
	$("#drawtile").click( function(){ 
		FireEvent("drawtile","-");

	} );
	
	$("#discardtile").submit( function(){ 
		FireEvent("discardtile",$("#tile").val());
	
		return false;
	} );
	
	$("#endturn").click( function(){ 

		FireEvent("endturn","-");

	} );
} );

/**************************
* Helper Functions                   *
***************************/

//Everytime an action is called
//update the available actions and hide buttons.
function ManageUI ( actions ){ 
	if( actions == undefined || readyFlag == false){ 
		$("#drawtile").hide();
		$("#discardtile").hide();
        $("#startgame").hide();
		$("#quitgame").hide();
		$("#endturn").hide();
		return;
	}
    if( actions["waiting"]){
        graphics.board.actionsWait();
    }
	if( actions['questAssign'] ){
        console.log("asdfasdf")
        $("#drawtile").show();
		graphics.board.actionsDraw();
    }
	if( actions['submitPlayersOnQuest'] ){
	    playerCanDiscard = true;
//		$("#drawtile").hide();
		$("#discardtile").show();
		graphics.board.actionsDiscard();
		}
	if( actions['memberVote'] ){
		$("#drawtile").hide();
		$("#discardtile").hide();
		$("#endturn").show();
		graphics.board.actionsMemberVote();
		}
	if(actions['questSuccessOrFail']){
		graphics.board.actionsQuestVote();
	}
	if(!actions['ron']){
		graphics.board.actionsDeactivateRon();
	}
	if( !(actions['endturn']) && !(actions['discard']) && !(actions['draw']))
		{
		$("#drawtile").hide();
		$("#discardtile").hide();
		$("#endturn").hide();
//		graphics.board.actionsInactive();

		}
	
}

//This section is self explanatory.
//The action fires a request to perform an action
////////////////////////////////////////////
function drawTile(){
	FireEvent("pickPlayer","-");
}
function discardTile(){
    FireEvent("submitQuest",graphics.player.returnTile());
}
function acceptPlayers(){
	FireEvent("acceptPlayers","-");
}
function rejectPlayers(){
    FireEvent("rejectPlayers","-")
}
function questSuccess(){
    FireEvent("questVote",{vote:"success"});
}
function questFail(){
    FireEvent("questVote",{vote:"fail"})
}
function pon(){
	FireEvent("pon","-");
}
function chi(){
	FireEvent("chi","-");
}
function commitChi(){
	FireEvent("commitchi", graphics.player.returnChiPick());
}
function kan(){
	FireEvent("kan","-");
}
function ron(){
	FireEvent("ron","-");
}

//A tile is picked. Set that as a picked tile graphically
function setPlayerPickTile(handId){
	
	if(game.playerChoosingChi())
	{	
	graphics.setChiPick(handId);	
	}
	 else{
	graphics.setPlayerPick(handId);
	}
}
//Get the playerId using serial id
function GetPlayerNumber( sId ){ 
	for( var x in playerVec ){ 
		if( playerVec[x] == sId )
			return x;
	}
	return false;
}
