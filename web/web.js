let mw = require('../core/mindwalls');

$(function() {
	/*let examples = [
		{
			module: mw.bricks.wall, childs: [{
				module: mw.bricks.function, id: '<', childs: [
					{ module: mw.bricks.literal, value: 45 },
					{
						module: mw.bricks.function, id: '-', childs: [
							{ module: mw.bricks.literal, value: 133 },
							{ module: mw.bricks.literal, value: 50 }							
						]
					}
				]	
			}]
		},
		{			
			module: mw.bricks.wall, childs: [{
				module: mw.bricks.function, id: '+',
				childs: [
					{
						module: mw.bricks.function, id: '-',
						childs: [
							{ module: mw.bricks.literal, value: 3 },
							{ module: mw.bricks.literal, value: 5 }							
						]
					},
					{ module: mw.bricks.literal, value: 12 }
				]
			}]
		},
		{
			module: mw.bricks.wall, childs: [{
				module: mw.bricks.function, id: '<',
				childs: [
					{
						module: mw.bricks.function, id: 'floor',
						childs: [
							{
								name: 'of', module: mw.bricks.function, id: '/',
								childs: [
									{
										module: mw.bricks.function, id: '+',
										childs: [
											{ module: mw.bricks.literal, value: 3 },
											{ module: mw.bricks.literal, value: 50 }
										]
									},
									{ module: mw.bricks.literal, value: 2.7 }
								]
							}									
						]
					},
					{ module: mw.bricks.literal, value: 34 }
				]
			}]
		},
		{ 
			module: mw.bricks.wall 
		}
	];*/

	let examples = [
		{
			module: mw.bricks.wall, childs: [
				{ module: mw.bricks.literal, value: 133 },
				{ module: mw.bricks.literal, value: 50 }
			]
		},
		{ 
			module: mw.bricks.wall 
		}
	];

	//let finalBricks = mindwalls.import.from(examples);
	//mindwalls.generalUI.addWalls(finalBricks);

	let meta = mw.import.from([ { module: mw.bricks.meta } ])[0];
	let walls = mw.import.from(examples);
	meta.addWalls(walls);	
	mw.generalUI.setMeta(meta);
});