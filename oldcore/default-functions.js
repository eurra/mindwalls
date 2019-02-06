module.exports = {
	Core: {
		'+': {
			name: 'Addition operation',
			description: 'Sum of numbers',
			paramSet: {
				type: 'array',
				minRequired: 2,
				resolver: function(args) {
					let res = 0;

					for(let i in args)
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
				minRequired: 2,
				resolver: function(args) {
					let res = 0;

					for(let i in args)
						res -= args[i];

					return res;
				}
			}
		},
		'<': {			
		},
		'value': {			
		},
		'floor': {			
		},
		'/': {			
		},
		'a': {
			name: 'Test 1',
			description: 'Test test Test test Test test',
		},
		'aa': {
			name: 'Test 2',
			description: 'Test test Test test Test test',
		},
		'aaa': { name: 'Test 2', description: 'Test test Test test Test test' },
		'aaaa': { name: 'Test 2', description: 'Test test Test test Test test' },
		'aaaaa': { name: 'Test 2', description: 'Test test Test test Test test' },
		'aaaaaa': { name: 'Test 2', description: 'Test test Test test Test test' },
		'aaaaaaa': { name: 'Test 2', description: 'Test test Test test Test test' },
		'aaaaaaaa': { name: 'Test 2', description: 'Test test Test test Test test' },
	},
	/*Math: {
		"floor": {
			type: "computed",
			paramSetType: "named",
			paramSetConfig: {
				"of": {
					required: true
				}
			},
			computer: function(args) {
				return Math.floor(args.of);
			}
		},
	}*/
}