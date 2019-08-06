/**
 *	This file will control the boards that spawn as well as setting their fields
 *	This file will also handle the Character input for each Character
 *	This file will also handle fairy and shield fairy collisions
 *
 *	function GameContainer(initAssets, serverCommunicator, background, winDestination,
 *			characterOneRaceName, characterTwoRaceName, iHandlerOne, iHandlerTwo, playerOneAiDiff, playerTwoAiDiff)
 *			: Constructor for game
 *			Game Container.
 * function initialSpawnBoard(): Initialize spawn boards with debug board or board director.
 * function disableSpawn():  Disable spawn for both player one and player two board directors.
 * function enableSpaw(): Enable spawn for both player one and two board directors.
 * function getCharacterOne(): Returns characterOne value
 * function getCharacterTwo(): Returns characterTwo value
 * function pauseGame():  Pauses the game for debug
 * function isGamePaused():  Return boolean value for game is paused.
 * function setNextAICommand(): Sets the nextCommand for AI.
 * function update(): Function updates all fairies, characters, resources, and board.		
 * function inputHandlerDestruct(): Destruct iHandlerOne and iHandlerTwo.
 * function draw():  Draw background, board, character, fairies, and border. 
 * function activateAttack(active (boolean)):  Enables attack for boardOne or boardTwo.	
 * function activateShield(active (boolean)): Enables shield for boardOne or boardTwo.
 * function resetCharacters(resetOne (boolean), resetTwo (boolean)): Resets either characterOne, 
 * 		and/or characterTwo
 * function resetBoard(resetOneBoard (boolean), resetTwoBoard (boolean)): Resets either
 * 		boardOne and characterOne, and/or boardTwo and characterTwo.
 * function initializeBoard(boardOneSetup (board), boardTwoSetup (board)): Initializes boardOne
 * 		and boardTwo with the arguments.  Before that it resets both.
 * function resetCharacterResourceArray(resetOneResource (boolean), resetTwoResource (boolean)): 
 * 		resets characterOne and/or characterTwo resource depending on the flags.
 * function get_boardOne(): Returns boardOne.
 * function getHighlightedOrbList(): Returns boardDirectorOne HighlightedOrbList.
 * function initializeStartGameSequence(menuTimer (timer), menuInputHandler (inputHandler)):
 * 		initialize game sequence timer, spawnboards.
 * function resourceHighLight(): highlight orbs with highlightOrb function for tutorialHandler.
 * function runStartGameSequence(menuTimer (timer)): Runs the start game sequence with text, music
 * 		and timing.
 * function dangerZoneUpdate(): Draws the danger zone for resource damage.
 * function runEndGameSequence(menuTimer (timer)): Runs the end Game Sequence to clean up data, inputHandler, and end
 * 		game sequence.
 * function drawBorders(): Draws border for game battle sequence.
**/

function GameContainer(initAssets, serverCommunicator, background, winDestination, 
			characterOneRaceName, characterTwoRaceName, iHandlerOne, iHandlerTwo, playerOneAiDiff, playerTwoAiDiff) {	
	/**Private Variables and Initialization**/
	initAssets = JSON.parse(initAssets);
	
	var gameResults = {winner: null, destination: winDestination};
	
	//animation enlarging variable
	var sizeIncrement = 0;
	
	// Set values based on the JSON string
	var characterOneRace;
	var characterTwoRace;
	
	// This changes the canvas blah blah get back to work.
	forceResize(variableContainer.gameContainerNumColumns, variableContainer.gameContainerNumRows);
	
	SoundJS.stop("menu music");
	
	//boolean to flip drawing of targets
	var tutorialTargetResourceDrawing = true;
	
	//this also handles local character setting up.
	//For input handling setup
	var otherPlayerNum = 0;
	if(!variableContainer.isLocal && initAssets != null) {
		//NETWORK
		// Player 1
		if (initAssets.uIn.c == "w") {
			characterOneRace = new Witch(new Pair(variableContainer.borderDimension, initAssets.uIn.r));
		} else if (initAssets.uIn.c == "s") {
			characterOneRace = new Steampunk(new Pair(variableContainer.borderDimension, initAssets.uIn.r));
		} else {
			characterOneRace = new Angel(new Pair(variableContainer.borderDimension, initAssets.uIn.r));
		}
		iHandlerOne = new InputHandler(1, characterOneRace, variableContainer.UPONE, variableContainer.DOWNONE, variableContainer.LEFTONE, variableContainer.RIGHTONE, 
								   variableContainer.ACTION_AONE, variableContainer.ACTION_BONE, 1);
		serverCommunicator.setIHandlerSendActions(iHandlerOne);
	
		
		//player 2
		if (initAssets.oIn.c == "w") {
			characterTwoRace = new Witch(new Pair(variableContainer.gameContainerNumColumns - variableContainer.borderDimension - 1, initAssets.oIn.r));
		} else if (initAssets.oIn.c == "s"){
			characterTwoRace = new Steampunk(new Pair(variableContainer.gameContainerNumColumns - variableContainer.borderDimension - 1, initAssets.oIn.r));
		} else {
			characterTwoRace = new Angel(new Pair(variableContainer.gameContainerNumColumns - variableContainer.borderDimension - 1, initAssets.oIn.r), serverCommunicator);
		} 
		iHandlerTwo = new InputHandler(otherPlayerNum, characterTwoRace, variableContainer.UPTWO, variableContainer.DOWNTWO, variableContainer.LEFTTWO, variableContainer.RIGHTTWO, 
								   variableContainer.ACTION_ATWO, variableContainer.ACTION_BTWO, -1);
		serverCommunicator.setOpponentIHandler(iHandlerTwo); //since your client is always player 1
	} else { //local
		//Player 1
		if(characterOneRaceName == "witch") {
			characterOneRace = new Witch(new Pair(variableContainer.borderDimension, variableContainer.boardRowOffset));
		} else if (characterOneRaceName == "steampunk") {
			characterOneRace = new Steampunk(new Pair(variableContainer.borderDimension, variableContainer.boardRowOffset));
		} else {
			characterOneRace = new Angel(new Pair(variableContainer.borderDimension, variableContainer.boardRowOffset));
		}
		if((iHandlerOne != null) && (iHandlerOne != true)) {
			iHandlerOne.setRace(characterOneRace);
		}
		
		//Player 2
		if(characterTwoRaceName == "witch") {
			characterTwoRace = new Witch(new Pair(variableContainer.gameContainerNumColumns - variableContainer.borderDimension - 1, variableContainer.boardRowOffset));
		} else if (characterTwoRaceName == "steampunk") {
			characterTwoRace = new Steampunk(new Pair(variableContainer.gameContainerNumColumns - variableContainer.borderDimension - 1, variableContainer.boardRowOffset));
		} else {
			characterTwoRace = new Angel(new Pair(variableContainer.gameContainerNumColumns - variableContainer.borderDimension - 1, variableContainer.boardRowOffset));
		}
		if((iHandlerTwo != null) && (iHandlerTwo != true)) {
			iHandlerTwo.setRace(characterTwoRace);
		}
	}
	
	//Changes the background based on player one's sprite. 
	//    Removed by Ryan dont put back without asking!
	//background = spriteManager.background[characterOneRace.getName()];
	
	var gameTimer = new Timer();
	
	var xMirroredOffset = variableContainer.gameContainerNumColumns - variableContainer.boardColumnOffset - 1;
	var boardXOffset = variableContainer.boardColumnOffset;
	var boardYOffset = variableContainer.boardRowOffset + variableContainer.drawYOffset;
	//For tutorialHandler AI.
	var nextAICommand = "p";
	
	var boardOne = new Board("left", new Pair(boardXOffset, boardYOffset), gameTimer, characterOneRace.getName());
	var boardTwo = new Board("right", new Pair(xMirroredOffset, boardYOffset), gameTimer, characterTwoRace.getName()); //originally characterOneRace.getName(). think this was a typo
	
	//These are the variables needed to activate the danger zone visual/audio cues
	var playingDangerTheme = false;
	var dangerZoneCharOneActive = false;
	var dangerZoneCharTwoActive = false;
	var charOneDangerZone = false;
	var charTwoDangerZone = false;
	var charOneDangerZoneTimer = new CountDownTimer(gameTimer, 500);
	var charTwoDangerZoneTimer = new CountDownTimer(gameTimer, 500);
	
	// The timer for the game.
	
	if((iHandlerOne != null) && (iHandlerOne != true)) {
		iHandlerOne.setTogglePause(gameTimer.togglePause);
		iHandlerOne.setCheckPause(gameTimer.isPaused);
	}
	if((iHandlerTwo !=null) && (iHandlerTwo != true)){
		iHandlerTwo.setCheckPause(gameTimer.isPaused);
	}
	//set the board reference to character
	characterOneRace.setBoard(boardOne); 
	characterTwoRace.setBoard(boardTwo);
	
	
	//for network
	if (!variableContainer.isLocal && initAssets != null) {
		if (characterOneRace.getName() == variableContainer.races[1]) {
			characterOneRace.initQueue(initAssets.uIn.q);
		}
		if (characterTwoRace.getName() == variableContainer.races[1]) {
			characterTwoRace.initQueue(initAssets.oIn.q);
		}
	} else if(variableContainer.isLocal) {
		if(characterOneRace.getName() == variableContainer.races[1]) {
			characterOneRace.initQueue();
		}
		if(characterTwoRace.getName() == variableContainer.races[1]) {
			characterTwoRace.initQueue();
		}
	}
	
	/*If iHandlerOne or iHandlerTwo is null this should indicate that the player wants to have an AI opponent, maybe boolean required for networked game - talk to ryan,
	  this means that a message should be sent to the server to start running AI instead for either character.*/
	//This will also need to spawn the Characters themselves
	//character needs playerAiDiff
	var characterOne = new Character(true, characterOneRace, iHandlerOne, gameTimer, playerOneAiDiff); 
	var characterTwo = new Character(false, characterTwoRace, iHandlerTwo, gameTimer, playerTwoAiDiff); 
	
	// This will allocate the shield area space for both Characters on the gameBoard.
	// Probably just arrays that hold the spaces for the shield fairies
	
	//Fairy Attack list
	var charOneAttackFairies = [];
	var charTwoAttackFairies = [];
	
	var charOneMovingShieldFairies = [];
	var charTwoMovingShieldFairies = [];
	
	var charOneStationaryShieldFairies = [];
	for (var i = 0; i < variableContainer.boardDimensions.getSecond(); i++) {
		charOneStationaryShieldFairies[i] = null;
	}
	var charTwoStationaryShieldFairies = [];
	for (var i = 0; i < variableContainer.boardDimensions.getSecond(); i++) {
		charTwoStationaryShieldFairies[i] = null;
	}
	
	//only for local, not sure if online spells work
	if(!variableContainer.isLocal && initAssets != null) {		
		boardOne.initializeCharacter(characterOne); 
		boardTwo.initializeCharacter(characterTwo);

		boardOne.decompressBoard(initAssets.uB);
		boardTwo.decompressBoard(initAssets.oB);
	
		serverCommunicator.setBoardReferences(boardOne, boardTwo);
		serverCommunicator.setPlayerRef(characterOne, characterTwo);
	} else {
		characterOne.getSpell().initialize(boardOne);
		characterTwo.getSpell().initialize(boardTwo);
		
		var boardDirectorOne = new BoardDirector(boardOne, gameTimer, null);
		var boardDirectorTwo = new BoardDirector(boardTwo, gameTimer, null);
	}
	
	var sequenceTimer;
	
	//variables that control the game start animation thing
	var gameStarted = false;
	var gameFinish = false;
	var endGame = false;
	var endText;
	if(variableContainer.isLocal) {
		endText = "Player 1 WINS!";
	} else {
		endText = "";
	}
	
	var sequenceControl = 0;
	var endGameTextBox;
	var angleIncrement = 5;
	var currentAngle = 0;
	
	//Spawns board at the initial step of the game
	//Also use debug board under a flag.
	this.initialSpawnBoards = function(emptySpawn) {
		boardOne.initializeCharacter(characterOne);
		boardTwo.initializeCharacter(characterTwo);
		if (!emptySpawn) {
			// Spawn boards
			if (variableContainer.playerOneDebug) {
				boardDirectorOne.newInitialize(predefinedSpawn.playerOneNewDebugBoard);		
			} else {
				boardDirectorOne.newInitialize(null, variableContainer.numInitColumns);
			}
			if (variableContainer.playerTwoDebug) {
				boardDirectorTwo.newInitialize(predefinedSpawn.playerTwoNewDebugBoard, variableContainer.numInitColumns);		
			} else {
				boardDirectorTwo.newInitialize(null, variableContainer.numInitColumns);
			}
		}
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
	
	//returns characterOne for tutorialHandler
	this.getCharacterOne = function() {
		return characterOne;
	}
	
	//returns characterTwo for tutorialHandler
	this.getCharacterTwo = function() {
		return characterTwo;
	}
	
	//Allows other classes to pause/unpause the game
	this.pauseGame = function(){
		gameTimer.togglePause();
	}
	
	//Allows other classes to see if game is paused
	this.isGamePaused = function(){
		return gameTimer.isPaused();
	}
	
	//set AI command
	this.setNextAICommand = function(nextCommand) {
		if(nextCommand != undefined) 
			nextAICommand = nextCommand;
		else
			nextAICommand = "p";
		
	}
	
	//Initialize after characterOne and characterTwo is constructed

	var wrapper = this;
	/*Public Functions*/
	// Need to check for paused input
	//Updates game for both boards, players, fairies, and resources.
	this.update = function() {
		//if you compare the number of times this prints in the javascript console with the updateCounter
									//in server's update, we can see how off they are from each other. it turns out that at the start
									//of the game, the updates are pretty well-synched, but over time the client becomes more and more behind
									//since it has to draw more and more objects while the server doesn't have to draw anything.
									//after a couple of minutes, client was behind by over 200 updates :/
										
		//Check if the canvas needs to be resized
		//resizeCellDimensions(variableContainer.gameContainerNumColumns, variableContainer.gameContainerNumRows);
		if (!gameTimer.isPaused()) {
			//console.log("begin update"); //use this one instead
            characterOne.updateAI(charOneStationaryShieldFairies, charTwoStationaryShieldFairies, characterTwo.getResourcesArray(), nextAICommand);
            characterTwo.updateAI(charTwoStationaryShieldFairies, charOneStationaryShieldFairies, characterOne.getResourcesArray(), nextAICommand);
			characterOne.update();
			characterTwo.update();
			this.dangerZoneUpdate();
			
				
			boardOne.update(); //board's update doesn't actually use the parameters yet
			boardTwo.update();
			
			
			if (boardOne.getAttackFairies().length > 0) {
				charOneAttackFairies = charOneAttackFairies.concat(boardOne.getAttackFairies());
				boardOne.deleteAttackFairies();
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
			
			
			
			// Use if statement to check if either player out of resources
			// If so, call gameEnd() and pass who won/lost into it
			// out of curiosity, is there anything that keeps track of number of
			// living resources on each players side?
			// blah blah, need character class done
			
			// Check each fairyList for collisions
			for (var i = charOneAttackFairies.length - 1; i >= 0; --i) {
				if (!charOneAttackFairies[i].isMoving()) {
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
					if (charOneAttackFairies[i].isAlive()) {
						var charTwoResources = characterTwo.getResources();
						for (var l in charTwoResources) {
							if (charOneAttackFairies[i].collidedWithResource(charTwoResources[l])) {
								if (characterTwo.hasLowHealth() && !playingDangerTheme) {
									SoundJS.stop("battle music");
									SoundJS.play("danger theme", SoundJS.INTERRUPT_LATE, 1, true);
									playingDangerTheme = true;
									//stop battle theme and play danger theme if it's not already playing
								}
								if(characterTwo.hasLowHealth() && !dangerZoneCharTwoActive){
									dangerZoneCharTwoActive = true;
									charTwoDangerZoneTimer.reset(500);
								}
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
			
				if (!charTwoAttackFairies[i].isMoving()) {
					charTwoAttackFairies.splice(i, 1);
				} else {
					charTwoAttackFairies[i].update();
					for (var j = charOneMovingShieldFairies.length - 1; j >=0 && charTwoAttackFairies[i].isAlive(); --j) {
						if (charTwoAttackFairies[i].collidedWithFairy(charOneMovingShieldFairies[j])) {
							if (!charOneMovingShieldFairies[j].isAlive) {
								charOneMovingShieldFairies.splice(j, 1);
							}					
						}
					}
					if (charTwoAttackFairies[i].isAlive()) {
						var charOneResources = characterOne.getResources();
						for (var k in charOneResources) {
							if (charTwoAttackFairies[i].collidedWithResource(charOneResources[k])) {
								if (characterOne.hasLowHealth() && !playingDangerTheme) {
									SoundJS.stop("battle music");
									SoundJS.play("danger theme", SoundJS.INTERRUPT_LATE, 1, true);
									playingDangerTheme = true;
									//stop battle theme and play danger theme if it's not already playing
								}
								if(characterOne.hasLowHealth() && !dangerZoneCharOneActive){
									dangerZoneCharOneActive = true;
									charOneDangerZoneTimer.reset(500);
								}
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
					shieldIndex = -variableContainer.boardRowOffset + charOneMovingShieldFairies[i].getColRow().getSecond();
					charOneStationaryShieldFairies[shieldIndex] = charOneMovingShieldFairies[i];
					charOneMovingShieldFairies.splice(i, 1);
				} 
			}
			
			var shieldIndex;
			for (var i = charTwoMovingShieldFairies.length - 1; i >= 0; --i) {
				charTwoMovingShieldFairies[i].update();
				if (!charTwoMovingShieldFairies[i].isMoving()) {
					shieldIndex = -variableContainer.boardRowOffset + charTwoMovingShieldFairies[i].getColRow().getSecond();
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
			
			if(variableContainer.isLocal) {
				boardDirectorOne.update();
				boardDirectorTwo.update();
			}
			
		} else if (endGame) {			 
			if(variableContainer.isLocal) {
				if (characterOne.isDead()) {
					this.inputHandlerDestruct();
					gameResults.winner = false;
				}else if (characterTwo.isDead()) {
					this.inputHandlerDestruct();
					gameResults.winner = true;
				}
			}else if(!variableContainer.isLocal) {
				gameResults.winner = false;
			}			
			
			
			variableContainer.isLocal = false;
			return gameResults;
		}
		return null;
	}
	
	//destructs the inputhandler to clean up data.
	this.inputHandlerDestruct = function() {
		if((iHandlerOne != null) && (iHandlerOne != true))
			iHandlerOne.destructor();
		if((iHandlerTwo != null) && (iHandlerTwo != true))	
			iHandlerTwo.destructor();
	}
	
	//draw sequence for character, resource, fairies, borders, background.
	this.draw = function() {
		// SpriteManager draw background
		background.draw(.5, 1);
		// draw border
		this.drawBorders();
		// draw ect items
		characterOne.drawEtc();
		characterTwo.drawEtc();
		// draw board
		boardOne.draw();
		boardTwo.draw();
		
		// characters
		characterOne.draw();
		characterTwo.draw();
		
		//branch between network or local
		if(variableContainer.isLocal) {
			boardDirectorOne.draw();
			boardDirectorTwo.draw();
		}
		
		// fairies
		for (var i in charOneStationaryShieldFairies) {
			if (charOneStationaryShieldFairies[i] != null) {
				charOneStationaryShieldFairies[i].draw();
			}
		}
		
		for (var i in charTwoStationaryShieldFairies) {
			if (charTwoStationaryShieldFairies[i] != null) {
				charTwoStationaryShieldFairies[i].draw();
			}
		}
		
		for (var i in charOneMovingShieldFairies) {
			charOneMovingShieldFairies[i].draw();
		}
		
		for (var i in charTwoMovingShieldFairies) {
			charTwoMovingShieldFairies[i].draw();
		}
		
		for (var i in charOneAttackFairies) {
			charOneAttackFairies[i].draw();
		}
		
		for (var i in charTwoAttackFairies) {
			charTwoAttackFairies[i].draw();
		}
	}
	
	
	//These public functions will activate or deactivate
	//attacks and shields for tutorials (only applies
	//for boardOne)
	//Tutorial specifically
	this.activateAttack = function(active){
		if(active){
			boardOne.enableAttack();
		}else if (!active) {
			boardOne.disableAttack();
		}
	}
	
	//Enables shields for tutorialHandler specifically.
	this.activateShield = function(active){
		if(active){
			boardOne.enableShield();
		}else if (!active) {
			boardOne.disableShield();
		}
	}
	
	
	//This will reset both boards if needed
	//Resets character first, then clears the board
	//After that it'll load any more orbs on the board
	//split up reset system
	this.resetBoards = function(boardOneSetup, boardTwoSetup){
		characterOne.resetCharacter();
		boardOne.resetBoard();
		boardDirectorOne.initialize(boardOneSetup);
		characterOne.resetResourceArray();
		characterTwo.resetCharacter();
		boardTwo.resetBoard();
		
		characterTwo.resetResourceArray();
	}
	
	this.resetPlayerOne = function(boardSetup) {
		characterOne.resetCharacter();
		boardOne.resetBoard();
		boardDirectorOne.newInitialize(boardSetup);
	}
	
	//resets character values.
	this.resetCharacters = function(resetOne, resetTwo) {
		if(resetOne)
			characterOne.resetCharacter();
		if(resetTwo)
			characterTwo.resetCharacter();
	}
	
	//resets board and character
	this.resetBoard = function(resetOneBoard, resetTwoBoard) {
		if(resetOneBoard) {
			boardOne.resetBoard();
			characterOne.resetCharacter();
		}if(resetTwoBoard) {
			boardTwo.resetBoard();
			characterTwo.resetCharacter();
		}
	}	
	
	//initialize board with board setup from variables.
	this.initializeBoard = function(boardOneSetup, boardTwoSetup) {
		if(boardOneSetup != null) {
			boardOne.resetBoard();
			boardDirectorOne.initialize(boardOneSetup);
		}
		if(boardTwoSetup != null) {
			boardTwo.resetBoard();
			boardDirectorTwo.initialize(boardTwoSetup);
		}
	}
	
	//Resets the character Resource array to full if requested.
	//For tutorialHandler to use.
	this.resetCharacterResourceArray = function(resetOneResource, resetTwoResource) {
		if(resetOneResource)
			characterOne.resetResourceArray();
		if(resetTwoResource)
			characterTwo.resetResourceArray();
	}
	
	//This will return a reference to Board One for 
	//tutorialHandler
	this.get_boardOne = function(){
		return boardOne;
	}
	
	//This will return a list of the highlighted Orbs from
	//boardDirector to tutorialHandler
	this.getHighlightedOrbList = function(){
		return boardDirectorOne.getHighlightedOrbList();
	}
	
	//This initializes the start game sequence.
	this.initializeStartGameSequence = function(menuTimer, menuInputHandler) {
		gameTimer.togglePause();
		sequenceTimer = new CountDownTimer(menuTimer, 1000);
		gameStarted = true;
		endGameTextBox = new TextBox(new Pair(variableContainer.gameContainerNumColumns/2 - 2.5, 8), new Pair(5, 4), null, null, null, false, menuInputHandler, "Go back to title screen");
		
		if(variableContainer.isLocal) {
			this.initialSpawnBoards();
		}
	}
	
	//This will highlight all the resources at the beginning of the game
	var resourceHighlight = function() {
		for(var i = 0; i < variableContainer.boardDimensions.getSecond(); ++i) {
			switch(sequenceControl) {
				case 0:
					highlightOrb(boardTwo.getCharacter().getResourceIndividual(i).getColRow().getFirst(), i + variableContainer.boardRowOffset, currentAngle);
					break;
				case 1:
					highlightOrb(boardOne.getCharacter().getResourceIndividual(i).getColRow().getFirst(), i + variableContainer.boardRowOffset, currentAngle);
					break;
				case 2:
					highlightOrb(boardTwo.getCharacter().getResourceIndividual(i).getColRow().getFirst(), i + variableContainer.boardRowOffset, currentAngle);
					highlightOrb(boardOne.getCharacter().getResourceIndividual(i).getColRow().getFirst(), i + variableContainer.boardRowOffset, currentAngle);
					break;
			}
		}
	}
	
	//This runs the start game sequence. Both updates and draws
	this.runStartGameSequence = function() {
		if (gameTimer.isPaused() && gameStarted) {
			currentAngle = (currentAngle + angleIncrement) % 360;
			//The code that draws the sequence to screen
			var ctx = context2D;
			var font = variableContainer.hennyPennyFont;
			var fontSize = 150;
			ctx.textAlign = "center";
			ctx.fillStyle = "rgba(255,255,255,1)";
			addShadow();
			switch(sequenceControl) {
				case 0:
					ctx.font = '' + ((fontSize + sizeIncrement) * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;  //'Italic 30px Sans-Serif' ;
					ctx.fillText("3", (variableContainer.gameContainerNumColumns/2) * variableContainer.cellDimensions.getFirst(), (variableContainer.gameContainerNumRows/2 + 
						sizeIncrement/(variableContainer.cellDimensions.getSecond() * 4))  * variableContainer.cellDimensions.getSecond());
					break;
				
				case 1:
					ctx.font = '' + ((fontSize + sizeIncrement) * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;  //'Italic 30px Sans-Serif' ;
					ctx.fillText("2", (variableContainer.gameContainerNumColumns/2) * variableContainer.cellDimensions.getFirst(), (variableContainer.gameContainerNumRows/2 + 
						sizeIncrement/(variableContainer.cellDimensions.getSecond() * 4))  * variableContainer.cellDimensions.getSecond());
					break;
					
				case 2:
					ctx.font = '' + ((fontSize + sizeIncrement) * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;  //'Italic 30px Sans-Serif' ;
					ctx.fillText("1", (variableContainer.gameContainerNumColumns/2) * variableContainer.cellDimensions.getFirst(), (variableContainer.gameContainerNumRows/2 + 
						sizeIncrement/(variableContainer.cellDimensions.getSecond() * 4))  * variableContainer.cellDimensions.getSecond());
					break;
					
				case 3:
					ctx.font = '' + ((fontSize + sizeIncrement) * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;  //'Italic 30px Sans-Serif' ;
					ctx.fillText("PUZZLE!", (variableContainer.gameContainerNumColumns/2) * variableContainer.cellDimensions.getFirst(), (variableContainer.gameContainerNumRows/2 + 
						sizeIncrement/(variableContainer.cellDimensions.getSecond() * 4))  * variableContainer.cellDimensions.getSecond());
					break;
			}
			removeShadow();
			sizeIncrement += 5;
			if (sequenceTimer.isExpired()) {
				//The sequenceControl is how many times sequenceTimer is reset
				if (sequenceControl < 3) {
					++sequenceControl;
					sequenceTimer.reset(1000);
				} else {
					gameStarted = false;
					gameTimer.togglePause();
					sequenceControl = 0;
					SoundJS.play("battle music", SoundJS.INTERRUPT_LATE, 1, true);
				}
				sizeIncrement = 0;
			}
		}
	}
	
	//This is a function that checks if a character is in the dangerZone and draws the appropriate
	//resource column
	this.dangerZoneUpdate = function(){
		if(dangerZoneCharOneActive){
			if(charOneDangerZoneTimer.isExpired()){
				charOneDangerZone = !charOneDangerZone;
				charOneDangerZoneTimer.reset(500);
			}
			if(charOneDangerZone){
				characterOne.set_resourceCol(1);
			} else{
				characterOne.set_resourceCol(0);
			}
		}
		if(dangerZoneCharTwoActive){
			if(charTwoDangerZoneTimer.isExpired()){
				charTwoDangerZone = !charTwoDangerZone;
				charTwoDangerZoneTimer.reset(500);
			}
			if(charTwoDangerZone){
				characterTwo.set_resourceCol(1);
			} else{
				characterTwo.set_resourceCol(0);
			}
		}
	}
	
	//runs the endGameSequence to set up text for results of match, and destructing of input and AI
	//and returning to menu.  Works for both local and networking.
	this.runEndGameSequence = function() {
		if (!gameFinish) {
			if((!variableContainer.isLocal && (serverCommunicator.getEndGameStatus() >= 0)) ||
				(variableContainer.isLocal && (characterOne.isDead() || characterTwo.isDead()))) {
				gameFinish = true;
				endGameTextBox.changeText("Match time: " + Math.floor(gameTimer.getElapsedTime()) + " s     Click to go back to start.");
				sequenceTimer.reset(500);
				SoundJS.stop("battle music");
				SoundJS.stop("danger theme");
				endGame = null;
				if (!variableContainer.isLocal) {
					if (endText == "") {
						if (serverCommunicator.getEndGameStatus() == 0) {
							SoundJS.play("battle defeat", SoundJS.INTERRUPT_LATE, 1);
							endText = "YOU LOSE!";
						} else if (serverCommunicator.getEndGameStatus() == 1) {
							SoundJS.play("battle victory", SoundJS.INTERRUPT_LATE, 1);
							endText = "YOU WIN!";
						} else if (serverCommunicator.getEndGameStatus() == 2) {
							SoundJS.play("battle victory", SoundJS.INTERRUPT_LATE, 1);
							endText = "Disconnected";
						}
					}
					
				} else if (variableContainer.isLocal) {
					if (characterOne.isDead()) {
						endText = "Player 2 WINS!";
					}
					SoundJS.play("battle victory", SoundJS.INTERRUPT_LATE, 1);
				}
			}
		}
		if (gameFinish) {
			if (sequenceTimer.isExpired() && endGame == null) {
				gameTimer.togglePause();
				endGame = false;
			}
			characterOne.destructAI();
            characterTwo.destructAI();
			var ctx = context2D;
			var font = variableContainer.hennyPennyFont;
			var fontSize = null;
			ctx.textAlign = "center";
			ctx.fillStyle = "rgba(F,F,F,1)";
			if (!variableContainer.isLocal) {
				fontSize = 200;
				ctx.font = '' + (fontSize * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;
				addShadow();
				ctx.fillText(endText, (variableContainer.gameContainerNumColumns/2) * variableContainer.cellDimensions.getFirst(), 
						(variableContainer.gameContainerNumRows/2)  * variableContainer.cellDimensions.getSecond());
				removeShadow();
			}else if(variableContainer.isLocal) {
				var player1Status = "WINNER!";
				var player2Status = "LOSER!";
				if(endText == "Player 2 WINS!") {
					player1Status = "LOSER!";
					player2Status = "WINNER!";
				}
				fontSize = 130;
				context2D.textAlign = "center";
				context2D.fillStyle = "rgba(F,F,F,1)";
				addShadow();
				context2D.font = '' + (fontSize * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;
				context2D.fillText(player1Status, (variableContainer.gameContainerNumColumns/5) * variableContainer.cellDimensions.getFirst(), 
							(variableContainer.gameContainerNumRows/2) * variableContainer.cellDimensions.getSecond());

				context2D.font = '' + (fontSize * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;
				context2D.fillText(player2Status, 4 * (variableContainer.gameContainerNumColumns/5) * variableContainer.cellDimensions.getFirst(), 
						(variableContainer.gameContainerNumRows/2)  * variableContainer.cellDimensions.getSecond());
				removeShadow();

			}
			endGameTextBox.draw();
			
			//client and local branch split off
			if(!variableContainer.isLocal) {	
				if (endGameTextBox.update()) {
					endGame = true;
				}
				this.inputHandlerDestruct();

			}else if (variableContainer.isLocal) {
			
				if (sequenceTimer.isExpired() && endGame == null) {
					gameTimer.togglePause();
					endGame = false;
				}
				if (endGameTextBox.update())
					endGame = true;
			}
		}
	}
	
	//Draws the borders around the Game container
	this.drawBorders = function() {
	var halfColCount = variableContainer.gameContainerNumColumns / 2;
		spriteManager["border"]["top"].draw(0, 0);
		spriteManager["border"]["top"].drawFlipImage(halfColCount, 0);
		spriteManager["border"]["bottom"].draw(0, variableContainer.gameContainerNumRows - 1);
		spriteManager["border"]["bottom"].drawFlipImage(halfColCount, variableContainer.gameContainerNumRows - 1);
		spriteManager["border"]["side"].draw(0, 1);
		spriteManager["border"]["side"].drawFlipImage(variableContainer.gameContainerNumColumns - 1, 1);
	}
	
	//affects only context2D variable
	function addShadow() {
		context2D.shadowColor = "black";
		context2D.shadowOffsetX = 3;
		context2D.shadowOffsetY = 2;
		context2D.shadowBlur = 1;
	}
	
	//affects only context2D variable
	function removeShadow() {
		context2D.shadowColor = null;
		context2D.shadowOffsetX = 0;
		context2D.shadowOffsetY = 0;
		context2D.shadowBlur = 0;
	}
}