var nodeStatic = require('node-static'),
	http = require('http'),
	util = require("util"),
    io = require("socket.io"),
    Player = require("./Player").Player;

var clientFiles = new nodeStatic.Server('client');
var socket,
	players;

var httpServer = http.createServer(function(request, response) {
    request.addListener('end', function () {
        clientFiles.serve(request, response);
    });
}).listen(8080);


/******************************************************************************************************
 *
 * The following socket code is based off an example from https://github.com/robhawkes/mozilla-festival
 *
 ******************************************************************************************************/

function init() {
    players = [];

    //LOCALHOST
    //socket = io.listen(8000);

    //NODEJITSU
    socket = io.listen(httpServer);
    httpServer.listen(8081);

    socket.configure(function() {
	    socket.set("transports", ["websocket"]);
	    socket.set("log level", 2);
	});

	setEventHandlers();
};

var setEventHandlers = function() {
	// Socket.IO
	socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
    util.log("New player has connected: "+client.id);
    client.on("disconnect", onClientDisconnect);
    client.on("new player", onNewPlayer);
    client.on("player ready", onPlayerReady);
    client.on("turn ended", onTurnEnded);
    client.on("turn response", onPassTurnResponse);
    client.on("game over", onGameOver);
};

function onClientDisconnect() {
    util.log("Player has disconnected: "+this.id);
};

//So far we do not handle there ever being more than two players
function onNewPlayer(n) {
	// Create a new player
	var newPlayer = new Player(n);
	newPlayer.id = this.id;

	// Broadcast new player to connected socket clients
	this.broadcast.emit("new player", {id: newPlayer.id, name: n});

	// Send existing players to the new player
	/*var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
		existingPlayer = players[i];
		this.emit("new player", {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()});
	};*/

	// Add new player to the players array
	players.push(newPlayer);
};

//Notify the opponent that the player has placed all of their ships
function onPlayerReady(data) {
	util.log("Player is ready "+data.name);
	//this.broadcast.emit("print message", {message: "Player "+data.name+" has placed his/her ships!"});
	this.broadcast.emit("notify player ready", data.name);
}

function onTurnEnded(player, data) {
	util.log(player.name+" has ended their turn with the following coordinates: "+data.row+", "+data.column);
	this.broadcast.emit("opponent turn ended", data);
}

function onPassTurnResponse(data) {
	util.log("Opponents turn was a "+data);
	this.broadcast.emit("turn response", data);
}

function onGameOver() {
	this.broadcast.emit("game over");
}

function playerById(id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id) {
			return players[i];
		}
	};

	return false;
};

init();