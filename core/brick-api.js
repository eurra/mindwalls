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
		let emptyBrickUI = BrickUI.empty();

		let emptyBrick = new EmptyBrick(
			emptyBrickUI,
			Brick.eventsBuilder().build()
		);

		emptyBrickUI.init(emptyBrick);
		return emptyBrick;
	}

	static eventsBuilder() {
		return eventHandler.builder([
			'valueSet', 'childValueSet',
			'nameSet', 'childNameSet',					
			'parentSet', 'childAdded',
			'disposed', 'childDisposed'
		]);
	}

	constructor(ui, events) {
		super(ui, events);

		this._parent = Brick.empty;
		this._value = null;
		this._name = null;
	}

	dispose() {	
		this.events.disposed(this);
		this._parent.events.childDisposed(this._parent, this);
	}

	get parent() {
		return this._parent;
	}

	set parent(parent) {
		this._parent = parent;

		this.events.parentSet(this);
		this._parent.events.childAdded(this._parent, this);
	}

	get value() {
		return this._value;
	}

	set value(value) {
		this._value = value;

		this.events.valueSet(this);
		this._parent.events.childValueSet(this._parent, this);
	}

	get name() { 
		return this._name;
	}

	set name(name) {
		this._name = name;

		this.events.nameSet(this);
		this._parent.events.childNameSet(this._parent, this);
	}

	isEmpty() {
		return false; 
	}
}

module.exports = Brick;