/*let actions = require('./action-handling');
let generalUI = require('./general-ui');

actions.register([
	{
		// F2 - set literal value
		key: 113,
		action: function() {
			let activeBrick = generalUI.getActiveBrick();

			if(activeBrick.getUI().getContainer().data('brick-type') === 'literal') {
				generalUI.showInputDialog({
					title: 'Set literal value...',
					placeholder: 'Enter a number, a string, etc...',
					relativeTo: activeBrick.getUI().getContainer(),
					handle: function(textVal) {
						if(!isNaN(textVal))
							textVal = Number(textVal);

						activeBrick.setValue(textVal);
					}
				});
			}
		}
	}
]);*/

module.exports = {
	'core.bricks.literal': function(setup) {	
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