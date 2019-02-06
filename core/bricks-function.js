//let actions = require('./action-handling');
//let generalUI = require('./general-ui');
let functions = require('./function-register');

function updateFunction(brick, data, def) {
	let finalValue = null;

	if(def.paramSet.type === 'array') {
		let finalVals = [];

		for(let i = 0; i < data.childs.length; i++) {
			if(data.childs[i].getValue())
				finalVals.push(data.childs[i].getValue());
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
			if(childBrick.getValue())
				finalVals[childBrick.getName()] = childBrick.getValue();
		});

		if(Object.keys(data.childs).length == Object.keys(def.paramSet.args).length)	
			finalValue = def.paramSet.resolver(finalVals);
	}
	
	brick.setValue(finalValue);
}

module.exports = {
	model: function(brick, config) {
		let def = functions.getDefinition(config.id, config.namespace);
		let data = {};

		if(def.paramSet.type === 'array') {	
			data.childs = [];
			//data.childPos = new Map();

			brick.onChildAdded = function(childBrick) {
				data.childs.push(childBrick);
				//data.childPos.set(childBrick, data.childs.length - 1);
				brick.onChildValueSet(childBrick);
			};

			brick.onChildValueSet = function(childBrick) {
				//let childVal = childBrick.getValue();
				/*let childIndex = childBrick.getIndex();
				childsVals[childIndex] = childVal;

				if(childVal === null)
					unsetVals[childIndex] = 1;
				else
					delete unsetVals[childIndex];*/

				updateFunction(brick, data, def);
			};

			brick.onChildDisposed = function(childBrick) {
				let found = false;

				for(let i = 0; i < data.childs.length && !found; i++) {
					if(data.childs[i] === childBrick) {
						data.childs.splice(i, 1);
						found = true;
					}
				}

				updateFunction(brick, data, def);
			};
		}
		else if(def.paramSet.type === 'map') {
			data.childs = new Set();

			brick.onChildAdded = function(childBrick) {
				data.childs.add(childBrick);
				//data.childPos.set(childBrick, data.childs.length - 1);
				brick.onChildValueSet(childBrick);
			};

			brick.onChildValueSet = function(childBrick) {
				/*let childVal = childBrick.getValue();					

				if(childVal === null)
					delete childsVals[childBrick.getName()];
				else if(def.paramSet.args[childBrick.getName()])
					childsVals[childBrick.getName()] = childVal;*/

				updateFunction(brick, data, def);
			};
		}
		else {
			throw new Error('Function type not supported: ' + def.paramSet.type);
		}		
	},
	ui: function(brickUI, config) {
		let content = $(`<div class="brick funcName">${config.id}</div>`);
		brickUI.getContentContainer().append(content);
		brickUI.setFocusElem(content);

		return brickUI;
	}
};