/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Fiðrildi sem blakar vængjunum.  Hægt er að snúa með
//     músinni og færa til með upp- og niður-örvum (eða
//     músarhjóli).
//
//    Hjálmtýr Hafsteinsson, febrúar 2016
/////////////////////////////////////////////////////////////////

// --------------
// FROG PROTOTYPE
// --------------
function Frog(descr) {
   // Must give this butterfly (cx, cy, cz) location, (rx, ry, rz) direction, velocity vel and rotWing wing angle.
   this.cx = 0.0;
   this.cy = 0.0;
   this.cz = 0.0;
   this.vel = 1.0;
   this.width = 4.0;
   this.height = 4.0;
   this.depth = 4.0;
   this.color = vec4(51/255, 102/255, 0.0/255, 1.0); // green color
   this.setup(descr);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);
}

Frog.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};

Frog.prototype.KEY_UP = 38;
Frog.prototype.KEY_DOWN = 40;
Frog.prototype.KEY_LEFT   = 37;
Frog.prototype.KEY_RIGHT  = 39;//'D'.charCodeAt(0);


// -------
// GENERAL
// -------

Frog.prototype.getPos = function() {
    return {posX: this.cx, posY: this.cz};
}

Frog.prototype.getSize = function(){
	return {sizeX: this.width, sizeY: this.depth};
}

Frog.prototype.getSpatialID = function() {
    return this.spatialID;
}


// ---------------
// COLLISION LOGIC
// ---------------

Frog.prototype.updateLocation = function(du) {
    // r = vt * r_0
    if (keys[this.KEY_LEFT]) {
        this.cx -= this.vel*du;
    }
    if (keys[this.KEY_RIGHT]) {
        this.cx += this.vel*du;
    }
    // Eat key for jumping over lanes because
    // we don't want the frog jumping multiple
    // lanes even though key is held down.
    if (eatKey[this.KEY_UP]) {
        this.cz += laneDepth;
    }
    if (eatKey[this.KEY_DOWN]) {
        this.cz -= laneDepth;
    }
}

// -------------
// UPDATE RENDER
// -------------
Frog.prototype.update = function(du) { 
    spatialManager.unregister(this);
    this.updateLocation(du);
    spatialManager.register(this);


    this.updateMV();    
}

Frog.prototype.updateMV = function()  {
  // lookAt(eye, at, up)
  mv = lookAt( vec3(this.cx, this.cy+1.5, this.cz-2.0), vec3(this.cx, this.cy, this.cz+2.0), vec3(0.0, 1.0, 0.0));
    
}

var xzAngle;
Frog.prototype.render = function() {
	//console.log("Rendering frog");

    // TRANSLATE - ROTATE - SCALE in the coordinate system:
    // Translate to position
    var mvFrog = mult( mv, translate(this.cx, this.cy, this.cz));
    mvFrog = mult(mvFrog, scalem(this.width*scaleConst, this.height*scaleConst, this.depth*scaleConst));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFrog));
    gl.uniform4fv(colLoc, flatten(this.color));
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}

