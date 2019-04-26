let actions = [];

function findConfig(config) {
	let locatedConfig = null;
	let i = 0;

	while(locatedConfig === null && i < actions.length) {
		let checkConfig = actions[i];

		if(checkConfig.shiftKey == config.shiftKey && 
			checkConfig.ctrlKey == config.ctrlKey && 
			checkConfig.altKey == config.altKey && 
			checkConfig.key == config.key
		) {
			locatedConfig = checkConfig;
		}
		
		i++;
	}

	if(locatedConfig === null) {
		locatedConfig = Object.assign({ handlers: [] }, config);
		actions.push(locatedConfig);
	}

	return locatedConfig;
}

$(document).keydown(function(e) {
	let config = {
		shiftKey: e.shiftKey,
		ctrlKey: e.ctrlKey,
		altKey: e.altKey,
		key: e.which
	};

	let foundConfig = findConfig(config);

	if(foundConfig.targetResolver().is($(document.activeElement))) {
		for(let i in foundConfig.handlers)
			foundConfig.handlers[i](e);
	}

	e.preventDefault();
});

module.exports = {
	register: function(targetResolver, toRegister) {
		for(let i in toRegister) {
			let entry = toRegister[i];

			let config = {
				shiftKey: entry.shiftKey ? entry.shiftKey : false,
				ctrlKey: entry.ctrlKey ? entry.ctrlKey : false,
				altKey: entry.altKey ? entry.altKey : false,
				key: entry.key,
				targetResolver
			};

			let foundConfig = findConfig(config);
			foundConfig.handlers.push(entry.action);
		}
	}
};