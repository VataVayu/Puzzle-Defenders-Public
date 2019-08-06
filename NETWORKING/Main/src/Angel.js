/**
 * The Angel class governs the mechanics and the logic behind the Angel.
 *
 * function getSelectionBox() : This function returns the selectionBox.
 *
 * function initSelectionBox(): This function initializes the selectionBox for the Angel
 * 
 * 
 *
 * function setRaceAbilityInfo(info (data string)) : This function will return the 
 * information for the race.  It's used for networking but currently returns nothing.
 *
 * function getPairedItems() : This gets the orbs for the Ai.
 * 
 * function moveVertically(dir, isPaused) : This function checks to see if the player on 
 * 		the client is allowed to move into the next row. 
 *
 * function moveHorizontally(dir, isPaused) : This function checks to see if 
 * 		the player on the client is allowed to move the selectionBox to the column on the board.
 *
 * function abilityA(isPaused) : This Function is used to swap the orbs that 
 * 		lie within the selection box. The pivote orb is the orb closest to the player.
 *
 * function abilityB(isPaused) : This function just returns false because Angel doesn't 
 * 		have an Ability B.
 *
 * function selectionMove(dir) : This function is used to move the selection box left and
 * 		right throughout the board. Dir = a value of 1 or -1 that moves the selection 
 * 		box over by one column amount.
 *
 * function selectionShiftColumn() : This function shifts the selection box to the 
 * 		appropriate column when a new column is added.
 *
 * function update() : This function updates Angel but right now is only used to
 * 		reset the Angel's Sprite to it's idle sprite.
 *
 * function draw() : Draws the angel sprite and the selection box sprite.
**/

subclass(Angel, Race);
function Angel(colRow, communicator) { 
	Race.call(this, "angel", colRow, variableContainer.angelResourceHealth);
	
	/*Private Variables*/
	var selectionBox;
	var swappedOrb;
	var trackOrb;
	
	//This function returns the selectionBox.
	this.getSelectionBox = function() {
		return selectionBox;
	}
	
	//This function initializes the selectionBox for the Angel
	this.initSelectionBox = function() {
		//-1
		selectionBox = new SelectionBox(new Pair(variableContainer.boardDimensions.getFirst() - 1, 0), 
										this.getBoard().getPlayerSide()); 
		
		selectionBox.rotate(this.getBoard().getPlayerSide()); //To achieve a vertical orientation
	}
	
	//return race Information specifically for synch via action
	//encode info: first is pivotX, second is pivotY, third is nonPivotY
	this.getActionRaceInfo = function() {
		var tempString = "";
		tempString = tempString + selectionBox.getColRow().getFirst() + "," + 
					selectionBox.getColRow().getSecond() + "," + 
					selectionBox.getNonPivotOrbY() + "," + selectionBox.getRotation();
		return tempString;
	}
	
	//returns raceAbilityInfo for networking for synching via update.
	this.getRaceAbilityInfo = function() {
		var tempString = "";
		tempString = tempString + selectionBox.getColRow().getFirst() + "," + 
					selectionBox.getColRow().getSecond() + "," + 
					selectionBox.getNonPivotOrbY();
		return tempString;
	}
	
	//This function will return the information for the race.
	//It's used for networking but currently returns nothing.
	this.setRaceAbilityInfo = function(info) {
		/*console.log("Server's info: " + info);
		var tempList = info.split(",");
		console.log("Server's info: " + tempList);
		selectionBox.setColRow(parseInt(tempList[0]), parseInt(tempList[1]));
		selectionBox.setNonPivotOrbY(parseInt(tempList[2]));*/
	}
	
	//This gets the orbs for the Ai.
	this.getPairedItems = function() {
		return [selectionBox.getColRow().getFirst(), selectionBox.getColRow().getSecond()];
	}
	
	//This function checks to see if the player on the client is allowed to move
	//into the next row. 
	this.moveVertically = function(dir, isPaused) {
		if (isPaused == null || (isPaused != null && !isPaused())) {
			var boundaryCheck;
			var indexFrame;
			if (dir < 0) {
				boundaryCheck = colRow.getSecond() > variableContainer.playFieldCeiling;
				indexFrame = 1;
			} else {
				boundaryCheck = colRow.getSecond() < variableContainer.playFieldFloor;
				indexFrame = 2;
			}
			
			if (boundaryCheck) {
				this.setIndexFrame(indexFrame);
				this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);
				colRow.setSecond(colRow.getSecond() + dir);
				selectionBox.moveToPlayerY(colRow.getSecond());
				return true;
			}
		}
		return false;
	}
	
	//This function checks to see if the player on the client is allowed to move
	//the selectionBox to the column on the board.
	this.moveHorizontally = function(dir, isPaused) {
		if (isPaused == null || (isPaused != null && !isPaused())) {
			if (this.selectionMove(dir)) { // -1 is to the left
				this.setIndexFrame(3);
				this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);
				return true;
			}
		}
		return false;
	}
	
	// This Function is used to swap the orbs that lie within the selection box. The pivote orb is the orb closest to the player.
	this.abilityA = function(isPaused) {
	
		if (isPaused == null || (isPaused != null && !isPaused())) {
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
				swappedOrb = true;
				this.setIndexFrame(4);
				this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);

				return true;
			}
		}
		return false;
	}
	
	//This function just returns false because Angel doesn't have an Ability B.
	this.abilityB = function(isPaused) {
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
		bounds = variableContainer.boardDimensions.getFirst() - 
				variableContainer.selectionBoxLength; 
		
		if (rotation == 90) {
			// We are vertical. We can get 1 closer to the edge
			bounds = variableContainer.boardDimensions.getFirst() - 1;
		}

		// Now check to see if we can make the bounds
		if (colNumBox + dir <= bounds && colNumBox + dir >= variableContainer.boardDimensions.getFirst() - 
			variableContainer.angelStopColSpawn) {
			selectionBox.moveXDirection(dir);
			return true;
		}
		return false;
	}
	
	//This function shifts the selection box to the appropriate column when a new column is added
	this.selectionShiftColumn = function(dir) {
		var rotation = selectionBox.getRotation();
		var bounds = null;
		var colNumBox = selectionBox.getColRow().getFirst(); // selection box's x position
		var rowNumBox = selectionBox.getColRow().getSecond();
		
		// First figure out what side we're on, and then see what our rotation is
		bounds = variableContainer.boardDimensions.getFirst() - variableContainer.selectionBoxLength;
		if (variableContainer.isLocal) {
			if (this.getBoard().getOrb(colNumBox, rowNumBox) != null && 
				this.getBoard().getOrb(colNumBox - (-1 * dir), rowNumBox) != null && //not sure how this looks with vertical
				colNumBox + dir <= bounds && colNumBox + dir >= variableContainer.boardDimensions.getFirst() - 
				variableContainer.angelStopColSpawn) {
				selectionBox.moveXDirection(dir);
			}
		} else { //if online, have the selection box move because the server says so, independent of bounds
			selectionBox.moveXDirection(dir);
		}
	}
	
	//This function updates Angel but right now is only used to
	// reset the Angel's Sprite to it's idle sprite.
	this.update = function() {
		if (this.getSpriteTimer().isExpired()) {
			this.setIndexFrame(0);
		}
	}
	
	 //Draws the angel sprite and the selection box sprite
	this.draw = function() {
		var mirror = 1;
		var fix = 0;
		var tempOffset = 0;
		var firstEmptyCol = (this.getBoard().findColFrontOrb(colRow.getSecond()- variableContainer.boardRowOffset));
		if(this.getBoard().getPlayerSide() == "right") {
			mirror = -1;
			fix = -1 * variableContainer.cellDimensions.getFirst();
			tempOffset = this.getBoard().getOffset().getFirst() * variableContainer.cellDimensions.getFirst() + fix;
		}
		
		//Adding in the logic to draw line showing current row with appropriate color
		for (var i = 1; i < firstEmptyCol; ++i){
			spriteManager["dot"]["null"].draw(mirror * i + this.getBoard().getOffset().getFirst() + 3/8,
							 colRow.getSecond() + 1/8);
		}
		
		if(this.getBoard().getPlayerSide() == "left"){
			this.getSprite().draw(colRow.getFirst(),
											colRow.getSecond() + 
											variableContainer.charImgOffsetY, 
											this.getIndexFrame());				   
		} else {
			this.getSprite().drawFlipImage(colRow.getFirst(),
											colRow.getSecond() + 
											variableContainer.charImgOffsetY, 
											this.getIndexFrame());
		}
		
		//This function checks to see if the orb is currently being swapped
		if(this.getBoard().orbSwapping(selectionBox.getColRow(), swappedOrb) == true) {
			trackOrb = true;
		} else {
			trackOrb = false;
			swappedOrb = false;
		}
		//The second parameter is supposed to get the orb's position so the selection box
		//can be drawn on it.
		//This requires the ColRow of the selectionbox and the player's side
		selectionBox.draw(this.getBoard().getPlayerSide(), 
						  this.getBoard().getOffset(),
						  this.getBoard());
	}
}

/**
 * This SelectionBox class exists within Angel. It is in charge of swapping the orbs within 
 * 		it's boundaries.
 *
 * function SelectionBox (colRow, side) : This is the constructor for SelectionBox
 *
 * function rotate(side) : This function is supposed to rotate the selection box around 
 * 		the pivot orb.  
 *
 * function getRotation() : This function will return the rotation of the SelectionBox.
 *
 * function getColRow() : This function will return the colRow position of the SelectionBox.
 *
 * functioin setColRow(newCol (int), newRow (int)) : This function will return the colRow position of the 
 * 		SelectionBox.
 *
 * function getNonPivotOrbY() : This function will return the nonPivotOrb in the Y 
 * 		direction.
 *
 * function moveToPlayerY(playerY (int)) : This function will move the SelectionBox in line with the 
 * 		player's Y orientation
 *
 * function draw(side (int), offset (pair int), board (board object)) : Access the orb on my pivot, 
 * 		get it's position and use it's position to draw at position's coordinates.
**/

function SelectionBox(colRow, side) {
	/*Private Variables*/
	var selectionSprite = spriteManager["selectionBox"][0];
	var rotation = 0;
	var nonPivotOrbY = colRow.getSecond();
	
	if (side == "right") {
		rotation = 180;
	}
	
	 // This function is supposed to rotate the selection box around the pivot orb. 
	this.rotate = function(side) {
		var angle = 90;
		var leftBorder = variableContainer.boardColumnOffset + variableContainer.boardDimensions.getFirst() - 1;
		var rightBorder = variableContainer.boardColumnOffset + variableContainer.boardDimensions.getFirst() + 
						  2 * variableContainer.resourceDimension + 2 * variableContainer.shieldZoneDimension + 
						  variableContainer.noMansLandDimension - 1;
		//This checks to see if the SelectionBox is in a corner and it shouldn't rotate.
		if (colRow.getFirst() == leftBorder || colRow.getFirst() == rightBorder) {
			return;
		}
		
		//This keeps the selectionBox oriented correctly.
		if (rotation == 0 || rotation == 180 || rotation == -180) {
			
			rotation = angle;
			if (colRow.getSecond() <= 0) {
				rotation = Math.abs(rotation) * -1;
			}else if (colRow.getSecond() >= variableContainer.boardDimensions.getSecond() - 1) {
				rotation = Math.abs(rotation);
			}
		} else {
			rotation = 0;
		}
		
		if (side == "right" && rotation == 0) {
			rotation = 180;
		}
	}
	
	//This function will set the rotation of the selectionBox
	this.setRotation = function(newRotate) {
		rotation = newRotate;
	}
	
	// This function will return the rotation of the SelectionBox
	this.getRotation = function() {
		return rotation;
	}
	
	//This function will return the colRow position of the SelectionBox
	this.getColRow = function() {
		return colRow;
	}
	
	//This function will set the ColRow position for the Angel's seection box.
	this.setColRow = function(newCol, newRow) {
		colRow.setFirst(newCol);
		colRow.setSecond(newRow);
	}
	
	//set new value for nonPivotOrbY
	this.setNonPivotOrbY = function(newInt) {
		nonPivotOrbY = newInt;
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
		colRow.setSecond(playerY - variableContainer.boardRowOffset); // Player Y in row count
		if (colRow.getSecond() <= 0) {
			rotation = Math.abs(rotation) * -1; // Force the negative orientation
		} else if (colRow.getSecond() >= variableContainer.boardDimensions.getSecond() - 1) {
			rotation = Math.abs(rotation); // Forces the positive orientation
		}
	}
	
	//Access the orb on my pivot, get it's position and use it's position to draw at //position's coordinates.
	this.draw = function(side, offset, board) {
		
		var xCentering = .5;
		var finalPosX;
		var finalPosY;
		var mirror = 1;
		if (side == "right"){
			mirror = -1;
		}
		
		finalPosX = (mirror * colRow.getFirst()) + 
			offset.getFirst() + (mirror * board.getRowVisualOffset(colRow.getSecond()));
		finalPosY = colRow.getSecond() + offset.getSecond();
		
		selectionSprite.drawRotatedImage(finalPosX, finalPosY, xCentering,
										 .5, rotation);
	}
}