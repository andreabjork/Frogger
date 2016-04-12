// -------------
// CAR PROTOTYPE
// -------------

function Car(descr) {
   this.lane = 1;   
   this.cx = 0.0;
   this.cy = 0.0;
   this.cz = 0.0;
   this.vel = 0.4;
   this.width = 6.0;
   this.height = 5.0;
   this.depth = 3.0;
   this.color = vec4(222/255, 72/255, 31/255, 1.0); // brown color
   this.setup(descr);
   this.moveToLane(this.lane);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);
}

Car.prototype.setup = function (descr) {
    // Apply all setup properies from the (optional) descriptor
    for (var property in descr) {
        this[property] = descr[property];
    }
};


// -------
// GENERAL
// -------

Car.prototype.moveToLane = function(lane) {
   if(this.vel > 0) this.cx = -worldWidth/2 + this.width/2 + 1;
   else this.cx = worldWidth/2 - this.width/2 - 1;
   this.cz = laneDepth*lane + laneSpacing*lane;
}

Car.prototype.getPos = function() {
    return {posX: this.cx, posY: this.cz};
}

Car.prototype.getSize = function(){
  return {sizeX: this.width, sizeY: this.depth};
}

Car.prototype.getSpatialID = function() {
    return this.spatialID;
}


Car.prototype.getLane = function() {
  return this.lane;
}


// ---------------
// COLLISION LOGIC
// ---------------

Car.prototype.outOfBounds = function(valX) {
    var leftCarEdge = this.cx+this.width/2;
    var rightCarEdge = this.cx-this.width/2;
    var leftWorldEdge = worldWidth/2;
    var rightWorldEdge = -worldWidth/2;

    // Remember x-axis goes from right to left, not left to right!
    return (rightCarEdge > leftWorldEdge || leftCarEdge < rightWorldEdge);
    //return 
}

// -------------
// UPDATE RENDER
// -------------

Car.prototype.update = function(du) {
  spatialManager.unregister(this);

  // move to:
  var newX = this.cx + this.vel*du;

  // check for death:
  if(this.outOfBounds(newX)) return KILL_ME_NOW;

  // update coordinates 
  this.cx = newX;
  spatialManager.register(this);
}


Car.prototype.render = function() {

    var mvCar = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    mvCar = mult(mvCar, scalem(this.width*scaleConst, this.height*scaleConst, this.depth*scaleConst));
    gl.uniformMatrix4fv(mvLoc, false, flatten(mvCar));
    gl.uniform4fv(colLoc, flatten(this.color));
    gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0);
}