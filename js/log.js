// -------------
// LOG PROTOTYPE
// -------------

function Log(descr) {
   // Must give this butterfly (cx, cy, cz) location, (rx, ry, rz) direction, velocity vel and rotWing wing angle.
   this.setup(descr);
}

Log.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};

Log.prototype.update = function(du) {
	}


Log.prototype.render = function() {
}