/*This file holds the MenuNavigator Class. */
/**
 * 	The class holds a list of Menus as well as an ID to detect which one 
 * 	the player is currently accessing. 
 *	It holds the menus, gameContainer and worldMap.
 *
 * 	function MenuNavigator(): Constructor of the MenuNavigator
 *	function update(): Updates the current Menu set by activeMenuID.
 *	function draw(): draw the current Menu set by activeMenuID and the menu 
 *	background if in the menus.
**/
function MenuNavigator(updateIntervalID) {
	/***********Private Background Nested Class*************/
	function menuBackground() {
		var stillImage = spriteManager.menu.still;
		var angelIsland = spriteManager.menu.angelCity;
		var angelShadow = spriteManager.menu.cityShadow;
		var islandPosX = 8.5;
		var islandPosY = -.5;
		var shadowPosX = 5.25;
		var shadowPosY = 7.25;
		var offsetX = 0;
		var offsetY = 0;
		var tracePositiveX = true;
		var tracePositiveY = true;
		var nameText = new Text(new Pair(
			variableContainer.gameContainerNumColumns - 4.5, .5), 
			new Pair(4, 1), null, null, null, "Not logged in yet");
		
		// Updates the Background allowing for animations/movement
		this.update = function() {
			if (userName != null) {
				nameText.changeText(userName);
			}
			if (tracePositiveX) {
				if (offsetX >= .25) {
					tracePositiveX = false;
				}
				offsetX += 0.005;
			} else {
				if (offsetX <= -.25) {
					tracePositiveX = true;
				}
				offsetX -= 0.005;
			} 
			if (tracePositiveY) {
				if (offsetY >= .125) {
					tracePositiveY = false;
				}
				offsetY += 0.005;
			} else {
				if (offsetY <= -.125) {
					tracePositiveY = true;
				}
				offsetY -= 0.005;
			}
		}
		
		// Draws the menu background itself
		this.draw = function() {
			stillImage.draw(0, 0);
			angelShadow.draw(islandPosX + shadowPosX + offsetX, islandPosY + 
				shadowPosY + offsetY);
			angelIsland.draw(islandPosX + offsetX, islandPosY + offsetY);
			if (userName != null) {
				nameText.draw();
			}
		}
	}
	
	/***********************Private Variables*********************************/
	var background = new menuBackground();
	
	var menuList = new Array();
	var activeMenuID = "selection";//"login";
	var playerOneSelector = {race: null};
	var playerTwoSelector = {race: null};
	var menuAfterGame = null;
	var menuInputHandler = new InputHandler(null);
	var menuTimer = new Timer();
	var serverCom = null;
	// Variables containing login info
	var userType = null;
	var userId = null;
	var userName = "Puzzle Defender"; //null;
	
	//This is the menu stack allowing the back button to work correctly
	var menuStack = [activeMenuID];
	
	var tutorialHolder = null;
	var playingMenuMusic = false;
	
	
	/***********************Private Functions*********************************/
	
	//Activates the game container with the correct players and input keys
	var activateGame = function(tutorialData, initAssets, serverComInstance) {
		activeMenuID = "game";
		
		
		//procedure here will monitor whether it is online, tutorial, or 
		//custom match set inputHandler to true to activate tutorial AI.
		//handles second character to AI
		//var characterTwoHandler = true;
		if(tutorialData != null) {
			SoundJS.stop("overworld music");
			SoundJS.play("tutorial theme", SoundJS.INTERRUPT_LATE, 0.8, true);
			menuList[activeMenuID] = new tutorialHandler(tutorialData, false, 
				playerOneSelector, playerTwoSelector, menuAfterGame, 
				new InputHandler(null));
			menuList[activeMenuID].startGameContainer();
		} else {
			if (serverCom != null) {
				menuList[activeMenuID] = new GameContainer(initAssets,
					serverComInstance, 
					spriteManager["background"][raceEnum[0]], 
					menuAfterGame);
				menuList[activeMenuID].initializeStartGameSequence(
					menuTimer, menuInputHandler);
			} else {
				var playerOneInputHandler = new InputHandler(1, null, variableContainer.UPONE, 
												 variableContainer.DOWNONE, 
												 variableContainer.LEFTONE, 
												 variableContainer.RIGHTONE, 
												 variableContainer.ACTION_AONE, 
												 variableContainer.ACTION_BONE, 
												variableContainer.NEW_COLUMNONE);
				var playerTwoInputHandler = new InputHandler(2, null, variableContainer.UPTWO, 
												 variableContainer.DOWNTWO, 
												 variableContainer.LEFTTWO, 
												 variableContainer.RIGHTTWO, 
												 variableContainer.ACTION_ATWO, 
												 variableContainer.ACTION_BTWO, 
												 variableContainer.NEW_COLUMNTWO);
				var playerOneAiDifficulty = null;
				var playerTwoAiDifficulty = null;
				if (playerOneSelector.ai) {
					playerOneInputHandler = null;
					playerOneAiDifficulty = playerOneSelector.aiDiff;
				}
				if (playerTwoSelector.ai) {
					playerTwoInputHandler = null;
					playerTwoAiDifficulty = playerTwoSelector.aiDiff;
				}
				menuList[activeMenuID] = new GameContainer(null, null, spriteManager["background"][raceEnum[0]], 
								menuAfterGame, playerOneSelector.race, playerTwoSelector.race, 
								playerOneInputHandler, playerTwoInputHandler,  
								playerOneAiDifficulty, playerTwoAiDifficulty);
				menuList[activeMenuID].initializeStartGameSequence(menuTimer, menuInputHandler);
			}
		}
		
		playingMenuMusic = false;
	}
	
	// Activates/Refreshes the Login Menu
	var activateLoginMenu = function() {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new LoginMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
		menuAfterGame = activeMenuID;
	}	
	
	// Activates/Refreshes the Credit Menu
	var activateCreditMenu = function() {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new CreditMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
		menuAfterGame = activeMenuID;
	}

	// Activates/Refreshes the Statistics Menu
	var activateStatisticsMenu = function() {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new StatisticsMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
		menuAfterGame = activeMenuID;
	}		
	
	// Activates/Refreshes the Main Selection Menu. It also informs the server 
	// that the player has left the Online Play menus if true.
	var activateSelectionMenu = function() {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new MainMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
		menuAfterGame = activeMenuID;
		if (serverCom != null) {
			//clearInterval(serverCom.getGameUpdateIntervalID());
			//updateIntervalID = setInterval(update, variableContainer.tickInterval);
			serverCom.disconnect();
			serverCom = null;
		}
	}
	
	// Activates/Refreshes the Options Menu
	var activateOptionsMenu = function() {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new OptionsMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
		menuAfterGame = activeMenuID;
	}
	
	// Activates/Refreshes the Online Race Selection Menu
	var activateOnlineRaceMenu = function(prevMenu, selector, destinationMenu) {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new OnlineMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
		
		if (serverCom == null) {
			serverCom = new ServerCommunicator(updateIntervalID, userName, userId, userType);
		}
	}
	
	// Activates/Refreshes the Local Race Selection Menu
	var activateLocalRaceMenu = function(prevMenu, selector, destinationMenu) {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new LocalMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
	}
	
	// Activates/Refreshes the Confirmation of match Menu
	var activateConfirmationMenu = function(prevMenu, playerOneName, playerTwoName, returnDest, playerOneRealName, playerTwoRealName) {
		//Player Races defaults to Angels (2), Witches (0), Steampunk (1)
		//var playerOneRace = 2;
		//var playerTwoRace = 2;
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new FoundMatchMenu(menuInputHandler, playerOneName, playerTwoName, returnDest, playerOneRealName, playerTwoRealName);
		} else {
			menuList[activeMenuID].reset(playerOneName, playerTwoName, playerOneRealName, playerTwoRealName);
		}
	}
	
	// Activates/Refreshes the Online Searching for match Menu
	var activateSearchMenu = function(prevMenu) {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new SearchingMenu(menuInputHandler, menuTimer);
		} else {
			menuList[activeMenuID].reset();
		}
		serverCom.findOpponent(playerOneSelector.race, 
							   function(menu, playerTwoRace, playerOneName, playerTwoName) { //BRAD USE THESE
									updateMenuStack(menu);
								    menuStack.push(menu);
								    activeMenuID = menu;
									activateConfirmationMenu(null, playerOneSelector.race, playerTwoRace, "online", playerOneName, playerTwoName);
								}, 
								function(menu) { 
									updateMenuStack(menu);
									menuStack.push(menu);
									activeMenuID = menu;
									activateOnlineRaceMenu(null, playerOneSelector, null);
								})
	}
	
	// Activates/Refreshes the No Match Found Menu
	var activateNoMatchMenu = function(prevMenu, selectionScreen) {
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new DidNotFindMatchMenu(menuInputHandler);
		} else {
			menuList[activeMenuID].reset();
		}
	}
	
	// Activates/Refreshes the Tutorial Screen Menu
	var activateOverWorld = function(prevMenu, results) {
		SoundJS.stop("menu music");
		playingMenuMusic = false;
		SoundJS.play("overworld music", SoundJS.INTERRUPT_LATE, 0.8, true);
		if (menuList[activeMenuID] == null) {
			menuList[activeMenuID] = new OverWorld(prevMenu, menuInputHandler, spriteManager.overworld.map);
			var tempNodeList = new Array();
			//generateWitchTutorial
			var nodeInfo = {game: true, raceOne: "witch", raceTwo: "witch", aiTwoLvl: 1, tutorialData: generateWitchTutorial};
			var tempTextBox= new TextBox(new Pair(15.5, 8), new Pair(7, 4), null, null, null, true, menuInputHandler, 
				"Welcome to the Witch Academy.\nHere you can learn all the basics of magic manipulation to become a true Witch!");
			tempNodeList[0] = new WorldNode(new Pair(6.85, 4.65), 3.75, menuInputHandler, nodeInfo, tempTextBox);
			
			nodeInfo = {game: true, raceOne: "angel", raceTwo: "angel", aiTwoLvl: 1, tutorialData: generateAngelTutorial};
			tempTextBox= new TextBox(new Pair(15.5, 8), new Pair(7, 4), null, null, null, true, menuInputHandler,
				"Welcome to the Angel City.\nFeel free to take a flight lesson and learn the in's and out's of Angel Combat.");
			tempNodeList[1] = new WorldNode(new Pair(15.23, 3.1), 3.5, menuInputHandler, nodeInfo, tempTextBox);
			
			nodeInfo = {game: true, raceOne: "steampunk", raceTwo: "steampunk", aiTwoLvl: 1, tutorialData: generateSteamTutorial};
			tempTextBox= new TextBox(new Pair(15.5, 8), new Pair(7, 4), null, null, null, true, menuInputHandler,
				"Greetings from the Magnificent Steampunk City!\nAll Citizens must enroll in this manditory combat training lesson!");
			tempNodeList[2] = new WorldNode(new Pair(23, 4.1), 3.625, menuInputHandler, nodeInfo, tempTextBox);
			
			
			var connectionList = new Array();
			
			menuList[activeMenuID].addNodes(tempNodeList, connectionList, [0, 1, 2]);
		} else {
			menuList[activeMenuID].reset(results);
		}
		gameWinDestination = activeMenuID;
	}
	
	// Updates the Menu Stack that keeps track of the Way in which Menu's have 
	// been naviagated.
	var updateMenuStack = function(nextMenu) {
		var foundNextMenu;
		for(var i = 0; i < menuStack.length; ++i) {
			if(menuStack[i] == nextMenu) {
				foundNextMenu = i;
				break;
			}
		}
		if(foundNextMenu != null){
			menuStack.splice(foundNextMenu, menuStack.length - foundNextMenu);
		}
	}
	
	// Activates the given menu as needed.
	var activateMenu = function(menu, prevMenu, results) {
		updateMenuStack(menu);
		menuStack.push(menu);
		activeMenuID = menu;
		switch (activeMenuID) {
			case "selection":
				if (!playingMenuMusic) {
					SoundJS.stop("overworld music");
					//SoundJS.stop("tutorial victory");
					SoundJS.stop("battle victory");
					SoundJS.play("menu music", SoundJS.INTERRUPT_LATE, 0.8, true);
					playingMenuMusic = true;
				}
				activateSelectionMenu();
				break;
			case "local":
				activateLocalRaceMenu(prevMenu, playerOneSelector, "gameConfirmation");
				break;
			case "online":
				activateOnlineRaceMenu(prevMenu, playerOneSelector, "search");
				break;
			case "search":
				activateSearchMenu(prevMenu);
				break;
			case "noMatchFound":
				activateNoMatchMenu("selection", "online");
				break;
			case "gameConfirmation":
				activateConfirmationMenu(prevMenu, playerOneSelector.race, playerTwoSelector.race, "online");
				break;
			case "overWorld":
				activateOverWorld(prevMenu, results);
				break;
			case "options":
				activateOptionsMenu(prevMenu);
				break;
			case "login":
				if (!playingMenuMusic) {
						SoundJS.play("menu music", SoundJS.INTERRUPT_LATE, 0.8, true);
						playingMenuMusic = true;
				}
				activateLoginMenu();
				break;
			case "credits":
				activateCreditMenu();
				break;
			case "statistics":
				activateStatisticsMenu();
				break;
		}
	}
	
	/************************Public Functions*********************************/
	
	// Updates the current Menu and checks if any results require execution
	this.update = function() {
		if (activeMenuID) {
			if (activeMenuID != "game") {
				background.update();
			}
			if (menuList[activeMenuID] != undefined) {
				var action = menuList[activeMenuID].update();
				if (action) {				
					// Checks if the game desired is local.
					if (action.local != null) {
						variableContainer.isLocal = action.local;
					}
					//Sets the first players race
					if (action.raceOne != null) {
						playerOneSelector.race = action.raceOne;
					}
					//Sets the second players race
					if (action.raceTwo != null) {
						playerTwoSelector.race = action.raceTwo;
					}
					//Sets the Users Action
					if (action.userType != null && userType == null) {
						userType = action.userType;
					}
					//Sets the Users unique ID
					if (action.userId != null && userId == null) {
						userId = action.userId;
					}
					//Sets the Users name
					if (action.userName != null && userName == null) {
						userName = action.userName;
					}
					//Set the AI on for Player One
					if (action.aiOne != null) {
						playerOneSelector.ai = action.aiOne;
					} else {
						playerOneSelector.ai = null;
					}
					//Set the AI on for Player Two
					if (action.aiTwo != null) {
						playerTwoSelector.ai = action.aiTwo;
					} else {
						playerTwoSelector.ai = null;
					}
					//Set the AI difficulty of Player One
					if (action.aiOneDiff != null) {
						playerOneSelector.aiDiff = action.aiOneDiff;
					}
					//Set the AI difficulty of Player Two
					if (action.aiTwoDiff != null) {
						playerTwoSelector.aiDiff = action.aiTwoDiff;
					}
					//Sets up the Tutorial system
					if (action.tutorialData != null) {
						tutorialHolder = action.tutorialData
					}
					//Reverts the menu back a screen
					if (action.back) {
						if (activeMenuID == "search") {
							serverCom.cancelSearch();
						}
						menuStack.pop();
						var prev = menuStack.pop();
						activateMenu(prev, null);
					// Activates the given menu.
					} else if (action.menu) {
						if (activeMenuID == "search") {
							serverCom.cancelSearch();
						} else if (activeMenuID == "gameConfirmation") {
							console.log("unconfirm match!");
							serverCom.unconfirmMatch();
						}
						// Logout functionality
						if (action.menu == "login") {
							userType = null;
							userId = null;
							userName = null;
						}
						activateMenu(action.menu, activeMenuID);
					//Notifies the Server of this clients readieness to play the match
					} else if (action.onlineConfirm) {
						serverCom.startGame(function(initAssets, serverComInstance) {
							activateGame(tutorialHolder, initAssets, 
								serverComInstance);
						});
					// Activates the game to be played (should be local only)
					} else if (action.game) {
						activateGame(tutorialHolder);
					// Informs of a game being completed
					} else if (action.winner != null) {
						//menuList[activeMenuID] = null;
						delete menuList[activeMenuID];
						activateMenu(action.destination, null, action.winner);
						tutorialHolder = null;
						playerOneSelector = {}; // reset AI selection for P1
						playerTwoSelector = {}; // reset AI selection for P2
					}
				}
			}
		}
	}
	
	// This draws the current menu that is being used
	this.draw = function() {
		if (menuList[activeMenuID] != undefined) {
			if (activeMenuID != "game")
				background.draw();
			if (activeMenuID != null)
				menuList[activeMenuID].draw();
			if (activeMenuID == "game") {
				menuList[activeMenuID].runStartGameSequence();
				menuList[activeMenuID].runEndGameSequence();
			}
		}
	}
	
	// Activate initial menu screen
	activateMenu(activeMenuID);
}