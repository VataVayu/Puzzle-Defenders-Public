var connect = require('connect');
//var mongo = require('mongodb');
/*
use process.env.MONGOLAB_URI when we have the game running on heroku, 
mongoUri will point to the URI of the corresponted MongoLab database
*/
//var mongoUri = process.env.MONGOLAB_URI;
var mongoUri = 'mongodb://heroku_app3275446:3g1eu4cani4bgf2rce762v6blk@ds031587.mongolab.com:31587/heroku_app3275446';
var count;
var totalNumOfGames;	

	/**
	* Function to create a new player 
	**/
	
	this.createPlayer = function(playerName, playerEmail, tID){
	
		//mongo.connect(mongoUri, {}, function(error, db){
			
			/*
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when creating new player");
			});
			*/
			
			/*
			When we have the ability to access to user names and emails, uncomment the following line to make sure 
			the email addresses are unique
			*/
			//db.players.ensureIndex({'email': 1 }, {unique : true}, function(err, replies){});
			/*
			db.collection('players', function(err, collection){
				collection.insert({
				      'name': playerName,
 			       	 'email': playerEmail,   				//used as unique id
					 'tmpID': tID,
			         'witch': 0,
			         'angel': 0,
   				 'steampunk': 0,
				   'matches': 0,
				       'win': 0,
				      'lost': 0,
					'spellsUsed': 0,
					'attackUsed': 0,
				   'shieldsUsed': 0,
			  'playSessions': []
				},function(err, objects) {
					if (err) console.warn(err.message);
					if (err && err.message.indexOf('E11000 ') !== -1) {
						console.log("oops");
					}
				});
			});
			*/
		//});
	}
	
	
	/**
	* Function to update the database
	**/
	this.updateDatabase = function(table, criteria, action){
	
		//mongo.connect(mongoUri, {}, function(error, db){
			/*
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when updating database");
			});

			db.collection(table, function(err, collection){
				collection.update(criteria, action, function(err, objects){
				});
			});
			*/
		//});
	}
	
	/*
	**Function to load the data from MongoLab
	*/
	
	
	this.loadData = function(table, criteria, output){
	
		//var docCollection = [];
		//mongo.connect(mongoUri, {}, function(error, db){
			/*
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when loading data");
			});
			*/
			/*
			db.collection(table, function(err, collection){
				collection.find(criteria, output, function(err, cursor){
					cursor.each(function(err, doc) {
						if(doc != null) {
							console.log("Entries: ");
							console.log(doc);
							//docCollection.push(doc);
						}
					});
				//JSON.stringify(cursor);
				});
			});
			*/
		//});
		//if (docCollection != null) console.log(docCollection);
		//else console.log("docCollection is NULLL~!");
		//return docCollection;
	}
	
	/**
	* Function to create a match with passed in unique id of match
	**/
	this.createGame = function(race, opponentID, opponentRace){
	
		this.numberOfGames();
		//console.log("in createMatch, number is " + totalNumOfGames);
		
		return {'matchID': totalNumOfGames,
				'match':	{
							'timeStamp': new Date(), 
							'spawnedColomn': 0,
							'spawnedRows':[],
							'opponentID': opponentID,
						    'opponentRace': opponentRace,
							'race': race,
							'abilityA': 0,
							'abilityB': 0,
							'attacks': 0,
							'shields': 0,
							'spells': 0,
							'duration': null,
							'win': null
							}
				};
	}

	this.numberOfGames = function(){
	
		//mongo.connect(mongoUri, {}, function(error, db){
			/*
			db.addListener("error", function(error){
				console.log("Error connecting to MongoLab when counting numbers of matches");
			});
			*/
			/*
			db.collection('totalGames', function(err, collection){
				collection.find({},{'totalNumOfGames':1}, function(err, cursor){
					cursor.each(function(err, doc) {
						if(doc != null) {
							count = doc.totalNumOfGames;
							console.log("number is now " + count);
							if (count % 2 == 0){
								totalNumOfGames = count % 2;
							} else {
								totalNumOfGames = (count + 1) / 2;
							}
						}
					});
				});
			});
			*/
		//});
		
		this.updateDatabase('totalGames', {}, {'$inc': {totalNumOfGames: 1}});
	}
	
	
	this.endGameUpdate = function(playerOneID, playerTwoID){
		
		var gameInfoPlayerOne = {'matchID': totalNumOfGames,
				'match':	{
							'timeStamp': databaseVariables[0].gameStartTime, 
							'spawnedColomn': databaseVariables[1].rowSpawns,
							'spawnedRows':databaseVariables[1].columnSpawns,
							'opponentID': playerTwoID,
						    'opponentRace': databaseVariables[2].race,
							'race': databaseVariables[1].race,
							'abilityA': databaseVariables[1].abilityA,
							'abilityB': databaseVariables[1].abilityB,
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
							'opponentID': playerOneID,
						    'opponentRace': databaseVariables[1].race,
							'race': databaseVariables[2].race,
							'abilityA': databaseVariables[2].abilityA,
							'abilityB': databaseVariables[2].abilityB,
							'attacks': databaseVariables[2].attacks,
							'shields': databaseVariables[2].shields,
							'spells': databaseVariables[2].spells,
							'duration': databaseVariables[0].gameDuration,
							'victory': databaseVariables[2].victory,
							'latency': databaseVariables[2].latency
							}
				};
		// Update database
		this.updateDatabase('players', {tmpID: playerOneID}, {'$push': {playSessions: gameInfoPlayerOne}});
		this.updateDatabase('players', {tmpID: playerTwoID}, {'$push': {playSessions: gameInfoPlayerTwo}});

	}

