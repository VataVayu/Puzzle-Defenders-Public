var Utilities = require('../libraries/Utilities.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var databaseVariables = require('../libraries/DatabaseVariables.js');
var Orb = require('./Orb.js');
var SpellOrb = require('./SpellOrb.js');
var Fairy = require('./Fairy.js');


/**
 *	Note: Each player will have his own board, which together constitute the
 *		  full battlefield
 *
 *	playerSide: This field says what side of the screen the board is on, and 
 *				thus what direction the orbs fall
 *	offset: A Pair of x and y offsets that contribute to placement of board 
 *			with respect to the screen
 *
 * function Board(playerSide (string "right" or "left"), 
 *			raceType (string (string "Steampunk", "Angel", or "Witch")), 
 *			offset (pair(int, int))): Constructor of Board course object.
 * function setShiftOccurred(flag (boolean)): set the value of shiftOccurred
 * function getShiftOccurred(): return the value of shiftOccurred
 * function getPlayerSide(): return the value of playerSide.  Must be "left" or
 * 			"right".
 * function getPlayerNum(): returns the playerNum value.
 * function getRaceType(): Returns the value raceType that must be steampunk, 
						   witch, or angel.
 * function getCharacter(): Returns character value.
 * function getBoardArray(): creates the array version of BoardArray into 
 * 			passArray.
 * function getOffset(): returns the offset pair.
 * function getMovingOrbs(): Returns the list of movingOrbs.
 * function getAttackFairies(): Returns the list of attackFairies of the board.
 * function getShieldFairies(): Returns the list of shieldFairies of the board.
 * function deleteAttackFairies(): deletes the list of fairies in attackFairies.
 * function deleteShieldFairies(): deletes the list of fairies in shieldFairies.
 * function getOrbPos(colRow (pair(int, int), trackOrb (boolean))): returns the
 * 			colRow pair of orb if it exists. 
 * function orbSwapping(colRow (pair(int,int)), swapping (boolean)): returns
 * 			true or false based orb movement.
 * function decSpellOrbCount(): Decrements spellOrbCount.
 * function incSpellOrbCount(): Increments spellOrbCount.
 * function getSpellOrbCount(): Returns the spellOrbCount. 
 * function printBoard(): Prints out the board of boardArray for debug purpose.
 * function printOrbPositions(): Print out debug purpose
 * function initializeCharacter(characterIn (character object)): Sets the 
 *			character to equal to characterIn.
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
 * function swapOrb(firstColNum (int), firstRowNum (int), secondColNum (int), 
 *			secondRowNum (int)):  Function to swap orbs at firstColNum, 
 *			firstRowNum to secondColNum, secondRowNum.
 * function compressBoard(): Compress the board on server side to be sent to 
 *			client as string.
 **/

function Board(playerSide, raceType, offset) { 

	var boardArray = new Array();
	var passArray = new Array();
	
	for (var i = 0; i < VariableContainer.boardDimensions.getFirst(); i++) {
		boardArray[i] = new Array(VariableContainer.boardDimensions.getSecond());
		passArray[i] = new Array(VariableContainer.boardDimensions.getSecond());
	}
	
	
	// Used to store the visual offset of spawned rows
	var rowVisualOffset = new Array();
	for (var i = 0; i < VariableContainer.boardDimensions.getSecond(); i++) {
		rowVisualOffset[i] = 0;
	}

	// This is an array of orbs that have been shot or moved by the player, 
	// matches apply
	var movingOrbs = []; 
	
	// This is an array of orbs that have been shot or moved by the player
	//	that won't make matches
	var nonMatchMovingOrbs = []; 
	var attackFairies = [];
	var shieldFairies = [];
	var deletedOrbIndices = []; 
	
	var character = null;
	//data if attack match or shield match went off
	var shieldDetected = false;
	var numShieldFound = 0;
	var attackDetected = false;
	var numAttackFound = 0;
	
	// This variable is used to make it easier to write to the database
	// because we need to know what number the player is
	var playerNum = (playerSide == "left" ? 1 : 2);
	// Flags to allow active of shields and/or attacks
	var shieldActive = true;
	var attackActive = true;
	var spellActivated = false;
	//This will keep track of how many Spell Orbs there are on the board
	var spellOrbCount = 0;

	var shiftOccurred = false;
	
	//getspellActivated
	this.getSpellActivated = function() {
		return spellActivated;
	}
	
	//set the flag if shift has occurred
	this.setShiftOccurred = function(flag) {
		shiftOccurred = flag;
	}
	//returns shiftOccurred
	this.getShiftOccurred = function() {
		return shiftOccurred;
	}
	//return playerSide
	this.getPlayerSide = function() {
		return playerSide;
	}
	//return PlayerNum
	this.getPlayerNum = function() {
		return playerNum;
	}
	//return Race type
	this.getRaceType = function() {
		return raceType;
	}
	//return the character of board
	this.getCharacter = function() {
		return character;
	}
	//returns a board in 2D array format
    this.getBoardArray = function() {
		for(var i = 0; i < VariableContainer.boardDimensions.getFirst(); i++){
			for(var j = 0; j < VariableContainer.boardDimensions.getSecond(); j++) {
				if (boardArray[i][j] == null) {
					passArray[i][j] = "";
					continue;
				}
				else if (boardArray[i][j].isSacrificed()) {
					passArray[i][j] = "s"+(((boardArray[i])[j]).getType()).charAt(0);
				}
				else{
					passArray[i][j] = (((boardArray[i])[j]).getType()).charAt(0);
				}
			}
		}
        return passArray;
    }
    //returns the offset in pair object format
	this.getOffset = function() {
		return offset;
	}
	//returns the movingOrbs list.
	this.getMovingOrbs = function() {
		return movingOrbs;
	}
	//returns the attackFairies list.
	this.getAttackFairies = function() {
		return attackFairies;
	}
	//returns the shieldFairies list.
	this.getShieldFairies = function() {
		return shieldFairies;
	}
	//deletes the attackFairies list.	
	this.deleteAttackFairies = function() {
		attackFairies.splice(0, attackFairies.length);
	}
	//deletes the shieldFairies list
	this.deleteShieldFairies = function() {
		shieldFairies.splice(0, shieldFairies.length);
	}

	//This function should return the position of the orb at the array position
	this.getOrbPos = function(colRow, trackOrb) {
		if (boardArray[colRow.getFirst()][colRow.getSecond()] == null || 
			trackOrb == true) {
			return null;
		}
		return boardArray[colRow.getFirst()][colRow.getSecond()].getColRow();
	}
	
	//This function should return a boolean on whether the orb is currently being
	// swapped.
	this.orbSwapping = function(colRow, swapping) {
		if (boardArray[colRow.getFirst()][colRow.getSecond()] == null) {
			return false;
		} else if (boardArray[colRow.getFirst()][colRow.getSecond()].isMoving() 
					&& swapping) {
			return true;
		}
		return false;
	}
	//decrement the spellOrbCount
	this.decSpellOrbCount = function(){
		--spellOrbCount;
	}
	//increment the SpellOrbCount
	this.incSpellOrbCount = function(){
		++spellOrbCount;
	}
	//returns the SpellOrbCount
	this.getSpellOrbCount = function(){
		return spellOrbCount;
	}
	//debug purpose of printingBoard
	this.printBoard = function() {
		console.log("board update");
		for (var j = 0; j < VariableContainer.boardDimensions.getSecond(); j++) {
			var rowString = [];
			for (var i = 0; i < VariableContainer.boardDimensions.getFirst(); i++) {
				if (boardArray[i][j] == null) {
					rowString.push(" ");
				} else {
					switch (boardArray[i][j].getType()) {
						case VariableContainer.typeEnum[0]:
							rowString.push("A");
							break;
						case VariableContainer.typeEnum[1]:
							rowString.push("W");
							break;
						case VariableContainer.typeEnum[2]:
							rowString.push("F");
							break;
						case VariableContainer.typeEnum[3]:
							rowString.push("E");
							break;	
						default:
					}
				}
			}
			console.log(rowString);
		}
	}
	//debug for printing orb positions.
	this.printOrbPositions = function() {
		for (var j = 0; j < VariableContainer.boardDimensions.getSecond(); j++) {
			var rowString = [];
			for (var i = 0; i < VariableContainer.boardDimensions.getFirst(); i++) {
				if (boardArray[i][j] == null) {
					rowString.push(" ");
				} else {
					rowString.push(boardArray[i][j].getColRow().getFirst());
				}
			}
		}
	}
	
	//set character in initialization
	this.initializeCharacter = function(characterIn) {
		character = characterIn;
	}
	//for steampunk and witch to insert orbs into board.
	this.insertQueue = function(orbQueue, playerColRow) {		
		var index = 0;
		var usedCount = 0; //may be a decimal
		
		var colFrontOrb = 
			this.findColFrontOrb(playerColRow.getSecond() - offset.getSecond());
		if (colFrontOrb > 1) {
		if (colFrontOrb < VariableContainer.boardDimensions.getFirst()) {
			usedCount = this.getOrb(colFrontOrb, playerColRow.getSecond() 
									- offset.getSecond()).getColRow().getFirst();
			if (usedCount > 1) { //if the orb is interior to the board
				usedCount = 0;
			} else { //if the orb is exterior to the board or overlapping player
				// Go a little more behind the closest orb. 
				// Artbitrary value from VariableContainer
				usedCount-= VariableContainer.queueSpacingDistance; 
			}
		}
		
		var tempOrb = null;
		while (index < VariableContainer.boardDimensions.getFirst() && 
			   boardArray[index][playerColRow.getSecond() 
			   - VariableContainer.boardRowOffset] == null) {
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
			tempOrb.getColRow().setFirst(-(VariableContainer.boardColumnOffset 
							- VariableContainer.borderDimension - usedCount));
			tempOrb.getColRow().setSecond(playerColRow.getSecond() 
								- VariableContainer.boardRowOffset);
			if (character.getRace().getName() == "witch") {
				tempOrb.setGravity(VariableContainer.witchShootSpeed);
			}
			boardArray[index][playerColRow.getSecond() 
								- VariableContainer.boardRowOffset] = tempOrb;
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
		} else if (tempOrb != null && (character.getRace().getName() == "witch" || tempOrb.isSacrificed())) {
			 //if we take this out, a regular steampunk orb can trigger a match.
			tempOrb.setReadyMatched(true);
			tempOrb.setMemberMatched(true);
			movingOrbs.unshift(tempOrb);
			nonMatchMovingOrbs.pop();
		}
		}
	}
	
	//Returns orb object at the appropriate decision
	this.getOrb = function(colNum, rowNum) {
		if((colNum < 0) || (colNum >= VariableContainer.boardDimensions.getFirst())
			|| (rowNum < 0) || (rowNum >= VariableContainer.boardDimensions.getSecond()))
			return null;
		return boardArray[colNum][rowNum];
	}
	//returns the number of the orb at front of a row
	this.findColFrontOrb = function(rowNum) {
		for (var colNum = 0; colNum < VariableContainer.boardDimensions.getFirst(); ++colNum) {
			if (boardArray[colNum][rowNum] != null) {
				return colNum;
			}
		}
		return colNum;	
	}
	
	//Delete an orb from the board at a given (rowNum, colNum) and return it
	this.spliceOrb = function(colNum, rowNum) {	
		var splicedOrb = boardArray[colNum][rowNum];
		boardArray[colNum][rowNum] = null;
		return splicedOrb;
	}
	
	//spawns the orb and returns the orb it spawns
	this.spawnRow = function(rowNum, type) {
		// Update the database on what row spawned
		databaseVariables[playerNum].rowSpawns[rowNum]++;
		
		// Adds the visual offset as the row has a spawn
		rowVisualOffset[rowNum] = .9;
		if (type == null) {
			for (var colNum = 0; colNum < VariableContainer.boardDimensions.getFirst(); colNum++) {
				if (boardArray[colNum][rowNum] != null) {
					if (colNum <= 0) {
						deleteOrb(colNum, rowNum);
					} else {
						if ((boardArray[colNum][rowNum].isSwapping() && 
								boardArray[colNum][rowNum].isMovingVertically()) || 
								!boardArray[colNum][rowNum].isMoving()) {
							boardArray[colNum][rowNum].setColPosition(colNum - 1);
						}else if (boardArray[colNum][rowNum].isSacrificed() || 
							boardArray[colNum][rowNum].getMemberMatched()) {
							boardArray[colNum][rowNum].setDestination(colNum - 1, rowNum);
						}
						moveOrb(colNum, rowNum, colNum - 1, rowNum);
					}
				}
			}
			spawnOrb(VariableContainer.boardDimensions.getFirst() - 1, rowNum, "random");
		} else {
			//This will check to see which type of orb should be spawned
			//Also checks for highlighted orbs
			var orbType = null;
			if (type == "a") {
				orbType = VariableContainer.typeEnum[0];
			} else if (type == "A" ) {
				orbType = VariableContainer.typeEnum[0];
				//orbHighlight = true;
			} else if (type == "w" ) {
				orbType = VariableContainer.typeEnum[1];
			} else if (type == "W" ) {
				orbType = VariableContainer.typeEnum[1];
				//orbHighlight = true;
			} else if (type == "f" ) {
				orbType = VariableContainer.typeEnum[2];
			} else if (type == "F" ) {
				orbType = VariableContainer.typeEnum[2];
				//orbHighlight = true;
			} else if (type == "e" ) {
				orbType = VariableContainer.typeEnum[3];
			} else if (type == "E" ) {
				orbType = VariableContainer.typeEnum[3];
				//orbHighlight = true;
			} else if (type == "r" ) {
				orbType = VariableContainer.typeEnum[4];
			}
			
			if (orbType != null) {
				for (var colNum = 0; colNum < VariableContainer.boardDimensions.getFirst(); colNum++) {
					if (boardArray[colNum][rowNum] != null) {
						if (colNum <= 0) {
							deleteOrb(colNum, rowNum);
						} else {
							if ((boardArray[colNum][rowNum].isSwapping() && 
									boardArray[colNum][rowNum].isMovingVertically()) || 
									!boardArray[colNum][rowNum].isMoving()) {
								boardArray[colNum][rowNum].setColPosition(colNum - 1);
							} else if (boardArray[colNum][rowNum].isSacrificed() || boardArray[colNum][rowNum].getMemberMatched()) {
								boardArray[colNum][rowNum].setDestination(colNum - 1, rowNum);
							}
							moveOrb(colNum, rowNum, colNum - 1, rowNum);
						}
					}	
				}
				spawnOrb(VariableContainer.boardDimensions.getFirst() - 1, rowNum, orbType);
			} else if (type == "s") { // Spell orb
				for (var colNum = 0; colNum < VariableContainer.boardDimensions.getFirst(); colNum++) {
					if (boardArray[colNum][rowNum] != null) {
						if (colNum <= 0) {
							deleteOrb(colNum, rowNum);
						} else {
							if (boardArray[colNum][rowNum].isSwapping() || 
								!boardArray[colNum][rowNum].isMoving()) {
								boardArray[colNum][rowNum].setColPosition(colNum - 1);
							} else if (boardArray[colNum][rowNum].isSacrificed() || boardArray[colNum][rowNum].getMemberMatched()) {
								boardArray[colNum][rowNum].setDestination(colNum - 1, rowNum);
							}
							moveOrb(colNum, rowNum, colNum - 1, rowNum);
						}
					}	
				}
				spawnOrb(VariableContainer.boardDimensions.getFirst() - 1, rowNum, type);
				++spellOrbCount;
			}
		}
		return boardArray[VariableContainer.boardDimensions.getFirst() - 1][rowNum];
	}	
	
	//This function will update the board, to deal with any orbs that need to move their position in the data structure.
	this.update = function() {
		//reset the attack and shield
		//found when a new update occurs
		shieldDetected = false;
		attackDetected = false;
		spellActivated = false;
		
		
		//var orbHolder = null;
		for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); rowNum++) {
			updateRow(rowNum);
		}
		
		for (var i = 0; i < nonMatchMovingOrbs.length; ++i) {
			if (!nonMatchMovingOrbs[i].isMoving() && !nonMatchMovingOrbs[i].isMovingVertically()) {
				nonMatchMovingOrbs[i].setGravity(VariableContainer.boardGravity);
				if (nonMatchMovingOrbs[i].isSwapping()) 
					nonMatchMovingOrbs[i].setSwapping(false);
				nonMatchMovingOrbs.splice(i, 1);
				--i;
			}
		}
	
		// Updates the visual offsets
		for (var i in rowVisualOffset) {
			if (rowVisualOffset[i] > 0) {
				rowVisualOffset[i] -= VariableContainer.visualShift;
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
			if(movingOrbs[i] != null){
				colIndex = movingOrbs[i].getPrevDestinationColRow().getFirst();
				rowIndex = movingOrbs[i].getPrevDestinationColRow().getSecond();
			}
			if ((movingOrbs[i] == null) || ((movingOrbs[i] != null) && 
				(boardArray[colIndex][rowIndex] == null))) {
					movingOrbs.splice(i, 1);
					--movingOrbsLength;
					--i;
			} else {
				colIndex = movingOrbs[i].getPrevDestinationColRow().getFirst();
				rowIndex = movingOrbs[i].getPrevDestinationColRow().getSecond();
				neighborColIndex = colIndex + 1;
				if ((boardArray[colIndex][rowIndex] != null) && (boardArray[colIndex][rowIndex] != undefined)) {
					if ((!boardArray[colIndex][rowIndex].isMoving() 
						&& !boardArray[colIndex][rowIndex].isMovingVertically())
						&& (boardArray[colIndex][rowIndex].getMechanicType() == null)) {					
						
						matchTriggered = detectionController(colIndex, rowIndex);
						
						//if not match delete orb if sacrafice.  If not sacrafice,
						//then set the readyMatched, memberMatched to false.
						//setGravity to boardGravity.
						if(!matchTriggered){
							if (movingOrbs[i].isSacrificed()) {
								if (neighborColIndex < VariableContainer.boardDimensions.getFirst() &&
									boardArray[neighborColIndex][rowIndex] != null &&
									!boardArray[neighborColIndex][rowIndex].isSacrificed()) {
										deleteOrb(neighborColIndex, rowIndex);
								}
								deleteOrb(colIndex, rowIndex);
							} else {
								movingOrbs[i].setReadyMatched(false);
								movingOrbs[i].setMemberMatched(false);
								movingOrbs[i].setGravity(VariableContainer.boardGravity);
							}
						}
						
						if (movingOrbs[i].isSwapping()) {
							movingOrbs[i].setSwapping(false);
						}
						movingOrbs.splice(i, 1);
						--movingOrbsLength;
						--i;						
					}
				} 
			}
		}
		// Server checks for orbs that are not in a match and are not moving
		// to be deleted at buffer zone.
		for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); ++rowNum) {
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
				tempOrbOne.setSwapping(true);
				tempOrbOne.setGravity(VariableContainer.angelSwapDelay);
				tempOrbOne.setMemberMatched(true);
				if (tempOrbTwo == null && secondColNum < VariableContainer.boardDimensions.getFirst()-1 &&
						boardArray[secondColNum + 1][secondRowNum] == null) {
					nonMatchMovingOrbs.push(tempOrbOne);
				} else {
					movingOrbs.push(tempOrbOne);
				}
			}
			
			if (tempOrbTwo != null) {
				tempOrbTwo.setSwapping(true);
				tempOrbTwo.setGravity(VariableContainer.angelSwapDelay);
				tempOrbTwo.setMemberMatched(true);
				if (tempOrbOne == null && firstColNum < VariableContainer.boardDimensions.getFirst()-1 &&
						boardArray[firstColNum + 1][firstRowNum] == null) {
					nonMatchMovingOrbs.push(tempOrbTwo);
				} else {
					movingOrbs.push(tempOrbTwo);
				}
			}
		}
	}
	//encodes the board to be sent to client.
	this.compressBoard = function() {
		var stringBoard = "";
		for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); rowNum++) {
			stringBoard = stringBoard + Math.floor(rowVisualOffset[rowNum] * 10);
			for (var colNum = VariableContainer.boardDimensions.getFirst() - 1; colNum >= 0; colNum--) {
				if (boardArray[colNum][rowNum] != null) {
					if ((boardArray[colNum][rowNum].getMechanicType() != null) 
						&& (boardArray[colNum][rowNum].getFairySpawned() < 2) && 
						(boardArray[colNum][rowNum].getCountDown() <= 1)) {
						stringBoard = stringBoard + encodeMatches(colNum, rowNum);
					} else if (boardArray[colNum][rowNum].getSpell != null) {
						stringBoard = stringBoard + "s";
					} else {
						var type = boardArray[colNum][rowNum].getType();
						stringBoard = stringBoard + type.slice(0,1);
					}
				} 
				if (colNum == 0) {
					if (rowNum != VariableContainer.boardDimensions.getSecond() - 1)
						stringBoard = stringBoard + "N";
				}
			}
		}
		return stringBoard;
	}
	
	//--------------------------------Private Functions--------------------------------
	/**
	* Function to encode matches to be sent to client and set the game mechanic
	*
	* param type colNum, rowNum: colNum, rowNum are int position.
	**/
	function encodeMatches(colNum, rowNum) {
		var mechanicType = boardArray[colNum][rowNum].getMechanicType();
		var orbType = boardArray[colNum][rowNum].getType().slice(0,1);
		boardArray[colNum][rowNum].setFairySpawned();
		var isAttuned = false;
		switch (character.getRace().getName()) { 
			case "angel":
				if (orbType == VariableContainer.typeEnum[0].slice(0,1)) { //air
					isAttuned = true;
				} else {
					isAttuned = false;
				}
				break;
			case "steampunk":
				if (orbType == VariableContainer.typeEnum[2].slice(0,1)) { //fire
					isAttuned = true;
				} else {
					isAttuned = false;
				}
				break;
			case "witch":
				if (character.getSpell().attunedCount() > 0) {
					isAttuned = true;
				} else {
					if (orbType == VariableContainer.typeEnum[3].slice(0,1)) { //earth
						isAttuned = true;
					} else {
						isAttuned = false;
					}
				}
				break;
			default:
		}
		if (boardArray[colNum][rowNum].getSpell != null) {
			if (mechanicType == 0) {
				if (!isAttuned) {
					return "t";
				} else {
					return "T";
				}
			} else if (mechanicType == 1) {
				if (!isAttuned) {
					return "u";
				} else {
					return "U";
				}
			} else if (mechanicType == 2) {
				if (!isAttuned) {
					return "v";
				} else {
					return "V";
				}
			}
		} else if (orbType == "a") {
			if (mechanicType == 0) {
				if (!isAttuned) {
					return "b";
				} else {
					return "B";
				}
			} else if (mechanicType == 1) {
				if (!isAttuned) {
					return "c";
				} else {
					return "C";
				}
			} else if (mechanicType == 2) {
				if (!isAttuned) {
					return "d";
				} else {
					return "D";
				}
			}
		} else if (orbType == "w") {
			if (mechanicType == 0) {
				if (!isAttuned) {
					return "x";
				} else {
					return "X";
				}
			} else if (mechanicType == 1) {
				if (!isAttuned) {
					return "y";
				} else {
					return "Y";
				}
			} else if (mechanicType == 2) {
				if (!isAttuned) {
					return "z";
				} else {
					return "Z";
				}
			}
		} else if (orbType == "f") {
			if (mechanicType == 0) {
				if (!isAttuned) {
					return "g";
				} else {
					return "G";
				}
			} else if (mechanicType == 1) {
				if (!isAttuned) {
					return "h";
				} else {
					return "H";
				}
			} else if (mechanicType == 2) {
				if (!isAttuned) {
					return "i";
				} else {
					return "I";
				}
			}
		} else if (orbType == "e") {
			if (mechanicType == 0) {
				if (!isAttuned) {
					return "j";
				} else {
					return "J";
				}
			} else if (mechanicType == 1) {
				if (!isAttuned) {
					return "k";
				} else {
					return "K";
				}
			} else if (mechanicType == 2) {
				if (!isAttuned) {
					return "l";
				} else {
					return "L";
				}
			}
		}
	}
	
	/**
	* Function to spawn orbs at colNum, rowNum, with type
	*
	* param type colNum, rowNum, type, orbHighlight: colNum, rowNum are int 
	* 	position, type is water, air, fire, earth.  OrbHighLight is a list of
	* 	orbs that are to be highlighted.
	**/
	function spawnOrb(colNum, rowNum, type) {
		if (boardArray[colNum][rowNum] == null) {
			// To Spawn spell orbs, logic must go here somehow
			// The spells for the player are in character
			var tmpOrb;
			if (type == "s") { 
				tmpOrb = new SpellOrb(character.getSpell(), 
									new Utilities.Pair(colNum, rowNum), 
									character.getSpell().getType(), 
									 VariableContainer.boardGravity);
				boardArray[colNum][rowNum] = tmpOrb;
			} else {
				tmpOrb = new Orb(new Utilities.Pair(colNum, rowNum), type, VariableContainer.boardGravity);
				boardArray[colNum][rowNum] = tmpOrb;
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
		if (boardArray[colNum][rowNum].getSpell != null && (spellOrbCount > 0))
			--spellOrbCount;
		// This removes the object from the IDManager's list of object/id connections
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
	* Function to spawn attack Fairy
	*
	* param type, isAttuned, colIndex, rowIndex: type is earth, water, fire, air.  isAttuned 
	* 	is false or true. colIndex and rowIndex are ints.
	**/
	var spawnAttackFairy = function(type, isAttuned, colIndex, rowIndex) {
		var mirror;
		var destX;
		if (playerSide == "left") {
			mirror = 1;
			destX = VariableContainer.borderDimension + 
				VariableContainer.boardDimensions.getFirst() + 
				VariableContainer.resourceDimension + 
				2 * VariableContainer.shieldZoneDimension + VariableContainer.noMansLandDimension;
		} else if (playerSide == "right") {
			mirror = -1;
			destX = VariableContainer.borderDimension + VariableContainer.boardDimensions.getFirst();
		}
		
		var attackFairyHealth;
		var attackFairyDamage;
		switch (character.getRace().getName()) { 
			case VariableContainer.races[0]:
				attackFairyHealth = VariableContainer.witchAttackFairyHealth;
				attackFairyDamage = VariableContainer.witchAttackFairyDamage;
				break;
			case VariableContainer.races[1]:
				attackFairyHealth = VariableContainer.steampunkAttackFairyHealth;
				attackFairyDamage = VariableContainer.steampunkAttackFairyDamage;
				break;
			case VariableContainer.races[2]:
				attackFairyHealth = VariableContainer.angelAttackFairyHealth;
				attackFairyDamage = VariableContainer.angelAttackFairyDamage;
				break;
		}
		
		var fairyColRow = new Utilities.Pair(mirror * colIndex + offset.getFirst(), 
								   rowIndex + offset.getSecond());
		attackFairies.push(new Fairy(fairyColRow, type, VariableContainer.attackFairyGravity, 
									 attackFairyHealth, attackFairyDamage, true, 
									 new Utilities.Pair(destX, rowIndex + offset.getSecond()), 
									 playerSide, isAttuned));
	}
	
	/**
	* Function to spawn Shield Fairy
	* type (earth, water, fire, air)  
	* isAttuned (boolean), colIndex (int), rowIndex (int)
	**/
	var spawnShieldFairy = function(type, isAttuned, colIndex, rowIndex) {
	
		var mirror;
		var destX;
		if (playerSide == "left") {
			mirror = 1;
			destX = VariableContainer.boardColumnOffset + VariableContainer.boardDimensions.getFirst() + 
					VariableContainer.resourceDimension;
		} else if (playerSide == "right") {
			mirror = -1;
			destX = VariableContainer.boardColumnOffset + VariableContainer.boardDimensions.getFirst() + 
					VariableContainer.resourceDimension + VariableContainer.shieldZoneDimension + 
					VariableContainer.noMansLandDimension;
		}

		var shieldFairyHealth;
		var shieldFairyDamage;
		switch (character.getRace().getName()) { 
			case VariableContainer.races[0]: // Witch fairies
				shieldFairyHealth = VariableContainer.witchShieldFairyHealth;
				shieldFairyDamage = VariableContainer.witchShieldFairyDamage;
				break;
			case VariableContainer.races[1]: // Steampunk fairies
				shieldFairyHealth = VariableContainer.steampunkShieldFairyHealth;
				shieldFairyDamage = VariableContainer.steampunkShieldFairyDamage;
				break;
			case VariableContainer.races[2]: // Angel fairies
				shieldFairyHealth = VariableContainer.angelShieldFairyHealth;
				shieldFairyDamage = VariableContainer.angelShieldFairyDamage;
				break;
		}
		
		var fairyColRow = new Utilities.Pair(mirror * colIndex + offset.getFirst(), rowIndex + offset.getSecond());
		shieldFairies.push(new Fairy(fairyColRow, type, VariableContainer.shieldFairyGravity, 
									 shieldFairyHealth, shieldFairyDamage, false, 
									 new Utilities.Pair(destX, rowIndex + offset.getSecond()), 
									 playerSide, isAttuned));									
	}
	
	/**
	* Function updates a row and shifts its orbs if an open space is found
	*
	* param type, rowNum: integer row position.
	**/
	function updateRow(rowNum) {
		var emptyColNum = null;
		for (var colNum = VariableContainer.boardDimensions.getFirst() - 1; colNum >= 0; colNum--) {
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
				} else if (boardArray[colNum][rowNum].getMechanicType() != null) {
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
								if (tempType == VariableContainer.typeEnum[0]) { //air
									isAttuned = true;
								} else {
									isAttuned = false;
								}
								break;
							case "steampunk":
								if (tempType == VariableContainer.typeEnum[2]) { //fire
									isAttuned = true;
								} else {
									isAttuned = false;
								}
								break;
							case "witch":
								if (character.getSpell().attunedCount() > 0) {
									isAttuned = true;
								} else {
									if (tempType == VariableContainer.typeEnum[3]) { //earth
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
					orbUpdate(colNum, rowNum);
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
	* Function to add orbs into attackMatchList to be returned.  It checks
    * left and right for orbs that match the orb's type at colIndex, rowIndex.	
	*
	* param colIndex, rowIndex: The int position of the orb at those coordinates for 2D array.
	**/
	function makeAttackMatchList(colIndex, rowIndex) {
		var attackMatchList = [];
		
		if(!attackActive)
			return attackMatchList;
		
		var type = boardArray[colIndex][rowIndex].getType();
		
		var currOrb = boardArray[colIndex][rowIndex];
		var i = 1;
		//two is requirement for an attack to be found;
		//check to the right
		while (colIndex + i < VariableContainer.boardDimensions.getFirst()) {
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
		
		if(!shieldActive)
			return shieldMatchList;
		
		var type = boardArray[colIndex][rowIndex].getType();
		
		var currOrb = boardArray[colIndex][rowIndex];
		var i = 1;
		//check above
		while (rowIndex - i >= 0) {
			if ((boardArray[colIndex][rowIndex - i] != null) &&
			    (boardArray[colIndex][rowIndex - i].getType() == type) &&
				(!boardArray[colIndex][rowIndex - i].isSacrificed()) &&
			    !boardArray[colIndex][rowIndex - i].isMoving() &&
				(boardArray[colIndex][rowIndex - i].getMechanicType() == null)) {
			   
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
		while (rowIndex + i < VariableContainer.boardDimensions.getSecond()) {
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
		
		// Add to database how many attacks were made
		databaseVariables[playerNum].attacks[attackOrbList.length]++;		
		//for loop to convert all orbs that are built into tempAttackOrbList to be converted into
		//attack Fairies.  Whether the orbs should be attack fairies should be verified and control by
		//function that builds the tempAttackOrbList.  The loop also deletes the orb from the board as well.
		var col;
		var row;
		
		for (var i in attackOrbList) {
			col = attackOrbList[i].getPrevDestinationColRow().getFirst();
			row = attackOrbList[i].getPrevDestinationColRow().getSecond();			

			if (boardArray[col][row] != null) {
				
				if(attackOrbList[i].getMechanicType() == null) {
					attackOrbList[i].setToAttack();
				}else if(attackOrbList[i].getMechanicType() == 1) {
					attackOrbList[i].setToAttackandShield();
				} else {
					//reset the countdown timer for vibration
					boardArray[col][row].setToAttackandShield();
				}
			}
		}
		attackFairies.splice(0, attackFairies.length);
	}
	
	/**
	* Function to convert orbs to designate their mechanic types as shields.  
	*
	* param shieldOrbList: A list of orbs to have their game mechanic type
	* 						set to shields.
	**/
	function triggerShield(shieldOrbList) {
	
		// Add to database how many shields were made
		databaseVariables[playerNum].shields[shieldOrbList.length]++;
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
				}else {
					//reset the countdown timer for vibration
					boardArray[col][row].setToAttackandShield();
				}
			}
		}
		shieldFairies.splice(0, shieldFairies.length);
	}

	/**
	* Function to find matches at an orb at colIndex, rowIndex.  
	*
	* param colIndex, rowIndex: The starting position of an orb to find a match.
	**/
	function detectionController(colIndex, rowIndex) {
		var attackTriggered = false;
		var shieldTriggered = false;
		
		var possibleAttackMatchOrbs = makeAttackMatchList(colIndex, rowIndex);
		var possibleShieldMatchOrbs = makeShieldMatchList(colIndex, rowIndex);
		
		var tempHolderAttackOrbs = [];
		var tempHolderShieldOrbs = [];
		
		if (possibleAttackMatchOrbs.length >= 2) { //I think != null is already checked before detectionController is called
			for (var i in possibleAttackMatchOrbs) {
				if (possibleAttackMatchOrbs[i].getMemberMatched()) {
					
					var secondShieldMatchOrbList = makeShieldMatchList(possibleAttackMatchOrbs[i].getPrevDestinationColRow().getFirst(),
																			possibleAttackMatchOrbs[i].getPrevDestinationColRow().getSecond());
					if (secondShieldMatchOrbList.length >= 2) {
						secondShieldMatchOrbList.push(possibleAttackMatchOrbs[i]);
						tempHolderShieldOrbs = tempHolderShieldOrbs.concat(secondShieldMatchOrbList);
						//push in sets of shield matches into shieldSetMatch.
					}
					possibleAttackMatchOrbs[i].setMemberMatched(false);
				}
			}		
			//adds the last orb into the attack list.
			possibleAttackMatchOrbs.push(boardArray[colIndex][rowIndex]);
		} else {
			//splice off possibleAttackMatchOrbs to not interfere with matches.
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
						//push in sets of attack mataches into attackSetMatch
					}
					possibleShieldMatchOrbs[i].setMemberMatched(false);
				}
				//pushes the orb that set of attacks into shield orb list, since it is a part of shield
			}		
			possibleShieldMatchOrbs.push(boardArray[colIndex][rowIndex]);
		}else {
			possibleShieldMatchOrbs.splice(0, possibleShieldMatchOrbs.length); 
		}		
		
			
		possibleAttackMatchOrbs = possibleAttackMatchOrbs.concat(tempHolderAttackOrbs);
		possibleShieldMatchOrbs = possibleShieldMatchOrbs.concat(tempHolderShieldOrbs);
		if (possibleAttackMatchOrbs.length >= 3) {
			//encode the sets of attacks into string
			triggerAttack(possibleAttackMatchOrbs);
			attackTriggered = true;
		}
		if (possibleShieldMatchOrbs.length >= 3) {
			//encode sets of shields into string.
			triggerShield(possibleShieldMatchOrbs);	
			shieldTriggered = true;
		}
		
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

module.exports = Board;