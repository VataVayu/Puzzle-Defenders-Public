/** The variableContainer is a large object that contains important variables
 *	that are never modified. The format is a JSON (JavaScript Object Notation)
 **/

const variableContainer = {
	isLocal: null, // determines what code to use if we are playing local or not
	/******* Board Variables *******/
	cellDimensions: new Pair(48, 48), //width and height of an individual cell in the gameboard.
	boardDimensions: new Pair(15, 10), //number of columns, number of rows
	minCellDimension: 20,
	maxCellDimension: 48, 
	tickInterval: 65, 
	synchDelay: 3,
	
	//timing of vibration animation for local
	vibrationDuration : 3,
	activationDelay : 4,

	borderDimension: 1,
	// Below constants are purely x dimensions as their y dimensions will be boardDimensions[1]
	resourceDimension: 1,
	playerZoneDimension: 1, // Minimum of 1 for player to have a column to move on
	shieldZoneDimension: 1,
	noMansLandDimension: 1, // Center clear column that isnt mirrored on both sides of the board
	//Purely Alters the Y dimension for the UI
	uiDimension: 1,
	pairSpawning : true,
	
	
	AIAttitude: 3, // default AI attitude
	
	// Debugging purposes only
	playerOneDebug: false,
	playerTwoDebug: false,
	debug_pause: true,
	
	queueSpacingDistance: 1.75, //this is the most minimal distance we can have

	//Spell Information
	spellOrbSpawning: true,
	spellOrbCounter: 2, 
	spellOrbMax: 4, // the maximum number of spell orbs on a board at one time
	attunedSpellCount: 4,
	
	// Shared race information
	maxResourceHealth: 7,
	
	//Angel Race stats
	angelSwapSpeed: .3125,
	angelShieldFairyHealth: 7,
	angelShieldFairyDamage: 100,
	angelAttackFairyHealth: 8,
	angelAttackFairyDamage: 3,
	angelStopColSpawn: 9,

	// Steampunk Race stats
	steampunkShootSpeed: .625,
	steampunkShootDelay: 50,
	steampunkSacrificeDelay: 200,
	steampunkShieldFairyHealth: 10,
	steampunkShieldFairyDamage: 100,
	steampunkAttackFairyHealth: 8,
	steampunkAttackFairyDamage: 2,
	steampunkStopColSpawn: 9,

	// Witch Race Stats
	witchShootSpeed: .625,
	witchShieldFairyHealth: 10,
	witchShieldFairyDamage: 100,
	witchAttackFairyHealth: 8,
	witchAttackFairyDamage: 2,
	witchStopColSpawn: 9,

	// Gravity stats
	attackFairyGravity: .3125,
	shieldFairyGravity: .25,
	boardGravity: .1875,

	
	// This is for the resource, player, 2 empty rows, and the shield row 
	numInitColumns: 3, //This should not exceed the number of rows a player's playfield has
	DEBUG: false,
	drawYOffset: -.25,

	/******* Character Variables *******/
	races: ["witch", "steampunk", "angel"],
	raceDescriptions: new Array(2),
	charImgOffsetY: -1, //The character is drawn one row above its colRow location
	selectionBoxLength: 2, // Selection box takes up two units
	defaultSpriteCountdown: 300,
	
	
	/********* Font Variables *********/
	swashCapsFont: "Macondo Swash Caps",
	hennyPennyFont: "Henny Penny",
	sunshineyFont: "Sunshiney",
	mysteryQuestFont: "Mystery Quest",
	
	/********* Fairy Variables *********/
	attunedMultiplier: 2,

	/******* Input Variables *******/
	/********Player One*************/
	AIOne: false,
	UPONE: 'W'.charCodeAt(0),
	DOWNONE: 'S'.charCodeAt(0),
	LEFTONE: 'A'.charCodeAt(0),
	RIGHTONE: 'D'.charCodeAt(0),
	ACTION_AONE: 'G'.charCodeAt(0), 
	ACTION_BONE: 'H'.charCodeAt(0), 
	NEW_COLUMNONE: ' '.charCodeAt(0),
	TOGGLE_DEBUG_PAUSE: 'P'.charCodeAt(0), //Pause
	ENTER: 13,
	SPACE: ' '.charCodeAt(0), 
	ESCAPE: 27, 

	/********Player Two*************/
	AITwo: false,
	UPTWO: 38, // Up Arrow Key
	DOWNTWO: 40, // Down Arrow Key
	LEFTTWO: 37, // Left Arrow Key
	RIGHTTWO: 39, // right Arrow Key
	ACTION_ATWO: 190, // . key
	ACTION_BTWO: 191, // / key
	NEW_COLUMNTWO: '?'.charCodeAt(0),

	/******* Timer Variables *******/
	countdownDecPercent: .95,
	timerTextSize: 1/2,

	/******* Orb Movement Speeds *******/
	vibrateMagnitude: 0.075,

	/******* Elemental Information *******/
	elementCount: 4, 
	spellCount: 3,
	characterCount: 3,
	typeEnum: ["air", "water", "fire", "earth", "random", "dead"],

	/******* Image Resources *******/
	TO_RADIANS: Math.PI/180,
			
};

// Label all sounds
SoundJS.addBatch([
		{name:"click", src:"libraries/sounds/buttonClickConfirm.wav", instances:1},
		{name:"unconfirm", src:"libraries/sounds/buttonClickUnconfirm.wav", instances:1},
		{name:"advanceTextbox", src:"libraries/sounds/advanceTextbox.wav", instances:1},
		{name:"attackCreated", src:"libraries/sounds/attackCreated.wav", instances:1},
		{name:"attackHitShield", src:"libraries/sounds/attackHitShield.wav", instances:1},
		{name:"attacksCollided", src:"libraries/sounds/attacksCollided.wav", instances:1},
		{name:"boardShuffled", src:"libraries/sounds/boardShuffled.wav", instances:1},
		{name:"columnSpawned", src:"libraries/sounds/columnSpawned.wav", instances:1},
		{name:"orbGrabbed", src:"libraries/sounds/orbGrabbed.wav", instances:1},
		{name:"orbSacrificed", src:"libraries/sounds/orbSacrificed.wav", instances:1},
		{name:"orbThrown", src:"libraries/sounds/orbThrown.wav", instances:1},
		{name:"orbsSwapped", src:"libraries/sounds/orbsSwapped.wav", instances:1},
		{name:"resourceDamaged", src:"libraries/sounds/resourceDamaged.wav", instances:1},
		{name:"resourceDestroyed", src:"libraries/sounds/resourceDestroyed.wav", instances:1},
		{name:"activateSpell", src:"libraries/sounds/activateSpell.wav", instances:1},
		{name:"sacrificeDestroyedOrb", src:"libraries/sounds/sacrificeDestroyedOrb.wav", instances:1},
		{name:"shieldsCreated", src:"libraries/sounds/shieldsCreated.wav", instances:1},
		{name:"tutorial victory", src:"libraries/sounds/tutorialVictory.mp3", instances:1},
		{name:"battle victory", src:"libraries/sounds/battleVictory.mp3", instances:1},
		{name:"battle defeat", src:"libraries/sounds/battleDefeat.mp3", instances:1},
		{name:"menu music", src:"libraries/sounds/menuMusic.mp3", instances:1},
		{name:"overworld music", src:"libraries/sounds/overworldMusic.mp3", instances:1},
		{name:"tutorial theme", src:"libraries/sounds/tutorialTheme.mp3", instances:1},
		{name:"battle music", src:"libraries/sounds/battleMusic.mp3", instances:1},
		{name:"danger theme", src:"libraries/sounds/dangerTheme.mp3", instances:1}]
		);

variableContainer.minColumnSpawnTime = 20 * variableContainer.tickInterval;
variableContainer.timerTickTime = variableContainer.tickInterval;

variableContainer.boardColumnOffset = variableContainer.borderDimension;
variableContainer.boardRowOffset = variableContainer.uiDimension + variableContainer.borderDimension;
variableContainer.gameContainerNumColumns = 2 * (variableContainer.boardColumnOffset + 
									 variableContainer.boardDimensions.getFirst() + 
									 variableContainer.resourceDimension + variableContainer.shieldZoneDimension) + 
									 variableContainer.noMansLandDimension;
variableContainer.gameContainerNumRows = variableContainer.boardRowOffset + variableContainer.boardDimensions.getSecond() + 
										 variableContainer.borderDimension;

variableContainer.playFieldCeiling = variableContainer.uiDimension + variableContainer.borderDimension;
variableContainer.playFieldFloor = variableContainer.boardDimensions.getSecond() + variableContainer.playFieldCeiling - 1;

// Visual spawn variables
variableContainer.visualShift = 0.2;
//Spawn variables
variableContainer.columnDoubleTime = 2; // Note this value must range from 1 to boardDimensions.getFirst() - 1

//Starting spawn time
variableContainer.angelSpawnTime = 60 * variableContainer.tickInterval;
variableContainer.steampunkSpawnTime = 300 * variableContainer.tickInterval;
variableContainer.witchSpawnTime = 155 * variableContainer.tickInterval;

//Min column spawn rate
variableContainer.angelMinSpawnRate = 50 * variableContainer.tickInterval;
variableContainer.steampunkMinSpawnRate = 200 * variableContainer.tickInterval;
variableContainer.witchMinSpawnRate = 110 * variableContainer.tickInterval;

//Spell spawn delay
variableContainer.angelSpellSpawnRate = 200 * variableContainer.tickInterval;
variableContainer.steampunkSpellSpawnRate = 200 * variableContainer.tickInterval;
variableContainer.witchSpellSpawnRate = 200 * variableContainer.tickInterval;

// Race descriptions for the character selection menu
variableContainer.raceDescriptions[0] = new Array(3);
variableContainer.raceDescriptions[1] = new Array(3);

// Player 1
variableContainer.raceDescriptions[0][variableContainer.races[0]] = "RACE: Witch\nAFFINITY: Earth\nSPELL: Next 5 matches produce powerful fairies\n[G] KEY: Collect orbs of the same type\n[H] KEY: Throw orbs\nMOVEMENT: W, A, S, D keys ";
variableContainer.raceDescriptions[0][variableContainer.races[1]] = "RACE: Steampunk\nAFFINITY: Fire\nSPELL: Ignite all earth orbs\n[G] KEY: Throw orb (will not match) (G key)\n[H] KEY: Throw orb (will set off matches)\nMOVEMENT: W, A, S, D keys";
variableContainer.raceDescriptions[0][variableContainer.races[2]] = "RACE: Angel\nAFFINITY: Air\nSPELL: Activate all fairies in spell orb's row\n[G] KEY: Swap orbs in selection box\nMOVEMENT: W, A, S, D keys";

// Player 2
variableContainer.raceDescriptions[1][variableContainer.races[0]] = "RACE: Witch\nAFFINITY: Earth\nSPELL: Next 5 matches produce powerful fairies\n[ . ] KEY: Collect orbs of the same type\n[/] KEY: Throw orbs\nMOVEMENT: Up, Down, Left, Right Arrows  ";
variableContainer.raceDescriptions[1][variableContainer.races[1]] = "RACE: Steampunk\nAFFINITY: Fire\nSPELL: Ignite all earth orbs\n[ . ] KEY: Throw orb (will not match)\n[/] KEY: Throw orb (will set off matches)\nMOVEMENT: Up, Down, Left, Right Arrows  ";
variableContainer.raceDescriptions[1][variableContainer.races[2]] = "RACE: Angel\nAFFINITY: Air\nSPELL: Activate all fairies in spell orb's row\n[ . ] KEY: Swap orbs in selection box\nMOVEMENT: Up, Down, Left, Right Arrows ";