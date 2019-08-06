// Import required files to run this class
var Utility = require('./Utilities.js');

/** The variableContainer is a large object that contains important variables
 *	that are never modified. The format is a JSON (JavaScript Object Notation)
 **/

const variableContainer = {

	/******* Board Variables *******/
	cellDimensions: new Utility.Pair(48, 48), //width and height of an individual cell in the gameboard.
	boardDimensions: new Utility.Pair(15, 10), //number of columns, number of rows. arbitrary
	minCellDimension: 20,
	maxCellDimension: 48, 
	tickInterval: 65,
	activationDelay: 2, //delay for activation orbs.  NEEDS TO BE 2, OR ELSE FAIRIES ON CLIENT WILL NOT APPEAR FOR
						//ANGEL.

	borderDimension: 1,
	// Below constants are purely x dimensions as their y dimensions will be boardDimensions[1]
	resourceDimension: 1,
	playerZoneDimension: 1, // Minimum of 1 for player to have a column to move on
	shieldZoneDimension: 1,
	noMansLandDimension: 1, // Center clear column that isnt mirrored on both sides of the board
	//Purely Alters the Y dimension for the UI
	uiDimension: 1,

	AIAttitude: 3,
	playerOneDebug: false,
	playerTwoDebug: false,
	debug_pause: false,
	
	queueSpacingDistance: 1.75, //this is the most minimal distance we can have

	// Spell information
	spellOrbSpawning: true,
	spellOrbCounter: 2,
	spellOrbMax: 4,
	attunedSpellCount: 4,
	
	// Shared Race stats
	maxResourceHealth: 7,
	
	//Angel Race stats
	angelSwapDelay: .3125, 
	angelShieldFairyHealth: 7,
	angelShieldFairyDamage: 100,
	angelAttackFairyHealth: 8,
	angelAttackFairyDamage: 3,
	angelStopColSpawn: 9,

	//Steampunk Race stats
	steampunkShootSpeed: .625,
	steampunkShootDelay: 50,
	steampunkSacrificeDelay: 200,
	steampunkShieldFairyHealth: 10,
	steampunkShieldFairyDamage: 100,
	steampunkAttackFairyHealth: 8,
	steampunkAttackFairyDamage: 2,
	steampunkStopColSpawn: 9,

	//Witch race stats
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

	
	// This is for the Crystal, player, two empty rows, and the shield row 
	numInitColumns: 3, //This should not exceed the number of rows a player's playfield has
	DEBUG: false,

	/******* Character Variables *******/
	races: ["witch", "steampunk", "angel"],
	charImgOffsetY: -1, //The character is drawn one row above its colRow location. may need to delete later
	selectionBoxLength: 2, // Selection box takes up two units

	/********* Fairy Variables *********/
	attunedMultiplier: 2,

	/******* Timer Variables *******/
	countdownDecPercent: .95,

	/******* Elemental Information *******/
	elementCount: 4, 
	spellCount: 3,
	characterCount: 3,
	typeEnum: ["air", "water", "fire", "earth", "random"],

};

// The following are part of variableContainer, but required that other variables
// were defined beforehand
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

//timer related
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

// Export the object for other classes to use
module.exports = variableContainer;