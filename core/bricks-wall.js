let Brick = require('./brick-api');

module.exports = function(setupHandler, config) {
	let mainBrick = Brick.empty();

	setupHandler.addSetup(function(brick) {
		brick.ui.container.addClass('wall');
		brick.ui.valueContainer.css('display', 'none');

		let emptySpan = $('<span>(empty)</span>');

		brick.ui.childrenContainer.
			append(emptySpan).
			on('DOMSubtreeModified', function() {
				if($(this).children('div').length === 0)
					emptySpan.show();
				else
					emptySpan.hide();
			});
	});

	setupHandler.addEvent('childAdded', function(brick, childBrick) {
		mainBrick = childBrick;
	});

	setupHandler.addEvent('childValueSet', function(brick, childBrick) {
		brick.value = childBrick.value;
	});
};