let mw = require('../core/mindwalls.js');

let editConfigs = [];

mw.actions.register([
	{
		// F2 - edit
		key: 113,
		action: function() {
			let activeBrick = mw.generalUI.getActiveBrick();
			
			if(activeBrick != null && activeBrick.instanceOf('editable')) {	
				mw.generalUI.getPanelTitle().html('Edit literal brick...');
				mw.generalUI.getPanelContainer().html('');

				activeBrick.getContent().children().hide();

				$('<input class="literalEdit" type="text" value="' + activeBrick.getValue() + '"/>').
					appendTo(activeBrick.getContent()).
					select().
					keydown(function(e) {
						switch(e.which) {
							case 13: {
								let val = $(this).val();							
								activeBrick.setValue(val);
							}
							case 27: {
								$(this).remove();
								activeBrick.getContent().children().show();
								mw.generalUI.focus();
							}
						}
					});

				/*let config = {
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

				mw.generalUI.showInputDialog(config);*/
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