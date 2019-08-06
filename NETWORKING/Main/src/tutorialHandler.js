/** This class was built to act as a shell for GameContainer. This is used to put in 
*		anything that will overlay on top of the core Game.
*
* function tutorialHandler(tutorialData, AIActive, playerOneSelector, playerTwoSelector, 
*		gameWinDestination, menuInput) : Constructor Function for tutorialHandler
*
* function get_tutorialCurSeq() : Accessor that returns the current tutorial sequence
*
* function startGameContainer () : Creates a Game Container and initializes several 
*		variables for tutorialHandler to use
*
* function tutorialUpdate() : Function that updates the tutorial related UI and determines 
*		if the tutorial should move to the next part of the sequence.
*
* function update(): This function is the update that is called from menuNavigator to 
*		update GameContainer and any part of the tutorial.
*
* function resourceUpdate() : Function that updatees the resources to see if the target 
* 		has been destroyed.
*
* function resourceDraw() : Function highlights the resources that are targeted.
*
* function tutorialDraw() : Function that draws all the UI elements of the tutorial.
*
* function draw() : This is the draw that gameContainer calls.
*
* function spliceTutorialResourceTarget(index) : This function splices a resource from the 
* 		resourceList if a resource has been destroyed.
*
* function getControlActive() : An Accessor function that returns if there's a specific 
* 		set of controls that can/can't be used.
*
* function updateControlTriggers() : This is an update to make sure that the control
* 		triggers are always updated.
*
* function newTutorialData(nTutorialData) : This function will replace the current
* 		tutorialData with another one, like if they did Steampunk tutorial and then 
*  		switched to Witch.
*
* function incrementShiftDestination() : This function moves the highlighted destination
* 		to the next space. If there aren't any left, then increment triggerCount.
*
* function get_spawnOneActive() : Accessor that returns if board One should be spawning.
*
* function get_spawnTwoActive() : Accessor that returns if board Two should be spawning.
*
* function get_NextAIStep() : This Function will increment to the next AI script and
* 		increment the triggerCount if there is no more steps left within the AI script.
*
* function incrementShiftTutorialListSeq() : Moves the tutorial to the next sequence.
*
* function resetSetup() : This function resets the entire board fro teh tutorial.
*
* function runStartGameSequence() : An empty function that is used bcause MenuNavigator 
* 		has to call it for regular games. Prevents game from crashing.
*
* function runEndGameSequence() : An empty function that is used bcause MenuNavigator 
* 		has to call it for regular games. Prevents game from crashing.
**/



function tutorialHandler(tutorialGenerator, AIActive, playerOneSelector, playerTwoSelector, gameWinDestination, menuInput){
	//This variable is used to hold and regulate the current tutorialData 
	//that's being read in.
	
	// Holds the tutorial generated by the tutorialGenerator
	var goalList;
	var currentGoal = null;
	
	//flag for endgame
	var tutorialEnd = false;
	//This holds the GameContainer
	var activeGameContainer = null;

	//Variable that holds the Character 
	var characterOne = null;
	var activeSignal = false;
	
	//pause
	var pauseCount = 0;
	var pauseLimit = 50;
	var pauseUsed = false;
	
	var gameResults = {winner: null, destination: gameWinDestination};
	
	
	
	
	//Data that is needed for GameContainer to function with tutorial handling
	var characterTwo;
	
	
	//This will create the InputHandler for CharacterOne
	var characterOneHandler = new InputHandler(1, playerOneSelector.race, 
		variableContainer.UPONE, variableContainer.DOWNONE, 
		variableContainer.LEFTONE, variableContainer.RIGHTONE, 
		variableContainer.ACTION_AONE, variableContainer.ACTION_BONE, 
		variableContainer.NEW_COLUMNONE);

	//Set inputHandler to true to activate tutorial AI.
	//Hands second character to AI
	var characterTwoHandler = true;
	
	//Delete after removing old tutorial code
	var itself = this;
	
	
	
	function activateMatch() {
		boardOne.enableShield();
		boardOne.enableAttack();
	}
	
	function deactivateMatch() {
		boardOne.disableShield();
		boardOne.disableAttack();
	}
	
	//This function creates the GameContainer and gets variables for 
	//tutorialHandler to use 
	this.startGameContainer = function() {
		activeGameContainer = new GameContainer(null, null, 
			spriteManager["background"][raceEnum[0]], gameWinDestination, 
			playerOneSelector.race, playerTwoSelector.race, 
			characterOneHandler, characterTwoHandler); 
			
		activeGameContainer.disableSpawn();
		
		activeGameContainer.initialSpawnBoards(true);
		characterTwo = activeGameContainer.getCharacterTwo();
		
		//This is when we get a reference for the character
		characterOne = activeGameContainer.getCharacterOne();
		
		//This gets the board for reference
		boardOne = activeGameContainer.get_boardOne();
		
		//This gets if there are any orbs to be highlighted
		highlightedOrbsList = boardOne.getHighlightedOrbList();
		
		
		activeGameContainer.disableSpawn();
		
		//test data
		//goalOne = new GrabGoal("water", characterOne, boardOne, tempPosList);
		if(tutorialGenerator != null) {
			goalList = tutorialGenerator(boardOne, characterOne.getRace());
			if((goalList != null) && (goalList != undefined) && (goalList.length != 0)) {
				currentGoal = goalList.shift();
				// Activate the initialize function of the current Goal
				currentGoal.activate(activeGameContainer);
			}
		}
		
		deactivateMatch();
	}
	
	//This update is called from menuNavigator to update GameContainer and any 
	//part of the tutorial. 
	this.update = function() {

		
		//Updates gameContainer for the game to be played.
		activeGameContainer.update();
		//increment pause
		if(pauseUsed) {
			pauseCount++;
		}
		//check if to activate currentgoal
		if(activeSignal && (pauseCount > pauseLimit)) {
			if (currentGoal != null) {
				currentGoal.activate(activeGameContainer);
			}
			deactivateMatch();
			activeSignal = false;
			pauseCount = 0;
			pauseUsed = false;	
			characterOneHandler.onControl();
		}
		
		//changes goals
		if((goalList != null) && (goalList != undefined) && 
				(currentGoal != null) && (currentGoal != undefined) && 
				currentGoal.update()){
			if (currentGoal != null) {
				activeSignal = true;
				currentGoal = goalList.shift();
				
				if((currentGoal == undefined) && (goalList.length == 0)) {
					tutorialEnd = true;
					SoundJS.stop("tutorial theme");
					SoundJS.play("tutorial victory", SoundJS.INTERRUPT_LATE, 1, 
							 false);
				}
			}
		}

		//activate match and enable pause
		if((currentGoal != null) && currentGoal.achieved()) {
			characterOneHandler.offControl();
			activateMatch();
			pauseUsed = true;
		}
		
		
		
		//If there isn't another tutorial sequence left, then the tutorial is 
		//over. So destruct everything and play the appropriate sounds.
		if((currentGoal == undefined) && (!pauseUsed)) {
			tutorialEnd = false;
			if(characterOneHandler == null){
				characterOne.destructAI();
			}
			if((characterOneHandler != null) && 
					(characterOneHandler != true)) {
				characterOneHandler.destructor();
			}	
			if(characterTwoHandler == null){
				characterTwo.destructAI();
			}
			if((characterTwoHandler != null) && 
					(characterTwoHandler != true)) {	
				characterTwoHandler.destructor();
			}
			gameResults.winner = true;
			activeGameContainer.inputHandlerDestruct();
			return gameResults;
		}
	}
	
	//This is the draw that gameContainer will call
	this.draw = function() {
		activeGameContainer.draw();
		if(!pauseUsed) {
			currentGoal.draw();
		}
		
		if(tutorialEnd) {
			var ctx = context2D;
			ctx.textAlign = "center";
			ctx.fillStyle = "rgba(255,255,255,1)";
			fontSize = 130;
			context2D.textAlign = "center";
			context2D.fillStyle = "rgba(255,255,255,1)";
			addShadow();
			context2D.font = '' + (fontSize * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + variableContainer.hennyPennyFont;
			context2D.fillText("Tutorial Complete!", (variableContainer.gameContainerNumColumns/2) * variableContainer.cellDimensions.getFirst(), 
							(variableContainer.gameContainerNumRows/2) * variableContainer.cellDimensions.getSecond());
			removeShadow();
		}
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
	
	//These empty functions are used because if gameContainer is made
	//by itself it has these functions. Local and onlin matches will not
	//play without this.
	this.runStartGameSequence = function(menuTimer) {
	
	}
	
	this.runEndGameSequence = function(menuTimer) {
	
	}
}