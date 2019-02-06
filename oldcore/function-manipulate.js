let actions = require('./action-handling');
//let traverse = require('./wall-traverse');

let brickData = [];
let brickDefs = {};

function loadFunctionDefs(repo) {
	for(let namespace in repo) {
		for(let name in repo[namespace]) {
			brickData.push({
				value: name,
				label: name,
				namespace: namespace,
				desc: repo[namespace][name].description
			});
		}
	}

	Object.assign(brickDefs, repo);
}

loadFunctionDefs(require('./default-functions'));

/*function configureArrayParams(funcBrick, def) {
	let min = def.paramSet.minRequired;

	if(min === undefined)
		min = 1;

	let toApp = funcBrick.children('div').last();

	for(let i = 0; i < min; i++) {
		toApp.append(`<div class="horizontal">
			<div class="brick data">...</div>
		</div>`);
	}

	return funcBrick;
}

function initFunctionBrick(id) {
	let def = brickDefs[id];

	if(def === undefined)
		def = brickDefs.Core[id];

	if(def === undefined)
		throw new Error(`No function found with id ${id}`);

	let funcBrick = 
		$(`<div class="horizontal">
				<div class="brick data">... =</div>
				<div class="brick funcName">${id}</div>
				<div class="vertical">
				</div>
			</div>`).
			data('brickData', {
				type: 'func',
				info: def
			});

	if(def.paramSet.type === 'array')
		funcBrick = configureArrayParams(funcBrick, def);

	traverse.getActiveBrick().parent().replaceWith(funcBrick);
	traverse.setActiveBrickWithin(funcBrick, traverse.getActiveWall());
}

$('body').append(`<div id="newBrickDialog" title="New computed brick...">
	<input id="brickFinder" style="width: 95%;" type="text" placeholder="Enter the name of a function, an alias, etc.."/>
</div>`);

$('#newBrickDialog').dialog({ 
	autoOpen: false,
	modal: true,
	resizable: false,
	draggable: false,
	minHeight: 10,
	minWidth: 10,
	open: function() {
		$('#brickFinder').val('');
	}
});

$('#brickFinder').
	autocomplete({
		source: brickData,
		delay: 0,
		select: function(event, ui) {
			$('#newBrickDialog').dialog('close');
			initFunctionBrick(ui.item.value);
			return false;
		}
	}).
	autocomplete('instance')._renderItem = function(ul, item) {
		return $('<li>').
			append(`<div>
				<div style="font-size: large; font-weight: bolder;">${item.label}</div>
				<div style="float: right; color: grey">${item.namespace}</div><br>
				<div style="font-style: italic; color: grey">${item.desc}</div>
			</div>`).
			appendTo(ul);
	};

actions.register([
	{
		// Insert a new brick
		key: 45,
		action: function() {
			let activeBrick = traverse.getActiveBrick();

			if(activeBrick.data('brickData') === undefined) {
				$('#newBrickDialog').
					dialog('option', 'position', {
						at: 'right bottom',
						my: 'left top',
						of: activeBrick
					}).
					dialog('open');
			}
		}
	}
]);*/

module.exports = {	
	register: function(repo) {
		if(repo.Core !== undefined)
			throw new Error('Cannot register functions with namespace "Core"');

		loadFunctionDefs(repo);
	}
};