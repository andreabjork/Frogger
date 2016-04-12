// -------------
// LOG PROTOTYPE
// -------------

function Log(descr) {
   this.lane = 1;   
   this.cx = 0.0;
   this.cy = -3.0;
   this.cz = 0.0;
   this.vel = 0.4;
   this.width = 8.0;
   this.height = 2.0;
   this.depth = 3.0;
   this.color = vec4(102/255, 51/255, 0.0/255, 1.0); // brown color
   this.setup(descr);
   this.moveToLane(this.lane);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);
}

Log.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};


// -------
// GENERAL
// -------

Log.prototype.moveToLane = function(lane) {
   if(this.vel > 0) this.cx = -worldWidth/2 + this.width/2 + 1;
   else this.cx = worldWidth/2 - this.width/2 - 1;
   this.cz = laneDepth*lane + laneSpacing*lane;
}

Log.prototype.getPos = function() {
    return {posX: this.cx, posY: this.cz};
}

Log.prototype.getSize = function(){
  return {sizeX: this.width, sizeY: this.depth};
}

Log.prototype.getSpatialID = function() {
    return this.spatialID;
}

Log.prototype.getLane = function() {
  return this.lane;
}

// ---------------
// COLLISION LOGIC
// ---------------

Log.prototype.outOfBounds = function(valX) {
    var leftFrogEdge = this.cx+this.width/2;
    var rightFrogEdge = this.cx-this.width/2;
    var leftWorldEdge = worldWidth/2;
    var rightWorldEdge = -worldWidth/2;

    // Remember x-axis goes from right to left, not left to right!
    return (leftFrogEdge > leftWorldEdge || rightFrogEdge < rightWorldEdge);
    //return 
}

// -------------
// UPDATE RENDER
// -------------

Log.prototype.update = function(du) {
	spatialManager.unregister(this);

  // move to:
  var newX = this.cx + this.vel*du;

  // check for death:
  if(this.outOfBounds(newX)) return KILL_ME_NOW;

  // update coordinates 
  this.cx = newX;
	spatialManager.register(this);
}


Log.prototype.render = function() {
    var mvLog = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    mvLog = mult(mvLog, scalem(this.width*scaleConst, this.height*scaleConst, this.depth*scaleConst));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvLog));
    gl.uniform4fv(colLoc, flatten(this.color));
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}