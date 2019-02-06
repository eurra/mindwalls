
let functions = require('./function-register');

/*let emptyBrick = {
	getUI: () => $(),
	setContent: () => this,
	getMainElement: () => $(),
	getChildrenContainer: () => $(),
	setParentBrick: () => this,
	showValue: () => this,
	hideValue: () => this,
	getValue: () => null,
	setValue: () => this,
	getParamId: () => null,
	setParamId: () => this,
	onChildReport: () => this,
	reportParent: () => this
};*/

/*function getBrickOf(elem) {
	let res = elem.data('brick-data');

	if(res === undefined)
		return emptyBrick;

	return res;
}*/

/*function Brick() {
	let paramIdCont = $('<div class="horizontal"></div>');
	let valueCont = $('<div class="horizontal"></div>');
	let content = $('<div class="horizontal wide"></div>');
	let childrenCont = $('<div class="vertical"></div>');

	let ui = $('<div class="horizontal"></div>').
		append(paramIdCont).
		append(valueCont).
		append(content).
		append(childrenCont).
		data('brick-data', this);

	let mainElem = ui;
	let parentBrick = null;
	let value = null;
	let valueUI = $();
	let paramId = null;

	function updateValueUI() {
		let text = value === null ? '?': `${value}`;
		valueUI.html(text);
	}

	this.getUI = function() {
		return ui;
	};

	this.setContent = function(elem, mElem = elem) {
		content.empty();

		elem.each(function() {
			$(this).appendTo(content);
		});

		mainElem = mElem;
		return this;
	};

	this.showValue = function() {
		valueUI = $('<div class="brick result"></div>');
		valueCont.empty().append(valueUI);
		updateValueUI();

		return this;
	};

	this.hideValue = function() {
		valueUI = $();
		valueCont.empty();

		return this;
	};

	this.getMainElement = function() {
		return mainElem;
	};

	this.getChildrenContainer = function() {
		return childrenCont;
	};

	this.setParentBrick = function(pb) {
		parentBrick = pb;
		return this;
	};

	this.getValue = function() {
		return value;
	};

	this.setValue = function(val) {
		value = val;
		updateValueUI();

		return this;
	};

	this.getParamId = function() {
		return paramId;
	};

	this.setParamId = function(id) {
		paramId = id;
		paramIdCont.empty();

		if(id !== null)
			$(`<div class="brick paramName">${id}</div>`).appendTo(paramIdCont);

		return this;
	};

	this.reportParent = function() {
		if(parentBrick !== null)
			parentBrick.onChildReport(this);

		return this;
	};

	this.onChildReport = function() {};
}*/









function configureFunctionBrick(brick, data, output) {
	let def = functions.getDefinition(data.id, data.namespace);
	let content = $(`<div class="brick funcName">${data.id}</div>`);		
	brick.setContent(content).showValue();

	brick.getDefinition = function() {
		return def;
	};

	if(def.paramSet.type === 'array') {
		let childsVals = [];
		let unsetVals = {};

		brick.onChildReport = function(childBrick) {
			let childVal = childBrick.getValue();
			let childIndex = childBrick.getUI().index();
			childsVals[childIndex] = childVal;

			if(childVal === null)
				unsetVals[childIndex] = 1;
			else
				delete unsetVals[childIndex];

			let finalValue = null;
			let totalSet = childsVals.length - Object.keys(unsetVals).length;

			if(def.paramSet.cardinality === 'multiple' && (!def.paramSet.minRequired || totalSet >= def.paramSet.minRequired)) {
				let finalVals = [];
				let nextIndex = 0;

				for(let i = 0; i < childsVals.length; i++) {
					if(childsVals[i])
						finalVals[nextIndex++] = childsVals[i];
				}

				if(finalVals.length > 0)
					finalValue = def.paramSet.resolver(finalVals);
			}
			else if(def.paramSet.cardinality && totalSet === def.paramSet.cardinality) {
				let finalVals = [];
				let nextIndex = 0;

				for(let i = 0; i < childsVals.length; i++) {
					if(childsVals[i])
						finalVals[nextIndex++] = childsVals[i];
				}

				if(finalVals.length > 0)
					finalValue = def.paramSet.resolver.apply(null, finalVals);
			}

			brick.setValue(finalValue);
			brick.reportParent();
		};
	}

	return brick;
}

function configureLiteralBrick(brick, data) {
	let valueContainer = $('<div class="brick data"></div>');
	brick.setContent(valueContainer);

	let origSetValue = brick.setValue;

	brick.setValue = function(val) {
		origSetValue(val);
		valueContainer.html(val === null ? '?': val);
		brick.reportParent();
	}

	return brick;
}

function importBrick(currBrickData, parent, output) {
	if(currBrickData === undefined)
		return undefined;

	let newBrick = new Brick();

	if(currBrickData.type === 'function') {
		newBrick = configureFunctionBrick(newBrick, currBrickData, output);
	}
	else if(currBrickData.type === 'literal') {
		newBrick = configureLiteralBrick(newBrick, currBrickData);
	}

	if(parent !== null) {
		newBrick.getUI().appendTo(parent.getChildrenContainer());

		if(currBrickData.paramName)
			newBrick.setParamId(currBrickData.paramName);

		newBrick.setParentBrick(parent);
	}	

	if(currBrickData.value !== undefined)		
		newBrick.setValue(currBrickData.value);

	if(currBrickData.params && currBrickData.params.length > 0) {
		for(let i in currBrickData.params) {
			importBrick(currBrickData.params[i], newBrick, output);
		}
	}

	return newBrick;
}

function importWalls(wallsData) {
	for(let i in wallsData) {
		let wallData = wallsData[i];		
		let newWall;

		if(wallData.mainBrick) {
			let bricksOutput = {};

			newWall = (new Wall()).setMainBrick(
				importBrick(wallData.mainBrick, null, bricksOutput)
			);
		}

		newWall.getUI().appendTo('#mainContainer');

		if($('#mainContainer').children().length === 1) {
			newWall.activate();
			activeWall = newWall;
		}
	}
}

module.exports = {	
	import: importWalls	
};