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
	playerOneDebugBoard: ["w w w w w w w w w",
						  "w w w w w w w w",
						  "w w w w w w w w",
						  "w w w w w w w w",
						"w w w w w w w w w",
						"w w w w w w w w w",
					    "w w w w w w w w w",
					"e f f f e a w",
					  "w w w w w w w e a w",
					  "e e e e e e e e a w"],
	playerTwoDebugBoard: ["",
										"",
										"",
										"",
										"",
										"",
										"",
										"",
										"",
										""],
	rowSpawnTest: []
/*	playerOneDebugBoard:	["a f a", 
							"a f e",
							"e",
							"a e a", 
							"w w a", 
							"w w e", 
							"f a a", 
							"e a a", 
							"a w a e", 
							"w a a" 
							],
	playerTwoDebugBoard:	["a f e w f f a", 
							"a w f w w f w", 
							"a e w e w f e", 
							"f e", 
							"w w w e w a e", 
							"f w", 
							"e e a f a f a", 
							"s2 a", 
							"a a e a e f w",
							"" 
							],
	rowSpawnTest: 	[['a','a','f','w','f','e','e','f','w','e'],
					['f','f','f','f','f','f','f','f','f','f']]
*/
};

module.exports = predefinedSpawn;