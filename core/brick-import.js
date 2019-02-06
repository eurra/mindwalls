let Wall = require('./wall-api');
let brickSetup = require('./brick-setup');

function importBricks(brickConfig, parent) {
	let newBrick = brickSetup.getBrick(brickConfig, parent);

	if(brickConfig.params && brickConfig.params.length > 0) {
		for(let i in brickConfig.params) {
			importBricks(brickConfig.params[i], newBrick);
		}
	}

	return newBrick;
}

function importWalls(wallsData) {
	let walls = [];

	for(let i in wallsData) {
		let wallData = wallsData[i];		
		let wall = Wall.emptyWall;

		if(wallData.mainBrick) {
			wall = brickSetup.getWall().setMainBrick(
				importBricks(wallData.mainBrick, null)
			);
		}

		walls.push(wall);
	}

	return walls;
}

module.exports = {	
	from: importWalls	
};