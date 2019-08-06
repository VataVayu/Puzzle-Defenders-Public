

function Goal(goalList) {
	var currentHint = new KeyAnimation();
	var rowList = new Array();
	var achievedGoalList = [];
	var unachievedGoalList = [];
	var activator;
	
	for(var i in goalList) {
		unachievedGoalList[i] = goalList[i];
		if (rowList.indexOf(goalList[i].getRow()) == -1) {
			rowList.push(goalList[i].getRow());
		}
	}
	rowList.sort();
	
	this.getRowList = function() {
		return rowList;
	}
	
	this.draw = function() {
		if (!this.achieved()) {
			for (var i in goalList) {
				goalList[i].draw();
			}
		}
		
		if(currentHint.getActive()) {
			currentHint.draw();
		}
	}
	
	//controls what hints are active
	this.update = function() {
		//Check if any goals have been achieved
		for (var g in unachievedGoalList) {
			if (unachievedGoalList[g].achieved()) {
				achievedGoalList.push(unachievedGoalList.splice(g, 1)[0])
			}
		}
		//Check if any achieved goals have fallen from grace
		for (var a in achievedGoalList) {
			if (!achievedGoalList[a].achieved()) {
				unachievedGoalList.push(achievedGoalList.splice(a, 1)[0])
			}
		}
		
		//Check if any goals remain to be achieved
		if (unachievedGoalList.length == 0) {
			return true;
		//Check if it is the last orb for steampunk activation
		} else if (unachievedGoalList.length == 1 && unachievedGoalList[0].activate != null) {
			activator = unachievedGoalList[0]
			activator.activate();
		//Check if a steampunk activator needs to be deactivated
		} else if (activator != null && activator.deactivate != null) {
			activator.deactivate();
			activator = null;
		}
		
		currentHint.setInactive();
		for (var g in unachievedGoalList) {
			if (unachievedGoalList[g].updateHint(currentHint, rowList, goalList)) {
				currentHint.setActive();
				break;
			}
		}
		return false;
	}
	
	this.achieved = function() {
		for (var i in goalList) {
			if (!goalList[i].achievedData()) {
				return false;
			}
		}
		return true;
	}
	
	
	this.activate = function(gameContainer) {
	}
}

subclass(WitchGoal, Goal);
function WitchGoal(goalList) {
	Goal.call(this, goalList);
	var referenceSheet = new HintSheet(variableContainer.races[0]);
	
	this.parentDraw = this.draw;
	this.draw = function() {
		this.parentDraw();
		referenceSheet.draw();
	}
	
	this.activate = function(gameContainer) {
		var initArray = [];
		var r;
		
		for (var g in goalList) {
			do {
				r = Math.floor(Math.random() * variableContainer.boardDimensions.getSecond());
			} while (this.getRowList().indexOf(r) != -1 || 
				(initArray[r] != null && initArray[r].length > variableContainer.boardDimensions.getFirst()));
			
			if (initArray[r] == null) {
				initArray[r] = [];
			}
			initArray[r].push((goalList[g].isSpell() ? 's' : goalList[g].getType().charAt(0)));
		}
		
		gameContainer.resetPlayerOne(initArray);
	}
}

subclass(SteamGoal, Goal);
function SteamGoal(goalList) {
	Goal.call(this, goalList);
	var referenceSheet = new HintSheet(variableContainer.races[1]);
	
	this.parentDraw = this.draw;
	this.draw = function() {
		this.parentDraw();
		referenceSheet.draw();
	}
	
	this.activate = function(gameContainer) {
		var initArray = [];
		//need to spawn spell orb if identified
		gameContainer.resetPlayerOne(initArray);
	}
}

subclass(AngelGoal, Goal);
function AngelGoal(goalList) {
	Goal.call(this, goalList); 
	var referenceSheet = new HintSheet(variableContainer.races[2]);
	
	this.parentDraw = this.draw;
	this.draw = function() {
		this.parentDraw();
		referenceSheet.draw();
	}
	
	this.activate = function(gameContainer) {
		var initArray = [];
		var r, c;
		
		for (var g in goalList) {
			r = goalList[g].getRow();
			c = goalList[g].getCol();
			
			//check if column is created with crap in it
			if (initArray[r] == null || initArray[r][c] == null) {
				for (var i = 0; i < variableContainer.boardDimensions.getSecond(); ++i) {
					if (initArray[i] == null) {
						initArray[i] = [];
					}
					initArray[i][c] = 'd';
				}
			}
			
			//Place the needed orb in the correct location
			do {
				r = Math.floor(Math.random() * variableContainer.boardDimensions.getSecond());
			} while (this.getRowList().indexOf(r) != -1 || 
				initArray[r][c] != 'd');
			
			initArray[r][c] = (goalList[g].isSpell() ? 's' : goalList[g].getType().charAt(0));
		}
		
		gameContainer.resetPlayerOne(initArray);
	}
}


function SubGoal(col, row, type, board, player, isSpell) {
	this.hintColOffset = 2.5;

	this.isSpell = function() {
		return (isSpell ? true : false);
	}
	
	this.getCol = function() {
		return col;
	}
	
	this.getRow = function() {
		return row;
	}
	
	this.getType = function() {
		return type;
	}

	this.draw = function() {
		if (!this.achieved()) {
			spriteManager.ghost[type].draw(board.getOffset().getFirst() + col, board.getOffset().getSecond() + row);
		}
	}
	
	this.achieved = function() {
		var orb = board.getOrb(col, row);
		return (orb != null && orb.getType() == type && !orb.isMoving() && !orb.isMovingVertically());
	}
	
	this.achievedData = function() {
		var orb = board.getOrb(col, row);
		return (orb != null && orb.getType() == type);
	}
	
	//finds a row to throw unwanted orb back without affecting rows that are subgoals.
	this.findUnusedRow = function(targetRows){
		if (targetRows == null) {
			targetRows = [];
		}
	
		var colNum = null;
		var tempRows = new Array();
		for(x = 0; x < targetRows.length; x++) {
			tempRows.push(targetRows[x]);
		}
		
		for(var i=0;i<variableContainer.boardDimensions.getSecond();i++){
			colNum = null;
			if((tempRows.length == 0) || (tempRows[0] != i)) {
				colNum = board.findColFrontOrb(i);
				if(colNum >= variableContainer.boardDimensions.getFirst()) {
					return i;
				}
			}else if((tempRows.length > 0) && (tempRows[0] == i)){
				while(tempRows[0] == i) {
					tempRows.shift();
				}
				continue;
			}


			if(colNum != null) {
				if(colNum < variableContainer.boardDimensions.getFirst()) {
					if((board.getOrb(colNum, i) != null) 
						&& (type != board.getOrb(colNum, i).getType())) {
						return i;
					}
				}
			}
		}
		//return the last row num;
		return variableContainer.boardDimensions.getSecond() - 1;
	}
	
	function checkIfUnused(row, targetRows) {
		var frontOrbIndex = board.findColFrontOrb(row);
		var frontOrb = board.getOrb(frontOrbIndex, row)
		if (targetRows.indexOf(row) == -1) {
			if (frontOrbIndex >= variableContainer.boardDimensions.getFirst()
				|| (frontOrb != null && frontOrb.getType() != type)) {
				return true;
			}
		}
		return false;
	}
	
	this.updateHint = function() {
	}
}

subclass(WitchSubGoal, SubGoal);
function WitchSubGoal(col, row, type, board, player, isSpell) {
	SubGoal.call(this, col, row, type, board, player, isSpell);
	
	//checks if update of hint is successful,
	//If hint meets the right requirements to update it will return true after update.
	//Else returns false if none of the requirements to update is met
	this.updateHint = function(hintRef, rowList, goalList) {
		var potentialOrb = board.getOrb(col, row);
		var hand = player.getPairedItems();
		if((potentialOrb != null) && (potentialOrb.getType() == type)) {
			return false;
		} else if (hand[1] > 0) {
			if(hand[0] == type.charAt(0) && (potentialOrb == null)) {
				hintRef.setInfo(this.hintColOffset, row, variableContainer.ACTION_BONE);
			}else {
				hintRef.setInfo(this.hintColOffset, this.findUnusedRow(rowList), variableContainer.ACTION_BONE);
			}
			return true;
		} else if (potentialOrb != null) {
			if(potentialOrb.getType() != type) {
				hintRef.setInfo(this.hintColOffset, row, variableContainer.ACTION_AONE);
				return true;
			}
		} else {
			var r = 0;
			while (r < variableContainer.boardDimensions.getSecond()) {
				if (board.findTypeInRow(r, type) != -1) {
					hintRef.setInfo(this.hintColOffset, this.findUnusedAvailableOrb(goalList), variableContainer.ACTION_AONE);
					return true;
				}
				++r;
			}
			return false;
		}
	}
	
	this.findUnusedAvailableOrb = function(goalList) {
		var colNum = null;
		var tempPosList = new Array();
		for(x = 0; x < goalList.length; x++) {
			tempPosList.push(goalList[x]);
		}
		
		for(var i=0;i<variableContainer.boardDimensions.getSecond();i++){
			var tempOrb = null;
			colNum = board.findColFrontOrb(i);
			var tempOrb2 = null;
			
			if(colNum < variableContainer.boardDimensions.getFirst()) {
				if(board.getOrbFromBoardArray(colNum, i) != null) {
					tempOrb2 = board.getOrbFromBoardArray(colNum, i);
				}
			}else {
				continue;
			}
			
			var tempCol = null;
			var tempRow = null;
			var foundInGroup = false;
			for(x in tempPosList) {
				tempCol = tempPosList[x].getCol();
				tempRow = tempPosList[x].getRow();
				tempOrb = board.getOrb(tempCol, tempRow);
				if ((tempOrb != null) && (tempOrb2.getType() == tempOrb.getType())) {
					if((colNum == tempCol) && (i == tempRow)) { 
						foundInGroup = true;
						break;
					}
				}
			}
			if((foundInGroup != true) && (tempOrb2.getType() == type)) {
				return i;
			}
		}
		
		return variableContainer.boardDimensions.getSecond() - 1;
	}
}


subclass(SteamSubGoal, SubGoal);
function SteamSubGoal(col, row, type, board, player, isSpell) {
	SubGoal.call(this, col, row, type, board, player, isSpell);
	var activator = false;
	
	this.activate = function() {
		activator = true;
	}
	
	this.deactivate = function() {
		activator = false;
	}
	
	this.achieved = function() {
		var orb = board.getOrb(col, row);
		return (orb != null && orb.getType() == type && !orb.isMoving() 
				&& (!activator || orb.isSacrificed()));
	}
	
	this.achievedData = function() {
		var orb = board.getOrb(col, row);
		return (orb != null && orb.getType() == type && (!activator || orb.isSacrificed()));
	}
	
	this.updateHint = function(hintRef, rowList, goalList) {
		var potentialOrb = board.getOrb(col, row);
		if (potentialOrb != null && !potentialOrb.isSacrificed()) {
			if (potentialOrb.getType() != type || activator) {
				hintRef.setInfo(this.hintColOffset, row, variableContainer.ACTION_BONE);
				return true;
			} else {
				return false;
			}
		} else if (potentialOrb != null && potentialOrb.isSacrificed() 
				&& potentialOrb.getType() == type && activator) {
			return false;
		} else { //Need to inform how to put an orb on this ghost orb
			if (player.getOrbType() == type) {
				if (activator) {
					hintRef.setInfo(this.hintColOffset, row, variableContainer.ACTION_BONE);
				} else {
					hintRef.setInfo(this.hintColOffset, row, variableContainer.ACTION_AONE);
				}
			} else {
				hintRef.setInfo(this.hintColOffset, this.findUnusedRow(rowList), 
					variableContainer.ACTION_BONE);
			}
			return true;
		}
	}
}

subclass(AngelSubGoal, SubGoal);
function AngelSubGoal(col, row, type, board, player, isSpell, surrounded) {
	SubGoal.call(this, col, row, type, board, player, isSpell);
	
	this.updateHint = function(hintRef, rowList, goalList, remainingCount) {
		var potentialOrb = board.getOrb(col, row);
		if (potentialOrb != null && potentialOrb.getType() == type) {
			return false;
		} else { //Detect nearest needed orb for angel use
			var potentialRow = findNearestOrb(goalList, rowList);
			if(potentialRow != null) {
				hintRef.setInfo(board.getOffset().getFirst() + col, 
					potentialRow + (potentialRow < row ? .5 : -.5), 
					variableContainer.ACTION_AONE);
				return true;
			}
			return false;
		}
	}
	
	//search for orb in columns that has an available row.  From top to bottom.
	//Not perfect.  
	function findNearestOrb(goalList, rowList){
		var closestAbove, closestGoalAbove, closestBelow, closestGoalBelow;
		var potentialOrb;
		
		// check Above
		for (var r = row - 1; r >= 0; --r) {
			potentialOrb = board.getOrb(col, r);
			if (potentialOrb != null && potentialOrb.getType() == type) {
				if (rowList.indexOf(r) != -1) {
					if (closestGoalAbove == null)
						closestGoalAbove = r;
				} else {
					closestAbove = r;
					break;
				}
			}
		}
		
		//check below
		for (var r = row + 1; r < variableContainer.boardDimensions.getSecond(); ++r) {
			potentialOrb = board.getOrb(col, r);
			if (potentialOrb != null && potentialOrb.getType() == type) {
				if (rowList.indexOf(r) != -1) {
					if (closestGoalBelow == null)
						closestGoalBelow = r;
				} else {
					closestBelow = r;
					break;
				}
			}
		}
		
		//Both above goal and below goal exist
		if (closestGoalAbove != null && closestGoalBelow != null) {
			if (closestAbove != null && closestBelow != null) {
				if (Math.abs(row - closestGoalBelow) < Math.abs(row - closestGoalAbove)) {
					return closestGoalBelow;
				} else {
					return closestGoalAbove;
				}
			} else if (closestAbove != null) {
				return closestGoalAbove;
			} else {
				return closestGoalBelow;
			}
		//Above goal exists only
		} else if(closestGoalAbove != null) {
			if (closestBelow != null) {
				return closestBelow;
			} else {
				return closestGoalAbove;
			}
		//Below goal exists only
		} else if(closestGoalBelow != null) {
			if (closestAbove != null) {
				return closestAbove;
			} else {
				return closestGoalBelow;
			}
		//No goals exist
		} else {
			if (closestBelow != null && closestAbove != null) {
				if (Math.abs(row - closestBelow) < Math.abs(row - closestAbove)) {
					return closestBelow;
				} else {
					return closestAbove;
				}
			} else if (closestBelow != null) {
				return closestBelow;
			} else if (closestAbove != null) {
				return closestAbove;
			} else {
				return null;
			}
		}
		
		
		//No closest goal
		if (closestGoal == null) {
			if (closestAbove == null || Math.abs(row - closestBelow) <= Math.abs(row - closestAbove)) {
				return closestBelow;
			} else {
				return closestAbove;
			}
		//Closest goal is above the sub goal
		} else if (closestGoal < row) {
			if (closestBelow != null && !surrounded) {
				return closestBelow;
			} else {
				return closestGoal;
			}
		//Closest goal is below the sub goal
		} else if (closestGoal > row) {
			if (closestAbove != null && !surrounded) {
				return closestAbove;
			} else {
				return closestGoal;
			}
		}
		return null;
	}
}

function KeyAnimation(still) {
	var animateCounter = 0, animateDuration = 5;
	var active = false;
	var col, row, key;
	var centering = -.25

	this.draw = function() {
		if (!still) {
			++animateCounter;
		}
		spriteManager.key.draw(col, row + centering, (animateCounter > animateDuration) ? 0 : 1);
		
		//also draw instructions
		context2D.textAlign = "center";
		context2D.fillStyle = "rgba(0,0,0,0.75)";
		context2D.font = '' + (25 * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + variableContainer.hennyPennyFont;
		context2D.fillText(key, (col+0.48) * variableContainer.cellDimensions.getFirst(), 
					(row + ((animateCounter > animateDuration) ? 0.6 + centering : 0.665 + centering)) * variableContainer.cellDimensions.getSecond());
		
		if (animateCounter > animateDuration * 2) {
			animateCounter = 0;
		}
	}
	
	this.getActive = function() {
		return active;
	}
	
	this.setInactive = function() {
		active = false;
	}
	
	this.setActive = function() {
		active = true;
	}
	
	this.setInfo = function(c, r, k) {
		col = c;
		row = r + variableContainer.boardRowOffset;
		key = String.fromCharCode(k);
		return this;
	}
	
	this.setInfoS = function(c, r, k) {
		col = c;
		row = r;
		key = String.fromCharCode(k);
		return this;
	}
}

function HintSheet(raceName) {
	var col = 21.5, row = 3.25, width = 12, height = 7;
	var raceTitle, actionADescription, actionBDescription;
	var movementLabel = "Movement";
	var movementLabel2 = "(Up & Down)";
	var abilityLabel = "Abilities";
	var backgroundText = new Text(new Pair(col, row), 
			new Pair(width, height))
	var key = new KeyAnimation(true);
	
	//Witch
	if (raceName == variableContainer.races[0]) {
		raceTitle = "Rowan the Witch";
		actionADescription = "Grab Orbs of the same type";
		actionBDescription = "Throw all held Orbs";
	//Steampunk
	} else if (raceName == variableContainer.races[1]) {
		raceTitle = "Sienna the Steampunk";
		actionADescription = "Passively throw next Orb";
		actionBDescription = "Destructively throw next Orb";
	//Angel
	} else if (raceName == variableContainer.races[2]) {
		raceTitle = "Annabelle the Angel";
		actionADescription = "Swap selected orbs";
		actionBDescription = null;
		ablilityLabel = "Ability";
		movementLabel2 = "(Up, Down, Left, Right)";
	}
	
	var titleRow = 1.5, subTitleRow = titleRow + 1, keyRow = subTitleRow + 2;
	
	this.draw = function() {
		backgroundText.draw();
		drawTextCentered(raceTitle, col + width * .5, row + titleRow, 30);
		drawTextCentered(movementLabel, col + width * .25, row + subTitleRow - 0.25, 25);
		drawTextCentered(movementLabel2, col + width * .25, row + subTitleRow + 0.25);
		key.setInfoS(col + width * .25 - .5, row + keyRow - .5, variableContainer.UPONE).draw();
		key.setInfoS(col + width * .25 - .5, row + keyRow + .5, variableContainer.DOWNONE).draw();
		drawTextCentered(abilityLabel, col + width  * .7, row + subTitleRow, 25);
		key.setInfoS(col + width * .5 - .5, row + keyRow - 1, variableContainer.ACTION_AONE).draw();
		drawText(actionADescription, col + width * .5 + 0.65, row + keyRow - .5);
		if (actionBDescription == null) {
			key.setInfoS(col + width * .25 - 1.5, row + keyRow + .5, variableContainer.LEFTONE).draw();
			key.setInfoS(col + width * .25 + .5, row + keyRow + .5, variableContainer.RIGHTONE).draw();
		} else {
			key.setInfoS(col + width * .5 - .5, row + keyRow + .5, variableContainer.ACTION_BONE).draw();
			drawText(actionBDescription, col + width * .5 + 0.65, row + keyRow + 1);
		}
	}
	
	function drawTextCentered(text, col, row, fontSize) {
		if (fontSize == null) {
			fontSize = 16
		}
		context2D.textAlign = "center";
		context2D.fillStyle = "rgba(255,255,255,1)";
		context2D.font = '' + (fontSize * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + variableContainer.hennyPennyFont;
		context2D.fillText(text, col * variableContainer.cellDimensions.getFirst(), 
					row * variableContainer.cellDimensions.getSecond());
	}
	
	function drawText(text, col, row, fontSize) {
		if (fontSize == null) {
			fontSize = 16
		}
		context2D.textAlign = "left";
		context2D.fillStyle = "rgba(255,255,255,1)";
		context2D.font = '' + (fontSize * variableContainer.cellDimensions.getFirst() / 48) + 'px ' + variableContainer.hennyPennyFont;
		context2D.fillText(text, col * variableContainer.cellDimensions.getFirst(), 
					row * variableContainer.cellDimensions.getSecond());
	}
}