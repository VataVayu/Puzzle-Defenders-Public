/* AIUpdateChecker is a web worker run from AIHandler. 
 * This class is use to determine whether the game state has changed enough
 * for the AI to need to update the current values it holds with what is
 * occurring in the main game.
 *
 * function onmessage(e (string representation of game state)):
 *          Recieves current game state and returns command if the change is
 *          enough to warrent an update
 * funtion needsUtilityUpdate(state (json)):
 *          Returns a boolean if the state has changed enough to need update
 * function update(state (json)):
 *          Stores the new variables to compare against (health, shields, row)
 * function arrDiff(arr1 (array[10]), arr2(array[10])):
 *          Returns a boolean if 2 same length arrays have different values
*/

var myBoard;        var healthChange;
var myResources;    var oppResources;
var myShields;      var oppShields;
var rowChange;

var counter = 50;

onmessage = function(e) {
	var state = JSON.parse(e.data);
	if (needsUtilityUpdate(state)) {
		update(state);
        if(healthChange){
            healthChange = false;
            postMessage("Redo this");
        }
        else if (rowChange){
            postMessage("row");
        }
        else{
            postMessage("Let's go!");
        }
        counter = 50;
	}
    else if(counter == 0){ //if no change in 50 frames, update
        postMessage("Let's go!");
        counter = 50;
    }
    else{
        counter--;
    }
}

function needsUtilityUpdate ( newState ){
    if(myBoard == null){   //if no prior information, load it
        return true;
    }
    
    healthChange =  arrDiff(newState.myShields, myShields)
			||  arrDiff(newState.oppShields, oppShields)
			||  arrDiff(newState.myResources, myResources)
			||  arrDiff(newState.oppResources, oppResources);
    rowChange = arrDiff((newState.myBoard)[myBoard.length-1],
								myBoard[myBoard.length-1]);
                               
	return  (newState.updater    //override called
            ||  healthChange     //self or opp healed or hurt
            ||  rowChange);      //row closest to resources changed
}
//checks if the contents of 2 arrays of same length are different.  
function arrDiff(arr1, arr2){
	for(var i=0;i < arr1.length ;i++){
		if( arr1[i]!=arr2[i] ) {
			return true;
		}
	}
	return false;
}

function update (state) { //update the current examined state
	myBoard = state.myBoard;
	myResources = state.myResources;
	myShields = state.myShields;
	oppResources = state.oppResources;
	oppShields = state.oppShields;
}

    