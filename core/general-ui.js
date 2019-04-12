let mw = require('../core/mindwalls.js');
let metaBrick = null;

module.exports = {
	setMeta: function(meta) {
		meta.mustBe('meta');
		$('body').empty();
		meta.getView().appendTo('body');
		mw.actions.setTargetElem(meta.getView());

		metaBrick = meta;
	},
	getMeta: function() {
		return metaBrick;
	},
	showInputDialog: function(config) {
		let inputDialog = $(`<div title="${config.title}">`).
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

		if(config.relativeTo) {
			inputDialog.dialog('option', 'position', {
				at: 'right bottom',
				my: 'left top',
				of: config.relativeTo
			});
		}

		$(`<input style="width: 95%;" type="text" placeholder="${config.placeholder}"/>`).
			val(config.defaultValue ? config.defaultValue : '').
			appendTo(inputDialog).
			keypress(function(e) {
				if(e.which === 13) {
					if($(this).val() !== '') {
						if(config.handle)
							config.handle($(this).val());
					}

					inputDialog.dialog('close');
				}
			});

		inputDialog.dialog('open');
	}
};

function checkIntersect(elem1, elem2) {
	let e1L = elem1.position().left;
	let e1R = e1L + elem1.width();

	let e2L = elem2.position().left;
	let e2R = e2L + elem2.width();

	return Math.max(e1L, e2L) <= Math.max(e1R, e2R);
}

mw.actions.register([
	{	// Move up between walls
		ctrlKey: true,
		key: 38,
		action: function() {
			if(metaBrick == null || metaBrick.getActiveWall() == null)
				return;

			let nextWalls = metaBrick.getPrevAllOf(metaBrick.getActiveWall());
			let top = metaBrick.getActiveWall().getView().position().top;
			let target = null;
			let i = 0;

			while(target == null && i < nextWalls.length) {
				let checkBottom = nextWalls[i].getView().position().top + nextWalls[i].getView().height();

				if(checkBottom < top && checkIntersect(nextWalls[i].getView(), metaBrick.getActiveWall().getView()))
					target = nextWalls[i];

				i++;
			}

			if(target != null)
				metaBrick.setActiveWall(target);
		}
	},
	{
		// Move down between walls
		ctrlKey: true,
		key: 40,
		action: function() {
			if(metaBrick == null || metaBrick.getActiveWall() == null)
				return;

			let nextWalls = metaBrick.getNextAllOf(metaBrick.getActiveWall());
			let bottom = metaBrick.getActiveWall().getView().position().top + metaBrick.getActiveWall().getView().height();			
			let target = null;
			let i = 0;

			while(target == null && i < nextWalls.length) {
				let checkTop = nextWalls[i].getView().position().top;

				if(bottom < checkTop && checkIntersect(nextWalls[i].getView(), metaBrick.getActiveWall().getView()))
					target = nextWalls[i];

				i++;
			}

			if(target != null)
				metaBrick.setActiveWall(target);
		}
	},
	{
		// Move right between walls
		ctrlKey: true,
		key: 39,
		action: function() {			
			if(metaBrick == null)
				return;

			metaBrick.moveToNextWall();
		}
	},
	{
		// Move left between walls
		ctrlKey: true,
		key: 37,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.moveToPrevWall();
		}
	},
	{
		// Move to parent (left) within wall
		key: 37,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.moveToParentBrick();
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.moveToChildBrick();
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.moveToNextSiblingBrick();
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.moveToPrevSiblingBrick();
		}
	},
	{
		// Supr - remove brick
		key: 46,
		action: function() {
			let currBrick = metaBrick.getActiveBrick();

			if(currBrick != null) {
				metaBrick.moveToClosestBrick();				
				currBrick.dispose();
			}
		}
	}
]);