/*
    Use this class to manage the client-side communication with the node/socket.io server.
 */

/***********************
* Game Client API Code  *
***********************/
// Replace this code with the below for testing use
var socket = io.connect('http://localhost');
// The following should be used in production mode
//var socket = io.connect("http://jsavalon.herokuapp.com");
var sessionId;
var playerInfo;
var playerVec = [];
var nameVec = [];
var playerNumber;
var actions = [];
var startFlag = false;
var readyFlag = false;
var playerCanDiscard = false;


//On connection. The client will remember his socketId or his unique player Id.
socket.on( "connection", function(id){ 
	sessionId = id;
});


/**********************
* API Variables               *
**********************/

// Current gameroom the player is in (for references only)
var currentRoom;

/**********************
* Gameroom functions     *
**********************/

// Game rooms (just rooms) are where games happen and exist in the during-game
// player can be the token or the ip address.
// if no roomid is specified, the server puts the player into the a game randomly

//Socket IO communication. These are for sending messages up to the server about joining or leaving.

//Fired when user clicks Join Room button.
function RoomSelection(){
//    alert($("#roomoptions").val());
    var roomName = ""
    if($("#roomname").val() !== ""){
        roomName = $("#roomname").val()

    }
    else{
        roomName = $("#roomoptions").val()
    }
    var playerName = $("#displayname").val()
    var joinData = {
        "roomName" : roomName,
        'playerName' : playerName
    }
    JoinRoom(joinData);
    $("#dialog").dialog("close");
}

function JoinRoom( data ){
	socket.emit( "join room up", data, function( result ){});
}

function LeaveRoom( room ){ 
	var aRoom;
	if( room == undefined )
		aRoom = currentRoom;
	else
		aRoom = room;
	socket.emit( "left room up", { 'sessionId': sessionId, 'roomId': aRoom } );
}

//Socket io listeners. If we receive info from the server, handle it here.
socket.on("connection down",function(rooms){
     roomList = rooms;
    console.log(roomList);
    console.log("unmasking");
    $("body").unmask();

    $("#dialog").dialog();
    for(var room in rooms){
           var option = $("<option></option>");
           option.val(room);
           option.attr("data-format",room);
           option.text("Room " + room + " " + rooms[room].length + "/10");
           $("#dialog #roomoptions").append(option);
    }
});


function SendChat(){
    PlayerChat($("#chatbox").val());
    $("#chatbox").val("");
}

function requestRefresh(){
    socket.emit("refresh up");
}
socket.on("refresh down", function(rooms){
    if($(".ui-dialog").css('display') !==  'none'){
            document.getElementById("roomoptions").options.length = 0;
                    $("#dialog").dialog();
                    for(var room in rooms){
                          var option = $("<option></option>");
                          option.val(room);
                          option.attr("data-format",room);
                          option.text("Room " + room + " " + rooms[room].length + "/10");
                          $("#dialog #roomoptions").append(option);
                        }
        }
});
socket.on( "join room down", function( roomdata ){
	currentRoom = roomdata['roomId'];
    var name;
    console.log(roomdata)
    if(roomdata['host'] == sessionId){
        var numOfPlayers = $("#numOfPlayers").html().split("/")[0]
        if(!numOfPlayers){
            numOfPlayers = 0
        }
        numOfPlayers++;
        if(numOfPlayers >= 5 ){
            $("#startgame").show();
        }
        playerVec.push(roomdata['sessionId']);
        $("#numOfPlayers").html(numOfPlayers+"/10 in room");
    }
    nameVec = roomdata['chatRoom'];
    console.log(name);
    if( roomdata['sessionId'] == sessionId ){
        $("#chat").append( "<p>you have joined " + roomdata['name'] + "</p>" );
        $("#startgame").hide();
        $("#quitgame").show();
        //game.playerJoined();
    }
    else{
        $("#chat").append( "<p>" + roomdata['name'] + " has joined Room: " + roomdata['roomId'] + "</p>" );
    }
} );

socket.on( "left room down", function( data ){
	// TODO: let the player know he has joined a game
	currentRoom = undefined;
    if( data['sessionId'] == sessionId ){
        $("#chat").append( "<p>you have left " + data['roomId'] + "</p>" );
        $("#joingame").show();
        $("#quitgame").hide();
    }
    else
        $("#chat").append( "<p>" + data['sessionId'] + " has left " + data['roomId'] + "</p>" );

} );

/**********************
* Game Starting       *
 * On game starting. Send which room to start and receive the note from the server.
**********************/

//Fired when host clicks start game
function StartGame( room ){
	var middle;
	if( room == undefined ){
        middle = { 'roomId': currentRoom };
    }
	else{
        middle = { 'roomId': room };
    }
	socket.emit( 'start game up', middle );
}

//Receive info from the server.
socket.on( "start game down", function( data ){
   console.log("we good, we're the host")
    console.log(data)
    playerInfo = data;
    var actions = {'questAssign' : true}
    console.log("asdfasdf")
    $("#drawtile").show();
    graphics.board.actionsDraw();

} );

socket.on("request start game down", function(data){
   console.log("Request for info from server")
    var playerInfo = {'playerId' : sessionId}
    socket.emit( 'request game info start up', playerInfo );

} );

socket.on("request game info start down", function(data){
    console.log(data)
    playerInfo = data;
})

socket.on("request actions down", function(data){
    console.log(data)
    ManageUI(data)
})

/**********************
 * Event Handling *
 **********************/

//Trigger an event. Notify the server of this event.
function FireEvent( name, event ){
    var middle =  {
        'sessionId': sessionId,
        'name': name,
        'event': event,
        'roomId': currentRoom
    };
    socket.emit( "game event up", middle, function( result ){
    } );
}

//Receive an event from the server. Take the name and execute event.
socket.on("game event down", function(data){
	// TODO: handle the null case when there are no event handlers
    console.log("received game event")
    if(data['actions']){
        console.log("showing actions")
        ManageUI(data['actions'])
    }
    else{
        console.log("need to query actions from server")
        var playerInfo = {'playerId' : sessionId}
        socket.emit( 'request actions up', playerInfo );

    }

} );


/**********************
 * Chat functions              *
 **********************/
// if no receiver is specified, the message is delivered to the channel or room the player is in
function PlayerChat( message ){
    socket.emit( "chat up", { 'sessionId': sessionId, 'message': message} );
}

socket.on( "chat down", function( username,data ){
    $('#chat').append('<b>'+'Player ' + parseInt(playerVec.indexOf(username)+1) + ':</b> ' + data + '<br>');
});

function ManageUI ( actions ){
    console.log("managing UI")
    console.log(actions);

    if( actions["waiting"]){
        graphics.board.actionsWait();
    }
    if( actions['questAssign'] == true ){
        console.log("asdfasdf")
        $("#drawtile").show();
        graphics.board.actionsDraw();
    }
    if( actions['submitPlayersOnQuest'] == true ){
        console.log("submit players")
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
