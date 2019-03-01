
let brickTypes = {};

module.exports = {
	create: function(type) {
		return new Proxy({}, {
			get: function(target, key, receiver) {
				let brickType = brickTypes[type];

				if(!brickType[key])
					throw new Error(`Operation '${key}' not defined for brick type ${type}`);

				return brickType[key];
			}
		});
	}
};