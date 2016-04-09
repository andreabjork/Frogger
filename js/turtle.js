// ----------------
// TURTLE PROTOTYPE
// ----------------

function Turtle(descr) {
   // Must give this butterfly (cx, cy, cz) location, (rx, ry, rz) direction, velocity vel and rotWing wing angle.
   this.setup(descr);
}

Turtle.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};

Turtle.prototype.update = function(du) {
	}


Turtle.prototype.render = function() {
}