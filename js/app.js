'use strict'

var defaultBoxWidth = 16;
var defaultGrid = [16, 16];
var grid;

var $gameGrid   = '';
var $playerGrid = '';
var $aiGrid     = '';
var $deployGrid = '';
var $phaseTitle = '';

var playerShips = [];

var shipNames = ['Destroyer', 'Cruiser', 'Submarine', 'Battleship', 'Carrier'];
var shipSizes = [2, 3, 3, 4, 5];

var placements = [];
var takenspace = [];

function playerShip(name, x, y) {
	this.name = name;
	this.x = x;
	this.y = y;

	this.getName = new function() {
		return this.name;
	}

	this.getX = new function() {
		return this.x;
	}

	this.getY = new function() {
		return this.y;
	}

	this.getDroppedX = new function() {
		var $ship = $('#player' + this.name);
		console.log($ship.position());
	}
}

function checkPlacementConfines(size, spot) {
	if ((spot + size) >= 16) {
		return false;
	}
	return true;
}

function checkSpaceTaken(x, y) {
	for (var i = 0;i < takenspace.length;i++) {
		console.log('comparing ' + [x, y] + ' to ' + takenspace[i]);
		if (x == takenspace[i][0] && y == takenspace[i][1]) {
			//alert('collision');
			console.log('space is taken');
			return true
		}
	}
	console.log(takenspace);
	console.log('space is not taken');
	return false;
}

function createSpacesTaken(x, y, size) {
	console.log(x + ' :: ' + y + ' :: ' + size);
	for (var i = 0;i < size;i++) {
		console.log(i);
		takenspace.push([x + i, y]);
	}
}

function createRandomPlacement(shipSize) {
	var x = createRandomSpot();
	var y = createRandomSpot();
	if (checkPlacementConfines(shipSize, x) && checkPlacementConfines(shipSize, y) && !checkSpaceTaken(x, y) ) {
		//takenspace.push([x, y]);
		createSpacesTaken(x, y, shipSize);
		console.log(checkSpaceTaken(x, y));
		return [x, y];
	} else {
		return createRandomPlacement(shipSize);
	}
}

function createRandomPlacements() {
	for (var i = 0;i < 5;i++) {
		placements[i] = createRandomPlacement(shipSizes[i]);
	}
}

function createRandomSpot() {
	return Math.floor(Math.random() * 16);
}

function positionShipsToRandoms() {
	for (var i = 0;i < 5;i++) {
		$('#player' + shipNames[i]).css('left', (placements[i][0] * 32));
		$('#player' + shipNames[i]).css('top', (placements[i][1] * 32) - 1);
	}
}

function createShips() {
	var destroyer = new playerShip('Destroyer', [0, 0]);
	var cruiser = new playerShip('Cruiser', [0, 0]);
	var submarine = new playerShip('Submarine', [0, 0]);
	var battleship = new playerShip('Battleship', [0, 0]);
	var carrier = new playerShip('Carrier', [0, 0]);
	playerShips = [destroyer, cruiser, submarine, battleship, carrier];
}

function drawGrid(size) {

	if (grid == -1) {
		grid = defaultGrid;
	} else {
		grid = [size, size];
	}

	var drawnGrid = '';
	
	var gridPosition = 0;
	
	for (var i = 0;i < grid[0];i++) {
		for (var c = 0;c < grid[1];c++) {
			var boxClass = 'boxStandard';

			if (c == grid[1]) {
				boxClass = 'boxEndY';
			} else if (i == 0 && c == 0) {
				boxClass = 'boxStart';
			} else if (i == 0) {
				boxClass = 'boxStartX';
			} else if (c == 0) {
				boxClass = 'boxStartY';
			}

			drawnGrid += '<div id="grid-' + gridPosition + '" class="box ' + boxClass + '"></div>';
			if (c == grid[1] - 1) {
				drawnGrid += '<div style="clear: left;"></div>'
			}
			gridPosition++;
		}
	}
	
	$deployGrid.html(drawnGrid);
	$playerGrid.html(drawnGrid);
	$aiGrid.html(drawnGrid);
}

function setGamePhaseTitle(title) {
	$phaseTitle.html(title);
}

function confirmChangeGridSize() {
	return confirm('Are you sure you want to change the grid size?\n\ &nbsp;\n\ &nbsp; \n\ This will create a new game!');
}

function makeShipsDraggable() {
	$('.playerShip').draggable({
		snap: ".box",
		snapMode: "outer",
		containment: "#playerDeploymentGrid",
		cursor: 'move',
		revert: 'invalid',
	    stop: function(){
	        $(this).draggable('option','revert','invalid');
	    }
	});
	$('.box').droppable({
		tolerance: 'intersect',
		drop: function( event, ui ) {
			console.log($(this));
			detectCollisions();
		$(this)
			.addClass( "ui-state-highlight" )
			.html( "Dropped!" );
		}
	});

	$('.playerShip').droppable({
	    greedy: true,
	    tolerance: 'touch',
	    drop: function(event,ui){
	        ui.draggable.draggable('option','revert',true);
	    }
	});
}

function detectCollisions() {
	for (var i = 0;i < playerShips.length;i++) {
		var $ship = $('#player' + playerShips[i].name);
		var position = $ship.position();
		console.log(position);
		console.log(playerShips[i].name + ' is at x:' + position.left + ' y:' + position.top);
	}
}

$().ready(function() {
	
	$gameGrid   = $('#gameBoard');
	$playerGrid = $('#playerGrid');
	$aiGrid     = $('#aiGrid');
	$deployGrid = $('#playerDeploymentGrid');
	$phaseTitle = $('#gameStageTitle');
	
	createRandomPlacements();
	drawGrid(defaultBoxWidth);
	
	$('#buttonGameStart').on('click', function() {
		$('#gameDeployment').fadeOut('slow', function() {
			$('#gameBoard').fadeIn();
			setGamePhaseTitle('Battle Phase');
		});
	});

	$('#buttonSetRandom').on('click', function() {
		takenspace = [];
		createRandomPlacements();
		positionShipsToRandoms();
		console.log(takenspace);
	});

	createShips();
	makeShipsDraggable();
	positionShipsToRandoms();
});