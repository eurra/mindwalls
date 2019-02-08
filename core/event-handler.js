module.exports = {
	builder: function(triggers) {
		let handlers = {};
		let result = {};

		for(let i in triggers) {
			let triggerName = triggers[i];
			handlers[triggerName] = [];

			result[triggerName] = function() {
				for(let j in handlers[triggerName])
					handlers[triggerName][j].apply(null, arguments);
			};
		}

		return {
			addHandler: function(triggerName, handler) {
				if(!handlers[triggerName])
					throw new Error(`Invalid trigger name: ${triggerName}`);

				handlers[triggerName].push(handler);
			},
			build: function() {
				return result;
			}
		};
	}
}