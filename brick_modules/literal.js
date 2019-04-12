let mw = require('../core/mindwalls.js');

let brickModule = {
	id: 'literal',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);
		setup.import(mw.bricks.wallMember);

		let valueContainer = $('<div class="brick data"></div>');

		setup.configure(function(brick) {			
			brick.getContent().append(valueContainer);
		});

		setup.on('onValueSet', function() {
			let val = this.getValue();
			valueContainer.html(val === null ? '?': val);
		})
	}
};

function parseTextValue(text) {
	if(!isNaN(text))
		text = Number(text);

	return text;
}

function createNewLiteralBrick(text) {
	return mw.import.newBrick({
		module: brickModule,
		value: parseTextValue(text)
	});
}

mw.newbrick.addBrickType('literal', {
	name: 'Literal brick',
	onSelected: function(activeBrick, brickHandler) {
		let addDialog = $(`<div title="Enter literal value">`).
			dialog({ 
				autoOpen: false,
				modal: true,
				resizable: false,
				draggable: false,
				minHeight: 10,
				minWidth: 10,
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

		$(`<input style="width: 95%;" type="text" placeholder="Enter a number, text, etc..."/>`).
			appendTo(addDialog).
			keypress(function(e) {
				if(e.which === 13) {
					addDialog.dialog('close');

					if($(this).val() != '')
						brickHandler(createNewLiteralBrick($(this).val()));
				}
			});

		addDialog.dialog('open');
	}
});

module.exports = brickModule;