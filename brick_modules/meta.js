//let mw = require('../core/mindwalls.js');

/*mw.actions.register([
	{
		// Insert a new brick after
		key: 13,
		action: function() {
			let activeBrick = mw.generalUI.getMeta().model.getActiveBrick();

			if(activeBrick != null && activeBrick.model.instanceOf('literal')) {
				mw.generalUI.showInputDialog({
					title: 'Set literal value...',
					placeholder: 'Enter a number, a string, etc...',
					relativeTo: activeBrick.view.getContainer(),
					handle: function(textVal) {
						if(!isNaN(textVal))
							textVal = Number(textVal);

						activeBrick.model.setValue(textVal);
					}
				});
			}
		}
	}
]);*/

module.exports = {
	id: 'meta',
	loader: function(setup) {
		/*let activeWall = null;
		let activeBricksMap = new Map();				

		setup.addEvents([
			'onActiveWallSet', 'onActiveBrickSet'
		]);

		setup.extend({
			addWalls: function(toAdd) {
				let wallToActivate = null;

				for(let i = 0; i < toAdd.length; i++) {
					toAdd[i].mustBe('wall');
					this.addChild(toAdd[i]);
					//toAdd[i].setParent(this);

					if(wallToActivate == null)
						wallToActivate = toAdd[i];
				}

				if(wallToActivate != null)
					this.setActiveWall(wallToActivate);
			},
			getActiveWall: function() {
				return activeWall;
			},
			setActiveWall: function(wall) {						
				changeActiveWall(this, wall);
			},
			getActiveBrick: function() {
				let activeWall = this.getActiveWall();

				if(activeWall != null)
					return getActiveBrickFromWall(activeWall);

				return null;
			},
			moveToNextWall: function() {
				if(activeWall == null)
					return;

				this.setActiveWall(
					this.getNextSiblingOf(activeWall)
				);
			},
			moveToPrevWall: function() {
				if(activeWall == null)
					return;

				this.setActiveWall(
					this.getPrevSiblingOf(activeWall)
				);
			},
			moveToChildBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);

				if(currBrick != null && currBrick.instanceOf('nested')) {							
					let childBrick = currBrick.getFirstChild();

					if(childBrick != null)
						changeActiveBrickOfWall(this, activeWall, childBrick);
				}
			},
			moveToParentBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					if(parentBrick != null && !parentBrick.instanceOf('wall'))
						changeActiveBrickOfWall(this, activeWall, parentBrick);
				}
			},
			moveToNextSiblingBrick: function() {
				if(activeWall == null)
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

							changeActiveBrickOfWall(this, activeWall, currBrick);
						}
					}
				}
			},
			moveToPrevSiblingBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();
					currBrick = parentBrick.getPrevSiblingOf(currBrick);

					if(currBrick != null) {
						changeActiveBrickOfWall(this, activeWall, currBrick);
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

							changeActiveBrickOfWall(this, activeWall, currBrick);
						}
					}
				}
			},
			moveToClosestBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

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
		});

		setup.on('onChildAdded', function(childBrick) {
			this.getView().append(childBrick.getView());
		});

		setup.on('onActiveWallSet', function(wall) {
			$('.activeWall').removeClass('activeWall');

			if(wall != null)
				wall.getContent().addClass('activeWall');
		});

		setup.on('onActiveBrickSet', function(brick) {
			$('.activeBrick').removeClass('activeBrick');

			if(brick != null)
				brick.getView().addClass('activeBrick');
		});*/

		setup.configure(function(brick) {
			brick.getView().
				css('height', '100%').
				//attr('tabindex', 0).
				append(
					brick.getContent().
						css('height', '100%').
						append(
							brick.getChildrenContainer().
								addClass('metabrick')
						)
				);
		});
	}
};