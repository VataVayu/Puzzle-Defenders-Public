/**
* Fairy Class, subclass of Orb. A Fairy can either attack the enemy's resource 
* or protect its owner's resource from other fairies.
* 
* function Fairy(Pair, string, int, int, int, boolean, Pair, string, boolean): 
		Contains the class structure of Fairy.
* function getHealth(): Returns this Fairy's current health.
* function getDamage(): Returns this Fairy's damage.
* function isAlive(): Returns true if this Fairy is alive and false otherwise.
* function isAggressive(): Returns true if this Fairy is an attack fairy and 
*		false if it is a shield fairy.
* function resolveFairyCollision(Fairy): Resolves damage from an enemy fairy.
* function collidedWithFairy(Fairy): Attempts a collision check and damage 
*		resolution between this Fairy and another Fairy and returns true if 
*		successful. Otherwise the function returns false.
* function collidedWithResource(Resource): Returns true if this Fairy collided 
*		with a resource, in which case the resource is damaged and the Fairy 
*		dies. The function returns false otherwise.
* function collisionDetected(Object): Performs a collision check between this 
*		Fairy and another entity.
* function draw(): Draws this Fairy.
**/

subclass(Fairy, Orb);
function Fairy(colRow, type, gravity, health, damage, aggressive, destination, 
			   playerSide, attuned) { 
					
	Orb.call(this, colRow, type, gravity);
	var maxHealth;
	
	if (attuned) {
		if (aggressive) {
			damage = damage * variableContainer.attunedMultiplier;
			this.setImage("attunedFairy");
		}
		else {
			health = health * variableContainer.attunedMultiplier;
			this.setImage("attunedShield");
		}
	} else {
		if (aggressive) {
			this.setImage("fairy");
		}
		else {
			this.setImage("shield");
		}
	}
	maxHealth = health;
	
	if (aggressive == null) {
		aggressive = true;
	}
	
	if (destination == null) {
		destination = colRow;
	}
	this.setDestination(destination.getFirst(), destination.getSecond());
	
	
	/******************************Privileged Functions***********************/
	
	/**************************************************************************
	Returns this Fairy's current health.
	**************************************************************************/
	this.getHealth = function() {
		return health;
	}
	
	/**************************************************************************
	Returns this Fairy's damage.
	**************************************************************************/
	this.getDamage = function() {
		return damage;
	}
	
	/**************************************************************************
	Returns true if this Fairy is alive and false otherwise.
	**************************************************************************/
	this.isAlive = function() {
		return health > 0;
	}
	
	/**************************************************************************
	Returns true if this Fairy is an attack fairy and false if it is a shield
	fairy.
	**************************************************************************/
	this.isAggressive = function() {
		return aggressive;
	}
	
	/**************************************************************************
	Resolves damage from an enemy fairy.
	**************************************************************************/
	this.resolveFairyCollision = function (enemy) { 
		health -= enemy.getDamage();
		if (health < 0)
			health = 0;
	}
	
	/**************************************************************************
	Attempts a collision check and damage resolution between this Fairy and
	another Fairy and returns true if successful. Otherwise the function
	returns false.
	**************************************************************************/
	this.collidedWithFairy = function(enemy) {
		if (this.collisionDetected(enemy)) {
					
			if (this.isAggressive() && enemy.isAggressive()) {
				SoundJS.play("attacksCollided", SoundJS.INTERRUPT_LATE, 1);
			} else {
				SoundJS.play("attackHitShield", SoundJS.INTERRUPT_LATE, 1);
			}
			
			this.resolveFairyCollision(enemy);
			enemy.resolveFairyCollision(this);
			return true;
		}
		return false;
	}
	
	/**************************************************************************
	Returns true if this Fairy collided with a resource, in which case the 
	resource is damaged and the Fairy dies. The function returns false
	otherwise.
	**************************************************************************/
	this.collidedWithResource = function(resource) {
		if (resource.isAlive() && this.collisionDetected(resource)) {
			resource.damage();
			health = 0;
			return true;
		}
		return false;
	}
	
	/**************************************************************************
	Performs a collision check between this Fairy and another entity.
	**************************************************************************/
	this.collisionDetected = function(enemy) {
		if (((enemy.getColRow().getFirst() + 1) * 
			  variableContainer.cellDimensions.getFirst() > 
			  this.getColRow().getFirst() * 
			  variableContainer.cellDimensions.getFirst()) && 
			((enemy.getColRow().getFirst() - 1) * 
			  variableContainer.cellDimensions.getFirst() < 
			  this.getColRow().getFirst() * 
			  variableContainer.cellDimensions.getFirst())) {
			  
			if (((enemy.getColRow().getSecond() + 1) * 
				  variableContainer.cellDimensions.getSecond() > 
				  this.getColRow().getSecond() * 
				  variableContainer.cellDimensions.getSecond()) && 
				((enemy.getColRow().getSecond() - 1) * 
				  variableContainer.cellDimensions.getSecond() < 
				  this.getColRow().getSecond() * 
				  variableContainer.cellDimensions.getSecond())) {
				  
				  return true;
			}			
		}
		return false;
	}
	
	/**************************************************************************
	Draws this Fairy.
	**************************************************************************/
	this.draw = function() {
		var downsizedPercent = .5 + .5 * (health / maxHealth);
		
		if (playerSide == "left") {
			this.getSprite().draw(this.getColRow().getFirst() + .5 - 
								  downsizedPercent / 2,
								  this.getColRow().getSecond() + .5 - 
								  downsizedPercent / 2, 
								  null, 
								  downsizedPercent, 
								  downsizedPercent);
		} else {
			this.getSprite().drawFlipImage(this.getColRow().getFirst() - 
										   .5 + downsizedPercent / 2, 
										   this.getColRow().getSecond() + 
										   .5 - downsizedPercent / 2, 
										   null, 
										   downsizedPercent, 
										   downsizedPercent);
		}
	}
	
}