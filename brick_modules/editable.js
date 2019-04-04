let mw = require('../core/mindwalls.js');

let editConfigs = [];

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
						for(let i = 0; i < editConfigs.length; i++) {
							let parsedCfg = editConfigs[i].parse.apply(activeBrick, [ textVal ]);							

							if(parsedCfg) {
								activeBrick._reset();
								activeBrick._import(parsedCfg.module, parsedCfg);
							}
						}
					}
				};

				let defVal = activeBrick.getEditableTextHandler().apply(activeBrick);

				if(defVal)
					config.defaultValue = defVal;

				mw.generalUI.showInputDialog(config);
			}
		}
	}
]);

module.exports = {
	id: 'editable',
	loader: function(setup) {
		let editableTextHander = function() {
			return this.getValue();
		};

		setup.extend({
			setEditableTextHandler: function(handler) {
				editableTextHander = handler;
			},
			getEditableTextHandler: function() {
				return editableTextHander;
			}
		});
	},
	registerConfig: function(config) {
		if(config)
			editConfigs.push(config);
	}
};