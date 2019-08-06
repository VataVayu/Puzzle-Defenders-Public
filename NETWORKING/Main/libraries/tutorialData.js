/** Tutorial Data
 *  This is the file that holds the data for tutorial construction
 **/

  
function generateWitchTutorial(board, player) {
	var tutorial = [];
	
	tutorial.push(new WitchGoal([new WitchSubGoal(14, 5, "earth", board, player),
							new WitchSubGoal(13, 5, "earth", board, player),
							new WitchSubGoal(12, 5, "earth", board, player)]));
							
	tutorial.push(new WitchGoal([new WitchSubGoal(14, 4, "earth", board, player),
							new WitchSubGoal(14, 5, "earth", board, player),
							new WitchSubGoal(14, 6, "earth", board, player)]));
	
	return tutorial;
}

function generateSteamTutorial(board, player) {
	var tutorial = [];
	
	tutorial.push(new SteamGoal([new SteamSubGoal(14, 5, "fire", board, player),
							new SteamSubGoal(13, 5, "fire", board, player),
							new SteamSubGoal(12, 5, "fire", board, player)]));
							
	tutorial.push(new SteamGoal([new SteamSubGoal(14, 4, "fire", board, player),
							new SteamSubGoal(14, 5, "fire", board, player),
							new SteamSubGoal(14, 6, "fire", board, player)]));
	
	return tutorial;
}

function generateAngelTutorial(board, player) {
	var tutorial = [];
	
	tutorial.push(new AngelGoal([new AngelSubGoal(14, 5, "air", board, player),
							new AngelSubGoal(13, 5, "air", board, player),
							new AngelSubGoal(12, 5, "air", board, player)]));
							
	tutorial.push(new AngelGoal([new AngelSubGoal(14, 4, "air", board, player),
							new AngelSubGoal(14, 5, "air", board, player),
							new AngelSubGoal(14, 6, "air", board, player)]));
	
	return tutorial;
}