let Brick = require('./brick-api').Brick;
let BrickUI = require('./brick-ui').BrickUI;

let brickConfigurators = {
	'wall': require('./bricks-wall'),
	'literal': require('./bricks-literal'),
	'function': require('./bricks-function')
};

module.exports = {
	setup: function(config, parentBrick) {
		if(config === undefined)
			return BrickUI.emptyBrick;

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