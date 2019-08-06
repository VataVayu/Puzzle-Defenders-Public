var Utilities = require('../libraries/Utilities.js');
var Board = require('./Board.js');
var Timer = require('./Timer.js');
var VariableContainer = require('../libraries/VariableContainer.js');
var databaseVariables = require('../libraries/DatabaseVariables.js');
var Orb = require('./Orb.js');

/**
*	 Note: This class will try to determine what orbs are spawned and where.
*	
*	If a spawnScript is loaded in the randomAfterScript will work accordingly:
*	true: will spawn random columns after the script completes
*	false: will stop spawning completely once script completes
*	null: will loop the script indefinately
**/
//Utilities.subclass(BoardDirector, ID.ID);
function BoardDirector(board, gameTimer, randomAfterScript){
	//Make it a subclass of ID
	//ID.ID.call(this, this);
	
	var stopCol = 0;
	var raceSpawnTime = 10;
	var raceMinSpawnTime = 10;
	var scriptNum = 0;
	var spawnSpellOrbCounter = 0;
	var spellSpawnRate = 10;
	//var totalResourceHealth = 0;
	var updateCounter = 0; //for lack of a better name. will rename later
	var spawnTick = 10; //some arbitrary value. will need to be calculated/estimated later
	switch (board.getRaceType()){
		case("witch"):
			stopCol = VariableContainer.boardDimensions.getFirst() - VariableContainer.witchStopColSpawn;
			raceSpawnTime = VariableContainer.witchSpawnTime;
			raceMinSpawnTime = VariableContainer.witchMinSpawnRate;
			spellSpawnRate = VariableContainer.witchSpellSpawnRate;
			//totalResourceHealth = VariableContainer.witchResourceHealth * VariableContainer.boardDimensions.getSecond();
			break;
		case("angel"):
			stopCol = VariableContainer.boardDimensions.getFirst() - VariableContainer.angelStopColSpawn; 
			raceSpawnTime = VariableContainer.angelSpawnTime;
			raceMinSpawnTime = VariableContainer.angelMinSpawnRate;
			spellSpawnRate = VariableContainer.angelSpellSpawnRate;
			//totalResourceHealth = VariableContainer.angelResourceHealth * VariableContainer.boardDimensions.getSecond();
			break;
		case("steampunk"):
			stopCol = VariableContainer.boardDimensions.getFirst() - VariableContainer.steampunkStopColSpawn;
			raceSpawnTime = VariableContainer.steampunkSpawnTime;
			raceMinSpawnTime = VariableContainer.steampunkMinSpawnRate;
			spellSpawnRate = VariableContainer.steampunkSpellSpawnRate;
			//totalResourceHealth = VariableContainer.steampunkResourceHealth * VariableContainer.boardDimensions.getSecond();
			break;
	}
	
	var countDownColumnTimer = new Timer.CountDownTimer(gameTimer, raceSpawnTime);
	var spawnArray = new Array(VariableContainer.boardDimensions.getSecond());
	var enableSpawn = true;
	var spawnScript = null;
	var countDownSpellTimer = new Timer.CountDownTimer(gameTimer, spellSpawnRate);
	
	this.initialize = function(boardSetup, startColumns) {
		spawnScript = boardSetup;
		//This loop makes sure that it only prints out 
		if (spawnScript == null) {
			if (startColumns == null){
			//Don't do anything in this case.
			}else {
				for( var initColumns = 0; initColumns < startColumns; initColumns++){  
					this.orbCheck();
					for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); rowNum++) {
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
			board.clear_highlightedOrbList();
			var currentRow;
			var orbChar;
			var orbHighlight = false;
			
			for (var rowNum = 0; rowNum < spawnScript.length; rowNum++) {
				currentRow = spawnScript[rowNum].split(" ");
				for (var colNum = 0; colNum <= currentRow.length; colNum++) {
					orbChar = null;
					orbHighlight = false;
					orbChar = currentRow[colNum];
					
					if (orbChar == "s") {
						this.spawnSpellOrb();
					} else if(orbChar != null) {
						board.spawnRow(rowNum, orbChar);
					}
				}
			}
		}
		spawnScript = null;
		//console.log("board at start of game: ");
		//board.printBoard();
	}
	
	
	
	this.update = function() {
		// Columns attempt to spawn here if Spawn is enabled
		if (countDownColumnTimer.isExpired() && enableSpawn) {
			// Update the database on the fact that a column should spawn
			databaseVariables[board.getPlayerNum()].columnSpawns++;
			this.getNextSpawnTime();
			++spawnSpellOrbCounter;
			countDownColumnTimer.reset(raceSpawnTime * this.getSpawnTimeModifier());
			var characterPos = board.getCharacter().getRace().getColRow().getSecond() - board.getOffset().getSecond();
			if (spawnScript == null) {
				this.orbCheck();
				if (VariableContainer.spellOrbSpawning && countDownSpellTimer.isExpired()
					/*spawnSpellOrbCounter >= VariableContainer.spellOrbCounter*/) {
					this.spawnSpellOrb();
					countDownSpellTimer.reset(spellSpawnRate);
				}
			}
			for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); rowNum++) {
				var orbChar = null
				if (board.findColFrontOrb(rowNum) == null || stopCol < board.findColFrontOrb(rowNum)) {
					if (spawnScript != null && spawnScript[scriptNum] != null) {
						orbChar = spawnScript[scriptNum][rowNum];
					}
					if (orbChar == null){
						orbChar = spawnArray[rowNum];
					}
					board.spawnRow(rowNum, orbChar);
					//If a character is an Angel then we shift the selectionbox
					if (characterPos == rowNum) {
						if (board.getCharacter().shift_Sbox()) {
							board.setShiftOccurred(true); //this only needs to be done if the shift was successful
						}
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
		for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); ++rowNum) {
			var temp = ["a", "e", "f", "w"];
			//var checkOrb;
			if (!(board.findColFrontOrb(rowNum) == null || stopCol < board.findColFrontOrb(rowNum))) {
				var checkedOrb = board.getOrb(VariableContainer.boardDimensions.getFirst() - 1, rowNum);
				if (checkedOrb != null) { 
					var type = board.getOrb(VariableContainer.boardDimensions.getFirst() - 1, rowNum).getType();
					switch(type) {
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
			}
			
			var checkedOrb = board.getOrb(VariableContainer.boardDimensions.getFirst() - 2, rowNum);
			if (checkedOrb != null) {
				var type = checkedOrb.getType();
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
		for(var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); ++rowNum) {
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
		var tempHealthArray = board.getCharacter().getResourcesArray();
		var tempHealthCount = 0;
		for(var i = 0; i < tempHealthArray.length; ++i) {
			tempHealthCount += tempHealthArray[i];
		}
		*/
		// var temp2 = Math.floor(VariableContainer.spellOrbMax * (1 - board.getCharacter().getHealthRatio()));
		// return temp2;
		return 1;
	}
	
	this.getNextSpawnTime = function() {
		if (raceSpawnTime <= raceMinSpawnTime) {
			raceSpawnTime = raceMinSpawnTime;
		} else {
			raceSpawnTime *= VariableContainer.countdownDecPercent;
		}
	}
	
	this.getSpawnTimeModifier = function() {
		for (var rowNum = 0; rowNum < VariableContainer.boardDimensions.getSecond(); ++rowNum) {
			if (board.getOrb(VariableContainer.boardDimensions.getFirst() - VariableContainer.columnDoubleTime, rowNum) == null) {
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
	
	/*
	// Not sure if this is needed
	this.getJSON = function() {
		return JSON.stringify([{ID: this.getID(), Type: "BoardDirector", stopCol: stopCol, 
				raceSpawnTime: raceSpawnTime, raceMinSpawnTime: raceMinSpawnTime}]);
	}
	*/
	
	/*
	this.draw = function() {
		var timerOffset = 1/3;
		if (board.getPlayerSide() != "left")
			timerOffset = 2/3;
		countDownColumnTimer.drawText(timerTextSize * cellDimensions.getFirst(),
			(gameContainerNumColumns * cellDimensions.getFirst()) * timerOffset, 
			cellDimensions.getSecond() / 2);
	}
	*/
}

module.exports = BoardDirector;