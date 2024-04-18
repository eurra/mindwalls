const VALUE_ID = 'VALUE_ID';
const REF_ID = 'REF_ID';
const MAP_DATA_ID = 'MAP_DATA_ID';
const ARRAY_DATA_ID = 'ARRAY_DATA_ID';

export const output = function(outputFunc = null) {
    let name = null;

    if(outputFunc == null) {
        outputFunc = function() {
            return `brick ${name ? `(${name}) ` : ''}= ${this.getResult()}`;
        };
    }

    return {
        implement: {
            print: outputFunc,
            setName(n) {
                name = n;
                return this;
            }
        }
    };
};

export const data = function() {
    let dataStore = {};

    return {
        defineEventHandler: [ 'onDataSet' ],
        implement: {
            getData(prop) {
                return dataStore[prop];
            },
            setData(prop, data) {
                dataStore[prop] = data;
                this.trigger('onDataSet', prop, data);
                return this;
            }
        }
    };
};

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

export const changeTracker = function(builder) {
    
}

export const cacheMod = function(builder) {
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
            },
            onDataSet(e, id, data) {
                //console.log(`Data set in Var brick using id "${VALUE_ID}"`)
            }
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

export const ref = function(b_InitRef = null) {
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

export const array = function(builder) {
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