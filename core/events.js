
class EventHandler {
	constructor(target, handlers = []) {
		this.finalTarget = target;
		this.handlers = handlers;

		this.trigger = function() {
			for(let i = 0; i < handlers.length; i++) {			
				handlers[i].apply(this.finalTarget, arguments);
			}
		};
	}

	add(handler) {
		this.handlers.push(handler);
	}

	call() {
		this.trigger.apply(this.finalTarget, arguments);
	}

	clone() {
		return new EventHandler(this.finalTarget, this.handlers.slice(0));
	}
}

module.exports = EventHandler;