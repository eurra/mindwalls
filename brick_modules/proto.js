let baseModule = {
	id: 'base',
	loader: function(setup) {
		let value = null;
		let name = null;
		let parent = null;		

		setup.addEvents([
			'onParentSet', 'onDisposed',
			'onValueSet', 'onNameSet', 
		]);

		/*setup.on('onBeforeUnload', function() {
			this.setValue(null);
		});*/

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
			}
		});
	}
};

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
			brick.onChildSetModified(childNode);
		}

		function createNodeFor(child) {
			if(nodesMap.has(child))
				throw new Error('Cannot add a duplicate child on nested brick');

			/*if(child.instanceOf('wall'))
				console.log(child.getView());*/

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
			addChilds: function(childs) {
				for(let i = 0; i < childs.length; i++)
					this.addChild(childs[i]);
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
			},
			hasChild: function(childBrick) {
				return nodesMap.has(childBrick);
			}
		});
	}
};

let viewModule = {
	id: 'jq-base',
	loader: function(setup) {
		let view = $('<div>');
		let content = $('<div>');

		setup.extend({
			getView: function() {
				return view;
			},
			getContent: function() {
				return content;
			}
		});

		setup.on('onDisposed', function() {
			view.remove();
		});

		/*setup.on('onBeforeUnload', function() {
			view.empty();
			content.empty();
		});*/
	}
};

let nestedViewModule = {
	id: 'jq-nested',
	loader: function(setup) {
		let childrenCont = $('<div>');

		setup.on('onChildAdded', function(added, prev, next) {
			if(prev)
				added.getView().insertAfter(prev.getView());
			else if(next)
				added.getView().insertBefore(next.getView());
			else
				this.getChildrenContainer().append(added.getView());
		});

		setup.extend({
			getChildrenContainer: function() {
				return childrenCont;
			}
		});
	}
}

let apiMaker = require('../core/api-maker.js');

function createBrick(terminal = false) {
	let newBrick = apiMaker();

	newBrick.load(baseModule);
	newBrick.load(viewModule);

	if(!terminal) {
		newBrick.load(nestedModule);
		newBrick.load(nestedViewModule);
	}

	//newBrick.save();
	return newBrick;
}

module.exports = {
	create: createBrick
};