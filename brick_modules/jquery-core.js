
module.exports = {
	'core.view.jq.base': function(setup) {
		let container = $('<div>');

		setup.extend(function() {
			return {
				view: {
					getContainer: function() {
						return container;
					}
				}
			};
		});
	},
	'core.view.jq.generic': function(setup) {	
		let nameLabel = $('<div class="brick paramName"></div>');
		let nameCont = $('<div class="horizontal"></div>').append(nameLabel);
		let valueLabel = $('<div class="brick result"></div>');
		let valueCont = $('<div class="horizontal"></div>').append(valueLabel);
		let content = $('<div class="horizontal wide"></div>');
		let childrenCont = $('<div class="vertical"></div>');		
		let focusElem = content;

		setup.configure(function(brick) {
			brick.view.getContainer().
				addClass('horizontal').
				append(nameCont).
				append(valueCont).
				append(content).
				append(childrenCont);
		});

		setup.on('disposed', function(brick) {
			brick.view.getContainer().remove();
		});

		setup.on('childAdded', function(brick, childBrick) {			
			brick.view.getChildrenContainer().append(childBrick.view.getContainer());
		});

		setup.on('valueSet', function(brick) {
			let val = brick.model.getValue();		
			let text;

			if(val === null)
				text = '?';
			else if(typeof val === 'number' && !Number.isSafeInteger(val))
				text = val.toFixed(2);
			else
				text = val.toString();

			brick.view.getValueLabel().html(text);
		});

		setup.on('nameSet', function(brick) {
			let name = brick.model.getName();

			if(name !== null)
				brick.view.getNameLabel().html(name).css('display', '');
			else
				brick.view.getNameLabel().html('').css('display', 'none');
		});

		setup.extend(function() {
			return {
				view: {
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
				}
			};				
		});
	}
};