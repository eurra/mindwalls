export function Brick() {};

export const instance = function() {
    let defaultMods = new Map();

    return {
        make: function(mod, ...args) {
            let builder = brickBuilder();

            for(let [defMod, defArgs] of defaultMods)
                builder.load(defMod, ...defArgs);
            
            builder.load(mod, ...args)
            return builder.ready();
        },
        setDefault(...modDefs) {
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
        }            
    }
};

const brickBuilder = function() {
    let mods = new Set();
    let exts = new Map();
    let extsOrder = [];
    let wraps = new Map();
    let eventHandlers = new Set();
    let eventListeners = new Map();

    eventHandlers.add('onBrickReady');

    return {
        load(mod, ...args) {
            if(!mods.has(mod)) {
                mods.add(mod);
                let modSpec = mod(...args);

                if(modSpec.require) {
                    for(let i in modSpec.require) {
                        let requireSpec = modSpec.require[i];

                        if(requireSpec instanceof Array) {
                            let reqMod = requireSpec[0];
                            let reqArgs = requireSpec.slice(1, requireSpec.length);
                            this.load(reqMod, ...reqArgs);
                        }
                        else {
                            this.load(requireSpec);
                        }
                    }
                }

                if(modSpec.implement) {
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
        },
        ready() {
            if(!exts.has('getResult'))                
                throw 'Attached mods do not implement the method "getResult".';

            let brick = new Brick();
            let printFunc = null;
            let name = 'no name';

            brick.is = function(mod) {
                return mods.has(mod);
            };

            brick.trigger = function(eventId, ...args) {
                if(!eventHandlers.has(eventId))
                    throw `Event handler "${eventId}" is not registered in this brick.`;

                let listeners = eventListeners.get(eventId);

                for(let i in listeners)
                    listeners[i].bind(this)(...args);
            };

            brick.toString = function() {
                if(printFunc == null)
                    //return `brick [${name}] = ${this.getResult()}`;
                    return "" + this.getResult();
                
                return printFunc();
            };

            brick.setPrinter = function(printer) {
                printFunc = printer;
                return this;
            };

            brick.setName = function(n) {
                name = n;
                return this;
            };

            brick.getName = function() {
                return name;
            };

            /*brick.brick = function(b_brick) {
                if(!(b_brick instanceof Brick))
                    throw 'Brick expected';

                return b_brick;
            };*/

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
    }    
};

const VALUE_ID = 'VALUE_ID';
const REF_ID = 'REF_ID';
const MAP_DATA_ID = 'MAP_DATA_ID';
const ARRAY_DATA_ID = 'ARRAY_DATA_ID';

export const data = function() {
    let dataStore = {};

    return {
        //defineEventHandler: [ 'onDataSet' ],
        implement: {
            getData(prop) {
                return dataStore[prop];
            },
            setData(prop, data) {
                dataStore[prop] = data;
                //this.trigger('onDataSet', prop, data);
                return this;
            },
            getDataStore() {
                return dataStore;
            }
        }
    };
};

const dependencyStack = [];
const DEPS_SET_ID = 'DEPS_SET_ID';

export const callStack = function() {
    return {
        require: [ data ],
        addEventListener: {
            onBrickReady() {
                this.setData(DEPS_SET_ID, new Set());
            }
        },
        implement: {
            getTracked() {
                this.getResult();
                //console.log(this.getData(DEPS_SET_ID));
                return Array.from(this.getData(DEPS_SET_ID)).map((dep) => dep.getName());
            }
        },
        wrap: {
            getResult(wrapped) {                
                if(dependencyStack.length > 0 && dependencyStack[dependencyStack.length - 1] != this) {                    
                    let dep = dependencyStack[dependencyStack.length - 1];
                    let depsSet = this.getData(DEPS_SET_ID);
                    
                    if(!depsSet.has(dep)) {
                        console.log(this.getName() + ' => ' + dep.getName());
                        depsSet.add(dep);                        
                    }                        
                }                

                dependencyStack.push(this);
                let res = wrapped();
                dependencyStack.pop();

                return res;
            }/*,
            getData(wrapped, prop) {
                if (activeEffect) {
                    const effects = getSubscribersForProperty(target, key)
                    effects.add(activeEffect)
                }

                return wrapped(prop);
            },
            setData(wrapped, prop, data) {
                wrapped(prop, data);

                const effects = getSubscribersForProperty(target, key)
                effects.forEach((effect) => effect())
            }*/
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

export const _const = function(value) {
    return {
        implement: {
            getResult() {
                if(typeof value == 'object' && !Object.isFrozen(value))
                    deepFreeze(value);

                return value;
            }
        }
    };
};

export const _var = function(initVal = null) {
    return {
        require: [ data ],
        addEventListener: {
            onBrickReady() {
                this.setData(VALUE_ID, initVal);
            }/*,
            onDataSet(e, id, data) {
                console.log(`Data set in Var brick using id "${VALUE_ID}"`)
            }*/
        },
        implement: {
            getResult() {
                let res = this.getData(VALUE_ID);            
                return res;
            },
            setValue(d) {
                this.setData(VALUE_ID, d);
                return this;
            }
        }
    };
};

export const ref = function() {
    return {
        require: [ data ],
        implement: {
            getResult() {
                let target = this.getData(REF_ID);

                if(target)
                    return target.getResult();

                return null;
            },
            linkTo(b_ref) {
                this.setData(REF_ID, b_ref);
                return this;
            },
            getLink() {
                return this.getData(REF_ID);
            }
        }
    };
};

export const mapBased = function() {
    return {
        require: [ data ],
        addEventListener: {
            onBrickReady() {
                this.setData(MAP_DATA_ID, {});
            }
        },
        implement: {
            setProp(name, b_value) {
                this.getData(MAP_DATA_ID)[name] = b_value;
                return this;
            },
            getProp(name) {
                return this.getData(MAP_DATA_ID)[name];
            }
        }
    };
};

export const arrayBased = function() {
    return {
        require: [ data ],
        addEventListener: {
            onBrickReady() {
                this.setData(ARRAY_DATA_ID, []);
            }
        },
        implement: {
            setPos(index, b_value) {
                this.getData(ARRAY_DATA_ID).splice(index, 0, b_value);
                return this;
            },
            append(b_value) {
                return this.setPos(this.getData(ARRAY_DATA_ID).length, b_value);
            },
            getPos(index) {
                return this.getData(arrDataId)[index];
            }
        }
    };
};

export const map = function() {
    return {
        require: [ mapBased ],
        implement: {
            getResult() {            
                let data = this.getData(MAP_DATA_ID);
                let res = {};
    
                for(let [prop, val] of Object.entries(data))
                    res[prop] = val.getResult();
    
                return res;
            }
        }
    };
};

export const array = function() {
    return {
        require: [ arrayBased ],
        implement: {
            getResult() {            
                let data = this.getData(ARRAY_DATA_ID);
                let res = [];
    
                for(let i in data)
                    res[i] = data[i].getResult();
    
                return res;
            }
        }
    };
};

export const mapFunc = function(func) {
    return {
        require: [ map ],
        wrap: {
            getResult(wrapped) {
                let res = wrapped();
                return func(res);
            }
        }
    };
};

export const arrayFunc = function(func) {
    return {
        require: [ array ],
        wrap: {
            getResult(wrapped) {
                let res = wrapped();
                return func(...res);
            }
        }
    };
};