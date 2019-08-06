/**
*	This class handles the behaviors of the buttons	
*
*	toggleButton = If this parameter is passed in as true then it makes the 
*		button a toggleButton.
*	requiresToggle = Makes the button require a toggleButton being "On" in 
*		order to proceed.
*
*	function Button(info (text), iHandler (inputHandler), word (text information), 
*		col (int grid position), row (int grid position), buttonSprite(image),  
*		xDim (boolean or int), yDim (boolean or int), toggleButton (boolean)):
*		Constructor for the button.
*	function draw(): 
*		draws the button to its apropiate canvas.
*	function update(): 
*		Updates the button by cheking if they are clicked or not.
*		In addition, it determines what type of button it is and call their
*		appripiate behavior. 
* 	function toggleOff(): switches the draw image and set the toggleOn flag to 
*		On
*	function isMouseInButton(): 
*		Checks to see if the mouse location is inside the button's boundaries.
**/

function Button(info, iHandler, word, col, row, buttonSprite, xDim, yDim, 
		toggleButton, inTutorial) {
	
	/***************************Private Variables*****************************/
	// If the button is default
	if (!xDim)
		xDim = 4;
	if (!yDim)
		yDim = 1.5;
	if (buttonSprite == null)
		buttonSprite = spriteManager.button["default"];
	
	var currentIndex = 0;  //For Animations
	var toggledOn = false;
	var clearInfo = {};
	var colors = ["rgba(0,0,0,1)", "rgba(255,255,255,1)"];
	for (var v in info) {
		clearInfo[v] = null;
	}

	
	/**************************Priveledged Functions***************************/
	// Draws the button at the given position
	this.draw = function() {
		buttonSprite.draw(col, row, currentIndex, xDim, yDim);
		if(word != null) {
			var font = variableContainer.mysteryQuestFont;
			var fontSize = 50;
			context2D.textAlign = "center";
			context2D.fillStyle = colors[currentIndex%2];
			context2D.font = '' + (fontSize * 
				variableContainer.cellDimensions.getFirst() / 48) + 'px ' + 
				font;
			context2D.fillText(word, (col + xDim/2) * 
				variableContainer.cellDimensions.getFirst(), 
				(row + 1.14)  * variableContainer.cellDimensions.getSecond());
		}
	}
	
	// Updates the button handling all mouse events upon it.
	this.update = function() {
		if (isMouseInButton()) {
			if (!toggledOn) {
				currentIndex = 1;
			}
			
			if (iHandler.getMouseButton()) {
				//Button has been pressed!
				if (toggleButton) {
					if (!toggledOn) {
						currentIndex = 2;
						toggledOn = true;
						if (!inTutorial) {
							SoundJS.play("click", SoundJS.INTERRUPT_LATE, 0.25);
						}
					} else {
						toggledOn = false;
						if (!inTutorial) {
							SoundJS.play("unconfirm", SoundJS.INTERRUPT_LATE, 0.25);
						}
						return clearInfo;
					}
				} else {
					if (!inTutorial) {
						if (info.back) {
							SoundJS.play("unconfirm", SoundJS.INTERRUPT_LATE, 0.25);
						} else {
							SoundJS.play("click", SoundJS.INTERRUPT_LATE, 0.25);
						}
					}
				}
				return info;
			}
		} else {
			if (!toggleButton || !toggledOn) {
				currentIndex = 0;
			}
			else {
				currentIndex = 2;
			}
		}
		return null;
	}
	
	// Allows for toggling functionality of the button
	this.toggleOff = function() {
		currentIndex = 0;
		toggledOn = false;
	}
	
	/***************************Private Functions*****************************/
	
	/**
	* Function is to check if button is within in the buttons dimensions 
	*
	**/
	function isMouseInButton() {
		var mouseCol = iHandler.getMouseLocation().getFirst() / 
			variableContainer.cellDimensions.getFirst();
		var mouseRow = iHandler.getMouseLocation().getSecond() / 
			variableContainer.cellDimensions.getSecond();
		if (mouseCol > col && mouseCol < col + xDim  &&
			mouseRow > row && mouseRow < row + yDim) {
			return true;
		} else {
			return false;
		}
	}
}