let mw = require('../core/mindwalls.js');

mw.actions.register([
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
]);

module.exports = {
	id: 'literal',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);

		let valueContainer = $('<div class="brick data"></div>');

		setup.configure(function(brick) {
			brick.view.getContent().append(valueContainer);
			brick.view.getValueLabel().css('display', 'none');
			brick.view.setFocusElem(valueContainer);
		});

		setup.on('valueSet', function(brick) {
			let val = brick.model.getValue();
			valueContainer.html(val === null ? '?': val);
		})
	}
};