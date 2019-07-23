module.exports = {
	'+': {
		name: 'Addition',
		description: 'Sum of numbers',
		paramSet: {
			type: 'array',
			cardinality: 'multiple',
			minRequired: 2,
			resolver: function() {
				let res = 0;

				for(let i = 0; i < arguments.length; i++)
					res += arguments[i];

				return res;
			}
		}			
	},
	'-': {
		name: 'Substraction',
		description: 'Substraction of numbers',
		paramSet: {
			type: 'array',
			cardinality: 'multiple',
			minRequired: 2,
			resolver: function() {
				let res = arguments[0];

				for(let i = 1; i < arguments.length; i++)
					res -= arguments[i];

				return res;
			}
		}
	},
	'/': {
		name: 'Division',
		description: 'Division of numbers',
		paramSet: {
			type: 'array',
			cardinality: 'multiple',
			minRequired: 2,
			resolver: function() {
				let res = arguments[0];

				for(let i = 1; i < arguments.length; i++)
					res /= arguments[i];

				return res;
			}
		}
	},
	'<': {
		name: 'Less than',
		description: 'Returns true if the first argument is less than the second',
		paramSet: {
			type: 'array',
			cardinality: 2,
			resolver: function(a, b) {
				return a < b;
			}
		}			
	},
	'floor': {
		name: 'Floor of',
		description: 'Returns nearest integer lower than the input',
		paramSet: {
			type: 'map',
			args: { 
				of: { 
					desc: 'Number for which the floor will be calculated',
					required: true
				}
			},
			resolver: function(args) {				
				return Math.floor(args.of);
			}
		}	
	}
};