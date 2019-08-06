/**
 * Resource class for structuring the resource object, sprite, health,
 * and functionality in game.
 * 
 * function Resource(health (int), colRow (pair), playerRace (string  "Steampunk, 
 *					Witch, Angel"), isPlayerOne (boolean)): Initialize the
 *					resource with health, type, animation, and sound.
 * function damage(): Reduce the health of resource and play damage clips 
 * function getColRow(): Return the column/row pair for the resource
 * function getHealth(): Return the current health of the resouce
 * function setHealth(): Sets the current health of the resouce
 * function resetHealth(): Resets the current health of the resource to maxHealth
 * function update(): Resets the current health of the resource to maxHealth
 * function draw(): Draws sprite of resource with different damage sprites
 *							depending on the health. Also draws the damage ping
 *							around the resource
 * function drawEtc(): Draws the damage alert whenever a resource is hit
 * function isAlive(): Returns a boolean whether or not the resource is alive
 *
 **/

function Resource(colRow, raceName, isPlayerOne, timer) {

	/************************* Private Variables *****************************/
	var health = variableContainer.maxResourceHealth;
	var resourceIndex = 0;
	var startPingSize = .25;
	var pingSlice = null;
	var destroyedSlice = null;
	var alertSlice = new Array();
	var pingImage = spriteManager["damage"][0]; // rings around a damaged resource
	var alertImage = spriteManager["aura"]["alert"]; // "red laser" that alerts of damage
	var pingTimer = new CountDownTimer(timer, -1); // Needed to animate the pings
	var damageTimer = new CountDownTimer(timer, -1);
	
	/***************************** Privileged Functions **********************/
	
	this.damage = function() {
		--health;
		if (health > 0) {
			SoundJS.play("resourceDamaged", SoundJS.INTERRUPT_LATE, 0.7);
			alertSlice.push(4);
		} else {
			SoundJS.play("resourceDestroyed", SoundJS.INTERRUPT_LATE, 0.7);
			destroyedSlice = 3;
		}
		resourceIndex = variableContainer.maxResourceHealth - health;
		if(damageTimer.isExpired()) {
			damageTimer = new CountDownTimer(timer, 4000);
		}
	}
	
	// Return the column/row pair for the resource
	this.getColRow = function() {
		return colRow;
	}
	
	// Return the current health of the resouce
	this.getHealth = function() {
		return health;
	}
	
	// Set the health of the resource. Used for networked games.
	this.setHealth = function(newHealth) {
		if((damageTimer.isExpired())) {
			damageTimer = new CountDownTimer(timer, 4000);
			var temp = parseInt(newHealth);
			if((temp < health)) {
				if (temp > 0) {
					SoundJS.play("resourceDamaged", SoundJS.INTERRUPT_LATE, 0.7);
					alertSlice.push(4);
				} else {
					SoundJS.play("resourceDestroyed", SoundJS.INTERRUPT_LATE, 0.7);
					destroyedSlice = 3;
				}
			}
			health = temp;
			resourceIndex = variableContainer.maxResourceHealth - health;
		}
		
	}
	
	/* Reset the resource health to max. Used for tutorials when switching
	    between sequences */
	this.resetHealth = function() {
		health = variableContainer.maxResourceHealth;
		resourceIndex = 0; // used for draw() to get the right resource image
	}

	/* Update function. Handles the resource damaged alert timer.
		At 2/3 heath, the ping will begin to flash */
	this.update = function(currHealth) {
		if (health <= variableContainer.maxResourceHealth * (2/3)) {
			if (pingTimer.isExpired()) {
				pingSlice = startPingSize;
				pingTimer.reset(15 * variableContainer.tickInterval);
			}
		}
		if (alertSlice[0] != null) {
			alertSlice[0] += 2.5;
		} else if (destroyedSlice != null) {
			destroyedSlice += 1;
		}
		if (pingSlice != null)
			pingSlice += 1/12;
	}

	/* Draw function. Draws the aura around the resouce if it is low on health
		and the resouce itself */
	this.draw = function() {
		if (this.isAlive()) {
			if (pingSlice != null) {
				pingImage.draw(colRow.getFirst() + .5 - pingSlice, 
					colRow.getSecond() + .5 - pingSlice, 0, 
					2 * pingSlice, 2 * pingSlice);
				if (pingSlice > 1) {
					pingSlice = null;
				}		
			}
			
			// Draw the actual resouce
			// Player 1's resource
			if (isPlayerOne) {
				spriteManager.resource[raceName].draw(colRow.getFirst(), 
													  colRow.getSecond(), 
													  resourceIndex);
			} else { // Player 2's resource
				spriteManager.resource[raceName].drawFlipImage(colRow.getFirst(), 
															   colRow.getSecond(), 
															   resourceIndex);
			}
		}
	}
	
	/* Draw etcetera. This handles drawing the "alert laser" in a different 
		order so that it is underneath the orbs */
	this.drawEtc = function() {
		if (alertSlice[0] != null) {
			if (isPlayerOne) {
				alertImage.drawFlipImage(colRow.getFirst(), 
					colRow.getSecond(), 0, alertSlice[0], 1);
			} else {
				alertImage.draw(colRow.getFirst(), 
					colRow.getSecond(), 0, alertSlice[0], 1);
			}
			
			if (alertSlice[0] > variableContainer.boardDimensions.getFirst() - 2) {
				alertSlice.splice(0, 1);
			}
		} else if (!this.isAlive() && destroyedSlice != null) {
			if (isPlayerOne) {
				alertImage.drawFlipImage(colRow.getFirst(), 
					colRow.getSecond() - .5, 0, destroyedSlice, 2);
			} else {
				alertImage.draw(colRow.getFirst(), 
					colRow.getSecond() - .5, 0, destroyedSlice, 2);
			}
			
			if (destroyedSlice > variableContainer.boardDimensions.getFirst()) {
				destroyedSlice = null;
			}
		}
	}

	// Returns a boolean whether or not the resource is alive
	this.isAlive = function() {
		return health > 0;
	}
}

