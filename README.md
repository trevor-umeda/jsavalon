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
* The code for rooms and joining rooms is hard to understand and hacky.



* The spaghetti code has been mostly untangled. There are less unneccessary files and alot of dead unused code has been shifted away. THe code doesn't necessarily follow all the best practices yet and some of the organization still needs to be cleaned up.
* Alot of the game logic has been shifted to the server side now. The client side is much more secure.

TODO LIST
========
* [] Delete unused/obsolete code
	* [] Follow naming conventions everywhere.
	* [] UI needs cleaning up.
* [X] Refactor to more client/server. P2P is not ideal for this sort of game. This can prevent cheating and keep the code cleaner
	* [X] Move and convert code to server side
	* [X] Create logic to house game objects
	* [X] Map out client server communication
* [] Create the UI interactions for clientside.
	* [] Create UI for choosing who is on the quest
	* [] Create UI for voting acceptance of quest members
	* [] Create UI for voting pass or fail
	* [] Create board UI.
	
	

	
	  	


