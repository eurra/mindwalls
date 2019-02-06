let actions = require('./action-handling');
let traverse = require('./wall-traverse');

function initLiteralBrick(val) {
	let literalBrick = 
		$(`<div class="horizontal">
				<div class="brick data">${val}</div>
			</div>`).
			data('brickData', {
				type: 'literal',
				value: val
			});

	traverse.getActiveBrick().parent().replaceWith(literalBrick);
	traverse.setActiveBrickWithin(literalBrick, traverse.getActiveWall());
}

$('body').append(`<div id="setLiteralValueDialog" title="Set literal value...">
		<input id="literalValueInput" style="width: 95%;" type="text" placeholder="Enter a number, a string, etc..."/>
</div>`);

$('#setLiteralValueDialog').dialog({ 
	autoOpen: false,
	modal: true,
	resizable: false,
	draggable: false,
	minHeight: 10,
	minWidth: 10,
	open: function() {
		$('#literalValueInput').val('');
	}
});

$('#literalValueInput').keypress(function(e) {
	if(e.which === 13) {
		if($('#literalValueInput').val() !== '') {
			initLiteralBrick($('#literalValueInput').val());
			$('#setLiteralValueDialog').dialog('close');
		}
	}
});

actions.register([
	{
		// F2 - set literal value
		key: 113,
		action: function() {
			let activeBrick = traverse.getActiveBrick();

			if(activeBrick.data('brickData') === undefined) {
				$('#setLiteralValueDialog').
					dialog('option', 'position', {
						at: 'right bottom',
						my: 'left top',
						of: activeBrick
					}).
					dialog('open');
			}
		}
	}
]);