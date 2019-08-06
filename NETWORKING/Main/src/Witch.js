/**
 * This class is what defines Witch's mechanics, movement, and abilities.
 * This class is a subclass of Race.
 *
 * function Witch(colRow (pair)): Constructor  
 *		of Witch class.
 *
 * function resetOrbQueue() : This function will reset the orbQueue to have nothing in it.
 *
 * function getPairedItems() : This function returns a pair that returns how many orbs are 
 * 		left in the queue and what type they are. 
 *
 * function setRaceAbilityInfo(abilityInfoString) : This function will return the 
 * 		information for the race. It was used for debug, but we're keeping it here just in 
 * 		case. Until then it remains empty.
 *
 * function moveVertically(dir, isPaused) : This function checks to see if the player is 
 * 		allowed to move into the next row. 
 *
 * function abilityA(isPaused): This function outlines the Witch's ability to pick up one 
 * 		of the orbs from the board and putting it into the character's list or "hand".
 *
 * function abilityB(isPaused): This function governs the Witch's ability to throw orbs 
 * 		from the orbList onto the board.
 *
 * function update(): This updates the client's Witch character. Right now, it only resets 
 * 		their the character's sprite back to it's idle state. 
 *
 * function draw(): Draws the Witch, mainly drawing the dot sprites for player to see 
 * 		where they are doing their match.
 **/
 
subclass(Witch, Race);
function Witch(colRow) {
	
	Race.call(this, "witch", colRow, variableContainer.witchResourceHealth);
	
	/*private variables*/
	var orbQueue = [];
	var queueType = null;
	
	this.isOrbQueueEmpty = function() {
		if(orbQueue.length > 0) {
			return false;
		}
		return true;
	}
	
	//This function will reset the orbQueue to have nothing in it.
	this.resetOrbQueue = function() {
		var tempHolder = orbQueue.splice(0, orbQueue.length);
		queueType = null;
		delete tempHolder;
	}
	
	//This function returns a pair that returns what type they are and how many 
	//orbs are left in the queue. 
	this.getPairedItems = function() {
		if (queueType == null) {
			return [null, 0];
		}
		else {
			return [queueType.charAt(0), orbQueue.length];
		}
	}
	
	//This function will return the information for the race.
	//It was used for debug, but we're keeping it here just in case.
	//Until then it remains empty.
	this.setRaceAbilityInfo = function(abilityInfoString) {
	}
	
	//return race Information specifically for synch via action
	this.getActionRaceInfo = function() {
		var tempString = "";
		return tempString;
	}
	
	//returns raceAbilityInfo for networking for synching.
	this.getRaceAbilityInfo = function() {
	
	}
	
	//This function checks to see if the player is allowed to move
	//into the next row. 
	this.moveVertically = function(dir, isPaused) {
		if (isPaused == null || (isPaused != null && !isPaused())) {
			var boundaryCheck;
			var indexFrame;
			if (dir < 0) {
				boundaryCheck = colRow.getSecond() > variableContainer.playFieldCeiling;
				indexFrame = 1;
			}
			else {
				boundaryCheck = colRow.getSecond() < variableContainer.playFieldFloor;
				indexFrame = 2;
			}
			
			if (boundaryCheck) {
				this.setIndexFrame(indexFrame);
				this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);
				colRow.setSecond(colRow.getSecond() + dir);
				return true;
			}
		}
		return false;
	}
	
	
	// This function outlines the Witch's ability to pick up one of the orbs 
	//from the board and putting it into the character's list or "hand".
	this.abilityA = function(isPaused) {
		
		if (isPaused == null || (isPaused != null && !isPaused())) {
		
			//NOTE THAT THESE ARE RELATIVE TO THE BOARD
			var boardRowNum = colRow.getSecond() - variableContainer.boardRowOffset;	
			var boardColNum = this.getBoard().findColFrontOrb(boardRowNum);
			
			//This checks the orbType of the orb the character is trying to pick up. 
			//It reacts appropriately so that only orbs of the same type can be picked up.
			if ((boardColNum < variableContainer.boardDimensions.getFirst()) && 
				(this.getBoard().getOrb(boardColNum, boardRowNum).getMechanicType() == null)) {
				if (queueType == null) {				
					queueType = this.getBoard().getOrb(boardColNum, boardRowNum).getType();
					orbQueue.push(this.getBoard().spliceOrb(boardColNum, boardRowNum));
					SoundJS.play("orbGrabbed", SoundJS.INTERRUPT_LATE);
					this.setIndexFrame(3);
					this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);
					return true;
				} else if (this.getBoard().getOrb(boardColNum, boardRowNum).getType() == queueType) {
					orbQueue.push(this.getBoard().spliceOrb(boardColNum, boardRowNum));
					SoundJS.play("orbGrabbed", SoundJS.INTERRUPT_LATE);
					this.setIndexFrame(3);
					this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);
					return true;
				}
			}
		}
		return false;
	}
	
	// This function governs the Witch's ability to throw orbs from the orbList onto
	// the board.
	this.abilityB = function(isPaused) {
		if (orbQueue.length > 0 && (isPaused == null || (isPaused != null && !isPaused()))) {
			SoundJS.play("orbThrown", SoundJS.INTERRUPT_LATE);		
			this.getBoard().insertQueue(orbQueue, colRow.getSecond());
			if(orbQueue.length == 0) {
				queueType = null;
			}
			this.setIndexFrame(4);
			this.getSpriteTimer().reset(variableContainer.defaultSpriteCountdown);
			return true;
		}
		return false;
	}
	
	// This updates the client's Witch character. Right now, it only resets their
	//the character's sprite back to it's idle state.
	this.update = function() {
		if (this.getSpriteTimer().isExpired()) {
			this.setIndexFrame(0);
		}
	}
	
	//Draws the Witch, mainly drawing the dot sprites for player to see where 
	//they are doing their match.
	this.draw = function() {
		var mirror = 1;
		var firstEmptyCol = (this.getBoard().findColFrontOrb(colRow.getSecond()- 
								variableContainer.boardRowOffset));
		if (this.getBoard().getPlayerSide(firstEmptyCol) != "left")
			mirror = -1;
		
		//This loop draws all the dots in front of the witch.
		for (var i = 1; i < firstEmptyCol; ++i){
			if (queueType != null && firstEmptyCol - i <= orbQueue.length) {
					spriteManager["dot"][queueType].draw(mirror * i + 
						this.getBoard().getOffset().getFirst()+ 5/16,
								 colRow.getSecond()+ 1/16, 0, 0.4,0.4);
				}
			spriteManager["dot"][queueType].draw(mirror * i + 
							this.getBoard().getOffset().getFirst() + 3/8,
							 colRow.getSecond() + 1/8);
		}
		
		if(this.getBoard().getPlayerSide() == "left"){
			this.getSprite().draw(colRow.getFirst() - .5,
											colRow.getSecond() + 
											variableContainer.charImgOffsetY, 
											this.getIndexFrame());				   
		} else{
			this.getSprite().drawFlipImage(colRow.getFirst() - .5,
											colRow.getSecond() + 
											variableContainer.charImgOffsetY, 
											this.getIndexFrame());
		}
	}
}
