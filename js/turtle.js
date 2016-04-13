// ----------------
// TURTLE PROTOTYPE
// ----------------

function Turtle(descr) {
   console.log("Turtle!");
   this.lane = 1;   
   this.cx = 0.0;
   this.cy = -2.8;
   this.diveThreshold = -4.15;
   this.maxDive = -4.5;
   this.diving = false;
   this.diveCD = 0;
   this.diceMaxCD = 60;
   this.cz = 0.0;
   this.vel = 0.4;
   this.subVel = 0.01;
   this.width = 7.0;
   this.height = 2.0;
   this.depth = 3.0;
   this.colorAndShading();
   this.setup(descr);
   this.startCy = this.cy;
   this.moveToLane(this.lane);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);


   this.plyScaleX = 0.5; // width
   this.plyScaleY = 1.0; // depth
   this.plyScaleZ = 1.5; // height
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


Turtle.prototype.colorAndShading = function() {
    var materialAmbient = vec4( 59/255, 59/255, 17/255, 1.0 );
    var materialDiffuse = vec4( 158/255, 158/255, 46/255, 1.0 );
    var materialSpecular = vec4( 134/255, 179/255, 0/255, 1.0 );
    this.ambientProduct = mult(lightAmbient, materialAmbient);
    this.diffuseProduct = mult(lightDiffuse, materialDiffuse);
    this.specularProduct = mult(lightSpecular, materialSpecular);

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

    gl.uniform4fv(ambLoc , flatten(this.ambientProduct) );
    gl.uniform4fv( diffLoc, flatten(this.diffuseProduct) );
    gl.uniform4fv( specLoc, flatten(this.specularProduct) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferTURTLE);
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);


    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferTURTLE );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    
    var mvTurtle = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
	  mvTurtle = mult(mvTurtle, rotateX(180));
    

     
    normalMatrix = [
        vec3(mvTurtle[0][0], mvTurtle[0][1], mvTurtle[0][2]),
        vec3(mvTurtle[1][0], mvTurtle[1][1], mvTurtle[1][2]),
        vec3(mvTurtle[2][0], mvTurtle[2][1], mvTurtle[2][2])
    ];
    //mvTurtle = mult(mvTurtle, rotateZteX(90));
    // Turn front to left or right depending on velocity 
    mvTurtle = mult(mvTurtle, rotateX(-90));
    if(this.vel < 0) 
      mvTurtle = mult(mvTurtle, rotateZ(180));



    mvTurtle = mult(mvTurtle, scalem(this.width*this.plyScaleX*scaleConst, this.height*this.plyScaleY*scaleConst, this.depth*this.plyScaleZ*scaleConst));
	
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvTurtle));
    gl.uniformMatrix3fv(normLoc, false, flatten(normalMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, verticesTURTLE.length );
}