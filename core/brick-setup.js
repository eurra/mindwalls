let eventHandler = require('./event-handler');

let brickModules = {
	'core.model.base': require('../brick_modules/model-base')['core.model.base'],
	'core.view.jq.base': require('../brick_modules/jquery-core')['core.view.jq.base'],
	'core.view.jq.generic': require('../brick_modules/jquery-core')['core.view.jq.generic'],
};

let brickTypes = {
	base: {
		use: [
			'core.model.base',
			'core.view.jq.base'
		]
	},
	meta: {
		use: []
	},
	generic: {
		use: [
			'core.view.jq.generic'
		]
	}
};

function loadModule(setup, moduleName) {
	if(!brickModules[moduleName])
		throw new Error(`Invalid brick module: '${moduleName}'`);

	brickModules[moduleName](setup);
}

function loadType(setup, type, loaded) {
	if(loaded.has(type))
		throw new Error(`Cyclic brick module dependency at type '${type}'`);

	if(!brickTypes[type])
		throw new Error(`Invalid brick type: '${type}'`);

	let typeConfig = brickTypes[type];

	if(typeConfig.extend)
		loadType(setup, typeConfig.extend, loaded);

	if(typeConfig.use) {
		for(let i = 0; i < typeConfig.use.length; i++)
			loadModule(setup, typeConfig.use[i], loaded);
	}

	loaded.add(type);
}

module.exports = {
	getBrick: function(config, parentBrick) {
		if(!config)
			throw new Error('No config data was provided');

		if(!config.type) {
			console.log(config);
			throw new Error(`No type was provided in brick configuration`);
		}

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
					mustBe: function(type) {
						if(!brick.model.instanceOf(type))
							throw new Error(`Brick type validation failed: '${type}'`);
					}
				}
			};
		});

		loadType(setup, 'base', loaded);
		loadType(setup, config.type, loaded);

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