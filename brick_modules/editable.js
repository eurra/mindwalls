let mw = require('../core/mindwalls.js');

mw.actions.register([
	{
		// F2 - edit
		key: 113,
		action: function() {
			let activeBrick = mw.generalUI.getMeta().getActiveBrick();

			if(activeBrick != null && activeBrick.instanceOf('editable')) {
				let config = {
					title: 'Edit brick',
					placeholder: 'Enter text for edit the brick',
					relativeTo: activeBrick.getView(),
					handle: function(textVal) {
						activeBrick.onEditFinish.call(textVal);
					}
				};

				if(activeBrick.getEditableTextHandler())
					config.text = activeBrick.getEditableTextHandler()(activeBrick);

				mw.generalUI.showInputDialog(config);
			}
		}
	}
]);

module.exports = {
	id: 'editable',
	loader: function(setup) {
		let editableTextHander = function(brick) {
			return brick.getValue();
		};

		setup.addEvents(['onEditFinish']);

		setup.extend({
			setEditableTextHandler: function(handler) {
				editableTextHander = handler;
			},
			getEditableTextHandler: function() {
				return editableTextHander;
			}
		});
	}
};