let brickDefs = require('./brick-defs');

/*function buildParameterSet(def) {
	let requiredSet = [];
	let max = Number.MAX_SAFE_INTEGER;

	if(def.type === 'variable') {
		let min = 0;

		if(def.minParams !== undefined)
			min = def.minParams;

		if(def.maxParams !== undefined)
			max = def.maxParams;

		for(let i = 0; i < min; i++)
			requiredSet.push(new Parameter(true));

		return new VariableParameterSet(requiredSet, max);
	}
	else {
		throw new Error('Wrong parameter set type: ' + def.type);
	}
}

class ParameterSet {
	constructor(requiredSet) {
		this._params = requiredSet;		
	}

	get count() {
		return this._params.length;
	}

	getParam(id) {
		if(this._params[id] === undefined)
			throw new Error(`Undefined parameter id: ${id}`);

		return this._params[id];
	}

	addParam(id) {
		throw new Error('Non implemented method');
	}

	removeParam(id) {
		throw new Error('Non implemented method');
	}
}

class VariableParameterSet extends ParameterSet {
	constructor(requiredSet, max) {
		super(requiredSet);
		this._max = max;
	}

	canAddParam(id) {
		if(id === undefined)
			return this.count < this._max;

		return id <= this.count && id < this._max;
	}

	addParam(id) {
		if(!this.canAddParam(id))
			throw new Error(`Cannot add a new parameter (tried: ${id}, count: ${this.count}, max: ${this._max})`);

		if(id === undefined)
			this._params.push(new Parameter(false));
		else
			this._params.splice(id, 0, new Parameter(false));
	}

	canRemoveParam(id) {
		return id < this.count;
	}

	removeParam(id) {
		if(!this.canRemoveParam(id))
			throw new Error(`Cannot remove a parameter (tried: ${id}, count: ${this.count()})`);

		this._params.splice(id, 1);
	}

	resolve(resolver) {
		if(!this.isResolvable())
			throw new Error('Cannot resolve: required params still remaining');

		let finalParams = [];

		for(let i = 0; i < this.count; i++) {
			if(this._params[i].isSet())
				finalParams.push(this._params[i].value);
		}

		return resolver(finalParams);
	}
}

class NamedParameterSet extends ParameterSet {
	constructor(requiredSet, max) {
		super(requiredSet, max);
		this._paramsMap = {};

		for(let i in requiredSet)
			this._paramsMap[requiredSet[i].name] = requiredSet[i];
	}

	getParamByName(name) {
		return this._paramsMap[name];
	}
}*/

class Brick {
	constructor(parent) {
		this._parent = parent;
		this._value = null;
	}

	get value() {
		return this._value;
	}

	set value(val) {
		this._value = val;

		if(this._parent !== null)
			this._parent.onChildSet(this);
	}

	get parent() {
		return this._parent;
	}

	isSet() {
		return this._value != null;
	}

	onChildSet(child) {
		throw new Error('Non implemented method');
	}
}

class NumberBrick extends Brick {
	constructor(parent, num) {
		super(parent);
		this.value = num;
	}

	onChildSet(child) {
		return; // Terminal
	}
}

class ParameterBrick extends Brick {
	constructor(funcBrick, order, name = null) {
		super(funcBrick);

		this._order = order;
		this._name = name;
	}

	get name() {
		return this._name;
	}

	get order() {
		return this._order;
	}

	set order(order) {
		this._order = order;
		this.parent.onChildOrderSet(this);
	}

	onChildSet(child) {
		this.value = child.value;
	}
}

class FunctionBrick extends Brick {
	constructor(parent) {
		super(parent);
	}

	onChildOrderSet(child) {
		throw new Error('Non implemented method');
	}

	resolve() {
		throw new Error('Non implemented method');
	}

	/*get count() {
		return this._params.length;
	}

	getParam(id) {
		if(this._params[id] === undefined)
			throw new Error(`Undefined parameter id: ${id}`);

		return this._params[id];
	}

	addParam(id) {
		throw new Error('Non implemented method');
	}

	removeParam(id) {
		throw new Error('Non implemented method');
	}*/

	static create(opName) {
		if(brickDefs[opName] === undefined)
			throw new Error(`Cannot create brick: operation '${opName}' is not defined`);

		let def = brickDefs[opName];

		if(def.type === 'indexed') {
			let minParams = 0;

			if(def.minParams !== undefined)
				minParams = def.minParams;

			let func = new IndexedFunctionBrick(null, minParams, def.resolver);
			let params = [];

			for(let i = 0; i < minParams; i++)
				params.push(new ParameterBrick(func, i));

			return params;
		}
		else {
			throw new Error('Wrong parameter set type: ' + def.type);
		}
	}
}

class IndexedFunctionBrick extends FunctionBrick {
	constructor(parent, minParams, resolver) {
		super(parent, minParams);

		this._minParams = minParams;
		this._resolver = resolver;
		this._paramsSetCount = 0;
		this._paramValues = [];
	}

	onChildOrderSet(child) {
		this._paramValues[child.order] = child.value;
	}

	onChildSet(child) {
		this.onChildOrderSet(child);
		this._paramsSetCount++;

		if(this._paramsSetCount >= this._minParams)
			this.resolve();
	}

	resolve() {
		this.value = this._resolver(this._paramValues);
	}
}

/*class Brickkk {
	constructor(brickDef) {
		this._def = brickDef;
		this._paramSet = buildParameterSet(brickDef.parameterSet);
		this._alias = null;
		this._value = null;
		this._requiredSet = 0;
		this._requiredMinSet = this._paramSet.length;
	}

	addParam(id) {
		return this._paramSet.addParam(id);
	}

	removeParam(id) {
		return this._paramSet.removeParam(id);
	}

	getParamValue(id) {
		return this._paramSet.getParam(id).value;
	}

	setParamValue(id, value) {
		if(value === undefined)
			throw new Error('Cannot set a undefined value');

		this._paramSet.getParam(id).value = value;

		if(this._paramSet.getParam(id).isRequired())
			this._requiredSet++;

		if(this._requiredSet == this._requiredMinSet)
			this._paramSet.resolve(this._def.resolver);
	}

	static create(opName) {
		if(brickDefs[opName] === undefined)
			throw new Error(`Cannot create brick: operation '${opName}' is not defined`);

		return new Brick(brickDefs[opName]);
	}
}*/

module.exports = {
	FunctionBrick, NumberBrick
};