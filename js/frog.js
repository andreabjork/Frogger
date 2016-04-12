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
   this.vel = 0.4;
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
    if (keys[this.KEY_LEFT] && (this.cx+this.width/2) < worldWidth/2) {
        var newX = this.cx + this.vel*du;
        if(this.outOfBounds(newX).left) return;
        this.cx = newX;
    }
    if (keys[this.KEY_RIGHT] && (this.cx+this.width/2) < worldWidth) {
        var newX = this.cx - this.vel*du;
        if(this.outOfBounds(newX).right) return;
        this.cx = newX;
    }
    // Eat key for jumping over lanes because
    // we don't want the frog jumping multiple
    // lanes even though key is held down.
    if (eatKey(this.KEY_UP)) {
        if(this.outOfBounds(this.cz+laneDepth).top) return;
        this.cz += laneDepth+laneSpacing;
    }
    if (eatKey(this.KEY_DOWN)) {
        if(this.outOfBounds(this.cz-laneDepth).bottom) return;
        this.cz -= laneDepth+laneSpacing;
    }
}


Frog.prototype.outOfBounds = function(valX) {
    var backFrogEdge = this.cz-this.width/2;
    var frontFrogEdge = this.cz+this.width/2;
    var leftFrogEdge = this.cx+this.width/2;
    var rightFrogEdge = this.cx-this.width/2;
    var leftWorldEdge = worldWidth/2;
    var rightWorldEdge = -worldWidth/2;

    // Remember x-axis goes from right to left, not left to right!
    return {left: leftFrogEdge > leftWorldEdge, right: rightFrogEdge < rightWorldEdge, bottom: backFrogEdge < 0.0, top: frontFrogEdge > laneDepth*(numLogLanes+numCarLanes+3)};
}
// -------------
// UPDATE RENDER
// -------------
Frog.prototype.update = function(du) { 
    spatialManager.unregister(this);
    this.updateLocation(du);
	var colEnts = spatialManager.findEntitiesInRange(this);
	for(var i=0; i<colEnts.length; i++){
		var entity = colEnts[i];
		if(entity instanceof Car) console.log("Hit by a car!");
		if(entity instanceof Log) console.log("Standing on a log!");
	}
    spatialManager.register(this);

    this.updateMV();    
}

Frog.prototype.updateMV = function()  {
  // lookAt(eye, at, up)
  mv = lookAt( vec3(this.cx*scaleConst, this.cy*scaleConst+1.5, this.cz*scaleConst+zView), // eye
               vec3(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst+2.0),  // at
               vec3(0.0, 1.0, 0.0)); // up
    
}

var xzAngle;
Frog.prototype.render = function() {
    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferFROG);
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);


    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferFROG );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    
    var mvFrog = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    mvFrog = mult(mvFrog, scalem(this.width*scaleConst, this.height*scaleConst, this.depth*scaleConst));
  
   
	    //console.log("Rendering frog");
    normalMatrix = [
        vec3(mvFrog[0][0], mvFrog[0][1], mvFrog[0][2]),
        vec3(mvFrog[1][0], mvFrog[1][1], mvFrog[1][2]),
        vec3(mvFrog[2][0], mvFrog[2][1], mvFrog[2][2])
    ];



    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFrog) );
    gl.uniformMatrix3fv(normLoc, false, flatten(normalMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, verticesFROG.length );
    // TRANSLATE - ROTATE - SCALE in the coordinate system:
    // Translate to position
    //gl.uniformMatrix4fv(mvLoc, false, flatten(mvFrog));
    //gl.uniform4fv(colLoc, flatten(this.color));
    //gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}

