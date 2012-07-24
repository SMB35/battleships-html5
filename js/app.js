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

var GRID_SIZE = 16;
var GRID_SIZE_BOX_PIXELS = 32;

var ORIENTATION_HORIZONTAL = 0;
var ORIENTATION_VERTICAL   = 1;

function playerShip(name, size, x, y, orientation, placement) {
	this.name = name;
	this.size = size;
	this.htmlObject  = $('#player' + name);
	this.orientation = orientation;
	this.placement   = placement;
	this.x = x;
	this.y = y;

	this.getjQueryWrapper = function() {
		return this.htmlObject;
	}

	this.setPlacements = function(placements) {
		this.placements = placements;
	}

	this.setPosition = function() {
		this.htmlObject.css('left', (this.placements[0] * GRID_SIZE_BOX_PIXELS));
		this.htmlObject.css('top', (this.placements[1] * GRID_SIZE_BOX_PIXELS) - 1);		
	}

	this.getOrientation = function() {
		return this.orientation;
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
		if (x == takenspace[i][0] || y == takenspace[i][1]) {
			return true;
		}
	}
	return false;
}

function createSpacesTaken(x, y, size) {
	for (var i = 0;i < size;i++) {
		takenspace.push([x + i, y]);
	}
}

function createRandomPlacement(shipSize) {
	var x = createRandomSpot();
	var y = createRandomSpot();
	if (checkPlacementConfines(shipSize, x) && checkPlacementConfines(shipSize, y) && !checkSpaceTaken(x, y) ) {
		createSpacesTaken(x, y, shipSize);
		return [x, y];
	} else {
		return createRandomPlacement(shipSize);
	}
}

function createRandomPlacements() {
	for (var i = 0;i < playerShips.length;i++) {
		playerShips[i].setPlacements(createRandomPlacement(playerShips[i].size));
	}
}

function createRandomSpot() {
	// Math floor needed here?
	return Math.floor(Math.random() * 16);
}

function createRandomOrientation() {
	return Math.random();
}

function positionShipsToRandoms() {
	for (var i = 0;i < playerShips.length;i++) {
		playerShips[i].setPosition();
	}
}

function generateGrids() {
	
}

function generateGrid() {
	
}

function createShips() {
	var destroyer = new playerShip('Destroyer', 2, [0, 0], ORIENTATION_HORIZONTAL, placements[0]);
	var cruiser = new playerShip('Cruiser', 3, [0, 0], ORIENTATION_HORIZONTAL, placements[1]);
	var submarine = new playerShip('Submarine', 3, [0, 0], ORIENTATION_HORIZONTAL, placements[2]);
	var battleship = new playerShip('Battleship', 4, [0, 0], ORIENTATION_HORIZONTAL, placements[3]);
	var carrier = new playerShip('Carrier', 5, [0, 0], ORIENTATION_HORIZONTAL, placements[4]);
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
	
	createShips();
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
	});

	$('.playerShip').on('click', function() {
		$('.playerShip').removeClass('playerShipSelected');
		$(this).addClass('playerShipSelected');
	});

	makeShipsDraggable();
	positionShipsToRandoms();
});