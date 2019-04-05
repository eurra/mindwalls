module.exports = {
	get import() { return require('./brick-import'); },
	get generalUI() { return require('./general-ui'); },
	get actions() { return require('./actions'); },
	get functions() { return require('./functions'); },
	get events() { return require('./events'); },
	get dynamicAPI() { return require('./dynamic-api'); },
	get newbrick() { return require('./brick-creation'); },
	get bricks() {
		return {
			get proto() { return require('../brick_modules/proto'); },
			get empty() { return require('../brick_modules/empty'); },
			get nested() { return require('../brick_modules/nested'); },
			get meta() { return require('../brick_modules/meta'); },
			get jqGeneric() { return require('../brick_modules/jq-generic'); },
			get editable() { return require('../brick_modules/editable'); },
			get wall() { return require('../brick_modules/wall'); },
			get literal() { return require('../brick_modules/literal'); },
			get function() { return require('../brick_modules/function'); }
		};
	}
};