let functions = require('./function-register');

function updateFunction(brick, data, def) {
	let finalValue = null;

	if(def.paramSet.type === 'array') {
		let finalVals = [];

		for(let i = 0; i < data.childs.length; i++) {
			if(data.childs[i].value)
				finalVals.push(data.childs[i].value);
		}

		if(
			(def.paramSet.cardinality === 'multiple' &&	(!def.paramSet.minRequired || finalVals.length >= def.paramSet.minRequired)) ||
			(def.paramSet.cardinality && finalVals.length == def.paramSet.cardinality)
		) {
			finalValue = def.paramSet.resolver(finalVals);
		}
	}
	else if(def.paramSet.type === 'map') {
		let finalVals = {};

		data.childs.forEach(function(childBrick) {
			if(childBrick.value)
				finalVals[childBrick.name] = childBrick.value;
		});

		if(Object.keys(data.childs).length == Object.keys(def.paramSet.args).length)	
			finalValue = def.paramSet.resolver(finalVals);
	}
	
	brick.value = finalValue;
}

module.exports = function(setupHandler, config) {
	let def = functions.getDefinition(config.id, config.namespace);
	let data = {};

	if(def.paramSet.type === 'array') {	
		data.childs = [];

		setupHandler.addEvent('childAdded', function(brick, childBrick) {
			data.childs.push(childBrick);
			brick.events.childValueSet(brick, childBrick);
		});

		setupHandler.addEvent('childValueSet', function(brick, childBrick) {
			updateFunction(brick, data, def);
		});

		setupHandler.addEvent('childDisposed', function(brick, childBrick) {
			let found = false;

			for(let i = 0; i < data.childs.length && !found; i++) {
				if(data.childs[i] === childBrick) {
					data.childs.splice(i, 1);
					found = true;
				}
			}

			updateFunction(brick, data, def);
		});
	}
	else if(def.paramSet.type === 'map') {
		data.childs = new Set();

		setupHandler.addEvent('childAdded', function(brick, childBrick) {
			data.childs.add(childBrick);
			brick.events.childValueSet(brick, childBrick);
		});

		setupHandler.addEvent('childValueSet', function(brick, childBrick) {
			updateFunction(brick, data, def);
		});

		setupHandler.addEvent('childDisposed', function(brick, childBrick) {
			// ?? 
		});
	}
	else {
		throw new Error('Function type not supported: ' + def.paramSet.type);
	}		

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