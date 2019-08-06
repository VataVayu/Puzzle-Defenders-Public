/**
 *	This class handles the behaviors of the Text and TextBox
 *
 *	function Text(colRow, xyDim, font, fontSize, color, paragraph): The 
 *		constructor for Text
 *	function draw(ctx, startX , startY, textStart, linesPerDisplay): Draws 
 *		the text to the canvas
 *	function wordWrap(str, width, cut): Word wraps str
 *	function changeText(newText): Changes text to newText
 *	function getLineCount(): Returns line count
 * function getLineSpacing(): Returns lineSpacing
 *	
 *	function TextBox(colRow, xyDim, font, fontSize, color, allowCancel, 
 *		textBoxInputHandler, paragraph): Constructor of TextBox
 *	function update(): Function for updating the TextBox display of text and 
 *		the 'next' and 'cancel' buttons
 *	function draw(ctx(canvas), paragraph(String))): Draw outs the TextBox art, 
 *		and the actual text file.
 *	function changeText(newText): Changes the text of the TextBox
 *	function wordWrap(newText, width, cut): Word wraps the text so it can be 
 *		displayed
 *	
 *	function TextBoxBackground(): The object for the TextBox's background
 *	function draw(col, row, width, height): this draw the background of the 
 *		TextBox
 **/

/*  
*	colRow			// The x & y coordinate of the TextBox
*	xyDim          // The Dimension of the TextBox
*	font           // The font type of the text
*	fontSize       // How big is the text
*	color          // is passed as a string. // ex // color = 
*		"rgba(0,255,255,0.66)"
*/

function Text(colRow, xyDim, font, fontSize, color, paragraph) {
	/********************************Private Variables************************/
	// TextBoxBackground init
	if (xyDim.getFirst() < 2) {
		xyDim.setFirst(2);
	} 
	if (xyDim.getSecond() < 2){
		xyDim.setSecond(2);
	}
	var textBoxBackground = new TextBoxBackground();
	
	if(paragraph == null){
		paragraph = "";
	}
	
	if(font == null){
		font = variableContainer.hennyPennyFont;
	}
	if (fontSize == null){
		fontSize = 16;
	}
	if (color == null) {
		color = "rgba(255,255,255,1)";
	}
	
	// Counter for the Text
	var lineSpacing = .45;
	var parseLocations = new Array();
	
	/********************************Privileged Functions*********************/
	//Function used to Draw Text
	this.draw = function(startX , startY, textStart, linesPerDisplay) {
		var ctx = context2D;
		if (startX == null) {
			startX = colRow.getFirst() + 0.75;
			startY = colRow.getSecond()+ 0.65;
			textStart = 0;
			linesPerDisplay = paragraph.length;
		}
		
		
		//Create the TextBox Art
		textBoxBackground.draw(colRow.getFirst(), colRow.getSecond(), 
							   xyDim.getFirst(), xyDim.getSecond());
		
		ctx.textAlign = "left";
		ctx.fillStyle = color;
		ctx.font = '' + (fontSize * 
			variableContainer.cellDimensions.getFirst() / 48) + 'px ' + font;
		//Draws the text in three sentence paragraph
		var sentenceIncrement = lineSpacing;
		for (var i = textStart; i < linesPerDisplay + textStart; ++i) {
			ctx.fillText(paragraph[i], startX * 
				variableContainer.cellDimensions.getFirst(), (startY + 
				((i+1-textStart) * lineSpacing)) * 
				variableContainer.cellDimensions.getSecond());
		}
	}
	
	//This replaces \t with 4 spaces, \n with a new line, and splits the text
	//into seperate lines according to width
	this.wordWrap = function(str, width, cut) {
		width = width || 75;
		cut = cut || false;
		//Checks if string is null, if so returns null
		if (!str) { return str; }
		
		//Replaces \n by ending current line and adding a blank line
		str = str.replace(/(\n)/gm,"\r \r");
		//Replaces \t with 4 spaces
		str = str.replace(/(\t)/gm,"    ");
		//Splits line according to width
		var regex = '.{1,' +width+ '}(\\s|$)' + 
			(cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
		return str.match( RegExp(regex, 'g') );
	}
	
	var storedWordWrap = this.wordWrap;
	// Changes the paragraph used in the textbox
	this.changeText = function(newText) {
		paragraph = storedWordWrap(newText, Math.floor((xyDim.getFirst() * 48)
			/10), true);
	}
	
	// Returns paragraph line count
	this.getLineCount = function() {
		return paragraph.length;
	}
	
	// Returns line spacing
	this.getLineSpacing = function() {
		return lineSpacing;
	}
	
	paragraph = this.wordWrap(paragraph, Math.floor(xyDim.getFirst() * 4.8), 
		true);
}

// This is the TextBox class
subclass(TextBox, Text);
function TextBox(colRow, xyDim, font, fontSize, color, allowCancel, 
		textBoxInputHandler, paragraph, inTutorial) {
	Text.call(this, colRow, xyDim, font, fontSize, color, paragraph);
	if(paragraph == null){
		paragraph = "This is the Puzzle Defenders Tutorial";
	}
	
	/********************************Private Variables************************/
	//Creates Buttons
	var buttonOffset = .5;
	var shutdownButton = null;
	var nextCounter = 0;
	
	if (allowCancel) {
		buttonOffset = 1/4;
		//Create Cancel Button
		var shutdownButton = new Button(true, textBoxInputHandler, null,
			colRow.getFirst() + (xyDim.getFirst() * buttonOffset) - 0.5,
			colRow.getSecond()  + xyDim.getSecond() - 0.75,
			spriteManager["textBox"][textBoxEnum[1]], 1, 1, null, inTutorial);
		buttonOffset *= 3;
	}
	
	// Creates Next Button
	var nextButton = new Button(true, textBoxInputHandler, null,
		colRow.getFirst() + (xyDim.getFirst() * buttonOffset) - 0.5,
		colRow.getSecond()  + xyDim.getSecond() - 0.75,
		spriteManager["textBox"][textBoxEnum[0]], 1, 1, null, inTutorial);
	
	/********************************Privileged Functions*********************/
	//Updates the TextBox
	this.update = function(){
		var temp = nextButton.update();
		if(temp || textBoxInputHandler.getKey(variableContainer.ENTER) || 
				textBoxInputHandler.getKey(variableContainer.SPACE)){
			// increment text NOTE: this -3 comes from the ammout of lines 
			// drawn (2) + (1) due to the fact that each line takes 2 entries 
			// in the list to be drawn
			if(nextCounter < this.getLineCount() - linesPerDisplay){
				++nextCounter; //nextCounter += this.linesPerDisplay;
			}else{
				nextCounter = 0;
				return true;
			}
		}
		
		if (allowCancel) {
			temp = shutdownButton.update();
			
			if(temp || textBoxInputHandler.getKey(variableContainer.ESCAPE)){
				nextCounter = 0;
				return false;
			}
		}
		return null;
	}
	
	var superDraw = this.draw;
	//Draws the TextBox Art and the actual text
	this.draw = function(){
		
		superDraw(null, null, nextCounter, linesPerDisplay);
		
		// Draws the Buttons
		nextButton.draw();
		if (allowCancel) {
			shutdownButton.draw();	
		}
	}
	
	var superChangeText = this.changeText;
	// This changes the text of the text box
	this.changeText = function(newText) {
		SoundJS.play("advanceTextbox", SoundJS.INTERRUPT_LATE, 0.75);
		superChangeText(newText);
		this.wordWrap(newText, Math.floor(xyDim.getFirst() * 4.8), true);
		nextCounter = 0;
	}
	
	var superwordWrap = this.wordWrap;
	// This word wraps the textbox text
	this.wordWrap = function(newText, width, cut){
		paragraph = null;
		paragraph = superwordWrap(newText, width, cut);
		linesPerDisplay = Math.min((Math.floor((xyDim.getSecond() - 1) / 
			this.getLineSpacing())), paragraph.length);
	}
	this.wordWrap(paragraph, Math.floor(xyDim.getFirst() * 4.8), true);
}

// This is the textbox object that text will be drawn on top of.
// It combines multiple sprites
function TextBoxBackground(){
	/********************************Private Variables************************/
	var upperL = spriteManager["textBox"][textBoxEnum[2]];
	var upperR = spriteManager["textBox"][textBoxEnum[3]];
	var lowerL = spriteManager["textBox"][textBoxEnum[4]];
	var lowerR = spriteManager["textBox"][textBoxEnum[5]];
	var edge = spriteManager["textBox"][textBoxEnum[6]];
	var center = spriteManager["textBox"][textBoxEnum[7]];
	
	/********************************Privileged Functions*********************/
	// Draws the text box background
	this.draw = function(col, row, width, height){
		// Draw corners
		upperL.draw(col, row, 0 , .75, .75);
		upperR.draw(col + width - .75, row, 0 , .75, .75);
		lowerR.draw(col + width - .75, row + height - .75, 0 , .75, .75);
		lowerL.draw(col, row + height - .75, 0 , .75, .75);

		
		// Draw center sprite
		center.draw(col + .75, row + .75, 0, width - 1.5, height - 1.5);
		
		// Draw edge, which needs to be rotated
		// Left edge, default edge
		edge.draw(col, row + .75, 0, .75, height - 1.5);
		//Top edge, rotated -90 degrees about the origin
		edge.drawRotatedImage(col + width - .75, row, 0, 0, -90, 0, .75, 
			width - 1.5);
		// Right edge, flipped
		edge.drawFlipImage(col + width - 1, row + .75, 0, .75, height - 1.5);
		// Bottom edge, rotated 90 degrees about the origin
		edge.drawRotatedImage(col + .75, row + height, 0, 0, 90, 0, .75, 
			width - 1.5);
	}
}