module.exports = {
	id: 'model-base',
	loader: function(setup) {
		let parent = null;
		let value = null;
		let name = null;

		setup.registerEvents([
			'childSetModified',
			'valueSet', 'childValueSet',
			'nameSet', 'childNameSet',					
			'parentSet', 'childAdded',
			'disposed', 'childDisposed'
		]);

		setup.extend(function(brick) {
			return {
				model: {
					dispose: function() {
						brick.events.disposed(brick);

						if(parent != null) {
							parent.events.childDisposed(parent, brick);
							parent.events.childSetModified(parent, brick);
						}
					},
					getParent: function() {
						return parent;
					},
					setParent: function(p) {
						parent = p;
						brick.events.parentSet(brick);

						if(parent != null) {
							parent.events.childAdded(parent, brick);
							parent.events.childSetModified(parent, brick);
						}
					},
					getValue: function() {
						return value;
					},
					setValue: function(v) {
						value = v;
						brick.events.valueSet(brick);

						if(parent != null) {
							parent.events.childValueSet(parent, brick);
							parent.events.childSetModified(parent, brick);
						}
					},
					getName: function() {
						return name;
					},
					setName: function(n) {
						name = n;
						brick.events.nameSet(brick);

						if(parent != null) {
							parent.events.childNameSet(parent, brick);
							parent.events.childSetModified(parent, brick);
						}
					}
				}
			};
		});
	}
};