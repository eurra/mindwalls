let mw = require('../core/mindwalls.js');

let metaBrick = null;
let activeWall = null;
let activeBricksMap = new Map();

function getActiveBrickFromWall(wall) {
	let brick = null;

	if(activeBricksMap.has(wall)) {
		brick = activeBricksMap.get(wall);
	}
	else {
		brick = wall.getFirstChild();

		if(brick != null)
			activeBricksMap.set(brick, wall);
	}
	
	return brick;
}

function switchToActiveBrickFromWall(wall) {
	if(metaBrick != null) {
		let brick = getActiveBrickFromWall(wall);

		$('.activeBrick').removeClass('activeBrick');

		if(brick != null)
			brick.getView().addClass('activeBrick');
	}
}

function changeActiveBrickOfWall(wall, brick) {
	if(metaBrick != null && brick != null && wall != null) {
		activeBricksMap.set(wall, brick);
		switchToActiveBrickFromWall(wall);
	}
}

function changeActiveWall(wall) {
	if(metaBrick != null && wall != null) {
		wall.mustBe('wall');
		activeWall = wall;				
		switchToActiveBrickFromWall(activeWall);

		$('.activeWall').removeClass('activeWall');
		wall.getContent().addClass('activeWall');
	}
}

function getClosestBrickOf(brick) {
	let currBrick = brick;						

	if(currBrick != null) {
		let parentBrick = currBrick.getParent();
		let nextBrick = parentBrick.getPrevSiblingOf(currBrick);

		if(nextBrick == null) {
			currBrick = parentBrick.getNextSiblingOf(currBrick);

			if(currBrick != null)
				changeActiveBrickOfWall(this, activeWall, currBrick);
			else if(!parentBrick.instanceOf('wall'))
				changeActiveBrickOfWall(this, activeWall, parentBrick);
		}
		else {
			changeActiveBrickOfWall(this, activeWall, nextBrick);	
		}
	}
}

function checkIntersect(elem1, elem2) {
	let e1L = elem1.position().left;
	let e1R = e1L + elem1.width();

	let e2L = elem2.position().left;
	let e2R = e2L + elem2.width();

	return Math.max(e1L, e2L) <= Math.max(e1R, e2R);
}

mw.actions.register([
	{	// Move up between walls
		ctrlKey: true,
		key: 38,
		action: function() {
			if(metaBrick == null || activeWall == null)
				return;

			let nextWalls = metaBrick.getPrevAllOf(activeWall);
			let top = activeWall.getView().position().top;
			let target = null;
			let i = 0;

			while(target == null && i < nextWalls.length) {
				let checkBottom = nextWalls[i].getView().position().top + nextWalls[i].getView().height();

				if(checkBottom < top && checkIntersect(nextWalls[i].getView(), activeWall.getView()))
					target = nextWalls[i];

				i++;
			}

			if(target != null)
				changeActiveWall(target);
		}
	},
	{
		// Move down between walls
		ctrlKey: true,
		key: 40,
		action: function() {
			if(metaBrick == null || activeWall == null)
				return;

			let nextWalls = metaBrick.getNextAllOf(activeWall);
			let bottom = activeWall.getView().position().top + activeWall.getView().height();			
			let target = null;
			let i = 0;

			while(target == null && i < nextWalls.length) {
				let checkTop = nextWalls[i].getView().position().top;

				if(bottom < checkTop && checkIntersect(nextWalls[i].getView(), activeWall.getView()))
					target = nextWalls[i];

				i++;
			}

			if(target != null)
				changeActiveWall(target);
		}
	},
	{
		// Move right between walls
		ctrlKey: true,
		key: 39,
		action: function() {
			changeActiveWall(
				metaBrick.getNextSiblingOf(activeWall)
			);
		}
	},
	{
		// Move left between walls
		ctrlKey: true,
		key: 37,
		action: function() {
			changeActiveWall(
				metaBrick.getPrevSiblingOf(activeWall)
			);
		}
	},
	{
		// Move to parent (left) within wall
		key: 37,
		action: function() {
			if(metaBrick == null || activeWall == null)
				return;

			let currBrick = getActiveBrickFromWall(activeWall);						

			if(currBrick != null) {
				let parentBrick = currBrick.getParent();

				if(parentBrick != null && !parentBrick.instanceOf('wall'))
					changeActiveBrickOfWall(activeWall, parentBrick);
			}
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function() {
			if(metaBrick == null || activeWall == null)
				return;

			let currBrick = getActiveBrickFromWall(activeWall);

			if(currBrick != null && currBrick.instanceOf('nested')) {							
				let childBrick = currBrick.getFirstChild();

				if(childBrick != null)
					changeActiveBrickOfWall(activeWall, childBrick);
			}
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function() {
			if(metaBrick == null || activeWall == null)
					return;

			let currBrick = getActiveBrickFromWall(activeWall);						

			if(currBrick != null) {
				let parentBrick = currBrick.getParent();
				currBrick = parentBrick.getNextSiblingOf(currBrick);

				if(currBrick != null) {								
					changeActiveBrickOfWall(this, activeWall, currBrick);
				}
				else {
					while(!parentBrick.instanceOf('wall') && parentBrick.getNextSiblingOf(currBrick) == null) {
						currBrick = parentBrick;
						parentBrick = currBrick.getParent();
					}

					currBrick = parentBrick.getNextSiblingOf(currBrick);

					if(currBrick != null) {
						while(currBrick.instanceOf('nested'))
							currBrick = currBrick.getFirstChild();

						changeActiveBrickOfWall(activeWall, currBrick);
					}
				}
			}
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function() {
			if(metaBrick == null || activeWall == null)
				return;

			let currBrick = getActiveBrickFromWall(activeWall);						

			if(currBrick != null) {
				let parentBrick = currBrick.getParent();
				currBrick = parentBrick.getPrevSiblingOf(currBrick);

				if(currBrick != null) {
					changeActiveBrickOfWall(activeWall, currBrick);
				}
				else {
					while(!parentBrick.instanceOf('wall') && parentBrick.getPrevSiblingOf(currBrick) == null) {
						currBrick = parentBrick;
						parentBrick = currBrick.getParent();
					}

					currBrick = parentBrick.getPrevSiblingOf(currBrick);

					if(currBrick != null) {
						while(currBrick.instanceOf('nested'))
							currBrick = currBrick.getLastChild();

						changeActiveBrickOfWall(activeWall, currBrick);
					}
				}
			}
		}
	},
	{
		// Supr - remove brick
		key: 46,
		action: function() {
			let currBrick = metaBrick.getActiveBrick();

			if(currBrick != null) {
				if(metaBrick == null || activeWall == null)
					return;

				let activeBrick = getActiveBrickFromWall(activeWall)

				if(activeBrick != null) {
					changeActiveBrickOfWall(
						activeWall,
						getClosestBrickOf(activeBrick)
					);
				}

				currBrick.dispose();
			}
		}
	}
]);

module.exports = {
	setMeta: function(meta) {
		meta.mustBe('meta');
		$('body').empty();
		meta.getView().appendTo('body');		
		mw.actions.setTargetElem(meta.getView());
		metaBrick = meta;

		meta.on('onChildAdded', function(child) {
			console.log('aaaa');
			
			if(activeWall == null) {				
				changeActiveWall(child);
			}
		});
	},
	getMeta: function() {
		return metaBrick;
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
			val(config.defaultValue ? config.defaultValue : '').
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
	}
};