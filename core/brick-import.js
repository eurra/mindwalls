let mw = require('./mindwalls.js');

function extractSimpleConfig(cfg) {
	let newCfg = Object.assign({}, cfg);
	delete newCfg.module;
	delete newCfg.childs;

	return newCfg;
}

function importBricks(brickConfig, parent = null) {
	let newBrick = mw.setup.getBrick(brickConfig.module, extractSimpleConfig(brickConfig), parent);

	if(brickConfig.childs && brickConfig.childs.length > 0) {
		for(let i in brickConfig.childs) {
			importBricks(brickConfig.childs[i], newBrick);
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
	from: importWalls,
	fromConfig: importBricks
};