module.exports = {
	id: 'jq-container',
	loader: function(setup) {
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
	}
};