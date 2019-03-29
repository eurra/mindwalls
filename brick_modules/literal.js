let mw = require('../core/mindwalls.js');

/*mw.actions.register([
	{
		// F2 - set literal value
		key: 113,
		action: function() {
			let activeBrick = mw.generalUI.getMeta().model.getActiveBrick();

			if(activeBrick != null && activeBrick.model.instanceOf('literal')) {
				mw.generalUI.showInputDialog({
					title: 'Set literal value...',
					placeholder: 'Enter a number, a string, etc...',
					relativeTo: activeBrick.view.getContainer(),
					handle: function(textVal) {
						if(!isNaN(textVal))
							textVal = Number(textVal);

						activeBrick.model.setValue(textVal);
					}
				});
			}
		}
	}
]);*/

module.exports = {
	id: 'literal',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);

		let valueContainer = $('<div class="brick data"></div>');

		setup.configure(function(brick) {
			brick.getContent().append(valueContainer);
			brick.getValueLabel().css('display', 'none');
			brick.setFocusElem(valueContainer);
		});

		setup.on('onValueSet', function() {
			let val = this.getValue();
			valueContainer.html(val === null ? '?': val);
		})
	}
};