module.exports = {
	builder: function() {
		let eventNames = new Set();
		let handlers = {};

		return {
			registerEvents: function(events) {
				for(let i = 0; i < events.length; i++)
					eventNames.add(events[i]);
			},
			addHandler: function(eventName, handler) {
				if(!handlers[eventName])
					handlers[eventName] = [];

				handlers[eventName].push(handler);
			},
			build: function() {
				let result = {};

				eventNames.forEach(function(elem) {
					result[elem] = function() {
						if(handlers[elem]) {
							for(let j in handlers[elem])
								handlers[elem][j].apply(null, arguments);
						}							
					};
				});

				return result;
			}
		};
	}
}