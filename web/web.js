$(function() {
	let mindwalls = require('../core/mindwalls');

	let examples = [
		{
			type: 'wall', params: [{
				type: 'function', id: '<', params: [
					{ type: 'literal', value: 45 },
					{
						type: 'function', id: '-', params: [
							{ type: 'literal', value: 133 },
							{ type: 'literal', value: 50 }							
						]
					}
				]	
			}]
		},
		{			
			type: 'wall', params: [{
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
			}]
		},
		{
			type: 'wall', params: [{
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
											{ type: 'literal', value: 3 },
											{ type: 'literal', value: 50 }
										]
									},
									{ type: 'literal', value: 2.7 }
								]
							}									
						]
					},
					{ type: 'literal', value: 34 }
				]
			}]
		},
		{ 
			type: 'wall' 
		}
	];

	let finalBricks = mindwalls.import.from(examples);
	mindwalls.generalUI.addWalls(finalBricks);
});