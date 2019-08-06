/* AIWitch is a WebWorker run from the AIHandler file. It decides on moves
 * for the Witch race when playing as an AI.
 *
 * function onmessage(e (string representation of game state)):
 *          Recieves game state as a string from AIHandler's utilityWorker
 *          Controls the calculation of the moves to be made for the Witch AI
 *          On first run, starts runner(), which sends commands to AIHandler
 * function runner(): Purely output, cannot be called from outside file
 *          Sends commands to behaviorWorker.onmessage(e) in AIHandler
 *          Commands:   "u" --> move up
 *                      "d" --> move down
 *                      "g" --> grab orb
 *                      "t" --> throw hand
 *                      "q","reupdate" --> reupdate the game state
*/

// used to compute its moves
var myBoard;
var myShields;
var myResources;
var oppShields;
var oppResources;

var actRowSource;
var myPair;
var numRows;
var numCols;
var myPosition;
var myMaxShieldSize;
var insistence = [1,1]; // {atk, def}

// {atk, def, big, small, fire, water, earth, air}
var preferences;
var minSizeOfBig = 6;
var maxSizeOfSmall = 4;

//list of commands to be sent to main game to run the AI
var myCommands = new Array();
var matchAtk = {};
var matchDef = {};

//A second function that act as current board state
var storedBoard;
var storedPos;
var storePair;
var frontOrbs;
var frontUpdate;    //must redo all of front orbs
var stopped = 0;
var isOne;
var started = false;

//response time of the AI.
var updateTime;

//a row that AI cannot use.
var usedRow = null;

//main function that sends a command back to AI.
this.runner = function(){
	if(myCommands.length > 0) {
		//postMessage(myCommands);
        var commandSent = myCommands.shift();
        postMessage(commandSent);
        updateStoredVars(commandSent);
        stopped = 0;
    }else if (stopped > 2000/updateTime){
		stopped = 0;
		postMessage("reupdate");
		
    }else{
        stopped++;
    }
}

//A function to update the storedBoard after doing specific calculations.
this.updateStoredVars = function(commandSent){
    try{
        switch(commandSent){
            case "u": storedPos--;break;
            case "d": storedPos++;break;
            case "g":  
                var temp = findCurFrontCol(storedPos);
                if(temp == null){ 
                    //invalid row
                }
                else if(temp==numCols){ 
                    //empty row
                }
                else {
                    storePair[0] = storedBoard[temp][storedPos];
                    storedBoard[temp][storedPos] = "";
                    storePair[1] += 1;
                }
                break;
            case "t": 
                while(findCurFrontCol(storedPos)>0 && storePair[1] > 0){
                    var frontStore = findCurFrontCol(storedPos);
                    storedBoard[frontStore][storedPos] = storePair[0];
                    storePair[1]--;
                }
                storePair[0]=null;
                storePair[1]=0;
                break;
        }
    } catch(err) {      //board got corrupted, restart calculations
        postMessage("board corrupted: storedVars");
        postMessage("reupdate");
    }  
}

//Thread function to handle moves and response time
this.onmessage = function(e){
	update(JSON.parse(e.data));
    if(!started){
        started = true;
        setInterval(runner, updateTime);
    }
    if(gamegoing()){
        makeMoves();
    }
    else{
        myCommands = {};
    }
}
//returns true if both players still have resources (game not over)
this.gamegoing = function(){
    var res1 = 0;
    var res2 = 0;
    for(var i=0;i<numRows;i++){
        if(myResources[i] != 0) res1++;
        if(oppResources[i] != 0)res2++;
    }
    return (res1 != 0 && res2 != 0);
}
            
        
//calculates the moves with building of attacklist and shield list.
//gets the best match to use based on utility information
this.makeMoves = function(){
    var matches = findMatches(myPair, myBoard);
    if(matches.length == 0)
        smallMatchMaker();
    else if(myPair[1] > 0) {
		myCommands = new Array();
		tossOccupiedHand();
		myCommands.push("q");
	}else{
        var utils = new Array(matches.length);
        var maxUtilIndex = 0;
        for (var i = 0; i<utils.length; i++){
            utils[i] = evaluateUtil(matches[i],i);
            if (utils[i] > utils[maxUtilIndex]){
                maxUtilIndex = i;
            }
        }
        if(utils[maxUtilIndex] > 0)
            getMoves(matches[maxUtilIndex]);
        else
            smallMatchMaker();
    }
}



//builds a list of matches available for attack and shields.
this.findMatches = function(){
    var matches = new Array();
    attackListBuilder(matches);
    shieldListBuilder(matches);
    return matches;
}

//calculates the match available to see if it is viable.  
//if not, do small match maker.
this.getMoves = function(target){
    if(!activateMatch(target, uncover(target)))
        smallMatchMaker();
}

//function that builds a small attack
this.smallMatchMaker = function(){
    myCommands=new Array();
    myBoard = storedBoard;
    myPosition = storedPos;
    myPair = storePair;
	//postMessage(myBoard);
    var elementalList = new Array();
    for(var i=0;i<4;i++)
        elementalList.push(new Array());
     frontUpdate = true;   
     for(var i=0;i<numRows;i++){

        var start = findColFrontOrb(i);
        if(start == numCols || (i == usedRow)) continue;        
        var orbType;
        try{
           orbType = myBoard[start][i];
        }catch(err){                    //invalid column
            postMessage("SMM, col:"+start+" row:"+i);
            continue;
        }
        var slot = -1;
        switch(orbType) {
			case "a":
				slot = 0; 
				break;
			case "w":
				slot = 1; 
				break;
			case "e":
				slot = 2; 
				break;
			case "f":
				slot = 3; 
				break;
		}
        if(slot != -1){
            for(var j = 0;start+j<numCols;j++){
                if(orbType == myBoard[start+j][i])
                    elementalList[slot].push(i);
                else
                    break;
            }
        }
    }
    var max = 0;
    for(var i = 1;i<4;i++){
        if(elementalList[max].length < elementalList[i].length)
            max = i;
    }
    if(max.length < 3){
        //postMessage("empty rows");
        postMessage("reupdate");
    }
    else{
		//postMessage(frontOrbs);
		//postMessage(elementalList[max]);
        while(elementalList[max].length > 0){
            mover(elementalList[max].shift());
            grab();
        }
        var target = 0;
        for(var i=0;i<numRows;i++){
            if(oppResources[i] > oppResources[target]){
                target = i;
            }
        }
        //myCommands.push("SMM "+target);
        mover(target);
        toss();
    }
}

//a function that builds the movement needed for the AI character to go to.
this.mover = function(targetRow){
    if(targetRow >= numRows || targetRow < 0){
        postMessage("reupdate");
    }
	var difference = myPosition - targetRow;
    
    while(difference < 0) { //targetRow is bigger, thus below
        down();
        difference++;
    }
    while(difference > 0) { //targetRow is smaller, thus above 
        up();
        difference--;
    }
}
 
//method to handle unburying of matches for both attack and defense matches. 
this.uncover = function (target) {
	if(target[0] == 'A'){
		return unbury(target,target[3]);
	}
	else {
		var row = findRowToUnburyShield(target);
		return unbury(target,row);
	}
}

//looks for row with shortest column that can activate match
this.findRowToUnburyShield = function(target) {
	var row = target[3];
	var col = target[2];
	var count = matchDef[col][row];
	target.push(count);
	var top;
	for(top = row; top >= 0; top--){
		if(matchDef[col][top] != count)
			break;
	}

	var bottom;
	for(bottom = row; bottom < numRows; bottom++){
		if(matchDef[col][bottom] != count)
			break;
	}
	var size = bottom-top-1;
	if(size < 3){
		var topDiff = -1;
		if(top >=0){
			topDiff = Math.abs(findColFrontOrb(top)-col);
		}
		var botDiff = -1;
		if(bottom < numCols){
			botDiff = Math.abs(findColFrontOrb(bottom)-col);
		}
		if(topDiff == -1) return bottom;
		else if(botDiff == -1) return top;
		else  return (topDiff>botDiff)?bottom:top;
	}
	else {
		return findRow(top+1, bottom-1, col);
	}
}

//finds row that is closest to the match based on height.
this.findRow = function(top, bottom, col){
	var minRow = top;
	for(var i=top;i<=bottom;i++){
		var tI = Math.abs(findColFrontOrb(i)-col);
		var tMin = Math.abs(findColFrontOrb(minRow)-col);
		if((tI < tMin) &&(i != usedRow))
			minRow = i;
		else if(tI == tMin) {
			if(Math.abs(i-myPosition) < Math.abs(minRow-myPosition)) {
				minRow = i;
			}
		}
	}
	return minRow;
}

//method to unbury the match to allow it to be set off.
this.unbury = function(target, row){
    var col = target[2];
    if(findColFrontOrb(row) < col){
        while( (findColFrontOrb(row) < col) ){
            mover(row);
            grab();
            mover(findTossRow(row, target[4]));
            toss();
        }

		if((findColFrontOrb(row)==col) && (frontOrbs[row][1]!=target[4])) {
			mover(row);
			grab();
            mover(findTossRow(row, target[4]));
            toss();
		}
    }

    if(findColFrontOrb(row) > col+1){

        while(findColFrontOrb(row) > col+1){
            mover(findUnusedRow(target, row));
            grab();
            mover(row);
            toss();
        }
    }
    return row;
}

//finds a row pos for AI to use so that it will not affect matches 
this.findUnusedRow = function(target, row){
    for(var i=0;i<numRows;i++){
        if(target[0]=='A'){
            var frontCol = findColFrontOrb(i);
            if(frontCol!=numCols && matchAtk[frontCol][i] != target[5]){
                return i;
            }
        }
        else{
			//check to make sure it doesn't form an attack on accident
			var frontCol = findColFrontOrb(i);
			var typeOrb = myBoard[frontCol][i];
            if(frontCol!=numCols && 
                    (matchDef[frontCol][i] != target[5]) &&
                    (i != row) &&
                    (typeOrb != target[4])){
                return i;
            }
        }
    }
}

//Finds a row that AI can toss an orb without blocking the match
this.findTossRow = function(rowIgnore,typeIgnore){
	var viable = new Array();
	for(var row = 0; row<numRows; row++){
        var frontCol = findColFrontOrb(row);
		if(row != rowIgnore){ 
            if(frontCol==numCols || myBoard[frontCol][row]!=typeIgnore){
                viable.push(row);
            }
		}
	}
	return viable[Math.floor(Math.random()*viable.length)];
}

//4th element of target is element
//3rd element of target is row location
//tosses hand at activation if type of hand and match are the same
//else toss at a location that will not interfere with the match.
this.tossOccupiedHand = function() {
	//find attacks with hand
	for(var t = 0; t < numRows; t++) {
        var frontCol = findColFrontOrb(t);
		if(oppResources[t] > 0 && spotAttack(frontCol,t)) {
			mover(t);
			usedRow = t;
			toss();
			return;
		}
	}
    if(myPair[1] > 2){
        var target = 0;
        for(var  i = 0; i<numRows; i++){
            if(oppResources[i] > oppResources[target])
                target = i;
        }
        mover(target);
    }
    toss();
}

//activate match based on where target is and activation orb is
this.activateMatch = function(target, rowCleared) {
	actRowSource = this.findMatchViable(target);
	if((actRowSource!=-1) && (rowCleared!=-1) && (rowCleared!=usedRow)) {
		//move to source, grab and move to activation point
		mover(actRowSource);
		grab();
		mover(rowCleared);
		usedRow = rowCleared;
        //myCommands.push("activate "+myPosition);
		toss();
		return true;
	}
	return false;
}

//find orb that can activate match, but it is not part of match or Row 
//that has a match going off.
this.findMatchViable = function(target) {
	for(var row = 0;row<numRows;row++){
		if((frontOrbs[row][1] == target[4]) && (row != usedRow)){
			if(target[0] == 'D') {
				if(matchDef[frontOrbs[row][0]][row] != target[5]){
					return row;
				}
			}else if(target[0] == 'A') {
				if(attackSpotted(frontOrbs[row][0], row)){
					return row;
				}else if(row != target[3]){
					return row;
				}
			}
		}
	}
	return -1;
}

//simple function for movement
this.up = function(){
	if(myPosition > 0){
		myCommands.push("u");
		myPosition--;
	}
}
//simple function for movement.
this.down = function(){
	if(myPosition < numRows-1) {
		myCommands.push("d");
		myPosition++;
	}
}
//gives the grab command to the myCommands list
//modifies the myBoard data to match the results of its actions
this.grab = function(){
	var row = myPosition;

	if(findColFrontOrb(row) != numCols) {           //if not an empty row
		if(myPair[0] == null || myPair[0] == frontOrbs[row][1]){
            myPair[0] = frontOrbs[row][1];
			myPair[1] += 1;
            myBoard[findColFrontOrb(row)][row] = "";
            updateColFrontOrb(row);
            myCommands.push("g");
		}
	}
}

//gives the toss command to the myCommands list.
//modifies the myBoard data to match the results of its actions.
this.toss = function(){
    try{
        var row = myPosition;
        if( myPair[1] > 0){

            var newFront = findColFrontOrb(row);
            newFront = newFront-1;
            while(newFront >= 0 && myPair[1] > 0){
                myBoard[newFront][row] = myPair[0];
                myPair[1]--;
                newFront--;
            }
            myPair[0]=null;
            myPair[1]=0;
            updateColFrontOrb(row);
            myCommands.push("t");
        }
    }catch(err){
        postMessage("reupdate"); 
    }
}

// isAttack: boolean (true for attack, false for shield)
// moveNum: int (number of moves to set of match)
// col: int (column location on myBoard)
// row: int (row location on myBoard)
// element: "a", "w", "e", "f" (element representation)
// arrayList: Array (for the data to be put into) 
this.aIDataInput = function(isAttack, moveNum, col, row, element, arr) {
	var tempArray = new Array();
	if(isAttack) {
		tempArray.push('A');
	}else {
		tempArray.push('D');
	}
	tempArray.push(moveNum);
	tempArray.push(col);
	tempArray.push(row);
	tempArray.push(element);
	arr.push(tempArray);
}

//function that evaluates the utility value of the match
this.evaluateUtil = function(arr, count){
    var utility=0;
    var isAttack;
    var size;
    if(arr[0] == 'A'){
        size = sizeOfAttack(myBoard,arr[3], arr[2],arr[4], count);
        utility = size - (arr[1]/2) + preferences[0];
        isAttack = true;
    }
    else{
        size = sizeOfDefense(myBoard, arr[3], arr[2],arr[4], count);
        
		utility = size - (arr[1]/2) + preferences[1];
        isAttack = false;
    }
        
    switch(arr[4]){
        case "f":utility += preferences[4];break;
        case "w":utility += preferences[5];break;
        case "e":utility += preferences[6];break;
        case "a":utility += preferences[7];break;
    }
    if(size >= minSizeOfBig){
        utility += preferences[2];
    }
    else if(size <= maxSizeOfSmall){
        utility += preferences[3];
    }
    if(isAttack)
        utility *= insistence[0];
    else
        utility *= insistence[1];
    
    if(size == 0)
        return -1;

    return utility;
}
            
            
//function records and identifies attack matches in the matchAtk with id.
//returns size for computational purposes 
this.sizeOfAttack = function(board, row, col, type, count){
	if( onboard(row,col) && matchAtk[col][row] != count){
		var orb = board[col][row];
		if(orb == type){
			matchAtk[col][row]=count;
			var total = 0;
			if(oppResources[row] != 0) 
				total = 1;
			total+=sizeOfAttack(board, row+1,col,type,count);
			total+=sizeOfAttack(board, row-1,col,type,count);
			return total;
		}
		return 0;
	}
	return 0;
}
	
//function records and identifies defense matches in the matchDef with id.
//returns size for computation purposes.
this.sizeOfDefense = function(board, row, col, type, count){
	if( onboard(row,col) && matchDef[col][row] != count){
		var orb = board[col][row];
		if(orb == type){
			
			matchDef[col][row]=count;
			
			var total = 0;
			if(myResources[row] != 0 && myShields[row] != myMaxShieldSize) 
				total = 1;
			total+=sizeOfDefense(board, row+1,col,type,count);
			total+=sizeOfDefense(board, row-1,col,type,count);
			return total;
		}
		return 0;
	}
	return 0;
}
	
//checks to see if row and col are on the board.
this.onboard = function(row, col){
	return ((col >= 0) && (col < numCols) &&
		(row >= 0) && (row < numRows));
}

//updates the data of the AI to match with board of the game
//and to update its utility purposes.
this.update = function(state){
    isOne = state.isOne;
    updateTime = state.speed;
	myShields = state.myShields;
	myResources = state.myResources;
	oppShields = state.oppShields;
	oppResources = state.oppResources;

	numRows = state.boardSize[1];
	numCols = state.boardSize[0];
    
    myBoard=new Array();
    matchAtk = new Array();
    matchDef = new Array();
    storedBoard = new Array();
    myCommands = new Array();
    frontOrbs = new Array();

    for(var c = 0;c<numCols;c++){           //make boards
        var tempAtk = new Array();
        var tempDef = new Array();
        var tempBoard = new Array();
        
        myBoard[c] = state.myBoard[c];
        for(var r = 0;r<numRows;r++){
            tempBoard.push(myBoard[c][r]);
            tempAtk.push(-1);
            tempDef.push(-1);
        }
        matchAtk[c] = tempAtk;
        matchDef[c] = tempDef;
        storedBoard[c] = tempBoard;
    }
	
	myPair = state.myPairedStats;
    storePair = new Array();
    storePair.push(myPair[0]);
    storePair.push(myPair[1]);
    
	myPosition = state.myPosY;
    storedPos = myPosition;

	myMaxShieldSize = state.maxShield;
	insistence = state.myInsistence;
	preferences = state.myPreferences;
    frontUpdate = true;
	actRowSource = -1;
}

//function that updates the frontUpdate data of orbs on front column.
//if invalid param, returns null
//if row is empty, returns numCols
//if row is non-empty, returns col of closest orb to player
this.findColFrontOrb = function(row){
        if(row<0 || row >= numRows){
            return null;
        }
        else if(frontUpdate){
            frontOrbs = new Array();
            for(var r=0; r < numRows; r++){
                updateColFrontOrb(r);
            }
            frontUpdate = false;
        }
        return frontOrbs[row][0];

}
//updates the location of the front column of the given row
//Called from findColFrontOrb, grab, and throw. Row is known valid.
this.updateColFrontOrb = function(row){
	var col=0;
	for(col=0; col<numCols; col++){
		if(myBoard[col][row]!=""){
            frontOrbs[row] = new Array(col, myBoard[col][row]);
            break;
		}
	}
    
    if(col == numCols){
        frontOrbs[row] = new Array(col, "");
    }
}

//funciton to find the first orb's column in row.
//invalid params returns null
//returns first column
//if none found, it returns numCols.
this.findCurFrontCol=function(row){
	if(row<0 || row>=numRows){
		return null;
	}
	for(var col=0; col<numCols; col++){
		if(storedBoard[col][row]!=""){
			return col;
		}
	}
	return numCols;
} 

//Searches down a row for a potential match of size two of the same type.
//checks at the spot set at col, row
this.spotAttack = function(col, row) {
	if((col < 0) || (col >= numCols) || (row < 0) || (row >= numRows)) {
		return false;
	}
    var type;
    try {
        type = myBoard[col][row];
    }
    catch(err) {
        //postMessage(col+" "+row);
        //postMessage(myBoard);
        type = "";
    }
    
	if(type == "") {
		return false;
	}
	
	var nextCol = col + 1;
	if((nextCol < numCols) && (type == myBoard[nextCol][row])) {
		return true;
	}
	return false;
}



//detects if match at colIndex and rowIndex is a match of at least size 3.
this.attackSpotted = function(colIndex, rowIndex) {
		var type = myBoard[colIndex][rowIndex];
		var i = 1;
		var x = 1;
		//three is requirement for an attack to be found;
		//check to the right
		while (colIndex + i < numCols && x < 3) {
			if ((myBoard[colIndex + i][rowIndex] != null) &&
				(myBoard[colIndex + i][rowIndex] == type)) {
					++i;
					++x;
			} else { 
				break;
			}
		}
		//check to the left
		i = 1;
		while (((colIndex - i) >= 0) && (x < 3)) {
			if ((myBoard[colIndex - i][rowIndex] != null) &&
			    (myBoard[colIndex - i][rowIndex] == type)) {
					++i;
					++x;
			} else {
				break;
			}	
		}
		if (x >= 3) {
			return true;
		}
		return false;	
}

//checks above for an orb that matches the same type of the orb at the
//starting col, row.
this.isAboveSameType = function(col, row) {
	if(!onboard(row,col)) {
		return false;
	}
	var type;
    try{
        type = myBoard[col][row]; 
    }catch(err){
        type = "";
    }
	if(type == "") {
		return false;
	}
	
	var prevCol = col - 1;
	var prevColType = "";
	if(prevCol >= 0) {
		prevColType = myBoard[prevCol][row];
		if(prevColType == "") {
			return false;
		}
	}else {
		return false;
	}
	
	
	if(prevColType == type) {
		return true;
	}
	return false;
}

//checks above col row pos if the space is null.
this.isAboveNull = function(col, row) {
	if(((col-1)<0) || (col>=numCols) || (row<0) || (row>=numRows)) {
		return false;
	}
	if(myBoard[col-1][row] == "") {
		return true;
	}
	
	return false;
}

//builds the possible attacks in matches.
//Includes attacks of size 2 and above
this.attackListBuilder = function(matches) {
	//myBoard search;
	//movement is zero
	var matchList = new Array();
	//loop to look down a single column for attack matches.
	//start colIndex.  To setup search of board.
	var colStart = new Array();
	for(var z = 0; z < numRows; z++) {

		colStart.push(this.findColFrontOrb(z));
	}
    var typeHand = myPair[0];
	
	//initializing search for possible attacks for AI to do.
	var t = 0;
	var ty = null;
	var steps = 2;
	
	//offset to search for attack.  Only searches columns deep in
	while(t < 3){
		for(var z = 0; z < numRows; z++) {
			steps = 2;
			ty = this.findColFrontOrb(z);
			var pos = ty + t;
			if((ty != null) && (pos < numCols)) {
				//checks above if there is a match that matches with itself
				if(!isAboveSameType(pos, z) && spotAttack(pos, z)) {
					//typeHand holds the element type in witch's hand
					if(typeHand != null) {
						if(typeHand==myBoard[pos][z] && isAboveNull(pos,z)){
							steps = 1;
						}else if(!isAboveSameType(pos, z)){
							if(typeHand == myBoard[ty][z]) {
								steps = 2;
							}else {
								steps = 3;
							}
						}
					}
					this.aIDataInput(true, steps+(t*2),
                                    pos, z, myBoard[pos][z],
                                    matches);
				}
			}
		}
		t++;
	}	
}

//Defense searcher

//iterate through rows
this.shieldListBuilder = function(matchArray) {
	for(var item = 0; item < numCols; item++){
		this.searchRowForShieldMatch(item, matchArray);
	}
}

// calculates number of moves to activate the match with top at row,col
this.calcMoves = function(row, col, size){
	var numMoves = 10000;
    var typeHand = myPair[0];
    var handSize = myPair[1];
	if(myBoard[col][row] == "") return numMoves;
	var handStep = 0;
	if(typeHand != null) {
		handStep = 1;
	}

	if(row == 0){						//no row above
		var temp = this.findColFrontOrb(row+size);
		if(temp == null) temp = numCols;
		//check if there's a gap that is one orb deep;
		if(((temp - col) == 1) && (typeHand == myBoard[col][row]) &&
                (handSize <= 2) && (handSize >= 1)) {
			numMoves = handStep;
		}else {
			numMoves = 2*(Math.abs(temp - (col+1)) +1) + handStep;
		}
	}
	else if(row == numRows - 1)	{	//not enough rows below for a match
		var temp = this.findColFrontOrb(row-1);
		if(temp == null) temp = numCols;
		if(((temp - col) == 0) && (typeHand == myBoard[col][row]) &&
                (handSize <= 2) && (handSize >= 1)) {
			numMoves = handStep;
		}else {
			numMoves = 2*(Math.abs(temp-(col+1))+1) + handStep;
		}
	}
	else {
		var temp1 = this.findColFrontOrb(row+size);	//check below match
		var temp2 = this.findColFrontOrb(row-1);	//check above match
		if(temp1 == null)
			temp1 = numCols;
		if(temp2 == null)
			temp2 = numCols;
		if((((temp1 - col) == 1) || ((temp2 - col) == 1)) && 
			(typeHand == myBoard[col][row]) &&
			(handSize <= 2) && (handSize >= 1)){
			numMoves = handStep;
		}else {
            var diff1 = Math.abs(temp1-(col+1));
            var diff2 = Math.abs(temp2-(col+1));
			numMoves = 2*(Math.min(diff1, diff2) +1) + handStep;
		}
	}
	return numMoves;
}

//searches down a row for shields and records the positions in finalList.
this.searchRowForShieldMatch = function(col, finalList) {
	var type = 0;
	for(var row = 0; row< numRows-1; row++){
		try{
            type = myBoard[col][row];
        }catch(err){
            type="";
        }
		if(type == "") {
			continue;
		}
		var numSeq = 1;
		for(var endSeq = row+1; 
                endSeq<numRows && myBoard[col][endSeq]==type;
                endSeq++){
			numSeq++;
		}
		if(numSeq > 1) {		//if at least 2 orbs together
			this.aIDataInput(false, this.calcMoves(row, col, numSeq),
                                col, row, type, finalList);
			row += numSeq - 1;		//skip to end of match
		}
	}
}
