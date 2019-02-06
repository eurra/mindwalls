let Wall = require('./wall-api');

function WallUI() {
	let emptySpan = $('<span>(empty)</span>').hide();

	let ui = $('<div class="wall">').
		on('DOMSubtreeModified',function() {
			if($(this).children('div').length === 0)
				emptySpan.show();
			else
				emptySpan.hide();
		}).
		data('wall-model', Wall.emptyWall).
		append(emptySpan);

	let wall = Wall.emptyWall;

	this.onInit = function(source) {
		wall = source;
		ui.data('wall-model', source);
	};

	this.onDispose = function() {
		ui.remove();
	};

	this.getModel = function(handler) {
		return wall;
	};

	this.getContainer = function() {
		return ui;
	};

	this.onMainBrickSet = function() {
		ui.append(wall.getMainBrick().getUI().getContainer());
	};
}

WallUI.emptyUI = Object.assign(
	{
		getContainer: () => $()
	},
	Wall.emptyUI
);

WallUI.emptyWall = Object.assign({},	
	Wall.emptyWall,
	{
		getUI: () => WallUI.emptyUI
	}
);

WallUI.from = function(elem) {
	if(elem.length === 0)
		return WallUI.emptyWall;

	return elem.data('wall-model');
};

module.exports = WallUI;