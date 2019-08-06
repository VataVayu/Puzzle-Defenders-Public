var GameContainer = require('./Main_Server/src/GameContainer.js');
var databaseCommunicator = require('./Main_Server/src/DatabaseCommunicator.js');
var http = require('http');
var url = require("url");
var express = require('express');
var app = express.createServer();
var io = require("socket.io").listen(app);
var port = process.env.PORT ||  8080;
app.listen(port);
app.use(express.static(__dirname + '/Main')); //static files for client are stored here


//Routing to get to the game's index
app.get('/', function (req, res) {
	var path = url.parse(req.url).pathname;
	var	userAgent = req.headers['user-agent'];

	if(userAgent.indexOf("Chrome") != -1) {
		console.log("You are on Chrome!");
		res.sendfile(__dirname + '/Main/index.htm');
	}
	else {
		console.log("You are not on Chrome.");
		res.redirect('http://www.puzzledefenders.com/Redirect.html');
	}
});

//Routing to get to the game's database
app.get('/database', function (req, res) {
	var path = url.parse(req.url).pathname;
	res.sendfile(__dirname + '/Main/DataQuery.htm'); 
});

var numClients = 0;
//var clients = [];
var gameContainers = [];
var waitingClients = [];
var readyClients = [];
var timeoutIDList = [];
var clientPairCount = 0;
var clientIDGameIDMap = [];
var listClientInfoPairs = [];


var gameLoop = function(gameID) {
	timeoutIDList[gameID] = setTimeout(function() {gameLoop(gameID)}, 65);
	gameContainers[gameID].update();
}

io.set('log level', 1);

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function(socket) {
	numClients++;
	console.log("Someone has connected! We have " + numClients + 
				" people connected");
	socket.send("Someone has connected!");
	socket.emit('get socket id', socket.id);
	
	//clients[socket.id] = socket; //if socket.io changes, add this back in
	
	socket.send(socket.id);
	console.log("Added in " + socket.id);
	
	socket.on('log in', function(name, id, type){
		databaseCommunicator.createPlayer(name, id, type);
	});
	
	socket.on('load', function(id){
		id = id + '';
		databaseCommunicator.loadData(id);
		setTimeout(function(){
			var result = databaseCommunicator.getResult(id);
			console.log("result is " + result);
			console.log(result);
			socket.emit('stat', result);
		}, 2000);
		//console.log(databaseCommunicator.getResult(id));
		//console.log("result is " + result);
	});

	socket.on('disconnect', function() {
		numClients--; 
		if (clientIDGameIDMap[socket.id] == null) {
			removeWaitingClient(socket.id);
		} else {
			var clientPairID = clientIDGameIDMap[socket.id];
			var tempClientInfo = listClientInfoPairs[clientPairID].shift();
			if (tempClientInfo.id == socket.id) {
				tempClientInfo = listClientInfoPairs[clientPairID].shift();
			}
	
			if (gameContainers[clientPairID] != null) {

				databaseCommunicator.endGameUpdate(gameContainers[clientPairID].getDatabaseVariables(), gameContainers[clientPairID].getCurrentTime());
				
				clearTimeout(timeoutIDList[clientPairID]);
				delete timeoutIDList[clientPairID];
				delete gameContainers[clientPairID];
				//clients[tempClientInfo.id].emit('End game', 2);
				io.sockets.sockets[tempClientInfo.id].emit('End game', 2);
			} else {
				//clients[tempClientInfo.id].emit('return to online menu');
				io.sockets.sockets[tempClientInfo.id].emit('return to online menu');
			}
			delete readyClients[clientPairID]; 
			delete listClientInfoPairs[clientPairID];
			delete clientIDGameIDMap[tempClientInfo.id];
			delete clientIDGameIDMap[socket.id];
		}
		//delete clients[socket.id] 
		delete io.sockets.sockets[socket.id]; 
			
		console.log("disconnected!");
	});
	
	socket.on('client unconfirmed', function() {
		if (clientIDGameIDMap[socket.id] == null) {
			removeWaitingClient(socket.id);
		} else {
			var clientPairID = clientIDGameIDMap[socket.id]; 
			var tempClientInfo = listClientInfoPairs[clientPairID].shift();
			if (tempClientInfo.id == socket.id) {
				tempClientInfo = listClientInfoPairs[clientPairID].shift();
			}
			//clients[tempClientInfo.id].emit('return to online menu');
			io.sockets.sockets[tempClientInfo.id].emit('return to online menu');
			delete readyClients[clientPairID]; 
			delete listClientInfoPairs[clientPairID];
			delete clientIDGameIDMap[tempClientInfo.id];
			delete clientIDGameIDMap[socket.id]; 
		}
		console.log("client cancelled match");
	});
	
	socket.on('search cancelled', function() {
		removeWaitingClient(socket.id);
	});
	
	socket.on('player found', function(charRace, charId, userName, userId, type) {
		
		waitingClients.push({race: charRace, id: charId, name: userName, 
							 accountID: userId, accountType: type});

		if (waitingClients.length >= 2) {
			var clientOne = waitingClients.shift();
			var clientTwo = waitingClients.shift();
			console.log("clientOne.id: " + clientOne.id);
			console.log("clientTwo.id: " + clientTwo.id);
			var tempClientPairID = clientPairCount;
			listClientInfoPairs[tempClientPairID] = [{race: clientOne.race, 
													  id: clientOne.id, 
													  name: clientOne.name, 
													  accountID: clientOne.accountID, 
													  accountType: clientOne.accountType}, 
													 {race: clientTwo.race, 
													  id: clientTwo.id, 
													  name: clientTwo.name, 
													  accountID: clientTwo.accountID, 
													  accountType: clientTwo.accountType}];
													 
			console.log(clientOne.name + ' ' + clientOne.accountID + ' ' + 
						clientOne.accountType);
			console.log(clientTwo.name + ' ' + clientTwo.accountID + ' ' + 
						clientTwo.accountType);
			
			clientIDGameIDMap[clientOne.id] = tempClientPairID;
			clientIDGameIDMap[clientTwo.id] = tempClientPairID;
			clientPairCount++;
			//clients[clientOne.id].emit('get ready', clientTwo.race, tempClientPairID);
			io.sockets.sockets[clientOne.id].emit('get ready', clientTwo.race, 
												  clientTwo.name.split(" ")[0], 
												  tempClientPairID);
			//clients[clientTwo.id].emit('get ready', clientOne.race, tempClientPairID);
			io.sockets.sockets[clientTwo.id].emit('get ready', clientOne.race, 
												  clientOne.name.split(" ")[0], 
												  tempClientPairID);
		}
	});

	socket.on('match confirmed', function(clientPairID) {
		if (readyClients[clientPairID] == null) {
			readyClients[clientPairID] = [];
		}
		readyClients[clientPairID].push('c');
		if (readyClients[clientPairID].length == 2) {
			console.log("game starting");
			startGame(clientPairID, 
					  listClientInfoPairs[clientPairID][0].race, 
					  listClientInfoPairs[clientPairID][1].race, 
					  listClientInfoPairs[clientPairID][0].accountID, 
					  listClientInfoPairs[clientPairID][1].accountID);
		}
	});
	
	socket.on('loadData', function(table, criteria, output){
		databaseCommunicator.loadData(table, criteria, output); 
		this.emit('printout', JSON.stringify(db));
	});
});

function removeWaitingClient(clientID) {
	for (var i = waitingClients.length - 1; i >= 0; i--) {
		if (clientID == waitingClients[i].id) {
			waitingClients.splice(i, 1);
		}
	}
}

function startGame(gameID, clientOneRace, clientTwoRace, clientOneAccountID, 
				   clientTwoAccountTwoID) {
	delete readyClients[gameID];
	//var clientOne = clients[listClientInfoPairs[gameID][0].id];
	var clientOne = io.sockets.sockets[listClientInfoPairs[gameID][0].id];
	//var clientTwo = clients[listClientInfoPairs[gameID][1].id];
	var clientTwo = io.sockets.sockets[listClientInfoPairs[gameID][1].id];
	var game = new GameContainer(clientOneRace, clientTwoRace, clientOne, 
								 clientTwo, clientOneAccountID, 
								 clientTwoAccountTwoID);
	gameContainers[gameID] = game;
	var clientOneInitAssets = gameContainers[gameID].getInitialAssets(true);
	var clientTwoInitAssets = gameContainers[gameID].getInitialAssets(false);

	clientOne.emit('Start Game', clientOneInitAssets);
	clientTwo.emit('Start Game', clientTwoInitAssets);
	timeoutIDList[gameID] = setTimeout(function() {gameLoop(gameID)}, 65);
}
