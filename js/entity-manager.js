var entityManager = {

	// "PRIVATE" DATA

	_frog : [new Frog({lane: 0})], // may need changing
	_cars : [],
	_logs : [],
    KILL_ME_NOW : -1,

	// PUBLIC METHODS

	// Some things must be deferred until after initial construction
	// i.e. thing which need `this` to be defined.
	//
	deferredSetup : function () {
		this.resetAll();
		this._categories = [this._frog, this._cars, this._logs];
	},

	resetAll: function() {
		this._frog = [new Frog({lane: 0})];
		this._cars = [];
		this._logs = [];
	},

	generateCar : function() {
		this._cars.push(new Car({lane: Math.floor(Math.random()*numCarLanes)+1}))
	},

	generateLog : function() {
		this._logs.push(new log({lane: Math.floor(Math.random()*numLogLanes)+numCarLanes+2}))
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
				if(aCategory[i].update(du) === this.KILL_ME_NOW) aCategory.splice(i,1);
				else i++;
			}
		}
	},

	render: function(gl) {
		for (var c = 0; c < this._categories.length; ++c) {
			var aCategory = this._categories[c];
			for (var i = 0; i < aCategory.length; ++i) {
				aCategory[i].render(gl);
			}
		}
	}
};

// Some deferred set up which needs the object to have been created first
entityManager.deferredSetup();
