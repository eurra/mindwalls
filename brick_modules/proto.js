//let mw = require('./mindwalls.js');
/*let EventHandler = mw.events;

function initAPI(brickAPI, protoAPI, loaded) {
	for(let member in brickAPI)
		delete brickAPI[member];

	for(let member in protoAPI) {
		if(protoAPI[member] instanceof EventHandler)
			brickAPI[member] = protoAPI[member].clone();
		else
			brickAPI[member] = protoAPI[member];
	}

	loaded.clear();
	brickAPI.setValue(null);

	return brickAPI;
}

function loadModule(brickModule, config, loaded, extendObjects, configHandlers, brickAPI) {
	if(loaded.has(brickModule.id))
		throw new Error(`Brick module already loaded: '${brickModule.id}'`);

	let setup = {
		import: function(importModule) {
			loadModule(importModule, config, loaded, extendObjects, configHandlers, brickAPI);
		},
		addEvents: function(events) {
			let toExtend = {};

			for(let i = 0; i < events.length; i++)
				toExtend[events[i]] = mw.events.create(brickAPI);

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

function importModule(brickModule, loaded, target, brickAPI, config = {}) {
	let extendObjects = [];
	let configHandlers = [];

	loadModule(brickModule, config, loaded, extendObjects, configHandlers, brickAPI);

	// Extend brick
	for(let i = 0; i < extendObjects.length; i++) 
		Object.assign(target, extendObjects[i]);

	// Configure brick
	for(let i = 0; i < configHandlers.length; i++)
		configHandlers[i](target);

	this.setName(config.name ? config.name : null);
	this.setValue(config.value ? config.value : null);
}*/

let baseModule = {
	id: 'base',
	loader: function(setup) {
		let value = null;
		let name = null;
		let parent = null;
		let view = $('<div>');

		setup.addEvents([
			'onParentSet', 'onDisposed',
			'onValueSet', 'onNameSet', 
		]);

		setup.extend({
			getParent: function() {
				return parent;
			},
			setParent: function(parentBrick) {
				if(parentBrick != null)
					parentBrick.mustBe('nested');

				parent = parentBrick;
				this.onParentSet();
			},
			dispose: function() {
				view.remove();
				this.onDisposed();			

				if(parent != null) {
					parent.onChildDisposed(this);
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
			getView: function() {
				return view;
			}
		});
	}
}

let nestedModule = {
	id: 'nested',
	loader: function(setup) {
		let firstNode = null;
		let lastNode = null;
		let nodesMap = new Map();

		setup.addEvents([ 
			'onChildSetModified', 
			'onChildAdded', 'onChildDisposed', 'onChildRemoved',
			'onChildValueSet', 'onChildNameSet'
		]);

		function handleChildAdded(brick, childNode) {
			brick.onChildAdded(
				childNode.brick, 
				childNode.prev ? childNode.prev.brick : null,
				childNode.next ? childNode.next.brick : null
			);

			childNode.brick.setParent(brick);
		}

		function createNodeFor(child) {
			let node = {
				next: null,
				prev: null,
				brick: child
			};

			nodesMap.set(child, node);
			return node;
		}

		setup.on('onChildDisposed', function(childBrick) {
			this.removeChild(childBrick);
		});

		setup.extend({
			removeChild: function(childBrick) {
				let nodeToRem = nodesMap.get(childBrick);

				if(firstNode === nodeToRem && lastNode === nodeToRem) {
					firstNode = null;
					lastNode = null;
				}
				else if(firstNode === nodeToRem) {
					nodeToRem.next.prev = null;
					firstNode = nodeToRem.next;
				}
				else if(lastNode === nodeToRem) {
					nodeToRem.prev.next = null;
					lastNode = nodeToRem.prev;
				}
				else {
					nodeToRem.next.prev = nodeToRem.prev;
					nodeToRem.prev.next = nodeToRem.next;
				}

				nodesMap.delete(childBrick);
			},
			addChild: function(childBrick) {
				let node = createNodeFor(childBrick);

				if(firstNode == null) {
					firstNode = node;
					lastNode = node;
				}
				else {
					lastNode.next = node;
					node.prev = lastNode;
					lastNode = node;
				}

				handleChildAdded(this, node);
			},
			addChildFirst: function(childBrick) {
				let node = createNodeFor(childBrick);

				if(firstNode == null) {
					firstNode = node;
					lastNode = node;
				}
				else {
					firstNode.prev = node;
					node.next = firstNode;
					firstNode = node;
				}

				handleChildAdded(this, node);
			},
			addChildAfter: function(childBrick, afterBrick) {
				let nodeAfter = nodesMap.get(afterBrick);

				if(nodeAfter == lastNode) {
					this.addChild(childBrick);
				}
				else {
					let newNode = createNodeFor(childBrick);

					newNode.next = nodeAfter.next;
					newNode.prev = nodeAfter;
					newNode.next.prev = newNode;
					nodeAfter.next = newNode;

					handleChildAdded(this, newNode);
				}
			},
			addChildBefore: function(childBrick, beforeBrick) {
				let nodeBefore = nodesMap.get(beforeBrick);

				if(nodeBefore == firstNode)
					this.addChildFirst(childBrick);
				else
					this.addChildAfter(childBrick, nodeBefore.prev);
			},
			getChilds: function() {
				let res = [];
				let currNode = firstNode;

				while(currNode != null) {
					res.push(currNode.brick);
					currNode = currNode.next;
				}

				return res;
			},
			getFirstChild: function() {
				if(firstNode == null)
					return null;

				return firstNode.brick;
			},
			getLastChild: function() {
				if(lastNode == null)
					return null;

				return lastNode.brick;
			},
			getNextSiblingOf: function(childBrick) {
				let node = nodesMap.get(childBrick);

				if(node == null || node.next == null)
					return null;

				return node.next.brick;
			},
			getNextAllOf: function(childBrick) {
				let res = [];
				let node = nodesMap.get(childBrick);

				if(node == null || node.next == null)
					return res;

				let curr = node.next;

				while(curr != null) {
					res.push(curr.brick);
					curr = curr.next;
				}

				return res;
			},
			getPrevSiblingOf: function(childBrick) {
				let node = nodesMap.get(childBrick);

				if(node == null || node.prev == null)
					return null;

				return node.prev.brick;
			},
			getPrevAllOf: function(childBrick) {
				let res = [];
				let node = nodesMap.get(childBrick);

				if(node == null || node.prev == null)
					return res;

				let curr = node.prev;

				while(curr != null) {
					res.push(curr.brick);
					curr = curr.prev;
				}

				return res;
			},
			getValidValues: function() {
				let res = [];
				let currNode = firstNode;

				while(currNode != null) {
					if(currNode.brick.getValue())
						res.push(currNode.brick.getValue());

					currNode = currNode.next;
				}

				return res;
			}
		});
	}
};

/*function createBrick(terminal = false) {	
	let value = null;
	let name = null;
	let parent = null;
	let view = $('<div>');

	let loaded = new Set();
	let brickAPI = {};

	let protoAPI = {
		getParent: function() {
			return parent;
		},
		setParent: function(parentBrick) {
			parentBrick.mustBe('nested');
			parent = parentBrick;

			this.onParentSet.call();
		},
		dispose: function() {
			view.remove();
			this.onDisposed.call();			

			if(parent != null) {
				parent.onChildDisposed.call(this);
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
		},
		_reset: function() {
			initAPI(brickAPI, protoAPI, loaded);
			view.empty();
			this.onReset.call();		
		},
		_import: function(brickModule, config) {
			importModule(brickModule, loaded, brickAPI, brickAPI, config);
		},
		onParentSet: new EventHandler(brickAPI),
		onDisposed: new EventHandler(brickAPI),
		onValueSet: new EventHandler(brickAPI),
		onNameSet: new EventHandler(brickAPI),
		onReset: new EventHandler(brickAPI)
	};

	if(!terminal)
		importModule(nestedModule, loaded, protoAPI, brickAPI);

	return initAPI(brickAPI, protoAPI, loaded);
}*/

let apiMaker = require('../core/api-maker.js');

function createBrick(terminal = false) {
	let newBrick = apiMaker();
	newBrick.load(baseModule);

	if(!terminal)
		newBrick.load(nestedModule);

	newBrick.save();
	return newBrick;
}

module.exports = {
	create: createBrick
};