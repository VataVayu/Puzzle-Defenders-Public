/**
 * This is a constructor for Character. It instantiates the Character class 
 *		which initializes the player's spellList and resourceList, and updates
 *		the AI if it exists.
 *
 * function Character(boolean, Race, IHandler, Timer, string): Contains
 *		the structure of the Character class.
 * function getSpell(): Returns this character's spell object.
 * function getRace(): Returns this character's race object.
 * function getResources(): Returns this character's array of resources.
 * function setResourcesHealth(string): Set the health of each of the character's 
 *			resources.
 * function getResourcesArray(): Return an array containing the encoded health 
 *		values of each of the character's resources.
 * function resetResourceArray(): Resets the health of all of the character's 
 *		resources. It is used in tutorials between sequences.
 * function getResourceIndividual(int): Returns an individual resource. Used in 
 *		tutorials. 
 * function isIndividualDead(int): Check if an individual resource is destroyed. 
 *		Used in tutorials.
 * function getHealthRatio(): Get the (current health)/(total health) ratio.
 * function hasLowHealth(): Determine whether or not the character has low 
 *		health (>= 25%).
 * function isDead(): Determine whether or not the character is dead.
 * function set_steampunkQueue(): Set the steampunk orb queue to be a queue 
 *		that is passed in.
 * function runScriptedAction(function): Execute the AI's scripted action.
 * function updateAI(Array, Array, Array, function): Updates the AI's movement 
 *		by taking into account its shields, its opponent's shields, and the 
 *		state of the opponent's resources. 
 * function destructAI(): Destroy the AI.
 * function update(): Updates the character's spell activation aura, the 
 *		character's race, and each of the character's resources.
 * function draw(): Draw the resource cap, the resource platform, the 
 *		resources themselves, the spell activation aura, and the character.
 * function set_resourceCol(int): Change the resource column to draw to the 
 *		appropriate frame.
 * function drawEtc(): Draw the resources' alert lasers. 
 * function shift_Sbox(): If the character is an Angel, shift her selection box 
 *		whenever a new column of orbs is spawned.
 * function resetCharacter(): Reset the witch's hand. Used in tutorials.
**/

function Character(isPlayerOne, race, iHandler, timer, aiDiff) {
	
	/*******************************Private Variables*************************/
	var aiControl = null;
	var spell = null;
	var AIScript = false;
	var maxNumResources = variableContainer.boardDimensions.getSecond();
	var resourceList = new Array();
	var resourceColNum;
	var colResourceState = 0;
	var spellAlertSize = 0;
	var spellAngle = 0;
	var spellRotateSpeed = -10;
	
	/********Initialization***************/
	switch (race.getName()) {
		case(variableContainer.races[0]):
			spell = new Spell("earth");
			break;
		case(variableContainer.races[2]):
			spell = new Spell("air");
			race.initSelectionBox();
			break;
		case(variableContainer.races[1]):
			spell = new Spell("fire");
			var abilityADelay;
			var abilityBDelay;
			
			if (variableContainer.isLocal || isPlayerOne) {
				abilityADelay = variableContainer.steampunkShootDelay;
				abilityBDelay = variableContainer.steampunkSacrificeDelay;
			} else {
				abilityADelay = 0;
				abilityBDelay = 0;
			}
			race.setTimer(timer, abilityADelay, abilityBDelay);
			break;
	}
	race.setSpriteTimer(timer);
	
	if (isPlayerOne) {
		resourceColNum = variableContainer.boardColumnOffset + 
						 variableContainer.boardDimensions.getFirst();	
	} else {
		resourceColNum = variableContainer.boardColumnOffset + 
						 variableContainer.boardDimensions.getFirst() + 
						 variableContainer.resourceDimension + 
						 variableContainer.noMansLandDimension + 
						 2 * variableContainer.shieldZoneDimension; 
	}
	
	for (var i = 0; i < maxNumResources; i++) {
		resourceList[i] = new Resource(new Pair(resourceColNum, 
												variableContainer.boardRowOffset 
												+ variableContainer.drawYOffset + i), 
									   race.getName(), isPlayerOne, timer);
	}
	
    if (iHandler == true) {
		AIScript = true;
		aiControl = new AIHandler(isPlayerOne, variableContainer.AIAttitude, 
								  race.getName(), true);
		aiControl.setMyRace(race);
	} else if (iHandler == null) {
		AIScript = false;
		aiControl = new AIHandler(isPlayerOne, variableContainer.AIAttitude, 
								  race.getName(), false, aiDiff);
		aiControl.setMyRace(race);
	}
	
	
	/****************************Privileged Functions*************************/
	
	/**************************************************************************
	Returns this character's spell object.
	**************************************************************************/
	this.getSpell = function() {
		return spell;
	}
	
	/**************************************************************************
	Returns this character's race object.
	**************************************************************************/
	this.getRace = function() {
		return race;
	}
	
	/**************************************************************************
	Returns this character's array of resources.
	**************************************************************************/
	this.getResources = function() {
		return resourceList;
	}
	
	/**************************************************************************
	Set the health of each of the character's resources.
	**************************************************************************/
	this.setResourcesHealth = function(resourceData) {
		var tempHealthData = resourceData.split("");
		for (var res in resourceList) {
			resourceList[res].setHealth(tempHealthData[res]);
		}
	}
	
	/**************************************************************************
	Return an array containing the encoded health values of each of the 
	character's resources
	**************************************************************************/
	this.getResourcesArray = function() {
		var list = new Array();
		for (var item in resourceList){
			if (resourceList[item] != null){
				list.push(resourceList[item].getHealth());
			}
			else {
				list.push(0);
			}
		}
		return list;
	}
	
	/**************************************************************************
	Resets the health of all of the character's resources. It is used in
	tutorials between sequences.
	**************************************************************************/
	this.resetResourceArray = function(){
		for (var item in resourceList) {
			resourceList[item].resetHealth();
		}
	}
	
	/**************************************************************************
	Returns an individual resource. Used in tutorials.
	**************************************************************************/
	this.getResourceIndividual = function(index) {
		if ((index < 0) || (index >= resourceList.length)) {
			return null;
		}
		
		return resourceList[index];
	}
	
	/**************************************************************************
	Check if an individual resource is destroyed. Used in tutorials.
	**************************************************************************/
	this.isIndividualDead = function(index) {
		if ((index < 0) || (index >= resourceList.length)) {
			return null;
		}
		
		if (resourceList[index].isAlive()) {
			return false;
		}
		return true;
	}
	
	/**************************************************************************
	Get the (current health)/(total health) ratio.
	**************************************************************************/
	this.getHealthRatio = function() {
		var currHealthArray = this.getResourcesArray();
		var currHealthCount = 0;
		for (var i = 0; i < currHealthArray.length; ++i) {
			currHealthCount += currHealthArray[i];
		}
		return currHealthCount / 
			   (variableContainer.maxResourceHealth * maxNumResources);
	}
	
	/**************************************************************************
	Determine whether or not the character has low health (>= 25%).
	**************************************************************************/
	this.hasLowHealth = function() {	
		if (this.getHealthRatio() <= .25) {
			return true;
		}
		return false;
	}

	/**************************************************************************
	Determine whether or not the character is dead.
	**************************************************************************/
	this.isDead = function() {
		for (var i = 0; i < maxNumResources; ++i) {
			if (resourceList[i].isAlive())
				return false;
		}
		return true;
	}
	
	/**************************************************************************
	Set the steampunk orb queue to be a queue that is passed in.
	**************************************************************************/
	this.set_steampunkQueue = function(affinityQueue){
		if (race.getName() == "steampunk") {
			race.set_spawnQueue(affinityQueue);
		}
	}
	
	/**************************************************************************
	Execute the AI's scripted action.
	**************************************************************************/
    this.runScriptedAction = function(action){
		aiControl.executeAction(action);
	}
	
	/**************************************************************************
	Updates the AI's movement by taking into account its shields, its 
	opponent's shields, and the state of the opponent's resources. 
	**************************************************************************/
    this.updateAI = function(myShields, oppShields, oppResources, move) {
        if (aiControl != null && !AIScript) {
			var myS = new Array(10);
			var oppS = new Array(10);
			for (var i = 0; i < variableContainer.boardDimensions.getSecond(); i++) {
				if (myShields[i] == null) {
					myS[i] = 0;
				} else {
					myS[i] = (myShields[i]).getHealth();
				}
				if (oppShields[i] == null) {
					oppS[i] = 0;
				} else {
					oppS[i] = (oppShields[i]).getHealth();
				}
			}
			var json = {}
			json.myRace = race.getName();   //needed to access action methods (move/ability)
			json.myPairedStats = race.getPairedItems();  //select box pos, orbs in queue/pouch
			json.maxShieldSize = variableContainer.maxResourceHealth;
			json.myBoard = race.getBoardArray();
			json.myPosY = race.getColRow().getSecond() - 
						  variableContainer.boardRowOffset;
			json.boardSize = [variableContainer.boardDimensions.getFirst(), 
							  variableContainer.boardDimensions.getSecond()];
            
			json.myShields = myS;
            json.myResources = this.getResourcesArray();
            json.oppShields = oppS;
            json.oppResources = oppResources;
            
			aiControl.update(json);
        } else if (aiControl != null && AIScript && (move != undefined)) {
			this.runScriptedAction(move);
		}
    }
    
	/**************************************************************************
	Destroy the AI.
	**************************************************************************/
    this.destructAI = function() {
        if (aiControl != null){
            aiControl.destructor();
            aiControl = null;
        }
    }
	
	/**************************************************************************
	Updates the character's spell activation aura, the character's race, and
	each of the character's resources.
	**************************************************************************/
	this.update = function() {
		
		if (spell.attunedCount() > 1 || spell.recentlyActivated()) {
			spellAlertSize = 2;
		} else if (spellAlertSize >= .5) {
			spellAlertSize -= .05;
		}

		race.update();
		
		for (var i = 0; i < maxNumResources; i++) {
			resourceList[i].update();
		}
	}

	/**************************************************************************
	Draw the resource cap, the resource platform, the resources themselves,
	the spell activation aura, and the character.
	**************************************************************************/
	this.draw = function() {
	
		spriteManager.resource.cap.draw(resourceList[0].getColRow().getFirst() - 
										.125, variableContainer.boardRowOffset + 
										variableContainer.drawYOffset - .5);
		spriteManager.resource.cap.drawRotatedImage(resourceList[0].getColRow().getFirst() - 
													.375, 
													variableContainer.boardRowOffset + 
													variableContainer.boardDimensions.getSecond() + 
													variableContainer.drawYOffset, 
													.75, .25, 180);
		spriteManager.resource.platform.draw(resourceList[0].getColRow().getFirst(), 
											 variableContainer.boardRowOffset + 
											 variableContainer.drawYOffset, 
											 colResourceState, 1, 
											 variableContainer.boardDimensions.getSecond());
		
		for (var i = 0; i < maxNumResources; i++) {
			resourceList[i].draw();
		}
		
		if (spellAlertSize > .5) {
			spellAngle = (spellAngle + spellRotateSpeed) % 360;
			var shift = spellAlertSize / 2
			spriteManager.aura.spell.drawRotatedImage(race.getColRow().getFirst() - 
													  shift + .4, 
													  race.getColRow().getSecond() - 
													  shift, 
													  spellAlertSize / 2, 
													  spellAlertSize / 2, 
													  spellAngle, 0, 
													  spellAlertSize, 
													  spellAlertSize);
		}
		
		race.draw();
	}
	
	/**************************************************************************
	Change the resource column to draw to the appropriate frame
	**************************************************************************/
	this.set_resourceCol = function(frame) {
		colResourceState = frame;
	}
	
	/**************************************************************************
	Draw the resources' alert lasers.
	**************************************************************************/
	this.drawEtc = function() {
		for (var i = 0; i < maxNumResources; i++) {
			resourceList[i].drawEtc();
		}
	}
	
	/**************************************************************************
	If the character is an Angel, shift her selection box whenever a new column
	of orbs is spawned.
	**************************************************************************/
	this.shift_Sbox = function() {
		if (race.getName() == variableContainer.races[2]) {
			race.selectionShiftColumn(-1);
		}
	}
	
	/**************************************************************************
	Reset the witch's hand. Used in tutorials.
	**************************************************************************/
	this.resetCharacter = function() {
		if (race.getName() == variableContainer.races[0]) {
			race.resetOrbQueue();
		}
	}
	
}