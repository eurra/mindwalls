let mw = require('../core/mindwalls.js');
let hotkeys = require('hotkeys-js');

hotkeys('f2', 'general-ui', function() {
	let activeBrick = mw.generalUI.getActiveBrick();
			
	if(activeBrick != null && activeBrick.instanceOf('editable')) {	
		mw.generalUI.getPanelTitle().html('Edit brick...');
		mw.generalUI.getPanelContainer().html('');
		hotkeys.setScope('edit-brick');

		activeBrick.getEditHandler()(activeBrick, function(brick) {
			mw.generalUI.getActiveUI().changeActiveBrick(brick);
			hotkeys.deleteScope('edit-brick');
			hotkeys.setScope('general-ui');
		});
	}
});

module.exports = {
	id: 'editable',
	loader: function(setup) {
		setup.import(mw.bricks.clickable);		

		let editHandler = function(brick, readyCallback) {
			readyCallback(brick);
		};

		setup.extend({
			setEditHandler: function(handler) {
				editHandler = handler;
			},
			getEditHandler: function() {
				return editHandler;
			}
		});

		setup.configure(function(brick) {
			
		});
	}
};