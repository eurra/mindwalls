let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'jq-generic',
	loader: function(setup) {
		setup.import(mw.bricks.jqContainer);

		let nameLabel = $('<div class="brick paramName"></div>');
		let nameCont = $('<div class="horizontal"></div>').append(nameLabel);
		let valueLabel = $('<div class="brick result"></div>');
		let valueCont = $('<div class="horizontal"></div>').append(valueLabel);
		let content = $('<div class="horizontal wide"></div>');
		let childrenCont = $('<div class="vertical"></div>');		
		let focusElem = content;

		setup.configure(function(brick) {
			brick.getContainer().
				addClass('horizontal').
				append(nameCont).
				append(valueCont).
				append(content).
				append(childrenCont);
		});

		setup.on('onDisposed', function() {
			this.getContainer().remove();
		});

		setup.on('onChildAdded', function(childBrick) {			
			this.getChildrenContainer().append(childBrick.getContainer());
		});

		setup.on('onValueSet', function() {
			let val = this.getValue();		
			let text;

			if(val == null)
				text = '?';
			else if(typeof val === 'number' && !Number.isSafeInteger(val))
				text = val.toFixed(2);
			else
				text = val.toString();

			this.getValueLabel().html(text);
		});

		setup.on('onNameSet', function() {
			let name = this.getName();

			if(name !== null)
				this.getNameLabel().html(name).css('display', '');
			else
				this.getNameLabel().html('').css('display', 'none');
		});

		setup.extend({
			setFocusElem: function(elem) {
				focusElem = elem;
			},
			getFocusElem: function() {
				return focusElem;
			},
			getContent: function() {
				return content;
			},
			getChildrenContainer: function() {
				return childrenCont;
			},
			getValueContainer: function() {
				return valueCont;
			},
			getValueLabel: function() {
				return valueLabel;
			},
			getNameContainer: function() {
				return nameCont;
			},
			getNameLabel: function() {
				return nameLabel;
			}
		});
	}
}