var entityManager = {

	// "PRIVATE" DATA

	_frog : [new Frog({lane: 0})], // may need changing
	_cars : [],
	_logs : [],
	_occupyingLane : [], // number of cars occupying the lane
    _laneCooldown : [], 
    _laneVelocity : [], // velocity for this lane
	_maxCarsPerLane : 5,
	_maxLogsPerLane : 3,
	_minCarsPerLane : 2,
	_minLogsPerLane : 1,
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
		for(var i = 0; i < nLanes; i++) {
            this._occupyingLane[i] = 0;
            this.laneCooldown = 0;
        }

        this._laneVelocity = [0.0, 0.2, -0.1, 0.3, 0.0, 0.1, -0.3, 0.2, -0.2];
	},

	generateCar : function(laneNum) {
		this._cars.push(new Car({lane: laneNum, vel: this._laneVelocity[laneNum], randColor: randomInt(1,3)}))
		this._occupyingLane[laneNum] = this._occupyingLane[laneNum]+1;
	},

	generateLog : function(laneNum) {
		if(randomInt(1,100)>70) this._logs.push(new Turtle({lane: laneNum, vel: this._laneVelocity[laneNum]}));
		else this._logs.push(new Log({lane: laneNum, vel: this._laneVelocity[laneNum]}));
		this._occupyingLane[laneNum] = this._occupyingLane[laneNum]+1;
	},

	generateRandomly : function(du) {
		var carLanesStart = 1;
		var logLanesStart = numCarLanes+2;
        // Iterate through all car lanes:
		for(var i = carLanesStart; i < carLanesStart+numCarLanes; i++) {
            // Return if cooldown hasn't finished:
            if(this._laneCooldown[i] > 0) {
                this._laneCooldown[i] = this._laneCooldown[i]-du; 
            } else {
            // If cooldown is ready and lane is not full, we have a 1% chance of generating a car:
				if(this._occupyingLane[i] < this._minCarsPerLane || (this.carLaneNotFull(i) && randomInt(1,100) > 99)){
					this.generateCar(i);
					this._laneCooldown[i] = this.getCarLaneCooldown(i);
				}
			}
		}

        // Iterate through all log lanes:
		for(var i = logLanesStart; i < logLanesStart+numLogLanes; i++) {
            // Return if cooldown hasn't finished:
            if(this._laneCooldown[i] > 0) {
                this._laneCooldown[i] = this._laneCooldown[i]-du; 
            } else {
            // If cooldown is ready and lane is not full, we have a 1% chance of generating a car:
				if(this._occupyingLane[i] < this._minLogsPerLane || (this.logLaneNotFull(i) && randomInt(1,100) > 99)){
					this.generateLog(i);
					this._laneCooldown[i] = this.getLogLaneCooldown(i);
				}
			}
		}
	},
	
	getCarLaneCooldown : function(lane) {
		return Math.abs(10/(this._laneVelocity[lane]>0?this._laneVelocity[lane]+(difficulty*speedIncr):this._laneVelocity[lane]-(difficulty*speedIncr)))
	},
	
	getLogLaneCooldown : function(lane) {
		return Math.abs(9/(this._laneVelocity[lane]>0?this._laneVelocity[lane]+(difficulty*speedIncr):this._laneVelocity[lane]-(difficulty*speedIncr)))
	},

	logLaneNotFull : function(lane) {
		return this._occupyingLane[lane] < this._maxLogsPerLane;
	},

	carLaneNotFull : function(lane) {
		return this._occupyingLane[lane] < this._maxCarsPerLane;
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
					if(aCategory[i] instanceof Car || aCategory[i] instanceof Log || aCategory[i] instanceof Turtle) {
						var laneNum = aCategory[i].getLane();
						this._occupyingLane[laneNum] = this._occupyingLane[laneNum]-1;
					}
					aCategory.splice(i,1);
				}
				else i++;
			}
		}

		this.generateRandomly(du);
	},

	render: function() {
		    gl.uniform1i( fRendLoc, 0);
    		gl.uniform1i( vRendLoc, 0);
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
