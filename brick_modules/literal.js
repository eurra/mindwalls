let mw = require('../core/mindwalls.js');
let hotkeys = require('hotkeys-js');

function editLiteralBrick(brick, readyCallback) {
	brick.getContent().children().hide();

	let input = $('<input class="literalEdit" type="text" value="' + brick.getValue() + '"/>').
		appendTo(brick.getContent()).
		select();

	function resizeInput(x) {
		x.attr('size', x.val().length);		
	}

	input.keyup(() => resizeInput(input));
	resizeInput(input);

	hotkeys('enter,esc', {
			scope: 'edit-brick',
			element: input.get()
		}, 
		function(e, handler) {
			if(handler.key == 'enter') {
				let val = input.val();							
				brick.setValue(val);
			}

			input.remove();
			brick.getContent().children().show();
			readyCallback(brick);
		}
	);
}

let brickModule = {
	id: 'literal',
	loader: function(setup) {	
		setup.import(mw.bricks.jqGeneric);
		setup.import(mw.bricks.wallMember);
		setup.import(mw.bricks.editable);

		let valueContainer = $('<div class="brick data"></div>');

		setup.configure(function(brick) {			
			brick.getContent().append(valueContainer);
			brick.setStaticData('brick-type', 'Literal');
			brick.setEditHandler(editLiteralBrick);
			brick.setClickElem(valueContainer);
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