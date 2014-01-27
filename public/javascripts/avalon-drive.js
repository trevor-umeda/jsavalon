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
* Game Server Events Down *
***************************/


/**************************
* JQuery Game UI                  *
***************************/
//THIS SECTION IS CURRENTLY UNUSED.
//WAS ORIGINALLY FOR HTML GAME UI
//NOW HAVE MOVED ON
$(document).ready( function(){
    $("#drawtile").hide();
    $("#discardtile").hide();
    $("#startgame").hide();
    $("#quitgame").hide();
    $("#endturn").hide();
} );

/**************************
* Helper Functions                   *
***************************/

//Everytime an action is called
//update the available actions and hide buttons.


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
