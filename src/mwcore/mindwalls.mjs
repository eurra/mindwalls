const deepFreeze = x => {
    Object.freeze(x);
    Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze);
    return x;
};

export class Brick {
    #printFunc = null;
    #name = 'no name';
    #mods;
    #eventHandlers;
    #eventListeners;

    constructor(mods, eventHandlers, eventListeners) {
        this.#mods = mods;
        this.#eventHandlers = eventHandlers;
        this.#eventListeners = eventListeners;
    }

    is(mod) {
        return this.#mods.has(mod);
    }

    trigger(eventId, ...args) {
        if (!this.#eventHandlers.has(eventId))
            throw `Event handler "${eventId}" is not registered in this brick.`;

        let listeners = this.#eventListeners.get(eventId);

        for (let i in listeners)
            listeners[i].bind(this)(...args);
    }

    toString() {
        if (this.#printFunc == null)
            return "" + this.getResult();

        return printFunc();
    }

    setPrinter(printer) {
        this.#printFunc = printer;
        return this;
    }
    
    setName(n) {
        this.#name = n;
        return this;
    }

    getName() {
        return this.#name;
    }
}

export function makeBuilder() {
    const defaultMods = new Map();

    return {
        loadForAll(...modDefs) {
            for(let i in modDefs) {
                let def = modDefs[i];

                if(def instanceof Array) {
                    let defMod = def[0];
                    let defArgs = def.slice(1, def.length);
                    defaultMods.set(defMod, ...defArgs);
                }
                else {
                    defaultMods.set(def, []);
                }
            }

            return this;
        },
        make(mainMod, ...args) {
            // Init loading structures
            let mods = new Set();
            let impls = new Map();    
            let implOrder = [];    
            let wraps = new Map();
            let eventHandlers = new Set();
            let eventListeners = new Map();

            eventHandlers.add('onBrickReady');

            // Create a build context for the loading process
            let buildCtx = {
                load(mod, ...args) {
                    if(!mods.has(mod)) {
                        mods.add(mod);                
                        let modSpec = (mod.bind(buildCtx))(...args);

                        if(!modSpec)
                            modSpec = {};

                        if(modSpec.implement) {
                            if(modSpec.implement.onlyForBuild) {
                                for(let [methodName, methodImpl] of Object.entries(modSpec.implement.onlyForBuild)) {
                                    if(!buildCtx[methodName])
                                        buildCtx[methodName] = methodImpl;
                                }
                            }

                            for(let [methodName, methodImpl] of Object.entries(modSpec.implement)) {
                                if(!impls.has(methodName)) {
                                    impls.set(methodName, methodImpl);
                                    implOrder.push(methodName);
                                }
                            }
                        }

                        if(modSpec.wrap) {
                            for(let [wrapName, wrapper] of Object.entries(modSpec.wrap)) {
                                let currWraps;
                    
                                if(wraps.has(wrapName)) {
                                    currWraps = wraps.get(wrapName);
                                }
                                else {
                                    currWraps = [];
                                    wraps.set(wrapName, currWraps);
                                }
                    
                                currWraps.push(wrapper);
                            }
                        }

                        if(modSpec.defineEventHandler) {
                            for(let i in modSpec.defineEventHandler) {
                                let handlerName = modSpec.defineEventHandler[i];

                                if(!eventHandlers.has(handlerName)) {
                                    eventHandlers.add(handlerName);
                                }
                            }
                        }

                        if(modSpec.addEventListener) {
                            for(let [lisName, listener] of Object.entries(modSpec.addEventListener)) {
                                let currListeners;
                    
                                if(!eventListeners.has(lisName)) {
                                    currListeners = [];
                                    eventListeners.set(lisName, currListeners);
                                }
                                else {
                                    currListeners = eventListeners.get(lisName);
                                }
                    
                                currListeners.push(listener);
                            }
                        }
                    }

                    return this;
                }
            };

            // Load default mods (which apply for any brick generated by this builder)
            for(let [defMod, defArgs] of defaultMods)
                buildCtx.load(defMod, ...defArgs);
            
            // Load the main mod
            buildCtx.load(mainMod, ...args);      

            if(!impls.has('getResult'))                
                throw 'Attached mods do not implement the method "getResult".';

            // Prepare the base brick instance
            let brick = new Brick(mods, eventHandlers, eventListeners);            

            // Load the implementations, based on their load order
            for(let i in implOrder) {
                let ext = impls.get(implOrder[i]);
                brick[implOrder[i]] = ext;                
            }

            // Load the implementation wrappers
            for(let [name, specificWraps] of wraps) {
                for(let i = specificWraps.length - 1; i >= 0; i--) {
                    let wrapper = specificWraps[i];
                    let currFunc = brick[name];

                    if(!currFunc)
                        throw `Tried to wrap the method "${name}", but it was not implemented.`;

                    brick[name] = function(...args) {
                        wrapper = wrapper.bind(brick);
                        currFunc = currFunc.bind(brick);
                        return wrapper(currFunc, ...args);
                    };
                }
            }
            
            // On all set, trigger ready event and return the instance
            brick.trigger('onBrickReady');
            return brick;
        }
    };
}

const MAP_DATA_ID = 'MAP_DATA_ID';
const ARRAY_DATA_ID = 'ARRAY_DATA_ID';

export function data() {
    let dataStore = {};

    return {
        implement: {
            onlyForBuild: {
                getShared(prop) {
                    return dataStore[prop];
                },
                share(prop, data) {
                    dataStore[prop] = data;
                    return data;
                },
                getStore() {
                    return dataStore;
                }
            }
        }
    };
}

export function tracking() {
    let trackedData = {};
    let trackers = new Set();

    return {
        defineEventHandler: [ 'onChangeTracked' ],
        implement: {
            track(data, trackId, changeFunc = null) {

                if(changeFunc)
                    changeFunc(); 

                if(trackedData[trackId] != data) { // The current value it's changing...

                    if(trackedData[trackId]) { // A value is currently set...
                        if(typeof trackedData[trackId] == 'object' && trackedData[trackId] instanceof Brick && trackedData[trackId].is(tracking))
                            trackedData[trackId].removeTracker(this);
                    }

                    if(data != null && data != undefined) { // A non null / non undefined data is being setted...
                        if(typeof data == 'object' && data instanceof Brick && data.is(tracking))
                            data.addTracker(this);
                    }
                    
                    trackedData[trackId] = data;
                    this.trigger('onChangeTracked', data, trackId);
                }

                return data;
            },            
            addTracker(tracker) {
                if(!trackers.has(tracker))
                    trackers.add(tracker);

                return this;
            },
            removeTracker(tracker) {
                if(trackers.has(tracker))
                    trackers.delete(tracker);

                return this;
            },
            getTrackers() {
                return Array.from(trackers);
            }
        }
    }
}

export function cached() {
    let cache = null;
    let outdated = true;

    return {
        addEventListener: {
        },
        implement: {
            update() {
                outdated = true;
                this.getResult();
            }
        },
        wrap: {
            getResult(wrapped) {
                if(outdated) {                
                    outdated = false;                
                    cache = wrapped();                
                }

                return cache;
            }
        }
    };
}

export function reactive() {
    this.load(tracking);
    this.load(cached);    

    return {
        addEventListener: {
            onChangeTracked() {
                this.update();

                for(let tracker of this.getTrackers())
                    tracker.trigger('onChangeTracked', this);
            }
        }
    };
}

export function _const(value) {
    return {
        implement: {
            getResult() {
                if(typeof value == 'object' && !Object.isFrozen(value))
                    deepFreeze(value);

                return value;
            }
        }
    };
}

export function _var(initVal = null) {
    let innerValue = initVal;
    const VAR_ID = 'VAR_ID';

    return {
        implement: {
            getResult() {
                return innerValue;
            },
            setValue(d) {
                this.track(d, VAR_ID, () => 
                    innerValue = d
                );

                return this;
            }
        }
    };
}

export function ref() {
    let target = null;
    const REF_ID = 'REF_ID';

    return {
        implement: {
            getResult() {                
                if(target)
                    return target.getResult();

                return null;
            },
            linkTo(brick) {
                this.track(brick, REF_ID, () => 
                    target = brick
                );

                return this;
            },
            getTarget() {
                return target;
            }
        }
    };
}

export function mapBased() {
    this.load(data);
    let mapData = this.share(MAP_DATA_ID, {});

    return {
        implement: {
            setProp(name, b_value) {
                this.track(b_value, name, () => 
                    mapData[name] = b_value
                );

                return this;
            },
            getProp(name) {
                return mapData[name];
            }
        }
    };
}

export function arrayBased() {
    this.load(data);
    let arrayData = this.share(ARRAY_DATA_ID, []);

    return {
        implement: {
            setPos: function(index, b_value) {
                this.track(b_value, index, () => 
                    arrayData.splice(index, 0, b_value)
                );

                return this;
            },
            append(b_value) {
                return this.setPos(arrayData.length, b_value);
            },
            remove(index) {
                this.track(null, index, () => 
                    arrayData.splice(index, 1)
                );

                return this;
            },
            getPos(index) {
                return arrayData[index];
            }
        }
    };
}

export function map() {
    this.load(mapBased);
    let mapData = this.getShared(MAP_DATA_ID);

    return {
        implement: {
            getResult() {            
                let res = {};
    
                for(let [prop, val] of Object.entries(mapData))
                    res[prop] = val.getResult();
    
                return res;
            }
        }
    };
}

export function array() {
    this.load(arrayBased);
    let arrayData = this.getShared(ARRAY_DATA_ID);

    return {
        implement: {
            getResult() {
                let res = [];
    
                for(let i in arrayData)
                    res[i] = arrayData[i].getResult();
    
                return res;
            }
        }
    };
}

export function mapFunc(initFunc) {
    this.load(map);
    let func = initFunc;
    const FUNC_ID = 'MAP_FUNC_ID';

    return {
        implement: {
            setFunction(f) {
                this.track(f, FUNC_ID, () => 
                    func = f
                );
            }
        },
        wrap: {
            getResult(wrapped) {
                let res = wrapped();
                return (func.getResult())(res);
            }
        }
    };
}

export function arrayFunc(initFunc) {
    this.load(array);
    let func = initFunc;
    const FUNC_ID = 'ARRAY_FUNC_ID';

    return {
        implement: {
            setFunction(f) {
                this.track(f, FUNC_ID, () => 
                    func = f
                );
            }
        },
        wrap: {
            getResult(wrapped) {
                let res = wrapped();
                return (func.getResult())(...res);
            }
        }
    };
}