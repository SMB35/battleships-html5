'use strict'

var defaultBoxWidth = 16;
var defaultGrid = [16, 16];
var grid;

var $gameGrid   = '';
var $playerGrid = '';
var $aiGrid     = '';
var $deployGrid = '';
var $phaseTitle = '';

var destroyer;
var cruiser;
var submarine;
var battleship;
var carrier;

var playerShips = [];
var placements  = [];
var takenspace  = [];

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
	this.width  = parseInt(this.htmlObject.css('width'));
	this.height = parseInt(this.htmlObject.css('height'));
	this.takenspaces = [];

	this.getjQueryWrapper = function() {
		return this.htmlObject;
	}

	this.setPlacements = function(placements) {
		this.placements = placements;
	}

	this.setPosition = function() {
		this.htmlObject.css('left', (this.placements[0] * GRID_SIZE_BOX_PIXELS));
		this.htmlObject.css('top',  (this.placements[1] * GRID_SIZE_BOX_PIXELS) - 1);
		if (parseInt(this.placements[2])) {
			this.htmlObject.css('height', this.width);
			this.htmlObject.css('width',  this.height);
		} else {
			this.htmlObject.css('width',  this.width);
			this.htmlObject.css('height', this.height);			
		}
	}

	this.setSpaces = function(spaces) {
		this.takenspaces = [];
		this.takenspaces = spaces;
	}

	this.getOrientation = function() {
		return this.orientation;
	}

	this.getShipName = function() {
		return this.name;
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

function checkSpaceTaken(x, y, z, size) {
	for (var i = 0;i < takenspace.length;i++) {
		if (parseInt(z)) {
			for (var c = 0;c < size;c++) {
				if (x == takenspace[i][0] && (y + c) == takenspace[i][1]) {
					return true;
				}
			}
		} else {
			for (var c = 0;c < size;c++) {
				if ((x + c) == takenspace[i][0] && y == takenspace[i][1]) {
					return true;
				}					
			}			
		}
	}
	return false;
}

function createSpacesTaken(x, y, z, size) {
	var spaces = [];
	for (var i = 0;i < size;i++) {
		if (parseInt(z)) {
			takenspace.push([x, y + i]);
			spaces.push([x, y + i]);
		} else{
			takenspace.push([x + i, y]);
			spaces.push([x + i, y]);
		}
	}
	return spaces;
}

function createRandomPlacement(ship) {
	var x = createRandomSpot();
	var y = createRandomSpot();
	var z = createRandomOrientation().toFixed(0);
	if (parseInt(z)) {
		if (checkPlacementConfines(ship.size, y) && !checkSpaceTaken(x, y, z, ship.size)) {
			ship.setSpaces(createSpacesTaken(x, y, z, ship.size));
			return [x, y, z];
		}
	} else {
		if (checkPlacementConfines(ship.size, x) && !checkSpaceTaken(x, y, z, ship.size)) {
			ship.setSpaces(createSpacesTaken(x, y, z, ship.size));
			return [x, y, z];
		}
	}
	return createRandomPlacement(ship);
}

function createRandomPlacements() {
	for (var i = 0;i < playerShips.length;i++) {
		playerShips[i].setPlacements(createRandomPlacement(playerShips[i]));
	}
}

function createRandomSpot() {
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
	destroyer  = new playerShip('Destroyer',  2, 0, 0, ORIENTATION_HORIZONTAL, placements[0]);
	cruiser    = new playerShip('Cruiser',    3, 0, 0, ORIENTATION_HORIZONTAL, placements[1]);
	submarine  = new playerShip('Submarine',  3, 0, 0, ORIENTATION_HORIZONTAL, placements[2]);
	battleship = new playerShip('Battleship', 4, 0, 0, ORIENTATION_HORIZONTAL, placements[3]);
	carrier    = new playerShip('Carrier',    5, 0, 0, ORIENTATION_HORIZONTAL, placements[4]);
	$('#playerDestroyer').data('ship',  destroyer);
	$('#playerCruiser').data('ship',    cruiser);
	$('#playerSubmarine').data('ship',  submarine);
	$('#playerBattleship').data('ship', battleship);
	$('#playerCarrier').data('ship',    carrier);
	playerShips    = [destroyer, cruiser, submarine, battleship, carrier];
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

			drawnGrid += '<div id="grid-' + gridPosition + '" class="box ' + boxClass + '" data-gridx="' + i + '" data-gridy="' + c + '"></div>';
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

function makeShipsDraggable() {
	$('.playerShip').draggable({
		snap: ".box",
		snapMode: "outer",
		containment: "#playerDeploymentGrid",
		revert: 'invalid',
	    stop: function(){
	        $(this).draggable('option','revert','invalid');
			console.log($(this).data());
	    }
	});
	$('.box').droppable({
		tolerance: 'intersect',
		drop: function( event, ui ) {
			//console.log($(this).data('gridx') + ', ' + $(this).data('gridy'));
			detectCollisions();
		$(this)
			.addClass( "ui-state-highlight" )
			.html( "Dropped!" );
		}
	});

	$('.playerShip').droppable({
	    greedy: true,
	    tolerance: 'intersect',
	    drop: function(event,ui){
	        ui.draggable.draggable('option','revert',true);
			console.log('Data : ' + $(this).data());
	    }
	});
}

function deselectShip() {
	$('.playerShip').removeClass('playerShipSelected');
}

function detectCollisions() {
	for (var i = 0;i < playerShips.length;i++) {
		var $ship = $('#player' + playerShips[i].name);
		var position = $ship.position();
		//console.log(position);
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
		deselectShip();
		createRandomPlacements();
		positionShipsToRandoms();
	});

	$('.playerShip').on('mousedown', function() {
		deselectShip();
		$(this).addClass('playerShipSelected');

	});

	makeShipsDraggable();
	positionShipsToRandoms();
});