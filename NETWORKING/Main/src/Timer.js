// This is an update to the Timer class to get milliseconds and 
// remove the dependencies on framerate
/**
 * The Timer class is used for keeping track of time as needed. When Combined 
 *		with the CountDownTimer it allows for time based events to occur.
 *
 * function Timer(): Constructor of the Timer class.
 * function getElapsedTime(): Returns the time elapsed in seconds.
 * function getElapsedMilliseconds(): Returns the time elapsed in milliseconds.
 * function togglePause(): Toggles the timer on and off.
 * function isPaused(): Returns the timers paused status (boolean).
 **/


function Timer() {
	/**************************Private Variables******************************/
	var date = new Date();
	var initialTime = date.getTime();
	var elapsedTime = 0;
	var isPaused = false;
	
	/*************************Protected Function******************************/
	// Returns the Elapsed time in seconds
	this.getElapsedTime = function() {
		if (isPaused)
			return elapsedTime/1000;
		date = new Date();
		return (date.getTime() - initialTime + elapsedTime)/1000;
	}

	// Returns the Elapsed milliseconds since the timer has been running.
	this.getElapsedMilliseconds = function() {
		if (isPaused)
			return elapsedTime;
		date = new Date();
		return (date.getTime() - initialTime + elapsedTime);
	}
	
	// Toggles the timer to be paused/running.
	this.togglePause = function() {
		date = new Date();
		if (isPaused) {
			initialTime = date.getTime();
		} else {
			elapsedTime = elapsedTime + date.getTime() - initialTime;
		}
		isPaused = !isPaused;
	}
	
	// Checks if the timer is currently paused.
	this.isPaused = function() {
		return isPaused;
	}
}


/*
 * CountDownTimer allows for time based events to occur after a given number
 *		of milliseconds.
 *
 * function CountDownTimer(timer (Timer), desiredDuration (int)): Constructor 
 *		of the CountDownTimer object with timer to set the time spent.
 * function isExpired(): Returns true if the time expired or false is the time
 *		has not expired.
 * function toggle(): Turns the timer off/on relative to its previous state
 * function reset(newDuration (int)): set the starTime to the time elapsed
 * 		from timer.  Sets desiredDuration to the newDuration passed 
 *		through the parameter.
 */
 
function CountDownTimer(timer, desiredDuration) {
	/**************************Private Variables******************************/
	var startTime = timer.getElapsedMilliseconds();
	var active = true;
	
	/*************************Protected Function******************************/
	// Used to check if the countdown has expired yet. Only returns True if 
	// expired and active
	this.isExpired = function() {
		return (startTime + desiredDuration <= timer.getElapsedMilliseconds())
			&& active;
	}
	
	// Turns the countdown on and off such that it wont ever expire if the 
	// timer is off
	this.toggle = function() {
		active = !active;
	}

	// Resets the Countdown to have a new Duration
	this.reset = function(newDuration) {
		startTime = timer.getElapsedMilliseconds();
		desiredDuration = newDuration;
	}
}
