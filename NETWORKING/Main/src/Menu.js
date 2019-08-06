/**
 *	Menu class for setting up the menu interface for players to navigate 
 *	through to set and play the game.
 *	
 *	function Menu(): The menu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
 *	function reset(): Resets the menu
**/
function Menu() {
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var buttonResults = {};
	var uid = null;   // Stores the user id in Menu
	
	/******************* Protected Functions *********************************/
	// General update function for all menus
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				for (var v in bInfo) {
					buttonResults[v] = bInfo[v];
				}
				if (buttonList[i].proceed())
					return buttonResults;
			}
		}
	}
	
	// General draw function for all menus
	this.draw = function() {
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
	}
	
	// General reset function for all menus
	this.reset = function() {
		buttonResults = {};
	}
}

/**
 *	The Login Menu class for allowing the player to login to the game
 *	
 *	function LoginMenu(inputHandler): The login menu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
 *	function reset(): Resets the menu
 *	function g_login(): Login code
 *	function f_login(): Login code
 *	function validateToken(token): Login code
 *	function getUserInfo(): Login code
 *	function gup(url, name): Login code
**/
subclass(LoginMenu, Menu);
function LoginMenu(inputHandler) {
	Menu.call(this);
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var textList = [];
	var title = spriteManager["logo"][0];
	var returnInfo = {menu: "selection"};
	
	// Google Login stuff
	var OAUTHURL    =   'https://accounts.google.com/o/oauth2/auth?';
	var VALIDURL    =   
		'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';
	var SCOPE       =   'https://www.googleapis.com/auth/userinfo.profile';
	var CLIENTID    =   '929839521017.apps.googleusercontent.com';
	var REDIRECT    =   'http://localhost:8080/oauth.htm';
	var TYPE        =   'token';
	var _url        =   OAUTHURL + 'scope=' + SCOPE + '&client_id=' + 
		CLIENTID + '&redirect_uri=' + REDIRECT + '&response_type=' + TYPE;
	var acToken;
	var tokenType;
	var expiresIn;
	var user;

	//The Google button
	buttonList.push(new Button({signIn: "google"}, inputHandler, "Google", 12, 
		10.75));
	//The Facebook button
	buttonList.push(new Button({signIn: "facebook"}, inputHandler, "Facebook", 
		21, 10.75));
	//The guest button
	buttonList.push(new Button({signIn: "Guest"}, inputHandler, "Guest", 
		16.5, 10.75));
	
	textList.push(new Text(new Pair(10.5, 7.75), new Pair(16, 2.75), null, 38, 
		null, "\n\t Please Log-In (Pop-ups Required)"));
	
	
	/******************* Protected Functions *********************************/
	// Updates the login menu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				//console.log(bInfo);
				buttonList[i].toggleOff();
				if (bInfo.signIn == "google"){
					returnInfo.userType = "Google";
					g_login();
				} else if (bInfo.signIn == "facebook") {
					returnInfo.userType = "Facebook";
					f_login();
				} else {
					returnInfo.userType = "Google";
					returnInfo.userName = "Guest";
					date = new Date();
					returnInfo.userId = date.getTime();
					Menu.uid = date.getTime();
				}
				
			}
		}
		if (returnInfo.userId != null) {
			return returnInfo;
		}
	}
	
	// Draws the login menu
	this.draw = function() {
		// Draw the title
		title.draw(8.5, 0.5);
	
		//Draw each button
		for (var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
		
		//Draw the text
		for(var i = 0; i < textList.length ; ++i) {
			textList[i].draw();	
		}
	}
	
	// Resets the login menu
	this.reset = function() {
		//Resets the effects of the buttons
		returnInfo = {menu: "selection"};
	}
	
	// Google login code
	function g_login(){
		var win         =   window.open(_url, "Login with Google", 
			'width=800, height=600'); 
		var pollTimer   =   window.setInterval(function() { 
			if (win.document.URL.indexOf(REDIRECT) != -1) {
				window.clearInterval(pollTimer);
				var url =   win.document.URL;
				acToken =   gup(url, 'access_token');
				tokenType = gup(url, 'token_type');
				expiresIn = gup(url, 'expires_in');
				win.close();

				validateToken(acToken);
			}
		}, 100);
	}
	
	// Facebook login code
	function f_login(){
		FB.login(function(response){
			if (response.authResponse) {
				FB.api('/me', function(response) {
					returnInfo.userName = response.name;
					returnInfo.userId = response.id;		
					Menu.uid = response.id;
				});
			}
		});
	}
	
	// Code for getting login info
	function validateToken(token){
		$.ajax({
			url: VALIDURL + token,
			data: null,
			success: function(responseText){  
				getUserInfo();
			},  
			dataType: "jsonp"  
		});
	}
	
	// Code for getting login info
	function getUserInfo(){
		$.ajax({
			url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' 
				+ acToken,
			data: null,
			success: function(resp) {
				user    =   resp;
				returnInfo.userName = user.name;
				returnInfo.userId = user.id;
				Menu.uid = user.id;
			},
			dataType: "jsonp"
		});
	}
	
	// Code for getting login info
	//credits: http://www.netlobo.com/url_query_string_javascript.html
	function gup(url, name){
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\#&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( url );
		if( results == null )
			return "";
		else
			return results[1];
	}
}

/**
 *	MainMenu class for selecting which type of game the player wants to play
 *	
 *	function MainMenu(inputHandler): The MainMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
**/
subclass(MainMenu, Menu);
function MainMenu(inputHandler) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var title = spriteManager["logo"][0];
	//The play locally button
	buttonList.push(new Button({menu: "local", local: true}, inputHandler, 
		"Local", 11.5, 9));
	//The play online button
	buttonList.push(new Button({menu: "online", local: false}, inputHandler, 
		"Online", 16.5, 10));
	//The play overworld button
	buttonList.push(new Button({menu: "overWorld", local: true}, inputHandler, 
		"Tutorial", 21.5, 9));
	//The controls screen
	buttonList.push(new Button({menu: "options"}, inputHandler, "Options", .5, 
		variableContainer.gameContainerNumRows - 2));
	//The Statistics screen
	/*buttonList.push(new Button({menu: "statistics"}, inputHandler, "Profile", 
		variableContainer.gameContainerNumColumns - 4.5, 
		variableContainer.gameContainerNumRows - 2));*/
	
	/******************* Protected Functions *********************************/
	// Updates the MainMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				buttonList[i].toggleOff();
				return bInfo;
			}
		}
	}
	
	// Draws the MainMenu
	this.draw = function() {
		// Draw the title
		title.draw(8.5, 0.5);
	
		//Draw each button
		for (var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
	}
}

/**
 *	SearchingMenu class for a menu while searching for online match
 *	
 *	function SearchingMenu(inputHandler): The SearchingMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
 *	function reset(): Resets the menu
**/
subclass(SearchingMenu, Menu);
function SearchingMenu(inputHandler, timer) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var searchTime = 30000; // half a minute
	var searchCountdown = new CountDownTimer(timer, searchTime);
	var buttonList = [];
	//The list of all texts to be drawn to the screen
	var textList = [];
	
	
	//Array to contain image sprites
	 var charImage;
	 //Array to contain information to draw the image sprites
	 var imageInfo;
	 //Rotate speed
	 var rotateSpeed = 10;
	 
	// Back button
	buttonList.push(new Button({back: true}, inputHandler, "Back", .5, .5));
	//This should have text to tell people that it's searching.
	textList.push(new Text(new Pair(16, 2.5), new Pair(6, 8), null, null, null, 
		"Searching for an opponent..."));
	//Adding a picture that spins around in the center to represent searching 
	//for a match
	charImage = spriteManager.button["spin"];
	imageInfo = {col: 18, row: 6, xOffset: 1, yOffset: 1, angle: 0, 
		frameIndex: 0, xDim: 2, yDim: 2};
	
	/******************* Protected Functions *********************************/
	// Updates the SearchingMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				buttonList[i].toggleOff();
				return bInfo;
			}
		}
		if (searchCountdown.isExpired()) {
			return {menu: "noMatchFound"};
		}
		imageInfo.angle = (imageInfo.angle + rotateSpeed) % 360;
	}
	
	// Draws the SearchingMenu
	this.draw = function() {
		for(var i = 0; i < textList.length ; ++i) {
			textList[i].draw();	
		}
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
		charImage.drawRotatedImage(imageInfo.col, imageInfo.row, 
			imageInfo.xOffset, imageInfo.yOffset, imageInfo.angle, 
			imageInfo.frameIndex, imageInfo.xDim, imageInfo.yDim, null);
	}
	
	// Resets the SearchingMenu
	this.reset = function() {
		searchCountdown.reset(searchTime);
	}
}

/**
 *	FoundMatchMenu class for a menu for when match is found
 *	
 *	function FoundMatchMenu(inputHandler): The FoundMatchMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
 *	function reset(): Resets the menu
**/
subclass(FoundMatchMenu, Menu);
function FoundMatchMenu(inputHandler, playerOneRaceName, playerTwoRaceName, 
		returnDest, playerOneName, playerTwoName) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var confirmable = true;
	//Player Races defaults to Angels (2), Witches (0), Steampunk (1)
	var playerOneRace = 2;
	var playerTwoRace = 2;
	
	//Set player one race
	switch (playerOneRaceName){
		case("witch"):
			playerOneRace = 0;
			break;
		case("steampunk"):
			playerOneRace = 1;
			break;
		case("angel"):
			playerOneRace = 2;
			break;
	}
	//Set player two race
	switch(playerTwoRaceName){
		case("witch"):
			playerTwoRace = 0;
			break;
		case("steampunk"):
			playerTwoRace = 1;
			break;
		case("angel"):
			playerTwoRace = 2;
			break;
	}
	
	//Array to contain image sprites
	 var charImage = [];
	 //Array to contain information to draw the image sprites
	 var imageInfo = [];
	 //Array to contain text to be drawn
	 var textList = [];
	
	var backButton = new Button({menu: returnDest}, inputHandler, "Back", .5, 
		.5);
	charImage.push(spriteManager["charPicts"]
		[variableContainer.races[playerOneRace]]);
	imageInfo.push({col: 9, row: 2.5, xDim: 5, yDim: 8});
	charImage.push(spriteManager["charPicts"]
		[variableContainer.races[playerTwoRace]]);
	imageInfo.push({col: 23, row: 2.5, xDim: 5, yDim: 8});
	textList[0] = (new Text(new Pair(9, 1.0), new Pair(5, 1), null, null, 
		null, playerOneName));
	textList[1] = (new Text(new Pair(23, 1.0), new Pair(5, 1), null, null, 
		null, playerTwoName));
	var confirmButton = new Button({onlineConfirm: true}, inputHandler, 
		"Confirm", 16.5, 11, spriteManager.button.toggle, 4, 1.5, true);
	this.reset(playerOneRaceName, playerTwoRaceName, playerOneName, 
		playerTwoName);
	
	/******************* Protected Functions *********************************/
	// Updates the FoundMatchMenu
	this.update = function() {
		var bInfo = backButton.update();
		if (bInfo != null) {
			backButton.toggleOff();
			confirmButton.toggleOff();
			return bInfo;
		}
		if (confirmable) {
			bInfo = confirmButton.update();
			if (bInfo != null) {
				confirmable = false;
				return bInfo;
			}
		}
	}
	
	// Draws the FoundMatchMenu
	this.draw = function() {
		for(var i = 0; i < charImage.length ; ++i) {
			charImage[i].draw(imageInfo[i].col, imageInfo[i].row, 0, 
				imageInfo[i].xDim, imageInfo[i].yDim);
		}
		for(var i = 0; i < textList.length ; ++i) {
			textList[i].draw();	
		}
		backButton.draw();
		confirmButton.draw();
	}
	
	// Resets the FoundMatchMenu
	this.reset = function(playerOneTempRace, playerTwoTempRace, 
			playerOneTempName, playerTwoTempName) {
		playerOneName = playerOneTempName;
		playerTwoName = playerTwoTempName;
		backButton.toggleOff();
		confirmButton.toggleOff();
		
		//Set player one race
		switch (playerOneTempRace){
			case("witch"):
				playerOneRace = 0;
				break;
			case("steampunk"):
				playerOneRace = 1;
				break;
			case("angel"):
				playerOneRace = 2;
				break;
		}
		//Set player two race
		switch(playerTwoTempRace){
			case("witch"):
				playerTwoRace = 0;
				break;
			case("steampunk"):
				playerTwoRace = 1;
				break;
			case("angel"):
				playerTwoRace = 2;
				break;
		}
		charImage[0] = (spriteManager["charPicts"]
			[variableContainer.races[playerOneRace]]);
		charImage[1] = (spriteManager["charPicts"]
			[variableContainer.races[playerTwoRace]]);
		textList[0].changeText(playerOneName);
		textList[1].changeText(playerTwoName);
		confirmable = true;
	}
}

/**
 *	DidNotFindMatchMenu class for a menu when no match is found
 *	
 *	function DidNotFindMatchMenu(inputHandler): The DidNotFindMatchMenu 
 *		constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
**/
subclass(DidNotFindMatchMenu, Menu);
function DidNotFindMatchMenu(inputHandler) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var textList = [];
	
	//This button send the User back to the Start Screen, placeholder sprite
	buttonList.push(new Button({menu: "selection"}, inputHandler, "Cancel", 
		20.75, 9));
	//This button should send the User back to the Online Character Selection 
	//Screen, placeholder sprite
	buttonList.push(new Button({menu: "online"}, inputHandler, "Retry", 10.75, 
		9));
	//This should have text to tell people that no match has been found yet.
	textList.push(new Text(new Pair(12.75, 4.5), new Pair(10, 2), null, null, 
		null, "\tNo match found at this time."));
	
	/******************* Protected Functions *********************************/
	// Updates the DidNotFindMatchMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				buttonList[i].toggleOff();
				return bInfo;
			}
		}
	}
	
	// Draws the DidNotFindMatchMenu
	this.draw = function() {
		for(var i = 0; i < textList.length ; ++i) {
			textList[i].draw();	
		}
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
	}
}

/**
 *	LocalMenu class for a menu to create local matches
 *	
 *	function LocalMenu(inputHandler): The LocalMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
 *	function concatResults(newInfo): Concats results into buttonResults
 *	function reset(): Resets the menu
**/
subclass(LocalMenu, Menu);
function LocalMenu(inputHandler) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var buttonListLeft = [];
	var buttonListRight = [];
	var buttonResults = {};
	var charOneImage = null;
	var imgOneInfo = {col: 7, row: 2.5, xDim: 5, yDim: 8};
	var charOneInfo = new Text(new Pair(1, 2.5), new Pair(6, 8), null, null, 
		null, "");
	var charTwoImage = null;
	var imgTwoInfo = {col: 25, row: 2.5, xDim: 5, yDim: 8};
	var charTwoInfo = new Text(new Pair(30, 2.5), new Pair(6, 8), null, null, 
		null, "");
	var toggledLeft = null;
	var toggledRight = null;
	
	// Back button
	var backButton = new Button({back: true}, inputHandler, "Back", .5, .5);
	// Witch selector button Player one
	buttonListLeft[0] = (new Button({raceOne: variableContainer.races[0]}, 
		inputHandler, null, 13, 2.5, spriteManager["raceButton"]
		[variableContainer.races[0]], 4, 1.5, true));
	// Witch selector button Player two
	buttonListRight[0] = (new Button({raceTwo: variableContainer.races[0]}, 
		inputHandler, null, 20, 2.5, spriteManager["raceButton"]
		[variableContainer.races[0]], 4, 1.5, true));
	// Steampunk selector button Player one
	buttonListLeft[1] = (new Button({raceOne: variableContainer.races[1]}, 
		inputHandler, null, 13, 5.75, spriteManager["raceButton"]
		[variableContainer.races[1]], 4, 1.5, true));
	// Steampunk selector button Player two
	buttonListRight[1] = (new Button({raceTwo: variableContainer.races[1]}, 
		inputHandler, null, 20, 5.75, spriteManager["raceButton"]
		[variableContainer.races[1]], 4, 1.5, true));
	// Angel selector button Player one
	buttonListLeft[2] = (new Button({raceOne: variableContainer.races[2]}, 
		inputHandler, null, 13, 9, spriteManager["raceButton"]
		[variableContainer.races[2]], 4, 1.5, true));
	// Angel selector button Player two
	buttonListRight[2] = (new Button({raceTwo: variableContainer.races[2]}, 
		inputHandler, null, 20, 9, spriteManager["raceButton"]
		[variableContainer.races[2]], 4, 1.5, true));
	var raceOneAI = new SequenceButton([{aiOne: false}, 
		{aiOne: true, aiOneDiff: 200}, {aiOne: true, aiOneDiff: 150}, 
		{aiOne: true, aiOneDiff: 100}, {aiOne: true, aiOneDiff: 50}], 
		inputHandler, 14, .5, spriteManager.button["ai"], 2, 1, 5);
	var raceTwoAI = new SequenceButton([{aiTwo: false}, 
		{aiTwo: true, aiTwoDiff: 200}, {aiTwo: true, aiTwoDiff: 150}, 
		{aiTwo: true, aiTwoDiff: 100}, {aiTwo: true, aiTwoDiff: 50}], 
		inputHandler, 21, .5, spriteManager.button["ai"], 2, 1, 5);
	// Confirmation Button
	var confirmButton = new Button({game:"selection"}, inputHandler, "Confirm",
		16.5, 11);
	
	/******************* Protected Functions *********************************/
	// Updates the LocalMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonListLeft.length; ++i){
			bInfo = buttonListLeft[i].update();
			if (bInfo != null) {
				if (bInfo.raceOne == null) {
					toggledLeft = null;
					charOneImage = null;
					charOneInfo.changeText("");
				} else {
					if (toggledLeft != null)
						toggledLeft.toggleOff();
					toggledLeft = buttonListLeft[i];
					charOneImage = spriteManager["charPicts"]
						[variableContainer.races[i]];
					charOneInfo.changeText(
						variableContainer.raceDescriptions[0]
						[variableContainer.races[i]]);
				}
				this.concatResults(bInfo);
			}
		}
		for(var i = 0; i < buttonListRight.length; ++i){
			bInfo = buttonListRight[i].update();
			if (bInfo != null) {
				if (bInfo.raceTwo == null) {
					toggledRight = null;
					charTwoImage = null;
					charTwoInfo.changeText("");
				} else {
					if (toggledRight != null)
						toggledRight.toggleOff();
					toggledRight = buttonListRight[i];
					charTwoImage = spriteManager["charPicts"]
						[variableContainer.races[i]];
					charTwoInfo.changeText(
						variableContainer.raceDescriptions[1]
						[variableContainer.races[i]]);
				}
				this.concatResults(bInfo);
			}
		}
		// Updates the raceOneAI button
		bInfo = raceOneAI.update();
		if (bInfo != null) {
			this.concatResults(bInfo);
		}
		// Updates the raceTwoAI button
		bInfo = raceTwoAI.update();
		if (bInfo != null) {
			this.concatResults(bInfo);
		}
		bInfo = backButton.update();
		if (bInfo != null) {
			this.concatResults(bInfo);
			backButton.toggleOff();
			return buttonResults;
		}
		if (toggledLeft && toggledRight) {
			bInfo = confirmButton.update();
			if (bInfo != null) {
				this.concatResults(bInfo);
				confirmButton.toggleOff();
				return buttonResults;
			}
		}
	}
	
	// Concatenates results
	this.concatResults = function(newInfo) {
		for (var v in newInfo) {
			buttonResults[v] = newInfo[v];
		}
	}
	
	// Draws the LocalMenu
	this.draw = function() {
		if (charOneImage)
			charOneImage.draw(imgOneInfo.col, imgOneInfo.row, 0, 
				imgOneInfo.xDim, imgOneInfo.yDim);
		if (charTwoImage)
			charTwoImage.draw(imgTwoInfo.col, imgTwoInfo.row, 0, 
				imgTwoInfo.xDim, imgTwoInfo.yDim);
		charOneInfo.draw();
		charTwoInfo.draw();
		for(var i = 0; i < buttonListLeft.length ; ++i) {
			buttonListLeft[i].draw();	
		}
		for(var i = 0; i < buttonListRight.length ; ++i) {
			buttonListRight[i].draw();	
		}
		raceOneAI.draw();
		raceTwoAI.draw();
		backButton.draw();
		
		if (toggledLeft && toggledRight)
			confirmButton.draw();
	}
	
	// Resets the LocalMenu
	this.reset = function() {
		buttonResults = {};
		if (toggledLeft) {
			toggledLeft.toggleOff();
			toggledLeft = null;
			charOneImage = null;
			charOneInfo.changeText("");
		}
		if (toggledRight) {
			toggledRight.toggleOff();
			toggledRight = null;
			charTwoImage = null;
			charTwoInfo.changeText("");
		}
		raceOneAI.toggleOff();
		raceTwoAI.toggleOff();
	}
}

/**
 *	OnlineMenu class for a menu to pick your race for an online match
 *	
 *	function OnlineMenu(inputHandler): The OnlineMenu constructor
 *	function update(): Updates the menu for input
 *	function concatResults(results): Concats to buttonResults
 *	function draw(): Draws the menu
 *	function reset(): Resets the menu
**/
subclass(OnlineMenu, Menu);
function OnlineMenu(inputHandler) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var buttonResults = {};
	var charImage = null;
	var imgInfo = {col: 16.5, row: 2.5, xDim: 5, yDim: 8};
	var charInfo = new Text(new Pair(8.5, 2.5), new Pair(6, 8), null, null, null,
		"");
	var toggled = null;
	
	// Back button
	var backButton = new Button({back: true}, inputHandler, "Back", .5, .5);
	// Witch selector button
	buttonList[0] = (new Button({raceOne: variableContainer.races[0]}, 
		inputHandler, null, 25, 2.5, spriteManager["raceButton"]
		[variableContainer.races[0]], 4, 1.5, true));
	// Steampunk selector button
	buttonList[1] = (new Button({raceOne: variableContainer.races[1]}, 
		inputHandler, null, 25, 5.75, spriteManager["raceButton"]
		[variableContainer.races[1]], 4, 1.5, true));
	// Angel selector button
	buttonList[2] = (new Button({raceOne: variableContainer.races[2]}, 
		inputHandler, null, 25, 9, spriteManager["raceButton"]
		[variableContainer.races[2]], 4, 1.5, true));
	// Confirmation Button
	var confirmButton = new Button({menu: "search"}, inputHandler, "Confirm", 
		16.5, 11);
	
	/******************* Protected Functions *********************************/
	// Updates the OnlineMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				if (bInfo.raceOne == null) {
					toggled = null;
					charImage = null;
					charInfo.changeText("");
				} else {
					if (toggled != null)
						toggled.toggleOff();
					toggled = buttonList[i];
					charImage = spriteManager["charPicts"]
						[variableContainer.races[i]];
					charInfo.changeText(variableContainer.raceDescriptions[0]
						[variableContainer.races[i]]);
				}
				this.concatResults(bInfo);
			}
		}
		bInfo = backButton.update();
		if (bInfo != null) {
			this.concatResults(bInfo);
			backButton.toggleOff();
			return buttonResults;
		}
		if (toggled) {
			bInfo = confirmButton.update();
			if (bInfo != null) {
				this.concatResults(bInfo);
				confirmButton.toggleOff();
				return buttonResults;
			}
		}
	}
	
	// Concatenates into buttonResults
	this.concatResults = function(newInfo) {
		for (var v in newInfo) {
			buttonResults[v] = newInfo[v];
		}
	}
	
	// Draws the OnlineMenu
	this.draw = function() {
		if (charImage)
			charImage.draw(imgInfo.col, imgInfo.row, 0, imgInfo.xDim, 
				imgInfo.yDim);
		charInfo.draw();
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
		backButton.draw();
		
		if (toggled) 
			confirmButton.draw();
	}
	
	// Resets the OnlineMenu
	this.reset = function() {
		buttonResults = {};
		if (toggled) {
			toggled.toggleOff();
			toggled = null;
			charImage = null;
			charInfo.changeText("");
		}
	}
}

/**
 *	StatisticsMenu class for the user's playing statistics
 *	
 *	function StatisticsMenu(inputHandler): The StatisticsMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
**/
subclass(StatisticsMenu, Menu);
function StatisticsMenu(inputHandler){
	Menu.call(this);
	
	// Menu.uid is the unique id for the player
	var url = 'http://localhost:8080/';
	var socket = io.connect(url);
	
	socket.emit('load', Menu.uid);
	socket.on('stat', function(result){
	
		/* "result" has all the info of the player
		 * you might want to disable stat for guests
		 * if want to test it with a guest account
		 * will have to login as guest and click 
		 * on online so that it creates a player
		 * account in the database, otherwise it will
		 * not print out any info because the account 
		 * is not created yet.
		 */
		console.log(result.name);
		console.log(result.id);
		console.log(result.won);
		console.log(result.lost);
	});
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var textList = [];
	
	// Back button
	buttonList.push(new Button({back: true}, inputHandler, "Back", .5, .5));
	
	textList.push(new Text(new Pair(15, 2), new Pair(5, 9.5), null, null, 
		null, "\n\t\tVictories\n\n\t\tDefeats\n\n\t\tWitch\n\n\t\tAngel\n\n\t\tSteampunk"));

	
	/******************* Protected Functions *********************************/
	// Updates the CreditMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				buttonList[i].toggleOff();
				return bInfo;
			}
		}
	}
	
	// Draws the CreditMenu
	this.draw = function() {

		//Draw each button
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
		//Draw the text
		for(var i = 0; i < textList.length ; ++i) {
			textList[i].draw();	
		}
	}
}


/**
 *	CreditMenu class for the credits to the game
 *	
 *	function CreditMenu(inputHandler): The CreditMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
**/
subclass(CreditMenu, Menu);
function CreditMenu(inputHandler){
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var buttonList = [];
	var textList = [];
	
	// Back button
	buttonList.push(new Button({back: true}, inputHandler, "Back", .5, .5));
	
	textList.push(new Text(new Pair(6.75, 2), new Pair(10.5, 9.5), null, null, 
		null, "\tJameka March - Project Lead\n\tRyan Cook - Engineering Lead\n\tGabriel Rivera - Producer\n\tWesley Hsiao - QA Lead\n\tTe Wan Kim - Gameplay Programmer/Music Liaison\n\tBradley Monajjemi - Gameplay Programmer\n\tLeqi Lu - Database Programmer\n\tMike Hultquist - AI Specialist\n\tBrant Arata - Networking Assistance"));
	
	textList.push(new Text(new Pair(19.75, 2), new Pair(10.5, 9.5), null, 
		null, null, "\tUmi Hoshijima - Composer\n\tJacob Pernell - Composer\n\tJake Bratrude - Composer\n\tColin Eldred-Cohen - Writer\n\tRyan Beck - Art Coordinator\n\tBrittney Sager - Artist\n\tKirsten Andersen - Artist\n\tAmanda Lee - Artist\n\tEdith Pastrano - Artist"));
	
	/******************* Protected Functions *********************************/
	// Updates the CreditMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				buttonList[i].toggleOff();
				return bInfo;
			}
		}
	}
	
	// Draws the CreditMenu
	this.draw = function() {
		//Draw each button
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
		//Draw the text
		for(var i = 0; i < textList.length ; ++i) {
			textList[i].draw();	
		}
	}
}

/**
 *	OptionsMenu class so the player may logout or mute the game
 *	
 *	function OptionsMenu(inputHandler): The OptionsMenu constructor
 *	function update(): Updates the menu for input
 *	function draw(): Draws the menu
**/
subclass(OptionsMenu, Menu);
function OptionsMenu(inputHandler) {
	Menu.call(this);
	
	/******************* Private Variables ***********************************/
	var toggle = false;
	var buttonList = [];
	var textList = [];
	var muteButton = new Button({sound: true}, inputHandler, "Mute", 10.25, variableContainer.gameContainerNumRows/2, 
		spriteManager.button.toggle, 4, 1.5, true);
	buttonList.push(new Button({back: true}, inputHandler, "Back", .5, .5));
	buttonList.push(new Button({menu: "login"}, inputHandler, "Logout", 20.25, 
		variableContainer.gameContainerNumRows/2));
	//The credit screen
	buttonList.push(new Button({menu: "credits"}, inputHandler, "Credits", 
		variableContainer.gameContainerNumColumns/2 - 3, 
		variableContainer.gameContainerNumRows/2));
	
	
	/******************* Protected Functions *********************************/
	// Updates the OptionsMenu
	this.update = function() {
		var bInfo = null;
		//checks each button in the menu list to see if they are being pressed
		for(var i = 0; i < buttonList.length; ++i){
			bInfo = buttonList[i].update();
			if (bInfo != null) {
				return bInfo;
			}
		}
		
		bInfo = muteButton.update();
		if (bInfo != null){
			toggle = !toggle;
			SoundJS.setMute(toggle);
		}

	}
	
	// Draws the OptionsMenu
	this.draw = function() {
		//Draw each button
		for(var i = 0; i < buttonList.length ; ++i) {
			buttonList[i].draw();	
		}
		muteButton.draw();
	}
}