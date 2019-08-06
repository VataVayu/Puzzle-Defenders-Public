var spriteManager = [];
var raceEnum = ["witch", "steampunk", "angel"];
var textBoxEnum = ["next", "cancel", "upperLeft", "upperRight", 
				   "lowerLeft", "lowerRight", "edge", "center"];
				   
// The following is for incrementing the progress bar				   
var imagesLoaded = 0;

function incrementLoading(){
	// Stop the bar from pulsing once it has something loaded the first time
	if(progressBar.value == null) progressBar.value = 0;
	++imagesLoaded;
	progressBar.value = imagesLoaded;
	if(imagesLoaded == 78) { // number of image files
		progressBar.hidden = true;
	}
}
				   
function initializeMenuSprites(){
	var tempImg; 

	spriteManager.splice(0, spriteManager.length);

	spriteManager.menu = [];
	spriteManager.textBox = [];
	spriteManager.charPicts = [];
	spriteManager.logo = [];	
	spriteManager.overworld = [];
	spriteManager.button = [];
	spriteManager.raceButton = [];
	
	tempImg = new Image();
	tempImg.src = "libraries/images/overworld_map.png";
	tempImg.onload = incrementLoading;
	spriteManager.overworld.map = new Sprite(tempImg, new Pair(1416, 516));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/overworld_angel.png";
	tempImg.onload = incrementLoading;
	spriteManager.overworld.angel = new Sprite(tempImg, new Pair(396, 336));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/overworld_steampunk.png";
	tempImg.onload = incrementLoading;
	spriteManager.overworld.steampunk = new Sprite(tempImg, new Pair(348, 396));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/overworld_witch.png";
	tempImg.onload = incrementLoading;
	spriteManager.overworld.witch = new Sprite(tempImg, new Pair(372, 360));
	
	
	tempImg = new Image();
	tempImg.src = "libraries/images/button_default.png";
	tempImg.onload = incrementLoading;
	spriteManager.button.default = new Sprite(tempImg, new Pair(192, 72), 
		2);
		
	tempImg = new Image();
	tempImg.src = "libraries/images/button_toggle.png";
	tempImg.onload = incrementLoading;
	spriteManager.button.toggle = new Sprite(tempImg, new Pair(192, 72), 
		3);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/button_loading.png";
	tempImg.onload = incrementLoading;
	spriteManager.button.spin = new Sprite(tempImg, new Pair(96, 96));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/button_ai.png";
	tempImg.onload = incrementLoading;
	spriteManager.button.ai = new Sprite(tempImg, new Pair(96, 48), 5);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/button_shade.png";
	tempImg.onload = incrementLoading;
	spriteManager.button.shade = new Sprite(tempImg, new Pair(96, 48));
			
	/** Race Selection Buttons **/
	tempImg = new Image();
	tempImg.src = "libraries/images/raceButton_witch.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.raceButton[variableContainer.races[0]] =  new Sprite(
		tempImg, new Pair(192, 72), 3);
			
	tempImg = new Image();
	tempImg.src = "libraries/images/raceButton_steampunk.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.raceButton[variableContainer.races[1]] =  new Sprite(
		tempImg, new Pair(192, 72), 3);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/raceButton_angel.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.raceButton[variableContainer.races[2]] =  new Sprite(
		tempImg, new Pair(192, 72), 3);
	
	/** Menu Screens **/
	tempImg = new Image();
	tempImg.src = "libraries/images/menu_main.jpg";
	tempImg.onload = incrementLoading;
	spriteManager.menu.still =  new Sprite(tempImg, 
		new Pair(1776, 624));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/menu_angelCity.png";
	tempImg.onload = incrementLoading;
	spriteManager.menu.angelCity =  new Sprite(tempImg,
		new Pair(912, 336));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/menu_cityShadow.png";
	tempImg.onload = incrementLoading;
	spriteManager.menu.cityShadow =  new Sprite(tempImg, 
		new Pair(312, 96));
			
	/** Textbox **/
	tempImg = new Image();
	tempImg.src = "libraries/images/button_next.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[0]] =  new Sprite(tempImg, 
		new Pair(48, 48), 2);

	tempImg = new Image();
	tempImg.src = "libraries/images/button_cancel.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[1]] =  new Sprite(tempImg, 
		new Pair(48, 48), 2);

	tempImg = new Image();
	tempImg.src = "libraries/images/textBox_upperLeft.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[2]] =  new Sprite(tempImg, 
		new Pair(48, 48));			

	tempImg = new Image();
	tempImg.src = "libraries/images/textBox_upperRight.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[3]] =  new Sprite(tempImg, 
		new Pair(48, 48));

	tempImg = new Image();
	tempImg.src = "libraries/images/textBox_lowerLeft.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[4]] =  new Sprite(tempImg, 
		new Pair(48, 48));			
	
	tempImg = new Image();
	tempImg.src = "libraries/images/textBox_lowerRight.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[5]] =  new Sprite(tempImg, 
		new Pair(48, 48));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/textBox_edge.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[6]] =  new Sprite(tempImg, 
		new Pair(48, 1));

	tempImg = new Image();
	tempImg.src = "libraries/images/textBox_center.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.textBox[textBoxEnum[7]] =  new Sprite(tempImg, 
		new Pair(1, 1));
	
	/** Race Selection Pictures **/
	tempImg = new Image();
	tempImg.src = "libraries/images/charPicts_witch.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.charPicts[raceEnum[0]] =  new Sprite(tempImg, 
		new Pair(288, 480));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/charPicts_steampunk.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.charPicts[raceEnum[1]] =  new Sprite(tempImg, 
		new Pair(288, 480));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/charPicts_angel.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.charPicts[raceEnum[2]] =  new Sprite(tempImg, 
		new Pair(288, 480));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/logo.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.logo[0] =  new Sprite(tempImg, new Pair(960, 384));
}

function initializeGameplaySprites() {
	var tempImg;
	spriteManager.orb = [];
	spriteManager.ghost = [];
	spriteManager.sacrificeOrb = [];
	spriteManager.fairy = [];
	spriteManager.shield = [];
	spriteManager.attunedFairy = [];
	spriteManager.attunedShield = [];
	spriteManager.spellOrb = [];
	spriteManager.race = [];
	spriteManager.resource = [];
	spriteManager.background = [];
	spriteManager.dot = [];
	spriteManager.selectionBox = [];
	spriteManager.border = []
	spriteManager.damage = []
	spriteManager.aura = [];

	/** Init the orb images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/orb_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.orb[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/orb_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.orb[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/orb_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.orb[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/orb_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.orb[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/orb_dead.png";
	tempImg.onload = incrementLoading;
	spriteManager.orb[variableContainer.typeEnum[5]] = new Sprite(
		tempImg, new Pair(48, 48));
		
		
	/** Init the ghost images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/ghost_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.ghost[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/ghost_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.ghost[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/ghost_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.ghost[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/ghost_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.ghost[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
			
	
	/** Init the key image for tutorial **/
	tempImg = new Image();
	tempImg.src = "libraries/images/key.png";
	tempImg.onload = incrementLoading;
	spriteManager.key = new Sprite(
		tempImg, new Pair(48, 48), 2);
		
	/** Init the sacrificeOrb images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/sacrificedOrb_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.sacrificeOrb[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/sacrificedOrb_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.sacrificeOrb[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/sacrificedOrb_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.sacrificeOrb[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/sacrificedOrb_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.sacrificeOrb[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
			
	/** Init the fairy images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.fairy[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.fairy[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.fairy[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.fairy[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
			
	/** Init the shield images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.shield[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48), new Pair(1, 1));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.shield[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48), new Pair(1, 1));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.shield[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.shield[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
			
	/** Init the attuned fairy images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_airAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedFairy[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_waterAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedFairy[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_fireAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedFairy[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/fairy_earthAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedFairy[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
			
	/** Init the attuned shield images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_airAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedShield[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_waterAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedShield[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_fireAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedShield[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/shield_earthAttuned.png";
	tempImg.onload = incrementLoading;
	spriteManager.attunedShield[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));
		
	/** Init the spellOrb images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/spellOrb_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.spellOrb[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/spellOrb_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.spellOrb[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/spellOrb_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.spellOrb[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(48, 48));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/spellOrb_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.spellOrb[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(48, 48));

	/** Init the race images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/race_witch.png";      
	tempImg.onload = incrementLoading;                            
	spriteManager.race[raceEnum[0]] = new Sprite(tempImg, new Pair(96, 96), 
		6);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/race_steampunk.png";   
	tempImg.onload = incrementLoading;                            
	spriteManager.race[raceEnum[1]] = new Sprite(tempImg, new Pair(96, 96), 
		6);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/race_angel.png";
	tempImg.onload = incrementLoading;
	spriteManager.race[raceEnum[2]] = new Sprite(tempImg, new Pair(48, 96), 
		6);

	/** Init the resource images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/resource_witch.png";
	tempImg.onload = incrementLoading;
	spriteManager.resource[raceEnum[0]] = new Sprite(tempImg, 
		new Pair(48, 48), 7);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/resource_steampunk.png";
	tempImg.onload = incrementLoading;
	spriteManager.resource[raceEnum[1]] = new Sprite(tempImg, 
		new Pair(48, 48), 7);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/resource_angel.png";
	tempImg.onload = incrementLoading;
	spriteManager.resource[raceEnum[2]] = new Sprite(tempImg, 
		new Pair(48, 48), 7);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/resource_platform.png";
	tempImg.onload = incrementLoading;
	spriteManager.resource.platform = new Sprite(tempImg,
		new Pair(48, 1), 2);
	
	tempImg = new Image();
	tempImg.src = "libraries/images/resource_cap.png";
	tempImg.onload = incrementLoading;
	spriteManager.resource.cap = new Sprite(tempImg, new Pair(60, 24));

	/** Init the background images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/background_witch.jpg";
	tempImg.onload = incrementLoading;
	spriteManager.background[raceEnum[0]] = new Sprite(tempImg, 
		new Pair(1728, 552));

	/** Init the dot images **/
	tempImg = new Image();
	tempImg.src = "libraries/images/dot_null.png";
	tempImg.onload = incrementLoading;
	spriteManager.dot.null = new Sprite(tempImg, new Pair(12, 12));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/dot_air.png";
	tempImg.onload = incrementLoading;
	spriteManager.dot[variableContainer.typeEnum[0]] = new Sprite(
		tempImg, new Pair(12, 12));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/dot_water.png";
	tempImg.onload = incrementLoading;
	spriteManager.dot[variableContainer.typeEnum[1]] = new Sprite(
		tempImg, new Pair(12, 12));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/dot_fire.png";
	tempImg.onload = incrementLoading;
	spriteManager.dot[variableContainer.typeEnum[2]] = new Sprite(
		tempImg, new Pair(12, 12));
	
	tempImg = new Image();
	tempImg.src = "libraries/images/dot_earth.png";
	tempImg.onload = incrementLoading;
	spriteManager.dot[variableContainer.typeEnum[3]] = new Sprite(
		tempImg, new Pair(12, 12));
			
	/** Init the selectionBox image **/
	tempImg = new Image();
	tempImg.src = "libraries/images/selectionBox.png";
	tempImg.onload = incrementLoading;
	spriteManager.selectionBox[0] = new Sprite(tempImg, new Pair(96, 48));
	
	/** Init border **/
	tempImg = new Image();
	tempImg.src = "libraries/images/border_top.png";
	tempImg.onload = incrementLoading;
	spriteManager.border.top = new Sprite(tempImg, new Pair(888, 96));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/border_bottom.png";
	tempImg.onload = incrementLoading;
	spriteManager.border.bottom = new Sprite(tempImg, new Pair(888, 48));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/border_side.png";
	tempImg.onload = incrementLoading;
	spriteManager.border.side = new Sprite(tempImg, new Pair(48, 528));
	
	/** Init resource damage blink **/
	tempImg = new Image();
	tempImg.src = "libraries/images/resource_damage_blink.png";
	tempImg.onload = incrementLoading;
	spriteManager.damage[0] = new Sprite(tempImg, new Pair(48, 48));
	
	/** Init auras **/
	tempImg = new Image();
	tempImg.src = "libraries/images/aura_spell.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.aura.spell =  new Sprite(tempImg, new Pair(48, 48));
			
	tempImg = new Image();
	tempImg.src = "libraries/images/aura_alert.png"; 
	tempImg.onload = incrementLoading;
	spriteManager.aura.alert =  new Sprite(tempImg, new Pair(48, 48));
}