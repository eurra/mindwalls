let actions = require('./action-handling');
let metaBrick = null;

module.exports = {
	setMeta: function(meta) {
		meta.model.mustBe('meta');
		$('body').empty();
		meta.view.getContainer().appendTo('body');
		actions.setTargetElem(meta.view.getContainer());

		metaBrick = meta;
	}
};

function checkIntersect(elem1, elem2) {
	let e1L = elem1.position().left;
	let e1R = e1L + elem1.width();

	let e2L = elem2.position().left;
	let e2R = e2L + elem2.width();

	return Math.max(e1L, e2L) <= Math.max(e1R, e2R);
}

actions.register([
	{	// Move up between walls
		ctrlKey: true,
		key: 38,
		action: function() {
			if(metaBrick == null || metaBrick.model.getActiveWall() == null)
				return;

			let nextWalls = metaBrick.model.getPrevAllOf(metaBrick.model.getActiveWall());
			let top = metaBrick.model.getActiveWall().view.getContainer().position().top;
			let target = null;
			let i = 0;

			while(target == null && i < nextWalls.length) {
				let checkBottom = nextWalls[i].view.getContainer().position().top + nextWalls[i].view.getContainer().height();

				if(checkBottom < top && checkIntersect(nextWalls[i].view.getContainer(), metaBrick.model.getActiveWall().view.getContainer()))
					target = nextWalls[i];

				i++;
			}

			if(target != null)
				metaBrick.model.setActiveWall(target);
		}
	},
	{
		// Move down between walls
		ctrlKey: true,
		key: 40,
		action: function() {
			if(metaBrick == null || metaBrick.model.getActiveWall() == null)
				return;

			let nextWalls = metaBrick.model.getNextAllOf(metaBrick.model.getActiveWall());
			let bottom = metaBrick.model.getActiveWall().view.getContainer().position().top + metaBrick.model.getActiveWall().view.getContainer().height();			
			let target = null;
			let i = 0;

			while(target == null && i < nextWalls.length) {
				let checkTop = nextWalls[i].view.getContainer().position().top;

				if(bottom < checkTop && checkIntersect(nextWalls[i].view.getContainer(), metaBrick.model.getActiveWall().view.getContainer()))
					target = nextWalls[i];

				i++;
			}

			if(target != null)
				metaBrick.model.setActiveWall(target);
		}
	},
	{
		// Move right between walls
		ctrlKey: true,
		key: 39,
		action: function() {			
			if(metaBrick == null)
				return;

			metaBrick.model.moveToNextWall();
		}
	},
	{
		// Move left between walls
		ctrlKey: true,
		key: 37,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.model.moveToPrevWall();
		}
	},
	{
		// Move to parent (left) within wall
		key: 37,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.model.moveToParentBrick();
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.model.moveToChildBrick();
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.model.moveToNextSiblingBrick();
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function() {
			if(metaBrick == null)
				return;

			metaBrick.model.moveToPrevSiblingBrick();
		}
	},
	/*{
		// Supr - remove brick
		key: 46,
		action: function() {
			let targetBrick = getNearestOfActiveBrickWithin(activeWall);
			let toRemoveBrick = getActiveBrickOf(activeWall);
			changeActiveBrickOf(activeWall, targetBrick);
			highlightBrick(getActiveBrickOf(activeWall));
			toRemoveBrick.dispose();
		}
	}*/
]);