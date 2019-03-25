let funcDefs = {};

function loadDefs(repoName) {
	let repo = require('../functions/' + repoName);
	Object.assign(funcDefs, { [repoName]: repo });
}

loadDefs('core');

module.exports = {
	getDefinition: function(funcName, namespace) {
		if(namespace === undefined)
			namespace = 'core';

		if(funcDefs[namespace] === undefined)
			throw new Error(`Namespace not found: ${namespace}`);

		if(funcDefs[namespace][funcName] === undefined)
			throw new Error(`Function '${funcName}'' not found in namespace '${namespace}'`);

		return funcDefs[namespace][funcName];
	}
};