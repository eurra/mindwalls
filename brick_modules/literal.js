let mw = require('../core/mindwalls.js');

let brickModule = {
	id: 'literal',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);
		setup.import(mw.bricks.editable);

		let valueContainer = $('<div class="brick data"></div>');

		setup.configure(function(brick) {			
			brick.getContent().append(valueContainer);
			//brick.getValueContainer().css('display', '');
		});

		setup.on('onValueSet', function() {
			let val = this.getValue();
			valueContainer.html(val === null ? '?': val);
		})
	}
};

mw.bricks.editable.registerConfig({
	parse: function(text) {
		if(!isNaN(text))
			text = Number(text);

		return {
			module: brickModule,
			value: text
		};
	}
});

module.exports = brickModule;