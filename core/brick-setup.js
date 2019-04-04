let mw = require('./mindwalls.js');

function resetAPI(targetAPI, baseAPI, baseEvents, loaded) {
	for(let member in targetAPI)
		delete targetAPI[member];

	Object.assign(targetAPI, baseAPI);

	for(let member in baseEvents)
		targetAPI[member] = baseEvents[member].clone();

	loaded.clear();
	targetAPI.setValue(null);

	return targetAPI;
}

function loadModule(brickModule, config, loaded, extendObjects, configHandlers, targetAPI) {
	if(loaded.has(brickModule.id))
		throw new Error(`Brick module already loaded: '${brickModule.id}'`);

	let setup = {
		import: function(importModule) {
			loadModule(importModule, config, loaded, extendObjects, configHandlers, targetAPI);
		},
		addEvents: function(events) {
			let toExtend = {};

			for(let i = 0; i < events.length; i++)
				toExtend[events[i]] = mw.events.create(targetAPI);

			this.extend(toExtend);
		},
		on: function(eventName, eventHandler) {
			this.configure(function(brick) {	
				brick[eventName].add(eventHandler);
			});
		},
		extend: function(extendObj) {
			extendObjects.push(extendObj);
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
	let view = $('<div>');

	let loaded = new Set();
	let targetAPI = {};

	let baseAPI = {
		dispose: function() {
			view.remove();
			this.onDisposed.call();			

			if(parent != null) {
				parent.onChildDisposed.call(this);
				parent.onChildSetModified.call(this);
			}
		},
		getParent: function() {
			return parent;
		},
		setParent: function(p) {
			parent = p;
			this.onParentSet.call();

			if(parent != null) {
				parent.onChildAdded.call(this);
				parent.onChildSetModified.call(this);
			}
		},
		getValue: function() {
			return value;
		},
		setValue: function(v) {
			value = v;
			this.onValueSet.call();

			if(parent != null) {
				parent.onChildValueSet.call(this);
				parent.onChildSetModified.call(this);
			}
		},
		getName: function() {
			return name;
		},
		setName: function(n) {
			name = n;
			this.onNameSet.call();

			if(parent != null) {
				parent.onChildNameSet.call(this);
				parent.onChildSetModified.call(this);
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
		},
		getView: function() {
			return view;
		}
	};

	let baseEvents = {
		onDisposed: mw.events.create(targetAPI),
		onChildDisposed: mw.events.create(targetAPI),
		onChildSetModified: mw.events.create(targetAPI),
		onParentSet: mw.events.create(targetAPI),
		onChildAdded: mw.events.create(targetAPI),
		onValueSet: mw.events.create(targetAPI),
		onChildValueSet: mw.events.create(targetAPI),
		onNameSet: mw.events.create(targetAPI),
		onChildNameSet: mw.events.create(targetAPI),
		onReset: mw.events.create(targetAPI)
	};

	baseAPI._reset = function() {
		resetAPI(targetAPI, baseAPI, baseEvents, loaded);
		view.empty();
		this.onReset.call();		
	};

	baseAPI._import = function(brickModule, config = {}) {
		let extendObjects = [];
		let configHandlers = [];

		loadModule(brickModule, config, loaded, extendObjects, configHandlers, targetAPI);

		// Extend brick
		for(let i = 0; i < extendObjects.length; i++) 
			Object.assign(targetAPI, extendObjects[i]);

		// Configure brick
		for(let i = 0; i < configHandlers.length; i++)
			configHandlers[i](targetAPI);

		this.setName(config.name ? config.name : null);
		this.setValue(config.value ? config.value : null);
	};

	return resetAPI(targetAPI, baseAPI, baseEvents, loaded);
}

module.exports = {
	createBrick
};