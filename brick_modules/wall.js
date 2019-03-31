let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'wall',
	loader: function(setup) {
		setup.import(mw.bricks.jqGeneric);
		setup.import(mw.bricks.nested);

		let mainBrick = null;
		let emptySpan = $('<span>(empty)</span>');

		setup.configure(function(brick) {
			brick.getView().addClass('wall');
			brick.getContent().append(emptySpan);
			brick.getValueContainer().css('display', 'none');

			brick.getChildrenContainer().
				//append(emptySpan).
				on('DOMSubtreeModified', function() {
					if($(this).children('div').length === 0)
						emptySpan.show();
					else
						emptySpan.hide();
				});
		});

		setup.on('onChildAdded', function(childBrick) {
			mainBrick = childBrick;
		});

		setup.on('onChildValueSet', function(childBrick) {
			this.setValue(childBrick.getValue());
		});

		setup.extend(function(){
			return {
				model: {
					getMainBrick: function() {
						return mainBrick;
					}
				}
			};
		})

	}
};