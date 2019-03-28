let mw = require('./mindwalls.js');

function resetAPI(targetAPI, baseAPI) {
	for(let member in targetAPI)
		delete targetAPI[member];

	Object.assign(targetAPI, baseAPI);
	return targetAPI;
}

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

function createBrick() {
	let parent = null;
	let value = null;
	let name = null;

	let loaded = new Set();
	let brickEvents = mw.events.create();
	let targetAPI = {};

	let baseAPI = {
		dispose: function() {
			this.onDisposed();

			if(parent != null) {
				parent.onChildDisposed(this);
				parent.onChildSetModified(this);
			}
		},
		getParent: function() {
			return parent;
		},
		setParent: function(p) {
			parent = p;
			this.onParentSet();

			if(parent != null) {
				parent.onChildAdded(this);
				parent.onChildSetModified(this);
			}
		},
		getValue: function() {
			return value;
		},
		setValue: function(v) {
			value = v;
			this.onValueSet();

			if(parent != null) {
				parent.onChildValueSet(this);
				parent.onChildSetModified(this);
			}
		},
		getName: function() {
			return name;
		},
		setName: function(n) {
			name = n;
			this.onNameSet();

			if(parent != null) {
				parent.onChildNameSet(this);
				parent.onChildSetModified(this);
			}
		},
		instanceOf: function(type) {
			return loaded.has(type);
		},
		getTypes: function() {
			return Array.from(loaded);
		},
		mustBe: function(type) {
			if(!this.instanceOf(type))
				throw new Error(`Brick type validation failed: '${type}'`);
		}
	};

	baseAPI._reset = function() {
		resetAPI(targetAPI, baseAPI);
	};

	baseAPI._import = function(brickModule, config = {}) {
		let extendHandlers = [];
		let configHandlers = [];

		loadModule(brickModule, config, loaded, extendHandlers, configHandlers, brickEvents);

		// Attach brick API
		for(let i = 0; i < extendHandlers.length; i++)
			extendHandlers[i](targetAPI);

		// Configure brick
		for(let i = 0; i < configHandlers.length; i++)
			configHandlers[i](targetAPI);
	};

	return targetAPI;
}

module.exports = {
	createBrick
};