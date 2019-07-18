let mw = require('../core/mindwalls.js');

function checkIntersect(elem1, elem2) {
	let e1L = elem1.position().left;
	let e1R = e1L + elem1.width();

	let e2L = elem2.position().left;
	let e2R = e2L + elem2.width();

	return Math.max(e1L, e2L) < Math.min(e1R, e2R);
}

function getHorizontalDistance(elem1, elem2) {
	let e1m = elem1.position().left + (elem1.width() / 2);
	let e2m = elem2.position().left + (elem2.width() / 2);

	return Math.abs(e1m - e2m);
}

function getVerticalDistance(elem1, elem2) {
	let e1m = elem1.position().top + (elem1.height() / 2);
	let e2m = elem2.position().top + (elem2.height() / 2);

	return Math.abs(e1m - e2m);
}

let uiModule = {
	id: 'general-ui',
	loader: function(setup) {
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
			let brick = getActiveBrickFromWall(wall);

			$('.activeBrick').removeClass('activeBrick');

			if(brick != null)
				brick.getView().addClass('activeBrick');
		}

		function changeActiveBrickOfWall(wall, brick) {
			if(brick != null && wall != null) {
				activeBricksMap.set(wall, brick);
				switchToActiveBrickFromWall(wall);
			}
		}

		function changeActiveWall(wall) {
			if(wall != null) {
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
				let closestBrick = parentBrick.getPrevSiblingOf(currBrick);

				if(closestBrick == null) {
					closestBrick = parentBrick.getNextSiblingOf(currBrick);

					if(closestBrick != null)
						changeActiveBrickOfWall(activeWall, closestBrick);
					else if(!parentBrick.instanceOf('wall'))
						changeActiveBrickOfWall(activeWall, parentBrick);
				}
				else {
					changeActiveBrickOfWall(activeWall, closestBrick);	
				}
			}
		}

		function getClosestWall(nextWalls) {
			let target = null;
			let bestVerticalDist = 0;
			let bestHorizontalDist = 0;
			let i = 0;

			while(i < nextWalls.length) {
				if(checkIntersect(nextWalls[i].getView(), activeWall.getView())) {					
					let verticalDist = getVerticalDistance(nextWalls[i].getView(), activeWall.getView());

					if(target == null || (verticalDist <= bestVerticalDist)) {				
						let horizontalDist = getHorizontalDistance(nextWalls[i].getView(), activeWall.getView());

						if(target == null || horizontalDist < bestHorizontalDist) {
							target = nextWalls[i];
							bestVerticalDist = verticalDist;
							bestHorizontalDist = horizontalDist;
						}
					}
				}

				i++;
			}

			return target;
		}

		setup.on('onChildAdded', function(child) {
			if(activeWall == null)			
				changeActiveWall(child);
		});

		setup.extend({
			getActiveBrick: function() {
				return getActiveBrickFromWall(activeWall);
			},
			changeActiveBrick: function(brick) {
				if(!brick.instanceOf('wall-member'))
					throw new Error('Cannot activate brick: must be a wall member instance');

				let containerWall = brick.getWall();

				if(!this.hasChild(containerWall)) {
					console.log(containerWall)
					throw new Error('Cannot activate brick: wall container is not child of loaded ui');
				}

				if(containerWall !== activeWall)
					changeActiveWall(containerWall);

				changeActiveBrickOfWall(containerWall, brick);
			},
			moveToUpperWall: function() {
				if(activeWall == null)
					return;

				let nextWalls = this.getPrevAllOf(activeWall);
				let target = getClosestWall(nextWalls);

				if(target != null)
					changeActiveWall(target);
			},
			moveToLowerWall: function() {
				if(activeWall == null)
					return;

				let nextWalls = this.getNextAllOf(activeWall);
				let target = getClosestWall(nextWalls);

				if(target != null)
					changeActiveWall(target);
			},
			moveToRightWall: function() {
				changeActiveWall(
					this.getNextSiblingOf(activeWall)
				);
			},
			moveToLeftWall: function() {
				changeActiveWall(
					this.getPrevSiblingOf(activeWall)
				);
			},
			moveToParentBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					if(parentBrick != null && !parentBrick.instanceOf('wall'))
						changeActiveBrickOfWall(activeWall, parentBrick);
				}
			},
			moveToChildBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);

				if(currBrick != null && currBrick.instanceOf('nested')) {							
					let childBrick = currBrick.getFirstChild();

					if(childBrick != null)
						changeActiveBrickOfWall(activeWall, childBrick);
				}
			},
			moveToNextSiblingBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					while(!parentBrick.instanceOf('wall') && parentBrick.getNextSiblingOf(currBrick) == null) {
						currBrick = parentBrick;
						parentBrick = currBrick.getParent();
					}

					currBrick = parentBrick.getNextSiblingOf(currBrick);

					if(currBrick !== null)
						changeActiveBrickOfWall(activeWall, currBrick);
				}
			},
			moveToPrevSiblingBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					while(!parentBrick.instanceOf('wall') && parentBrick.getPrevSiblingOf(currBrick) == null) {
						currBrick = parentBrick;
						parentBrick = currBrick.getParent();
					}

					currBrick = parentBrick.getPrevSiblingOf(currBrick);

					if(currBrick !== null)
						changeActiveBrickOfWall(activeWall, currBrick);
				}
			},
			removeActiveBrick: function() {
				let currBrick = this.getActiveBrick();

				if(currBrick != null) {
					changeActiveBrickOfWall(
						activeWall,
						getClosestBrickOf(currBrick)
					);

					currBrick.dispose();
				}
			}
		});
	}
};

let loadedUI = null;

function getLoadedUI() {
	return loadedUI;
}

module.exports = {
	displayWalls: function(walls) {
		let meta = mw.import.newBrick({ module: mw.bricks.meta, childs: [] });
		meta.load(uiModule);
		meta.addChilds(walls);

		$('#metabrick-area').empty().focus();
		meta.getView().appendTo('#metabrick-area').focus();
		loadedUI = meta;
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

mw.actions.register(() => getLoadedUI(), [
	{	// Move up between walls
		ctrlKey: true,
		key: 38,
		action: function(target) {
			target.moveToUpperWall();
		}
	},
	{
		// Move down between walls
		ctrlKey: true,
		key: 40,
		action: function(target) {
			target.moveToLowerWall();
		}
	},
	{
		// Move right between walls
		ctrlKey: true,
		key: 39,
		action: function(target) {
			target.moveToRightWall();
		}
	},
	{
		// Move left between walls
		ctrlKey: true,
		key: 37,
		action: function(target) {
			target.moveToLeftWall();
		}
	},
	{
		// Move to parent (left) within wall
		key: 37,
		action: function(target) {
			target.moveToParentBrick();
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function(target) {
			target.moveToChildBrick();
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function(target) {
			target.moveToNextSiblingBrick();
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function(target) {
			target.moveToPrevSiblingBrick();
		}
	},
	{
		// Supr - remove brick
		key: 46,
		action: function(target) {
			target.removeActiveBrick();
		}
	}
]);