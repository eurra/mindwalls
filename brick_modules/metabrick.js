
module.exports = {
	'core.bricks.meta': function(setup) {
		let activeWall = null;
		//let activeBricksMap = new Map();

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

							if(activeWall == null)
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

		setup.on('changeActiveWall', function(meta) {
			let currActive = meta.model.getActiveWall();
			$('.activeWall').removeClass('activeWall');	

			if(currActive != null)
				currActive.view.getContainer().addClass('activeWall');
		});

		setup.configure(function(brick) {
			brick.view.getContainer().
				addClass('metabrick').
				attr('tabindex', 0);
		});
	}
};