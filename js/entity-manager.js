var entityManager = {

	// "PRIVATE" DATA

	_frog : [new Frog({lane: 0})], // may need changing
	_cars : [],
	_logs : [],
	_occupyingLane : [],
	_maxLane : 2,
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

		var nLanes = numLogLanes + numCarLanes + 3;
		for(var i = 0; i < nLanes; i++) this._occupyingLane[i] = 0;
	},

	generateCar : function() {
		var randomLane = randomInt(1, 1+numCarLanes);
		var randomVel = randomInt(2, 6)/10; //speed varies from 0.2 to 0.6
		this._cars.push(new Car({lane: randomLane, vel: randomVel}))
		this._occupyingLane[randomLane] = this._occupyingLane[randomLane]+1;
	},

	generateLog : function() {
		var randomLane = randomInt(numCarLanes+2, numCarLanes+2+numLogLanes);
		var randomVel = randomInt(2, 6)/10; //speed varies from 0.2 to 0.6
		this._logs.push(new Log({lane: randomLane, vel: randomVel}))
		this._occupyingLane[randomLane] = this._occupyingLane[randomLane]+1;
	},

	generateRandomly : function() {
		var carLanesStart = 1;
		var logLanesStart = numCarLanes+2;
		for(var i = carLanesStart; i < carLanesStart+numCarLanes; i++) {
			if(this.laneNotFull(i)) this.generateCar();
		}

		for(var i = logLanesStart; i < logLanesStart+numLogLanes; i++) {
			if(this.laneNotFull(i)) this.generateLog();
		}
	},

	laneNotFull : function(lane) {
		return this._occupyingLane[lane] < this._maxLane;
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
				if(aCategory[i].update(du) === this.KILL_ME_NOW) {
					if(aCategory[i] instanceof Car || aCategory[i] instanceof Log) {
						var laneNum = aCategory[i].getLane();
						this._occupyingLane[laneNum] = this._occupyingLane[laneNum]-1;
					}
					aCategory.splice(i,1);
				}
				else i++;
			}
		}

		this.generateRandomly();
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
