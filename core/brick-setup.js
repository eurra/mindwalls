let Brick = require('./brick-api');
let BrickUI = require('./brick-ui-api');

let brickConfigurators = {
	'wall': require('./bricks-wall'),
	'literal': require('./bricks-literal'),
	'function': require('./bricks-function')
};

let brickModules = {
};

let brickAssemblings = {
	base: {
		uses: [
			'core.model.base',
			'core.view.jq.base'
		]
	},
	meta: {
		extend: 'base',
		uses: []
	},
	generic: {
		extend: 'base',
		uses: [
			'core.view.jq.generic'
		]
	}
};

module.exports = {
	getBrick: function(config, parentBrick) {
		if(config === undefined)
			throw new Error('No config data was provided');

		let brickEventsBuilder = Brick.eventsBuilder();
		BrickUI.setDefaultEvents(brickEventsBuilder.addHandler);

		let configHandlers = [];
		let extendHandlers = [];

		let setup = {
			registerEvents: function(events) {

			},
			on: function(eventName, eventHandler) {
				brickEventsBuilder.addHandler(eventName, eventHandler);
			},
			configure: function(configHandler) {
				configHandlers.push(configHandler);
			},
			extend: function(extendHandler) {
				extendHandlers.push(extendHandler);
			}
		};

		require('./bricks-model-base')(setup);
		require('./bricks-jq-base')(setup);



		if(config.type && brickConfigurators[config.type]) {
			let setupHandler = {
				addSetup: function(setup) {
					brickSetupHandlers.push(setup);
				},
				addEvent: brickEventsBuilder.addHandler,
				addAPI: function(api) {
					customAPI = Object.assign(customAPI, api);
				}
			}

			brickConfigurators[config.type](setupHandler, config);

			customAPI = Object.assign(customAPI, {
				brickType: function() {
					return config.type ? config.type : 'nonset';
				}
			});
		}

		let brickUI = new BrickUI();

		let brick = new Brick(
			brickUI,
			brickEventsBuilder.build(),
			customAPI
		);

		brickUI.init(brick);

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