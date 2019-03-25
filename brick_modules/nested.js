module.exports = {
	id: 'nested',
	loader: function(setup) {
		let firstNode = null;
		let lastNode = null;
		let nodesMap = new Map();

		function createNodeFor(child) {
			let node = {
				next: null,
				prev: null,
				brick: child
			};

			nodesMap.set(child, node);
			return node;
		}

		setup.on('childAdded', function(brick, childBrick) {
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
		});

		setup.on('childDisposed', function(brick, childBrick) {
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
		});

		setup.extend(function() {
			return {
				model: {
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
							if(currNode.brick.model.getValue())
								res.push(currNode.brick.model.getValue());

							currNode = currNode.next;
						}

						return res;
					}
				}
			}	
		});		
	}
};