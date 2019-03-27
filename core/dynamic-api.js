module.exports = {
	create: function(replace = false) {
		let namespaces = {};
		let allHandlers = {};
		let target = {};

		return {
			add: function(namespace, name, handler) {
				if(!namespaces[namespace])
					namespaces[namespace] = new Map();

				let nsMap = namespaces[namespace];

				if(replace) {
					if(nsMap.has(name))
						nsMap.delete(name);

					nsMap.set(name, handler);
					allHandlers[name] = handler;					
				}
				else {
					if(!nsMap.has(name))
						nsMap.set(name, []);

					nsMap.get(name).push(handler);

					if(!allHandlers[name])
						allHandlers[name] = new Set();

					allHandlers[name].add(handler);
				}				

				if(!target[name]) {
					target[name] = function() {
						if(allHandlers[name]) {
							if(replace) {
								allHandlers[name].apply(null, arguments);
							}
							else {
								for(let j in allHandlers[name])
									allHandlers[name][j].apply(null, arguments);	
							}
						}							
					};
				}
			},
			clear: function(namespace) {
				if(!namespaces[namespace])
					return;

				let nsMap = namespaces[namespace];

				if(replace) {
					nsMap.forEach(function(name) {
						delete allHandlers[name];
						delete target[name];
					});
				}
				else {
					nsMap.forEach(function(name, handlers) {
						for(let i = 0; i < handlers.length; i++)
							allHandlers[name].delete(handlers[i]);

						if(allHandlers[name].size == 0) {
							delete allHandlers[name];							
							delete target[name];
						}
					});
				}

				delete namespaces[namespace];
			},			
			get target() {
				return target;
			}
		};
	}
}