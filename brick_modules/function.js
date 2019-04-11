let mw = require('../core/mindwalls.js');

function updateFunction(brick) {
	let finalValue = null;

	if(brick.getParamsType() === 'array') {
		let finalVals = brick.getValidValues();

		if(
			(brick.getCardinality() == 'multiple' && (!brick.getMinRequired() || finalVals.length >= brick.getMinRequired())) ||
			(brick.getCardinality() && finalVals.length == brick.getCardinality())
		) {			
			finalValue = brick.getResolver().apply(null, finalVals);
		}
	}
	else if(brick.getParamsType() === 'map') {
		let finalVals = brick.getValidValuesAsMap();

		if(Object.keys(finalVals).length == Object.keys(brick.getArgs()).length)	
			finalValue = brick.getResolver()(finalVals);
	}
	
	brick.setValue(finalValue);
}

module.exports = {
	id: 'function',
	loader: function(setup, config) {
		setup.import(mw.bricks.jqGeneric);

		let def = mw.functions.getDefinition(config.id, config.namespace);

		if(def.paramSet.type === 'array') {
			setup.extend({
				getCardinality: function() { return def.paramSet.cardinality; },
				getMinRequired: function() { return def.paramSet.minRequired; }
			});
		}
		else if(def.paramSet.type === 'map') {
			let childsSet = new Set();

			setup.extend({
				getArgs: function() { return def.paramSet.args; },
				getChildsAsSet: function() {
					return new Set(childsSet);
				},
				getValidValuesAsMap: function() {
					let res = {};

					childsSet.forEach(function(childBrick) {
						if(childBrick.getValue())
							res[childBrick.getName()] = childBrick.getValue();
					});

					return res;
				}						
			});

			setup.on('onChildAdded', function(childBrick) {
				childsSet.add(childBrick);
				childBrick.getNameContainer().css('display', '');
			});

			setup.on('onChildDisposed', function(childBrick) {
				childsSet.delete(childBrick);
			});
		}
		else {
			throw new Error('Function type not supported: ' + def.paramSet.type);
		}

		setup.on('onChildSetModified', function() {
			updateFunction(this);
		});

		setup.extend({
			getParamsType: function() { 
				return def.paramSet.type;
			},
			getResolver: function() {
				return def.paramSet.resolver;
			}
		});

		setup.configure(function(brick) {
			let content = $(`<div class="brick funcName">${config.id}</div>`);
			brick.getContent().append(content);
			brick.getValueContainer().css('display', '');

			/*brick.view.getChildrenContainer().
				addClass('noChilds').
				on('DOMSubtreeModified', function() {
					if($(this).children().length === 0)
						$(this).addClass('noChilds');	
					else
						$(this).removeClass('noChilds');
				});*/
		})
	}
};