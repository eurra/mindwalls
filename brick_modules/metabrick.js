
module.exports = {
	'core.bricks.meta': function(setup) {
		let walls = [];

		setup.extend(function(brick){
			return {
				model: {
					addWalls: function(toAdd) {
						for(let i = 0; i < toAdd.length; i++) {
							toAdd[i].model.mustBe('wall');

							walls.push(toAdd[i]);
							toAdd[i].model.setParent(brick);
						}
					}
				}
			};
		})

		setup.on('childAdded', function(brick, child) {
			brick.view.getContainer().append(child.view.getContainer());
		});

		setup.configure(function(brick) {
			brick.view.getContainer().
				addClass('metabrick').
				attr('tabindex', 0);
		});
	}
};