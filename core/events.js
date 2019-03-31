
function createEventHandler(target, handlers) {
	let finalTarget = target;

	let trigger = function() {
		for(let i = 0; i < handlers.length; i++) {			
			handlers[i].apply(finalTarget, arguments);
		}
	};

	return {
		add: function(handler) {
			handlers.push(handler);
		},
		call: function() {
			trigger.apply(finalTarget, arguments);
		},
		clone: function() {
			return createEventHandler(finalTarget, handlers.slice(0));
		}
	};
}

module.exports = {
	create: function(target) {		
		return createEventHandler(target, []);
	}
}