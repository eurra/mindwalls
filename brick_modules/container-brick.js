
module.exports = {
	'core.bricks.container': function(setup) {
		let childsArr = [];

		setup.on('childAdded', function(brick, childBrick) {
			childsArr.push(childBrick);
		});

		setup.on('childDisposed', function(brick, childBrick) {
			let found = false;

			for(let i = 0; i < childsArr.length && !found; i++) {
				if(childsArr[i] === childBrick) {
					childsArr.splice(i, 1);
					found = true;
				}
			}
		});

		setup.extend(function() {
			return {
				model: {
					getChilds: function() {
						return childsArr.slice(0, childsArr.length);
					},
					getFirstChild: function() {
						if(childsArr.length == 0)
							return null;

						return childsArr[0];
					},
					getLastChild: function() {
						if(childsArr.length == 0)
							return null;

						return childsArr[childsArr.length - 1];
					},
					getNextSiblingOf: function(childBrick) {
						let index = -1;

						for(let i = 0 ; i < childsArr.length && index == -1; i++) {
							if(childsArr[i] === childBrick)
								index = i;
						}

						if(index == -1 || index == childsArr.length - 1)
							return null;

						return childsArr[index + 1];
					},
					getPrevSiblingOf: function(childBrick) {
						let index = -1;

						for(let i = 0 ; i < childsArr.length && index == -1; i++) {
							if(childsArr[i] === childBrick)
								index = i;
						}

						if(index == -1 || index == 0)
							return null;

						return childsArr[index - 1];
					},
					getValidValues: function() {
						let res = [];

						for(let i = 0; i < childsArr.length; i++) {
							if(childsArr[i].model.getValue())
								res.push(childsArr[i].model.getValue());
						}

						return res;
					}
				}
			}	
		});		
	}
};