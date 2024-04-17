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

export const cacheMod = function(builder) {
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
    builder.load(dataMod);
    let valueId = Symbol('var data');
    
    builder.
        implement('getResult', () => this.getData(valueId)).
        implement('setValue', function(d) {
            this.setData(valueId, d);
            return this;
        }).
        addEventListener('onDataSet', function(e, id, data) {
            console.log(`Data set in Var brick using id "${id}"`)
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
    builder.load(dataMod);
    let mapDataId = Symbol('Map data');

    builder.
        shareFrom(this, { mapDataId }).
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
    let shared = builder.getSharedFrom(arrayBasedMod);
    let arrDataId = shared.arrDataId;

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

