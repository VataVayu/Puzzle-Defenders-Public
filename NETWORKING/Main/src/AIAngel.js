/* AIAngel is a WebWorker run from the AIHandler file. It decides on moves
 * for the Angel race when playing as an AI.
 *
 * function onmessage(e (string representation of game state)):
 *          Recieves game state as a string from AIHandler's utilityWorker
 *          Controls the calculation of the moves for the Angel AI
 *          On first run, starts runner(), which sends commands to AIHandler
 * function runner(): Purely output, cannot be called from outside file
 *          Sends commands to behaviorWorker.onmessage(e) in AIHandler
 *          Commands:   "u" --> move up
 *                      "d" --> move down
 *                      "r" --> move right (as seen on board)
 *                      "l" --> move left (as seen on board)
 *                      "e" --> exchange two orbs selected by box
 *                      "q","reupdate" --> reupdate the game state
*/
//All vars below are specifically used for memory of AI to compute its
//calculations.
var myBoard;
var myShields;
var myResources;
var oppShields;
var oppResources;

//sake for future development of the game with other races.
var numRows;
var numCols;
var myPosX;
var myPosY;
var myMaxShieldSize;
var insistence = [1,1]; // {atk, def}
var preferences;// {atk, def, big, small, fire, water, earth, air}
var minSizeOfBig = 6;
var maxSizeOfSmall = 4;
//list of commands to be sent to main game to run the AI
var myCommands = new Array();
var matchBoardAtk = {};
var matchBoardDef = {};

var frontOrbs;
var frontUpdate;    //must redo all of front orbs
var stopped = 0;
var isOne;          //is player one
var started = false;
//response time of the AI.
var updateTime;

//column movement restriction.
var colRoofLimit = 10;
var colFloorLimit = 14;
//row movement restriction
var rowLimit = 8;

var lastMatch = null;
//main function that sends a command back to AI.
this.runner = function(){
	if(myCommands.length > 0) {
        var commandSent = myCommands.shift();
        if(commandSent == "q"){
            postMessage("reupdate");
        }
        else if(commandSent == "C"){    //if match complete or failed
            lastMatch = null;           //start with new search next time
        }
        else{
            postMessage(commandSent);
            stopped = 0;
        }
    }else if (stopped > 2000/updateTime){
		stopped = 0;        //reupdate if without commands for 2 seconds
        lastMatch = null;
		postMessage("reupdate");
		
    }else{
        stopped++;
        lastMatch = null;
    }
}

//Thread function to handle moves and response time
this.onmessage = function(e){
	update(JSON.parse(e.data));
    if(!started){
        started = true;
        setInterval(runner, updateTime);
    }
    if(gameGoing()){
        makeMoves();
    }
    else{
        myCommands = {};
    }
}
//returns true if game is not over
this.gameGoing = function(){
    var res1 = 0;
    var res2 = 0;
    for(var i=0;i<numRows;i++){
        if(myResources[i] != 0) res1++;
        if(oppResources[i] != 0)res2++;
    }
    return (res1 != 0 && res2 != 0);
}
//decides on moves to be made, full decision
this.makeMoves = function() {
    var matchList = findMatches();
    if(lastMatch == null){
        var maxUtilMatch = findMaxUtil(matchList);
        //postMessage(maxUtilMatch);
        lastMatch = maxUtilMatch;
    }
    else{
        calcUtil(lastMatch, lastMatch[5], true); 
    }
    calcMoves(lastMatch);
}
//collects all pairs of orbs for a match
this.findMatches = function(){
    var arr = new Array();
    defenseAIAngelBuildListSearch(arr);
    attackAIAngelBuildListSearch(arr);
    return arr;
}
//finds match with maximum untility
this.findMaxUtil = function(matches){
    var maxIndex = 0;
    var maxUtil = -1;
    for(var i = 0; i<matches.length; i++){
        var util = calcUtil(matches[i],i+1,false);
        if(util > maxUtil){
            maxUtil = util;
            maxIndex = i;
        }
    }
    return matches[maxIndex];
}
//calculates utility of a single match
this.calcUtil = function(arrayDef,count, oldMatch){
    if (!oldMatch){
        arrayDef.push(count);
    }
    var utility=0;
    var isAttack;
    var size;
    
    var numMoves = Math.abs(arrayDef[1][0]);
    var row = arrayDef[3];
    var col = arrayDef[2];
    var type = arrayDef[4];
    
    if(arrayDef[0] == 'A'){
        size = sizeOfAttack(myBoard, row, col, type, count);
        utility = size - (numMoves/2) + preferences[0];
        isAttack = true;
    }
    else{
        size = sizeOfDefense(myBoard, row, col, type, count);
        
		utility = size - (numMoves/2) + preferences[1];
        isAttack = false;
    }
        
    switch(arrayDef[4]){
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
        utility *= insistence[1]*2;
    
    if(size == 0)
        return -10000;

    return utility;
}
//calculates the size of an attack match
this.sizeOfAttack = function(board, row, col, type, count){
	if( onboard(row,col) && matchBoardAtk[col][row] != count){
		var orb = board[col][row];
		if(orb == type){
			matchBoardAtk[col][row]=count;
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
//calculates the size of a shield match
this.sizeOfDefense = function(board, row, col, type, count){
    if( onboard(row,col) && matchBoardDef[col][row] != count){
		var orb = board[col][row];
		if(orb == type){
			matchBoardDef[col][row]=count;
			var total = 0;
			if(oppResources[row] != 0) 
				total = 1;
			total+=sizeOfDefense(board, row+1,col,type,count);
			total+=sizeOfDefense(board, row-1,col,type,count);
			return total;
		}
		return 0;
	}
	return 0;
}
//decides on moves to make a given match
this.calcMoves = function(match){
    if(match[0] == 'D'){
        defMoves(match);
    }
    else if (match[0] == 'A'){
        atkMoves(match);
    }
    else{
        myCommands.push("Invalid move type");
    }
    myCommands.push("C");
    myCommands.push("q");
}
//choose moves for defense
this.defMoves = function(match){
    var col = match[2];
    var finalRow = match[1][1];
    var startRow = finalRow + match[1][0];
    matchMaker(col,finalRow, startRow);
}
//choose moves for attack
this.atkMoves = function(match){
    var finalRow = match[3];
    var col = match[1][1];
    var startRow = finalRow + match[1][0];
    matchMaker(col, finalRow, startRow);
}
//make commands to move an orb from startRow to finalRow in col
this.matchMaker = function(col, finalRow, startRow){
    if(finalRow > startRow){
        mover(col, startRow,0);
    }
    else if(finalRow < startRow){
        mover(col, startRow-1,1);
    }
    else{
        mover(col, finalRow,2);
        swap();
    }
    for(var i = 0; i<finalRow - startRow;i++){
        if(myBoard[col][myPosY+1] == ""){
            swap();
            myCommands.push("C");
            break;
        }
        else{
            swap();
            down();
        }
    }
    for(var i = 0; i< startRow - finalRow;i++){
        if(myBoard[col][myPosY-1] == ""){
            swap();
            myCommands.push("C");
            break;
        }
        else{
            swap();
            up();
        }
    }
}

//makes selection box movement to posX, posY
this.mover = function(posX, posY,errType){
    if(posX >= numCols || posX < 0 || posY >= numRows || posY < 0){
        postMessage("illegal move: "+posX+" "+posY);
        postMessage("Error from "+errType);
        postMessage("reupdate");
    }
    else{
        while(posX < myPosX){
            left();
        }
        while(posX > myPosX){
            right();
        }
        while(posY < myPosY){
            up();
        }
        while(posY > myPosY){
            down();
        }
    }
}
//simple functions for movement and actions
this.up = function(){
	if(myPosY > 0){
		myCommands.push("u");
		myPosY--;
	}
}
this.down = function(){
	if(myPosY < numRows-2) {    
        myCommands.push("d");
		myPosY++;
	}
}
this.left = function(){
    if(myPosX > 0){
        if(isOne)  myCommands.push("l");
        else myCommands.push("r");
        myPosX--;
    }
}
this.right = function(){
    if(myPosY < numCols-1){
        if(isOne)  myCommands.push("r");
        else myCommands.push("l");
        myPosX++;
    }
}
this.swap = function(){
    myCommands.push("e");
    
    var temp = myBoard[myPosX][myPosY];
    myBoard[myPosX][myPosY] = myBoard[myPosX][myPosY+1];
    myBoard[myPosX][myPosY+1] = temp;
    updateBoard(myPosY);
    updateBoard(myPosY+1);
}

//removes empty spaces from the board
this.updateBoard = function(posY){
    var i=numCols-1;
    var j=numCols-1;
    while( (i>=0) && myBoard[i][posY] != ""){
        i--;
        j--;
    }
    for( ; i>=0; i--){
        if(myBoard[i][posY] != ""){
            var temp = myBoard[j][posY];
            myBoard[j][posY] = myBoard[i][posY];
            myBoard[i][posY] = temp;
        }
        if(myBoard[j][posY] != ""){
           j--;
        }
    }
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
    matchBoardAtk = new Array();
    matchBoardDef = new Array();
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
        matchBoardAtk[c] = tempAtk;
        matchBoardDef[c] = tempDef;
    }
	
	myPosX = state.myPairedStats[0];
    myPosY = state.myPairedStats[1]

	myMaxShieldSize = state.maxShield;
	insistence = state.myInsistence;
	preferences = state.myPreferences;
    frontUpdate = true;
}

//function that returns the frontUpdate data of orbs on front column.
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
//function that updates the frontUpdate data of orbs on front column.
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
//makes a match descriptor, if the match can be made
this.aIDataInput = function(isAttack, moveNum, col, row, element, arr) {
    
    if(Math.abs(moveNum[0]) > 50){
        return;
    }

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
//builds a list of attack matches
this.attackAIAngelBuildListSearch = function(arr) {
	//loop on all rows
	for(var t = 0; t < numRows; t++) {
		//read along a row.
		var temp = this.findColFrontOrb(t);		
		if((temp != null) && (temp < numCols)) {
			if(temp < colRoofLimit) 
				temp = colRoofLimit;
			
			for(var i = temp; i < numCols;) {
				var tType = myBoard[i][t];
				//check below and a row away as well for an attackmatch.
				//two in a row element.
				if(((i + 1) < numCols) && (tType == myBoard[i+1][t])) {
                    var temp1 = countAttack(i,t,tType,[[i,t],[i+1,t]]);
					this.aIDataInput(true,temp1,i,t,tType,arr);
					i = i + 2;
					continue;
				}
				//two orbs of the same type but with a one orb gap.
				if(((i + 2) < numCols) && (tType == myBoard[i+2][t])) {
					var temp1=countAttack(i,t,tType,[[i,t],[i+2,t]]);
                    this.aIDataInput(true,temp1,i,t,tType,arr);
				}
				i++;
			}
		}	
	}
}
//finds number of moves to make a given attack match
this.countAttack = function(col,row,type,ignore){
    if(col+2 < numCols){
        if(myBoard[col+1][row] == type && myBoard[col+2][row]==type)
            return [2, col];
        else if(myBoard[col+1][row] == type){
            var t1 = search(col+2, row, ignore, type);
            var t2 = search(col-1,row, ignore, type);
            if(Math.abs(t1)<Math.abs(t2)) return [t1,col+2];
            else return [t2,col-1];
        }
        else{
            var t = search(col+1,row, ignore, type);
            return [t, col+1];
        }
    }
    else{
        var t = search(col-1,row, ignore, type);
        return [t, col-1];
    }
}
//makes list of shield matches
this.defenseAIAngelBuildListSearch = function(arr) {
	//loop on all rows
	for(var t = 0; t < numRows; t++) {
		//read along a row.
		var temp = this.findColFrontOrb(t);		
		if((temp != null) && (temp < numCols)) {
			if(temp < colRoofLimit) 
				temp = colRoofLimit;
			
			for(var i = temp; i < numCols;) {
				var tType = myBoard[i][t];
				//check below and a row away as well for an attackmatch.
				//two in a row element.
				if(((t + 1) < numRows) && (tType == myBoard[i][t+1])) {
                    var temp1=countDefense(i,t,tType,[[i,t],[i,t+1]]);
					this.aIDataInput(false,temp1,i,t,tType,arr);
                }
				i++;
			}
		}	
	}
}
//finds number of moves to make a given shield match
this.countDefense = function(col,row,type, ignore){
    if(row+2 < numRows){
        if(myBoard[col][row+2] == type)
            return [1, row];
        else if(row > 0){
            var t1 = search(col, row-1,ignore, type);
            var t2 = search(col,row+2,ignore, type);
            if(Math.abs(t1) < Math.abs(t2)) return [t1, row-1];
            else return [t2, row+2];
        }
        else{
            var t = search(col,row+2,ignore, type);
            return [t, row+2];
        }
    }
    else{
        var t = search(col,row-1,ignore, type);
        return [t, row-1];
    }
}
//returns whether a given row,col is on the board
this.onboard = function(row,col){
    return (col < numCols && col >= 0) &&
            (row < numRows && row >= 0);
}
//returns whether a row,col is already part of the match
this.invalid = function(ignore, col, row){
    if(!onboard(row,col)) return true;
    for(var i=0;i<ignore.length;i++){
        if(col == ignore[i][0] && row == ignore[i][1]) return true;
    }
    return false;
}

//ignored places is a 2D array, holding col,row of match elements
this.search = function(targetCol, targetRow, ignoredPlaces, type){
    for(var offset=0;offset < numRows; offset++){
        if(!invalid(ignoredPlaces, targetCol,targetRow+offset)){
            if(myBoard[targetCol][targetRow+offset] == type){
                return offset;
            }
        }
        else if(!invalid(ignoredPlaces, targetCol,targetRow-offset)){
            if(myBoard[targetCol][targetRow-offset] == type)
                return -1*offset;
        }
    }
    return 10000;
}