/****************************

 Server Side Code

 ****************************/

/******************************
 * Module dependencies.                 *
 ******************************/
// http usage for external requests
var http = require('http');

// querystring for post formatting
var querystring = require("querystring");

// express web frame work
var express = require('express')

var app = module.exports = express.createServer();

// socket.io for server-client communication
var io = require('socket.io').listen(app);

//Game object.
var Game = require("./avalon/game.js");


/****************************
* Useful Constants                     *
*****************************/

var minPerRoom = 5;
var maxPerRoom = 10; // 0 means no limit
var maxPerChannel = 500; 
var PlayerCache = { };

/*******************************
* Express Server Setup                *
********************************/
// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
var port = process.env.PORT || 3000;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
console.log("Test");
app.get('/', function(req, res){
	var ip = req.connection.remoteAddress;
	res.render("avalon.jade", { title : "Avalon", content: "nothing yet" } );
}); // end app.get


app.get( "/avalon", function(req, res){
	res.render("avalon.jade", { title: "Avalon" } );
} );

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});


/****************************
* Room Models                               *
*****************************/



//The concept and logic for a game room is contained here.

var gamerooms = function(){ 
	this.rooms = {};
    this.games = {};
	this.players = {};
	this.roomCount = 0;
	this.FirstOpenRoom;
	this.NextRoomId;
	this.startFlags = {};

    //Initialization function for the rooms.
    this.initialize = function(){
    		this.rooms[1] = [];
    		this.FirstOpenRoom = 1;
    		this.NextRoomId = 2;
    	}

    //If the room hasn't started yet then mark it down as started.
	this.startGame = function(room){
		if( this.startFlags[room] )
			return false;
		else{
			this.startFlags[room] = true;
            var myGame = new Game();
            myGame.initialize();
            myGame.newgame(this.rooms[room]);
            this.games[room] = myGame;
			return myGame.players[0];
		}
	}

    //If the room is existing and started, then finish it. Otherwise leave it alone
	this.endGame = function(room){
		if( !this.startFlags[room] ){ 
			return false;
		}
		else{ 
			this.startFlags[room] = false;
			return true;
		}
	}
	//Return statistics on the room.
	this.roomStats = function( room ){
        console.log(this.rooms)
        console.log(room)
		if(this.rooms[room]){
            var statData = {
	    		'roomId': room,
		    	'population': this.rooms[room].length,
			    'people': this.rooms[room],
			    'started': this.startFlags[room]
		    };
        }
		return statData;
	}
    this.isRoomHost = function(player){
        for (var roomKey in this.rooms){
            console.log(roomKey)
            if(this.rooms[roomKey] && this.rooms[roomKey][0] == player){
                return roomKey
            }
        }
        return false
    }
    this.getGameFromRoom = function(room){
        return this.games[room];
    }
    this.getRoomHost = function(room){
        if(this.rooms[room]){
            return this.rooms[room][0]
        }
        return 0
    }
    //Find the room that a certain player is in.
	this.getRoom = function(player){
		var room = this.players[player]['roomId'];
		return room;
	}

    //Place a player into a room.
	this.joinRoom = function(player, room){
		var aRoom;

        //If a player is in a room, make him leave first.
		if( this.players[player] != undefined ){ 
			this.leaveRoom( player );
		}
        //If no room is entered, just use the first open room available
		if(room == undefined )
			aRoom = this.FirstOpenRoom;
		else
			aRoom = room;

        //Lazy initialize the room. Set it as open and not started
		if( this.rooms[aRoom] == undefined ){
			this.rooms[aRoom] = [];	
			this.startFlags[aRoom] = false;
		}

       //If the room is full though, put the player in a better one.
		if(this.rooms[aRoom].length == maxPerRoom)
			aRoom = this.FirstOpenRoom;

        //After everything is checked out alright, finally put the player into a room.
		this.rooms[aRoom].push( player );

        //Mark the player as being put in a room as well. Let him know which room and which number he is.
		this.players[player] = { 'roomId': aRoom, 'number': this.rooms[aRoom].length-1 };

        //If the room is full then be nice and create a new room.
		if(this.rooms[aRoom].length == maxPerRoom){ 
			this.createNewRoom();
		}

	}
    //Take the player and remove him from the room.
    this.leaveRoom = function(player){
    		if( this.players[player] == undefined )
    			return false;
        //Find which room the player was in and which number he was.
    		var room = this.players[player]['roomId'];
    		var number = this.players[player]['number'];
        //Remove the player from the room.
    		this.rooms[room].splice( number, 1 );
    		this.players[player] = undefined;
    		if( this.startFlags[room] == false )
    			this.FirstOpenRoom = room;
            if(this.rooms[room].length === 0)
                this.rooms[room] = undefined;
    		return room;
    	}

    //A new room is open, set it as the first open room.
	this.createNewRoom = function(){
		this.FirstOpenRoom = this.NextRoomId;
		this.rooms[this.FirstOpenRoom] = [];
		this.startFlags[this.FirstOpenRoom] = false;
		this.NextRoomId += 1;
	}
    //provide a copy of the rooms list. If we send to clients, don't want them to mess with real copy though.
    this.getRoomsList = function(){
        roomsList = {};
        for(var room in this.rooms){
            if(!this.startFlags[room]){
                roomsList[room] = this.rooms[room];
            }
        }
        return roomsList;
    }
}

var myrooms = new gamerooms();
myrooms.initialize();

var AvalonClient = require("./avalon/client.js")
var avalonClient = new AvalonClient()
avalonClient.initialize()
console.log(avalonClient.gameFunctionhandlers)
/****************************
 * Game Rules handler ( Specific for avalon )
 ****************************/

//Deprecated, this was moved to the board. Short run probably doesnt matter where it is

var gameRules = function(){
    this.rules = {5:{"numOfPlayers":5,"numOfEnemies":2,neededVotesToPass:[2,3,2,3,3]},
                6:{"numOfPlayers":6,"numOfEnemies":2,neededVotesToPass:[2,3,4,3,4]},
                7:{"numOfPlayers":7,"numOfEnemies":3,neededVotesToPass:[2,3,3,4,4], twoNeededOnFourth:true},
                8:{"numOfPlayers":8,"numOfEnemies":3,neededVotesToPass:[3,4,4,5,5], twoNeededOnFourth:true},
                9:{"numOfPlayers":9,"numOfEnemies":3,neededVotesToPass:[3,4,4,5,5], twoNeededOnFourth:true},
                10:{"numOfPlayers":10,"numOfEnemies":4,neededVotesToPass:[3,4,4,5,5], twoNeededOnFourth:true}
    }

    this.getRulesByPopulation = function(numOfPlayers){
        return this.rules[numOfPlayers]
    }

}

var myRules = new gameRules();



/****************************
* Socket IO Response Server *
****************************/

//The interaction between client and server is handled here.

// initialize the socket connection
io.sockets.on('connection', function(socket){
    //player id will be the id of the socket
    //This is just for clarity


    console.log('connection to server confirmed, Player id is ' + socket.id);
	socket.emit( 'connection', socket.id );

    socket.emit('connection down',myrooms.getRoomsList());
    //Once this player disconnects.
	socket.on("disconnect", function(){
        //Remove the player from his room
		var oldRoom = myrooms.leaveRoom( socket.id );
        console.log("Player id " + socket.id + " Disconnecting from room " +oldRoom);

		var data, statData;
		// When we're still in a room

		if( oldRoom ){
            var isHost
            if(myrooms.isRoomHost(socket.id)){
                isHost = true
            }
            else{
                isHost = false
            }
			data = { 
				'sessionId': socket.id,
				'roomId': oldRoom,
                'isHost' : isHost
            };
			// Let people know we've left
			socket.broadcast.to( "room#" + oldRoom ).emit( "left room down", data );
			socket.emit( "left room down", data );
			
			// Leave the socket
			socket.leave( "room#" + oldRoom );
		}
	});


	/****************************
	* Game Server Response          *
	****************************/

    //Player actions are handled here
    //Actions include players joining, leaving, joining games, and performing game actions.

	// join room
	socket.on( "join room up", function( room ){
		// Step 0: Leave the current room (if we're in one)
		var oldRoom = myrooms.leaveRoom( socket.id);
		if( oldRoom ){
            console.log("Leaving room");
			var departureData = { 'sessionId': socket.id };
			socket.broadcast.to( "room#" + oldRoom ).emit( "left room down", departureData );
			socket.emit( "left room down", departureData );
		}

        console.log("joining room");
		// Step 1: Join the room in the model
		myrooms.joinRoom( socket.id, room );
		
		// Step 2: Join the room over socket
		var theRoom = myrooms.getRoom( socket.id );
		socket.join( "room#" + theRoom );
        var host = myrooms.getRoomHost(room)
		// Step 3: Announce to the world
		var outPut = { 
			'sessionId': socket.id,
			'roomId': theRoom,
            'host' : host
		};
		socket.broadcast.to( "room#" + theRoom ).emit( "join room down", outPut );
		socket.emit( "join room down", outPut );
	} );
	
	// leaving room
	socket.on( "leave room up", function( data ){
        console.log(socket.id +" leaving room");

        //Have the player leave the room.
		var oldRoom = myrooms.leaveRoom(socket.id );
		if( oldRoom ){
			var departureData = { 'sessionId': socket.id };
			socket.broadcast.to( "room#" + oldRoom ).emit( "left room down", departureData );
			socket.emit( "left room down", departureData );
		}
	} );
	socket.on("refresh up", function(data){
        socket.emit( "refresh down", myrooms.getRoomsList() );

    });
    socket.on("chat up", function(data){
            var theRoom = myrooms.getRoom( socket.id );
            socket.broadcast.to( "room#" + theRoom ).emit( "chat down",socket.id, data["message"]);
        	socket.emit( "chat down", socket.id,data["message"] );
    });
	// game event
	socket.on( "game event up", function(data){
        //Get game event info
        var theRoom = myrooms.getRoom( data['sessionId'] );
        var game = myrooms.getGameFromRoom(theRoom);
        var middle = {
			'sessionId': data['sessionId'],
			'name': data['name'],
			'event': data['event'],
			'roomId': data['roomId'],
            'game': game
		};
		console.log( "middle: " + JSON.stringify( middle ) );


        var actions = avalonClient.handleGameEvent(middle)
        console.log(actions)

        var actions = {
            'actions' : actions
        }
		if( data['roomId'] == undefined ){

			socket.broadcast.to( "room#" + theRoom ).emit( "game event down", {} );
		}
		else{ 
			socket.broadcast.to( "room#" + data['roomId'] ).emit( "game event down", {} );
		}
		socket.emit( "game event down", actions );
	});

	// Starting a game
	socket.on( "start game up", function(data){
        //check if theres enough players
        console.log(data)
		var room = data['roomId'];
        var population = myrooms.roomStats(room).population;
        if(population >= minPerRoom && population <= maxPerRoom){
            var result = myrooms.startGame( room );
            if( result ){

                socket.broadcast.to( "room#" + room).emit("request start game down");
                socket.emit( "start game down", result );
            }
        }
	} );

    socket.on("request game info start up",function(data){
        var playerId = data['playerId'];
        var room = myrooms.getRoom(playerId);
        var game = myrooms.getGameFromRoom(room);
        var index = game.findPlayerIndexInArray(playerId,game.players)
        var player = game.players[index]
       socket.emit("request game info start down", player);
    });

    socket.on("request actions up", function(data){
        var playerId = data['playerId'];
        var room = myrooms.getRoom(playerId);
        var game = myrooms.getGameFromRoom(room);
        var index = game.findPlayerIndexInArray(playerId,game.players)
        var actions = game.GetPossibleActions(index)
        socket.emit("request actions down", actions);
    });
});


