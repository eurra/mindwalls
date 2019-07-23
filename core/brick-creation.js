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

/*mw.actions.register([
	{
		// Insert - add after
		key: 13,
		resolveTarget: () => mw.generalUI.getLoaded().getView(),
		action: function(loadedUI) {
			if(configMap.size == 0)
				return;

			let activeBrick = loadedUI.getActiveBrick();
			let input = $(`<input type="text" value="test" onkeypress="this.style.width = ((this.value.length + 1) * 8) + 'px';"/>`);

			$(`<div class="brick"></div>`).
				insertAfter(activeBrick.getView()).
				append(input);

			input.focus();

			
		}
	}
]);*/

/*let addDialog = $(`<div title="Select brick type">`).
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
				activeBrick.getParent().addChildAfter(newBrick, activeBrick);
				mw.generalUI.getLoaded().changeActiveBrick(newBrick);
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

			addDialog.dialog('open');*/