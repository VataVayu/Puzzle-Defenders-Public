/**
*	PredefinedSpawn.js
*	
*	This is a literal picture of what the board will look like for both players
*	This object is read in if the variables "playerOneDebug" or "playerTwoDebug"
*	are set to true.
*	
*	To make a custom board, fill in the characters with orb types:
*		w = water, f = fire, e = earth, a = air, s = spell orb tied to race
*	
*	*****NOTE: Design this board as if you are designing it for the player on the
*    	  RIGHT side of the screen - left most char is closest to the resources!
*	
*	
**/

const predefinedSpawn = {
	playerOneDebugBoard: [
						"w w w w w w w w w",
						"",
						"e e e e s e e e e",
						"",
						"f f f f s f f f f",
						"",
						"a a a a s a a a a",
						"",
						"w w w w w w w w w",
						""
						],
	playerTwoDebugBoard: [				
						"w w w w w w w w w",
						"",
						"e e e e e e e e e",
						"",
						"f f f f f f f f f",
						"",
						"a a a a a a a a a",
						"",
						"w w w w w w w w w",
						""
						],
	playerOneNewDebugBoard: [
						["e", "e", "e"],
						["w", "w", "f"],
						["w", "w", "f"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						],
	playerTwoNewDebugBoard: [
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "a", "w"],
						["w", "a", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						["w", "w", "w"],
						]
};