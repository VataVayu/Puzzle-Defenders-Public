var Utilities = require('../libraries/Utilities.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var Resource = require('./Resource.js');
var Spell = require('./Spell.js');

/**
 * This is a constructor for Character. It instantiates the Character class 
 * which initializes the player's spellList and resourceList.
 *
 * function Character(Race, Timer, boolean, ClientHandler): Contains
 *		the structure of the Character class.
 * function getSpell(): Returns this character's spell object.
 * function getRace(): Returns this character's race object.
 * function getResources(): Returns this character's array of resources.
 * function getResourcesArray(): Return an array containing the encoded health 
 *		values of each of the character's resources.
 * function isDead(): Determine whether or not the character is dead.
 * function update(): Updates the character's race.
 * function shift_Sbox(): If the character is an Angel, shift her selection box 
 *		whenever a new column of orbs is spawned. Return true if the shift
 *		is successful, false otherwise.
 **/

function Character(race, timer, isPlayerOne, clientHandler) {

	/*******************************Private Variables*************************/
	
	var playerNum = (isPlayerOne ? 1 : 2); 	
	var spell = null;
	var maxNumResources = VariableContainer.boardDimensions.getSecond();
	var resourceList = new Array();
	var resourceColNum;
	
	// Determine spell type based on race
	switch (race.getName()) {
		case(VariableContainer.races[0]):
			spell = new Spell("earth");
			break;
		case(VariableContainer.races[2]):
			spell = new Spell("air");
			race.initSelectionBox();
			break;
		case(VariableContainer.races[1]):
			spell = new Spell("fire");
			race.initQueue();
			break;
	}
	
	if (isPlayerOne) {
		resourceColNum = VariableContainer.boardColumnOffset + 
						 VariableContainer.boardDimensions.getFirst();	
	} else {
		resourceColNum = VariableContainer.boardColumnOffset + 
						 VariableContainer.boardDimensions.getFirst() + 
						 VariableContainer.resourceDimension + 
						 VariableContainer.noMansLandDimension + 
						 2 * VariableContainer.shieldZoneDimension; 
	}
	
	for (var i = 0; i < maxNumResources; i++) {
		resourceList[i] = new Resource(new Utilities.Pair(resourceColNum, 
														  VariableContainer.boardRowOffset + i), 
									   isPlayerOne, timer);
	}
	
	clientHandler.setCharacter(this);
	
	
	/*******************************Privileged Variables***********************/
	
	this.getPlayerNum = function() {
		return playerNum;
	}
	
	/**************************************************************************
	Returns this character's spell object.
	**************************************************************************/
	this.getSpell = function() {
		return spell;
	}
	
	/**************************************************************************
	Returns this character's race object.
	**************************************************************************/
	this.getRace = function() {
		return race;
	}
	
	/**************************************************************************
	Returns this character's array of resources.
	**************************************************************************/
	this.getResources = function() {
		return resourceList;
	}
	
	/**************************************************************************
	Return an array containing the encoded health values of each of the 
	character's resources
	**************************************************************************/
	this.getResourcesArray = function() {
		var list = new Array();
		for (var item in resourceList) {
			if (resourceList[item] != null) {
				list.push(resourceList[item].getHealth());
			}
			else {
				list.push(0);
			}
		}
		return list;
	}
	
	/**************************************************************************
	Determine whether or not the character is dead.
	**************************************************************************/
	this.isDead = function() {
		for (var i = 0; i < maxNumResources; ++i) {
			if (resourceList[i].isAlive())
				return false;
		}
		return true;
	}
    
	/**************************************************************************
	Update the character's race.
	**************************************************************************/
	this.update = function() {
		race.update();
	}
	
	/**************************************************************************
	If the character is an Angel, shift her selection box whenever a new column 
	of orbs is spawned. Return true if the shift is successful, false otherwise.
	**************************************************************************/
	this.shift_Sbox = function() {
		if (race.getName() == VariableContainer.races[2]) {
			if (race.selectionShiftColumn(-1)) {
				return true;
			}
		}
		return false;
	}
	
}

module.exports = Character;