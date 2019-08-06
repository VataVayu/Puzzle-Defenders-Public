/**
* Race abstract class, used for setting the essential functions and variables
* as a template for the other races.
*
* function Race(name (String), colRow (pair)): 
*			   Initialize the Race class for template. 
* function getName(): Returns the name of race.
* function getColRow(): Return the column/row pair for the race's position
* function getBoard(): returns board of the race
* function setBoard(): sets the board of the race
* function getPlayerNum(): returns the playerNum, used to metrics
* function abilityA(): Abstract function for race ability A
* function abilityB(): Abstract function for race ability B
* function update(): Abstract update class for class to be implemented.
*
**/

function Race(colRow, name) {	
	/************************* Private Variables *****************************/
	var board; // initialized later via setter
	var playerNum = 0; // used for metrics collection

	/***************************** Privileged Functions **********************/	
	// Returns the name of the race, "witch" "steampunk" or "angel"
	this.getName = function() {
		return name;
	}
	
	//  Return the column/row pair for the race's position	
    this.getColRow = function(){
        return colRow;
    }
	
	// Get the board assigned to the race
	this.getBoard = function() {
		return board;
	}

	// Set the board assigned to the race
	this.setBoard = function(newBoard) {
		board = newBoard;
		playerNum = (board.getPlayerSide() == "left" ? 1 : 2);
	}
	
	// Return the playerNum, needed for metrics collection
	this.getPlayerNum = function() {
		return playerNum;
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
}

// Export the (abstract) class for other classes to use
module.exports = Race;
