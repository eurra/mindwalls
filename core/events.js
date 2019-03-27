module.exports = {
	create: function() {
		let namespaces = {};
		let handlers = {};
		let target = {};

		return {
			addEvents: function(ns, events) {
				if(!namespaces[ns])
					namespaces[ns] = new Set();

				let nsObj = namespaces[ns];

				for(let i = 0; i < events.length; i++) {
					let eventName = events[i];
					nsObj.add(eventName);

					target[eventName] = function() {
						if(handlers[eventName]) {
							for(let j in handlers[eventName])
								handlers[eventName][j].apply(null, arguments);
						}							
					};
				}
			},
			removeEvents: function(ns) {
				if(!namespaces[ns])
					return;

				namespaces[ns].forEach(function(en) {
					delete handlers[en];
					delete target[en];
				});

				delete namespaces[ns];
			},
			addHandler: function(eventName, handler) {
				if(!handlers[eventName])
					handlers[eventName] = [];

				handlers[eventName].push(handler);
			},
			get target() {
				return target;
			}
		};
	}
}