/*****************************
* Drawing with gameQuery          *
******************************/

var AvalonGraphics = function(){
	this.background = new AvalonGraphicsBackground();
	this.board = new AvalonGraphicsBoard();
	this.player = new MahjongGraphicsPlayer();
	
	this.initialize = function( element ){
		MahjongStaticInitialization();
		MahjongButtonInit();
		this.background.initialize( element );
		this.board.initialize( element );
		this.player.initialize( element );	
		// this.ui.initialize( element );
		this.board.setupButtons();
	}
	this.setChiPick = function(handId){
		this.player.setChiPick(handId);
	}
	this.setPlayerPick = function(handId){
		this.player.setPick(handId);
	}
	// gamestate is a json file
	this.draw = function(gamestate){
		board = gamestate['board'];
		this.board.draw(gamestate['board']);
		this.player.draw(gamestate['players'][playerNumber]);
	}
	
}


