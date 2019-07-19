module.exports = {
	id: 'jq-generic',
	loader: function(setup) {
		let nameLabel = $('<div class="brick paramName"></div>');
		let nameCont = $('<div class="horizontal"></div>').append(nameLabel).css('display', 'none');
		let valueLabel = $('<div class="brick result"></div>');
		let valueCont = $('<div class="horizontal"></div>').append(valueLabel).css('display', 'none');

		setup.configure(function(brick) {
			brick.getView().
				addClass('horizontal').
				append(nameCont).
				append(valueCont).
				append(brick.getContent().addClass('horizontal wide'));

			if(brick.instanceOf('nested')) {
				brick.getView().append(brick.getChildrenContainer().addClass('vertical'));
			}
		});

		setup.on('onValueSet', function() {
			this.getValueLabel().html(this.getFormattedValue());
		});

		setup.on('onNameSet', function() {
			let name = this.getName();

			if(name != null)
				this.getNameLabel().html(name + ':');
		});

		setup.extend({
			getFormattedValue: function() {
				let val = this.getValue();		
				let text;

				if(val == null)
					text = '?';
				else if(typeof val === 'number' && !Number.isSafeInteger(val))
					text = val.toFixed(2);
				else
					text = val.toString();

				return text;
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