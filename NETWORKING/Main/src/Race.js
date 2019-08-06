/**
* Race abstract class, used for setting the essential functions and variables
* as a template for the other races.
*
* function Race(name (String), colRow (pair)): 
*			   Initialize the Race class for template. 
* function getName(): Returns the name of race.
* function getColRow(): Return the column/row pair for the race's position
* function setRow(row (int)): Set the new row for race 
* function getBoard(): returns board of the race
* function setBoard(): sets the board of the race
* function getBoardArray(): returns the board array for AI
* function getSprite(): Returns the sprite for the race
* function getIndexFrame(): Get the sprite's indexFrame
* function setIndexFrame(): Set the sprite's indexFrame
* function getSpriteTimer():  Get the timer for the sprite animations
* function setSpriteTimer(timer (Timer)): Set the timer for the sprite animations
* function abilityA(): Abstract function for race ability A
* function abilityB(): Abstract function for race ability B
* function update(): Abstract update class for class to be implemented.
* function draw(): Draw race sprite on screen.
*
**/

function Race(name, colRow) {	
	
	/************************* Private Variables *****************************/
	var board; // is initiliazed later via setter
	var indexFrame = 0; // used to determine what frame to draw the sprite at
	var raceSprite = spriteManager["race"][name]; // the race sprite itself
	var spriteTimer; // the timer used to delay between switching to a new frame
	
	/***************************** Privileged Functions **********************/	
	// Returns the name of the race, "witch" "steampunk" or "angel"
	this.getName = function() {
		return name;
	}
	
	//  Return the column/row pair for the race's position
	this.getColRow = function() {
        return colRow;
    }
	
	// Sets the row for the race, since the column never changes
	this.setRow = function(row) {
		colRow.setSecond(row);
	}
	
	// Get the board assigned to the race
	this.getBoard = function() {
		return board;
	}
	
	// Set the board assigned to the race
	this.setBoard = function(newBoard) {
		board = newBoard;
	}
   
	// Needed by AI to get the board array
    this.getBoardArray = function() {
        return board.getBoardArray();
    }	
	// Get the race's sprite
	this.getSprite = function() {
		return raceSprite;
	}
	
	// Get the sprite's indexFrame
	this.getIndexFrame = function() {
		return indexFrame;
	}
	
	// Set the sprite's indexFrame
	this.setIndexFrame = function(newIndex){
		indexFrame = newIndex;
	}	

	// Get the timer for the sprite animations
	this.getSpriteTimer = function() {
		return spriteTimer;
	}
	
	// Set the countdown timer for the sprite animations
	this.setSpriteTimer = function(timer) {
		spriteTimer = new CountDownTimer(timer, 0);
	}
	
	// Abstract function for abilityA
	this.abilityA = function() {
	}
	
	// Abstract function for abilityB
	this.abilityB = function() {
	}
	
	// Abstract update
	this.update = function() {
	}

	// Abtract draw
	this.draw = function() {					 
	}
}