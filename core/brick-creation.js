let mw = require('../core/mindwalls.js');

let configMap = new Map();

/*configMap.set('test', { name: 'Test' });
configMap.set('test2', { name: 'Test 2' });
configMap.set('test3', { name: 'Test 3' });*/

module.exports = {
	addBrickType: function(id, config) {
		configMap.set(id, config);
	}
};

mw.actions.register([
	{
		// Insert - add after
		key: 13,
		action: function() {
			if(configMap.size == 0)
				return;

			let activeBrick = mw.generalUI.getMeta().getActiveBrick();

			let addDialog = $(`<div title="Select brick type">`).
				dialog({ 
					autoOpen: false,
					modal: true,
					resizable: false,
					draggable: false,
					minHeight: 10,
					width: 50,
					close: function() {
						$(this).remove();
					}
				});

			if(activeBrick != null) {
				addDialog.dialog('option', 'position', {
					at: 'right bottom',
					my: 'left top',
					of: activeBrick.getView()
				});
			}

			let brickHandler = function(newBrick) {
				newBrick.setParent()
				activeBrick.getParent()
			}

			let combo = $('<select size="1"><option disabled selected value>select...</option></select>').				
				appendTo(addDialog).
				change(function() {
					addDialog.dialog('close');
					configMap.get($(this).val()).onSelected(activeBrick, brickHandler);					
				}).
				css('width', '100%');

			configMap.forEach(function(config, brickId) {
				$(`<option value="${brickId}">${config.name}</option>`).
					appendTo(combo);
			});

			addDialog.dialog('open');
		}
	}
]);