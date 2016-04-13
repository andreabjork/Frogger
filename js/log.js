// -------------
// LOG PROTOTYPE
// -------------

function Log(descr) {
   this.lane = 1;   
   this.cx = 0.0;
   this.cy = -3.0;
   this.cz = 0.0;
   this.vel = 0.4;
   this.width = 10.0;
   this.height = 2.0;
   this.depth = 3.0;
   this.colorAndShading();
   this.setup(descr);
   this.moveToLane(this.lane);

   // Register to spatial Manager
   this.spatialID = spatialManager.getNewSpatialID();
   spatialManager.register(this);

   this.plyScaleX = 0.4; // breiddin
   this.plyScaleY = 2.2; // lengdin
   this.plyScaleZ = 1.4; // dýptin
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

Log.prototype.colorAndShading = function() {
    var materialAmbient = vec4( 64/255, 32/255, 6/255, 1.0 );
    var materialDiffuse = vec4( 94/255, 46/255, 7/255, 1.0 );
    var materialSpecular = vec4( 173/255, 91/255, 24/255, 1.0 );
    this.ambientProduct = mult(lightAmbient, materialAmbient);
    this.diffuseProduct = mult(lightDiffuse, materialDiffuse);
    this.specularProduct = mult(lightSpecular, materialSpecular);

}
// ---------------
// COLLISION LOGIC
// ---------------

Log.prototype.outOfBounds = function(valX) {
    var leftLogEdge = this.cx+this.width/2;
    var rightLogEdge = this.cx-this.width/2;
    var leftWorldEdge = worldWidth/2;
    var rightWorldEdge = -worldWidth/2;

    // Remember x-axis goes from right to left, not left to right!
    return (rightLogEdge > leftWorldEdge || leftLogEdge < rightWorldEdge);
    //return 
}

// -------------
// UPDATE RENDER
// -------------

Log.prototype.update = function(du) {
  spatialManager.unregister(this);

  // move to:
  var newX = this.cx + (this.vel>0?this.vel+(difficulty*speedIncr):this.vel-(difficulty*speedIncr))*du;

  // check for death:
  if(this.outOfBounds(newX)) return KILL_ME_NOW;

  // update coordinates 
  this.cx = newX;
  spatialManager.register(this);
}


Log.prototype.render = function() {

    gl.uniform4fv(ambLoc , flatten(this.ambientProduct) );
    gl.uniform4fv( diffLoc, flatten(this.diffuseProduct) );
    gl.uniform4fv( specLoc, flatten(this.specularProduct) );

    gl.bindBuffer( gl.ARRAY_BUFFER, nBufferLOG);
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);


    gl.bindBuffer( gl.ARRAY_BUFFER, vBufferLOG );
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    

    var mvLog = mult( mv, translate(this.cx*scaleConst, this.cy*scaleConst, this.cz*scaleConst));
    mvLog = mult(mvLog, rotateX(-90));
    // Turn front to left or right depending on velocity 
    if(this.vel > 0) 
      mvLog = mult(mvLog, rotateZ(-90)); 
    else 
      mvLog = mult(mvLog, rotateZ(90)); 

    mvLog = mult(mvLog, scalem(this.width*this.plyScaleX*scaleConst, this.height*this.plyScaleY*scaleConst, this.depth*this.plyScaleZ*scaleConst));
   
    normalMatrix = [
        vec3(mvLog[0][0], mvLog[0][1], mvLog[0][2]),
        vec3(mvLog[1][0], mvLog[1][1], mvLog[1][2]),
        vec3(mvLog[2][0], mvLog[2][1], mvLog[2][2])
    ];

    
     //console.log("Rendering frog");


    gl.uniformMatrix4fv(mvLoc, false, flatten(mvLog));
    gl.uniformMatrix3fv(normLoc, false, flatten(normalMatrix) );
    gl.drawArrays( gl.TRIANGLES, 0, verticesLOG.length );

}
