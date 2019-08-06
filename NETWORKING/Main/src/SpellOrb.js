/**
 * This class is for setting up spell orbs to be set off on the board.
 * They are a subclass of Orb.
 *
 * function SpellOrb(spell (Spell), colRow (pair), type(element type), 
				gravity (int)): Constructor of SpellOrb to set the spell, position, 
				and direction
 * function getSpell(): Return the spell set in the spell orb.
 * function activate(): Call the approriate spell to activate. Certain spells
 *				may need the position of the spell orb to activate
 * function draw(): Draws the aura behind the spell, which rotates, before
 * 			calling the parent Orb's draw
 **/
 
subclass(SpellOrb, Orb);
function SpellOrb(spell, colRow, type, gravity) {
	/************************* Private Variables *****************************/
	var spellAura = spriteManager["aura"]["spell"];

	// Variables used for the spell aura
	var angle = 0;
	var rotateSpeed = -10;	
	//this.setToSpell();
	
	// Call the parent class Orb
	Orb.call(this, colRow, type, gravity);
	this.setImage("spellOrb"); // Calls parent orb's function to set the sprite
	
	/***************************** Privileged Functions **********************/
	
	// Return the spell set in the spell orb
	this.getSpell = function() {
		return spell;
	}
	
	// Call the approriate spell to activate
	this.activate = function() {
		spell.activate(colRow);
	}
	
	// Need to store Orb's draw in a variable
	var superDraw = this.draw;
	
	// Draw function. Draws the aura behind the spell orb, which rotates
	this.draw = function(offsetX, offsetY, mirroredInt) {
		angle = (angle + rotateSpeed) % 360;
		spellAura.drawRotatedImage((mirroredInt * colRow.getFirst()) + offsetX - 0.5,
					colRow.getSecond() + offsetY - 0.5, 
			1, 1, angle, 0, 2, 2, null);
		
		// Now call Orb's draw
		superDraw(offsetX, offsetY, mirroredInt);
	}
}