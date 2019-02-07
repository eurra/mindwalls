function setupModel(config = {}) {
	let baseModel = {
		onChildValueSet: (child) => {},
		onChildNameSet: (child) => {},
		onChildDisposed: (child) => {},
		onChildAdded: (child) => {}
	};

	return Object.assign(baseModel, config);
}

class EmptyBrick {
	constructor(ui) {
		this._ui = ui;
		this._model = setupModel();
	}

	dispose() {}
	get ui() { return this._ui;	}
	get model() { return this._model; }
	set model(model) { this._model = model; }	
	get parent() { return this; }	
	set parent(parent) {}	
	get value() { return null; }
	set value(value) {}
	get name() { return null; }
	set name(name) {}
	isEmpty() { return true; }
}

class Brick extends EmptyBrick {
	constructor(ui) { 
		super(ui);

		this._parent = new EmptyBrick(ui);
		this._value = null;
		this._name = null;

		ui.onInit(this);
	}

	dispose() {	
		ui.onDispose();
		this._parent.model.onChildDisposed(this);
	}

	get parent() {
		return this._parent;
	}

	set parent(parent) {
		this._parent = parent;
		ui.onParentSet();
		this._parent.model.onChildAdded(this);
	}

	get value() {
		return this._value;
	}

	set value(value) {
		this._value = val;
		ui.onValueSet();
		this._parent.onChildValueSet(this);
	}

	get name() { 
		return this._name;
	}

	set name(name) {
		this._name = name;
		ui.onNameSet();
		this._parent.onChildNameSet(this);
	}

	isEmpty() {
		return false; 
	}
}

module.exports = {
	EmptyBrick,
	Brick,
	//BrickUI,
	setupModel
};