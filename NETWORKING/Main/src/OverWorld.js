/**
*	Function to be part of campaign to hold data of single player battles.
*
*	function OverWorld(prevMenu, inputHandler, background): Constructor for the
*		OverWorld object.
*	function addNode(WorldNode (WorldNode)): To add a node to the OverWorld.
*	function reset(results): Resets the OverWorld based on match results.
*	function draw(): Draw the world map for Tutorial.
**/
function OverWorld(prevMenu, inputHandler, background) {
	/*****************************Public Variables****************************/
	var nodeList = [];   //array of nodes
	var backButton = new Button({back: true}, inputHandler, "Back", .5, .5);
	var pressed = null;
	var nodeResponse;
	var paused = false;

	/***************************Public Functions******************************/
	// Adds the locations on the tutorial menu
	this.addNodes = function(newNodeList, connectionList, activeList) {
		var i;
		for (i in newNodeList) {
			nodeList.push(newNodeList[i]);
		}
		for (i in connectionList) {
			var one = connectionList[i][0];
			var two = connectionList[i][1];
			if (newNodeList[one] != null && newNodeList[two] != null) {
				newNodeList[one].addConnection(newNodeList[two]);
			}
		}
		if (activeList == null)
			nodeList[0].setActive();
		else 
			for (i in activeList) 
				nodeList[activeList[i]].setActive();
	}
	
	// Resets the OverWorld
	this.reset = function(results) {
		if (pressed != null) {
			if (results != null) {
				pressed.setConquered(results);
			} else {
				pressed.setConquered(false);
			}
			pressed = null;
		}
	}
	
	// Updates the OverWorld for input
	this.update = function() {
		var info = null;
		if (pressed == null) {
			for (var i in nodeList) {
				nodeResponse = nodeList[i].update();
				if (nodeResponse) {
					pressed = nodeList[i];
				}
			}
			var info = backButton.update();
		} else {
			var result = null;
			result = pressed.updateTextBox();
			if (result != null) {
				if (result) {
					info = pressed.getInfo();
				} else {
					pressed.setConquered(false);
					pressed = null;
				}
			}
		}
		return info;
	}
	
	// Draws the OverWorld
	this.draw = function() {
		background.draw(3.75, 2);
		for (var i in nodeList) {
			nodeList[i].draw(0, 0);
		}
		backButton.draw();
		if (pressed != null) {
			pressed.drawTextBox();
		}
	}
}