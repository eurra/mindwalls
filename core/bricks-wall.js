let Brick = require('./brick-api');

function Wall(ui) {
	let mainBrick = Brick.emptyBrick;

	this.getUI = function() {
		return ui;
	};

	this.dispose = function() {
		ui.onDispose();
		return this;
	};

	this.setMainBrick = function(brick) {
		mainBrick = brick;
		ui.onMainBrickSet();

		return this;
	};

	this.getMainBrick = function() {
		return mainBrick;
	};

	ui.onInit(this);
}

Wall.emptyWall = {
	getUI: () => Wall.emptyUI,
	dispose: () => {},
	setMainBrick: () => this,
	getMainBrick: () => Brick.emptyBrick
};

Wall.emptyUI = {
	getModel: () => Wall.emptyWall,
	onInit: () => {},
	onDispose: () => {},
	onMainBrickSet: () => this
};

module.exports = Wall;