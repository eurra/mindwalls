function Brick(ui) {
	let parent = Brick.emptyBrick;
	let value = null;
	let name = null;
	let index = null;

	this.getUI = function() {
		return ui;
	};

	this.dispose = function() {
		ui.onDispose();

		if(parent !== null)
			parent.onChildDisposed(this);

		return this;
	};

	this.setParent = function(p) {
		parent = p;
		ui.onParentSet();

		if(parent !== null)
			parent.onChildAdded(this);

		return this;
	};

	this.getParent = function() {
		return parent;
	};

	this.setValue = function(val) {
		value = val;
		ui.onValueSet();

		if(parent !== null)
			parent.onChildValueSet(this);

		return this;
	};

	this.getValue = function() {
		return value;
	};

	this.setName = function(n) {
		name = n;
		ui.onNameSet();

		if(parent !== null)
			parent.onChildNameSet(this);

		return this;
	};

	this.getName = function() {
		return name;
	};

	this.setIndex = function(i) {
		index = i;
	};

	this.getIndex = function() {
		return index;
	};

	this.isEmpty = function() {
		return false;
	};

	this.onChildValueSet = function() {};
	this.onChildNameSet = function() {};
	this.onChildDisposed = function() {};
	this.onChildAdded = function() {};

	ui.onInit(this);
}

Brick.emptyBrick = {
	getUI: () => Brick.emptyUI,
	dispose: () => this,
	setParent: () => this,
	getParent: () => this,
	getValue: () => null,
	setValue: () => this,
	getName: () => null,
	setName: () => this,
	onChildValueSet: () => {},
	onChildNameSet: () => {},
	onChildDisposed: () => {},
	onChildAdded: () => {},
	isEmpty: () => true
};

Brick.emptyUI = {
	getModel: () => Brick.emptyBrick,
	onInit: () => {},
	onDispose: () => {},
	onParentSet: () => {},
	onValueSet: () => {},
	onNameSet: () => {}	
};

module.exports = Brick;