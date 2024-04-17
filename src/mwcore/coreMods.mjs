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

export const constMod = function(builder, value) {
    builder.implement('getResult', () => value);

    if(typeof value == 'object')
        deepFreeze(value);
};

export const varMod = function(builder, initVal = null) {
    let value = builder.data(initVal);
    
    builder.
        implement('getResult', () => this.data(value)).
        implement('setValue', function(d) {
            this.data(value).set(d);
            return this;
        });
};

export const refMod = function(builder, b_InitRef = null) {
    let ref = builder.data();
    
    builder.
        implement('getResult', () => this.data(ref) ? this.data(ref).getResult() : null).
        implement('setRef', function(b_ref) {
            this.data(ref).set(b_ref);
            return this;
        });
}

export const mapBasedMod = function(builder) {
    let mapData = builder.data({});

    builder.
        share('mapData', mapData).
        implement('setProp', function(name, b_value) {
            this.data(mapData)[name] = b_value;
            return this;
        }).
        implement('getProp', function(name) {
            return this.data(mapData)[name];
        });
};

export const arrayBasedMod = function(builder) {
    let arrData = builder.data([]);

    builder.
        share('arrData', arrData).
        implement('setPos', function(index, b_value) {
            this.data(arrData).splice(index, 0, b_value);
            return this;
        }).
        implement('append', function(b_value) {
            return this.setPos(this.data(arrData).length, b_value);
        }).
        implement('getPos', function(index) {
            return this.data(arrData)[index];
        });
};

export const mapMod = function(builder) {
    let mapData = builder.getShared('mapData');

    builder.
        attach(mapBasedMod).
        implement('getResult', function() {
            let data = this.data(mapData);
            let res = {};

            for(let [prop, val] of Object.entries(data))
                res[prop] = val.getResult();

            return res;
        });
};

export const arrayMod = function(builder) {
    let arrData = builder.getShared('arrData');

    builder.
        attach(arrayBasedMod).
        implement('getResult', function() {
            let data = this.data(arrData);
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