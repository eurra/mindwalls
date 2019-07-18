module.exports = {
	id: 'wall',
	loader: function(setup) {
		let mainBrick = null;
		let emptySpan = $('<span>(empty)</span>');

		setup.configure(function(brick) {
			brick.getContent().
				appendTo(brick.getView()).
				append(emptySpan).				
				addClass('wall');

			brick.getChildrenContainer().
				//append(emptySpan).
				on('DOMSubtreeModified', function() {
					if($(this).children('div').length === 0)
						emptySpan.show();
					else
						emptySpan.hide();
				}).
				appendTo(brick.getContent());
		});

		setup.on('onChildAdded', function(added, prev, next) {
			added.mustBe('wall-member');
			mainBrick = added;

			if(prev)
				added.getView().insertAfter(prev.getView());
			else if(next)
				added.getView().insertBefore(next.getView());
			else
				this.getChildrenContainer().append(added.getView());

			added.setWall(this);
		});

		setup.on('onChildValueSet', function(childBrick) {
			this.setValue(childBrick.getValue());
		});

		setup.extend({
			getMainBrick: function() {
				return mainBrick;
			}
		});
	}
};