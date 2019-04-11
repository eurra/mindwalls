
module.exports = function() {
	let publicAPI = {};	
	let members = new Map();
	let loadedModules = new Set();	
	let savedModules = new Set();

	function loadModule(apiModule, config, newLoadedModules, 
						newMethods, newEvents, newEventHandlers, configHandlers,
						requiredActions) {

		if(newLoadedModules.has(apiModule.id))
			throw new Error(`API module already loaded: '${apiModule.id}'`);

		let setup = {
			import: function(importModule) {
				loadModule(
					importModule, 
					config, 
					newLoadedModules, 
					newMethods, 
					newEvents, 
					newEventHandlers, 
					configHandlers,
					requiredActions
				);
			},
			addEvents: function(events) {
				for(let i = 0; i < events.length; i++) {
					let handlers = [];

					newEvents.push({
						apiId: apiModule.id,
						name: events[i],
						type: 'event',
						addHandler: function(handler) {
							handlers.push(handler);
						},
						removeHandlers: function(ignoreSet = new Set()) {
							let newHandlers = [];

							for(let j = 0; j < handlers.length; j++) {
								if(ignoreSet.has(handlers[j].apiId))
									newHandlers.push(handlers[j]);
							}

							handlers = newHandlers;
						},
						trigger: function() {
							for(let i = 0; i < handlers.length; i++)			
								handlers[i].method.apply(publicAPI, arguments);
						},
						getHandlerCount: function() {
							return handlers.length;
						}
					});
				}
			},
			on: function(eventName, eventHandler) {
				newEventHandlers.push({
					apiId: apiModule.id,
					name: eventName,
					type: 'eventHandler',
					method: eventHandler
				});
			},
			extend: function(extendObj) {
				for(let methodName in extendObj) {
					newMethods.push({
						apiId: apiModule.id,
						name: methodName,
						type: 'method',
						method: extendObj[methodName]
					});
				}
			},
			configure: function(configHandler) {
				configHandlers.push(configHandler);
			},
			require: function(apiId, action) {
				requiredActions.push(() => {
					if(newLoadedModules.has(apiId))
						action();
				});
			}
		};

		apiModule.loader(setup, config);
		newLoadedModules.add(apiModule.id);
	}

	function load(apiModule, config = {}) {
		let newMethods = [];
		let newEvents = [];
		let newEventHandlers = [];		
		let newLoadedModules = new Set(loadedModules);
		let configHandlers = [];
		let requiredActions = [];

		loadModule(apiModule, config, newLoadedModules, newMethods, newEvents, newEventHandlers, configHandlers, requiredActions);

		for(let i = 0; i < requiredActions.length; i++)
			requiredActions[i]();

		let extendedAPI = Object.assign({}, publicAPI);
		let extendedMembers = new Map(members);

		// Extend methods
		for(let i = 0; i < newMethods.length; i++) {
			let newMethod = newMethods[i];

			if(extendedMembers.has(newMethod.name)) {
				let currMember = extendedMembers.get(newMethod.name);

				throw new Error(`Duplicated method identifier '${newMethod.name}' when loading module '${newMethod.apiId}': identifier loaded by '${currMember.apiId}', module triggered by '${apiModule.id}'`);
			}

			extendedMembers.set(newMethod.name, newMethod);
			extendedAPI[newMethod.name] = newMethod.method;
		}

		// Extend events
		for(let i = 0; i < newEvents.length; i++) { 
			let newEvent = newEvents[i];

			if(extendedMembers.has(newEvent.name)) {
				let currMember = extendedMembers.get(newEvent.name);

				if(currMember.type != 'event') {
					throw new Error(`Conflicting event identifier '${newEvent.name}' when loading module '${newEvent.apiId}': defined as event, but member is already loaded as method by '${currMember.apiId}', module triggered by '${apiModule.id})'`);
				}
				else {
					throw new Error(`Duplicated event identifier '${newEvent.name}' when loading module '${newEvent.apiId}': identifier loaded by '${currMember.apiId}', module triggered by '${apiModule.id}'`);
				}
			}

			extendedMembers.set(newEvent.name, newEvent);
			extendedAPI[newEvent.name] = newEvent.trigger;
		}

		// Extend event handlers
		for(let i = 0; i < newEventHandlers.length; i++) { 
			let newEventHandler = newEventHandlers[i];

			if(!extendedMembers.has(newEventHandler.name)) {
				console.log(`Conflicting event handler identifier '${newEventHandler.name}' when loading module '${newEventHandler.apiId}': no event has been loaded with such identifier`);
			}
			else {
				let currMember = extendedMembers.get(newEventHandler.name);

				if(currMember.type != 'event') {
					throw new Error(`Conflicting event handler identifier '${newEventHandler.name}' when loading module '${newEventHandler.apiId}': member is already loaded as method by '${currMember.apiId}', module triggered by '${apiModule.id})'`);
				}

				currMember.addHandler(newEventHandler);
			}
		}

		// Configure brick
		for(let member in extendedAPI)
			publicAPI[member] = extendedAPI[member];

		members = extendedMembers;
		loadedModules = newLoadedModules;

		for(let i = 0; i < configHandlers.length; i++)
			configHandlers[i](publicAPI);
	}

	function save() {
		savedModules = new Set(loadedModules);
	}

	function unload() {
		this.onBeforeUnload();

		loadedModules = new Set(savedModules);
		let membersToRemove = [];

		members.forEach(function(member, name) {
			if(!loadedModules.has(member.apiId)) {
				membersToRemove.push(name);
				delete publicAPI[name];
			}
			else if(member.type == 'event') {
				member.removeHandlers(loadedModules);
			}
		});

		for(let i = 0; i < membersToRemove.length; i++)
			members.delete(membersToRemove[i]);
	}

	load({
		id: 'core',
		loader: function(setup) {
			setup.addEvents([ 'onBeforeUnload' ]);

			setup.extend({
				load,
				save,
				unload,
				instanceOf: function(type) {
					return loadedModules.has(type);
				},
				getTypes: function() {
					return Array.from(loadedModules);
				},
				mustBe: function(type) {
					if(!this.instanceOf(type))
						throw new Error(`Brick type validation failed: '${type}'`);
				}
			});
		}
	});

	save();

	return publicAPI;
};