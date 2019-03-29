module.exports = {
	id: 'jq-container',
	loader: function(setup) {
		let container = $('<div>');

		setup.extend({
			getContainer: function() {
				return container;
			}
		});
	}
};