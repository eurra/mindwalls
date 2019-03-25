let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'meta',
	loader: function(setup) {
		setup.import(mw.bricks.nested);

		let activeWall = null;
		let activeBricksMap = new Map();

		setup.registerEvents([
			'activeWallSet', 'activeBrickSet'
		]);

		function getActiveBrickFromWall(wall) {
			let brick = null;

			if(activeBricksMap.has(wall))
				brick = activeBricksMap.get(wall);
			else {
				brick = wall.model.getFirstChild();

				if(brick != null)
					activeBricksMap.set(brick, wall);
			}
			
			return brick;
		}

		function switchToActiveBrickFromWall(meta, wall) {
			let brick = getActiveBrickFromWall(wall);
			meta.events.activeBrickSet(brick);
		}

		function changeActiveBrickOfWall(meta, wall, brick) {
			if(brick != null && wall != null) {
				activeBricksMap.set(wall, brick);
				switchToActiveBrickFromWall(meta, wall);
			}
		}

		function changeActiveWall(meta, wall) {
			if(wall != null) {
				wall.model.mustBe('wall');
				activeWall = wall;				
				switchToActiveBrickFromWall(meta, activeWall);
				meta.events.activeWallSet(activeWall);
			}
		}

		setup.extend(function(meta){
			return {
				model: {
					addWalls: function(toAdd) {
						let wallToActivate = null;

						for(let i = 0; i < toAdd.length; i++) {
							toAdd[i].model.mustBe('wall');
							toAdd[i].model.setParent(meta);

							if(wallToActivate == null)
								wallToActivate = toAdd[i];
						}

						if(wallToActivate != null)
							meta.model.setActiveWall(wallToActivate);
					},
					getActiveWall: function() {
						return activeWall;
					},
					setActiveWall: function(wall) {						
						changeActiveWall(meta, wall);
					},
					getActiveBrick: function() {
						let activeWall = meta.model.getActiveWall();

						if(activeWall != null)
							return getActiveBrickFromWall(activeWall);

						return null;
					},
					moveToNextWall: function() {
						if(activeWall == null)
							return;

						meta.model.setActiveWall(
							meta.model.getNextSiblingOf(activeWall)
						);
					},
					moveToPrevWall: function() {
						if(activeWall == null)
							return;

						meta.model.setActiveWall(
							meta.model.getPrevSiblingOf(activeWall)
						);
					},
					moveToChildBrick: function() {
						if(activeWall == null)
							return;

						let currBrick = getActiveBrickFromWall(activeWall);

						if(currBrick != null && currBrick.model.instanceOf('nested')) {							
							let childBrick = currBrick.model.getFirstChild();

							if(childBrick != null)
								changeActiveBrickOfWall(meta, activeWall, childBrick);
						}
					},
					moveToParentBrick: function() {
						if(activeWall == null)
							return;

						let currBrick = getActiveBrickFromWall(activeWall);						

						if(currBrick != null) {
							let parentBrick = currBrick.model.getParent();

							if(parentBrick != null && !parentBrick.model.instanceOf('wall'))
								changeActiveBrickOfWall(meta, activeWall, parentBrick);
						}
					},
					moveToNextSiblingBrick: function() {
						if(activeWall == null)
							return;

						let currBrick = getActiveBrickFromWall(activeWall);						

						if(currBrick != null) {
							let parentBrick = currBrick.model.getParent();
							currBrick = parentBrick.model.getNextSiblingOf(currBrick);

							if(currBrick != null) {								
								changeActiveBrickOfWall(meta, activeWall, currBrick);
							}
							else {
								while(!parentBrick.model.instanceOf('wall') && parentBrick.model.getNextSiblingOf(currBrick) == null) {
									currBrick = parentBrick;
									parentBrick = currBrick.model.getParent();
								}

								currBrick = parentBrick.model.getNextSiblingOf(currBrick);

								if(currBrick != null) {
									while(currBrick.model.instanceOf('nested'))
										currBrick = currBrick.model.getFirstChild();

									changeActiveBrickOfWall(meta, activeWall, currBrick);
								}
							}
						}
					},
					moveToPrevSiblingBrick: function() {
						if(activeWall == null)
							return;

						let currBrick = getActiveBrickFromWall(activeWall);						

						if(currBrick != null) {
							let parentBrick = currBrick.model.getParent();
							currBrick = parentBrick.model.getPrevSiblingOf(currBrick);

							if(currBrick != null) {
								changeActiveBrickOfWall(meta, activeWall, currBrick);
							}
							else {
								while(!parentBrick.model.instanceOf('wall') && parentBrick.model.getPrevSiblingOf(currBrick) == null) {
									currBrick = parentBrick;
									parentBrick = currBrick.model.getParent();
								}

								currBrick = parentBrick.model.getPrevSiblingOf(currBrick);

								if(currBrick != null) {
									while(currBrick.model.instanceOf('nested'))
										currBrick = currBrick.model.getLastChild();

									changeActiveBrickOfWall(meta, activeWall, currBrick);
								}
							}
						}
					},
				}
			};
		})

		setup.on('childAdded', function(brick, childBrick) {			
			brick.view.getContainer().append(childBrick.view.getContainer());
		});

		setup.on('activeWallSet', function(wall) {
			$('.activeWall').removeClass('activeWall');

			if(wall != null)
				wall.view.getContainer().addClass('activeWall');
		});

		setup.on('activeBrickSet', function(brick) {
			$('.activeBrick').removeClass('activeBrick');

			if(brick != null)
				brick.view.getFocusElem().addClass('activeBrick');
		});

		setup.configure(function(brick) {
			brick.view.getContainer().
				addClass('metabrick').
				attr('tabindex', 0);
		});
	}
};