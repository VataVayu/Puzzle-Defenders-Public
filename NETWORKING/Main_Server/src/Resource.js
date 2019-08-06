// Import required files to run this class
var VariableContainer = require('../libraries/VariableContainer.js');
var databaseVariables = require('../libraries/DatabaseVariables.js');

/**
 * Resource class for structuring the resource object, sprite, health,
 * and functionality in game.
 * 
 * function Resource(colRow (pair), isPlayerOne (boolean)): 
 *				Initialize the resource with position, type, animation, and sound.
 * function damage(): Reduce the health of resource. Also update the database 
 *				about when the resouce was destroyed
 * function getColRow(): Return the column/row pair for the resource
 * function getHealth(): Return the current health of the resource
 * function update(): Resets the current health of the resource to maxHealth
 * function isAlive(): Returns a boolean whether or not the resource is alive
 *
 **/
function Resource(colRow, isPlayerOne, timer) {
	/************************* Private Variables *****************************/
	var playerNum = (isPlayerOne) ? 1 : 2; 	
	var yPos = colRow.getSecond() - VariableContainer.borderDimension - VariableContainer.uiDimension;
	var health = VariableContainer.maxResourceHealth;
	
	/***************************** Privileged Functions **********************/
	this.damage = function() {
		--health;
		// Update database on when this resource was destroyed
		if(health <= 0 ) {
			databaseVariables[playerNum].resourceDeath[yPos] = timer.getElapsedTime();
		}
	}
	
	// Return the column/row pair for the resource
	this.getColRow = function() {
		return colRow;
	}
	
	// Return the current health of the resource
	this.getHealth = function() {
		return health;
	}
	
	// Returns a boolean whether or not the resource is alive
	this.isAlive = function() {
		return health > 0;
	}
}

// Export the class for other classes to use
module.exports = Resource;