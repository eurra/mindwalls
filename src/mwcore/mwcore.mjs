export function Brick() {};

export function checkBrick(val) {
    if(!(val instanceof Brick))
        throw 'Brick expected';

    return val;
}

export const BrickBuilder = function() {
    let mods = new Set();
    let exts = new Map();
    let extsOrder = [];
    let wraps = new Map();
    let shared = new Map();

    let innerBuilder = {
        require: function(mod, ...args) {
            if(!mods.has(mod)) {
                mods.add(mod);
                mod(this, ...args);                
            }

            return this;
        },
        extend: function(name, func) {
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
        require: innerBuilder.require,
        extend: innerBuilder.extend,
        wrap: innerBuilder.wrap,
        share: innerBuilder.share,
        getShared: innerBuilder.getShared,
        ready: function() {
            let brick = new Brick();

            brick.is = function(mod) {
                return mods.has(mod);
            };

            for(let i in extsOrder) {
                let ext = exts.get(extsOrder[i]);
                brick[extsOrder[i]] = ext;
            }

            for(let [name, specificWraps] of wraps) {
                for(let i in specificWraps) {
                    let wrapper = specificWraps[i];
                    let currFunc = brick[name];

                    brick[name] = function(...args) {
                        return wrapper(currFunc, ...args);
                    };
                }                
            }

            return brick;
        }
    };
};

/*const changeEmitter = function(builder) {
    let listeners = null;

    builder.
        extend('addListener', function(listener) {
            if(listeners == null)
                listeners = [];
    
            listeners.push(listener);
            return this;
        }).
        extend('emitChange', function() {
            if(listeners != null) {
                for(let i in listeners)
                    listeners[i].onEmmiterChange(this);
            }
        });
};

const changeListener = function(builder) {
    builder.extend('onEmmiterChange', () => {});
};

const deepFreeze = x => {
    Object.freeze(x);
    Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze);
};
*/

const BaseBrick = function(builder) {
    builder.
        /*extend('getResult', function() {
            return null;
        }).*/
        extend('toString', function() {
            return 'brick = ' + this.getResult();
        });
};

const ImmutableBrick = function(builder, value) {
    let innerVal = value;

    builder.
        require(BaseBrick).
        extend('getResult', () => value);

    if(typeof innerVal == 'object')
        deepFreeze(innerVal);
};

const CachedBrick = function(builder) {
    let output = null;
    let changed = true;
    let listeners = new Set();

    builder.
        require(BaseBrick).
        wrap('getResult', function(wrapped) {
            if(changed) {
                output = wrapped();
                changed = false;
            }

            return output;
        }).
        extend('addListener', function(target) {
            checkBrick(target);

            if(!listeners.has(target))
                listeners.add(target);
        }).
        extend('markChanged', function(source) {            
            changed = true;

            for(let listener of listeners)
                listener.markChanged();

            if(source && checkBrick(source) && source.is(CachedBrick))
                source.addListener(this);                
        });
};

const MapBasedBrick = function(builder) {
    let data = {};

    builder.
        require(CachedBrick).
        share('innerMap', data).
        extend('setProp', function(name, value) {
            checkBrick(value);
            data[name] = value;
            this.markChanged(value);
        }).
        extend('getProp', function(name) {
            return data[name];
        });
};

const ArrayBasedBrick = function(builder) {
    let data = [];

    builder.
        require(CachedBrick).
        share('innerArray', data).
        extend('setPos', function(index, value) {
            checkBrick(value);
            data.splice(index, 0, value);
            this.markChanged(value);
        }).
        extend('append', function(value) {
            this.setPos(data.length, value);
        }).
        extend('getPos', function(index) {
            return data[index];
        });
};

export function ConstBrick(builder, value) {
    builder.require(ImmutableBrick, value);
};

export function VarBrick(builder, initVal = null) {
    let value = initVal;
    
    builder.
        require(CachedBrick).
        extend('getResult', () => value).
        extend('setValue', function(d) {
            value = d;
            this.markChanged();
        });
};

export function MapBrick(builder) {
    let getData = builder.getShared('innerMap');

    builder.
        require(MapBasedBrick).
        extend('getResult', function() {
            let data = getData();
            let res = {};

            for(let [prop, val] of Object.entries(data))
                res[prop] = val.getResult();

            return res;
        });
};

export function ArrayBrick(builder) {
    let getData = builder.getShared('innerArray');

    builder.
        require(ArrayBasedBrick).
        extend('getResult', function() {
            let data = getData();
            let res = [];

            for(let i in data)
                res[i] = data[i].getResult();

            return res;
        });
};

export function MapFunctionBrick(builder, func) {
    builder.
        require(MapBrick).
        wrap('getResult', function(wrapped) {
            let res = wrapped();
            return func(res);
        });
};

export function ArrayFunctionBrick(builder, func) {
    builder.
        require(ArrayBrick).
        wrap('getResult', function(wrapped) {
            let res = wrapped();            
            return func(...res);
        });
};