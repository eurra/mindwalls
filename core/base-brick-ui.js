let Brick = require('./brick-api');

function BrickUI() {
	let nameLabel = $('<div class="brick paramName"></div>');
	let nameCont = $('<div class="horizontal"></div>').append(nameLabel);
	let valueLabel = $('<div class="brick result"></div>');
	let valueCont = $('<div class="horizontal"></div>').append(valueLabel);
	let content = $('<div class="horizontal wide"></div>');
	let childrenCont = $('<div class="vertical"></div>');	
	let brick = Brick.emptyBrick;
	let focusElem = content;

	let ui = $('<div class="horizontal"></div>').
		append(nameCont).
		append(valueCont).
		append(content).
		append(childrenCont).
		data('brick-model', Brick.emptyBrick);

	this.onInit = function(source) {
		brick = source;
		ui.data('brick-model', source);
		this.onValueSet();
	};

	this.setFocusElem = function(elem) {
		focusElem = elem;
		return this;
	};

	this.getFocusElem = function() {
		return focusElem;
	};

	this.getModel = function() {
		return brick;
	};

	this.getContainer = function() {
		return ui;
	};

	this.getContentContainer = function() {
		return content;
	};

	this.getChildrenContainer = function() {
		return childrenCont;
	};

	this.getValueContainer = function() {
		return valueCont;
	};

	this.getValueLabel = function() {
		return valueLabel;
	};

	this.getNameContainer = function() {
		return nameCont;
	};

	this.getNameLabel = function() {
		return nameLabel;
	};

	this.onDispose = function() {
		ui.remove();
	};

	this.onParentSet = function() {
		brick.getParent().getUI().getChildrenContainer().append(ui);
	};
	
	this.onValueSet = function() {
		let val = brick.getValue();		
		let text;

		if(val === null)
			text = '?';
		else if(typeof val === 'number' && !Number.isSafeInteger(val))
			text = val.toFixed(2);
		else
			text = val.toString();

		valueLabel.html(text);
	};
	
	this.onNameSet = function() {
		let name = brick.getName();

		if(name !== null)
			nameLabel.html(name).css('display', '');
		else
			nameLabel.html('').css('display', 'none');
	};
}

BrickUI.emptyUI = Object.assign(
	{
		setFocusElem: () => this,
		getFocusElem: () => $(),
		getContainer: () => $(),
		getContentContainer: () => $(),
		getChildrenContainer: () => $(),
		getValueContainer: () => $(),
		getValueLabel: () => $(),
		getNameContainer: () => $(),
		getNameLabel: () => $()
	},
	Brick.emptyUI
);

BrickUI.emptyBrick = Object.assign({},	
	Brick.emptyBrick,
	{
		getUI: () => BrickUI.emptyUI
	}
);

BrickUI.from = function(elem) {
	if(elem.length == 0 || !elem.data('brick-model'))
		return BrickUI.emptyBrick;

	return elem.data('brick-model');
};

module.exports = BrickUI;