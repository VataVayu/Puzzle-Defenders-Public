/**
* Steampunk Class, subclass of Race. Sacrifices and throws orbs.
* Handles race, update, and the playstyle of the steampunk race
* 
* function Steampunk(Pair): set the class structure of Steampunk
* function setTimer(Timer, int, int): Initialize the timer that enforces the 
*		Steampunk's ability delays as well as the delay values themselves.
* function getPairedItems(): Returns a pair of the front orbs' types. Used for 
*		AI.
* function getUsedOrbCount(): Store the current value of usedOrbCount in a 
*		temporary variable, increment usedOrbCount, and return the original
*		value of usedOrbCount.
* function set_spawnQueue(Array): This function is used in tutorials and will 
*		set up the prescripted Queue. Note that this only sets the Queue to 
*		hold new values, more values tacked on normally.
* function setRaceAbilityInfo(string): Parses a string received from server to 
*		append more orbs of the designated types to the orb queue.
* function initQueue(string): This initializes the Steampunk's orb queue in 
*		two different ways depending on whether the player is playing online 
*		or locally. If online and a string is passed, the string is used to 
*		intitialize a large batch of orbs with types obtained from the server. 
*		If local, two orbs of a random type are initialized.
* function initNextOrb(): Initializes another orb of either a random type or
*		the current pair type and appends it to the orb queue. Used in local 
*		only.
* function getNextOrbType(int, string): This function determines the type of a 
*		new orb and creates the orb at the specified orb queue position. Used 
*		for local play and tutorial only.
* function shiftQueue(): Removes the orb queue's front orb and inserts it into 
*		the board. If local, a new orb is initialized. If online, the function 
*		stores the type of the front orb before it's removed and sets the 
*		second orb in the orb queue at the correct row position.
* function moveVertically(int, boolean): This function performs boundary and 
*		pause checks to determine whether the Steampunk can move up or down a 
*		column. If successful, the orb queue is moved along with the player and
*		the function returns true. Otherwise, it returns false.
* function abilityA(boolean): This function checks if the delay timer is 
*		expired and the game is not paused to determine whether the orb queue's 
*		front orb should be thrown. If the checks are successful, the action is 
*		performed and the function returns true. Otherwise it returns false.
* function abilityB(boolean): This function checks if the delay timer is 
*		expired and the game is not paused to determine whether the orb queue's 
*		front orb should be sacrificed. If the checks are successful, the 
*		action is performed and the function returns true. Otherwise it returns 
*		false.
* function update(): This function slides the front orb to the Steampunk's feet 
*		if it is not already there. If it is, it sets the front orb's gravity
*		to the correct value accordingly.
* function draw(): This function draws the aiming line of the correct color in 
*		front of the orb queue's front orb as well as the Steampunk and the 
*		first two orbs in her orb queue.
**/
subclass(Steampunk, Race);
function Steampunk(colRow) {
	Race.call(this, "steampunk", colRow,
		variableContainer.steampunkResourceHealth);
	
	/**************************Private Variables******************************/
	var orbQueue = [];
	var usedOrbTypeStack = [];
	var prescriptedQueue = null;
	var weightTypeQueue = []; 
	var queueColNum;
	var queuePairType;
	var numWeights = 10;
	var pairCount = 0;
	var delayTimer;
	var shootDelay;
	var sacrificeDelay;
	var usedOrbCount = 0; 
	var usedOrbMax = 99;
	var stackLimit = 10;
	var synchIgnoreCounter = 0;
	var typeMap = [];
	typeMap['a'] = variableContainer.typeEnum[0];
	typeMap['w'] = variableContainer.typeEnum[1];
	typeMap['f'] = variableContainer.typeEnum[2];
	typeMap['e'] = variableContainer.typeEnum[3];
	
	
	/****************************Privileged Functions*************************/
	
	/**************************************************************************
	Initialize the timer that enforces the Steampunk's ability delays as well 
	as the delay values themselves.
	**************************************************************************/
	this.setTimer = function(timer, abilityADelay, abilityBDelay) {
		delayTimer = new CountDownTimer(timer, 0);
		shootDelay = abilityADelay;
		sacrificeDelay = abilityBDelay;
	}
	
	/**************************************************************************
	Returns a pair of the front orbs' types. Used for AI.
	**************************************************************************/
	this.getPairedItems = function() {
		return [orbQueue[0].getType().charAt(0), 
			orbQueue[1].getType().charAt(0)];
	}
	
	/**************************************************************************
	Store the current value of usedOrbCount in a temporary variable, increment 
	usedOrbCount, and return the original value of usedOrbCount.
	**************************************************************************/
	this.getUsedOrbCount = function() {
		var tempUsedOrbCount = usedOrbCount;
		usedOrbCount++;
		if (usedOrbCount > usedOrbMax) {
			usedOrbCount = 0;
		}
		return tempUsedOrbCount;
	}
	
	/**************************************************************************
	This function is used in tutorials and will set up the prescripted Queue
	Note that this only sets the Queue to hold new values, more values tacked
	on normally. 
	**************************************************************************/
	this.set_spawnQueue = function(affinityQueue){
		if (affinityQueue != null){
			prescriptedQueue = affinityQueue;
			orbQueue.length = 0;
			this.getNextOrbType(0, null);
			this.getNextOrbType(1,orbQueue[0].getType());
		}
	}
	
	this.handleSynchInfo = function(synchString) {
		if (synchIgnoreCounter <= 0) {
			if (synchString != "") {
				executeSynchronization(synchString);
				synchIgnoreCounter = 6; //arbitrary
			}
		} else {
			synchIgnoreCounter--;
		}
	}
	
	//return race Information specifically for synch via action
	this.getActionRaceInfo = function() {
		var tempString = "";
		return tempString;
	}


	/**************************************************************************
	Parses a string received from server to append more orbs of the designated
	types to the orb queue.
	**************************************************************************/
	this.setRaceAbilityInfo = function(refillTypeString) {
		if (refillTypeString != "") {
			var refillQueueChars = refillTypeString.split("");
			var type;
			for (var i = 0; i < refillQueueChars.length; i++) {
				type = typeMap[refillQueueChars[i]];
				orbQueue.push(new Orb(new Pair(queueColNum, 
					colRow.getSecond() - 1), type, 
					variableContainer.steampunkShootSpeed));
			}
		}
	}
	


	/**************************************************************************
	This initializes the Steampunk's orb queue in two different ways depending 
	on whether the player is playing online or locally. If online and a string 
	is passed, the string is used to intitialize a large batch of orbs with 
	types obtained from the server. If local, two orbs of a random type are 
	initialized.
	**************************************************************************/
	this.initQueue = function(initQueueString) {
	
		if (this.getBoard().getPlayerSide() == "left") {
			queueColNum = colRow.getFirst() - 1;
		} else if (this.getBoard().getPlayerSide() == "right") {
			queueColNum = colRow.getFirst() + 1;
		}
		
		if (!variableContainer.isLocal && initQueueString != null) {
			var initQueueChars = initQueueString.split("");
			var type = typeMap[initQueueChars.shift()];
			orbQueue.push(new Orb(new Pair(queueColNum, colRow.getSecond()), 
				type, variableContainer.steampunkShootSpeed));
			
			for (var i = 0; i < initQueueChars.length; i++) {
				type = typeMap[initQueueChars[i]];
				orbQueue.push(new Orb(new Pair(queueColNum, 
					colRow.getSecond() - 1), type, 
					variableContainer.steampunkShootSpeed));
			}
		} else {
			var tempTypeQueue = [variableContainer.typeEnum[0], 
								 variableContainer.typeEnum[1], 
								 variableContainer.typeEnum[2], 
								 variableContainer.typeEnum[3]];
			var randomIndex;
			while (tempTypeQueue.length > 0) {
				randomIndex = Math.floor(Math.random() * 
					(tempTypeQueue.length - 1));
				weightTypeQueue.push(tempTypeQueue.splice(randomIndex, 
					1).shift());
			}
			this.getNextOrbType(0, null);
			queuePairType = orbQueue[0].getType();
			pairCount++;
			this.initNextOrb();
		}
	}
	
	/**************************************************************************
	Initializes another orb of either a random type or the current pair type 
	and appends it to the orb queue. Used in local only.
	**************************************************************************/
	this.initNextOrb = function() {
		if (variableContainer.pairSpawning) {
			if (pairCount == 2) {
				this.getNextOrbType(1, null);
				queuePairType = orbQueue[1].getType();
				pairCount = 1;
			} else {
				this.getNextOrbType(1, queuePairType);
				pairCount++;
			}
		} else {
			this.getNextOrbType(1, null);
		}
	}
	
	this.getOrbType = function() {
		return orbQueue[0].getType();
	}
	
	/**************************************************************************
	This function determines the type of a new orb using weights and creates 
	the orb at the specified orb queue position. Used for local play and 
	tutorial only.
	**************************************************************************/
	this.getNextOrbType = function(position, type) {
		if (prescriptedQueue != null) {
			if(prescriptedQueue){
				orbQueue.push(new Orb(new Pair(queueColNum, 
					colRow.getSecond() - position), "fire", 
					variableContainer.steampunkShootSpeed));
			} else {
				orbQueue.push(new Orb(new Pair(queueColNum, 
					colRow.getSecond() - position), "earth", 
					variableContainer.steampunkShootSpeed));
			}
		} else if (type == null) {
			var randomWeight = Math.floor(Math.random() * numWeights);
			var spawnedTypeIndex;
			if (randomWeight == 0) {
				spawnedTypeIndex = 0;
			} else if (randomWeight == 1 || randomWeight == 2) {
				spawnedTypeIndex = 1;
			} else if (randomWeight == 3 || randomWeight == 4 ||
					   randomWeight == 5) {
				spawnedTypeIndex = 2;	   
			} else {
				spawnedTypeIndex = 3;
			}
			var chosenType = weightTypeQueue.splice(spawnedTypeIndex, 
				1).shift();
			weightTypeQueue.unshift(chosenType);
			orbQueue.push(new Orb(new Pair(queueColNum, colRow.getSecond() - 
				position), chosenType, variableContainer.steampunkShootSpeed));
		} else {
			orbQueue.push(new Orb(new Pair(queueColNum, colRow.getSecond() - 
				position), type, variableContainer.steampunkShootSpeed));
		}
	}
	
	/**************************************************************************
	Removes the orb queue's front orb and inserts it into the board. If local,
	a new orb is initialized. If online, the function stores the type of the 
	front orb before it's removed and sets the second orb in the orb queue at 
	the correct row position.
	**************************************************************************/
	this.shiftQueue = function() {
	
		if (variableContainer.isLocal) {
			this.getBoard().insertQueue([orbQueue.shift()], colRow.getSecond());
			orbQueue[0].setDestination(queueColNum, colRow.getSecond());
			this.initNextOrb();
		} else {
			updateUsedStack(orbQueue[0].getType()); 
			this.getBoard().insertQueue([orbQueue.shift()], colRow.getSecond());
			orbQueue[0].setDestination(queueColNum, colRow.getSecond());
			orbQueue[1].setPosition(queueColNum, colRow.getSecond() - 1);
		}
	}
	
	/**************************************************************************
	This function performs boundary and pause checks to determine whether the 
	Steampunk can move up or down a column. If successful, the orb queue is 
	moved along with the player and the function returns true. Otherwise, it
	returns false.
	**************************************************************************/
	this.moveVertically = function(dir, isPaused) {
		if (isPaused == null || (isPaused != null && !isPaused())) {
			var boundaryCheck;
			var indexFrame; 
			if (dir < 0) {
				boundaryCheck = colRow.getSecond() > 
					variableContainer.playFieldCeiling;
				indexFrame = 1; 
			}
			else {
				boundaryCheck = colRow.getSecond() < 
					variableContainer.playFieldFloor;
				indexFrame = 2; 
			}
			
			if (boundaryCheck) {
				this.setIndexFrame(indexFrame);
				this.getSpriteTimer().reset(
					variableContainer.defaultSpriteCountdown);
				colRow.setSecond(colRow.getSecond() + dir);
				moveFrontOrbs();
				return true;
			}
		}
		return false;
	}
	
	/**************************************************************************
	This function checks if the delay timer is expired and the game is not 
	paused to determine whether the orb queue's front orb should be thrown.
	If the checks are successful, the action is performed and the function
	returns true. Otherwise it returns false.
	**************************************************************************/
	this.abilityA = function(isPaused) {
		if (delayTimer.isExpired() && (isPaused == null || (isPaused != null 
				&& !isPaused()))) {
			SoundJS.play("orbThrown", SoundJS.INTERRUPT_LATE, 0.7);
			this.shiftQueue();
			delayTimer.reset(shootDelay);
			this.setIndexFrame(3);
			this.getSpriteTimer().reset(
				variableContainer.defaultSpriteCountdown);
			return true;
		}
		return false;
	}
	
	/**************************************************************************
	This function checks if the delay timer is expired and the game is not 
	paused to determine whether the orb queue's front orb should be sacrificed.
	If the checks are successful, the action is performed and the function
	returns true. Otherwise it returns false.
	**************************************************************************/
	this.abilityB = function(isPaused) {
		if (delayTimer.isExpired() && (isPaused == null || (isPaused != null 
				&& !isPaused()))) {
			SoundJS.play("orbSacrificed", SoundJS.INTERRUPT_LATE, 0.7);
			orbQueue[0].sacrifice();
			this.shiftQueue();
			delayTimer.reset(sacrificeDelay);
			this.setIndexFrame(4);
			this.getSpriteTimer().reset(
				variableContainer.defaultSpriteCountdown);
			return true;
		}
		return false;
	}
	
	/**************************************************************************
	This function slides the front orb to the Steampunk's feet if it is not
	already there. If it is, it sets the front orb's gravity to the correct
	value accordingly.
	**************************************************************************/
	this.update = function() {
		if (orbQueue[0].getColRow().getSecond() != colRow.getSecond()) {
			orbQueue[0].update(queueColNum, colRow.getSecond()); 
		} else {
			if (orbQueue[0].getGravity() != 
					variableContainer.steampunkShootSpeed) {
				orbQueue[0].setGravity(variableContainer.steampunkShootSpeed);
			}
		}
		
		if (this.getSpriteTimer().isExpired()) {
			this.setIndexFrame(0);
		}
	}
	
	/**************************************************************************
	This function draws the aiming line of the correct color in front of the
	orb queue's front orb as well as the Steampunk and the first two orbs in her 
	orb queue.
	**************************************************************************/
	this.draw = function()	{
		var mirror = 1;
		var firstEmptyCol = (this.getBoard().findColFrontOrb(colRow.getSecond()
			- variableContainer.boardRowOffset));
		if (this.getBoard().getPlayerSide() != "left")
			mirror = -1;
		for (var i = 1; i < firstEmptyCol; ++i){
			spriteManager["dot"][orbQueue[0].getType()].draw(mirror * i + 
				this.getBoard().getOffset().getFirst() + 3/8, 
				colRow.getSecond() + 1/8);
		}
		if (this.getBoard().getPlayerSide() == "left") {
			this.getSprite().draw(colRow.getFirst() - .5,
				colRow.getSecond() + variableContainer.charImgOffsetY, 
				this.getIndexFrame());				   
		} else {
			this.getSprite().drawFlipImage(colRow.getFirst() - .5,
				colRow.getSecond() + variableContainer.charImgOffsetY, 
				this.getIndexFrame());
		}	   
		orbQueue[0].draw();
		orbQueue[1].draw();
	}
	
	/******************************Private Functions**************************/
	
	/**************************************************************************
	This function moves the first two orbs in the orb queue to their correct
	row positions.
	**************************************************************************/
	function moveFrontOrbs() {
		orbQueue[0].getColRow().setSecond(colRow.getSecond());
		orbQueue[1].getColRow().setSecond(colRow.getSecond() - 1);
	}
	
	/**************************************************************************
	This function pushes a given orb type onto a stack and removes the oldest
	element from the stack if an arbitrary stack limit is reached.
	**************************************************************************/
	function updateUsedStack(orbType) {
		usedOrbTypeStack.push(orbType);
		if (usedOrbTypeStack.length > stackLimit) {
			usedOrbTypeStack.shift();
		}
	}
	
	function executeSynchronization(synchString) {
		var synchCharArray = synchString.split(' ');
		var synchDirection = synchCharArray[0];
		var synchOffset = parseInt(synchCharArray[1]);
		
		if (synchDirection == '+') { //client is ahead of server
			orbQueue[0].setPosition(queueColNum, colRow.getSecond() - 1);
			for (var i = 1; i <= synchOffset; i++) {
				orbQueue.unshift(new Orb(new Pair(queueColNum, 
					colRow.getSecond() - 1), usedOrbTypeStack.pop(), 
					variableContainer.steampunkShootSpeed));
			}
			orbQueue[0].setDestination(queueColNum, colRow.getSecond());
			usedOrbCount -= synchOffset;
		} else if (synchDirection == '-') { //client is behind server
			for (var i = 1; i <= synchOffset; i++) {
				orbQueue.shift();
			}
			orbQueue[0].setDestination(queueColNum, colRow.getSecond());
			orbQueue[1].setPosition(queueColNum, colRow.getSecond() - 1);
			usedOrbCount += synchOffset;
		}
	}
	
}