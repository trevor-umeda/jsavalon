jsavalon
==========

js avalon game. using game query 

Can be resistance or avalon.

Multiplayer…

Objects
=========
* Player
	* name - String	
	* isKing - boolean
	* isOnQuest - boolean
	* roleCard - Object 	
* RoleCard
	* name - String
	* picture - jquery picture i guess
	* isEnemy - boolean
* Board	
	* Turn - array of Object
* Turn
	
	
	
Game Loop
============	 			
1. Allow players to enter room
2. Press start to close the room.
3. Setup rules/board based on # of players
4. Assign players cards
5. Flip character cards ( reveal player card )
6. Begin game loop
	7. Assign King (rotate king)
	8. King choose players
	9. All players put in vote
	10. Reveal vote. ( if less then half go to step 7)
	11. Chosen players choose pass/fail if they are enemy.
	12. If any fail votes, then quest fails.
	13. Check if game is over. if not then go to step 7
14. If avalon, enemies get to find merlin	

	 
Problems
=====
* Spaghetti code. Pretty damn hard to find anything. Just cus using old code from old project. 
	* Improperly and inconsistently named methods/variables
	* Too many files. They can be consolidated. Also not clear and what goes in where. 
	* Too many random dependencies that we still don't need.
* Too much info held in the client side? Keeps server side light but has security issues. 	
	
	

	
	  	


