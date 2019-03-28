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

	if(brickConfig.childs && brickConfig.childs.length > 0) {
		for(let i in brickConfig.childs) {
			importBricks(brickConfig.childs[i], newBrick);
		}
	}

	if(parent != null)
		newBrick.setParent(parent);

	if(brickConfig.name)
		newBrick.setName(brickConfig.name);

	if(brickConfig.value)
		newBrick.setValue(brickConfig.value);

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