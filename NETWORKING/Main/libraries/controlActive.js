/** The controlActive object holds the data that will determine what controls 
* 	are available during the tutorial sequence. True means to turn on and 
*	False means to turn it off.
*
* function get_tUpFlag() : This accessor will return a boolean on whether a 
* 		person can move up.
*
* function get_tDownFlag() : This accessor will return a boolean on whether a 
* 		person can move down.
*
* function get_tLeftFlag() : This accessor will return a boolean on whether a 
* 		person can move left.
*
* function get_tRightFlag() : This accessor will return a boolean on whether 
* 		a person can move right.
*
* function get_tAbilityAFlag() : This accessor will return a boolean on whether 
* 		a person can move AbilityA.
*
* function get_tAbilityBFlag() : This accessor will return a boolean on whether 
* 		a person can move AbilityB.
**/

//controlActive(boolean, boolean, boolean, boolean, boolean, boolean)
function controlActive(tUpFlag, tDownFlag, tLeftFlag, tRightFlag, 
		tAbilityAFlag, tAbilityBFlag){
	
	//This accessor will return a boolean on whether a person can move up.
	this.get_tUpFlag = function() {
		return tUpFlag;
	}
	
	//This accessor will return a boolean on whether a person can move down.
	this.get_tDownFlag = function() {
		return tDownFlag;
	}
	
	//This accessor will return a boolean on whether a person can move left.
	this.get_tLeftFlag = function() {
		return tLeftFlag;
	}
	
	//This accessor will return a boolean on whether a person can move right.
	this.get_tRightFlag = function() {
		return tRightFlag;
	}
	
	//This accessor will return a boolean on whether a person can move 
	//AbilityA.
	this.get_tAbilityAFlag = function() {
		return tAbilityAFlag;
	}
	
	//This accessor will return a boolean on whether a person can move 
	//AbilityB.
	this.get_tAbilityBFlag = function() {
		return tAbilityBFlag;
	}
}