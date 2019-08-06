var Utilities = require('../libraries/Utilities.js');
var Race = require('./Race.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var databaseVariables = require('../libraries/DatabaseVariables.js');
var Timer = require('./Timer.js');
var Board = require('./Board.js');
var Orb = require('./Orb.js');

/**
 * Angel class, contains action button logic and the selection box
 *
 * function Angel(colRow, playerNum) : This function is the constructor for Angel.
 *
 * function getSynchString(): 
 *
 * function getRaceAbilityInfo() : This function will return the information for the 
 * 		race. It's used for networking but currently returns an empty string.
 *
 * function getSelectionBox() : This function results the selectionBox.
 *
 * function initSelectionBox(): This function initializes the selectionBox for the Angel
 *
 * function moveVertically() : This function checks to see if the player on the client is 
 * 		allowed to move into the next row. 
 *
 * function moveHorizontally(): This function checks to see if the player on the client is 
 * 		allowed to move the selectionBox to the column on the board.
 *
 * function abilityA() : This Function is used to swap the orbs that lie within the 
 * 		selection box. The pivote orb is the orb closest to the player.
 *
 * function abilityB(): This function just returns false because Angel doesn't have an 
 * 		Ability B.
 *
 * function selectionMove(dir) : This function is used to move the selection box left and 
 * 		right throughout the board. Dir = a value of 1 or -1 that moves the selection box 
 * 		over by one column amount.
 *
 * function selectionShiftColumn(dir) : This function shifts the selection box to the 
 * 		appropriate column when a new column is added.
 * 
 * function 
**/

Utilities.subclass(Angel, Race);
function Angel(colRow, playerNum, clientHandler) {
	Race.call(this, colRow, "angel", VariableContainer.angelResourceHealth);	
	
	var selectionBox;
	
	
	this.getSynchString = function() {
		return "";
	}
	
	//This function will return the information for the race.
	//It's used for networking but currently returns an empty string.
	this.getRaceAbilityInfo = function() {
		var tempString = "";
		tempString = tempString + selectionBox.getColRow().getFirst() + "," + 
					selectionBox.getColRow().getSecond() + "," + 
					selectionBox.getNonPivotOrbY();
		return tempString;
	}
	
	//This function returns the selectionBox.
	this.getSelectionBox = function() {
		return selectionBox;
	}
	
	//This function initializes the selectionBox for the Angel
	this.initSelectionBox = function() {
	
		selectionBox = new SelectionBox(new Utilities.Pair(VariableContainer.boardDimensions.getFirst() - 1, 0), 
										this.getBoard().getPlayerSide()); 
				
		selectionBox.rotate(this.getBoard().getPlayerSide()); //To achieve a vertical orientation
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
			selectionBox.moveToPlayerY(colRow.getSecond());
			return true;
		}
	
		return false;
	}
	
	//This function checks to see if the player on the client is allowed to move
	//the selectionBox to the column on the board.
	this.moveHorizontally = function(dir) {
	
		if (this.selectionMove(dir)) { // -1 is to the left
			return true;
		}
	
		return false;
	}
	
	// This Function is used to swap the orbs that lie within the selection box. 
	// The pivote orb is the orb closest to the player.
	this.abilityA = function() {
	
		var pivotOrbX = selectionBox.getColRow().getFirst();
		var pivotOrbY = selectionBox.getColRow().getSecond();
		var nonPivotOrbX = selectionBox.getColRow().getFirst();
		var nonPivotOrbY = selectionBox.getColRow().getSecond();
		
		var rotation = selectionBox.getRotation();
		if (rotation == -180) rotation = 180;
		if (rotation == 90 || rotation == 270) {
			--nonPivotOrbY;
		} else if (rotation == -90 || rotation == -270) {
			++nonPivotOrbY;
		}
		
		var tempPivotOrb = this.getBoard().getOrb(pivotOrbX, pivotOrbY);
		var tempNonPivotOrb = this.getBoard().getOrb(nonPivotOrbX, nonPivotOrbY);
		 
		if (tempPivotOrb != null || tempNonPivotOrb != null) {
			if(((tempPivotOrb != null) && (tempPivotOrb.getMechanicType() != null)) ||
			   ((tempNonPivotOrb != null) && (tempNonPivotOrb.getMechanicType() != null))) {
				return false;
			}
			
			this.getBoard().swapOrb(pivotOrbX, pivotOrbY,
									nonPivotOrbX, nonPivotOrbY);
			
			// Count to database
			databaseVariables[playerNum].abilityA++;
			return true;
		}
	
		return false;
	}
	
	//This function just returns false because Angel doesn't have an Ability B.
	this.abilityB = function() {
		return false;
	}
	
	//This function is used to move the selection box left and right throughout the board.
	//Dir = a value of 1 or -1 that moves the selection box over by one column amount.
	this.selectionMove = function(dir) {
		if (this.getBoard().getPlayerSide() == "right")
			dir *= -1;
		var rotation = Math.abs(selectionBox.getRotation()); // take the absolute value
		var bounds = null;
		var colNumBox = selectionBox.getColRow().getFirst(); // selection box's x position
		
		// First figure out what side we're on, and then see what our rotation is
		// We are horizontal. We have to be our length away
		bounds = VariableContainer.boardDimensions.getFirst() - VariableContainer.selectionBoxLength; 
		
		if (rotation == 90) {
			// We are vertical. We can get 1 closer to the edge
			bounds = VariableContainer.boardDimensions.getFirst() - 1;
		}

		// Now check to see if we can make the bounds
		if (colNumBox + dir <= bounds && colNumBox + dir >= VariableContainer.boardDimensions.getFirst() - 
		    VariableContainer.angelStopColSpawn) {
			selectionBox.moveXDirection(dir);
			return true;
		}
		return false;
	}
	
	//This function shifts the selection box to the appropriate column when a new column is added.
	this.selectionShiftColumn = function(dir) {
		var rotation = selectionBox.getRotation();
		var bounds = null;
		var colNumBox = selectionBox.getColRow().getFirst(); // selection box's x position
		var rowNumBox = selectionBox.getColRow().getSecond();
		
		// First figure out what side we're on, and then see what our rotation is
		bounds = VariableContainer.boardDimensions.getFirst() - VariableContainer.selectionBoxLength; 
		if (this.getBoard().getOrb(colNumBox, rowNumBox) != null && 
			this.getBoard().getOrb(colNumBox - (-1 * dir), rowNumBox) != null && //not sure how this looks with vertical
			colNumBox + dir <= bounds && colNumBox + dir >= VariableContainer.boardDimensions.getFirst() - 
			VariableContainer.angelStopColSpawn) {
			selectionBox.moveXDirection(dir);
			return true;
		}
		return false;
	}
}

/**
 * This SelectionBox class exists within Angel. It is in charge of swapping the orbs within 
 * 		it's boundaries.
 *
 * function SelectionBox (colRow, side) : This is the constructor for SelectionBox
 *
 * function rotate (side) : This function is supposed to rotate the selection box around 
 * 		the pivot orb. 
 *
 * function getRotation() : This function will return the rotation of the SelectionBox.
 *
 * function getColRow() : This function will return the colRow position of the SelectionBox.
 *
 * function getNonPivotOrbY() : This function will return the nonPivotOrb in the Y 
 * 		direction.
 * function moveXDirection(directionX (int)): This function moves the selection
 * 		box in the x direction.
 *
 * function moveToPlayerY(playerY (int)) : This function will move the SelectionBox in line with the 
 * 		player's Y orientation

**/
function SelectionBox(colRow, side) {
	var rotation = 0;
	var nonPivotOrbY = colRow.getSecond();
	
	if (side == "right") {	
		rotation = 180;
	}

	 // This function is supposed to rotate the selection box around the pivot orb. 
	this.rotate = function(side) {
		var angle = 90;
		var leftBorder = VariableContainer.boardColumnOffset + VariableContainer.boardDimensions.getFirst() - 1;
		var rightBorder = VariableContainer.boardColumnOffset + VariableContainer.boardDimensions.getFirst() + 
						  2 * VariableContainer.resourceDimension + 2 * VariableContainer.shieldZoneDimension + 
						  VariableContainer.noMansLandDimension - 1;
		//This checks to see if the SelectionBox is in a corner and it shouldn't rotate.
		if (colRow.getFirst() == leftBorder || colRow.getFirst() == rightBorder) {
			return;
		}
		
		//This keeps the selectionBox oriented correctly.
		if (rotation == 0 || rotation == 180 || rotation == -180) {
			
			rotation = angle;
			if (colRow.getSecond() <= 0) {
				rotation = Math.abs(rotation) * -1;
			}else if (colRow.getSecond() >= VariableContainer.boardDimensions.getSecond() - 1) {
				rotation = Math.abs(rotation);
			}
		} else {
			rotation = 0;
		}
		
		if (side == "right" && rotation == 0) {
			rotation = 180;
		}
	}
	
	// This function will return the rotation of the SelectionBox
	this.getRotation = function() {
		return rotation;
	}
	
	//This function will return the colRow position of the SelectionBox
	this.getColRow = function() {
		return colRow;
	}
	
	//This function will return the nonPivotOrb in the Y direction.
	this.getNonPivotOrbY = function() {
		nonPivotOrbY = colRow.getSecond();
		if (rotation == 90 || rotation == 270) {
			--nonPivotOrbY;
		} else if (rotation == -90 || rotation == -270) {
			++nonPivotOrbY;
		}
		return nonPivotOrbY;
	}
	
	//This function will move the selectionBox a specified number of rows in the
	//X direction.
	this.moveXDirection = function(directionX) {
		colRow.setFirst(colRow.getFirst() + directionX);
	}
	
	//This function will move the SelectionBox in line with the player's Y orientation
	this.moveToPlayerY = function(playerY) {
		colRow.setSecond(playerY - VariableContainer.boardRowOffset); // Player Y in row count
		if (colRow.getSecond() <= 0) {
			rotation = Math.abs(rotation) * -1; // Force the negative orientation
		} else if (colRow.getSecond() >= VariableContainer.boardDimensions.getSecond() - 1) {
			rotation = Math.abs(rotation); // Forces the positive orientation
		}
	}
	
}

module.exports.Angel = Angel;
module.exports.SelectionBox = SelectionBox;

