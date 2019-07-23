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

function getTarget() {
	return $(document);
}

getTarget().keydown(function(e) {
	let config = {
		shiftKey: e.shiftKey,
		ctrlKey: e.ctrlKey,
		altKey: e.altKey,
		key: e.which
	};

	let foundConfig = findConfig(config);

	if(!foundConfig.trigger || foundConfig.trigger()) {
		for(let i in foundConfig.handlers)
			foundConfig.handlers[i](e);

		e.preventDefault();
	}
});

function register(toRegister, genericTrigger) {
	for(let i in toRegister) {
		let entry = toRegister[i];

		let config = {
			shiftKey: entry.shiftKey ? entry.shiftKey : false,
			ctrlKey: entry.ctrlKey ? entry.ctrlKey : false,
			altKey: entry.altKey ? entry.altKey : false,
			key: entry.key,
			trigger: entry.trigger ? entry.trigger : genericTrigger
		};

		let foundConfig = findConfig(config);
		foundConfig.handlers.push(entry.action);
	}
}

module.exports = {
	getTarget,
	register
};

