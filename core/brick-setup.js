let Brick = require('./brick-api');
let BrickUI = require('./brick-ui-api');

let brickConfigurators = {
	'wall': require('./bricks-wall'),
	'literal': require('./bricks-literal'),
	'function': require('./bricks-function')
};

module.exports = {
	getBrick: function(config, parentBrick) {
		if(config === undefined)
			return Brick.empty;

		let brickEventsBuilder = Brick.eventsBuilder();
		BrickUI.setDefaultEvents(brickEventsBuilder.addHandler);
		let brickSetupHandlers = [];
		let configurator = brickConfigurators[config.type];

		if(configurator) {
			setupHandler = {
				addSetup: function(setup) {
					brickSetupHandlers.push(setup);
				},
				addEvent: brickEventsBuilder.addHandler
			}

			configurator(setupHandler, config);
		}

		let brickUI = new BrickUI();

		let brick = new Brick(
			brickUI,
			brickEventsBuilder.build()
		);

		for(let i in brickSetupHandlers)
			brickSetupHandlers[i](brick);

		if(parentBrick !== null)
			brick.parent = parentBrick;
		else
			brick.parent = Brick.empty();

		if(config.name)
			brick.name = config.name;
		else
			brick.name = null;

		if(config.value)		
			brick.value = config.value;

		return brick;
	}
};