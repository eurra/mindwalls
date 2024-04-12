const builder = function(dataCfg) {
    let target = {};
    let output = null;
    let outputProcessor = null;

    target.getOutput = function() {
        output = outputProcessor ? outputProcessor() : null;

        return output;
    };

    target.setOutputProcessor = function(processor) {
        outputProcessor = processor;
    };

    target.markChanged = function() {
        markChanged = true;
    }

    target.toString = function() {
        return 'brick = ' + this.getOutput();
    }

    return target;
};

export function Const(value) {
    let target = builder();
    target.setOutputProcessor(() => value);

    return target;
}

export function Var() {
    let target = builder();
    let data = null;

    target.setVal = function(d) {
        data = d;
    };

    target.setOutputProcessor(() => data);
    return target;
}

export function ArrayFunction(func) {
    let target = builder();
    let params = [];

    target.addParam = function(param, pos = -1) {
        if(pos == -1)
            pos = params.length;

        params.push(this.asChild(param));
    };

    target.setOutputProcessor(function(){
        let finalParams = [];        
        params.forEach(val => finalParams.push(val ? val.getOutput() : null));

        return func(...finalParams)
    });

    return target;
}

export function ObjectFunction(func) {
    let target = builder();
    let params = {};

    target.addParam = function(name, param) {
        params[name] = param;
        this.markChanged();
    };

    target.setOutputProcessor(function(){
        let finalParams = {};

        for (let [key, value] of Object.entries(params)) {
            finalParams[key] = value.getOutput();
        }

        return func(finalParams);
    });

    return target;
}