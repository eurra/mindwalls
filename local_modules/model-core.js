class Brick {
	constructor() {
		this._parent = null;
		this._value = null;
		this._alias = null;
	}

	get parent() {
		return this._parent;
	}

	set parent(parent) {
		this._parent = parent;

		if(this._parent !== null && this._value !== null)
			this._parent.onChildValueSet(this);
	}

	get value() {
		return this._value;
	}

	set value(value) {
		if(this._value === null && value === null)
			return;

		this._value = value;

		if(this._parent !== null) {
			if(value !== null)
				this._parent.onChildValueSet(this);
			else
				this._parent.onChildValueUnset(this);
		}
	}

	get alias() {
		return this._alias;
	}

	set alias(alias) {
		this._alias = alias;
	}

	onChildValueSet(child) {}

	onChildValueUnset(child) {}
}

class FunctionBrick extends Brick {
	constructor(id, name, description) {
		super();

		this._id = id;
		this._name = name;
		this._description = description;
	}

	get id() {
		return this._id;
	}

	get name() {
		return this._name;
	}

	get description() {
		return this._description;
	}
}

class ParameterBrick extends Brick {
	constructor(id) {
		super();
		this._id = id;
	}

	get id() {
		return this._id;
	}

	onChildValueSet(child) {
		this.value = child.value;
	}

	onChildValueUnset(child) {
		this.value = null;
	}
}

class ArrayBrick extends FunctionBrick {
	constructor(id, name, description, resolver, minParams) {
		super(id, name, description);

		this._resolver = resolver;
		this._minParams = minParams;

		this._paramsValues = [];		
		this._paramsSetCount = 0;
	}

	onChildValueSet(child) {
		if(this._paramsValues[child.id] === undefined)
			this._paramsSetCount++;

		this._paramsValues[child.id] = child.value;		

		if(this._paramsSetCount >= this._minParams)
			this.value = this._resolver(this._paramsValues);
	}

	onChildValueUnset(child) {
		if(this._paramsValues[child.id] !== undefined) {
			delete this._paramsValues[child.id];
			this._paramsSetCount--;

			if(this._paramsSetCount < this._minParams)
				this.value = null;
		}	
	}
}

class MapBrick extends FunctionBrick {
	constructor(id, name, description, resolver, requiredKeys, allKeys) {
		super(id, name, description);

		this._resolver = resolver;
		this._paramsValues = {};
		this._requiredKeys = requiredKeys;
		this._allKeys = allKeys;
		this._requiredKeysSet = 0;
	}

	onChildValueSet(child) {
		if(this._requiredKeys[child.id] !== undefined && this._paramsValues[child.id] === undefined)
			this._requiredKeysSet++;

		this._paramsValues[child.id] = child.value;		

		if(this._requiredKeysSet >= Object.keys(this._requiredKeys).length)
			this.value = this._resolver(this._paramsValues);
	}

	onChildValueUnset(child) {
		if(this._paramsValues[child.id] !== undefined) {
			if(this._requiredKeys[child.id] !== undefined)
				this._requiredKeysSet--;

			delete this._paramsValues[child.id];

			if(this._requiredKeysSet < Object.keys(this._requiredKeys).length)
				this.value = null;
		}	
	}
}

let defs = require('./core-bricks');

module.exports = {
	create: {
		literal: function(value = null) {
			let nb = new Brick();
			nb.value = value;

			return nb;
		},
		func: function(id) {
			let def = defs[id];

			if(def === undefined)
				def = defs.Core[id];

			if(def === undefined)
				throw new Error(`No function found with id ${id}`);

			if(def.paramSet.type === 'array') {
				return new ArrayBrick(
					id, def.name, def.description, 
					def.paramSet.resolver, def.paramSet.minRequired
				)
			}
		},
		param: function(id, arg = null) {
			let np = new ParameterBrick(id);

			if(arg !== null)
				arg.parent = np;

			return np;
		}
	}
}