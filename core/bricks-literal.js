let actions = require('./action-handling');
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
]);

module.exports = {
	ui: function(brickUI, config) {
		let valueContainer = $('<div class="brick data"></div>');
		brickUI.getContentContainer().append(valueContainer);
		brickUI.getValueLabel().css('display', 'none');
		brickUI.setFocusElem(valueContainer);

		let origHandler = brickUI.onValueSet;

		brickUI.onValueSet = function() {
			origHandler();

			let val = brickUI.getModel().getValue();
			valueContainer.html(val === null ? '?': val);

			return brickUI;
		};

		brickUI.getContainer().data('brick-type', 'literal');
	}
};