var entityManager = {

	// "PRIVATE" DATA

	_frog : [new Frog({})], // may need changing
	_cars : [],
	_logs : [],

	// "PRIVATE" METHODS

	_forEachOf: function(aCategory, fn) {
		for (var i = 0; i < aCategory.length; ++i) {
			fn.call(aCategory[i]);
		}
	},

	// PUBLIC METHODS

	// Some things must be deferred until after initial construction
	// i.e. thing which need `this` to be defined.
	//
	deferredSetup : function () {
		this.resetAll();
		this.generateButterflies(controller.numButterflies);
		this._categories = [this._butterflies];
	},

	resetAll: function() {
		this._butterflies = [];
	},


	renderEnvironment : function(mv) {
		// Implement me
	},

	generateCar : function() {
		// Implement me
	},

	init: function() {

		for (var c = 0; c < this._categories.length; ++c) {
			var aCategory = this._categories[c];
			for (var i = 0; i < aCategory.length; ++i) {
				aCategory[i].init();
			}
		}
	},

	update: function(du) {
		for (var c = 0; c < this._categories.length; ++c) {
			var aCategory = this._categories[c];
			var i = 0;
			while (i < aCategory.length) {
				if(aCategory[i].update(du) === KILL_ME_NOW) aCategory.splice(i,1);
				else i++;
			}
		}
		mv = _frog[0].getMV();
	},

	render: function(gl) {
		for (var c = 0; c < this._categories.length; ++c) {
			var aCategory = this._categories[c];
			for (var i = 0; i < aCategory.length; ++i) {
				aCategory[i].render();
			}
		}
	}
};

// Some deferred setup which needs the object to have been created first
entityManager.deferredSetup();
