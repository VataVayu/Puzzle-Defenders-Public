/******************************Includes**************************************/
var Utilities = require('../libraries/Utilities.js');
var Race = require('./Race.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var databaseVariables = require('../libraries/DatabaseVariables.js');
var Orb = require('./Orb.js');

/**
* Steampunk Class, subclass of Race. Sacrifices and throws orbs.
* Handles race, update, and the playstyle of the steampunk race
* 
* function Steampunk(Pair, int): Sets the class structure of Steampunk
* function getInitQueueString(): Returns a string consisting of the encoded 
*		types of the orbs in the initial orb queue.
* function getSynchString(): Returns a string containing encoded information 
*		for synchronizing the Steampunk's orb queue. 
* function getRaceAbilityInfo(): Returns a string consisting of five characters
*		representing various orb types if there are sufficient characters. 
*		Otherwise, returns an empty string.
* function emptyRefillTypeString(): Empties the refillTypeString if five or 
*		more orb types have been used.
* function initQueue(): Initializes the weighted type array and creates a 
*		batch of orbs of weighted types in pairs.
* function initNextOrb(): Initializes another orb of either a random type or 
*		the current pair type and appends it to the orb queue.
* function getNextOrbType(int, string): This function determines the type of a 
*		new orb using weights, appends the encoded type to a string, and  
*		creates the orb at the specified orb queue position.
* function shiftQueue(): Removes the orb queue's front orb and inserts it into 
*		the board. Both front orbs are then set to the correct row positions.
* function moveVertically(int): This function performs boundary checks 
*		to determine whether the Steampunk can move up or down a column. If 
*		successful, the orb queue is moved along with the player and the function 
*		returns true. Otherwise, it returns false.
* function abilityA(): This function throws Steampunk's front orb and returns 
*		true.
* function abilityB(): This function sacrifices Steampunk's front orb and 
*		returns true.
* function compareUsedOrbCount(int): This function compares the number of orbs the 
*		server's Steampunk has used from the orb queue with the number of orbs 
*		the client's Steampunk has used. It then returns a string denoting 
*		whether the client or server is ahead, and by how many orbs, or an 
*		empty string if neither is ahead.
* function update(): This function slides the front orb to the Steampunk's feet 
*		if it is not already there. If it is, it sets the front orb's gravity 
*		to  the correct value accordingly.
* function moveFrontOrbs(): This function moves the first two orbs in the orb 
*		queue to their correct row positions.
**/

Utilities.subclass(Steampunk, Race);
function Steampunk(colRow, playerNum) {
	Race.call(this, colRow, "steampunk", 
		VariableContainer.steampunkResourceHealth);	

	/**************************Private Variables******************************/
	var orbQueue = [];
	var weightTypeQueue = []; 
	var refillTypeString = "";
	var usedOrbDifferenceString = "";
	var queueColNum;
	var queuePairType;
	var numWeights = 10;
	var pairCount = 0;
	var maxSize = 20;
	var usedOrbCount = -1;
	var usedOrbMax = 99;
	
	/**************************Privileged Functions******************************/
	
	/**************************************************************************
	Returns a string consisting of the encoded types of the orbs in the initial
	orb queue.
	**************************************************************************/
	this.getInitQueueString = function() {
		var initQueueString = "";
		for (var i = 0; i < orbQueue.length; i++) {
			initQueueString += orbQueue[i].getType().charAt(0);
		}
		return initQueueString;
	}
	
	/**************************************************************************
	Returns a string containing encoded information for synchronizing the 
	Steampunk's orb queue. 
	**************************************************************************/
	this.getSynchString = function() {
		return usedOrbDifferenceString;
	}
	
	this.emptySynchString = function() {
		usedOrbDifferenceString = "";
	}
	
	/**************************************************************************
	Returns a string consisting of five characters representing various orb 
	types if there are sufficient characters. Otherwise, returns an empty 
	string.
	**************************************************************************/
	this.getRaceAbilityInfo = function() {
		var tempString = "";
		if (refillTypeString.length >= 5) {
			tempString += refillTypeString;
		}
		return tempString;
	}
	
	/**************************************************************************
	Empties the refillTypeString if five or more orb types have been used.
	**************************************************************************/
	this.emptyRefillTypeString = function() {
		if (refillTypeString.length >= 5) {
			refillTypeString = "";
		}
	}
	
	/**************************************************************************
	Initializes the weighted type array and creates a batch of orbs of weighted
	types in pairs.
	**************************************************************************/
	this.initQueue = function() {
		if (this.getBoard().getPlayerSide() == "left") {
			queueColNum = colRow.getFirst() - 1;
		} else if (this.getBoard().getPlayerSide() == "right") {
			queueColNum = colRow.getFirst() + 1;
		}
		var tempTypeQueue = [VariableContainer.typeEnum[0], 
							 VariableContainer.typeEnum[1], 
							 VariableContainer.typeEnum[2], 
							 VariableContainer.typeEnum[3]];
		var randomIndex;
		while (tempTypeQueue.length > 0) {
			randomIndex = Math.floor(Math.random() * 
				(tempTypeQueue.length - 1));
			weightTypeQueue.push(tempTypeQueue.splice(randomIndex, 1).shift());
		}
		this.getNextOrbType(0, null);
		queuePairType = orbQueue[0].getType();
		pairCount++;
		for (var i = 1; i <= maxSize - 1; i++) {
			this.initNextOrb();
		}
		refillTypeString = "";
	}
	
	/**************************************************************************
	Initializes another orb of either a random type or the current pair type 
	and appends it to the orb queue.
	**************************************************************************/
	this.initNextOrb = function() {
	
		if (pairCount == 2) {
			this.getNextOrbType(1, null);
			queuePairType = orbQueue[orbQueue.length - 1].getType();
			pairCount = 1;
		} else {
			this.getNextOrbType(1, queuePairType);
			pairCount++;
		}
	}
	
	/**************************************************************************
	This function determines the type of a new orb using weights, appends the 
	encoded type to a string, and creates the orb at the specified orb queue 
	position.
	**************************************************************************/
	this.getNextOrbType = function(position, type) {
		
		if (type == null) {
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
			orbQueue.push(new Orb(new Utilities.Pair(queueColNum, 
				colRow.getSecond() - position), chosenType,
				VariableContainer.steampunkShootSpeed));
			refillTypeString += chosenType.charAt(0);
		} else {
			orbQueue.push(new Orb(new Utilities.Pair(queueColNum, 
				colRow.getSecond() - position), type, 
				VariableContainer.steampunkShootSpeed));
			refillTypeString += type.charAt(0);
		}
	}
	
	/**************************************************************************
	Removes the orb queue's front orb and inserts it into the board. Both front
	orbs are then set to the correct row positions.
	**************************************************************************/
	this.shiftQueue = function() {
		this.getBoard().insertQueue([orbQueue.shift()], 
			new Utilities.Pair(queueColNum, colRow.getSecond()));
			
		usedOrbCount++;
		if (usedOrbCount > usedOrbMax) {
			usedOrbCount = 0;
		}
		orbQueue[0].setDestination(queueColNum, colRow.getSecond());
		orbQueue[1].setPosition(queueColNum, colRow.getSecond() - 1);
		this.initNextOrb();
	}
	
	/**************************************************************************
	This function performs boundary checks to determine whether the 
	Steampunk can move up or down a column. If successful, the orb queue is 
	moved along with the player and the function returns true. Otherwise, it
	returns false.
	**************************************************************************/
	this.moveVertically = function(dir) {
		
		var boundaryCheck;
		
		if (dir < 0) {
			boundaryCheck = colRow.getSecond() > 
				VariableContainer.playFieldCeiling;
		} else {
			boundaryCheck = colRow.getSecond() < 
				VariableContainer.playFieldFloor;
		}
		
		if (boundaryCheck) {
			colRow.setSecond(colRow.getSecond() + dir);
			moveFrontOrbs();
			return true;
		}
		
		return false;
	}
	
	/**************************************************************************
	This function throws Steampunk's front orb and returns true.
	**************************************************************************/
	this.abilityA = function() {
		this.shiftQueue();
		databaseVariables[playerNum].abilityA++;
		return true;
	}
	
	/**************************************************************************
	This function sacrifices Steampunk's front orb and returns true.
	**************************************************************************/
	this.abilityB = function() {
		orbQueue[0].sacrifice();
		this.shiftQueue();			
		databaseVariables[playerNum].abilityB++;
		return true;
	}
	
	/**************************************************************************
	This function compares the number of orbs the server's Steampunk has used
	from the orb queue with the number of orbs the client's Steampunk has used.
	It then returns a string denoting whether the client or server is ahead, and
	by how many orbs, or an empty string if neither is ahead.
	**************************************************************************/
	this.compareUsedOrbCount = function(clientUsedOrbCount) {
		if (usedOrbCount != clientUsedOrbCount) {
			//console.log("Steampunk queue desynchronization has occurred!");
			if (clientUsedOrbCount > usedOrbCount) {
				var diffOne = Math.abs(clientUsedOrbCount - usedOrbCount);
				var diffTwo = Math.abs(clientUsedOrbCount - (100 + usedOrbCount));
				if (diffOne < diffTwo) { //client is ahead by diffOne orbs
					usedOrbDifferenceString = "+ " + diffOne;
				} else { //client is behind by diffTwo orbs
					usedOrbDifferenceString = "- " + diffTwo;
				}
			} else {
				var diffOne = Math.abs(usedOrbCount - clientUsedOrbCount);
				var diffTwo = Math.abs(usedOrbCount - (100 + clientUsedOrbCount));
				if (diffOne < diffTwo) { //client is behind by diffOne orbs
					usedOrbDifferenceString = "- " + diffOne;
				} else { //client is ahead by diffTwo orbs
					usedOrbDifferenceString = "+ " + diffTwo;
				}
			}
		} else {
			usedOrbDifferenceString = "";
		}
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
					VariableContainer.steampunkShootSpeed) {
				orbQueue[0].setGravity(VariableContainer.steampunkShootSpeed);
			}
		}
	}
	
	/*****************************Private Functions***************************/
	
	/**************************************************************************
	This function moves the first two orbs in the orb queue to their correct 
	row positions.
	**************************************************************************/
	function moveFrontOrbs() {
		orbQueue[0].getColRow().setSecond(colRow.getSecond());
		orbQueue[1].getColRow().setSecond(colRow.getSecond() - 1);
	}
	
}

module.exports = Steampunk;