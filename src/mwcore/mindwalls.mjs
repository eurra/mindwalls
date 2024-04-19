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
            //return `brick [${name}] = ${this.getResult()}`;
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

function brickBuilder() {
    let mods = new Set();
    let exts = new Map();    
    let extsOrder = [];    
    let wraps = new Map();
    let eventHandlers = new Set();
    let eventListeners = new Map();

    eventHandlers.add('onBrickReady');

    let ctxForBuild = {
        load(mod, ...args) {
            if(!mods.has(mod)) {
                mods.add(mod);                
                let modSpec = (mod.bind(ctxForBuild))(...args);

                if(!modSpec)
                    modSpec = {};

                if(modSpec.implement) {
                    if(modSpec.implement.onlyForBuild) {
                        for(let [methodName, methodImpl] of Object.entries(modSpec.implement.onlyForBuild)) {
                            if(!ctxForBuild[methodName])
                                ctxForBuild[methodName] = methodImpl;
                        }
                    }

                    for(let [methodName, methodImpl] of Object.entries(modSpec.implement)) {
                        if(!exts.has(methodName)) {
                            exts.set(methodName, methodImpl);
                            extsOrder.push(methodName);
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

    return Object.assign({
        ready() {
            if(!exts.has('getResult'))                
                throw 'Attached mods do not implement the method "getResult".';

            let brick = new Brick(mods, eventHandlers, eventListeners);            

            for(let i in extsOrder) {
                let ext = exts.get(extsOrder[i]);
                brick[extsOrder[i]] = ext;                
            }

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
            
            brick.trigger('onBrickReady');
            return brick;
        }
    }, ctxForBuild);
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

export function wall() {
    const defaultMods = new Map();
    let main = null;    

    return brickBuilder().load(function() {
        this.load(data);
        let ctx = this;

        return {
            implement: {
                make(mod, ...args) {
                    let builder = brickBuilder().load(function () {
                        return {
                            implement: {
                                onlyForBuild: {
                                    shareOnWall(prop, data) {
                                        return ctx.share(prop, data);
                                    },
                                    getSharedOnWall(prop) {
                                        return ctx.getShared(prop);
                                    }
                                }
                            }
                        };
                    });

                    for(let [defMod, defArgs] of defaultMods)
                        builder.load(defMod, ...defArgs);
                    
                    builder.load(mod, ...args)
                    return builder.ready();
                },
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
                setMain(brick) {
                    main = brick;
                    return this;
                },
                getResult() {
                    if(!main)
                        throw 'Main brick has not been set.'

                    return main.getResult();
                }
            }
        };
    }).ready();
}

const TRACK_STACK_ID = 'TRACK_STACK_ID';

export function tracking() {
    let trackSet = new Set();
    let trackStack = this.getSharedOnWall(TRACK_STACK_ID);

    if(trackStack == null) {
        trackStack = [];
        this.shareOnWall(TRACK_STACK_ID, trackStack);
    }

    return {
        implement: {
            getTracked() {
                return Array.from(trackSet);
            }
        },
        wrap: {
            getResult(wrapped) {     
                if(!trackStack) {
                    trackStack = [];
                }
                else if(trackStack.length > 0 && trackStack[trackStack.length - 1] != this) {                    
                    let dep = trackStack[trackStack.length - 1];
                    
                    if(!trackSet.has(dep)) {
                        trackSet.add(dep);                        
                    }                        
                }                

                trackStack.push(this);
                let res = wrapped();
                trackStack.pop();

                if(trackStack.length == 0)
                    trackStack = null;

                return res;
            }
        }
    };
}

/*function proxify(object, change) {
    // we use unique field to determine if object is proxy
    // we can't test this otherwise because typeof and
    // instanceof is used on original object
    if (object && object.__proxy__) {
         return object;
    }
    var proxy = new Proxy(object, {
        get: function(object, name) {
            if (name == '__proxy__') {
                return true;
            }

            return object[name];
        },
        set: function(object, name, value) {
            var old = object[name];
            if (value && typeof value == 'object') {
                // new object need to be proxified as well
                value = proxify(value, change);
            }
            object[name] = value;
            change(object, name, old, value);
        }
    });
    for (var prop in object) {
        if (object.hasOwnProperty(prop) && object[prop] &&
            typeof object[prop] == 'object') {
            // proxify all child objects
            object[prop] = proxify(object[prop], change);
        }
    }
    return proxy;
}

export const cacheMod = function() {
    builder.load(dataMod);
    let cache = null;
    let outdated = true;

    builder.
        addEventListener('onDataSet', function(e, id, data) {
            outdated = true;

            if(typeof data == 'object') {
                value = proxify(value, change);
            }
        }).
        wrap('getResult', function(wrapped) {
            if(outdated) {                
                outdated = false;                
                cache = wrapped();                
            }

            return cache;
        });
};*/

const deepFreeze = x => {
    Object.freeze(x);
    Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze);
};

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
    let value = initVal;

    return {
        implement: {
            getResult() {           
                return value;
            },
            setValue(d) {
                value = d;
                return this;
            }
        }
    };
}

export function ref() {
    let target = null;

    return {
        implement: {
            getResult() {
                if(target)
                    return target.getResult();

                return null;
            },
            linkTo(brick) {
                target = brick;;
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
                mapData[name] = b_value;
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
            setPos(index, b_value) {
                arrayData.splice(index, 0, b_value);
                return this;
            },
            append(b_value) {
                return this.setPos(arrayData.length, b_value);
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

export function mapFunc(func) {
    this.load(map);

    return {
        wrap: {
            getResult(wrapped) {
                let res = wrapped();
                return func(res);
            }
        }
    };
}

export function arrayFunc(func) {
    this.load(array);

    return {
        wrap: {
            getResult(wrapped) {
                let res = wrapped();
                return func(...res);
            }
        }
    };
}