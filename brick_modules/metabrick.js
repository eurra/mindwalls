
module.exports = {
	'core.bricks.meta': function(setup) {
		let activeWall = null;
		let activeBricksMap = new Map();

		function getActiveBrickFromWall(wall) {
			let brick = null;

			if(activeBricksMap.has(wall))
				brick = activeBricksMap.get(wall);
			else
				brick = wall.model.getFirstChild();

			return brick;
		}

		setup.registerEvents([
			'activeWallChanged'
		]);

		setup.extend(function(brick){
			return {
				model: {
					getActiveWall: function() {
						return activeWall;
					},
					addWalls: function(toAdd) {
						let wallToActivate = null;

						for(let i = 0; i < toAdd.length; i++) {
							toAdd[i].model.mustBe('wall');
							toAdd[i].model.setParent(brick);

							if(wallToActivate == null)
								wallToActivate = toAdd[i];
						}

						if(wallToActivate != null) {
							activeWall = wallToActivate;
							brick.events.activeWallChanged(brick);
						}
					}
				}
			};
		})

		setup.on('childAdded', function(brick, childBrick) {			
			brick.view.getContainer().append(childBrick.view.getContainer());
		});

		setup.on('activeWallChanged', function(meta) {
			let currActive = meta.model.getActiveWall();
			$('.activeWall').removeClass('activeWall');	

			if(currActive != null)
				currActive.view.getContainer().addClass('activeWall');

			let activeBrick = getActiveBrickFromWall(currActive);

			if(activeBrick != null) {
				$('.activeBrick').removeClass('activeBrick');
				activeBrick.view.getFocusElem().addClass('activeBrick');
			}

		});		

		setup.configure(function(brick) {
			brick.view.getContainer().
				addClass('metabrick').
				attr('tabindex', 0);
		});
	}
};