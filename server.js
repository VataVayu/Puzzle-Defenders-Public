// server side
// Eventually, we need to be able to reload the server if it crashes
// More importantly, we also need to host multiple games
// include files for the server
var http = require('http');
var url = require("url");
var express = require('express');
var app = express.createServer();
var io = require("socket.io").listen(app);
var port = process.env.PORT ||  8080;
app.listen(port); // Watch port 8080 locally or watch Heroku server
app.use(express.static(__dirname + '/Main')); // static files for client are stores here
var messageHandler = require('./MessageHandler');
var databaseCommunicator = require('./DatabaseCommunicator');

// routing to get to the game's index
app.get('/', function (req, res) {
	var path = url.parse(req.url).pathname;
	var	userAgent = req.headers['user-agent'];

	//console.log('User-Agent: ' + userAgent);
	if(userAgent.indexOf("Chrome") != -1) {
		console.log("You are on Chrome!");
		res.sendfile(__dirname + '/Main/index.htm');
	}
	else {
		console.log("You are not on Chrome.");
		res.redirect('http://www.puzzledefenders.com/Redirect.html');
	}
});


/*JSON string format, will be modified soon
var ourJSONObject = {input: [
						{ID: 0, input: "", action: "", x_pos: 100, y_pos: 100}]
					}; 
*/
var playerJSON = [{username: "default", x: -100, y: -100, color: 0xFF0000, input: "", action: ""}];;
var i = 0;
var PEOPLE = [{}];
var idlePeople = [];
var clientList = [];
var games = [];

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.set('log level', 1); // takes away debug statements
io.sockets.on('connection', function(socket){
	i++;
	console.log("Someone has connected! We have " + i + " people connected");
	socket.send("Someone has connected!");
	messageHandler.handleConnect();
	
	//Saves the socket on a array to determine how many clients we have as well as in a dictionary for easy access
	PEOPLE.push({username: socket.id});
	clientList[socket.id] = socket;
	idlePeople.push(socket); //Pushes an socket onto the stack to know how many people do not have games
	databaseCommunicator.createPlayer(i, 'shiteru@shiteru.com', socket.id); // I AM LE!
	databaseCommunicator.createPlayer(i, 'domo@domo.com', socket.id + 1); // I AM JAMEKA!
	//socket.send("Added in " + socket.id);
	//console.log("Added in " + socket.id);
	//player = null;	
	
	socket.on('message', function(message) {
		console.log("From client " + socket.id);
		try {
		console.log("Trying to use the message handler");
			messageHandler.handleMessage(JSON.parse(message));
		} catch(e){ exception(e); }
	});
	
	socket.on('disconnect', function(){
		console.log("BYE BYE!");
		i--;
		socket.send("Someone has left...!");
		try{
			messageHandler.handleDisconnect();
		} catch(e){ exception(e); }
	});

	
	if (idlePeople.length > 2) {
		
		var playerOne = idlePeople.pop();
		var playerTwo = idlePeople.pop();
		// newGame = new Game(++gameIdCount, playerOne, playerTwo);
		//games.push(newGame);
		//Make a new Game container once I figure out what this does
		//var gameContainer = new GameContainer(
	}
	
	// Update database
	socket.on('updateDatabaseEndGame', function(databaseVariables) {
		try {
			databaseCommunicator.endGameUpdate(socket.id, JSON.parse(databaseVariables));
		} catch(e){ exception(e); }
		
	});
	
	
	/*
	// sets up the initial values
	socket.on('parse_info', function(string, fn){
		// parse the JSON string that passed from the client
		var player = JSON.parse(string);
		++i;
		player.ID = i;
		//assigns username to player_id
		socket.set('player_id', player.ID, function(){});
		//assigns input to player_input
		socket.set('player_input', player.input, function(){});
		//assigns action to player_action
		socket.set('player_action', player.action, function(){});
		//assigns position of the player to player_position
		socket.set('player_position', new Pair(player.x_pos, player.y_pos), function(){});
		
		
		socket.get('player_id', function(err, id){
			console.log("player_id is " + id);
		});
		socket.get('player_position', function(err, pair){
			console.log('player_position is ' + pair.getFirst() + ' ' + pair.getSecond());
		});
		
		console.log("There are " + i + " players who have connected.");
	});

	// NEXT STEPS is to get this working
	socket.on('input', function(string, fn){
		var message = JSON.parse(string);
		var playerID = null;
		socket.get('player_id', function(err, username){
			playerID = username;		
		});
			switch (message.input){
				//checks if input is valid
				case 'up':
				// up
				console.log("Player " + playerID + " is going UP!");
				fn(JSON.stringify({input: 'up'}));
				break;
		
				case 'down':
				// down
				console.log("Player " + playerID + " is going DOWN!");
				fn(JSON.stringify({input: 'down'}));
				break;
				
				case 'left':
				// left
				console.log("Player " + playerID + " is going LEFT!");
				fn(JSON.stringify({input: 'left'}));
				break;
				
				case 'right':
				// right
				console.log("Player " + playerID + " is going RIGHT!");
				fn(JSON.stringify({input: 'right'}));
				break;
				
				case 'abilityA':
				// ability A
				console.log("Player " + playerID + " is using ABILITY A!");
				fn(JSON.stringify({input: 'abilityA'}));
				break;
				
				case 'abilityB':
				// ability B
				console.log("Player " + playerID + " is using ABILITY B!");
				fn(JSON.stringify({input: 'abilityB'}));
				break;
				
				case 'spawnColumn':
				// spawn column
				console.log("You're using old code, you cheater!");
				fn(JSON.stringify({input: 'spawnColumn'}));
				
				default:
				// didn't work
				console.log("Player " + playerID + " doesn't like valid keys.");
				fn(JSON.stringify({input: false}));
			}
	});
	*/
});

function Game(id, socketId, socketId) {
	var playerOne = sockedId;
	var playerTwo = socketId;
	var gameId = id; // This will change
	
	var playerOneRace;
	var playerTwoRace;
	
	var playerOneSpell;
	var playerTwoSpell;
	
	var playerOneReady = false;
	var playerTwoReady = false;
	
	playerOne.on('Player Ready', function(playerData) {
		playerDataDebug(playerData, "one");
		playerOneRace = playerData.race;
		playerTwoRace = playerData.spell;
		playerOneReady = true;
		startGame();
	});
	
	playerTwo.on('Player Ready', function(playerData) {
		playerDataDebug(playerData, "two");
		playerTwoRace = playerData.race;
		playerTwoSpell = playerData.spell;
		playerTwoReady = true;
		startGame();
	});
	
	
	
	this.getGameId = function() {
		return gameId;
	}
	
	this.getPlayerOneId = function() {
		return playerOne;
	}
	
	this.getPlayerTwoId = function() {
		return playerTwo;
	}
	
	function startGame() {
		if (!playerOneReady || !playerTwoReady) {
			return;
		}
		playerOne.send('Game Ready', JSON.stringify({ "race": playerTwoRace, "spell": playerTwoSpell, "player": "One"}));
		playerTwo.send('Game Ready', JSON.stringify({ "race": playerOneRace, "spell": playerOneSpell, "player": "Two"}));
	}
	
	//Debug
	function playerDataDebug(playerData, player) {
		
		if (playerData.race == undefined) {
		  throw exception("Player " + player + " race is undefined");
		}
		
		if (playerData.spell == undefined) {
			throw exception("Player " + player + " spell is undefined");
		}
	}
	
}

//Generates a random number from 0 to the length of the array
function fisherYatesRandom(myArray,nb_picks)
{
    for (i = myArray.length-1; i > 1  ; i--)
    {
        var r = Math.floor(Math.random()*(i+1));
        var t = myArray[i];
        myArray[i] = myArray[r];
        myArray[r] = t;
    }

    return myArray.slice(0,nb_picks);
}

// Taken from internet to help view errors
function exception(e)
{
  if(typeof e == "string")
  {
    console.error("Throw: " + e);
  }
  else if(e.stack)
  {
    console.error("Stack: " + e.stack);
  }
  else
  {
    console.error(JSON.stringify(e));
  }
}

// playerJSON contains playerid(username), input and action of the player
// This is to allow ease of passing pairs of coordinates!
function Pair(eOne, eTwo) {
	var elementOne = eOne;
	var elementTwo = eTwo;
	
	this.getFirst = function() {
		return elementOne;
	}
	
	this.getSecond = function() {
		return elementTwo;
	}
	
	this.setFirst = function(e) {
		elementOne = e;
	}
	
	this.setSecond = function(e) {
		elementTwo = e;
	}
}