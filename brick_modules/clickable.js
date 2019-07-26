let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'clickable',
	loader: function(setup) {
		let clickElem = $();

		setup.extend({
			setClickElem: function(elem) {
				console.log(elem);
				clickElem = elem;
			},
			getClickElem: function() {
				return clickElem;
			}
		});

		setup.configure(function(brick) {			
			brick.getClickElem().hover(
				function() {
					$(this).addClass('pointedBrick');
				},
				function() {
					$(this).removeClass('pointedBrick');
				}
			);
		});
	}
};