var connect = require('connect');
var mongo = require('mongodb');

/**
 * Communicator from server to database.
 *
 * function createPlayer(playerName, playerID, accountType): creates a new player entry
 * function updateDatabase(table, criteria, action): updates the database 
 * function loadData(table, criteria, output): prints the output to heroku logs
 * function numberOfGames(): returns the total number of matches we have so far
 * function endGameUpdate(databaseVariables, disconnectedTime): updates the database
 *						at the end of game. If the one client disconnected from the server,
 *						disconnectedTime is the game duration.
**/

// mongoUri for our game!
var mongoUri = 'mongodb://heroku_app3106887:3vc4kivjd405vksnvf64fcondd@ds031407.mongolab.com:31407/heroku_app3106887';
var count;
var totalNumOfGames;	
var result;

	this.createPlayer = function(playerName, playerID, accountType){

		mongo.connect(mongoUri, {}, function(error, db){
			
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when creating new player");
			});
			
			db.collection('players', function(err, collection){
				collection.find({'id':playerID}).count(function(err, count){	
					if (count == 0){
						collection.insert({
							  'name': playerName,
							    'id': playerID,   	//used as unique id
						   'account': accountType,
							 'witch': 0,
							 'angel': 0,
						 'steampunk': 0,
						   'matches': 0,
							   'won': 0,
							  'lost': 0,
					  'playSessions': []
						},function(err, objects) {});
					}
				});
			});
		});
	}
	
	
	this.updateDatabase = function(table, criteria, action){
	
		mongo.connect(mongoUri, {}, function(error, db){
			
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when updating database");
			});

			db.collection(table, function(err, collection){
				collection.update(criteria, action, function(err, objects){
				});
			});
			
		});
	}
	
	
	this.loadData = function(id){
		mongo.connect(mongoUri, {}, function(error, db){
			
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when loading data");
			});
			
			db.collection('players', function(err, collection){
				id = parseInt(id);
				var cri = {'id': id};
				collection.findOne(cri, function(err, cursor){
					if (err){}
					if (cursor != null){
						result = cursor;
						}
					else 
						console.log("WHY IS IT NULLLLLLL! =[");
				});
			});
			
		});
	}
	
	this.getResult = function(id){
		if (result != null && result.id == id)
			return result;
	}
	
	this.numberOfGames = function(){
	
		mongo.connect(mongoUri, {}, function(error, db){
			
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when counting total matches");
			});
			
			db.collection('totalGames', function(err, collection){
				collection.find({},{'totalNumOfGames':1}, function(err, cursor){
					cursor.each(function(err, doc) {
						if(doc != null) {
							count = doc.totalNumOfGames;
							if (count % 2 == 0){
								totalNumOfGames = count % 2;
							} else {
								totalNumOfGames = (count + 1) / 2;
							}
						}
					});
				});
			});
			
		});
		
		this.updateDatabase('totalGames', {}, {'$inc': {totalNumOfGames: 1}});
	}
	
	
	this.endGameUpdate = function(databaseVariables, disconnectedTime){
	
		if (disconnectedTime != null){
			databaseVariables[0].gameDuration = disconnectedTime;
		}
		
		// Gets game info from databaseVariables
		var gameInfoPlayerOne = {'matchID': totalNumOfGames,
				'match':	{
							'timeStamp': databaseVariables[0].gameStartTime, 
							'spawnedColomn': databaseVariables[1].rowSpawns,
							'spawnedRows':databaseVariables[1].columnSpawns,
							'opponentID': databaseVariables[2].id,
						    'opponentRace': databaseVariables[2].race,
							'race': databaseVariables[1].race,
							'abilityA': databaseVariables[1].abilityA,
							'abilityB': databaseVariables[1].abilityB,
							'disconnected': databaseVariables[1].disconnected,
							'attacks': databaseVariables[1].attacks,
							'shields': databaseVariables[1].shields,
							'spells': databaseVariables[1].spells,
							'duration': databaseVariables[0].gameDuration,
							'victory': databaseVariables[1].victory,
							'latency': databaseVariables[1].latency
							}
				};
		
		var gameInfoPlayerTwo = {'matchID': totalNumOfGames,
				'match':	{
							'timeStamp': databaseVariables[0].gameStartTime, 
							'spawnedColomn': databaseVariables[2].rowSpawns,
							'spawnedRows':databaseVariables[2].columnSpawns,
							'opponentID': databaseVariables[1].id,
						    'opponentRace': databaseVariables[1].race,
							'race': databaseVariables[2].race,
							'abilityA': databaseVariables[2].abilityA,
							'abilityB': databaseVariables[2].abilityB,
							'disconnected': databaseVariables[2].disconnected,
							'attacks': databaseVariables[2].attacks,
							'shields': databaseVariables[2].shields,
							'spells': databaseVariables[2].spells,
							'duration': databaseVariables[0].gameDuration,
							'victory': databaseVariables[2].victory,
							'latency': databaseVariables[2].latency
							}
				};
		// Updates information of the match and push it under playSessions of each player
		this.updateDatabase('players', {id: databaseVariables[1].id}, {'$push': {playSessions: gameInfoPlayerOne}});
		this.updateDatabase('players', {id: databaseVariables[2].id}, {'$push': {playSessions: gameInfoPlayerTwo}});
		
		// Updates the total matches of both players
		this.updateDatabase('players', {id: databaseVariables[1].id}, {'$inc': {matches: 1}});
		this.updateDatabase('players', {id: databaseVariables[2].id}, {'$inc': {matches: 1}});
		
		// Updates the total number of matches as a specific race for player 1
		if (databaseVariables[1].race == 'witch'){
			this.updateDatabase('players', {id: databaseVariables[1].id}, {'$inc': {witch: 1}});
		} else if (databaseVariables[1].race == 'steampunk'){
			this.updateDatabase('players', {id: databaseVariables[1].id}, {'$inc': {steampunk: 1}});
		} else {
			this.updateDatabase('players', {id: databaseVariables[1].id}, {'$inc': {angel: 1}});
		}
		
		// Updates the total number of matches as a specific race for player 2 
		if (databaseVariables[2].race == 'witch'){
			this.updateDatabase('players', {id: databaseVariables[2].id}, {'$inc': {witch: 1}});
		} else if (databaseVariables[2].race == 'steampunk'){
			this.updateDatabase('players', {id: databaseVariables[2].id}, {'$inc': {steampunk: 1}});
		} else {
			this.updateDatabase('players', {id: databaseVariables[2].id}, {'$inc': {angel: 1}});
		}
		
		// Updates the win/lose stat
		if (databaseVariables[1].disconnected != true && databaseVariables[2].disconnected != true ){
			if (databaseVariables[1].victory == true){
				this.updateDatabase('players', {id: databaseVariables[1].id}, {'$inc': {won: 1}});
				this.updateDatabase('players', {id: databaseVariables[2].id}, {'$inc': {lost: 1}});
			} else {
				this.updateDatabase('players', {id: databaseVariables[1].id}, {'$inc': {lost: 1}});
				this.updateDatabase('players', {id: databaseVariables[2].id}, {'$inc': {won: 1}});
			}
		}
	}

