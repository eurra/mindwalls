let Brick = require('./brick-api');
let brickSetup = require('./brick-setup');

function importBricks(brickConfig, parent = null) {
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
		let wallConfig = wallsData[i];		
		let wall = importBricks(wallConfig);
		walls.push(wall);
	}

	return walls;
}

module.exports = {	
	from: importWalls	
};