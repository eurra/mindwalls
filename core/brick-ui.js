let EmptyBrick = require('./brick-api').EmptyBrick;

class EmptyBrickUI {
	constructor() {	
		this._brick = null;
	}

	get brick() { 
		return this._brick;
	}

	onInit(source) {
		this._brick = source;
		this.onValueSet();
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
	onDispose() {}
	onParentSet() {}	
	onValueSet() {}	
	onNameSet() {}
}

class BrickUI extends EmptyBrickUI {
	constructor() {
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
			append(childrenCont).
			data('brick-model', );
	}

	onInit(source) {
		this._ui.data('brick-model', source);
		super.onInit(source);
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

	onDispose() {
		ui.remove();
	}

	onParentSet() {
		this._brick.parent.ui.childrenContainer.append(this._ui);
	}
	
	onValueSet() {
		let val = this._brick.value;		
		let text;

		if(val === null)
			text = '?';
		else if(typeof val === 'number' && !Number.isSafeInteger(val))
			text = val.toFixed(2);
		else
			text = val.toString();

		this._valueLabel.html(text);
	}
	
	onNameSet() {
		let name = this._brick.name();

		if(name !== null)
			this._nameLabel.html(name).css('display', '');
		else
			this._nameLabel.html('').css('display', 'none');
	}

	static emptyBrick() {
		return new EmptyBrick(new EmptyBrickUI());
	}

	static from(elem) {
		if(elem.length == 0 || !elem.data('brick-model'))
			return BrickUI.emptyBrick;

		return elem.data('brick-model');
	}
}

module.exports = BrickUI;