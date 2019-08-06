/**
* ServerCommunicator Class. Handles communication between the client and server.
* 
* function ServerCommunicator(int, string, string, string): 
*		Contains the class structure of ServerCommunicator.
* function setOpponentIHandler(IHandler): Set reference to opponent's IHandler.
* function setPlayerRef(Character, Character): Set references to both 
*		characters.
* function setBoardReferences(Board, Board): Set references to both boards.
* function getGameUpdateIntervalID(): Get the setInterval ID for game update.
* function getEndGameStatus(): 	Return a number representing the state of the 
*		game, where -1 indicates that the game is in progress, 0 indicates 
*		player defeat, 1 indicates player victory, and 2 indicates player 
*		disconnect.
* function setIHandlerSendActions(IHandler): Give a iHandler a reference to the 
*		serverCommunicator's sendClientActions function and set a reference to 
*		the iHandler. 
* function disconnect(): Disconnect the client from the server.
* function cancelSearch(): Tell the server that the client is cancelling the 
*		search for another player.
* function unconfirmMatch(): Tell the server that the client is cancelling a 
*		match-up.
* function findOpponent(string, function, function): Find an opponent to play a 
*		match with.
* function startGame(function): Start a match.
**/

function ServerCommunicator(updateIntervalID, userName, userId, userType) {
	var serverComRef = this;
	var clientID;
	var opponentIHandler;
	var boardOneRef;
	var boardTwoRef;
	var iHandlerRef;
	var playerOne;
	var playerTwo;
	var gameUpdateIntervalID;
	var clientGameID;
	var endGameStatus = -1;
	var synchWait = 0;
	var oppSynchWait = 0;
	//var url = 'http://puzzledefenders-test.herokuapp.com/' //online test
	//var url = 'http://192.168.1.69:8080/'; // for local testing
	var url = 'http://localhost:8080/';
	var socket = io.connect(url, {'force new connection':true});
	
	socket.emit('log in', userName, userId, userType);
	
	socket.on('get socket id', function(id) {
		clientID = id;
	});
	
	socket.on('Update gameContainer data', function(encodedGameContainerData) {
		
		encodedGameContainerData = JSON.parse(encodedGameContainerData);
		
		boardOneRef.decompressBoard(encodedGameContainerData.uB);
		playerOne.setResourcesHealth(encodedGameContainerData.uIn.rL);
		
		if (playerOne.getRace().getName() == "steampunk") {
			playerOne.getRace().handleSynchInfo(encodedGameContainerData.uIn.ss);
		}
		
		playerOne.getRace().setRaceAbilityInfo(encodedGameContainerData.uIn.rI);
		if (encodedGameContainerData.uIn.sft) {
			playerOne.shift_Sbox();
		}
	
		opponentIHandler.handleOpponentActions(encodedGameContainerData.oIn.a);
		
		if (playerTwo.getRace().getName() == "steampunk") {
			playerTwo.getRace().handleSynchInfo(encodedGameContainerData.oIn.ss);
		}
		
		boardTwoRef.decompressBoard(encodedGameContainerData.oB);
		playerTwo.setResourcesHealth(encodedGameContainerData.oIn.rL);
		playerTwo.getRace().setRaceAbilityInfo(encodedGameContainerData.oIn.rI);
		
		//If branches for handle synching for each race.
		if(playerOne.getRace().getName() == "witch") {
			playerOne.getSpell().setAttunedCount(encodedGameContainerData.uIn.spa);
		}
		
		if(playerTwo.getRace().getName() == "witch") {
			playerTwo.getSpell().setAttunedCount(encodedGameContainerData.oIn.spa);
		}
		
		
		
		if(encodedGameContainerData.oIn.sft) {
			playerTwo.shift_Sbox();
		}
	});
	
	socket.on('End game', function(endGameCode) {
		endGameStatus = endGameCode;
	});
	
	socket.on('Synch', function(dataDiff) {
		dataDiff = JSON.parse(dataDiff);
		var tempList;
		if((playerOne.getRace().getName() == "angel") && (synchWait == 0)) {
			var selectionBoxColRow = playerOne.getRace().getSelectionBox().getColRow();
			tempList = dataDiff.split(",");
			
			playerOne.getRace().getSelectionBox().setColRow(selectionBoxColRow.getFirst() + 
								parseInt(tempList[0]), selectionBoxColRow.getSecond() + parseInt(tempList[1]));
			playerOne.getRace().getSelectionBox().setNonPivotOrbY(parseInt(tempList[2]));
			synchWait = variableContainer.synchDelay;
		}else {
			--synchWait;
		}
	});
	
	socket.on('Opp Synch', function(dataDiff) {
		dataDiff = JSON.parse(dataDiff);
		var tempList;
		if((playerTwo.getRace().getName() == "angel") && (oppSynchWait == 0)) {
			var selectionBoxColRow = playerTwo.getRace().getSelectionBox().getColRow();
			tempList = dataDiff.split(",");
			
			playerTwo.getRace().getSelectionBox().setColRow(selectionBoxColRow.getFirst() + 
								parseInt(tempList[0]), selectionBoxColRow.getSecond() + parseInt(tempList[1]));
			playerTwo.getRace().getSelectionBox().setNonPivotOrbY(parseInt(tempList[2]));
			oppSynchWait = variableContainer.synchDelay;
		}else {
			--oppSynchWait;
		}
	});
	
	/**************************************************************************
	Set reference to opponent's IHandler.
	**************************************************************************/
	this.setOpponentIHandler = function(iHandler) {
		opponentIHandler = iHandler;
	}
	
	/**************************************************************************
	Set references to both characters.
	**************************************************************************/
	this.setPlayerRef = function(tPlayerOne, tPlayerTwo) {
		playerOne = tPlayerOne;
		playerTwo = tPlayerTwo;
	}
	
	/**************************************************************************
	Set references to both boards.
	**************************************************************************/
	this.setBoardReferences = function(boardOne, boardTwo) {
		boardOneRef = boardOne;
		boardTwoRef = boardTwo;
	}
	
	/**************************************************************************
	Get the setInterval ID for game update.
	**************************************************************************/
	this.getGameUpdateIntervalID = function() {
		return gameUpdateIntervalID;
	}
	
	/**************************************************************************
	Return a number representing the state of the game, where -1 indicates that
	the game is in progress, 0 indicates player defeat, 1 indicates player
	victory, and 2 indicates player disconnect.
	**************************************************************************/
	this.getEndGameStatus = function() {
		return endGameStatus;
	}
	
	/**************************************************************************
	Give a iHandler a reference to the serverCommunicator's sendClientActions
	function and set a reference to the iHandler. 
	**************************************************************************/
	this.setIHandlerSendActions = function(iHandler) {
		iHandlerRef = iHandler;
		iHandler.setSendActions(sendClientActions);
		
	}
	
	/**************************************************************************
	Disconnect the client from the server.
	**************************************************************************/
	this.disconnect = function() { 
		socket.disconnect();
	}
	
	/**************************************************************************
	Tell the server that the client is cancelling the search for another 
	player.
	**************************************************************************/
	this.cancelSearch = function() {
		socket.emit('search cancelled');
	}
	
	/**************************************************************************
	Tell the server that the client is cancelling a match-up.
	**************************************************************************/
	this.unconfirmMatch = function() {
		socket.emit('client unconfirmed');
	}
	
	/**************************************************************************
	Find an opponent to play a match with.
	**************************************************************************/
	this.findOpponent = function(myRace, initiateConfirmationMenu, 
								 returnOnlineMenu) {
								 
		socket.emit('player found', myRace, clientID, userName, userId, 
					userType);
		
		socket.on('get ready', function(opponentRace, opponentName, gameID) {
			clientGameID = gameID;
			initiateConfirmationMenu("gameConfirmation", opponentRace, 
									 userName.split(" ")[0], opponentName);
			socket.on('return to online menu', function() {
				returnOnlineMenu("online");
			});
		});
	}
	
	/**************************************************************************
	Start a match.
	**************************************************************************/
	this.startGame = function(initializeGame) {
		socket.emit('match confirmed', clientGameID);
		
		socket.on('Start Game', function(clientInitAssets) {
			initializeGame(clientInitAssets, serverComRef);		
			//clearInterval(updateIntervalID);
			//gameUpdateIntervalID = setInterval(update, 
			//								   variableContainer.tickInterval);
		});
	}
	
		
	/**************************************************************************
	Load database data.
	**************************************************************************/
	this.loadData = function() {
		socket.emit('load data', function(){
		});
	}
	
	
	/************************************Private Functions********************/
	
	/**************************************************************************
	Send the server a string of actions the player has performed in one update,
	if any.
	**************************************************************************/
	function sendClientActions() {
		var actionString = iHandlerRef.getActionString();
		if (actionString != "") {
			if(playerOne.getRace().getName() == "angel") {
				
			}
			socket.emit('Update player actions', actionString, playerOne.getRace().getActionRaceInfo());
			iHandlerRef.clearActionString();
		}
	}
	
}