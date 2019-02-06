let bricks = require('./brick-api');
let walls = require('./wall-api');
let actions = require('./action-handling');

// Main UI data
let activeWall = emptyWall;
let activeBricksMap = new Map();

// Wall and brick activation
function highlightBrick(brick) {
	$('.activeBrick').removeClass('activeBrick');
	brick.getUI().getMainElement().addClass('activeBrick');
}

function getActiveBrickOf(wall) {
	if(!activeBricksMap.contains(wall))
		activeBricksMap.put(wall, wall.getMainBrick());

	return activeBricksMap.get(wall);
}

function changeActiveBrickOf(wall, brick) {
	if(brick.getUI().length > 0)
		activeBricksMap.put(wall, brick);
}

function highlightWall(wall) {
	$('.activeWall').removeClass('activeWall');
	wall.getUI().addClass('activeWall');
}

function changeActiveWall(wall) {
	activeWall = wall;
}

// Wall traverse
function getNextWallOf(wall) {
	return walls.of(wall.getUI().next());
};

function getPrevWallOf(wall) {
	return walls.of(wall.getUI().prev());
};

function getUpperWallOf(wall) {
	let top = wall.getUI().position().top;
	let target = $();

	ui.prevAll().each(function(i, e) {
		let checkBottom = $(e).position().top + $(e).height();

		if(checkBottom < top) {
			target = $(e);
			return false;
		}
	});

	return walls.of(target);
};

function getBottomWallOf(wall) {
	let bottom = wall.getUI().position().top + ui.height();
	let target = $();	

	ui.nextAll().each(function(i, e) {
		let checkTop = $(e).position().top;

		if(bottom < checkTop) {
			target = $(e);
			return false;
		}
	});

	return getWallOf(target);
};

// Brick (within wall) traverse
function getParentBrickWithin(wall) {
	return getActiveBrickOf(wall).getParent();
};

function getFirstChildBrickWithin(wall) {
	return bricks.of(getActiveBrickOf(wall).);

	changeActiveBrick(
		getBrickOf(activeBrick.getUI().children('div').last().children('div').first())
	);

	return this;
};

this.moveToNextSiblingBrick = function() {
	let nextPos = activeBrick.getUI().next();

	if(nextPos.length === 0 && !activeBrick.getUI().parent().is(ui)) {
		let closeParent = activeBrick.getUI().parent().parent();

		while(!closeParent.parent().is(ui) && closeParent.next().length === 0) {
			closeParent = closeParent.parent().parent();
		}

		if(!closeParent.parent().is(ui) && closeParent.next().length > 0) {
			let firstChild = closeParent.next();

			while(firstChild.children('div').last().children().length > 0) {
				firstChild = firstChild.children('div').last().children().first();
			}

			nextPos = firstChild;
		}
	}

	changeActiveBrick(getBrickOf(nextPos));
	return this;
};

this.moveToPrevSiblingBrick = function() {		
	let prevPos = activeBrick.getUI().prev();

	if(prevPos.length === 0 && !activeBrick.getUI().parent().is(ui)) {
		let closeParent = activeBrick.getUI().parent().parent();

		while(!closeParent.parent().is(ui) && closeParent.prev().length === 0) {
			closeParent = closeParent.parent().parent();
		}

		if(!closeParent.parent().is(ui) && closeParent.prev().length > 0) {
			let firstChild = closeParent.prev();

			while(firstChild.children('div').last().children().length > 0) {
				firstChild = firstChild.children('div').last().children().last();
			}

			prevPos = firstChild;
		}
	}

	changeActiveBrick(getBrickOf(prevPos));
	return this;
};


// Actions
actions.register([
	{	// Move up between walls
		ctrlKey: true,
		key: 38,
		action: function() {
			changeActiveWall(getUpperWallOf(activeWall));
			highlightWall(activeWall);
			highlightBrick(getActiveBrickOf(activeWall));
		}
	},
	{
		// Move down between walls
		ctrlKey: true,
		key: 40,
		action: function() {
			changeActiveWall(getBottomWallOf(activeWall));
			highlightWall(activeWall);
			highlightBrick(getActiveBrickOf(activeWall));
		}
	},
	{
		// Move right between walls
		ctrlKey: true,
		key: 39,
		action: function() {
			changeActiveWall(getNextWallOf(activeWall));
			highlightWall(activeWall);
			highlightBrick(getActiveBrickOf(activeWall));
		}
	},
	{
		// Move left between walls
		ctrlKey: true,
		key: 37,
		action: function() {
			changeActiveWall(getPrevWallOf(activeWall));
			highlightWall(activeWall);
			highlightBrick(getActiveBrickOf(activeWall));
		}
	},
	{
		// Move to parent (left) within wall
		key: 37,
		action: function() {
			activeWall.moveToParentBrick();
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function() {
			activeWall.moveToFirstChildBrick();
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function() {
			activeWall.moveToNextSiblingBrick();
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function() {
			activeWall.moveToPrevSiblingBrick();
		}
	}
]);