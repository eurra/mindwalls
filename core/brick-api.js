let BrickUI = require('./brick-ui-api');
let eventHandler = require('./event-handler');

class EmptyBrick {
	constructor(ui, events) {
		this._ui = ui;
		this._events = events;
	}

	get ui() { 
		return this._ui;
	}

	get events() { 
		return this._events;
	}

	dispose() {}		
	get parent() { return this; }	
	set parent(parent) {}	
	get value() { return null; }
	set value(value) {}
	get name() { return null; }
	set name(name) {}
	isEmpty() { return true; }
}

class Brick extends EmptyBrick {
	static empty() {
		let emptyBrick = null;
		let emptyBrickUI = BrickUI.empty(() => emptyBrick);

		let emptyBrick = new EmptyBrick(
			emptyBrickUI,
			eventHandler.builder([
					'childValueSet',
					'childNameSet',
					'childDisposed',
					'childAdded'
				]).
				build()
		);

		emptyBrickUI.init();
		return emptyBrick;
	}

	static eventHandlerBuilder() {
		return eventHandler.builder([
			'childValueSet',
			'childNameSet',
			'childDisposed',
			'childAdded'
		]);
	}

	constructor(ui, events) {
		super(ui, events);

		this._parent = Brick.empty;
		this._value = null;
		this._name = null;
	}

	dispose() {	
		this.ui.events.dispose();
		this._parent.events.childDisposed(this);
	}

	get parent() {
		return this._parent;
	}

	set parent(parent) {
		this._parent = parent;

		this.ui.events.parentSet();
		this._parent.events.childAdded(this);
	}

	get value() {
		return this._value;
	}

	set value(value) {
		this._value = val;

		this.ui.events.valueSet();
		this._parent.events.childValueSet(this);
	}

	get name() { 
		return this._name;
	}

	set name(name) {
		this._name = name;

		this.ui.events.nameSet();
		this._parent.events.childNameSet(this);
	}

	isEmpty() {
		return false; 
	}
}

module.exports = Brick;