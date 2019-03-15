module.exports = {
	'core.bricks.wall': function(setup) {
		let mainBrick = null;
		let emptySpan = $('<span>(empty)</span>');

		setup.configure(function(brick) {
			brick.view.getContainer().addClass('wall');
			brick.view.getContent().append(emptySpan);
			brick.view.getValueContainer().css('display', 'none');

			brick.view.getChildrenContainer().
				//append(emptySpan).
				on('DOMSubtreeModified', function() {
					if($(this).children('div').length === 0)
						emptySpan.show();
					else
						emptySpan.hide();
				});
		});

		setup.on('childAdded', function(brick, childBrick) {
			mainBrick = childBrick;
		});

		setup.on('childValueSet', function(brick, childBrick) {
			brick.model.setValue(childBrick.model.getValue());
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