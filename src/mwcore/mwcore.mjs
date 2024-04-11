const builder = function() {
    let target = {
        attach: function(decorator, ...args) {
            decorator(this, ...args);
            return this;
        }
    }; 

    return target.attach(base);
};

const base = function(target) {
    let output = null;
    let outputProcessor = null; // Computes the brick data 
    let parent = null; // Parent brick
    let markChanged = true;

    target.getOutput = function() {
        if(markChanged) {
            output = outputProcessor ? outputProcessor() : null;
            markChanged = false;
        }

        return output;
    };

    target.setOutputProcessor = function(processor) {
        outputProcessor = processor;
    };

    target.setParent = function(p) {
        parent = p;
    };

    target.markChanged = function() {
        markChanged = true;
    }

    /*target.update = function(updateWall = true) {
        output = outputProcessor ? outputProcessor() : null;

        if(updateWall && parent && parent.onChildUpdated)
            parent.onChildUpdated(this, output);

        return output;
    };   */ 

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

    target.setData = function(d) {
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

        params.push(param);
        console.log(param);
        this.markChanged();
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