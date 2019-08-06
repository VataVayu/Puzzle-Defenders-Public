/**The instructionSequenceobject is meant to hold data in a structured manner 
* 		and allowing access to private variables, not to be manipulated.
*
*		Making triggers empty to allows the trigger count to be incremented, 
* 		here is a list that shows how to make each trigger empty:
*			tDest = [] or null, nResourceTarget = [] or null, 
*			tAIScriptList = [] or null, displayText = text or null, 
* 			attackNum = 0, shieldNum = 0, spellRequired = false and increment 
*			triggerCount by 1 (triggerCount starts 0)
*
* function get_controlText() : Accessor function that returns what actions the 
* 		player can use.
*
* function get_spellRequired() : Accessor function that returns if a spell is 
*		required
*
* function get_tAttackActive() : Accessor that returns if the Attacks are 
*		active(true/false)
*
* function get_tShieldActive() : Accessor that returns if the Shields are 
*		active(true/false)
*
* function get_tDestinationArray() : Accessor that returns an array of trigger 
*		Destinations. Each number in the array refers to the row the player 
*		should move to.
*
* function get_tControlActiveObject() : Accessor that returns an array of 
* 		booleans that refers to what controls a person can use.
*
* function get_nResourceTargetArray() : An Accessor that returns a list of 
* 		highlihgted resource targets. Each number in the array refers to the 
*		resource's row number.
*
* function get_tAIScriptList() : Thi sis an accessor so a class can get the AI 
* 		Script. "p" means pass. Instructions for witch should be only "u,d,g,t",  
* 		pause: "p". Routine controlling AI. Will wait for command to get next 
* 		command for AI to commence.This should make the AI go done once.  
* 		Pause and wait for command to take next move. Further reference for the 
* 		translation of the script can be found in InputHandler. 
*
* function get_attackNum() : Accessor to get the number of attacks that need 
* 		to be triggered.
*
* function get_shieldNum() : Accessor to geth the number of shields that need 
* 		to be triggered.
*
* function get_text() : Accessor to get text that will be displayed for the 
*		sequence.
*
* funciton get_activeTextBox : Accessor that returns a boolean on if we want 
* 		to use a textBox or not.
*
* function get_triggerCount() : Accessor to get how many triggers have already 
*		been tripped.
*
* function get_spawnOneActive() : Accessor that returns whether boardOne should 
* 		spawn orbs (true/false)
*
* function get_spawnTwoActive() : Accessor that returns whether boardTwo should 
* 		spawn orbs (true/false)
*
* function get_boardOne() : This is the function to return BoardOne to 
*		tutorialHandler
*
* function get_boardTwo() : This is the funciton to return BoardTwo to 
*		tutorialHandler
*
* function get_steampunkQ() : This will return the preset Queue for the 
*		Steampunk Player.
*
* function get_numInitColumnSpawnOne() : This will return the number of the 
* 		initial columns that have to be spawned for board one.
*
* function get_numInitColumnSpawnTwo() : This will return the number of the 
* 		initial columns that have to be spawned for board two.
*
* function get_resetSystemData() : This function will return a boolean on 
* 		whether or not we want to reset all the system data.
*
* function get_pauseTime() : This returns what the pauseTime for this 
*		sequence is.
*
* function get_AISpeed() : This returns what the AISpeed for this 
*		sequence is.
**/

function instructionSequence(boardOne, boardTwo, numInitColumnSpawnOne, numInitColumnSpawnTwo, spawnOneActive, spawnTwoActive, controls){
	
	//This is the function to return BoardOne to tutorialHandler
	this.get_boardOne = function(){
		return boardOne;
	}
	
	//This is the function to return BoardTwo to tutorialHandler
	this.get_boardTwo = function(){
		return boardTwo;
	}
	
	this.get_tControlActiveObject = function(){
		return controls;
	}
	
	//Accessor that returns whether boardOne should spawn orbs (true/false)
	this.get_spawnOneActive = function() {
		return spawnOneActive;
	}
	
	//Accessor that returns whether boardTwo should spawn orbs (true/false)
	this.get_spawnTwoActive = function() {
		return spawnTwoActive;
	}
	
	//This will return the number of initial Columns that have to be spawned 
	//for board one.
	this.get_numInitColumnSpawnOne = function() {
		return numInitColumnSpawnOne;
	}
	
	//This will return the number of initial columns that have to be spawned 
	//for board two.
	this.get_numInitColumnSpawnTwo = function() {
		return numInitColumnSpawnTwo;
	}
};