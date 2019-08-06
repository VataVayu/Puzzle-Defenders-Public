var Utilities = require('../libraries/Utilities.js');
var Race = require('./Race.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var databaseVariables = require('../libraries/DatabaseVariables.js');

/** 
 * Witch Class, subclass of Race. 
 * This class is what defines Witch's mechanics, movement, and abilities.
 * This class is a subclass of Race.
 *
 * function Witch(colRow, playerNum): Constructor of Witch class.
 * function getSynchString(): 
 * function getRaceAbilityInfo() : This function will return the information for the race. 
 * 		It's used for networking but currently returns an empty string.
 * function moveVertically(dir, isPaused) : = This function checks to see if the player on 
 *		the client is allowed to move into the next row based on their direction.
 * function abilityA(): This function outlines the Witch's ability to pick up one of the 
 * 		orbs from the board and putting it into the character's list or "hand".
 * function abilityB(): This function governs the Witch's ability to throw orbs from the 
 * 		orbList onto the board.
 * function encodeWitchHand(): This function encodes the witch's hand into a series of characters.
 **/
 
Utilities.subclass(Witch, Race);
function Witch(colRow, playerNum) {
	
	Race.call(this, colRow, "witch", VariableContainer.witchResourceHealth);
	/*Private Variables*/
	var orbQueue = [];
	var queueType = null;

	
	/*********Privileged Functions***********/
	

	this.getSynchString = function() {
		return "";
	}
	
	//This function will return the information for the race.
	//It's used for networking but currently returns an empty string.
	this.getRaceAbilityInfo = function() {
		return "";
	}
	
	//This function checks to see if the player on the client is allowed to move
	//into the next row. 
	this.moveVertically = function(dir) {

		var boundaryCheck;
		
		if (dir < 0) {
			boundaryCheck = colRow.getSecond() > VariableContainer.playFieldCeiling;
		}
		else {
			boundaryCheck = colRow.getSecond() < VariableContainer.playFieldFloor;
		}
		
		if (boundaryCheck) {
			colRow.setSecond(colRow.getSecond() + dir);
			return true;
		}
		return false;
	}
	
	
	// This function outlines the Witch's ability to pick up one of the orbs
	//	from the board and putting it into the character's list or "hand".
	this.abilityA = function() {
		
		//NOTE THAT THESE ARE RELATIVE TO THE BOARD
		var boardRowNum = colRow.getSecond() - VariableContainer.boardRowOffset;	
		var boardColNum = this.getBoard().findColFrontOrb(boardRowNum);
		
		//This checks to see if there's an orb to pick up when the User presses
		//the ability A button. Then reacts accordingly.
		if (boardColNum < VariableContainer.boardDimensions.getFirst() &&
			(this.getBoard().getOrb(boardColNum, boardRowNum).getMechanicType() == null)) {
			if (queueType == null) {
				queueType = this.getBoard().getOrb(boardColNum, boardRowNum).getType();
				orbQueue.push(this.getBoard().spliceOrb(boardColNum, boardRowNum));
				// Count to database
				databaseVariables[playerNum].abilityA++;
				return true;
			} else if (this.getBoard().getOrb(boardColNum, boardRowNum).getType() == queueType) {
				orbQueue.push(this.getBoard().spliceOrb(boardColNum, boardRowNum));
				// Count to database
				databaseVariables[playerNum].abilityA++;
				return true;
			}
		}
		
		return false;
	}
	
	// This function governs the Witch's ability to throw orbs from the orbList onto
	// the board.
	this.abilityB = function() {
		//If the Witch has orbs in their hand.
		if (orbQueue.length > 0) {		
			this.getBoard().insertQueue(orbQueue, colRow);
			if (orbQueue.length == 0) {
				queueType = null;
			}
			// Count to database
			databaseVariables[playerNum].abilityB++;	
			return true;
		}
		return false;
	}
	
	//This function encodes the witch's hand into a set of characters.
	//To be sent to clients.
	this.encodeWitchHand = function() {
		//type,number of orbs, position of spell orb
		var stringContainer = "";
		if(orbQueue.length > 0) {
			stringContainer += orbQueue[0].getType().charAt(0);
			stringContainer += orbQueue.length;
			for(var x = 0; x < orbQueue.length; ++x) {
				if(typeof orbQueue[x] === 'SpellOrb') {
					console.log("spell orb found");
				}
			}
		}
		return stringContainer;
	}
}

module.exports = Witch;
