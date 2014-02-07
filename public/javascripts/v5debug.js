var graphics;
game.initialize();
var count = 0;

$(function(){

    //Chat stuff
   $('#sidebar').css('margin-left',($('body').outerWidth()-20));

    $("body").mask("Loading. Please be patient...");
    $("h2").click(function () {
         var slider = $('#sidebar');
            slider.animate({
              marginLeft: parseInt(slider.css('margin-left'),10) <= ($('body').outerWidth() - 190) ?
                  ($('body').outerWidth()-20) : ($('body').outerWidth() - 190)

            });
           });

	$("#playground").playground( { width: GAME_WIDTH,  height: GAME_HEIGHT } );
	
	$.playground().startGame(function(){
	
	});
	$.playground().registerCallback( function(){
		if(game.begun){
			graphics.draw(game.tojson());

			}
			else {
				//draw a blank table.
	
			}
		} ,60);
	
} );
$(document).ready(function(){

	graphics = new AvalonGraphics();
	graphics.initialize("playground");
		$("#endturn").mouseover( function(){ tooltip.show( "End your turn" ); } );
		$("#endturn").mouseleave( function(){ tooltip.hide(  ); } );
		//graphics.draw(game.tojson());	

	});


