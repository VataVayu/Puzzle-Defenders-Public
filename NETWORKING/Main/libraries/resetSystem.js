/**The resetSystem Object is meant to determine what things on a board should 
* 	be reset. True means that it should be reset, false means that it shouldn't.
*
* function get_resetBoardOne() : This is an accessor that will return a boolean 
* 		on whether or not boardOne should be reset.
*
* function get_resetBoardTwo() : This is an accessor that will return a boolean 
* 		on whether or not boardTwo should be reset.
*
* function get_resetHealthOne() : This is an accessor that will return a 
* 		boolean on whether or not charOne's health should be reset.
* 
* function get_resetHealthTwo() : This is an accessor that will return a 
* 		boolean on whether or not charTwo's health should be reset.
**/
//resetSystem(boolean, boolean, boolean, boolean)
function resetSystem(resetBoardOne, resetBoardTwo, resetHealthOne, 
		resetHealthTwo) {
	//This is an accessor that will return a boolean on whether or not boardOne 
	//should be reset.
	this.get_resetBoardOne = function() {
		if(resetBoardOne != null)
			return resetBoardOne;
		return false;
	}
	
	//This is an accessor that will return a boolean on whether or not boardTwo 
	//should be reset.
	this.get_resetBoardTwo = function() {
		if(resetBoardTwo != null)
			return resetBoardTwo;
		return false;
	}	
	
	//This is an accessor that will return a boolean on whether or not charOne's 
	//health should be reset.
	this.get_resetHealthOne = function() {
		if(resetHealthOne != null)
			return resetHealthOne;
		return false;
	}
	
	//This is an accessor that will return a boolean on whether or not charTwo's 
	//health should be reset.
	this.get_resetHealthTwo = function() {
		if(resetHealthTwo != null)
			return resetHealthTwo;
		return false;
	}
}