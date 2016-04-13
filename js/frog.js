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
   this.vel = 0.4;
   this.width = 1.0;
   this.height = 2.0;
   this.depth = 0.8;
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
		newX += (this.log.vel>0?this.log.vel+(difficulty*speedIncr):this.log.vel-(difficulty*speedIncr))*du;
	}
    if (keys[this.KEY_LEFT]) {
        newX += this.vel*du;
    }
    if (keys[this.KEY_RIGHT]) {
        newX -= this.vel*du;
    }
	
    if(!(this.outOfBounds(newX).right && newX<this.cx) &&
	   !(this.outOfBounds(newX).left && newX>this.cx)) this.cx = newX;
	
    // Eat key for jumping over lanes because
    // we don't want the frog jumping multiple
    // lanes even though key is held down.
    if (eatKey(this.KEY_UP)) {
        if(this.outOfBounds(this.cz+laneDepth).top){
			difficulty++;
			this.die();
			return;
		}
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
			this.die();
		}
		if(entity instanceof Log || entity instanceof Turtle){
			this.onLog = true;
			this.log = entity;
		}
	}
	
	var inWaterLane = this.lane > numCarLanes+1 && this.lane < numCarLanes+numLogLanes+2;
	
	// Fall in water!
	if(!this.onLog && inWaterLane){
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

