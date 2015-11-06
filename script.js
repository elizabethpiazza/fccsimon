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

function Game(){
	var controls = ['red', 'green', 'yellow', 'blue'];
	var players = ['Player', 'Simon'];

	var gameEnded = false;

	var pastMoves = [];

	var makeRandomMove = function(){
		var move = controls[Math.floor(Math.random() * controls.length)];
		pastMoves.push(move);
		events.publish('moveChosen', {
			'move': move,
			'pastMoves': pastMoves
		});
	};

	var startaTurn = function(control){
		if (!gameEnded) {
			makeRandomMove();
			events.publish('playMoveHistory', pastMoves);
			var userMoveCounter = 0;
			var subscription = events.subscribe('userMoves', function(move){
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
	var startButton = document.getElementById('start');
	var controls = document.getElementsByClassName('control');

	var publishUserMoves = function(event){
		events.publish('userMoves', event.target.id);
	};

	for (var i = 0; i < controls.length; i++){
		controls[i].addEventListener('click', publishUserMoves);
	}

	var histSubscription = events.subscribe('moveChosen', function(info){
		var pastMoves = info.pastMoves;
		highlightMoves(pastMoves);
		document.getElementById('score').innerHTML = pastMoves.length;
	});

	var highlightMoves = function(moveSequence) {
		var lastMove = moveSequence[moveSequence.length - 1];
		console.log(moveSequence);
		var count = 0;
		var flashMoves = setInterval(function(){
			color = moveSequence[count];
			document.getElementById(color).style.backgroundColor = 'white';
			setTimeout(function(){document.getElementById(color).style.backgroundColor = color;}, 500);
				count++;
			if (count >= moveSequence.length) { clearInterval(flashMoves); }
		}, 1000);
	};

	//this stopped working?
	var aGame = new Game();

	startButton.addEventListener('click', aGame.makeRandomMove);
}

var start = new Gui();

