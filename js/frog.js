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
   this.vel = 1.0;
   this.width = 4.0;
   this.height = 4.0;
   this.color = vec4(51/255, 102/255, 0/255, 1.0); // green color
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



// -------
// GENERAL
// -------

Frog.prototype.getPos = function() {
    return {posX: this.cx, posY: this.cy};
}

Frog.prototype.getSpatialID = function() {
    return this.spatialID;
}


// ---------------
// COLLISION LOGIC
// ---------------


// -------------
// UPDATE RENDER
// -------------
Frog.prototype.update = function(du) { 
    spatialManager.unregister(this);

    spatialManager.register(this);



    var currDir = vec3(this.rx, this.ry, this.rz);
    var newDir = flockAlgorithm.updateDirection(this);
    var a = angle(currDir, newDir);
    if(a > 15) newDir = normalize(add(currDir, scale(0.01, newDir)));

    this.rx = newDir[0];
    this.ry = newDir[1];
    this.rz = newDir[2];

    this.cx += this.rx*this.vel;
    this.cy += this.ry*this.vel;
    this.cz += this.rz*this.vel;

    this.updateMV();    
}

Frog.prototype.updateMV = function()  {
    mv = lookAt( vec3(0.0, 1.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
}

var xzAngle;
Frog.prototype.render = function() {
    // lookAt(eye, at, up)

    // TRANSLATE - ROTATE - SCALE in the coordinate system:
    // Translate to position
    var mvFrog = mult( mv, translate(this.cx, this.cy, this.cz));
    mvFrog = mult(mvFrog, scalem(0.1, 0.1, 0.1));

    gl.uniformMatrix4fv(colLoc, false, flatten(this.color));
    gl.drawElements(gl.TRIANGLES, NumVertices, gl.UNSIGNED_BYTE, 0);
}

