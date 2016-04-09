// -------------
// CAR PROTOTYPE
// -------------

function Car(descr) {
   // Must give this butterfly (cx, cy, cz) location, (rx, ry, rz) direction, velocity vel and rotWing wing angle.
   this.setup(descr);
}

Car.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};

Car.prototype.update = function(du) {
	
}


Car.prototype.render = function() {

}