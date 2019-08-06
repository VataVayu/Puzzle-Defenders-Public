/**
 * This class was made to handle inputs and the polling of inputs. It uses ASCII values to determine what the 
 * 		what key was pressed.
 *
 * function destructor() : A function removes the input event listeners when they are no 
 * 		longer needed.
 *
 * function setRace(newRace) : This function sets the race that this InputHandler is 
 * 		associated with.
 *
 * function getRace() : This function returns what race the InputHandler is currently 
 * 		associated with.
 *
 * function setTogglePause(fcn) : This function sets if the InputHandler should be paused 
 * 		based on what is passed in.
 *
 * function setCheckPause(fcn) : This function sets if InputHandler is paused based on 
 * 		what is passed in.
 *
 * function getCharacter() : This function returns the Character that InputHandler is 
 * 		associated with.
 *
 * function setCharacter(character) : This function sets what character the InputHandler 
 * 		is associated with.
 *
 * function actionController(controlData) : This function takes in control data and then 
 * 		affects booleans with determine if a key can be pressed or not.
 *
 * function getActionString() : This function returns the current actionString.
 *
 * function clearActionString() : This function clears what the action string is and makes 
 * 		it empty.
 *
 * function getMouseButton() : This function is to get the Mouse Button that was pressed 
 * 		down.
 *
 * function getMouseLocation() : This function is to get the location of the Mouse on the 
 * 		screen.
 *
 * function getKey(value) : This function will return the associated key if the ASCII value is 
 * 		put in.
 *
 * function update() : An empty update function to allow passage for AIHandler.
 *
 * function setSendActions(serverComSendActions) : This function sets a reference to 
 *		ServerCommunicator's function that sends actions to the server.
 *
 * function handleOpponentActions(actions): This function executes whatever actions it's 
 * 		given.
 **/
function InputHandler(playerNum, race, up, down, left, right, abilityA, abilityB, mirror) {
	/*Private Variables*/
	var keys = new Array();
	var mouseLocArray = new Array(); 
	var actionString = "";
	var mouseLoc = new Pair(0, 0);
	var mButtonPressed = false;
	var togglePause = null;
	var isPaused = null;
	var sendActions;
	var upActive = true;
	var downActive = true;
	var leftActive = true;
	var rightActive = true;
	var abilityAActive = true;
	var abilityBActive = true;
	var player;
	var active = true;

	/*This creates listeners for events in case a key gets pressed down on the keyboard */
	if (playerNum > 0) {
		window.addEventListener('keydown', keyDown, true);
		window.addEventListener('keyup', keyUp, true);
	} else if (playerNum < 0) { 
	//Note that there is an input handler in menuNav that only uses these. 
	//playerNum is -1 in this case
	
		/* This creates listeners for events in case a mouse button is pressed or the mouse 
		   changes it's position */
		window.addEventListener('mousedown', mButtonDown, true);
		window.addEventListener('mouseup', mButtonUp, true);
		window.addEventListener("mousemove", mMove, true);
	} else if(playerNum == null) {
		window.addEventListener('keydown', keyDown, true);
		window.addEventListener('keyup', keyUp, true);
		window.addEventListener('mousedown', mButtonDown, true);
		window.addEventListener('mouseup', mButtonUp, true);
		window.addEventListener("mousemove", mMove, true);
	}
	//playerNum == 0 will be for the second client's input handler in online play

	/******************Privileged Functions*****************/
	
	//Removes the input event listeners when they are no longer needed
	this.destructor = function() {
		window.removeEventListener('keydown', keyDown, true);
		window.removeEventListener('keyup', keyUp, true);
		
		window.removeEventListener('mousedown', mButtonDown, true);
		window.removeEventListener('mouseup', mButtonUp, true);
		window.removeEventListener('mousemove', mMove, true);
	}
	
	//This function sets the race that this InputHandler is associated with.
	this.setRace = function(newRace) {
		race = newRace;
	}
	
	//This function returns what race the InputHandler is currently associated with.
	this.getRace = function() {
		return race;
	}
	
	//This function sets if the InputHandler should be paused.
	this.setTogglePause = function(fcn) {
		togglePause = fcn;
	}
	
	//This function sets if InputHandler is paused.
	this.setCheckPause = function(fcn) {
		isPaused = fcn;
	}
	
	//This function returns the Character that InputHandler is associated with.
	this.getCharacter = function() {
		return player;
	}
	
	//This function sets what character the InputHandler is associated with.
	this.setCharacter = function(character) {
		player = character;
	}
	
	this.offControl = function() {
		active = false;
	}
	
	this.onControl = function() {
		active = true;
	}
	
	//This function takes in control data and then affects booleans with determine
	// if a key can be pressed or not.
	this.actionController = function(controlData) {
		//up key enabling
		if(controlData.get_tUpFlag()) 
			upActive = true;
		else
			upActive = false;
			
		//down key enabling
		if(controlData.get_tDownFlag())
			downActive = true;
		else
			downActive = false;
			
		//left key enabling
		if(controlData.get_tLeftFlag())
			leftActive = true;
		else
			leftActive = false;	

		//right key enabling
		if(controlData.get_tRightFlag())
			rightActive = true;
		else
			rightActive = false;
			
		//abilityA key enabling
		if(controlData.get_tAbilityAFlag())
			abilityAActive = true;
		else
			abilityAActive = false;
			
		//abilityB key enabling
		if(controlData.get_tAbilityBFlag())
			abilityBActive = true;
		else
			abilityBActive = false;
	}
	
	//This function returns the current actionString.
	this.getActionString = function() {
		return actionString;
	}
	
	//This function clears what the action string is and makes it empty.
	this.clearActionString = function() {
		actionString = "";
	}

	/*This function is to get the Mouse Button that was pressed down*/
	this.getMouseButton = function() {
		if(mButtonPressed) {
			mButtonPressed = false;
			return true;
		}
		return false;
	}

	/*This function is to get the location of the Mouse on the screen*/
	this.getMouseLocation = function() {
		return mouseLoc;
	}
	
	//This function will return the associated key if the ASCII value is put in.
	this.getKey = function(value) {
		if (keys[value]) {
			keys[value] = false;
			return true;
		}
	}
    
    //empty function to allow passage for AIHandler
    this.update = function(state) {
    }
	
	//This function sets a reference to ServerCommunicator's
	//function that sends actions to the server.
	this.setSendActions = function(serverComSendActions) {
		sendActions = serverComSendActions;
	}
	
	//This function executes whatever actions it's given.
	this.handleOpponentActions = function(actions) {
		var actionCharArray = actions.split("");
		while (actionCharArray.length > 0) {
			executeOpponentAction(actionCharArray.shift());
		}
	}
	
	/***************Private functions*************/
	
	//This function determines if a key has been pressed down.
	function keyDown(evt) {
		if (keys[evt.keyCode] == null) { //this will be null if either the key was never pressed or has been released
			executeAction(evt.keyCode);
			keys[evt.keyCode] = true;
		}
	}
	
	//This function parses the keyCode and then puts the associated actions's keys
	// to the actionString. Allowing us to script what Computer Opponents do.
	function executeAction(keyCode) {
		if (race != null) {
			if (!variableContainer.isLocal && (playerNum != null)) {
				switch (keyCode) { 	
					case up:
						if (race.moveVertically(-1, isPaused)) {
							actionString += 'u';
						}
						break;
					case down:

						if (race.moveVertically(1, isPaused)) {
							actionString += 'd';
						}
						break;
					case left:
						if (race.moveHorizontally != null && 
							race.moveHorizontally(-1, isPaused)) {
							actionString += 'l';
						}
						break;
					case right:
						if (race.moveHorizontally != null && 
							race.moveHorizontally(1, isPaused)) {
							actionString += 'r';
						}
						break;
					case abilityA:
						if (race.abilityA(isPaused)) {
							actionString += 'a';
							if (race.getUsedOrbCount != null) {
								actionString = actionString + ',' + 
											   race.getUsedOrbCount();
							}
						}
						break;
					case abilityB:
						if (race.abilityB(isPaused)) {
							actionString += 'b';
							if (race.getUsedOrbCount != null) {
								actionString = actionString + ',' + 
											   race.getUsedOrbCount();
							}
						}
						break;
					default:
				}
				sendActions();
			} else {
				if(active) {
					switch (keyCode) { 
					case up:
						if(upActive) {
							race.moveVertically(-1, isPaused, upActive);
						}
						break;
					case down:
						if(downActive) {
							race.moveVertically(1, isPaused, downActive);
						}break;
					case left:
						if ((race.moveHorizontally != null) &&
							leftActive) { //only angel can move horizontally
							race.moveHorizontally(-1, isPaused, leftActive);
						}
						break;
					case right:
						if ((race.moveHorizontally != null) &&
							rightActive) {
							race.moveHorizontally(1, isPaused, rightActive);
						}
						break;
					case abilityA:
						if(abilityAActive) {
							race.abilityA(isPaused, abilityAActive);
						}
						break;
					case abilityB:
						if(abilityBActive) {
							race.abilityB(isPaused, abilityBActive);
						}
						break;
					default:
					}
				}
			}
		}
	}
	
	//This function exectues an action based on the character it is
	//given.
	function executeOpponentAction(actionChar) {
		switch (actionChar) {
			case 'u':
				race.moveVertically(-1, isPaused);
				break;
			case 'd':
				race.moveVertically(1, isPaused);
				break;
			case 'l':
				if (race.moveHorizontally != null) {
					race.moveHorizontally(-1 * mirror, isPaused);
				}
				break;
			case 'r':
				if (race.moveHorizontally != null) {
					race.moveHorizontally(1 * mirror, isPaused);
				}
				break;
			case 'a':
				race.abilityA(isPaused);
				break;
			case 'b':
				race.abilityB(isPaused);
				break;
		}
	}
	
	//This function gets if a key has been released.
	function keyUp(evt) {
		keys[evt.keyCode] = null;
	}
	
	
	//This function checks to see if the mouse button is currently being pressed.
	function mButtonDown(evt) {
		mButtonPressed = true;
	}
	
	//This function checks to see if the mouse button has been let go and
	//isn't pressed down anymore.
	function mButtonUp(evt) {
		mButtonPressed = false;
	}
	
	//This function checks to see the location of the mouse cursor.
	function mMove(evt) {
		mouseLoc.setFirst(evt.pageX - canvas.offsetLeft);
		mouseLoc.setSecond(evt.pageY - canvas.offsetTop);
	}
	
}