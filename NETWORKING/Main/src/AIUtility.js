/*
 * This class is supposed to calculate the utility and 
 * determine the behavior the AI should use. It contains 
 * functions that will calculate the utility and return 
 * the appropriate behavior. If we want to change the 
 * utility functions it will happen in this class.
 *
 *
 * function onmessage(e (string representation of state)):
 *          recieves the game state from AIHandler
 * function grabBoard(state (json holding gamestate)):
 *          stores the state variables important to Utility
 * function calcMyHealth(): adds the resource health + shields in front of 
 *          resources for AI's side
 * function calcOppHealth(): adds the resource health + shields in front of
 *          resources for Opponent's side
*/

var utilAtk;
var utilDef;
	
//AI's side
var myDefense;
var myShieldList;
var myResourceList;
	
//Opponent side
var oppDefense;
var oppShieldList;
var oppResourceList;

this.onmessage = function(e) {
	if (e.data.charAt(0) != '_') {
		grabBoard(JSON.parse(e.data));
		calcMyHealth();
		calcOppHealth();
		utilAtk = Math.log(100-oppHealth);  
		utilDef = Math.log(100-myHealth);  
		postMessage(JSON.stringify([utilAtk,utilDef]));    
	}
}
//update to the new values for the current state
this.grabBoard = function(state) {
	myResourceList = state.myResources;
	myShieldList = state.myShields;
	oppResourceList = state.oppResources;
	oppShieldList = state.oppShields;
}
	
//calculate value for my resources
//health only counts for live rows
this.calcMyHealth = function() {
	myHealth = 0;
	for(var i = 0; i < myResourceList.length; i++) {
        if(myShieldList[i] == null) 
            myShieldList[i]=0;
		if(myResourceList[i] != 0) {
			myHealth += myResourceList[i] + myShieldList[i];
        }
	}
}
	
//calculate value for opponent resources
//health only counts for live rows
this.calcOppHealth = function() {
    oppHealth = 0;
	for(var i = 0; i < oppResourceList.length; i++) {
        if(oppShieldList[i] == null) 
            oppShieldList[i]=0;
		if(oppResourceList[i] != 0) {
			oppHealth += oppResourceList[i] + oppShieldList[i];
		}
	}
}
