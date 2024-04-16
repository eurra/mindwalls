import * as coreMods from "./coreMods.mjs";

export function Brick() {};

const _brickBuilder = function() {
    let mods = new Set();
    let exts = new Map();
    let extsOrder = [];
    let wraps = new Map();
    let shared = new Map();

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
        share: function(name, data) {
            shared.set(name, data);
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
        share: innerBuilder.share,
        getShared: innerBuilder.getShared,
        ready: function() {
            if(!exts.has('getResult'))                
                throw 'Brick attached mods do not implement the method "getResult".';

            let brick = new Brick();
            let brickApi = {};

            let brickHandler = {
                get(target, prop, receiver) {                    
                    if(prop == 'is'){
                        return function(mod) {
                            return mods.has(mod);
                        };
                    }
                    else if(brickApi[prop]) {
                        return brickApi[prop].bind(receiver);
                    }
                    
                    return target[prop];
                }
            };

            for(let i in extsOrder) {
                let ext = exts.get(extsOrder[i]);
                brickApi[extsOrder[i]] = ext;
            }

            for(let [name, specificWraps] of wraps) {
                for(let i in specificWraps) {
                    let wrapper = specificWraps[i];
                    let currFunc = brickApi[name];

                    if(!currFunc)
                        throw `Tried to wrap the method "${name}", but it was not implemented.`;

                        brickApi[name] = function(...args) {
                        return wrapper(currFunc, ...args);
                    };
                }
            }

            console.log(brickApi);
            return new Proxy(brick, brickHandler);
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
    }
};

export const loader = function() {
    let defaultMods = new Map();

    return {
        make: new Proxy({}, makeHandler(defaultMods)),
        for: function(target) {

        },
        link: function(ref) {
            
        },
        setDefault: function(mod, ...args) {
            defaultMods.set(mod, args);
            return this;
        }            
    }
};