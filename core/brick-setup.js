let Brick = require('./brick-api');
let BrickUI = require('./base-brick-ui');
let Wall = require('./wall-api');
let WallUI = require('./base-wall-ui');

let brickDecorators = {
	'literal': require('./bricks-literal'),
	'function': require('./bricks-function')
};

module.exports = {
	getWall: function() {
		return new Wall(new WallUI());
	},
	getBrick: function(config, parentBrick) {
		if(config === undefined)
			return Brick.emptyBrick;

		let newBrick = new Brick(new BrickUI());

		if(brickDecorators[config.type]) {
			if(brickDecorators[config.type].ui)
				brickDecorators[config.type].ui(newBrick.getUI(), config);

			if(brickDecorators[config.type].model)
				brickDecorators[config.type].model(newBrick, config);
		}

		if(parentBrick !== null)
			newBrick.setParent(parentBrick);
		else
			newBrick.setParent(BrickUI.emptyBrick);

		if(config.name)
			newBrick.setName(config.name);
		else
			newBrick.setName(null);

		if(config.value)		
			newBrick.setValue(config.value);

		return newBrick;
	}
};