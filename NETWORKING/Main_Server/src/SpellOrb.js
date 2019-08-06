// Import required files to run this class
var Utilities = require('../libraries/Utilities.js');
var Orb = require('./Orb.js');

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
 **/
 
Utilities.subclass(SpellOrb, Orb);
function SpellOrb(spell, colRow, type, gravity) {
	Orb.call(this, colRow, type, gravity);
	
	/***************************** Privileged Functions **********************/
	
	// Return the spell set in the spell orb
	this.getSpell = function() {
		return spell;
	}
	
	// Call the approriate spell to activate
	this.activate = function() {
		spell.activate(colRow);
	}
}

// Export the class for other classes to use
module.exports = SpellOrb;