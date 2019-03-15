let functions = require('../core/function-register');

function updateFunction(brick) {
	let finalValue = null;

	if(brick.model.getParamsType() === 'array') {
		let finalVals = brick.model.getValidValues();

		if(
			(brick.model.getCardinality() == 'multiple' && (!brick.model.getMinRequired() || finalVals.length >= brick.model.getMinRequired())) ||
			(brick.model.getCardinality() && finalVals.length == brick.model.getCardinality())
		) {			
			finalValue = brick.model.resolver(finalVals);
		}
	}
	else if(brick.model.getParamsType() === 'map') {
		let finalVals = brick.model.getValidValuesAsMap();

		if(Object.keys(finalVals).length == Object.keys(brick.model.getArgs()).length)	
			finalValue = brick.model.resolver(finalVals);
	}
	
	brick.model.setValue(finalValue);
}

module.exports = {
	'core.bricks.function': function(setup, config) {
		let def = functions.getDefinition(config.id, config.namespace);
		let childsArr = [];

		setup.on('childAdded', function(brick, childBrick) {
			childsArr.push(childBrick);
		});

		setup.on('childDisposed', function(brick, childBrick) {
			let found = false;

			for(let i = 0; i < childsArr.length && !found; i++) {
				if(childsArr[i] === childBrick) {
					childsArr.splice(i, 1);
					found = true;
				}
			}
		});

		if(def.paramSet.type === 'array') {
			setup.extend(function() {
				return {
					model: {
						getCardinality: function() { return def.paramSet.cardinality; },
						getMinRequired: function() { return def.paramSet.minRequired; },
					}
				}	
			});
		}
		else if(def.paramSet.type === 'map') {
			let childsSet = new Set();

			setup.extend(function() {
				return {
					model: {
						getArgs: function() { return def.paramSet.args; },
						getChildsAsSet: function() {
							return new Set(childsSet);
						},
						getValidValuesAsMap: function() {
							let res = {};

							childsSet.forEach(function(childBrick) {
								if(childBrick.model.getValue())
									res[childBrick.model.getName()] = childBrick.model.getValue();
							});

							return res;
						}
					}
				}
						
			});

			setup.on('childAdded', function(brick, childBrick) {
				childsSet.add(childBrick);
			});

			setup.on('childDisposed', function(brick, childBrick) {
				childsSet.delete(childBrick);
			});
		}
		else {
			throw new Error('Function type not supported: ' + def.paramSet.type);
		}

		setup.on('childAdded', function(brick, childBrick) {
			brick.events.childValueSet(brick, childBrick);
		});

		setup.on('childDisposed', function(brick, childBrick) {
			brick.events.childValueSet(brick, childBrick);
		});

		setup.on('childValueSet', function(brick) {
			updateFunction(brick);
		});

		setup.extend(function() {
			return {
				model: {
					getChilds: function() {
						return childsArr.slice(0, childsArr.length);
					},
					getFirstChild: function() {
						if(childsArr.length == 0)
							return null;

						return childsArr[0];
					},
					getLastChild: function() {
						if(childsArr.length == 0)
							return null;

						return childsArr[childsArr.length - 1];
					},
					getNextSiblingOf: function(childBrick) {
						let index = -1;

						for(let i = 0 ; i < childsArr.length && index == -1; i++) {
							if(childsArr[i] === childBrick)
								index = i;
						}

						if(index == -1 || index == childsArr.length - 1)
							return null;

						return childsArr[index + 1];
					},
					getPrevSiblingOf: function(childBrick) {
						let index = -1;

						for(let i = 0 ; i < childsArr.length && index == -1; i++) {
							if(childsArr[i] === childBrick)
								index = i;
						}

						if(index == -1 || index == 0)
							return null;

						return childsArr[index - 1];
					},
					getValidValues: function() {
						let res = [];

						for(let i = 0; i < childsArr.length; i++) {
							if(childsArr[i].model.getValue())
								res.push(childsArr[i].model.getValue());
						}

						return res;
					},
					getParamsType: function() { 
						return def.paramSet.type;
					},
					resolver: def.paramSet.resolver
				}
			}	
		});

		setup.configure(function(brick) {
			let content = $(`<div class="brick funcName">${config.id}</div>`);

			brick.view.getContent().append(content);
			brick.view.setFocusElem(content);

			brick.view.getChildrenContainer().
				addClass('noChilds').
				on('DOMSubtreeModified', function() {
					if($(this).children().length === 0)
						$(this).addClass('noChilds');
					else
						$(this).removeClass('noChilds');
				});
		})
	}
};