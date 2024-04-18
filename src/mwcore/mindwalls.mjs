import * as coreMods from "./basicMods.mjs";

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
    }    
};