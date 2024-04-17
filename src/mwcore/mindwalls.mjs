import * as coreMods from "./coreMods.mjs";

export function Brick() {};

const _brickBuilder = function() {
    let mods = new Set();
    let exts = new Map();
    let extsOrder = [];
    let wraps = new Map();
    let shared = new Map();
    let eventHandlers = new Set();
    let eventListeners = new Map();

    eventHandlers.add('onBrickReady');

    let innerBuilder = {
        load(...mods) {
            for(let i in mods)
                this.loadWithArgs(mods[i]);
        },
        loadWithArgs(mod, ...args) {
            if(!mods.has(mod)) {
                mods.add(mod);
                mod(this, ...args);                
            }
        },
        implement(name, func) {
            if(!exts.has(name)) {
                exts.set(name, func);
                extsOrder.push(name);
            }

            return this;
        },
        wrap(name, wrapper) {
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
        shareFrom(mod, data) {
            shared.set(mod, Object.assign({}, data));
            return this;
        },
        getSharedFrom(mod) {
            return shared.get(mod);
        },
        defineEventHandler(name) {
            if(!eventHandlers.has(name)) {
                eventHandlers.add(name);
            }

            return this;
        },
        addEventListener(name, listener) {
            let currListeners;

            if(!eventListeners.has(name)) {
                currListeners = [];
                eventListeners.set(name, currListeners);
            }
            else {
                currListeners = eventListeners.get(name);
            }

            currListeners.push(listener);
            return this;
        }
    };

    return Object.assign({
        ready: function() {
            if(!exts.has('getResult'))                
                throw 'Attached mods do not implement the method "getResult".';

            let brick = new Brick();

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
    }, innerBuilder);
};

let modsRepo = {
    output: coreMods.outputMod,
    dataMod: coreMods.dataMod,
    cache: coreMods.cacheMod,
    const: coreMods.constMod, 
    var: coreMods.varMod,
    ref: coreMods.refMod,
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
                    builder.loadWithArgs(modBuilder, ...defArgs);
                
                builder.loadWithArgs(modsRepo[prop], ...args)
                return builder.ready();
            };
        }
    };
};

export const mods = {
    register(id, modBuilder) {
        if(!modsRepo[id])
            modsRepo[id] = modBuilder;
    },
    getByName(name) {
        return modsRepo[name];
    }
};

export const loader = function() {
    let defaultMods = new Map();

    return {
        make: new Proxy({}, makeHandler(defaultMods)),
        setDefault(mod, ...args) {
            defaultMods.set(mod, args);
            return this;
        }            
    }
};