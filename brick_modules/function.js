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

		setup.on('childSetModified', function(brick) {
			updateFunction(brick);
		});

		setup.extend(function() {
			return {
				model: {
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
		})
	}
};