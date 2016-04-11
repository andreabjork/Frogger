// -------------
// LOG PROTOTYPE
// -------------

function Log(descr) {
   this.cx = 0.0;
   this.cy = 0.0;
   this.vel = 1.0;
   this.width = 4.0;
   this.height = 4.0;
   this.setup(descr);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);
}

Log.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};


// -------
// GENERAL
// -------

Log.prototype.getPos = function() {
    return {posX: this.cx, posY: this.cy};
}

Log.prototype.getSpatialID = function() {
    return this.spatialID;
}

// ---------------
// COLLISION LOGIC
// ---------------


// -------------
// UPDATE RENDER
// -------------

Log.prototype.update = function(du) {
	spatialManager.unregister(this);

	spatialManager.register(this);
}


Log.prototype.render = function() {
}