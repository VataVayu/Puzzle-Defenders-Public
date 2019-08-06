//This file packages information in gameContainer
var Utilities = require('../libraries/Utilities.js');
var Witch = require('./Witch.js');
var Steampunk = require('./Steampunk.js');
var Angel = require('./Angel.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var DatabaseVariables = require('../libraries/DatabaseVariables.js');
var Board = require('./Board.js');
var Character = require('./Character.js');
var ClientHandler = require('./ClientHandler.js');
var PredefinedSpawn = require('../libraries/PredefinedSpawn.js');
var BoardDirector = require('./BoardDirector.js');
var Timer = require('./Timer.js');

/**
 *	This file will control the boards that spawn as well as setting their fields
 *	This file will also handle the Character input for each Character
 *	This file will also handle fairy and shield fairy collisions
 *
 * function disableSpawn():  Disable spawn for both player one and player two board directors.
 * function enableSpaw(): Enable spawn for both player one and two board directors.
 * function getCharacterOne(): Returns characterOne value
 * function getCharacterTwo(): Returns characterTwo value
 * function getCharOneStationaryShieldFairies(): Returns the list of 
 * 		charOneStationaryShieldFairies list.
 * function getCharTwoStationaryShieldFairies(): Returns the list of
 * 		CharTwoStationaryShieldFairies list.
 * function getSCLatency(latency (int), time (timer), playerNum (int)): Stores data of latency.
 * function getDatabaseVariables(): Returns the DatabaseVariables.
 * function getCurrentTime():  Returns the amount of time elapsed.
 * function update(): Function updates all fairies, characters, resources, and board.	
 * function getInitialAssets(isServerPlayerOne (boolean)): sets up board initialization to be 
 * 		sent to clients.
 * function encodeList(splitterSymbol (char), list (array to be used)): Encodes list for server to 
 * 		send data to its clients.
 * function encodeFairyList(splitterSymbol (char), list(array to be used)):  Encodes fairies into list
 * 		for server to send fairy data to its clients.
 * function encodeGameContainerData(playerIdentification (0 or 1)): Encodes necessary data to update
 * 		clients facing each other to be udpated appropriately with character, board, resources, spells,
 * 		and shifting of selection box for angels. 
 *
 *
**/

function GameContainer(characterOneRace, characterTwoRace, clientOne, clientTwo, playerOneId, playerTwoId) {

	// This changes the canvas blah blah get back to work.

	/**Private Variables and initialization**/
	
	var updateCounter = 0; //for debug only
	var gameTimer = new Timer.Timer();
	var initCountdown = new Timer.CountDownTimer(gameTimer, 4000);
	// Reset databaseVariables to write to fresh
	// Attacks will never be longer than the number of columns in the game
	var maxRowLength = VariableContainer.boardDimensions.getFirst();
	var maxColLength = VariableContainer.boardDimensions.getSecond(); // number of rows in game
	
	while(maxRowLength--) {
		DatabaseVariables[1].attacks[maxRowLength] = 0;
		DatabaseVariables[2].attacks[maxRowLength] = 0;
	}

	// Initialize shield array and rowSpawns array at the same time
	// because they share the same array length values
	while(maxColLength--) { 
		DatabaseVariables[1].shields[maxColLength] = 0;
		DatabaseVariables[1].rowSpawns[maxColLength] = 0;
		DatabaseVariables[2].shields[maxColLength] = 0;
		DatabaseVariables[2].rowSpawns[maxColLength] = 0;
		DatabaseVariables[1].resourceDeath[maxColLength] = 0;
		DatabaseVariables[2].resourceDeath[maxColLength] = 0;
	}
	
	// Reset number values;
	DatabaseVariables[0].gameDuration = 0;
	DatabaseVariables[1].id = playerOneId;
	DatabaseVariables[1].abilityA = 0;
	DatabaseVariables[1].abilityB = 0;
	DatabaseVariables[1].spells = 0;
	DatabaseVariables[1].victory = false;
	DatabaseVariables[1].disconnected = true;
	DatabaseVariables[1].columnSpawns = 0;
	DatabaseVariables[1].C2SLatency = [];
	DatabaseVariables[1].S2CLatency = [];
	DatabaseVariables[2].id = playerTwoId;
	DatabaseVariables[2].abilityA = 0;
	DatabaseVariables[2].abilityB = 0;
	DatabaseVariables[2].spells = 0;
	DatabaseVariables[2].victory = false;
	DatabaseVariables[2].disconnected = true;
	DatabaseVariables[2].columnSpawns = 0;
	DatabaseVariables[2].C2SLatency = [];
	DatabaseVariables[2].S2CLatency = [];
	// Update the database on the races of the players
	DatabaseVariables[1].race = characterOneRace;
	DatabaseVariables[2].race = characterTwoRace;
	
	var clientHandlerOne = new ClientHandler(clientOne, 1, gameTimer, this);
	var clientHandlerTwo = new ClientHandler(clientTwo, -1, gameTimer, this);
											
	
	// Player 1
	if(characterOneRace == "witch") {
		characterOneRace = new Witch(new Utilities.Pair(VariableContainer.borderDimension, 
													VariableContainer.boardRowOffset), 1);
	} else if(characterOneRace == "steampunk") {
		characterOneRace = new Steampunk(new Utilities.Pair(VariableContainer.borderDimension, 
															VariableContainer.boardRowOffset), 1);
	} else {
		characterOneRace = new Angel.Angel(new Utilities.Pair(VariableContainer.borderDimension, 
													VariableContainer.boardRowOffset), 1, clientHandlerOne);
	}
	
	// Player 2
	if(characterTwoRace == "witch"){
		characterTwoRace = new Witch(new Utilities.Pair(VariableContainer.gameContainerNumColumns 
											- VariableContainer.borderDimension - 1, 
											VariableContainer.boardRowOffset), 2);
	} else if(characterTwoRace == "steampunk"){
		characterTwoRace = new Steampunk(new Utilities.Pair(VariableContainer.gameContainerNumColumns 
										- VariableContainer.borderDimension - 1, 
										VariableContainer.boardRowOffset), 2);
	} else{
		characterTwoRace = new Angel.Angel(new Utilities.Pair(VariableContainer.gameContainerNumColumns 
											- VariableContainer.borderDimension - 1, 
											VariableContainer.boardRowOffset), 2, clientHandlerTwo);
	}
	
	
	// This creates the boards for each player
	
	var xMirroredOffset = VariableContainer.gameContainerNumColumns - VariableContainer.boardColumnOffset - 1;
	
	var boardXOffset = VariableContainer.boardColumnOffset;
	var boardYOffset = VariableContainer.boardRowOffset;
	
	// The timer for the game.
	//var gameTimer = new Timer.Timer();
	
	var boardOne = new Board("left", characterOneRace.getName(), new Utilities.Pair(boardXOffset, boardYOffset));
	var boardTwo = new Board("right", characterTwoRace.getName(), new Utilities.Pair(xMirroredOffset, boardYOffset));
	//arbiter.setBoardOne(boardOne);
	//arbiter.setBoardTwo(boardTwo);
	clientHandlerOne.setBoard(boardOne);
	clientHandlerTwo.setBoard(boardTwo);
	
	
	// Update the database on when the match started
	DatabaseVariables[0].gameStartTime = new Date();
	
	characterOneRace.setBoard(boardOne);
	characterTwoRace.setBoard(boardTwo);
	
	
	//This will also need to spawn the Characters themselves
	// Parameters are race, input handler, game container, and isPlayerOne (boolean)

	var characterOne = new Character(characterOneRace, gameTimer, true, clientHandlerOne); 
	var characterTwo = new Character(characterTwoRace, gameTimer, false, clientHandlerTwo);
	
	// This will allocate the shield area space for both Characters on the gameBoard.
	// Probably just arrays that hold the spaces for the shield fairies
	
	//Fairy Attack list
	var charOneAttackFairies = [];
	var charTwoAttackFairies = [];
	
	var charOneMovingShieldFairies = [];
	var charTwoMovingShieldFairies = [];
	
	var charOneStationaryShieldFairies = [];
	for (var i = 0; i < VariableContainer.boardDimensions.getSecond(); i++) {
		charOneStationaryShieldFairies[i] = null;
	}
	var charTwoStationaryShieldFairies = [];
	for (var i = 0; i < VariableContainer.boardDimensions.getSecond(); i++) {
		charTwoStationaryShieldFairies[i] = null;
	}

	
	// Add SpriteSheet here for win loss sprite, at end of game.
	
	// Initialize spells here because they are needed for the board initialization
	characterOne.getSpell().initialize(boardOne);
	characterTwo.getSpell().initialize(boardTwo);
	
	//BoardDirector is created for each board in order to keep track of orb spawning
	var boardDirectorOne = new BoardDirector(boardOne, gameTimer);
	var boardDirectorTwo = new BoardDirector(boardTwo, gameTimer);
	
	// Spawn boards
	if (VariableContainer.playerOneDebug) {
		boardOne.initializeCharacter(characterOne);
		boardDirectorOne.initialize(PredefinedSpawn.playerOneDebugBoard);
	} else {
		boardOne.initializeCharacter(characterOne);
		boardDirectorOne.initialize(null, VariableContainer.numInitColumns);
	}
	if (VariableContainer.playerTwoDebug) {
		boardTwo.initializeCharacter(characterTwo);
		boardDirectorTwo.initialize(PredefinedSpawn.playerTwoDebugBoard);
	} else {
		boardTwo.initializeCharacter(characterTwo);
		boardDirectorTwo.initialize(null, VariableContainer.numInitColumns);
	}
	
	//This disables the spawning capability of both boards
	this.disableSpawn = function(){
		boardDirectorOne.disableSpawn();
		boardDirectorTwo.disableSpawn();
	}
	
	//This enables the spawning capability of both boards
	this.enableSpawn = function(){
		boardDirectorOne.enableSpawn();
		boardDirectorTwo.enableSpawn();
	}
	
	//Returns characterOne value
	this.getCharacterOne = function() {
		return characterOne;
	}
	//returns characterTwo value
	this.getCharacterTwo = function() {
		return characterTwo;
	}
	//returns charOneStationary Shield fairies list.
	this.getCharOneStationaryShieldFairies = function() {
		return charOneStationaryShieldFairies;
	}
	//returns charTwoStationary Shield Fairies list.
	this.getCharTwoStationaryShieldFairies = function() {
		return charTwoStationaryShieldFairies;
	}
	
	
	
	//calculates SClatency values.
	this.getSCLatency = function(latency, time, playerNum){
		if (playerNum == 1){
			if (latency >= 600000){
				//store in 10 mins block
				DatabaseVariables[1].S2CLatency.push({"10m": latency, "timestamp": time});
			} else if (latency < 600000 && latency >= 180000){
				//store in 3 mins block
				DatabaseVariables[1].S2CLatency.push({"3m": latency, "timestamp": time});
			} else if (latency < 180000 && latency >= 60000){
				//store in 1 min block
				DatabaseVariables[1].S2CLatency.push({"1m": latency, "timestamp": time});
			} else if (latency < 60000 && latency >= 20000){
				//store in 20 sec block
				DatabaseVariables[1].S2CLatency.push({"20s": latency, "timestamp": time});
			} else if (latency < 20000 && latency >= 5000){
				//store in 5 sec block
				DatabaseVariables[1].S2CLatency.push({"5s": latency, "timestamp": time});
			} else if (latency < 5000 && latency >= 2000){
				//store in 2 sec block
				DatabaseVariables[1].S2CLatency.push({"2s": latency, "timestamp": time});
			} else {
				//store in 1 sec block
				DatabaseVariables[1].S2CLatency.push({"1s": latency, "timestamp": time});
			}
		} else {
			if (latency >= 600000){
				//store in 10 mins block
				DatabaseVariables[2].S2CLatency.push({"10m": latency, "timestamp": time});
			} else if (latency < 600000 && latency >= 180000){
				//store in 3 mins block
				DatabaseVariables[2].S2CLatency.push({"3m": latency, "timestamp": time});
			} else if (latency < 180000 && latency >= 60000){
				//store in 1 min block
				DatabaseVariables[2].S2CLatency.push({"1m": latency, "timestamp": time});
			} else if (latency < 60000 && latency >= 20000){
				//store in 20 sec block
				DatabaseVariables[2].S2CLatency.push({"20s": latency, "timestamp": time});
			} else if (latency < 20000 && latency >= 5000){
				//store in 5 sec block
				DatabaseVariables[2].S2CLatency.push({"5s": latency, "timestamp": time});
			} else if (latency < 5000 && latency >= 2000){
				//store in 2 sec block
				DatabaseVariables[2].S2CLatency.push({"2s": latency, "timestamp": time});
			} else {
				//store in 1 sec block
				DatabaseVariables[2].S2CLatency.push({"1s": latency, "timestamp": time});
			}
		}
	}
	
	//return Database Variables
	this.getDatabaseVariables = function(){
		return DatabaseVariables;
	}
	
	//returns gameTimer elpased
	this.getCurrentTime = function(){
		return gameTimer.getElapsedTime();
	}
	
	//Initialize after characterOne and characterTwo is constructed
	//characterOne.aIInitialize(this);
	//characterTwo.aIInitialize(this);
	var wrapper = this;
	/*Public Functions*/
	// Need to check for paused input
	
	
	this.updateOpp = function(data, playerNum) {
		if(playerNum == 1) {
			clientHandlerTwo.updateFoe(data);
		}else if(playerNum == 2) {
			clientHandlerOne.updateFoe(data);
		}
	}

	//Updates game for both boards, players, fairies, and resources.
	this.update = function() {
		//time click increment test

		if (initCountdown.isExpired()) {
		
			if (!gameTimer.isPaused()) {
				characterOne.update();
				characterTwo.update();
					
				boardOne.update();
				boardTwo.update();
				
				if (boardOne.getAttackFairies().length > 0) {
					charOneAttackFairies = charOneAttackFairies.concat(boardOne.getAttackFairies());
					boardOne.deleteAttackFairies(); //do inside board instead and return a temp?
				}
				
				if (boardTwo.getAttackFairies().length > 0) {
					charTwoAttackFairies = charTwoAttackFairies.concat(boardTwo.getAttackFairies());
					boardTwo.deleteAttackFairies();
				}
				
				if (boardOne.getShieldFairies().length > 0) {
					charOneMovingShieldFairies = charOneMovingShieldFairies.concat(boardOne.getShieldFairies());
					boardOne.deleteShieldFairies();
				}
				
				if (boardTwo.getShieldFairies().length > 0) {
					charTwoMovingShieldFairies = charTwoMovingShieldFairies.concat(boardTwo.getShieldFairies());
					boardTwo.deleteShieldFairies();
				}
				
				//Board Director is updated to see if a new column needs to be spawned
				boardDirectorOne.update();
				boardDirectorTwo.update();
				
			
				
				// Use if statement to check if either player out of resources
				// If so, call gameEnd() and pass who won/lost into it
				// out of curiosity, is there anything that keeps track of number of
				// living resources on each players side?
				// blah blah, need character class done
				
				// Check each fairyList for collisions
				for (var i = charOneAttackFairies.length - 1; i >= 0; --i) {
					if (charOneAttackFairies[i].getColRow().getFirst() > 
						(VariableContainer.borderDimension + VariableContainer.boardDimensions.getFirst() + VariableContainer.resourceDimension + 
						 2 * VariableContainer.shieldZoneDimension + VariableContainer.noMansLandDimension)
						) {
						charOneAttackFairies.splice(i, 1);
					} else {
						charOneAttackFairies[i].update();
						for (var j = charTwoAttackFairies.length - 1; j >=0 && charOneAttackFairies[i].isAlive(); --j) {
							if (charOneAttackFairies[i].collidedWithFairy(charTwoAttackFairies[j])) {
								if (!charTwoAttackFairies[j].isAlive) {
									charTwoAttackFairies.splice(j, 1);
								}					
							}
						}
						if (charOneAttackFairies[i].isAlive()) {
							for (var k = charTwoMovingShieldFairies.length - 1; k >=0 && charOneAttackFairies[i].isAlive(); --k) {
								if (charOneAttackFairies[i].collidedWithFairy(charTwoMovingShieldFairies[k])) {
									if (!charTwoMovingShieldFairies[k].isAlive) {
										charTwoMovingShieldFairies.splice(k, 1);
									}					
								}
							}
						}
						//TRIM: should be able to optimize to only check the row the fairy is on.
						if (charOneAttackFairies[i].isAlive()) {
							var charTwoResources = characterTwo.getResources();
							for (var l in charTwoResources) {
								if (charOneAttackFairies[i].collidedWithResource(charTwoResources[l])) {
									break;
								}
							}
						}
						if (!charOneAttackFairies[i].isAlive()) {
							charOneAttackFairies.splice(i, 1);
						}
					}
				}
				
				
				//check each fairyList in two for collisions.
				for (var i = charTwoAttackFairies.length - 1; i >= 0; --i) {
				
					if (charTwoAttackFairies[i].getColRow().getFirst() < 
						(VariableContainer.borderDimension + VariableContainer.boardDimensions.getFirst())
						) {
						charTwoAttackFairies.splice(i, 1);
					} else {
						charTwoAttackFairies[i].update();
						for (var j = charOneMovingShieldFairies.length - 1; j >=0 && charTwoAttackFairies[i].isAlive(); --j) {
							if (charTwoAttackFairies[i].collidedWithFairy(charOneMovingShieldFairies[j])) {
								if (!charOneMovingShieldFairies[j].isAlive) {
									//ID.IDManager.removeObject(charOneMovingShieldFairies[j].getID());
									charOneMovingShieldFairies.splice(j, 1);
								}					
							}
						}
						//TRIM: should be able to optimize to only check the row the fairy is on.
						if (charTwoAttackFairies[i].isAlive()) {
							var charOneResources = characterOne.getResources();
							for (var k in charOneResources) {
								if (charTwoAttackFairies[i].collidedWithResource(charOneResources[k])) {
									break;
								}
							}
						}
						if (!charTwoAttackFairies[i].isAlive()) {
							charTwoAttackFairies.splice(i, 1);
						}
					}
				}
				
				var shieldIndex;
				for (var i = charOneMovingShieldFairies.length - 1; i >= 0; --i) {
					charOneMovingShieldFairies[i].update();
					if (!charOneMovingShieldFairies[i].isMoving()) {
						shieldIndex = -VariableContainer.boardRowOffset + charOneMovingShieldFairies[i].getColRow().getSecond();
						charOneStationaryShieldFairies[shieldIndex] = charOneMovingShieldFairies[i];
						charOneMovingShieldFairies.splice(i, 1);
					} 
				}
				
				var shieldIndex;
				for (var i = charTwoMovingShieldFairies.length - 1; i >= 0; --i) {
					charTwoMovingShieldFairies[i].update();
					if (!charTwoMovingShieldFairies[i].isMoving()) {
						shieldIndex = -VariableContainer.boardRowOffset + charTwoMovingShieldFairies[i].getColRow().getSecond();
						charTwoStationaryShieldFairies[shieldIndex] = charTwoMovingShieldFairies[i];
						charTwoMovingShieldFairies.splice(i, 1);
					}
				}
				
				for (var i in charOneStationaryShieldFairies) {
					if (charOneStationaryShieldFairies[i] != null) {
						for (var j = charTwoAttackFairies.length - 1; j >=0 && charOneStationaryShieldFairies[i].isAlive(); --j) {
							if (charOneStationaryShieldFairies[i].collidedWithFairy(charTwoAttackFairies[j])) {
								if (!charTwoAttackFairies[j].isAlive) {
									charTwoAttackFairies.splice(j, 1);
								}					
							}
						}
						if (!charOneStationaryShieldFairies[i].isAlive()) {
							charOneStationaryShieldFairies[i] = null;
						}
					}	
				}
				
				for (var i in charTwoStationaryShieldFairies) {
					if (charTwoStationaryShieldFairies[i] != null) {
						for (var j = charOneAttackFairies.length - 1; j >=0 && charTwoStationaryShieldFairies[i].isAlive(); --j) {
							if (charTwoStationaryShieldFairies[i].collidedWithFairy(charOneAttackFairies[j])) {
								if (!charOneAttackFairies[j].isAlive) {
									charOneAttackFairies.splice(j, 1);
								}					
							}
						}
						if (!charTwoStationaryShieldFairies[i].isAlive()) {
							charTwoStationaryShieldFairies[i] = null;
						}
					}	
				}
				//0 is for player one
				//1 is for player two
				//based on server gamecontainer perspective.
				 clientHandlerOne.sendGameContainerString(encodeGameContainerData(0));
				 clientHandlerTwo.sendGameContainerString(encodeGameContainerData(1));
				if (characterOneRace.emptyRefillTypeString != null) { //do a check on race, alternatively
					characterOneRace.emptyRefillTypeString();
				}
				if (characterTwoRace.emptyRefillTypeString != null) { //do a check on race, alternatively
					characterTwoRace.emptyRefillTypeString();
				}
				if (characterOneRace.emptySynchString != null) { //do a check on race, alternatively
					characterOneRace.emptySynchString();
				}
				if (characterTwoRace.emptySynchString != null) { //do a check on race, alternatively
					characterTwoRace.emptySynchString();
				}
				boardOne.setShiftOccurred(false);
				boardTwo.setShiftOccurred(false);
				
				
				// Test Check for win statement - Comment out to not have game pause via the alert when you are testing beyond normal match lengths
				if (characterOne.isDead()) {
					
					// Update the database on victories
					DatabaseVariables[2].victory = true;
					DatabaseVariables[1].disconnected = false;
					DatabaseVariables[2].disconnected = false;
					DatabaseVariables[0].gameDuration = gameTimer.getElapsedTime();
					clientHandlerOne.sendEndGameMessage(0);
					clientHandlerTwo.sendEndGameMessage(1);
					gameTimer.togglePause();
				}
				else if (characterTwo.isDead()) {
					
					// Update the database on victories
					DatabaseVariables[1].victory = true;
					DatabaseVariables[1].disconnected = false;
					DatabaseVariables[2].disconnected = false;
					DatabaseVariables[0].gameDuration = gameTimer.getElapsedTime();
					clientHandlerOne.sendEndGameMessage(1);
					clientHandlerTwo.sendEndGameMessage(0);
					gameTimer.togglePause();
				}		
			}
		}
	}
	
	//initialAssets for networking to the two clients
	this.getInitialAssets = function(isServerPlayerOne) {
		var clientId = clientOne.id;
		if (!isServerPlayerOne) {
			clientId = clientTwo.id;
		}
		var tempBoardOne = boardOne.compressBoard();
		var tempBoardTwo = boardTwo.compressBoard();
		
		var playerOneRace = characterOneRace.getName().slice(0,1);
		var playerOneQueueString = "";
		if (playerOneRace == 's') {
			playerOneQueueString = characterOneRace.getInitQueueString();
		}
		var playerOneResourceList = characterOne.getResourcesArray().join("");
		var playerOneRowPos = characterOne.getRace().getColRow().getSecond();
		var playerOneInfo = {c: playerOneRace, rL: playerOneResourceList, 
			r: playerOneRowPos, q: playerOneQueueString};
		
		var playerTwoRace = characterTwoRace.getName().slice(0,1);
		var playerTwoQueueString = "";
		if (playerTwoRace == 's') {
			playerTwoQueueString = characterTwoRace.getInitQueueString();
		}
		var playerTwoResourceList = characterTwo.getResourcesArray().join("");
		var playerTwoRowPos = characterTwo.getRace().getColRow().getSecond();
		var playerTwoInfo = {c: playerTwoRace, rL: playerTwoResourceList, 
			r: playerTwoRowPos, q: playerTwoQueueString};
		
		if (isServerPlayerOne) {
			var tempAssets = {CID: clientId, uB: tempBoardOne, oB: tempBoardTwo, 
				uIn: playerOneInfo, oIn: playerTwoInfo};
		} else {
			tempAssets = {CID: clientId, uB: tempBoardTwo, oB: tempBoardOne, 
				uIn: playerTwoInfo, oIn: playerOneInfo};
		}
		return JSON.stringify(tempAssets);
	}
	
				
	//encode function for list with splitter designation
	function encodeList(splitterSymbol, list) {
		if(list == null)
			return null;
		
		var tempSplitter = splitterSymbol;
		var tString = "";
		for(var t = 0; t < list.length; t++) {
			if(t > 0)
				tempSlitter = splitterSymbol;
			else
				tempSlitter = "";
			tString = tString + tempSplitter + list[t];	
		}
		return tString;
	}
	
	//don't delete, testing encryption process
	//encode fairy specific objects.
	function encodeFairyList(splitterSymbol, list) {
		var tString = "";
		var tSplitter = splitterSymbol;
		var tLetter = "";
		for(var x = 0; x < list.length; x++) {
			if(x > 0)
				tSplitter = splitterSymbol;
			else
				tSplitter = "";
				
			//check type and attuned
			if(list[x] != null) {
				tLetter = list[x].getType().substring(0,1);
				if(list[x].getAttuned()){
					tLetter = tLetter.toUpperCase();
				}
				tString = tString + tSplitter + tLetter + list[x].getHealth();
			}else {
				tString = tString + tSplitter;
			}
		}
		return tString;
	}
	
	//function to encode GameContainerData to be packaged to Client
	function encodeGameContainerData(playerIdentification) {
		//push all data into list to encrypt later
		var encodedPlayerOneData = [];
		var encodedPlayerTwoData = [];
		
		
		var up = {};
		//for player one encryption
		if (playerIdentification == 0) { //sending to client 1
			//Player Data
			up.CID = clientOne.id;
			//encryted data of you player
			up.uIn = {};
			up.uIn.rL = encodeList("", characterOne.getResourcesArray());
			up.uIn.ss = characterOneRace.getSynchString();
			up.uIn.rI = characterOneRace.getRaceAbilityInfo();
			up.uIn.sft = boardOne.getShiftOccurred();
			up.uIn.spa = characterOne.getSpell().attunedCount();
			
			//Opponent Data
			//encrypted data of opp player
			up.oIn = {};
			up.oIn.a = clientHandlerTwo.getOpponentActionString(); //client 2's actions
			
			up.uB = boardOne.compressBoard();
			up.oB = boardTwo.compressBoard();
			
			up.oIn.rL = encodeList("",characterTwo.getResourcesArray());
			up.oIn.ss = characterTwoRace.getSynchString();
			up.oIn.rI = characterTwoRace.getRaceAbilityInfo();
			//up.oIn.r = characterTwoRace.getColRow().getSecond();
			//up.oIn.SFL = encodeFairyList("k", charTwoStationaryShieldFairies);
			up.oIn.sft = boardTwo.getShiftOccurred();
			//spell active flag
			up.oIn.spa = characterTwo.getSpell().attunedCount();
		} else if (playerIdentification == 1) { //sending to client 2
			//Player Data
			up.CID = clientTwo.id;	
			//encryted data of you player
			up.uIn = {}; 
			up.uIn.rL = encodeList("", characterTwo.getResourcesArray());
			up.uIn.ss = characterTwoRace.getSynchString();
			up.uIn.rI = characterTwoRace.getRaceAbilityInfo();
			up.uIn.sft = boardTwo.getShiftOccurred();
			up.uIn.spa = characterTwo.getSpell().attunedCount();
			
			//Opponent Data
			//encrypted data of opp player
			up.oIn = {};
			up.oIn.a = clientHandlerOne.getOpponentActionString(); //client 1's actions
			
			up.uB = boardTwo.compressBoard();
			up.oB = boardOne.compressBoard();
			
			up.oIn.rL = encodeList("",characterOne.getResourcesArray());
			up.oIn.ss = characterOneRace.getSynchString();
			up.oIn.rI = characterOneRace.getRaceAbilityInfo();
			up.oIn.sft = boardOne.getShiftOccurred();
			//spell active flag
			up.oIn.spa = characterOne.getSpell().attunedCount();
			
		} else {
			return null;
		}
		return up;		
	}
}

module.exports = GameContainer;