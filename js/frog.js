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
   this.init();
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

Frog.prototype.init = function(){
   this.cx = 0.0;
   this.cy = 0.0;
   this.cz = 0.0;
   this.lane = 0;
   this.vel = 0.4;
   this.width = 4.0;
   this.height = 4.0;
   this.depth = 4.0;
   this.color = vec4(51/255, 102/255, 0.0/255, 1.0); // green color
}

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

Frog.prototype.die = function(){
	this.init();
}


// ---------------
// COLLISION LOGIC
// ---------------

Frog.prototype.updateLocation = function(du) {
    // r = vt * r_0
	//(if(this.onLog) this.
	
	var newX = this.cx;
	if(this.onLog){
		console.log("moving with the log by "+(this.log.vel));
		newX += this.log.vel*du;
	}
    if (keys[this.KEY_LEFT]) {
        newX += this.vel*du;
    }
    if (keys[this.KEY_RIGHT]) {
        newX -= this.vel*du;
    }
	
    if(this.outOfBounds(newX).right && newX<this.cx) return;
	if(this.outOfBounds(newX).left && newX>this.cx) return;
	this.cx = newX;
	
    // Eat key for jumping over lanes because
    // we don't want the frog jumping multiple
    // lanes even though key is held down.
    if (eatKey(this.KEY_UP)) {
        if(this.outOfBounds(this.cz+laneDepth).top) return;
        this.cz += laneDepth+laneSpacing;
		this.lane +=1;
    }
    if (eatKey(this.KEY_DOWN)) {
        if(this.outOfBounds(this.cz-laneDepth).bottom) return;
        this.cz -= laneDepth+laneSpacing;
		this.lane -=1;
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
	this.onLog = false;
	for(var i=0; i<colEnts.length; i++){
		var entity = colEnts[i];
		if(entity instanceof Car){
			//Become frog-shaped pancake!
			console.log("Hit by a car!");
			this.die();
		}
		if(entity instanceof Log){
			this.onLog = true;
			//console.log("Standing on a log!");
			this.log = entity;
		}
	}
	
	var inWaterLane = this.lane > numCarLanes+1 && this.lane < numCarLanes+numLogLanes+2;
	
	// Fall in water!
	if(!this.onLog && inWaterLane){
		console.log("Drowning!");
		this.die();
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
	//console.log("Rendering frog");

    // TRANSLATE - ROTATE - SCALE in the coordinate system:
    // Translate to position
    var mvFrog = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    mvFrog = mult(mvFrog, scalem(this.width*scaleConst, this.height*scaleConst, this.depth*scaleConst));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvFrog));
    gl.uniform4fv(colLoc, flatten(this.color));
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}

