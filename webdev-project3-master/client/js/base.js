var localPlayer,	// Local player
	remotePlayers,	// Remote players
	socket,
	name;

function playClicked() {
	name = $("#name").val();
	window.location.href = "war.html?name="+name;
}

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");
    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }
    return params;
}

function startGame() {
	var GET = getQueryParams(document.location.search);
	name = GET['name'];
	init();
}

function init() {
	// Initialise the local player
	localPlayer = new Player(name);

	// Initialise socket connection
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});

	// Initialise remote players array
	remotePlayers = [];

	// Start listening for events
	setEventHandlers();
}

var setEventHandlers = function() {
	// Socket connection successful
	socket.on("connect", onSocketConnected);

	// Socket disconnection
	socket.on("disconnect", onSocketDisconnect);

	// New player message received
	socket.on("new player", onNewPlayer);

	// Player removed message received
	socket.on("remove player", onRemovePlayer);

	// Player removed message received
	socket.on("player ready", onPlayerReady);
};

// Socket connected
function onSocketConnected() {
	console.log("Connected to socket server");

	// Send local player data to the game server
	socket.emit("new player", name);
};

// Socket disconnected
function onSocketDisconnect() {
	console.log("Disconnected from socket server");
};

// New player
function onNewPlayer(data) {
	console.log("New player connected: "+data.id);

	// Initialise the new player
	var newPlayer = new Player(data.name);
	newPlayer.id = data.id;

	// Add new player to the remote players array
	remotePlayers.push(newPlayer);
};

// Remove player
function onRemovePlayer(data) {
	var removePlayer = playerById(data.id);

	// Player not found
	if (!removePlayer) {
		console.log("Player not found: "+data.id);
		return;
	};

	// Remove player from array
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};

// Remove player
function onPlayerReady(data) {
	console.log("Player #"+data.id+" is ready!");
};