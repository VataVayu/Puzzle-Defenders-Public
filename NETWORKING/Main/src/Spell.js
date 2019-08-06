/**
 *	Spell Class, which contains the functionality for the spells
 *	
 *	function Spell(name): object Spell declaration. 
 *	function initialize(): initialize spell
 *	function getType(): returns the elemental type of the spell
 *	function attunedCount(): Returns attunedCount
 *	function useAttunedCount(): Decrements attunedCount
 *	function setAttunedCount(newNum): Sets attunedCount
 *	function recentlyActivated(): Sets activated
 *	function activate(colRow): Activates spell's ability
 *
 **/
function Spell(name) {
	/************************* Private Variables *****************************/
	// needs to correspond to name
	var orbType = variableContainer.typeEnum[0]; 
	var gameTimer = null;
	// Will always be the board of the player who has the spell orb
	var playerBoard = null; 
	// Name of spell that is passed in
	var spellName = name; 
	var attunedCount = 0;
	var activated = false;
	
	// Set orbType. Also acts as a list of what spells are tuned with what 
	// element
	switch(spellName){
		// AIR
		case "air": 
			orbType = variableContainer.typeEnum[0];
			break;
		
		// FIRE
		case "fire":
			orbType = variableContainer.typeEnum[2];
			break;
		
		// EARTH
		case "earth": 
			orbType = variableContainer.typeEnum[3];
			break;
		
		default:
			break;
	}
	
	/***************************** Privileged Functions **********************/	
	// Initializes the spell
	this.initialize = function(board) {
		playerBoard = board;
	}
	
	// Returns the elemental type of the spell
	this.getType = function() {
		return orbType;
	}
	
	// Returns attunedCount
	this.attunedCount = function() {
		return attunedCount;
	}
	
	// Decrements attunedCount
	this.useAttunedCount = function() {
		if (attunedCount > 0) 
			--attunedCount;
	}
	
	// Sets attunedCount to newNum
	this.setAttunedCount = function(newNum) {
		attunedCount = newNum;
	}
	
	// Sets activated
	this.recentlyActivated = function() {
		var r = activated;
		activated = false;
		return r;
	}
	
	// Does character manipulation here
	this.activate = function(colRow) {
		activated = true;
		SoundJS.play("activateSpell", SoundJS.INTERRUPT_LATE, 1);
		if(variableContainer.isLocal) {
			switch(spellName){
			// AIR
			case "air": 
				var tempOrb;
				// using variable healingSpellValue from variableContainer
				for (var i = 0; i < variableContainer.boardDimensions.getFirst(); 
						i++) {
					tempOrb = playerBoard.getOrb(i, colRow.getSecond());
					
					if (tempOrb != null)
						tempOrb.setToAttack();
				}
				break;
			
			// FIRE
			case "fire":
				// Does playerBoard manipulation here
				for (var row = 0; row < 
						variableContainer.boardDimensions.getSecond(); ++row) {
					for (var col = variableContainer.boardDimensions.getFirst() - 
							1; col >= 0; --col) {
						if (playerBoard.getOrb(col, row) != null && 
								playerBoard.getOrb(col, row).getType() == 
								variableContainer.typeEnum[3]) {
							playerBoard.getOrb(col, row).setType(
								variableContainer.typeEnum[2]);
						}
					}
				}
				break;
			
			// EARTH
			case "earth":
				// Does playerBoard manipulation here
				if (attunedCount <= 0) {
					attunedCount = 1;
				}
				attunedCount += variableContainer.attunedSpellCount;
				break;
			
			default:
				activated = false;
				break;
			}
		}
	}
}