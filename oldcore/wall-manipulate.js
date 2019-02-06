let actions = require('./action-handling');
let traverse = require('./wall-traverse');

actions.register([
	{
		// Insert a new wall
		ctrlKey: true,
		key: 45,
		action: function() {
			traverse.setActiveWall(
				$('<div class="wall"><div class="horizontal"><div class="brick data">...</div></div></div>').
					insertAfter(traverse.getActiveWall())
			);

			console.log(traverse.getActiveWall());

			let ev = jQuery.Event('keydown');
			ev.which = 45;
			actions.targetElem.trigger(ev);
		}
	}
]);