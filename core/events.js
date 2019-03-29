
function createEventHandler(target, handlers) {
	let trigger = function() {
		for(let i = 0; i < handlers.length; i++)
			handlers[i].apply(target, arguments);
	};

	return {
		add: function(handler) {
			handlers.push(handler);
		},
		call: function() {
			trigger.apply(target, arguments);
		},
		clone: function() {
			return createEventHandler(target, handlers.slice(0));
		}
	};
}

module.exports = {
	create: function(target) {
		return createEventHandler(target, []);
	}
}