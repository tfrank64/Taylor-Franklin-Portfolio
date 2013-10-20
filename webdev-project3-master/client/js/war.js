/* Death Ships by Jacob Ackerman and Taylor Franklin
* Original board and functions inspired by: http://diveintohtml5.info/canvas.html#halma
* Current version heavily differs from that canvas example.
*/

var kBoardWidth = 10;
var kBoardHeight= 10;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gShipCanvasElement;
var gBattleDrawingContext;
var gShipDrawingContext;
var gBattleDrawingContext;
var gPattern;

var gPieces;
var gNumPieces;
var squareOccupied;
var gSelectedPieceHasMoved;
var gMoveCount;
var gMoveCountElem;
var gGameInProgress;

//var gameReady = false;
var shipcanvasLock = false;
var battleCanvasLock = true;
var statVar = 0;
var currentCell;
var shipSize = [5,4,3,3,2];
var shipText = ["Aircraft Carrier (5 spaces)","Battleship (4 spaces)","Submarine (3 spaces)",
                "Destroyer (3 spaces)","Patrol Boat (2 spaces)"];
//grid to tell if space is occupied by ship. May add hit and miss to mean something
var gridCheck = [[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0]];
var numHits = 0;
var turnResponseWasHit = false;
var battleCell;
var opponentReady = false;
var localPlayerReady = false;
var firstThree = true;
//Ships
var aircraft = [[0,0],[0,0],[0,0],[0,0],[0,0]];
var battleship = [[0,0],[0,0],[0,0],[0,0]];
var submarine = [[0,0],[0,0],[0,0]];
var destroyer = [[0,0],[0,0],[0,0]];
var patrol = [[0,0],[0,0]];
//bools to avoid double checking:
var notSunk1 = false, notSunk2 = false, notSunk3 = false, notSunk4 = false, notSunk5 = false;

var shipStage;
var battleStage;
var shipLayer = new Kinetic.Layer();
var plottingLayer = new Kinetic.Layer();
var gridLayer = new Kinetic.Layer();
var battleGridLayer = new Kinetic.Layer();
var shipHitAndMissLayer = new Kinetic.Layer();
var battleHitAndMissLayer = new Kinetic.Layer();
var upArrowImage, downArrowImage, rightArrowImage, leftArrowImage;
var isPickingDirection = false;

var CELL_SIZE = 50,
    w = 10,
    h = 10,
    W = w * CELL_SIZE,
    H = h * CELL_SIZE;

/*====================================
 *
 *
 *  SOCKET IO
 *
 *====================================*/

var localPlayer,    // Local player
    remotePlayers,  // Remote players
    socket,
    name;

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
    // Initialise the local player
    localPlayer = new Player(name);
    console.debug(localPlayer);

    // Initialise socket connection

    //LOCALHOST
    //socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});
    
    //NODEJITSU
    socket = io.connect("http://battleship.jit.su", {transports: ["websocket"]});

    // Initialise remote players array
    remotePlayers = [];

    // Start listening for events
    setEventHandlers();

    //Draw game boards 
    initGame(null, document.getElementById('message'));
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
    socket.on("print message", onPrintMessage);

    //Opponent ended turn
    socket.on("opponent turn ended", onOpponentTurnEnded);

    //Turn Response
    socket.on("turn response", onTurnResponse);

    //Notifys when the other player is ready
    socket.on("notify player ready", onOpponentReady);

    //Game over
    socket.on("game over", onGameOver);
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

// 
function onPlayerReady() {
    socket.emit("player ready", localPlayer);
    console.log("emitting the player "+localPlayer.name+" is ready!");
};  

function onPrintMessage(data) {
    console.log(data);
}

function onOpponentTurnEnded(data) {
    console.log("Opponent's turn has ended!");
    console.debug(data);
    var response = hitOrMiss(data.column, data.row);
    socket.emit("turn response", response);
}

function onTurnResponse(data) {
    fillBattleCanvasWithResponse(data);
    console.log("shot was a "+data);
}

function onPlayerTurnEnded(data) {
    console.log("local player's turn has ended!");
    console.debug(data);
    socket.emit("turn ended", localPlayer, data);
}

function onOpponentReady(data) {
    console.log("Made it in onOpponentReady");
    opponentReady = true;
    unlockBattleCanvas();
    document.getElementById('message').innerHTML = "Your opponent is ready for battle!";
}

function onGameOver() {
    battleCanvasLock = true;
    shipcanvasLock = true;
    if(numHits < 17) {
        document.getElementById('message').innerHTML = "You've won!!! :D";
        document.getElementById('yay').innerHTML = "You've won!!! :D";
    } else {
        document.getElementById('message').innerHTML = "You've lost :(";
    }
}

/*====================================
 *
 *
 *  GAME LOGIC
 * TODO: make sure both players get endgame message and canvas locks
 *====================================*/

$(document).ready(function () {
    $("#direction").hide();
    $("#current").hide();
    $('#go').click(function() {
        var way = $('#Ways').val(); //Gets direction from drop down
        fillShip(way);
    });
    $('#quiet').click(function() {
        muteToggle();
    });
    $("#messageButton").click(function() {
        $("#current").toggle("fast",  function () {
            if($("#current").is(":hidden")) {
                $("#toggleIcon").attr("src", "img/toggle_down.png");
            } else {
                $("#toggleIcon").attr("src", "img/toggle_up.png");
            }
        });
    })
});

function Cell(row, column) {
    this.row = row;
    this.column = column;
}

function initGame(canvasElement, moveCountElement) {
    shipStage = new Kinetic.Stage({
        container: 'shipStage',
        width: 501,
        height: 501
    });

    battleStage = new Kinetic.Stage({
        container: 'battleStage',
        width: 501,
        height: 501
    });

    newGame();
}

function drawShipBoard() {
    if (gGameInProgress && isTheGameOver()) {
    endGame();
    }

    var back = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: W,
        height: H,
        fill: ""
    });
    gridLayer.add(back);

    for (i = 0; i < w + 1; i++) {
        var I = i * CELL_SIZE;
        var l = new Kinetic.Line({
            stroke: "white",
            points: [I, 0, I, H]
        });
        gridLayer.add(l);
    }

    for (j = 0; j < h + 1; j++) {
        var J = j * CELL_SIZE;
        var l2 = new Kinetic.Line({
            stroke: "white",
            points: [0, J, W, J]
        });
        gridLayer.add(l2);
    }

    shipStage.add(gridLayer);

    shipStage.on('mouseup', function(e) {
        shipCanvasClicked(e);
    });
}

function drawBattleBoard() {
    if (gGameInProgress && isTheGameOver()) {
        endGame();
    }

    var back = new Kinetic.Rect({
        x: 0,
        y: 0,
        width: W,
        height: H,
        fill: ""
    });
    battleGridLayer.add(back);

    for (i = 0; i < w + 1; i++) {
        var I = i * CELL_SIZE;
        var l = new Kinetic.Line({
            stroke: "white",
            points: [I, 0, I, H]
        });
        battleGridLayer.add(l);
    }

    for (j = 0; j < h + 1; j++) {
        var J = j * CELL_SIZE;
        var l2 = new Kinetic.Line({
            stroke: "white",
            points: [0, J, W, J]
        });
        battleGridLayer.add(l2);
    }

    battleStage.add(battleGridLayer);

    battleStage.on('mouseup', function(e) {
        battleCanvasClicked(e);
    });
}

function shipCursorPosition(e) {
    /* returns Cell with .row and .column properties */
    var coords = shipStage.getMousePosition();

    var x = coords.x;
    var y = coords.y;

    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);
    var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
    return cell;
}

function battleCursorPosition(e) {
    /* returns Cell with .row and .column properties */
    var coords = battleStage.getMousePosition();

    var x = coords.x;
    var y = coords.y;

    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);
    var cell = new Cell(Math.floor(y/kPieceHeight), Math.floor(x/kPieceWidth));
    return cell;
}

function shipCanvasClicked(e) {
    var cell = shipCursorPosition(e);
    clickOnEmptyCell(cell);
}

function battleCanvasClicked(e) {
    if(!battleCanvasLock) {
       battleCell = battleCursorPosition(e);
        onPlayerTurnEnded(battleCell);        
        battleCanvasLock = true; 
    } else {
        document.getElementById('message').innerHTML = 'It is not your turn!';
    }
}

function fillBattleCanvasWithResponse(wasHit) {
    if(wasHit == 1) {
        fillSpace(battleCell, "red", battleStage, battleHitAndMissLayer);
    } else if(wasHit == 2) {
        fillSpace(battleCell, "grey", battleStage, battleHitAndMissLayer);
    }
    else if(wasHit == 3) { //means they clicked on a red or grey square
        //enemyfillSpace(battleCell, "white");
    }
}

function clickOnEmptyCell(cell) {
    if(shipcanvasLock) {
        if(localPlayerReady && opponentReady)
            document.getElementById('message').innerHTML = 'Attack your opponent.';
        else
            document.getElementById('message').innerHTML = 'Choose a direction!';
        return;
    }
    if(gridCheck[cell.column][cell.row] == 1) {
        document.getElementById('message').innerHTML = 'That coordinate is occupied!';
        return;
    }

    currentCell = cell;
    fillSpace(cell,"green", shipStage, plottingLayer);
    if(isPickingDirection) {
        clearPlottingLayer();
        fillSpace(currentCell, "green", shipStage, plottingLayer);
    }
    isPickingDirection = true;
    drawDirections(currentCell);
}

function drawDirections(cellSelected) {
    var upArrow = new Image();
    upArrow.src = "img/north.png";

    var downArrow = new Image();
    downArrow.src = "img/south.png";

    var rightArrow = new Image();
    rightArrow.src = "img/east.png";

    var leftArrow = new Image();
    leftArrow.src = "img/west.png";

    upArrowImage = new Kinetic.Image({
          x: (cellSelected.column*50)-10,
          y: (cellSelected.row*50)-80,
          image: upArrow,
          width: 75,
          height: 75
        });
    downArrowImage = new Kinetic.Image({
          x: (cellSelected.column*50)-10,
          y: (cellSelected.row*50)+55,
          image: downArrow,
          width: 75,
          height: 75
        });
    rightArrowImage = new Kinetic.Image({
          x: (cellSelected.column*50)+60,
          y: (cellSelected.row*50)-15,
          image: rightArrow,
          width: 75,
          height: 75
        });
    leftArrowImage = new Kinetic.Image({
          x: (cellSelected.column*50)-80,
          y: (cellSelected.row*50)-15,
          image: leftArrow,
          width: 75,
          height: 75
        });

    upArrowImage.on('mouseup', function(){
        fillShip("North", shipLayer);
    });
    downArrowImage.on('mouseup', function(){
        fillShip("South", shipLayer);
    });
    rightArrowImage.on('mouseup', function(){
        fillShip("East", shipLayer);
    });
    leftArrowImage.on('mouseup', function(){
        fillShip("West", shipLayer);
    });

    plottingLayer.add(upArrowImage);
    plottingLayer.add(downArrowImage);
    plottingLayer.add(rightArrowImage);
    plottingLayer.add(leftArrowImage);
    
    shipStage.add(plottingLayer);
}

function isTheGameOver() {
    if(numHits >= 17) {
        return true;
    } else {
        return false;
    }
}

//NEED to finish this function, seems to work so far. need to do check before fillSpace
function overlapCheck (direction) {
    //Create deep copy of currentCell object (before was creating reference only)
    var grid = jQuery.extend(true, {}, currentCell);
    var size = shipSize[statVar];
    for(var length = 0; length < size-1; length++)
    {
        if(direction == "North")
        {   
            grid.row -= 1;
            if(gridCheck[grid.column][grid.row] == 1)
                return false;
        }
        if(direction == "South")
        {
            grid.row += 1; //moves up one cell
            if(gridCheck[grid.column][grid.row] == 1)
                return false;
        }
        if(direction == "West")
        {
            grid.column -= 1; //moves up one cell
            if(gridCheck[grid.column][grid.row] == 1)
                return false;
        }
        if(direction == "East")
        {
            grid.column += 1; //moves up one cell
            if(gridCheck[grid.column][grid.row] == 1)
                return false;
        }
    }
    return true;
}

function fillShip(direction, layer){
    if(!(overlapCheck(direction))) {
        document.getElementById('message').innerHTML = 'Ships overlap, try again!';
        //fillSpace(currentCell,"clear")
        return;
    }
    var size = shipSize[statVar];
    //assigns pivot coordinate
    if(size == 5) {
        aircraft[0][0] = currentCell.column;
        aircraft[0][1] = currentCell.row;
    }
    if(size == 4) {
        battleship[0][0] = currentCell.column;
        battleship[0][1] = currentCell.row;
    }
    if(size == 3 && firstThree) {
        submarine[0][0] = currentCell.column;
        submarine[0][1] = currentCell.row;
    }
    if(size == 3 && (!firstThree)) {
        destroyer[0][0] = currentCell.column;
        destroyer[0][1] = currentCell.row;
    }
    if(size == 2) {
        patrol[0][0] = currentCell.column;
        patrol[0][1] = currentCell.row;
    }

    gridCheck[currentCell.column][currentCell.row] = 1;
    fillSpace(currentCell, "green", shipStage, layer);
    for(var length = 1; length < size; length++)
    {
        if(direction == "North") {
            currentCell.row -= 1; //moves up one cell
        }
        if(direction == "South") {
            currentCell.row += 1; //moves up one cell
        }
        if(direction == "West") {
            currentCell.column -= 1; //moves up one cell
        }
        if(direction == "East") {
            currentCell.column += 1; //moves up one cell
        }
        fillSpace(currentCell,"green", shipStage, layer);
        gridCheck[currentCell.column][currentCell.row] = 1;

        if(size == 5 && length > 0) {
            aircraft[length][0] = currentCell.column;
            aircraft[length][1] = currentCell.row;
        }
        if(size == 4 && length > 0) {
            battleship[length][0] = currentCell.column;
            battleship[length][1] = currentCell.row;
        }
        if(size == 3 && length > 0 && firstThree) {
            submarine[length][0] = currentCell.column;
            submarine[length][1] = currentCell.row;
        }
        if(size == 3 && length > 0 && !firstThree) {
            destroyer[length][0] = currentCell.column;
            destroyer[length][1] = currentCell.row;
        }
         if(size == 2 && length > 0) {
            patrol[length][0] = currentCell.column;
            patrol[length][1] = currentCell.row;
        }
    }
    if(shipSize[statVar] == 3 && firstThree) {
        firstThree = false;
    }

    isPickingDirection = false;
    clearPlottingLayer();
    shipcanvasLock = false;
    document.getElementById('message').innerHTML = 'Yay!!';
    statVar+= 1;

    if(statVar == 5) {
        document.getElementById('current').innerHTML = 'All ships are in place!';
        firstThree = true;
        onPlayerReady();
        localPlayerReady = true;
        unlockBattleCanvas();

        //Completely turn off all ship canvas events
        shipcanvasLock = true;
        upArrowImage.off("mouseup");
        downArrowImage.off("mouseup");
        leftArrowImage.off("mouseup");
        rightArrowImage.off("mouseup");
        shipStage.off("mouseup");
    } else {
        document.getElementById('currentShip').innerHTML = shipText[statVar];
    }
}

function clearPlottingLayer() {
    //Clear directions and plotting layer from canvas
    upArrowImage.off("mouseup");
    downArrowImage.off("mouseup");
    leftArrowImage.off("mouseup");
    rightArrowImage.off("mouseup");

    upArrowImage.on("mouseup", function(e) {
        var cell = shipCursorPosition(e);
        clickOnEmptyCell(cell);
    });
    downArrowImage.on("mouseup", function(e) {
        var cell = shipCursorPosition(e);
        clickOnEmptyCell(cell, shipStage);
    });
    rightArrowImage.on("mouseup", function(e) {
        var cell = shipCursorPosition(e);
        clickOnEmptyCell(cell);
    });
    leftArrowImage.on("mouseup", function(e) {
        var cell = shipCursorPosition(e);
        clickOnEmptyCell(cell);
    });
    plottingLayer.removeChildren();
    plottingLayer.remove();
}

function unlockBattleCanvas() {
    if(localPlayerReady && opponentReady)
        battleCanvasLock = false;
}

function fillSpace(p, color, canvas, layer){
    var column = p.column;
    var row = p.row;
    var x = (column * kPieceWidth);
    var y = (row * kPieceHeight);

    var rect = new Kinetic.Rect({
        x: x,
        y: y,
        width: 50,
        height: 50,
        fill: color,
        stroke: 'white',
        strokeWidth: 1
      });

    layer.add(rect);
    canvas.add(layer);
}

function playSound(soundfile) { //change source to turn sound off
    var mySound = document.getElementById("soundDiv");
    mySound.volume=0.4;  
    document.getElementById("soundDiv").innerHTML = "<source src='"+soundfile+"' type='audio/wav'>";
}

function hitOrMiss(x,y) {
    console.log("HITORMISS: X->"+x+", Y->"+y+", gridCheck->"+gridCheck[x][y]);
    console.debug(gridCheck);
    battleCanvasLock = false;
    if(gridCheck[x][y] == 1) {
        gridCheck[x][y] = 2; //2 means it was hit
        x = (x * kPieceWidth); //moves appropriate number of pieces over.
        y = (y * kPieceHeight);

        var rect = new Kinetic.Rect({
            x: x,
            y: y,
            width: 50,
            height: 50,
            fill: 'red',
            stroke: 'white',
            strokeWidth: 1
        });
        shipHitAndMissLayer.add(rect);
        shipStage.add(shipHitAndMissLayer);

        document.getElementById('message').innerHTML = "You've been hit!";
        if(!notSunk1 && checkSink1())
            document.getElementById('message').innerHTML = "Your Aircraft Carrier has been sunk!";
        if(!notSunk2 && checkSink2())
            document.getElementById('message').innerHTML = "Your Battleship has been sunk!";
        if(!notSunk3 && checkSink3())
            document.getElementById('message').innerHTML = "Your Submarine has been sunk!";
        if(!notSunk4 && checkSink4())
            document.getElementById('message').innerHTML = "Your Destroyer has been sunk!";
        if(!notSunk5 && checkSink5())
            document.getElementById('message').innerHTML = "Your Patrol Boat has been sunk!";
        numHits++;
        if(numHits >= 17) {
            socket.emit("game over");
        }
        return 1; //means it was hit
    }
    else if(gridCheck[x][y] == 0) {
        x = (x * kPieceWidth); //moves appropriate number of pieces over.
        y = (y * kPieceHeight);

        var rect = new Kinetic.Rect({
            x: x,
            y: y,
            width: 50,
            height: 50,
            fill: 'grey',
            stroke: 'white',
            strokeWidth: 1
        });
        shipHitAndMissLayer.add(rect);
        shipStage.add(shipHitAndMissLayer);

        document.getElementById('message').innerHTML = "Miss! Praise the Lord!";
        return 2;
    }
    else {
        document.getElementById('message').innerHTML = "Invalid Attack";
        return 3;
    }
}

function checkSink1() {
    var fl = 0;
    
    for(var a = 0; a < 5; a++) {
        var x = aircraft[a][0];
        var y = aircraft[a][1];
        for(var b = 0; b < 5; b++) {
            
            if(gridCheck[x][y] == 2) {
                fl += 1;
                break;
            }
        }
    }
    if(fl == 5) {
        notSunk1 = true;
        playSound("js/bomb.wav");
        return true;
    }
    else
        return false;
}
function checkSink2() {
    var fl = 0;
    for(var a = 0; a < 4; a++) {
        var x = battleship[a][0];
        var y = battleship[a][1];
        for(var b = 0; b < 4; b++) {
            if(gridCheck[x][y] == 2) {
                fl += 1;
                break;
            }
        }
    }
    if(fl == 4) {
        notSunk2 = true;
        playSound("js/bomb.wav");
        return true;
    }
    else
        return false;
}
function checkSink3() {
    var fl = 0;
    for(var a = 0; a < 3; a++) {
        var x = submarine[a][0];
        var y = submarine[a][1];
        for(var b = 0; b < 3; b++) {
            if(gridCheck[x][y] == 2) {
                fl += 1;
                break;
            }
        }
    }
    if(fl == 3) {
        notSunk3 = true;
        playSound("js/bomb.wav");
        return true;
    }
    else
        return false;
}
function checkSink4() {
    var fl = 0;
    for(var a = 0; a < 3; a++) {
        var x = destroyer[a][0];
        var y = destroyer[a][1];
        for(var b = 0; b < 3; b++) {
            if(gridCheck[x][y] == 2) {
                fl += 1;
                break;
            }
        }
    }
    if(fl == 3) {
        notSunk4 = true;
        playSound("js/bomb.wav");
        return true;
    }
    else
        return false;
}
function checkSink5() {
    var fl = 0;
    for(var a = 0; a < 2; a++) {
        var x = patrol[a][0];
        var y = patrol[a][1];
        for(var b = 0; b < 2; b++) {
            if(gridCheck[x][y] == 2) {
                fl += 1;
                break;
            }
        }
    }
    if(fl == 2) {
        notSunk5 = true;
        playSound("js/bomb.wav");
        return true;
    }
    else
        return false;
}

function muteToggle() {
    var mySound = document.getElementById("soundDiv");
    if(mySound.muted == true) {
        mySound.muted = false;
        document.getElementById('quiet').innerHTML = 'Mute';
    }
    else {
        mySound.muted = true;
        document.getElementById('quiet').innerHTML = 'Un-Mute';
    }
}

function newGame() {
    squareOccupied = 0; //if 1 means occupied
    drawShipBoard();
    drawBattleBoard();
}

function endGame() {
    squareOccupied = 0;
    gGameInProgress = false;
}
