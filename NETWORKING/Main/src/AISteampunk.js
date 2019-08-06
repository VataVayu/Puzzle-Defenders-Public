 /* AISteampunk is a WebWorker run from the AIHandler file. It decides on moves
 * for the Steampunk race when playing as an AI.
 *
 * function onmessage(e (string representation of game state)):
 *          Recieves game state as a string from AIHandler's utilityWorker
 *          Controls the calculation of the moves for the Steampunk AI
 *          On first run, starts runner(), which sends commands to AIHandler
 * function runner(): Purely output, cannot be called from outside file
 *          Sends commands to behaviorWorker.onmessage(e) in AIHandler
 *          Commands:   "u" --> move up
 *                      "d" --> move down
 *                      "a" --> throw sacrifice/activator orb
 *                      "n" --> throw normal orb
 *                      "q","reupdate" --> reupdate the game state
*/


var started = false;
var stopped = 0;
var updateTime;
var runnerID;

//Starting shield variables
var shieldWall = false;
var spawnsCollected = false;

var newBase = new Array();
var oldBase = new Array();
var spawnNum = 13;
var spawnCol;
var underCol;
var strikeTypes = [-1, -1, -1];
var strikeSizes = [0, 0, 0];
var reds = new Array();
var endShieldWall = false;

var targets;
var rowIsTargeted;

var myBoard;
var numCols;
var numRows;

//list of commands to be sent to main game to run the AI
var myCommands = new Array();

var myPosition;
var myResources;
var myShields;
var oppResources;

var myPair;
var firstOrb;
var secondOrb;
var indent;

var frontOrbs;      //record of type and column of closest orbs to player
var frontUpdate;    //must redo all of front orbs




//Thread function to handle moves and response time
this.onmessage = function(e){
	update(JSON.parse(e.data));
    if(!started){
        started = true;
        if(isEmptyArr(myShields)){  //actual start, not reborn Web Worker
            shieldWall = true;
            oldBase = myBoard[numCols-1];
            var temp = (updateTime > 100) ? updateTime : 100;
            runnerID = setInterval(runner, temp);
        }
        else{
            runnerID = setInterval(runner, updateTime);
        }
        callForUpdate();
    }
    else if(!isDone()){
        makeMoves();
    }
}

this.runner = function(){
    if(myCommands.length > 0){
        postMessage(myCommands.shift());
        stopped = 0;
    }
    else if(stopped > 1000.0/updateTime){
        postMessage('q');
        stopped = 0;
    }
    else{
        stopped++;
    }
    
    if(endShieldWall && myCommands.length == 0){
        endShieldWall = false;
        clearInterval(runnerID);
        runnerID = setInterval(runner, updateTime);
        shieldWall = false;
    }
}

//// updating state of game ////
this.update = function(state){
    updateTime = state.speed;
    numRows = state.boardSize[1];
    numCols = state.boardSize[0];

    myShields = state.myShields;
    myResources = state.myResources;
    oppResources = state.oppResources;
    
    myCommands = new Array();
    
    collectTargets();
    observeBoard(state);
    spawnFinder();
    if(shieldWall && !spawnsCollected){
        spawnCol = myBoard[spawnNum];
        underCol = myBoard[spawnNum+1];
        //collectReds(spawnCol);
        spawnsCollected = true;
    }

    myPair = state.myPairedStats;
    firstOrb = myPair[0];
    secondOrb = myPair[1];
    indent = -1;
    
    myPosition = state.myPosY;
    frontUpdate = true;
    findColFrontOrb(0);
}

this.spawnFinder = function(){
    newBase = myBoard[numCols-1];
    if(isEqual(oldBase, newBase)){
        if(isEqual(newBase, myBoard[numCols-2])){
            endShieldWall = true;
        }
    }
    else{
        oldBase = newBase;
        spawnNum--;
    }
}
this.collectTargets = function(){
    targets = new Array();
    rowIsTargeted = [0,0,0,0,0,0,0,0,0,0];

    for(var i = 0;i<numRows;i++){
        if(oppResources[i] != 0){
            targets.push(i);
            rowIsTargeted[i] = 1;
        }
    }    
}
this.observeBoard = function(state){
    myBoard = new Array();
    for(var c = 0;c<numCols;c++){           //make boards
        myBoard[c] = state.myBoard[c];
    }
}
//////////////////  Move Deciding Methods  /////////////////////

this.makeMoves = function(){
    if(shieldWall){
        makeShieldWall();
    }
    else if(targets.length == 1){
        attackTarget(targets[0]);
    }
    else if(targets.length > 1) {
        runMidgameController();
    }
    callForUpdate();
}

//////////Starting Shield //////////////////

this.makeShieldWall = function(){
    if(firstOrb == "f"){
        moveRed();
    }
    else if(!otherClear()){
        otherPlace();
    }
}
this.collectReds = function(col){
    for(var i = 0; i< numRows;i++){
        if(col[i] == "f"){
            reds.push(i);
        }
    }
}
this.moveRed = function(){
    var redCount = 0;
    for(var row = 0; row<numRows; row++){
        if(spawnCol[row] == "f") 
            redCount++;
    }
    for(var row = 0; row<numRows; row++){
        if(spawnCol[row] == ""){
            mover(row);
            spawnCol[row] = "f";
            if(redCount == 9){
              tossSacrifice();
              endShieldWall = true;
            }
            else{
                reds.push(row);
                tossNormal();
            }
            return;
        }
    }
    for(var row = 0; row<numRows; row++){
        if(spawnCol[row] != "f"){
            mover(row);
            spawnCol[row] = "";
            tossSacrifice();
            return;
        }
    }
}
        

this.otherClear = function(){
    for(var i=0;i<spawnCol.length;i++){
        if(spawnCol[i] != "f" && spawnCol[i] != ""){
            if(spawnCol[i] != firstOrb || underCol[i] != firstOrb){
                mover(i);
                spawnCol[i] = "";
                tossSacrifice();
                return true;
            }
        }
    }
    return false;
}
this.otherPlace = function(){
    switch(firstOrb){
        case "e":
            strike(2,1,0);
            break;
        case "w":
            strike(1,0,2);
            break;
        case "a":
            strike(0,1,2);
            break;
        default:
            mover(9);
            tossNormal();
            break;
    }
}
this.strike = function(type1, type2, type3){
    if(strikeTypes[type1] == -1 || strikeSizes[type1] > 5){
        strikeTypes[type1] = findOpenRow();
        
        if(strikeTypes[type1] == -1){
            mover(findCleared());
            tossNormal();
            tossSacrifice();
        }
        else{
            strikeSizes[type1] = 1;
            mover(strikeTypes[type1]);
            tossNormal();
        }
    }
    else{
        mover(strikeTypes[type1]);
        strikeSizes[type1]++;
        tossNormal();
        return;
    }
}

this.findOpenRow = function(){
    for(var i = 0; i<reds.length; i++){
        for(var j = 0; j<numCols; j++){
            if(myBoard[j][reds[i]] != ""){
                if(myBoard[j][reds[i]] == "f"){
                    return reds[i];
                }
                else{
                    break;
                }
            }
        }
    }
    return -1;
}
this.findCleared = function(){
    for(var i = 0;i<numRows;i++){
        if(spawnCol[i] == ""){
            return i;
        }
    }
    return -1;
}



//////////Midgame Moves ////////////////////
this.runMidgameController = function(){
    if(topMatches());
    else if(secondMatches());
    else if(emptyRowTargeted());
    else discard();
}

this.topMatches = function(){
    for(var i=0;i<targets.length;i++){
        var row = targets[i];
        var col = findColFrontOrb(row);
        if(col > numCols-1){
            continue;
        }
        else{
            var frontOrb = myBoard[col][row];
            if(firstOrb == frontOrb){
                mover(row);
                tossNormal();
                if(secondOrb == frontOrb){
                    tossSacrifice();
                }
                return true;
            }
        }
    }
    return false;
}

this.secondMatches = function(){
    for(var i=0;i<targets.length;i++){
        var row = targets[i];
        var col = findColFrontOrb(row);
        if(col >= numCols-1){
            continue;
        }
        else{
            var underOrb = myBoard[col+1][row];
            if(secondOrb == underOrb){
                mover(row);
                tossSacrifice();
                tossNormal();
                return true;
            }
        }
    }
    return false;
}

this.emptyRowTargeted = function(){
    for(var i=0;i<targets.length;i++){
        var row = targets[i];
        var col = findColFrontOrb(row);
        if(col != numCols){
            continue;
        }
        else{
            if(firstOrb == secondOrb){
                mover(row);
                tossNormal();
                tossNormal();
                return true;
            }
        }
    }
    return false;
}

this.clearTop = function(){
    for(var i=0;i<targets.length;i++){
        var row = targets[i];
        var col = findColFrontOrb(row);
        if(col < numCols-1){
            var topOrb = myBoard[col][row];
            var udrOrb = myBoard[col+1][row];
            if(topOrb != udrOrb){
                mover(row);
                tossSacrifice();
                return true;
            }
        }
    }
}

this.discard = function(){
    var index = Math.floor(Math.random()*numRows);
    for(var i=0;i<numRows;i++){
        var row = (index+i) % numRows;
        if(!(rowIsTargeted[row])){
            mover(row);
            tossNormal();
            return true;
        }
    }
}
//////////Terminal Target //////////////////
this.attackTarget = function(final){
    var col = findColFrontOrb(final);
    if(col == numCols){     //empty row, start filling
        mover(final);
        tossNormal();
    }
    else if(firstOrb == myBoard[col][final]){    //start attack
        mover(final);
        tossNormal();
        if(firstOrb == secondOrb){
            tossSacrifice();
        }
    }
    else{                                   //clear wrong element
        shunt(final);
    }
}

////////// Movement / Plays //////////////////
this.mover = function(row){
    if(isValidRow(row)){
        while(myPosition > row){
            up();
        }
        while(myPosition < row){
            down();
        }
    }
}
this.up = function(){
    if(myPosition > 0){
        myCommands.push('u');
        myPosition--;
    }
}
this.down = function(){
    if(myPosition < numRows - 1){
        myCommands.push('d');
        myPosition++;
    }
}

//tosses a single normal orb
this.tossNormal = function(){
    try{
        var curFront = findColFrontOrb(myPosition);
        indent++;
        if(curFront > 0){
            myBoard[curFront-1][myPosition-1]=myPair[indent];
        }
        myCommands.push('n');
    }catch(err){
        postMessage("Error in tossNormal: "+err+": "+curFront);
        postMessage("reupdate");
    }
}
//tosses a single activator/sacrifice orb
//currently only works for killing front orb in row
this.tossSacrifice = function(){
    try{
        var curFront = findColFrontOrb(myPosition);
        indent++;
        if(curFront != numCols){
            if(myBoard[curFront][myPosition] != myPair[indent]){
                myBoard[curFront][myPosition] = "";
                updateColFrontOrb(myPosition);
            }
        }
        myCommands.push('a');
    }catch(err){
        postMessage("Error in tossSacrifice: "+err);
        postMessage("reupdate");
    }
}

this.callForUpdate = function(){
    myCommands.push('q');
}
this.shunt = function(row){
    if(row > 0){
        mover(row-1);
    }
    else{
        mover(row+1);
    }
    tossNormal();
}


//////////////////// Information Gathering //////////////////////
this.isValidRow = function(row){
    return (row >= 0 && row < numRows);
}
this.isEmptyArr = function(arr){
    for(var i = 0;i<arr.length;i++){
        if(arr[i] != 0) return false;
    }
    return true;
}
this.isEqual = function(arr1, arr2){
    if(arr1.length != arr2.length) return false;
    
    for(var i = 0;i<arr1.length;i++){
        if(arr1[i] != arr2[i]){
            return false;
        }
    }
    
    return true;
}
this.isDone = function(){
    if (targets.length == 0) return true;   //if opp has no resources
    return isEmptyArr(myResources);         //if I have no resources
}
this.findColFrontOrb = function(row){
    if(!isValidRow(row)){
        return null;
    }
    else if(frontUpdate){
        frontOrbs = new Array();
        for(var r=0; r < numRows; r++){
           frontOrbs.push(updateColFrontOrb(r));
        }
        frontUpdate = false;
    }
    return frontOrbs[row][0];
}
this.updateColFrontOrb = function(row){
    var col;
    
    for(col = 0;col<numCols && myBoard[col][row] == '';col++);
    
    if(col == numCols){
        return [col, null];
    }
    else{
        return [col, myBoard[col][row]];
    }
}