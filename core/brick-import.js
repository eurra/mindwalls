let mw = require('./mindwalls.js');

function extractSimpleConfig(cfg) {
	let newCfg = Object.assign({}, cfg);
	delete newCfg.module;
	delete newCfg.childs;

	return newCfg;
}

function importBrick(brickConfig, parent = null) {
	let brick = mw.bricks.proto.create(brickConfig.childs ? false : true);
	brick.load(brickConfig.module, extractSimpleConfig(brickConfig));

	if(parent != null)
		parent.addChild(brick);	

	if(brickConfig.childs && brickConfig.childs.length > 0) {
		for(let i in brickConfig.childs) {
			importBrick(brickConfig.childs[i], brick);
		}
	}

	return brick;
}

function importWalls(wallsData, meta = null) {
	let walls = [];

	for(let i in wallsData) {
		let wallConfig = wallsData[i];		
		let wall = importBrick(wallConfig, meta);
		walls.push(wall);
	}

	return walls;
}

module.exports = {	
	walls: importWalls,
	brick: importBrick,
	newBrick: function(brickConfig) {
		return importBrick(brickConfig);
	}
};