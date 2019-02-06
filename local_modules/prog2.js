let wallData = {};
let brickData = [];

let prog2 = function(plugin) {
	
	if(plugin.functionDefinitions !== undefined) {
		let funcDefs = plugin.functionDefinitions;
		// TODO: Better definition structure
		// TODO: Shield 'Core' namespace
		for(let namespace in funcDefs) {
			for(let name in funcDefs[namespace]) {
				brickData.push({
					value: name,
					label: name,
					namespace: namespace,
					desc: funcDefs[namespace][name].description
				});
			}
		}
	}

	
};

module.exports = prog2;