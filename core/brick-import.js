let mw = require('./mindwalls.js');

function extractSimpleConfig(cfg) {
	let newCfg = Object.assign({}, cfg);
	delete newCfg.module;
	delete newCfg.childs;

	return newCfg;
}

function importBrick(brick, brickConfig, parent = null) {
	brick._import(brickConfig.module, extractSimpleConfig(brickConfig));
	brick.setParent(parent);	

	if(brickConfig.childs && brickConfig.childs.length > 0) {
		for(let i in brickConfig.childs) {
			importBrick(mw.bricks.proto.create(), brickConfig.childs[i], brick);
		}
	}

	return brick;
}

function importWalls(wallsData, meta = null) {
	let walls = [];

	for(let i in wallsData) {
		let wallConfig = wallsData[i];		
		let wall = importBrick(mw.bricks.proto.create(), wallConfig, meta);
		walls.push(wall);
	}

	return walls;
}

module.exports = {	
	walls: importWalls,
	brick: importBrick,
	newBrick: function(brickConfig) {
		return importBrick(mw.bricks.proto.create(), brickConfig);
	}
};