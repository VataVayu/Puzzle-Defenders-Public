var Utilities = require('../libraries/Utilities.js');
var VariableContainer = require('../libraries/VariableContainer.js');


/**
 * Orb class, which contains functionality for creating the orb and
 * updating it's position on the board
 *
 *	function Orb(colRow (pair), type (enum elemental type), gravity (int), 
 *			playerOne): orb constructor.
 *	function setFairySpawned(): increments the value fairySpawned
 *	function getFairySpawned(): Returns the value fairySpawned
 *	function setToAttack(): sets the orb matched to attack
 *	function setToShield(): sets the orb matched to shield
 *	function setToAttackandShield(): sets the orb matched to attack and shield
 *	function getMechanicType(): Returns mechanicType
 *	function setToInactive(): Sets orb to not matched
 *	function getCountDown(): Returns countdown
 *	function setCountDown(setTime): Sets countdown to setTime
 *	function getColRow(): Returns the pair colRow
 *	function setMemberMatched(match): Sets orb as part of match
 *	function getMemberMatched(): Returns memberMatched
 *	function setReadyMatched(match (boolean)): Sets the value of matched with 
 *			match.
 *	function getReadyMatched(): Returns matched value.
 *	function getPrevDestinationColRow(): returns a pair of the prevDestination
 *  		pair divided by cellDimensions pair.
 *	function setPosition(posX, posY): Sets the orbs current position
 *	function setColPosition(col): Sets the orbs col position
 *  function setDestination(destination (pair)): Calls calcStepDisntance with 
 *			the destination pair to calculate the next destination and set
 *			the currStepDistance and prevStepDistance. 
 *	function isMoving(): Returns if the orb is moving horizontally
 *	function isMovingVertically(): Returns if the orb is moving vertically
 *	function getGravity(): Returns the gravity set on this orb
 *	function setGravity(newGravity(int)): Sets the gravity on this orb, and 
 *			flags that the gravity has been changed.
 *	function getType(): Returns the elemental type of the orb
 *	function setType(newType): Sets the elemental type of the orb
 *  function isSwapping(): Returns the value of Swapping. 
 *  function setSwapping(swap (boolean)): Set the value of Swapping.
 *	function isSacrificed(): Returns a boolean of sacraficed.
 *	function sacrifice(): Set its type to sacrifice and it sacrafice to true.
 * 	function update(currDestination): Updates the orbs position and collision
 *			with other orbs and to its destination.
 **/

function Orb(colRow, type, gravity, playerOne) {	
	var prevStepDistance = new Utilities.Pair(null, null); 
	var currStepDistance = new Utilities.Pair(null, null);
	var prevDestination = new Utilities.Pair(colRow.getFirst(), 
		colRow.getSecond()); 
	var gravityChanged = false;
	var swapping = false;
	var sacrificed = false;
	//for falling orbs only
	var readyMatched = false;
	//for witch orb set off
	var memberMatched = false;
	var fairySpawned = 0;
	
	
	//null orb is inactive
	//0 is attack
	//1 is shield
	//2 is shield/attack
	var mechanicType = null;
	//countDown is not set
	//if not zero, waiting for activation.
	var countDown = null;
	
	var thrown = false;
	
	// Increments fairySpawned
	this.setFairySpawned = function() {
		++fairySpawned;
	}
	
	// Gets fairySpawned
	this.getFairySpawned = function() {
		return fairySpawned;
	}
	
	// Set match to attack
	this.setToAttack = function() {
		if (mechanicType == 1) {
			mechanicType = 2
		} else {
			mechanicType = 0;
		}
		countDown = VariableContainer.activationDelay;
	}
	
	// Set match to shield
	this.setToShield = function() {
		if (mechanicType == 0) {
			mechanicType = 2
		} else {
			mechanicType = 1;
		}
		countDown = VariableContainer.activationDelay;
	}	
	
	// Set match to attack and shield
	this.setToAttackandShield = function() {
		mechanicType = 2;
		countDown = VariableContainer.activationDelay;
	}
	
	// Returns what type of match it is
	this.getMechanicType = function() {
		return mechanicType;
	}
	
	// Set match to inactive
	this.setToInactive = function() {
		mechanicType = null;
	}
	
	// Return countDown
	this.getCountDown = function() {
		return countDown;
	}
	
	// Sets countDown
	this.setCountDown = function(setTime) {
		countDown = setTime;
	}
	
	// Returns colRow
	this.getColRow = function() {
		return colRow;
	}
	
	// Set as part of group
	this.setMemberMatched = function(match) {
		memberMatched = match;
	}
	
	// Returns true if part of group
	this.getMemberMatched = function() {
		return memberMatched;
	}
	
	// Sets for falling orbs for match detection
	this.setReadyMatched = function(match) {
		readyMatched = match;
	}
	
	// Returns if a falling orb for match detection
	this.getReadyMatched = function() {
		return readyMatched;
	}
	
	// Returns the previous destination colRow
	this.getPrevDestinationColRow = function() {
		return prevDestination;
	}
	
	// Sets the current position colRow
	this.setPosition = function(posX, posY) {
		prevDestination.setFirst(posX);
		prevDestination.setSecond(posY);
		colRow.setFirst(posX);
		colRow.setSecond(posY);
	}
	
	// Sets current col position and previous col position
	this.setColPosition = function(col) {
		prevDestination.setFirst(col);
		colRow.setFirst(col);
	}
	
	// Sets previous destination colRow
	this.setDestination = function(destinationX, destinationY) {
		calcStepDistance(destinationX, destinationY);
		prevStepDistance = currStepDistance;
		prevDestination.setFirst(destinationX);
		prevDestination.setSecond(destinationY);
	}
	
	// Returns true if orb is moving
	this.isMoving = function() {
		return colRow.getFirst() != prevDestination.getFirst();
	}
	
	// Returns true if orb is moving vertically
	this.isMovingVertically = function() {
		return colRow.getSecond() != prevDestination.getSecond();
	}
	
	// Returns the orb gravity
	this.getGravity = function() {
		return gravity;
	}
	
	// Sets the orb gravity
	this.setGravity = function(newGravity) {
		gravity = newGravity;
		gravityChanged = true;
	}
	
	// Returns the orb type
	this.getType = function() {
		return type;
	}
	
	// Sets the orb type
	this.setType = function(newType) {
		type = newType;
		if (type == VariableContainer.typeEnum[4]) {
			type = randomType();
		}
	}
	
	// Returns true if swapping
	this.isSwapping = function() {
		return swapping;
	}
	
	// Sets swapping
	this.setSwapping = function(swap) {
		swapping = swap;
	}
	
	// Returns true if sacrifice orb
	this.isSacrificed = function() {
		return sacrificed;
	}
	
	// Sets sacrifice
	this.sacrifice = function() {
		sacrificed = true;
	}
	
	// Calls update on the orb
	// The orb will update its x and y position if moving
	this.update = function(currDestinationX, currDestinationY) {
		// Countdown until match is made
		if (countDown > 0) {
			countDown -= 1;
		}
		
		if (currDestinationX == null || currDestinationY == null) {
			currDestinationX = prevDestination.getFirst();
			currDestinationY = prevDestination.getSecond();
		}
		
		// Updates the position of the orb
		if (colRow.getFirst() != currDestinationX || colRow.getSecond() != 
				currDestinationY) {
			if ((prevDestination.getFirst() != currDestinationX) || 
				(prevDestination.getSecond() != currDestinationY) || 
				 gravityChanged) {//If destination changed or gravity changed
		
				calcStepDistance(currDestinationX, currDestinationY);
				colRow.setFirst(colRow.getFirst() + 
					currStepDistance.getFirst());
				colRow.setSecond(colRow.getSecond() + 
					currStepDistance.getSecond());
				prevStepDistance = currStepDistance;
				gravityChanged = false
			} else { 
			// if destination did not change and gravity did not change, 
			// aka. nothing changed, increment position with previously 
			// calculated stepDistance
				colRow.setFirst(colRow.getFirst() + 
					prevStepDistance.getFirst());
				colRow.setSecond(colRow.getSecond() + 
					prevStepDistance.getSecond());
			}
			
			prevDestination.setFirst(currDestinationX);
			prevDestination.setSecond(currDestinationY);
			
			if (gravity > 0) {
			//all four of these cases address whether or not the position has 
			//exceeded the destination. if so, set the position to the 
			//destination
				if (currStepDistance.getFirst() >= 0 && 
						currStepDistance.getSecond() >= 0) { 
					//orb is moving right and downwards, or straight right, or
					//straight down
					if (colRow.getFirst() >= currDestinationX && 
							colRow.getSecond() >= currDestinationY) { 
						//if exceeds right and below
						colRow.setFirst(currDestinationX);
						colRow.setSecond(currDestinationY);
					}
				} else if (currStepDistance.getFirst() >= 0 && 
						currStepDistance.getSecond() <= 0) { 
						//orb is moving right and upwards, or straight right, 
						//or straight up
					if (colRow.getFirst() >= currDestinationX && 
							colRow.getSecond() <= currDestinationY) { 
						//if exceeds right and above
						colRow.setFirst(currDestinationX);
						colRow.setSecond(currDestinationY);
					}
				} else if (currStepDistance.getFirst() <= 0 && 
						currStepDistance.getSecond() >= 0) { 
					//orb is moving left and downwards, or straight left, 
					//or straight down
					if (colRow.getFirst() <= currDestinationX && 
							colRow.getSecond() >= currDestinationY) { 
						//if exceeds left and below
						colRow.setFirst(currDestinationX);
						colRow.setSecond(currDestinationY);
					}
				} else if (currStepDistance.getFirst() <= 0 && 
						currStepDistance.getSecond() <= 0) { 
					//orb is moving left and upwards, or straight left, or 
					//straight up
					if (colRow.getFirst() <= currDestinationX && 
							colRow.getSecond() <= currDestinationY) { 
						//if exceeds left and above
						colRow.setFirst(currDestinationX);
						colRow.setSecond(currDestinationY);
					}
				} 
			}
		}
	}
	
	/************************* Private Functions *****************************/
	
	//This now returns the enum object for each type found on the 
	//varpage
	function randomType() {
		var typeNumber = Math.floor(Math.random() * 
			(VariableContainer.typeEnum.length - 1));
		return VariableContainer.typeEnum[typeNumber];
	}
	
	//take the normal vector of the StepDistance and multiply by gravity scalar
	function calcStepDistance(currDestinationX, currDestinationY) {
		currStepDistance.setFirst(gravity * (currDestinationX - 
			colRow.getFirst()) / Math.sqrt(Math.pow(currDestinationX - 
			colRow.getFirst(), 2) + Math.pow(currDestinationY - 
			colRow.getSecond(), 2)));
		currStepDistance.setSecond(gravity * (currDestinationY - 
			colRow.getSecond()) / Math.sqrt(Math.pow(currDestinationX - 
			colRow.getFirst(), 2) + Math.pow(currDestinationY - 
			colRow.getSecond(), 2)));
	}
}

module.exports = Orb;