// -------------
// CAR PROTOTYPE
// -------------

function Car(descr) {
   this.lane = 1;    
   this.cx = 0.0;
   this.cy = 1.0;
   this.cz = 0.0;
   this.vel = 0.4;
   this.width = 10.0;
   this.height = 5.0;
   this.depth = 3.0;
   this.setup(descr);
   this.moveToLane(this.lane);

   this.colorAndShading(this.randColor);
   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);


   this.plyScaleX = 0.2;
   this.plyScaleY = 0.6;
   this.plyScaleZ = 0.6;
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

Car.prototype.colorAndShading = function(randColor) {
    var materialAmbient, materialDiffuse, materialSpecular;
    if(randColor == 1) { // blue
      materialAmbient = vec4( 7/255, 10/255, 145/255, 1.0 );
      materialDiffuse = vec4( 70/255, 72/255, 184/255, 1.0 );
      materialSpecular = vec4( 150/255, 152/255, 242/255, 1.0 );
    } else if(randColor == 2) { // red
      materialAmbient = vec4( 143/255, 17/255, 0/255, 1.0 );
      materialDiffuse = vec4( 199/255, 44/255, 24/255, 1.0 );
      materialSpecular = vec4( 235/255, 151/255, 91/255, 1.0 );
    } else if(randColor == 3) { // purple
      materialAmbient = vec4( 102/255, 0/255, 204/255, 1.0 );
      materialDiffuse = vec4( 153/255, 51/255, 255/255, 1.0 );
      materialSpecular = vec4( 191/255, 128/255, 255/255, 1.0 );
    }

    this.ambientProduct = mult(lightAmbient, materialAmbient);
    this.diffuseProduct = mult(lightDiffuse, materialDiffuse);
    this.specularProduct = mult(lightSpecular, materialSpecular);

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
  var newX = this.cx + (this.vel>0?this.vel+(difficulty*speedIncr):this.vel-(difficulty*speedIncr))*du;

  // check for death:
  if(this.outOfBounds(newX)) return KILL_ME_NOW;

  // update coordinates 
  this.cx = newX;
  spatialManager.register(this);
}


Car.prototype.render = function() {
    gl.uniform4fv(ambLoc , flatten(this.ambientProduct) );
    gl.uniform4fv( diffLoc, flatten(this.diffuseProduct) );
    gl.uniform4fv( specLoc, flatten(this.specularProduct) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferCAR);
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);


    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferCAR );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    


    var mvCar = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    if(this.vel > 0) 
      mvCar = mult(mvCar, rotateY(180));

    mvCar = mult(mvCar, scalem(this.width*this.plyScaleX*scaleConst, this.height*this.plyScaleY*scaleConst, this.depth*this.plyScaleZ*scaleConst));
    
    //console.log("Rendering frog");
    normalMatrix = [
        vec3(mvCar[0][0], mvCar[0][1], mvCar[0][2]),
        vec3(mvCar[1][0], mvCar[1][1], mvCar[1][2]),
        vec3(mvCar[2][0], mvCar[2][1], mvCar[2][2])
    ];

    gl.uniformMatrix4fv(mvLoc, false, flatten(mvCar));
    gl.uniformMatrix3fv(normLoc, false, flatten(normalMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, verticesCAR.length );
}