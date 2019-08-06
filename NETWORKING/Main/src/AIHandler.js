/* AIHandler stands in for the InputHandler in Character in the case
 * on an AI being selected to play.  All interactions with the AI's 
 * decision making go through this class. 
 *
 *
 * function AIHandler (isPlayerOne (boolean), attitudeIndex (int),
 *                    raceName (string), scriptActive (boolean),
 *                    updateSpeed (int))
 *          Creates web workers for AI's move calculation, deletes them when
 *          needed, and updates them with the current game state.  Sets 
 *          importance of different types of move(possible option, not fully
 *          implemented). Sends actions from AI to the rest of the game.
 * function destructor(): Terminates the Web Workers, allowing for creation
 *          of new ones later.  
 * function update(state (json)):
 *          checks if the garbage collector ate the active web worker
 *          recreates the webworker if needed
 *          causes addition of unique information to json message
 *          sends game state to decide on whether to update AI's state
 * function makeMessage(state (json)):
 *          adds information unique to AIHandler to the game state message
 * function executeAction(action (string: "u","d","l","r",
 *                                        "g","n","e",
 *                                        "t","a","o",
 *                                        "p","q","reupdate"))
 *          Translates commands from the AI into actions for the rest of the
 *          game to understand.  Can be called from outside to do scripted
 *          actions in tutorial mode.
 * function onmessage(e (message)): NOT TO BE TOUCHED from outside AIHandler
 *          Used to communicate between AIHandler and Web Workers deciding
 *          on what actions to take in playing.
 *
*/

function AIHandler(isPlayerOne, attitudeIndex, raceName, 
                    scriptActive, updateSpeed) {
    var isOne = isPlayerOne;
    var updateWorker = null;    //decides whether to update state
	var utilityWorker = null;   //calculates need for atk/def
	var behaviorWorker = null;  //decides on moves
    var upSpeed = updateSpeed;
    var messageCount=0;
    var actionQueue = new Array();
    var shouldUpdate=false;     //override for AIUpdateChecker
    var jsonobj;                //Web Worker message carrier
    var myAttitude;
    var myRace;
    var self = this;
    
    var attitudesList = { };    //preferences for matches
    
    //list in order: atk, def, big, tiny, fire, water, earth, air
    attitudesList.bigFireAttack = [10, -5, 8, 0, -5, -6, 0, 0];    
    attitudesList.defensiveEarth = [-5,10,0,0,-6,0,10,0];
    attitudesList.attackNeedleFireStorm = [10,-5,-5,10,10,0,0,10];
    attitudesList.defensiveMaelStrom = [-8,10,0,0,-6,10,-6,10];
    attitudesList.jackOfAllTrades = [0,0,0,0,0,0,0,0];
    attitudesList.bigJackOfAllTrades = [0,0,10,-10,0,0,0,0];
    attitudesList.tinyJackOfAllTrades = [0,0,-10,10,0,0,0,0];

    //Timer to profile the computation time for the AI
    //var profilingTimer = new Timer();
    
    switch(attitudeIndex){
        case 1:  myAttitude = attitudesList.bigFireAttack;break;
        case 2:  myAttitude = attitudesList.defensiveEarth;break;
        case 3:  myAttitude = attitudesList.attackNeedleFireStorm;break;
        case 4:  myAttitude = attitudesList.defensiveMaelStrom;break;
        case 5:  myAttitude = attitudesList.bigJackOfAllTrades;break;
        case 6:  myAttitude = attitudesList.tinyJackOfAllTrades;break;
        default: myAttitude = attitudesList.jackOfAllTrades;break;
    }
    
    updateWorker = new Worker("src/AIUpdateChecker.js" );  
    utilityWorker = new Worker("src/AIUtility.js");
    
    switch(raceName){
        case "angel":
            behaviorWorker = new Worker("src/AIAngel.js");
            console.log("AI playing as Angel");
            break;
        case "steampunk":
            behaviorWorker = new Worker("src/AISteampunk.js");
            console.log("AI playing as Steampunk");
            break;
        case "witch":
            behaviorWorker = new Worker("src/AIWitch.js");
            console.log("AI playing as Witch");
            break;
    }
    
// function updateWorker.onmessage(e (message)):
//          Receives update command.  If needed, sends command to decide
//          importance of attack vs defense based on the current game state.
    updateWorker.onmessage = function(e){
        if(e.data == "Redo this"){      //health changed (self or opp)
            shouldUpdate = true;
        }
        else if(e.data == "row"){       //first column changed
            if(raceName != "angel"){    //angel can change these
                utilityWorker.postMessage(JSON.stringify(jsonobj));
            }
        }
        else if(e.data =="Let's go!") { //changed last frame, not this one
            utilityWorker.postMessage(JSON.stringify(jsonobj));     
        }
    }
// function utilityWorker.onmessage(e (message)):
//          Receives message on importance of attack vs def in current game
//          state.  Sends state with importance to behaviorWorker to decide
//          on moves.
    utilityWorker.onmessage = function(e){
        jsonobj.myInsistence = JSON.parse(e.data);
        behaviorWorker.postMessage(JSON.stringify(jsonobj));
        messageCount++;
    }
// function behaviorWorker.onmessage(e (message)):
//          Receives commands from behaviorWorker and sends them to be run 
    behaviorWorker.onmessage = function(e){
        self.executeAction(e.data);
        messageCount=0;
    }
// function destructor(): Terminates and sets to null all webworkers in this
//          instance of AIHandler
    this.destructor = function() {
        if(updateWorker != null){
            updateWorker.terminate();
            updateWorker = null;
        }
        if(utilityWorker != null){
            utilityWorker.terminate();
            utilityWorker = null;
        }
        if(behaviorWorker != null){
            behaviorWorker.terminate();
            behaviorWorker = null;
        }
        //console.log("Workers for "+isOne+" closed");
    }
// destroys web workers if in tutorial mode, web workers not needed
    if(scriptActive){
        this.destructor();
    }
//  function setMyRace(race (Race: Angel, Steampunk, Witch)):
//          Sets myRace to appropriate race, to allow for actions in game
	this.setMyRace = function(race) {
		myRace = race;
	}
    
//  function executeAction(action (string: "u","d","l","r",
//                                         "g","n","e",
//                                         "t","a","o",
//                                         "p","q","reupdate"))
//          Receives a string token and does the steps needed to cause the
//          represented action in the main game.  "o" is no longer in use.
    this.executeAction = function( action ) {
        switch (action) {                   
            case "u":   //move character up
                if (myRace.moveVertically(-1)) {
                    actionQueue.push("up");
                }
                break;
            case "d":   //move character down
                if (myRace.moveVertically(1)) {
                    actionQueue.push("down");
                }
                break;
            case "l":   //move selector left in Angel
                if (myRace.moveHorizontally != null && 
                    myRace.moveHorizontally(-1)) {
                    actionQueue.push("left");
                }
                break;
            case "r":   //move selector right in Angel
                if (myRace.moveHorizontally != null && 
                    myRace.moveHorizontally(1)) {
                    actionQueue.push("right");
                }
                break;
            case "g":   // mage grabs orb
            case "n":   // steampunk launches normal orb
            case "e":   // angel exchanges orbs in selector
                myRace.abilityA();
                //    actionQueue.push("abilityA");
                break;
            case "t":   // mage throws orbs
            case "a":   // steampunk launches an activator/sacrifice orb
            case "o":   // angel toggles the orientation of selector
                        // case "o" is obsolete
                myRace.abilityB();
                //    actionQueue.push("abilityB");
                //}
                break;
            case "q":
            case "reupdate": 
                shouldUpdate = true; 
                break;
            case "p":   //tutorial pause message
                break;
        }
    }    
//  function makeMessage(state(json)):
//            adds unique to AIHandler information to json message
   
	this.makeMessage = function( state ){   //store the game state
        state.isOne = isOne;
        state.updater = shouldUpdate;
        state.myPreferences = myAttitude;
        if(updateSpeed == null){
            state.speed = 150;
        }
        else{
            state.speed = upSpeed;
        }
    }
    
//  function update(state(json)):
//          recieves game state from Character each frame
//          checks if the garbage collector ate the active web worker
//          recreates the webworker if needed
//          adds unique information to json message
//          sends game state to decide on whether to update AI's state
	this.update = function( state ) {
        if(messageCount > 2){
            switch(raceName){
                case "angel": 
                    behaviorWorker = new Worker("src/AIAngel.js");
                    break;
                case "steampunk": 
                    behaviorWorker = new Worker("src/AISteampunk.js");
                    break;
                case "witch": 
                    behaviorWorker = new Worker("src/AIWitch.js");
                    break;
            }
            messageCount = 0;
            
            behaviorWorker.onmessage = function(e){
                self.executeAction(e.data);
                messageCount=0;
            }
        }
        jsonobj = state;
        this.makeMessage(jsonobj);  //summarize the state into one object
        updateWorker.postMessage(JSON.stringify(jsonobj));
        shouldUpdate = false;       //reset the override switch
    }
}
