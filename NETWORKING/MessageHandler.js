//THESE LATER NEED TO BE MOVED SOMEWHERE ELSE
const FPS = 65;
const ACTION_QUEUE_RATE = 30; //an action queue is returned every 30 ticks
const HEARTBEATS_PER_SEC = ACTION_QUEUE_RATE / (FPS * 1.0);
//const ANGEL_APS_LIMIT = 40; //APS = actions per second
//const NONANGEL_APS_LIMIT = 25;
const APS_LIMIT = 50;

// I handle messages

this.handleConnect = function(){
	console.log("Hello player!");
	//socket.set('player_id', , function(){});
}

this.handleMessage = function(message){
	//console.log("Message type: " + message.type);
	switch (message.type) {
		case 'input':
			this.handleInput(message);
			break;
		case 'logic':
			this.handleLogic(message);
			break;
		case 'playerActions':
			this.handlePlayerActions(message);
			break;
		default:
			break;
	}
}

this.handleInput = function(){
	console.log("Hello input!");
}

this.handleAction = function(){
	console.log("Hello action!");
}

this.handlePlayerActions = function(message) {
	if (message.actions.length / HEARTBEATS_PER_SEC > APS_LIMIT) {
		console.log("Player doing " +  APS_LIMIT + " actions per second. HAX!");
	}
	for (var i in message.actions) {
		switch (message.actions[i]) {
			case "left":
				if (message.race == "witch" || message.race == "steampunk") {
					console.log("OBJECTION!");
				} else {
					console.log("perform action!");
				}
				break;
			case "right":
				if (message.race == "witch" || message.race == "steampunk") {
					console.log("OBJECTION!");
				} else {
					console.log("perform action!");
				}
				break;
			case "abilityB":
				if (message.race == "angel") {
					console.log("OBJECTION!");
				} else {
					console.log("perform action!");
				}
				break;
			case "none":
				break;
			default:
				console.log("perform action!");
		}
	}
}

this.handleLogic = function(){
	console.log("Hello logic!");
}

this.handleDisconnect = function(){
	console.log("Bye player!");
}