let eventHandler = require('./event-handler');

let brickModules = {
	'core.model.base': require('../brick_modules/model-base')['core.model.base'],
	'core.view.jq.base': require('../brick_modules/jquery-core')['core.view.jq.base'],
	'core.view.jq.generic': require('../brick_modules/jquery-core')['core.view.jq.generic'],
	'core.bricks.wall': require('../brick_modules/wall')['core.bricks.wall'],
	'core.bricks.literal': require('../brick_modules/literal')['core.bricks.literal'],
	'core.bricks.container': require('../brick_modules/container-brick')['core.bricks.container'],
	'core.bricks.function': require('../brick_modules/function')['core.bricks.function'],
	'core.bricks.meta': require('../brick_modules/metabrick')['core.bricks.meta'],
};

let brickTypes = {
	base: {
		use: [
			'core.model.base',
			'core.view.jq.base'
		]
	},
	container: {
		use: [ 'core.bricks.container' ]
	},
	meta: {
		extend: [ 'container' ],
		use: [ 'core.bricks.meta' ]
	},
	generic: {
		use: [ 'core.view.jq.generic' ]
	},
	wall: {
		extend: [ 'container', 'generic' ],
		use: [ 'core.bricks.wall' ]
	},
	literal: {
		extend: [ 'generic' ],
		use: [ 'core.bricks.literal' ]
	},
	function: {
		extend: [ 'container', 'generic' ],
		use: [ 'core.bricks.function' ]
	},
};

function loadModule(setup, config, moduleName) {
	if(!brickModules[moduleName])
		throw new Error(`Invalid brick module: '${moduleName}'`);

	brickModules[moduleName](setup, config);
}

function loadType(setup, type, config, loaded) {
	if(loaded.has(type))
		throw new Error(`Cyclic brick module dependency at type '${config.type}'`);

	if(!brickTypes[type])
		throw new Error(`Invalid brick type: '${type}'`);

	let typeConfig = brickTypes[type];

	if(typeConfig.extend) {
		for(let i = 0; i < typeConfig.extend.length; i++)
			loadType(setup, typeConfig.extend[i], config, loaded);
	}

	if(typeConfig.use) {
		for(let i = 0; i < typeConfig.use.length; i++)
			loadModule(setup, config, typeConfig.use[i]);
	}

	loaded.add(type);
}

module.exports = {
	getBrick: function(config, parentBrick) {
		if(!config)
			throw new Error('No config data was provided');

		if(!config.type)
			throw new Error(`No type was provided in brick configuration`);

		let brickEventsBuilder = eventHandler.builder();
		let extendHandlers = [];
		let configHandlers = [];		

		let setup = {
			registerEvents: function(events) {
				brickEventsBuilder.registerEvents(events);
			},
			on: function(eventName, eventHandler) {
				brickEventsBuilder.addHandler(eventName, eventHandler);
			},
			extend: function(extendHandler) {
				extendHandlers.push(extendHandler);
			},
			configure: function(configHandler) {
				configHandlers.push(configHandler);
			}			
		};

		let loaded = new Set();

		setup.extend(function(brick) {
			return {
				model: {
					instanceOf: function(type) {
						return loaded.has(type);
					},
					getTypes: function() {
						return Array.from(loaded);
					},
					mustBe: function(type) {
						if(!brick.model.instanceOf(type))
							throw new Error(`Brick type validation failed: '${type}'`);
					}
				}
			};
		});

		loadType(setup, 'base', config, loaded);
		loadType(setup, config.type, config, loaded);

		// Step 1 - Build and validate events
		let finalEvents = brickEventsBuilder.build();

		// Step 2 - Create brick instance
		let brickModel = {};
		let brickView = {};		

		let brick = {
			get events() {
				return finalEvents;
			},
			get model() {
				return brickModel;
			},
			get view() {
				return brickView;
			}
		}

		// Step 3 - Build brick API
		for(let i = 0; i < extendHandlers.length; i++) {
			let extendObj = extendHandlers[i](brick);

			if(extendObj.model)
				Object.assign(brickModel, extendObj.model);

			if(extendObj.view)
				Object.assign(brickView, extendObj.view);			
		}

		// Step 4 - Configure brick
		for(let i = 0; i < configHandlers.length; i++)
			configHandlers[i](brick);

		// Step 5 - Final settings
		brick.model.setParent(parentBrick);
		brick.model.setName(!config.name ? null : config.name);
		brick.model.setValue(!config.value ? null : config.value);

		return brick;
	}
};