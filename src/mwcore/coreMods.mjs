export const outputMod = function(builder, outputFunc = null) {
    let name = null;

    if(outputFunc == null) {
        outputFunc = function() {
            return `brick ${name ? `(${name}) ` : ''}= ${this.getResult()}`;
        };
    }    

    builder.
        implement('print', outputFunc).
        implement('setName', function(n) {
            name = n;
            return this;
        });
};

const deepFreeze = x => {
    Object.freeze(x);
    Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze);
};

export const dataMod = function(builder) {
    let dataStore = new Map();

    builder.
        defineEventHandler('onDataSet').
        implement('getData', function(id) {
            return dataStore.get(id);
        }).
        implement('setData', function(id, data) {
            dataStore.set(id, data);
            this.trigger('onDataSet', this, id, data);
            return this;
        });
}

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

export const changeTracker = function(builder) {
    
}

export const cacheMod = function(builder) {
    builder.load(dataMod);
    let cache = null;
    let outdated = true;

    builder.
        addEventListener('onDataSet', function(e, id, data) {
            outdated = true;

            /*if(typeof data == 'object') {
                value = proxify(value, change);
            }*/
        }).
        wrap('getResult', function(wrapped) {
            if(outdated) {                
                outdated = false;                
                cache = wrapped();                
            }

            return cache;
        })/*.
        implement('addListener', function(target) {
            if(!listeners.has(target))
                listeners.add(target);

            return this;
        }).
        implement('markChanged', function(source) {            
            changed = true;

            for(let listener of listeners)
                listener.markChanged();

            if(source && source.is(cachedMod))
                source.addListener(this);

            return this;
        })*/;
};

export const constMod = function(builder, value) {
    builder.implement('getResult', () => value);

    if(typeof value == 'object')
        deepFreeze(value);
};

export const varMod = function(builder, initVal = null) {
    builder.load(dataMod);
    let valueId = Symbol('var data');
    
    builder.
        addEventListener('onBrickReady', function() {
            this.setData(valueId, initVal);
        }).
        implement('getResult', function() {
            let res = this.getData(valueId);            
            return res;
        }).
        implement('setValue', function(d) {
            this.setData(valueId, d);
            return this;
        })/*.
        /*addEventListener('onDataSet', function(e, id, data) {
            console.log(`Data set in Var brick using id "${id.toString()}"`)
        })*/;
};

export const refMod = function(builder, b_InitRef = null) {
    builder.load(dataMod);
    let refId = Symbol('reference');
    
    builder.
        implement('getResult', function() {
            let target = this.getData(refId);

            if(target)
                return target.getResult();

            return null;
        }).
        implement('linkTo', function(b_ref) {
            this.setData(refId, b_ref);
            return this;
        }).
        implement('getLink', function() {
            return this.getData(refId);
        });
}

export const mapBasedMod = function(builder) {
    builder.load(dataMod);
    let mapDataId = Symbol('Map data');

    builder.
        shareFrom(mapBasedMod, { mapDataId }).
        addEventListener('onBrickReady', function() {
            this.setData(mapDataId, {});
        }).
        implement('setProp', function(name, b_value) {
            this.getData(mapDataId)[name] = b_value;
            return this;
        }).
        implement('getProp', function(name) {
            return this.getData(mapDataId)[name];
        });
};

export const arrayBasedMod = function(builder) {
    builder.load(dataMod);
    let arrDataId = Symbol('Array data');

    builder.
        shareFrom(arrayBasedMod, { arrDataId }).
        addEventListener('onBrickReady', function() {
            this.setData(arrDataId, []);
        }).
        implement('setPos', function(index, b_value) {
            this.getData(arrDataId).splice(index, 0, b_value);
            return this;
        }).
        implement('append', function(b_value) {
            return this.setPos(this.getData(arrDataId).length, b_value);
        }).
        implement('getPos', function(index) {
            return this.getData(arrDataId)[index];
        });
};

export const mapMod = function(builder) {
    builder.load(mapBasedMod);
    let mapDataId = builder.getSharedFrom(mapBasedMod).mapDataId;

    builder.
        implement('getResult', function() {            
            let data = this.getData(mapDataId);
            let res = {};

            for(let [prop, val] of Object.entries(data))
                res[prop] = val.getResult();

            return res;
        });
};

export const arrayMod = function(builder) {
    builder.load(arrayBasedMod);
    let arrDataId = builder.getSharedFrom(arrayBasedMod).arrDataId;

    builder.
        implement('getResult', function() {
            let data = this.getData(arrDataId);
            let res = [];

            for(let i in data)
                res[i] = data[i].getResult();

            return res;
        });
};

export const mapFuncMod = function(builder, func) {
    builder.load(mapMod);

    builder.
        wrap('getResult', function(wrapped) {
            let res = wrapped();
            return func(res);
        });
};

export const arrayFuncMod = function(builder, func) {
    builder.load(arrayMod);

    builder.
        wrap('getResult', function(wrapped) {
            let res = wrapped();
            return func(...res);
        });
};

