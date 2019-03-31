let mw = require('../core/mindwalls.js');

module.exports = {
	id: 'jq-generic',
	loader: function(setup) {
		let nameLabel = $('<div class="brick paramName"></div>');
		let nameCont = $('<div class="horizontal"></div>').append(nameLabel).css('display', 'none');
		let valueLabel = $('<div class="brick result"></div>');
		let valueCont = $('<div class="horizontal"></div>').append(valueLabel).css('display', 'none');
		let content = $('<div class="horizontal wide"></div>');
		let childrenCont = $('<div class="vertical"></div>');

		setup.configure(function(brick) {
			brick.getView().
				addClass('horizontal').
				append(nameCont).
				append(valueCont).
				append(content).
				append(childrenCont);
		});

		setup.on('onChildAdded', function(childBrick) {			
			this.getChildrenContainer().append(childBrick.getView());
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

			if(name != null)
				this.getNameLabel().html(name);
		});

		setup.extend({
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