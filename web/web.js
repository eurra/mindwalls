$(function() {
	let prog2 = require('../core/prog2');

	let exampleWalls = [
		{
			mainBrick: {
				type: 'function', id: '<', params: [
					{ type: 'literal', value: 45 },
					{
						type: 'function', id: '-', params: [
							{ type: 'literal', value: 133 },
							{ type: 'literal', value: 50 }							
						]
					}
				]	
			}
		},
		{			
			mainBrick: {
				type: 'function', id: '+',
				params: [
					{
						type: 'function', id: '-',
						params: [
							{ type: 'literal', value: 3 },
							{ type: 'literal', value: 5 }							
						]
					},
					{ type: 'literal', value: 12 }
				]
			}
		},
		{
			mainBrick: {
				type: 'function', id: '<',
				params: [
					{
						type: 'function', id: 'floor',
						params: [
							{
								name: 'of', type: 'function', id: '/',
								params: [
									{
										type: 'function', id: '+',
										params: [
											//{ type: 'literal', value: 3 },
											//{ type: 'literal', value: 50 }
										]
									},
									{ type: 'literal', value: 2.7 }
								]
							}									
						]
					},
					{ type: 'literal', value: 34 }
				]
			}
		}
	];

	let finalWalls = prog2.import.from(exampleWalls);
	prog2.generalUI.addWalls(finalWalls);
});