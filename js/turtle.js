// ----------------
// TURTLE PROTOTYPE
// ----------------

function Turtle(descr) {
   console.log("Turtle!");
   this.lane = 1;   
   this.cx = 0.0;
   this.cy = -3.0;
   this.diveThreshold = -5.0;
   this.maxDive = -6.0;
   this.diving = false;
   this.diveCD = 0;
   this.diceMaxCD = 60;
   this.cz = 0.0;
   this.vel = 0.4;
   this.subVel = 0.01;
   this.width = 3.0;
   this.height = 2.0;
   this.depth = 3.0;
   this.color = vec4(130/255, 156/255, 65/255, 1.0); // yellowish brown color
   this.setup(descr);
   this.startCy = this.cy;
   this.moveToLane(this.lane);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);
}

Turtle.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};


// -------
// GENERAL
// -------

Turtle.prototype.moveToLane = function(lane) {
   if(this.vel > 0) this.cx = -worldWidth/2 + this.width/2 + 1;
   else this.cx = worldWidth/2 - this.width/2 - 1;
   this.cz = laneDepth*lane + laneSpacing*lane;
}

Turtle.prototype.getPos = function() {
    return {posX: this.cx, posY: this.cz};
}

Turtle.prototype.getSize = function(){
  return {sizeX: this.width, sizeY: this.depth};
}

Turtle.prototype.getSpatialID = function() {
    return this.spatialID;
}

Turtle.prototype.getLane = function() {
  return this.lane;
}

// ---------------
// COLLISION LOGIC
// ---------------

Turtle.prototype.outOfBounds = function(valX) {
    var leftTurtleEdge = this.cx+this.width/2;
    var rightTurtleEdge = this.cx-this.width/2;
    var leftWorldEdge = worldWidth/2;
    var rightWorldEdge = -worldWidth/2;

    // Remember x-axis goes from right to left, not left to right!
    return (rightTurtleEdge > leftWorldEdge || leftTurtleEdge < rightWorldEdge);
    //return 
}

// -------------
// UPDATE RENDER
// -------------

Turtle.prototype.update = function(du) {
	spatialManager.unregister(this);

	// move to:
	var newX = this.cx + (this.vel>0?this.vel+(difficulty*speedIncr):this.vel-(difficulty*speedIncr))*du;
	
	// Maybe dive?
	if(this.diveCD>0) this.diveCD -= du;
	else if(!this.diving && randomInt(1,100) > 99) this.diving = true;
	
	if(this.diving){
		if(this.rising){
			this.cy = this.cy+this.subVel*du;
			if(this.cy > this.startCy){
				this.cy = this.startCy;
				this.rising = false;
				this.diving = false;
			}
		}
		else{
			this.cy = this.cy-this.subVel*du;
			if(this.cy < this.maxDive){
				this.cy = this.maxDive;
				this.rising = true;
			}
		}
	}
	
	// check for death:
	if(this.outOfBounds(newX)) return KILL_ME_NOW;

	// update coordinates 
	this.cx = newX;
	if(this.cy>this.diveThreshold)spatialManager.register(this);
}


Turtle.prototype.render = function() {
    var materialAmbient = vec4( 0.2, 0.0, 0.2, 1.0 );
	var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
	var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambLoc , flatten(ambientProduct) );
    gl.uniform4fv( diffLoc, flatten(diffuseProduct) );
    gl.uniform4fv( specLoc, flatten(specularProduct) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferLOG);
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);


    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferLOG );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    
    var mvLog = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    mvLog = mult(mvLog, scalem(this.width*scaleConst, this.height*scaleConst, this.depth*scaleConst));
     //console.log("Rendering frog");
    normalMatrix = [
        vec3(mvLog[0][0], mvLog[0][1], mvLog[0][2]),
        vec3(mvLog[1][0], mvLog[1][1], mvLog[1][2]),
        vec3(mvLog[2][0], mvLog[2][1], mvLog[2][2])
    ];

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvLog));
    gl.uniformMatrix3fv(normLoc, false, flatten(normalMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, verticesLOG.length );
}