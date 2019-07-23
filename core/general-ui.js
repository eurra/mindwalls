let mw = require('../core/mindwalls.js');

function checkIntersect(elem1, elem2) {
	let e1L = elem1.position().left;
	let e1R = e1L + elem1.width();

	let e2L = elem2.position().left;
	let e2R = e2L + elem2.width();

	return Math.max(e1L, e2L) < Math.min(e1R, e2R);
}

function getHorizontalDistance(elem1, elem2) {
	let e1m = elem1.position().left + (elem1.width() / 2);
	let e2m = elem2.position().left + (elem2.width() / 2);

	return Math.abs(e1m - e2m);
}

function getVerticalDistance(elem1, elem2) {
	let e1m = elem1.position().top + (elem1.height() / 2);
	let e2m = elem2.position().top + (elem2.height() / 2);

	return Math.abs(e1m - e2m);
}

function getPanelTitle() {
	return $('#info-display-title');
}

function getPanelContainer() {
	return $('#info-display');
}

function focus() {
	$('#metabrick-area').focus();
}

let uiModule = {
	id: 'general-ui',
	loader: function(setup) {
		let activeWall = null;
		let activeBricksMap = new Map();

		function getActiveBrickFromWall(wall) {
			let brick = null;

			if(activeBricksMap.has(wall)) {
				brick = activeBricksMap.get(wall);
			}
			else {
				brick = wall.getFirstChild();

				if(brick != null)
					activeBricksMap.set(brick, wall);
			}
			
			return brick;
		}

		function changeActiveBrickOfWall(ui, wall, brick) {
			if(brick != null && wall != null) {
				activeBricksMap.set(wall, brick);
				ui.onBrickActivation();
			}
		}

		function changeActiveWall(ui, wall) {
			if(wall != null) {
				wall.mustBe('wall');
				activeWall = wall;		

				ui.onBrickActivation();
				ui.onWallActivation();
			}
		}

		function getClosestBrickOf(ui, brick) {
			let currBrick = brick;						

			if(currBrick != null) {
				let parentBrick = currBrick.getParent();
				let closestBrick = parentBrick.getPrevSiblingOf(currBrick);

				if(closestBrick == null) {
					closestBrick = parentBrick.getNextSiblingOf(currBrick);

					if(closestBrick != null)
						changeActiveBrickOfWall(ui, activeWall, closestBrick);
					else if(!parentBrick.instanceOf('wall'))
						changeActiveBrickOfWall(ui, activeWall, parentBrick);
				}
				else {
					changeActiveBrickOfWall(ui, activeWall, closestBrick);	
				}
			}
		}

		function getClosestWall(nextWalls) {
			let target = null;
			let bestVerticalDist = 0;
			let bestHorizontalDist = 0;
			let i = 0;

			while(i < nextWalls.length) {
				if(checkIntersect(nextWalls[i].getView(), activeWall.getView())) {					
					let verticalDist = getVerticalDistance(nextWalls[i].getView(), activeWall.getView());

					if(target == null || (verticalDist <= bestVerticalDist)) {				
						let horizontalDist = getHorizontalDistance(nextWalls[i].getView(), activeWall.getView());

						if(target == null || horizontalDist < bestHorizontalDist) {
							target = nextWalls[i];
							bestVerticalDist = verticalDist;
							bestHorizontalDist = horizontalDist;
						}
					}
				}

				i++;
			}

			return target;
		}

		function updateBrickInfo(brick) {
			getPanelTitle().html('');
			getPanelContainer().html('');

			if(brick == null) {
				getPanelTitle().html('Select a brick to display info...');
			}
			else {
				getPanelTitle().html('Selected brick:');
				let allData = brick.getAllData();

				if(allData.length == 0) {
					getPanelContainer().html('No data related to brick');
				}
				else {
					for(let i in allData) {
						let dataObj = allData[i];

						$('<div class="metadataCont">').
							appendTo(getPanelContainer()).
							append([
								$('<div class="metadata metadataName">').append(dataObj.nameLabel),
								$('<div class="metadata metadataValue">').append(dataObj.value)
							]);
					}
				}
			}
		}

		setup.addEvents([
			'onBrickActivation', 'onWallActivation'
		]);

		setup.on('onChildAdded', function(child) {
			if(activeWall == null)			
				changeActiveWall(this, child);
		});

		setup.on('onBrickActivation', function() {
			if(activeWall == null)
				return;

			let brick = getActiveBrickFromWall(activeWall);

			$('.activeBrick').removeClass('activeBrick');

			if(brick != null)
				brick.getContent().addClass('activeBrick');

			updateBrickInfo(brick);
		});

		setup.on('onWallActivation', function() {
			if(activeWall == null)
				return;

			$('.activeWall').removeClass('activeWall');
			activeWall.getContent().addClass('activeWall');
		});

		setup.extend({
			getActiveBrick: function() {
				return getActiveBrickFromWall(activeWall);
			},
			changeActiveBrick: function(brick) {
				if(!brick.instanceOf('wall-member'))
					throw new Error('Cannot activate brick: must be a wall member instance');

				let containerWall = brick.getWall();

				if(!this.hasChild(containerWall)) {
					console.log(containerWall)
					throw new Error('Cannot activate brick: wall container is not child of loaded ui');
				}

				if(containerWall !== activeWall)
					changeActiveWall(this, containerWall);

				changeActiveBrickOfWall(this, containerWall, brick);
			},
			moveToUpperWall: function() {
				if(activeWall == null)
					return;

				let nextWalls = this.getPrevAllOf(activeWall);
				let target = getClosestWall(nextWalls);

				if(target != null)
					changeActiveWall(this, target);
			},
			moveToLowerWall: function() {
				if(activeWall == null)
					return;

				let nextWalls = this.getNextAllOf(activeWall);
				let target = getClosestWall(nextWalls);

				if(target != null)
					changeActiveWall(this, target);
			},
			moveToRightWall: function() {
				changeActiveWall(this,
					this.getNextSiblingOf(activeWall)
				);
			},
			moveToLeftWall: function() {
				changeActiveWall(this,
					this.getPrevSiblingOf(activeWall)
				);
			},
			moveToParentBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					if(parentBrick != null && !parentBrick.instanceOf('wall'))
						changeActiveBrickOfWall(this, activeWall, parentBrick);
				}
			},
			moveToChildBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);

				if(currBrick != null && currBrick.instanceOf('nested')) {							
					let childBrick = currBrick.getFirstChild();

					if(childBrick != null)
						changeActiveBrickOfWall(this, activeWall, childBrick);
				}
			},
			moveToNextSiblingBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					while(!parentBrick.instanceOf('wall') && parentBrick.getNextSiblingOf(currBrick) == null) {
						currBrick = parentBrick;
						parentBrick = currBrick.getParent();
					}

					currBrick = parentBrick.getNextSiblingOf(currBrick);

					if(currBrick !== null)
						changeActiveBrickOfWall(this, activeWall, currBrick);
				}
			},
			moveToPrevSiblingBrick: function() {
				if(activeWall == null)
					return;

				let currBrick = getActiveBrickFromWall(activeWall);						

				if(currBrick != null) {
					let parentBrick = currBrick.getParent();

					while(!parentBrick.instanceOf('wall') && parentBrick.getPrevSiblingOf(currBrick) == null) {
						currBrick = parentBrick;
						parentBrick = currBrick.getParent();
					}

					currBrick = parentBrick.getPrevSiblingOf(currBrick);

					if(currBrick !== null)
						changeActiveBrickOfWall(this, activeWall, currBrick);
				}
			},
			removeActiveBrick: function() {
				let currBrick = this.getActiveBrick();

				if(currBrick != null) {
					changeActiveBrickOfWall(this,
						activeWall,
						getClosestBrickOf(this, currBrick)
					);

					currBrick.dispose();
				}
			}
		});
	}
};

let metadataModule = {
	id: 'metadata',
	loader: function(setup) {
		let metadata = [];

		function resolveData(dataDef) {
			if(dataDef.staticVal != null)
				return dataDef.staticVal;
			else if(dataDef.dynVal != null)
				return dataDef.dynVal();

			return null;
		}

		setup.extend({
			addData: function(name, nameLabel, defaultValue) {
				let found = null;

				for(let i = 0; i < metadata.length; i++) {
					if(metadata[i].name == name)
						found = metadata[i];
				}

				if(found == null) {
					found = {
						name, nameLabel, defaultValue, 
						staticVal: null, 
						dynVal: () => null
					};

					metadata.push(found);
				}
				else {
					Object.assign(found, { nameLabel, defaultValue });
				}
			},
			getData: function(name) {
				for(let i = 0; i < metadata.length; i++) {
					if(metadata[i].name == name)
						return resolveData(metadata[i]);
				}

				return null;
			},
			getAllData: function() {
				let res = [];

				for(let i = 0; i < metadata.length; i++) {
					let val = resolveData(metadata[i]);

					res.push({
						name: metadata[i].name,
						nameLabel: metadata[i].nameLabel,
						value: val == null ? '?': val
					});
				}

				return res;
			},
			setStaticData: function(name, data) {
				if(!data)
					return;

				for(let i = 0; i < metadata.length; i++) {
					if(metadata[i].name == name) {
						metadata[i].staticVal = data;
						return;
					}
				}
			},
			setDynamicData: function(name, func) {
				if(!func)
					return;

				for(let i = 0; i < metadata.length; i++) {
					if(metadata[i].name == name) {
						metadata[i].dynVal = func;
						return;
					}
				}
			}
		});
	}
};

let activeUI = null;

module.exports = {
	metadata: metadataModule,
	focus,
	getActiveUI: function() {
		return activeUI;
	},
	getActiveBrick: function() {
		if(activeUI == null)
			return null;

		return activeUI.getActiveBrick();
	},
	displayWalls: function(walls) {
		let meta = mw.import.newBrick({ module: mw.bricks.meta, childs: [] });
		meta.load(uiModule);
		meta.addChilds(walls);

		$('#metabrick-area').empty().append(meta.getView());

		activeUI = meta;
		focus();
	},
	getPanelTitle, getPanelContainer,
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

mw.actions.register([
	{	// Move up between walls
		ctrlKey: true,
		key: 38,
		action: function() {
			activeUI.moveToUpperWall();
		}
	},
	{
		// Move down between walls
		ctrlKey: true,
		key: 40,
		action: function() {
			activeUI.moveToLowerWall();
		}
	},
	{
		// Move right between walls
		ctrlKey: true,
		key: 39,
		action: function() {
			activeUI.moveToRightWall();
		}
	},
	{
		// Move left between walls
		ctrlKey: true,
		key: 37,
		action: function() {
			activeUI.moveToLeftWall();
		}
	},
	{
		// Move to parent (left) within wall
		key: 37,
		action: function() {
			activeUI.moveToParentBrick();
		}
	},
	{
		// Move to child (right) within wall
		key: 39,
		action: function() {
			activeUI.moveToChildBrick();
		}
	},
	{
		// Move to next sibling (down) within wall
		key: 40,
		action: function() {
			activeUI.moveToNextSiblingBrick();
		}
	},
	{
		// Move to prev sibling (up) within wall
		key: 38,
		action: function() {
			activeUI.moveToPrevSiblingBrick();
		}
	},
	{
		// Supr - remove brick
		key: 46,
		action: function() {
			activeUI.removeActiveBrick();
		}
	}
], () => activeUI != null);