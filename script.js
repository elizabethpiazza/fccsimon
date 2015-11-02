// Create basic pubsub, info at http://davidwalsh.name/pubsub-javascript
var events = (function(){
	var topics = {};
	var hOP = topics.hasOwnProperty;

	return {
		subscribe: function(topic, listener){
			if (!hOP.call(topics, topic)) { topics[topic] = []; }
			var index = topics[topic].push(listener) - 1;
			return {
				remove: function() {
					delete topics[topic][index];
				}
			};
		},
		publish: function(topic, info){
			if(!hOP.call(topics, topic)) { return; }
			topics[topic].forEach(function(item){
				item(info != undefined ? info : {});
			});
		}
	};
})();

var Game = function(){
	var controls = ['red', 'green', 'yellow', 'blue'];
	var players = ['Player', 'Simon'];

	var gameEnded = false;

	var pastMoves = [];

	var makeRandomMove = function(){
		var move = controls[Math.floor(Math.random() * controls.length)];
		pastMoves.push(move);
		events.publish('moveChosen', move);
	};

	var startaTurn = function(control){
		if (!gameEnded) {
			makeRandomMove();
			events.publish('playMoveHistory', pastMoves);
			var userMoveCounter = 0;
			console.log(pastMoves.length);
			var subscription = events.subscribe('userMoves', function(move){
				console.log(move, userMoveCounter);
				if (move != pastMoves[userMoveCounter]){
					console.log("User lost");
					gameEnded = true;
					return;
				}
				userMoveCounter++;
				if (userMoveCounter >= pastMoves.length) {
					subscription.remove();
					startaTurn();
				}
			});
		}
	}

	startaTurn();
}

var Gui = function(){
	var aGame = new Game();
	var startButton = document.getElementById('start');
	var controls = document.getElementsByClassName('control');

	var publishUserMoves = function(event){
		events.publish('userMoves', event.target.id);
	};

	for (var i = 0; i < controls.length; i++){
		controls[i].addEventListener('click', publishUserMoves);
	}

	events.subscribe('moveChosen', function(move){
		//turn this into a function to highlight control
		console.log(move);
	})
	//this stopped working?
	startButton.addEventListener('click', aGame.makeRandomMove);
}

var start = new Gui();

