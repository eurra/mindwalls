$(function() {
	let mindwalls = require('../core/mindwalls');

	let examples = [
		{
			type: 'wall', childs: [{
				type: 'function', id: '<', childs: [
					{ type: 'literal', value: 45 },
					{
						type: 'function', id: '-', childs: [
							{ type: 'literal', value: 133 },
							{ type: 'literal', value: 50 }							
						]
					}
				]	
			}]
		},
		{			
			type: 'wall', childs: [{
				type: 'function', id: '+',
				childs: [
					{
						type: 'function', id: '-',
						childs: [
							{ type: 'literal', value: 3 },
							{ type: 'literal', value: 5 }							
						]
					},
					{ type: 'literal', value: 12 }
				]
			}]
		},
		{
			type: 'wall', childs: [{
				type: 'function', id: '<',
				childs: [
					{
						type: 'function', id: 'floor',
						childs: [
							{
								name: 'of', type: 'function', id: '/',
								childs: [
									{
										type: 'function', id: '+',
										childs: [
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

	//let finalBricks = mindwalls.import.from(examples);
	//mindwalls.generalUI.addWalls(finalBricks);

	let meta = mindwalls.import.from([ { type: 'meta' } ])[0];
	let walls = mindwalls.import.from(examples);
	meta.model.addWalls(walls);	
	mindwalls.generalUI.setMeta(meta);
});