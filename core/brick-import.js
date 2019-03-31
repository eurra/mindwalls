let mw = require('./mindwalls.js');

function extractSimpleConfig(cfg) {
	let newCfg = Object.assign({}, cfg);
	delete newCfg.module;
	delete newCfg.childs;

	return newCfg;
}

function importBricks(brickConfig, parent = null) {
	let newBrick = mw.setup.createBrick();
	newBrick._import(brickConfig.module, extractSimpleConfig(brickConfig));

	newBrick.setParent(parent);
	newBrick.setName(brickConfig.name ? brickConfig.name : null);
	newBrick.setValue(brickConfig.value ? brickConfig.value : null);

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