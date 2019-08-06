

function ClientHandler(thisClient, mirror, gameTimer, gameContainer) {
	
	var player;
	var exhaustedActionString = "";
	
	thisClient.on('Update player actions', function(actionString, data) {
		executeActions(actionString);
		//should we do the diff calculations here?
		var results;
		if(player.getRace().getName() == "angel") {
			var angelData = angelCalcDiff(data);
			thisClient.emit('Synch', JSON.stringify(angelData));
			gameContainer.updateOpp(angelData, player.getPlayerNum());
		}
	});
	
	
	
	
	thisClient.on('Store SC Latency', function(latency){
		console.log("In store SC latency, latency is " + latency);	
		console.log("time is " + gameTimer.getElapsedTime());
		gameContainer.getSCLatency(latency, gameTimer.getElapsedTime());
	});
	
	/******************Privileged Functions*****************/
	
	this.updateFoe = function(data) {
		thisClient.emit('Opp Synch', JSON.stringify(data));
	}
	
	this.setCharacter = function(character) {
		player = character;
	}
	
	this.setBoard = function(board) {
		boardRef = board;
	}
	
	this.getOpponentActionString = function() {
		var tempString = "";
		tempString += exhaustedActionString;
		exhaustedActionString = "";
		return tempString;
	}

	this.sendGameContainerString = function(dataString) {
		thisClient.emit('Update gameContainer data', JSON.stringify(dataString));
	}
	
	this.sendEndGameMessage = function(endGameStatus) {
		thisClient.emit('End game', endGameStatus);
	}
	
	/***************Private functions*************/
	
	/**************
	
	**************/
	function executeActions(actionString) {
	
		var actionCharArray = actionString.split(',');
		switch (actionCharArray[0]) {
			case 'u':
				if (player.getRace().moveVertically(-1)) {
					exhaustedActionString += 'u';
				}
				break;
			case 'd':
				if (player.getRace().moveVertically(1)) {
					exhaustedActionString += 'd';
				}
				break;
			case 'l':
				if (player.getRace().moveHorizontally != null && 
					player.getRace().moveHorizontally(-1 * mirror)) {
					exhaustedActionString += 'l';
				}
				break;
			case 'r':
				if (player.getRace().moveHorizontally != null && 
					player.getRace().moveHorizontally(1 * mirror)) {
					exhaustedActionString += 'r';
				}
				break;
			case 'a':
				if (player.getRace().abilityA()) {
					exhaustedActionString += 'a';
				}
				break;
			case 'b':
				if (player.getRace().abilityB()) {
					exhaustedActionString += 'b';
				}
				break;
		}
		
		if (actionCharArray[1] != null) {
			player.getRace().compareUsedOrbCount(parseInt(actionCharArray[1]));
		}
	}
	
	//calcs different in selection box position
	function angelCalcDiff(data) {
		if(player.getRace().getName() != "angel") {
			return "";
		}
		var tempList = data.split(",");
		var selectionBoxInfo = player.getRace().getSelectionBox();
		var pivotDiffX = selectionBoxInfo.getColRow().getFirst() - parseInt(tempList[0]);
		var pivotDiffY = selectionBoxInfo.getColRow().getSecond() - parseInt(tempList[1]);
		var nonPivotDiffY = selectionBoxInfo.getNonPivotOrbY() - parseInt(tempList[2]);
		
		var tempString = "";
		tempString = tempString + pivotDiffX + "," + pivotDiffY + "," + 
						/*nonPivotDiffY + "," +*/ selectionBoxInfo.getRotation();
		return tempString;
 	}
	
}

module.exports = ClientHandler;