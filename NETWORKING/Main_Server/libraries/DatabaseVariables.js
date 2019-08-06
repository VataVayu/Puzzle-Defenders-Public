/** 
 * This is for database to collect information from both players.
 * It stores things we need and is passed to databaseCommunicator
 * when the information is collected.
 
 Information we need:
 - start time of game: date
 - duration of game: time (in seconds)
 - account id: int/string
 - race: string
 - attacks made: array 
 - shields made: array
 - abilityA: int
 - abilityB: int
 - spells: int
 - victory: boolean (default false until the end of a full match)
 - disconnected: boolean (default true until the end of a full match)
 - column spawns: int
 - row spawns: array 
 - resource death time: array
 - latency from client to server: array
 - latency from server to client: array
**/

// Basic game data
var databaseVariables = [{gameStartTime: 0, gameDuration: 0}];

// Info for Player 1								
databaseVariables.push({
							id: "", 
							race: "", 
							attacks: [], 
							shields: [], 
							abilityA: 0, 
							abilityB: 0,	
							spells: 0, 
							victory: false, 
							disconnected: true, 
							columnSpawns: 0, 
							rowSpawns: [], 
							resourceDeath: [], 
							C2SLatency: [], 
							S2CLatency: []
						});

// Info for Player 2
databaseVariables.push({
							id: "", 
							race: "", 
							attacks: [], 
							shields: [], 
							abilityA: 0, 
							abilityB: 0,	
							spells: 0, 
							victory: false, 
							disconnected: true, 
							columnSpawns: 0, 
							rowSpawns: [], 
							resourceDeath: [], 
							C2SLatency: [], 
							S2CLatency: []
						});
						
module.exports = databaseVariables;