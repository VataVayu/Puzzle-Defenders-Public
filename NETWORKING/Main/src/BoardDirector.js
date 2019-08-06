/**
*	 Note: This class will try to determine what orbs are spawned and where.
*	
*	If a spawnScript is loaded in the randomAfterScript will work accordingly:
*	true: will spawn random columns after the script completes
*	false: will stop spawning completely once script completes
*	null: will loop the script indefinately
**/
//subclass(BoardDirector,ID);
function BoardDirector(board, gameTimer, randomAfterScript){
	//Make it a subclass of ID
	//ID.call(this, this, gameID);
	
	var stopCol = 0;
	var raceSpawnTime = 10;
	var raceMinSpawnTime = 10;
	var scriptNum = 0;
	var spawnSpellOrbCounter = 0;
	var spellSpawnRate = 10;
	//var totalResourceHealth = 0;
	switch (board.getRaceType()){
		case("witch"):
			stopCol = variableContainer.boardDimensions.getFirst() - variableContainer.witchStopColSpawn;
			raceSpawnTime = variableContainer.witchSpawnTime;
			raceMinSpawnTime = variableContainer.witchMinSpawnRate;
			spellSpawnRate = variableContainer.witchSpellSpawnRate;
			//totalResourceHealth = variableContainer.witchResourceHealth * variableContainer.boardDimensions.getSecond();
			break;
		case("angel"):
			stopCol = variableContainer.boardDimensions.getFirst() - variableContainer.angelStopColSpawn; 
			raceSpawnTime = variableContainer.angelSpawnTime;
			raceMinSpawnTime = variableContainer.angelMinSpawnRate;
			spellSpawnRate = variableContainer.angelSpellSpawnRate;
			//totalResourceHealth = variableContainer.angelResourceHealth * variableContainer.boardDimensions.getSecond();
			break;
		case("steampunk"):
			stopCol = variableContainer.boardDimensions.getFirst() - variableContainer.steampunkStopColSpawn;
			raceSpawnTime = variableContainer.steampunkSpawnTime;
			raceMinSpawnTime = variableContainer.steampunkMinSpawnRate;
			spellSpawnRate = variableContainer.steampunkSpellSpawnRate;
			//totalResourceHealth = variableContainer.steampunkResourceHealth * variableContainer.boardDimensions.getSecond();
			break;
	}
	
	var countDownColumnTimer = new CountDownTimer(gameTimer, raceSpawnTime);
	var spawnArray = new Array(variableContainer.boardDimensions.getSecond());
	var enableSpawn = true;
	var spawnScript = null;
	var countDownSpellTimer = new CountDownTimer(gameTimer, spellSpawnRate);
	
	
	//This shouldn't affect anything yet. I was trying to make a function that could be called that would replicate
	//update for when the board is initialized without a spawn script. 
	this.initialize = function(boardSetup, startColumns) {
		spawnScript = boardSetup;
		//This loop makes sure that it only prints out 
		if (spawnScript == null) {
			if (startColumns == null){
			//Don't do anything in this case.
			}else {
				for( var initColumns = 0; initColumns < startColumns; initColumns++){  
					this.orbCheck();
					for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); rowNum++) {
						var orbChar = null
						if(board.findColFrontOrb(rowNum) == null || stopCol < board.findColFrontOrb(rowNum)){
							if (spawnScript != null && spawnScript[scriptNum] != null) {
								orbChar = spawnScript[scriptNum][rowNum];
							}
							if (orbChar == null){
								orbChar = spawnArray[rowNum];
							}
							board.spawnRow(rowNum, orbChar);
						} 
					}
				}
			}
		} else {
			board.clearHighlightedOrbList();
			var currentRow;
			var orbChar;
			var orbHighlight = false;
			
			for (var rowNum = 0; rowNum < spawnScript.length; rowNum++) {
				currentRow = spawnScript[rowNum].split(" ");
				for (var colNum = 0; colNum <= currentRow.length; colNum++) {
					orbChar = null;
					orbHighlight = false;
					orbChar = currentRow[colNum];
					
					if (orbChar != null) {
						board.spawnRow(rowNum, orbChar);
					}
				}
			}
		}
		spawnScript = null;
	}
	
	//This shouldn't affect anything yet. I was trying to make a function that could be called that would replicate
	//update for when the board is initialized without a spawn script. 
	this.newInitialize = function(boardSetup, startColumns) {
		spawnScript = boardSetup;
		//This loop makes sure that it only prints out 
		if (spawnScript == null) {
			if (startColumns == null){
			//Don't do anything in this case.
			}else {
				for( var initColumns = 0; initColumns < startColumns; initColumns++){  
					this.orbCheck();
					for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); rowNum++) {
						var orbChar = null
						if(board.findColFrontOrb(rowNum) == null || stopCol < board.findColFrontOrb(rowNum)){
							if (orbChar == null){
								orbChar = spawnArray[rowNum];
							}
							board.spawnRow(rowNum, orbChar);
						} 
					}
				}
			}
		} else {
			board.clearHighlightedOrbList();
			//var currentRow;
			var orbChar;
			var orbHighlight = false;
			
			for (var rowNum = 0; rowNum < spawnScript.length; rowNum++) {
				//currentRow = spawnScript[rowNum].split(" ");
				if (spawnScript[rowNum] != null) {
					for (var colNum = 0; colNum <= spawnScript[rowNum].length; colNum++) {
						orbChar = null;
						orbHighlight = false;
						orbChar = spawnScript[rowNum][colNum];
						
						if (orbChar != null) {
							board.spawnRow(rowNum, orbChar);
						}
					}
				}
			}
		}
		spawnScript = null;
	}
	
	
	this.update = function() {
		// Columns attempt to spawn here if Spawn is enabled
		if (countDownColumnTimer.isExpired() && enableSpawn) {
			// Update the database on the fact that a column should spawn
			this.getNextSpawnTime();
			++spawnSpellOrbCounter;
			countDownColumnTimer.reset(raceSpawnTime * this.getSpawnTimeModifier());
			var characterPos = board.getCharacter().getRace().getColRow().getSecond() - 
					board.getOffset().getSecond() + variableContainer.drawYOffset;
			if (spawnScript == null) {
				this.orbCheck();
				if (variableContainer.spellOrbSpawning && countDownSpellTimer.isExpired()
					&& variableContainer.isLocal) {
					this.spawnSpellOrb();
					countDownSpellTimer.reset(spellSpawnRate);
				}
			}
			for (var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); rowNum++) {
				var orbChar = null
				if(board.findColFrontOrb(rowNum) == null || stopCol < board.findColFrontOrb(rowNum)){
					if (spawnScript != null && spawnScript[scriptNum] != null) {
						orbChar = spawnScript[scriptNum][rowNum];
					}
					if (orbChar == null){
						orbChar = spawnArray[rowNum];
					}
					board.spawnRow(rowNum, orbChar);
					//If a character is an Angel then we shift the selectionbox
					if(characterPos == rowNum){
						board.getCharacter().shift_Sbox();
					}
				}
			}
			scriptNum++;
			if (spawnScript != null && spawnScript[scriptNum] == null) {
				if (randomAfterScript) {
					spawnScript = null;
				} else if (randomAfterScript == null) {
					scriptNum = 0;
				} else {
					countDownColumnTimer.toggle();
				}
			}
		}
	}
	
	this.orbCheck = function(){
		for(var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); ++rowNum){
			var temp = ["a", "e", "f", "w"];
			if(!(board.getOrb(variableContainer.boardDimensions.getFirst() - 1, rowNum) == null || stopCol < board.findColFrontOrb(rowNum))){
				var type = board.getOrb(variableContainer.boardDimensions.getFirst() - 1, rowNum).getType();
				switch(type){
					case("air"):
						type = "a";
						break;
					case("earth"):
						type = "e";
						break;
					case("fire"):
						type = "f";
						break;
					case("water"):
						type = "w";
						break;
				}
				spawnArray[rowNum] = type;
				continue;
			}
			
			if(board.getOrb(variableContainer.boardDimensions.getFirst() - 2, rowNum) == null) {
			} else {
				var type = board.getOrb(variableContainer.boardDimensions.getFirst() - 2, rowNum).getType();
				switch(type){
					case("air"):
						type = "a";
						break;
					case("earth"):
						type = "e";
						break;
					case("fire"):
						type = "f";
						break;
					case("water"):
						type = "w";
						break;
				}
				switch(type){
					case("a"):
						temp.splice(0, 1);
						break;
					case("e"):
						temp.splice(1, 1);
						break;
					case("f"):
						temp.splice(2, 1);
						break;
					case("w"):
						temp.splice(3, 1);
						break;
				}
			}
			for(var i = 0; i < temp.length; ++i){
				if(rowNum >= 2 && temp[i] == spawnArray[rowNum - 2]){
					temp.splice(i, 1);
					break;
				}
			}
			spawnArray[rowNum] = temp[Math.floor(Math.random() * (temp.length))];
		}
	}
	
	this.spawnSpellOrb = function() {
		var spellType;
		var spellTempArray = new Array();
		var spellString;
		if (board.getSpellOrbCount() >= this.getCurrentMaxSpellOrbs()) {
			spawnSpellOrbCounter = 0;
		} else {		
			spellType = board.getCharacter().getSpell().getType();
			spellString = "s";
		} 
		switch(spellType){
			case("air"):
				spellType = "a";
				break;
			case("earth"):
				spellType = "e";
				break;
			case("fire"):
				spellType = "f";
				break;
			case("water"):
				spellType = "w";
				break;
		}
		for(var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); ++rowNum) {
			if (spawnArray[rowNum] == spellType) {
				spellTempArray.push(rowNum);
			}
		}
		if (spellTempArray.length > 0) {
			spawnArray[spellTempArray[Math.floor(Math.random() * spellTempArray.length)]] = spellString;
			spawnSpellOrbCounter = 0;
		}
	}
	
	this.getCurrentMaxSpellOrbs = function() {
		/*
		var currHealthArray = board.getCharacter().getResourcesArray();
		var currHealthCount = 0;
		for (var i = 0; i < currHealthArray.length; ++i) {
			currHealthCount += currHealthArray[i];
		}
		*/
		// var temp2 = Math.floor(variableContainer.spellOrbMax * (1 - board.getCharacter().getHealthRatio()));
		// return temp2;
		return 1;
	}
	
	this.getNextSpawnTime = function() {
		if (raceSpawnTime <= raceMinSpawnTime) {
			raceSpawnTime = raceMinSpawnTime;
		} else {
			raceSpawnTime *= variableContainer.countdownDecPercent;
		}
	}
	
	this.getSpawnTimeModifier = function() {
		for(var rowNum = 0; rowNum < variableContainer.boardDimensions.getSecond(); ++rowNum) {
			if (board.getOrb(variableContainer.boardDimensions.getFirst() - variableContainer.columnDoubleTime, rowNum) == null) {
				return 0.5;
			}
		}
		return 1;
	}
	
	//This function will enable Orb Spawning
	this.enableSpawn = function(){
		enableSpawn = true;
	}
	
	//This function will disable Orb Spawning
	this.disableSpawn = function(){
		enableSpawn = false;
	}
	
	
	this.draw = function() {
		// var timerOffset = 1/3;
		// if (board.getPlayerSide() != "left")
			// timerOffset = 2/3;
		// countDownColumnTimer.drawText(timerTextSize * cellDimensions.getFirst(),
			// (gameContainerNumColumns * cellDimensions.getFirst()) * timerOffset, 
			// cellDimensions.getSecond() / 2);
	}
}