/**
*	This class handles the behaviors of the sequencebuttons	
*
*	function SequenceButton(info, iHandler, col, row, buttonSprite, xDim, 
*		yDim, maxIndex): Constructor for the OverWorld object.
*	function draw(): draws the button to its apropiate canvas.
*	function update(): Updates the button by checking if they are clicked or 
*		not.
*	function toggleOff(): Resets button to starting state.
*	function isMouseInButton(): Checks to see if the mouse location is inside 
*		the button's boundaries.
**/

function SequenceButton(info, iHandler, col, row, buttonSprite, xDim, yDim, 
		maxIndex) {
	/************************* Private Variables *****************************/
	var currentIndex = 0;
	var highlightImage = spriteManager.button.shade;
	var highlighted = false;
	
	/***************************** Privileged Functions **********************/
	// Draws the button
	this.draw = function() {
		buttonSprite.draw(col, row, currentIndex, xDim, yDim);
		if (highlighted)
			highlightImage.draw(col, row, 0, xDim, yDim);
	}
	
	// Updates the button, returns relevant info
	this.update = function() {
		highlighted = isMouseInButton();
		if(highlighted) {
			if (iHandler.getMouseButton()) {
				//Button has been pressed!
				SoundJS.play("click", SoundJS.INTERRUPT_LATE, 0.35);
				currentIndex = (currentIndex + 1)%maxIndex;
				return info[currentIndex];
			}
		}
		return null;
	}
	
	// Reverts button to starting state
	this.toggleOff = function() {
		currentIndex = 0;
	}
	
	// Returns true if mouse is in button
	function isMouseInButton() {
		var mouseCol = iHandler.getMouseLocation().getFirst() / variableContainer.cellDimensions.getFirst();
		var mouseRow = iHandler.getMouseLocation().getSecond() / variableContainer.cellDimensions.getSecond();
		if (mouseCol > col && mouseCol < col + xDim  &&
			mouseRow > row && mouseRow < row + yDim) {
			return true;
		} else {
			return false;
		}
	}
}
	