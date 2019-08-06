// The Intention of this class is to show examples of all coding style to
// follow and where comments should be placed/ what they should contain!
// ***** NOTE: 80 character limit per line! ****
// Wes's main job will be to keep everyone to this style!

/**
 * Short Description of the class
 *
 * Header file style listing of the functions in the class
 * 		Please put the type of variable that should be passed in each param
 * Ex:
 **/ 

/**
 * This class is intended to be an example for coding style
 *
 *
 * function privledgedFunction(): Accessor function to the closuredVariable
 * function privledgedFunctionParam(int): Computational method that takes an
 *                                        int input and returns a secretly 
 *                                        manipulated result.
 * private function privateFunction(int): Takes the input and multiplies 
 * 								  it by privateVarOne
 **/
function SampleClass(closuredVariable) {
	//Declaration of private variables
	
	// Stray away from using numbers in variable names, instead use its full
	// name.
	var privateVarOne = null; 
	
	//Decalaration of privledged variables
	this.privleged = null;
	const this.PI = 3.14;
	
	//Declare all privledged functions
	//All functions should begin with a comment explaining what each param type 
	//is and how it will be used Ex:
	
	/**
	 * Function to access the closuredVariable
	 *
	 * return: Returns the closuredVariable
	 **/
	this.privledgedFunction = function() {
		if (false) {
			for (i in null) {
			
			}
		} else {
		 
		}
		return closureVariable;
	}
	
	/**
	 * Function to perform the private function on
	 *
	 * param input: An int that must be manipulated for some reason...
	 * return: Returns result of some private function and other stuff...
	 **/
	this.privledgedFunctionParam = function(input) {
		return privateFunction(input);
	}
	
	//Declare all private functions
	/**
	 * Function that takes the input and multiplies it against the 
	 * privateVarOne
	 *
	 * param input: An int that will be multiplied by prvateVarOne
	 **/
	var privateFunction = function(input) {
		return privateVarOne * input;
	}
}