// Stores variables for database
/* 
Things to store:
- attacks made: array 
- shields made: array
- abilityA: int
- abilityB: int
- spells: int
- victory: boolean
- column spawns: int
- row spawns: array 
*/


// Holds information for both players
// The first element will never be used.

// Index 0 is for game data
var databaseVariables = [{gameStartTime: 0, gameDuration: 0 }];

// Initialize the arrays to 0

// Player 1								
databaseVariables.push({race: "", attacks: [], shields: [], abilityA: 0, abilityB: 0,	
						spells: 0, victory: false, columnSpawns: 0, rowSpawns: [], resourceDeath: []});

// Player 2
databaseVariables.push({race: "", attacks: [], shields: [], abilityA: 0, abilityB: 0,	
						spells: 0, victory: false, columnSpawns: 0, rowSpawns: [], resourceDeath: []});