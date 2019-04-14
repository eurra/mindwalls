let mw = require('../core/mindwalls');
//let apiMaker = require('../core/api-maker');

$(function() {
	let examples = [
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
			module: mw.bricks.wall, childs: [] 
		}
	];

	/*let examples = [
		{
			module: mw.bricks.wall, childs: [
				{ module: mw.bricks.literal, value: 133 },
				{ module: mw.bricks.literal, value: 50 }
			]
		},
		{ 
			module: mw.bricks.wall, childs: []
		}
	];*/

	//let finalBricks = mindwalls.import.from(examples);
	//mindwalls.generalUI.addWalls(finalBricks);

	let meta = mw.import.newBrick({ module: mw.bricks.meta, childs: [] });
	let walls = mw.import.walls(examples, meta);		
	mw.generalUI.setMeta(meta);
	meta.addChilds(walls);

	/*let test = apiMaker();

	test.load({
		id: 'module1',
		loader: function(setup) {
			setup.extend({
				test1: function(a) {
					console.log(a);
				},
				test2: function(a) {
					this.test1(a);
				}
			});
		}
	});

	test.save();

	test.load({
		id: 'module2',
		loader: function(setup) {
			setup.extend({
				test1: function() {
					console.log('hola');
				}
			});

			setup.on('onBeforeUnload', function() {
				console.log('unloading!');
			});
		}
	});

	global.test = test;
	console.log(test);*/
});