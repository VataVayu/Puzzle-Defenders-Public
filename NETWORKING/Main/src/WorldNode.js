/** This class is what holds the nodes of single player campaign
 *
 * function WorldNode(location, inputHander, info, textBox)): Constructor 
 *		function of WorldNode
 * function update(): This function is called from Overworld and checks to 
 * 		see if the Node should cause the game to move to the next screen.
 * function draw(xOffset, yOffset): This function is called in Overworld and 
 * 		draws the Node on the Map.
 *
 * function drawTextBox() : This function causes textBox to draw when it's 
 * 		activated in Overworld.
 *
 * function getInfo() : This function returns the info if the button is 
 *		pressed.
 *
 * function addConnection(otherNode) : This function pushes otherNode onto 
 * 		this Node's connectedNodes list.
 *
 * function setConquered() : This function resets all the nodes to active.
 *
 * function setActive() : This function sets this node to active.
 *
 * function isActive() : This function returns whether or not this node is 
 *		active.
 *
 * function pressed() : This function returns true if the node has been 
 * 		pressed with the mouse and is called inside WorldNode.
 **/

function WorldNode(location, radius, inputHander, info, textBox) {
	/*Public variables*/
	var image = spriteManager.overworld[info.raceOne];
	var imageActive = false;
	var active = false;
	var connectedNodes = new Array();

	
	
	/*Public Functions*/
	
	//This function is called from Overworld and checks to see if the Node 
	//should cause the game to move to the next screen.
	this.update = function() {
		if (active && pressed()) {
			return true;
		}
	}
	
	//This function is called in Overworld and updates the Textbox if it's 
	//pressed.
	this.updateTextBox = function() {
		return textBox.update();
	}

	//This function is called in Overworld and draws the Node on the Map.
	this.draw = function(xOffset, yOffset) {
		if (active) {
			if (xOffset == null)
				xOffset = 0;
			if (yOffset == null)
				yOffset = 0;
			if (imageActive) {
				image.draw(location.getFirst() + xOffset,
						location.getSecond() + yOffset);
			}
		}
	}
	
	//This function causes textBox to draw when it's activated in Overworld.
	this.drawTextBox = function() {
		textBox.draw();
	}
	
	//This function returns the info if the button is pressed
	this.getInfo = function() {
		return info;
	}
	
	//This function pushes otherNode onto this Node's connectedNodes list.
	this.addConnection = function(otherNode) {
		connectedNodes.push(otherNode);
	}
	
	//This function resets all the nodes to active.
	this.setConquered = function(result) {
		if (result) {
			for (var i in connectedNodes) {
				connectedNodes[i].setActive();
			}
		}
		imageActive = false;
	}
	
	//This function sets this node to active.
	this.setActive = function() {
		active = true;
	}
	
	//This function returns whether or not this node is active.
	this.isActive = function() {
		return active;
	}
	
	//This function returns true if the node has been pressed with the mouse 
	//and is called inside WorldNode.
	function pressed() {
		var mouseLoc = inputHander.getMouseLocation();
		var mX = mouseLoc.getFirst();
		var mY = mouseLoc.getSecond();
		var x1 = location.getFirst() * 
			variableContainer.cellDimensions.getFirst();
		var y1 = location.getSecond() * 
			variableContainer.cellDimensions.getSecond()
		var x2 = (location.getFirst() + 1) * 
			variableContainer.cellDimensions.getFirst()
		var y2 = (location.getSecond() + 1) * 
			variableContainer.cellDimensions.getSecond()
		
		//This checks to see if the mouse cursor is on the node, then get the 
		//InputHandler to see if the mousebutton was pressed.
		var xDistance = (location.getFirst() + image.xyScale.getFirst() / 2) -
			(mouseLoc.getFirst() / variableContainer.cellDimensions.getFirst());
		var yDistance = (location.getSecond() + image.xyScale.getSecond() / 2) -
			(mouseLoc.getSecond() / variableContainer.cellDimensions.getSecond());
		if (Math.sqrt(xDistance * xDistance + yDistance * yDistance) < radius) {
			imageActive = true;
			if (inputHander.getMouseButton()) {
				return true;
			}
			return false;
		}
		imageActive = false;
		return false;
	}
}