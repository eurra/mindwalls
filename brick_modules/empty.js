let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'empty',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);

		let emptySpan = $('<span>-</span>');

		setup.configure(function(brick) {
			brick.getContent().append(emptySpan).addClass('noChilds');			
		});
	}
};