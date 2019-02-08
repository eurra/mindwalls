let eventHandler = require('./event-handler');

class EmptyBrickUI {
	constructor(brickGet, events) {	
		this._brickGet = brickGet;
		this._events = events;
	}

	get brick() {
		return this._brickGet();
	}

	get events() {
		return this._events;
	}

	init() {
		this.brick;
		this.events.valueSet();
	}
}

class EmptyJQBrickUI extends EmptyBrickUI {
	constructor(brickGet, events) {
		super(brickGet, events);
	}

	set focusElem(elem) {}
	get focusElem() { return $() }
	get container() { return $() }
	get contentContainer() { return $() }
	get childrenContainer() { return $() }
	get valueContainer() { return $() }
	get valueLabel() { return $() }
	get nameContainer() { return $() }
	get nameLabel() { return $() }
}

class JQBrickUI extends EmptyJQBrickUI {
	static empty(brickGet) {
		return new EmptyJQBrickUI(
			brickGet,
			eventHandler.builder([
					'dispose',
					'parentSet',
					'valueSet',
					'nameSet'
				]).
				build()
		);
	}

	static eventHandlerBuilder() {
		return eventHandler.builder([
				'dispose',
				'parentSet',
				'valueSet',
				'nameSet'
			]).
			addHandler('dispose', function(brick, ui) {
				ui.container.remove();
			}).
			addHandler('parentSet', function(brick, ui) {
				brick.parent.ui.childrenContainer.append(ui.container);
			}).
			addHandler('valueSet', function(brick, ui) {
				let val = brick.value;		
				let text;

				if(val === null)
					text = '?';
				else if(typeof val === 'number' && !Number.isSafeInteger(val))
					text = val.toFixed(2);
				else
					text = val.toString();

				ui.valueLabel.html(text);
			}).
			addHandler('nameSet', function(brick, ui) {
				let name = brick.name;

				if(name !== null)
					ui.nameLabel.html(name).css('display', '');
				else
					ui.nameLabel.html('').css('display', 'none');
			});
	}

	static from(elem) {
		if(elem.length == 0 || !elem.data('brick-model'))
			return Brick.empty;

		return elem.data('brick-model');
	}

	constructor(brickGet, events) {
		super(brickGet, events);

		this._nameLabel = $('<div class="brick paramName"></div>');
		this._nameCont = $('<div class="horizontal"></div>').append(nameLabel);
		this._valueLabel = $('<div class="brick result"></div>');
		this._valueCont = $('<div class="horizontal"></div>').append(valueLabel);
		this._content = $('<div class="horizontal wide"></div>');
		this._childrenCont = $('<div class="vertical"></div>');		
		this._focusElem = content;

		this._ui = $('<div class="horizontal"></div>').
			append(nameCont).
			append(valueCont).
			append(content).
			append(childrenCont);
	}

	init(brick) {		
		this._ui.data('brick-model', brick);
		super.init();
	}

	set focusElem(elem) {
		this._focusElem = elem;
	}

	get focusElem() {
		return this._focusElem;
	}

	get container() {
		return this._ui;
	}

	get contentContainer() {
		return this._content;
	}

	get childrenContainer() {
		return this._childrenCont;
	}

	get valueContainer() {
		return this._valueCont;
	}

	get valueLabel() {
		return this._valueLabel;
	}

	get nameContainer() {
		return this._nameCont;
	}

	get nameLabel() {
		return this._nameLabel;
	}
}

module.exports = JQBrickUI;