class EmptyBrickUI {
	constructor() {
	}

	init(brick) {
		brick.events.valueSet(brick);
	}
}

class EmptyJQBrickUI extends EmptyBrickUI {
	constructor() {
		super();
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
	static empty() {
		return new EmptyJQBrickUI();
	}

	static setDefaultEvents(registerEvent) {		
		registerEvent('disposed', function(brick) {
			brick.ui.container.remove();
		});

		registerEvent('childAdded', function(brick, childBrick) {			
			brick.ui.childrenContainer.append(childBrick.ui.container);
		});

		registerEvent('valueSet', function(brick) {
			let val = brick.value;		
			let text;

			if(val === null)
				text = '?';
			else if(typeof val === 'number' && !Number.isSafeInteger(val))
				text = val.toFixed(2);
			else
				text = val.toString();

			brick.ui.valueLabel.html(text);
		});


		registerEvent('nameSet', function(brick) {
			let name = brick.name;

			if(name !== null)
				brick.ui.nameLabel.html(name).css('display', '');
			else
				brick.ui.nameLabel.html('').css('display', 'none');
		});
	}

	static from(elem) {
		if(elem.length == 0 || !elem.data('brick-model'))
			return Brick.empty;

		return elem.data('brick-model');
	}

	constructor() {
		super();

		this._nameLabel = $('<div class="brick paramName"></div>');
		this._nameCont = $('<div class="horizontal"></div>').append(this._nameLabel);
		this._valueLabel = $('<div class="brick result"></div>');
		this._valueCont = $('<div class="horizontal"></div>').append(this._valueLabel);
		this._content = $('<div class="horizontal wide"></div>');
		this._childrenCont = $('<div class="vertical"></div>');		
		this._focusElem = this._content;

		this._ui = $('<div class="horizontal"></div>').
			append(this._nameCont).
			append(this._valueCont).
			append(this._content).
			append(this._childrenCont);
	}

	init(brick) {		
		this._ui.data('brick-model', brick);
		super.init(brick);
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