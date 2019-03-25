let modelBase = require('./model-base');
let jqContainer = require('./jq-container');

module.exports = {
	name: 'brick-base',
	loader: function(setup) {
		setup.import(modelBase);
		setup.import(jqContainer);
	}
}