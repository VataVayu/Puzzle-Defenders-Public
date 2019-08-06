// SubClass functionality - edit if necessary
//Cleaned up with format
function subclass(constructor, superConstructor) {
	function surrogateConstructor() {
	}

	surrogateConstructor.prototype = superConstructor.prototype;

	var prototypeObject = new surrogateConstructor();
	prototypeObject.constructor = constructor;

	constructor.prototype = prototypeObject;
}

/**********************************************************
 This is to allow ease of passing pairs of coordinates!
Note: Using pairOne = pairTwo does indeed set pairOne's elements to those of pairTwo.
 However, pairOne == pairTwo will always equate to false if their elements have the same values unless
 = is used (one is pointing at the other). 
For example: pairOne = new Pair(5, 8); pairTwo = new Pair(5, 8). 
pairOne == pairTwo will return false.
Now, I'll set pairOne to pairTwo like so: pairOne = pairTwo;
pairOne == pairTwo will return true.
Thus, if you want to compare two pairs, use my custom .equals() method instead
************************************************************/
function Pair(elementOne, elementTwo) {
	
	this.getFirst = function() {
		return elementOne;
	}
	
	this.getSecond = function() {
		return elementTwo;
	}
	
	this.setFirst = function(e) {
		elementOne = e;
	}
	
	this.setSecond = function(e) {
		elementTwo = e;
	}
	
	this.toString = function() {
		return "(" + elementOne + ", " + elementTwo + ")";
	}
}

//Callback function for packet loss
//Keeps calling back until the function hits the terminator
//If it hits the terminator, the package was sent through correctly, if it didn't
//Then we have a problem.


module.exports.subclass = subclass;
module.exports.Pair = Pair;