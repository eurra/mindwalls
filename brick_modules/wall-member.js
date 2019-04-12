module.exports = {
	id: 'wall-member',
	loader: function(setup) {
		let wall = null;

		setup.addEvents([ 'onWallSet' ]);

		setup.extend({
			setWall: function(newWall) {
				wall = newWall;

				if(this.instanceOf('nested')) {
					let childs = this.getChilds();

					for(let i = 0; i < childs.length; i++) {
						if(childs[i].instanceOf('wall-member'))
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