module.exports = {
	'+': {
		name: 'Addition operation',
		description: 'Sum of numbers',
		paramSet: {
			type: 'array',
			cardinality: 'multiple',
			minRequired: 2,
			resolver: function(args) {
				let res = 0;

				for(let i = 0; i < args.length; i++)
					res += args[i];

				return res;
			}
		}			
	},
	'-': {
		name: 'Substraction operation',
		description: 'Substraction of numbers',
		paramSet: {
			type: 'array',
			cardinality: 'multiple',
			minRequired: 2,
			resolver: function(args) {
				let res = args[0];

				for(let i = 1; i < args.length; i++)
					res -= args[i];

				return res;
			}
		}
	},
	'/': {
		name: 'Division operation',
		description: 'Division of numbers',
		paramSet: {
			type: 'array',
			cardinality: 'multiple',
			minRequired: 2,
			resolver: function(args) {
				let res = args[0];

				for(let i = 1; i < args.length; i++)
					res /= args[i];

				return res;
			}
		}
	},
	'<': {
		name: 'Less than operator',
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
		name: 'Floor of a number',
		description: 'Returns nearest integer lower than the input',
		paramSet: {
			type: 'map',
			args: { 
				of: 'Number for which the floor will be calculated'
			},
			resolver: function(args) {
				return Math.floor(args.of);
			}
		}	
	}
};