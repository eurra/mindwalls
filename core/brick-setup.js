let Brick = require('./brick-api');
let BrickUI = require('./brick-ui-api');

let brickConfigurators = {
	'wall': require('./bricks-wall'),
	'literal': require('./bricks-literal'),
	'function': require('./bricks-function')
};

module.exports = {
	setup: function(config, parentBrick) {
		if(config === undefined)
			return Brick.empty;

		let brickEventBuilder = Brick.eventHandlerBuilder();
		let brickUIEventBuilder = BrickUI.eventHandlerBuilder();

		let configurator = brickConfigurators[config.type]

		if(configurator) {
			if(configurator.model && configurator.model.events)
				configurator.model.events(brickEventBuilder.addHandler);

			if(configurator.ui && configurator.ui.events)
				configurator.ui.events(brickUIEventBuilder.addHandler);
		}

		let brick = null;
		let brickUI = new BrickUI(
			() => brick,
			brickUIEventBuilder.build()
		);

		brick = new Brick(
			brickUI,
			brickEventBuilder.build()
		);
		
		if(configurator) {
			if(configurator.model && configurator.model.setup)
				configurator.model.setup(brick);

			if(configurator.ui && configurator.ui.setup)
				configurator.ui.setup(brickUI);
		}

		if(parentBrick !== null)
			brick.parent = parentBrick;
		else
			brick.setParent(Brick.empty);

		if(config.name)
			brick.name = config.name;
		else
			brick.name = null;

		if(config.value)		
			brick.value = config.value;

		return brick;
	}
};