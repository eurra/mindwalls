let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'literal',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);
		setup.import(mw.bricks.editable);

		let valueContainer = $('<div class="brick data"></div>');

		setup.on('onEditFinish', function(text) {
			if(!isNaN(text))
				text = Number(text);

			this.setValue(text);
		});

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