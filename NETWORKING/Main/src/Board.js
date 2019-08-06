/**
 *	Note: Each player will have his own board, which together constitute the full battlefield
 *
 *	playerSide: This field says what side of the screen the board is on, and //thus what direction the orbs fall
 *	playerRace: This is what race the player is if any changes are need ->(not needed at the moment)
 *	offset; //A Pair of x and y offsets that contribute to placement of board with respect to the screen
 *	this.yOffset = yOffset; //Placement of board with respect to the screen
 *
 * function Board(playerSide (string "right" or "left"), 
 *			raceType (string (string "Steampunk", "Angel", or "Witch")), 
 *			offset (pair(int, int))): Constructor of Board course object.
 * function getSpellActivated(): returns the spellActivated boolean variable.
 * function getShieldDetected(): returns the shieldDetected boolean varialbe.
 * function resetNumShieldFound(): Sets the numShieldFound to 0.
 * function getNumShieldFound(): returns the number of shields found with numShieldFound.
 * function getAttackdetected(): returns attackDetected boolean value
 * function resetNumAttackFound(): Resets the numAttackFound to 0.
 * function resetNumAttackFound(): returns the numAttackFound value.
 * function enableShield(): Enable shield by making shieldActive to true.
 * function disableShield(): Disable shield by making shieldActive to false.
 * function enableAttack(): Enable attacks by making attackActive to true.
 * function disableAttack(): Disable attacks by making attackActive to false.
 * function getHighlightedOrbList(): Returns the list highLightOrbList.
 * funcition clearHighlightedOrbList(): clears the highListhOrbList and set its length to 0. 
 * function getPlayerSide(): return the value of playerSide.  Must be "left" or
 * 			"right".
 * function getRaceType(): Returns the value raceType that must be steampunk, witch, or angel.
 * function getCharacter(): Returns character value.
 * function getBoardArray(): creates the array version of BoardArray into 
 * 			passArray.
 * function getOrbFromBoardArray(): Returns orb at col and row. 
 * function getOffset(): returns the offset pair.
 * function getAttackFairies(): Returns the list of attackFairies of the board.
 * function getShieldFairies(): Returns the list of shieldFairies of the board.
 * function deleteAttackFairies(): deletes the list of fairies in attackFairies.
 * function deleteShieldFairies(): deletes the list of fairies in shieldFairies.
 * function orbSwapping(colRow (pair(int,int)), swapping (boolean)): returns
 * 			true or false based orb movement. 
 * function getSpellOrbCount(): Returns the spellOrbCount.
 * function initializeCharacter(characterIn (character object)): Sets the character
 * 			to equal to characterIn.
 * function resetBoard(): Resets all grid areas to null.
 * function insertQueue(orbQueue (orb list), playerColRow (pair(int,int))): 
 * 			insert list orbs into board at row.
 * function getOrb(colNum (int), rowNum (int)): returns orb at colNum and 
 * 			rowNum in boardArray. 
 * function findColFrontOrb(rowNum (int)): Returns the column number of the 
 * 			first orb in the row, if there are any.  If none, returns null. 
 * function spliceOrb(colNum, rowNum): splices the orb off at colNum and rowNum.
 * 			Returns the spliced orb after it is done with splicing.
 * function spawnRow(rowNum (int), type (char)): spawn orb at rowNum
 * 			with type encoded data.
 * function update(): Function that updates orbs movement and matching of orbs.
 * function draw():  Draw function to draw all orbs on the board.
 * function swapOrb(firstColNum (int), firstRowNum (int), secondColNum (int), 
 *			secondRowNum (int)):  Function to swap orbs at firstColNum, firstRowNum 
 *			to secondColNum, secondRowNum.
 * function getRowVisualOffset function(row (int)): Returns rowVisualOffset at row.
 * function decompressBoard(serverBoard): Giant char string to decode to setup orbs on
 * 			boards.
**/

//the offset is an (x, y) pair
//X is column
//Y is row

function Board(playerSide, offset, timer, raceType) {
	
	/****Private Variables and initialization****/	
	var boardArray = new Array();
	var passArray = new Array();
	var touchedArray = new Array();
	
	//setting up the 2D array for orbs to be on a grid system.
	for (var i = 0; i < variableContainer.boardDimensions.getFirst(); i++) {
		boardArray[i] = new Array(variableContainer.boardDimensions.getSecond());
		passArray[i] = new Array(variableContainer.boardDimensions.getSecond());
		touchedArray[i] = new Array(variableContainer.boardDimensions.getSecond());
	}
	
	// Used to store the visual offset of spawned rows
	var rowVisualOffset = new Array();
	for (var i = 0; i < variableContainer.boardDimensions.getSecond(); i++) {
		rowVisualOffset[i] = 0;
	}

	var numSpawnedColumns = 0; // This will need  to be identified PER row most likely!
	var movingOrbs = []; //this is an array of orbs that have been shot or moved by the player (matches apply)
	var nonMatchMovingOrbs = []; //this is an array of orbs that have been shot or moved by the player
								// that wont make matches
	//for gamecontainer to use after board creates them
	var attackFairies = [];
	var shieldFairies = [];

	
	//A list of orbs that need to be highlighted upon startup.
	var highLightOrbList = [];
	//data holders
	
	var character = null;
	//data if attack match or shield match went off
	var shieldDetected = false;
	var numShieldFound = 0;
	var attackDetected = false;
	var numAttackFound = 0;
	
	var numFairyAttack = 0;
	// This variable is used to make it easier to write to the database
	// because we need to know what number the player is
	var playerNum = (playerSide == "left" ? 1 : 2);
	//flags to allow active of shields and/or attacks
	var shieldActive = true;
	var attackActive = true;
	var spellActivated = false;
	//This will keep track of how many Spell Orbs there are on the board
	var spellOrbCount = 0;
	
	//for tutorialHandler to see if a spell activated
	this.getSpellActivated = function() {
		return spellActivated;
	}
	
	//for tutorialHandler to see if a Shield was formed
	this.getShieldDetected = function() {
		return shieldDetected;
	}
	//to reset the number of shields set off for tutorialHandler
	this.resetNumShieldFound = function(){
		numShieldFound = 0;
	}
	//to get the number of shields formed.
	//for tutorialHandler
	this.getNumShieldFound = function() {
		return numShieldFound;
	}

	//returns true or false if an attack has been formed.
	//for tutorialHandler
	this.getAttackDetected = function() {
		return attackDetected;
	}
	//resets the number of attacks found
	//for tutorialHandler
	this.resetNumAttackFound = function(){
		numAttackFound = 0;
	}
	//returns the number of attacks found
	//for tutorialHandler
	this.getNumAttackFound = function() {
		return numAttackFound;
	}
	//enables shields for tutorialHandler
	this.enableShield = function() {
		shieldActive = true;
	}
	//disables shields for tutorialHandler
	this.disableShield = function() {
		shieldActive = false;
	}
	//enables attacks for tutorialHandler
	this.enableAttack = function() {
		attackActive = true;
	}
	//disables attacks for tutorialHandler
	this.disableAttack = function() {
		attackActive = false;
	}
	
	//This will return a list of the orbs that need to remain highlighted
	this.getHighlightedOrbList = function(){
		return highLightOrbList;
	}
	
	//This will clear the highlightedOrbList for the next part in the tutorial
	this.clearHighlightedOrbList = function(){
		highLightOrbList.splice(0,highLightOrbList.length);
		return highLightOrbList.length = 0;
	}
	//for finding out which side the board is for which player.
	this.getPlayerSide = function() {
		return playerSide;
	}
	
	//For returning the racetype that the board is associated with.
	this.getRaceType = function() {
		return raceType;
	}

	//returns a reference of character.
	this.getCharacter = function() {
		return character;
	}
	
	//returns a board in 2D array format
    this.getBoardArray = function() {
		for(var i = 0; i < variableContainer.boardDimensions.getFirst(); i++){
			for(var j = 0; j < variableContainer.boardDimensions.getSecond(); j++){
				if(boardArray[i][j] == null){
					passArray[i][j] = "";
					continue;
				}
				else if(boardArray[i][j].isSacrificed()){
					passArray[i][j] = "s"+(((boardArray[i])[j]).getType()).charAt(0);
				}
				else{
					passArray[i][j] = (((boardArray[i])[j]).getType()).charAt(0);
				}
			}
		}
        return passArray;
    }
    
	//returns board with colIndex and rowIndex
	this.getOrbFromBoardArray = function(col, row) {
		return boardArray[col][row];
	}

	//returns the pair object offset for it to be used.
	this.getOffset = function() {
		return offset;
	}
	
	//returns a list of attack fairies
	this.getAttackFairies = function() {
		return attackFairies;
	}
	//returns a lit of shield fairies
	this.getShieldFairies = function() {
		return shieldFairies;
	}
	//deletes the elements in attackFairies list.
	this.deleteAttackFairies = function() {
		attackFairies.splice(0, attackFairies.length);
	}
	//deletes the fairies in shieldFairies list.
	this.deleteShieldFairies = function() {
		shieldFairies.splice(0, shieldFairies.length);
	}
	
	//This function should return a boolean on whether the orb is currently being
	// swapped.
	this.orbSwapping = function(colRow, swapping) {
		if (boardArray[colRow.getFirst()][colRow.getSecond()] == null) {
			return false;
		} else if (boardArray[colRow.getFirst()][colRow.getSecond()].isMoving() && 
				   swapping) {
			return true;
		}
		return false;
	}
	
	//returns the number of spellOrbs
	this.getSpellOrbCount = function(){
		return spellOrbCount;
	}
	
	//sets teh character reference
	this.initializeCharacter = function(characterIn) {
		character = characterIn;
	}
	
	//reset the board
	this.resetBoard = function() {
		for(var colInt = 0; colInt < variableContainer.boardDimensions.getFirst(); colInt++) {
			for(var rowInt = 0; rowInt < variableContainer.boardDimensions.getSecond(); rowInt++) {
				boardArray[colInt][rowInt] = null;
			}			
		}
	}
	//insert orbs into the board for witch and steampunk.
	this.insertQueue = function(orbQueue, playerRow) {
		var index = 0;
		var usedCount = 0; //may be a decimal
		
		var colFrontOrb = this.findColFrontOrb(playerRow - variableContainer.boardRowOffset);

		if (colFrontOrb > 1) {
		if (colFrontOrb < variableContainer.boardDimensions.getFirst()) {
			usedCount = this.getOrb(colFrontOrb, playerRow - variableContainer.boardRowOffset).getColRow().getFirst();
			if (usedCount > 1) { //if the orb is interior to the board
				usedCount = 0;
				
			} else { //if the orb is exterior to the board or overlapping player
				usedCount-= variableContainer.queueSpacingDistance; //go a little more behind the closest orb. artbitrary value from variableContainer
			}
		}
		
		var tempOrb = null;
		while (index < variableContainer.boardDimensions.getFirst() && 
			   boardArray[index][playerRow - variableContainer.boardRowOffset] == null) {
				++index;
		}
		--index;
		//to record how many orbs should be sent to the board.
		var num_orb = index; 
		if(index > orbQueue.length) {
			num_orb = orbQueue.length;
		}
		while (index > 0 && orbQueue.length > 0) {
			tempOrb = orbQueue.shift();
			tempOrb.getColRow().setFirst(-(variableContainer.boardColumnOffset - 
									variableContainer.borderDimension - usedCount));
			tempOrb.getColRow().setSecond(playerRow - variableContainer.boardRowOffset);
			if (character.getRace().getName() == "witch") {
				tempOrb.setGravity(variableContainer.witchShootSpeed);
			}
			boardArray[index][playerRow - variableContainer.boardRowOffset] = tempOrb;
			boardArray[index][playerRow - variableContainer.boardRowOffset].setDestination(index , 
								playerRow - variableContainer.boardRowOffset);
			--index;
			--usedCount;
			nonMatchMovingOrbs.push(tempOrb);
		}
		
		if ((character.getRace().getName() == "witch")) {
			for (var y = 0; y < num_orb; y++) {
				tempOrb = nonMatchMovingOrbs.pop();
				tempOrb.setMemberMatched(true);
				movingOrbs.unshift(tempOrb);
			}
		} else if (tempOrb != null && (character.getRace().getName() == "witch" 
			|| tempOrb.isSacrificed())) { //if we take this out, a regular steampunk orb can trigger a match..
			tempOrb.setReadyMatched(true);
			tempOrb.setMemberMatched(true);
			movingOrbs.unshift(tempOrb);
			nonMatchMovingOrbs.pop();
		}
		}
	}
	
	//Returns orb object at the appropriate decision
	this.getOrb = function(colNum, rowNum) {
		if((colNum < 0) || (colNum >= variableContainer.boardDimensions.getFirst()) 
			|| (rowNum < 0) || (rowNum >= variableContainer.boardDimensions.getSecond())) {
			return null;
		}
		return boardArray[colNum][rowNum];
	}
	//returns the orb col number position if orb exists.
	this.findColFrontOrb = function(rowNum) {
		for (var colNum = 0; colNum < variableContainer.boardDimensions.getFirst(); ++colNum) {
			if (boardArray[colNum][rowNum] != null) {
				return colNum;
			}
		}
		return colNum;	
	}
	
	this.findTypeInRow = function(rowNum, type) {
		var point = -1;
		if (type != null) {
			for (var colNum = variableContainer.boardDimensions.getFirst()-1; colNum > 0; --colNum) {
				if ((boardArray[colNum][rowNum] != null) && (boardArray[colNum][rowNum].getType() == type)) {
					point = colNum;
				}
			}
		}
		return point;	
	}
	
	//Delete an orb from the board at a given (rowNum, colNum) and return it
	this.spliceOrb = function(colNum, rowNum) {	
		var splicedOrb = boardArray[colNum][rowNum];
		boardArray[colNum][rowNum] = null;
		touchedArray[colNum][rowNum] = new CountDownTimer(timer, 250);
		return splicedOrb;
	}
	
	//Board Director uses this function to spawn orbs
	this.spawnRow = function(rowNum, type) {
		var orbHighlight = false;
		
		// Adds the visual offset as the row has a spawn
		rowVisualOffset[rowNum] = .9;
		if (type == null) {
			for (var colNum = 0; colNum < variableContainer.boardDimensions.getFirst(); colNum++) {
				if (boardArray[colNum][rowNum] != null) {
					if (colNum <= 0) {
						deleteOrb(colNum, rowNum);
					} else {
						if ((boardArray[colNum][rowNum].isSwapping() && 
								boardArray[colNum][rowNum].isMovingVertically()) || 
								!boardArray[colNum][rowNum].isMoving()) {
							boardArray[colNum][rowNum].setColPosition(colNum - 1);
						} else if (boardArray[colNum][rowNum].isSacrificed() || 
							boardArray[colNum][rowNum].getMemberMatched()) {
							boardArray[colNum][rowNum].setDestination(colNum - 1, rowNum);
						}
						moveOrb(colNum, rowNum, colNum - 1, rowNum);
					}
				}
			}
			spawnOrb(variableContainer.boardDimensions.getFirst() - 1, rowNum, "random", orbHighlight);
		} else {
			//This will check to see which type of orb should be spawned
			//Also checks for highlighted orbs
			var orbType = null;
			if (type == "a") {
				orbType = variableContainer.typeEnum[0];
			} else if (type == "A" ) {
				orbType = variableContainer.typeEnum[0];
				orbHighlight = true;
			} else if (type == "w" ) {
				orbType = variableContainer.typeEnum[1];
			} else if (type == "W" ) {
				orbType = variableContainer.typeEnum[1];
				orbHighlight = true;
			} else if (type == "f" ) {
				orbType = variableContainer.typeEnum[2];
			} else if (type == "F" ) {
				orbType = variableContainer.typeEnum[2];
				orbHighlight = true;
			} else if (type == "e" ) {
				orbType = variableContainer.typeEnum[3];
			} else if (type == "E" ) {
				orbType = variableContainer.typeEnum[3];
				orbHighlight = true;
			} else if (type == "r" ) {
				orbType = variableContainer.typeEnum[4];
			} else if (type == "d" ) { //Specific for invisible non matching orbs
				orbType = variableContainer.typeEnum[5];
			}
			
			if (orbType != null) {
				for (var colNum = 0; colNum < variableContainer.boardDimensions.getFirst(); colNum++) {
					if (boardArray[colNum][rowNum] != null) {
						if (colNum <= 0) {
							deleteOrb(colNum, rowNum);
						} else {
							if ((boardArray[colNum][rowNum].isSwapping() && 
									boardArray[colNum][rowNum].isMovingVertically()) || 
									!boardArray[colNum][rowNum].isMoving()) {
								boardArray[colNum][rowNum].setColPosition(colNum - 1);
							} else if (boardArray[colNum][rowNum].isSacrificed() || 
								boardArray[colNum][rowNum].getMemberMatched()) {
								boardArray[colNum][rowNum].setDestination(colNum - 1, rowNum);
							}
							moveOrb(colNum, rowNum, colNum - 1, rowNum);
						}
					}	
				}
				spawnOrb(variableContainer.boardDimensions.getFirst() - 1, rowNum, orbType, orbHighlight);
			} else if (type == "s") {
				for (var colNum = 0; colNum < variableContainer.boardDimensions.getFirst(); colNum++) {
					if (boardArray[colNum][rowNum] != null) {
						if (colNum <= 0) {
							deleteOrb(colNum, rowNum);
						} else {
							if (boardArray[colNum][rowNum].isSwapping() || 
								!boardArray[colNum][rowNum].isMoving()) {
								boardArray[colNum][rowNum].setColPosition(colNum - 1);
							} else if (boardArray[colNum][rowNum].isSacrificed() || 
								boardArray[colNum][rowNum].getMemberMatched()) {
								boardArray[colNum][rowNum].setDestination(colNum - 1, rowNum);
							}
							moveOrb(colNum, rowNum, colNum - 1, rowNum);
						}
					}	
				}
				spawnOrb(variableContainer.boardDimensions.getFirst() - 1, rowNum, type, orbHighlight);
				++spellOrbCount;
			}
		}
	}
	
	
	
	//This function will update the board, to deal with any orbs that need to move their 
	//position in the data structure.
	this.update = function() {
		//reset the attack and shield
		//found when a new update occurs
		shieldDetected = false;
		attackDetected = false;
		spellActivated = false;
		
		for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); rowNum++) {
			updateRow(rowNum);
		}
		
		for (var i = 0; i < nonMatchMovingOrbs.length; ++i) {
			if (!nonMatchMovingOrbs[i].isMoving() && !nonMatchMovingOrbs[i].isMovingVertically()) {
				nonMatchMovingOrbs[i].setGravity(variableContainer.boardGravity);
				if (nonMatchMovingOrbs[i].isSwapping()) 
					nonMatchMovingOrbs[i].setSwapping(false);
				nonMatchMovingOrbs.splice(i, 1);
				--i;
			}
		}
		
		// Updates the visual offsets
		for (var i in rowVisualOffset) {
			if (rowVisualOffset[i] > 0) {
				rowVisualOffset[i] -= variableContainer.visualShift;
				if (rowVisualOffset[i] < 0) {
					rowVisualOffset[i] = 0;
				}
			}
		}
		
		// Possible Error for added orb at the moment a column is called
		var rowIndex;
		var colIndex;
		var matchTriggered;
		var neighborColIndex;
		var movingOrbsLength = movingOrbs.length;
		for (var i = 0; i < movingOrbsLength; ++i) {
			matchTriggered = false;
			if(movingOrbs[i] != null) {
				colIndex = movingOrbs[i].getPrevDestinationColRow().getFirst();
				rowIndex = movingOrbs[i].getPrevDestinationColRow().getSecond();
			}
			if ((movingOrbs[i] == null) || ((movingOrbs[i] != null) && 
				(boardArray[colIndex][rowIndex] == null))) {
					if (movingOrbs[i].getSpell == null) {
						movingOrbs[i].setImage("orb");
					}
					movingOrbs.splice(i, 1);
					--movingOrbsLength;
					--i;
			} else {
				colIndex = movingOrbs[i].getPrevDestinationColRow().getFirst();
				rowIndex = movingOrbs[i].getPrevDestinationColRow().getSecond();
				neighborColIndex = colIndex + 1;
				if (boardArray[colIndex][rowIndex] != null) {
					if ((!boardArray[colIndex][rowIndex].isMoving() 
						&& !boardArray[colIndex][rowIndex].isMovingVertically())
						&& (boardArray[colIndex][rowIndex].getMechanicType() == null)) {
						
						matchTriggered = detectionController(colIndex, rowIndex);
						//for sacrifice orb to delete orb next to it.
						if(!matchTriggered){
							if (movingOrbs[i].isSacrificed()) {
								 if (neighborColIndex < variableContainer.boardDimensions.getFirst() &&
									 boardArray[neighborColIndex][rowIndex] != null &&
									 !boardArray[neighborColIndex][rowIndex].isSacrificed()) {
										//server deletes orb, not client.  Only local it is done.
										if(variableContainer.isLocal && 
											(boardArray[neighborColIndex][rowIndex].getMechanicType() == null)) {
											deleteOrb(neighborColIndex, rowIndex);
										}
								 }
								 //only local, for network, server handles it.
								 if (variableContainer.isLocal) {
									deleteOrb(colIndex, rowIndex);
								 }
								SoundJS.play("sacrificeDestroyedOrb", SoundJS.INTERRUPT_LATE, 1);
							} else {
								//sets the orb back to normal and match mechanics to false, so
								//it will not cause game mechanic match errors.
								movingOrbs[i].setReadyMatched(false);
								movingOrbs[i].setMemberMatched(false);
								movingOrbs[i].setGravity(variableContainer.boardGravity);
							}
						}
						//reset image of orb to normal orb image.
						if (movingOrbs[i].getSpell == null) {
							if (movingOrbs[i].isSwapping()) {
									movingOrbs[i].setImage("orb");
							} else {
								movingOrbs[i].setImage("orb");
							}
						}
						if (movingOrbs[i].isSwapping()) {
							movingOrbs[i].setSwapping(false);
						}
						//decrements moving orbs list and length if orb fails to form
						//a match or is not a sacrifice orb.
						movingOrbs.splice(i, 1);
						--movingOrbsLength;
						--i;
					}
				} 
			}
		}
		//only for local, where the buffer zone, orbs that are not part of a match are del
		if(variableContainer.isLocal) {
			for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); ++rowNum) {
				if (boardArray[0][rowNum] != null && !boardArray[0][rowNum].isMoving() 
					&& (boardArray[0][rowNum].getMechanicType() == null)) {
					deleteOrb(0, rowNum);
				}
				if (boardArray[1][rowNum] != null && !boardArray[1][rowNum].isMoving() 
					&& (boardArray[1][rowNum].getMechanicType() == null)) {
					deleteOrb(1, rowNum);
				}
				if (boardArray[2][rowNum] != null && !boardArray[2][rowNum].isMoving() 
					&& (boardArray[2][rowNum].getMechanicType() == null)) {
					deleteOrb(2, rowNum);
				}
			}
		}
	}

	//This function will draw all of the orbs in the board to the screen. Will make use of Orb class draw function.
	this.draw = function() {
		var usedOffset = 0;
		var mirror = 1;
		if (playerSide == "right") {
			mirror = -1;
		}
		for (var colNum = 0; colNum < variableContainer.boardDimensions.getFirst(); colNum++) {
			for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); rowNum++) {
				if (boardArray[colNum][rowNum] != null) {
					usedOffset = 0;
					if (!boardArray[colNum][rowNum].isMoving()) {
						usedOffset += mirror * rowVisualOffset[rowNum];
					}
					
					boardArray[colNum][rowNum].draw(offset.getFirst() + 
						usedOffset, offset.getSecond(), mirror);
				}
			}
		}
	}
	
	//This function swaps individual orbs
	this.swapOrb = function(firstColNum, firstRowNum, secondColNum, secondRowNum) {
		
		var tempOrbOne = boardArray[firstColNum][firstRowNum];
		var tempOrbTwo = boardArray[secondColNum][secondRowNum];
		if ((tempOrbOne == null || !tempOrbOne.isSwapping()) &&
			(tempOrbTwo == null || !tempOrbTwo.isSwapping())) {
			
			// Data Swap of orbs
			boardArray[firstColNum][firstRowNum] = tempOrbTwo; 
			boardArray[secondColNum][secondRowNum] = tempOrbOne;
			
			
			if (tempOrbOne != null) {
				SoundJS.play("orbsSwapped", SoundJS.INTERRUPT_LATE, 1);
				tempOrbOne.setSwapping(true);
				tempOrbOne.setGravity(variableContainer.angelSwapSpeed);
				tempOrbOne.setMemberMatched(true);
				if (tempOrbTwo == null && secondColNum < variableContainer.boardDimensions.getFirst()-1 &&
					boardArray[secondColNum + 1][secondRowNum] == null) {
					nonMatchMovingOrbs.push(tempOrbOne);
				} else { 
					movingOrbs.push(tempOrbOne);
				}
			}
			
			if (tempOrbTwo != null) {
				SoundJS.play("orbsSwapped", SoundJS.INTERRUPT_LATE, 1);
				tempOrbTwo.setSwapping(true);
				tempOrbTwo.setGravity(variableContainer.angelSwapSpeed);
				tempOrbTwo.setMemberMatched(true);
				if (tempOrbOne == null && firstColNum < variableContainer.boardDimensions.getFirst()-1 &&
					boardArray[firstColNum + 1][firstRowNum] == null) {
					nonMatchMovingOrbs.push(tempOrbTwo);
				} else {
					movingOrbs.push(tempOrbTwo);
				}
			}
		}
	}
	
	//returns rowVisualOffset at a specify row.
	this.getRowVisualOffset = function(row) {
		return rowVisualOffset[row];
	}
	
	//For server to send the information of the board to client to build the board.
	//server dictates all.
	this.decompressBoard = function(serverBoard) {
		var stringBoard = serverBoard.split("N");
		for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); rowNum++) {
			var temp = stringBoard[rowNum].split("");
			if (rowVisualOffset[rowNum] == 0) {
				rowVisualOffset[rowNum] = temp.shift()/10;
				if(rowVisualOffset[rowNum] != 0) {
					spawnRowHelper(rowNum, temp[0]);
				}
			}else {
				temp.shift();
			}
			for (var colNum = variableContainer.boardDimensions.getFirst() - 1; colNum >= 0; colNum--) {
				if (boardArray[colNum][rowNum] != null) {
					var type = boardArray[colNum][rowNum].getType();
					// Server has no orbs here, so delete them
					if (temp.length <= 0) {
						if (!boardArray[colNum][rowNum].isMoving() || 
								character.getRace().getName() == variableContainer.races[2]) {
							deleteOrb(colNum, rowNum);
						}
					// Orb type doesn't match
					} else if (temp[0] != type.slice(0,1) || 
						boardArray[colNum][rowNum].getSpell != null) {
						// Orb is part of a match, and will be dealt with
						if (temp[0] != "s" && temp[0] != "a" && temp[0] != "e" 
							&& temp[0] != "f" && temp[0] != "w") {
							decodeMatches(temp.shift(), colNum, rowNum);
							deleteOrb(colNum, rowNum);
						// Orbs actually spellorbs and match
						} else if (temp[0] == "s" && boardArray[colNum][rowNum].getSpell != null) {
							 temp.shift();
						// One orb spellorb and don't match
						} else if (temp[0] == "s" || boardArray[colNum][rowNum].getSpell != null) {
							deleteOrb(colNum, rowNum);
							spawnOrb(colNum, rowNum, orbTypeHelper(temp.shift()));
						// No orb spellorb and don't match
						} else {
							if (boardArray[colNum][rowNum].isSacrificed()) {
								deleteOrb(colNum, rowNum);
							} else {
								boardArray[colNum][rowNum].setType(orbTypeHelper(temp.shift()));
							}
						}
					// Orbs match
					} else {
						temp.shift();
					}
				} else {
					// Spawn orb if client board doesn't have one
					// and the server does
					if (temp.length > 0) {
						if (temp[0] != "s" && temp[0] != "a" && temp[0] != "e" 
							&& temp[0] != "f" && temp[0] != "w") {
							decodeMatches(temp.shift(), colNum, rowNum);
						} else {
							if (touchedArray[colNum][rowNum] == null || 
							touchedArray[colNum][rowNum].isExpired()) {
								spawnOrb(colNum, rowNum, orbTypeHelper(temp.shift()));
							} else {
								temp.shift();
							}
						}
					// If the Server has no orb and the board doesn't go to
					// the next row
					} else {
						break;
					}
				}
			}
			partialUpdateRow(rowNum);
		}
	}
	
	
	//--------------------------------Private Functions--------------------------------
	
	/**
	* Function to spawnOrbs and aids a spawn function
	*
	* param type rowNum, type: rowNum is the int position to spawn an orb, type is the type 
	* 		to spawn with.
	**/
	function spawnRowHelper(rowNum, type) {
		type = orbTypeHelper(type);
		for (var colNum = 0; colNum < variableContainer.boardDimensions.getFirst(); ++colNum) {
			if (boardArray[colNum][rowNum] != null && colNum > 0) {
				moveOrb(colNum, rowNum, colNum - 1, rowNum);
				touchedArray[colNum - 1][rowNum] = touchedArray[colNum][rowNum];
				touchedArray[colNum][rowNum] = null;
			}
		}
		spawnOrb(variableContainer.boardDimensions.getFirst() - 1, rowNum, type);
	}
	
	/**
	* Function to decode matches sent by server and set the game mechanic
	*
	* param type matchType, colNum, rowNum: matchType is the char value, colNum, rowNum are int 
	* 	position.
	**/
	function decodeMatches(matchType, colNum, rowNum) {
		var spellActive = false;
		var type;
		var attuned = false;
		var shieldOrb = false;
		var attackOrb = false;
		//each letter represents and orb in a particuliar state,
		//such as spell, type, and attuned.
		switch(matchType) {
			case("b"):
				type = "air";
				attackOrb = true;
				break;
			case("B"):
				type = "air";
				attuned = true;
				attackOrb = true;
				break;
			case("c"):
				type = "air";
				shieldOrb = true;
				break;
			case("C"):
				type = "air";
				attuned = true;
				shieldOrb = true;
				break;
			case("d"):
				type = "air";
				attackOrb = true;
				shieldOrb = true;
				break;
			case("D"):
				type = "air";
				attuned = true;
				attackOrb = true;
				shieldOrb = true;
				break;
			case("x"):
				type = "water";
				attackOrb = true;
				break;
			case("X"):
				type = "water";
				attuned = true;
				attackOrb = true;
				break;
			case("y"):
				type = "water";
				shieldOrb = true;
				break;
			case("Y"):
				type = "water";
				attuned = true;
				shieldOrb = true;
				break;
			case("z"):
				type = "water";
				attackOrb = true;
				shieldOrb = true;
				break;
			case("Z"):
				type = "water";
				attuned = true;
				attackOrb = true;
				shieldOrb = true;
				break;
			case("g"):
				type = "fire";
				attackOrb = true;
				break;
			case("G"):
				type = "fire";
				attuned = true;
				attackOrb = true;
				break;
			case("h"):
				type = "fire";
				shieldOrb = true;
				break;
			case("H"):
				type = "fire";
				attuned = true;
				shieldOrb = true;
				break;
			case("i"):
				type = "fire";
				attackOrb = true;
				shieldOrb = true;
				break;
			case("I"):
				type = "fire";
				attuned = true;
				attackOrb = true;
				shieldOrb = true;
				break;
			case("j"):
				type = "earth";
				attackOrb = true;
				break;
			case("J"):
				type = "earth";
				attuned = true;
				attackOrb = true;
				break;
			case("k"):
				type = "earth";
				shieldOrb = true;
				break;
			case("K"):
				type = "earth";
				attuned = true;
				shieldOrb = true;
				break;
			case("l"):
				type = "earth";
				attackOrb = true;
				shieldOrb = true;
				break;
			case("L"):
				type = "earth";
				attuned = true;
				attackOrb = true;
				shieldOrb = true;
				break;
			case("t"):
				spellActive = true;
				type = character.getSpell().getType();
				attackOrb = true;
				break;
			case("T"):
				spellActive = true;
				type = character.getSpell().getType();
				attuned = true;
				attackOrb = true;
				break;
			case("u"):
				spellActive = true;
				type = character.getSpell().getType();
				shieldOrb = true;
				break;
			case("U"):
				spellActive = true;
				type = character.getSpell().getType();
				attuned = true;
				shieldOrb = true;
				break;
			case("v"):
				spellActive = true;
				type = character.getSpell().getType();
				attackOrb = true;
				shieldOrb = true;
				break;
			case("V"):
				spellActive = true;
				type = character.getSpell().getType();
				attuned = true;
				attackOrb = true;
				shieldOrb = true;
				break;
		}
		//sets the fairies and spell in this part of the code.
		if(spellActive) {
			character.getSpell().activate();
		}
		if (attackOrb) {
			spawnAttackFairy(type, attuned, colNum, rowNum);
		}
		if (shieldOrb) {
			spawnShieldFairy(type, attuned, colNum, rowNum);
		}
	}
	
	/**
	* Function to determine the type in words
	*
	* param type colNum, rowNum, type, orbHighlight: colNum, rowNum are int 
	* 	position, type is water, air, fire, earth.  OrbHighLight is a list of
	* 	orbs that are to be highlighted.
	**/
	function orbTypeHelper(type) {
		var newOrbType;
		switch(type) {
			case("a"):
				newOrbType = "air";
				break;
			case("e"):
				newOrbType = "earth";
				break;
			case("f"):
				newOrbType = "fire";
				break;
			case("w"):
				newOrbType = "water";
				break;
			case("s"):
				newOrbType = "s";
				break;
		}
		return newOrbType;
	}
	
	/**
	* Function to spawn orbs at colNum, rowNum, with type
	*
	* param type colNum, rowNum, type, orbHighlight: colNum, rowNum are int 
	* 	position, type is water, air, fire, earth.  OrbHighLight is a list of
	* 	orbs that are to be highlighted.
	**/
	function spawnOrb(colNum, rowNum, type, orbHighlight) {
		if (boardArray[colNum][rowNum] == null) {
			// To Spawn spell orbs, logic must go here somehow
			// The spells for the player are in character
			var tmpOrb;
			if (type == "s") { 
				tmpOrb = new SpellOrb(character.getSpell(), //CORRECT THESE PARAMETERS
									new Pair(colNum, rowNum), 
									character.getSpell().getType(), 
									 variableContainer.boardGravity);
				boardArray[colNum][rowNum] = tmpOrb;
			} else {
				tmpOrb = new Orb(new Pair(colNum, rowNum), type, 
									variableContainer.boardGravity);
				boardArray[colNum][rowNum] = tmpOrb;
			}
			if(orbHighlight){
				highLightOrbList.push(tmpOrb);
			}
		}
	}
	
	/**
	* Function to delete orb at colNum, rowNum
	*
	* param type colNum, rowNum: position of orb at colNum, rowNum int.
	**/
	function deleteOrb(colNum, rowNum) {
		// This decrements the spellorb count if the orb is a spellorb
		if (boardArray[colNum][rowNum].getSpell != null) {
			--spellOrbCount;
		}
		boardArray[colNum][rowNum] = null;
	}

	/**
	* Function moves individual orbs from one spot to another.
	*
	* param type colNum, rowNum, destColNum, destRowNum: All four arguments are
	* 	integer values.  colNum, rowNum is an orb at that position that moves to
	* 	the position destColNum, destRowNum
	**/
	function moveOrb(currColNum, currRowNum, destColNum, destRowNum) {
		if (boardArray[destColNum][destRowNum] == null) {
			boardArray[destColNum][destRowNum] = boardArray[currColNum][currRowNum]; 
			boardArray[currColNum][currRowNum] = null; 
		}
	}
	
	/**
	* Function to shift an orb to the left
	*
	* param type colNum, rowNum: position of orb at colNum, rowNum int.
	**/
	function shiftOrb(colNum, rowNum) {
		if (boardArray[colNum][rowNum] != null) {
			if (colNum <= 0) {
				deleteOrb(colNum, rowNum);
			} else {
				moveOrb(colNum, rowNum, colNum - 1, rowNum);
			}
		}
	}
	
	/**
	* Function updates a row and shifts its orbs if an open space is found
	*
	* param type, rowNum: integer row position.
	**/
	function updateRow(rowNum) {
		var emptyColNum = null;
		for (var colNum = variableContainer.boardDimensions.getFirst() - 1; colNum >= 0; colNum--) {
			if (boardArray[colNum][rowNum] != null) {
				if (emptyColNum != null && !boardArray[colNum][rowNum].isSwapping() && 
					!boardArray[colNum][rowNum].isMovingVertically()) {
					if (!boardArray[colNum][rowNum].isMoving() && 
						!boardArray[colNum][rowNum].getReadyMatched() &&
						(boardArray[colNum][rowNum].getMechanicType() == null)) {
							movingOrbs.push(boardArray[colNum][rowNum]);
							boardArray[colNum][rowNum].setSwapping(true);
							boardArray[colNum][rowNum].setReadyMatched(true);
					}
					
					moveOrb(colNum, rowNum, emptyColNum, rowNum); //shift the current orb to the empty column
					orbUpdate(emptyColNum, rowNum);//drop the orb toward its new spot
					emptyColNum--; //shift the empty column to the left since the old one has been filled
				} else if (variableContainer.isLocal && 
							(boardArray[colNum][rowNum].getMechanicType() != null)) {
					orbUpdate(colNum, rowNum);
					emptyColNum = null;
					if(boardArray[colNum][rowNum].getCountDown() <= 0) {
						var tempMechanicType = boardArray[colNum][rowNum].getMechanicType();
						var tempOrb = boardArray[colNum][rowNum];
						var tempType = boardArray[colNum][rowNum].getType();
						var isAttuned;
						//setting isAttuned
						switch (character.getRace().getName()) { 
							case "angel":
								if (tempType == variableContainer.typeEnum[0]) { //air
									isAttuned = true;
								} else {
									isAttuned = false;
								}
								break;
							case "steampunk":
								if (tempType == variableContainer.typeEnum[2]) { //fire
									isAttuned = true;
								} else {
									isAttuned = false;
								}
								break;
							case "witch":
								if (character.getSpell().attunedCount() > 0) {
									isAttuned = true;
								} else {
									if (tempType == variableContainer.typeEnum[3]) { //earth
										isAttuned = true;
									} else {
										isAttuned = false;
									}
								}
								break;
							default:
						}
								
						if (tempOrb.getSpell != null) {
							tempOrb.activate(tempOrb.getPrevDestinationColRow());
							spellActivated = true;
						}						
								
						//calling the right functions to create fairies
						switch(tempMechanicType) {
							case 0:
								spawnAttackFairy(tempType, isAttuned, colNum, rowNum);
								break;
							case 1:
								spawnShieldFairy(tempType, isAttuned, colNum, rowNum);
								break;
							case 2:
								spawnAttackFairy(tempType, isAttuned, colNum, rowNum);
								spawnShieldFairy(tempType, isAttuned, colNum, rowNum);
								break;
							default:
						}
						deleteOrb(colNum, rowNum);
					}
				} else {
					//update orb for networking
					orbUpdate(colNum, rowNum);
				}
			} else if (emptyColNum == null) { //an empty column has not yet been found and this column is empty,
				//updates the emptyColNum to a different position for orb to be moved to the correct spot.
				emptyColNum = colNum;		//so store this empty column number 
			}
		}
	}
	
	/**
	* Function to partially update orbs in a row for networking.
	*
	* param type, rowNum: integer row position.
	**/
	function partialUpdateRow(rowNum) {
		var emptyColNum = null;
		for (var colNum = variableContainer.boardDimensions.getFirst() - 1; colNum >= 0; colNum--) {
			if (boardArray[colNum][rowNum] != null) {
				if (emptyColNum != null && !boardArray[colNum][rowNum].isSwapping()) { 
					//if the current slot is filled and an empty column has been found in the row
					if (!boardArray[colNum][rowNum].isMoving()) {
						movingOrbs.push(boardArray[colNum][rowNum]);
						boardArray[colNum][rowNum].setSwapping(true);
					}
					boardArray[colNum][rowNum].setDestination(emptyColNum, rowNum);
					moveOrb(colNum, rowNum, emptyColNum, rowNum); //shift the current orb to the empty column
					emptyColNum--; //shift the empty column to the left since the old one has been filled
				} else {
					boardArray[colNum][rowNum].setDestination(colNum, rowNum);
					//if the current slot is filled and an empty column has not
					//been found in the current row simply move it towards it 
					//index
				}
			} else if (emptyColNum == null) { //an empty column has not yet been found and this column is empty,
				emptyColNum = colNum;		//so store this empty column number 
			}
		}
	}
	
	/**
	* Function to update orb at col, row
	*
	* param type col, row: col and row are ints.
	**/
	function orbUpdate(col, row) {
		boardArray[col][row].update(col, row);
	}
	
	/**
	* Function to spawn attack Fairy
	*
	* param type, isAttuned, colIndex, rowIndex: type is earth, water, fire, air.  isAttuned 
	* 	is false or true. colIndex and rowIndex are ints.
	**/
	function spawnAttackFairy(type, isAttuned, colIndex, rowIndex) {
		SoundJS.play("attackCreated", SoundJS.INTERRUPT_LATE, 0.9);
		
		var mirror;
		var destX;
		if (playerSide == "left") {
			mirror = 1;
			destX = variableContainer.borderDimension + variableContainer.boardDimensions.getFirst()
					+ variableContainer.resourceDimension + 
					2 * variableContainer.shieldZoneDimension + variableContainer.noMansLandDimension;
		} else if (playerSide == "right") {
			mirror = -1;
			destX = variableContainer.borderDimension + variableContainer.boardDimensions.getFirst();
		}
		
		var attackFairyHealth;
		var attackFairyDamage;
		switch (character.getRace().getName()) { 
			case variableContainer.races[0]:
				attackFairyHealth = variableContainer.witchAttackFairyHealth;
				attackFairyDamage = variableContainer.witchAttackFairyDamage;
				break;
			case variableContainer.races[1]:
				attackFairyHealth = variableContainer.steampunkAttackFairyHealth;
				attackFairyDamage = variableContainer.steampunkAttackFairyDamage;
				break;
			case variableContainer.races[2]:
				attackFairyHealth = variableContainer.angelAttackFairyHealth;
				attackFairyDamage = variableContainer.angelAttackFairyDamage;
				break;
		}
		
		var fairyColRow = new Pair(mirror * colIndex + offset.getFirst(), 
								   rowIndex + offset.getSecond());
		attackFairies.push(new Fairy(fairyColRow, type, variableContainer.attackFairyGravity, 
									 attackFairyHealth, attackFairyDamage, true, 
									 new Pair(destX, rowIndex + offset.getSecond()), 
									 playerSide, isAttuned));
	}
	
	/**
	* Function to spawn Shield Fairy
	*
	* param type, isAttuned, colIndex, rowIndex: type is earth, water, fire, air.  isAttuned 
	* 	is false or true. colIndex and rowIndex are ints.
	**/
	function spawnShieldFairy (type, isAttuned, colIndex, rowIndex) {
		SoundJS.play("shieldsCreated", SoundJS.INTERRUPT_LATE, 0.9);
	
		var mirror;
		var destX;
		if (playerSide == "left") {
			mirror = 1;
			destX = variableContainer.boardColumnOffset + variableContainer.boardDimensions.getFirst() + 
					variableContainer.resourceDimension;
		} else if (playerSide == "right") {
			mirror = -1;
			destX = variableContainer.boardColumnOffset + variableContainer.boardDimensions.getFirst() + 
					variableContainer.resourceDimension + variableContainer.shieldZoneDimension + 
					variableContainer.noMansLandDimension;
		}

		var shieldFairyHealth;
		var shieldFairyDamage;
		switch (character.getRace().getName()) { 
			case variableContainer.races[0]:
				shieldFairyHealth = variableContainer.witchShieldFairyHealth;
				shieldFairyDamage = variableContainer.witchShieldFairyDamage;
				break;
			case variableContainer.races[1]:
				shieldFairyHealth = variableContainer.steampunkShieldFairyHealth;
				shieldFairyDamage = variableContainer.steampunkShieldFairyDamage;
				break;
			case variableContainer.races[2]:
				shieldFairyHealth = variableContainer.angelShieldFairyHealth;
				shieldFairyDamage = variableContainer.angelShieldFairyDamage;
				break;
		}
		
		var fairyColRow = new Pair(mirror * colIndex + offset.getFirst(), rowIndex + offset.getSecond());
		shieldFairies.push(new Fairy(fairyColRow, type, variableContainer.shieldFairyGravity, 
									 shieldFairyHealth, shieldFairyDamage, false, 
									 new Pair(destX, rowIndex + offset.getSecond()), 
									 playerSide, isAttuned));									
	}
	
	/**
	* Function to add orbs into attackMatchList to be returned.  It checks
    * left and right for orbs that match the orb's type at colIndex, rowIndex.	
	*
	* param colIndex, rowIndex: The int position of the orb at those coordinates for 2D array.
	**/
	function makeAttackMatchList(colIndex, rowIndex) {
		var attackMatchList = [];
		
		var type = boardArray[colIndex][rowIndex].getType();
		if(!attackActive || type == variableContainer.typeEnum[5]) {
			return attackMatchList;
		}
		
		var currOrb = boardArray[colIndex][rowIndex];
		var i = 1;
		//two is requirement for an attack to be found;
		//check to the right
		while (colIndex + i < variableContainer.boardDimensions.getFirst()) {
			if ((boardArray[colIndex + i][rowIndex] != null) &&
				(boardArray[colIndex + i][rowIndex].getType() == type) &&
				(!boardArray[colIndex + i][rowIndex].isSacrificed()) &&
				!boardArray[colIndex + i][rowIndex].isMoving() &&
				(boardArray[colIndex + i][rowIndex].getMechanicType() == null)) {
				
				currOrb = boardArray[colIndex + i][rowIndex];
				attackMatchList.push(currOrb);
				++i;
			} else { 
				break;
			}
		}
		//check to the left
		currOrb = boardArray[colIndex][rowIndex];
		i = 1;
		while (colIndex - i >= 0) {
			if ((boardArray[colIndex - i][rowIndex] != null) &&
			    (boardArray[colIndex - i][rowIndex].getType() == type) &&
				(!boardArray[colIndex - i][rowIndex].isSacrificed()) &&
				!boardArray[colIndex - i][rowIndex].isMoving() &&
				(boardArray[colIndex - i][rowIndex].getMechanicType() == null)) {
				
				currOrb = boardArray[colIndex - i][rowIndex];
				attackMatchList.push(currOrb);
				++i;
			} else {
				break;
			}	
		}
			//the orb pushed in last is the starting orb.  The reason
			//is to avoid a bug where the orb pushed in is not deleted or handled
			//properly for the game.  So it will become part of attack when the detection
			//is fulfilled correctly.
			//This is valid still, since the type still match with the orb at colIndex
			//, rowIndex.  It is just added in last.
		if(attackMatchList.length >= 2) {
			attackDetected = true;
			numAttackFound++;
		}
		return attackMatchList;	
	}
	
	
	/**
	* Function to add orbs into shieldMatchList to be returned.  It checks
    * above and below for orbs that match the orb's type at colIndex, rowIndex.	
	*
	* param colIndex, rowIndex: The int position of the orb at those coordinates for 2D array.
	**/
	function makeShieldMatchList(colIndex, rowIndex) { 
		var shieldMatchList = [];
		
		var type = boardArray[colIndex][rowIndex].getType();
		if(!shieldActive || type == variableContainer.typeEnum[5]) {
			return shieldMatchList;
		}
		
		var currOrb = boardArray[colIndex][rowIndex];
		var i = 1;
		//check above
		while (rowIndex - i >= 0) {
			if ((boardArray[colIndex][rowIndex - i] != null) &&
			    (boardArray[colIndex][rowIndex - i].getType() == type) &&
				(!boardArray[colIndex][rowIndex - i].isSacrificed()) &&
			    !boardArray[colIndex][rowIndex - i].isMoving() &&
				(boardArray[colIndex][rowIndex - i].getMechanicType() == null)
				) {
			   
			    currOrb = boardArray[colIndex][rowIndex - i];
			    shieldMatchList.push(currOrb);
			    ++i;
			} else {
				break;
			}
		}
		//check below
		currOrb = boardArray[colIndex][rowIndex];
		i = 1;
		while (rowIndex + i < variableContainer.boardDimensions.getSecond()) {
			if ((boardArray[colIndex][rowIndex + i] != null) &&
			    (boardArray[colIndex][rowIndex + i].getType() == type) &&
				(!boardArray[colIndex][rowIndex + i].isSacrificed()) &&
			    !boardArray[colIndex][rowIndex + i].isMoving() &&
				(boardArray[colIndex][rowIndex + i].getMechanicType() == null)) {
				
			    currOrb = boardArray[colIndex][rowIndex + i];
			    shieldMatchList.push(currOrb);
			    ++i;
			} else {
				break;
			}
		}
		
			//the orb pushed in last is the starting orb.  The reason
			//is to avoid a bug where the orb pushed in is not deleted or handled
			//properly for the game.  So it will become part of attack when the detection
			//is fulfilled correctly.
			//This is valid still, since the type still match with the orb at colIndex
			//, rowIndex.  It is just added in last.			
		if(shieldMatchList.length >= 2) {
			shieldDetected = true;
			numShieldFound++;
		}
		return shieldMatchList;	
	}

	
	/**
	* Function to convert orbs to designate their mechanic types as attacks.  
	*
	* param attackOrbList: A list of orbs to have their game mechanic type
	* 						set to attacks.
	**/
	function triggerAttack(attackOrbList) {
		SoundJS.play("attackCreated", SoundJS.INTERRUPT_LATE, 1);	
		var type;
		
		//for loop to convert all orbs that are built into tempAttackOrbList to be converted into
		//attack Fairies.  Whether the orbs should be attack fairies should be verified and control by
		//function that builds the tempAttackOrbList.  The loop also deletes the orb from the board as well.
		var col;
		var row;
		var colRowOrb = null;
		for (var i in attackOrbList) {
			col = attackOrbList[i].getPrevDestinationColRow().getFirst();
			row = attackOrbList[i].getPrevDestinationColRow().getSecond();
			if (boardArray[col][row] != null) {	
				//set type setoff.  null means not set off.
				//if null set to shield.
				//if has attack set to shield as well.
				if(attackOrbList[i].getMechanicType() == null) {
					attackOrbList[i].setToAttack();
				}else if(attackOrbList[i].getMechanicType() == 1) {
					attackOrbList[i].setToAttackandShield();
				}
			}
		}
	}

	/**
	* Function to convert orbs to designate their mechanic types as shields.  
	*
	* param shieldOrbList: A list of orbs to have their game mechanic type
	* 						set to shields.
	**/
	function triggerShield(shieldOrbList) {
		SoundJS.play("shieldsCreated", SoundJS.INTERRUPT_LATE, 1);		
		var col;
		var row;
		
		for (var i in shieldOrbList) {
			col = shieldOrbList[i].getPrevDestinationColRow().getFirst();
			row = shieldOrbList[i].getPrevDestinationColRow().getSecond();
			if (boardArray[col][row] != null) {
				
				if(boardArray[col][row].getMechanicType() == null) {
					boardArray[col][row].setToShield();
				}else if(boardArray[col][row].getMechanicType() == 0) {
					boardArray[col][row].setToAttackandShield();
				}
			}
		}
	}	

	/**
	* Function to find matches at an orb at colIndex, rowIndex.  
	*
	* param colIndex, rowIndex: The starting position of an orb to find a match.
	**/
	function detectionController(colIndex, rowIndex) {
		//tutorial Handler.
		var attackTriggered = false;
		var shieldTriggered = false;
		//store list of orbs that should be attacks or shields
		var possibleAttackMatchOrbs = makeAttackMatchList(colIndex, rowIndex);
		var possibleShieldMatchOrbs = makeShieldMatchList(colIndex, rowIndex);
		//secondary list of attacks and shields orbs to be used later on in the last steps
		//Allow now duplicate orbs in attack and shield list
		var tempHolderAttackOrbs = [];
		var tempHolderShieldOrbs = [];
		
		//length is two so that the last orb will be added in last and will not be duplicated if shield is found later on.
		if (possibleAttackMatchOrbs.length >= 2) { 
			for (var i in possibleAttackMatchOrbs) {
				if (possibleAttackMatchOrbs[i].getMemberMatched()) {
					var secondShieldMatchOrbList = makeShieldMatchList(possibleAttackMatchOrbs[i].getPrevDestinationColRow().getFirst(),
																		possibleAttackMatchOrbs[i].getPrevDestinationColRow().getSecond());
					if (secondShieldMatchOrbList.length >= 2) {
						secondShieldMatchOrbList.push(possibleAttackMatchOrbs[i]);
						tempHolderShieldOrbs = tempHolderShieldOrbs.concat(secondShieldMatchOrbList);
					}
					possibleAttackMatchOrbs[i].setMemberMatched(false);
				}
			}
			//add the last orb into the attack list.
			possibleAttackMatchOrbs.push(boardArray[colIndex][rowIndex]);
		} else {
			//clear list of attack orbs if no match has been found for attack.
			possibleAttackMatchOrbs.splice(0,possibleAttackMatchOrbs.length);
		}

		if (possibleShieldMatchOrbs.length >= 2) {
			for (var i in possibleShieldMatchOrbs) {				
				if (possibleShieldMatchOrbs[i].getMemberMatched()) {
					var secondAttackMatchOrbList = makeAttackMatchList(possibleShieldMatchOrbs[i].getPrevDestinationColRow().getFirst(),
																	    possibleShieldMatchOrbs[i].getPrevDestinationColRow().getSecond());
					if (secondAttackMatchOrbList.length >= 2) {
						secondAttackMatchOrbList.push(possibleShieldMatchOrbs[i]);
						tempHolderAttackOrbs = tempHolderAttackOrbs.concat(secondAttackMatchOrbList);
					}
					possibleShieldMatchOrbs[i].setMemberMatched(false);
				}
			}
			possibleShieldMatchOrbs.push(boardArray[colIndex][rowIndex])
		}else {
			possibleShieldMatchOrbs.splice(0, possibleShieldMatchOrbs.length); 
		}
		//concats the temporary lists that are holding attack orb list and shield orb list
		possibleAttackMatchOrbs = possibleAttackMatchOrbs.concat(tempHolderAttackOrbs);
		possibleShieldMatchOrbs = possibleShieldMatchOrbs.concat(tempHolderShieldOrbs);
		if (possibleAttackMatchOrbs.length >= 3) {
			triggerAttack(possibleAttackMatchOrbs);
			attackTriggered = true;
		}
		if (possibleShieldMatchOrbs.length >= 3) {
			triggerShield(possibleShieldMatchOrbs);	
			shieldTriggered = true;
		}
		//clears the list.
		possibleAttackMatchOrbs.splice(0, possibleAttackMatchOrbs.length);
		possibleShieldMatchOrbs.splice(0, possibleShieldMatchOrbs.length);
		
		//for sacraficial orbs.
		//tells that detection of activation are successful.
		if (attackTriggered || shieldTriggered) {
			character.getSpell().useAttunedCount();
			return true;
		}
		return false;
	}
}