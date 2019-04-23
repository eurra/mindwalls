module.exports = {
	id: 'wall-member',
	loader: function(setup) {
		let wall = null;

		setup.addEvents([ 'onWallSet' ]);

		setup.require('nested', () => {
			setup.on('onChildAdded', function(added) {
				added.mustBe('wall-member');
				added.setWall(this.getWall());
			});
		});

		setup.extend({
			setWall: function(newWall) {
				wall = newWall;

				if(this.instanceOf('nested')) {
					let childs = this.getChilds();

					for(let i = 0; i < childs.length; i++) {
						if(childs[i].instanceOf('wall-member') && childs[i].getWall() !== wall)
							childs[i].setWall(wall);
					}
				}

				this.onWallSet(wall);
			},
			getWall: function() {
				return wall;
			}
		});
	}
};