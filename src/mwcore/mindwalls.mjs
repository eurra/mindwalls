import * as coreMods from "./coreMods.mjs";

export function Brick() {};

function proxify(object, change) {
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

const _brickBuilder = function() {
    let mods = new Set();
    let exts = new Map();
    let extsOrder = [];
    let wraps = new Map();
    let shared = new Map();
    let brickData = new Map();

    let innerBuilder = {
        attach: function(mod, ...args) {
            if(!mods.has(mod)) {
                mods.add(mod);
                mod(this, ...args);                
            }

            return this;
        },
        implement: function(name, func) {
            if(!exts.has(name)) {
                exts.set(name, func);
                extsOrder.push(name);
            }

            return this;
        },
        wrap: function(name, wrapper) {
            let currWraps;

            if(wraps.has(name)) {
                currWraps = wraps.get(name);
            }
            else {
                currWraps = [];
                wraps.set(name, currWraps);
            }

            currWraps.push(wrapper);
            return this;
        },
        data: function(defaultVal = null) {
            let dataKey = Symbol();

            if(defaultVal)
                brickData.set(dataKey, defaultVal);

            return dataKey;
        },
        share: function(name, sym) {
            shared.set(name, sym);
            return this;
        },
        getShared: function(name) {
            return function() {
                if(shared.has(name))
                    return shared.get(name);
                
                return null;
            };
        }
    };

    return {
        attach: innerBuilder.attach,
        implement: innerBuilder.implement,
        wrap: innerBuilder.wrap,
        data: innerBuilder.data,
        share: innerBuilder.share,
        getShared: innerBuilder.getShared,
        ready: function() {
            if(!exts.has('getResult'))                
                throw 'Attached mods do not implement the method "getResult".';

            let brick = new Brick();

            brick.is = function(mod) {
                return mods.has(mod);
            };

            brick.data = function(sym) {
                if(sym)
                    return brickData.get(sym);

                return {
                    set: function(value) {
                        brickData.set(sym, value);
                    }
                };
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
                for(let i in specificWraps) {
                    let wrapper = specificWraps[i];
                    let currFunc = brick[name];

                    if(!currFunc)
                        throw `Tried to wrap the method "${name}", but it was not implemented.`;

                    brick[name] = function(...args) {
                        return wrapper(currFunc, ...args);
                    };
                }
            }

            console.log(brick);
            return brick;
        }
    };
};

let modsRepo = {
    output: coreMods.outputMod, 
    cached: coreMods.cachedMod,
    const: coreMods.constMod, 
    var: coreMods.varMod,
    mapBased: coreMods.mapBasedMod,
    map: coreMods.mapMod,
    mapFunc: coreMods.mapFuncMod,
    arrayBased: coreMods.arrayBasedMod,
    array: coreMods.arrayMod,
    arrayFunc: coreMods.arrayFuncMod    
};

let makeHandler = function(defaultMods) {
    return {
        get(target, prop, receiver) {
            if(!modsRepo[prop])
                throw `Mod "${prop}" not loaded.`;

            return function(...args) {
                let builder = _brickBuilder();

                for(let [modBuilder, defArgs] of defaultMods)
                    builder.attach(modBuilder, ...defArgs);
                
                return builder.attach(modsRepo[prop], ...args).ready();
            };
        }
    }    
};

export const mods = {
    register: function(id, modBuilder) {
        if(!modsRepo[id])
            modsRepo[id] = modBuilder;
    },
    getByName: function(name) {
        return modsRepo[name];
    }
};

export const loader = function() {
    let defaultMods = new Map();

    return {
        make: new Proxy({}, makeHandler(defaultMods)),
        link: function(ref) {
            
        },
        setDefault: function(mod, ...args) {
            defaultMods.set(mod, args);
            return this;
        }            
    }
};