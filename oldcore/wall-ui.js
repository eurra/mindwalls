

function getUI(wall) {
	let res = elem.data('wall-data');

	if(res === undefined)
		return emptyWall;

	return res;
}


function WallUI() {
	let ui = $('<div class="wall">');
	let mainBrick = $();

	function activateBrick(brick) {
		if(brick.getUI().length > 0) {
			activeBrick = brick;
			activeBrick.getMainElement().addClass('activeBrick');
		}		
	}

	function deactivateBrick(brick) {
		if(brick.getUI().length > 0) {			
			activeBrick.getMainElement().removeClass('activeBrick');
		}		
	}

	function changeActiveBrick(brick) {
		if(brick.getUI().length > 0) {
			activeBrick.getMainElement().removeClass('activeBrick');
			activeBrick = brick;
			activeBrick.getMainElement().addClass('activeBrick');
		}
	}

	this.getUI = function() {
		return ui;
	};

	this.activate = function() {
		activeWall.deactivate();

		ui.addClass('activeWall');
		isActive = true;
		activeWall = this;
		activateBrick(activeBrick);

		return this;
	};

	this.deactivate = function() {
		ui.removeClass('activeWall');
		isActive = false;
		activeWall = emptyWall;		
		deactivateBrick(activeBrick);

		return this;
	};

	this.setMainBrick = function(brick) {
		ui.append(brick.getUI());

		if(isActive)
			deactivateBrick(activeBrick);

		activeBrick = brick;

		if(isActive)
			activateBrick(activeBrick);

		mainBrick = brick;
		return this;
	};

	this.getMainBrick = function() {
		return mainBrick;
	}

	this.getNextWall = function() {
		return getWallOf(ui.next());
	};

	this.getPrevWall = function() {
		return getWallOf(ui.prev());
	};

	this.getUpperWall = function() {
		let top = ui.position().top;
		let target = $();

		ui.prevAll().each(function(i, e) {
			let checkBottom = $(e).position().top + $(e).height();

			if(checkBottom < top) {
				target = $(e);
				return false;
			}
		});

		return getWallOf(target);
	};

	this.getBottomWall = function() {
		let target = $();
		let bottom = ui.position().top + ui.height();

		ui.nextAll().each(function(i, e) {
			let checkTop = $(e).position().top;

			if(bottom < checkTop) {
				target = $(e);
				return false;
			}
		});

		return getWallOf(target);
	};

	this.moveToParentBrick = function() {
		changeActiveBrick(
			getBrickOf(activeBrick.getUI().parent().parent())
		);

		return this;
	};

	this.moveToFirstChildBrick = function() {
		changeActiveBrick(
			getBrickOf(activeBrick.getUI().children('div').last().children('div').first())
		);

		return this;
	};

	this.moveToNextSiblingBrick = function() {
		let nextPos = activeBrick.getUI().next();

		if(nextPos.length === 0 && !activeBrick.getUI().parent().is(ui)) {
			let closeParent = activeBrick.getUI().parent().parent();

			while(!closeParent.parent().is(ui) && closeParent.next().length === 0) {
				closeParent = closeParent.parent().parent();
			}

			if(!closeParent.parent().is(ui) && closeParent.next().length > 0) {
				let firstChild = closeParent.next();

				while(firstChild.children('div').last().children().length > 0) {
					firstChild = firstChild.children('div').last().children().first();
				}

				nextPos = firstChild;
			}
		}

		changeActiveBrick(getBrickOf(nextPos));
		return this;
	};

	this.moveToPrevSiblingBrick = function() {		
		let prevPos = activeBrick.getUI().prev();

		if(prevPos.length === 0 && !activeBrick.getUI().parent().is(ui)) {
			let closeParent = activeBrick.getUI().parent().parent();

			while(!closeParent.parent().is(ui) && closeParent.prev().length === 0) {
				closeParent = closeParent.parent().parent();
			}

			if(!closeParent.parent().is(ui) && closeParent.prev().length > 0) {
				let firstChild = closeParent.prev();

				while(firstChild.children('div').last().children().length > 0) {
					firstChild = firstChild.children('div').last().children().last();
				}

				prevPos = firstChild;
			}
		}

		changeActiveBrick(getBrickOf(prevPos));
		return this;
	};
}