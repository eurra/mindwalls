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

module.exports = function(setupHandler, config) {
	let valueContainer = $('<div class="brick data"></div>');

	setupHandler.addSetup(function(brick) {
		brick.ui.contentContainer.append(valueContainer);
		brick.ui.valueLabel.css('display', 'none');
		brick.ui.focusElem = valueContainer;
		brick.ui.container.data('brick-type', 'literal');
	});

	setupHandler.addEvent('valueSet', function(brick) {
		let val = brick.value;
		valueContainer.html(val === null ? '?': val);
	});
};

/*module.exports = {
	ui: {
		setup: function(brickUI, config) {
			let valueContainer = $('<div class="brick data"></div>');
			brickUI.contentContainer.append(valueContainer);
			brickUI.valueLabel.css('display', 'none');
			brickUI.focusElem = valueContainer;
			brickUI.container.data('brick-type', 'literal');
		},
		events: function(eventHandler) {
			eventHandler('valueSet', function(brick, ui) {
				let val = brick.value;
				ui.valueContainer.html(val === null ? '?': val);
			});
		}
	}
};*/