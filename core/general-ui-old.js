/*let Wall = require('./wall-api');
let WallUI = require('./base-wall-ui');
let BrickUI = require('./base-brick-ui');
let actions = require('./action-handling');

let activeWall = Wall.emptyWall;
let activeBricksMap = new Map();*/

/*********** Wall and brick activation ***********/

/*function highlightBrick(brick) {
	$('.activeBrick').removeClass('activeBrick');
	brick.getUI().getFocusElem().addClass('activeBrick');
}

function getActiveBrickOf(wall) {
	if(!activeBricksMap.has(wall))
		activeBricksMap.set(wall, wall.getMainBrick());

	return activeBricksMap.get(wall);
}

function changeActiveBrickOf(wall, brick) {
	activeBricksMap.set(wall, brick);
}

function highlightWall(wall) {
	$('.activeWall').removeClass('activeWall');
	wall.getUI().getContainer().addClass('activeWall');
}

function changeActiveWall(wall) {
	if(wall.getUI().getContainer().length > 0)	
		activeWall = wall;
}*/

/*********** Wall traverse ***********/

/*function getNextWallOf(wall) {
	return WallUI.from(wall.getUI().getContainer().next());
}

function getPrevWallOf(wall) {
	return WallUI.from(wall.getUI().getContainer().prev());
}

function getUpperWallOf(wall) {
	let wallUI = wall.getUI().getContainer();
	let top = wallUI.position().top;
	let target = $();

	wallUI.prevAll().each(function(i, e) {
		let checkBottom = $(e).position().top + $(e).height();

		if(checkBottom < top) {
			target = $(e);
			return false;
		}
	});

	return WallUI.from(target);
}

function getBottomWallOf(wall) {
	let wallUI = wall.getUI().getContainer();
	let bottom = wallUI.position().top + wallUI.height();
	let target = $();	

	wallUI.nextAll().each(function(i, e) {
		let checkTop = $(e).position().top;

		if(bottom < checkTop) {
			target = $(e);
			return false;
		}
	});

	return WallUI.from(target);
}*/

/*********** Brick (within wall) traverse ***********/

/*function getParentBrickWithin(wall) {
	let activeBrick = getActiveBrickOf(wall);

	if(activeBrick.isEmpty())
		return activeBrick;

	return activeBrick.getParent();
}

function getFirstChildBrickWithin(wall) {
	let activeBrick = getActiveBrickOf(wall);

	if(activeBrick.isEmpty())
		return activeBrick;

	return BrickUI.from(activeBrick.getUI().getChildrenContainer().children().first());
}

function getNextSiblingBrickWithin(wall) {
	let activeBrick = getActiveBrickOf(wall);

	if(activeBrick.isEmpty())
		return activeBrick;

	let activeBrickUI = activeBrick.getUI().getContainer();
	let nextPos = activeBrickUI.next();

	if(nextPos.length === 0 && !activeBrickUI.parent().is(wall.getUI().getContainer())) {
		let closeParent = activeBrickUI.parent().parent();

		while(!closeParent.parent().is(wall.getUI().getContainer()) && closeParent.next().length === 0) {
			closeParent = closeParent.parent().parent();
		}

		if(!closeParent.parent().is(wall.getUI().getContainer()) && closeParent.next().length > 0) {
			let firstChild = closeParent.next();

			while(firstChild.children('div').last().children().length > 0) {
				firstChild = firstChild.children('div').last().children().first();
			}

			nextPos = firstChild;
		}
	}

	return BrickUI.from(nextPos);
}

function getPrevSiblingBrickWithin(wall) {
	let activeBrick = getActiveBrickOf(wall);

	if(activeBrick.isEmpty())
		return activeBrick;

	let activeBrickUI = activeBrick.getUI().getContainer();
	let prevPos = activeBrickUI.prev();

	if(prevPos.length === 0 && !activeBrickUI.parent().is(wall.getUI().getContainer())) {
		let closeParent = activeBrickUI.parent().parent();

		while(!closeParent.parent().is(wall.getUI().getContainer()) && closeParent.prev().length === 0) {
			closeParent = closeParent.parent().parent();
		}

		if(!closeParent.parent().is(wall.getUI().getContainer()) && closeParent.prev().length > 0) {
			let firstChild = closeParent.prev();

			while(firstChild.children('div').last().children().length > 0) {
				firstChild = firstChild.children('div').last().children().last();
			}

			prevPos = firstChild;
		}
	}

	return BrickUI.from(prevPos);
}

function getNearestOfActiveBrickWithin(wall) {
	let nearestBrick = getPrevSiblingBrickWithin(wall);

	if(nearestBrick.isEmpty())
		nearestBrick = getParentBrickWithin(wall);

	return nearestBrick;
}*/

/*********** Actions ***********/

/*actions.register([
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
			let targetBrick = getParentBrickWithin(activeWall);

			if(!targetBrick.isEmpty()) {
				changeActiveBrickOf(activeWall, targetBrick);
				highlightBrick(getActiveBrickOf(activeWall));
			}
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function() {
			let targetBrick = getFirstChildBrickWithin(activeWall);

			if(!targetBrick.isEmpty()) {
				changeActiveBrickOf(activeWall, targetBrick);
				highlightBrick(getActiveBrickOf(activeWall));
			}
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function() {
			let targetBrick = getNextSiblingBrickWithin(activeWall);

			if(!targetBrick.isEmpty()) {
				changeActiveBrickOf(activeWall, targetBrick);
				highlightBrick(getActiveBrickOf(activeWall));
			}
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function() {
			let targetBrick = getPrevSiblingBrickWithin(activeWall);

			if(!targetBrick.isEmpty()) {
				changeActiveBrickOf(activeWall, targetBrick);
				highlightBrick(getActiveBrickOf(activeWall));
			}
		}
	},
	{
		// Supr - remove brick
		key: 46,
		action: function() {
			let targetBrick = getNearestOfActiveBrickWithin(activeWall);
			let toRemoveBrick = getActiveBrickOf(activeWall);
			changeActiveBrickOf(activeWall, targetBrick);
			highlightBrick(getActiveBrickOf(activeWall));
			toRemoveBrick.dispose();
		}
	}
]);*/

module.exports = {
	addWalls: function(walls) {
		for(let i in walls) {
			walls[i].ui.container.appendTo('#mainContainer');

			if(i == 0) {
				/*changeActiveWall(walls[i]);
				highlightWall(activeWall);
				highlightBrick(getActiveBrickOf(activeWall));*/
			}
		}
	}/*,
	getActiveWall: function() {
		return activeWall;
	},
	getActiveBrick: function() {
		return getActiveBrickOf(activeWall);
	},
	showInputDialog: function(config) {
		let inputDialog = $(`<div title="${config.title}">`).
			dialog({ 
				autoOpen: false,
				modal: true,
				resizable: false,
				draggable: false,
				minHeight: 10,
				minWidth: 10,
				close: function() {
					$(this).remove();
				}
			});

		if(config.relativeTo) {
			inputDialog.dialog('option', 'position', {
				at: 'right bottom',
				my: 'left top',
				of: config.relativeTo
			});
		}

		$(`<input style="width: 95%;" type="text" placeholder="${config.placeholder}"/>`).
			appendTo(inputDialog).
			keypress(function(e) {
				if(e.which === 13) {
					if($(this).val() !== '') {
						if(config.handle)
							config.handle($(this).val());
					}

					inputDialog.dialog('close');
				}
			});

		inputDialog.dialog('open');
	}*/
};