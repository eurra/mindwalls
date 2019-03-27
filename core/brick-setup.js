let mw = require('./mindwalls.js');

function loadModule(brickModule, config, loaded, extendHandlers, configHandlers, brickEvents) {
	if(loaded.has(brickModule.id))
		throw new Error(`Brick module already loaded: '${brickModule.id}'`);

	let setup = {
		import: function(importModule) {
			loadModule(importModule, config, loaded, extendHandlers, configHandlers, brickEvents);
		},
		addEvents: function(events) {
			brickEvents.addEvents(brickModule.id, events);
		},
		on: function(eventName, eventHandler) {
			brickEvents.addHandler(eventName, eventHandler);
		},
		extend: function(extendHandler) {
			extendHandlers.push(extendHandler);
		},
		configure: function(configHandler) {
			configHandlers.push(configHandler);
		}			
	};

	brickModule.loader(setup, config);
	loaded.add(brickModule.id);
}

module.exports = {
	createBrick: function() {			
		let loaded = new Set();

		let brickModel = {
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
		};

		let brickEvents = ms.events.create();
		let brickView = {};

		let brick = {
			get events() {
				return brickEvents.target;
			},
			get model() {
				return brickModel;
			},
			get view() {
				return brickView;
			},
			assemble: function(brickModule, config = {}) {
				if(!brickModule.id)
					throw new Error('No id was provided for brick module.');

				let extendHandlers = [];
				let configHandlers = [];

				loadModule(brickModule, config, loaded, extendHandlers, configHandlers, brickEvents);

				// Attach brick API
				for(let i = 0; i < extendHandlers.length; i++) {
					let extendObj = extendHandlers[i](brick);

					if(extendObj.model)
						Object.assign(brickModel, extendObj.model);

					if(extendObj.view)
						Object.assign(brickView, extendObj.view);			
				}

				// Configure brick
				for(let i = 0; i < configHandlers.length; i++)
					configHandlers[i](brick);
			}
		};

		brick.assemble(mw.bricks.base);
		return brick;
	},
	loadBrickModule: function(brick, toLoadModule, config, parentBrick = null) {
		if(!config)
			throw new Error('No config data was provided');

		let brickEventsBuilder = mw.events.builder();
		let extendHandlers = [];
		let configHandlers = [];
		let loaded = new Set();

		let setup = {
			import: function(brickModule) {
				loadModule(brickModule, this, config, loaded);
			},
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

		
		loadModule(toLoadModule, setup, config, loaded);

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