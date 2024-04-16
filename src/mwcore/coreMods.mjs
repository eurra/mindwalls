export const outputMod = function(builder, outputFunc = null) {
    if(outputFunc == null) {
        outputFunc = function() {
            return 'brick= ' + this.getResult();
        };
    }

    builder.implement('log', outputFunc);
};

const deepFreeze = x => {
    Object.freeze(x);
    Object.values(x).filter(x => !Object.isFrozen(x)).forEach(deepFreeze);
};

export const constMod = function(builder, value) {
    let innerVal = value;

    builder.implement('getResult', () => value);

    if(typeof innerVal == 'object')
        deepFreeze(innerVal);
};

export const cachedMod = function(builder) {
    let output = null;
    let changed = true;
    let listeners = new Set();

    builder.
        wrap('getResult', function(wrapped) {
            if(changed) {
                output = wrapped();
                changed = false;
            }

            return output;
        }).
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
        });
};

export const mapBasedMod = function(builder) {
    let data = {};

    builder.
        share('innerMap', data).
        implement('setProp', function(name, value) {
            data[name] = value;
            this.markChanged(value);
            return this;
        }).
        implement('getProp', function(name) {
            return data[name];
        });
};

export const arrayBasedMod = function(builder) {
    let data = [];

    builder.
        share('innerArray', data).
        implement('setPos', function(index, value) {
            data.splice(index, 0, value);
            this.markChanged(value);
            return this;
        }).
        implement('append', function(value) {
            return this.setPos(data.length, value);
        }).
        implement('getPos', function(index) {
            return data[index];
        });
};

export const varMod = function(builder, initVal = null) {
    let value = initVal;
    
    builder.
        implement('getResult', () => value).
        implement('setValue', function(d) {
            value = d;
            this.markChanged();
            return this;
        });
};

export const mapMod = function(builder) {
    let getData = builder.getShared('innerMap');

    builder.
        attach(mapBasedMod).
        implement('getResult', function() {
            let data = getData();
            let res = {};

            for(let [prop, val] of Object.entries(data))
                res[prop] = val.getResult();

            return res;
        });
};

export const arrayMod = function(builder) {
    let getData = builder.getShared('innerArray');

    builder.
        attach(arrayBasedMod).
        implement('getResult', function() {
            let data = getData();
            let res = [];

            for(let i in data)
                res[i] = data[i].getResult();

            return res;
        });
};

export const mapFuncMod = function(builder, func) {
    builder.
        attach(mapMod).
        wrap('getResult', function(wrapped) {
            let res = wrapped();
            return func(res);
        });
};

export const arrayFuncMod = function(builder, func) {
    builder.
        attach(arrayMod).
        wrap('getResult', function(wrapped) {
            let res = wrapped();            
            return func(...res);
        });
};