let functions = require('./function-register');
let Brick = require('./brick-api');

function updateFunction(brick) {
	let finalValue = null;

	if(brick.api.paramsType() === 'array') {
		let finalVals = brick.api.validValues();

		if(
			(brick.api.cardinality() === 'multiple' &&	(!brick.api.minRequired() || finalVals.length >= brick.api.minRequired())) ||
			(brick.api.cardinality() && finalVals.length == brick.api.cardinality())
		) {
			finalValue = brick.api.resolver(finalVals);
		}
	}
	else if(brick.api.paramsType() === 'map') {
		let finalVals = brick.api.validValuesAsMap();

		if(Object.keys(finalVals).length == Object.keys(brick.api.args()).length)	
			finalValue = brick.api.resolver(finalVals);
	}
	
	brick.value = finalValue;
}

module.exports = function(setupHandler, config) {
	let def = functions.getDefinition(config.id, config.namespace);
	let childsArr = [];

	setupHandler.addEvent('childAdded', function(brick, childBrick) {
		childsArr.push(childBrick);
	});

	setupHandler.addEvent('childDisposed', function(brick, childBrick) {
		let found = false;

		for(let i = 0; i < childsArr.length && !found; i++) {
			if(childsArr[i] === childBrick) {
				childsArr.splice(i, 1);
				found = true;
			}
		}
	});

	if(def.paramSet.type === 'array') {
		setupHandler.addAPI({
			cardinality: function() { return def.paramSet.cardinality; },
			minRequired: function() { return def.paramSet.minRequired; },
			validValues: function() {
				let res = [];

				for(let i = 0; i < childsArr.length; i++) {
					if(childsArr[i].value)
						res.push(childsArr[i].value);
				}

				return res;
			}
		});
	}
	else if(def.paramSet.type === 'map') {
		let childsSet = new Set();

		setupHandler.addAPI({
			args: function() { return def.paramSet.args; },
			childsAsSet: function() {
				return new Set(childsSet);
			},
			validValuesAsMap: function() {
				let res = {};

				childsSet.forEach(function(childBrick) {
					if(childBrick.value)
						res[childBrick.name] = childBrick.value;
				});

				return res;
			}
		});

		setupHandler.addEvent('childAdded', function(brick, childBrick) {
			childsSet.add(childBrick);
		});

		setupHandler.addEvent('childDisposed', function(brick, childBrick) {
			childsSet.delete(childBrick);
		});
	}
	else {
		throw new Error('Function type not supported: ' + def.paramSet.type);
	}

	setupHandler.addEvent('childAdded', function(brick, childBrick) {
		brick.events.childValueSet(brick, childBrick);
	});

	setupHandler.addEvent('childDisposed', function(brick, childBrick) {
		brick.events.childValueSet(brick, childBrick);
	});

	setupHandler.addEvent('childValueSet', function(brick, childBrick) {
		updateFunction(brick);
	});

	setupHandler.addAPI({
		childs: function() {
			return childsArr.slice(0, childsArr.length);
		},
		firstChild: function() {
			if(childsArr.length == 0)
				return Brick.empty();

			return childsArr[0];
		},
		lastChild: function() {
			if(childsArr.length == 0)
				return Brick.empty();

			return childsArr[childsArr.length - 1];
		},
		nextSiblingOf: function(childBrick) {
			let index = -1;

			for(let i = 0 ; i < childsArr.length && index == -1; i++) {
				if(childsArr[i] === childBrick)
					index = i;
			}

			if(index == -1 || index == childsArr.length - 1)
				return Brick.empty();

			return childsArr[index + 1];
		},
		prevSiblingOf: function(childBrick) {
			let index = -1;

			for(let i = 0 ; i < childsArr.length && index == -1; i++) {
				if(childsArr[i] === childBrick)
					index = i;
			}

			if(index == -1 || index == 0)
				return Brick.empty();

			return childsArr[index - 1];
		},
		validValues: function() {
			let res = [];

			for(let i = 0; i < childsArr.length; i++) {
				if(childsArr[i].value)
					res.push(childsArr[i].value);
			}

			return res;
		},
		paramsType: function() { 
			return def.paramSet.type;
		},
		resolver: def.paramSet.resolver
	});

	setupHandler.addSetup(function(brick) {
		let content = $(`<div class="brick funcName">${config.id}</div>`);

		brick.ui.contentContainer.append(content);
		brick.ui.focusElem = content;

		brick.ui.childrenContainer.
			addClass('noChilds').
			on('DOMSubtreeModified', function() {
				if($(this).children().length === 0)
					$(this).addClass('noChilds');
				else
					$(this).removeClass('noChilds');
			});
	});
};